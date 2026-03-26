from io import BytesIO

from app.models.enums import OrgRole
from app.models.org import OrgMembership
from tests.conftest import API, auth_headers, login_user, register_user


def _register_and_login(client, email: str, full_name: str) -> str:
    register_user(client, email=email, full_name=full_name)
    resp = login_user(client, email=email)
    return resp.json()["access_token"]


def _set_org_role(user_id: str, org_id: str, role: OrgRole) -> None:
    from app.db.session import SessionLocal

    with SessionLocal() as db:
        membership = (
            db.query(OrgMembership)
            .filter(OrgMembership.user_id == user_id, OrgMembership.org_id == org_id)
            .first()
        )
        membership.role = role
        db.commit()


def test_support_member_can_create_chat_with_image_and_admin_can_reply(client):
    admin_token = _register_and_login(client, "admin-support@test.local", "Admin User")
    org_resp = client.post(
        f"{API}/orgs",
        json={"name": "Support Org"},
        headers=auth_headers(admin_token),
    )
    assert org_resp.status_code == 201
    org = org_resp.json()

    member_token = _register_and_login(client, "member-support@test.local", "Member User")
    me_resp = client.get("/api/v1/users/me", headers=auth_headers(member_token))
    member_id = me_resp.json()["id"]

    join_resp = client.post(
        f"{API}/orgs/join-request",
        json={"org_code": org["join_code"]},
        headers=auth_headers(member_token),
    )
    assert join_resp.status_code == 201
    request_id = join_resp.json()["id"]

    approve_resp = client.post(
        f"{API}/orgs/{org['id']}/join-requests/{request_id}/approve",
        headers=auth_headers(admin_token),
    )
    assert approve_resp.status_code == 200

    _set_org_role(member_id, org["id"], OrgRole.member)

    create_thread_resp = client.post(
        f"{API}/orgs/{org['id']}/support/threads",
        data={"subject": "Need access", "body": "I cannot open reports"},
        files={"files": ("issue.png", BytesIO(b"fake-image-data"), "image/png")},
        headers=auth_headers(member_token),
    )
    assert create_thread_resp.status_code == 201
    thread = create_thread_resp.json()
    assert thread["requester_role"] == "member"
    assert thread["messages"][0]["attachments"][0]["content_type"] == "image/png"

    reply_resp = client.post(
        f"{API}/orgs/{org['id']}/support/threads/{thread['id']}/messages",
        data={"body": "Checked. Access has been restored."},
        headers=auth_headers(admin_token),
    )
    assert reply_resp.status_code == 200
    assert reply_resp.json()["author_role"] == "admin"

    thread_resp = client.get(
        f"{API}/orgs/{org['id']}/support/threads/{thread['id']}",
        headers=auth_headers(member_token),
    )
    assert thread_resp.status_code == 200
    data = thread_resp.json()
    assert data["status"] == "answered"
    assert len(data["messages"]) == 2


def test_manager_can_create_chat_but_cannot_answer_someone_else_chat(client):
    admin_token = _register_and_login(client, "admin-manager@test.local", "Admin User")
    org_resp = client.post(
        f"{API}/orgs",
        json={"name": "Mixed Support Org"},
        headers=auth_headers(admin_token),
    )
    org = org_resp.json()

    member_token = _register_and_login(client, "member2@test.local", "Member User")
    member_me = client.get("/api/v1/users/me", headers=auth_headers(member_token))
    member_id = member_me.json()["id"]

    manager_token = _register_and_login(client, "manager-support@test.local", "Manager User")
    manager_me = client.get("/api/v1/users/me", headers=auth_headers(manager_token))
    manager_id = manager_me.json()["id"]

    for token, user_id, role in (
        (member_token, member_id, OrgRole.member),
        (manager_token, manager_id, OrgRole.manager),
    ):
        join_resp = client.post(
            f"{API}/orgs/join-request",
            json={"org_code": org["join_code"]},
            headers=auth_headers(token),
        )
        request_id = join_resp.json()["id"]
        client.post(
            f"{API}/orgs/{org['id']}/join-requests/{request_id}/approve",
            headers=auth_headers(admin_token),
        )
        _set_org_role(user_id, org["id"], role)

    create_thread_resp = client.post(
        f"{API}/orgs/{org['id']}/support/threads",
        data={"subject": "Member issue", "body": "Need support"},
        headers=auth_headers(member_token),
    )
    thread = create_thread_resp.json()

    forbidden_resp = client.get(
        f"{API}/orgs/{org['id']}/support/threads/{thread['id']}",
        headers=auth_headers(manager_token),
    )
    assert forbidden_resp.status_code == 403

    manager_create_resp = client.post(
        f"{API}/orgs/{org['id']}/support/threads",
        data={"subject": "Manager issue", "body": "Need admin help"},
        headers=auth_headers(manager_token),
    )
    assert manager_create_resp.status_code == 201
