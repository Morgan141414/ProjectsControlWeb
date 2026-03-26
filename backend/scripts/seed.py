import argparse
<<<<<<< HEAD
from datetime import date
=======
from datetime import date, timedelta
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.security import hash_password
<<<<<<< HEAD
from app.db.session import SessionLocal
from app.models.enums import OrgRole, TaskStatus
=======
from app.core.time import utc_now_naive
from app.db.session import SessionLocal
from app.models.activity import ActivityEvent, ScreenSession
from app.models.enums import ActivityType, OrgRole, SessionStatus, TaskStatus
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
from app.models.org import OrgMembership, Organization
from app.models.project import Project
from app.models.task import Task
from app.models.team import Team, TeamMembership
from app.models.user import User
<<<<<<< HEAD
=======
from app.utils.ids import new_id
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb


def get_or_create_user(db: Session, email: str, full_name: str, password: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        return user
    user = User(
        email=email,
        full_name=full_name,
        hashed_password=hash_password(password),
    )
    db.add(user)
    db.flush()
    return user


def seed(db: Session) -> dict[str, str]:
    org = Organization(name="Demo Org")
    db.add(org)
    db.flush()

    admin = get_or_create_user(db, "admin@example.com", "Admin User", "AdminPass123")
    manager = get_or_create_user(db, "manager@example.com", "Manager User", "ManagerPass123")
    member = get_or_create_user(db, "member@example.com", "Member User", "MemberPass123")

    db.add_all(
        [
<<<<<<< HEAD
            OrgMembership(org_id=org.id, user_id=admin.id, role=OrgRole.ceo),
            OrgMembership(org_id=org.id, user_id=manager.id, role=OrgRole.developer),
=======
            OrgMembership(org_id=org.id, user_id=admin.id, role=OrgRole.admin),
            OrgMembership(org_id=org.id, user_id=manager.id, role=OrgRole.manager),
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
            OrgMembership(org_id=org.id, user_id=member.id, role=OrgRole.member),
        ]
    )

    project = Project(org_id=org.id, name="Project Alpha", description="Seed project")
    db.add(project)
    db.flush()

    team = Team(org_id=org.id, project_id=project.id, name="Alpha Team")
    db.add(team)
    db.flush()

    db.add_all(
        [
            TeamMembership(team_id=team.id, user_id=admin.id),
            TeamMembership(team_id=team.id, user_id=manager.id),
            TeamMembership(team_id=team.id, user_id=member.id),
        ]
    )

    today = date.today()
    tasks = [
        Task(
            org_id=org.id,
            team_id=team.id,
            assignee_id=member.id,
            title="Setup dev environment",
            description="Install dependencies and run the API",
            status=TaskStatus.in_progress,
            due_date=today,
        ),
        Task(
            org_id=org.id,
            team_id=team.id,
            assignee_id=member.id,
            title="Review onboarding docs",
            description="Read architecture and API docs",
            status=TaskStatus.done,
            due_date=today,
            report="Reviewed docs",
        ),
    ]
    db.add_all(tasks)

<<<<<<< HEAD
=======
    session = ScreenSession(
        org_id=org.id,
        user_id=member.id,
        status=SessionStatus.active,
        started_at=utc_now_naive() - timedelta(hours=2),
        device_name="Workstation",
        os_name="Windows",
    )
    db.add(session)
    db.flush()

    events = []
    base = session.started_at
    for index in range(6):
        events.append(
            ActivityEvent(
                session_id=session.id,
                org_id=org.id,
                user_id=member.id,
                event_type=ActivityType.app,
                captured_at=base + timedelta(minutes=index * 10),
                app_name="VS Code",
                window_title="ProjectsControl",
            )
        )
    events.append(
        ActivityEvent(
            session_id=session.id,
            org_id=org.id,
            user_id=member.id,
            event_type=ActivityType.idle,
            captured_at=base + timedelta(minutes=70),
            idle_seconds=300,
        )
    )
    db.add_all(events)

>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
    return {
        "org_id": org.id,
        "join_code": org.join_code,
        "project_id": project.id,
        "team_id": team.id,
        "admin_email": admin.email,
        "manager_email": manager.email,
        "member_email": member.email,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Delete all rows before seeding")
    args = parser.parse_args()

    with SessionLocal() as db:
        if args.reset:
            for table in [
<<<<<<< HEAD
=======
                "activity_events",
                "screen_sessions",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
                "tasks",
                "team_memberships",
                "teams",
                "projects",
                "org_memberships",
                "organizations",
                "users",
            ]:
                db.execute(text(f"DELETE FROM {table}"))
        info = seed(db)
        db.commit()

    print("Seed completed:")
    for key, value in info.items():
        print(f"- {key}: {value}")


if __name__ == "__main__":
    main()
