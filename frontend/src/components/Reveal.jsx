import React from 'react'
import { useInView } from '../hooks/useMotionPreferences.js'

/**
 * Reveal
 * Membungkus konten agar muncul dengan transisi presisi saat discroll.
 * Arah: up | down | left | right | scale | none
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  direction = 'up',
  distance = 22,
  delay = 0,
  duration = 620,
  className = '',
  style,
  ...rest
}) {
  const [ref, inView] = useInView()

  const offsets = {
    up: { '--rv-y': `${distance}px`, '--rv-x': '0px', '--rv-scale': 1 },
    down: { '--rv-y': `-${distance}px`, '--rv-x': '0px', '--rv-scale': 1 },
    left: { '--rv-x': `${distance}px`, '--rv-y': '0px', '--rv-scale': 1 },
    right: { '--rv-x': `-${distance}px`, '--rv-y': '0px', '--rv-scale': 1 },
    scale: { '--rv-x': '0px', '--rv-y': '0px', '--rv-scale': 0.96 },
    none: { '--rv-x': '0px', '--rv-y': '0px', '--rv-scale': 1 },
  }

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`.trim()}
      style={{
        ...offsets[direction],
        '--rv-delay': `${delay}ms`,
        '--rv-dur': `${duration}ms`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
