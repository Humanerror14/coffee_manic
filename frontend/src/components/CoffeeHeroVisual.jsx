import React from 'react'

export default function CoffeeHeroVisual() {
  return (
    <figure className="home-hero-photo">
      <img
        src="/assets/branding/kopi-saring-aceh.jpg"
        alt="Ilustrasi proses menuang kopi melalui saringan kain"
        width={399}
        height={501}
        fetchpriority="high"
      />
      <figcaption>Ilustrasi tradisi kopi saring Aceh</figcaption>
    </figure>
  )
}
