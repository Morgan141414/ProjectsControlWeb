from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import TaskStatus


# --- TaskColumn ---

class TaskColumnCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    name_ru: str | None = None
    name_kz: str | None = None
    color: str | None = None
    position: int | None = None
    mapped_status: str | None = None


class TaskColumnUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    name_ru: str | None = None
    name_kz: str | None = None
    color: str | None = None
    mapped_status: str | None = None


class TaskColumnResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str
    project_id: str
    name: str
    name_ru: str | None
    name_kz: str | None
    color: str | None
    position: int
    mapped_status: str | None
    created_at: datetime


class TaskColumnReorder(BaseModel):
    column_ids: list[str]


# --- Board Task ---

class BoardTaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=255)
    description: str | None = None
    due_date: date | None = None
    assignee_id: str | None = None
    team_id: str | None = None
    column_id: str | None = None
    priority: str | None = None
    story_points: float | None = None
    position: int | None = None


class BoardTaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=255)
    description: str | None = None
    due_date: date | None = None
    assignee_id: str | None = None
    team_id: str | None = None
    column_id: str | None = None
    priority: str | None = None
    story_points: float | None = None
    status: TaskStatus | None = None
    report: str | None = None


class BoardTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str
    project_id: str | None
    team_id: str | None
    assignee_id: str | None
    column_id: str | None
    title: str
    description: str | None
    status: TaskStatus
    priority: str | None
    story_points: float | None
    position: int
    report: str | None
    due_date: date | None
    reminders: dict | None
    created_at: datetime
    checklist_total: int = 0
    checklist_done: int = 0
    comments_count: int = 0


class TaskReorder(BaseModel):
    task_id: str
    column_id: str
    position: int


# --- Checklist ---

class TaskChecklistItemCreate(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    position: int | None = None


class TaskChecklistItemUpdate(BaseModel):
    text: str | None = Field(default=None, min_length=1, max_length=500)
    is_done: bool | None = None
    position: int | None = None


class TaskChecklistItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_id: str
    text: str
    is_done: bool
    position: int
    created_at: datetime


# --- Comments ---

class TaskCommentCreate(BaseModel):
    text: str = Field(min_length=1)


class TaskCommentUpdate(BaseModel):
    text: str = Field(min_length=1)


class TaskCommentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str
    task_id: str
    user_id: str
    text: str
    created_at: datetime
    updated_at: datetime | None


# --- Attachments ---

class TaskAttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str
    task_id: str
    filename: str
    path: str
    size_bytes: int
    content_type: str | None
    uploaded_by: str | None
    created_at: datetime


# --- Project Stats ---

class ProjectStats(BaseModel):
    total_tasks: int = 0
    by_status: dict[str, int] = {}
    by_priority: dict[str, int] = {}
    overdue: int = 0
    total_story_points: float = 0
