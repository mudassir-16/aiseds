"""
groq_client.py — Groq API wrappers for scam analysis and risk prediction.

Analysis strategy for images:
  1. Vision-first: Send the image directly to Groq's vision model (meta-llama/llama-4-scout-17b-16e-instruct).
     This works even when OCR fails (e.g. screenshots of chat apps, social media posts).
  2. If the caller also provides extracted OCR text, that is appended as extra context.
  3. If Groq fails entirely, fall back to heuristic keyword matching on OCR text.
"""
import base64
import json
import logging
import re

from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL, GROQ_VISION_MODEL

logger = logging.getLogger(__name__)
client = Groq(api_key=GROQ_API_KEY)

# Vision model is defined in config.py


# ---------------------------------------------------------------------------
# Low-level helpers
# ---------------------------------------------------------------------------

def _chat(messages: list, model: str | None = None, max_tokens: int = 800) -> str:
    """Send a chat completion request and return the raw content string."""
    response = client.chat.completions.create(
        model=model or GROQ_MODEL,
        messages=messages,
        temperature=0.2,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def _extract_json(text: str) -> dict:
    """Extract the first JSON object from a (possibly verbose) response."""
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group())
    raise ValueError(f"No JSON found in response: {text[:300]}")


def _image_to_data_url(image_bytes: bytes, mime: str = "image/png") -> str:
    """Encode raw image bytes as a data: URL for the Groq vision API."""
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:{mime};base64,{b64}"


# ---------------------------------------------------------------------------
# Scam analysis prompts
# ---------------------------------------------------------------------------

SCAM_SYSTEM_PROMPT = """\
You are a cybersecurity AI expert specialising in financial fraud and social engineering \
detection in India (WhatsApp scams, UPI fraud, OTP phishing, fake KYC alerts, etc.).

Analyse the provided screenshot/message and return ONLY a valid JSON object with these exact keys:
- is_scam: boolean
- scam_probability: integer 0-100
- scam_type: exactly one string from this list ONLY:
    ["UPI Refund Scam", "Fake KYC Suspension", "OTP Theft Scam", "Job Offer Scam", "Prize Lottery Scam", "Bank Account Blocked Scam", "Investment / Crypto Scam", "Unknown / Other"]
- tactics_detected: array of strings, each from ONLY this list:
    ["Urgency", "Fear", "Authority impersonation", "Reward bait", "Scarcity"]
- explanation: string (2-3 sentences in plain English describing what makes this suspicious)
- recommended_action: string (1 clear action sentence for the user)

Return NOTHING except the JSON object. No preamble, no markdown."""


# ---------------------------------------------------------------------------
# Keyword heuristic fallback (works even with no Groq)
# ---------------------------------------------------------------------------

SCAM_KEYWORDS = {
    "urgency": ["urgent", "immediately", "now", "act fast", "limited time", "expire", "suspended", "blocked"],
    "reward": ["won", "winner", "prize", "lottery", "reward", "cashback", "free", "gift", "congratulation"],
    "authority": ["sbi", "hdfc", "icici", "axis", "bank", "rbi", "government", "official", "income tax", "police", "uidai", "npci"],
    "fear": ["penalty", "legal action", "arrest", "fraud reported", "account blocked", "fine", "suspended", "deactivated"],
    "social_eng": ["is this you", "your photo", "seen your", "click here", "verify now", "confirm identity"],
    "otp": ["otp", "one time password", "pin", "verify", "kyc", "share your"],
    "link": ["bit.ly", "tiny", "tinyurl", "t.me", "wa.me", "http://"],
    "upi": ["upi", "gpay", "phonepe", "paytm", "transfer", "pay now"],
}


