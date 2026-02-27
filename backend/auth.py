"""
auth.py — JWT validation for Supabase tokens.

Modern Supabase projects sign user JWTs with ES256 (ECDSA P-256) and expose
public keys via a JWKS endpoint.  We fetch those keys on first use, cache
them, and verify every request with the correct public key.

Falls back to HS256 (legacy projects) so the code works with both.
"""
from __future__ import annotations

import logging
from functools import lru_cache

import jwt
import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from config import SUPABASE_URL, SUPABASE_JWT_SECRET, SUPABASE_KEY

logger = logging.getLogger(__name__)
security = HTTPBearer()

# ---------------------------------------------------------------------------
# JWKS fetching
# ---------------------------------------------------------------------------

# Simple in-memory cache for JWKS
_jwks_cache: list[dict] = []

def _fetch_jwks(force_refresh: bool = False) -> list[dict]:
    """Fetch Supabase's public JWKS with a basic cache."""
    global _jwks_cache
    if _jwks_cache and not force_refresh:
        return _jwks_cache

    jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    headers = {"apikey": SUPABASE_KEY or ""}
    try:
        resp = requests.get(jwks_url, headers=headers, timeout=5)
        resp.raise_for_status()
        keys = resp.json().get("keys", [])
        if keys:
            _jwks_cache = keys
            logger.info(f"Fetched {len(keys)} JWKS key(s) from Supabase")
        return keys
    except Exception as exc:
        logger.warning(f"Could not fetch JWKS: {exc}")
        return _jwks_cache


def _get_jwk_for_token(token: str) -> dict | None:
    """Return the right JWK for the token's key-id (kid). Refreshes JWKS if kid is new."""
    try:
        header = jwt.get_unverified_header(token)
    except Exception:
        return None

    kid = header.get("kid")
    alg = header.get("alg", "")

    # First try with cached keys
    keys = _fetch_jwks()
    for k in keys:
        if kid and k.get("kid") == kid:
            return k

    # If kid not found in cache, force refresh
    if kid:
        keys = _fetch_jwks(force_refresh=True)
        for k in keys:
            if k.get("kid") == kid:
                return k

    # Fallback to alg matching if no kid
    if not kid:
        for k in keys:
            if k.get("alg") == alg:
                return k

    # Last resort fallback if we have keys
    return keys[0] if keys else None


# ---------------------------------------------------------------------------
# Decode helpers
# ---------------------------------------------------------------------------

_DECODE_OPTS = {"verify_aud": False, "verify_exp": True}


def _try_es256(token: str) -> dict | None:
    """Attempt ES256 verification using JWKS public key."""
    jwk = _get_jwk_for_token(token)
    if not jwk:
        return None
    try:
        public_key = jwt.algorithms.ECAlgorithm.from_jwk(jwk)
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["ES256"],
            options=_DECODE_OPTS,
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise   # bubble up — definitive
    except Exception as exc:
        print(f"\n--- ES256 Decode Error ---\n{type(exc).__name__}: {exc}\n--------------------------", flush=True)
        return None


def _try_hs256(token: str) -> dict | None:
    """Attempt HS256 verification using the raw JWT secret (legacy projects)."""
    import base64
    secret = SUPABASE_JWT_SECRET or ""
    if not secret:
        return None

    candidates: list = []
    # Base64-decoded bytes (standard Supabase HS256 secret format)
    try:
        padded = secret + "=" * (-len(secret) % 4)
        candidates.append(base64.b64decode(padded))
    except Exception:
        pass
    candidates.append(secret.encode("utf-8"))   # raw fallback

    for key in candidates:
        try:
            payload = jwt.decode(
                token,
                key,
                algorithms=["HS256"],
                options=_DECODE_OPTS,
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise
        except Exception:
            continue
    return None


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Validate a Supabase JWT (ES256 or HS256) and return its payload."""
    token = credentials.credentials

    try:
        header = jwt.get_unverified_header(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed token.")

    alg = header.get("alg", "")

    try:
        if alg == "ES256":
            payload = _try_es256(token)
            if payload is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="ES256 token verification failed. Check JWKS configuration.",
                )
            return payload

        if alg == "HS256":
            payload = _try_hs256(token)
            if payload is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="HS256 token verification failed. Check JWT secret.",
                )
            return payload

        # Unknown algorithm
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Unsupported token algorithm: {alg}",
        )

    except HTTPException:
        raise
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please sign in again.",
        )
