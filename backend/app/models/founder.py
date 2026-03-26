from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.utils.ids import new_id


class Founder(Base):
    __tablename__ = "founders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    org_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    share_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    charter_url: Mapped[str | None] = mapped_column(String(500))
    lease_agreement_url: Mapped[str | None] = mapped_column(String(500))
    decree_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization")
    user = relationship("User")
