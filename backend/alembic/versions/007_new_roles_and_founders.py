"""Replace org/team roles with new role system and add founders table.

Revision ID: 007_new_roles_and_founders
Revises: 006_rbac_superadmin_certificates
Create Date: 2026-03-23
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "007_new_roles_and_founders"
down_revision: Union[str, None] = "006_rbac_superadmin_certificates"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ORG_ROLE_MAP = {
    "owner": "super_ceo",
    "director": "ceo",
    "hr_manager": "hr",
    "accountant": "member",
    "project_manager": "project_manager",
    "admin": "superadmin",
    "manager": "team_lead",
    "member": "member",
}

TEAM_ROLE_MAP = {
    "head": "team_lead",
    "senior": "developer",
    "specialist": "developer",
    "intern": "member",
    "member": "member",
    "lead": "team_lead",
}


def upgrade() -> None:
    # --- Add is_verified column to users ---
    op.add_column("users", sa.Column("is_verified", sa.Boolean(), server_default="false", nullable=False))

    # --- Create founders table ---
    op.create_table(
        "founders",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("org_id", sa.String(36), sa.ForeignKey("organizations.id"), nullable=False),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("share_percentage", sa.Float(), nullable=False),
        sa.Column("charter_url", sa.String(500), nullable=True),
        sa.Column("lease_agreement_url", sa.String(500), nullable=True),
        sa.Column("decree_url", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )

    # --- Step 1: Convert org_memberships.role from enum to VARCHAR ---
    op.execute("ALTER TABLE org_memberships ALTER COLUMN role TYPE VARCHAR(50) USING role::text")
    op.execute("ALTER TABLE role_permissions ALTER COLUMN role TYPE VARCHAR(50)")

    # --- Step 2: Update data in org_memberships ---
    for old_val, new_val in ORG_ROLE_MAP.items():
        if old_val != new_val:
            op.execute(f"UPDATE org_memberships SET role = '{new_val}' WHERE role = '{old_val}'")
            op.execute(f"UPDATE role_permissions SET role = '{new_val}' WHERE role = '{old_val}'")

    # --- Step 3: Drop old enum and create new one ---
    op.execute("DROP TYPE IF EXISTS orgrole")
    op.execute("CREATE TYPE orgrole AS ENUM ('super_ceo', 'ceo', 'superadmin', 'hr', 'sysadmin', 'team_lead', 'project_manager', 'developer', 'founder', 'member')")
    op.execute("ALTER TABLE org_memberships ALTER COLUMN role TYPE orgrole USING role::orgrole")

    # --- Step 4: Convert team_memberships.role from enum to VARCHAR ---
    op.execute("ALTER TABLE team_memberships ALTER COLUMN role TYPE VARCHAR(50) USING role::text")

    # --- Step 5: Update data in team_memberships ---
    for old_val, new_val in TEAM_ROLE_MAP.items():
        if old_val != new_val:
            op.execute(f"UPDATE team_memberships SET role = '{new_val}' WHERE role = '{old_val}'")

    # --- Step 6: Drop old enum and create new one ---
    op.execute("DROP TYPE IF EXISTS teamrole")
    op.execute("CREATE TYPE teamrole AS ENUM ('team_lead', 'project_manager', 'developer', 'member')")
    op.execute("ALTER TABLE team_memberships ALTER COLUMN role TYPE teamrole USING role::teamrole")


def downgrade() -> None:
    # Reverse team role migration
    op.execute("ALTER TABLE team_memberships ALTER COLUMN role TYPE VARCHAR(50) USING role::text")
    reverse_team = {"team_lead": "head", "developer": "senior", "member": "member"}
    for new_val, old_val in reverse_team.items():
        if old_val != new_val:
            op.execute(f"UPDATE team_memberships SET role = '{old_val}' WHERE role = '{new_val}'")
    op.execute("DROP TYPE IF EXISTS teamrole")
    op.execute("CREATE TYPE teamrole AS ENUM ('head', 'senior', 'specialist', 'intern', 'member', 'lead')")
    op.execute("ALTER TABLE team_memberships ALTER COLUMN role TYPE teamrole USING role::teamrole")

    # Reverse org role migration
    op.execute("ALTER TABLE org_memberships ALTER COLUMN role TYPE VARCHAR(50) USING role::text")
    op.execute("ALTER TABLE role_permissions ALTER COLUMN role TYPE VARCHAR(50)")
    reverse_org = {"super_ceo": "owner", "ceo": "director", "hr": "hr_manager", "superadmin": "admin", "team_lead": "manager", "member": "member", "project_manager": "project_manager"}
    for new_val, old_val in reverse_org.items():
        if old_val != new_val:
            op.execute(f"UPDATE org_memberships SET role = '{old_val}' WHERE role = '{new_val}'")
            op.execute(f"UPDATE role_permissions SET role = '{old_val}' WHERE role = '{new_val}'")
    op.execute("DROP TYPE IF EXISTS orgrole")
    op.execute("CREATE TYPE orgrole AS ENUM ('owner', 'director', 'hr_manager', 'accountant', 'project_manager', 'admin', 'manager', 'member')")
    op.execute("ALTER TABLE org_memberships ALTER COLUMN role TYPE orgrole USING role::orgrole")

    # Drop founders table
    op.drop_table("founders")

    # Remove is_verified column
    op.drop_column("users", "is_verified")
