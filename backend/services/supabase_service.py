import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class SupabaseService:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        self.client: Client = create_client(self.url, self.key) if self.url and self.key else None

    def save_scan_report(self, user_id: str, report_data: dict):
        if not self.client:
            print("Supabase client not initialized")
            return None
        
        try:
            data, count = self.client.table("scan_reports").insert({
                "user_id": user_id,
                "extracted_text": report_data.get("extracted_text"),
                "scam_probability": report_data.get("scam_probability"),
                "tactics_detected": report_data.get("tactics_detected"),
                "explanation": report_data.get("explanation"),
                "recommended_action": report_data.get("recommended_action")
            }).execute()
            return data
        except Exception as e:
            print(f"Supabase Save Error (Scan): {e}")
            return None

    def save_risk_report(self, user_id: str, report_data: dict):
        if not self.client:
            print("Supabase client not initialized")
            return None
            
        try:
            data, count = self.client.table("risk_reports").insert({
                "user_id": user_id,
                "risk_score": report_data.get("risk_score"),
                "risk_level": report_data.get("risk_level"),
                "predicted_scam_type": report_data.get("predicted_scam_type"),
                "explanation": report_data.get("explanation"),
                "recommendations": report_data.get("recommendations")
            }).execute()
            return data
        except Exception as e:
            print(f"Supabase Save Error (Risk): {e}")
            return None

supabase_service = SupabaseService()
