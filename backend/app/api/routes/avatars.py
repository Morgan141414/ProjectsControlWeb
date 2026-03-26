"""Serve avatar images."""

from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse

from app.core.config import settings

router = APIRouter(prefix="/avatars", tags=["avatars"])

AVATAR_DIR = Path(settings.STORAGE_PATH).parent / "avatars"


@router.get("/{filename}")
def get_avatar(filename: str):
    # Prevent directory traversal
    safe_name = Path(filename).name
    path = AVATAR_DIR / safe_name
    if not path.exists() or not path.is_file():
        return JSONResponse(status_code=404, content={"detail": "Not found"})
    return FileResponse(path)
