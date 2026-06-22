# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

> Refreshed 2026-06-22 (Claude Code) — **DOCTRINE ALIGNMENT-AUDIT reconciled.** A read-only 3-agent audit (project-advisor · guidelines-monitor · acceptance-gate) ran; every gate-blocking + important finding is FIXED across 7 committed slices (`8b8a896` honesty/accuracy copy · `c100f41` NEW no-leakage eval grader · `93848de` a11y contrast+skip-link · `e675df0` recovered the rebuild Codex verdicts into `docs/reviews/` + journal backfill · `d799240` state sync · slice 6 reconciles a fresh Codex BLOCK — the gatekeeper now ENFORCES no-leakage · slice 7 reconciles the confirming pass's 4 second-order items — hyphen/`risk=high` detector gaps, count precision, allow/deny tests). Two Codex BLOCK→reconcile rounds converged; the **final re-confirm hit a transient Codex "at capacity" error** (raw-surfaced, NOT retried per owner doctrine) — slice 7 is **test-verified** (the allow/deny suite locks the reviewer's exact cases, 161 green); a Codex re-confirm is a **recommended dated obligation, not a blocker**. **CANONICAL: 161 tests + 1 skipped green; live fixture = 5 LIVE_AI / 1 fallback / $0.004203.** The acceptance-gate's HIGHEST-ranked "secret in `.env`" was verified a **FALSE ALARM** (gitignored / untracked / never committed / deploy-excluded — not a §11 breach). Then — still **PAUSED for a fresh session, mid UI-REDESIGN.** The PRODUCT is DONE / green / deploy-ready (the live run, the 3-audit sweep, the pre-deploy grill, and now the alignment-audit — all reconciled; 161 tests + 3 e2e green; demo fictionalized; deploy is a clean owner GO + a fresh pre-deploy Codex pass on the 4 new fix slices recommended). **ACTIVE TASK = UI redesign:** the owner finds the console "dull/generic" and wants a modern, professional, ELEGANT, white-bg product site with a STORYTELLING walkthrough arc + motion + custom icons/SVGs (anti-slop). **5 design-direction SAMPLES are built** (`mockups/{editorial,saas,swiss,technical,premium}.html`; screenshots in `mockups/shots/`; served at http://localhost:8080/mockups/<name>.html). **AWAITING the owner's PICK** (one winner, or a blend). On pick → **finalize that design language into the real Next.js app** (every surface + a storytelling landing front door; keep all logic/data/evals intact; the e2e selectors will need updating). THEN owner-gated T13 deploy. Running background servers: `:3000` (old app dev) + `:8080` (mockups) — stop with `pkill -f "next dev"` / `pkill -f "http.server"`. Re-derive git state live.

- **Done this session (all committed, all green — 50 tests, `next build` prerenders every route):**
  - **Phase B — domain depth** (`3c1540b`): `lib/domain/diagnosis.ts` — engagement state (actively-stuck / ghosted / new / progressing from `last_login × steps × tenure`) + a reactivation **play that varies by engagement, not just step** + `blocker_source` (merchant-side nudge vs platform-side ops-escalation). Add-alongside; **`lib/core` + the differential oracle untouched**. Cited from `docs/research/merchant-activation-domain-2026-06-19.md`. Surfaced on Merchant Detail.
  - **Phase C — console** (`3ca6986`): shared nav + **Eval/Quality · Metrics/Impact · Audit · Cost** surfaces (a11y-minded: semantic tables, `scope`, focus-visible).
  - **Live-path hardening (pre-Gemini, Codex P1)** (`b0acef4`): **injection cut** — the untrusted `merchant_name` never reaches the model (`{{MERCHANT}}` placeholder, real name substituted only after gatekeeping; adversarial-name test) + **cumulative budget ledger** (`lib/agents/live-batch.ts`, fail-closed across a run).
  - **Phase D — docs** (`89c7a00`): `docs/WHY.md` (full why-chain, each why names the rejected alternative + its cost + a cross-industry "generalizes" note) + honest **today-vs-target README** rewrite (de-branded, routes to current docs).
