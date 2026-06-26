// Measures Najda's nearest-responder ranking cost — the work done the instant an
// alert is raised. Generates N synthetic responders and times ranking the
// nearest 5 by Haversine distance (what the demo store does; the Supabase path
// uses the equivalent earthdistance RPC). Supports the feasibility/scalability
// claims with a real, reproducible number.
//
// Run: node scripts/measure-dispatch.mjs

const R = 6371;
const toRad = (d) => (d * Math.PI) / 180;
function distanceKm(aLat, aLng, bLat, bLng) {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function median(xs) {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

let seed = 99;
const rand = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

function rankNearest(sizes) {
  const out = {};
  for (const N of sizes) {
    const responders = Array.from({ length: N }, () => ({
      lat: 23.5333 + (rand() - 0.5) * 1.0,
      lng: 55.4869 + (rand() - 0.5) * 1.0,
    }));
    const aLat = 23.5333 + (rand() - 0.5) * 1.0;
    const aLng = 55.4869 + (rand() - 0.5) * 1.0;
    const times = [];
    for (let it = 0; it < 200; it++) {
      const t0 = process.hrtime.bigint();
      responders
        .map((p) => ({ p, km: distanceKm(aLat, aLng, p.lat, p.lng) }))
        .sort((x, y) => x.km - y.km)
        .slice(0, 5);
      times.push(Number(process.hrtime.bigint() - t0) / 1e6);
    }
    out[N] = +median(times).toFixed(3);
  }
  return out;
}

const result = rankNearest([10, 100, 1000, 10000]);
console.log(JSON.stringify({ medianRankingMsByResponderCount: result }, null, 2));
