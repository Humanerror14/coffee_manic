import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../authContext.jsx'
import { UserIcon } from '../components/CoffeeIcons.jsx'

export default function Profile() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return <div className="container profile-page" role="status">Memuat profil akun…</div>
  }

  if (!user) {
    return (
      <div className="container auth-page">
        <div className="card auth-card">
          <div className="auth-header">
            <span className="auth-icon" aria-hidden="true">
              <UserIcon size={32} />
            </span>
            <h1 className="page-title">Profil Pengguna</h1>
            <p className="page-desc">Silakan masuk untuk mengakses halaman profil.</p>
          </div>
          <div className="auth-prompt-buttons">
            <Link to="/login" className="button button-accent full-width">
              Masuk
            </Link>
            <Link to="/daftar" className="button button-outline full-width">
              Daftar
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="container profile-page">
      <div className="card profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <UserIcon size={28} />
          </div>
          <div>
            <h1 className="profile-name">{user.display_name || 'Pengguna'}</h1>
            <span className="role-pill">
              {user.role === 'admin' ? 'Administrator' : 'Anggota Komunitas'}
            </span>
          </div>
        </div>

        <div className="profile-details">
          <dl className="sidebar-meta-list">
            <div className="meta-row">
              <dt>Nama tampilan</dt>
              <dd>{user.display_name}</dd>
            </div>
            <div className="meta-row">
              <dt>Alamat email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="meta-row">
              <dt>Wilayah</dt>
              <dd>Kecamatan Lhoksukon, Aceh Utara</dd>
            </div>
          </dl>
        </div>

        <div className="profile-actions">
          {user.role === 'admin' && (
            <Link to="/admin" className="button button-accent full-width">
              Buka Dashboard Admin
            </Link>
          )}
          <button
            type="button"
            className="button button-outline-danger full-width"
            onClick={handleLogout}
          >
            Keluar dari Akun
          </button>
        </div>
      </div>
    </div>
  )
}
