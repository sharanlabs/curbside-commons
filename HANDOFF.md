# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

> Refreshed 2026-06-19 (Claude Code, **build session 2**) — **THE THIN VERTICAL SLICE (walking skeleton) IS COMPLETE + GREEN.** One merchant runs end-to-end: hybrid data → triage/blocker → bounded draft (mock) → claims-gatekeeper → eval → human gate → audit → REPLAY → two desktop surfaces. `npm run typecheck/lint/test/build` all pass (41 tests, differential byte-identical; `next build` prerenders 23 pages). At the **Codex gate**; then **owner commit + Vercel deploy gates**. Paste the resume prompt below.

- **Git-drift CORRECTED:** build session 1 (scaffold + core port + state-sync) is **committed** — `HEAD = 4de4503` (`3182bfa`, `f004d19`). The session-1 handoff said "surface the commit gate first," but the owner already committed it; that step is **resolved**. Re-derive live (`git status`), never trust this line.
- **Done this session (all verified GREEN), add-alongside — `lib/core/*` + the golden differential lane UNTOUCHED:**
  - **Hybrid dataset** — `lib/ingest/{sanitize,sf-adapter,overlay,hybrid}.ts` + frozen `lib/data/sf-entities.snapshot.json` (20 real SF businesses) + `lib/data/PROVENANCE.md` + the zero-dep generator `scripts-ts/build-hybrid-snapshot.mjs`. Real layer = DataSF `g8m3-pdis`, PDDL 1.0, **name + category ONLY** (PII scrubbed). **NAICS is sector-level**, so the honest crosswalk is Food Services→Restaurant, Retail Trade→Retail (Grocery/Convenience left to synthetic). Synthetic overlay deterministic (no wall-clock).
  - **Bounded Gemini draft** — `lib/agents/{budget,pricing,gemini,draft}.ts` + `lib/server/env-flags.ts`. $5 fail-closed budget hard-stop · pinned pricing (carried from resilix 2026-06-18, **re-verify at live-smoke**) · model preflight · `draftOutreach` mock/live/FAILED_TO_FALLBACK with a verifiable `claims[]`. **Live AI OFF by default + off in the public deploy; mock path only; $0 spend.**
  - **Claims-gatekeeper** — `lib/agents/gatekeeper.ts` (every claim traces to merchant data + guardrail + schema; PASS/WARN/BLOCKED).
  - **Draft-quality eval** — `lib/evals/draft-quality.ts` (structure/state-consistency/policy; corrupted-record teeth).
  - **REPLAY orchestrator** — `lib/replay/run.ts` (deterministic end-to-end snapshot; $0 ledger; `getReplaySnapshot()` is the seam).
  - **Desktop surfaces** — `app/page.tsx` (Overview + Activation Queue) + `app/merchant/[id]/page.tsx` (full why-chain detail). De-branded working name **"Curbside Commons"** + honest data labels. `lib/product.ts`.
- **Commit status:** slice is **uncommitted**, intent-to-added (`git add -N`) so the Codex diff sees it. Suggested commit grouping: (1) hybrid dataset + adapter (`lib/ingest`, `lib/data`, `scripts-ts`); (2) bounded draft + gatekeeper + eval (`lib/agents`, `lib/evals`, `lib/server`); (3) REPLAY + surfaces (`lib/replay`, `lib/product.ts`, `app/`); (4) tests (`evals/*.test.ts`); (5) state-doc sync. Owner decides grouping.
- **Codex changed-files review: DONE — verdict BLOCK (correct for a *public deploy*), reconciled; all fixable findings fixed, 43 tests green.** 5 P1 + 2 P2. **Fixed this session:** budget not-cumulative → live path now **fail-closed, requires an explicit ledger** (no silent `spentUsd:0`); billed-but-failed live call now **records its cost**; gatekeeper/UI overclaim **softened** ("every declared claim"); empty eval corpus **no longer vacuously passes**; generator gets a **`FETCHED_AT` override**; honesty label **tightened** (public-record trade names ≠ private PII). **Deferred (binding):** (1) live-prompt **injection** on `merchant_name` → **Phase-B security pass** (live is OFF so no exploit ships; loud in-code warning + the placeholder-substitution approach are in `lib/agents/draft.ts:buildPrompt`); (2) **personal-name DBAs** → **owner deploy-gate decision** (keep-with-label / filter / alias). Codex **confirmed non-findings:** key not client-exposed, no `dangerouslySetInnerHTML`, snapshot is name+category only, `lib/core/*` untouched. Full verdict: `/tmp/codex-verdict-activationops.md`.
- **Owner-gated stops (pause + surface, never bypass):** commits/pushes · **Vercel deploy** · platform-name confirm ("Curbside Commons" — 2-min trademark/web check) · public posting · irreversible/external.
- **Phase-B binding items (DO NOT LOSE — carry to the Phase-B gate checklist):**
  1. **Live-path prompt-injection surface** — `merchant_name` is untrusted real prose; `sanitizeText` strips control chars/whitespace only (deliberately preserves injection wording, per its test). On the LIVE path it flows into `buildPrompt`'s facts JSON. Not exploitable now (mock-path, no key) and the claims-gatekeeper catches fabricated claims downstream — but it's the plan's "untrusted real-data surface" blindspot. **Mitigate before live** (e.g. cross entities as ids/structured fields, not raw prose) + the deferred **security-specialist pass** on the deployed app.
  2. **Re-verify Gemini pricing + model availability** at the live-smoke gate (RULES §6) — never trust the pinned table from memory.
  3. **REPLAY freeze becomes mandatory when live Gemini lands** — a live call isn't recomputable, so `getReplaySnapshot()` must switch from compute-at-load to reading a **recorded frozen fixture** (record the real run, freeze, serve it; public deploy stays REPLAY-only).
  4. **evals-specialist pass** on the harness (judge calibration when the LLM-judge is added) + the **authentic caught-failure** (a real model miss the eval/gatekeeper caught) — only after live Gemini; never staged.
  5. **Personal-name DBAs** — a few frozen entities are sole-proprietor DBAs (public trade names, license-clean); review at the **public-posting gate**.
