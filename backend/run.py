"""Coffee Manic backend entrypoint."""
import os
import sys

try:
    from dotenv import load_dotenv
except ModuleNotFoundError:
    print("\n[ERROR] Modul 'dotenv' tidak ditemukan.")
    print("Pastikan Anda menggunakan virtual environment backend:")
    print("   source backend/.venv/bin/activate")
    print("Atau jalankan langsung:")
    print("   ./backend/.venv/bin/python backend/run.py\n")
    sys.exit(1)

load_dotenv()

from app import create_app  # noqa: E402

app = create_app()

if __name__ == "__main__":
    app.run(
        host=os.environ.get("FLASK_HOST", "127.0.0.1"),
        port=5000,
        debug=app.config["DEBUG"],
    )
