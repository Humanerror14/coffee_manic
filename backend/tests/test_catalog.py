"""Test katalog, pencarian, dan filter."""
from app.extensions import db
from app.models import Atmosphere, CoffeeProfile, CoffeeShop, Facility


def _make_shop(
    name="Kopi A",
    slug="kopi-a",
    address="Jl. A",
    price_min=10000,
    price_max=30000,
    status="unverified",
    atmospheres=("Tenang",),
    facilities=("Wi-Fi",),
):
    shop = CoffeeShop(
        name=name,
        slug=slug,
        address=address,
        price_min=price_min,
        price_max=price_max,
        verification_status=status,
    )
    db.session.add(shop)
    for label in atmospheres:
        shop.atmospheres.append(_atmosphere(label))
    for label in facilities:
        shop.facilities.append(_facility(label))
    return shop


def _atmosphere(label):
    obj = Atmosphere.query.filter_by(label=label).first()
    if obj is None:
        obj = Atmosphere(label=label)
        db.session.add(obj)
        db.session.flush()
    return obj


def _facility(label):
    obj = Facility.query.filter_by(label=label).first()
    if obj is None:
        obj = Facility(label=label)
        db.session.add(obj)
        db.session.flush()
    return obj


def test_list_and_detail(client, app):
    with app.app_context():
        db.session.add(_make_shop())
        db.session.add(
            _make_shop(
                name="Kopi B",
                slug="kopi-b",
                address="Jl. B",
                price_min=50000,
                price_max=100000,
                status="verified",
                atmospheres=("Ramai",),
                facilities=("Parkir",),
            )
        )
        db.session.commit()

    res = client.get("/api/shops")
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["count"] == 2

    shop_id = data["shops"][0]["id"]
    res = client.get(f"/api/shops/{shop_id}")
    assert res.status_code == 200
    assert res.get_json()["data"]["shop"]["slug"] in ("kopi-a", "kopi-b")


def test_search(client, app):
    with app.app_context():
        db.session.add(_make_shop(name="Kopi Spesial", slug="kopi-spesial", address="Jl. Melati"))
        db.session.add(_make_shop(name="Warkop Biasa", slug="warkop-biasa", address="Jl. Mawar"))
        db.session.commit()

    res = client.get("/api/shops?q=spesial")
    assert res.get_json()["data"]["count"] == 1


def test_filter_price(client, app):
    with app.app_context():
        db.session.add(_make_shop(slug="murah", price_min=5000, price_max=15000))
        db.session.add(_make_shop(slug="mahal", price_min=60000, price_max=120000))
        db.session.commit()

    # harga_max=20000 berarti "cari kedai yang cocok dengan budget ≤ 20000",
    # yaitu kedai dengan price_min <= 20000.
    res = client.get("/api/shops?price_max=20000")
    data = res.get_json()["data"]
    assert data["count"] == 1
    assert data["shops"][0]["slug"] == "murah"


def test_filter_atmosphere_and_facility(client, app):
    with app.app_context():
        db.session.add(_make_shop(slug="cocok", atmospheres=("Tenang",), facilities=("Wi-Fi",)))
        db.session.add(_make_shop(slug="tidak", atmospheres=("Ramai",), facilities=("Parkir",)))
        db.session.commit()

    res = client.get("/api/shops?atmosphere=Tenang&facility=Wi-Fi")
    assert res.get_json()["data"]["count"] == 1
    assert res.get_json()["data"]["shops"][0]["slug"] == "cocok"


def test_filter_coffee_profile(client, app):
    """Filter karakter kopi mencocokkan coffee_type atau brew_methods."""
    with app.app_context():
        sanger = _make_shop(name="Sanger", slug="sanger")
        sanger.coffee_profile = CoffeeProfile(coffee_type="Sanger", brew_methods="Manual")
        v60 = _make_shop(name="V60", slug="v60")
        v60.coffee_profile = CoffeeProfile(coffee_type="Arabika", brew_methods="V60")
        tanpa_profil = _make_shop(name="Biasa", slug="biasa")
        db.session.add_all([sanger, v60, tanpa_profil])
        db.session.commit()

    res = client.get("/api/shops?coffee=Sanger")
    data = res.get_json()["data"]
    assert data["count"] == 1
    assert data["shops"][0]["slug"] == "sanger"

    # Metode seduh juga dicocokkan.
    res = client.get("/api/shops?coffee=V60")
    data = res.get_json()["data"]
    assert data["count"] == 1
    assert data["shops"][0]["slug"] == "v60"

    # Tanpa hasil yang cocok.
    res = client.get("/api/shops?coffee=Tubruk")
    assert res.get_json()["data"]["count"] == 0


def test_inactive_shop_hidden(client, app):
    with app.app_context():
        shop = _make_shop(slug="aktif")
        inactive = _make_shop(slug="nonaktif")
        inactive.is_active = False
        db.session.add_all([shop, inactive])
        db.session.commit()

    res = client.get("/api/shops")
    assert res.get_json()["data"]["count"] == 1
