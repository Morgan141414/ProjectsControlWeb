"""Add support message attachments.

Revision ID: 003_support_message_attachments
Revises: 002_support_threads
Create Date: 2026-03-20
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "003_support_message_attachments"
down_revision: Union[str, None] = "002_support_threads"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "support_message_attachments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("message_id", sa.String(36), sa.ForeignKey("support_messages.id"), nullable=False),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("content_type", sa.String(120), nullable=False),
        sa.Column("size_bytes", sa.Integer, nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index(
        "ix_support_message_attachments_message_id",
        "support_message_attachments",
        ["message_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_support_message_attachments_message_id",
        table_name="support_message_attachments",
    )
    op.drop_table("support_message_attachments")
