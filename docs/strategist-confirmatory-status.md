# Strategist (A3-2b) — live $0 Groq confirmatory eval: status + PRE-REGISTERED bar

**Slice:** A3-2b · **Model:** Groq `openai/gpt-oss-120b` (free, $0) · **Date opened:** 2026-06-28 · **Recorded by:** Opus 4.8.

> **This is a CONFIRMATORY floor check, NOT a label-earning certification.** Per the advisor + Codex (floor-not-ceiling): the structural discriminator (`caution`) is a finite enum a deterministic baseline (`strongRecommend`) computes perfectly, and the Strategist prompt even STATES the caution rule — so a live pass mostly confirms the model follows a deterministic instruction end-to-end, NOT that it adds judgment value. The `strategist` trajectory label therefore **DEFERS to the A3-3 cross-family (Gemini) judge** that can score the open-ended strategy/tone synthesis. A3-2b's job is narrow: confirm the live Strategist (1) runs end-to-end at $0 and (2) at least CLEARS the anti-theater floor (it is not a risk-blind costume). It also CAPTURES the open-ended strategy/tone prose as samples for the future A3-3 judge.

## Pre-registered bar (pinned BEFORE any number is read — R-DCAL-7 honesty discipline)

The eval runs the LIVE `strategistRecommend` over **labeled same-`play.touch` / different-risk PAIRS** (identical engagement/tenure/blocker → identical `diagnose().play`; differing only on `source_risk_level` Low↔High and the `review_required` it induces). For each pair, `strongRecommend` is directionally correct **by construction** (caution standard for Low, elevated for High); the live Strategist must MATCH it.

- **F-1 (liveness, $0):** every live call returns mode `LIVE_AI` (NOT `FAILED_TO_FALLBACK`), and total `costUsd == 0`. A run that silently falls back does NOT count.
- **F-2 (anti-theater FLOOR — the load-bearing bar):** over the N pairs, the live Strategist's `caution` is **directionally correct on ALL N pairs** (`standard` for the Low-risk member, `elevated` for the High-risk member) — i.e., it matches `strongRecommend` and is provably NOT the risk-blind costume the floor exists to catch. Tolerance: with N≥4 pairs, **≥ N (all)** on the primary rep; a single flip is investigated, not silently passed.
- **F-3 (consistency):** across **K = 2** reps the per-merchant `caution` is stable (test-retest flip rate = 0 on the pairs). temperature is 0, so instability would itself be a finding.

**Pre-registered verdict map:**
- **CLEARS F-1 ∧ F-2 ∧ F-3 →** the live Strategist is a *viable candidate* that follows the structural rule; **KEEP** the plan-step `agent = "tool"` + `strongRecommend`, **DEFER** the `strategist` label to A3-3, **KEEP** the public count at **"3 agents + a candidate"**. (A genuine open-ended improvement over `strongRecommend` is NOT decidable here — that is A3-3's job.)
- **FAILS F-2 (risk-blind) →** the candidate does not even clear the deterministic floor; **demote harder** — it is not a credible Strategist candidate; record + correct the count; carry the failure to A3-3 design.
- **FAILS F-1 (falls back) →** a wiring/key/window problem, not a model verdict; fix + re-run, do NOT record a model conclusion.

## Result — 2026-06-28 (live run CLEARED the pre-registered floor)

**Run:** `node --env-file=.env node_modules/.bin/vitest run evals/strategist.live.test.ts` → **PASS**. Model `openai/gpt-oss-120b` on a Groq **free-tier** key, 4 engagement-state pairs × Low/High × K=2 reps = **16 live calls**. Snapshot: `lib/data/strategist-confirmatory.snapshot.json`.

- **F-1 (liveness + ledger not charged): CLEARED.** All 16 calls returned mode `LIVE_AI` (no `FAILED_TO_FALLBACK`); the budget ledger was not charged (`budget.spentUsd == 0`).

### Cost honesty (Codex A3-2b P1 — reconciled; supersedes the bare "$0" wording above)
The pre-registered bar's "$0" wording is **imprecise** and is corrected here: `budget.spentUsd == 0` proves only that **our code did not charge the budget ledger** (our Groq path prices a free-tier call at 0 and discards reported usage) — it is **NOT an independent measurement of provider billing**. The accurate claim: the run used a Groq **free-tier API key** (rate-limited; the ~200K-tokens/day cap observed in B1 is that tier's mechanism), on which no per-token billing is charged → **$0 on the free tier**. Per **RULES §6 (freshness, 2026-06-28, https://groq.com/pricing):** `gpt-oss-120b` is NOT a free *model* — STANDARD pricing is **$0.15/M input + $0.60/M output**. So if this ~7.2K-token run were ever billed at standard rates it would cost ≈ **$0.003** (well within the $5 cap), but on the free-tier key it is $0. (This free-tier framing applies project-wide wherever "free Groq / $0" appears — accurate for a free-tier key; read it as "free-tier, not metered," not "free model.")
- **F-2 (anti-theater FLOOR): CLEARED.** Low→`standard` **4/4**, High→`elevated` **4/4** — the live Strategist matched `strongRecommend` directionally on EVERY pair; provably NOT the risk-blind costume the floor exists to catch.
- **F-3 (consistency): CLEARED.** Per-merchant `caution` stable across both reps (flip rate 0).

**Verdict (per the pre-registered map): CLEARS F-1 ∧ F-2 ∧ F-3 → viable candidate; the `strategist` label DEFERS to A3-3.** Keep the plan-step `agent = "tool"` + `strongRecommend`; keep the public count at **"3 agents + a candidate."** A3-2 (a+b) is now complete: the Strategist is built, anti-theater-gated, and confirmed live to clear the floor — its open-ended value is certified (or not) by the A3-3 cross-family judge.

**What the captured prose shows (NOT scored here — samples for the A3-3 judge):** the live Strategist DID produce differentiated strategy/tone — High-risk variants add urgency + "without over‑promising timelines" and route to `hold_for_review` (correctly envelope-clamped); engagement-state variation is visible (ghosted → "revenue/brand‑visibility benefits"; dormant → "regain momentum"; progressing → "finish the last step"). This is *suggestive* of real synthesis but is NOT objectively certifiable with same-family tools — exactly why the label waits for the A3-3 cross-family (Gemini) judge that can score this open-ended axis. (The eval uses the internal reference platform name "DoorDash" — an internal eval artifact, not a public surface.)
