# Wave 2 run ledger — 2026-10-31 overnight run (orchestrator: Fable 5.1, Claude Code seat)

**Plain English:** one row per lane of work tonight, who is building it, where its branch lives, and what state it is in. The lead updates this after every return. Anyone resuming this run starts here.

Baseline: `main` @ `cd0d347` · tsc 0 · eslint 0 · vitest 1821 + 8 · origin/main @ `fac8204` (10 commits unpushed; remote reachable from this seat) · production serves `56325eb` (S3) · deploy gate closed.
Lane contract: `docs/wave2-lane-contract-2026-10-31.md`. Return packets: `docs/returns/2026-10-31-<lane>.md` on each lane's branch.
Model rule (decision-log 2026-10-12 amendment): cheapest model with proven-equal output; judgment work on Opus; pattern-following on Sonnet; read-only verification on Haiku; equivalence judged by diff-first review + gates + the three independent checks at merge.

| # | Lane | Branch / worktree | Model · reason | Owns | Status | Last commit | Next |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | S1.5 correctness + S1 completion | `wave2/s15-correctness` · `.worktrees/s15-correctness` | Opus · engine correctness + golden regeneration explained line by line | `lib/packs/listings/{reference,detectors,cli,run,ucp}.ts` · `scripts-ts/generate-scenarios.mts` · `fixtures/scenarios/**` · `evals/packs/{scenarios,ucp-conformance,honesty-c10,listings-*}.test.ts` | dispatched 01:0x | — | review at return |
| 2 | S2-crew | `wave2/s2-crew` · `.worktrees/s2-crew` | Opus · new seats, replay binding, containment | `lib/crew/**` · `lib/agents/crew-live.ts` · `lib/tools/registry.ts` · `lib/mcp/{descriptions,server}.ts` · `evals/crew/**` (new files only; locks untouched) | dispatched 01:0x | — | review at return |
| 3 | S2-ledger | `wave2/s2-ledger` · `.worktrees/s2-ledger` | Sonnet · pattern work (JSON-lines, hash chain, registry, budget rows) | `lib/ledger/**` · `lib/approvals/**` · `lib/agents/{budget,pricing}.ts` · `evals/approvals/**` · `evals/agents/**` (new files) | **MERGED `7e4f699` 01:3x** (tamper test ✓ · gates 1879+8 · symlink untracked first) | `ff30065` | wiring into crew-live = S2-crew; F10 follow-up |
| 4 | S2-impact | `wave2/s2-impact` · `.worktrees/s2-impact` | Sonnet · arithmetic + seeded fixture under a written contract | `lib/impact/**` · `scripts-ts/generate-orders.mts` · `fixtures/synthetic-restaurant/orders.jsonl` (+ README rows) · `evals/packs/impact*.test.ts` | **MERGED `3926e69` 01:2x** (mutation 5 red · gates 1849+8) | `2d9cd93` | S2-crew wires `size_impact` |
| 5 | exec-layer (+ Wave 1 docs wording fixes) | `wave2/exec-layer` · `.worktrees/exec-layer` | Opus · public claims + a new route under DESIGN.md | `docs/pilot-kit/{executive-brief,five-minute-walk}.md` · `app/pilot/**` · `lib/landing/pilot-figures.ts` · `evals/packs/{pilot-page,honesty-c10}.test.ts` · plan § 7/§ 17 wording · README test-count line | dispatched 01:2x (batch 1b) | `61a6127` | review at return |
| 6 | ci-hygiene | `wave2/ci-hygiene` · `.worktrees/ci-hygiene` | Sonnet · CI/config pattern work | `.github/workflows/ci.yml` · `package.json` (hand edit only) · `.env.example` · `SECURITY.md` dependency section | **MERGED 01:4x** (upload-artifact re-pinned to v7.0.2 at merge; prune → owner card) | `28186ba` | — |
| 7 | cli-experience | `wave2/cli-experience` · `.worktrees/cli-experience` | Sonnet · CLI pattern work | `bin/check.mjs` · `lib/packs/listings/cli.ts` scenario subcommand only · `evals/packs/scenario-cli.test.ts` · README CLI block | queued (batch 1b) — **must not touch `cli.ts` lines S1.5 owns; coordinate at merge** | `cd0d347` | — |
| R1 | Wave 1 acceptance review | read-only (`.worktrees/review-w1` detached for the mutation re-apply) | Haiku ×3 (contract · register/§4 · counts) + Sonnet (mutation re-apply with Bash) | — | **returned 01:14–01:15 → ACCEPTED WITH CORRECTIONS** (`docs/reviews/wave1-acceptance-2026-10-31.md`) | — | fixes routed: code → S1.5 · docs → exec-layer |
| R2 | Freshness research | read-only | Sonnet · research-specialist, live sources dated 2026-10-31 | `docs/research/freshness-2026-10-31.md` | **returned 01:21 → written; plan § 3/§ 8/§ 16 corrected `fe30fb8`** (Uber Menu Maker direction reversed; citations re-pointed) | — | owner flags: Groq free label, Vercel Hobby, Node 26 |
| R3 | Security · privacy · legal review (owed since 2026-10-12) | read-only | Opus · security-specialist on the merged Wave 1 tree | `docs/reviews/security-privacy-legal-2026-10-31.md` | **returned 01:29 → written** (0 critical/high · 1 medium F1 → S1.5 · F2/F3/F5/F8/F9 → S2-crew · F11/F14 done on main) | — | F1 probe re-applied at the S1.5 merge |
| A1 | efficiency-head (advisory) | read-only | Sonnet | advisory ledger row | returned 01:10 | — | dispositions recorded below |
| A2 | delivery-manager (advisory) | read-only | Sonnet | — | at first checkpoint | — | — |

