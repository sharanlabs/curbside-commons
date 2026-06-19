# Dual-Model Workflow (Internal)

This is an **internal build method**, not the product. It does not belong in public-facing product docs except as a short "Development Workflow" note (`RULES.md` §8).

Claude Code plans and builds. Codex adversarially reviews, reviews changed files, rescues stalled work, and audits before shipping. The human owner approves.

## Command surface (verified)

Source: the installed Codex plugin command definitions at `~/.claude/plugins/cache/openai-codex/codex/1.0.4/commands/`, read 2026-06-01 (plugin `codex@openai-codex` v1.0.4). Re-verify after any plugin update (`RULES.md` §6).

> **Cross-project serialization (2026-06-13):** when invoking Codex via the CLI directly (`codex exec` / `codex exec resume`, e.g. inside grill-me-codex), route it through the shared queue wrapper **`~/claude-os/bin/codex-guarded`** (drop-in for `codex`). The machine has ONE Codex seat shared by all the owner's concurrent projects; the wrapper serializes runs (auto-queues; atomic-mkdir mutex + dead-holder/stale reclaim) and, with per-project namespaced `-o` output paths, makes cross-project collision/contamination structurally impossible. The `/codex:*` plugin commands above are the normal build path; the wrapper matters for raw-CLI calls. Built + verified 2026-06-13 (decision-log).

| Command | Purpose | Edits files? | Notable flags |
| --- | --- | --- | --- |
| `/codex:adversarial-review` | Challenge the approach, design, tradeoffs, assumptions, failure modes | **No** (review-only) | `--wait` / `--background`, `--base <ref>`, `--scope auto\|working-tree\|branch`, plus free-text focus |
| `/codex:review` | Native code review of local git state | **No** (review-only) | `--wait` / `--background`, `--base <ref>`, `--scope auto\|working-tree\|branch` (no focus text) |
| `/codex:rescue` | Investigate or fix a failure; routes to the `codex:codex-rescue` subagent | **Yes** (can modify files) | `--background` / `--wait`, `--resume` / `--fresh`, `--model <model\|spark>`, `--effort <none\|minimal\|low\|medium\|high\|xhigh>` |
| `/codex:status` | Show active/recent Codex jobs (incl. review-gate status) | No | `[job-id]`, `--wait`, `--timeout-ms <ms>`, `--all` |
| `/codex:result` | Show the stored final output of a finished job | No | `[job-id]` |
| `/codex:cancel` | Cancel an active background job | No | `[job-id]` |
| `/codex:setup` | Check Codex CLI readiness; toggle the stop-time review gate | No | `--enable-review-gate` / `--disable-review-gate` |

Notes:
- `--background` runs the job detached; you then poll `/codex:status` and read `/codex:result`. Without `--wait` or `--background`, review commands estimate size and ask once whether to wait or background.
- `/codex:adversarial-review` accepts extra focus text; `/codex:review` does not (it is native-review only).
- Neither review command supports `--scope staged` or `--scope unstaged`.

## When to use each

### Planning

1. Claude creates a focused plan (use `docs/prompts/claude-task-template.md`).
2. Codex adversarially reviews the plan — `/codex:adversarial-review` (use `docs/prompts/codex-plan-review-template.md` for the focus text).
3. Claude revises once.
4. Human approves.

### Build slice

1. Claude builds one small slice.
2. Claude runs checks/tests.
3. Codex reviews changed files — `/codex:review --background` (use `docs/prompts/codex-changed-files-review-template.md`).
4. Claude fixes accepted issues.
5. Docs and handoff are updated.
6. Commit (human-approved).

### Failure / debug

- If tests fail or debugging stalls: `/codex:rescue <task> --background` (use `docs/prompts/codex-rescue-template.md`).
- **Important:** `/codex:rescue` can edit files. If you want diagnosis only, say so explicitly, e.g. "do not change anything yet, diagnose only."

### Background jobs

- Launch with `--background`.
- Check progress with `/codex:status`.
- Read the outcome with `/codex:result`.
- Cancel with `/codex:cancel`.
- Record the job's purpose and whether its result was checked in `HANDOFF.md` or `docs/task-log.md`.

## Codex Rescue at milestones

Run a Codex rescue / audit pass after each of these:

- offline thin slice complete;
- Gemini structured output added;
- Supabase added;
- n8n added;
- Slack approval added;
- Resend webhook added;
- before publishing.

## Review gate (use sparingly)

The stop-time review gate makes Codex review a gate, not an on-demand step. Use it **only** for focused, high-risk sessions:

- live send logic;
- Slack approval handler;
- Supabase write/update logic;
- idempotency and duplicate-send prevention;
- final pre-publish hardening.

Enable: `/codex:setup --enable-review-gate`. **Disable immediately afterward:** `/codex:setup --disable-review-gate`. Do not run always-on review by default — it kills flow state for low-risk work.

## Guardrails on this workflow

- Review commands never edit; only `/codex:rescue` does. Treat rescue output as a draft to review, not a finished change (`RULES.md` §16–17).
- Codex's job is to challenge, not to expand scope. Scope changes go through the human and `docs/decision-log.md`.
- Keep the loop honest: do not commit AI-churned output without a human read.
