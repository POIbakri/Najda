# Product & UX

## Product
**Najda (نجدة)** — "rescue/help", the word a person shouts when they need aid. A community first-response web app for Al Qua'a: capture a precise, **human-readable** location and alert the **nearest opted-in community responder** in seconds, with WhatsApp/SMS fallback for no-data areas.

## Scope guardrail (mandatory)
Najda is a **community first-response layer** that fills the **first-minutes gap before formal help arrives**. It **complements formal EMS (998); it never replaces it.** Every screen keeps a visible "Call 998" affordance, and the locator is always shown so a person can read it to a 998 operator. Do not build dispatch/ambulance-replacement features.

## The single demo path (protect above all)
`SOS → pick type → GPS + locator lock → nearest responder gets WhatsApp → responder taps "I'm coming" + ETA → requester watches them approach with locator on screen → resolved`, plus a visible **SMS/offline fallback**.

## User types
- **Requester** — anyone needing urgent help. Zero friction to call for help (no login wall in front of SOS).
- **Responder** — an opted-in community volunteer with an availability toggle.
- (Optional) **Coordinator** — a dashboard of active alerts + responders + live response-time stats. This screen also serves as the evidence view; build it if time allows.

Everyone can be both requester and responder.

## Flows
**Onboarding (first launch only):** language (AR default / EN / UR) → role choice ("I need help" / "I want to help my community", non-exclusive) → permission priming (explain *why* before the OS prompts location + notifications) → name + phone.

**Requester SOS (hero):** Home is the giant SOS button → tap **immediately** starts high-accuracy geolocation in the background → type select → **Locator Card** (code + accuracy + mini-map) → optional hold-to-record voice note → **Send alert** → Live status ("Finding a nearby responder" → "{name} is coming · ETA {n} min") with map + ever-present locator + Call responder / Call 998 → resolved.

**Responder:** availability toggle → incoming alert (push + WhatsApp/SMS: type, distance, locator, name) → **I'm coming** + ETA → Navigate (opens maps to the coordinates) → status en route → on scene → resolved + outcome (helped / handed to EMS / false alarm).

## Required states (all must exist — scored under Readiness)
acquiring location · location failed → **manual pin** fallback · no data → **SMS fallback** ("Sent via SMS") · searching, no responder yet → widen radius + prompt **Call 998** · accepted · en route · on scene · resolved · cancelled. Every screen has loading/empty/error states. Errors explain what to do, in the interface's voice, never apologetic.

## Screen-by-screen UI (bilingual copy)
*Arabic is primary (correct MSA, Gulf-appropriate); refine dialect as needed. Pull all strings from the i18n dictionary.*

**Home / SOS**
- Giant circular SOS button in `flare-600`, slow heartbeat pulse. Label: **نجدة — اطلب المساعدة** / "Get help".
- Persistent footer affordance: **اتصل بـ 998** / "Call 998".

**Type select** — title **ما نوع الحالة؟** / "What's the emergency?"
- حالة طبية / Medical · حادث / Accident · حريق / Fire · شخص في خطر / Person in danger · أخرى / Other. (Icon + label + colour each.)

**Locator Card (the signature element)** — **رمز موقعك** / "Your location code": `XXXX+XX` (large, tabular, spaced) · accuracy **±N م** / "±N m" · mini-map · primary button **أرسل النجدة** / "Send alert".

**Live status (requester)** — **جاري البحث عن مستجيب قريب…** / "Finding a nearby responder…" → **في الطريق إليك · الوصول خلال ٥ دقائق** / "On the way · arriving in 5 min". Buttons: **اتصل بالمستجيب** / "Call responder", **اتصل بـ 998** / "Call 998". Locator stays pinned. No-data banner: **أُرسل عبر رسالة نصية** / "Sent via SMS".

**Responder — incoming alert** — **حالة طبية · على بُعد ٣ كم** / "Medical · 3 km away" · requester name · locator · map · primary **أنا قادم** / "I'm coming". Then **وصلت إلى الموقع** / "On scene" → **تم** / "Resolved" + outcome.

**Responder — availability** — toggle **متاح للمساعدة** / "Available to help".

**Coordinator dashboard (optional, also the evidence view)** — active alerts on a map, responders online, live median response-time stats.

See `docs/DESIGN_SYSTEM.md` for tokens, type, motion, and the accessibility floor.
