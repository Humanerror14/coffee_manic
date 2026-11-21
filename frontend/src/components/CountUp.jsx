import React, { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../hooks/useMotionPreferences.js'

/**
 * CountUp
 * Menganimasikan angka dari 0 ke nilai target saat pertama kali berubah.
 * Menghormati prefers-reduced-motion dan dapat diakses pembaca layar
 * (nilai akhir selalu tersedia sebagai teks).
 */
export default function CountUp({ value, duration = 900, suffix = '', className = '' }) {
  const target = Number.isFinite(Number(value)) ? Number(value) : 0
  const prefersReduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(prefersReduced ? target : 0)
  const frameRef = useRef(0)
  const startedFor = useRef(null)

  useEffect(() => {
    if (prefersReduced || target === 0) {
      setDisplay(target)
      return undefined
    }
    if (startedFor.current === target) return undefined
    startedFor.current = target

    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration)
      // Ease-out cubic agar angka melambat presisi di nilai akhir.
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(target * eased))
      if (progress < 1) {
        frameRef.current = window.requestAnimationFrame(tick)
      }
    }

    frameRef.current = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameRef.current)
  }, [target, duration, prefersReduced])

  return (
    <span className={className}>
      {display}
      {suffix}
    </span>
  )
}
