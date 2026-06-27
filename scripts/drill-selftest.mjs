// Controlled self-test (the "good enough" evidence tier).
//
// Raises N alerts from distinct GPS points across the Al Qua'a area against the
// LIVE production backend, exactly as the app's Supabase store does, and logs
// three falsifiable things per point:
//
//   1. Locator accuracy (m)  — encode the point as a Plus Code, decode back to the
//      cell centre (what a responder/operator navigates to), measure the error.
//   2. Ranking correctness   — does the earthdistance `nearest_responders` RPC pick
//      the SAME nearest available responder as a ground-truth Haversine search?
//   3. System latency        — SOS→delivery is server-to-server (created_at and
//      notified_at are both DB now() defaults). SOS→acknowledgment uses the
//      script's own clock for accepted_at, so it's subject to client/DB skew —
//      we label it that way rather than call it "server-stamped".
//
// IMPORTANT framing: the latency numbers are SYSTEM OVERHEAD. Acknowledgment here
// is a controlled session acking on cue — NOT an independent human responder — so
// these prove the pipeline is fast, not that people are helped faster. The impact
// claim is the proximity geometry (a nearby neighbour vs a distant ambulance), and
// is stated as an illustrative model, not a measured field result. See drill.md.
//
// Run: SUPABASE_URL=... SUPABASE_KEY=... DISPATCH_URL=... node scripts/drill-selftest.mjs
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { OpenLocationCode } = require("open-location-code");
const olc = new OpenLocationCode();

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_KEY;
const DISPATCH = process.env.DISPATCH_URL;
if (!URL || !KEY) { console.error("Set SUPABASE_URL and SUPABASE_KEY"); process.exit(1); }

function curl(method, path, body) {
  const h = `-H "apikey: ${KEY}" -H "Authorization: Bearer ${KEY}" -H "content-type: application/json"`;
  const pref = method === "POST" ? '-H "Prefer: return=representation"' : "";
  const data = body ? `--data '${JSON.stringify(body).replace(/'/g, "'\\''")}'` : "";
  const out = execSync(`curl -s -X ${method} ${h} ${pref} "${URL}${path}" ${data}`, { encoding: "utf8" });
  try { return JSON.parse(out); } catch { return out; }
}
function median(xs){const s=[...xs].sort((a,b)=>a-b);const m=Math.floor(s.length/2);return s.length?(s.length%2?s[m]:(s[m-1]+s[m])/2):null;}
const R = 6371000, toRad = (d)=>d*Math.PI/180;
function haversineM(aLat,aLng,bLat,bLng){const dLat=toRad(bLat-aLat),dLng=toRad(bLng-aLng);const h=Math.sin(dLat/2)**2+Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLng/2)**2;return 2*R*Math.asin(Math.sqrt(h));}

// 6 distinct points across the dispersed Al Qua'a area (different "farms").
// Full GPS precision (as a real device reports) — round-decimal coordinates land
// on Plus Code cell boundaries and aren't representative of real fixes.
const POINTS = [
  { lat: 23.541027, lng: 55.498183 }, { lat: 23.512416, lng: 55.471902 }, { lat: 23.560338, lng: 55.515471 },
  { lat: 23.498772, lng: 55.503019 }, { lat: 23.533645, lng: 55.460228 }, { lat: 23.575189, lng: 55.487613 },
];

// ground-truth set of AVAILABLE responders, for the ranking check
const responders = (curl("GET", "/rest/v1/profiles?select=id,name,home_lat,home_lng,is_available,is_responder&is_responder=eq.true&is_available=eq.true") || [])
  .filter((r) => r.home_lat != null);

