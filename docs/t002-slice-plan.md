# T-002 Slice Plan — Offline Evaluation and Regression Harness

Status: **implemented and merged to `main` at `a95c0f1` (35/35 tests = T-001 23 + T-002 12).** Companion to [docs/v1-data-dictionary.md](v1-data-dictionary.md) §9 and [docs/roadmap.md](roadmap.md) Phase 2. Artifacts: `eval/golden_merchants.v1.json`, `eval/guardrail_regression.v1.json` (45 cases), `scripts/eval.py`, `tests/test_t002.py`, generated `eval/eval_baseline.v1.json` (not `out/`).

Ratified in [docs/decision-log.md](decision-log.md) (2026-06-02): eval-first sequencing — T-002 before any live Gemini.

## Problem this slice proves

That the project can **measure** deterministic pipeline quality and guardrail detector behavior **offline**, with a locked baseline, before swapping the stub generator for a live model. T-001 proves the workflow runs; T-002 proves you can detect regressions and document “what correct looks like” for all 20 merchants plus an expanded guardrail corpus.

Without this harness, claims about guardrail strength or model improvement would be guesswork ([docs/v1-data-dictionary.md](v1-data-dictionary.md) §9: stub drafts pass **by construction**).

## Why offline eval first

- No API keys, network, cost, or non-determinism.
- Reuses [scripts/pipeline.py](../scripts/pipeline.py) and [scripts/guardrail.py](../scripts/guardrail.py) — eval **calls** T-001, does not replace it.
- Produces `eval/eval_baseline.v1.json` as the evidence object for Phase 3 (Bounded LLM Drafting).
- Matches [RULES.md](../RULES.md) §3: evaluation before claims.

## Inputs

- Read-only source: `DoorDash Merchant Nudge Engine - Merchant Directory.csv` (20 rows).
- Locked golden file: `eval/golden_merchants.v1.json` (generated once from canonical pipeline run, then committed).
- Regression corpus: `eval/guardrail_regression.v1.json`.
- T-001 constants: [scripts/config.py](../scripts/config.py) (`AS_OF_DATE`, `STEP_MAP`, formula versions).
- Existing T-001 fixtures (reference only for migration): `tests/fixtures/guardrail_cases.json`.

**Canonical eval run:** `run_pipeline(SOURCE_CSV, fresh_temp_dir, approvals=None)` — same as T-001 default path without synthetic approvals.

## Outputs

| Artifact | Kind | Purpose |
| --- | --- | --- |
| `eval/golden_merchants.v1.json` | committed fixture | Per-merchant expected fields + aggregate counts |
| `eval/guardrail_regression.v1.json` | committed fixture | Expanded guardrail cases |
| `eval/eval_baseline.v1.json` | generated metrics | Versioned baseline snapshot (default path for `scripts/eval.py`; owner: commit or gitignore) |
| `scripts/eval.py` | CLI | Run eval, print summary, write baseline |
| `tests/test_t002.py` | tests | E1–E10 acceptance for the harness |

Eval runs use **temp directories by default** so committed `out/` from T-001 is not mutated blindly.

## File structure (proposed)

```
eval/
  golden_merchants.v1.json
  guardrail_regression.v1.json
  schema/
    golden_merchants.v1.schema.json   # optional
scripts/
  eval.py                             # optional eval_lib.py if shared helpers needed
tests/
  test_t002.py
out/
  eval_baseline.v1.json               # generated
docs/
  t002-slice-plan.md                  # this file
```

**Do not add:** new pip dependencies, CI workflow (defer), live API clients, changes to `tests/test_t001.py` (additive T-002 only).

## Implementation steps (for the later build task — not now)

1. **Seed golden labels:** run `run_pipeline` once on a clean temp dir; serialize 20 merchants + `aggregate_expectations`; record `source_csv_sha256`; commit `eval/golden_merchants.v1.json`.
2. **Author regression corpus:** migrate T18 regex cases from `guardrail_cases.json` (5 categories as `regex_positive`; `state_mismatch` as the single `structural_positive` case); add near-miss negatives, extra positives, 20 source nudges (`GR-SRC-*`), stub-clean samples (~43–53 cases total).
3. **Implement `scripts/eval.py`:** load golden + regression; score merchant fields; run guardrail cases; write `eval/eval_baseline.v1.json`; exit non-zero on failure.
4. **Implement `tests/test_t002.py`:** E1–E10 (see below).
5. **Validate:** full command list in § Validation; Codex changed-files review; owner approval before merge.
6. **Baseline policy:** owner decides whether to commit the first green `eval_baseline.v1.json` or gitignore it.

