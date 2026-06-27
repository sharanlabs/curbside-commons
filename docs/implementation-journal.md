# Implementation Journal

The engineering record. Every **meaningful** task gets an entry: meaningful decisions, failures, tradeoffs, and corrections.

- Small edits → `docs/task-log.md` instead.
- Major architecture decisions → also `docs/decision-log.md`.

Newest entries on top.

## Entry template

```
## [YYYY-MM-DD] [Task ID] — [short title]

- What changed:
- Why it changed:
- Challenge or failure that appeared:
- Why it happened:
- How it was diagnosed:
- Options considered:
- Final fix:
- Why this fix:
- How it was implemented:
- How it was verified:
- Prevention step for the future:
- Files changed:
- Reviewer notes (Codex / human):
- Human decision:
```

---

## 2026-06-26 Track B2 — wire the domain judge into the REPLAY ship-gate as the tertiary ADVISORY control

- What changed: Wired the calibrated domain judge into the REPLAY snapshot as the tertiary control (R-DARCH-4: gatekeeper → faithfulness → domain), `$0` deterministic mock, surfaced + audited like the faithfulness `judge` field. `ReplayMerchant.domainJudge` (gated on `gatekeeper.approvedForHumanReview`, parallel to faithfulness — NOT chained on faithfulness-pass), a `"domain"` `AuditEntry` actor (after `judge`, before `eval`), and a Merchant-Detail "5 · Domain quality check" panel (Eval→6/Human→7/Audit→8).
- Why it changed: Track B2 of the multi-agent roadmap — the domain judge existed + was calibrated (B1) but wasn't in the ship-gate. The §4.2 owner decision (keep `no_over_promise` as a gating domain dimension = detection; feed KB §4.2 into the A3 drafter = prevention) needed B2 to wire the detection half.
- Challenge or failure that appeared: (1) widening `AuditEntry.actor` with `"domain"` broke typecheck in `lib/agents/loop/orchestrator.ts` + `evals/tools-differential.test.ts`. (2) My panel copy said a weak draft is "never auto-sent" — but the slice's own test proves domain-defective drafts are still `simulated_sent`. (3) The §4.2 dimension `no_over_promise` fires 0/20 in REPLAY, so the headline non-redundancy claim was asserted, not demonstrated.
- Why it happened: (1) the A1 `append_audit` tool schema (`AuditEntrySchema`) "Mirrors AuditEntry" but had hardcoded the old actor enum; widening the canonical type broke the mirror's assignability. (2) "never auto-sent" describes the OPPOSITE of advisory — an advisory judge does not gate the send; I conflated "doesn't auto-approve" with "blocks the send." (3) the deterministic stub drafts carry no hype, so `no_over_promise` never trips on the REPLAY set; my test only asserted the dimension is present.
- How it was diagnosed: (1) typecheck output pointed at the narrow target → grep traced it to `schemas.ts:173`. (2) Codex surfaced it mid-review (read the parallel faithfulness test, saw the contradiction with the B2 advisory test). (3) advisor caught it at the completion checkpoint; the distribution probe confirmed `no_over_promise=P` on all 20.
- Options considered: (1) suppress the type vs fix the mirror → fix the mirror (it is documented to mirror the canonical type). (2) soften vs rewrite the copy → rewrite to the truth (advisory; surfaced + recorded; never changes the send). (3) leave §4.2 retention-only vs demonstrate it → demonstrate (it is the slice headline + the Codex §4.2 cross-check anchor).
- Final fix: (1) added `"domain"` to `AuditEntrySchema`'s enum (restores the mirror). (2) panel + audit-detail reworded to "advisory — surfaced for review; does not change the send or eligibility," plus a stub-draft framing for the 75% flag rate. (3) added a `replay.test.ts` test: a grounded draft + implied-typicality hype where the gatekeeper APPROVES + faithfulness PASSES + ONLY `no_over_promise` FAILS.
- Why this fix: each is the honest/root-cause option — the mirror stays a mirror; the copy matches the proven behavior; the §4.2 headline is demonstrated, not asserted.
- How it was implemented: add-alongside the existing faithfulness `judge` wiring; `outreachStatus: m.outreach_status` left untouched (the advisory invariant holds by construction — it comes from `runCore`, before any judge).
- How it was verified: `npm run verify` green = 255 + 4 skipped (exit 0); differential 20/20 (`lib/core`+oracle+gold+frozen snapshot untouched, per `git diff --name-only`); e2e 4/4. **Red-green** for the advisory invariant: a mutation making `outreachStatus` depend on `domain_defective` turns the "is ADVISORY" test RED (`replay.test.ts:79`), restore → GREEN. Non-vacuous: 3 merchants are `domain_defective` yet `simulated_sent`.
- Prevention step for the future: when widening a canonical type, grep for "Mirrors <Type>" schemas that must move in lockstep. When wiring an advisory control, write the non-vacuous "flagged-yet-proceeded" assertion FIRST (it is the binding invariant). Don't ship a "kept the dimension" claim without a test that exercises the dimension catching something.
- Files changed: `lib/replay/run.ts`, `lib/agents/tools/schemas.ts`, `lib/agents/domain-judge.ts` (comment-only), `app/merchant/[id]/page.tsx`, `evals/replay.test.ts`, `evals/e2e/console.spec.ts`.
- Reviewer notes (Codex / human): `acceptance-gate` = BLOCK (procedural — no hard P0/P1; all 5 invariants honored on its read + advisor agreed); gate-3 cleared with red-green; 3 non-blocking items fixed. Codex changed-files review ran + surfaced 1 finding (the "never auto-sent" copy → fixed primary-model-final), then seat-limited → the complete review + §4.2 cross-check are a DATED OBLIGATION. Record: `docs/reviews/gate-2026-06-26-b2-domain-shipgate.md`.
- Human decision: commit-GO + the Codex re-run are owner-gated (pending).

