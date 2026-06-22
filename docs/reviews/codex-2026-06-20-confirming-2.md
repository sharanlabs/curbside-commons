[P1] [evals/guardrail-corpus.test.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/evals/guardrail-corpus.test.ts:25) — The “45-case” TS corpus test only executes 40 behavior cases. `textCases` covers 39 text cases plus the single structural case; the 5 `stub_clean` cases are only counted, not run through `makeDraft + runGuardrail` like `scripts/eval.py`.
Fix: switch over every corpus case by `kind`; for `stub_clean`, reconstruct `merchant_context`, call `makeDraft`, then assert `runGuardrail(...)` is exactly `[]`.

[P2] [evals/guardrail-corpus.test.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/evals/guardrail-corpus.test.ts:31) — GR-POS-009 sentinel is not byte-faithful to `scripts/eval.py`; TS omits Python’s trailing `" to connect."`. Detection still passes, but the claimed oracle replication is inaccurate.
Fix: append the same suffix while keeping the secret-like token assembled from fragments.

[P2] [evals/live-samples.test.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/evals/live-samples.test.ts:10) — This is an invariant check, not a true live-snapshot lock. Exact row count, blockers, row content, gate counts, and cost-sum consistency can drift without failing.
Fix: assert the 6-row shape, exact `4 LIVE_AI / 2 FAILED_TO_FALLBACK`, exact `3 PASS / 3 WARN`, stable row fields, and total cost consistency or an explicit fixture hash.

[P2] [README.md](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/README.md:3) and [docs/WHY.md](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/docs/WHY.md:63) — “every claim” overstates the built control. The code checks declared claims plus forbidden-pattern classes; full semantic prose claim extraction is explicitly not built.
Fix: use “every declared claim” / “declared claims trace to data.”

[P2] [HANDOFF.md](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/HANDOFF.md:14), [app/page.tsx](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/app/page.tsx:34), [docs/WHY.md](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/docs/WHY.md:5), [scripts-ts/gemini-preflight.mjs](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/scripts-ts/gemini-preflight.mjs:2) — stale honesty copy remains: handoff still instructs T12 live-run work after saying only deploy remains; home page says “live = Phase B”; WHY still names live Gemini as gated; preflight comment says URL even though code now uses header.
Fix: update to deploy-only handoff, recorded-live-run/public-REPLAY wording, and “header, never printed” comment.

Confirmed: verb-before-noun state-consistency fix catches the requested completion phrases and not the imperative phrases; gatekeeper and eval both use the same product-tier checker. Draft oracle extraction matched `out/model_runs.csv` 20/20. `.vercelignore` keeps `.env`, `out/`, `scripts/`, CSVs, and generators out while not excluding `lib/`, `app/`, `components/`, package/config files. `lib/core/*` and `evals/core-differential.test.ts` have no diff.

Validation note: targeted Vitest could not run in this read-only sandbox: `EPERM: operation not permitted, mkdir .../T/.../ssr`. Read-only fixture checks were run with `python3`/`node`. Google’s current Gemini docs confirm REST `x-goog-api-key` header usage: https://ai.google.dev/gemini-api/docs/api-key

VERDICT: BLOCK