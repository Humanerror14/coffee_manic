import React, { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api.js'
import { catalogQuery, readCatalogFilters } from '../catalogFilters.js'
import ShopCard from '../components/ShopCard.jsx'
import ShopCardSkeleton from '../components/ShopCardSkeleton.jsx'
import Reveal from '../components/Reveal.jsx'
import { useMediaQuery } from '../hooks/useMotionPreferences.js'
import {
  CloseIcon,
  CheckIcon,
  FilterIcon,
  ChevronDownIcon,
  WifiIcon,
  FlashIcon,
  BuildingIcon,
  BookOpenIcon,
} from '../components/CoffeeIcons.jsx'

const FACILITY_META = {
  'Wi-Fi': {
    title: 'Wi-Fi',
    desc: 'Kedai dengan fasilitas Wi-Fi tercatat',
    Icon: WifiIcon,
  },
  Stopkontak: {
    title: 'Colokan Listrik',
    desc: 'Kedai dengan fasilitas stopkontak tercatat',
    Icon: FlashIcon,
  },
  Musala: {
    title: 'Musala',
    desc: 'Kedai dengan fasilitas musala tercatat',
    Icon: BuildingIcon,
  },
  AC: {
    title: 'AC',
    desc: 'Kedai dengan fasilitas AC tercatat',
    Icon: BookOpenIcon,
  },
}

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [shops, setShops] = useState([])
  const [atmospheres, setAtmospheres] = useState([])
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sortBy, setSortBy] = useState('all')
  const [retry, setRetry] = useState(0)
  const [taxonomyError, setTaxonomyError] = useState(false)

  const isMobile = useMediaQuery('(max-width: 900px)')
  const sheetRef = useRef(null)
  const sheetTriggerRef = useRef(null)

  const appliedFilters = React.useMemo(() => readCatalogFilters(searchParams), [searchParams])
  const [draftFilters, setDraftFilters] = useState(appliedFilters)
  const [searchText, setSearchText] = useState(appliedFilters.q)
  const filters = isMobile && sheetOpen ? draftFilters : appliedFilters
  const queryString = catalogQuery(appliedFilters)

  useEffect(() => setSearchText(appliedFilters.q), [appliedFilters.q])

  // Ketikan tidak membuat request dan entri riwayat browser satu per huruf.
  useEffect(() => {
    if ((isMobile && sheetOpen) || searchText === appliedFilters.q) return undefined
    const timer = window.setTimeout(() => {
      setSearchParams(catalogQuery({ ...appliedFilters, q: searchText }), { replace: true })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchText, appliedFilters, setSearchParams, isMobile, sheetOpen])

  useEffect(() => {
    if (!isMobile) setSheetOpen(false)
  }, [isMobile])

  useEffect(() => {
    const controller = new AbortController()
    let current = true
    setTaxonomyError(false)
    Promise.all([
      api.get('/atmospheres', false, { signal: controller.signal }),
      api.get('/facilities', false, { signal: controller.signal }),
    ])
      .then(([a, f]) => {
        if (!current) return
        setAtmospheres(a.atmospheres || [])
        setFacilities(f.facilities || [])
      })
      .catch((e) => { if (current && e.name !== 'AbortError') setTaxonomyError(true) })
    return () => { current = false; controller.abort() }
  }, [retry])

  useEffect(() => {
    setLoading(true)
    setError(null)
    const controller = new AbortController()
    let current = true
    api
      .get(`/shops?${queryString}`, false, { signal: controller.signal })
      .then((data) => { if (current) setShops(data.shops || []) })
      .catch((e) => { if (current && e.name !== 'AbortError') setError(e.message) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false; controller.abort() }
  }, [queryString, retry])

  const displayedShops = React.useMemo(() => {
    const list = [...shops]
    if (sortBy === 'rating') {
      return list.sort((a, b) => (Number(b.rating_avg) || 0) - (Number(a.rating_avg) || 0))
    }
    if (sortBy === 'price') {
      return list.sort((a, b) => (a.price_min ?? 999999) - (b.price_min ?? 999999))
    }
    return list
  }, [shops, sortBy])

  // Bottom sheet: kunci scroll, kunci fokus, dukung Escape.
  useEffect(() => {
    if (!isMobile || !sheetOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSheetOpen(false)
        if (sheetTriggerRef.current) {
          sheetTriggerRef.current.focus({ preventScroll: true })
        }
        return
      }
      if (event.key !== 'Tab') return

      // Jaga fokus tetap di dalam bottom sheet selama terbuka.
      const focusables = sheetRef.current?.querySelectorAll(
        'button:not([disabled]), input, select, textarea, [href], [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !sheetRef.current?.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }
    document.documentElement.classList.add('sheet-open')
    document.addEventListener('keydown', onKeyDown)
    const timer = window.setTimeout(() => {
      const firstField = sheetRef.current?.querySelector('input, button')
      if (firstField) firstField.focus({ preventScroll: true })
    }, 0)

    return () => {
      document.documentElement.classList.remove('sheet-open')
      document.removeEventListener('keydown', onKeyDown)
      window.clearTimeout(timer)
    }
  }, [isMobile, sheetOpen])

  // Sembunyikan sheet tertutup dari urutan tab (hanya pada layar kecil).
  useEffect(() => {
    const node = sheetRef.current
    if (!node) return
    const hidden = isMobile && !sheetOpen
    node.toggleAttribute('inert', hidden)
    if (hidden) node.setAttribute('aria-hidden', 'true')
    else node.removeAttribute('aria-hidden')
  }, [isMobile, sheetOpen])

  const closeSheet = () => {
    setSheetOpen(false)
    if (sheetTriggerRef.current) {
      sheetTriggerRef.current.focus({ preventScroll: true })
    }
  }

  const updateFilters = (newFilters) => {
    if (isMobile && sheetOpen) setDraftFilters(newFilters)
    else {
      setSearchText(newFilters.q)
      setSearchParams(catalogQuery(newFilters))
    }
  }

  const toggleMulti = (key, value) => {
    const current = filters[key]
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    updateFilters({ ...filters, [key]: next })
  }

  const setPriceMax = (val) => {
    updateFilters({ ...filters, price_max: val })
  }

  const clearAllFilters = () => {
    updateFilters({
      q: '',
      coffee: '',
      price_max: '',
      atmosphere: [],
      facility: [],
    })
  }

  const hasActiveFilters =
    Boolean(filters.q) ||
    Boolean(filters.coffee) ||
    Boolean(filters.price_max) ||
    filters.atmosphere.length > 0 ||
    filters.facility.length > 0

  const activeFilterCount =
    (filters.q ? 1 : 0) +
    (filters.coffee ? 1 : 0) +
    (filters.price_max ? 1 : 0) +
    filters.atmosphere.length +
    filters.facility.length

  return (
    <div className="container explore-page">
      <Reveal className="explore-header" direction="up">
        <h1 className="page-title">Jelajahi kedai kopi</h1>
        <p className="page-desc">
          Temukan kedai di Lhoksukon sesuai kopi, suasana, harga, dan fasilitas yang kamu cari.
        </p>
      </Reveal>

      {/* Bar aksi mobile: pemicu bottom sheet + ringkasan hasil */}
      <div className="explore-mobile-bar">
        <button
          type="button"
          className="mobile-filter-btn"
          ref={sheetTriggerRef}
          onClick={() => { setDraftFilters(appliedFilters); setSheetOpen(true) }}
          aria-expanded={sheetOpen}
          aria-controls="filter-sheet"
          aria-haspopup="dialog"
        >
          <FilterIcon size={16} aria-hidden="true" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="mobile-filter-count">{activeFilterCount}</span>
          )}
        </button>
        <span className="mobile-results-count">
          {error ? 'Gagal memuat' : <><strong>{loading ? '…' : shops.length}</strong> kedai</>}
        </span>
      </div>

      <div
        className={`sheet-backdrop ${sheetOpen ? 'is-open' : ''}`}
        onClick={closeSheet}
        aria-hidden="true"
      />

      <div className="explore-layout">
        {/* Filter Sidebar / Bottom Sheet */}
        <aside
          className={`filters-sidebar ${sheetOpen ? 'is-open' : ''}`}
          id="filter-sheet"
          ref={sheetRef}
          role={isMobile ? 'dialog' : undefined}
          aria-modal={isMobile && sheetOpen ? 'true' : undefined}
          aria-label="Filter pencarian kedai"
        >
          <div className="sheet-handle" aria-hidden="true" />

          <div className="filters-card">
            <div className="filters-card-head">
              <h2 className="filters-title">
                <FilterIcon size={16} className="title-icon" />
                Filter Pencarian
              </h2>
              <div className="row-actions">
                {hasActiveFilters && (
                  <button
                    type="button"
                    className="link-button filter-reset-btn"
                    onClick={clearAllFilters}
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  className="sheet-close"
                  onClick={closeSheet}
                  aria-label="Tutup panel filter"
                >
                  <CloseIcon size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            {taxonomyError && (
              <p className="filter-load-warning" role="status">
                Pilihan suasana dan fasilitas belum dapat dimuat.{' '}
                <button type="button" className="link-button" onClick={() => setRetry((n) => n + 1)}>
                  Coba lagi
                </button>
              </p>
            )}

            <div className="filter-section">
              <label className="field-label" htmlFor="search-input">
                Nama kedai atau lokasi
              </label>
              <div className="search-box-inner">
                <input
                  id="search-input"
                  type="search"
                  value={isMobile && sheetOpen ? filters.q : searchText}
                  onChange={(e) => isMobile && sheetOpen
                    ? setDraftFilters({ ...filters, q: e.target.value })
                    : setSearchText(e.target.value)}
                  placeholder="Nama kedai atau alamat"
                />
                {(isMobile && sheetOpen ? filters.q : searchText) && (
                  <button
                    type="button"
                    className="clear-input-btn"
                    onClick={() => updateFilters({ ...filters, q: '' })}
                    aria-label="Hapus pencarian"
                  >
                    <CloseIcon size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            <div className="filter-section">
              <label className="field-label" htmlFor="filter-coffee">
                Karakter kopi
              </label>
              <div className="hs-select-wrap">
                <select
                  id="filter-coffee"
                  value={filters.coffee}
                  onChange={(e) =>
                    updateFilters({ ...filters, coffee: e.target.value })
                  }
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

            <div className="filter-section">
              <span className="field-label">Batas harga tertinggi</span>
              <div className="price-chips">
                <button
                  type="button"
                  className={`chip ${!filters.price_max ? 'active' : ''}`}
                  aria-pressed={!filters.price_max}
                  onClick={() => setPriceMax('')}
                >
                  Semua
                </button>
                <button
                  type="button"
                  className={`chip ${filters.price_max === '15000' ? 'active' : ''}`}
                  aria-pressed={filters.price_max === '15000'}
                  onClick={() => setPriceMax('15000')}
                >
                  ≤ 15.000
                </button>
                <button
                  type="button"
                  className={`chip ${filters.price_max === '25000' ? 'active' : ''}`}
                  aria-pressed={filters.price_max === '25000'}
                  onClick={() => setPriceMax('25000')}
                >
                  ≤ 25.000
                </button>
                <button
                  type="button"
                  className={`chip ${filters.price_max === '50000' ? 'active' : ''}`}
                  aria-pressed={filters.price_max === '50000'}
                  onClick={() => setPriceMax('50000')}
                >
                  ≤ 50.000
                </button>
              </div>
            </div>

            {atmospheres.length > 0 && (
              <div className="filter-section">
                <span className="field-label">Suasana</span>
                <div className="chips-grid">
                  {atmospheres.map((label) => {
                    const isActive = filters.atmosphere.includes(label)
                    return (
                      <button
                        key={label}
                        type="button"
                        className={`chip chip-toggle ${isActive ? 'active' : ''}`}
                        onClick={() => toggleMulti('atmosphere', label)}
                        aria-pressed={isActive}
                      >
                        {isActive && <CheckIcon size={12} />}
                        <span>{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {facilities.length > 0 && (
              <div className="filter-section filter-facilities-section">
                <span className="field-label">Fasilitas Utama</span>
                <div className="facilities-picker-list">
                  {facilities.map((label) => {
                    const isActive = filters.facility.includes(label)
                    const meta = FACILITY_META[label]
                    const IconComp = meta?.Icon || CheckIcon
                    return (
                      <button
                        key={label}
                        type="button"
                        className={`facility-picker-card ${isActive ? 'active' : ''}`}
                        onClick={() => toggleMulti('facility', label)}
                        aria-pressed={isActive}
                      >
                        <div className="facility-picker-icon-box">
                          <IconComp size={18} aria-hidden="true" />
                        </div>
                        <div className="facility-picker-info">
                          <span className="facility-picker-title">
                            {meta?.title || label}
                          </span>
                          {meta?.desc && (
                            <span className="facility-picker-desc">{meta.desc}</span>
                          )}
                        </div>
                        <div className={`facility-picker-checkbox ${isActive ? 'checked' : ''}`}>
                          {isActive && <CheckIcon size={13} strokeWidth={2.5} />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="sheet-save-row">
              <button
                type="button"
                className="sheet-apply"
                onClick={() => { setSearchParams(catalogQuery(draftFilters)); closeSheet() }}
              >
                {activeFilterCount > 0
                  ? `Terapkan Filter (${activeFilterCount} Dipilih)`
                  : 'Tampilkan Semua Kedai'}
              </button>
            </div>
          </div>
        </aside>

        {/* Results Main Area */}
        <section className="explore-results" aria-label="Hasil pencarian kedai" aria-busy={loading}>
          <div className="results-toolbar">
            <div className="results-counter" aria-live="polite">
              {error ? 'Katalog belum dapat dimuat' : <><strong>{loading ? '…' : shops.length}</strong> kedai ditemukan</>}
            </div>

            {hasActiveFilters && (
              <div className="active-pills-row">
                {filters.q && (
                  <span className="active-filter-badge">
                    Kata kunci: "{filters.q}"
                    <button
                      type="button"
                      onClick={() => updateFilters({ ...filters, q: '' })}
                      aria-label={`Hapus filter kata kunci: ${filters.q}`}
                    >
                      <CloseIcon size={12} aria-hidden="true" />
                    </button>
                  </span>
                )}
                {filters.coffee && (
                  <span className="active-filter-badge">
                    Kopi: {filters.coffee}
                    <button
                      type="button"
                      onClick={() => updateFilters({ ...filters, coffee: '' })}
                      aria-label={`Hapus filter karakter kopi: ${filters.coffee}`}
                    >
                      <CloseIcon size={12} aria-hidden="true" />
                    </button>
                  </span>
                )}
                {filters.price_max && (
                  <span className="active-filter-badge">
                    Maks. Rp {Number(filters.price_max).toLocaleString('id-ID')}
                    <button
                      type="button"
                      onClick={() => setPriceMax('')}
                      aria-label={`Hapus filter harga maksimal Rp ${Number(filters.price_max).toLocaleString('id-ID')}`}
                    >
                      <CloseIcon size={12} aria-hidden="true" />
                    </button>
                  </span>
                )}
                {filters.atmosphere.map((atm) => (
                  <span key={atm} className="active-filter-badge">
                    {atm}
                    <button
                      type="button"
                      onClick={() => toggleMulti('atmosphere', atm)}
                      aria-label={`Hapus filter suasana: ${atm}`}
                    >
                      <CloseIcon size={12} aria-hidden="true" />
                    </button>
                  </span>
                ))}
                {filters.facility.map((fac) => (
                  <span key={fac} className="active-filter-badge">
                    {fac}
                    <button
                      type="button"
                      onClick={() => toggleMulti('facility', fac)}
                      aria-label={`Hapus filter fasilitas: ${fac}`}
                    >
                      <CloseIcon size={12} aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {!loading && !error && shops.length > 0 && (
            <div className="segmented-switcher" role="group" aria-label="Urutan katalog kedai">
              <button
                type="button"
                aria-pressed={sortBy === 'all'}
                className={`segmented-tab ${sortBy === 'all' ? 'active' : ''}`}
                onClick={() => setSortBy('all')}
              >
                Nama A–Z
              </button>
              <button
                type="button"
                aria-pressed={sortBy === 'rating'}
                className={`segmented-tab ${sortBy === 'rating' ? 'active' : ''}`}
                onClick={() => setSortBy('rating')}
              >
                Rating Tertinggi
              </button>
              <button
                type="button"
                aria-pressed={sortBy === 'price'}
                className={`segmented-tab ${sortBy === 'price' ? 'active' : ''}`}
                onClick={() => setSortBy('price')}
              >
                Harga termurah
              </button>
            </div>
          )}

          {loading && (
            <div className="grid" role="status" aria-live="polite" aria-atomic="true">
              <span className="sr-only">Mencari kedai sesuai filter...</span>
              {Array.from({ length: 4 }, (_, i) => (
                <ShopCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && (
            <div className="alert alert-error" role="alert">
              <p>Gagal memuat kedai: {error}</p>
              <button type="button" className="button button-outline small" onClick={() => setRetry((n) => n + 1)}>
                Coba lagi
              </button>
            </div>
          )}

          {!loading && !error && shops.length === 0 && (
            <div className="empty-box" role="status">
              <p className="empty-title">Tidak ada kedai yang cocok</p>
              <p className="muted">
                Coba sesuaikan kata kunci atau bersihkan pilihan filter untuk melihat kedai lainnya.
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="button button-accent small"
                  onClick={clearAllFilters}
                  aria-label="Reset semua filter pencarian"
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}

          {!loading && !error && shops.length > 0 && (
            <div
              className="grid"
              key={`${filters.q}|${filters.price_max}|${filters.atmosphere.join(',')}|${filters.facility.join(',')}`}
            >
              {displayedShops.map((shop, i) => (
                <ShopCard key={shop.id} shop={shop} index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
