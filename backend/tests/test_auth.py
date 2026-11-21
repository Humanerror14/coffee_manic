"""Test health dan auth."""
from tests.helpers import auth_header, register_user


def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.get_json()["data"]["status"] == "ok"


def test_register_and_login(client):
    res = register_user(client)
    assert res.status_code == 201
    data = res.get_json()["data"]
    assert data["user"]["email"] == "member@example.com"
    assert "access_token" in data

    # email duplikat
    res = register_user(client)
    assert res.status_code == 409


def test_register_validation(client):
    # password pendek
    res = client.post(
        "/api/auth/register",
        json={"email": "x@y.com", "password": "short", "display_name": "X"},
    )
    assert res.status_code == 422

    # email invalid
    res = client.post(
        "/api/auth/register",
        json={"email": "invalid", "password": "password123", "display_name": "X"},
    )
    assert res.status_code == 422


def test_login_wrong_password(client):
    register_user(client)
    res = client.post(
        "/api/auth/login",
        json={"email": "member@example.com", "password": "wrong-password"},
    )
    assert res.status_code == 401


def test_me_requires_auth(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401

    register_user(client)
    headers = auth_header(client)
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200
    assert res.get_json()["data"]["user"]["role"] == "member"