- **Watch-outs:** project path has **spaces** → use `fileURLToPath` (vitest.config). Python CSV is `\r\n`. The de-branded name in surfaces ("Curbside Commons") is a working placeholder pending the owner platform-name gate. Update `docs/tooling-and-skills-usage.md` (this session: advisor ×3, autopilot, codex-guarded, DataSF Socrata, TaskCreate) at the next commit checkpoint.
- **Reuse map (resilix, `/Users/sharan_98/Desktop/supply-chain-ai-resilix/`):** `lib/agents/{gatekeeper,run,budget,pricing}.ts`, `lib/signals/sanitize.ts`, `lib/evals/{graders,judge}.ts`, `app/globals.css` (Quiet Instrument tokens — Phase C), `docs/enterprise_readiness.md`. Canonical plan: `~/.claude/plans/gentle-forging-starlight.md` (do NOT reopen without an owner pivot).
- **If unsure, stop and ask.**

### Resume prompt (paste-ready — re-engages autopilot in a fresh session)

```
Continue ActivationOps AI — the REBUILD, build session 3. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an "Effort:" item — auto-routed; architecture/AI → MAX).

State: the rebuild is APPROVED (~/.claude/plans/gentle-forging-starlight.md — CANONICAL; do NOT reopen without an owner pivot). The THIN VERTICAL SLICE is COMPLETE + GREEN (build session 2, uncommitted, intent-to-added): hybrid dataset (real DataSF SF entities, PII-scrubbed, NAICS→Restaurant/Retail; deterministic synthetic overlay) → bounded Gemini draft (mock/live/FAILED_TO_FALLBACK, $5 fail-closed budget, OFF by default) → claims-gatekeeper → draft-quality eval (corrupted-record teeth) → REPLAY orchestrator → Overview + Merchant Detail surfaces. npm run typecheck/lint/test/build all GREEN (41 tests, differential byte-identical, 23 pages prerendered). lib/core/* + the golden differential lane are UNTOUCHED. Build session 1 (scaffold + core port) is committed (4de4503).

The Codex review is DONE (verdict BLOCK, reconciled — all fixable findings fixed, 43 tests green; deferred = the Phase-B live-prompt-injection mitigation + the owner personal-name-DBA deploy-gate decision; details in HANDOFF). FIRST surface to the owner two gated decisions: (1) commit the slice (RULES §12; suggested grouping in HANDOFF) and (2) the personal-name-DBA handling that gates a public deploy (keep-with-label / filter / alias). Do NOT commit or deploy without owner GO.

After GO, widen via Phases A→B→C→D. Phase-B BINDING items (in HANDOFF): mitigate the live-path prompt-injection surface (merchant_name untrusted prose → live prompt) + run the security-specialist pass; re-verify Gemini pricing/model at the live-smoke gate; when live Gemini lands, switch getReplaySnapshot() from compute-at-load to a RECORDED frozen fixture (a live call isn't recomputable); add the LLM-judge + evals-specialist calibration + the authentic (never staged) caught-failure; review the personal-name DBAs at the public-posting gate.

OWNER-GATED STOPS (pause + surface, never bypass): commits/pushes · Vercel deploy · platform-name confirm ("Curbside Commons") · public posting · irreversible/external. Everything else: proceed autonomously, self-correct, keep going to DONE. Narrate stage boundaries in plain + technical English. If the conversation runs long, checkpoint the state docs + emit a fresh paste-ready resume prompt.
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
