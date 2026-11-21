import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../authContext.jsx'
import VerificationBadge from '../components/VerificationBadge.jsx'
import StarRating from '../components/StarRating.jsx'
import Reveal from '../components/Reveal.jsx'
import {
  LocationIcon,
  ClockIcon,
  PhoneIcon,
  ExternalIcon,
  ShieldIcon,
  UserIcon,
  CloseIcon,
  ArrowUpRightIcon,
} from '../components/CoffeeIcons.jsx'

const RATING_CATEGORIES = [
  { key: 'coffee_quality', label: 'Coffee Quality', desc: 'Rasa dan konsistensi minuman kopi' },
  { key: 'atmosphere', label: 'Atmosphere', desc: 'Kenyamanan, kebisingan, dan tata ruang' },
  { key: 'service', label: 'Service', desc: 'Keramahan dan ketepatan pelayanan' },
  { key: 'price_value', label: 'Price Value', desc: 'Kesesuaian harga dengan mutu minuman' },
  { key: 'cleanliness', label: 'Cleanliness', desc: 'Kebersihan area duduk, meja, dan fasilitas' },
]

const createReviewForm = () => ({
  body: '',
  coffee_quality: null,
  atmosphere: null,
  service: null,
  price_value: null,
  cleanliness: null,
})

function calculateAverage(ratingsObj) {
  if (!ratingsObj) return null
  const values = RATING_CATEGORIES.map((c) => Number(ratingsObj[c.key])).filter((v) => Number.isFinite(v) && v > 0)
  if (values.length === 0) return null
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
}

