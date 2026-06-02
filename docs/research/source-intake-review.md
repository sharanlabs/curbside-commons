# Source Intake and Applicability Review (T-001.6)

Date / "date checked": **2026-06-02**. Reviewer: Claude Code (review only; nothing installed/cloned/adopted; no product code/tests/CSV/`out` changes).

This file is created now (no prior `docs/research/source-intake-review.md` existed) and incorporates the T-001.6 addendum. It applies the playbook's **Source, Pattern, and Reference Intake** rule and **Model/Tool Freshness** rule.

## Honesty / evidence basis (read first)

- **The "uploaded documents" are not present in this session.** I evaluated the **summaries pasted in the task**, not the source files (Dynamic Workflows Prompt Pack, Codex Loop/Claudex Field Guide, Claude Architect Study Guide, Obsidian/Second-Brain Guide, the existing Apps Script). Treat these intakes as evaluations of *claims as summarized*, not of the documents themselves. Re-run against the actual files if exact wording matters.
- **The existing Apps Script is not in this repo** (no Apps Script files present). It can only be evaluated as a future-stage input when its code is available.
- **Live Tier 1 check performed today:** official Claude Code docs at `code.claude.com/docs` (the docs host has moved there) — `features-overview`, `hooks`, `sub-agents`, with `memory`/`skills`/`settings` covered via the overview's detailed tables. **Not fetched this pass:** the Claude Code changelog page, Anthropic model release-notes/pricing, and OpenAI/Codex model docs (no model decision is being made in this task). Flagged below as a gap.
- Nothing here is adopted. Adoption requires a separate decision + human approval per the intake rule.

## Intake method

For each idea: classify **borrow / reject / adapt / defer**, tag **universal vs ActivationOps-specific**, note risk/bloat, and a discovery class (immediate fix · playbook improvement · future-stage input · reusable standard · roadmap reference · project-specific note · rejected/no action · needs more research). Proportional to risk.

## Dynamic Workflows Prompt Pack (summaries only)

| Idea | Assessment | Decision |
| --- | --- | --- |
| Fan-out review across many files | Maps to Claude Code **subagents / agent teams** ("spawn reviewers to check security, performance, tests simultaneously" — official). Useful for large diffs only. | **Defer** (future-stage input). Don't use for small deterministic edits. |
| Independent verify/refute agent | Aligns with subagents + the existing Codex cross-model review (already an independent reviewer). | **Adapt** (reusable standard) — the *principle* (independent verification) is already in the dual-model loop. |
| Ranked output + dropped-findings appendix (with reason) | Good review-output hygiene; cheap to adopt as a convention. | **Borrow** (playbook improvement, later) — as a review-output convention, not a tool. |
| Exact output shape before running | Strong, low-cost discipline (matches "structured output" principle below). | **Borrow** (reusable standard). |
| "Repeatable, Wide, and Worth resuming" gate | A sensible trigger for *when* a heavy multi-agent workflow is justified. | **Borrow** (playbook improvement) — fits the lightweight-vs-full tiering. |
| Cost/window risk check before large runs | Aligns with official "Understand context costs" guidance. | **Borrow** (reusable standard). |

Net: the *principles* are worth folding into the playbook's workflow guidance later; **no command/template built now**, no adoption. Do not use dynamic workflows for small deterministic edits (consistent with lightweight mode).

## Codex Loop / Claudex Field Guide (summaries only)

The project **already implements** the core idea — a Draft → Review → Revise → Check loop (Claude builds; Codex reviews; Claude revises; re-check) via the dual-model workflow. Evaluate Claudex only as an optional pattern.

- **Borrow (reusable standard):** read-only review safety (the Codex `review`/`adversarial-review` commands are review-only — verified earlier from the installed plugin v1.0.4); a default round budget with deeper rounds only when justified; an audit trail (already in `docs/task-log.md` + journal).
- **Adapt / roadmap:** explicit cancel + rollback escape hatches (git is the rollback; `/codex:cancel` exists); **branch isolation before auto-applying patches** — important because `/codex:rescue` *can* edit files (already flagged: use diagnosis-only or a branch).
- **Reject / no action now:** installing Claudex. Per the task, **do not install or adopt Claudex now.** If a loop tool is adopted later → **human approval required**, and document cancel/rollback behavior.

Risk noted: auto-applying patches without branch isolation. The project's current discipline (no silent auto-apply; commits are human-approved) already mitigates this.

## Claude Architect Study Guide — cross-checked vs official Anthropic docs (2026-06-02)

Verified against `code.claude.com/docs`:

