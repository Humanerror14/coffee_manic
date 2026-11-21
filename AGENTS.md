# AGENTS.md

Instruksi untuk AI coding agent yang bekerja pada repository Coffee Manic.

## Identitas proyek

Anda membantu mengembangkan **Coffee Manic**, platform web penemuan kedai kopi dan komunitas lokal. Baca `PROJECT_CONTEXT.md` dan `PRD.md` sebelum mengubah arsitektur atau fitur.

## Konfigurasi tetap

Platform web; frontend React + Vite; backend Python + Flask; database PostgreSQL; ORM SQLAlchemy; editor VS Code; dokumentasi Bahasa Indonesia; pilot Kecamatan Lhoksukon, Aceh Utara. **Jangan ubah tanpa instruksi eksplisit.**

## Aturan produk

Prioritaskan katalog kedai, pencarian/filter, detail kedai, peta/navigasi, rating, ulasan, admin verifikasi. Rekomendasi awal berbasis aturan. Jangan tambahkan pembayaran, delivery, loyalty, subscription, AI recommendation, atau ekspansi nasional ke MVP.

## Aturan data

Simpan sumber, URL, tanggal pemeriksaan, status verifikasi, catatan. Bedakan belum diketahui, belum diverifikasi, tidak tersedia. Jangan mengarang data. Patuhi ketentuan layanan dan hak cipta.

## Aturan teknis

Gunakan Flask application factory, blueprint, SQLAlchemy, validasi server, migration, foreign key, constraint, index, timestamp. Jangan commit secret. Gunakan prefix `/api` dan error handling konsisten.

## Cara bekerja

1. Periksa file relevan.
2. Ringkas rencana 2–5 poin.
3. Implementasikan patch terkecil.
4. Jalankan/berikan perintah test.
5. Perbarui `PROJECT_STATUS.md` dan `CHANGELOG.md` bila perlu.
6. Laporkan file berubah, cara menjalankan, hasil test, pekerjaan tersisa.

## Efisiensi konteks

Muat hanya file/skill relevan. Jangan mengulang PRD, menampilkan seluruh file tanpa diminta, menambah abstraksi/dependency tanpa alasan, atau meregenerasi kode yang sudah bekerja.

Untuk desain dan review frontend atau FigCraft, baca skill yang sesuai dengan tugas.

- [Anti-Slop UI](.ai/skills/anti-slop-ui/SKILL.md) untuk hierarki visual, teks antarmuka, dan penyederhanaan komponen.
- [UI/UX Pro Max](.ai/skills/ui-ux-pro-max/SKILL.md) untuk riset desain web, aksesibilitas, layout responsif, dan pola React.

## Batasan

Jika requirement ambigu atau mengubah keputusan produk, tanyakan satu pertanyaan penting. Jangan mengarang kredensial, API key, data kedai, atau hasil pengujian.
