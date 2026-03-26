from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import SessionLocal
from app.models.enums import OrgRole
from app.models.org import OrgMembership
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Role groups for permission checks
MANAGEMENT_ROLES = {OrgRole.super_ceo, OrgRole.ceo}
ADMIN_ROLES = {OrgRole.super_ceo, OrgRole.ceo, OrgRole.superadmin}
HR_ROLES = {OrgRole.super_ceo, OrgRole.ceo, OrgRole.hr}
PROJECT_ROLES = {OrgRole.super_ceo, OrgRole.ceo, OrgRole.team_lead, OrgRole.project_manager}
ALL_STAFF_ROLES = {
    OrgRole.super_ceo, OrgRole.ceo, OrgRole.superadmin, OrgRole.hr,
    OrgRole.sysadmin, OrgRole.team_lead, OrgRole.project_manager,
    OrgRole.developer, OrgRole.founder, OrgRole.member,
}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_org_membership(
    org_id: str,
    user: User,
    db: Session,
) -> OrgMembership:
    membership = (
        db.query(OrgMembership)
        .filter(OrgMembership.org_id == org_id, OrgMembership.user_id == user.id)
        .first()
    )
    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization",
        )
    return membership


def require_role(membership: OrgMembership, allowed_roles: set[OrgRole]) -> None:
    if membership.role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions",
        )


def require_superadmin(user: User = Depends(get_current_user)) -> User:
    """FastAPI dependency that ensures the current user is a platform superadmin."""
    if not user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required",
        )
    return user
