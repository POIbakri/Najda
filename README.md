# Najda (نجدة) — First-Minutes Community Response for Al Qua'a

> An Arabic-first web app that shares a precise, **address-free** location and
> alerts the **nearest community responder** in seconds — for a dispersed rural
> area where formal help is far away. It **complements** emergency services
> (998); it does **not** replace them.

**Live demo:** **https://najda.vercel.app**  ·  **Demo video (≤3 min):** _pending_  ·  **Challenge:** 2 — Reaching people quickly across a dispersed community

> **Judges — try it in 20 seconds:** open the live URL → tap the big **نجدة**
> button → pick an emergency type → watch the location code lock in → tap **أرسل
> النجدة (Send alert)** → a nearby responder accepts and you watch them approach
> on the map. No login, no install. (Switch to English with the **EN** toggle, top-left.)

---

## 1. The problem & who it's for  → Impact (1) + Relevance (2)

- **The specific gap within Challenge 2 — the *first minutes*.** In Al Qua'a —
  a dispersed, camel-farming desert community ~90 minutes from Abu Dhabi — there
  are **no street addresses**, settlements are scattered, and connectivity is
  patchy. When someone is hurt, the two hardest problems are *saying where you
  are* and *getting any trained hands on the scene* before an ambulance can
  travel the distance.
- **Who it's for.** A camel-farm worker who collapses in the heat; the neighbour
  two farms over who could be there in four minutes; the family member who can't
  describe the location to a 998 operator. Requesters get **zero-friction** help
  (no login wall). Responders are **opted-in neighbours** with an availability toggle.
- **Why it's pressing (with the baseline).** Urban UAE ambulance response is
  **~7.5–8.5 min**, but remote villages report **30–60 min**
  ([`evidence/baseline.md`](./evidence/baseline.md), cited). The national EMS
  provider itself names **precise location** and **language barriers** as its top
  obstacles — exactly what Najda attacks.

## 2. The solution & its impact  → Impact (1) + Relevance (2)

- **What it does (end to end).** Tap SOS → the phone starts a high-accuracy GPS
  fix immediately → pick an emergency type → Najda turns the coordinates into a
  short, human-readable **Plus Code** locator → the alert is dispatched to the
  **nearest available responders** in-app *and* via **WhatsApp/SMS** → a responder
  taps **"I'm coming" + ETA** → the requester watches them approach on a live map
  with the locator always on screen → resolved, with an outcome logged.
- **Testable impact claims (measured — see [`/evidence`](./evidence)):**
  - Address-free locator accurate to a **median 1.18 m** (max 2.1 m) vs true
    coordinates ([`locator-accuracy.md`](./evidence/locator-accuracy.md)).
  - Alert reaches the nearest responders in a **median 1.31 s** over a real
    network (n = 6 self-test on the live backend — [`drill.md`](./evidence/drill.md)).
  - Nearest responder among 1,000 selected in **0.26 ms**
    ([`dispatch-latency.md`](./evidence/dispatch-latency.md)).
  - Location delivered **with no data connection** via SMS fallback (states built and wired; live recording pending — see Evidence).
- **Built for Al Qua'a specifically.** Address-free locator (the desert has no
  streets), community-responder model (neighbours are closer than ambulances),
  offline + SMS (patchy data), Arabic-first with English + Urdu (Arabic residents
  + a farm-labour population), huge tap targets and sunlight-legible contrast.

## 3. Feasibility & deployment  → Feasibility (3)

- **Runs in a real rural setting.** It's a PWA — works on a cheap Android in a
  browser, **no app store**. Low bandwidth; the app shell loads **offline**; the
  alert path **leads with WhatsApp/SMS**, which reaches any phone with no data.
- **No government integration required.** Najda is a *community layer* that
  complements 998. Every screen keeps a **Call 998** button and shows the locator
  so it can be read to an operator. No procurement, no dispatch-system access.
- **Cost to run.** Hosting is free-tier (Vercel) / near-zero; Supabase free tier
  covers a community this size; the only marginal cost is **SMS** (~cents per
  message, and only as a fallback — in-app realtime is free). A village-scale
  deployment runs for a few dollars a month.
- **Maintained by.** A local coordinator keeps the responder list current (the
  `/dashboard` view) — the same person who today organises the community WhatsApp group.