def _heuristic_scam_analysis(text: str) -> dict:
    """Keyword-based analysis — the last-resort fallback."""
    text_lower = text.lower()
    score = 0
    tactics = []

    if any(kw in text_lower for kw in SCAM_KEYWORDS["urgency"]):
        score += 25
        tactics.append("Urgency")
    if any(kw in text_lower for kw in SCAM_KEYWORDS["reward"]):
        score += 30
        tactics.append("Reward bait")
    if any(kw in text_lower for kw in SCAM_KEYWORDS["authority"]):
        score += 20
        tactics.append("Authority impersonation")
    if any(kw in text_lower for kw in SCAM_KEYWORDS["fear"]):
        score += 25
        tactics.append("Fear")
    if any(kw in text_lower for kw in SCAM_KEYWORDS["social_eng"]):
        score += 35   # "is this you in this photo" type scams
        if "Fear" not in tactics:
            tactics.append("Fear")
    if any(kw in text_lower for kw in SCAM_KEYWORDS["otp"]):
        score += 20
    if any(kw in text_lower for kw in SCAM_KEYWORDS["link"]):
        score += 15

    score = min(score, 95)

    if score >= 60:
        explanation = "Multiple high-risk patterns detected. This message uses psychological manipulation to pressure you into a hasty action."
        action = "Do NOT click any links or share OTPs/PINs. Block the sender and report to cybercrime.gov.in."
    elif score >= 30:
        explanation = "Some suspicious patterns detected. This message has characteristics commonly seen in social engineering attacks."
        action = "Verify the sender's identity through official channels before taking any action."
    else:
        explanation = "No obvious scam indicators detected in this message."
        action = "Stay vigilant and never share OTPs or financial credentials with anyone."

    # Very naive type classification
    scam_type = "Unknown / Other"
    if score >= 30:
        if "Fear" in tactics and "Authority impersonation" in tactics:
            scam_type = "Fake KYC Suspension"
            if any(kw in text_lower for kw in ["account blocked", "suspended"]):
                scam_type = "Bank Account Blocked Scam"
        elif "Reward bait" in tactics:
            scam_type = "Prize Lottery Scam"
        elif any(kw in text_lower for kw in ["job", "offer", "work from home", "hiring"]):
            scam_type = "Job Offer Scam"
        elif any(kw in text_lower for kw in ["crypto", "invest", "returns"]):
            scam_type = "Investment / Crypto Scam"
        elif any(kw in text_lower for kw in ["upi", "refund"]):
            scam_type = "UPI Refund Scam"
        elif "otp" in text_lower or "pin" in text_lower:
            scam_type = "OTP Theft Scam"

    return {
        "is_scam": score >= 60,
        "scam_probability": score,
        "scam_type": scam_type,
        "tactics_detected": tactics,
        "explanation": explanation,
        "recommended_action": action,
    }


# ---------------------------------------------------------------------------
# Vision-based analysis (primary path)
# ---------------------------------------------------------------------------

