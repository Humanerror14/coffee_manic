# PRD — Coffee Manic

Versi 1.0 — 6 November 2026

> Dokumen ini merangkum Product Requirements Document Coffee Manic. Sumber lengkap (dengan tabel konfigurasi, fungsional, dan atribut) tersedia pada dokumen terpadu yang menjadi dasar proyek ini.

## 1. Ringkasan

Coffee Manic adalah platform web penemuan kedai kopi lokal yang membantu pengguna menemukan tempat berdasarkan preferensi kopi, suasana, fasilitas, kisaran harga, lokasi, dan pengalaman komunitas.

**Visi:** Menjadi panduan kopi lokal yang membantu orang menemukan kedai yang tepat untuk selera dan suasana yang mereka cari, sekaligus membangun komunitas pecinta kopi berbasis informasi tepercaya.

**Prinsip produk:** Local-first · Data integrity · MVP-first · Community-driven · Privacy by design.

## 2. Latar belakang dan masalah

Informasi kedai kopi lokal tersebar di peta, media sosial, situs, dan rekomendasi personal. Pengguna harus membuka banyak sumber untuk memahami jenis kopi, suasana, harga, fasilitas, dan pengalaman pengunjung. Informasi juga dapat tidak lengkap atau kedaluwarsa. Coffee Manic menggabungkan informasi tersebut dalam pengalaman pencarian yang terstruktur dan transparan.

## 3. Tujuan MVP

1. Menyediakan katalog kedai kopi lokal dengan informasi yang memiliki sumber.
2. Membantu pengguna menemukan kedai melalui pencarian dan filter.
3. Menampilkan profil kopi, suasana, fasilitas, harga, dan lokasi.
4. Mengumpulkan rating dan ulasan komunitas dengan moderasi.
5. Menyediakan alat admin untuk memeriksa, memperbarui, dan memverifikasi data.

## 4. Ruang lingkup

MVP hanya mencakup **Kecamatan Lhoksukon, Kabupaten Aceh Utara**. Kedai di luar batas wilayah pilot tidak boleh ditampilkan sebagai bagian katalog utama.

### Termasuk MVP

- Registrasi, login, logout, dan profil dasar.
- Daftar kedai, pencarian nama/alamat, dan filter.
- Filter karakter kopi, suasana, rentang harga, dan fasilitas.
- Halaman detail kedai dengan sumber dan status verifikasi.
- Peta dan tautan navigasi eksternal.
- Rating kategori, ulasan teks, foto berizin, pelaporan, dan moderasi.
- Dashboard admin untuk CRUD dan verifikasi data.

### Di luar MVP

- Pemesanan online, pembayaran, dan delivery.
- Loyalty points, subscription, atau membership berbayar.
- Rekomendasi machine learning dan prediksi okupansi real-time.
- Ekspansi nasional/multi-kota.
- Chat pribadi dan jejaring sosial kompleks.

## 5. Persona

| Persona | Kebutuhan |
|---|---|
| Penjelajah kopi | Menemukan kedai berdasarkan jenis kopi, metode seduh, dan kualitas minuman. |
| Pencari suasana | Memilih tempat berdasarkan atmosfer, kenyamanan, fasilitas, dan harga. |
| Kontributor komunitas | Membagikan pengalaman dan penilaian terstruktur. |
| Admin | Menjaga akurasi data, menangani koreksi, dan memoderasi konten. |

## 6. Kebutuhan fungsional

| ID | Kebutuhan | Kriteria ringkas |
|---|---|---|
| FR-01 Akun | Registrasi, login, logout, profil. | Password di-hash; endpoint privat memerlukan autentikasi/otorisasi. |
| FR-02 Katalog | Daftar kedai aktif. | Profil berisi nama, alamat, koordinat jika tersedia, status, dan sumber. |
| FR-03 Cari/filter | Nama/area; kopi, suasana, harga, fasilitas. | Filter dapat dikombinasikan. |
| FR-04 Detail | Profil, jam buka, kontak publik, harga, kopi, suasana, fasilitas, rating, ulasan. | Data yang belum diketahui tidak boleh ditebak. |
| FR-05 Ulasan | Rating kategori dan teks. | Skala 1–5; pengguna dapat memperbarui dan melaporkan ulasan. |
| FR-06 Foto | Foto yang hak penggunaannya jelas. | Catat pengunggah, hak penggunaan, waktu, dan status moderasi. |
| FR-07 Admin | CRUD kedai, verifikasi, kategori, moderasi. | Perubahan penting dapat ditelusuri. |
| FR-08 Sumber | Catat asal data dan pemeriksaan. | Sumber, URL, waktu, status, dan catatan tersedia. |