**Codex (deferred, owner word 2026-10-31):** changed-files reviews owed for S1-engine · S1-pins · W1b · W1c · every Wave 2 lane at its close · the S6 pre-ship gate. Logged in the decision-log row of 2026-10-31.

**Owner-only items open:** Codex when limits reset · D-6 local model (`sysctl -n hw.memsize` is denied from this sandbox; no `ollama` on PATH) · one validation conversation (`docs/research/interview-guide-platform-intake-2026-10-12.md`). **Deploy and D-4: deferred by owner word 2026-10-31 01:15** until the final design + an end-to-end working demo with test cases exist (Wave 3).

## Log

- 00:49 session opened; startup contract read; gates re-measured on `0ac396f`: tsc 0 · eslint 0 · vitest 1821 + 8.
- 00:5x advisor consulted; plan confirmed (resume, not pivot); four tweaks adopted (Wave 1 acceptance as a step · S1 completion folded into S1.5 · freshness lane · Codex deferral logged).
- 01:0x record committed `cd0d347`; exec-layer WIP committed `61a6127`; four wave2 branches fast-forwarded; three S2 worktrees + review worktree created.

## Advisory ledger (advisors advise; the orchestrator decides — org-model v2 § 21)

| Date · body | Claim | Evidence | Falsifier | Disposition | Outcome |
| --- | --- | --- | --- | --- | --- |
| 2026-10-31 01:10 · efficiency-head (Sonnet, ~57k tokens) | Width, not seat choice, is the risk: ~12 agents open on one seat; fold the three Haiku checks into one Haiku + a counts script | its reading of the dispatch table; no served-routes or reset-time data available to it | the fold misses a defect the three would have caught | **Declined for this wave** (all three already running, Haiku is cheap); **adopted for future fan-outs**: count accounting becomes a script, Haiku classifies grep hits only | pending |
| same | Hold batch 1b until batch 1a returns, or past ~01:45 (window rule E125) | window model assumes a ~50-minute heavy window; the seat's real reset time is unknown from this sandbox | 1b finishing inside the window without a cut | **Partially adopted**: 1b dispatches at the first checkpoint once 1a lanes show WIP commits on disk; not held on a clock that cannot be verified; WIP-commit discipline is the mitigation | pending |
| same | S2-ledger is trust-bearing (approvals, budget rows); re-seat to Opus if its first return needs > 1 correction round; orchestrator runs a tamper test at merge | green tests can be non-biting | S2-ledger passes the tamper test first round | **Adopted** as a merge rule | pending |
| same | Serialise cli-experience after the S1.5 merge (both edit `lib/packs/listings/cli.ts`) | file-ownership collision | no conflict at merge | **Adopted**: cli-experience dispatches after S1.5 merges | pending |
| same | Add check · outcome · cause (capability/input) columns per lane; the packet's MODEL self-report is not evidence of equivalence | self-grading | — | **Adopted**: columns filled at each merge from the orchestrator's own checks, never from the packet's MODEL line | pending |
| same | Owner-time budget by morning ≈ 10 min + one conversation: Codex reset/gates GO (2 min) · deploy yes/no with D-4 as one release-policy ask (3 min, only after Codex) · one validation conversation (25 min, book a slot) · D-6 one `sysctl` paste (2 min) · push = FYI not an ask | — | — | **Adopted** as the shape of the morning owner card | pending |
| same | Savings claim: net 35–50 % cheaper than all-Fable (ESTIMATED; Opus ≈ 0.5, Sonnet ≈ 0.3, Haiku ≈ 0.1 of Fable, ratios unverified); advisory overhead ≈ 4 % of the wave, under the 15 % cap | estimates only | measured tokens at wrap | recorded as estimate | pending |

