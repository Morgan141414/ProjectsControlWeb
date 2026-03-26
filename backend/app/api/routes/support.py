from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, selectinload

from app.core.deps import get_current_user, get_db, get_org_membership, ALL_STAFF_ROLES
from app.core.time import utc_now_naive
from app.models.enums import OrgRole
from app.models.org import OrgMembership
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

router = APIRouter(prefix="/orgs/{org_id}/support", tags=["support"])

REQUESTER_ROLES = {
    OrgRole.super_ceo, OrgRole.ceo, OrgRole.hr,
    OrgRole.team_lead, OrgRole.project_manager,
    OrgRole.developer, OrgRole.founder, OrgRole.member,
}
RESPONDER_ROLES = {OrgRole.superadmin, OrgRole.sysadmin}
MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024


def _attachment_root() -> Path:
    return (Path(__file__).resolve().parents[3] / "data" / "support_uploads").resolve()


def _ensure_can_open_support(membership: OrgMembership) -> None:
    if membership.role not in REQUESTER_ROLES | RESPONDER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Support is available only for employees, managers, and admins",
        )


def _ensure_can_create_thread(membership: OrgMembership) -> None:
    if membership.role not in REQUESTER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only employees and managers can create support chats",
        )


def _base_query(db: Session):
    return db.query(SupportThread).options(
        selectinload(SupportThread.messages)
        .selectinload(SupportMessage.author),
        selectinload(SupportThread.messages)
        .selectinload(SupportMessage.attachments),
        selectinload(SupportThread.requester),
    )


def _get_thread_for_user(
    db: Session,
    org_id: str,
    thread_id: str,
    current_user: User,
    membership: OrgMembership,
) -> SupportThread:
    thread = (
        _base_query(db)
        .filter(SupportThread.id == thread_id, SupportThread.org_id == org_id)
        .first()
    )
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support chat not found")
    if membership.role in REQUESTER_ROLES and thread.requester_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return thread


def _attachment_url(org_id: str, attachment_id: str) -> str:
    return f"/api/v1/orgs/{org_id}/support/attachments/{attachment_id}"


def _serialize_attachment(org_id: str, attachment: SupportMessageAttachment) -> SupportMessageAttachmentResponse:
    return SupportMessageAttachmentResponse(
        id=attachment.id,
        file_name=attachment.file_name,
        content_type=attachment.content_type,
        size_bytes=attachment.size_bytes,
        url=_attachment_url(org_id, attachment.id),
    )


def _serialize_message(message: SupportMessage, author_role: str, org_id: str) -> SupportMessageResponse:
    return SupportMessageResponse(
        id=message.id,
        thread_id=message.thread_id,
        author_id=message.author_id,
        author_name=message.author.full_name if message.author else "Unknown",
        author_role=author_role,
        body=message.body,
        created_at=message.created_at,
        attachments=[
            _serialize_attachment(org_id, attachment) for attachment in message.attachments
        ],
    )


def _preview_text(message: SupportMessage) -> str | None:
    if message.body.strip():
        return message.body[:120]
    if message.attachments:
        count = len(message.attachments)
        return f"{count} image{'s' if count != 1 else ''} attached"
    return None


def _count_unread(thread: SupportThread, viewer_is_staff: bool) -> int:
    """Count messages unread by the viewer."""
    if viewer_is_staff:
        cutoff = thread.staff_last_read_at
    else:
        cutoff = thread.requester_last_read_at
    if cutoff is None:
        return len(thread.messages)
    return sum(1 for m in thread.messages if m.created_at > cutoff)


def _serialize_thread(
    db: Session, thread: SupportThread, *, viewer_is_staff: bool = False,
) -> SupportThreadResponse:
    roles = {
        row.user_id: row.role.value
        for row in db.query(OrgMembership).filter(OrgMembership.org_id == thread.org_id).all()
    }
    requester_role = roles.get(thread.requester_id, "member")
    messages = [
        _serialize_message(message, roles.get(message.author_id, "member"), thread.org_id)
        for message in thread.messages
    ]
    last_preview = _preview_text(thread.messages[-1]) if thread.messages else None
    return SupportThreadResponse(
        id=thread.id,
        org_id=thread.org_id,
        requester_id=thread.requester_id,
        requester_name=thread.requester.full_name if thread.requester else "Unknown",
        requester_role=requester_role,
        subject=thread.subject,
        status=thread.status,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
        last_message_preview=last_preview,
        unread_count=_count_unread(thread, viewer_is_staff),
        messages=messages,
    )


