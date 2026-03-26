from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.utils.ids import new_id


class SupportThread(Base):
    __tablename__ = "support_threads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    org_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("organizations.id"), index=True, nullable=True)
    requester_id: Mapped[str] = mapped_column("manager_id", String(36), ForeignKey("users.id"), index=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="open")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    staff_last_read_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    requester_last_read_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    requester = relationship("User", foreign_keys=[requester_id])
    messages = relationship(
        "SupportMessage",
        back_populates="thread",
        cascade="all, delete-orphan",
        order_by="SupportMessage.created_at",
    )


class SupportMessage(Base):
    __tablename__ = "support_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    thread_id: Mapped[str] = mapped_column(String(36), ForeignKey("support_threads.id"), index=True)
    author_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    thread = relationship("SupportThread", back_populates="messages")
    author = relationship("User", foreign_keys=[author_id])
    attachments = relationship(
        "SupportMessageAttachment",
        back_populates="message",
        cascade="all, delete-orphan",
        order_by="SupportMessageAttachment.created_at",
    )


class SupportMessageAttachment(Base):
    __tablename__ = "support_message_attachments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    message_id: Mapped[str] = mapped_column(String(36), ForeignKey("support_messages.id"), index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    content_type: Mapped[str] = mapped_column(String(120), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    message = relationship("SupportMessage", back_populates="attachments")
