# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

> Refreshed 2026-06-19 (Claude Code, **build session 1**) — **REBUILD execution STARTED via `/autopilot` and is GREEN at the first milestone.** The Next.js/TS app is scaffolded and the deterministic core is ported to TS with a **byte-for-byte differential test vs the Python oracle (all 20 merchants)** — the Phase A faithful-port gate, met early. The dataset is decided. All new work is **uncommitted** (commit owner-gated). Next session: surface the commit, then finish the thin vertical slice. Paste the resume prompt below.

- **Done this session (all verified GREEN):**
  - **Foundation scaffold** — Next.js 16 + React 19 + TS + Tailwind v4 + Vitest (mirrors resilix house style, minus DB/n8n). `npm run typecheck`, `lint`, `test`, `build` all pass. Deps pinned to resilix's proven set (current registry versions checked + recorded; `ai` v5 / `@ai-sdk/google` v2 kept for reuse compatibility — the freshness check is done, the pin is deliberate).
  - **Deterministic core port** (`lib/core/{constants,types,guardrail,pipeline}.ts`) — faithful TS port of `scripts/`. **Differential test green** (`evals/core-differential.test.ts`): reproduces `out/merchants_v1.csv` byte-for-byte across all 33 columns × 20 merchants + golden aggregates (20 / 8 high / 12 sent / 8 held / 0 rejected). Platform name **parameterized** (default "DoorDash" for the oracle; the product passes the de-branded name — same logic, only the token differs).
  - **Dataset Source-Intake DECIDED (owner)** — **SF "Registered Business Locations" (DataSF), PDDL 1.0** public-domain; real local small-business name + category via a one-time NAICS→{Restaurant,Retail,Grocery,Convenience} crosswalk (the reusable, source-swappable adapter); activation state synthetic + honestly labeled. Foursquare OS Places = documented richer-upgrade. Kaggle considered + rejected as a class (license/provenance/PII). Decision-log 2026-06-19.
- **Uncommitted (commit owner-gated, RULES §12) — a CLEAN commit point is ready:** all new TS (`package.json`, `package-lock.json`, configs, `app/`, `lib/`, `evals/`) + the extended `.gitignore` + the state-doc/decision-log updates, on top of the prior pivot-recording + governance pile. Suggested grouping: (1) "Scaffold Next.js/TS app (foundation)"; (2) "Port deterministic core to TS + differential test vs Python oracle"; (3) the state-doc/decision-log sync. Owner decides whether to also fold in the pre-existing pivot/governance pile.
- **Next (the rest of the thin vertical slice — one merchant end-to-end):** (1) **SF ingestion adapter** (`lib/data/`, NAICS crosswalk) + **hybrid dataset** (real SF entities + synthetic activation overlay; **SANITIZE the real name/description as untrusted text from row 1** — blindspot mitigation; frozen snapshot JSON); (2) **bounded Gemini draft** via `@ai-sdk/google` + Zod schema (deterministic **mock in tests**; the ported stub `makeDraft` = the live-AI fallback; key **server-side only**; `ENABLE_LIVE_AI` off by default + off in the public deploy); (3) **claims-gatekeeper** (port resilix `lib/agents/gatekeeper.ts` — every claim traces to merchant data); (4) **minimal eval scoring** of the draft (state-consistency / structure / policy); (5) **ONE desktop surface** showing the merchant end-to-end; (6) a **REPLAY snapshot**. Gate after: `typecheck/lint/test` (incl. differential + new eval) + Codex changed-files review via `~/claude-os/bin/codex-guarded`. Then **PAUSE before any Vercel deploy** (owner gate). Then widen via Phases A→B→C→D.
- **Owner-gated stops (unchanged — pause + surface, never bypass):** commits/pushes · platform-name confirm ("Curbside Commons", 2-min trademark/web check) · **Vercel deploy** · public posting · irreversible/external.
- **Watch-outs / gotchas:** project path has **spaces** → use `fileURLToPath`, not `URL.pathname`, for path aliases (fixed in `vitest.config.ts`). Python CSV uses **`\r\n`** → split on `/\r?\n/` (fixed in the differential test). **Re-verify the cheapest current Gemini model at use-time** (never pin from memory). Small follow-up: update `docs/tooling-and-skills-usage.md` with this session's `research-specialist` + `advisor` usage at the next commit checkpoint.
- **Reuse map (resilix, `/Users/sharan_98/Desktop/supply-chain-ai-resilix/`):** `lib/agents/{gatekeeper,run,pricing,budget}.ts`, `lib/signals/sanitize.ts`, `lib/evals/*`, `app/globals.css` (Quiet Instrument tokens — Phase C), `docs/enterprise_readiness.md`. Canonical plan: `~/.claude/plans/gentle-forging-starlight.md` (do NOT reopen without an owner pivot).
- **If unsure, stop and ask.**

