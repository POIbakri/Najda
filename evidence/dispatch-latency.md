# Nearest-responder ranking cost (automated, reproducible)

**Claim:** Najda selects the nearest responders effectively instantly. Ranking
the nearest 5 among **1,000** candidate responders takes a **median 0.26 ms**;
even at **10,000** responders it is **3.5 ms** — so routing is never the
bottleneck, and the model scales to far larger responder pools than a single
rural community needs.

## Method

The instant an alert is raised, Najda ranks responders by distance and notifies
the nearest available ones. The demo store does this with a Haversine sort; the
Supabase path uses the equivalent `earthdistance` `nearest_responders` RPC
(see [`supabase/schema.sql`](../supabase/schema.sql)). This benchmark times the
ranking over a range of pool sizes (200 iterations each, median reported).

- Reproduce: `node scripts/measure-dispatch.mjs`

## Result

| Candidate responders | Median ranking time |
|---|---|
| 10 | 0.007 ms |
| 100 | 0.014 ms |
| 1,000 | 0.258 ms |
| 10,000 | 3.505 ms |

## Why this matters

- **Feasibility:** the routing engine is trivial to run — no special
  infrastructure, no per-request cost worth measuring.
- **Scalability:** the same engine serves a community 1,000× larger than Al
  Qua'a without changes; growth is a data problem (more responders), not an
  algorithm problem.

## Honesty note

This is **in-app compute only** — it excludes network round-trips and SMS/WhatsApp
delivery time, which dominate real-world latency and are exactly what the field
drill measures end-to-end (see [`drill.md`](./drill.md)).
