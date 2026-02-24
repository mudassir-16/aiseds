PHASE 1 — SURVIVAL CORE (Must be done before 4 PM)

If this works → You won’t get eliminated.

🥇 Priority 1: Backend Setup (FastAPI Skeleton)

Why first?
Because everything depends on backend.

Do:

Create FastAPI project

Create /analyze-image endpoint

Test server runs

Time target: 45–60 minutes

🥈 Priority 2: OCR Working (EasyOCR)

Before AI.
Before UI polish.

Goal:
Upload image → Extract text → Return text.

If OCR works, you are already ahead of many teams.

Time target: 1–2 hours

🥉 Priority 3: Groq Integration

Now connect:

Extracted text → Send to Groq → Get JSON → Return result

At this stage your system does:

Image → OCR → AI → Scam probability

This is your elimination survival point.

Must complete before 4 PM.

PHASE 2 — DIFFERENTIATION (After Survival)
🟡 Priority 4: Risk Assessment (Rule-Based First)

Build:

10-question form

Score calculator (no AI yet)

Now your app does:
Detection + Risk scoring

That already differentiates you.

🟡 Priority 5: Groq for Risk Prediction

Send summary + score to Groq.

Get:

Risk level

Predicted scam type

Recommendations

Now your project becomes advanced.

🔥 PHASE 3 — STRUCTURE & POLISH
🟢 Priority 6: Supabase Authentication

Add:

Login

Protected routes

Save reports

Why later?
Auth is not required to survive elimination.
Core AI is.

🟢 Priority 7: Save Reports to Supabase

Store:

Scan reports

Risk reports

Now it looks production-level.

🔥 PHASE 4 — DEMO STABILITY
🟣 Priority 8: Fallback Logic

Add:

Heuristic backup if Groq fails

Preloaded demo screenshots

This prevents demo disaster.

🟣 Priority 9: UI Polish

Add:

Loading spinners

Clean layout

Highlight tactics

Do NOT over-design.

FINAL PRIORITY ORDER SUMMARY

1️⃣ FastAPI base
2️⃣ OCR working
3️⃣ Groq scam detection
4️⃣ Risk scoring (rule-based)
5️⃣ Groq risk prediction
6️⃣ Authentication (Supabase)
7️⃣ Save reports
8️⃣ Fallback safety
9️⃣ UI polish