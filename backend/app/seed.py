"""Seed data contoh.

PERHATIAN: seluruh data kedai di sini adalah MOCK berlabel (bukan data
nyata). Ini sesuai aturan produk "jangan mengarang data kedai nyata".
"""
import os

from flask import current_app
from werkzeug.security import generate_password_hash

from app.extensions import db
from app.models import (
    Atmosphere,
    CoffeeProfile,
    CoffeeShop,
    DataSource,
    Facility,
    User,
)


def run_seed():
    if (
        not current_app.config.get("DEBUG")
        and not current_app.config.get("TESTING")
    ):
        raise RuntimeError(
            "Data seed contoh hanya boleh dimuat di development atau test."
        )

    # ── Admin dev ───────────────────────────────────────────────
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@coffeemanic.local")
    if User.query.filter_by(email=admin_email).first() is None:
        db.session.add(
            User(
                email=admin_email,
                password_hash=generate_password_hash(
                    os.environ.get("ADMIN_PASSWORD", "change-me-admin")
                ),
                display_name="Admin Coffee Manic",
                role="admin",
            )
        )

    # ── Taksonomi ───────────────────────────────────────────────
    for label in (
        "Tenang",
        "Santai",
        "Ramai",
        "Ruang Kerja",
        "Outdoor",
        "Instagramable",
    ):
        if Atmosphere.query.filter_by(label=label).first() is None:
            db.session.add(Atmosphere(label=label))

    for label in ("Wi-Fi", "Stopkontak", "Toilet", "Parkir", "Musala", "AC"):
        if Facility.query.filter_by(label=label).first() is None:
            db.session.add(Facility(label=label))

    db.session.flush()

    # ── Kedai mock ──────────────────────────────────────────────
    mock_shops = [
        {
            "name": "Kopi Lhoksukon (contoh)",
            "slug": "kopi-lhoksukon-contoh",
            "address": "Jl. Contoh No. 1, Lhoksukon (mock)",
            "price_min": 15000,
            "price_max": 35000,
            "opening_hours": "08.00–22.00",
            "verification_status": "pending",
            "atmospheres": ["Tenang", "Ruang Kerja"],
            "facilities": ["Wi-Fi", "Stopkontak", "Toilet"],
            "coffee_profile": {
                "coffee_type": "Arabika Gayo",
                "bean_origin": "Aceh (contoh)",
                "roast_level": "Medium",
                "brew_methods": "V60, Espresso",
                "signature_drinks": "Kopi susu gula aren (contoh)",
            },
            "source": {
                "source_type": "mock",
                "source_name": "Seed mock",
                "notes": "Data contoh, bukan data nyata.",
            },
        },
        {
            "name": "Warkop Tepi Jalan (contoh)",
            "slug": "warkop-tepi-jalan-contoh",
            "address": "Jl. Contoh No. 2, Lhoksukon (mock)",
            "price_min": 8000,
            "price_max": 20000,
            "opening_hours": "06.00–24.00",
            "verification_status": "unverified",
            "atmospheres": ["Ramai", "Santai"],
            "facilities": ["Parkir", "Toilet"],
            "coffee_profile": {
                "coffee_type": "Robusta",
                "bean_origin": "Belum diketahui",
                "roast_level": "Dark",
                "brew_methods": "Tubruk",
                "signature_drinks": "Kopi tubruk (contoh)",
            },
            "source": {
                "source_type": "mock",
                "source_name": "Seed mock",
                "notes": "Data contoh, bukan data nyata.",
            },
        },
    ]

    for item in mock_shops:
        if CoffeeShop.query.filter_by(slug=item["slug"]).first() is not None:
            continue
        shop = CoffeeShop(
            name=item["name"],
            slug=item["slug"],
            address=item["address"],
            price_min=item["price_min"],
            price_max=item["price_max"],
            opening_hours=item["opening_hours"],
            verification_status=item["verification_status"],
        )
        db.session.add(shop)
        db.session.flush()

        profile = CoffeeProfile(shop_id=shop.id, **item["coffee_profile"])
        db.session.add(profile)

        for label in item["atmospheres"]:
            shop.atmospheres.append(Atmosphere.query.filter_by(label=label).first())
        for label in item["facilities"]:
            shop.facilities.append(Facility.query.filter_by(label=label).first())

        src = item["source"]
        db.session.add(
            DataSource(
                shop_id=shop.id,
                source_type=src["source_type"],
                source_name=src["source_name"],
                notes=src["notes"],
                verification_status="unverified",
            )
        )

    db.session.commit()
