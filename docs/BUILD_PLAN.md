# Build Plan — execute in order

Solo build to a hard deadline (**Saturday 8:00 PM GST**). Do phases in order; commit after each; deploy early and often; keep the demo path green and the README filled as you go. Put the sleep block (for the human) after Phase 4.

## Scope triage — protect the win if time runs short
**MUST-HAVE (the demo path + the scorecard):**
- Minimal onboarding (language + name/phone + role)
- Requester: SOS → type → geolocation + Plus Code → send → live status
- Alert persists to Supabase; realtime both directions
- Responder: receives alert (in-app realtime **and** WhatsApp/SMS) → "I'm coming" + ETA → status (en route → on scene → resolved)
- Map with both pins; locator always visible; persistent "Call 998"
- Arabic-first UI; huge tap targets; sunlight contrast
- Offline: app shell loads with no connection; SOS queues if offline
- Drill metrics captured + complete README

**SHOULD-HAVE:** Urdu toggle · voice note · coordinator dashboard (doubles as evidence view) · responder availability nuance.

**CUT IF TIGHT:** inbound SMS-to-create-alert (hard) · live responder GPS tracking (use static location + ETA) · elaborate animations · OTP auth (go frictionless).

## Phases (each lists its "done when")

### Phase 0 — Setup → *done when hello-world is live on Vercel*
Public repo; commit #1 = `README.md` (from `README.template.md`). Add MIT `LICENSE` and `.env.example`. `create-next-app` (TS, App Router, Tailwind). Supabase project (owner provides keys). Connect Vercel; deploy.

### Phase 1 — Foundation → *done when the shell renders RTL Arabic and reads Supabase*
Tailwind RTL + Tajawal; `dir="rtl"`, lang switching; i18n (ar default, en, ur stub). shadcn/ui; apply design tokens. Supabase client; run schema; enable Realtime + RLS. App shell, role nav, persistent "Call 998".

### Phase 2 — SOS hero flow → *done when one real alert lands in Supabase end to end*
SOS button (pulsing) → on tap start high-accuracy geolocation in background → type select → Plus Code via `open-location-code` → Locator Card (code + accuracy + mini-map) → Send → insert `alert`. Manual map-pin fallback on GPS failure.

### Phase 3 — Responder side + realtime → *done when two phones complete the loop live*
Responder registration + availability; alert list (nearest first via `nearest_responders`); "I'm coming" + ETA; status machine searching→accepted→en_route→on_scene→resolved; Supabase Realtime both directions; Leaflet map with requester + responder pins + locator.

### Phase 4 — Fallback + ranking + offline → *done when an alert SMSs the nearest responder and the app opens offline*
Edge Function on `alert` insert → Twilio WhatsApp/SMS to nearest responders with locator + deep link. Confirm nearest-N ranking. PWA: service-worker shell cache + IndexedDB SOS queue + sync + "sending via SMS / will send when back online" state.

### — SLEEP (human, 4–6h) — protect cognition; tired QA misses demo-path bugs.

### Phase 5 — Polish & accessibility → *done when flawless on a cheap Android in sunlight*
Full Arabic copy pass (exact strings in `docs/PRODUCT_AND_UX.md`); contrast + tap-target audit; every loading/empty/error/no-signal state present; voice note if time; reduced motion respected.

### Phase 6 — Evidence → *done when /evidence has real numbers*
Build the metric-capture + coordinator dashboard. Owner runs the human drill (4–6 people). Log medians + raw data to `/evidence`; record the SMS/offline demo; drop in the cited EMS baseline (`docs/EVIDENCE.md`).

### Phase 7 — README + demo video + freeze → *done when submitted*
Fill every README criterion section; seed realistic Arabic demo data; record a 2–3 min Arabic-first walkthrough of the demo path; link at top. Final deploy. **Freeze commits before 8:00 PM GST.**

## Definition of done (check before declaring complete)
- [ ] Demo path flawless on a phone, in Arabic
- [ ] Deployed; live URL + demo video at the top of the README
- [ ] A judge can trigger a test alert from the live URL
- [ ] WhatsApp/SMS fallback demonstrated (in `/evidence`)
- [ ] Offline: app opens, SOS queues
- [ ] Drill numbers + cited baseline in `/evidence` and README
- [ ] **Every** judging criterion (1–7) documented in the README
- [ ] Realistic Arabic seed data; LICENSE + `.env.example` present; no secrets committed
- [ ] Commits frozen before the deadline
