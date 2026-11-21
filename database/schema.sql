-- ============================================================
-- Coffee Manic — PostgreSQL schema (rancangan referensi)
-- ============================================================
-- Catatan: aplikasi menggunakan SQLAlchemy models + Flask-Migrate.
-- File ini adalah rancangan SQL referensi untuk memahami struktur.
-- UUID memakai ekstensi gen_random_uuid() (pgcrypto) atau
-- dapat diganti dengan uuid yang dihasilkan aplikasi.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    display_name    TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'member'
                    CHECK (role IN ('member', 'admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── coffee_shops ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coffee_shops (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    slug                TEXT NOT NULL UNIQUE,
    address             TEXT,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    phone_public        TEXT,
    price_min           INTEGER CHECK (price_min >= 0),
    price_max           INTEGER CHECK (price_max >= 0),
    opening_hours       TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    verification_status TEXT NOT NULL DEFAULT 'unverified'
                        CHECK (verification_status IN
                          ('unverified','pending','verified','needs_review')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (price_max IS NULL OR price_min IS NULL OR price_max >= price_min)
);

CREATE INDEX IF NOT EXISTS idx_coffee_shops_slug ON coffee_shops (slug);
CREATE INDEX IF NOT EXISTS idx_coffee_shops_status ON coffee_shops (verification_status);

-- ── coffee_profiles ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coffee_profiles (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id           UUID NOT NULL REFERENCES coffee_shops(id) ON DELETE CASCADE,
    coffee_type       TEXT,
    bean_origin       TEXT,
    roast_level       TEXT,
    brew_methods      TEXT,
    signature_drinks  TEXT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coffee_profiles_shop ON coffee_profiles (shop_id);

-- ── atmospheres ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS atmospheres (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label       TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── shop_atmospheres ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_atmospheres (
    shop_id       UUID NOT NULL REFERENCES coffee_shops(id) ON DELETE CASCADE,
    atmosphere_id UUID NOT NULL REFERENCES atmospheres(id) ON DELETE CASCADE,
    PRIMARY KEY (shop_id, atmosphere_id)
);

-- ── facilities ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS facilities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label       TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── shop_facilities ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_facilities (
    shop_id      UUID NOT NULL REFERENCES coffee_shops(id) ON DELETE CASCADE,
    facility_id  UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    PRIMARY KEY (shop_id, facility_id)
);

-- ── reviews ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id           UUID NOT NULL REFERENCES coffee_shops(id) ON DELETE CASCADE,
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coffee_quality    INTEGER CHECK (coffee_quality    BETWEEN 1 AND 5),
    atmosphere        INTEGER CHECK (atmosphere        BETWEEN 1 AND 5),
    service           INTEGER CHECK (service           BETWEEN 1 AND 5),
    price_value       INTEGER CHECK (price_value       BETWEEN 1 AND 5),
    cleanliness       INTEGER CHECK (cleanliness       BETWEEN 1 AND 5),
    body              TEXT,
    moderation_status TEXT NOT NULL DEFAULT 'pending'
                      CHECK (moderation_status IN ('pending','approved','rejected')),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (shop_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_shop ON reviews (shop_id);

-- ── shop_photos ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shop_photos (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id            UUID NOT NULL REFERENCES coffee_shops(id) ON DELETE CASCADE,
    uploaded_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    image_url          TEXT NOT NULL,
    usage_rights_note  TEXT,
    moderation_status  TEXT NOT NULL DEFAULT 'pending'
                       CHECK (moderation_status IN ('pending','approved','rejected')),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── data_sources ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS data_sources (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id             UUID NOT NULL REFERENCES coffee_shops(id) ON DELETE CASCADE,
    source_type         TEXT NOT NULL,
    source_name         TEXT,
    source_url          TEXT,
    checked_at          TIMESTAMPTZ,
    verification_status TEXT NOT NULL DEFAULT 'unverified'
                        CHECK (verification_status IN
                          ('unverified','pending','verified','rejected')),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_sources_shop ON data_sources (shop_id);

-- ── reports ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type   TEXT NOT NULL CHECK (target_type IN ('review','photo')),
    target_id     UUID NOT NULL,
    reporter_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    reason        TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','resolved','dismissed')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
