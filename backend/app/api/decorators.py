"""Decorator otorisasi dan helper autentikasi."""
from functools import wraps

from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from app.api.utils import fail
from app.extensions import db
from app.models import User


def admin_required(fn):
    """Wajib terautentikasi dan berperan admin."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        if user is None or user.role != "admin":
            return fail("Akses ditolak: memerlukan peran admin.", 403)
        return fn(*args, **kwargs)

    return wrapper


def get_current_user() -> User | None:
    """Ambil user dari identitas JWT (None jika tidak ada/terhapus)."""
    try:
        verify_jwt_in_request()
    except Exception:  # noqa: BLE001
        return None
    return db.session.get(User, get_jwt_identity())
