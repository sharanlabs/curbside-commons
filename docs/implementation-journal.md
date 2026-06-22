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
