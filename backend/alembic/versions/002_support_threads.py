"""Add support threads and messages.

Revision ID: 002_support_threads
Revises: 001_initial
Create Date: 2026-03-20
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "002_support_threads"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "support_threads",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("manager_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("subject", sa.String(255), nullable=False),
        sa.Column("status", sa.String(32), nullable=False, server_default="open"),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_support_threads_org_id", "support_threads", ["org_id"])
    op.create_index("ix_support_threads_manager_id", "support_threads", ["manager_id"])

    op.create_table(
        "support_messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("thread_id", sa.String(36), sa.ForeignKey("support_threads.id"), nullable=False),
        sa.Column("author_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_support_messages_thread_id", "support_messages", ["thread_id"])


def downgrade() -> None:
    op.drop_index("ix_support_messages_thread_id", table_name="support_messages")
    op.drop_table("support_messages")
    op.drop_index("ix_support_threads_manager_id", table_name="support_threads")
    op.drop_index("ix_support_threads_org_id", table_name="support_threads")
    op.drop_table("support_threads")
