# Najda (نجدة)

**First-minutes community response for Al Qua'a.**
By **Bakri Albreiki** — solo build for the Tatweer Hackathon, Challenge 2.

**Live:** https://najda.vercel.app · **Demo video:** _coming_ · **Challenge:** 2 — reaching people quickly across a dispersed community

Najda is an Arabic-first web app that shares a precise, address-free location and
alerts the nearest opted-in neighbour in seconds — for a place where there are no
street addresses and an ambulance is far away. It complements emergency services
(998); it does not try to replace them.

> **Judging this? Fire a test alert in ~10 seconds — no login, no install.**
> Open https://najda.vercel.app on your phone, tap the big red **نجدة** button,
> pick a type, and send. A nearby responder accepts and you watch them come to you
> on the map, through to resolved. (Solo? A clearly-labelled demo responder
> answers automatically so you see the whole arc; **EN** toggle is top-left.)

---

## 1 · Impact — a documented, pressing need
*Speaks to: Impact (criterion 1, the first tiebreak) + Relevance (criterion 2).*

This isn't a benefit I imagined — it's one the emergency service itself has named.
Urban UAE ambulance response runs about **7.5–8.5 minutes**, but remote villages
report **30–60 minutes** ([cited sources](./evidence/baseline.md)). And the
national EMS provider publicly names its biggest obstacles as **precise location**
and **language barriers** — the two things an address-free locator and an
Arabic/English/Urdu interface exist to fix. So the need is real, documented, and
life-safety critical: a pressing problem an authority has already put on record.

**Who it helps — and it's many.** The whole of a dispersed community like Al Qua'a
(a camel-farming area ~90 minutes from Abu Dhabi with no street addresses,
scattered farms, and patchy signal), and **especially the Urdu-speaking
farm-labour population**, whom the language barrier hits hardest. Concretely: a
worker who collapses in the heat, and the neighbour two farms over who could be
there in minutes but never hears about it.

**The mechanism that closes the gap.** Najda routes the alert to the *nearest
neighbour* with a precise, spoken-aloud locator, in the user's language, even with
no data. By a simple distance-÷-speed model a neighbour **0.6–3.1 km away is ~1–4
minutes to the scene versus 30–60 minutes** for formal EMS — I mark that as an
illustrative model, not a field measurement ([evidence](./evidence/drill.md)). It
complements emergency services (998); it does not try to replace them.

## 2 · Relevance — what it does, squarely on Challenge 2
*Speaks to: Relevance (criterion 2) + Impact (criterion 1).*

You tap SOS; the phone starts a high-accuracy GPS fix immediately. You pick the
type of emergency. Najda turns your coordinates into a short, human-readable
**Plus Code** — a locator you can read aloud to a 998 operator when there's no
address to give. The alert goes to the nearest available responders, both in the
app and over **WhatsApp** (with SMS as the fallback for no-data areas). A
responder taps "I'm coming" with an ETA, and you watch them approach on a live map
with your locator always on screen. It resolves with an outcome logged.

A few claims I can actually back up (numbers and method in [`/evidence`](./evidence)):

- **The address-free locator is accurate to a median of ~1.2 m** (max 1.63 m in
  the drill; 1.18 m median over 5,000 systematic points) against the true
  coordinates. This is the on-thesis number — the national EMS provider names
  *precise location* as its #1 obstacle ([locator-accuracy.md](./evidence/locator-accuracy.md)).
- **The routing picks the correct nearest available responder** — 6/6 in the
  self-test. In that test the nearest neighbour was **0.6–3.1 km away**, which by a
  simple distance ÷ speed model is **~1–4 minutes to be on scene versus 30–60
  minutes** for formal EMS to a remote village. That proximity gap — a neighbour
  vs a distant ambulance — is the real impact; I mark it clearly as an illustrative
  model, not a measured field result ([drill.md](./evidence/drill.md)).
- The software itself adds only **~1.3 s of overhead** (SOS→delivery, server-timed)
  — negligible against that baseline.
- The location goes out over **WhatsApp first, SMS as a no-data fallback** — the
  dispatch path is verified live against Twilio.

It's built for this place specifically: no addresses (so a spoken code replaces
them), neighbours instead of distant ambulances, offline + messaging for patchy
signal, Arabic first with English and Urdu for the farm-labour community, big tap
targets and high contrast for outdoor use on a cheap phone.

## 3 · Feasibility — runs in a real rural setting, cheaply
*Speaks to: Feasibility (criterion 3, the second tiebreak).*

It's a web app (PWA), so it runs on any cheap Android in the browser — no app
store. The shell loads offline, and the alert leads with WhatsApp/SMS, which
reaches any phone without a data connection. Crucially, it needs **no government
integration** — it's a community layer that sits alongside 998, and every screen
keeps a "Call 998" button with the locator visible so it can be read to an
operator.

