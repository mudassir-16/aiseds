# SEDS (Scam & Exploitation Detection System) - Implemented Features

This document outlines the features currently implemented in the SEDS platform, ordered by their priority and core value to the system.

## 1. Core Engine: Scam Analysis & Detection (High Priority)
*   **Vision-Based Analysis:** Primary path utilizing Groq's vision model to analyze screenshots directly for scam indicators, extracting context along the way.
*   **Text-Based Fallback:** Secondary path utilizing OCR (Tesseract via EasyOCR) to extract text if image analysis fails, processing the text through Groq.
*   **Multi-Language Support (Indic Languages):** OCR and processing support for English, Hindi, Tamil, and Telugu. The system detects the language and translates non-English text to English before analysis.
*   **Heuristic Fallback:** Offline keyword-based analysis engine (detecting urgency, reward bait, authority impersonation, fear, social engineering, OTP requests, suspicious links) used if API calls fail.
*   **Scam Type Classification:** The engine explicitly categorizes the detected threat into a predefined taxonomy (e.g., *UPI Refund Scam*, *Fake KYC Suspension*, *OTP Theft Scam*, etc.) rather than just providing a probability.
*   **Psychological Tactic Detection:** Identification of specific manipulation tactics used in the analyzed message (Urgency, Fear, Authority impersonation, Reward bait, Scarcity).

## 2. Threat Intelligence & User Profiling (High Priority)
*   **Behavioral Cyber Risk Assessment:** A 10-question behavioral questionnaire evaluating a user's digital habits (password reuse, 2FA usage, clicking unknown links, public WiFi usage, etc.).
*   **Rule-Based Risk Scoring:** Calculates a deterministic risk score (0-100) and risk level (Low/Medium/High) based on the assessment answers.
*   **Behavioral Risk Correlation Engine (BRCE):** A pure logic-based engine that maps unsafe behavioral inputs to specific scam vulnerabilities.
    *   Generates a **Risk Multiplier** (e.g., "3x MORE VULNERABLE").
    *   Provides explicit **Intelligence Insights** (e.g., "Users exhibiting behaviors like password reuse, click unknown links are 3x more vulnerable to OTP Theft Scam.").
*   **Predictive Vulnerability Profiling:** AI-driven prediction (via Groq) of the specific scam type the user is most susceptible to, based on their risk score and unsafe behaviors.
*   **Personalized Prevention Plans:** Generates actionable, user-specific recommendations to improve cyber hygiene based on the assessment results.

## 3. Educational & Training Tools (Medium Priority)
*   **Scam Simulation Mode (SSM):** A standalone training module that generates realistic, fake scam messages based on a selected vector (e.g., *Job Offer Scam*).
    *   Highlights the specific manipulation tactics embedded in the fake message.
    *   Provides a psychological explanation of why the exploit works.
    *   Detailed Safe Response Guidelines for the simulated scenario.

## 4. Platform Infrastructure & User Experience (Medium Priority)
*   **Authentication System:** Secure user registration, login, and session management using Supabase Auth (JWT).
*   **Dashboard & History Tracking:**
    *   Displays recent scan history with quick-view indicators of scam probability.
    *   Visual "Risk Score" rings and widgets summarizing the user's latest assessment.
    *   Detailed "Scan Snapshot Modal" showing the exact extracted text, English translation (if applicable), scam type badge, and probability score.
*   **Premium Web Interface:**
    *   Built with Next.js, Framer Motion, and Tailwind CSS.
    *   Features a dark-mode, glassmorphism aesthetic with engaging micro-animations, gradient text, and dynamic feedback elements.
*   **Data Persistence (Supabase):** Securely stores scan reports and risk assessments linked to the authenticated user ID.
