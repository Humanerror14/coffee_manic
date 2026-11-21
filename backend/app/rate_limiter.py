"""Rate limiter sederhana berbasis sliding window per alamat IP.

Default: 60 request per 60 detik per IP (dapat diatur via RATE_LIMIT_PER_MINUTE)
untuk menjaga beban database dan server tetap ringan.

Catatan: penyimpanan in-memory per proses. Untuk deployment multi-worker
(gunicorn -w >1) pasang penyimpanan bersama (mis. Redis) atau aktifkan
limit di reverse proxy.
"""
import time
from math import ceil
from threading import Lock

from flask import jsonify, request


class RateLimiter:
    def __init__(self, requests_per_minute: int = 60, window_seconds: int = 60):
        self.requests_per_minute = max(1, requests_per_minute)
        self.window_seconds = max(1, window_seconds)
        self._hits: dict[str, list[float]] = {}
        self._next_cleanup = 0.0
        self._lock = Lock()

    def configure(self, requests_per_minute: int):
        with self._lock:
            self.requests_per_minute = max(1, requests_per_minute)

    def hit(self, key: str) -> tuple[bool, int, int]:
        """Kembalikan (dibatasi?, sisa kuota, detik sampai kuota tersedia)."""
        with self._lock:
            now = time.monotonic()
            cutoff = now - self.window_seconds
            # Bersihkan juga IP yang tidak pernah mengirim request lagi.
            if now >= self._next_cleanup:
                self._hits = {
                    ip: hits for ip, hits in self._hits.items() if hits[-1] > cutoff
                }
                self._next_cleanup = now + self.window_seconds

            timestamps = [t for t in self._hits.get(key, []) if t > cutoff]
            if len(timestamps) >= self.requests_per_minute:
                self._hits[key] = timestamps
                retry_after = max(1, ceil(timestamps[0] + self.window_seconds - now))
                return True, 0, retry_after
            timestamps.append(now)
            self._hits[key] = timestamps
            return False, self.requests_per_minute - len(timestamps), 0

    def clear(self, key: str | None = None):
        with self._lock:
            if key is None:
                self._hits.clear()
                self._next_cleanup = 0.0
            else:
                self._hits.pop(key, None)


def init_rate_limiter(app):
    """Pasang hook before_request pada Flask app."""
    limiter = RateLimiter(app.config.get("RATE_LIMIT_PER_MINUTE", 60))
    app.extensions["rate_limiter"] = limiter

    @app.before_request
    def check_rate_limit():
        # Nonaktif di test kecuali dinyalakan eksplisit oleh test.
        if app.config.get("TESTING") and not app.config.get("RATELIMIT_ENABLED"):
            return None

        # Preflight CORS tidak boleh memakan kuota.
        if request.method == "OPTIONS":
            return None

        # Endpoint health dipakai monitoring; jangan dibatasi.
        if request.endpoint == "health.health":
            return None

        # Hanya batasi API.
        if not request.path.startswith("/api/"):
            return None

        ip = request.remote_addr or "127.0.0.1"
        limited, remaining, retry_after = limiter.hit(ip)
        if limited:
            resp = jsonify(
                {
                    "error": {
                        "message": "Batas request per menit terlampaui. "
                        "Silakan tunggu beberapa saat.",
                        "status": 429,
                    }
                }
            )
            resp.status_code = 429
            resp.headers["Retry-After"] = str(retry_after)
            return resp

        app.logger.debug("rate-limit ip=%s remaining=%s", ip, remaining)
        return None
