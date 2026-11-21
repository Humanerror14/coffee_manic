import assert from 'node:assert/strict'
import test from 'node:test'
import { catalogQuery, readCatalogFilters } from '../src/catalogFilters.js'

test('filter kosong menghasilkan URL katalog tanpa parameter kosong', () => {
  assert.equal(catalogQuery(readCatalogFilters(new URLSearchParams())), '')
})

test('filter kombinasi dan pilihan berulang bertahan saat URL dibuka kembali', () => {
  const filters = {
    q: 'Kopi & Teman', coffee: 'V60', price_max: '25000',
    atmosphere: ['Tenang', 'Outdoor'], facility: ['Wi-Fi', 'Stopkontak'],
  }
  assert.deepEqual(readCatalogFilters(new URLSearchParams(catalogQuery(filters))), filters)
})

test('filter scalar beranda dapat dibaca sebagai multi-pilihan katalog', () => {
  const params = new URLSearchParams(catalogQuery({ atmosphere: 'Tenang', facility: 'Wi-Fi' }))
  assert.deepEqual(params.getAll('atmosphere'), ['Tenang'])
  assert.deepEqual(params.getAll('facility'), ['Wi-Fi'])
})

test('spasi dibersihkan dan karakter khusus tidak merusak parameter lain', () => {
  const params = new URLSearchParams(catalogQuery({ q: '  Kopi + Susu & Roti?  ', coffee: '  ', facility: [] }))
  assert.equal(params.get('q'), 'Kopi + Susu & Roti?')
  assert.equal(params.size, 1)
})

test('reset menghapus seluruh filter; parameter asing tidak ikut dikirim ke API', () => {
  const params = new URLSearchParams('q=kopi&facility=Wi-Fi&unexpected=value')
  assert.equal(new URLSearchParams(catalogQuery(readCatalogFilters(params))).has('unexpected'), false)
  assert.equal(catalogQuery({ q: '', coffee: '', price_max: '', atmosphere: [], facility: [] }), '')
})

test('pembacaan filter tidak mengubah URL sumber atau pilihan berulang', () => {
  const params = new URLSearchParams('facility=Wi-Fi&facility=Musala')
  const filters = readCatalogFilters(params)
  filters.facility.push('AC')
  assert.deepEqual(params.getAll('facility'), ['Wi-Fi', 'Musala'])
})
