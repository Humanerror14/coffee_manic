import { useEffect, useState } from 'react'

/**
 * usePrefersReducedMotion
 * Mendeteksi preferensi pengguna untuk mengurangi animasi.
 * Semua animasi di Coffee Manic wajib menghormati nilai ini.
 */
export function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (!window.matchMedia) return undefined
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (event) => setPrefersReduced(event.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return prefersReduced
}

/**
 * useInView
 * Menandai elemen saat masuk viewport (sekali saja) untuk animasi reveal.
 */
export function useInView({ threshold = 0.12, rootMargin = '0px 0px -8% 0px' } = {}) {
  const [node, setNode] = useState(null)
  const [inView, setInView] = useState(false)
  const prefersReduced = usePrefersReducedMotion()

  useEffect(() => {
    if (prefersReduced) {
      setInView(true)
      return undefined
    }
    if (!node) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [node, threshold, rootMargin, prefersReduced])

  return [setNode, inView]
}

/**
 * useMediaQuery
 * Hook untuk responsive design dengan media queries.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event) => setMatches(event.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}