def _validate_message_payload(body: str | None, files: list[UploadFile]) -> str:
    normalized = (body or "").strip()
    if not normalized and not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message must contain text or at least one image",
        )
    if len(normalized) > 4000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message is too long",
        )
    return normalized


def _save_attachments(
    org_id: str,
    thread_id: str,
    message_id: str,
    files: list[UploadFile],
) -> list[SupportMessageAttachment]:
    saved: list[SupportMessageAttachment] = []
    root = _attachment_root() / org_id / thread_id
    root.mkdir(parents=True, exist_ok=True)

    for file in files:
        if not file.filename:
            continue
        content_type = file.content_type or "application/octet-stream"
        if not content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image attachments are supported",
            )

        data = file.file.read()
        if not data:
            continue
        if len(data) > MAX_ATTACHMENT_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Image exceeds 10 MB limit",
            )

        attachment_id = new_id()
        suffix = Path(file.filename).suffix.lower()
        if not suffix or len(suffix) > 10:
            suffix = ".bin"
        target = root / f"{attachment_id}{suffix}"
        target.write_bytes(data)

        saved.append(
            SupportMessageAttachment(
                id=attachment_id,
                message_id=message_id,
                file_name=file.filename,
                file_path=str(target),
                content_type=content_type,
                size_bytes=len(data),
            )
        )

    return saved


