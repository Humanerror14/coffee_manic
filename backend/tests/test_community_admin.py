"""Test rating, ulasan, dan admin."""
from types import SimpleNamespace

from app.api.serializers import photo_to_dict, source_to_dict
from app.extensions import db
from app.models import CoffeeShop
from tests.helpers import auth_header, register_user


def _shop(app, slug="kopi-test"):
    with app.app_context():
        shop = CoffeeShop(name="Kopi Test", slug=slug)
        db.session.add(shop)
        db.session.commit()
        return shop.id


def _make_admin(app):
    from werkzeug.security import generate_password_hash

    from app.models import User

    with app.app_context():
        admin = User(
            email="admin@test.com",
            password_hash=generate_password_hash("password123"),
            display_name="Admin",
            role="admin",
        )
        db.session.add(admin)
        db.session.commit()
        return admin.id


def test_review_flow(client, app):
    shop_id = _shop(app)

    # belum login
    res = client.post(f"/api/shops/{shop_id}/reviews", json={"coffee_quality": 5})
    assert res.status_code == 401

    register_user(client)
    headers = auth_header(client)

    res = client.post(
        f"/api/shops/{shop_id}/reviews",
        json={"coffee_quality": 5, "atmosphere": 4, "body": "Enak"},
        headers=headers,
    )
    assert res.status_code == 201
    assert res.get_json()["data"]["review"]["moderation_status"] == "pending"

    # duplikat
    res = client.post(
        f"/api/shops/{shop_id}/reviews",
        json={"coffee_quality": 3},
        headers=headers,
    )
    assert res.status_code == 409

    # ulasan belum disetujui tidak tampil publik
    res = client.get(f"/api/shops/{shop_id}/reviews")
    assert res.get_json()["data"]["reviews"] == []


def test_rating_out_of_range(client, app):
    shop_id = _shop(app)
    register_user(client)
    headers = auth_header(client)

    res = client.post(
        f"/api/shops/{shop_id}/reviews",
        json={"coffee_quality": 6},
        headers=headers,
    )
    assert res.status_code == 422

    res = client.post(
        f"/api/shops/{shop_id}/reviews",
        json={"coffee_quality": 0},
        headers=headers,
    )
    assert res.status_code == 422


def test_photo_url_rejects_unsafe_schemes_and_traversal(client, app):
    shop_id = _shop(app)
    register_user(client)
    headers = auth_header(client)

    for image_url in (
        "javascript:alert(1)",
        "file:///etc/passwd",
        "//example.com/image.jpg",
        "/assets/../.env",
        "/assets/%252e%252e/.env",
        "/assets/%252e%252e%255c.env",
        "/assets/%0a.env",
    ):
        response = client.post(
            f"/api/shops/{shop_id}/photos",
            json={"image_url": image_url},
            headers=headers,
        )
        assert response.status_code == 422, image_url

    for image_url in (
        "https://images.example.com/coffee.jpg",
        "/assets/placeholders/coffee.jpg",
    ):
        response = client.post(
            f"/api/shops/{shop_id}/photos",
            json={"image_url": image_url},
            headers=headers,
        )
        assert response.status_code == 201, image_url


def test_admin_source_url_rejects_unsafe_schemes(client, app):
    shop_id = _shop(app)
    _make_admin(app)
    headers = auth_header(client, email="admin@test.com")

    for source_url in (
        "javascript:alert(1)",
        "file:///etc/passwd",
        "//example.com",
    ):
        response = client.post(
            f"/api/admin/shops/{shop_id}/sources",
            json={"source_type": "website", "source_url": source_url},
            headers=headers,
        )
        assert response.status_code == 422, source_url

    response = client.post(
        f"/api/admin/shops/{shop_id}/sources",
        json={
            "source_type": "website",
            "source_url": "https://example.com/source",
        },
        headers=headers,
    )
    assert response.status_code == 201


def test_serializers_hide_unsafe_existing_urls():
    photo = SimpleNamespace(
        id="photo-id",
        shop_id="shop-id",
        uploaded_by=None,
        image_url="javascript:alert(1)",
        usage_rights_note=None,
        moderation_status="approved",
        created_at=None,
    )
    source = SimpleNamespace(
        id="source-id",
        shop_id="shop-id",
        source_type="website",
        source_name=None,
        source_url="file:///etc/passwd",
        checked_at=None,
        verification_status="verified",
        notes=None,
    )

    assert photo_to_dict(photo)["image_url"] is None
    assert source_to_dict(source)["source_url"] is None


def test_admin_required_for_moderation(client, app):
    shop_id = _shop(app)
    register_user(client)
    headers = auth_header(client)
    res = client.post(
        f"/api/shops/{shop_id}/reviews",
        json={"coffee_quality": 5},
        headers=headers,
    )
    review_id = res.get_json()["data"]["review"]["id"]

    # member tidak bisa moderasi
    res = client.patch(
        f"/api/admin/reviews/{review_id}",
        json={"moderation_status": "approved"},
        headers=headers,
    )
    assert res.status_code == 403

    # admin bisa
    _make_admin(app)
    admin_headers = auth_header(client, email="admin@test.com")
    res = client.patch(
        f"/api/admin/reviews/{review_id}",
        json={"moderation_status": "approved"},
        headers=admin_headers,
    )
    assert res.status_code == 200
    assert res.get_json()["data"]["review"]["moderation_status"] == "approved"


def test_admin_shop_crud(client, app):
    _make_admin(app)
    headers = auth_header(client, email="admin@test.com")

    # buat
    res = client.post(
        "/api/admin/shops",
        json={"name": "Kedai Admin", "price_min": 10000, "price_max": 20000},
        headers=headers,
    )
    assert res.status_code == 201
    shop = res.get_json()["data"]["shop"]
    assert shop["slug"] == "kedai-admin"

    # update
    res = client.patch(
        f"/api/admin/shops/{shop['id']}",
        json={"verification_status": "verified"},
        headers=headers,
    )
    assert res.status_code == 200
    assert res.get_json()["data"]["shop"]["verification_status"] == "verified"

    # harga invalid
    res = client.patch(
        f"/api/admin/shops/{shop['id']}",
        json={"price_min": 50000, "price_max": 10000},
        headers=headers,
    )
    assert res.status_code == 422