Lesson line (efficiency-head): on a one-seat overnight run the scarce unit is the window, not dollars — open heavy lanes by critical path, make each WIP commit the product, turn count and sweep checks into scripts, not seats.

- 01:10 efficiency-head returned; dispositions above. 01:11 state-doc top blocks committed `3b63bad`; budget test 5/5. Fallback wake-up armed (25 min). Waiting on lanes.

| R4 | External references scan (official + unofficial/reverse-engineered GitHub, as data) | read-only | Sonnet · research-specialist, quarantined, Source Intake classification | `docs/research/external-references-2026-10-31.md` | **returned 01:34 → written** (official docs suffice; unofficial repos REJECT for code; MCP SDK 1.29.0 → 1.32.2 flagged; plan § 16 'integer cents' reworded) | — | S3 packet from its Top 5 |

- 01:14–01:15 Wave 1 acceptance review returned (a/b/c/d) → ACCEPTED WITH CORRECTIONS; environment rule discovered: `build-offline` before every full vitest (fresh worktrees have no `out/`). Env note + routed review items sent to all four build lanes. s2-ledger 3 WIP commits · s2-impact 2 · S1.5 and S2-crew still reading.
- 01:13/01:15 owner (mid-run): external references incl. reverse-engineered GitHub = in scope as data; deploy deferred until final design + e2e demo with test cases → Wave 3. Recorded in decision-log.
- 01:2x batch 1b dispatched: exec-layer (Opus, with the docs wording fixes folded in) · ci-hygiene (Sonnet); cli-experience waits for the S1.5 merge. R4 external-references lane dispatched.
- 01:2x–01:4x merges: S2-impact `3926e69` (gates 1849+8) · S2-ledger `7e4f699` (gates 1907+8; proof copy "seven checks" → derived eight) · ci-hygiene (upload-artifact re-pinned v7.0.2). Freshness digest + plan corrections `fe30fb8`; security review written; external-references digest written. **Deferred to run end (node_modules is shared by running lanes — no npm while they run):** MCP SDK bump 1.29.0 → 1.32.2 (advisory -46jr plausibly reaches stdio) and the `@huggingface/transformers` prune (owner decision). Running: S1.5 · S2-crew · exec-layer. Queued: cli-experience (after S1.5 merges) · S3 adapters (after S2-crew merges; packet from the external-references Top 5).
