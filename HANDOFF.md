# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

> Refreshed 2026-06-19 (Claude Code, **build session 2, continued — goal mode**) — **PHASES B + C + D-docs are DONE, committed, and GREEN; the live path is HARDENED and READY for the owner's Gemini key.** The autonomous frontier is reached: everything not owner-gated is built + green + committed. The headline remaining step — the **live Gemini run** — is owner-gated on the key (offered; awaiting `.env`). Re-derive git state live.

- **Done this session (all committed, all green — 50 tests, `next build` prerenders every route):**
  - **Phase B — domain depth** (`3c1540b`): `lib/domain/diagnosis.ts` — engagement state (actively-stuck / ghosted / new / progressing from `last_login × steps × tenure`) + a reactivation **play that varies by engagement, not just step** + `blocker_source` (merchant-side nudge vs platform-side ops-escalation). Add-alongside; **`lib/core` + the differential oracle untouched**. Cited from `docs/research/merchant-activation-domain-2026-06-19.md`. Surfaced on Merchant Detail.
  - **Phase C — console** (`3ca6986`): shared nav + **Eval/Quality · Metrics/Impact · Audit · Cost** surfaces (a11y-minded: semantic tables, `scope`, focus-visible).
  - **Live-path hardening (pre-Gemini, Codex P1)** (`b0acef4`): **injection cut** — the untrusted `merchant_name` never reaches the model (`{{MERCHANT}}` placeholder, real name substituted only after gatekeeping; adversarial-name test) + **cumulative budget ledger** (`lib/agents/live-batch.ts`, fail-closed across a run).
  - **Phase D — docs** (`89c7a00`): `docs/WHY.md` (full why-chain, each why names the rejected alternative + its cost + a cross-industry "generalizes" note) + honest **today-vs-target README** rewrite (de-branded, routes to current docs).
- **READY FOR THE LIVE RUN (T12) — the moment `GEMINI_API_KEY` + `ENABLE_LIVE_AI=true` are in a gitignored `.env` (owner sets it in their editor, NEVER in chat — RULES §11):**
  1. Verify the key is picked up **without printing it**; run the live **preflight** (`listGeminiModels` / `assertConfiguredModelAvailable`) + **re-verify the cheapest current Gemini model + pricing** at use-time (RULES §6 — the pinned table is carried from resilix 2026-06-18; confirm live before billing).
  2. **One merchant** end-to-end live (`draftOutreach({live:true, budget})`) → confirm LIVE_AI + gatekeeper + eval; report **exact spend** (expect a few cents; $5 fail-closed cap).
  3. Small **eval-over-real-output** via `draftBatchLive` (cumulative ledger): the constrained product prompt (should pass) **plus a naive/unconstrained-prompt ablation** to elicit an **authentic** caught failure the gatekeeper/eval flags (before/after; **never staged**) — the DoD's "real caught failure."
  4. **Freeze** the recorded live run as the REPLAY fixture and switch `getReplaySnapshot()` from compute-at-load to reading it (a live call isn't recomputable); keep the public deploy REPLAY-only.
  5. **Codex-review** the live-path hardening (injection cut + ledger) before/with the live run.
- **Owner-gated stops (pause + surface, never bypass):** live Gemini spend (the key) · **Vercel deploy** · platform-name confirm ("Curbside Commons") · public posting · irreversible/external.
- **Remaining work:** **T12 live run** = owner-gated (key; the headline — live path is ready). **T13 deploy** = owner-gated (REPLAY-only; key gated off; + platform-name + the public-posting review of the personal-name DBAs — owner chose keep-with-label). **T10 full Playwright e2e** = DEFERRED (the green `next build` already render-smokes every page; low marginal value for a static REPLAY console — do it before deploy if desired). **T11 doc polish** = optional (a dedicated enterprise_readiness adoption doc; the path is already in WHY.md + README).
- **Watch-outs:** project path has **spaces** (`fileURLToPath`); de-branded name "Curbside Commons" is a working placeholder pending the owner trademark gate; the personal-name-DBA entries are public-record trade names (owner chose keep + precise label) — re-confirm at the public-posting gate; live AI is OFF by default + must stay OFF in the public deploy.
- **Reuse map (resilix, `/Users/sharan_98/Desktop/supply-chain-ai-resilix/`):** `lib/agents/{gatekeeper,run,budget,pricing}.ts`, `lib/signals/sanitize.ts`, `lib/evals/{graders,judge}.ts`, `app/globals.css` (Quiet Instrument tokens — full design pass is optional polish), `docs/enterprise_readiness.md`. Canonical plan: `~/.claude/plans/gentle-forging-starlight.md` (do NOT reopen without an owner pivot).
- **If unsure, stop and ask.**

### Resume prompt (paste-ready — re-engages goal mode in a fresh session)

```
Continue ActivationOps AI — the REBUILD, goal mode. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -10; show the Professional Process Applied block with an "Effort:" item — auto-routed; architecture/AI → MAX). Re-derive git state live; do not trust SHAs in docs.

State: the rebuild is APPROVED + far along (~/.claude/plans/gentle-forging-starlight.md is CANONICAL; do NOT reopen without an owner pivot). COMMITTED + GREEN (50 tests; next build prerenders all routes): the thin vertical slice + Phase B domain depth (lib/domain/diagnosis.ts) + Phase C console (Overview/queue, Merchant Detail, Eval/Quality, Metrics, Audit, Cost) + live-path hardening (injection cut + cumulative budget ledger) + Phase D docs (docs/WHY.md why-chain + today-vs-target README). lib/core + the golden differential lane are UNTOUCHED.

The autonomous frontier is reached. The remaining HIGH-VALUE step is OWNER-GATED: the LIVE GEMINI RUN. If GEMINI_API_KEY + ENABLE_LIVE_AI=true are set in a gitignored .env (owner sets it in their editor, NEVER in chat — RULES §11), then run T12 exactly as the HANDOFF "READY FOR THE LIVE RUN" checklist says: verify-without-printing → live preflight + re-verify model/pricing at use-time (RULES §6) → 1-merchant smoke (report exact spend; $5 fail-closed) → small eval-over-real-output via draftBatchLive incl. a naive-prompt ablation to capture an AUTHENTIC (never staged) caught failure → freeze the live run as the REPLAY fixture (switch getReplaySnapshot to read it) → Codex-review the live-path hardening. If the key is NOT set, ask the owner for it (the headline value is blocked without it), and meanwhile do optional buildable polish: T10 full Playwright e2e (low marginal value — build already render-smokes pages) or T11 enterprise_readiness adoption doc.

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
