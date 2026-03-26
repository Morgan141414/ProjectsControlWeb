from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, get_org_membership, require_role, MANAGEMENT_ROLES
from app.models.enums import TaskStatus
from app.models.project import Project
from app.models.task import Task
from app.models.team import Team, TeamMembership
from app.models.user import User
from app.schemas.project_reports import ProjectKPIItem, ProjectKPIReport

router = APIRouter(prefix="/orgs/{org_id}/reports/projects", tags=["reports"])


def _apply_task_date_filter(query, start_date: date | None, end_date: date | None):
    if start_date:
        query = query.filter(Task.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(Task.created_at <= datetime.combine(end_date, datetime.max.time()))
    return query


def compute_project_kpi_report(
    db: Session,
    org_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
) -> ProjectKPIReport:
    projects = db.query(Project).filter(Project.org_id == org_id).order_by(Project.name).all()

    report_items: list[ProjectKPIItem] = []

    for project in projects:
        teams = db.query(Team).filter(Team.project_id == project.id).all()
        team_ids = [team.id for team in teams]

        team_members = (
            db.query(TeamMembership)
            .filter(TeamMembership.team_id.in_(team_ids))
            .all()
            if team_ids
            else []
        )
        user_ids = {row.user_id for row in team_members}

        tasks_query = db.query(Task).filter(Task.org_id == org_id, Task.team_id.in_(team_ids) if team_ids else False)
        tasks_query = _apply_task_date_filter(tasks_query, start_date, end_date)
        tasks = tasks_query.all()

        tasks_total = len(tasks)
        tasks_done = sum(1 for task in tasks if task.status == TaskStatus.done)
        completion_rate = (tasks_done / tasks_total) if tasks_total else 0.0

        report_items.append(
            ProjectKPIItem(
                project_id=project.id,
                project_name=project.name,
                teams_count=len(teams),
                users_count=len(user_ids),
                sessions_count=0,
                total_events=0,
                observed_seconds=0,
                idle_seconds=0,
                active_seconds=0,
                tasks_total=tasks_total,
                tasks_done=tasks_done,
                completion_rate=completion_rate,
            )
        )

    return ProjectKPIReport(org_id=org_id, start_date=start_date, end_date=end_date, projects=report_items)


@router.get("/kpi", response_model=ProjectKPIReport)
def project_kpi_report(
    org_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectKPIReport:
    membership = get_org_membership(org_id, current_user, db)
    require_role(membership, MANAGEMENT_ROLES)

    return compute_project_kpi_report(
        db,
        org_id=org_id,
        start_date=start_date,
        end_date=end_date,
    )
