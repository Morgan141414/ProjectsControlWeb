from datetime import datetime

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import CertificateStatus
from app.utils.ids import new_id


class OrganizationCertificate(Base):
    __tablename__ = "organization_certificates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"))
    certificate_number: Mapped[str] = mapped_column(String(100), unique=True)
    issued_at: Mapped[datetime] = mapped_column(DateTime)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[CertificateStatus] = mapped_column(
        SAEnum(CertificateStatus), default=CertificateStatus.active
    )
    issued_by: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"))
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime)
    revoke_reason: Mapped[str | None] = mapped_column(Text)
    pdf_url: Mapped[str | None] = mapped_column(String(500))

    organization = relationship("Organization")
