from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum as SAEnum, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import TaskPriority, TaskStatus
from app.utils.ids import new_id


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"))
    team_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("teams.id"))
    assignee_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[TaskStatus] = mapped_column(SAEnum(TaskStatus), default=TaskStatus.todo)
    report: Mapped[str | None] = mapped_column(Text)
    due_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Board fields
    project_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("projects.id"))
    column_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("task_columns.id"))
    priority: Mapped[str | None] = mapped_column(String(20))
    story_points: Mapped[float | None] = mapped_column(Float)
    position: Mapped[int] = mapped_column(Integer, default=0)
    reminders: Mapped[dict | None] = mapped_column(JSON)

    organization = relationship("Organization", back_populates="tasks")
    team = relationship("Team", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks")
    project = relationship("Project", back_populates="tasks")
    column = relationship("TaskColumn", back_populates="tasks")
    checklist_items = relationship("TaskChecklistItem", back_populates="task", cascade="all, delete-orphan")
    comments = relationship("TaskComment", back_populates="task", cascade="all, delete-orphan")
    attachments = relationship("TaskAttachment", back_populates="task", cascade="all, delete-orphan")
