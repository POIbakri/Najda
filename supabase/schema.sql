-- Najda schema — apply in the Supabase SQL editor.
-- This extends docs/ARCHITECTURE.md with the columns the app reads/writes
-- (accuracy, note, delivery channel, denormalised names + responder location,
-- ETA), so the Supabase path matches the demo store 1:1.
--
-- RLS is permissive (hackathon-grade); tighten for production (see README).

create extension if not exists "uuid-ossp";
create extension if not exists cube;
create extension if not exists earthdistance;

do $$ begin
  create type alert_type as enum ('medical','accident','fire','person','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type alert_status as enum ('searching','accepted','en_route','on_scene','resolved','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type alert_outcome as enum ('helped','handed_to_ems','false_alarm');
exception when duplicate_object then null; end $$;

create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text not null,
  language text not null default 'ar',
  is_responder boolean not null default false,
  is_available boolean not null default false,
  home_lat double precision check (home_lat is null or home_lat between -90 and 90),
  home_lng double precision check (home_lng is null or home_lng between -180 and 180),
  skills text,
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid references profiles(id) on delete set null,
  requester_name text,
  type alert_type not null,
  status alert_status not null default 'searching',
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  plus_code text,
  accuracy_m integer check (accuracy_m is null or accuracy_m >= 0),
  note text,
  delivery text not null default 'data' check (delivery in ('data','sms')),
  accepted_by uuid references profiles(id) on delete set null,
  accepted_by_name text,
  accepted_lat double precision,
  accepted_lng double precision,
  accepted_at timestamptz,
  eta_minutes integer check (eta_minutes is null or eta_minutes >= 0),
  resolved_at timestamptz,
  outcome alert_outcome,
  created_at timestamptz not null default now()
);

-- notification + metrics ledger (this table produces the drill numbers)
create table if not exists alert_responders (
  id uuid primary key default uuid_generate_v4(),
  alert_id uuid not null references alerts(id) on delete cascade,
  responder_id uuid not null references profiles(id) on delete cascade,
  responder_name text not null default '',
  distance_km double precision not null default 0 check (distance_km >= 0),
  channel text not null default 'app' check (channel in ('app','sms','whatsapp')),
  notified_at timestamptz not null default now(),
  responded_at timestamptz,
  eta_minutes integer check (eta_minutes is null or eta_minutes >= 0),
  status text not null default 'notified' check (status in ('notified','accepted','declined')),
  -- one ledger row per responder per alert (prevents duplicate-count inflation)
  unique (alert_id, responder_id)
);

-- nearest available responders (Haversine via earthdistance).
-- `set search_path = public, extensions` is REQUIRED: on Supabase the cube /
-- earthdistance functions live in the `extensions` schema, which the anon /
-- authenticated API roles don't have on their default path — without this the RPC
-- fails ("function ll_to_earth does not exist") when called via PostgREST.
-- `exclude_id` lets callers drop the requester so they're never self-dispatched.
create or replace function nearest_responders(
  a_lat double precision, a_lng double precision, max_n int default 5, exclude_id uuid default null
)
returns setof profiles language sql stable
set search_path = public, extensions as $$
  select * from profiles
  where is_responder and is_available
    and home_lat is not null and home_lng is not null
    and (exclude_id is null or id <> exclude_id)
  order by earth_distance(ll_to_earth(a_lat, a_lng), ll_to_earth(home_lat, home_lng))
  limit max_n;
$$;

-- realtime (idempotent — safe to re-run)
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'alerts') then
    alter publication supabase_realtime add table alerts;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'alert_responders') then
    alter publication supabase_realtime add table alert_responders;
  end if;
end $$;

-- RLS (hackathon-grade — tighten for production)
alter table profiles enable row level security;
alter table alerts enable row level security;
alter table alert_responders enable row level security;

drop policy if exists p_profiles_all on profiles;
drop policy if exists p_alerts_all on alerts;
drop policy if exists p_alert_responders_all on alert_responders;

create policy p_profiles_all on profiles for all using (true) with check (true);
create policy p_alerts_all on alerts for all using (true) with check (true);
create policy p_alert_responders_all on alert_responders for all using (true) with check (true);
