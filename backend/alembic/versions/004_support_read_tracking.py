"""Add read-tracking columns to support_threads.

Revision ID: 004_support_read_tracking
Revises: 003_support_message_attachments
Create Date: 2026-03-21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "004_support_read_tracking"
down_revision: Union[str, None] = "003_support_message_attachments"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "support_threads",
        sa.Column("staff_last_read_at", sa.DateTime, nullable=True),
    )
    op.add_column(
        "support_threads",
        sa.Column("requester_last_read_at", sa.DateTime, nullable=True),
    )


def downgrade() -> None:
    op.drop_column("support_threads", "requester_last_read_at")
    op.drop_column("support_threads", "staff_last_read_at")
