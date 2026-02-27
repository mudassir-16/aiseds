"""
api/routes.py — FastAPI route definitions.
"""
import logging
from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from pydantic import BaseModel

from auth import get_current_user
from ocr import extract_text
from groq_client import analyse_scam, predict_risk, translate_to_english, simulate_scam
from risk import calculate_risk
from db import save_scan_report, save_risk_report

try:
    from langdetect import detect
except ImportError:
    def detect(text): return "unknown"

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def _get_jwt(request: Request) -> str:
    """Extract the raw Bearer token from the Authorization header."""
    auth = request.headers.get("Authorization", "")
    return auth.removeprefix("Bearer ").strip()


def _detect_language(text: str) -> str:
    try:
        return detect(text)
    except:
        return "unknown"


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
    Accept an image upload, run OCR, detect language, translate if necessary,
    send to Groq for scam analysis, save the result to Supabase, and return the JSON report.
    """
    # File type validation
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are accepted.")

    image_bytes = await file.read()

    # File size validation
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB.")

    # Multilingual OCR Text Extraction
    try:
        extracted_text = extract_text(image_bytes)
    except Exception as e:
        logger.error(f"OCR failed: {e}")
        extracted_text = ""

    # Language Detection & Translation Pipeline
    language = "unknown"
    translated_text = ""
    analysis_text = extracted_text

    if extracted_text.strip():
        language = _detect_language(extracted_text)
        logger.info(f"Detected language: {language}")

        if language not in ("en", "unknown"):
            logger.info("Non-English text detected. Translating...")
            translated_text = translate_to_english(extracted_text)
            analysis_text = translated_text

    # AI analysis — vision model sees the image directly; OCR test/translated text is extra context
    result = analyse_scam(analysis_text, image_bytes=image_bytes)

    # Attach original & translated attributes for transparency
    result["extracted_text"] = extracted_text
    result["language"] = language
    if translated_text:
        result["translated_text"] = translated_text

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
        "correlation_insight": scored["correlation_insight"],
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


# ---------------------------------------------------------------------------
# POST /api/simulate-scam
# ---------------------------------------------------------------------------

class SimulateRequest(BaseModel):
    scam_type: str


@router.post("/simulate-scam")
async def simulate_scam_endpoint(
    body: SimulateRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Generate a fake scam message and explanation based on the chosen type.
    """
    if not body.scam_type:
        raise HTTPException(status_code=400, detail="Missing scam_type parameter")

    result = simulate_scam(body.scam_type)
    return result
