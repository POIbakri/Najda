# Field drill — protocol & results

> **Status: pending (human-run).** The tooling is built — the coordinator
> dashboard at `/dashboard` computes the medians below **live** from the
> notification ledger, and every alert records GPS accuracy and timestamps.
> The numbers here are filled in **after** the drill runs. We do not fabricate
> them.

## Protocol (from `docs/EVIDENCE.md`)
1. Register **4–6 people** as responders at known coordinates (anywhere — a city
   is fine; the model is location-agnostic). Toggle them **available** in `/respond`.
2. Trigger several alerts from different points (each gives GPS "±N m" live).
3. The dashboard computes, live:
   - **SOS → alert delivery** (alert created → first responder notified)
   - **alert → acknowledgment** (created → responder taps "I'm coming")
   - **GPS accuracy** (median ±m across alerts)
   - **SMS/WhatsApp** notification confirmations
4. Record medians **and** raw rows below.

## Results (fill after the drill)

| Run | From (Plus Code) | GPS ±m | SOS→delivery | alert→ack | Responder | Channel | Outcome |
|----:|---|---:|---:|---:|---|---|---|
| 1 | _ | _ | _ | _ | _ | _ | _ |
| 2 | _ | _ | _ | _ | _ | _ | _ |
| 3 | _ | _ | _ | _ | _ | _ | _ |
| 4 | _ | _ | _ | _ | _ | _ | _ |
| 5 | _ | _ | _ | _ | _ | _ | _ |

**Medians:** SOS→delivery `__ s` · alert→ack `__ s` · GPS accuracy `__ m` ·
SMS/WhatsApp delivered `__ / __`.

## SMS / offline fallback demo
Record a short clip of: (a) raising an alert with the device in airplane/no-data
mode → the app shows **"Sent via SMS"** and queues offline, and (b) a responder
receiving the WhatsApp/SMS with the locator + deep link. Save as
`evidence/sms-demo.mp4` and link it from the README. *(Pending — needs a device
+ Twilio sandbox number.)*

## What we did NOT validate (stating limits raises this score — they are falsifiable)
- **Not tested in a real emergency.** All timings are drills, not live incidents.
- **Depends on community responder adoption** — the model assumes opted-in
  neighbours are available; we have not measured real-world availability in Al Qua'a.
- **Remote-village baseline is from comparable UAE areas, not Al Qua'a specifically.**
- **SMS/WhatsApp delivery time** depends on the carrier and Twilio; the in-repo
  numbers (`locator-accuracy.md`, `dispatch-latency.md`) are in-app compute only.
- **No claim of lives saved** — we claim measured *performance* (location accuracy,
  routing speed, delivery), not health outcomes.
