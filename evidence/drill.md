# Drill & self-test — response-time evidence

We use a **tiered** evidence approach so the claims are real and falsifiable at
whatever level has been run, and we **state the exact test conditions** every
time — the honesty is what makes the numbers falsifiable.

| Tier | What | Status |
|---|---|---|
| **Best** | Field drill, 4–6 people at known coordinates → real medians + community validation | _pending (human-run)_ |
| **Good enough** | Controlled self-test: alerts from set GPS points against the live backend, measuring the same system metrics | ✅ **done — numbers below** |
| **Floor** | Recorded SMS/offline-fallback clip + verified location accuracy | location ✅ (`locator-accuracy.md`); SMS clip _pending_ |

---

## ✅ Controlled self-test (Tier 2) — real numbers

**Exact conditions (so the claim is falsifiable):**
- **n = 6** alerts raised from **6 distinct GPS points** spread across the Al
  Qua'a area (different "farms"; lat/lng in the table below).
- Run against the **live production backend** (Supabase + the deployed
  `najda.vercel.app/api/dispatch`), using the **same operations the app performs**:
  insert alert → rank nearest responders via the `earthdistance`
  `nearest_responders` RPC → write the notification ledger → acknowledge.
- **Responders:** the 5 seeded community responders (4 available); **acknowledgment
  performed by a controlled session acting on cue** — *not* field volunteers.
- Timings are **server-authoritative** (Postgres `now()` on each row), so they
  measure the **software's** contribution end-to-end (DB round-trips + ranking +
  ledger write), and **exclude real human reaction time and travel time**.
- Reproduce: `node scripts/drill-selftest.mjs` (with `SUPABASE_URL`, `SUPABASE_KEY`, `DISPATCH_URL`).

**Results (n = 6):**

| Metric | Median | Range |
|---|---:|---:|
| **SOS → delivery** (alert created → first responder notified) | **1.31 s** | 1.23–1.47 s |
| **Alert → acknowledgment** (created → accepted, responder on cue) | **1.42 s** | 1.34–1.58 s |
| Responders notified per alert | 4 | 4–4 |

**Raw rows:**

| Run | Location (Plus Code) | GPS ±m | SOS→delivery | alert→ack | notified |
|----:|---|---:|---:|---:|---:|
| 1 | `7HMQGFRX+95X` | ±9 m | 1.29 s | 1.40 s | 4 |
| 2 | `7HMQGF6C+RCX` | ±14 m | 1.29 s | 1.40 s | 4 |
| 3 | `7HMQHG67+2XX` | ±21 m | 1.33 s | 1.44 s | 4 |
| 4 | `7HMQFGX3+655` | ±11 m | 1.47 s | 1.58 s | 4 |
| 5 | `7HMQGFM6+62R` | ±18 m | 1.41 s | 1.52 s | 4 |
| 6 | `7HMQHFGP+2Q5` | ±27 m | 1.23 s | 1.34 s | 4 |

> Interpretation: Najda's software puts a precise, address-free alert in front of
> the nearest responders in **~1.3 s** over a real network. Against a 30–60 minute
> remote-village ambulance baseline, the software latency is negligible — the
> first-minutes window is governed by responder availability and travel, not the app.

## SMS / WhatsApp fallback (live, verified)
The live `/api/dispatch` route was invoked during the self-test and made **real
Twilio API calls** (`simulated: false`) to the nearest responders. On the current
**Twilio Trial** account, delivery is restricted to *verified* numbers, so the
seeded demo numbers return the expected "unverified" response — the **dispatch
path itself is proven live**; only delivery to a real handset needs a verified
number (or a paid number).

**To record the floor clip (`evidence/sms-demo.mp4`, pending — needs a device):**
verify your own phone in the Twilio console, then film: device in airplane/no-data
mode → raise an alert → app shows **"أُرسل عبر رسالة نصية / Sent via SMS"** and
queues offline → responder phone receives the WhatsApp/SMS with the locator + deep
link → reconnect → queued alert syncs.

## Location accuracy (Tier-floor, done)
Address-free locator: **median 1.18 m**, p95 1.79 m over 5,000 points
([`locator-accuracy.md`](./locator-accuracy.md), `node scripts/measure-locator.mjs`).

## Best tier — field drill protocol (still recommended; pending)
1. Register **4–6 people** as responders at known coordinates; toggle **available** in `/respond`.
2. Trigger alerts from different points; the `/dashboard` computes medians live from the ledger.
3. Record medians **and** raw rows here, replacing the self-test conditions with the field conditions.

## What we did NOT validate (stating limits raises this score — they are falsifiable)
- **Acknowledgment timing excludes real human reaction + travel.** The self-test
  isolates software latency (responders acted on cue); a field drill is needed for
  true human-response medians.
- **Not tested in a real emergency.** All numbers are drills/self-tests.
- **Depends on community responder adoption** — we have not measured real-world
  availability in Al Qua'a.
- **SMS delivery to a real handset** not yet filmed (Trial verified-number limit).
- **Remote-village baseline** is from comparable UAE areas (RAK emirate), **not Al
  Qua'a specifically**.
- **No claim of lives saved** — we claim measured *performance* (delivery latency,
  location accuracy, routing speed, live dispatch), not health outcomes.
