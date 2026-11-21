import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import VerificationBadge from './VerificationBadge.jsx'
import StarRating from './StarRating.jsx'
import {
  LocationIcon,
  ArrowUpRightIcon,
  WifiIcon,
  FlashIcon,
  BuildingIcon,
  BookOpenIcon,
  CoffeeCupIcon,
} from './CoffeeIcons.jsx'

function getFacilityIcon(name) {
  const lower = (name || '').toLowerCase()
  if (lower.includes('wi-fi') || lower.includes('wifi')) return <WifiIcon size={12} className="pill-icon" />
  if (lower.includes('colokan') || lower.includes('listrik')) return <FlashIcon size={12} className="pill-icon" />
  if (lower.includes('musholla') || lower.includes('ibadah')) return <BuildingIcon size={12} className="pill-icon" />
  return null
}

function getAtmosphereIcon(name) {
  const lower = (name || '').toLowerCase()
  if (lower.includes('tenang') || lower.includes('fokus')) return <BookOpenIcon size={12} className="pill-icon" />
  return null
}

function formatPrice(min, max) {
  if (min == null && max == null) return 'Harga belum diketahui'
  const fmt = (n) => `Rp ${n.toLocaleString('id-ID')}`
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`
  if (min != null) return `Mulai ${fmt(min)}`
  return `Maks. ${fmt(max)}`
}

export default function ShopCard({ shop, index = 0 }) {
  const avgRating = shop.rating_avg ? Number(shop.rating_avg) : null
  const [imageSrc, setImageSrc] = useState(shop.cover_image || null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setImageSrc(shop.cover_image || null)
    setHasError(false)
  }, [shop.cover_image])

  const handleImageError = () => {
    if (imageSrc && imageSrc !== '/assets/placeholders/espresso-glass-closeup.jpg') {
      setImageSrc('/assets/placeholders/espresso-glass-closeup.jpg')
    } else {
      setHasError(true)
    }
  }

  return (
    <article
      className="shop-card-canvas card-enter"
      style={{ '--i': index }}
    >
      <div className="shop-card-media">
        {imageSrc && !hasError ? (
          <img
            src={imageSrc}
            alt=""
            className="shop-card-cover-img"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
        ) : (
          <div className="shop-card-cover-placeholder">
            <CoffeeCupIcon size={32} className="placeholder-icon" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="shop-card-body">
        <div className="shop-card-labels">
          <span className="shop-type-pill">
            {shop.coffee_profile?.coffee_type || 'Kedai Kopi'}
          </span>
          <VerificationBadge status={shop.verification_status} size="small" />
        </div>
        <h3 className="shop-card-title">
          <Link to={`/kedai/${shop.slug}`}>{shop.name}</Link>
        </h3>

        {shop.address && (
          <p className="shop-card-address">
            <LocationIcon size={14} className="icon-loc" />
            <span>{shop.address}</span>
          </p>
        )}

        <div className="shop-card-meta">
          <span className="price-label">
            {formatPrice(shop.price_min, shop.price_max)}
          </span>

          {avgRating ? (
            <div className="rating-cluster">
              <StarRating value={avgRating} readOnly size="sm" showNumber={true} />
              {shop.review_count > 0 && (
                <span className="review-num">({shop.review_count})</span>
              )}
            </div>
          ) : (
            <span className="unrated-tag">Belum dinilai</span>
          )}
        </div>

        {(shop.atmospheres?.length > 0 || shop.facilities?.length > 0) && (
          <div className="shop-pills-row">
            {shop.atmospheres?.map((t) => (
              <span key={t} className="category-pill-outline" title="Suasana">
                {getAtmosphereIcon(t)}
                <span>{t}</span>
              </span>
            ))}
            {shop.facilities?.map((t) => (
              <span key={t} className="category-pill-outline pill-facility" title="Fasilitas">
                {getFacilityIcon(t)}
                <span>{t}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="shop-card-foot">
        <Link to={`/kedai/${shop.slug}`} className="shop-cta-link">
          <span>Lihat profil</span>
          <ArrowUpRightIcon size={12} className="card-arrow-icon" />
        </Link>
      </div>
    </article>
  )
}
