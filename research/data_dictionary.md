# Data Dictionary — Coffee Manic

Dokumen referensi struktur data. Sumber otoritatif implementasi adalah SQLAlchemy models (`backend/app/models/`) dan migrasi. Status verifikasi dan aturan mengikuti `PROJECT_CONTEXT.md`.

## Tabel

| Tabel | Fungsi |
|---|---|
| users | Akun pengguna, email, password hash, role. |
| coffee_shops | Profil kedai, alamat, koordinat, harga, jam buka, status. |
| coffee_profiles | Karakter kopi, asal biji, roast, metode seduh, minuman andalan. |
| atmospheres | Daftar label suasana. |
| shop_atmospheres | Relasi many-to-many kedai dan suasana. |
| facilities | Daftar fasilitas. |
| shop_facilities | Relasi many-to-many kedai dan fasilitas. |
| reviews | Rating kategori dan teks ulasan. |
| shop_photos | Referensi foto, pengunggah, hak penggunaan, moderasi. |
| data_sources | Sumber informasi, URL, waktu pemeriksaan, status verifikasi. |
| reports | Laporan pengguna atas ulasan/foto. |

## Atribut utama

| Tabel | Kolom utama | Aturan |
|---|---|---|
| users | id, email, password_hash, display_name, role, timestamps | Email unik; password hanya hash. |
| coffee_shops | id, name, slug, address, latitude, longitude, phone_public, price_min, price_max, opening_hours, verification_status | Slug unik; harga non-negatif; max tidak di bawah min. |
| coffee_profiles | shop_id, coffee_type, bean_origin, roast_level, brew_methods, signature_drinks | Boleh kosong jika belum diketahui. |
| reviews | shop_id, user_id, lima rating, body, moderation_status | Rating 1–5; satu ulasan per user/kedai. |
| shop_photos | shop_id, uploaded_by, image_url, usage_rights_note, moderation_status | Hak penggunaan wajib dicatat. |
| data_sources | shop_id, source_type, source_name, source_url, checked_at, verification_status, notes | Sumber harus dapat ditelusuri. |

## Status verifikasi

| Status | Makna |
|---|---|
| unverified | Belum diperiksa. |
| pending | Menunggu pemeriksaan/konfirmasi. |
| verified | Sudah diperiksa dengan bukti memadai. |
| needs_review | Ada konflik atau perlu pemeriksaan ulang. |

## Status moderasi (reviews / shop_photos)

`pending` · `approved` · `rejected`

## Aturan database

- UUID sebagai primary key.
- Foreign key, unique/check constraint, dan index.
- `TIMESTAMPTZ` untuk waktu.
- Harga sebagai integer rupiah.
- Koordinat disimpan hanya jika sumber jelas dan telah diperiksa.
- Migration (Alembic/Flask-Migrate) untuk perubahan skema.
- Jangan mengisi informasi yang belum diketahui dengan tebakan.