@router.get("/threads", response_model=list[SupportThreadResponse])
def list_support_threads(
    org_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[SupportThreadResponse]:
    membership = get_org_membership(org_id, current_user, db)
    _ensure_can_open_support(membership)
    is_staff = membership.role in RESPONDER_ROLES

    query = (
        _base_query(db)
        .filter(SupportThread.org_id == org_id)
        .order_by(SupportThread.updated_at.desc())
    )
    if membership.role in REQUESTER_ROLES:
        query = query.filter(SupportThread.requester_id == current_user.id)

    return [_serialize_thread(db, thread, viewer_is_staff=is_staff) for thread in query.all()]


@router.post("/threads", response_model=SupportThreadResponse, status_code=status.HTTP_201_CREATED)
def create_support_thread(
    org_id: str,
    subject: str = Form(...),
    body: str = Form(""),
    files: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SupportThreadResponse:
    membership = get_org_membership(org_id, current_user, db)
    _ensure_can_create_thread(membership)

    normalized_subject = subject.strip()
    if len(normalized_subject) < 2 or len(normalized_subject) > 255:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject must contain from 2 to 255 characters",
        )

    normalized_body = _validate_message_payload(body, files)
    now = utc_now_naive()

    thread = SupportThread(
        org_id=org_id,
        requester_id=current_user.id,
        subject=normalized_subject,
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

    for attachment in _save_attachments(org_id, thread.id, message.id, files):
        db.add(attachment)

    db.commit()
    thread = _get_thread_for_user(db, org_id, thread.id, current_user, membership)
    return _serialize_thread(db, thread, viewer_is_staff=False)


@router.get("/threads/{thread_id}", response_model=SupportThreadResponse)
def get_support_thread(
    org_id: str,
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SupportThreadResponse:
    membership = get_org_membership(org_id, current_user, db)
    _ensure_can_open_support(membership)
    is_staff = membership.role in RESPONDER_ROLES
    thread = _get_thread_for_user(db, org_id, thread_id, current_user, membership)

    # Mark as read
    now = utc_now_naive()
    if is_staff:
        thread.staff_last_read_at = now
    else:
        thread.requester_last_read_at = now
    db.commit()

    return _serialize_thread(db, thread, viewer_is_staff=is_staff)


@router.post("/threads/{thread_id}/messages", response_model=SupportMessageResponse)
def send_support_message(
    org_id: str,
    thread_id: str,
    body: str = Form(""),
    files: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SupportMessageResponse:
    membership = get_org_membership(org_id, current_user, db)
    _ensure_can_open_support(membership)
    thread = _get_thread_for_user(db, org_id, thread_id, current_user, membership)

    if membership.role in REQUESTER_ROLES and thread.status == "closed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chat is closed",
        )
    if membership.role in REQUESTER_ROLES and thread.requester_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    normalized_body = _validate_message_payload(body, files)
    now = utc_now_naive()
    message = SupportMessage(
        thread_id=thread.id,
        author_id=current_user.id,
        body=normalized_body,
        created_at=now,
    )
    db.add(message)
    db.flush()

    for attachment in _save_attachments(org_id, thread.id, message.id, files):
        db.add(attachment)

    thread.updated_at = now
    if membership.role in RESPONDER_ROLES:
        thread.status = "answered"
    else:
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
    return _serialize_message(message, membership.role.value, org_id)


@router.patch("/threads/{thread_id}/status", response_model=SupportThreadResponse)
def update_support_thread_status(
    org_id: str,
    thread_id: str,
    payload: SupportThreadStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SupportThreadResponse:
    membership = get_org_membership(org_id, current_user, db)
    if membership.role not in RESPONDER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change support chat status",
        )

    thread = _get_thread_for_user(db, org_id, thread_id, current_user, membership)
    thread.status = payload.status
    thread.updated_at = utc_now_naive()
    db.commit()

    thread = _get_thread_for_user(db, org_id, thread_id, current_user, membership)
    return _serialize_thread(db, thread, viewer_is_staff=True)


@router.get("/stats", response_model=SupportStatsResponse)
def get_support_stats(
    org_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SupportStatsResponse:
    membership = get_org_membership(org_id, current_user, db)
    _ensure_can_open_support(membership)
    is_staff = membership.role in RESPONDER_ROLES

    query = _base_query(db).filter(SupportThread.org_id == org_id)
    if membership.role in REQUESTER_ROLES:
        query = query.filter(SupportThread.requester_id == current_user.id)

    threads = query.all()
    total_unread = sum(_count_unread(t, is_staff) for t in threads)

    return SupportStatsResponse(
        total=len(threads),
        open=sum(1 for t in threads if t.status == "open"),
        answered=sum(1 for t in threads if t.status == "answered"),
        closed=sum(1 for t in threads if t.status == "closed"),
        unread_total=total_unread,
    )


@router.delete("/threads/{thread_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_support_thread(
    org_id: str,
    thread_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    membership = get_org_membership(org_id, current_user, db)
    if membership.role not in RESPONDER_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete support chats",
        )

    thread = (
        db.query(SupportThread)
        .filter(SupportThread.id == thread_id, SupportThread.org_id == org_id)
        .first()
    )
    if not thread:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Support chat not found")

    # Delete attachment files
    import shutil
    attach_dir = _attachment_root() / org_id / thread_id
    if attach_dir.exists():
        shutil.rmtree(attach_dir, ignore_errors=True)

    # Delete messages + attachments via cascade, then thread
    for msg in thread.messages:
        for att in msg.attachments:
            db.delete(att)
        db.delete(msg)
    db.delete(thread)
    db.commit()


@router.get("/attachments/{attachment_id}")
def get_support_attachment(
    org_id: str,
    attachment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FileResponse:
    membership = get_org_membership(org_id, current_user, db)
    _ensure_can_open_support(membership)

    attachment = (
        db.query(SupportMessageAttachment)
        .join(SupportMessage, SupportMessage.id == SupportMessageAttachment.message_id)
        .join(SupportThread, SupportThread.id == SupportMessage.thread_id)
        .filter(
            SupportMessageAttachment.id == attachment_id,
            SupportThread.org_id == org_id,
        )
        .first()
    )
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")

    thread = db.get(SupportThread, attachment.message.thread_id)
    if membership.role in REQUESTER_ROLES and thread.requester_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    path = Path(attachment.file_path)
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment file not found")

    return FileResponse(path, media_type=attachment.content_type, filename=attachment.file_name)
