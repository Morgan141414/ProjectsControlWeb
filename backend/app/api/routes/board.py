import os
import uuid
from datetime import date, datetime

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.audit import log_audit
from app.core.deps import (
    ADMIN_ROLES,
    ALL_STAFF_ROLES,
    PROJECT_ROLES,
    get_current_user,
    get_db,
    get_org_membership,
    require_role,
)
from app.models.board import TaskAttachment, TaskChecklistItem, TaskColumn, TaskComment
from app.models.enums import AuditAction, OrgRole, TaskStatus
from app.models.project import Project
from app.models.task import Task
from app.models.user import User
from app.schemas.board import (
    BoardTaskCreate,
    BoardTaskResponse,
    BoardTaskUpdate,
    ProjectStats,
    TaskAttachmentResponse,
    TaskChecklistItemCreate,
    TaskChecklistItemResponse,
    TaskChecklistItemUpdate,
    TaskColumnCreate,
    TaskColumnReorder,
    TaskColumnResponse,
    TaskColumnUpdate,
    TaskCommentCreate,
    TaskCommentResponse,
    TaskCommentUpdate,
    TaskReorder,
)

router = APIRouter(tags=["board"])

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "uploads/attachments")


# ─── Helpers ───────────────────────────────────────────────

def _get_project_or_404(db: Session, org_id: str, project_id: str) -> Project:
    project = db.get(Project, project_id)
    if not project or project.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def _get_task_or_404(db: Session, org_id: str, task_id: str) -> Task:
    task = db.get(Task, task_id)
    if not task or task.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def _enrich_task(task: Task, db: Session) -> BoardTaskResponse:
    checklist = db.query(TaskChecklistItem).filter(TaskChecklistItem.task_id == task.id).all()
    comments_count = db.query(func.count(TaskComment.id)).filter(TaskComment.task_id == task.id).scalar() or 0
    return BoardTaskResponse(
        id=task.id,
        org_id=task.org_id,
        project_id=task.project_id,
        team_id=task.team_id,
        assignee_id=task.assignee_id,
        column_id=task.column_id,
        title=task.title,
        description=task.description,
        status=task.status,
        priority=task.priority,
        story_points=task.story_points,
        position=task.position,
        report=task.report,
        due_date=task.due_date,
        reminders=task.reminders,
        created_at=task.created_at,
        checklist_total=len(checklist),
        checklist_done=sum(1 for c in checklist if c.is_done),
        comments_count=comments_count,
    )


# ─── Columns ──────────────────────────────────────────────

