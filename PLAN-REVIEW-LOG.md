# Plan Review Log: T-003 — Pre-Phase-3 Hardening

Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.

## Act 1 — Grill (2026-06-12, Claude Fable 5 ↔ owner)

Four open questions put to the owner one at a time, with recommendations; plus one follow-up the grill surfaced live:

1. **OQ-1 — v1 CSV filename** (recommended keep+label): owner **overrode** — "dont anything related doordash. keep company agnostic" → **rename to a company-agnostic filename**. Live verification during the grill: the filename literal exists in exactly one place (`scripts/config.py:10`) **— *later narrowed (round-1 #13) to "only runtime-*code* reference": docs + the regenerated `out/audit_log.csv` also carry the old name and are swept in S1.*** All frozen tests use `C.SOURCE_CSV`; the golden pins content sha256 (name-independent) → rename = `git mv` + 1 config line, frozen tests unmodified.
   - **Follow-up (residual content):** the fixture's *content* holds 11 DoorDash mentions (dummy nudge text) and the v1 guardrail corpus keeps DoorDash test strings — editing either destroys the hash-pinned proof. Owner chose **"Label now + decide at Phase 7"**: content stays byte-identical with an honest provenance label; Phase 7 decides publish-labeled vs exclude. ("Also scrub v1 content" was offered and not chosen.)
2. **OQ-2 — `out/` two-log policy** (recommended gitignore): owner first asked what the plan said (answer: draft 2 left it open by design), then chose **commit-fresh** — one clean `--fresh` run of all 4 files committed; re-runs throwaway.
3. **PLATFORM_NAME:** owner accepted the recommendation — **"Curbside Commons"** + 2-minute trademark/web collision check at S1.
4. **Product target market:** owner accepted the recommendation — **US**.

Ratified items (DoD, add-alongside, HYBRID, de-brand direction) were not re-litigated, per owner order.

## Act 2 — round 1, attempt 1: **VOID (harness bug + stale shared tmp path, 2026-06-12 ~16:05)**

The seat came back alive (smoke test: `ALIVE`, exit 0) and round 1 launched — but the orchestrating pipeline used `… --json | grep thread.started | head -1`, and `head -1` closes the pipe after the first JSON event, killing `codex` mid-review (SIGPIPE). The verdict file then read was `/tmp/codex-verdict.txt` — the skill's *shared canonical path* — still holding a **stale 15:44 verdict from a different project** (`supply-chain-ai-resilix`; mtime predates our 15:59 thread `019ebd6a-3f59-…`). **All 12 findings in that file were discarded as cross-project contamination (project-isolation rule); none pertain to this repo.** Fixes applied to the harness: project-specific paths (`/tmp/codex-verdict-activationops.txt`, full stream to `/tmp/codex-stream-activationops.jsonl`) and no truncation of the live pipe (grep the stream file after exit). Lesson for the skill: the canonical `/tmp/codex-verdict.txt` path collides when multiple projects run Act 2 the same day — always namespace it.

## Act 2 — round 1, attempt 2: **SEAT EXHAUSTED MID-RUN (2026-06-12 ~16:14)**

Fixed harness (namespaced verdict path, full-stream capture) launched cleanly — thread `019ebd71-b670-7361-8c83-e62acec3a109` started, then the turn failed instantly. Raw error, verbatim:

```
You've hit your usage limit. Upgrade to Pro (https://chatgpt.com/explore/pro), visit https://chatgpt.com/codex/settings/usage to purchase more credits or try again at 8:30 PM.
```

Per the owner standing order: surfaced verbatim, **stopped** — no retry, no account switch. The earlier smoke test (17,705 tokens) + the SIGPIPE-killed attempt 1 consumed the seat's remaining allowance. **Act 2 remains owed (RULES §9 deferral, not skipped); build stays blocked behind it.** Resume: smoke-test, then re-run round 1 with the same prompt (`/tmp/grill-review-prompt.txt`, regenerate from this log if /tmp was cleared) and the namespaced harness.

## Round 1 — Codex (2026-06-12, thread `019ebedb-da03-7db2-83c3-cc395e298e1a`, ~1.96M input / 14.4K output tokens, read-only + 3 scoped subagents)

**VERDICT: REVISE** — 15 findings, all project-specific (verified: references guardrail.py, make_draft, normalize_row, eval.py, OQ-1, Curbside Commons — no cross-contamination this run). Full critique:

1. **S2 can still encode the stub.** Plan says paraphrased fixtures, but acceptance only says "stub passes + bad drafts fail"; `make_draft()` is a fixed template and `validate_draft()` mostly checks non-empty fields. Fix: require positive paraphrased-good fixtures per blocker/action, assert no exact `make_draft` literals, score invariants not phrasing.
2. **S1 "zero v1 corpus edits" not mechanically enforced.** Eval checks minimum corpus *counts*, not a fixture hash. Fix: pin `eval/guardrail_regression.v1.json` sha256, fail v1 eval/tests on drift.
3. **S1 guardrail coverage split inconsistently.** S1 requires PLATFORM_NAME positives/comparative negatives, but the plan defers platform-flavored cases to v2/S4. Fix: add *additive* S1 tests (outside frozen v1) for Curbside Commons + DoorDash/Uber Eats/Instacart positives + "like/similar to" negatives.
4. **`false_impact_claim` cannot be "provably gap-free" with finite regex.** Current probes miss `Uber Eats endorsed…` / `Curbside Commons officially…`. Fix: define bounded phrase families; treat uncovered variants as measured misses → triage before Phase 3.
5. **S3 v2 ingestion underspecified.** `read_source()` drops headers and `normalize_row()` uses positional indexes → optional v2 fields brittle. Fix: header-aware v2 adapter while preserving the exact positional v1 path/defaults.
6. **S3 malformed-contact + rejected-draft paths don't flow through the pipeline.** Validation rejects many malformed emails; `run_pipeline()` always calls clean `make_draft()`. Fix: define v2-only malformed handling; move `draft_rejected > 0` to the S4 eval corpus (or add a v2 bad-draft hook).
7. **v2 eval can't be produced by the planned command.** `scripts/eval.py` hardcodes v1 defaults (`baseline_version = eval_baseline.v1`, `task_id = T-002`, no `--source-path`). Fix: add lane/version/source args (or all-lanes default emitting correct v1/v2 metadata).
8. **v2 outputs can contaminate v1 naming/provenance.** `run_pipeline()` writes `merchants_v1.csv`, appends shared logs, uses `TASK_ID = T-001`. Fix: lane-aware output filenames/metadata or isolated v2 output dirs.
9. **S4 realism unenforceable.** "LLM failure modes" could become more short regex strings. Fix: require `risk_axis`/`realism_basis` metadata, multi-paraphrase cases outside exact detector windows, recorded miss triage.
10. **S5 secrets hook too vague; current detector misses common secrets** (`GEMINI_API_KEY=…`, bearer JWT-like tokens, connection strings). Fix: staged-file fixture matrix for current verified Gemini/env-key forms, generic/bearer tokens, private keys, `.env`, JSON creds, DB URLs.
11. **S5 allowlist can punch a hole.** "Allow security docs and the `scripts/eval.py` sentinel" is too broad. Fix: allowlist only exact sentinel fragments/line patterns + a test proving a real credential in those same files still blocks.
12. **"Blocking" git-state enforcement isn't anchored to a nonzero command.** Checklist is advisory; `.git/hooks` only has samples. Fix: committed `scripts/check_secrets.py` + `scripts/check_git_state.py`, wired into close-out, with failing-case tests.
13. **OQ-1 "only filename reference" is false repo-wide.** Runtime *code* is ~one reference, but docs and `out/audit_log.csv` still contain the old filename (golden metadata + `.gitignore` don't break — hash/policy based). Fix: narrow the claim to "only runtime *code* reference"; update or freeze-label every doc/artifact reference.
14. **Provenance labeling promised but not attached to artifacts.** Fix: add a v1 provenance manifest/sidecar; Phase 7 publishes the labeled bundle or excludes it.
15. **Docs contradict locked execution.** `docs/decision-log.md` keeps older "original CSV untouched" wording beside the rename decision; `docs/roadmap.md` says `out/` untouched despite commit-fresh regen. Fix: mark filename-only language superseded; update roadmap validation to "content hash unchanged; `out/` regenerated once under commit-fresh."

### Claude's response (final arbiter) — ALL 15 ACCEPTED, plan revised to draft 4

None re-litigate a locked decision; all challenge execution and all are correct (several confirm the exact challenges the gate was sent to test — generator-agnosticism #1, zero-corpus-edit enforceability #2, guardrail false-negatives #4, secrets-hook anchoring #10–12, OQ-1 completeness #13). Nothing rejected. Nuances recorded: **#4** — "provably gap-free" was an overclaim on my side; softened to *bounded phrase families + measured-miss triage* (consistent with S2's two-track rule), not a false completeness claim. **#15** — historical decision-log rows are not rewritten (record integrity); a **superseded-by** notation is added, and the factual roadmap drift (`out/` untouched → commit-fresh) is corrected. Net effect: T-003 gets meaningfully more rigorous (mechanical hash-pins, committed nonzero-exit hooks, lane-isolated v2, header-aware adapter, sharper realism/anti-stub-leak criteria) — surfaced to the owner as scope-deepening (not scope-creep: still S1→S5, no new slice). Revisions folded into `docs/phase3-prep-slice-plan.md` (draft 4) + `PLAN.md`; resuming the same thread for round 2.

## Round 2 — Codex (2026-06-12, resumed thread `019ebedb-…`, re-review of draft 4, read-only)

**VERDICT: REVISE — converging.** Of the 15 round-1 findings: **8 RESOLVED** (#1 anti-stub, #2 sha256 pin, #5 header-aware adapter, #7 lane-aware eval, #8 v2 isolation, #9 S4 realism metadata, #10 secrets breadth, #11 allowlist narrowness, #14 provenance sidecar), **7 PARTIAL** — mostly doc-consistency drift plus 3 genuine clarifications:
- **#3 (real):** line :39 mislabeled `Uber Eats endorsed…` / `Curbside Commons officially…` as *measured misses* when they match the named bounded families → should be **required positives**. Fix: reclassify; reserve measured-miss for genuinely out-of-family paraphrases.
- **#6 (real, DoD risk):** moving `draft_rejected` to the S4 corpus is honest, but the ratified DoD requires a hold/**reject**/send walkthrough — so the reject path must be *showable*. Fix: state the mechanism (S4 eval-corpus replay until Phase 3's live model).
- **#12 (real):** "state-doc HEAD line" underspecified + "committed pre-commit hook" conflicts with `.git/hooks` being sample-only. Fix: scope parsing to exact current-state markers (not historical logs); pick committed-close-out-script (primary) ± tracked `.githooks/` + `core.hooksPath` (optional).
- **#4, #13, #15 + 2 new (consistency):** PLAN.md still said "draft 3" + unqualified "only filename reference"; the false-impact challenge line still asked about "false-negative gaps"; roadmap/decision-log still carried "max every stage" as current; the :39 vs :41/:93 family wording was internally inconsistent.

### Claude's response (final arbiter) — all accepted; draft 4 refined in place (no draft bump — same revision, consistency pass)

The 3 real clarifications: **#3** — added a required-positives / comparative-negatives / measured-probes **classification table** at S1 (endorsed/officially/partnered/guarantees families are hard-required positives, not misses). **#6** — S3 now specifies the reject path is demonstrated via **S4 eval-corpus replay** (labeled injected) until Phase 3 can produce a live rejection; roadmap DoD line updated to match. **#12** — `check_git_state.py` scoped to the explicit "HEAD = " current-state lines in the three state docs (no historical-log scanning), mechanism pinned to a committed close-out script (± optional tracked `.githooks/` + `core.hooksPath`); the secrets hook uses the same mechanism. Consistency sweep: PLAN.md → draft-4-consistent + "runtime *code* reference"; slice-plan next-actions/challenge lines + OQ-1 challenge updated; roadmap + decision-log "max every stage" marked superseded-by-auto-adjust (historical DoD row kept, effort sub-clause annotated). Net: design unchanged and sound; this round was contradiction-removal so an implementer can't read a stale claim as current. Resuming the same thread for round 3.

## Round 3 — Codex (2026-06-12, resumed thread `019ebedb-…`, re-review of the round-2 fixes, read-only)

**VERDICT: REVISE — single residual finding, explicitly "no new execution problem."** All four real round-2 clarifications confirmed RESOLVED (#3 classification table, #4 challenge wording, #6 reject-via-replay + roadmap match, #12 git-state scoping/mechanism); #15 doc drift mostly resolved. The lone hold-out: the **#13 OQ-1 "only filename reference" wording still survived unqualified in two authoritative spots** — `docs/phase3-prep-slice-plan.md:28` + `:122` and `docs/decision-log.md:41` ("live grep proved the literal exists in exactly one place") — contradicting the corrected wording in `PLAN.md` + `:36` + `:135`. Codex declined to call it converged while the authoritative slice plan + decision log still carried the stale claim.

### Claude's response (final arbiter) — accepted; all three qualified

Narrowed every remaining instance to **"only runtime-*code* reference (`scripts/config.py:10`); docs + the regenerated `out/audit_log.csv` also carry the old name and are swept/re-named in S1"** — slice-plan `:28` (add-alongside) + `:122` (OQ-1 resolution) + decision-log `:41` (the partial-reversal row). Added a forward-pointer on the Act-1 transcript line (line 9) so even the historical record signals the later narrowing. Repo-wide grep now shows **zero** unqualified "exactly one place" / "only filename reference" claims outside the explicitly-labeled transcript history. No design change — pure consistency closure of the exact item Codex tracked. Resuming the thread for round 4 (convergence confirmation).

## Round 4 — Codex (2026-06-12, resumed thread `019ebedb-…`): **VERDICT: APPROVED** ✅

> "The sole round-3 finding is resolved … no remaining unqualified active instances in the requested docs … I found no new execution problem. **VERDICT: APPROVED.**"

**Act 2 CONVERGED in 4 rounds** (within MAX_ROUNDS=5). Trajectory: round 1 = 15 findings (all accepted → draft 4) → round 2 = 8 resolved + 3 real clarifications + consistency → round 3 = 1 residual wording drift → round 4 = clean APPROVED. Single cross-model thread `019ebedb-da03-7db2-83c3-cc395e298e1a`, read-only every round, ~3.1M input / 25K output tokens by the final turn. The plan ([docs/phase3-prep-slice-plan.md](phase3-prep-slice-plan.md) draft 4 + [PLAN.md](../PLAN.md)) is **grilled + survived 4 rounds of cross-model adversarial review.**

**Next gate: owner GO/NO-GO on building T-003.** No code written during either act. On GO: build slice-by-slice S1→S5, frozen lane (test_t001/test_t002/v1 CSV content/out) untouched except the owner-directed OQ-1 filename rename, tests + eval after each slice, Codex changed-files review per slice, owner commits.

## Act 2 — round-1 attempts (historical): seat restored same day (owner action); attempts 1–2 below were VOID/exhausted; round 1 proper succeeded above

Smoke test (`codex exec "Reply with exactly one word: ALIVE"`, session `019ebd3f-d8f5-7090-bef3-c321256b272d`, model `gpt-5.5` @ `xhigh`) failed, exit code 1. Raw error, verbatim (returned twice):

```
ERROR: You've hit your usage limit. Upgrade to Pro (https://chatgpt.com/explore/pro), visit https://chatgpt.com/codex/settings/usage to purchase more credits or try again at Jun 14th, 2026 9:56 AM.
```

Per the owner standing order (2026-06-12): no retry, no account switch, no cap-tracking — surfaced verbatim and **stopped**. Gate = RULES §9 deferral with written reason, **not skipped**. Build does not start before Act 2 runs (unless the owner re-decides). When the seat answers, resume at Act 2 round 1 using this skill's review prompt against `PLAN.md` (read-only: `-s read-only` first call, `-c sandbox_mode="read-only"` on resumes; MAX_ROUNDS=5).

Codex must additionally challenge (carried from the slice plan + the grill):
- generator-agnostic contract fixtures (no stub-phrasing leak);
- parameterized `false_impact_claim` keeping v1 45/45 with ZERO corpus edits while covering PLATFORM_NAME + comparative negatives;
- S3 `normalize_row` schema extension non-breaking for v1 (`pipeline.py:268` hardcodes contact fields);
- adversarial corpus realism (real LLM failure modes, not regex-parity strings);
- secrets-hook location anchoring; git-state check must BLOCK not advise;
- **NEW from the grill:** the OQ-1 rename re-pin (is the single-reference claim complete? any doc/test/tool that breaks on the new filename?) and whether the provenance label is honest enough for a public repo;
- contradictions vs decision-log/DoD; anything that bites at Phase 3.
