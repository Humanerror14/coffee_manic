// Satu format URL untuk pencarian beranda, filter katalog, dan navigasi kembali.
export function readCatalogFilters(params) {
  return {
    q: params.get('q') || '',
    coffee: params.get('coffee') || '',
    price_max: params.get('price_max') || '',
    atmosphere: params.getAll('atmosphere'),
    facility: params.getAll('facility'),
  }
}

export function catalogQuery(filters) {
  const params = new URLSearchParams()
  for (const key of ['q', 'coffee', 'price_max', 'atmosphere', 'facility']) {
    const values = Array.isArray(filters[key]) ? filters[key] : [filters[key]]
    for (const value of values) {
      if (value != null && String(value).trim()) params.append(key, String(value).trim())
    }
  }
  return params.toString()
}
