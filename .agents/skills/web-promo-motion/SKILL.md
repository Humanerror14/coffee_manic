---
name: web-promo-motion
description: >-
  Create high-impact promotional motion videos, teaser animations, visual storyboards, and synchronized voiceover audio scripts to showcase and promote web applications (including Coffee Manic). Use when the user asks to create motion videos, promo teasers, video ads, social media reels, or short promotional walkthroughs with voice over narration.
---

# Web Promo Motion & Voiceover Skill

Panduan terpadu untuk merancang, memproduksi, dan mengimplementasikan video motion grafis promosi web serta naskah voice over (VO) deskriptif berenergi tinggi yang memikat audiens dalam 15–60 detik.

---

## 1. Arsitektur Video Promosi Web (Formula 5-Fase)

Video promosi web yang efektif harus memikat perhatian dalam 3 detik pertama dan menyampaikan nilai produk secara presisi:

```
┌──────────────┬──────────────┬─────────────────────────┬──────────────────────┬─────────────┐
│ 00:00–00:03  │ 00:03–00:08  │ 00:08–00:20             │ 00:20–00:25          │ 00:25–00:30 │
│   THE HOOK   │  THE PROBLEM │  SOLUTION & UI SHOWCASE │ PROOF & KEY VALUE    │  STRONG CTA │
│ Visual jeda  │ Keresahan    │ Reveal antarmuka web,   │ Data riil, ulasan    │ Logo, URL,  │
│ kinetik kuat │ pengguna     │ interaksi fitur utama   │ fasilitas, verifikasi│ ajakan aksi │
└──────────────┴──────────────┴─────────────────────────┴──────────────────────┴─────────────┘
```

1. **Fase 1: The Hook (0–3 detik)**
   - Pertanyaan tajam, visual kinetik dinamis, atau kontras yang menghentikan scroll di media sosial.
   - Contoh: *"Bingung cari warkop nyaman buat nugas atau santai di Lhoksukon?"*
2. **Fase 2: The Problem (3–8 detik)**
   - Menyoroti friksi: warkop penuh colokan tapi tanpa Wi-Fi, jam buka tidak jelas, atau tempat bising.
3. **Fase 3: Solution & UI Showcase (8–20 detik)**
   - Reveal aplikasi web dengan animasi transisi smooth, spotlight fitur, mock-up perangkat bergerak (isometric/flat UI), dan filter interaktif.
4. **Fase 4: Social Proof & Verifikasi (20–25 detik)**
   - Menampilkan kredibilitas: kurasi data lapangan, badge verifikasi kurator, ulasan komunitas riil, foto asli suasana.
5. **Fase 5: Call to Action & Brand Outro (25–30 detik)**
   - Tampilan logo bersih, tagline, URL domain, dan ajakan klik yang persuasif.

---

## 2. Standar Voice Over (VO) & Audio Direction

### A. Karakter Suara Narator
- **Nada / Persona**: Hangat, bersahabat, percaya diri, dan natural (bukan seperti robot kaku atau pembaca berita formal).
- **Tempo**: 130–150 kata per menit (WPM) untuk video 30 detik (sekitar 65–75 kata total).
- **Artikulasi**: Jelas, artikulatif, menekankan kata-kata kunci (*"terkurasi"*, *"Wi-Fi"*, *"stopkontak"*, *"foto asli"*).

### B. Format Naskah Voice Over dengan Audio Cues
Setiap naskah voiceover harus menyertakan penanda waktu (*timecode*), deskripsi visual motion, dan panduan efek suara (*SFX / BGM*):

| Detik | Visual Motion | Voice Over (Bahasa Indonesia) | Audio / SFX |
|---|---|---|---|
| `00:00–00:04` | Zoom cepat ke cangkir kopi mengepul, teks tipografi kinetik tebal: *"CARI WARKOP PAS?"* | *"Lagi pengen ngopi atau nugas di Lhoksukon, tapi bingung mau ke mana?"* | Beat bass masuk, swoosh ringan |
| `00:04–00:08` | Mockup mobile goyang halus, ikon tanda tanya bergeser: Wi-Fi lemot, colokan penuh. | *"Pernah ke warkop tapi colokan penuh atau Wi-Fi nggak jalan?"* | Vinyl stop scratch halus |
| `00:08–00:15` | Layar transisi bersih ke antarmuka Coffee Manic, spotlight kartu kedai menyala. | *"Tenang, kini ada Coffee Manic! Platform penemuan kedai kopi lokal terkurasi di Lhoksukon."* | Upbeat lofi acoustic groove |
| `00:15–00:22` | Bottom sheet filter meluncur mulus: klik tag Wi-Fi, Suasana Tenang, dan foto asli kedai terbuka. | *"Filter fasilitas sesukamu — cari yang tenang buat kerja, ada stopkontak, sampai cek profil seduhan dan foto aslinya."* | Pop click SFX, smooth slide SFX |
| `00:22–00:26` | Layar detail kedai, badge "Terverifikasi", tombol navigasi Google Maps menyala. | *"Data riil terverifikasi kurator dengan navigasi peta instan ke lokasi."* | Bell chime konfirmasi |
| `00:26–00:30` | Logo Coffee Manic muncul anggun di tengah kanvas, teks URL: `coffeemanic.local`. | *"Buka Coffee Manic sekarang, dan temukan sudut ngopi ternyamanmu!"* | Melodic finish out, fade out |

