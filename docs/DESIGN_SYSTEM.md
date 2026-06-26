# Design System

## Thesis
Deliberately **not** the generic emergency-app look — no wall of panic-red, no Material dashboard, none of the AI-default palettes (cream+serif+terracotta / near-black+acid-accent / broadsheet hairlines). Najda lives in **Al Qua'a**: desert light, famously dark skies, dispersed farms, and the emotional arc of an emergency — **calm → a flare of urgency → the relief of a neighbour arriving.** Spend all the boldness in **one** place — the SOS button and the Locator Card — and keep everything else quiet and disciplined.

**Signature element:** the **Locator Card** — a large, beautiful human-readable location code paired with a live mini-map of the nearest responder approaching. It embodies the whole product: no addresses here, so a code anyone can read aloud replaces them, and your nearest help is a neighbour you watch coming.

## Colour tokens (use these exact values; don't invent colours)
| Token | Hex | Use |
|---|---|---|
| `sand-50` | `#F7F3EC` | App background — calm, legible in direct sunlight |
| `sand-100` | `#ECE4D6` | Cards, surfaces |
| `ink-900` | `#16202B` | Primary text, depth (night sky over the desert) |
| `ink-600` | `#46535F` | Secondary text |
| `flare-600` | `#E4451F` | **SOS + active emergency ONLY** — used nowhere else |
| `flare-700` | `#B8350F` | SOS pressed |
| `relief-600` | `#0E8C7A` | Responder en route / safe / "help is coming" |
| `amber-500` | `#E0A11B` | Pending / searching |

The discipline of reserving `flare` for the single most urgent action is what makes it unmistakable under stress. Default to a **light, high-contrast** theme (dark mode washes out in desert sun).

## Typography — Tajawal (Arabic + Latin pairing)
Big and confident; the type treatment is part of the design, not a neutral delivery vehicle.
| Role | Size / weight |
|---|---|
| Hero status / SOS label | 32–40px / 700 |
| Screen title | 24px / 700 |
| Body | 18px / 500 (never below 16) |
| Locator code | 28px / 700, tabular, letter-spaced |
| Caption / data | 14px / 500 |

## Spacing, shape, motion
- 8pt grid; generous breathing room; **one primary action per screen**.
- Radius: 16px cards; 999px (full circle) for the SOS button.
- Soft elevation; avoid harsh borders.
- Motion (minimal, purposeful): a slow ~1.4s **heartbeat pulse** on the SOS button (a beacon); a smooth "responder approaching" transition on the map. Nothing else. Respect `prefers-reduced-motion`.

## Iconography
Simple filled pictograms for the five emergency types (medical cross, car, flame, person-alert, dots). Always **icon + Arabic label + colour** together — never colour alone — so the UI reads regardless of literacy.

## Copy voice (copy is design material)
Plain, active, calm, sentence case, no filler. Controls say exactly what happens ("Send alert", not "Submit") and keep the same word through the whole flow (the button that says "Send alert" leads to a state that says "Alert sent"). Write from the user's side of the screen. Errors explain what went wrong and what to do, in the interface's voice, and never apologise or go vague. Full AR/EN parity; Urdu where provided.

## Accessibility floor (non-negotiable, and scored)
- Tap targets ≥ 56px (SOS far larger); body ≥ 16px.
- Contrast ≥ WCAG AA; verify `flare-600` and `ink-900` on `sand-50` for outdoor readability.
- One-handed use; primary action reachable by thumb.
- Visible keyboard focus; `prefers-reduced-motion` respected; full RTL correctness.
- Test on a real low-end Android with a throttled network.
