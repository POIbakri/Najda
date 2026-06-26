// Measures the real accuracy of Najda's address-free locator (Plus Codes).
// Encodes random coordinates around Al Qua'a at the resolution the app uses
// (11 digits), decodes back to the cell centre, and reports the great-circle
// error in metres. This produces a genuine, falsifiable claim for the README.
//
// Run: node scripts/measure-locator.mjs

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { OpenLocationCode } = require("open-location-code");
const olc = new OpenLocationCode();

const R = 6371000;
const toRad = (d) => (d * Math.PI) / 180;
function haversine(aLat, aLng, bLat, bLng) {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const CENTER = { lat: 23.5333, lng: 55.4869 };
const N = 5000;
const CODE_LEN = 11; // what lib/plus-code.ts encodes
const errors = [];
let lenSum = 0;

// Seeded LCG → reproducible but well-distributed sub-cell offsets.
let seed = 1234567;
const rand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};

// uniform spread across a ~0.6° box (~66 km) around Al Qua'a
for (let i = 0; i < N; i++) {
  const lat = CENTER.lat + (rand() - 0.5) * 0.6;
  const lng = CENTER.lng + (rand() - 0.5) * 0.6;
  const code = olc.encode(lat, lng, CODE_LEN);
  lenSum += code.replace("+", "").length;
  const area = olc.decode(code);
  errors.push(haversine(lat, lng, area.latitudeCenter, area.longitudeCenter));
}

errors.sort((a, b) => a - b);
const out = {
  samples: N,
  codeLength: CODE_LEN,
  avgDigits: +(lenSum / N).toFixed(1),
  medianErrorM: +median(errors).toFixed(2),
  p95ErrorM: +errors[Math.floor(N * 0.95)].toFixed(2),
  maxErrorM: +errors[N - 1].toFixed(2),
  exampleCode: olc.encode(CENTER.lat, CENTER.lng, CODE_LEN),
};
console.log(JSON.stringify(out, null, 2));
