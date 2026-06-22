Findings:

- [P1] Budget hard-stop is not cumulative, so it does not prove the $5 cap.  
  [lib/agents/budget.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/agents/budget.ts:41) only checks caller-provided `spentUsd + estimatedNextUsd`; [lib/agents/draft.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/agents/draft.ts:154) defaults each live attempt to `{ spentUsd: 0, estimatedNextUsd: ... }`. Repeated live calls can each pass the guard while cumulative spend exceeds $5.  
  Fix: require an explicit cumulative budget ledger for live mode, reserve estimated cost before the call, reconcile actual usage after, and remove the default `spentUsd: 0` live path.

- [P1] Billed failed live calls are recorded as `$0`, hiding spend.  
  [lib/agents/draft.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/agents/draft.ts:159) makes the live call before schema parsing, but [lib/agents/draft.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/agents/draft.ts:167) falls back through [lib/agents/draft.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/agents/draft.ts:112), which hardcodes `costUsd: 0`. A Gemini response that bills but fails schema validation disappears from the ledger.  
  Fix: preserve reported usage/cost on `FAILED_TO_FALLBACK`, or charge the reserved estimate when usage is missing.

- [P1] Prompt-injection risk remains on `merchant_name` in the live Gemini prompt.  
  Sanitization strips control chars/length only at [lib/ingest/sanitize.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/ingest/sanitize.ts:22), and the test explicitly preserves instruction-like text as a name at [evals/hybrid-dataset.test.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/evals/hybrid-dataset.test.ts:62). That value is included in live prompt facts at [lib/agents/draft.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/agents/draft.ts:86) and [lib/agents/draft.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/agents/draft.ts:108).  
  Fix: draft with a neutral placeholder such as `{{MERCHANT_NAME}}`, substitute the real name after gatekeeping, and add adversarial-name tests.

- [P1] Claims-gatekeeper overclaims soundness: unsupported prose can slip through.  
  [lib/agents/gatekeeper.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/agents/gatekeeper.ts:59) verifies only declared `draft.claims`; it does not ensure every factual assertion in prose has a claim. The UI says “every factual assertion traces to merchant data” at [app/merchant/[id]/page.tsx](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/app/merchant/[id]/page.tsx:95) and implies no false claim can pass at [app/merchant/[id]/page.tsx](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/app/merchant/[id]/page.tsx:115).  
  Fix: either add reverse prose-to-claim coverage, or weaken copy to “declared claims are checked against merchant data.”

- [P1] Public-data privacy/honesty risk: snapshot includes likely personal-name DBAs while claiming no PII.  
  [lib/data/sf-entities.snapshot.json](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/data/sf-entities.snapshot.json:27) includes `Aaron Jevon Burrus`; [lib/data/sf-entities.snapshot.json](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/data/sf-entities.snapshot.json:43) includes `Iris Dullaart`; [lib/data/PROVENANCE.md](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/data/PROVENANCE.md:15) acknowledges personal-name DBAs. These names are rendered with synthetic risk/status in [app/page.tsx](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/app/page.tsx:129) and [app/merchant/[id]/page.tsx](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/app/merchant/[id]/page.tsx:50).  
  Fix: filter likely person-name DBAs or alias all real names before public deploy; add a snapshot guard.

- [P2] Empty draft-quality corpus passes vacuously.  
  [lib/evals/draft-quality.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/evals/draft-quality.ts:124) counts passing rows, and [lib/evals/draft-quality.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/evals/draft-quality.ts:127) sets `allPass` when `passedDrafts === rows.length`, so `[]` is green.  
  Fix: require `rows.length > 0 && passedDrafts === rows.length`.

- [P2] Snapshot generator has wall-clock output.  
  [scripts-ts/build-hybrid-snapshot.mjs](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/scripts-ts/build-hybrid-snapshot.mjs:91) writes `fetched_at` from `new Date()`, so re-freezing changes bytes by day.  
  Fix: pass `FETCHED_AT` explicitly or document regeneration as intentionally date-changing.

No finding: `GEMINI_API_KEY` is not exposed in the current client surface; it is read only via non-`NEXT_PUBLIC_` env access in [lib/server/env-flags.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/server/env-flags.ts:19) and [lib/agents/gemini.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/lib/agents/gemini.ts:53), and the changed app pages are server components.

No finding: rendered text does not use `dangerouslySetInnerHTML`; React interpolation is used for merchant/draft text.

No finding: snapshot entity records carry only `merchant_name` + `merchant_category`; [evals/hybrid-dataset.test.ts](/Users/sharan_98/Desktop/AI%20DoorDash%20Merchant%20Engine/evals/hybrid-dataset.test.ts:119) asserts that shape.

No finding: `lib/core/*` and `evals/core-differential.test.ts` are not modified in this slice; `git diff -- lib/core evals/core-differential.test.ts` was empty.

Validation note: I attempted `npm run test`, but this read-only sandbox blocked Vitest before import with `EPERM ... mkdir .../ssr`, so tests were not executed here. I also checked current official Gemini docs/pricing; the existing 2.5 Flash prices match the official pricing page, but live use still needs a fresh model/pricing gate.

VERDICT: BLOCK