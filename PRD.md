PRODUCT REQUIREMENTS DOCUMENT (PRD)
🏷️ Project Title
AI Social Engineering Defense System (SEDS)
AI-Powered Financial Fraud Prevention for Digital India
1️⃣ Executive Summary

India is witnessing a rapid increase in digital payment fraud, especially through WhatsApp-based scams, UPI refund fraud, OTP phishing, and fake KYC alerts.

Unlike traditional cyberattacks that exploit system vulnerabilities, modern financial fraud primarily exploits human psychology through emotional manipulation such as urgency, fear, authority impersonation, and reward bait.

Existing cybersecurity tools focus on malicious URLs or enterprise protection. There is no accessible AI-powered system that:

Analyzes screenshot-based financial scams

Detects social engineering tactics

Evaluates personal vulnerability to fraud

SEDS is designed to bridge this gap.

2️⃣ Problem Statement

Modern financial fraud no longer relies on hacking systems — it relies on manipulating human behavior.

Scammers use WhatsApp screenshots, SMS alerts, and fake banking messages to emotionally pressure users into sharing OTPs or approving fraudulent UPI transactions.

Current cybersecurity tools:

Do not analyze screenshot-based scams

Do not detect behavioral manipulation patterns

Do not assess individual cyber hygiene

This leaves everyday digital payment users vulnerable to emotionally driven financial fraud.

There is a need for an AI-driven system that detects screenshot-based scams and evaluates behavioral vulnerability to proactively prevent financial fraud.

3️⃣ Vision

To transform financial cybersecurity from reactive technical detection to proactive behavioral defense using AI-powered fraud intelligence.

4️⃣ Target Users

Digital payment users (UPI, wallets, online banking)

Students

Small business owners

Elderly citizens

Non-technical users

5️⃣ Core Features
🔎 Feature 1: WhatsApp Screenshot Scam Detection
Input:

User uploads suspicious screenshot (WhatsApp, SMS, UPI message).

Processing:

Tesseract OCR extracts text

Preprocessing improves text clarity

Extracted text sent to Groq LLM

AI analyzes:

Scam probability

Psychological manipulation tactics

Suspicious URLs

Financial fraud indicators

Output:

Scam Probability (%)

Tactics Detected

Explanation

Recommended Action

🧠 Feature 2: Psychological Manipulation Detection

System identifies:

Urgency pressure

Fear triggers

Authority impersonation

Reward bait

Scarcity tactics

This differentiates the system from basic phishing detectors.

📊 Feature 3: Cyber Risk Assessment Engine
10-question behavioral assessment

Evaluates:

Password reuse

2FA usage

OTP sharing behavior

Public WiFi usage

UPI verification habits

Scoring:

Unsafe behavior = +10
Score range: 0–100

Risk Levels:

0–30 → Low

31–60 → Medium

61–100 → High

🔮 Feature 4: Vulnerability Prediction

System predicts:

Most likely scam type user is vulnerable to

Provides 5 personalized prevention steps

🔐 Feature 5: Authentication (Supabase)

Email/password login

JWT session handling

Secure dashboard

Saved scan history

Saved risk reports

6️⃣ Technical Stack

Frontend:

Next.js (App Router)

Tailwind CSS

Backend:

FastAPI

OCR:

Tesseract

AI:

Groq API (Llama model)

Database & Auth:

Supabase

Deployment:

Frontend → Vercel

Backend → Railway/Render

Supabase → Cloud

7️⃣ System Architecture

User
↓
Login (Supabase)
↓
Upload Screenshot
↓
FastAPI
↓
Tesseract OCR
↓
Groq AI Analysis
↓
Return JSON Response
↓
Store in Supabase
↓
Display Results

Risk Assessment
↓
Rule-based scoring
↓
Groq vulnerability analysis
↓
Store + display

8️⃣ API Endpoints

POST /analyze-image
POST /risk-score
GET /reports

All routes protected by JWT.

9️⃣ Database Schema
scan_reports

id

user_id

extracted_text

scam_probability

tactics_detected

explanation

recommended_action

created_at

risk_reports

id

user_id

risk_score

risk_level

predicted_scam_type

recommendations

created_at

🔟 Demo Strategy

Primary:
Live screenshot upload → OCR → Groq → result

Backup:
Preloaded scam screenshots

Emergency fallback:
Keyword-based heuristic detection

System must never crash during demo.

1️⃣1️⃣ Non-Functional Requirements

Response time < 8 seconds

Clean UI

Error handling

Loading indicators

File size validation

Stable demo performance

1️⃣2️⃣ Scope Limitations

This system:

Does not monitor WhatsApp directly

Does not perform DNS-level URL scanning

Does not replace bank fraud detection systems

It analyzes uploaded screenshots and behavioral patterns.