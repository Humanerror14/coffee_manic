"""Dashboard admin: CRUD kedai, verifikasi, moderasi."""
import re

from flask import Blueprint, request

from app.api.decorators import admin_required
from app.api.serializers import (
    report_to_dict,
    review_to_dict,
    shop_to_dict,
    source_to_dict,
)
from app.api.utils import fail, is_safe_web_url, ok
from app.extensions import db
from app.models import (
    Atmosphere,
    CoffeeProfile,
    CoffeeShop,
    DataSource,
    Facility,
    Report,
    Review,
    ShopPhoto,
)

bp = Blueprint("admin", __name__)

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
VERIFICATION_STATUSES = ("unverified", "pending", "verified", "needs_review")
SOURCE_STATUSES = ("unverified", "pending", "verified", "rejected")
MODERATION_STATUSES = ("pending", "approved", "rejected")
REPORT_STATUSES = ("open", "resolved", "dismissed")


def _slugify(name: str) -> str:
    slug = name.strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug


def _unique_slug(base: str, exclude_id: str | None = None) -> str:
    slug = base
    n = 1
    while True:
        q = CoffeeShop.query.filter_by(slug=slug)
        if exclude_id:
            q = q.filter(CoffeeShop.id != exclude_id)
        if q.first() is None:
            return slug
        n += 1
        slug = f"{base}-{n}"


def _get_label_set(model, labels):
    """Kembalikan list instance model untuk label-label (buat jika belum ada)."""
    instances = []
    for label in labels:
        label = label.strip()
        if not label:
            continue
        obj = model.query.filter_by(label=label).first()
        if obj is None:
            obj = model(label=label)
            db.session.add(obj)
            db.session.flush()
        instances.append(obj)
    return instances


def _apply_shop_payload(shop: CoffeeShop, data: dict):
    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return "name tidak boleh kosong."
        shop.name = name
        if not shop.slug:
            shop.slug = _unique_slug(_slugify(name))

    for field in (
        "address",
        "phone_public",
        "opening_hours",
    ):
        if field in data:
            setattr(shop, field, (data.get(field) or "").strip() or None)

    for field in ("latitude", "longitude"):
        if field in data:
            value = data.get(field)
            if value in (None, ""):
                setattr(shop, field, None)
            else:
                try:
                    setattr(shop, field, float(value))
                except (TypeError, ValueError):
                    return f"{field} harus berupa angka."

    for field in ("price_min", "price_max"):
        if field in data:
            value = data.get(field)
            if value in (None, ""):
                setattr(shop, field, None)
            else:
                try:
                    value = int(value)
                except (TypeError, ValueError):
                    return f"{field} harus berupa bilangan bulat."
                if value < 0:
                    return f"{field} tidak boleh negatif."
                setattr(shop, field, value)

    if shop.price_min is not None and shop.price_max is not None:
        if shop.price_max < shop.price_min:
            return "price_max tidak boleh di bawah price_min."

    if "is_active" in data:
        shop.is_active = bool(data.get("is_active"))

    if "verification_status" in data:
        status = data.get("verification_status")
        if status not in VERIFICATION_STATUSES:
            return f"verification_status harus salah satu dari {VERIFICATION_STATUSES}."
        shop.verification_status = status

    if "atmospheres" in data:
        shop.atmospheres = _get_label_set(Atmosphere, data["atmospheres"])

    if "facilities" in data:
        shop.facilities = _get_label_set(Facility, data["facilities"])

    if "coffee_profile" in data and isinstance(data["coffee_profile"], dict):
        profile = shop.coffee_profile
        if profile is None:
            profile = CoffeeProfile(shop_id=shop.id)
            db.session.add(profile)
            shop.coffee_profile = profile
        cp = data["coffee_profile"]
        for field in (
            "coffee_type",
            "bean_origin",
            "roast_level",
            "brew_methods",
            "signature_drinks",
        ):
            if field in cp:
                setattr(profile, field, (cp.get(field) or "").strip() or None)

    return None


@bp.get("/admin/shops")
@admin_required
def list_shops():
    query = CoffeeShop.query
    status = request.args.get("verification_status")
    if status:
        query = query.filter_by(verification_status=status)
    shops = query.order_by(CoffeeShop.created_at.desc()).all()
    return ok({"shops": [shop_to_dict(s) for s in shops], "count": len(shops)})


@bp.post("/admin/shops")
@admin_required
def create_shop():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        return fail("name wajib diisi.", 422)

    slug = (data.get("slug") or "").strip()
    if slug:
        if not SLUG_RE.match(slug):
            return fail("slug hanya boleh huruf kecil, angka, dan tanda hubung.", 422)
        if CoffeeShop.query.filter_by(slug=slug).first():
            return fail("slug sudah dipakai.", 409)
    else:
        slug = _unique_slug(_slugify(name))

    shop = CoffeeShop(name=name, slug=slug)
    db.session.add(shop)
    err = _apply_shop_payload(shop, data)
    if err:
        db.session.rollback()
        return fail(err, 422)
    db.session.commit()
    return ok({"shop": shop_to_dict(shop)}, status=201)


@bp.get("/admin/shops/<shop_id>")
@admin_required
def get_shop(shop_id: str):
    shop = db.session.get(CoffeeShop, shop_id)
    if shop is None:
        return fail("Kedai tidak ditemukan.", 404)
    return ok({"shop": shop_to_dict(shop)})


