"""Add task board features: columns, checklist, attachments, comments.

Revision ID: 008_task_board_features
Revises: 007_new_roles_and_founders
Create Date: 2026-03-25
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "008_task_board_features"
down_revision: Union[str, None] = "007_new_roles_and_founders"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Create task_columns table ---
    op.create_table(
        "task_columns",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("name_ru", sa.String(100), nullable=True),
        sa.Column("name_kz", sa.String(100), nullable=True),
        sa.Column("color", sa.String(20), nullable=True),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("mapped_status", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_task_columns_project_position", "task_columns", ["project_id", "position"])

    # --- Add board columns to tasks ---
    op.add_column("tasks", sa.Column("project_id", sa.String(36), sa.ForeignKey("projects.id"), nullable=True))
    op.add_column("tasks", sa.Column("column_id", sa.String(36), sa.ForeignKey("task_columns.id"), nullable=True))
    op.add_column("tasks", sa.Column("priority", sa.String(20), nullable=True))
    op.add_column("tasks", sa.Column("story_points", sa.Float(), nullable=True))
    op.add_column("tasks", sa.Column("position", sa.Integer(), server_default="0", nullable=False))
    op.add_column("tasks", sa.Column("reminders", sa.JSON(), nullable=True))
    op.create_index("ix_tasks_project_id", "tasks", ["project_id"])
    op.create_index("ix_tasks_column_id", "tasks", ["column_id"])

    # --- Create task_checklist_items table ---
    op.create_table(
        "task_checklist_items",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("task_id", sa.String(36), sa.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("text", sa.String(500), nullable=False),
        sa.Column("is_done", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("position", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    # --- Create task_attachments table ---
    op.create_table(
        "task_attachments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("task_id", sa.String(36), sa.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("path", sa.String(500), nullable=False),
        sa.Column("size_bytes", sa.Integer(), server_default="0", nullable=False),
        sa.Column("content_type", sa.String(100), nullable=True),
        sa.Column("uploaded_by", sa.String(36), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    # --- Create task_comments table ---
    op.create_table(
        "task_comments",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("task_id", sa.String(36), sa.ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("task_comments")
    op.drop_table("task_attachments")
    op.drop_table("task_checklist_items")
    op.drop_index("ix_tasks_column_id", "tasks")
    op.drop_index("ix_tasks_project_id", "tasks")
    op.drop_column("tasks", "reminders")
    op.drop_column("tasks", "position")
    op.drop_column("tasks", "story_points")
    op.drop_column("tasks", "priority")
    op.drop_column("tasks", "column_id")
    op.drop_column("tasks", "project_id")
    op.drop_index("ix_task_columns_project_position", "task_columns")
    op.drop_table("task_columns")
