from fastapi import APIRouter

<<<<<<< HEAD
from app.api.routes import admin_platform, ai_kpi, audit, auth, avatars, board, consent, daily_reports, notifications, orgs, privacy, profile, project_reports, projects, report_exports, reports, support, tasks, teams, users

api_router = APIRouter()
api_router.include_router(admin_platform.router)
api_router.include_router(auth.router)
api_router.include_router(avatars.router)
api_router.include_router(orgs.router)
api_router.include_router(ai_kpi.router)
api_router.include_router(audit.router)
api_router.include_router(consent.router)
api_router.include_router(notifications.router)
api_router.include_router(privacy.router)
api_router.include_router(profile.router)
api_router.include_router(projects.router)
=======
from app.api.routes import activity, ai_kpi, audit, auth, consent, daily_reports, metrics, notifications, orgs, performance, privacy, profile, project_reports, projects, recordings, report_exports, reports, tasks, teams, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(orgs.router)
api_router.include_router(activity.router)
api_router.include_router(ai_kpi.router)
api_router.include_router(audit.router)
api_router.include_router(consent.router)
api_router.include_router(metrics.router)
api_router.include_router(notifications.router)
api_router.include_router(performance.router)
api_router.include_router(privacy.router)
api_router.include_router(profile.router)
api_router.include_router(projects.router)
api_router.include_router(recordings.router)
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
api_router.include_router(reports.router)
api_router.include_router(daily_reports.router)
api_router.include_router(project_reports.router)
api_router.include_router(report_exports.router)
<<<<<<< HEAD
api_router.include_router(support.router)
api_router.include_router(teams.router)
api_router.include_router(users.router)
api_router.include_router(tasks.router)
api_router.include_router(board.router)
=======
api_router.include_router(teams.router)
api_router.include_router(users.router)
api_router.include_router(tasks.router)
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
