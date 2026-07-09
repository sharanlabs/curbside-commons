# Codex changed-files review — deploy slice (static export + oracle relocation), 2026-07-08

Scope: the deploy slice per `docs/plan-deploy.md` (owner-worded 2026-07-08 with acts ⓪②; Cloudflare Pages direct upload). Reviewer: Codex via `codex-guarded` (read-only). Raws: `codex-2026-07-08-deploy-slice-raw-pass{1,2}.md`.

## Pass 1 — BLOCK (1 P2), on the initial one-line `output: "export"` diff
- **P2 (real catch): the export build clobbered tracked `out/` artifacts** — `git diff --name-status` showed the config change PLUS tracked deletions of the five Python-v1 oracle files (`out/README.md`, `audit_log.csv`, `merchants_v1.csv`, `model_runs.csv`, `review_queue.csv`). Orchestrator escalation: worse than flagged — those CSVs are the byte-for-byte oracle for the legacy differential tests; `test:legacy` was independently re-run post-export and FAILED (3 files, 286/306), confirming the break live.
- Confirmed clean: `output: "export"` correctness for this codebase (generateStaticParams present, no next/image, no server features; nextjs.org static-exports doc cited); Cloudflare Pages routing compatibility (`.html` routes, `404.html`, direct-upload; developers.cloudflare.com cited); honesty/identity held in the exported HTML (SIMULATED/prototype/REPLAY language spot-checked present).
- **Resolution (owner-worded, structured ask, verbatim pick "Relocate oracle (Recommended)")**: the five artifacts `git mv`-ed to `legacy/activation/oracle/` (byte-identical), 3 legacy test paths + `scripts/config.py` `DEFAULT_OUT_DIR` rewired, `.gitignore` ignores `out/` as build output, oracle README retitled with the relocation record.

## Seat event (raw on record)
The confirming-pass launch died on the Codex usage limit — raw verbatim: "ERROR: You've hit your usage limit. Upgrade to Pro (https://chatgpt.com/explore/pro), visit https://chatgpt.com/codex/settings/usage to purchase more credits or try again at 9:59 PM." One retry after the stated reset (no silent downgrade/account switch) — completed.

## Pass 2 (confirming) — BLOCK (2 P2) → both ACCEPTED-FIXED
1. **P2: `.gitignore` `out/` ignores every nested `out/` directory** (proven via `git check-ignore -v`) → fixed to root-only `/out/`; machine-verified post-fix (root ignored, `legacy/activation/oracle/out/x` NOT ignored).
2. **P2: the draft-oracle regen instructions still pointed at the old `out/model_runs.csv`** — an executable extractor command in `draft-oracle.test.ts` header + the `_oracle` pointer in `eval/draft-oracle.v1.json` → both updated to `legacy/activation/oracle/model_runs.csv` (JSON `rows` untouched; the file is imported for rows only, no hash pin — verified by grep).
- Confirmed: `scripts/run.py`/`pipeline.py` regen through `DEFAULT_OUT_DIR` only (correct); the four moved CSVs byte-identical to `HEAD:out/*` by `cmp`; README links resolve; no tracked `out/` files remain.
- Honest caveat from the reviewer: it could not run `test:legacy` in its read-only sandbox (vitest EPERM); the green runs are the orchestrator's live executions.

## Post-fix gates (orchestrator, live)
python 35 passed · test:legacy 306 passed + 5 skipped (reading the relocated oracle) · `npm run verify` chain green with 30/30 pages exported to `out/` and zero tracked deletions.

Verdict carried: BLOCK findings all reconciled primary-model-final (both P2s accepted-fixed; nothing refuted). Slice cleared for commit + upload.
