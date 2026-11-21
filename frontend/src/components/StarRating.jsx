import React, { useRef, useState } from 'react'
import { StarIcon, StarFilledIcon } from './CoffeeIcons.jsx'

export default function StarRating({
  value = 0,
  onChange = null,
  max = 5,
  size = 'md',
  readOnly = false,
  showNumber = true,
  label = 'Penilaian',
}) {
  const [hoverValue, setHoverValue] = useState(null)
  const buttonsRef = useRef([])
  const isInteractive = !readOnly && typeof onChange === 'function'

  const activeValue = hoverValue !== null ? hoverValue : value || 0
  const iconPixelSize = size === 'sm' ? 14 : size === 'lg' ? 24 : 18

  return (
    <div
      className={`star-rating-duotone size-${size} ${isInteractive ? 'interactive' : 'readonly'}`}
    >
      <div
        className="stars-track"
        role={isInteractive ? 'radiogroup' : 'img'}
        aria-label={`${label}: ${value > 0 ? `${value} dari ${max} bintang` : 'belum dinilai'}`}
        onMouseLeave={() => isInteractive && setHoverValue(null)}
        onKeyDown={isInteractive ? (event) => {
          let next
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = value > 0 ? value % max + 1 : 1
          else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = value > 1 ? value - 1 : max
          else if (event.key === 'Home') next = 1
          else if (event.key === 'End') next = max
          else return
          event.preventDefault()
          onChange(next)
          buttonsRef.current[next - 1]?.focus()
        } : undefined}
      >
        {Array.from({ length: max }, (_, index) => {
          const starNum = index + 1
          const isFilled = activeValue >= starNum

          if (isInteractive) {
            return (
              <button
                key={starNum}
                ref={(node) => { buttonsRef.current[index] = node }}
                type="button"
                className={`star-interactive-btn ${isFilled ? 'is-active' : ''}`}
                onClick={() => onChange(starNum)}
                onMouseEnter={() => setHoverValue(starNum)}
                onFocus={() => setHoverValue(starNum)}
                onBlur={() => setHoverValue(null)}
                aria-label={`${starNum} bintang`}
                role="radio"
                aria-checked={value === starNum}
                tabIndex={value === starNum || (!value && starNum === 1) ? 0 : -1}
              >
                {isFilled ? (
                  <StarFilledIcon size={iconPixelSize} />
                ) : (
                  <StarIcon size={iconPixelSize} />
                )}
              </button>
            )
          }

          return (
            <span
              key={starNum}
              className={`star-glyph ${isFilled ? 'is-active' : 'is-empty'}`}
              aria-hidden="true"
            >
              {isFilled ? (
                <StarFilledIcon size={iconPixelSize} />
              ) : (
                <StarIcon size={iconPixelSize} />
              )}
            </span>
          )
        })}
      </div>
      {showNumber && value > 0 && (
        <span className="star-score-val">
          {Number(value).toFixed(1)}
        </span>
      )}
      {isInteractive && value > 0 && (
        <button type="button" className="rating-clear" onClick={() => onChange(null)} aria-label={`Hapus ${label.toLowerCase()}`}>
          Hapus
        </button>
      )}
    </div>
  )
}
