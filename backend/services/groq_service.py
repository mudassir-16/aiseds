import os
from groq import Groq
import json
from dotenv import load_dotenv

load_dotenv()

class GroqService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            print("Warning: GROQ_API_KEY not found in environment")
        self.client = Groq(api_key=self.api_key)

    def analyze_scam(self, text: str) -> dict:
        prompt = f"""
You are a cybersecurity analyst specializing in financial fraud and social engineering.

Analyze the following message extracted from a screenshot:

{text}

Tasks:
1. Determine if this is a financial scam.
2. Assign a scam probability (0-100).
3. Identify psychological tactics used:
   - Urgency
   - Fear
   - Authority impersonation
   - Reward bait
   - Scarcity
4. Explain reasoning clearly.
5. Provide recommended user action.

Respond strictly in JSON:
{{
  "scam_probability": number,
  "tactics_detected": [],
  "explanation": "",
  "recommended_action": ""
}}
"""
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile", # Using a common Groq model
                response_format={"type": "json_object"},
                temperature=0.2,
            )
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            print(f"Groq Error: {e}")
            return {
                "scam_probability": 50.0,
                "tactics_detected": ["Unknown"],
                "explanation": f"Error calling AI service: {str(e)}",
                "recommended_action": "Manually verify the message."
            }

groq_service = GroqService()
