TECHNICAL REQUIREMENTS DOCUMENT (TRD)
Project Name
AI Social Engineering Defense System (SEDS)

Domain: Cybersecurity + FinTech Fraud Prevention
Architecture: Full-Stack Web Application

1️⃣ SYSTEM OVERVIEW

SEDS is a full-stack AI-powered application that:

Detects financial scams from uploaded screenshots.

Identifies psychological manipulation tactics.

Calculates personal cyber risk score.

Predicts most likely financial fraud vulnerability.

Stores reports securely with authentication.

2️⃣ FINAL TECH STACK (LOCKED)
🖥 Frontend

React (Vite)

Tailwind CSS

Axios

Supabase JS SDK

⚙ Backend

FastAPI

Python 3.10+

Uvicorn

🧠 AI Layer

Groq API (Llama 3 / Mixtral model)

📝 OCR

EasyOCR (Primary)

Rule-based fallback (Emergency)

🔐 Authentication & Database

Supabase Auth

Supabase Postgres DB

☁ Deployment

Frontend → Vercel

Backend → Railway / Render

Supabase → Hosted Cloud

3️⃣ HIGH-LEVEL ARCHITECTURE
Client (React)
      ↓
Supabase Auth (JWT)
      ↓
FastAPI Backend
      ↓
EasyOCR → Extract Text
      ↓
Groq API → Analyze Scam
      ↓
Return JSON Response
      ↓
Store in Supabase
      ↓
Display Report
4️⃣ COMPONENT ARCHITECTURE
A️⃣ Frontend Layer (React)
Pages:

Login

Register

Dashboard

Screenshot Analyzer

Risk Assessment

Report Viewer

Responsibilities:

Image upload handling

Form input (risk questionnaire)

Display results

Handle JWT auth

Call backend APIs

B️⃣ Backend Layer (FastAPI)
Responsibilities:

Validate JWT tokens

Process image uploads

Run OCR extraction

Call Groq API

Compute risk score

Store reports in Supabase

Handle fallback logic

C️⃣ AI Layer (Groq)

Used for:

Scam classification

Psychological tactic detection

Vulnerability prediction

Personalized recommendations

D️⃣ Database Layer (Supabase)

Handles:

Authentication

User management

Scan reports

Risk reports

5️⃣ API DESIGN
🔎 POST /analyze-image
Request:

image file

Processing:

Run EasyOCR

Send extracted text to Groq

Parse JSON response

Store result

Response:
{
  scam_probability: 85,
  tactics_detected: ["Urgency", "Authority Impersonation"],
  explanation: "...",
  recommended_action: "..."
}
📊 POST /risk-score
Request:
{
  answers: {...}
}
Processing:

Calculate numeric score

Send summary to Groq

Get risk level + prediction

Store report

Response:
{
  risk_score: 70,
  risk_level: "High",
  predicted_scam_type: "UPI Refund Scam",
  recommendations: [...]
}
6️⃣ DATABASE SCHEMA
Table: scan_reports
Column	Type
id	uuid
user_id	uuid
extracted_text	text
scam_probability	int
tactics_detected	jsonb
explanation	text
recommended_action	text
created_at	timestamp
Table: risk_reports
Column	Type
id	uuid
user_id	uuid
risk_score	int
risk_level	text
predicted_scam_type	text
explanation	text
recommendations	jsonb
created_at	timestamp
7️⃣ OCR STRATEGY
Primary:

EasyOCR (offline, stable)

Fallback:

If OCR fails:

Use pre-extracted demo text

Or basic keyword heuristic classifier

This ensures demo reliability.

8️⃣ GROQ INTEGRATION REQUIREMENTS

Model: Llama 3 70B or Mixtral

Response format: Strict JSON

Temperature: 0.2 (for consistent output)

Max tokens: 800

Backend must:

Validate JSON format

Handle API timeout

Implement retry logic

9️⃣ RISK SCORING LOGIC

Each unsafe answer = +10
Safe answer = 0

Score bands:

0–30 → Low Risk
31–60 → Medium Risk
61–100 → High Risk

Groq adds:

Explanation

Vulnerability prediction

5 recommendations

🔟 SECURITY REQUIREMENTS

JWT validation on backend

Protected API endpoints

CORS configured

Input validation

File size limit (max 5MB)

No sensitive data logging

1️⃣1️⃣ PERFORMANCE REQUIREMENTS

OCR < 3 seconds

Groq response < 5 seconds

Total request < 8 seconds

Loading spinner UI required

1️⃣2️⃣ ERROR HANDLING

If:

Groq fails → fallback heuristic

OCR fails → error message + retry

Internet fails → use preloaded sample

App must NEVER crash.

1️⃣3️⃣ DEPLOYMENT CHECKLIST

Before demo:

Backend hosted and tested

Frontend deployed

Supabase connected

Environment variables configured

3 scam screenshots saved locally

1 safe screenshot saved locally

1️⃣4️⃣ NON-FUNCTIONAL REQUIREMENTS

Clean UI

Mobile responsive

Fast loading

Stable demo

Simple UX