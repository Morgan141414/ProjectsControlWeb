from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.core.config import settings
from app.core.retention import cleanup_activity_events, cleanup_recordings
from app.core.scheduler import shutdown_scheduler, start_scheduler
from app.db.base import Base
from app.db.session import SessionLocal, engine

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        deleted_recordings = cleanup_recordings(db)
        deleted_events = cleanup_activity_events(db)
        if deleted_recordings or deleted_events:
            db.commit()
    start_scheduler()


@app.on_event("shutdown")
def on_shutdown() -> None:
    shutdown_scheduler()


@app.get("/")
def root() -> dict:
    return {"status": "ok"}


app.include_router(api_router)
