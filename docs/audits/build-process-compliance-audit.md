# Build-Process Compliance Audit (Retrospective: Planning → T-002 Merge)

**Audit date:** 2026-06-04 · **Auditor:** Claude Code (Opus 4.8), account 1 · **Type:** retrospective, review-only
**Window audited:** initial planning → governance reconciliation → T-001 → roadmap → T-002 plan → Cursor implementation → 8 in-session Codex reviews → commit + merge to `main`.

> This audit reviews *how the project was built*, not the product. It is internal (`RULES.md` §8). All metrics remain **simulated on dummy data**.

## Professional Process Applied

Task type: post-stage build-process compliance audit · Stage: post-T-002-merge, pre-Phase-3 · Risk: low–medium (review + minimal continuity-doc corrections; **no code/tests/CSV/`out`/integration change**) · Mode: full-but-narrow (reads broadly, edits surgically) · Basis: `RULES.md`, `CLAUDE.md`, `CODEX.md`, `docs/enterprise-delivery-playbook.md`, the 8 in-session Codex reviews, git history, and **live test/eval execution** · Source requirement: repo + git + primary execution evidence (not memory) · Validation: re-ran `tests.test_t001 tests.test_t002` (35/35) and `scripts/eval.py` (PASS); re-derived git state; verified each Codex finding's resolution in the committed tree · Artifact policy: this audit = internal review artifact (commit candidate; owner decides) · Documentation: this file + a `docs/task-log.md` entry + surgical git-state corrections to the three state docs · Codex review: recommended (confirming `/codex:review` of this doc batch) · Human approval: **not** required for the audit + continuity corrections (the task pre-authorized "update state docs only if needed"); **required** for the recommended `docs/decision-log.md` row, the `t002-slice-plan.md` fix, and any commit.

---

## Top-line verdict

**The build process was followed well, with one material recurring failure and one traceability gap.**

- **Engineering discipline was strong end-to-end.** Every phase shows planning → validation → Codex review → an owner gate. T-002 passed through **8 Codex review rounds**; every finding was resolved **before** the commit, and several were hardened into permanent tests and a detector. Tests (35/35) and the eval (PASS) are real and reproducible — re-run during this audit. No integrations, no secrets, no source-CSV edits, no `out/` pollution.
- **Material recurring failure:** the **git-state / handoff line drifted again** at the T-002 close. A control for exactly this failure already exists (it was created *because* the line went stale 3× in T-001) — it simply **was not run at the merge gate**. The three state docs still describe T-002 as uncommitted on a feature branch. *This audit corrects the three git-state lines* (see Corrections).
- **Traceability gap (not a scope violation):** a T-001 guardrail behavior change (hardening `pii_or_secret`) was folded into the T-002 commit without a `docs/decision-log.md` row, and was initially mis-described as "T-001 unchanged." The change is low-risk and safety-improving; the review process caught the misstatement. A decision-log row is recommended.

**Stage status:** T-002 = **closed with minor follow-ups**. Phase 3 (bounded LLM drafting) should **not** start until the follow-ups below are cleared.

---

## Scope, method, and evidence

**Re-derived git state — snapshot at audit start, 2026-06-04 (before this audit made its own doc edits):** branch `main`; `HEAD = dc7d131` ("Clean up T-002 merge status"); working tree clean *at that point*. This is a point-in-time snapshot, **not** a standing claim: this audit's own corrections plus the 2026-06-04 decision-log ratifications are themselves an **uncommitted batch**, so a reader during that window will see a dirty tree. Always re-derive from live `git status` / `git log` (`RULES.md` §1, the source of truth) rather than trusting this line.

**Relevant history (linear):**
`dc7d131` (main tip) → `a95c0f1` (T-002 implementation) → `1a0dbd0` (T-002 plan) → `df2b986` (roadmap) → … → `653245b` (T-001) → `b57cf2c` (initial).
T-002 was integrated by **fast-forward**: `main` advanced to the feature tip `a95c0f1`, then one cleanup commit `dc7d131` was added on `main`. Branch `feature/t002-eval-harness` still exists at `a95c0f1` (1 behind `main`; not deleted).