---

## 2026-06-26 Track B1 — Codex cross-model gate RAN + reconciled → "calibrated — directional"; 2 P2 live-path fixes

- What changed: Ran the mandatory Codex cross-model gate over the full B1 diff (`--base 07e9a55`, gpt-5.5 @ xhigh, session `019f0571`); reconciled its 2 P2 code findings (both fixed + test-locked); flipped the docs "directional / pending Codex" → "calibrated — directional, pending the ~100 floor."
- Why it changed: B1d cleared the bar + eval-locked, but the mandatory Codex gate was the one open item (had been seat-blocked → dated obligation). The seat reset; R-DHON-3 binds the "calibrated" claim to the gate.
- Challenge or failure that appeared: (1) Codex came back PURELY mechanical — 2 P2 code bugs, zero engagement with the n=18/synthetic honesty claim. (2) B1-1: the live judge accepted a schema-valid PARTIAL verdict (`DomainVerdictSchema` is `.min(1)`), computing `domain_defective` from the subset — an omitted FAILED dimension read as passing (a recall hole in a recall-favoring control). (3) B1-2: liveness read the faithfulness `JUDGE_PROVIDER`, not the domain judge's own `DOMAIN_JUDGE_PROVIDER` — the documented override was misrouted.
- Why it happened: (1) `codex review` audits code, not prose — so it neither corroborates nor refutes the honesty framing (I initially over-read its silence as "corroborating"; advisor corrected it); (2) the dims guard only checked the zero-length case; (3) the domain judge reused the faithfulness env predicate instead of its own namespace.
- How it was diagnosed: read the judge + env-flags + the live runner against each finding; confirmed both real on the merits; confirmed the calibration ran via explicit `live:true` / default-groq, so neither fix alters the frozen snapshot.
- Options considered: (a) flip on the current evidence vs (b) a focused honesty-only Codex follow-up — advisor tie-break: SKIP (b) (a code-scoped pass on perfect-1.0 synthetic gold only re-surfaces documented caveats and lands on "directional"); keep the label hedged instead.
- Final fix: B1-1 → require all 3 rubric dimensions after normalize, else fail closed to the deterministic mock (`INCOMPLETE_VERDICT`). B1-2 → new `domainJudgeLiveEnabled()` (reads `DOMAIN_JUDGE_PROVIDER`) in the env single-source-of-truth, used by the liveness default + the real-call boundary; the live runner's skip-gate aligned to it.
- Why this fix: matches the file's existing fail-closed/fallback pattern + the env single-source-of-truth; minimal blast radius (the domain judge isn't app-wired until B2).
- How it was implemented: `lib/server/env-flags.ts` (+`domainJudgeLiveEnabled`), `lib/agents/domain-judge.ts` (import + 2 liveness checks + the completeness guard + a stale comment), `evals/domain-calibration.live.test.ts` (skip-gate), `evals/domain-judge.test.ts` (+7 lock tests).
- How it was verified: `npm run verify` green = **250 + 4 skipped** (was 243); the eval-lock + all calibration tests still green; `lib/core` / oracle / gold / frozen-snapshot UNTOUCHED.
- Prevention step for the future: when reusing a sibling control's env predicate, give the new control its OWN namespaced predicate; when accepting a structured multi-part verdict, require completeness (fail closed), never compute from a partial subset. Carry the same fail-closed rule into B2 when the domain judge is wired into the agent loop (mirrors the A2-1 "FAILED_TO_FALLBACK excluded from verifyPassed" fix).
- Files changed: `lib/agents/domain-judge.ts`, `lib/server/env-flags.ts`, `evals/domain-judge.test.ts`, `evals/domain-calibration.live.test.ts`, `evals/domain-calibration.lock.test.ts`, `docs/domain-calibration-status.md`, `docs/reviews/codex-2026-06-26-b1-domain-judge.md` (new), `docs/reviews/gate-2026-06-26-b1d-live.md`, `docs/reviews/gate-2026-06-26-b1-offline.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`, this journal.
- Reviewer notes (Codex / human): Codex gpt-5.5 @ xhigh; `docs/reviews/codex-2026-06-26-b1-domain-judge.md`. Advisor ×3 (gate approach · flip tie-break + record-softening · coherence).
- Human decision: owner GO via "continue" (2026-06-26) → committed; the public-claim change ("calibrated" entering the honesty-sensitive docs) is owner-approved. Push remains owner-gated (not pushed).

---

## 2026-06-26 Track B1d — LIVE domain-judge calibration: RAN + CLEARED (directional); acceptance-gate BLOCK→reconciled

