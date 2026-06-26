# Architecture

## Stack
Next.js 14 (App Router, TypeScript) PWA · Tailwind (RTL) · shadcn/ui · Supabase (Postgres + Realtime + RLS) · Leaflet + OpenStreetMap (free) · `open-location-code` Plus Codes (no key) · Twilio SMS/WhatsApp (sandbox) · Vercel.

**Fallback-first rationale:** iOS PWA web-push is unreliable, and the target area has patchy data. WhatsApp/SMS reaches any responder on any phone — so the responder alert path leads with Twilio, not web-push. This is also the rural thesis, so it's a headline feature, not a bolt-on.

**Auth:** frictionless for requesters — store name + phone on first launch in a `profiles` row; **no OTP wall in front of calling for help**. OTP for responders is the production path: note it in the README, skip it for the build to save time. Use the Supabase anon key client-side with the RLS policies below; use a server context (Edge Function / API route with service role) for the Twilio dispatch.

## Supabase schema (apply this)
```sql
create extension if not exists "uuid-ossp";
create extension if not exists cube;
create extension if not exists earthdistance;

create type alert_type as enum ('medical','accident','fire','person','other');
create type alert_status as enum ('searching','accepted','en_route','on_scene','resolved','cancelled');
create type alert_outcome as enum ('helped','handed_to_ems','false_alarm');

create table profiles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  language text not null default 'ar',
  is_responder boolean not null default false,
  is_available boolean not null default false,
  home_lat double precision,
  home_lng double precision,
  skills text,
  created_at timestamptz not null default now()
);

create table alerts (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid references profiles(id),
  type alert_type not null,
  status alert_status not null default 'searching',
  lat double precision not null,
  lng double precision not null,
  plus_code text,
  voice_note_url text,
  accepted_by uuid references profiles(id),
  accepted_at timestamptz,
  resolved_at timestamptz,
  outcome alert_outcome,
  created_at timestamptz not null default now()
);

-- notification + metrics ledger (this table produces the drill numbers)
create table alert_responders (
  id uuid primary key default uuid_generate_v4(),
  alert_id uuid not null references alerts(id) on delete cascade,
  responder_id uuid not null references profiles(id),
  notified_at timestamptz not null default now(),
  responded_at timestamptz,
  eta_minutes int,
  status text not null default 'notified'
);

-- nearest available responders (Haversine via earthdistance)
create or replace function nearest_responders(a_lat double precision, a_lng double precision, max_n int default 5)
returns setof profiles language sql stable as $$
  select * from profiles
  where is_responder and is_available
    and home_lat is not null and home_lng is not null
  order by earth_distance(ll_to_earth(a_lat, a_lng), ll_to_earth(home_lat, home_lng))
  limit max_n;
$$;

alter publication supabase_realtime add table alerts, alert_responders;
```

**RLS (hackathon-grade — tighten for production, note this in README):**
```sql
alter table profiles enable row level security;
alter table alerts enable row level security;
alter table alert_responders enable row level security;

-- permissive demo policies: anyone may register, raise an alert, and read alerts/responders
create policy p_profiles_all on profiles for all using (true) with check (true);
create policy p_alerts_all on alerts for all using (true) with check (true);
create policy p_alert_responders_all on alert_responders for all using (true) with check (true);
```

## The hard parts, solved
1. **Geolocation** — call `getCurrentPosition({ enableHighAccuracy:true })` the instant SOS is tapped (don't wait for type select). Show accuracy in metres. If it fails or is too coarse, drop to a **manual map-pin** fallback.
2. **Locator** — `open-location-code` to convert lat/lng → a short human-readable Plus Code (e.g. `7HVC+XX`). This is the "no street addresses" answer; surface it everywhere prominently.
3. **Nearest-responder ranking** — call the `nearest_responders` RPC on alert creation; notify the nearest 5 available.
4. **Realtime** — Supabase subscriptions: requester subscribes to its `alert` row (responder status); responders subscribe to new `alerts`.
5. **WhatsApp/SMS fallback** — a Supabase **Edge Function** (or Next.js API route) triggered on `alert` insert sends Twilio WhatsApp/SMS to the nearest responders with the locator + a deep link. Demonstrate that the app also sends the location via SMS if its own data connection drops.
6. **Offline (PWA)** — service worker (next-pwa/Workbox) caches the app shell so it loads with no connection; queue an offline SOS in IndexedDB and send on reconnect; show a clear "sending via SMS / will send when back online" state.

## Suggested folder structure
```
/app                 # App Router routes: /, /sos, /status/[id], /respond, /dashboard, /onboarding
/components          # UI components (SOSButton, LocatorCard, AlertMap, ResponderCard, ...)
/lib                 # supabase client, plus-code util, distance util, twilio (server), i18n dict
/lib/i18n            # ar / en / ur dictionaries
/public              # manifest.json, icons, service worker assets
/supabase            # schema.sql, edge functions
/evidence            # drill logs, SMS/offline demo recording, baseline sources
/docs                # these docs
```

## Environment (`.env.example`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=
```
Never commit `.env`. The project owner supplies these values.
