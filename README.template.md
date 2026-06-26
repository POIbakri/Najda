<!--
This is the submission. Round 1 is scored entirely from this file + the repo.
Fill EVERY section — an empty section scores in the lowest band.
Each heading notes the criterion it scores. Keep the live URL and demo video at the very top.
Rename to README.md.
-->

# Najda (نجدة) — First-Minutes Community Response for Al Qua'a

> An Arabic-first web app that shares a precise, address-free location and alerts the nearest community responder in seconds — for a dispersed rural area where formal help is far away. It complements emergency services; it does not replace them.

**Live demo:** <vercel URL>  ·  **Demo video (≤3 min):** <link>  ·  **Challenge:** 2 — Reaching people quickly across a dispersed community

---

## 1. The problem & who it's for  → Impact (1) + Relevance (2)
- **Specific problem within Challenge 2:** <the first-minutes gap; distance + dispersion + no street addresses slow response>.
- **Who it's for:** <a resident needing urgent help, and the neighbours/volunteers trying to reach them in time — e.g. a camel-farm worker in Al Qua'a>.
- **Why it's pressing (with the baseline):** urban UAE ambulance response ≈ 7.5–8.5 min, but remote villages report 30–60 min <cite Dubai Media Office 2023; The National 2021>. The national EMS provider names precise location and language barriers as its top obstacles.

## 2. The solution & its impact  → Impact (1) + Relevance (2)
- **What it does:** <the end-to-end flow in 3–4 sentences>.
- **Testable impact claims:** <e.g. alert to nearest responder in <X s; address-free location accurate to <Y m>.
- **Built for Al Qua'a specifically:** <address-free locator, community-responder model, offline/SMS, Arabic + Urdu>.

## 3. Feasibility & deployment  → Feasibility (3)
- **Runs in a rural setting:** cheap Android, low bandwidth, offline + SMS fallback, no app store needed.
- **No government integration required** — a community layer that complements 998.
- **Cost to run:** <hosting + SMS; argue low>. **Maintained by:** <who keeps the responder list + facility data current>.
- **Constraints we acknowledge:** <honest list>.

## 4. Readiness — what's built  → Readiness (4)
- **Status:** complete, working, demonstrated end to end.
- **Works now:** <SOS, location + locator, responder ranking, realtime alert, acknowledge/ETA, status flow, SMS fallback, offline shell>.
- **Stubbed/mocked:** <be precise>.
- **Try it:** <live URL> — to trigger a test alert: <steps>.

## 5. Scalability  → Scalability (5)
- **Replicate:** same engine for any dispersed community; swap responder pool + facility data.
- **Growth path:** <more responder types, more regions, later integration with formal dispatch>.

## 6. Evidence & testable claims  → Falsifiability (6)
- **Drill (N = ?):** median alert-delivery <X s>, median acknowledgment <Y s>, GPS accuracy <Z m>. Raw log: `/evidence/drill.md`.
- **SMS/offline fallback:** demonstrated — `/evidence/sms-demo.mp4`.
- **Baseline:** urban 7.5–8.5 min vs remote villages 30–60 min <cited>; Najda compresses the first-minutes window.
- **What we did NOT validate:** <not tested in a real emergency; depends on responder adoption; rural figures are comparable UAE areas, not Al Qua'a specifically>.

## 7. How to run & verify  → Docs & completeness (7)
- **Live:** <URL>. **Run locally:** <commands>. **Env:** see `.env.example`.
- **Stack:** <list>. **Repo map:** <where the engine, locator, fallback, and evidence live>.

## 8. Demo  → Presentation (8, Sunday)
- **Video:** <link>. **Live script:** <the one scenario you run on stage; let a judge trigger a test alert>.

---
**License:** MIT. Built for the Tatweer Hackathon 2026 — Al Qua'a.
