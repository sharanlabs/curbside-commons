# Wave 2 run ledger — 2026-10-31 overnight run (orchestrator: Fable 5.1, Claude Code seat)

**Plain English:** one row per lane of work tonight, who is building it, where its branch lives, and what state it is in. The lead updates this after every return. Anyone resuming this run starts here.

Baseline: `main` @ `cd0d347` · tsc 0 · eslint 0 · vitest 1821 + 8 · origin/main @ `fac8204` (10 commits unpushed; remote reachable from this seat) · production serves `56325eb` (S3) · deploy gate closed.
Lane contract: `docs/wave2-lane-contract-2026-10-31.md`. Return packets: `docs/returns/2026-10-31-<lane>.md` on each lane's branch.
Model rule (decision-log 2026-10-12 amendment): cheapest model with proven-equal output; judgment work on Opus; pattern-following on Sonnet; read-only verification on Haiku; equivalence judged by diff-first review + gates + the three independent checks at merge.

| # | Lane | Branch / worktree | Model · reason | Owns | Status | Last commit | Next |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | S1.5 correctness + S1 completion | `wave2/s15-correctness` · `.worktrees/s15-correctness` | Opus · engine correctness + golden regeneration explained line by line | `lib/packs/listings/{reference,detectors,cli,run,ucp}.ts` · `scripts-ts/generate-scenarios.mts` · `fixtures/scenarios/**` · `evals/packs/{scenarios,ucp-conformance,honesty-c10,listings-*}.test.ts` | dispatched 01:0x | — | review at return |
| 2 | S2-crew | `wave2/s2-crew` · `.worktrees/s2-crew` | Opus · new seats, replay binding, containment | `lib/crew/**` · `lib/agents/crew-live.ts` · `lib/tools/registry.ts` · `lib/mcp/{descriptions,server}.ts` · `evals/crew/**` (new files only; locks untouched) | dispatched 01:0x | — | review at return |
| 3 | S2-ledger | `wave2/s2-ledger` · `.worktrees/s2-ledger` | Sonnet · pattern work (JSON-lines, hash chain, registry, budget rows) | `lib/ledger/**` · `lib/approvals/**` · `lib/agents/{budget,pricing}.ts` · `evals/approvals/**` · `evals/agents/**` (new files) | dispatched 01:0x | — | review at return |
| 4 | S2-impact | `wave2/s2-impact` · `.worktrees/s2-impact` | Sonnet · arithmetic + seeded fixture under a written contract | `lib/impact/**` · `scripts-ts/generate-orders.mts` · `fixtures/synthetic-restaurant/orders.jsonl` (+ README rows) · `evals/packs/impact*.test.ts` | dispatched 01:0x | — | review at return |
| 5 | exec-layer | `wave2/exec-layer` · `.worktrees/exec-layer` | Opus · public claims + a new route under DESIGN.md | `docs/pilot-kit/{executive-brief,five-minute-walk}.md` · `app/pilot/**` · `lib/landing/pilot-figures.ts` · `evals/packs/{pilot-page,honesty-c10}.test.ts` · plan § 7/§ 17 wording · README test-count line | queued (batch 1b) | `61a6127` (stranded WIP committed + main merged) | dispatch after batch 1a confirms disk writes |
| 6 | ci-hygiene | `wave2/ci-hygiene` · `.worktrees/ci-hygiene` | Sonnet · CI/config pattern work | `.github/workflows/ci.yml` · `package.json` (hand edit only) · `.env.example` · `SECURITY.md` dependency section | queued (batch 1b) | `cd0d347` | — |
| 7 | cli-experience | `wave2/cli-experience` · `.worktrees/cli-experience` | Sonnet · CLI pattern work | `bin/check.mjs` · `lib/packs/listings/cli.ts` scenario subcommand only · `evals/packs/scenario-cli.test.ts` · README CLI block | queued (batch 1b) — **must not touch `cli.ts` lines S1.5 owns; coordinate at merge** | `cd0d347` | — |
| R1 | Wave 1 acceptance review | read-only (`.worktrees/review-w1` detached for the mutation re-apply) | Haiku ×3 (contract · register/§4 · counts) + Sonnet (mutation re-apply with Bash) | — | dispatched 01:0x | — | synthesize → accept / return fixes to lane 1 |
| R2 | Freshness research | read-only | Sonnet · research-specialist, live sources dated 2026-10-31 | `docs/research/freshness-2026-10-31.md` (orchestrator writes from the digest) | dispatched 01:0x | — | re-pin decisions |
| R3 | Security · privacy · legal review (owed since 2026-10-12) | read-only | Opus · security-specialist on the merged Wave 1 tree | `docs/reviews/security-privacy-legal-2026-10-31.md` (orchestrator writes) | dispatched 01:0x | — | findings → S1.5 / S3 packets |
| A1 | efficiency-head (advisory) | read-only | Sonnet | advisory ledger row | dispatched 01:0x | — | disposition each row |
| A2 | delivery-manager (advisory) | read-only | Sonnet | — | at first checkpoint | — | — |

**Codex (deferred, owner word 2026-10-31):** changed-files reviews owed for S1-engine · S1-pins · W1b · W1c · every Wave 2 lane at its close · the S6 pre-ship gate. Logged in the decision-log row of 2026-10-31.

**Owner-only items open:** D-4 auto-deploy · D-6 local model (`sysctl -n hw.memsize` is denied from this sandbox; no `ollama` on PATH) · the production deploy at wave close · one validation conversation (`docs/research/interview-guide-platform-intake-2026-10-12.md`) · Codex when limits reset.

## Log

- 00:49 session opened; startup contract read; gates re-measured on `0ac396f`: tsc 0 · eslint 0 · vitest 1821 + 8.
- 00:5x advisor consulted; plan confirmed (resume, not pivot); four tweaks adopted (Wave 1 acceptance as a step · S1 completion folded into S1.5 · freshness lane · Codex deferral logged).
- 01:0x record committed `cd0d347`; exec-layer WIP committed `61a6127`; four wave2 branches fast-forwarded; three S2 worktrees + review worktree created.
