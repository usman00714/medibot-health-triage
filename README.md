# MediBot – AI Health Assessment Agent

MediBot is an AI agent that performs preliminary health triage for **humans, pets, and cattle**. A user describes symptoms, and MediBot returns possible causes, follow-up questions, a risk level (Low / Medium / High / Critical), a recommended next step, and—only when safe—general supportive care suggestions. It is built to support **UN Sustainable Development Goal 3: Good Health and Well-Being**.

> **Disclaimer:** MediBot provides informational assessments and is not a substitute for professional medical or veterinary advice.

---

## Live Demo

- **App:** <<https://medibot-health-triage.vercel.app/ >>
- **Repository:** <<https://github.com/usman00714/medibot-health-triage >>

---

## Problem

Many people cannot easily judge whether symptoms—their own, their pets', or their livestock's—are serious enough to need professional care. This delays treatment in urgent cases and causes unnecessary visits in minor ones. Access to early guidance is especially limited in underserved and rural communities.

---

## Solution

An AI triage agent that accepts symptoms for three categories (human, pet, cattle), assesses risk, suggests follow-up questions, and recommends a next step—with safety guardrails built in so it never oversteps into unsafe medical advice.

---

## SDG Alignment — SDG 3: Good Health & Well-Being

MediBot expands access to preliminary health guidance, encourages timely professional care for high-risk cases, and extends the same triage approach to animal and livestock health, which directly affects rural livelihoods and food security.

---

## Vision 2030 / Vision 2035 Alignment

MediBot aligns with Vision 2030/2035 priorities in the digital transformation of healthcare and agriculture: it expands access to preliminary health guidance in underserved communities (preventive and primary care goals), supports livestock-sector productivity through early disease flagging in cattle (food security and rural economy goals), and demonstrates locally built AI capacity in line with national digital-economy objectives.

---

## Key Features

- **Three user roles / dashboards:**
  - **User** — run assessments, view history, download a printable report.
  - **Admin** — system statistics and analytics (total users, total assessments, breakdown by category, activity over time).
  - **Client** — read-only case review for doctors, veterinarians, and livestock experts.
- **AI assessment** across human, pet, and cattle categories.
- **Risk levels:** Low, Medium, High, Critical — shown with colored badges.
- **Safety guardrails:** medication guidance is limited to over-the-counter supportive care, is suppressed entirely for high-risk cases, and never suggests human medication for animals.
- **Assessment history** with unique assessment IDs (e.g. `MB-2026-001`) and printable reports.
- **Analytics** for assessment volume and category breakdown.

---

## Architecture

```
User
  --> React frontend (TanStack Start, deployed on Vercel)
  --> Supabase Edge Function ("assess")
  --> Google Gemini API
  --> Structured JSON response (causes, risk, recommendation, care suggestions)
  --> Supabase database (assessments, profiles)
  --> Dashboards (User / Admin / Client)

Knowledge base (Kaggle dataset) --> informs symptom/condition reference data
```

---

## Tech Stack

| Layer            | Technology                          |
|------------------|-------------------------------------|
| Frontend         | React + TanStack Start              |
| Build / Scaffold | Lovable                             |
| Backend & Auth   | Supabase (Postgres, Auth, Edge Functions) |
| AI Model         | Google Gemini (`gemini-2.5-flash`)  |
| Deployment       | Vercel                              |
| Data Hosting     | Kaggle                              |

---

## Model Selection (LM Arena)

Candidate models were compared using **LM Arena** to evaluate response quality on sample triage prompts before integration. Based on this comparison, Google Gemini was selected for the production assessment flow.

---

## Data (Kaggle)

The symptom and condition reference dataset for humans, pets, and cattle is hosted on Kaggle:

- **Dataset:** << https://www.kaggle.com/datasets/usmank00714/medibot-health-knowledge-base >>

---

## Database Schema

**profiles**

| Column | Type | Notes                          |
|--------|------|--------------------------------|
| id     | uuid | references `auth.users`        |
| email  | text |                                |
| role   | text | `user` \| `admin` \| `client`  |

**assessments**

| Column          | Type        | Notes                          |
|-----------------|-------------|--------------------------------|
| id              | uuid        | primary key                    |
| assessment_code | text        | e.g. `MB-2026-001`             |
| user_id         | uuid        | references `profiles`          |
| category        | text        | `human` \| `pet` \| `cattle`   |
| symptoms        | text        | user-entered symptoms          |
| ai_response     | text        | full JSON returned by the model|
| risk_level      | text        | Low \| Medium \| High \| Critical |
| created_at      | timestamptz | defaults to now()              |

---

## Getting Started (Local)

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

> The Gemini API key is stored as a Supabase secret (`GEMINI_API_KEY`) used by the `assess` edge function — it is **not** stored in the repository.

---

## Roles / Demo Accounts

The app supports three roles stored in the `profiles` table: `user`, `admin`, and `client`. The role determines which dashboard a logged-in account sees. For a demo, create one account per role and set the `role` value in the `profiles` table.

---

## Future Scope

- Multi-turn conversation so users can answer the AI's follow-up questions for a refined assessment.
- Expanded, region-specific disease datasets for livestock.
- Multilingual support for wider accessibility.
- Integration with verified telemedicine and veterinary networks.

---

## Team

- Muhammad Usman Khan
- Muhammad Ahmed Khan Shirwani

---

## License

For academic use (UMT Assignment 3).
