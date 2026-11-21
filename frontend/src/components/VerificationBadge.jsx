import React from 'react'
import { VerifiedSealIcon } from './CoffeeIcons.jsx'

const STATUS_CONFIG = {
  verified: {
    label: 'Terverifikasi',
    desc: 'Data telah diverifikasi oleh tim kurator lokal',
  },
  unverified: {
    label: 'Belum diverifikasi',
    desc: 'Informasi dihimpun dari sumber publik, belum diverifikasi di lapangan',
  },
  pending: {
    label: 'Menunggu verifikasi',
    desc: 'Sedang dalam antrean pemeriksaan kurator',
  },
  needs_review: {
    label: 'Perlu ditinjau',
    desc: 'Terdapat pembaruan data atau laporan yang perlu ditinjau ulang',
  },
}

export default function VerificationBadge({ status = 'unverified', size = 'normal' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.unverified

  return (
    <span
      className={`seal-badge seal-${status} seal-${size}`}
      title={config.desc}
      tabIndex={0}
      role="status"
    >
      {status === 'verified' && (
        <VerifiedSealIcon size={size === 'small' ? 13 : 15} className="seal-icon" />
      )}
      <span className="seal-text">{config.label}</span>
    </span>
  )
}
