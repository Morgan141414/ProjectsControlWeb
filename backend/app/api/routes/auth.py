"""Authentication endpoints: register, login, refresh, logout, Google OAuth."""

import secrets
from datetime import timedelta

import jwt as pyjwt
import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token as google_id_token
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.core.rate_limit import limiter
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.core.totp import generate_totp_secret, get_totp_uri, generate_qr_code_base64, verify_totp
from app.core.time import utc_now_naive
from app.models.token import FailedLoginAttempt, RefreshToken
from app.models.user import User
from app.schemas.auth import (
    AppleLoginRequest,
    ForgotPasswordRequest,
    GoogleLoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    ResetPasswordRequest,
    Token,
)
from app.schemas.user import UserResponse

logger = structlog.get_logger()
router = APIRouter(prefix="/auth", tags=["auth"])


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _check_account_lockout(db: Session, email: str) -> None:
    """Raise 429 if too many failed login attempts in the lockout window."""
    cutoff = utc_now_naive() - timedelta(minutes=settings.ACCOUNT_LOCKOUT_MINUTES)
    recent_failures = (
        db.query(FailedLoginAttempt)
        .filter(
            FailedLoginAttempt.email == email,
            FailedLoginAttempt.attempted_at >= cutoff,
        )
        .count()
    )
    if recent_failures >= settings.ACCOUNT_LOCKOUT_ATTEMPTS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account temporarily locked. Try again in {settings.ACCOUNT_LOCKOUT_MINUTES} minutes.",
        )


def _record_failed_attempt(db: Session, email: str, ip: str) -> None:
    db.add(FailedLoginAttempt(email=email, ip_address=ip))
    db.commit()


def _clear_failed_attempts(db: Session, email: str) -> None:
    db.query(FailedLoginAttempt).filter(FailedLoginAttempt.email == email).delete()
    db.commit()


def _issue_tokens(user_id: str, db: Session) -> Token:
    """Create access + refresh token pair."""
    access_token = create_access_token(user_id)
    raw_refresh = generate_refresh_token()
    token_hash = hash_refresh_token(raw_refresh)
    expires_at = utc_now_naive() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    db.add(RefreshToken(user_id=user_id, token_hash=token_hash, expires_at=expires_at))
    db.commit()

    return Token(access_token=access_token, refresh_token=raw_refresh)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_REGISTER)
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)) -> User:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("user_registered", user_id=user.id, email=user.email)
    return user


@router.post("/login", response_model=Token)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    _check_account_lockout(db, form_data.username)

    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        client_ip = request.client.host if request.client else "unknown"
        _record_failed_attempt(db, form_data.username, client_ip)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    _clear_failed_attempts(db, form_data.username)
    logger.info("user_logged_in", user_id=user.id)
    return _issue_tokens(user.id, db)


