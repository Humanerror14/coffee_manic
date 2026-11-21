import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { usePrefersReducedMotion } from '../hooks/useMotionPreferences.js'

/**
 * RouteTransition
 * Menjalankan transisi keluar → masuk setiap kali path berubah,
 * mengembalikan scroll ke atas, dan memindahkan fokus ke konten utama.
 * Perubahan query saja (mis. filter) tidak memicu transisi halaman.
 *
 * @param {(location: import('react-router-dom').Location) => React.ReactNode} props.children
 */
export default function RouteTransition({ children }) {
  const location = useLocation()
  const [renderedLocation, setRenderedLocation] = useState(location)
  const [phase, setPhase] = useState('enter')
  const prefersReduced = usePrefersReducedMotion()

  // Sinkronkan perubahan query tanpa transisi halaman penuh.
  if (location !== renderedLocation && location.pathname === renderedLocation.pathname) {
    setRenderedLocation(location)
  }

  useEffect(() => {
    if (location === renderedLocation) return undefined

    setPhase('exit')
    const exitDuration = prefersReduced ? 0 : 140
    const timer = window.setTimeout(() => {
      setRenderedLocation(location)
      setPhase('enter')

      // Reset scroll secara instan (abaikan scroll-behavior: smooth global).
      const root = document.documentElement
      const previousBehavior = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      window.scrollTo(0, 0)
      root.style.scrollBehavior = previousBehavior
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      const main = document.getElementById('main-content')
      if (main) main.focus({ preventScroll: true })
    }, exitDuration)

    return () => window.clearTimeout(timer)
  }, [location, renderedLocation, prefersReduced])

  // Kembalikan kelas idle setelah animasi masuk selesai.
  useEffect(() => {
    if (phase !== 'enter' || prefersReduced) return undefined
    const timer = window.setTimeout(() => setPhase('idle'), 580)
    return () => window.clearTimeout(timer)
  }, [phase, prefersReduced, renderedLocation.key])

  return (
    <div
      className={`route-stage phase-${phase}`}
      data-route={renderedLocation.pathname}
    >
      <div className="route-progress" aria-hidden="true" key={renderedLocation.key} />
      {children(renderedLocation)}
    </div>
  )
}
