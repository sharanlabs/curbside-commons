# Agentic-product audit — 2026-07-24 (session 33)

**Goal (owner-fixed):** audit Curbside Commons *as a working agentic AI product*, then gate-verified fixes. Method: three independent read-only lanes (best-practice adherence · security threat-model · eval-coverage), each run fresh-context, plus a behavioral pass executed on the primary seat. Fixes route to Opus builders under the Opus-builds/Fable-orchestrates doctrine; nothing lands unjudged.

## Verdict

**The product is a working agentic AI product, and a well-built one — no HIGH or critical finding in any lane.** The engine decides, agents recommend, labels are earned through pre-registered floors, and the structural containment (recommend-only boundary, $0/no-transport import walks, seven-check approvals) held under re-audit. The real exposure is not current behavior: it is **drift-protection** — the measured past is locked to an unusually high standard while the *editable present* of the live agent lane carries no regression teeth. Second theme: **the honesty machinery is stronger than its own advertisement** (the MCP surface, one of the best-evidenced parts of the repo, is absent from the README's honest-status inventory).

## The three findings that matter (MEDIUM)

**M1 — The crew live lane is drift-blind.** The README's flagship "agent (live-run floors cleared)" label is backed by genuinely strong eval-locks — of the *2026-07-07 run*. The lane as it exists today (`lib/agents/crew-live.ts`: both live prompt builders, the default model id, the fetcher failure semantics) has zero regression assertions; any edit leaves every eval green while the label keeps rendering. The classifier lane already models the fix (pinned model literal, whole-gold-set leak checks, offline DI failure suite).
*Fix:* prompt-bytes hash lock into the L-1 lock family · assert `resolvedCrewLiveModel()` ≡ the committed matrix's model · offline DI suite for the fetchers (schema-invalid → degraded, provider-error classing, env-gate, one-fetch). Deterministic, offline, ~2 test files.

**M2 — The injection quarantine window is 400 characters, and coverage can't see past it.** Both model roles receive only `rawContent.slice(0, 400)`; a payload placed past character 400 in an otherwise-clean artifact bypasses the one control designed to surface tampering to a human (measured: the offline injection fixture's payload sits at offset 1115 — invisible; every *live* injection fixture front-loads within the window, so the floors only ever test visible injections). Blast radius is bounded — verdicts, tool blocking, and no-send hold structurally — which is why this is MEDIUM, not HIGH.
*Fix:* deterministic injection-signature scan over the **full** artifact in the orchestrator before any model turn, feeding the existing anomaly → forced-escalation path (converts a truncatable model heuristic into an untruncatable structural control) · one new L-1 fixture with the payload past character 400.

**M3 — The MCP surface is missing from the front-door honesty inventory.** Seven tools, stdio-only, import-walk-proven $0, descriptions byte-locked, transcript re-recorded through a real spawned server on every test run — and zero mentions in README's honest-status table or "Where AI is used" inventory. Flagged independently by two lanes.
*Fix:* one status row + one inventory line, wording drawn from the committed tests that already prove it (C10 binds the wording).

## Small-findings batch (LOW — one wave)

- Advertise a committed `outputSchema` for the `structuredContent` envelope + accurate read-only/idempotent/closed-world tool annotations; byte-lock both in the conformance test (MCP spec 2025-06-18 alignment).
- `crew-live.ts` records raw provider `err.message` into run records; narrow to `errorClass` (parity with the classifier lane's deliberate hygiene).
- `crew-live.ts:84` comment claims unmapped-tool `{}` params "fail the registry schema loudly" — false for `get_rule` (optional param). Fix mapper case or comment.
- Active `budget.ts`/`gemini.ts` docstrings lean on a post-call overflow stop that exists only in `legacy/`; convert to an explicit arming-requirement note (or lift the pure function). Dormant path, no live exposure.
- Path params gain `maxLength` (defense-in-depth; containment already holds); MCP rate-limit spec-MUST gets a documented exception in SECURITY.md (stdio-only, local, read-only, prototype-not-service) or a trivial cap.
- `scripts-ts/l2-resend-one-shot.mts` — the only transport-bearing code — has no committed assertions; add an offline NOT-ARMED suite (missing env ⇒ refuses; guard messages; no network construct on the unarmed path).

*Recorded, no action:* the agent label rests on a single K=1 live run — any future re-attempt should pre-register K≥3 + flip-rate (in-repo precedent: the classifier). A fresh run is owner-armed by definition; noted for that day's pre-registration, not built now.

## Verified holding (re-audited this session, not re-proposed)

Session-31 MCP hardening (parameter smuggling closed, path traversal matrix, single execution path) · recommend-only boundary (model output cannot reach a verdict or a send; forced escalation overrides a model "approve") · approvals seven-check order with signature binding + replay/nonce discipline · $0/no-transport import walks covering the MCP server path end-to-end including the pinned SDK's stdio internals · the eval-lock pattern (7 instances, all recomputing headlines from frozen raws) · budget fail-closed before any billable call.

## Behavioral evidence (run, not read)

Unedited transcripts: `docs/reviews/agentic-audit-2026-07-24-verify-evidence.log` (commands, exit codes, and the executed file list). Headlines: `node bin/check.mjs demo` exit 0, verdicts computed by the real verifier · 289/289 tests across the invocation's 27 files — **26 agentic-surface eval files** (crew 7, MCP 6, tools 5, RAG 5, approvals 2, agents 1) plus `legacy/activation/evals/tools-differential.test.ts`, which the `evals/tools` path filter substring-matches (named in the log; caught by the acceptance gate's tree count) · the MCP transcript freeze re-records through a real spawned server, so its pass is live behavioral proof · playground equality proofs re-run green this session: 19/19 (`playground-golden` byte-for-byte vs the committed synthetic SOR + `landing-trybench-equivalence`).

## Playground disposition (goal-named surface)

**Clean bill from standing committed proofs, re-run this session.** The playground is the deterministic engine running client-side — not a model-directed surface — so the three audit lanes (which target model seams, tool surfaces, and label integrity) had nothing lane-specific to attack there; that scoping is now explicit rather than silent. What holds it: the golden-equality suite proves the in-browser run reproduces the committed engine output byte-for-byte, the fail-closed import walk keeps it $0/offline, honesty labels are C10-scanned, and its e2e specs (both modes) ride the site battery. Re-run evidence in the log above. No findings.

## Adjudication notes

One eval-lane sub-observation ("one-shot script sitting modified and uncommitted") was stale at report time — the tree was committed at `c8c91a0` earlier this session; the underlying no-eval-coverage point stands and is in the batch above. Lane reports (full text) are retained in the session transcript; this report is the curated record per the 2026-07-22 owner directive.

## Proposed fix wave (next stage, gate-gated)

**Wave A (Opus builders, parallel-safe):** M1 · M2 · M3 + the LOW batch. All offline, $0, no transport wiring, no design-surface changes; every fix red-green with the existing suites as the floor. Ship artifact then crosses the Codex cross-model gate before commit words are requested.
