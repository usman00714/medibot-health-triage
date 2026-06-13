# MediBot – AI Health Assessment Agent

MediBot is an AI agent that performs preliminary health triage for **humans, pets, and cattle**. A user describes symptoms, and MediBot returns possible causes, follow-up questions, a risk level (Low / Medium / High / Critical), a recommended next step, and—only when safe—general supportive care suggestions. It is built to support **UN Sustainable Development Goal 3: Good Health and Well-Being**.

> **Disclaimer:** MediBot provides informational assessments and is not a substitute for professional medical or veterinary advice.

## Live Demo
- **App:** << YOUR VERCEL URL >>
- **Repository:** << YOUR GITHUB URL >>

## Problem
Many people cannot easily judge whether symptoms—their own, their pets', or their livestock's—are serious enough to need professional care. This delays treatment in urgent cases and causes unnecessary visits in minor ones. Access to early guidance is especially limited in underserved and rural communities.

## Solution
An AI triage agent that accepts symptoms for three categories (human, pet, cattle), assesses risk, suggests follow-up questions, and recommends a next step, with safety guardrails built in.

## SDG Alignment — SDG 3: Good Health & Well-Being
MediBot expands access to preliminary health guidance, encourages timely professional care for high-risk cases, and extends the same triage approach to animal and livestock health, which directly affects rural livelihoods and food security.

## Vision 2030 / Vision 2035 Alignment
MediBot aligns with Vision 2030/2035 priorities in the digital transformation of healthcare and agriculture: it expands access to preliminary health guidance in underserved communities (preventive and primary care goals), supports livestock-sector productivity through early disease flagging in cattle (food security and rural economy goals), and demonstrates locally built AI capacity in line with national digital-economy objectives.

## Key Features
- **Three user roles/dashboards:** User (run assessments, view history, download report), Admin (system stats and analytics), Client (read-only case review for doctors, vets, and livestock experts).
- **AI assessment** across human, pet, and cattle categories.
- **Risk levels:** Low, Medium, High, Critical, with colored badges.
- **Safety guardrails:** medication guidance is limited to over-the-counter supportive care, is suppressed entirely for high-risk cases, and never suggests human medication for animals.
- **Assessment history** with unique assessment IDs (e.g. MB-2026-001) and printable reports.
- **Analytics** for assessment volume and category breakdown.

## Architecture