const rows = [];
for (let i = 0; i < POINTS.length; i++) {
  const p = POINTS[i];
  const code = olc.encode(p.lat, p.lng, 11);

  // 1) locator accuracy: decode the code back to its cell centre, measure error
  const area = olc.decode(code);
  const accuracyM = haversineM(p.lat, p.lng, area.latitudeCenter, area.longitudeCenter);

  // raise the alert (server created_at)
  const alert = curl("POST", "/rest/v1/alerts", { type: "medical", lat: p.lat, lng: p.lng, plus_code: code, accuracy_m: Math.round(accuracyM), status: "searching", delivery: "data" })[0];

  // 2) ranking: RPC nearest vs ground-truth Haversine nearest
  const nearest = curl("POST", "/rest/v1/rpc/nearest_responders", { a_lat: p.lat, a_lng: p.lng, max_n: 5 }) || [];
  const rpcNearest = nearest[0];
  const trueNearest = [...responders].sort((a, b) => haversineM(p.lat, p.lng, a.home_lat, a.home_lng) - haversineM(p.lat, p.lng, b.home_lat, b.home_lng))[0];
  const rankingCorrect = rpcNearest && trueNearest && rpcNearest.id === trueNearest.id;
  const nearestKm = trueNearest ? haversineM(p.lat, p.lng, trueNearest.home_lat, trueNearest.home_lng) / 1000 : null;

  // 3) latency: write ledger (delivery) then acknowledge (on cue)
  const ledger = nearest.length ? curl("POST", "/rest/v1/alert_responders", nearest.map((r)=>({alert_id:alert.id,responder_id:r.id,responder_name:r.name,distance_km:+(haversineM(p.lat,p.lng,r.home_lat,r.home_lng)/1000).toFixed(2),channel:"whatsapp"}))) : [];
  const firstNotified = ledger.length ? Math.min(...ledger.map((l)=>Date.parse(l.notified_at))) : null;
  curl("PATCH", `/rest/v1/alerts?id=eq.${alert.id}&status=eq.searching`, { status: "accepted", accepted_by: rpcNearest?.id, accepted_by_name: rpcNearest?.name, accepted_at: new Date().toISOString(), eta_minutes: 4 });
  const got = curl("GET", `/rest/v1/alerts?id=eq.${alert.id}&select=created_at,accepted_at`)[0];
  const created = Date.parse(got.created_at);
  curl("PATCH", `/rest/v1/alerts?id=eq.${alert.id}`, { status: "resolved", outcome: "helped", resolved_at: new Date().toISOString() });

  rows.push({
    run: i + 1, code, accuracyM: +accuracyM.toFixed(2),
    rankingCorrect, nearestResponder: trueNearest?.name, nearestKm: nearestKm != null ? +nearestKm.toFixed(1) : null,
    deliveryMs: firstNotified != null ? firstNotified - created : null,
    ackMs: got.accepted_at ? Date.parse(got.accepted_at) - created : null,
  });
  console.error(`run ${i+1}: acc=${accuracyM.toFixed(2)}m ranking=${rankingCorrect?"OK":"MISS"} (${trueNearest?.name}, ${nearestKm?.toFixed(1)}km) delivery=${rows[i].deliveryMs}ms`);
}

// SMS/WhatsApp fallback: invoke the live dispatch once, record the real result
let dispatch = null;
if (DISPATCH) {
  const p = POINTS[0];
  const a = curl("POST", "/rest/v1/alerts", { type: "accident", lat: p.lat, lng: p.lng, plus_code: olc.encode(p.lat,p.lng,11), accuracy_m: 9, status: "searching", delivery: "data" })[0];
  if (responders.length) curl("POST", "/rest/v1/alert_responders", responders.slice(0,4).map((r)=>({alert_id:a.id,responder_id:r.id,responder_name:r.name,distance_km:+(haversineM(p.lat,p.lng,r.home_lat,r.home_lng)/1000).toFixed(2),channel:"whatsapp"})));
  try { dispatch = JSON.parse(execSync(`curl -s -X POST -H "content-type: application/json" --data '{"alertId":"${a.id}"}' "${DISPATCH}"`, { encoding: "utf8" })); } catch (e) { dispatch = { error: String(e) }; }
  curl("PATCH", `/rest/v1/alerts?id=eq.${a.id}`, { status: "cancelled" });
}

const result = {
  n: rows.length,
  medianLocatorAccuracyM: median(rows.map((r)=>r.accuracyM)),
  maxLocatorAccuracyM: Math.max(...rows.map((r)=>r.accuracyM)),
  rankingCorrect: `${rows.filter((r)=>r.rankingCorrect).length}/${rows.length}`,
  medianDeliveryMs: median(rows.map((r)=>r.deliveryMs).filter((x)=>x!=null)),
  medianAckMs: median(rows.map((r)=>r.ackMs).filter((x)=>x!=null)),
  rows,
  dispatch,
};
console.log(JSON.stringify(result, null, 2));
