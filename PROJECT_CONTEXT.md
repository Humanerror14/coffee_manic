# PROJECT_CONTEXT.md

Dokumen ini berisi konteks produk dan keputusan tetap Coffee Manic. Dibaca oleh AI coding agent sebelum mengubah arsitektur atau fitur.

## Identitas proyek

Coffee Manic adalah platform web penemuan kedai kopi lokal dan komunitas pecinta kopi. Pengguna menemukan kedai berdasarkan preferensi kopi, suasana, fasilitas, kisaran harga, lokasi, dan pengalaman komunitas.

## Konfigurasi tetap (jangan ubah tanpa instruksi eksplisit)

- **Platform:** web application
- **Frontend:** React.js + Vite
- **Backend:** Python + Flask
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Editor:** Visual Studio Code
- **Version control:** Git + GitHub
- **Bahasa dokumentasi:** Bahasa Indonesia
- **Wilayah pilot:** Kecamatan Lhoksukon, Kabupaten Aceh Utara

## Keputusan arsitektur

- **Modular monolith.** Frontend dan backend terpisah dalam satu repository.
- **REST API** dengan prefix `/api`.
- **Aplikasi factory + blueprint** di Flask; pisahkan route, model, service, dan validasi ketika kompleksitas meningkat.
- **SQLAlchemy** sebagai ORM; **Alembic/Flask-Migrate** untuk migrasi skema.
- **UUID** sebagai primary key; `TIMESTAMPTZ` untuk waktu; constraint dan index relevan.

## Aturan produk

- Prioritas: katalog kedai → pencarian/filter → detail kedai → peta/navigasi → rating → ulasan → admin verifikasi.
- Rekomendasi awal berbasis aturan (rule-based), bukan machine learning.
- Jangan tambahkan ke MVP: pembayaran, delivery, loyalty, subscription, AI recommendation, ekspansi nasional.
- MVP hanya wilayah pilot Lhoksukon.

## Aturan data

- Setiap data kedai mencatat sumber, URL/referensi, tanggal pemeriksaan, status verifikasi, dan catatan.
- Bedakan **belum diketahui**, **belum diverifikasi**, dan **tidak tersedia**.
- Jangan mengarang data. Patuhi ketentuan layanan dan hak cipta.
- Jangan gunakan foto, logo, deskripsi, atau ulasan tanpa hak penggunaan yang jelas.
- Jangan mengumpulkan data pribadi yang tidak diperlukan.

## Sistem rating

Skala 1–5 pada lima kategori: Coffee Quality, Atmosphere, Service, Price Value, Cleanliness. Nilai kosong berarti belum dinilai, bukan nol.

## Status verifikasi data

`unverified` · `pending` · `verified` · `needs_review`

## Keamanan & privasi

- Password di-hash (tidak pernah plaintext).
- Secret dan token disimpan di environment variable, tidak di-commit.
- Error API konsisten, tidak membocorkan stack trace.
- Log tidak menyimpan password atau token rahasia.
- Autentikasi/otorisasi pada endpoint privat.
