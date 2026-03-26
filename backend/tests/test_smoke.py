<<<<<<< HEAD
"""End-to-end smoke test covering the core workflow."""

API = "/api/v1"


def test_smoke_flow(client):
    admin_payload = {
        "email": "admin@test.local",
        "password": "AdminPass123!",
=======
def test_smoke_flow(client):
    admin_payload = {
        "email": "admin@test.local",
        "password": "AdminPass123",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        "full_name": "Admin User",
    }
    member_payload = {
        "email": "member@test.local",
<<<<<<< HEAD
        "password": "MemberPass123!",
        "full_name": "Member User",
    }

    r = client.post(f"{API}/auth/register", json=admin_payload)
    assert r.status_code == 201
    r = client.post(f"{API}/auth/register", json=member_payload)
    assert r.status_code == 201

    r = client.post(
        f"{API}/auth/login",
=======
        "password": "MemberPass123",
        "full_name": "Member User",
    }

    r = client.post("/auth/register", json=admin_payload)
    assert r.status_code == 201
    r = client.post("/auth/register", json=member_payload)
    assert r.status_code == 201

    r = client.post(
        "/auth/login",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        data={"username": admin_payload["email"], "password": admin_payload["password"]},
    )
    assert r.status_code == 200
    admin_token = r.json()["access_token"]

    r = client.post(
<<<<<<< HEAD
        f"{API}/auth/login",
=======
        "/auth/login",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        data={"username": member_payload["email"], "password": member_payload["password"]},
    )
    assert r.status_code == 200
    member_token = r.json()["access_token"]

    headers = {"Authorization": f"Bearer {admin_token}"}
<<<<<<< HEAD
    r = client.post(f"{API}/orgs", json={"name": "Test Org"}, headers=headers)
=======
    r = client.post("/orgs", json={"name": "Test Org"}, headers=headers)
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
    assert r.status_code == 201
    org = r.json()

    r = client.post(
<<<<<<< HEAD
        f"{API}/orgs/join-request",
=======
        "/orgs/join-request",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        json={"org_code": org["join_code"]},
        headers={"Authorization": f"Bearer {member_token}"},
    )
    assert r.status_code == 201
    join_request = r.json()

    r = client.post(
<<<<<<< HEAD
        f"{API}/orgs/{org['id']}/join-requests/{join_request['id']}/approve",
=======
        f"/orgs/{org['id']}/join-requests/{join_request['id']}/approve",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        headers=headers,
    )
    assert r.status_code == 200

    r = client.post(
<<<<<<< HEAD
        f"{API}/orgs/{org['id']}/projects",
=======
        f"/orgs/{org['id']}/projects",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        json={"name": "Project X", "description": "Demo"},
        headers=headers,
    )
    assert r.status_code == 201
    project = r.json()

    r = client.post(
<<<<<<< HEAD
        f"{API}/orgs/{org['id']}/teams",
=======
        f"/orgs/{org['id']}/teams",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        json={"name": "Team A", "project_id": project["id"]},
        headers=headers,
    )
    assert r.status_code == 201
    team = r.json()

    r = client.post(
<<<<<<< HEAD
        f"{API}/orgs/{org['id']}/teams/{team['id']}/members",
=======
        f"/orgs/{org['id']}/teams/{team['id']}/members",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        json={"user_id": join_request["user_id"]},
        headers=headers,
    )
    assert r.status_code == 200

    r = client.post(
<<<<<<< HEAD
        f"{API}/orgs/{org['id']}/tasks",
=======
        f"/orgs/{org['id']}/tasks",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        json={
            "title": "Task 1",
            "description": "Demo",
            "assignee_id": join_request["user_id"],
            "team_id": team["id"],
        },
        headers=headers,
    )
    assert r.status_code == 201

<<<<<<< HEAD
    r = client.get(f"{API}/orgs/{org['id']}/reports/kpi", headers=headers)
    assert r.status_code == 200

    r = client.get(f"{API}/orgs/{org['id']}/reports/projects/kpi", headers=headers)
    assert r.status_code == 200

    r = client.get(
        f"{API}/orgs/{org['id']}/metrics/users/{join_request['user_id']}",
=======
    r = client.get(
        f"/orgs/{org['id']}/reports/kpi",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        headers=headers,
    )
    assert r.status_code == 200

    r = client.get(
<<<<<<< HEAD
        f"{API}/orgs/{org['id']}/performance/activity-per-task",
=======
        f"/orgs/{org['id']}/reports/projects/kpi",
        headers=headers,
    )
    assert r.status_code == 200

    r = client.get(
        f"/orgs/{org['id']}/metrics/users/{join_request['user_id']}",
        headers=headers,
    )
    assert r.status_code == 200

    r = client.get(
        f"/orgs/{org['id']}/performance/activity-per-task",
>>>>>>> 609163d138e100e3981a912d27f6f5a94e7008cb
        params={"user_id": join_request["user_id"], "project_id": project["id"]},
        headers=headers,
    )
    assert r.status_code == 200
