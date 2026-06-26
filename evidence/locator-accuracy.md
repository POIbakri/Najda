# Locator accuracy (automated, reproducible)

**Claim:** Najda's address-free locator pinpoints a location to a **median
1.18 m** error (95th percentile 1.79 m, worst case 2.1 m) versus the true
coordinates — replacing street addresses with a code anyone can read aloud.

## Method

Najda encodes each location as an [Open Location Code](https://maps.google.com/pluscodes/)
(Plus Code) at **11 digits** — the resolution used in
[`lib/plus-code.ts`](../lib/plus-code.ts). We encode coordinates, decode them
back to the cell centre (what a responder or 998 operator navigates to), and
measure the great-circle distance between the original point and that centre.

- Samples: **5,000** points uniformly spread across a ~66 km box around Al Qua'a
  (centre 23.5333 N, 55.4869 E).
- Reproduce: `node scripts/measure-locator.mjs`

## Result

| Metric | Value |
|---|---|
| Samples | 5,000 |
| Code length | 11 digits |
| **Median error** | **1.18 m** |
| 95th-percentile error | 1.79 m |
| Max error | 2.10 m |
| Example code (Al Qua'a centre) | `7HMQGFMP+8Q6` |

## Why this matters

The national EMS provider names **precise location** as a top obstacle in areas
with no street addresses. A globally-unique code accurate to ~1–2 m, that a
person can read aloud over a phone, directly addresses that obstacle. The code
needs no app, no account, and no data connection to be useful — it can be spoken
to a 998 operator.

## Honesty note

This measures the **encoding/decoding** accuracy of the locator system itself.
The accuracy of the *device GPS fix* that feeds it is separate, varies by phone
and sky view, and is surfaced live in the app as "±N m" — and recorded per alert
for the field drill (see [`drill.md`](./drill.md)).
