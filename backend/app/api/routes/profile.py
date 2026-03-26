import hashlib
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.models.org import OrgMembership
from app.models.user import User
from app.schemas.user import UserProfileUpdate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

AVATAR_DIR = Path(settings.STORAGE_PATH).parent / "avatars"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_AVATAR_BYTES = 10 * 1024 * 1024  # 10 MB


def _user_response(user: User, db: Session) -> UserResponse:
    membership = (
        db.query(OrgMembership)
        .filter(OrgMembership.user_id == user.id)
        .order_by(OrgMembership.created_at.desc())
        .first()
    )
    return UserResponse.model_validate(
        {
            **user.__dict__,
            "org_id": membership.org_id if membership else None,
            "org_role": membership.role if membership else None,
        }
    )


@router.get("/me", response_model=UserResponse)
def get_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return _user_response(current_user, db)


@router.patch("/me", response_model=UserResponse)
def update_me(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(current_user, key, value)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return _user_response(current_user, db)


@router.post("/me/avatar")
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        return JSONResponse(status_code=400, content={"detail": "Unsupported image type"})

    content = file.file.read()
    if len(content) > MAX_AVATAR_BYTES:
        return JSONResponse(status_code=400, content={"detail": "File too large"})

    ext = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
    }.get(file.content_type, ".jpg")

    filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)

    # Remove old avatar file if exists
    if current_user.avatar_url:
        old_name = current_user.avatar_url.rsplit("/", 1)[-1]
        old_path = AVATAR_DIR / old_name
        old_path.unlink(missing_ok=True)

    (AVATAR_DIR / filename).write_bytes(content)

    avatar_url = f"/api/v1/avatars/{filename}"
    current_user.avatar_url = avatar_url
    db.add(current_user)
    db.commit()

    return {"avatar_url": avatar_url}
