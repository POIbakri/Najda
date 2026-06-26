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
  home_lat double precision,
  home_lng double precision,
  skills text,
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  requester_id uuid references profiles(id),
  requester_name text,
  type alert_type not null,
  status alert_status not null default 'searching',
  lat double precision not null,
  lng double precision not null,
  plus_code text,
  accuracy_m integer,
  note text,
  delivery text not null default 'data',         -- 'data' | 'sms'
  accepted_by uuid references profiles(id),
  accepted_by_name text,
  accepted_lat double precision,
  accepted_lng double precision,
  accepted_at timestamptz,
  eta_minutes integer,
  resolved_at timestamptz,
  outcome alert_outcome,
  created_at timestamptz not null default now()
);

-- notification + metrics ledger (this table produces the drill numbers)
create table if not exists alert_responders (
  id uuid primary key default uuid_generate_v4(),
  alert_id uuid not null references alerts(id) on delete cascade,
  responder_id uuid not null references profiles(id),
  responder_name text not null default '',
  distance_km double precision not null default 0,
  channel text not null default 'app',           -- 'app' | 'sms' | 'whatsapp'
  notified_at timestamptz not null default now(),
  responded_at timestamptz,
  eta_minutes integer,
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

-- realtime
alter publication supabase_realtime add table alerts;
alter publication supabase_realtime add table alert_responders;

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

-- ── demo seed ──
-- Realistic Arabic-first demo responders near Al Qua'a (~23.53, 55.49).
-- Run after schema.sql. Mirrors the demo store's seed so both modes feel alike.

insert into profiles (name, phone, language, is_responder, is_available, home_lat, home_lng, skills) values
  ('سالم المنصوري', '+971500000001', 'ar', true, true,  23.541, 55.492, 'إسعافات أولية'),
  ('فاطمة الكعبي',  '+971500000002', 'ar', true, true,  23.527, 55.478, 'ممرضة'),
  ('Imran Khan',     '+971500000003', 'ur', true, true,  23.550, 55.500, 'Driver, CPR'),
  ('خالد الشامسي',  '+971500000004', 'ar', true, false, 23.520, 55.460, 'دفاع مدني سابق'),
  ('Aisha Rahman',   '+971500000005', 'en', true, true,  23.515, 55.505, 'First aid');
