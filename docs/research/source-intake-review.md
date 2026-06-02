# Source Intake and Applicability Review (T-001.6)

Date / "date checked": **2026-06-02**. Reviewer: Claude Code (review only; nothing installed/cloned/adopted; no product code/tests/CSV/`out` changes).

**This version is a correction pass.** The first version evaluated *pasted summaries*. This version reads the original PDFs directly from `/Users/sharan_98/Desktop/Claude Code Guide`, re-checks official Tier 1 docs live, and **separates source status explicitly** (directly inspected vs summary-only vs Tier 1 official vs repos inspected vs follow-up gaps).

## Source Status Ledger (read this first)

| Source | Status | Date |
| --- | --- | --- |
| `dynamic_workflows_prompt_pack.pdf` | **Directly inspected** (8 pp, full) | 2026-06-02 |
| `obsidian-setup-guide.pdf` | **Directly inspected** (7 pp, full) | 2026-06-02 |
| `codex_loop_field_guide.pdf` | **Directly inspected** (17 pp, full) | 2026-06-02 |
| `claude_architect_study_guide.pdf` | **NOT loaded** — 55 MB image-heavy file; native load is unsafe for the session and page-range rendering needs `poppler` (not installed; not installing per task). Principles independently verified vs official docs (below). | attempted 2026-06-02 |
| `codex_duo_field_guide.pdf` (12.5 MB) | Not inspected — the task named "Codex **Loop**" (read); `codex_duo` is a separate/earlier doc, out of scope. | n/a |
| `Dynamic_Workflows_Prompt_Pack (1).pdf` | Not separately read — appears to be a duplicate of the lowercase file (same title/size class). | n/a |
| `polyskill-kit/` (folder in the source dir) | Noted, not inspected — not requested. | n/a |
| Official Claude Code docs (Tier 1) | **Directly fetched** — see official section | 2026-06-02 |
| 5 GitHub repos | **Directly web-inspected** — see repo table | 2026-06-02 |
| Anthropic/OpenAI **model** release-notes + Claude Code **changelog** | **Gap** — not fetched (no model decision in scope; changelog URL 404'd) | n/a |

Honesty notes: (1) the `claude_architect_study_guide.pdf` was **not read** — deliberately, applying the very "cost/window risk before large runs" principle the Dynamic Workflows guide teaches; its principles are confirmed by official docs instead. (2) `earlyaidopters/second-brain` license is unspecified on its page. (3) repo star/activity figures are as reported by the page on 2026-06-02, not exact.

## Directly inspected PDFs

### `dynamic_workflows_prompt_pack.pdf` — Mark Kashef / Early AI Dopters (Tier 4, marketing/community)
- **Key ideas:** "dynamic workflow" = a team of agents spun up by the word `WORKFLOW`. Six-part anatomy: corpus → role/goal → explicit extraction spec → **fan-out (parallel)** → **verify pass (fact-check, report survived-vs-cut)** → one self-contained HTML report with **source on every line**. Three use cases (log-based upgrade guide, X-scraper research report, `~/.claude` setup audit) + a build-your-own template. Requires Claude Code **≥ 2.1.154** with dynamic workflows enabled, paid plan; Prompt 2 needs an Apify token.
- **Universal:** the verify-pass / source-on-every-line / survived-vs-cut discipline; "exact output shape before running"; fan-out for large corpora.
- **ActivationOps-specific:** the `~/.claude` setup-audit pattern could later find overlapping skills/contradicting rules — relevant to *this project's* growing governance surface.
- **Borrow (conventions, later):** verify-pass + source-per-line + cost/window check. **Defer:** building actual `/workflow` commands. **Reject (now):** the Apify-X-scraper research flow (external token, not needed). **Official confirmation:** the **fan-out** + **adversarial/verify** patterns are confirmed by official best-practices ("Fan out across files"; "Add an adversarial review step"; "a fresh model try to refute the result"). **Rule/plan change:** none required.

### `obsidian-setup-guide.pdf` — Early AI Dopters (Tier 4)
- **Key ideas:** Obsidian = local plain-`.md` vault; Claude Code reads it natively. Commands `/vault-setup`, `/daily`, `/tldr`, `/file-intel` (the last uses **Gemini**). Repos: `earlyaidopters/second-brain` (install scripts) + `kepano/obsidian-skills`. **It explicitly tells you to inject a vault `CLAUDE.md` globally into `~/.claude/CLAUDE.md`.**
- **Confirms my prior concern directly:** wiring a vault `CLAUDE.md` globally creates a **duplicate, always-loaded source of truth** — against `RULES.md` §1 *and* against official best-practices ("CLAUDE.md is loaded every session, so only include things that apply broadly… Bloated CLAUDE.md files cause Claude to ignore your actual instructions").
- **Decision:** **Reject as an in-repo/authoritative or global-CLAUDE.md tool.** If used at all → personal/external vault, never authoritative for ActivationOps, repo wins on conflict. **Do not run the setup scripts** (`curl|bash` / PowerShell-bypass). **Rule/plan change:** none (reinforces existing rules).

### `codex_loop_field_guide.pdf` — "Codex Loop Kit / claudex" — Mark Kashef (Tier 4; repo MIT)
- **Key ideas:** **claudex** wraps the Claude+Codex duo in an autonomous **DRAFT → REVIEW → REVISE → CHECK** loop. Built entirely on **Claude Code's Stop hook** ("the only thing in Claude Code that can force a loop to keep running by BLOCKing Claude's exit") + a YAML state file + CAS transitions. 4 commands: `/claudex:plan` (loop), `/claudex:review` (**read-only in v1**, writes `reviews/`), `/claudex:cancel` (graceful), `/claudex:rollback` (nuclear cleanup; code untouched, log preserved). Install: `github.com/promptadvisers/claudex` (MIT). **Doc is internally inconsistent on the default round count** (text "3"; two diagrams "5").
- **Self-documents the exact safety principle:** *"Auto-applying AI-generated patches into an unisolated working tree was the highest-severity finding in Codex's own review of claudex. v1 doesn't go there. v2 will, but only with explicit branch isolation."*
- **Universal:** read-only review by default; **branch isolation before any auto-apply**; cancel/rollback escape hatches; preserved audit log; bounded round budget.
- **ActivationOps-specific:** claudex automates the **exact dual-model loop this project already runs by hand** (`docs/dual-model-workflow.md`). It is the autonomous version of our workflow.
- **Borrow (principles, already partly ours):** read-only review, branch isolation, cancel/rollback, audit trail, round budget. **Defer / roadmap:** adopting claudex itself to automate the loop — **human approval required; do not install now.** **Reject (now):** auto-apply. **Official confirmation:** Stop hooks as a deterministic gate is confirmed by official docs ("a Stop hook runs your check as a script and blocks the turn from ending until it passes"). **Rule/plan change:** none now; if adopted later, document cancel/rollback + branch isolation.

## Claude Architect Study Guide — principles cross-checked vs official docs (guide NOT loaded)

The 55 MB PDF was **not loaded** (rationale above). Its listed principles are confirmed against **official Claude Code docs fetched live 2026-06-02**:

| Principle | Official verdict (with source) |
| --- | --- |
| Hooks for rules that must not fail; prompts only for style/guidance | **CONFIRMED.** best-practices: *"Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens"*; *"Use hooks for actions that must happen every time with zero exceptions"* (example: *"a hook that blocks writes to the migrations folder"*). features-overview: *"an instruction in CLAUDE.md or a skill is a request, not a guarantee."* |
| Skills for repeatable workflows; don't bloat CLAUDE.md | **CONFIRMED.** best-practices: *"For domain knowledge… use skills instead… without bloating every conversation"*; *"Bloated CLAUDE.md files cause Claude to ignore your actual instructions."* |
| Subagents for isolated investigation/review; separate review (self-review biased) | **CONFIRMED.** best-practices: *"A fresh context improves code review since Claude won't be biased toward code it just wrote"*; Writer/Reviewer pattern; adversarial review in a fresh subagent. |
| Plan mode for complex/ambiguous; direct execution for simple | **CONFIRMED.** best-practices: *"Plan mode is useful, but also adds overhead… If you could describe the diff in one sentence, skip the plan."* |
| Give Claude runnable verification checks | **CONFIRMED.** best-practices: *"Give Claude a check it can run: tests, a build, a screenshot"*; *"show evidence rather than asserting success."* |
| Project vs user scoping; path-specific rules vs one global file | **CONFIRMED.** features-overview (managed > user > project; `.claude/rules/` with `paths`); best-practices (CLAUDE.md locations). |
| Permissions/allowlists/sandboxing before higher autonomy | **CONFIRMED.** best-practices: Auto mode, `/permissions` allowlists, `/sandbox` OS isolation, `--allowedTools` for unattended runs. |
| Tool descriptions (when to use / not), avoid tool overload | **CONFIRMED in spirit** (description-based selection; context-cost guidance). |
| Structured output/tool-use; nullable fields; validation loops; retry w/ specific feedback; stop when source lacks data; context management; structured errors | **CONSISTENT** with official structured-output, `/clear`/compaction, and verification guidance; some items are general engineering practice rather than individually quotable → treat as reputable-but-general. |

**Most valuable finding (now strongly source-backed):** this project holds its hardest invariants (*don't modify the source CSV*, *no secrets in commits*) only as **prompt-level rules** in `RULES.md`/`CLAUDE.md` — which official docs class as **advisory, not guarantees**. The official best-practices page gives a near-identical example to my recommendation: *"a hook that blocks writes to the migrations folder."* → **Recommendation (not adopted): add a `PreToolUse`/`Stop` hook to deny edits to the source CSV and block secret-like strings.** Human-approval-gated tool/config change; would require a `decision-log` entry when approved.

## Official Anthropic / Claude Code Tier 1 check (fetched 2026-06-02)

| Doc | URL | What it confirms | Changes for us? |
| --- | --- | --- | --- |
| Extend Claude Code (features-overview) | `code.claude.com/docs/en/features-overview` | CLAUDE.md=context; Skills on-demand; Subagents isolated (restrictable tools); Hooks deterministic; scoping/precedence | Supports our direction; **does not contradict** any current rule |
| Best practices | `code.claude.com/docs/en/best-practices` | hooks-for-enforcement, plan-vs-direct, runnable checks, prune CLAUDE.md, permissions/sandbox, adversarial review + over-engineering caution | **Supports**; validates the hooks recommendation and the "don't over-flag" caution for Codex |
| Hooks | `code.claude.com/docs/en/hooks` | `PreToolUse` deny / `exit 2` to enforce policy | Supports the CSV/secrets hook idea |
| Subagents | `code.claude.com/docs/en/sub-agents` | isolated context, restrict tools, return summary | Supports Codex/independent review |
| Memory / Skills / Settings | (covered via features-overview tables) | CLAUDE.md < 200 lines; skills on-demand; managed>user>project | Reinforces keeping governance lean |
| **Changelog / release-notes** | (attempted `…/release-notes` → **404**) | — | **Gap**: changelog not located; check `code.claude.com/docs/llms.txt` index or GitHub releases at decision time |

Net: official docs **support or are neutral** to our materials; they **correct** the Obsidian guide's "global CLAUDE.md" advice (bloat warning) and **strongly back** the practitioner Codex-loop/dynamic-workflow patterns (which are essentially the official subagent/hook/fan-out features).

## GitHub repo direct inspection (web, 2026-06-02; not cloned)

| Repo | Inspected | Signal | Maturity | Use | Universal vs project | Confirm-before-use |
| --- | --- | --- | --- | --- | --- | --- |
| `promptadvisers/claudex` | **Direct** | MIT, ~75★, "v1 teachable artifact," read-only review, Stop-hook, fail-open, needs Codex CLI + ChatGPT plan | Teaching artifact / experimental | **Later** (automate the dual-model loop), human-approved | Universal pattern; project could adopt | Codex CLI behavior; branch-isolation for any auto-apply |
| `kepano/obsidian-skills` | **Direct** | MIT, **~34k★**, by Obsidian CEO (Steph Ango), Agent-Skills spec | Reputable, active reference | **Maybe (personal only)** | Project: not runtime | n/a (mature) |
| `earlyaidopters/second-brain` | **Direct** | **License unspecified**, ~173★, `curl\|bash`/PS-bypass installers, Gemini API | Personal tool | **Never in-repo / external personal only** | Project: reject | License + script review before any personal use |
| `promptadvisers/agentic-design-patterns-docs` | **Direct** | MIT, ~19★, single commit | Low-activity teaching/reference | **Later (reference only)** | Universal reference | Low confidence; verify patterns vs official docs |
| `promptadvisers/n8n-powerhouse` | **Direct** | MIT, ~4★, 2 commits, n8n skills framework + "production checklists" | Early/low-adoption | **Later (roadmap reference if n8n is added)** | Project-roadmap | Very low adoption → confirm vs official n8n docs before any use |

Prior review **did not** inspect any of these (now corrected). None cloned/adopted.

## Model, effort, and guideline freshness

- **No model change is being made.** The stated setup (Claude Opus 4.8 / GPT-5.5-extra-high) is the owner's current choice. Partial corroboration: the PDFs reference "Opus 4.8" and an "Opus 4.7 → 4.8" upgrade; the Codex guide uses `npm install -g @openai/codex` + `codex login` (consistent with the installed Codex plugin v1.0.4 verified earlier). **`GPT-5.5` is UNVERIFIED** (no OpenAI Tier 1 doc fetched).
- **Gap:** Anthropic model release-notes/pricing and OpenAI model docs were **not fetched** this pass; the Claude Code changelog URL 404'd. Classification: **no action now / needs-more-research before any model-dependent decision.** Recommend a focused model/tool freshness pass (Anthropic models page, OpenAI models page, Claude Code changelog via `llms.txt`) **at the time a model decision is actually made** — human approval if it affects cost/output/tests/public-claims/architecture/API/automation.

## Universal Source/Pattern/Reference Intake Rule

Already integrated last turn (`docs/enterprise-delivery-playbook.md` → "Source, Pattern, and Reference Intake"; `RULES.md §14`; `CLAUDE.md`; `CODEX.md`; prevent-repeat checklist). This review is an application of it; not re-pasted. No further governance edit was required to satisfy this addendum.

## Missing Addendum Checks

Did this review cover:
- **Direct PDF inspection** from `/Users/sharan_98/Desktop/Claude Code Guide` — ✅ 3 of the named PDFs read directly (Dynamic Workflows, Obsidian, Codex Loop). ⚠️ **Gap:** `claude_architect_study_guide.pdf` (55 MB) **not loaded** (size/tooling); principles verified via official docs instead.
- **Uploaded document-specific checks** — ✅ done from the actual files (not summaries) for the 3 read; Apps Script ⚠️ **not present** in the folder → future-source gap.
- **Latest official Anthropic / Claude Code docs** — ✅ features-overview, best-practices, hooks, sub-agents fetched live; memory/skills/settings via overview. ⚠️ **Gap:** changelog (404).
- **Model, effort, and guideline freshness** — ⚠️ **partial:** documented as a standing requirement; `GPT-5.5` UNVERIFIED; model release-notes not fetched (no decision in scope).
- **GitHub repo direct inspection** — ✅ all 5 web-inspected (prior review had inspected none).
- **Universal source/pattern/reference intake rule** — ✅ applied; already in the framework.
- **OpenAI / Codex freshness** — ⚠️ **partial:** Codex *plugin* behavior verified earlier from installed files (v1.0.4); OpenAI *model* docs not fetched.
- **Any playbook / RULES / CLAUDE / CODEX update required?** — **No update required** by this addendum (the intake rule is already integrated). One **recommended** (not required) improvement: enforcement **hooks** for CSV-immutability/no-secrets — human-approval-gated; would warrant a `decision-log` entry when approved.

**Gaps → recommended correction pass (small, optional):** (a) load the architect guide via a text/markdown export or with owner permission to install `poppler`; (b) a model/tool freshness sweep (Anthropic + OpenAI model docs + Claude Code changelog) at model-decision time; (c) inspect the Apps Script when its file is available. None block closing T-001 or scoping T-002.

## Recommendations summary

- **Borrow (conventions, later):** verify-pass + source-per-line + survived-vs-cut; exact-output-shape-first; cost/window check before heavy runs; bounded review rounds; read-only review + branch isolation.
- **Adapt:** our dual-model loop already embodies the Codex-loop principles; keep manual for now.
- **Defer / roadmap (human-approved):** adopting **claudex** to automate the loop; `n8n-powerhouse` when/if n8n lands; `agentic-design-patterns-docs` as low-confidence reference.
- **Reject (now):** installing claudex/second-brain/anything; global vault `CLAUDE.md`; auto-apply patches; treating any Obsidian vault as authoritative.
- **High-value, human-approval-gated:** `PreToolUse`/`Stop` hooks to enforce CSV-immutability + no-secrets (official-docs-backed).
- **Nothing installed, cloned, or adopted. No governance edit required by this addendum.**
