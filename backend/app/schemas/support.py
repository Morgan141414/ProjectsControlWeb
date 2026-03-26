from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SupportThreadStatusUpdate(BaseModel):
    status: str = Field(pattern="^(open|answered|closed)$")


class SupportMessageAttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    file_name: str
    content_type: str
    size_bytes: int
    url: str


class SupportMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    thread_id: str
    author_id: str
    author_name: str
    author_role: str
    body: str
    created_at: datetime
    attachments: list[SupportMessageAttachmentResponse] = []


class SupportThreadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str | None = None
    requester_id: str
    requester_name: str
    requester_role: str
    subject: str
    status: str
    created_at: datetime
    updated_at: datetime
    last_message_preview: str | None = None
    unread_count: int = 0
    messages: list[SupportMessageResponse] = []


class SupportStatsResponse(BaseModel):
    total: int = 0
    open: int = 0
    answered: int = 0
    closed: int = 0
    unread_total: int = 0
