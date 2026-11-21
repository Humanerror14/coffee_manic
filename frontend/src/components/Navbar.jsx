import React, { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../authContext.jsx'
import ScrollProgress from './ScrollProgress.jsx'
import {
  CoffeeCupIcon,
  UserIcon,
  ArrowUpRightIcon,
} from './CoffeeIcons.jsx'

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className={`navbar-canvas ${isScrolled ? 'is-scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link to="/" className="brand-lockup" aria-label="Coffee Manic — beranda">
          <span className="brand-emblem" aria-hidden="true">
            <CoffeeCupIcon size={20} />
          </span>
          <span className="brand-title">Coffee Manic</span>
        </Link>

        <nav className="nav-menu" aria-label="Navigasi utama">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
          >
            Beranda
          </NavLink>
          <NavLink
            to="/jelajahi"
            className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
          >
            Jelajahi
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              Kurator
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {loading ? (
            <span className="nav-account-status" role="status">Memuat akun…</span>
          ) : user ? (
            <div className="user-logged-box">
              <NavLink
                to="/profil"
                className={({ isActive }) => `user-chip ${isActive ? 'is-active' : ''}`}
                title="Buka profil akun"
              >
                <UserIcon size={15} />
                <span className="user-chip-label">
                  {user.display_name || user.email.split('@')[0]}
                </span>
              </NavLink>
              <button
                type="button"
                className="btn-text-subtle"
                onClick={handleLogout}
                title="Keluar"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="auth-pill-group">
              <Link to="/login" className="btn-link-nav">
                Masuk
              </Link>
              <Link to="/daftar" className="btn-pill-cta" title="Daftar komunitas">
                <span>Daftar</span>
                <ArrowUpRightIcon size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>
      <ScrollProgress />
    </header>
  )
}
