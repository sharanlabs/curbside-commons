# L-3 — n8n Runtime Execution Record (owner-armed, episodic, SIMULATED)

**Run date:** 2026-07-08T02:21:05Z → 02:21:06Z (2026-07-07 ~22:21 ET, sixteenth session).
**Verdict: the committed workflow EXECUTED under the real n8n runtime — `status: "success", finished: true` — and both artifacts it produced are BYTE-IDENTICAL to direct engine builds.** The A4 lane's label upgrades from *"workflow spec + command-level dry run; n8n runtime execution pending O-A4"* to *"executed n8n lane (one recorded episodic runtime run, 2026-07-07)"*.

## Arming + O-A4 resolution

Owner word 2026-07-07 (*"except design and deploy complete all …"*, decision-log row) answering the surfaced O-A4 choice (npx / docker / spec-only) → **Option A: npx, no docker** (`docs/n8n-runbook.md`), the reversible no-install path. frontier-advisor consult ruling recorded: this runtime leg is a **transient LOCAL demonstration** under prototype-not-service — it is not "deploy" (nothing hosted, nothing standing); `NODES_EXCLUDE="[]"` was a **conscious session-local enablement** (env var on the two commands only, never persisted anywhere).

## Freshness (RULES §6, checked live 2026-07-07)

- npm registry: **n8n latest = 2.29.7**, `license: SEE LICENSE IN LICENSE.md` (the fair-code Sustainable Use License — vendor-tier check dated 2026-07-06 in the research digest; self-hosted episodic use is in-license), engines `node >=22.22` (local Node v24.15.0 ✓).
- CLI semantics verified against the live official docs (docs.n8n.io → *Use the command line*): `n8n import:workflow --input=<file>`, `n8n execute --id <ID>`.

## What ran (exact sequence)

1. **Isolation:** `N8N_USER_FOLDER` pointed at the session scratchpad (nothing in the repo or `~/.n8n`); `N8N_DIAGNOSTICS_ENABLED=false`; run from the repo root so the workflow's repo-relative commands resolve (workflow `meta.note`).
2. **Import:** n8n 2.29.7's importer requires a top-level `id` the committed workflow deliberately doesn't carry → a scratchpad copy was imported that is **identical to `workflows/n8n/truth-audit-fees-to-slack.workflow.json` except one injected field `"id": "L3RuntimeDemo0001"`** — machine-checked, not asserted: JSON-equal after deleting the id (evidence appendix below); the committed file is unchanged. First import attempt without the id failed loudly (`SQLITE_CONSTRAINT: NOT NULL constraint failed: workflow_entity.id`) — recorded as-is.
3. **Execute:** `NODES_EXCLUDE="[]" npx n8n execute --id L3RuntimeDemo0001` → the Manual Trigger → Execute Command (A0 registry audit) → Execute Command (A3 Slack payload) chain ran **inside the n8n runtime** (`"mode": "cli"`), exit success in ~0.9s. Episodic: the process exited; nothing is left running; the scratchpad n8n home is session-temporary.

## Veracity (the same bar as the committed dry run)

Byte-comparison against direct builds through the same entry points (`callTool('audit_statement', …)` + `buildSlackReportPayload` / `serializeSlackPayload`):

| Artifact (produced UNDER n8n) | vs direct engine build |
|---|---|
| `.n8n-artifacts/canonical.json` | **byte-equal: true** |
| `.n8n-artifacts/slack-payload.json` | **byte-equal: true** (SIMULATED banner present in block 1) |

So the runtime run proves exactly what the dry run proved — n8n added orchestration, never its own judgment — now with the runtime itself in the loop.

## Boundaries held

- Manual trigger only; `active: false`; no webhook/cron/schedule/send node (the structural gate still passes on the committed file — unchanged).
- Nothing was sent anywhere; the payload stopped in the gitignored `.n8n-artifacts/` folder. Sending remains L-2 territory (`docs/plan-a3-delivery-safety.md`), still owner-gated on a named recipient.
- No install performed (npx cache only); no Docker; no standing service. Re-running is one command from the runbook.

*Plain: we pressed the workflow's one manual button inside the real n8n app this time, watched it run the same tested audit and produce the same ready-to-post (never posted) message byte-for-byte, and turned everything off. The automation lane is no longer "spec only" — it has run for real, once, on purpose.*

## Evidence appendix (added at the Codex gate — P2: the record must be independently checkable)

**Exact commands (repo root; env session-local only):**
```bash
N8N_USER_FOLDER=<scratchpad>/n8n-home NODES_EXCLUDE="[]" N8N_DIAGNOSTICS_ENABLED=false \
  npx n8n import:workflow --input=<scratchpad>/l3-import.workflow.json   # Successfully imported 1 workflow.
N8N_USER_FOLDER=<scratchpad>/n8n-home NODES_EXCLUDE="[]" N8N_DIAGNOSTICS_ENABLED=false \
  npx n8n execute --id L3RuntimeDemo0001
```
**Raw `n8n execute` output (tail, verbatim):** `"mode": "cli", "startedAt": "2026-07-08T02:21:05.131Z", "stoppedAt": "2026-07-08T02:21:06.004Z", "storedAt": "db", "status": "success", "finished": true`.

**Import-delta proof (machine-checked, not asserted):** parsing the scratch copy, deleting its `id`, and JSON-comparing against the committed workflow → **equal** (`scratch-minus-id ≡ committed: true`); the injected id is `"L3RuntimeDemo0001"`. Hashes: committed workflow `7d2e785e155e66dda4ce29bc4e3794f11d974a640be9e7a242bb29d4ce681301`; scratch import copy `9ea4577002ce3d3f56d910ed60f6d3a639368c957e6e4081866f7c78d9051d84` (differs only by the injected id field, per the structural comparison above).

**Artifact byte-identity (sha256, n8n-runtime output vs direct build through the same entry points — `callTool('audit_statement', {statementPath: 'fixtures/synthetic-restaurant/fees/statement.drifted.json'})` + `serializeSlackPayload(buildSlackReportPayload(canonical, {tool, subject: 'statement 2026-06 (simulated)'}))`):**

| Artifact | n8n runtime | direct build |
|---|---|---|
| canonical report | `140eb322ca1eea2db3f1ccf4c97370aef7106555d57d638b4e60c476fe719ca6` | `140eb322ca1eea2db3f1ccf4c97370aef7106555d57d638b4e60c476fe719ca6` |
| Slack payload | `a490b5610b0d4238c96a8b477e1c378f8eed93a8881e516b5f6a5661e212da8e` | `a490b5610b0d4238c96a8b477e1c378f8eed93a8881e516b5f6a5661e212da8e` |

The direct-build hashes re-derive from the committed fixtures + engine on any checkout (the same derivation the CI dry run executes), so this table is reproducible without the n8n runtime.