### Resume prompt (paste-ready — re-engages autopilot in a fresh session)

```
Continue ActivationOps AI — the REBUILD, build session 2. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an "Effort:" item — auto-routed; architecture/AI → MAX).

State: the rebuild is APPROVED (2026-06-19, ~/.claude/plans/gentle-forging-starlight.md — CANONICAL goal/DoD/phases/blindspots; do NOT reopen without an owner pivot). Build session 1 (this repo, uncommitted) delivered + verified GREEN: (a) Next.js 16/React 19/TS/Tailwind v4/Vitest scaffold (npm run typecheck/lint/test/build all pass); (b) the deterministic core ported to TS in lib/core/ with a byte-for-byte differential test vs the Python oracle out/merchants_v1.csv on all 20 merchants (evals/core-differential.test.ts) — Phase A faithful-port gate met early; (c) dataset DECIDED: SF "Registered Business Locations" (DataSF, PDDL 1.0 public-domain) for real name+category via a NAICS→{Restaurant,Retail,Grocery,Convenience} crosswalk, activation state synthetic+labeled (decision-log 2026-06-19).

Engage /autopilot. FIRST surface the commit gate (RULES §12): the scaffold + core port is a clean commit point — propose the commit(s) and ask the owner before committing. THEN build the rest of the THIN VERTICAL SLICE (one merchant end-to-end): (1) SF ingestion adapter (lib/data/, NAICS crosswalk) + hybrid dataset (real SF entities + synthetic activation overlay; SANITIZE the real name/desc as untrusted text from row 1; frozen snapshot JSON); (2) bounded Gemini draft via @ai-sdk/google + Zod schema (deterministic MOCK in tests; the ported stub makeDraft = the live-AI fallback; GEMINI key server-side only; ENABLE_LIVE_AI off by default + off in the public deploy); (3) claims-gatekeeper (port resilix lib/agents/gatekeeper.ts — every claim traces to merchant data); (4) minimal eval scoring of the draft (state-consistency/structure/policy); (5) ONE minimal desktop surface showing the merchant end-to-end; (6) a REPLAY snapshot. Gate after: npm run typecheck/lint/test (incl. the differential + the new eval) + Codex changed-files review via ~/claude-os/bin/codex-guarded (namespaced). Then PAUSE before any Vercel deploy (owner gate). Then widen via Phases A->B->C->D.

Reuse resilix (/Users/sharan_98/Desktop/supply-chain-ai-resilix/): lib/agents/{gatekeeper,run,pricing,budget}.ts, lib/signals/sanitize.ts, lib/evals/*, app/globals.css (Quiet Instrument tokens — Phase C), docs/enterprise_readiness.md. WATCH-OUTS: project path has SPACES (use fileURLToPath, not URL.pathname); Python CSV is \r\n (split on /\r?\n/); re-verify the cheapest current Gemini model at use-time (never pin from memory).

OWNER-GATED STOPS (pause + surface, never bypass): commits/pushes · platform-name confirm ("Curbside Commons") · Vercel deploy · public posting · irreversible/external. Everything else: proceed autonomously, self-correct on failure, keep going to DONE. Narrate stage boundaries in plain + technical English. If the conversation runs long, checkpoint the state docs + emit a fresh paste-ready resume prompt. End your handoff with a fresh paste-ready resume prompt.
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
