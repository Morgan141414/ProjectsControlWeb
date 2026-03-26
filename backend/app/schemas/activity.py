from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import AuditAction


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str
    actor_id: str
    action: AuditAction
    entity_type: str
    entity_id: str
    created_at: datetime
    details: str | None
