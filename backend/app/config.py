"""Konfigurasi aplikasi Coffee Manic."""
import os
import re
import sys
import warnings
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

# Cari dan muat .env dari direktori root proyek atau backend
_backend_dir = Path(__file__).resolve().parent.parent
_root_dir = _backend_dir.parent
load_dotenv(_root_dir / ".env")
load_dotenv(_backend_dir / ".env")


def _resolve_database_uri() -> str:
    """Pilih URI database.

    Default PostgreSQL (sesuai konfigurasi tetap). Jika PostgreSQL tidak
    dapat dijangkau dan tidak ada URI SQLite eksplisit, otomatis memakai
    SQLite lokal agar starter tetap dapat dijalankan tanpa Docker.
    """
    if os.environ.get("FLASK_ENV") == "testing" or "pytest" in sys.modules:
        return os.environ.get("TEST_DATABASE_URL", "sqlite:///:memory:")

    uri = os.environ.get("DATABASE_URL", "").strip()
    if not uri:
        return "sqlite:///coffee_manic.db"
    if uri.startswith("sqlite"):
        return uri

    # Hapus kurung siku jika pengguna tidak sengaja menyertakan [password]
    if ":[" in uri and "]@" in uri:
        uri = re.sub(r":\[(.*?)\]@", r":\1@", uri)

    # Normalisasi prefix postgres:// atau postgresql:// agar kompatibel dengan psycopg 3
    if uri.startswith("postgres://"):
        uri = uri.replace("postgres://", "postgresql+psycopg://", 1)
    elif uri.startswith("postgresql://") and not uri.startswith("postgresql+"):
        uri = uri.replace("postgresql://", "postgresql+psycopg://", 1)

    # URI non-SQLite: uji konektivitas singkat sebelum digunakan.
    try:
        from sqlalchemy import create_engine, text

        engine = create_engine(uri, connect_args={"connect_timeout": 10})
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        engine.dispose()
        return uri
    except Exception as err:  # noqa: BLE001 — fallback yang disengaja
        warnings.warn(
            f"DATABASE_URL tidak dapat dijangkau ({err}); "
            "memakai SQLite lokal (sqlite:///coffee_manic.db).",
            RuntimeWarning,
            stacklevel=2,
        )
        return "sqlite:///coffee_manic.db"


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)

    SQLALCHEMY_DATABASE_URI = _resolve_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173")

    # Batas request per menit per alamat IP (jaga beban DB/server).
    RATE_LIMIT_PER_MINUTE = int(os.environ.get("RATE_LIMIT_PER_MINUTE", "60"))


class TestingConfig(Config):
    TESTING = True
    # Test selalu memakai SQLite in-memory, independen dari env.
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL", "sqlite:///:memory:"
    )
    JWT_SECRET_KEY = "test-secret-key-with-at-least-32-bytes-length"
    # Rate limit dimatikan default; test_rate_limiter menyalakannya eksplisit.
    RATELIMIT_ENABLED = False


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_by_name = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(name: str | None = None):
    name = name or os.environ.get("FLASK_ENV", "development")
    cfg = config_by_name.get(name, DevelopmentConfig)
    if issubclass(cfg, ProductionConfig):
        for key in ("SECRET_KEY", "JWT_SECRET_KEY"):
            value = getattr(cfg, key, None)
            if (
                not isinstance(value, str)
                or len(value) < 32
                or value.lower().startswith(("change-me", "your-", "replace-"))
            ):
                raise RuntimeError(
                    f"{key} produksi wajib minimal 32 karakter dan bukan placeholder."
                )
    if not issubclass(cfg, TestingConfig):
        cfg.SQLALCHEMY_DATABASE_URI = _resolve_database_uri()
    return cfg
