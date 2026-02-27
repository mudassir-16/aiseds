"""
risk.py — Rule-based risk scoring engine.
"""
from typing import Any

# Questions from the frontend — mapping to unsafe answers
QUESTION_UNSAFE_MAP = {
    "reuse_passwords": "Yes",
    "enable_2fa": "No",
    "click_unknown_links": "Yes",
    "verify_upi": "No",
    "shared_otp": "Yes",
    "public_wifi": "Yes",
    "unknown_apps": "Yes",
    "update_phone": "No",
    "verify_messages": "No",
    "backup_data": "No",
}

QUESTION_LABELS = {
    "reuse_passwords": "Reuses passwords across banking and social media",
    "enable_2fa": "Does not use 2FA on financial accounts",
    "click_unknown_links": "Clicks links from unknown SMS senders",
    "verify_upi": "Does not verify UPI request recipients",
    "shared_otp": "Has shared OTPs with supposed bank officials",
    "public_wifi": "Uses public WiFi for banking",
    "unknown_apps": "Installs apps from outside official stores",
    "update_phone": "Does not keep phone software updated",
    "verify_messages": "Does not verify bank messages via official numbers",
    "backup_data": "No secure backup of critical financial data",
}

POINTS_PER_UNSAFE = 10


def calculate_risk(answers: dict[str, Any]) -> dict:
    """
    Calculate a risk score from 0-100 based on answers.
    Returns score, level, and list of unsafe behaviors detected.
    """
    score = 0
    unsafe_answers = []
    behavioral_inputs = {}

    for question_id, unsafe_value in QUESTION_UNSAFE_MAP.items():
        user_answer = answers.get(question_id, "")
        if str(user_answer).strip().lower() == unsafe_value.lower():
            score += POINTS_PER_UNSAFE
            unsafe_answers.append(QUESTION_LABELS[question_id])
            behavioral_inputs[question_id] = 1
        else:
            behavioral_inputs[question_id] = 0

    score = min(score, 100)

    if score <= 30:
        risk_level = "Low Risk"
    elif score <= 60:
        risk_level = "Medium Risk"
    else:
        risk_level = "High Risk"

    # Generate Behavioral Risk Correlation Insight
    correlation_data = generate_correlation_insight(behavioral_inputs)

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "unsafe_answers": unsafe_answers,
        "correlation_insight": correlation_data
    }

# ---------------------------------------------------------------------------
# Behavioral Risk Correlation Engine (BRCE)
# ---------------------------------------------------------------------------

SCAM_CORRELATION_MAP = {
    "OTP Theft Scam": {
        "shared_otp": 3,
        "reuse_passwords": 2,
        "click_unknown_links": 2,
        "enable_2fa": 2
    },
    "UPI Refund Scam": {
        "click_unknown_links": 3,
        "verify_messages": 2,
        "reuse_passwords": 1,
        "verify_upi": 3
    },
    "Fake KYC Suspension": {
        "verify_messages": 3,
        "click_unknown_links": 2,
        "public_wifi": 1
    },
    "Job Offer Scam": {
        "click_unknown_links": 2,
        "unknown_apps": 2
    },
    "Prize Lottery Scam": {
        "click_unknown_links": 3,
        "reuse_passwords": 1
    },
    "Investment / Crypto Scam": {
        "unknown_apps": 2,
        "click_unknown_links": 2,
        "reuse_passwords": 1
    },
    "Bank Account Blocked Scam": {
        "verify_messages": 3,
        "click_unknown_links": 3
    }
}

def calculate_behavioral_correlation(user_answers: dict) -> dict:
    scam_scores = {}
    for scam_type, factors in SCAM_CORRELATION_MAP.items():
        score = 0
        for behavior, weight in factors.items():
            if user_answers.get(behavior) == 1:
                score += weight
        scam_scores[scam_type] = score
    return scam_scores

def generate_multiplier(score: int) -> int:
    if score >= 6:
        return 3
    elif score >= 3:
        return 2
    return 1

def generate_correlation_insight(user_answers: dict) -> dict:
    scam_scores = calculate_behavioral_correlation(user_answers)
    highest_scam = max(scam_scores, key=scam_scores.get) if scam_scores else "Unknown / Other"
    max_score = scam_scores.get(highest_scam, 0)
    multiplier = generate_multiplier(max_score)

    # Filter behaviors that were actually unsafe (value == 1) and present in the mapping for the highest scam
    risky_behaviors = []
    if highest_scam in SCAM_CORRELATION_MAP:
        for behavior in SCAM_CORRELATION_MAP[highest_scam].keys():
            if user_answers.get(behavior) == 1:
                risky_behaviors.append(behavior)

    if not risky_behaviors:
        return {
            "most_vulnerable_scam": "General Cyber Threats",
            "risk_multiplier": 1,
            "risky_behaviors": [],
            "insight_text": "Your digital habits are generally safe, but stay vigilant against evolving cyber threats."
        }

    formatted_behaviors = [b.replace("_", " ") for b in risky_behaviors]
    behaviors_str = ", ".join(formatted_behaviors)
    
    return {
        "most_vulnerable_scam": highest_scam,
        "risk_multiplier": multiplier,
        "risky_behaviors": formatted_behaviors,
        "insight_text": f"Users exhibiting behaviors like {behaviors_str} are {multiplier}x more vulnerable to {highest_scam}."
    }