| Principle | Verdict vs official docs |
| --- | --- |
| Hooks / programmatic enforcement for rules that must not fail | **CONFIRMED.** Official: *"an instruction … in CLAUDE.md or a skill is a request, not a guarantee. A `PreToolUse` hook that blocks the edit is enforcement … If a rule must hold every time, make it a hook."* `PreToolUse` can `deny`; *"If your hook is meant to enforce a policy, use `exit 2`."* |
| Prompts/CLAUDE.md only for style/guidance, not hard safety | **CONFIRMED** (same source — CLAUDE.md is "a request, not a guarantee"). |
| Skills for repeatable/domain workflows that shouldn't bloat CLAUDE.md | **CONFIRMED.** Official: *"Keep CLAUDE.md under 200 lines … move reference content to skills,"* which load on-demand. |
| Subagents for isolated investigation/review | **CONFIRMED.** Official: subagents run in their own context, return a summary; *"Enforce constraints by limiting which tools a subagent can use"* (supports read-only review). |
| Project-level vs user-level scoping; path-specific rules vs one global file | **CONFIRMED.** Official: managed > user > project layering; `.claude/rules/` with `paths` frontmatter loads only for matching files. |
| Clear tool descriptions (input/output/when-to-use/when-not) | **CONFIRMED** in spirit — Claude chooses skills/subagents by description; vague/overlapping descriptions cause misfires. |
| Avoid tool overload; keep tools focused | **CONFIRMED** (context-cost guidance; tool-search defers schemas). |
| Plan mode for complex/ambiguous; direct execution for simple | **CONSISTENT** with official "build up over time / match feature to goal" guidance (plan mode is an official feature; full plan-mode page not separately fetched → mark *partially verified*). |
| Separate review session (self-review biased) | **CONSISTENT** — subagents/agent-teams exist precisely for independent review. The project's Codex cross-model review is a stronger version. |
| Structured output w/ schemas/tool-use; nullable fields; validation loops; retry w/ specific feedback; stop when source lacks the data; context management; structured errors | **Consistent** with official structured-output / context-cost guidance; these are general engineering principles, not all individually quotable from the pages fetched → treat as **reputable-but-general** (Tier 1-aligned where it overlaps context/tooling docs; otherwise practitioner-grade). |