@router.post(
    "/orgs/{org_id}/projects/{project_id}/columns",
    response_model=TaskColumnResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_column(
    org_id: str,
    project_id: str,
    payload: TaskColumnCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskColumn:
    membership = get_org_membership(org_id, current_user, db)
    require_role(membership, PROJECT_ROLES | ADMIN_ROLES)
    _get_project_or_404(db, org_id, project_id)

    max_pos = (
        db.query(func.max(TaskColumn.position))
        .filter(TaskColumn.project_id == project_id)
        .scalar()
    )
    position = payload.position if payload.position is not None else (max_pos or 0) + 1

    col = TaskColumn(
        org_id=org_id,
        project_id=project_id,
        name=payload.name,
        name_ru=payload.name_ru,
        name_kz=payload.name_kz,
        color=payload.color,
        position=position,
        mapped_status=payload.mapped_status,
    )
    db.add(col)
    log_audit(db, org_id=org_id, actor_id=current_user.id, action=AuditAction.create, entity_type="task_column", entity_id=col.id)
    db.commit()
    db.refresh(col)
    return col


@router.get(
    "/orgs/{org_id}/projects/{project_id}/columns",
    response_model=list[TaskColumnResponse],
)
def list_columns(
    org_id: str,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskColumn]:
    get_org_membership(org_id, current_user, db)
    _get_project_or_404(db, org_id, project_id)
    return (
        db.query(TaskColumn)
        .filter(TaskColumn.project_id == project_id)
        .order_by(TaskColumn.position)
        .all()
    )


@router.patch(
    "/orgs/{org_id}/projects/{project_id}/columns/{column_id}",
    response_model=TaskColumnResponse,
)
def update_column(
    org_id: str,
    project_id: str,
    column_id: str,
    payload: TaskColumnUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskColumn:
    membership = get_org_membership(org_id, current_user, db)
    require_role(membership, PROJECT_ROLES | ADMIN_ROLES)

    col = db.get(TaskColumn, column_id)
    if not col or col.project_id != project_id or col.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")

    for field in ("name", "name_ru", "name_kz", "color", "mapped_status"):
        val = getattr(payload, field)
        if val is not None:
            setattr(col, field, val)

    log_audit(db, org_id=org_id, actor_id=current_user.id, action=AuditAction.update, entity_type="task_column", entity_id=col.id)
    db.commit()
    db.refresh(col)
    return col


@router.delete(
    "/orgs/{org_id}/projects/{project_id}/columns/{column_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_column(
    org_id: str,
    project_id: str,
    column_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    membership = get_org_membership(org_id, current_user, db)
    require_role(membership, PROJECT_ROLES | ADMIN_ROLES)

    col = db.get(TaskColumn, column_id)
    if not col or col.project_id != project_id or col.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")

    # Move tasks to first remaining column
    first_col = (
        db.query(TaskColumn)
        .filter(TaskColumn.project_id == project_id, TaskColumn.id != column_id)
        .order_by(TaskColumn.position)
        .first()
    )
    fallback_id = first_col.id if first_col else None
    db.query(Task).filter(Task.column_id == column_id).update({"column_id": fallback_id})

    log_audit(db, org_id=org_id, actor_id=current_user.id, action=AuditAction.delete, entity_type="task_column", entity_id=col.id)
    db.delete(col)
    db.commit()


@router.put(
    "/orgs/{org_id}/projects/{project_id}/columns/reorder",
    response_model=list[TaskColumnResponse],
)
def reorder_columns(
    org_id: str,
    project_id: str,
    payload: TaskColumnReorder,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskColumn]:
    membership = get_org_membership(org_id, current_user, db)
    require_role(membership, PROJECT_ROLES | ADMIN_ROLES)

    for idx, col_id in enumerate(payload.column_ids):
        db.query(TaskColumn).filter(
            TaskColumn.id == col_id, TaskColumn.project_id == project_id,
        ).update({"position": idx})

    db.commit()
    return (
        db.query(TaskColumn)
        .filter(TaskColumn.project_id == project_id)
        .order_by(TaskColumn.position)
        .all()
    )


# ─── Project Tasks ────────────────────────────────────────

@router.post(
    "/orgs/{org_id}/projects/{project_id}/tasks",
    response_model=BoardTaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project_task(
    org_id: str,
    project_id: str,
    payload: BoardTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BoardTaskResponse:
    membership = get_org_membership(org_id, current_user, db)
    require_role(membership, PROJECT_ROLES | ADMIN_ROLES | {OrgRole.developer})
    _get_project_or_404(db, org_id, project_id)

    # Auto-assign to first column if none specified
    column_id = payload.column_id
    if not column_id:
        first_col = (
            db.query(TaskColumn)
            .filter(TaskColumn.project_id == project_id)
            .order_by(TaskColumn.position)
            .first()
        )
        if first_col:
            column_id = first_col.id

    max_pos = (
        db.query(func.max(Task.position))
        .filter(Task.project_id == project_id, Task.column_id == column_id)
        .scalar()
    )
    position = payload.position if payload.position is not None else (max_pos or 0) + 1

    # Determine initial status from column mapped_status
    initial_status = TaskStatus.todo
    if column_id:
        col = db.get(TaskColumn, column_id)
        if col and col.mapped_status:
            try:
                initial_status = TaskStatus(col.mapped_status)
            except ValueError:
                pass

    task = Task(
        org_id=org_id,
        project_id=project_id,
        column_id=column_id,
        team_id=payload.team_id,
        assignee_id=payload.assignee_id,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        priority=payload.priority,
        story_points=payload.story_points,
        position=position,
        status=initial_status,
    )
    db.add(task)
    log_audit(db, org_id=org_id, actor_id=current_user.id, action=AuditAction.create, entity_type="task", entity_id=task.id)
    db.commit()
    db.refresh(task)
    return _enrich_task(task, db)


@router.get(
    "/orgs/{org_id}/projects/{project_id}/tasks",
    response_model=list[BoardTaskResponse],
)
def list_project_tasks(
    org_id: str,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BoardTaskResponse]:
    get_org_membership(org_id, current_user, db)
    _get_project_or_404(db, org_id, project_id)
    tasks = (
        db.query(Task)
        .filter(Task.project_id == project_id)
        .order_by(Task.position)
        .all()
    )
    return [_enrich_task(t, db) for t in tasks]


@router.get(
    "/orgs/{org_id}/projects/{project_id}/tasks/{task_id}",
    response_model=BoardTaskResponse,
)
def get_project_task(
    org_id: str,
    project_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BoardTaskResponse:
    get_org_membership(org_id, current_user, db)
    task = _get_task_or_404(db, org_id, task_id)
    if task.project_id != project_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found in this project")
    return _enrich_task(task, db)


@router.patch(
    "/orgs/{org_id}/projects/{project_id}/tasks/{task_id}",
    response_model=BoardTaskResponse,
)
def update_project_task(
    org_id: str,
    project_id: str,
    task_id: str,
    payload: BoardTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BoardTaskResponse:
    membership = get_org_membership(org_id, current_user, db)
    task = _get_task_or_404(db, org_id, task_id)

    if task.assignee_id != current_user.id and membership.role not in PROJECT_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    for field in ("title", "description", "due_date", "assignee_id", "team_id", "priority", "story_points", "status", "report"):
        val = getattr(payload, field, None)
        if val is not None:
            setattr(task, field, val)

    # Column move with mapped_status sync
    if payload.column_id is not None:
        task.column_id = payload.column_id
        col = db.get(TaskColumn, payload.column_id)
        if col and col.mapped_status:
            try:
                task.status = TaskStatus(col.mapped_status)
            except ValueError:
                pass

    log_audit(db, org_id=org_id, actor_id=current_user.id, action=AuditAction.update, entity_type="task", entity_id=task.id)
    db.commit()
    db.refresh(task)
    return _enrich_task(task, db)


@router.put(
    "/orgs/{org_id}/projects/{project_id}/tasks/reorder",
    response_model=list[BoardTaskResponse],
)
def reorder_tasks(
    org_id: str,
    project_id: str,
    payload: TaskReorder,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[BoardTaskResponse]:
    get_org_membership(org_id, current_user, db)
    task = _get_task_or_404(db, org_id, payload.task_id)

    old_column_id = task.column_id
    task.column_id = payload.column_id
    task.position = payload.position

    # Sync status with mapped_status
    col = db.get(TaskColumn, payload.column_id)
    if col and col.mapped_status:
        try:
            task.status = TaskStatus(col.mapped_status)
        except ValueError:
            pass

    # Reposition other tasks in the target column
    other_tasks = (
        db.query(Task)
        .filter(Task.project_id == project_id, Task.column_id == payload.column_id, Task.id != task.id)
        .order_by(Task.position)
        .all()
    )
    for idx, t in enumerate(other_tasks):
        new_pos = idx if idx < payload.position else idx + 1
        t.position = new_pos

    db.commit()
    tasks = (
        db.query(Task)
        .filter(Task.project_id == project_id)
        .order_by(Task.position)
        .all()
    )
    return [_enrich_task(t, db) for t in tasks]


@router.get(
    "/orgs/{org_id}/projects/{project_id}/stats",
    response_model=ProjectStats,
)
def get_project_stats(
    org_id: str,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectStats:
    get_org_membership(org_id, current_user, db)
    _get_project_or_404(db, org_id, project_id)

    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    by_status: dict[str, int] = {}
    by_priority: dict[str, int] = {}
    overdue = 0
    total_sp = 0.0
    today = date.today()

    for t in tasks:
        s = t.status.value if t.status else "unknown"
        by_status[s] = by_status.get(s, 0) + 1
        if t.priority:
            by_priority[t.priority] = by_priority.get(t.priority, 0) + 1
        if t.due_date and t.due_date < today and t.status != TaskStatus.done:
            overdue += 1
        if t.story_points:
            total_sp += t.story_points

    return ProjectStats(
        total_tasks=len(tasks),
        by_status=by_status,
        by_priority=by_priority,
        overdue=overdue,
        total_story_points=total_sp,
    )


# ─── Comments ─────────────────────────────────────────────

@router.post(
    "/orgs/{org_id}/tasks/{task_id}/comments",
    response_model=TaskCommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_comment(
    org_id: str,
    task_id: str,
    payload: TaskCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskComment:
    get_org_membership(org_id, current_user, db)
    _get_task_or_404(db, org_id, task_id)

    comment = TaskComment(
        org_id=org_id,
        task_id=task_id,
        user_id=current_user.id,
        text=payload.text,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.get(
    "/orgs/{org_id}/tasks/{task_id}/comments",
    response_model=list[TaskCommentResponse],
)
def list_comments(
    org_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskComment]:
    get_org_membership(org_id, current_user, db)
    _get_task_or_404(db, org_id, task_id)
    return (
        db.query(TaskComment)
        .filter(TaskComment.task_id == task_id)
        .order_by(TaskComment.created_at)
        .all()
    )


@router.patch(
    "/orgs/{org_id}/tasks/{task_id}/comments/{comment_id}",
    response_model=TaskCommentResponse,
)
def update_comment(
    org_id: str,
    task_id: str,
    comment_id: str,
    payload: TaskCommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskComment:
    get_org_membership(org_id, current_user, db)
    comment = db.get(TaskComment, comment_id)
    if not comment or comment.task_id != task_id or comment.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Can only edit own comments")

    comment.text = payload.text
    comment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(comment)
    return comment


@router.delete(
    "/orgs/{org_id}/tasks/{task_id}/comments/{comment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_comment(
    org_id: str,
    task_id: str,
    comment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    membership = get_org_membership(org_id, current_user, db)
    comment = db.get(TaskComment, comment_id)
    if not comment or comment.task_id != task_id or comment.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.user_id != current_user.id and membership.role not in PROJECT_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    db.delete(comment)
    db.commit()


# ─── Checklist ────────────────────────────────────────────

@router.post(
    "/orgs/{org_id}/tasks/{task_id}/checklist",
    response_model=TaskChecklistItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_checklist_item(
    org_id: str,
    task_id: str,
    payload: TaskChecklistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskChecklistItem:
    get_org_membership(org_id, current_user, db)
    _get_task_or_404(db, org_id, task_id)

    max_pos = (
        db.query(func.max(TaskChecklistItem.position))
        .filter(TaskChecklistItem.task_id == task_id)
        .scalar()
    )
    position = payload.position if payload.position is not None else (max_pos or 0) + 1

    item = TaskChecklistItem(task_id=task_id, text=payload.text, position=position)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get(
    "/orgs/{org_id}/tasks/{task_id}/checklist",
    response_model=list[TaskChecklistItemResponse],
)
def list_checklist(
    org_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskChecklistItem]:
    get_org_membership(org_id, current_user, db)
    _get_task_or_404(db, org_id, task_id)
    return (
        db.query(TaskChecklistItem)
        .filter(TaskChecklistItem.task_id == task_id)
        .order_by(TaskChecklistItem.position)
        .all()
    )


@router.patch(
    "/orgs/{org_id}/tasks/{task_id}/checklist/{item_id}",
    response_model=TaskChecklistItemResponse,
)
def update_checklist_item(
    org_id: str,
    task_id: str,
    item_id: str,
    payload: TaskChecklistItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskChecklistItem:
    get_org_membership(org_id, current_user, db)
    item = db.get(TaskChecklistItem, item_id)
    if not item or item.task_id != task_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist item not found")

    if payload.text is not None:
        item.text = payload.text
    if payload.is_done is not None:
        item.is_done = payload.is_done
    if payload.position is not None:
        item.position = payload.position

    db.commit()
    db.refresh(item)
    return item


@router.delete(
    "/orgs/{org_id}/tasks/{task_id}/checklist/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_checklist_item(
    org_id: str,
    task_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    get_org_membership(org_id, current_user, db)
    item = db.get(TaskChecklistItem, item_id)
    if not item or item.task_id != task_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist item not found")

    db.delete(item)
    db.commit()


# ─── Attachments ──────────────────────────────────────────

@router.post(
    "/orgs/{org_id}/tasks/{task_id}/attachments",
    response_model=TaskAttachmentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_attachment(
    org_id: str,
    task_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskAttachment:
    get_org_membership(org_id, current_user, db)
    _get_task_or_404(db, org_id, task_id)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "file")[1]
    stored_name = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, stored_name)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    attachment = TaskAttachment(
        org_id=org_id,
        task_id=task_id,
        filename=file.filename or "file",
        path=file_path,
        size_bytes=len(content),
        content_type=file.content_type,
        uploaded_by=current_user.id,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    return attachment


@router.get(
    "/orgs/{org_id}/tasks/{task_id}/attachments",
    response_model=list[TaskAttachmentResponse],
)
def list_attachments(
    org_id: str,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskAttachment]:
    get_org_membership(org_id, current_user, db)
    _get_task_or_404(db, org_id, task_id)
    return db.query(TaskAttachment).filter(TaskAttachment.task_id == task_id).all()


@router.delete(
    "/orgs/{org_id}/tasks/{task_id}/attachments/{attachment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_attachment(
    org_id: str,
    task_id: str,
    attachment_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    membership = get_org_membership(org_id, current_user, db)
    att = db.get(TaskAttachment, attachment_id)
    if not att or att.task_id != task_id or att.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")
    if att.uploaded_by != current_user.id and membership.role not in PROJECT_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    if os.path.exists(att.path):
        os.remove(att.path)

    db.delete(att)
    db.commit()
