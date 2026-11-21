"""Regresi rate limiting: kuota, waktu, isolasi, dan pengecualian API."""
from concurrent.futures import ThreadPoolExecutor

import pytest

from app import create_app
from app.rate_limiter import RateLimiter


@pytest.fixture()
def clock(monkeypatch):
    now = [1000.0]
    monkeypatch.setattr("app.rate_limiter.time.monotonic", lambda: now[0])
    return now


@pytest.fixture()
def active_limiter(app):
    app.config["RATELIMIT_ENABLED"] = True
    limiter = app.extensions["rate_limiter"]
    limiter.configure(5)
    return limiter


def test_rate_limiter(client, active_limiter, clock):
    for _ in range(5):
        assert client.get("/api/shops").status_code == 200

    response = client.get("/api/shops")
    assert response.status_code == 429
    assert response.get_json()["error"] == {
        "message": "Batas request per menit terlampaui. Silakan tunggu beberapa saat.",
        "status": 429,
    }
    assert response.headers["Retry-After"] == "60"

    clock[0] += 10.2
    assert client.get("/api/shops").headers["Retry-After"] == "50"

    clock[0] = 1060.0
    assert client.get("/api/shops").status_code == 200


def test_sliding_window_does_not_extend_on_rejection(clock):
    limiter = RateLimiter(2)
    assert limiter.hit("ip") == (False, 1, 0)
    clock[0] += 30
    assert limiter.hit("ip") == (False, 0, 0)
    assert limiter.hit("ip") == (True, 0, 30)
    clock[0] += 30
    assert limiter.hit("ip") == (False, 0, 0)
    assert limiter.hit("ip") == (True, 0, 30)


def test_different_ips_have_separate_quotas(client, active_limiter):
    active_limiter.configure(1)
    assert client.get("/api/shops").status_code == 200
    assert client.get("/api/shops").status_code == 429
    assert client.get(
        "/api/shops", environ_overrides={"REMOTE_ADDR": "192.0.2.1"}
    ).status_code == 200


def test_untrusted_forwarded_header_cannot_bypass_limit(client, active_limiter):
    active_limiter.configure(1)
    assert client.get("/api/shops").status_code == 200
    assert client.get(
        "/api/shops", headers={"X-Forwarded-For": "192.0.2.2"}
    ).status_code == 429


@pytest.mark.parametrize("path,method,status", [
    ("/api/health", "GET", 200),
    ("/api/shops", "OPTIONS", 200),
    ("/not-an-api", "GET", 404),
])
def test_exempt_requests_do_not_consume_quota(
    client, active_limiter, path, method, status
):
    active_limiter.configure(1)
    assert client.open(path, method=method).status_code == status
    assert client.get("/api/shops").status_code == 200
    assert client.open(path, method=method).status_code == status
    assert client.get("/api/shops").status_code == 429


def test_unknown_health_path_is_limited(client, active_limiter):
    active_limiter.configure(1)
    assert client.get("/api/health-extra").status_code == 404
    assert client.get("/api/health-extra").status_code == 429


def test_testing_disables_limiter_by_default(client, app):
    app.extensions["rate_limiter"].configure(1)
    for _ in range(3):
        assert client.get("/api/shops").status_code == 200


def test_enabled_outside_testing(client, app):
    app.config["TESTING"] = False
    app.extensions["rate_limiter"].configure(1)
    assert client.get("/api/shops").status_code == 200
    assert client.get("/api/shops").status_code == 429


def test_app_instances_have_separate_state_and_configuration(app, client):
    app.config["RATELIMIT_ENABLED"] = True
    app.extensions["rate_limiter"].configure(1)
    assert client.get("/api/shops").status_code == 200

    other_app = create_app("testing")
    other_app.config["RATELIMIT_ENABLED"] = True
    other_limiter = other_app.extensions["rate_limiter"]
    assert other_limiter.requests_per_minute == other_app.config["RATE_LIMIT_PER_MINUTE"]
    other_limiter.configure(2)

    # Path tak dikenal tetap dihitung, tanpa akses database instance kedua.
    other_client = other_app.test_client()
    assert other_client.get("/api/missing").status_code == 404
    assert other_client.get("/api/missing").status_code == 404
    assert other_client.get("/api/missing").status_code == 429
    assert client.get("/api/shops").status_code == 429


def test_expired_inactive_ips_are_cleaned_up(clock):
    limiter = RateLimiter(1)
    limiter.hit("inactive")
    clock[0] += 30
    limiter.hit("active")
    clock[0] += 30
    limiter.hit("new")
    assert "inactive" not in limiter._hits
    assert set(limiter._hits) == {"active", "new"}


def test_concurrent_requests_cannot_exceed_quota():
    limiter = RateLimiter(5)
    with ThreadPoolExecutor(max_workers=8) as pool:
        results = list(pool.map(lambda _: limiter.hit("ip"), range(30)))
    assert sum(not limited for limited, _, _ in results) == 5


def test_clear_single_ip_and_all(clock):
    limiter = RateLimiter(1)
    limiter.hit("first")
    limiter.hit("second")
    limiter.clear("first")
    assert limiter.hit("first") == (False, 0, 0)
    assert limiter.hit("second") == (True, 0, 60)
    limiter.clear()
    assert limiter.hit("second") == (False, 0, 0)