function formatPrice(min, max) {
  if (min == null && max == null) return 'Belum diketahui'
  const fmt = (n) => `Rp ${n.toLocaleString('id-ID')}`
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`
  if (min != null) return `Mulai ${fmt(min)}`
  return `Maks. ${fmt(max)}`
}

export default function ShopDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [shop, setShop] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState(null)
  const [retry, setRetry] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [shareError, setShareError] = useState(null)
  const shareTimer = useRef(null)
  const [activePhoto, setActivePhoto] = useState(null)
  const [coverSrc, setCoverSrc] = useState(null)
  const photoDialog = useRef(null)

  const [form, setForm] = useState(createReviewForm)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => () => window.clearTimeout(shareTimer.current), [])

  useEffect(() => {
    setForm(createReviewForm())
    setCopied(false)
    setShareError(null)
    window.clearTimeout(shareTimer.current)
  }, [slug])

  useEffect(() => {
    setCoverSrc(shop?.cover_image || null)
  }, [shop?.cover_image])

  useEffect(() => {
    if (!activePhoto) return undefined
    const dialog = photoDialog.current
    const previousOverflow = document.body.style.overflow
    const trigger = document.activeElement
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true })
    }
  }, [activePhoto])

  useEffect(() => {
    const controller = new AbortController()
    let current = true
    setLoading(true)
    setError(null)
    setReviews([])
    setReviewsLoading(true)
    setReviewsError(null)
    setActivePhoto(null)
    setMessage(null)
    api
      .get(`/shops/slug/${slug}`, false, { signal: controller.signal })
      .then((data) => { if (current) setShop(data.shop) })
      .catch((e) => { if (current && e.name !== 'AbortError') setError(e.message) })
      .finally(() => { if (current) setLoading(false) })

    api
      .get(`/shops/slug/${slug}/reviews`, false, { signal: controller.signal })
      .then((data) => { if (current) setReviews(data.reviews || []) })
      .catch((e) => { if (current && e.name !== 'AbortError') setReviewsError(e.message) })
      .finally(() => { if (current) setReviewsLoading(false) })
    return () => { current = false; controller.abort() }
  }, [slug, retry])

  const setCategoryRating = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submitReview = async (e) => {
    e.preventDefault()
    setMessage(null)
    if (!RATING_CATEGORIES.some(({ key }) => form[key] != null)) {
      setMessage({ type: 'error', text: 'Pilih minimal satu kategori penilaian sebelum mengirim ulasan.' })
      return
    }
    setSubmitting(true)
    try {
      await api.post(
        `/shops/${shop.id}/reviews`,
        {
          body: form.body,
          coffee_quality: form.coffee_quality,
          atmosphere: form.atmosphere,
          service: form.service,
          price_value: form.price_value,
          cleanliness: form.cleanliness,
        },
        true,
      )
      setMessage({
        type: 'success',
        text: 'Ulasan terkirim dan masuk antrean peninjauan kurator.',
      })
      setForm(createReviewForm())
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const handleShare = async () => {
    setShareError(null)
    setCopied(false)
    window.clearTimeout(shareTimer.current)
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      shareTimer.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setShareError('Tautan belum tersalin. Salin alamat halaman dari bilah alamat browser.')
    }
  }

  if (loading) {
    return (
      <div
        className="container detail-skeleton"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="sr-only">Memuat profil kedai kopi...</span>
        <div className="skeleton skeleton--hero" aria-hidden="true" />
        <div className="detail-skeleton-cols">
          <div className="detail-skeleton-main" aria-hidden="true">
            <div className="skeleton skeleton--block" />
            <div className="skeleton skeleton--block" />
          </div>
          <div className="detail-skeleton-side" aria-hidden="true">
            <div className="skeleton skeleton--block" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <p>Terjadi kesalahan: {error}</p>
          <Link to="/jelajahi" className="button button-outline small">
            Kembali ke katalog
          </Link>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="container empty-box">
        <p>Kedai tidak ditemukan dalam katalog Lhoksukon.</p>
        <Link to="/jelajahi" className="button button-primary">
          Buka katalog
        </Link>
      </div>
    )
  }

  const mapsUrl =
    shop.latitude != null && shop.longitude != null
      ? `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          shop.name + ' Lhoksukon Aceh Utara ' + (shop.address || ''),
        )}`

  const categoryAverages = RATING_CATEGORIES.reduce((acc, cat) => {
    const validRatings = reviews
      .map((r) => r[cat.key])
      .filter((v) => v != null && v > 0)
    if (validRatings.length > 0) {
      acc[cat.key] = (validRatings.reduce((a, b) => a + b, 0) / validRatings.length).toFixed(1)
    } else {
      acc[cat.key] = null
    }
    return acc
  }, {})

  const overallAvg =
    shop.rating_avg != null
      ? Number(shop.rating_avg).toFixed(1)
      : calculateAverage(categoryAverages)

  return (
    <div className="container shop-detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/">Beranda</Link>
        <span className="sep">/</span>
        <Link to="/jelajahi">Jelajahi</Link>
        <span className="sep">/</span>
        <span className="current">{shop.name}</span>
      </nav>

      {/* Main Header */}
      <header className={`shop-header-card ${coverSrc ? 'has-cover' : ''}`}>
        {coverSrc && (
          <div className="shop-header-cover-backdrop">
            <img
              src={coverSrc}
              alt=""
              aria-hidden="true"
              className="shop-header-cover-img"
              onError={() => setCoverSrc('/assets/placeholders/espresso-glass-closeup.jpg')}
            />
          </div>
        )}
        <div className="shop-header-content">
          <div className="shop-header-meta">
            <span className="coffee-badge">
              {shop.coffee_profile?.coffee_type || 'Kedai Kopi Lokal'}
            </span>
            <VerificationBadge status={shop.verification_status} />
          </div>

          <h1 className="shop-main-title">{shop.name}</h1>

          {shop.address && (
            <p className="shop-main-address">
              <LocationIcon size={16} className="icon-subtle" />
              <span>{shop.address}</span>
            </p>
          )}

          <div className="shop-actions-row">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-accent"
              title="Buka rute navigasi di Google Maps"
            >
              <span>Petunjuk arah peta</span>
              <ExternalIcon size={14} />
            </a>

            <button
              type="button"
              className="button button-outline"
              onClick={handleShare}
              aria-live="polite"
            >
              {copied ? 'Tautan disalin' : 'Salin tautan'}
            </button>

            {shop.photos && shop.photos.length > 0 && (
              <a href="#gallery-section" className="button button-ghost">
                {shop.photos.length} Foto
              </a>
            )}

            <a href="#reviews-section" className="button button-ghost">
              {reviewsError || reviewsLoading ? 'Ulasan pengunjung' : `${reviews.length} ulasan terdaftar`}
            </a>
          </div>
          {shareError && <p className="share-error" role="status">{shareError}</p>}
        </div>
      </header>

      {/* Layout */}
      <div className="detail-layout">
        {/* Main Column */}
        <div className="detail-main-col">
          {/* Galeri Foto Kedai */}
          {shop.photos && shop.photos.length > 0 && (
            <Reveal as="section" id="gallery-section" className="card shop-gallery-card" direction="up">
              <div className="card-header gallery-header">
                <div>
                  <h2>Dokumentasi Foto Kedai</h2>
                  <p className="card-subtitle">
                    {shop.photos.length} foto yang tercatat pada profil kedai
                  </p>
                </div>
                <span className="gallery-source-tag">
                  {shop.photos[0].usage_rights_note || 'Keterangan hak penggunaan belum tersedia'}
                </span>
              </div>

              <div className="card-body">
                <div className="shop-gallery-grid">
                  {shop.photos.map((photo, pIdx) => (
                    <button
                      type="button"
                      key={photo.id || pIdx}
                      className={`gallery-thumb-btn ${pIdx === 0 ? 'is-lead' : ''}`}
                      onClick={() => setActivePhoto(photo.image_url)}
                      title="Klik untuk memperbesar foto"
                    >
                      <img
                        src={photo.image_url}
                        alt={`Dokumentasi ${shop.name} ${pIdx + 1}`}
                        className="gallery-thumb-img"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/placeholders/espresso-glass-closeup.jpg'
                        }}
                      />
                      <span className="gallery-thumb-overlay">
                        <ArrowUpRightIcon size={16} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
          {/* Coffee Profile */}
          <Reveal as="section" className="card coffee-profile-card" direction="up">
            <div className="card-header">
              <h2>Profil Seduhan Kopi</h2>
            </div>

            <div className="card-body">
              {shop.coffee_profile ? (
                <div className="coffee-specs-grid">
                  <div className="spec-item">
                    <span className="spec-label">Jenis kopi</span>
                    <span className="spec-value">
                      {shop.coffee_profile.coffee_type || 'Belum diketahui'}
                    </span>
                  </div>

                  <div className="spec-item">
                    <span className="spec-label">Asal biji</span>
                    <span className="spec-value">
                      {shop.coffee_profile.bean_origin || 'Belum diketahui'}
                    </span>
                  </div>

                  <div className="spec-item">
                    <span className="spec-label">Tingkat sangrai</span>
                    <span className="spec-value">
                      {shop.coffee_profile.roast_level ? (
                        <span className="roast-pill">
                          {shop.coffee_profile.roast_level}
                        </span>
                      ) : (
                        'Belum diketahui'
                      )}
                    </span>
                  </div>

                  <div className="spec-item">
                    <span className="spec-label">Metode seduh</span>
                    <span className="spec-value">
                      {shop.coffee_profile.brew_methods || 'Belum diketahui'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="muted">Profil karakter kopi belum dicatat untuk kedai ini.</p>
              )}

              {/* Tags */}
              <div className="tags-section">
                <div className="tags-group">
                  <span className="tags-group-label">Karakter suasana:</span>
                  <div className="tags">
                    {shop.atmospheres?.length > 0 ? (
                      shop.atmospheres.map((a) => (
                        <span key={a} className="tag tag-atmosphere">
                          {a}
                        </span>
                      ))
                    ) : (
                      <span className="muted small">Belum ada catatan suasana</span>
                    )}
                  </div>
                </div>

                <div className="tags-group">
                  <span className="tags-group-label">Fasilitas tersedia:</span>
                  <div className="tags">
                    {shop.facilities?.length > 0 ? (
                      shop.facilities.map((f) => (
                        <span key={f} className="tag tag-facility">
                          {f}
                        </span>
                      ))
                    ) : (
                      <span className="muted small">Belum ada catatan fasilitas</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Ratings & Reviews */}
          <Reveal as="section" id="reviews-section" className="card reviews-card" direction="up" delay={80}>
            <div className="card-header">
              <h2>Penilaian dan Ulasan</h2>
              {!reviewsError && !reviewsLoading && <span className="card-badge">{reviews.length} ulasan</span>}
            </div>

            <div className="card-body">
              {/* Summary */}
              <div className="rating-summary-box">
                <div className="overall-score-col">
                  <div className="score-number">{overallAvg || '—'}</div>
                  <StarRating
                    value={overallAvg ? Number(overallAvg) : 0}
                    readOnly
                    size="lg"
                    showNumber={false}
                  />
                  <span className="score-desc">
                    {overallAvg ? 'Skala rata-rata 1 hingga 5' : 'Belum dinilai'}
                  </span>
                </div>

                <div className="category-bars-col">
                  {RATING_CATEGORIES.map((cat) => {
                    const score = categoryAverages[cat.key]
                    const pct = score ? (Number(score) / 5) * 100 : 0
                    return (
                      <div key={cat.key} className="category-bar-row">
                        <span className="cat-name">{cat.label}</span>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{ width: `${pct}%` }}
                            aria-hidden="true"
                          ></div>
                        </div>
                        <span className="cat-score">
                          {score ? score : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Review Form */}
              <div className="review-form-wrapper">
                <h3>Kirim Penilaian</h3>
                {user ? (
                  <form onSubmit={submitReview} className="review-form">
                    <p className="form-intro">
                      Isi minimal satu kategori dengan skor 1–5. Kategori yang belum kamu alami boleh dikosongkan.
                    </p>

                    <div className="rating-inputs-grid">
                      {RATING_CATEGORIES.map((cat) => (
                        <div key={cat.key} className="rating-input-row">
                          <div className="rating-field-label">
                            <span className="label-title">{cat.label}</span>
                            <span className="label-desc">{cat.desc}</span>
                          </div>
                          <StarRating
                            value={form[cat.key]}
                            onChange={(val) => setCategoryRating(cat.key, val)}
                            size="md"
                            showNumber={true}
                            label={`Penilaian ${cat.label}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="field">
                      <label htmlFor="review-body" className="field-label">
                        Catatan pengalaman (opsional)
                      </label>
                      <textarea
                        id="review-body"
                        rows="3"
                        placeholder="Ulas rasa kopi, suasana, atau fasilitas kedai..."
                        value={form.body}
                        onChange={(e) => setForm({ ...form, body: e.target.value })}
                      ></textarea>
                    </div>

                    {message && (
                      <div
                        role={message.type === 'error' ? 'alert' : 'status'}
                        className={`alert ${
                          message.type === 'error' ? 'alert-error' : 'alert-success'
                        }`}
                      >
                        {message.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="button button-accent"
                    >
                      {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
                    </button>
                  </form>
                ) : (
                  <div className="auth-prompt-box">
                    <p>
                      Masuk ke akun untuk membagikan ulasan pada kedai ini.
                    </p>
                    <div className="auth-prompt-buttons">
                      <Link to="/login" className="button button-outline">
                        Masuk
                      </Link>
                      <Link to="/daftar" className="button button-accent">
                        Daftar Akun
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className="reviews-list">
                <h3>Daftar Ulasan Pengunjung{!reviewsError && !reviewsLoading ? ` (${reviews.length})` : ''}</h3>
                {reviewsLoading ? (
                  <p role="status">Memuat ulasan pengunjung…</p>
                ) : reviewsError ? (
                  <div className="alert alert-error" role="alert">
                    <p>Ulasan belum dapat dimuat: {reviewsError}</p>
                    <button type="button" className="button button-outline small" onClick={() => setRetry((n) => n + 1)}>
                      Coba lagi
                    </button>
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="muted empty-reviews">
                    Belum ada ulasan untuk kedai ini.
                  </p>
                ) : (
                  reviews.map((r, idx) => {
                    const rAvg = calculateAverage(r)
                    return (
                      <article
                        key={r.id}
                        className="review-item"
                        style={{ '--i': idx }}
                      >
                        <div className="review-item-head">
                          <div className="reviewer-info">
                            <UserIcon size={16} className="icon-subtle" />
                            <div>
                              <strong className="reviewer-name">
                                {r.user?.display_name || 'Penikmat Kopi'}
                              </strong>
                              <span className="review-date">
                                {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                              </span>
                            </div>
                          </div>
                          {rAvg && (
                            <StarRating value={Number(rAvg)} readOnly size="sm" showNumber={true} />
                          )}
                        </div>

                        {r.body && <p className="review-body-text">{r.body}</p>}

                        <div className="review-categories-pills">
                          {RATING_CATEGORIES.map((cat) => {
                            const val = r[cat.key]
                            if (!val) return null
                            return (
                              <span key={cat.key} className="pill-small">
                                {cat.label}: {val}
                              </span>
                            )
                          })}
                        </div>
                      </article>
                    )
                  })
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Sidebar */}
        <aside className="detail-sidebar-col">
          {/* Quick Info */}
          <Reveal className="card info-sidebar-card" direction="right" distance={18} delay={80}>
            <h3>Informasi Operasional</h3>
            <dl className="sidebar-meta-list">
              <div className="meta-row">
                <dt>Kisaran harga</dt>
                <dd className="highlight-price">
                  {formatPrice(shop.price_min, shop.price_max)}
                </dd>
              </div>

              <div className="meta-row">
                <dt>Jam buka</dt>
                <dd>
                  <ClockIcon size={14} className="icon-inline" />
                  <span>{shop.opening_hours || 'Belum diketahui'}</span>
                </dd>
              </div>

              <div className="meta-row">
                <dt>Nomor telepon</dt>
                <dd>
                  {shop.phone_public ? (
                    <>
                      <PhoneIcon size={14} className="icon-inline" />
                      <a href={`tel:${shop.phone_public}`}>{shop.phone_public}</a>
                    </>
                  ) : (
                    'Belum diketahui'
                  )}
                </dd>
              </div>

              <div className="meta-row">
                <dt>Lokasi</dt>
                <dd>
                  <LocationIcon size={14} className="icon-inline" />
                  <span>{shop.address || 'Kecamatan Lhoksukon, Aceh Utara'}</span>
                </dd>
              </div>
            </dl>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="button button-accent full-width"
            >
              <span>Buka di Google Maps</span>
              <ExternalIcon size={14} />
            </a>
          </Reveal>

          {/* Data Provenance */}
          <Reveal className="card provenance-sidebar-card" direction="right" distance={18} delay={180}>
            <div className="provenance-head">
              <ShieldIcon size={16} className="icon-subtle" />
              <h4>Integritas Data</h4>
            </div>
            <p className="provenance-note">
              Informasi kedai dikurasi dengan rujukan sumber yang tercatat sesuai standar data Coffee Manic.
            </p>

            <dl className="provenance-list">
              <dt>Status verifikasi</dt>
              <dd>
                <VerificationBadge status={shop.verification_status} size="small" />
              </dd>

              {shop.source_name && (
                <>
                  <dt>Sumber data</dt>
                  <dd>{shop.source_name}</dd>
                </>
              )}

              {shop.source_url && (
                <>
                  <dt>Tautan rujukan</dt>
                  <dd>
                    <a
                      href={shop.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link"
                    >
                      Buka sumber
                    </a>
                  </dd>
                </>
              )}

              {shop.checked_at && (
                <>
                  <dt>Terakhir ditinjau</dt>
                  <dd>
                    {new Date(shop.checked_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </>
              )}

              {shop.notes && (
                <>
                  <dt>Catatan kurator</dt>
                  <dd className="curator-notes">{shop.notes}</dd>
                </>
              )}
            </dl>
          </Reveal>
        </aside>
      </div>

      {/* Lightbox Modal Foto */}
      {activePhoto && (
        <dialog
          ref={photoDialog}
          className="photo-lightbox-backdrop"
          onClick={(event) => { if (event.target === event.currentTarget) setActivePhoto(null) }}
          onCancel={(event) => { event.preventDefault(); setActivePhoto(null) }}
          aria-label="Tampilan penuh foto"
        >
          <div className="photo-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="photo-lightbox-close"
              onClick={() => setActivePhoto(null)}
              aria-label="Tutup tampilan foto"
            >
              <CloseIcon size={20} />
            </button>
            <img
              src={activePhoto}
              alt={`Dokumentasi foto ${shop.name}`}
              className="photo-lightbox-img"
              onError={(e) => {
                e.currentTarget.src = '/assets/placeholders/espresso-glass-closeup.jpg'
              }}
            />
          </div>
        </dialog>
      )}
    </div>
  )
}
