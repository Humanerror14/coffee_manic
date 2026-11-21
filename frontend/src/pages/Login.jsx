import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../authContext.jsx'
import { CoffeeCupIcon } from '../components/CoffeeIcons.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
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
          <h1 className="page-title">Masuk ke Coffee Manic</h1>
          <p className="page-desc">
            Akses ulasan dan berpartisipasi dalam komunitas pecinta kopi Lhoksukon.
          </p>
        </div>

        <form onSubmit={submit} className="stack">
          <div className="form-field">
            <label htmlFor="email" className="field-label">
              Alamat email <span className="required-indicator" aria-label="wajib">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@domain.com"
              autoComplete="email"
              required
              autoFocus
              className="form-input"
              aria-invalid={error ? 'true' : undefined}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="form-input"
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? 'form-error' : undefined}
            />
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
                <span>Memproses…</span>
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Belum memiliki akun?{' '}
            <Link to="/daftar" className="auth-link">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