**Primary evidence gathered:**
- Governance set read in full: `RULES.md`, `CLAUDE.md`, `CODEX.md`, `docs/enterprise-delivery-playbook.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`, `docs/decision-log.md`, `docs/t002-slice-plan.md`.
- `git show --stat a95c0f1` (12 files, +1853 / −37) and `dc7d131` (1 file, +1 / −1).
- **Live execution (this audit):** `python3 -m unittest tests.test_t001 tests.test_t002` → `Ran 35 tests … OK`; `tests.test_t001` alone → `Ran 23 … OK`; `python3 scripts/eval.py --baseline-path /tmp/...` → `MERCHANT 20/20 | GUARDRAIL 45/45 | PASS` (exit 0). The tree was still clean after those runs (the test/eval execution wrote nothing into the repo) — again, a snapshot before this audit's own doc edits.
- The 8 Codex review transcripts produced in this session (working-tree reviews, pre-commit).

---

## The 11 checks

### 1. Did we follow `RULES.md`, `CLAUDE.md`, `CODEX.md`, and the enterprise-delivery-playbook?

**Largely yes.** Every `docs/task-log.md` entry opens with a **Professional Process Applied** block (startup contract §15) and closes with an owner gate. Lightweight-vs-full (§13) was applied correctly — T-002 was run lightweight, which fits a deterministic, offline, stdlib-only slice. Source/pattern intake (§14) was applied. Most importantly, **evaluation-before-claims (`RULES.md` §3)** is honored at the structural level: T-002 *exists* to build the measuring stick before any live model.

