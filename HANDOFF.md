# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

> Refreshed 2026-06-20 (Claude Code, **goal mode**) — **LIVE RUN DONE + a comprehensive 3-AUDIT SWEEP (Codex + security + evals) all reconciled; everything buildable is DONE, green, committed. Only OWNER-GATED DEPLOY remains.** The Codex seat came back (owner activated backup); the comprehensive cross-model gate RAN (8 findings) + security-specialist (no P0/P1, defenses sound) + evals-specialist (4 P1 rigor gaps) — **all closed**. Live run (the headline): 6 merchants through real `gemini-2.5-flash`, $0.0036, recorded in `lib/data/live-samples.snapshot.json`; the live run surfaced a guardrail over-match → **fixed** (agent-tier tense-aware precision, pinned core untouched) → re-run confirms **0 false blocks**. Eval rigor hardened: 45-case guardrail corpus ported to TS (all 45 run), draft-text differential vs the Python oracle, live-snapshot lock. **153 tests + 3 e2e green; coverage ≥88/79/90/91.** Canonical live facts: 4 LIVE_AI / 2 FAILED_TO_FALLBACK, 0 BLOCKED. **Remaining = owner-gated DEPLOY only:** platform-name confirm · Vercel · the security audit's pre-deploy checks (personal-name DBAs sign-off · confirm `.env` excluded from the Vercel upload — `.vercelignore` added · `out/` carries legacy "DoorDash" strings, not web-served). One deferred non-blocking rigor note: none — all 4 evals P1s closed. Re-derive git state live.

- **Done this session (all committed, all green — 50 tests, `next build` prerenders every route):**
  - **Phase B — domain depth** (`3c1540b`): `lib/domain/diagnosis.ts` — engagement state (actively-stuck / ghosted / new / progressing from `last_login × steps × tenure`) + a reactivation **play that varies by engagement, not just step** + `blocker_source` (merchant-side nudge vs platform-side ops-escalation). Add-alongside; **`lib/core` + the differential oracle untouched**. Cited from `docs/research/merchant-activation-domain-2026-06-19.md`. Surfaced on Merchant Detail.
  - **Phase C — console** (`3ca6986`): shared nav + **Eval/Quality · Metrics/Impact · Audit · Cost** surfaces (a11y-minded: semantic tables, `scope`, focus-visible).
  - **Live-path hardening (pre-Gemini, Codex P1)** (`b0acef4`): **injection cut** — the untrusted `merchant_name` never reaches the model (`{{MERCHANT}}` placeholder, real name substituted only after gatekeeping; adversarial-name test) + **cumulative budget ledger** (`lib/agents/live-batch.ts`, fail-closed across a run).
  - **Phase D — docs** (`89c7a00`): `docs/WHY.md` (full why-chain, each why names the rejected alternative + its cost + a cross-industry "generalizes" note) + honest **today-vs-target README** rewrite (de-branded, routes to current docs).
- **LIVE RUN — DONE (T12 ✓).** 6 merchants through real `gemini-2.5-flash`, $0.0036, recorded in `lib/data/live-samples.snapshot.json` (locked by `evals/live-samples.test.ts`; live smoke `evals/live-smoke.test.ts` auto-skips without the key). Re-run after the guardrail-precision fix → 0 false blocks. **To RE-RUN:** set `GEMINI_API_KEY` + `ENABLE_LIVE_AI=true` in gitignored `.env` (editor, never chat) → `node --env-file=.env scripts-ts/gemini-preflight.mjs` (verifies the key, never prints it; re-verify model/pricing at use-time, RULES §6) → `node --env-file=.env node_modules/.bin/vitest run evals/live-smoke.test.ts` → refresh the fixture.
- **CROSS-MODEL GATE — DONE.** Comprehensive Codex review + a final confirming pass (both BLOCK→fully reconciled), `security-specialist` (no P0/P1; defenses sound), `evals-specialist` (4 P1 rigor gaps closed: verb-before-noun coverage, 45-case guardrail corpus ported, draft-text differential, live-snapshot lock). 145 tests + 3 e2e green; coverage 88/79/90/91.
- **Owner-gated stops (pause + surface, never bypass):** **Vercel deploy** · platform-name confirm ("Curbside Commons") · public posting · any live spend · irreversible/external.
- **Remaining work — DEPLOY ONLY (T13), all OWNER-GATED:** Vercel deploy (REPLAY-only; live AI gated off; `.vercelignore` keeps `.env` + `out/` out of the upload) + platform-name confirm + the security audit's pre-deploy checks (personal-name-DBA sign-off · confirm `.env`/`ENABLE_LIVE_AI` absent in the Vercel env · `out/` carries legacy "DoorDash" strings — not web-served, but exclude from a public push). **No non-owner-gated build work remains** — do not manufacture low-value work; synthesizing instrumentation signals to deepen diagnosis would undercut the honest "needs real instrumentation" stance, so don't.
- **Watch-outs:** project path has **spaces** (`fileURLToPath`); de-branded name "Curbside Commons" is a working placeholder pending the owner trademark gate; the personal-name-DBA entries are public-record trade names (owner chose keep + precise label) — re-confirm at the public-posting gate; live AI is OFF by default + must stay OFF in the public deploy.
- **Reuse map (resilix, `/Users/sharan_98/Desktop/supply-chain-ai-resilix/`):** `lib/agents/{gatekeeper,run,budget,pricing}.ts`, `lib/signals/sanitize.ts`, `lib/evals/{graders,judge}.ts`, `app/globals.css` (Quiet Instrument tokens — full design pass is optional polish), `docs/enterprise_readiness.md`. Canonical plan: `~/.claude/plans/gentle-forging-starlight.md` (do NOT reopen without an owner pivot).
- **If unsure, stop and ask.**