## Golden label schema (`eval/golden_merchants.v1.json`)

**Version:** `"eval_version": "golden_merchants.v1"`

**Top-level fields:**

| Field | Purpose |
| --- | --- |
| `eval_version` | Schema version |
| `as_of_date` | `2026-06-01` (must match config) |
| `risk_formula_version` | `risk.v1` |
| `thresholds_version` | `thresholds.v1` |
| `source_csv_sha256` | Pin source file; E2 fails if CSV changes |
| `canonical_run` | `{ "approvals": null, "fresh_out_dir": true }` |
| `aggregate_expectations` | See below |
| `merchants` | 20 objects, sorted by `merchant_id` |

**`aggregate_expectations` (canonical run):**

| Field | Expected |
| --- | --- |
| `merchant_count` | 20 |
| `high_risk_count` | 8 |
| `review_queue_count` | 8 |
| `simulated_sent_count` | 12 |
| `draft_rejected_count` | 0 |
| `review_required_high_only` | true |

**Per-merchant golden fields (eval contract):**

| Field | Source of truth |
| --- | --- |
| `merchant_id` | `M001`–`M020` |
| `source_row_index` | source order |
| `steps_completed` | source CSV |
| `current_blocker_code` | `STEP_MAP[steps_completed]` |
| `next_best_action` | paired with blocker |
| `risk_score` | `compute_risk_score(...)` — must equal source risk score |
| `risk_level` | **carried** from source (`Low` / `Medium` / `High`) |
| `risk_reason_codes` | derived list; compare as **sorted set** |
| `review_required` | `compute_review(risk_level, contact_eligible)` |
| `review_reason` | `high_risk` or empty |
| `approval_state` | `pending_review` if review_required else `not_required` |
| `send_eligible` | send-gate formula |
| `outreach_status` | 12 × `simulated_sent`, 8 × `drafted` (canonical) |
| `contact_eligible` | all `true` on product 20 rows |

**Omitted from golden (still covered by T-001):** draft body text, `idempotency_key` format, append-only log growth on preserve-mode re-runs.

Golden labels are **locked deterministic truth**, not hand-invented fiction.

## Regression cases (`eval/guardrail_regression.v1.json`)

**Version:** `"eval_version": "guardrail_regression.v1"`

### Case kinds

| Kind | ID prefix | Eval function |
| --- | --- | --- |
| `regex_positive` | `GR-POS-` | `scan_text(text)`; see flag matching below |
| `regex_negative` | `GR-NEG-` | `scan_text(text)`; see flag matching below |
| `structural_positive` | `GR-STR-` | `run_guardrail(draft, merchant_context)`; see flag matching below |
| `source_corpus` | `GR-SRC-` | each source nudge (column 7) via `scan_text`; see flag matching below |
| `stub_clean` | `GR-STUB-` | `run_guardrail(make_draft(m), m)`; see flag matching below |

### Flag matching rules (regression cases)

Let `actual` = sorted flag list from `scan_text` or `run_guardrail`, and `expected` = `expect_flags` from the case (order-independent).

| Kind | Rule | Pass when |
| --- | --- | --- |
| `regex_positive` | **Inclusion (subset)** | Every category in `expected` appears in `actual`. Extra categories in `actual` are allowed — do **not** require exact set equality. |
| `structural_positive` | **Inclusion (subset)** | Same as `regex_positive`: `expected` ⊆ `actual` (aligns with T-001 T18 `assertIn` per category). |
| `regex_negative` | **Exact empty** | `actual == []` (no flags). |
| `source_corpus` | **Exact empty** | `actual == []` for each of the 20 source nudge strings. |
| `stub_clean` | **Exact empty** | `actual == []` for each stub/template draft checked. |

**Source CSV integrity (separate from guardrail flags):** tests **E2** and **E8** use **exact** matching — golden `source_csv_sha256` must equal the live file hash; the source CSV must remain byte-identical after eval. That is not a guardrail flag rule.