- **LIVE RUN — DONE (T12 ✓).** 6 merchants through real `gemini-2.5-flash`, $0.0036, recorded in `lib/data/live-samples.snapshot.json` (locked by `evals/live-samples.test.ts`; live smoke `evals/live-smoke.test.ts` auto-skips without the key). Re-run after the guardrail-precision fix → 0 false blocks. **To RE-RUN:** set `GEMINI_API_KEY` + `ENABLE_LIVE_AI=true` in gitignored `.env` (editor, never chat) → `node --env-file=.env scripts-ts/gemini-preflight.mjs` (verifies the key, never prints it; re-verify model/pricing at use-time, RULES §6) → `node --env-file=.env node_modules/.bin/vitest run evals/live-smoke.test.ts` → refresh the fixture.
- **CROSS-MODEL GATE — DONE.** Comprehensive Codex review + a final confirming pass (both BLOCK→fully reconciled), `security-specialist` (no P0/P1; defenses sound), `evals-specialist` (4 P1 rigor gaps closed: verb-before-noun coverage, 45-case guardrail corpus ported, draft-text differential, live-snapshot lock). 161 tests + 3 e2e green; coverage 88/79/90/91.
- **Owner-gated stops (pause + surface, never bypass):** **Vercel deploy** · platform-name confirm ("Curbside Commons") · public posting · any live spend · irreversible/external.
- **Remaining work — DEPLOY ONLY (T13), OWNER-GATED.** A **pre-deploy devil's-advocate grill** (Codex + advisor) ran (was NOT-YET) and **all 14 findings are now RESOLVED**: honesty hardened on every surface (non-affiliation footer · Metrics de-"Impact"-ified · "proven"→"exercised" · static-fixture label + local-verify command · "reference prototype"); and the three former owner-decisions are **done**:
  1. **[#1 risk] FIXED** — the public demo now shows **fictional** names (real-data capability kept in the adapter + docs). Live re-run over fictional merchants: 0 false blocks (and it surfaced + I completed the menu/photos/hours precision fix).
  2. **"Curbside Commons"** — resolved as the demo name (no collision found; formal clearance only before commercial use).
  3. **`out/README.md`** labels the Python-v1 oracle ("DoorDash" = the differential reference-name; synthetic; not affiliation); `.vercelignore` excludes it from Vercel.
  **Deploy is now a clean owner GO:** run Vercel (REPLAY-only; confirm `.env`/`ENABLE_LIVE_AI` absent in the Vercel env; keep the repo private OR treat `out/` as the labeled bundle) — a final pre-deploy Codex pass is available if wanted. **No non-owner-gated build work remains.**
- **Watch-outs:** project path has **spaces** (`fileURLToPath`); the public demo shows **fictional** names (the adapter ingests real DataSF — capability vs display); live AI is OFF by default + must stay OFF in the public deploy.
- **Reuse map (resilix, `/Users/sharan_98/Desktop/supply-chain-ai-resilix/`):** `lib/agents/{gatekeeper,run,budget,pricing}.ts`, `lib/signals/sanitize.ts`, `lib/evals/{graders,judge}.ts`, `app/globals.css` (Quiet Instrument tokens — full design pass is optional polish), `docs/enterprise_readiness.md`. Canonical plan: `~/.claude/plans/gentle-forging-starlight.md` (do NOT reopen without an owner pivot).
- **If unsure, stop and ask.**

### Resume prompt (paste-ready — re-engages goal mode in a fresh session)

```
Continue ActivationOps AI — the REBUILD, goal mode. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -10; show the Professional Process Applied block with an "Effort:" item — auto-routed; architecture/AI → MAX). Re-derive git state live; do not trust SHAs in docs.

State: the rebuild is APPROVED + complete + deploy-ready (~/.claude/plans/gentle-forging-starlight.md is CANONICAL; do NOT reopen without an owner pivot). COMMITTED + GREEN (161 tests + 3 Playwright e2e; coverage ≥88/79/90/91): full build + the recorded LIVE Gemini run + a 3-audit sweep (Codex · security · evals, all reconciled) + a pre-deploy grill (all 14 findings reconciled; public demo FICTIONALIZED) + eval-rigor locks (45-case guardrail corpus, draft-text differential, live-snapshot). lib/core + the golden differential are UNTOUCHED. Product = done; only the owner-gated T13 deploy was left.

ACTIVE TASK = UI REDESIGN. The owner finds the console "dull/generic" and wants a MODERN, professional, ELEGANT, WHITE-background product site with a STORYTELLING walkthrough arc (deep-but-simple language) + motion/transitions + custom icons/SVGs + an animated pipeline — ANTI-SLOP, senior-designer craft, NOT a template. I built 5 distinct design-direction SAMPLES (standalone HTML, real content, fictional names, full arc + scroll-reveal + custom SVGs) via 5 parallel frontend-specialist agents: mockups/editorial.html (Fraunces serif/oxblood magazine long-read) · mockups/saas.html (Linear/Vercel emerald, console-preview hero) · mockups/swiss.html (monochrome+red, strict Swiss grid) · mockups/technical.html (blueprint dot-grid, monospace, animated flow-diagram) · mockups/premium.html (Stripe/Mercury indigo, layered depth). Screenshots: mockups/shots/*.png. View live: http://localhost:8080/mockups/<name>.html (static server may still be running; else `cd <repo> && python3 -m http.server 8080`).

NEXT: (1) get the owner's PICK (a single winner, or a blend like "editorial hero + saas pipeline"). (2) FINALIZE it into the real Next.js app — apply the chosen design language as the design SYSTEM (globals.css tokens + components) across EVERY surface (Overview · Merchant Detail · Eval · Metrics · Audit · Cost) AND add the storytelling landing as the new front door; KEEP all logic/data/evals/the gatekeeper/the live fixture intact (presentation only). (3) Re-verify (typecheck/lint/test/build/e2e) — the e2e selectors/headings WILL need updating for the new UI; keep the honesty footer + non-affiliation + fictional names + the simulated/REPLAY labels. (4) Then the owner-gated T13 deploy. Use frontend-specialist + anti-slop discipline; cross-model gate (Codex) the final UI before deploy.

OWNER-GATED STOPS (pause + surface, never bypass): Vercel deploy · platform-name · public posting · live Gemini spend · irreversible/external. Everything else: proceed autonomously, COMMIT each clean green step. DURABILITY: commit per step + keep this resume prompt fresh. Narrate stage boundaries in plain + technical English.
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
