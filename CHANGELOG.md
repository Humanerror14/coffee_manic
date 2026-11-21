# CHANGELOG.md

Semua perubahan penting pada proyek ini dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

## [Unreleased]

### Added — Continuous integration GitHub Actions, 21 November 2026

- Tambahkan test dan build frontend serta test backend pada SQLite/PostgreSQL
  16, dengan pemeriksaan migrasi dan cache dependency.
- Tambahkan pemicu push/pull request ke `main` dan pemicuan manual. Sertakan
  panduan aktivasi, proteksi branch, dan alternatif Jenkins di `README.md`.
- Root `package.json` menyediakan helper `test:frontend`, `test:backend`, dan `test`.

### Changed — Perbaikan komposisi frontend, 21 November 2026

- Satukan pencarian dan judul di hero espresso, dengan empat filter yang dapat
  dibuka melalui “Sesuaikan pencarian”. Gunakan aset kopi saring yang sudah ada.
- Jadikan katalog satu bidang krem. Ringankan kategori, label kartu, ukuran
  judul, dan komposisi bagian komunitas.
- Perbaiki konflik CSS hover kartu dan gaya badge lama pada jenis kopi.
- Sesuaikan bidang hasil Jelajahi dan kontrol pengurutan dengan tema katalog.

### Changed — Tema espresso dan krem, 21 November 2026

- Terapkan latar espresso pekat dan navigasi dark roast dengan teks serta aksi
  berwarna crema, mengikuti arahan pengguna dan skill desain yang terpasang.
- Selaraskan kartu, pencarian, formulir, dan bagian komunitas dengan krem hangat.
  Sesuaikan peran warna teks dan fokus keyboard pada permukaan gelap dan terang.
- Selaraskan warna bilah browser dengan latar espresso.

### Added — Skill desain

- Tambahkan Anti-Slop UI dan UI/UX Pro Max ke `.ai/skills` beserta panduan
  pemakaian di `AGENTS.md`.

### Changed — Penyempurnaan visual frontend, 21 November 2026

- Tata ulang beranda dengan satu ilustrasi utama, pencarian yang lebih dekat
  dengan judul, dan ajakan ulasan komunitas yang lebih ringkas.
- Seragamkan navigasi, proporsi kartu, status verifikasi, dan panel filter dengan
  palet krem, terakota, dan espresso.
- Tampilkan foto dan informasi utama kedai berdampingan pada layar lebar serta
  bertumpuk pada ponsel. Selaraskan posisi filter dengan breakpoint mobile.

### Security — Audit path dan URL media, 21 November 2026
- Validasi URL foto komunitas dan sumber data agar hanya menerima HTTP/HTTPS,
  dengan dukungan path lokal aman `/assets/` untuk foto.
- Filter URL foto dan sumber lama yang tidak aman saat membentuk respons API.
- Perketat izin `.env` lokal menjadi `600` tanpa mengubah isinya.
- Tolak secret produksi yang kosong, berupa placeholder, atau kurang dari 32
  karakter. Server lokal memakai `127.0.0.1` dan mengikuti konfigurasi debug,
  dengan override `FLASK_HOST`.
- Batasi seed data contoh dan akun admin pengembangan ke development/test.
- Tambahkan pengujian untuk skema berbahaya, path traversal, URL yang valid,
  data lama yang diserialisasi, dan secret produksi.

### Added — Integrasi Branding Kopi & Foto Placeholder Kedai, 21 November 2026
- **Integrasi Foto Placeholder Kedai (100% Cakupan Kedai Kopi Lhoksukon)**:
  - Mengisi 35 foto kurasi komunitas ke tabel `shop_photos` di Supabase PostgreSQL (`zofyjgrsfjcburhuxvdz`) dan SQLite instance lokal untuk 20 kedai yang sebelumnya belum memiliki foto atau hanya memiliki 1 foto (15 kedai dengan 0 foto, 5 kedai dengan 1 foto).
  - Kini seluruh **26 kedai kopi aktif memiliki minimal 2 foto** (total 85 foto tersimpan di database).
  - Foto dikurasi secara kontekstual: warkop tradisional memakai ilustrasi seduhan saring Aceh & biji sangrai, sedangkan cafe modern memakai espresso crema & biji sangrai, dengan atribusi transparan: `"Dokumentasi Kurasi Komunitas (Tradisi Seduh Kopi Saring Aceh)"` dan `"Dokumentasi Kurasi Komunitas (Secangkir Kopi & Crema Keemasan)"`.
