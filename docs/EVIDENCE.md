# Evidence Plan (criterion 6 — our highest-leverage, least-contested point)

Most teams write hype here and score 0–2. We measure real performance and stay honest, and score top band.

## What to build to capture evidence
- The `alert_responders` table already timestamps `notified_at` and `responded_at`, and stores `eta_minutes` — this is the metrics ledger.
- Build a **coordinator dashboard** (also a should-have UX screen) that computes and displays, live: median **SOS→alert-delivery** time, median **alert→acknowledgment** time, GPS **accuracy** (metres), and SMS-fallback delivery confirmations.
- Log each drill run's raw rows + computed medians to `/evidence/drill.md`. Save the SMS/offline demo recording to `/evidence/`.

## The drill protocol (human-run; agent prepares the tooling)
1. Register **4–6 people** as responders at known coordinates (anywhere — scattered across a city is fine).
2. Trigger several alerts from different points.
3. Measure and record: SOS→delivery, alert→acknowledgment, GPS accuracy in metres, and that the SMS/offline fallback delivered the location.
4. Report **medians + raw data** in `/evidence/drill.md`.

## The cited baseline (use in README sections 1, 2, 6)
- Urban UAE ambulance response ≈ **7.5–8.5 minutes** (Dubai Corporation for Ambulance Services reported a record 7.5-min average in 2023; National Ambulance brought the Northern Emirates average to ~8.5 min, down from ~18 min in 2014).
- Remote UAE villages report **30–60 minutes** (residents of Ghalilah, ~30 km from Ras Al Khaimah city, reported up to 60 min; Wadi Kub, ~40 km out, 30–40 min). — *The National, 2021.*
- The national EMS provider names its top obstacles as **precise location, changing street names, and language barriers** — exactly what Najda's address-free locator + multilingual UI address.

**Sources to cite in the README** (link them): Dubai Media Office (2023 DCAS figures); Khaleej Times / The National (National Ambulance Northern Emirates response times, 2019 & 2021). **Avoid** "20–35 min Abu Dhabi" numbers from private ambulance companies — those are adverts, not the public 998 service, and won't hold up.

## What to write in the README (evidence section)
- 2–4 **specific, testable claims**, each with a link to its evidence. Examples:
  - "Delivers a precise location + human-readable locator accurate to within {X} m, verified against known coordinates."
  - "Median {Y}s from alert to nearest-responder acknowledgment across an {N}-person drill (log in /evidence/drill.md)."
  - "Delivers location via SMS with no data connection — demonstrated (/evidence/sms-demo.mp4)."
- The cited baseline framing: urban 7.5–8.5 min vs remote villages 30–60 min; Najda compresses the first-minutes window.
- A **"What we did NOT validate"** section (not tested in a real emergency; depends on community responder adoption; rural figures are from comparable UAE areas, not Al Qua'a specifically). Stating limits **raises** this score because it proves the claims are falsifiable.

## Honesty guardrails
The rural figures are from comparable remote UAE areas, not Al Qua'a — say so. Don't overclaim outcomes (lives saved); claim measured performance (times, accuracy, delivery). Specific + evidenced + honest = top band.
