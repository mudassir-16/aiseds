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

    for question_id, unsafe_value in QUESTION_UNSAFE_MAP.items():
        user_answer = answers.get(question_id, "")
        if str(user_answer).strip().lower() == unsafe_value.lower():
            score += POINTS_PER_UNSAFE
            unsafe_answers.append(QUESTION_LABELS[question_id])

    score = min(score, 100)

    if score <= 30:
        risk_level = "Low Risk"
    elif score <= 60:
        risk_level = "Medium Risk"
    else:
        risk_level = "High Risk"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "unsafe_answers": unsafe_answers,
    }
