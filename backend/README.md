# Backend — Coffee Manic

REST API Flask dengan SQLAlchemy dan PostgreSQL.

## Struktur

```
backend/
├── run.py                  # entrypoint
├── requirements.txt
├── pytest.ini
├── app/
│   ├── __init__.py         # application factory
│   ├── config.py
│   ├── extensions.py
│   ├── seed.py             # data contoh (mock berlabel)
│   ├── models/__init__.py
│   └── api/
│       ├── decorators.py
│       ├── serializers.py
│       ├── utils.py
│       └── routes/
│           ├── auth.py
│           ├── catalog.py
│           ├── community.py
│           ├── taxonomy.py
│           ├── admin.py
│           └── health.py
└── tests/
```

## Menjalankan

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# inisialisasi database (PostgreSQL via `docker compose up -d db` di root,
# atau otomatis SQLite lokal bila PostgreSQL tidak tersedia)
flask db upgrade
flask seed

python run.py
```

Health: http://localhost:5000/api/health

`run.py` hanya mengikat server ke `127.0.0.1` secara default dan mengikuti
mode debug dari `FLASK_ENV`. Untuk pengujian dari perangkat lain pada jaringan
lokal, atur `FLASK_HOST=0.0.0.0`. Mode produksi memerlukan `SECRET_KEY` dan
`JWT_SECRET_KEY` acak dengan masing-masing panjang minimal 32 karakter. Seed
data contoh dan akun admin pengembangan ditolak di mode produksi.

## Migrasi

Migrasi dikelola Flask-Migrate (Alembic). Folder `migrations/` sudah tersedia;
untuk database baru jalankan dari direktori `backend`:

```bash
./.venv/bin/python -m flask --app run db upgrade
./.venv/bin/python -m flask --app run db current
```

Jika database lama sudah berisi tabel tetapi `db current` tidak menampilkan
revision, backup dan bandingkan skema dengan migrasi sebelum melakukan upgrade
atau stamp. Jangan menjalankan `db init`, membuat migrasi awal ulang, atau
memberi stamp tanpa memverifikasi kesesuaian skema. Test otomatis memakai
database terpisah dan membuat tabel melalui fixture.

## Rate limiter API

- Default **60 request per 60 detik per IP** pada seluruh path `/api/`.
  Semua endpoint API berbagi kuota IP yang sama; request gagal juga dihitung.
- Atur `RATE_LIMIT_PER_MINUTE=60` di `.env` dan restart backend untuk menerapkannya.
  Nilai numerik kurang dari 1 dibatasi menjadi 1.
- Endpoint health `/api/health`, preflight `OPTIONS`, dan path di luar API
  dikecualikan. Path tidak dikenal seperti `/api/health-extra` tetap dibatasi.
- Respons penolakan memakai format error JSON aplikasi, status HTTP `429`, dan
  `Retry-After` yang dihitung dari sisa waktu hingga kuota berikutnya tersedia.
  Request yang ditolak tidak memperpanjang masa tunggu.
- Penghitungan waktu memakai monotonic clock. Riwayat IP kedaluwarsa dibersihkan
  secara berkala saat ada request; state dan konfigurasi terpisah per instance
  Flask melalui `app.extensions["rate_limiter"]`.
- Penyimpanan **in-memory per proses**, hilang ketika restart dan tidak dibagikan
  antar-worker/replica. Deployment multi-worker memerlukan pembatasan bersama
  di reverse proxy atau penyimpanan bersama yang belum diimplementasikan.
- Identitas IP memakai `request.remote_addr`; `X-Forwarded-For` tidak dipercaya
  otomatis. Di belakang reverse proxy, pengguna dapat berbagi kuota IP proxy.
  Konfigurasi trusted proxy harus disesuaikan dengan topologi deployment dan
  pembatasan akses backend sebelum mempercayai header tersebut.
- Mode `TESTING` menonaktifkan limiter, kecuali `RATELIMIT_ENABLED=True`
  disetel eksplisit pada konfigurasi aplikasi oleh test.

Pengujian khusus rate limiter dari direktori `backend`:

```bash
./.venv/bin/python -m pytest tests/test_rate_limiter.py -q
```

## Test

```bash
pytest -q
```

Test memakai SQLite in-memory (independen dari PostgreSQL).