### Resume prompt (paste-ready — re-engages goal mode in a fresh session)

```
Continue ActivationOps AI — the REBUILD, goal mode. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -10; show the Professional Process Applied block with an "Effort:" item — auto-routed; architecture/AI → MAX). Re-derive git state live; do not trust SHAs in docs.

State: the rebuild is APPROVED + essentially complete (~/.claude/plans/gentle-forging-starlight.md is CANONICAL; do NOT reopen without an owner pivot). COMMITTED + GREEN (145 tests + 3 Playwright e2e; coverage 88/79/90/91; next build prerenders all routes): the full build (thin slice + Phase B domain depth lib/domain/diagnosis.ts + Phase C console + live-path hardening + Phase D docs) PLUS the LIVE Gemini run (done, recorded in lib/data/live-samples.snapshot.json, $0.0036) PLUS a comprehensive 3-audit sweep (Codex comprehensive + final confirming pass · security-specialist · evals-specialist) ALL reconciled, PLUS eval-rigor locks (45-case guardrail corpus ported to TS, draft-text differential vs the Python oracle, live-snapshot lock). lib/core + the golden differential lane are UNTOUCHED.

Everything buildable, the live run, and the cross-model gate are DONE. The ONLY remaining work is OWNER-GATED DEPLOY (T13): Vercel (REPLAY-only public demo; live AI gated off; .vercelignore added keeps .env + out/ out of the upload) + platform-name confirm ("Curbside Commons") + the security audit's pre-deploy checks (personal-name-DBA sign-off · confirm .env/ENABLE_LIVE_AI absent in the Vercel env · out/ carries legacy "DoorDash" strings, not web-served but exclude from a public push). There is NO remaining non-owner-gated build work — do NOT manufacture low-value work; wait for the deploy GO. To RE-RUN the live Gemini smoke (optional): set GEMINI_API_KEY + ENABLE_LIVE_AI=true in gitignored .env (editor, NEVER chat — RULES §11) → node --env-file=.env scripts-ts/gemini-preflight.mjs (verifies the key without printing it; re-verify model/pricing at use-time, RULES §6) → node --env-file=.env node_modules/.bin/vitest run evals/live-smoke.test.ts → refresh the fixture.

OWNER-GATED STOPS (pause + surface, never bypass): live Gemini spend (the key) · Vercel deploy · platform-name confirm ("Curbside Commons") · public posting · irreversible/external. Everything else: proceed autonomously, self-correct, COMMIT each clean green step (local-only; owner has standing commit approval for the goal-mode loop), keep going. DURABILITY: commit per step + keep this HANDOFF resume prompt fresh so any limit-hit resumes losslessly. Narrate stage boundaries in plain + technical English.
```

## Standing continuity procedures

### If Claude Code account 1 hits usage mid-task
1. Stop.
2. Update `CURRENT_TASK.md`.
3. Update this `HANDOFF.md`.
4. Update `PROJECT_STATE.md`.
5. Update `docs/task-log.md`.
6. List uncommitted changes (`git status`).
7. Do not start a new task.

### When Claude Code account 2 (or the CLI) starts
1. Read `RULES.md`.
2. Read `PROJECT_STATE.md`.
3. Read `CURRENT_TASK.md`.
4. Read `HANDOFF.md`.
5. Read `docs/task-log.md`.
6. Run `git status`.
7. Summarize current phase, active task, changed files, unfinished work, risks, and the next safest step.
8. Wait for human approval before continuing.

### Background Codex jobs
When a Codex job runs in the background, record its purpose and whether its result was checked here or in `docs/task-log.md`. Invoke Codex through `~/claude-os/bin/codex-guarded` (shared-seat queue/mutex; namespaced output).
