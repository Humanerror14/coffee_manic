---
name: seo-content-craft
description: >-
  Optimize web content, page metadata, local search visibility, and copywriting for search engines and high-conversion engagement. Use when the user asks to improve SEO, craft compelling descriptions, write search-optimized content, generate Schema.org structured data, or enhance website titles and meta tags.
---

# SEO Content Craft & Copywriting Skill

Panduan terpadu untuk merancang konten web yang ramah mesin pencari (SEO On-Page & Local SEO), kaya kata kunci strategis, sekaligus memikat indra pembaca dengan gaya penulisan manusiawi (*sensory-rich copywriting*), terbebas dari klise AI (*anti AI-slop*).

---

## 1. Fondasi Local SEO & Arsitektur Konten

Untuk platform penemuan lokal (seperti direktori kedai kopi Lhoksukon):
1. **Keyword Intent Mapping (Niat Pencarian)**:
   - *Navigational*: "Coffee Manic Lhoksukon", "Canden Kupi lokasi".
   - *Informational*: "warkop 24 jam di Lhoksukon", "tempat nugas ada wifi di aceh utara".
   - *Transactional / Commercial*: "kedai kopi terbaik di lhoksukon", "rekomendasi kopi sanger lhoksukon".
2. **Formula Judul Halaman (Title Tag — Maks. 60 Karakter)**:
   `[Kata Kunci Utama] – [Nilai Unik / Diferensiator] | [Nama Brand]`
   *Contoh*: `26 Kedai Kopi Terbaik di Lhoksukon (Ada Wi-Fi & Foto Asli) | Coffee Manic`
3. **Formula Deskripsi Meta (Meta Description — 140–155 Karakter)**:
   `[Masalah / Hook] + [Solusi / Fitur Utama] + [Panggilan Aksi (CTA)]`
   *Contoh*: `Cari warkop nyaman di Lhoksukon buat nugas atau santai? Temukan 26 kedai kopi lokal terkurasi lengkap dengan info Wi-Fi, stopkontak, menu & foto asli.`

---

## 2. Sensory Copywriting (Menghidupkan Deskripsi Kedai)

Hindari deskripsi generik seperti *"Kedai ini sangat bagus dan nyaman untuk semua orang."*  
Gunakan **Formula 3-Sensori**:

| Dimensi | Elemen Sensoris | Contoh Kalimat Memikat |
|---|---|---|
| **Aroma & Rasa** | Biji sangrai, crema emas, tarikan sanger, rempah | *"Aroma pekat robusta tubruk yang baru diseduh menyambut dari ambang pintu, berpadu gurihnya kopi sanger kental khas racikan barista senior."* |
| **Suasana & Tata Suara** | Gemerincing cangkir keramik, semilir angin, ketenangan | *"Meja kayu panjang dengan pencahayaan hangat dan jarak stopkontak yang dekat, cocok untuk fokus mengetik tugas di tengah desir angin sore."* |
| **Keaslian & Komunitas** | Tradisi lokal, kehangatan interaksi | *"Pusat silaturahmi warga dari lintas generasi, tempat obrolan hangat ditemani piring kecil ketan srikaya dan cangkir saring panas."* |

---

## 3. Schema.org Structured Data (JSON-LD)

Gunakan schema `CafeOrCoffeeShop` dan `LocalBusiness` untuk memicu *Rich Snippets* di Google Search:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  "name": "Canden Kupi",
  "image": "https://lh3.googleusercontent.com/grass-cs/AABkmLeR2uyaHMZx1rEc7-ly14KZtX5GYaz3TwEchSdyRxLPZnG6BXwrvAK6nZKbjLJnSI5CMeVw0NChSfBiqWsj9-EalarbXUdsxWCuvY5m_CE-Q9UB9Zb9y1BSY-BHZAWuxi1tUhBb=w800-h600-k-no",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Kuta Lhoksukon",
    "addressLocality": "Lhoksukon",
    "addressRegion": "Aceh Utara",
    "postalCode": "24376",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 5.0411561,
    "longitude": 97.3212276
  },
  "priceRange": "Rp 1.000 – Rp 25.000",
  "servesCuisine": "Kopi Aceh, Sanger, Kopi Tubruk",
  "telephone": "+62 831-8903-4410",
  "openingHours": "Mo-Su 07:00-00:00"
}
</script>
```

---

## 4. Checklist Kualitas SEO Konten

- [ ] **Hierarki Heading Tunggal (`h1`)**: Setiap halaman memiliki tepat satu `<h1>` yang memuat keyword target utama.
- [ ] **Semantic Structure**: Gunakan `<article>`, `<section>`, `<nav>`, `<aside>`, dan `<header>` alih-alih `<div>` bertingkat tak bermakna.
- [ ] **Alt Text Deskriptif untuk Gambar**: Format alt text: `[Nama Objek] di [Nama Kedai] [Lokasi]`. Contoh: `Cangkir kopi sanger dan suasana area duduk di Canden Kupi Lhoksukon`.
- [ ] **OpenGraph & Twitter Card**: Menyediakan `og:title`, `og:description`, `og:image`, `og:url`, dan `twitter:card` berukuran minimal `1200x630`.
- [ ] **Internal Linking Alami**: Hubungkan antar-entitas (misal dari kartu suasana "Tenang Nugas" langsung ke parameter filter terfilter rapi).
