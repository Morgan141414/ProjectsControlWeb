from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


from app.models import ai_score, activity, board, certificate, consent, daily_report, notification, org, permission, privacy, project, reporting, support, task, team, token, user  # noqa: E402,F401
