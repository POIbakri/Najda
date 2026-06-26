# Supabase setup (optional — Najda runs without it)

Najda ships a self-contained **demo mode** (local store + simulated realtime +
simulated SMS) so the live URL works with **zero configuration**. Provide
Supabase + Twilio to switch to the production backend.

## 1. Create a project
Create a free Supabase project. Copy the **Project URL** and **anon public key**.

## 2. Apply the schema
In the Supabase SQL editor, run [`schema.sql`](./schema.sql). It creates the
tables, the `nearest_responders` ranking function, enables Realtime on `alerts`
and `alert_responders`, and sets permissive (hackathon-grade) RLS policies.

Optionally run [`seed.sql`](./seed.sql) for demo responders near Al Qua'a.

## 3. Set environment variables
In `.env.local` (and in Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

When both are set the app uses Supabase + Realtime instead of the demo store.

## 4. (Optional) Twilio WhatsApp/SMS fallback
Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM`. The dispatch
runs in the Next.js route handler `app/api/dispatch/route.ts` (no separate Edge
Function needed). With `TWILIO_FROM` set to a `whatsapp:+…` number it sends
WhatsApp; with a plain number it sends SMS. Unset → the route safely simulates.

## Production hardening (not done in the hackathon build — see README limitations)
- Replace permissive RLS with per-row policies (requester owns its alert;
  responders read only alerts dispatched to them).
- Move Twilio dispatch behind a service-role server context / Edge Function and
  add OTP for responder onboarding.
