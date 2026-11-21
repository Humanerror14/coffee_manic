import React, { useEffect, useState } from 'react'
import { api } from '../api.js'
import VerificationBadge from '../components/VerificationBadge.jsx'
import Reveal from '../components/Reveal.jsx'

const VERIFY_OPTIONS = [
  { value: 'unverified', label: 'Belum diverifikasi' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'verified', label: 'Terverifikasi' },
  { value: 'needs_review', label: 'Perlu ditinjau' },
]

export default function Admin() {
  const [shops, setShops] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', address: '' })
  const [message, setMessage] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([api.get('/admin/shops', true), api.get('/admin/reviews', true)])
      .then(([s, r]) => {
        setShops(s.shops || [])
        setReviews(r.reviews || [])
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const createShop = async (e) => {
    e.preventDefault()
    setMessage(null)
    try {
      await api.post('/admin/shops', form, true)
      setForm({ name: '', address: '' })
      setMessage({ type: 'success', text: 'Entitas kedai berhasil ditambahkan.' })
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const setStatus = async (shop, status) => {
    try {
      await api.patch(`/admin/shops/${shop.id}`, { verification_status: status }, true)
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const moderateReview = async (review, status) => {
    try {
      await api.patch(`/admin/reviews/${review.id}`, { moderation_status: status }, true)
      load()
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="container admin-page">
      <Reveal className="admin-header" direction="up">
        <h1 className="page-title">Dashboard Kurator</h1>
        <p className="page-desc">
          Verifikasi integritas data kedai dan moderasi ulasan komunitas untuk wilayah Lhoksukon.
        </p>
      </Reveal>

      <div className="admin-grid">
        {/* Create Shop Form Card */}
        <section className="card admin-form-card">
          <div className="card-header">
            <h2>Tambah Entitas Kedai</h2>
          </div>

          <div className="card-body">
            <form onSubmit={createShop} className="stack">
              <label className="field">
                <span className="field-label">Nama kedai</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama resmi kedai kopi"
                  required
                />
              </label>

              <label className="field">
                <span className="field-label">Alamat lengkap</span>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Jl. Medan - Banda Aceh, Sp. 4..."
                />
              </label>

              {message && (
                <div
                  className={`alert ${
                    message.type === 'error' ? 'alert-error' : 'alert-success'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <button type="submit" className="button button-accent" disabled={!form.name.trim()}>
                Simpan Kedai
              </button>
            </form>
          </div>
        </section>

        {/* Verification & List Section */}
        <section className="card admin-list-card">
          <div className="card-header">
            <h2>Daftar Kedai ({shops.length})</h2>
            <button type="button" className="button button-outline small" onClick={load}>
              Segarkan
            </button>
          </div>

          <div className="card-body">
            {loading && <p className="muted">Memuat data...</p>}
            {error && <div className="alert alert-error">{error}</div>}

            {!loading && shops.length === 0 && (
              <p className="muted">Belum ada kedai terdaftar.</p>
            )}

            <ul className="admin-list">
              {shops.map((shop, i) => (
                <li key={shop.id} className="admin-row" style={{ '--i': i }}>
                  <div className="admin-shop-info">
                    <strong>{shop.name}</strong>
                    {shop.address && <span className="muted small"> ({shop.address})</span>}
                    <div className="status-row">
                      <VerificationBadge status={shop.verification_status} size="small" />
                    </div>
                  </div>

                  <div className="row-actions">
                    <span className="action-label">Status:</span>
                    {VERIFY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`button small ${
                          shop.verification_status === opt.value
                            ? 'button-primary'
                            : 'button-outline'
                        }`}
                        onClick={() => setStatus(shop, opt.value)}
                        disabled={shop.verification_status === opt.value}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Reviews Moderation Section */}
      <section className="card admin-reviews-section">
        <div className="card-header">
          <h2>Moderasi Ulasan ({reviews.length})</h2>
        </div>

        <div className="card-body">
          {reviews.length === 0 ? (
            <p className="muted">Tidak ada ulasan dalam antrean moderasi.</p>
          ) : (
            <ul className="admin-list">
              {reviews.map((rev, i) => (
                <li key={rev.id} className="admin-row" style={{ '--i': i }}>
                  <div className="admin-review-content">
                    <div className="review-meta-line">
                      <strong>{rev.user?.display_name || 'Pengguna'}</strong>
                      <span className="muted"> pada </span>
                      <strong>{rev.shop?.name || 'Kedai'}</strong>
                      <span className={`badge badge-${rev.moderation_status || 'pending'}`}>
                        {rev.moderation_status || 'pending'}
                      </span>
                    </div>
                    {rev.body && <p className="review-text-preview">"{rev.body}"</p>}
                  </div>

                  <div className="row-actions">
                    <button
                      type="button"
                      className="button button-accent small"
                      onClick={() => moderateReview(rev, 'approved')}
                      disabled={rev.moderation_status === 'approved'}
                    >
                      Setujui
                    </button>
                    <button
                      type="button"
                      className="button button-outline-danger small"
                      onClick={() => moderateReview(rev, 'rejected')}
                      disabled={rev.moderation_status === 'rejected'}
                    >
                      Tolak
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
