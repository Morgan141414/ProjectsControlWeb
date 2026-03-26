"""Superadmin platform management endpoints."""

import secrets
from datetime import datetime

import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_superadmin
from app.core.time import utc_now_naive
from app.models.certificate import OrganizationCertificate
from app.models.enums import CertificateStatus
from app.models.org import Organization
from app.models.user import User
from app.schemas.certificate import CertificateCreate, CertificateResponse
from app.schemas.org import OrgResponse
from app.services.pdf import generate_certificate_pdf

logger = structlog.get_logger()
router = APIRouter(prefix="/admin", tags=["admin"])


# ---------------------------------------------------------------------------
# Org management
# ---------------------------------------------------------------------------

@router.get("/orgs", response_model=list[OrgResponse])
def list_all_orgs(
    admin: User = Depends(require_superadmin),
    db: Session = Depends(get_db),
) -> list[Organization]:
    """List all organizations (superadmin only)."""
    return db.query(Organization).all()


@router.post("/orgs/{org_id}/suspend", response_model=OrgResponse)
def suspend_org(
    org_id: str,
    admin: User = Depends(require_superadmin),
    db: Session = Depends(get_db),
) -> Organization:
    org = db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    org.is_active = False
    org.suspended_at = utc_now_naive()
    db.commit()
    db.refresh(org)
    logger.info("org_suspended", org_id=org_id, admin_id=admin.id)
    return org


@router.post("/orgs/{org_id}/activate", response_model=OrgResponse)
def activate_org(
    org_id: str,
    admin: User = Depends(require_superadmin),
    db: Session = Depends(get_db),
) -> Organization:
    org = db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    org.is_active = True
    org.suspended_at = None
    db.commit()
    db.refresh(org)
    logger.info("org_activated", org_id=org_id, admin_id=admin.id)
    return org


# ---------------------------------------------------------------------------
# Certificate management
# ---------------------------------------------------------------------------

def _generate_cert_number() -> str:
    return f"CERT-{secrets.token_hex(6).upper()}"


@router.post("/orgs/{org_id}/certificate", response_model=CertificateResponse, status_code=status.HTTP_201_CREATED)
def issue_certificate(
    org_id: str,
    payload: CertificateCreate,
    admin: User = Depends(require_superadmin),
    db: Session = Depends(get_db),
) -> OrganizationCertificate:
    org = db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    now = utc_now_naive()
    cert_number = _generate_cert_number()

    # Generate PDF
    pdf_bytes = generate_certificate_pdf(org.name, cert_number, now, payload.expires_at)
    logger.info("certificate_pdf_generated", cert_number=cert_number, size=len(pdf_bytes))

    cert = OrganizationCertificate(
        org_id=org_id,
        certificate_number=cert_number,
        issued_at=now,
        expires_at=payload.expires_at,
        status=CertificateStatus.active,
        issued_by=admin.id,
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    logger.info("certificate_issued", cert_id=cert.id, org_id=org_id)
    return cert


@router.post("/orgs/{org_id}/certificate/renew", response_model=CertificateResponse)
def renew_certificate(
    org_id: str,
    payload: CertificateCreate,
    admin: User = Depends(require_superadmin),
    db: Session = Depends(get_db),
) -> OrganizationCertificate:
    org = db.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")

    # Expire current active certificate
    current = (
        db.query(OrganizationCertificate)
        .filter(
            OrganizationCertificate.org_id == org_id,
            OrganizationCertificate.status == CertificateStatus.active,
        )
        .first()
    )
    if current:
        current.status = CertificateStatus.expired
        db.flush()

    now = utc_now_naive()
    cert_number = _generate_cert_number()

    cert = OrganizationCertificate(
        org_id=org_id,
        certificate_number=cert_number,
        issued_at=now,
        expires_at=payload.expires_at,
        status=CertificateStatus.active,
        issued_by=admin.id,
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    logger.info("certificate_renewed", cert_id=cert.id, org_id=org_id)
    return cert


@router.post("/orgs/{org_id}/certificate/revoke", response_model=CertificateResponse)
def revoke_certificate(
    org_id: str,
    reason: str = "",
    admin: User = Depends(require_superadmin),
    db: Session = Depends(get_db),
) -> OrganizationCertificate:
    cert = (
        db.query(OrganizationCertificate)
        .filter(
            OrganizationCertificate.org_id == org_id,
            OrganizationCertificate.status == CertificateStatus.active,
        )
        .first()
    )
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active certificate found")

    cert.status = CertificateStatus.revoked
    cert.revoked_at = utc_now_naive()
    cert.revoke_reason = reason or None
    db.commit()
    db.refresh(cert)
    logger.info("certificate_revoked", cert_id=cert.id, org_id=org_id)
    return cert
