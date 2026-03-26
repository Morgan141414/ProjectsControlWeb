"""Personal support routes – available to ANY authenticated user (no org required)."""

from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, selectinload

from app.core.deps import get_current_user, get_db
from app.core.time import utc_now_naive
from app.models.support import SupportMessage, SupportMessageAttachment, SupportThread
from app.models.user import User
from app.schemas.support import (
    SupportMessageAttachmentResponse,
    SupportMessageResponse,
    SupportStatsResponse,
    SupportThreadResponse,
    SupportThreadStatusUpdate,
)
from app.utils.ids import new_id

router = APIRouter(prefix="/support", tags=["personal-support"])

MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024
PERSONAL_ORG_LABEL = "__personal__"


def _attachment_root() -> Path:
    return (Path(__file__).resolve().parents[3] / "data" / "support_uploads").resolve()


def _base_query(db: Session):
    return db.query(SupportThread).options(
        selectinload(SupportThread.messages)
        .selectinload(SupportMessage.author),
        selectinload(SupportThread.messages)
        .selectinload(SupportMessage.attachments),
        selectinload(SupportThread.requester),
    )


def _personal_filter(query, user: User):
    """Filter threads: personal = org_id IS NULL, owned by user."""
    return query.filter(
        SupportThread.org_id.is_(None),
        SupportThread.requester_id == user.id,
    )


def _get_thread(db: Session, thread_id: str, user: User) -> SupportThread:
    thread = (
        _base_query(db)
        .filter(SupportThread.id == thread_id, SupportThread.org_id.is_(None))
        .first()
    )
    if not thread:
        raise HTTPException(status_code=404, detail="Support chat not found")
    # Only the requester (or superadmin in the future) can see their own threads
    if thread.requester_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return thread


def _attachment_url(attachment_id: str) -> str:
    return f"/api/v1/support/attachments/{attachment_id}"


def _serialize_attachment(att: SupportMessageAttachment) -> SupportMessageAttachmentResponse:
    return SupportMessageAttachmentResponse(
        id=att.id,
        file_name=att.file_name,
        content_type=att.content_type,
        size_bytes=att.size_bytes,
        url=_attachment_url(att.id),
    )


def _serialize_message(msg: SupportMessage) -> SupportMessageResponse:
    return SupportMessageResponse(
        id=msg.id,
        thread_id=msg.thread_id,
        author_id=msg.author_id,
        author_name=msg.author.full_name if msg.author else "Unknown",
        author_role="member",
        body=msg.body,
        created_at=msg.created_at,
        attachments=[_serialize_attachment(a) for a in msg.attachments],
    )


def _count_unread(thread: SupportThread) -> int:
    cutoff = thread.requester_last_read_at
    if cutoff is None:
        return len(thread.messages)
    return sum(1 for m in thread.messages if m.created_at > cutoff)


def _serialize_thread(thread: SupportThread) -> SupportThreadResponse:
    messages = [_serialize_message(m) for m in thread.messages]
    last_preview = None
    if thread.messages:
        last = thread.messages[-1]
        last_preview = last.body[:120] if last.body.strip() else (
            f"{len(last.attachments)} image(s)" if last.attachments else None
        )
    return SupportThreadResponse(
        id=thread.id,
        org_id=thread.org_id or "",
        requester_id=thread.requester_id,
        requester_name=thread.requester.full_name if thread.requester else "Unknown",
        requester_role="member",
        subject=thread.subject,
        status=thread.status,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
        last_message_preview=last_preview,
        unread_count=_count_unread(thread),
        messages=messages,
    )


def _validate_body(body: str | None, files: list[UploadFile]) -> str:
    normalized = (body or "").strip()
    if not normalized and not files:
        raise HTTPException(400, detail="Message must contain text or at least one image")
    if len(normalized) > 4000:
        raise HTTPException(400, detail="Message is too long")
    return normalized