def _analyse_with_vision(image_bytes: bytes, ocr_text: str = "") -> dict:
    """
    Send the image directly to Groq's vision model.
    OCR text (if any) is appended as supplementary context.
    """
    data_url = _image_to_data_url(image_bytes)

    user_content: list = [
        {
            "type": "image_url",
            "image_url": {"url": data_url},
        },
        {
            "type": "text",
            "text": (
                "Analyse this screenshot for scam / social engineering indicators.\n"
                + (f"\nOCR-extracted text for extra context:\n{ocr_text}" if ocr_text.strip() else "")
            ),
        },
    ]

    messages = [
        {"role": "system", "content": SCAM_SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    raw = _chat(messages, model=GROQ_VISION_MODEL, max_tokens=800)
    result = _extract_json(raw)
    for key in ("is_scam", "scam_probability", "scam_type", "tactics_detected", "explanation", "recommended_action"):
        if key not in result:
            if key == "scam_type":
                result["scam_type"] = "Unknown / Other"
            elif key == "is_scam":
                result["is_scam"] = result.get("scam_probability", 0) >= 60
            else:
                raise ValueError(f"Missing key: {key}")
    result["scam_probability"] = int(result["scam_probability"])
    return result


# ---------------------------------------------------------------------------
# Text-only analysis (secondary path when image bytes unavailable)
# ---------------------------------------------------------------------------

def _analyse_with_text(extracted_text: str) -> dict:
    """Send OCR-extracted text to Groq for analysis."""
    messages = [
        {"role": "system", "content": SCAM_SYSTEM_PROMPT},
        {"role": "user", "content": f"Analyse this text extracted from a screenshot:\n\n{extracted_text}"},
    ]
    raw = _chat(messages, max_tokens=800)
    result = _extract_json(raw)
    for key in ("is_scam", "scam_probability", "scam_type", "tactics_detected", "explanation", "recommended_action"):
        if key not in result:
            if key == "scam_type":
                result["scam_type"] = "Unknown / Other"
            elif key == "is_scam":
                result["is_scam"] = result.get("scam_probability", 0) >= 60
            else:
                raise ValueError(f"Missing key: {key}")
    result["scam_probability"] = int(result["scam_probability"])
    return result


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def translate_to_english(text: str) -> str:
    """Translate extracted text to English using Groq."""
    prompt = f"Translate the following text to English. Only return the translated text.\n\nText:\n{text}"
    messages = [
        {"role": "user", "content": prompt}
    ]
    try:
        return _chat(messages, max_tokens=1000).strip()
    except Exception as exc:
        logger.warning(f"Groq translation failed: {exc}")
        return text  # Fallback to original text


def analyse_scam(extracted_text: str, image_bytes: bytes | None = None) -> dict:
    """
    Analyse a screenshot for scam indicators.

    Strategy (in order):
      1. Vision model with image + OCR context  (best accuracy)
      2. Text-only Groq analysis on OCR text    (if image unavailable but text exists)
      3. Keyword heuristic on OCR text          (offline fallback)
    """
    # Path 1: vision
    if image_bytes:
        try:
            logger.info("Running vision-based scam analysis…")
            result = _analyse_with_vision(image_bytes, ocr_text=extracted_text)
            logger.info(f"Vision analysis complete: {result['scam_probability']}% scam probability")
            return result
        except Exception as exc:
            logger.warning(f"Vision analysis failed ({exc}); falling back to text analysis.")

    # Path 2: text-only Groq
    if extracted_text.strip():
        try:
            logger.info("Running text-based scam analysis…")
            result = _analyse_with_text(extracted_text)
            logger.info(f"Text analysis complete: {result['scam_probability']}% scam probability")
            return result
        except Exception as exc:
            logger.warning(f"Text analysis failed ({exc}); using heuristic fallback.")
            return _heuristic_scam_analysis(extracted_text)

    # Path 3: nothing available
    logger.warning("No image bytes and no OCR text — returning empty result.")
    return {
        "is_scam": False,
        "scam_probability": 0,
        "scam_type": "Unknown / Other",
        "tactics_detected": [],
        "explanation": "No content could be extracted from the image. Please ensure the screenshot is clear and contains readable text or visible content.",
        "recommended_action": "Try uploading a clearer screenshot.",
    }


# ---------------------------------------------------------------------------
# Risk prediction (unchanged)
# ---------------------------------------------------------------------------

RISK_SYSTEM_PROMPT = """\
You are a cybersecurity risk analyst.
Given a user's cyber risk score and their unsafe answers, return ONLY a valid JSON object with these exact keys:
- predicted_scam_type: string (most likely scam type the user is vulnerable to)
- explanation: string (2-3 sentences explaining why, personalised)
- recommendations: array of exactly 5 short actionable strings

Return NOTHING except the JSON object."""

RISK_FALLBACK_BY_LEVEL = {
    "High Risk": {
        "predicted_scam_type": "UPI Refund / OTP Phishing Scam",
        "explanation": "Your behavioral patterns indicate high vulnerability to UPI-based fraud. Multiple unsafe digital habits significantly increase your exposure to social engineering attacks.",
        "recommendations": [
            "Enable 2FA on all financial accounts immediately.",
            "Never share OTPs, PINs, or passwords with anyone — including bank officials.",
            "Verify every UPI request recipient name before entering your PIN.",
            "Use a dedicated device or app for banking transactions only.",
            "Report suspicious messages to cybercrime.gov.in or call 1930.",
        ],
    },
    "Medium Risk": {
        "predicted_scam_type": "Fake KYC / Account Suspension Scam",
        "explanation": "You have moderate cyber hygiene with some risky habits. Scammers may target you through fake bank notifications.",
        "recommendations": [
            "Enable 2FA on all financial accounts.",
            "Never click links in SMS from unknown senders.",
            "Always verify bank communications via official customer care numbers.",
            "Keep your phone software and apps updated.",
            "Use unique, strong passwords for each financial account.",
        ],
    },
    "Low Risk": {
        "predicted_scam_type": "Advance Fee / Lottery Scam",
        "explanation": "Your digital habits are mostly safe. Stay vigilant about unsolicited prize or reward messages.",
        "recommendations": [
            "Continue using 2FA on all important accounts.",
            "Educate family members — especially elderly — about common scams.",
            "Regularly review your bank and UPI transaction history.",
            "Use a password manager to maintain strong unique passwords.",
            "Stay updated on new scam trends via cybercrime.gov.in.",
        ],
    },
}


def predict_risk(risk_score: int, risk_level: str, unsafe_answers: list) -> dict:
    """Groq-based risk prediction with static fallback."""
    unsafe_summary = ", ".join(unsafe_answers) if unsafe_answers else "none"
    messages = [
        {"role": "system", "content": RISK_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"Risk score: {risk_score}/100\n"
                f"Risk level: {risk_level}\n"
                f"Unsafe behaviors identified: {unsafe_summary}"
            ),
        },
    ]
    try:
        raw = _chat(messages)
        result = _extract_json(raw)
        for key in ("predicted_scam_type", "explanation", "recommendations"):
            if key not in result:
                raise ValueError(f"Missing key: {key}")
        if not isinstance(result["recommendations"], list):
            raise ValueError("recommendations must be a list")
        return result
    except Exception as exc:
        logger.warning(f"Groq risk prediction failed: {exc}. Using static fallback.")
        return RISK_FALLBACK_BY_LEVEL.get(risk_level, RISK_FALLBACK_BY_LEVEL["Medium Risk"])
