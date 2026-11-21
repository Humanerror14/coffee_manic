"""Serialisasi model ke dictionary JSON."""
from app.api.utils import is_safe_web_url, isoformat


def user_to_dict(user) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "role": user.role,
        "created_at": isoformat(user.created_at),
    }


def coffee_profile_to_dict(profile) -> dict | None:
    if profile is None:
        return None
    return {
        "coffee_type": profile.coffee_type,
        "bean_origin": profile.bean_origin,
        "roast_level": profile.roast_level,
        "brew_methods": profile.brew_methods,
        "signature_drinks": profile.signature_drinks,
    }


def shop_to_dict(shop, include_relations: bool = True) -> dict:
    data = {
        "id": shop.id,
        "name": shop.name,
        "slug": shop.slug,
        "address": shop.address,
        "latitude": shop.latitude,
        "longitude": shop.longitude,
        "phone_public": shop.phone_public,
        "price_min": shop.price_min,
        "price_max": shop.price_max,
        "opening_hours": shop.opening_hours,
        "is_active": shop.is_active,
        "verification_status": shop.verification_status,
        "created_at": isoformat(shop.created_at),
        "updated_at": isoformat(shop.updated_at),
    }

    # Hitung ringkasan rating & ulasan yang disetujui
    approved_reviews = [
        r for r in getattr(shop, "reviews", []) if r.moderation_status == "approved"
    ]
    data["review_count"] = len(approved_reviews)
    if approved_reviews:
        scores = []
        for r in approved_reviews:
            r_scores = [
                v
                for v in (
                    r.coffee_quality,
                    r.atmosphere,
                    r.service,
                    r.price_value,
                    r.cleanliness,
                )
                if v is not None
            ]
            if r_scores:
                scores.append(sum(r_scores) / len(r_scores))
        data["rating_avg"] = round(sum(scores) / len(scores), 1) if scores else None
    else:
        data["rating_avg"] = None

    # Foto kedai yang disetujui (cover image & galeri)
    approved_photos = [
        p
        for p in getattr(shop, "photos", [])
        if p.moderation_status == "approved"
        and is_safe_web_url(p.image_url, allow_local_asset=True)
    ]
    data["photos"] = [photo_to_dict(p) for p in approved_photos]
    data["cover_image"] = (
        approved_photos[0].image_url if approved_photos else None
    )

    if include_relations:
        data["coffee_profile"] = coffee_profile_to_dict(shop.coffee_profile)
        data["atmospheres"] = [a.label for a in shop.atmospheres]
        data["facilities"] = [f.label for f in shop.facilities]
    return data


def review_to_dict(review) -> dict:
    return {
        "id": review.id,
        "shop_id": review.shop_id,
        "user_id": review.user_id,
        "user_name": review.user.display_name if review.user else None,
        "coffee_quality": review.coffee_quality,
        "atmosphere": review.atmosphere,
        "service": review.service,
        "price_value": review.price_value,
        "cleanliness": review.cleanliness,
        "body": review.body,
        "moderation_status": review.moderation_status,
        "created_at": isoformat(review.created_at),
        "updated_at": isoformat(review.updated_at),
    }


def photo_to_dict(photo) -> dict:
    return {
        "id": photo.id,
        "shop_id": photo.shop_id,
        "uploaded_by": photo.uploaded_by,
        "image_url": (
            photo.image_url
            if is_safe_web_url(photo.image_url, allow_local_asset=True)
            else None
        ),
        "usage_rights_note": photo.usage_rights_note,
        "moderation_status": photo.moderation_status,
        "created_at": isoformat(photo.created_at),
    }


def source_to_dict(source) -> dict:
    return {
        "id": source.id,
        "shop_id": source.shop_id,
        "source_type": source.source_type,
        "source_name": source.source_name,
        "source_url": (
            source.source_url if is_safe_web_url(source.source_url) else None
        ),
        "checked_at": isoformat(source.checked_at),
        "verification_status": source.verification_status,
        "notes": source.notes,
    }


def report_to_dict(report) -> dict:
    return {
        "id": report.id,
        "target_type": report.target_type,
        "target_id": report.target_id,
        "reporter_id": report.reporter_id,
        "reason": report.reason,
        "status": report.status,
        "created_at": isoformat(report.created_at),
    }
