-- Najda — hardening migration for an ALREADY-LIVE database.
--
-- The main schema.sql uses `create table if not exists`, so re-running it on a
-- database that already has the tables is a no-op — it will NOT add the new
-- constraints. Run THIS file once in the Supabase SQL editor to bring an
-- existing project up to the hardened schema. Safe to run more than once.

-- 1) RPC: add search_path + exclude_id (the PostgREST "ll_to_earth does not
--    exist" fix + no self-dispatch). `create or replace` updates in place.
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

-- 2) Ledger: one row per responder per alert (stops duplicate-count inflation).
--    De-dupe any existing duplicates first, then add the constraint.
delete from alert_responders a
  using alert_responders b
  where a.ctid < b.ctid
    and a.alert_id = b.alert_id
    and a.responder_id = b.responder_id;

do $$ begin
  alter table alert_responders add constraint alert_responders_alert_responder_uniq
    unique (alert_id, responder_id);
exception when duplicate_table then null; when duplicate_object then null; end $$;

-- 3) WhatsApp as a valid ledger channel (was app/sms only).
do $$ begin
  alter table alert_responders drop constraint if exists alert_responders_channel_check;
  alter table alert_responders add constraint alert_responders_channel_check
    check (channel in ('app','sms','whatsapp'));
exception when others then null; end $$;