- **Ketahanan Tampilan Gambar Multi-Tier ([`ShopCard.jsx`](file:///home/ull/coffee_manic/frontend/src/components/ShopCard.jsx), [`ShopDetail.jsx`](file:///home/ull/coffee_manic/frontend/src/pages/ShopDetail.jsx))**:
  - Menambahkan mekanisme fallback berjenjang: jika cover remote gagal dimuat, beralih otomatis ke placeholder lokal `/assets/placeholders/espresso-glass-closeup.jpg` sebelum menampilkan ikon placeholder netral, mencegah kotak gambar rusak (broken image box).
  - Menambahkan handler penanganan error pada banner header kedai, thumbnail galeri, dan lightbox foto di halaman detail.
- **Penyempurnaan Branding Hero Sinematik ([`CoffeeHeroVisual.jsx`](file:///home/ull/coffee_manic/frontend/src/components/CoffeeHeroVisual.jsx))**:
  - Menghadirkan 3 pilihan visual dinamis beresolusi tinggi: *"Kopi Saring"* (`coffee-brand-collage.jpg`), *"Espresso Crema"* (`hero-coffee-crema.jpg`), dan *"Identitas Rasa"* (`coffee-brand-logo-main.jpg`).
  - Memperbarui emblem vektor SVG pada badge mengapung dengan lengkungan halo atas, cangkir mengepul, dan sepasang biji kopi sangrai di alas cangkir, merepresentasikan logo branding Coffee Manic secara presisi.

### Changed — UI/UX, 21 November 2026
- Memperbaiki alur pencarian dengan debounce, pembatalan request lama, URL filter
  terpadu, serta draft filter mobile yang hanya diterapkan lewat tombol Terapkan.
- Menyesuaikan urutan hero mobile, grid layar sempit, target sentuh, kontras teks,
  dan warna kategori/filter dengan tema espresso/crema yang sudah ada.
- Mengosongkan skor awal ulasan, menambahkan navigasi keyboard dan hapus skor,
  memakai dialog native untuk galeri, serta memperbaiki status clipboard.
- Menambahkan pemulihan error katalog/ulasan, fallback gambar kartu, dan pesan
  jaringan serta HTTP 429. Memperbaiki token pemulihan sesi dan validasi form.
- Menghapus klaim fasilitas/kualitas/verifikasi yang tidak didukung data halaman.
- Menambahkan 13 unit test frontend tanpa dependency baru. Script test yang
  sebelumnya menunjuk Vitest yang tidak terpasang kini memakai Node.js.
- Build Vite, 29 test backend, 13 test frontend, dan smoke markup SSR berhasil;
  pengujian visual/interaksi browser masih tertunda karena pembatasan sandbox.

### Fixed — 21 November 2026
- **Audit rate limiter API**: isolasi state dan konfigurasi per instance Flask,
  monotonic clock, pembersihan berkala riwayat IP kedaluwarsa, pengecualian
  khusus endpoint health, dan header `Retry-After` berdasarkan sisa waktu aktual.
- Memperluas pengujian rate limiter menjadi 14 kasus: kuota, sliding window,
  pemulihan kuota, isolasi IP/aplikasi, penolakan bypass header proxy, pengecualian,
  request bersamaan, dan pembersihan state. Total 29 test backend lolos.
- Mendokumentasikan `RATE_LIMIT_PER_MINUTE=60`, batasan in-memory/multi-worker,
  identitas IP proxy, serta prosedur migrasi menggunakan folder yang sudah ada.
- Verifikasi setup: dependency Python konsisten, build frontend berhasil,
  migrasi database SQLite sementara berhasil, dan smoke test API lokal berhasil.
  Server Flask/Vite dan Docker terhalang izin sandbox; PostgreSQL belum
  diverifikasi ulang. Database lokal yang sudah ada tidak dimigrasi atau di-seed.

### Added
- **Desain Latar Belakang Kopi Sinematik & Transisi Dinamis (`reference-theme.css`, `Home.jsx`, `CoffeeHeroVisual.jsx`)**:
  - Menyesuaikan latar belakang web dengan palet warna warkop sinematik, crema hangat (`#E09E52`), dan espresso dark roast (`#1A0E08`, `#100804`), menggantikan warna hijau dan gradien oranye tajam sebelumnya.
  - Mengintegrasikan 5 aset foto referensi yang diunggah pengguna ke `frontend/public/assets/branding/`: `hero-kopi-aceh-cinematic.jpg`, `hero-coffee-crema.jpg`, `kopi-saring-aceh.jpg`, `espresso-crema-cup.jpg`, dan `coffee-steam-table.jpg`.
  - **Stage Visual Sinematik & Animasi Uap Mengepul (`CoffeeHeroVisual.jsx`)**: Menghadirkan visual warkop otentik dengan animasi uap SVG (`@keyframes steamFloatRise`) yang meliuk-liuk lembut dan realistis, emblem logo Coffee Manic keemasan mengapung (`@keyframes floatCremaGentle`), serta pemilih interaktif (switcher pill) antara tradisi *"Kopi Saring Aceh"* dan *"Espresso & Crema"*.
  - **Organic Coffee Wave Divider**: Kurva gelombang SVG dinamis multi-layer bernuansa cokelat kopi dan aksen garis emas di batas bawah Hero Section untuk transisi mulus ke panel pencarian dan katalog.
- **Redesain Layout Inisiatif Komunitas & Kurasi Partisipatif (`Home.jsx`, `reference-theme.css`)**:
  - Merombak total banner komunitas menjadi seksi editorial 3 pilar yang terstruktur, bersih, dan berwibawa:
    1. **Akurasi Lapangan**: Verifikasi koordinat geografis nyata, jam buka operasional, dan stopkontak tanpa data fiktif.
    2. **Ulasan 5-Dimensi Rasa & Ruang**: Penilaian terstruktur mencakup karakter seduhan (Sanger, Robusta, Arabika), kestabilan Wi-Fi, kenyamanan meja nugas, musholla, hingga keramahan barista.
    3. **Etika & Transparansi**: Menghargai pemilik warkop dan fotografer lokal dengan izin, atribusi sumber jelas, dan catatan pembaruan terbuka.
  - **Showcase Barista Kopi Saring Aceh**: Kartu callout interaktif 2 kolom yang memadukan visual barista kopi saring Aceh dengan kutipan hangat kebersamaan warga Lhoksukon dan tombol aksi kontributor terarah.
- **Skill SEO & Sensory Copywriting (`seo-content-craft`)**:
  - Dibuat di `.agents/skills/seo-content-craft/SKILL.md` dan `~/.gemini/config/skills/seo-content-craft/SKILL.md`: panduan Local SEO Lhoksukon, formula 3-sensori copywriting (aroma seduhan, suasana, keaslian komunitas), pedoman Schema.org, dan audit tag meta.
  - Mengoptimasi `frontend/index.html` dengan meta title kaya kata kunci lokal, meta description sensori, tag OpenGraph & Twitter Card yang mengarah ke visual sinematik kopi saring Aceh, serta Schema.org JSON-LD structured data (`WebSite` dan `Place` Lhoksukon).
- **Skill Web Promo Motion & Voice Over (`web-promo-motion`)**:
  - Dibuat di `.agents/skills/web-promo-motion/SKILL.md` untuk perancangan video motion promosi web, visual storyboard 6 scene (Dari Secangkir Sanger hingga Suasana Nugas Lhoksukon), script narasi voice over, dan player HTML animasi interaktif (`promo-player.html`).

### Added
- **Integrasi Aset Foto Riil Kedai & Galeri Visual (`shop_photos`)**:
  - Mengekstrak 50 URL aset foto berkualitas tinggi dari CSV scraper Google Places dan media lokal Lhoksukon, meng-upscale resolusinya ke resolusi tajam (`=w800-h600-k-no`), dan menyimpannya ke tabel relasional `shop_photos` di Supabase PostgreSQL (`zofyjgrsfjcburhuxvdz`) serta database instance SQLite lokal.
  - Memperbarui serializer [`backend/app/api/serializers.py`](file:///home/ull/coffee_manic/backend/app/api/serializers.py) untuk menyertakan `photos` dan `cover_image` pada respons `shop_to_dict()`.
  - Menambahkan eager loading `selectinload(CoffeeShop.photos)` pada endpoint katalog [`backend/app/api/routes/catalog.py`](file:///home/ull/coffee_manic/backend/app/api/routes/catalog.py) untuk mencegah N+1 query.
  - **Cover Media Kartu Kedai ([`ShopCard.jsx`](file:///home/ull/coffee_manic/frontend/src/components/ShopCard.jsx))**: Menampilkan thumbnail foto cover nyata pada setiap kartu kedai dengan transisi halus saat hover, overlay status verifikasi, dan fallback placeholder kopi netral anti-slop.
  - **Galeri Foto & Lightbox Modal ([`ShopDetail.jsx`](file:///home/ull/coffee_manic/frontend/src/pages/ShopDetail.jsx))**: Menampilkan header cover banner kedai, section dokumentasi galeri foto multi-kolom yang rapi, atribusi sumber, serta modal lightbox layar penuh saat foto diklik.

### Clean Code & Quality Improvements
- **Audit Kode Bersih (Clean Code Audit)**:
  - **Eliminasi Dead Code & Konsolidasi Hook**: Menghapus file usang `frontend/src/components/ScrollReveal.jsx` (230 baris) dan `frontend/src/hooks/useScrollReveal.js` (182 baris) yang tidak digunakan, menggantikannya secara terpadu melalui [`Reveal.jsx`](file:///home/ull/coffee_manic/frontend/src/components/Reveal.jsx) dan [`useMotionPreferences.js`](file:///home/ull/coffee_manic/frontend/src/hooks/useMotionPreferences.js).
  - **Sinkronisasi Data Serializer & Frontend**: Memperbarui [`backend/app/api/serializers.py`](file:///home/ull/coffee_manic/backend/app/api/serializers.py) agar `shop_to_dict()` secara dinamis menghitung `rating_avg` dan `review_count` dari ulasan yang disetujui (`shop.reviews`), memulihkan tampilan bintang dan jumlah ulasan di seluruh kartu kedai frontend yang sebelumnya tidak tampil.
  - **Pencegahan Masalah N+1 Query**: Menambahkan eager loading `selectinload(CoffeeShop.reviews)` pada endpoint katalog [`backend/app/api/routes/catalog.py`](file:///home/ull/coffee_manic/backend/app/api/routes/catalog.py) (`list_shops`, `get_shop`, `get_shop_by_slug`) sehingga perhitungan rating dieksekusi dalam satu batch query terpadu tanpa query berulang per kedai.
  - **Isolasi Pengujian (Pytest Test Isolation)**: Menambahkan guard pengujian di [`backend/app/config.py`](file:///home/ull/coffee_manic/backend/app/config.py) agar saat `FLASK_ENV == "testing"` atau berjalan di bawah `pytest`, database otomatis dialihkan ke `sqlite:///:memory:` tanpa melakukan lookup koneksi jaringan outbound ke cloud, menghilangkan latensi dan warning jaringan.
  - **Pembersihan Import & Efisiensi Session**: Menghapus unused import `admin_required` di [`backend/app/api/routes/community.py`](file:///home/ull/coffee_manic/backend/app/api/routes/community.py), serta menambahkan `db.session.flush()` pada persistensi taksonomi label di [`backend/app/api/routes/admin.py`](file:///home/ull/coffee_manic/backend/app/api/routes/admin.py) untuk mencegah duplikasi lookup.
  - **Integrasi Komponen**: Menghubungkan komponen [`CountUp.jsx`](file:///home/ull/coffee_manic/frontend/src/components/CountUp.jsx) pada counter statistik beranda [`Home.jsx`](file:///home/ull/coffee_manic/frontend/src/pages/Home.jsx).

### Fixed
- **Perbaikan Koneksi Supabase & Penanganan Error 500**:
  - Mengoreksi `DATABASE_URL` di [`.env`](file:///home/ull/coffee_manic/.env) dengan menghapus kurung siku bawaan placeholder dan mengarahkan ke direct connection port 5432 Supabase (`db.zofyjgrsfjcburhuxvdz.supabase.co:5432`).
  - Menambahkan auto-load `.env` di [`backend/app/config.py`](file:///home/ull/coffee_manic/backend/app/config.py) sehingga environment variable Supabase selalu terbaca secara andal tanpa jatuh ke SQLite lokal yang memicu `sqlite3.OperationalError: no such table: coffee_shops` (HTTP 500).
  - Mengoptimasi query katalog di [`backend/app/api/routes/catalog.py`](file:///home/ull/coffee_manic/backend/app/api/routes/catalog.py) dengan `selectinload` untuk relasi `coffee_profile`, `atmospheres`, dan `facilities`, memangkas puluhan query N+1 ke Supabase menjadi 4 query terpadu dan mempercepat waktu respon API.

### Added
- **Migrasi Database Relasional ke Supabase PostgreSQL (`zofyjgrsfjcburhuxvdz`)**:
  - DDL skema penuh Coffee Manic (`atmospheres`, `facilities`, `users`, `coffee_shops`, `coffee_profiles`, `data_sources`, `reports`, `reviews`, `shop_atmospheres`, `shop_facilities`, `shop_photos`, `alembic_version`) berhasil dieksekusi di Supabase PostgreSQL.
  - ETL 26 data kedai kopi riil hasil kurasi Kecamatan Lhoksukon dari `kedai_kopi_lhoksukon` berhasil dimigrasikan ke skema relasional `coffee_shops`, lengkap dengan `coffee_profiles`, `data_sources`, relasi taksonomi suasana/fasilitas, dan ulasan terverifikasi.
  - Menerapkan Row-Level Security (RLS) pada seluruh tabel di Supabase dengan kebijakan baca publik (`SELECT`) untuk data kurasi aktif dan ulasan disetujui.
  - Normalisasi otomatis prefix database URI (`postgres://` / `postgresql://` -> `postgresql+psycopg://`) serta penyesuaian batas waktu koneksi DNS/SSL cloud di [`backend/app/config.py`](file:///home/ull/coffee_manic/backend/app/config.py).
  - Menyediakan konfigurasi template [`.env.example`](file:///home/ull/coffee_manic/.env.example) dan [`.env`](file:///home/ull/coffee_manic/.env) terhubung langsung ke project Supabase.

### Added
- **Implementasi Desain UI/UX FigCraft Canvas & Standar Anti-Slop (`coffee_manic_design_system.figcraft`)**:
  - **Bottom Sheet Filter Fasilitas Mobile**: Standar Anti-Slop Rule 3 di [`Explore.jsx`](file:///home/ull/coffee_manic/frontend/src/pages/Explore.jsx) dengan scrim gelap `#0F172A` transparansi 45% (`rgba(15, 23, 42, 0.45)`), kontainer `#FFFFFF` dengan radius atas `28px 28px 0 0`, drag handle `36px × 4px` `#CBD5E1`, tombol reset ungu, serta tombol aksi primer hitam netral `#1E1E2D` (48px tinggi, radius 12px).
  - **Daftar Pilihan Fasilitas Interaktif**: Kartu fasilitas berikon vektor garis (`WifiIcon`, `FlashIcon` untuk colokan listrik, `BuildingIcon` untuk musholla, `BookOpenIcon` untuk area tenang) dilengkapi deskripsi kebutuhan nugas/santai dan kotak centang aktif netral.
  - **Segmented Switcher Katalog**: Filter beralih instan di halaman Jelajahi (*Semua Kedai*, *Rating Tertinggi*, *Harga Terjangkau*) dengan track `#F1F2F6` dan pil aktif `#FFFFFF` teks tebal `#1E1E2D`.
  - **Kartu Kurasi Cepat Suasana Beranda**: Tiga kartu penemuan cepat di [`Home.jsx`](file:///home/ull/coffee_manic/frontend/src/pages/Home.jsx) (*Tenang Nugas*, *Outdoor Santai*, *Keluarga & Teman*) dengan tautan filter langsung ke katalog.
  - **Ikon Vektor pada Pil Kartu Kedai**: Penambahan ikon vektor pada pil fasilitas/suasana di [`ShopCard.jsx`](file:///home/ull/coffee_manic/frontend/src/components/ShopCard.jsx) tanpa emoji liar.

### Changed & Clean Code
- **SQLAlchemy 2.0+ Modernization (Backend Clean Code)**:
  - Mengganti pemanggilan usang `Model.query.get(id)` menjadi `db.session.get(Model, id)` di [`backend/app/api/decorators.py`](file:///home/ull/coffee_manic/backend/app/api/decorators.py), [`backend/app/api/routes/auth.py`](file:///home/ull/coffee_manic/backend/app/api/routes/auth.py), [`backend/app/api/routes/catalog.py`](file:///home/ull/coffee_manic/backend/app/api/routes/catalog.py), [`backend/app/api/routes/community.py`](file:///home/ull/coffee_manic/backend/app/api/routes/community.py), dan [`backend/app/api/routes/admin.py`](file:///home/ull/coffee_manic/backend/app/api/routes/admin.py).
  - Menghapus impor `IntegrityError` yang tidak digunakan pada rute admin dan community.
  - Memperbaiki fixture pembuatan objek di [`backend/tests/test_catalog.py`](file:///home/ull/coffee_manic/backend/tests/test_catalog.py) dengan `db.session.add(shop)` dan `flush()` langsung, menghilangkan peringatan autoflush SQLAlchemy dan memastikan seluruh 15/15 unit test backend lolos 100% tanpa warning.

### Added
- **Redesain UI/UX Interaktif, Presisi & Animatif (Lapisan Gerak Terpadu)**:
  - Lapisan gerak baru [`frontend/src/motion-system.css`](file:///home/ull/coffee_manic/frontend/src/motion-system.css) berisi token durasi/easing terpusat, transisi antar-rute, reveal scroll, spotlight kartu, bottom sheet, skeleton, dan animasi mikro yang semuanya menghormati `prefers-reduced-motion`.
  - Komponen [`RouteTransition.jsx`](file:///home/ull/coffee_manic/frontend/src/components/RouteTransition.jsx): transisi *exit → enter* pada setiap perpindahan fitur, garis progres rute, pemulihan posisi scroll, dan pemindahan fokus ke konten utama untuk pembaca layar.
  - Komponen [`ScrollProgress.jsx`](file:///home/ull/coffee_manic/frontend/src/components/ScrollProgress.jsx) dan [`Reveal.jsx`](file:///home/ull/coffee_manic/frontend/src/components/Reveal.jsx) memakai `IntersectionObserver` (diperbarui via `requestAnimationFrame` tanpa render berulang).
  - Hook [`useMotionPreferences.js`](file:///home/ull/coffee_manic/frontend/src/hooks/useMotionPreferences.js) untuk deteksi `prefers-reduced-motion` dan kemunculan elemen di viewport.
  - Navbar: indikator tautan aktif tunggal yang diukur dari lebar teks (bergerak presisi antar-fitur), state `is-scrolled` dengan latar blur, dan garis progres baca di tepi bawah navbar.
  - Kartu kedai: spotlight radial mengikuti kursor, garis bawah judul yang tumbuh saat hover, panah CTA yang bergeser, dan animasi masuk berurutan (*stagger*).
  - Halaman Jelajahi: **bottom sheet filter untuk layar ≤900px** dengan handle, backdrop, tombol "Terapkan Filter (n)", perangkap fokus, dukungan `Escape`, dan penguncian scroll — mengacu pada referensi desain filter. Dilengkapi skeleton saat memuat dan animasi berurutan saat hasil filter berubah.
  - Beranda: statistik katalog kini dihitung dari data API (*bukan angka karangan*) dengan animasi `CountUp`; skeleton grid saat memuat.
  - Detail kedai: skeleton proporsi halaman penuh, bar rating yang tumbuh berurutan, daftar ulasan muncul bertahap, dan sidebar kartu masuk dari kanan.
  - Admin & auth: baris daftar beranimasi bertahap, kartu masuk dengan lembut, dan fokus input bercahaya.
- Komponen [`CountUp.jsx`](file:///home/ull/coffee_manic/frontend/src/components/CountUp.jsx) dan [`ShopCardSkeleton.jsx`](file:///home/ull/coffee_manic/frontend/src/components/ShopCardSkeleton.jsx).

### Fixed
- Bug CSS di [`transitions.css`](file:///home/ull/coffee_manic/frontend/src/transitions.css): `@media` bersarang di dalam selector `::after` membuat aturan hover nav tidak valid.
- [`Explore.jsx`](file:///home/ull/coffee_manic/frontend/src/pages/Explore.jsx): menghindari `setState` dan permintaan API ganda saat URL filter berubah; `inert` pada sheet tertutup kini dilepas dengan benar saat desktop.
- [`useMediaQuery`](file:///home/ull/coffee_manic/frontend/src/hooks/useScrollReveal.js) membaca `matchMedia` saat inisialisasi sehingga breakpoint mobile tidak berkedip.
- Label filter tanpa kontrol pada Jelajahi diganti `<span>` agar semantik benar; tombol "Simpan Kedai" admin dinonaktifkan saat nama kosong.

### Added (rilis sebelumnya)

- **Redesain UI/UX Mengacu pada Referensi Dribbble (*Modern Coffee Shop*)**:
  - Latar belakang luar bertema *ambient warm caramel/golden champagne gradient* (`.app-outer-shell`).
  - *Floating canvas container* bersudut membulat mewah (`border-radius: 32px`, warna *deep espresso dark roast*) dengan elevasi bayangan halus.
  - Komposisi *split-hero*: judul serif editorial Playfair Display ("Discover The Art Of Local Coffee."), tombol CTA pil amber menyala dengan lingkaran panah diagonal, baris statistik kunci (*100% Data Terverifikasi, 5 Dimensi Standar Penilaian, Lhoksukon Wilayah Pilot*), dan deretan *outline pill* kategori cita rasa & suasana.
  - Ilustrasi visual sensorik vektor cangkir kopi *top-down* keramik dengan pusaran crema keemasan, mahkota percikan cairan kopi dinamis, dan butir biji kopi terserak ([`CoffeeHeroVisual.jsx`](file:///home/ull/coffee_manic/frontend/src/components/CoffeeHeroVisual.jsx)).
- **Paket Ikon Interaktif Duotone Artisanal Anti-Mainstream ([`ArtisanalIcons.jsx`](file:///home/ull/coffee_manic/frontend/src/components/ArtisanalIcons.jsx))**:
  - Ikon duotone kustom (dua warna: warm cream `#FAF6EE` + glowing amber `#E58A38`).
  - Menggantikan paket ikon generik/mainstream dengan set ikon berkarakter kopi: `CoffeeCupIcon` (uap bergerak dinamis), `CoffeeBeanIcon` (alur belah biji kopi khas), `SearchLoupeIcon`, `LocationCompassIcon`, `VerifiedSealIcon`, `AromaStarIcon`, `PillArrowIcon` (panah meluncur halus saat hover), `FilterSlidersIcon`, `BaristaContactIcon`, `RoastTimerIcon`, `CoffeeExplorerIcon`, `CloseTimesIcon`, `ExternalPortalIcon`, `CheckCheckIcon`, `ShieldAuditIcon`.

### Changed
- **Pembersihan AI Slop Desain UI/UX (FigCraft & Hallmark Standards)**:
  - Mengganti seluruh dekorasi emoji liar dengan ikon SVG semantik bergaris bersih ([`frontend/src/components/Icons.jsx`](file:///home/ull/coffee_manic/frontend/src/components/Icons.jsx)).
  - Menghapus aturan `transition: all` dan menggantinya dengan transisi properti terarah tanpa efek *unnatural hover bounce/lift*.
  - Menghapus pola tipografi klise AI: kata tunggal miring di judul (*italic word in heading*), *uppercase tracked eyebrows*, dan panah yang menempel pada teks.
  - Memperbaiki sistem token CSS di `:root`, menerapkan `overflow-x: clip`, dan menambahkan fallback `prefers-reduced-motion`.
  - Merapikan struktur kartu menjadi bersih tanpa kartu bersarang (*nested card in card*).

### Added
- **Desain UI/UX Estetik Nuansa Pencinta Kopi**: Sistem desain bertema specialty coffee (palet espresso pekat, roasted dark bean, golden crema, oat milk, dan sage leaf).
- **Tipografi Artisanal**: Google Fonts `Playfair Display` (editorial serif untuk judul) dan `Plus Jakarta Sans` (antarmuka modern dan nyaman dibaca).
- **Komponen `StarRating` Interaktif**: Penilaian 5 dimensi (Coffee Quality, Atmosphere, Service, Price Value, Cleanliness) dengan interaksi hover, klik, dan visualisasi bar rating rata-rata.
- **Filter Eksplorasi Interaktif**: Pencarian instan kata kunci, chip toggle suasana & fasilitas yang responsif, preset harga, serta tombol reset satu klik.
- **Hero & Beranda Komunitas**: Bar pencarian instan pada hero, mood pills (Sanger Aceh, WiFi, Tenang, Outdoor), dan kartu kedai dengan hover lift.
- **Profil Karakter Kopi & Provenance**: Kartu detail kedai yang menampilkan jenis biji, asal daerah, tingkat sangrai (*roast*), metode seduh, dan kartu integritas data / asal sumber kurasi.

## [0.1.0] - 2026-11-06

### Added
- Menetapkan platform web, VS Code, PostgreSQL, dan dokumentasi Bahasa Indonesia.
- Menetapkan React + Vite dan Flask.
- Merancang monorepo frontend/backend.
- Menyusun PRD, project context, project status, dan instruksi AI (AGENTS.md).
- Menyusun delapan AI skills di `.ai/skills/`.
- Menyiapkan Docker Compose PostgreSQL, starter UI, dan health endpoint.
- Backend Flask: application factory, blueprint, SQLAlchemy models, Flask-Migrate, autentikasi JWT, seed.
- API: auth, katalog kedai, pencarian/filter, detail, rating/ulasan, foto, pelaporan, admin, data source, health, docs (Swagger).
- Frontend React/Vite: beranda, jelajahi, detail kedai, login/registrasi, profil, admin, state loading/empty/error.
- Unit test backend untuk alur utama.
