# Task Log

## 2026-06-04 (Decision-log ratifications — guardrail hardening + baseline artifact policy)

### Professional Process Applied (lightweight)

Task type: governance/decision documentation · Stage: post-T-002-merge, pre-Phase-3 · Risk: low · Mode: lightweight · Basis: owner directive ratifying two recommendations from the build-process compliance audit · Validation: decision-log row-format consistency; facts already verified in the audit (35/35 + eval PASS + 8 Codex rounds) · Human approval: owner-directed (= approval) · Codex review: optional.

### What was done

- Added two `docs/decision-log.md` rows (2026-06-04): (1) **`pii_or_secret` guardrail hardening** (assignment-form detector; safety-improving T-001 behavior change exposed by T-002; closes the audit's traceability finding, check #5); (2) **`eval/eval_baseline.v1.json` committed under `eval/` (not `out/`)** as the locked pre-Gemini baseline evidence.
- Synced the dependent docs in the same task (to avoid the partial-drift the audit flags): `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md` next-step lines, and the audit's Recommendations + pre-Phase-3 checklist items #2/#3 (marked done).

### Compliance / scope

Docs only. **No** change to `scripts/`, `tests/`, source CSV, `out/`, `eval/`, integrations. **No commit** (owner decides). Tests reconfirmed 35/35.

### Next step

Owner clears the remaining pre-Phase-3 gate items (git-state enforcement at task-close; `out/` log + enforcement-hooks decisions; baseline acceptance) before any Phase-3 work.

## 2026-06-04 (Retrospective build-process compliance audit — planning → T-002 merge)

### Professional Process Applied (full-but-narrow)

Task type: post-stage build-process compliance audit · Stage: post-T-002-merge, pre-Phase-3 · Risk: low–medium · Mode: full-but-narrow (reads broadly, edits surgically) · Basis: `RULES.md`, `CLAUDE.md`, `CODEX.md`, `docs/enterprise-delivery-playbook.md`, the 8 in-session Codex reviews, git history · Source requirement: repo + git + **live test/eval execution** (primary evidence) · Validation: re-ran 35/35 tests + eval PASS; re-derived git state; verified each Codex finding's resolution in the committed tree · Codex review: recommended (confirming `/codex:review` of this batch) · Human approval: not required for the audit + continuity corrections (task pre-authorized "update state docs only if needed"); required for the recommended decision-log row, the `t002-slice-plan.md` fix, and any commit.

### What was done

- Created [docs/audits/build-process-compliance-audit.md](audits/build-process-compliance-audit.md) — answers all 11 audit checks with evidence, verdict, what-worked, repeated-failure-patterns, and a **pre-Phase-3 lightweight checklist**.
- **Corrected the recurring git-state drift** in `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`: they still read `feature/t002-eval-harness` / `HEAD = 1a0dbd0` / "uncommitted" after T-002 had been committed (`a95c0f1`) and merged to `main` (`dc7d131`). As-found text is quoted verbatim in the audit before correction.

### Verdict (summary)

Process followed well. **Strong:** every phase had planning → validation → Codex review → owner gate; T-002 passed 8 Codex rounds with **every finding resolved before commit** (two became permanent tests E1b/E2b; one became a hardened detector); 35/35 tests + eval PASS verified by re-execution; no integrations/secrets/CSV-edits/`out/`-pollution. **Material recurring failure:** git-state line drifted again at the merge gate — a control for exactly this exists (it was created because the line went stale 3× in T-001) but was not run at task-close. **Traceability gap:** the `pii_or_secret` guardrail hardening (a T-001 behavior change) was folded into T-002 without a decision-log row and initially mis-stated as "T-001 unchanged" — beneficial, low-risk, and caught by Codex.

### Recommendations (proposed, not done — owner disposes)

Add a `docs/decision-log.md` row for the guardrail change; fix the residual `out/eval_baseline.v1.json` reference in `docs/t002-slice-plan.md`; run a confirming `/codex:review`; optionally delete/fast-forward the stale `feature/t002-eval-harness` branch.

### Compliance / scope

Review + continuity-doc corrections only. **No** change to `scripts/`, `tests/`, source CSV, `out/`, `eval/`, integrations; **no** `decision-log` edit (recommended only); **no commit** (owner decides).

### Next step

Owner reviews the audit; decides the recommendations; clears the pre-Phase-3 gate before any Phase-3 (Gemini) work.

## 2026-06-04 (T-002 implementation — eval harness, branch `feature/t002-eval-harness`)

### Professional Process Applied (lightweight)

Task type: offline eval harness implementation · Stage: Phase 2 build · Risk: low-medium · Mode: lightweight · Basis: [docs/t002-slice-plan.md](t002-slice-plan.md) · Validation: `python3 -m unittest tests.test_t001 tests.test_t002 -v` + `python3 scripts/eval.py` · Codex review: pending · Human approval: required before commit/merge.

### What was done

- `eval/golden_merchants.v1.json` — 20 merchants + aggregate expectations + `source_csv_sha256` from canonical pipeline.
- `eval/guardrail_regression.v1.json` — **45** cases (5 T-001 regex parity, 1 structural `state_mismatch`, 6 extra positives, 8 near-miss negatives, 20 source nudges, 5 stub-clean).
- `scripts/eval.py` — golden compare, regression scoring (inclusion for positives; exact-empty for negatives/source/stub), CLI; default baseline `eval/eval_baseline.v1.json` (not `out/`).
- `tests/test_t002.py` — E1–E10.
- Updated `docs/t002-slice-plan.md` status, `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`.

### Validation

- **35/35 OK** (T-001 23 + T-002 12).
- `python3 scripts/eval.py` → **MERCHANT 20/20 | GUARDRAIL 45/45 | PASS** (exit 0).

### Notes

- `GR-POS-009` text adjusted for `pii_or_secret` regex (original api_key string did not flag).
- Source CSV and `out/` not modified. T-001 behavior/tests unchanged. **No commit.**

### Next step

Owner review → Codex `/codex:review` → commit/merge when approved.

## 2026-06-04 (T-002 slice plan — `docs/t002-slice-plan.md`, docs only, lightweight)

### Professional Process Applied (lightweight)

Task type: T-002 planning documentation · Stage: post-roadmap, pre-T-002 implementation · Risk: low · Mode: lightweight · Basis: approved Cursor T-002 plan + [docs/roadmap.md](roadmap.md) Phase 2 + [docs/decision-log.md](decision-log.md) eval-first ratification · Validation: slice plan completeness vs ratified scope; no product files touched · Human approval: required before T-002 implementation · Codex review: deferred until implementation slice.

### What was done

- Created [docs/t002-slice-plan.md](t002-slice-plan.md) — build spec for **Offline Evaluation and Regression Harness**: problem statement, proposed file layout (`eval/`, `scripts/eval.py`, `tests/test_t002.py`, `out/eval_baseline.v1.json`), golden label schema (`golden_merchants.v1`), regression corpus (`guardrail_regression.v1`), metrics object, tests **E1–E10**, validation commands, GO/NO-GO, out-of-scope list.
- Synced `CURRENT_TASK.md` (active task = T-002-PLAN, implementation not started), `HANDOFF.md`, `PROJECT_STATE.md`, this log.
- Tool: Cursor (Composer). **No** `decision-log` entry (no new architecture decision).

### Compliance / scope

**No** `scripts/`, `tests/`, source CSV, `out/`, `eval/`, integrations, plugins, hooks, or commit. T-002 **implementation not started**.

### Next step

Owner reviews slice plan → approves separate T-002 implementation task (golden JSON, regression JSON, eval runner, E1–E10 tests) → Codex review before merge.

## 2026-06-02 (Roadmap Codex-review correction — `docs/roadmap.md` + state docs, lightweight)

### Professional Process Applied (lightweight)

Task type: roadmap doc correction after Codex review · Stage: post-roadmap-review, pre-commit · Risk: low · Mode: lightweight · Validation: owner's grep checks + a phase-number consistency sweep · Human approval: required before commit.

### Codex review (read-only, working-tree)

Ran the installed `openai-codex` adversarial review (`sandbox: read-only`) on the roadmap batch. **Verdict: needs-attention.** Two [medium] findings: (1) the roadmap made **Project Operating Model and Governance** a numbered product build phase (process-as-product, against the ratified applicability packet's product-first principle); (2) two state docs still listed the **eval-first T-002 ratification** as an open follow-up although it is already ratified in `docs/decision-log.md`.

### Fixes applied (this correction)

- **Fix 1 — governance recast as Foundation.** In `docs/roadmap.md`, **Project Operating Model and Governance** is now a completed **Foundation** (kept as context — it was real work and protects execution), not a numbered phase. The product phases are renumbered **1–7** (1 Offline Vertical Slice **done**, 2 Offline Evaluation and Regression Harness = T-002 **next**, 3 Bounded LLM Drafting, 4 Persistence & Provenance Upgrade, 5 HITL Delivery Workflow, 6 Orchestration & Monitoring, 7 Public Demo & Portfolio Narrative). All in-doc phase-number cross-references updated. No framework appendix; no forbidden public-claim terms.
- **Fix 2 — stale ratification follow-ups cleared.** Removed the "ratify eval-first T-002 ordering" open item from `CURRENT_TASK.md` (hygiene follow-ups) and `PROJECT_STATE.md` (Open Questions); kept the genuinely-open items (`out/` log policy; enforcement-hooks decision). Eval-first T-002 is ratified in `docs/decision-log.md`.
- Synced the "8 phases" framing to **Foundation + 7 phases** across the state docs.

### Compliance / scope

Updated only `docs/roadmap.md` + the four state docs. **No** `decision-log` change; **no** new files; **no** product code/tests/CSV/`out`/integration change; nothing installed/adopted; **no commit** (owner decides). **T-002 not started.**

### Next step

Owner reviews + (if satisfied) commits the roadmap batch; then scope **T-002 — Offline Evaluation and Regression Harness** as a separate task.

## 2026-06-02 (Roadmap creation — `docs/roadmap.md`, lightweight, documentation only)

### Professional Process Applied (lightweight)

Task type: roadmap documentation · Stage: post-applicability-review, pre-T-002 · Risk: low-medium · Mode: lightweight · Basis: the Codex-revised + ratified applicability review + the built T-001 state; product-first, layperson-legible, public-claim controlled (`RULES.md` §4/§7/§8) · Validation: forbidden-term grep on the roadmap + consistency with built state · Human approval: required before commit.

### What was done

- Created `docs/roadmap.md` — a short, product-first roadmap: **Current Status**, a plain **Product Lifecycle** loop (Discover → Source Intake → Plan → Build → Validate → Review → Document → Handoff → Decide Next Stage), **product-first Build Phases**, a plain **Why T-002 Comes Before Gemini**, **per-phase details** (goal / build / validation / out-of-scope / trigger), a tiny **Terminology note** (no framework-mapping section), and a **What Not To Do Yet** list. *(Phase structure was corrected in the follow-on Codex-review correction above: governance → Foundation; product phases renumbered 1–7.)*
- Uses the ratified **T-002 = Offline Evaluation and Regression Harness**. Honest framing throughout: simulation on dummy data, CSV protected, fully offline, T-002 ratified but not started, Obsidian vault separate.
- Synced `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / this log; re-derived git (`HEAD = 78dc694` — the applicability review + revision are committed).

### Validation

- Forbidden-term grep on `docs/roadmap.md` → **0** real matches (production-grade / enterprise-scale / autonomous / deployed-to-production / real-impact / NIST / SSDF / DORA / SRE / SOTA / benchmark / agentic / compliant all absent; the only "NIST" hits were the substring inside "deter**minist**ic"). Ratified T-002 name present (3×), no stale name. All 8 required sections present.

### Compliance / scope

Documentation only. Created `docs/roadmap.md`; updated the four state docs. **No** `decision-log` change (no new decision); **no** product code/tests/CSV/`out`/integration change; nothing installed/adopted; **no commit** (owner decides). **T-002 not started.**

### Next step

Owner reviews + approves `docs/roadmap.md` (and commits this batch) → then scope **T-002 — Offline Evaluation and Regression Harness** as a separate task.

## 2026-06-02 (Codex adversarial review of the roadmap applicability packet + one revision pass — lightweight)

### Professional Process Applied (lightweight)

Task type: Codex-review revision / roadmap-applicability cleanup · Stage: post-Codex, pre-roadmap · Risk: low-medium · Mode: lightweight but precise · Validation: address only the Codex findings + the owner's `git status`/`grep` checks + an internal-consistency pass · Human approval: required before commit.

### Codex review (read-only, working-tree)

Ran the installed `openai-codex` adversarial review (`adversarial-review`, `sandbox: read-only`) on the packet + working-tree diff. **Verdict: needs-revision** (not reject). Direction sound; four findings: (1) [high] eval-first ratification gate too late for roadmap creation (a roadmap encodes the sequence, so ratify before roadmap finalization or mark proposed); (2) [medium] stale `PROJECT_STATE.md` git/current-state line (said HEAD `63e3332` + old uncommitted batch); (3) [medium] governance-mapping appendix risks reintroducing bloat in the roadmap; (4) [medium] EDD source overstated as Tier-1/peer-reviewed (arXiv = preprint).

### Findings fixed (this revision)

- **Eval-first ratified:** owner approved the eval-before-Gemini reorder of `plan-reconciliation.md` §6; recorded a row in `docs/decision-log.md`. **T-002 named "Offline Evaluation and Regression Harness"** (TEVV only a background reference term, not the title).
- **`PROJECT_STATE.md`** stale git/current-state lines corrected (HEAD `cb80286`; uncommitted = this revision batch; no `out/` dirty; T-002 not started); the 4→5 uncommitted-doc count fixed across the state docs.
- **Packet de-bloated:** roadmap is product-first and short; **no framework-mapping section (NIST/SSDF/DORA/SRE) by default**; at most a tiny artifact-tied terminology note; no "aligned/compliant/enterprise-scale/production-grade" language.
- **EDD source downgraded** to preprint/practice reference; eval-first rests on `RULES.md` §3, the data-dictionary §9 guardrail caveat, the T-001.7 audit, the baseline-before-Gemini need, and regression-testing discipline. Added a top revision note to the packet.

### Compliance / scope

Updated only the six named docs (packet, `PROJECT_STATE`, `CURRENT_TASK`, `HANDOFF`, `docs/task-log`, `docs/decision-log`). **No** `docs/roadmap.md`; **no** new files; **no** product code/tests/CSV/`out`/integration change; nothing installed/adopted; **no commit** (owner decides). T-002 not started.

### Next step

Owner approval of the revised packet → then write `docs/roadmap.md` (product-first, short). Eval-first T-002 already ratified in `docs/decision-log.md`.

## 2026-06-02 (Roadmap / Lifecycle / Build-Phase Applicability Review — full-but-narrow, review/planning only)

### Professional Process Applied (full-but-narrow)

Task type: roadmap/lifecycle/build-phase terminology applicability review · Stage: post-T-001.7, pre-roadmap, pre-T-002 · Risk: medium (weak terminology makes a roadmap look fake/overbuilt) · Mode: full-but-narrow · Source requirement: broad external discovery (named frameworks = candidates, not commands) weighted by source tiers + the open-source-discovery rule · Validation: applicability classification + Codex review recommended before any roadmap · Human approval: required before writing the roadmap or starting T-002.

### Skills

Used the project's open-source-discovery + source-intake rules (playbook/`RULES.md` §14) to drive broad, tiered discovery; no external skill conflicted with `RULES.md`.

### What was done

- Read the startup-contract evidence set (`RULES.md`, decision-log, `plan-reconciliation.md` §1–9, `v1-slice-plan.md`, `v1-data-dictionary.md`, T-001.7 audit, source-intake-review) + re-derived git (`HEAD = cb80286`, clean).
- Broad web discovery (2026-06-02, ~11 searches): NIST AI RMF (Govern/Map/Measure/Manage), NIST GenAI Profile (12 risks), NIST SSDF (Prepare/Protect/Produce/Respond), DORA four keys, Google SRE (SLI/SLO/error-budget), MLOps/LLMOps lifecycle, LLM eval (golden dataset / offline evals / regression / evaluation harness), **Evaluation-Driven Development**, HITL (workflow/control/approval gates; CI-CD `require_review` analogy), walking-skeleton/tracer-bullet/**vertical slice** (Cockburn/Thomas), data provenance / model lineage / audit trail, and AI-portfolio red-flags (field signal).
- Classified every candidate use-now / use-later / reference-only / reject; wrote `docs/review-packets/roadmap-lifecycle-applicability-review.md` (Executive Verdict, Sources, Source-Quality Notes, Project Evidence, Candidate Terms, Applicability Matrix, selected-term 12-field analysis, Recommended Roadmap Language / Build Phases / Lifecycle, Why-not-Gemini-first, Risks of Over-Formalizing, What Codex Should Challenge, Final Recommendation).

### Verdict (summary)

Use industry terms **selectively, as honest mapping** (plainest term first, each tied to a real artifact), not as the roadmap skeleton. **Use now:** vertical/thin slice, HITL approval gate, deterministic guardrails, provenance + audit trail, idempotency, offline evaluation harness / golden labels / regression testing, evaluation-driven, test-driven. **Avoid:** SRE/SLO/error-budget, DORA-as-current-claim, MLOps training, agentic, "production-grade/deployed-to-production/enterprise-scale." NIST RMF/GenAI/SSDF + DORA = mapping sidebar only. **T-002 = "Offline Evaluation Harness"** (evaluation-first); eval-before-Gemini justified on four independent grounds but a `plan-reconciliation.md` §6 reorder → owner ratifies in `docs/decision-log.md`. Recommend Codex adversarial review of the packet before writing `docs/roadmap.md`.

### Compliance / scope

Review/planning only. **Created** one review packet; **updated** the four state docs. **No** `docs/roadmap.md`; **no** `decision-log` entry (no decision made — recommendation only); **no** product code/tests/CSV/`out`/vault/integration change; nothing installed/cloned/adopted; no commit (owner decides). Web sources cited inline in the packet with tiers + dates.

### Next step

Codex `/codex:adversarial-review` of the packet → revise once → owner approval → then write the roadmap and (if ratified) record eval-first T-002.

## 2026-06-02 (Codex review of the Source Openness pass + continuity doc-sync correction — lightweight)

### Professional Process Applied (lightweight)

Task type: dual-model review + continuity doc-sync correction · Stage: post-Source-Openness-pass, pre-commit · Risk: low · Mode: lightweight · Validation: Codex `adversarial-review` (review-only, `sandbox: read-only`) on the working tree, then fix only the flagged stale wording + re-run `git diff` · Human approval: required before commit.

### Codex review

Ran the installed `openai-codex` plugin `adversarial-review` (review-only) over the working-tree diff with the 16 source-openness/cross-verification/synthesis review goals as focus. **Verdict: needs-revision (native `needs-attention`).** The **Open Source Discovery rule itself was approved** — treats named sources as seeds not boundaries, preserves official/current-source authority for factual claims, demotes community content to field-signals, includes proportional stop conditions; **scope-safety PASS** (no product code/tests/CSV/integration/plugin/Obsidian-link in the diff; `out/` changes match the stated prior-pass exception); **no process bloat**. The needs-revision was solely two stale continuity docs riding along in the tree.

### Findings fixed (this correction)

- **[high] `PROJECT_STATE.md`** — refreshed the stale lower sections (Current Readiness Score, Current Blockers, Current Next Step, Decision Status, Open Questions, Handoff Notes, and — in a final sweep — the Current Evidence line that still said "operating-system files are currently uncommitted pending review," now corrected to "committed; OS setup at `49408d3`") from old pre-build framing (readiness ~0/10; blocker = GO/NO-GO on plan-reconciliation; "next session is a T-001 plan review"; "do not write product code until the plan clears") to current reality: T-001 implemented/green (23/23)/closed with minor follow-ups; Source Openness pass + this correction pending commit; remaining items are the three hygiene/decision follow-ups; roadmap/lifecycle review is next only after commit; T-002 not started.
- **[medium] `CURRENT_TASK.md`** — rewritten to docs-only active scope (Source Openness clarification + continuity doc-sync); T-001 implementation details (Goal/Allowed `scripts`+`tests`+`out`/Acceptance) moved into a clearly labeled "Completed stage (historical)" summary; product code/tests/CSV/`out`/integrations/plugins/hooks/Obsidian-linking/roadmap/T-002 marked out of scope.
- Also kept `HANDOFF.md` + this log accurate. Source-openness rule wording left intact (no contradiction found).

### Result

No product code/tests/CSV/`out`/integration change; no new files; no commit (owner decides). Next: owner reviews + commits, then the roadmap/lifecycle applicability review, then ratify eval-first T-002 in `docs/decision-log.md`.

## 2026-06-02 (Source Openness Clarification Pass — lightweight, wording-only)

### Professional Process Applied (lightweight)

Task type: playbook/rules clarification · Stage: post-T-001.7, pre-roadmap applicability review · Risk: low-medium · Mode: lightweight · Source requirement: repo only (no new web research; this clarifies *how* to research, it does not research) · Validation: grep for restrictive wording + read-back of each edited file · Artifact policy: edit-in-place (no new standing files) · Codex review: optional (wording-only) · Human approval: required before commit.

### What / why

Make explicit that sources, frameworks, repos, vendors, communities, and examples **named in the repo are candidates and seeds, not boundaries** — Claude must search broadly and task-specifically, then choose by quality/relevance/freshness/maturity/validation/risk. Goal is *not* to remove source discipline; the tiers and intake rule stay.

### Files Changed (wording only)

- `docs/enterprise-delivery-playbook.md` — added an **Open Source Discovery (named sources are candidates, not constraints)** subsection inside the Source-Backed Research Standard: broad search breadth (official/vendor/standards docs, mature OSS, GitHub issues/PRs, eng blogs, **Reddit/forums/YouTube/SO/community field-signals**, changelogs); "use tiers to judge quality, not restrict discovery"; "seed list, not complete list"; **maximum useful research ≠ endless** (stop at sufficiency, document uncertainty); source-use weighting (official = source of truth; community = signal not proof unless corroborated).
- `RULES.md` §14 — added an open-source-discovery bullet (pointer to the playbook rule).
- `CLAUDE.md` — added a "Search broadly (Open Source Discovery)" obligation bullet.
- `CODEX.md` — added discovery-openness verification with **8 flag conditions** (exhaustive-list assumption; forcing a named framework without applicability; ignoring stronger/current sources; ignoring OSS/field-signal sources when needed; stale sources for current claims; community treated as authoritative without verification; failing to search beyond user examples when risk requires; over-researching low-risk past sufficiency).
- `docs/prompts/claude-task-template.md` — source-requirement line now says *named sources are seeds, not boundaries; search broadly + use field-signal sources, proportional to risk*.
- `docs/prompts/codex-plan-review-template.md` + `docs/prompts/codex-changed-files-review-template.md` — added a "source discovery open enough for the risk?" check.
- `docs/checklists/prevent-repeat-checklist.md` — added a discovery-openness check item.
- Updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / this log.

### Result

Restrictive wording search = **no genuine matches** (only false positives like "deterministic"/"skills"); the "at minimum" phrasing existed only in prior prompts, not the repo. So this pass **clarifies** openness rather than removing restrictions. Source quality tiers preserved. No new standing files; **no decision-log entry** (no decision made); no product code/tests/CSV/`out`/integration/scope change; no commit (owner approves commits).

### Next Step

Owner reviews + commits (with the T-001.7 audit). Stop after this clarification pass — do not start the roadmap or T-002.

## 2026-06-02 (T-001.7 — Post-Playbook Alignment Audit)

### Professional Process Applied (full, narrow)

Task type: post-playbook alignment audit · Stage: T-001.7 · Risk: medium · Mode: full-but-narrow · Source requirement: repo + vault (read-only) + prescribed commands (no new web research) · Validation: git/tests/run-path/docs/vault/stage-readiness · Codex review: optional (minor doc-sync only) · Human approval: required before T-002.

### Commands / evidence

- `HEAD = 63e3332`, tree clean before audit. `python3 -m unittest tests.test_t001` → **Ran 23, OK**. `run.py --fresh` (12 send) → `run.py` (0 new + 12 skipped) = app-path idempotency. No tracked pycache. CSV sha `43fb21f6…` unchanged. Global `~/.claude/CLAUDE.md` has no vault link.

### Files Changed

- Created `docs/audits/post-playbook-alignment-audit.md`.
- Fixed `docs/v1-slice-plan.md` (known-stale item): test list → T1–T18 + P2-1..P2-5 (23); added `--fresh` vs preserve note; status → implemented.
- Corrected git-state in `PROJECT_STATE.md` / `CURRENT_TASK.md` / `HANDOFF.md`; updated `docs/task-log.md`.
- **Not touched:** product code, tests, CSV, `out/` (beyond prescribed validation runs), vault files, integration files. No `decision-log`/journal entry (no decision/implementation issue).

### Verdict

Still on track. T-001 holds under updated standards (23/23, all guarantees intact); new standards break nothing retroactively; vault boundary exemplary & separate. **T-001 → closed with minor follow-ups.** Next stage = **offline eval harness first** (not Gemini) — owner to ratify reorder in `docs/decision-log.md`.

### Compliance Result

Passed. Review-only; no code/tests/CSV changes; nothing installed/adopted; no commit. (`out/` logs regenerated by the prescribed `run.py` — restore with `git checkout -- out/`.)

### Next Step

Owner commits the audit + doc-sync; restores `out/`; ratifies the eval-first ordering; then scopes T-002 (offline evaluation harness).

## 2026-06-02 (T-001.6 — source-intake CORRECTION pass: direct PDF + repo inspection)

### Professional Process Applied (full, narrow)

Task type: source-intake correction / source verification · Stage: T-001.6 · Risk: medium · Mode: full-but-narrow · Source requirement: **open the actual PDFs** + Tier 1 official docs (live, dated) + direct GitHub repo inspection · Validation: explicit source-status separation (directly inspected / summary-only / Tier 1 / repos / gaps) · Docs: `docs/research/source-intake-review.md` + state docs · Human approval: required before adopting anything (nothing adopted).

### What was corrected

- Replaced the summary-only basis with **direct reads** of 3 PDFs: `dynamic_workflows_prompt_pack.pdf`, `obsidian-setup-guide.pdf`, `codex_loop_field_guide.pdf`.
- **Honest gap kept:** `claude_architect_study_guide.pdf` (55 MB) **not loaded** — unsafe native load + `poppler` not installed (not installing per task); its principles verified instead against official docs.
- **Tier 1 official (live 2026-06-02):** fetched best-practices, features-overview, hooks, sub-agents — they **confirm** the Architect principles and **validate** the hooks recommendation (official example: a hook that blocks writes to a folder) and the over-flagging caution. Changelog URL 404'd (gap).
- **All 5 GitHub repos web-inspected** (prior review inspected none): claudex (MIT, ~75★, teaching artifact, read-only review), kepano/obsidian-skills (MIT, ~34k★, Obsidian CEO — reputable), second-brain (license unspecified, risky installers), agentic-design-patterns-docs (~19★), n8n-powerhouse (~4★). Nothing cloned/adopted.
- **Model freshness:** `GPT-5.5` UNVERIFIED; Anthropic/OpenAI model docs not fetched (no model decision) → documented gap.

### Decisions unchanged

Nothing adopted; Obsidian stays external/non-authoritative (now confirmed by the guide's own "global CLAUDE.md" advice, which official docs warn against); claudex/n8n deferred (human-approved); the **enforcement-hooks** recommendation is now strongly official-backed but remains a recommendation (no `decision-log` entry until approved).

### Compliance Result

Passed. Review-only; no code/tests/CSV/`out`/integration changes; nothing installed/cloned/adopted; no commit.

### Next Step

Owner reviews the corrected `docs/research/source-intake-review.md`; commits it; decides on the enforcement-hooks recommendation; (optional) provides a text export of the architect guide or permits a model-freshness sweep at decision time. Do not start T-002.

## 2026-06-02 (T-001.6 — Source intake & applicability review, addendum)

### Professional Process Applied (full mode — research/source-intake)

Task type: research / source-intake + applicability review · Stage: T-001.6 · Risk: medium · Mode: full · Basis: playbook Source/Pattern/Reference Intake + Freshness rules · Source requirement: **Tier 1 official Claude Code docs checked live (`code.claude.com/docs`), date 2026-06-02, not memory** · Validation: each idea classified borrow/reject/adapt/defer + verified/UNVERIFIED tags + Missing Addendum self-audit · Docs: `docs/research/source-intake-review.md` + state docs · Codex review: recommended · Human approval: required before adopting anything (nothing adopted).

### Files Changed

- Created `docs/research/source-intake-review.md` (new dir `docs/research/`). Updated `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.
- **Not edited:** playbook / `RULES` / `CLAUDE` / `CODEX` — the intake rule is already integrated; the addendum required no governance edit.

### Key results

- Evaluated the **summaries pasted** (uploaded files were not in the session — stated honestly). Nothing installed/cloned/adopted.
- Live Tier 1 check (official Claude Code docs, 2026-06-02) **confirmed** the Architect principles: hooks = deterministic enforcement (`PreToolUse` deny / `exit 2`); CLAUDE.md = guidance/"a request, not a guarantee"; skills = on-demand (keep CLAUDE.md < 200 lines); subagents = isolated review with restrictable tools; layered scoping + path-specific `.claude/rules/`.
- **Highest-value finding:** the project's hardest invariants (CSV-immutability, no-secrets) are prompt-only "requests" today; official docs say make must-hold rules **hooks**. Recommended (not adopted) `PreToolUse` hooks — human-approval-gated roadmap item.
- **Honest gaps (in Missing Addendum Checks):** uploaded originals not provided; changelog + Anthropic model release-notes + OpenAI/Codex model docs not fetched this pass (no model decision made) → small optional freshness correction pass recommended at model-decision time.

### Compliance Result

Passed. No product code/tests/CSV/`out`/integration changes; nothing installed/adopted; no commit.

### Next Step

Owner reviews `docs/research/source-intake-review.md`; commits the still-uncommitted intake-rule edits + this review. Then close T-001's `v1-slice-plan` doc-sync; consider the hooks recommendation; ratify T-002 ordering in `docs/decision-log.md`. Do not start T-002.

## 2026-06-02 (Standard — Source/Pattern/Reference Intake rule)

### Professional Process Applied (short — low-risk docs edit)

Task type: governance/process standard · Stage: post-T-001.5 enforcement · Risk: low–medium · Mode: lightweight–medium · Basis: extends the playbook's Source-Backed Research Standard / Selection Rationale / New-Info / Reuse Classification · Sources: none external adopted (repo-internal standard) · Validation: coverage vs the owner's rule + no-duplication check + git re-derived (`HEAD = f28ae90`) · Docs: playbook + RULES/CLAUDE/CODEX/checklist/decision-log + state docs · Codex review: optional · Human approval: owner directed the rule (= approval); no product/scope/tool change.

### Files Changed

- `docs/enterprise-delivery-playbook.md` (new "Source, Pattern, and Reference Intake" section — integrated, cross-referencing existing source tiers + reuse classification, not duplicating them).
- `RULES.md` §14 (intake bullet), `CLAUDE.md` (intake obligation), `CODEX.md` (intake verification item), `docs/checklists/prevent-repeat-checklist.md` (intake check), `docs/decision-log.md` (decision row).
- Updated `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.

### Scope discipline / honest note

- The rule overlaps the existing source-tier + reuse sections; **integrated as one section** to avoid the process-bloat the project already flagged. Net new standing files: **0**. The governance surface continues to grow — future tasks must keep intake proportional (one line for trivial edits).

### Compliance Result

Passed. No product code/tests/CSV/`out`/integration changes. No commit.

### Next Step

Owner commits this standard. Then close T-001's remaining doc follow-up (`v1-slice-plan` test-list sync) and ratify the T-002 ordering in `docs/decision-log.md`. Do not start T-002.

## 2026-06-02 (Enforcement — Mandatory Startup Contract)

### Professional Process Applied (short — low-risk docs edit)

Task type: process/enforcement docs · Stage: post-T-001.5 · Risk: low · Mode: lightweight · Basis: the just-created playbook + the audit's recurring git-state finding · Sources: repo only (no external) · Validation: section-coverage vs spec + git re-derived · Docs: the listed files · Codex review: optional · Human approval: not needed (no scope/tool/architecture change).

### Files Changed

- `RULES.md` (new §15 Mandatory Startup Contract), `CLAUDE.md` (startup section → contract), `CODEX.md` (startup-contract enforcement + process-finding rule), `docs/prompts/claude-task-template.md` (Professional Process Applied block + read list), `docs/prompts/codex-changed-files-review-template.md` + `docs/prompts/codex-plan-review-template.md` (process/playbook compliance checks), `docs/checklists/prevent-repeat-checklist.md` (startup-contract item).
- Updated `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.

### Result

Mandatory Startup Contract is now enforced: 10-step session start, the Professional Process Applied block (with anti-bloat one-line allowance for trivial edits), a stop condition, and Codex process-finding enforcement. Git re-derived: `HEAD = cd4c188` (playbook + audit committed; tree was clean before this update).

### Compliance Result

Passed. No product code/tests/CSV/`out`/integration changes. No commit.

### Next Step

Owner commits this enforcement update. Then close T-001's remaining doc follow-up (`v1-slice-plan` test-list sync) and ratify the T-002 ordering in `docs/decision-log.md`. Do not start T-002.

## 2026-06-02 (T-001.5 — Enterprise Delivery Playbook created)

### Tool/Session

Claude Code (Opus 4.8), account 1. Standards/process task — no product code/tests/CSV/`out`/integration changes.

### Professional Process Applied

- Task type: documentation / process standard. Stage: T-001.5. Risk: low-medium (governance, no code). Mode: full-ish (it sets standards) but kept to one doc + pointer edits. Sources: the repo's own RULES/audit/review + the approved blindspot review (reduced scope). Validation: section-coverage vs spec + the "no new standing files" constraint. Human approval: pending.

### Files Changed

- Created `docs/enterprise-delivery-playbook.md` (Universal Professional Delivery Standard + ActivationOps AI Application + Living Standard rule; ~30 sections, one file).
- Updated `RULES.md` (new §14 pointer), `CLAUDE.md` (apply-playbook obligations), `CODEX.md` (playbook-verification duties), `docs/checklists/prevent-repeat-checklist.md` (process checks incl. git-state re-derivation — closes the audit's recurring finding), `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.

### Scope discipline

- Built the **reduced single-playbook** form (per the approved blindspot review). **Did not** create separate source-scan / evidence-matrix / framework-matrix / assumptions files (deferred). Net new standing files: **+1** (the playbook). No product code/tests/CSV/`out`/integrations touched.

### Compliance Result

Passed. Git state re-derived (`HEAD = 2ccafce`). No commit.

### Next Step

Owner reviews + approves the playbook, commits the pending audit + review + playbook, closes T-001's open follow-ups; then T-002 (after ratifying the eval-vs-Gemini ordering in `docs/decision-log.md`).

## 2026-06-02 (T-001.5 — standards blindspot pre-flight review)

### Tool/Session

Claude Code (Opus 4.8), account 1. Review only — playbook not created; no code/tests/CSV/out edits.

### Task

Review whether the planned T-001.5 "Enterprise Professional Delivery Playbook" (15 additions) is complete, practical, and not overbuilt.

### Files Changed

- Created `docs/review-packets/T-001.5-standards-blindspot-review.md`.
- Updated `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`.

### Verdict

- Core intent (traceability: messy input → professional execution; source-backed reasoning; alternatives) is **sound and worth codifying once, lightly**.
- The **15-artifact plan is over-built** — would ~double the governance surface and re-trigger the governance-over-product failure already diagnosed (governance review; reconciliation §4 rejected docs-first gates).
- **Recommended:** collapse to ONE ~1–2 page `docs/enterprise-delivery-playbook.md` + small edits to existing files (merge the 4 prompt templates; add a decision-log "alternatives" field; add the git-state re-derivation step to the prevent-repeat checklist). Net file change ≈ −2.
- **Reject** standalone source-scan log / evidence matrix / framework matrix / assumption log / failure-taxonomy / blindspot log, and "deep rationale always" (use proportional rationale). **Defer** integration security/cost/reliability rules + the eval harness.
- Must-add before building: git-state re-derivation checklist step; "no new standing logs" constraint. Close T-001's 3 follow-ups first.

### Compliance Result

Passed. Review-only; no code/tests/CSV/integration/`out/` edits; no commit. (Pre-existing uncommitted work from the T-001 audit remains; `HEAD = 2ccafce`.)

### Next Step

Owner approves the reduced T-001.5 scope; commits the pending audit + review; closes T-001 follow-ups; then creates the single playbook.

## 2026-06-02 (T-001 — ground-rules checkpoint audit)

### Tool/Session

Claude Code (Opus 4.8), account 1. Checkpoint audit — review only, no product build.

### Commands run

- `git status` / `git log --oneline -8` → `HEAD = 2ccafce` (T-001 + P2 fixes committed); tree was clean before the audit.
- `python3 -m unittest tests.test_t001 -v` → **23/23 pass**.
- `python3 scripts/run.py --fresh` (12 sent) then `python3 scripts/run.py` (0 new + 12 skipped_duplicate) → app-path idempotency confirmed.
- `git ls-files | grep pycache/pyc` → none tracked. Secrets grep → no real credentials (matches are rule text / guardrail pattern definitions / a synthetic fixture email).

### Files Changed

- Created `docs/audits/T-001-ground-rules-audit.md`.
- Corrected stale git-state wording in `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md` (and rewrote the HANDOFF latest block, which had accreted 4 turns of layers).
- Added a process note to `docs/implementation-journal.md`.
- **Not touched:** product code, tests, CSV, integration files, `out/`.

### Result

- Verdict: **ground rules followed; close T-001 with minor follow-ups.** No blockers.
- Three follow-ups (none break guarantees): `out/` volatile-log policy + restore; `v1-slice-plan.md` test-list doc-sync; make git-state re-derivation a required prevent-repeat-checklist step.
- Note: the prescribed `run.py` commands left `out/audit_log.csv` + `out/model_runs.csv` modified vs HEAD (snapshots unchanged) — owner to restore or set a policy.

### Compliance Result

Passed. Review-only; no code/tests/CSV/integration/`out/` edits; no commit.

### Next Step

Owner closes T-001 (commit audit + doc corrections; `out/` decision); then doc-sync + checklist follow-ups; then ratify the next-stage reorder in `docs/decision-log.md`.

## 2026-06-02 (T-001 — final-review P2 fix pass)

### Tool/Session

Claude Code (Opus 4.8), account 1. Fix pass for the 2 final-review P2s. No integrations, no external calls.

### Files Changed

- `scripts/guardrail.py` — added verb-before-step completion patterns (past-tense forms; "set" gated by a completion auxiliary).
- `tests/test_t001.py` — added `test_p2_5_state_mismatch_verb_first` (+ negative control); `tests/fixtures/guardrail_cases.json` — added `_state_mismatch_verb_first_body`.
- `CURRENT_TASK.md`, `PROJECT_STATE.md` — corrected git-state wording (implementation committed at `653245b`; only P2-fix/hygiene uncommitted).
- Updated `docs/implementation-journal.md`, `HANDOFF.md`, `docs/task-log.md`.

### Result

- **23/23 pass** (T1–T18 + P2-1..P2-5). T11/T12 still green (no over-flagging; clean drafts not flagged).
- Both final-review P2s resolved: verb-first `state_mismatch` now caught; commit-state docs corrected.

### Compliance Result

Passed. No CSV change, no integrations, no credentials, no commit.

### Next Step

Owner decides on the P2-fix/hygiene commit (impl already at `653245b`).

## 2026-06-02 (T-001 — final Codex review, result checked)

- Job `bmyf43y0x` (`/codex:review --background`). **2 × P2**, no P0/P1.
- P2-A (`scripts/guardrail.py`): the prose `state_mismatch` check only matches keyword-then-verb order ("photos ... added"); verb-first phrasing like "We've added your photos" for `steps_completed==2` still passes. Fix must add past-tense verb-first patterns **without** flagging the clean drafts' imperative TODO phrasing ("add photos", "set hours") — care needed on ambiguous "set".
- P2-B (state docs): `CURRENT_TASK.md`/`HANDOFF.md`/`PROJECT_STATE.md` said "nothing committed", but HEAD is already `653245b "Implement T-001 offline thin slice"`; only the P2-fix + hygiene work is uncommitted. Corrected in `HANDOFF.md` this turn; `CURRENT_TASK.md` + `PROJECT_STATE.md` still to correct in the fix pass.
- Both assessed valid. No code changed this turn (review only); awaiting owner go for the fix pass.

## 2026-06-02 (Hygiene — .gitignore)

### Tool/Session

Claude Code (Opus 4.8), account 1. Tiny hygiene pass. No code/tests/CSV change.

### Files Changed

- Created `.gitignore` (`__pycache__/`, `*.pyc`, `.pytest_cache/`, `.DS_Store`).
- Updated `docs/task-log.md`, `HANDOFF.md`.

### Notes / decisions

- **`out/` left tracked (not ignored), with reasoning recorded in `.gitignore`:** it's a portfolio demo artifact (reviewer can see V1's output without running it). Caveat: `model_runs.csv`/`audit_log.csv` are append-only and currently reflect the 2-run idempotency demo; regenerate with `python3 scripts/run.py --fresh` before committing for a clean single-run state.
- **Already-tracked bytecode not auto-removed:** `.gitignore` only stops *future* tracking. The 6 committed `scripts/__pycache__/*.pyc` + `tests/__pycache__/*.pyc` need a one-time `git rm -r --cached scripts/__pycache__ tests/__pycache__` (then commit) to untrack — flagged for the owner; not done here (git-index change beyond this pass's file scope).

### Compliance Result

Passed. No product code/tests/CSV change; `out/` untouched; no commit.

### Next Step

Final Codex review, then owner commit decision.

## 2026-06-02 (T-001 — Codex P2 fix pass)

### Tool/Session

Claude Code (Opus 4.8), account 1. Fix pass for the 4 P2 review findings. No integrations, no external calls.

### Files Changed

- `scripts/run.py` — preserve audit history by default; `--fresh` is explicit; `out_dir` parameterized.
- `scripts/pipeline.py` — `parse_int` rejects fractional values; `model_run_id` offset by existing row count (`_next_model_seq`).
- `scripts/guardrail.py` — `state_mismatch` now also flags prose claiming a not-yet-completed step is done (`COMPLETION_CLAIMS`, subject+body only).
- `tests/test_t001.py` — added `test_p2_1..p2_4`; `tests/fixtures/guardrail_cases.json` — added `_state_mismatch_prose_body`.
- Updated `docs/implementation-journal.md`, `docs/task-log.md`, `HANDOFF.md`, `CURRENT_TASK.md`, `PROJECT_STATE.md`.

### Result

- **22/22 pass** (T1–T18 + P2-1..P2-4).
- Documented path verified: `scripts/run.py --fresh` → 12 simulated_send; `scripts/run.py` again → 0 new sends, 12 `skipped_duplicate`. `model_runs.csv` 40 rows / 40 unique IDs. Source CSV sha256 unchanged.

### Doc-sync flagged

`docs/v1-slice-plan.md` should enumerate the 4 P2 tests and note `run.py --fresh` vs preserve-history (docs-allowed task).

### Compliance Result

Passed. No CSV change, no integrations, no credentials, no commit.

### Next Step

Owner commit decision (optionally a confirming `/codex:review`).

## 2026-06-02 (T-001 — Codex changed-files review, result checked)

- Job `bbvaa9pmp` (`/codex:review --background --scope working-tree`). Verdict: substantive issues, **4 × P2**, no P0/P1.
- P2-1: `scripts/run.py` deletes `audit_log.csv` before the canonical run → re-running the documented app command bypasses the send-idempotency control (guarantee only holds when calling `run_pipeline` directly).
- P2-2: `scripts/pipeline.py` `parse_int` truncates `3.50`→`3` instead of rejecting non-integer decimals (contradicts slice-plan edge case).
- P2-3: appended `model_runs.csv` reuses `MR-T-001-00x` IDs across repeated runs (ambiguous provenance vs append-only intent).
- P2-4: `scripts/guardrail.py` `state_mismatch` only checks `next_best_action`, not prose claims that a not-yet-completed step is done (data-dictionary §9 requires both).
- Assessment: all four valid. Next: owner decides on a single fix pass vs accept/defer; nothing committed.

## 2026-06-02 (T-001 — documentation sync)

### Tool/Session

Claude Code (Opus 4.8), account 1. Docs only — no code, tests, or CSV touched.

### Task

Sync `docs/v1-data-dictionary.md` with the shipped implementation (resolves the doc-sync flag from the implementation entry).

### Files Changed

- `docs/v1-data-dictionary.md`: status line (plan → implemented); §1 new row 11 + §3/§6 (source `… Risk` → canonical `Low/Medium/High` normalization); §9 two regex fixes to the implemented versions (`%` not `%\b`; inflected verbs `guarantee[sd]?` etc.) + explanatory note; §2 "proposed location" → "location".
- `docs/task-log.md`, `HANDOFF.md`: brief updates.

### Verification

- Confirmed the two §9 regex lines now match `scripts/guardrail.py` verbatim; no stale regex forms remain in the doc.

### Compliance Result

Passed. No product code/tests/CSV change; no commit.

### Next Step

Codex changed-files review (`/codex:review --background`), then owner commit decision.

## 2026-06-02 (T-001 — implementation)

### Tool/Session

Claude Code (Opus 4.8), account 1. First product code for the project.

### Task

Implement the offline T-001 thin slice per `docs/v1-slice-plan.md` + `docs/v1-data-dictionary.md`.

### Skills check

- Task type: deterministic Python implementation + tests. Relevant skills: none required (no UI/framework/data-viz; test-driven-development principles applied inline). Conflicts with RULES.md: none.

### Files Changed

- Created: `scripts/__init__.py`, `scripts/config.py`, `scripts/guardrail.py`, `scripts/pipeline.py`, `scripts/run.py`, `tests/__init__.py`, `tests/test_t001.py`, `tests/fixtures/ineligible_contacts.csv`, `tests/fixtures/approvals.csv`, `tests/fixtures/guardrail_cases.json`.
- Generated: `out/merchants_v1.csv`, `out/review_queue.csv`, `out/model_runs.csv`, `out/audit_log.csv`.
- Updated: `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/implementation-journal.md`.

### Result

- **T1–T18: 18/18 pass** (`python3 -m unittest tests.test_t001 -v`).
- Canonical run: 20 merchants, 8 in review queue (the 8 High), 12 simulated_sent (Low/Medium), 8 High held (`drafted`, `pending_review`), 0 draft_rejected, 12 simulated_send events, 0 skipped.
- Source CSV sha256 identical before/after (`43fb21f6…`).
- Send gate verified: no High/review-required merchant is sent without an explicit synthetic approval (T17).
- Three issues caught by tests and fixed in the logic (not the tests): risk_level enum normalization; two guardrail regex bugs (`%\b`, inflected-verb `\b`). See implementation journal.

### Stdlib / offline confirmation

Standard library only; no network, no AI/LLM call (draft generator is a deterministic stub), no Supabase/n8n/Slack/Resend/Gemini/Apps Script, no real email, no secrets.

### Doc-sync flagged

`docs/v1-data-dictionary.md` §1/§3 (risk_level `… Risk`→enum normalization) and §9 (two corrected regexes) need a follow-up edit in a docs-allowed task; code matches the documented intent.

### Compliance Result

Passed. No CSV modification, no integrations, no credentials, no commit.

### Next Step

Codex changed-files review (`/codex:review`); then human decision on commit.

## 2026-06-01 (T-001 — plan revision after Codex round-1)

### Tool/Session

Claude Code (Opus 4.8), account 1. Planning/docs only — no product code.

### Task

Apply the human-approved revision pass addressing Codex's two round-1 findings.

### Skills check

- Task type: documentation revision. Relevant skills: none required. Conflicts with RULES.md: none.

### Verification

- Confirmed the new guardrail patterns are bound to revenue/performance context so the 20 real nudges (which contain progress percentages like "60% complete", "80% done") still produce 0 flags under T11, while T18 negative fixtures are still caught.

### Files Changed

- `docs/v1-data-dictionary.md` — added `contact_eligible`, `approval_state`, `send_eligible`; new §7.1 send-gate; §9 guardrail moved to fenced regex, added `aggressive_urgency` (6 categories), context-bound numeric patterns.
- `docs/v1-slice-plan.md` — send-gated steps; added T17 (send gate) and T18 (per-category guardrail fixtures); approval edge cases; GO/NO-GO updated.
- `docs/review-packets/T-001-review-packet.md` — Codex round-1 findings + resolutions; assumptions/scope/tests updated; recommendation now "human GO".
- `docs/decision-log.md` — added the contact-vs-send eligibility decision.
- Updated `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.

### Compliance Result

Passed. No product code, no scripts, no CSV change, no schema, no integration, no credentials, no commit.

### Next Step

Human **GO** on the revised plan (criteria in `docs/v1-slice-plan.md`); then implementation (separate task). Second Codex pass optional.

## 2026-06-01 (T-001 — planning + data dictionary)

### Tool/Session

Claude Code (Opus 4.8), account 1. Planning only — no product code.

### Task

Create the plan for the first offline thin slice: data dictionary, slice plan, and a Codex review packet.

### Skills check

- Task type: technical planning / data-contract design. Relevant skills: none required (no UI, no framework, no data-viz). Conflicts with RULES.md: none.

### Verification

- Re-confirmed from the source CSV: risk formula `2*days + 3*last_login + 10*(5−steps)` reproduces `Risk Score` on all 20 rows; step order recovered from the nudge messages; both Medium rows = 69 (threshold gap 48→69, 69→89).

### Files Changed

- Created: `docs/v1-data-dictionary.md`, `docs/v1-slice-plan.md`, `docs/review-packets/T-001-review-packet.md`.
- Updated: `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/decision-log.md`, `docs/task-log.md`.
- Not updated: `docs/implementation-journal.md` (nothing built or debugged yet — journal is for build challenges).

### Key decisions (see `docs/decision-log.md`)

- Recompute + validate `risk_score`; carry source `risk_level` (thresholds = documented assumption; T5 consistency-only, not correctness).
- Synthetic ineligibility in test fixtures, not product output.
- One entity CSV + two append-only logs; idempotency `cooldown_window` = as-of date; guardrail also run over the 20 real nudges.

### Compliance Result

Passed. No product code, no scripts, no CSV change, no schema, no integration, no credentials, no commit.

### Next Step

Run `/codex:adversarial-review` on the plan (focus: `docs/review-packets/T-001-review-packet.md`); resolve blocking findings; get human GO; then implementation (separate task).

### Codex Review Result (checked)

- Job `review-mpw2j628-ncd4my` (background, `--scope working-tree`). Verdict: **needs-attention / NO-SHIP**.
- [high] Review-required merchants can reach `simulated_send` with no approval gate — the slice's human-review control is not actually enforced or tested.
- [medium] Guardrail tests only cover over-flagging (T11) + one planted revenue case; no under-flag fixtures for the other categories; documented regex alternation is ambiguous in the Markdown table.
- Confirmed as-planned: carry source `risk_level` (Q1), CSV + two logs (Q4), fixtures-not-product for ineligibility (Q5), row-order IDs with hash assertion (Q6). Idempotency (Q3) OK only after the review-gate fix.
- Next: one Claude revision pass to address both findings, then human approval. No implementation until then.

## 2026-06-01 (Session 3d — Operating-system cleanup)

### Tool/Session

Claude Code (Opus 4.8), account 1. Cleanup only — no product build.

### Task

Small operating-system cleanup: reconcile AGENTS.md with RULES.md, make README product-focused, add secrets/commit-hygiene rules, correct git status, set the as-of date, and reframe the next task.

### Skills check

- Task type: documentation cleanup. Relevant skills: none required. Conflicts with RULES.md: none.

### Verification

- Confirmed Git is initialized (`git rev-parse --is-inside-work-tree` → true; commit `b57cf2c`). This corrects earlier docs that said "not initialized" (stale — the owner initialized git after the prior session).

### Files Changed

- `AGENTS.md` — now defers to `RULES.md`; dropped "reviewer-first only" framing; added start sequence + summarized ground rules.
- `README.md` — product-focused; Claude Code/Codex moved to a short Development Workflow section and removed from the runtime stack; V1 = "AI-assisted workflow automation", "agentic" reserved for roadmap.
- `RULES.md` — added §11 Secrets, §12 Commit hygiene, §13 Lightweight vs full workflow.
- `CURRENT_TASK.md` — T-001 reframed to "offline thin slice planning + data dictionary"; removed git init; as-of date set to June 1, 2026.
- `PROJECT_STATE.md` — git status corrected; next step/handoff reframed (no git init); as-of date set; Claude Suggestions reconciled.
- `HANDOFF.md` — latest block updated to this cleanup (also touched beyond the listed files because the prior block stated the wrong git status).
- `docs/open-questions.md` — as-of date marked resolved (also touched for consistency with the as-of-date instruction).
- `docs/task-log.md` — this entry.

### Compliance Result

Passed. No product code, no CSV change, no schema, no integration, no credentials, no commit.

### Next Step

Human GO / NO-GO on `docs/plan-reconciliation.md`. On GO, start T-001 (planning + data dictionary only).

## 2026-06-01 (Session 3c — Operating-system setup)

### Tool/Session

Claude Code (Opus 4.8), account 1. Setup only — no product build.

### Task

Create the project operating system so Claude (account 1/2), Claude CLI, Codex, and the human owner can continue from the repo without repeated instructions.

### Skills check

- Task type: governance / process scaffolding (documentation).
- Relevant skills: none required; no UI, data-analysis, or framework skill applied. (Per `RULES.md` §5, recorded that the smallest relevant set was "none.")
- Conflicts with RULES.md: none.

### Files Changed

- Created: `RULES.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/dual-model-workflow.md`, `docs/project-narrative.md`, `docs/implementation-journal.md`, `docs/decision-log.md`, `docs/checklists/prevent-repeat-checklist.md`, `docs/prompts/claude-task-template.md`, `docs/prompts/codex-plan-review-template.md`, `docs/prompts/codex-changed-files-review-template.md`, `docs/prompts/codex-rescue-template.md`, `docs/visuals/README.md`, `docs/visuals/architecture.mmd`, `docs/visuals/v1-thin-slice-flow.mmd`, `docs/visuals/dual-model-workflow.mmd`.
- Updated: `CLAUDE.md`, `CODEX.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/open-questions.md`.

### Verification

- Codex command surface verified against the installed plugin: `~/.claude/plugins/cache/openai-codex/codex/1.0.4/commands/` (v1.0.4). All seven commands confirmed; review-only vs. can-edit distinction taken from the command definitions.
- Mermaid not validated by CLI (mmdc not installed); diagrams use standard syntax.

### Compliance Result

Passed. No product code, no CSV change, no schema, no integration, no credentials.

### Next Step

Human GO / NO-GO on `docs/plan-reconciliation.md`. On GO, start T-001 (`CURRENT_TASK.md`).

## 2026-06-01 (Session 3b — Plan reconciliation)

### Tool/Session

Claude Code, review only (continuation of Session 3).

### Task

Reconcile Codex (initial + open-source) and Claude (governance) findings into one final pre-build decision. No implementation.

### Files Changed

- Created `docs/plan-reconciliation.md`
- Updated `PROJECT_STATE.md`, `docs/task-log.md`, `docs/open-questions.md`

### Summary

- Resolved the core tension: Codex was right about *which* safety controls matter; Claude was right about *sequencing/volume*. Accepted the controls; rejected the docs-first gate.
- Accepted: header fix, required field set built into the slice, documented risk formula + step/blocker taxonomy (step order recovered from existing nudges), deterministic-before-AI, structured JSON + validation + forbidden-claims, idempotency, model_runs ledger, defer live integrations, drop "agentic".
- Rejected: the 7-doc prerequisite gate, the 14-table V1 schema, `ALWAYS_READ.md`/template/retro-audit as blockers, any live external send in V1, the blended readiness score.
- Fixed V1 scope: one offline runnable slice (ingest→normalize→deterministic risk/blocker→review queue→one stubbed structured draft + forbidden-claims check→simulated send + idempotency + audit/model_runs), tests = acceptance criteria. Storage = one entity CSV + append-only event logs.
- Planning exit condition: user GO/NO-GO on the reconciliation. No further review docs.
- First implementation task on GO: git init; RULES.md + v1-data-dictionary.md; ingest/normalize → merchants_v1.csv.

### Compliance Result

Passed. Review-only; no code, schema, workflow, credentials, or CSV mutation.

### Next Step

User GO/NO-GO on `docs/plan-reconciliation.md`. If GO, build (do not write more docs).

## 2026-06-01 (Session 3 — Claude governance & idea review)

> Ordering note: this session ran after the entries below despite the earlier calendar date. Prior entries are dated 2026-06-02; the authoritative current date is 2026-06-01. The folder is not in git, so there is no commit history to arbitrate — this discrepancy is itself recorded as a minor governance finding (weak audit trail).

### Tool/Session

Claude Code, devil's-advocate review only.

### Task

Review whether the project rules, governance process, and project idea are clear enough for a serious AI automation build using Claude Code and Codex. No implementation.

### Scope

- Review and documentation only.
- No CSV modification, schema, workflow, or integration code.
- No credentials.

### Files Read

- `PROJECT_STATE.md`, `AGENTS.md`, `README.md`, `CODEX.md`, `CLAUDE.md`
- `docs/product-brief.md`, `docs/task-log.md`, `docs/open-questions.md`, `docs/data-audit.md`
- `docs/reviews/codex-initial-review.md`, `docs/reviews/open-source-validation-review.md`
- `docs/audits/open-source-validation-compliance-audit.md`
- `docs/decisions/ADR-001-initial-architecture.md`
- `DoorDash Merchant Nudge Engine - Merchant Directory.csv`

Requested files that do not exist (recorded, not endorsed as blockers): `ALWAYS_READ.md`, `docs/audits/codex-compliance-audit.md`.

### Files Changed

- Created `docs/reviews/claude-governance-and-idea-review.md`
- Created `docs/audits/claude-governance-compliance-audit.md`
- Updated `PROJECT_STATE.md`, `docs/task-log.md`, `docs/open-questions.md`

### Independent verification performed

- Re-derived the risk formula from the raw CSV; holds on all 20 rows. Distribution 10 Low / 2 Medium / 8 High confirmed. Noted both Medium rows are exactly 69, leaving thresholds essentially unconstrained.
- Spot-checked the two most-suspicious arXiv citations in the open-source review (`2605.07135`, `2603.20847`) via WebFetch; both are real and titles match. Suspicion dropped.

### Summary

- Central finding: governance has outgrown the product (~12 docs, 0 runnable code, 20-row CSV) and the planning phase has no termination condition.
- The canonical rules live in chat prompts, not the repo; "mandatory files" are partly prompt-invented (this prompt named two files that do not exist — the third session to do so).
- The blended readiness score is unanchored and drifted 3→4 without build progress; recommended retiring it for two separate measures.
- Codex largely followed its rules and its citations are real; it did not catch the meta-risk and its self-audit over-credits "Followed" on rules that were N/A.
- Did not re-litigate the (already-correct) data-model critique.

### Compliance Result

Passed. Review-only scope held; evidence verified at primary source; one weak claim corrected before publication.

### Next Step

User go/no-go decision (see `PROJECT_STATE.md` → Current Next Step). Do not write a fourth review document. If GO, build the thin runnable slice in code with tests inline.

## 2026-06-02

### Tool/Session

Codex validation-only session.

### Task

Open-source validation review of ActivationOps AI project direction, process, architecture, and prior Codex review.

### Scope

- Analysis and documentation only.
- No implementation.
- No CSV modification.
- No Supabase schema.
- No n8n workflow.
- No Slack or Resend integration code.
- No production code.

### Files Read

- `PROJECT_STATE.md`
- `AGENTS.md`
- `README.md`
- `docs/product-brief.md`
- `docs/task-log.md`
- `docs/open-questions.md`
- `docs/data-audit.md`
- `docs/reviews/codex-initial-review.md`
- `docs/decisions/ADR-001-initial-architecture.md`
- `CODEX.md`
- `CLAUDE.md`
- `DoorDash Merchant Nudge Engine - Merchant Directory.csv`

Missing required files recorded:

- `ALWAYS_READ.md`
- `docs/audits/codex-compliance-audit.md`
- `docs/audits/session-compliance-template.md`

### Files Changed

- `docs/reviews/open-source-validation-review.md`
- `docs/audits/open-source-validation-compliance-audit.md`
- `PROJECT_STATE.md`
- `docs/task-log.md`
- `docs/open-questions.md`

### Summary

- Validated the project idea as worth building only as a staged dummy-data simulation.
- Confirmed the prior Codex review was fair and stayed reviewer-only.
- Confirmed the current data model still blocks implementation.
- Validated the architecture direction against current official/open sources.
- Raised readiness from 3/10 build readiness to 4/10 overall validation readiness, with implementation still blocked.
- Identified missing governance files as a process blocker.

### Compliance Result

Passed with warnings.

Warnings:

- `ALWAYS_READ.md` is missing.
- `docs/audits/session-compliance-template.md` is missing.
- `docs/audits/codex-compliance-audit.md` is missing.
- V1 dataset acceptance criteria are missing.

### Next Step

Create governance and acceptance-criteria docs before any integration build:

1. `ALWAYS_READ.md`
2. `docs/audits/session-compliance-template.md`
3. `docs/acceptance-criteria/v1-dataset.md`

## 2026-06-01

### Completed

- Read the attached work order.
- Inspected the project folder.
- Confirmed the folder was not a Git repository.
- Confirmed no project-local `AGENTS.md` existed before this pass.
- Located CSV file: `DoorDash Merchant Nudge Engine - Merchant Directory.csv`
- Parsed the CSV with a structured CSV reader.
- Confirmed 20 merchant records and 9 header columns.
- Identified duplicate header issue: both first and second columns are named `Merchant Name`.
- Inferred and verified the synthetic risk score formula across all 20 rows.
- Created documentation scaffolding requested by the work order.
- Wrote CSV data audit.
- Wrote initial critical review.
- Added open questions and initial architecture decision.
- Used two read-only subagents for CSV audit and architecture/security/automation review.
- Checked current official docs for Supabase API/RLS, n8n error handling, Slack request verification/interactivity, Resend webhooks, Gemini structured outputs, and Google Sheets API limits.

### Validation

- Used local folder listing and file search to inspect project structure.
- Used a structured CSV parse to inspect headers, records, value distributions, duplicate merchant names, and scoring consistency.
- No live integrations, workflows, schemas, credentials, or production code were created.

### Remaining

- Generate a V1-ready dummy dataset.
- Decide canonical onboarding steps and blocker taxonomy.
- Define Supabase schema only after the data model is approved.
- Define n8n, Slack, Resend, and Gemini behavior only after workflow safety controls are approved.
