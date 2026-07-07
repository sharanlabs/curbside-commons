# A4 Slice Record — n8n automation lane (workflow spec + command-level dry run)

**Date:** 2026-07-07 · **Plan:** `docs/plan-agentic-extension.md` v1.0 §5 row A4, AC-9 (amended), AC-12 · **Built INLINE on the Fable seat** (same recorded seat-window conversion + mitigations as A2/A3).

## O-A4 disposition (honest)
Docker absent (verified at GO). The runtime fork was put to the owner at A4 entry (AskUserQuestion: npx / docker / spec-only); **owner AFK → reversible default per the 2026-07-06 defaults-taken precedent**: all universal artifacts built + the command-level dry run; no install, no runtime download. **Label everywhere: "workflow spec + command-level dry run; n8n runtime execution pending O-A4"** — per AC-9 the lane is NOT counted as an executed-n8n surface until the owner arms the runtime leg (runbook ready; NOTE per Codex P2: n8n v2.0+ disables the Execute Command node by default — a self-hosted enablement step is required and documented, so runtime import/execution is UNVERIFIED until that armed run).

## What was built
- `workflows/n8n/truth-audit-fees-to-slack.workflow.json` — committed, `active:false`, Manual Trigger → audit (registry) → A3 Slack payload; no send node; SIMULATED meta note; repo-root-relative commands.
- `scripts-ts/n8n/audit-to-canonical.mjs` — stage 1: `callTool` + `assertDecisionGrade` (demo/advisory output cannot enter the pipeline) → canonical to `.n8n-artifacts/` (gitignored).
- `scripts-ts/n8n/canonical-to-payload.mjs` — stage 2: A3 builders (slack/email; email takes `--date` per the A3 determinism contract).
- `evals/n8n/n8n-workflow.test.ts` (5 tests) — structural veracity (node-type allowlist; webhook/cron/schedule/httpRequest/send forbidden; single manual trigger; sanctioned-script commands; linear-chain connections; no curl/wget/URLs) + the **command-level dry run** (the workflow's own command strings executed verbatim; final artifact byte-equals the direct build) + run_demo refusal at stage 1.
- `docs/n8n-runbook.md` — episodic npx/docker run instructions, freshness obligations at runtime arming (n8n license last vendor-checked 2026-07-06), binding boundaries (no standing nodes — test-enforced; no sending — L-2/L-3 territory).
- `.gitignore` +`.n8n-artifacts/`; PLAIN-ENGLISH row + GLOSSARY entry (same breath).

## Verification
- Suite **5 passed (5)**; RED-GREEN ×2 (cron-node smuggled → structural gate fired · command tampered → dry-run byte mismatch) — `docs/reviews/a4-verify-evidence.log`.

## Codex changed-files review + reconciliation

**Verdict: FINDINGS — 1 P1 + 1 P2** (raw: `codex-2026-07-07-a4-n8n-raw.md`) — **both accepted and fixed same-session**: shell-chaining bypass closed (full argv-shape validation, metacharacter rejection, shell-less execFileSync execution, 8 firing negative cases) · runbook honesty corrected against official n8n docs (Execute Command disabled by default in v2.0+; self-hosted enablement documented with security warning; runtime execution stated UNVERIFIED pending O-A4). Post-fix suite: **6 passed (6)**. Codex independently confirmed label honesty + protected paths untouched.
