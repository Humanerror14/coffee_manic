"""Fungsi bantu API."""
from datetime import datetime
from typing import Any
from urllib.parse import unquote, urlsplit

from flask import jsonify


def isoformat(dt: datetime | None) -> str | None:
    return dt.isoformat() if dt else None


def ok(data: Any = None, status: int = 200, **extra):
    payload: dict = {}
    if data is not None:
        payload["data"] = data
    payload.update(extra)
    return jsonify(payload), status


def fail(message: str, status: int = 400, **extra):
    payload = {"error": {"message": message}}
    payload["error"].update(extra)
    return jsonify(payload), status


def is_safe_web_url(value: str | None, *, allow_local_asset: bool = False) -> bool:
    """Terima URL web dan, bila diminta, path aset lokal tanpa traversal."""
    if not isinstance(value, str) or not value or value != value.strip():
        return False
    if any(
        character.isspace() or ord(character) < 32 or ord(character) == 127
        for character in value
    ):
        return False
    if "\\" in value:
        return False

    try:
        parsed = urlsplit(value)
    except ValueError:
        return False

    if parsed.scheme.lower() in {"http", "https"}:
        if not parsed.netloc or not parsed.hostname:
            return False
        if parsed.username is not None or parsed.password is not None:
            return False
        try:
            parsed.port
        except ValueError:
            return False
        return True

    if not allow_local_asset or parsed.scheme or parsed.netloc:
        return False
    if not parsed.path.startswith("/assets/"):
        return False

    path = parsed.path
    for _ in range(8):
        decoded_path = unquote(path)
        if "\\" in decoded_path or any(
            character.isspace() or ord(character) < 32 or ord(character) == 127
            for character in decoded_path
        ):
            return False
        if decoded_path == path:
            break
        path = decoded_path
    else:
        return False

    return not any(part in {".", ".."} for part in path.split("/"))
