"""Add phone column to users.

Revision ID: 005_user_phone
Revises: 004_support_read_tracking
Create Date: 2026-03-21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "005_user_phone"
down_revision: Union[str, None] = "004_support_read_tracking"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("phone", sa.String(20), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "phone")
