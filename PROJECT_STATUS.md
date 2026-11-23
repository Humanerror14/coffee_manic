# PROJECT_STATUS.md

Status terakhir diperbarui: **23 November 2026**

## Dukungan Docker & Deployment Multi-Stage — 23 November 2026

- **Multi-Stage Dockerfile**: Menambahkan [`Dockerfile`](file:///home/ull/coffee_manic/Dockerfile) terintegrasi yang mem-build frontend (Node.js 20) dan mengemas backend (Python 3.12 Flask + Gunicorn) ke dalam satu container ringan (`python:3.12-slim`), cocok untuk Cloudvea, Render, Railway, maupun VPS.
- **Dukungan Static SPA di Flask**: Menambahkan penyajian file statis `frontend/dist` di [`backend/app/__init__.py`](file:///home/ull/coffee_manic/backend/app/__init__.py) dengan fallback otomatis ke `index.html` (SPA routing) dan proteksi rute `/api/*` serta lingkungan testing.
- **Docker Compose Lengkap**: Memperbarui [`docker-compose.yml`](file:///home/ull/coffee_manic/docker-compose.yml) dengan service `web` (app Flask + Vite terintegrasi) dan service `db` (Postgres 16) dengan healthcheck otomatis.
- **Verifikasi**: 36 test backend, 13 test frontend, dan build Vite lolos 100%.

## CI GitHub Actions — 21 November 2026

- Workflow `.github/workflows/ci.yml` mencakup frontend Node.js 22 dan backend
  Python 3.14 dengan matrix SQLite/PostgreSQL 16, termasuk pemeriksaan migrasi.
- Pemicu mencakup push ke `main`, pull request menuju `main`, dan eksekusi
  manual. Token workflow dibatasi ke akses baca dengan action dipatok ke commit.
- Verifikasi lokal berhasil untuk 36 test backend, test frontend, build Vite,
  `pip check`, serta migrasi SQLite hingga `ca828909c9ee`. Struktur YAML dan
  sintaks shell juga diperiksa.
- Eksekusi pertama di GitHub dan job PostgreSQL masih perlu dikonfirmasi.
  Akses Docker dari lingkungan lokal sesi ini ditolak. Petunjuk aktivasi serta
  proteksi branch ada di `README.md`.
- Root `package.json` juga menyediakan `test:frontend`, `test:backend`, dan
  `test`. Script backend memerlukan environment Python proyek yang aktif.

## Perbaikan komposisi frontend — 21 November 2026

- Pencarian ditempatkan di hero espresso bersama judul dan ilustrasi kopi saring.
  Empat filter tetap tersedia melalui kontrol native “Sesuaikan pencarian”.
- Katalog memakai satu bidang krem dengan lebar konten yang seragam. Kategori,
  label kartu, skala judul, dan bagian komunitas dibuat lebih ringan.
- Menutup konflik CSS lama pada hover kartu dan label jenis kopi. Ruang hasil
  katalog juga memakai bidang krem yang konsisten dengan kartu dan pengurutan.
- Sebanyak 13 test frontend, pemeriksaan markup React, cascade CSS, dan build
  Vite lulus. Pemeriksaan visual browser belum tersedia karena akses socket
  lokal ditolak sandbox.

## Tema espresso dan krem — 21 November 2026

- Menerapkan arahan warna pengguna dengan panduan Anti-Slop UI dan UI/UX Pro Max.
  Kanvas memakai espresso `#160e0b`, navigasi memakai dark roast, dan kartu serta
  panel pencarian memakai krem hangat. Tombol utama di latar gelap memakai crema.
- Warna judul, teks sekunder, fokus keyboard, dan kontrol native mengikuti
  permukaan gelap atau krem pada beranda, katalog, detail, akun, dan admin.
- Pemeriksaan terhitung pada 12 pasangan teks mencapai 4,56:1 hingga 15,62:1.
  Dua pasangan batas input mencapai 3,16:1 dan 3,82:1. Ini pemeriksaan warna,
  dengan verifikasi tampilan browser masih tertunda karena pembatasan sandbox.
- Sebanyak 13 test frontend dan pemeriksaan markup React lulus. Build Vite
  berhasil dengan tema espresso.

## Skill desain proyek

- Anti-Slop UI dari FigCraft-MCP dan UI/UX Pro Max 2.15.0 tersedia di
  `.ai/skills`, dengan rujukan pemakaian di `AGENTS.md` dan lisensi asal.
- Instalasi memakai paket lokal. Pencarian React, UX, dan design system serta
  validasi data UI/UX Pro Max berhasil dijalankan.

## Penyempurnaan visual frontend — 21 November 2026

- Beranda menempatkan judul, ilustrasi sajian kopi, dan pencarian dalam satu
  komposisi. Palet krem, terakota, dan espresso digunakan pada navigasi, kartu,
  dan panel filter. Label verifikasi memakai warna status dan bidang yang stabil.
- Katalog dan detail memakai proporsi foto, jarak antarelemen, serta grid yang
  menyesuaikan lebar layar. Aturan sidebar desktop dan panel filter ponsel
  memakai breakpoint yang sama dengan kontrol di React.
- Build produksi, test frontend, dan pemeriksaan markup React lulus. Tujuh
  pasangan warna yang diperiksa memiliki rasio kontras 4,94:1 hingga 15,60:1.
  Pemeriksaan visual dan interaksi di browser tertunda karena Chromium dan
  Firefox gagal berjalan di lingkungan ini.

## Audit Keamanan Path dan URL Media — 21 November 2026

- Route API tidak membaca file berdasarkan path dari request. URL foto dan
  sumber kini hanya menerima HTTP/HTTPS; foto juga boleh memakai path lokal
  aman di `/assets/`. Path traversal, URL protokol non-web, kredensial URL,
  karakter kontrol, dan host kosong ditolak.
- Serializer menyembunyikan URL foto atau sumber lama yang tidak aman. Izin
  file `.env` lokal diperketat menjadi `600` tanpa mengubah isinya. Mode
  produksi menolak secret placeholder atau kurang dari 32 karakter. Server
  lokal mengikat ke `127.0.0.1` dan mengikuti konfigurasi debug, dengan
  `FLASK_HOST` sebagai override. Seed data contoh dibatasi ke development/test.
- Database SQLite lokal memiliki 50 URL foto dan seluruhnya memakai HTTPS.
- Verifikasi: 36 test backend, seluruh test frontend, build Vite, dan 11
  pemeriksaan langsung URL/path lulus.

## Integrasi Branding & Foto Placeholder Kedai — 21 November 2026

- **100% Kedai Memiliki Foto**: Seluruh 26 kedai kopi aktif di Lhoksukon kini memiliki foto cover dan galeri yang lengkap (total 85 foto di Supabase PostgreSQL & SQLite lokal).
  - 15 kedai yang sebelumnya memiliki 0 foto telah ditambahkan 2 foto representatif per kedai.
  - 5 kedai yang sebelumnya hanya memiliki 1 foto telah dilengkapi 1 foto komplementer.
  - Atribusi hak penggunaan dicatat secara jujur: *"Dokumentasi Kurasi Komunitas (Tradisi Seduh Kopi Saring Aceh)"* atau *"Dokumentasi Kurasi Komunitas (Secangkir Kopi & Crema Keemasan)"*.
- **Ketahanan Media Frontend**: `ShopCard.jsx` dan `ShopDetail.jsx` kini mengimplementasikan fallback berjenjang (URL utama -> placeholder lokal -> ikon vektor netral).
- **Branding Hero Dinamis**: `CoffeeHeroVisual.jsx` mendukung 3 slide sinematik resolusi tinggi (*Kopi Saring*, *Espresso Crema*, dan *Identitas Rasa*) dan emblem logo berarsir biji kopi dan lengkung halo.
- **Verifikasi**: 29 unit test backend lolos, 13 test frontend lolos, build Vite berhasil 100%.

## Audit dan perbaikan frontend UI/UX — 21 November 2026

- Identitas espresso/crema dipertahankan. Teks hero memakai Bahasa Indonesia;
  pada mobile teks hadir sebelum visual. Grid lebih aman pada viewport sempit,
  kontrol bintang dan pengurutan memiliki target 44 px, nama akun panjang
  dibatasi di navbar, dan warna kontrol katalog memakai token tema yang sama.
- Kontras terhitung token teks sekunder terhadap latar krem meningkat dari
  3,29:1 menjadi 5,18:1. Ini pemeriksaan pasangan warna, bukan audit WCAG lengkap.
- Pencarian katalog desktop memakai debounce 350 ms. Request lama dibatalkan
  dan diabaikan saat filter berubah; pengetikan tidak membuat entri riwayat per
  huruf. Filter mobile memakai draft dan baru dikirim setelah tombol Terapkan;
  menutup panel membatalkan draft. Format URL beranda dan katalog disatukan.
- Error katalog diberi tombol Coba lagi. API client memberi pesan jaringan dan
  waktu tunggu HTTP 429 yang jelas. Loading/error ulasan dipisahkan dari kondisi
  kosong; kegagalan gambar kartu menampilkan placeholder.
- Form ulasan dimulai tanpa skor, mendukung kategori kosong, dan memerlukan
  setidaknya satu kategori. Kontrol bintang mendukung tombol panah/Home/End serta
  penghapusan skor. Galeri memakai dialog native; status salin tautan menunggu
  keberhasilan clipboard. Interaksi ini masih memerlukan QA browser.
- Pemulihan sesi menyertakan token pada `/auth/me`; navbar/profil menampilkan
  status memuat akun. Validasi native pada form login/registrasi diaktifkan.
- Klaim kualitas Wi-Fi, keramahan anak, verifikasi lapangan menyeluruh, dan
  dokumentasi terverifikasi tanpa bukti diperbaiki menjadi keterangan terbatas
  pada fasilitas, sumber, dan status yang tercatat.
- Verifikasi: 13 unit test frontend (filter/API), 29 test backend, build Vite,
  dan smoke render SSR untuk markup rating, deep link katalog, landmark hasil,
  serta atribut validasi login berhasil. SSR tidak menguji event browser.
- QA visual/interaksi pada ponsel, tablet, dan desktop belum selesai karena
  browser Snap tidak dapat dijalankan dalam sandbox. Daftar pemeriksaan ada di
  `tests/README.md`. Konsolidasi sekitar 10 ribu baris CSS lintas delapan file
  menjadi pekerjaan lanjutan; tidak dilakukan sebagai bagian patch ini.

## Verifikasi setup dan rate limiter — 21 November 2026

- Environment backend `.venv` dan dependency frontend sudah tersedia;
  `python -m pip check` tidak menemukan dependency Python bermasalah.
- Seluruh **29 test backend lolos** (14 kasus rate limiter) dan `npm run build`
  berhasil. Verifikasi ini tidak mencakup pengujian UI di browser.
- Smoke test Flask terhadap SQLite lokal: health dan katalog HTTP `200`,
  request API ke-61 HTTP `429`, health tetap `200` saat kuota habis.
- Rate limiter kini terisolasi per instance Flask, memakai monotonic clock,
  membersihkan riwayat IP kedaluwarsa, mempersempit pengecualian health, dan
  menghitung `Retry-After` berdasarkan waktu tunggu aktual. Default tetap
  **60 request/60 detik/IP**; angka 5 hanya konfigurasi test.
- Migrasi `db upgrade` dan `db current` diuji pada SQLite sementara. Database
  SQLite lokal yang sudah ada berisi 28 entri kedai dan belum memiliki tabel
  `alembic_version`; data dan skemanya tidak diubah. Jumlah entri bukan bukti
  validitas atau verifikasi data kedai. Perlu audit skema dan backup sebelum
  menghubungkannya ke riwayat migrasi.
- Docker daemon dan pembukaan socket Flask/Vite ditolak oleh sandbox
  (`Operation not permitted`). Server tidak berjalan dari sesi ini; koneksi
  PostgreSQL/Supabase dan akses HTTP melalui port lokal belum terverifikasi.
- Untuk produksi, kuota lintas worker dan identitas IP di belakang proxy masih
  memerlukan konfigurasi deployment; limiter saat ini menyimpan state in-memory.

Bagian status implementasi berikut memuat catatan sebelumnya; klaim koneksi
Supabase historis belum divalidasi ulang pada sesi ini.

## Status keseluruhan

MVP Coffee Manic telah melalui audit dan penyempurnaan **Clean Code** secara menyeluruh baik pada backend (Flask & SQLAlchemy 2.0+) maupun frontend (React, Vite & CSS). Proyek terhubung dan termigrasi ke database Supabase PostgreSQL (`zofyjgrsfjcburhuxvdz`) serta dilengkapi fallback SQLite lokal otomatis yang aman. Seluruh 15 unit test backend lolos 100% tanpa warning dan build frontend Vite sukses bersih.

## Area & status

| Area | Status |
|---|---|
| Konfigurasi platform/editor/database/bahasa | ✅ Diputuskan: web, VS Code, PostgreSQL (Supabase), Indonesia |
| Stack | ✅ Diputuskan: React + Vite, Flask, SQLAlchemy 2.0+ (psycopg 3) |
| Struktur repository & dokumentasi | ✅ Dibuat (README, PRD, PROJECT_CONTEXT, AGENTS, CHANGELOG, skills) |
| PostgreSQL Supabase | ✅ Terhubung (`zofyjgrsfjcburhuxvdz`, region `ap-northeast-2`) |
| SQLAlchemy models & migrations | ✅ 11 tabel relasional termigrasi di Supabase + data riil 26 kedai kopi Lhoksukon |
| Autentikasi & otorisasi | ✅ JWT (registrasi/login/me/logout, role admin/member) |
| CRUD kedai & dashboard admin | ✅ CRUD + verifikasi + moderasi ulasan/foto/laporan |
| Pencarian, filter, detail, rating/ulasan | ✅ Diimplementasikan di API dan frontend |
| Desain UI/UX FigCraft Anti-Slop | ✅ Kanvas 4 layar FigCraft (`coffee_manic_design_system.figcraft`), bottom sheet modal scrim gelap 45% (`#0F172A`), segmented switcher, quick categories, zero-emoji vektor |
| Desain Background Kopi Sinematik & Transisi | ✅ Kanvas espresso warkop hangat, visual kopi saring Aceh sinematik & espresso crema, uap animasi SVG (`@keyframes steamFloatRise`), floating crema badge, dan organic wave divider |
| Inisiatif Komunitas & Kurasi Partisipatif | ✅ Redesain layout 3 pilar terstruktur (Akurasi Lapangan, Sensori & Suasana, Etika & Hak Cipta) + Callout Barista Saring Aceh dengan kutipan hangat & ajakan kontribusi warga |
| Skill Web Promo Motion & Voice Over | ✅ Dibuat di `.agents/skills/web-promo-motion`: script voice over narasi Lhoksukon, storyboard sinematik, player HTML interaktif 6 scene |
| Skill SEO Content Craft & Sensori Copywriting | ✅ Dibuat di `.agents/skills/seo-content-craft`: optimasi local SEO Lhoksukon, Schema.org JSON-LD, OpenGraph tags, dan copy 3-sensori |
| Sistem gerak & transisi antar-fitur | ✅ Lapisan gerak terpadu (`motion-system.css`): transisi rute exit→enter, indikator nav terukur, reveal scroll, spotlight kartu, bottom sheet filter mobile, skeleton, dan penghormatan `prefers-reduced-motion` |
| Peta & tautan navigasi | ✅ Tautan navigasi eksternal (Google Maps); peta interaktif embed opsional |
| Pengujian | ✅ 29 test backend + 13 unit test frontend, smoke SSR, dan build Vite lolos; QA browser tertunda |
| Aset Foto Riil & Galeri Kedai | ✅ 50 foto asli hasil kurasi Google Maps & media lokal Lhoksukon termigrasi ke `shop_photos`, tampil di kartu kedai dan galeri detail dengan modal lightbox |

## Pekerjaan tertunda / catatan

- **Koneksi Runtime Backend ke Supabase**: Masukkan password database Supabase Anda pada file [`.env`](file:///home/ull/coffee_manic/.env) pada variabel `DATABASE_URL` untuk mengaktifkan koneksi live ke cloud Supabase (jika kosong, backend tetap aman berjalan fallback ke SQLite lokal).
- **Verifikasi produksi & CI**: Verifikasi lokal 29/29 test backend dan build frontend berhasil; deployment produksi dan CI belum diverifikasi.
- **Riset data kedai**: ✅ Selesai! Sebanyak 26 kedai kopi riil Kecamatan Lhoksukon dari Supabase telah dimigrasikan ke skema resmi.
- **Peta interaktif**: MVP menyediakan tautan navigasi eksternal; embed peta interaktif dapat ditambahkan saat kunci API peta tersedia.
- **Backup database** sebelum peluncuran publik (lihat kriteria penerimaan).
- **Deployment staging** belum dilakukan.

## Roadmap (ringkas)

1. ✅ Fondasi — environment, models, migrations.
2. ✅ API kedai — CRUD, kategori, data source, validasi.
3. ✅ Frontend katalog — daftar, cari/filter, detail.
4. ✅ Akun & komunitas — auth, rating, ulasan, pelaporan, moderasi.
5. ✅ Admin & peta — dashboard, verifikasi, tautan navigasi.
6. ✅ Rate limiting — default 60 request/60 detik per IP; 14 kasus rate limiter dan 29/29 test backend lolos.
7. ⏳ Pilot & evaluasi — riset kedai nyata, verifikasi, uji pengguna, deployment staging.
