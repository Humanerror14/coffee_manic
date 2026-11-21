# Coffee Manic

**Discover Coffee. Find Your Atmosphere. Join the Community.**

Platform web penemuan kedai kopi lokal untuk Kecamatan **Lhoksukon, Kabupaten Aceh Utara**. Coffee Manic membantu pengguna menemukan kedai berdasarkan preferensi kopi, suasana, fasilitas, kisaran harga, lokasi, dan pengalaman komunitas.

## Stack

| Komponen | Keputusan |
|---|---|
| Platform | Web application |
| Frontend | React.js + Vite |
| Backend | Python + Flask |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Editor | Visual Studio Code |
| Version control | Git + GitHub |
| Bahasa dokumentasi | Bahasa Indonesia |

## Struktur repository

```
coffee-manic/
├── AGENTS.md
├── README.md
├── PRD.md
├── PROJECT_CONTEXT.md
├── PROJECT_STATUS.md
├── CHANGELOG.md
├── docker-compose.yml
├── .env.example
├── .gitignore
├── .vscode/extensions.json
├── frontend/          # React + Vite
├── backend/           # Flask REST API
├── database/          # Rancangan SQL dan artefak database
├── research/          # Data dictionary dan registry sumber
├── tests/             # Rencana dan implementasi pengujian
└── .ai/skills/        # Instruksi AI berdasarkan peran (8 skills)
```

## Prasyarat

- Python 3.11+ (teruji pada 3.14)
- Node.js 20+ dan npm
- Docker Desktop **atau** PostgreSQL lokal
- Git dan Visual Studio Code

## Instalasi dan menjalankan

### 1. Environment

```bash
cp .env.example .env
```

Ganti `SECRET_KEY` dan `JWT_SECRET_KEY`. Jangan commit file `.env`.

### 2. PostgreSQL

```bash
docker compose up -d db
```

> Tanpa Docker, Anda dapat memakai SQLite lokal: set `DATABASE_URL=sqlite:///coffee_manic.db` di `.env`. Backend otomatis memakai SQLite bila PostgreSQL tidak bisa dijangkau.

### 3. Backend Flask

```bash
cd backend
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows PowerShell:
#   .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python run.py
```

Health endpoint: http://localhost:5000/api/health

### 4. Frontend React

```bash
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173 di browser.

### 5. Inisialisasi database & seed (opsional)

```bash
cd backend
flask db upgrade     # membuat tabel
flask seed           # data contoh + admin dev
```

## API

Semua endpoint memakai prefix `/api`. Dokumentasi interaktif tersedia di `/api/docs` (Swagger UI, hanya di mode development).

Rate limiter API memakai sliding window **60 request per 60 detik per IP**.
Atur `RATE_LIMIT_PER_MINUTE` di `.env`, lalu restart backend untuk mengubah kuota.
Request berlebih mendapat HTTP `429` dengan header `Retry-After` dalam detik.
Endpoint health dan preflight `OPTIONS` tidak menghabiskan kuota.
Lihat `backend/README.md` untuk batasan multi-worker dan reverse proxy.

## Dokumentasi lanjutan

- `PRD.md` — kebutuhan produk, scope, fitur, kriteria MVP
- `PROJECT_CONTEXT.md` — konteks dan keputusan tetap
- `PROJECT_STATUS.md` — progress dan pekerjaan tertunda
- `AGENTS.md` — instruksi AI coding assistant
- `research/data_dictionary.md` — data dictionary
- `research/source_registry.csv` — registry sumber data