### Minimum corpus

| Bucket | Target count |
| --- | --- |
| T-001 parity (`regex_positive`) | **5** — one planted body per regex category from `guardrail_cases.json` (all categories except `state_mismatch`) |
| Near-miss negatives | ≥6 |
| Extra positives | ≥6 |
| Structural / `state_mismatch` (`structural_positive`) | **1** — single case (wrong `next_best_action` **or** prose false-completion; not both as separate required rows) |
| Source corpus | 20 |
| Stub clean (steps 0,1,2,3,5) | ≥5 |

**Total:** ~43–53 cases.

**T-001 alignment:** T18 exercises six categories via fixtures; the T-002 corpus uses **5** `regex_positive` parity rows plus **1** `structural_positive` row for `state_mismatch` (structural check, not `scan_text`-only).

### Example `regex_positive`

```json
{
  "case_id": "GR-POS-001",
  "kind": "regex_positive",
  "category": "forbidden_revenue_claim",
  "text": "We guarantee you will earn $500 more every single week once you are live.",
  "expect_flags": ["forbidden_revenue_claim"],
  "merchant_context": null
}
```

### Example `structural_positive`

```json
{
  "case_id": "GR-STR-001",
  "kind": "structural_positive",
  "category": "state_mismatch",
  "draft_overrides": { "next_best_action": "upload_menu" },
  "merchant_context": {
    "merchant_id": "M001",
    "steps_completed": 2,
    "next_best_action": "add_photos",
    "current_blocker_code": "photos_needed"
  },
  "expect_flags": ["state_mismatch"]
}
```

## Metrics (`eval/eval_baseline.v1.json`)

Written by `scripts/eval.py`. Top-level shape:

```json
{
  "baseline_version": "eval_baseline.v1",
  "task_id": "T-002",
  "eval_run_at": "2026-06-01T00:00:00Z",
  "source_csv_sha256": "...",
  "passed": true,
  "merchant_eval": {},
  "guardrail_eval": {},
  "aggregate_pipeline": {},
  "failures": []
}
```

### `merchant_eval`

| Metric | Definition |
| --- | --- |
| `merchants_total` | 20 |
| `merchants_matched` | rows where all golden fields equal pipeline output |
| `field_accuracy` | per-field `{ "correct", "total" }` |
| `blocker_exact_match_rate` | fraction with matching `(blocker, action)` |
| `risk_score_exact_match_rate` | fraction with matching `risk_score` |
| `risk_level_exact_match_rate` | fraction with matching carried `risk_level` |
| `send_eligible_exact_match_rate` | fraction match |
| `outreach_status_exact_match_rate` | fraction match |

**Pass:** `merchants_matched == 20`; else `passed: false` and `failures[]` with `merchant_id`, `field`, `expected`, `actual`.

### `guardrail_eval`

| Metric | Definition |
| --- | --- |
| `cases_total` | regression case count |
| `cases_passed` | cases that pass per § Flag matching rules (`regex_positive` / `structural_positive`: inclusion; `regex_negative` / `source_corpus` / `stub_clean`: exact empty) |
| `regression_pass_rate` | `cases_passed / cases_total` |
| `source_nudge_overflags` | must be **0** |
| `by_category` | pass/fail per category |

**Pass:** `regression_pass_rate == 1.0` and `source_nudge_overflags == 0`.

### `aggregate_pipeline` (fresh temp dir)

| Metric | Expected |
| --- | --- |
| `review_required` | 8 |
| `simulated_sent` | 12 |
| `draft_rejected` | 0 |
| `simulated_send_events` | 12 |

**CLI summary (stdout):** e.g. `MERCHANT 20/20 | GUARDRAIL 52/52 | PASS` or first five failures.

### `scripts/eval.py` CLI (proposed flags)

| Flag | Purpose |
| --- | --- |
| `--out-dir PATH` | Pipeline temp output (default: tempfile) |
| `--baseline-path PATH` | Default `eval/eval_baseline.v1.json` |
| `--fail-fast` | Stop on first failure |

## Tests / checks (acceptance criteria for T-002)

Additive only — **do not modify** [tests/test_t001.py](../tests/test_t001.py).

