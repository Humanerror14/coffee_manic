"""Katalog kedai: list, cari, filter, detail."""
from flask import Blueprint, request
from sqlalchemy import or_
from sqlalchemy.orm import selectinload

from app.api.serializers import shop_to_dict
from app.api.utils import fail, ok
from app.extensions import db
from app.models import CoffeeShop, CoffeeProfile, Facility, Atmosphere

bp = Blueprint("catalog", __name__)


def _apply_filters(query, args):
    q = (args.get("q") or "").strip()
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                CoffeeShop.name.ilike(like),
                CoffeeShop.address.ilike(like),
            )
        )

    statuses = args.getlist("verification_status")
    if statuses:
        query = query.filter(CoffeeShop.verification_status.in_(statuses))

    if args.get("active") in ("true", "false"):
        query = query.filter(CoffeeShop.is_active == (args.get("active") == "true"))

    try:
        price_min = int(args["price_min"])
        # Budget minimum: kedai punya harga maksimum di atas nilai ini.
        query = query.filter(CoffeeShop.price_max >= price_min)
    except (KeyError, TypeError, ValueError):
        pass

    try:
        price_max = int(args["price_max"])
        # Budget maksimum: kedai punya harga minimum di bawah/sama nilai ini.
        query = query.filter(CoffeeShop.price_min <= price_max)
    except (KeyError, TypeError, ValueError):
        pass

    atmospheres = args.getlist("atmosphere")
    if atmospheres:
        query = query.filter(
            CoffeeShop.atmospheres.any(Atmosphere.label.in_(atmospheres))
        )

    facilities = args.getlist("facility")
    if facilities:
        query = query.filter(
            CoffeeShop.facilities.any(Facility.label.in_(facilities))
        )

    # Karakter kopi (FR-03): cocokkan jenis kopi atau metode seduh.
    coffee = (args.get("coffee") or "").strip()
    if coffee:
        like = f"%{coffee}%"
        query = query.filter(
            CoffeeShop.coffee_profile.has(
                or_(
                    CoffeeProfile.coffee_type.ilike(like),
                    CoffeeProfile.brew_methods.ilike(like),
                )
            )
        )

    return query


@bp.get("/shops")
def list_shops():
    query = CoffeeShop.query.filter(CoffeeShop.is_active.is_(True))
    query = _apply_filters(query, request.args)

    query = query.options(
        selectinload(CoffeeShop.coffee_profile),
        selectinload(CoffeeShop.atmospheres),
        selectinload(CoffeeShop.facilities),
        selectinload(CoffeeShop.reviews),
        selectinload(CoffeeShop.photos),
    )

    sort = request.args.get("sort", "name")
    if sort == "newest":
        query = query.order_by(CoffeeShop.created_at.desc())
    else:
        query = query.order_by(CoffeeShop.name.asc())

    shops = query.all()
    return ok({"shops": [shop_to_dict(s) for s in shops], "count": len(shops)})


@bp.get("/shops/<shop_id>")
def get_shop(shop_id: str):
    shop = (
        CoffeeShop.query.filter_by(id=shop_id)
        .options(
            selectinload(CoffeeShop.coffee_profile),
            selectinload(CoffeeShop.atmospheres),
            selectinload(CoffeeShop.facilities),
            selectinload(CoffeeShop.reviews),
            selectinload(CoffeeShop.photos),
        )
        .first()
    )
    if shop is None:
        return fail("Kedai tidak ditemukan.", 404)
    return ok({"shop": shop_to_dict(shop)})


@bp.get("/shops/slug/<slug>")
def get_shop_by_slug(slug: str):
    shop = (
        CoffeeShop.query.filter_by(slug=slug)
        .options(
            selectinload(CoffeeShop.coffee_profile),
            selectinload(CoffeeShop.atmospheres),
            selectinload(CoffeeShop.facilities),
            selectinload(CoffeeShop.reviews),
            selectinload(CoffeeShop.photos),
        )
        .first()
    )
    if shop is None:
        return fail("Kedai tidak ditemukan.", 404)
    return ok({"shop": shop_to_dict(shop)})
