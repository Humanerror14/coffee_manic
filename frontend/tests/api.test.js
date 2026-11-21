import assert from 'node:assert/strict'
import { afterEach, beforeEach, mock, test } from 'node:test'
import { api, getToken, setToken } from '../src/api.js'

beforeEach(() => {
  const storage = new Map()
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  }
})

afterEach(() => {
  mock.restoreAll()
  delete globalThis.localStorage
})

test('pemeriksaan akun menyertakan token hanya saat autentikasi diminta', async () => {
  setToken('test-session-token')
  const fetch = mock.method(globalThis, 'fetch', async () => Response.json({ data: { user: { id: 'test-user' } } }))
  assert.deepEqual(await api.get('/auth/me', true), { user: { id: 'test-user' } })
  assert.equal(fetch.mock.calls[0].arguments[0], '/api/auth/me')
  assert.equal(fetch.mock.calls[0].arguments[1].headers.Authorization, 'Bearer test-session-token')
  await api.get('/shops')
  assert.equal(fetch.mock.calls[1].arguments[1].headers.Authorization, undefined)
})

test('request pencarian menerima sinyal pembatalan dan meneruskan AbortError', async () => {
  const controller = new AbortController()
  mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options.signal, controller.signal)
    return new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    })
  })
  const pending = api.get('/shops?q=lama', false, { signal: controller.signal })
  controller.abort()
  await assert.rejects(pending, { name: 'AbortError' })
})

test('HTTP 429 menampilkan waktu tunggu dari Retry-After', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({ error: { message: 'Rate limited' } }, {
    status: 429, headers: { 'Retry-After': '12' },
  }))
  await assert.rejects(api.get('/shops'), { message: 'Terlalu banyak permintaan. Coba lagi dalam 12 detik.', status: 429 })
})

test('error API mempertahankan pesan validasi dan statusnya', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({ error: { message: 'Rating harus berada pada rentang 1–5.' } }, { status: 422 }))
  await assert.rejects(api.post('/shops/test/reviews', {}), { message: 'Rating harus berada pada rentang 1–5.', status: 422 })
})

test('respons error non-JSON tetap menghasilkan pesan yang dapat dipahami', async () => {
  mock.method(globalThis, 'fetch', async () => new Response('Unavailable', { status: 503 }))
  await assert.rejects(api.get('/shops'), { message: 'Permintaan belum berhasil. Silakan coba lagi.', status: 503 })
})

test('logout menghapus token sehingga request berikutnya tidak memakai sesi lama', async () => {
  setToken('test-session-token')
  setToken(null)
  assert.equal(getToken(), null)
  const fetch = mock.method(globalThis, 'fetch', async () => Response.json({ data: {} }))
  await api.get('/auth/me', true)
  assert.equal(fetch.mock.calls[0].arguments[1].headers.Authorization, undefined)
})

test('kegagalan jaringan memiliki pesan pemulihan dalam Bahasa Indonesia', async () => {
  mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch') })
  await assert.rejects(api.get('/shops'), { message: 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.' })
})
