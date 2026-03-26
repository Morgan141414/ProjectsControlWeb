"""RBAC utilities: permission checking as FastAPI dependencies."""

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.org import OrgMembership
from app.models.permission import Permission, RolePermission
from app.models.user import User


def get_user_permissions(user_id: str, org_id: str, db: Session) -> set[str]:
    """Return the set of permission codenames for a user's role in an org."""
    membership = (
        db.query(OrgMembership)
        .filter(OrgMembership.org_id == org_id, OrgMembership.user_id == user_id)
        .first()
    )
    if not membership:
        return set()

    role_name = membership.role.value

    rows = (
        db.query(Permission.codename)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .filter(RolePermission.role == role_name)
        .all()
    )
    return {row[0] for row in rows}


def require_permission(codename: str):
    """FastAPI dependency factory that checks a specific permission for the user in an org.

    Usage:
        @router.get("/...", dependencies=[Depends(require_permission("org.manage_members"))])
        def endpoint(org_id: str, ...):
    """

    def _dependency(
        org_id: str,
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> None:
        # Superadmins bypass permission checks
        if user.is_superadmin:
            return

        permissions = get_user_permissions(user.id, org_id, db)
        if codename not in permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {codename}",
            )

    return _dependency
