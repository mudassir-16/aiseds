from typing import List, Dict

class FallbackService:
    def __init__(self):
        # Keywords that strongly indicate financial scams
        self.scam_keywords = [
            "otp", "upi", "kyc", "bank", "account", "suspended", "won", "lottery",
            "congratulations", "urgent", "blocked", "verify", "link", "reward",
            "refund", "cashback", "aadhar", "pan", "login"
        ]
        
        self.urgency_keywords = ["immediate", "urgent", "now", "today", "quickly", "fast"]
        self.fear_keywords = ["blocked", "suspended", "jail", "legal", "fine", "arrest"]
        self.reward_keywords = ["won", "gift", "lucky", "cashback", "bonus"]

    def analyze_fallback(self, text: str) -> Dict:
        text_lower = text.lower()
        tactics = []
        
        # Simple heuristic matching
        scam_hits = sum(1 for word in self.scam_keywords if word in text_lower)
        
        if any(word in text_lower for word in self.urgency_keywords):
            tactics.append("Urgency")
        if any(word in text_lower for word in self.fear_keywords):
            tactics.append("Fear")
        if any(word in text_lower for word in self.reward_keywords):
            tactics.append("Reward bait")
        
        # Basic probability calculation
        prob = min(scam_hits * 15, 95) if scam_hits > 0 else 0
        
        return {
            "scam_probability": float(prob),
            "tactics_detected": tactics if tactics else ["Unknown"],
            "explanation": "Analysis performed using local heuristic fallback due to AI service unavailability.",
            "recommended_action": "Do not click any links or share OTPs. Verify directly with your bank." if prob > 50 else "Exercise caution with unsolicited messages."
        }

fallback_service = FallbackService()
