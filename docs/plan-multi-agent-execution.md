# Plan — Multi-Agent Verify-and-Self-Correct Execution Spec

**Status:** Execution spec for the APPROVED 2026-06-25 pivot. Derived from the canonical brief `~/.claude/plans/read-last-handoff-and-snappy-ripple.md` (and `HANDOFF.md` top block). **Phase 0, A1, A2 are detailed (buildable); A3 / A4 / A5 / Track B / Phase-6 convergence are roadmap-level (one paragraph each — they get detailed when reached).**

This file is the **contract** a builder executes and a gate checks. The canonical brief is the rationale; if they ever disagree on a *requirement*, the brief wins on intent and this spec wins on what gets built + how it's accepted. Requirements are in **EARS** form ("WHEN <condition>, the system SHALL <behavior>") so they are machine-checkable. ID namespaces continue the house scheme in `docs/spec-semantic-judge.md` (`R-ARCH-*`, `R-CAL-*`, `R-HON-*`): this spec adds **`R-P0-*`** (Phase 0), **`R-TOOL-*`** (A1), **`R-LOOP-*`** (A2), and reuses the existing IDs by reference.

> **Plain-English summary (Pillar-2 legibility).** Today the product is a fixed assembly line with two AI calls bolted in — by Anthropic's own taxonomy a *workflow, not an agent*. This pivot turns it into a small **team of AI agents that draft, then check their own work against the merchant's real data, catch the fabrications the verifier flags, and fix them before a human ever sees the message** — with all the existing deterministic machinery (triage, the claims firewall, the audit log) demoted to **tools the agents call**, never rewritten. We build it in two provable steps first: **A1** wraps the existing safe code as typed tools (proving nothing changed), and **A2** stands up *one* self-correcting agent as an early **go / no-go** — a real agent on its own, before we commit to the full four-agent team, the live Slack/email rails, and the domain-expertise track.

---

## 0. Phase-0 Codex reconciliation — BINDING AMENDMENTS (2026-06-25)

The mandatory cross-model gate (Codex `gpt-5.5`@`xhigh` — `docs/reviews/codex-2026-06-25-multiagent-pivot.md`) returned **BLOCK → reconciled (all 9 findings accepted under primary-model-final).** The amendments below are **binding and SUPERSEDE any conflicting requirement text later in this file.** They tighten honesty, scope-sequencing, and deterministic-first; they do **not** change the pivot's direction.

