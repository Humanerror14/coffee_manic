import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../authContext.jsx'
import { CoffeeCupIcon } from '../components/CoffeeIcons.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(form.email, form.password, form.displayName)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <span className="auth-icon" aria-hidden="true">
            <CoffeeCupIcon size={24} />
          </span>
          <h1 className="page-title">Buat akun</h1>
          <p className="page-desc">
            Daftar untuk membagikan ulasan kedai kopi lokal di Lhoksukon.
          </p>
        </div>

        <form onSubmit={submit} className="stack">
          <div className="form-field">
            <label htmlFor="displayName" className="field-label">
              Nama tampilan <span className="required-indicator" aria-label="wajib">*</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="Nama atau nama panggilan"
              autoComplete="nickname"
              required
              autoFocus
              className="form-input"
              aria-describedby={error ? 'form-error' : undefined}
            />
          </div>

          <div className="form-field">
            <label htmlFor="email" className="field-label">
              Alamat email <span className="required-indicator" aria-label="wajib">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="nama@domain.com"
              autoComplete="email"
              required
              className="form-input"
              aria-describedby={error ? 'form-error' : undefined}
            />
          </div>

          <div className="form-field">
            <label htmlFor="password" className="field-label">
              Kata sandi <span className="required-indicator" aria-label="wajib">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              required
              minLength={8}
              className="form-input"
              aria-describedby={error ? 'password-hint form-error' : 'password-hint'}
            />
            <p id="password-hint" className="field-hint">
              Minimal 8 karakter.
            </p>
          </div>

          {error && (
            <div id="form-error" className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button button-accent full-width"
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Mendaftarkan…</span>
              </>
            ) : (
              'Daftar akun'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Sudah memiliki akun?{' '}
            <Link to="/login" className="auth-link">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
