from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db, get_org_membership, require_role, MANAGEMENT_ROLES
from app.models.enums import TaskStatus
from app.models.task import Task
from app.models.team import Team, TeamMembership
from app.models.user import User
from app.schemas.reports import KPIOrgReport, KPITeamRow, KPIUserRow

router = APIRouter(prefix="/orgs/{org_id}/reports", tags=["reports"])


def _apply_task_date_filter(query, start_date: date | None, end_date: date | None):
    if start_date:
        query = query.filter(Task.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        query = query.filter(Task.created_at <= datetime.combine(end_date, datetime.max.time()))
    return query


def compute_org_kpi_report(
    db: Session,
    org_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
    team_id: str | None = None,
    project_id: str | None = None,
) -> KPIOrgReport:
    user_rows: dict[str, KPIUserRow] = {}

    tasks_query = db.query(Task).filter(Task.org_id == org_id, Task.assignee_id.isnot(None))
    tasks_query = _apply_task_date_filter(tasks_query, start_date, end_date)
    if team_id:
        tasks_query = tasks_query.filter(Task.team_id == team_id)
    if project_id:
        tasks_query = tasks_query.join(Team, Team.id == Task.team_id).filter(Team.project_id == project_id)
    tasks = tasks_query.all()

    for task in tasks:
        row = user_rows.get(task.assignee_id)
        if not row:
            user = db.get(User, task.assignee_id)
            full_name = user.full_name if user else task.assignee_id
            row = KPIUserRow(
                user_id=task.assignee_id,
                full_name=full_name,
                sessions_count=0,
                total_events=0,
                observed_seconds=0,
                idle_seconds=0,
                active_seconds=0,
                tasks_total=0,
                tasks_done=0,
                completion_rate=0.0,
            )
            user_rows[task.assignee_id] = row

        row.tasks_total += 1
        if task.status == TaskStatus.done:
            row.tasks_done += 1

    for row in user_rows.values():
        if row.tasks_total:
            row.completion_rate = row.tasks_done / row.tasks_total

    users = sorted(user_rows.values(), key=lambda item: item.tasks_done, reverse=True)

    team_rows: dict[str, KPITeamRow] = {}
    teams_query = db.query(Team).filter(Team.org_id == org_id)
    if team_id:
        teams_query = teams_query.filter(Team.id == team_id)
    if project_id:
        teams_query = teams_query.filter(Team.project_id == project_id)
    teams = teams_query.all()
    for team in teams:
        team_rows[team.id] = KPITeamRow(
            team_id=team.id,
            team_name=team.name,
            users_count=0,
            sessions_count=0,
            total_events=0,
            observed_seconds=0,
            idle_seconds=0,
            active_seconds=0,
            tasks_total=0,
            tasks_done=0,
            completion_rate=0.0,
        )

    team_members_query = (
        db.query(TeamMembership)
        .join(Team, TeamMembership.team_id == Team.id)
        .filter(Team.org_id == org_id)
    )
    if team_id:
        team_members_query = team_members_query.filter(TeamMembership.team_id == team_id)
    if project_id:
        team_members_query = team_members_query.filter(Team.project_id == project_id)
    team_members = team_members_query.all()
    team_map: dict[str, list[str]] = {}
    for membership_row in team_members:
        team_map.setdefault(membership_row.team_id, []).append(membership_row.user_id)

    for tid, team_row in team_rows.items():
        users_in_team = set(team_map.get(tid, []))
        team_row.users_count = len(users_in_team)
        for uid in users_in_team:
            user_row = user_rows.get(uid)
            if not user_row:
                continue
            team_row.tasks_total += user_row.tasks_total
            team_row.tasks_done += user_row.tasks_done
        if team_row.tasks_total:
            team_row.completion_rate = team_row.tasks_done / team_row.tasks_total

    teams_report = sorted(team_rows.values(), key=lambda item: item.tasks_done, reverse=True)

    total_users = len(user_rows)
    tasks_total = sum(row.tasks_total for row in user_rows.values())
    tasks_done = sum(row.tasks_done for row in user_rows.values())
    completion_rate = (tasks_done / tasks_total) if tasks_total else 0.0

    return KPIOrgReport(
        org_id=org_id,
        start_date=start_date,
        end_date=end_date,
        total_users=total_users,
        total_sessions=0,
        total_events=0,
        observed_seconds=0,
        idle_seconds=0,
        active_seconds=0,
        tasks_total=tasks_total,
        tasks_done=tasks_done,
        completion_rate=completion_rate,
        users=users,
        teams=teams_report,
    )


@router.get("/kpi", response_model=KPIOrgReport)
def kpi_report(
    org_id: str,
    start_date: date | None = None,
    end_date: date | None = None,
    team_id: str | None = None,
    project_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> KPIOrgReport:
    membership = get_org_membership(org_id, current_user, db)
    require_role(membership, MANAGEMENT_ROLES)

    return compute_org_kpi_report(
        db,
        org_id=org_id,
        start_date=start_date,
        end_date=end_date,
        team_id=team_id,
        project_id=project_id,
    )