@bp.patch("/admin/shops/<shop_id>")
@admin_required
def update_shop(shop_id: str):
    shop = db.session.get(CoffeeShop, shop_id)
    if shop is None:
        return fail("Kedai tidak ditemukan.", 404)
    data = request.get_json(silent=True) or {}
    if "slug" in data:
        slug = (data.get("slug") or "").strip()
        if not SLUG_RE.match(slug):
            return fail("slug hanya boleh huruf kecil, angka, dan tanda hubung.", 422)
        existing = CoffeeShop.query.filter_by(slug=slug).filter(
            CoffeeShop.id != shop.id
        ).first()
        if existing:
            return fail("slug sudah dipakai.", 409)
        shop.slug = slug

    err = _apply_shop_payload(shop, data)
    if err:
        db.session.rollback()
        return fail(err, 422)
    db.session.commit()
    return ok({"shop": shop_to_dict(shop)})


@bp.delete("/admin/shops/<shop_id>")
@admin_required
def delete_shop(shop_id: str):
    shop = db.session.get(CoffeeShop, shop_id)
    if shop is None:
        return fail("Kedai tidak ditemukan.", 404)
    db.session.delete(shop)
    db.session.commit()
    return ok({"status": "deleted"})


# ── Data source ────────────────────────────────────────────────
@bp.get("/admin/shops/<shop_id>/sources")
@admin_required
def list_sources(shop_id: str):
    if db.session.get(CoffeeShop, shop_id) is None:
        return fail("Kedai tidak ditemukan.", 404)
    sources = DataSource.query.filter_by(shop_id=shop_id).order_by(
        DataSource.created_at.desc()
    ).all()
    return ok({"sources": [source_to_dict(s) for s in sources]})


@bp.post("/admin/shops/<shop_id>/sources")
@admin_required
def create_source(shop_id: str):
    if db.session.get(CoffeeShop, shop_id) is None:
        return fail("Kedai tidak ditemukan.", 404)
    data = request.get_json(silent=True) or {}
    source_type = (data.get("source_type") or "").strip()
    if not source_type:
        return fail("source_type wajib diisi.", 422)

    source_url = data.get("source_url")
    if source_url is not None:
        if not isinstance(source_url, str):
            return fail("source_url harus berupa URL HTTP atau HTTPS.", 422)
        source_url = source_url.strip() or None
    if source_url and not is_safe_web_url(source_url):
        return fail("source_url harus berupa URL HTTP atau HTTPS.", 422)

    source = DataSource(
        shop_id=shop_id,
        source_type=source_type,
        source_name=(data.get("source_name") or "").strip() or None,
        source_url=source_url,
        notes=(data.get("notes") or "").strip() or None,
        verification_status=data.get("verification_status", "unverified"),
    )
    db.session.add(source)
    db.session.commit()
    return ok({"source": source_to_dict(source)}, status=201)


# ── Moderasi ───────────────────────────────────────────────────
@bp.get("/admin/reviews")
@admin_required
def list_reviews():
    query = Review.query
    status = request.args.get("moderation_status")
    if status:
        query = query.filter_by(moderation_status=status)
    reviews = query.order_by(Review.created_at.desc()).all()
    return ok({"reviews": [review_to_dict(r) for r in reviews]})


@bp.patch("/admin/reviews/<review_id>")
@admin_required
def moderate_review(review_id: str):
    review = db.session.get(Review, review_id)
    if review is None:
        return fail("Ulasan tidak ditemukan.", 404)
    data = request.get_json(silent=True) or {}
    status = data.get("moderation_status")
    if status not in MODERATION_STATUSES:
        return fail(f"moderation_status harus salah satu dari {MODERATION_STATUSES}.", 422)
    review.moderation_status = status
    db.session.commit()
    return ok({"review": review_to_dict(review)})


@bp.get("/admin/photos")
@admin_required
def list_photos():
    query = ShopPhoto.query
    status = request.args.get("moderation_status")
    if status:
        query = query.filter_by(moderation_status=status)
    photos = query.order_by(ShopPhoto.created_at.desc()).all()
    return ok({"photos": [photo_to_dict(p) for p in photos]})


@bp.patch("/admin/photos/<photo_id>")
@admin_required
def moderate_photo(photo_id: str):
    photo = db.session.get(ShopPhoto, photo_id)
    if photo is None:
        return fail("Foto tidak ditemukan.", 404)
    data = request.get_json(silent=True) or {}
    status = data.get("moderation_status")
    if status not in MODERATION_STATUSES:
        return fail(f"moderation_status harus salah satu dari {MODERATION_STATUSES}.", 422)
    photo.moderation_status = status
    db.session.commit()
    return ok({"photo": photo_to_dict(photo)})


@bp.get("/admin/reports")
@admin_required
def list_reports():
    query = Report.query
    status = request.args.get("status")
    if status:
        query = query.filter_by(status=status)
    reports = query.order_by(Report.created_at.desc()).all()
    return ok({"reports": [report_to_dict(r) for r in reports]})


@bp.patch("/admin/reports/<report_id>")
@admin_required
def resolve_report(report_id: str):
    report = db.session.get(Report, report_id)
    if report is None:
        return fail("Laporan tidak ditemukan.", 404)
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in REPORT_STATUSES:
        return fail(f"status harus salah satu dari {REPORT_STATUSES}.", 422)
    report.status = status
    db.session.commit()
    return ok({"report": report_to_dict(report)})
