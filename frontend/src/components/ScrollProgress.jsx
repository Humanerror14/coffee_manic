import React, { useEffect, useRef } from 'react'

/**
 * ScrollProgress
 * Garis progres baca fixed di atas viewport.
 * Diperbarui via requestAnimationFrame tanpa memicu render React.
 */
export default function ScrollProgress() {
  const fillRef = useRef(null)

  useEffect(() => {
    let frame = 0
    let lastValue = -1

    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - window.innerHeight
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      if (Math.abs(ratio - lastValue) < 0.002) return
      lastValue = ratio
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${ratio})`
      }
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress-fill" ref={fillRef} />
    </div>
  )
}