---

## 3. Metode Implementasi Video Motion

Skill ini menyediakan 3 pendekatan teknis untuk menghasilkan video motion:

### Pendekatan 1: Standalone HTML5/Canvas Motion Player (Interaktif & Instan)
Menggunakan Web Animations API, SVG motion, Canvas, dan Web Speech Synthesis / Web Audio API.
- **Kelebihan**: Berjalan langsung di peramban web tanpa perlu instalasi biner pihak ketiga.
- **Output**: Presentasi visual interaktif 60fps dengan suara narasi voiceover langsung dari browser.
- **Implementasi**: Lihat berkas contoh template di [`examples/promo-player.html`](./examples/promo-player.html).

### Pendekatan 2: Code-Driven Video dengan Remotion (React Framework)
Jika project menggunakan ekosistem React + Node.js:
- Struktur komponen video berbasis waktu (`useCurrentFrame`, `interpolate`, `spring`).
- Presisi frame demi frame (30fps / 60fps) dan dapat dirender menjadi format `.mp4` menggunakan CLI `npx remotion render`.

### Pendekatan 3: Automated Browser Capture (Playwright / Puppeteer)
- Menjalankan perekaman layar animasi demo UI rute web (Beranda → Jelajahi → Buka Filter Bottom Sheet → Buka Detail Kedai → Tampilkan Galeri Foto).
- Menggabungkan rekaman layar dengan trek audio narasi voiceover menggunakan skrip FFmpeg.

---

## 4. Template Naskah Voice Over Coffee Manic

### Versi Singkat 15 Detik (Story / TikTok / Reels Ad)
> **[00:00–00:03]** *(Visual: Logo Coffee Manic zoom-in dengan secangkir kopi)*  
> **VO**: *"Lagi nyari tempat ngopi yang asyik di Lhoksukon?"*  
>  
> **[00:03–00:10]** *(Visual: Filter instan beralih dari Wi-Fi ke suasana tenang nugas, foto kedai muncul)*  
> **VO**: *"Buka Coffee Manic! Cek kedai dengan Wi-Fi kencang, stopkontak melimpah, dan foto riil terverifikasi."*  
>  
> **[00:10–00:15]** *(Visual: Tombol rute peta klik, logo & URL)*  
> **VO**: *"Tinggal klik, rute langsung terbuka. Jelajahi warkop favoritmu di Coffee Manic!"*

### Versi Lengkap 30 Detik (Full Promo Web Teaser)
> **[00:00–00:04]** *(Visual: Typo kinetik 'CARI WARKOP?'. Transisi geser cepat ke peta Lhoksukon)*  
> **VO**: *"Di Lhoksukon ada puluhan kedai kopi... tapi mana yang paling pas buat kebutuhanmu hari ini?"*  
>  
> **[00:04–00:09]** *(Visual: Ilustrasi kebutuhan — nugas fokus vs nongkrong santai rame-rame)*  
> **VO**: *"Butuh suasana tenang buat kerja skripsi? Atau outdoor luas buat kumpul bareng teman?"*  
>  
> **[00:09–00:18]** *(Visual: Layar beranda Coffee Manic, spotlight kartu kedai Canden Kupi & Aceh Kopi, foto cover HD)*  
> **VO**: *"Kenalkan Coffee Manic — panduan penemuan kedai kopi lokal terkurasi. Lengkap dengan informasi jam buka, menu khas, harga, dan dokumentasi foto asli."*  
>  
> **[00:18–00:24]** *(Visual: Bottom sheet filter fasilitas terbuka mulus, toggle Wi-Fi, Stopkontak, Musala)*  
> **VO**: *"Filter berdasarkan fasilitas yang kamu butuhkan, cek ulasan jujur komunitas, dan langsung buka petunjuk arah peta."*  
>  
> **[00:24–00:30]** *(Visual: Badge Terverifikasi Kurator, outro logo elegan dengan URL)*  
> **VO**: *"Nggak perlu bingung lagi. Kunjungi Coffee Manic sekarang, dan nikmati kopi terbaik di kotamu!"*

---

## 5. Panduan Visual Motion Anti-Slop
Patuhi kaidah desain bersih saat menyusun motion video promosi:
- **Zero-Emoji**: Hindari emoji terbang (`☕🔥✨`). Gunakan tipografi editorial berkelas, garis aksen geometris halus, dan ikon vektor minimalis (seperti icon Lucide / Iconoir).
- **Palet Warna Terkendali**: Gunakan warna kanvas gelap premium (`#0F0F14`), aksen hangat kopi (`#E58A38`), dan teks putih krem (`#FAF6EE`).
- **Timing & Easing**: Gunakan bezier kurva fisika lembut (`cubic-bezier(0.16, 1, 0.3, 1)`) untuk gerakan masuk, bukan linier kaku.
