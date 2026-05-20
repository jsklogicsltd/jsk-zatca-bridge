"""Fernet-based encryption helpers for sensitive credentials (CSID, secret).

Stored credentials must be encrypted at rest. We use Fernet (AES-128-CBC +
HMAC-SHA256) keyed off `settings.ENCRYPTION_KEY`, falling back to a
SHA-256-derived key from `SECRET_KEY` for dev convenience.

Production deployments MUST set `ENCRYPTION_KEY` to a freshly generated
Fernet key:  `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
"""

from __future__ import annotations

import base64
import hashlib
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken

from app.core.config import settings


def _derive_key(source: str) -> bytes:
    """Derive a 32-byte URL-safe key suitable for Fernet from any string."""
    digest = hashlib.sha256(source.encode("utf-8")).digest()
    return base64.urlsafe_b64encode(digest)


def _get_fernet() -> Fernet:
    key = getattr(settings, "ENCRYPTION_KEY", None)
    if key:
        # Accept either a ready-made Fernet key (44-char b64) or any string we
        # can derive one from.
        try:
            return Fernet(key.encode("utf-8") if isinstance(key, str) else key)
        except (ValueError, TypeError):
            return Fernet(_derive_key(key))
    return Fernet(_derive_key(settings.SECRET_KEY))


def encrypt(value: Optional[str]) -> Optional[str]:
    """Encrypt a string; passes through None / empty values unchanged."""
    if not value:
        return value
    return _get_fernet().encrypt(value.encode("utf-8")).decode("utf-8")


def decrypt(value: Optional[str]) -> Optional[str]:
    """Decrypt a string; falls back to the input if it isn't a Fernet token
    (so legacy plaintext rows keep working until they're re-saved)."""
    if not value:
        return value
    try:
        return _get_fernet().decrypt(value.encode("utf-8")).decode("utf-8")
    except (InvalidToken, ValueError):
        return value
