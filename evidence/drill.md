# Drill & self-test — evidence

I use a **tiered** approach so the claims are real at whatever level I've run, and
I **state the exact conditions** every time. The honesty is the point: a judge can
re-run `npm run drill` and get their own numbers — that's what makes this
falsifiable rather than a marketing line.

| Tier | What | Status |
|---|---|---|
| **Best** | Field drill, 4–6 independent people at known coordinates → real human-response medians | _pending (human-run)_ |
| **Good enough** | Controlled self-test against the live backend, measuring accuracy, routing correctness, and system latency | ✅ **done — below** |
| **Floor** | Recorded WhatsApp/offline clip + measured location accuracy | accuracy ✅; clip _pending (needs a device)_ |

---

## ✅ Controlled self-test — `npm run drill`

**Exact conditions (so the claim is falsifiable):**
- **n = 6** alerts from **6 distinct GPS points** (full device precision) across the
  Al Qua'a area, run against the **live production backend** (Supabase +
  `najda.vercel.app/api/dispatch`), using the **same operations the app performs**.
- **This is a controlled self-test, not independent human responders.** The
  responders are the 5 seeded community profiles, and acknowledgment is performed
  by a controlled session **acting on cue** — so the timing numbers measure the
  *software*, not a neighbour deciding to respond.

### 1. Location accuracy — the on-thesis metric
The national EMS provider names *precise location* as its #1 obstacle, so this is
the number that matters most.

> **The address-free locator is accurate to a median of 1.17 m (max 1.63 m)**
> against the true coordinates, across the 6 drill points — consistent with the
> systematic result of **median 1.18 m, p95 1.79 m over 5,000 points**
> ([`locator-accuracy.md`](./locator-accuracy.md)).

### 2. Routing correctness
> **The system selected the correct nearest available responder in 6/6 cases.**
> The `earthdistance` RPC's top pick matched an independent Haversine ground-truth
> search every time. Nearest responder distances ranged 0.6–3.1 km.

### 3. System latency (this is *overhead*, not impact — see below)
> Median **SOS→delivery 1.34 s** and **SOS→acknowledgment 1.45 s**
> (server-timestamped). Read these as "the software adds ~1.3 s of overhead" —
> negligible against a 30–60 minute baseline. They do **not** measure how fast a
> human responds.

**Raw rows:**

| Run | Locator | Accuracy | Nearest responder | Dist | Ranking | SOS→delivery |
|----:|---|---:|---|---:|:--:|---:|
| 1 | `7HMQGFRX+C77` | 1.63 m | سالم المنصوري | 0.6 km | ✓ | 1.32 s |
| 2 | `7HMQGF6C+XQ6` | 1.22 m | فاطمة الكعبي | 1.7 km | ✓ | 1.33 s |
| 3 | `7HMQHG68+45Q` | 1.36 m | Imran Khan | 2.0 km | ✓ | 1.32 s |
| 4 | `7HMQFGX3+G62` | 1.11 m | Aisha Rahman | 1.8 km | ✓ | 1.64 s |
| 5 | `7HMQGFM6+F35` | 1.06 m | فاطمة الكعبي | 2.0 km | ✓ | 1.36 s |
| 6 | `7HMQHFGQ+32H` | 0.41 m | Imran Khan | 3.1 km | ✓ | 1.40 s |

## The actual impact claim — proximity geometry (illustrative model)
The latency numbers prove the pipeline is fast. The *impact* comes from **who** the
alert reaches, and that's a geometry argument, not a measured field result:

> In the self-test the nearest available responder was **0.6–3.1 km away**
> (median ~1.9 km). At a conservative rural driving speed of ~50 km/h, that is
> roughly **1–4 minutes** to be on scene — versus **30–60 minutes** for formal EMS
> to a remote UAE village ([baseline](./baseline.md)). This is an **illustrative
> proximity model (distance ÷ speed), not a measured field result** — it shows the
> structural advantage of dispatching a neighbour instead of waiting for a distant
> ambulance. Proving it in the field is what the Tier-1 drill is for.

## WhatsApp / SMS fallback (live, verified)
During the self-test the live `/api/dispatch` route made **real Twilio API calls
over WhatsApp** (`simulated: false`, 4 messages accepted with message SIDs). The
sender leads with **WhatsApp** (faster, free for the user); SMS is the no-data
fallback. On the current Twilio **trial**, WhatsApp delivery requires the recipient
to have joined the sandbox once (`join <code>` to the sandbox number); a paid
WhatsApp Business sender removes that step.

**Floor clip (`evidence/sms-demo.mp4`, pending — needs a device):** film a phone in
airplane/no-data mode → raise an alert → app shows **"أُرسل عبر رسالة نصية / Sent
via SMS"** and queues offline → responder phone receives the WhatsApp with the
locator + deep link → reconnect → queued alert syncs.

## Best tier — field drill protocol (still recommended; pending)
1. Register **4–6 independent people** as responders at known coordinates; toggle **available** in `/respond`.
2. Trigger alerts from different points; the `/dashboard` computes medians live from the ledger.
3. Replace the self-test conditions above with the field conditions and real human-response medians.

## What I did NOT validate (this is what keeps the claims honest)
- **This is a controlled self-test, not independent human responders.** The timing
  isolates software latency; a field drill is needed for true human-response medians.
- **The proximity/impact figure is a model**, not a measured field result.
- **Acknowledgment timing excludes human reaction + travel time.**
- **Not tested in a real emergency.**
- **Depends on community responder adoption** — real availability in Al Qua'a is unmeasured.
- **WhatsApp delivery to a real handset** not yet filmed (trial sandbox opt-in).
- **Remote-village baseline** is from comparable UAE areas (RAK emirate), not Al Qua'a specifically.
- **No claim of lives saved** — only measured performance (accuracy, routing correctness, software latency, live dispatch).
