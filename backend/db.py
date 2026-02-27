"""
db.py — Supabase client for storing scan and risk reports.

Uses the service role key which bypasses RLS, giving the backend
full write access without needing to impersonate the user.
The user_id is stored explicitly so frontend RLS read policies still work.
"""
import logging
from functools import lru_cache
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def _get_client() -> Client | None:
    """Lazily create a singleton Supabase client using the service role key."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        logger.warning("Supabase service key missing — DB storage disabled")
        return None
    try:
        return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except Exception as e:
        logger.error(f"Failed to create Supabase client: {e}")
        return None


def save_scan_report(user_id: str, data: dict, **_) -> None:
    """Save an image analysis result to scan_reports."""
    client = _get_client()
    if not client:
        return
    try:
        client.table("scan_reports").insert({
            "user_id": user_id,
            "extracted_text": data.get("extracted_text", ""),
            "scam_probability": data.get("scam_probability", 0),
            "tactics_detected": data.get("tactics_detected", []),
            "explanation": data.get("explanation", ""),
            "recommended_action": data.get("recommended_action", ""),
        }).execute()
        logger.info(f"Saved scan report for user {user_id[:8]}…")
    except Exception as e:
        logger.error(f"Failed to save scan report: {e}")


def save_risk_report(user_id: str, data: dict, **_) -> None:
    """Save a risk assessment result to risk_reports."""
    client = _get_client()
    if not client:
        return
    try:
        client.table("risk_reports").insert({
            "user_id": user_id,
            "risk_score": data.get("risk_score", 0),
            "risk_level": data.get("risk_level", ""),
            "predicted_scam_type": data.get("predicted_scam_type", ""),
            "explanation": data.get("explanation", ""),
            "recommendations": data.get("recommendations", []),
        }).execute()
        logger.info(f"Saved risk report for user {user_id[:8]}…")
    except Exception as e:
        logger.error(f"Failed to save risk report: {e}")
