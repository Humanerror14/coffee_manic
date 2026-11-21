import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { catalogQuery } from '../catalogFilters.js'
import ShopCard from '../components/ShopCard.jsx'
import ShopCardSkeleton from '../components/ShopCardSkeleton.jsx'
import CoffeeHeroVisual from '../components/CoffeeHeroVisual.jsx'
import Reveal from '../components/Reveal.jsx'
import CountUp from '../components/CountUp.jsx'
import {
  SearchIcon,
  ArrowUpRightIcon,
  BeanIcon,
  LocationIcon,
  ChevronDownIcon,
  BookOpenIcon,
  CoffeeCupIcon,
} from '../components/CoffeeIcons.jsx'

const PRICE_OPTIONS = [
  { value: '', label: 'Semua rentang' },
  { value: '15000', label: '≤ Rp 15.000' },
  { value: '25000', label: '≤ Rp 25.000' },
  { value: '50000', label: '≤ Rp 50.000' },
]

export default function Home() {
  const [shops, setShops] = useState([])
  const [totalShops, setTotalShops] = useState(0)
  const [verifiedTotal, setVerifiedTotal] = useState(0)
  const [atmospheres, setAtmospheres] = useState([])
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retry, setRetry] = useState(0)
  const navigate = useNavigate()

  // Draft filter panel (diterapkan saat submit, bukan tiap ketikan)
  const [draft, setDraft] = useState({
    q: '',
    coffee: '',
    atmosphere: '',
    price_max: '',
    facility: '',
  })

  useEffect(() => {
    const controller = new AbortController()
    let current = true
    setLoading(true)
    setError(null)
    api
      .get('/shops', false, { signal: controller.signal })
      .then((data) => {
        if (!current) return
        const list = data.shops ? data.shops : []
        setShops(list.slice(0, 6))
        setTotalShops(list.length)
        setVerifiedTotal(list.filter((s) => s.verification_status === 'verified').length)
      })
      .catch((e) => { if (current && e.name !== 'AbortError') setError(e.message) })
      .finally(() => { if (current) setLoading(false) })

    Promise.all([
      api.get('/atmospheres', false, { signal: controller.signal }),
      api.get('/facilities', false, { signal: controller.signal }),
    ])
      .then(([a, f]) => {
        if (!current) return
        setAtmospheres(a.atmospheres || [])
        setFacilities(f.facilities || [])
      })
      .catch(() => {})
    return () => { current = false; controller.abort() }
  }, [retry])

  const setField = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }))

  const buildExploreUrl = () => {
    const qs = catalogQuery(draft)
    return `/jelajahi${qs ? `?${qs}` : ''}`
  }

  const submitSearch = (event) => {
    event.preventDefault()
    navigate(buildExploreUrl())
  }

  const resetFilters = () => {
    setDraft({ q: '', coffee: '', atmosphere: '', price_max: '', facility: '' })
  }

  const hasDraft =
    Boolean(draft.q) ||
    Boolean(draft.coffee) ||
    Boolean(draft.atmosphere) ||
    Boolean(draft.price_max) ||
    Boolean(draft.facility)

  return (
    <div className="home-canvas-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <p className="home-location">
              <LocationIcon size={16} aria-hidden="true" />
              Lhoksukon, Aceh Utara
            </p>
            <h1 id="home-title">
              Kopi yang pas, tempat yang dekat.
            </h1>
            <p className="home-hero-description">
              Jelajahi kedai kopi di Lhoksukon. Temukan seduhan, suasana,
              dan tempat singgah yang cocok untukmu.
            </p>
            <form className="hero-search-panel" onSubmit={submitSearch} role="search">
              <div className="hero-search-main">
                <label className="hs-input">
                  <SearchIcon size={20} aria-hidden="true" />
                  <span className="sr-only">Cari nama kedai atau alamat</span>
                  <input
                    type="text"
                    placeholder="Nama kedai atau alamat"
                    value={draft.q}
                    onChange={(e) => setField('q', e.target.value)}
                  />
                </label>

                <button type="submit" className="hs-submit">
                  <span>Cari kedai</span>
                </button>
              </div>

              <details className="hero-search-options">
                <summary>
                  Sesuaikan pencarian
                  <ChevronDownIcon size={16} aria-hidden="true" />
                </summary>
                <div className="hero-search-filters">
                  <div className="hs-field">
                    <label htmlFor="filter-coffee">Karakter kopi</label>
                    <div className="hs-select-wrap">
                      <select
                        id="filter-coffee"
                        value={draft.coffee}
                        onChange={(e) => setField('coffee', e.target.value)}
                      >
                        <option value="">Semua karakter</option>
                        <option value="Sanger">Sanger</option>
                        <option value="Robusta">Robusta</option>
                        <option value="Arabika">Arabika</option>
                        <option value="V60">Manual brew (V60)</option>
                      </select>
                      <ChevronDownIcon size={16} className="chevron" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="hs-field">
                    <label htmlFor="filter-atmosphere">Suasana</label>
                    <div className="hs-select-wrap">
                      <select
                        id="filter-atmosphere"
                        value={draft.atmosphere}
                        onChange={(e) => setField('atmosphere', e.target.value)}
                      >
                        <option value="">Semua suasana</option>
                        {atmospheres.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon size={16} className="chevron" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="hs-field">
                    <label htmlFor="filter-price">Rentang harga</label>
                    <div className="hs-select-wrap">
                      <select
                        id="filter-price"
                        value={draft.price_max}
                        onChange={(e) => setField('price_max', e.target.value)}
                      >
                        {PRICE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon size={16} className="chevron" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="hs-field">
                    <label htmlFor="filter-facility">Fasilitas</label>
                    <div className="hs-select-wrap">
                      <select
                        id="filter-facility"
                        value={draft.facility}
                        onChange={(e) => setField('facility', e.target.value)}
                      >
                        <option value="">Pilih fasilitas</option>
                        {facilities.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon size={16} className="chevron" aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </details>

              {hasDraft && (
                <div className="hero-search-foot">
                  <button type="button" className="hs-reset" onClick={resetFilters}>
                    Atur ulang filter
                  </button>
                </div>
              )}
            </form>
          </div>
          <CoffeeHeroVisual />
        </div>
      </section>

      <section className="canvas-section curated-section" aria-label="Kedai kopi di Lhoksukon">
        <div className="curated-section-inner">
          <Reveal className="section-head-canvas" direction="up">
            <div className="section-head-info">
              <h2 className="section-heading-serif">Kedai kopi di Lhoksukon</h2>
              <p className="section-subtext">
                Sumber dan status verifikasi tersedia pada profil kedai.
              </p>
            </div>

            <Link to="/jelajahi" className="catalog-browse-link">
              <span>Lihat semua kedai</span>
              <ArrowUpRightIcon size={13} aria-hidden="true" />
            </Link>
          </Reveal>

          {/* Kurasi Cepat Suasana (FigCraft Screen 1) */}
          <div className="quick-categories-grid">
            <Link to="/jelajahi?atmosphere=Tenang" className="quick-cat-card">
              <div className="quick-cat-icon-box">
                <BookOpenIcon size={20} />
              </div>
              <div className="quick-cat-content">
                <h3 className="quick-cat-title">Tenang untuk belajar</h3>
              </div>
            </Link>

            <Link to="/jelajahi?atmosphere=Outdoor" className="quick-cat-card">
              <div className="quick-cat-icon-box">
                <BeanIcon size={20} />
              </div>
              <div className="quick-cat-content">
                <h3 className="quick-cat-title">Ruang terbuka</h3>
              </div>
            </Link>

            <Link to="/jelajahi?atmosphere=Santai" className="quick-cat-card">
              <div className="quick-cat-icon-box">
                <CoffeeCupIcon size={20} />
              </div>
              <div className="quick-cat-content">
                <h3 className="quick-cat-title">Santai bersama</h3>
              </div>
            </Link>
          </div>

          {loading && (
            <div className="shops-grid-canvas" role="status" aria-live="polite" aria-atomic="true">
              <span className="sr-only">Memuat kurasi kedai kopi...</span>
              {Array.from({ length: 3 }, (_, i) => (
                <ShopCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && (
            <div className="canvas-alert-box" role="alert">
              <p>Gagal memuat katalog: {error}</p>
              <button type="button" className="button button-outline" onClick={() => setRetry((n) => n + 1)}>
                Coba lagi
              </button>
            </div>
          )}

          {!loading && !error && shops.length === 0 && (
            <div className="canvas-state-box empty">
              <BeanIcon size={32} className="state-icon" />
              <p className="state-title">Katalog sedang diperbarui</p>
              <p className="state-text">Belum ada kedai kopi aktif yang tercatat untuk wilayah ini.</p>
            </div>
          )}

          {!loading && shops.length > 0 && (
            <div className="shops-grid-canvas">
              {shops.map((shop, i) => (
                <ShopCard key={shop.id} shop={shop} index={i} />
              ))}
            </div>
          )}

          {!loading && totalShops > 6 && (
            <div className="catalog-footnote">
              <span>
                Menampilkan 6 dari <strong><CountUp value={totalShops} /></strong> kedai.
                <span className="catalog-verified">
                  <CountUp value={verifiedTotal} /> profil terverifikasi.
                </span>
              </span>
              <Link to="/jelajahi" className="catalog-browse-link">
                Lihat semua {totalShops} kedai
                <ArrowUpRightIcon size={13} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="community-canvas-section" aria-labelledby="community-title">
        <Reveal className="community-showcase-box" direction="up">
          <img
            src="/assets/branding/espresso-crema-cup.jpg"
            alt="Ilustrasi secangkir espresso dengan lapisan crema"
            className="showcase-img"
            width={554}
            height={554}
            loading="lazy"
            decoding="async"
          />
          <div className="showcase-content-col">
            <h2 id="community-title">Bagikan pengalaman di kedai lokal</h2>
            <p>
              Ceritakan rasa kopi, suasana, dan pelayanan kedai yang kamu kunjungi.
              Ulasanmu membantu warga lain memilih tempat.
            </p>
            <Link to="/daftar" className="btn-pill-cta">
              Daftar untuk mengulas
              <ArrowUpRightIcon size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