Running it is cheap: free-tier hosting (Vercel) and database (Supabase), with the
only real cost being WhatsApp/SMS — and only as a fallback, since in-app realtime
is free. A village-scale deployment costs a few dollars a month. A local
coordinator keeps the responder list current using the dashboard — the same person
who runs the community WhatsApp group today.

Honest constraints: it depends on neighbours opting in, it hasn't been tested in a
real emergency, and the security model is hackathon-grade (see [below](#security--what-id-harden-for-production)).

## 4 · Readiness — deployed, working end to end, every state built
*Speaks to: Readiness (criterion 4).*

It's deployed and works end to end — and I built every state, not just the happy
path: onboarding, the SOS flow, a live requester status screen with the responder
approaching, the full responder side (availability, nearest-first list, "I'm
coming" + ETA, status machine through resolved + outcome), a coordinator dashboard
with live medians, and all the awkward states — location failed (drag a pin
instead), no data (an offline fallback channel), nobody answering yet (escalate to
998), cancelled. Offline, the app shell loads and an SOS queues in IndexedDB and
syncs on reconnect.

I'd rather be precise than impressive, so here's what's real versus wired:

| Capability | Status |
|---|---|
| The whole demo path (SOS → resolved) | Real — verified end to end in a headless browser (`npm run e2e`) |
| Address-free Plus Code locator | Real — accuracy measured |
| Nearest-responder ranking | Real (Haversine in the demo store / `earthdistance` RPC in Supabase) |
| Realtime, offline shell, offline-fallback state | Real |
| Cross-device backend (Supabase) | Live in production |
| WhatsApp/SMS sending (Twilio) | **Real** — a live alert was delivered to a responder's WhatsApp, Twilio status `read` ([evidence](./evidence/whatsapp-dispatch.md)); the sandbox needs each recipient to join once |
| Lone-judge "demo responder" | Simulated and clearly labelled ("مستجيب تجريبي") so one person sees the full arc |
| Voice note, OTP auth, inbound-SMS | Cut for scope (said so honestly) |

With no keys at all, Najda runs in a self-contained demo mode so the live URL just
works. With the Supabase + Twilio keys set (they are, in production), it uses the
real backend — same code, same screens.

## 5 · Scalability — replicate to any dispersed community
*Speaks to: Scalability (criterion 5).*

Nothing in the engine is specific to Al Qua'a. To serve another dispersed
community you swap two things: the responder pool and the local facility data. It
holds up technically — ranking the nearest responder among a thousand candidates
takes about **0.26 ms** ([evidence](./evidence/dispatch-latency.md)) — and the
stack is serverless plus managed Postgres, so growth is a data problem, not an
engineering one. The path forward is more responder types (nurses, drivers, with
skills already in the schema), more regions, and eventually opt-in integration with
formal dispatch so a 998 operator sees the same locator.

## 6 · Falsifiability & evidence — reproducible, with honest caveats
*Speaks to: Falsifiability (criterion 6) — the part most teams skip.*

I measured what I could and I'm explicit about what I didn't. Everything below is
reproducible from the repo — a judge can re-run `npm run drill` and get their own
numbers, which is the whole point.

- **Location accuracy (the on-thesis metric):** median **~1.2 m** (1.17 m across
  the 6 drill points; 1.18 m median / 1.79 m p95 over 5,000 systematic points)
  against true coordinates. `npm run drill` / `node scripts/measure-locator.mjs`.
- **Routing correctness:** the system picked the **correct nearest available
  responder in 6/6** self-test cases (RPC vs an independent Haversine ground truth).
- **Impact = proximity, not latency:** in the self-test the nearest neighbour was
  **0.6–3.1 km away → ~1–4 min to scene** by a distance ÷ speed model, vs **30–60
  min** for EMS to a remote village. Clearly an **illustrative model, not a measured
  field result** — the field drill is what would prove it.
- **System overhead (not impact):** median **SOS→delivery 1.34 s** (server-to-server:
  both timestamps are DB `now()`) / **acknowledgment 1.45 s** (the controlled
  session's client clock, so it carries clock skew — not server-stamped). This is
  software overhead with a session acking on cue — *not* a human deciding to
  respond; I label it that way plainly.
- **Routing speed:** **0.26 ms** to rank the nearest 5 of 1,000 responders.
- **WhatsApp/SMS fallback (verified live):** the production dispatch route
  delivered a **real WhatsApp** alert — Arabic message, locator, and one-tap
  responder link — to a community responder's phone. Twilio reports delivery
  status **`read`** (not merely sent), `simulated:false`
  ([evidence + screenshot](./evidence/whatsapp-dispatch.md)). Sandbox delivery
  needs the recipient to join once; a WhatsApp Business sender removes that.
- **Baseline:** urban 7.5–8.5 min vs remote villages 30–60 min, cited with sources.

I use a tiered approach and state the exact conditions at each tier — and I'm plain
that this is a **controlled self-test, not independent human responders**. The
gold-standard 4–6-person field drill is still pending. Full detail, raw rows, the
proximity model, and a frank **"what I did not validate"** list are in
[`evidence/drill.md`](./evidence/drill.md).

## 7 · Docs & completeness — run & verify
*Speaks to: Documentation & completeness (criterion 7).*

```bash
npm install
npm run dev          # http://localhost:3000 — demo mode, no keys needed
npm run build && npm start
npm run typecheck    # strict TypeScript
npm run e2e          # headless-browser check of the full path (needs: npx playwright install chromium)
npm run drill        # reproduce the response-time numbers (needs Supabase env)
node scripts/measure-locator.mjs   # reproduce the accuracy number
```

No environment variables are needed to run the full demo. To use the real
backend, copy `.env.example` → `.env.local` and fill it in (guide in
[`supabase/README.md`](./supabase/README.md)); the app switches automatically.

**Stack:** Next.js 14 (App Router, TypeScript, PWA) · Tailwind (RTL) · Supabase
(Postgres + Realtime + RLS) · Leaflet + OpenStreetMap · `open-location-code` (Plus
Codes) · Twilio (WhatsApp/SMS) · Vercel.

**Where things live:**

| Path | What's there |
|---|---|
| `app/` | Routes: `/` (SOS hero), `/sos`, `/status/[id]`, `/respond`, `/respond/[id]`, `/dashboard`, `/onboarding`, `/api/dispatch` |
| `lib/store/` | The data layer — one interface, a demo store and a Supabase store |
| `lib/plus-code.ts`, `distance.ts`, `geolocation.ts` | Locator, ranking, GPS |
| `lib/twilio.ts`, `app/api/dispatch/route.ts` | WhatsApp/SMS dispatch (server) |
| `lib/offline-queue.ts`, `public/sw.js` | Offline SOS queue + service worker |
| `lib/i18n/` | Arabic / English / Urdu |
| `supabase/` | `setup.sql` (schema + seed) and a setup guide |
| `evidence/` | Measured + cited evidence, drill protocol |
| `scripts/` | The measurement and test scripts |

## 8 · Presentation & live demo
*Speaks to: Presentation (criterion 8) — for the live round.*

One scenario, in Arabic, on a phone: someone collapses in a date farm → SOS →
medical → the locator locks → the nearest neighbour gets a WhatsApp → "أنا قادم ·
٤ دقائق" → the requester watches them approach → resolved. Then I show the SMS
fallback in airplane mode and the dashboard medians, and I hand a judge a phone to
raise their own test alert. (Video link coming at the top of this README.)

**On stage I run the *real* two-phone flow** — one phone raises the alert, a second
phone (a real responder) accepts and moves — with the labelled demo-responder
autopilot only as a fallback if the room's network misbehaves, plus a backup video.

Two questions I expect, and my answers:
- *"Is the responder real or simulated?"* — Real. The two-phone flow is the live
  demo; the autopilot is a clearly-labelled convenience ("مستجيب تجريبي") so a lone
  judge sees the full arc, and it's off in any real deployment.
- *"How is this different from a what3words or a Google Maps pin?"* — A pin still
  needs a dispatcher and an ambulance 30–60 minutes away. Najda is the missing
  layer: it *routes the precise location to the nearest neighbour* (1–4 minutes
  away), in Arabic/Urdu, offline-tolerant. The address-free locator **and** the
  community-responder engine **together** — not just location sharing.

---

## Deploy
It deploys to Vercel with zero configuration (demo mode). To run the real backend:
apply [`supabase/setup.sql`](./supabase/setup.sql) in the Supabase SQL editor, set
the env vars from `.env.example` in Vercel, and deploy — the app detects the keys
and switches automatically.

## Security — what I'd harden for production
This is a hackathon build and I'm upfront about it. The row-level security is
permissive for the demo; production needs per-row policies. Requesters onboard
without OTP by design (no login wall in front of calling for help), but responders
should have OTP. The Twilio dispatch should move behind a service-role context, and
the labelled demo-responder autopilot (`NEXT_PUBLIC_DEMO_AUTOPILOT`) must be turned
off so only real neighbours ever respond.

---

Built by **Bakri Albreiki** for the Tatweer Hackathon, for Al Qua'a and its people.
MIT licensed. Najda complements emergency services (998); it does not replace them.
