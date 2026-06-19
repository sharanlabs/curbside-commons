# Plan: T-003 — Pre-Phase-3 Hardening (de-brand · draft contract · v2 hybrid lane · adversarial corpus · hooks)
_Locked via grill — by Claude + the owner, 2026-06-12; Codex Act 2 rounds 1–2 applied (slice plan = **draft 4**). This file is the grill-locked decision summary + arbiter log; [docs/phase3-prep-slice-plan.md](docs/phase3-prep-slice-plan.md) is the authoritative detail._

## Goal

Make the offline baseline measure what Phase 3 (bounded Gemini drafting) will actually change — generated draft text — before any model lands, while de-branding the repo to a company-agnostic public artifact. Build five slices (S1 de-brand → S2 generator-agnostic draft contract → S3 v2 hybrid demo/eval lane → S4 adversarial guardrail corpus → S5 enforcement hooks), each independently shippable, with the frozen v1 regression proof (35/35 tests + eval 20/20 | 45/45) passing **unmodified** after every slice.

## Approach

1. **S1 — De-brand to `PLATFORM_NAME` = "Curbside Commons"** (2-minute trademark/web collision check at build time; fallback variant routed to owner if it collides). Rename the v1 source CSV to a company-agnostic filename via `git mv` + the single `SOURCE_CSV` re-pin at `scripts/config.py:10` (the only **runtime-code** filename reference — verified live 2026-06-12; docs and the regenerated `out/audit_log.csv` also carry the old name and are updated/re-named in S1; content stays byte-identical, so the golden's `source_csv_sha256` pin and the unmodified frozen tests still pass). Parameterize the `false_impact_claim` guardrail (`scripts/guardrail.py:29-31` is literally anchored on `doordash`) to cover both `PLATFORM_NAME` and real marketplace names, with comparative negatives that must not over-flag. De-brand `make_draft` copy, README, and all identity surfaces. Regenerate `out/` with one `--fresh` run under the commit-fresh policy.
2. **S2 — Generator-agnostic draft contract** on the four generated text fields (state-consistency · structure · policy), fixtures independent of the stub's phrasing, two visible scoring tracks (blocking regression vs measured probes).
3. **S3 — v2 hybrid demo/eval lane**: open-source base fetched once + de-identified + frozen (US-market flavor — owner-confirmed), synthetic edge-case overlay firing every safety path, `normalize_row` schema extension that is provably non-breaking for v1 (`scripts/pipeline.py:268` hardcodes contact fields today), new `DEMO_CSV` + golden v2 + baseline v2 + `tests/test_t003.py`.
4. **S4 — Adversarial guardrail corpus (v2)** modeling LLM failure modes; measured catch-rate recorded, misses triaged before Phase 3.
5. **S5 — Enforcement hooks**: blocking, location-anchored secrets hook; git-state re-derivation as a **blocking** close-out check; `out/` policy executed as **commit-fresh** (owner-decided).
6. After each slice: `python3 -m unittest tests.test_t001 tests.test_t002 [tests.test_t003]` + `python3 scripts/eval.py` green; Codex changed-files review per slice; owner commits.

## Key decisions & tradeoffs (grill-resolved 2026-06-12)

- **OQ-1 (owner overrode the keep+label recommendation): full identity de-brand including the v1 CSV filename.** Rename via `git mv` + one config line; content byte-identical (sha256 pin is name-independent; frozen tests reference `C.SOURCE_CSV`, not the literal). Residual DoorDash strings inside the frozen v1 fixture content and v1 guardrail corpus are **kept byte-identical + honestly labeled** (provenance note: historical dummy fixture; marketplace names appear as test data only; no affiliation); at **Phase 7** the owner decides publish-labeled vs exclude-from-public-artifact. Tradeoff accepted: maximum de-brand without destroying the hash-pinned v1 proof.
- **OQ-2: `out/` policy = COMMIT-FRESH** (owner-decided; gitignore option rejected). One clean `--fresh` run of all 4 files is committed; re-runs are throwaway (`git checkout -- out/` before commits). S1's snapshot regeneration is unblocked.
- **PLATFORM_NAME = "Curbside Commons"**, pending only the S1 collision check (RULES §6 — verified, not from memory).
- **Product target market = US** (owner-confirmed intake answer per standing PROJECT-CONSTRAINTS) — shapes S3 dataset realism and Phase-7 framing.
- Ratified and **not reopened**: DoD (2026-06-11), add-alongside v1/v2, HYBRID data (download-once-freeze IN, runtime APIs OUT), de-brand direction.

### Codex Act 2 round-1 revisions folded in (2026-06-12 → slice plan draft 4; all 15 findings accepted)
Execution sharpened, no locked decision reopened, still S1→S5 (no new slice). The load-bearing changes:
- **Mechanical enforcement, not honor-system:** sha256-pin the v1 corpus (#2); committed **nonzero-exit** `scripts/check_secrets.py` + `scripts/check_git_state.py` with failing-case tests (#12) — the hooks BLOCK, not advise.
- **Anti-stub-leak (S2, #1):** positive paraphrased-good fixtures per blocker/action + a test asserting no `make_draft` literals + invariant-based scoring.
- **Guardrail honesty (#4):** "provably gap-free" → bounded phrase families + measured-miss triage; de-brand coverage proven by an **additive** test outside frozen v1 (#3).
- **v2 lane realism (S3, #5–8):** header-aware v2 adapter (v1 positional path untouched); `draft_rejected` moved to the S4 eval corpus (the clean stub can't reject live, #6); **lane-aware `scripts/eval.py` args** so the v2 numbers are actually producible (#7); v2 outputs **isolated** from the v1 `out/` snapshots (#8).
- **Secrets breadth (#10–11):** fixture matrix incl. `GEMINI_API_KEY=…`, bearer/JWT, private keys, `.env`, conn strings; allowlist narrowed to exact sentinel patterns + a test that a real cred in an allowlisted file still blocks.
- **OQ-1 honesty (#13–14):** "one reference" narrowed to runtime **code**; docs + regenerated `out/audit_log.csv` also de-named; a real **provenance sidecar** ships with the frozen v1 fixture.
- **Doc drift (#15):** decision-log filename-"untouched" wording marked superseded; roadmap `out/`-untouched corrected to commit-fresh.
- One nuance flagged to owner: cumulative effect makes T-003 **more rigorous** (good) — scope-deepening within the same five slices, not scope-creep.

## Risks / open questions

- Phase-7 publish-vs-exclude call on the labeled v1 lane (owner, at Phase 7 packaging).
- S3 dataset pick is a build-time Source-Intake item (license · PII · quality · freshness), not pre-picked.
- Parameterized guardrail must keep v1 at 45/45 with **zero corpus edits** — that green run is the non-breaking proof; Codex challenges the false-negative surface.
- The Codex Act-2 adversarial review of this plan is **blocked on the seat** (usage-limit error 2026-06-12, surfaced verbatim in PLAN-REVIEW-LOG.md) — build does not start before it runs (owner standing order + RULES §9 deferral).

## Out of scope

Any live Gemini/model call · real secrets · network at runtime (S3's one-time fetch is build-time, recorded + frozen) · new pip dependencies · modifying `tests/test_t001.py`/`tests/test_t002.py` (additive-only) · editing v1 source CSV **content** or its golden/baseline (filename rename only, content byte-identical) · real sends · 24/7/hosting/ops machinery · paid tools (free-first; Gemini <$5 enters only at Phase 3).
