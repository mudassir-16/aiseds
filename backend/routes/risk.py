from fastapi import APIRouter, HTTPException, Request, Depends
from backend.models.schemas import RiskAssessmentRequest, RiskAssessmentResponse
from backend.services.groq_service import groq_service
from backend.services.supabase_service import supabase_service
from backend.utils.auth import get_current_user
from slowapi import Limiter
from slowapi.util import get_remote_address
from typing import Dict, List
import json

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()

def calculate_base_score(answers: Dict[str, str]) -> int:
    """
    Scoring logic:
    Each unsafe answer = +10
    Max = 100
    """
    unsafe_patterns = {
        "reuse_passwords": "Yes",
        "enable_2fa": "No",
        "click_unknown_links": "Yes",
        "verify_upi": "No",
        "shared_otp": "Yes",
        "public_wifi": "Yes",
        "unknown_apps": "Yes",
        "update_phone": "No",
        "verify_messages": "No",
        "backup_data": "No"
    }

    calculated_score: int = 0
    for key, unsafe_val in unsafe_patterns.items():
        if answers.get(key) == unsafe_val:
            calculated_score += 10
    
    return min(calculated_score, 100)

@router.post("/risk-score", response_model=RiskAssessmentResponse)
@limiter.limit("5/minute")
async def assess_risk(request: Request, risk_request: RiskAssessmentRequest, user_id: str = Depends(get_current_user)):
    try:
        answers = risk_request.answers
        # Step 1: Rule-based score
        risk_score = calculate_base_score(answers)
        
        # Step 2: Risk Level Banding
        if risk_score <= 30:
            risk_level = "Low Risk"
        elif risk_score <= 60:
            risk_level = "Medium Risk"
        else:
            risk_level = "High Risk"

        # Step 3: Call Groq for qualitative analysis
        summary = ", ".join([f"{k}: {v}" for k, v in answers.items()])
        
        prompt = f"""
You are a cybersecurity risk analyst.

User behavior summary:
{summary}

Risk score: {risk_score}/100

Tasks:
1. Determine risk level.
2. Predict most likely financial scam vulnerability.
3. Explain reasoning.
4. Provide 5 personalized security recommendations.

Respond strictly in JSON:
{{
  "risk_level": "{risk_level}",
  "predicted_scam_type": "",
  "explanation": "",
  "recommendations": []
}}
"""
        try:
            analysis = groq_service.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.3-70b-versatile",
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            ai_result = json.loads(analysis.choices[0].message.content)
        except Exception as e:
            print(f"Risk AI Error: {e}")
            ai_result = {
                "risk_level": risk_level,
                "predicted_scam_type": "Unknown",
                "explanation": "AI analysis unavailable.",
                "recommendations": ["Always enable 2FA", "Do not share OTPs", "Verify UPI requests"]
            }
        
        final_response = RiskAssessmentResponse(
            risk_score=risk_score,
            risk_level=ai_result.get("risk_level", risk_level),
            predicted_scam_type=ai_result.get("predicted_scam_type", "Unknown"),
            explanation=ai_result.get("explanation", "Reasoning provided by system heuristics."),
            recommendations=ai_result.get("recommendations", [])
        )

        # Save to Supabase
        supabase_service.save_risk_report(user_id, final_response.dict())
        
        return final_response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Risk assessment failed: {str(e)}")
