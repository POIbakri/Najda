# Judging & Point System — the optimisation target

*Distilled from the official handbook. This is what every build and documentation decision optimises for.*

## How scoring works
- **Round 1 (Filtration → top 10):** scored **entirely from the repo** on criteria **1–7**. Total **65 points**. No demo.
- **Round 2 (Final, top 10 only):** adds criterion **8**. Total **75 points**.
- **Tiebreak order:** (1) **Impact and value**, then (2) **Feasibility of implementation**.
- **Critical rule:** *A criterion with no evidence in the repo is scored in its **lowest band**, not skipped.* **Document everything.** An undocumented strength scores zero.

## The criteria

| # | Criterion | Max | Top band = |
|---|-----------|-----|------------|
| 1 | **Impact & value** | 10 | Substantial, real benefit to many people, addressing a pressing need, clearly articulated. *(Tiebreak #1)* |
| 2 | **Relevance to the challenge** | 10 | Squarely on Challenge 2; targets a well-chosen, high-value problem within it. |
| 3 | **Feasibility of implementation** | 10 | Deployable in a real rural setting; cost, resources, and maintenance thought through. *(Tiebreak #2)* |
| 4 | **Readiness of the solution** | 10 | Complete, working, demonstrated **end to end** (not idea → not prototype → a working whole). |
| 5 | **Scalability after the hackathon** | 10 | Designed to replicate to other communities; clear growth path. |
| 6 | **Falsifiability & evidence** | 10 | Specific, testable claims backed by data, testing, or community validation — not hype. |
| 7 | **Repo documentation & completeness** | 5 | Complete README + repo; everything needed to understand, run, and verify, including the demo. |
| 8 | **Presentation & live demo** | 10 | Compelling live demo, credible under questioning. *(Sunday only.)* |

*Band thresholds rise with completeness and evidence; lower bands = vaguer/less complete/unevidenced. When in doubt, be more complete and more evidenced.*

## How each criterion is WON in this repo (build requirements)

**1 — Impact & value.** README opens with a named persona in Al Qua'a and the first-minutes problem, anchored to the real baseline (urban UAE EMS 7.5–8.5 min vs remote villages 30–60 min — `docs/EVIDENCE.md`). State the benefit as a testable claim.

**2 — Relevance.** Make the Challenge-2 framing explicit and keep the scope tight: address-free precise location + nearest-responder routing in the first minutes. Hold the "complements, not replaces, EMS" line.

**3 — Feasibility.** README must state: runs on a cheap Android, low bandwidth, offline + SMS fallback, **no government integration required**, low monthly running cost, and who maintains it. The working PWA on a real URL is the proof. Include an honest constraints list.

**4 — Readiness.** A deployed, working end-to-end product with **all states built** (loading/empty/error/location-failed/no-signal/success). Live URL + a way for anyone to trigger a test alert. Be precise in the README about what is real vs stubbed.

**5 — Scalability.** Document that the same engine serves any dispersed community by swapping the responder pool and facility data; give a concrete growth path (more responder types, more regions, later integration with formal dispatch).

**6 — Falsifiability & evidence — OUR HIGHEST-LEVERAGE POINT.** Run the drill (`docs/EVIDENCE.md`), log real medians (SOS→delivery, alert→acknowledgment, GPS accuracy, SMS fallback) to `/evidence`, cite the EMS baseline with sources, and include a **"What we did NOT validate"** section. Specific + evidenced + honest = top band; most teams write hype and score 0–2 here.

**7 — Docs & completeness.** Fill every section of `README.template.md`; live URL and demo video at the very top; clear run/verify instructions; tidy repo with LICENSE and `.env.example`.

**8 — Presentation (Sunday).** One real scenario, in Arabic, on a phone; let a judge trigger a test alert; lead with Impact, prove Feasibility, then show the drill numbers. Have a backup video.

## Scoreboard logic for the agent
Before marking the build "done," verify each of criteria 1–7 has concrete, findable evidence in the repo/README. If any is thin, the fastest points are usually in **6 (evidence)** and **7 (documentation)** — never leave them empty.