- **Constraints we acknowledge** (full list in [`evidence/drill.md`](./evidence/drill.md)):
  depends on responder adoption; not tested in a real emergency; iOS web-push is
  unreliable (hence the SMS-first design); RLS + auth are hackathon-grade (see [Security](#security--production-hardening)).

## 4. Readiness — what's built  → Readiness (4)

**Status: complete and working end to end — a working, installable PWA.** Every
required state is built — not just the happy path.

**Works now (verified — see [Verify](#how-to-run--verify)):**
- Onboarding (language · role · location priming · name/phone), skippable
- SOS hero → emergency type → high-accuracy GPS → **Plus Code locator card** → send
- Live requester status with the **responder approaching on a map**, ETA, and the
  locator pinned; Call responder / Call 998 always present
- Responder side: availability toggle, **nearest-first** request list, "I'm
  coming" + ETA, full status machine (searching → accepted → en_route → on_scene →
  resolved + outcome)
- Realtime both directions (cross-tab/device); coordinator **dashboard** with live medians
- **All states:** loading · empty · error · **location-failed → manual map pin** ·
  **no-data → "Sent via SMS"** · searching-with-no-responder → "Call 998" escalation ·
  resolved · cancelled
- **Offline PWA:** app shell loads with no connection; SOS queues in IndexedDB and
  flushes on reconnect
- Arabic-first RTL, English, Urdu (stub); reduced-motion respected; ≥56px tap targets

**Real vs stubbed — we're precise:**
| Capability | Status |
|---|---|
| Full demo path (SOS → resolved) | **Real**, verified end-to-end in headless Chromium — `npm run e2e` ([`scripts/e2e-demo.mjs`](./scripts/e2e-demo.mjs)) |
| Address-free Plus Code locator | **Real**, accuracy measured |
| Nearest-responder ranking | **Real** (Haversine demo / `earthdistance` RPC) |
| Realtime, offline shell, SMS-fallback states | **Real** |
| Cross-device backend (Supabase) | **Wired**; activates when keys are set |
| WhatsApp/SMS sending (Twilio) | **Wired**; sends when keys are set, else simulates |
| Lone-judge "demo responder" auto-accept | **Simulated & labelled** ("مستجيب تجريبي") |
| Voice note, OTP auth, inbound-SMS-to-create | **Cut** for scope (documented) |

> **How it works with zero config:** with no environment variables, Najda runs a
> self-contained **demo mode** (local store + simulated realtime + a *labelled*
> demo responder + simulated SMS) so the live URL is fully demonstrable today.
> Add Supabase + Twilio keys and it **auto-upgrades** to a real multi-device
> backend with real WhatsApp/SMS — same code, same screens.

## 5. Scalability  → Scalability (5)

- **Replicate to any dispersed community** by swapping two things: the **responder
  pool** and local **facility data**. Nothing in the engine is Al-Qua'a-specific.
- **Why it scales technically:** routing is **0.26 ms @ 1,000** responders and
  3.5 ms @ 10,000 ([evidence](./evidence/dispatch-latency.md)); the stack is
  serverless (Vercel) + managed Postgres (Supabase) with realtime built in.
- **Growth path:** (1) more responder *types* (fire marshals, nurses, drivers
  with skills tags — already in the schema); (2) more *regions* (multi-community
  responder pools); (3) later, **opt-in integration with formal dispatch** so a
  998 operator can see the same locator. Each step is additive — the first-minutes
  core never changes.

## 6. Evidence & testable claims  → Falsifiability (6)

Specific, testable claims with the data behind them, and an explicit list of what
we have **not** validated. Full detail in [`/evidence`](./evidence).

- **Locator accuracy (automated, reproducible):** median **1.18 m**, p95 1.79 m,
  max 2.1 m over 5,000 points. Re-run: `node scripts/measure-locator.mjs`.
- **Routing speed (automated, reproducible):** **0.26 ms** to rank the nearest 5
  of 1,000 responders. Re-run: `node scripts/measure-dispatch.mjs`.
- **Controlled self-test (live backend, reproducible):** **n = 6** alerts from
  distinct GPS points across the Al Qua'a area, run against the live Supabase +
  `/api/dispatch`, server-timestamped — median **SOS→delivery 1.31 s**, median
  **alert→acknowledgment 1.42 s** (responders acting on cue; isolates software
  latency, excludes human reaction/travel). Re-run: `node scripts/drill-selftest.mjs`.
  Full conditions + raw rows: [`evidence/drill.md`](./evidence/drill.md).
- **SMS/offline fallback:** the app shows **"Sent via SMS"** and queues offline
  with no data connection; `/api/dispatch` makes **real Twilio calls** (verified
  live, `simulated:false`) carrying the locator + a deep link.
- **Baseline (cited):** urban **7.5–8.5 min** vs remote villages **30–60 min**
  ([sources](./evidence/baseline.md)); Najda compresses the first-minutes window.
- **Tiered evidence + field drill:** we state exact test conditions at every tier
  (best = 4–6-person field drill, pending; good-enough = the self-test above; floor
  = accuracy + SMS clip). The `/dashboard` computes the same medians live from the
  ledger. See [`evidence/drill.md`](./evidence/drill.md).
- **What we did NOT validate** (stated plainly because it makes the claims
  falsifiable): not tested in a real emergency; depends on responder adoption;
  remote-village figures are from comparable UAE areas, not Al Qua'a specifically;
  no claim of lives saved — only measured performance. See [`drill.md`](./evidence/drill.md).

## 7. How to run & verify  → Docs & completeness (7)

### How to run / verify
```bash
npm install
npm run dev          # http://localhost:3000 — runs in demo mode, no keys needed
# or a production build:
npm run build && npm start
npm run typecheck    # strict TypeScript, no errors
npm run e2e          # headless-Chromium check of the full demo path (needs: npx playwright install chromium)
node scripts/measure-locator.mjs    # reproduce the accuracy evidence
node scripts/measure-dispatch.mjs   # reproduce the routing-speed evidence
```
No environment variables are required to run the full demo. To enable the real
backend, copy `.env.example` → `.env.local` and fill it in (see
[`supabase/README.md`](./supabase/README.md)); the app switches automatically.

### Stack
Next.js 14 (App Router, TypeScript, PWA) · Tailwind (RTL) · Supabase (Postgres +
Realtime + RLS) · Leaflet + OpenStreetMap (no key) · `open-location-code` (Plus
Codes, no key) · Twilio (WhatsApp/SMS) · Vercel.

### Repo map
| Where | What |
|---|---|
| `app/` | Routes: `/` SOS hero, `/sos`, `/status/[id]`, `/respond`, `/respond/[id]`, `/dashboard`, `/onboarding`, `/api/dispatch` |
| `lib/store/` | Backend-agnostic data layer — `demo.ts` (local) + `supabase.ts`, one interface |
| `lib/plus-code.ts`, `lib/distance.ts`, `lib/geolocation.ts` | The locator, ranking, and GPS |
| `lib/twilio.ts`, `app/api/dispatch/route.ts` | WhatsApp/SMS fallback (server) |
| `lib/offline-queue.ts`, `public/sw.js` | Offline SOS queue + service worker |
| `lib/i18n/` | ar / en / ur dictionaries |
| `supabase/` | `setup.sql` (schema + seed), setup guide |
| `evidence/` | Measured + cited evidence, drill protocol |
| `scripts/` | Reproducible measurement scripts |
| `docs/` | Product, architecture, design system, judging, evidence plan |

## 8. Demo  → Presentation (8, Sunday)

- **Video:** _pending_ — a 2–3 min Arabic-first walkthrough of the one scenario below.
- **Live script:** one real scenario, in Arabic, on a phone — collapse in a date
  farm → SOS → medical → locator locks → nearest neighbour gets a WhatsApp → "أنا
  قادم · ٤ دقائق" → requester watches them approach → resolved. Then show the
  **SMS fallback** (airplane mode) and the **dashboard** medians. Let a judge
  raise a test alert from their own phone.

---

## Deploy
Najda deploys to **Vercel** with no configuration (demo mode). To go live with a
real cross-device backend + WhatsApp/SMS:
1. Run [`supabase/setup.sql`](./supabase/setup.sql) in the Supabase SQL editor.
2. Set env vars in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` (see `.env.example`).
3. Deploy. The app detects the keys and switches to the real backend automatically.

## Security & production hardening
This is a hackathon build; we are explicit about what to tighten for production:
- **RLS is permissive** (anyone may read/write) for the demo. Production needs
  per-row policies (a requester owns its alert; responders read only alerts
  dispatched to them).
- **Responder auth.** Onboarding is frictionless (no OTP) by design for
  requesters; production should add **OTP for responders**.
- **Twilio dispatch** should move behind a service-role server context / Edge
  Function. Secrets live only in environment variables (never committed).
- **Demo-responder autopilot** (`NEXT_PUBLIC_DEMO_AUTOPILOT`) is on so a lone
  judge sees the full arc on the live URL. It is clearly labelled "مستجيب تجريبي"
  in the UI and a real responder takes over from it. **Set it to `off` for a real
  community deployment** so only real neighbours ever respond.

## License
**MIT** — see [`LICENSE`](./LICENSE). Built for the Tatweer Hackathon 2026 — Al Qua'a.
Najda complements emergency services (998); it does not replace them.
