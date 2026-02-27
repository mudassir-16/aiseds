"""
api/routes.py — FastAPI route definitions.
"""
import logging
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from pydantic import BaseModel

from auth import get_current_user
from ocr import extract_text
from groq_client import analyse_scam, predict_risk
from risk import calculate_risk
from db import save_scan_report, save_risk_report

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _get_jwt(request: Request) -> str:
    """Extract the raw Bearer token from the Authorization header."""
    auth = request.headers.get("Authorization", "")
    return auth.removeprefix("Bearer ").strip()


# ---------------------------------------------------------------------------
# POST /api/analyze-image
# ---------------------------------------------------------------------------

@router.post("/analyze-image")
async def analyze_image(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Accept an image upload, run OCR, send to Groq for scam analysis,
    save the result to Supabase, and return the JSON report.
    """
    # File type validation
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted.")

    image_bytes = await file.read()

    # File size validation
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB.")

    # OCR (supplementary context for vision model)
    try:
        extracted_text = extract_text(image_bytes)
    except Exception as e:
        logger.error(f"OCR failed: {e}")
        extracted_text = ""

    # AI analysis — vision model sees the image directly; OCR text is extra context
    result = analyse_scam(extracted_text, image_bytes=image_bytes)
    result["extracted_text"] = extracted_text

    # Persist to Supabase
    user_id = current_user.get("sub", "")
    if user_id:
        save_scan_report(user_id, result, user_jwt=_get_jwt(request))

    return result


# ---------------------------------------------------------------------------
# POST /api/risk-score
# ---------------------------------------------------------------------------

class RiskRequest(BaseModel):
    answers: dict


@router.post("/risk-score")
async def risk_score(
    request: Request,
    body: RiskRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Accept 10 answers, calculate rule-based risk score, get Groq prediction,
    save to Supabase, and return the full risk report.
    """
    # Rule-based scoring
    scored = calculate_risk(body.answers)
    risk_score_val = scored["risk_score"]
    risk_level = scored["risk_level"]
    unsafe_answers = scored["unsafe_answers"]

    # Groq vulnerability prediction
    prediction = predict_risk(risk_score_val, risk_level, unsafe_answers)

    result = {
        "risk_score": risk_score_val,
        "risk_level": risk_level,
        "predicted_scam_type": prediction["predicted_scam_type"],
        "explanation": prediction["explanation"],
        "recommendations": prediction["recommendations"],
    }

    # Persist to Supabase
    user_id = current_user.get("sub", "")
    if user_id:
        save_risk_report(user_id, result, user_jwt=_get_jwt(request))

    return result


# ---------------------------------------------------------------------------
# GET /api/reports  (optional — frontend uses Supabase JS SDK directly)
# ---------------------------------------------------------------------------

@router.get("/reports")
async def get_reports(current_user: dict = Depends(get_current_user)):
    """Health-check endpoint. Frontend reads reports via Supabase JS SDK."""
    return {"message": "Use Supabase client on frontend to read reports.", "user": current_user.get("sub")}
