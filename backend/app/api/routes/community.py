"""Rating, ulasan, foto, dan pelaporan."""
from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app.api.serializers import photo_to_dict, report_to_dict, review_to_dict
from app.api.utils import fail, is_safe_web_url, ok
from app.extensions import db
from app.models import CoffeeShop, Report, Review, ShopPhoto

bp = Blueprint("community", __name__)

RATING_FIELDS = [
    "coffee_quality",
    "atmosphere",
    "service",
    "price_value",
    "cleanliness",
]


def _parse_ratings(data: dict):
    """Kembalikan (ratings, error)."""
    ratings = {}
    for field in RATING_FIELDS:
        value = data.get(field)
        if value is None:
            continue
        if isinstance(value, bool) or not isinstance(value, int):
            return None, f"{field} harus berupa bilangan bulat 1–5."
        if value < 1 or value > 5:
            return None, f"{field} harus berada pada rentang 1–5."
        ratings[field] = value
    if not ratings:
        return None, "Minimal satu kategori rating wajib diisi (1–5)."
    return ratings, None


@bp.get("/shops/<shop_id>/reviews")
def list_reviews(shop_id: str):
    if db.session.get(CoffeeShop, shop_id) is None:
        return fail("Kedai tidak ditemukan.", 404)

    reviews = (
        Review.query.filter_by(shop_id=shop_id, moderation_status="approved")
        .order_by(Review.created_at.desc())
        .all()
    )
    return ok({"reviews": [review_to_dict(r) for r in reviews]})


@bp.get("/shops/slug/<slug>/reviews")
def list_reviews_by_slug(slug: str):
    shop = CoffeeShop.query.filter_by(slug=slug).first()
    if shop is None:
        return fail("Kedai tidak ditemukan.", 404)
    reviews = (
        Review.query.filter_by(shop_id=shop.id, moderation_status="approved")
        .order_by(Review.created_at.desc())
        .all()
    )
    return ok({"reviews": [review_to_dict(r) for r in reviews]})


@bp.post("/shops/<shop_id>/reviews")
@jwt_required()
def create_review(shop_id: str):
    if db.session.get(CoffeeShop, shop_id) is None:
        return fail("Kedai tidak ditemukan.", 404)

    user_id = get_jwt_identity()
    existing = Review.query.filter_by(shop_id=shop_id, user_id=user_id).first()
    if existing is not None:
        return fail("Anda sudah mengulas kedai ini. Perbarui ulasan Anda.", 409)

    data = request.get_json(silent=True) or {}
    ratings, err = _parse_ratings(data)
    if err:
        return fail(err, 422)

    review = Review(
        shop_id=shop_id,
        user_id=user_id,
        body=(data.get("body") or "").strip() or None,
        moderation_status="pending",
        **ratings,
    )
    db.session.add(review)
    db.session.commit()
    return ok({"review": review_to_dict(review)}, status=201)


@bp.patch("/reviews/<review_id>")
@jwt_required()
def update_review(review_id: str):
    review = db.session.get(Review, review_id)
    if review is None:
        return fail("Ulasan tidak ditemukan.", 404)
    if review.user_id != get_jwt_identity():
        return fail("Anda hanya dapat memperbarui ulasan sendiri.", 403)

    data = request.get_json(silent=True) or {}
    ratings, err = _parse_ratings(data)
    if err:
        return fail(err, 422)

    for field, value in ratings.items():
        setattr(review, field, value)
    if "body" in data:
        review.body = (data.get("body") or "").strip() or None

    # Perubahan ulasan kembali menunggu moderasi.
    review.moderation_status = "pending"
    db.session.commit()
    return ok({"review": review_to_dict(review)})


@bp.delete("/reviews/<review_id>")
@jwt_required()
def delete_review(review_id: str):
    review = db.session.get(Review, review_id)
    if review is None:
        return fail("Ulasan tidak ditemukan.", 404)
    if review.user_id != get_jwt_identity():
        return fail("Anda hanya dapat menghapus ulasan sendiri.", 403)
    db.session.delete(review)
    db.session.commit()
    return ok({"status": "deleted"})


@bp.get("/shops/<shop_id>/photos")
def list_photos(shop_id: str):
    photos = (
        ShopPhoto.query.filter_by(shop_id=shop_id, moderation_status="approved")
        .order_by(ShopPhoto.created_at.desc())
        .all()
    )
    return ok({"photos": [photo_to_dict(p) for p in photos]})


@bp.post("/shops/<shop_id>/photos")
@jwt_required()
def create_photo(shop_id: str):
    if db.session.get(CoffeeShop, shop_id) is None:
        return fail("Kedai tidak ditemukan.", 404)

    data = request.get_json(silent=True) or {}
    image_url = data.get("image_url")
    if isinstance(image_url, str):
        image_url = image_url.strip()
    if not image_url:
        return fail("image_url wajib diisi.", 422)
    if not is_safe_web_url(image_url, allow_local_asset=True):
        return fail(
            "image_url harus berupa URL HTTP/HTTPS atau path aset lokal /assets/.",
            422,
        )

    photo = ShopPhoto(
        shop_id=shop_id,
        uploaded_by=get_jwt_identity(),
        image_url=image_url,
        usage_rights_note=(data.get("usage_rights_note") or "").strip() or None,
        moderation_status="pending",
    )
    db.session.add(photo)
    db.session.commit()
    return ok({"photo": photo_to_dict(photo)}, status=201)


@bp.post("/reports")
@jwt_required()
def create_report():
    data = request.get_json(silent=True) or {}
    target_type = data.get("target_type")
    target_id = data.get("target_id")
    reason = (data.get("reason") or "").strip()

    if target_type not in ("review", "photo"):
        return fail("target_type harus 'review' atau 'photo'.", 422)
    if not target_id:
        return fail("target_id wajib diisi.", 422)
    if not reason:
        return fail("reason wajib diisi.", 422)

    report = Report(
        target_type=target_type,
        target_id=target_id,
        reporter_id=get_jwt_identity(),
        reason=reason,
    )
    db.session.add(report)
    db.session.commit()
    return ok({"report": report_to_dict(report)}, status=201)