def _save_attachments(thread_id: str, message_id: str, files: list[UploadFile]) -> list[SupportMessageAttachment]:
    saved: list[SupportMessageAttachment] = []
    root = _attachment_root() / "_personal" / thread_id
    root.mkdir(parents=True, exist_ok=True)

    for f in files:
        if not f.filename:
            continue
        ct = f.content_type or "application/octet-stream"
        if not ct.startswith("image/"):
            raise HTTPException(400, detail="Only image attachments are supported")

        data = f.file.read()
        if not data:
            continue
        if len(data) > MAX_ATTACHMENT_BYTES:
            raise HTTPException(413, detail="Image exceeds 10 MB limit")

        aid = new_id()
        suffix = Path(f.filename).suffix.lower()
        if not suffix or len(suffix) > 10:
            suffix = ".bin"
        target = root / f"{aid}{suffix}"
        target.write_bytes(data)

        saved.append(SupportMessageAttachment(
            id=aid,
            message_id=message_id,
            file_name=f.filename,
            file_path=str(target),
            content_type=ct,
            size_bytes=len(data),
        ))
    return saved


# ── Endpoints ──


@router.get("/threads", response_model=list[SupportThreadResponse])
def list_personal_threads(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = _personal_filter(_base_query(db), current_user).order_by(SupportThread.updated_at.desc())
    return [_serialize_thread(t) for t in query.all()]


@router.post("/threads", response_model=SupportThreadResponse, status_code=201)
def create_personal_thread(
    subject: str = Form(...),
    body: str = Form(""),
    files: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    subj = subject.strip()
    if len(subj) < 2 or len(subj) > 255:
        raise HTTPException(400, detail="Subject must be 2–255 characters")

    normalized_body = _validate_body(body, files)
    now = utc_now_naive()

    thread = SupportThread(
        org_id=None,
        requester_id=current_user.id,
        subject=subj,
        status="open",
        created_at=now,
        updated_at=now,
        requester_last_read_at=now,
    )
    db.add(thread)
    db.flush()

    message = SupportMessage(
        thread_id=thread.id,
        author_id=current_user.id,
        body=normalized_body,
        created_at=now,
    )
    db.add(message)
    db.flush()

    for att in _save_attachments(thread.id, message.id, files):
        db.add(att)

    db.commit()
    thread = _get_thread(db, thread.id, current_user)
    return _serialize_thread(thread)


@router.get("/threads/{thread_id}", response_model=SupportThreadResponse)
def get_personal_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thread = _get_thread(db, thread_id, current_user)
    now = utc_now_naive()
    thread.requester_last_read_at = now
    db.commit()
    return _serialize_thread(thread)


@router.post("/threads/{thread_id}/messages", response_model=SupportMessageResponse)
def send_personal_message(
    thread_id: str,
    body: str = Form(""),
    files: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thread = _get_thread(db, thread_id, current_user)
    if thread.status == "closed":
        raise HTTPException(400, detail="Chat is closed")

    normalized_body = _validate_body(body, files)
    now = utc_now_naive()
    message = SupportMessage(
        thread_id=thread.id,
        author_id=current_user.id,
        body=normalized_body,
        created_at=now,
    )
    db.add(message)
    db.flush()

    for att in _save_attachments(thread.id, message.id, files):
        db.add(att)

    thread.updated_at = now
    thread.status = "open"
    db.commit()

    message = (
        db.query(SupportMessage)
        .options(
            selectinload(SupportMessage.author),
            selectinload(SupportMessage.attachments),
        )
        .filter(SupportMessage.id == message.id)
        .first()
    )
    return _serialize_message(message)


@router.delete("/threads/{thread_id}", status_code=204)
def delete_personal_thread(
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    thread = _get_thread(db, thread_id, current_user)

    import shutil
    attach_dir = _attachment_root() / "_personal" / thread_id
    if attach_dir.exists():
        shutil.rmtree(attach_dir, ignore_errors=True)

    for msg in thread.messages:
        for att in msg.attachments:
            db.delete(att)
        db.delete(msg)
    db.delete(thread)
    db.commit()


@router.get("/attachments/{attachment_id}")
def get_personal_attachment(
    attachment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    attachment = (
        db.query(SupportMessageAttachment)
        .join(SupportMessage, SupportMessage.id == SupportMessageAttachment.message_id)
        .join(SupportThread, SupportThread.id == SupportMessage.thread_id)
        .filter(
            SupportMessageAttachment.id == attachment_id,
            SupportThread.org_id.is_(None),
            SupportThread.requester_id == current_user.id,
        )
        .first()
    )
    if not attachment:
        raise HTTPException(404, detail="Attachment not found")

    path = Path(attachment.file_path)
    if not path.exists():
        raise HTTPException(404, detail="File not found")

    return FileResponse(path, media_type=attachment.content_type, filename=attachment.file_name)
