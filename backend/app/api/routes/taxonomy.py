"""Kategori suasana dan fasilitas."""
from flask import Blueprint

from app.api.utils import ok
from app.models import Atmosphere, Facility

bp = Blueprint("taxonomy", __name__)


@bp.get("/atmospheres")
def list_atmospheres():
    items = [a.label for a in Atmosphere.query.order_by(Atmosphere.label).all()]
    return ok({"atmospheres": items})


@bp.get("/facilities")
def list_facilities():
    items = [f.label for f in Facility.query.order_by(Facility.label).all()]
    return ok({"facilities": items})
