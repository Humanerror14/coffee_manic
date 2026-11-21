"""Autentikasi dan profil pengguna."""
import re

from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from werkzeug.security import check_password_hash, generate_password_hash

from app.api.serializers import user_to_dict
from app.api.utils import fail, ok
from app.extensions import db
from app.models import User

bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_registration(data: dict):
    if not isinstance(data, dict):
        return "Request body harus berupa objek JSON."
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    display_name = (data.get("display_name") or "").strip()

    if not EMAIL_RE.match(email):
        return "Email tidak valid."
    if len(password) < 8:
        return "Password minimal 8 karakter."
    if not display_name:
        return "display_name wajib diisi."
    return None


@bp.post("/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    err = _validate_registration(data)
    if err:
        return fail(err, 422)

    email = (data.get("email") or "").strip().lower()
    if User.query.filter_by(email=email).first():
        return fail("Email sudah terdaftar.", 409)

    user = User(
        email=email,
        password_hash=generate_password_hash(data["password"]),
        display_name=(data.get("display_name") or "").strip(),
        role="member",
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=user.id)
    return ok(
        {"user": user_to_dict(user), "access_token": token}, status=201
    )


@bp.post("/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if user is None:
        # Dummy verify supaya waktu respons mirip saat email ada (timing attack).
        check_password_hash(
            "pbkdf2:sha256:600000$dummy$dummy", "dummy-password"
        )
        return fail("Email atau password salah.", 401)
    if not check_password_hash(user.password_hash, password):
        return fail("Email atau password salah.", 401)

    token = create_access_token(identity=user.id)
    return ok({"user": user_to_dict(user), "access_token": token})


@bp.get("/auth/me")
@jwt_required()
def me():
    user = db.session.get(User, get_jwt_identity())
    if user is None:
        return fail("Pengguna tidak ditemukan.", 404)
    return ok({"user": user_to_dict(user)})


@bp.post("/auth/logout")
@jwt_required()
def logout():
    # JWT stateless: client cukup membuang token. Endpoint disediakan
    # sebagai kontrak API untuk logout.
    return ok({"status": "ok"})


@bp.patch("/auth/me")
@jwt_required()
def update_me():
    user = db.session.get(User, get_jwt_identity())
    if user is None:
        return fail("Pengguna tidak ditemukan.", 404)

    data = request.get_json(silent=True) or {}
    if "display_name" in data:
        display_name = (data.get("display_name") or "").strip()
        if not display_name:
            return fail("display_name tidak boleh kosong.", 422)
        user.display_name = display_name
    if "password" in data:
        password = data.get("password") or ""
        if len(password) < 8:
            return fail("Password minimal 8 karakter.", 422)
        user.password_hash = generate_password_hash(password)

    db.session.commit()
    return ok({"user": user_to_dict(user)})
