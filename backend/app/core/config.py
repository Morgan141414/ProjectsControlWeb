import secrets
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_SQLITE_URL = f"sqlite:///{(BASE_DIR / 'data' / 'app.db').as_posix()}"


def _default_secret() -> str:
    """Generate a random secret so the app never starts with a static default."""
    return secrets.token_urlsafe(32)


class Settings(BaseSettings):
    PROJECT_NAME: str = "Productivity Control API"
    DATABASE_URL: str = DEFAULT_SQLITE_URL
    JWT_SECRET_KEY: str = _default_secret()
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    STORAGE_DRIVER: str = "local"
    STORAGE_PATH: str = "./data/recordings"
    MAX_UPLOAD_MB: int = 2048
    RETENTION_DAYS: int = 90
    METRICS_MAX_GAP_SECONDS: int = 300
    EVENTS_RETENTION_DAYS: int = 30
    REPORTS_PATH: str = "./data/reports"
    REPORTS_MAX_EXPORT_MB: int = 50
    REPORTS_WEBHOOK_TIMEOUT_SECONDS: int = 5
    SCHEDULE_TICK_SECONDS: int = 300
    PREVIEWS_PATH: str = "data/previews"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:3000"
    GOOGLE_OAUTH_CLIENT_ID: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)


settings = Settings()