**Most valuable, source-backed finding for this project:** the project currently holds its **hardest invariants** (don't modify the source CSV; no secrets in commits; arguably "don't touch `out/`") in `RULES.md`/`CLAUDE.md` — which official docs classify as **requests, not guarantees**. The recurring process failures this project has seen (git-state staleness 3×) are the predictable result of relying on prompt-instructions for things that should be enforced. → **Recommendation (playbook improvement / roadmap):** consider a `PreToolUse` **hook** that denies edits to `DoorDash Merchant Nudge Engine - Merchant Directory.csv` and blocks secret-like strings in commits. **Not adopted now** — it's a tool/config change requiring human approval and a cancel/rollback note. Classification: **needs human approval; roadmap reference; high value.**

## Obsidian / Second-Brain Guide (summaries only)

Evaluate **only** as personal knowledge-management / cross-project continuity — **not** ActivationOps runtime.

- **Real risk, and it conflicts with a core project rule:** a vault with its own `CLAUDE.md` and "Claude reads vault files directly" creates a **duplicate source of truth** and **stale context if repo and vault disagree** — directly against `RULES.md` §1 (the repo is the source of truth).
- **Decision:** **Reject as an in-repo/authoritative tool.** If used at all, the vault stays **outside this repo**, personal/cross-project, and **never authoritative** for ActivationOps; the repo always wins on conflict. `/vault-setup`, `/daily`, `/tldr`, `/file-intel` are optional *personal* workflow ideas only. **Do not run setup scripts or install anything** (consistent with the task). Classification: **project-specific note / rejected for repo use.**

## Existing Apps Script / Google Sheets Baseline (not in repo)

Evaluate **later**, as a legacy baseline, when the code is available. Items to check then: retry handling · response validation · Gemini model config · agent roles · escalation logic · message variation/finalization · what to preserve vs replace with the Python/offline architecture · what belongs in future Gemini or Apps Script stages. **Do not refactor Apps Script now** (consistent with the task and with `plan-reconciliation.md`, which already defers it). Classification: **future-stage input / roadmap reference.**

## Latest Official Anthropic / Claude Code Guidance (Tier 1, checked 2026-06-02)

Source: `code.claude.com/docs` (`features-overview`, `hooks`, `sub-agents`). Confirmed: hooks = deterministic enforcement (`PreToolUse` deny / `exit 2`); CLAUDE.md = always-on **context/guidance, not a guarantee**, keep < 200 lines; skills = on-demand to avoid CLAUDE.md bloat; subagents = isolated context + restrictable tools for review; layered scoping (managed > user > project) and path-specific `.claude/rules/`; explicit context-cost management. These **corroborate** the project's existing direction and the Architect principles above.

**Not fetched this pass (flagged gap):** the Claude Code *changelog* page, Anthropic *model* release-notes/pricing, OpenAI/ChatGPT *model* docs. The installed Codex plugin behavior was verified earlier directly from its command files (v1.0.4) — that remains the Tier 1 basis for Codex commands; re-verify on plugin update.

## Model, Effort, and Guideline Freshness

- **No model change is proposed in this task**, so no model decision is being made today. The stated setup (Claude Opus 4.8 for Claude Code; GPT-5.5 / extra-high for ChatGPT review) is **carried as the owner's current choice, not independently re-verified** here — model names, availability, effort settings, pricing, and retirement status **must be checked against current Anthropic and OpenAI docs at the time any model-dependent decision is made** (freshness rule).
- Date checked (Claude Code feature docs): 2026-06-02. Anthropic model release-notes + OpenAI/Codex model docs: **not checked this pass** → see gaps.
- Classification: **no action now / needs-more-research before any switch.** Any model/tool upgrade requires human approval if it affects cost, output behavior, tests/evals, public claims, architecture, tool compatibility, API behavior, or automation reliability — and must document old→new, why, sources checked, benefit, risk, validation, date.

## Universal Source, Pattern, and Reference Intake Rule

Already integrated into the framework last turn — see `docs/enterprise-delivery-playbook.md` → "Source, Pattern, and Reference Intake", `RULES.md` §14, `CLAUDE.md`, `CODEX.md`, and the prevent-repeat checklist. **Not re-pasted here** (no-duplication / no-new-standing-logs). This review is an *application* of that rule.

## Missing Addendum Checks

Did this source-intake review cover:

- **Uploaded document-specific checks** — ✅ covered as *summaries* (Dynamic Workflows, Claudex, Architect, Obsidian, Apps Script). ⚠️ **Gap:** the actual uploaded files were not provided; re-run against originals if exact content matters.
- **Latest official Anthropic / Claude Code docs** — ✅ partial-to-strong: `features-overview`, `hooks`, `sub-agents` fetched live today; memory/skills/settings covered via the overview. ⚠️ **Gap:** changelog page not fetched.
- **Model, effort, and guideline freshness** — ⚠️ **partial:** documented as a standing requirement and not acted on (no model change); Anthropic model release-notes not fetched this pass.
- **Universal source/pattern/reference intake rule** — ✅ applied (and already in the framework).
- **OpenAI / Codex freshness checks where relevant** — ⚠️ **partial:** Codex *plugin command* behavior verified earlier from the installed files (v1.0.4); OpenAI *model* docs not fetched (no model decision here).
- **Whether any playbook / RULES / CLAUDE / CODEX update is required** — ✅ assessed: the intake rule is already integrated, so **no new governance edit is required to satisfy the addendum**. One **recommended** (not required) improvement surfaced: evaluate `PreToolUse` **hooks** to enforce the hardest invariants (CSV-immutability, no-secrets) instead of prompt-only rules — a future, human-approved tool/config decision, not part of this review.

**Gaps → recommended correction pass (small, optional):** a focused freshness fetch of the Claude Code **changelog** + Anthropic **model** release-notes + OpenAI **model** docs at the point a model/feature decision is actually made; and an intake re-run against the **actual uploaded files** if their exact wording will drive a decision. None of these block closing T-001 or scoping T-002.

## Recommendations summary

- **Borrow now (conventions, cheap):** output-shape-first, ranked findings + dropped-findings appendix, cost/window check before heavy runs, "repeatable/wide/worth-resuming" gate — fold into the playbook's workflow guidance **later**, not as new files.
- **Adapt:** the Draft→Review→Revise→Check loop is already the dual-model workflow; keep, with explicit branch-isolation when `/codex:rescue` edits.
- **Defer / future-stage:** fan-out/agent-team review for large diffs; Apps Script baseline (when code is available); model-doc freshness sweep at decision time.
- **Reject (now):** installing Claudex; making an Obsidian vault an authoritative/in-repo source of truth.
- **High-value, human-approval-gated roadmap item:** `PreToolUse` hooks to deterministically enforce CSV-immutability and no-secrets (official docs back this).
- **Nothing adopted, installed, or cloned. No governance edit required by this addendum.**