**Two gaps:** the **git-state re-derivation rule** (Handoff-Proof Standard) was not executed at the merge gate (check #3/#4), and the **decision-log discipline (`RULES.md` §6)** was missed for the guardrail change (check #5). Both are detailed below.

### 2. Did every major phase have planning, validation, Codex review, and owner approval?

**Yes** (owner approval *inferred* — see Evidence limitations).

| Phase | Planning | Validation | Codex review | Owner gate |
| --- | --- | --- | --- | --- |
| Planning / reconciliation | governance review + `plan-reconciliation.md` | CSV facts re-derived | Codex initial + open-source validation | GO/NO-GO (given) |
| T-001 | `v1-slice-plan.md` + data dictionary | 23/23 tests; canonical run | adversarial (NO-SHIP) → changed-files (4×P2) → final (2×P2) | committed `653245b`, `2ccafce` |
| Governance (playbook, startup contract, intake, source openness) | blindspot review first | section-coverage checks | adversarial + doc-sync | committed through `f28ae90`, `cb80286` |
| Roadmap | applicability review | forbidden-term grep | adversarial → revision → review correction | committed `78dc694`, `df2b986` |
| T-002 plan | `t002-slice-plan.md` | completeness vs ratified scope | **deferred to implementation** (documented) | committed `1a0dbd0` |
| T-002 build (Cursor) | follows slice plan | 35/35; eval PASS | **8 review rounds** → final clean | committed `a95c0f1`, merged, `dc7d131` |

The T-001 arc in particular is textbook: a **NO-SHIP** on the missing send-gate was caught at plan review, fixed, and re-validated before any code shipped.

### 3. Did we re-derive git state correctly?

**During the work, yes; at the T-002 merge gate, no.** Each task-log entry re-derives `HEAD`. But the post-merge state was never re-derived into the three state docs. As of this audit they still read (verbatim, as-found):

- `PROJECT_STATE.md`: "branch `feature/t002-eval-harness`; `HEAD = 1a0dbd0` … **Uncommitted T-002 implementation**."
- `CURRENT_TASK.md`: "branch `feature/t002-eval-harness`; `HEAD = 1a0dbd0` … **Uncommitted**."
- `HANDOFF.md`: "**T-002 implemented** on `feature/t002-eval-harness` (not committed)"; "`HEAD = 1a0dbd0`; uncommitted."

Real state: `main` @ `dc7d131`, T-002 **committed** (`a95c0f1`) and merged, tree clean **at audit start**. The `dc7d131` "Clean up T-002 merge status" commit corrected only the `t002-slice-plan.md` header (1 line) and **missed the three state docs**. *This audit corrects them* (see Corrections).

### 4. Did state docs drift, and were they corrected?

**They drifted; correction was partial.** Beyond the git-state lines above, the project's own task-log shows this is a *pattern*: multiple entries are explicitly "doc-sync correction" / "corrected stale git-state." The recurring shape is: docs are written to describe a *pre-action* state, then not re-derived after the action (commit/merge) lands. The `dc7d131` cleanup was the post-merge correction attempt — and it only reached one of four documents.

### 5. Did Cursor stay within approved scope?

**Mostly yes, with one traceability gap.** The eval harness matches `docs/t002-slice-plan.md`: golden labels, regression corpus (**45** cases, inside the planned ~43–53), `scripts/eval.py`, `tests/test_t002.py` with **E1–E10 plus E1b/E2b**, baseline written to `eval/` (not `out/`). `tests/test_t001.py` was **not** modified (slice-plan constraint honored).

**The exception:** `scripts/guardrail.py` was changed (+2 lines) to harden `pii_or_secret` with an assignment-form detector (the `api_key=` secret-assignment pattern). That is a **T-001 safety-control behavior change** made inside a slice framed as "eval *calls* T-001, does not replace it." It is **low-risk and strictly safety-improving**, T-001 still passes 23/23, and the data-dictionary §9 was synced in the same commit — but per `RULES.md` §6 it warranted a `docs/decision-log.md` row and an explicit owner heads-up, not silent inclusion. It was initially mis-stated as "T-001 unchanged" in `HANDOFF.md` and **only disclosed after Codex flagged it** (rounds 6–7). Verdict: a **traceability gap on a beneficial change the review process caught** — not a scope violation.

### 6. Did Codex findings get fixed before commits?

**Yes — cleanly, and this is the strongest part of the record.** Eight working-tree review rounds ran before the commit; the final round was clean, then the commit followed. Resolutions, verified in the committed tree:

| Round | Finding(s) | Resolution (verified) |
| --- | --- | --- |
| 1 | parity regex count off-by-one | `t002-slice-plan.md` now "5 `regex_positive` + 1 `structural_positive`" (lines 154/163) |
| 2 | clean (docs only) | — |
| 3 | stale HEAD; baseline path; golden-metadata gap; corpus-count gap | metadata → **test E2b**; counts → **test E1b**; baseline path reconciled (one residual, below); HEAD corrected (then re-staled post-merge → check #3) |
| 4 | doc test count 33→35; routable Gmail fixture | docs say 35 (verified 35); fixture replaced by sentinel |
| 5 | aggregate gate didn't validate `simulated_send_events` | `_check_aggregate` now **compares** vs `simulated_send_events_count: 12` (eval.py:459-465); **E4** asserts `== 12` |
| 6 | live-key-shaped fixture; guardrail/dict desync; fail-fast diagnostics | No real secrets or routable credentials committed; the secret-pattern regression uses synthetic/non-routable sentinel data (assembled at runtime); data-dictionary §9 synced; fail-fast implemented |
| 7 | "T-001 unchanged" false; fail-fast not implemented | HANDOFF discloses the guardrail change; fail-fast fully implemented (eval.py:296-573, 662) |
| 8 | clean | commit `a95c0f1` followed |

Two findings became **permanent regression tests** (E1b corpus counts, E2b golden-metadata-vs-config) and one became a **hardened detector** — turning review findings into durable guarantees rather than one-off patches.

### 7. Did we avoid integrations, secrets, source-CSV edits, and `out/` pollution?

**Yes, on all four.**
- **Integrations:** none. Stdlib only; no network/API/model call. Eval *calls* the existing T-001 pipeline.
- **Secrets:** none. No real secrets or routable credentials were committed; the secret-pattern regression uses synthetic/non-routable sentinel data. The one secret-shaped test case uses sentinel `__REGRESSION_PII_API_KEY_ASSIGNMENT__`, and the secret-shaped string is assembled from fragments **at runtime** rather than stored as a literal (`RULES.md` §11 upheld).
- **Source CSV:** untouched — last modified at the initial commit `b57cf2c`; not in the `a95c0f1` file list; E2/E8 pin and re-check its hash.
- **`out/`:** not in the T-002 commit; `git status out/` clean; eval writes to `eval/` and to temp dirs. The audit's own test/eval runs left the tree clean (at that point, before this audit's doc edits).

### 8. Did tests/eval evidence support the claims?

**Yes — verified by re-execution, not assertion.** `Ran 35 tests … OK` (T-001 23 + T-002 12); T-001 alone `Ran 23 … OK`; eval `MERCHANT 20/20 | GUARDRAIL 45/45 | PASS` (exit 0). The harness self-validates the aggregate counts (review #5 fix), so a non-canonical run can no longer silently PASS. Determinism (E7) and source-integrity (E8) are encoded as tests.

### 9. What rules worked well?

- **Adversarial review as a gate, not a formality** — the T-001 NO-SHIP and the 8-round T-002 loop demonstrably changed the artifact before it shipped.
- **Findings → durable guarantees** — E1b/E2b tests and the hardened detector.
- **Lightweight-vs-full proportionality (§13)** — T-002 ran lightweight and was not over-ceremonied.
- **Repo-as-source-of-truth + Professional Process blocks** — every task is reconstructable from the log.
- **Honesty controls** — "simulated," dummy data, no-fake-impact held throughout; no AI-authorship overclaim.
- **Early self-correction** — the project diagnosed its own "governance over product" failure and reconciled it (rejected the docs-first gate, the 14-table schema, and the blended readiness score).

### 10. What repeated failure patterns appeared?

1. **Git-state / handoff-line drift (dominant, recurring).** Stale ≥3× in T-001 → a rule was created specifically for it (playbook: "*this rule exists because the handoff git-line went stale three times in T-001*") → it drifted again **during** T-002 (Codex round 3) → and **again at the merge gate** (this audit). **The control exists; it was not enforced at task-close.** That reframing matters: the fix is *enforcement at the gate*, not another standing doc.
2. **Pre-action documentation not re-derived post-action.** State docs describe intended state, then aren't refreshed once the commit/merge lands; cleanup passes are partial.
3. **Beneficial change without a decision-log trail.** The guardrail hardening (check #5) — caught by Codex, but the trail (decision-log row, accurate handoff) lagged the change.
4. **Minor residual doc inconsistency.** `t002-slice-plan.md` "File structure (proposed)" block still shows `out/eval_baseline.v1.json`, though the implemented + corrected default is `eval/eval_baseline.v1.json`. Cosmetic; recommend fixing (below).
5. **Weak early audit trail (historical, resolved).** Pre-git, folder docs carried inconsistent dates (2026-06-02 vs the authoritative 2026-06-01). Git now arbitrates chronology.

### 11. What lightweight checklist should be followed before Phase 3?

**Pre-Phase-3 gate (clear all before any bounded-LLM-drafting code):**

1. **Re-derive git state at task-close, every time.** Make the prevent-repeat-checklist git-state step a *blocking* close-out action, not advisory — the control already exists; enforce it. (Addresses the #1 recurring failure.)
2. ✓ **Done 2026-06-04** — `docs/decision-log.md` row added for the `pii_or_secret` guardrail hardening (T-001 behavior change made during T-002).
3. ✓ **Done 2026-06-04** — `eval/eval_baseline.v1.json` artifact policy ratified in `docs/decision-log.md` (intentionally committed under `eval/`, not `out/`).
4. **Resolve the two long-standing hygiene follow-ups** *before* adding Phase-3 surface: `out/` volatile-log tracking policy; and the **enforcement-hooks** decision (CSV-immutability / secrets-blocking). Phase 3 introduces live model calls + secrets, so the secrets-hook decision is now timely, not optional.
5. **Confirm the baseline is accepted as the locked pre-Gemini measuring stick** — that is the entire purpose of T-002; Phase 3 claims must be measured against it.
6. **Treat Phase 3 as FULL workflow** (`RULES.md` §13): live model = AI behavior + integration + secrets + cost + non-determinism. Required before code: source-backed model/freshness check, adversarial plan review, decision-log entry, full source/pattern intake. **Do not start under a lightweight loop.**
7. **Fix the residual `out/` → `eval/` baseline path** in `t002-slice-plan.md`. *(Recommended doc fix; see below.)*

---

## Corrections made by this audit (continuity only)

Per the task's "update state docs only if needed," and the Handoff-Proof Standard, this audit makes **surgical** corrections to the stale git-state lines so the next session does not continue from a false baseline. The as-found text is preserved verbatim in check #3 above.

- `PROJECT_STATE.md` — git-state + "Last updated" lines: `feature/t002-eval-harness` / `HEAD = 1a0dbd0` / "uncommitted" → `main` / `HEAD = dc7d131`, T-002 committed (`a95c0f1`) + merged. *(The corrected `PROJECT_STATE.md` line records "tree clean" only as the audit-start snapshot and flags this audit's own batch as uncommitted — defer to live `git status`.)*
- `CURRENT_TASK.md` — current-stage + status lines: same correction; next safe step → Phase-3 pre-gate (above).
- `HANDOFF.md` — latest block: T-002 **merged**, not "implemented/uncommitted"; git line re-derived.
- `docs/task-log.md` — new entry recording this audit.

**No** change to `scripts/`, `tests/`, the source CSV, `out/`, `eval/`, or any integration. **No commit** (owner decides).

## Recommendations (owner disposes)

> **Update 2026-06-04 (same day):** the owner ratified the first two items — `docs/decision-log.md` now carries a row for the `pii_or_secret` guardrail hardening and a row fixing the `eval/` baseline artifact policy (committed under `eval/`, not `out/`). Pre-Phase-3 gate items #2 and #3 are closed. The remaining items below are still open.

- ✓ **Done** — **`docs/decision-log.md` row** added for the guardrail `pii_or_secret` hardening (records the T-001 behavior change merged in `a95c0f1`; `RULES.md` §6).
- ✓ **Done 2026-06-04** — **`t002-slice-plan.md` baseline references updated** to the ratified policy: the proposed-structure block now lists `eval/eval_baseline.v1.json` (the old `out/` path removed); the Outputs table, implementation step 6, and Codex-review-focus Q3 now state it is intentionally committed under `eval/`. No "owner decides / commit or gitignore" wording remains.
- **Confirming `/codex:review`** of this audit + the state-doc corrections before commit.
- Optionally **delete or fast-forward** `feature/t002-eval-harness` (currently 1 behind `main`) to avoid a stale branch.

## Evidence limitations (honesty)

- **Owner approval is inferred, not directly verifiable from the repo.** Commits exist (author: Sharan Kumar) and the workflow gates each on an owner decision, so approval is the reasonable inference — but the repo does not record explicit per-gate sign-off.
- **Cursor's internal process is visible only through its outputs** (the commit, the docs, and the 8 Codex transcripts). This audit assesses what landed in the repo, not Cursor's session.
- Test/eval evidence reflects **this machine, 2026-06-04**; it is reproducible via the documented commands.