| ID | Check |
| --- | --- |
| E1 | Golden file exists; `eval_version`; 20 merchants; required keys |
| E2 | `source_csv_sha256` in golden matches live source file |
| E3 | Canonical pipeline in temp dir matches every golden merchant field |
| E4 | Pipeline `counts` match `aggregate_expectations` |
| E5 | Every regression case passes per flag matching rules (inclusion for `regex_positive` / `structural_positive`; exact empty for `regex_negative`, `source_corpus`, `stub_clean`) |
| E6 | `scripts/eval.py` exits 0; writes baseline with required keys |
| E7 | Two consecutive eval runs → identical baseline JSON (exclude volatile `git_head` if present) |
| E8 | Source CSV byte-identical after eval |
| E9 | Each golden `risk_score` matches `compute_risk_score` (formula drift detector) |
| E10 | Regression corpus includes ≥1 `regex_negative` near-miss that must not flag |

**Relationship to T-001:** T-001 = slice acceptance (T1–T18 + P2-*). T-002 = regression/baseline. Overlap with T11 (`GR-SRC-*`) is intentional until a later hygiene dedupe.

## Validation commands

Run from repo root (after implementation):

```bash
# T-001 still green
python3 -m unittest tests.test_t001 -v

# T-002 harness
python3 -m unittest tests.test_t002 -v

# Combined gate
python3 -m unittest tests.test_t001 tests.test_t002 -v

# Eval CLI + baseline artifact
python3 scripts/eval.py

# Optional T-001 artifact refresh (not required if eval uses temp dirs)
python3 scripts/run.py --fresh

# Source integrity
python3 -c "import hashlib, pathlib; p=pathlib.Path('DoorDash Merchant Nudge Engine - Merchant Directory.csv'); print(hashlib.sha256(p.read_bytes()).hexdigest())"
```

## Edge cases

- Source CSV changes → E2 / golden `source_csv_sha256` fail until golden is regenerated with owner approval.
- `risk_reason_codes` in CSV are `;`-joined; golden and comparison use sorted lists.
- Eval must not require mutating committed `out/audit_log.csv` or `out/model_runs.csv`.
- Stub drafts still pass guardrails by construction; T-002 scores **detectors** on planted/adversarial text, not LLM quality.
- Planted `regex_positive` text may trip multiple categories; pass if **all** `expect_flags` are present (inclusion), even when `actual` is a strict superset.
- `regex_negative`, `source_corpus`, and `stub_clean` must stay **exact-empty** — any flag fails the case.

## Explicitly out of scope

Live Gemini or any API; secrets; Slack / Resend / Supabase / n8n; changes to source CSV; rewrites of T-001 tests; LLM output quality scoring; threshold “correctness” claims; performance benchmarks; CI; dashboard UI; enforcement hooks (separate approved task per [docs/research/source-intake-review.md](research/source-intake-review.md)).

## Codex review focus (before implementation merge)

1. Is the golden field set minimal but sufficient to catch real pipeline regressions?
2. Will the regression corpus actually stress near-miss cases (T11 protection) without bloating maintenance?
3. Is committing `eval_baseline.v1.json` the right artifact policy vs gitignore?
4. Does eval stay stdlib-only and temp-dir-safe?
5. Any scope creep into changing T-001 behavior?

## GO / NO-GO criteria for implementation

**GO when all are true:**

- This plan and [docs/roadmap.md](roadmap.md) Phase 2 are approved by the human owner.
- T-001 remains **23/23** green before and after T-002 merge.
- Codex adversarial or changed-files review completed (or deferred with written reason).
- Test list **E1–E10** is the T-002 acceptance criteria.
- No live integration or source CSV mutation.

**NO-GO if any:**

- T-001 tests are weakened or rewritten to make T-002 pass.
- Golden labels are invented without a canonical pipeline export.
- Eval requires network, secrets, or live model calls.
- Scope adds LLM-quality scoring or changes send-gate semantics without a decision-log entry.

## Definition of done (T-002)

- All E1–E10 tests pass; T-001 suite still 23/23.
- `python3 scripts/eval.py` exits 0 and writes a deterministic baseline.
- `docs/task-log.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md` updated.
- Codex review completed or intentionally deferred with reason.
- Human owner approves merge; commit decision is owner’s.