- What changed: Ran the live cross-family Groq `gpt-oss-120b` domain judge over the 36-item synthetic gold set (K=3, temp 0, $0, 36/36 LIVE_JUDGE, 0 fallbacks). Held-out recall/precision/F1 1.00 (CI95 [0.76,1.00], n=18), per-dim recall 1.00 each, κ 1.00, flip 0.00 — clears all seven pre-registered thresholds. Eval-locked (`evals/domain-calibration.lock.test.ts`, R-DHON-4) + date-stamped the frozen snapshot. Commit `1fcb492`.
- Why it changed: B1d is the live half of the calibration; the bar was pre-registered offline (B1c). Owner: "Run B1d now."
- Challenge or failure that appeared: (1) one-shot/day budget — Groq free tier ~200K tok/day, the run needs ~100K, and the strict-output→fallback failure mode BILLS while failing (P3 burned a day's budget this way). (2) The result was PERFECT (κ=1.0, flip=0.0) — also the exact signature of an R-DARCH-2 tautology/leak. (3) The acceptance-gate BLOCKed: the eval-lock result was committed before the claiming docs were flipped → the repo momentarily told two contradictory stories (RULES §1).
- Why it happened: (1) Groq daily budget is hard + shared; (2) perfect scores on a small synthetic set are inherently suspect and must be RULED leak-free, not trusted; (3) I sliced the commit (eval-lock first, docs next) and the gate ran between slices.
- How it was diagnosed: (1) advisor recommended a 1-call smoke before the full run; (2) advisor flagged κ=1.0+flip=0.0 as the leak signature → read `effective-rubric.ts` (`domainSituation()` withholds `.play`) + the recorded rationales (they isolate the right dimension; the engagement cross-dim bleed is the fingerprint of real reasoning) → leak ruled out; (3) the acceptance-gate read the committed repo and caught the status-doc contradiction.
- Options considered: (1) run blind [rejected — budget risk] vs smoke-first [chosen]; (3) prepend-new-block vs flip-claims-in-place [flipped the contradictory claims in place + prepended PROJECT_STATE per its convention].
- Final fix: the smoke protected the budget (the full run then ran clean); leak ruled out by reading source + rationales BEFORE eval-locking; the doc contradiction reconciled across status + state docs to one story (template: `docs/judge-calibration-status.md`).
- How it was verified: `npm run verify` green (243 + 4 skipped); the eval-lock test passes against the frozen snapshot; acceptance-gate re-gate requested on the reconciled docs.
- Prevention step for the future: flip the claiming docs in the SAME commit as a ship-gating result (don't slice result-then-docs); for any perfect calibration, run the leak-check (read the situation payload + the rationales) before eval-locking; smoke ONE live call before any metered batch.
- Other decisions: engagement per-dim precision 0.5 (cross-dim bleed on generic drafts) carried to the B2 §4.2 / dimension-redundancy decision; "RAN + CLEARED (directional)", NOT "calibrated" until Codex + the ~100 floor (R-DHON-3).
- Files changed: `lib/data/domain-calibration.snapshot.json`, `evals/domain-calibration.lock.test.ts` (`1fcb492`); `docs/domain-calibration-status.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`, `docs/reviews/gate-2026-06-26-b1d-live.md` (this commit).
- Reviewer notes (Codex / human): acceptance-gate = engineering SHIP + doc-coherence BLOCK→reconciled. Codex cross-model gate SEAT-BLOCKED (usage limit, ~3:27 PM) → dated obligation (`--base 07e9a55` covers the full B1 diff).
- Human decision: pending — surface results + the Codex dated obligation; flip "directional"→"calibrated" only after Codex APPROVEs.

---

## 2026-06-26 Track B1 — domain-quality "Effective"-axis judge (OFFLINE MACHINERY)

- What changed: Built the Effective-axis analogue of the P3 faithfulness judge — a KB-cited rubric (`lib/domain/effective-rubric.ts`), a per-dimension mock+live Groq judge (`lib/agents/domain-judge.ts`), a 24-positive/12-negative gold set (`evals/gold/domain-gold.ts`), a harness (`evals/gold/domain-harness.ts`), an offline calibration test (`evals/domain-calibration.test.ts`), a key-gated live runner (`evals/domain-calibration.live.test.ts`), the spec (`docs/spec-domain-judge.md`), and the pre-registered bar (`docs/domain-calibration-status.md`). 5 committed slices `db72461`→`e201eee`.
- Why it changed: B0 gave Faithful (claims true to data); the ship bar needs Effective (good domain practice — SC-2). Owner: "continue building as per our plan."
- Challenge or failure that appeared: (1) the calibration-TAUTOLOGY trap — if the judge is fed `diagnose().play` (the correct play), calibration measures a string-compare, not a judge. (2) The R-DCAL-1 enforcement caught a mis-constructed gold item: a clean re-engagement negative said "once you're live", which the tense-aware state check read as a near-completion claim (state_mismatch) → gate-caught.
- Why it happened: (1) the obvious-but-wrong design is to give the judge the answer; (2) hand-authored gold prose can trip deterministic guardrails in ways only a live run surfaces.
- How it was diagnosed: the advisor (before authoring) named the tautology trap as make-or-break + the marginal-value enforcement as essential; the offline test's LIVE R-DCAL-1 partition (`domainTerritoryViolations()`) surfaced the bad gold item exactly as P2's R-CAL-1 did.
- Options considered: (1a) feed the play and string-compare [rejected — wrapper, not a judge]; (1b) situation-in (engagement_state + blocker + facts) + the rubric standard, judge infers fit cold [chosen, R-DARCH-2]. (2) reword the negative to "going live" [chosen] vs drop it.
- Final fix: `domainSituation()` surfaces facts only and deliberately omits `.play`/`.root_cause_hypothesis`; an R-DARCH-2 lock test asserts the prompt never leaks the tactic vocabulary. The gold item reworded; the harness enforces gate-pass + faithful per item, so any future bad item fails the build.
- How it was verified: `npm run verify` green (236 + 4 skipped); the R-DCAL-1 enforcement + the situation-in lock are committed tests.
- Prevention step for the future: the marginal-value enforcement (gate-pass + faithful, live per item) is now a standing pattern for any reverse-of-an-axis judge — it makes "is this a pure residual?" a build-time assertion, not a claim.
- Other decisions: §4.2 (over-promise) isolated to implied/typicality phrasing that dodges the regex + reported per-dimension (its production redundancy vs the faithfulness judge is carried as an explicit B2 decision); platform-side escalation DEFERRED not faked (diagnosis.ts emits only merchant_side). All positives synthetic + labeled; the pre-registered bar pinned before any number.
- Files changed: see the 5 commits + `docs/reviews/gate-2026-06-26-b1-offline.md`.
- Reviewer notes (Codex / human): acceptance-gate = SHIP (offline machinery). Codex changed-files review SEAT-BLOCKED (usage limit) → dated obligation folded into the B1d Codex gate.
- Human decision: live calibration + eval-lock + Codex gate are owner-gated (B1d); no "calibrated" claim ships before the bar clears (R-DHON-3).

---

## 2026-06-25 MULTI-AGENT PIVOT — Phase 0: Codex gate → BLOCK → reconciled (governance only)

- What changed: Executed Phase 0 of the owner-approved multi-agent pivot (no product code). Ran the mandatory Codex adversarial cross-check (BLOCK, 9 findings) + reconciled all 9; authored ADR-002; recorded the pivot + 3 decision-log reversals; amended the execution spec (§0 binding AM-1..AM-8 + new R-LOOP-1b/8b); synced state docs; launched a confirming Codex pass.
- Why it changed: the owner re-judged the near-ship product as "a pipeline with an LLM call" and approved elevating it into a bounded, HITL, eval-gated multi-agent verify-and-self-correct system; Phase 0 is the gated checkpoint before any build.
- Challenge or failure that appeared: Codex BLOCKed — the load-bearing finding (#1) is that the pivot's whole "catches its own mistakes" identity rides the semantic judge, whose calibration is PAUSED (no held-out metrics yet). Two findings (#6 recommend-not-decide, #7 Groq availability rail) caught real gaps I'd under-specified.
- Why it happened: the plan implied a working detector and used "decides" routing language; the Gemini budget rail had no Groq analogue. The pivot's ambition outran what is yet proven.
- How it was diagnosed: advisor (pre-work) flagged the unproven catcher + the reversal-(c) mis-framing + commit hygiene; the Codex adversarial pass (armed with current state + the decision-log rows) confirmed + sharpened; the primary model formed an independent APPROVE-WITH-CONDITIONS (C1–C6) read first, then reconciled.
- Options considered: (a) rubber-stamp the owner-approved pivot; (b) primary-model-final — independent read + run the gate + reconcile each finding with evidence. Chose (b).
- Final fix: all 9 reconciled as binding CONDITIONS, not direction changes — P3 calibration a hard A2 prerequisite (AM-1); agent recommends-only + test-locked eligibility/send (AM-4 / R-LOOP-1b/8b); A2 = single-agent convergence-only spike (AM-2/3); scope sequenced to P3+A1+A2 (AM-6); honesty language (AM-7); reversal-(c) reframed as a satisfied §3 precondition (AM-8); a Groq availability rail (AM-5).
- Why this fix: it tightens the plan toward the project's own constraints (honesty, deterministic-first, portfolio scope) without abandoning the owner's approved direction — the governed-agency version.
- How it was implemented: `docs/reviews/codex-2026-06-25-multiagent-pivot.md` (verdict + reconciliation table), `ADR-002`, `docs/decision-log.md` (4 rows), `docs/plan-multi-agent-execution.md` §0 amendments, + the PROJECT_STATE/CURRENT_TASK/HANDOFF/roadmap/task-log sync.
- How it was verified: a confirming Codex pass on the reconciled artifacts (running); the §4.2 acceptance checklist; `git status` confirms docs/governance-only (no `lib/`/`app/`/`evals/`).
- Prevention step for the future: the binding build preconditions live in the spec + ADR, so A1/A2 cannot silently re-introduce the unproven-catcher or recommend-vs-decide issues.
- Files changed: `docs/reviews/codex-2026-06-25-multiagent-pivot.md` (new), `docs/decisions/ADR-002-multi-agent-architecture.md` (new), `docs/decision-log.md`, `docs/plan-multi-agent-execution.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/roadmap.md`, `docs/task-log.md`, this journal.
- Reviewer notes (Codex / human): Codex `gpt-5.5`@`xhigh` BLOCK → reconciled; confirming pass running. advisor shaped the approach pre-work.
- Human decision: owner toggles `/autopilot` + `/goal` + approves the commit (pending).

## 2026-06-22 REBUILD/JUDGE — P3: live Groq judge wired + calibration run (owner key; free tier)

- What changed: Wired the live cross-family Groq `openai/gpt-oss-120b` judge (`@ai-sdk/groq`, strict structured outputs + `reasoningEffort: "low"`) in `lib/agents/semantic-judge.ts`; built the key-gated calibration runner `evals/judge-calibration.live.test.ts`; calibrated the judge prompt (platform-name grounding); lowered `MAX_JUDGE_OUTPUT_TOKENS` to 1024. Offline suite green (192 + 2 skipped). Honest status doc `docs/judge-calibration-status.md`.
- Why it changed: P3 of the approved plan — the owner provided a free `GROQ_API_KEY` (the owner-gated stop), so the live calibration could run.
- Challenge / failure: The live calibration kept degrading to fallback. I twice inferred the cause from rate-limit HEADERS (TPM 8000) and "fixed" pacing/concurrency — and was WRONG both times. An advisor review forced me to read the actual 429 BODY, which named the real limit: tokens-per-day = 200,000, used 199,981 — I'd exhausted today's budget across 5 debugging runs.
- Why it happened: I read headers off 200-responses and pattern-matched to TPM; the binding bucket (TPD) only appears in the 429 body, which I hadn't printed. Classic "inferred a finding instead of reading it."
- How it was diagnosed: A raw `fetch` printing status + `.text()` together on a throttled call surfaced the verbatim TPD error; a second probe proved `reasoningEffort: "low"` still catches every planted fabrication at ~half the tokens.
- Options considered: (a) declare "free tier can't sustain it" and checkpoint on a guess; (b) read the 429 body + try the reasoning-effort lever before concluding. Chose (b) — it changed the conclusion from "can't" to "today's budget spent; ~30K of 200K needed on a fresh window."
- Final fix: `reasoningEffort: "low"` (validated to discriminate) + `MAX_JUDGE_OUTPUT_TOKENS` 1024 + sequential pacing make a full run cheap; the one clean run just needs a fresh daily window. Precision finding (platform-name false-positives) root-caused + fixed in the prompt.
- Honesty (R-HON): No "calibrated, metrics = X" claim shipped — the pre-fix run's numbers are NOT enshrined (the snapshot had true-negative inflation + is superseded; backing artifact deleted). Status doc documents the finding qualitatively + quotes the real limit verbatim.
- Files changed: `lib/agents/semantic-judge.ts`, `evals/judge-calibration.live.test.ts`, `evals/semantic-judge.test.ts` (prompt-assert sync), `package.json`/`package-lock.json` (@ai-sdk/groq), `docs/judge-calibration-status.md` (+ state docs).
- Reviewer notes: Two advisor reviews shaped this — (1) before P2, the math-vs-judge-quality separation; (2) here, "read the 429 body, don't enshrine run-2 numbers." Codex gate at P4.

---

## 2026-06-22 REBUILD/JUDGE — P2: calibration gold set + metrics harness (offline, $0)

- What changed: Added the calibration core for the semantic judge — a pure metrics module (`lib/evals/judge-metrics.ts`), a stratified gold set as typed TS literals (`evals/gold/semantic-judge-gold.ts`), a reusable harness (`evals/gold/harness.ts`), and a 16-test calibration suite (`evals/judge-calibration.test.ts`). 192 tests + 1 skipped green; typecheck/lint/build green. No `lib/core` / differential touch; no runtime/UI change (the app does not import any of these), so the Phase-C e2e is unaffected.
- Why it changed: P2 of the approved plan (`docs/spec-semantic-judge.md`) — "calibrated" requires a labeled gold set + a metrics harness before any live run. P3's live cross-family judge needs this scaffolding to produce real numbers.
- Challenge / tradeoff: The dangerous ambiguity in "validate the pipeline on the mock judge." The mock is a keyword stub explicitly NOT a real detector; making it score well would corrupt both the gold set (too easy → the lab-vs-prod gap) and the deliverable (a stub masquerading as a detector).
- How it was diagnosed: An `advisor` (stronger-model) review before writing a line flagged exactly this and three follow-ons (κ/flip-rate degenerate under the mock; stratify the held-out split now; headline must be recall-on-the-gatekeeper-passing-subset, not vacuum recall).
- Options considered: (a) pre-baked JSON gold with R-CAL-1 assumed in comments; (b) typed TS literals with R-CAL-1 ENFORCED by running the real gatekeeper at test time. Chose (b) — the live-enforced artifact is strictly stronger.
- Final fix: Metric math is tested against hand-computed confusion matrices (independent of any judge). The mock judge is run only as a recorded "stub baseline (NOT calibration)," never gated on a threshold. Every gold item is run through the REAL `runGatekeeper` and its approval must equal the item's declared `expectGatekeeperApproves`.
- How it was verified: That live enforcement immediately caught a defective planted positive (`G-state-1`: "photos are already uploaded" did not trip the tense-aware state check — the auxiliary slot allows one token, not "are already"); reworded to a form that genuinely trips the gate. Proof the enforcement has teeth.
- Honesty (R-CAL-4 / R-HON-1): The 6 recorded live drafts are well-grounded (organic fabrications ≈ 0), so every gold positive is SYNTHETIC and labeled `source:"planted"`; no "built + calibrated, F1=X" claim ships until P3/P4 metrics clear the bar on held-out data.
- Files changed: `lib/evals/judge-metrics.ts`, `evals/gold/semantic-judge-gold.ts`, `evals/gold/harness.ts`, `evals/judge-calibration.test.ts` (+ state docs).
- Reviewer notes (Codex / human): Codex changed-files pass deferred to the P4 ship gate (offline eval rigor, $0). Human: P3 live key (`GROQ_API_KEY`) remains owner-gated.

---

## 2026-06-22 REBUILD/JUDGE — P1: semantic faithfulness judge (mock + DI-live + Faithfulness panel)

- What changed: built the judge's offline core. New `lib/agents/claimable-fields.ts` (the shared `CLAIMABLE_FIELDS` + `merchantFacts`, now imported by BOTH the gatekeeper and the judge — one source of truth, spec R-ARCH-2). New `lib/agents/semantic-judge.ts`: the Zod per-claim verdict schema, the grounded entailment prompt, a deterministic `mockJudge` (sentence-level, $0 test/REPLAY path), and `judgeDraft` (mock + DI-live + `FAILED_TO_FALLBACK`) behind a provider-agnostic boundary, budget-ledgered. `judgeLiveEnabled()` added to env-flags. Wired as a SECONDARY control after the gatekeeper in `lib/replay/run.ts` (new `judge` field + a `judge` audit actor; runs only when `approvedForHumanReview`, R-ARCH-4). New Merchant-Detail "Faithfulness check" panel (§4, renumbering Eval/Human/Audit → 5/6/7), rendering per-claim ✓/✗ verdicts.
- Why it changed: P1 of the approved plan — make the judge real + SHOWABLE offline before any spend; close the documented Phase-B gap (`gatekeeper.ts:9-12`) the forward-checker can't cover.
- Decisions baked in: default judge = CROSS-FAMILY Groq `openai/gpt-oss-120b` strict-JSON (owner raised Groq; freshness-verified current/non-deprecated as of 2026-06-22, the Llama line was deprecated 06-17 → migrate to gpt-oss); `any_unsupported` ALWAYS recomputed from the per-claim booleans (never trust the model's aggregate); the free Groq judge still threads the budget ledger so switching to the paid Gemini alt can't silently escape the cap; mock judge is a stub for plumbing/panel, NOT a real detector (the live cross-family judge is, at P3).
- Challenge: keep P1 truly offline + dependency-free while encoding a not-yet-installed provider. Fix: the live path runs via an injected `generate` (DI) in tests; the default Groq call throws `JUDGE_PROVIDER_NOT_WIRED` (caught → fallback) until P3 installs `@ai-sdk/groq`; the Gemini alt is wired now via the installed `@ai-sdk/google`. No static groq import → typecheck stays clean.
- How it was verified: `npm run verify` green — typecheck + lint + **176 tests (+1 skipped)** (15 new judge tests: mock determinism + both heuristic directions, DI LIVE_JUDGE, recomputed aggregate, UNPARSEABLE/throw/NO_BUDGET/hard-stop/JUDGE_LIVE_DISABLED rails, free-$0 vs Gemini-priced alt, REPLAY wiring) + `next build` (27 routes incl. all 20 merchant pages with the panel) + **3/3 Playwright e2e** (the heading-substring selectors survived the renumber).
- Files changed: `lib/agents/{claimable-fields,semantic-judge,gatekeeper}.ts`, `lib/server/env-flags.ts`, `lib/replay/run.ts`, `app/merchant/[id]/page.tsx`, `evals/semantic-judge.test.ts`, `docs/spec-semantic-judge.md` (freshness).
- Reviewer notes: Codex cross-model gate is P4 (pre-ship). The live cross-family path is unproven until P3 (key + the `@ai-sdk/groq` install).
- Human decision: owner chose Groq cross-family ("which is best for quality/structured/enterprise") + "explore current free models, use the best" → gpt-oss-120b. P3 live calibration (free Groq key) remains owner-gated.

## 2026-06-22 REBUILD — Doctrine alignment-audit reconciliation (honesty · eval coverage · a11y · traceability)

- What changed: ran a read-only 3-agent alignment audit (project-advisor → HYBRID-CORRECT/SOUND-WITH-GAPS; guidelines-monitor → 12 followed/2 partial/0 violated; acceptance-gate → BLOCK), then fixed every gate-blocking and important finding across 5 committed slices.
- Why it changed: pre-deploy hardening; an honesty-first artifact had drifted false claims onto public surfaces.
- Challenge that appeared: the acceptance-gate ranked a real-format `GEMINI_API_KEY` in `.env` as the HIGHEST blocker (possible committed-secret compromise).
- How it was diagnosed: verified with git plumbing — `.env` is gitignored, untracked, and absent from all history; `.vercelignore` also excludes it. So it is a local-only dev key, **not** a RULES §11 breach. The gate over-ranked it because it lacked Bash; verification broke the tie.
- Final fixes (per slice): (1) honesty/accuracy copy — false "Real San Francisco businesses" / "real business names" on `app/page.tsx` + `app/metrics` → fictional-display wording; stale live-run stats `$0.0036/4-2` → `$0.0042/5-1` (README, app/eval, ENTERPRISE-READINESS) synced to the locked fixture; test count → 157; "authentic caught-failure are done" overclaim softened. (2) NEW `no-leakage` eval grader (4th dimension) that catches the recorded Mission Masa raw-enum + risk-level leak the other graders missed — proven by a planted test AND a real-output test over the frozen drafts; live prompt tightened; snapshot re-scored deterministically (3/4 leaky, 4/4 clean). (3) recovered the rebuild-era Codex verdicts from `/tmp` into `docs/reviews/` (this gap). (4) a11y — dim 11px `text-neutral-400`→`500` (WCAG 1.4.3) + skip-link (2.4.1).
- How it was verified: `npm run verify` (typecheck/lint/build) green at every slice; 157 tests + 1 skipped; the 2 new teeth tests pass.
- Prevention step: derive the live-run figures from the fixture so the README/Eval copy can't drift again (logged as a follow-up); keep cross-model verdicts in `docs/reviews/`, never only `/tmp`.
- Files changed: `app/{page,metrics/page,eval/page,cost/page,layout,merchant/[id]/page}.tsx`, `README.md`, `docs/{WHY,ENTERPRISE-READINESS}.md`, `lib/evals/draft-quality.ts`, `lib/agents/draft.ts`, `evals/{draft-quality,live-samples}.test.ts`, `lib/data/live-samples.snapshot.json`, `docs/reviews/codex-*`.
- Reviewer notes: a fresh pre-deploy Codex pass on these slices is recommended before T13.
- Human decision: owner directed "do all the fixes and commit, go till the end"; deploy + any live spend remain owner-gated.

## 2026-06-20 REBUILD — Cross-model gate + live Gemini run + 3-audit sweep (backfilled 2026-06-22)

- What changed: ran the recorded live Gemini run (6 merchants, `gemini-2.5-flash`, ~$0.0042, fixture `lib/data/live-samples.snapshot.json`) and a comprehensive review sweep — Codex (initial + batch-2 + two confirming passes, all BLOCK→reconciled), security-specialist (no P0/P1), evals-specialist (4 P1 rigor gaps closed).
- Why it changed: prove the bounded-LLM path on real output; gate the artifact before any deploy.
- Final fixes: cumulative fail-closed budget on missing/partial usage (`UNKNOWN_USAGE`); `live:true` cannot bypass `ENABLE_LIVE_AI`; `{{MERCHANT}}` placeholder validation hardened; 45-case guardrail corpus ported; draft-text differential vs `out/model_runs.csv`; live-snapshot regression lock; honesty copy ("declared claims", not "every claim").
- How it was verified: 155 tests + 3 e2e green; coverage ≥88/79/90/91; `lib/core` + the differential oracle untouched (surgical state-consistency lives in the agent tier).
- Reviewer notes: the four Codex verdicts are in `docs/reviews/codex-2026-06-*` (recovered 2026-06-22) and indexed in `docs/reviews/codex-rebuild-INDEX.md`.
- Files changed: `lib/agents/*`, `evals/*`, `lib/data/live-samples.snapshot.json`, honesty copy across docs/surfaces. See decision-log 2026-06-20 rows.

## 2026-06-19 REBUILD — Rebuild execution: scaffold → thin vertical slice → Phases A–D (backfilled 2026-06-22)

- What changed: executed the approved pivot (`~/.claude/plans/gentle-forging-starlight.md`) — Next.js 16/React 19/TS/Tailwind scaffold; deterministic core ported to TS and pinned byte-for-byte to the Python oracle (`evals/core-differential.test.ts`); thin vertical slice (hybrid DataSF+synthetic dataset, bounded Gemini draft, claims-gatekeeper, draft-quality eval, REPLAY orchestrator, Overview + Merchant Detail); Phase B domain depth (`lib/domain/diagnosis.ts`); Phase C console (Eval/Metrics/Audit/Cost); live-path hardening (injection cut + cumulative budget ledger); Phase D docs (`docs/WHY.md`, README).
- Why it changed: the 2026-06-19 owner-approved pivot from a Python CLI to a deployed, adoption-grade product.
- How it was verified: typecheck/lint/test/build green at each slice; differential stays byte-identical; `next build` prerenders every route.
- Reviewer notes: Codex BLOCK→reconciled at the slice gate (see `docs/reviews/codex-2026-06-19-rebuild-comprehensive.md`).
- Files changed: `lib/**`, `app/**`, `evals/**`, `docs/**` (the rebuild). See decision-log 2026-06-19 rows + `PROJECT_STATE.md`.

---

## 2026-06-02 T-001 — Audit finding: recurring git-state doc staleness (process)

- What changed: process note only (no code). The ground-rules audit found the state docs had again drifted from git.
- What failed: `PROJECT_STATE`/`CURRENT_TASK`/`HANDOFF` said "P2-fix uncommitted" while `HEAD` was already `2ccafce` (owner had committed). This is the **3rd** time the git-state line has gone stale between turns.
- Why it happened: intermediate turns edited the git-state wording from the in-session assumption of what was committed, rather than re-deriving it from `git log -1` + `git status`. The previous journal entry already wrote that exact prevention — and it still recurred, which means a "be careful" note is not a real control.
- Fix: corrected the three docs in the audit; rewrote the HANDOFF latest block (it had accreted 4 turns of layers).
- Prevention (structural, since the soft version failed): the session-start routine (RULES/CLAUDE already require `git status` on start) and `docs/checklists/prevent-repeat-checklist.md` must make "re-derive the PROJECT_STATE/HANDOFF git-state line from `git log -1` + `git status`" a **required, checked** step. Flagged for a docs-allowed task (the checklist is not in this audit's editable set).
- Files changed: `docs/audits/T-001-ground-rules-audit.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`, this file.
- Human decision: owner to commit the audit + corrections (not done here).

---

## 2026-06-02 T-001 — Final Codex review fixes (verb-first guardrail + git-state docs)

- What changed: closed the two P2s from the final Codex review (job `bmyf43y0x`). Suite now 23 (added `test_p2_5`).
- What failed / why / how fixed / prevention:
  1. **Guardrail prose `state_mismatch` missed verb-before-step phrasing.** `COMPLETION_CLAIMS` was keyword-first only ("photos … added"), so "We've added your photos" passed for an incomplete step. Cause: only one word order was modeled. Fix: added verb-first patterns using **past-tense/completed forms only** (`verified`/`added`/`uploaded`), with the ambiguous "set" gated behind a completion auxiliary ("we've/have/already set … hours"), so imperative TODO phrasing ("add photos", "set your hours") is not flagged. Prevention: `test_p2_5` (verb-first false-completion flagged) **plus a negative control** asserting the clean stub draft is not flagged; T11/T12 re-confirmed green.
  2. **State docs misstated git commit state.** `CURRENT_TASK`/`HANDOFF`/`PROJECT_STATE` said "nothing committed" while HEAD was already `653245b` (the implementation commit). Cause: those lines were written independent of the owner's commit and never reconciled. Fix: corrected all three to state the implementation is committed and only the P2-fix/hygiene work is uncommitted. Prevention: the handoff "Git status" line should always be derived from `git log -1` + `git status`, not assumed.
- How verified: `python3 -m unittest tests.test_t001 -v` → 23/23; T11 (no over-flag on the 20 nudges) and T12 (clean drafts no `state_mismatch`) green.
- Files changed: `scripts/guardrail.py`, `tests/test_t001.py`, `tests/fixtures/guardrail_cases.json`, `CURRENT_TASK.md`, `PROJECT_STATE.md`, `HANDOFF.md`, `docs/task-log.md`, `docs/implementation-journal.md`.
- Reviewer notes: addresses both final-review P2s; no remaining Codex findings outstanding.
- Human decision: the P2-fix/hygiene commit is the owner's call (not done).

---

## 2026-06-02 T-001 — Codex P2 fix pass

- What changed: fixed the four P2 findings from the Codex changed-files review (job `bbvaa9pmp`); added 4 fix-coverage tests (suite now 22, all pass).
- What failed / why it happened / how fixed / prevention:
  1. **Idempotency bypassed via the app command.** `scripts/run.py` deleted `audit_log.csv` before every run, so `load_sent_keys()` saw an empty log and re-sent — the dedup guarantee only held when callers used `run_pipeline` directly. Cause: a "clean canonical artifact" convenience that silently defeated the control. Fix: `run.py` now preserves history by default; clearing is an explicit `--fresh` flag. Prevention: test `test_p2_1_app_command_preserves_idempotency` runs the documented command path twice and asserts run 2 emits only `skipped_duplicate`.
  2. **Fractional integers truncated.** `parse_int` did `int(float(x))`, silently turning `3.50`→`3` (the slice plan says reject non-integers). Cause: lossy parse. Fix: raise `ValueError` when `float(x) != int(float(x))`. Prevention: `test_p2_2_reject_fractional` (unit + end-to-end malformed-CSV).
  3. **Reused `model_run_id` across appends.** The ID index restarted at 1 each run, colliding in the append-only `model_runs.csv`. Cause: no offset. Fix: offset by existing row count via `_next_model_seq()`. Prevention: `test_p2_3_unique_model_run_ids` (two runs → 40 unique IDs).
  4. **`state_mismatch` ignored prose.** The guardrail only compared `next_best_action`, so a draft with the right action but text claiming a not-yet-completed step is done would pass — contrary to data-dictionary §9. Cause: structural-only check. Fix: added `COMPLETION_CLAIMS` (keyword + done-verb + min-steps), scanned over subject+body only so internal blocker codes don't false-positive. Prevention: `test_p2_4_state_mismatch_prose` + fixture; T11/T12 still green (no over-flagging of clean drafts or real nudges).
- How verified: `python3 -m unittest tests.test_t001 -v` → 22/22; `scripts/run.py --fresh` then `scripts/run.py` → 12 send / 12 skipped_duplicate, 40 unique model IDs, source CSV unchanged.
- Doc-sync flagged (out of scope here): `docs/v1-slice-plan.md` test list (add the 4 P2 tests) and a note on `run.py --fresh` vs preserve-history; do in a docs-allowed task.
- Files changed: `scripts/run.py`, `scripts/pipeline.py`, `scripts/guardrail.py`, `tests/test_t001.py`, `tests/fixtures/guardrail_cases.json`, plus state docs.
- Reviewer notes: ready for a confirming Codex pass if desired. Human decision: commit not done (owner's call).

---

## 2026-06-02 T-001 — Offline thin slice implementation

- What changed: Implemented the V1 offline pipeline (`scripts/config.py`, `scripts/guardrail.py`, `scripts/pipeline.py`, `scripts/run.py`), tests `tests/test_t001.py` (T1–T18, all passing), fixtures, and generated `out/` artifacts. Stdlib only; no network, no AI call, no integrations; source CSV read-only (hash-verified unchanged).
- Why it changed: human GO on the revised T-001 plan.
- Challenges / failures that appeared (caught by the tests):
  1. **risk_level enum mismatch.** Source CSV uses `Low Risk`/`Medium Risk`/`High Risk`; the data-dictionary enum is `Low`/`Medium`/`High`. The pipeline failed validation on row 1 until normalization stripped `" Risk"`.
  2. **Guardrail regex bug — `%\b`.** `unsupported_metric` used `\b\d+\s?%\b`; `\b` after `%` can't match before a space ("30% more"), so the category never fired. Fixed to `\b\d+\s?%` (still context-bound).
  3. **Guardrail regex bug — trailing `\b` on inflected verbs.** `false_impact_claim` used `\b(guarantee|endorses|…)\b`, which fails on "guarantee**s**" (s is a word char). Fixed to `(guarantee[sd]?|endorse[sd]?|recommend[sd]?|…)`.
- How diagnosed: T16 surfaced (1); T18 (under-flag coverage) surfaced (2) and (3) — exactly the test Codex asked for. Verified (2)/(3) with a one-off `re.search` probe before fixing.
- Options considered: loosen the tests (rejected — per RULES/advisor, fix the logic) vs. fix the code (chosen).
- Final fix: as above. Re-ran the full suite → 18/18 pass; canonical `out/` shows 12 simulated_sent, 8 High held, 0 rejected, source unchanged.
- Prevention: T18 now permanently guards every guardrail category against under-flagging; T16 guards the row schema/enum.
- **Doc-sync needed (out of scope this task — data dictionary not in allowed files):** `docs/v1-data-dictionary.md` should be updated in a docs-allowed task to (a) note the source `… Risk` → enum normalization in §1/§3, and (b) carry the corrected §9 regex for `unsupported_metric` and `false_impact_claim`. The code matches the documented *intent*; the doc has the same two regex typos. Flagged for the next Codex review.
- Files changed: see the 2026-06-02 task-log entry.
- Reviewer notes: ready for `/codex:review` of the changed files.
- Human decision: GO was given; commit is still the human owner's call (not committed).

---

## 2026-06-01 OS-SETUP — Project operating system

- What changed: Created the project's operating-system files (rules, role files, continuity/handoff, dual-model workflow, narrative, journals/logs, checklist, prompt templates, first-pass visuals).
- Why it changed: Work spans multiple tools and accounts (Claude account 1/2, Claude CLI, Codex) plus a human owner. Without repo-resident rules and handoff, each session re-derived context and re-received instructions. The fix is to make the repo the source of truth.
- Challenge or failure that appeared: The dual-model doc had to cite specific Codex plugin commands, but documenting platform behavior from memory would violate the new source-verification rule.
- Why it happened: Command names and flags are easy to misremember and change between plugin versions.
- How it was diagnosed: Inspected the installed plugin command definitions directly.
- Options considered: (a) document from memory; (b) mark everything UNVERIFIED; (c) read the installed command files and cite them.
- Final fix: Read `~/.claude/plugins/cache/openai-codex/codex/1.0.4/commands/` and documented the verified command surface with a cited source and version.
- Why this fix: It satisfies the source-verification rule and gives the next session accurate commands.
- How it was implemented: Wrote `docs/dual-model-workflow.md` with a verified command table; cross-referenced from `CODEX.md`.
- How it was verified: Command names, flags, and the review-only-vs-edits distinction were taken verbatim from the installed command files.
- Prevention step for the future: Re-verify the command table after any Codex plugin update; keep the version + path citation current.
- Files changed: see the OS-SETUP entry in `docs/task-log.md`.
- Reviewer notes (Codex / human): Codex review of these files is optional and may be deferred (docs-only, no product code).
- Human decision: Pending — the human owner decides GO / NO-GO on the build (`docs/plan-reconciliation.md`).
