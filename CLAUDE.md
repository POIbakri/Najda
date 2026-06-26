# CLAUDE.md — Project Operating Manual

> You (the agent) are building a complete, deployable product for a hackathon with a hard deadline. Read this file fully, then read everything in `/docs`, then execute `docs/BUILD_PLAN.md` phase by phase. Commit after every phase. Keep the demo path working and the README updated at all times.

## What we are building
**Najda (نجدة)** — a community first-response web app for **Al Qua'a**, a remote, dispersed, address-free rural community in Abu Dhabi. When someone needs urgent help, Najda captures a precise, human-readable location and alerts the **nearest community responder** (an opted-in neighbour) in seconds, with WhatsApp/SMS fallback for areas with no data.

**It complements formal emergency services (998); it does NOT replace them.** Never describe it as replacing ambulances or 999/998. It fills the *first-minutes gap* before formal help arrives. This framing is load-bearing for scoring — see `docs/JUDGING_AND_POINTS.md`.

This is our entry for **Challenge 2** of the Tatweer Hackathon. Full rules in `docs/HACKATHON_RULES.md`.

## The win condition (optimise for this, always)
Round 1 (making the top 10) is scored **entirely from this GitHub repo** against 7 criteria. There is no demo in Round 1 — the **README IS the submission**. A criterion with no evidence in the repo is scored in its **lowest band**. So:
1. Ship a **complete, working, deployed** product (not a prototype).
2. **Document every judging criterion** in the README as you build it.
3. Produce **real measured evidence** (the drill — `docs/EVIDENCE.md`). This is the single highest-scoring, least-contested point, and most teams skip it.

## The one demo path — never let this break
`SOS → pick emergency type → GPS + locator lock → nearest responder gets WhatsApp → responder taps "I'm coming" + ETA → requester watches them approach with the locator on screen → resolved`, plus a visible **SMS/offline fallback**. Build features in the order in `docs/BUILD_PLAN.md`; until the must-haves are done, do not build anything off this path.

## Tech stack (do not substitute without reason)
- **Next.js 14** (App Router, TypeScript) as a **PWA**
- **Tailwind CSS** configured for **RTL**, font **Tajawal**
- **shadcn/ui** for components
- **Supabase** — Postgres + Realtime + RLS (Auth optional, see architecture)
- **Leaflet + OpenStreetMap** for maps (free, no API key)
- **open-location-code** (Plus Codes) for the human-readable locator (MIT, no key)
- **Twilio** for WhatsApp/SMS fallback (sandbox is fine)
- **Vercel** for hosting

Stack details, schema, and the hard parts (geolocation, ranking, realtime, fallback, offline) are in `docs/ARCHITECTURE.md`. Design tokens, type, and copy in `docs/DESIGN_SYSTEM.md`. Screens and bilingual copy in `docs/PRODUCT_AND_UX.md`.

## Hard rules (hackathon — non-negotiable)
- **Deadline: Saturday 27 June, 8:00 PM GST. Only commits before this count.** Prioritise must-haves; a working core beats an unfinished ambitious build.
- This is a **public** repo and the project is **open-source** (add a LICENSE — MIT).
- AI and all tools are permitted with no restrictions — use them freely.
- Commit continuously with clear messages from the very first change. Deploy continuously.

## Coding rules (conventions)
- TypeScript strict. No `any` unless unavoidable and commented.
- **No secrets in code.** All keys via environment variables (see `.env.example`). Never commit `.env`.
- **Arabic-first.** `dir="rtl"`, `lang="ar"` by default; every user-facing string comes from the i18n dictionary (ar primary, en, ur stub). Use the exact copy in `docs/PRODUCT_AND_UX.md`.
- **Build every state.** Loading, empty, error, location-failed, no-signal/SMS-fallback, and success states are required — they are scored under Readiness and judged live. Do not ship a screen with only the happy path.
- **Accessibility as you go** (not a later pass): tap targets ≥ 56px, body ≥ 16px, WCAG AA contrast, visible focus, `prefers-reduced-motion` respected, never colour alone (icon + label + colour).
- Derive every colour and type value from the tokens in `docs/DESIGN_SYSTEM.md`. Do not invent ad-hoc colours.
- Keep the README current with each feature — it is the submission, not an afterthought.

## Do NOT
- Do not frame Najda as replacing formal EMS.
- Do not write unvalidated claims in the README. Every claim must be testable and backed by evidence in `/evidence`, or stated as a limitation. Honesty raises the falsifiability score.
- Do not scope-creep past the demo path before must-haves are complete.
- Do not leave any judging criterion undocumented (= lowest band).
- Do not commit secrets or `.env`.

## What a human (the project owner) must do — flag when you need these
You cannot do these; surface them clearly and continue with everything else:
- Create the Supabase project and provide `SUPABASE_URL` + anon key.
- Set up the Twilio sandbox and provide credentials + a sandbox number.
- Provide the Vercel deployment connection.
- Run the **human drill** (recruit 4–6 people at known locations). You build the metric-capture tooling and the dashboard; the owner runs the people part and pastes results into `/evidence`.

## Run / environment
- `npm install` then `npm run dev`. Required env vars are listed in `.env.example` (generate it): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`.
- Apply the schema in `docs/ARCHITECTURE.md` to Supabase; enable Realtime on `alerts` and `alert_responders`.

## Docs index
- `docs/HACKATHON_RULES.md` — official rules, timeline, GitHub submission, the 5 challenges, why we chose Challenge 2.
- `docs/JUDGING_AND_POINTS.md` — the point system and how each criterion is won in this repo. **This is the optimisation target.**
- `docs/PRODUCT_AND_UX.md` — product, scope guardrail, demo path, flows, every required state, screen-by-screen UI with bilingual copy.
- `docs/ARCHITECTURE.md` — stack, Supabase schema (SQL), the hard parts solved, folder structure, env.
- `docs/DESIGN_SYSTEM.md` — colour tokens, typography, spacing, motion, icons, copy voice, accessibility floor.
- `docs/BUILD_PLAN.md` — phased tasks with "done when" gates and the scope triage. **Execute this in order.**
- `docs/EVIDENCE.md` — the drill protocol, the cited EMS baseline, and exactly what to write in the README.
- `README.template.md` — the submission scaffold mapped 1:1 to the criteria. Fill it as you build; it becomes `README.md`.

## Kickoff
1. Read all of `/docs`.
2. Generate `.env.example`, add an MIT `LICENSE`, and copy `README.template.md` → `README.md`.
3. Execute `docs/BUILD_PLAN.md` from Phase 0. Commit after each phase. Deploy early and often. Keep the demo path green and the README filled.
