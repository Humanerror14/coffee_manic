import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    api
      .get('/auth/me', true)
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password })
    setToken(data.access_token)
    setUser(data.user)
    return data.user
  }

  const register = async (email, password, displayName) => {
    const data = await api.post('/auth/register', {
      email,
      password,
      display_name: displayName,
    })
    setToken(data.access_token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
