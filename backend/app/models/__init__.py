"""SQLAlchemy models Coffee Manic."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Float,
    ForeignKey,
    Index,
    Integer,
    Table,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ── Relasi many-to-many ────────────────────────────────────────
shop_atmospheres = Table(
    "shop_atmospheres",
    db.metadata,
    db.Column(
        "shop_id", db.String(36), ForeignKey("coffee_shops.id"), primary_key=True
    ),
    db.Column(
        "atmosphere_id",
        db.String(36),
        ForeignKey("atmospheres.id"),
        primary_key=True,
    ),
)

shop_facilities = Table(
    "shop_facilities",
    db.metadata,
    db.Column(
        "shop_id", db.String(36), ForeignKey("coffee_shops.id"), primary_key=True
    ),
    db.Column(
        "facility_id",
        db.String(36),
        ForeignKey("facilities.id"),
        primary_key=True,
    ),
)


class User(db.Model):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(db.String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(db.Text, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(db.Text, nullable=False)
    display_name: Mapped[str] = mapped_column(db.Text, nullable=False)
    role: Mapped[str] = mapped_column(
        db.Text, nullable=False, default="member"
    )
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now, onupdate=_now
    )

    reviews = relationship("Review", back_populates="user")
    photos = relationship("ShopPhoto", back_populates="uploader")

    __table_args__ = (
        CheckConstraint("role IN ('member','admin')", name="ck_users_role"),
    )


class CoffeeShop(db.Model):
    __tablename__ = "coffee_shops"

    id: Mapped[str] = mapped_column(db.String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(db.Text, nullable=False)
    slug: Mapped[str] = mapped_column(db.Text, unique=True, nullable=False)
    address: Mapped[str | None] = mapped_column(db.Text, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    phone_public: Mapped[str | None] = mapped_column(db.Text, nullable=True)
    price_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    price_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    opening_hours: Mapped[str | None] = mapped_column(db.Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True
    )
    verification_status: Mapped[str] = mapped_column(
        db.Text, nullable=False, default="unverified"
    )
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now, onupdate=_now
    )

    coffee_profile = relationship(
        "CoffeeProfile", back_populates="shop", uselist=False, cascade="all, delete-orphan"
    )
    atmospheres = relationship("Atmosphere", secondary=shop_atmospheres, back_populates="shops")
    facilities = relationship("Facility", secondary=shop_facilities, back_populates="shops")
    reviews = relationship("Review", back_populates="shop", cascade="all, delete-orphan")
    photos = relationship("ShopPhoto", back_populates="shop", cascade="all, delete-orphan")
    data_sources = relationship("DataSource", back_populates="shop", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint(
            "verification_status IN ('unverified','pending','verified','needs_review')",
            name="ck_shops_verification",
        ),
        CheckConstraint("price_min >= 0", name="ck_shops_price_min"),
        CheckConstraint("price_max >= 0", name="ck_shops_price_max"),
        CheckConstraint(
            "price_max IS NULL OR price_min IS NULL OR price_max >= price_min",
            name="ck_shops_price_range",
        ),
        Index("ix_coffee_shops_verification_status", "verification_status"),
        Index("ix_coffee_shops_is_active", "is_active"),
    )


class CoffeeProfile(db.Model):
    __tablename__ = "coffee_profiles"

    id: Mapped[str] = mapped_column(db.String(36), primary_key=True, default=_uuid)
    shop_id: Mapped[str] = mapped_column(
        db.String(36), ForeignKey("coffee_shops.id"), nullable=False
    )
    coffee_type: Mapped[str | None] = mapped_column(db.Text, nullable=True)
    bean_origin: Mapped[str | None] = mapped_column(db.Text, nullable=True)
    roast_level: Mapped[str | None] = mapped_column(db.Text, nullable=True)
    brew_methods: Mapped[str | None] = mapped_column(db.Text, nullable=True)
    signature_drinks: Mapped[str | None] = mapped_column(db.Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now, onupdate=_now
    )

    shop = relationship("CoffeeShop", back_populates="coffee_profile")

    __table_args__ = (
        UniqueConstraint("shop_id", name="uq_coffee_profiles_shop"),
    )


class Atmosphere(db.Model):
    __tablename__ = "atmospheres"

    id: Mapped[str] = mapped_column(db.String(36), primary_key=True, default=_uuid)
    label: Mapped[str] = mapped_column(db.Text, unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now
    )

    shops = relationship("CoffeeShop", secondary=shop_atmospheres, back_populates="atmospheres")


class Facility(db.Model):
    __tablename__ = "facilities"

    id: Mapped[str] = mapped_column(db.String(36), primary_key=True, default=_uuid)
    label: Mapped[str] = mapped_column(db.Text, unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now
    )

    shops = relationship("CoffeeShop", secondary=shop_facilities, back_populates="facilities")


class Review(db.Model):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(db.String(36), primary_key=True, default=_uuid)
    shop_id: Mapped[str] = mapped_column(
        db.String(36), ForeignKey("coffee_shops.id"), nullable=False
    )
    user_id: Mapped[str] = mapped_column(
        db.String(36), ForeignKey("users.id"), nullable=False
    )
    coffee_quality: Mapped[int | None] = mapped_column(Integer, nullable=True)
    atmosphere: Mapped[int | None] = mapped_column(Integer, nullable=True)
    service: Mapped[int | None] = mapped_column(Integer, nullable=True)
    price_value: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cleanliness: Mapped[int | None] = mapped_column(Integer, nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    moderation_status: Mapped[str] = mapped_column(
        db.Text, nullable=False, default="pending"
    )
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now
    )
    updated_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now, onupdate=_now
    )

    shop = relationship("CoffeeShop", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

    __table_args__ = (
        UniqueConstraint("shop_id", "user_id", name="uq_reviews_shop_user"),
        CheckConstraint(
            "moderation_status IN ('pending','approved','rejected')",
            name="ck_reviews_moderation",
        ),
        CheckConstraint("coffee_quality BETWEEN 1 AND 5", name="ck_review_coffee"),
        CheckConstraint("atmosphere BETWEEN 1 AND 5", name="ck_review_atmosphere"),
        CheckConstraint("service BETWEEN 1 AND 5", name="ck_review_service"),
        CheckConstraint("price_value BETWEEN 1 AND 5", name="ck_review_price"),
        CheckConstraint("cleanliness BETWEEN 1 AND 5", name="ck_review_clean"),
    )


class ShopPhoto(db.Model):
    __tablename__ = "shop_photos"

    id: Mapped[str] = mapped_column(db.String(36), primary_key=True, default=_uuid)
    shop_id: Mapped[str] = mapped_column(
        db.String(36), ForeignKey("coffee_shops.id"), nullable=False
    )
    uploaded_by: Mapped[str | None] = mapped_column(
        db.String(36), ForeignKey("users.id"), nullable=True
    )
    image_url: Mapped[str] = mapped_column(db.Text, nullable=False)
    usage_rights_note: Mapped[str | None] = mapped_column(db.Text, nullable=True)
    moderation_status: Mapped[str] = mapped_column(
        db.Text, nullable=False, default="pending"
    )
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now
    )

    shop = relationship("CoffeeShop", back_populates="photos")
    uploader = relationship("User", back_populates="photos")

    __table_args__ = (
        CheckConstraint(
            "moderation_status IN ('pending','approved','rejected')",
            name="ck_photos_moderation",
        ),
    )


class DataSource(db.Model):
    __tablename__ = "data_sources"

    id: Mapped[str] = mapped_column(db.String(36), primary_key=True, default=_uuid)
    shop_id: Mapped[str] = mapped_column(
        db.String(36), ForeignKey("coffee_shops.id"), nullable=False
    )
    source_type: Mapped[str] = mapped_column(db.Text, nullable=False)
    source_name: Mapped[str | None] = mapped_column(db.Text, nullable=True)
    source_url: Mapped[str | None] = mapped_column(db.Text, nullable=True)
    checked_at: Mapped[datetime | None] = mapped_column(
        db.DateTime(timezone=True), nullable=True
    )
    verification_status: Mapped[str] = mapped_column(
        db.Text, nullable=False, default="unverified"
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now
    )

    shop = relationship("CoffeeShop", back_populates="data_sources")

    __table_args__ = (
        CheckConstraint(
            "verification_status IN ('unverified','pending','verified','rejected')",
            name="ck_sources_verification",
        ),
        Index("ix_data_sources_shop_id", "shop_id"),
    )


class Report(db.Model):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(db.String(36), primary_key=True, default=_uuid)
    target_type: Mapped[str] = mapped_column(db.Text, nullable=False)
    target_id: Mapped[str] = mapped_column(db.String(36), nullable=False)
    reporter_id: Mapped[str | None] = mapped_column(
        db.String(36), ForeignKey("users.id"), nullable=True
    )
    reason: Mapped[str] = mapped_column(db.Text, nullable=False)
    status: Mapped[str] = mapped_column(
        db.Text, nullable=False, default="open"
    )
    created_at: Mapped[datetime] = mapped_column(
        db.DateTime(timezone=True), nullable=False, default=_now
    )

    __table_args__ = (
        CheckConstraint("target_type IN ('review','photo')", name="ck_reports_type"),
        CheckConstraint(
            "status IN ('open','resolved','dismissed')", name="ck_reports_status"
        ),
    )
