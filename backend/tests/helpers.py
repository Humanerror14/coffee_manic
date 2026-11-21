"""Helper test yang diimpor lintas modul test."""


def register_user(
    client, email="member@example.com", password="password123", name="Member"
):
    return client.post(
        "/api/auth/register",
        json={"email": email, "password": password, "display_name": name},
    )


def auth_header(client, email="member@example.com", password="password123"):
    res = client.post(
        "/api/auth/login", json={"email": email, "password": password}
    )
    token = res.get_json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
