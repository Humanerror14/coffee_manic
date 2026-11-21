import React from 'react'

/**
 * ShopCardSkeleton
 * Placeholder kartu kedai saat data katalog sedang dimuat.
 */
export default function ShopCardSkeleton() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton--photo" />
      <div className="skeleton-card-content">
        <div className="skeleton skeleton--badge" />
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--line-short" />
        <div className="skeleton skeleton--footer" />
      </div>
    </div>
  )
}
