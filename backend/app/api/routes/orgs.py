from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.audit import log_audit
from app.core.deps import get_current_user, get_db, get_org_membership, require_role, HR_ROLES, MANAGEMENT_ROLES
from app.models.enums import AuditAction, JoinStatus, OrgRole
from app.models.org import OrgJoinRequest, OrgMembership, Organization
from app.models.user import User
from app.schemas.org import (
    JoinRequestCreate,
    JoinRequestResponse,
    OrgCreate,
    OrgResponse,
    OrgWithRoleResponse,
)

router = APIRouter(prefix="/orgs", tags=["orgs"])


@router.get("", response_model=list[OrgWithRoleResponse])
def list_orgs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    """List organizations the current user belongs to, with their role in each."""
    memberships = (
        db.query(OrgMembership)
        .filter(OrgMembership.user_id == current_user.id)
        .all()
    )
    if not memberships:
        return []

    role_map = {m.org_id: m.role.value for m in memberships}
    org_ids = list(role_map.keys())
    orgs = db.query(Organization).filter(Organization.id.in_(org_ids)).all()

    result = []
    for org in orgs:
        org_dict = {
            "id": org.id,
            "name": org.name,
            "join_code": org.join_code,
            "description": org.description,
            "industry": org.industry,
            "website": org.website,
            "logo_url": org.logo_url,
            "owner_id": org.owner_id,
            "is_active": org.is_active,
            "max_members": org.max_members,
            "auto_approve": org.auto_approve,
            "welcome_message": org.welcome_message,
            "theme_color": org.theme_color,
            "role": role_map.get(org.id, "member"),
        }
        result.append(org_dict)
    return result


@router.post("", response_model=OrgResponse, status_code=status.HTTP_201_CREATED)
def create_org(
    payload: OrgCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Organization:
    """Create organization. Creator becomes super_ceo."""
    org = Organization(name=payload.name, owner_id=current_user.id)
    db.add(org)
    db.flush()

    membership = OrgMembership(org_id=org.id, user_id=current_user.id, role=OrgRole.super_ceo)
    db.add(membership)
    log_audit(
        db,
        org_id=org.id,
        actor_id=current_user.id,
        action=AuditAction.create,
        entity_type="organization",
        entity_id=org.id,
    )
    db.commit()
    db.refresh(org)
    return org


@router.post("/join-request", response_model=JoinRequestResponse, status_code=status.HTTP_201_CREATED)
def create_join_request(
    payload: JoinRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrgJoinRequest:
    org = (
        db.query(Organization)
        .filter(Organization.join_code == payload.org_code.upper())
        .first()
    )
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    existing_membership = (
        db.query(OrgMembership)
        .filter(OrgMembership.org_id == org.id, OrgMembership.user_id == current_user.id)
        .first()
    )
    if existing_membership:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already a member")

    existing_request = (
        db.query(OrgJoinRequest)
        .filter(
            OrgJoinRequest.org_id == org.id,
            OrgJoinRequest.user_id == current_user.id,
            OrgJoinRequest.status == JoinStatus.pending,
        )
        .first()
    )
    if existing_request:
        return existing_request

    request = OrgJoinRequest(org_id=org.id, user_id=current_user.id)
    db.add(request)

    if org.auto_approve:
        request.status = JoinStatus.approved
        db.add(OrgMembership(org_id=org.id, user_id=current_user.id, role=OrgRole.member))

    db.commit()
    db.refresh(request)
    return request


@router.get("/{org_id}", response_model=OrgResponse)
def get_org(
    org_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Organization:
    get_org_membership(org_id, current_user, db)
    org = db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
    return org


@router.get("/{org_id}/join-requests", response_model=list[JoinRequestResponse])
def list_join_requests(
    org_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[OrgJoinRequest]:
    membership = get_org_membership(org_id, current_user, db)
    require_role(membership, HR_ROLES | {OrgRole.superadmin})

    return (
        db.query(OrgJoinRequest)
        .filter(OrgJoinRequest.org_id == org_id)
        .order_by(OrgJoinRequest.created_at.desc())
        .all()
    )


@router.post(
    "/{org_id}/join-requests/{request_id}/approve",
    response_model=JoinRequestResponse,
)
def approve_join_request(
    org_id: str,
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrgJoinRequest:
    membership = get_org_membership(org_id, current_user, db)
    require_role(membership, HR_ROLES | {OrgRole.superadmin})

    join_request = db.get(OrgJoinRequest, request_id)
    if not join_request or join_request.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Join request not found")

    if join_request.status != JoinStatus.pending:
        return join_request

    existing = (
        db.query(OrgMembership)
        .filter(
            OrgMembership.org_id == org_id,
            OrgMembership.user_id == join_request.user_id,
        )
        .first()
    )
    if not existing:
        db.add(OrgMembership(org_id=org_id, user_id=join_request.user_id))

    join_request.status = JoinStatus.approved
    log_audit(
        db,
        org_id=org_id,
        actor_id=current_user.id,
        action=AuditAction.approve,
        entity_type="join_request",
        entity_id=join_request.id,
    )
    db.commit()
    db.refresh(join_request)
    return join_request


@router.post(
    "/{org_id}/join-requests/{request_id}/reject",
    response_model=JoinRequestResponse,
)
def reject_join_request(
    org_id: str,
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrgJoinRequest:
    membership = get_org_membership(org_id, current_user, db)
    require_role(membership, HR_ROLES | {OrgRole.superadmin})

    join_request = db.get(OrgJoinRequest, request_id)
    if not join_request or join_request.org_id != org_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Join request not found")

    join_request.status = JoinStatus.rejected
    log_audit(
        db,
        org_id=org_id,
        actor_id=current_user.id,
        action=AuditAction.reject,
        entity_type="join_request",
        entity_id=join_request.id,
    )
    db.commit()
    db.refresh(join_request)
    return join_request
