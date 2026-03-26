"""Add RBAC tables, superadmin fields, certificates, and extended org/user columns.

Revision ID: 006_rbac_superadmin_certificates
Revises: 005_user_phone
Create Date: 2026-03-21
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "006_rbac_superadmin_certificates"
down_revision: Union[str, None] = "005_user_phone"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Users: new columns ---
    op.add_column("users", sa.Column("is_superadmin", sa.Boolean(), server_default="false", nullable=False))
    op.add_column("users", sa.Column("totp_secret", sa.String(64), nullable=True))
    op.add_column("users", sa.Column("totp_enabled", sa.Boolean(), server_default="false", nullable=False))
    op.add_column("users", sa.Column("password_reset_token", sa.String(255), nullable=True))
    op.add_column("users", sa.Column("password_reset_expires", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("position", sa.String(200), nullable=True))
    op.add_column("users", sa.Column("experience_years", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("skills", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("education", sa.String(500), nullable=True))
    op.add_column("users", sa.Column("city", sa.String(200), nullable=True))
    op.add_column("users", sa.Column("portfolio_url", sa.String(500), nullable=True))
    op.add_column("users", sa.Column("is_looking_for_job", sa.Boolean(), server_default="false", nullable=False))
    op.add_column("users", sa.Column("desired_salary", sa.Integer(), nullable=True))

    # --- Organizations: new columns ---
    op.add_column("organizations", sa.Column("description", sa.Text(), nullable=True))
    op.add_column("organizations", sa.Column("industry", sa.String(200), nullable=True))
    op.add_column("organizations", sa.Column("website", sa.String(500), nullable=True))
    op.add_column("organizations", sa.Column("logo_url", sa.String(500), nullable=True))
    op.add_column("organizations", sa.Column("owner_id", sa.String(36), sa.ForeignKey("users.id"), nullable=True))
    op.add_column("organizations", sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False))
    op.add_column("organizations", sa.Column("suspended_at", sa.DateTime(), nullable=True))
    op.add_column("organizations", sa.Column("max_members", sa.Integer(), server_default="50", nullable=False))
    op.add_column("organizations", sa.Column("auto_approve", sa.Boolean(), server_default="false", nullable=False))
    op.add_column("organizations", sa.Column("welcome_message", sa.Text(), nullable=True))
    op.add_column("organizations", sa.Column("theme_color", sa.String(20), nullable=True))

    # --- Permissions table ---
    op.create_table(
        "permissions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("codename", sa.String(100), unique=True, nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
    )

    # --- Role-permissions table ---
    op.create_table(
        "role_permissions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("role", sa.String(50), nullable=False),
        sa.Column("permission_id", sa.String(36), sa.ForeignKey("permissions.id"), nullable=False),
    )

    # --- Organization certificates table ---
    op.create_table(
        "organization_certificates",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("certificate_number", sa.String(100), unique=True, nullable=False),
        sa.Column("issued_at", sa.DateTime(), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("active", "expired", "revoked", name="certificatestatus"),
            server_default="active",
            nullable=False,
        ),
        sa.Column("issued_by", sa.String(36), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.Column("revoke_reason", sa.Text(), nullable=True),
        sa.Column("pdf_url", sa.String(500), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("organization_certificates")
    op.drop_table("role_permissions")
    op.drop_table("permissions")

    # Organizations columns
    for col in [
        "description", "industry", "website", "logo_url", "owner_id",
        "is_active", "suspended_at", "max_members", "auto_approve",
        "welcome_message", "theme_color",
    ]:
        op.drop_column("organizations", col)

    # Users columns
    for col in [
        "is_superadmin", "totp_secret", "totp_enabled",
        "password_reset_token", "password_reset_expires",
        "position", "experience_years", "skills", "education",
        "city", "portfolio_url", "is_looking_for_job", "desired_salary",
    ]:
        op.drop_column("users", col)

    op.execute("DROP TYPE IF EXISTS certificatestatus")
