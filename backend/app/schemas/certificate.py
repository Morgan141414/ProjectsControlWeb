from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import CertificateStatus


class CertificateCreate(BaseModel):
    expires_at: datetime


class CertificateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org_id: str
    certificate_number: str
    issued_at: datetime
    expires_at: datetime
    status: CertificateStatus
    issued_by: str | None = None
    revoked_at: datetime | None = None
    revoke_reason: str | None = None
    pdf_url: str | None = None
