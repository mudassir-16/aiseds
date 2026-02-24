PRODUCT REQUIREMENTS DOCUMENT (PRD)
Product Name
AI Social Engineering Defense System (SEDS)
Tagline: “AI-Powered FinTech Fraud Prevention for Digital India”
1️⃣ EXECUTIVE SUMMARY

India faces exponential growth in:

UPI fraud

OTP scams

WhatsApp financial scams

Fake KYC suspension alerts

Banking impersonation attacks

Most attacks happen via screenshots and forwarded messages, not malicious URLs.

Existing tools:

Focus on enterprise systems

Detect links only

Do not analyze screenshot-based fraud

Do not evaluate personal vulnerability

SEDS is an AI-powered system that:

Detects screenshot-based financial scams

Identifies psychological manipulation tactics

Calculates personal cyber risk score

Predicts most likely scam vulnerability

Provides personalized prevention plan

Domain Coverage:

Cybersecurity ✅

FinTech Fraud Prevention ✅

AI/ML Innovation ✅

Social Impact ✅

2️⃣ TARGET USERS

Primary:

Digital payment users

Students

Small business owners

Non-technical citizens

Secondary:

FinTech startups

Banks

Government awareness programs

3️⃣ UNIQUE DIFFERENTIATION

Unlike typical phishing detectors:

✔ Screenshot-based scam detection
✔ Psychological manipulation analysis
✔ Behavioral vulnerability prediction
✔ FinTech fraud focus
✔ Citizen-centric security

Core Differentiator:

Detects the human manipulation strategy behind financial scams.

4️⃣ CORE FEATURES
🔎 FEATURE 1: Screenshot Scam Analyzer
Input:

Upload suspicious screenshot (WhatsApp, SMS, UPI alert)

Processing:

OCR text extraction

LLM analysis via Groq

Psychological tactic detection

Output:

Scam Probability (%)

Detected Manipulation Tactics

Explanation

Recommended Action

📊 FEATURE 2: Cyber Risk Assessment Engine
Input:

10-question user assessment

Processing:

Rule-based numeric scoring

LLM vulnerability analysis

Scam type prediction

Output:

Risk Score (0–100)

Risk Level (Low / Medium / High)

Most Likely Scam Type

Personalized Action Plan

🔐 FEATURE 3: Authentication (Supabase)

Email/password login

JWT-based session

Protected routes

Save scan history

Save risk reports

5️⃣ TECH STACK

Frontend:

React

Tailwind CSS

Axios

Backend:

FastAPI

Python

AI:

Groq API (Llama model)

OCR:

EasyOCR (Primary)

Hardcoded fallback (Emergency)

Database & Auth:

Supabase

Deployment:

Frontend → Vercel

Backend → Railway / Render

Supabase → Cloud

6️⃣ SYSTEM ARCHITECTURE

User Login (Supabase Auth)
↓
Upload Screenshot
↓
Backend:
EasyOCR → Extract Text
↓
Send text to Groq
↓
Receive JSON analysis
↓
Store in Supabase
↓
Display Report

Risk Assessment:
↓
Rule-based scoring
↓
Send summary to Groq
↓
Receive vulnerability prediction
↓
Store & display

7️⃣ DATABASE DESIGN (Supabase)
Table: scan_reports
Field	Type
id	uuid
user_id	uuid
extracted_text	text
scam_probability	float
tactics_detected	json
explanation	text
recommended_action	text
created_at	timestamp
Table: risk_reports
Field	Type
id	uuid
user_id	uuid
risk_score	int
risk_level	text
predicted_scam_type	text
explanation	text
recommendations	json
created_at	timestamp
8️⃣ GROQ PROMPT TEMPLATE
🔎 Scam Analysis Prompt
You are a cybersecurity analyst specializing in financial fraud and social engineering.

Analyze the following message extracted from a screenshot:

[INSERT_TEXT]

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
{
  "scam_probability": number,
  "tactics_detected": [],
  "explanation": "",
  "recommended_action": ""
}
📊 Risk Prediction Prompt
You are a cybersecurity risk analyst.

User behavior summary:
[INSERT_SUMMARY]

Risk score: [INSERT_SCORE]/100

Tasks:
1. Determine risk level.
2. Predict most likely financial scam vulnerability.
3. Explain reasoning.
4. Provide 5 personalized security recommendations.

Respond in JSON format:
{
  "risk_level": "",
  "predicted_scam_type": "",
  "explanation": "",
  "recommendations": []
}
9️⃣ RISK QUESTIONNAIRE

Do you reuse passwords?

Do you enable 2FA?

Do you click unknown links from WhatsApp?

Do you verify UPI requests?

Have you shared OTP before?

Do you use public WiFi for banking?

Do you install apps from unknown sources?

Do you update your phone regularly?

Do you verify bank messages via official websites?

Do you backup critical data?

Scoring:
Unsafe answer = +10 risk
Max = 100

🔟 API DESIGN (FastAPI)

POST /analyze-image
POST /risk-score
GET /user-reports

All routes require JWT authentication.

1️⃣1️⃣ FOLDER STRUCTURE

Backend:

backend/
├── main.py
├── routes/
│   ├── analyze.py
│   ├── risk.py
├── services/
│   ├── ocr_service.py
│   ├── groq_service.py
│   ├── scoring_service.py
├── models/
│   ├── schemas.py
├── utils/
├── requirements.txt

Frontend:

frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Analyzer.jsx
│   │   ├── RiskAssessment.jsx
│   ├── components/
│   ├── services/
│   │   ├── api.js
│   │   ├── supabase.js
│   └── App.js
1️⃣2️⃣ REAL-TIME DEMO STRATEGY

Layer 1: Live Groq + OCR
Layer 2: Preloaded scam images
Layer 3: Local heuristic fallback

Always keep:

3 scam screenshots ready

1 safe message ready