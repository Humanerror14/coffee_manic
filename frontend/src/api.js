const TOKEN_KEY = 'coffee_manic_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = false, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.')
  }
  let payload = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }
  if (!res.ok) {
    const retryAfter = Number(res.headers.get('Retry-After'))
    const message = res.status === 429 && retryAfter > 0
      ? `Terlalu banyak permintaan. Coba lagi dalam ${Math.ceil(retryAfter)} detik.`
      : payload?.error?.message || 'Permintaan belum berhasil. Silakan coba lagi.'
    const error = new Error(message)
    error.status = res.status
    throw error
  }
  return payload?.data
}

export const api = {
  get: (path, auth = false, { signal } = {}) => request(path, { auth, signal }),
  post: (path, body, auth = false) => request(path, { method: 'POST', body, auth }),
  patch: (path, body, auth = true) => request(path, { method: 'PATCH', body, auth }),
  del: (path, auth = true) => request(path, { method: 'DELETE', auth }),
}
