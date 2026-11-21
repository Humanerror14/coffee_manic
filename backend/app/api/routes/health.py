"""Endpoint health."""
from flask import Blueprint

from app.api.utils import ok

bp = Blueprint("health", __name__)


@bp.get("/health")
def health():
    return ok({"status": "ok", "service": "coffee-manic-api"})
