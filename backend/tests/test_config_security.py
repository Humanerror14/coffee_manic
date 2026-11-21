"""Validasi secret konfigurasi produksi."""
import pytest

from app.config import ProductionConfig, get_config
from app.seed import run_seed


@pytest.mark.parametrize(
    "jwt_secret", ("too-short", "change-me-to-another-random-secret")
)
def test_production_rejects_weak_signing_secrets(monkeypatch, jwt_secret):
    monkeypatch.setattr(ProductionConfig, "SECRET_KEY", "a" * 32)
    monkeypatch.setattr(ProductionConfig, "JWT_SECRET_KEY", jwt_secret)

    with pytest.raises(
        RuntimeError, match="JWT_SECRET_KEY produksi wajib minimal 32 karakter"
    ):
        get_config("production")


def test_production_accepts_strong_signing_secrets(monkeypatch):
    monkeypatch.setattr(ProductionConfig, "SECRET_KEY", "s" * 32)
    monkeypatch.setattr(ProductionConfig, "JWT_SECRET_KEY", "j" * 32)

    config = get_config("production")

    assert config.DEBUG is False


def test_seed_refuses_production_configuration(app):
    app.config.update(DEBUG=False, TESTING=False)

    with app.app_context(), pytest.raises(
        RuntimeError, match="hanya boleh dimuat di development atau test"
    ):
        run_seed()