@router.post("/refresh", response_model=Token)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> Token:
    """Exchange a valid refresh token for a new access + refresh token pair."""
    token_hash = hash_refresh_token(payload.refresh_token)
    stored = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash, RefreshToken.revoked.is_(False))
        .first()
    )
    if not stored:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if stored.expires_at < utc_now_naive():
        stored.revoked = True
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    # Rotate: revoke old, issue new pair
    stored.revoked = True
    db.commit()

    user = db.get(User, stored.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return _issue_tokens(user.id, db)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(payload: RefreshTokenRequest, db: Session = Depends(get_db)) -> None:
    """Revoke a refresh token (log out)."""
    token_hash = hash_refresh_token(payload.refresh_token)
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if stored:
        stored.revoked = True
        db.commit()


@router.post("/google", response_model=Token)
def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)) -> Token:
    if not settings.GOOGLE_OAUTH_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth is not configured",
        )

    try:
        info = google_id_token.verify_oauth2_token(
            payload.id_token,
            GoogleRequest(),
            settings.GOOGLE_OAUTH_CLIENT_ID,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        ) from exc

    email = info.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google account email missing")
    if info.get("email_verified") is False:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Google email not verified")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        full_name = info.get("name") or info.get("given_name") or email
        random_password = secrets.token_urlsafe(24)
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(random_password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("user_created_via_google", user_id=user.id, email=email)

    return _issue_tokens(user.id, db)


@router.post("/apple", response_model=Token)
def apple_login(payload: AppleLoginRequest, db: Session = Depends(get_db)) -> Token:
    """Sign in with Apple — verify the id_token and create/login user."""
    if not settings.APPLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Apple Sign-In is not configured",
        )

    try:
        # Apple id_tokens are JWTs signed with RS256.
        # We decode without full signature verification here (Apple public keys
        # should be fetched from https://appleid.apple.com/auth/keys for production).
        # For now we verify the audience and issuer claims.
        claims = pyjwt.decode(
            payload.id_token,
            options={"verify_signature": False},
            audience=settings.APPLE_CLIENT_ID,
            issuer="https://appleid.apple.com",
            algorithms=["RS256"],
        )
    except pyjwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Apple token",
        ) from exc

    email = claims.get("email")
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Apple account email missing")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        full_name = payload.full_name or email.split("@")[0]
        random_password = secrets.token_urlsafe(24)
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(random_password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("user_created_via_apple", user_id=user.id, email=email)

    return _issue_tokens(user.id, db)


# ---------------------------------------------------------------------------
# 2FA (TOTP) endpoints
# ---------------------------------------------------------------------------

class TwoFASetupResponse(BaseModel):
    secret: str
    uri: str
    qr_code: str


class TwoFAVerifyRequest(BaseModel):
    code: str = Field(min_length=6, max_length=6)




@router.post("/2fa/setup", response_model=TwoFASetupResponse)
def setup_2fa(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Generate TOTP secret and QR code for 2FA setup."""
    if user.totp_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="2FA is already enabled")

    secret = generate_totp_secret()
    uri = get_totp_uri(secret, user.email)
    qr_code = generate_qr_code_base64(uri)

    # Store secret (not yet enabled until verified)
    user.totp_secret = secret
    db.commit()

    logger.info("2fa_setup_initiated", user_id=user.id)
    return {"secret": secret, "uri": uri, "qr_code": qr_code}


@router.post("/2fa/verify", status_code=status.HTTP_200_OK)
def verify_2fa(
    payload: TwoFAVerifyRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Verify a TOTP code and enable 2FA for the user."""
    if not user.totp_secret:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="2FA setup not initiated")

    if not verify_totp(user.totp_secret, payload.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid TOTP code")

    user.totp_enabled = True
    db.commit()
    logger.info("2fa_enabled", user_id=user.id)
    return {"detail": "2FA enabled successfully"}


@router.post("/2fa/disable", status_code=status.HTTP_200_OK)
def disable_2fa(
    payload: TwoFAVerifyRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Disable 2FA for the user (requires valid TOTP code)."""
    if not user.totp_enabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="2FA is not enabled")

    if not verify_totp(user.totp_secret, payload.code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid TOTP code")

    user.totp_enabled = False
    user.totp_secret = None
    db.commit()
    logger.info("2fa_disabled", user_id=user.id)
    return {"detail": "2FA disabled successfully"}


# ---------------------------------------------------------------------------
# Password reset endpoints
# ---------------------------------------------------------------------------

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
def forgot_password(
    request: Request,
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
) -> dict:
    """Generate a password reset token and log it (email sending is a stub)."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Return success even if user not found to prevent email enumeration
        return {"detail": "If the email exists, a reset link has been sent"}

    token = secrets.token_urlsafe(32)
    user.password_reset_token = token
    user.password_reset_expires = utc_now_naive() + timedelta(hours=1)
    db.commit()

    # In production, send email. For now, log the token.
    logger.info("password_reset_requested", user_id=user.id, reset_token=token)
    return {"detail": "If the email exists, a reset link has been sent"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db),
) -> dict:
    """Reset password using a valid reset token."""
    user = (
        db.query(User)
        .filter(User.password_reset_token == payload.token)
        .first()
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    if not user.password_reset_expires or user.password_reset_expires < utc_now_naive():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    user.hashed_password = hash_password(payload.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    db.commit()

    logger.info("password_reset_completed", user_id=user.id)
    return {"detail": "Password has been reset successfully"}