## 7. Sistem rating

Skala 1–5. Nilai kosong berarti belum ada penilaian, bukan nol.

| Kategori | Makna |
|---|---|
| Coffee Quality | Kualitas rasa dan konsistensi minuman kopi. |
| Atmosphere | Suasana, kenyamanan, kebisingan, kecocokan tempat. |
| Service | Keramahan, ketepatan, kualitas pelayanan. |
| Price Value | Kesesuaian harga dengan produk dan pengalaman. |
| Cleanliness | Kebersihan area, meja, peralatan, fasilitas. |

## 8. Kebutuhan nonfungsional

- Responsif pada ponsel, tablet, dan desktop.
- Aksesibilitas dasar: label form, kontras memadai, navigasi keyboard.
- Validasi input di frontend dan backend.
- Password di-hash; secret disimpan di environment variable.
- Error API konsisten dan tidak membocorkan stack trace.
- Database memakai constraint dan index yang relevan.
- Backup database disiapkan sebelum peluncuran publik.
- Log tidak menyimpan password atau token rahasia.

## 9. Rekomendasi

MVP menggunakan pencocokan berbasis aturan yang transparan. Sinyal dapat mencakup preferensi kopi, suasana, fasilitas, rentang harga, dan jarak jika koordinat tersedia. Jelaskan alasan rekomendasi. Machine learning ditunda sampai data berkualitas dan kebutuhan tervalidasi.

## 10. Navigasi dan halaman

| Halaman | Konten utama |
|---|---|
| Beranda | Pencarian, filter utama, kedai terbaru/rekomendasi. |
| Jelajahi | Daftar kedai, filter, dan peta. |
| Detail kedai | Profil, kopi, suasana, fasilitas, rating, ulasan, navigasi. |
| Profil pengguna | Informasi dasar dan kontribusi. |
| Admin | Daftar kedai, status verifikasi, ulasan, laporan. |

## 11. Target validasi pilot (sasaran, bukan hasil)

- Mengumpulkan 30–50 kandidat kedai jika pasokan lokal memungkinkan.
- Minimal 20 profil cukup lengkap dan terverifikasi jika tersedia.
- Menguji prototype dengan 10–20 pengguna.
- ≥70% peserta dapat menemukan kedai yang sesuai.
- Mengukur penggunaan ulang selama beta.

## 12. Risiko produk

| Risiko | Mitigasi |
|---|---|
| Data kedai tidak lengkap/kedaluwarsa | Status verifikasi, sumber, dan jadwal pemeriksaan ulang. |
| Jumlah kedai lokal terbatas | Validasi pasokan sebelum menetapkan target final. |
| Konten tanpa izin | Aturan hak penggunaan dan moderasi. |
| Ulasan palsu/spam | Autentikasi, pelaporan, moderasi. |
| Lokasi salah | Verifikasi batas kecamatan dan koordinat. |
| Scope membesar | Prioritaskan MVP dan persetujuan perubahan. |

## 13. Kriteria penerimaan MVP

- Pengguna dapat membuka katalog dan detail kedai.
- Pencarian dan filter menghasilkan data sesuai parameter.
- Profil kedai menampilkan status verifikasi dan sumber.
- Pengguna terautentikasi dapat mengirim dan memperbarui ulasan.
- Rating hanya menerima nilai 1 sampai 5.
- Admin dapat mengelola kedai, verifikasi, dan moderasi.
- Foto yang tampil memiliki hak penggunaan yang jelas.
- API memiliki validasi, error handling, dan test alur utama.
- Tampilan responsif dan dapat digunakan dengan keyboard.
- Tidak ada secret di repository; dokumentasi setup diperbarui.
