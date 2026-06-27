# WhatsApp dispatch — verified live delivery

**Claim:** Najda's production dispatch route sends a real WhatsApp alert — Arabic
message, human-readable locator, and a one-tap responder deep link — to the
nearest community responder, and it actually reaches the phone.

**Type:** Live verification against production (`https://najda.vercel.app`) +
Twilio's own delivery API. Not a mockup, not a simulation.

## What was tested

A fresh `searching` alert was created in the production database, the nearest
available responder was linked in the notification ledger, and the live
`/api/dispatch` route was invoked exactly as the app invokes it on a real SOS.
The test alert was deleted afterwards so it doesn't pollute the dashboard; the
delivery record below is the durable proof.

## Result — delivered and read

| Field | Value |
|---|---|
| Dispatch route response | `{"ok":true,"simulated":false,"sent":1}` |
| Channel | WhatsApp |
| From | `whatsapp:+14155238886` (Twilio WhatsApp Sandbox) |
| To | a community responder's verified WhatsApp (number redacted) |
| Twilio message SID | `SMf2d849e4532ab9d78505eb071d75b25f` |
| **Delivery status** | **`read`** — delivered to the device and opened |
| Error code | none |
| Timestamp | 2026-06-27 11:29 UTC (15:29 GST) |

`simulated:false` confirms Twilio is configured in production (not stubbed), and
the Twilio API reporting `status: read` confirms the message was delivered to the
handset and opened — the strongest delivery signal Twilio exposes.

## The message that arrived

```
🚨 نجدة: حالة طبية على بُعد ~0 كم.
رمز الموقع: GFJR+C2
استجب: https://najda.vercel.app/respond/<alert-id>
الطوارئ: 998
```

(The `~0 كم` is a test artifact — the test placed responder and alert at the same
point; a real alert computes the true Haversine distance. The `استجب` link opens
the responder screen for that specific alert.)

A phone screenshot of the received message — including WhatsApp's rich link
preview card for `najda.vercel.app` — is at
[`whatsapp-dispatch.png`](./whatsapp-dispatch.png).

## Honest caveats

- This is the **Twilio WhatsApp Sandbox**. Each responder must send the sandbox
  join code once to opt in, and freeform messages only deliver within 24 h of the
  responder's last inbound message. A production WhatsApp Business sender removes
  both limits (and is a configuration change, not a code change).
- This verifies the **sending** path end to end (app → dispatch → Twilio →
  handset). It is not a measure of human response time — that is the pending field
  drill in [`drill.md`](./drill.md).