- **AM-1 — catcher is a hard A2 prerequisite (Codex #1, P0).** The paused **P3 judge calibration MUST complete and clear the held-out bar (recall/precision/F1/κ/flip-rate, R-CAL-7) BEFORE A2's *live* self-correction milestone (R-LOOP-10) is run or claimed.** Until then, A2 proves **loop machinery only** (offline, R-LOOP-8). No "self-correcting"/"calibrated" claim ships before that bar clears **and** a Codex gate approves (R-HON-3).
- **AM-2 — A2 = single-agent spike (Codex #2).** A2 is a **single-agent reflexion spike** (the Router/Conductor in embryo), **not** "multi-agent." "Multi-agent" begins at **A3**. All A2 docs/labels say single-agent.
- **AM-3 — same-family verify proves convergence only (Codex #3).** In A2 the drafter and judge are both Groq `gpt-oss-120b`. A2 asserts **control-flow convergence ONLY** — never calibrated faithfulness. Cross-family maker≠judge (`R-ARCH-3`) is restored at A3. (Hardens R-LOOP-5.)
- **AM-4 — recommend-not-decide (Codex #6, deterministic-first).** The agent **RECOMMENDS** strategy/tone/draft only. `contact_eligible`, `review_required`, `approval_state`, `send_eligible`, and the `outreach_status` send transition stay **deterministic + tool-derived** (`computeSendEligible` + the core send loop, `lib/core/pipeline.ts:94-96,259-268`). The agent **SHALL NOT** override, recompute, or bypass them. Enforced by **R-LOOP-1b** + acceptance test **R-LOOP-8b** (below).
- **AM-5 — Groq availability rail (Codex #7).** Add a **Groq token/headroom ledger + per-run call budget + a preflight that skips the live path when the 200K-tokens/DAY shared window lacks headroom + a recorded-fixture fallback**, so no A2 live demo can exhaust the shared window mid-run. (Extends R-LOOP-4.)
- **AM-6 — scope = sequencing, not commitment (Codex #4).** **Committed near-term scope = P3-calibration + A1 + A2 only.** A3 · A4 · A5 · Track B stay **roadmap**, re-decided at the **A2 owner go/no-go**. This sequences the owner's full vision behind the early go/no-go; it does not cut it.
- **AM-7 — honesty language (Codex #5).** Across all docs use **"bounded verifier-loop prototype," "researched domain rubric," "self-corrects planted cases in eval"** — never "true multi-agent," credentialed "domain expert," or unqualified "catches its own mistakes."
- **AM-8 — reversal (c) framing (Codex #8).** Integrations are **unblocked because the `RULES.md` §3 rule-8 precondition (offline thin slice complete + reviewed) is SATISFIED** (live Gemini ran under it) — a scoped unblocking, **not** a reversal of `RULES.md`. Only the decision-log "integrations deferred" row is reversed. (Supersedes R-P0-2(c)'s "reversal of RULES §3 ordering note" wording.)

### New EARS requirements added by this reconciliation
- **R-LOOP-1b (Ubiquitous — recommend-not-decide invariant):** The agent loop SHALL treat the deterministic tools' outputs as authoritative; it SHALL NOT set or mutate `send_eligible`, `approval_state`, `review_required`, or `contact_eligible`, nor transition `outreach_status` to `simulated_sent`, **except** via the deterministic `simulate_send` tool. Any send for a `send_eligible:false` merchant is a hard failure.
- **R-LOOP-8b (acceptance — invariant is test-locked):** `evals/agent-loop.test.ts` SHALL include a case where the agent is seeded/prompted to "send anyway" to a `send_eligible:false` merchant (e.g. High-risk, unapproved); the loop SHALL route to human/hold and the merchant's `outreach_status` SHALL NOT become `simulated_sent`. The agent cannot override deterministic eligibility.

---

## 1. Domain vocabulary — the shared dev↔agent language

One canonical glossary so the spec, the build, and the agents use the **same words for the same things** (cuts ambiguity + drift). *(Folded into this spec rather than a separate file, per the single-file scope + the no-extra-report-files rule. The orchestrator MAY promote this section to a standalone `CONTEXT.md` if a dedicated dev↔agent file is wanted.)*

| Term | Meaning in this project (binding) |
|---|---|
| **Agent** | A component that adds **genuine LLM judgment over real ambiguity** (strategy, domain-quality, routing/reflection). Named agents: **Strategist/Planner**, **Drafter**, **Domain Critic**, **Router/Conductor**. |
| **Tool** | A **deterministic or bounded-single-purpose** capability the agents call — the **source of facts + safety**, never an autonomous decider. Anything that just wraps a deterministic check is a tool, **not** an agent (the anti-theater line). |
| **The agent/tool line** | A component earns the name *agent* ONLY where judgment is real. Facts and safety stay deterministic (deterministic-first **HELD**, `RULES.md` §3). We do not dress pipeline stages in agent costumes. |
| **Triage tool** | Deterministic normalize + risk + reason-codes + eligibility + review decision. Wraps `lib/core/pipeline.ts`. |
| **Diagnostician tool** | Deterministic blocker diagnosis: engagement-state + root-cause hypothesis + routed reactivation play. Wraps `lib/domain/diagnosis.ts`. |
| **Faithfulness check — forward** | The deterministic **claims-gatekeeper**: every *declared* claim traces to a merchant field (claim→data). Wraps `lib/agents/gatekeeper.ts`. A **tool** (LLM-free). |
| **Faithfulness check — reverse** | The **semantic judge**: per-claim entailment of the *prose* against the data row (prose→data), catching *undeclared* fabrications. Wraps `lib/agents/semantic-judge.ts`. LLM-backed but a bounded **tool** (fixed verify contract), not an agent — this is the brief's classification. |
| **Idempotent-send tool** | Deterministic send-eligibility + idempotency-key + simulated-send state transition. Wraps the send logic in `lib/core/pipeline.ts`. |
| **Audit tool** | Append a structured, schema-valid audit entry (what happened to the *record*). |
| **Trajectory** | The agent's **reasoning path** (how it reasoned): the ordered plan→draft→verify→reflect→re-draft→route steps with each step's tool I/O. Distinct concern from Audit. Must be **REPLAY-recordable at $0**. |
| **Faithful (axis 1)** | The output is **true to the data**: every claim verified against the structured source-of-truth (the data row) — **not RAG**. The loop's self-correction signal. |
| **Effective (axis 2)** | The output is **good domain practice** — judged by the Domain Critic / domain judge (Track B). |
| **Verify-and-self-correct loop** | plan → draft → **verify** (faithfulness) → **reflect** (why it failed) → **re-draft** → route. The reflexion/verifier-in-the-loop core. |
| **Loop models** | **Groq `gpt-oss-120b`** (free) drives all in-loop reasoning + drafting + the reverse-faithfulness judge. **Gemini Flash** (<$5) is **A3-only** (final draft); **A2 calls no Gemini**. |
| **REPLAY** | The public artifact is a recorded, no-keys, no-spend snapshot. Every demonstrable surface (incl. the trajectory) must freeze to a fixture served through the `getReplaySnapshot()` seam. |

---

## 2. Context (Phase-0 discovery — facts copied from the repo, not invented)

**What is already built, green, and eval-gated** (the foundation this pivot *promotes to tools*, never rewrites):

- **Deterministic core** — `lib/core/pipeline.ts` (`runCore`, `normalizeRow`, `validateMerchantRow`, `computeSendEligible`, `idempotencyKey`, `makeDraft`), `lib/core/guardrail.ts` (`scanText`, `runGuardrail`). Proven **byte-for-byte equal to the Python oracle** by `evals/core-differential.test.ts` against `out/merchants_v1.csv` (20 merchants × every column) — this is the parity anchor the whole pivot must keep green.
- **Domain depth** — `lib/domain/diagnosis.ts` (`diagnose`): engagement-state + root-cause + routed play, tested by `evals/diagnosis.test.ts`. Post-dates the Python prototype (no Python oracle).
- **Faithfulness controls** — `lib/agents/gatekeeper.ts` (`runGatekeeper` → `GatekeeperReport`, forward claim→data + guardrail + register-leak); `lib/agents/semantic-judge.ts` (`judgeDraft`, reverse prose→data entailment; default = deterministic `mockJudge`, live = key-gated cross-family Groq `gpt-oss-120b`). Shared ground truth `CLAIMABLE_FIELDS` / `merchantFacts` in `lib/agents/claimable-fields.ts`. Calibration core in `lib/evals/judge-metrics.ts` + gold set `evals/gold/semantic-judge-gold.ts` (30 items, 16 planted judge-territory positives across 4 failure modes, **9 in the held-out test split**, tune/test split per R-CAL-6/7).
- **Bounded LLM drafting** — `lib/agents/draft.ts` (`draftOutreach`, Gemini live/mock; `GeneratedDraftSchema`; `OutreachDraft`+`claims[]`; the **injection-cut** `{{MERCHANT}}` placeholder + `MISSING_PLACEHOLDER`/`NAME_LEAK`/`UNRESOLVED_PLACEHOLDER` post-gen validation), `lib/agents/gemini.ts` (the provider boundary: `liveGenerateObject`, `AgentMode`, `BudgetContext`, model preflight), `lib/agents/budget.ts` (`assertWithinBudget`, `BudgetExceededError`, `DEFAULT_BUDGET_CAP_USD = 5` fail-closed), `lib/agents/pricing.ts` (pinned cost table), `lib/agents/live-batch.ts` (`draftBatchLive` — the cumulative-ledger pattern).
- **Eval lane** — `lib/evals/draft-quality.ts` (`scoreDraft` → 4 graders: structure / state-consistency / policy / no-leakage, each with corrupted-record teeth).
- **Orchestration + demo** — `lib/replay/run.ts` (`buildReplaySnapshot`, `getReplaySnapshot` — the **compute-once → swap-in-recorded-fixture seam**; `AuditEntry` actors `system|draft|gatekeeper|judge|eval`). Hybrid data `lib/ingest/hybrid.ts` (`getHybridMerchants`, `hybridProvenance`). Env gates `lib/server/env-flags.ts` (`liveAiEnabled`, `judgeLiveEnabled`).
- **Commands:** `npm run verify` = typecheck + lint + test + build; `npm run verify:full` = `verify` + Playwright e2e. Codex runs **only** via `~/claude-os/bin/codex-guarded` (shared-seat mutex; namespaced output).

**Constraints HELD (non-negotiable — every phase verifies against these):**

1. **Best-fit, cost-aware — near-term all-free** (refined 2026-06-25, decision-log; was "free-first, no other paid tool") — Groq `gpt-oss-120b` (free) carries the loop + critics; **Gemini Flash stays the cost-tracked LLM, <$5 hard total** (the `assertWithinBudget` rail). **Near-term (P3-calibration + A1 + A2) runs entirely free.** Free / free-tier / self-hostable is the **default bias**, no longer a hard gate: an additional **paid / enterprise-grade** tool is allowed **at A3+ only where it materially serves the goal** — named justification + live freshness/price check (`RULES.md` §6) + owner sign-off + Codex cross-check (consequential pick). Does **not** reopen the AM-6 scope cap.
2. **Gemini reserved for A3** — A2's loop runs entirely on **free Groq**; **A2 SHALL NOT call Gemini** (asserted to $0).
3. **Human-approval-before-send** — no send without explicit human approval; A2 ends at the human gate / simulated send only.
4. **Prototype-run-on-demand** — integrations (Slack/email/n8n, A5) are a **transient demo + a recorded walkthrough**, never standing infra; no uptime/ops goals.
5. **Honesty** — simulated data, fictional names, no real DoorDash access/data/impact, metrics labeled simulated; "domain expert" = *researched + source-cited* knowledge (+ owner judgment), never a credentialed practitioner.
6. **Deterministic-first + eval-before-claims** — `lib/core/*` and the differential oracle stay **UNTOUCHED**; facts/safety stay deterministic; no "built + calibrated" claim before metrics exist and clear the bar.
7. **Domain content researched + source-cited** (never memory-plausibility) — Track B.
8. **Owner-set tooling ladder + ~$5 Gemini routing + live date-anchored vetting** (`docs/decision-log.md` 2026-06-12 rows; `RULES.md` §6): every model id / free-tier limit / license re-verified live at build time.

---

## 3. Top-level success criteria (declarative — the ship bar this spec serves)

The full-system DONE bar (from the brief; detailed phases below each verify a slice of it):

- **SC-1 — Faithful:** 0 unsupported claims reach "approved" on the gold set. *Verified by:* `runGatekeeper` + the calibrated semantic judge over `evals/gold/*` + the A2 self-correction loop.
- **SC-2 — Effective:** the domain judge scores ≥ its calibrated threshold vs an expert-sourced gold set. *Verified by:* Track B (B1/B2) — roadmap.
- **SC-3 — Self-correcting:** the loop self-corrects **≥K planted false claims unaided** with an **observable trajectory**. *Verified by:* A2 acceptance (`R-LOOP-*`).
- **SC-4 — Bounded + safe:** ≤ $5 Gemini total · loop free on Groq · no send without human approval · **deterministic-core parity held**. *Verified by:* the budget rail, the A1 differential, the human gate.
- **SC-5 — Demonstrable at $0:** REPLAY-only public demo (no keys, no spend) shows the full agent trajectory + a recorded live-flow walkthrough (A5). *Verified by:* the `getReplaySnapshot()` fixture seam.
- **SC-6 — Gated:** every phase artifact clears `acceptance-gate` SHIP + the 5 ship gates (§9).

---

## 4. PHASE 0 — Decide & gate  *(DETAILED)*

**Stage:** pivot-checkpoint → plan-approval gate. **Goal:** record the reversal, pass the mandatory cross-model gate, and sync state — **before any code, before `/autopilot` is toggled.** Governance/planning only; **no product code changes in Phase 0.**

### 4.1 Success criteria (EARS)

- **R-P0-1 (Event-driven — cross-model gate):** WHEN the pivot/plan is submitted for review, the system SHALL run a Codex **adversarial cross-check** via `~/claude-os/bin/codex-guarded` (ship-gating → latest model @ `xhigh`), capture the verdict to `docs/reviews/codex-2026-06-25-multiagent-pivot.md`, and reconcile each finding under **primary-model-final** (refute with evidence or fix). IF the Codex seat errors, THEN the raw error SHALL be surfaced verbatim and the run SHALL NOT be silently retried/downgraded/switched (owner-action); a seat-down state is a **dated obligation**, not a waiver — test-verified reconciliation may stand in only with the owner's explicit acceptance (precedent: decision-log 2026-06-20).
- **R-P0-2 (Ubiquitous — decision reversals):** The system SHALL record **three** `docs/decision-log.md` rows, each carrying the Decision-Reversal fields (original · why-changed · impact · reference):
  - (a) **drop-agentic-for-V1 → agentic deliverable** — framed as a **pull-forward of the already-logged 2026-06-09 target-level row** (decision-log row: "North-star = full HITL *agentic* system") to the **build level**, not a cold reversal; cite that row.
  - (b) **no-multi-agent-framework → bounded multi-agent** (principled splits only — maker≠judge critics) — a genuine reversal of the 2026-06-01 "drop agentic framing" row.
  - (c) **integrations-deferred → unblocked as a transient demo** (the offline thin slice it waited on is done) — **scoped unblocking, NOT a reversal of `RULES.md` §3** (per AM-8): the §3 rule-8 precondition (offline thin slice complete + reviewed) is now SATISFIED (live Gemini ran under it), so only the 2026-06-01 "integrations deferred" **decision-log row** is reversed, scoped to *transient demo*, not standing infra.
- **R-P0-3 (Ubiquitous — ADR):** The system SHALL author **`docs/decisions/ADR-002-multi-agent-architecture.md`** (matching the ADR-001 format: Status · Context · Decision · Options Considered · Consequences · Validation Needed) capturing: the agent/tool line, the named agents + tools, the two-axis quality bar, the Groq-loop/Gemini-final model split, the REPLAY-only public posture, and the A1→A2→A3 sequencing with A2 as the early go/no-go.
- **R-P0-4 (Ubiquitous — state sync):** The system SHALL sync the pipeline state docs to the pivot: `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md` (resume prompt), `docs/roadmap.md`, `docs/task-log.md`, and `docs/implementation-journal.md` (meaningful-work entry). The prior active task (UI Stage 2 + judge calibration) SHALL be re-labeled **subsumed** (judge calibration *is* the Faithfulness tool; UI continues but must also surface the trajectory at A4).
- **R-P0-5 (State / owner gate):** WHILE Phase 0 is not "cleared" (4.2), the system SHALL NOT toggle `/autopilot` or begin A1 build. The `/autopilot` + `/goal "<ship condition>"` toggle is an **owner action**; Claude prompts the exact moment ("Phase 0 cleared — toggle /autopilot now") and the owner flips it.

### 4.2 Acceptance — "Phase 0 cleared" (all must hold)

1. `docs/reviews/codex-2026-06-25-multiagent-pivot.md` exists; every Codex finding is **reconciled or evidence-refuted** (primary-model-final), or the seat-down dated-obligation path (R-P0-1) is recorded **and** owner-accepted.
2. `docs/decision-log.md` carries the **3 reversal rows** (R-P0-2) with all reversal fields.
3. `docs/decisions/ADR-002-multi-agent-architecture.md` exists and is internally consistent with this spec + the brief.
4. State docs (R-P0-4) are synced and mutually consistent; `git status` shows only docs/governance changes (no `lib/`, `app/`, `evals/` edits).
5. The owner has the explicit `/autopilot`+`/goal` prompt and the GO is recorded.

### 4.3 Key files
**Create:** `docs/reviews/codex-2026-06-25-multiagent-pivot.md`, `docs/decisions/ADR-002-multi-agent-architecture.md`, **this file**. **Modify:** `docs/decision-log.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/roadmap.md`, `docs/task-log.md`, `docs/implementation-journal.md`.

### 4.4 Dependencies & exit gate
**Blocked by:** plan approval (DONE — owner, 2026-06-25). **Exit gate:** 4.2 all-green **+ owner commit approval** (`RULES.md` §12) **+ owner `/autopilot` toggle**. → unblocks **A1**.

---

## 5. PHASE A1 — Tool-ify the deterministic core  *(DETAILED)*

**Stage:** execution (phase A1 of A2-track). **Goal:** expose each existing deterministic/bounded function as a **typed agent tool** (name + Zod input schema + Zod output schema + a call that *delegates to the existing function*), so the A2 agent has a clean tool surface. **No new business logic** — these are thin typed adapters. **`lib/core/*` is not edited.**

> Plain-English: we are *not* rebuilding any logic. We are putting a typed "handle" on each existing function so an agent can call it like a tool — and proving, with a test, that calling through the handle produces exactly what the pipeline produced before.

### 5.1 The tool registry (each: tool name → existing function → I/O contract)

New module **`lib/agents/tools/registry.ts`** (+ one file per tool under `lib/agents/tools/`). Each tool is `{ name, description, inputSchema: ZodType, outputSchema: ZodType, run(input): output }` where `run` **only** calls the cited existing function (no branching logic of its own).

| Tool name | Wraps (existing fn) | Input (Zod) | Output (Zod) | Agent/tool |
|---|---|---|---|---|
| `triage_merchant` | `normalizeRow` + `validateMerchantRow` (`lib/core/pipeline.ts`) | `MerchantInput` | `Merchant` (risk_level, review_required, contact_eligible, send_eligible, blocker, next_best_action…) | tool |
| `diagnose_blocker` | `diagnose` (`lib/domain/diagnosis.ts`) | `Merchant` | `Diagnosis` (engagement_state, root_cause_hypothesis, play, caveat) | tool |
| `check_faithfulness_forward` | `runGatekeeper` (`lib/agents/gatekeeper.ts`) | `{ draft: OutreachDraft, merchant: Merchant, platformName? }` | `GatekeeperReport` | tool |
| `check_faithfulness_reverse` | `judgeDraft` mock path / `mockJudgeResult` (`lib/agents/semantic-judge.ts`) | `{ draft: OutreachDraft, merchant: Merchant }` | `JudgeResult` (`JudgeVerdictSchema` + mode/cost) | tool (LLM-backed, bounded) |
| `score_quality` | `scoreDraft` (`lib/evals/draft-quality.ts`) | `{ draft: OutreachDraft, merchant: Merchant, platformName? }` | `DraftScore` (4 graders) | tool |
| `simulate_send` | `computeSendEligible` + `idempotencyKey` (`lib/core/pipeline.ts`) | `Merchant` (eligible + drafted) | `{ send_eligible, idempotency_key, outreach_status }` | tool |
| `append_audit` | a thin structural append (see R-TOOL-4) | `AuditEntry` (schema-valid) | `AuditEntry[]` | tool |

The **Drafter** is *not* an A1 deterministic tool — its bounded surface (`draftOutreach`) is the LLM action the **agent** takes in A2 (deterministic `mockDraft` parity already rides `evals/draft-oracle.test.ts`). It is registered as a tool wrapper in A2, not A1.

### 5.2 Success criteria (EARS)

- **R-TOOL-1 (Ubiquitous — delegation only):** Each tool's `run` SHALL call exactly the cited existing function and return its result unchanged (modulo Zod parse). A tool SHALL NOT add, branch on, or re-derive business logic. *(Reviewable by reading each `run` body.)*
- **R-TOOL-2 (Ubiquitous — typed I/O):** Each tool SHALL declare a Zod `inputSchema` and `outputSchema`; `run` SHALL parse input on entry and the output SHALL satisfy `outputSchema`. Schemas reuse the existing types (`Merchant`, `OutreachDraft`, `GatekeeperReport`, `JudgeVerdictSchema`, `DraftScore`).
- **R-TOOL-3 (Ubiquitous — `lib/core` untouched):** A1 SHALL NOT edit `lib/core/*`, `scripts/pipeline.py`, the oracle CSVs, or any frozen fixture. New code lives under `lib/agents/tools/`.
- **R-TOOL-4 (audit-as-tool is structural, not differential):** `append_audit` SHALL accept any schema-valid `AuditEntry` and append it; its acceptance is **structural** (schema-valid + order-preserving), NOT a differential parity test. The **rich trajectory recorder** is **A2 infrastructure** (R-LOOP-6), not an A1 tool — do not force it into the differential framing. *(Note: `buildAudit` in `lib/replay/run.ts` is private and emits the fixed 6-entry REPLAY audit; A1 does not re-use it as the loop's append.)*

### 5.3 Acceptance — two parity classes (be precise; not every tool has a Python oracle)

**Class A — oracle-differential** (parity vs the Python oracle, riding the existing differentials). New test `evals/tools-differential.test.ts`:
- **R-TOOL-5a:** The Class-A differential **harness** SHALL re-express `runCore`'s full deterministic chain with the A1 tool wrappers swapped in for their core equivalents, over the **20 oracle inputs** (parsed from `out/merchants_v1.csv` exactly as `evals/core-differential.test.ts` does), and SHALL assert the result equals `out/merchants_v1.csv` **byte-for-byte across every `MERCHANT_COLUMNS` column**. The chain is: `triage_merchant` → **[the drafted/rejected step: core `makeDraft` → core `runGuardrail` + `validateDraft` — used as connective tissue in the TEST, the SAME functions `runCore` calls; this does NOT promote the Drafter to an A1 tool, it stays an A2 agent]** → `simulate_send`. **Name the function explicitly: the harness uses core `runGuardrail` (`lib/core/guardrail.ts`), NOT the agent-tier `runGatekeeper`** — the two coincide on the clean oracle (0 rejected) but `runGatekeeper` adds register-leak + `proseClaimsUnreachedStep`, so naming core `runGuardrail` prevents a silent divergence on any future non-clean input. **This step is load-bearing:** the 8 held rows reach `outreach_status:"drafted"` + `last_outreach_at=AS_OF_DATE` ONLY via the middle drafted/rejected step (not from `triage_merchant`, which leaves them at `"none"`); the 12 eligible rows then reach `"simulated_sent"` via `simulate_send`. (Transitive parity: tool-composed chain ≡ `runCore` ≡ Python oracle; `outreach_status` + `idempotency_key` + `last_outreach_at` are all `MERCHANT_COLUMNS`.)
- **R-TOOL-5b:** The drafter wrapper's deterministic path (`mockDraft`) SHALL remain byte-identical to the draft oracle `out/model_runs.csv` — assert by riding the existing `evals/draft-oracle.test.ts` (no new oracle needed).

**Class B — wrapper-identity** (TS functions that post-date the Python prototype; "≡ existing behavior" = "≡ the existing TS fn" + its existing test). Same `evals/tools-differential.test.ts`:
- **R-TOOL-6:** For `diagnose_blocker`, `check_faithfulness_forward`, `check_faithfulness_reverse` (mock), `score_quality`, the tool output SHALL `deepEqual` the direct call of the wrapped function on the same input, over the hybrid set (`getHybridMerchants()` → `runCore` → per-merchant). These tools inherit their behavioral coverage from `evals/diagnosis.test.ts`, `evals/gatekeeper.test.ts`, `evals/semantic-judge.test.ts`, `evals/draft-quality.test.ts`. *(Explicitly: `check_faithfulness_reverse` parity is over the **`mockJudge`** path, which is a keyword heuristic, NOT a real detector — its detection power is the separate, still-pending live calibration, not an A1 claim.)*
- **R-TOOL-7 (regression):** `npm run verify` SHALL stay green (typecheck + lint + existing tests + build); the existing `evals/core-differential.test.ts` SHALL remain untouched and passing.

**Acceptance commands:**
```
node --env-file=.env node_modules/.bin/vitest run evals/tools-differential.test.ts
npm run verify            # typecheck + lint + ALL tests + build
```

### 5.4 Key files
**Create:** `lib/agents/tools/registry.ts`, `lib/agents/tools/{triage,diagnose,faithfulness-forward,faithfulness-reverse,score,send,audit}.ts` (thin), `evals/tools-differential.test.ts`. **Modify:** none in `lib/core`. **Read-only reuse:** all functions in §5.1.

### 5.5 Dependencies & exit gate
**Blocked by:** Phase 0 cleared. **Exit gate:** R-TOOL-5a/5b/6/7 green + `npm run verify` green + a Codex changed-files review (`~/claude-os/bin/codex-guarded`) reconciled. → unblocks **A2**.

---

## 6. PHASE A2 — Single agent loop  *(DETAILED — the EARLY GO/NO-GO ship milestone)*

**Stage:** execution (phase A2). **Goal:** stand up **ONE orchestrator agent** (the Router/Conductor in embryo) that, given a stalled merchant, runs the **verify-and-self-correct loop** using the A1 tools — **offline-provable + free (Groq)** — with an **observable, REPLAY-recordable trajectory**. This is a deliberate **owner GO/NO-GO**: prove a *true agent on its own* before committing to the full multi-agent team + integrations + domain track.

> Plain-English: one agent plans an approach, writes a draft, **checks the draft against the merchant's real data, and if it finds a made-up claim it figures out why and rewrites** — looping until the draft is clean or it gives up and hands the merchant to a human. The whole reasoning path is recorded so you can *watch it think*, and it costs nothing (free Groq; zero Gemini).

### 6.1 Loop control flow (declarative; the build picks the framework, §6.4)

```
plan      → triage_merchant + diagnose_blocker (tools)  →  agent RECOMMENDS contact / hold-for-review / suppress + strategy/tone (deterministic eligibility/send unchanged — AM-4 / R-LOOP-1b)
draft     → agent authors an OutreachDraft on GROQ gpt-oss-120b (free), reusing GeneratedDraftSchema + the {{MERCHANT}} injection-cut
verify    → check_faithfulness_forward (gatekeeper) AND check_faithfulness_reverse (LIVE Groq judge)  →  the self-correction signal
reflect   → IF verify fails: agent reasons over WHICH claim / WHICH field failed → a concrete revision instruction
re-draft  → agent re-drafts with the reflection  →  back to verify
route     → on pass (or stop): human gate (hold / approve) + simulate_send if eligible + append_audit + emit trajectory
```

### 6.2 Success criteria (EARS)

- **R-LOOP-1 (Event-driven — the loop):** WHEN given one stalled `MerchantInput`, the agent SHALL execute plan→draft→verify→reflect→re-draft→route using ONLY the A1 tools + a Groq drafting action, and SHALL terminate at a route **recommendation** (contact / hold-for-review / suppress) for the human gate. **Per AM-4 / R-LOOP-1b the agent RECOMMENDS only — `send_eligible`, `approval_state`, and the `simulated_sent` transition stay deterministic (`computeSendEligible` / `simulate_send`); the agent cannot override them.**
- **R-LOOP-2 (Event-driven — self-correct):** WHEN `verify` reports a failure (`runGatekeeper` not-PASS OR the judge's `any_unsupported = true`), the agent SHALL reflect (identify the failing claim/field) and re-draft; WHILE `verify` still fails AND the stop conditions (R-LOOP-3) are not met, it SHALL iterate.
- **R-LOOP-3 (stop conditions — bounded):** The loop SHALL stop on the FIRST of: (a) `verify` passes (gatekeeper PASS/WARN AND judge all-supported); (b) `maxIterations` reached (config; default **3**) → route to human as **"could not self-correct — held"**; (c) the budget guard trips (R-LOOP-4). The loop SHALL NOT be unbounded.
- **R-LOOP-4 (budget guard — concrete, free-loop):** The loop SHALL run **free on Groq** and SHALL assert **Gemini spend == $0** (no Gemini call in A2). The guard SHALL be: **(i)** the `maxIterations` cap; **(ii)** pacing against the **Groq 200,000-tokens/DAY free-tier window** (the real limit, read verbatim from the 429 body during judge calibration — *and shared across the owner's concurrent projects*, so the live loop is owner-aware + does not run heavy concurrent Groq jobs); **(iii)** the existing `assertWithinBudget` ($5) rail threaded as defense-in-depth (never trips on free Groq, so it is NOT the real guard — name this honestly). A live A2 run is **key-gated** (`judgeLiveEnabled()` / a Groq key) and auto-skips without the key.
- **R-LOOP-5 (same-family verify — DOCUMENTED LIMITATION, surface explicitly):** In A2 the **drafter is Groq `gpt-oss-120b` AND the reverse-faithfulness judge is Groq `gpt-oss-120b`** — *same-family*. This forgoes the cross-family self-preference mitigation of `R-ARCH-3` (`docs/spec-semantic-judge.md`), which has the Groq judge checking a **Gemini** drafter. This is inherent to "free loop on Groq, Gemini reserved for A3," **not** a design error. Therefore: **A2 asserts loop CONVERGENCE (machinery), NOT calibrated faithfulness metrics.** Maker≠judge still holds at the **process layer** (verify is a distinct control from draft); the **model-layer** independence (R-ARCH-3) is **restored at A3** when Gemini becomes the drafter and Groq judges cross-family. The spec, the ADR, and the trajectory docs SHALL state this caveat + the A3 restoration.
- **R-LOOP-6 (trajectory — observable + $0 REPLAY-recordable):** The loop SHALL emit a serializable **`TrajectoryStep[]`** (a **dedicated type**, NOT an overload of `AuditEntry.actor` — *audit = what happened to the record; trajectory = how the agent reasoned*). Each step SHALL carry `{ phase: "plan"|"draft"|"verify"|"reflect"|"redraft"|"route", iteration: number, toolCalls, modelMode, verdictSummary }`. The trajectory SHALL be **freezable to a fixture** served through the `getReplaySnapshot()` seam (mirroring `lib/data/live-samples.snapshot.json`), so the public REPLAY demo shows the self-correction at **$0**.
- **R-LOOP-7 (injection posture shared, not forked):** WHEN the draft boundary is generalized to call Groq, the post-generation injection-cut validation in `draftOutreach` (`MISSING_PLACEHOLDER` / `NAME_LEAK` / `UNRESOLVED_PLACEHOLDER`, `{{MERCHANT}}` substituted only after generation) SHALL be **shared** by the Groq path — not re-implemented — so the security posture cannot silently regress.

### 6.3 Acceptance — machinery (offline) vs detection (live)

**Offline = loop machinery (no spend, deterministic, the green-CI proof).** New test `evals/agent-loop.test.ts`:
- **R-LOOP-8 (machinery):** With an **injected `generate`** (mirroring `draft.ts` / `semantic-judge.ts` DI) returning a **planted-fabrication draft on iteration 0** and a **clean draft on iteration 1**, AND an **injected judge verdict** of `any_unsupported = true` on iter 0 / all-supported on iter 1 (*do NOT lean on `mockJudge` to detect — it is a keyword heuristic, not a detector; inject the failing verdict so the test isolates the loop*), the loop SHALL: flag iter-0, produce a reflection, re-draft, reach an all-supported verdict, route, and record a `TrajectoryStep[]` containing the correction. Convergence-given-a-failing-verdict SHALL hold on **100%** of seeded cases.
- **R-LOOP-9 (parity intact):** `evals/tools-differential.test.ts` + `evals/core-differential.test.ts` SHALL remain green (the loop adds no business logic to the deterministic tools).

**Live = detection power (free Groq, key-gated, auto-skips offline).** New test `evals/agent-loop.live.test.ts` (mirrors `evals/judge-calibration.live.test.ts`):
- **R-LOOP-10 (self-correction, the SC-3 evidence):** Over the **held-out planted-positive split** of `evals/gold/semantic-judge-gold.ts` (the 9 test-split judge-territory positives, per the R-CAL-7 tune/test discipline), the live loop SHALL **self-correct ≥ K unaided**. **Seeding mechanism (do not try to coerce the live drafter to fabricate on cue):** iteration-0 SHALL be the **planted gold-positive draft fed in as the starting draft**; the **live Groq judge** then verifies (catch), and the **live Groq re-draft** fixes it — so the test exercises *judge-catch + live-loop-fix* cleanly. Self-correction = (verify catches → reflect → re-draft → final all-supported), with the trajectory recorded. **K is a recall-style floor on the held-out split, its value fixed + recorded at the A2 GO/NO-GO** (defensible floor: a clear majority + margin, e.g. ≥7/9; the exact operating K is set on held-out data and recorded, never tuned on the test split). This measures the *integrated* loop (judge-catch + loop-fix); it is **convergence + same-family detection**, explicitly NOT a calibrated cross-family faithfulness metric (R-LOOP-5).
- **R-LOOP-11 (full verify):** `npm run verify:full` (typecheck + lint + tests + build + e2e) SHALL be green.

**Acceptance commands:**
```
node --env-file=.env node_modules/.bin/vitest run evals/agent-loop.test.ts        # offline machinery (always runs)
node --env-file=.env node_modules/.bin/vitest run evals/agent-loop.live.test.ts   # free Groq, key-gated, auto-skips offline
npm run verify:full                                                               # full green incl. e2e
```

### 6.4 DECISION task — orchestration framework (do NOT pre-decide)

The brief leaves **LangGraph.js vs the Vercel AI SDK** as **DECISION pending live eval + Codex**. This spec defines the **criteria + the spike**, not the pick.

- **R-LOOP-D0 (the decision):** Before the full A2 build, the system SHALL run a **one-merchant spike** of the loop skeleton and settle the framework against these criteria, then Codex-cross-check the choice:
  1. **License + free/OSS** — re-verify live (`RULES.md` §6). (`ai`/Vercel AI SDK is already a dependency at `^5.0.98`; LangGraph.js `@langchain/langgraph` would be NEW.)
  2. **Reuse / start-simple (`RULES.md` §7):** the `ai` SDK is already installed + used in `lib/agents/gemini.ts` + `semantic-judge.ts`; adding LangGraph is new surface — the lighter option that clears the bar wins.
  3. **Loop fit:** native support for verify→reflect→re-draft with conditional branching + a hard iteration cap.
  4. **Typed tools + Zod:** clean binding of the A1 tool registry.
  5. **Observability:** Langfuse integration + structured step capture.
  6. **REPLAY-recordability at $0 (advisor add):** can a run produce a serializable trajectory we freeze to a fixture through the `getReplaySnapshot()` seam? (LangGraph checkpointing vs the `ai` SDK step model differ here — this is a real discriminator.)
  7. **Agent/tool line + human gate auditable (advisor add):** can we cleanly mark which steps are agent-judgment vs deterministic-tool, and insert the human gate as an explicit stop? (maker≠judge fit.)
  8. **Bounded / no heavy runtime infra** (prototype-not-service).
- **Starting hypothesis (NOT a decision):** evaluate the already-present `ai` SDK first (criteria 1/2/8 favor it); escalate to LangGraph.js only if a criterion (notably 3/6) fails. The spike + Codex settle it; the outcome is recorded in `docs/decision-log.md` + ADR-002 (or a follow-up ADR).

### 6.5 Key files
**Create:** `lib/agents/loop/orchestrator.ts` (the agent + control flow), `lib/agents/loop/trajectory.ts` (`TrajectoryStep` type + recorder + fixture freeze), a Groq drafting path behind the **shared** provider boundary (generalize `lib/agents/gemini.ts`'s boundary pattern, or a sibling, reusing `GeneratedDraftSchema` + the shared injection-cut from R-LOOP-7), `evals/agent-loop.test.ts`, `evals/agent-loop.live.test.ts`, a recorded `lib/data/agent-loop.snapshot.json` (frozen at the GO/NO-GO). **Modify:** `lib/agents/draft.ts` (extract/share the injection-cut validation so both Gemini + Groq paths use it), `lib/replay/run.ts` (optional: surface the trajectory through the snapshot for A4). **Untouched:** `lib/core/*`, the oracle CSVs, the gold-set labels.

### 6.6 Dependencies & exit gate (owner GO/NO-GO)
**Blocked by:** A1 exit gate + R-LOOP-D0 (framework decided); **the LIVE milestone (R-LOOP-10) is ADDITIONALLY blocked by the P3 judge calibration clearing the held-out bar (AM-1) — until then A2 ships offline machinery only (R-LOOP-8/9).** **Exit gate = owner GO/NO-GO checkpoint** (NOT an automatic roll into A3): R-LOOP-8/9 green offline · R-LOOP-10 meets the recorded K on held-out + trajectory recorded · R-LOOP-11 (`verify:full`) green · the same-family caveat (R-LOOP-5) documented · trajectory fixture frozen + REPLAY-renderable at $0 · Codex changed-files review reconciled · `acceptance-gate` SHIP. **Then the owner decides GO (→ A3) / NO-GO (stop, reassess).**

---

## 7. Roadmap level — A3 / A4 / A5 / Track B / Phase 6  *(one paragraph each — detailed when reached)*

- **A3 — Multi-agent team.** Split the single A2 agent into the four bounded agents (Strategist/Planner · Drafter · **Domain Critic** · Router/Conductor), principled splits only (maker≠judge). **Gemini Flash becomes the final-draft author (<$5)** and the Groq judge now checks it **cross-family — restoring `R-ARCH-3`** (the model-layer independence A2 deferred). Component + trajectory evals per agent; the Domain Critic introduces the **Effective** axis (SC-2). *(Detailed when reached.)*
- **A4 — Observability & demo surface.** Langfuse (CORE) + an in-app "watch the agents reason" trajectory view rendering the recorded `TrajectoryStep[]` ($0 REPLAY). Folds the subsumed UI Stage-2 obligation: the console surfaces must also show the trajectory. *(Detailed when reached.)*
- **A5 — Live integration layer (transient demo).** Slack approval → idempotent email send (Resend/SMTP) → n8n run-on-demand glue — **no send without human approval**, suppression-aware. Since the public artifact is REPLAY-only, the **durable A5 deliverable is a recorded walkthrough** of the live flow. Phase-0/owner check: confirm A5's build cost is worth it given it won't live in the public demo (owner explicitly asked for these rails → likely yes). *(Detailed when reached.)*
- **Track B0 — Domain research sweep.** A researched, **source-cited** KB in `knowledge/domain/` + a source registry, gated by `guidelines-monitor`; multi-source (≥3 across ≥2 platforms), live-verified, honest "researched not credentialed" framing. *(Detailed when reached.)*
- **Track B1 — Domain rubric + gold set + calibrated cross-family domain judge.** The **Effective**-axis analogue of the faithfulness calibration (precision/recall/F1 + κ + flip-rate on an expert-sourced gold set). *(Detailed when reached.)*
- **Track B2 — Wire KB into agents + the domain judge into the ship gate.** KB informs tactics/tone/logic (NOT the factual path — RAG stays off the per-merchant facts); the domain judge becomes a ship gate. *(Detailed when reached.)*
- **Phase 6 — Convergence.** Eval-lock (trajectories + domain) → `acceptance-gate` → portfolio narrative → deploy the **REPLAY-only** public demo + the recorded live-flow walkthrough. *(Detailed when reached.)*

---

## 8. Task DAG — Phase 0 → A2 (ordered; `id · title · blocked-by`)

```
P0-1  Codex adversarial cross-check on the pivot (codex-guarded; verdict → docs/reviews/)   ← (plan approved)
P0-2  Record the 3 decision-log reversal rows                                                ← P0-1
P0-3  Author ADR-002-multi-agent-architecture.md                                             ← P0-1
P0-4  Sync state docs (PROJECT_STATE · CURRENT_TASK · HANDOFF · roadmap · task-log · journal) ← P0-2, P0-3
P0-5  [OWNER] Phase 0 cleared → toggle /autopilot + /goal "<ship condition>"                 ← P0-4
──────────────────────────────────────────── A1 ────────────────────────────────────────────
A1-1  lib/agents/tools/registry.ts + 7 thin tool wrappers (delegation only)                  ← P0-5
A1-2  evals/tools-differential.test.ts — Class A oracle parity (triage→core-draft/guardrail→send ≡ CSV) ← A1-1
A1-3  evals/tools-differential.test.ts — Class B wrapper-identity (diagnose/gate/judge/score) ← A1-1
A1-4  Green npm run verify + Codex changed-files review reconciled                            ← A1-2, A1-3
──────────────────────────────────────────── A2 ────────────────────────────────────────────
A2-D0 [DECISION] Framework spike (LangGraph.js vs ai SDK) on 1 merchant → criteria + Codex    ← A1-4
A2-1  Generalize/share the draft boundary for Groq + SHARE the injection-cut (R-LOOP-7)       ← A2-D0
A2-2  lib/agents/loop/trajectory.ts — TrajectoryStep type + recorder + fixture-freeze seam    ← A2-D0
A2-3  lib/agents/loop/orchestrator.ts — the verify-and-self-correct loop (R-LOOP-1..5)        ← A2-1, A2-2
A2-4  evals/agent-loop.test.ts — offline machinery (injected verdict; 100% convergence)       ← A2-3
A2-5  evals/agent-loop.live.test.ts — free Groq, key-gated, ≥K self-correct on held-out split ← A2-3
A2-6  Freeze lib/data/agent-loop.snapshot.json + prove $0 REPLAY-recordable trajectory        ← A2-4, A2-5
A2-7  Green verify:full + Codex review + acceptance-gate SHIP                                  ← A2-6
A2-8  [OWNER] GO/NO-GO checkpoint — GO → A3 ; NO-GO → stop + reassess                          ← A2-7
```

---

## 9. Ship gates (every detailed-phase artifact passes, in order)

**grill → codex (cross-model, via `~/claude-os/bin/codex-guarded`) → verify (`npm run verify` / `verify:full`) → enterprise+elegance → anti-slop**, then `acceptance-gate` SHIP/BLOCK. Owner-gated stops unchanged: commits/pushes · any live spend or send · public posting · anything irreversible/external · the `/autopilot` and A2-GO/NO-GO toggles.

---

## 10. Risks · open questions · plan ambiguities surfaced (for the orchestrator)

- **[A2 same-family verify — RESOLVED in-spec, flag to reviewers]** A2's drafter and judge are both Groq `gpt-oss-120b`. Handled by R-LOOP-5 (A2 proves *convergence/machinery*, not calibrated faithfulness; cross-family R-ARCH-3 restored at A3). A reviewer WILL probe this — it is named, not hidden.
- **[Plan ambiguity — K is unset]** The brief says "self-corrects ≥K planted false claims" without fixing K. This spec sets the **method** (recall-style floor on the held-out 9-item split, value recorded at the A2 GO/NO-GO, never tuned on the test split) and a **defensible default (≥7/9)**. *Owner/orchestrator to confirm the exact K at A2.*
- **[Plan ambiguity — framework]** Deliberately left a DECISION (R-LOOP-D0) with criteria + a spike, not pre-decided. The `ai` SDK is already installed (reuse/start-simple weight); LangGraph.js only if a criterion fails. *Outcome recorded at A2-D0.*
- **[Dependency — Groq 200K-tokens/DAY shared window]** The free-tier day-window is shared across the owner's concurrent projects and was exhausted during judge calibration. A2's live loop (calls × iterations × merchants) can exhaust it fast → R-LOOP-4 pacing + owner-awareness + no concurrent heavy Groq jobs. *This is an operational watch-out, not a blocker.*
- **[Freshness obligations (`RULES.md` §6)]** Re-verify at build time: Groq `gpt-oss-120b` non-deprecation + strict-output behavior; the chosen framework's current license; Gemini model id + pricing (for A3, not A2). Label anything not live-verified as UNVERIFIED.
- **[A5 cost-vs-value owner check]** A5's live rails won't live in the public REPLAY demo (only a recorded walkthrough will). The brief flags this as an owner confirm — surface it at the A4→A5 boundary.
- **[Honesty line — "domain expert"]** Track B must frame domain knowledge as *researched + source-cited* (+ owner judgment), never as a credentialed practitioner — consistent with the project honesty posture and the "enterprise claims must be researched" rule.
- **[Subsumed prior task]** The semantic-judge live calibration (P3, gated on a fresh Groq day-window) still completes — it **is** the Faithfulness-reverse tool A1/A2 depend on; and UI Stage-2 continues but must also surface the trajectory at A4. Keep both visible in state docs so they are not dropped.

---

## 11. A3 — Multi-agent team  *(DETAILED — 2026-06-26)*

**Stage:** A2 GO cleared → A3 = split the single A2 loop into the four bounded agents. **Owner decision (2026-06-26, AskUserQuestion): "Target the full 4"** — build Strategist/Planner · Drafter · Domain Critic · Router/Conductor as four LLM agents. **The bar the owner accepted (advisor cross-check, primary-model-final):** each named agent SHALL clear the **anti-theater line** (§1: "we do not dress pipeline stages in agent costumes") — a *named judgment seam* that demonstrably adds value over the deterministic counterpart it replaces — **or it is demoted to a tool/conductor and the public "4 agents" claim is corrected** (AM-2 / AM-7 honesty). The owner's own founding critique was "a pipeline with an LLM call"; the inverse failure (a deterministic conductor wearing an agent costume) loses the same credibility, and a Codex adversarial pass WILL probe it. So A3 builds 4 **and proves each seam**.

This phase is largely a **swap into seams the A2 orchestrator already exposes** (`recommend?` → Strategist, `draftGenerate?` → Gemini Drafter, `judgeGenerate?` → the reverse judge), plus the new Domain Critic + the LLM Router. The differential, `lib/core/*`, the oracle, the gold sets, and the frozen calibration/trajectory snapshots stay **UNTOUCHED**.

### 11.1 The four agents — model · judgment seam · anti-theater proof · I/O

1. **Strategist/Planner — Groq `gpt-oss-120b` (free).** *Seam:* synthesizes `engagement_state × blocker × root_cause × tenure × risk` into an **approach** — what to emphasize, which objection to pre-empt, tone calibrated to engagement — judgment the deterministic `diagnose().play` (a *routed touch*: channel/template) does not capture. *Anti-theater proof (R-A3-1):* a component eval on a labeled set showing the Strategist's recommendation **diverges from / adds to** `diagnose().play`, not merely restates it. *In:* the deterministic triage + diagnosis (engagement_state, blocker, root_cause_hypothesis, play.touch, tenure, risk) — **no eligibility authority**. *Out:* `Recommendation { route, strategy, tone, rationale }`, where `route` is **advisory** and constrained to the deterministically-allowed envelope (suppressed/ineligible ⇒ may only recommend suppress/hold). RECOMMEND-ONLY.
2. **Drafter — Gemini Flash (≤ $5, `assertWithinBudget` fail-closed).** *Seam:* generative prose composition (already agentic in spirit). *Cross-family change:* was Groq (`draftOutreachGroq`), now **Gemini** (`lib/agents/draft.ts draftOutreach`, live/mock). *In:* merchant claimable fields **via the `{{MERCHANT}}` injection-cut placeholder** + the Strategist's strategy/tone/angle + **KB §4.2 prevention rules** (R-A3-5) + (on re-draft) the Router's revision instruction. *Out:* `OutreachDraft` (subject/body/claims[]); the injection-cut + post-gen `MISSING_PLACEHOLDER`/`NAME_LEAK`/`UNRESOLVED_PLACEHOLDER` validation carry over.
3. **Domain Critic — Groq `gpt-oss-120b` (cross-family vs the Gemini Drafter).** *Seam:* the calibrated **Effective**-axis evaluative judgment (B1/B2 `lib/agents/domain-judge.ts`); introduces SC-2 into the loop. **ADVISORY** — never gates eligibility/send (locked in B2; the advisory-invariant red-green test stays). *In:* the draft + the merchant **situation** (engagement_state, blocker) — **withholds `diagnose().play`** (R-DARCH-2 no-answer-leakage). *Out:* `DomainJudgeResult` (3 per-dim verdicts: matched-to-blocker · engagement-appropriate · no-over-promise + overall `domain_defective` + rationale). **Independent:** formed WITHOUT the faithfulness verdict as input.
4. **Router/Conductor — Groq `gpt-oss-120b`.** *Seam (THE anti-theater crux the owner accepted):* reads **both** critics' verdicts (faithfulness failures [gating] + domain dimensions [advisory]) and forms a **prioritized, concrete revision strategy** — which fix first, how to reconcile a faithfulness-fail against a domain-weak signal, whether the issue is redraft-fixable vs hold-for-human-with-reason — plus the final **route recommendation** + the human-facing rationale. This is real synthesis the deterministic `buildReflection` (single-failure string assembly) does not do. *Anti-theater proof (R-A3-1):* a component eval on **multi-failure** cases where the LLM Router produces a more targeted revision than `buildReflection`; **RECOMMEND-ONLY** — the send transition stays the deterministic `simulate_send` + `assertEligibilityUntouched` (R-A3-3). *Fallback (honest):* if the Router cannot beat `buildReflection`, it is demoted to the deterministic conductor and the count claim drops to "3 agents + a conductor."

### 11.2 Data contracts (the seams that keep the Critic advisory + independent)
- **Strategist → Drafter:** strategy/tone/angle/rationale (never eligibility).
- **Drafter → critics:** the `OutreachDraft` goes to BOTH the Faithfulness check (forward gatekeeper tool + reverse Groq judge) AND the Domain Critic — **in parallel, independent**.
- **Domain Critic ⊥ Faithfulness:** neither sees the other's verdict before forming its own.
- **Both critics → Router:** faithfulness verdict (**gating**: 0 unsupported reaches approved) + domain verdict (**advisory**). Router emits either a revision instruction (→ Drafter re-draft) or a route recommendation + rationale; the deterministic `simulate_send` executes the send.

### 11.3 §4.2 wiring (the owner's 2026-06-26 defense-in-depth decision)
KB §4.2 prevention rules → the **Drafter prompt** (prevention half: avoid over-promising up front). **Guardrail (R-A3-5):** KB informs *tactics / tone / what-not-to-claim only* — it **never** enters the per-merchant factual path (RAG stays off the facts; Track-B2 note). The **detection** half (the `no_over_promise` domain dimension) already ships in B2.

### 11.4 New EARS requirements
- **R-A3-1 (Ubiquitous — anti-theater bar):** Each of the four named agents SHALL carry a documented judgment seam **and** a component eval demonstrating it adds value beyond its deterministic counterpart. Any candidate that fails its anti-theater eval SHALL be demoted to a deterministic tool/conductor and the "N agents" claim corrected (AM-2 / AM-7).
- **R-A3-2 (Ubiquitous — cross-family restored):** The Drafter SHALL be Gemini Flash; **both** the reverse-faithfulness judge **and** the Domain Critic SHALL be Groq `gpt-oss-120b` — maker≠judge at the **model** layer (`R-ARCH-3` restored, the independence A2 deferred under R-LOOP-5).
- **R-A3-3 (Ubiquitous — recommend-not-decide preserved):** `assertEligibilityUntouched` SHALL wrap the multi-agent route unchanged; R-LOOP-1b/8b SHALL stay green; **no agent — including the Router — SHALL** move `contact_eligible`/`review_required`/`approval_state`/`send_eligible` or force `simulated_sent`.
- **R-A3-4 (Ubiquitous — Domain Critic advisory + independent):** The Domain Critic's verdict SHALL NOT gate eligibility/send, SHALL be formed without the faithfulness verdict as input, and SHALL withhold `diagnose().play` (R-DARCH-2).
- **R-A3-5 (Ubiquitous — §4.2 prevention wiring):** KB §4.2 prevention rules SHALL be wired into the Drafter prompt; the KB SHALL NOT enter the per-merchant factual path; the `no_over_promise` detection dimension stays in the domain judge.
- **R-A3-6 (Ubiquitous — trajectory agent attribution):** `TrajectoryStep` SHALL carry an `agent` attribution (`strategist|drafter|domain_critic|router|tool`) so the frozen $0 REPLAY snapshot shows the four specialists (the A4 "watch the agents reason" payoff).
- **R-A3-7 (Event-driven — Gemini live = consequential paid pick):** WHEN the Drafter is run live, the system SHALL gate it on **owner sign-off + a live date-anchored Gemini model-id/pricing freshness check (`RULES.md` §6) + a Codex cross-check**, SHALL respect the $5 cap (sized as demo-set × `maxIterations` × Flash price — the Drafter runs **every re-draft**), and SHALL ship offline machinery (mock/DI, $0) FIRST. "Any live spend" is an owner-gated stop independent of the $5 cap.
- **R-A3-8 (Ubiquitous — directional label held):** A3 SHALL NOT upgrade the judges' "calibrated — directional, pending the ~100 floor" label on the basis of running inside the multi-agent loop. The Domain Critic + faithfulness judge were calibrated over the **synthetic gold set**, not over live **Gemini** prose (a new draft distribution) — note this in `docs/domain-calibration-status.md` + `docs/judge-calibration-status.md`.
- **R-A3-9 (Event-driven — K re-set for A3):** WHEN the A3 live self-correction milestone runs, the floor **K** SHALL be re-pinned on a fresh held-out split (the stronger Gemini drafter changes the error distribution); value recorded at the A3 live gate, **never** tuned on the test split.

### 11.5 Build DAG (per-agent slices; each gated: `npm run verify` green → Codex changed-files review via `codex-guarded` reconciled primary-model-final → `acceptance-gate` SHIP; record in `docs/reviews/`)
```
A3-0  [DESIGN/PLAN] this §11 + decision-log row + advisor cross-check + OWNER GO "full 4"   ← (B2 done)   ✅
A3-1  Trajectory `agent` attribution (R-A3-6) — small, enabling, offline ($0)                ← A3-0   ✅ DONE 2026-06-27 (verify 257+4; Codex BLOCK→2 reconciled+red-green-locked; gate 1/2/4/5 PASS + gate-3 SHIP; uncommitted/owner-gated)
A3-2  Strategist agent (Groq; DI/mock offline) + component eval vs diagnose().play (R-A3-1)   ← A3-1   ✅ DONE 2026-06-28 (a: machinery + Codex BLOCK→4 reconciled→SHIP, committed 32da7b1; b: live $0 confirmatory eval cleared the anti-theater FLOOR, committed ded2205/c56c4c0; floor-not-ceiling → `strategist` label DEFERS to A3-3, count = "3 + a candidate")
A3-3  Drafter→Gemini cross-family OFFLINE machinery (mock/DI) + §4.2 prevention wiring (R-A3-5,2) ← A3-1   ✅ DONE 2026-06-28 (verify 279+5; cross-family enforced — Gemini drafts ⊥ Groq judge gated on resolvedJudgeProvider==="groq"; metered drafter $5 ledger + UNKNOWN_USAGE fail-closed [red-green]; §4.2 DOMAIN_HONESTY_RULES off the facts path; Codex BLOCK→6 reconciled primary-model-final→confirming SHIP; acceptance-gate 5/5 SHIP; uncommitted→commit owner-authorized via RESUME DIRECTIVE, push HELD)
A3-4  Domain Critic as 2nd critic in VERIFY (Groq, advisory, independent; R-A3-4)             ← A3-3   ⏳ BUILT + COMMITTED TEST-VERIFIED (gate-2 Codex named-open) 2026-06-28 (judgeDomain wired into VERIFY as the 2nd critic — advisory [never gates send: red-green], independent [no faithfulness input; withholds diagnose().play], gatekeeper-gated, cross-family Groq enforced incl. resolvedDomainJudgeProvider()==="groq" + a fail-closed throw on a forced live:true that isn't FULLY-DI'd cross-family-ready; verify 285+5. ANTI-THEATER EVAL: live judge TIES mockDomainJudge on the held-out gold (both F1 1.00) → FLOOR-not-ceiling → `domain_critic` label DEFERS [step stays "tool", like the Strategist]; count = "drafter earned + Strategist/DomainCritic deferred". Codex round-1 BLOCK→6 reconciled; round-2 confirming found 1 residual P1 (partial-DI hole) → patched [||→&& fully-injected-DI] + 3-case regression; round-3 re-confirm SEAT-BLOCKED (~7:25 PM) = DATED OBLIGATION. acceptance-gate = gates 1/3/4/5 PASS, gate-2 named-open until round-3 returns → flips SHIP 5/5 then)
A3-5  Router/Conductor agent (Groq) — LLM reflection/route synthesis + eval vs buildReflection (R-A3-1) + R-LOOP-8b red-green ← A3-2, A3-4   ⏳ BUILT + TEST-VERIFIED (gate-2 Codex named-open) 2026-06-28 (`lib/agents/router.ts`: strongReflection [strong multi-critic baseline + demotion fallback — reads BOTH critics, prioritizes faithfulness-gating then surfaces the advisory domain dimensions] + routerReflect [Groq gpt-oss-120b, DI/mock, recommend-only, route CLAMPED, honest fallback, no name-injection]; orchestrator `reflect?: RouterFn` seam [default = domain-blind defaultReflect, NO loop behavior change] + RevisionPlan/RouterFn/CriticSignal types + buildReflection exported as the RED baseline; reflect step gets a defensive merchant clone + records the ADVISORY route [recommend-only — RECORDED, never wired]. ANTI-THEATER EVAL: RED buildReflection [domain-blind] misses domain_defective on a multi-failure case → GREEN strongReflection [reads both] covers it as a strict SUPERSET → DEFER the mock Router ties strongReflection structurally → `router` label DEFERS [reflect step stays "tool"]. The defer is STRUCTURALLY FORCED: every offline discriminator is a finite axis a deterministic table reproduces; an LLM earns only on an open-ended-quality axis scored by a CROSS-FAMILY Gemini judge ⇒ live ⇒ A3-7. verify 295+5; differential 20/20 UNTOUCHED; clone red-green proven [drop the reflect clone ⇒ mutation-isolation test trips R-LOOP-1b]. Codex changed-files review SEAT-BLOCKED (~7:25 PM) = DATED OBLIGATION batched with A3-4 round-3. acceptance-gate = gates 1/3/4/5 PASS, gate-2 named-open → flips SHIP 5/5 when batched Codex returns. **REALIZED COUNT: all four agents BUILT; "1 earned (Drafter) + 3 deferred (Strategist · Domain Critic · Router)"** — the anti-theater bar (AM-7) working as designed, each non-Drafter agent tying its strong deterministic counterpart on the finite structural axis. records docs/reviews/{codex,gate}-2026-06-28-a3-5*.md + a3-5-verify-evidence.log)
A3-6  Multi-agent orchestrator wired + $0 agent-attributed trajectory fixture + verify:full   ← A3-5
A3-7  [OWNER-GATED] live cross-family run (key + $5 + Gemini freshness + Codex; R-A3-7) → re-pin K (R-A3-9) → freeze fixture ← A3-6
A3-8  Codex changed-files review reconciled + acceptance-gate SHIP (per slice + the phase)    ← A3-7
```
**Cost shape (R-A3-7):** the Drafter is the only paid agent and runs on every re-draft (≤ `maxIterations` Gemini Flash calls/merchant) — near-certainly fine at Flash pricing, but sized explicitly against $5 at the live gate. **Offline-first:** A3-1..A3-6 are mock/DI, $0; only A3-7 spends, owner-gated.
