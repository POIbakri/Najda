# Evidence

Criterion 6 (Falsifiability & evidence) is Najda's highest-leverage point. We
publish **specific, testable claims** with the data behind them, and we are
explicit about what we have **not** validated.

| File | What it contains | Type |
|---|---|---|
| [`locator-accuracy.md`](./locator-accuracy.md) | Address-free locator accuracy vs true coordinates | **Automated, reproducible in-repo** |
| [`dispatch-latency.md`](./dispatch-latency.md) | In-app SOS→notify processing latency | **Automated, reproducible in-repo** |
| [`whatsapp-dispatch.md`](./whatsapp-dispatch.md) | Real WhatsApp alert delivered to a responder's phone (Twilio status `read`) | **Live, verified against production** |
| [`baseline.md`](./baseline.md) | Cited UAE EMS response-time baseline | **External, sourced** |
| [`drill.md`](./drill.md) | Field drill protocol + results table | **Human-run (pending)** |

## Two kinds of evidence

1. **Automated & reproducible now** — anyone can re-run these from the repo. The
   accuracy and correctness numbers reproduce exactly; the timing numbers
   reproduce to their order of magnitude (wall-clock varies by machine). No people
   required. See the scripts in [`/scripts`](../scripts).
2. **Field drill (human-run)** — the real-world timing study from `docs/EVIDENCE.md`
   needs 4–6 volunteers. The tooling is built (the coordinator dashboard computes
   medians live from the notification ledger); the numbers get pasted into
   `drill.md` once the drill runs.

We deliberately do **not** fabricate field numbers. Where a claim has not been
measured in the field yet, it is listed under "What we did NOT validate" in
[`drill.md`](./drill.md).
