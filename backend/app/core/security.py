"""Security utilities.

Identity comes from Supabase Auth. Tokens are verified two ways:

  1. Asymmetric (ES256/RS256) via the project's JWKS endpoint — the default
     since Supabase rotated projects to asymmetric signing keys.
  2. Symmetric (HS256) via SUPABASE_JWT_SECRET — kept only as a fallback so
     legacy tokens issued before the rotation still decode.

A local `users` row is auto-created on first sight of a new auth_user_id so
existing FK-style code paths keep working.
"""

import logging
import time
from datetime import datetime, timedelta
from typing import Optional, Union

import httpx
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

logger = logging.getLogger(__name__)

# Password hashing — retained so legacy /auth/change-password against local
# accounts (if any) still works during the transition. New accounts go through
# Supabase.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Legacy local-JWT settings — kept so existing tokens (if any) keep decoding
# during the rollout. New tokens are issued by Supabase.
SECRET_KEY = settings.SECRET_KEY if hasattr(settings, 'SECRET_KEY') else "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(subject: Union[str, int], expires_delta: Optional[timedelta] = None) -> str:
    """Legacy local-JWT issuer. Kept so /auth/login can still respond during the
    transition. New code should rely on Supabase-issued tokens."""
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"sub": str(subject), "exp": expire, "iat": datetime.utcnow()}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode a legacy local JWT (signed with SECRET_KEY)."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


# ---------------------------------------------------------------------------
# Supabase JWT verification (asymmetric via JWKS, with HS256 fallback)
# ---------------------------------------------------------------------------

# Cache the JWKS for 10 min. Supabase rotates keys infrequently, but a stale
# cache would lock everyone out, so we refresh on cache-miss-by-kid too.
_JWKS_CACHE_TTL = 600
_jwks_cache: dict[str, object] = {"keys": None, "fetched_at": 0.0}


def _fetch_jwks(force: bool = False) -> Optional[list[dict]]:
    """Return the project's JWKS, refreshing the cache if stale or forced."""
    if not settings.SUPABASE_URL:
        return None

    now = time.monotonic()
    if not force and _jwks_cache["keys"] and now - float(_jwks_cache["fetched_at"]) < _JWKS_CACHE_TTL:
        return _jwks_cache["keys"]  # type: ignore[return-value]

    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
    try:
        resp = httpx.get(url, timeout=5.0)
        resp.raise_for_status()
        keys = resp.json().get("keys", [])
        _jwks_cache["keys"] = keys
        _jwks_cache["fetched_at"] = now
        return keys
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Failed to fetch JWKS from %s: %s", url, exc)
        return _jwks_cache["keys"]  # type: ignore[return-value]


def _decode_supabase_jwt(token: str) -> Optional[dict]:
    """Verify a Supabase access token. Tries JWKS (asymmetric) first, then
    falls back to HS256 with the shared secret for legacy tokens."""
    # Pull the kid from the header without verifying.
    try:
        header = jwt.get_unverified_header(token)
    except JWTError:
        return None
    kid = header.get("kid")
    alg = header.get("alg", "")

    # JWKS path — covers ES256/RS256 (current Supabase default).
    if alg in ("ES256", "ES384", "RS256", "RS384", "RS512"):
        keys = _fetch_jwks() or []
        key = next((k for k in keys if k.get("kid") == kid), None)
        if not key:
            # kid might be brand new — force a refresh and retry once.
            keys = _fetch_jwks(force=True) or []
            key = next((k for k in keys if k.get("kid") == kid), None)
        if not key:
            return None
        try:
            return jwt.decode(
                token,
                key,
                algorithms=[alg],
                audience=settings.SUPABASE_JWT_AUDIENCE,
            )
        except JWTError as exc:
            logger.debug("JWKS verify failed: %s", exc)
            return None

    # HS256 fallback for legacy tokens.
    if alg == "HS256" and settings.SUPABASE_JWT_SECRET:
        try:
            return jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience=settings.SUPABASE_JWT_AUDIENCE,
            )
        except JWTError:
            return None

    return None


async def _get_or_create_user_for_supabase(
    db: AsyncSession,
    auth_user_id: str,
    email: str,
) -> User:
    """Find the local `users` row mirroring this Supabase user, creating it on
    first sight. Email may shift on Supabase; we mirror but don't enforce."""
    result = await db.execute(select(User).where(User.auth_user_id == auth_user_id))
    user = result.scalar_one_or_none()
    if user:
        if email and user.email != email:
            user.email = email
            await db.commit()
        return user

    # Adopt any pre-existing local row with the same email (from before the
    # Supabase migration) so ZATCA credentials don't get orphaned.
    result = await db.execute(select(User).where(User.email == email))
    legacy = result.scalar_one_or_none()
    if legacy:
        legacy.auth_user_id = auth_user_id
        await db.commit()
        return legacy

    user = User(auth_user_id=auth_user_id, email=email, hashed_password=None, is_active=True)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Resolve the request's User from a Supabase-issued JWT (with a legacy
    local-JWT fallback)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials

    claims = _decode_supabase_jwt(token)
    if claims:
        auth_user_id = claims.get("sub")
        email = claims.get("email", "")
        if not auth_user_id:
            raise credentials_exception
        user = await _get_or_create_user_for_supabase(db, auth_user_id, email)
    else:
        # Legacy local JWT path — remove once SECRET_KEY-signed tokens have aged out.
        payload = decode_access_token(token)
        if payload is None:
            raise credentials_exception
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        result = await db.execute(select(User).where(User.id == int(user_id)))
        user = result.scalar_one_or_none()
        if user is None:
            raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
    return current_user


async def get_current_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return current_user
