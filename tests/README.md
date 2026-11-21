# Tests — Coffee Manic

## Struktur

- `backend/tests/` — unit test API backend (pytest).
- `frontend/tests/*.test.js` — unit test filter URL dan API client dengan test runner bawaan Node.js; tanpa dependency tambahan.

## Menjalankan test frontend

Dari root proyek:

```bash
npm --prefix frontend test
npm run build
```

Untuk melihat hasil per kasus secara langsung:

```bash
node frontend/tests/api.test.js
node frontend/tests/catalogFilters.test.js
```

Cakupan saat ini: 13 kasus untuk round-trip filter dan URL beranda, encoding
kata kunci, reset filter, header autentikasi, pembatalan request, error API,
pesan waktu tunggu HTTP 429, kegagalan jaringan, dan penghapusan token.
Test ini tidak menjalankan browser atau mensimulasikan interaksi DOM.

## QA UI/UX manual yang masih perlu dijalankan

Audit kode dan smoke render SSR tanggal 21 November 2026 tidak menggantikan
pengujian browser. Chromium/Firefox berbasis Snap tidak dapat dijalankan dalam
sandbox sesi audit; verifikasi visual berikut masih tertunda:

1. Layar 320/390 px, tablet 768 px, desktop 1280/1440 px: tidak ada overflow,
   navigasi akun tetap terbaca, teks hero tampil sebelum visual pada mobile.
2. Ketik kata kunci cepat pada katalog desktop: debounce 350 ms, respons lama
   tidak menggantikan hasil terbaru, Back/Forward mengembalikan filter URL.
3. Pada mobile, ubah filter lalu tutup/Escape: hasil dan URL tetap. Buka lagi,
   pilih filter lalu Terapkan: hanya pilihan yang diterapkan yang mengubah hasil.
   Reset dalam panel juga menunggu Terapkan.
4. Rating dimulai kosong; Tab memasuki satu pilihan per grup, tombol panah serta
   Home/End mengubah pilihan, Hapus mengosongkan kategori. Minimal satu kategori
   diperlukan sebelum submit; kategori kosong tidak berubah menjadi 5.
5. Galeri: buka foto, navigasi Tab, tutup dengan Escape/tombol/latar; fokus kembali
   ke pemicu dan halaman tidak bergulir di belakang dialog. Saat clipboard ditolak,
   UI tidak menampilkan keberhasilan palsu.
6. Login/registrasi: email dan field wajib divalidasi browser; refresh sesi login
   tetap mengirim token saat memuat akun. Uji menggunakan akun pengujian yang sah.
7. Simulasikan kegagalan API: tampilkan Coba lagi, bedakan gagal memuat ulasan dari
   belum ada ulasan, dan periksa fallback ketika gambar kartu gagal dimuat.

## Menjalankan test backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

## Cakupan (backend)

- Health endpoint.
- Registrasi & login (hash password, JWT).
- Katalog kedai (list/detail).
- Pencarian & filter (nama, harga, suasana, fasilitas).
- Rating & ulasan (batas 1–5, satu ulasan per user/kedai).
- Otorisasi admin (akses CRUD/verifikasi/moderasi).

## Pedoman QA (lihat juga skill `qa-testing`)

- Uji happy path, input tidak valid, data kosong, akses tanpa izin, dan error server.
- Uji kombinasi filter, batas rating 1 dan 5, tolak nilai di luar rentang.
- Pastikan pengguna tidak dapat mengubah data/admin tanpa otorisasi.
- Jangan menyatakan test lulus jika belum dijalankan.
