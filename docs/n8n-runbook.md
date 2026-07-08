# n8n Lane Runbook — episodic, self-hosted, SIMULATED

**Status + honest label (updated 2026-07-07, evening):** **EXECUTED n8n lane — one recorded episodic runtime run.** The owner's 2026-07-07 directive resolved O-A4 to **Option A (npx, no docker)** and the committed workflow ran UNDER n8n 2.29.7 (`n8n execute --id`, `mode: cli`, `status: success`); both artifacts byte-matched direct engine builds. Full record: `docs/reviews/l3-n8n-runtime-run-2026-07-07.md`. The lane remains episodic and sendless — the CI dry run (`evals/n8n/n8n-workflow.test.ts`) stays the standing gate; the runtime run is a dated, recorded demonstration, not a standing service. (Import note: n8n 2.x's importer requires a top-level `id` — import a scratch copy with one injected field; the committed workflow file stays id-less by design.)

## What the lane is

One committed workflow — `workflows/n8n/truth-audit-fees-to-slack.workflow.json` — the "deterministic backbone" pattern (research digest §4): **Manual Trigger → audit via the A0 registry → build the A3 Slack payload.** `active: false`; the only trigger is manual (prototype-not-service, AC-12); there is NO send node — the payload lands in `.n8n-artifacts/` (gitignored) and stops there. Both stages are sanctioned repo scripts (`scripts-ts/n8n/`), so the workflow orchestrates the SAME tested tools every other surface uses — n8n adds orchestration, never its own judgment.

## Running it (episodic — owner-armed for the runtime leg)

**⚠ Runtime caveat (Codex A4 review P2, verified against official n8n docs 2026-07-07):** current n8n (v2.0+) **disables the Execute Command node by default**; it is available on SELF-HOSTED instances only and must be consciously enabled (e.g. `NODES_EXCLUDE="[]"` in the environment — official node-blocking docs). Enabling it lets workflows run host shell commands — which is exactly why this repo's structural test pins the committed commands to an exact allowlisted argv shape and rejects every shell metacharacter. **Runtime status (updated 2026-07-07, evening): the O-A4 call was resolved (npx, Option A) and one episodic runtime run EXECUTED and byte-verified** — record + evidence hashes: `docs/reviews/l3-n8n-runtime-run-2026-07-07.md`. `NODES_EXCLUDE="[]"` was set session-locally for that run only and is not persisted anywhere; any future runtime run re-applies it consciously, per this caveat.

**Option A — npx (no docker; recommended at O-A4):**
```bash
cd <repo root>            # relative paths in the workflow resolve from here
NODES_EXCLUDE="[]" npx n8n   # self-hosted only; consciously re-enables Execute Command (see caveat)
# Editor → Import from file → workflows/n8n/truth-audit-fees-to-slack.workflow.json
# Open the workflow → "Execute workflow" (manual) → inspect .n8n-artifacts/
# Ctrl-C when done. Episodic: nothing keeps running.
```
**Option B — docker:** install Docker Desktop (owner call — poppler/cargo precedent), then `docker run -it --rm -p 5678:5678 -v "$PWD":"$PWD" -w "$PWD" n8nio/n8n` and import as above (the volume mount + workdir keep the repo-root-relative commands valid).

**Freshness obligations at runtime arming (RULES §6):** re-verify the n8n sustainable-use license + current npm/docker image live and date it (last vendor-tier check: research digest, 2026-07-06). Record the run (screenshot/log) in `docs/reviews/` like every live leg.

## Boundaries (binding)

- **No standing anything:** no webhook/cron/schedule nodes may ever be added to the committed workflow — the structural test fails the build if one appears.
- **No sending:** wiring a Slack/email SEND node = the L-2/L-3 owner-gated territory governed by `docs/plan-a3-delivery-safety.md`.
- **SIMULATED throughout:** the payload the lane produces carries the A3 banner by construction.
