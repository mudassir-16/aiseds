from pydantic import BaseModel
from typing import List, Dict

class AnalysisResponse(BaseModel):
    scam_probability: float
    tactics_detected: List[str]
    explanation: str
    recommended_action: str

class RiskAssessmentRequest(BaseModel):
    answers: Dict[str, str]

class RiskAssessmentResponse(BaseModel):
    risk_score: int
    risk_level: str
    predicted_scam_type: str
    explanation: str
    recommendations: List[str]
