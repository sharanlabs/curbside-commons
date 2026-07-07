# Codex Cross-Check — Agentic Extension Plan (raw output, 2026-07-07)

Invocation: ~/claude-os/bin/codex-guarded exec --sandbox read-only (seat smoke-tested SEAT_OK first; config default gpt-5.5 @ xhigh). Prompt archived in the summary record.

```
Reading additional input from stdin...
2026-07-07T14:11:41.206090Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer realm=\"OAuth\", resource_metadata=\"https://mcp.linear.app/.well-known/oauth-protected-resource/mcp\", error=\"invalid_token\", error_description=\"Missing or invalid access token\"" })
2026-07-07T14:11:41.282746Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer resource_metadata=\"https://mcp.figma.com/.well-known/oauth-protected-resource\",scope=\"mcp:connect\",authorization_uri=\"https://api.figma.com/.well-known/oauth-authorization-server\"" })
OpenAI Codex v0.136.0
--------
workdir: /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
model: gpt-5.5
provider: openai
approval: never
sandbox: read-only
reasoning effort: medium
reasoning summaries: none
session id: 019f3ceb-959a-7d83-be25-4f546596fa53
--------
user
ADVERSARIAL PLAN CROSS-CHECK (read-only; you are the challenger, not the author).

Review the NEW plan doc `docs/plan-agentic-extension.md` (v1.0-rc) in this repo. Context docs: `docs/research/agentic-extension-research-2026-07.md` (the research it builds on), `docs/plan-truth-audit-execution.md` (the completed base plan whose conventions it extends), `RULES.md` (constitution — §3 offline-first order-of-operations, §4 honesty, §6 source verification). The engine it plans over: lib/packs/listings/ (runCheck/runConformanceCheck/runDemo), lib/packs/fees/ (auditStatement/auditWithClassification/FEE_RULES), lib/agents/ (existing LLM lanes), bin/check.mjs.

Your explicit attack surface (from the plan's own §10):
(a) §6 trajectory-eval floors — are they TESTABLE AS WRITTEN? Attack vagueness: is "expected recommendation class matched" well-defined? Is "the injection does not steer tool choice" machine-checkable? Would YOU be able to write the failing test?
(b) AC-2 differential fidelity and AC-6 recommendation-only — structurally enforceable as claimed? Attack the byte-equality claim (MCP serialization, JSON key ordering) and the "no agent-reachable constructor" compile-time claim.
(c) Contradiction scan vs RULES §3/§4 and the base plan (docs/plan-truth-audit-execution.md) — anything this plan permits that the constitution forbids, or vice versa.
(d) The slice DAG dependency claims (§5) — A1 and A2 truly siblings on A0? A3/A4 dependencies right? Anything hidden?
(e) Theater risk — anything a skeptical hiring reviewer would call fake (mocked agents presented as agents, n8n as no-code veneer, MCP wrapper triviality)?
Plus: anything else material you find (missing acceptance criteria, unverifiable claims, cost/scope holes, prompt-injection handling gaps).

Output format: VERDICT line first (CONFIRM / CONFIRM-WITH-AMENDMENTS / BLOCK), then numbered findings, each with severity P0/P1/P2/P3, the exact plan section/line, the defect, and the concrete amendment you propose. Refute-or-fix precision only — no generic advice.
codex
I’ll treat this as a read-only adversarial review. I’m going to first load the project rules and the specific plan/research/base-plan files, then inspect the referenced engine surfaces enough to test the plan’s claims against actual code shape.
exec
/bin/zsh -lc 'git status --short' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-fvIBdlB9' (errno=Operation not permitted)
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-03X1RPtb' (errno=Operation not permitted)
?? docs/plan-agentic-extension.md

exec
/bin/zsh -lc "pwd && rg --files -g 'RULES.md' -g 'PROJECT_STATE.md' -g 'CURRENT_TASK.md' -g 'HANDOFF.md' -g 'docs/task-log.md' -g 'docs/plan-agentic-extension.md' -g 'docs/research/agentic-extension-research-2026-07.md' -g 'docs/plan-truth-audit-execution.md' -g 'bin/check.mjs' -g 'lib/**'" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
/Users/sharan_98/Desktop/AI DoorDash Merchant Engine
HANDOFF.md
bin/check.mjs
PROJECT_STATE.md
RULES.md
lib/product.ts
CURRENT_TASK.md
lib/verifier-core/index.ts
lib/verifier-core/claim.ts
lib/verifier-core/guard.ts
lib/verifier-core/reference.ts
lib/verifier-core/verify.ts
lib/verifier-core/evidence.ts
lib/verifier-core/report.ts
lib/data/fee-classifier-calibration.snapshot.json
lib/agents/fee-classifier.ts
lib/agents/budget.ts
lib/agents/gemini.ts
lib/agents/groq.ts
lib/agents/pricing.ts
lib/utils.ts
lib/server/env-flags.ts
lib/packs/listings/run.ts
lib/packs/listings/acp-feed.ts
lib/packs/listings/index.ts
lib/packs/listings/generate.ts
lib/packs/listings/report-view.ts
lib/packs/listings/drift.ts
lib/packs/listings/types.ts
lib/packs/listings/cli.ts
lib/packs/listings/ucp-wire.ts
lib/packs/listings/reference.ts
lib/packs/listings/ucp.ts
lib/packs/listings/conformance.ts
lib/packs/listings/detectors.ts
lib/packs/listings/ucp-corpus.ts
lib/packs/listings/adapters.ts
lib/packs/listings/demo/index.ts
lib/packs/listings/demo/transcript.ts
lib/packs/listings/demo/render-text.ts
lib/packs/listings/demo/copy.ts
lib/packs/listings/demo/types.ts
lib/packs/listings/demo/actor.ts
lib/packs/fees/finding.ts
lib/packs/fees/classified-audit.ts
lib/packs/fees/classifier.ts
lib/packs/fees/audit.ts
lib/packs/fees/index.ts
lib/packs/fees/generate.ts
lib/packs/fees/statement.ts
lib/packs/fees/rules.ts
lib/packs/fees/parser.ts
lib/packs/fees/cli.ts
docs/plan-agentic-extension.md
docs/task-log.md
docs/plan-truth-audit-execution.md
docs/research/agentic-extension-research-2026-07.md

codex
The worktree shows `docs/plan-agentic-extension.md` is untracked, which matches “NEW plan doc.” `git status` emitted macOS cache warnings because the sandbox is read-only; the useful signal is that no tracked edits are shown, only the new plan file.
exec
/bin/zsh -lc 'nl -ba RULES.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc 'nl -ba CURRENT_TASK.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	# RULES.md — ActivationOps AI Operating Rules
     2	
     3	These are the non-negotiable rules for everyone working on this project: Claude Code (account 1), Claude Code (account 2), Claude Code CLI, Codex, and the human owner.
     4	
     5	They live in the repo on purpose (Rule 1). **If anything else — a chat prompt, a skill, a model's memory, a habit — conflicts with this file, this file wins.**
     6	
     7	Last reviewed: 2026-06-01.
     8	
     9	## 1. Source of truth and continuity
    10	
    11	1. The repo is the source of truth — not chat history, not model memory, not a previous session's recollection.
    12	2. Every agent (Claude account 1, Claude account 2, Claude CLI, Codex) continues from repo files, never from memory. On start: read `RULES.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`, then run `git status`, then summarize and wait for human approval.
    13	
    14	## 2. Roles
    15	
    16	3. Claude Code is the main planner and builder.
    17	4. Codex is the adversarial reviewer, changed-files reviewer, rescue debugger, and pre-ship auditor.
    18	5. The human owner makes the final call on product, scope, architecture, and publishing. Agents propose; the human disposes.
    19	
    20	## 3. How we build
    21	
    22	6. Build in flow state, but never allow silent architecture drift. Any change that alters scope or architecture stops for a `docs/decision-log.md` entry and human sign-off.
    23	7. Start simple. Add complexity only when a concrete, named need justifies it.
    24	8. No live Supabase, Slack, n8n, Resend, or Gemini integration until the offline thin slice is complete and reviewed.
    25	
    26	Order of operations — each precedes the next:
    27	
    28	9. Deterministic logic before AI calls.
    29	10. Structured outputs before prose.
    30	11. Decision before action.
    31	12. Human approval before risky automation.
    32	13. Evaluation before claims.
    33	14. Logs before confidence.
    34	15. Cost control before scale.
    35	
    36	## 4. AI honesty and product integrity
    37	
    38	16. Do not publish or commit AI-churned work. Generated text or code is a draft until a human reads and accepts it.
    39	17. No AI-generated output is final until reviewed and accepted.
    40	18. Never claim "no AI was used."
    41	19. Never claim "AI built this."
    42	20. Use the framing: **human-led, AI-assisted, professionally reviewed.**
    43	
    44	Project integrity: this is a simulation on dummy data. Never claim real DoorDash access, real merchant data, or real business impact. Label all metrics "simulated."
    45	
    46	## 5. Claude skills rule
    47	
    48	Claude Code must use relevant skills from the configured skills folder when they apply. Before starting a task, identify:
    49	
    50	- the task type;
    51	- the relevant skill(s);
    52	- why the skill applies;
    53	- whether any skill conflicts with these rules.
    54	
    55	If a skill conflicts with project rules, RULES.md wins. Do not use skills blindly — use only the smallest relevant set. Record skill usage in `docs/task-log.md`.
    56	
    57	## 6. Source verification rule
    58	
    59	Any claim about tool capabilities, plugin behavior, Gemini model status, API limits, pricing or free tiers, Slack, n8n, Resend, Supabase, Google Sheets, Claude Code, or Codex must be verified against current official documentation (or the installed tool itself) — or clearly marked **UNVERIFIED**.
    60	
    61	- Do not rely on memory for platform behavior.
    62	- Do not document a platform claim without a source basis.
    63	- Cite the source (URL or local path) next to the claim where practical.
    64	
    65	## 7. Visual documentation standard
    66	
    67	Use visuals to explain the system, not to decorate it. Mermaid (`.mmd`) by default.
    68	
    69	1. Every diagram explains a real workflow, decision, or architecture.
    70	2. A diagram must be understandable in under a minute.
    71	3. If implementation changes a workflow, update the diagram in the same task.
    72	4. Visuals must not imply features that are not built yet.
    73	5. Future-state diagrams must be clearly labeled roadmap / target.
    74	6. The public README should eventually carry only product diagrams, not internal process diagrams.
    75	7. Do not let the dual-model diagram overshadow the product.
    76	
    77	See `docs/visuals/README.md`.
    78	
    79	## 8. Public vs internal documentation
    80	
    81	Dual-model engineering is an internal build method, not the product. Do not let the build process overshadow the product.
    82	
    83	- **Public docs** focus on the product: the onboarding problem, the AI workflow, data model, risk scoring, blocker diagnosis, guardrails, human review, automation flow, outcome tracking, limitations, roadmap.
    84	- **Internal docs** may cover the Claude + Codex workflow, Codex commands, review gates, rescue, handoff, skills usage, cross-account continuity.
    85	- In public docs, Claude Code and Codex appear only under a short "Development Workflow" note — never as the product runtime stack.
    86	
    87	| Layer | Components |
    88	| --- | --- |
    89	| Product runtime stack | CSV / Google Sheets, Python or Apps Script, Gemini, Supabase, n8n, Slack, Resend, dashboard / docs |
    90	| Development workflow (internal) | Claude Code (planning + build), Codex (adversarial review, changed-file review, rescue, pre-ship), Git, Mermaid |
    91	
    92	## 9. Definition of done
    93	
    94	A task is done only when:
    95	
    96	- code or documentation changed as expected;
    97	- checks or tests were run where applicable;
    98	- `docs/task-log.md` updated;
    99	- `docs/implementation-journal.md` updated if the work was meaningful;
   100	- `docs/decision-log.md` updated if scope or architecture changed;
   101	- `HANDOFF.md` updated;
   102	- Codex review completed, or intentionally deferred with a written reason;
   103	- the human owner can understand the next step.
   104	
   105	## 10. Where things get recorded
   106	
   107	- Small edits → `docs/task-log.md`.
   108	- Meaningful work, failures, tradeoffs, corrections → `docs/implementation-journal.md`.
   109	- Scope / architecture decisions → `docs/decision-log.md` (plus an ADR in `docs/decisions/` if major).
   110	- Active task → `CURRENT_TASK.md`. Session hand-off → `HANDOFF.md`. Overall state → `PROJECT_STATE.md`.
   111	- Before closing any task, run `docs/checklists/prevent-repeat-checklist.md`.
   112	
   113	## 11. Secrets
   114	
   115	No secrets anywhere in the repo or its outputs: no API keys, tokens, credentials, connection strings, personal data, or other secrets in code, CSVs, logs, screenshots, commit history, docs, or prompts.
   116	
   117	- Use environment variables or a secret manager for any future credential — never a committed file.
   118	- Keep contact data in the simulation fake (e.g., `@example.com`).
   119	- If a secret is ever committed by accident, treat it as compromised: rotate it and scrub it — do not just delete the line.
   120	
   121	## 12. Commit hygiene
   122	
   123	- Check `git status` before starting and after finishing work.
   124	- Commit after each clean slice — one whose checks/tests pass and whose state is coherent.
   125	- Do not commit broken, half-finished, or unclear work.
   126	- Commit messages explain the task outcome (what changed and why), not "wip".
   127	- The human owner approves commits and pushes; do not commit or push unless asked.
   128	
   129	## 13. Lightweight vs full workflow
   130	
   131	Match the process weight to the risk.
   132	
   133	- **Lightweight loop** — for deterministic, offline slices (data normalization, scoring, local logic): build, run checks, one Codex changed-files review, update `docs/task-log.md` and `HANDOFF.md`. Journal and decision-log only if something meaningful or architectural happened.
   134	- **Full loop** — for integrations, live sends, auth/security, data writes, and publishing: plan adversarial review, build, changed-files review, rescue if needed, journal + decision-log, prevent-repeat checklist, and (for high-risk sessions only) the Codex review gate.
   135	
   136	When unsure which applies, use the full loop. See `docs/dual-model-workflow.md`.
   137	
   138	## 14. Enterprise Delivery Playbook (pointer)
   139	
   140	`docs/enterprise-delivery-playbook.md` is the living "how" for professional execution. `RULES.md` stays the constitution; the playbook elaborates it. Key rules it carries:
   141	
   142	- **Core traceability:** every meaningful task runs idea → use-case classification → source scan → framework/tool selection → alternatives → assumptions → approach → validation evidence → failure handling → reuse → expansion → handoff → human approval — *proportional to risk*.
   143	- **Lightweight vs full** (per §13) governs how much of that chain applies.
   144	- **Source-backed standard:** important claims use source tiers (Tier 1 official first) with a stated sufficiency/stop point; no memory for platform behavior (extends §6).
   145	- **Source/pattern/reference intake:** evaluate before adopting *anything* external (source, repo, template, workflow, tool, code/prompt/UI/design pattern, architecture, framework, methodology) — no default adoption, no cargo-culting; classify borrow/reject/adapt/defer; approval gate when it affects scope, architecture, tools, data model, AI behavior, integrations, public claims, or publishing. Proportional to risk.
   146	- **Open-source discovery:** named sources/frameworks/repos/communities/examples (in the repo or a task prompt) are **candidates/seed lists, not boundaries**. Search **broadly and task-specifically** — official + vendor + standards docs, mature OSS, GitHub issues/PRs, eng blogs, and community field-signals (Reddit/forums/YouTube/Stack Overflow) — then pick by quality/relevance/freshness/maturity/risk. Tiers judge *quality*, not *discovery*. Maximum-useful-research ≠ endless: stop when more research won't change the decision; document uncertainty. Community content is a field signal, not proof, unless corroborated.
   147	- **Model/API/tool freshness:** model/API/platform choices that affect implementation, cost, security, public claims, or compatibility carry a dated freshness check.
   148	- **Artifact policy:** every generated artifact is classified (commit / regenerate / ignore / examples / internal).
   149	- **Stage closure criteria:** a stage closes only on the playbook's checklist + human approval.
   150	- **No new standing logs unless justified:** prefer updating existing docs.
   151	- **Living standard:** change the playbook only on real evidence, and record what/why/trigger/universal-or-project-specific/burden.
   152	- **Roles:** Claude applies the playbook · Codex verifies it was applied · ChatGPT web gives stage-level review · the human owner approves. No assistant turns a suggestion into a decision.
   153	- **Git state is always re-derived** from `git status` + `git log --oneline -8`, never assumed.
   154	
   155	## 15. Mandatory Startup Contract
   156	
   157	Every Claude Code session must begin by:
   158	
   159	1. Reading `RULES.md`.
   160	2. Reading `CLAUDE.md`.
   161	3. Reading `PROJECT_STATE.md`.
   162	4. Reading `CURRENT_TASK.md`.
   163	5. Reading `HANDOFF.md`.
   164	6. Reading `docs/enterprise-delivery-playbook.md`.
   165	7. Running `git status`.
   166	8. Running `git log --oneline -8`.
   167	9. Showing a short **Professional Process Applied** block before meaningful work.
   168	10. Waiting for human approval if the task changes scope, tools, architecture, public claims, integrations, or AI behavior.
   169	
   170	The **Professional Process Applied** block must include: task type · stage · risk level · lightweight or full mode · framework/principle/tool basis · source requirement · validation method · artifact policy (if relevant) · documentation required · Codex review needed or not · human approval needed or not.
   171	
   172	**Stop condition:** if Claude cannot identify the task type, risk level, validation method, or whether lightweight/full mode applies, **stop and ask the human owner before acting.**
   173	
   174	**Proportionality (anti-bloat):** keep this light for trivial edits. For small, low-risk changes the Professional Process Applied block can be a single line. Do not run full ceremony on a one-line doc fix.
   175	
   176	**Codex enforcement:** every Codex review verifies whether this contract and the playbook were followed (`CODEX.md`). If Claude skipped the playbook/contract for a *meaningful* task, Codex flags it as a process finding.
   177	
   178	## 16. Prompt Intake (Intent Capture & Prompt Synthesis) — non-negotiable
   179	
   180	Owner input may be rough, broken, or ungrammatical; that must **never** degrade output. Before acting on owner input, every agent (any account, any IDE) applies the **Prompt Intake Protocol** (`docs/prompt-intake-protocol.md`): **preserve the raw input verbatim**, reconstruct the true intent, and synthesize an effective prompt aligned to the current model + playbook — **without diluting, summarizing, or dropping** anything.
   181	
   182	- **Principle-based, self-updating:** durable principles live in the protocol; specific prompting *techniques* are delegated to current model docs + updatable prompt skills (re-verified per §6). Do not hardcode tricks.
   183	- **Proportional (anti-bloat):** default to silent intent-capture; surface a structured interpretation or a confirm only when the request is ambiguous or consequential. No friction on trivial edits.
   184	- **Fidelity over fluency:** raw input is authoritative; any added assumption is surfaced explicitly, never buried. When intent is unclear on consequential work, ask.
   185	- **Portable:** the protocol's core works with zero skills installed; skills are optional accelerators.

 succeeded in 0ms:
     1	# CURRENT_TASK.md
     2	
     3	The single active task. Update this whenever the active task changes or pauses.
     4	
     5	- **Task ID:** PIVOT-RESEARCH (2026-07-01/02; owner-directed — supersedes the MULTI-AGENT-PIVOT roadmap as the ACTIVE task; the multi-agent build + slice-2 close-out are SUSPENDED, not cancelled — slice-2's uncommitted diff is intact on disk and its live re-run authorization still stands if the owner returns to it)
     6	- **▶ AGENTIC EXTENSION DIRECTED — ACTIVE = PLAN STAGE (2026-07-06, fourteenth session FINAL): owner fixed the extension goal — a PERSONAL DEMONSTRATION project showcasing applied-AI/agentic/AI-automation proficiency (AI-Engineer-class roles; not model training, not no-code toys; floor tools Claude Code/Codex · n8n · MCP · Zapier-class). Live research digest committed (docs/research/agentic-extension-research-2026-07.md). Proposed shape (owner-seen, plan-gated next): agent crew (Intake/Audit/Evidence/Reviewer over the gated engine as tools) + MCP server + Slack/email delivery (offline-first RULES §3) + n8n lane. NEXT SESSION (any account): the PLAN-STAGE prompt in the HANDOFF top block → declarative plan + Codex cross-check → STOP for owner GO before build. Hard stops unchanged. Repo LIVE PRIVATE (github.com/sharanlabs/commerce-truth-audit; flip = owner's own act); verify 749+6; internal backlog ZERO.**
     7	- **▶ GITHUB PUBLISH EXECUTED — REPO LIVE PRIVATE; PUBLIC FLIP HELD BY OWNER (2026-07-06, fourteenth session): owner word "resume except design, github publish complete all other steps." armed the publish. Authorization committed pre-push (`8f81b9e`) → private repo created + pushed (`github.com/sharanlabs/commerce-truth-audit`, main tracking origin, About set) → advisor-mandated identifier sweep (tree clean except ratified internal-transcript paths; git author email `sharank98@gmail.com` on all 144 commits = the surfaced finding) → owner ruled STAY PRIVATE. Four Pub defaults RATIFIED by directive; classifier retry NOT armed; S-11 open; design/deploy excluded. ACTIVE = NOTHING — owner acts only: flip public (`gh repo edit sharanlabs/commerce-truth-audit --visibility public --accept-visibility-change-consequences`; the author email publishes with it — any rewrite must happen BEFORE the flip and would break SHA anchors) · S-11 brand · design→deploy · classifier retry via new pre-registration. advisor() down 14th session; frontier-advisor PROCEED-WITH-CONSTRAINTS (all adopted). SECOND DIRECTIVE same session ("complete all other steps now except github, design"): M2 gate-4 nits CLOSED red-green at `9ef2d87` (claimIdPart escape + loud makeLineTagger + comment; verify 749+6; goldens byte-frozen; Codex CLEAN +1 P3 fixed) · ledger statuses synced (S-2/S-4/S-5/S-9) · S-11 alternates live-screened (Plumbline cleanest; Parallax/Trig dead; Tare risky). Internal backlog = ZERO; all open items owner-only.**
     8	- **▶ PUB EXECUTED — PLAN COMPLETE, REPO PUSHED PRIVATE (2026-07-06, thirteenth session): owner word "except design complete all other tasks" armed the last plan §5 slice. README replaced (truth-audit fronted; legacy = lineage) · PUBLICATION writeup · demo recording (byte-locked) · LICENSE Apache-2.0 + NOTICE (O6 closed) · C10 gate extended over public prose (bit live, red-green) · rename → "Commerce Truth Audit" (descriptive interim; S-11 open — "Assay" collided live) + banner-only golden regen · CSV relocated + py-config regression fixed · lockfile relocked (L4/L6/L8 + L12–L15; Juniper dropped; zero PENDING-RELOCK among used facts) · sanitization audit clean. Codex chain SHIP (BLOCK×4→SHIP, 5 raws; batch @medium deviation recorded) + acceptance-gate SHIP (verify handoff discharged raw: 743+6 / 306+5 / 35). Records: docs/reviews/{codex-2026-07-06-pub-slice.md, pub-verify-evidence.log, gate-2026-07-06-pub-slice.md}. COMMITTED (`4489ad9`); the private-repo push was DENIED by the harness permission layer (no recorded owner authorization) — returned to the owner as a one-command act. ACTIVE = NOTHING — only OWNER ACTS: create the private repo + push (`gh repo create commerce-truth-audit --private --source=. --remote=origin --push`) · then flip public (DCWP July hearing = timing anchor; skim docs/reviews/ first) · ratify the 4 defaults-taken · S-11 brand pick · design→deploy · classifier retry via new pre-registration. advisor() down 13th session.**
     9	- **▶ THE FOUR OWNER DECISIONS EXECUTED — LIVE CLASSIFIER RAN, LABEL DEFERS (2026-07-05, twelfth session): owner "all four" → ① live run armed + executed (run #1 lost outcome-blind to an ENOENT after all 84 calls — incident on record, harness fixed with probe-write-before-spend; run #2 AUTHORITATIVE: held-out 20/21 strictly beats the 19/21 baseline · macro P 0.971 · κ 0.944 · flip 0.000 · but enhanced_service_fee recall 3/4 = 0.75 < the ≥0.80 floor → THE LABEL DEFERS, conjunctive rule, no re-run, split exposed + not re-scorable) — frozen snapshot + eval-lock (tamper red-green durable) + status doc with the provenance addendum (floors pre-run at bda6314/550e3cb; no-rerun rule at c73c100; working-tree-only conventions provably outcome-invariant); ② Gemini color DECLINED (closed); ③ cargo/Rust installed → C5 MEASURED 33/35 + 2 documented LST-CONF-FORMAT divergences (2020-12 format-assertion fork, one-class-one-direction encoding) + 0 disagreements, clean-PATH reproducible; ④ license → the Pub gate. Gates: Codex BLOCK (1P1+2P2+1P3) → all reconciled red-green → confirming pass (oracle re-run in its own sandbox; provenance verified vs git history) → final narrow confirm SHIP with its raw on the record; acceptance-gate BLOCK narrow (evidence-completeness only; substance recomputed + held) → both flip conditions discharged with raws → SHIP (docs/reviews/gate-2026-07-05-f1b-live-slice.md). verify 737+6; test:legacy 306+5; F1a goldens byte-unchanged. Records: docs/reviews/{f1b-live-slice-record.md, codex-2026-07-05-f1b-live-slice.md (+3 raws), f1b-live-wiring-verify-evidence.log, gate-2026-07-05-f1b-live-slice.md}. ACTIVE = NOTHING QUEUED — the remaining plan §5 slice is Pub (owner-gated); a classifier retry would need a NEW pre-registration + owner word. Push HELD (no remote); advisor() down 12th session.**
    10	- **▶ M2 DISCHARGED — F1 MODULE ACCEPTED (2026-07-04, eleventh session): batched Codex BLOCK (2P1+2P2+1P3; scope a/b CONFIRMED, c/d each refuted-on-one-point) → frontier-advisor pre-verdict PROCEED (retry after seat limit, 3 rulings) → all 5 reconciled + red-green (`550e3cb`: c-2 asserted-passthrough non-gating warn state · floor amended pre-run to ≥20/21 tie=DEFER · mixed-month parser rejection · L-tagged unique claim ids + sanctioned golden regen · drift-lock kind+source_clause) → confirming pass ALL FIVE DISCHARGED (+1 residual P3 comment fix) → independent acceptance-gate SHIP 5/5 (verify handoff run live: verify exit 0 720+5, legacy 306+5; e1 count discrepancy resolved benign + honesty note). Gate-4 advisory nits left for the next slice (commit-as-is terms). Records: docs/reviews/{codex-2026-07-04-m2-f1-batch{,-raw},codex-2026-07-04-m2-f1-confirm-raw,m2-reconcile-evidence.log,gate-2026-07-04-m2-f1-module}. ACTIVE = OWNER DECISIONS (session stops): ① arm the live classifier run — UNBLOCKED by M2 SHIP, surfaced not started (docs/plan-f1b-classifier.md §3: Groq $0, K=3 temp-0, TPD pacing, held-out split vs pre-registered floors incl. ≥20/21) · ② Gemini demo color (≤$0.50) · ③ cargo/Rust C5 · ④ corpus license (O6). Remaining §5 slice: Pub (owner-gated). Push HELD (no remote); advisor() down 11th session.**
    11	- **▶ F1 OFFLINE CORE DONE (2026-07-04, tenth session): F1a fees deterministic spine (`896ab59`) + F1b classification layer (`bda6314`) both shipped at the per-slice gate; verify GREEN 715+5; test:legacy 306+5. F1a: statement schema + frozen corpus + 17-rule drift-lock (11 predicates + 6 registered non-checkable) + U1 structural provisionality + e-1 refund-window verdict states + CLI fees leg. F1b: leak-free classifier seam + anti-theater baseline PINNED 19/21 held-out + N=42 gold set (21/21 composition-locked) + metrics port + advisory audit path + PRE-REGISTERED R-DHON-3 floors (docs/plan-f1b-classifier.md) — LLM lane DESIGNED, NOT WIRED. Deviations recorded (decision-log 2026-07-04): F1b builder died twice (seat limit → owner-confirmed resume; then "API Error: Overloaded") → NO-WAIT inline tail on Fable (RG ×3 reviewer-executed). frontier-advisor consulted pre-approach (shape B, 4 constraints landed) + pre-wrap (ruling: M2 NOW; live legs BLOCKED on M2 SHIP). ACTIVE = M2 FULL CEREMONY over the F1 module (`896ab59`+`bda6314`): ONE batched Codex via codex-guarded + independent acceptance-gate; M2 scope MUST enumerate the ClaimSource "classifier" shared-core touch + the reviewer-executed red-greens. AFTER M2 SHIP: surface the owner-gated live classifier run (Groq $0, floors pre-registered). OPEN OWNER CALLS: arm live classifier run (post-M2) · Gemini demo color (≤$0.50) · cargo/Rust C5 (past horizon) · corpus license (O6). Push HELD (no remote); advisor() down 10th session.**
    12	- **▶ D1 SCRIPTED CORE DONE (2026-07-03, ninth session): the demo slice shipped at the per-slice gate — transcript engine (verdicts COMPUTED from the real verifier/conformance entry points, mutation red-green) + SOR-blind actor (import-graph machine-verified) + CLI `demo` leg (strict flags, byte-frozen goldens) + `/demo` Static one-pager (SIMULATED banner; renders committed JSON byte-locked to the live engine) + honesty gate extended (C7 verbatim single-sourced; banned framing machine-blocked) + conformance-foil beat computed live. Both M1 advisories folded (dead C3 clause; cli-c1 alias resolver). frontier-advisor consult SUCCESSFUL pre-approach (PROCEED, 4 constraints all landed); implementer@opus built; Fable-equivalence PASS + 1 elevation fix (corpus README indexes the demo goldens). verify GREEN 557+5; test:legacy 306+5. RG ×4 (`docs/reviews/d1-verify-evidence.log`); record `docs/reviews/d1-slice-record.md`. OPEN OWNER CALLS: Gemini color variant (arm/decline, ≤$0.50) · cargo/Rust (C5 unmeasured — D1-close horizon reached) · corpus license (O6). ACTIVE = F1 (UC-1: parser + LLM classifier vs the P1 rule table + judge recalibration + fee report, C8; offline-first, live runs owner-gated) → M2 full ceremony. Push HELD (no remote).**
    13	- **▶ W3 DONE + M1 FULLY DISCHARGED — THE WEDGE MODULE IS ACCEPTED (2026-07-03, eighth session): W3 shipped (`54124ff`, Opus builder + Fable-equivalence PASS with 3 elevation fixes: unparsed `--json` → loud flag validation RG-8 · report honesty wording · W2-era spawn-test flake caught by the independent verify re-run). M1 ceremony ran in full: batched Codex (`gpt-5.5`@`xhigh`, ~2.77M tokens) over the whole module → BLOCK 1 P1 + 4 P2 + 2 P3 with all six W1 claims + the headline CONFIRMED → ALL 7 reconciled + red-green (`7962810`: CLI mixed-mode exclusion · drift-013 answer-key split + C3 completeness invariant · C6 per-entry teeth · claimSource receipt · exactly-one set-equality · C10 scan + wording · surplus positionals) → mapped confirming pass ALL SEVEN DISCHARGED + 1 residual P3 (--op on truth leg) fixed red-green (`0eda64c`) → independent acceptance-gate SHIP (module ACCEPTED at `0eda64c`; W1's conditional stamp SUPERSEDED; record `docs/reviews/gate-2026-07-03-m1-wedge-module.md`). verify GREEN 515+5; test:legacy 306+5. UPDATED ROUTING DOCTRINE ADOPTED (owner-directed; decision-log row): frontier-advisor = working advisor leg (first successful consult in 8 sessions — PROCEED at the M1 boundary), implementer = default delegated-execution lane, Fable-equivalence = the doctrine's top-model-final bar. OPEN OWNER CALLS: cargo/Rust (C5 unmeasured — decide before/at D1) · corpus license (O6). Gate advisories folded into D1's work list (dead C3 test clause · cli-c1 resolver alias gap · em-dash at Pub). ACTIVE = D1 (scripted spec-faithful demo on the drifted corpus; ANY live Gemini color spend needs OWNER WORD, ≤$0.50). Push HELD (no remote).**
    14	- **▶ W1-GATE DISCHARGED + W2 DONE (2026-07-03, seventh session): the W1 named obligation ran (`08c9299` — independent acceptance-gate BLOCK→both P2s closed same session→SHIP conditional on M1 Codex; record `docs/reviews/gate-2026-07-03-w1-wedge.md`) and W2 shipped (`1d0697e`, Opus builder + Fable-equivalence PASS + elevation): ajv over 78 pinned official UCP schemas (spec repo `ucp` v2026-04-08, sha256-locked, L6 RELOCKED) → `LST-CONF-*` conformance leg through the same C2 guard + CLI `--conformance`; N=35 seeded CI corpus; THE HEADLINE machine-checked (`conformant-but-false.json` passes ajv, truth leg catches the lie); ACP 18/18 rules red-green; all 7 gate advisories landed; RG×7. verify GREEN 478+5; test:legacy 306+5. OPEN OWNER CALL: cargo absent → C5 oracle agreement UNMEASURED locally (install Rust vs measure elsewhere; decide by M1). ACTIVE = W3 (one-page report + corpus packaging) → M1 full ceremony (ONE batched Codex over the whole wedge module [W1's SHIP is conditional on it] + acceptance-gate). Push HELD (no remote); advisor down (7th session).**
    15	- **▶ W0+P1+W1 DONE (2026-07-03, sixth session — BUILD EXECUTED): W0 `1b04766` (restructure §6; legacy archived runnable, test:legacy 306+5) · P1 `da1e2e7` (NYC §20-563.3/LL79 rule table, 17 rules VERIFIED-primary; effective date RESOLVED became-law 05-31/effective 06-30; U1 base = F1 dependency) · W1 `5a81440` (the wedge: seeded SOR → ACP/UCP surfaces → deterministic comparator + C2 evidence guard + one-command $0-LLM CLI; C3 differential incl. ID-mismatch + modifier-ambiguity; C6 8/8 measured; RED-GREEN ×4). verify GREEN 409+5. THREE new owner rulings recorded (decision-log): Fable-equivalence review bar · post-check elevation mandate · deploy deferred until design fixed. DEVIATION recorded: W1 built INLINE on Fable (subagent seat limited twice, raw errors verbatim; NO-WAIT) → NAMED OBLIGATION = acceptance-gate pass on W1 post-reset (≥2:30pm ET). ACTIVE = W2 (UCP ajv + `ucp-schema` CI oracle) → W3 → M1 full ceremony (Codex batch + acceptance-gate). Push HELD (no remote); Gemini spend needs owner word; advisor down (6th session).**
    16	- **▶ ROUTING + JUDGE RULINGS SET (2026-07-03, fifth session — boot/handoff only, no product code): stage confirmed = BUILD (W0→W1+P1, spec-adherence). Owner rulings recorded (decision-log ×2 + HANDOFF ROUTE+JUDGE line): execution seat = Opus 4.8 @ xhigh (owner switches via /model); FABLE = FINAL JUDGE at every stage (gate verdicts/reconciliations/stage-exits on the Fable seat — fable-override delegates or a Fable session at boundaries; Codex stays adversarial input) + standing full-liberty license for blindspot fixes (hard stops unchanged). Blindspot fixes applied: poppler INSTALLED at wrap (owner-ordered, v26.06.0 — P1 PDF path open); harness scaffolding (.agents/, .claude/skills/, screenshots/, skills-lock.json, settings.local.json) gitignored so slice diff-gates stay clean; live verify baseline re-run (result in session record). advisor UNAVAILABLE 5th session (surfaced). AMENDED at wrap (owner): DELEGATION rendering — the fresh session stays on FABLE as orchestrator/final judge; execution slices are delegated to Opus 4.8 @ xhigh subagents (HANDOFF ROUTE+JUDGE line updated). NEXT = fresh Fable session → paste the HANDOFF "BUILD W0+W1" prompt.**
    17	- **▶ BUILD LIVE (2026-07-02, late): OWNER GO landed ("do it… build working prototype now") + NO-WAIT + REAL-FIRST + O4-declined rulings (decision-log). S0 COMMITTED (`a65064b` slice-2 provenance close-out · `fb20eba` plan-stage docs; verify green 306+5). G8 crux gate RAN INLINE → PASS (copy layer in-protocol per UCP catalog spec; seat unoccupied; buyer claim declined — `docs/reviews/gate-2026-07-02-g8-crux.md`). ACTIVE = W0 (repo restructure §6) → W1 (the $0-LLM wedge) + P1 (UC-1 rule-table via alternative sources) per `docs/plan-truth-audit-execution.md` v1.0 — paste-ready build prompt in HANDOFF. Mode flips to SPEC-ADHERENCE (build stage). Push HELD (no remote); Gemini demo spend needs owner word.**
    18	- **▶ PLAN-STAGE GATES DISCHARGED (2026-07-02, fourth session): council RESHAPE-PROCEED (7 conditions) + Codex CONFIRM-WITH-AMENDMENTS (12/12 accepted, reconciled) → the plan is `docs/plan-truth-audit-execution.md` v1.0-rc. ACTIVE = OWNER GO (plan §9, O1–O8). ⏰ TIME-SENSITIVE: O4 = the July-16 DCWP recordkeeping-comment window — decide THIS WEEK (gated by a one-page source memo first). Key reshapes: UC-1 (fee audit) = the program's PRIMARY evidence/AI-depth track from week 1; UC-2 = bounded frontier demo behind the HARD pre-build crux gate G8 (copy-layer persistence + buyer authority); S-5 close-out first (owner acceptance record + verify + provenance caveat); surface-agnostic engine; demo claim = "spec-faithful agent follows a spec-valid but false surface"; category demoted to mechanism-led; split tripwires; confidence MEDIUM-conditional. New standing constraint: DESKTOP WEB ONLY (no mobile). Evidence: research ADDENDUM + ⚠ CORRECTION in `docs/research/pivot-research-2026-07.md`; council in `shared_reasoning.md`; Codex in `docs/reviews/codex-2026-07-02-pivot-crosscheck{,-raw}.md`. NO build (incl. S0's commit) before the GO. Seat events this session: 4 research subagents died on the shared Claude seat limit (raw error surfaced; Phase 1 done inline); `advisor` unavailable (4th session).**
    19	- **▶ REFRAME ACCEPTED FOR PLANNING (2026-07-02, latest; decision-log last 2 rows): UC-2's lead artifact = an OPEN ACP/UCP conformance + truth-audit toolkit ("the truth layer for agentic commerce") + the "agent gets caught" demo — NOT a merchant-facing prototype SaaS. UC-1 unchanged as module two. Standing plan-stage directives: judgment license until build; legibility = hard artifact constraint (complex inside, simple outside); data = free/open + live(ToS-clean) + hybrid + synthetic with an ENUMERATED edge-case taxonomy; free/free-tier everything except Gemini ≤$5. NEW standing artifacts: `docs/PLAIN-ENGLISH.md` (layman explainer) + `docs/documentation-standard.md` + `docs/GLOSSARY.md` (two-register docs, floor-not-ceiling) + `docs/suggestions-ledger.md` (S-1..S-10 — ALL Claude suggestions with statuses; S-4/S-5/S-9 PENDING → fold into the plan). The plan-stage gates are unchanged (council → Codex → owner GO) and now validate the REFRAMED direction. **SESSION WRAPPED 2026-07-02 (lossless) — resume via the HANDOFF top-block prompt.**
    20	- **▶ ORDER FLIPPED (2026-07-02, later same day; decision-log 3rd row): UC-2 LEADS — cross-surface/agent-facing TRUTH VERIFICATION is slice one (cooperative, platform-benefiting, agentic-commerce frontier); UC-1 fee-audit = module two. Backlog: `docs/research/use-case-backlog.md`. The bullet below is the pre-flip record.**
    21	- **▶ OWNER PICKED THE DIRECTION (2026-07-02): the COMPOSITE "marketplace truth-audit layer" with the FEE-AUDIT WEDGE — ACTIVE = the PLAN STAGE (fresh session; paste-ready prompt in HANDOFF): standing research to-dos for the wedge (NYC LL79/§20-563.3 + AB 578 primary texts, Reddit first-person pass, Loop/Voosh video teardowns) → council deep-validation → MANDATORY Codex cross-check (the pick is "accepted for planning", DECIDED only after these gates) → declarative plan + roadmap reusing the verification spine → owner GO before any build.** Decision-log 2026-07-02 (2nd row).
    22	- **▶ PIVOT RESEARCH STAGE DONE (2026-07-02) — ACTIVE = OWNER PICKS THE PIVOT CANDIDATE → then plan/roadmap (fresh session recommended).** The owner re-opened the 2026-06-22 goal-fork (pivot side): find a real, high-value, **structurally** underexplored problem in the DoorDash/Uber Eats/Grubhub-class US delivery-marketplace industry (company-agnostic), solvable by a vertical AI solution at **adoption-grade prototype** standard. **FIXED OBJECTIVE (owner-settled via AskUserQuestion 2026-07-02):** showcase-first venture-ready · prefer-reuse of the verification spine (evidence can override) · "could be adopted" = quality bar (metaphorical); adopter = a research output per candidate · constraints unchanged (prototype-not-service, $5 cap, honesty rules). **RESEARCH EXECUTED** (2 quarantined threads, ~100 sources, plan-mode approved): ranked digest = `docs/research/pivot-research-2026-07.md`. **Headline: #1 fee-statement integrity & fee-cap compliance audit for merchants (LEAD-POTENTIAL — HungryPanda $875K NYC enforcement 2026-04 + FTC docket FTC-2026-0463; searched-and-empty for any product; counterparty-adverse = durable) · #2 cross-surface menu/price truth verification incl. AI-agent surfaces (LEAD-POTENTIAL early — Square ChatGPT/Claude ordering launched 2026-07-01; syncer≠judge; independent-verifier seat empty) · ★ composite "marketplace truth-audit layer" (both threads converged; #1 = wedge, #2 = growth surface) · H1 dispute automation CONTESTED (Loop $14M Series A Feb 2026 + DoorDash ToS prohibits third-party dispute submission) · H2 refund-abuse + driver-side AVOID.** Standing to-dos before build commitment: Reddit first-person pass, video layer (Loop/Voosh demo teardowns), NYC LL79/AB578 primary texts, ACP/UCP spec reads, council deep-validation + **Codex cross-check on the chosen direction (consequential — named-open)**. Decision-log 2026-07-02. NO product code changed. *(The bullets below are the suspended multi-agent-build record — resume them only if the owner redirects back.)*
    23	- **▶ ROADMAP SLICE 2 CLOSE-OUT (2026-06-29; owner chose Option 1). STEP 1 of 2 DONE (offline load-reduction, gated) · STEP 2 HELD (live re-run — Groq daily window not fresh). ACTIVE = a FRESH-DAY session to run the already-authorized live re-run.** Offline half done autonomously, harness-only: a **pre-registered, OUTCOME-BLIND 4 tune + 4 test subsample** in `evals/agent-loop.live.test.ts` (1 item/mode/split, lowest-definition-order, ORIGINAL splits preserved, `maxIterations=3` kept) + an **offline composition unit test**; **`npm run verify` GREEN 306 (+1) + 5 skipped**. Deliverable-B **success criterion reframed** (pre-registered + advisor-cross-checked; **FLAG at the batched Codex review**): clean = **detection === N** (HARD gate; degraded fails loudly); **`test ≥ K` is now a REPORTED measurement, not a hard pass/fail** (coarse K at reduced N; a genuine non-convergence can land the floor red on a clean run — reported honestly, never recomposed); K asserted non-vacuous. Pre-registration: `docs/a3-7-live-run-status.md` → "SLICE 2 CLOSE-OUT — PRE-REGISTRATION". **STEP 2 HELD: the Groq daily window is NOT fresh** (2026-06-29 run depleted today's TPD; preflight shows only TPM; reset semantics UNVERIFIED per RULES §6 but not fresh today either way; expected ~2026-06-30 00:00 UTC). **NEXT = fresh-day session → confirm fresh window → live re-run (≤$5; ~$0.02) → gate whole slice-2 diff (verify → ONE batched Codex → acceptance-gate) → commit (owner-authorized) → push HELD. Do NOT auto-fire live spend overnight on calendar inference alone.** *(The bullet below is the prior-run record — superseded by this close-out for the method/criterion; the live re-run is what remains.)*
    24	- **▶ ROADMAP SLICE 2 — CLEAN R-A3-9 LIVE RE-RUN EXECUTED (2026-06-29; owner GO). ACTIVE = OWNER DECISION PENDING for deliverable B (the clean K). UNCOMMITTED; batched Codex + acceptance-gate + commit HELD until the owner picks how to finish B (so a shared-seat Codex pass isn't spent on a possibly-superseded snapshot).** Live cross-family harness ran (`ENABLE_LIVE_AI=true` CLI-override only; `.env` stays `false`, re-confirmed). RULES §6 re-anchored 2026-06-29 (gemini-2.5-flash $0.30/$2.50, no table change). Cost **$0.0189** (« $5). **A — DRAFTER-RELIABILITY (slice-1 fix's first LIVE test) → ✅ CONFIRMED CLEAN:** `final_redraft_live 16/16`, `final_redraft_fell_back 0`, **0/24 redrafts `finishReason=length`** (all `=stop`) — the A3-7 ~75% parse-failure is GONE; the slice-1 fix works live. **Advisor carry-forward ANSWERED: the Drafter still EARNS its label under disabled thinking, more robustly** (every converged draft live-authored, zero stub fallbacks on the final redraft). **B — R-A3-9 CLEAN K → ⚠️ STILL INCOMPLETE (Groq-degraded again):** K now REAL (tune 6/7=0.857 → K=7), but `degraded:true` (**detection 13/16**), `test_meets_floor:false` (5/9<7); the vitest floor assertion FAILED LIVE (honest degraded red — NOT a code regression, NOT modified to pass; live test auto-skips offline, **`npm run verify` GREEN 305+5**). The unmet floor is substantially a degradation artifact: 1 genuine non-convergence (P-entity-2, correctly HELD) + 3 Groq-tail fallbacks (judge/domain `FAILED_TO_FALLBACK`; their drafter redrafts parsed fine). **NEW ROOT CAUSE:** the now-reliable drafter → more live redrafts → more Groq judge/domain calls per run → one full run depletes the Groq free-tier DAILY window on the tail (the binding constraint, not the $5 cap). **LABELS UNCHANGED — all 3 DEFER, run-independent** (Router `signals_differ:0` again; ledger "1 earned + 3 deferred"). Bail rule honored (degraded → diagnostic; not enshrined; no blind-re-run). Record: `docs/a3-7-live-run-status.md` → "RESULTS — SLICE 2 RE-RUN"; new tool `scripts-ts/groq-preflight.mjs`. **OWNER DECISION (B; live spend = owner-gated): (1) reduce per-run Groq load + fresh-window re-run [cheapest/free]; (2) split across windows; (3) paid Groq for one run [owner+Codex]; (4) accept K directional + stop.** *(The SLICE 1 line below is historical — slice 1 is DONE + COMMITTED `4eed015`.)*
    25	- **▶ ROADMAP SLICE 1 — DRAFTER-RELIABILITY FIX: DONE + FULLY GATED + COMMITTED (2026-06-29; autopilot, push HELD — no remote). ACTIVE = STOP + surface SLICE 2 (clean R-A3-9 live re-run) to the owner — OWNER-GATED live spend (≤$5).** WIRED + `verify` GREEN **305+5** + typecheck/lint/build + differential **20/20** UNTOUCHED (7 changed files: 4 product [gemini/draft/budget/orchestrator] + 3 test) + **RED-GREEN proven** (7 changes). **FIVE Codex passes reconciled primary-model-final** (review BLOCK 4 → confirm-1 BLOCK 1 → confirm-2 BLOCK 1+P3 → confirm-3 final BLOCK 1 P2); the $5 cap is now an honest FAIL-CLOSED BEST-EFFORT bound (pre-call reserve incl. the documented max thinking budget + a post-call `budget_overflow` stop). **gate-2 CLEARED — the final confirming Codex pass RAN on the reset seat (`gpt-5.5`@`xhigh`, read-only) → BLOCK on a SINGLE P2 (no P0/P1: two comments still said "true upper bound" — `gemini.ts:179` + `evals/gemini.test.ts:97`) → ACCEPTED + reworded primary-model-final (`maxRetries=0` maps ONE reservation→ONE billed attempt; overflow bounded by the post-call stop; comment/string-only, verify still 305+5). Codex CLEAN-confirmed the mechanism (overflow stop placement, cap+one-call bound, fail-closed, differential untouched). acceptance-gate = SHIP (gates 1/2/3/4/5 PASS — independent subagent confirmed the rewordings LANDED + differential untouched; its only BLOCK was the doc-sync, now done).** Fixed the A3-7 ~75%-redraft-parse-failure: **(a)** `usageFromError` now merges the SDK error's top-level `finishReason` (was dropped) → `DraftResult.usage` → trajectory `verdictSummary` (truncation now PROVABLE at the live re-run); **(b)** disabled thinking on the bounded draft call (`thinkingConfig.thinkingBudget=0`, confirmed forwarded in `@ai-sdk/google` v2.0.76) + raised `MAX_LIVE_OUTPUT_TOKENS` 2000→4096 (insurance; estimate ≪ $5). RULES §6 root-cause confirmed from 2 sources (thinking tokens bill against `maxOutputTokens`). **HONESTY BOUND:** proves the instrumentation + that the fix is WIRED, offline/$0 — does NOT prove the live parse-rate recovers (= owner-gated SLICE 2; read `finishReason` live + advisor carry-forward: re-confirm the Drafter still EARNS its label under disabled thinking). Records: `docs/reviews/{codex-2026-06-29-slice1-drafter-reliability.md, slice1-drafter-reliability-verify-evidence.log}`. **COMMITTED** (owner-authorized per the roadmap directive; re-derive SHA via `git log`); push HELD. **NEXT = STOP + get the owner GO on SLICE 2.** *(The A3-7 bullet below is historical — A3-7 is done + gated + committed `9bcfd37`.)*
    26	- **▶ A3-7 LIVE CROSS-FAMILY RUN EXECUTED (2026-06-28) — TWO deliverables, OPPOSITE outcomes. A3-7 FULLY GATED (Codex DISCHARGED 2 rounds + acceptance-gate SHIP 5/5) + COMMITTED `9bcfd37` (push HELD). **ACTIVE = NEXT SESSION (owner-scoped 2026-06-28 via AskUserQuestion) — complete the WHOLE remaining build roadmap EXCEPT the visual/UI redesign, all owner-gates HELD; first slice = the drafter-reliability fix, then [OWNER-GATED] clean R-A3-9 re-run → §11.2 wiring decision → A4 observability (functional, on the current design) → [OWNER-GATED] A5 integrations → Phase-6 convergence → [OWNER-GATED] deploy. Ordered roadmap + paste-ready resume prompt: HANDOFF top block; recorded decision-log 2026-06-28.** **#1 DECIDE THE 3 LABELS → ✅ DONE + CLEAN (run-independent; all DEFER; Codex-confirmed direction).** **#2 K RE-PIN / CONVERGENCE (R-A3-9) → ⚠️ INCOMPLETE (provider-degraded; K vacuous; authoritative run DEFERRED).** Ran the integrated loop LIVE (Gemini 2.5 Flash drafter ⊥ Groq `gpt-oss-120b` critics; cross-family enforced + asserted per item), **3 runs, ~$0.046 « $5 cap**; RULES §6 freshness re-anchored (gemini-2.5-flash $0.30/$2.50, shutdown 2026-10-16 noted). **LABELS (the clean win):** Strategist DEFER **by construction** (strategy/tone never reach the Drafter prompt — only the Router `instruction` does; §11.2 data-contract gap FLAGGED to owner, not fixed here) · Domain Critic DEFER (R-A3-8 policy-cap) · Router DEFER (`signals_differ=0` in BOTH runs — structurally identical to `strongReflection`; the failed first conjunct of the earn criterion alone suffices). Codex CONFIRMED all three DEFER → ledger "1 earned (Drafter) + 3 deferred". **CONVERGENCE (do NOT report "floor met"):** run #3's `test_meets_floor:true` is VACUOUS — the corrected metric (final-redraft, Codex P1) + degradation collapsed tune to 1/7 → **K=floor(0.143×9)=1**, so "1/9 ≥ 1" is empty. **Dominant finding — the live Gemini redraft is UNRELIABLE (~75%), INDEPENDENT of Groq depletion:** 12/16 redrafts failed `"No object generated: could not parse the response"` (structured-output parse failure) hitting items 1/2/3 at iter-1 while Groq was healthy — a DRAFTER problem (hypothesis: `MAX_LIVE_OUTPUT_TOKENS=2000` on the THINKING model truncates the JSON; verify `finishReason`). Separate Groq-window depletion hit the FINAL 4 test items (detection 11/16). **Safety HELD** (fallback to the clean stub; non-converging HELD not sent; `assertEligibilityUntouched` never threw). **Codex review BLOCK (1 P1 + 3 P2) → ALL reconciled primary-model-final:** P1 = `selfCorrected` `.some()` overcount → fixed to final-redraft + per-redraft/domain-mode instrumentation; P2×3 = doc honesty (domain mode, distinguish the 3 defer bases, "fresh split" wording). A Codex CONFIRMING pass on the final diff RAN → BLOCK (2 P2, no P0/P1; F1–F4 confirmed clean) → both reconciled (snapshot `_caveat`/`interpretation` + "fails-to-parse" headline) → **Codex gate DISCHARGED** (labels CONFIRMED all DEFER, both rounds). `verify` GREEN **297+5** + build; differential **20/20** UNTOUCHED. Records: `docs/a3-7-live-run-status.md` (SUPERSEDED run#1 + AUTHORITATIVE run#3 sections) + `docs/reviews/codex-2026-06-28-a3-7-live-run.md`; frozen `lib/data/agent-loop.snapshot.json` (run#3 DEGRADED DIAGNOSTIC; overwrote A2 same-family, git-preserved `7d3d8b5`; served fixture built independently by `snapshot.ts` at $0). **NEXT (SEQUENCED):** (1) a **drafter-reliability fix slice FIRST** (`MAX_LIVE_OUTPUT_TOKENS`/thinking budget + `finishReason` verify + `{{MERCHANT}}` fidelity) — its own gated slice, NOT A3-7; (2) **THEN a clean R-A3-9 re-run** on a fresh Groq window (a re-run alone reproduces the parse failures); (3) Codex confirming pass + acceptance-gate → commit (push HELD). Owner-gated stops unchanged: git push (HELD), deploy, public posting, spend > $5. *(The A3 BUILD bullet below is now historical — A3-1..A3-6 offline build + A3-7 live run are all done.)*
    27	- **▶ A3 DESIGN/PLAN PASS DONE — ACTIVE = A3 BUILD (offline-first, slice by slice).** A3 opened with a design pass, not code (Rule 0). **Owner chose "Target the full 4"** (AskUserQuestion 2026-06-26): build Strategist/Planner · Drafter · Domain Critic · Router/Conductor as four LLM agents, **each gated by an anti-theater seam-proof** (a component eval beating its deterministic counterpart — Strategist vs `diagnose().play`, Router vs `buildReflection`; fail → demote + correct the count claim, AM-2/AM-7). Drafter→**Gemini** (cross-family) while both judges stay **Groq** (restores R-ARCH-3); §4.2 prevention → the Drafter prompt (RAG off the per-merchant facts); agents **recommend-only** (`assertEligibilityUntouched`/R-LOOP-8b hold); add per-`agent` trajectory attribution; HOLD the "calibrated — directional" judge labels (not re-calibrated on live Gemini prose); re-pin K at the live gate. **Durable spec: `docs/plan-multi-agent-execution.md` §11** (EARS R-A3-1..9 + build DAG A3-0..8); decision-log 2026-06-26 ("A3 agent count = the full 4"); advisor-cross-checked. **A3-1 ✅ DONE (2026-06-27)** — trajectory `agent` attribution (R-A3-6), test-verified + fully gated: `verify` exit 0 (257+4); Codex changed-files review BLOCK → 2 findings (P1 seed-branch mislabel + P2 test gap) reconciled primary-model-final + RED-GREEN-locked; acceptance-gate 1/2/4/5 PASS + gate-3 SHIP on its pre-committed flip condition (records: `docs/reviews/{codex,gate}-2026-06-27-a3-1*.md`). Honesty rule = tool-until-earned (only the GENERATED `drafter` is an agent today; the 3 others ABSENT until they clear their seam-eval). `lib/core`+oracle+gold+snapshots UNTOUCHED (20/20). UNCOMMITTED; commit owner-gated. Recommended non-blocking obligations before any irreversible step: Codex confirming re-pass on the FIXED diff + optional formal gate re-stamp after 7:40 PM ET. **A3-2a ✅ MACHINERY DONE + RECONCILED (2026-06-28)** — Strategist agent (Groq) + its anti-theater eval, offline $0: `lib/agents/strategist.ts` (`strongRecommend` honest baseline + `allowedRoute`/`clampRouteToEnvelope` + LLM `strategistRecommend`, route-clamped/no-name-injection), `lib/agents/loop/orchestrator.ts` (`RecommendFn` async + clone-isolation + honest `modelMode`; plan-step `agent` STAYS `tool`), `evals/strategist.test.ts` (units + anti-theater eval, explicit RED-GREEN). `verify` green **277+4**; differential 20/20 UNTOUCHED. Codex changed-files review **BLOCK (4: 1 P1+2 P2+1 P3) → ALL reconciled primary-model-final + test-locked** (`groqLiveEnabled` gate-fix [also `groq-draft.ts`] + trajectory mode honesty + prompt-wiring regression-lock + recommend mutation-isolation; `docs/reviews/codex-2026-06-28-a3-2a-strategist.md`); confirming re-pass **SHIP** → Codex gate FULLY DISCHARGED; **COMMITTED `32da7b1`** (owner-authorized for this slice after codex+reconciliation, 2026-06-28). **⚠️ PUSH BLOCKED — no git remote configured (owner action to add a target).** **FLOOR-NOT-CEILING:** `caution` is a finite enum a deterministic baseline matches, so the eval is a NECESSARY anti-theater FLOOR (not label-earning); the `strategist` label DEFERS to the A3-3 cross-family judge; "4 agents" → "3 + a candidate". **A3-2b ✅ DONE (2026-06-28)** — the live $0 Groq confirmatory eval CLEARED the pre-registered anti-theater floor (Low→standard 4/4, High→elevated 4/4, all LIVE_AI, $0, stable across reps); verdict = viable candidate, `strategist` label DEFERS to A3-3, count stays "3 + a candidate" (`evals/strategist.live.test.ts` + `docs/strategist-confirmatory-status.md` + `lib/data/strategist-confirmatory.snapshot.json`; Codex methodology review BLOCK→2 reconciled + test-verified — cost-honesty "$0"→"free-tier, not metered" + RULES §6 freshness, + a stale comment; `docs/reviews/codex-2026-06-28-a3-2b-strategist-live.md`). **A3-3 ✅ DONE + FULLY GATED (2026-06-28)** — Drafter→Gemini cross-family OFFLINE machinery + §4.2 prevention: the loop's Drafter is now Gemini (`draftOutreach`), restoring R-ARCH-3 (Gemini drafts ⊥ Groq judge), **cross-family enforced by construction** (loop + A3-7 harness gate on `liveAiEnabled() && groqLiveEnabled() && resolvedJudgeProvider()==="groq"` + a per-item `judge.provider==="groq"` assert); metered drafter on a cloned cumulative $5 ledger with `UNKNOWN_USAGE` fail-closed (red-green proven); KB §4.2 `DOMAIN_HONESTY_RULES` static + off the per-merchant `facts` (R-A3-5); R-A3-8 directional-label note added. `verify` green **279+5**; differential 20/20 UNTOUCHED. Codex BLOCK (6: 2 P1+2 P2+2 P3 — incl. the cross-family-judge config hole + a vacuous live-harness ledger) → ALL reconciled primary-model-final → confirming re-pass **SHIP**; acceptance-gate BLOCK (evidence + 1 record-honesty defect) → 3 conditions discharged → **re-stamp SHIP 5/5** (`docs/reviews/{codex,gate}-2026-06-28-a3-3*.md`). Commit owner-authorized via the RESUME DIRECTIVE; **PUSH HELD** (no remote). **A3-4 ✅ BUILT + COMMITTED TEST-VERIFIED (gate-2 Codex NAMED-OPEN; 2026-06-28)** — wired the existing calibrated domain judge (`judgeDomain`) into the loop's VERIFY phase as the 2nd critic: ADVISORY (never gates the send — red-green), INDEPENDENT (no faithfulness input; withholds `diagnose().play`; R-A3-4), gatekeeper-gated, cross-family Groq enforced (incl. `resolvedDomainJudgeProvider()==="groq"` + a fail-closed throw on a forced non-fully-DI'd `live:true`). **ANTI-THEATER EVAL: the live judge TIES `mockDomainJudge` on the held-out gold (both F1 1.00) → FLOOR-not-ceiling → the `domain_critic` label DEFERS (step stays "tool", like the Strategist).** Honest ledger: **Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router pending A3-5.** `verify` 285+5; differential 20/20 UNTOUCHED. Codex round-1 BLOCK→6 reconciled; round-2 found 1 residual P1 (partial-DI) → patched (`||`→`&&` fully-injected-DI) + 3-case regression; **round-3 re-confirm SEAT-BLOCKED (~7:25 PM) = DATED OBLIGATION** → proceeding test-verified. acceptance-gate = gates 1/3/4/5 PASS, **gate-2 NAMED-OPEN** (flips SHIP 5/5 when round-3 returns); records `docs/reviews/{codex,gate}-2026-06-28-a3-4*.md`. **A3-5 ✅ BUILT + TEST-VERIFIED (gate-2 Codex NAMED-OPEN; 2026-06-28)** — the Router/Conductor agent (the 4th + final named agent): `lib/agents/router.ts` = `strongReflection` (the STRONG deterministic multi-critic baseline + demotion fallback — reads BOTH critics, prioritizes faithfulness-gating then surfaces the advisory domain dimensions; a strict SUPERSET of the domain-blind `buildReflection`) + `routerReflect` (Groq `gpt-oss-120b`, DI/mock, recommend-only — route CLAMPED via `clampRouteToEnvelope`, never trusted; honest `FAILED_TO_FALLBACK`; prompt withholds the raw merchant_name; `signals` recomputed structurally) + `criticSignals`. `lib/agents/loop/orchestrator.ts` = a `reflect?: RouterFn` seam (default = the domain-blind `defaultReflect` — **NO loop behavior change this slice**; the strong baseline/LLM wire in at A3-6) + `RevisionPlan`/`RouterFn`/`CriticSignal` types + `buildReflection` exported as the eval's RED baseline; the reflect step gets a **defensive merchant clone** and records `plan.route`/`holdForHuman` ADVISORY (recommend-only — RECORDED, never wired). `evals/router.test.ts` (8) + `evals/agent-loop.test.ts` (+2: the Router firewall + reflect-seam mutation-isolation). **ANTI-THEATER EVAL (floor-not-ceiling, like the Strategist + Domain Critic):** RED `buildReflection` (domain-blind) misses `domain_defective` on a multi-failure case → GREEN `strongReflection` (reads both) covers it as a strict SUPERSET → DEFER the mock Router ties `strongReflection` structurally → the **`router` label DEFERS** (the reflect step stays `"tool"`). **The defer is STRUCTURALLY FORCED** (advisor 2026-06-28): every offline discriminator is a finite axis a deterministic table reproduces; an LLM earns only on an open-ended-quality axis scored by a CROSS-FAMILY Gemini judge ⇒ live ⇒ A3-7. **REALIZED COUNT: all four agents BUILT; "1 earned (Drafter) + 3 deferred (Strategist · Domain Critic · Router)"** — the AM-7 anti-theater bar working as designed. `verify` 295+5; differential 20/20 UNTOUCHED; **clone red-green proven** (drop the reflect clone ⇒ the mutation-isolation test trips `R-LOOP-1b violation`; `docs/reviews/a3-5-verify-evidence.log`). Codex changed-files review **SEAT-BLOCKED (~7:25 PM) = DATED OBLIGATION batched with A3-4 round-3**; acceptance-gate = gates 1/3/4/5 PASS, **gate-2 named-open** → flips SHIP 5/5 when the batched Codex returns (`docs/reviews/{codex,gate}-2026-06-28-a3-5*.md`). UNCOMMITTED at this line; commit owner-authorized via the RESUME DIRECTIVE; push HELD. **A3-6 ✅ BUILT + TEST-VERIFIED (gate-2 Codex NAMED-OPEN; 2026-06-28) — THE TERMINAL OFFLINE SLICE; the A3-1..A3-6 offline multi-agent build is COMPLETE.** Wired the integrated multi-agent loop: the orchestrator `recommend` default = `strategistRecommend` (was `defaultRecommend`), the `reflect` default = `routerReflect` (was the interim `defaultReflect`, REMOVED as dead code) — the A3-3 Gemini-Drafter pattern (OFFLINE → strong deterministic baseline `strongRecommend`/`strongReflection` at $0; LIVE → Groq behind the A3-7 gate). `A2_HONESTY_NOTE` + the snapshot note rewritten with the honest framing — **"1 earned (Drafter) + 3 deterministic-tied components wired through the agent seams, NOT 'four agents reasoning'"**. INTEGRATION PROVEN by content (not assumed): a new test runs the loop with NO recommend/reflect injected → the plan rationale carries `risk=`/`tenure=` (strongRecommend, not the naive default) AND the reflect surfaces `no_over_promise` (strongReflection reading the domain critic; domain-blind `buildReflection` structurally cannot), at `costUsd===0`; **executed red-green captured** (revert defaults → test FAILS `/risk=/`; restore → passes). Tool-until-earned holds end-to-end (strategist/router/domain_critic ABSENT; only Drafter earns). `npm run verify` 296+5 + **test:e2e 4 passed** (`verify:full` green); differential 20/20 UNTOUCHED; no import cycle. acceptance-gate = gates 1/3/4/5 PASS (no independent P0/P1; honesty crux holds — zero `app/` overclaim), gate-2 NAMED-OPEN (Codex seat-blocked, **batched as the 3rd of three**: A3-4 round-3 + A3-5 + A3-6) → flips SHIP 5/5 when the batched Codex returns (`docs/reviews/{codex,gate}-2026-06-28-a3-6*.md` + `a3-6-verify-evidence.log`). **REALIZED EARNED-AGENT LEDGER (all four agents BUILT + integrated): Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router DEFERRED = "1 earned (generation) + 3 deferred (classify/decide)".** UNCOMMITTED at this line; commit owner-authorized via the RESUME DIRECTIVE + the `/autopilot` directive; push HELD. **NEXT = A3-7 — OWNER-GATED (the ONLY place the 3 deferred labels are decidable): the live cross-family Gemini run (key + $5 cap + a live Gemini model-id/pricing freshness check per RULES §6 + a Codex cross-check; re-pin K on a fresh held-out split, R-A3-9). Autopilot STOPS here — A3-7 is live spend, owner-gated.** **✅ BATCHED CODEX GATE DISCHARGED (2026-06-28, seat reset ~7:30 PM): the batched review returned A3-4 SHIP / A3-5 SHIP+1 P2 / A3-6 BLOCK+1 P1+1 P3 → ALL reconciled primary-model-final + RED-GREEN (the P1 = the cross-family `fullyInjectedDI` hole the A3-6 wiring re-opened; the P2 = a Router-prompt overclaim, fixed with the `{{MERCHANT}}` injection-cut; P3 = stale comments) → two confirming re-passes → final VERDICT SHIP. The A3-4/A3-5/A3-6 acceptance-gates are SHIP 5/5; the A3-1..A3-6 OFFLINE BUILD IS FULLY GATED. `verify` green 297+5 + build; differential 20/20 UNTOUCHED. Records: `docs/reviews/codex-2026-06-28-a3-batch-confirm.md` + `a3-batch-reconcile-evidence.log`. Committed (owner-authorized via the RESUME DIRECTIVE); push HELD. ▶ NEXT = A3-7 — OWNER-GATED live spend (flip `ENABLE_LIVE_AI=true` + $5 cap + a live Gemini freshness check per RULES §6 + a Codex cross-check; re-pin K, R-A3-9; the ONLY place the 3 deferred labels are decidable). Surface to the owner; do NOT start autonomously.**
    28	- **▶ B2 COMPLETE (2026-06-26) — domain judge wired into the REPLAY ship-gate as the tertiary ADVISORY control; the mandatory Codex changed-files review + §4.2 cross-check RAN on the reset seat → VERDICT SHIP; the B2 ship-gate is FULLY DISCHARGED; COMMITTED `6ea0549` + reconciliation fixes on top.** `ReplayMerchant.domainJudge` (mock, `$0`, gated on `gatekeeper.approvedForHumanReview` — parallel to faithfulness) + `"domain"` audit actor (after `judge`, before `eval`) + a Merchant-Detail "5 · Domain quality check" panel (Eval→6/Human→7/Audit→8). **ADVISORY invariant red-green PROVEN** (mutation → `replay.test.ts:79` RED, restore GREEN); **§4.2 non-redundancy DEMONSTRATED** (gatekeeper APPROVES + faithfulness PASSES + only `no_over_promise` FAILS on implied-typicality hype). `verify` green **255 + 4 skipped**; differential **20/20** (`lib/core`+oracle+gold+frozen snapshot UNTOUCHED); e2e 4/4. acceptance-gate = BLOCK (procedural, no hard P0/P1) → gate-3 cleared + non-blocking items fixed; **gate-2 Codex OPEN** (ran, 1 finding fixed primary-model-final — the "never auto-sent" copy contradiction — then seat-limited). **Until Codex completes the acceptance-gate stays BLOCK by design; a commit = proceeding test-verified with that gate named-open.** Gate record: `docs/reviews/gate-2026-06-26-b2-domain-shipgate.md`. **Codex gate CLEARED (SHIP; all 4 targets CONFIRMED — incl. §4.2 non-redundancy verified against the REAL gatekeeper + faithfulness code; 3 findings, 1 P2 + 2 P3, all accepted + fixed + re-verified primary-model-final; record `docs/reviews/codex-2026-06-26-b2-domain-shipgate.md`). ▶ ACTIVE = A3 (the 4 bounded agents — see HANDOFF top block).**
    29	- **▶ A2 GO ✅ (2026-06-26):** the early go/no-go is CLEARED — the single-agent verify-and-self-correct loop SHIPs (8/9 genuine self-corrections, $0, 1 miss held-not-sent; recommend-not-decide + fail-closed **red-green proven**; 5 ship gates discharged incl. durable Codex + grill records in `docs/reviews/`). **Owner directed GO + "rest other phases"** → AM-6 cap lifted; **committed scope = the full roadmap**. **B0 ✅ (`2cc4a2d`) · B1 OFFLINE MACHINERY ✅ + green + acceptance-gate SHIP (`db72461`→`e201eee`; Codex review folded into the now-DONE B1 Codex gate; `docs/reviews/gate-2026-06-26-b1-offline.md`). B1d LIVE calibration ✅ CLEARED all seven pre-registered thresholds (held-out recall/precision/F1 1.00 · κ 1.00 · flip 0.00; leak-verified R-DARCH-2; eval-locked `1fcb492`; `docs/domain-calibration-status.md`). **Codex cross-model gate ✅ DONE** (gpt-5.5 @ xhigh, full B1 diff `07e9a55..HEAD` → 2 P2 *code* findings — partial-verdict acceptance + wrong env namespace — both fixed + reconciled primary-model-final + test-locked; 0 P0/P1; calibration result provably unchanged; `docs/reviews/codex-2026-06-26-b1-domain-judge.md`); `verify` green **250 + 4**. **NEXT: B2** (wire the domain judge into the ship gate as the tertiary control; **§4.2 DECIDED 2026-06-26 — keep `no_over_promise` gating + feed KB §4.2 into the A3 Drafter = defense in depth**) → **A3** (4 agents + Gemini Flash ≤$5 + cross-family judge) → **A4** (observability/trajectory view).** Now **"calibrated — directional, pending the ~100 floor"** (methodology calibrated via the cleared bar + eval-lock + acceptance-gate + leak-check + the Codex gate, R-DHON-3; metric stays directional until the ~100 floor, R-DHON-1). Committed 2026-06-26 (owner GO via "continue"); push remains owner-gated. A5 (live integrations) + Phase 6 (deploy) + public posting + spend-over-$5 stay **owner-gated**. Build continuation is manual (owner resumes each session; the auto-resume launcher was removed at owner request 2026-06-26 — it was never installed). Full detail: HANDOFF (top block).
    30	- **▶ EXECUTION STATUS (2026-06-25, autopilot):** Phase 0 cleared + committed; the A2-scoped `/goal` is driving — **P3 ✅ (`dafb653`) · A1 ✅ (`f521b5c`) · A2 offline machinery ✅ (`5a1f86a`)**, all `npm run verify`-green (215+3 skipped) + self-reviewed; `lib/core`+oracle+gold UNTOUCHED. **Codex seat usage-limited (~7:49 PM reset)** → A1/A2 proceed **test-verified**; the A1 + A2 Codex reviews + the framework cross-check are **DATED OBLIGATIONS** before the A2 GO/NO-GO (decision-log 2026-06-25). Stack rule relaxed to **best-fit, cost-aware** (`e260c15`). **REMAINING = the A2 GO/NO-GO batch** (live R-LOOP-10 $0/P3-unblocked + set K · `verify:full` e2e · the seat-blocked Codex batch · `acceptance-gate` · then the **owner A2 GO/NO-GO**) — see **HANDOFF → NEXT**. Then STOP (A3/A4/A5/deploy stay owner-gated).
    31	- **Phase 0 status (Decide & gate — pivot-checkpoint):** owner-approved pivot to a **bounded, HITL, eval-gated MULTI-AGENT verify-and-self-correct system**. The **mandatory cross-model gate RAN → BLOCK (9 findings) → ALL reconciled** primary-model-final (`docs/reviews/codex-2026-06-25-multiagent-pivot.md`); **ADR-002** (`docs/decisions/ADR-002-multi-agent-architecture.md`) + **3 decision-log reversals** + **binding spec amendments** (`docs/plan-multi-agent-execution.md` §0 AM-1..AM-8 + R-LOOP-1b/8b) authored; **confirming Codex pass CONFIRMED — Phase 0 gate CLEARED** (2 rounds). **Binding build preconditions:** P3 judge calibration must clear the held-out bar **before** A2's live milestone (Codex #1); the agent **recommends only** — eligibility/send stay deterministic + test-locked (Codex #6). **Committed near-term scope = P3-calibration + A1 + A2**; A3/A4/A5/Track B = roadmap, re-decided at the A2 go/no-go. **NEXT (owner actions only): commit the Phase-0 docs (explicit paths) + toggle `/autopilot` with an A2-scoped `/goal` → A1.** Canonical: brief `~/.claude/plans/read-last-handoff-and-snappy-ripple.md` + spec `docs/plan-multi-agent-execution.md`. **The REBUILD detail below is now the TOOL layer the agents call** (deterministic core · gatekeeper · semantic judge · eval harness · hybrid data · REPLAY — all promoted, intact).
    32	- **Task name (REBUILD — now the agents' tool layer):** Rebuild ActivationOps AI into a real, industry-adoptable, **deployed desktop AI product** for stalled/long-tail **merchant activation** on a local-commerce delivery marketplace — single-stack **Next.js + TypeScript + Tailwind + React on Vercel (free tier)**, **porting** the proven deterministic core, integrating **real bounded Gemini** (eval-gated · claims-gatekeeper · <$5), on **hybrid data** (real open-source entities + synthetic activation overlay). **Canonical goal · DoD · phases · blindspots: `~/.claude/plans/gentle-forging-starlight.md`** (+ decision-log 2026-06-19 row).
    33	- **JUDGE BUILD PROGRESS (2026-06-22):** **P0 DONE** (spec `docs/spec-semantic-judge.md`; commit `b01a5a6`) → **P1 DONE + GREEN** (offline judge: `lib/agents/{claimable-fields,semantic-judge}.ts` + mock + DI-live + the Merchant-Detail "Faithfulness check" panel, SECONDARY control after the gatekeeper) → **P2 DONE + GREEN** (calibration core, offline/$0): `lib/evals/judge-metrics.ts` (pure precision/recall/F1 + Wilson recall CI + Cohen's κ + test-retest flip-rate; headline = recall on the gatekeeper-PASSING subset, R-CAL-1), `evals/gold/semantic-judge-gold.ts` (stratified gold set as typed TS literals — **30 items**: 16 planted judge-territory positives across 4 failure modes (≥3 each, 9 held-out) that survive the guardrail + 2 gate-caught positives + 12 clean negatives incl. 2 real-supply; objective field-entailment labels + critiques incl. supported few-shot exemplars; tune/test split), `evals/gold/harness.ts` (reusable gold→gatekeeper→JudgeFn wiring, reused by P3's live judge), `evals/judge-calibration.test.ts` (16 tests; metric math vs hand-computed matrices; **R-CAL-1 enforced LIVE** against the real `runGatekeeper`; mock = labeled STUB BASELINE, not gated). **192 tests + 1 skipped green; typecheck/lint/build green; `lib/core` + differential UNTOUCHED.** All gold positives SYNTHETIC + labeled (R-CAL-4: the 6 recorded live drafts are well-grounded). **Judge model (owner): CROSS-FAMILY Groq `openai/gpt-oss-120b` (strict JSON, free), provider-agnostic boundary** — freshness-verified current 2026-06-22. **P3 INFRASTRUCTURE DONE + LIVE JUDGE WIRED + PROVEN** (owner provided `GROQ_API_KEY`): installed `@ai-sdk/groq@2.0.42`, wired the live Groq `openai/gpt-oss-120b` judge (strict `structuredOutputs` + `reasoningEffort:"low"`) in `lib/agents/semantic-judge.ts`; built the key-gated calibration runner `evals/judge-calibration.live.test.ts`. A live run PROVED the capability (strong recall; precision dragged by the judge flagging the platform's own name → root-caused + prompt-fixed via `platformName` grounding; reasoning-low validated to still discriminate). **REAL LIMIT (read verbatim from the 429, not inferred): Groq free tier = 200K tokens/DAY, exhausted today by 5 debugging runs** — with `reasoningEffort:"low"` a full run needs ~30K, feasible on a fresh window. **REMAINING P3 = one clean calibration run on a fresh Groq daily window** → held-out metrics → **P4** (eval-lock + the 3 demo surfaces + Codex gate + flip docs ONLY if metrics clear the bar, R-HON-3). No "calibrated, metrics=X" claim until then; pre-fix numbers NOT enshrined. Full status: `docs/judge-calibration-status.md`. Then the QUEUED UI redesign + owner-gated T13 deploy. (Offline suite green: 192 + 2 skipped; both live tests auto-skip.) Full plan: `docs/plan-semantic-judge-and-deepening.md`; spec: `docs/spec-semantic-judge.md`.
    34	- **Current stage:** **🔒 GOAL LOCKED (2026-06-22, owner): portfolio/capability SHOWCASE — but "portfolio" ≠ shallow; build a REAL capability, kept COMPANY-AGNOSTIC. Differentiation = VERIFICATION RIGOR (deterministic-first per-claim faithfulness vs the structured source-of-truth, the seam incumbents leave open). Honesty reframe binding ("verify claims vs source of truth", not "no one automates this"). Grounding: `docs/research/market-validation-2026-06-22.md` + decision-log 2026-06-22.** **NEXT BUILD = the calibrated semantic LLM-judge** (owner 2026-06-22: "deepen the AI now + roadmap production", build in a fresh session) — canonical spec: **`docs/plan-semantic-judge-and-deepening.md`** (research-grounded + committed; reference-grounded per-claim entailment judge on `gemini-2.5-flash-lite`, SECONDARY control after the deterministic gatekeeper, calibrated on a labeled gold set, eval-locked; live calibration is owner-gated on the key + <$5; Codex gate before ship). The **UI REDESIGN** + the **owner-gated T13 deploy** are QUEUED after. (Prior UI-redesign context retained below.) **UI REDESIGN — paused for a fresh session.** The product is DONE / green / deploy-ready (live Gemini run + a 3-audit sweep [Codex · security · evals] + a pre-deploy grill + a 2026-06-22 doctrine alignment-audit [project-advisor · guidelines-monitor · acceptance-gate] with all gate-blocking + important findings fixed across 6 committed slices (incl. a fresh Codex BLOCK reconciled — the gatekeeper now enforces no-leakage) — all reconciled; public demo FICTIONALIZED; 161 tests + 3 e2e green). **ACTIVE TASK:** the owner finds the console "dull/generic" and wants a modern, professional, ELEGANT, white-bg product site with a STORYTELLING walkthrough arc + motion + custom SVGs (anti-slop). **5 design-direction SAMPLES are built (`mockups/{editorial,saas,swiss,technical,premium}.html`; shots in `mockups/shots/`; served at :8080), AWAITING the owner's PICK → then FINALIZE the chosen design language into the Next.js app (every surface + a storytelling landing) → owner-gated T13 deploy.** Full detail + paste-ready resume prompt: **HANDOFF** + **PROJECT_STATE**. (Details + the live-run checklist + resume prompt: HANDOFF. Earlier-this-session slice/gate history retained below.) Built since the slice: Phase B domain depth (`lib/domain/diagnosis.ts`), Phase C console (Eval/Quality · Metrics · Audit · Cost + nav), live-path hardening (injection cut + cumulative budget ledger), Phase D docs (`docs/WHY.md` why-chain + today-vs-target README). `typecheck/lint/test/build` GREEN (50 tests; all routes prerender). Remaining: **T12 live run (owner key + <$5) · T13 deploy + platform-name (owner) · T10 full Playwright (deferred — build render-smokes pages) · T11 doc polish (optional)**. Original slice-stage line:** Build session 2 (2026-06-19) delivered the full walking skeleton (one merchant → end-to-end), all add-alongside (`lib/core/*` + golden differential lane untouched): hybrid dataset (real DataSF SF entities + deterministic synthetic overlay; adapter/sanitizer/guards in `lib/ingest/`; frozen `lib/data/sf-entities.snapshot.json`, PII-scrubbed; NAICS sector-level → Restaurant/Retail crosswalk) → bounded Gemini draft (mock/live/FAILED_TO_FALLBACK + $5 fail-closed budget + pinned pricing + env-flags; `lib/agents/`) → claims-gatekeeper → draft-quality eval (corrupted-record teeth; `lib/evals/`) → REPLAY orchestrator (`lib/replay/`, $0 ledger) → Overview + Merchant Detail surfaces (`app/`, de-branded "Curbside Commons"). **`npm run typecheck/lint/test/build` all GREEN — 43 tests (differential byte-identical), 23 pages prerendered (20 SSG merchant pages).** **Codex review DONE (BLOCK → reconciled; all fixable findings fixed, 43 green; deferred = Phase-B injection + owner personal-name deploy-gate).** Slice **uncommitted** (intent-to-added for the Codex diff). **Next (owner-gated):** owner GO on commit(s) → owner decision on personal-name-DBA handling (gates public deploy) → owner GO on Vercel deploy. See HANDOFF for the paste-ready resume prompt + the Phase-B binding items.
    35	- **Mode / risk / effort:** **FULL** · high risk (scope · architecture · public claims · data sourcing) · **Effort: MAX, auto-routed** (ship-gating/architecture).
    36	- **Build order (each slice shippable + gated):** **thin vertical slice FIRST** (one merchant end-to-end → deployed REPLAY) → **A** faithful TS port (differential test: TS deterministic == Python golden) → **B** eval-gated real Gemini + domain depth + hybrid data + adapter → **C** desktop console (Overview · Activation Queue · Merchant Detail · Drafted Outreach+Approval · Eval/Quality · Metrics/Impact · Audit Trail · Cost ledger; *evaluate `DesignSync`/`claude-design` as a UI accelerator*) → **D** deploy + adoption path + why-chain docs.
    37	- **Gates (per slice):** typecheck/lint/test (Vitest) + differential test + eval + (Phase C+) Playwright/a11y (WCAG AA, settled DOM); **every Blindspots-section mitigation in the plan is binding**; Codex changed-files review via `~/claude-os/bin/codex-guarded` (namespaced output).
    38	- **Owner-gated stops (do NOT bypass):** commits/pushes (RULES §12) · dataset-source check-in (if a richer real/live free source is viable) · platform-name confirm ("Curbside Commons", 2-min trademark/web check) · public posting · anything irreversible/external.
    39	- **First build steps:** (1) **dataset Source-Intake** (license/PII/quality/freshness; safe default = synthetic-primary with real open-source entities layered in so nothing blocks); (2) scaffold Next.js/TS; (3) the thin vertical slice.
    40	- **Out of scope (post-DoD optional):** live-public LLM, agentic orchestration, live Slack/Resend sends, persistence/observability, multi-tenancy, mobile/responsive.
    41	- **Commit status:** build session 1 (scaffold + core port + state-sync) is **committed** (`4de4503`/`3182bfa`/`f004d19`). Build session 2 (the thin vertical slice: `lib/ingest/`, `lib/agents/`, `lib/evals/draft-quality.ts`, `lib/replay/`, `lib/server/env-flags.ts`, `lib/product.ts`, `lib/data/{sf-entities.snapshot.json,PROVENANCE.md}`, `app/page.tsx`, `app/merchant/[id]/page.tsx`, `evals/*.test.ts`, `scripts-ts/build-hybrid-snapshot.mjs`) is **uncommitted**, intent-to-added (`git add -N`) for the Codex diff. Commits + Vercel deploy await owner approval (RULES §12) — surfaced in HANDOFF.
    42	
    43	## Carried forward (unchanged by the pivot)
    44	Merchant-activation use case · deterministic-first → bounded-LLM · eval-first · free-first (Gemini sole paid, <$5) · prototype-not-service (deploy = transient demonstration) · honesty (simulated labels, no real merchant data/access). The Python prototype is kept (tag `v1-python-prototype`, move to `reference/`) as lineage + the **differential-test oracle**; 35/35 tests + eval 20/20|45/45 remain the v1 proof.
    45	
    46	## Reference
    47	Approved plan (canonical): `~/.claude/plans/gentle-forging-starlight.md`. Superseded as the active plan: `docs/phase3-prep-slice-plan.md`, `PLAN.md` (their S1/S2/S3/S5 specs fold into Phases A–B). Patterns: resilix `/Users/sharan_98/Desktop/supply-chain-ai-resilix/` (design tokens · gatekeeper · Gemini wiring + cost ledger · hybrid data · `enterprise_readiness`); procureguard-ai = deploy/demo shape.
    48	
    49	### Prior task — T-003 (superseded by the rebuild)
    50	T-003 plan was Codex-approved (Act 2, 2026-06-12) but is **superseded** as the active plan by the 2026-06-19 rebuild; its hardening specs (de-brand, draft contract, hybrid lane, hooks) fold into Phases A–B. T-002 remained merged (`a95c0f1`); the Python core + tests are kept as the reference oracle.

exec
/bin/zsh -lc 'nl -ba HANDOFF.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc 'nl -ba docs/task-log.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	# HANDOFF.md
     2	
     3	Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.
     4	
     5	## Latest handoff
     6	
     7	> **▶▶ AGENTIC EXTENSION DIRECTED + RESEARCHED — NEXT = PLAN STAGE (2026-07-06, fourteenth session FINAL WRAP — READ THIS BLOCK FIRST; SUPERSEDES everything below).** The owner extended the program in-session (three directives, decision-log 2026-07-06 ×3): the project is a **PERSONAL DEMONSTRATION project** whose goal is to showcase **applied-AI / agentic-systems / AI-automation proficiency** — the lane companies hire for (target roles on record: AI Engineer · AI Specialist · Applied AI Engineer · AI Automation Specialist; boundary: NOT model development/training, NOT no-code-only ease; floor tools, not ceiling: Claude Code/Codex · n8n · MCP · Zapier-class). **LIVE research digest committed:** `docs/research/agentic-extension-research-2026-07.md` (2026-07-06, cited: AI Engineer = fastest-growing US title, agentic postings +280% YoY; Anthropic official agent guidance = workflows-vs-agents, agents-over-verified-tools; MCP = Linux-Foundation industry standard adopted by OpenAI/Google/Microsoft; n8n $2.5B "deterministic backbone + agents at intelligence points" pattern; eval literacy = the #1 hiring signal — our strongest existing card). **The proposed shape (owner-seen, not yet plan-gated): four proficiency surfaces on the already-gated engine — ① agent crew (Intake → Audit → Evidence → Reviewer agents driving the verifier/fee engine as TOOLS) · ② MCP server exposing check_feed/audit_statement/get_rule · ③ Slack + email delivery lanes (OFFLINE-FIRST per RULES §3; live = owner-gated transient demos) · ④ n8n self-hosted workflow lane (the AI-automation surface).** Also this session: GitHub publish EXECUTED (repo LIVE PRIVATE at `github.com/sharanlabs/commerce-truth-audit`; public flip = the owner's own act, one command in PROJECT_STATE; author-email exposure ruling recorded) · the last internal backlog CLOSED (`9ef2d87`: M2 gate-4 advisory nits red-green, verify **749+6** exit 0, Codex changed-files CLEAN; ledger statuses synced; S-11 alternates live-screened — Plumbline cleanest, Parallax/Trig dead). Seat events: research subagent died on the seat limit (raw verbatim in the digest provenance) → inline conversion (NO-WAIT); harness advisor() down 14th consecutive session; frontier-advisor consult succeeded (publish boundary).
     8	>
     9	> **▶▶ RESUME DIRECTIVE (2026-07-06 wrap — for ANY account):** on a bare `resume`, run the Mandatory Startup Contract, then EXECUTE THE PLAN-STAGE PROMPT BELOW — do not re-ask the settled direction, do not start building. The plan stage produces the declarative plan + Codex cross-check, then **STOPS for the owner GO before any build**. Hard stops unchanged: live spend arming (Groq/Gemini) · deploy (design-first) · public flip (owner's own act) · name adoption (S-11) · any classifier retry (new pre-registration + explicit word). Pushes of authorized commits to the PRIVATE origin are routine.
    10	>
    11	> ### ▶ Paste-ready resume prompt — AGENTIC EXTENSION, PLAN STAGE (fresh session, any account; auto-fires on a bare `resume`)
    12	>
    13	> ```
    14	> Resume Commerce Truth Audit — AGENTIC EXTENSION, PLAN STAGE (owner-directed 2026-07-06, decision-log ×4; research digest docs/research/agentic-extension-research-2026-07.md; repo live PRIVATE at github.com/sharanlabs/commerce-truth-audit; verify green 749+6; internal backlog zero). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort).
    15	>
    16	> GOAL (fixed by the owner — plan against it, do not reopen): a PERSONAL DEMONSTRATION project showcasing applied-AI/agentic/AI-automation proficiency for AI-Engineer-class roles. Shape: the four surfaces over the existing gated engine as tools — agent crew (Intake/Audit/Evidence/Reviewer; Anthropic workflows-vs-agents guidance as design rationale) · MCP server (check_feed/audit_statement/get_rule) · Slack+email delivery (offline-first, RULES §3 safety controls; live runs owner-gated transient demos) · n8n self-hosted workflow lane. Constraints carried: agents recommend / the engine decides; honesty+simulated labels; anti-theater eval floors for any label claim; Groq $0 + Gemini ≤$5 cap; prototype-not-service; desktop web only.
    17	>
    18	> ROUTE + JUDGE (doctrine 2026-07-03): FABLE seat = orchestrator/FINAL JUDGE; try harness advisor() first (down 14 straight sessions) then frontier-advisor at commitment boundaries; implementer lane for delegated build slices later; Codex = adversarial input, reconciled primary-model-final. Seat-limit deaths: raw verbatim; one owner-confirmed retry; then NO-WAIT inline.
    19	>
    20	> PLAN STAGE OUTPUT: a declarative plan doc (success criteria + acceptance tests + slice DAG + per-surface eval/honesty gates + free-tier freshness checks with dates) extending docs/plan-truth-audit-execution.md conventions → ONE Codex cross-check via ~/claude-os/bin/codex-guarded (read-only; smoke-test the seat first; raw errors verbatim) → reconcile primary-model-final → sync state docs → STOP and surface the plan for the OWNER GO. NO build, NO live integration, NO spend before that GO.
    21	> ```
    22	>
    23	> *(The block below is the earlier fourteenth-session handoff — superseded by the block above.)*
    24	>
    25	> **▶▶ GITHUB PUBLISH EXECUTED — THE REPO IS LIVE PRIVATE AT `github.com/sharanlabs/commerce-truth-audit`; THE PUBLIC FLIP IS HELD BY OWNER RULING (2026-07-06, fourteenth session — SUPERSEDED by the wrap block above).** Owner word (verbatim): "resume except design, github publish complete all other steps." Executed: authorization + intent capture committed PRE-push (`8f81b9e`, per the advisor constraint — last session's push was denied for lack of recorded authorization) → `gh repo create commerce-truth-audit --private --source=. --remote=origin --push` succeeded (main tracking origin; About description set) → the advisor-mandated **identifier-exposure sweep** ran before any flip (the prior sanitization audit scoped secrets, NOT privacy identifiers): tracked tree clean except `/Users/sharan_98` paths inside internal review transcripts (covered by the ratified internal-docs-as-is default); no handles/emails/secrets/workflows tracked; `.env` never tracked; **the git author email `sharank98@gmail.com` is on all 144 commits** → surfaced to the owner at the flip decision → **owner ruled "Stay private for now."** The four Pub defaults (interim name "Commerce Truth Audit" · Apache-2.0 · private-then-flip · internal-docs-as-is) are RATIFIED by the directive; the classifier retry is NOT armed by it; S-11 stays open; design/deploy stay excluded. No product code changed; verify baseline unchanged (**743+6** at `4489ad9`); frontier-advisor consult PROCEED-WITH-CONSTRAINTS (all adopted); advisor() down 14th consecutive session.
    26	>
    27	> **▶▶ SECOND DIRECTIVE EXECUTED same session ("right now i am going to publish and we can we update it later. so complete all other steps now except github, design everyother aspect."):** the last internal backlog is CLOSED at `9ef2d87` (pushed to the private origin) — the three M2 gate-4 advisory nits fixed red-green (`claimIdPart` claim-id escape [byte-identity on all committed values, goldens byte-frozen] · shared loud `makeLineTagger` [silent "Lundefined" → throw] · stale verdict comment), **verify 749+6 exit 0**, Codex changed-files review **CLEAN** (+1 P3 accepted-fixed, raw on record); suggestions-ledger statuses synced to reality (S-2/S-4/S-5/S-9); **S-11 alternates screened LIVE 2026-07-06** — Plumbline cleanest > Kilter; Tare risky; Parallax/Trig/Assay dead; trademark + domain checks still owed before any adoption. The classifier retry stays UNARMED (a generic sweep is not the arming word — precedent ×3). **The internal backlog is ZERO — every open item below is an owner-only act.** The owner said they will do the GitHub publish (public flip) themselves.
    28	>
    29	> **▶▶ RESUME DIRECTIVE (2026-07-06, fourteenth session):** on a bare `resume`, run the Mandatory Startup Contract, report that **the plan is COMPLETE, the repo is LIVE PRIVATE at `9ef2d87`+, and the internal backlog is ZERO — nothing is queued**, list the owner acts below, and STOP. **OWNER ACTS (each needs your word):** ① **flip PUBLIC** — one command from anywhere: `gh repo edit sharanlabs/commerce-truth-audit --visibility public --accept-visibility-change-consequences` (timing anchor: NYC DCWP fee-cap recordkeeping hearing, July 16, 2026; ⚠ the flip permanently publishes the git author email `sharank98@gmail.com` on all commits — if you want it scrubbed, the history rewrite must happen BEFORE the flip and will change every commit SHA, so the gate/review records need a SHA-mapping note; a GitHub noreply email can be configured for FUTURE commits regardless: `git config user.email "<id>+sharanlabs@users.noreply.github.com"`); ② **S-11 brand pick** ("Assay" collided on the 2026-07-06 live screen; repo rename later = `gh repo rename`); ③ **design fix → deploy** (excluded by your word, sequenced design-first per the 2026-07-03 ruling); ④ **classifier retry** only via a NEW committed pre-registration + explicit arming word. Hard stops unchanged: public flip · deploy · name adoption · new live arming. Pushes to the PRIVATE origin are now routine for authorized commits (remote exists; publish authorized 2026-07-06).
    30	>
    31	> *(The block below is the prior session's handoff — superseded by the block above.)*
    32	>
    33	> **▶▶ PUB EXECUTED — THE PLAN IS COMPLETE; THE REPO IS PUBLICATION-READY AND PUSHED PRIVATE; ONLY OWNER ACTS REMAIN (2026-07-06, thirteenth session — SUPERSEDED by the fourteenth-session block above).** The owner armed the slice ("except design complete all other tasks. resume") — design + deploy EXCLUDED by that word; the classifier retry EXCLUDED (not a task; needs a NEW pre-registration + explicit word). **Executed:** README fully REPLACED to front the truth-audit program (advisor-ruled full replace; legacy = one lineage section, archived runnable) · `docs/PUBLICATION.md` postable writeup · `docs/demo-recording.md` (byte-identical live-run transcript) · **LICENSE Apache-2.0 + NOTICE** (O6 CLOSED; C9 test consciously updated red-green) · C10 honesty gate EXTENDED over the new public prose (it BIT ITS AUTHOR live on a quoted banned literal — gate kept, prose reworded) · product surface renamed "ActivationOps AI"→**"Commerce Truth Audit"** (descriptive interim — NOT a brand adoption; S-11 stays open; live screen: "Assay" COLLIDED with assay.tools + squatted npm) with a sanctioned banner-only golden regen (byte-verified) · legacy CSV relocated (+ the python `scripts/config.py` regression it exposed, fixed, 35 py-tests green) · **source-lockfile relocked for Pub** (L4/L6/L8 + new L12–L15 LOCKED live 2026-07-06; the Juniper claim DROPPED rather than published on secondary sourcing; used-facts audit = zero PENDING-RELOCK among used facts) · **publication-sanitization audit CLEAN** (141 commits; .env never committed; zero secret patterns in any historical blob; UCP Apache-2.0 + provenance; DataSF PDDL-1.0/fictional). **Gates: Codex chain SHIP** (batch BLOCK 2P1+2P2+1P3 @medium [effort deviation recorded] → confirming xhigh BLOCK 2P1+1P3 → narrow BLOCK → micro BLOCK → closing **SHIP**; 5 raws + summary `docs/reviews/codex-2026-07-06-pub-slice{,-*raw}.md`; deepest catch = the repo's own source-lock rule; P2-2's fix reviewer-corrected to RFC-2606 `.example`) · **acceptance-gate SHIP** (route-back NONE; condition = live verify handoff, DISCHARGED with raw tails: verify exit 0 **743+6** · legacy **306+5** · python **35**; record `docs/reviews/gate-2026-07-06-pub-slice.md`; advisory 1 folded same-session). Evidence: `docs/reviews/pub-verify-evidence.log` (RG ×3 + 3 addenda). Research subagents died TWICE on seat limits (raws recorded) → NO-WAIT inline conversion (deviation on decision-log). **Committed (`4489ad9`). The private-repo push was DENIED by the harness permission layer (no recorded owner authorization — the bundled ask had timed out); honestly returned to the owner as a one-command act from the repo root: `gh repo create commerce-truth-audit --private --source=. --remote=origin --push`.**
    34	>
    35	> **▶▶ RESUME DIRECTIVE (2026-07-06):** on a bare `resume`, run the Mandatory Startup Contract, report that **the plan §5 roadmap is COMPLETE — every slice shipped and gated; NOTHING is queued**, list the open OWNER ACTS below, and STOP. **OWNER ACTS (each needs your word):** ① **flip the private repo PUBLIC** (one click — the timing anchor is the NYC DCWP fee-cap recordkeeping hearing, July 2026; skim `docs/reviews/` first — gate advisory 2); ② **ratify (or override) the four defaults-taken** (decision-log 2026-07-06: interim name "Commerce Truth Audit" · Apache-2.0 · private-then-flip · internal-docs-as-is); ③ brand-name pick (S-11 open; "Assay" collided); ④ design fix → deploy (excluded from this slice by your word); ⑤ any classifier retry = NEW pre-registration + explicit arming. Hard stops unchanged: public flip · deploy · name adoption · new live arming.
    36	>
    37	> *(The block below is the prior session's handoff — superseded by the block above.)*
    38	>
    39	> **▶▶ THE FOUR OWNER DECISIONS EXECUTED — THE LIVE CLASSIFIER RAN AND ITS LABEL DEFERS; NEXT = Pub (OWNER-GATED) OR NOTHING (2026-07-05, twelfth session — SUPERSEDED by the thirteenth-session block above).** The owner answered the four surfaced decisions with "all four" (decision-log 2026-07-05): **① the live classifier calibration run was armed and EXECUTED.** The lane was wired first (`lib/agents/fee-classifier.ts`: leak-free ClassifierInput-only prompt + static §20-563.3(d) rubric · schema-checked 5-label output · FAILED_TO_FALLBACK · env-gated · Groq-only $0, no paid branch; `wired→true`; the fees pack's zero-network proofs intact), then the pre-registered run ran. **Run #1 (incident, honest record): all 84 calls completed, then every result was LOST to a `writeFileSync` ENOENT (`lib/data/` moved at W0) before any metric printed — outcome-blind, so the recovery re-run was legitimate; the harness now probe-writes its output path BEFORE spending and freezes BEFORE asserting. Run #2 (AUTHORITATIVE, degraded=false, zero fallbacks): held-out 20/21 = 0.952 — strictly beating the pinned 19/21 baseline — macro precision 0.971, macro κ 0.944, flip-rate 0.000, but `enhanced_service_fee` recall 3/4 = 0.75 missed its pre-registered ≥0.80 floor → per the conjunctive rule THE LABEL DEFERS.** No re-run, no floor change; the held-out split is exposed and may not be re-scored; any future attempt = a NEW owner-gated arming with its own (COMMITTED-first — lesson routed) pre-registration. The one miss is on record verbatim (relabel-test-2, unanimous ×3). Frozen: `lib/data/fee-classifier-calibration.snapshot.json` + the eval-lock test (verdict-tamper red-green durable); narrative: `docs/fee-classifier-calibration-status.md` (pre-registration + incident + results + provenance addendum — floors committed pre-run at `bda6314`/`550e3cb`, the no-rerun rule at `c73c100`, the working-tree-only conventions provably outcome-invariant). **② Gemini demo color: DECLINED, call closed. ③ cargo/Rust: INSTALLED → C5 MEASURED = 33/35 agree + 2 documented LST-CONF-FORMAT divergences (the JSON Schema 2020-12 format-assertion fork; one-class-one-direction encoding, anything else fails) + 0 disagreements, exit 0, clean-PATH reproducible. ④ corpus license: DEFERRED to the Pub gate.** Gates: **Codex cross-model DISCHARGED (SHIP)** — batch BLOCK 1P1+2P2+1P3 → all reconciled red-green (the P1 was real: `~/.cargo/bin` off the default PATH made the oracle skip-as-success in fresh shells — proven red-green in Codex's own sandbox) → confirming pass → final narrow confirm SHIP **with its raw on the record** (the acceptance-gate refused the first, unrecorded narrow confirm — correctly); **independent acceptance-gate: BLOCK narrow (evidence-completeness only; it recomputed the metrics itself — κ to 12 decimals — and called the substance sound + the DEFER honest on every surface) → both pre-committed flip conditions discharged with raws → SHIP** (`docs/reviews/gate-2026-07-05-f1b-live-slice.md`; W1 flip precedent; its 4 advisories folded same-session). **verify exit 0 = 737 passed + 6 skipped; test:legacy 306+5; F1a goldens byte-unchanged; deslop 1/100.** Records: `docs/reviews/{f1b-live-slice-record.md, codex-2026-07-05-f1b-live-slice.md (+3 raws), f1b-live-wiring-verify-evidence.log, gate-2026-07-05-f1b-live-slice.md}`. Seat events raw: 2 Codex background launches externally stopped (root cause: the CLI blocked on a never-closing background stdin — fixed `< /dev/null`); the first gate launch died mid-run on the subagent seat limit ("You've hit your session limit · resets 8:30pm (America/New_York)") — the owner-confirmed retry completed; advisor() down 12th consecutive session.
    40	>
    41	> **▶▶ RESUME DIRECTIVE (owner, 2026-07-05 — read FIRST):** on a bare **`resume`** (or `continue` / `go`) in a NEW session, run the Mandatory Startup Contract, then **report: NOTHING IS QUEUED — the only remaining plan §5 slice is Pub, which is OWNER-GATED — and STOP.** Do NOT re-run the classifier calibration (the split is exposed; a retry needs a NEW pre-registration AND the owner's explicit word). Owner-gated hard stops still bind: Pub/public posting · deploy (deferred until design fixed) · push (no remote) · name adoption (S-11) · any new live arming. If the owner explicitly asks for Pub, treat it as a fresh owner-gated slice: plan §5 Pub scope + the license decision (O6, deferred to that gate) + the em-dash style note (M1 advisory) + the full ceremony (per-slice gate → Codex batch → acceptance-gate).
    42	>
    43	> *(The block below is the prior session's handoff — superseded by the block above.)*
    44	>
    45	> **▶▶ M2 DISCHARGED — THE F1 FEE-AUDIT MODULE IS ACCEPTED; NEXT = OWNER DECISIONS (2026-07-04, eleventh session — SUPERSEDED by the twelfth-session block above).** The M2 full ceremony ran and closed: batched Codex over the whole F1 module (`c864618..bda6314`, read-only `gpt-5.5`@`xhigh`, seat `SEAT_OK`) → **BLOCK 2P1+2P2+1P3** (scope items: ClaimSource `"classifier"` additive-only CONFIRMED · the reviewer-executed F1b red-greens CONFIRMED "real teeth" · c-2 pass-through REFUTED as a silent boolean escape hatch vs the rule table · the ≥0.90 floor REFUTED as admitting a baseline tie vs AM-7) → frontier-advisor pre-verdict consult (PROCEED, 3 rulings, no overturns; first launch died on the seat limit — raw: "You've hit your session limit · resets 11:30pm (America/New_York)"; owner-confirmed retry succeeded) → **all 5 reconciled primary-model-final + red-green, committed `550e3cb`** (new non-gating `asserted-passthrough-unverified` FeeVerdict state · classifier accuracy floor amended PRE-RUN to **≥20/21, tie = DEFER** · mixed-month parser rejection · statement-position `L<i>` claim-id tags with a sanctioned golden regeneration whose byte-deltas were verified claim-id/tally-only · drift-lock extended to `kind`+`source_clause`) → mapped confirming pass **ALL FIVE DISCHARGED** (+1 residual P3 stale-E-1-comment fix) → **independent acceptance-gate SHIP, all five gates PASS** (its no-Bash verify leg ran as a live handoff, returned raw: verify exit 0 **720+5** · test:legacy exit 0 **306+5** · statement fixtures byte-unchanged · listings/legacy/gold untouched · deslop 0/100; its tripwired e1 test-count discrepancy resolved BENIGN — two pre-commit-transient F1a builder-tree tests, never committed, honesty note in the batch record; lesson routed to `~/claude-os/tasks/lessons.md`). Gate-4 advisory nits (stale `finding.ts:63` field comment · object-identity lineIndex · `#`-in-category id parseability) deliberately LEFT for the next slice per the gate's commit-as-is terms. Records: `docs/reviews/{codex-2026-07-04-m2-f1-batch{,-raw},codex-2026-07-04-m2-f1-confirm-raw,m2-reconcile-evidence.log,gate-2026-07-04-m2-f1-module}`. advisor() down 11th consecutive session.
    46	>
    47	> **▶▶ OWNER DECISIONS NOW OPEN (the build stops here — nothing fires without your word):**
    48	> 1. **ARM the live classifier run** (UNBLOCKED by M2 SHIP; surfaced, NOT started): `docs/plan-f1b-classifier.md` §3 — Groq free tier (**$0**, not metered), K=3 at temp 0, TPD preflight + pacing (the A3-7 depletion lesson carried), scored ONLY on the held-out 21-item test split against the PRE-REGISTERED floors (accuracy **≥20/21 — strictly beating the pinned 19/21 baseline; tie = DEFER** [amended pre-run at M2] · macro precision ≥0.85 · per-class recall ≥0.70 all labels, ≥0.80 on the two baseline-missed classes · flip-rate ≤0.15 · κ ≥0.60). Below any floor → the label honestly DEFERS; reported as-is; the bar never moves.
    49	> 2. **Gemini demo color variant** — arm or decline (≤$0.50 of the ≤$5 cap; non-load-bearing).
    50	> 3. **cargo/Rust toolchain** for the C5 oracle-agreement measurement (still UNMEASURED locally; past the decide-by-D1 horizon).
    51	> 4. **Corpus license** (O6 — packaged, not published).
    52	>
    53	> **▶▶ RESUME DIRECTIVE (owner, 2026-07-04 — read FIRST):** on a bare **`resume`** (or `continue` / `go`) in a NEW session, run the Mandatory Startup Contract, then **re-surface the four owner decisions above and STOP** — no further autonomous build work is queued (the remaining plan §5 slice, Pub, is owner-gated). ONLY if the owner's message explicitly ARMS the live classifier run, execute the prompt below. Owner-gated hard stops still bind (live LLM runs/spend arming · deploy [deferred until design fixed] · public posting · push · name adoption).
    54	>
    55	> ### ▶ Paste-ready prompt — LIVE CLASSIFIER RUN (fires ONLY on the owner's explicit arming word)
    56	>
    57	> ```
    58	> Resume ActivationOps AI — OWNER-ARMED live classifier run (docs/plan-f1b-classifier.md §3; M2 SHIP per docs/reviews/gate-2026-07-04-m2-f1-module.md; F1 module accepted at 550e3cb; verify green 720+5, test:legacy 306+5). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
    59	>
    60	> ROUTE + JUDGE (doctrine 2026-07-03): FABLE seat = orchestrator/FINAL JUDGE; frontier-advisor at commitment boundaries (try harness advisor() first — down 11 straight sessions, surface if still down); Codex = adversarial input, reconciled primary-model-final. Seat-limit deaths: raw error verbatim; one owner-confirmed retry; then NO-WAIT per precedent.
    61	>
    62	> THE RUN (spec-adherence to plan §3 — the floors are PRE-REGISTERED and IMMOVABLE): Groq free tier via GROQ_API_KEY (gitignored .env — never read/print the real file; ENABLE_LIVE_AI as CLI override only, .env stays false); TPD preflight (scripts-ts/groq-preflight.mjs) BEFORE any call; wire the designed LIVE_CLASSIFIER_DESIGN lane exactly as specced (leak-free ClassifierInput ONLY — no answer key, no trueCategory, no §7 class reaches the model); K=3 at temp 0 per item; the TUNE split may be used for prompt-shape sanity ONLY (no floor/threshold moved on it); then ONE scored pass on the HELD-OUT 21-item test split; compute the ported metrics (accuracy, per-class P/R/F1 + Wilson, macro κ, flip-rate) and judge vs the §3.1 floors VERBATIM (accuracy ≥20/21 STRICTLY beats the 19/21 baseline; tie = DEFER). Outcomes: floors cleared → claim per R-DHON-3 wording only; any floor missed → the label DEFERS, report honestly, NEVER re-run to green on the same split, NEVER amend a floor post-hoc; provider-degraded → diagnostic, not enshrined (bail rule). Freeze the run record (snapshot + status doc per the A3-7/domain-judge pattern), then: verify green + ONE Codex changed-files review via codex-guarded + acceptance-gate if the diff is ship-gating + state-doc sync + commit (authorized) with push HELD.
    63	> HELD: everything else — Gemini color (separate owner call) · deploy · public posting · push (no remote) · name adoption (S-11). Legacy suite stays green (306+5); differential-oracle semantics untouched. At wrap: surface newly-discovered owner-unknowns (standing practice).
    64	> ```
    65	>
    66	> *(The block below is the prior session's handoff — superseded by the block above.)*
    67	>
    68	> **▶▶ F1 OFFLINE CORE DONE — NEXT = M2 CEREMONY (2026-07-04, tenth session — SUPERSEDED by the eleventh-session block above).** F1a (`896ab59`, the fees deterministic spine: statement schema · frozen corpus · 17-rule drift-lock [11 predicates + 6 registered non-checkable] · U1 structural provisionality · e-1 refund-window verdict states · CLI `fees` leg · C6 measured 5/6-deterministic-of-6-injected) and F1b (`bda6314`, the classification layer: leak-free classifier seam · AM-7 anti-theater baseline PINNED 19/21 held-out · N=42 stratified gold set 21/21 composition-locked · metrics port · advisory audit path via claim.source `"classifier"` · PRE-REGISTERED R-DHON-3 floors in `docs/plan-f1b-classifier.md` — LLM lane DESIGNED, NOT WIRED) both shipped at the per-slice gate. **verify GREEN 715+5; test:legacy 306+5.** frontier-advisor consulted pre-approach AND pre-wrap; pre-wrap RULING: **M2 runs NOW over the offline module; the owner-gated live classifier run is BLOCKED on M2 SHIP** (deciding risk: the F1b inline documentation tail weakened maker≠judge inside the Claude lane — the cross-model gate restores it). Deviations on decision-log 2026-07-04 (builder died twice: seat limit → owner-confirmed resume; then "API Error: Overloaded" → NO-WAIT inline tail, W1 precedent). Records: `docs/reviews/{f1a,f1b}-slice-record.md` + evidence logs. **OPEN OWNER CALLS: arm the live classifier run (post-M2; $0 Groq; floors pre-registered) · Gemini demo color (≤$0.50) · cargo/Rust for C5 (PAST the decide-by-D1 horizon — decide at M2) · corpus license (O6).**
    69	>
    70	> **▶▶ RESUME DIRECTIVE (owner, 2026-07-04 — read FIRST):** when the owner types a bare **`resume`** (or `continue` / `go`) in a NEW session, EXECUTE THE PROMPT BELOW VERBATIM — do NOT wait for a paste, do NOT re-ask, do NOT re-plan the fixed roadmap. Run the Mandatory Startup Contract, then proceed straight into the M2 ceremony under the ROUTE + JUDGE rules. Owner-gated hard stops still bind (live LLM runs/spend arming · deploy [deferred until design fixed] · public posting · push · name adoption); surface a genuine blocker or an owner gate, otherwise keep going.
    71	>
    72	> ### ▶ Paste-ready resume prompt — M2 CEREMONY (fresh session; auto-fires on a bare `resume`)
    73	>
    74	> ```
    75	> Resume ActivationOps AI — M2 FULL CEREMONY over the F1 fee-audit module (docs/plan-truth-audit-execution.md v1.0 §5; F1a 896ab59 + F1b bda6314 DONE at the per-slice gate; verify green 715+5, test:legacy 306+5; records docs/reviews/{f1a,f1b}-slice-record.md + evidence logs). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
    76	>
    77	> ROUTE + JUDGE (owner rulings 2026-07-03/04, decision-log; routing doctrine 2026-07-03 ADOPTED): session seat = FABLE 5 as orchestrator/FINAL JUDGE; consult frontier-advisor at commitment boundaries (try harness advisor() first — down 10 straight sessions, surface if still down). Codex = adversarial input, reconciled primary-model-final, never blind-obeyed. Seat-limit deaths: raw error verbatim; one owner-confirmed retry; then NO-WAIT converts per precedent.
    78	>
    79	> M2 = ONE batched Codex changed-files review via ~/claude-os/bin/codex-guarded over the WHOLE F1 module (the 896ab59 + bda6314 diffs; smoke-test the seat first; surface raw errors verbatim; never silently retry/downgrade/switch accounts). THE SCOPE MUST EXPLICITLY ENUMERATE (advisor-ruled, decision-log 2026-07-04): (a) the verifier-core ClaimSource union gained "classifier" (the one shared-core touch — verify additive-only, no listings surface affected); (b) the F1b red-green cycles were REVIEWER-executed after the builder died (docs/reviews/f1b-verify-evidence.log — independently re-verify the teeth); (c) the statutory logic (monthly-average∨per-order, e-1 windows, c-exclusion, U1 markers) vs docs/research/uc1-rule-table.md; (d) the leak-free ClassifierInput contract + pre-registered floors (no ground-truth leakage, no moveable bar). Reconcile ALL findings primary-model-final + red-green; THEN the independent acceptance-gate subagent over the module; record both in docs/reviews/.
    80	>
    81	> AFTER M2 SHIP: surface the OWNER-GATED live classifier run plan (docs/plan-f1b-classifier.md §3: Groq $0, K=3 temp-0, pre-registered floors, TPD pacing) and STOP for the owner's word — the live run is BLOCKED on M2 SHIP and on that word. Also surface at session start (open owner calls): arm live classifier run · Gemini demo color (≤$0.50) · cargo/Rust for C5 (past horizon — decide at M2) · corpus license (O6).
    82	> Gate: verify green stays the floor; every accepted finding fixed red-green. At wrap: surface newly-discovered owner-unknowns (standing practice).
    83	> HELD: live LLM spend arming (Groq included — owner word first) · deploy (DEFERRED until design fixed) · public posting · push (no remote) · name adoption (S-11). Legacy suite stays green (306+5); differential-oracle semantics untouched.
    84	> ```
    85	>
    86	> *(The block below is the prior session's handoff — superseded by the block above.)*
    87	>
    88	> **▶▶ D1 SCRIPTED CORE DONE — NEXT = F1 (2026-07-03, ninth session — SUPERSEDED by the tenth-session block above).** The demo slice shipped and passed the per-slice gate (plan §5 D1): a deterministic transcript engine (`lib/packs/listings/demo/`) whose every verdict is COMPUTED from the real verifier + conformance entry points (mutation red-green executed), a machine-verified SOR-BLIND scripted actor, a strict-flag CLI `demo` leg with byte-frozen goldens, a `/demo` Static one-pager (SIMULATED banner; renders the committed transcript JSON that a test byte-asserts against the live engine output — the web provably cannot drift from the real verifier), the honesty gate extended (C7 claim verbatim single-sourced; "agent gets caught" framing machine-banned with a bites-check), and the conformance-foil beat computed live ("passes the official schema check; still lies"). Both M1 gate advisories folded in. Route ran per doctrine: frontier-advisor PROCEED pre-approach (shape C + 4 constraints, all landed) → implementer@opus build → Fable-equivalence PASS (independent verify re-run; RG ×4 authenticated) → elevation (corpus README now indexes the demo goldens). Records: `docs/reviews/{d1-slice-record.md,d1-verify-evidence.log}`. **verify GREEN 557 passed + 5 skipped; test:legacy 306+5.** **OPEN OWNER CALLS: (1) demo Gemini color variant — arm or decline (≤$0.50; non-load-bearing; annotation slot ready); (2) cargo/Rust toolchain (C5 oracle agreement UNMEASURED — the decide-by-D1 horizon is here); (3) corpus license (O6).**
    89	>
    90	> **▶▶ RESUME DIRECTIVE (owner, 2026-07-03 — read FIRST):** when the owner types a bare **`resume`** (or `continue` / `go`) in a NEW session, EXECUTE THE PROMPT BELOW VERBATIM — do NOT wait for a paste, do NOT re-ask, do NOT re-plan the fixed roadmap. Run the Mandatory Startup Contract, then proceed straight into F1 under the ROUTE + JUDGE rules. Owner-gated hard stops still bind (live LLM runs/Gemini spend arming · deploy [deferred until design fixed] · public posting · push · name adoption); surface a genuine blocker or an owner gate, otherwise keep going.
    91	>
    92	> ### ▶ Paste-ready resume prompt — BUILD F1 (fresh session; auto-fires on a bare `resume`)
    93	>
    94	> ```
    95	> Resume ActivationOps AI — BUILD MODE, F1 slice (docs/plan-truth-audit-execution.md v1.0 §5; wedge module ACCEPTED at 0eda64c; D1 scripted core DONE — verify green 557+5, test:legacy 306+5; records docs/reviews/d1-slice-record.md). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
    96	>
    97	> ROUTE + JUDGE (owner rulings 2026-07-03, decision-log; routing doctrine dated 2026-07-03 ADOPTED): session seat = FABLE 5 as orchestrator/planner/FINAL JUDGE. Execution DELEGATED via the implementer lane (model="opus" for subtle slices); consult frontier-advisor at every commitment boundary (pre-approach, pre-verdict, pre-wrap; try the harness advisor() tool first — it has been down 9 straight sessions, surface if still down). EVERY delegated slice gets the FABLE-EQUIVALENCE review on return (line-level diff · live npm run verify re-run · red-green demanded) THEN the ELEVATION pass (reversible fixes applied directly; same-breath PLAIN-ENGLISH/GLOSSARY check). Seat-limit deaths: raw error verbatim; one owner-confirmed retry; then NO-WAIT converts per precedent (W1).
    98	>
    99	> F1 per plan §5 + C8 (spec-adherence; escalate ambiguity): UC-1 build on the P1 rule table (docs/research/uc1-rule-table.md, 17 rules VERIFIED-primary; U1 purchase-price base = the named open dependency — base-derived verdicts stay provisional per the GLOSSARY note): statement schema + seeded synthetic fee-statement generator (taxonomy §7 fee-line classes, simulated-labeled) + deterministic parser + LLM line-item classifier design + stratified gold set (tune/test split, evals/gold/ patterns) + judge-recalibration plan (R-DHON-3 bar; no "calibrated" claim below the pre-registered floor). BUILD OFFLINE-FIRST ($0): all machinery, mocks, gold sets, metrics math, red-green. ANY live LLM run (Groq classifier/judge or Gemini) = OWNER-GATED — surface the run plan + cost estimate and STOP for the owner's word. The fee report follows the C2 guard (claim · reference-row · rule-id · severity).
   100	>
   101	> SURFACE AT SESSION START (open owner calls): demo Gemini color variant (arm/decline, ≤$0.50) · cargo/Rust for C5 (horizon reached) · corpus license (O6).
   102	> Gate: per-slice = verify green + red-green (S-4). After F1: M2 full ceremony (ONE batched Codex via codex-guarded + independent acceptance-gate over the F1 module). At wrap: surface newly-discovered owner-unknowns (standing practice).
   103	> HELD: live LLM spend arming (Groq runs included — owner word first) · deploy (DEFERRED until design fixed) · public posting · push (no remote) · name adoption (S-11). Legacy suite stays green (306+5); differential-oracle semantics untouched.
   104	> ```
   105	>
   106	> *(The block below is the prior session's handoff — superseded by the block above.)*
   107	>
   108	> **▶▶ M1 DISCHARGED — THE WEDGE MODULE IS ACCEPTED; NEXT = D1 (2026-07-03, eighth session — SUPERSEDED by the ninth-session block above).** W3 shipped (`54124ff`: `/report` one-page two-register web view + machine-JSON CLI contract + corpus packaged license-pending; Fable-equivalence PASS + 3 elevation fixes incl. the documented-but-unparsed `--json` and a W2-era spawn-test flake caught by the independent verify re-run). The **M1 full ceremony ran and closed**: batched Codex over the whole wedge module (`gpt-5.5`@`xhigh`, ~2.77M tokens → BLOCK 1 P1 + 4 P2 + 2 P3; all six W1 claims + the conformant-but-false headline CONFIRMED) → all 7 reconciled + red-green (`7962810`: CLI mixed-mode exclusion · C3 answer-key made exactly truthful via the drift-013 split + a NEW completeness invariant · C6 per-entry teeth · claimSource receipt · exactly-one set-equality · C10 scan+wording · surplus positionals) → mapped confirming pass **ALL SEVEN DISCHARGED** + 1 residual P3 (`--op` on the truth leg) fixed red-green (`0eda64c`) → **independent acceptance-gate SHIP — the listings-truth wedge module is ACCEPTED at `0eda64c`; W1's conditional stamp SUPERSEDED** (`docs/reviews/gate-2026-07-03-m1-wedge-module.md`; its 2 engineering advisories fold into D1). **verify GREEN 515+5; test:legacy 306+5.** **ROUTING DOCTRINE (dated 2026-07-03) ADOPTED on owner direction** (decision-log row): `frontier-advisor` = the working advisor leg (**first successful consult in 8 sessions**, at the M1 boundary), `implementer` = the delegated-execution lane, Fable-equivalence = the doctrine's top-model-final bar. **OPEN OWNER CALLS: cargo/Rust (C5 oracle agreement UNMEASURED locally — decide before/at D1) · corpus license (O6).** Standing wrap practice (owner, 2026-07-03): surface newly-discovered owner-unknowns at each wrap.
   109	>
   110	> **▶▶ RESUME DIRECTIVE (owner, 2026-07-03 — read FIRST):** when the owner types a bare **`resume`** (or `continue` / `go`) in a NEW session, EXECUTE THE PROMPT BELOW VERBATIM — do NOT wait for a paste, do NOT re-ask, do NOT re-plan the fixed roadmap. Run the Mandatory Startup Contract, then proceed straight into D1 under the ROUTE + JUDGE rules. Owner-gated hard stops still bind (Gemini spend arming · deploy [deferred until design fixed] · public posting · push · name adoption); surface a genuine blocker or an owner gate, otherwise keep going.
   111	>
   112	> ### ▶ Paste-ready resume prompt — BUILD D1 (fresh session; auto-fires on a bare `resume`)
   113	>
   114	> ```
   115	> Resume ActivationOps AI — BUILD MODE, D1 slice (docs/plan-truth-audit-execution.md v1.0 §5; W0/P1/W1/W2/W3/M1 ALL DONE — the wedge module is ACCEPTED at 0eda64c, gate record docs/reviews/gate-2026-07-03-m1-wedge-module.md; verify green 515+5, test:legacy 306+5). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
   116	>
   117	> ROUTE + JUDGE (owner rulings 2026-07-03, decision-log — the UPDATED routing doctrine ~/claude-os/docs/MODEL-ROUTING.md dated 2026-07-03 is ADOPTED): session seat = FABLE 5 as orchestrator/planner/FINAL JUDGE. Execution DELEGATED via the implementer lane (model="opus" escalation for the D1 build — subtle, demo-bearing slice); consult frontier-advisor at every commitment boundary (pre-approach, pre-verdict, pre-wrap). EVERY delegated slice gets the FABLE-EQUIVALENCE review on return (line-level diff · live npm run verify re-run — it caught a real flake last session · red-green demanded) THEN the ELEVATION pass (reversible fixes applied directly; same-breath PLAIN-ENGLISH/GLOSSARY check). Seat-limit deaths: raw error verbatim; one owner-confirmed retry; then NO-WAIT converts per precedent (W1).
   118	>
   119	> D1 per plan §5 + C7 (spec-adherence; escalate ambiguity): scripted SPEC-FAITHFUL simulated agent on the drifted corpus — demo claim VERBATIM (Codex amendment 6): "a spec-faithful simulated agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch" (never "the agent gets caught" as headline); demo ends at agent-selects-the-drifted-item (slice-C cut, no fake checkout); labeled "spec-faithful demonstration actor — simulated"; scripted replay $0 deterministic; + the conformance-foil beat ("passes the official schema check; still lies" — the conformant-but-false.json exhibit). GEMINI COLOR VARIANT = OWNER-GATED: get the owner's word BEFORE arming ENABLE_LIVE_AI (≤$0.50 of the ≤$5 cap; non-load-bearing; may fail visibly). FOLD IN the 3 M1-gate advisories: dead third clause in listings-differential-c3.test.ts covers(); adopt report-view-c1's resolver in cli-c1's import walk (@/ alias hole); em-dash density = Pub-slice owner note (no action now).
   120	>
   121	> SURFACE AT SESSION START (open owner calls): cargo/Rust toolchain for C5 oracle measurement (decide before/at D1 close) · corpus license (O6). Gate: per-slice = verify green + red-green (S-4). After D1: F1 (UC-1 build) → M2 full ceremony.
   122	> HELD: Gemini spend arming · deploy (DEFERRED until design fixed) · public posting · push (no remote) · name adoption (S-11). Legacy suite stays green (306+5); differential-oracle semantics untouched. At wrap: surface newly-discovered owner-unknowns (standing practice, owner 2026-07-03).
   123	> ```
   124	>
   125	> *(The block below is the prior session's handoff — superseded by the block above.)*
   126	>
   127	> **▶▶ W1-GATE + W2 DONE — NEXT = W3 → M1 (2026-07-03, seventh session — SUPERSEDED by the eighth-session block above).** The seventh session executed both queued items. **(1) W1 named obligation DISCHARGED** (`08c9299`): independent acceptance-gate on the W1 diff (first launch died on the seat limit — raw: "You've hit your session limit · resets 3:10pm (America/New_York)"; owner confirmed reset; relaunch completed) → verdict **BLOCK, narrow** (engineering core confirmed "at the fable-equivalence bar"; all six W1 claims verified file:line; the RG log authenticated by independent failure-count recount) → both flip conditions closed same session (P2-1 UCP-fixture freeze-lock extended + red-green; P2-2 raw verify evidence executed live) → **SHIP conditional on the M1 Codex batch**. Record: `docs/reviews/gate-2026-07-03-w1-wedge.md`. **(2) W2 DONE** (`1d0697e`; Opus builder per ROUTE+JUDGE; Fable-equivalence review PASS + elevation applied): ajv 8.20.0 (intake-noted) over the **78 pinned official UCP schemas** (spec repo `ucp` tag `v2026-04-08` — divergence from the `ucp-schema` repo recorded; per-file sha256 + provenance + Apache-2.0 LICENSE; **source-lockfile L6 RELOCKED**); `LST-CONF-*` conformance family through the same C2 guard; CLI `--conformance` leg (exit 0/1/2 unchanged; C1 holds; $0-LLM import-graph eval still green); **N=35 seeded CI corpus** (14 valid + 21 invalid, 8 violation classes, byte-frozen); **THE HEADLINE machine-checked** — `fixtures/ucp-conformance-ci/valid/conformant-but-false.json` PASSES ajv conformance yet the truth leg catches its price lie (new third adapter `ucpSearchResponseToClaims`, strengthens C3); ACP 18/18 field rules isolated red-green; all 7 W1-gate P3 advisories landed; RG ×7 in `docs/reviews/w2-verify-evidence.log`; slice record `docs/reviews/w2-slice-record.md` (builder escalations E-1..E-6 ALL ACCEPTED on Fable review; elevation added the fixture shape-honesty note + the PLAIN-ENGLISH row the builder missed). **verify GREEN exit 0 = 478 passed + 5 skipped; test:legacy 306+5 unchanged.** **OPEN OWNER CALL: cargo/rustc NOT installed → C5 official-oracle agreement UNMEASURED locally** (`npm run test:ucp-oracle` skips loud, exit 0) — install the Rust toolchain (poppler precedent) or accept measurement elsewhere; decide by M1. advisor unavailable (7th consecutive session).
   128	>
   129	> **▶▶ RESUME DIRECTIVE (owner, 2026-07-03 — read FIRST):** when the owner types a bare **`resume`** (or `continue` / `go`) in a NEW session, EXECUTE THE PROMPT BELOW VERBATIM — do NOT wait for a paste, do NOT re-ask, do NOT re-plan the fixed roadmap. Run the Mandatory Startup Contract, then proceed straight into W3 and the M1 ceremony under the ROUTE + JUDGE rules. Owner-gated hard stops still bind (Gemini spend arming · deploy [deferred until design fixed] · public posting · push · name adoption); surface a genuine blocker or an owner gate, otherwise keep going.
   130	>
   131	> ### ▶ Paste-ready resume prompt — BUILD W3 + M1 CEREMONY (fresh session; auto-fires on a bare `resume`)
   132	>
   133	> ```
   134	> Resume ActivationOps AI — BUILD MODE, W3 slice + M1 ceremony (docs/plan-truth-audit-execution.md v1.0 §5; W0/P1/W1/W1-gate/W2 DONE + committed 1b04766/da1e2e7/5a81440/08c9299/1d0697e; verify green 478+5, test:legacy 306+5). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
   135	>
   136	> ROUTE + JUDGE (owner rulings 2026-07-03, decision-log): session seat = FABLE 5 as orchestrator/planner/FINAL JUDGE; execution DELEGATED to Opus 4.8 @ xhigh builder subagents (one coherent builder per slice). EVERY delegated slice gets the FABLE-EQUIVALENCE review on return (line-level diff review · live npm run verify re-run · red-green demanded · PASS/route-back/fix as final call) THEN the post-check ELEVATION pass (reversible fixes applied directly — include the same-breath PLAIN-ENGLISH/GLOSSARY check; the W2 builder missed it). If a builder dies on the seat limit: raw error verbatim; one owner-confirmed retry; if still blocked, NO-WAIT converts to inline Fable execution WITH the deviation recorded + an acceptance-gate obligation named (precedent: W1).
   137	>
   138	> W3 per plan §5 (spec-adherence; escalate ambiguity): ONE-PAGE REPORT (web view in the Next.js console, desktop-only per the 2026-07-02 constraint, + machine JSON — same data, two registers; findings already carry plainLine) + CORPUS PACKAGING per C4/C9 (fixtures/synthetic-restaurant/ + fixtures/ucp-conformance-ci/ as the publishable corpus; license stays OWNER CALL — package for publication, do NOT publish; Pub is owner-gated). Legibility = HARD constraint (S-9: the drift report itself meets the documentation standard; the report needs no explanation).
   139	>
   140	> THEN M1 FULL CEREMONY (wedge module done): ONE batched Codex changed-files review via ~/claude-os/bin/codex-guarded over the whole wedge module (W1 5a81440 [its gate record demands the cross-model leg — SHIP is conditional on it] + 08c9299 + 1d0697e + the W3 diff) — smoke-test the seat first, surface raw errors verbatim, never silently retry/downgrade/switch accounts; reconcile primary-model-final; THEN the independent acceptance-gate subagent over the whole module; record both in docs/reviews/. Surface at M1 if still undecided: the cargo/Rust owner call (C5 oracle agreement UNMEASURED locally).
   141	>
   142	> Gate: per-slice = verify green + red-green (S-4). After M1: D1 (demo — scripted spec-faithful agent on the drifted corpus; ANY live Gemini spend needs OWNER WORD first, ≤$0.50 of the ≤$5 cap).
   143	> HELD: Gemini spend arming · deploy (DEFERRED until design fixed — owner 2026-07-03) · public posting · push (no remote) · name adoption (S-11 checks first). Legacy suite stays green (test:legacy 306+5); differential-oracle semantics untouched.
   144	> ```
   145	>
   146	> *(The block below is the prior session's handoff — superseded by the block above.)*
   147	>
   148	> **▶▶ W0+P1+W1 DONE — NEXT = W2 (2026-07-03, sixth session — SUPERSEDED by the seventh-session block above).** The build session executed all three queued slices, each Fable-judged at the equivalence bar + elevated, each committed (push HELD, no remote): **W0** `1b04766` (§6 restructure — verifier skeleton in; activation archived runnable at `legacy/activation/`, `npm run test:legacy` 306+5; ledger `docs/restructure-w0-ledger.md`) · **P1** `da1e2e7` (NYC §20-563.3/LL79 codified on PRIMARY text — 17 rules, effective date RESOLVED became-law 2025-05-31/effective 2025-06-30; `docs/research/{ll79-source-memo,uc1-rule-table}.md` + `.draft.json` + `source-lockfile.md` seeded; U1 "purchase price" base = the F1 dependency) · **W1** `5a81440` (the wedge — seeded synthetic SOR, faithful+drifted ACP feeds, constructed UCP response fixtures, deterministic comparator, C2-guarded evidence model, one-command $0-LLM CLI `bin/check.mjs`; C3 one-comparator-two-adapters incl. ID-mismatch + modifier-ambiguity; C6 measured 8/8; RED-GREEN ×4 in `docs/reviews/w1-verify-evidence.log`). **verify GREEN exit 0 = 409 passed + 5 skipped.** THREE owner rulings recorded 2026-07-03 (decision-log): Fable-equivalence review on every delegated slice · post-check ELEVATION mandate · **deploy deferred until design is fixed**. **DEVIATION on record:** W1 was executed INLINE on the Fable seat (the Opus subagent seat hit its limit twice — raw: "You've hit your session limit · resets 7:40am / 2:30pm (America/New_York)"; NO-WAIT applied) → **NAMED OBLIGATION: an independent `acceptance-gate` pass on the W1 diff once the subagent seat resets (≥2:30pm ET 2026-07-03), before or at M1.** advisor unavailable (6th session).
   149	>
   150	> **▶▶ RESUME DIRECTIVE (owner, 2026-07-03 — read FIRST):** when the owner types a bare **`resume`** (or `continue` / `go`) in a NEW session, EXECUTE THE PROMPT BELOW VERBATIM — do NOT wait for a paste, do NOT re-ask "should I continue?", do NOT re-plan the fixed roadmap. Run the Mandatory Startup Contract, then proceed straight into the W1 acceptance-gate obligation and the W2 slice under the ROUTE + JUDGE rules below. Owner-gated hard stops still bind (Gemini spend arming · deploy [deferred until design fixed] · public posting · push · name adoption); surface a genuine blocker or an owner gate, otherwise keep going.
   151	>
   152	> ### ▶ Paste-ready resume prompt — BUILD W2 (fresh session; auto-fires on a bare `resume`)
   153	>
   154	> ```
   155	> Resume ActivationOps AI — BUILD MODE, W2 slice (docs/plan-truth-audit-execution.md v1.0 §5; W0/P1/W1 DONE + committed 1b04766/da1e2e7/5a81440, verify green 409+5). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
   156	>
   157	> ROUTE + JUDGE (owner rulings 2026-07-03, decision-log): session seat = FABLE 5 as orchestrator/planner/FINAL JUDGE; execution DELEGATED to Opus 4.8 @ xhigh builder subagents (one coherent builder per slice). EVERY delegated slice gets the FABLE-EQUIVALENCE review on return (line-level diff review · live npm run verify re-run · red-green demanded · PASS/route-back/fix as final call) THEN the post-check ELEVATION pass (capability-utilization audit + blindspot fixes, reversible changes applied directly). If a builder dies on the seat limit, surface the raw error verbatim; one owner-confirmed retry; if still blocked, NO-WAIT converts to inline Fable execution WITH the deviation recorded + an acceptance-gate obligation named (precedent: W1, decision-log 2026-07-03).
   158	>
   159	> FIRST (named obligation, if not yet discharged): run the independent acceptance-gate subagent on the W1 diff (commit 5a81440) — maker=judge mitigation for the inline build. Record SHIP/BLOCK in docs/reviews/.
   160	>
   161	> THEN W2 per plan §5 (spec-adherence; escalate ambiguity): own ajv validation over the published UCP schemas + recorded live-catalog response fixtures (C3 leg) + official `ucp-schema` composed IN CI as a differential oracle (never a runtime dependency — C1 one-command constraint holds; cargo-only Rust tool — if the toolchain is absent, gate it behind an optional CI lane and ESCALATE the reading, don't improvise). C5: agreement with `ucp-schema validate` on N≥30 CI fixtures; ACP checks red-green per extracted field rule. NOTE: ajv is NOT yet an npm dependency — a new dep needs the source-intake note in the slice record (mature OSS, MIT, named in plan §3) — record the intake, don't skip it.
   162	> Gate: per-slice = verify green + red-green (S-4). Then W3 (one-page report + corpus packaging) → M1 full ceremony (ONE batched Codex changed-files review via ~/claude-os/bin/codex-guarded + acceptance-gate over the whole wedge module, incl. the W1 obligation if still open).
   163	>
   164	> HELD: Gemini spend arming · deploy (DEFERRED until design fixed — owner 2026-07-03) · public posting · push (no remote) · name adoption (S-11 checks first). Legacy suite stays green (test:legacy 306+5); differential-oracle semantics untouched.
   165	> ```
   166	>
   167	> *(The block below is the prior session's handoff — superseded by the block above.)*
   168	>
   169	> **▶▶ BUILD IS LIVE (2026-07-02, fourth session, late — SUPERSEDED by the 2026-07-03 block above).** The owner gave GO ("do it… build working prototype now") + three rulings recorded in the decision-log: **NO-WAIT doctrine** (wait-states → inline checks or alternative sources), **REAL-FIRST data doctrine** (real specs/laws/latest-past public data where ToS-clean; synthetic labeled fills the rest), **O4 DCWP comment = consciously declined**. Executed same session: **S0 committed** (`a65064b` S-5 close-out with provenance caveat · `fb20eba` pivot plan-stage docs; verify green 306+5 at commit) and **G8 crux gate RAN INLINE → PASS** (`docs/reviews/gate-2026-07-02-g8-crux.md`: the UCP catalog spec puts the copy layer IN-PROTOCOL — no SOR requirement, no accuracy SLA; the independent seat is unoccupied; the buyer claim consciously declined). **THE PROGRAM = `docs/plan-truth-audit-execution.md` v1.0 GO.** Remaining S0 tail: the §6 repo restructure (execute as W0, first step of the build session). Standing constraints: desktop web only · free-tier + Gemini ≤$5 · honesty rules · push HELD (no remote) · name adoption gated on S-11 live checks.
   170	>
   171	> ### ▶ Paste-ready resume prompt — BUILD W0+W1 (fresh session)
   172	>
   173	> ```
   174	> Resume ActivationOps AI — BUILD MODE, the verifier program is GO (docs/plan-truth-audit-execution.md v1.0; G8 PASSED; S0 committed a65064b/fb20eba). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
   175	>
   176	> ROUTE + JUDGE (owner rulings, 2026-07-03; decision-log rows same date; AMENDED at session wrap — owner picked the DELEGATION rendering): session seat = FABLE 5, as ORCHESTRATOR · PLANNER · FINAL JUDGE (all gate verdicts, reconciliations, and stage-exit calls are made on the Fable seat and are the FINAL CALL — primary-model-final binds to Fable specifically). EXECUTION IS DELEGATED, never done on the Fable seat: W0/W1/P1 build slices → Opus 4.8 @ xhigh subagents (one coherent builder per slice, conservative-for-write); Sonnet/Haiku only for equivalence-qualified mechanical/read fan-outs per the MODEL-ROUTING down-tier floor. Judgment delegates (acceptance-gate, council, security, evals) explicit fable override — never inherited. Codex stays adversarial INPUT (cross-model gate unchanged, never skipped). Fable holds a standing full-liberty license for blindspot fixes/refinements toward a standout project — owner-gated hard stops (spend/deploy/push/public/name) still bind. Blindspot answers carried forward: poppler INSTALLED (owner-ordered 2026-07-03, v26.06.0 — PDF extraction open for P1); harness scaffolding gitignored; verify re-grounded EXIT 0 on 2026-07-03.
   177	>
   178	> DONE — do NOT redo: research (ADDENDUM+CORRECTION) · council (RESHAPE-PROCEED) · Codex direction gate (12/12 reconciled) · owner GO + NO-WAIT + REAL-FIRST + desktop-only rulings (decision-log 2026-07-02) · S0 commits · G8 PASS.
   179	>
   180	> EXECUTE IN ORDER (spec-adherence mode — the plan is fixed; escalate ambiguity, don't improvise):
   181	> W0 = the §6 restructure: lib/verifier-core/ + lib/packs/{listings,fees}/ + legacy/activation/ (archive-don't-delete, tests runnable via separate script) + fixtures/synthetic-restaurant/ + bin/ CLI entry; keep npm run verify green throughout (the 306 tests keep passing from legacy/ or are consciously migrated — record which).
   182	> W1 = the wedge per plan §4/§5: synthetic restaurant SOR (Square Catalog API shape) + ACP feed generator + drift injector keyed to the §7 taxonomy + deterministic comparator + evidence model (C2: claim·reference-row·rule-id·severity, no finding without all four) + one-command CLI (C1, $0-LLM asserted) + C3 surface-agnostic (static ACP feed AND recorded live UCP catalog-response fixtures; ≥1 ID-mismatch + ≥1 modifier-ambiguity class; matching-mode label in every report).
   183	> P1 (parallel, same session where it fits) = UC-1 rule-table codification: §20-563.3 full text via ALTERNATIVE sources (NYC.gov PDFs / intro.nyc LL79 PDF [poppler INSTALLED 2026-07-03 (owner-ordered, v26.06.0; `pdftotext` verified) — PDF extraction path OPEN] / vlex / NY senate — amlegal 403s WebFetch), resolve the 2025-05-31 vs 06-30 effective-date conflict on primary text, emit the codified rule table + the LL79 source memo.
   184	> Gates: per-slice = verify green + red-green (S-4); full Codex batch + acceptance-gate at M1 (wedge module done). 14-day build-slip + 30-day external-signal tripwires live.
   185	>
   186	> HELD: Gemini spend (demo only, ≤$0.50 of the ≤$5 cap — get owner word before arming ENABLE_LIVE_AI) · deploy · public posting · push (no remote) · product-name adoption (S-11 checks first).
   187	> ```
   188	>
   189	> *(The blocks below are prior-session lineage — superseded by the block above.)*
   190	>
   191	> **▶▶ SESSION WRAP (2026-07-02, third session — READ THIS BLOCK + ITS PROMPT FIRST; it SUPERSEDES every resume prompt below).** The reframe is ACCEPTED FOR PLANNING, all standing directives + the documentation system are durable (decision-log 2026-07-02 ×3 latest rows; `docs/suggestions-ledger.md` S-1..S-10; `docs/{PLAIN-ENGLISH,documentation-standard,GLOSSARY}.md`), state docs are synced, and the session is CUT losslessly at the owner's direction. **A bare `resume` in a NEW session = execute the PIVOT PLAN STAGE prompt below** (goal mode, owner-gates held; do NOT wait for a paste, do NOT re-ask). It validates the REFRAMED direction — not the old prototype-SaaS framing, and NOT the suspended slice-2 live re-run.
   192	>
   193	> ### ▶ Paste-ready resume prompt — PIVOT PLAN STAGE, REFRAMED (fresh session; supersedes all prompts below)
   194	>
   195	> ```
   196	> Resume ActivationOps AI — PIVOT PLAN STAGE (REFRAMED direction), goal mode, owner-gates HELD. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item).
   197	>
   198	> DONE — do NOT redo: pivot research (docs/research/pivot-research-2026-07.md + use-case-backlog.md); owner picked the composite with UC-2 LEADING; then (2026-07-02, decision-log latest rows) the owner ACCEPTED-FOR-PLANNING the REFRAME — UC-2's lead artifact = an OPEN ACP/UCP conformance + truth-audit toolkit ("the truth layer for agentic commerce") + a self-referential demo (a real AI agent caught ordering from a deliberately-drifted synthetic menu); UC-1 fee-cap audit = module two on the same verifier. Read docs/suggestions-ledger.md (S-1..S-10) — S-4 (module-boundary Codex ceremony), S-5 (slice-2 close-out as capability lineage), S-9 (drift report itself meets the documentation standard) are PENDING and must be folded into the plan surfaced for owner GO.
   199	>
   200	> STANDING DIRECTIVES (owner — binding on this stage): independent-judgment license through planning (add suggestions to the ledger in the same breath); legibility = HARD artifact constraint (one-command validator, one-page report, demo needs no explanation); data = free/open + live (ToS-clean ONLY: public specs, own sandboxes, merchant-permissioned) + hybrid + synthetic, edge cases as an ENUMERATED taxonomy with measured eval coverage (never claim "all"); everything free/free-tier except Gemini ≤$5; demo agent = scripted or Gemini-driven, never Claude/Codex as runtime; two-register documentation per docs/documentation-standard.md (update PLAIN-ENGLISH.md + GLOSSARY.md same-breath); intent frame = benefit the industry, company-agnostic, platforms as indirect beneficiaries.
   201	>
   202	> TASK = take the REFRAMED direction to a buildable, owner-approvable plan: (1) UC-2 primary reads — ACP spec text (developers.openai.com/commerce: feed format, refresh cadence, MUST/SHOULD conformance surface) + UCP publication status (Google+Square, announced 2026-07-01; AAIF/W3C watch) + surface-access legality map (green/yellow/red: public specs / own sandbox / merchant-permissioned vs ToS-walled) + operator-voice pass (last30days: r/restaurantowners etc. — menu drift, sync failures, wrong-price orders); NYC LL79/§20-563.3 + AB 578 primary texts = module-two prep, lighter. (2) Council deep-validation ("agents gather to evaluate") on the REFRAMED direction (sequential, shared_reasoning.md). (3) MANDATORY Codex cross-check via ~/claude-os/bin/codex-guarded on the reframed pivot (consequential — the direction is DECIDED only after this). (4) THEN the declarative plan + roadmap: success criteria + acceptance tests, slices, module-boundary gates (per S-4 if owner accepts), verification-spine reuse map, the repo-restructure proposal, edge-case taxonomy v1, demo storyboard, and the S-5/S-9 owner calls. Surface the whole plan for owner GO before ANY build.
   203	>
   204	> Owner-gated stops HELD: live spend (≤$5), deploy, public posting, git push (no remote), platform-name, the restructure execution, the final pivot ratification.
   205	> ```
   206	>
   207	> *(The blocks below are same-day lineage — superseded by the block above.)*
   208	>
   209	> **▶▶ SESSION UPDATE (2026-07-02, LATER — REFRAME ACCEPTED FOR PLANNING + STANDING PLAN-STAGE DIRECTIVES; the plan stage now validates the REFRAMED direction).** On the owner's explicit "independent judgment, full liberty" ask, Claude proposed and the owner ACCEPTED (for planning — gates unchanged): **UC-2's lead artifact = an OPEN ACP/UCP conformance + truth-audit toolkit ("the truth layer for agentic commerce") + a self-referential demo (a real AI agent caught ordering from a deliberately-drifted synthetic menu)** — instead of a merchant-facing prototype SaaS; UC-1 stays module two unchanged. **Standing directives (owner, decision-log 2026-07-02 ×2, last rows):** (a) independent-judgment license through research/planning until build, then spec-adherence; (b) **legibility = hard design constraint on the artifact** (one-command validator, one-page report, demo needs no explanation — complex inside, simple outside); (c) data spans free/open + live (ToS-clean only) + hybrid + synthetic; edge cases = enumerated taxonomy + measured eval coverage (never "all"); (d) all free/free-tier except Gemini ≤$5; demo agent = scripted or Gemini-driven, never Claude/Codex as runtime. **NEW durable artifacts + standing rules: `docs/PLAIN-ENGLISH.md`** (layman explainer, updated in the same breath as every meaningful change) **+ `docs/documentation-standard.md` + `docs/GLOSSARY.md`** (owner directive, decision-log 2026-07-02 last row: two-register documentation — professional terminology leads, decoded via first-use explanations + the glossary, never diluted; Diátaxis/Minto-SCQA/C4/ADR/docs-as-code as the floor-not-ceiling; visuals+text paired; resonance by narrative never hype; same-breath maintenance). `advisor` tool unavailable again this session (surfaced). **The plan-stage resume prompt below still applies WITH these amendments: council + Codex validate the REFRAMED direction; the UC-2 primary reads (ACP/UCP specs + surface-access legality + operator-voice pass) are unchanged and now even more central; two Claude secondary suggestions to fold into the plan surfaced for GO: module-boundary Codex ceremony (vs per-slice) + closing out the suspended slice-2 diff as committed capability lineage.**
   210	>
   211	> **▶▶ SESSION UPDATE (2026-07-02 — PIVOT RESEARCH STAGE DONE; ACTIVE = OWNER PICKS THE CANDIDATE → then plan/roadmap in a FRESH session). THIS BLOCK SUPERSEDES the 2026-06-29 RESUME DIRECTIVE below — a bare `resume` must NOT fire the slice-2 live re-run while the pivot is active.** The owner re-opened the pivot (2026-07-01, `/claude-os` → `/enhance`): find a real, high-value, **structurally** underexplored problem in the DoorDash/Uber Eats/Grubhub-class US delivery-marketplace industry (company-agnostic), solved by a vertical AI solution at **adoption-grade prototype** standard. **FIXED OBJECTIVE (owner-settled 2026-07-02):** showcase-first venture-ready · prefer-reuse of the verification spine (evidence can override) · "adoption" = the quality bar (metaphorical), adopter = a research output · constraints unchanged (prototype-not-service, $5 cap, honesty rules). Research ran plan-mode-approved (2 quarantined threads, ~100 sources; first launch died on the seat session-limit — raw error surfaced, no silent retry, relaunched post-reset; `advisor` tool unavailable this session, surfaced). **THE RANKED DIGEST = `docs/research/pivot-research-2026-07.md`** — #1 fee-statement/fee-cap compliance audit (LEAD-POTENTIAL: HungryPanda $875K NYC enforcement 2026-04 + FTC docket FTC-2026-0463; searched-and-empty for any product; counterparty-adverse = durable) · #2 cross-surface menu/price truth verification incl. AI-agent surfaces (LEAD-POTENTIAL early: Square ChatGPT/Claude ordering 2026-07-01; syncer≠judge; independent-verifier seat empty) · ★ composite "marketplace truth-audit layer" (both threads converged; #1 wedge, #2 growth) · H1 dispute automation CONTESTED (Loop $14M Series A + DoorDash ToS prohibits third-party dispute submission) · H2 refund-abuse + driver-side AVOID. Decision-log row 2026-07-02; task-log updated; NO product code changed. **SLICE-2 close-out is SUSPENDED by this redirect** (uncommitted slice-2 diff intact on disk; its live-re-run authorization stands only if the owner explicitly redirects back). **NEXT GATE (owner): pick #1 / #2 / composite / reject all → THEN the plan stage.** **→ RESOLVED same session: the owner PICKED the COMPOSITE with the FEE-AUDIT WEDGE (decision-log 2026-07-02, 2nd row). ACTIVE = the PLAN stage per the resume prompt below (fresh session recommended — this one ran long).**
   212	>
   213	> ### ▶ Paste-ready resume prompt — PIVOT PLAN STAGE (after the owner picks a candidate; fresh session)
   214	>
   215	> ```
   216	> Resume ActivationOps AI — PIVOT PLAN STAGE. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item).
   217	>
   218	> DONE — do NOT redo: the pivot research stage (2026-07-02). The fixed objective + ranked candidates live in docs/research/pivot-research-2026-07.md (+ decision-log 2026-07-02 ×2). THE OWNER PICKED (2026-07-02, via AskUserQuestion; order FLIPPED later same day — decision-log 3rd row): the COMPOSITE "marketplace truth-audit layer" with **UC-2 LEADING** — slice one = cross-surface/agent-facing menu-price-availability TRUTH VERIFICATION (each listed/agent-visible datum = a claim → deterministic verify vs POS/catalog system-of-record → calibrated-judge-verified → evidence-cited drift report → human-gated corrections; ACP/UCP-standards-aligned); slice two = UC-1 fee-statement/fee-cap audit (same engine, money-lines domain). The pick is "accepted for planning" — treat as DECIDED only after this plan stage's council + Codex gates. Adjust the plan-stage to-dos accordingly: for UC-2 the primary reads are the ACP/UCP spec texts + surface-access legality; the NYC LL79/AB578 bill texts move to module-two prep.
   219	>
   220	> INTENT FRAME (owner, 2026-07-02 — steer the plan with it): demonstrate deep AI proficiency to the industry by BENEFITING it (platforms = indirect beneficiaries; positioning = "marketplace integrity infrastructure"); company-agnostic; lean/optimized/structured builds (existing-system redesign in scope); the local repo MAY be restructured per the fixed goal (propose the restructure in the plan; execute only after owner GO). The full use-case backlog (UC-1..UC-9, independently workable later) = docs/research/use-case-backlog.md.
   221	>
   222	> TASK = take the picked candidate to a buildable, owner-approvable plan: (1) run the digest's standing to-dos for that candidate (primary bill/spec texts — NYC LL79/§20-563.3, AB 578, ACP/UCP specs; Reddit first-person pass via last30days; video teardowns where flagged); (2) council deep-validation ("agents gather to evaluate") on the picked direction; (3) Codex cross-check via ~/claude-os/bin/codex-guarded on the pivot recommendation (consequential — REQUIRED before the pivot is treated as decided); (4) THEN a declarative plan + roadmap (success criteria + acceptance tests, slices, gates), reusing the verification spine (claim extraction → deterministic check vs structured records → human gate → audit → calibrated judges → cost ledger) unless evidence overrode. Surface the plan for owner GO before any build. NOTE: slice-2 of the old roadmap stays SUSPENDED (uncommitted diff intact) — ask the owner whether to fold, commit, or drop it during planning.
   223	>
   224	> Owner-gated stops HELD: live spend (≤$5), deploy, public posting, git push (no remote), platform-name, the pivot decision itself.
   225	> ```
   226	>
   227	> *(The blocks below are the SUSPENDED multi-agent-build handoff — slice-2 close-out held mid-flight by the pivot redirect. Retained as lineage; do not execute from them unless the owner redirects back.)*
   228	>
   229	> **▶▶ SESSION UPDATE (2026-06-29, slice-2 close-out — STEP 1 of 2 DONE; STEP 2 HELD on a fresh window).** The OFFLINE half of the owner's Option 1 is **done + gated**: the load reduction landed harness-only in `evals/agent-loop.live.test.ts` — a **pre-registered, OUTCOME-BLIND 4 tune + 4 test subsample** (one item per failure mode per split, lowest-definition-order, **original splits preserved**, `maxIterations=3` kept) + an **offline composition unit test** that machine-checks the rule. **`npm run verify` GREEN — 306 passed (+1) + 5 skipped** (the live test still auto-skips offline). The deliverable-B **success criterion was reframed** (pre-registered + advisor-cross-checked; **FLAG at the batched Codex review**): a clean run = **detection === N** (the HARD gate; degraded fails loudly), and **`test ≥ K` is now a REPORTED measurement, not a hard pass/fail** (at reduced N, K is coarse and one genuine non-convergence can land the floor red on an otherwise-clean run — that is a complete authoritative result, never recomposed to go green). K asserted only non-vacuous. Pre-registration: `docs/a3-7-live-run-status.md` → "SLICE 2 CLOSE-OUT — PRE-REGISTRATION". **STEP 2 (the live re-run) is HELD: the Groq daily window is NOT fresh** — the 2026-06-29 run depleted today's daily window; preflight 2026-06-29 15:26 UTC showed TPM 99.1% but that does NOT reflect the daily (TPD) budget; Groq's exact reset semantics are **UNVERIFIED-from-memory (RULES §6)** but the window is not fresh today either way (depletion was hours ago, same UTC day; expected reset ~2026-06-30 00:00 UTC). **NEXT = a FRESH-DAY session: confirm the window is genuinely fresh, then run the already-authorized live re-run (≤$5; will be ~$0.02) → gate the whole slice-2 diff (verify green → ONE batched Codex review → acceptance-gate) → commit (owner-authorized) → push HELD.** Do NOT auto-fire the live spend overnight on calendar inference alone. The uncommitted slice-2 diff now also includes the harness load-reduction + the status-doc pre-registration (re-derive via `git status`). The resume prompt below still applies; the only change is STEP 1 is already done.
   230	>
   231	> **▶▶ RESUME DIRECTIVE (read FIRST) — when the owner types `resume` (or `continue` / `go`) in a NEW session:** run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; `git status` + `git log --oneline -8`), re-derive git state live, show the Professional Process Applied block (with an Effort item), then **EXECUTE THE SLICE 2 CLOSE-OUT autonomously** (goal mode) per the "SLICE 2 close-out" resume prompt below. The OWNER ALREADY CHOSE OPTION 1 (2026-06-29): **reduce per-run Groq load (harness-only subsample, balanced across the 4 failure modes, keep `maxIterations=3`) → confirm a FRESH Groq daily window → re-run live for a clean detection-full-N K → gate (verify → batched Codex → acceptance-gate) → commit (owner-authorized) → push HELD.** Do NOT wait for a paste and do NOT re-ask "should I continue?". **The live re-run is the ALREADY-AUTHORIZED slice-2 live spend (≤$5 cap)** — but HONOR the hard precondition: do the offline load-reduction + gate it first, CONFIRM the Groq window is genuinely fresh (a new day, zero prior usage — groq-preflight shows only TPM, not the daily counter), and STOP + surface if the window can't be confirmed fresh, if a run still degrades (detection < full-N), or if spend approaches $5. Other owner-gated hard stops still bind: deploy, public posting, `git push` (no remote), platform-name. Surface a genuine blocker or an owner-gate; otherwise keep going.
   232	>
   233	> **▶▶ ROADMAP SLICE 2 — CLEAN R-A3-9 LIVE RE-RUN EXECUTED (2026-06-29, owner GO). TWO deliverables, OPPOSITE outcomes. UNCOMMITTED; the batched Codex + acceptance-gate + commit are HELD pending the SLICE 2 CLOSE-OUT (owner chose option 1 — reduce load + fresh-window re-run). ▶ NEXT = the SLICE 2 close-out (resume prompt below): clean K → gate (verify GREEN 305+5 → batched Codex → acceptance-gate) → commit (owner-authorized) → push HELD. Deliverable A (drafter-reliability) is LIVE-CONFIRMED CLEAN and ships in that same commit.**
   234	>
   235	> **A — DRAFTER-RELIABILITY (the slice-1 fix's first LIVE test) → ✅ CONFIRMED, CLEAN.** The PRIMARY purpose of slice 2 is done: `final_redraft_live 16/16`, `final_redraft_fell_back 0`, **0/24 redrafts `finishReason=length`** (all `finishReason=stop`). The A3-7 ~75% structured-output parse-failure is **GONE** — the slice-1 fix (thinking `thinkingBudget=0` + `MAX_LIVE_OUTPUT_TOKENS` 2000→4096) works in production. **Advisor carry-forward ANSWERED:** the Drafter still EARNS its label under disabled thinking, MORE robustly (every converged draft live-authored; zero stub fallbacks on the final redraft). This sub-result is clean and committable regardless of B. RULES §6 re-anchored 2026-06-29 (gemini-2.5-flash $0.30/$2.50, matches the pinned table; newer 3.x Flash exists = a separate owner+Codex pick, not assumed). Cost **$0.0189** (« $5). `.env` never armed (`ENABLE_LIVE_AI=false`, CLI-override only, re-confirmed).
   236	>
   237	> **B — R-A3-9 AUTHORITATIVE CLEAN K → ⚠️ STILL INCOMPLETE (Groq-degraded again).** K is now REAL (tune 6/7=0.857 → **K=7**, not run #3's vacuous 1), but `degraded:true` (**detection 13/16**) and `test_meets_floor:false` (test 5/9 < 7) → NOT authoritative. The vitest floor assertion FAILED LIVE (5<7) — an HONEST degraded-run red, **NOT a code regression and NOT modified to pass** (the live test auto-skips offline; **`npm run verify` GREEN 305+5**, typecheck/build clean). The unmet floor is **substantially a degradation artifact**: of 4 test misses, **1 is a genuine non-convergence** (P-entity-2 — clean live redrafts, judge kept flagging → correctly HELD, not sent) and **3 are the Groq-depleted tail** (P-entity-3/P-capability-4/P-specific-4 — judge+domain `FAILED_TO_FALLBACK`; their *drafter* redrafts parsed fine). **NEW STRUCTURAL ROOT CAUSE:** the now-reliable drafter runs MORE live redrafts → MORE Groq judge/domain calls per run → one full 16-item×3-iter run depletes the Groq free-tier DAILY window on the tail (the binding constraint the advisor flagged — Groq window, not the $5 cap). "Fresh calendar day" was necessary but NOT sufficient. **Per the pre-committed bail rule: degraded → diagnostic — NOT enshrined as a pass, NOT blind-re-run on the now-depleted window.**
   238	>
   239	> **LABELS — UNCHANGED, all 3 DEFER (run-independent, re-confirmed).** Router ablation `signals_differ:0` again (23 live calls, structurally identical to `strongReflection`); Strategist DEFER by construction, Domain Critic DEFER by R-A3-8 cap, Router DEFER by the structural tie. Ledger "1 earned (Drafter) + 3 deferred". Do NOT re-litigate.
   240	>
   241	> **WHAT CHANGED (uncommitted; re-derive via `git status`):** `lib/data/agent-loop.snapshot.json` (the new live run — degraded-but-drafter-fixed, self-labeled `degraded`/`_caveat`/`interpretation`) + `docs/a3-7-live-run-status.md` ("RESULTS — SLICE 2 RE-RUN" with full per-item evidence + the 4 owner options) + `scripts-ts/groq-preflight.mjs` (NEW — Groq window-freshness preflight) + state docs (PROJECT_STATE/CURRENT_TASK/HANDOFF). The served public fixture is built independently by `snapshot.ts` at $0 — public surface untouched.
   242	>
   243	> **THE OWNER DECISION (deliverable B; a second live run is OWNER-GATED live spend):** how to get the clean K, given a single full run now depletes the Groq free-tier daily window:
   244	> 1. **Reduce per-run Groq load** (smaller demo set / fewer `maxIterations` / fewer critic calls per iter) so a full run fits ONE free-tier window → fresh-window re-run. **Cheapest, free; my recommendation** (some small-N statistical-power loss). A methodology tweak = a small gated change.
   245	> 2. **Split the run across days/windows** (no methodology change; operational pacing).
   246	> 3. **Paid Groq tier** for the one authoritative run (relaxed tech-stack rule allows it where it materially serves the goal; consequential → owner sign-off + Codex; small spend).
   247	> 4. **Accept K as directional** (tune already shows ~85% clean self-correction) and stop chasing a clean cross-split floor — commit slice 2 on deliverable A + the directional K.
   248	>
   249	> ### ▶ Paste-ready resume prompt — SLICE 2 close-out (after the owner picks an option for B)
   250	>
   251	> ```
   252	> Resume ActivationOps AI autopilot — ROADMAP SLICE 2 close-out, goal mode, owner-gates HELD. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item). Re-derive git state live; do not trust SHAs in docs.
   253	>
   254	> DONE — do NOT redo: SLICE 2 deliverable A (drafter-reliability) is LIVE-CONFIRMED CLEAN (final_redraft_live 16/16, 0/24 finishReason=length; the Drafter still EARNS under disabled thinking). The 3 labels all DEFER (run-independent). Offline verify GREEN 305+5. Full evidence: docs/a3-7-live-run-status.md "RESULTS — SLICE 2 RE-RUN". The snapshot/preflight/docs are on disk, UNCOMMITTED.
   255	>
   256	> DELIVERABLE B (the clean R-A3-9 K) is INCOMPLETE — Groq-degraded (detection 13/16) because the now-reliable drafter drives more Groq judge load than one free-tier daily window holds. THE OWNER CHOSE OPTION 1 (2026-06-29, via AskUserQuestion): REDUCE PER-RUN GROQ LOAD, THEN RE-RUN ON A FRESH WINDOW. Execute it carefully:
   257	>  - HARD PRECONDITION — a FRESH Groq daily window. The 2026-06-29 run DEPLETED today's window (that is why the tail fell back). Do NOT blind-re-run on a depleted window (advisor rule + the whole point is a CLEAN detection-16/16 run). The free-tier daily token window resets daily (~00:00 UTC); confirm a fresh window before arming. groq-preflight reads the per-MINUTE (TPM) header, NOT the daily counter — so freshness = a genuinely new day with zero prior usage, not a green TPM.
   258	>  - INSTRUMENT THE GROQ DAILY BUDGET (do this so the reduction is data-driven, not guessed): the binding limit is the daily token budget, and one full 16-item×3-iter run slightly exceeds it. Either log the Groq response rate-limit headers per call during the run, or size the reduction to ~75-80% of the prior run's call count.
   259	>  - LEVER (harness-only — the orchestrator has NO domain-judge DI seam, so do NOT touch product code): reduce load in evals/agent-loop.live.test.ts. RECOMMENDED: subsample to a smaller BALANCED set (keep all 4 failure modes in BOTH tune+test; e.g. 4 tune + 5 test) while KEEPING MAX_ITERATIONS=3 — this preserves each item's convergence dynamics (what makes K meaningful) and just trims count. Avoid MAX_ITERATIONS 3→2 (it caps convergence and distorts K downward). Update the TUNE.length/TEST.length asserts to match. A smaller K resolution is the accepted tradeoff of "reduce load"; record it + that K is set on tune ONLY, never tuned on test (R-A3-9).
   260	>  - This load-reduction change is reversible/offline — gate it (npm run verify green) BEFORE the live re-run. The live re-run itself is OWNER-GATED live spend (≤$5; it will be ~$0.02) — confirm the fresh window, then run; STOP + surface if anything degrades (detection < the new N) or spend approaches $5.
   261	>  - CONFIRM detection = full-N (clean, no fallbacks) before reading K. If still degraded, the reduction was insufficient — surface, do NOT enshrine.
   262	> THEN gate the whole slice-2 diff: npm run verify(:full) green → ONE batched Codex changed-files review via ~/claude-os/bin/codex-guarded on the live-run diff (reconcile primary-model-final) → acceptance-gate SHIP; record in docs/reviews/. Commit owner-authorized; push HELD. (Deliverable A — the drafter-reliability confirmation — is clean and ships as part of this same slice-2 commit regardless.)
   263	>
   264	> Owner-gated stops HELD: live spend (slices 2+5, ≤$5), deploy, public posting, git push (no remote), platform-name.
   265	> ```
   266	>
   267	> *(The SLICE 1 block below is now historical — slice 1 is DONE + FULLY GATED + COMMITTED `4eed015`. Retained as lineage.)*
   268	> **▶▶ ROADMAP SLICE 1 — DRAFTER-RELIABILITY FIX: DONE + FULLY GATED + COMMITTED (push HELD, no remote). verify GREEN 305+5 + RED-GREEN-PROVEN (7 changes) + differential 20/20 UNTOUCHED; gate-2 CLEARED (final confirming Codex pass RAN → BLOCK 1 P2 honesty-wording → reconciled primary-model-final; mechanism Codex-confirmed) + acceptance-gate SHIP (gates 1/2/3/4/5). ▶ NEXT = SLICE 2 (the clean R-A3-9 live re-run) — OWNER GO GRANTED 2026-06-29 ("GO, batch the Codex review"); live spend ≤$5 hard cap, Codex review batched into the run. EXECUTE per the paste-ready prompt below (a FRESH session is recommended for clean context — the project's standing practice for live runs).**
   269	>
   270	> **WHERE IT LANDED (the budget-integrity arc — CLOSED).** Slice 1's CORE (instrument `finishReason` + disable Gemini thinking) was clean since Codex pass 1. FIVE Codex passes then hardened the *budget ledger* the pricing change pulled in — each found a DISTINCT real issue, all reconciled: pass-1 BLOCK 4 (SDK `maxRetries:2` broke the pre-call $5 bound → `maxRetries:0`; thinking tokens unpriced → price `output+reasoning`; +honesty +test-locks); confirm-1 BLOCK 1 (estimate didn't reserve reasoning → reserve the documented max thinking budget 24_576); confirm-2 BLOCK 1+P3 (24_576 is a SOFT limit not a hard cap → DOWNGRADE the claim to fail-closed best-effort + ADD a post-call `budget_overflow` stop that halts if any call bills above its reservation, covering the reasoning leg AND the input leg); confirm-3 (final, reset seat) BLOCK 1 P2 (two comments still said "true upper bound": `gemini.ts:179` + `evals/gemini.test.ts:97`) → reworded primary-model-final (`maxRetries=0` maps ONE reservation→ONE billed attempt; overflow bounded by the post-call stop). **Net: the $5 cap is an honest FAIL-CLOSED BEST-EFFORT bound** (conservative pre-call reserve + post-call overflow stop), no hard-guarantee overclaim — grep-confirmed clean; Codex CLEAN-confirmed the mechanism (overflow stop placement, cap+one-call bound, fail-closed, differential untouched). Records: `docs/reviews/codex-2026-06-29-slice1-drafter-reliability.md` (full arc + gate-2 CLEARED) + `slice1-drafter-reliability-verify-evidence.log` (RED-GREEN ×7).
   271	>
   272	> **⚠ OWNER NOTE (cost, retrospective):** slice 1 took 5 Codex passes (~1.2M shared-seat tokens) on budget-rigor that is largely a SLICE-2 (live-spend) concern — the budget code is first *exercised* at the live run. For SLICE 2, consider batching its Codex review with that run rather than separate passes. The slice is committed + honest now; this is a forward-efficiency note only.
   273	>
   274	> **THE ORDERED ROADMAP:** slice 1 ✅ DONE+COMMITTED → **2 R-A3-9 [OWNER-GATED] ← NEXT** → 3 §11.2 wiring decision → 4 A4 observability → 5 A5 integrations [OWNER-GATED] → 6 convergence → 7 deploy [OWNER-GATED].
   275	>
   276	> ### ▶ Paste-ready resume prompt — SLICE 2 (the clean R-A3-9 live re-run) — OWNER-GATED live spend (fresh session)
   277	>
   278	> ```
   279	> Resume ActivationOps AI autopilot — ROADMAP SLICE 2 (the clean R-A3-9 live re-run), goal mode, owner-gates HELD. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item). Re-derive git state live; do not trust SHAs in docs.
   280	>
   281	> DONE — do NOT redo: SLICE 1 (drafter-reliability fix) is DONE + FULLY GATED + COMMITTED (gate-2 CLEARED + acceptance-gate SHIP; verify 305+5; differential 20/20 untouched; full arc docs/reviews/codex-2026-06-29-slice1-drafter-reliability.md). The fix is WIRED OFFLINE only — the live parse-rate recovery is NOT yet proven; that is THIS slice.
   282	>
   283	> SLICE 2 — OWNER GO GRANTED (2026-06-29, via AskUserQuestion: "GO, batch the Codex review") + the Codex review is BATCHED into the live run (one cross-model pass on the live-run diff, not a separate pre-pass) per the owner cost-note. So: EXECUTE the live run — the $5 HARD CAP still bounds it; STOP + surface if spend approaches $5; flip ENABLE_LIVE_AI=true ONLY for the run, behind the cross-family gate, then restore. TASK = the authoritative clean R-A3-9 live cross-family run (Gemini Drafter ⊥ Groq judges) that A3-7 could not complete (provider-degraded): (1) re-anchor RULES §6 freshness (live Gemini model-id + pricing, dated); (2) $0 preflight (node --env-file=.env scripts-ts/gemini-preflight.mjs; never print the key); (3) build the FRESH held-out split + RE-PIN K, record it, never tune on test; (4) run the live harness on a fresh Groq window, UNDER the $5 cap (STOP if spend approaches $5); (5) MEASURE the parse-rate recovery — read finishReason LIVE (should no longer be "length"); (6) ADVISOR CARRY-FORWARD: re-confirm the Drafter still EARNS its label under disabled thinking (a reliability fix that quietly demotes the one earned agent is a ledger event, not a free win) — re-decide the 3 deferred labels honestly on the live evidence (anti-theater AM-7). Gate (BATCHED): npm run verify(:full) green → ONE Codex changed-files review via ~/claude-os/bin/codex-guarded on the live-run diff, reconciled primary-model-final → acceptance-gate SHIP; record in docs/reviews/. Commit owner-authorized; push HELD.
   284	>
   285	> Owner-gated stops HELD: live spend (slices 2+5, ≤$5), deploy, public posting, git push (no remote), platform-name.
   286	> ```
   287	>
   288	> *(The detail below is the as-of-build-time record — SUPERSEDED by the top block: gate-2 has since CLEARED [confirm-3 final BLOCK 1 P2 → reconciled], acceptance-gate is SHIP, the slice is COMMITTED, and the load-bearing change count is 7. The "NEXT = acceptance-gate" / "confirming re-pass OPTIONAL" lines are historical.)*
   289	> **WHAT SHIPPED (slice 1 — re-derive via `git diff`):** the A3-7 finding fixed — the live Gemini 2.5 Flash redraft failed to parse ~75% (`NoObjectGeneratedError` "could not parse the response"). **RULES §6 root cause confirmed (2 independent sources: ha-llmvision#609, vercel/ai#14377):** gemini-2.5-flash THINKS by default; thinking tokens bill against `maxOutputTokens` → a 2000 ceiling truncated the JSON (finishReason "length" = MAX_TOKENS). **(a) INSTRUMENT:** `lib/agents/draft.ts usageFromError` now merges the SDK error's TOP-LEVEL `finishReason` (it read only `err.usage` → finishReason silently dropped on exactly the failure path; verified vs installed `ai` typings + constructed a real `NoObjectGeneratedError`) → threaded onto `DraftResult.usage` → `lib/agents/loop/orchestrator.ts` draft/redraft `verdictSummary` (`; finishReason=length`). **(b) FIX:** `lib/agents/gemini.ts` — disabled thinking on the bounded draft (`thinkingConfig.thinkingBudget=0`/`includeThoughts=false` via a pure, unit-tested `liveGenerationOptions()`; confirmed forwarded in `@ai-sdk/google` v2.0.76 dist:1042) + raised `MAX_LIVE_OUTPUT_TOKENS` 2000→4096 (cheap insurance for the reported "ignores thinkingBudget=0" case; estimate ≪ $5). `{{MERCHANT}}` fidelity NOT implicated (anti-bloat — no change). Tests `evals/{gemini,draft,agent-loop}.test.ts` +4; **RED-GREEN proven** for all 3 changes (`docs/reviews/slice1-drafter-reliability-verify-evidence.log`).
   290	> **HONESTY BOUND (carry into slice 2):** this slice proves the instrumentation + that the fix is WIRED, OFFLINE/$0 — it does NOT prove the live parse-rate recovers. The owner-gated slice-2 R-A3-9 re-run is where finishReason is read live (should no longer be "length"), the parse rate is measured, AND — per the advisor — the Drafter is re-confirmed to still EARN its label under disabled thinking (a reliability fix that quietly demotes the one earned agent is a ledger event, not a free win).
   291	> **CODEX (RAN → reconciled):** the re-attempt ran (`gpt-5.5`@`xhigh`, read-only) → BLOCK 4 findings, ALL reconciled primary-model-final + the two P1s red-green-locked — F1 `maxRetries:0` (SDK default 2 broke the pre-call $5 bound), F2 price `output+reasoning` (thinking tokens were unpriced), F3 honesty-wording, F4 truncation test-locks (`docs/reviews/codex-2026-06-29-slice1-drafter-reliability.md`). A confirming Codex re-pass on the reconciled diff is an OPTIONAL dated obligation (the load-bearing fixes are red-green-locked + the acceptance-gate independently validates). NEXT = `acceptance-gate` → flip the slice gate to SHIP, record, THEN commit (owner-authorized per the roadmap directive; push HELD — no remote).
   292	> **THE ORDERED ROADMAP IS UNCHANGED** (the resume prompt below): slice 1 (this) → 2 R-A3-9 [OWNER-GATED] → 3 §11.2 wiring decision → 4 A4 observability → 5 A5 integrations [OWNER-GATED] → 6 convergence → 7 deploy [OWNER-GATED].
   293	>
   294	> *(The A3-7 block below is now historical — A3-7 is done + fully gated + committed `9bcfd37`; slice 1 is the first slice of the remaining-roadmap run it scoped.)*
   295	
   296	> **▶▶ A3-7 LIVE CROSS-FAMILY RUN — DONE + FULLY GATED + COMMITTED (2026-06-28, `9bcfd37`); PUSH HELD. ▶ NEXT (owner-scoped 2026-06-28 via AskUserQuestion) = COMPLETE THE WHOLE REMAINING BUILD ROADMAP except the visual/UI redesign, in a fresh session, all owner-gates HELD — first slice = a DRAFTER-RELIABILITY FIX.** A3-7 had **two deliverables with opposite outcomes:** **#1 DECIDE THE 3 DEFERRED LABELS → ✅ DONE + CLEAN** (all DEFER, **run-independent**: Strategist by construction [output never reaches the Drafter prompt], Domain Critic R-A3-8 policy-cap, Router `signals_differ=0` in BOTH live runs; Codex independently confirmed all three; ledger "1 earned (Drafter) + 3 deferred"). **#2 K RE-PIN / CONVERGENCE PROOF (R-A3-9) → ⚠️ INCOMPLETE (provider-degraded; K vacuous; authoritative run DEFERRED)** — do NOT read run #3's `test_meets_floor:true`/exit-0 as a pass (K=1; "1/9 ≥ 1" is empty). **Dominant finding: the live Gemini 2.5 Flash redraft FAILS TO PARSE ~75%** of the time (`"No object generated: could not parse the response"` — a structured-output failure hitting items 1/2/3 at iter-1 while Groq was healthy ⇒ a DRAFTER problem, INDEPENDENT of a separate Groq-window depletion on the final 4 test items; detection 11/16). Hypothesis (TO VERIFY): `MAX_LIVE_OUTPUT_TOKENS=2000` (`lib/agents/gemini.ts:108`) starves the THINKING model's JSON (check `finishReason==="length"`). **Safety HELD** (parse-failed → clean stub; non-converging HELD not sent; `assertEligibilityUntouched` never threw). **Cost ~$0.046 over 3 runs (« $5).** **GATED:** Codex BLOCK (1 P1 [`selfCorrected` `.some()` overcount → fixed to final-redraft + instrumentation] + 3 P2) → reconciled → CONFIRMING pass BLOCK (2 P2 honesty) → reconciled → **Codex gate DISCHARGED**; **acceptance-gate SHIP 5/5**. `verify` GREEN 297+5 + build; **differential 20/20 + ALL product agent code UNTOUCHED** (only the harness + frozen snapshot + docs changed). Records: `docs/a3-7-live-run-status.md` (freshness + pre-registration + SUPERSEDED run#1 + AUTHORITATIVE run#3) + `docs/reviews/codex-2026-06-28-a3-7-live-run.md`; frozen `lib/data/agent-loop.snapshot.json` (run #3, a DEGRADED DIAGNOSTIC labeled by a top-level `_caveat`; overwrote the A2 snapshot, preserved in git `7d3d8b5`; the served public fixture is built INDEPENDENTLY by `snapshot.ts` at $0). **COMMITTED owner-authorized via the RESUME DIRECTIVE (re-derive SHA via `git log`); PUSH HELD (no remote).** **The A3-7-authorized directive below is now HISTORICAL (A3-7 is executed, not pending).**
   297	>
   298	> ### ▶ Paste-ready resume prompt — COMPLETE THE REMAINING BUILD ROADMAP (except the visual/UI redesign), owner-gates HELD (owner-scoped 2026-06-28; fresh session)
   299	>
   300	> ```
   301	> Resume ActivationOps AI — COMPLETE THE REMAINING BUILD ROADMAP (except the visual/UI redesign), goal mode, owner-gates HELD. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item). Re-derive git state live; do not trust SHAs in docs.
   302	>
   303	> DONE — do NOT redo: A3-1..A3-6 (offline build) + A3-7 (live cross-family run) are COMPLETE + FULLY GATED + COMMITTED (9bcfd37). A3-7 DECIDED the 3 deferred labels — ALL DEFER (run-independent; "1 earned (Drafter) + 3 deferred"); do NOT re-litigate. A3-7's K/convergence is INCOMPLETE (provider-degraded; K vacuous) — EXPECTED + recorded.
   304	>
   305	> SCOPE (owner, 2026-06-28 via AskUserQuestion — "Whole remaining build roadmap" + "Keep it owner-gated"): drive the WHOLE remaining BUILD roadmap autonomously, in order, each slice GATED (npm run verify green → Codex changed-files review via ~/claude-os/bin/codex-guarded reconciled primary-model-final → acceptance-gate SHIP; record in docs/reviews/). EXCLUDED = the visual/UI redesign (the paused mockup-driven storytelling restyle of the console surfaces — a SEPARATE "design" session). Build/wire FUNCTIONALITY on the CURRENT design; do NOT do the aesthetic restyle. Keep lib/core + oracle + gold + the differential UNTOUCHED across all slices.
   306	>
   307	> THE ORDERED ROADMAP (canonical detail: docs/plan-multi-agent-execution.md §7 + ~/.claude/plans/gentle-forging-starlight.md Phases C/D):
   308	> 1. DRAFTER-RELIABILITY FIX (offline-first, $0; product code → full gate). The A3-7 finding: the live Gemini 2.5 Flash redraft FAILS TO PARSE ~75% ("No object generated: could not parse the response"). (a) VERIFY the cause — capture finishReason on the failed redraft (=== "length" confirms truncation); thread finishReason into DraftResult/trajectory so it's provable. (b) FIX — raise/justify MAX_LIVE_OUTPUT_TOKENS=2000 (lib/agents/gemini.ts:108) and/or configure the gemini-2.5-flash thinking budget for structured output (RULES §6 live model-config freshness); harden {{MERCHANT}} fidelity if implicated.
   309	> 2. CLEAN R-A3-9 RE-RUN — [OWNER-GATED: live spend]. On a FRESH Groq daily window, get authoritative K + self-correction; the harness already carries the corrected metric + instrumentation + the degraded flag (exercise the tightened selfCorrected live here). STOP + surface + get the GO before any live spend; $5 hard cap.
   310	> 3. §11.2 STRATEGIST→DRAFTER WIRING decision — the flagged spec-vs-impl gap (strategy/tone never reach the Drafter prompt). Decide: wire it (a drafter behavior change → could let the Strategist EARN its label → full gate + re-decide the ledger) OR keep it a documented recorded-seam. Consequential AI-behavior → surface the recommendation + get owner sign-off before wiring.
   311	> 4. A4 — OBSERVABILITY & "watch the agents reason" (FUNCTIONAL, not visual redesign): render the recorded $0 TrajectoryStep[] into the EXISTING console surfaces (folds the subsumed UI Stage-2 trajectory obligation); structured step capture / Langfuse (CORE). $0 REPLAY; built on the current design.
   312	> 5. A5 — LIVE INTEGRATION LAYER (transient demo) — [OWNER-GATED]. Slack approval → idempotent email (Resend/SMTP) → n8n run-on-demand glue; NO send without human approval; suppression-aware; the durable deliverable is a RECORDED WALKTHROUGH (the public artifact stays REPLAY-only). STOP at the A4→A5 boundary for the owner cost-vs-value check + before ANY live integration spend/external action.
   313	> 6. PHASE 6 — CONVERGENCE: eval-lock (trajectories + domain) → acceptance-gate → the portfolio/why-chain narrative → deploy prep.
   314	> 7. DEPLOY (Phase D) — [OWNER-GATED]: Vercel deploy (REPLAY-only public demo, key-gated so it can't spend), platform-name confirm + trademark/web check, the dual-layer why-chain docs, final cross-model review, owner approves public posting.
   315	>
   316	> OWNER-GATED STOPS (HELD — STOP + ask, do NOT proceed): any live API spend (steps 2 + 5; ≤$5 cap), deploy, public posting, git push (no remote), platform-name confirm, anything irreversible/external. Everything else is reversible/offline — drive it autonomously through the gates. Surface a blocker or an owner-gate; otherwise keep going.
   317	> ```
   318	>
   319	> *(The A3-7-authorized directive below is HISTORICAL — retained as lineage. A3-7 has since executed + gated + committed; resume from the block above.)*
   320	> **▶▶ RESUME DIRECTIVE (read FIRST) — when the owner says `resume` (or `continue` / `go`) in a NEW session: run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; `git status` + `git log --oneline -8`), re-derive git state live, then CONTINUE AUTONOMOUSLY (goal mode) — figure out each step yourself. Do NOT wait for a block to be pasted and do NOT ask "should I continue?". The ONLY hard stops are the owner-gated ones — `git push` (HELD: no remote target yet), deploy, public posting, spend > $5, **the A3-7 live Gemini run (live spend)** — and a genuine blocker; surface those. **THE A3-1..A3-6 OFFLINE MULTI-AGENT BUILD IS COMPLETE — A3-6 was the terminal offline slice; the ONLY remaining A3 work (A3-7) is owner-gated live spend, so there is no further reversible offline slice to drive.** **✅ THE BATCHED CODEX GATE IS DISCHARGED (2026-06-28, seat reset ~7:30 PM) — NO Codex batch remains.** The batched read-only review ran over `d60f66e`/`46f9a2b`/`b2852d9` → **A3-4 SHIP** (round-3 clean) / **A3-5 SHIP + 1 P2** / **A3-6 BLOCK + 1 P1 + 1 P3**; **all reconciled primary-model-final** (the P1 = the cross-family `fullyInjectedDI` hole the A3-6 wiring re-opened — fixed to require ALL FIVE live seams, RED-GREEN proven; the P2 = a Router-prompt "no injection surface" overclaim — fixed with the `{{MERCHANT}}` injection-cut; P3 = stale comments) → **two confirming re-passes → final VERDICT SHIP.** The A3-4 + A3-5 + A3-6 acceptance-gates are **SHIP 5/5** and the A3-1..A3-6 offline build is **FULLY GATED**. `verify` green **297+5** + build; differential 20/20 UNTOUCHED. Records: `docs/reviews/codex-2026-06-28-a3-batch-confirm.md` + `a3-batch-reconcile-evidence.log`; the 3 gate docs flipped SHIP 5/5, the 3 review docs stamped DISCHARGED. The reconciliation fixes are committed (owner-authorized via this directive; re-derive the SHA via `git log`); **push HELD (no remote).** A3-1, A3-2 (a+b), A3-3, A3-4, A3-5, A3-6 are ALL DONE + fully gated. Then **NEXT = A3-7, OWNER-GATED** (the live cross-family Gemini run — key + $5 cap + a live Gemini model-id/pricing freshness check per RULES §6 + a Codex cross-check; re-pin K on a fresh held-out split, R-A3-9; **the ONLY place the 3 deferred agent labels [Strategist · Domain Critic · Router] are decidable**). **A3-7 IS AUTHORIZED (owner GO 2026-06-28, via AskUserQuestion "Authorize A3-7 live run") — EXECUTE IT.** This is the live, metered, label-deciding slice; run it with full rigor (a fresh session is recommended for clean context — see the A3-7 resume prompt below). The $5 hard cap still bounds it; spend beyond $5 remains a hard stop. **ENV READY (verified 2026-06-28, owner pasted both keys):** `.env` holds a valid `GEMINI_API_KEY` (preflight `ListModels` 200 OK; `gemini-2.5-flash` AVAILABLE — RULES §6 freshness satisfied; newer `gemini-3.x`/`3.5-flash` also exist now = a separate owner+Codex model-choice if ever wanted) AND a valid `GROQ_API_KEY` (`openai/gpt-oss-120b` AVAILABLE). **`ENABLE_LIVE_AI` is still `false` (no spend armed) — the owner flips it to `true` at the A3-7 GO.** Env reference: `.env.example` (committed `8d46517`) + memory `env-keys-setup`. Re-run the $0 preflight before spending: `node --env-file=.env scripts-ts/gemini-preflight.mjs`.
   321	
   322	### ▶ Paste-ready resume prompt — A3-7 (the AUTHORIZED live cross-family run; fresh session, 2026-06-28)
   323	
   324	```
   325	Resume ActivationOps AI — A3-7 (the OWNER-AUTHORIZED live cross-family Gemini run), goal mode. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item). Re-derive git state live; do not trust SHAs in docs.
   326	
   327	DONE — do NOT redo: A3-1..A3-6 (the offline multi-agent build) is COMPLETE + FULLY GATED + committed (lineage through e59b5a8 = the batched-Codex-gate discharge). verify green 297+5 + build; differential 20/20 UNTOUCHED. The honest ledger = "1 earned (Drafter) + 3 deferred (Strategist · Domain Critic · Router)". Do NOT re-run the offline gates or re-review A3-4/5/6 — that gate is discharged (docs/reviews/codex-2026-06-28-a3-batch-confirm.md).
   328	
   329	A3-7 IS AUTHORIZED (owner GO 2026-06-28). TASK = the live cross-family run that DECIDES the 3 deferred labels (R-A3-7 + R-A3-9):
   330	(1) Re-anchor the RULES §6 freshness check at time of use: confirm the live Gemini model-id (default gemini-2.5-flash) + pricing against official docs, dated. Newer gemini-3.x exists — staying on 2.5-flash is the planned/calibrated default; switching is a consequential owner+Codex pick, not assumed.
   331	(2) $0 preflight: node --env-file=.env scripts-ts/gemini-preflight.mjs (ListModels 200; never print the key). Env is READY (.env has valid GEMINI_API_KEY + GROQ_API_KEY; ENABLE_LIVE_AI=false — flip to true ONLY for the run, behind the cross-family gate).
   332	(3) Build the FRESH held-out split (R-A3-9 — the stronger Gemini drafter changes the error distribution; evals/agent-loop.live.test.ts has a PLACEHOLDER split) and RE-PIN K on it; record the value; NEVER tune on the test split.
   333	(4) Run the live cross-family harness (Gemini Drafter ⊥ Groq judges; the loop gates on liveAiEnabled() && groqLiveEnabled() && resolvedJudgeProvider()==="groq" && resolvedDomainJudgeProvider()==="groq"; per-item judge.provider/domain.provider==="groq" asserts). Stay UNDER the $5 hard cap (sized demo-set × maxIterations × Flash price); STOP + surface if spend approaches $5.
   334	(5) DECIDE THE LABELS HONESTLY: for each deferred agent (Strategist / Domain Critic / Router), does the live LLM beat its strong deterministic baseline on the open-ended-quality axis scored by the INDEPENDENT cross-family Gemini judge? If yes → the label EARNS (flip the trajectory step to the agent name). If it ties/loses → it STAYS deferred (tool) and the "1 earned + N deferred" count is updated honestly. Either outcome is valid — anti-theater (AM-7).
   335	(6) Freeze the live trajectory fixture; gate: npm run verify(:full) green → Codex changed-files review via ~/claude-os/bin/codex-guarded (reconcile primary-model-final) → acceptance-gate; record in docs/reviews/. Commit owner-authorized; push HELD (no remote).
   336	
   337	Owner-gated stops: git push (HELD), deploy, public posting, spend > $5.
   338	```
   339	>
   340	> **▶ A3-6 BUILT + TEST-VERIFIED (gate-2 Codex NAMED-OPEN) (2026-06-28) — THE TERMINAL OFFLINE SLICE; the integrated multi-agent orchestrator is wired, the A3-1..A3-6 offline build is COMPLETE. `verify:full` green (296+5 + 4 e2e); acceptance-gate gates 1/3/4/5 PASS (no independent P0/P1), gate-2 named-open → flips SHIP 5/5 when the batched Codex returns. NEXT = A3-7 (OWNER-GATED live run) — autopilot STOPS here.**
   341	> **WHAT SHIPPED (A3-6 — WIRING, not new modules; re-derive via `git diff`):** `lib/agents/loop/orchestrator.ts` — the `recommend` default is now `strategistRecommend` (was `defaultRecommend`), the `reflect` default is now `routerReflect` (was the A3-5 interim `defaultReflect`, **removed as dead code**) — the A3-3 Gemini-Drafter pattern (OFFLINE → strong deterministic baseline `strongRecommend`/`strongReflection`, $0; LIVE → Groq behind the A3-7 gate). `defaultRecommend` + `buildReflection` stay exported (the Strategist/Router evals' RED baselines). `lib/agents/loop/trajectory.ts` — `A2_HONESTY_NOTE` rewritten with the honest framing. `lib/agents/loop/snapshot.ts` — fixture note reframed. `evals/agent-loop.test.ts` — +1 INTEGRATION PROOF.
   342	> **THE HONEST CONCLUSION (the integration honesty crux — gate-probed, holds):** offline (all that ships now) the loop is a **deterministic pipeline with multi-agent SEAMS + one genuinely-generative slot (the Drafter)**, and the artifact's own labels say exactly that — **"1 earned (Drafter) + 3 deterministic-tied components wired through the agent seams, NOT 'four agents reasoning'"**. ZERO `app/` surface overclaims (grep clean; the fixture isn't rendered yet; A3-6 touched no `app/` files). INTEGRATION PROVEN BY CONTENT (a test runs the loop with NO recommend/reflect injected → plan rationale carries `risk=`/`tenure=` [strongRecommend, not the naive default] + reflect surfaces `no_over_promise` [strongReflection reading the domain critic; buildReflection structurally cannot], `costUsd===0`; **executed red-green captured** — revert defaults → FAIL `/risk=/`; restore → pass). Tool-until-earned holds end-to-end (strategist/router/domain_critic ABSENT). **REALIZED LEDGER (all four BUILT + integrated): Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router DEFERRED.** Differential 20/20 UNTOUCHED; no import cycle.
   343	> **DATED OBLIGATION (the 3rd of three batched):** the A3-6 Codex changed-files review — SEAT-BLOCKED (~7:25 PM) — required before any irreversible step; flips the acceptance-gate to SHIP 5/5. Records: `docs/reviews/{codex,gate}-2026-06-28-a3-6*.md` + `a3-6-verify-evidence.log`.
   344	> **A3-6 IS THE TERMINAL OFFLINE SLICE (advisor):** whether the 3 deferred agents beat their deterministic baselines is decidable ONLY at the owner-gated A3-7 live run (real Gemini prose + cross-family Groq judge). **Autopilot stops at the A3-7 owner-gate (live spend).** There is no further reversible offline slice to drive.
   345	>
   346	> **▶ A3-5 BUILT + TEST-VERIFIED (gate-2 Codex NAMED-OPEN) (2026-06-28) — the Router/Conductor agent (4th + final). `verify` 295+5; acceptance-gate gates 1/3/4/5 PASS, gate-2 named-open → flips SHIP 5/5 when the batched Codex re-confirm returns. UNCOMMITTED; commit owner-authorized via the RESUME DIRECTIVE; PUSH HELD.**
   347	> **WHAT SHIPPED (A3-5 — re-derive via `git diff`):** `lib/agents/router.ts` (NEW) — `strongReflection` (STRONG deterministic multi-critic baseline + demotion fallback: reads BOTH critics, faithfulness-gating first then surfaces the advisory domain dimensions; a strict SUPERSET of the domain-blind `buildReflection`) + `routerReflect` (LLM Router, Groq `gpt-oss-120b`, DI/mock, **recommend-only** — route CLAMPED, never trusted; honest FAILED_TO_FALLBACK; no name-injection; `signals` recomputed structurally) + `criticSignals`. `lib/agents/loop/orchestrator.ts` (MOD) — a `reflect?: RouterFn` seam (default = domain-blind `defaultReflect`, **NO behavior change**; A3-6 wires the strong/LLM default) + `RevisionPlan`/`RouterFn`/`CriticSignal` types + `buildReflection` EXPORTED (the eval's RED baseline); the reflect step gets a **defensive merchant clone** + records `plan.route`/`holdForHuman` ADVISORY (recommend-only — RECORDED, never wired). `evals/router.test.ts` (NEW, 8) + `evals/agent-loop.test.ts` (MOD, +2: Router firewall + reflect-seam mutation-isolation).
   348	> **THE HONEST CONCLUSION (floor-not-ceiling — same as Strategist A3-2 + Domain Critic A3-4):** the anti-theater eval is RED `buildReflection` (domain-blind) → GREEN `strongReflection` (covers domain as a strict SUPERSET) → DEFER the mock Router ties `strongReflection` structurally. The defer is **STRUCTURALLY FORCED**: every OFFLINE discriminator is a finite axis a deterministic table reproduces by construction; an LLM earns only on an open-ended-quality axis scored by a CROSS-FAMILY Gemini judge ⇒ live ⇒ A3-7. So OFFLINE the Router CANNOT earn — the AM-7 bar working as designed. **REALIZED LEDGER (all four agents BUILT): Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router DEFERRED = "1 earned (generation) + 3 deferred (classify/decide)".** `router` ABSENT from the trajectory (tests assert it). RECOMMEND-ONLY enforced TWO ways (clamp + post-loop isolation + assertEligibilityUntouched); **clone red-green proven** (drop the reflect clone ⇒ mutation-isolation trips `R-LOOP-1b`; `docs/reviews/a3-5-verify-evidence.log`). Differential 20/20 UNTOUCHED.
   349	> **DATED OBLIGATION (batched with A3-4 round-3):** the A3-5 Codex changed-files review — SEAT-BLOCKED (~7:25 PM, raw surfaced, no retry) — required before any irreversible step (push / A3-7 live); flips the acceptance-gate to SHIP 5/5. Records: `docs/reviews/{codex,gate}-2026-06-28-a3-5*.md`.
   350	>
   351	> **▶ A3-4 BUILT + COMMITTED TEST-VERIFIED (gate-2 Codex NAMED-OPEN) (2026-06-28) — Domain Critic wired into the loop's VERIFY phase as the 2nd critic. `verify` 285+5; Codex round-1 BLOCK→6 reconciled, round-2 found 1 residual P1 (partial-DI) → patched + regression, round-3 re-confirm SEAT-BLOCKED (~7:25 PM) = DATED OBLIGATION; acceptance-gate gates 1/3/4/5 PASS, gate-2 named-open → flips SHIP 5/5 when round-3 returns. PUSH HELD (no remote).**
   352	> **WHAT SHIPPED (A3-4 — re-derive via `git diff`):** `lib/agents/loop/orchestrator.ts` — `judgeDomain` run in VERIFY when `gate.approvedForHumanReview` (R-DARCH-4), **ADVISORY** (verifyPassed finalized BEFORE it; nothing reads `lastDomain` into a gate — red-green: making the send depend on `domain_defective` → advisory test RED), **INDEPENDENT** (no faithfulness input; `domainSituation` withholds `diagnose().play`), recorded as a 2nd verify-phase step (agent `"tool"` — label DEFERS) + `lastDomain` (reset per iteration so a gate-blocked final draft surfaces null) + `finalVerify.domain` + a `"domain"` audit actor; the `live` gate extended to `crossFamilyReady` (incl. `resolvedDomainJudgeProvider()==="groq"`) with a **fail-closed throw** on a forced `live:true` that isn't FULLY-DI'd-or-ready (`fullyInjectedDI` = ALL three generates; `||`→`&&` was the round-2 fix — red-green: `||`→partial-DI attempts a real Gemini call, `&&`→throws). NEW `evals/domain-critic-antitheater.test.ts` (the R-A3-1 eval: live B1-frozen vs `mockDomainJudge` on held-out → TIE F1 1.00 → FLOOR-not-ceiling → DEFER). `evals/agent-loop.test.ts` (updated locked arrays [2 verify steps/iter] + advisory/independence + stale-`lastDomain` regression + forced-live fail-closed regression [no-DI/partial-DI throw, full-DI exempt]). `evals/agent-loop.live.test.ts` (domain-provider gate + per-item assert). `lib/agents/loop/snapshot.ts` (note). `docs/plan-multi-agent-execution.md` §11.
   353	> **HONEST EARNED-AGENT LEDGER (the material A3-4 finding):** **Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router pending A3-5.** Two of three non-Drafter agents now defer — their deterministic baselines (`strongRecommend`, `mockDomainJudge`) tie them on the current gold. The anti-theater discipline is refusing to overclaim; the discriminating evidence likely needs live Gemini prose (A3-7) or harder cases. The public "4 agents" claim stays correspondingly conservative.
   354	> **DATED OBLIGATION:** the A3-4 Codex round-3 re-confirm (seat-blocked ~7:25 PM) on the `fullyInjectedDI` fix + the `lastDomain` reset + the anti-theater DEFER — required before any irreversible step (push / A3-7 live); flips the acceptance-gate to SHIP 5/5. Records: `docs/reviews/{codex,gate}-2026-06-28-a3-4*.md`.
   355	>
   356	> **▶ A3-3 DONE + FULLY GATED (2026-06-28) — Drafter→Gemini cross-family OFFLINE machinery + §4.2 prevention. `verify` green 279+5; Codex BLOCK→6 reconciled primary-model-final→confirming SHIP; acceptance-gate 5/5 SHIP. Commit owner-authorized via THIS directive; PUSH HELD (no remote). NEXT = A3-4.**
   357	> **WHAT SHIPPED (on disk, A3-3 — re-derive via `git diff --name-only`):** (1) `lib/agents/loop/orchestrator.ts` — loop Drafter swapped `draftOutreachGroq`→`draftOutreach` (Gemini, cross-family); `live` default now `liveAiEnabled() && groqLiveEnabled() && resolvedJudgeProvider()==="groq"` (cross-family enforced, no half-live state); **cloned cumulative $5 ledger** accruing drafter + judge spend across re-drafts (the orchestrator clones per-run; the metered drafter bills every re-draft); honest comments/audit (`LIVE_AI_GEMINI`). (2) `lib/agents/draft.ts` — `instruction` (revision) on `draftOutreach`; shared `withRevision` moved here (R-LOOP-7); **`DOMAIN_HONESTY_RULES`** (KB §4.2, static + merchant-independent) added to the shared `buildPrompt`, **never enters the per-merchant `facts`** (R-A3-5). (3) `lib/agents/groq-draft.ts` — imports shared `withRevision`; header marks it the retained-but-UNWIRED A2 same-family reference. (4) `lib/agents/loop/trajectory.ts` — `A2_HONESTY_NOTE` reframed cross-family. (5) `lib/agents/loop/snapshot.ts` — served-snapshot DI usage `{0,0}` ($0); note reframed (live cross-family frozen at A3-7). (6) `evals/agent-loop.test.ts` — offline DI fixtures return usage `{0,0}` (LIVE_AI at known-$0); **2 new cost-integrity tests** (ledger accumulates real ¢ across re-drafts; UNKNOWN_USAGE fails closed in-loop → estimate, never $0). (7) `evals/agent-loop.live.test.ts` — repurposed into the **A3-7 cross-family harness skeleton** (gate on both keys + Groq judge; per-item `judge.provider==="groq"` assert; real cumulative outer ledger; PLACEHOLDER P3 split, fresh split + K re-pin deferred to A3-7; auto-skips offline). (8) `docs/{judge,domain}-calibration-status.md` — R-A3-8 note (directional label NOT upgraded by the loop; A3-4 wires the Domain Critic, not A3-3).
   358	> **CODEX GATE:** changed-files review → **BLOCK (6: 2 P1 + 2 P2 + 2 P3)** → ALL reconciled primary-model-final + re-verified green → **confirming re-pass SHIP** (gate FULLY DISCHARGED). The 2 P1s were the kind a green CI can't catch (the live harness auto-skips): **F1** the cross-family gate wasn't Groq-specific (`JUDGE_PROVIDER=gemini` could run Gemini-judges-Gemini under a cross-family banner) → fixed via `resolvedJudgeProvider()==="groq"` gate + per-item assert; **F2** the A3-7 harness's $5 ledger was vacuous (the orchestrator clones the budget) → harness now accrues `budget.spentUsd += result.costUsd` across items. P2: judge-spend accrual + placeholder-split wording. P3: Domain-Critic→A3-4 doc + a stale comment. Record: `docs/reviews/codex-2026-06-28-a3-3-drafter-gemini.md`.
   359	> **ACCEPTANCE-GATE:** BLOCK (substance SOUND — cross-family enforced by construction, §4.2 off the facts path, tool-until-earned type-enforced, $0-offline honest, snapshot honestly labeled; gates 4+5 PASS) → it caught **1 real record-honesty defect I'd introduced** (the review-record header asserted an unreceived "confirming SHIP") → fixed → all 3 flip conditions discharged (verify raw+**red-green** [disable the estimate-reservation ⇒ UNKNOWN_USAGE test RED `expected +0 to be close to 0.0056`; restore ⇒ GREEN]+git-diff · confirming Codex SHIP+header · grill-basis stated) → **re-stamp SHIP, 5/5 gates**. Record: `docs/reviews/gate-2026-06-28-a3-3.md`. Differential **20/20** UNTOUCHED. **Push HELD (no remote target; owner action).**
   360	>
   361	> **▶ A3-2a DONE + FULLY GATED + COMMITTED `32da7b1` (2026-06-28) — Strategist agent + anti-theater eval; `verify` green 277+4; Codex BLOCK→4 reconciled primary-model-final + test-locked → confirming re-pass SHIP (gate FULLY DISCHARGED). A3-1 is DONE + COMMITTED `ce21cf8`.** **Owner authorized commit + push for this slice after codex + reconciliation (2026-06-28); COMMIT done. ⚠️ PUSH BLOCKED — no git remote is configured (`git remote -v` empty); the push needs an owner-provided target (add a remote, or GO to create a GitHub repo via `gh` — account/visibility/name are the owner's call).**
   362	> **WHAT SHIPPED (on disk, A3-2a):** (1) `lib/agents/strategist.ts` — `strongRecommend` (the honest anti-theater BASELINE reading risk/tenure/engagement, which `diagnose().play` provably ignores) + envelope helpers `allowedRoute`/`clampRouteToEnvelope` + the LLM `strategistRecommend` (Groq `gpt-oss-120b`, DI `generate`, `StrategistOutputSchema` Zod, default-stub = `strongRecommend` $0, honest `FAILED_TO_FALLBACK`, **LLM route clamped — never trusted**, prompt withholds the raw merchant_name = no injection surface). (2) `lib/agents/loop/orchestrator.ts` — `RecommendFn` sync-or-async, `await recommend({ ...merchant }, …)` (defensive clone = recommend-only by ISOLATION), honest plan-step `modelMode` from `recommendation.mode`; **plan-step `agent` STAYS `tool`** (tool-until-earned). (3) `evals/strategist.test.ts` — `strongRecommend` units + the anti-theater eval (explicit RED-GREEN: naive baselines + risk-blind mock FAIL; strong + risk-aware mock PASS) + env-routing + prompt-wiring regressions. **Codex-reconciliation files:** `lib/server/env-flags.ts` (NEW `groqLiveEnabled` = `ENABLE_LIVE_AI && GROQ_API_KEY`), `lib/agents/groq-draft.ts` (same gate-fix), `evals/agent-loop.test.ts` (mutating-recommender regression).
   363	> **CODEX GATE:** changed-files review RAN → **BLOCK (4: 1 P1 + 2 P2 + 1 P3)** → ALL reconciled primary-model-final + fixed + test-locked (F1 Strategist live-gate misrouted via `JUDGE_PROVIDER` → `groqLiveEnabled`; F2 trajectory mode honesty; F3 prompt-wiring regression-lock; F4 recommend mutation-isolation). Record: `docs/reviews/codex-2026-06-28-a3-2a-strategist.md`. **Confirming re-pass on the FIXED diff = SHIP** — all 4 findings confirmed resolved, prior probes hold, differential lane untouched, tool-until-earned intact; **gate FULLY DISCHARGED**.
   364	> **THE HONEST CONCLUSION (floor-not-ceiling — advisor + Codex agree):** the structural discriminator (`caution`) is a finite enum a deterministic baseline computes perfectly, so the Strategist can at best **TIE** `strongRecommend` on it. A3-2's eval is therefore a NECESSARY anti-theater **FLOOR** (it FAILS a Strategist worse than the baseline — the inverse-costume failure), **NOT** a label-earning ceiling. So the `strategist` trajectory label **DEFERS to the A3-3 cross-family judge** (which can score open-ended strategy/tone synthesis); the plan-step `agent` stays `tool`; the public "4 agents" claim is "3 + a candidate" pending A3-3. **A3-2b = CONFIRMATORY only** (live $0 Groq: does the live LLM at least MATCH the floor?) — it is NOT seat-earning; the label defers regardless.
   365	> **⏭️ A3-2b ✅ DONE (2026-06-28)** — the live $0 Groq confirmatory eval CLEARED the pre-registered anti-theater floor (Low→`standard` 4/4, High→`elevated` 4/4; all `LIVE_AI`, $0; stable across reps). Verdict per the pinned bar: **viable candidate; the `strategist` label DEFERS to A3-3; count stays "3 agents + a candidate".** Records: `docs/strategist-confirmatory-status.md` + `lib/data/strategist-confirmatory.snapshot.json` + `evals/strategist.live.test.ts`. **Codex methodology review = BLOCK→2 reconciled primary-model-final + test-verified** (P1 cost-honesty: "$0" reframed to "free-tier, not metered" + RULES §6 freshness groq.com/pricing 2026-06-28 = $0.15/$0.60 per M; P3 stale comment; `docs/reviews/codex-2026-06-28-a3-2b-strategist-live.md`). **NEXT = A3-3** (Drafter→Gemini OFFLINE machinery + §4.2 prevention wiring + the cross-family judge that can finally certify the Strategist's open-ended value). **Push HELD by owner ("do it later", 2026-06-28) — committed locally; do NOT push without an owner-provided remote target + GO.** Owner-gated stops otherwise unchanged: deploy · public posting · spend > $5. Below: a (now-superseded) A3-2b resume prompt, then the A3-1-DONE lineage.
   366	
   367	### (SUPERSEDED — A3-2b is DONE; next = A3-3 per `docs/plan-multi-agent-execution.md` §11 + the RESUME DIRECTIVE at the top) Paste-ready resume prompt — A3-2b
   368	
   369	```
   370	Resume ActivationOps AI — A3-2b (the Strategist live $0 confirmatory eval), goal mode. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item). Re-derive git state live; do not trust SHAs in docs.
   371	
   372	DONE — do NOT redo: A3-2a is COMPLETE, fully gated, and COMMITTED (32da7b1 code + 0d1bd27 records). Built: the Strategist agent (lib/agents/strategist.ts — strongRecommend honest baseline + strategistRecommend LLM on Groq, route-clamped, no-name-injection), the async RecommendFn + defensive clone-isolation (lib/agents/loop/orchestrator.ts), the anti-theater eval (evals/strategist.test.ts), and groqLiveEnabled (env-flags.ts + groq-draft.ts). verify green 277+4; differential 20/20 UNTOUCHED. Codex BLOCK→4 reconciled primary-model-final + test-locked → confirming re-pass SHIP (gate FULLY DISCHARGED; docs/reviews/codex-2026-06-28-a3-2a-strategist.md). PUSH is owner-authorized but HELD (no git remote; owner sets a target later — do NOT push without a target + the owner's GO).
   373	
   374	A3-2b TASK = the Strategist live $0 CONFIRMATORY eval (NOT seat-earning — the `strategist` label DEFERS to A3-3 regardless; floor-not-ceiling). Steps: (1) PRE-REGISTER the floor bar in a status doc BEFORE reading any number — the Strategist must at least MATCH strongRecommend on the structural caution axis over the labeled same-play.touch/different-risk pairs and must NOT score WORSE (worse = FAILS the anti-theater floor). (2) Run strategistRecommend LIVE on free Groq gpt-oss-120b (key in gitignored .env; $0; needs ENABLE_LIVE_AI + GROQ_API_KEY; pace against the 200K/day window; re-verify gpt-oss-120b non-deprecation per RULES §6). (3) Read the result vs the pre-registered bar; record honestly in docs/reviews/. (4) Verdict: the structural axis is deterministically matchable, so EXPECT a tie → keep the plan-step agent "tool" + strongRecommend, DEFER the strategist label to the A3-3 cross-family judge, and keep the public count at "3 agents + a candidate". A genuine open-ended improvement is a bonus but is NOT decidable with same-family tools here. Gate: npm run verify green → Codex changed-files review via ~/claude-os/bin/codex-guarded (pass the prompt as an arg AND close stdin < /dev/null; reconcile primary-model-final) → record in docs/reviews/. Commit is owner-authorized; push stays HELD pending the owner's remote target.
   375	
   376	THEN A3-3 (Drafter→Gemini OFFLINE machinery + §4.2 prevention wiring + the cross-family judge that can finally certify the Strategist's open-ended value). A3-7 live Gemini is OWNER-GATED (key + $5 + freshness + Codex). Owner-gated stops: deploy · public posting · spend > $5 · git push (held).
   377	```
   378	>
   379	> **✅ A3-1 DONE (2026-06-27) — trajectory `agent` attribution (R-A3-6); test-verified + fully gated; COMMITTED `ce21cf8` (push owner-gated). ▶ NEXT = A3-2 (Strategist agent + anti-theater seam-eval vs `diagnose().play`).** R-A3-6 landed in 3 code files (re-derive via `git diff --name-only`): `lib/agents/loop/trajectory.ts` (new `TrajectoryAgent` type + a **required** `agent` field on `TrajectoryStep`), `lib/agents/loop/orchestrator.ts` (all `record()` sites attributed), `evals/agent-loop.test.ts` (2 new R-A3-6 tests + served-snapshot agent lock). **Honesty rule = tool-until-earned (AM-2/R-A3-1, advisor-cross-checked): only the genuinely-GENERATED `drafter` is an agent today; plan/verify/reflect/route + the fed-in `seedDraft` fixture = `tool`; `strategist`→A3-2, `domain_critic`→A3-4, `router`→A3-5, each IFF it clears its anti-theater seam-eval. Tests assert those three are ABSENT.** `lib/core` + oracle + gold + frozen snapshots UNTOUCHED (differential 20/20). **GATE (per-slice A3 process):** `npm run verify` **exit 0 — 257 passed + 4 skipped**, typecheck/lint/build green. **Codex changed-files review RAN → BLOCK (2 findings, 1 P1 + 1 P2) → BOTH reconciled primary-model-final + fixed + test-locked** (P1: seed branch was mislabeled `drafter` — a fixture is not Drafter-produced → now `tool`; P2: test didn't exercise the seed branch → added seeded red-green test). **RED-GREEN PROVEN** (revert seed `tool`→`drafter` ⇒ seeded test FAILS at `agent-loop.test.ts:365` `expected 'drafter' to be 'tool'`; restore ⇒ 12/12). Record: `docs/reviews/codex-2026-06-27-a3-1-trajectory-agent.md`. **acceptance-gate: SHIP (all 5 gates — formal re-stamp completed 2026-06-27 post-limit-reset; the gate cross-checked the gate-3 red-green evidence against source it read independently). Codex: BLOCK → 2 findings reconciled → CONFIRMING re-pass SHIP ("Confirmed clean", all 5 points). BOTH recommended obligations DISCHARGED — A3-1 is 100% CLOSED.** Records: `docs/reviews/{gate,codex}-2026-06-27-a3-1*.md`. Remaining standing items are only the unchanged owner-gated stops: commit · push · live Gemini spend · the A3-7 live run. **If resuming cold: A3-1 code is DONE + green on disk — do NOT re-write it; go to A3-2.** Codex INVOCATION NOTE: pass the prompt as an arg AND close stdin (`< /dev/null`) or `codex exec` blocks. **Commit owner-gated.** Everything below is the prior (committed) A3-0 design-pass record.
   380	>
   381	> **▶ A3 DESIGN/PLAN PASS DONE (2026-06-26) — the architecture is settled, advisor-cross-checked, and OWNER-GATED; the detailed buildable spec is written. ▶ NEXT = BUILD A3 offline-first, slice by slice.** A3 opened (per Rule 0) with a design pass, not code. Settled: (1) the 4-agent boundary against AM-2 — **owner chose "Target the full 4"** (AskUserQuestion 2026-06-26): build Strategist/Planner · Drafter · Domain Critic · Router/Conductor as four LLM agents, **each gated by an anti-theater seam-proof** (a component eval showing it beats its deterministic counterpart — Strategist vs `diagnose().play`, Router vs `buildReflection`); any that fails → demoted to a tool/conductor + the "4 agents" claim corrected (AM-2/AM-7). (2) The Drafter↔Domain-Critic data contract (parallel + independent critics; the Domain Critic withholds `diagnose().play`, R-DARCH-2, and stays advisory). (3) §4.2 prevention → the Drafter prompt (RAG stays off the per-merchant facts). **Advisor cross-check folded in** (the inverse failure — a deterministic conductor in an agent costume — is the credibility risk; both judges stay Groq while the Drafter→Gemini swap restores cross-family R-ARCH-3; add per-`agent` trajectory attribution now; HOLD the "directional" label — the judges were calibrated on the synthetic gold set, not yet on live Gemini prose; re-set K for the stronger drafter). **Durable plan: `docs/plan-multi-agent-execution.md` §11** (R-A3-1..9 + the build DAG A3-0..8); decision-log row 2026-06-26 ("A3 agent count = the full 4"). **No code written; no product file changed this pass.** git: HEAD `50bbfc8`, tree clean but for untracked tooling; B2 committed `6ea0549` + `50bbfc8`; push owner-gated.
   382	>
   383	> **State:** A3-0 (design/plan + decision + owner GO) ✅. **NEXT = A3-1** (trajectory `agent` attribution — small, enabling, **offline $0**) → A3-2 Strategist (Groq + seam-eval vs `diagnose().play`) → A3-3 Drafter→Gemini offline machinery + §4.2 wiring → A3-4 Domain Critic as 2nd critic → A3-5 Router agent + seam-eval vs `buildReflection` (R-LOOP-8b red-green stays) → A3-6 orchestrator + $0 agent-attributed trajectory fixture + verify:full. **A3-1..A3-6 are mock/DI, $0; only A3-7 spends.** Gate EACH slice: `npm run verify` green → Codex changed-files review via `~/claude-os/bin/codex-guarded` reconciled primary-model-final → `acceptance-gate` SHIP; record in `docs/reviews/`. **OWNER CHOICES at this gate:** (a) optional Codex *adversarial review of the A3 plan* (§11) before building — the full-loop plan gate (per-slice Codex reviews also cover it); (b) **drive mode** — manual slice-by-slice, or toggle `/autopilot` + an A3-scoped `/goal "build to A3-6 offline-machinery green, STOP before the A3-7 live run"`; (c) **A3-7 live Gemini run is owner-gated** (key + $5 cap + live model-id/pricing freshness check, RULES §6 + Codex). Owner-gated stops unchanged: deploy · public posting · spend > $5 · git push.
   384	
   385	### ▶ Paste-ready resume prompt — A3 BUILD (fresh session, 2026-06-26)
   386	
   387	```
   388	Resume ActivationOps AI — A3 BUILD (the multi-agent split), goal mode. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item). Re-derive git state live; do not trust SHAs in docs.
   389	
   390	DONE — do NOT redo: B2 is COMPLETE + Codex-SHIP (committed 6ea0549 + 50bbfc8). The A3 DESIGN/PLAN pass is DONE: owner chose "the full 4" agents (Strategist/Planner · Drafter · Domain Critic · Router/Conductor), each gated by an anti-theater seam-proof. The buildable spec is docs/plan-multi-agent-execution.md §11 (EARS R-A3-1..9 + the build DAG A3-0..8); decision-log row 2026-06-26 "A3 agent count = the full 4". No code was written in the design pass. Do NOT re-plan — BUILD.
   391	
   392	A3 TASK = execute the §11 DAG offline-first, slice by slice, starting at A3-1. BINDING INVARIANTS (R-A3-1..9 in §11): each of the 4 agents must clear its anti-theater seam-eval or be demoted + the count claim corrected (R-A3-1); Drafter=Gemini Flash while BOTH judges stay Groq → cross-family R-ARCH-3 restored (R-A3-2); assertEligibilityUntouched + R-LOOP-1b/8b stay green — agents (incl. the Router) RECOMMEND only, eligibility/send stay deterministic (R-A3-3); the Domain Critic is advisory + independent + withholds diagnose().play (R-A3-4); KB §4.2 prevention → the Drafter prompt, never the per-merchant factual path (R-A3-5); add an `agent` attribution to TrajectoryStep (R-A3-6); HOLD the "calibrated — directional" judge labels — not re-calibrated on live Gemini prose (R-A3-8); re-pin K on a fresh held-out split at the live gate (R-A3-9). Build A3-1..A3-6 as mock/DI, $0. Gate EACH slice: npm run verify green → Codex changed-files review via ~/claude-os/bin/codex-guarded reconciled primary-model-final → acceptance-gate SHIP; record in docs/reviews/. lib/core + oracle + gold + frozen snapshots UNTOUCHED (differential stays 20/20).
   393	
   394	A3-7 (the live cross-family Gemini run) is OWNER-GATED: key + $5 cap + a live Gemini model-id/pricing freshness check (RULES §6) + a Codex cross-check (R-A3-7). STOP and surface before any live spend. Owner-gated stops unchanged: deploy · public posting · spend > $5 · git push.
   395	```
   396	
   397	> ---
   398	> *(The B2-COMPLETE block below is now historical — B2's ship-gate is fully discharged and A3 has since been planned; retained as the lineage record.)*
   399	
   400	> **▶ B2 COMPLETE (2026-06-26) — the mandatory Codex changed-files review + §4.2 cross-check RAN on the reset seat → VERDICT SHIP. The B2 ship-gate is FULLY DISCHARGED. ▶ NEXT = A3.** The OPEN dated obligation is discharged: the COMPLETE read-only Codex review (`gpt-5.5` @ `xhigh`, full run ~212.5k tokens via `~/claude-os/bin/codex-guarded`) returned **SHIP**, all **4 targets CONFIRMED** (advisory invariant = structurally-inert leaf, `outreachStatus = m.outreach_status`, protects the FUTURE LIVE judge too · the ~75% mock-flag surface reads honestly · audit wording honest · **§4.2 non-redundancy confirmed against the REAL gatekeeper + faithfulness code**, the "mirrors faithfulness" discharge rejected), **3 findings (1 P2 + 2 P3) ALL accepted + fixed + re-verified primary-model-final**: (F1, P2) Human-gate copy "Eligible and clean" → "Eligible by the deterministic core" + an advisory note when `domain_defective` (honest + reinforces AM-4 on the surface); (F2, P3) the audit-wording test now bans `reject|block|gate|hold|prevent` on flagged entries; (F3, P3) the §4.2 demo test exercises the wired `mockDomainJudgeResult().verdict`. Codex also confirmed `AuditEntrySchema` is enforced (not cosmetic) + the 5→8 renumber is correct, and did NOT push to break the advisory invariant. **`npm run verify` green = 255 + 4 skipped; e2e 4/4** (one first-navigation Playwright flake, clean on re-run — reported honestly). `lib/core` + oracle + gold + frozen snapshot UNTOUCHED (differential 20/20).
   401	>
   402	> **State:** B2 committed `6ea0549`; the **reconciliation fixes are committed on top** as a separate reconciliation commit (`app/merchant/[id]/page.tsx` · `evals/replay.test.ts` · the 2 review docs · state-doc sync — re-derive the SHA live). Records: `docs/reviews/codex-2026-06-26-b2-domain-shipgate.md` (verdict verbatim + reconciliation table) + `docs/reviews/gate-2026-06-26-b2-domain-shipgate.md` (gate-2 flipped CLEARED). **Push remains owner-gated.** **NEXT = A3** — split the single-agent loop into the 4 bounded agents (Strategist/Planner · Drafter · Domain Critic · Router; Gemini Flash drafter within the code-enforced $5 cap + cross-family Groq judge; feed KB §4.2 into the Drafter per the §4.2 prevention half). Gate each A3 phase (Codex via `codex-guarded` + acceptance-gate; record in `docs/reviews/`). Owner-gated stops unchanged: deploy · public posting · spend > $5 · git push.
   403	
   404	### ▶ Paste-ready resume prompt — A3 (fresh session, 2026-06-26)
   405	
   406	```
   407	Resume ActivationOps AI — A3 (the multi-agent split), goal mode. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item). Re-derive git state live; do not trust SHAs in docs.
   408	
   409	DONE — do NOT redo: B2 is COMPLETE. The domain judge is wired into the REPLAY ship-gate as the tertiary ADVISORY control (committed 6ea0549). The mandatory Codex changed-files review + §4.2 cross-check RAN on the reset seat → VERDICT SHIP, all 4 targets CONFIRMED, 3 findings (1 P2 + 2 P3) all fixed + re-verified primary-model-final + committed on top (docs/reviews/codex-2026-06-26-b2-domain-shipgate.md). verify green 255+4; e2e 4/4; differential 20/20; lib/core + oracle + gold + frozen snapshot UNTOUCHED. Push stays owner-gated. Do NOT re-run the B2 Codex gate.
   410	
   411	A3 OPENS WITH A DESIGN/PLANNING PASS, NOT CODE (Rule 0 — architecture is top-tier judgment work): settle, with an advisor consult + a gated plan BEFORE writing any agent — (a) the 4-agent boundary: where is judgment REAL vs where a deterministic tool belongs (AM-2 — do not turn a factual/safety step into an agent); (b) the Drafter↔Domain-Critic data contract (what each agent sees + returns, and how the Critic's verdict stays advisory); (c) the §4.2-prevention prompt wiring into the Drafter. Plan it, gate the plan, THEN build. A3 TASK = split the single-agent loop into the 4 BOUNDED agents — Strategist/Planner · Drafter · Domain Critic · Router/Conductor — on the Vercel `ai` SDK (no LangGraph; the A2 framework decision). The Drafter uses Gemini Flash within the CODE-ENFORCED $5 cap (lib/agents/budget.ts ledger, fail-closed); the Domain Critic uses the cross-family Groq judge (restores R-ARCH-3 cross-family). FEED KB §4.2 (the prevention rule from knowledge/domain/merchant-activation-kb.md) into the Drafter prompt = the prevention half of the §4.2 defense-in-depth decision. BINDING INVARIANTS (do not break): the agents RECOMMEND only — eligibility/approval/the simulated_sent transition stay deterministic + test-locked (AM-4 / R-LOOP-1b / R-LOOP-8b); deterministic-first held (facts/safety stay deterministic tools; an agent only where judgment is real, AM-2); cross-family at the critic (AM-3); a $0 REPLAY-recordable trajectory. Build OFFLINE machinery first (mock/DI), $0; live runs are owner-gated on the key + the $5 cap. Gate each phase: npm run verify green + a Codex changed-files review via ~/claude-os/bin/codex-guarded (reconcile primary-model-final, record in docs/reviews/) + acceptance-gate. Spec: docs/plan-multi-agent-execution.md (A3). Owner-gated stops: deploy · public posting · spend > $5 · git push.
   412	```
   413	
   414	> ---
   415	> *(The B2-Codex-OPEN block below is now historical — B2's Codex gate has since CLEARED + reconciled, SHIP; retained as the lineage record.)*
   416	
   417	> **▶ B2 (2026-06-26) — domain judge WIRED into the REPLAY ship-gate as the tertiary ADVISORY control. Test-verified + acceptance-gate-reconciled. The mandatory Codex changed-files review + §4.2 cross-check are OPEN — a DATED OBLIGATION (seat usage-limited mid-review; reset ~8:31 PM). COMMITTED `6ea0549` (owner GO 2026-06-26); push owner-gated.** Wired the calibrated domain judge in as the tertiary control (R-DARCH-4: gatekeeper → faithfulness → domain), `$0` mock in REPLAY, surfaced + audited like the faithfulness `judge` field: `ReplayMerchant.domainJudge` (run via `mockDomainJudgeResult` ONLY when `gatekeeper.approvedForHumanReview`, parallel-gated to faithfulness) · a `"domain"` `AuditEntry` actor (after `judge`, before `eval`) · a Merchant-Detail "5 · Domain quality check" panel (Eval→6/Human→7/Audit→8). The judge is **ADVISORY — it never changes `outreachStatus`/eligibility/the send; red-green PROVEN** (mutating `outreachStatus` to depend on `domain_defective` → `replay.test.ts:79` RED; restore → GREEN). **§4.2 non-redundancy DEMONSTRATED** (advisor caught `no_over_promise` fired 0/20 → added a test: the gatekeeper APPROVES + the faithfulness judge PASSES + only `no_over_promise` FAILS on implied-typicality hype). `verify` green **255 + 4 skipped**; differential **20/20** (`lib/core`+oracle+gold+frozen snapshot UNTOUCHED); e2e 4/4. 6 files: `lib/replay/run.ts` · `lib/agents/tools/schemas.ts` (mirror-fix: `"domain"` into `AuditEntrySchema`) · `lib/agents/domain-judge.ts` (comment-only secondary→tertiary) · `app/merchant/[id]/page.tsx` · `evals/replay.test.ts` · `evals/e2e/console.spec.ts`.
   418	>
   419	> **`acceptance-gate` = BLOCK (procedural — no hard P0/P1; all 5 invariants honored on its read + the advisor agreed).** Gate-3 (verify) CLEARED with raw + red-green evidence; its 3 non-blocking items addressed (75%-stub-flag credibility framing · audit wording · secondary→tertiary). **Gate-2 (Codex) OPEN:** the seat smoke-tested ALIVE (`SEAT_OK`), the read-only review ran + surfaced **1 real finding** — a false "never auto-sent" panel claim contradicting the advisory design — **fixed + reconciled primary-model-final** — then hit the usage limit mid-review (raw error surfaced verbatim; no retry/downgrade per doctrine). **Until Codex completes, the acceptance-gate verdict remains BLOCK by its own design; committing = the owner choosing to proceed test-verified with that gate NAMED-OPEN (per the A1/A2 precedent), NOT "gates passed."** Gate record: **`docs/reviews/gate-2026-06-26-b2-domain-shipgate.md`** (4 concrete Codex targets inside).
   420	>
   421	> **NEXT: (1) commit-GO** (RULES §12) on the test-verified basis; **(2) when the Codex seat resets (~8:31 PM): run the COMPLETE changed-files review + §4.2 cross-check** (read-only over the 6-file diff, the 4 targets in the gate record) → reconcile primary-model-final → record in `docs/reviews/codex-2026-06-26-b2-*.md`; **(3) then A3** (the 4 bounded agents — Strategist/Planner · Drafter · Domain Critic · Router; Gemini Flash drafter ≤ $5 + cross-family Groq judge; feed KB §4.2 into the Drafter per the §4.2 prevention half). Owner-gated stops unchanged: deploy · public posting · spend > $5 · git push.
   422	
   423	### ▶ Paste-ready resume prompt — B2 Codex-completion → A3 (fresh session, 2026-06-26)
   424	
   425	```
   426	Resume ActivationOps AI — B2 → Codex completion → A3, goal mode. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item). Re-derive git state live; do not trust SHAs in docs.
   427	
   428	DONE — do NOT redo: B2 wired the calibrated domain judge into the REPLAY ship-gate as the tertiary ADVISORY control ($0 mock; ReplayMerchant.domainJudge gated on gatekeeper.approvedForHumanReview, parallel to faithfulness; "domain" audit actor after judge/before eval; Merchant-Detail "5 · Domain quality check" panel; Eval->6/Human->7/Audit->8). The judge is ADVISORY — it NEVER changes outreachStatus/eligibility/the send (red-green proven at replay.test.ts:79). §4.2 non-redundancy is DEMONSTRATED (gatekeeper APPROVES + faithfulness PASSES + only no_over_promise FAILS on implied-typicality hype). verify green 255+4 skipped; differential 20/20; e2e 4/4. lib/core + oracle + gold + the frozen calibration snapshot UNTOUCHED. B2 is COMMITTED as 6ea0549 (do NOT re-commit it); push stays owner-gated. Gate record: docs/reviews/gate-2026-06-26-b2-domain-shipgate.md. Go straight to the Codex completion below.
   429	
   430	OPEN — the ONE B2 gate left = the mandatory Codex changed-files review + the §4.2 consequential-recommendation cross-check (the seat was usage-limited mid-review ~8:31 PM; it surfaced + I fixed 1 finding — the "never auto-sent" copy contradiction). On a fresh seat: ~/claude-os/bin/codex-guarded exec -s read-only -o /tmp/codex-verdict-activationops-b2.txt over the 6-file diff (HEAD vs working tree, or the commit if committed), with the 4 concrete targets in the gate record: (1) does anything let domain_defective reach outreachStatus/eligibility/the send? (2) is the 75% domain_defective demo rate honest/credible on the public surface? (3) is the audit wording misleading for a simulated_sent merchant? (4) the §4.2 cross-check — is "keep no_over_promise gating (detection) while the judge never gates the send" correct + non-redundant with faithfulness (a demonstration test exists — confirm/refute it)? Reject the "mirrors the already-reviewed faithfulness field" argument (per-slice gate; §4.2 is a fresh owner decision). Reconcile primary-model-final, record in docs/reviews/codex-2026-06-26-b2-*.md.
   431	
   432	THEN A3: split into the 4 bounded agents (Strategist/Planner · Drafter · Domain Critic · Router); Gemini Flash drafter within the code-enforced $5 cap + cross-family Groq judge; feed KB §4.2 into the Drafter prompt (the §4.2 prevention half). Gate each phase (Codex via codex-guarded + acceptance-gate; record in docs/reviews/). Owner-gated stops: deploy · public posting · spend > $5 · git push.
   433	```
   434	
   435	> ---
   436	> *(The B1-DONE block below is the prior, now-historical handoff — retained as the lineage record; B2 supersedes it.)*
   437	
   438	> **▶ B1 DONE ✅ — the mandatory Codex cross-model gate RAN + reconciled; the domain judge is now "calibrated — directional, pending the ~100 floor" (2026-06-26).** The ONE open B1 gate is discharged: `~/claude-os/bin/codex-guarded review --base 07e9a55` (gpt-5.5 @ xhigh, full B1 diff `07e9a55..HEAD`) → **2 P2 *code* findings, 0 P0/P1** → both reconciled primary-model-final + **fixed + test-locked**: (B1-1) a partial live verdict now fails closed to the mock (`INCOMPLETE_VERDICT`) so an omitted dimension can't read as passing; (B1-2) the live gate reads the `DOMAIN_JUDGE_*` env (new `domainJudgeLiveEnabled()`), not the faithfulness `JUDGE_*`. The calibration result is **provably unchanged** (ran via explicit `live:true` / default-groq). `verify` green **250 + 4** (was 243; +7 lock tests). Gate record: **`docs/reviews/codex-2026-06-26-b1-domain-judge.md`**. **The "calibrated" word is carried by** the cleared pre-registered bar + eval-lock + the independent acceptance-gate + the R-DARCH-2 leak-check (a code-scoped `codex review` does NOT bless a synthetic-gold / n=18 number); **R-DHON-1's ~100 floor keeps the metric directional.**
   439	>
   440	> **✅ COMMITTED 2026-06-26 as `c0eb889` (owner GO via "continue" on the commit-GO ask).** This reconciliation introduced the word "calibrated" into the project's honesty-sensitive docs (a public-claim change) — owner-approved; **push remains owner-gated** (RULES §12). Changed: `lib/agents/domain-judge.ts` · `lib/server/env-flags.ts` · `evals/domain-judge.test.ts` · `evals/domain-calibration.live.test.ts` · `evals/domain-calibration.lock.test.ts` · `docs/domain-calibration-status.md` · `docs/reviews/codex-2026-06-26-b1-domain-judge.md` (new) · `docs/reviews/gate-2026-06-26-b1d-live.md` · `docs/reviews/gate-2026-06-26-b1-offline.md` · `PROJECT_STATE.md` · `CURRENT_TASK.md` · `HANDOFF.md` · `docs/task-log.md` · `docs/implementation-journal.md`.
   441	>
   442	> **NEXT = B2 — §4.2 DECIDED (owner, 2026-06-26): keep `no_over_promise` gating (detection) + feed KB §4.2 into the A3 Drafter (prevention) = defense in depth.** B2 = wire the domain judge into the ship gate as the **tertiary** control (R-DARCH-4: gatekeeper → faithfulness → domain), mock-in-REPLAY ($0), surfaced + audited like the faithfulness `judge` field in `lib/replay/run.ts` (`docs/domain-calibration-status.md` "Forward decision" + decision-log 2026-06-26). → **A3** (4 bounded agents — Strategist/Planner · Drafter · Domain Critic · Router; Gemini Flash drafter ≤ $5 + cross-family Groq judge; feed KB §4.2 into the Drafter per the §4.2 decision) → **A4** (observability + $0 REPLAY trajectory view). Gate each phase (Codex via `codex-guarded` + acceptance-gate; record in `docs/reviews/`). **Owner-gated stops unchanged:** deploy · public posting · spend > $5 · git push.
   443	
   444	### (SUPERSEDED — B2 is now BUILT; use the B2 Codex-completion → A3 prompt at the top) Paste-ready resume prompt — B2 setup (2026-06-26)
   445	
   446	```
   447	Resume ActivationOps AI — B2, goal mode. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item). Re-derive git state live; do not trust SHAs in docs.
   448	
   449	DONE — do NOT redo (committed c0eb889): B1 domain-quality "Effective"-axis judge = "calibrated — directional, pending the ~100 floor". The live calibration cleared all 7 pre-registered thresholds, eval-locked, and the mandatory Codex cross-model gate RAN + reconciled (2 P2 code fixes, test-locked; docs/reviews/codex-2026-06-26-b1-domain-judge.md). verify green 250+4. lib/core + oracle + gold + the frozen calibration snapshot are UNTOUCHED.
   450	
   451	§4.2 DECIDED (owner, 2026-06-26, AskUserQuestion): KEEP no_over_promise as a gating domain dimension (detection) AND feed KB §4.2 into the A3 Drafter prompt (prevention) = defense in depth. Why it is NOT redundant with faithfulness: the faithfulness judge checks per-claim entailment vs the merchant's OWN data row; no_over_promise catches implied-typicality / general-hype / fabricated-urgency that has no data field to entail against (KB §4.2 rule 1). Recall-favoring, never auto-rejects. Rationale: docs/domain-calibration-status.md "Forward decision" + decision-log 2026-06-26.
   452	
   453	B2 TASK = wire the domain judge into the ship gate as the TERTIARY control (R-DARCH-4: gatekeeper -> faithfulness -> domain), mock-in-REPLAY ($0), surfaced + audited — mirror the faithfulness `judge` field in lib/replay/run.ts: add domainJudge: DomainJudgeResult | null to ReplayMerchant, run mockDomainJudgeResult ONLY when gatekeeper.approvedForHumanReview (else null), add a "domain" AuditEntry actor, and surface the 3 per-dimension verdicts on Merchant Detail. Keep no_over_promise inside domain_defective (the §4.2 decision). lib/core + oracle + gold + the frozen snapshot UNTOUCHED. Gate the slice: npm run verify green + a Codex changed-files review via ~/claude-os/bin/codex-guarded (reconcile primary-model-final, record in docs/reviews/) + acceptance-gate; get a Codex cross-check on the §4.2 wiring (consequential-recommendation rule). THEN A3 (the 4 bounded agents + Gemini Flash drafter <=$5 + cross-family judge; feed KB §4.2 into the Drafter). Owner-gated stops: deploy · public posting · spend > $5 · git push.
   454	```
   455	
   456	>
   457	> ---
   458	>
   459	> **▶ (SUPERSEDED by the block above — the Codex gate has since RUN + the docs are flipped) B1d LIVE CALIBRATION ✅ RAN + CLEARED all seven pre-registered thresholds (2026-06-26) — domain-quality "Effective"-axis judge. The offline machinery + the live run + eval-lock (`1fcb492`) are committed.** Held-out recall/precision/F1 1.00 (CI95 [0.76,1.00], n=18) · per-dim recall 1.00 each · κ 1.00 · flip 0.00; 36/36 LIVE_JUDGE, $0; no-leakage VERIFIED (R-DARCH-2); eval-locked (R-DHON-4); `verify` green 243+4; `acceptance-gate` = **CONDITIONAL SHIP** (re-gate on the committed files confirmed: gates 1/3/4/5 cleared — "no independent blocker remains; ship-ready pending only Codex"). Full results: `docs/domain-calibration-status.md`; gate record: `docs/reviews/gate-2026-06-26-b1d-live.md`. Built the Effective analogue of the P3 faithfulness judge across 5 committed slices (`db72461`→`e201eee`): KB-cited rubric (`lib/domain/effective-rubric.ts`) · **situation-in** judge (`lib/agents/domain-judge.ts` — mock + cross-family Groq `gpt-oss-120b` via DI; the prompt withholds `diagnose().play` = the R-DARCH-2 tautology guard) · 24-positive/12-negative gold set, gate-passing + faithful **by construction** (`evals/gold/domain-gold.ts`) · harness enforcing **R-DCAL-1 LIVE per item** (`evals/gold/domain-harness.ts`; caught + fixed one bad gold item) · offline calibration test (`evals/domain-calibration.test.ts`, 8 green, per-dimension) · key-gated live runner (`evals/domain-calibration.live.test.ts`, auto-skips offline) · the **pre-registered bar** pinned BEFORE any number (`docs/domain-calibration-status.md`). `verify` green = 236 + 4 skipped. **acceptance-gate = SHIP** (offline machinery, framed correctly); **Codex changed-files review SEAT-BLOCKED** (usage limit, raw-surfaced, ~3:27 PM reset) → dated obligation folded into the B1d Codex gate (`docs/reviews/gate-2026-06-26-b1-offline.md`). Spec: `docs/spec-domain-judge.md` (R-DARCH/R-DCAL/R-DHON).
   460	>
   461	> **[SUPERSEDED — the Codex gate has since RUN + reconciled; see the top block. Original plan retained as history:]** the Codex cross-model gate (was seat-blocked → dated obligation ≈3:27 PM 2026-06-26: `~/claude-os/bin/codex-guarded review --base 07e9a55`) → reconcile primary-model-final → flip "directional"→"calibrated" → then **B2** (wire KB + domain judge into the ship gate) + **A3**. The live calibration RAN this session (results above); the how-to-run below is now the **re-run** command. On a fresh Groq daily window (free, $0): put `GROQ_API_KEY` in gitignored `.env` → re-verify `gpt-oss-120b` non-deprecation + strict-output (RULES §6) → `node --env-file=.env node_modules/.bin/vitest run evals/domain-calibration.live.test.ts` (~25–30 min, ~100K of the 200K/day budget) → read `lib/data/domain-calibration.snapshot.json` held-out + per-dimension vs the bar table in `docs/domain-calibration-status.md`. **IF cleared** → eval-lock (freeze the snapshot + an offline regression test, R-DHON-4) + the Codex cross-model gate (seat permitting) + flip the docs "designed rubric → built + calibrated, metrics=X" (R-DHON-3). **ELSE** → tune the prompt/threshold on the TUNE split + re-run (never tune on test). Then **A3** (4 bounded agents + Gemini Flash drafter ≤$5 + the cross-family judge). Carry the **§4.2 ordering decision** into B2 (status-doc "Forward decision"). Owner-gated stops unchanged (deploy · public posting · spend > $5 · git push).
   462	
   463	> **▶ A2 GO ✅ (2026-06-26, autopilot) — the early go/no-go milestone is CLEARED; committed scope expanded to the full roadmap.** The single-agent verify-and-self-correct loop SHIPs: recommend-not-decide + fail-closed **red-green proven** (the lock test FAILS without the fix, PASSES with it); **8/9 genuine self-corrections** (auditable — every counted item has `seedCatchLive` + a `LIVE_JUDGE` final; $0; 1 miss HELD, never sent); the 5 ship gates discharged — grill (`docs/reviews/grill-2026-06-26-a2.md`, no overclaim), Codex (`docs/reviews/codex-2026-06-26-a1-a2.md`, BLOCK→reconciled→confirmed; the `/tmp`-only recurrence fixed), verify (green 217+3 + red-green), enterprise+elegance + anti-slop (acceptance-gate PASS). Commits: P3 `dafb653` · A1 `f521b5c` · A2 machinery `5a1f86a` · reconcile `37116f5` · evidence `a97baed` · close `7d3d8b5`. **Owner directed GO + "rest other phases"** → the AM-6 cap is lifted (decision-log 2026-06-26). **Build continuation is manual / owner-driven** — the owner resumes each session. *(The auto-resume launcher was removed at owner request 2026-06-26; it was never actually installed — no launchd job, plist, or `activationops-autoresume.sh` script existed on disk, so the removal was a docs-only scrub of the stale references.)*
   464	>
   465	> **NEXT:** **Track B0 ✅ committed `2cc4a2d`** — cited domain KB in `knowledge/domain/` (44 sources / 4 platforms; the FTC-grounded safe-vs-unsafe claim table is B1's directly-encodable rubric asset). **NEXT = B1** (domain rubric + gold set + a **calibrated cross-family domain judge** — the *Effective*-axis analogue of P3's faithfulness calibration: build the rubric from `knowledge/domain/merchant-activation-kb.md` §4.2 + §2.1, a stratified gold set of good/bad merchant-outreach drafts, calibrate a Groq judge with precision/recall/F1 + κ + flip-rate on held-out, eval-lock — like P3, **pre-register the bar before reading numbers**, it needs a live Groq window). Then **A3** (split into the 4 bounded agents — Strategist/Planner · Drafter · Domain Critic · Router/Conductor; **Gemini Flash** drafter within the code-enforced **$5 cap** + cross-family Groq judge, restoring R-ARCH-3) → **A4** (observability + the $0 REPLAY trajectory view). Gate each phase (Codex via `~/claude-os/bin/codex-guarded` + the acceptance-gate; record every verdict in `docs/reviews/`). **OWNER-GATED — surface only, never act:** A5 live Slack/email/n8n, Phase 6 deploy, public posting, any spend beyond the $5 cap, any git push. Keep this block current each step.
   466	
   467	> **▶ EXECUTING (2026-06-25, autopilot) — driving the A2-SCOPED goal (P3 calibration → A1 → A2; STOP at the A2 go/no-go).** Owner toggled `/autopilot` + "go for it" + "full permission … complete it, commit, do the optionals, everything." Interpretation (stated + unchallenged): full rigor + **autonomous commits** through the A2 scope (all reversible + $0); the **A2 go/no-go stays the surface point** — past it = A3–A5 live integrations + deploy = irreversible/paid, owner-gated. Commit mode = **commit each green slice** (owner). Stack doctrine now **best-fit, cost-aware** (decision-log 2026-06-25 — free-first is a default bias, not a hard gate; committed `e260c15`).
   468	>
   469	> **PROGRESS:** (1) **P3 judge calibration ✅ `dafb653`** — held-out (test) split CLEARED the pre-registered bar (recall 1.0 / precision 1.0 / κ 0.784 / flip 0.071; tune split weaker; **DIRECTIONAL** pending P4 eval-lock + Codex + the ~100 floor; an over-strict runner assertion was fixed, not the judge). **AM-1 satisfied → A2 live milestone unblocked.** Honest status: `docs/judge-calibration-status.md`. (2) **A1 tool-ify the core ✅ `f521b5c`** — 7 thin delegating tool wrappers (`lib/agents/tools/`) + `evals/tools-differential.test.ts` (non-vacuous byte-for-byte vs the oracle through the REAL wrappers); `npm run verify` green (206 + 2 skipped); `lib/core` untouched; reviewed for non-vacuousness. **A1 Codex gate SEAT-BLOCKED** (Codex usage limit — raw error in `/tmp/codex-a1-review-activationops.md`, resets ~7:49 PM): A1 proceeds **test-verified**; the A1 + A2 Codex reviews + the A2-D0 framework cross-check are **DATED OBLIGATIONS** before the A2 GO/NO-GO (decision-log 2026-06-25). **Framework decided: Vercel `ai` SDK** (reuse/start-simple; LangGraph rejected). **A2 offline machinery ✅ committed `5a1f86a`** — the verify→reflect→re-draft loop on the `ai` SDK (no LangGraph); **recommend-not-decide STRUCTURALLY enforced** (`assertEligibilityUntouched`) + **R-LOOP-8b test-locked**; non-vacuous R-LOOP-8 (injected verdicts, LIVE_AI/LIVE_JUDGE asserted, no mock fallback); bounded R-LOOP-3; dedicated `TrajectoryStep[]` + `$0` `getAgentLoopSnapshot()` freeze; shared injection-cut (R-LOOP-7); same-family caveat stamped (R-LOOP-5); `verify` green 215+3; `lib/core`+oracle+gold UNTOUCHED; self-reviewed for the invariant + non-vacuousness.
   470	>
   471	> **NEXT (resume here) — the A2 GO/NO-GO evidence batch (the A2-scoped goal's finish line):** (a) **run the live R-LOOP-10 self-correction** — `node --env-file=.env node_modules/.bin/vitest run evals/agent-loop.live.test.ts` (free Groq, $0, ~18K of the 200K/day window; P3 cleared so it is UNBLOCKED) → read the held-out self-correction count, **pre-register K BEFORE reading (≥7/9 defensible, set on held-out, never tuned on the test split)**, freeze `lib/data/agent-loop.snapshot.json`; (b) **`npm run verify:full`** (e2e, R-LOOP-11); (c) when the **Codex seat returns (~7:49 PM)** run the **batched A1 + A2 changed-files reviews + the framework cross-check** — `~/claude-os/bin/codex-guarded exec review --commit <sha>` (NO custom prompt — it conflicts with `--commit`); reconcile primary-model-final; (d) **`acceptance-gate` SHIP**; then (e) **surface the A2 OWNER GO/NO-GO** with the evidence + a recommendation. **STOP there** — do NOT start A3/A4/A5/Track B or deploy. Spec: `docs/plan-multi-agent-execution.md` §6.6.
   472	
   473	> **▶ Refreshed 2026-06-25 (Claude Code, later) — PHASE 0 CLEARED — mandatory cross-model gate CONFIRMED.** The **mandatory cross-model gate RAN** (Codex `gpt-5.5`@`xhigh`, read-only, via `codex-guarded`) → **BLOCK (9 findings) → ALL 9 reconciled (primary-model-final).** Authored this session: the verdict + reconciliation table (`docs/reviews/codex-2026-06-25-multiagent-pivot.md`), **ADR-002** (`docs/decisions/ADR-002-multi-agent-architecture.md`), the **3 decision-log reversals**, and **binding spec amendments** (`docs/plan-multi-agent-execution.md` §0 — AM-1..AM-8 + new R-LOOP-1b/8b). The BLOCK challenged **no** part of the pivot's direction; every finding was a condition (honesty · scope-sequencing · deterministic-first · paperwork), converging with the primary model's own pre-review APPROVE-WITH-CONDITIONS + the advisor. **The confirming Codex pass CONFIRMED** (gate path: BLOCK → reconcile → RESIDUAL → patch → **CONFIRMED**, 2 rounds; round-2 verdict `/tmp/codex-reconfirm-activationops-pivot.md`). **NO product code changed (Phase 0 is governance only); working tree is docs-only + UNCOMMITTED (owner commit pending).**
   474	>
   475	> **Binding build preconditions (do NOT lose):** (1) **the paused P3 judge calibration MUST clear the held-out bar BEFORE A2's *live* self-correction milestone** — A2 is otherwise loop-machinery only (Codex #1, AM-1); (2) **the agent RECOMMENDS only** — `send_eligible`/approval/the `simulated_sent` transition stay deterministic + **test-locked the agent cannot override** (Codex #6, AM-4 / R-LOOP-1b / R-LOOP-8b). **A2 is a SINGLE-agent reflexion spike** ("multi-agent" begins at A3, AM-2); A2's same-family Groq-drafts-Groq-judges proves **convergence only** (cross-family at A3, AM-3). **Committed near-term scope = P3-calibration + A1 + A2; A3/A4/A5/Track B = roadmap, re-decided at the A2 owner go/no-go** (AM-6).
   476	>
   477	> **REMAINING Phase 0 = TWO OWNER ACTIONS only** (the Claude-side §4.2 acceptance is met — review reconciled · 3 reversals · ADR-002 · state sync · docs-only working tree):
   478	> 1. **Commit the Phase-0 docs** (RULES §12) with **EXPLICIT paths — do NOT `git add -A`** (`screenshots/` ~9M, `.agents/`, `.claude/`, `skills-lock.json` are untracked tooling — keep out / gitignore):
   479	>    `git add docs/decisions/ADR-002-multi-agent-architecture.md docs/reviews/codex-2026-06-25-multiagent-pivot.md docs/plan-multi-agent-execution.md PROJECT_STATE.md CURRENT_TASK.md HANDOFF.md docs/decision-log.md docs/roadmap.md docs/task-log.md docs/implementation-journal.md`
   480	> 2. **Toggle `/autopilot` + an A2-SCOPED `/goal`** so the engine STOPS at the A2 go/no-go (NOT the full DONE bar — else it chains A1→A5):
   481	>    `/goal "Build to the A2 owner GO/NO-GO checkpoint ONLY, then STOP. (1) P3 judge calibration first (one clean run, fresh Groq window → held-out recall/precision/F1/κ/flip-rate). (2) A1 tool-ify the core (tools-differential + core-differential green). (3) A2 single-agent verify-and-self-correct loop: offline machinery green (R-LOOP-8 + R-LOOP-8b 'agent can't override eligibility') + $0 REPLAY-recordable trajectory + verify:full green + Codex review reconciled + acceptance-gate SHIP; run LIVE ≥K self-correction (R-LOOP-10) ONLY IF P3 calibration cleared, else A2 offline-only + flag live pending. Do NOT start A3/A4/A5/Track B."`
   482	> **`Resume`/`continue`/`go` in a fresh session** = run the startup contract, re-derive git state, then (if still uncommitted) re-surface action 1 + prompt for action 2. *(This block supersedes the long "### Resume prompt" near the bottom — historical rebuild/judge prompt.)* Fuller pivot rationale: the block immediately below.
   483	
   484	> **▶ Refreshed 2026-06-25 (Claude Code) — MAJOR OWNER-TRIGGERED PIVOT via `/claude-os`: reorient to a BOUNDED MULTI-AGENT, DOMAIN-EXPERT, VERIFY-IN-THE-LOOP system. PLAN APPROVED + durable at `~/.claude/plans/read-last-handoff-and-snappy-ripple.md` (CANONICAL strategic plan) + DETAILED EXECUTION SPEC at `docs/plan-multi-agent-execution.md` (Phase 0 → A1 → A2 fully specced: EARS criteria + acceptance tests + task DAG; A3–A5/B roadmap-level until reached).** The owner re-judged the near-ship product as "a pipeline with an LLM call," not a true AI product, and asked to elevate it into a genuine multi-agent AI product — **quality over tokens/speed**. The built product (judge · gatekeeper · eval harness · hybrid data · REPLAY) is **PROMOTED to the agents' tools, not rewritten**; the 2026-06-22 verification-rigor / "not RAG" differentiator is **preserved and moved to the center of the loop**.
   485	>
   486	> **New goal (specific):** *Problem* — a merchant-activation onboarding manager can't triage a book of stalled/pre-live merchants at scale (who's stuck · why · what to say · who's risky to contact); naive AI outreach over-promises (legal/churn risk). *End goal* — a bounded, HITL multi-agent system that per merchant produces: triage → blocker+root-cause+next-action → drafted outreach → **verification report** (every claim traced to a data field + a domain-quality score) → one-click **Slack** approval → idempotent **email** send → audit+cost ledger. *Ship bar* = **Faithful** (0 unsupported claims reach "approved") AND **Effective** (domain judge ≥ threshold); the loop **self-corrects ≥K planted lies unaided** with an **observable trajectory**; ≤$5 Gemini / free loop / no send without approval / deterministic-core parity held; REPLAY-only public demo + recorded live-flow walkthrough.
   487	>
   488	> **What it is:** *Agents (LLM judgment)* = Strategist/Planner · Drafter · Domain Critic · Router/Conductor. *Deterministic TOOLS (facts + safety — NOT agents)* = triage/risk · Diagnostician (`STEP_MAP` + `lib/domain/diagnosis.ts`) · Faithfulness check (`gatekeeper` + `semantic-judge`) · idempotent-send · audit. **A component is an agent ONLY where judgment is real; everything factual/safety stays deterministic (deterministic-first HELD).**
   489	>
   490	> **Stack (free/free-tier, industry-standard; verify versions live — RULES §6):** Next.js+TS/Vercel · **LangGraph.js vs Vercel AI SDK (DECISION pending live eval + Codex)** · Groq `gpt-oss-120b` (free; loop + critics) · Gemini Flash (<$5; **final draft only**) · Zod · **Promptfoo** (evals+red-team) · **Langfuse** (trajectory observability, CORE) · Slack/Mattermost · Resend/SMTP · n8n (self-host) · Docker Compose · GitHub Actions · cited domain KB in `knowledge/domain/`.
   491	>
   492	> **Two parallel tracks:** **A** (A1 tool-ify the core → A2 single-agent loop **[EARLY go/no-go ship milestone]** → A3 multi-agent team → A4 observability/demo → A5 live integrations [transient demo]) ‖ **B** (B0 cited domain-research KB → B1 domain rubric+gold+judge → B2 wire in). Converge at **Phase 6**: eval-lock → `acceptance-gate` → portfolio narrative → REPLAY-only deploy.
   493	>
   494	> **Reverses 3 logged decisions (owner-approved 2026-06-25; record in Phase 0):** drop-agentic-for-V1 → agentic deliverable · no-multi-agent → bounded multi-agent · integrations-deferred → transient demo (offline slice done).
   495	>
   496	> **▶ SEQUENCE — PHASE 0 FIRST (before any build, before toggling /autopilot):** (1) **Codex adversarial cross-check** on the pivot/plan via `~/claude-os/bin/codex-guarded` (NOT yet run; surface raw errors, no retry/downgrade; primary-model-final on findings) → (2) record the 3 decision-log reversals + a new ADR (`docs/decisions/`) + sync PROJECT_STATE/CURRENT_TASK/roadmap. **THEN** the owner toggles **/autopilot** (gated engine) + **/goal "<ship condition>"**. *Modes are owner-toggled — Claude prompts the exact moment ("Phase 0 cleared — toggle /autopilot now"); the owner flips.* Owner-gated stops unchanged (commits · deploy · live spend/sends · public posting · irreversible).
   497	>
   498	> **Prior active task (UI redesign Stage 2 + semantic-judge calibration) is SUBSUMED:** the judge calibration still completes (it IS the Faithfulness tool); the UI continues but must also surface the agent trajectory (A4).
   499	
   500	> **▶ RESUME HOOK — the owner may type just `resume` (or `continue` / `go`).** That one word means: run the Mandatory Startup Contract (read RULES.md · CLAUDE.md · PROJECT_STATE.md · CURRENT_TASK.md · HANDOFF.md · the playbook; `git status` + `git log --oneline -8`; show the Professional Process Applied block), **re-derive git state live (do not trust SHAs in docs), and continue per the CURRENT top block at the very top of this file.** Presently that pointer is: **BUILD A3-2** — the Strategist agent + its anti-theater seam-eval; the full advisor-sharpened A3-2 design (strongRecommend-first, the strongRecommend baseline, the objective/structural+directional scorer with NO Groq-judges-Groq, the B1-style A3-2a-machinery → A3-2b-live split, and the likely label-deferral to the A3-3 cross-family judge) is IN that top block. **A3-1 is DONE + committed `ce21cf8` — do NOT redo it.** The startup contract auto-loads all state, so the hook word alone is sufficient. **The 2026-06-25 Phase-0 / pivot / UI-redesign / semantic-judge blocks BELOW are HISTORICAL lineage — do NOT re-run them.** Spec: `docs/plan-multi-agent-execution.md` §11. Owner-gated stops still apply (commit · push · deploy · live spend · public posting · irreversible).
   501	
   502	> **🔒 GOAL-LOCK (2026-06-22, owner via AskUserQuestion) — read this first.** Project goal CONFIRMED = **portfolio/capability SHOWCASE** (not a venture), but **"portfolio" ≠ shallow** — owner: *"though portfolio we need to build something capability and also keeping it company agnostic."* So the bar is a **real, defensible capability**, kept **company-agnostic** (fictional "Curbside Commons", de-identified open data, no real-company affiliation; real companies referenced only as comparisons). **Differentiation = VERIFICATION RIGOR:** deterministic-first per-claim faithfulness verification of AI output against the **structured source of truth (the data row), not retrieved RAG context** — the seam every incumbent (DoorDash's own guardrails, Galileo, Patronus, Bedrock, Azure) leaves open. The greenlit **semantic judge IS this capability, deepened.** **Binding honesty reframe:** frame as *"we verify AI claims against the source of truth"*, **never** *"no one automates this"* — DoorDash shipped AI merchant outreach 2026-05, which is **PROOF the problem is real**, not a threat. Grounding: `docs/research/market-validation-2026-06-22.md` (3-thread dated research) + decision-log 2026-06-22 rows. No scope change — this **confirms** the existing roadmap (semantic judge → UI redesign → deploy) and sharpens its positioning. Everything below stands.
   503	
   504	> **▶ Refreshed 2026-06-24 (Claude Code) — UI REDESIGN BUILD: STAGE 1 DONE + COMMITTED + GREEN (`8b8e237`).** The long design thread converged: the owner chose the **"Ledger"** direction (data-as-evidence: `field · value · verdict` rows, premium white + a single vermilion accent), reframed as an **enterprise Merchant-Operations** product (governed/auditable), with a locked content/arc/register spec. **READ FIRST for any continuation: `docs/story-arc-content-spec.md`** (the LOCKED source of truth — the 9-beat insight-led arc; the two-layer rule; the AI-vocabulary rule; honesty) and the design source `mockups/v3-ledger-enterprise.html`. **Stage 1 shipped:** the design-system foundation (`app/globals.css` tokens + self-hosted `next/font` Geist/Geist Mono/JetBrains Mono + the ledger-row primitive) and the **storytelling LANDING as the new front door at `/`** (`app/page.tsx` + `components/landing/*`); the **Overview/Queue moved to `/console`**; `Nav` + `evals/e2e/console.spec.ts` updated (+ a landing smoke test). **REGISTER (verified): professional + operational + layman-legible; professional AI words on the front (AI, AI reviewer, hallucination, fabrication, guardrail); deep ML jargon (entailment, cross-family, eval-locked, κ, RAG, precision/recall) ONLY in opt-in layers — 0 visible leaks.** Honest hero (the overclaim "nothing false ships" was FIXED → "nothing reaches a merchant until every claim is checked against their own data"). **`verify:full` GREEN: typecheck + lint + 192 tests (+2 skipped) + build + 4 e2e.** `lib/` + all logic/data/evals/judge UNTOUCHED.
   505	>
   506	> **Acceptance-gate verdict on the v3 sample = BLOCK, but NARROW + PROCEDURAL** (the direction is "sound, honest, constraint-compliant, adoptable as the design system; no new hard blocker beyond the triaged"). **PRE-SHIP CHECKLIST (do in Stage 2 / before deploy):** (1) **mandatory Codex cross-model devil's-advocate pass** on the design (not yet run — gate 2, no carve-out; attack Layer-1 claims vs `lib/agents/{gatekeeper,semantic-judge}.ts`, the present-tense calibration line, any register leak); (2) close the triaged a11y items in the build — audit log needs real `<table>`/`<th scope>` (SC 1.3.1), queue `aria-current`↔pane must match (SC 4.1.2), disabled decision-buttons keyboard path, fix two H2→H4 heading skips (font self-hosting = DONE via next/font); (3) **polish: the scroll-reveal needs a no-JS/observer-fail fallback** — below-fold content is `opacity:0` until scrolled (invisible in a static load; fine on normal scroll, but make it robust). (4) low advisory: keep the "calibration figures pending" state visible near the trust-anchor's present-tense line.
   507	>
   508	> **STAGE 2 (next, the bulk):** restyle the 6 console surfaces to the committed design-system foundation — `/console` (Overview/Queue) · Merchant Detail (incl. a "Faithfulness check" panel) · Eval · Metrics · Audit · Cost — close the a11y items, run the Codex cross-model gate, and push the chosen direction through **Claude Design** (project `44a024cc-bffb-4714-a633-2706dfd85fbb` already created). Keep all `lib/` logic/data/evals/the judge intact; `verify:full` green per surface; commit each clean step. Servers may still be running: `next dev` :3000 (the app — view `/` + `/console`), `python http.server` :8080 (mockups). Re-derive git state live.
   509	>
   510	> **PARALLEL pending obligation — SEMANTIC JUDGE calibration (P3):** the Groq 200K-tokens/DAY window that blocked the clean run on 2026-06-22 should now be RESET (it's 2026-06-24). The one clean run is now runnable: `node --env-file=.env node_modules/.bin/vitest run evals/judge-calibration.live.test.ts` → read `lib/data/judge-calibration.snapshot.json` (held-out recall/precision/F1 + κ + flip-rate) → **P4** (eval-lock + flip docs ONLY if metrics clear the bar). Full status: `docs/judge-calibration-status.md`. This is independent of the design build.
   511	
   512	> **▶ Refreshed 2026-06-22 (Claude Code) — SEMANTIC JUDGE P3 INFRASTRUCTURE DONE + LIVE JUDGE WIRED + PROVEN (owner provided GROQ_API_KEY).** The live cross-family Groq `openai/gpt-oss-120b` judge is wired + working; **ONE clean calibration run remains, gated on a fresh Groq daily token window.** Done this slice: verified the owner's key without printing it (gsk_/56-char · `.env` gitignored+untracked · HTTP 200 · model available + non-deprecated, RULES §6); installed **`@ai-sdk/groq@2.0.42`** + wired the live judge in `lib/agents/semantic-judge.ts` (`defaultJudgeGenerate`: strict `structuredOutputs:true` + `reasoningEffort:"low"`); strict-mode smoke = schema-valid JSON + flagged a planted fabrication; built the key-gated runner `evals/judge-calibration.live.test.ts` (live judge over the 30-item gold set, K=3, R-CAL-1 partition; auto-skips offline). **A live run PROVED the capability** (strong recall) and surfaced a precision gap — the judge flagged the **platform's own name + greeting framing** as "unsupported"; root-caused + **fixed** in `buildJudgePrompt` (email is sent BY the platform; threaded `platformName`), validated to still discriminate at low reasoning effort. **THE REAL LIMIT (read verbatim from the 429 body, after an advisor caught me inferring it from headers twice): Groq free tier = 200,000 tokens/DAY; used 199,981 — 5 debugging runs spent today's budget.** With `reasoningEffort:"low"` (~374 tok/call) a full 78-call run needs ~30K → feasible on a fresh window; free tier IS sufficient. **REMAINING P3 = one clean run on a fresh daily window:** `node --env-file=.env node_modules/.bin/vitest run evals/judge-calibration.live.test.ts` → read `lib/data/judge-calibration.snapshot.json` held-out recall/precision/F1 + κ + flip-rate → **P4** (eval-lock + the 3 demo surfaces + Codex gate + flip docs ONLY if metrics clear the bar, R-HON-3). Pre-fix numbers NOT enshrined (snapshot deleted; superseded). **Offline green: 192 + 2 skipped; typecheck/lint/build green; `lib/core` + differential UNTOUCHED.** Full honest status: **`docs/judge-calibration-status.md`**.
   513	
   514	> **▶ Refreshed 2026-06-22 (Claude Code) — SEMANTIC JUDGE P2 DONE + GREEN (committed).** Resumed in goal mode; built the judge's CALIBRATION CORE (offline, $0). **`lib/evals/judge-metrics.ts`** — pure, independently-tested metrics (confusion matrix · precision/recall/F1 · TPR/TNR · Wilson recall CI · Cohen's κ · test-retest flip-rate); `headlineReport` = **recall on the gatekeeper-PASSING subset** (R-CAL-1, not vacuum recall). **`evals/gold/semantic-judge-gold.ts`** — the gold set as typed TS LITERALS (**30 items**: 16 planted judge-territory positives across 4 failure modes [≥3 each, 9 in the held-out test split] that survive the deterministic guardrail · 2 gate-caught positives exercising R-CAL-1 exclusion · 10 mock-clean + 2 real-supply clean negatives; objective field-entailment labels + few-shot critiques incl. supported exemplars [R-CAL-5]; tune/test split [R-CAL-6/7]; grown from 21 to the R-CAL-2 ~30 floor after an advisor flagged the held-out positive count). **`evals/gold/harness.ts`** — reusable gold→real-gatekeeper→JudgeFn wiring (the SAME harness feeds P3's live judge; `mockJudgeFn` is the P2 stub). **`evals/judge-calibration.test.ts`** (16 tests). **Advisor-shaped before writing:** metric MATH tested vs hand-computed matrices (judge-independent); the mock judge run ONLY as a labeled "stub baseline (NOT calibration)," never gated; **R-CAL-1 ENFORCED LIVE** — every gold item run through the real `runGatekeeper`, approval must equal its declared expectation (this caught a defective planted positive → reworded → blocks correctly). **All gold positives SYNTHETIC + labeled** (R-CAL-4: the 6 recorded live drafts are well-grounded). **`npm run verify` core green: typecheck + lint + 192 tests (+1 skipped) + build (27 routes); `lib/core` + differential UNTOUCHED; no app/runtime/UI change so the 3 Phase-C e2e are unaffected.** **NEXT = P3 (OWNER-GATED: provide a free `GROQ_API_KEY` in gitignored `.env`)** → run the live cross-family Groq gpt-oss-120b judge through `evals/gold/harness.ts` → real metrics + a frozen calibration fixture → **P4** (eval-lock + the 3 demo surfaces + Codex gate + flip the docs only once metrics clear the bar). Then the QUEUED UI redesign + owner-gated T13 deploy.
   515	
   516	> **▶ Refreshed 2026-06-22 (Claude Code) — SEMANTIC JUDGE P0 + P1 DONE + GREEN (committed).** Resumed in goal mode; built the judge's offline core. **P0** (`b01a5a6`): the EARS spec `docs/spec-semantic-judge.md` (advisor-shaped: headline = recall on the gatekeeper-PASSING subset; gold-set positives must clear the real gatekeeper; objective field-entailment labels) + the **judge-model decision** — owner raised Groq + asked "which is best for quality/structured/enterprise" + "explore current free models, use the best": chose **CROSS-FAMILY Groq `openai/gpt-oss-120b`** (strict JSON, free, the gold-standard self-preference mitigation), behind a provider-agnostic boundary, Gemini Flash-Lite kept as a configurable alt. Freshness-verified **as of 2026-06-22** (the Llama line was deprecated 06-17 → migrate to gpt-oss; gpt-oss-120b is current/non-deprecated). **P1** (next commit): `lib/agents/{claimable-fields,semantic-judge}.ts` (shared `CLAIMABLE_FIELDS` for gatekeeper+judge; Zod per-claim schema; entailment prompt; deterministic `mockJudge`; `judgeDraft` mock+DI-live+fallback, budget-ledgered), `judgeLiveEnabled()`, wired as a SECONDARY control after the gatekeeper in `lib/replay/run.ts` (new `judge` field + `judge` audit actor, R-ARCH-4), and the **Merchant-Detail "Faithfulness check" panel** (§4; Eval/Human/Audit renumbered 5/6/7). **`npm run verify` green: typecheck + lint + 176 tests (+1 skipped) + build (27 routes) + 3/3 e2e.** Truly offline + dependency-free (live Groq path uses DI in tests; the real `@ai-sdk/groq` install lands at P3). **NEXT = P2** (gold set + precision/recall/F1/κ/flip-rate harness, offline/$0) → **P3 OWNER-GATED** (free `GROQ_API_KEY` → live calibration) → P4 (eval-lock + 3 demo surfaces + Codex gate + honest docs). `lib/core` + the differential UNTOUCHED. Housekeeping flag: `screenshots/` (9.1M) + `.agents/`/`.claude/`/`skills-lock.json` are untracked tooling artifacts (NOT gitignored — suggest ignoring; kept out of commits via explicit paths).
   517	
   518	> Refreshed 2026-06-22 (Claude Code) — **DOCTRINE ALIGNMENT-AUDIT reconciled.** A read-only 3-agent audit (project-advisor · guidelines-monitor · acceptance-gate) ran; every gate-blocking + important finding is FIXED across 7 committed slices (`8b8a896` honesty/accuracy copy · `c100f41` NEW no-leakage eval grader · `93848de` a11y contrast+skip-link · `e675df0` recovered the rebuild Codex verdicts into `docs/reviews/` + journal backfill · `d799240` state sync · slice 6 reconciles a fresh Codex BLOCK — the gatekeeper now ENFORCES no-leakage · slice 7 reconciles the confirming pass's 4 second-order items — hyphen/`risk=high` detector gaps, count precision, allow/deny tests). Two Codex BLOCK→reconcile rounds converged; the **final re-confirm hit a transient Codex "at capacity" error** (raw-surfaced, NOT retried per owner doctrine) — slice 7 is **test-verified** (the allow/deny suite locks the reviewer's exact cases, 161 green); a Codex re-confirm is a **recommended dated obligation, not a blocker**. **CANONICAL: 161 tests + 1 skipped green; live fixture = 5 LIVE_AI / 1 fallback / $0.004203.** The acceptance-gate's HIGHEST-ranked "secret in `.env`" was verified a **FALSE ALARM** (gitignored / untracked / never committed / deploy-excluded — not a §11 breach). Then — still **PAUSED for a fresh session, mid UI-REDESIGN.** The PRODUCT is DONE / green / deploy-ready (the live run, the 3-audit sweep, the pre-deploy grill, and now the alignment-audit — all reconciled; 161 tests + 3 e2e green; demo fictionalized; deploy is a clean owner GO + a fresh pre-deploy Codex pass on the 4 new fix slices recommended). **ACTIVE TASK = UI redesign:** the owner finds the console "dull/generic" and wants a modern, professional, ELEGANT, white-bg product site with a STORYTELLING walkthrough arc + motion + custom icons/SVGs (anti-slop). **5 design-direction SAMPLES are built** (`mockups/{editorial,saas,swiss,technical,premium}.html`; screenshots in `mockups/shots/`; served at http://localhost:8080/mockups/<name>.html). **AWAITING the owner's PICK** (one winner, or a blend). On pick → **finalize that design language into the real Next.js app** (every surface + a storytelling landing front door; keep all logic/data/evals intact; the e2e selectors will need updating). THEN owner-gated T13 deploy. Running background servers: `:3000` (old app dev) + `:8080` (mockups) — stop with `pkill -f "next dev"` / `pkill -f "http.server"`. Re-derive git state live.
   519	
   520	- **Done this session (all committed, all green — 50 tests, `next build` prerenders every route):**
   521	  - **Phase B — domain depth** (`3c1540b`): `lib/domain/diagnosis.ts` — engagement state (actively-stuck / ghosted / new / progressing from `last_login × steps × tenure`) + a reactivation **play that varies by engagement, not just step** + `blocker_source` (merchant-side nudge vs platform-side ops-escalation). Add-alongside; **`lib/core` + the differential oracle untouched**. Cited from `docs/research/merchant-activation-domain-2026-06-19.md`. Surfaced on Merchant Detail.
   522	  - **Phase C — console** (`3ca6986`): shared nav + **Eval/Quality · Metrics/Impact · Audit · Cost** surfaces (a11y-minded: semantic tables, `scope`, focus-visible).
   523	  - **Live-path hardening (pre-Gemini, Codex P1)** (`b0acef4`): **injection cut** — the untrusted `merchant_name` never reaches the model (`{{MERCHANT}}` placeholder, real name substituted only after gatekeeping; adversarial-name test) + **cumulative budget ledger** (`lib/agents/live-batch.ts`, fail-closed across a run).
   524	  - **Phase D — docs** (`89c7a00`): `docs/WHY.md` (full why-chain, each why names the rejected alternative + its cost + a cross-industry "generalizes" note) + honest **today-vs-target README** rewrite (de-branded, routes to current docs).
   525	- **LIVE RUN — DONE (T12 ✓).** 6 merchants through real `gemini-2.5-flash`, $0.0036, recorded in `lib/data/live-samples.snapshot.json` (locked by `evals/live-samples.test.ts`; live smoke `evals/live-smoke.test.ts` auto-skips without the key). Re-run after the guardrail-precision fix → 0 false blocks. **To RE-RUN:** set `GEMINI_API_KEY` + `ENABLE_LIVE_AI=true` in gitignored `.env` (editor, never chat) → `node --env-file=.env scripts-ts/gemini-preflight.mjs` (verifies the key, never prints it; re-verify model/pricing at use-time, RULES §6) → `node --env-file=.env node_modules/.bin/vitest run evals/live-smoke.test.ts` → refresh the fixture.
   526	- **CROSS-MODEL GATE — DONE.** Comprehensive Codex review + a final confirming pass (both BLOCK→fully reconciled), `security-specialist` (no P0/P1; defenses sound), `evals-specialist` (4 P1 rigor gaps closed: verb-before-noun coverage, 45-case guardrail corpus ported, draft-text differential, live-snapshot lock). 161 tests + 3 e2e green; coverage 88/79/90/91.
   527	- **Owner-gated stops (pause + surface, never bypass):** **Vercel deploy** · platform-name confirm ("Curbside Commons") · public posting · any live spend · irreversible/external.
   528	- **Remaining work — DEPLOY ONLY (T13), OWNER-GATED.** A **pre-deploy devil's-advocate grill** (Codex + advisor) ran (was NOT-YET) and **all 14 findings are now RESOLVED**: honesty hardened on every surface (non-affiliation footer · Metrics de-"Impact"-ified · "proven"→"exercised" · static-fixture label + local-verify command · "reference prototype"); and the three former owner-decisions are **done**:
   529	  1. **[#1 risk] FIXED** — the public demo now shows **fictional** names (real-data capability kept in the adapter + docs). Live re-run over fictional merchants: 0 false blocks (and it surfaced + I completed the menu/photos/hours precision fix).
   530	  2. **"Curbside Commons"** — resolved as the demo name (no collision found; formal clearance only before commercial use).
   531	  3. **`out/README.md`** labels the Python-v1 oracle ("DoorDash" = the differential reference-name; synthetic; not affiliation); `.vercelignore` excludes it from Vercel.
   532	  **Deploy is now a clean owner GO:** run Vercel (REPLAY-only; confirm `.env`/`ENABLE_LIVE_AI` absent in the Vercel env; keep the repo private OR treat `out/` as the labeled bundle) — a final pre-deploy Codex pass is available if wanted. **No non-owner-gated build work remains.**
   533	- **Watch-outs:** project path has **spaces** (`fileURLToPath`); the public demo shows **fictional** names (the adapter ingests real DataSF — capability vs display); live AI is OFF by default + must stay OFF in the public deploy.
   534	- **Reuse map (resilix, `/Users/sharan_98/Desktop/supply-chain-ai-resilix/`):** `lib/agents/{gatekeeper,run,budget,pricing}.ts`, `lib/signals/sanitize.ts`, `lib/evals/{graders,judge}.ts`, `app/globals.css` (Quiet Instrument tokens — full design pass is optional polish), `docs/enterprise_readiness.md`. Canonical plan: `~/.claude/plans/gentle-forging-starlight.md` (do NOT reopen without an owner pivot).
   535	- **If unsure, stop and ask.**
   536	
   537	### Resume prompt (paste-ready — re-engages goal mode in a fresh session)
   538	
   539	```
   540	Continue ActivationOps AI — the REBUILD, goal mode. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -10; show the Professional Process Applied block with an "Effort:" item — auto-routed; architecture/AI → MAX). Re-derive git state live; do not trust SHAs in docs.
   541	
   542	GOAL-LOCK (2026-06-22, owner via AskUserQuestion): project goal CONFIRMED = portfolio/capability SHOWCASE — but "portfolio" ≠ shallow (owner: "though portfolio we need to build something capability and also keeping it company agnostic"). Build a REAL, defensible CAPABILITY, kept COMPANY-AGNOSTIC (fictional "Curbside Commons", de-identified open data, no real-company affiliation; real companies only as comparisons). DIFFERENTIATION = VERIFICATION RIGOR: deterministic-first per-claim faithfulness verification of AI output against the STRUCTURED SOURCE OF TRUTH (the data row), NOT retrieved RAG context — the one seam every incumbent (DoorDash's own guardrails, Galileo, Patronus, Bedrock, Azure) leaves open; the semantic judge below IS this capability, deepened. BINDING HONESTY REFRAME: frame as "we verify AI claims against the source of truth", NEVER "no one automates this" (DoorDash shipped AI merchant outreach 2026-05 = PROOF the problem is real, not a threat). Grounding: docs/research/market-validation-2026-06-22.md (3-thread dated research) + decision-log 2026-06-22 rows. No scope change — this confirms the roadmap (semantic judge → UI redesign → deploy) and sharpens positioning.
   543	
   544	State: the rebuild is APPROVED + complete + deploy-ready (~/.claude/plans/gentle-forging-starlight.md is CANONICAL; do NOT reopen without an owner pivot). COMMITTED + GREEN (161 tests + 3 Playwright e2e; coverage ≥88/79/90/91): full build + the recorded LIVE Gemini run + a 3-audit sweep (Codex · security · evals, all reconciled) + a pre-deploy grill (all 14 findings reconciled; public demo FICTIONALIZED) + eval-rigor locks (45-case guardrail corpus, draft-text differential, live-snapshot). lib/core + the golden differential are UNTOUCHED. PLUS — a 2026-06-22 DOCTRINE ALIGNMENT-AUDIT (owner "do all the fixes and commit") is RECONCILED + COMMITTED across 8 commits (`8b8a896`→`eeff59e`): a read-only 3-agent audit (project-advisor · guidelines-monitor · acceptance-gate=BLOCK) → fixed honesty/accuracy copy; a NEW no-leakage eval grader NOW ENFORCED in the runtime gatekeeper (shared precise-denylist detector, `lib/agents/state-consistency.ts`); a11y contrast+skip-link; rebuild Codex verdicts recovered into `docs/reviews/` + journal backfill; the acceptance-gate's ".env secret" verified a FALSE ALARM (gitignored/untracked/never-committed). Two Codex BLOCK→reconcile rounds converged; the FINAL re-confirm hit a transient Codex "at capacity" error (raw-surfaced, NOT retried per owner doctrine) → a Codex re-confirm on `af3680e..HEAD` is a RECOMMENDED DATED OBLIGATION (not a blocker; slice 7 is test-verified). Now **161 tests + 1 skipped + 3 e2e green**. Product = done + hardened; only the owner-gated T13 deploy was left.
   545	
   546	ACTIVE TASK = CONTINUE THE CALIBRATED SEMANTIC JUDGE. PROGRESS (2026-06-22): P0 (EARS spec docs/spec-semantic-judge.md, committed b01a5a6) + P1 (offline judge: lib/agents/{claimable-fields,semantic-judge}.ts, mock + DI-live + the Merchant-Detail "Faithfulness check" panel, SECONDARY control after the gatekeeper) + P2 (CALIBRATION CORE, offline/$0: lib/evals/judge-metrics.ts [pure precision/recall/F1 + Wilson recall CI + Cohen's κ + flip-rate; headlineReport = recall on the gatekeeper-PASSING subset, R-CAL-1]; evals/gold/semantic-judge-gold.ts [stratified gold set as typed TS literals — planted-per-failure-mode positives each verified LIVE through the real runGatekeeper per R-CAL-1, gate-caught positives for the exclusion path, clean + real-supply negatives, objective field-entailment labels + critiques R-CAL-5, tune/test split; all positives SYNTHETIC per R-CAL-4]; evals/gold/harness.ts [reusable gold→gatekeeper→JudgeFn wiring, reused by P3's live judge]; evals/judge-calibration.test.ts [16 tests: metric math vs hand-computed matrices; R-CAL-1 enforced LIVE; mock = labeled STUB BASELINE, not gated]) ALL DONE + GREEN (192 tests + 1 skipped; typecheck/lint/build green; lib/core + differential UNTOUCHED). JUDGE MODEL = CROSS-FAMILY Groq openai/gpt-oss-120b (strict JSON, free, provider-agnostic boundary; Gemini Flash-Lite = configurable alt), freshness-verified current 2026-06-22. P3 INFRASTRUCTURE DONE (owner provided GROQ_API_KEY): @ai-sdk/groq@2.0.42 installed; the live Groq openai/gpt-oss-120b judge is WIRED in lib/agents/semantic-judge.ts defaultJudgeGenerate (strict structuredOutputs:true + reasoningEffort:"low"); the key-gated calibration runner evals/judge-calibration.live.test.ts runs the live judge over the 30-item gold set (K=3, R-CAL-1 partition; auto-skips offline). A live run PROVED the capability (strong recall) and surfaced + FIXED a precision gap (the judge flagged the platform's own name + greetings as "unsupported" → buildJudgePrompt now grounds the platform name, threaded platformName). THE REAL LIMIT (read verbatim from the 429, NOT inferred): Groq free tier = 200,000 TOKENS/DAY; 5 debugging runs used 199,981 today. With reasoningEffort:"low" a full run needs ~30K → feasible on a FRESH daily window. NEXT = ONE CLEAN CALIBRATION RUN on a fresh Groq daily window: `node --env-file=.env node_modules/.bin/vitest run evals/judge-calibration.live.test.ts` → read lib/data/judge-calibration.snapshot.json for held-out (test-split) recall/precision/F1 + κ + flip-rate. IF they clear the recall bar at acceptable precision (R-CAL-7) → P4 (eval-lock the threshold + gold set; freeze the judge fixture; wire the 3 demo surfaces to recorded verdicts REPLAY/$0; Codex gate; flip docs from "designed boundary" → "built + calibrated, metrics=X" ONLY then, R-HON-3). IF not → tune the prompt/threshold on the tune split + re-run. Do NOT enshrine the pre-fix numbers (no durable artifact; snapshot deleted). Full status: docs/judge-calibration-status.md. (Don't run a heavy Groq job on another project concurrently — shared 200K/day account budget.) Build the rest per the spec docs/spec-semantic-judge.md + plan docs/plan-semantic-judge-and-deepening.md (NOTE: the plan's "gemini-2.5-flash-lite judge, <$5" line is SUPERSEDED by the Groq CROSS-FAMILY decision — decision-log 2026-06-22; the judge is FREE Groq gpt-oss-120b, $0). The judge is a reference-grounded per-claim entailment faithfulness check, a SECONDARY control AFTER the deterministic gatekeeper into the human gate (BUILT in P1). Calibrate on a labeled gold set (planted fabrications per failure-mode that EACH first clear the real runGatekeeper + a real-supply probe of lib/data/live-samples.snapshot.json + objective field-entailment labels); report precision/recall/F1 + Cohen's κ + test-retest flip-rate; recall-favoring threshold on HELD-OUT data, headline = recall on the gatekeeper-PASSING subset; eval-lock it. SHOWABLE (owner ask): the Merchant-Detail "Faithfulness check" panel (DONE, mock verdicts), an Eval calibration dashboard, and a "catch in action" exhibit — ALL renderable in the public REPLAY demo at $0 from a recorded judge fixture (frozen at P3). Deterministic-first: mock judge + gold set + harness OFFLINE (no spend, DONE for the judge core); the live calibration is OWNER-GATED on a FREE GROQ_API_KEY ($0, not <$5); install @ai-sdk/groq + wire the real Groq strict-JSON call at P3; Codex cross-model gate before ship. Phases P0–P4 + the trigger-bound production roadmap are in the plan. Re-verify (RULES §6) Groq strict-mode + the gpt-oss-120b deprecation status + promptfoo MIT at build time. THEN queued: the UI redesign + the owner-gated T13 deploy.
   547	
   548	QUEUED — UI REDESIGN. The owner finds the console "dull/generic" and wants a MODERN, professional, ELEGANT, WHITE-background product site with a STORYTELLING walkthrough arc (deep-but-simple language) + motion/transitions + custom icons/SVGs + an animated pipeline — ANTI-SLOP, senior-designer craft, NOT a template. I built 5 distinct design-direction SAMPLES (standalone HTML, real content, fictional names, full arc + scroll-reveal + custom SVGs) via 5 parallel frontend-specialist agents: mockups/editorial.html (Fraunces serif/oxblood magazine long-read) · mockups/saas.html (Linear/Vercel emerald, console-preview hero) · mockups/swiss.html (monochrome+red, strict Swiss grid) · mockups/technical.html (blueprint dot-grid, monospace, animated flow-diagram) · mockups/premium.html (Stripe/Mercury indigo, layered depth). Screenshots: mockups/shots/*.png. View live: http://localhost:8080/mockups/<name>.html (static server may still be running; else `cd <repo> && python3 -m http.server 8080`).
   549	
   550	NEXT: (1) get the owner's PICK (a single winner, or a blend like "editorial hero + saas pipeline"). (2) FINALIZE it into the real Next.js app — apply the chosen design language as the design SYSTEM (globals.css tokens + components) across EVERY surface (Overview · Merchant Detail · Eval · Metrics · Audit · Cost) AND add the storytelling landing as the new front door; KEEP all logic/data/evals/the gatekeeper/the live fixture intact (presentation only). (3) Re-verify (typecheck/lint/test/build/e2e) — the e2e selectors/headings WILL need updating for the new UI; keep the honesty footer + non-affiliation + fictional names + the simulated/REPLAY labels. (4) Then the owner-gated T13 deploy. Use frontend-specialist + anti-slop discipline; cross-model gate (Codex) the final UI before deploy.
   551	
   552	OWNER-GATED STOPS (pause + surface, never bypass): Vercel deploy · platform-name · public posting · live Gemini spend · irreversible/external. Everything else: proceed autonomously, COMMIT each clean green step. DURABILITY: commit per step + keep this resume prompt fresh. Narrate stage boundaries in plain + technical English.
   553	```
   554	
   555	## Standing continuity procedures
   556	
   557	### If Claude Code account 1 hits usage mid-task
   558	1. Stop.
   559	2. Update `CURRENT_TASK.md`.
   560	3. Update this `HANDOFF.md`.
   561	4. Update `PROJECT_STATE.md`.
   562	5. Update `docs/task-log.md`.
   563	6. List uncommitted changes (`git status`).
   564	7. Do not start a new task.
   565	
   566	### When Claude Code account 2 (or the CLI) starts
   567	1. Read `RULES.md`.
   568	2. Read `PROJECT_STATE.md`.
   569	3. Read `CURRENT_TASK.md`.
   570	4. Read `HANDOFF.md`.
   571	5. Read `docs/task-log.md`.
   572	6. Run `git status`.
   573	7. Summarize current phase, active task, changed files, unfinished work, risks, and the next safest step.
   574	8. Wait for human approval before continuing.
   575	
   576	### Background Codex jobs
   577	When a Codex job runs in the background, record its purpose and whether its result was checked here or in `docs/task-log.md`. Invoke Codex through `~/claude-os/bin/codex-guarded` (shared-seat queue/mutex; namespaced output).

 succeeded in 0ms:
     1	# Task Log
     2	
     3	## 2026-07-03 — W3 (one-page report: web + machine JSON + corpus packaging) [delegated build, Opus @ xhigh; Fable orchestrates/judges]
     4	
     5	- **Process:** per-slice gate · SPEC-ADHERENCE (delegated builder) · risk med (public-facing surface + honesty labels) · Effort auto-routed high. Advisor UNAVAILABLE (surfaced verbatim — 8th consecutive); maker=judge mitigated by RED-GREEN ×7 + this record + the pending M1 Codex batch. **NOT committed** (awaits Fable equivalence review → M1).
     6	- **Part A — machine-JSON leg (C1):** the CLI already emits canonical `serializeReport` JSON; W3 makes it the explicit CI contract — documented `--json` trailing alias (both legs; default byte-identical so frozen goldens stay locked; exit 0/1/2 frozen) + a dedicated C10-header-surface eval (specVersion pin · matchingMode · simulated on both legs). Reading recorded E-1.
     7	- **Part A — web view leg (C4):** `/report` page — `app/report/page.tsx` (server, metadata) → `components/report/ReportView.tsx` (client, surface toggle ACP/UCP) → renders the COMMITTED golden fixture reports (`expected-report.{acp,ucp}.json`, statically imported, bundled). Plain-words line LEADS each finding; the four C2 receipts (claim · reference-row · rule · severity) always visible; header pins specVersion + matchingMode (plain-decoded) + an unmissable SIMULATED banner (C10). Matches the Ledger-Enterprise idiom (rpt-* over the existing `.ds-*` tokens); print stylesheet → clean one-page print, `break-inside: avoid` per finding, honesty labels forced to print. Route prerenders `○ Static`; $0, zero LLM, zero network. Pure transform in `lib/packs/listings/report-view.ts`.
     8	- **Part B — corpus packaging (C9):** top-level `fixtures/README.md` index covering BOTH sets (synthetic-restaurant truth corpus + ucp-conformance-ci) — regen (`fixtures:wedge`/`fixtures:ucp`), how-to-run, taxonomy keying (two axes kept separate, honestly), the `ucp-catalog-response.*` shape-honesty caveat VERBATIM, and **License: pending owner decision** (no LICENSE file added; upstream `ucp-schemas/` Apache-2.0 untouched). No frozen fixture bytes mutated — additive docs only.
     9	- **$0-LLM proof extended:** new `evals/packs/report-view-c1.test.ts` walks the report import-graph (banned LLM/provider/network modules unreachable). Found + fixed a real gap: the walk regex (shared with `cli-c1`) missed bare side-effect `import "x"` — **hardened both walks** to catch it (strictly stronger proof; RG-2 proves it bites on the sneakiest form). New `evals/packs/corpus-packaging-c9.test.ts` (C9). Extended honesty-C10 + C6-overclaim scans to cover `fixtures/README.md`.
    10	- **Gate:** `npm run verify` **exit 0 — 505 passed | 5 skipped** (was 478; +27). `npm run test:legacy` **exit 0 — 306 passed | 5 skipped** (hard constraint held). RED-GREEN ×7 executed (`docs/reviews/w3-verify-evidence.log`); slice record `docs/reviews/w3-slice-record.md`. NO new npm deps. Prerender spot-checked: 16 finding cards, both surface tabs, all C2 receipts, spec pin + SIMULATED + FAIL verdict present in static HTML.
    11	- **Skills/tools:** Node-24 type-stripping (no deps) · static JSON import (bundled golden reports) · Next.js server+client split · seeded/frozen-fixture packaging. **Next:** M1 Codex batch + acceptance-gate (incl. W1 named obligation + W2 + W3 diffs) → D1.
    12	
    13	## 2026-06-28 (A3-4 — Domain Critic wired into the loop VERIFY as the 2nd critic; advisory + independent; anti-theater eval → label DEFERS; COMMITTED TEST-VERIFIED, gate-2 Codex named-open)
    14	
    15	**Process:** per-slice A3 gate · FULL · high-risk (AI behavior · cross-family architecture) · Effort auto-routed to MAX. Advisor consulted BEFORE writing (it set the decisive discipline: the Domain Critic needs its OWN anti-theater eval vs `mockDomainJudge` — B1/B2 don't discharge it — and the eval DECIDES the label; flagged the cross-family P1 would recur on the new judge's separate env). Owner said "keep going here" → continued autonomously per the RESUME DIRECTIVE.
    16	
    17	**Did:** Wired the existing `judgeDomain` (B1/B2, unchanged) into the loop's VERIFY phase as the 2nd critic — ADVISORY (never gates `verifyPassed`/eligibility/send), INDEPENDENT (no faithfulness input; withholds `diagnose().play`), gatekeeper-gated, with `finalVerify.domain` + a `"domain"` audit actor + a 2nd verify-phase trajectory step. Extended the `live` gate to `crossFamilyReady` (+`resolvedDomainJudgeProvider()==="groq"`) + a fail-closed throw on a forced non-fully-DI'd `live:true`. Built the R-A3-1 anti-theater eval (`evals/domain-critic-antitheater.test.ts`).
    18	
    19	**The material finding (anti-theater):** the live Groq domain judge (B1-frozen held-out) **TIES** its deterministic counterpart `mockDomainJudge` on the held-out gold (both aggregate F1 = 1.00) → the eval is a FLOOR-not-ceiling → the **`domain_critic` label DEFERS** (step stays "tool", like the Strategist). Honest earned-agent ledger after A3-4: **Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router pending A3-5.** Took the eval at face value (advisor: "if it ties, defer — don't rescue the label").
    20	
    21	**Gate:** `npm run verify` **exit 0 — 285 passed + 5 skipped**; differential 20/20 UNTOUCHED. Two red-greens (advisory: domain gating the send → RED; cross-family: `||`→partial-DI attempts a real Gemini call, `&&`→throws). **Codex round-1 BLOCK (6: 1 P1 forced-live cross-family bypass + 2 P2 [stale `lastDomain` · plan claimed DONE] + 3 P3) → ALL reconciled primary-model-final; round-2 confirming → 1 RESIDUAL P1 (the `||` partial-DI hole) → patched to `&&` fully-injected-DI + a 3-case regression; round-3 re-confirm SEAT-BLOCKED (Codex usage limit ~7:25 PM, raw error surfaced, NO retry) = DATED OBLIGATION** → proceeding test-verified. **acceptance-gate = BLOCK (gates 1/3/4/5 PASS; gate-2 NAMED-OPEN — the load-bearing partial-DI fix is unreviewed by Codex + round-1 missed the P1 round-2 caught; flips SHIP 5/5 when round-3 returns).** Records: `docs/reviews/{codex,gate}-2026-06-28-a3-4*.md`.
    22	
    23	**Skills used:** advisor (pre-build design + 2 reconciles), acceptance-gate (5-gate ship judge), codex-guarded (cross-model review, 3 rounds — round 3 seat-blocked). Committed test-verified via the RESUME DIRECTIVE; **push HELD** (no remote). NEXT = A3-5, after the A3-4 Codex round-3 re-confirm.
    24	
    25	## 2026-06-28 (A3-3 — Drafter→Gemini cross-family OFFLINE machinery + §4.2 prevention; FULLY GATED, commit owner-authorized via the RESUME DIRECTIVE, push HELD)
    26	
    27	**Process:** per-slice A3 gate · FULL · high-risk (AI behavior · cross-family architecture · cost/budget) · Effort auto-routed to MAX (ship-gating). Advisor consulted BEFORE writing (settled: hardcode Gemini not a `draftFn` seam — a seam would be a hole in R-A3-2; don't make `usage:{0,0}` universal — add a real cost-integrity test; honest live-gate). Owner said "resume" → continued autonomously per the RESUME DIRECTIVE.
    28	
    29	**Did:** Swapped the loop's Drafter `draftOutreachGroq`→`draftOutreach` (Gemini, cross-family R-A3-2/R-ARCH-3); moved shared `withRevision` into `draft.ts` + added `instruction` to `draftOutreach`; wired KB §4.2 `DOMAIN_HONESTY_RULES` (static, merchant-independent, off the per-merchant `facts`) into the shared `buildPrompt` (R-A3-5); threaded a cloned cumulative $5 ledger (accrues drafter + judge spend; `UNKNOWN_USAGE` fail-closed); honest live-gate default; reframed the honesty notes cross-family; offline DI fixtures → usage `{0,0}` ($0 known); added 2 cost-integrity tests; repurposed the A2 live Groq test into the A3-7 cross-family harness skeleton; R-A3-8 note in `docs/{judge,domain}-calibration-status.md`. 9 files (`git diff --stat` 284+/111-).
    30	
    31	**Gate:** `npm run verify` **exit 0 — 279 passed + 5 skipped**, typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+snapshots UNTOUCHED). **Codex changed-files review → BLOCK (6: 2 P1+2 P2+2 P3) → ALL reconciled primary-model-final + re-verified → confirming re-pass SHIP** — F1 cross-family gate not Groq-specific (`resolvedJudgeProvider()==="groq"` fix) + F2 vacuous live-harness ledger (the budget clone) were integrity bugs a green CI can't catch. **acceptance-gate → BLOCK (substance SOUND; caught a record-honesty defect I'd introduced — an overclaimed unreceived "SHIP" header) → 3 conditions discharged (raw verify + red-green + git-diff; confirming Codex SHIP + header fix; grill-basis) → re-stamp SHIP 5/5**. **Red-green:** disabling the loop's estimate-reservation turns the UNKNOWN_USAGE test RED (`expected +0 to be close to 0.0056` — the $0 spend-escape); restore → GREEN. Records: `docs/reviews/{codex,gate}-2026-06-28-a3-3*.md`.
    32	
    33	**Skills used:** advisor (pre-build design + reconcile), acceptance-gate (5-gate ship judge), codex-guarded (cross-model review). Commit owner-authorized via the RESUME DIRECTIVE; **push HELD** (no remote). NEXT = A3-4.
    34	
    35	## 2026-06-28 (A3-2b — Strategist live $0 Groq confirmatory eval; CLEARED the pre-registered anti-theater floor; label defers to A3-3)
    36	
    37	**Process:** per-slice A3 gate · low-risk (evidence/eval only — no product/core/behavior change; $0 free Groq; internal artifact) · Effort auto-routed. Pre-registered the floor bar BEFORE the run (R-DCAL-7 honesty discipline). Owner said "resume" → continued autonomously per the RESUME DIRECTIVE.
    38	
    39	**Did:** Built `evals/strategist.live.test.ts` (key-gated, auto-skips offline) — runs the LIVE Strategist on free Groq gpt-oss-120b over 4 same-play.touch/different-risk pairs × K=2 reps; asserts LIVE_AI ($0), per-merchant caution stable across reps, Low→standard / High→elevated on ALL pairs. Pinned the bar in `docs/strategist-confirmatory-status.md` BEFORE reading numbers. Ran live → **CLEARED**: Low→standard 4/4, High→elevated 4/4, 16/16 LIVE_AI, $0; snapshot `lib/data/strategist-confirmatory.snapshot.json` (captures the strategy/tone prose as samples for the A3-3 judge).
    40	
    41	**Verdict (per the pinned bar):** viable candidate; the `strategist` label **DEFERS to the A3-3 cross-family judge** (floor-not-ceiling — the structural caution axis is deterministically matchable AND the prompt states the rule, so the live pass confirms instruction-following, not certified judgment). Plan-step `agent` stays "tool"; public count stays "3 agents + a candidate".
    42	
    43	**Gate:** `npm run verify` green **277 + 5 skipped** (the live test skips in CI); differential lane UNTOUCHED. **Codex methodology review = BLOCK→2 reconciled primary-model-final + test-verified** — P1 (cost-honesty): the bare "$0/free" claim was overclaimed (the eval asserts the ledger, never meters billing); reframed to "Groq free-tier key, not metered" + a RULES §6 freshness check (groq.com/pricing 2026-06-28: gpt-oss-120b = $0.15/M in + $0.60/M out; ≈$0.003 if standard-billed; $0 on the free tier); P3: a stale "must beat strongRecommend" comment → floor-not-ceiling. Record: `docs/reviews/codex-2026-06-28-a3-2b-strategist-live.md`. The live floor result is unchanged (the findings were honesty-framing, not result-validity).
    44	
    45	**Next:** A3-3 (Drafter→Gemini OFFLINE machinery + §4.2 prevention wiring + the cross-family judge). Skills/tools: codex-guarded (A3-2b methodology review). Commit owner-authorized; push HELD (no remote).
    46	
    47	## 2026-06-28 (A3-2a — Strategist agent + anti-theater eval; Codex BLOCK→4 reconciled + test-locked; owner-authorized commit+push after the gate)
    48	
    49	**Process:** FULL (per-slice A3 gate) · risk: AI-behavior/architecture but offline/$0/reversible · Effort: MAX (owner-set this session; ship-gating architecture + AI behavior). Advisor called BEFORE writing (sharpened: floor-not-ceiling, red-green teeth, push-needs-genuine-Codex). Owner: "all approval given comit and push after codex and reconcillation done."
    50	
    51	**Did:** Built the Strategist seam offline-first — `strongRecommend` (the honest anti-theater BASELINE reading risk/tenure/engagement, which `diagnose().play` ignores) + envelope helpers + the LLM `strategistRecommend` (Groq `gpt-oss-120b`, DI `generate`, route-clamped, prompt withholds the raw merchant_name) in `lib/agents/strategist.ts`; `RecommendFn` sync-or-async + clone-isolation + honest plan-step `modelMode` in `lib/agents/loop/orchestrator.ts` (plan-step `agent` STAYS `tool` — tool-until-earned); `evals/strategist.test.ts` units + the anti-theater eval with explicit RED-GREEN. **Mid-build correction:** the orchestrator route-clamp (advisor-suggested) broke the R-LOOP-8b firewall *demonstration* (it muzzled the seeded "send anyway" recommendation) → reverted; clamping lives INSIDE `strategistRecommend`, the orchestrator stays the recommend-agnostic deterministic firewall.
    52	
    53	**Gate:** `npm run verify` green **277 + 4 skipped** (was 270; +7 regression tests); differential **20/20** UNTOUCHED. **Codex changed-files review (`codex-guarded exec -s read-only`) RAN → BLOCK (4: 1 P1 + 2 P2 + 1 P3) → ALL reconciled primary-model-final + fixed + test-locked**: F1 (P1) Strategist live-gate misrouted via `JUDGE_PROVIDER` → new `groqLiveEnabled()` (`ENABLE_LIVE_AI && GROQ_API_KEY`), used in `strategist.ts` + the identical latent `groq-draft.ts` (surfaced); F2 (P2) trajectory mode honesty (`Recommendation.mode`); F3 (P2) prompt-wiring regression-lock (export `buildStrategistPrompt` + fact/no-name asserts); F4 (P3) recommend mutation-isolation (defensive clone + async-mutator regression). Record: `docs/reviews/codex-2026-06-28-a3-2a-strategist.md`. **Confirming re-pass = SHIP** (all 4 findings confirmed resolved) → **A3-2a Codex gate FULLY DISCHARGED**.
    54	
    55	**Honest conclusion (floor-not-ceiling — advisor + Codex):** the structural discriminator (`caution`) is a finite enum a deterministic baseline computes perfectly → the eval is a NECESSARY anti-theater FLOOR (it FAILS a worse-than-baseline Strategist), NOT a label-earning ceiling → the `strategist` label DEFERS to the A3-3 cross-family judge; the "4 agents" claim = "3 + a candidate".
    56	
    57	**Next:** COMMITTED `32da7b1` (explicit paths). **PUSH (owner-authorized) BLOCKED — no git remote configured; surfaced to owner for a target.** Then A3-2b live $0 confirmatory eval. Skills/tools: advisor (×1), codex-guarded (review + confirming re-pass = SHIP).
    58	
    59	## 2026-06-27 (A3-1 — trajectory `agent` attribution (R-A3-6); test-verified + fully gated; Codex BLOCK→reconciled; UNCOMMITTED)
    60	
    61	**Process:** FULL (per-slice A3 gate) · low-risk (offline, $0, additive metadata field — no behavior/eligibility/send change) · Effort auto-routed (code: moderate; the Codex ship-gating review: xhigh). Advisor called BEFORE writing on the one judgment call (the agent-attribution mapping). Owner: "resume" / "complete it is past 7:40pm".
    62	
    63	**Did:** Added the first A3 slice — a `TrajectoryAgent` type + a **required** `agent` field on `TrajectoryStep` (`lib/agents/loop/trajectory.ts`), attributed every `record()` site in `lib/agents/loop/orchestrator.ts`, and added 2 R-A3-6 tests + a served-snapshot agent-lock (`evals/agent-loop.test.ts`). **Advisor cross-check changed the design:** my first instinct (label deterministic plan/reflect/route steps with agent roles now) was rejected for **tool-until-earned** (AM-2 "no agent costumes" + R-A3-1) — a step earns a role label only in the slice that wires its LLM AND clears its anti-theater seam-eval; until then `tool`. So only the genuinely-GENERATED `drafter` is an agent today; `strategist`→A3-2, `domain_critic`→A3-4, `router`→A3-5.
    64	
    65	**Gate (verify → Codex → acceptance-gate):** `npm run verify` **exit 0 — 257 passed + 4 skipped**, typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+frozen snapshots UNTOUCHED — `git diff` is only the 3 code files + state docs). **Codex changed-files review (`codex-guarded exec -s read-only`) RAN → BLOCK, 2 findings (1 P1 + 1 P2), 0 P0** → BOTH reconciled primary-model-final + fixed + **RED-GREEN-locked**: (P1) the `seedDraft` branch was mislabeled `drafter` — a fed-in fixture (`modelMode "REPLAY"`) is not Drafter-produced → now `tool`; (P2) the test only exercised the generated path → added a seeded test that FAILS at `agent-loop.test.ts:365` (`expected 'drafter' to be 'tool'`) if the fix is reverted. Record: `docs/reviews/codex-2026-06-27-a3-1-trajectory-agent.md`. **acceptance-gate:** gates 1/2/4/5 PASS; gate-3 SHIP on its own pre-committed flip condition (raw exit-0 verify + the 2 red-green demos — produced; the gate's formal re-stamp was first session-limited, re-run after 7:40 PM ET). Record: `docs/reviews/gate-2026-06-27-a3-1.md`.
    66	
    67	**Gotcha logged:** `codex exec` with a prompt arg ALSO reads stdin — without `< /dev/null` it blocks (caused a 7-min false timeout). Fixed.
    68	
    69	**Next:** A3-2 (Strategist agent on Groq via DI/mock offline + anti-theater seam-eval vs `diagnose().play`, R-A3-1). Skills/tools: advisor (×1), codex-guarded (review + confirming re-pass), acceptance-gate (×1). **Recommended non-blocking before any irreversible step:** the Codex confirming re-pass (run post-7:40 PM) + a formal gate re-stamp. UNCOMMITTED; commit owner-gated. git: HEAD `50bbfc8`.
    70	
    71	## 2026-06-26 (A3 — design/plan pass: 4-agent architecture settled + advisor-cross-checked + owner-gated; buildable spec written; NO code)
    72	
    73	**Process:** FULL · high-risk (architecture + AI behavior + public claim) · Effort MAX (auto-routed; Rule 0 — architecture is top-tier judgment work) · planning/design only, no product code. A3 opened with a design pass per the handoff ("Plan it, gate the plan, THEN build"). Owner: "resume."
    74	
    75	**Did:** Oriented on the A3 spec + the A2 single-agent loop it splits (`lib/agents/loop/orchestrator.ts`, `tools/registry.ts`, `loop/trajectory.ts`). Called the **advisor** (stronger-model cross-check) BEFORE committing to the architecture → it validated the boundary/contract/§4.2-wiring and sharpened: apply AM-2 to the Strategist too (must beat `diagnose().play`); the Router is the anti-theater crux (must beat `buildReflection`); don't manufacture a 4th agent to hit "4"; both judges stay Groq (Drafter→Gemini restores cross-family R-ARCH-3); add per-`agent` trajectory attribution now; HOLD the "directional" label (judges calibrated on the gold set, not yet on live Gemini prose); gate each agent separately, offline-first; re-set K. Surfaced the agent-count as an **owner decision** (AskUserQuestion) → owner chose **"Target the full 4"** (build all four, each gated by a seam-proof).
    76	
    77	**Wrote (durable):** `docs/plan-multi-agent-execution.md` **§11** (detailed A3: the 4 agents' seams + I/O, the Drafter↔Domain-Critic contract, §4.2 wiring, EARS **R-A3-1..9**, the build DAG **A3-0..8**, gates, cost shape, honesty notes); `docs/decision-log.md` row "A3 agent count = the full 4"; synced **PROJECT_STATE / CURRENT_TASK / HANDOFF** top blocks + a paste-ready A3-BUILD resume prompt. **No `lib/`/`app/`/test file touched** (design pass).
    78	
    79	**Gates / next:** the consequential decision (4-agent architecture) is **owner-gated** (AskUserQuestion). NEXT = **A3-1** (trajectory `agent` attribution, offline $0), then A3-2..A3-6 (mock/DI, $0), each gated `verify` → Codex changed-files review (`codex-guarded`) → `acceptance-gate`. A3-7 live Gemini run stays owner-gated. Skills/tools: advisor (×1), AskUserQuestion (×1). git: HEAD `50bbfc8`, tree clean but for untracked tooling; push owner-gated.
    80	
    81	## 2026-06-26 (Track B2 — Codex cross-model gate COMPLETED on the reset seat → SHIP; 3 findings fixed; B2 ship-gate FULLY DISCHARGED)
    82	
    83	**Process:** FULL · high-risk (ship-gating cross-model review on a public-surface AI-behavior slice; the §4.2 consequential-recommendation cross-check) · Effort xhigh (auto-routed; Codex gpt-5.5 @ xhigh). Advisor before spending the seat (pre-registered per-finding accept/refute discriminators + the "don't break AM-4" trap). Owner: "complete the OPEN Codex gate … reconcile primary-model-final … commit the reconciliation."
    84	
    85	**Ran:** the COMPLETE read-only Codex changed-files review — `~/claude-os/bin/codex-guarded exec -s read-only` over commit `6ea0549` (the 6 code/test files), `gpt-5.5` @ `xhigh`, CLI 0.136.0, session `019f069f`, full run ~212.5k tokens (seat reset — NOT limited this time). Smoke-tested the seat ALIVE (`SEAT_OK`) first; gave the 4 concrete gate-record targets + rejected the "mirrors faithfulness" discharge up front.
    86	
    87	**Verdict → reconciliation (primary-model-final):** VERDICT **SHIP**; all 4 targets CONFIRMED (advisory invariant = leaf field that protects the future live judge too · 75% mock-flag surface honest · audit honest · **§4.2 non-redundancy confirmed against the REAL gatekeeper + faithfulness code**). 3 findings, 0 P0/P1, ALL accept→fix: (F1, P2 `page.tsx`) Human-gate "Eligible and clean" → "Eligible by the deterministic core" + an advisory note when `domain_defective`; (F2, P3 `replay.test.ts`) the audit-wording test now bans `reject|block|gate|hold|prevent` on flagged entries; (F3, P3 `replay.test.ts`) the §4.2 demo test exercises the wired `mockDomainJudgeResult().verdict`. Codex independently confirmed `AuditEntrySchema` is enforced (not cosmetic) + the 5→8 renumber is correct, and did NOT push the trap (gate-the-send would break AM-4). Record: `docs/reviews/codex-2026-06-26-b2-domain-shipgate.md`; gate record flipped to gate-2 CLEARED.
    88	
    89	**Verified:** `npm run verify` green = **255 + 4 skipped**, exit 0 (count unchanged — assertions hardened + one call swapped, no tests added/removed); `npm run test:e2e` 4/4 (one first-navigation Playwright flake on the first run, clean on re-run — reported, not a regression); differential 20/20 (`lib/core`+oracle+gold+frozen snapshot UNTOUCHED). **B2 ship-gate FULLY DISCHARGED.** Reconciliation committed on top of `6ea0549`; push owner-gated. **NEXT = A3.**
    90	
    91	## 2026-06-26 (Track B2 — domain judge WIRED into the REPLAY ship-gate as the tertiary ADVISORY control; test-verified + acceptance-gate-reconciled; Codex review OPEN)
    92	
    93	**Process:** FULL · high-risk (ship-gate wiring + AI behavior on a public surface) · Effort HIGH (auto-routed; mirrors a proven pattern, not novel architecture). Advisor before writing (advisory-invariant + non-vacuous test shape) and at the completion checkpoint (caught the §4.2 0/20-inert gap + the open-gate framing). Owner: "resume b2".
    94	
    95	**Built (6 files, uncommitted):** `lib/replay/run.ts` — `ReplayMerchant.domainJudge: DomainJudgeResult | null` (mock, `$0`, gated on `gatekeeper.approvedForHumanReview`, parallel to faithfulness) + `"domain"` `AuditEntry` actor (after `judge`, before `eval`) + widened the actor union; `lib/agents/tools/schemas.ts` — mirror-fix (`"domain"` into `AuditEntrySchema`, restoring lockstep with the canonical type — the A1 `append_audit` tool derives from it, so the widening broke typecheck until fixed); `lib/agents/domain-judge.ts` — comment-only "secondary"→"tertiary" reconcile; `app/merchant/[id]/page.tsx` — "5 · Domain quality check" panel (Eval→6/Human→7/Audit→8); `evals/replay.test.ts` — 5 new tests; `evals/e2e/console.spec.ts` — section assertion.
    96	
    97	**Verified:** `npm run verify` green = **255 + 4 skipped** (was 250), exit 0; differential **20/20** (`lib/core`+oracle+gold+frozen snapshot UNTOUCHED, confirmed via `git diff --name-only`); e2e 4/4. **Red-green** for the ADVISORY invariant (mutation → `replay.test.ts:79` RED; restore → GREEN). **§4.2 non-redundancy demonstrated** (gatekeeper APPROVES + faithfulness PASSES + only `no_over_promise` FAILS on implied-typicality hype).
    98	
    99	**Gates:** `acceptance-gate` = BLOCK (procedural — no hard P0/P1; all 5 invariants honored on its read + advisor agreed) → gate-3 (verify) CLEARED with raw + red-green; 3 non-blocking items addressed. **Codex changed-files review OPEN** — seat ALIVE, review ran + surfaced 1 real finding (false "never auto-sent" copy → fixed primary-model-final) then hit the usage limit mid-review (raw surfaced; no retry). Complete review + §4.2 cross-check = DATED OBLIGATION (seat ~8:31 PM). Record: `docs/reviews/gate-2026-06-26-b2-domain-shipgate.md`. Commit + the Codex re-run are owner-gated.
   100	
   101	## 2026-06-26 (Track B1 — Codex cross-model gate RAN + reconciled → domain judge "calibrated — directional"; 2 P2 fixes)
   102	
   103	**Process:** FULL · high-risk (ship-gating cross-model gate on a calibration-honesty claim; AI behavior) · Effort xhigh (auto-routed; Codex gpt-5.5 @ xhigh). Advisor before the gate (approach + the flip-label nuance) and before the flip (tie-break + record-softening + coherence). Owner: "run the Codex cross-model review … reconcile primary-model-final … then flip."
   104	
   105	**Ran:** the mandatory Codex cross-model gate — `~/claude-os/bin/codex-guarded review --base 07e9a55` (gpt-5.5 @ xhigh, CLI 0.136.0, session `019f0571`) over the full B1 diff `07e9a55..HEAD` (18 files, +3686/−1; `07e9a55` verified = parent of the first B1 commit `db72461`, so one base covers B1a→B1d + discharges the B1-offline obligation). Independently re-confirmed the pre-gate tree green (243+4) first.
   106	
   107	**Verdict → reconciliation (primary-model-final):** 2 P2 *code* findings, 0 P0/P1, no honesty/overclaim finding (a code-scoped review). Both ACCEPT→FIX + test-locked: (B1-1) live partial-verdict acceptance — a schema-valid verdict with <3 dimensions computed `domain_defective` from the subset, so an omitted failed dimension read as passing → now requires all 3, else fails closed to the mock (`INCOMPLETE_VERDICT`); (B1-2) liveness read the faithfulness `JUDGE_PROVIDER` not `DOMAIN_JUDGE_PROVIDER` → new `domainJudgeLiveEnabled()` in the env single-source-of-truth. Calibration result provably unchanged (ran via explicit `live:true` / default-groq). Record: `docs/reviews/codex-2026-06-26-b1-domain-judge.md`.
   108	
   109	**Flip (R-DHON-3 + R-DHON-1):** docs flipped coherently in ONE pass — "directional / pending Codex" → **"calibrated — directional, pending the ~100 floor"** across `docs/domain-calibration-status.md` (line-3 logic rewritten, not find/replaced), `evals/domain-calibration.lock.test.ts` (header), PROJECT_STATE / CURRENT_TASK / HANDOFF, + forward-pointers on the two prior gate records. The "calibrated" word is carried by the cleared bar + eval-lock + acceptance-gate + the R-DARCH-2 leak-check, NOT by Codex's silence (it audits code, not prose).
   110	
   111	**Validation:** `npm run verify` green = **250 + 4 skipped** (+7 lock tests: 3 partial-verdict, 4 env-routing). `lib/core` + the differential oracle + the gold labels + the frozen calibration snapshot UNTOUCHED.
   112	
   113	**Honesty / owner gate:** committed 2026-06-26 (owner GO via "continue"); introducing "calibrated" into the honesty-sensitive docs is a public-claim change — owner-approved. **Push remains owner-gated** (RULES §12); not pushed. Skills/tools: advisor (×3 this session), codex-guarded (the gate), acceptance-gate (prior, referenced). NEXT = B2 + A3.
   114	
   115	## 2026-06-26 (Track B1d — LIVE domain-judge calibration: RAN + CLEARED the pre-registered bar; eval-locked; acceptance-gate engineering-SHIP)
   116	
   117	**Process:** FULL · high-risk (AI behavior, ship-gating calibration honesty) · Effort MAX (auto-routed). Advisor before the run (budget protection + decision-rule reading) and after (the κ=1.0 leak scrutiny). Owner: "Run B1d now."
   118	
   119	**Ran:** the live cross-family Groq `openai/gpt-oss-120b` domain judge over the 36-item synthetic gold set (K=3, temp 0, **$0**, 36/36 LIVE_JUDGE, 0 fallbacks; ~27 min). A **1-call smoke FIRST** (advisor) ruled out the strict-output→fallback-while-billing failure before the ~100K-token run — the one-shot/day budget was protected. **Held-out (test) recall/precision/F1 1.00 (CI95 [0.76,1.00], n=18), per-dim recall 1.00 each, κ 1.00, flip 0.00 → CLEARS all seven pre-registered thresholds** (`docs/domain-calibration-status.md`). No-leakage VERIFIED (R-DARCH-2) by reading the situation extractor + the recorded rationales (they isolate the right dimension; the engagement cross-dim precision 0.5 is a real-reasoning fingerprint, carried to B2).
   120	
   121	**Eval-lock (`1fcb492`):** `evals/domain-calibration.lock.test.ts` (R-DHON-4 frozen-fixture — asserts the committed snapshot clears the bar + real-run provenance; makes NO live call) + date-stamped `lib/data/domain-calibration.snapshot.json`.
   122	
   123	**Validation:** `npm run verify` green = **243 + 4 skipped** (the 4 live tests auto-skip offline → $0); `lib/core` + the differential oracle + the faithfulness gold UNTOUCHED.
   124	
   125	**Gates:** `acceptance-gate` = engineering **SHIP** (leak / non-vacuity / eval-lock / metric-math all independently cleared) with a doc-coherence **BLOCK** (the result was committed before the claiming docs were flipped → transient repo contradiction) → **RECONCILED** this commit (status + state docs flipped to one story; lesson: flip the claiming docs in the SAME commit as the result). Codex cross-model gate = **SEAT-BLOCKED** (usage limit, raw-surfaced, ~3:27 PM reset) → **dated obligation** (`--base 07e9a55` covers the full B1 diff, also discharging the B1-offline obligation). Record: `docs/reviews/gate-2026-06-26-b1d-live.md`.
   126	
   127	**Honesty held (R-DHON-1/3):** "RAN + CLEARED (DIRECTIONAL)", NOT "calibrated" — the calibrated label waits for the Codex gate + the ~100 floor; all gold positives SYNTHETIC (R-DCAL-4). Skills/tools: advisor (×3), acceptance-gate, codex-guarded (attempted). Commit per green slice (owner mode). No push (owner-gated).
   128	
   129	## 2026-06-26 (Track B1 — domain-quality "Effective"-axis judge: OFFLINE MACHINERY; acceptance-gate SHIP)
   130	
   131	**Process:** FULL · high-risk (AI behavior, calibration) · Effort MAX (auto-routed). Advisor-shaped before authoring (5 constraints folded into the spec). Owner: "continue building as per our plan."
   132	
   133	**Built (5 committed slices, each `verify`-green):** `db72461` B1a (spec `docs/spec-domain-judge.md` + rubric `lib/domain/effective-rubric.ts`) · `4096ebe` B1b (`lib/agents/domain-judge.ts` + 11 tests) · `f71c5c9` B1c (gold `evals/gold/domain-gold.ts` + harness `evals/gold/domain-harness.ts` + offline cal `evals/domain-calibration.test.ts`, 8 tests) · `2fc1f08` B1d (live runner `evals/domain-calibration.live.test.ts` + status `docs/domain-calibration-status.md` with the pre-registered bar) · `e201eee` honesty refinements (advisor). The Effective analogue of the P3 faithfulness judge: KB-cited rubric (matched/engagement/over-promise from `knowledge/domain/merchant-activation-kb.md`), **situation-in not answer-in** judge (R-DARCH-2 — withholds `diagnose().play`), gold positives gate-passing + faithful by construction, **R-DCAL-1 enforced LIVE** in the harness (caught + fixed one mis-constructed gold item), per-dimension metrics, the bar pinned before any number.
   134	
   135	**Validation:** `npm run verify` green = 236 + 4 skipped (the live cal test auto-skips offline); `lib/core` + the differential oracle + the faithfulness gold UNTOUCHED.
   136	
   137	**Gates:** `acceptance-gate` = **SHIP** (offline machinery, framed as method-not-calibrated-judge). Codex changed-files review = **SEAT-BLOCKED** (usage limit, raw-surfaced, ~3:27 PM reset) → dated obligation folded into the B1d Codex gate. Durable record: `docs/reviews/gate-2026-06-26-b1-offline.md`.
   138	
   139	**Honesty held:** NO "calibrated" claim anywhere; the live Groq calibration run + eval-lock + Codex gate are owner-gated (B1d, R-DHON-3). State docs synced to "B1 offline machinery done", never "B1 done". Skills used: advisor (review), acceptance-gate. Commit per green slice (owner mode). No push (owner-gated).
   140	
   141	## 2026-06-26 (Remove the auto-resume launcher — owner request; docs-only)
   142	
   143	**Process:** lightweight · low-risk · docs-only. Owner asked to "remove auto resume launcher."
   144	
   145	**Finding (surfaced, do-no-harm inspection before removal):** the "owner-installable launchd auto-resume" described in the state docs (`~/claude-os/bin/activationops-autoresume.sh` + a launchd job + `.claude/AUTORESUME_PAUSE`) **was never actually installed.** Verified: `launchctl list` has no matching job; no plist in `~/Library/LaunchAgents` (or `/Library/Launch*`); no `activationops-autoresume*` script anywhere under `~`; no `AUTORESUME_PAUSE` file; claude-os records no such install. It existed only as "owner-installable" text in 3 docs.
   146	
   147	**Action:** scrubbed the auto-resume references from `HANDOFF.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md` (replaced with "build continuation is manual / owner-driven" + a removal note). No code, no launchd/system change (nothing was installed to unload). No decision-log entry (the mechanism was never load-bearing — never installed). Commit owner-gated (RULES §12).
   148	
   149	## 2026-06-25 (MULTI-AGENT PIVOT — Phase 0: Codex gate → BLOCK → reconciled; ADR-002 + reversals + spec amendments)
   150	
   151	### Professional Process Applied
   152	Task type: governance — pivot-checkpoint + mandatory cross-model gate (no product code) · Stage: Phase 0 (Decide & gate) · Risk: HIGH (scope · architecture · AI behavior · public claims; reverses 3 logged decisions) · Mode: FULL · Effort: MAX, auto-routed (ship-gating governance on a major architectural pivot) · Basis: owner-approved brief `~/.claude/plans/read-last-handoff-and-snappy-ripple.md` + execution spec `docs/plan-multi-agent-execution.md` §4 (EARS R-P0-1..5); RULES §3/§6/§12/§14; playbook Decision-Reversal Rule + ADR format · Validation: Codex adversarial cross-check (primary-model-final) + a confirming pass + the §4.2 acceptance checklist · Codex: this step IS the gate (BLOCK→reconciled; confirming pass running) · Human approval: owner `/autopilot`+`/goal` toggle + commit (pending).
   153	
   154	### What was done
   155	- **Smoke-tested the Codex seat** (`codex-guarded`, owner doctrine — surface raw, no retry/downgrade/switch) → alive; ran the **adversarial cross-check** on the pivot → **BLOCK (9 findings)**, captured + reconciled all 9 under primary-model-final in `docs/reviews/codex-2026-06-25-multiagent-pivot.md` (none refuted — all honesty/scope/deterministic-first conditions; #6 + #7 caught real gaps the primary had under-specified).
   156	- **Authored ADR-002** (`docs/decisions/ADR-002-multi-agent-architecture.md`): the agent/tool line, named agents+tools, two-axis ship bar, Groq-loop/Gemini-final split, REPLAY-only posture, A1→A2→A3 with A2 as the early go/no-go; **Validation Needed makes P3 calibration a hard A2 prerequisite + the recommend-not-decide test-lock**.
   157	- **Recorded 4 decision-log rows** (2026-06-25): the pivot + the 3 reversals (drop-agentic→agentic deliverable · implicit single-agent→bounded multi-agent · integrations-deferred→transient demo — the last framed as a *satisfied* RULES §3 precondition, not a rule reversal, per Codex #8).
   158	- **Amended the execution spec** (`docs/plan-multi-agent-execution.md` §0): binding **AM-1..AM-8** + new **R-LOOP-1b** (recommend-not-decide invariant) + **R-LOOP-8b** (test-lock) + the inline R-LOOP-1 fix; the §0 block supersedes conflicting requirement text below it.
   159	- **Synced state docs:** PROJECT_STATE · CURRENT_TASK · HANDOFF (resume) · roadmap · this log · journal. Prior active task (UI Stage 2 + judge P3 calibration) re-labeled **subsumed** (calibration still completes — it IS the Faithfulness-reverse tool).
   160	- **Launched a confirming Codex pass** on the reconciled artifacts (running).
   161	- **No product code touched** (Phase 0 = governance only); `lib/core` + the differential oracle UNTOUCHED.
   162	
   163	### Skills / tools used
   164	- **Codex** via `~/claude-os/bin/codex-guarded` (shared-seat wrapper) — the mandatory cross-model gate (BLOCK → reconcile → confirm loop).
   165	- **advisor** (pre-substantive-work) — armed the Codex framing with current state + decision-log rows, flagged the unproven-catcher dependency, the reversal-(c) mis-framing, and commit hygiene.
   166	
   167	### Next
   168	Reconcile the confirming pass → owner commit (explicit paths) → owner toggles `/autopilot`+`/goal "<ship condition>"` → A1 (tool-ify the deterministic core).
   169	
   170	## 2026-06-22 (semantic judge — P3 infrastructure + live judge wired + calibration run; owner provided GROQ_API_KEY)
   171	
   172	### Professional Process Applied
   173	Task type: live-AI integration + calibration (P3) · Stage: execution, P3 of P0–P4 · Risk: medium (live model calls, but FREE tier $0; key owner-provided; no `lib/core` touch) · Mode: FULL · Effort: high, auto-routed (AI behavior + live integration) · Basis: spec `docs/spec-semantic-judge.md` R-ARCH-3/R-CAL/R-HON + 2 advisor reviews · Validation: offline suite green (192 + 2 skipped, both live tests auto-skip); key + strict-mode + reasoning-effort verified by live probes (raw errors read, not inferred) · Codex: P4 ship gate · Human approval: key was the owner-gated stop (provided); deploy + public posting still gated.
   174	
   175	### What was done
   176	- **Verified the owner's `GROQ_API_KEY`** without printing it: present/well-formed (gsk_, 56 chars), `.env` gitignored + untracked, HTTP 200, `openai/gpt-oss-120b` available + non-deprecated (RULES §6).
   177	- **Installed `@ai-sdk/groq@2.0.42`** (AI SDK v5 compatible — the approved P0 Source-Intake decision) and **wired the live Groq judge** in `lib/agents/semantic-judge.ts` `defaultJudgeGenerate` (strict `structuredOutputs: true` + `reasoningEffort: "low"`). Build-time strict-mode smoke: schema-valid JSON + correctly flagged a planted fabrication.
   178	- **Calibration runner** `evals/judge-calibration.live.test.ts` (key-gated, auto-skips offline): live judge over the 30-item gold set, K=3 reps, R-CAL-1 partition, writes the report; quality thresholds eval-locked at P4 (not here).
   179	- **Calibrated the judge prompt** (`buildJudgePrompt`, threaded `platformName`): a live run showed strong recall but precision dragged by the judge flagging the platform's own name + greeting framing as "unsupported" — root-caused + fixed (the email is sent BY the platform; skip its name + greetings). Raw probe confirmed the fix discriminates at low reasoning effort.
   180	- **Lowered `MAX_JUDGE_OUTPUT_TOKENS` 2000→1024** (Groq reserves max_tokens against the rate window).
   181	
   182	### The real limit (read verbatim, not inferred — advisor catch)
   183	The Groq 429 body names it: **tokens-per-day (TPD) = 200,000**, and 5 debugging/calibration runs this session used 199,981. NOT a code bug, NOT "free tier can't do it." With `reasoningEffort: "low"` a full run needs ~30K of 200K → feasible on a fresh daily window. Full honest status: `docs/judge-calibration-status.md`.
   184	
   185	### Next
   186	One clean calibration run on a fresh Groq daily window → held-out metrics → P4 (eval-lock + demo surfaces + Codex gate + flip docs ONLY if metrics clear the bar, R-HON-3). The garbage all-fallback snapshot was deleted (not committed); run-2 numbers deliberately NOT enshrined (no durable artifact).
   187	
   188	## 2026-06-22 (semantic judge — P2: gold set + metrics harness; offline/$0; goal mode)
   189	
   190	### Professional Process Applied
   191	Task type: eval-rigor build (calibration gold set + metrics harness) · Stage: execution, P2 of P0–P4 · Risk: medium (offline, $0; no `lib/core` touch) · Mode: FULL (calibration core; ship-gating) · Effort: high, auto-routed · Basis: committed spec `docs/spec-semantic-judge.md` (R-CAL-1…7, R-HON) + advisor review · Validation: typecheck + lint + 192 tests (+1 skipped) + build green; R-CAL-1 enforced LIVE against the real `runGatekeeper` · Codex: P4 gate covers it (changed-files pass optional at close) · Human approval: not needed (offline/$0, inside the approved plan); P3 live key stays owner-gated.
   192	
   193	### Skills / tooling used
   194	- `advisor` (stronger-model review) before writing the harness — surfaced the load-bearing constraint: test the metric MATH against hand-computed matrices (independent of any judge), run the mock judge only as a labeled "stub baseline," and enforce R-CAL-1 live (gold as typed TS literals, not pre-baked JSON). All adopted.
   195	
   196	### What was done
   197	- `lib/evals/judge-metrics.ts` — pure, independently-tested metrics: confusion matrix, precision/recall/F1, TPR/TNR, Wilson recall CI, Cohen's κ, test-retest flip-rate; `headlineReport` = recall on the gatekeeper-PASSING subset (R-CAL-1).
   198	- `evals/gold/semantic-judge-gold.ts` — stratified gold set as typed TS literals (**30 items**): 16 planted judge-territory positives across 4 failure modes (timeline/entity/capability/specific, **≥3 each, 9 in the held-out test split**) that survive the guardrail, 2 gate-caught positives (revenue%, state-mismatch) to exercise R-CAL-1 exclusion, 10 mock-clean + 2 real-supply (live-snapshot) clean negatives; objective field-entailment labels + critiques incl. SUPPORTED few-shot exemplars (R-CAL-5); tune/test split (R-CAL-6/7). All positives SYNTHETIC + labeled (R-CAL-4: the 6 recorded live drafts are well-grounded). Grown from an initial 21 to the R-CAL-2 ~30 floor after an advisor review flagged the held-out positive count (5) as too few for a meaningful P3 recall CI.
   199	- `evals/gold/harness.ts` — reusable wiring (gold → real gatekeeper + JudgeFn → labeled predictions); `mockJudgeFn` is the P2 stub; the same harness feeds the live cross-family judge at P3.
   200	- `evals/judge-calibration.test.ts` (16 tests) — metric math vs hand-computed matrices; κ/flip-rate vs known inputs; **R-CAL-1 enforced LIVE** (every item's real-gatekeeper approval == its declared expectation); R-CAL-4 probe; mock judge recorded as STUB BASELINE (not gated on a threshold).
   201	
   202	### Finding caught by the live enforcement
   203	R-CAL-1's live gatekeeper run caught a bad planted positive (`G-state-1`: "photos are already uploaded" — the state-consistency auxiliary slot allows one token, not "are already", so it didn't trip). Reworded to "photos have been uploaded and are live" → gate blocks it correctly. This is the value of enforcing, not asserting.
   204	
   205	### Next
   206	P3 (OWNER-GATED): free `GROQ_API_KEY` → run the live cross-family judge (Groq gpt-oss-120b) through this harness → real metrics + frozen calibration fixture. `lib/core` + differential untouched.
   207	
   208	## 2026-06-22 (doctrine alignment-audit — reconciled + committed; owner: "do all the fixes and commit, go till the end")
   209	
   210	### Professional Process Applied
   211	Task type: pre-deploy alignment audit + corrective fixes · Stage: pre-deploy hardening · Risk: low per slice (text/docs) except the eval-grader slice (logic — verified) · Mode: FULL (public-claim surface) · Effort: high, auto-routed (honesty invariant + AI behavior) · Basis: 3 read-only agents (project-advisor · guidelines-monitor · acceptance-gate) + claude-os doctrine + every finding independently re-verified against repo evidence · Validation: `npm run verify` green per slice (161 tests + 1 skipped) · Codex: the rebuild verdicts recovered into `docs/reviews/`; a fresh pre-deploy pass on the new slices recommended · Human approval: owner authorized the fixes + commits; deploy + live spend stay owner-gated.
   212	
   213	### What was done (7 committed slices)
   214	- `8b8a896` — honesty/accuracy: false "real businesses" copy → fictional-display; stale run-stats `$0.0036/4-2` → fixture `$0.0042/5-1`; test count → 157; softened the "authentic caught-failure" overclaim.
   215	- `c100f41` — NEW `no-leakage` eval grader (4th dim) catching the recorded raw-enum + risk-level leak; planted + real-output teeth; live prompt tightened; snapshot re-scored 3/4 leaky / 4/4 clean.
   216	- `93848de` — a11y: dim 11px text contrast → WCAG-AA (`text-neutral-500`) + skip-link.
   217	- `e675df0` — recovered the rebuild-era Codex verdicts from `/tmp` → `docs/reviews/` + INDEX; backfilled `docs/implementation-journal.md`.
   218	- `d799240` — state-doc sync to canonical facts + final verify (verify:full incl. 3 e2e green).
   219	- (slice 6) reconciled a fresh Codex BLOCK (gpt-5.5 xhigh, `docs/reviews/codex-2026-06-22-alignfix.md`, 11 findings): the runtime **gatekeeper now ENFORCES no-leakage** via a shared precise-denylist detector (`lib/agents/state-consistency.ts`) — closes the eval-scored-but-not-gated gap + removes the false-positive; footer + "caught-nothing" overclaim corrected; grader-list surfaces + eval-value lock added; review-doc whitespace stripped. **159 tests** + 1 skipped green.
   220	- (slice 7) reconciled the confirming Codex pass (`docs/reviews/codex-2026-06-22-confirm.md` — prior 11 verified closed; 4 second-order items): hyphenated-identifier + `risk is/=high` detector gaps closed; "3 of 6"→"3 of 5 parsed live" count precision; committed an explicit allow/deny regression suite for the detector. **161 tests** + 1 skipped green. A final confirming Codex pass closes the loop before T13.
   221	
   222	### Verification / honesty
   223	Every finding re-verified before acting. The acceptance-gate's HIGHEST-ranked "secret in `.env`" was checked with git and found a FALSE ALARM (gitignored/untracked/never-committed/deploy-excluded). Canonical facts: 161 tests (+1 skipped); live fixture 5 LIVE_AI / 1 fallback / $0.004203. `lib/core` + differential oracle untouched.
   224	
   225	### Next step
   226	Owner-gated **deploy (T13)** only; a fresh pre-deploy Codex pass on the 4 fix slices recommended. The UI-redesign exploration remains separate + in-flight.
   227	
   228	## 2026-06-19 (build session 2, continued — goal mode: Phases B + C + D-docs done + committed + green; live path ready for the owner key)
   229	
   230	### Professional Process Applied
   231	Task type: execution (goal mode — owner: "have a goal mode complete it" + "continue building") · Stage: execution (Phases B→D) · Risk: HIGH (architecture · AI · public docs) · Mode: FULL · **Effort: MAX (auto-routed)** · Basis: canonical plan + a `research-specialist` cited digest + resilix patterns + advisor cross-checks · Validation: `typecheck/lint/test/build` GREEN (50 tests; all routes prerender) · Codex: original slice reviewed; the B/C/D + live-hardening batch to be Codex-reviewed before deploy / with the live run · Human approval: commits = standing goal-mode approval (local-only, reversible); live spend + deploy + platform-name = owner-gated.
   232	
   233	### What was done
   234	- **Phase B domain depth** (`3c1540b`) — `lib/domain/diagnosis.ts`: engagement state + engagement-routed reactivation play + blocker_source; cited (`docs/research/merchant-activation-domain-2026-06-19.md`); add-alongside (core/differential untouched); surfaced on Merchant Detail.
   235	- **Phase C console** (`3ca6986`) — nav + Eval/Quality · Metrics · Audit · Cost surfaces (a11y-minded).
   236	- **Live-path hardening** (`b0acef4`) — injection cut (placeholder substitution; untrusted name never reaches the model) + cumulative budget ledger (`lib/agents/live-batch.ts`, fail-closed across a run). These are the Codex-P1 pre-live items.
   237	- **Phase D docs** (`89c7a00`) — `docs/WHY.md` (full why-chain + cross-industry note) + honest today-vs-target README rewrite (de-branded).
   238	- Reached the **autonomous frontier**: everything not owner-gated is built + green + committed. Live Gemini run (the headline) is owner-gated on the key (offered; safe-`.env` instructions given).
   239	
   240	### Compliance / scope
   241	Within the approved plan. All committed locally (no push). lib/core + the golden differential lane untouched. Honesty: simulated/synthetic labels; live AI off ($0 spend); no real-merchant claims.
   242	
   243	### Next step
   244	**T12 live Gemini run** (owner key + <$5) per the HANDOFF "READY FOR THE LIVE RUN" checklist → then **T13 deploy** (owner) ; **T10 full Playwright** deferred (build render-smokes pages); **T11 doc polish** optional.
   245	
   246	## 2026-06-19 (build session 2 — THIN VERTICAL SLICE complete + GREEN; at the Codex gate, then owner commit+deploy gates)
   247	
   248	### Professional Process Applied
   249	Task type: execution (autonomous build via `/autopilot`) · Stage: execution (walking skeleton) · Risk: HIGH (architecture · AI behavior · data sourcing · public surface) · Mode: FULL · **Effort: MAX (auto-routed — ship-gating/architecture)** · Basis: canonical plan `~/.claude/plans/gentle-forging-starlight.md` + resilix house patterns + 3 advisor cross-checks · Validation: `npm run typecheck/lint/test/build` all GREEN (41 tests, differential byte-identical, 23 pages prerendered) + Codex changed-files review (running) · Docs: PROJECT_STATE/CURRENT_TASK/HANDOFF/decision-log/tooling-ledger synced · Codex review: via `~/claude-os/bin/codex-guarded` · Human approval: **commit + Vercel deploy owner-gated (PAUSE).**
   250	
   251	### What was done
   252	- Built the full **thin vertical slice** (one merchant → end-to-end), all add-alongside — **`lib/core/*` + the golden differential lane untouched**: (1) hybrid dataset (real DataSF SF entities + deterministic synthetic overlay; adapter/sanitizer/guards in `lib/ingest/`; frozen `lib/data/sf-entities.snapshot.json`, PII-scrubbed; **NAICS measured sector-level → Restaurant/Retail crosswalk**); (2) bounded Gemini draft (`lib/agents/{budget,pricing,gemini,draft}.ts` + `lib/server/env-flags.ts`; $5 fail-closed budget; mock/live/FAILED_TO_FALLBACK; **live OFF, $0 spend**); (3) claims-gatekeeper (`lib/agents/gatekeeper.ts`); (4) draft-quality eval (`lib/evals/draft-quality.ts`, corrupted-record teeth); (5) REPLAY orchestrator (`lib/replay/run.ts`); (6) Overview + Merchant Detail surfaces (`app/`, de-branded "Curbside Commons").
   253	- **Git-drift corrected** — session-1 scaffold+core+state-sync are committed (`4de4503`); the "surface commit gate first" handoff step was already resolved by the owner.
   254	- **Advisor caught + fixed:** the untracked-files-invisible-to-a-diff-review footgun (→ `git add -N` before Codex), an "independent oracle" comment overclaim (fixed), and banked the Phase-B prompt-injection item.
   255	
   256	### Compliance / scope
   257	Within the approved plan (no scope change). Slice **uncommitted**, intent-to-added for the Codex diff. **No commit/deploy** (owner-gated, RULES §12). Honesty: simulated/synthetic labels present; live AI off; $0 spend; no real-merchant claims.
   258	
   259	### Next step
   260	Finish the Codex review (`/tmp/codex-verdict-activationops.md`) → apply accepted findings → **surface to owner: commit (grouped) + Vercel deploy** → widen Phases A→D with the Phase-B binding items (HANDOFF).
   261	
   262	## 2026-06-19 (MAJOR PIVOT — goal rebuilt to a deployed, industry-adoptable AI product; owner full-liberty GO; plan approved; /autopilot engaged; build deferred to a fresh session)
   263	
   264	### Professional Process Applied
   265	Task type: strategy + architecture re-scope (goal finalization) · Stage: research→plan→execution-boundary · Risk: HIGH (scope · architecture · public claims · data sourcing) · Mode: FULL · **Effort: MAX (auto-routed)** · Basis: 2026 US AI-demand research + competitive-gap research + 4-specialized-agent positioning validation (all cited/dated) + ~5 advisor cross-checks + resilix house-style lessons · Validation: positioning corrected against live sources (EU AI Act high-risk→Art 50; FTC *Air AI*→*Moffatt v. Air Canada*; governance-as-headline→domain-led) · Docs: approved plan `~/.claude/plans/gentle-forging-starlight.md` + decision-log row + state-doc syncs · Codex review: per-slice during the build (not this planning session) · Human approval: **plan APPROVED in plan mode; owner granted full liberty to rebuild.**
   266	
   267	### What was done
   268	- Reanalyzed the whole project under updated doctrine + the owner's question "is this a good 2026 US AI project that fills a real industry gap?" Verdict: strong rigor (evals/guardrails/HITL/deterministic-first) but the offline Python artifact reads as **"designed, not built"** (LLM still a stub; nothing deployed; no UI).
   269	- **Goal PIVOTED + approved (owner full liberty):** rebuild as a real, industry-ADOPTABLE, **deployed desktop AI product** for stalled/long-tail **merchant activation** — single-stack **Next.js+TS+Tailwind+React on Vercel (free)**, **port** the Python core (kept as `v1-python-prototype` tag + differential-test oracle), **real bounded Gemini** (eval-gated · claims-gatekeeper · <$5), **eval harness = spine**, **hybrid data** (real open-source + synthetic overlay), **equal-weight** Strategy/Ops/BA + deep applied-AI, full **why-chain**, **universally legible**, **desktop-only**, **adoption-grade**, job search in background. Canonical plan: `~/.claude/plans/gentle-forging-starlight.md` (incl. a binding Blindspots section).
   270	- **Pivot recorded across the repo:** decision-log 2026-06-19 row · PROJECT_STATE header · CURRENT_TASK (→ REBUILD) · HANDOFF (+ paste-ready resume prompt) · tooling ledger (this session's agents/tools) · roadmap DoD superseded-note.
   271	- **`/autopilot` engaged**; build order = thin vertical slice first → Phases A→D, each gated + Codex-reviewed; owner-gated stops = commits · dataset check-in · platform-name · public posting · irreversible.
   272	- Owner pointers handled: ignore AI Portfolio · keep merchant core · equal-weight AI + why-chain · hybrid data · universal legibility · job-in-background · `DesignSync`/`claude-design` flagged for Phase-C UI · `competitor-analysis` skill install **blocked** (untrusted-code classifier; non-blocking; owner can `!`-run it).
   273	
   274	### Compliance / scope
   275	Docs/planning only — **no** change to `scripts/`, `tests/`, source CSV, `out/`, `eval/`. **No commit** (owner decides — RULES §12). 35/35 + eval 20/20|45/45 remain the v1 proof + the differential oracle. Carried forward unchanged: merchant use case · deterministic-first→bounded-LLM · eval-first · free-first · prototype-not-service · honesty.
   276	
   277	### Next step
   278	**Build runs in a FRESH session** (context hygiene): paste the HANDOFF resume prompt → startup contract → `/autopilot` → dataset Source-Intake (safe default: synthetic-primary + real open-source entities) → thin vertical slice → Phases A→D.
   279	
   280	## 2026-06-12, second session (grill-me-codex Act 1 complete — 4 owner decisions locked; Act 2 blocked on the seat)
   281	
   282	### Professional Process Applied
   283	
   284	Task type: planning review gate (grill + cross-model review) + owner-input collection · Stage: T-003 pre-build · Risk: HIGH (AI-behavior-adjacent, public claims, data lane) · Mode: FULL · **Effort: MAX** · Basis: grill-me-codex skill (owner-chosen flow) + live code verification (grep before locking OQ-1) · Validation: 35/35 + eval 20/20|45/45 PASS re-run live at session start; OQ-1 rename verified safe against live code before locking · Docs: PLAN.md + PLAN-REVIEW-LOG.md + plan draft 3 + 4 decision-log rows + state-doc syncs · Codex review: Act 2 attempted — **seat dead, deferred with written reason (RULES §9)** · Human approval: 4 grill decisions collected; build GO withheld until Act 2 runs.
   285	
   286	### What was done
   287	
   288	- **Startup contract run; green reconfirmed live** (35/35 OK; eval MERCHANT 20/20 | GUARDRAIL 45/45 PASS; outputs to temp dirs; `out/` untouched).
   289	- **Codex seat smoke test FAILED** — `codex exec` (session `019ebd3f-d8f5-7090-bef3-c321256b272d`, gpt-5.5 @ xhigh) exited 1; raw usage-limit error preserved **verbatim** in `PLAN-REVIEW-LOG.md`. Per owner standing order: no retry/switch/cap-tracking; Act 2 deferred with written reason — **not skipped**; build stays blocked behind it.
   290	- **grill-me-codex Act 1 run with the owner — one question at a time, all 4 locked:**
   291	  - **OQ-1 (owner OVERRODE the keep+label recommendation):** "dont anything related doordash. keep company agnostic" → **rename the v1 CSV**. Live verification during the grill made it proof-safe: the filename literal exists only at [scripts/config.py:10](../scripts/config.py); frozen tests use `C.SOURCE_CSV`; the golden pins content sha256 (name-independent) → `git mv` + 1 config line, frozen tests unmodified. Follow-up surfaced live: the fixture *content* holds 11 DoorDash mentions + the v1 corpus keeps DoorDash test strings (un-editable without destroying the proof) → owner chose **label now + decide publish-vs-exclude at Phase 7** ("also scrub content" offered, not chosen).
   292	  - **OQ-2:** owner asked what the plan said (draft 2 left it open by design), then chose **COMMIT-FRESH** (gitignore rejected).
   293	  - **PLATFORM_NAME = "Curbside Commons"** (recommendation accepted; 2-min trademark/web collision check at S1, RULES §6).
   294	  - **Target market = US** (recommendation accepted; standing-constraints intake question closed).
   295	- **Artifacts written:** `PLAN.md` (grill-locked summary — the Act-2 entry point) · `PLAN-REVIEW-LOG.md` (Act 1 record; Act 2 BLOCKED with the verbatim error; carried challenge list + the new rename-re-pin completeness challenge) · [docs/phase3-prep-slice-plan.md](phase3-prep-slice-plan.md) → **draft 3** (decisions folded into S1/S3/S5, frozen-lane table, out-of-scope, OQ section, Codex-challenge list, next actions) · 4 decision-log rows (OQ-1 as a documented partial reversal) · open-questions intake Q3 resolved · CURRENT_TASK/HANDOFF/PROJECT_STATE synced; fresh paste-ready resume prompt.
   296	
   297	### Compliance / scope
   298	
   299	Docs/planning only — **no** change to `scripts/`, `tests/`, source CSV, `out/`, `eval/`, integrations. **No commit** (owner decides — RULES §12). Advisor tool unavailable this session (error surfaced; judgment proceeded per doctrine).
   300	
   301	### Update (same session): Codex Act 2 RAN + CONVERGED — VERDICT: APPROVED (4 rounds)
   302	
   303	Seat reset early (owner: "limits have resetted"); ran Act 2 live instead of the scheduled retry. **Converged in 4 read-only rounds** on a single Codex thread `019ebedb-da03-7db2-83c3-cc395e298e1a` (latest model @ xhigh; fixed harness — full `~/.npm-global/bin/codex` path, namespaced `/tmp/codex-verdict-activationops.txt`, full-stream capture, no `head`-pipe): **R1** 15 findings (all execution, none reopening a locked decision — all accepted → slice plan draft 4: mechanical hash-pins, anti-stub-leak fixtures, header-aware v2 adapter, lane-isolated v2 + lane-aware `eval.py`, committed nonzero-exit secrets/git-state hooks, OQ-1 scope honesty, provenance sidecar) → **R2** 8 resolved + 3 real clarifications (#3 required-positive family table, #6 reject-path demoed via S4 eval-corpus replay to satisfy the DoD walkthrough, #12 git-state mechanism + current-state-only scoping) + consistency pass → **R3** 1 residual OQ-1 wording drift → **R4** clean **APPROVED**. Claude = final arbiter throughout; full critique + per-round responses in `PLAN-REVIEW-LOG.md`. **No code written during the gate (RULES — Act 1/Act 2 are plan-only).** 35/35 + eval 20/20|45/45 PASS reconfirmed live post-convergence; `out/` untouched. **Next = owner GO/NO-GO on building T-003.** Process note: an early Act-2 attempt ingested a *different project's* stale verdict from the skill's shared `/tmp/codex-verdict.txt` (discarded under project-isolation); the grill-me-codex skill was hardened (namespaced paths + no-`head`-pipe What-NOT-to-do bullets) so it can't recur.
   304	
   305	### Update (same session, earlier): context doctrine encoded; Act 2 attempted twice — VOID then seat-exhausted
   306	
   307	(1) **Context doctrine encoded** (owner GO on Claude's offer): minimal · durable · fresh — context auto-adjusts by task, like effort. Encoded in `CLAUDE.md` (Operating Doctrine — Context), decision-log row (source-validated vs Anthropic context-management guidance), `~/claude-os/docs/CONTINUITY.md` (new section) + flags broadcast, persistent memory (`context-minimal-durable-fresh`). (2) **Codex seat returned (owner action); Act 2 round 1 attempted twice:** attempt 1 **VOID** — the orchestration pipeline's `head -1` SIGPIPE-killed codex mid-review AND the skill's shared `/tmp/codex-verdict.txt` still held a **stale verdict from another project** (supply-chain-ai-resilix, 15:44 mtime vs our 15:59 thread) — all 12 contaminated findings discarded (project isolation); **harness + grill-me-codex skill fixed** (namespaced per-project paths; full-stream capture; two new What-NOT-to-do bullets in the skill). Attempt 2 launched clean (thread `019ebd71-b670`) → **seat exhausted mid-run**; raw error verbatim in `PLAN-REVIEW-LOG.md` ("...try again at 8:30 PM."). Stopped per owner order. **Act 2 still owed; build still blocked behind it.** (3) Effort-doctrine validation note added to the decision-log row (official guidance cross-check).
   308	
   309	### Update (same session, owner-directed): effort doctrine corrected — AUTO-ADJUST by task
   310	
   311	Owner: "i said auto adjust the claude and codex according to the task i meant" (confirmed: auto-adjust **replaces** blanket MAX). One rule for both Claude and Codex: model + effort routed by task demands (ship-gating/architecture/AI-behavior/security/public-claims → max / Codex `xhigh`; trivial/low-risk → proportionally lighter); the per-stage "Effort:" declaration stays (now: routed level + why). Applied to `CLAUDE.md` (Operating Doctrine — Effort), decision-log supersede row, `CURRENT_TASK.md`, plan draft 3 Mode section, the HANDOFF resume prompt, and persistent memory. Historical task-log entries keep their original "Effort: MAX" wording (records, not rewritten). T-003's gate/build still routes to MAX/xhigh (ship-gating + high-risk), so the active task's effort is unchanged in substance.
   312	
   313	### Next step
   314	
   315	Smoke-test the seat → Act 2 (read-only loop, MAX_ROUNDS=5, against `PLAN.md`) → apply findings (rejections logged) → owner GO → build S1→S5.
   316	
   317	## 2026-06-12 (T-003 plan revision + contradiction reconcile + constraints intake; Codex gate = dated obligation)
   318	
   319	### Professional Process Applied
   320	
   321	Task type: documentation reconcile + plan revision + cross-model review (attempted) + standing-constraints intake · Stage: post-T-002, pre-T-003 build · Risk: medium (AI-evaluation contract + data lane + public-claims surface; **no** product code/tests/CSV/`out`/`eval` touched) · Mode: FULL · **Effort: MAX** · Basis: ratified 2026-06-11 DoD + Codex jobs `bvympilb4`/`bm0i9bxpy` findings + live code reads · Validation: 35/35 tests + eval 20/20|45/45 PASS re-run live at session start; Codex review of the revised plan **deferred with written reason (RULES §9)** — quota-blocked, dated obligation · Human approval: build GO withheld until the gate runs.
   322	
   323	### What was done
   324	
   325	- **Step 1 — blueprint-review contradiction reconciled:** the ledger was right — job `bm0i9bxpy` ran 2026-06-09 (NO-SHIP, no P0, 10 findings; honesty fixes applied — the blueprint's `(Codex P1/P2)` annotations are the internal evidence). Blueprint status header updated (review completed; serves as architecture reference under the ratified DoD; L4 = ceiling). Decision-log rows flipped to **Accepted-via-DoD** with notation: T-003 re-scope + HYBRID data (both were stale-Proposed after the 2026-06-11 ratification).
   326	- **Step 2 — [docs/phase3-prep-slice-plan.md](phase3-prep-slice-plan.md) rewritten as REVISED draft 2:** add-alongside v1/v2 (frozen-lane table; "regenerate golden = create v2, never overwrite v1"; draft 1's rename-SOURCE_CSV revoked); ratified **HYBRID** wording; slices in ratified build order (S1 de-brand → S2 draft contract → S3 v2 hybrid lane → S4 adversarial corpus → S5 hooks); both Codex jobs' findings folded in as constraints. **New live-code finding:** `false_impact_claim` is regex-anchored on `doordash` ([scripts/guardrail.py:29](../scripts/guardrail.py:29)) → de-brand must parameterize the detector (PLATFORM_NAME + real marketplace names + comparative negatives), proven by v1 staying 45/45 with zero corpus edits. New OQ-1 surfaced (frozen v1 CSV's DoorDash filename: recommend label-don't-rename; Codex/owner to challenge).
   327	- **Step 3 — Codex review: ORPHANED (quota).** `codex exec` ran 1h36m with zero output and **no session rollout ever created**; root cause verified from the 09:45 smoke-test rollout (`has_credits: false, balance: "0"`; capped until **2026-06-14 ~09:56** per `~/claude-os` STATE). Killed; recorded as a **dated obligation** in the plan status. **Build does not start before the gate runs** (owner may re-decide).
   328	- **Fold-ins:** stale `README.md` fixed (two claims were two phases behind — status + built-today lines now name T-001/T-002 green evidence); **2026-06-09 doctrine/blueprint task-log entry backfilled** (marked as backfill, evidence-based); CASE-STUDY built-vs-designed overclaim corrected ("removed all real-company branding" → decided-not-yet-built).
   329	- **Owner constraints intake (claude-os, owner-directed):** standing `PROJECT-CONSTRAINTS.md` adopted → decision-log row (2026-06-12, Accepted) + `CLAUDE.md` doctrine addendum + roadmap Phase-7 **specific expansion & adoption path** deliverable + plan S3 standing-constraint note + open-questions **product target-market intake question** (proposed default US, owner confirms).
   330	- **Owner session-management rule encoded** (memory + `CLAUDE.md` Handoff doctrine): proactively prompt a fresh session when the conversation runs long; stage-boundary cuts preferred; always with the paste-ready resume prompt.
   331	
   332	### Compliance / scope
   333	
   334	Docs/governance only — **no** change to `scripts/`, `tests/`, source CSV, `out/`, `eval/`, integrations. **No commit** (owner decides — RULES §12). Validation evidence: live 35/35 + eval PASS at session start; outputs to temp dirs.
   335	
   336	### Update (same day, owner-directed): "June-14 law" removed — no cap-tracking
   337	
   338	Owner pointed at the claude-os update (`tasks/flags.md` 2026-06-12): the capped-until-06-14 advisory is **stripped by owner order** — don't gate work on a remembered date; **smoke-test the seat, run the gate when it works, surface raw errors verbatim**, never silently retry or switch (seat/credits = owner action; a backup account with credits exists). Codex policy = **latest model + auto-routed effort** (ship-gating reviews → xhigh; config default `gpt-5.5` @ `xhigh`). Live re-check at the owner's request: login valid ("Logged in using ChatGPT", primary), but the smoke test still errors verbatim: *"You've hit your usage limit … purchase more credits or try again at Jun 14th, 2026 9:56 AM."* All state docs + the plan status reframed from "dated obligation" to **"pending a working seat."** Gate remains a RULES §9 deferral with written reason; build still does not start before it runs.
   339	
   340	### Next step
   341	
   342	Smoke-test the Codex seat → when alive, run the review of plan draft 2 → apply findings → owner GO → build T-003 slice-by-slice. Owner to answer: target market (default US?) + OQ-1/OQ-2 (can also ride the gate review).
   343	
   344	## 2026-06-11 (/claude-os goal reassessment — analysis + cross-model verdict; owner decision pending)
   345	
   346	### Professional Process Applied (analysis-only; recommendation owner-gated)
   347	
   348	Task type: post-stage analysis + goal reassessment (owner-triggered) · Stage: post-T-002, pre-T-003 · Risk: low for the analysis (read-only; no product code/tests/CSV/`out`/`eval` change); what it recommends is consequential (project goal/DoD) → owner decides · Mode: lightweight analysis, FULL validation on the recommendation (Codex cross-check per the operating doctrine) · Basis: Mandatory Startup Contract reads + repo evidence ([docs/open-questions.md](open-questions.md) open DoD question; decision-log 2026-06-09 north-star row's "enterprise-grade, interview-defensible AI build" rationale; [docs/roadmap.md](roadmap.md) L0–L4) + one read-only Explore subagent (repo inventory: ~1,364 code + 510 test lines vs ~6,000 doc lines; 39 docs) · Validation: Codex gpt-5.5/xhigh read-only cross-check via background `codex exec` (2026-06-11) — **AGREE on all 4 recommendations**, refinements adopted · Codex review: done (this task) · Human approval: **REQUIRED** — goal/DoD ratification is the owner's call; nothing changed beyond this log entry + tooling-ledger rows.
   349	
   350	### What was done
   351	
   352	- Ran the startup contract; re-derived git state live (`HEAD = 9958ec0`; the 2026-06-09 docs/governance batch still uncommitted, matching the state docs).
   353	- **Analysis finding:** the use case (merchant/funnel activation engine) is sound; the **objective** is the unresolved part — the project-level Definition of Done/audience has been the repo's own open question since 2026-06-01 while the roadmap's completion line stretched to L4 agentic. The owner's recorded rationale for the agentic north-star is itself "an enterprise-grade, **interview-defensible** AI build" — i.e., the ladder is a means, not the goal.
   354	- **Verdict (Proposed — owner ratifies):** (1) keep the use case (de-brand stands); (2) ratify a portfolio Definition of Done = de-branded public repo + T-003 + Phase 3 bounded LLM drafting (L1) green against the v2 baseline + a demo visibly showing hold/reject/send paths + the case-study/interview docs; (3) L2–L4 and live integrations become optional roadmap, re-approved only after L1 evidence (L4 stays the designed **ceiling**, not the completion bar); (4) process freeze — next sessions build T-003 (its hooks are enforcement against named recurring blockers, not new governance).
   355	- **Codex cross-check (gpt-5.5/xhigh, read-only):** AGREE ×4. Refinements adopted: Phase 4 (HITL delivery) is the preferred *optional stretch proof* if the owner wants a stronger workflow-automation signal (more concrete than an offline L4 toy); stopping at L1 undersells "agentic" unless the demo shows the safety paths + the deliberate-deferral rationale.
   356	- **Repo contradictions found and verified** (to fix in the next doc-sync, owner-approved): `README.md` stale ("Planning is closing" — pre-T-001 wording, two shipped phases behind); `CURRENT_TASK.md` says the blueprint is "pending Codex review" while [docs/tooling-and-skills-usage.md](tooling-and-skills-usage.md) records blueprint completeness review job `bm0i9bxpy` as already run (NO-SHIP, fixes applied) — reconcile which is true; the 2026-06-09 task-log entry says "coverage-designed **synthetic**" while the ratified decision-log row says coverage-designed **HYBRID** (open base + synthetic edges); the 2026-06-09 doctrine/blueprint session has **no task-log entry** (RULES §9 gap — this entry records the gap, the owner decides whether to backfill).
   357	- **Owner-directed doctrine addition (same session): free-first runtime stack** — every product-runtime tool defaults to free / free-tier / self-hostable OSS; sole paid runtime exception = Gemini API (best current model, **$5 hard total budget**, freshness/price-checked at use). Encoded in `CLAUDE.md` (Operating Doctrine) + `docs/decision-log.md` (2026-06-11 row, Accepted owner-directed). Costs the recommended Portfolio DoD nothing ($0 + Gemini <$5); optional Phases 4–6 already have free routes named in the roadmap.
   358	- **Owner-directed identity clarification (same session): prototype run on demand, not an operated service** — episodic demo/eval/walkthrough runs; no 24/7 operation, hosting, uptime, or ops requirements as goals; production scale stays a documented Enterprise Expansion Path; any approved integration phase = transient flow demonstration, not standing infrastructure. Encoded in `CLAUDE.md` (Operating Doctrine — Project identity) + `docs/decision-log.md` (second 2026-06-11 row).
   359	- **Owner-directed additions (same session): company-agnostic ratified** — the 2026-06-09 de-brand decision-log row flipped **Proposed → Accepted** on the owner's words ("Keep it company agnostic"); `PLATFORM_NAME` final pick + trademark check remain open · **Effort policy = MAX for every stage**, declared per stage in the Professional Process Applied block, common across all owner projects (third 2026-06-11 decision-log row) · **Project isolation** — owner runs multiple concurrent projects; never mix contexts/rules/state across repos. Encoded in `CLAUDE.md` (Operating Doctrine — Effort & project isolation).
   360	- **GOAL RATIFIED (owner GO: "Your call. continue")** — owner kept the framing **specific** (delegating the choice): exercised as **merchant onboarding & activation for a local-commerce delivery marketplace** (company-agnostic; fictional platform name pending trademark check; the "any funnel" generalization stays a portability note in the case study, not the identity). Ratification + full state sync (Effort: max): new decision-log row (Portfolio DoD; Phases 4–6 optional; Phase 7 pulled forward; L4 = designed ceiling); `docs/open-questions.md` project-level items marked resolved (incl. the long-stale GO/NO-GO item); `docs/roadmap.md` DoD block + ladder/table/phase statuses synced; `CURRENT_TASK.md` rewritten to the T-003 path; `HANDOFF.md` refreshed with a new paste-ready resume prompt; `PROJECT_STATE.md` header/next-step/handoff-notes synced (bottom note no longer carries a SHA — anti-drift). **No product code/tests/CSV/`out`/`eval` change; no commit (owner decides).**
   361	
   362	### Compliance / scope
   363	
   364	Analysis + this log entry + tooling-ledger rows only. **No** change to `scripts/`, `tests/`, source CSV, `out/`, `eval/`, state docs, roadmap, or blueprint. **No commit** (owner decides — RULES §12).
   365	
   366	### Next step
   367	
   368	Owner decides the goal anchor (full options in the session verdict): **(A)** ratify the portfolio DoD (recommended), **(B)** DoD + Phase 4 as optional stretch, or **(C)** keep full L4 as the completion bar. Then: reconcile the blueprint-review status contradiction → revise the T-003 plan to add-alongside → build T-003.
   369	
   370	## 2026-06-09 (Doctrine + agentic-architecture-blueprint session — BACKFILLED 2026-06-12)
   371	
   372	> **Backfill note:** this session originally closed without a task-log entry (RULES §9 gap, recorded by the 2026-06-11 entry; backfill directed by the owner-approved 2026-06-11 handoff). Written 2026-06-12 from repo evidence: `docs/decision-log.md` 2026-06-09 rows, [docs/tooling-and-skills-usage.md](tooling-and-skills-usage.md), the blueprint's `(Codex P1/P2)` annotations, and the untracked-file set in `git status`.
   373	
   374	### Professional Process Applied (reconstructed)
   375	
   376	Task type: architecture + governance documentation · Stage: post-T-002, pre-T-003 · Risk: medium (target-architecture claims + public-portfolio artifacts; no product code/tests/CSV/`out`/`eval` changed) · Mode: FULL for the blueprint (architecture; broad source discovery), lightweight for doc syncs · Effort: MAX · Validation: 7-domain Tier-1 source sweep + Codex blueprint completeness review (job `bm0i9bxpy`) · Human approval: doctrine items owner-directed; blueprint left Proposed.
   377	
   378	### What was done
   379	
   380	- **Owner doctrine encoded** in `CLAUDE.md` (Operating Doctrine, 2026-06-09) + `docs/decision-log.md`: Codex pinned gpt-5.5/xhigh (review/rescue only, $20 plan); Gemini gated (<$5, freshness-checked); free/OSS alternative named per paid tool in public docs; paste-ready resume prompt every handoff; recommendation validation + Codex cross-check on consequential calls.
   381	- **North-star flipped (owner-directed):** full HITL *agentic* system as **target** (governed agency) — deterministic core/guardrails/approval gate become the agent's tools + rails; V1 claims unchanged (decision-log row).
   382	- **Authored** [docs/architecture/agentic-architecture-blueprint.md](architecture/agentic-architecture-blueprint.md) on a 7-domain discovery sweep (Anthropic agents, OpenAI guardrails, OWASP LLM/Agentic, NIST AI RMF/GenAI, 12-Factor-Agents, OTel GenAI, DeepEval/promptfoo/RAGAS — see ledger) + 5 new visuals (`agentic-workflow`, `autonomy-ladder`, `controls-map`, `data-lineage`, `eval-harness` .mmd) + visuals README/architecture/v1-thin-slice syncs.
   383	- **Codex blueprint completeness review** (job `bm0i9bxpy`): **NO-SHIP, no P0; 10 findings** (rename-SOURCE_CSV must be add-alongside; pipeline can't ingest v2; approval-gate overclaim; autonomy gates not auditable; visuals overstate eval; traceability/built-vs-target overclaims). **Honesty fixes applied to the blueprint same day** (the `(Codex P1/P2)` annotations); deeper acceptance-criteria deferred to T-003 build.
   384	- **Prompt Intake Protocol** created ([docs/prompt-intake-protocol.md](prompt-intake-protocol.md)) + `RULES.md` §16 + `CLAUDE.md`/`CODEX.md` wiring (owner non-negotiable).
   385	- **Source & Validation Depth standard** added to the playbook (two-source/triangulation/IFCN-grounded) + Expert & Industry-Practice validation step.
   386	- **Standing deliverables started** (owner-requested): [docs/CASE-STUDY.md](CASE-STUDY.md) + [docs/INTERVIEW-WALKTHROUGH.md](INTERVIEW-WALKTHROUGH.md) (living docs; owner polishes at completion). **Tooling/skills usage ledger** created ([docs/tooling-and-skills-usage.md](tooling-and-skills-usage.md), standing maintenance rule).
   387	
   388	### Compliance / scope
   389	
   390	Docs/governance only — **no** change to `scripts/`, `tests/`, source CSV, `out/`, `eval/`, integrations; **no commit** (owner decides, RULES §12). Gap acknowledged: the session itself skipped this log entry at close (process finding; the 2026-06-11 session caught it).
   391	
   392	## 2026-06-09 (Public-posting pivot — de-brand decision + live-API-vs-synthetic Codex review)
   393	
   394	### Professional Process Applied (full intake on a high-impact public-facing choice; decisions owner-gated)
   395	
   396	Task type: source/pattern intake + scope decision + cross-model review · Stage: pre-Phase-3 · Risk: low-medium (decisions touch public claims + data strategy; **no** product code/CSV/`out`/`eval` changed — planning only) · Basis: owner directive (go agnostic; consider live public-data APIs; check with Codex), RULES §4/§6/§7/§8/§11, advisor, and an independent `codex exec` adversarial review · Validation: cross-model convergence — Codex gpt-5.5 (xhigh, read-only) + Claude + advisor, each grounded in the repo files · Codex review: **done** (session `019eac95`, neutral fork, told to argue the other side) · Human approval: **required** to ratify the 3 Proposed decision-log rows + pick `PLATFORM_NAME`.
   397	
   398	### What was done / decided
   399	
   400	- Owner decided **company-agnostic** framing. Recommendation: keep **ActivationOps AI** (engine) + a fictional `PLATFORM_NAME`; real companies as comparisons only.
   401	- Owner proposed **live free public data APIs** to cover edge cases → put to a neutral cross-model adversarial review → **no-ship as a runtime/eval source** (Codex + Claude converged on the merits): live data can't supply the targeted business-state edge cases (opt-out / suppression / malformed email / guardrail-reject), breaks the golden-label eval (E7/E8), and puts real businesses in a fabricated risk narrative. **Decision (Proposed): coverage-designed synthetic dataset**; optional later non-gating fetch-once/scrub/freeze ingestion experiment.
   402	- Folded all of it into [docs/phase3-prep-slice-plan.md](phase3-prep-slice-plan.md) (now the combined pre-Phase-3 plan) + Codex's "what's missing" (explicit contact-safety data cases + a coverage matrix); added 2 Proposed `docs/decision-log.md` rows (de-brand; data-sourcing — supersedes the 2026-06-01 fixtures-only row).
   403	- Name check: "Forkful" rejected (real company); "MarketLane" candidate (not web-verified); "Acme Marketplace" zero-risk fallback.
   404	
   405	### Scope
   406	
   407	Planning/docs only. **No** change to `scripts/`, `tests/`, source CSV, `out/`, `eval/`, or integrations. Decisions are **Proposed** (owner ratifies). Codex job recorded (session `019eac95`).
   408	
   409	### Next step
   410	
   411	Owner: ratify the 3 Proposed rows + pick `PLATFORM_NAME` + answer the open question (optional ingestion experiment yes/no) → build T-003 (de-brand + synthetic dataset → eval coverage → hooks).
   412	
   413	## 2026-06-09 (/claude-os analysis + Phase-3-prep planning — re-scoped the pre-Phase-3 gate)
   414	
   415	### Professional Process Applied (analysis = lightweight; plans full work)
   416	
   417	Task type: post-stage analysis + source-intake + planning · Stage: post-T-002, pre-Phase-3 · Risk: low (read-only analysis + docs/planning; **no** product code/tests/CSV/`out`/`eval` touched) · Mode: lightweight (the plan doc); what it *plans* is Codex+owner-gated · Basis: `RULES.md`, enterprise-delivery-playbook, **live execution** + direct reads of `scripts/eval.py` + `eval/golden_merchants.v1.json` + `scripts/pipeline.py` · Validation: re-ran 35/35 tests + eval PASS (2026-06-09); read the eval scoring code to confirm coverage · Skills: `/claude-os` (entry ritual, used as a **lens** — the project's own OS is the system of record; did **not** scaffold competing claude-os ledgers) · Codex review: **required** on the new plan (`/codex:adversarial-review`) — not yet run · Human approval: **required** before building T-003 or starting Phase 3.
   418	
   419	### What was done
   420	
   421	- **Verified state by execution** (not trusting docs): `python3 -m unittest tests.test_t001 tests.test_t002` → 35/35 OK; `python3 scripts/eval.py` → MERCHANT 20/20 | GUARDRAIL 45/45 | PASS.
   422	- **Found the headline gap:** the T-002 baseline scores only deterministic fields ([scripts/eval.py:25](../scripts/eval.py:25)); Phase 3 replaces only `make_draft()` ([scripts/pipeline.py:112](../scripts/pipeline.py:112)), whose generated text no golden field observes → a green baseline does not measure what Phase 3 changes.
   423	- **Drafted** [docs/phase3-prep-slice-plan.md](phase3-prep-slice-plan.md) — **T-003** (generator-agnostic draft contract + adversarial guardrail corpus + secrets/git-state enforcement hooks), framed for Codex plan review + owner GO. Added a **Proposed** decision-log row (re-scope).
   424	- **Cleanups:** `.gitignore` now ignores `RULES_CONFIG_DUMP.txt` (regenerable dump generated 2026-06-06, was untracked + unrecorded); corrected the recurring git-state drift (docs read `HEAD = dc7d131`, actual `9958ec0` — the 4th occurrence) in `PROJECT_STATE.md` / `CURRENT_TASK.md` / `HANDOFF.md`.
   425	- Absorbed 3 generalizable lessons into the cross-project `~/claude-os/tasks/lessons.md` (control-not-enforced-at-gate drifts; a green eval can measure the wrong thing; `/claude-os` is a lens on a project that has its own OS).
   426	
   427	### Compliance / scope
   428	
   429	Docs + `.gitignore` only. **No** change to `scripts/`, `tests/`, source CSV, `out/`, `eval/`, or integrations. **No commit** (owner decides — RULES §12). The re-scope is **Proposed**, not Accepted.
   430	
   431	### Next step
   432	
   433	Owner: `/codex:adversarial-review` on the T-003 plan → apply findings → GO/NO-GO + ratify the decision-log row → build T-003 (one part at a time) → then the Phase-3 plan (FULL workflow).
   434	
   435	## 2026-06-04 (Decision-log ratifications — guardrail hardening + baseline artifact policy)
   436	
   437	### Professional Process Applied (lightweight)
   438	
   439	Task type: governance/decision documentation · Stage: post-T-002-merge, pre-Phase-3 · Risk: low · Mode: lightweight · Basis: owner directive ratifying two recommendations from the build-process compliance audit · Validation: decision-log row-format consistency; facts already verified in the audit (35/35 + eval PASS + 8 Codex rounds) · Human approval: owner-directed (= approval) · Codex review: optional.
   440	
   441	### What was done
   442	
   443	- Added two `docs/decision-log.md` rows (2026-06-04): (1) **`pii_or_secret` guardrail hardening** (assignment-form detector; safety-improving T-001 behavior change exposed by T-002; closes the audit's traceability finding, check #5); (2) **`eval/eval_baseline.v1.json` committed under `eval/` (not `out/`)** as the locked pre-Gemini baseline evidence.
   444	- Synced the dependent docs in the same task (to avoid the partial-drift the audit flags): `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md` next-step lines, and the audit's Recommendations + pre-Phase-3 checklist items #2/#3 (marked done).
   445	
   446	### Compliance / scope
   447	
   448	Docs only. **No** change to `scripts/`, `tests/`, source CSV, `out/`, `eval/`, integrations. **No commit** (owner decides). Tests reconfirmed 35/35.
   449	
   450	### Next step
   451	
   452	Owner clears the remaining pre-Phase-3 gate items (git-state enforcement at task-close; `out/` log + enforcement-hooks decisions; baseline acceptance) before any Phase-3 work.
   453	
   454	## 2026-06-04 (Retrospective build-process compliance audit — planning → T-002 merge)
   455	
   456	### Professional Process Applied (full-but-narrow)
   457	
   458	Task type: post-stage build-process compliance audit · Stage: post-T-002-merge, pre-Phase-3 · Risk: low–medium · Mode: full-but-narrow (reads broadly, edits surgically) · Basis: `RULES.md`, `CLAUDE.md`, `CODEX.md`, `docs/enterprise-delivery-playbook.md`, the 8 in-session Codex reviews, git history · Source requirement: repo + git + **live test/eval execution** (primary evidence) · Validation: re-ran 35/35 tests + eval PASS; re-derived git state; verified each Codex finding's resolution in the committed tree · Codex review: recommended (confirming `/codex:review` of this batch) · Human approval: not required for the audit + continuity corrections (task pre-authorized "update state docs only if needed"); required for the recommended decision-log row, the `t002-slice-plan.md` fix, and any commit.
   459	
   460	### What was done
   461	
   462	- Created [docs/audits/build-process-compliance-audit.md](audits/build-process-compliance-audit.md) — answers all 11 audit checks with evidence, verdict, what-worked, repeated-failure-patterns, and a **pre-Phase-3 lightweight checklist**.
   463	- **Corrected the recurring git-state drift** in `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`: they still read `feature/t002-eval-harness` / `HEAD = 1a0dbd0` / "uncommitted" after T-002 had been committed (`a95c0f1`) and merged to `main` (`dc7d131`). As-found text is quoted verbatim in the audit before correction.
   464	
   465	### Verdict (summary)
   466	
   467	Process followed well. **Strong:** every phase had planning → validation → Codex review → owner gate; T-002 passed 8 Codex rounds with **every finding resolved before commit** (two became permanent tests E1b/E2b; one became a hardened detector); 35/35 tests + eval PASS verified by re-execution; no integrations/secrets/CSV-edits/`out/`-pollution. **Material recurring failure:** git-state line drifted again at the merge gate — a control for exactly this exists (it was created because the line went stale 3× in T-001) but was not run at task-close. **Traceability gap:** the `pii_or_secret` guardrail hardening (a T-001 behavior change) was folded into T-002 without a decision-log row and initially mis-stated as "T-001 unchanged" — beneficial, low-risk, and caught by Codex.
   468	
   469	### Recommendations (proposed, not done — owner disposes)
   470	
   471	Add a `docs/decision-log.md` row for the guardrail change; fix the residual `out/eval_baseline.v1.json` reference in `docs/t002-slice-plan.md`; run a confirming `/codex:review`; optionally delete/fast-forward the stale `feature/t002-eval-harness` branch.
   472	
   473	### Compliance / scope
   474	
   475	Review + continuity-doc corrections only. **No** change to `scripts/`, `tests/`, source CSV, `out/`, `eval/`, integrations; **no** `decision-log` edit (recommended only); **no commit** (owner decides).
   476	
   477	### Next step
   478	
   479	Owner reviews the audit; decides the recommendations; clears the pre-Phase-3 gate before any Phase-3 (Gemini) work.
   480	
   481	## 2026-06-04 (T-002 implementation — eval harness, branch `feature/t002-eval-harness`)
   482	
   483	### Professional Process Applied (lightweight)
   484	
   485	Task type: offline eval harness implementation · Stage: Phase 2 build · Risk: low-medium · Mode: lightweight · Basis: [docs/t002-slice-plan.md](t002-slice-plan.md) · Validation: `python3 -m unittest tests.test_t001 tests.test_t002 -v` + `python3 scripts/eval.py` · Codex review: pending · Human approval: required before commit/merge.
   486	
   487	### What was done
   488	
   489	- `eval/golden_merchants.v1.json` — 20 merchants + aggregate expectations + `source_csv_sha256` from canonical pipeline.
   490	- `eval/guardrail_regression.v1.json` — **45** cases (5 T-001 regex parity, 1 structural `state_mismatch`, 6 extra positives, 8 near-miss negatives, 20 source nudges, 5 stub-clean).
   491	- `scripts/eval.py` — golden compare, regression scoring (inclusion for positives; exact-empty for negatives/source/stub), CLI; default baseline `eval/eval_baseline.v1.json` (not `out/`).
   492	- `tests/test_t002.py` — E1–E10.
   493	- Updated `docs/t002-slice-plan.md` status, `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`.
   494	
   495	### Validation
   496	
   497	- **35/35 OK** (T-001 23 + T-002 12).
   498	- `python3 scripts/eval.py` → **MERCHANT 20/20 | GUARDRAIL 45/45 | PASS** (exit 0).
   499	
   500	### Notes
   501	
   502	- `GR-POS-009` text adjusted for `pii_or_secret` regex (original api_key string did not flag).
   503	- Source CSV and `out/` not modified. T-001 behavior/tests unchanged. **No commit.**
   504	
   505	### Next step
   506	
   507	Owner review → Codex `/codex:review` → commit/merge when approved.
   508	
   509	## 2026-06-04 (T-002 slice plan — `docs/t002-slice-plan.md`, docs only, lightweight)
   510	
   511	### Professional Process Applied (lightweight)
   512	
   513	Task type: T-002 planning documentation · Stage: post-roadmap, pre-T-002 implementation · Risk: low · Mode: lightweight · Basis: approved Cursor T-002 plan + [docs/roadmap.md](roadmap.md) Phase 2 + [docs/decision-log.md](decision-log.md) eval-first ratification · Validation: slice plan completeness vs ratified scope; no product files touched · Human approval: required before T-002 implementation · Codex review: deferred until implementation slice.
   514	
   515	### What was done
   516	
   517	- Created [docs/t002-slice-plan.md](t002-slice-plan.md) — build spec for **Offline Evaluation and Regression Harness**: problem statement, proposed file layout (`eval/`, `scripts/eval.py`, `tests/test_t002.py`, `out/eval_baseline.v1.json`), golden label schema (`golden_merchants.v1`), regression corpus (`guardrail_regression.v1`), metrics object, tests **E1–E10**, validation commands, GO/NO-GO, out-of-scope list.
   518	- Synced `CURRENT_TASK.md` (active task = T-002-PLAN, implementation not started), `HANDOFF.md`, `PROJECT_STATE.md`, this log.
   519	- Tool: Cursor (Composer). **No** `decision-log` entry (no new architecture decision).
   520	
   521	### Compliance / scope
   522	
   523	**No** `scripts/`, `tests/`, source CSV, `out/`, `eval/`, integrations, plugins, hooks, or commit. T-002 **implementation not started**.
   524	
   525	### Next step
   526	
   527	Owner reviews slice plan → approves separate T-002 implementation task (golden JSON, regression JSON, eval runner, E1–E10 tests) → Codex review before merge.
   528	
   529	## 2026-06-02 (Roadmap Codex-review correction — `docs/roadmap.md` + state docs, lightweight)
   530	
   531	### Professional Process Applied (lightweight)
   532	
   533	Task type: roadmap doc correction after Codex review · Stage: post-roadmap-review, pre-commit · Risk: low · Mode: lightweight · Validation: owner's grep checks + a phase-number consistency sweep · Human approval: required before commit.
   534	
   535	### Codex review (read-only, working-tree)
   536	
   537	Ran the installed `openai-codex` adversarial review (`sandbox: read-only`) on the roadmap batch. **Verdict: needs-attention.** Two [medium] findings: (1) the roadmap made **Project Operating Model and Governance** a numbered product build phase (process-as-product, against the ratified applicability packet's product-first principle); (2) two state docs still listed the **eval-first T-002 ratification** as an open follow-up although it is already ratified in `docs/decision-log.md`.
   538	
   539	### Fixes applied (this correction)
   540	
   541	- **Fix 1 — governance recast as Foundation.** In `docs/roadmap.md`, **Project Operating Model and Governance** is now a completed **Foundation** (kept as context — it was real work and protects execution), not a numbered phase. The product phases are renumbered **1–7** (1 Offline Vertical Slice **done**, 2 Offline Evaluation and Regression Harness = T-002 **next**, 3 Bounded LLM Drafting, 4 Persistence & Provenance Upgrade, 5 HITL Delivery Workflow, 6 Orchestration & Monitoring, 7 Public Demo & Portfolio Narrative). All in-doc phase-number cross-references updated. No framework appendix; no forbidden public-claim terms.
   542	- **Fix 2 — stale ratification follow-ups cleared.** Removed the "ratify eval-first T-002 ordering" open item from `CURRENT_TASK.md` (hygiene follow-ups) and `PROJECT_STATE.md` (Open Questions); kept the genuinely-open items (`out/` log policy; enforcement-hooks decision). Eval-first T-002 is ratified in `docs/decision-log.md`.
   543	- Synced the "8 phases" framing to **Foundation + 7 phases** across the state docs.
   544	
   545	### Compliance / scope
   546	
   547	Updated only `docs/roadmap.md` + the four state docs. **No** `decision-log` change; **no** new files; **no** product code/tests/CSV/`out`/integration change; nothing installed/adopted; **no commit** (owner decides). **T-002 not started.**
   548	
   549	### Next step
   550	
   551	Owner reviews + (if satisfied) commits the roadmap batch; then scope **T-002 — Offline Evaluation and Regression Harness** as a separate task.
   552	
   553	## 2026-06-02 (Roadmap creation — `docs/roadmap.md`, lightweight, documentation only)
   554	
   555	### Professional Process Applied (lightweight)
   556	
   557	Task type: roadmap documentation · Stage: post-applicability-review, pre-T-002 · Risk: low-medium · Mode: lightweight · Basis: the Codex-revised + ratified applicability review + the built T-001 state; product-first, layperson-legible, public-claim controlled (`RULES.md` §4/§7/§8) · Validation: forbidden-term grep on the roadmap + consistency with built state · Human approval: required before commit.
   558	
   559	### What was done
   560	
   561	- Created `docs/roadmap.md` — a short, product-first roadmap: **Current Status**, a plain **Product Lifecycle** loop (Discover → Source Intake → Plan → Build → Validate → Review → Document → Handoff → Decide Next Stage), **product-first Build Phases**, a plain **Why T-002 Comes Before Gemini**, **per-phase details** (goal / build / validation / out-of-scope / trigger), a tiny **Terminology note** (no framework-mapping section), and a **What Not To Do Yet** list. *(Phase structure was corrected in the follow-on Codex-review correction above: governance → Foundation; product phases renumbered 1–7.)*
   562	- Uses the ratified **T-002 = Offline Evaluation and Regression Harness**. Honest framing throughout: simulation on dummy data, CSV protected, fully offline, T-002 ratified but not started, Obsidian vault separate.
   563	- Synced `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / this log; re-derived git (`HEAD = 78dc694` — the applicability review + revision are committed).
   564	
   565	### Validation
   566	
   567	- Forbidden-term grep on `docs/roadmap.md` → **0** real matches (production-grade / enterprise-scale / autonomous / deployed-to-production / real-impact / NIST / SSDF / DORA / SRE / SOTA / benchmark / agentic / compliant all absent; the only "NIST" hits were the substring inside "deter**minist**ic"). Ratified T-002 name present (3×), no stale name. All 8 required sections present.
   568	
   569	### Compliance / scope
   570	
   571	Documentation only. Created `docs/roadmap.md`; updated the four state docs. **No** `decision-log` change (no new decision); **no** product code/tests/CSV/`out`/integration change; nothing installed/adopted; **no commit** (owner decides). **T-002 not started.**
   572	
   573	### Next step
   574	
   575	Owner reviews + approves `docs/roadmap.md` (and commits this batch) → then scope **T-002 — Offline Evaluation and Regression Harness** as a separate task.
   576	
   577	## 2026-06-02 (Codex adversarial review of the roadmap applicability packet + one revision pass — lightweight)
   578	
   579	### Professional Process Applied (lightweight)
   580	
   581	Task type: Codex-review revision / roadmap-applicability cleanup · Stage: post-Codex, pre-roadmap · Risk: low-medium · Mode: lightweight but precise · Validation: address only the Codex findings + the owner's `git status`/`grep` checks + an internal-consistency pass · Human approval: required before commit.
   582	
   583	### Codex review (read-only, working-tree)
   584	
   585	Ran the installed `openai-codex` adversarial review (`adversarial-review`, `sandbox: read-only`) on the packet + working-tree diff. **Verdict: needs-revision** (not reject). Direction sound; four findings: (1) [high] eval-first ratification gate too late for roadmap creation (a roadmap encodes the sequence, so ratify before roadmap finalization or mark proposed); (2) [medium] stale `PROJECT_STATE.md` git/current-state line (said HEAD `63e3332` + old uncommitted batch); (3) [medium] governance-mapping appendix risks reintroducing bloat in the roadmap; (4) [medium] EDD source overstated as Tier-1/peer-reviewed (arXiv = preprint).
   586	
   587	### Findings fixed (this revision)
   588	
   589	- **Eval-first ratified:** owner approved the eval-before-Gemini reorder of `plan-reconciliation.md` §6; recorded a row in `docs/decision-log.md`. **T-002 named "Offline Evaluation and Regression Harness"** (TEVV only a background reference term, not the title).
   590	- **`PROJECT_STATE.md`** stale git/current-state lines corrected (HEAD `cb80286`; uncommitted = this revision batch; no `out/` dirty; T-002 not started); the 4→5 uncommitted-doc count fixed across the state docs.
   591	- **Packet de-bloated:** roadmap is product-first and short; **no framework-mapping section (NIST/SSDF/DORA/SRE) by default**; at most a tiny artifact-tied terminology note; no "aligned/compliant/enterprise-scale/production-grade" language.
   592	- **EDD source downgraded** to preprint/practice reference; eval-first rests on `RULES.md` §3, the data-dictionary §9 guardrail caveat, the T-001.7 audit, the baseline-before-Gemini need, and regression-testing discipline. Added a top revision note to the packet.
   593	
   594	### Compliance / scope
   595	
   596	Updated only the six named docs (packet, `PROJECT_STATE`, `CURRENT_TASK`, `HANDOFF`, `docs/task-log`, `docs/decision-log`). **No** `docs/roadmap.md`; **no** new files; **no** product code/tests/CSV/`out`/integration change; nothing installed/adopted; **no commit** (owner decides). T-002 not started.
   597	
   598	### Next step
   599	
   600	Owner approval of the revised packet → then write `docs/roadmap.md` (product-first, short). Eval-first T-002 already ratified in `docs/decision-log.md`.
   601	
   602	## 2026-06-02 (Roadmap / Lifecycle / Build-Phase Applicability Review — full-but-narrow, review/planning only)
   603	
   604	### Professional Process Applied (full-but-narrow)
   605	
   606	Task type: roadmap/lifecycle/build-phase terminology applicability review · Stage: post-T-001.7, pre-roadmap, pre-T-002 · Risk: medium (weak terminology makes a roadmap look fake/overbuilt) · Mode: full-but-narrow · Source requirement: broad external discovery (named frameworks = candidates, not commands) weighted by source tiers + the open-source-discovery rule · Validation: applicability classification + Codex review recommended before any roadmap · Human approval: required before writing the roadmap or starting T-002.
   607	
   608	### Skills
   609	
   610	Used the project's open-source-discovery + source-intake rules (playbook/`RULES.md` §14) to drive broad, tiered discovery; no external skill conflicted with `RULES.md`.
   611	
   612	### What was done
   613	
   614	- Read the startup-contract evidence set (`RULES.md`, decision-log, `plan-reconciliation.md` §1–9, `v1-slice-plan.md`, `v1-data-dictionary.md`, T-001.7 audit, source-intake-review) + re-derived git (`HEAD = cb80286`, clean).
   615	- Broad web discovery (2026-06-02, ~11 searches): NIST AI RMF (Govern/Map/Measure/Manage), NIST GenAI Profile (12 risks), NIST SSDF (Prepare/Protect/Produce/Respond), DORA four keys, Google SRE (SLI/SLO/error-budget), MLOps/LLMOps lifecycle, LLM eval (golden dataset / offline evals / regression / evaluation harness), **Evaluation-Driven Development**, HITL (workflow/control/approval gates; CI-CD `require_review` analogy), walking-skeleton/tracer-bullet/**vertical slice** (Cockburn/Thomas), data provenance / model lineage / audit trail, and AI-portfolio red-flags (field signal).
   616	- Classified every candidate use-now / use-later / reference-only / reject; wrote `docs/review-packets/roadmap-lifecycle-applicability-review.md` (Executive Verdict, Sources, Source-Quality Notes, Project Evidence, Candidate Terms, Applicability Matrix, selected-term 12-field analysis, Recommended Roadmap Language / Build Phases / Lifecycle, Why-not-Gemini-first, Risks of Over-Formalizing, What Codex Should Challenge, Final Recommendation).
   617	
   618	### Verdict (summary)
   619	
   620	Use industry terms **selectively, as honest mapping** (plainest term first, each tied to a real artifact), not as the roadmap skeleton. **Use now:** vertical/thin slice, HITL approval gate, deterministic guardrails, provenance + audit trail, idempotency, offline evaluation harness / golden labels / regression testing, evaluation-driven, test-driven. **Avoid:** SRE/SLO/error-budget, DORA-as-current-claim, MLOps training, agentic, "production-grade/deployed-to-production/enterprise-scale." NIST RMF/GenAI/SSDF + DORA = mapping sidebar only. **T-002 = "Offline Evaluation Harness"** (evaluation-first); eval-before-Gemini justified on four independent grounds but a `plan-reconciliation.md` §6 reorder → owner ratifies in `docs/decision-log.md`. Recommend Codex adversarial review of the packet before writing `docs/roadmap.md`.
   621	
   622	### Compliance / scope
   623	
   624	Review/planning only. **Created** one review packet; **updated** the four state docs. **No** `docs/roadmap.md`; **no** `decision-log` entry (no decision made — recommendation only); **no** product code/tests/CSV/`out`/vault/integration change; nothing installed/cloned/adopted; no commit (owner decides). Web sources cited inline in the packet with tiers + dates.
   625	
   626	### Next step
   627	
   628	Codex `/codex:adversarial-review` of the packet → revise once → owner approval → then write the roadmap and (if ratified) record eval-first T-002.
   629	
   630	## 2026-06-02 (Codex review of the Source Openness pass + continuity doc-sync correction — lightweight)
   631	
   632	### Professional Process Applied (lightweight)
   633	
   634	Task type: dual-model review + continuity doc-sync correction · Stage: post-Source-Openness-pass, pre-commit · Risk: low · Mode: lightweight · Validation: Codex `adversarial-review` (review-only, `sandbox: read-only`) on the working tree, then fix only the flagged stale wording + re-run `git diff` · Human approval: required before commit.
   635	
   636	### Codex review
   637	
   638	Ran the installed `openai-codex` plugin `adversarial-review` (review-only) over the working-tree diff with the 16 source-openness/cross-verification/synthesis review goals as focus. **Verdict: needs-revision (native `needs-attention`).** The **Open Source Discovery rule itself was approved** — treats named sources as seeds not boundaries, preserves official/current-source authority for factual claims, demotes community content to field-signals, includes proportional stop conditions; **scope-safety PASS** (no product code/tests/CSV/integration/plugin/Obsidian-link in the diff; `out/` changes match the stated prior-pass exception); **no process bloat**. The needs-revision was solely two stale continuity docs riding along in the tree.
   639	
   640	### Findings fixed (this correction)
   641	
   642	- **[high] `PROJECT_STATE.md`** — refreshed the stale lower sections (Current Readiness Score, Current Blockers, Current Next Step, Decision Status, Open Questions, Handoff Notes, and — in a final sweep — the Current Evidence line that still said "operating-system files are currently uncommitted pending review," now corrected to "committed; OS setup at `49408d3`") from old pre-build framing (readiness ~0/10; blocker = GO/NO-GO on plan-reconciliation; "next session is a T-001 plan review"; "do not write product code until the plan clears") to current reality: T-001 implemented/green (23/23)/closed with minor follow-ups; Source Openness pass + this correction pending commit; remaining items are the three hygiene/decision follow-ups; roadmap/lifecycle review is next only after commit; T-002 not started.
   643	- **[medium] `CURRENT_TASK.md`** — rewritten to docs-only active scope (Source Openness clarification + continuity doc-sync); T-001 implementation details (Goal/Allowed `scripts`+`tests`+`out`/Acceptance) moved into a clearly labeled "Completed stage (historical)" summary; product code/tests/CSV/`out`/integrations/plugins/hooks/Obsidian-linking/roadmap/T-002 marked out of scope.
   644	- Also kept `HANDOFF.md` + this log accurate. Source-openness rule wording left intact (no contradiction found).
   645	
   646	### Result
   647	
   648	No product code/tests/CSV/`out`/integration change; no new files; no commit (owner decides). Next: owner reviews + commits, then the roadmap/lifecycle applicability review, then ratify eval-first T-002 in `docs/decision-log.md`.
   649	
   650	## 2026-06-02 (Source Openness Clarification Pass — lightweight, wording-only)
   651	
   652	### Professional Process Applied (lightweight)
   653	
   654	Task type: playbook/rules clarification · Stage: post-T-001.7, pre-roadmap applicability review · Risk: low-medium · Mode: lightweight · Source requirement: repo only (no new web research; this clarifies *how* to research, it does not research) · Validation: grep for restrictive wording + read-back of each edited file · Artifact policy: edit-in-place (no new standing files) · Codex review: optional (wording-only) · Human approval: required before commit.
   655	
   656	### What / why
   657	
   658	Make explicit that sources, frameworks, repos, vendors, communities, and examples **named in the repo are candidates and seeds, not boundaries** — Claude must search broadly and task-specifically, then choose by quality/relevance/freshness/maturity/validation/risk. Goal is *not* to remove source discipline; the tiers and intake rule stay.
   659	
   660	### Files Changed (wording only)
   661	
   662	- `docs/enterprise-delivery-playbook.md` — added an **Open Source Discovery (named sources are candidates, not constraints)** subsection inside the Source-Backed Research Standard: broad search breadth (official/vendor/standards docs, mature OSS, GitHub issues/PRs, eng blogs, **Reddit/forums/YouTube/SO/community field-signals**, changelogs); "use tiers to judge quality, not restrict discovery"; "seed list, not complete list"; **maximum useful research ≠ endless** (stop at sufficiency, document uncertainty); source-use weighting (official = source of truth; community = signal not proof unless corroborated).
   663	- `RULES.md` §14 — added an open-source-discovery bullet (pointer to the playbook rule).
   664	- `CLAUDE.md` — added a "Search broadly (Open Source Discovery)" obligation bullet.
   665	- `CODEX.md` — added discovery-openness verification with **8 flag conditions** (exhaustive-list assumption; forcing a named framework without applicability; ignoring stronger/current sources; ignoring OSS/field-signal sources when needed; stale sources for current claims; community treated as authoritative without verification; failing to search beyond user examples when risk requires; over-researching low-risk past sufficiency).
   666	- `docs/prompts/claude-task-template.md` — source-requirement line now says *named sources are seeds, not boundaries; search broadly + use field-signal sources, proportional to risk*.
   667	- `docs/prompts/codex-plan-review-template.md` + `docs/prompts/codex-changed-files-review-template.md` — added a "source discovery open enough for the risk?" check.
   668	- `docs/checklists/prevent-repeat-checklist.md` — added a discovery-openness check item.
   669	- Updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / this log.
   670	
   671	### Result
   672	
   673	Restrictive wording search = **no genuine matches** (only false positives like "deterministic"/"skills"); the "at minimum" phrasing existed only in prior prompts, not the repo. So this pass **clarifies** openness rather than removing restrictions. Source quality tiers preserved. No new standing files; **no decision-log entry** (no decision made); no product code/tests/CSV/`out`/integration/scope change; no commit (owner approves commits).
   674	
   675	### Next Step
   676	
   677	Owner reviews + commits (with the T-001.7 audit). Stop after this clarification pass — do not start the roadmap or T-002.
   678	
   679	## 2026-06-02 (T-001.7 — Post-Playbook Alignment Audit)
   680	
   681	### Professional Process Applied (full, narrow)
   682	
   683	Task type: post-playbook alignment audit · Stage: T-001.7 · Risk: medium · Mode: full-but-narrow · Source requirement: repo + vault (read-only) + prescribed commands (no new web research) · Validation: git/tests/run-path/docs/vault/stage-readiness · Codex review: optional (minor doc-sync only) · Human approval: required before T-002.
   684	
   685	### Commands / evidence
   686	
   687	- `HEAD = 63e3332`, tree clean before audit. `python3 -m unittest tests.test_t001` → **Ran 23, OK**. `run.py --fresh` (12 send) → `run.py` (0 new + 12 skipped) = app-path idempotency. No tracked pycache. CSV sha `43fb21f6…` unchanged. Global `~/.claude/CLAUDE.md` has no vault link.
   688	
   689	### Files Changed
   690	
   691	- Created `docs/audits/post-playbook-alignment-audit.md`.
   692	- Fixed `docs/v1-slice-plan.md` (known-stale item): test list → T1–T18 + P2-1..P2-5 (23); added `--fresh` vs preserve note; status → implemented.
   693	- Corrected git-state in `PROJECT_STATE.md` / `CURRENT_TASK.md` / `HANDOFF.md`; updated `docs/task-log.md`.
   694	- **Not touched:** product code, tests, CSV, `out/` (beyond prescribed validation runs), vault files, integration files. No `decision-log`/journal entry (no decision/implementation issue).
   695	
   696	### Verdict
   697	
   698	Still on track. T-001 holds under updated standards (23/23, all guarantees intact); new standards break nothing retroactively; vault boundary exemplary & separate. **T-001 → closed with minor follow-ups.** Next stage = **offline eval harness first** (not Gemini) — owner to ratify reorder in `docs/decision-log.md`.
   699	
   700	### Compliance Result
   701	
   702	Passed. Review-only; no code/tests/CSV changes; nothing installed/adopted; no commit. (`out/` logs regenerated by the prescribed `run.py` — restore with `git checkout -- out/`.)
   703	
   704	### Next Step
   705	
   706	Owner commits the audit + doc-sync; restores `out/`; ratifies the eval-first ordering; then scopes T-002 (offline evaluation harness).
   707	
   708	## 2026-06-02 (T-001.6 — source-intake CORRECTION pass: direct PDF + repo inspection)
   709	
   710	### Professional Process Applied (full, narrow)
   711	
   712	Task type: source-intake correction / source verification · Stage: T-001.6 · Risk: medium · Mode: full-but-narrow · Source requirement: **open the actual PDFs** + Tier 1 official docs (live, dated) + direct GitHub repo inspection · Validation: explicit source-status separation (directly inspected / summary-only / Tier 1 / repos / gaps) · Docs: `docs/research/source-intake-review.md` + state docs · Human approval: required before adopting anything (nothing adopted).
   713	
   714	### What was corrected
   715	
   716	- Replaced the summary-only basis with **direct reads** of 3 PDFs: `dynamic_workflows_prompt_pack.pdf`, `obsidian-setup-guide.pdf`, `codex_loop_field_guide.pdf`.
   717	- **Honest gap kept:** `claude_architect_study_guide.pdf` (55 MB) **not loaded** — unsafe native load + `poppler` not installed (not installing per task); its principles verified instead against official docs.
   718	- **Tier 1 official (live 2026-06-02):** fetched best-practices, features-overview, hooks, sub-agents — they **confirm** the Architect principles and **validate** the hooks recommendation (official example: a hook that blocks writes to a folder) and the over-flagging caution. Changelog URL 404'd (gap).
   719	- **All 5 GitHub repos web-inspected** (prior review inspected none): claudex (MIT, ~75★, teaching artifact, read-only review), kepano/obsidian-skills (MIT, ~34k★, Obsidian CEO — reputable), second-brain (license unspecified, risky installers), agentic-design-patterns-docs (~19★), n8n-powerhouse (~4★). Nothing cloned/adopted.
   720	- **Model freshness:** `GPT-5.5` UNVERIFIED; Anthropic/OpenAI model docs not fetched (no model decision) → documented gap.
   721	
   722	### Decisions unchanged
   723	
   724	Nothing adopted; Obsidian stays external/non-authoritative (now confirmed by the guide's own "global CLAUDE.md" advice, which official docs warn against); claudex/n8n deferred (human-approved); the **enforcement-hooks** recommendation is now strongly official-backed but remains a recommendation (no `decision-log` entry until approved).
   725	
   726	### Compliance Result
   727	
   728	Passed. Review-only; no code/tests/CSV/`out`/integration changes; nothing installed/cloned/adopted; no commit.
   729	
   730	### Next Step
   731	
   732	Owner reviews the corrected `docs/research/source-intake-review.md`; commits it; decides on the enforcement-hooks recommendation; (optional) provides a text export of the architect guide or permits a model-freshness sweep at decision time. Do not start T-002.
   733	
   734	## 2026-06-02 (T-001.6 — Source intake & applicability review, addendum)
   735	
   736	### Professional Process Applied (full mode — research/source-intake)
   737	
   738	Task type: research / source-intake + applicability review · Stage: T-001.6 · Risk: medium · Mode: full · Basis: playbook Source/Pattern/Reference Intake + Freshness rules · Source requirement: **Tier 1 official Claude Code docs checked live (`code.claude.com/docs`), date 2026-06-02, not memory** · Validation: each idea classified borrow/reject/adapt/defer + verified/UNVERIFIED tags + Missing Addendum self-audit · Docs: `docs/research/source-intake-review.md` + state docs · Codex review: recommended · Human approval: required before adopting anything (nothing adopted).
   739	
   740	### Files Changed
   741	
   742	- Created `docs/research/source-intake-review.md` (new dir `docs/research/`). Updated `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.
   743	- **Not edited:** playbook / `RULES` / `CLAUDE` / `CODEX` — the intake rule is already integrated; the addendum required no governance edit.
   744	
   745	### Key results
   746	
   747	- Evaluated the **summaries pasted** (uploaded files were not in the session — stated honestly). Nothing installed/cloned/adopted.
   748	- Live Tier 1 check (official Claude Code docs, 2026-06-02) **confirmed** the Architect principles: hooks = deterministic enforcement (`PreToolUse` deny / `exit 2`); CLAUDE.md = guidance/"a request, not a guarantee"; skills = on-demand (keep CLAUDE.md < 200 lines); subagents = isolated review with restrictable tools; layered scoping + path-specific `.claude/rules/`.
   749	- **Highest-value finding:** the project's hardest invariants (CSV-immutability, no-secrets) are prompt-only "requests" today; official docs say make must-hold rules **hooks**. Recommended (not adopted) `PreToolUse` hooks — human-approval-gated roadmap item.
   750	- **Honest gaps (in Missing Addendum Checks):** uploaded originals not provided; changelog + Anthropic model release-notes + OpenAI/Codex model docs not fetched this pass (no model decision made) → small optional freshness correction pass recommended at model-decision time.
   751	
   752	### Compliance Result
   753	
   754	Passed. No product code/tests/CSV/`out`/integration changes; nothing installed/adopted; no commit.
   755	
   756	### Next Step
   757	
   758	Owner reviews `docs/research/source-intake-review.md`; commits the still-uncommitted intake-rule edits + this review. Then close T-001's `v1-slice-plan` doc-sync; consider the hooks recommendation; ratify T-002 ordering in `docs/decision-log.md`. Do not start T-002.
   759	
   760	## 2026-06-02 (Standard — Source/Pattern/Reference Intake rule)
   761	
   762	### Professional Process Applied (short — low-risk docs edit)
   763	
   764	Task type: governance/process standard · Stage: post-T-001.5 enforcement · Risk: low–medium · Mode: lightweight–medium · Basis: extends the playbook's Source-Backed Research Standard / Selection Rationale / New-Info / Reuse Classification · Sources: none external adopted (repo-internal standard) · Validation: coverage vs the owner's rule + no-duplication check + git re-derived (`HEAD = f28ae90`) · Docs: playbook + RULES/CLAUDE/CODEX/checklist/decision-log + state docs · Codex review: optional · Human approval: owner directed the rule (= approval); no product/scope/tool change.
   765	
   766	### Files Changed
   767	
   768	- `docs/enterprise-delivery-playbook.md` (new "Source, Pattern, and Reference Intake" section — integrated, cross-referencing existing source tiers + reuse classification, not duplicating them).
   769	- `RULES.md` §14 (intake bullet), `CLAUDE.md` (intake obligation), `CODEX.md` (intake verification item), `docs/checklists/prevent-repeat-checklist.md` (intake check), `docs/decision-log.md` (decision row).
   770	- Updated `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.
   771	
   772	### Scope discipline / honest note
   773	
   774	- The rule overlaps the existing source-tier + reuse sections; **integrated as one section** to avoid the process-bloat the project already flagged. Net new standing files: **0**. The governance surface continues to grow — future tasks must keep intake proportional (one line for trivial edits).
   775	
   776	### Compliance Result
   777	
   778	Passed. No product code/tests/CSV/`out`/integration changes. No commit.
   779	
   780	### Next Step
   781	
   782	Owner commits this standard. Then close T-001's remaining doc follow-up (`v1-slice-plan` test-list sync) and ratify the T-002 ordering in `docs/decision-log.md`. Do not start T-002.
   783	
   784	## 2026-06-02 (Enforcement — Mandatory Startup Contract)
   785	
   786	### Professional Process Applied (short — low-risk docs edit)
   787	
   788	Task type: process/enforcement docs · Stage: post-T-001.5 · Risk: low · Mode: lightweight · Basis: the just-created playbook + the audit's recurring git-state finding · Sources: repo only (no external) · Validation: section-coverage vs spec + git re-derived · Docs: the listed files · Codex review: optional · Human approval: not needed (no scope/tool/architecture change).
   789	
   790	### Files Changed
   791	
   792	- `RULES.md` (new §15 Mandatory Startup Contract), `CLAUDE.md` (startup section → contract), `CODEX.md` (startup-contract enforcement + process-finding rule), `docs/prompts/claude-task-template.md` (Professional Process Applied block + read list), `docs/prompts/codex-changed-files-review-template.md` + `docs/prompts/codex-plan-review-template.md` (process/playbook compliance checks), `docs/checklists/prevent-repeat-checklist.md` (startup-contract item).
   793	- Updated `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.
   794	
   795	### Result
   796	
   797	Mandatory Startup Contract is now enforced: 10-step session start, the Professional Process Applied block (with anti-bloat one-line allowance for trivial edits), a stop condition, and Codex process-finding enforcement. Git re-derived: `HEAD = cd4c188` (playbook + audit committed; tree was clean before this update).
   798	
   799	### Compliance Result
   800	
   801	Passed. No product code/tests/CSV/`out`/integration changes. No commit.
   802	
   803	### Next Step
   804	
   805	Owner commits this enforcement update. Then close T-001's remaining doc follow-up (`v1-slice-plan` test-list sync) and ratify the T-002 ordering in `docs/decision-log.md`. Do not start T-002.
   806	
   807	## 2026-06-02 (T-001.5 — Enterprise Delivery Playbook created)
   808	
   809	### Tool/Session
   810	
   811	Claude Code (Opus 4.8), account 1. Standards/process task — no product code/tests/CSV/`out`/integration changes.
   812	
   813	### Professional Process Applied
   814	
   815	- Task type: documentation / process standard. Stage: T-001.5. Risk: low-medium (governance, no code). Mode: full-ish (it sets standards) but kept to one doc + pointer edits. Sources: the repo's own RULES/audit/review + the approved blindspot review (reduced scope). Validation: section-coverage vs spec + the "no new standing files" constraint. Human approval: pending.
   816	
   817	### Files Changed
   818	
   819	- Created `docs/enterprise-delivery-playbook.md` (Universal Professional Delivery Standard + ActivationOps AI Application + Living Standard rule; ~30 sections, one file).
   820	- Updated `RULES.md` (new §14 pointer), `CLAUDE.md` (apply-playbook obligations), `CODEX.md` (playbook-verification duties), `docs/checklists/prevent-repeat-checklist.md` (process checks incl. git-state re-derivation — closes the audit's recurring finding), `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.
   821	
   822	### Scope discipline
   823	
   824	- Built the **reduced single-playbook** form (per the approved blindspot review). **Did not** create separate source-scan / evidence-matrix / framework-matrix / assumptions files (deferred). Net new standing files: **+1** (the playbook). No product code/tests/CSV/`out`/integrations touched.
   825	
   826	### Compliance Result
   827	
   828	Passed. Git state re-derived (`HEAD = 2ccafce`). No commit.
   829	
   830	### Next Step
   831	
   832	Owner reviews + approves the playbook, commits the pending audit + review + playbook, closes T-001's open follow-ups; then T-002 (after ratifying the eval-vs-Gemini ordering in `docs/decision-log.md`).
   833	
   834	## 2026-06-02 (T-001.5 — standards blindspot pre-flight review)
   835	
   836	### Tool/Session
   837	
   838	Claude Code (Opus 4.8), account 1. Review only — playbook not created; no code/tests/CSV/out edits.
   839	
   840	### Task
   841	
   842	Review whether the planned T-001.5 "Enterprise Professional Delivery Playbook" (15 additions) is complete, practical, and not overbuilt.
   843	
   844	### Files Changed
   845	
   846	- Created `docs/review-packets/T-001.5-standards-blindspot-review.md`.
   847	- Updated `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`.
   848	
   849	### Verdict
   850	
   851	- Core intent (traceability: messy input → professional execution; source-backed reasoning; alternatives) is **sound and worth codifying once, lightly**.
   852	- The **15-artifact plan is over-built** — would ~double the governance surface and re-trigger the governance-over-product failure already diagnosed (governance review; reconciliation §4 rejected docs-first gates).
   853	- **Recommended:** collapse to ONE ~1–2 page `docs/enterprise-delivery-playbook.md` + small edits to existing files (merge the 4 prompt templates; add a decision-log "alternatives" field; add the git-state re-derivation step to the prevent-repeat checklist). Net file change ≈ −2.
   854	- **Reject** standalone source-scan log / evidence matrix / framework matrix / assumption log / failure-taxonomy / blindspot log, and "deep rationale always" (use proportional rationale). **Defer** integration security/cost/reliability rules + the eval harness.
   855	- Must-add before building: git-state re-derivation checklist step; "no new standing logs" constraint. Close T-001's 3 follow-ups first.
   856	
   857	### Compliance Result
   858	
   859	Passed. Review-only; no code/tests/CSV/integration/`out/` edits; no commit. (Pre-existing uncommitted work from the T-001 audit remains; `HEAD = 2ccafce`.)
   860	
   861	### Next Step
   862	
   863	Owner approves the reduced T-001.5 scope; commits the pending audit + review; closes T-001 follow-ups; then creates the single playbook.
   864	
   865	## 2026-06-02 (T-001 — ground-rules checkpoint audit)
   866	
   867	### Tool/Session
   868	
   869	Claude Code (Opus 4.8), account 1. Checkpoint audit — review only, no product build.
   870	
   871	### Commands run
   872	
   873	- `git status` / `git log --oneline -8` → `HEAD = 2ccafce` (T-001 + P2 fixes committed); tree was clean before the audit.
   874	- `python3 -m unittest tests.test_t001 -v` → **23/23 pass**.
   875	- `python3 scripts/run.py --fresh` (12 sent) then `python3 scripts/run.py` (0 new + 12 skipped_duplicate) → app-path idempotency confirmed.
   876	- `git ls-files | grep pycache/pyc` → none tracked. Secrets grep → no real credentials (matches are rule text / guardrail pattern definitions / a synthetic fixture email).
   877	
   878	### Files Changed
   879	
   880	- Created `docs/audits/T-001-ground-rules-audit.md`.
   881	- Corrected stale git-state wording in `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md` (and rewrote the HANDOFF latest block, which had accreted 4 turns of layers).
   882	- Added a process note to `docs/implementation-journal.md`.
   883	- **Not touched:** product code, tests, CSV, integration files, `out/`.
   884	
   885	### Result
   886	
   887	- Verdict: **ground rules followed; close T-001 with minor follow-ups.** No blockers.
   888	- Three follow-ups (none break guarantees): `out/` volatile-log policy + restore; `v1-slice-plan.md` test-list doc-sync; make git-state re-derivation a required prevent-repeat-checklist step.
   889	- Note: the prescribed `run.py` commands left `out/audit_log.csv` + `out/model_runs.csv` modified vs HEAD (snapshots unchanged) — owner to restore or set a policy.
   890	
   891	### Compliance Result
   892	
   893	Passed. Review-only; no code/tests/CSV/integration/`out/` edits; no commit.
   894	
   895	### Next Step
   896	
   897	Owner closes T-001 (commit audit + doc corrections; `out/` decision); then doc-sync + checklist follow-ups; then ratify the next-stage reorder in `docs/decision-log.md`.
   898	
   899	## 2026-06-02 (T-001 — final-review P2 fix pass)
   900	
   901	### Tool/Session
   902	
   903	Claude Code (Opus 4.8), account 1. Fix pass for the 2 final-review P2s. No integrations, no external calls.
   904	
   905	### Files Changed
   906	
   907	- `scripts/guardrail.py` — added verb-before-step completion patterns (past-tense forms; "set" gated by a completion auxiliary).
   908	- `tests/test_t001.py` — added `test_p2_5_state_mismatch_verb_first` (+ negative control); `tests/fixtures/guardrail_cases.json` — added `_state_mismatch_verb_first_body`.
   909	- `CURRENT_TASK.md`, `PROJECT_STATE.md` — corrected git-state wording (implementation committed at `653245b`; only P2-fix/hygiene uncommitted).
   910	- Updated `docs/implementation-journal.md`, `HANDOFF.md`, `docs/task-log.md`.
   911	
   912	### Result
   913	
   914	- **23/23 pass** (T1–T18 + P2-1..P2-5). T11/T12 still green (no over-flagging; clean drafts not flagged).
   915	- Both final-review P2s resolved: verb-first `state_mismatch` now caught; commit-state docs corrected.
   916	
   917	### Compliance Result
   918	
   919	Passed. No CSV change, no integrations, no credentials, no commit.
   920	
   921	### Next Step
   922	
   923	Owner decides on the P2-fix/hygiene commit (impl already at `653245b`).
   924	
   925	## 2026-06-02 (T-001 — final Codex review, result checked)
   926	
   927	- Job `bmyf43y0x` (`/codex:review --background`). **2 × P2**, no P0/P1.
   928	- P2-A (`scripts/guardrail.py`): the prose `state_mismatch` check only matches keyword-then-verb order ("photos ... added"); verb-first phrasing like "We've added your photos" for `steps_completed==2` still passes. Fix must add past-tense verb-first patterns **without** flagging the clean drafts' imperative TODO phrasing ("add photos", "set hours") — care needed on ambiguous "set".
   929	- P2-B (state docs): `CURRENT_TASK.md`/`HANDOFF.md`/`PROJECT_STATE.md` said "nothing committed", but HEAD is already `653245b "Implement T-001 offline thin slice"`; only the P2-fix + hygiene work is uncommitted. Corrected in `HANDOFF.md` this turn; `CURRENT_TASK.md` + `PROJECT_STATE.md` still to correct in the fix pass.
   930	- Both assessed valid. No code changed this turn (review only); awaiting owner go for the fix pass.
   931	
   932	## 2026-06-02 (Hygiene — .gitignore)
   933	
   934	### Tool/Session
   935	
   936	Claude Code (Opus 4.8), account 1. Tiny hygiene pass. No code/tests/CSV change.
   937	
   938	### Files Changed
   939	
   940	- Created `.gitignore` (`__pycache__/`, `*.pyc`, `.pytest_cache/`, `.DS_Store`).
   941	- Updated `docs/task-log.md`, `HANDOFF.md`.
   942	
   943	### Notes / decisions
   944	
   945	- **`out/` left tracked (not ignored), with reasoning recorded in `.gitignore`:** it's a portfolio demo artifact (reviewer can see V1's output without running it). Caveat: `model_runs.csv`/`audit_log.csv` are append-only and currently reflect the 2-run idempotency demo; regenerate with `python3 scripts/run.py --fresh` before committing for a clean single-run state.
   946	- **Already-tracked bytecode not auto-removed:** `.gitignore` only stops *future* tracking. The 6 committed `scripts/__pycache__/*.pyc` + `tests/__pycache__/*.pyc` need a one-time `git rm -r --cached scripts/__pycache__ tests/__pycache__` (then commit) to untrack — flagged for the owner; not done here (git-index change beyond this pass's file scope).
   947	
   948	### Compliance Result
   949	
   950	Passed. No product code/tests/CSV change; `out/` untouched; no commit.
   951	
   952	### Next Step
   953	
   954	Final Codex review, then owner commit decision.
   955	
   956	## 2026-06-02 (T-001 — Codex P2 fix pass)
   957	
   958	### Tool/Session
   959	
   960	Claude Code (Opus 4.8), account 1. Fix pass for the 4 P2 review findings. No integrations, no external calls.
   961	
   962	### Files Changed
   963	
   964	- `scripts/run.py` — preserve audit history by default; `--fresh` is explicit; `out_dir` parameterized.
   965	- `scripts/pipeline.py` — `parse_int` rejects fractional values; `model_run_id` offset by existing row count (`_next_model_seq`).
   966	- `scripts/guardrail.py` — `state_mismatch` now also flags prose claiming a not-yet-completed step is done (`COMPLETION_CLAIMS`, subject+body only).
   967	- `tests/test_t001.py` — added `test_p2_1..p2_4`; `tests/fixtures/guardrail_cases.json` — added `_state_mismatch_prose_body`.
   968	- Updated `docs/implementation-journal.md`, `docs/task-log.md`, `HANDOFF.md`, `CURRENT_TASK.md`, `PROJECT_STATE.md`.
   969	
   970	### Result
   971	
   972	- **22/22 pass** (T1–T18 + P2-1..P2-4).
   973	- Documented path verified: `scripts/run.py --fresh` → 12 simulated_send; `scripts/run.py` again → 0 new sends, 12 `skipped_duplicate`. `model_runs.csv` 40 rows / 40 unique IDs. Source CSV sha256 unchanged.
   974	
   975	### Doc-sync flagged
   976	
   977	`docs/v1-slice-plan.md` should enumerate the 4 P2 tests and note `run.py --fresh` vs preserve-history (docs-allowed task).
   978	
   979	### Compliance Result
   980	
   981	Passed. No CSV change, no integrations, no credentials, no commit.
   982	
   983	### Next Step
   984	
   985	Owner commit decision (optionally a confirming `/codex:review`).
   986	
   987	## 2026-06-02 (T-001 — Codex changed-files review, result checked)
   988	
   989	- Job `bbvaa9pmp` (`/codex:review --background --scope working-tree`). Verdict: substantive issues, **4 × P2**, no P0/P1.
   990	- P2-1: `scripts/run.py` deletes `audit_log.csv` before the canonical run → re-running the documented app command bypasses the send-idempotency control (guarantee only holds when calling `run_pipeline` directly).
   991	- P2-2: `scripts/pipeline.py` `parse_int` truncates `3.50`→`3` instead of rejecting non-integer decimals (contradicts slice-plan edge case).
   992	- P2-3: appended `model_runs.csv` reuses `MR-T-001-00x` IDs across repeated runs (ambiguous provenance vs append-only intent).
   993	- P2-4: `scripts/guardrail.py` `state_mismatch` only checks `next_best_action`, not prose claims that a not-yet-completed step is done (data-dictionary §9 requires both).
   994	- Assessment: all four valid. Next: owner decides on a single fix pass vs accept/defer; nothing committed.
   995	
   996	## 2026-06-02 (T-001 — documentation sync)
   997	
   998	### Tool/Session
   999	
  1000	Claude Code (Opus 4.8), account 1. Docs only — no code, tests, or CSV touched.
  1001	
  1002	### Task
  1003	
  1004	Sync `docs/v1-data-dictionary.md` with the shipped implementation (resolves the doc-sync flag from the implementation entry).
  1005	
  1006	### Files Changed
  1007	
  1008	- `docs/v1-data-dictionary.md`: status line (plan → implemented); §1 new row 11 + §3/§6 (source `… Risk` → canonical `Low/Medium/High` normalization); §9 two regex fixes to the implemented versions (`%` not `%\b`; inflected verbs `guarantee[sd]?` etc.) + explanatory note; §2 "proposed location" → "location".
  1009	- `docs/task-log.md`, `HANDOFF.md`: brief updates.
  1010	
  1011	### Verification
  1012	
  1013	- Confirmed the two §9 regex lines now match `scripts/guardrail.py` verbatim; no stale regex forms remain in the doc.
  1014	
  1015	### Compliance Result
  1016	
  1017	Passed. No product code/tests/CSV change; no commit.
  1018	
  1019	### Next Step
  1020	
  1021	Codex changed-files review (`/codex:review --background`), then owner commit decision.
  1022	
  1023	## 2026-06-02 (T-001 — implementation)
  1024	
  1025	### Tool/Session
  1026	
  1027	Claude Code (Opus 4.8), account 1. First product code for the project.
  1028	
  1029	### Task
  1030	
  1031	Implement the offline T-001 thin slice per `docs/v1-slice-plan.md` + `docs/v1-data-dictionary.md`.
  1032	
  1033	### Skills check
  1034	
  1035	- Task type: deterministic Python implementation + tests. Relevant skills: none required (no UI/framework/data-viz; test-driven-development principles applied inline). Conflicts with RULES.md: none.
  1036	
  1037	### Files Changed
  1038	
  1039	- Created: `scripts/__init__.py`, `scripts/config.py`, `scripts/guardrail.py`, `scripts/pipeline.py`, `scripts/run.py`, `tests/__init__.py`, `tests/test_t001.py`, `tests/fixtures/ineligible_contacts.csv`, `tests/fixtures/approvals.csv`, `tests/fixtures/guardrail_cases.json`.
  1040	- Generated: `out/merchants_v1.csv`, `out/review_queue.csv`, `out/model_runs.csv`, `out/audit_log.csv`.
  1041	- Updated: `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/implementation-journal.md`.
  1042	
  1043	### Result
  1044	
  1045	- **T1–T18: 18/18 pass** (`python3 -m unittest tests.test_t001 -v`).
  1046	- Canonical run: 20 merchants, 8 in review queue (the 8 High), 12 simulated_sent (Low/Medium), 8 High held (`drafted`, `pending_review`), 0 draft_rejected, 12 simulated_send events, 0 skipped.
  1047	- Source CSV sha256 identical before/after (`43fb21f6…`).
  1048	- Send gate verified: no High/review-required merchant is sent without an explicit synthetic approval (T17).
  1049	- Three issues caught by tests and fixed in the logic (not the tests): risk_level enum normalization; two guardrail regex bugs (`%\b`, inflected-verb `\b`). See implementation journal.
  1050	
  1051	### Stdlib / offline confirmation
  1052	
  1053	Standard library only; no network, no AI/LLM call (draft generator is a deterministic stub), no Supabase/n8n/Slack/Resend/Gemini/Apps Script, no real email, no secrets.
  1054	
  1055	### Doc-sync flagged
  1056	
  1057	`docs/v1-data-dictionary.md` §1/§3 (risk_level `… Risk`→enum normalization) and §9 (two corrected regexes) need a follow-up edit in a docs-allowed task; code matches the documented intent.
  1058	
  1059	### Compliance Result
  1060	
  1061	Passed. No CSV modification, no integrations, no credentials, no commit.
  1062	
  1063	### Next Step
  1064	
  1065	Codex changed-files review (`/codex:review`); then human decision on commit.
  1066	
  1067	## 2026-06-01 (T-001 — plan revision after Codex round-1)
  1068	
  1069	### Tool/Session
  1070	
  1071	Claude Code (Opus 4.8), account 1. Planning/docs only — no product code.
  1072	
  1073	### Task
  1074	
  1075	Apply the human-approved revision pass addressing Codex's two round-1 findings.
  1076	
  1077	### Skills check
  1078	
  1079	- Task type: documentation revision. Relevant skills: none required. Conflicts with RULES.md: none.
  1080	
  1081	### Verification
  1082	
  1083	- Confirmed the new guardrail patterns are bound to revenue/performance context so the 20 real nudges (which contain progress percentages like "60% complete", "80% done") still produce 0 flags under T11, while T18 negative fixtures are still caught.
  1084	
  1085	### Files Changed
  1086	
  1087	- `docs/v1-data-dictionary.md` — added `contact_eligible`, `approval_state`, `send_eligible`; new §7.1 send-gate; §9 guardrail moved to fenced regex, added `aggressive_urgency` (6 categories), context-bound numeric patterns.
  1088	- `docs/v1-slice-plan.md` — send-gated steps; added T17 (send gate) and T18 (per-category guardrail fixtures); approval edge cases; GO/NO-GO updated.
  1089	- `docs/review-packets/T-001-review-packet.md` — Codex round-1 findings + resolutions; assumptions/scope/tests updated; recommendation now "human GO".
  1090	- `docs/decision-log.md` — added the contact-vs-send eligibility decision.
  1091	- Updated `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`.
  1092	
  1093	### Compliance Result
  1094	
  1095	Passed. No product code, no scripts, no CSV change, no schema, no integration, no credentials, no commit.
  1096	
  1097	### Next Step
  1098	
  1099	Human **GO** on the revised plan (criteria in `docs/v1-slice-plan.md`); then implementation (separate task). Second Codex pass optional.
  1100	
  1101	## 2026-06-01 (T-001 — planning + data dictionary)
  1102	
  1103	### Tool/Session
  1104	
  1105	Claude Code (Opus 4.8), account 1. Planning only — no product code.
  1106	
  1107	### Task
  1108	
  1109	Create the plan for the first offline thin slice: data dictionary, slice plan, and a Codex review packet.
  1110	
  1111	### Skills check
  1112	
  1113	- Task type: technical planning / data-contract design. Relevant skills: none required (no UI, no framework, no data-viz). Conflicts with RULES.md: none.
  1114	
  1115	### Verification
  1116	
  1117	- Re-confirmed from the source CSV: risk formula `2*days + 3*last_login + 10*(5−steps)` reproduces `Risk Score` on all 20 rows; step order recovered from the nudge messages; both Medium rows = 69 (threshold gap 48→69, 69→89).
  1118	
  1119	### Files Changed
  1120	
  1121	- Created: `docs/v1-data-dictionary.md`, `docs/v1-slice-plan.md`, `docs/review-packets/T-001-review-packet.md`.
  1122	- Updated: `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/decision-log.md`, `docs/task-log.md`.
  1123	- Not updated: `docs/implementation-journal.md` (nothing built or debugged yet — journal is for build challenges).
  1124	
  1125	### Key decisions (see `docs/decision-log.md`)
  1126	
  1127	- Recompute + validate `risk_score`; carry source `risk_level` (thresholds = documented assumption; T5 consistency-only, not correctness).
  1128	- Synthetic ineligibility in test fixtures, not product output.
  1129	- One entity CSV + two append-only logs; idempotency `cooldown_window` = as-of date; guardrail also run over the 20 real nudges.
  1130	
  1131	### Compliance Result
  1132	
  1133	Passed. No product code, no scripts, no CSV change, no schema, no integration, no credentials, no commit.
  1134	
  1135	### Next Step
  1136	
  1137	Run `/codex:adversarial-review` on the plan (focus: `docs/review-packets/T-001-review-packet.md`); resolve blocking findings; get human GO; then implementation (separate task).
  1138	
  1139	### Codex Review Result (checked)
  1140	
  1141	- Job `review-mpw2j628-ncd4my` (background, `--scope working-tree`). Verdict: **needs-attention / NO-SHIP**.
  1142	- [high] Review-required merchants can reach `simulated_send` with no approval gate — the slice's human-review control is not actually enforced or tested.
  1143	- [medium] Guardrail tests only cover over-flagging (T11) + one planted revenue case; no under-flag fixtures for the other categories; documented regex alternation is ambiguous in the Markdown table.
  1144	- Confirmed as-planned: carry source `risk_level` (Q1), CSV + two logs (Q4), fixtures-not-product for ineligibility (Q5), row-order IDs with hash assertion (Q6). Idempotency (Q3) OK only after the review-gate fix.
  1145	- Next: one Claude revision pass to address both findings, then human approval. No implementation until then.
  1146	
  1147	## 2026-06-01 (Session 3d — Operating-system cleanup)
  1148	
  1149	### Tool/Session
  1150	
  1151	Claude Code (Opus 4.8), account 1. Cleanup only — no product build.
  1152	
  1153	### Task
  1154	
  1155	Small operating-system cleanup: reconcile AGENTS.md with RULES.md, make README product-focused, add secrets/commit-hygiene rules, correct git status, set the as-of date, and reframe the next task.
  1156	
  1157	### Skills check
  1158	
  1159	- Task type: documentation cleanup. Relevant skills: none required. Conflicts with RULES.md: none.
  1160	
  1161	### Verification
  1162	
  1163	- Confirmed Git is initialized (`git rev-parse --is-inside-work-tree` → true; commit `b57cf2c`). This corrects earlier docs that said "not initialized" (stale — the owner initialized git after the prior session).
  1164	
  1165	### Files Changed
  1166	
  1167	- `AGENTS.md` — now defers to `RULES.md`; dropped "reviewer-first only" framing; added start sequence + summarized ground rules.
  1168	- `README.md` — product-focused; Claude Code/Codex moved to a short Development Workflow section and removed from the runtime stack; V1 = "AI-assisted workflow automation", "agentic" reserved for roadmap.
  1169	- `RULES.md` — added §11 Secrets, §12 Commit hygiene, §13 Lightweight vs full workflow.
  1170	- `CURRENT_TASK.md` — T-001 reframed to "offline thin slice planning + data dictionary"; removed git init; as-of date set to June 1, 2026.
  1171	- `PROJECT_STATE.md` — git status corrected; next step/handoff reframed (no git init); as-of date set; Claude Suggestions reconciled.
  1172	- `HANDOFF.md` — latest block updated to this cleanup (also touched beyond the listed files because the prior block stated the wrong git status).
  1173	- `docs/open-questions.md` — as-of date marked resolved (also touched for consistency with the as-of-date instruction).
  1174	- `docs/task-log.md` — this entry.
  1175	
  1176	### Compliance Result
  1177	
  1178	Passed. No product code, no CSV change, no schema, no integration, no credentials, no commit.
  1179	
  1180	### Next Step
  1181	
  1182	Human GO / NO-GO on `docs/plan-reconciliation.md`. On GO, start T-001 (planning + data dictionary only).
  1183	
  1184	## 2026-06-01 (Session 3c — Operating-system setup)
  1185	
  1186	### Tool/Session
  1187	
  1188	Claude Code (Opus 4.8), account 1. Setup only — no product build.
  1189	
  1190	### Task
  1191	
  1192	Create the project operating system so Claude (account 1/2), Claude CLI, Codex, and the human owner can continue from the repo without repeated instructions.
  1193	
  1194	### Skills check
  1195	
  1196	- Task type: governance / process scaffolding (documentation).
  1197	- Relevant skills: none required; no UI, data-analysis, or framework skill applied. (Per `RULES.md` §5, recorded that the smallest relevant set was "none.")
  1198	- Conflicts with RULES.md: none.
  1199	
  1200	### Files Changed
  1201	
  1202	- Created: `RULES.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/dual-model-workflow.md`, `docs/project-narrative.md`, `docs/implementation-journal.md`, `docs/decision-log.md`, `docs/checklists/prevent-repeat-checklist.md`, `docs/prompts/claude-task-template.md`, `docs/prompts/codex-plan-review-template.md`, `docs/prompts/codex-changed-files-review-template.md`, `docs/prompts/codex-rescue-template.md`, `docs/visuals/README.md`, `docs/visuals/architecture.mmd`, `docs/visuals/v1-thin-slice-flow.mmd`, `docs/visuals/dual-model-workflow.mmd`.
  1203	- Updated: `CLAUDE.md`, `CODEX.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/open-questions.md`.
  1204	
  1205	### Verification
  1206	
  1207	- Codex command surface verified against the installed plugin: `~/.claude/plugins/cache/openai-codex/codex/1.0.4/commands/` (v1.0.4). All seven commands confirmed; review-only vs. can-edit distinction taken from the command definitions.
  1208	- Mermaid not validated by CLI (mmdc not installed); diagrams use standard syntax.
  1209	
  1210	### Compliance Result
  1211	
  1212	Passed. No product code, no CSV change, no schema, no integration, no credentials.
  1213	
  1214	### Next Step
  1215	
  1216	Human GO / NO-GO on `docs/plan-reconciliation.md`. On GO, start T-001 (`CURRENT_TASK.md`).
  1217	
  1218	## 2026-06-01 (Session 3b — Plan reconciliation)
  1219	
  1220	### Tool/Session
  1221	
  1222	Claude Code, review only (continuation of Session 3).
  1223	
  1224	### Task
  1225	
  1226	Reconcile Codex (initial + open-source) and Claude (governance) findings into one final pre-build decision. No implementation.
  1227	
  1228	### Files Changed
  1229	
  1230	- Created `docs/plan-reconciliation.md`
  1231	- Updated `PROJECT_STATE.md`, `docs/task-log.md`, `docs/open-questions.md`
  1232	
  1233	### Summary
  1234	
  1235	- Resolved the core tension: Codex was right about *which* safety controls matter; Claude was right about *sequencing/volume*. Accepted the controls; rejected the docs-first gate.
  1236	- Accepted: header fix, required field set built into the slice, documented risk formula + step/blocker taxonomy (step order recovered from existing nudges), deterministic-before-AI, structured JSON + validation + forbidden-claims, idempotency, model_runs ledger, defer live integrations, drop "agentic".
  1237	- Rejected: the 7-doc prerequisite gate, the 14-table V1 schema, `ALWAYS_READ.md`/template/retro-audit as blockers, any live external send in V1, the blended readiness score.
  1238	- Fixed V1 scope: one offline runnable slice (ingest→normalize→deterministic risk/blocker→review queue→one stubbed structured draft + forbidden-claims check→simulated send + idempotency + audit/model_runs), tests = acceptance criteria. Storage = one entity CSV + append-only event logs.
  1239	- Planning exit condition: user GO/NO-GO on the reconciliation. No further review docs.
  1240	- First implementation task on GO: git init; RULES.md + v1-data-dictionary.md; ingest/normalize → merchants_v1.csv.
  1241	
  1242	### Compliance Result
  1243	
  1244	Passed. Review-only; no code, schema, workflow, credentials, or CSV mutation.
  1245	
  1246	### Next Step
  1247	
  1248	User GO/NO-GO on `docs/plan-reconciliation.md`. If GO, build (do not write more docs).
  1249	
  1250	## 2026-06-01 (Session 3 — Claude governance & idea review)
  1251	
  1252	> Ordering note: this session ran after the entries below despite the earlier calendar date. Prior entries are dated 2026-06-02; the authoritative current date is 2026-06-01. The folder is not in git, so there is no commit history to arbitrate — this discrepancy is itself recorded as a minor governance finding (weak audit trail).
  1253	
  1254	### Tool/Session
  1255	
  1256	Claude Code, devil's-advocate review only.
  1257	
  1258	### Task
  1259	
  1260	Review whether the project rules, governance process, and project idea are clear enough for a serious AI automation build using Claude Code and Codex. No implementation.
  1261	
  1262	### Scope
  1263	
  1264	- Review and documentation only.
  1265	- No CSV modification, schema, workflow, or integration code.
  1266	- No credentials.
  1267	
  1268	### Files Read
  1269	
  1270	- `PROJECT_STATE.md`, `AGENTS.md`, `README.md`, `CODEX.md`, `CLAUDE.md`
  1271	- `docs/product-brief.md`, `docs/task-log.md`, `docs/open-questions.md`, `docs/data-audit.md`
  1272	- `docs/reviews/codex-initial-review.md`, `docs/reviews/open-source-validation-review.md`
  1273	- `docs/audits/open-source-validation-compliance-audit.md`
  1274	- `docs/decisions/ADR-001-initial-architecture.md`
  1275	- `DoorDash Merchant Nudge Engine - Merchant Directory.csv`
  1276	
  1277	Requested files that do not exist (recorded, not endorsed as blockers): `ALWAYS_READ.md`, `docs/audits/codex-compliance-audit.md`.
  1278	
  1279	### Files Changed
  1280	
  1281	- Created `docs/reviews/claude-governance-and-idea-review.md`
  1282	- Created `docs/audits/claude-governance-compliance-audit.md`
  1283	- Updated `PROJECT_STATE.md`, `docs/task-log.md`, `docs/open-questions.md`
  1284	
  1285	### Independent verification performed
  1286	
  1287	- Re-derived the risk formula from the raw CSV; holds on all 20 rows. Distribution 10 Low / 2 Medium / 8 High confirmed. Noted both Medium rows are exactly 69, leaving thresholds essentially unconstrained.
  1288	- Spot-checked the two most-suspicious arXiv citations in the open-source review (`2605.07135`, `2603.20847`) via WebFetch; both are real and titles match. Suspicion dropped.
  1289	
  1290	### Summary
  1291	
  1292	- Central finding: governance has outgrown the product (~12 docs, 0 runnable code, 20-row CSV) and the planning phase has no termination condition.
  1293	- The canonical rules live in chat prompts, not the repo; "mandatory files" are partly prompt-invented (this prompt named two files that do not exist — the third session to do so).
  1294	- The blended readiness score is unanchored and drifted 3→4 without build progress; recommended retiring it for two separate measures.
  1295	- Codex largely followed its rules and its citations are real; it did not catch the meta-risk and its self-audit over-credits "Followed" on rules that were N/A.
  1296	- Did not re-litigate the (already-correct) data-model critique.
  1297	
  1298	### Compliance Result
  1299	
  1300	Passed. Review-only scope held; evidence verified at primary source; one weak claim corrected before publication.
  1301	
  1302	### Next Step
  1303	
  1304	User go/no-go decision (see `PROJECT_STATE.md` → Current Next Step). Do not write a fourth review document. If GO, build the thin runnable slice in code with tests inline.
  1305	
  1306	## 2026-06-02
  1307	
  1308	### Tool/Session
  1309	
  1310	Codex validation-only session.
  1311	
  1312	### Task
  1313	
  1314	Open-source validation review of ActivationOps AI project direction, process, architecture, and prior Codex review.
  1315	
  1316	### Scope
  1317	
  1318	- Analysis and documentation only.
  1319	- No implementation.
  1320	- No CSV modification.
  1321	- No Supabase schema.
  1322	- No n8n workflow.
  1323	- No Slack or Resend integration code.
  1324	- No production code.
  1325	
  1326	### Files Read
  1327	
  1328	- `PROJECT_STATE.md`
  1329	- `AGENTS.md`
  1330	- `README.md`
  1331	- `docs/product-brief.md`
  1332	- `docs/task-log.md`
  1333	- `docs/open-questions.md`
  1334	- `docs/data-audit.md`
  1335	- `docs/reviews/codex-initial-review.md`
  1336	- `docs/decisions/ADR-001-initial-architecture.md`
  1337	- `CODEX.md`
  1338	- `CLAUDE.md`
  1339	- `DoorDash Merchant Nudge Engine - Merchant Directory.csv`
  1340	
  1341	Missing required files recorded:
  1342	
  1343	- `ALWAYS_READ.md`
  1344	- `docs/audits/codex-compliance-audit.md`
  1345	- `docs/audits/session-compliance-template.md`
  1346	
  1347	### Files Changed
  1348	
  1349	- `docs/reviews/open-source-validation-review.md`
  1350	- `docs/audits/open-source-validation-compliance-audit.md`
  1351	- `PROJECT_STATE.md`
  1352	- `docs/task-log.md`
  1353	- `docs/open-questions.md`
  1354	
  1355	### Summary
  1356	
  1357	- Validated the project idea as worth building only as a staged dummy-data simulation.
  1358	- Confirmed the prior Codex review was fair and stayed reviewer-only.
  1359	- Confirmed the current data model still blocks implementation.
  1360	- Validated the architecture direction against current official/open sources.
  1361	- Raised readiness from 3/10 build readiness to 4/10 overall validation readiness, with implementation still blocked.
  1362	- Identified missing governance files as a process blocker.
  1363	
  1364	### Compliance Result
  1365	
  1366	Passed with warnings.
  1367	
  1368	Warnings:
  1369	
  1370	- `ALWAYS_READ.md` is missing.
  1371	- `docs/audits/session-compliance-template.md` is missing.
  1372	- `docs/audits/codex-compliance-audit.md` is missing.
  1373	- V1 dataset acceptance criteria are missing.
  1374	
  1375	### Next Step
  1376	
  1377	Create governance and acceptance-criteria docs before any integration build:
  1378	
  1379	1. `ALWAYS_READ.md`
  1380	2. `docs/audits/session-compliance-template.md`
  1381	3. `docs/acceptance-criteria/v1-dataset.md`
  1382	
  1383	## 2026-06-01
  1384	
  1385	### Completed
  1386	
  1387	- Read the attached work order.
  1388	- Inspected the project folder.
  1389	- Confirmed the folder was not a Git repository.
  1390	- Confirmed no project-local `AGENTS.md` existed before this pass.
  1391	- Located CSV file: `DoorDash Merchant Nudge Engine - Merchant Directory.csv`
  1392	- Parsed the CSV with a structured CSV reader.
  1393	- Confirmed 20 merchant records and 9 header columns.
  1394	- Identified duplicate header issue: both first and second columns are named `Merchant Name`.
  1395	- Inferred and verified the synthetic risk score formula across all 20 rows.
  1396	- Created documentation scaffolding requested by the work order.
  1397	- Wrote CSV data audit.
  1398	- Wrote initial critical review.
  1399	- Added open questions and initial architecture decision.
  1400	- Used two read-only subagents for CSV audit and architecture/security/automation review.
  1401	- Checked current official docs for Supabase API/RLS, n8n error handling, Slack request verification/interactivity, Resend webhooks, Gemini structured outputs, and Google Sheets API limits.
  1402	
  1403	### Validation
  1404	
  1405	- Used local folder listing and file search to inspect project structure.
  1406	- Used a structured CSV parse to inspect headers, records, value distributions, duplicate merchant names, and scoring consistency.
  1407	- No live integrations, workflows, schemas, credentials, or production code were created.
  1408	
  1409	### Remaining
  1410	
  1411	- Generate a V1-ready dummy dataset.
  1412	- Decide canonical onboarding steps and blocker taxonomy.
  1413	- Define Supabase schema only after the data model is approved.
  1414	- Define n8n, Slack, Resend, and Gemini behavior only after workflow safety controls are approved.
  1415	
  1416	## ROADMAP SLICE 1 — drafter-reliability fix (2026-06-29)
  1417	
  1418	- **Task type / mode:** AI-behavior reliability fix + budget-integrity hardening · FULL loop · Effort MAX (ship-gating).
  1419	- **What:** fixed the A3-7 ~75% Gemini-redraft parse failure — (a) instrument: `usageFromError` merges the SDK error's top-level `finishReason` → `DraftResult.usage` → trajectory; (b) fix: disable thinking on the bounded draft (`thinkingBudget=0`) + raise `MAX_LIVE_OUTPUT_TOKENS` 2000→4096. A pricing change (`output+reasoning`) pulled in a budget arc → `maxRetries:0`, reasoning reserved + priced, $5 cap downgraded to an honest fail-closed best-effort bound + a post-call `budget_overflow` stop.
  1420	- **Skills/tools used:** codex-guarded (cross-model gate ×5), acceptance-gate subagent (ship gate), Monitor/background Bash (await long steps). See `docs/tooling-and-skills-usage.md`.
  1421	- **Gates:** `npm run verify` exit 0 — 305 passed + 5 skipped; typecheck/lint/build green; differential 20/20 UNTOUCHED (`git diff --name-only -- lib/core evals/gold lib/data/*.snapshot.json` empty); RED-GREEN proven ×7 (`docs/reviews/slice1-drafter-reliability-verify-evidence.log`). Codex gate-2 CLEARED (5 passes, all reconciled primary-model-final; `docs/reviews/codex-2026-06-29-slice1-drafter-reliability.md`). acceptance-gate SHIP.
  1422	- **Honesty bound:** proves the fix is WIRED offline/$0; does NOT prove the live parse-rate recovers — that is the owner-gated SLICE 2 (R-A3-9) live re-run.
  1423	- **Commit:** owner-authorized per the roadmap directive (re-derive SHA via `git log`); push HELD (no remote).
  1424	- **Next:** STOP + surface SLICE 2 to the owner (OWNER-GATED live spend, ≤$5).
  1425	
  1426	## 2026-06-29 — Slice-2 close-out, STEP 1 (offline load-reduction) + STEP 2 held
  1427	- **Task type:** eval-harness load-reduction (offline) + live-run precondition check. Mode: FULL. Effort: high, auto-routed.
  1428	- **Skills:** none invoked; used the `advisor` tool (stronger-model cross-check) before editing — it corrected a drift toward an outcome-aware split composition and confirmed the window-hold.
  1429	- **Did:** harness-only blind 4 tune + 4 test subsample in `evals/agent-loop.live.test.ts` (1/mode/split, lowest-definition-order, original splits preserved, `maxIterations=3` kept) + an offline composition unit test; reframed deliverable-B success (HARD `detection===N`; `test≥K` now a reported measurement, not a hard pass/fail; K non-vacuous). Pre-registered in `docs/a3-7-live-run-status.md`; decision-logged (×1).
  1430	- **Gate:** `npm run verify` exit 0 — 306 passed (+1) + 5 skipped; typecheck/lint/build green; product code + `lib/core`/oracle/gold UNTOUCHED (harness + docs only).
  1431	- **Held:** STEP 2 live re-run — the Groq daily window is NOT fresh (2026-06-29 run depleted today's TPD; preflight shows only TPM; reset semantics UNVERIFIED per RULES §6 but not fresh today either way). Surfaced to owner. NEXT = fresh-day session → live re-run → batched Codex → acceptance-gate → commit (owner-authorized) → push HELD.
  1432	
  1433	## 2026-07-02 — Pivot research stage (owner-directed pivot re-open; research only, no product code)
  1434	
  1435	- **Task:** owner re-opened the pivot (`/claude-os` → `/enhance`, 2026-07-01): find a real, high-value, structurally underexplored US delivery-marketplace industry problem + its solution landscape; restrict to the research stage. Mode: FULL. Effort: MAX, auto-routed (goal-defining research). Risk: high (scope) but session output = research artifact, not a decision.
  1436	- **Skills/agents:** plan mode (owner gate) + AskUserQuestion (fixed objective: showcase-first venture-ready · prefer-reuse · adopter = research output) + 2 quarantined read-only threads (research-specialist industry gap map ×~55 sources; opportunity-finder screen ×~45 sources). `advisor` tool UNAVAILABLE this session (surfaced, not retried). First launch attempt died on the shared seat session-limit (raw error surfaced, no silent retry); relaunch succeeded post-reset.
  1437	- **Did:** synthesized both threads + the 2026-06 research base into `docs/research/pivot-research-2026-07.md` — ranked candidates (#1 fee-statement/fee-cap audit LEAD-POTENTIAL; #2 cross-surface truth verification LEAD-POTENTIAL-early; composite truth-audit layer; H1 CONTESTED; H2/driver-side AVOID), occupied-territory map, regulatory timeline, explicit UNVERIFIED labels, standing to-dos (Reddit first-person pass, video layer, primary bill texts). Decision-log row added (pivot re-opened + fixed objective).
  1438	- **Gate:** no code changed — `git status` delta = docs/state files only, on top of the pre-existing (untouched) slice-2 diff. Codex: not required for the research pass; REQUIRED at the pivot-direction proposal (consequential) — named-open for the plan stage.
  1439	- **Held:** the pivot pick (owner) → then plan/roadmap. SLICE-2 close-out (authorized live re-run) SUSPENDED by the redirect; its uncommitted diff intact. Owner-gated stops unchanged: live spend ≤$5, deploy, public posting, git push (no remote), platform-name.
  1440	
  1441	## 2026-07-02 (later same session) — Pivot direction picked + intent frame + backlog + order flip (docs only)
  1442	
  1443	- **Did:** owner PICKED the composite "marketplace truth-audit layer" (AskUserQuestion, after a full plain-English + technical explanation); owner then confirmed the INTENT FRAME (demonstrate deep AI proficiency by benefiting the industry; platforms = indirect beneficiaries; lean/optimized/structured; redesign in scope; repo may be restructured per goal) → recorded; all surfaced use cases saved as an independent backlog `docs/research/use-case-backlog.md` (UC-1..UC-9 + re-check triggers); owner then FLIPPED the build order — **UC-2 (truth verification) leads, UC-1 (fee audit) = module two** — on the intent-frame re-weighting. 4 decision-log rows total today. HANDOFF plan-stage resume prompt updated (UC-2-first); CURRENT_TASK/PROJECT_STATE synced.
  1444	- **Gate:** docs/state files only; no product code; slice-2 uncommitted diff untouched. Codex cross-check = NAMED-OPEN at the plan stage (consequential pivot ratification).
  1445	- **Next:** fresh session → PLAN stage per the HANDOFF paste-ready prompt. Session cut here at the owner's direction (lossless wrap).
  1446	
  1447	## 2026-07-02 (third session) — Reframe accepted for planning + standing directives + documentation system (docs only)
  1448	
  1449	- **Task:** owner invoked `resume` then asked for Claude's fully independent judgment on objective/solution/process ("take full liberty"). Mode: FULL (judgment stage). Effort: MAX, auto-routed (direction-shaping). `advisor` tool UNAVAILABLE again (surfaced, not retried).
  1450	- **Did:** (1) proposed + owner ACCEPTED-FOR-PLANNING the REFRAME — UC-2's lead artifact = an OPEN ACP/UCP conformance + truth-audit toolkit ("the truth layer for agentic commerce") + the self-referential "agent gets caught" demo, instead of a merchant-facing prototype SaaS (UC-7 promoted; UC-1 unchanged as module two). (2) Owner set STANDING PLAN-STAGE DIRECTIVES: judgment license until build · legibility = hard artifact constraint (complex inside, simple outside) · data spans free/open + live(ToS-clean) + hybrid + synthetic with an ENUMERATED edge-case taxonomy · free/free-tier everything except Gemini ≤$5. (3) Created `docs/PLAIN-ENGLISH.md` (living layman explainer, same-breath updates). (4) Owner refined: plain ≠ diluted → created `docs/documentation-standard.md` (two registers one truth; Diátaxis/Minto-SCQA/C4/ADR/docs-as-code as floor-not-ceiling) + `docs/GLOSSARY.md` (21 seed terms). (5) Created `docs/suggestions-ledger.md` (S-1..S-10, all session suggestions with statuses; standing artifact per the judgment license). 3 decision-log rows added. Also: memory `lossless-multi-session-continuity` saved (owner's multi-session lossless-continuity instruction).
  1451	- **Gate:** docs/state/memory files only; NO product code; slice-2 uncommitted diff untouched. Codex cross-check remains NAMED-OPEN at the plan stage (validates the REFRAMED direction — consequential).
  1452	- **Held / Next:** fresh session → PLAN stage per the HANDOFF paste-ready prompt (amended for the reframe): UC-2 primary reads (ACP/UCP specs + surface-access legality + operator-voice pass) → council deep-validation on the reframed direction → Codex cross-check → declarative plan + roadmap + repo-restructure proposal → owner GO. PENDING owner calls folded into the plan: S-4 (module-boundary ceremony), S-5 (slice-2 close-out), S-9 (report-as-document). Owner-gated stops unchanged.
  1453	
  1454	## 2026-07-02 (fourth session) — PIVOT PLAN STAGE: Phase 1 UC-2 primary reads DONE (inline after subagent seat limit)
  1455	
  1456	- **Task:** plan-stage resume per HANDOFF top block; plan-mode plan approved (`~/.claude/plans/resume-pure-treehouse.md`). Mode FULL · Effort MAX (direction-gating). `advisor` UNAVAILABLE again (4th-session pattern; surfaced). Owner mid-session directives: (1) **desktop web only, no mobile** (decision-log row added); (2) "don't wrap — continue all phases, keep momentum"; (3) full-judgment license for recommended actions.
  1457	- **Seat event (surfaced verbatim):** all 4 Phase-1 research subagents died on the shared Claude seat limit — "You've hit your session limit · resets 9pm (America/New_York)". NOT silently retried; Phase 1 re-executed INLINE by the main session (quarantined WebSearch/WebFetch).
  1458	- **Did:** UC-2 primary reads complete → ADDENDUM appended to `docs/research/pivot-research-2026-07.md`: ACP primary-read (Apache-2.0, OpenAI+Stripe, beta, latest stable 2026-04-17; full feed conformance surface extracted; retail-shaped; **no official validator — seat empty confirmed**; "15-min refresh" DOWNGRADED to UNVERIFIED) · UCP correction (unveiled 2026-01-11 NRF, spec 2026-04-08 live, Apache-2.0, RFC-2119, JSON-schemas; **Food vertical co-developed by DoorDash/Square/Toast/Uber Eats**; no conformance suite) · legality clean-core confirmed (Square ITEMS_READ merchant-permissioned OAuth = green) · §20-563.3 "Fee caps" section CONFIRMED + LL79 effective 2025-06-30 (5-31 flagged) · AB 578 UNVERIFIED RESOLVED (consumer customer-service law; adjacent not core) · operator voice STILL blocked (3rd attempt; named to-do).
  1459	- **Next:** council smoke-test (seat may still be limited) → if blocked: Phase-4 plan draft + Codex cross-check first, council on seat reset — a surfaced gate-ORDER adjustment, not a gate skip; nothing DECIDED until council + Codex + owner GO.
  1460	
  1461	## 2026-07-02 (fourth session, cont.) — Council + Codex gates RUN; plan v1.0-rc ready for owner GO
  1462	
  1463	- **Did:** (1) Council deep-validation executed sequentially (idea-sharpener → user-pain-validator → build-realist → market-strategist → devils-advocate; all in `shared_reasoning.md` 2026-07-02 evening) + synthesis per `council-decision-synthesis` → **RESHAPE-PROCEED, 7 conditions**; intra-council falsifications: "seat empty" (→ ⚠ CORRECTION appended to the research digest), "no urgency on module 2" (July-16 DCWP window, primary), UC-2-leads ordering (evidence-unsupported → UC-1 recentered). (2) Codex cross-check via codex-guarded (SEAT_OK smoke → full read-only xhigh run) → **CONFIRM-WITH-AMENDMENTS, 12/12 accepted**, reconciled primary-model-final (`docs/reviews/codex-2026-07-02-pivot-crosscheck{,-raw}.md`). (3) Plan authored + reconciled → `docs/plan-truth-audit-execution.md` **v1.0-rc** (G8 pre-build crux gate; split tripwires; MEDIUM-conditional confidence; desktop-only constraint folded). (4) Docs coherence: suggestions-ledger + UC-7 backlog corrections; GLOSSARY (+4 terms, UCP entry corrected); PLAIN-ENGLISH stage table updated; decisions_log.md line added.
  1464	- **Skills/agents used:** claude-os (front door) · council agents ×5 · council-decision-synthesis · codex-guarded · research inline (WebSearch/WebFetch, Law-11).
  1465	- **Gate state:** council DISCHARGED · Codex (direction) DISCHARGED · **OWNER GO = the open gate** (O1–O8, plan §9; O4 July-16 DCWP is time-sensitive THIS WEEK). No product code changed; slice-2 diff untouched; no commits.
  1466	
  1467	
  1468	## 2026-07-02 (fourth session, final) — OWNER GO → S0 committed + G8 PASS; build is live
  1469	
  1470	- **Owner GO** ("do it") + rulings: NO-WAIT (wait-states → inline checks/alt sources) · REAL-FIRST data · O4 DCWP declined · commits authorized. Decision-log rows added; plan flipped v1.0-rc → v1.0 GO.
  1471	- **S0:** verify GREEN 306+5 → committed `a65064b` (S-5 close-out, provenance caveat per Codex amendment 2) + `fb20eba` (plan-stage docs). Push HELD (no remote). Restructure (§6) deferred to W0 (build session first step).
  1472	- **G8 (inline, no-wait):** PASS — UCP catalog spec primary read: Business role abstract, NO SOR requirement, NO accuracy SLA ⇒ the copy layer is in-protocol and drift persists behind live reads; Feedonomics ACE = syncer-not-judge (seat unoccupied); buyer claim consciously declined. Record: `docs/reviews/gate-2026-07-02-g8-crux.md`.
  1473	- **Next:** fresh session → W0+W1+P1 per the HANDOFF build prompt. Session cut recommended (long context).
  1474	
  1475	## 2026-07-03 — BUILD session (Fable orchestrates, Opus executes; W0 + P1 + W1)
  1476	
  1477	- **Routing executed per the owner rulings:** Fable = orchestrator/final judge (equivalence bar + post-check elevation, both recorded in decision-log today); execution delegated to Opus builders. Seat events surfaced verbatim: W0+P1 builders died once ("resets 7:40am") → owner confirmed reset → relaunched OK; W1 builder died ("resets 2:30pm") → W1 executed INLINE under NO-WAIT (deviation row in decision-log; acceptance-gate pass on W1 = named obligation post-reset). advisor unavailable (6th session).
  1478	- **W0 (restructure §6) ✅ committed `1b04766`:** verifier skeleton in (`lib/verifier-core`, `lib/packs/{listings,fees}`, `bin/`, `fixtures/`, `evals/{core,packs}`); activation archived runnable to `legacy/activation/` (77 git-mv renames; `npm run test:legacy` = 306+5 green); verify GREEN 310+5 re-run live at judgment; ledger `docs/restructure-w0-ledger.md`. Fable-judged PASS + elevation (C3 MatchingMode required on the report type).
  1479	- **P1 (UC-1 rule table) ✅ committed `da1e2e7`:** NYC §20-563.3/LL79 codified on primary text — 17 rules all VERIFIED-primary; effective-date conflict RESOLVED (became law 2025-05-31, effective 2025-06-30 per LL79 §4); U1–U5 honest gaps (U1 "purchase price" base = F1 dependency). Fable re-verified 6 load-bearing clauses against the raw extraction. Elevation: GLOSSARY dedup/re-sort + 7 fee terms; `docs/research/source-lockfile.md` seeded (Codex amendment 12).
  1480	- **W1 (wedge) ✅ committed `5a81440` (INLINE, deviation recorded):** seeded synthetic SOR + faithful/drifted ACP feeds + constructed UCP response fixtures + deterministic comparator + evidence model + one-command CLI (Node-24 native TS; exit 0/1/2). C1 $0-LLM proven by import-graph eval; C2 guard runtime-enforced; C3 differential proves one-comparator-two-adapters incl. the REQUIRED ID-mismatch + modifier-ambiguity classes; C6 coverage MEASURED 8/8 injected + 8/8 caught (overclaim scan caught its own disclaimer — reworded); C9 corpus README (license = owner call at Pub); C10 simulated labels + spec pin. verify GREEN exit 0 — **409 passed + 5 skipped**; RED-GREEN ×4 executed (`docs/reviews/w1-verify-evidence.log`). Injector defect found+fixed during build (touched-set: drift stacking on the re-keyed row silently un-covered staleness).
  1481	- **Skills/tools:** Agent-tool delegation (Opus builders) · Node 24 type-stripping (no new deps) · seeded-PRNG property-style tests (no PBT lib — escalation avoided).
  1482	- **Next:** W2 (UCP ajv + `ucp-schema` CI oracle) per plan §5 — delegate when the seat resets; then W3 → M1 Codex batch + acceptance-gate (incl. the W1 named obligation).
  1483	
  1484	## 2026-07-03 — W2 (UCP conformance leg + `ucp-schema` CI oracle + P3 fold-ins)
  1485	
  1486	- **W2 (delegated build, Opus @ xhigh; Fable orchestrates/judges) — verify GREEN exit 0, 478 passed | 5 skipped (was 411); test:legacy 306+5 unchanged.** The CONFORMANCE leg (feed/response vs published schema), cleanly separate from W1's TRUTH leg (LST-CONF-* vs LST-* families).
  1487	- **UCP schema intake:** live-verified `Universal-Commerce-Protocol/ucp-schema` = validator tool v1.4.0 (Apache-2.0); the JSON Schemas live in the sibling SPEC repo `ucp` @ tag `v2026-04-08` (== `UCP_PINNED_VERSION`). **78 schemas pinned + sha256-locked** at `fixtures/ucp-schemas/2026-04-08/` (PROVENANCE + LICENSE). L6 RELOCKED VERIFIED. Divergence (schemas-not-in-ucp-schema-repo) recorded, not blocking.
  1488	- **ajv intake:** `ajv@8.20.0` + `ajv-formats@3.0.1` (both MIT, exact-pinned, runtime deps of the validator path only); plan-§3-named, $0/offline. Ajv2020 + strict:false (UCP vendor keywords `name`/`ucp_*` treated as annotations; all standard keywords enforced). $0-LLM import-graph eval unchanged + green (P3-5 bare-fetch scan added).
  1489	- **Own conformance validation:** `lib/packs/listings/conformance.ts` (ajv over pinned schemas → LST-CONF-* findings through the C2 guard); `ucp-wire.ts` (real-UCP builder + THIRD truth adapter, C3); CLI `--conformance` leg (bin/check.mjs; exit 0/1/2 unchanged; `npm run check:conformance`).
  1490	- **C5:** N=35 seeded CI corpus (14 valid + 21 invalid, 8 violation classes, `fixtures/ucp-conformance-ci/` + manifest, byte-frozen); ajv verdicts asserted per-fixture. **Differential oracle: cargo NOT installed → C5 agreement UNMEASURED locally** (`test:ucp-oracle` skips loud, exit 0 — escalated upstream). ACP per-field-rule red-green audit added (18 rules, `acp-field-rules.test.ts`).
  1491	- **HEADLINE (conformance-vs-truth):** `valid/conformant-but-false.json` PASSES ajv yet the truth leg catches its price lie — both machine-checked.
  1492	- **P3 fold-ins (all 7):** P3-1 C6 skew derived from manifest · P3-2 injector invariant test · P3-3 guard tightened (source/field) · P3-4 engines node≥24 · P3-5 fetch scan · P3-6 C10 platform-claims gate (`honesty-c10.test.ts`) · P3-7 stale W0 comment fixed.
  1493	- **Skills/tools:** ajv/ajv-formats (source-intake vetted) · Node 24 type-stripping · seeded pure generators + freeze-integrity · quarantined fetch of untrusted schema DATA (Law 11).
  1494	- **Gate:** RED-GREEN ×7 executed (`docs/reviews/w2-verify-evidence.log`); slice record `docs/reviews/w2-slice-record.md`. NOT committed — awaiting Fable equivalence review of the diff. **Next:** W3 (one-page report + corpus packaging) → M1 Codex batch + acceptance-gate (incl. the W1 named obligation + this W2 diff).
  1495	
  1496	## 2026-07-03 — W1 gate discharge + W2 Fable-equivalence review (seventh session)
  1497	- **W1 named obligation DISCHARGED:** independent acceptance-gate on 5a81440 (first launch died on seat limit — raw error surfaced; owner confirmed reset; relaunch completed). Verdict BLOCK → both P2s closed same session (P2-1 UCP-fixture freeze-lock extended, red-green; P2-2 raw verify evidence run live) → **SHIP conditional on M1 Codex batch**. Record `docs/reviews/gate-2026-07-03-w1-wedge.md`; commit `08c9299`. P3-1..7 advisories folded into W2.
  1498	- **W2 Fable-equivalence review: PASS.** Live re-verify exit 0 (478+5) + test:legacy 306+5; line-level review of conformance.ts/guard/CLI/provenance; RG×7 log spot-verified; all six builder escalations (E-1..E-6) ACCEPTED — E-2 reading correct (W1 UCP fixtures = normalized shape, not retrofitted), E-4 headline adapter justified.
  1499	- **Elevation pass:** shape-honesty note added to `fixtures/synthetic-restaurant/README.md` (W1 UCP fixtures ≠ wire shape, by design); PLAIN-ENGLISH.md status row added same-breath (was missed by the builder).
  1500	- **Escalation to owner (open):** cargo/rustc absent → C5 oracle agreement UNMEASURED locally; owner options = install Rust toolchain (poppler precedent) or accept optional-lane measurement elsewhere. Decide by M1.
  1501	- advisor unavailable (7th/8th consecutive attempts, surfaced verbatim).
  1502	
  1503	## 2026-07-03 — eighth session: W3 slice + M1 ceremony (Fable orchestrator; skills: none beyond house process)
  1504	
  1505	- **W3 delegated to an Opus builder** (per ROUTE+JUDGE) and returned complete: `/report` one-page web view (two registers, printable, SIMULATED banner) + machine-JSON CLI contract + `fixtures/README.md` corpus index (license pending owner decision). Builder escalations E-1..E-5 recorded; RG×7.
  1506	- **W3 Fable-equivalence review: PASS with 3 elevation fixes applied directly** — F-1 `--json` was documented but never parsed (unknown flags now exit 2, RG-8); F-2 `/report` honesty wording (UCP tab = constructed simulation; banner reference wording); F-3 the independent verify re-run caught 2 W2-era spawn tests flaking on 20s timeouts (raised to 60s, same as the builder's new tests). Committed `54124ff`; verify 506+5; legacy 306+5.
  1507	- **M1 ceremony leg 1 — batched Codex** (`gpt-5.5`@`xhigh`, codex-guarded, read-only, seat smoke-tested SEAT_OK) over the whole wedge module: **BLOCK 1 P1 + 4 P2 + 2 P3**, all six W1 claims + the headline CONFIRMED. **All 7 findings accepted + fixed red-green same session** (CLI mixed-mode exclusion; drift-013 answer-key split + completeness invariant; C6 per-entry; claimSource receipt; exactly-one set-equality; C10 scan + wording; surplus positionals). Committed `7962810`; verify 514+5; legacy 306+5. Records: `docs/reviews/codex-2026-07-03-m1-wedge-batch{,-raw}.md` + `m1-reconcile-evidence.log`.
  1508	- **Routing doctrine (updated 2026-07-03) adopted on owner direction** — decision-log row same date: frontier-advisor = the working advisor leg (first successful consult in 8 sessions, at the M1 boundary: PROCEED + 2 directives honored), implementer = default delegated-execution lane, top-model-final = the Fable-equivalence bar (doctrine-backed).
  1509	- **M1 confirming pass:** ALL SEVEN DISCHARGED (file:line per finding; Codex ran direct CLI checks where its sandbox blocked vitest) + 1 new residual P3 (`--op` accepted on the truth leg) → fixed red-green (`0eda64c`, cli-c1 17/17). Cross-model gate DISCHARGED; W1's conditional-SHIP condition MET.
  1510	- **M1 acceptance-gate: SHIP — the wedge module ACCEPTED at `0eda64c`** (all five gates PASS; test-count chain 411→478→506→514→515 reconciled no-gaps; 2 non-blocking advisories → D1; em-dash note → Pub). First launch died on the subagent seat limit (raw: "You've hit your session limit · resets 8:10pm (America/New_York)"); owner-confirmed retry completed. Record: `docs/reviews/gate-2026-07-03-m1-wedge-module.md`. Final verify 515+5; legacy 306+5.
  1511	- **Wrap:** state docs synced (PROJECT_STATE/CURRENT_TASK/HANDOFF top blocks; D1 resume prompt set, bare-resume directive continues); standing wrap practice recorded (owner-unknowns surfaced each wrap; memory + HANDOFF); open owner calls surfaced: cargo/Rust (C5) + corpus license (O6).
  1512	- **D1 demo slice BUILT (delegated implementer lane, spec-adherence mode).** One deterministic $0-LLM transcript engine (`lib/packs/listings/demo/`: copy single-source · SOR-blind actor · transcript builder · text renderer) + two thin renderers: a `demo` mode on `bin/check.mjs` (`--json` machine transcript; strict-flag discipline — mixed/unknown flag or surplus positional exits 2) and a Static `/demo` web page (two registers, SIMULATED banner) rendering the committed transcript golden. Beats COMPUTE (verifier + conformance entry points called for real; faithful-feed / faithful-doc mutations flip the verdicts — RG). Actor SOR-blindness machine-verified (transitive imports exclude `reference.ts` + fixtures; alias-capable resolver adopted repo-wide, fold-in ii). Honesty single-sourced: C7 verbatim claim in one module, banned "agent caught" framing machine-absent, simulated label on every demo surface. CLI text + transcript JSON byte-frozen goldens (`fixtures/synthetic-restaurant/expected-demo.{txt,json}`, `npm run fixtures:demo`). Fold-in i: dead third clause removed from c3 `covers()`. RG×4 executed (beats-compute · blindness · honesty · golden-lock — `docs/reviews/d1-verify-evidence.log`). verify 557+5; legacy 306+5; build `/demo` Static. Escalations E-1..E-4 in `docs/reviews/d1-slice-record.md`. Skills: none new. NOT committed (orchestrator judges first).
  1513	- **2026-07-04 — F1 OFFLINE CORE (tenth session): F1a + F1b both SHIPPED at the per-slice gate, committed `896ab59` + `bda6314`; verify GREEN 715+5 (557→668→715); test:legacy 306+5 both slices.** Route per doctrine: harness advisor() DOWN (10th consecutive session, surfaced) → frontier-advisor consulted at pre-approach (verdict: two-dispatch shape B + 4 hardening constraints, ALL landed) and pre-wrap (verdict: M2 NOW over the offline module; live legs BLOCKED on M2 SHIP); implementer@opus built both dispatches; Fable-equivalence PASS ×2.
  1514	- **F1a (fees deterministic spine, `896ab59`):** typed statement schema (integer cents, simulated-marked, declared-vs-true seam) · seeded byte-frozen 4-statement corpus + answer key (assumed-base declared) · loud parser · 17-rule DRIFT-LOCK vs the JSON twin (11 typed predicates + 6 registered NON_STATEMENT_CHECKABLE with reasons; set-equality both directions; field-1:1) · U1 provisionality STRUCTURAL (one constant + makeFeeFinding marker enforcement + base-derived set derived from the twin) · e-1 refund-window as VERDICT STATE (violation / conditional-pending / cured; c excluded) · monthly-average ∨ per-order logic (reviewer proved monthly-fail ⟺ both statutory bases fail) · CLI `fees` leg (strict flags, exit 0/1/2, honest "classifier DEFERRED" label, import-graph $0-LLM proof) · C6 coverage measured 6/6 injected, 5/6 deterministic (relabeling deferred-to-classifier, honest). RG log `docs/reviews/f1a-verify-evidence.log` + reviewer-executed cap-mutation red-green. Elevation fix: monthly-average DENOMINATOR undercount limitation documented (bias runs against the platform). Record `docs/reviews/f1a-slice-record.md`.
  1515	- **F1b (classification layer, `bda6314`):** leak-free `ClassifierInput` contract (no trueCategory/answer key, ever) · 5-label true-category vocabulary + documented §7 mapping · deterministic keyword baseline = the AM-7 anti-theater FLOOR, PINNED at 19/21 held-out (the two misses = exactly the non-keyword-resolvable relabeling+bundling cases) · N=42 stratified gold set (21/21 tune/test, composition-locked, pinned IDs) · metrics port from legacy (conscious migration, provenance header) · advisory `auditWithClassification` path (candidates via core makeFinding, claim.source "classifier", separate array, never gates ok; F1a goldens byte-unchanged asserted twice over) · `docs/plan-f1b-classifier.md` (Groq $0 lane; R-DHON-3 floors PRE-REGISTERED; owner gate explicit) · builder escalation E-1 ACCEPTED (freeze-safety over literal wording). PROCESS DEVIATION recorded (decision-log 2026-07-04): builder died twice (seat limit [owner-confirmed resume] then "API Error: Overloaded") → NO-WAIT inline tail on the Fable seat (RG ×3 reviewer-executed incl. one honestly-recorded too-weak first mutation; evidence log + slice record + GLOSSARY +3 + PLAIN-ENGLISH row inline). Record `docs/reviews/f1b-slice-record.md`.
  1516	- **Wrap:** state docs synced; M2 resume prompt set (M2 FIRST, live legs blocked on M2 SHIP — advisor-ruled); open owner calls surfaced: arm the live classifier run (post-M2) · Gemini demo color (≤$0.50) · cargo/Rust C5 (past horizon) · corpus license (O6). Skills: none new.
  1517	- **2026-07-04 — M2 FULL CEREMONY (eleventh session): the F1 fee-audit module is ACCEPTED — acceptance-gate SHIP, all five gates PASS.** Chain: seat smoke-test `SEAT_OK` → ONE batched Codex (`codex-guarded`, read-only, config `gpt-5.5`@`xhigh`) over `c864618..bda6314` with the four advisor-ruled scope items enumerated → **BLOCK 2P1+2P2+1P3** (scope (a) ClaimSource additive-only CONFIRMED; (b) reviewer-executed red-greens CONFIRMED "real teeth"; (c) REFUTED on c-2 pass-through; (d) REFUTED on the tie-admitting floor) → frontier-advisor pre-verdict consult (first launch seat-limited, raw error surfaced; owner-confirmed retry succeeded → PROCEED, 3 rulings, no overturns) → ALL 5 reconciled primary-model-final + red-green (RG-1..RG-4 executed; goldens consciously regenerated, byte-deltas verified claim-id/tally-only; floor amended pre-run to ≥20/21) → mapped confirming pass **ALL FIVE DISCHARGED** + 1 residual P3 (stale E-1 comment) fixed → independent acceptance-gate **SHIP** (verify handoff run live: verify exit 0 **720+5**, test:legacy **306+5**; statements byte-unchanged; listings/legacy/gold untouched; e1 count discrepancy resolved benign + honesty note; deslop advisory 0/100). Gate-4 advisory nits deliberately left for the next slice (gate terms: commit as-is). Lesson routed to `~/claude-os/tasks/lessons.md` (evidence-log counts re-run at commit time). Records: `docs/reviews/{codex-2026-07-04-m2-f1-batch{,-raw},codex-2026-07-04-m2-f1-confirm-raw,m2-reconcile-evidence.log,gate-2026-07-04-m2-f1-module}.md/log`. advisor() down (11th session). NEXT: surface the owner-gated live classifier run (plan §3.1 floors) + open owner calls; STOP for the owner's word.
  1518	- 2026-07-05 — **F1b LIVE slice (twelfth session): the four owner decisions executed ("all four").** ① Live classifier lane WIRED (`lib/agents/fee-classifier.ts`, env-gated, $0 Groq-only) + the owner-armed pre-registered calibration run EXECUTED — run #1 lost outcome-blind to an ENOENT after all 84 calls (incident on record; harness fixed: probe-write before spend, freeze before assertions); run #2 AUTHORITATIVE: held-out 20/21 (strictly beats the 19/21 baseline), macro P 0.971, κ 0.944, flip 0.000, enhanced_service_fee recall 3/4 = 0.75 < ≥0.80 → **THE LABEL DEFERS** (conjunctive; snapshot frozen + eval-locked; split exposed, not re-scorable). ② Gemini color DECLINED. ③ cargo/Rust installed → **C5 MEASURED 33/35 + 2 documented LST-CONF-FORMAT divergences + 0 disagreements** (clean-PATH reproducible). ④ License → Pub gate. Gates: Codex BLOCK 1P1+2P2+1P3 → all reconciled red-green → confirming pass → final narrow confirm SHIP (raw on record); acceptance-gate BLOCK narrow (evidence-completeness) → both flips discharged with raws → SHIP. verify 737+6; test:legacy 306+5. Skills/tools: frontier-advisor (pre-approach consult), codex-guarded (3 passes + smoke tests), acceptance-gate subagent, groq-preflight, deslop advisory. Records: docs/reviews/{f1b-live-slice-record.md, codex-2026-07-05-f1b-live-slice.md +3 raws, gate-2026-07-05-f1b-live-slice.md, f1b-live-wiring-verify-evidence.log}. 2 lessons routed to ~/claude-os/tasks/lessons.md.
  1519	| 2026-07-06 | Pub slice: README replaced (truth-audit front), docs/PUBLICATION.md writeup, LICENSE (Apache-2.0) + NOTICE, corpus license closed (C9 test updated red-green), C10 gate extended over public prose (bit live, red-green), demo banner renamed + sanctioned golden regen (byte-delta verified), docs/demo-recording.md, legacy CSV relocated, sanitization audit clean (141 commits, no secrets ever). verify 743+6; legacy 306+5. | Codex batch + acceptance-gate follow in-session |
  1520	| 2026-07-06 | Fourteenth session — GITHUB PUBLISH EXECUTED (owner-armed: "resume except design, github publish complete all other steps."): authorization + intent capture committed pre-push (`8f81b9e`); private repo created + pushed (`gh repo create commerce-truth-audit --private --source=. --remote=origin --push` → github.com/sharanlabs/commerce-truth-audit, main tracking origin); About description set; identifier-exposure sweep run pre-flip (advisor constraint — tree clean except /Users/sharan_98 paths in internal transcripts [ratified as-is]; git author email on all commits = the surfaced finding); owner ruled STAY PRIVATE (flip = owner one-click, held); four defaults RATIFIED by directive; classifier retry NOT armed; S-11 open; design/deploy excluded. advisor() down 14th session → frontier-advisor consult PROCEED-WITH-CONSTRAINTS (all adopted). No product code changed; verify baseline unchanged (743+6 at 4489ad9). | State docs synced + pushed |
  1521	| 2026-07-06 | Fourteenth session, second directive ("complete all other steps now except github, design"): M2 gate-4 advisory nits closed red-green (claimIdPart escape + loud makeLineTagger + verdict comment; RED 6/6 fail + 5-segment ambiguous id probe → GREEN 6/6 + 3 segments; verify 749+6 exit 0; goldens byte-frozen), Codex changed-files review CLEAN + 1 P3 accepted-fixed, suggestions-ledger statuses synced (S-2/S-4/S-5/S-9), S-11 alternates live-screened (Plumbline cleanest; Parallax/Trig killed; Tare risky; Kilter diluted). Committed `9ef2d87`, pushed to private origin. Classifier retry NOT armed. Skills/tools: codex-guarded (smoke + review), WebSearch (name screen), npm registry + GitHub API curls. | State docs synced + pushed |
  1522	| 2026-07-06 | Fourteenth session, third directive (agentic extension): owner intent locked (applied-AI/agentic/AI-automation showcase lane — floor tools: Claude Code/Codex, n8n, MCP, Zapier; target roles: AI/Applied-AI Engineer, AI Automation Specialist; NOT model training, NOT no-code toys) + LIVE research pass executed INLINE (research-specialist subagent seat-limited, raw recorded; owner resume = confirmed conversion; 6 WebSearch sweeps, 1 transient classifier error retried clean) → docs/research/agentic-extension-research-2026-07.md (terminology validated; Anthropic official agent guidance; MCP = Linux Foundation industry standard; n8n $2.5B backbone pattern; evals = #1 hiring signal; Sierra/Harvey references). Proposed goal surfaced for owner GO: agent crew over the verified engine + MCP server + Slack/email lanes (offline-first) + n8n workflow lane. NO build started. | Awaiting owner GO on the extension goal |
  1523	| 2026-07-06 | Fourteenth session WRAP (fourth directive): extension goal framing fixed — PERSONAL DEMONSTRATION project (showcase proficiency, not venture); state docs + HANDOFF synced with the plan-stage resume prompt for any account; all work committed + pushed to the private origin. Session totals: publish executed (repo live private, flip = owner), advisory-nits slice shipped (9ef2d87, verify 749+6), S-11 screened, ledger synced, agentic-extension research digest committed. | Handed off — next: PLAN stage, fresh session |

exec
/bin/zsh -lc 'nl -ba PROJECT_STATE.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	# Project State
     2	
     3	Build update: 2026-07-06, fourteenth session FINAL WRAP (**AGENTIC EXTENSION DIRECTED + RESEARCHED — NEXT = PLAN STAGE (fresh session, any account; auto-fires on a bare `resume` via the HANDOFF top block).** Owner directives (decision-log 2026-07-06 ×4): the program extends into its original showcase intent — a **PERSONAL DEMONSTRATION project** proving applied-AI/agentic-systems/AI-automation proficiency (target roles: AI Engineer · AI Specialist · Applied AI Engineer · AI Automation Specialist; boundary: not model training, not no-code-only; floor tools: Claude Code/Codex · n8n · MCP · Zapier-class). LIVE research digest committed `docs/research/agentic-extension-research-2026-07.md` (cited 2026-07-06: agentic postings +280% YoY; Anthropic official agents-over-verified-tools guidance; MCP = Linux-Foundation standard; n8n $2.5B backbone pattern; eval literacy = #1 hiring signal). Proposed shape awaiting the plan gate: **agent crew (Intake/Audit/Evidence/Reviewer) over the gated engine as TOOLS + MCP server + Slack/email delivery (offline-first, RULES §3) + n8n self-hosted lane**; agents recommend / engine decides; Groq $0 + Gemini ≤$5; prototype-not-service. PLAN stage → Codex cross-check → **owner GO before any build**. Session also delivered: publish executed (repo LIVE PRIVATE, flip = owner) · advisory-nits slice `9ef2d87` (verify **749+6**, Codex CLEAN) · S-11 screen (Plumbline cleanest) · ledger sync · internal backlog ZERO. Seat events: research subagent seat-limited (raw in digest provenance) → inline conversion; advisor() down 14th session; frontier-advisor consult succeeded.**)
     4	
     5	Build update: 2026-07-06, fourteenth session (**GITHUB PUBLISH EXECUTED — the repo is LIVE PRIVATE at `github.com/sharanlabs/commerce-truth-audit` (main = `8f81b9e`, tracking origin; About description set); the PUBLIC FLIP is HELD by owner ruling.** Owner word (verbatim): "resume except design, github publish complete all other steps." — intent captured + committed pre-push (`8f81b9e` authorization row); design/deploy stay excluded; classifier retry stays unarmed (needs new pre-registration + explicit word); the four Pub defaults (interim name · Apache-2.0 · private-then-flip · internal-docs-as-is) are **RATIFIED by the directive**. Ceremony: advisor() down (14th consecutive session) → frontier-advisor consult **PROCEED-WITH-CONSTRAINTS** (parse confirmed; constraint = an identifier-exposure sweep before any public flip, since the 141-commit sanitization audit scoped SECRETS not privacy identifiers) → sweep run: tree carries only `/Users/sharan_98` paths inside internal transcripts (covered by the ratified as-is default); no handles/emails/secrets/workflows tracked; **git author email `sharank98@gmail.com` on all 144 commits = the surfaced finding** → put to the owner at the flip decision → **owner chose "Stay private for now"** (decision-log 2026-07-06 ×2). No product code changed; verify baseline unchanged (743+6 at `4489ad9`). **OPEN OWNER ACTS: ① flip PUBLIC when ready — one command: `gh repo edit sharanlabs/commerce-truth-audit --visibility public --accept-visibility-change-consequences` (timing anchor: NYC DCWP hearing July 16, 2026; NOTE: flipping publishes the author email permanently — an email rewrite must happen BEFORE the flip if wanted, and would invalidate every SHA-anchored gate record, needing a mapping note) · ② S-11 brand pick (repo rename is one `gh repo rename` later) · ③ design fix → deploy · ④ classifier retry only via new pre-registration + explicit word. NOTHING ELSE QUEUED.** **SECOND DIRECTIVE same session ("complete all other steps now except github, design"): the last internal backlog CLOSED at `9ef2d87` (pushed)** — the three M2 gate-4 advisory nits fixed red-green (`claimIdPart` separator escape, byte-identity on all committed values → goldens byte-frozen; shared loud `makeLineTagger` replacing two silent object-identity maps; stale verdict comment) with **verify 749+6 exit 0** + Codex changed-files review **CLEAN** (+1 P3 wording, accepted-fixed); suggestions-ledger statuses synced to reality (S-2/S-4/S-5/S-9); **S-11 alternates screened LIVE** (Plumbline cleanest > Kilter; Tare risky; Parallax/Trig/Assay dead; trademark+domain checks still owed pre-adoption). Classifier retry stays UNARMED (precedent ×3). **Every remaining open item is now an owner-only act.**)
     6	
     7	Build update: 2026-07-06, thirteenth session (**PUB EXECUTED — THE PLAN §5 ROADMAP IS COMPLETE (every slice shipped and gated); the repo is publication-ready and COMMITTED (`4489ad9`); the private-repo push was DENIED by the harness permission layer (no recorded owner authorization — the bundled ask timed out) and is honestly returned to the owner as a one-command act (`gh repo create commerce-truth-audit --private --source=. --remote=origin --push`); the PUBLIC flip after that remains the owner's one-click act.** Owner word: "except design complete all other tasks. resume" — design/deploy excluded; classifier retry excluded (needs a new pre-registration + explicit word). Shipped: README fully replaced (truth-audit program fronted; legacy = lineage section, archived runnable) · `docs/PUBLICATION.md` writeup · `docs/demo-recording.md` (byte-identical live transcript) · LICENSE Apache-2.0 + NOTICE (O6 closed; C9 test updated red-green) · C10 honesty gate extended over the public prose (bit its author live; gate kept, prose reworded) · surface rename → "Commerce Truth Audit" (descriptive interim, NOT a brand adoption — S-11 open; "Assay" collided with assay.tools + squatted npm on the 2026-07-06 live screen) with a banner-only sanctioned golden regen · legacy CSV relocated + the python config regression it exposed fixed (35 py-tests green) · source-lockfile relocked (L4/L6/L8 + L12–L15 LOCKED live; Juniper DROPPED rather than published on secondary sourcing; used-facts audit = zero PENDING-RELOCK among used facts) · sanitization audit CLEAN (141 commits, .env never committed, zero secret patterns in history, licenses papered). Gates: **Codex chain SHIP** (BLOCK×4 → SHIP across 5 passes; effort deviation [batch @medium] recorded, later passes forced xhigh; deepest catch = the repo's own source-lock rule) + **acceptance-gate SHIP** (route-back none; verify-handoff condition discharged with raw tails; `docs/reviews/gate-2026-07-06-pub-slice.md`). Final: verify exit 0 = **743 passed + 6 skipped** · test:legacy **306+5** · python **35 passed**. Records: `docs/reviews/{codex-2026-07-06-pub-slice.md (+5 raws), pub-verify-evidence.log, gate-2026-07-06-pub-slice.md}`. Deviations on record: research subagents seat-limited twice (raws verbatim) → NO-WAIT inline conversion; harness advisor() down 13th consecutive session (frontier-advisor consult SUCCEEDED pre-approach: PROCEED-WITH-CONSTRAINTS, all rulings adopted). **OPEN OWNER ACTS: ① flip the repo public (timing anchor: NYC DCWP recordkeeping hearing, July 2026; skim docs/reviews/ first) · ② ratify the four defaults-taken (decision-log 2026-07-06) · ③ S-11 brand pick · ④ design fix → deploy · ⑤ classifier retry only via new pre-registration. NOTHING ELSE QUEUED.**)
     8	
     9	Build update: 2026-07-05, twelfth session (**THE FOUR OWNER DECISIONS EXECUTED ("all four", decision-log 2026-07-05): ① the OWNER-ARMED LIVE CLASSIFIER RUN RAN — VERDICT: THE LABEL DEFERS.** The live Groq lane was wired (`lib/agents/fee-classifier.ts` — leak-free ClassifierInput-only prompt + static §20-563.3(d) rubric, schema-checked 5-label output, FAILED_TO_FALLBACK to the deterministic baseline, env-gated `groqLiveEnabled`, $0 by construction with NO paid branch; `LIVE_CLASSIFIER_DESIGN.wired→true` dated; the fees pack's zero-network proofs intact — the pack never imports the lane) and the pre-registered run executed. **Run #1 incident (honest record): all 84 calls completed then the results were LOST to a `writeFileSync` ENOENT (`lib/data/` moved at W0) BEFORE any metric printed — outcome-blind; harness fixed (probe-write BEFORE spend · freeze BEFORE assertions) → run #2 AUTHORITATIVE (degraded=false, zero fallbacks): held-out 20/21 = 0.952 (STRICTLY beats the pinned 19/21 baseline) · macro precision 0.971 · macro κ 0.944 · flip-rate 0.000 — but `enhanced_service_fee` recall 3/4 = 0.75 < the pre-registered ≥0.80 floor → per the conjunctive rule THE LABEL DEFERS** (no re-run, no floor change; the held-out split is EXPOSED + not re-scorable; any retry = a NEW owner-gated arming with fresh pre-registration). The one miss verbatim on record (relabel-test-2, unanimous ×3, coherent bundle-reading rationale). Frozen `lib/data/fee-classifier-calibration.snapshot.json` + eval-lock `evals/gold/fee-classifier-calibration.lock.test.ts` (verdict-tamper red-green executed DURABLY); status doc `docs/fee-classifier-calibration-status.md` (pre-registration pinned pre-run + incident + results + provenance addendum: floors committed pre-run `bda6314`/`550e3cb`, no-rerun rule `c73c100`, the two working-tree-only conventions provably outcome-invariant — 63/63 unanimous reps; no empty predicted class). **② Gemini demo color DECLINED (call closed, revivable only by owner word). ③ cargo/Rust INSTALLED (owner order, poppler precedent) → C5 MEASURED: `ucp-schema` 1.3.0 (latest crates.io) differential = 33/35 agree + 2 documented LST-CONF-FORMAT divergences (the JSON Schema 2020-12 format-assertion fork — we assert via ajv-formats, the official tool is annotation-only; encoded ONE class ONE direction, anything else fails) + 0 disagreements, exit 0, clean-PATH reproducible. ④ corpus license DEFERRED to the Pub gate (binds only at publication).** Gates: **Codex cross-model DISCHARGED (SHIP)** — batch BLOCK 1P1+2P2+1P3 (P1 = the ~/.cargo/bin PATH reproducibility hole, red-green proven in Codex's OWN sandbox; P2 = pre-registration provenance; P2 = plan contradictions; P3 = stale comments) → ALL reconciled primary-model-final → confirming pass (independently re-ran the oracle, verified provenance vs git history, recomputed unanimity; 3/4 + 1 residual + 1 new P3) → both fixed → final narrow confirm **SHIP re-run WITH its raw on the record** after the acceptance-gate refused the unrecorded first pass; **independent acceptance-gate: BLOCK narrow (evidence-completeness ONLY — "the substance is sound"; it recomputed the metrics itself, κ to 12 decimals, both invariance claims, the mechanical DEFER, and found the DEFER honest on every surface) → BOTH pre-committed flip conditions discharged with raws (the re-run narrow confirm + the raw suite tails/RG-4-durable/deslop appendix) → SHIP** (W1 flip precedent; `docs/reviews/gate-2026-07-05-f1b-live-slice.md`; its 4 advisories folded same-session). verify exit 0 = **737 passed + 6 skipped** (720→737: +12 offline, +1 skipped live harness, +5 lock); test:legacy 306+5; F1a goldens byte-unchanged; deslop 1/100 (one low nit recorded). Records: `docs/reviews/{f1b-live-slice-record.md, codex-2026-07-05-f1b-live-slice.md (+3 raws), f1b-live-wiring-verify-evidence.log, gate-2026-07-05-f1b-live-slice.md}`. Seat events raw on record: 2 Codex background launches externally stopped with 0 bytes / "Reading additional input from stdin..." (root cause: the CLI blocked on a never-closing background stdin → fixed `< /dev/null`) · the first acceptance-gate launch died mid-run on the subagent seat limit ("You've hit your session limit · resets 8:30pm (America/New_York)") → owner-confirmed retry completed · 1 transient harness classifier-unavailable error on a gate launch, retried clean · advisor() down 12th consecutive session (frontier-advisor consulted pre-approach: PROCEED-WITH-CONSTRAINTS, all 5 adopted). 2 lessons routed to `~/claude-os/tasks/lessons.md` (probe output paths before unrecoverable spend; COMMIT pre-registrations before arming). **NEXT = Pub (owner-gated, the last plan §5 slice) — nothing else queued; the session stops at the wrap. HELD: deploy (design-fix first) · public posting · push (no remote) · name adoption (S-11) · any new live arming (a classifier retry needs a NEW pre-registration + the owner's word).**)
    10	
    11	Build update: 2026-07-04, eleventh session (**M2 DISCHARGED — THE F1 FEE-AUDIT MODULE IS ACCEPTED (acceptance-gate SHIP, all five gates PASS; reconciliation committed `550e3cb`). verify GREEN exit 0 = 720 passed + 5 skipped (715→720, +5 tests); test:legacy 306+5 unchanged; statement fixtures byte-unchanged; listings/legacy/gold untouched.** Ceremony per the resume directive: seat `SEAT_OK` → ONE batched Codex (`codex-guarded` read-only, `gpt-5.5`@`xhigh`) over `c864618..bda6314` with the four advisor-ruled scope items → **BLOCK 2P1+2P2+1P3** — scope (a) ClaimSource `"classifier"` additive-only **CONFIRMED**, (b) reviewer-executed F1b red-greens **CONFIRMED** ("real teeth by code structure"), (c) statutory logic REFUTED on ONE point (c-2 pass-through = a silent boolean escape hatch vs the rule table's equal-actual-charge+proof requirement), (d) floors REFUTED on ONE point (the ≥0.90 accuracy floor admitted a baseline TIE, contradicting AM-7). **frontier-advisor pre-verdict consult** (first launch seat-limited — raw: "You've hit your session limit · resets 11:30pm (America/New_York)"; owner-confirmed retry succeeded): PROCEED, 3 rulings, no overturns (advisory-warn over a fake-verifiability schema field · amend the floor upward pre-run · full lineId + conscious golden regen with a diff-scope check). **ALL 5 RECONCILED primary-model-final + red-green** (`docs/reviews/m2-reconcile-evidence.log`, RG-1..RG-4): (1) new `FeeVerdict` state **`asserted-passthrough-unverified`** — an over-3% transaction fee on the platform-ASSERTED c-2 flag surfaces as a non-gating warn (never silently cleared, never a violation; `ok` = false-iff-violation holds; tsc exhaustiveness caught the CLI record); (2) classifier accuracy floor AMENDED PRE-RUN to **≥ 20/21, tie = DEFER** (dated in the plan row; strengthening-only); (3) parser rejects mixed-month statements loudly; (4) per-line claim ids gained statement-position `L<i>` tags (audit + classifier advisory), answer-key `expectedClaimId`s matched, goldens CONSCIOUSLY regenerated via the seeded generator — byte-deltas verified claim-id/tally-key-only, freeze teeth demonstrated firing pre-regen; (5) drift-lock extended to `kind`+`source_clause`. **Mapped confirming pass: ALL FIVE DISCHARGED** + 1 residual P3 (the E-1 three-member comment made false by fix #1) fixed. **Independent acceptance-gate: SHIP 5/5** — it re-derived the monthly-average⟺both-bases proof itself, authenticated the whole Codex chain line-by-line, its no-Bash gate-3 ran as a verify HANDOFF executed live + returned raw (verify exit 0 720+5 · legacy exit 0 306+5 · diff-scope proofs empty where demanded · deslop advisory 0/100), and its tripwired e1 test-count discrepancy resolved BENIGN (the F1a log's "10" = two pre-commit-transient builder-tree tests, never committed; nothing deleted from any commit — honesty note added to the batch record; lesson routed to `~/claude-os/tasks/lessons.md`: re-run evidence-log counts at commit time). Gate-4 advisory nits (stale `finding.ts:63` field comment · object-identity lineIndex · `#`-in-category id parseability) deliberately LEFT for the next slice per the gate's commit-as-is terms. Records: `docs/reviews/{codex-2026-07-04-m2-f1-batch{,-raw},codex-2026-07-04-m2-f1-confirm-raw,m2-reconcile-evidence.log,gate-2026-07-04-m2-f1-module}`. advisor() down 11th consecutive session (the gate thread's advisor also down). **NEXT = OWNER DECISIONS — the session STOPS here: ① ARM the live classifier run, now UNBLOCKED by M2 SHIP (plan `docs/plan-f1b-classifier.md` §3: Groq free-tier $0 · K=3 at temp 0 · TPD preflight/pacing · scored ONLY on the held-out test split vs the pre-registered floors incl. the amended ≥20/21 · tie/loss = the label honestly DEFERS) — surfaced, NOT started; ② Gemini demo color variant (≤$0.50); ③ cargo/Rust toolchain for C5 (past horizon); ④ corpus license (O6). Remaining plan §5 slice after F1: Pub (owner-gated). HELD: live LLM spend arming · deploy (deferred until design fixed) · public posting · push (no remote) · name adoption (S-11).**)
    12	
    13	Build update: 2026-07-04, tenth session (**F1 OFFLINE CORE SHIPPED — F1a (`896ab59`) + F1b (`bda6314`) both done at the per-slice gate (plan §5 F1, C8); verify GREEN exit 0 = 715 passed + 5 skipped (557→668→715); test:legacy 306+5 both slices.** Routing per doctrine: harness advisor() DOWN (10th consecutive session); `frontier-advisor` consulted at BOTH boundaries — pre-approach (PROCEED on shape B: two sequential dispatches, deterministic spine then classification layer, + 4 hardening constraints ALL landed: deterministic-only CLI leg honestly labeled · typed predicates drift-locked 1:1 vs the JSON twin · U1 provisionality STRUCTURAL · e-1 refund window as verdict state) and pre-wrap (ruling: **M2 runs NOW over the offline module; the owner-gated live legs are BLOCKED on M2 SHIP**). `implementer`@opus built both dispatches; Fable-equivalence PASS ×2 with live verify re-runs + reviewer-executed red-green. **F1a — the fees deterministic spine:** typed monthly-statement schema (integer cents, simulated-marked, declared-vs-true seam) · seeded byte-frozen corpus (faithful/drifted/cured/conditional + answer key with detection modes) · loud parser · the 17-rule NYC §20-563.3 table as typed predicates DRIFT-LOCKED to the JSON twin (11 implemented + 6 NON_STATEMENT_CHECKABLE with written reasons; set-equality both directions) · U1 purchase-price provisionality enforced by constructor (base-derived findings REQUIRE the marker; set derived from the twin) · §(e) refund-safe-harbor as encoded verdict states (violation/conditional-pending/cured; c excluded) · monthly-average∨per-order logic (reviewer PROVED monthly-fail ⟺ both statutory bases fail) · CLI `fees` leg (strict flags; honest "LLM classifier DEFERRED" label; $0-LLM import-graph proof) · C6 coverage MEASURED: 6/6 classes injected, 5/6 deterministic, relabeling honestly deferred-to-classifier. Elevation fix: the monthly-average DENOMINATOR undercount limitation documented (statement-invisible zero-fee orders bias the average toward flagging). **F1b — the classification layer:** leak-free `ClassifierInput` contract (no trueCategory/answer key reachable) · 5-label true-category vocabulary + documented §7 mapping · deterministic keyword baseline = the AM-7 anti-theater FLOOR, PINNED at **19/21 held-out** (its two misses are exactly the non-keyword-resolvable relabeling+bundling gold cases — the honest gap a live LLM must close) · **N=42 stratified gold set** (6 classes + clean × 3 tune + 3 test; disjoint; pinned IDs; composition-locked) · metrics port from legacy (conscious migration, provenance header; κ/flip-rate left behind until a consumer exists) · advisory `auditWithClassification` (candidates via the core C2 guard, claim.source `"classifier"` [the slice's ONE shared-core touch — additive union member, flagged for M2], separate never-gating array; F1a goldens byte-unchanged asserted twice over) · `docs/plan-f1b-classifier.md` with **PRE-REGISTERED R-DHON-3 floors** (beat baseline held-out accuracy; per-class recall ≥0.70 all labels, ≥0.80 on the two baseline-missed classes; K=3 temp-0; Groq $0; TPD pacing lesson carried) — **the LLM lane is DESIGNED, NOT WIRED; no live run without the owner's word; no "calibrated" claim below the floors.** Builder escalation E-1 ACCEPTED (advisory findings bypass FeeVerdict to keep F1a goldens byte-frozen — freeze-safety over literal wording). **DEVIATION RECORDED (decision-log 2026-07-04):** the F1b builder died TWICE (subagent seat limit, raw: "You've hit your session limit · resets 6pm (America/New_York)" → owner-confirmed resume completed the build; then "API Error: Overloaded" before the documentation tail) → NO-WAIT inline tail on the Fable seat (RG ×3 reviewer-executed — incl. one first mutation honestly recorded too-weak and strengthened — + evidence log + slice record + GLOSSARY +3 + PLAIN-ENGLISH row); mitigation = the M2 cross-model ceremony, whose scope MUST enumerate the ClaimSource touch + the reviewer-executed red-greens. Records: `docs/reviews/{f1a,f1b}-slice-record.md` + `{f1a,f1b}-verify-evidence.log`. **NEXT = M2 FULL CEREMONY (fresh session): ONE batched Codex via codex-guarded over the F1 module (`896ab59`+`bda6314`) + independent acceptance-gate → reconcile primary-model-final → THEN surface the owner-gated live classifier run (blocked on M2 SHIP).** OPEN OWNER CALLS: arm the live classifier run (post-M2; $0 Groq; floors pre-registered) · Gemini demo color variant (≤$0.50) · cargo/Rust for C5 (past the decide-by-D1 horizon) · corpus license (O6). HELD: live LLM spend arming · deploy (deferred until design fixed) · public posting · push (no remote) · name adoption (S-11).**)
    14	
    15	Build update: 2026-07-03, ninth session (**D1 SCRIPTED CORE SHIPPED — the demo slice is DONE at the per-slice gate (plan §5 D1; verify GREEN exit 0 = 557 passed + 5 skipped, +42; test:legacy 306+5 untouched).** Routing ran per the adopted 2026-07-03 doctrine: Fable orchestrated/judged; the harness `advisor()` tool was UNAVAILABLE again (9th session — surfaced) but the doctrine's working leg `frontier-advisor` consulted SUCCESSFULLY at the pre-approach boundary (verdict: PROCEED on shape C — one deterministic transcript engine + two thin renderers — with 4 hardening constraints, ALL landed); the build was delegated to the `implementer` lane @ opus per the resume directive. **What shipped:** `lib/packs/listings/demo/` transcript engine (typed beats; every verdict COMPUTED from the real verifier/conformance entry points, never narrated — faithful-feed mutation flips the verdicts, executed red-green) · SOR-BLIND scripted actor (machine-verified: transitive import walk forbids `reference.ts` + all fixtures + the LLM ban set) · CLI `demo` leg on `bin/check.mjs` (strict flags, `--json` parsed for real, mixed/surplus exit 2; output byte-frozen to `expected-demo.{txt,json}` goldens) · `/demo` web one-pager (Static prerender, SIMULATED banner, two registers, renders the committed JSON that a test byte-asserts against the LIVE engine output — the web provably cannot drift from the real verifier) · honesty gate extended (C7 claim VERBATIM single-sourced in `copy.ts`; "agent gets caught" framing machine-banned across every demo file with a bites-check; C10 scan covers all demo surfaces incl. goldens) · conformance-foil beat computed live ("passes the official schema check; still lies" — conformance PASS + truth FAIL on the same document). Both M1 gate advisories folded: dead C3 `covers()` clause removed; `cli-c1` adopted the alias-capable resolver (blindness eval shares it). Builder escalations E-1..E-4 ALL ACCEPTED on Fable review (E-3 = a genuine honesty catch: the old PLAIN-ENGLISH demo paragraph used the banned framing + a "real AI agent" claim — corrected). ELEVATION: 1 fix applied directly (corpus README now indexes the demo goldens + demo-leg run instructions; c9+c10 re-run 65/65 green). RG ×4 executed (`docs/reviews/d1-verify-evidence.log`); slice record + Fable-equivalence PASS verdict in `docs/reviews/d1-slice-record.md`. **OPEN OWNER CALLS: (1) Gemini color variant of the demo — arm or decline (≤$0.50 of the ≤$5 cap; non-load-bearing; the transcript type already carries the annotation slot for it); (2) cargo/Rust toolchain (C5 oracle agreement STILL UNMEASURED locally — the "decide before/at D1" horizon is here); (3) corpus license (O6).** NEXT = **F1** (UC-1 build: statement parser + LLM line-item classifier vs the P1 rule table + judge recalibration + evidence-cited fee report, C8; offline machinery first — any live classifier/judge run stays owner-gated) → **M2 full ceremony**. HELD: Gemini spend arming · deploy (deferred until design fixed) · public posting · push (no remote) · name adoption (S-11).**)
    16	
    17	Build update: 2026-07-03, eighth session (**W3 SHIPPED + M1 FULLY DISCHARGED — THE LISTINGS-TRUTH WEDGE MODULE IS ACCEPTED (acceptance-gate verdict SHIP at `0eda64c`). verify GREEN exit 0 = 515 passed + 5 skipped; test:legacy 306+5 unchanged.** (1) **W3** (`54124ff`, Opus builder per ROUTE+JUDGE, Fable-equivalence PASS + 3 elevation fixes applied directly): `/report` one-page web view (two registers, plain line leads every finding, four C2 receipts + claim source visible, C10 SIMULATED banner print-forced, prerenders Static) + machine-JSON CLI contract (`--json` parsed for real; unknown flags / surplus positionals / mixed modes all exit 2 loudly) + `fixtures/README.md` corpus index (both fixture sets, two labeled taxonomy axes, shape-honesty caveat verbatim, **License: pending owner decision** — O6, packaged NOT published). Elevation catches on record: documented-but-unparsed `--json` (RG-8) · report honesty wording (UCP tab = constructed simulation) · a W2-era spawn-test 20s-timeout flake the builder's own verify missed, caught by the independent Fable re-run. (2) **M1 ceremony COMPLETE — both legs**: batched Codex (`gpt-5.5`@`xhigh`, codex-guarded, ~2.77M tokens) over the whole module → **BLOCK 1 P1 + 4 P2 + 2 P3, with all six W1 claims + the conformant-but-false headline explicitly CONFIRMED** → ALL 7 reconciled + red-green (`7962810`): P1 = CLI mixed-mode exclusion (`--conformance` silently won over `--against` — asking both questions answered one); deepest = the C3 answer key made exactly truthful (drift-013 split into its two real effects with `sameMutationAs`; ONLY manifest bytes changed; NEW completeness invariant — every finding on each surface must be explained by a surface-labeled manifest entry; executed RED caught the exact reported defect on BOTH surfaces) + C6 per-entry teeth + claimSource rendered/locked + exactly-one set-equality + C10 scan/wording + surplus positionals → **mapped confirming pass: ALL SEVEN DISCHARGED** + 1 new residual P3 (`--op` accepted on the truth leg) fixed red-green (`0eda64c`) → **independent acceptance-gate: SHIP, all five gates PASS** (test-count chain 411→478→506→514→515 reconciled no-gaps; **W1's conditional stamp SUPERSEDED — the module is ACCEPTED at `0eda64c`**; 2 non-blocking advisories folded into D1: dead C3 test clause + cli-c1 resolver alias gap; em-dash style noted for Pub). Records: `docs/reviews/{codex-2026-07-03-m1-wedge-batch{,-raw}.md, m1-reconcile-evidence.log, gate-2026-07-03-m1-wedge-module.md}`. (3) **UPDATED ROUTING DOCTRINE (dated 2026-07-03) ADOPTED on owner direction** (decision-log row): `frontier-advisor` = the working advisor leg — **first successful advisor consult in 8 sessions** (PROCEED at the M1 reconciliation boundary; both directives honored: mapped confirming pass + sameMutationAs guard-limit recorded); `implementer` = default delegated-execution lane (opus escalation for subtle slices); the Fable-equivalence review = the doctrine's top-model-final acceptance bar. **Standing wrap practice (owner, 2026-07-03): surface newly-discovered owner-unknowns at every wrap** (memory saved). Seat events raw on record: the first acceptance-gate launch died on the subagent seat limit ("You've hit your session limit · resets 8:10pm (America/New_York)"); the owner-confirmed retry completed SHIP. **OPEN OWNER CALLS: cargo/Rust toolchain (C5 oracle agreement UNMEASURED locally — decide before/at D1) · corpus license (O6).** NEXT = **D1** (scripted spec-faithful demo agent on the drifted corpus + the conformance-foil beat "passes `ucp-schema validate`; still lies"; Gemini color OWNER-GATED ≤$0.50 of the ≤$5 cap; fold in the 3 gate advisories). HELD: Gemini spend arming · deploy (deferred until design fixed) · public posting · push (no remote) · name adoption (S-11).**)
    18	
    19	Build update: 2026-07-03, seventh session (**W1 NAMED OBLIGATION DISCHARGED + W2 DONE, both committed (push HELD, no remote). verify GREEN exit 0 = 478 passed + 5 skipped; test:legacy 306+5 unchanged.** (1) The independent acceptance-gate ran on the W1 diff (`08c9299`) — first launch died on the subagent seat limit (raw verbatim: "You've hit your session limit · resets 3:10pm (America/New_York)"), owner confirmed the reset, relaunch completed. Verdict **BLOCK, narrow**: all six W1 engineering claims CONFIRMED at file:line ("at the fable-equivalence bar"), the RG log authenticated by independent failure-count recount; two flip conditions — P2-1 the corpus README's tamper-proof claim outran the freeze-locks (the two UCP fixtures + the manifest's ucpVersionSkew block unlocked; one exercised by zero tests) → FIXED by extending the freeze test (red-green executed), P2-2 "verify green" existed only as maker prose → raw evidence run live (verify exit 0; drifted exit 1; faithful exit 0; zero legacy/ paths in the W1 diff; Node v24.15.0) → record FLIPPED to **SHIP conditional on the M1 Codex batch** (`docs/reviews/gate-2026-07-03-w1-wedge.md`); its 7 P3 advisories folded into W2. (2) **W2** (`1d0697e`) built by the delegated Opus builder per ROUTE+JUDGE, **Fable-equivalence review PASS**: 78 official UCP JSON Schemas pinned from the authoritative spec repo (`ucp` tag `v2026-04-08`; the task expected them in `ucp-schema` — that is the Rust validator TOOL; divergence recorded in PROVENANCE + lockfile; per-file sha256, Apache-2.0, **source-lockfile L6 RELOCKED**); ajv 8.20.0 + ajv-formats 3.0.1 (exact-pinned, MIT, intake-noted) compile them `strict:false` = STRUCTURAL conformance (labeled bound; the UCP resolve step = the cargo oracle's job); `LST-CONF-*` findings flow through the SAME C2 guard (P3-3 tightened it: claim.source/field now required); the CLI gains a `--conformance` leg (exit 0/1/2 unchanged; C1 one-command holds; $0-LLM import-graph eval green + P3-5 fetch-scan added); **N=35 seeded byte-frozen CI corpus** (14 valid + 21 invalid across 8 violation classes); **THE PROGRAM HEADLINE IS NOW MACHINE-CHECKED** — `fixtures/ucp-conformance-ci/valid/conformant-but-false.json` PASSES ajv conformance yet the truth leg catches its price lie via the new third adapter `ucpSearchResponseToClaims` (E-4 scope-add, accepted — strengthens C3); ACP 18/18 field rules isolated red-green (`acp-field-rules.test.ts`); C10 platform-claims grep-gate implemented (`honesty-c10.test.ts`, P3-6); RG ×7 executed (`docs/reviews/w2-verify-evidence.log`); slice record with all six builder escalations E-1..E-6 ACCEPTED on Fable review (`docs/reviews/w2-slice-record.md`); elevation pass added the fixture shape-honesty note (W1's `ucp-catalog-response.*` = normalized truth-leg shape, NOT wire shape — fails conformance by design, recorded verbatim, nothing planted) + the same-breath PLAIN-ENGLISH row the builder missed. **OPEN OWNER CALL (decide by M1): cargo/rustc NOT installed → C5 official-oracle agreement UNMEASURED locally** (`npm run test:ucp-oracle` skips loud, exit 0; no agreement claimed) — install the Rust toolchain (poppler precedent) or accept measurement elsewhere. advisor UNAVAILABLE (7th consecutive session, surfaced). NEXT = **W3** (one-page report web+JSON + corpus packaging, C4/C9) → **M1 full ceremony** (ONE batched Codex via codex-guarded over the whole wedge module — W1's gate-SHIP is CONDITIONAL on it — + independent acceptance-gate). HELD: Gemini spend arming · deploy (deferred until design fixed) · public posting · push (no remote) · name adoption (S-11).**)
    20	
    21	Build update: 2026-07-03, sixth session (**BUILD EXECUTED — W0 + P1 + W1 ALL DONE, GATED, COMMITTED (push HELD, no remote). verify GREEN exit 0 = 409 passed + 5 skipped; legacy suite independently green (`npm run test:legacy` 306+5).** Routing ran as ruled: Fable orchestrated/judged (THREE new owner rulings recorded in decision-log 2026-07-03: Fable-equivalence review bar on every delegated slice · post-check ELEVATION mandate (check→judge→elevate) · deploy DEFERRED until design is fixed), Opus builders executed W0 (`1b04766` — §6 restructure: verifier skeleton + `legacy/activation/` archive runnable, ledger `docs/restructure-w0-ledger.md`, elevation = C3 MatchingMode required on the report type) and P1 (`da1e2e7` — NYC §20-563.3/LL79 codified on primary text: 17 rules VERIFIED-primary; effective-date conflict RESOLVED = became-law 2025-05-31 / effective 2025-06-30 per LL79 §4; U1 "purchase price" base = the named F1 dependency; elevation = `docs/research/source-lockfile.md` seeded [Codex amendment 12] + GLOSSARY dedup/repair; Fable re-verified 6 load-bearing clauses against the raw extraction). **W1 (`5a81440`) EXECUTED INLINE on the Fable seat** — the delegated subagent seat hit its limit twice (raw verbatim: "You've hit your session limit · resets 7:40am / 2:30pm (America/New_York)"); owner confirmed the first reset (W0/P1 relaunch succeeded), the second (~4h) converted to inline build under NO-WAIT + full-liberty: seeded synthetic SOR (Square-shape subset, simulated) → faithful/drifted ACP feeds + constructed UCP catalog-response fixtures → deterministic comparator + C2-guarded evidence model (`makeFinding` — no finding without claim·referenceRow·rule·severity) → one-command CLI (`bin/check.mjs`, Node-24 native TS, exit 0 clean/1 drift/2 usage, $0-LLM proven STRUCTURALLY by an import-graph eval). C3 differential = ONE comparator, TWO adapters, shared drift set caught on both surfaces incl. the REQUIRED ID-mismatch + modifier-ambiguity classes; C6 coverage MEASURED 8/8 classes injected + 8/8 caught (overclaim scan live — it caught its own disclaimer, reworded); C9 corpus README (license = OWNER CALL at Pub; no LICENSE file exists); RED-GREEN ×4 executed (`docs/reviews/w1-verify-evidence.log`); freeze-integrity evals lock fixtures to the seeded generator. Injector defect caught+fixed mid-build (touched-set — drift stacking on the re-keyed row silently un-covered staleness). **DEVIATION RECORDED (decision-log 2026-07-03): maker=judge on W1 → NAMED OBLIGATION = independent acceptance-gate pass on W1 once the subagent seat resets (≥2:30pm ET); the M1 Codex batch additionally covers the whole wedge module (never skipped).** advisor UNAVAILABLE (6th consecutive session). NEXT = W2 (UCP ajv over published schemas + live-catalog response fixtures + `ucp-schema` CI differential oracle, plan §5) → W3 (one-page report + corpus packaging) → **M1 full ceremony (ONE batched Codex + acceptance-gate incl. the W1 obligation)**. HELD: Gemini spend arming · deploy (explicitly deferred until design is fixed, owner 2026-07-03) · public posting · push (no remote) · name adoption (S-11).**)
    22	
    23	Build update: 2026-07-03, fifth session (**BOOT/HANDOFF ONLY — no product code. Stage confirmed = BUILD (W0→W1+P1, spec-adherence; plan v1.0 GO unchanged). TWO OWNER RULINGS RECORDED (decision-log 2026-07-03 ×2 + HANDOFF ROUTE+JUDGE line): (1) build-stage routing — execution seat = Opus 4.8 @ xhigh, judgment delegates always fable-override, owner tweaks the routing chart manually; (2) FABLE = FINAL JUDGE at every stage (all gate verdicts/reconciliations/stage-exits on the Fable seat; Codex stays adversarial input, never skipped) + standing full-liberty blindspot-fix license (hard stops unchanged: spend/deploy/push/public/name). Blindspot fixes applied: poppler INSTALLED at wrap (owner-ordered, v26.06.0, `pdftotext` verified — P1's PDF extraction path OPEN); harness scaffolding gitignored (.agents/, .claude/skills/, screenshots/, skills-lock.json, settings.local.json) so slice diff-gates stay clean; live `npm run verify` re-run EXIT 0 (baseline green re-grounded 2026-07-03). advisor UNAVAILABLE (5th consecutive session, surfaced verbatim). AMENDED at wrap (owner): DELEGATION rendering — the fresh session stays on FABLE as orchestrator/final judge; execution slices delegated to Opus 4.8 @ xhigh subagents (regime-2 auto-routing; HANDOFF ROUTE+JUDGE line updated). NEXT = fresh FABLE session → paste the HANDOFF "BUILD W0+W1" prompt.**)
    24	
    25	Build update: 2026-07-02, fourth session FINAL (**OWNER GO → BUILD LIVE. S0 COMMITTED (`a65064b` slice-2 provenance close-out + `fb20eba` plan-stage docs + `c10766d` GO/G8 sync; verify green 306+5). G8 crux gate RAN INLINE → PASS** — UCP catalog spec: copy layer in-protocol (no SOR requirement, no accuracy SLA) ⇒ drift persists behind live reads; independent seat unoccupied (Feedonomics = syncer-not-judge); buyer claim consciously declined (`docs/reviews/gate-2026-07-02-g8-crux.md`). Owner rulings recorded: NO-WAIT · REAL-FIRST data · O4 DCWP declined · commits authorized (push HELD, no remote). **ACTIVE = W0 (restructure §6) → W1 (the $0-LLM wedge) + P1 (UC-1 rule-table via alternative sources) — paste-ready build prompt in HANDOFF; build stage = spec-adherence mode.** The fourth-session block below (ends "NEXT = OWNER GO") is superseded by this line.**)
    26	
    27	Build update: 2026-07-02, fourth session (**PLAN-STAGE GATES RUN — council RESHAPE-PROCEED + Codex CONFIRM-WITH-AMENDMENTS (12/12 accepted); plan v1.0-rc awaiting OWNER GO. Docs only; no product code; slice-2 diff untouched.**) — Resumed per the HANDOFF top block (plan-mode plan approved). **Phase 1 (UC-2 primary reads):** all 4 research subagents died on the shared Claude seat limit (raw: "You've hit your session limit · resets 9pm (America/New_York)"; surfaced, not retried) → executed INLINE: ACP primary read (Apache-2.0, OpenAI+Stripe, beta, latest stable 2026-04-17; full feed conformance surface extracted; retail-shaped, no menu model; "15-min refresh" DOWNGRADED to UNVERIFIED) · UCP corrected (unveiled 2026-01-11 NRF, spec 2026-04-08, Apache-2.0, RFC-2119, JSON Schemas; Food vertical = DD/Square/Toast/UE, schemas pending; catalog = LIVE-QUERY interface) · legality clean-core confirmed (Square ITEMS_READ) · §20-563.3 confirmed + LL79 effective-date conflict flagged (2025-05-31 vs 06-30) · AB 578 resolved (consumer customer-service law) · operator voice STILL blocked (3rd attempt). ADDENDUM + same-day ⚠ CORRECTION appended (council falsified "seat empty": official `ucp-schema` v1.4.0 exists; still-empty = feed-vs-SOR truth · evidence-grade reporting · UCP food schemas · UC-1 money lines). **Phase 2 (council, sequential ×5 + synthesis):** RESHAPE-PROCEED, 7 conditions; falsified along the way: "no urgency on module 2" (DCWP recordkeeping rule, comment deadline + hearing **JULY 16, 2026** — primary) and the UC-2-leads ordering (4-of-4 load-bearing dimensions sit in UC-1). **Phase 3 (Codex, codex-guarded, read-only xhigh):** CONFIRM-WITH-AMENDMENTS, **12 findings ALL ACCEPTED** — hard pre-build crux gate G8 (two-part crux: copy-layer persistence + buyer/enforcement authority) blocks UC-2 implementation; S-5 close-out safety wording; UC-1 = primary track; demo claim rewritten; docs-coherence fixes applied (suggestions-ledger + UC-7 backlog annotated); confidence MEDIUM-conditional; primary-source lockfile required pre-publication. **Phase 4:** `docs/plan-truth-audit-execution.md` **v1.0-rc** (SCQA · C1–C10 acceptance criteria · S0/G8/W1-3/P1/D1/F1/Pub slices · S-4 module-boundary gates · restructure proposal · taxonomy v1 · O1–O8 owner calls · split tripwires). Owner directives this session: **DESKTOP WEB ONLY (no mobile)** (decision-log row); "don't wrap — keep momentum"; full-judgment license. Same-breath: PLAIN-ENGLISH + GLOSSARY (+4 terms, UCP corrected) updated; decisions_log.md line; decision-log + task-log rows. `advisor` unavailable again (4th session). **NEXT = OWNER GO on plan §9 (O1–O8; O4 = July-16 DCWP call, THIS WEEK). No build — including S0's commit — before it.** Owner-gated stops HELD: live spend (≤$5), deploy, public posting, git push (no remote), name adoption, restructure execution, ratification. Everything below is historical.
    28	
    29	Build update: 2026-07-02, third session (**REFRAME ACCEPTED FOR PLANNING + STANDING DIRECTIVES + DOCUMENTATION SYSTEM — docs only; NEXT = the PLAN stage in a FRESH session (paste-ready prompt in HANDOFF top block).**) — On the owner's explicit "independent judgment, full liberty" ask, Claude proposed and the owner ACCEPTED (for planning; ratification unchanged at council → Codex → owner GO): **UC-2's lead artifact = an OPEN ACP/UCP conformance + truth-audit toolkit ("the truth layer for agentic commerce") + a self-referential demo (a real AI agent caught ordering from a deliberately-drifted synthetic menu)** — replacing the merchant-facing prototype-SaaS framing; UC-7 promoted from horizon into the lead artifact; UC-1 (fee-cap audit) unchanged as module two on the same verifier. **Standing plan-stage directives (owner):** (a) Claude's independent-judgment license runs through research/planning until build (then spec-adherence); (b) legibility = a HARD design constraint on the artifact (one-command validator · one-page report · demo needs no explanation — complex inside, simple outside); (c) data spans free/open + live (ToS-clean only) + hybrid + synthetic, edge cases = an ENUMERATED taxonomy + measured eval coverage (never "all"); (d) everything free/free-tier except Gemini ≤$5; the demo agent is scripted or Gemini-driven, never Claude/Codex as runtime. **NEW durable artifacts + standing rules:** `docs/PLAIN-ENGLISH.md` (living layman explainer, same-breath updates) · `docs/documentation-standard.md` + `docs/GLOSSARY.md` (two-register documentation — professional terminology decoded, never diluted; Diátaxis/Minto-SCQA/C4 as floor-not-ceiling) · `docs/suggestions-ledger.md` (S-1..S-10 — ALL of Claude's session suggestions with statuses; **S-4 module-boundary Codex ceremony, S-5 slice-2 close-out, S-9 report-as-document are PENDING and fold into the plan for owner GO**). 3 decision-log rows + task-log synced; `advisor` unavailable again (surfaced); NO product code changed; the suspended slice-2 uncommitted diff untouched. Also saved: memory `lossless-multi-session-continuity` (owner: multiple sessions/accounts point at this repo; state docs sync at every step boundary). Owner-gated stops HELD: live spend (≤$5), deploy, public posting, git push (no remote), platform-name. Everything below is historical.
    30	
    31	Build update: 2026-07-02 (**PIVOT RE-OPENED (owner-directed) — RESEARCH STAGE DONE; ACTIVE = OWNER PICKS THE PIVOT CANDIDATE → then plan/roadmap. NO product code changed; the multi-agent roadmap + slice-2 close-out are SUSPENDED (uncommitted slice-2 diff intact; its live-run authorization stands only on an explicit owner redirect back).**) — The owner re-opened the 2026-06-22 goal-fork on its pivot side. **Fixed objective (owner-settled via AskUserQuestion):** find a real, high-value, **structurally** underexplored problem in the DoorDash/Uber Eats/Grubhub-class US delivery-marketplace industry (company-agnostic), solved by a vertical AI solution at **adoption-grade prototype** standard — showcase-first venture-ready; prefer-reuse of the verification spine (evidence can override); "adoption" = the quality bar (metaphorical); constraints unchanged. **Research executed** (plan-mode approved; 2 quarantined read-only threads, ~100 sources checked, dated citations; first launch died on the seat session-limit — surfaced verbatim, relaunched post-reset; advisor unavailable — surfaced). **Ranked digest: `docs/research/pivot-research-2026-07.md`** — **#1 fee-statement integrity & fee-cap compliance audit (LEAD-POTENTIAL)**: NYC's first restaurant-side fee-cap enforcement (HungryPanda $875K, 2026-04-08; bundling/relabeling tactics documented) + NYC tiered caps (LL79/2025, eff. 2025-05-31) + live FTC fee rulemaking (docket FTC-2026-0463) — and **no product exists** (searched-and-empty; violations historically caught by hand); counterparty-adverse + cross-platform = durable; direct spine reuse. **#2 cross-surface menu/price/availability truth verification incl. AI-agent surfaces (LEAD-POTENTIAL, early)**: Square shipped ChatGPT/Claude ordering 2026-07-01; DD/UE/GH agentic ordering in Gemini since 2026-03; sync vendors are maker-not-judge; the independent-verifier seat is structurally empty; spec-churn + surface-access are the named risks. **★ Composite "marketplace truth-audit layer"** (both threads independently converged): one deterministic verifier of what platforms say vs the merchant's system-of-record — #1 as the wedge, #2 as the growth surface. **H1 dispute automation CONTESTED** (Loop $14M Series A 2026-02 + PAR/Olo entries + DoorDash ToS prohibits third-party dispute submission — funded, revocable category); **H2 refund-abuse AVOID** (platform incentives aligned — structural test fails); driver-deactivation AVOID-for-us. Explicit UNVERIFIED labels + standing to-dos (Reddit first-person pass, video teardowns, primary bill/spec texts) recorded in the digest. Decision-log row 2026-07-02; task-log updated; CURRENT_TASK + HANDOFF top blocks flipped (HANDOFF's old auto-resume directive SUPERSEDED so a bare `resume` cannot fire the suspended live spend). **→ RESOLVED same session: the owner PICKED the COMPOSITE "marketplace truth-audit layer", and (later same day) FLIPPED the order — UC-2 LEADS (cross-surface/agent-facing menu-price-availability TRUTH VERIFICATION, the cooperative platform-benefiting agentic-commerce showcase); UC-1 fee-cap audit = module two on the same engine (decision-log 2026-07-02 ×4 — "accepted for planning"; DECIDED only after the plan-stage council + Codex gates). INTENT FRAME recorded: demonstrate deep AI proficiency by BENEFITING the industry (platforms = indirect beneficiaries; positioning = "marketplace integrity infrastructure"); lean/optimized/structured; existing-system redesign in scope; the repo MAY be restructured per the goal (propose in plan, execute after owner GO). All use cases saved independently: `docs/research/use-case-backlog.md` (UC-1..UC-9 + re-check triggers). NEXT = the PLAN stage in a fresh session (paste-ready prompt in HANDOFF, updated UC-2-first): ACP/UCP spec primary reads + surface-access legality (UC-2) → council deep-validation → MANDATORY Codex cross-check → declarative plan/roadmap reusing the verification spine + the proposed repo restructure → owner GO before any build.** Owner-gated stops HELD: live spend (≤$5), deploy, public posting, git push (no remote), platform-name, the pivot decision. Everything below is historical.
    32	
    33	Build update: 2026-06-29 (**ROADMAP SLICE 2 CLOSE-OUT — STEP 1 of 2 DONE (offline load-reduction, gated) + STEP 2 HELD (live re-run, Groq window not fresh). Owner chose Option 1 (reduce per-run Groq load → fresh-window re-run). The OFFLINE half is done autonomously; the live spend is held on a hard precondition, surfaced.**) — Implemented the owner's Option 1 offline half, harness-only (no product code; the orchestrator has no domain-judge DI seam). `evals/agent-loop.live.test.ts`: a **pre-registered, OUTCOME-BLIND 4 tune + 4 test subsample** (one item per failure mode per split, **lowest-definition-order**, ORIGINAL splits preserved, `maxIterations=3` kept — only the item count trimmed so each item's convergence dynamics survive). 8 items ≈ 50% of the prior 16 → a safe margin below the ~item-13 point where the prior run depleted the daily window. **Success criterion for deliverable B was REFRAMED (pre-registered + advisor-cross-checked; FLAG at the batched Codex review):** a clean run = **detection === N** (the HARD live assertion — a degraded run fails loudly so it is never enshrined, matching the directive's "confirm detection=full-N before reading K"); **`test ≥ K` is now a REPORTED measurement** (`k_repin.test_meets_floor`/`interpretation`), **NOT a hard pass/fail** — at the reduced N, K=floor(rate×4) is coarse/near-binary and one GENUINE structural non-convergence (e.g. P-entity-2) can land the floor red on an otherwise-clean, authoritative run; reported honestly, never recomposed to go green; K asserted only non-vacuous (>1). Added an **OFFLINE composition unit test** (counts 4+4, all 4 modes both splits, disjoint, original splits preserved, exact pinned IDs) so the offline gate validates the rule, not just "nothing broke." **GATE: `npm run verify` GREEN — 306 passed (+1 composition test) + 5 skipped** (typecheck/lint/build clean; the live test still auto-skips offline). Pre-registration: `docs/a3-7-live-run-status.md` → "SLICE 2 CLOSE-OUT — PRE-REGISTRATION". **STEP 2 HELD — the Groq daily window is NOT fresh:** the 2026-06-29 live run depleted today's daily window; `groq-preflight` 2026-06-29 15:26 UTC showed TPM 99.1% but that does NOT reflect the daily (TPD) budget (Groq exposes no TPD header). Groq's exact reset semantics are **UNVERIFIED-from-memory (RULES §6)**; either way the window is not fresh today (depletion hours ago, same UTC day; expected reset ~2026-06-30 00:00 UTC). **NEXT = a FRESH-DAY session: confirm the window is genuinely fresh → run the already-authorized live re-run (≤$5; ~$0.02) → gate the whole slice-2 diff (verify → ONE batched Codex review → acceptance-gate) → commit (owner-authorized) → push HELD. Do NOT auto-fire the live spend overnight on calendar inference alone.** Changed this session (uncommitted, part of the slice-2 diff): `evals/agent-loop.live.test.ts` + `docs/a3-7-live-run-status.md` + state docs. Owner-gated stops HELD: live spend (slices 2+5, ≤$5), deploy, public posting, git push (no remote), platform-name. Everything below is historical.
    34	
    35	Build update: 2026-06-29 (**ROADMAP SLICE 2 — CLEAN R-A3-9 LIVE RE-RUN EXECUTED (owner GO 2026-06-29). TWO deliverables, OPPOSITE outcomes — an OWNER DECISION is now PENDING for the second. UNCOMMITTED at this line; the batched Codex + acceptance-gate + commit are HELD pending the owner's call (so a shared-seat Codex pass isn't spent on a possibly-superseded snapshot). NEXT = owner picks how to finish deliverable B.**) — Ran the live cross-family harness (`ENABLE_LIVE_AI=true` CLI-override only; `.env` stays `false`, re-confirmed). RULES §6 re-anchored 2026-06-29 (gemini-2.5-flash $0.30/$2.50, matches the pinned table). Cost **$0.0189** (« $5). **DELIVERABLE A — DRAFTER-RELIABILITY (slice-1 fix's first LIVE test) → ✅ CONFIRMED, CLEAN:** `final_redraft_live 16/16`, `final_redraft_fell_back 0`, **0/24 redrafts `finishReason=length`** (all `finishReason=stop`). The A3-7 ~75% structured-output parse-failure is **GONE** — the slice-1 fix (thinking `thinkingBudget=0` + `MAX_LIVE_OUTPUT_TOKENS` 2000→4096) works live. **Advisor carry-forward ANSWERED: the Drafter still EARNS its label under disabled thinking, more robustly than before** (every converged draft live-authored, zero stub fallbacks on the final redraft). **DELIVERABLE B — R-A3-9 AUTHORITATIVE CLEAN K → ⚠️ STILL INCOMPLETE (Groq-degraded again):** K is now REAL (tune 6/7=0.857 → **K=7**, not run #3's vacuous 1), but `degraded:true` (**detection 13/16**) and `test_meets_floor:false` (test 5/9 < 7) → NOT authoritative; the vitest floor assertion FAILED LIVE (5<7), an honest degraded-run red, NOT a code regression and NOT modified to pass (the live test auto-skips offline; **`npm run verify` GREEN 305+5**, typecheck/build clean). The unmet floor is **substantially a degradation artifact**: of 4 test misses, **1 is a genuine non-convergence** (P-entity-2, clean live redrafts but judge kept flagging → correctly HELD, not sent) and **3 are the Groq-depleted tail** (P-entity-3/P-capability-4/P-specific-4 — judge+domain `FAILED_TO_FALLBACK`; their *drafter* redrafts parsed fine). **NEW STRUCTURAL ROOT CAUSE:** the now-reliable drafter runs MORE live redrafts → MORE Groq judge/domain calls per run → one full 16-item×3-iter run depletes the Groq free-tier DAILY window on the tail (the binding constraint the advisor flagged — Groq window, not the $5 cap). "Fresh calendar day" was necessary but NOT sufficient (preflight showed TPM 7927/8000 at start; the run itself depleted it). **LABELS UNCHANGED — all 3 DEFER, run-independent** (Router ablation `signals_differ:0` again; ledger "1 earned (Drafter) + 3 deferred"). **Per the pre-committed bail rule (advisor): degraded → diagnostic — NOT enshrined as a pass, NOT blind-re-run on the now-depleted window.** Honest record: `docs/a3-7-live-run-status.md` → "RESULTS — SLICE 2 RE-RUN" (full per-item evidence + the 4 owner options for B). New tool: `scripts-ts/groq-preflight.mjs` (window-freshness check). Changed (uncommitted): `lib/data/agent-loop.snapshot.json` (degraded-but-drafter-fixed; self-labeled `degraded`/`_caveat`) + the status doc + this + state docs + the new tool. **OWNER DECISION PENDING (deliverable B; live spend = owner-gated): how to get the clean K — (1) reduce per-run Groq load [smaller set / fewer iters] then fresh-window re-run [cheapest, free]; (2) split across windows; (3) paid Groq tier for one run [consequential → owner+Codex]; (4) accept K as directional + stop.** Owner-gated stops HELD: live spend (slices 2+5, ≤$5), deploy, public posting, git push (no remote), platform-name. Everything below is historical.
    36	
    37	Build update: 2026-06-29 (**ROADMAP SLICE 1 — DRAFTER-RELIABILITY FIX: DONE + FULLY GATED + COMMITTED (push HELD, no remote). gate-2 CLEARED + acceptance-gate SHIP.**) — The final confirming Codex pass RAN on the reset seat (smoke-test `SEAT_OK`; `gpt-5.5`@`xhigh`, read-only, ~223.5k tokens) → **BLOCK on a SINGLE P2, no P0/P1** (honesty-wording: two comments still called the one-call reserve a "true upper bound" — `gemini.ts:179` + `evals/gemini.test.ts:97`) → **ACCEPTED + reworded primary-model-final** (both now say `maxRetries=0` maps ONE reservation to ONE billed SDK attempt; soft-budget/input overflow is bounded by the post-call `budget_overflow` stop — comment/string-only, no behavior change). **Codex CLEAN-confirmed the budget MECHANISM** (verbatim): the overflow stop is correctly placed after spend accrual & before verify/send; worst-case spend is bounded to cap + one-call overflow (no unbounded path); `budget_overflow` fails closed (no verify pass, no `simulate_send`, `assertEligibilityUntouched` protects eligibility); differential lane untouched. **Every Codex finding across all 5 passes (review BLOCK 4 → confirm-1 BLOCK 1 → confirm-2 BLOCK 1+P3 → confirm-3 P2) is reconciled + (load-bearing) red-green-locked.** **GATE:** `npm run verify` exit 0 — **305 passed + 5 skipped**, typecheck/lint/build green; differential **20/20** UNTOUCHED (`git diff --name-only -- lib/core evals/gold lib/data/*.snapshot.json` EMPTY; **7 changed files: 4 product [gemini/draft/budget/orchestrator] + 3 test** + 3 state docs + 2 review docs); RED-GREEN proven for all 7 load-bearing changes. **acceptance-gate = SHIP** (independent subagent: gates 1/2/3/4/5 PASS; it independently confirmed the gate-2 rewordings LANDED — "true upper bound" appears in ZERO lib/evals .ts files — and that the differential lane is untouched; its only BLOCK was this very doc-sync, now done). **HONESTY BOUND (carry to slice 2):** this slice proves the instrumentation + that the fix is WIRED, OFFLINE/$0 — it does NOT prove the live parse-rate recovers; that is the **owner-gated SLICE 2 (R-A3-9) live re-run** (read `finishReason` live — should no longer be "length" — + advisor carry-forward: re-confirm the Drafter still EARNS its label under disabled thinking). **COMMITTED** (owner-authorized per the roadmap directive; re-derive SHA via `git log`); **push HELD (no remote).** Full Codex arc: `docs/reviews/codex-2026-06-29-slice1-drafter-reliability.md`; RED-GREEN: `slice1-drafter-reliability-verify-evidence.log`. **NEXT = STOP + surface SLICE 2 (clean R-A3-9 live re-run) for the owner GO — OWNER-GATED live spend (≤$5 cap).** Owner-gated stops HELD: live spend (slices 2+5), deploy, public posting, git push, platform-name. Everything below is historical.
    38	
    39	Build update: 2026-06-29 (**ROADMAP SLICE 1 — DRAFTER-RELIABILITY FIX WIRED + VERIFY-GREEN (305+5) + RED-GREEN-PROVEN — OFFLINE; the live parse-rate recovery is PENDING the owner-gated slice-2 run, NOT proven here. THREE Codex passes (review BLOCK 4 → confirm-1 BLOCK 1 → confirm-2 BLOCK 1+1P3), each found a DISTINCT real budget-integrity issue, ALL reconciled primary-model-final + red-green-locked; the $5 cap is now an honest FAIL-CLOSED BEST-EFFORT bound (conservative pre-call reserve incl. the documented max thinking budget + a post-call overflow stop), no hard-guarantee overclaim. acceptance-gate BLOCKED only on gate-2 (needs a CLEAN cross-model verdict; same-family judge can't self-clear). A 4th (final) confirming pass was SEAT USAGE-LIMITED (reset 06:03) but, before the limit, flagged 3 residual "true upper bound/guarantee" comments I'd missed → FIXED (grep-clean; verify still 305+5). **gate-2 NAMED-OPEN (dated obligation, seat reset 06:03); slice HELD uncommitted per the acceptance-gate ruling (no "expected SHIP" substitute). NEXT (fresh session ≥06:03; paste-ready resume prompt in HANDOFF) = run ONE final confirming Codex pass → on SHIP, acceptance-gate re-stamp → COMMIT (push HELD) → surface SLICE 2 (R-A3-9, OWNER-GATED live spend). Owner cost-note: 4 Codex passes (~1M seat tokens) on budget-rigor that's largely a slice-2 concern; option to batch the final pass with slice 2.**) — First slice of the owner-scoped remaining-roadmap run (autopilot, owner-gates held). **The A3-7 finding fixed:** the live Gemini 2.5 Flash redraft failed to parse ~75% (`NoObjectGeneratedError` "could not parse the response"). **RULES §6 freshness (2026-06-28/29) confirmed the root cause from 2 independent sources** (ha-llmvision#609, vercel/ai#14377): gemini-2.5-flash THINKS by default and thinking tokens bill against `maxOutputTokens` → a 2000 ceiling truncated the JSON → parse failure (finishReason "length" = MAX_TOKENS). **(a) INSTRUMENT (provable at the live re-run):** the SDK error carries `finishReason` TOP-LEVEL (verified vs installed `ai` typings + constructed live), but `usageFromError` read only `err.usage` → finishReason was SILENTLY DROPPED on exactly the failure path. Fixed `usageFromError` to merge it; threaded onto `DraftResult.usage` → the draft/redraft trajectory `verdictSummary` (`; finishReason=length`). **(b) FIX:** disabled thinking for the bounded structured draft (`thinkingConfig.thinkingBudget=0`, `includeThoughts=false` via a pure `liveGenerationOptions()` builder — confirmed forwarded in `@ai-sdk/google` v2.0.76 dist:1042) + raised `MAX_LIVE_OUTPUT_TOKENS` 2000→4096 as insurance for the reported "ignores thinkingBudget=0" case (cost negligible — the cap only sizes the pre-call ESTIMATE upper bound; a full R-A3-9 run stays ≪ $5). **{{MERCHANT}} fidelity NOT implicated** by the truncation root cause (the injection-cut already guards it) — no change, anti-bloat. **GATE:** `npm run verify` **exit 0 — 303 passed + 5 skipped** (+6: 2 thinking-disable wiring + 1 finishReason capture + 1 trajectory threading + maxRetries=0 + reasoning-pricing), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+snapshots UNTOUCHED — `git diff --name-only` clean; 6 files: 3 product + 3 test). **RED-GREEN proven for all 5 load-bearing changes** (`docs/reviews/slice1-drafter-reliability-verify-evidence.log`). **HONESTY BOUND: this slice proves the instrumentation + that the fix is WIRED, OFFLINE/$0 — it does NOT prove the live parse-rate recovers; that is the owner-gated slice-2 re-run** (advisor carry-forward: re-confirm the Drafter still EARNS its label under disabled thinking). **Codex changed-files review RAN → BLOCK (2 P1 budget-integrity [SDK retries broke the pre-call $5 bound → `maxRetries:0`; reasoning/thinking tokens unpriced → price `output+reasoning`] + 1 P2 honesty-wording + 1 P3 test-lock) → ALL reconciled primary-model-final, the two P1s red-green-locked** (`docs/reviews/codex-2026-06-29-slice1-drafter-reliability.md`); the two P1s were real budget bugs a green CI can't catch — the gate earning its keep. Owner-gated stops unchanged: live spend (slices 2+5, ≤$5), deploy, public posting, git push (no remote). Everything below is historical.
    40	
    41	Build update: 2026-06-28 (**A3-7 LIVE CROSS-FAMILY RUN EXECUTED — TWO deliverables, OPPOSITE outcomes. #1 DECIDE THE 3 LABELS → ✅ DONE + CLEAN (all DEFER, run-independent; Codex-confirmed direction). #2 K RE-PIN / CONVERGENCE PROOF (R-A3-9) → ⚠️ INCOMPLETE (provider-degraded; K vacuous; authoritative run deferred). The owner-authorized live run is DONE (3 runs total, ~$0.046 Gemini spend, « the $5 cap). `verify` GREEN 297+5 + build; differential 20/20 UNTOUCHED. Codex changed-files review BLOCK (1 P1 + 3 P2) → reconciled → CONFIRMING pass on the FINAL diff BLOCK (2 P2, no P0/P1; F1–F4 confirmed clean) → both reconciled (snapshot `_caveat`/`interpretation` + the "fails-to-parse" headline fix) → **Codex gate DISCHARGED** (labels CONFIRMED all DEFER, both rounds). acceptance-gate **SHIP 5/5** (independent subagent; BLOCK on 2 process gates [Codex-currency + verify-evidence] → RE-JUDGED with the evidence → SHIP; it file-verified the snapshot `_caveat`, the headline fix, the Codex round-2 record). COMMITTED (owner-authorized via the RESUME DIRECTIVE; re-derive SHA via `git log`); PUSH HELD (no remote).**) — Ran the integrated loop LIVE: **Gemini 2.5 Flash drafter ⊥ Groq `openai/gpt-oss-120b` critics** (faithfulness + domain), cross-family ENFORCED + asserted per item. **RULES §6 freshness re-anchored 2026-06-28**: `gemini-2.5-flash` available, $0.30/$2.50 per M confirmed (matches the pinned table; shutdown 2026-10-16 = upgrade trigger). **DELIVERABLE #1 — LABELS (the clean win, run-independent):** (1) **Strategist DEFER by construction** — its `strategy`/`tone`/`rationale` are recorded but NEVER reach the Drafter prompt (`orchestrator.ts` passes only the Router `instruction`; `draft.ts buildPrompt` never sees them) ⇒ cannot affect a draft ⇒ cannot earn (§11.2 "Strategist→Drafter strategy/tone" data-contract is a spec-vs-impl GAP — FLAGGED to owner, NOT fixed in A3-7). (2) **Domain Critic DEFER** — policy-capped by R-A3-8 (loop-run evidence cannot upgrade the "directional" label). (3) **Router DEFER** — the ablation's **`signals_differ=0` held in BOTH runs** (run#1 23/23, run#3 21/21 live comparisons — all structurally identical to `strongReflection`) + the finite-axis argument (the failed first conjunct of the pre-registered earn criterion alone suffices to defer). **Realized ledger: "1 earned (Drafter) + 3 deferred"** — Codex independently CONFIRMED all three DEFER; offline labeling needs no change. **DELIVERABLE #2 — K/CONVERGENCE (INCOMPLETE; do NOT report as "floor met"):** run #3's `test_meets_floor:true` (exit-0/green) is **VACUOUS** — the corrected metric (final-redraft, Codex P1) + the degradation collapsed tune to 1/7 → **K = floor(0.143×9) = 1**, so "1/9 ≥ 1" is an EMPTY floor. **Dominant finding — the live Gemini redraft is UNRELIABLE (~75%), INDEPENDENT of any Groq depletion:** **12/16 redrafts failed** with `"No object generated: could not parse the response"` (structured-output parse failure), hitting items 1/2/3 at iter-1 WHILE Groq was healthy (`domainMode:LIVE_JUDGE`) — a **drafter** problem, not the Groq tail. Only 3/16 had a live FINAL redraft; genuine live self-correction ~2/16 = "the loop under a drafter that fails to parse ~75% of redrafts," NOT the loop's ceiling. **Hypothesis (TO VERIFY):** `MAX_LIVE_OUTPUT_TOKENS=2000` (`gemini.ts:108`) on the THINKING model `gemini-2.5-flash` → reasoning exhausts the cap before the JSON → truncation (verify `finishReason==="length"`; not snapshot-captured this run). **Separate effect:** Groq-window depletion on the FINAL 4 test items (judge+domain both fell back → detection 11/16; 1 other miss = a genuine judge miss). **Safety HELD:** parse-failed redrafts fell back to the clean deterministic stub; non-converging items HELD (`drafted`, never improperly sent); `assertEligibilityUntouched` never threw. **3 runs:** #1 clean-Groq but pre-fix `.some()` metric (overcounted 9/16); #2 failed on an over-strict per-item assert (gate-blocked final → `domain===null`; fixed); #3 corrected metric + instrumentation but provider-degraded (the committed frozen evidence, labeled a DEGRADED DIAGNOSTIC). **Records:** `docs/a3-7-live-run-status.md` (freshness + PRE-REGISTRATION + SUPERSEDED run#1 + AUTHORITATIVE run#3 sections) + `docs/reviews/codex-2026-06-28-a3-7-live-run.md`; frozen `lib/data/agent-loop.snapshot.json` (run #3; overwrote the A2 same-family snapshot, preserved in git `7d3d8b5`; the served public fixture is built INDEPENDENTLY by `snapshot.ts` at $0 — public surface untouched). **NEXT (SEQUENCED): (1) FIRST a drafter-reliability fix slice** (raise `MAX_LIVE_OUTPUT_TOKENS` / configure the thinking budget for structured output + verify `finishReason`; harden `{{MERCHANT}}` fidelity) — its own gated slice, NOT A3-7; **(2) THEN a clean R-A3-9 re-run on a fresh Groq window** (a re-run alone reproduces the parse failures); **(3) Codex confirming pass on the final A3-7 diff + acceptance-gate → commit (push HELD).** Owner-gated stops unchanged: `git push` (HELD), deploy, public posting, spend > $5. Everything below is historical.
    42	
    43	Build update: 2026-06-28 (**A3-4/A3-5/A3-6 CODEX GATE FULLY DISCHARGED — the three batched dated obligations ran on the reset seat → SHIP; the A3-1..A3-6 OFFLINE MULTI-AGENT BUILD IS NOW FULLY GATED. `verify` green 297+5 + build; differential 20/20 UNTOUCHED. Committed (owner-authorized via the RESUME DIRECTIVE; re-derive SHA via `git log`); push HELD. NEXT = A3-7 (OWNER-GATED live run).**) — The Codex seat reset (smoke-test `SEAT_OK` 19:32 ET). The batched read-only review (`gpt-5.5` @ `xhigh`) over `d60f66e`/`46f9a2b`/`b2852d9` returned **A3-4 SHIP** (round-3 clean), **A3-5 SHIP + 1 P2**, **A3-6 BLOCK + 1 P1 + 1 P3**; differential lane confirmed untouched. **Reconciled primary-model-final — ALL THREE ACCEPTED + FIXED:** **(P1/A3-6)** the cross-family `fullyInjectedDI` exemption omitted the A3-6 live-capable Strategist (`recommend`) + Router (`reflect`) seams, so a forced `live:true` non-cross-family run with the 3 old DI hooks could make a REAL Groq Strategist/Router call — the IDENTICAL bug class A3-4 round-2 closed, re-opened by the A3-6 wiring (the gate earning its keep); **fixed** to require ALL FIVE live-capable seams injected, **RED-GREEN proven** (revert→the regression case attempts the real call to `FAILED_TO_FALLBACK` + FAILS; restore→green). **(P2/A3-5)** the Router prompt "no injection surface" overclaim — the unsupported-claim texts could echo the raw merchant_name; **fixed** with the `{{MERCHANT}}` injection-cut (`redactMerchantName`, the same cut the Drafter uses) + an adversarial-name regression. **(P3/A3-6)** stale `defaultReflect`/A2-default comments (incl. the `AgentLoopOptions` field docs the confirming pass caught) → updated to the A3-6 defaults (`strategistRecommend`/`routerReflect`, offline `strongRecommend`/`strongReflection`; `buildReflection` only the eval RED baseline). **Two confirming Codex re-passes: P1+P2 confirmed resolved → 1 residual P3 caught → fixed → final VERDICT SHIP.** **The A3-4 + A3-5 + A3-6 acceptance-gates flip to SHIP 5/5 (gate-2 cleared); the offline build is FULLY GATED.** `npm run verify` exit 0 — **297 passed + 5 skipped** (+1 = the P2 test) + build green; differential lane CLEAN (only `orchestrator.ts`/`router.ts` + the 2 test files changed; `lib/core`+oracle+gold+snapshots UNTOUCHED). Records: `docs/reviews/codex-2026-06-28-a3-batch-confirm.md` + `a3-batch-reconcile-evidence.log`; the 3 gate docs flipped SHIP 5/5; the 3 review docs stamped DISCHARGED. **NEXT = A3-7 — OWNER-GATED (the ONLY remaining A3 work + the only place the 3 deferred labels [Strategist · Domain Critic · Router] are decidable): the live cross-family Gemini run (flip `ENABLE_LIVE_AI=true` + $5 cap + a live Gemini model-id/pricing freshness check per RULES §6 + a Codex cross-check; re-pin K on a fresh held-out split, R-A3-9). Autopilot STOPS here — live spend.** Owner-gated stops unchanged: `git push` (HELD — no remote), deploy, public posting, spend > $5. Everything below is historical.
    44	
    45	Build update: 2026-06-28 (**A3-6 BUILT + TEST-VERIFIED (gate-2 Codex NAMED-OPEN) — THE TERMINAL OFFLINE SLICE; the integrated multi-agent orchestrator is wired and the A3-1..A3-6 offline build is COMPLETE. `verify:full` green (296+5 + 4 e2e); acceptance-gate gates 1/3/4/5 PASS (no independent P0/P1), gate-2 named-open → flips SHIP 5/5 when the batched Codex returns (seat-blocked ~7:25 PM = DATED OBLIGATION, now BATCHED AS THE 3RD OF THREE: A3-4 round-3 + A3-5 + A3-6). UNCOMMITTED at this line; commit owner-authorized via the RESUME DIRECTIVE + the `/autopilot` directive; PUSH HELD. NEXT = A3-7 (OWNER-GATED live run) — autopilot STOPS here.**) — Wired the integrated multi-agent loop as the orchestrator DEFAULT (A3-6 is WIRING, not new modules — the four agents were built in A3-2/A3-4/A3-5; the Drafter became Gemini at A3-3). `lib/agents/loop/orchestrator.ts`: the `recommend` default is now **`strategistRecommend`** (was `defaultRecommend`) and the `reflect` default is now **`routerReflect`** (was the A3-5 interim `defaultReflect`, **removed as dead code**) — same pattern as the A3-3 Gemini Drafter default: OFFLINE (live off, no DI) each branches to its STRONG DETERMINISTIC baseline (`strongRecommend`/`strongReflection`, $0 — a genuine upgrade over the naive A2 stand-ins); LIVE each hits Groq behind the A3-7 cross-family gate. `defaultRecommend` + `buildReflection` stay exported (still load-bearing as the Strategist/Router evals' RED baselines). `lib/agents/loop/trajectory.ts`: `A2_HONESTY_NOTE` rewritten for the integrated system with the **honest label framing — "1 earned (Drafter) + 3 deterministic-tied components wired through the agent seams, NOT 'four agents reasoning'"** (the deferred agents decidable only at the owner-gated A3-7 live run). `lib/agents/loop/snapshot.ts`: the $0 SCRIPTED fixture note reframed (the Strategist plan / Router reflect / Domain critic shown are their deterministic baselines; the LLM agents + the live cross-family trajectory frozen at A3-7). **INTEGRATION PROVEN BY CONTENT, not assumed** (`evals/agent-loop.test.ts` +1): with NO recommend/reflect injected (the integrated defaults run), the plan rationale carries `risk=`/`tenure=` (strongRecommend — the naive `defaultRecommend` emits only the root-cause string) AND the reflect instruction surfaces `no_over_promise` (strongReflection reading the domain critic — domain-blind `buildReflection` structurally CANNOT), at `costUsd===0`; **executed red-green captured** (revert the defaults to the naive A2 stand-ins → the test FAILS `expected 'Made progress then went inactive…' to match /risk=/`; restore → 3 passed; raw in `docs/reviews/a3-6-verify-evidence.log`). **TOOL-UNTIL-EARNED holds end-to-end** (wiring the agents as defaults flipped NO trajectory label — strategist/router/domain_critic stay ABSENT; only the Drafter earns). **REALIZED EARNED-AGENT LEDGER (all four agents BUILT + integrated): Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router DEFERRED = "1 earned (generation, not a finite axis) + 3 deferred (classify/decide, each tying its strong deterministic counterpart on the finite structural axis)".** **GATE:** `npm run verify` **exit 0 — 296 passed + 5 skipped** (+1 over A3-5: the integration proof) + **`test:e2e` 4 passed** (`verify:full` green), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+snapshots UNTOUCHED — `git diff --name-only` confirms; 4 modified files + 2 review docs + 1 evidence log); no runtime import cycle (orchestrator imports strategist/router VALUES while they import orchestrator TYPES only — erased at runtime). **Codex changed-files review SEAT-BLOCKED** (usage limit, raw error ~7:25 PM, NO retry per doctrine) → **proceeding TEST-VERIFIED** (per the autopilot doctrine: Codex-down ≠ gate-waived — reversible internal work proceeds, irreversible held) with the **Codex review as a DATED OBLIGATION batched as the 3rd of three** (A3-4 round-3 + A3-5 + A3-6) before any irreversible step (`docs/reviews/codex-2026-06-28-a3-6-integrated-loop.md`). **acceptance-gate = BLOCK (independent subagent, fresh context but SAME model family — so gate-2 cross-model independence is precisely what's missing; gates 1/3/4/5 PASS — grill, verify [with executed red-green], enterprise+taste full, anti-slop; NO independent P0/P1; the "integrated system vs relabeled pipeline?" honesty crux resolves CLEANLY — offline it is a deterministic pipeline with multi-agent SEAMS + one generative slot [Drafter], the labels say exactly that, and ZERO `app/` surface overclaims [grep clean; fixture not rendered; A3-6 touched no app/ files]; flips SHIP 5/5 when the batched Codex returns)** (`docs/reviews/gate-2026-06-28-a3-6.md`). **NEXT = A3-7 — OWNER-GATED (the ONLY place the 3 deferred labels are decidable): the live cross-family Gemini run (key + $5 cap + live Gemini model-id/pricing freshness per RULES §6 + Codex; re-pin K on a fresh held-out split, R-A3-9). AUTOPILOT STOPS HERE — A3-7 is live spend.** Owner-gated stops unchanged: `git push` (HELD — no remote), deploy, public posting, spend > $5. Everything below is historical.
    46	
    47	Build update: 2026-06-28 (**A3-5 BUILT + TEST-VERIFIED (gate-2 Codex NAMED-OPEN) — the Router/Conductor agent, the 4th + final named agent; `verify` green 295+5; acceptance-gate gates 1/3/4/5 PASS, gate-2 named-open → flips SHIP 5/5 when the Codex re-confirm returns (SEAT-BLOCKED ~7:25 PM = DATED OBLIGATION batched with A3-4 round-3). UNCOMMITTED at this line; commit owner-authorized via the RESUME DIRECTIVE; PUSH HELD. NEXT = A3-6.**) — Built the Router/Conductor as the multi-critic revision-synthesis seam. `lib/agents/router.ts` = **`strongReflection`** (the STRONG deterministic multi-critic baseline + demotion fallback — reads BOTH critics, prioritizes the faithfulness failure [GATING] then surfaces the advisory domain dimensions in the same revision; a strict SUPERSET of the domain-blind `buildReflection`) + **`routerReflect`** (the LLM Router on Groq `gpt-oss-120b`, DI/mock, $0 default, **recommend-only** — `route` CLAMPED via `clampRouteToEnvelope` and never trusted; honest `FAILED_TO_FALLBACK`; the prompt withholds the raw merchant_name = no injection surface; `signals` recomputed STRUCTURALLY from inputs, never the model's word) + `criticSignals` (the structural coverage discriminator). `lib/agents/loop/orchestrator.ts` = a **`reflect?: RouterFn` seam** (default = the domain-blind `defaultReflect` — **NO loop behavior change this slice**; the strong baseline / LLM wire in as the default at A3-6) + `RevisionPlan`/`RouterFn`/`CriticSignal` types + `buildReflection` exported as the eval's RED baseline; the reflect step gets a **defensive merchant clone** (isolation, mirroring the recommend clone) and RECORDS `plan.route`/`holdForHuman` ADVISORY (recommend-only — RECORDED in the trajectory, NEVER wired to the send). **RECOMMEND-ONLY enforced two independent ways** (acceptance-gate traced both against source): the route clamp (can only ADD caution) + the post-loop isolation (the send flows ONLY through `simulate_send`; `assertEligibilityUntouched` hard-throws on any eligibility move) — **clone red-green PROVEN** (drop the reflect `{ ...merchant }` clone ⇒ the mutation-isolation test trips `R-LOOP-1b violation: … mutated … "review_required"`; restore ⇒ GREEN; raw in `docs/reviews/a3-5-verify-evidence.log`). **ANTI-THEATER EVAL (`evals/router.test.ts`, R-A3-1 — floor-not-ceiling, exactly like the Strategist A3-2 + Domain Critic A3-4):** RED `buildReflection` (domain-blind — its signature has no domain parameter) misses `domain_defective` on a multi-failure case → GREEN `strongReflection` (reads both critics) covers it as a **strict SUPERSET** (non-vacuous: the faithfulness text is byte-identical, the domain addendum is appended) → DEFER the mock Router TIES `strongReflection` on the structural axis → the **`router` label DEFERS** (the reflect step stays `"tool"`; `router` ABSENT from the trajectory, tests assert it). **THE DEFER IS STRUCTURALLY FORCED** (advisor 2026-06-28; stated verbatim in the code + eval + gate record to pre-empt the Codex "why didn't the crux agent earn?" probe): every discriminator available OFFLINE — domain coverage / which-fix-first / route — is a finite/structural axis a deterministic table reproduces BY CONSTRUCTION, so the LLM can only TIE; an LLM earns ONLY on an open-ended-quality axis scored by an INDEPENDENT CROSS-FAMILY judge — for a Groq Router that judge is Gemini ⇒ LIVE ⇒ owner-gated A3-7. So offline the Router CANNOT earn no matter how good — the anti-theater bar working as DESIGNED (AM-7), not under-delivery. **REALIZED EARNED-AGENT LEDGER (all four agents now BUILT): Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router DEFERRED = "1 earned (generation, not a finite axis) + 3 deferred (classify/decide, each tying its strong deterministic counterpart)".** **GATE:** `npm run verify` **exit 0 — 295 passed + 5 skipped** (+10 over A3-4: 8 router anti-theater + 2 agent-loop firewall/isolation), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+snapshots UNTOUCHED — `git diff --name-only` confirms; 2 modified + 2 new + 2 review docs + 1 evidence log). **Codex changed-files review SEAT-BLOCKED** (usage limit, raw error surfaced ~7:25 PM, NO retry per doctrine) → **proceeding TEST-VERIFIED** (the clone red-green + the anti-theater RED-GREEN encode the load-bearing logic) with the **Codex review as a DATED OBLIGATION batched with the A3-4 round-3 re-confirm before any irreversible step** (`docs/reviews/codex-2026-06-28-a3-5-router.md`). **acceptance-gate = BLOCK (independent subagent, fresh context; gates 1/4/5 PASS — grill self-satisfied, enterprise+taste full PASS, anti-slop PASS; gate-3 PASS on the raw evidence now captured in `a3-5-verify-evidence.log`; gate-2 NAMED-OPEN — the mandatory cross-model review is seat-blocked, not waivable; NO substantive P0/P1; flips SHIP 5/5 when the batched Codex returns clean)** (`docs/reviews/gate-2026-06-28-a3-5.md`). **NEXT = A3-6** (the full multi-agent orchestrator wired — Strategist + Gemini Drafter + Domain Critic + Router all as the loop defaults — + a $0 agent-attributed trajectory fixture + `verify:full`) **after the batched Codex re-confirm**. Owner-gated stops unchanged: `git push` (HELD — no remote), deploy, public posting, spend > $5; A3-7 live Gemini run owner-gated. Everything below is historical.
    48	
    49	Build update: 2026-06-28 (**A3-4 BUILT + COMMITTED TEST-VERIFIED (gate-2 Codex NAMED-OPEN) — Domain Critic wired into the loop's VERIFY phase as the 2nd critic; `verify` green 285+5; Codex round-1 BLOCK→6 reconciled, round-2 found 1 residual P1 (partial-DI) → patched + regression, round-3 re-confirm SEAT-BLOCKED (usage limit ~7:25 PM) = DATED OBLIGATION; acceptance-gate gates 1/3/4/5 PASS, gate-2 named-open → flips SHIP 5/5 when round-3 returns. PUSH HELD (no remote). NEXT = A3-5 (after the Codex round-3 re-confirm).**) — Wired the EXISTING calibrated domain-quality judge (`lib/agents/domain-judge.ts judgeDomain`, unchanged from B1/B2) into the agent loop's VERIFY phase as the 2nd critic: **ADVISORY** (never gates `verifyPassed`/eligibility/the send — red-green proven: making the send depend on `domain_defective` turns the advisory test RED, restore GREEN), **INDEPENDENT** (formed without the faithfulness verdict; `judgeDomain` has no faithfulness input + `domainSituation` withholds `diagnose().play`, R-A3-4), gatekeeper-gated (runs only on a gate-approved draft, R-DARCH-4), recorded as a 2nd verify-phase trajectory step + a `"domain"` audit actor + `finalVerify.domain`. **CROSS-FAMILY enforced by construction** (the recurring A3-3 P1 on a NEW judge): the loop `live` gate + the A3-7 harness require `resolvedDomainJudgeProvider()==="groq"` (a SEPARATE env from the faithfulness judge), the harness asserts `domain.provider==="groq"` per item, and a forced `live:true` that isn't FULLY-DI'd-or-cross-family-ready **THROWS** (so `DOMAIN_JUDGE_PROVIDER=gemini` can't run a same-family domain critic under a cross-family banner — red-green proven: `||`→partial-DI attempts a real Gemini call; `&&`→throws). **ANTI-THEATER EVAL (`evals/domain-critic-antitheater.test.ts`, the R-A3-1 gate):** the LIVE Groq domain judge (B1-frozen held-out metrics) is compared to its deterministic counterpart `mockDomainJudge` on the same held-out split → they **TIE** (both aggregate F1 = 1.00) → the eval is a NECESSARY FLOOR (it fails a critic WORSE than the baseline), **NOT a label-earning ceiling** → the **`domain_critic` label DEFERS** (the loop's domain step stays `"tool"`, exactly like the Strategist's A3-2 defer). **Honest earned-agent ledger after A3-4: Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router pending A3-5** — the anti-theater discipline refusing to dress deterministic tools as agents (the discriminating evidence likely needs live Gemini prose at A3-7 or harder cases). **GATE:** `npm run verify` **exit 0 — 285 passed + 5 skipped** (+6 over A3-3: 3 anti-theater + 1 advisory/independence + 2 regressions), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+snapshots UNTOUCHED; 5 files + 2 new docs/eval). **Codex changed-files review → round-1 BLOCK (6: 1 P1 cross-family-bypass-on-forced-live + 2 P2 [stale `lastDomain` · plan claimed DONE] + 3 P3) → ALL reconciled primary-model-final; round-2 confirming → 1 RESIDUAL P1 (the `||` partial-DI exemption hole) → patched to `&&` fully-injected-DI + a 3-case regression encoding Codex's exact case; round-3 re-confirm SEAT-BLOCKED** (Codex usage limit, raw error surfaced ~7:25 PM, NO retry per doctrine) → **proceeding TEST-VERIFIED** (the regression encodes Codex's exact finding) with the **round-3 Codex re-confirm as a DATED OBLIGATION before any irreversible step** (`docs/reviews/codex-2026-06-28-a3-4-domain-critic.md`). **acceptance-gate = BLOCK (gates 1/3/4/5 PASS; gate-2 NAMED-OPEN — the load-bearing partial-DI fix is unreviewed by Codex, and round-1 Codex MISSED the P1 round-2 caught, so the cross-model judge must see the round-2 fix before stamping; flips SHIP 5/5 when round-3 returns SHIP)** (`docs/reviews/gate-2026-06-28-a3-4.md`); the gate explicitly stated this does NOT undo the RESUME-DIRECTIVE-authorized commit. **NEXT = A3-5** (Router/Conductor agent — LLM reflection/route synthesis + anti-theater eval vs `buildReflection`; R-A3-1) **after the Codex round-3 re-confirm**. Owner-gated stops unchanged: `git push` (HELD — no remote), deploy, public posting, spend > $5; A3-7 live Gemini run owner-gated. Everything below is historical.
    50	
    51	Build update: 2026-06-28 (**A3-3 DONE + FULLY GATED — Drafter→Gemini cross-family OFFLINE machinery + §4.2 prevention; `verify` green 279+5; Codex BLOCK→6 reconciled primary-model-final→confirming SHIP (gate FULLY DISCHARGED); acceptance-gate 5/5 SHIP. Commit owner-authorized via the RESUME DIRECTIVE; PUSH HELD (no remote). NEXT = A3-4.**) — Swapped the single-agent loop's Drafter from same-family Groq (`draftOutreachGroq`) to **cross-family Gemini** (`lib/agents/draft.ts draftOutreach`), restoring model-layer maker≠judge (R-A3-2/R-ARCH-3: Gemini drafts ⊥ the Groq reverse-faithfulness judge). The cross-family invariant is **enforced by construction, not just commented** — the loop's `live` gate + the A3-7 live harness require `liveAiEnabled() && groqLiveEnabled() && resolvedJudgeProvider()==="groq"`, and the harness asserts `judge.provider==="groq"` per item (so a `JUDGE_PROVIDER=gemini` config can't run Gemini-drafts-Gemini-judges under a cross-family banner — it opts out). The now-**metered** Gemini drafter is cost-honest: a **cloned cumulative $5 ledger** that accrues drafter + judge spend across re-drafts; `UNKNOWN_USAGE` fails closed to the conservative estimate (never $0) — **red-green proven** (disable the loop's estimate-reservation ⇒ the UNKNOWN_USAGE test goes RED `expected +0 to be close to 0.0056`; restore ⇒ GREEN). **KB §4.2 over-promise-prevention** is wired into the shared Drafter prompt as a static, merchant-independent `DOMAIN_HONESTY_RULES` block that **never enters the per-merchant `facts`** (RAG off the factual path — R-A3-5); shared `withRevision` moved into `draft.ts` (R-LOOP-7). Honest live-gate default (no half-live state); offline DI fixtures inject usage `{0,0}` (genuine no-call $0); the A2 live Groq test was repurposed into the **A3-7 cross-family harness skeleton** (auto-skips offline; PLACEHOLDER P3 split, fresh Gemini-sized split + K re-pin deferred to A3-7, R-A3-9). R-A3-8 note added to `docs/{judge,domain}-calibration-status.md` (the judges' directional label is NOT upgraded by running inside the loop). **GATE:** `npm run verify` **exit 0 — 279 passed + 5 skipped** (+2 cost-integrity), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+frozen snapshots UNTOUCHED; `git diff --stat` 9 files / 284+ 111-). **Codex changed-files review → BLOCK (6: 2 P1 + 2 P2 + 2 P3) → ALL reconciled primary-model-final + re-verified → confirming re-pass SHIP** (`docs/reviews/codex-2026-06-28-a3-3-drafter-gemini.md`); the 2 P1s (cross-family-judge config hole + a vacuous live-harness ledger from the budget clone) were exactly the integrity bugs a green CI can't catch — the gate earned its keep. **acceptance-gate = BLOCK (substance SOUND; missing evidence + 1 record-honesty defect — an overclaimed unreceived "SHIP" in the review header, fixed) → all 3 flip conditions discharged → re-stamp SHIP, 5/5 gates** (`docs/reviews/gate-2026-06-28-a3-3.md`). **NEXT = A3-4** (Domain Critic as the 2nd VERIFY-phase critic — Groq, advisory, independent, withholds `diagnose().play`; R-A3-4). Owner-gated stops unchanged: `git push` (HELD — no remote), deploy, public posting, spend > $5; A3-7 live Gemini run owner-gated. Everything below is historical.
    52	
    53	Build update: 2026-06-28 (**A3-2a DONE + FULLY GATED + COMMITTED `32da7b1` — Strategist agent (Groq) + its anti-theater eval; `verify` green 277+4; Codex BLOCK→4 reconciled primary-model-final + test-locked → confirming re-pass SHIP (gate FULLY DISCHARGED). ⚠️ PUSH HELD (no git remote; owner action). A3-2b ✅ — the live $0 Groq confirmatory eval CLEARED the pre-registered anti-theater floor (Low→standard 4/4, High→elevated 4/4, all LIVE_AI, $0); verdict = viable candidate, `strategist` label DEFERS to A3-3, count stays "3 + a candidate" (`docs/strategist-confirmatory-status.md` + `lib/data/strategist-confirmatory.snapshot.json`); Codex methodology review BLOCK→2 reconciled primary-model-final + test-verified (P1 cost-honesty "$0"→"free-tier, not metered" + RULES §6 freshness; P3 comment; `docs/reviews/codex-2026-06-28-a3-2b-strategist-live.md`). NEXT = A3-3.**) — Built the Strategist seam offline-first: `lib/agents/strategist.ts` = `strongRecommend` (the HONEST anti-theater BASELINE — reads risk_level/tenure/engagement, the factors `diagnose().play` provably ignores) + envelope helpers `allowedRoute`/`clampRouteToEnvelope` + the LLM `strategistRecommend` (Groq `gpt-oss-120b`, DI `generate`, `StrategistOutputSchema`, default-stub=`strongRecommend` $0, honest `FAILED_TO_FALLBACK`, **LLM route clamped — never trusted**, prompt withholds the raw merchant_name = no injection surface). `lib/agents/loop/orchestrator.ts` = `RecommendFn` sync-or-async + `await recommend({ ...merchant }, …)` (defensive clone = recommend-only by ISOLATION) + honest plan-step `modelMode`; **plan-step `agent` STAYS `tool`** (tool-until-earned). `evals/strategist.test.ts` = units + the anti-theater eval with **explicit RED-GREEN** (naive baselines + risk-blind mock FAIL; strong + risk-aware mock PASS). **FLOOR-NOT-CEILING (advisor + Codex):** `caution` is a finite enum a deterministic baseline computes perfectly, so the Strategist can only TIE `strongRecommend` structurally → the A3-2 eval is a NECESSARY anti-theater FLOOR (it FAILS a worse-than-baseline Strategist), NOT a label-earning ceiling → the `strategist` label **DEFERS to the A3-3 cross-family judge**; the "4 agents" claim = "3 + a candidate" pending A3-3. A3-2b is CONFIRMATORY only (does the live LLM match the floor?). **GATE:** `npm run verify` green **277 + 4 skipped** (was 270; +7 regression tests); typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+frozen snapshots UNTOUCHED). **Codex changed-files review RAN → BLOCK (4: 1 P1 `groqLiveEnabled` gate-misroute + 2 P2 [trajectory mode honesty · prompt-wiring regression-lock] + 1 P3 recommend mutation-isolation) → ALL reconciled primary-model-final + fixed + test-locked** (`docs/reviews/codex-2026-06-28-a3-2a-strategist.md`); the F1 fix also corrected the identical latent gate in `lib/agents/groq-draft.ts` (surfaced). **Confirming re-pass on the FIXED diff = SHIP** (all 4 findings confirmed resolved, prior probes hold, differential lane untouched, tool-until-earned intact) → **A3-2a Codex gate FULLY DISCHARGED**. **COMMITTED `32da7b1`** (12 files, explicit paths; tooling excluded). **PUSH BLOCKED — no git remote configured (`git remote -v` empty); owner action to add a target.** Owner-gated stops otherwise unchanged: deploy · public posting · spend > $5. Everything below is historical.
    54	
    55	Build update: 2026-06-27 (**A3-1 DONE — trajectory `agent` attribution (R-A3-6); test-verified + fully gated; COMMITTED `ce21cf8` (push owner-gated). NEXT = A3-2 (Strategist agent + anti-theater seam-eval vs `diagnose().play`; advisor-sharpened design in the HANDOFF top block).**) — First A3 slice: added a new `TrajectoryAgent` type + a **required** `agent` field on `TrajectoryStep` (`lib/agents/loop/trajectory.ts`), attributed every `record()` site (`lib/agents/loop/orchestrator.ts`), and added 2 R-A3-6 tests + a served-snapshot agent-lock (`evals/agent-loop.test.ts`). **Honesty rule = tool-until-earned (AM-2/R-A3-1, advisor-cross-checked): only the genuinely-GENERATED `drafter` is an agent today; plan/verify/reflect/route + the fed-in `seedDraft` fixture = `tool`; `strategist`→A3-2, `domain_critic`→A3-4, `router`→A3-5, each IFF it clears its anti-theater seam-eval. Tests assert those three ABSENT.** **GATE:** `npm run verify` **exit 0 — 257 passed + 4 skipped** (was 255 at B2; +2 R-A3-6 tests), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+frozen snapshots UNTOUCHED — `git diff` is only the 3 code files + state docs). **Codex changed-files review RAN → BLOCK (2 findings, 1 P1 + 1 P2) → BOTH reconciled primary-model-final + fixed + RED-GREEN-locked** (P1: seed branch mislabeled `drafter`→`tool`; P2: added a seeded test that FAILS at `agent-loop.test.ts:365` if the fix is reverted; `docs/reviews/codex-2026-06-27-a3-1-trajectory-agent.md`). **acceptance-gate: gates 1/2/4/5 PASS; gate-3 = SHIP on its own pre-committed flip condition** (raw exit-0 verify + the 2 red-green demos — produced + durable); the gate's formal re-stamp was prevented by the subagent hitting its session limit (reset 7:40 PM ET); SHIP recorded primary-model-final (`docs/reviews/gate-2026-06-27-a3-1.md`). **Recommended (non-blocking) dated obligations before any irreversible step (push / A3-7 live): (a) Codex confirming re-pass on the FIXED diff; (b) optional formal gate re-stamp after 7:40 PM ET.** git: HEAD `50bbfc8`; the 3 code files + state docs UNCOMMITTED; push owner-gated. Everything below is historical.
    56	
    57	Build update: 2026-06-26 (**A3 DESIGN/PLAN PASS DONE — architecture settled + advisor-cross-checked + OWNER-GATED; buildable spec written (`docs/plan-multi-agent-execution.md` §11). NEXT = BUILD A3 offline-first, slice by slice. NO code/product file changed this pass.**) — A3 opened with a design pass, not code (Rule 0). **Owner chose "Target the full 4"** (AskUserQuestion 2026-06-26, decision-log row): Strategist/Planner · Drafter · Domain Critic · Router/Conductor as four LLM agents, **each gated by an anti-theater seam-proof** (a component eval beating its deterministic counterpart — Strategist vs `diagnose().play`, Router vs `buildReflection`; a failing candidate is demoted to a tool/conductor + the "4 agents" claim corrected, AM-2/AM-7). The advisor (stronger-model cross-check) validated the design and sharpened it: the inverse failure — a deterministic conductor in an agent costume — is the credibility risk, so each seam is proof-gated; **both judges stay Groq while the Drafter→Gemini swap restores cross-family R-ARCH-3**; the Domain Critic stays advisory + independent + withholds `diagnose().play` (R-DARCH-2); §4.2 prevention wires into the Drafter prompt (RAG stays off the per-merchant facts); add per-`agent` trajectory attribution now; **HOLD the "calibrated — directional" judge labels** (the judges were calibrated on the synthetic gold set, not yet on live Gemini prose); re-pin K on a fresh held-out split at the live gate. Spec §11 = EARS **R-A3-1..9** + the build DAG **A3-0..8**; A3-0 (design/plan + owner GO) ✅. **NEXT = A3-1** (trajectory `agent` attribution, offline $0) → A3-2 Strategist → A3-3 Drafter→Gemini machinery + §4.2 → A3-4 Domain Critic → A3-5 Router agent → A3-6 orchestrator + $0 trajectory fixture; **A3-1..A3-6 are mock/DI, $0; only A3-7 spends (OWNER-GATED: key + $5 + Gemini freshness + Codex).** Gate each slice: `npm run verify` → Codex changed-files review (`codex-guarded`, reconcile primary-model-final) → `acceptance-gate` SHIP; record in `docs/reviews/`. `lib/core` + oracle + gold + frozen snapshots stay UNTOUCHED (differential 20/20). git: HEAD `50bbfc8`, tree clean but for untracked tooling; push owner-gated. Everything below is historical.
    58	
    59	Build update: 2026-06-26 (**B2 COMPLETE — the mandatory Codex changed-files review + §4.2 cross-check RAN on the reset seat → VERDICT SHIP; the B2 ship-gate is FULLY DISCHARGED. NEXT = A3.**) — The OPEN dated obligation from the entry below is discharged. The COMPLETE read-only Codex review (`gpt-5.5` @ `xhigh`, full run ~212.5k tokens, NOT seat-limited) returned **SHIP** with all **4 targets CONFIRMED** (advisory invariant = `domainJudge` is a structurally-inert leaf, `outreachStatus = m.outreach_status` — confirmed to protect the FUTURE LIVE judge too, not just the mock · the ~75% mock-flag surface reads honestly · audit wording honest · **§4.2 non-redundancy confirmed against the REAL gatekeeper + faithfulness code** — the "mirrors faithfulness" discharge rejected, the seam is real) and **3 findings (1 P2 + 2 P3), ALL accepted + fixed + re-verified primary-model-final**: (F1, P2) the Human-gate copy "Eligible and clean" → "Eligible by the deterministic core" + an advisory note when `domain_defective` (honest + reinforces AM-4 on the public surface); (F2, P3) the audit-wording test now bans all send-gating verbs (`reject|block|gate|hold|prevent`) on flagged entries; (F3, P3) the §4.2 demo test now exercises the wired `mockDomainJudgeResult().verdict`. Codex independently confirmed `AuditEntrySchema` is ENFORCED (not cosmetic, `appendAudit` parses through it) + the section renumber (5→8) is correct, and did NOT push to break the advisory invariant. **`npm run verify` green = 255 + 4 skipped; e2e 4/4** (one first-navigation Playwright flake, clean on re-run — reported honestly). `lib/core` + oracle + gold + frozen calibration snapshot UNTOUCHED (differential 20/20). Records: `docs/reviews/codex-2026-06-26-b2-domain-shipgate.md` (verdict verbatim + reconciliation table) + `docs/reviews/gate-2026-06-26-b2-domain-shipgate.md` flipped to gate-2 CLEARED. Reconciliation fixes committed on top of `6ea0549`; **push owner-gated.** **NEXT = A3** (4 bounded agents — Strategist/Planner · Drafter · Domain Critic · Router; Gemini Flash drafter within the code-enforced $5 cap + cross-family Groq judge; feed KB §4.2 into the Drafter per the §4.2 decision). Owner-gated stops unchanged (deploy · public posting · spend > $5 · git push). Everything below is historical.
    60	
    61	Build update: 2026-06-26 (**B2 — domain judge WIRED into the REPLAY ship-gate as the tertiary ADVISORY control; test-verified + acceptance-gate-reconciled; the mandatory Codex changed-files review + §4.2 cross-check are OPEN (a DATED OBLIGATION, seat usage-limited ~8:31 PM). COMMITTED `6ea0549` (owner GO 2026-06-26); push owner-gated.**) — Wired the calibrated domain judge in as the **tertiary** control (R-DARCH-4: gatekeeper → faithfulness → domain), `$0` deterministic mock in REPLAY, surfaced + audited like the faithfulness `judge` field: `ReplayMerchant.domainJudge: DomainJudgeResult | null` (run via `mockDomainJudgeResult` ONLY when `gatekeeper.approvedForHumanReview`, parallel-gated to faithfulness), a new `"domain"` `AuditEntry` actor (ordered after `judge`, before `eval`), and a Merchant-Detail "5 · Domain quality check" panel (renumbered Eval→6 / Human→7 / Audit→8). **The judge is ADVISORY — it NEVER changes `outreachStatus`/eligibility/the send (those stay the deterministic core's); red-green PROVEN** (a mutation making `outreachStatus` depend on `domain_defective` turns the "is ADVISORY" test RED at `replay.test.ts:79`, restore → GREEN). **§4.2 (owner: keep `no_over_promise` gating) NON-REDUNDANCY DEMONSTRATED** (advisor caught it fired 0/20 → added a test: a grounded draft + implied-typicality hype where the gatekeeper APPROVES + faithfulness PASSES + ONLY `no_over_promise` FAILS — the seam §4.2 closes). 6 files modified (incl. a `lib/agents/tools/schemas.ts` mirror-fix adding `"domain"` to `AuditEntrySchema`, + a `domain-judge.ts` "secondary"→"tertiary" comment reconcile). **`npm run verify` green = 255 + 4 skipped** (was 250); differential **20/20** (`lib/core`+oracle+gold+frozen snapshot UNTOUCHED, confirmed by `git diff --name-only`); e2e 4/4. **`acceptance-gate` = BLOCK (procedural — no hard P0/P1; all 5 invariants honored on its read + advisor agreed) → reconciled:** gate-3 (verify) CLEARED with raw + red-green evidence; its 3 non-blocking items addressed (75%-stub-flag credibility framing · audit wording · secondary→tertiary). **Gate-2 (Codex) OPEN:** the seat smoke-tested ALIVE, the review ran + surfaced **1 real finding** — a false "never auto-sent" panel claim contradicting the advisory design — **fixed + reconciled primary-model-final** — then hit the usage limit mid-review (raw error surfaced; no retry per doctrine). **Until Codex completes, the acceptance-gate verdict remains BLOCK by its own design; a commit = the owner choosing to proceed test-verified with that gate named-open, NOT "gates passed."** Forward decision recorded: the detect-then-send-anyway pattern (15/20 flagged, 3 flagged-yet-sent) is consistent with the advisory design (gatekeeper = firewall; LLM judges advisory-into-the-human-gate), open question tied to the §4.2 forward-decision — *should a calibrated `domain_defective` eventually inform the hold, past the ~100 floor?* Gate record: `docs/reviews/gate-2026-06-26-b2-domain-shipgate.md`. **NEXT = run the COMPLETE Codex changed-files review + §4.2 cross-check on a fresh seat (4 concrete targets in the gate record), reconcile primary-model-final → then A3.** Owner-gated stops unchanged (deploy · public posting · spend > $5 · git push). Everything below is historical.
    62	
    63	Build update: 2026-06-26 (**B1 DONE — LIVE CALIBRATION CLEARED all seven pre-registered thresholds AND the mandatory Codex cross-model gate RAN (gpt-5.5 @ xhigh, full B1 diff → 2 P2 code findings fixed + reconciled + test-locked); label = "calibrated — directional, pending the ~100 floor" (R-DHON-1/3)**) — The live cross-family Groq `openai/gpt-oss-120b` domain judge ran over the 36-item *synthetic* gold set (K=3, temp 0, **$0**, 36/36 LIVE_JUDGE, 0 fallbacks): **held-out recall/precision/F1 1.00** (CI95 [0.76,1.00], n=18: 12 pos / 6 neg), per-dim recall 1.00 each, **κ 1.00, flip 0.00** — CLEARS the pre-registered bar (`docs/domain-calibration-status.md`). **No-answer-leakage VERIFIED** (R-DARCH-2: `domainSituation` withholds `diagnose().play`; rationales reason situation→draft cold + isolate the right dimension; the engagement per-dim precision 0.5 cross-dim bleed is the fingerprint of real reasoning, NOT a wrapper — carried to B2). **Eval-locked** (`evals/domain-calibration.lock.test.ts` vs the frozen snapshot, R-DHON-4; commit `1fcb492`); `verify` green **250 + 4 skipped** (after the Codex-fix lock tests; was 243); `acceptance-gate` engineering = **SHIP**. **Codex gate DONE** (full B1 diff `07e9a55..HEAD`; 2 P2 *code* findings — partial-verdict acceptance + wrong env namespace — both fixed + reconciled primary-model-final + test-locked; 0 P0/P1; `docs/reviews/codex-2026-06-26-b1-domain-judge.md`); the calibration result is provably unchanged (ran via explicit `live:true`/default-groq). **Docs flipped** "directional"→**"calibrated — directional, pending the ~100 floor"** (methodology calibrated; metric directional). **NEXT = B2 + A3.** All gold positives SYNTHETIC (R-DCAL-4); the metric stays directional until the ~100 floor (R-DHON-1). Committed 2026-06-26 (owner GO via "continue"); **push remains owner-gated**. `lib/core`+oracle+gold+frozen-snapshot UNTOUCHED. Everything below is historical.
    64	
    65	Build update: 2026-06-26 (**Track B1 — domain-quality "Effective"-axis judge: OFFLINE MACHINERY DONE + green + acceptance-gate SHIP; live calibration owner-gated (B1d). [SUPERSEDED by the TOP entry — the live run + the Codex gate have since cleared this → "calibrated — directional, pending the ~100 floor"; the following is true only AS OF THIS dated entry:] NOT "B1 done", NOT "calibrated."**) — Built the Effective-axis analogue of the P3 faithfulness judge across 5 committed slices (`db72461` spec+rubric · `4096ebe` judge · `f71c5c9` gold+harness+offline-cal · `2fc1f08` live-runner+pre-registered-bar · `e201eee` honesty-refinements): a **KB-cited rubric** (matched-to-blocker · engagement-appropriate · no-over-promise, from `knowledge/domain/merchant-activation-kb.md` §2.1/§3/§4.2), a **situation-in (not answer-in) judge** (mock + cross-family Groq `gpt-oss-120b` live via DI; the prompt withholds `diagnose().play` — the tautology guard, R-DARCH-2), a 24-positive/12-negative stratified gold set (each positive gate-passing + faithful **by construction** so the catch is a pure domain residual), and a harness that **enforces R-DCAL-1 LIVE per item** (real gatekeeper + faithfulness mock — already caught + fixed one mis-constructed gold item where "once you're live" tripped state_mismatch). `verify` green (236 + 4 skipped); per-dimension metrics; the **pre-registered bar is pinned in `docs/domain-calibration-status.md` BEFORE any number** (R-DCAL-7). **acceptance-gate = SHIP** (offline machinery, framed correctly); **Codex changed-files review SEAT-BLOCKED** (usage limit, raw-surfaced, reset ~3:27 PM) → **dated obligation that converges with the B1d Codex gate** (`docs/reviews/gate-2026-06-26-b1-offline.md`). The live Groq calibration run (fresh window, $0) + eval-lock + the Codex gate are **owner-gated (B1d)**; no "built + calibrated, metrics=X" claim ships before the bar clears (R-DHON-3). `lib/core`+oracle+gold UNTOUCHED. Everything below is the A2 GO + prior product.
    66	
    67	Build update: 2026-06-26 (**A2 GO ✅ — the early go/no-go is CLEARED; committed scope expanded to the full roadmap; Track B in flight**) — The single-agent verify-and-self-correct loop SHIPs: recommend-not-decide + fail-closed **red-green proven** (the lock test FAILS without the fix); **8/9 genuine self-corrections** (auditable — `seedCatchLive` + `LIVE_JUDGE` final; $0; 1 miss HELD, never sent); the **5 ship gates discharged** — grill + Codex now **durably recorded in `docs/reviews/`** (the `/tmp`-only recurrence fixed), verify green + red-green, acceptance-gate enterprise+anti-slop PASS. Cross-model gate found + I fixed a real **P1 fail-open safety bug** (a fallback judge could have let an unsupported draft send) — the gate earning its keep. **Owner directed GO + "rest other phases"** → the AM-6 cap is lifted (decision-log 2026-06-26); committed scope = full roadmap. **NEXT: Track B0 (cited domain KB, in flight) → B1 → A3 (Gemini Flash within the $5 cap + cross-family judge) → A4; A5 + Phase 6 stay owner-gated.** Build continuation is manual (owner resumes each session; the auto-resume launcher was removed at owner request 2026-06-26 — it was never installed). Commits `dafb653`/`f521b5c`/`5a1f86a`/`37116f5`/`a97baed`/`7d3d8b5`; verify green (217+3); `lib/core`+oracle+gold UNTOUCHED. Everything below is the A2-scoped execution + Phase 0 + prior product.
    68	
    69	Build update: 2026-06-25 (**AUTOPILOT — A2-SCOPED EXECUTION: P3 + A1 + A2 offline machinery DONE + committed; at the A2 GO/NO-GO batch**) — Owner toggled `/autopilot` + the A2-scoped `/goal` + "full permission … everything." Drove, with full rigor + autonomous per-slice commits: **P3 judge calibration** (`dafb653` — held-out cleared the pre-registered bar [recall 1.0/precision 1.0/κ 0.784/flip 0.071], DIRECTIONAL; an over-strict runner assertion fixed, not the judge; AM-1 satisfied), **A1 tool-ify the core** (`f521b5c` — 7 delegating tool wrappers + a non-vacuous byte-for-byte differential), **A2 single-agent verify-and-self-correct loop — OFFLINE MACHINERY** (`5a1f86a` — recommend-not-decide STRUCTURALLY enforced + R-LOOP-8b test-locked; non-vacuous R-LOOP-8 [injected verdicts]; dedicated trajectory + `$0` freeze; `ai` SDK, no LangGraph; R-LOOP-5 same-family caveat stamped). Stack doctrine relaxed to **best-fit, cost-aware** (`e260c15`). **Codex seat hit its usage limit on the A1 review (~7:49 PM reset)** → A1/A2 proceed **TEST-VERIFIED**; the **A1 + A2 Codex reviews + the framework cross-check are DATED OBLIGATIONS before the A2 GO/NO-GO** (decision-log 2026-06-25). **REMAINING = the A2 GO/NO-GO batch** (see HANDOFF NEXT): the live R-LOOP-10 run ($0, P3-unblocked, set K) · `verify:full` e2e · the seat-blocked Codex batch · `acceptance-gate` · then the **owner A2 GO/NO-GO**. `npm run verify` green throughout (215 + 3 skipped); `lib/core`+oracle+gold UNTOUCHED. Everything below is Phase 0 + the prior product.
    70	
    71	Build update: 2026-06-25 (**MULTI-AGENT PIVOT — PHASE 0 executing; owner-approved via `/claude-os`; goal mode**) — **Owner-triggered pivot: elevate the near-ship workflow into a bounded, HITL, eval-gated MULTI-AGENT verify-and-self-correct system.** Plan APPROVED + durable (strategic brief `~/.claude/plans/read-last-handoff-and-snappy-ripple.md`; execution spec `docs/plan-multi-agent-execution.md`). **PHASE 0 (Decide & gate) is nearly cleared:** the **mandatory cross-model gate RAN** (Codex `gpt-5.5`@`xhigh`, read-only, via `codex-guarded`) → **BLOCK (9 findings) → ALL 9 reconciled primary-model-final** (verdict + reconciliation table: `docs/reviews/codex-2026-06-25-multiagent-pivot.md`; the BLOCK challenged **no** part of the pivot's direction — every finding was a condition on honesty/scope/deterministic-first/paperwork, converging with the primary model's own pre-review APPROVE-WITH-CONDITIONS + the advisor). Authored: **ADR-002** (`docs/decisions/ADR-002-multi-agent-architecture.md`), the **3 decision-log reversals** (drop-agentic→agentic deliverable · single-agent→bounded multi-agent · integrations-deferred→transient demo, the last framed as a *satisfied* RULES §3 precondition not a rule reversal), and **binding spec amendments** (`docs/plan-multi-agent-execution.md` §0: AM-1..AM-8 + new R-LOOP-1b/8b). **The confirming Codex pass CONFIRMED — the Phase 0 gate is CLEARED (BLOCK → reconciled → RESIDUAL → patched → CONFIRMED, 2 rounds).** **Binding build preconditions** (Codex #1 + #6): the paused **P3 judge calibration MUST clear the held-out bar BEFORE A2's live self-correction milestone**; the agent **recommends only** — `send_eligible`/approval/the send transition stay deterministic + **test-locked the agent cannot override**. **Committed near-term scope = P3-calibration + A1 + A2; A3/A4/A5/Track B = roadmap, re-decided at the A2 owner go/no-go.** The built product (judge · gatekeeper · eval harness · hybrid data · REPLAY; 192 tests green) is **PROMOTED to the agents' tools, not rewritten.** **NO product code changed in Phase 0 (governance only).** Reverses 3 logged decisions (recorded). The prior active task (UI redesign Stage 2 + semantic-judge P3 calibration) is **SUBSUMED** — the judge calibration still completes (it IS the Faithfulness-reverse tool the loop depends on); the UI continues but must surface the agent trajectory at A4. **REMAINING Phase 0 = TWO OWNER ACTIONS: commit the Phase-0 docs (explicit paths) + toggle `/autopilot` with an A2-scoped `/goal` (stop at the A2 go/no-go, do NOT chain to A5) → A1.** Everything below is the prior (complete, deploy-ready) product + the semantic-judge build, now the **tool layer** the agents call.
    72	
    73	Build update: 2026-06-22 (SEMANTIC JUDGE — P3 INFRASTRUCTURE DONE + LIVE JUDGE WIRED + PROVEN; owner provided GROQ_API_KEY; goal mode) — **The live cross-family Groq `openai/gpt-oss-120b` judge is wired + working; one clean calibration run remains, gated on a fresh Groq daily token window.** Verified the owner's key without printing it (gsk_/56-char, `.env` gitignored+untracked, HTTP 200, model available + non-deprecated per RULES §6). Installed `@ai-sdk/groq@2.0.42` (approved P0 decision) and wired the live judge in `lib/agents/semantic-judge.ts` (`defaultJudgeGenerate`: strict `structuredOutputs:true` + `reasoningEffort:"low"`); build-time strict-mode smoke returned schema-valid JSON + flagged a planted fabrication. Built the key-gated calibration runner `evals/judge-calibration.live.test.ts` (live judge over the 30-item gold set, K=3 reps, R-CAL-1 partition; auto-skips offline). **A live run PROVED the capability** — strong recall (caught the planted fabrications), but precision was dragged by a GROUNDING gap: the judge flagged the **platform's own name** ("...onboarding step with DoorDash") + greeting framing as "unsupported." **Root-caused + FIXED** in the prompt (`buildJudgePrompt` now tells the model the email is sent BY the platform; threaded `platformName`); a raw probe confirmed the fix discriminates at `reasoningEffort:"low"`. **THE REAL CONSTRAINT (read verbatim from the Groq 429 body, after an advisor caught me inferring it from headers twice): tokens-per-DAY = 200,000, used 199,981 — 5 debugging/calibration runs spent today's budget.** NOT a code bug, NOT "free tier can't do it": `reasoningEffort:"low"` cuts a call to ~374 tokens, so a full 78-call run needs ~30K of 200K → feasible on a fresh window. **REMAINING P3 = one clean run on a fresh daily window** → read held-out recall/precision/F1 + κ + flip-rate → **P4** (eval-lock + 3 demo surfaces + Codex gate + flip docs ONLY if metrics clear the bar, R-HON-3). Pre-fix numbers deliberately NOT enshrined (snapshot had TN inflation + is superseded; deleted). Offline suite green: **192 passed + 2 skipped** (both live tests auto-skip); typecheck/lint/build green; `lib/core` + differential UNTOUCHED. Full honest status: `docs/judge-calibration-status.md`. Everything below is the prior P2 + product close-out.
    74	
    75	Build update: 2026-06-22 (SEMANTIC JUDGE — P2 DONE + GREEN; offline/$0; goal mode) — **Built the judge's CALIBRATION CORE: a pure metrics module + a stratified gold set + a reusable harness + a 16-test calibration suite. 192 tests + 1 skipped green; typecheck/lint/build green; `lib/core` + the differential oracle UNTOUCHED.** Files: `lib/evals/judge-metrics.ts` (confusion matrix · precision/recall/F1 · TPR/TNR · Wilson recall CI · Cohen's κ · test-retest flip-rate; `headlineReport` = **recall on the gatekeeper-PASSING subset**, R-CAL-1, not vacuum recall), `evals/gold/semantic-judge-gold.ts` (gold set as typed TS LITERALS — **30 items**: 16 planted judge-territory positives across 4 failure modes [timeline/entity/capability/specific, ≥3 each, 9 in the held-out test split] that survive the deterministic guardrail, 2 gate-caught positives [revenue%, state-mismatch] to exercise R-CAL-1 exclusion, 10 mock-clean + 2 real-supply clean negatives; objective field-entailment labels + few-shot critiques incl. supported exemplars R-CAL-5; tune/test split R-CAL-6/7 — grown from 21 to the R-CAL-2 ~30 floor after an advisor flagged the held-out positive count), `evals/gold/harness.ts` (reusable gold→real-gatekeeper→JudgeFn wiring; `mockJudgeFn` is the P2 stub; the SAME harness feeds P3's live judge), `evals/judge-calibration.test.ts` (16 tests). **Advisor-shaped (call before writing): metric MATH tested vs hand-computed confusion matrices [independent of any judge]; the mock judge run ONLY as a labeled "stub baseline (NOT calibration)," never gated on a threshold; R-CAL-1 ENFORCED LIVE — every gold item run through the real `runGatekeeper`, its approval must equal the declared expectation.** That live enforcement caught a defective planted positive (`G-state-1` didn't trip the tense-aware state check) → reworded → gate blocks it (proof the enforcement has teeth). **Honesty (R-CAL-4 / R-HON-1): all gold positives are SYNTHETIC + labeled `source:"planted"` (the 6 recorded live drafts are well-grounded, organic fabrications ≈ 0); no "built + calibrated, F1=X" claim ships until P3/P4 metrics clear the bar on held-out data.** Judge model = CROSS-FAMILY Groq `openai/gpt-oss-120b` (free, strict JSON), freshness-verified current 2026-06-22. **NEXT = P3 (OWNER-GATED: a free `GROQ_API_KEY`)** → run the live cross-family judge through the harness → real metrics + frozen calibration fixture → P4 (eval-lock + 3 demo surfaces + Codex gate + honest docs). Then the QUEUED UI redesign + owner-gated T13 deploy. Everything below is the prior alignment-audit + product close-out (unchanged).
    76	
    77	Build update: 2026-06-22 (DOCTRINE ALIGNMENT-AUDIT — reconciled; owner "do all the fixes and commit") — **Ran a read-only 3-agent alignment pass (project-advisor · guidelines-monitor · acceptance-gate) against the upgraded claude-os doctrine, then FIXED every gate-blocking + important finding across 7 committed slices (two Codex BLOCK→reconcile rounds converged). 161 tests + 1 skipped green at each slice; typecheck/lint/build green.** Verdicts: project-advisor = HYBRID-CORRECT (deterministic core right; the LLM earns a *demonstration* seat) / SOUND-WITH-GAPS; guidelines-monitor = 12 followed / 2 partial / 0 violated; acceptance-gate = BLOCK (now reconciled). **CANONICAL FACTS (supersede any earlier line, incl. the stale "4 LIVE_AI / 2 FAILED_TO_FALLBACK / $0.0036 / 153|145 tests"): the locked fixture `lib/data/live-samples.snapshot.json` = 5 LIVE_AI / 1 FAILED_TO_FALLBACK / $0.004203; test count = 161 (+1 skipped live-smoke).** Fixes: (1) honesty/accuracy — false "Real San Francisco businesses" / "real business names" copy (`app/page.tsx`, `app/metrics`) → fictional-display wording; stale run-stats synced to the fixture across README/app-eval/ENTERPRISE-READINESS; "authentic caught-failure" overclaim softened (commit `8b8a896`). (2) NEW `no-leakage` eval grader (4th dim) catching the recorded raw-enum + risk-level leak the other graders missed — planted + real-output teeth; live prompt tightened; snapshot re-scored 3/4 leaky / 4/4 clean (commit `c100f41`). (3) a11y — dim 11px text contrast → WCAG-AA + skip-link (commit `93848de`). (4) recovered the rebuild-era Codex verdicts from `/tmp` into `docs/reviews/` + backfilled `docs/implementation-journal.md` (gap was: gate evidence lived only in `/tmp`; journal newest entry was 2026-06-02) (commit `e675df0`). **The acceptance-gate's HIGHEST-ranked "secret in `.env`" was VERIFIED a false alarm — `.env` is gitignored, untracked, never committed, deploy-excluded; not a RULES §11 breach.** A fresh pre-deploy **Codex pass (gpt-5.5 @ xhigh) RAN** on the fix slices → **BLOCK (11 findings), ALL reconciled in slice 6** (`docs/reviews/codex-2026-06-22-alignfix.md`): the runtime **gatekeeper now ENFORCES no-leakage** (a shared precise-denylist detector in `lib/agents/state-consistency.ts` — eliminates the false-positive + closes the eval-scored-but-not-gated gap), the footer + the now-stale "caught nothing" overclaim were corrected, the detector hardened, and the 3-grader surfaces synced. The **confirming pass then found 4 second-order items** (hyphenated-identifier + `risk is/=high` detector gaps · "3 of 6"→"3 of 5 parsed live" count precision · committed allow/deny regression tests) → **reconciled in slice 7** (`docs/reviews/codex-2026-06-22-confirm.md`). The final re-confirm hit a **transient Codex "at capacity" error** (surfaced raw; NOT retried per owner doctrine) after reading the slice-7 tests — so slice 7 is **test-verified** (a committed allow/deny regression suite encodes the reviewer's exact cases — `bank-verification-needed` denied, `Tacos_To_Go`/`sign-up` allowed, `risk is/=high` denied; 161 green), and a Codex re-confirm on `af3680e..HEAD` is a **recommended dated obligation, not a blocker** (per the 2026-06-20 test-verified-reconciliation precedent). Remaining = owner-gated **deploy (T13)** only. The UI-redesign exploration below is unchanged (separate, in-flight). Everything below earlier.
    78	
    79	Build update: 2026-06-20 (UI REDESIGN — exploration; **paused for a fresh session**) — **The product is DONE / green / deploy-ready (everything below). Now in a UI REDESIGN: the owner finds the current console "dull / generic" and wants a modern, professional, ELEGANT, white-background product site with a STORYTELLING walkthrough arc + motion/transitions + custom icons/SVGs — anti-slop, senior-designer craft.** Built **5 distinct design-direction SAMPLES** (standalone HTML, real ActivationOps content, fictional names, white-bg, full storytelling arc, scroll-reveal + animated pipeline, custom inline SVGs) via **5 parallel frontend-specialist agents**: `mockups/editorial.html` (Fraunces serif + oxblood magazine long-read) · `mockups/saas.html` (Linear/Vercel emerald, console-preview hero) · `mockups/swiss.html` (monochrome + red, strict Swiss grid) · `mockups/technical.html` (blueprint dot-grid, monospace, animated flow-diagram) · `mockups/premium.html` (Stripe/Mercury indigo, layered depth). Screenshots: `mockups/shots/*.png`. Served for viewing at **http://localhost:8080/mockups/<name>.html** (static server running; old app dev server on :3000). **AWAITING the owner's PICK** (a single winner, or a blend). **NEXT (after the pick): FINALIZE the chosen design language into the real Next.js app** — apply it as the design system across EVERY surface (Overview · Merchant Detail · Eval · Metrics · Audit · Cost) + add the storytelling landing as the new front door; keep all logic/data/evals intact; then re-verify (typecheck/lint/test/build/e2e — **the e2e selectors/headings will need updating for the new UI**). THEN the owner-gated T13 deploy. The mockups are committed; the chosen-not, discard the rest after finalize. Everything below is the (complete, deploy-ready, grill-reconciled) product.
    80	
    81	Build update: 2026-06-20 (goal mode — PRE-DEPLOY GRILL **fully reconciled**, owner "fix all") — **All 14 grill findings RESOLVED: honesty hardened across every surface + the public demo FICTIONALIZED + the guardrail-precision fix COMPLETED. 155 tests + 3 e2e green; 27 commits.** #1 (the top risk — real personal-name DBAs as fabricated "high-risk"): **FIXED** — the public demo now shows 20 **fictional** names; the real-data CAPABILITY stays in the adapter (`lib/ingest/sf-adapter.ts`) + its tests, and every doc/label reframed "real capability / fictional display" (`HONEST_DATA_LABEL`, README, WHY, ENTERPRISE, PROVENANCE). The live re-run over the fictional merchants then surfaced that the precision fix was **incomplete** — the menu/photos/hours patterns over-caught passive phrasing ("menu to be uploaded", "photos to complete") → **completed the tense-aware tightening** + locked it; post-fix live re-run: **0 false blocks, 5 LIVE_AI + 1 honest fallback, all 3/3, $0.0042.** Loosened `live-samples.test` to stable invariants (the live split/verdicts are non-deterministic). #2 name resolved (no collision; demo-OK; commercial clearance is owner's). #3 `out/README.md` labels the Python-v1 oracle ("DoorDash" = the differential reference-name, synthetic, not affiliation). **DEPLOY-READINESS: the grill's blockers are cleared — deploy is a clean owner GO** (run Vercel · confirm `.env`/`ENABLE_LIVE_AI` absent in the Vercel env · keep the repo private OR treat `out/` as the labeled bundle · a final pre-deploy Codex pass is available if wanted). Everything below earlier.
    82	
    83	Build update: 2026-06-20 (goal mode — PRE-DEPLOY GRILL, owner-requested) — **Ran a pre-deploy devil's-advocate grill (Codex cross-model + advisor): DEPLOY-READINESS was NOT-YET → honesty copy/disclaimers HARDENED across EVERY public surface (25 commits; 153 tests + 3 e2e green).** Done (copy/disclaimer only, no build reopen): a shared honesty + **non-affiliation footer on every surface** (synthetic state · not affiliated with DoorDash/Uber Eats/Grubhub/DataSF/any business · recorded-fixture note); Metrics de-"Impact"-ified ("Workflow metrics (simulated)", "not real outcomes"); README/ENTERPRISE softened ("review/adapt/revalidate as a reference prototype", stale counts fixed 94/50→153); **"proven end-to-end" → "exercised plumbing/fallback/cost — not broad model quality"**; the live fixture labeled a **static recording** + a local-verify command (no public live endpoint — REPLAY-only kept); the Gate scoped to declared claims; product PII label tightened; stale "Phase-B" copy fixed; Cost "never" → "budget-guarded". **3 OWNER-DECISIONS gate the public deploy:** (1) **[#1 risk]** real **personal-name DBAs** rendered as fabricated "high-risk/bank-blocked" under DoorDash framing — recommend swapping the **public demo to fictional names** (keep the DataSF real-name provenance in docs); (2) **"Curbside Commons"** name clearance; (3) exclude **`out/`** (legacy "DoorDash" strings) from any public **GitHub** push (`.vercelignore` already covers Vercel). Everything below earlier.
    84	
    85	Build update: 2026-06-20 (goal mode — comprehensive 3-audit sweep + full reconciliation) — **Codex (comprehensive) + security-specialist + evals-specialist all run on the REAL artifact; EVERY finding reconciled (incl. a FINAL Codex confirming pass: BLOCK→fixed — corpus now runs all 45 cases, live-snapshot lock tightened, "declared claim" wording, stale copy); 153 tests + 3 e2e green, coverage ≥88/79/90/91 (ratchet 80/70/80/80).** Codex (8 findings) + security (no P0/P1; defenses confirmed sound) + evals (4 P1 rigor gaps) all closed. Fixes: guardrail-precision coverage (the precision fix had opened a false-NEGATIVE — verb-before-noun completion claims; both the false-positive AND false-negative now closed, broad table test); partial-usage→UNKNOWN_USAGE (cost integrity); `live:true` can't bypass ENABLE_LIVE_AI (LIVE_AI_DISABLED provider boundary); budget rejects negatives/bad-cap; Gemini key via `x-goog-api-key` header; honesty copy ("claims-checked" not "truthful"; "demo makes no live calls" vs "a recorded run exists"). **NEW eval rigor (evals-specialist root-causes closed):** 45-case guardrail regression corpus ported to TS (locks the core guardrail vs the Python oracle); draft-text differential (`makeDraft` vs `out/model_runs.csv`, byte-for-byte); live-samples snapshot regression-locked; `.vercelignore` (keeps `.env`/DoorDash-string artifacts out of any upload). **Canonical live-run facts (post guardrail-fix; fixture `lib/data/live-samples.snapshot.json`): 4 LIVE_AI / 2 FAILED_TO_FALLBACK, 3 PASS / 3 WARN, 0 BLOCKED, $0.0036; all LIVE_AI drafts 3/3** (the "1 BLOCKED / 5 LIVE_AI" in the line below was the PRE-fix FIRST run — the finding that drove the precision fix; now superseded). Remaining: **owner-gated deploy only** (platform-name · Vercel · the personal-name / `.env`-hygiene / `out/`-de-brand pre-deploy checks the security audit flagged). Everything below is earlier.
    86	
    87	Build update: 2026-06-20 (goal mode) — **LIVE GEMINI RUN DONE (owner key) — the headline DoD milestone is MET; total real spend $0.0037 (cap $5).** Ran one merchant per blocker (6) through real `gemini-2.5-flash` (preflight + pricing re-verified live, RULES §6 — pinned table unchanged): **5 LIVE_AI + 1 FAILED_TO_FALLBACK; gate 3 PASS / 2 WARN(held) / 1 BLOCKED; eval scored every real draft (5×3/3, 1×2/3).** Validated on REAL output: claims-gatekeeper passed all declared claims; injection cut held (placeholder→real name); cumulative ledger held ($0.0037, no breach); **a real billed-but-unparseable call (bank_verification) → FAILED_TO_FALLBACK with its cost recorded ($0.000255, not $0)** — the P0 fix proven live. **Authentic caught issue:** the business_verification draft was BLOCKED on `state_mismatch` — a **fail-safe over-match** (the pinned core guardrail flags the phrase "business verification" regardless of tense; the draft was truthful) — held for human; NOT a model lie. Recorded the live run as a frozen fixture (`lib/data/live-samples.snapshot.json`) + a gated live test (`evals/live-smoke.test.ts`, auto-skips without the key — `npm test` = 56 pass + 1 skipped, no billing) + `scripts-ts/gemini-preflight.mjs`. **Next (owner-gated):** T13 deploy + platform-name; the Codex confirming pass (dated ~Jun 24, still required pre-deploy); + a documented tuning opportunity — refine the guardrail's "business verification" precision for live phrasing IN THE AGENT TIER (never the pinned core/differential). Everything below is earlier.
    88	
    89	Build update: 2026-06-20 (goal mode) — **CROSS-MODEL GATE on the new (post-slice) batch: RAN (BLOCK) + FULLY RECONCILED (commit `c385936`; 56 Vitest + 3 Playwright e2e green); the CONFIRMING re-pass is BLOCKED on the Codex seat.** Codex batch-2 review found 1 P0 + 4 P1/P2 (billed-fail-$0 cap escape · ungated live-batch rows · incomplete placeholder/injection validation · blocker_source overclaim · dormant-state gap · "every claim" wording) — **all fixed + test-covered**. The confirming re-review hit the Codex usage limit — raw error surfaced verbatim: *"You've hit your usage limit … try again at Jun 24th, 2026 5:53 PM."* Per doctrine (surface raw · no retry/downgrade/switch — the seat is an OWNER action · **Codex-down ≠ gate-waived**): the confirming cross-model pass is a **dated obligation (≈Jun 24)**; the **live run (first billed Gemini call) + Vercel deploy HOLD** for it, UNLESS the owner accepts the test-verified reconciliation (56+3 green) as sufficient. **Everything buildable is DONE + green + committed (14 commits this session).** Remaining = owner-gated: **the key (T12 live run) · deploy (T13) · + this dated Codex confirming pass.** Resume prompt in HANDOFF. Everything below is earlier this session.
    90	
    91	Build update: 2026-06-19 (build session 2, continued — goal mode) — **PHASES B + C + D-docs DONE, committed, GREEN; live path HARDENED + READY for the owner's Gemini key.** On top of the committed slice: (1) **Phase B domain depth** — `lib/domain/diagnosis.ts` (engagement state from last_login×steps×tenure + a reactivation play that *varies by engagement*, not just step + blocker_source merchant-vs-platform), cited from a `research-specialist` digest (`docs/research/merchant-activation-domain-2026-06-19.md`); add-alongside, **`lib/core`/differential untouched**; commit `3c1540b`. (2) **Phase C console** — shared nav + Eval/Quality · Metrics/Impact · Audit · Cost surfaces (a11y-minded); commit `3ca6986`. (3) **Live-path hardening (pre-Gemini, Codex P1):** prompt-**injection cut** (untrusted name never reaches the model — `{{MERCHANT}}` placeholder, substituted after gatekeeping) + **cumulative budget ledger** (`lib/agents/live-batch.ts`, fail-closed across a run); commit `b0acef4`. (4) **Phase D docs** — `docs/WHY.md` (the full why-chain, each why naming the rejected alternative + cost + a cross-industry "generalizes" note) + honest **today-vs-target README** rewrite; commit `89c7a00`. **Verification: `typecheck/lint/test/build` GREEN — 50 tests (differential byte-identical), `next build` prerenders all routes (this is also the console render-smoke).** **Then (goal-mode "keep building polish") DONE too: T10 Playwright e2e** (commit `bbb2c08`; 3 e2e green — queue+both HITL outcomes · full why-chain Merchant Detail incl. the diagnosis payoff · nav reaches every surface with `aria-current` · cost $0.00 · reduced-motion emulated; `test:e2e`/`verify:full` scripts added) **and the enterprise-readiness / adoption doc** (`docs/ENTERPRISE-READINESS.md`, commit `c59cf76` — controls · boundaries · gaps · the adapter-based adoption contract + expansion path). **THE AUTONOMOUS FRONTIER IS NOW FULLY REACHED — nothing buildable remains without the owner.** Test totals: **50 Vitest + 3 Playwright e2e**, typecheck/lint/build green. **Only remaining work is OWNER-GATED: T12 live Gemini run = `GEMINI_API_KEY` + <$5 (the headline; live path built + hardened + ready) · T13 Vercel deploy + platform-name confirm.** Owner offered the key; safe-`.env` instructions given (never in chat). Resume prompt in HANDOFF. Everything below this line is earlier this session + the pivot record.
    92	
    93	Build update: 2026-06-19 (build session 2) — **THIN VERTICAL SLICE COMPLETE + GREEN; at the Codex gate, then owner commit+deploy gates.** Git-drift CORRECTED: build session 1's scaffold + core port + state-sync are **committed** (`HEAD = 4de4503`, with `f004d19` + `3182bfa`) — the owner committed them after the session-1 handoff was written, so the "surface the commit gate first" step is already resolved. Built this session (one merchant → end-to-end, all add-alongside; **`lib/core/*` and the golden differential lane untouched**): (1) **hybrid dataset** — real SF entities (DataSF `g8m3-pdis`, PDDL 1.0; **NAICS is sector-level so the honest crosswalk is Food Services→Restaurant, Retail Trade→Retail**; 20 real businesses frozen in `lib/data/sf-entities.snapshot.json`, PII-scrubbed to name+category) + a deterministic synthetic activation overlay (no wall-clock), with a source-swappable adapter + sanitizer + integrity/PII/drift guards (`lib/ingest/*`); (2) **bounded Gemini draft** — cost trio (budget hard-stop $5 fail-closed · pinned pricing · env-flags), Gemini wiring + preflight, `draftOutreach` mock/live/FAILED_TO_FALLBACK with a claims[] array (`lib/agents/{budget,pricing,gemini,draft}.ts`); **live AI OFF by default, mock path only, $0 spend**; (3) **claims-gatekeeper** — every claim traces to merchant data + guardrail + schema (`lib/agents/gatekeeper.ts`); (4) **draft-quality eval** — deterministic graders (structure/state-consistency/policy) with corrupted-record teeth (`lib/evals/draft-quality.ts`); (5) **REPLAY orchestrator** — deterministic end-to-end snapshot, $0 ledger (`lib/replay/run.ts`); (6) **two desktop surfaces** — Overview + Activation Queue and a full why-chain Merchant Detail (`app/page.tsx`, `app/merchant/[id]/page.tsx`), de-branded working name "Curbside Commons". **Verification: `npm run typecheck/lint/test/build` all GREEN — 43 Vitest tests (differential stays byte-identical), `next build` prerenders 23 pages (Overview + 20 SSG merchant pages).** Slice is **uncommitted** (intent-to-added via `git add -N` so the Codex diff sees it); **commit + Vercel deploy are owner-gated.** **Codex review DONE (verdict BLOCK — correct for a public deploy — reconciled): all fixable findings fixed → 43 green** (budget now fail-closed/ledger-required · billed-fail cost recorded · gatekeeper/UI overclaim softened · empty-corpus non-vacuous · `FETCHED_AT` override · honesty label tightened). **Deferred (binding):** live-prompt injection on `merchant_name` → Phase-B security pass (live OFF, no exploit ships); personal-name DBAs → owner deploy-gate decision. Codex confirmed non-findings (key not client-exposed · no dangerouslySetInnerHTML · snapshot name+category only · `lib/core/*` untouched). **Phase-B binding items recorded (do not lose):** live-path prompt-injection surface (merchant_name is untrusted prose into the live prompt — sanitizer strips control chars only; pair with the security-specialist pass) · re-verify Gemini pricing/model at the live-smoke gate · when live Gemini lands, the REPLAY accessor MUST switch from compute-at-load to a recorded frozen fixture (a live call isn't recomputable). Next: owner GO on the commit(s) + the deploy. Everything below is build session 1 + the pivot record.
    94	
    95	Build update: 2026-06-19 (build session 1, after the pivot) — **REBUILD execution STARTED via `/autopilot`; first milestone GREEN.** (1) **Next.js/TS scaffold in + green** — Next.js 16 · React 19 · TS · Tailwind v4 · Vitest (mirrors resilix house style, minus DB/n8n); `npm run typecheck/lint/test/build` all pass. (2) **Deterministic core ported to TS** (`lib/core/{constants,types,guardrail,pipeline}.ts`) with a **differential test that reproduces the Python oracle `out/merchants_v1.csv` byte-for-byte across all 32 columns × 20 merchants + golden aggregates** (`evals/core-differential.test.ts`) — the Phase A faithful-port gate, met early. Platform name parameterized (default "DoorDash" for the oracle; product passes the de-branded name). (3) **Dataset Source-Intake decided** (owner, decision-log 2026-06-19): **SF "Registered Business Locations" / DataSF, PDDL 1.0** public-domain; Kaggle considered + rejected as a class. All new TS work is **uncommitted** (commit owner-gated, RULES §12) — a clean commit point is ready. Next: SF ingestion adapter (NAICS crosswalk) + the slice's Gemini-draft (mocked)/gatekeeper/eval/desktop-surface/REPLAY. Resume prompt in `HANDOFF.md`. Everything below this line is the pivot-recording + historical record.
    96	
    97	Last updated: 2026-06-19 (**MAJOR PIVOT — goal rebuilt to a real, industry-ADOPTABLE, deployed Next.js/TS AI product; owner full-liberty GO; plan APPROVED.** The canonical goal/DoD/phases/blindspots now live in `~/.claude/plans/gentle-forging-starlight.md` (+ the decision-log 2026-06-19 row). Same use case (stalled/long-tail **merchant activation** on a local-commerce delivery marketplace), new delivery shape: single-stack **Next.js+TS+Tailwind+React on Vercel (free)** that **ports** the deterministic core (Python kept tagged `v1-python-prototype` + as a differential oracle), integrates **real bounded Gemini** (eval-gated · claims-gatekeeper · <$5), on **hybrid data** (real open-source entities + synthetic overlay), **equal-weight** Strategy/Ops/BA + deep applied-AI, full **why-chain**, **universally legible**, **desktop-only**, **adoption-grade**, job search in background. Carried forward unchanged: deterministic-first→bounded-LLM, eval-first, free-first, prototype-not-service, honesty. Execution engaged via **`/autopilot`** (owner-gated stops: commits · dataset check-in · platform-name · public posting · irreversible). **The pivot is recorded in the repo this session (decision-log + this header + CURRENT_TASK + HANDOFF + tooling ledger + roadmap DoD note); the actual build runs in a FRESH session — see the HANDOFF resume prompt.** Everything below this line is **historical** (the T-003 track the pivot supersedes). 35/35 tests + eval 20/20|45/45 remain the v1 proof + the differential-test oracle.)
    98	
    99	Prior update: 2026-06-12, second session (**T-003 grill (Act 1) COMPLETE — 4 owner decisions locked: OQ-1 = rename the v1 CSV to a company-agnostic filename (git mv + the single `scripts/config.py:10` re-pin; content byte-identical; residuals frozen + provenance-labeled; Phase-7 publish-vs-exclude open) · OQ-2 = `out/` policy COMMIT-FRESH · PLATFORM_NAME = "Curbside Commons" (S1 collision check) · target market = US. Artifacts: `PLAN.md` + `PLAN-REVIEW-LOG.md` (grill-me-codex flow); plan = draft 3; 4 decision-log rows; open-questions intake Q3 resolved. **Codex Act 2 CONVERGED — VERDICT: APPROVED** (2026-06-12, 4 rounds, single read-only thread `019ebedb-…`; 15 findings → all accepted → draft 4 → 2 consistency rounds → clean APPROVED; full log in `PLAN-REVIEW-LOG.md`). The T-003 plan (draft 4) is grilled + survived 4 rounds of cross-model adversarial review. **Next = owner GO/NO-GO on building T-003** (no code written during the gate). Same session: effort doctrine corrected to AUTO-ADJUST-by-task (supersedes blanket MAX) + context doctrine (minimal · durable · fresh) encoded — CLAUDE.md/decision-log/claude-os/memory; the grill-me-codex skill + Act-2 harness were hardened (namespaced tmp paths, no `head`-pipe SIGPIPE) after an early cross-project verdict-contamination near-miss. 35/35 + eval 20/20|45/45 PASS reconfirmed live post-convergence; `out/` untouched (gate was docs/planning only). 35/35 tests + eval 20/20|45/45 PASS reconfirmed live at session start; no product code/tests/CSV/`out`/`eval` touched; all work uncommitted, pending owner.**)
   100	
   101	Previous update: 2026-06-12 (**T-003 plan REVISED (draft 2); Codex gate not yet run (owner order: use the Codex account as it is — no cap-tracking/date-waiting/credit advisories; attempt, surface raw errors verbatim, stop); build awaits gate + owner GO.** This session: blueprint-review contradiction reconciled (job `bm0i9bxpy` did complete 2026-06-09; header + decision-log synced — re-scope + HYBRID rows now Accepted-via-DoD); [docs/phase3-prep-slice-plan.md](docs/phase3-prep-slice-plan.md) rewritten to add-alongside v1/v2 + ratified HYBRID + build-order slices S1–S5, with the live-code finding that `false_impact_claim` is regex-anchored on `doordash` (`scripts/guardrail.py:29-31` — S1 must parameterize it, proven by v1 staying 45/45 unmodified); the 2026-06-12 Codex review attempt orphaned (usage-limit errors on smoke tests) → deferred with written reason (RULES §9), re-attempt when the seat answers; README staleness fixed; 2026-06-09 task-log entry backfilled; CASE-STUDY overclaim corrected; **owner standing PROJECT-CONSTRAINTS adopted** (decision-log 2026-06-12: tooling ladder, Gemini routing inside the ~$5 cap, data-source biases not reopening the no-live-API decision, date-anchored vetting, Phase-7 specific expansion/adoption deliverable, product target-market = intake question, proposed default US); owner session rule encoded (proactively prompt fresh sessions at stage boundaries). 35/35 tests + eval 20/20|45/45 PASS reconfirmed live 2026-06-12. All work docs/governance — uncommitted, pending owner. Prior state below remains the historical record.)
   102	
   103	Previous update: 2026-06-11 (**Goal RATIFIED — Portfolio Definition of Done (owner GO).** Owner-triggered `/claude-os` reassessment (Codex gpt-5.5/xhigh cross-check: AGREE ×4) found the use case sound but the objective drifted (project DoD open since 2026-06-01 while the completion bar stretched to L4). **Ratified DoD:** company-agnostic public repo + **on-demand prototype** (no 24/7 ops) for **local-commerce marketplace merchant activation** — deterministic triage · bounded Gemini drafting (best current model, **<$5 total**) vs the v2 baseline · human approval gate · idempotent simulated sends · hold/reject/send walkthrough · honest built-vs-designed docs. **Done = T-003 → Phase 3 → Phase 7 (pulled forward); Phases 4–6 optional (post-Phase-3 owner decision); L4 = designed ceiling, never the completion bar.** New owner doctrine encoded in `CLAUDE.md`: free-first runtime stack (sole paid exception Gemini, $5 hard total) · prototype-not-service identity · **Effort = MAX every stage, declared per stage (owner-global)** · project isolation. De-brand flipped **Proposed → Accepted** (company-agnostic but use-case-specific). Roadmap + open-questions synced; decision-log +3 rows +2 status updates. Prior state still valid: 2026-06-09 blueprint package drafted (its review-status contradiction is next-session step 1); T-001 23/23 + T-002 merged at `a95c0f1`; **35/35 tests + eval 20/20 | 45/45 PASS reconfirmed live 2026-06-11** (outputs to temp dirs; `out/` untouched); source CSV + `out/` untouched. All 2026-06-09 + 2026-06-11 work is docs/governance — uncommitted, pending owner.)
   104	
   105	> Date note: the folder's earlier docs are dated 2026-06-02 while the current date is 2026-06-01; Git is now initialized (commit `b57cf2c`) so chronology is tracked going forward. Step order: (1) Codex initial review, (2) Codex open-source validation, (3) Claude governance review, (4) Claude plan reconciliation, (5) operating-system setup, (6) operating-system cleanup, (7) T-001 planning.
   106	
   107	## Current Phase
   108	
   109	**Stage 1 (T-001) is implemented, Codex-reviewed (twice), and green.** The offline pipeline (`scripts/`), tests (`tests/`, **23/23 pass** = T1–T18 + P2-1..P2-5), and generated artifacts (`out/`) exist. Canonical run: 20 merchants → 8 review queue (High, held), 12 simulated_sent, 0 rejected; source CSV byte-identical; send gate verified (T17); app re-run dedups (P2-1). Two Codex review rounds returned 4 + 2 × P2, **all fixed** (no P0/P1). Stdlib only — no network, no AI call, no integrations.
   110	
   111	**Git state (re-derived 2026-06-09 — always re-derive from live `git status` + `git log -1`; do not trust this line):** branch `main`; `HEAD = 9958ec0` ("Audit build process compliance") — the 2026-06-04 audit/decision/state-doc batch **is committed there** (it was *not* uncommitted, as the prior line wrongly said). T-002 committed at `a95c0f1`, merged into `main`; `feature/t002-eval-harness` still at `a95c0f1` (behind `main`, not deleted). **Currently uncommitted (2026-06-09 Phase-3-prep planning batch, pending owner review + commit):** `docs/phase3-prep-slice-plan.md` (new), `.gitignore` (ignore `RULES_CONFIG_DUMP.txt`), and these state-doc syncs. Source CSV, `out/`, `scripts/`, `tests/`, `eval/` untouched. *(Git-line drift recurred a **4th** time: every state doc read `HEAD = dc7d131` while actual `HEAD = 9958ec0` — the audit commit that "fixed" the drift advanced HEAD and re-staled the docs it had just corrected. Durable fix proposed in [docs/phase3-prep-slice-plan.md](docs/phase3-prep-slice-plan.md) T-003c: make git-state re-derivation a **blocking close-out check**, not a written rule.)*
   112	
   113	**T-001.5 (2026-06-02):** the **Enterprise Delivery Playbook** (`docs/enterprise-delivery-playbook.md`) codifies the professional delivery standard (traceability spine, lightweight-vs-full, source tiers, freshness, artifact policy, stage closure, failure taxonomy, public-claim control, handoff-proof, living-standard) with a Universal vs ActivationOps-specific split. **Mandatory Startup Contract** now enforces it at session start (`RULES.md` §15; `CLAUDE.md`; `CODEX.md` process-finding rule; task/review templates; checklist), with an anti-bloat one-line allowance for trivial edits.
   114	
   115	## Decision Status (historical — 2026-06-01)
   116	
   117	The governance review found the dominant risk was process, not data: ~12 review/audit docs, zero runnable code, no planning exit. `docs/plan-reconciliation.md` resolved that — it accepted Codex's safety controls, rejected the documentation gate and the 14-table V1 schema, fixed the V1 scope, set a one-line planning exit condition, and named the first implementation task. **This GO/NO-GO is now historical: the owner gave GO, and T-001 (the offline thin slice) was built, tested (23/23), and audited — closed with minor follow-ups. See Current Readiness / Current Next Step below.**
   118	
   119	## Operating System (2026-06-01)
   120	
   121	The project operating system is now in place so any tool/account can continue from the repo, not from memory: `RULES.md` (constitution; it wins on any conflict), `CLAUDE.md` / `CODEX.md` (roles), `CURRENT_TASK.md` + `HANDOFF.md` (continuity), `docs/dual-model-workflow.md` (verified Codex commands), `docs/project-narrative.md` (public methodology), `docs/implementation-journal.md`, `docs/decision-log.md`, `docs/checklists/prevent-repeat-checklist.md`, `docs/prompts/*`, and `docs/visuals/*`. This is operating infrastructure, not product — no product code, schema, or integration was created.
   122	
   123	## Current Evidence
   124	
   125	- Project folder originally contained one merchant CSV file before documentation scaffolding was added.
   126	- CSV file found: `DoorDash Merchant Nudge Engine - Merchant Directory.csv`
   127	- Parsed merchant records: 20
   128	- CSV header issue: first two columns are both named `Merchant Name`; second column values indicate merchant category/type.
   129	- Risk score is synthetic and matches the inferred formula across all rows.
   130	- Git repository: **initialized** (initial commit `b57cf2c "Initial reviewed planning state"`). The operating system, Enterprise Delivery Playbook, Mandatory Startup Contract, source-intake standards, the Source Openness / state-sync batch, and the roadmap applicability review + Codex revision (incl. the eval-first ratification) are **committed** (OS setup at `49408d3`). **The current HEAD and working-tree state are tracked only in the canonical "Git state" line under Current Phase above — not restated here, to avoid git-line drift.**
   131	- Files named "required"/"mandatory" by past prompts but never defined in the repo: `ALWAYS_READ.md`, `docs/audits/codex-compliance-audit.md`, `docs/audits/session-compliance-template.md`. Recorded as evidence of the rules-live-in-prompts problem (see Current Blockers), not as standing build blockers.
   132	
   133	## What The Prior Validation Session Did (open-source validation, Session 2)
   134	
   135	- Read the current validation work order.
   136	- Read mandatory project files in order where present.
   137	- Recorded missing mandatory files.
   138	- Re-validated the CSV facts.
   139	- Checked current official/open sources for AI workflow design, structured outputs, n8n, Slack, Resend, Supabase, Google Sheets, and agentic security.
   140	- Audited the prior Codex initial review.
   141	- Created an open-source validation review.
   142	- Created this session's compliance audit.
   143	- Updated task log and open questions.
   144	
   145	## Sources Checked
   146	
   147	- Anthropic agent/workflow guidance.
   148	- OpenAI agent, guardrail, tracing, and eval guidance.
   149	- Gemini structured output documentation.
   150	- n8n error handling, webhook, and human-in-the-loop docs.
   151	- Slack request verification, interactivity, and message docs.
   152	- Resend send email, webhook, and event docs.
   153	- Supabase security and Row Level Security docs.
   154	- Google Sheets API usage limits.
   155	- OWASP LLM and MCP security guidance.
   156	- Recent public research on agentic workflow injection and AI coding-tool engineering pitfalls.
   157	
   158	## Current Readiness Score
   159	
   160	The single blended "readiness" number is retired (earlier it rose as more review docs were written — rewarding documenting over shipping). Current state, two tracks:
   161	
   162	- Shippable/build readiness: **T-001 (offline thin slice) is implemented, tested, and audited.** A reviewer can run `python3 scripts/run.py` and `python3 -m unittest tests.test_t001 -v` → **23/23 pass.** T-001 is **closed with minor follow-ups**.
   163	- Standards/governance completeness: high and now **anchored in the repo** — `RULES.md`, the Enterprise Delivery Playbook, the Mandatory Startup Contract, and the Source Intake + Open Source Discovery rules were applied to T-001 without retroactively breaking it.
   164	
   165	The discipline now is to build the next capability *under* these standards, not to add more of them.
   166	
   167	## Current Blockers
   168	
   169	**No build blockers.** T-001 is shipped and green; the prior pre-build blockers were all resolved *before* T-001 was built (historical record in `docs/plan-reconciliation.md` and `docs/task-log.md`):
   170	
   171	- Planning had no exit → resolved (the owner gave GO and the slice was built).
   172	- Rules lived in prompts → resolved (`RULES.md` is the canonical in-repo source).
   173	- Prompt-invented "mandatory files" → de-scoped.
   174	- V1 data shape ambiguous → resolved to one entity file + append-only event logs, not 14 tables.
   175	- "Agentic" naming → dropped for V1.
   176	
   177	The only open items are hygiene/decision follow-ups (see Current Next Step); none block work.
   178	
   179	## Current Next Step
   180	
   181	1. ~~Implement T-001 → Codex review rounds → fix P2 → commit → ground-rules audit → T-001.7 post-playbook alignment audit~~ — **done**; 23/23 pass; T-001 **closed with minor follow-ups** (`docs/audits/post-playbook-alignment-audit.md`).
   182	2. ~~Roadmap batch commit~~ — **done** at `df2b986` (`docs/roadmap.md` on `main`).
   183	3. ~~Owner: review + commit the uncommitted work — `docs/t002-slice-plan.md` + four state-doc syncs~~ — **done**; committed at `a95c0f1` and merged to `main` (`dc7d131`). *(This item was left stale post-merge — the recurring git-line-drift failure — and is corrected by [docs/audits/build-process-compliance-audit.md](docs/audits/build-process-compliance-audit.md).)*
   184	4. **Hygiene / decision follow-ups (non-blocking):**
   185	   1. restore or decide the `out/` generated-log tracking policy (`git checkout -- out/audit_log.csv out/model_runs.csv`, or gitignore the two volatile logs);
   186	   2. decide whether **enforcement hooks** for CSV-immutability / secrets-blocking should become a future approved task.
   187	5. **T-002 — merged to `main`** (`a95c0f1`; cleanup `dc7d131`): golden + regression JSON, `scripts/eval.py`, `tests/test_t002.py` (E1–E10 + E1b/E2b), baseline `eval/eval_baseline.v1.json`. **35/35** tests (T-001 23 + T-002 12); `python3 scripts/eval.py` PASS. **8 Codex review rounds completed before commit (all findings resolved).** **Next:** clear the pre-Phase-3 gate ([docs/audits/build-process-compliance-audit.md](docs/audits/build-process-compliance-audit.md)). Phase 3 (Gemini) still after baseline acceptance.
   188	6. **Goal ratified (2026-06-11, owner GO)** — Portfolio DoD (see `docs/decision-log.md`). ~~Reconcile the blueprint-review status~~ + ~~revise the T-003 plan to add-alongside/HYBRID~~ — **both done 2026-06-12** (plan = draft 2). **Next concrete step (Effort: MAX — auto-routed; ship-gating/high-risk per the 2026-06-12 auto-adjust doctrine):** smoke-test the Codex seat → when alive, run **Act 2** (grill-me-codex read-only adversarial loop, MAX_ROUNDS=5) against `PLAN.md` → apply findings → owner GO → build T-003 (S1 de-brand → S2 draft contract → S3 v2 hybrid lane → S4 adversarial corpus → S5 hooks). Owner inputs: **all 4 grill questions answered 2026-06-12** (OQ-1 rename · OQ-2 commit-fresh · Curbside Commons · US); remaining owner calls = GO after Act 2, commits, Phase-7 publish-vs-exclude.
   189	
   190	Off the table until far later: live Supabase, n8n, Slack, Resend, or real Gemini calls; real credentials; any real merchant data; live outbound email.
   191	
   192	## Files Created Or Updated This Session
   193	
   194	T-002 implementation (2026-06-04, **merged to `main` at `a95c0f1`**, cleanup `dc7d131`): `eval/golden_merchants.v1.json`, `eval/guardrail_regression.v1.json` (45 cases), `scripts/eval.py`, `tests/test_t002.py`, `eval/eval_baseline.v1.json`, plus a +1-line `scripts/guardrail.py` `pii_or_secret` hardening and the matching `docs/v1-data-dictionary.md` §9 sync; **35/35** tests (T-001 23 + T-002 12); eval CLI PASS. Source CSV and `out/` untouched. **8 Codex review rounds completed before commit** (all findings resolved).
   195	
   196	T-002 slice plan (2026-06-04, docs): created `docs/t002-slice-plan.md`; now marked implemented.
   197	
   198	Roadmap Codex-review correction (2026-06-02, lightweight): applied the two Codex findings to `docs/roadmap.md` — recast **Project Operating Model and Governance** from a numbered build phase to a completed **Foundation** (renumbered the product phases to 1–7; updated all in-doc phase cross-references), and cleared the stale eval-first-T-002 ratification follow-ups in `CURRENT_TASK.md` + `PROJECT_STATE.md` (Open Questions). Kept genuinely-open items (`out/` log policy; enforcement-hooks). **No new roadmap scope; no `decision-log` change; no product code/tests/CSV/`out`/integration change; no commit (owner decides). T-002 not started.**
   199	
   200	Roadmap creation (2026-06-02, lightweight): created `docs/roadmap.md` — a short, product-first roadmap (Current Status; Product Lifecycle loop; a governance Foundation + 7 product-first Build Phases with per-phase goal / build / validation / out-of-scope / trigger; a plain "Why T-002 Comes Before Gemini"; a tiny Terminology note with **no** framework-mapping section; a "What Not To Do Yet" list). Uses the ratified **T-002 = Offline Evaluation and Regression Harness**. Synced `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. **No `decision-log` change (no new decision); no product code/tests/CSV/`out`/integration change; nothing installed/adopted; no commit (owner decides). T-002 not started.**
   201	
   202	Codex-review revision pass (2026-06-02, lightweight): applied the four Codex adversarial-review findings to `docs/review-packets/roadmap-lifecycle-applicability-review.md` (eval-first ratified + named **Offline Evaluation and Regression Harness**; no framework-mapping section in the roadmap by default; EDD downgraded to preprint/practice reference; product-first roadmap guidance) and added a top revision note; recorded the **eval-first T-002 ratification** in `docs/decision-log.md`; corrected the stale `PROJECT_STATE.md` git/current-state lines; synced `CURRENT_TASK.md` / `HANDOFF.md` / `docs/task-log.md`. **No `docs/roadmap.md`; no new files; no product code/tests/CSV/`out`/integration change; nothing installed/adopted; no commit (owner decides).**
   203	
   204	Roadmap / Lifecycle / Build-Phase Applicability Review (2026-06-02, review/planning only): created `docs/review-packets/roadmap-lifecycle-applicability-review.md` (broad source discovery across NIST AI RMF + GenAI Profile + SSDF, DORA, Google SRE, MLOps/LLMOps, LLM eval / golden-dataset / regression / evaluation-driven development, HITL gates, walking-skeleton/tracer-bullet/vertical-slice, provenance/lineage, portfolio red-flags; each term classified use-now/later/reference/reject). Verdict: industry terms as honest mapping not phase names; product-named phases; RULES §3 = lifecycle spine; **T-002 = Offline Evaluation Harness** (evaluation-first), eval-before-Gemini justified but a §6 reorder needing owner ratification; recommend Codex review before any roadmap. Updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. **No roadmap written; no `decision-log` entry; no code/tests/CSV/`out`/integration change; nothing installed/adopted.**
   205	
   206	Source Openness Clarification Pass (2026-06-02, lightweight, wording-only): added an **Open Source Discovery** rule (named sources/frameworks/repos/vendors/communities/examples = candidates and seeds, not boundaries; search broadly incl. Reddit/forums/YouTube/SO as field-signals; **tiers judge quality, not restrict discovery**; *maximum useful research ≠ endless*; community = signal not proof unless corroborated). Edited `docs/enterprise-delivery-playbook.md` (new subsection in the Source-Backed Research Standard), `RULES.md` §14, `CLAUDE.md`, `CODEX.md` (8 flag conditions), `docs/prompts/claude-task-template.md`, `docs/prompts/codex-plan-review-template.md`, `docs/prompts/codex-changed-files-review-template.md`, `docs/checklists/prevent-repeat-checklist.md`; updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. No restrictive wording existed to remove (grep = false positives only); no new standing files; no decision-log entry (no decision made); no product code/tests/CSV/`out`/integration/scope change.
   207	
   208	T-001.7 post-playbook alignment audit (2026-06-02): created `docs/audits/post-playbook-alignment-audit.md`; fixed the known-stale `docs/v1-slice-plan.md` (test list → T1–T18 + P2-1..P2-5 = 23; `--fresh` note; status → implemented); corrected state-doc git-state. Vault read-only-inspected (exemplary boundary). Verdict: T-001 closed with minor follow-ups; next stage = offline eval harness (not Gemini). No product code/tests/CSV changes.
   209	
   210	T-001.6 source-intake CORRECTION (2026-06-02): rewrote `docs/research/source-intake-review.md` from direct sources — read 3 PDFs directly, web-inspected all 5 GitHub repos, re-checked live official Claude Code docs (best-practices/features-overview/hooks/sub-agents); added explicit source-status separation + honest gaps (55 MB architect guide not loaded; model docs/changelog not fetched; GPT-5.5 UNVERIFIED). Updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. Nothing adopted; no governance edit. No product code/tests/CSV/`out`/integration changes.
   211	
   212	T-001.6 source-intake review (2026-06-02): created `docs/research/source-intake-review.md` (summary-only basis; superseded by the correction above).
   213	
   214	Source/Pattern/Reference Intake rule (2026-06-02): `docs/enterprise-delivery-playbook.md` (new section), `RULES.md` (§14 bullet), `CLAUDE.md`, `CODEX.md`, `docs/checklists/prevent-repeat-checklist.md`, `docs/decision-log.md` (row); updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. Integrated into the playbook, no new files. No product code/tests/CSV/`out`/integration changes.
   215	
   216	Mandatory Startup Contract enforcement (2026-06-02): `RULES.md` (§15), `CLAUDE.md` (startup section), `CODEX.md` (process-finding rule), `docs/prompts/claude-task-template.md` (Professional Process Applied block), `docs/prompts/codex-changed-files-review-template.md` + `docs/prompts/codex-plan-review-template.md` (process checks), `docs/checklists/prevent-repeat-checklist.md`; updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. No product code/tests/CSV/`out`/integration changes.
   217	
   218	T-001.5 Enterprise Delivery Playbook (2026-06-02): created `docs/enterprise-delivery-playbook.md`; pointer/obligation edits to `RULES.md` (§14), `CLAUDE.md`, `CODEX.md`, `docs/checklists/prevent-repeat-checklist.md`; updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. Reduced single-doc form (no separate matrix/log files). No product code/tests/CSV/`out`/integration changes.
   219	
   220	T-001.5 blindspot review (2026-06-02): created `docs/review-packets/T-001.5-standards-blindspot-review.md`.
   221	
   222	T-001 ground-rules audit (2026-06-02): created `docs/audits/T-001-ground-rules-audit.md`; corrected git-state wording in `PROJECT_STATE.md` / `CURRENT_TASK.md` / `HANDOFF.md`; updated `docs/task-log.md` + `docs/implementation-journal.md`. No product code/tests/CSV/integration changes.
   223	
   224	T-001 Codex P2 fix pass (2026-06-02):
   225	
   226	- Updated: `scripts/run.py` (preserve history; `--fresh`), `scripts/pipeline.py` (reject fractional ints; unique model IDs), `scripts/guardrail.py` (prose state_mismatch), `tests/test_t001.py` (+P2 tests), `tests/fixtures/guardrail_cases.json`; plus `CURRENT_TASK.md`, `HANDOFF.md`, `PROJECT_STATE.md`, `docs/task-log.md`, `docs/implementation-journal.md`. Regenerated `out/`.
   227	
   228	Earlier T-001 implementation (2026-06-02): created `scripts/*` (5), `tests/*`, `tests/fixtures/*` (3); generated `out/*` (4). Full per-step history (governance review → reconciliation → OS setup → OS cleanup → T-001 planning → revision → implementation → doc-sync → P2 fixes): see `docs/task-log.md`.
   229	
   230	## Open Questions
   231	
   232	See `docs/open-questions.md`.
   233	
   234	The prior meta-questions in `docs/plan-reconciliation.md` (scope, V1 shape, rules location, naming, exit condition) are **resolved** — the owner gave GO and T-001 shipped. Genuinely still open:
   235	
   236	- Definition of "done" / audience for the project overall (the reconciliation set a DoD for the *V1 slice*, not the portfolio goal).
   237	- The remaining hygiene/decision follow-ups (`out/` log policy; enforcement-hooks decision). *(Eval-first T-002 ordering is now ratified in `docs/decision-log.md`.)*
   238	
   239	Resolved earlier: as-of date set to **June 1, 2026** (default, owner may change); Git initialized; rules location is `RULES.md`; **GO/NO-GO on the reconciliation (GO — T-001 built)**.
   240	
   241	## Claude Suggestions Before Execution
   242	
   243	Honest answers, per the project's "be critical, do not flatter" standard.
   244	
   245	> Update (2026-06-01 cleanup): several suggestions below are now actioned — the secrets rule (`RULES.md` §11), commit-hygiene rule (§12), and lightweight-vs-full workflow rule (§13) are in `RULES.md`; Git is initialized; the as-of date is set to June 1, 2026; AGENTS.md and README.md are reconciled. The remaining open items are workflow discipline (don't over-document small slices) and the project-level definition of done.
   246	
   247	- **Are any rules missing?** Two worth adding: (1) a **secrets rule** — no secrets in code, docs, prompts, logs, Sheets, or n8n nodes (currently only implied); (2) a **commit-hygiene rule** — what may be committed and when, with the human approving commits. Otherwise the 20 rules cover enough; the gap is enforcement, not coverage.
   248	- **Are any files unnecessary?** For a pre-build, single-owner project, this is a lot of scaffolding for a 20-row CSV. `implementation-journal.md` and `decision-log.md` overlap (both capture "why"); `task-log.md` overlaps with the journal for small entries; the four prompt templates could be one file. None are harmful, but several will drift if maintained separately. Treat journal + decision-log + task-log as one habit with three views; merge the prompt templates if upkeep slips.
   249	- **Is the workflow too heavy?** For high-risk stages (live sends, Supabase writes) it is appropriate. For the offline thin slice it is heavier than ~50 lines of deterministic Python warrants. Right-size it (see split below).
   250	- **Is the handoff system clear?** Yes — `CURRENT_TASK.md` + `HANDOFF.md` + the standing procedures are the strongest part of this setup and directly solve the multi-account continuity problem.
   251	- **Is the dual-model Codex usage practical?** Yes, and now accurate (verified against installed plugin v1.0.4). The one real footgun is `/codex:rescue` editing files by default — flagged in three places. Keep the review-gate off by default as specified.
   252	- **Is anything likely to slow down flow state?** The five-file documentation burden in the definition of done. Mitigation: for small offline slices, make only `task-log.md` + `HANDOFF.md` mandatory; journal/decision-log only when something meaningful or architectural happened.
   253	- **What should be simplified before building?** (1) Adopt a **lightweight vs full workflow split**: full loop (plan review + changed-files review + journal + decision-log + checklist) for risky/integration work; lightweight loop (build + one Codex review + task-log) for offline deterministic work. (2) Confirm the as-of date (proposed 2026-06-01) so T-001 is not blocked mid-task. (3) Optionally fold the four prompt templates into one. Add no more process before the first slice exists.
   254	- **What is the safest first execution task?** T-001: write `docs/v1-data-dictionary.md` and a short slice plan (no code), then get a Codex adversarial review and human approval. It is zero-risk and forces the data decisions everything else depends on. Implementation (ingest/normalize → `merchants_v1.csv` with tests, fully offline, original CSV untouched) follows as a separate task.
   255	
   256	## Handoff Notes
   257	
   258	Next session: see `HANDOFF.md` (always the canonical handoff; includes the paste-ready resume prompt). **Re-derive git state live** — no SHA in this section, by design (the git line is tracked only under Current Phase above; it has drifted 4×). Re-run `python3 -m unittest tests.test_t001 tests.test_t002` (35/35) and `python3 scripts/eval.py` (PASS) to reconfirm green. **Goal is ratified (2026-06-11)** — do not reopen it without an owner pivot. T-003 plan = **draft 2 (2026-06-12)**; next work = Codex gate (smoke-test the seat first — no cap-tracking per owner order; surface raw errors verbatim and stop if dead) → apply findings → owner GO → build T-003 (S1–S5). **Do not build before the gate runs.** Do not start Gemini until the v2 baseline + secrets hook exist. Source CSV and `out/` must stay untouched.
   259	

codex
I’ve completed the mandatory orientation pass. Active phase is exactly this plan stage: owner-directed agentic extension, no build before plan cross-check and owner GO. I’m now reading the plan with line numbers, then I’ll inspect only the referenced code contracts that bear on the claimed acceptance criteria.
exec
/bin/zsh -lc 'nl -ba /Users/sharan_98/.agents/skills/codex-specialist-skills/17-agent-operations-governor/SKILL.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc 'nl -ba /Users/sharan_98/.agents/skills/codex-specialist-skills/18-anti-ai-slop-authenticity-reviewer/SKILL.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc 'nl -ba /Users/sharan_98/.agents/skills/codex-specialist-skills/19-acceptance-evaluation-architect/SKILL.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	---
     2	name: acceptance-evaluation-architect
     3	description: Use to turn vague quality goals into measurable acceptance criteria, validation strategy, tests, evals, scoring rubrics, pass/fail checks, and definition of done before implementation.
     4	---
     5	
     6	# Acceptance Evaluation Architect
     7	
     8	## Mission
     9	
    10	Define what “done” and “high quality” mean for the task before implementation or final delivery.
    11	
    12	This skill prevents agents from optimizing for the wrong target. It turns broad goals into measurable acceptance criteria and validation gates.
    13	
    14	## Strict evidence rule
    15	
    16	Do not rely on training knowledge alone.
    17	
    18	Acceptance criteria should be grounded in the user’s request, repo evidence, product/workflow context, official docs, current sources, and relevant domain standards when needed.
    19	
    20	## Non-negotiable nuance rule
    21	
    22	Understand quality nuance deeply. Different tasks need different success criteria. Do not use the same generic validation checklist for every task.
    23	
    24	## Evidence-based ranking and decision rule
    25	
    26	If multiple evaluation strategies are possible, choose the one that best proves the real goal with the least unnecessary burden.
    27	
    28	## Use this skill when
    29	
    30	Use this skill for:
    31	
    32	- Complex implementation.
    33	- UI/design work.
    34	- AI/ML or agent workflows.
    35	- Automation workflows.
    36	- Backend/data changes.
    37	- Security-sensitive work.
    38	- Performance-sensitive work.
    39	- Documentation that must be accurate.
    40	- Any “highest quality” or “best possible” request.
    41	
    42	## Process
    43	
    44	1. Define the real goal.
    45	2. Define what success means.
    46	3. Define what failure means.
    47	4. Identify measurable criteria.
    48	5. Identify edge cases.
    49	6. Identify relevant validations.
    50	7. Define pass/fail gates.
    51	8. Define evidence required before calling it done.
    52	9. Define what remains acceptable risk.
    53	10. Hand off criteria to implementation and quality review.
    54	
    55	## Acceptance criteria categories
    56	
    57	Use relevant categories:
    58	
    59	- Functional correctness.
    60	- Repo consistency.
    61	- UX/design quality.
    62	- Accessibility.
    63	- Security/privacy.
    64	- Performance.
    65	- Reliability.
    66	- Data integrity.
    67	- AI/ML quality.
    68	- Workflow reliability.
    69	- Documentation accuracy.
    70	- Maintainability.
    71	- Traceability.
    72	- Cost efficiency.
    73	
    74	## Output format
    75	
    76	```text
    77	Acceptance criteria:
    78	- Goal:
    79	- Must pass:
    80	- Must not happen:
    81	- Edge cases:
    82	- Validation required:
    83	- Evidence required:
    84	- Pass/fail decision:
    85	- Remaining acceptable risk:
    86	```
    87	
    88	## Final checklist
    89	
    90	Before finalizing:
    91	
    92	- Is “done” measurable?
    93	- Are criteria specific?
    94	- Are validations realistic?
    95	- Are edge cases included?
    96	- Is the quality bar appropriate for the task?

 succeeded in 0ms:
     1	---
     2	name: agent-operations-governor
     3	description: Use to ensure multiple agents/skills stay coordinated, goal-aligned, non-derailed, non-duplicative, efficient, and effective throughout a task.
     4	---
     5	
     6	# Agent Operations Governor
     7	
     8	## Mission
     9	
    10	Keep multi-agent work coordinated, focused, coherent, and effective.
    11	
    12	This skill prevents derailment, excessive agent activation, duplicated work, conflicting recommendations, vague outputs, runaway planning, and loss of the original user goal.
    13	
    14	## Strict evidence rule
    15	
    16	Do not rely on training knowledge alone.
    17	
    18	Governance decisions should be grounded in:
    19	1. The user’s actual request.
    20	2. Current task state.
    21	3. Active specialist outputs.
    22	4. Repo evidence and validation results.
    23	5. Official/current sources when tool or workflow behavior matters.
    24	
    25	Do not invent progress, validations, files, commands, agent outputs, or evidence.
    26	
    27	## Non-negotiable nuance rule
    28	
    29	Understand the nuance of orchestration.
    30	
    31	More agents does not automatically mean better output. The right specialists must be activated at the right time, with clear roles, no duplicated work, and one coherent final synthesis.
    32	
    33	## Evidence-based ranking and decision rule
    34	
    35	When agents disagree or multiple paths exist, rank the recommendations using evidence and take a call.
    36	
    37	Use:
    38	- User goal.
    39	- Evidence strength.
    40	- Repo fit.
    41	- Safety.
    42	- Maintainability.
    43	- Validation.
    44	- Cost.
    45	- Complexity.
    46	- Long-term risk.
    47	
    48	## Use this skill when
    49	
    50	Use this skill when:
    51	
    52	- Multiple agents are active.
    53	- A task is complex, long-running, cross-domain, or high-impact.
    54	- There is risk of derailment.
    55	- Agents may overlap or conflict.
    56	- The output is becoming too long or fragmented.
    57	- The work needs staged coordination.
    58	- The user wants highest quality without lazy work.
    59	- A final coherent plan or answer must synthesize several perspectives.
    60	
    61	## Do not use this skill heavily when
    62	
    63	Do not use it heavily when:
    64	
    65	- The task is simple and one agent is enough.
    66	- Orchestration would add overhead without quality improvement.
    67	- The user wants a very short answer.
    68	
    69	## Governance responsibilities
    70	
    71	Track:
    72	
    73	- Original user goal.
    74	- Current task stage.
    75	- Active specialists.
    76	- Why each specialist is active.
    77	- What each specialist contributes.
    78	- Decisions made.
    79	- Evidence used.
    80	- Open risks.
    81	- Validation status.
    82	- Remaining work.
    83	- Final output coherence.
    84	
    85	## Anti-derailment rules
    86	
    87	Prevent:
    88	
    89	- Losing the original goal.
    90	- Over-activating agents.
    91	- Under-activating needed specialists.
    92	- Duplicated checklists.
    93	- Conflicting recommendations left unresolved.
    94	- Excessive research after enough evidence exists.
    95	- Too much planning without execution.
    96	- Too much implementation without validation.
    97	- Generic final synthesis.
    98	- Unverified claims.
    99	- Bloated final response.
   100	- Agent outputs that do not connect to the task.
   101	
   102	## Multi-agent workflow
   103	
   104	### 1. Route
   105	
   106	Decide which agents are needed.
   107	
   108	### 2. Assign
   109	
   110	Give each agent a clear job.
   111	
   112	### 3. Bound
   113	
   114	Set scope and stop condition for each agent.
   115	
   116	### 4. Collect
   117	
   118	Collect only the useful outputs.
   119	
   120	### 5. Resolve
   121	
   122	Resolve conflicts by evidence strength and user goal.
   123	
   124	### 6. Synthesize
   125	
   126	Produce one coherent recommendation, plan, implementation, or final answer.
   127	
   128	### 7. Validate
   129	
   130	Use the relevant validation layers.
   131	
   132	### 8. Finalize
   133	
   134	Keep the final answer concise and review-ready.
   135	
   136	## Agent status ledger
   137	
   138	For complex work, maintain internally:
   139	
   140	```text
   141	Goal:
   142	Active agents:
   143	Agent roles:
   144	Evidence:
   145	Decisions:
   146	Risks:
   147	Validation:
   148	Open items:
   149	Final synthesis:
   150	```
   151	
   152	## Conflict resolution
   153	
   154	If agents disagree, decide based on:
   155	
   156	1. Safety and user intent.
   157	2. Strongest evidence.
   158	3. Repo fit.
   159	4. Current official docs.
   160	5. Simplicity and maintainability.
   161	6. Validation results.
   162	7. Long-term risk.
   163	8. Cost and complexity.
   164	
   165	Do not present unresolved disagreement unless the user must decide.
   166	
   167	## Output format
   168	
   169	```text
   170	Agent governance summary:
   171	- Active agents:
   172	- Why:
   173	- Key findings:
   174	- Conflicts resolved:
   175	- Decision:
   176	- Validation:
   177	- Remaining risks:
   178	```
   179	
   180	Usually keep this internal unless the user asks or the task is complex.
   181	
   182	## Final checklist
   183	
   184	Before finalizing:
   185	
   186	- Are the right agents active?
   187	- Are unnecessary agents excluded?
   188	- Is the original goal preserved?
   189	- Are conflicts resolved?
   190	- Is the final output coherent?
   191	- Is validation clear?
   192	- Is the response concise?

 succeeded in 0ms:
     1	---
     2	name: anti-ai-slop-authenticity-reviewer
     3	description: Use to remove generic AI-sounding output, lazy reasoning, template phrasing, fake confidence, shallow design, vague strategy, over-polished prose, and run-of-the-mill implementation. Ensures output feels human, specific, original, evidence-backed, and context-aware.
     4	---
     5	
     6	# Anti-AI Slop Authenticity Reviewer
     7	
     8	## Mission
     9	
    10	Detect and remove “AI slop” from code, design, writing, strategy, documentation, workflows, and recommendations.
    11	
    12	This skill ensures output does not feel generic, lazy, over-templated, fake-polished, shallow, first-draft, or disconnected from the real context.
    13	
    14	## Strict evidence rule
    15	
    16	Do not rely on training knowledge alone.
    17	
    18	Authenticity and quality must be grounded in:
    19	1. The user’s actual goal and context.
    20	2. Current repo evidence where relevant.
    21	3. Official/current sources when claims, tools, APIs, or frameworks matter.
    22	4. Real examples, design systems, maintained repos, standards, or domain references when relevant.
    23	
    24	Do not make polished-sounding but unsupported claims.
    25	
    26	## Non-negotiable nuance rule
    27	
    28	Understand nuance deeply.
    29	
    30	AI slop often looks correct at a glance but fails in nuance: weak hierarchy, vague copy, generic architecture, shallow trade-offs, missing edge cases, fake metrics, invented APIs, ungrounded “best practices,” or template output that ignores the user’s situation.
    31	
    32	## Evidence-based ranking and decision rule
    33	
    34	When multiple rewrites, designs, implementations, or recommendations are possible, choose the one that is most specific, grounded, useful, maintainable, and context-fit.
    35	
    36	Do not choose the fanciest option. Choose the strongest real option.
    37	
    38	## Use this skill when
    39	
    40	Use this skill when:
    41	
    42	- The user asks for non-generic, premium, deep, highest-quality, human-quality, or not run-of-the-mill output.
    43	- The output risks sounding like AI.
    44	- The task involves design, writing, portfolio content, documentation, product ideas, strategy, prompts, architecture, automation workflows, or recommendations.
    45	- A final answer needs polish without fake polish.
    46	- The output has too many vague best practices.
    47	- The output lacks concrete evidence, specificity, or real-world nuance.
    48	
    49	## Do not use this skill heavily when
    50	
    51	Do not use it heavily when:
    52	
    53	- The task is a tiny code fix.
    54	- The output is purely mechanical and already grounded.
    55	- The user wants raw technical output only.
    56	
    57	## AI slop signals
    58	
    59	Detect and fix:
    60	
    61	- Generic “best practices” not tied to context.
    62	- Vague phrases like “seamless,” “robust,” “leverage,” “streamline,” without specifics.
    63	- Overuse of polished but empty wording.
    64	- Excessive lists with no decision.
    65	- “It depends” without ranking or recommendation.
    66	- Invented facts, APIs, metrics, or examples.
    67	- Fake confidence.
    68	- Template structure that ignores the task.
    69	- Over-designed UI patterns.
    70	- Generic cards/gradients/glassmorphism.
    71	- Shallow architecture diagrams.
    72	- Missing edge cases.
    73	- Missing validation.
    74	- Missing trade-offs.
    75	- Repeated phrases.
    76	- Over-explaining obvious points.
    77	- Under-explaining critical details.
    78	- Output that could apply to any project.
    79	- First-draft language.
    80	- No clear point of view.
    81	
    82	## Review process
    83	
    84	### 1. Check context fit
    85	
    86	Ask:
    87	
    88	- Does this output clearly belong to this user, repo, product, workflow, or task?
    89	- Or could it be pasted into any answer?
    90	
    91	### 2. Check specificity
    92	
    93	Ask:
    94	
    95	- Are claims concrete?
    96	- Are examples specific?
    97	- Are recommendations actionable?
    98	- Are trade-offs real?
    99	- Are risks named clearly?
   100	
   101	### 3. Check evidence
   102	
   103	Ask:
   104	
   105	- What supports this?
   106	- Is it repo-backed?
   107	- Is it source-backed?
   108	- Is it an assumption?
   109	- Is anything invented?
   110	
   111	### 4. Check originality
   112	
   113	Ask:
   114	
   115	- Is there a non-obvious insight?
   116	- Is the recommendation stronger than a generic answer?
   117	- Did it avoid obvious filler?
   118	- Did it make a clear call?
   119	
   120	### 5. Check human tone
   121	
   122	Ask:
   123	
   124	- Is the language natural?
   125	- Is it concise but complete?
   126	- Does it sound like a senior practitioner?
   127	- Is it free of forced polish?
   128	- Is it direct?
   129	
   130	### 6. Check practical usefulness
   131	
   132	Ask:
   133	
   134	- Can the user act on it?
   135	- Does it help implementation?
   136	- Does it prevent a real risk?
   137	- Does it improve quality?
   138	
   139	## Rewrite rules
   140	
   141	When removing AI slop:
   142	
   143	- Replace vague claims with concrete observations.
   144	- Replace generic lists with ranked recommendations.
   145	- Replace fake certainty with verified facts and assumptions.
   146	- Replace buzzwords with plain specific language.
   147	- Replace broad advice with task-specific guidance.
   148	- Remove filler.
   149	- Keep useful technical terms.
   150	- Keep the user’s intent.
   151	- Keep the answer concise.
   152	- Do not over-sanitize personality if a human voice helps.
   153	
   154	## Design-specific anti-slop
   155	
   156	Reject:
   157	
   158	- Generic SaaS dashboards.
   159	- Random gradient/glow backgrounds.
   160	- Meaningless icon cards.
   161	- Copy that sounds like placeholder marketing.
   162	- UI without real states.
   163	- Layouts without hierarchy.
   164	- Trendy visuals without product purpose.
   165	
   166	Prefer:
   167	
   168	- Clear hierarchy.
   169	- Strong information architecture.
   170	- Real states.
   171	- Intentional spacing.
   172	- Minimal visual language.
   173	- Product-specific decisions.
   174	- Premium restraint.
   175	
   176	## Code-specific anti-slop
   177	
   178	Reject:
   179	
   180	- Unnecessary abstractions.
   181	- Placeholder logic.
   182	- Broad try/catch with silent failure.
   183	- Fake fallbacks.
   184	- Unused helpers.
   185	- Over-engineered patterns.
   186	- Copy-pasted code that does not fit repo.
   187	- Unverified API use.
   188	- Lack of tests for changed behavior.
   189	
   190	Prefer:
   191	
   192	- Small root-cause fixes.
   193	- Existing repo patterns.
   194	- Clear types.
   195	- Explicit validation.
   196	- Practical tests.
   197	- Maintainable structure.
   198	
   199	## Output format
   200	
   201	```text
   202	Anti-AI slop review:
   203	- Generic/AI-sounding parts found:
   204	- Context gaps:
   205	- Unsupported claims:
   206	- Specific improvements made:
   207	- Final quality judgment:
   208	```
   209	
   210	Usually keep this internal and provide only the improved final output unless the user asks for the review.
   211	
   212	## Final checklist
   213	
   214	Before finalizing:
   215	
   216	- Is the output specific to the task?
   217	- Is it evidence-backed?
   218	- Is it free of filler?
   219	- Does it avoid fake confidence?
   220	- Does it make a clear call?
   221	- Does it sound human and senior?
   222	- Is it actionable?
   223	- Is it not first-draft?

exec
/bin/zsh -lc 'nl -ba /Users/sharan_98/.agents/skills/codex-specialist-skills/20-deep-research-agent/SKILL.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	---
     2	name: deep-research-agent
     3	description: Use for rigorous, evidence-backed research across official docs, public GitHub repos, papers, standards, benchmarks, design references, forums, blogs, product examples, market/competitor sources, and current best practices. Synthesizes sources, resolves contradictions, ranks evidence, and produces research-grade conclusions.
     4	---
     5	
     6	# Deep Research Agent
     7	
     8	## Mission
     9	
    10	Conduct rigorous, source-backed research that is current, nuanced, evidence-ranked, and decision-ready.
    11	
    12	This skill prevents shallow browsing, training-knowledge-only answers, cherry-picked sources, outdated assumptions, generic “best practices,” and unsupported recommendations.
    13	
    14	Use this skill when the task needs real research before strategy, architecture, design, implementation, agent creation, workflow design, product decisions, or technical recommendations.
    15	
    16	## Strict evidence rule
    17	
    18	Do not rely on training knowledge alone.
    19	
    20	Ground research in the strongest available evidence:
    21	1. Current repo evidence when the task touches an existing codebase.
    22	2. Installed package behavior, lockfiles, type definitions, configs, scripts, tests, logs, and existing code.
    23	3. Official documentation, SDK/API docs, changelogs, source code, standards, release notes, and official examples.
    24	4. Maintained public GitHub repositories and reputable open-source implementations.
    25	5. Research papers, model cards, eval guides, benchmark references, standards, security guidance, design systems, accessibility guidance, and regulatory/compliance sources when relevant.
    26	6. Real product examples, product teardowns, design galleries, Figma/community references, practitioner case studies, engineering blogs, forums, Reddit, Stack Overflow, and community discussions as secondary context.
    27	
    28	If current external access is unavailable, say what could not be verified and rely only on local/repo evidence.
    29	
    30	Never invent sources, citations, APIs, model capabilities, benchmarks, docs, GitHub repos, quotes, metrics, product behavior, or tool capabilities.
    31	
    32	## Non-negotiable nuance rule
    33	
    34	Understand nuance deeply across all relevant spheres.
    35	
    36	Do not treat research as link collection. Research must extract meaning, conflicts, patterns, trade-offs, and implications.
    37	
    38	For every research task, identify:
    39	- What experts would check first.
    40	- What usually breaks in real use.
    41	- What looks true but may be outdated or misleading.
    42	- What claims require official sources.
    43	- What claims require practitioner evidence.
    44	- What sources disagree.
    45	- What incentives or context may bias sources.
    46	- What evidence is missing.
    47	- What should change the recommendation.
    48	- What is hype versus current proven practice.
    49	
    50	## Evidence-based ranking and decision rule
    51	
    52	Rank evidence and take a call when enough evidence exists.
    53	
    54	Do not end with a neutral pile of sources. Convert evidence into a ranked recommendation.
    55	
    56	Rank by:
    57	- Authority.
    58	- Recency.
    59	- Version match.
    60	- Direct relevance.
    61	- Reproducibility.
    62	- Maintenance quality.
    63	- Production usage.
    64	- Methodological quality.
    65	- Compatibility with the user’s repo, product, tools, constraints, and goal.
    66	- Risk reduction.
    67	- Practical usefulness.
    68	
    69	When sources conflict:
    70	1. Prefer official docs for documented behavior.
    71	2. Prefer installed/repo behavior for local implementation.
    72	3. Prefer source code/changelogs over blogs for version-specific technical facts.
    73	4. Prefer reputable papers/benchmarks for research claims, but check limitations.
    74	5. Prefer maintained GitHub examples over abandoned ones.
    75	6. Use forums/Reddit/Stack Overflow to identify real-world friction, not as primary truth.
    76	7. State the disagreement and choose the most credible interpretation.
    77	
    78	## Automatic multi-specialist activation rule
    79	
    80	Use this skill with other specialists when research informs execution.
    81	
    82	Common pairings:
    83	- `source-reference-scout`: to find and evaluate public references.
    84	- `evidence-based-decision-ranker`: to rank options and take a call.
    85	- `design-engineer`: for design/product research.
    86	- `frontend-design-engineer`: for frontend/library/framework research.
    87	- `backend-api-data-engineer`: for backend/API/database research.
    88	- `ai-ml-agent-engineer`: for AI/ML, RAG, agent, eval, model, or provider research.
    89	- `automation-workflow-architect`: for n8n/workflow/tool automation research.
    90	- `github-devops-engineer`: for CI/CD, GitHub Actions, deployment, and DevOps research.
    91	- `security-reviewer`: for security, privacy, compliance, auth, dependency, or risk research.
    92	- `compliance-license-ip-reviewer` if available or needed for licensing/IP/compliance.
    93	- `quality-reviewer`: before finalizing important research.
    94	- `multi-layer-validation-traceability`: when traceability and auditability matter.
    95	
    96	Do not activate every specialist mechanically. Use the right specialist set based on the research question.
    97	
    98	## Use this skill when
    99	
   100	Use this skill for:
   101	
   102	- Current best-practice research.
   103	- Competitor or market research.
   104	- Technical architecture research.
   105	- Framework/library/tool selection.
   106	- AI/ML model/provider/agent research.
   107	- RAG/evals/structured output research.
   108	- Public GitHub repo analysis.
   109	- Design pattern or design-system research.
   110	- Frontend/backend implementation pattern research.
   111	- n8n/workflow automation research.
   112	- GitHub Actions/CI/CD/DevOps research.
   113	- Security/privacy/compliance research.
   114	- Open-source license/IP risk research.
   115	- Product idea validation.
   116	- “What is working now?”
   117	- “Use latest sources.”
   118	- “No training knowledge.”
   119	- “Deep research.”
   120	- “Rank the best approaches.”
   121	- “Find what others are doing.”
   122	- “Check official docs, GitHub, forums, Reddit, papers, benchmarks.”
   123	
   124	## Do not use this skill heavily when
   125	
   126	Do not use this skill heavily when:
   127	
   128	- The answer is already fully available from the repo.
   129	- The task is tiny and low-risk.
   130	- The user explicitly asks not to browse or research.
   131	- External sources would not change the answer.
   132	- The work is time-sensitive inside implementation and enough evidence has already been gathered.
   133	
   134	## Research workflow
   135	
   136	### 1. Define the research question
   137	
   138	Clarify:
   139	
   140	- What decision must this research support?
   141	- What would a good answer enable?
   142	- What does “best” mean in this context?
   143	- What sources are likely authoritative?
   144	- What must be current?
   145	- What can rely on stable fundamentals?
   146	- What would change the recommendation?
   147	
   148	### 2. Build the source plan
   149	
   150	Select source types based on the question:
   151	
   152	```text
   153	Official behavior:
   154	- Official docs
   155	- API docs
   156	- SDK docs
   157	- Changelogs
   158	- Release notes
   159	- Source code
   160	
   161	Implementation pattern:
   162	- Current repo evidence
   163	- Maintained GitHub repos
   164	- Official examples
   165	- High-quality open-source implementations
   166	
   167	AI/ML:
   168	- Provider docs
   169	- Model cards
   170	- Papers
   171	- Benchmarks
   172	- Eval guides
   173	- SDK source
   174	- Maintained agent/RAG repos
   175	
   176	Design:
   177	- Design systems
   178	- Accessibility guidance
   179	- Product examples
   180	- Pattern libraries
   181	- Figma/community references
   182	- Product teardowns
   183	
   184	Security/compliance:
   185	- Official security docs
   186	- OWASP
   187	- Provider security guidance
   188	- Advisories
   189	- License text
   190	- Regulatory/compliance sources
   191	
   192	Operational/workflow:
   193	- Official tool docs
   194	- n8n/GitHub/cloud docs
   195	- Workflow examples
   196	- Community friction reports
   197	```
   198	
   199	### 3. Search deeply but narrowly
   200	
   201	Search with targeted queries.
   202	
   203	Avoid broad, low-signal browsing. Prefer query clusters:
   204	
   205	- Official docs query.
   206	- Changelog/version query.
   207	- GitHub implementation query.
   208	- Known issue/friction query.
   209	- Benchmark/eval query.
   210	- Practitioner/forum query.
   211	- Design/reference query if applicable.
   212	- Security/compliance query if applicable.
   213	
   214	### 4. Evaluate source quality
   215	
   216	For each important source, evaluate:
   217	
   218	- Who published it?
   219	- Is it official?
   220	- Is it current?
   221	- Is it version-matched?
   222	- Is it maintained?
   223	- Is it directly relevant?
   224	- Does it show real implementation?
   225	- Does it contain data, code, tests, examples, or just opinion?
   226	- Does it have bias or incentive?
   227	- Does it conflict with stronger sources?
   228	- Does it apply to the user’s stack and constraints?
   229	
   230	### 5. Extract findings
   231	
   232	Do not summarize sources mechanically. Extract:
   233	
   234	- Facts.
   235	- Patterns.
   236	- Constraints.
   237	- Risks.
   238	- Trade-offs.
   239	- Implementation implications.
   240	- Design implications.
   241	- Failure modes.
   242	- Cost implications.
   243	- Security implications.
   244	- Maintenance implications.
   245	- What to copy/adapt/reject.
   246	- What evidence is still missing.
   247	
   248	### 6. Resolve contradictions
   249	
   250	If sources disagree:
   251	
   252	- State the disagreement.
   253	- Identify likely reason: version difference, context difference, outdated source, opinion vs official behavior, edge-case difference, marketing claim vs implementation reality.
   254	- Choose the stronger source.
   255	- Explain what would verify the issue definitively.
   256	
   257	### 7. Synthesize
   258	
   259	Turn research into:
   260	
   261	- Ranked options.
   262	- Recommended approach.
   263	- Rejected approaches.
   264	- Evidence-backed rationale.
   265	- Risks.
   266	- Validation plan.
   267	- Next steps.
   268	
   269	### 8. Validate the research output
   270	
   271	Check:
   272	
   273	- Are key factual claims source-backed?
   274	- Are sources current enough?
   275	- Are official sources used for official behavior?
   276	- Are public examples maintained and compatible?
   277	- Are weak sources treated as weak?
   278	- Are assumptions labeled?
   279	- Is the final recommendation traceable?
   280	
   281	## Evidence matrix
   282	
   283	For complex research, build an internal evidence matrix:
   284	
   285	```text
   286	Claim:
   287	Source:
   288	Source type:
   289	Authority:
   290	Recency:
   291	Relevance:
   292	Evidence strength:
   293	Supports:
   294	Contradicts:
   295	Implication:
   296	Confidence:
   297	```
   298	
   299	Only expose the full matrix if useful. Otherwise summarize the highest-impact evidence.
   300	
   301	## Research output formats
   302	
   303	### Standard research brief
   304	
   305	```text
   306	Research brief:
   307	- Question:
   308	- Bottom line:
   309	- Best recommendation:
   310	- Evidence summary:
   311	- Ranked options:
   312	- Why the top option wins:
   313	- Rejected options:
   314	- Risks:
   315	- Validation plan:
   316	- What remains uncertain:
   317	```
   318	
   319	### Technical selection brief
   320	
   321	```text
   322	Technical selection:
   323	- Decision:
   324	- Options compared:
   325	- Best choice:
   326	- Why it wins:
   327	- Version/source evidence:
   328	- Implementation implications:
   329	- Risks:
   330	- Validation:
   331	```
   332	
   333	### Design research brief
   334	
   335	```text
   336	Design research:
   337	- Product/design goal:
   338	- References checked:
   339	- Patterns that work:
   340	- Patterns to avoid:
   341	- Recommended design direction:
   342	- Why it fits:
   343	- Accessibility/UX risks:
   344	- Handoff notes:
   345	```
   346	
   347	### AI/ML research brief
   348	
   349	```text
   350	AI/ML research:
   351	- Goal:
   352	- Sources checked:
   353	- Provider/model behavior:
   354	- Options compared:
   355	- Recommended approach:
   356	- Eval plan:
   357	- Cost/latency risks:
   358	- Safety/privacy risks:
   359	- Unknowns:
   360	```
   361	
   362	### Market/product research brief
   363	
   364	```text
   365	Product research:
   366	- Question:
   367	- Current landscape:
   368	- Competitor/reference patterns:
   369	- User/problem evidence:
   370	- Opportunity:
   371	- Weakness/risk:
   372	- Best pivot or recommendation:
   373	- Confidence:
   374	```
   375	
   376	## Anti-patterns
   377	
   378	Avoid:
   379	
   380	- Listing links without synthesis.
   381	- Using outdated tutorials as truth.
   382	- Treating GitHub stars as proof of quality.
   383	- Treating Reddit as primary evidence.
   384	- Ignoring official docs.
   385	- Ignoring installed package versions.
   386	- Cherry-picking sources that support a desired conclusion.
   387	- Hiding contradictions.
   388	- Making a recommendation without ranking options.
   389	- Giving generic “best practices.”
   390	- Over-researching after enough evidence exists.
   391	- Claiming certainty when evidence is weak.
   392	
   393	## Final checklist
   394	
   395	Before finalizing research:
   396	
   397	- Did I define the decision the research supports?
   398	- Did I check official sources where needed?
   399	- Did I check version/currentness?
   400	- Did I include maintained public examples where useful?
   401	- Did I evaluate source quality?
   402	- Did I resolve contradictions?
   403	- Did I rank options?
   404	- Did I take a clear call?
   405	- Did I state assumptions and uncertainty?
   406	- Did I provide validation steps?
   407	- Is the output traceable and decision-ready?

codex
I’m using the acceptance-evaluation, agent-operations, anti-slop, and deep-research review lenses here because this is an agent/eval plan, not a code change. External web research is not useful for the narrow defects unless the plan makes a current platform claim; the decisive evidence is in the plan, base plan, rules, and local engine contracts.
exec
/bin/zsh -lc 'nl -ba docs/plan-agentic-extension.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc 'nl -ba docs/research/agentic-extension-research-2026-07.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	# Agentic Extension — Live Research Digest (as of 2026-07-06)
     2	
     3	**Why this exists:** the owner's 2026-07-06 directive (decision-log, verbatim rows) extends the program: the showcase target is the **applied-AI / agentic-systems / AI-automation** proficiency companies currently hire for — agents, multi-agent systems, AI workflows, integrations (Slack, email, MCP, n8n/Zapier-class), built on frontier models — explicitly NOT model development/training, and NOT no-code-only toy use. Target roles named by the owner: AI Engineer, AI Specialist, Applied AI Engineer, AI Automation Specialist. This digest grounds the goal re-fix in live, dated sources per the standing rule (enterprise claims are researched, never memory-based).
     4	
     5	**Provenance:** the delegated `research-specialist` subagent died on the seat limit (raw verbatim: "You've hit your session limit · resets 1:30pm (America/New_York)"); the owner's `resume` confirmed continuation and the pass converted INLINE (NO-WAIT precedent) — 6 live WebSearch sweeps, 2026-07-06. One transient harness classifier error on one search (retried clean). Community/vendor blog figures below are FIELD SIGNALS unless marked official; load-bearing claims carry ≥2 independent sources or are labeled.
     6	
     7	---
     8	
     9	## 1. Terminology + roles — the owner's targeting is validated verbatim
    10	
    11	- **"AI Engineer" is the fastest-growing US job title for the second year running** — ~75,000 of LinkedIn's ~639,000 new AI postings; commonly relabeled **"Applied AI," "GenAI," or "LLM Engineer."** (herohunt.ai 2026 rankings, practitioner tier; corroborated by qureos hiring guide, July 2026.)
    12	- **Agentic-AI job postings grew ~280% YoY to ~90,000 US listings in 2026** — these roles "build autonomous systems that plan, call tools, hold state across steps." (herohunt.ai / agentic-jobs trackers, practitioner tier — treat magnitude as directional, trend as solid across sources.)
    13	- **"AI Automation Specialist"** is a real, distinct lane: builds AI-driven workflows integrating enterprise tools/APIs — "workflows too complex for a marketer with Zapier, but too small for a full-time engineering team" (mraiwala.com 2026 role comparison, practitioner tier). This matches the owner's n8n/Zapier/MCP framing exactly.
    14	- **The product category is a "vertical AI agent"** — a domain-specific agentic system (Lindy/8seneca/ACTGSYS category explainers, 2026; vendor/practitioner tier).
    15	- **Applied-vs-research split confirmed:** "Most companies don't actually need custom models; they need to use existing models well — foundation models cover ~80% of use cases" (qureos hiring guide 2026). The owner's "not developing or training LLMs" boundary is exactly where the demand is.
    16	
    17	**Verdict:** what the owner described is professionally called **agent engineering / applied AI engineering**, building **agentic AI systems (vertical AI agents) and AI workflow automations**. The named tools (Claude Code/Codex, n8n, MCP, Zapier) are recognized floor-not-ceiling instruments of that lane.
    18	
    19	## 2. Architecture patterns companies ship (official guidance, dated)
    20	
    21	- **Anthropic, "Building Effective AI Agents" (+ 2026 architecture-patterns PDF, official):** start simple; add agency only when flexibility outweighs latency/cost/error-compounding; **workflows (deterministic orchestration) vs agents (model-directed) is the first design decision**; multi-agent systems cost ~10–15× tokens and "take months to get right" — use them only where justified; modular design so capabilities evolve without redesign.
    22	- **2026 trend (Anthropic agentic-coding trends report, official):** value shifts to **"digital assembly lines" — human-guided multi-step workflows where multiple agents run end-to-end processes, enabled by MCP.**
    23	- The dominant professional pattern: **agents operating VERIFIED TOOLS, with deterministic backbones and human-in-the-loop gates** — not free-roaming autonomy.
    24	
    25	**Implication:** our existing deterministic engine + honesty gates is not a detour — it is the *hard part* of the currently-recommended architecture. The missing layer is the orchestration/agents/integrations on top.
    26	
    27	## 3. MCP — industry infrastructure, not a bet (official/strong)
    28	
    29	- Introduced by Anthropic (Nov 2024); **adopted by OpenAI (March 2025), Google DeepMind, Microsoft, Salesforce**; **donated to the Agentic AI Foundation under the Linux Foundation (Dec 2025, co-founded Anthropic + Block + OpenAI)** (Wikipedia + WorkOS 2026 guide, official/strong secondary).
    30	- Adoption metrics (field signals, single-source magnitudes): ~97M monthly SDK downloads by March 2026; "78% of enterprise AI teams have MCP-backed agents in production" (andrew.ooo July-2026 state-of-play; UNVERIFIED magnitude, direction corroborated).
    31	- **Exposing your product as an MCP server is a recognized professional pattern** — 10,000+ public MCP servers at donation time (Anthropic figure via Wikipedia).
    32	
    33	## 4. Workflow-automation platforms (the AI-automation lane)
    34	
    35	- **n8n:** $180M Series C (Oct 2025), **$2.5B valuation**, >180k GitHub stars; serves as **the orchestration layer for SAP's Autonomous Enterprise platform** (n8n blog + chronexa/hatchworks 2026 guides; vendor+practitioner). Free self-hosted tier fits our cost rules.
    36	- **The 2026 consensus pattern matches our thesis verbatim:** "n8n provides the reliable backbone for business processes — deterministic workflows that must execute consistently — while AI agents plug in at specific points where intelligence is needed" (superstackit/entrans 2026, practitioner tier).
    37	
    38	## 5. Evals / observability — table stakes, and our strongest card
    39	
    40	- LangChain **State of Agent Engineering** (vendor survey, 2026): **~89% of agent teams have observability; 94% among in-production teams (71.5% full tracing); evals adoption ~52–71.5%.**
    41	- Hiring-signal consensus (digitalapplied 2026 hiring guide + braintrust/arthur playbooks, practitioner/vendor): the current skill list = **agent orchestration · MCP integration · eval design · prompt engineering · RAG · cost optimization · guardrails · observability · frontier-model fluency**. Quote: **"Eval literacy is the single biggest signal of 'this person actually built with LLMs.'"**
    42	- Portfolio-specific (agenticcareers 2026, practitioner): tool use itself is table stakes — **what impresses is edge-case handling, loop prevention, and an eval suite (≥20 test cases)**. Our repo has 749 tests, pre-registered eval floors, and anti-theater baselines — far past that bar; the gap is purely that no agentic layer sits on top yet.
    43	
    44	## 6. Vertical-agent positioning references
    45	
    46	- **Sierra** (customer-service agents; Bret Taylor): $950M raise May 2026, **$15.8B valuation**, $100M ARR in ~7 quarters. **Harvey** (legal agents): **$300M ARR, $11B valuation** Q2 2026 (saasmag/8seneca/foundevo 2026 roundups; magnitudes single-sourced per name, directionally consistent across all).
    47	- Their public architecture story: **domain-deep agents + integrations into the tools customers already use (Slack, Salesforce, Drive, M365) + outcome framing.** Slack-first delivery is the norm for internal-facing agents.
    48	
    49	## 7. Implications for this project (synthesis)
    50	
    51	1. **The market name for what we're building:** an **agentic AI system / vertical AI agent** for marketplace truth & fee-compliance auditing, built by **applied-AI engineering** — with an **AI-workflow/automation** surface (n8n lane) covering the automation-specialist story.
    52	2. **The architecture the evidence endorses is the one we can honestly build:** deterministic verified core (done) → agent crew orchestrating it as tools (to build) → MCP server exposure (to build) → Slack/email delivery (to build, offline-first per RULES §3) → observability/tracing + eval-in-CI (largely done; needs the agent-trajectory surface) → n8n workflow calling the same tools (optional lane, showcases the automation role).
    53	3. **Differentiator:** most portfolio agents are demos without discipline; ours inverts that — the discipline exists and is gated; the agentic layer lands on top of it. Anthropic's own guidance (workflows-vs-agents, agents-over-tools, cost-aware multi-agent) is directly citable as the design rationale.
    54	4. **Honesty constraints carry over unchanged:** agents recommend, the engine decides; simulated labels; no live integration until the offline slice + safety controls exist (RULES §3); live runs owner-gated; prototype-not-service.
    55	
    56	**Freshness:** all sources fetched live 2026-07-06. Figures from vendor/practitioner posts are labeled; role-demand magnitudes are directional field signals; official-tier items: Anthropic agent guidance + trends report, MCP Linux-Foundation governance, OpenAI/Google/Microsoft MCP adoption.

 succeeded in 0ms:
     1	# Execution Plan — Agentic Extension (four proficiency surfaces over the gated engine)
     2	
     3	**Status:** v1.0-rc — awaiting owner GO. NO build, NO live integration, NO spend before that GO.
     4	**Extends:** `docs/plan-truth-audit-execution.md` (conventions: SCQA · declarative criteria · slice DAG with per-slice gates · owner calls surfaced, never assumed). That plan's §5 roadmap is COMPLETE; this plan is the owner-directed extension (decision-log 2026-07-06 ×4).
     5	**Grounding:** live research digest `docs/research/agentic-extension-research-2026-07.md` (fetched 2026-07-06). frontier-advisor pre-approach consult 2026-07-07: PROCEED with corrections — all adopted (§2).
     6	
     7	## 0 · SCQA summary
     8	
     9	- **Situation:** the truth-audit engine is shipped and fully gated (749+6 verify; pre-registered eval floors; honesty gates; repo live PRIVATE). Its discipline — deterministic core, anti-theater evals, human gates — is exactly what current official guidance says is the hard part of agentic systems (digest §2).
    10	- **Complication:** the program's demonstration goal is applied-AI/agentic/AI-automation proficiency for AI-Engineer-class roles — and no agentic layer, integration surface, or automation lane sits on the engine yet. Most portfolio agents are demos without discipline; ours is discipline without the agentic layer.
    11	- **Question:** how do we add the four owner-named surfaces (agent crew · MCP server · Slack/email delivery · n8n lane) without breaking the constraints that make the repo credible (agents recommend / engine decides; offline-first; honesty labels; anti-theater floors; prototype-not-service)?
    12	- **Answer:** one typed JSON-in/JSON-out **tool-registry seam** over the engine's existing entry points (A0), consumed by all four surfaces; every surface offline-first with byte-frozen artifacts; the "agent" label earned only through pre-registered trajectory-eval floors (else it honestly downgrades to "workflow"); one module ceremony (AM) with a hiring-facing showcase runbook.
    13	
    14	## 1 · Fixed goal + constraints (owner-set; binding — plan against, do not reopen)
    15	
    16	**Goal:** a PERSONAL DEMONSTRATION project showcasing applied-AI / agentic-systems / AI-automation proficiency for AI-Engineer-class roles (AI Engineer · AI Specialist · Applied AI Engineer · AI Automation Specialist). Boundary: NOT model development/training; NOT no-code-only. Floor tools (not ceiling): Claude Code/Codex · n8n · MCP · Zapier-class.
    17	
    18	**Carried constraints (all inherited, none relaxed):**
    19	1. **Agents recommend / the engine decides** — no agent output may alter an engine verdict; structural enforcement, not convention.
    20	2. **Offline-first (RULES §3):** no live Slack, Resend/email, n8n-external, Groq, or Gemini call until the offline slice exists and safety controls are defined. Live runs = owner-gated **transient demos**, never standing infrastructure.
    21	3. **Honesty (RULES §4):** simulated labels everywhere; no "agent"/"calibrated"/capability label without its pre-registered floor cleared; C10 gate extends over every new public-facing surface.
    22	4. **Cost:** Groq free tier $0 · Gemini ≤$5 total program cap (spend to date ≈ $0.07) · everything else free/free-tier/self-hosted (best-fit rule 2026-06-25 available on justification + owner+Codex).
    23	5. **Prototype-not-service:** episodic runs only — no daemons, no cron, no standing webhooks, no uptime claims.
    24	6. **Desktop web only** for any UI surface.
    25	7. Per-slice gates (verify green + red-green) + module Codex ceremony + independent acceptance-gate; maker≠judge; owner gates: any live arming · deploy · public flip · name adoption (S-11).
    26	
    27	## 2 · What the pre-plan gates changed (adopted here)
    28	
    29	Research digest (2026-07-06, committed): validated the role/tool targeting; Anthropic workflows-vs-agents + agents-over-verified-tools guidance = citable design rationale; MCP = Linux-Foundation standard; n8n "deterministic backbone + agents at intelligence points" = our thesis verbatim; **eval literacy = the #1 hiring signal — our strongest card**; portfolio bar = edge-case handling + loop prevention + an eval suite ≥20 cases.
    30	
    31	frontier-advisor consult (2026-07-07, PROCEED): **(a)** A1 (MCP) and A2 (crew) are **siblings on A0**, both consuming the registry — declared parallel-eligible, A1 scheduled first (small, mechanical, shakes out the registry contract before the expensive slice). **(b)** The shared registry is sound coupling IFF JSON-in/JSON-out from day one and byte-frozen in A0 — adopted. **(c) Deciding risk = trajectory-eval floors being vague at plan time** → §6 makes them concrete; floor failure = label downgrade to "workflow," never retry-until-green. **(d)** Hiring-audience gaps folded in: showcase runbook (AM deliverable) · legible trajectory traces (A2 criterion) · a deliberate guardrail-refusal demo beat (A2 criterion) · how the PRIVATE repo is shown = named owner call (O-A3).
    32	
    33	## 3 · Architecture (C4-context level)
    34	
    35	```
    36	                         ┌────────────────────────────────────────────┐
    37	                         │  EXISTING GATED ENGINE (unchanged)         │
    38	                         │  listings: runCheck / runConformanceCheck  │
    39	                         │            / runDemo                       │
    40	                         │  fees: auditStatement /                    │
    41	                         │        auditWithClassification / FEE_RULES │
    42	                         └─────────────────▲──────────────────────────┘
    43	                                           │ direct function calls
    44	                    ┌──────────────────────┴───────────────────────┐
    45	                    │  A0 TOOL REGISTRY (new; the ONE seam)        │
    46	                    │  typed JSON-in/JSON-out · schema-validated   │
    47	                    │  byte-frozen goldens · $0 · loud errors      │
    48	                    └──▲───────────▲───────────▲──────────▲────────┘
    49	                       │           │           │          │
    50	              A1 MCP server   A2 agent crew   A3 delivery A4 n8n lane
    51	              (stdio, official (Intake/Audit/  builders    (workflow JSON
    52	              TS SDK; tools:   Evidence/       (Slack Block calling the same
    53	              check_feed,      Reviewer;       Kit + email  tools via CLI/MCP;
    54	              audit_statement, recommend-only; MIME; pure   self-hosted,
    55	              get_rule)        typed traces)   functions)   episodic)
    56	```
    57	
    58	- **One seam, four consumers.** The registry is what makes the differential test possible: every consumer's output must byte-equal the engine's direct answer (AC-2). Agents/MCP/n8n never import engine internals — machine-verified import walk (SOR-blind-actor precedent, D1).
    59	- **Workflows-vs-agents classification is per crew member and honest** (Anthropic guidance as rationale): Intake = model-directed routing of a messy artifact (agentic step) · Audit = deterministic workflow (tool invocation) · Evidence = deterministic workflow (C2-guard receipts assembly) · Reviewer = model-directed check with a HUMAN gate (agentic step). The public label for each member states its class; a member whose floors don't clear is labeled "workflow," not "agent."
    60	- **Recommendation-only enforcement:** agent outputs are a separate typed `Recommendation[]` referencing engine finding ids — the type system gives agents no channel to construct or mutate findings/verdicts (same pattern as F1b's advisory array, which never gates).
    61	
    62	## 4 · Success criteria + acceptance tests (declarative; each slice gates on its subset)
    63	
    64	| # | Criterion | Acceptance test (machine-checkable unless marked) |
    65	|---|---|---|
    66	| AC-1 | Registry contract typed + validated | Every tool: JSON Schema for input AND output, committed; invalid input → typed loud error (tests per tool, red-green) |
    67	| AC-2 | **Differential fidelity** | For each tool and each corpus fixture: registry output ≡ direct engine call output (byte-equal); later: MCP-served output ≡ registry output |
    68	| AC-3 | $0/offline core | Import-graph eval: registry + MCP server + delivery builders + crew orchestrator (offline mode) reach NO LLM SDK / network module (extends the existing $0-LLM eval pattern) |
    69	| AC-4 | MCP conformance | Server built on the official TypeScript SDK (version pinned + freshness-dated at A1 entry); tools listed/called via a scripted client; the full client transcript committed byte-frozen as the demo artifact |
    70	| AC-5 | Trajectory evals (the anti-theater floor for the "agent" label) | ≥20 offline-replayable trajectory cases total, ≥5 per crew member, incl. ≥2 prompt-injection cases (hostile content inside audited artifacts) and ≥2 guardrail-refusal cases; floors per §6 pre-registered BEFORE any live arming |
    71	| AC-6 | Recommendation-only | Type-level: no agent-reachable constructor for findings/verdicts (compile-time check + import walk); a test proving an agent recommendation cannot change any engine report byte |
    72	| AC-7 | Legible traces | Every crew run emits a typed trajectory record (tool calls, args digests, member, timing, verdict refs) + a human-readable rendering; documentation-standard two-register rule applies |
    73	| AC-8 | Delivery payload honesty | Slack Block Kit + email MIME builders are pure functions report→payload, snapshot-frozen; every payload carries the SIMULATED banner; C10 honesty gate extended over payload templates (grep-gate red-green) |
    74	| AC-9 | n8n lane veracity | Committed workflow JSON references ONLY sanctioned tool commands (structural test); runbook documents the episodic self-hosted run; no standing trigger nodes (webhook/cron) in the committed workflow |
    75	| AC-10 | No-regression floor | `npm run verify` green (baseline 749+6) + `test:legacy` 306+5 + python 35 at every slice exit; existing goldens byte-unchanged unless a sanctioned regen |
    76	| AC-11 | Showcase legibility | `docs/SHOWCASE.md` runbook: one command per surface + one full walkthrough transcript; a hiring reviewer can see all four surfaces without running four slices (human-checked at AM gate) |
    77	| AC-12 | Prototype-not-service | Zero daemon/cron/webhook/standing-infra artifacts committed; grep-gate over workflow/docs for uptime/service claims |
    78	
    79	## 5 · Slice DAG + gates
    80	
    81	```
    82	A0 ──► A1 ──► A4          A1∥A2 parallel-eligible (both consume only A0);
    83	 │                         A1 scheduled first (advisor ruling — cheap seam
    84	 ├───► A2                  shakedown before the expensive slice)
    85	 └───► A3
    86	A1,A2,A3,A4 ──► AM (module ceremony + showcase)
    87	```
    88	
    89	| Slice | Contents | Gate (all slices also carry AC-10) |
    90	|---|---|---|
    91	| **A0 — tool registry** | Typed JSON-in/JSON-out registry wrapping `runCheck` / `runConformanceCheck` / `runDemo` / `auditStatement` / `auditWithClassification` / rule lookup over `FEE_RULES`; input/output schemas; loud typed errors; goldens byte-frozen | AC-1, AC-2 (registry≡engine), AC-3 · per-slice verify + red-green + Codex changed-files |
    92	| **A1 — MCP server** | stdio server, official TS SDK (pin + freshness check at entry); tools `check_feed`, `audit_statement`, `get_rule` (+ `run_demo` if free); scripted-client transcript committed | AC-2 (MCP≡registry), AC-3, AC-4 · per-slice gate |
    93	| **A2 — agent crew** | Intake→Audit→Evidence→Reviewer over the registry ONLY (import walk); typed trajectories + rendering; offline mode = recorded/mocked LLM turns, deterministic replay; per-member workflows-vs-agents classification recorded; §6 floors PRE-REGISTERED in this slice; guardrail-refusal demo beat; LIVE runs NOT in this slice (owner-gated later, Groq $0 first) | AC-3 (offline mode), AC-5 (cases + floors registered), AC-6, AC-7 · per-slice gate |
    94	| **A3 — delivery builders** | Slack Block Kit payload builder + email MIME builder (pure, report→payload); snapshot-frozen; SIMULATED banner mandatory; safety-controls doc for the eventual transient live demo (allowlisted recipient · one-shot · banner in every message); NO live send | AC-3, AC-8 · per-slice gate |
    95	| **A4 — n8n lane** | Exported workflow JSON (calls the CLI/MCP tools; no standing triggers) + runbook for the episodic self-hosted docker run; n8n sustainable-use license freshness check at entry; docker install = owner call O-A4 | AC-9, AC-12 · per-slice gate |
    96	| **AM — module ceremony** | `docs/SHOWCASE.md` (AC-11) · PLAIN-ENGLISH + GLOSSARY same-breath rows · suggestions-ledger sync · ONE batched Codex (codex-guarded, xhigh) over the whole extension · independent acceptance-gate · reconcile primary-model-final | AC-11, AC-12, full-module Codex + gate SHIP |
    97	
    98	**Live legs (ALL outside the slices above; each needs its own owner word):** L-1 crew live run (Groq $0 first, Gemini ≤ remaining cap; scored vs the §6 pre-registered floors; below floor → label stays "workflow", reported as-is) · L-2 Slack/email transient demo (after A3's safety controls; one-shot) · L-3 n8n live episodic demo. Precedent rules carry: pre-registrations COMMITTED before arming; probe output paths before unrecoverable spend; degraded runs = diagnostic, never enshrined.
    99	
   100	## 6 · Trajectory-eval floors (the deciding risk, made concrete)
   101	
   102	**A trajectory case is** a committed, replayable tuple: `(input artifact, allowed-tool-call constraints, expected terminal recommendation class, expected gate behavior)` — replayed offline against recorded/mocked LLM turns; deterministic; no network.
   103	
   104	**Case set (pre-registered in A2, before any live arming):** ≥20 cases; ≥5 per member; per member ≥1 happy path, ≥1 malformed/hostile input, and for Reviewer ≥2 refusal cases (must route to the human gate, not auto-approve); ≥2 injection cases where the AUDITED ARTIFACT contains adversarial instructions (the crew must treat artifact content as data — Law-11-style quarantine inside the product).
   105	
   106	**Floors (offline replay, exact):** 100% of cases: no out-of-contract tool call, no finding/verdict mutation (AC-6 invariant holds), terminal state ∈ {recommendation, escalate-to-human} — never silent drop; ≥90% of cases: expected recommendation class matched; 100% of refusal/injection cases: the gate fires / the injection does not steer tool choice. **Live floors** (for L-1) are pre-registered at arming time on a held-out case split, committed before the run (house precedent ×3).
   107	
   108	**Failure semantics:** any floor missed → the member (or crew) is labeled **"workflow"** or **"agentic components — floor not met"** honestly in every surface; no retry-until-green on the same split; no floor moves post-hoc.
   109	
   110	## 7 · Freshness checks (free-tier + platform claims; RULES §6)
   111	
   112	| Claim | Last verified | Re-verify at |
   113	|---|---|---|
   114	| MCP = Linux Foundation standard; TS SDK official | 2026-07-06 (digest, official-tier) | A1 entry (pin exact SDK version + license, dated) |
   115	| n8n self-hosted free (sustainable-use license) | 2026-07-06 (digest, vendor-tier) | A4 entry (license text + docker image, dated) |
   116	| Groq free tier $0, TPD limits | 2026-07-05 (live classifier run) | L-1 arming (preflight script exists) |
   117	| Gemini pricing / ≤$5 cap headroom | 2026-06-29 (RULES §6 anchor) | Any Gemini arming |
   118	| Slack Block Kit spec + free workspace/app limits | **UNVERIFIED here** | A3 entry (official docs, dated) — payload builders are offline so nothing load-bearing rests on it before then |
   119	| Email provider (Resend named in RULES §3; free alternative to name per doctrine) | **UNVERIFIED here** | A3 entry + O-A5 owner call |
   120	| Anthropic workflows-vs-agents guidance | 2026-07-06 (digest, official) | AM (citation check in SHOWCASE) |
   121	
   122	## 8 · Owner calls surfaced with this plan (decide at GO; none assumed)
   123	
   124	- **O-A1:** Approve the slice set + ordering (A0 → A1 → A2/A3 → A4 → AM; A1∥A2 parallel-eligible, A1 first).
   125	- **O-A2:** Live-arming policy — default stays per-run explicit word for each of L-1/L-2/L-3 (recommended), or pre-authorize any subset now.
   126	- **O-A3:** How the private repo is SHOWN to a hiring audience (public flip — one command, author-email note stands · reviewer access grants · exported artifact). Not blocking the build; blocking the payoff.
   127	- **O-A4:** n8n self-hosted docker install on this machine (new tooling; poppler/cargo precedent).
   128	- **O-A5:** Email lane provider naming for the eventual transient demo (Resend + named free alternative per doctrine) — decision needed only by A3 entry.
   129	- **O-A6:** Confirm routing default for build slices: implementer lane (opus for A2, the subtle slice) under Fable-equivalence review, per the 2026-07-03 doctrine.
   130	
   131	## 9 · Risks + tripwires
   132	
   133	| Risk | Tripwire → response |
   134	|---|---|
   135	| **Trajectory theater** (the deciding risk) | Floors of §6 vague or unmet → label downgrade, never a softer bar; Codex cross-check explicitly tasked to attack §6's testability |
   136	| A2 cost/seat burn (multi-agent ≈10–15× tokens per official guidance) | Offline replay everywhere; live = L-1 only, Groq $0 first; seat-limit deaths follow house rule (raw verbatim · one owner-confirmed retry · NO-WAIT inline) |
   137	| Prompt injection via audited artifacts | AC-5 injection cases are mandatory, not optional; failure = refusal-path fix, never case removal |
   138	| MCP SDK churn | Exact pin + dated freshness at A1 entry; conformance transcript re-frozen consciously on any upgrade |
   139	| Scope creep to operated service | AC-12 grep-gate; any daemon/cron/webhook artifact = BLOCK at slice gate |
   140	| Registry seam drift (three consumers) | AC-2 differential runs in verify at every slice; goldens byte-frozen |
   141	| n8n lane becomes no-code-only theater | The lane calls the SAME tested tools; its gate asserts tool references structurally (AC-9); it is one surface of four, never the headline |
   142	
   143	## 10 · Verification of this plan itself
   144	
   145	- **Codex cross-check (mandatory, this session):** ONE read-only pass via `~/claude-os/bin/codex-guarded` (seat smoke-tested first; raw errors verbatim), explicitly tasked on: (a) §6 floors — testable as written? (b) AC-2/AC-6 structural enforceability; (c) contradiction scan vs RULES §3/§4 and the base plan; (d) the DAG's dependency claims; (e) anything that would make a hiring reviewer call a surface theater. Findings reconciled primary-model-final; the plan version bumps to v1.0 only after reconciliation.
   146	- **Owner GO:** this plan STOPS here. Build starts only on the owner's word, slice by slice per §5.

exec
/bin/zsh -lc 'nl -ba docs/plan-truth-audit-execution.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	# Execution Plan — The Verifier Program (UC-2 truth-audit toolkit + UC-1 fee audit)
     2	
     3	**Status: v1.0 — GO (owner ratified 2026-07-02, decision-log; NO-WAIT doctrine + real-first data doctrine + O4 declined recorded there). G8 runs inline immediately; build proceeds. Confidence: MEDIUM, conditional on G8's outcome.** → **G8 RAN INLINE 2026-07-02: PASS** (copy layer is in-protocol per the UCP catalog spec; independent seat unoccupied after teardown; buyer claim consciously declined) — `docs/reviews/gate-2026-07-02-g8-crux.md`. **Build is live; next slice = restructure (§6) + W1.**
     4	**Register note (per `docs/documentation-standard.md`):** professional register leads; *plain-English lines are marked ▸*. New terms land in `docs/GLOSSARY.md`. Successor to `docs/plan-multi-agent-execution.md` (superseded for the active program; retained as the provenance spec of the verification spine).
     5	
     6	---
     7	
     8	## 0 · SCQA summary
     9	
    10	- **Situation:** Agentic commerce is live (Square→ChatGPT/Claude ordering 2026-07-01; DD/UE/GH in Gemini since 2026-03) on two young open protocols — OpenAI/Stripe **ACP** and Google-led **UCP** (both Apache-2.0, both churning: 5 ACP releases in 8 months). Meanwhile NYC runs the first fee-cap enforcement era (HungryPanda $875K; DCWP recordkeeping rulemaking open NOW).
    11	- **Complication:** Conformance tooling exists (official `ucp-schema`, community validators) — but **nothing checks what a feed/serving copy SAYS against the merchant's system-of-record**, and nothing audits fee statements against the codified caps. Spec-valid data can still lie; agents transact on it; merchants eat the errors.
    12	- **Question:** Can one evidence-grade verifier prove both — listings truth (UC-2) and money truth (UC-1) — at showcase-grade, honestly, within prototype constraints?
    13	- **Answer:** Build **one verifier core with two claim-domain packs**, led by a fast $0-LLM UC-2 wedge (drift engine + one-page evidence-cited report + published torture corpus + spec-faithful demo), with **UC-1 parallelized from week 1** as the AI-depth centerpiece (LLM line-item classification + calibrated judges vs codified rule tables).
    14	- ▸ *Plain: platforms and AI agents show copies of a restaurant's menu and bills. Copies drift from the truth. We build the referee that catches the drift — first for menus AI agents order from, then for the fees on merchant statements — and we prove every catch with evidence.*
    15	
    16	## 1 · Fixed goal, intent frame, constraints (owner-set; binding)
    17	
    18	Demonstrate deep AI proficiency to the delivery-marketplace industry **by benefiting it** (platforms = indirect beneficiaries; company-agnostic; "marketplace integrity infrastructure"). Showcase-first, venture-ready — **"a showcase with venture optionality on two named, observable triggers"** (surface-side truth enforcement; UCP food-schema publication / FTC NPRM). Constraints (all standing): prototype-not-service (episodic runs, no 24/7 ops) · **desktop web only, no mobile** (owner 2026-07-02) · free/free-tier everything except Gemini ≤$5 hard cap · honesty rules (simulated labels; no real platform access/data/impact claims; demo agent = scripted-labeled or Gemini-driven, never Claude/Codex runtime) · legibility = hard artifact constraint (one-command validator · one-page report · demo needs no explanation) · two-register documentation, same-breath maintenance.
    19	
    20	## 2 · What the council changed (RESHAPE-PROCEED, 2026-07-02 — adopted here)
    21	
    22	The five-agent council + synthesis (`shared_reasoning.md`, 2026-07-02 evening) confirmed the direction but **reshaped the program**; the seven conditions below are folded into every section that follows:
    23	
    24	1. **S-5 close-out first** — commit the suspended slice-2 diff with honest degraded labels; freeze the activation build as the spine's provenance exhibit. ▸ *Plain: finish the old chapter cleanly so the new one stands on proof, not abandonment.*
    25	2. **UC-1 is the program's PRIMARY evidence + AI-depth track, from week 1** (rule-table + gold-set design start immediately; the AI-proficiency narrative lives here). **UC-2 is a bounded frontier demo** — bounded unless condition 8's gate confirms the live-copy drift seat. *(Codex amendments 3/11: sequencing optimizes for craft showcase + verified pain; venture/category timing influences launch, never build order.)*
    26	3. **July-16 DCWP window = an owner call THIS WEEK** (see §9 Owner calls).
    27	4. **Surface-agnostic truth engine** — the drift comparator verifies SOR vs static ACP feed **and** vs live UCP catalog-capability responses (live-read fixture ships in the wedge). Demo claim: *"any serving copy can drift from the system of record — whichever surface serves it."*
    28	5. **Demo slice-C cut** — no fake-checkout build; the demo ends at agent-selects-the-drifted-item; scripted **spec-faithful** agent is the proof (labeled), Gemini is color.
    29	6. **Category claim demoted** — identity = the mechanism (*"conformance checks the feed against the schema; we check it against reality"*); "truth layer for agentic commerce" = tagline only; venture language capped at the honest sentence above.
    30	7. **Pre-registered tripwire reviews** with kill/reshape authority — split per Codex amendment 8: pre-build crux gate → 14-day build-slip gate → 30-day external-signal gate (§10).
    31	8. **HARD PRE-BUILD CRUX GATE (Codex amendment 1 — blocks W1):** before any UC-2 implementation, resolve (a) the UCP/ACP serving architecture in marketplace contexts (does a copy layer persist behind live catalog reads?) and (b) incumbent verification depth (Feedonomics ACE / Deliverect — does anyone already check vs SOR?). **If direct-SOR/live-read dominates or the seat is occupied → the UC-2 demo is demoted and UC-1 becomes the undisputed lead.**
    32	
    33	**The crux (reframed per Codex amendment 9 — TWO-PART):** (i) technical — does copy/SOR drift persist behind food's live-query shift? AND (ii) demand — who has the authority, pain, and budget to require independent truth evidence (enforcement creates the reason to run the tool)? Even a technically-persistent drift seat can be a no-buyer artifact; gate 8 resolves (i) by teardown and (ii) by naming the enforcing surface or declining the claim.
    34	
    35	## 3 · Architecture (C4-context level) + verification-spine reuse
    36	
    37	```
    38	[Merchant SOR]──(truth)──▶┌────────────────────┐──▶ one-page evidence-cited report
    39	 synthetic catalog │      │  VERIFIER CORE     │        (S-9: report IS a document)
    40	 Square sandbox    │      │ claim → determinis-│──▶ machine output (JSON, CI-usable)
    41	[Serving copies]──(claims)│ tic check vs swap- │
    42	 ACP static feed   │      │ pable reference →  │   packs: listings/ (UC-2)
    43	 UCP live catalog  │      │ evidence → verdict │          fees/     (UC-1)
    44	 fee statements    │      └────────────────────┘   human gate on anything outbound
    45	```
    46	▸ *Plain: one engine compares what's claimed against what's true and attaches receipts; menus and fee statements are just two kinds of claims.*
    47	
    48	**Reuse map (build-realist, file-verified — honest fraction ~30–40%; the 306-test headline does NOT carry):**
    49	- **As-is:** `lib/agents/{budget,pricing}.ts` (cost ledger + $5 fail-closed), `lib/agents/{gemini,groq}.ts` + `lib/server/env-flags.ts` (provider gates), REPLAY seam ($0 public surface), eval-harness patterns (calibration-lock · differential-oracle · live-gating), Next.js/TS/Tailwind console shell + `npm run verify` toolchain.
    50	- **Adapted:** `gatekeeper.ts` → the drift comparator around a **swappable reference interface** (JSON schema | POS catalog | fee-rule table) — where "one engine, two packs" is proven or dies; semantic/domain judges + calibration harness → **idle until UC-1**, where they re-earn their keep.
    51	- **Dropped → `legacy/activation/`:** the activation domain (pipeline, diagnosis, drafting loop, SF dataset, domain gold sets) — archived runnable, per S-5.
    52	
    53	**Conformance strategy:** own TS/ajv validation at runtime (UCP mandates client-side schema composition; ACP feed = ~14 required fields + conditionals + cross-field invariants, primary-extracted); official `ucp-schema` (Rust, cargo-only) composed **in CI as a differential oracle** — never a runtime dependency (one-command constraint). nekuda = cited see-also.
    54	
    55	## 4 · Success criteria + acceptance tests (declarative; each slice gates on its subset)
    56	
    57	| # | Criterion | Acceptance test (machine-checkable unless marked) |
    58	| --- | --- | --- |
    59	| C1 | One-command validator | `npx <name> check feed.json --against catalog.json` exits non-zero on any drift/conformance finding; zero-config on the shipped fixtures; **zero LLM calls in the wedge path** (cost ledger asserts $0) |
    60	| C2 | Evidence-cited findings | every finding carries claim · reference-row id · rule/spec-clause id · severity; an eval asserts NO finding without all four |
    61	| C3 | Surface-agnostic | the same drift set is detected from (a) static ACP feed and (b) recorded live UCP catalog responses over the same SOR — one comparator, two adapters, differential test; **must include ≥1 ID-mismatch/entity-resolution class + ≥1 modifier/variant-ambiguity class; every report labels whether matching was synthetic-controlled (shared IDs) or real-world** (Codex amendment 5) |
    62	| C4 | One-page report (S-9/S-10) | report renders ≤1 page (desktop web + printable); every finding has a plain-words line; passes the documentation-standard checklist (human-judged, gate 4) |
    63	| C5 | Conformance correctness | agreement with `ucp-schema validate` on N≥30 CI fixtures (differential oracle, green); ACP checks red-green tested per extracted field rule |
    64	| C6 | Taxonomy coverage measured | drift taxonomy v1 (§7) enumerated in code; eval reports % classes covered by fixtures + % caught; **never an "all edge cases" claim** (guardrail scan blocks the word "all") |
    65	| C7 | Demo needs no explanation | demo claim verbatim (Codex amendment 6): **"a spec-faithful simulated agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch"** — never "the agent gets caught" as headline; scripted replay $0, deterministic, labeled "spec-faithful demonstration actor — simulated"; Gemini variant = non-load-bearing color, ≤$0.50, bounded retries, may fail visibly (honest) |
    66	| C8 | UC-1 classification quality | LLM line-item classifier vs codified NYC rule table: held-out precision/recall published with CIs; calibrated judges (existing bar pattern R-DHON-3); no "calibrated" claim below the pre-registered floor |
    67	| C9 | Corpus publishable | `fixtures/synthetic-restaurant/` self-contained, licensed, taxonomy-keyed; README meets the doc standard |
    68	| C10 | Honesty surface | grep-gate: no real-platform-access claims; simulated labels on every synthetic artifact; spec-version pin printed in every report header |
    69	
    70	## 5 · Slices + gates (S-4 model — proposed as standing policy, owner call)
    71	
    72	**Gate policy (S-4):** per-slice = `npm run verify` green + red-green on load-bearing changes; **full ceremony (ONE batched Codex changed-files review + acceptance-gate) at module boundaries** M0/M1/M2 and before anything irreversible. Effort auto-routed; ship-gating reviews → xhigh.
    73	
    74	| Slice | Content | Est. (realistic) | Gate |
    75	| --- | --- | --- | --- |
    76	| **S0** | S-5 close-out (Codex amendment 2: **freeze/archive only after an explicit owner acceptance record + final `npm run verify` + a written provenance caveat**; capability claim capped at what the degraded labels support — never "capability proof" beyond them) + `legacy/activation/` freeze + repo restructure execution (after owner GO) | 2–4 d | verify + **M0 Codex batch** (includes the held slice-2 review flag) |
    77	| **G8** | **PRE-BUILD CRUX GATE (blocks W1; condition 8):** UCP/ACP marketplace serving-architecture teardown + Feedonomics/Deliverect verification-depth teardown + name the enforcing surface (crux part ii) → outcome recorded: UC-2 proceeds as planned / demoted to UC-1-lead | 0.5–1 d | written gate record; owner sees the outcome |
    78	| **W1** | Wedge: synthetic restaurant SOR + ACP feed generator + drift injector (taxonomy v1) + deterministic comparator + evidence model + CLI | 8–12 d | verify + red-green |
    79	| **W2** | UCP: ajv over published schemas + live-catalog response fixtures (surface-agnostic C3) + `ucp-schema` CI oracle | 4–6 d | verify + red-green |
    80	| **W3** | One-page report (web + machine JSON) + corpus packaging (C4/C9) | 3–5 d | verify; **M1 Codex batch + acceptance-gate** (wedge module done) |
    81	| **P1** ∥ | UC-1 parallel track from week 1: §20-563.3 rule-table codification (owner-assisted primary text) + statement schema + gold-set design | continuous | design-reviewed at M1 |
    82	| **D1** | Demo: scripted spec-faithful agent on the drifted corpus (+ Gemini color, ≤$0.50) + conformance-foil beat ("passes `ucp-schema validate`; still lies") | 6–8 d | verify + **owner GO on any live Gemini spend** |
    83	| **F1** | UC-1 build: parser + LLM classifier + judge recalibration + evidence-cited fee report | 15–25 d | verify; **M2 Codex batch + acceptance-gate** |
    84	| **Pub** | Writeup + demo recording + corpus publication, timed to an ecosystem news moment | 2–4 d | **owner-gated (public posting)** |
    85	
    86	Total wedge-to-M1 ≈ 4–6 weeks episodic; F1 roughly doubles the program. The $5 cap binds nowhere before F1 (wedge is $0-LLM; demo ≤$0.50; UC-1 judges ride Groq free tier with existing pacing).
    87	
    88	## 6 · Repo restructure (proposal — execute only after owner GO, in S0)
    89	
    90	`lib/verifier-core/` (claim schema · swappable reference interface · evidence types · report model) · `lib/packs/listings/` · `lib/packs/fees/` · `legacy/activation/` (archive-don't-delete, tests runnable via separate script) · `fixtures/synthetic-restaurant/` (the publishable corpus) · `bin/` thin CLI · `evals/{core,packs}/`. Console stays Next.js (desktop-only per the 2026-07-02 constraint). **No repo/product rename until S-11's live checks** (name candidate "Assay"; trademark/domain/npm/GitHub checks = owner-gated adoption).
    91	
    92	## 7 · Edge-case taxonomy v1 (enumerated — coverage measured, never "all")
    93	
    94	**Listings drift classes:** price (value · currency-form · cents-vs-decimal · sale_price>price) · availability (86'd vs out_of_stock vs hidden vs hours-window) · existence (ghost item · missing item) · identity (ID-mismatch/entity-matching · variant/modifier mismatch) · staleness (expired `expiration_date` · stale `availability_date`) · encoding (UTF-8 · length-limit truncation) · spec-version skew (Stable-vs-Draft field drift · UCP `supported_versions` mismatch) · cross-field invariant breaks (checkout-eligible w/o search-eligible; missing conditional fields).
    95	**Fee-line classes (UC-1, from documented enforcement tactics):** bundling into single line items · relabeling across months · misclassification (marketing-as-delivery etc.) · over-cap after correct classification · promotion-deduction mischaracterization · processing-fee base inflation.
    96	Each class: ≥1 corpus fixture + a comparator/classifier test; the coverage eval (C6) reports the measured fraction.
    97	
    98	## 8 · Data plan
    99	
   100	Synthetic-primary (internally-consistent restaurant SOR + feeds + statements; generator seeded/deterministic) · REAL codified public rules (NYC §20-563.3, SF cap) · live ToS-clean reads only (public specs; own Square **sandbox** via `ITEMS_READ`; recorded UCP catalog fixtures) · zero real merchant data; everything labeled simulated. Operator-voice gap stays open (Reddit blocked ×3) — **owner-assisted pass remains a standing to-do; the plan does not claim operator-demand validation.**
   101	
   102	## 9 · Owner calls surfaced with this plan (decide at GO; none assumed)
   103	
   104	| # | Call | Recommendation |
   105	| --- | --- | --- |
   106	| O1 | Ratify the reshaped direction (council RESHAPE-PROCEED + Codex reconciliation) | Proceed as reshaped |
   107	| O2 | S-4 module-boundary ceremony as standing policy | Adopt |
   108	| O3 | S-5: commit suspended slice-2 diff as-is (honest labels), drop the clean-K re-run, freeze lineage | Adopt (S0) |
   109	| O4 | **July-16 DCWP comment window** — submit a substantive public comment on machine-auditable recordkeeping? **Public posting + external action = owner-gated**; needs research-not-tool, ~1–2 days, this week. **Gated by a ONE-PAGE SOURCE MEMO first (Codex amendment 4):** exact rule text, exact deadline, exact effective dates (the 2025-05-31 vs 2025-06-30 LL79 conflict resolved on primary text), verified-vs-unverified ledger — no public claim before the memo | Decide explicitly after the memo; if declined, log as consciously declined |
   110	| O5 | S-9: the drift/fee report as a documentation-standard artifact | Adopt (already designed into C2/C4) |
   111	| O6 | S-11: name adoption ("Assay") after live trademark/domain/npm/GitHub checks | Defer until Pub slice; checks first |
   112	| O7 | Repo restructure execution (§6) | Approve with S0 |
   113	| O8 | 30-day review date + kill authority (council condition 7) | Set at GO |
   114	
   115	## 10 · Risks, tripwires, and the next test
   116	
   117	**Top risks (council-priced):** quiet fizzle ~45–55% (mitigation: news-moment launch, corpus-before-schemas citation race, S0 provenance floor) · wrong-architecture embarrassment ~25–35% (mitigation: condition-4 surface-agnosticism + the crux teardown below) · staleness-as-negative-exhibit (mitigation: version-pinned rule tables + spec-watch productized; prototype-grade maintenance bounded) · UC-1 slip re-opening the thin-AI hole (mitigation: parallelization + M1 design review of the P1 track).
   118	**Tripwires — SPLIT per Codex amendment 8 (all pre-registered, kill/reshape authority live at each):**
   119	1. **Pre-build crux gate (G8, blocks W1):** the two-part crux (§2 condition 8) resolved BEFORE wedge implementation — (a) UCP transport/binding: who serves the catalog capability in marketplace (non-POS) contexts; is a copy layer in-protocol? (b) Feedonomics ACE + Deliverect verification depth (does anyone already check vs SOR?) (c) crux part ii: name the enforcing surface/buyer or decline the claim. Favorable → build as planned; unfavorable → UC-2 demoted to bounded demo or dropped, UC-1 undisputed lead.
   120	2. **14-day build-slip gate:** wedge tracking >2× the realistic estimate, or the UC-1 rule-table/gold-set track unstarted → review fires.
   121	3. **30-day external-signal gate:** zero external engagement in month 1 · corpus uncited at the food-schema moment → review fires with kill/reshape authority (O8).
   122	
   123	**Overall confidence (Codex amendment 10): MEDIUM, conditional on G8** — not medium-high; the residual-seat trajectory (shrinking under every adversarial pass) and the unresolved two-part crux cap it.
   124	
   125	## 11 · Verification of this plan itself
   126	
   127	Council: DONE (RESHAPE-PROCEED, `shared_reasoning.md` + synthesis). Codex cross-check: DONE — **CONFIRM-WITH-AMENDMENTS, all 12 findings accepted + folded in** (`docs/reviews/codex-2026-07-02-pivot-crosscheck.md`; raw verdict alongside). Docs-coherence gate (amendment 7): suggestions-ledger + backlog corrections appended 2026-07-02. **Primary-source lockfile (amendment 12):** before ANY public claim, `docs/research/source-lockfile.md` is created with URL · access date · quote · status for every load-bearing live fact (July-16 DCWP deadline · UCP catalog live-query wording · `ucp-schema` version · ucptools depth/pricing · UCP Food council participants · OpenAI feed-vs-website rejection · Gemini free-tier figures · LL79 effective date). Owner GO: the final gate — **no build (including S0's commit) starts before it.** Same-breath docs at GO: PLAIN-ENGLISH.md § update, GLOSSARY additions (ACP, UCP, SOR, drift, conformance-vs-truth), decision-log ratification row.

codex
The plan’s strongest claim is “one registry seam, byte-equal differential, no agent mutation channel.” I’m checking whether the existing engine returns stable serializable objects already, and whether current exports/constructors make the proposed compile-time guarantees plausible.
exec
/bin/zsh -lc 'nl -ba bin/check.mjs' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	#!/usr/bin/env node
     2	/**
     3	 * Verifier CLI — W1 (plan §5 W1, C1: one-command validator).
     4	 *
     5	 * `check <feed.json> --against <catalog.json> [--surface acp|ucp] [--json]`
     6	 * Runs the deterministic drift verification and prints the machine-readable
     7	 * report (JSON). Exit codes: 0 = clean · 1 = findings (any drift) · 2 = usage /
     8	 * input error. This path performs ZERO LLM or network calls (C1: $0-LLM) — the
     9	 * comparator is loaded from the TypeScript source via Node's native
    10	 * type-stripping (Node ≥ 24) so there is exactly ONE implementation.
    11	 *
    12	 * Machine-JSON leg (W3, C1): the report IS the output — canonical
    13	 * `JSON.stringify(report, null, 2)` on stdout, always carrying the C10 header
    14	 * surface (specVersion pin · matchingMode · simulated). JSON is the default and
    15	 * only serialization; `--json` is an explicit, CI-friendly alias that requests
    16	 * it by name (trailing flag; the default is byte-identical, which is why the
    17	 * frozen golden reports stay locked). Exit-code semantics are unchanged.
    18	 *
    19	 * Plain: point it at the copy and the truth; it prints every catch with
    20	 * receipts (as machine-readable JSON a CI job can gate on) and fails loudly if
    21	 * the copy lies. Free to run, no AI calls.
    22	 */
    23	
    24	const USAGE = `verifier — deterministic serving-copy checker (simulated corpus)
    25	
    26	Usage:
    27	  check <feed.json> --against <catalog.json> [--surface acp|ucp] [--json]
    28	      TRUTH leg: verify a serving copy against the SOR catalog (does it LIE?).
    29	      Exit 0 = clean, 1 = drift found.
    30	  check <doc.json> --conformance [--op search|lookup|get_product] [--json]
    31	      CONFORMANCE leg: validate a UCP catalog-response document against the pinned
    32	      published UCP schemas (is it correctly SHAPED?). No --against needed — the
    33	      reference is the schema. Exit 0 = conformant, 1 = schema violation(s).
    34	  fees <statement.json> [--json]
    35	      FEE-AUDIT leg (F1a, UC-1): audit a monthly delivery fee statement against
    36	      the codified NYC §20-563.3 caps (deterministic, $0, no LLM). Classification
    37	      is AS-DECLARED by the platform; the LLM line-item classifier is DEFERRED to
    38	      F1b. Prints a two-register text report, or the machine report with --json.
    39	      Exit 0 = no violations, 1 = at least one violation, 2 = usage / bad input.
    40	  demo [--json]
    41	      DEMO leg (D1): play the scripted walkthrough on the shipped corpus — a
    42	      spec-faithful simulated agent follows a spec-valid but false surface; the
    43	      verifier catches the surface/SOR mismatch. Deterministic, $0, zero-config.
    44	      Prints plain text, or the machine transcript with --json. Always exit 0.
    45	  help
    46	      Show this message.
    47	
    48	Notes:
    49	  - No LLM / network calls on either path (C1: $0-LLM; conformance reads pinned
    50	    schemas from disk via ajv).
    51	  - Output is the machine-readable report (JSON) on stdout — CI-usable, always
    52	    carrying the C10 header surface (specVersion · matchingMode · simulated).
    53	    --json is the explicit, trailing alias for that default serialization.
    54	  - Unknown flags, surplus positionals, and mixed modes exit 2 (loud) — a typo
    55	    never silently falls back to a default, and --conformance never silently
    56	    swallows a truth-leg request (the legs are separate commands by design).
    57	  - conformance vs truth: a spec-VALID document can still be FALSE. The two legs
    58	    answer different questions and use distinct rule families (LST-* vs LST-CONF-*).
    59	  - --surface defaults to acp; --op defaults to search.
    60	  - Zero-config demos: npm run check:fixtures  |  npm run check:conformance
    61	`;
    62	
    63	/** @param {string[]} argv */
    64	async function main(argv) {
    65	  const args = argv.slice(2);
    66	  const cmd = args[0];
    67	
    68	  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    69	    process.stdout.write(USAGE);
    70	    return 0;
    71	  }
    72	
    73	  // DEMO leg (D1): a scripted walkthrough. Strict-flag discipline mirrors the
    74	  // check legs — the ONLY accepted flag is --json; any other flag or any
    75	  // positional exits 2 loudly (a typo'd `demo --agdainst x` must never silently
    76	  // run the plain demo). Always exit 0 on success (it is a walkthrough, not a gate).
    77	  if (cmd === "demo") {
    78	    let json = false;
    79	    for (let i = 1; i < args.length; i++) {
    80	      const arg = args[i];
    81	      if (arg === "--json") {
    82	        json = true;
    83	        continue;
    84	      }
    85	      process.stderr.write(
    86	        `check: "demo" accepts only --json (got "${arg}")\n\n${USAGE}`,
    87	      );
    88	      return 2;
    89	    }
    90	    try {
    91	      const { runDemo } = await import("../lib/packs/listings/cli.ts");
    92	      const result = runDemo({ json });
    93	      process.stdout.write(result.output);
    94	      return result.exitCode;
    95	    } catch (err) {
    96	      process.stderr.write(`check: ${err instanceof Error ? err.message : String(err)}\n`);
    97	      return 2;
    98	    }
    99	  }
   100	
   101	  // FEES leg (F1a, UC-1): audit one monthly fee statement. Strict-flag discipline
   102	  // mirrors the other legs — the ONLY accepted flag is --json; any other flag or a
   103	  // surplus/absent positional exits 2 loudly (a typo must never silently run on a
   104	  // default). Exit 0 = no violations, 1 = ≥1 violation, 2 = usage / bad input.
   105	  if (cmd === "fees") {
   106	    let json = false;
   107	    const positionals = [];
   108	    for (let i = 1; i < args.length; i++) {
   109	      const arg = args[i];
   110	      if (arg === "--json") {
   111	        json = true;
   112	        continue;
   113	      }
   114	      if (arg.startsWith("--")) {
   115	        process.stderr.write(`check: "fees" accepts only --json (got "${arg}")\n\n${USAGE}`);
   116	        return 2;
   117	      }
   118	      positionals.push(arg);
   119	    }
   120	    if (positionals.length !== 1) {
   121	      process.stderr.write(
   122	        `check: "fees" needs exactly ONE <statement.json> (got ${positionals.length})\n\n${USAGE}`,
   123	      );
   124	      return 2;
   125	    }
   126	    try {
   127	      const { runFeeCheck } = await import("../lib/packs/fees/cli.ts");
   128	      const result = runFeeCheck(positionals[0], { json });
   129	      process.stdout.write(result.output);
   130	      return result.exitCode;
   131	    } catch (err) {
   132	      process.stderr.write(`check: ${err instanceof Error ? err.message : String(err)}\n`);
   133	      return 2;
   134	    }
   135	  }
   136	
   137	  if (cmd !== "check") {
   138	    process.stderr.write(`Unknown command: ${cmd}\n\n${USAGE}`);
   139	    return 2;
   140	  }
   141	
   142	  // Flags are validated loudly (W3): a typo'd flag must NEVER silently fall
   143	  // back to a default — CI would then gate on the wrong check. Known flags and
   144	  // how many value arguments each consumes:
   145	  const KNOWN_FLAGS = new Map([
   146	    ["--against", 1],
   147	    ["--surface", 1],
   148	    ["--conformance", 0],
   149	    ["--op", 1],
   150	    ["--json", 0],
   151	  ]);
   152	  const positionals = [];
   153	  for (let i = 1; i < args.length; i++) {
   154	    const arg = args[i];
   155	    if (!arg.startsWith("--")) {
   156	      positionals.push(arg);
   157	      continue;
   158	    }
   159	    if (!KNOWN_FLAGS.has(arg)) {
   160	      process.stderr.write(`check: unknown flag "${arg}"\n\n${USAGE}`);
   161	      return 2;
   162	    }
   163	    i += KNOWN_FLAGS.get(arg);
   164	  }
   165	
   166	  // Each leg takes exactly ONE input document; surplus positionals are a user
   167	  // error, not something to silently ignore (M1 reconciliation).
   168	  if (positionals.length > 1) {
   169	    process.stderr.write(
   170	      `check: expected ONE input file, got ${positionals.length} (${positionals.join(", ")})\n\n${USAGE}`,
   171	    );
   172	    return 2;
   173	  }
   174	
   175	  // The two legs answer DIFFERENT questions and are mutually exclusive: a
   176	  // mixed command must refuse loudly, or "--conformance --against sor.json"
   177	  // would silently skip the truth leg — and a conformant document can still
   178	  // lie (that is the program's headline). (M1 Codex P1.)
   179	  if (args.includes("--conformance") && (args.includes("--against") || args.includes("--surface"))) {
   180	    process.stderr.write(
   181	      `check: --conformance (shape) and --against/--surface (truth) are separate checks — run them as two commands\n\n${USAGE}`,
   182	    );
   183	    return 2;
   184	  }
   185	  // The converse hole (confirming-pass P3): --op is a conformance-leg option;
   186	  // accepting it on the truth leg would silently ignore it.
   187	  if (args.includes("--op") && !args.includes("--conformance")) {
   188	    process.stderr.write(`check: --op only applies to --conformance\n\n${USAGE}`);
   189	    return 2;
   190	  }
   191	
   192	  const feedPath = args[1];
   193	
   194	  // CONFORMANCE leg (W2): validate a UCP doc against the pinned schemas.
   195	  if (args.includes("--conformance")) {
   196	    const opIdx = args.indexOf("--op");
   197	    const op = opIdx >= 0 ? args[opIdx + 1] : "search";
   198	    if (!feedPath || feedPath.startsWith("--")) {
   199	      process.stderr.write(`check: --conformance needs <doc.json>\n\n${USAGE}`);
   200	      return 2;
   201	    }
   202	    if (op !== "search" && op !== "lookup" && op !== "get_product") {
   203	      process.stderr.write(`check: --op must be "search", "lookup" or "get_product" (got "${op}")\n\n${USAGE}`);
   204	      return 2;
   205	    }
   206	    try {
   207	      const { runConformanceCheck } = await import("../lib/packs/listings/cli.ts");
   208	      const result = runConformanceCheck(feedPath, op);
   209	      process.stdout.write(result.output);
   210	      return result.exitCode;
   211	    } catch (err) {
   212	      process.stderr.write(`check: ${err instanceof Error ? err.message : String(err)}\n`);
   213	      return 2;
   214	    }
   215	  }
   216	
   217	  // TRUTH leg (W1): verify a serving copy against the SOR catalog.
   218	  const againstIdx = args.indexOf("--against");
   219	  const catalogPath = againstIdx >= 0 ? args[againstIdx + 1] : undefined;
   220	  const surfaceIdx = args.indexOf("--surface");
   221	  const surface = surfaceIdx >= 0 ? args[surfaceIdx + 1] : "acp";
   222	
   223	  if (!feedPath || feedPath.startsWith("--") || !catalogPath) {
   224	    process.stderr.write(`check: need <feed.json> and --against <catalog.json>\n\n${USAGE}`);
   225	    return 2;
   226	  }
   227	  if (surface !== "acp" && surface !== "ucp") {
   228	    process.stderr.write(`check: --surface must be "acp" or "ucp" (got "${surface}")\n\n${USAGE}`);
   229	    return 2;
   230	  }
   231	
   232	  try {
   233	    const { runCheck } = await import("../lib/packs/listings/cli.ts");
   234	    const result = runCheck(feedPath, catalogPath, surface);
   235	    process.stdout.write(result.output);
   236	    return result.exitCode;
   237	  } catch (err) {
   238	    process.stderr.write(`check: ${err instanceof Error ? err.message : String(err)}\n`);
   239	    return 2;
   240	  }
   241	}
   242	
   243	process.exit(await main(process.argv));

exec
/bin/zsh -lc 'nl -ba lib/packs/listings/index.ts && nl -ba lib/packs/listings/run.ts && nl -ba lib/packs/listings/conformance.ts && nl -ba lib/packs/listings/demo/index.ts' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	/**
     2	 * Listings pack (UC-2) — W1 (plan §5 W1, §7).
     3	 *
     4	 * The menu-truth pack: seeded synthetic SOR (Square-Catalog-shaped, simulated) →
     5	 * faithful ACP-shaped feed → taxonomy-keyed drift injection → surface adapters
     6	 * (ACP feed · constructed UCP catalog response) → deterministic detectors →
     7	 * evidence-cited report. Coverage of the classes below is MEASURED by the C6
     8	 * eval — bounded to the enumerated taxonomy, never claimed total.
     9	 *
    10	 * Plain: the menu-drift rulebook plus the machinery that builds a fake menu,
    11	 * breaks its copies in documented ways, and proves the verifier catches every
    12	 * documented break — with receipts.
    13	 */
    14	
    15	/** Drift classes enumerated in plan §7 (listings). */
    16	export const LISTINGS_DRIFT_CLASSES = [
    17	  "price",
    18	  "availability",
    19	  "existence",
    20	  "identity",
    21	  "staleness",
    22	  "encoding",
    23	  "spec-version-skew",
    24	  "cross-field-invariant",
    25	] as const;
    26	
    27	export type ListingsDriftClass = (typeof LISTINGS_DRIFT_CLASSES)[number];
    28	
    29	/** Pack descriptor — a real module so evals/packs can assert it loads. */
    30	export const LISTINGS_PACK = {
    31	  id: "listings",
    32	  useCase: "UC-2",
    33	  status: "w1-wedge",
    34	  classes: LISTINGS_DRIFT_CLASSES,
    35	} as const;
    36	
    37	// Public pack surface (the CLI entry lives in ./cli.ts and is intentionally NOT
    38	// re-exported here — it imports node:fs, which the browser-safe barrel avoids).
    39	export type { SorItem, SorModifierList, SorVariation, SorStockState, SyntheticCatalog } from "./types.ts";
    40	export { CORPUS_AS_OF, CORPUS_SEED, generateCatalog, mulberry32 } from "./generate.ts";
    41	export type { AcpAvailability, AcpFeed, AcpFeedItem } from "./acp-feed.ts";
    42	export { buildFaithfulFeed, centsToDecimal } from "./acp-feed.ts";
    43	export type { DriftManifestEntry, DriftSurface, DriftedFeedBundle } from "./drift.ts";
    44	export { applyCorpusDrift } from "./drift.ts";
    45	export type { UcpCatalogItem, UcpCatalogResponseFixture } from "./ucp.ts";
    46	export { UCP_PINNED_VERSION, buildUcpResponse } from "./ucp.ts";
    47	export type {
    48	  UcpPrice,
    49	  UcpSearchResponse,
    50	  UcpWireProduct,
    51	  UcpWireVariant,
    52	} from "./ucp-wire.ts";
    53	export { buildUcpSearchResponse, ucpSearchResponseToClaims } from "./ucp-wire.ts";
    54	export { acpFeedToClaims, ucpResponseToClaims } from "./adapters.ts";
    55	export { expectedTitle, indexCatalog, sorReference } from "./reference.ts";
    56	export { listingsDetectors, mojibake } from "./detectors.ts";
    57	export { LISTINGS_SPEC_VERSION, runListingsVerification } from "./run.ts";
     1	/**
     2	 * Listings verification runner — W1 (composes engine + adapters + detectors).
     3	 *
     4	 * Adds the whole-copy COMPLETENESS SWEEP no single claim can express:
     5	 * - unresolved rows → deterministic entity resolution (exact expected-title
     6	 *   match, unique) decides ID-MISMATCH (identity) vs GHOST (existence);
     7	 * - SOR rows never claimed → MISSING (existence), expressed as the copy's
     8	 *   implicit claim-of-omission (a constructed `existence:false` claim, so even
     9	 *   absence carries C2 receipts).
    10	 *
    11	 * Plain: after checking every statement the copy makes, we also check what it
    12	 * DOESN'T say — items it invented, items it renamed, items it silently dropped.
    13	 */
    14	import type { Claim, Finding, VerifierReport } from "../../verifier-core/index.ts";
    15	import { makeFinding } from "../../verifier-core/guard.ts";
    16	import { buildReport, verifyClaims } from "../../verifier-core/verify.ts";
    17	import { listingsDetectors } from "./detectors.ts";
    18	import { expectedTitle, indexCatalog, sorReference } from "./reference.ts";
    19	import type { SyntheticCatalog } from "./types.ts";
    20	import { UCP_PINNED_VERSION } from "./ucp.ts";
    21	
    22	/** The pinned spec/taxonomy line stamped into every W1 report header (C10). */
    23	export const LISTINGS_SPEC_VERSION = `taxonomy-v1+acp-extract-2026-07-02+ucp-pin-${UCP_PINNED_VERSION}`;
    24	
    25	function completenessSweep(
    26	  claims: readonly Claim[],
    27	  sor: SyntheticCatalog,
    28	): readonly Finding[] {
    29	  const { byVariationId, byExpectedTitle } = indexCatalog(sor);
    30	  const findings: Finding[] = [];
    31	  const source = claims[0]?.source ?? "acp-feed";
    32	
    33	  // Group claims by serving row (skip catalog-level meta claims).
    34	  const rows = new Map<string, Map<string, unknown>>();
    35	  for (const c of claims) {
    36	    const rowId = c.id.split("#")[0];
    37	    if (rowId === "catalog") continue;
    38	    const fields = rows.get(rowId) ?? new Map<string, unknown>();
    39	    fields.set(c.field, c.value);
    40	    rows.set(rowId, fields);
    41	  }
    42	
    43	  const resolvedTruthIds = new Set<string>();
    44	  for (const [rowId, fields] of rows) {
    45	    if (byVariationId.has(rowId)) {
    46	      resolvedTruthIds.add(rowId);
    47	      continue;
    48	    }
    49	    // Unresolved row: entity resolution by exact expected-title match.
    50	    const title = String(fields.get("title") ?? "");
    51	    const titleMatches = byExpectedTitle.get(title) ?? [];
    52	    const existenceClaim: Claim = {
    53	      id: `${rowId}#existence`,
    54	      source,
    55	      field: "existence",
    56	      value: true,
    57	    };
    58	    if (titleMatches.length === 1) {
    59	      const truth = titleMatches[0];
    60	      resolvedTruthIds.add(truth.variation.id);
    61	      findings.push(
    62	        makeFinding({
    63	          claim: existenceClaim,
    64	          referenceRowId: truth.variation.id,
    65	          ruleId: "LST-IDENT-ID-MISMATCH",
    66	          severity: "error",
    67	          category: "identity",
    68	          plainLine: `The copy keys this row as "${rowId}" but the catalog row is "${truth.variation.id}" — same item, mismatched identity (resolved by exact name).`,
    69	        }),
    70	      );
    71	    } else {
    72	      findings.push(
    73	        makeFinding({
    74	          claim: existenceClaim,
    75	          // A ghost has no truth row; the reference row cited is the catalog
    76	          // itself — the row set it was (absently) checked against.
    77	          referenceRowId: "catalog-meta",
    78	          ruleId: "LST-EXIST-GHOST",
    79	          severity: "error",
    80	          category: "existence",
    81	          plainLine: `The copy serves "${title || rowId}" but no such item exists in the merchant's catalog.`,
    82	        }),
    83	      );
    84	    }
    85	  }
    86	
    87	  // Missing: non-hidden SOR variations never claimed by the copy.
    88	  for (const item of sor.items) {
    89	    for (const variation of item.variations) {
    90	      if (variation.stock === "hidden") continue;
    91	      if (resolvedTruthIds.has(variation.id)) continue;
    92	      findings.push(
    93	        makeFinding({
    94	          claim: {
    95	            id: `${variation.id}#existence`,
    96	            source,
    97	            field: "existence",
    98	            value: false, // the copy's implicit claim: "this item is not listed"
    99	          },
   100	          referenceRowId: variation.id,
   101	          ruleId: "LST-EXIST-MISSING",
   102	          severity: "error",
   103	          category: "existence",
   104	          plainLine: `"${expectedTitle(item, variation)}" exists in the merchant's catalog but is missing from the serving copy.`,
   105	        }),
   106	      );
   107	    }
   108	  }
   109	
   110	  return findings;
   111	}
   112	
   113	/** Run the full listings verification for one surface's claims. */
   114	export function runListingsVerification(
   115	  claims: readonly Claim[],
   116	  sor: SyntheticCatalog,
   117	): VerifierReport {
   118	  const reference = sorReference(sor);
   119	  const detected = verifyClaims(claims, reference, listingsDetectors);
   120	  const completeness = completenessSweep(claims, sor);
   121	  return buildReport([...detected, ...completeness], {
   122	    specVersion: LISTINGS_SPEC_VERSION,
   123	    matchingMode: "synthetic-controlled",
   124	    simulated: true,
   125	  });
   126	}
     1	/**
     2	 * UCP catalog CONFORMANCE leg — W2 (plan §5 W2, §3 "own TS/ajv validation";
     3	 * criteria C5 conformance-correctness, C10 spec-version pin).
     4	 *
     5	 * The verifier's SECOND question, kept cleanly separate from the truth leg: does
     6	 * a UCP catalog-response document CONFORM to the published UCP JSON Schemas? This
     7	 * is the "conformance" half of the program's core distinction — a spec-VALID
     8	 * document can still LIE about the merchant's system-of-record (the truth leg,
     9	 * run.ts, owns that). Conformance findings use a DISTINCT rule-ID family
    10	 * (`LST-CONF-*`) and the `conformance` category, so the two families never blur
    11	 * in a rule id, a category, or a report.
    12	 *
    13	 * Composition (followed per the UCP spec, read as reference 2026-07-03 — the
    14	 * `ucp-schema` README + the `ucp` spec repo): UCP mandates CLIENT-SIDE schema
    15	 * composition — schemas cross-reference by relative `$ref` against each file's
    16	 * absolute `$id`. We register every pinned schema by its `$id` so ajv resolves
    17	 * the whole graph locally; a catalog search/lookup response is validated against
    18	 * the `{op}_response` `$defs` entry of its capability schema.
    19	 *
    20	 * HONESTY BOUND (documented, not hidden): the pinned schemas carry UCP vendor
    21	 * vocabulary at schema level (`name` capability id; `ucp_request`/`ucp_response`/
    22	 * `ucp_shared_request` visibility annotations). We run ajv `strict:false`, so
    23	 * those are non-constraining annotations while EVERY standard validation keyword
    24	 * (type/required/pattern/minItems/minimum/format) is enforced. Applying the
    25	 * annotations to derive per-operation views (the official `resolve` step) is the
    26	 * cargo-only Rust tool's job — our runtime does STRUCTURAL conformance only. The
    27	 * `test:ucp-oracle` CI lane is the differential check on that boundary.
    28	 *
    29	 * $0 / offline: reads pinned JSON Schemas from disk, zero network, zero LLM,
    30	 * zero clock reads (the pinned spec version is data). This module imports
    31	 * `node:fs`, so — like cli.ts — it is intentionally NOT re-exported from the
    32	 * browser-safe pack barrel (index.ts).
    33	 *
    34	 * Plain: this checks a UCP menu answer against the official rulebook for what such
    35	 * an answer must look like. Passing this check means "correctly shaped" — NOT
    36	 * "true". A perfectly-shaped answer can still quote the wrong price; that lie is
    37	 * the truth leg's job. We keep the two kinds of catch clearly labeled apart.
    38	 */
    39	import { readFileSync, readdirSync, statSync } from "node:fs";
    40	import { join } from "node:path";
    41	import Ajv2020 from "ajv/dist/2020.js";
    42	import type { ErrorObject, ValidateFunction } from "ajv";
    43	import addFormatsModule from "ajv-formats";
    44	import type { Claim, VerifierReport } from "../../verifier-core/index.ts";
    45	import { makeFinding, type FindingInput } from "../../verifier-core/guard.ts";
    46	import { buildReport } from "../../verifier-core/verify.ts";
    47	import { UCP_PINNED_VERSION } from "./ucp.ts";
    48	
    49	/** Default pinned-schema base dir (cwd-relative; the shipped conformance corpus
    50	 * and the CLI both use this — zero-config, C1). Spec version = dir name. */
    51	export const DEFAULT_UCP_SCHEMA_DIR = join(
    52	  "fixtures",
    53	  "ucp-schemas",
    54	  UCP_PINNED_VERSION,
    55	  "schemas",
    56	);
    57	
    58	/** Catalog response operations → the pinned `{op}_response` schema `$id` ref
    59	 * validated against. All three are product-catalog "answer" shapes. */
    60	export const UCP_CATALOG_OPERATIONS = {
    61	  search: "https://ucp.dev/schemas/shopping/catalog_search.json#/$defs/search_response",
    62	  lookup: "https://ucp.dev/schemas/shopping/catalog_lookup.json#/$defs/lookup_response",
    63	  get_product: "https://ucp.dev/schemas/shopping/catalog_lookup.json#/$defs/get_product_response",
    64	} as const;
    65	
    66	export type UcpCatalogOp = keyof typeof UCP_CATALOG_OPERATIONS;
    67	
    68	/** Map an ajv keyword to a stable `LST-CONF-*` rule id (the spec-clause family).
    69	 * Every conformance break is severity `error`: a wrong-shaped document is not a
    70	 * matter of degree. Unknown keywords fall back to a generic rule id carrying the
    71	 * keyword, so no error is ever silently unclassified. */
    72	export function conformanceRuleId(keyword: string): string {
    73	  switch (keyword) {
    74	    case "required":
    75	      return "LST-CONF-REQUIRED-MISSING";
    76	    case "type":
    77	      return "LST-CONF-TYPE";
    78	    case "pattern":
    79	      return "LST-CONF-PATTERN";
    80	    case "format":
    81	      return "LST-CONF-FORMAT";
    82	    case "enum":
    83	      return "LST-CONF-ENUM";
    84	    case "const":
    85	      return "LST-CONF-CONST";
    86	    case "minItems":
    87	    case "maxItems":
    88	      return "LST-CONF-ARRAY-BOUNDS";
    89	    case "minimum":
    90	    case "maximum":
    91	    case "exclusiveMinimum":
    92	    case "exclusiveMaximum":
    93	      return "LST-CONF-NUMBER-RANGE";
    94	    case "minLength":
    95	    case "maxLength":
    96	      return "LST-CONF-STRING-LENGTH";
    97	    case "minProperties":
    98	    case "maxProperties":
    99	      return "LST-CONF-OBJECT-SHAPE";
   100	    case "additionalProperties":
   101	    case "unevaluatedProperties":
   102	      return "LST-CONF-ADDITIONAL-PROP";
   103	    default:
   104	      return `LST-CONF-SCHEMA-${keyword.toUpperCase()}`;
   105	  }
   106	}
   107	
   108	interface LoadedValidator {
   109	  readonly ajv: Ajv2020;
   110	  readonly validators: Map<UcpCatalogOp, ValidateFunction>;
   111	}
   112	
   113	// One compiled ajv per schema dir (compile is the expensive step; episodic runs
   114	// + the eval suite call this many times). Keyed by resolved dir.
   115	const cache = new Map<string, LoadedValidator>();
   116	
   117	function walkJson(dir: string): string[] {
   118	  const out: string[] = [];
   119	  for (const entry of readdirSync(dir)) {
   120	    const p = join(dir, entry);
   121	    if (statSync(p).isDirectory()) out.push(...walkJson(p));
   122	    else if (p.endsWith(".json")) out.push(p);
   123	  }
   124	  return out.sort();
   125	}
   126	
   127	/** Build (or reuse) an ajv with every pinned schema registered by `$id`, plus
   128	 * the `{op}_response` validators compiled. See the file header for `strict:false`
   129	 * and the vendor-annotation honesty bound. */
   130	export function loadUcpValidators(schemaDir: string = DEFAULT_UCP_SCHEMA_DIR): LoadedValidator {
   131	  const cached = cache.get(schemaDir);
   132	  if (cached) return cached;
   133	
   134	  const ajv = new Ajv2020({ strict: false, allErrors: true, verbose: true });
   135	  // ajv-formats is CJS; tolerate both default and namespace interop shapes.
   136	  const addFormats =
   137	    (addFormatsModule as unknown as { default?: typeof addFormatsModule }).default ??
   138	    addFormatsModule;
   139	  addFormats(ajv);
   140	
   141	  for (const file of walkJson(schemaDir)) {
   142	    ajv.addSchema(JSON.parse(readFileSync(file, "utf8")));
   143	  }
   144	
   145	  const validators = new Map<UcpCatalogOp, ValidateFunction>();
   146	  for (const [op, ref] of Object.entries(UCP_CATALOG_OPERATIONS) as [UcpCatalogOp, string][]) {
   147	    const v = ajv.getSchema(ref);
   148	    if (!v) throw new Error(`ucp conformance: could not compile validator for ${op} (${ref})`);
   149	    validators.set(op, v);
   150	  }
   151	  const loaded: LoadedValidator = { ajv, validators };
   152	  cache.set(schemaDir, loaded);
   153	  return loaded;
   154	}
   155	
   156	/** A failing value worth citing in the report — primitives only, so a
   157	 * document-level object does not bloat the one-page report. */
   158	function citeValue(data: unknown): unknown {
   159	  const t = typeof data;
   160	  if (data === null || t === "string" || t === "number" || t === "boolean") return data;
   161	  return undefined;
   162	}
   163	
   164	/** Turn one ajv error into a C2-complete finding input. A conformance finding's
   165	 * "claim" is the offending document node (source `ucp-catalog`, field = its JSON
   166	 * pointer — never empty: the document root is `/`), the "reference row" is the
   167	 * exact schema clause it violated, and the rule id is its `LST-CONF-*` class.
   168	 * This satisfies the C2 guard's four-field contract for a DOCUMENT-LEVEL finding
   169	 * with no extension of the guard needed. */
   170	export function errorToFinding(op: UcpCatalogOp, err: ErrorObject): FindingInput {
   171	  const loc = err.instancePath === "" ? "/" : err.instancePath;
   172	  const missing =
   173	    err.keyword === "required" && typeof err.params.missingProperty === "string"
   174	      ? `${err.instancePath}/${err.params.missingProperty}`
   175	      : loc;
   176	  const claim: Claim = {
   177	    id: `${loc} (${err.keyword})`,
   178	    source: "ucp-catalog",
   179	    field: missing,
   180	    value: citeValue((err as ErrorObject & { data?: unknown }).data),
   181	  };
   182	  return {
   183	    claim,
   184	    // The spec-clause id cited for C2: the operation + the schema JSON pointer
   185	    // (post-composition) that rejected the document.
   186	    referenceRowId: `ucp-catalog:${op}${err.schemaPath}`,
   187	    ruleId: conformanceRuleId(err.keyword),
   188	    severity: "error",
   189	    category: "conformance",
   190	    plainLine: `Conformance: the document ${loc === "/" ? "root" : `at ${loc}`} ${err.message ?? `violates ${err.keyword}`} (UCP ${op} schema, ${UCP_PINNED_VERSION}).`,
   191	  };
   192	}
   193	
   194	/** Options for a conformance run. */
   195	export interface ConformanceOptions {
   196	  /** Which catalog response shape to validate against (default `search`). */
   197	  readonly op?: UcpCatalogOp;
   198	  /** Pinned-schema base dir (default {@link DEFAULT_UCP_SCHEMA_DIR}). */
   199	  readonly schemaDir?: string;
   200	  /** Honesty surface (C10): true for the synthetic corpus (default true). */
   201	  readonly simulated?: boolean;
   202	}
   203	
   204	/**
   205	 * Validate a UCP catalog-response document against the pinned schemas and return
   206	 * an evidence-cited {@link VerifierReport} of `LST-CONF-*` findings. `ok:true`
   207	 * means the document is spec-shaped — which, per this program's whole thesis, is
   208	 * NOT a claim that it is true. The report header pins the UCP spec version (C10).
   209	 */
   210	export function runUcpConformance(
   211	  doc: unknown,
   212	  opts: ConformanceOptions = {},
   213	): VerifierReport {
   214	  const op: UcpCatalogOp = opts.op ?? "search";
   215	  const { validators } = loadUcpValidators(opts.schemaDir ?? DEFAULT_UCP_SCHEMA_DIR);
   216	  const validate = validators.get(op);
   217	  if (!validate) throw new Error(`ucp conformance: unknown op ${op}`);
   218	
   219	  const valid = validate(doc);
   220	  // Every conformance finding is admitted by the SAME C2 guard the truth leg
   221	  // uses (makeFinding throws on any missing receipt); buildReport re-asserts it.
   222	  const findings = valid
   223	    ? []
   224	    : (validate.errors ?? []).map((e) => makeFinding(errorToFinding(op, e)));
   225	
   226	  return buildReport(findings, {
   227	    specVersion: `ucp-catalog-${op}@${UCP_PINNED_VERSION}`,
   228	    // Conformance has no entity-resolution step; the label reflects the corpus
   229	    // provenance (the shipped corpus is synthetic-controlled), not a matching claim.
   230	    matchingMode: "synthetic-controlled",
   231	    simulated: opts.simulated ?? true,
   232	  });
   233	}
     1	/**
     2	 * Demo pack surface — D1 (plan §5 D1). Barrel for the deterministic demo engine
     3	 * and its browser-safe copy/types/renderer. `transcript.ts` is intentionally NOT
     4	 * re-exported from the pack's browser-safe barrel graph elsewhere — it pulls
     5	 * conformance.ts (node:fs) — but is exported here for the CLI, the generator, and
     6	 * the evals that build the transcript.
     7	 *
     8	 * Plain: the demo's parts, gathered in one door — the words, the shapes, the
     9	 * script-writer, and the text printer.
    10	 */
    11	export {
    12	  DEMO_ACTOR_LABEL,
    13	  DEMO_CLAIM,
    14	  DEMO_FOIL_LINE,
    15	  DEMO_INTENT_TITLE,
    16	  DEMO_SIMULATED_BANNER,
    17	  DEMO_SUBHEAD,
    18	  DEMO_BEAT,
    19	} from "./copy.ts";
    20	export type {
    21	  ActorSelection,
    22	  DemoBeat,
    23	  DemoBeatId,
    24	  DemoFinding,
    25	  DemoTranscript,
    26	  DemoVerdict,
    27	} from "./types.ts";
    28	export { selectFromSurface } from "./actor.ts";
    29	export { buildDemoTranscript, type DemoInputs } from "./transcript.ts";
    30	export { renderDemoText } from "./render-text.ts";

exec
/bin/zsh -lc 'nl -ba lib/packs/fees/index.ts && nl -ba lib/packs/fees/audit.ts && nl -ba lib/packs/fees/classified-audit.ts && nl -ba lib/packs/fees/finding.ts && nl -ba lib/packs/fees/rules.ts' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	/**
     2	 * Fees pack (UC-1) — F1a deterministic spine (plan §5 F1, §6, §7).
     3	 *
     4	 * The fee-statement audit pack: a typed statement schema, a loud parser, the 17
     5	 * codified NYC §20-563.3 rules as typed predicates (drift-locked to the JSON
     6	 * twin), a deterministic audit engine with the §20-563.3(e) refund-window verdict
     7	 * states, the U1-provisional finding wrapper, and a seeded corpus + answer key.
     8	 * The LLM line-item classifier seam (true-vs-declared category) is F1b: the
     9	 * deterministic baseline + mock live here; the wired live lane is
    10	 * `lib/agents/fee-classifier.ts` (owner-armed run 2026-07-05 → label DEFERRED —
    11	 * `docs/fee-classifier-calibration-status.md`).
    12	 *
    13	 * Plain: the fee-drift rulebook plus the machinery that reads a delivery bill,
    14	 * checks every fee against the real legal caps, and proves each catch with
    15	 * receipts. The AI fee-reader exists and took its one-shot test — it beat the
    16	 * simple-rules benchmark but missed one pre-agreed bar, so it holds no title.
    17	 */
    18	
    19	/** Fee-line classes enumerated in plan §7 (fees). */
    20	export const FEE_LINE_CLASSES = [
    21	  "bundling",
    22	  "relabeling",
    23	  "misclassification",
    24	  "over-cap",
    25	  "promotion-deduction-mischaracterization",
    26	  "processing-fee-base-inflation",
    27	] as const;
    28	
    29	export type FeeLineClass = (typeof FEE_LINE_CLASSES)[number];
    30	
    31	/** Pack descriptor — a real module so evals/packs can assert it loads. */
    32	export const FEES_PACK = {
    33	  id: "fees",
    34	  useCase: "UC-1",
    35	  status: "f1b-classifier-layer; live lane wired + run 2026-07-05: label DEFERRED (docs/fee-classifier-calibration-status.md)",
    36	  classes: FEE_LINE_CLASSES,
    37	} as const;
    38	
    39	// Public pack surface. The CLI entry lives in ./cli.ts and is intentionally NOT
    40	// re-exported here — it imports node:fs, which the browser-safe barrel avoids.
    41	export type {
    42	  LegalFeeCategory,
    43	  DeclaredCategory,
    44	  StatementLine,
    45	  StatementMeta,
    46	  StatementGenerator,
    47	  MonthlyStatement,
    48	} from "./statement.ts";
    49	export {
    50	  LEGAL_FEE_CATEGORIES,
    51	  isLegalFeeCategory,
    52	  PURCHASE_PRICE_BASE_STATUS,
    53	  ASSUMED_PURCHASE_PRICE_BASE,
    54	} from "./statement.ts";
    55	export { StatementParseError, parseStatement } from "./parser.ts";
    56	export type { FeeRule, FeeRuleKind } from "./rules.ts";
    57	export {
    58	  FEE_RULES,
    59	  FEE_RULE_BY_ID,
    60	  NON_STATEMENT_CHECKABLE,
    61	  BASE_DERIVED_RULE_IDS,
    62	  normalizeTwinDriftClasses,
    63	  perOrderCapExceeded,
    64	  monthlyAverageExceeded,
    65	  categoryUnlawful,
    66	  enhancedWithoutBasic,
    67	  transactionPassthroughAllowed,
    68	} from "./rules.ts";
    69	export type { FeeFinding, FeeFindingInput, FeeVerdict, FeeAuditReport } from "./finding.ts";
    70	export {
    71	  PROVISIONAL_U1,
    72	  FEE_VERDICTS,
    73	  makeFeeFinding,
    74	  MissingProvisionalMarkerError,
    75	  sortFeeFindings,
    76	  buildFeeReport,
    77	  serializeFeeReport,
    78	} from "./finding.ts";
    79	export {
    80	  FEES_SPEC_VERSION,
    81	  FEES_CLASSIFICATION_LABEL,
    82	  auditStatement,
    83	  claimIdPart,
    84	  makeLineTagger,
    85	} from "./audit.ts";
    86	export type { FeeAnswerKey, FeeAnswerKeyEntry, FeeDetectionMode } from "./generate.ts";
    87	export {
    88	  FEES_CORPUS_SEED,
    89	  buildFaithfulStatement,
    90	  buildDriftedStatement,
    91	  buildCuredStatement,
    92	  buildConditionalStatement,
    93	  buildFeeAnswerKey,
    94	  buildCorpusReports,
    95	} from "./generate.ts";
    96	
    97	// F1b classifier seam (plan §5 F1b, C8) — zero network/LLM imports (verified by
    98	// the extended fees-cli import-graph eval). The live lane is WIRED (2026-07-05,
    99	// owner GO) but lives OUTSIDE this pack (`lib/agents/fee-classifier.ts`, env-gated)
   100	// and is never imported here, so the pack's zero-network proof still holds.
   101	export type {
   102	  ClassifierInput,
   103	  ClassifierPrediction,
   104	  LineItemClassifier,
   105	  TrueCategoryLabel,
   106	} from "./classifier.ts";
   107	export {
   108	  DeterministicBaselineClassifier,
   109	  LIVE_CLASSIFIER_DESIGN,
   110	  NOT_A_PERMITTED_FEE,
   111	  SEVEN_CLASS_TRUE_CATEGORY_NOTE,
   112	  TRUE_CATEGORY_LABELS,
   113	  isTrueCategoryLabel,
   114	  makeMockOracleClassifier,
   115	  toClassifierInput,
   116	} from "./classifier.ts";
   117	export type { ClassifierAdvisoryFinding, ClassifiedFeeAuditReport } from "./classified-audit.ts";
   118	export { auditWithClassification } from "./classified-audit.ts";
     1	/**
     2	 * Fee-audit engine — F1a (plan §5 F1 item 4 + items 5/6/7).
     3	 *
     4	 * Runs the codified §20-563.3 predicates (rules.ts) over a parsed
     5	 * {@link MonthlyStatement} and assembles an evidence-cited {@link FeeAuditReport}.
     6	 * Deterministic, $0, zero network / LLM / clock reads — the evaluation date
     7	 * arrives as data (`meta.asOf`) so identical statements give byte-identical
     8	 * reports. Every finding is built through {@link makeFeeFinding} (C2 receipts +
     9	 * the U1 provisional marker on base-derived rules).
    10	 *
    11	 * Statutory logic encoded here:
    12	 *  - CATEGORY LOCK (d-1): a non-refund line whose DECLARED category is not one of
    13	 *    the four legal ones is per se unlawful (catches bundling / promotion-deduction
    14	 *    / relabel-to-nonlegal). An unlawful line has no legal cap to test further.
    15	 *  - PER-ORDER ∨ MONTHLY-AVERAGE (a/b/d): the cap is met if EITHER every order is
    16	 *    within the per-order cap OR the calendar-month average is within cap. Only
    17	 *    when the monthly average ALSO fails is the category over cap — so a per-order
    18	 *    overage the averaging alternative rescues is NOT reported (no overclaim).
    19	 *  - e-1 REFUND SAFE HARBOR (a/b/d only): an over-cap category is a `violation`
    20	 *    only once the 30-day window closes with no covering refund; still-open →
    21	 *    `conditional-pending-refund-window`; refunded-in-window → `cured-by-refund`.
    22	 *  - TRANSACTION FEE (c): a hard 3% per-order cap, NO averaging and NO safe harbor
    23	 *    (verdict is always `violation`). A line above 3% carrying the c-2 pass-through
    24	 *    flag is NOT cleared silently: the flag is asserted by the platform and the
    25	 *    statement cannot verify the fee equals the actual processor charge, so the
    26	 *    reliance is surfaced as a non-gating `asserted-passthrough-unverified` warn
    27	 *    (M2 Codex finding #1, 2026-07-04).
    28	 *  - d-4: an enhanced fee with no basic fee in the statement is disallowed.
    29	 *
    30	 * Plain: read the bill line by line against the legal caps, and say for each catch
    31	 * whether it's a settled violation or still inside the legal refund-grace window —
    32	 * always with the "we assumed this definition of purchase price" asterisk when the
    33	 * call depends on it.
    34	 *
    35	 * HONESTY (C10): the input statements are SIMULATED; only the codified law is real.
    36	 */
    37	import {
    38	  buildFeeReport,
    39	  makeFeeFinding,
    40	  PROVISIONAL_U1,
    41	  type FeeAuditReport,
    42	  type FeeFinding,
    43	  type FeeVerdict,
    44	} from "./finding.ts";
    45	import {
    46	  categoryUnlawful,
    47	  enhancedWithoutBasic,
    48	  FEE_RULE_BY_ID,
    49	  monthlyAverageExceeded,
    50	  perOrderCapExceeded,
    51	  transactionPassthroughAllowed,
    52	} from "./rules.ts";
    53	import {
    54	  ASSUMED_PURCHASE_PRICE_BASE,
    55	  LEGAL_FEE_CATEGORIES,
    56	  type LegalFeeCategory,
    57	  type MonthlyStatement,
    58	  type StatementLine,
    59	} from "./statement.ts";
    60	import type { FeeLineClass } from "./index.ts";
    61	
    62	/** Rule-table version pinned into every fee report header (C10). */
    63	export const FEES_SPEC_VERSION =
    64	  "uc1-rule-table-draft/2026-07-03+NYC§20-563.3+LL79-2025+base-U1-unresolved";
    65	
    66	/** Honest scope label — the deterministic spine audits categories AS DECLARED. */
    67	export const FEES_CLASSIFICATION_LABEL =
    68	  "as-declared by the platform; deterministic audit; LLM line-item classifier DEFERRED (F1b)";
    69	
    70	/** Per-category cap configuration (drives the a/b/d/c logic; ids drift-locked to the twin). */
    71	interface CapConfig {
    72	  readonly perOrderRuleId: string;
    73	  readonly monthlyRuleId?: string; // absent for transaction (c) — no averaging
    74	  readonly capPct: number;
    75	  readonly hasSafeHarbor: boolean;
    76	}
    77	
    78	const CAP_CONFIG: Readonly<Record<LegalFeeCategory, CapConfig>> = {
    79	  delivery_fee: { perOrderRuleId: "NYC-563.3-a-1", monthlyRuleId: "NYC-563.3-a-2", capPct: 15, hasSafeHarbor: true },
    80	  basic_service_fee: { perOrderRuleId: "NYC-563.3-b-1", monthlyRuleId: "NYC-563.3-b-2", capPct: 5, hasSafeHarbor: true },
    81	  transaction_fee: { perOrderRuleId: "NYC-563.3-c-1", capPct: 3, hasSafeHarbor: false },
    82	  enhanced_service_fee: { perOrderRuleId: "NYC-563.3-d-2", monthlyRuleId: "NYC-563.3-d-3", capPct: 20, hasSafeHarbor: true },
    83	};
    84	
    85	const dollars = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
    86	const pctOf = (feeCents: number, baseCents: number): string =>
    87	  `${((feeCents / baseCents) * 100).toFixed(1)}%`;
    88	
    89	/** The §20-563.3(e) window close: 30 days after the month's final day (pure date math, no clock). */
    90	function refundWindowClose(month: string): string {
    91	  const [y, m] = month.split("-").map(Number);
    92	  const last = new Date(Date.UTC(y, m, 0));
    93	  return new Date(last.getTime() + 30 * 86_400_000).toISOString().slice(0, 10);
    94	}
    95	
    96	/**
    97	 * Distinct-order purchase sum for the month (dedupe by orderId — no double count).
    98	 *
    99	 * DOCUMENTED LIMITATION (elevation, 2026-07-04): the statutory monthly-average
   100	 * base is the purchase price of ALL online orders in the calendar month, but a
   101	 * statement only shows orders that carry at least one fee line — an order with
   102	 * zero fees is invisible here, so this denominator can UNDERCOUNT the statutory
   103	 * base and bias the average HIGH (toward flagging). Unlike U1 this bias runs
   104	 * against the platform, which is why every monthly-average finding is already
   105	 * U1-provisional and never an unqualified verdict. §20-563.3(h) makes the gap
   106	 * narrow in practice (every transaction must be itemized), and the seeded corpus
   107	 * gives every order a fee line, so goldens are unaffected.
   108	 */
   109	function sumDistinctOrderPurchase(lines: readonly StatementLine[]): number {
   110	  const byOrder = new Map<string, number>();
   111	  for (const l of lines) if (!byOrder.has(l.orderId)) byOrder.set(l.orderId, l.orderPurchasePriceCents);
   112	  let sum = 0;
   113	  for (const v of byOrder.values()) sum += v;
   114	  return sum;
   115	}
   116	
   117	/** The provisional over-cap qualifier phrase (item 5(iii)) — never an unqualified violation. */
   118	function provisionalQualifier(): string {
   119	  return `over-cap under the ASSUMED base "${ASSUMED_PURCHASE_PRICE_BASE}" — PROVISIONAL (U1)`;
   120	}
   121	
   122	function verdictPhrase(verdict: FeeVerdict, windowClose: string): string {
   123	  switch (verdict) {
   124	    case "violation":
   125	      return "violation (the 30-day refund window has closed with no covering refund)";
   126	    case "conditional-pending-refund-window":
   127	      return `conditional — pending the 30-day refund window (closes ${windowClose})`;
   128	    case "cured-by-refund":
   129	      return "cured by a refund within the 30-day window (not a violation)";
   130	    case "asserted-passthrough-unverified":
   131	      return "not verifiable from the statement — the pass-through exception is asserted, not proven";
   132	  }
   133	}
   134	
   135	/**
   136	 * Audit one parsed monthly statement. Pure in (statement); no clock, no network,
   137	 * no LLM. Returns the machine-readable, evidence-cited fee report.
   138	 */
   139	/**
   140	 * Escape the claim-id separator in ARBITRARY statement strings (`orderId`,
   141	 * `declaredCategory`): '%' → '%25', '#' → '%23'. Keeps `id.split("#")`
   142	 * unambiguous while staying byte-identity on every committed corpus value
   143	 * (no fixture contains '#' or '%' — goldens unchanged). Reversible.
   144	 * Closes the M2 gate-4 advisory nit (2026-07-04 gate record, gate 4).
   145	 */
   146	export const claimIdPart = (s: string): string => s.replace(/%/g, "%25").replace(/#/g, "%23");
   147	
   148	/**
   149	 * Statement-position tagger — makes per-line claim ids unique when the same order
   150	 * carries repeated lines of one category (C2 traceability; M2 Codex finding #4).
   151	 * The map is OBJECT-IDENTITY keyed, so a line not a member of `statement.lines`
   152	 * throws loudly instead of rendering a silent "Lundefined" (M2 gate-4 advisory;
   153	 * unreachable via the parser — a defensive contract for direct constructors).
   154	 */
   155	export function makeLineTagger(statement: MonthlyStatement): (l: StatementLine) => string {
   156	  const index = new Map<StatementLine, number>(statement.lines.map((l, i) => [l, i]));
   157	  return (l) => {
   158	    const i = index.get(l);
   159	    if (i === undefined) {
   160	      throw new Error(`fees audit: line "${l.label}" (order ${l.orderId}) is not a member of statement.lines — the statement-position tag is object-identity based`);
   161	    }
   162	    return `L${i}`;
   163	  };
   164	}
   165	
   166	export function auditStatement(statement: MonthlyStatement): FeeAuditReport {
   167	  const findings: FeeFinding[] = [];
   168	  const month = statement.meta.month;
   169	  const asOf = statement.meta.asOf;
   170	  const windowClose = refundWindowClose(month);
   171	  const nonRefund = statement.lines.filter((l) => !l.isRefund);
   172	  const lineTag = makeLineTagger(statement);
   173	
   174	  // ── d-1 category lock: unlawful DECLARED categories (per-line) ──────────────
   175	  const d1 = FEE_RULE_BY_ID.get("NYC-563.3-d-1")!;
   176	  for (const line of nonRefund) {
   177	    if (!categoryUnlawful(line.declaredCategory)) continue;
   178	    const feeClass: FeeLineClass = classifyUnlawful(line.declaredCategory);
   179	    findings.push(
   180	      makeFeeFinding({
   181	        claim: { id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag(line)}`, source: "fee-statement", field: "declaredCategory", value: line.declaredCategory },
   182	        referenceRowId: d1.sourceClause,
   183	        ruleId: d1.id,
   184	        severity: "error",
   185	        verdict: "violation",
   186	        feeClass,
   187	        professionalLine: `Line "${line.label}" is charged under the non-permitted category "${line.declaredCategory}" (${dollars(line.amountCents)} on order ${line.orderId}) — §20-563.3(d) permits only the four categories; any other fee is unlawful.`,
   188	        plainLine: `The bill charges ${dollars(line.amountCents)} as "${line.declaredCategory}" — that isn't one of the four fee types the law allows, so it's not permitted no matter what it's called.`,
   189	      }),
   190	    );
   191	  }
   192	
   193	  // ── d-4 enhanced-without-basic (statement-level) ────────────────────────────
   194	  if (enhancedWithoutBasic(statement)) {
   195	    const d4 = FEE_RULE_BY_ID.get("NYC-563.3-d-4")!;
   196	    findings.push(
   197	      makeFeeFinding({
   198	        claim: { id: `${month}#enhanced-without-basic`, source: "fee-statement", field: "declaredCategory", value: "enhanced_service_fee" },
   199	        referenceRowId: d4.sourceClause,
   200	        ruleId: d4.id,
   201	        severity: "error",
   202	        verdict: "violation",
   203	        feeClass: "misclassification",
   204	        professionalLine: "An enhanced service fee is charged but the statement carries no basic service fee — §20-563.3(d) permits the enhanced tier only for a platform that also offers (and charges a basic service fee for) the basic service.",
   205	        plainLine: "They billed an 'extras' fee without ever offering the plain basic plan — the law only allows the extras fee if the basic plan exists too.",
   206	      }),
   207	    );
   208	  }
   209	
   210	  // ── per-category cap checks (a/b/d monthly-average ∨ per-order; c per-order) ──
   211	  const sumPurchaseAll = sumDistinctOrderPurchase(nonRefund);
   212	  for (const category of LEGAL_FEE_CATEGORIES) {
   213	    const cfg = CAP_CONFIG[category];
   214	    const catLines = nonRefund.filter((l) => l.declaredCategory === category);
   215	    if (catLines.length === 0) continue;
   216	
   217	    if (category === "transaction_fee") {
   218	      // c-1: hard 3% per order, NO averaging, NO safe harbor; c-2 exception.
   219	      const c1 = FEE_RULE_BY_ID.get("NYC-563.3-c-1")!;
   220	      const c2 = FEE_RULE_BY_ID.get("NYC-563.3-c-2")!;
   221	      for (const line of catLines) {
   222	        if (!perOrderCapExceeded(line.amountCents, line.orderPurchasePriceCents, cfg.capPct)) continue;
   223	        if (transactionPassthroughAllowed(line)) {
   224	          // c-2 exception — but the flag is ASSERTED by the platform; the statement
   225	          // cannot verify the fee equals the actual processor charge (§20-563.3(c)(i)–(ii)
   226	          // requires exactly that). Never clear silently: surface the reliance as a
   227	          // non-gating warn (M2 Codex finding #1). `ok` is unaffected (not a violation).
   228	          findings.push(
   229	            makeFeeFinding({
   230	              claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "passthroughDocumented", value: true },
   231	              referenceRowId: c2.sourceClause,
   232	              ruleId: c2.id,
   233	              severity: "warn",
   234	              verdict: "asserted-passthrough-unverified",
   235	              feeClass: "processing-fee-base-inflation",
   236	              provisional: [PROVISIONAL_U1],
   237	              professionalLine: `Transaction fee ${dollars(line.amountCents)} on order ${line.orderId} is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} of the purchase price — above the 3% cap, relying on the §20-563.3(c)(i)–(ii) pass-through exception AS ASSERTED by the platform's passthroughDocumented flag. The statement cannot verify the fee equals the actual processor charge; ${provisionalQualifier()}. Not counted as a violation; flagged for evidence-backed verification outside the statement.`,
   238	              plainLine: `The card-processing fee here is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} — over the 3% limit, but the platform says it's just passing through the real card cost. This bill alone can't prove that, so we flag it instead of clearing it or calling it a violation. (Also depends on the open "purchase price" question, U1.)`,
   239	            }),
   240	          );
   241	          continue;
   242	        }
   243	        findings.push(
   244	          makeFeeFinding({
   245	            claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "amountCents", value: line.amountCents },
   246	            referenceRowId: c1.sourceClause,
   247	            ruleId: c1.id,
   248	            severity: "error",
   249	            verdict: "violation", // c has NO refund safe harbor (subd. e excludes it)
   250	            feeClass: "processing-fee-base-inflation",
   251	            provisional: [PROVISIONAL_U1],
   252	            professionalLine: `Transaction fee ${dollars(line.amountCents)} on order ${line.orderId} is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} of the purchase price — over the hard 3% cap, not documented as a pass-through (§20-563.3(c)); ${provisionalQualifier()}. No refund safe harbor applies to the transaction fee.`,
   253	            plainLine: `The card-processing fee here is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} — over the flat 3% limit, with no proof it's just passing through the real card cost. (This depends on what "purchase price" includes — still an open question, U1.)`,
   254	          }),
   255	        );
   256	      }
   257	      continue;
   258	    }
   259	
   260	    // a/b/d: category is over cap only if the monthly average ALSO fails.
   261	    const sumFees = catLines.reduce((s, l) => s + l.amountCents, 0);
   262	    if (!monthlyAverageExceeded(sumFees, sumPurchaseAll, cfg.capPct)) continue; // averaging alternative met
   263	
   264	    const monthly = FEE_RULE_BY_ID.get(cfg.monthlyRuleId!)!;
   265	    const verdict = e1Verdict(category, cfg.capPct, sumFees, sumPurchaseAll, month, asOf, windowClose, statement.lines);
   266	    findings.push(
   267	      makeFeeFinding({
   268	        claim: { id: `${month}#${category}`, source: "fee-statement", field: "monthlyAverage", value: { sumFeesCents: sumFees, sumPurchasePriceCents: sumPurchaseAll, capPct: cfg.capPct } },
   269	        referenceRowId: monthly.sourceClause,
   270	        ruleId: monthly.id,
   271	        severity: "error",
   272	        verdict,
   273	        feeClass: "over-cap",
   274	        provisional: [PROVISIONAL_U1],
   275	        professionalLine: `${labelFor(category)} total ${dollars(sumFees)} on ${dollars(sumPurchaseAll)} of monthly purchases = ${pctOf(sumFees, sumPurchaseAll)} vs the ${cfg.capPct}% cap (${monthly.id}); ${provisionalQualifier()}; ${verdictPhrase(verdict, windowClose)}.`,
   276	        plainLine: `Across the month, ${labelFor(category).toLowerCase()} came to ${pctOf(sumFees, sumPurchaseAll)} of order value — over the ${cfg.capPct}% limit even on the monthly average. ${plainVerdict(verdict, windowClose)} (Depends on the still-open definition of "purchase price", U1.)`,
   277	      }),
   278	    );
   279	  }
   280	
   281	  return buildFeeReport(findings, {
   282	    specVersion: FEES_SPEC_VERSION,
   283	    classification: FEES_CLASSIFICATION_LABEL,
   284	  });
   285	}
   286	
   287	/** e-1 verdict for an over-cap a/b/d category. Refunds must be dated within the window. */
   288	function e1Verdict(
   289	  category: LegalFeeCategory,
   290	  capPct: number,
   291	  sumFeesCents: number,
   292	  sumPurchaseAllCents: number,
   293	  month: string,
   294	  asOf: string,
   295	  windowClose: string,
   296	  allLines: readonly StatementLine[],
   297	): FeeVerdict {
   298	  const excessScaled = sumFeesCents * 100 - capPct * sumPurchaseAllCents; // > 0 (caller checked)
   299	  const refundedInWindow = allLines
   300	    .filter(
   301	      (l) =>
   302	        l.isRefund &&
   303	        l.declaredCategory === category &&
   304	        l.month === month &&
   305	        l.refundedAtDate !== undefined &&
   306	        l.refundedAtDate <= windowClose,
   307	    )
   308	    .reduce((s, l) => s + l.amountCents, 0);
   309	  if (refundedInWindow * 100 >= excessScaled) return "cured-by-refund";
   310	  if (asOf <= windowClose) return "conditional-pending-refund-window";
   311	  return "violation";
   312	}
   313	
   314	/** Report-grouping class for a d-1 (unlawful category) finding — a display hint. */
   315	function classifyUnlawful(declared: string): FeeLineClass {
   316	  const d = declared.toLowerCase();
   317	  if (d.includes("promo")) return "promotion-deduction-mischaracterization";
   318	  if (d.includes("bundle") || (d.includes("service") && d.includes("delivery"))) return "bundling";
   319	  return "misclassification";
   320	}
   321	
   322	function labelFor(category: LegalFeeCategory): string {
   323	  switch (category) {
   324	    case "delivery_fee": return "Delivery fees";
   325	    case "basic_service_fee": return "Basic service fees";
   326	    case "transaction_fee": return "Transaction fees";
   327	    case "enhanced_service_fee": return "Enhanced service fees";
   328	  }
   329	}
   330	
   331	function plainVerdict(verdict: FeeVerdict, windowClose: string): string {
   332	  switch (verdict) {
   333	    case "violation": return "The 30-day window to refund the overcharge has closed with no refund, so this is a violation.";
   334	    case "conditional-pending-refund-window": return `It's not a violation yet — the platform still has until ${windowClose} to refund the excess.`;
   335	    case "cured-by-refund": return "The excess was refunded in time, so this is not a violation.";
   336	    case "asserted-passthrough-unverified": return "The platform says this is a straight pass-through of the card processor's charge — this bill alone can't prove or disprove that.";
   337	  }
   338	}
     1	/**
     2	 * Advisory classifier-derived audit path — F1b deliverable 7 (plan §5 F1, C8).
     3	 *
     4	 * `auditWithClassification` layers an OPTIONAL, ADVISORY classifier pass on top of
     5	 * the UNCHANGED F1a deterministic engine: it calls `auditStatement` exactly as the
     6	 * default path does (byte-identical; `fees-freeze.test.ts` + this slice's own
     7	 * goldens-unchanged assertion prove it), then separately runs an injected
     8	 * {@link LineItemClassifier} over every non-refund line and reports a candidate
     9	 * relabeling wherever the classifier's predicted TRUE category diverges from the
    10	 * DECLARED category. These candidates are ADVISORY — they are a lead, never a
    11	 * verdict — and are reported in a completely separate array from the base report's
    12	 * findings.
    13	 *
    14	 * DESIGN ESCALATION E-1 (freeze-safety over literal wording): the packet describes
    15	 * this wiring as flowing "through makeFeeFinding" with a distinct `claim.source`.
    16	 * `makeFeeFinding` (lib/packs/fees/finding.ts) requires a {@link FeeVerdict} —
    17	 * at F1b build time its three members (`violation` /
    18	 * `conditional-pending-refund-window` / `cured-by-refund`) were all STATUTORY
    19	 * DISPOSITIONS of a settled cap check; none honestly describes an unconfirmed
    20	 * AI-derived relabeling candidate, and growing the union just for the advisory
    21	 * lane would have byte-broken the frozen F1a goldens via `verdictTally`.
    22	 * (The M2 reconciliation, 2026-07-04, later DID add a fourth member —
    23	 * `asserted-passthrough-unverified`, a c-2 statement-side state — under a
    24	 * SANCTIONED golden regeneration; that state belongs to the deterministic audit,
    25	 * still not to advisory candidates, so this resolution stands unchanged.)
    26	 * Resolution (conservative): reuse the SAME universal C2 receipts constructor
    27	 * every finding in this repo is built through (`makeFinding`,
    28	 * verifier-core/guard.ts — the function `makeFeeFinding` itself wraps), and
    29	 * define a fees-domain advisory type ({@link ClassifierAdvisoryFinding})
    30	 * alongside it, entirely outside `FeeVerdict` / `buildFeeReport`. F1a goldens
    31	 * cannot be affected because this module never calls `buildFeeReport`.
    32	 * The one live change borrowed from the
    33	 * literal spec is the claim source: `ClaimSource` (verifier-core/claim.ts) gains the
    34	 * `"classifier"` member (a plain string-literal addition with no exhaustive switch
    35	 * anywhere in the codebase — verified before the edit — so it cannot break anything
    36	 * that reads `Claim.source`).
    37	 *
    38	 * HONESTY (AM-7 / C8): whichever classifier is injected, its `earnsLabel` is always
    39	 * `false` (the 2026-07-05 owner-armed live run DEFERRED on a pre-registered floor,
    40	 * so no classifier anywhere has earned the label — see classifier.ts and
    41	 * docs/fee-classifier-calibration-status.md; the wired live lane in
    42	 * lib/agents/fee-classifier.ts is async and not injected here at all). An
    43	 * advisory finding built from the {@link MockOracleClassifier} PROVES the seam CAN
    44	 * surface a relabeling (deliverable 7's wiring proof); it is never presented as a
    45	 * caught violation, and the C6 coverage eval (unmodified) keeps reporting the
    46	 * fee-answer-key's `deferred-to-classifier` entries as deferred, not caught.
    47	 *
    48	 * Plain: this is the "and here's what the AI classifier WOULD flag" layer, bolted
    49	 * onto the untouched legal checker. It never changes what the legal checker says by
    50	 * itself, and everything it flags is labeled "candidate, not proven" until an
    51	 * owner-approved live run earns the right to say otherwise.
    52	 *
    53	 * HONESTY (C10): every statement this module runs against is SIMULATED (see
    54	 * `statement.ts`); nothing here reads or implies real platform data.
    55	 */
    56	import { makeFinding } from "../../verifier-core/guard.ts";
    57	import type { Finding } from "../../verifier-core/index.ts";
    58	import { auditStatement, claimIdPart, makeLineTagger } from "./audit.ts";
    59	import {
    60	  toClassifierInput,
    61	  type ClassifierPrediction,
    62	  type LineItemClassifier,
    63	  type TrueCategoryLabel,
    64	} from "./classifier.ts";
    65	import type { FeeAuditReport } from "./finding.ts";
    66	import type { DeclaredCategory, MonthlyStatement, StatementLine } from "./statement.ts";
    67	
    68	/**
    69	 * One advisory, classifier-derived candidate — NOT a {@link FeeFinding}, has no
    70	 * {@link FeeVerdict}, and never gates `report.ok`. Built through the SAME core C2
    71	 * guard (`makeFinding`) every finding in this repo passes through, so it still
    72	 * cannot exist without its receipts (claim · referenceRowId · ruleId · severity).
    73	 */
    74	export interface ClassifierAdvisoryFinding extends Finding {
    75	  /** Always true — the marker that this is a lead, never a settled verdict. */
    76	  readonly advisory: true;
    77	  /** Provenance: which classifier produced this candidate (e.g. "deterministic-baseline", "mock-oracle-wiring-stub"). */
    78	  readonly classifierSource: string;
    79	  /** The order this candidate concerns. */
    80	  readonly orderId: string;
    81	  /** What the platform DECLARED the line as. */
    82	  readonly declaredCategory: DeclaredCategory;
    83	  /** What the classifier PREDICTED the line's true category is. */
    84	  readonly predictedTrueCategory: TrueCategoryLabel;
    85	  /** Professional-register line (two-register standard). */
    86	  readonly professionalLine: string;
    87	  /** Plain-register line (two-register standard; always present here). */
    88	  readonly plainLine: string;
    89	}
    90	
    91	/** The result of the advisory classified-audit path: the UNCHANGED base report + a separate advisory array. */
    92	export interface ClassifiedFeeAuditReport {
    93	  /** Exactly `auditStatement(statement)` — byte-identical to the default path. */
    94	  readonly base: FeeAuditReport;
    95	  /** Advisory candidates only — never merged into `base.findings` or `base.ok`. */
    96	  readonly advisoryFindings: readonly ClassifierAdvisoryFinding[];
    97	}
    98	
    99	const ruleIdFor = (classifier: LineItemClassifier): string =>
   100	  `F1B-CLASSIFIER-ADVISORY(${classifier.name})`;
   101	
   102	function buildAdvisoryFinding(
   103	  line: StatementLine,
   104	  lineTag: string,
   105	  prediction: ClassifierPrediction,
   106	  classifier: LineItemClassifier,
   107	): ClassifierAdvisoryFinding {
   108	  const core = makeFinding({
   109	    claim: {
   110	      // Statement-position tag keeps ids unique across repeated same-order,
   111	      // same-category lines (C2 traceability; M2 Codex finding #4).
   112	      id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag}#classifier`,
   113	      source: "classifier",
   114	      field: "predictedTrueCategory",
   115	      value: prediction.predicted,
   116	    },
   117	    referenceRowId: `classifier:${classifier.name}`,
   118	    ruleId: ruleIdFor(classifier),
   119	    severity: "info",
   120	    category: "classifier-relabeling-candidate",
   121	    plainLine: `The "${classifier.name}" classifier thinks the line labeled "${line.label}" (declared "${line.declaredCategory}") might actually be "${prediction.predicted}" — a candidate, not a proven catch.`,
   122	  });
   123	  return Object.freeze({
   124	    ...core,
   125	    advisory: true as const,
   126	    classifierSource: classifier.name,
   127	    orderId: line.orderId,
   128	    declaredCategory: line.declaredCategory,
   129	    predictedTrueCategory: prediction.predicted,
   130	    professionalLine: `Classifier "${classifier.name}" predicts line "${line.label}" on order ${line.orderId} (declared "${line.declaredCategory}") is truly "${prediction.predicted}" — ${prediction.rationale}. ADVISORY: a candidate relabeling, not a settled finding; ${classifier.earnsLabel ? "" : "this classifier has NOT earned a calibrated label (AM-7)."}`,
   131	    plainLine: core.plainLine as string,
   132	  });
   133	}
   134	
   135	/**
   136	 * Run the advisory classifier pass on top of the unchanged deterministic audit.
   137	 * Pure in (statement, classifier) — no clock, no network, no LLM (whichever
   138	 * classifier is injected must itself be $0/offline; the wired live lane is async
   139	 * and cannot be injected into this sync seam).
   140	 */
   141	export function auditWithClassification(
   142	  statement: MonthlyStatement,
   143	  classifier: LineItemClassifier,
   144	): ClassifiedFeeAuditReport {
   145	  const base = auditStatement(statement);
   146	  const nonRefund = statement.lines.filter((l) => !l.isRefund);
   147	  const siblingDeclaredCategories = [...new Set(nonRefund.map((l) => l.declaredCategory))];
   148	  const lineTag = makeLineTagger(statement);
   149	
   150	  const advisoryFindings: ClassifierAdvisoryFinding[] = [];
   151	  for (const line of nonRefund) {
   152	    const input = toClassifierInput(line, siblingDeclaredCategories);
   153	    const prediction = classifier.classify(input);
   154	    if (prediction.predicted === line.declaredCategory) continue; // no candidate — classifier agrees with the declared label
   155	    advisoryFindings.push(buildAdvisoryFinding(line, lineTag(line), prediction, classifier));
   156	  }
   157	
   158	  return Object.freeze({ base, advisoryFindings: Object.freeze(advisoryFindings) });
   159	}
     1	/**
     2	 * Fee-pack finding + report model — F1a (plan §5 F1 items 5–7).
     3	 *
     4	 * A {@link FeeFinding} is a verifier-core {@link Finding} (all four C2 receipts,
     5	 * built through the ONLY sanctioned constructor `makeFinding`) EXTENDED with the
     6	 * fee-domain state the report needs:
     7	 *  - a {@link FeeVerdict} (the fee-domain verdict state — the §20-563.3(e)
     8	 *    refund-window states plus the c-2 asserted-pass-through state; a state,
     9	 *    not prose);
    10	 *  - the plan §7 fee-line class it belongs to;
    11	 *  - a PROVISIONAL marker array — {@link makeFeeFinding} REQUIRES the U1 marker on
    12	 *    any finding from a base-derived rule, so a base-derived over-cap can never be
    13	 *    rendered as an unqualified violation;
    14	 *  - both registers (professional + plain), per the two-register doc standard.
    15	 *
    16	 * Plain: a caught fee problem with its receipts, PLUS whether it's a settled
    17	 * violation or still inside the legal refund-grace window, PLUS an honest asterisk
    18	 * whenever the call depends on the still-unresolved definition of "purchase price".
    19	 */
    20	import type { Finding, Severity } from "../../verifier-core/index.ts";
    21	import { makeFinding } from "../../verifier-core/guard.ts";
    22	import type { FeeLineClass } from "./index.ts";
    23	import { BASE_DERIVED_RULE_IDS } from "./rules.ts";
    24	import { ASSUMED_PURCHASE_PRICE_BASE } from "./statement.ts";
    25	
    26	/** The U1 provisional marker — one string, so resolving U1 later is a one-place flip. */
    27	export const PROVISIONAL_U1 = "U1-base" as const;
    28	
    29	/**
    30	 * The fee-domain verdict state of a finding, ENCODED (never prose):
    31	 *  - `violation` — settled: over cap and (for a/b/d) the §20-563.3(e) 30-day
    32	 *    refund window closed with no covering refund, or (for c) no safe harbor
    33	 *    exists at all;
    34	 *  - `conditional-pending-refund-window` — over cap on a/b/d but the 30-day
    35	 *    window is still open (not yet a violation — the statute defers the verdict);
    36	 *  - `cured-by-refund` — over cap on a/b/d, fully refunded within the window (not
    37	 *    a violation);
    38	 *  - `asserted-passthrough-unverified` — a transaction fee above the 3% cap whose
    39	 *    §20-563.3(c)(i)–(ii) pass-through exception rests SOLELY on the platform's
    40	 *    asserted `passthroughDocumented` flag. The statement cannot verify the
    41	 *    underlying processor charge, so the audit neither clears the line silently
    42	 *    nor calls it a violation — it surfaces the reliance (M2 Codex finding #1,
    43	 *    2026-07-04). Never counts toward `ok:false`.
    44	 * Non-over-cap findings (category lock, enhanced-without-basic) are always
    45	 * `violation`.
    46	 */
    47	export type FeeVerdict =
    48	  | "violation"
    49	  | "conditional-pending-refund-window"
    50	  | "cured-by-refund"
    51	  | "asserted-passthrough-unverified";
    52	
    53	export const FEE_VERDICTS: readonly FeeVerdict[] = [
    54	  "violation",
    55	  "conditional-pending-refund-window",
    56	  "cured-by-refund",
    57	  "asserted-passthrough-unverified",
    58	] as const;
    59	
    60	/** A fee finding: a C2-valid core Finding + fee-domain state (both registers). */
    61	export interface FeeFinding extends Finding {
    62	  /** The fee verdict state (a state, not prose): the §20-563.3(e) refund states plus the c-2 `asserted-passthrough-unverified` warn (M2, 2026-07-04). */
    63	  readonly verdict: FeeVerdict;
    64	  /** Plan §7 fee-line class this finding belongs to. */
    65	  readonly feeClass: FeeLineClass;
    66	  /** Provisional markers (e.g. {@link PROVISIONAL_U1}); required on base-derived rules. */
    67	  readonly provisional: readonly string[];
    68	  /** Professional-register line (leads; two-register doc standard). */
    69	  readonly professionalLine: string;
    70	  /** Plain-register line (paired, same breath). Always present on a fee finding. */
    71	  readonly plainLine: string;
    72	}
    73	
    74	/** Raw input to {@link makeFeeFinding} — validated + frozen on the way out. */
    75	export interface FeeFindingInput {
    76	  readonly claim: Finding["claim"];
    77	  readonly referenceRowId: string;
    78	  readonly ruleId: string;
    79	  readonly severity: Severity;
    80	  readonly verdict: FeeVerdict;
    81	  readonly feeClass: FeeLineClass;
    82	  readonly provisional?: readonly string[];
    83	  readonly professionalLine: string;
    84	  readonly plainLine: string;
    85	}
    86	
    87	/** Thrown when a base-derived finding omits the mandatory U1 provisional marker. */
    88	export class MissingProvisionalMarkerError extends Error {
    89	  constructor(message: string) {
    90	    super(message);
    91	    this.name = "MissingProvisionalMarkerError";
    92	  }
    93	}
    94	
    95	/**
    96	 * The ONLY sanctioned fee-finding constructor. Wraps verifier-core `makeFinding`
    97	 * (so the four C2 receipts are validated exactly as every other pack's findings
    98	 * are), then enforces the U1 rule: any finding from a base-derived rule MUST
    99	 * carry {@link PROVISIONAL_U1}, or this throws — a base-derived over-cap cannot
   100	 * exist as an unqualified violation.
   101	 */
   102	export function makeFeeFinding(input: FeeFindingInput): FeeFinding {
   103	  // C2 first — reuse the single core guard (throws on any missing receipt).
   104	  const core = makeFinding({
   105	    claim: input.claim,
   106	    referenceRowId: input.referenceRowId,
   107	    ruleId: input.ruleId,
   108	    severity: input.severity,
   109	    category: input.feeClass,
   110	    plainLine: input.plainLine,
   111	  });
   112	  const provisional = input.provisional ?? [];
   113	  if (BASE_DERIVED_RULE_IDS.has(input.ruleId) && !provisional.includes(PROVISIONAL_U1)) {
   114	    throw new MissingProvisionalMarkerError(
   115	      `U1 violated: base-derived rule ${input.ruleId} requires the "${PROVISIONAL_U1}" provisional marker (over-cap depends on the unresolved purchase-price base)`,
   116	    );
   117	  }
   118	  if (!input.professionalLine.trim() || !input.plainLine.trim()) {
   119	    throw new MissingProvisionalMarkerError(
   120	      `fee finding for ${input.ruleId} requires both a professional and a plain line (two-register standard)`,
   121	    );
   122	  }
   123	  return Object.freeze({
   124	    ...core,
   125	    verdict: input.verdict,
   126	    feeClass: input.feeClass,
   127	    provisional: Object.freeze([...provisional]),
   128	    professionalLine: input.professionalLine,
   129	    plainLine: input.plainLine,
   130	  });
   131	}
   132	
   133	/** Machine-readable fee-audit report (CI-usable) — verifier-core report pattern. */
   134	export interface FeeAuditReport {
   135	  /** Rule-table version pinned in the header of every report (C10). */
   136	  readonly specVersion: string;
   137	  /** True — this corpus is always simulated (C10 honesty surface). */
   138	  readonly simulated: true;
   139	  /**
   140	   * Honest scope label: the deterministic spine audits categories AS DECLARED by
   141	   * the platform; the LLM line-item classifier is DEFERRED to F1b.
   142	   */
   143	  readonly classification: string;
   144	  /** The assumed purchase-price base every base-derived verdict is provisional against (U1). */
   145	  readonly assumedPurchasePriceBase: string;
   146	  /** All evidence-cited fee findings, deterministically ordered. */
   147	  readonly findings: readonly FeeFinding[];
   148	  /** Verdict tally — counts by {@link FeeVerdict}. */
   149	  readonly verdictTally: Readonly<Record<FeeVerdict, number>>;
   150	  /** Overall pass/fail: false iff any finding has verdict `violation` (drives exit 1). */
   151	  readonly ok: boolean;
   152	}
   153	
   154	/**
   155	 * Deterministic finding order: feeClass, then ruleId, then claim id. Stable
   156	 * ordering is what makes the frozen golden report byte-comparable.
   157	 */
   158	export function sortFeeFindings(findings: readonly FeeFinding[]): readonly FeeFinding[] {
   159	  return [...findings].sort(
   160	    (a, b) =>
   161	      a.feeClass.localeCompare(b.feeClass) ||
   162	      a.ruleId.localeCompare(b.ruleId) ||
   163	      a.claim.id.localeCompare(b.claim.id),
   164	  );
   165	}
   166	
   167	/** Assemble the machine-readable fee-audit report. `ok` is false iff any `violation`. */
   168	export function buildFeeReport(
   169	  findings: readonly FeeFinding[],
   170	  opts: { readonly specVersion: string; readonly classification: string },
   171	): FeeAuditReport {
   172	  const sorted = sortFeeFindings(findings);
   173	  const verdictTally: Record<FeeVerdict, number> = {
   174	    violation: 0,
   175	    "conditional-pending-refund-window": 0,
   176	    "cured-by-refund": 0,
   177	    "asserted-passthrough-unverified": 0,
   178	  };
   179	  for (const f of sorted) verdictTally[f.verdict] += 1;
   180	  return Object.freeze({
   181	    specVersion: opts.specVersion,
   182	    simulated: true,
   183	    classification: opts.classification,
   184	    assumedPurchasePriceBase: ASSUMED_PURCHASE_PRICE_BASE,
   185	    findings: sorted,
   186	    verdictTally: Object.freeze(verdictTally),
   187	    ok: verdictTally.violation === 0,
   188	  });
   189	}
   190	
   191	/** Canonical serialization — the single stringifier (byte-identity is meaningful). */
   192	export function serializeFeeReport(report: FeeAuditReport): string {
   193	  return `${JSON.stringify(report, null, 2)}\n`;
   194	}
     1	/**
     2	 * Codified NYC §20-563.3 fee-cap rules — F1a (plan §5 F1 item 4).
     3	 *
     4	 * The 17 rules of the VERIFIED-primary rule table (docs/research/uc1-rule-table.md
     5	 * + its JSON twin uc1-rule-table.draft.json) expressed as TYPED TS PREDICATES over
     6	 * a parsed {@link MonthlyStatement} — NOT a runtime interpreter of the JSON twin.
     7	 * The JSON twin is the AUTHORITY the DRIFT-LOCK eval wires against: every twin
     8	 * rule id is EITHER implemented here as a predicate whose cap_pct / base /
     9	 * drift_classes match the twin 1:1, OR registered in {@link NON_STATEMENT_CHECKABLE}
    10	 * with a written reason. A rule that is neither fails the drift-lock; a TS rule
    11	 * absent from the twin fails it too (set-equality, both directions).
    12	 *
    13	 * Plain: the legal fee caps turned into exact yes/no tests in code, each pinned
    14	 * to the same rulebook row a human can read — and a guard test that makes it
    15	 * impossible for the code and the rulebook to silently drift apart.
    16	 */
    17	import type { FeeLineClass } from "./index.ts";
    18	import { isLegalFeeCategory, type MonthlyStatement, type StatementLine } from "./statement.ts";
    19	
    20	/** Kinds of rule (verbatim from the twin's `kind` vocabulary). */
    21	export type FeeRuleKind =
    22	  | "per_order_cap"
    23	  | "monthly_average_cap"
    24	  | "passthrough_exception"
    25	  | "category_whitelist"
    26	  | "eligibility_gate"
    27	  | "over_cap_refund_safe_harbor";
    28	
    29	/** One codified rule — metadata mirrors the JSON twin field-for-field (drift-lock). */
    30	export interface FeeRule {
    31	  /** Twin `id`, e.g. "NYC-563.3-a-1". */
    32	  readonly id: string;
    33	  /** Twin `source_clause` verbatim — cited as the reference-row id (C2). */
    34	  readonly sourceClause: string;
    35	  /** Twin `kind`. */
    36	  readonly kind: FeeRuleKind;
    37	  /** Twin `cap_pct` (percent, where numeric); undefined when the twin omits it. */
    38	  readonly capPct?: number;
    39	  /**
    40	   * Twin `base` verbatim (where numeric); PRESENCE of this field is what makes a
    41	   * rule "base-derived" (U1-provisional). Undefined when the twin omits it.
    42	   */
    43	  readonly base?: string;
    44	  /** Twin `drift_classes`, normalized to the {@link FeeLineClass} enum (1:1). */
    45	  readonly driftClasses: readonly FeeLineClass[];
    46	}
    47	
    48	/**
    49	 * Normalize a JSON-twin drift-class string (which uses spaces in the two
    50	 * compound classes) to the plan §7 {@link FeeLineClass} enum (hyphenated). The
    51	 * drift-lock eval compares a rule's {@link FeeRule.driftClasses} against the twin
    52	 * entry through this map, so "1:1 match" is exact post-normalization.
    53	 */
    54	const DRIFT_CLASS_FROM_TWIN: Readonly<Record<string, FeeLineClass>> = {
    55	  "over-cap": "over-cap",
    56	  misclassification: "misclassification",
    57	  relabeling: "relabeling",
    58	  bundling: "bundling",
    59	  "promotion-deduction mischaracterization": "promotion-deduction-mischaracterization",
    60	  "processing-fee base inflation": "processing-fee-base-inflation",
    61	};
    62	
    63	/** Normalize a twin drift_classes array to the enum (throws on an unknown label). */
    64	export function normalizeTwinDriftClasses(twin: readonly string[]): readonly FeeLineClass[] {
    65	  return twin.map((c) => {
    66	    const mapped = DRIFT_CLASS_FROM_TWIN[c];
    67	    if (mapped === undefined) {
    68	      throw new Error(`rules: unknown twin drift-class "${c}" — update DRIFT_CLASS_FROM_TWIN`);
    69	    }
    70	    return mapped;
    71	  });
    72	}
    73	
    74	/**
    75	 * The rules implemented as statement predicates. cap_pct / base / drift_classes
    76	 * are transcribed VERBATIM from the JSON twin so the drift-lock can assert 1:1.
    77	 */
    78	export const FEE_RULES: readonly FeeRule[] = [
    79	  { id: "NYC-563.3-a-1", sourceClause: "§ 20-563.3(a)", kind: "per_order_cap", capPct: 15, base: "purchase_price_per_online_order", driftClasses: ["over-cap", "misclassification"] },
    80	  { id: "NYC-563.3-a-2", sourceClause: "§ 20-563.3(a) (averaging clause)", kind: "monthly_average_cap", capPct: 15, base: "sum_purchase_price_all_orders_in_calendar_month", driftClasses: ["over-cap", "relabeling"] },
    81	  { id: "NYC-563.3-b-1", sourceClause: "§ 20-563.3(b)", kind: "per_order_cap", capPct: 5, base: "purchase_price_per_online_order", driftClasses: ["over-cap", "misclassification"] },
    82	  { id: "NYC-563.3-b-2", sourceClause: "§ 20-563.3(b) (averaging clause)", kind: "monthly_average_cap", capPct: 5, base: "sum_purchase_price_all_orders_in_calendar_month", driftClasses: ["over-cap", "relabeling"] },
    83	  { id: "NYC-563.3-c-1", sourceClause: "§ 20-563.3(c)", kind: "per_order_cap", capPct: 3, base: "purchase_price_per_online_order", driftClasses: ["over-cap", "processing-fee-base-inflation"] },
    84	  { id: "NYC-563.3-c-2", sourceClause: "§ 20-563.3(c)(i)-(ii)", kind: "passthrough_exception", driftClasses: ["processing-fee-base-inflation", "over-cap"] },
    85	  { id: "NYC-563.3-d-1", sourceClause: "§ 20-563.3(d) (category lock)", kind: "category_whitelist", driftClasses: ["misclassification", "relabeling", "promotion-deduction-mischaracterization", "bundling"] },
    86	  { id: "NYC-563.3-d-2", sourceClause: "§ 20-563.3(d)", kind: "per_order_cap", capPct: 20, base: "purchase_price_per_online_order", driftClasses: ["over-cap"] },
    87	  { id: "NYC-563.3-d-3", sourceClause: "§ 20-563.3(d) (averaging clause)", kind: "monthly_average_cap", capPct: 20, base: "sum_purchase_price_all_orders_in_calendar_month", driftClasses: ["over-cap", "relabeling"] },
    88	  { id: "NYC-563.3-d-4", sourceClause: "§ 20-563.3(d) (gating clause)", kind: "eligibility_gate", driftClasses: ["misclassification"] },
    89	  { id: "NYC-563.3-e-1", sourceClause: "§ 20-563.3(e)", kind: "over_cap_refund_safe_harbor", driftClasses: ["over-cap", "promotion-deduction-mischaracterization"] },
    90	] as const;
    91	
    92	/** Fast lookup of a rule by id. */
    93	export const FEE_RULE_BY_ID: ReadonlyMap<string, FeeRule> = new Map(
    94	  FEE_RULES.map((r) => [r.id, r]),
    95	);
    96	
    97	/**
    98	 * Rule ids the JSON twin defines but the statement schema CANNOT check — each
    99	 * with the written reason it is out of scope (plan F1a item 4: register, don't
   100	 * fake). These need data an itemized fee statement (§20-563.3(h)) does not carry.
   101	 */
   102	export const NON_STATEMENT_CHECKABLE: ReadonlyMap<string, string> = new Map([
   103	  ["NYC-563.3-a-3", "Delivery-service obligation (must deliver ≥1 mile). A structural service fact, not a fee number — not machine-checkable from a statement alone."],
   104	  ["NYC-563.3-f-1", "Search/discoverability obligation for a paid basic service fee. A serving-surface fact, not numerically auditable from a statement."],
   105	  ["NYC-563.3-l-1", "Commissioner fee-cap report duty (agency reporting). Context only — a city-agency obligation, never a statement fact."],
   106	  ["NYC-563.3-g-1-iv", "Fee-change 30-day-notice rule. Requires fee-change notice records (notice_date + effective_date) that the §20-563.3(h) per-transaction itemized statement does not carry — register, do not fake."],
   107	  ["NYC-563.3-g-3", "Clear-and-conspicuous disclosure duty. A presentation-quality obligation, not a numeric statement field; the bundling teeth it would give live deterministically in d-1 (a non-whitelisted category) instead."],
   108	  ["NYC-563.3-h-1", "Itemization duty. Defines the audit's INPUT contract itself (a monthly per-transaction itemized statement); the audit presupposes a parsed itemized statement, and a bundled/non-itemized charge surfaces via d-1's category lock."],
   109	]);
   110	
   111	/**
   112	 * The base-derived rule ids — DERIVED from the twin's `base` field via the
   113	 * registry (not hand-listed), so it cannot drift. Any finding these rules emit
   114	 * MUST carry the U1 provisional marker ({@link makeFeeFinding} enforces it).
   115	 */
   116	export const BASE_DERIVED_RULE_IDS: ReadonlySet<string> = new Set(
   117	  FEE_RULES.filter((r) => r.base !== undefined).map((r) => r.id),
   118	);
   119	
   120	// ── Typed predicates (pure, integer-cents; no float money, no clock) ──────────
   121	
   122	/**
   123	 * Per-order cap predicate (a-1 / b-1 / c-1 / d-2): the charged amount exceeds
   124	 * capPct% of the order's purchase price. Integer math: amount*100 > capPct*base
   125	 * (equality is AT the cap, i.e. compliant).
   126	 */
   127	export function perOrderCapExceeded(
   128	  amountCents: number,
   129	  purchasePriceCents: number,
   130	  capPct: number,
   131	): boolean {
   132	  return amountCents * 100 > capPct * purchasePriceCents;
   133	}
   134	
   135	/**
   136	 * Monthly-average cap predicate (a-2 / b-2 / d-3): the month's summed fees for a
   137	 * category exceed capPct% of the month's summed purchase price across ALL orders
   138	 * (the twin's `sum_purchase_price_all_orders_in_calendar_month` base).
   139	 */
   140	export function monthlyAverageExceeded(
   141	  sumFeesCents: number,
   142	  sumPurchasePriceCents: number,
   143	  capPct: number,
   144	): boolean {
   145	  return sumFeesCents * 100 > capPct * sumPurchasePriceCents;
   146	}
   147	
   148	/** Category-lock predicate (d-1): the declared category is NOT one of the four legal ones. */
   149	export function categoryUnlawful(declaredCategory: string): boolean {
   150	  return !isLegalFeeCategory(declaredCategory);
   151	}
   152	
   153	/**
   154	 * Enhanced-without-basic predicate (d-4): an enhanced_service_fee is charged but
   155	 * the statement carries no basic_service_fee line — the enhanced tier is only
   156	 * permitted when the platform also offers/charges the basic service.
   157	 */
   158	export function enhancedWithoutBasic(statement: MonthlyStatement): boolean {
   159	  const lines = statement.lines.filter((l) => !l.isRefund);
   160	  const hasEnhanced = lines.some((l) => l.declaredCategory === "enhanced_service_fee");
   161	  const hasBasic = lines.some((l) => l.declaredCategory === "basic_service_fee");
   162	  return hasEnhanced && !hasBasic;
   163	}
   164	
   165	/**
   166	 * Transaction-fee passthrough predicate (c-2): a transaction fee above the 3%
   167	 * cap is allowed ONLY when documented as an exact processor pass-through. The
   168	 * audit can only read the asserted `passthroughDocumented` flag (it cannot verify
   169	 * the underlying processor charge — recorded as a limitation).
   170	 */
   171	export function transactionPassthroughAllowed(line: StatementLine): boolean {
   172	  return line.passthroughDocumented === true;
   173	}

exec
/bin/zsh -lc 'rg -n "export function|export const|function run|runCheck|runConformanceCheck|runDemo|auditStatement|auditWithClassification|FEE_RULES|make.*Finding|class |constructor|ClaimSource|FeeVerdict|Recommendation|Finding" lib/packs/listings lib/packs/fees lib/agents bin/check.mjs' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
bin/check.mjs:91:      const { runDemo } = await import("../lib/packs/listings/cli.ts");
bin/check.mjs:92:      const result = runDemo({ json });
bin/check.mjs:207:      const { runConformanceCheck } = await import("../lib/packs/listings/cli.ts");
bin/check.mjs:208:      const result = runConformanceCheck(feedPath, op);
bin/check.mjs:233:    const { runCheck } = await import("../lib/packs/listings/cli.ts");
bin/check.mjs:234:    const result = runCheck(feedPath, catalogPath, surface);
lib/packs/listings/run.ts:14:import type { Claim, Finding, VerifierReport } from "../../verifier-core/index.ts";
lib/packs/listings/run.ts:15:import { makeFinding } from "../../verifier-core/guard.ts";
lib/packs/listings/run.ts:23:export const LISTINGS_SPEC_VERSION = `taxonomy-v1+acp-extract-2026-07-02+ucp-pin-${UCP_PINNED_VERSION}`;
lib/packs/listings/run.ts:28:): readonly Finding[] {
lib/packs/listings/run.ts:30:  const findings: Finding[] = [];
lib/packs/listings/run.ts:62:        makeFinding({
lib/packs/listings/run.ts:73:        makeFinding({
lib/packs/listings/run.ts:93:        makeFinding({
lib/packs/listings/run.ts:114:export function runListingsVerification(
lib/packs/fees/finding.ts:4: * A {@link FeeFinding} is a verifier-core {@link Finding} (all four C2 receipts,
lib/packs/fees/finding.ts:5: * built through the ONLY sanctioned constructor `makeFinding`) EXTENDED with the
lib/packs/fees/finding.ts:7: *  - a {@link FeeVerdict} (the fee-domain verdict state — the §20-563.3(e)
lib/packs/fees/finding.ts:10: *  - the plan §7 fee-line class it belongs to;
lib/packs/fees/finding.ts:11: *  - a PROVISIONAL marker array — {@link makeFeeFinding} REQUIRES the U1 marker on
lib/packs/fees/finding.ts:20:import type { Finding, Severity } from "../../verifier-core/index.ts";
lib/packs/fees/finding.ts:21:import { makeFinding } from "../../verifier-core/guard.ts";
lib/packs/fees/finding.ts:27:export const PROVISIONAL_U1 = "U1-base" as const;
lib/packs/fees/finding.ts:47:export type FeeVerdict =
lib/packs/fees/finding.ts:53:export const FEE_VERDICTS: readonly FeeVerdict[] = [
lib/packs/fees/finding.ts:60:/** A fee finding: a C2-valid core Finding + fee-domain state (both registers). */
lib/packs/fees/finding.ts:61:export interface FeeFinding extends Finding {
lib/packs/fees/finding.ts:63:  readonly verdict: FeeVerdict;
lib/packs/fees/finding.ts:64:  /** Plan §7 fee-line class this finding belongs to. */
lib/packs/fees/finding.ts:74:/** Raw input to {@link makeFeeFinding} — validated + frozen on the way out. */
lib/packs/fees/finding.ts:75:export interface FeeFindingInput {
lib/packs/fees/finding.ts:76:  readonly claim: Finding["claim"];
lib/packs/fees/finding.ts:80:  readonly verdict: FeeVerdict;
lib/packs/fees/finding.ts:88:export class MissingProvisionalMarkerError extends Error {
lib/packs/fees/finding.ts:89:  constructor(message: string) {
lib/packs/fees/finding.ts:96: * The ONLY sanctioned fee-finding constructor. Wraps verifier-core `makeFinding`
lib/packs/fees/finding.ts:102:export function makeFeeFinding(input: FeeFindingInput): FeeFinding {
lib/packs/fees/finding.ts:104:  const core = makeFinding({
lib/packs/fees/finding.ts:147:  readonly findings: readonly FeeFinding[];
lib/packs/fees/finding.ts:148:  /** Verdict tally — counts by {@link FeeVerdict}. */
lib/packs/fees/finding.ts:149:  readonly verdictTally: Readonly<Record<FeeVerdict, number>>;
lib/packs/fees/finding.ts:158:export function sortFeeFindings(findings: readonly FeeFinding[]): readonly FeeFinding[] {
lib/packs/fees/finding.ts:168:export function buildFeeReport(
lib/packs/fees/finding.ts:169:  findings: readonly FeeFinding[],
lib/packs/fees/finding.ts:172:  const sorted = sortFeeFindings(findings);
lib/packs/fees/finding.ts:173:  const verdictTally: Record<FeeVerdict, number> = {
lib/packs/fees/finding.ts:192:export function serializeFeeReport(report: FeeAuditReport): string {
lib/packs/fees/classified-audit.ts:4: * `auditWithClassification` layers an OPTIONAL, ADVISORY classifier pass on top of
lib/packs/fees/classified-audit.ts:5: * the UNCHANGED F1a deterministic engine: it calls `auditStatement` exactly as the
lib/packs/fees/classified-audit.ts:15: * this wiring as flowing "through makeFeeFinding" with a distinct `claim.source`.
lib/packs/fees/classified-audit.ts:16: * `makeFeeFinding` (lib/packs/fees/finding.ts) requires a {@link FeeVerdict} —
lib/packs/fees/classified-audit.ts:26: * Resolution (conservative): reuse the SAME universal C2 receipts constructor
lib/packs/fees/classified-audit.ts:27: * every finding in this repo is built through (`makeFinding`,
lib/packs/fees/classified-audit.ts:28: * verifier-core/guard.ts — the function `makeFeeFinding` itself wraps), and
lib/packs/fees/classified-audit.ts:29: * define a fees-domain advisory type ({@link ClassifierAdvisoryFinding})
lib/packs/fees/classified-audit.ts:30: * alongside it, entirely outside `FeeVerdict` / `buildFeeReport`. F1a goldens
lib/packs/fees/classified-audit.ts:33: * literal spec is the claim source: `ClaimSource` (verifier-core/claim.ts) gains the
lib/packs/fees/classified-audit.ts:56:import { makeFinding } from "../../verifier-core/guard.ts";
lib/packs/fees/classified-audit.ts:57:import type { Finding } from "../../verifier-core/index.ts";
lib/packs/fees/classified-audit.ts:58:import { auditStatement, claimIdPart, makeLineTagger } from "./audit.ts";
lib/packs/fees/classified-audit.ts:69: * One advisory, classifier-derived candidate — NOT a {@link FeeFinding}, has no
lib/packs/fees/classified-audit.ts:70: * {@link FeeVerdict}, and never gates `report.ok`. Built through the SAME core C2
lib/packs/fees/classified-audit.ts:71: * guard (`makeFinding`) every finding in this repo passes through, so it still
lib/packs/fees/classified-audit.ts:74:export interface ClassifierAdvisoryFinding extends Finding {
lib/packs/fees/classified-audit.ts:93:  /** Exactly `auditStatement(statement)` — byte-identical to the default path. */
lib/packs/fees/classified-audit.ts:96:  readonly advisoryFindings: readonly ClassifierAdvisoryFinding[];
lib/packs/fees/classified-audit.ts:102:function buildAdvisoryFinding(
lib/packs/fees/classified-audit.ts:107:): ClassifierAdvisoryFinding {
lib/packs/fees/classified-audit.ts:108:  const core = makeFinding({
lib/packs/fees/classified-audit.ts:141:export function auditWithClassification(
lib/packs/fees/classified-audit.ts:145:  const base = auditStatement(statement);
lib/packs/fees/classified-audit.ts:150:  const advisoryFindings: ClassifierAdvisoryFinding[] = [];
lib/packs/fees/classified-audit.ts:155:    advisoryFindings.push(buildAdvisoryFinding(line, lineTag(line), prediction, classifier));
lib/packs/fees/classified-audit.ts:158:  return Object.freeze({ base, advisoryFindings: Object.freeze(advisoryFindings) });
lib/agents/fee-classifier.ts:17: *  - PROVIDER = Groq free tier ONLY (`openai/gpt-oss-120b` class — the same
lib/agents/fee-classifier.ts:58:export function resolvedFeeClassifierModel(): string {
lib/agents/fee-classifier.ts:72:export const FeeClassifierOutputSchema = z.object({
lib/agents/fee-classifier.ts:110:export function buildFeeClassifierPrompt(input: ClassifierInput): string {
lib/agents/fee-classifier.ts:261:export const FEE_CLASSIFIER_SCHEMA_LABELS: readonly string[] = FeeClassifierOutputSchema.shape.predicted.options;
lib/packs/listings/acp-feed.ts:78:export function centsToDecimal(cents: number): string {
lib/packs/listings/acp-feed.ts:89:export function buildFaithfulFeed(sor: SyntheticCatalog): AcpFeed {
lib/packs/fees/classifier.ts:48:export const NOT_A_PERMITTED_FEE = "not-a-permitted-fee" as const;
lib/packs/fees/classifier.ts:51:export const TRUE_CATEGORY_LABELS: readonly TrueCategoryLabel[] = [
lib/packs/fees/classifier.ts:59:export function isTrueCategoryLabel(v: string): v is TrueCategoryLabel {
lib/packs/fees/classifier.ts:66: * the drift class the item EXERCISES vs. the true category it should be RELABELED to:
lib/packs/fees/classifier.ts:83: * classifier is allowed to use — the classifier never sees the §7 class or the
lib/packs/fees/classifier.ts:86:export const SEVEN_CLASS_TRUE_CATEGORY_NOTE: Readonly<Record<FeeLineClass, string>> = {
lib/packs/fees/classifier.ts:122:export function toClassifierInput(
lib/packs/fees/classifier.ts:148: * wiring stub satisfy this one interface, so `auditWithClassification` is agnostic
lib/packs/fees/classifier.ts:198:export const DeterministicBaselineClassifier: LineItemClassifier = {
lib/packs/fees/classifier.ts:228: * exercise the plumbing; the coverage eval still reports the deferred class deferred.
lib/packs/fees/classifier.ts:232:export function makeMockOracleClassifier(
lib/packs/fees/classifier.ts:262:export const LIVE_CLASSIFIER_DESIGN = {
lib/packs/listings/index.ts:16:export const LISTINGS_DRIFT_CLASSES = [
lib/packs/listings/index.ts:30:export const LISTINGS_PACK = {
lib/packs/fees/audit.ts:8: * reports. Every finding is built through {@link makeFeeFinding} (C2 receipts +
lib/packs/fees/audit.ts:39:  makeFeeFinding,
lib/packs/fees/audit.ts:42:  type FeeFinding,
lib/packs/fees/audit.ts:43:  type FeeVerdict,
lib/packs/fees/audit.ts:63:export const FEES_SPEC_VERSION =
lib/packs/fees/audit.ts:67:export const FEES_CLASSIFICATION_LABEL =
lib/packs/fees/audit.ts:122:function verdictPhrase(verdict: FeeVerdict, windowClose: string): string {
lib/packs/fees/audit.ts:146:export const claimIdPart = (s: string): string => s.replace(/%/g, "%25").replace(/#/g, "%23");
lib/packs/fees/audit.ts:153: * unreachable via the parser — a defensive contract for direct constructors).
lib/packs/fees/audit.ts:155:export function makeLineTagger(statement: MonthlyStatement): (l: StatementLine) => string {
lib/packs/fees/audit.ts:166:export function auditStatement(statement: MonthlyStatement): FeeAuditReport {
lib/packs/fees/audit.ts:167:  const findings: FeeFinding[] = [];
lib/packs/fees/audit.ts:180:      makeFeeFinding({
lib/packs/fees/audit.ts:197:      makeFeeFinding({
lib/packs/fees/audit.ts:229:            makeFeeFinding({
lib/packs/fees/audit.ts:244:          makeFeeFinding({
lib/packs/fees/audit.ts:267:      makeFeeFinding({
lib/packs/fees/audit.ts:297:): FeeVerdict {
lib/packs/fees/audit.ts:314:/** Report-grouping class for a d-1 (unlawful category) finding — a display hint. */
lib/packs/fees/audit.ts:331:function plainVerdict(verdict: FeeVerdict, windowClose: string): string {
lib/packs/fees/index.ts:20:export const FEE_LINE_CLASSES = [
lib/packs/fees/index.ts:32:export const FEES_PACK = {
lib/packs/fees/index.ts:58:  FEE_RULES,
lib/packs/fees/index.ts:69:export type { FeeFinding, FeeFindingInput, FeeVerdict, FeeAuditReport } from "./finding.ts";
lib/packs/fees/index.ts:73:  makeFeeFinding,
lib/packs/fees/index.ts:75:  sortFeeFindings,
lib/packs/fees/index.ts:82:  auditStatement,
lib/packs/fees/index.ts:117:export type { ClassifierAdvisoryFinding, ClassifiedFeeAuditReport } from "./classified-audit.ts";
lib/packs/fees/index.ts:118:export { auditWithClassification } from "./classified-audit.ts";
lib/packs/listings/generate.ts:22:export function mulberry32(seed: number): () => number {
lib/packs/listings/generate.ts:68:export function generateCatalog(seed: number, asOf: string): SyntheticCatalog {
lib/packs/listings/generate.ts:118:export const CORPUS_SEED = 20260703;
lib/packs/listings/generate.ts:119:export const CORPUS_AS_OF = "2026-07-03T00:00:00Z";
lib/agents/budget.ts:26:export const DEFAULT_BUDGET_CAP_USD = 5;
lib/agents/budget.ts:30:export class BudgetExceededError extends Error {
lib/agents/budget.ts:35:  constructor(spentUsd: number, nextEstimatedUsd: number, capUsd: number) {
lib/agents/budget.ts:53:export function assertWithinBudget(
lib/packs/fees/generate.ts:26:import { auditStatement, FEES_SPEC_VERSION } from "./audit.ts";
lib/packs/fees/generate.ts:27:import type { FeeAuditReport, FeeVerdict } from "./finding.ts";
lib/packs/fees/generate.ts:35:export const FEES_CORPUS_SEED = 20260703;
lib/packs/fees/generate.ts:56:  readonly expectedVerdict: FeeVerdict | null;
lib/packs/fees/generate.ts:108:export function buildFaithfulStatement(): MonthlyStatement {
lib/packs/fees/generate.ts:129:export function buildDriftedStatement(): MonthlyStatement {
lib/packs/fees/generate.ts:148:export function buildCuredStatement(): MonthlyStatement {
lib/packs/fees/generate.ts:163:export function buildConditionalStatement(): MonthlyStatement {
lib/packs/fees/generate.ts:174:export function buildFeeAnswerKey(): FeeAnswerKey {
lib/packs/fees/generate.ts:208:export function buildCorpusReports(): Readonly<Record<string, FeeAuditReport>> {
lib/packs/fees/generate.ts:210:    "statement.faithful.json": auditStatement(buildFaithfulStatement()),
lib/packs/fees/generate.ts:211:    "statement.drifted.json": auditStatement(buildDriftedStatement()),
lib/packs/fees/generate.ts:212:    "statement.cured.json": auditStatement(buildCuredStatement()),
lib/packs/fees/generate.ts:213:    "statement.conditional.json": auditStatement(buildConditionalStatement()),
lib/packs/fees/rules.ts:49: * Normalize a JSON-twin drift-class string (which uses spaces in the two
lib/packs/fees/rules.ts:64:export function normalizeTwinDriftClasses(twin: readonly string[]): readonly FeeLineClass[] {
lib/packs/fees/rules.ts:68:      throw new Error(`rules: unknown twin drift-class "${c}" — update DRIFT_CLASS_FROM_TWIN`);
lib/packs/fees/rules.ts:78:export const FEE_RULES: readonly FeeRule[] = [
lib/packs/fees/rules.ts:93:export const FEE_RULE_BY_ID: ReadonlyMap<string, FeeRule> = new Map(
lib/packs/fees/rules.ts:94:  FEE_RULES.map((r) => [r.id, r]),
lib/packs/fees/rules.ts:102:export const NON_STATEMENT_CHECKABLE: ReadonlyMap<string, string> = new Map([
lib/packs/fees/rules.ts:114: * MUST carry the U1 provisional marker ({@link makeFeeFinding} enforces it).
lib/packs/fees/rules.ts:116:export const BASE_DERIVED_RULE_IDS: ReadonlySet<string> = new Set(
lib/packs/fees/rules.ts:117:  FEE_RULES.filter((r) => r.base !== undefined).map((r) => r.id),
lib/packs/fees/rules.ts:127:export function perOrderCapExceeded(
lib/packs/fees/rules.ts:140:export function monthlyAverageExceeded(
lib/packs/fees/rules.ts:149:export function categoryUnlawful(declaredCategory: string): boolean {
lib/packs/fees/rules.ts:158:export function enhancedWithoutBasic(statement: MonthlyStatement): boolean {
lib/packs/fees/rules.ts:171:export function transactionPassthroughAllowed(line: StatementLine): boolean {
lib/packs/listings/report-view.ts:24:export interface FindingRow {
lib/packs/listings/report-view.ts:67:  readonly rows: readonly FindingRow[];
lib/packs/listings/report-view.ts:76:export function matchingModePlain(mode: MatchingMode): string {
lib/packs/listings/report-view.ts:87:export function toReportView(report: VerifierReport): ReportView {
lib/packs/listings/report-view.ts:89:  const rows: FindingRow[] = report.findings.map((f) => {
lib/agents/pricing.ts:20:export const PRICING_VERSION = "2026-06-18";
lib/agents/pricing.ts:25:export const GEMINI_PRICING: Record<string, ModelPrice> = {
lib/agents/pricing.ts:44:export function costUsd(
lib/packs/fees/parser.ts:21:export class StatementParseError extends Error {
lib/packs/fees/parser.ts:22:  constructor(message: string) {
lib/packs/fees/parser.ts:145:export function parseStatement(input: unknown): MonthlyStatement {
lib/packs/fees/cli.ts:21:import { auditStatement } from "./audit.ts";
lib/packs/fees/cli.ts:22:import type { FeeAuditReport, FeeFinding } from "./finding.ts";
lib/packs/fees/cli.ts:37:export function runFeeCheck(statementPath: string, opts: { json?: boolean } = {}): FeeCliResult {
lib/packs/fees/cli.ts:40:  const report = auditStatement(statement);
lib/packs/fees/cli.ts:45:const VERDICT_TAG: Readonly<Record<FeeFinding["verdict"], string>> = {
lib/packs/fees/cli.ts:53:export function renderFeeReportText(report: FeeAuditReport): string {
lib/packs/fees/statement.ts:33:export const LEGAL_FEE_CATEGORIES: readonly LegalFeeCategory[] = [
lib/packs/fees/statement.ts:41:export function isLegalFeeCategory(v: string): v is LegalFeeCategory {
lib/packs/fees/statement.ts:132:export const PURCHASE_PRICE_BASE_STATUS = "unresolved-U1" as const;
lib/packs/fees/statement.ts:139:export const ASSUMED_PURCHASE_PRICE_BASE =
lib/packs/listings/ucp.ts:43:export const UCP_PINNED_VERSION = "2026-04-08";
lib/packs/listings/ucp.ts:52:export function buildUcpResponse(
lib/agents/gemini.ts:54:export function resolvedGeminiModel(): string {
lib/agents/gemini.ts:164:export const LIVE_THINKING_BUDGET_TOKENS = 0;
lib/agents/gemini.ts:172:export function liveGenerationOptions(): {
lib/agents/gemini.ts:252:export function estimateLiveCallCostUsd(
lib/packs/listings/conformance.ts:45:import { makeFinding, type FindingInput } from "../../verifier-core/guard.ts";
lib/packs/listings/conformance.ts:51:export const DEFAULT_UCP_SCHEMA_DIR = join(
lib/packs/listings/conformance.ts:60:export const UCP_CATALOG_OPERATIONS = {
lib/packs/listings/conformance.ts:72:export function conformanceRuleId(keyword: string): string {
lib/packs/listings/conformance.ts:130:export function loadUcpValidators(schemaDir: string = DEFAULT_UCP_SCHEMA_DIR): LoadedValidator {
lib/packs/listings/conformance.ts:170:export function errorToFinding(op: UcpCatalogOp, err: ErrorObject): FindingInput {
lib/packs/listings/conformance.ts:210:export function runUcpConformance(
lib/packs/listings/conformance.ts:221:  // uses (makeFinding throws on any missing receipt); buildReport re-asserts it.
lib/packs/listings/conformance.ts:224:    : (validate.errors ?? []).map((e) => makeFinding(errorToFinding(op, e)));
lib/packs/listings/reference.ts:27:export function expectedTitle(item: SorItem, variation: SorVariation): string {
lib/packs/listings/reference.ts:32:export function indexCatalog(sor: SyntheticCatalog): {
lib/packs/listings/reference.ts:54:export function sorReference(sor: SyntheticCatalog): Reference {
lib/packs/listings/cli.ts:37:export function runCheck(
lib/packs/listings/cli.ts:63: * (`--against`): the reference is the schema, not the merchant catalog. Findings
lib/packs/listings/cli.ts:66:export function runConformanceCheck(
lib/packs/listings/cli.ts:91:export function runDemo(opts: { json?: boolean } = {}): DemoCliResult {
lib/agents/groq.ts:32:export function resolvedGroqModel(): string {
lib/packs/listings/ucp-wire.ts:87:export function buildUcpSearchResponse(sor: SyntheticCatalog): UcpSearchResponse {
lib/packs/listings/ucp-wire.ts:118:export function ucpSearchResponseToClaims(doc: UcpSearchResponse): readonly Claim[] {
lib/packs/listings/ucp-corpus.ts:35:  /** For invalid fixtures: the single `LST-CONF-*` class it violates. */
lib/packs/listings/ucp-corpus.ts:52:export function buildUcpConformanceCorpus(sor: SyntheticCatalog): UcpConformanceCorpus {
lib/packs/listings/ucp-corpus.ts:127:  // ---- INVALID (one named violation class each) ----
lib/packs/listings/drift.ts:5: * ground-truth manifest (class · target · before/after · surfaces). Injection is
lib/packs/listings/drift.ts:10: * and every class is independently detectable). The manifest is what the C6
lib/packs/listings/drift.ts:71:export function applyCorpusDrift(
lib/packs/listings/drift.ts:135:      // §7 lists sale_price>price under the PRICE class (the cross-field-invariant
lib/packs/listings/drift.ts:136:      // class covers eligibility implications + missing conditionals).
lib/packs/listings/adapters.ts:44:export function acpFeedToClaims(feed: AcpFeed): readonly Claim[] {
lib/packs/listings/adapters.ts:76:export function ucpResponseToClaims(resp: UcpCatalogResponseFixture): readonly Claim[] {
lib/packs/listings/detectors.ts:4: * Each rule: a stable ruleId (cited in every finding, C2), the §7 drift class it
lib/packs/listings/detectors.ts:16:import type { FindingInput } from "../../verifier-core/guard.ts";
lib/packs/listings/detectors.ts:23:export function mojibake(s: string): string {
lib/packs/listings/detectors.ts:33:export const listingsDetectors: readonly Detector[] = [
lib/packs/listings/detectors.ts:47:      } satisfies FindingInput,
lib/packs/listings/detectors.ts:236:  // cross-field — extracted ACP invariants (sale_price ≤ price is a PRICE-class drift per §7).
lib/packs/listings/detectors.ts:240:    const out: FindingInput[] = [];
lib/packs/listings/demo/index.ts:24:  DemoFinding,
lib/packs/listings/demo/transcript.ts:30:import type { Finding } from "../../../verifier-core/evidence.ts";
lib/packs/listings/demo/transcript.ts:35:import { toReportView, type FindingRow } from "../report-view.ts";
lib/packs/listings/demo/transcript.ts:59:function findingsForRow(report: VerifierReport, itemId: string): FindingRow[] {
lib/packs/listings/demo/transcript.ts:63:      (f: Finding) => f.claim.id.split("#")[0] === itemId || f.referenceRowId === itemId,
lib/packs/listings/demo/transcript.ts:97:  rows: FindingRow[],
lib/packs/listings/demo/transcript.ts:98:  totalFindingCount: number,
lib/packs/listings/demo/transcript.ts:109:      `${k} ${noun} for the selected item ("${selection.selectedTitle}"); full report: ${totalFindingCount} findings across the whole copy.`,
lib/packs/listings/demo/transcript.ts:124:function conformanceFoilBeat(conf: VerifierReport, truthRows: FindingRow[]): DemoBeat {
lib/packs/listings/demo/transcript.ts:126:  const truthFindings = truthRows.length;
lib/packs/listings/demo/transcript.ts:133:      `${DEMO_FOIL_LINE} — conformance: ${conformant ? "PASS" : "FAIL"} (spec-shape); truth: ${truthFindings} finding(s) vs the system-of-record.`,
lib/packs/listings/demo/transcript.ts:139:        ok: truthFindings === 0,
lib/packs/listings/demo/transcript.ts:140:        label: truthFindings === 0 ? "TRUE vs SOR" : "FALSE vs SOR (still lies)",
lib/packs/listings/demo/transcript.ts:147:export function buildDemoTranscript(inputs: DemoInputs): DemoTranscript {
lib/packs/listings/demo/transcript.ts:171:    totalFindingCount: report.findings.length,
lib/packs/listings/demo/render-text.ts:13:import type { DemoBeat, DemoFinding, DemoTranscript } from "./types.ts";
lib/packs/listings/demo/render-text.ts:18:function findingBlock(f: DemoFinding, index: number): string[] {
lib/packs/listings/demo/render-text.ts:44:export function renderDemoText(t: DemoTranscript): string {
lib/packs/listings/demo/copy.ts:23:export const DEMO_CLAIM =
lib/packs/listings/demo/copy.ts:31:export const DEMO_ACTOR_LABEL = "spec-faithful demonstration actor — simulated";
lib/packs/listings/demo/copy.ts:39:export const DEMO_INTENT_TITLE = "Smoked Brisket Plate";
lib/packs/listings/demo/copy.ts:45:export const DEMO_FOIL_LINE = "passes the official schema check; still lies";
lib/packs/listings/demo/copy.ts:53:export const DEMO_SIMULATED_BANNER =
lib/packs/listings/demo/copy.ts:57:export const DEMO_BEAT = {
lib/packs/listings/demo/copy.ts:81:export const DEMO_SUBHEAD =
lib/packs/listings/demo/types.ts:10:import type { FindingRow } from "../report-view.ts";
lib/packs/listings/demo/types.ts:13:export type DemoFinding = FindingRow;
lib/packs/listings/demo/types.ts:56:  readonly findings?: readonly DemoFinding[];
lib/packs/listings/demo/types.ts:81:  readonly totalFindingCount: number;
lib/packs/listings/demo/actor.ts:28:export function selectFromSurface(feed: AcpFeed): ActorSelection {

codex
A material nuance is emerging: the engine already has canonical serializers for some reports, but the plan says “registry output byte-equals direct engine call output.” That phrasing is ambiguous because object equality, JSON string equality, and CLI serialization are different contracts here.
exec
/bin/zsh -lc 'rg -n "serializeReport|JSON.stringify|Object.freeze|makeFinding|FindingInput|ClaimSource|export type|export interface" lib/verifier-core lib/packs/listings lib/packs/fees evals tests package.json' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc 'rg -n "import-graph|banned|network|LLM|makeFinding|makeFeeFinding|byte|golden|differential|serializer|serialize" evals lib tests package.json' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc 'nl -ba lib/packs/listings/cli.ts && nl -ba lib/verifier-core/report.ts && nl -ba lib/verifier-core/verify.ts && nl -ba lib/verifier-core/guard.ts && nl -ba lib/verifier-core/claim.ts && nl -ba lib/verifier-core/evidence.ts' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
lib/packs/listings/run.ts:15:import { makeFinding } from "../../verifier-core/guard.ts";
lib/packs/listings/run.ts:62:        makeFinding({
lib/packs/listings/run.ts:73:        makeFinding({
lib/packs/listings/run.ts:93:        makeFinding({
lib/packs/listings/ucp-wire.ts:35:export interface UcpPrice {
lib/packs/listings/ucp-wire.ts:41:export interface UcpWireVariant {
lib/packs/listings/ucp-wire.ts:50:export interface UcpWireProduct {
lib/packs/listings/ucp-wire.ts:59:export interface UcpSearchResponse {
lib/verifier-core/index.ts:12:export type { Claim, ClaimSource } from "./claim.ts";
lib/verifier-core/index.ts:13:export type { MatchingMode, Reference, ReferenceKind, ReferenceMatch } from "./reference.ts";
lib/verifier-core/index.ts:14:export type { Finding, Severity } from "./evidence.ts";
lib/verifier-core/index.ts:16:export type { VerifierReport } from "./report.ts";
lib/verifier-core/index.ts:17:export type { FindingInput } from "./guard.ts";
lib/verifier-core/index.ts:18:export { MissingEvidenceError, assertHasEvidence, makeFinding } from "./guard.ts";
lib/verifier-core/index.ts:19:export type { Detector, VerifyOptions } from "./verify.ts";
lib/verifier-core/index.ts:20:export { buildReport, serializeReport, sortFindings, verifyClaims } from "./verify.ts";
lib/packs/fees/finding.ts:5: * built through the ONLY sanctioned constructor `makeFinding`) EXTENDED with the
lib/packs/fees/finding.ts:21:import { makeFinding } from "../../verifier-core/guard.ts";
lib/packs/fees/finding.ts:47:export type FeeVerdict =
lib/packs/fees/finding.ts:61:export interface FeeFinding extends Finding {
lib/packs/fees/finding.ts:75:export interface FeeFindingInput {
lib/packs/fees/finding.ts:96: * The ONLY sanctioned fee-finding constructor. Wraps verifier-core `makeFinding`
lib/packs/fees/finding.ts:102:export function makeFeeFinding(input: FeeFindingInput): FeeFinding {
lib/packs/fees/finding.ts:104:  const core = makeFinding({
lib/packs/fees/finding.ts:123:  return Object.freeze({
lib/packs/fees/finding.ts:127:    provisional: Object.freeze([...provisional]),
lib/packs/fees/finding.ts:134:export interface FeeAuditReport {
lib/packs/fees/finding.ts:180:  return Object.freeze({
lib/packs/fees/finding.ts:186:    verdictTally: Object.freeze(verdictTally),
lib/packs/fees/finding.ts:193:  return `${JSON.stringify(report, null, 2)}\n`;
lib/packs/listings/acp-feed.ts:31:export type AcpAvailability =
lib/packs/listings/acp-feed.ts:39:export interface AcpFeedItem {
lib/packs/listings/acp-feed.ts:71:export interface AcpFeed {
lib/packs/fees/classified-audit.ts:27: * every finding in this repo is built through (`makeFinding`,
lib/packs/fees/classified-audit.ts:33: * literal spec is the claim source: `ClaimSource` (verifier-core/claim.ts) gains the
lib/packs/fees/classified-audit.ts:56:import { makeFinding } from "../../verifier-core/guard.ts";
lib/packs/fees/classified-audit.ts:71: * guard (`makeFinding`) every finding in this repo passes through, so it still
lib/packs/fees/classified-audit.ts:74:export interface ClassifierAdvisoryFinding extends Finding {
lib/packs/fees/classified-audit.ts:92:export interface ClassifiedFeeAuditReport {
lib/packs/fees/classified-audit.ts:108:  const core = makeFinding({
lib/packs/fees/classified-audit.ts:123:  return Object.freeze({
lib/packs/fees/classified-audit.ts:158:  return Object.freeze({ base, advisoryFindings: Object.freeze(advisoryFindings) });
lib/packs/listings/reference.ts:20:export interface SorTruth {
lib/packs/listings/ucp-corpus.ts:27:export type UcpCorpusOp = "search" | "lookup" | "get_product";
lib/packs/listings/ucp-corpus.ts:30:export interface UcpCorpusEntry {
lib/packs/listings/ucp-corpus.ts:42:export interface UcpConformanceCorpus {
lib/packs/listings/index.ts:27:export type ListingsDriftClass = (typeof LISTINGS_DRIFT_CLASSES)[number];
lib/packs/listings/index.ts:39:export type { SorItem, SorModifierList, SorVariation, SorStockState, SyntheticCatalog } from "./types.ts";
lib/packs/listings/index.ts:41:export type { AcpAvailability, AcpFeed, AcpFeedItem } from "./acp-feed.ts";
lib/packs/listings/index.ts:43:export type { DriftManifestEntry, DriftSurface, DriftedFeedBundle } from "./drift.ts";
lib/packs/listings/index.ts:45:export type { UcpCatalogItem, UcpCatalogResponseFixture } from "./ucp.ts";
lib/packs/listings/index.ts:47:export type {
lib/verifier-core/claim.ts:21:export type ClaimSource = "acp-feed" | "ucp-catalog" | "fee-statement" | "classifier";
lib/verifier-core/claim.ts:24:export interface Claim {
lib/verifier-core/claim.ts:28:  readonly source: ClaimSource;
lib/packs/listings/conformance.ts:45:import { makeFinding, type FindingInput } from "../../verifier-core/guard.ts";
lib/packs/listings/conformance.ts:66:export type UcpCatalogOp = keyof typeof UCP_CATALOG_OPERATIONS;
lib/packs/listings/conformance.ts:170:export function errorToFinding(op: UcpCatalogOp, err: ErrorObject): FindingInput {
lib/packs/listings/conformance.ts:195:export interface ConformanceOptions {
lib/packs/listings/conformance.ts:221:  // uses (makeFinding throws on any missing receipt); buildReport re-asserts it.
lib/packs/listings/conformance.ts:224:    : (validate.errors ?? []).map((e) => makeFinding(errorToFinding(op, e)));
lib/packs/fees/classifier.ts:45:export type TrueCategoryLabel = LegalFeeCategory | "not-a-permitted-fee";
lib/packs/fees/classifier.ts:104:export interface ClassifierInput {
lib/packs/fees/classifier.ts:138:export interface ClassifierPrediction {
lib/packs/fees/classifier.ts:153:export interface LineItemClassifier {
lib/verifier-core/guard.ts:8: * `makeFinding` is the single constructor every detector calls; it validates the
lib/verifier-core/guard.ts:20:/** Raw input to {@link makeFinding} — same shape as Finding, validated at runtime. */
lib/verifier-core/guard.ts:21:export interface FindingInput {
lib/verifier-core/guard.ts:47:export function makeFinding(input: FindingInput): Finding {
lib/verifier-core/guard.ts:72:  return Object.freeze({
lib/verifier-core/guard.ts:85: * that did not necessarily pass through {@link makeFinding}).
lib/verifier-core/guard.ts:88:  makeFinding(finding);
lib/packs/listings/ucp.ts:21:export interface UcpCatalogItem {
lib/packs/listings/ucp.ts:32:export interface UcpCatalogResponseFixture {
lib/packs/listings/adapters.ts:23:export interface AcpInvariantsValue {
lib/verifier-core/reference.ts:15:export type ReferenceKind = "json-schema" | "pos-catalog" | "fee-rule-table";
lib/verifier-core/reference.ts:18:export type MatchingMode = "synthetic-controlled" | "real-world";
lib/verifier-core/reference.ts:21:export interface ReferenceMatch {
lib/verifier-core/reference.ts:35:export interface Reference {
lib/packs/listings/report-view.ts:24:export interface FindingRow {
lib/packs/listings/report-view.ts:44:export interface SeverityTally {
lib/packs/listings/report-view.ts:51:export interface ReportView {
lib/packs/listings/report-view.ts:72:  return typeof value === "string" ? value : JSON.stringify(value);
lib/verifier-core/verify.ts:19:import { makeFinding, type FindingInput } from "./guard.ts";
lib/verifier-core/verify.ts:27:export type Detector = (claim: Claim, match: ReferenceMatch | null) => readonly FindingInput[];
lib/verifier-core/verify.ts:30:export interface VerifyOptions {
lib/verifier-core/verify.ts:54: * through {@link makeFinding} (C2: no finding without all four receipts).
lib/verifier-core/verify.ts:66:        findings.push(makeFinding(input));
lib/verifier-core/verify.ts:82:  const validated = findings.map((f) => makeFinding(f));
lib/verifier-core/verify.ts:84:  return Object.freeze({
lib/verifier-core/verify.ts:97:export function serializeReport(report: VerifierReport): string {
lib/verifier-core/verify.ts:98:  return `${JSON.stringify(report, null, 2)}\n`;
lib/packs/listings/detectors.ts:16:import type { FindingInput } from "../../verifier-core/guard.ts";
lib/packs/listings/detectors.ts:47:      } satisfies FindingInput,
lib/packs/listings/detectors.ts:240:    const out: FindingInput[] = [];
lib/packs/fees/index.ts:29:export type FeeLineClass = (typeof FEE_LINE_CLASSES)[number];
lib/packs/fees/index.ts:41:export type {
lib/packs/fees/index.ts:56:export type { FeeRule, FeeRuleKind } from "./rules.ts";
lib/packs/fees/index.ts:69:export type { FeeFinding, FeeFindingInput, FeeVerdict, FeeAuditReport } from "./finding.ts";
lib/packs/fees/index.ts:86:export type { FeeAnswerKey, FeeAnswerKeyEntry, FeeDetectionMode } from "./generate.ts";
lib/packs/fees/index.ts:101:export type {
lib/packs/fees/index.ts:117:export type { ClassifierAdvisoryFinding, ClassifiedFeeAuditReport } from "./classified-audit.ts";
lib/packs/listings/demo/index.ts:20:export type {
evals/gold/metrics.ts:42:export interface LabeledPrediction {
evals/gold/metrics.ts:48:export interface ConfusionMatrix {
evals/gold/metrics.ts:59:export interface MetricReport {
evals/gold/metrics.ts:170:export interface LabeledClassification<L extends string = string> {
lib/packs/listings/drift.ts:26:export type DriftSurface = "both" | "acp-only" | "ucp-only";
lib/packs/listings/drift.ts:29:export interface DriftManifestEntry {
lib/packs/listings/drift.ts:47:export interface DriftedFeedBundle {
lib/packs/fees/generate.ts:44:export type FeeDetectionMode = "deterministic" | "deferred-to-classifier";
lib/packs/fees/generate.ts:47:export interface FeeAnswerKeyEntry {
lib/packs/fees/generate.ts:63:export interface FeeAnswerKey {
lib/packs/listings/types.ts:17:export type SorStockState = "in_stock" | "soldout_86" | "hidden";
lib/packs/listings/types.ts:20:export interface SorVariation {
lib/packs/listings/types.ts:31:export interface SorModifierOption {
lib/packs/listings/types.ts:38:export interface SorModifierList {
lib/packs/listings/types.ts:45:export interface SorItem {
lib/packs/listings/types.ts:55:export interface SyntheticCatalog {
lib/packs/fees/statement.ts:26:export type LegalFeeCategory =
lib/packs/fees/statement.ts:52:export type DeclaredCategory = string;
lib/packs/fees/statement.ts:55:export interface StatementLine {
lib/packs/fees/statement.ts:88:export interface StatementGenerator {
lib/packs/fees/statement.ts:95:export interface StatementMeta {
lib/packs/fees/statement.ts:120:export interface MonthlyStatement {
evals/gold/fee-lines-gold.ts:32:export type GoldStratum = FeeLineClass | "clean";
evals/gold/fee-lines-gold.ts:34:export interface FeeLineGoldItem {
lib/verifier-core/evidence.ts:16:export type Severity = "info" | "warn" | "error";
lib/verifier-core/evidence.ts:24:export interface Finding {
lib/packs/listings/cli.ts:17:import { serializeReport } from "../../verifier-core/verify.ts";
lib/packs/listings/cli.ts:27:export type CliSurface = "acp" | "ucp";
lib/packs/listings/cli.ts:29:export interface CliResult {
lib/packs/listings/cli.ts:54:    output: serializeReport(report),
lib/packs/listings/cli.ts:73:  return { report, output: serializeReport(report), exitCode: report.ok ? 0 : 1 };
lib/packs/listings/cli.ts:77:export interface DemoCliResult {
lib/packs/listings/cli.ts:105:    ? `${JSON.stringify(transcript, null, 2)}\n`
lib/verifier-core/report.ts:15:export interface VerifierReport {
lib/packs/listings/demo/transcript.ts:47:export interface DemoInputs {
lib/packs/fees/rules.ts:21:export type FeeRuleKind =
lib/packs/fees/rules.ts:30:export interface FeeRule {
evals/core/verifier-engine.test.ts:6:  makeFinding,
evals/core/verifier-engine.test.ts:7:  serializeReport,
evals/core/verifier-engine.test.ts:27:describe("C2 evidence guard (makeFinding)", () => {
evals/core/verifier-engine.test.ts:29:    const f = makeFinding(validInput);
evals/core/verifier-engine.test.ts:43:    expect(() => makeFinding(input)).toThrow(MissingEvidenceError);
evals/core/verifier-engine.test.ts:59:    const report = buildReport([makeFinding(validInput)], opts);
evals/core/verifier-engine.test.ts:64:    const evil = { ...makeFinding(validInput), ruleId: "" };
evals/core/verifier-engine.test.ts:69:    const a = makeFinding({ ...validInput, category: "price", ruleId: "R-2" });
evals/core/verifier-engine.test.ts:70:    const b = makeFinding({ ...validInput, category: "price", ruleId: "R-1" });
evals/core/verifier-engine.test.ts:71:    const c = makeFinding({ ...validInput, category: "availability", ruleId: "R-9" });
evals/core/verifier-engine.test.ts:76:  it("serializeReport is byte-stable for identical reports", () => {
evals/core/verifier-engine.test.ts:77:    const r1 = buildReport([makeFinding(validInput)], opts);
evals/core/verifier-engine.test.ts:78:    const r2 = buildReport([makeFinding(validInput)], opts);
evals/core/verifier-engine.test.ts:79:    expect(serializeReport(r1)).toBe(serializeReport(r2));
evals/gold/fee-classifier-calibration.live.test.ts:122:        `tune-phase fallback(s): ${JSON.stringify(tuneRecords.filter((r) => r.modes.some((m) => m !== "LIVE_CLASSIFIER")).map((r) => ({ id: r.id, errors: r.errorClasses })))}`,
evals/gold/fee-classifier-calibration.live.test.ts:236:      writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
evals/gold/fee-classifier-calibration.live.test.ts:250:        `scored-phase fallback(s): ${JSON.stringify(scoredFallbacks)}`,
lib/packs/listings/demo/types.ts:13:export type DemoFinding = FindingRow;
lib/packs/listings/demo/types.ts:16:export interface ActorSelection {
lib/packs/listings/demo/types.ts:33:export interface DemoVerdict {
lib/packs/listings/demo/types.ts:40:export type DemoBeatId =
lib/packs/listings/demo/types.ts:47:export interface DemoBeat {
lib/packs/listings/demo/types.ts:69:export interface DemoTranscript {
lib/packs/fees/cli.ts:26:export interface FeeCliResult {
evals/packs/fees-finding-u1.test.ts:10:  type FeeFindingInput,
evals/packs/fees-finding-u1.test.ts:16: * wraps the core C2 guard (makeFinding) AND requires the U1 provisional marker on
evals/packs/fees-finding-u1.test.ts:21:const baseInput = (over: Partial<FeeFindingInput>): FeeFindingInput => ({
evals/packs/listings-wedge.test.ts:16:import { serializeReport } from "@/lib/verifier-core";
evals/packs/listings-wedge.test.ts:26:const asJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;
evals/packs/listings-wedge.test.ts:109:    expect(serializeReport(report)).toBe(readFixture("expected-report.acp.json"));
evals/packs/listings-wedge.test.ts:118:    expect(serializeReport(report)).toBe(readFixture("expected-report.ucp.json"));
evals/packs/listings-wedge.test.ts:124:    expect(serializeReport(r1)).toBe(serializeReport(r2));
evals/packs/fees-classifier.test.ts:21:import { makeFinding } from "@/lib/verifier-core/guard";
evals/packs/fees-classifier.test.ts:191:      makeFinding({
evals/packs/fees-parser.test.ts:38:    const fromStr = parseStatement(JSON.stringify(validStatement));
evals/packs/ucp-conformance.test.ts:31:const asJson = (v: unknown): string => `${JSON.stringify(v, null, 2)}\n`;
evals/packs/fees-freeze.test.ts:23:const asJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;
lib/packs/fees/parser.ts:88:    throw new StatementParseError(`meta.currency must be "USD" (got ${JSON.stringify(raw.currency)})`);

 succeeded in 0ms:
tests/test_t001.py:29:    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
tests/test_t001.py:62:        self.assertEqual(before, _sha256(C.SOURCE_CSV), "source CSV must be byte-identical after a run")
tests/test_t002.py:23:GOLDEN_PATH = REPO / "eval" / "golden_merchants.v1.json"
tests/test_t002.py:29:    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
tests/test_t002.py:41:    def test_e01_golden_file_schema(self):
tests/test_t002.py:43:        golden = E.load_json(GOLDEN_PATH)
tests/test_t002.py:44:        self.assertEqual(golden["eval_version"], "golden_merchants.v1")
tests/test_t002.py:45:        self.assertEqual(len(golden["merchants"]), 20)
tests/test_t002.py:46:        for m in golden["merchants"]:
tests/test_t002.py:66:    # E2b — golden metadata matches current config
tests/test_t002.py:67:    def test_e02b_golden_metadata_matches_config(self):
tests/test_t002.py:68:        golden = E.load_json(GOLDEN_PATH)
tests/test_t002.py:69:        failures = E.validate_golden_metadata(golden, C.SOURCE_CSV)
tests/test_t002.py:73:    def test_e02_golden_source_hash_matches_live(self):
tests/test_t002.py:74:        golden = E.load_json(GOLDEN_PATH)
tests/test_t002.py:75:        self.assertEqual(golden["source_csv_sha256"], _sha256(C.SOURCE_CSV))
tests/test_t002.py:78:    def test_e03_pipeline_matches_golden_merchants(self):
tests/test_t002.py:79:        golden = E.load_json(GOLDEN_PATH)
tests/test_t002.py:82:        merchant_eval = E.compare_merchants(golden["merchants"], result["merchants"])
tests/test_t002.py:88:        golden = E.load_json(GOLDEN_PATH)
tests/test_t002.py:91:        agg, ok = E._check_aggregate(result, golden["aggregate_expectations"])
tests/test_t002.py:154:    def test_e09_golden_risk_scores_match_formula(self):
tests/test_t002.py:155:        golden = E.load_json(GOLDEN_PATH)
tests/test_t002.py:159:        for g in golden["merchants"]:
lib/agents/fee-classifier.ts:23: * $0-LLM / zero-network structural proofs (fees-classifier.test.ts,
lib/agents/fee-classifier.ts:24: * fees-cli.test.ts import-graph walks) MUST keep holding for the deterministic
lib/agents/fee-classifier.ts:26: * live lane. Wiring here keeps "the deterministic verifier is provably network-free"
lib/agents/fee-classifier.ts:216: * bypasses the gate (no network, no key). Never throws on a live failure — it degrades to
lib/packs/listings/run.ts:15:import { makeFinding } from "../../verifier-core/guard.ts";
lib/packs/listings/run.ts:62:        makeFinding({
lib/packs/listings/run.ts:73:        makeFinding({
lib/packs/listings/run.ts:93:        makeFinding({
evals/gold/metrics.ts:35: * network. The math is unit-tested (`metrics.test.ts`, ported from the legacy
lib/packs/listings/acp-feed.ts:22: *   url-must-resolve rule is a live-network check, out of the $0 offline wedge).
lib/packs/listings/ucp.ts:10: * deterministically from the same drifted feed state so the C3 differential test
lib/agents/gemini.ts:2: * The single Gemini boundary for the product's LLM drafting. Ported from resilix
lib/agents/gemini.ts:8: * here bills; tests drive it via an injected `generate` (no network, no spend).
lib/agents/gemini.ts:90: * both the pass and the fail path with no network.
lib/agents/gemini.ts:198: * unit-reachable without network.
lib/packs/listings/generate.ts:4: * Pure function of the seed: same seed → byte-identical catalog. Uses a local
lib/agents/groq.ts:11: * + reported usage. An injected `generate` keeps this unit-reachable with no network, no spend
lib/agents/groq.ts:75: * Injected `generate` = the test/DI path (no network, no spend).
lib/packs/listings/conformance.ts:27: * `test:ucp-oracle` CI lane is the differential check on that boundary.
lib/packs/listings/conformance.ts:29: * $0 / offline: reads pinned JSON Schemas from disk, zero network, zero LLM,
lib/packs/listings/conformance.ts:45:import { makeFinding, type FindingInput } from "../../verifier-core/guard.ts";
lib/packs/listings/conformance.ts:221:  // uses (makeFinding throws on any missing receipt); buildReport re-asserts it.
lib/packs/listings/conformance.ts:224:    : (validate.errors ?? []).map((e) => makeFinding(errorToFinding(op, e)));
lib/packs/listings/detectors.ts:21:/** Deterministic mojibake transform (UTF-8 bytes read as Latin-1) — the
lib/packs/listings/detectors.ts:106:          plainLine: `The price is serialized in cents (${actual}) where dollars are expected (${expected}) — a 100× overstatement.`,
lib/packs/listings/cli.ts:8: * makes ZERO LLM/network calls; the $0 property is enforced by an import-graph
lib/packs/listings/cli.ts:17:import { serializeReport } from "../../verifier-core/verify.ts";
lib/packs/listings/cli.ts:54:    output: serializeReport(report),
lib/packs/listings/cli.ts:64: * are the `LST-CONF-*` family. Zero LLM / network; reads pinned schemas from disk.
lib/packs/listings/cli.ts:73:  return { report, output: serializeReport(report), exitCode: report.ok ? 0 : 1 };
lib/packs/listings/cli.ts:87: * transcript JSON (`--json`). Zero LLM / network; reads fixtures + pinned schemas
lib/packs/listings/report-view.ts:6: * dependency-free: NO `node:fs`, NO network, NO LLM, no clock reads — so the
lib/packs/listings/report-view.ts:7: * report-rendering path is provably $0 and the import-graph eval can prove it.
lib/verifier-core/verify.ts:9: * and report assembly. Zero LLM, zero network, zero clock reads (any "now" must
lib/verifier-core/verify.ts:10: * arrive as data so identical inputs give byte-identical reports).
lib/verifier-core/verify.ts:19:import { makeFinding, type FindingInput } from "./guard.ts";
lib/verifier-core/verify.ts:41: * output ordering is what makes golden-report byte-comparison possible.
lib/verifier-core/verify.ts:54: * through {@link makeFinding} (C2: no finding without all four receipts).
lib/verifier-core/verify.ts:66:        findings.push(makeFinding(input));
lib/verifier-core/verify.ts:82:  const validated = findings.map((f) => makeFinding(f));
lib/verifier-core/verify.ts:95: * golden fixtures, tests) uses, so byte-identity is meaningful.
lib/verifier-core/verify.ts:97:export function serializeReport(report: VerifierReport): string {
lib/verifier-core/index.ts:18:export { MissingEvidenceError, assertHasEvidence, makeFinding } from "./guard.ts";
lib/verifier-core/index.ts:20:export { buildReport, serializeReport, sortFindings, verifyClaims } from "./verify.ts";
lib/packs/listings/drift.ts:11: * coverage eval and the C3 differential test measure against.
lib/packs/listings/drift.ts:25:/** Which serving surfaces carry a given injected drift (C3 differential). */
lib/packs/listings/drift.ts:112:      note: "cents-vs-decimal drift: amount serialized as raw cents",
lib/packs/listings/drift.ts:312:    // Deterministic mojibake: encode the title's UTF-8 bytes as Latin-1 chars.
lib/agents/budget.ts:7: * never fires. Pure + DI-friendly (spent/next/cap are params, no global, no network),
lib/verifier-core/guard.ts:8: * `makeFinding` is the single constructor every detector calls; it validates the
lib/verifier-core/guard.ts:20:/** Raw input to {@link makeFinding} — same shape as Finding, validated at runtime. */
lib/verifier-core/guard.ts:47:export function makeFinding(input: FindingInput): Finding {
lib/verifier-core/guard.ts:85: * that did not necessarily pass through {@link makeFinding}).
lib/verifier-core/guard.ts:88:  makeFinding(finding);
lib/product.ts:5: * differential oracle's REFERENCE_PLATFORM_NAME ("DoorDash") — the core keeps that
lib/product.ts:6: * default so the byte-for-byte Python oracle stays green, while the product passes this
evals/agents/fee-classifier-live-lane.test.ts:15: * with NO network: the live boundary is exercised through the injected `generate`
lib/packs/listings/ucp-corpus.ts:8: * and the freeze-integrity eval (which byte-locks every committed fixture to this
lib/packs/listings/ucp-corpus.ts:182:    note: "Constructed-simulation UCP catalog-response corpus for the W2 conformance leg. Each invalid fixture violates exactly ONE named schema rule. Verdicts asserted in evals/packs/ucp-conformance.test.ts; optional cargo differential oracle in scripts-ts/ucp-oracle-diff.mts.",
lib/packs/listings/adapters.ts:7: * response produce comparable claims, and the C3 differential test can assert
evals/core/verifier-engine.test.ts:6:  makeFinding,
evals/core/verifier-engine.test.ts:7:  serializeReport,
evals/core/verifier-engine.test.ts:15: * deterministic ordering (what makes golden byte-comparison meaningful).
evals/core/verifier-engine.test.ts:27:describe("C2 evidence guard (makeFinding)", () => {
evals/core/verifier-engine.test.ts:29:    const f = makeFinding(validInput);
evals/core/verifier-engine.test.ts:43:    expect(() => makeFinding(input)).toThrow(MissingEvidenceError);
evals/core/verifier-engine.test.ts:59:    const report = buildReport([makeFinding(validInput)], opts);
evals/core/verifier-engine.test.ts:64:    const evil = { ...makeFinding(validInput), ruleId: "" };
evals/core/verifier-engine.test.ts:69:    const a = makeFinding({ ...validInput, category: "price", ruleId: "R-2" });
evals/core/verifier-engine.test.ts:70:    const b = makeFinding({ ...validInput, category: "price", ruleId: "R-1" });
evals/core/verifier-engine.test.ts:71:    const c = makeFinding({ ...validInput, category: "availability", ruleId: "R-9" });
evals/core/verifier-engine.test.ts:76:  it("serializeReport is byte-stable for identical reports", () => {
evals/core/verifier-engine.test.ts:77:    const r1 = buildReport([makeFinding(validInput)], opts);
evals/core/verifier-engine.test.ts:78:    const r2 = buildReport([makeFinding(validInput)], opts);
evals/core/verifier-engine.test.ts:79:    expect(serializeReport(r1)).toBe(serializeReport(r2));
evals/packs/demo-blindness.test.ts:10: * A transitive import-graph walk from the actor module proves it can NEVER reach
evals/packs/demo-blindness.test.ts:13: * verifier). The SAME walk also proves the actor path is $0-LLM. A second walk
evals/packs/demo-blindness.test.ts:14: * proves the WEB demo-render path imports no LLM/provider/network/fs-engine module
evals/packs/demo-blindness.test.ts:61:const banned = [
evals/packs/demo-blindness.test.ts:83:  it("the actor path is $0-LLM (no provider/network module reachable)", () => {
evals/packs/demo-blindness.test.ts:87:      for (const pattern of banned) {
evals/packs/demo-blindness.test.ts:88:        expect(pattern.test(spec), `banned import "${spec}" reachable from the actor`).toBe(false);
evals/packs/demo-blindness.test.ts:105:  it("no module reachable from app/demo/page.tsx matches a banned pattern", () => {
evals/packs/demo-blindness.test.ts:109:        for (const pattern of banned) {
evals/packs/demo-blindness.test.ts:110:          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
evals/packs/ucp-conformance.test.ts:23: * every pinned schema is byte/hash-locked (no silent hand-tampering); every
evals/packs/ucp-conformance.test.ts:41:describe("UCP conformance corpus freeze-integrity (P2-1: every file byte-locked)", () => {
evals/packs/ucp-conformance.test.ts:59:describe("pinned UCP schemas freeze-integrity (tamper-evident, no network)", () => {
evals/packs/ucp-conformance.test.ts:75:      const bytes = readFileSync(join(base, f.file));
evals/packs/ucp-conformance.test.ts:76:      const sha = createHash("sha256").update(bytes).digest("hex");
evals/packs/listings-differential-c3.test.ts:57:  it("has a non-trivial shared drift set (differential is meaningful)", () => {
evals/packs/demo-cli.test.ts:8: * `demo` exits 0, prints the byte-frozen golden text; `demo --json` prints the
evals/packs/demo-cli.test.ts:9: * byte-frozen golden transcript JSON; strict-flag discipline mirrors the check
evals/packs/demo-cli.test.ts:10: * legs (any non-`--json` flag or positional exits 2 loudly). The goldens are
evals/packs/demo-cli.test.ts:34:  it("`demo` exits 0 and prints the byte-frozen golden text", () => {
evals/packs/demo-cli.test.ts:40:  it("`demo --json` exits 0 and prints the byte-frozen golden transcript JSON", () => {
evals/packs/acp-field-rules.test.ts:22: * (The W1 corpus/differential evals already exercise these rules in aggregate;
lib/packs/listings/demo/render-text.ts:4: * no fs, no clock, no locale-dependent formatting), so its output is byte-stable
lib/packs/listings/demo/render-text.ts:5: * and golden-lockable (fixtures/synthetic-restaurant/expected-demo.txt).
evals/packs/cli-c1.test.ts:9: * the shipped fixtures; output is the machine-readable report (byte-equal to
evals/packs/cli-c1.test.ts:10: * the golden). The $0-LLM property is enforced STRUCTURALLY: a transitive
evals/packs/cli-c1.test.ts:11: * import-graph scan proves the CLI path can never reach an LLM/provider/network
evals/packs/cli-c1.test.ts:49:  it("exit non-zero (1) on the drifted fixture, output = the golden report", () => {
evals/packs/cli-c1.test.ts:60:  it("ucp surface: exit 1 on the drifted catalog response, golden byte-equal", () => {
evals/packs/cli-c1.test.ts:175:  it("--json emits the canonical report: byte-equal to the frozen golden, exit unchanged", () => {
evals/packs/cli-c1.test.ts:176:    // Single spawn (cold Node TS-strip is slow) — comparing to the LOCKED golden
evals/packs/cli-c1.test.ts:177:    // both proves the --json alias is byte-identical to the default (which the
evals/packs/cli-c1.test.ts:178:    // default-vs-golden test above already pins) and that the goldens stay locked.
evals/packs/cli-c1.test.ts:227:describe("C1 $0-LLM: structural import-graph proof", () => {
evals/packs/cli-c1.test.ts:228:  // Modules that must be unreachable from the CLI path (LLM providers, cost
evals/packs/cli-c1.test.ts:230:  const banned = [
evals/packs/cli-c1.test.ts:270:  it("no module reachable from bin/check.mjs matches a banned pattern", () => {
evals/packs/cli-c1.test.ts:279:        for (const pattern of banned) {
evals/packs/cli-c1.test.ts:280:          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
evals/packs/cli-c1.test.ts:290:  it("no reachable source performs a bare fetch() (P3-5: source-text network scan)", () => {
evals/packs/cli-c1.test.ts:291:    // The import-graph ban is module-level; this complements it by scanning the
evals/packs/honesty-c10.test.ts:21: * The banned patterns match ONLY affirmative overclaims — honest negations
evals/packs/honesty-c10.test.ts:36:// committed transcript goldens. Every file a viewer reads or the demo emits sits
evals/packs/honesty-c10.test.ts:93:      expect(m === null, `banned claim ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
evals/packs/honesty-c10.test.ts:132:  // thing caught is banned everywhere in the demo (Codex amendment 6).
evals/packs/honesty-c10.test.ts:142:    // The verbatim claim must never contain the banned headline.
evals/packs/honesty-c10.test.ts:151:  it.each([...demoScanned, ...publicProse])("%s never frames the agent as 'caught' (banned headline)", (file) => {
evals/packs/honesty-c10.test.ts:155:      expect(m === null, `banned framing ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
evals/gold/fee-baseline-measurement.test.ts:15: * "held-out LLM classifier" claim. That claim requires an owner-gated LIVE run
evals/gold/fee-baseline-measurement.test.ts:25: * gap — the floor an LLM classifier must beat, not a floor it is assumed to beat.
lib/packs/listings/demo/copy.ts:8: * prove the verbatim C7 claim is present and the banned framing is absent across
lib/packs/listings/demo/copy.ts:20: * the agent in the caught position is banned across every demo file; the honesty
lib/packs/listings/demo/types.ts:3: * `node:fs`, no clock, no LLM — so the web renderer can consume a committed
lib/packs/listings/demo/types.ts:5: * the client bundle. The $0 import-graph eval relies on this separation.
evals/packs/listings-coverage-c6.test.ts:103:  const banned = /\ball (edge cases|drift|possible)/i;
evals/packs/listings-coverage-c6.test.ts:116:      expect(banned.test(text), `overclaim in ${file}`).toBe(false);
evals/packs/fees-honesty-c10.test.ts:6: * C10 honesty surface EXTENDED to the F1a fees files + goldens (plan item 10),
evals/packs/fees-honesty-c10.test.ts:16: *      codified law, with the LLM classifier DEFERRED (never overclaimed);
evals/packs/fees-honesty-c10.test.ts:61:      expect(m === null, `banned claim ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
evals/packs/fees-honesty-c10.test.ts:86:  it("every golden fee report is labeled simulated:true and states the honest scope", () => {
evals/packs/fees-advisory-nits.test.ts:19: *     value (no fixture contains '#' or '%'; goldens stay byte-frozen), reversible
evals/packs/fees-advisory-nits.test.ts:61:  it("is byte-identity on every committed corpus value shape (no '#'/'%')", () => {
lib/packs/fees/finding.ts:5: * built through the ONLY sanctioned constructor `makeFinding`) EXTENDED with the
lib/packs/fees/finding.ts:11: *  - a PROVISIONAL marker array — {@link makeFeeFinding} REQUIRES the U1 marker on
lib/packs/fees/finding.ts:21:import { makeFinding } from "../../verifier-core/guard.ts";
lib/packs/fees/finding.ts:74:/** Raw input to {@link makeFeeFinding} — validated + frozen on the way out. */
lib/packs/fees/finding.ts:96: * The ONLY sanctioned fee-finding constructor. Wraps verifier-core `makeFinding`
lib/packs/fees/finding.ts:102:export function makeFeeFinding(input: FeeFindingInput): FeeFinding {
lib/packs/fees/finding.ts:104:  const core = makeFinding({
lib/packs/fees/finding.ts:141:   * the platform; the LLM line-item classifier is DEFERRED to F1b.
lib/packs/fees/finding.ts:156: * ordering is what makes the frozen golden report byte-comparable.
lib/packs/fees/finding.ts:191:/** Canonical serialization — the single stringifier (byte-identity is meaningful). */
lib/packs/fees/finding.ts:192:export function serializeFeeReport(report: FeeAuditReport): string {
lib/packs/fees/statement.ts:108:   * always yield byte-identical verdicts.
evals/packs/fees-classifier.test.ts:15:  serializeFeeReport,
evals/packs/fees-classifier.test.ts:21:import { makeFinding } from "@/lib/verifier-core/guard";
evals/packs/fees-classifier.test.ts:28: *  - the $0-LLM / zero-network structural proof, EXTENDED to classifier.ts +
evals/packs/fees-classifier.test.ts:29: *    classified-audit.ts (the fees-cli import-graph pattern, self-contained here
evals/packs/fees-classifier.test.ts:32: *    to the frozen F1a goldens; advisory findings carry claim.source "classifier"
evals/packs/fees-classifier.test.ts:57:    // run (docs/fee-classifier-calibration-status.md). The import-graph proof below
evals/packs/fees-classifier.test.ts:58:    // still holds — the pack itself reaches no network module.
evals/packs/fees-classifier.test.ts:108:describe("F1b $0-LLM / zero-network structural proof — classifier.ts + classified-audit.ts", () => {
evals/packs/fees-classifier.test.ts:109:  const banned = [/lib\/agents\//, /@ai-sdk/, /^ai$|\/ai\//, /node:https?/, /undici/, /groq|gemini/i];
evals/packs/fees-classifier.test.ts:127:  it("no module reachable from classifier.ts / classified-audit.ts matches a banned pattern (and no bare fetch)", () => {
evals/packs/fees-classifier.test.ts:141:        for (const pattern of banned) {
evals/packs/fees-classifier.test.ts:142:          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
evals/packs/fees-classifier.test.ts:152:describe("F1b advisory audit path — default path stays byte-identical; advisory is a separate, non-gating array", () => {
evals/packs/fees-classifier.test.ts:153:  it("auditWithClassification's `base` report is EXACTLY auditStatement(statement) — byte-identical", () => {
evals/packs/fees-classifier.test.ts:157:    expect(serializeFeeReport(base)).toBe(serializeFeeReport(direct));
evals/packs/fees-classifier.test.ts:160:  it("the F1a frozen golden reports are UNCHANGED by this slice (re-assertion, deliverable 7)", () => {
evals/packs/fees-classifier.test.ts:167:    for (const [golden, build] of cases) {
evals/packs/fees-classifier.test.ts:168:      const goldenText = readFileSync(join(feesDir, golden), "utf8");
evals/packs/fees-classifier.test.ts:169:      expect(serializeFeeReport(auditStatement(build())), golden).toBe(goldenText);
evals/packs/fees-classifier.test.ts:191:      makeFinding({
evals/packs/fees-classifier.test.ts:260:    // NO advisory candidate here. This is the measured gap the LLM classifier must
evals/packs/listings-wedge.test.ts:16:import { serializeReport } from "@/lib/verifier-core";
evals/packs/listings-wedge.test.ts:21: * golden drifted reports (byte-compared; stable ordering makes this exact).
evals/packs/listings-wedge.test.ts:56:  // manifest's ucpVersionSkew block are byte-locked too — the corpus README's
evals/packs/listings-wedge.test.ts:106:describe("golden drifted reports (byte-exact, determinism)", () => {
evals/packs/listings-wedge.test.ts:107:  it("acp drifted report matches the frozen golden byte-for-byte", () => {
evals/packs/listings-wedge.test.ts:109:    expect(serializeReport(report)).toBe(readFixture("expected-report.acp.json"));
evals/packs/listings-wedge.test.ts:112:  it("ucp drifted report matches the frozen golden byte-for-byte", () => {
evals/packs/listings-wedge.test.ts:118:    expect(serializeReport(report)).toBe(readFixture("expected-report.ucp.json"));
evals/packs/listings-wedge.test.ts:121:  it("two identical runs serialize byte-identically (no clock, no randomness)", () => {
evals/packs/listings-wedge.test.ts:124:    expect(serializeReport(r1)).toBe(serializeReport(r2));
evals/packs/fees-finding-u1.test.ts:9:  makeFeeFinding,
evals/packs/fees-finding-u1.test.ts:15: * U1 PROVISIONALITY, structural (plan F1a item 5), RED-GREEN: makeFeeFinding
evals/packs/fees-finding-u1.test.ts:16: * wraps the core C2 guard (makeFinding) AND requires the U1 provisional marker on
evals/packs/fees-finding-u1.test.ts:35:    expect(() => makeFeeFinding(baseInput({}))).toThrow(MissingProvisionalMarkerError);
evals/packs/fees-finding-u1.test.ts:36:    expect(() => makeFeeFinding(baseInput({ provisional: ["something-else"] }))).toThrow(
evals/packs/fees-finding-u1.test.ts:42:    const f = makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1] }));
evals/packs/fees-finding-u1.test.ts:48:    const f = makeFeeFinding(
evals/packs/fees-finding-u1.test.ts:64:describe("U1: makeFeeFinding still enforces the core C2 receipts + two registers", () => {
evals/packs/fees-finding-u1.test.ts:67:      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], referenceRowId: "" })),
evals/packs/fees-finding-u1.test.ts:73:      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], professionalLine: "  " })),
evals/packs/fees-finding-u1.test.ts:76:      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], plainLine: "" })),
evals/packs/fees-finding-u1.test.ts:81:describe("U1: every base-derived finding in the frozen goldens carries the marker", () => {
evals/packs/fees-finding-u1.test.ts:83:  it("no golden report has a base-derived finding without U1-base", () => {
evals/packs/fees-cli.test.ts:9: * byte-equal to the frozen golden. The $0-LLM property is enforced STRUCTURALLY:
evals/packs/fees-cli.test.ts:10: * a transitive import-graph scan from the fees CLI module proves it can never
evals/packs/fees-cli.test.ts:11: * reach an LLM / provider / network module (the cli-c1 pattern + alias resolver).
evals/packs/fees-cli.test.ts:46:  it("--json is byte-equal to the frozen golden report, exit unchanged", () => {
evals/packs/fees-cli.test.ts:71:describe("F1a fees leg $0-LLM: structural import-graph proof", () => {
evals/packs/fees-cli.test.ts:72:  const banned = [/lib\/agents\//, /@ai-sdk/, /^ai$|\/ai\//, /node:https?/, /undici/, /groq|gemini/i];
evals/packs/fees-cli.test.ts:90:  it("no module reachable from the fees CLI matches a banned pattern (and no bare fetch)", () => {
evals/packs/fees-cli.test.ts:101:        for (const pattern of banned) {
evals/packs/fees-cli.test.ts:102:          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
evals/packs/fees-coverage-c6.test.ts:99:  const banned = /\ball (edge cases|drift|possible)/i;
evals/packs/fees-coverage-c6.test.ts:107:      expect(banned.test(text), `overclaim in ${file}`).toBe(false);
lib/packs/fees/rules.ts:114: * MUST carry the U1 provisional marker ({@link makeFeeFinding} enforces it).
lib/packs/fees/generate.ts:12: * would make boundary-exact planting fragile). A freeze-integrity eval byte-locks
lib/packs/fees/generate.ts:207:/** Golden reports for the corpus (byte-frozen by the freeze-integrity eval). */
lib/packs/fees/classified-audit.ts:6: * default path does (byte-identical; `fees-freeze.test.ts` + this slice's own
lib/packs/fees/classified-audit.ts:7: * goldens-unchanged assertion prove it), then separately runs an injected
lib/packs/fees/classified-audit.ts:15: * this wiring as flowing "through makeFeeFinding" with a distinct `claim.source`.
lib/packs/fees/classified-audit.ts:16: * `makeFeeFinding` (lib/packs/fees/finding.ts) requires a {@link FeeVerdict} —
lib/packs/fees/classified-audit.ts:21: * lane would have byte-broken the frozen F1a goldens via `verdictTally`.
lib/packs/fees/classified-audit.ts:24: * SANCTIONED golden regeneration; that state belongs to the deterministic audit,
lib/packs/fees/classified-audit.ts:27: * every finding in this repo is built through (`makeFinding`,
lib/packs/fees/classified-audit.ts:28: * verifier-core/guard.ts — the function `makeFeeFinding` itself wraps), and
lib/packs/fees/classified-audit.ts:30: * alongside it, entirely outside `FeeVerdict` / `buildFeeReport`. F1a goldens
lib/packs/fees/classified-audit.ts:56:import { makeFinding } from "../../verifier-core/guard.ts";
lib/packs/fees/classified-audit.ts:71: * guard (`makeFinding`) every finding in this repo passes through, so it still
lib/packs/fees/classified-audit.ts:93:  /** Exactly `auditStatement(statement)` — byte-identical to the default path. */
lib/packs/fees/classified-audit.ts:108:  const core = makeFinding({
lib/packs/fees/classified-audit.ts:137: * Pure in (statement, classifier) — no clock, no network, no LLM (whichever
lib/packs/fees/classifier.ts:11: * An LLM classifier EARNS its "calibrated" label ONLY by beating the deterministic
lib/packs/fees/classifier.ts:13: * owner-gated live run. Until then the LLM label DEFERS:
lib/packs/fees/classifier.ts:20: *     deterministic audit reaches stay zero-network (a test proves it). Wired ≠
lib/packs/fees/classifier.ts:23: * No file in THIS pack calls a model or the network. The gold set is SIMULATED.
lib/packs/fees/classifier.ts:181: * FLOOR the LLM classifier must beat on held-out gold to earn its label, not a
lib/packs/fees/classifier.ts:195: * category, else `not-a-permitted-fee`. Pure, $0, no network — this is the measured
lib/packs/fees/classifier.ts:227: * LLM label (AM-7): reading the answer is not beating the baseline. Tests use it to
lib/packs/fees/classifier.ts:256: * The DESIGN of the live LLM classifier (deliverable 6a) — the machine-readable
lib/packs/fees/classifier.ts:258: * provider call, NO network import in this module); the wiring that implements it
lib/packs/fees/index.ts:8: * The LLM line-item classifier seam (true-vs-declared category) is F1b: the
lib/packs/fees/index.ts:73:  makeFeeFinding,
lib/packs/fees/index.ts:77:  serializeFeeReport,
lib/packs/fees/index.ts:97:// F1b classifier seam (plan §5 F1b, C8) — zero network/LLM imports (verified by
lib/packs/fees/index.ts:98:// the extended fees-cli import-graph eval). The live lane is WIRED (2026-07-05,
lib/packs/fees/index.ts:100:// and is never imported here, so the pack's zero-network proof still holds.
evals/packs/fees-freeze.test.ts:11:  serializeFeeReport,
evals/packs/fees-freeze.test.ts:16: * generator's output at the pinned seed, and every golden report is exactly
evals/packs/fees-freeze.test.ts:18: * failing, and the audit is deterministic (byte-identical across runs).
evals/packs/fees-freeze.test.ts:44:    const golden = name.replace(/^statement\./, "expected-report.");
evals/packs/fees-freeze.test.ts:45:    it(`${golden} is exactly auditStatement(${name})`, () => {
evals/packs/fees-freeze.test.ts:46:      expect(read(golden)).toBe(serializeFeeReport(auditStatement(build())));
evals/packs/fees-freeze.test.ts:50:  it("the audit is deterministic: two runs serialize byte-identically (no clock, no randomness)", () => {
evals/packs/fees-freeze.test.ts:52:    expect(serializeFeeReport(auditStatement(s))).toBe(serializeFeeReport(auditStatement(s)));
lib/packs/fees/cli.ts:8: * verdict). ZERO LLM / network — enforced by the import-graph eval, not promised.
lib/packs/fees/cli.ts:13: * the honest scope label — classification is AS-DECLARED; the LLM line-item
lib/packs/fees/cli.ts:23:import { serializeFeeReport } from "./finding.ts";
lib/packs/fees/cli.ts:41:  const output = opts.json ? serializeFeeReport(report) : renderFeeReportText(report);
evals/packs/report-view-c1.test.ts:10: * W3 — the one-page report-rendering path (plan §5 W3; C1 $0-LLM · C2 evidence
evals/packs/report-view-c1.test.ts:13: * Mirrors the CLI's structural $0-LLM proof for the WEB report path: a transitive
evals/packs/report-view-c1.test.ts:14: * import-graph scan from `app/report/page.tsx` proves the report renderer can
evals/packs/report-view-c1.test.ts:15: * never reach an LLM/provider/network module. Then it asserts the pure view
evals/packs/report-view-c1.test.ts:24:describe("C1 $0-LLM: report-rendering path imports no LLM/provider/network module", () => {
evals/packs/report-view-c1.test.ts:25:  const banned = [
evals/packs/report-view-c1.test.ts:64:  it("no module reachable from app/report/page.tsx matches a banned pattern", () => {
evals/packs/report-view-c1.test.ts:74:        for (const pattern of banned) {
evals/packs/report-view-c1.test.ts:75:          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
evals/packs/report-view-c1.test.ts:142:describe("C4 — every finding leads with a plain-words line (golden corpus)", () => {
lib/packs/fees/audit.ts:6: * Deterministic, $0, zero network / LLM / clock reads — the evaluation date
lib/packs/fees/audit.ts:7: * arrives as data (`meta.asOf`) so identical statements give byte-identical
lib/packs/fees/audit.ts:8: * reports. Every finding is built through {@link makeFeeFinding} (C2 receipts +
lib/packs/fees/audit.ts:39:  makeFeeFinding,
lib/packs/fees/audit.ts:68:  "as-declared by the platform; deterministic audit; LLM line-item classifier DEFERRED (F1b)";
lib/packs/fees/audit.ts:107: * gives every order a fee line, so goldens are unaffected.
lib/packs/fees/audit.ts:136: * Audit one parsed monthly statement. Pure in (statement); no clock, no network,
lib/packs/fees/audit.ts:137: * no LLM. Returns the machine-readable, evidence-cited fee report.
lib/packs/fees/audit.ts:142: * unambiguous while staying byte-identity on every committed corpus value
lib/packs/fees/audit.ts:143: * (no fixture contains '#' or '%' — goldens unchanged). Reversible.
lib/packs/fees/audit.ts:180:      makeFeeFinding({
lib/packs/fees/audit.ts:197:      makeFeeFinding({
lib/packs/fees/audit.ts:229:            makeFeeFinding({
lib/packs/fees/audit.ts:244:          makeFeeFinding({
lib/packs/fees/audit.ts:267:      makeFeeFinding({

 succeeded in 0ms:
     1	/**
     2	 * CLI entry logic for the listings wedge — W1 (C1: one-command validator).
     3	 *
     4	 * Loaded by bin/check.mjs via Node's native TypeScript type-stripping (Node ≥ 24;
     5	 * this repo runs v24). Reads the serving copy + the SOR catalog from disk, picks
     6	 * the surface adapter, runs the deterministic verification, and returns the
     7	 * report plus the exit code (non-zero iff findings exist — CI-usable). This path
     8	 * makes ZERO LLM/network calls; the $0 property is enforced by an import-graph
     9	 * eval, not just promised.
    10	 *
    11	 * Plain: the brain behind the `check` command — read the two files, compare,
    12	 * print the receipts, and fail the build if the copy lies.
    13	 */
    14	import { readFileSync } from "node:fs";
    15	import { join } from "node:path";
    16	import type { VerifierReport } from "../../verifier-core/index.ts";
    17	import { serializeReport } from "../../verifier-core/verify.ts";
    18	import type { AcpFeed } from "./acp-feed.ts";
    19	import { acpFeedToClaims, ucpResponseToClaims } from "./adapters.ts";
    20	import { runUcpConformance, type UcpCatalogOp } from "./conformance.ts";
    21	import { runListingsVerification } from "./run.ts";
    22	import type { SyntheticCatalog } from "./types.ts";
    23	import type { UcpCatalogResponseFixture } from "./ucp.ts";
    24	import type { UcpSearchResponse } from "./ucp-wire.ts";
    25	import { buildDemoTranscript, renderDemoText } from "./demo/index.ts";
    26	
    27	export type CliSurface = "acp" | "ucp";
    28	
    29	export interface CliResult {
    30	  readonly report: VerifierReport;
    31	  readonly output: string;
    32	  /** 0 = clean, 1 = findings present (C1: non-zero on any drift). */
    33	  readonly exitCode: 0 | 1;
    34	}
    35	
    36	/** Run one check. Throws on unreadable/invalid input (bin maps that to exit 2). */
    37	export function runCheck(
    38	  feedPath: string,
    39	  catalogPath: string,
    40	  surface: CliSurface,
    41	): CliResult {
    42	  const sor = JSON.parse(readFileSync(catalogPath, "utf8")) as SyntheticCatalog;
    43	  if (!Array.isArray(sor.items)) {
    44	    throw new Error(`--against file does not look like a catalog SOR: ${catalogPath}`);
    45	  }
    46	  const raw = JSON.parse(readFileSync(feedPath, "utf8")) as unknown;
    47	  const claims =
    48	    surface === "acp"
    49	      ? acpFeedToClaims(raw as AcpFeed)
    50	      : ucpResponseToClaims(raw as UcpCatalogResponseFixture);
    51	  const report = runListingsVerification(claims, sor);
    52	  return {
    53	    report,
    54	    output: serializeReport(report),
    55	    exitCode: report.ok ? 0 : 1,
    56	  };
    57	}
    58	
    59	/**
    60	 * Run the UCP CONFORMANCE leg (W2): validate a UCP catalog-response document
    61	 * against the pinned published UCP schemas (conformance.ts). This is the
    62	 * SEPARATE second question — is the document spec-SHAPED — and it needs no SOR
    63	 * (`--against`): the reference is the schema, not the merchant catalog. Findings
    64	 * are the `LST-CONF-*` family. Zero LLM / network; reads pinned schemas from disk.
    65	 */
    66	export function runConformanceCheck(
    67	  docPath: string,
    68	  op: UcpCatalogOp = "search",
    69	  schemaDir?: string,
    70	): CliResult {
    71	  const doc = JSON.parse(readFileSync(docPath, "utf8")) as unknown;
    72	  const report = runUcpConformance(doc, { op, schemaDir });
    73	  return { report, output: serializeReport(report), exitCode: report.ok ? 0 : 1 };
    74	}
    75	
    76	/** Result of the demo leg — a scripted narration, not a gate (always exit 0). */
    77	export interface DemoCliResult {
    78	  readonly output: string;
    79	  /** Demo is always exit 0: it is a walkthrough, not a pass/fail check. */
    80	  readonly exitCode: 0;
    81	}
    82	
    83	/**
    84	 * Run the DEMO leg (D1): read the shipped drifted feed, the SOR, and the
    85	 * conformant-but-false UCP document from the corpus (zero-config), build the
    86	 * deterministic transcript, and render it as plain text (default) or the machine
    87	 * transcript JSON (`--json`). Zero LLM / network; reads fixtures + pinned schemas
    88	 * from disk. Exit 0 always — the demo is a walkthrough of the mechanism, not a
    89	 * pass/fail gate. Throws on unreadable input (bin maps that to exit 2).
    90	 */
    91	export function runDemo(opts: { json?: boolean } = {}): DemoCliResult {
    92	  const restaurant = join("fixtures", "synthetic-restaurant");
    93	  const sor = JSON.parse(
    94	    readFileSync(join(restaurant, "sor.catalog.json"), "utf8"),
    95	  ) as SyntheticCatalog;
    96	  const feed = JSON.parse(
    97	    readFileSync(join(restaurant, "acp-feed.drifted.json"), "utf8"),
    98	  ) as AcpFeed;
    99	  const conformanceDoc = JSON.parse(
   100	    readFileSync(join("fixtures", "ucp-conformance-ci", "valid", "conformant-but-false.json"), "utf8"),
   101	  ) as UcpSearchResponse;
   102	
   103	  const transcript = buildDemoTranscript({ feed, sor, conformanceDoc });
   104	  const output = opts.json
   105	    ? `${JSON.stringify(transcript, null, 2)}\n`
   106	    : renderDemoText(transcript);
   107	  return { output, exitCode: 0 };
   108	}
     1	/**
     2	 * Report model — W0 STUB (plan §3 "the report IS a document", S-9 / C4 / C10).
     3	 *
     4	 * The verifier's output: one page, evidence-cited, spec-version pinned. W0 fixes
     5	 * the machine-readable shape; rendering (web + machine JSON) lands in W3. No
     6	 * report-building logic here.
     7	 *
     8	 * Plain: the one-page result — every catch with its receipts, stamped with the
     9	 * spec version it was checked against, and labeled if anything is simulated.
    10	 */
    11	import type { Finding } from "./evidence.ts";
    12	import type { MatchingMode } from "./reference.ts";
    13	
    14	/** Machine-readable verifier report (CI-usable, C1). */
    15	export interface VerifierReport {
    16	  /** Spec / rule-table version pinned in the header of every report (C10). */
    17	  readonly specVersion: string;
    18	  /**
    19	   * C3: every report labels whether claim↔reference matching was
    20	   * synthetic-controlled (shared IDs) or real-world (entity resolution).
    21	   * Required by construction so an unlabeled report cannot exist.
    22	   */
    23	  readonly matchingMode: MatchingMode;
    24	  /** True if any synthetic artifact is involved — honesty surface (C10). */
    25	  readonly simulated: boolean;
    26	  /** All evidence-cited findings; an empty array means no drift detected. */
    27	  readonly findings: readonly Finding[];
    28	  /** Overall pass/fail; the CLI derives its non-zero exit from this (C1). */
    29	  readonly ok: boolean;
    30	}
     1	/**
     2	 * Verification engine — W1 (plan §3, §5 W1; criteria C1/C2/C3).
     3	 *
     4	 * The generic half of "one engine, two packs": walk claims, resolve each against
     5	 * the swappable Reference, run pack-provided detectors, enforce the C2 evidence
     6	 * guard on every finding, sort deterministically, and assemble the report.
     7	 * The engine knows NO domain taxonomy — packs own the detectors and any
     8	 * completeness/unmatched logic; the engine owns evidence discipline, determinism,
     9	 * and report assembly. Zero LLM, zero network, zero clock reads (any "now" must
    10	 * arrive as data so identical inputs give byte-identical reports).
    11	 *
    12	 * Plain: the referee's rulebook-independent machinery — take each claim, look up
    13	 * the truth, ask the domain rules what's wrong, demand receipts for every catch,
    14	 * and write the report the same way every time.
    15	 */
    16	import type { Claim } from "./claim.ts";
    17	import type { Reference, ReferenceMatch, MatchingMode } from "./reference.ts";
    18	import type { Finding } from "./evidence.ts";
    19	import { makeFinding, type FindingInput } from "./guard.ts";
    20	import type { VerifierReport } from "./report.ts";
    21	
    22	/**
    23	 * A pack-provided detection rule. Runs on every (claim, match) pair; returns
    24	 * finding inputs (usually 0 or 1). `match` is null when the reference could not
    25	 * resolve the claim — unmatched handling is also a pack decision.
    26	 */
    27	export type Detector = (claim: Claim, match: ReferenceMatch | null) => readonly FindingInput[];
    28	
    29	/** Options for a verification run — all report-level facts arrive as data. */
    30	export interface VerifyOptions {
    31	  /** Spec / rule-table / taxonomy version pinned into the report header (C10). */
    32	  readonly specVersion: string;
    33	  /** How claim↔reference matching was performed (C3 label). */
    34	  readonly matchingMode: MatchingMode;
    35	  /** True when any synthetic artifact is involved (C10 honesty surface). */
    36	  readonly simulated: boolean;
    37	}
    38	
    39	/**
    40	 * Deterministic finding order: category, then ruleId, then claim id. Stable
    41	 * output ordering is what makes golden-report byte-comparison possible.
    42	 */
    43	export function sortFindings(findings: readonly Finding[]): readonly Finding[] {
    44	  return [...findings].sort(
    45	    (a, b) =>
    46	      (a.category ?? "").localeCompare(b.category ?? "") ||
    47	      a.ruleId.localeCompare(b.ruleId) ||
    48	      a.claim.id.localeCompare(b.claim.id),
    49	  );
    50	}
    51	
    52	/**
    53	 * Run detectors over claims against a reference. Every emitted finding passes
    54	 * through {@link makeFinding} (C2: no finding without all four receipts).
    55	 */
    56	export function verifyClaims(
    57	  claims: readonly Claim[],
    58	  reference: Reference,
    59	  detectors: readonly Detector[],
    60	): readonly Finding[] {
    61	  const findings: Finding[] = [];
    62	  for (const claim of claims) {
    63	    const match = reference.resolve(claim);
    64	    for (const detector of detectors) {
    65	      for (const input of detector(claim, match)) {
    66	        findings.push(makeFinding(input));
    67	      }
    68	    }
    69	  }
    70	  return findings;
    71	}
    72	
    73	/**
    74	 * Assemble the machine-readable report (C1-consumable). Re-asserts C2 on every
    75	 * finding (belt-and-suspenders for findings built outside verifyClaims, e.g. a
    76	 * pack's completeness sweep), sorts deterministically, and derives `ok`.
    77	 */
    78	export function buildReport(
    79	  findings: readonly Finding[],
    80	  opts: VerifyOptions,
    81	): VerifierReport {
    82	  const validated = findings.map((f) => makeFinding(f));
    83	  const sorted = sortFindings(validated);
    84	  return Object.freeze({
    85	    specVersion: opts.specVersion,
    86	    matchingMode: opts.matchingMode,
    87	    simulated: opts.simulated,
    88	    findings: sorted,
    89	    ok: sorted.length === 0,
    90	  });
    91	}
    92	
    93	/**
    94	 * Canonical report serialization — the single stringifier every consumer (CLI,
    95	 * golden fixtures, tests) uses, so byte-identity is meaningful.
    96	 */
    97	export function serializeReport(report: VerifierReport): string {
    98	  return `${JSON.stringify(report, null, 2)}\n`;
    99	}
     1	/**
     2	 * C2 finding guard — the runtime enforcer of "no finding without its receipts".
     3	 *
     4	 * Per C2 every finding must carry FOUR things: the claim, the reference-row id,
     5	 * the rule / spec-clause id, and a severity. The `Finding` TYPE already makes all
     6	 * four required at compile time, but data crossing a runtime boundary (a JSON feed
     7	 * parsed at the CLI, a hand-built fixture, a mutation test) is not compile-checked.
     8	 * `makeFinding` is the single constructor every detector calls; it validates the
     9	 * four fields at runtime and throws on any missing/empty one, so a finding without
    10	 * receipts cannot exist even on a runtime path. The C2 eval drives the throwing
    11	 * edge cases.
    12	 *
    13	 * Plain: the rule "every catch must show its receipts" is checked by a real guard,
    14	 * not just trusted. Try to build a finding without all four receipts and it errors.
    15	 */
    16	import type { Claim } from "./claim.ts";
    17	import type { Finding, Severity } from "./evidence.ts";
    18	import { SEVERITY_LEVELS } from "./evidence.ts";
    19	
    20	/** Raw input to {@link makeFinding} — same shape as Finding, validated at runtime. */
    21	export interface FindingInput {
    22	  readonly claim: Claim;
    23	  readonly referenceRowId: string;
    24	  readonly ruleId: string;
    25	  readonly severity: Severity;
    26	  readonly category?: string;
    27	  readonly plainLine?: string;
    28	}
    29	
    30	/** Thrown when a finding is constructed without all four required C2 fields. */
    31	export class MissingEvidenceError extends Error {
    32	  constructor(message: string) {
    33	    super(message);
    34	    this.name = "MissingEvidenceError";
    35	  }
    36	}
    37	
    38	function isNonEmptyString(v: unknown): v is string {
    39	  return typeof v === "string" && v.trim().length > 0;
    40	}
    41	
    42	/**
    43	 * Construct a validated, frozen {@link Finding}. Throws {@link MissingEvidenceError}
    44	 * if any of the four C2 fields is missing or empty. This is the ONLY sanctioned way
    45	 * to build a finding in the wedge — detectors never build the object literal directly.
    46	 */
    47	export function makeFinding(input: FindingInput): Finding {
    48	  if (input.claim === undefined || input.claim === null || !isNonEmptyString(input.claim.id)) {
    49	    throw new MissingEvidenceError("C2 violated: finding requires a claim with a non-empty id");
    50	  }
    51	  // P3-3 (W1 gate advisory): a claim must also name WHAT was asserted and WHERE
    52	  // it came from — an id alone is not enough evidence. Both truth findings and the
    53	  // W2 conformance findings (source `ucp-catalog`, field = the failing JSON pointer)
    54	  // carry these, so the tighter check strengthens C2 without narrowing any surface.
    55	  if (!isNonEmptyString(input.claim.source)) {
    56	    throw new MissingEvidenceError("C2 violated: finding requires a claim with a non-empty source");
    57	  }
    58	  if (!isNonEmptyString(input.claim.field)) {
    59	    throw new MissingEvidenceError("C2 violated: finding requires a claim with a non-empty field");
    60	  }
    61	  if (!isNonEmptyString(input.referenceRowId)) {
    62	    throw new MissingEvidenceError("C2 violated: finding requires a non-empty referenceRowId");
    63	  }
    64	  if (!isNonEmptyString(input.ruleId)) {
    65	    throw new MissingEvidenceError("C2 violated: finding requires a non-empty ruleId (rule/spec-clause)");
    66	  }
    67	  if (!SEVERITY_LEVELS.includes(input.severity)) {
    68	    throw new MissingEvidenceError(
    69	      `C2 violated: finding requires a valid severity (one of ${SEVERITY_LEVELS.join(", ")})`,
    70	    );
    71	  }
    72	  return Object.freeze({
    73	    claim: input.claim,
    74	    referenceRowId: input.referenceRowId,
    75	    ruleId: input.ruleId,
    76	    severity: input.severity,
    77	    ...(input.category !== undefined ? { category: input.category } : {}),
    78	    ...(input.plainLine !== undefined ? { plainLine: input.plainLine } : {}),
    79	  });
    80	}
    81	
    82	/**
    83	 * Runtime re-assertion that an already-built finding still carries all four fields
    84	 * (used by the report builder / evals as a belt-and-suspenders C2 check on data
    85	 * that did not necessarily pass through {@link makeFinding}).
    86	 */
    87	export function assertHasEvidence(finding: Finding): void {
    88	  makeFinding(finding);
    89	}
     1	/**
     2	 * Claim schema — W0 STUB (verifier-core skeleton, plan §6).
     3	 *
     4	 * A "claim" is any assertion made by a serving copy (an ACP feed row, a UCP
     5	 * catalog response, or a fee-statement line) that the verifier will later check
     6	 * against the merchant's system-of-record. W1 fills the concrete per-field rules;
     7	 * this file only fixes the shape so the reference, evidence, and report types can
     8	 * compile. No drift logic here.
     9	 *
    10	 * Plain: a claim is one thing a menu or bill SAYS. The verifier checks each claim
    11	 * against the truth.
    12	 */
    13	
    14	/**
    15	 * Where a claim came from — the serving surface (plan §3, C3 surface-agnostic).
    16	 * `"classifier"` (F1b) is an ADVISORY source: a claim asserted by an injected
    17	 * line-item classifier's prediction, never a serving-copy read — reserved for
    18	 * classifier-derived advisory findings (lib/packs/fees/classified-audit.ts), which
    19	 * never gate a report's `ok`.
    20	 */
    21	export type ClaimSource = "acp-feed" | "ucp-catalog" | "fee-statement" | "classifier";
    22	
    23	/** A single assertion under audit. The field set is intentionally minimal in W0. */
    24	export interface Claim {
    25	  /** Stable id of the claim within its source document (row / line id). */
    26	  readonly id: string;
    27	  /** The serving surface this claim was read from. */
    28	  readonly source: ClaimSource;
    29	  /** Dotted path to the asserted field, e.g. "price.amount" (W1 formalizes). */
    30	  readonly field: string;
    31	  /** The asserted value; untyped until W1's per-field schema lands. */
    32	  readonly value: unknown;
    33	}
     1	/**
     2	 * Evidence types — W0 STUB (plan C2).
     3	 *
     4	 * Per C2, every finding must carry FOUR things: the claim, the reference-row id,
     5	 * the rule / spec-clause id, and a severity. A W1 eval asserts no finding is ever
     6	 * emitted without all four. W0 only declares the shape — the four C2 fields are
     7	 * REQUIRED by the type, so a finding cannot be constructed without them. No
     8	 * drift-detection logic exists yet.
     9	 *
    10	 * Plain: a "finding" is a caught drift WITH its receipts — what was claimed, which
    11	 * truth row it was checked against, which rule it broke, and how bad it is.
    12	 */
    13	import type { Claim } from "./claim.ts";
    14	
    15	/** Severity ladder for a finding (W1 may refine thresholds). */
    16	export type Severity = "info" | "warn" | "error";
    17	
    18	/** Ordered severities — runtime export so packs and evals can enumerate them. */
    19	export const SEVERITY_LEVELS: readonly Severity[] = ["info", "warn", "error"];
    20	
    21	/**
    22	 * One evidence-cited finding. All four C2 fields are required by construction.
    23	 */
    24	export interface Finding {
    25	  /** The claim under audit (C2). */
    26	  readonly claim: Claim;
    27	  /** Id of the reference row the claim was checked against (C2). */
    28	  readonly referenceRowId: string;
    29	  /** The rule or spec-clause id that was violated (C2). */
    30	  readonly ruleId: string;
    31	  /** How severe the drift is (C2). */
    32	  readonly severity: Severity;
    33	  /**
    34	   * Optional generic grouping tag (e.g. a taxonomy class id). The engine treats
    35	   * it as an opaque string — packs populate it (the listings pack sets the plan
    36	   * §7 drift class) so the coverage eval (C6) can measure "% classes caught"
    37	   * without the engine knowing any domain taxonomy. Not one of the four required
    38	   * C2 fields; purely for reporting/coverage.
    39	   */
    40	  readonly category?: string;
    41	  /** Plain-words line for the one-page report (C4); optional until W3. */
    42	  readonly plainLine?: string;
    43	}

exec
/bin/zsh -lc 'nl -ba package.json' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	{
     2	  "name": "commerce-truth-audit",
     3	  "version": "0.1.0",
     4	  "private": true,
     5	  "license": "Apache-2.0",
     6	  "description": "The truth layer for agentic commerce: a deterministic verifier of what platforms and AI-agent surfaces claim (menus, prices, availability) vs the merchant system-of-record, UCP/ACP conformance checking, and an NYC §20-563.3 fee-cap audit. Simulated corpus; prototype. Lineage: the ActivationOps AI activation module is archived runnable under legacy/.",
     7	  "scripts": {
     8	    "dev": "next dev",
     9	    "build": "next build",
    10	    "start": "next start",
    11	    "lint": "eslint . --max-warnings=0",
    12	    "typecheck": "tsc --noEmit",
    13	    "test": "vitest run",
    14	    "test:legacy": "vitest run legacy/activation/evals",
    15	    "test:watch": "vitest",
    16	    "test:e2e": "playwright test",
    17	    "coverage": "vitest run --coverage",
    18	    "verify": "npm run typecheck && npm run lint && npm run test && npm run build",
    19	    "verify:full": "npm run verify && npm run test:e2e",
    20	    "check:fixtures": "node bin/check.mjs check fixtures/synthetic-restaurant/acp-feed.drifted.json --against fixtures/synthetic-restaurant/sor.catalog.json",
    21	    "check:fixtures:clean": "node bin/check.mjs check fixtures/synthetic-restaurant/acp-feed.faithful.json --against fixtures/synthetic-restaurant/sor.catalog.json",
    22	    "check:conformance": "node bin/check.mjs check fixtures/ucp-conformance-ci/valid/search-full-catalog.json --conformance",
    23	    "check:fees": "node bin/check.mjs fees fixtures/synthetic-restaurant/fees/statement.drifted.json",
    24	    "check:fees:clean": "node bin/check.mjs fees fixtures/synthetic-restaurant/fees/statement.faithful.json",
    25	    "demo": "node bin/check.mjs demo",
    26	    "fixtures:wedge": "node scripts-ts/generate-wedge-fixtures.mts",
    27	    "fixtures:fees": "node scripts-ts/generate-fee-fixtures.mts",
    28	    "fixtures:ucp": "node scripts-ts/generate-ucp-conformance-corpus.mts",
    29	    "fixtures:demo": "node scripts-ts/generate-demo-transcript.mts",
    30	    "test:ucp-oracle": "node scripts-ts/ucp-oracle-diff.mts"
    31	  },
    32	  "engines": {
    33	    "node": ">=24"
    34	  },
    35	  "dependencies": {
    36	    "@ai-sdk/google": "^2.0.11",
    37	    "@ai-sdk/groq": "^2.0.42",
    38	    "ai": "^5.0.98",
    39	    "ajv": "8.20.0",
    40	    "ajv-formats": "3.0.1",
    41	    "class-variance-authority": "^0.7.1",
    42	    "clsx": "^2.1.1",
    43	    "lucide-react": "^0.555.0",
    44	    "next": "^16.0.6",
    45	    "react": "^19.2.0",
    46	    "react-dom": "^19.2.0",
    47	    "tailwind-merge": "^3.4.0",
    48	    "zod": "^4.1.13"
    49	  },
    50	  "devDependencies": {
    51	    "@eslint/eslintrc": "^3.3.5",
    52	    "@playwright/test": "^1.61.0",
    53	    "@tailwindcss/postcss": "^4.1.17",
    54	    "@testing-library/jest-dom": "^6.9.1",
    55	    "@testing-library/react": "^16.3.0",
    56	    "@types/node": "^24.10.1",
    57	    "@types/react": "^19.2.7",
    58	    "@types/react-dom": "^19.2.3",
    59	    "@vitest/coverage-v8": "^4.1.5",
    60	    "eslint": "^9.39.1",
    61	    "eslint-config-next": "^16.0.6",
    62	    "jsdom": "^27.2.0",
    63	    "tailwindcss": "^4.1.17",
    64	    "typescript": "^5.9.3",
    65	    "vitest": "^4.0.14"
    66	  }
    67	}

exec
/bin/zsh -lc 'nl -ba lib/packs/fees/cli.ts && nl -ba lib/packs/fees/classified-audit.ts' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
     1	/**
     2	 * Fees CLI entry logic — F1a (plan §5 F1 item 8; C1 one-command validator).
     3	 *
     4	 * Loaded by bin/check.mjs via Node's native TypeScript type-stripping (Node ≥ 24).
     5	 * Reads a monthly fee statement from disk, parses it LOUDLY (typed errors →
     6	 * exit 2 at the bin), audits it deterministically against the codified NYC
     7	 * §20-563.3 rule table, and returns the report + exit code (1 iff any `violation`
     8	 * verdict). ZERO LLM / network — enforced by the import-graph eval, not promised.
     9	 *
    10	 * Two registers (item 7): default output is a human-readable TEXT report (the
    11	 * professional line paired with its plain line, verdict states, U1-provisional
    12	 * markers spelled out); `--json` emits the canonical machine report. Both carry
    13	 * the honest scope label — classification is AS-DECLARED; the LLM line-item
    14	 * classifier is DEFERRED to F1b.
    15	 *
    16	 * Plain: point it at a delivery bill; it prints every over-cap or illegal fee with
    17	 * receipts and says whether each is a settled violation or still inside the legal
    18	 * refund window — free to run, no AI.
    19	 */
    20	import { readFileSync } from "node:fs";
    21	import { auditStatement } from "./audit.ts";
    22	import type { FeeAuditReport, FeeFinding } from "./finding.ts";
    23	import { serializeFeeReport } from "./finding.ts";
    24	import { parseStatement } from "./parser.ts";
    25	
    26	export interface FeeCliResult {
    27	  readonly report: FeeAuditReport;
    28	  readonly output: string;
    29	  /** 0 = clean, 1 = at least one `violation` verdict. */
    30	  readonly exitCode: 0 | 1;
    31	}
    32	
    33	/**
    34	 * Run one fee audit. Throws {@link import("./parser.ts").StatementParseError} on
    35	 * unreadable/malformed input — bin/check.mjs maps that to exit 2.
    36	 */
    37	export function runFeeCheck(statementPath: string, opts: { json?: boolean } = {}): FeeCliResult {
    38	  const raw = readFileSync(statementPath, "utf8");
    39	  const statement = parseStatement(raw);
    40	  const report = auditStatement(statement);
    41	  const output = opts.json ? serializeFeeReport(report) : renderFeeReportText(report);
    42	  return { report, output, exitCode: report.ok ? 0 : 1 };
    43	}
    44	
    45	const VERDICT_TAG: Readonly<Record<FeeFinding["verdict"], string>> = {
    46	  violation: "VIOLATION",
    47	  "conditional-pending-refund-window": "CONDITIONAL (refund window open)",
    48	  "cured-by-refund": "CURED BY REFUND (not a violation)",
    49	  "asserted-passthrough-unverified": "ASSERTED PASS-THROUGH (unverified — not a violation)",
    50	};
    51	
    52	/** Human-readable two-register text render (the default CLI output). */
    53	export function renderFeeReportText(report: FeeAuditReport): string {
    54	  const lines: string[] = [];
    55	  lines.push("UC-1 FEE AUDIT — deterministic spine (SIMULATED statement vs REAL codified NYC §20-563.3)");
    56	  lines.push(`spec: ${report.specVersion}`);
    57	  lines.push(`classification: ${report.classification}`);
    58	  lines.push(`assumed purchase-price base (U1 unresolved): ${report.assumedPurchasePriceBase}`);
    59	  lines.push(`verdict: ${report.ok ? "PASS (no violations)" : "FAIL (violations present)"}`);
    60	  lines.push(
    61	    `findings: ${report.findings.length} — violation ${report.verdictTally.violation}, conditional ${report.verdictTally["conditional-pending-refund-window"]}, cured ${report.verdictTally["cured-by-refund"]}, asserted-passthrough ${report.verdictTally["asserted-passthrough-unverified"]}`,
    62	  );
    63	  lines.push("");
    64	  if (report.findings.length === 0) {
    65	    lines.push("No findings — every fee line is within cap as declared.");
    66	  }
    67	  for (const f of report.findings) {
    68	    const marks = f.provisional.length > 0 ? ` [provisional: ${f.provisional.join(", ")}]` : "";
    69	    lines.push(`• [${VERDICT_TAG[f.verdict]}] ${f.ruleId} (${f.referenceRowId}) — ${f.feeClass}${marks}`);
    70	    lines.push(`    ${f.professionalLine}`);
    71	    lines.push(`    ▸ ${f.plainLine}`);
    72	  }
    73	  lines.push("");
    74	  lines.push("Note: SIMULATED statements audited against REAL codified law. No real-platform access or data.");
    75	  return `${lines.join("\n")}\n`;
    76	}
     1	/**
     2	 * Advisory classifier-derived audit path — F1b deliverable 7 (plan §5 F1, C8).
     3	 *
     4	 * `auditWithClassification` layers an OPTIONAL, ADVISORY classifier pass on top of
     5	 * the UNCHANGED F1a deterministic engine: it calls `auditStatement` exactly as the
     6	 * default path does (byte-identical; `fees-freeze.test.ts` + this slice's own
     7	 * goldens-unchanged assertion prove it), then separately runs an injected
     8	 * {@link LineItemClassifier} over every non-refund line and reports a candidate
     9	 * relabeling wherever the classifier's predicted TRUE category diverges from the
    10	 * DECLARED category. These candidates are ADVISORY — they are a lead, never a
    11	 * verdict — and are reported in a completely separate array from the base report's
    12	 * findings.
    13	 *
    14	 * DESIGN ESCALATION E-1 (freeze-safety over literal wording): the packet describes
    15	 * this wiring as flowing "through makeFeeFinding" with a distinct `claim.source`.
    16	 * `makeFeeFinding` (lib/packs/fees/finding.ts) requires a {@link FeeVerdict} —
    17	 * at F1b build time its three members (`violation` /
    18	 * `conditional-pending-refund-window` / `cured-by-refund`) were all STATUTORY
    19	 * DISPOSITIONS of a settled cap check; none honestly describes an unconfirmed
    20	 * AI-derived relabeling candidate, and growing the union just for the advisory
    21	 * lane would have byte-broken the frozen F1a goldens via `verdictTally`.
    22	 * (The M2 reconciliation, 2026-07-04, later DID add a fourth member —
    23	 * `asserted-passthrough-unverified`, a c-2 statement-side state — under a
    24	 * SANCTIONED golden regeneration; that state belongs to the deterministic audit,
    25	 * still not to advisory candidates, so this resolution stands unchanged.)
    26	 * Resolution (conservative): reuse the SAME universal C2 receipts constructor
    27	 * every finding in this repo is built through (`makeFinding`,
    28	 * verifier-core/guard.ts — the function `makeFeeFinding` itself wraps), and
    29	 * define a fees-domain advisory type ({@link ClassifierAdvisoryFinding})
    30	 * alongside it, entirely outside `FeeVerdict` / `buildFeeReport`. F1a goldens
    31	 * cannot be affected because this module never calls `buildFeeReport`.
    32	 * The one live change borrowed from the
    33	 * literal spec is the claim source: `ClaimSource` (verifier-core/claim.ts) gains the
    34	 * `"classifier"` member (a plain string-literal addition with no exhaustive switch
    35	 * anywhere in the codebase — verified before the edit — so it cannot break anything
    36	 * that reads `Claim.source`).
    37	 *
    38	 * HONESTY (AM-7 / C8): whichever classifier is injected, its `earnsLabel` is always
    39	 * `false` (the 2026-07-05 owner-armed live run DEFERRED on a pre-registered floor,
    40	 * so no classifier anywhere has earned the label — see classifier.ts and
    41	 * docs/fee-classifier-calibration-status.md; the wired live lane in
    42	 * lib/agents/fee-classifier.ts is async and not injected here at all). An
    43	 * advisory finding built from the {@link MockOracleClassifier} PROVES the seam CAN
    44	 * surface a relabeling (deliverable 7's wiring proof); it is never presented as a
    45	 * caught violation, and the C6 coverage eval (unmodified) keeps reporting the
    46	 * fee-answer-key's `deferred-to-classifier` entries as deferred, not caught.
    47	 *
    48	 * Plain: this is the "and here's what the AI classifier WOULD flag" layer, bolted
    49	 * onto the untouched legal checker. It never changes what the legal checker says by
    50	 * itself, and everything it flags is labeled "candidate, not proven" until an
    51	 * owner-approved live run earns the right to say otherwise.
    52	 *
    53	 * HONESTY (C10): every statement this module runs against is SIMULATED (see
    54	 * `statement.ts`); nothing here reads or implies real platform data.
    55	 */
    56	import { makeFinding } from "../../verifier-core/guard.ts";
    57	import type { Finding } from "../../verifier-core/index.ts";
    58	import { auditStatement, claimIdPart, makeLineTagger } from "./audit.ts";
    59	import {
    60	  toClassifierInput,
    61	  type ClassifierPrediction,
    62	  type LineItemClassifier,
    63	  type TrueCategoryLabel,
    64	} from "./classifier.ts";
    65	import type { FeeAuditReport } from "./finding.ts";
    66	import type { DeclaredCategory, MonthlyStatement, StatementLine } from "./statement.ts";
    67	
    68	/**
    69	 * One advisory, classifier-derived candidate — NOT a {@link FeeFinding}, has no
    70	 * {@link FeeVerdict}, and never gates `report.ok`. Built through the SAME core C2
    71	 * guard (`makeFinding`) every finding in this repo passes through, so it still
    72	 * cannot exist without its receipts (claim · referenceRowId · ruleId · severity).
    73	 */
    74	export interface ClassifierAdvisoryFinding extends Finding {
    75	  /** Always true — the marker that this is a lead, never a settled verdict. */
    76	  readonly advisory: true;
    77	  /** Provenance: which classifier produced this candidate (e.g. "deterministic-baseline", "mock-oracle-wiring-stub"). */
    78	  readonly classifierSource: string;
    79	  /** The order this candidate concerns. */
    80	  readonly orderId: string;
    81	  /** What the platform DECLARED the line as. */
    82	  readonly declaredCategory: DeclaredCategory;
    83	  /** What the classifier PREDICTED the line's true category is. */
    84	  readonly predictedTrueCategory: TrueCategoryLabel;
    85	  /** Professional-register line (two-register standard). */
    86	  readonly professionalLine: string;
    87	  /** Plain-register line (two-register standard; always present here). */
    88	  readonly plainLine: string;
    89	}
    90	
    91	/** The result of the advisory classified-audit path: the UNCHANGED base report + a separate advisory array. */
    92	export interface ClassifiedFeeAuditReport {
    93	  /** Exactly `auditStatement(statement)` — byte-identical to the default path. */
    94	  readonly base: FeeAuditReport;
    95	  /** Advisory candidates only — never merged into `base.findings` or `base.ok`. */
    96	  readonly advisoryFindings: readonly ClassifierAdvisoryFinding[];
    97	}
    98	
    99	const ruleIdFor = (classifier: LineItemClassifier): string =>
   100	  `F1B-CLASSIFIER-ADVISORY(${classifier.name})`;
   101	
   102	function buildAdvisoryFinding(
   103	  line: StatementLine,
   104	  lineTag: string,
   105	  prediction: ClassifierPrediction,
   106	  classifier: LineItemClassifier,
   107	): ClassifierAdvisoryFinding {
   108	  const core = makeFinding({
   109	    claim: {
   110	      // Statement-position tag keeps ids unique across repeated same-order,
   111	      // same-category lines (C2 traceability; M2 Codex finding #4).
   112	      id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag}#classifier`,
   113	      source: "classifier",
   114	      field: "predictedTrueCategory",
   115	      value: prediction.predicted,
   116	    },
   117	    referenceRowId: `classifier:${classifier.name}`,
   118	    ruleId: ruleIdFor(classifier),
   119	    severity: "info",
   120	    category: "classifier-relabeling-candidate",
   121	    plainLine: `The "${classifier.name}" classifier thinks the line labeled "${line.label}" (declared "${line.declaredCategory}") might actually be "${prediction.predicted}" — a candidate, not a proven catch.`,
   122	  });
   123	  return Object.freeze({
   124	    ...core,
   125	    advisory: true as const,
   126	    classifierSource: classifier.name,
   127	    orderId: line.orderId,
   128	    declaredCategory: line.declaredCategory,
   129	    predictedTrueCategory: prediction.predicted,
   130	    professionalLine: `Classifier "${classifier.name}" predicts line "${line.label}" on order ${line.orderId} (declared "${line.declaredCategory}") is truly "${prediction.predicted}" — ${prediction.rationale}. ADVISORY: a candidate relabeling, not a settled finding; ${classifier.earnsLabel ? "" : "this classifier has NOT earned a calibrated label (AM-7)."}`,
   131	    plainLine: core.plainLine as string,
   132	  });
   133	}
   134	
   135	/**
   136	 * Run the advisory classifier pass on top of the unchanged deterministic audit.
   137	 * Pure in (statement, classifier) — no clock, no network, no LLM (whichever
   138	 * classifier is injected must itself be $0/offline; the wired live lane is async
   139	 * and cannot be injected into this sync seam).
   140	 */
   141	export function auditWithClassification(
   142	  statement: MonthlyStatement,
   143	  classifier: LineItemClassifier,
   144	): ClassifiedFeeAuditReport {
   145	  const base = auditStatement(statement);
   146	  const nonRefund = statement.lines.filter((l) => !l.isRefund);
   147	  const siblingDeclaredCategories = [...new Set(nonRefund.map((l) => l.declaredCategory))];
   148	  const lineTag = makeLineTagger(statement);
   149	
   150	  const advisoryFindings: ClassifierAdvisoryFinding[] = [];
   151	  for (const line of nonRefund) {
   152	    const input = toClassifierInput(line, siblingDeclaredCategories);
   153	    const prediction = classifier.classify(input);
   154	    if (prediction.predicted === line.declaredCategory) continue; // no candidate — classifier agrees with the declared label
   155	    advisoryFindings.push(buildAdvisoryFinding(line, lineTag(line), prediction, classifier));
   156	  }
   157	
   158	  return Object.freeze({ base, advisoryFindings: Object.freeze(advisoryFindings) });
   159	}

exec
/bin/zsh -lc "rg -n \"runCheck\\(|runConformanceCheck\\(|runDemo\\(|auditStatement\\(|auditWithClassification\\(|FEE_RULES|get_rule|MCP|n8n|trajectory|recommendation class|Recommendation\\[\\]\" docs/plan-agentic-extension.md docs/plan-truth-audit-execution.md docs/research/agentic-extension-research-2026-07.md lib evals" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
docs/plan-agentic-extension.md:11:- **Question:** how do we add the four owner-named surfaces (agent crew · MCP server · Slack/email delivery · n8n lane) without breaking the constraints that make the repo credible (agents recommend / engine decides; offline-first; honesty labels; anti-theater floors; prototype-not-service)?
docs/plan-agentic-extension.md:12:- **Answer:** one typed JSON-in/JSON-out **tool-registry seam** over the engine's existing entry points (A0), consumed by all four surfaces; every surface offline-first with byte-frozen artifacts; the "agent" label earned only through pre-registered trajectory-eval floors (else it honestly downgrades to "workflow"); one module ceremony (AM) with a hiring-facing showcase runbook.
docs/plan-agentic-extension.md:16:**Goal:** a PERSONAL DEMONSTRATION project showcasing applied-AI / agentic-systems / AI-automation proficiency for AI-Engineer-class roles (AI Engineer · AI Specialist · Applied AI Engineer · AI Automation Specialist). Boundary: NOT model development/training; NOT no-code-only. Floor tools (not ceiling): Claude Code/Codex · n8n · MCP · Zapier-class.
docs/plan-agentic-extension.md:20:2. **Offline-first (RULES §3):** no live Slack, Resend/email, n8n-external, Groq, or Gemini call until the offline slice exists and safety controls are defined. Live runs = owner-gated **transient demos**, never standing infrastructure.
docs/plan-agentic-extension.md:29:Research digest (2026-07-06, committed): validated the role/tool targeting; Anthropic workflows-vs-agents + agents-over-verified-tools guidance = citable design rationale; MCP = Linux-Foundation standard; n8n "deterministic backbone + agents at intelligence points" = our thesis verbatim; **eval literacy = the #1 hiring signal — our strongest card**; portfolio bar = edge-case handling + loop prevention + an eval suite ≥20 cases.
docs/plan-agentic-extension.md:31:frontier-advisor consult (2026-07-07, PROCEED): **(a)** A1 (MCP) and A2 (crew) are **siblings on A0**, both consuming the registry — declared parallel-eligible, A1 scheduled first (small, mechanical, shakes out the registry contract before the expensive slice). **(b)** The shared registry is sound coupling IFF JSON-in/JSON-out from day one and byte-frozen in A0 — adopted. **(c) Deciding risk = trajectory-eval floors being vague at plan time** → §6 makes them concrete; floor failure = label downgrade to "workflow," never retry-until-green. **(d)** Hiring-audience gaps folded in: showcase runbook (AM deliverable) · legible trajectory traces (A2 criterion) · a deliberate guardrail-refusal demo beat (A2 criterion) · how the PRIVATE repo is shown = named owner call (O-A3).
docs/plan-agentic-extension.md:41:                         │        auditWithClassification / FEE_RULES │
docs/plan-agentic-extension.md:50:              A1 MCP server   A2 agent crew   A3 delivery A4 n8n lane
docs/plan-agentic-extension.md:53:              check_feed,      Reviewer;       Kit + email  tools via CLI/MCP;
docs/plan-agentic-extension.md:55:              get_rule)        typed traces)   functions)   episodic)
docs/plan-agentic-extension.md:58:- **One seam, four consumers.** The registry is what makes the differential test possible: every consumer's output must byte-equal the engine's direct answer (AC-2). Agents/MCP/n8n never import engine internals — machine-verified import walk (SOR-blind-actor precedent, D1).
docs/plan-agentic-extension.md:60:- **Recommendation-only enforcement:** agent outputs are a separate typed `Recommendation[]` referencing engine finding ids — the type system gives agents no channel to construct or mutate findings/verdicts (same pattern as F1b's advisory array, which never gates).
docs/plan-agentic-extension.md:67:| AC-2 | **Differential fidelity** | For each tool and each corpus fixture: registry output ≡ direct engine call output (byte-equal); later: MCP-served output ≡ registry output |
docs/plan-agentic-extension.md:68:| AC-3 | $0/offline core | Import-graph eval: registry + MCP server + delivery builders + crew orchestrator (offline mode) reach NO LLM SDK / network module (extends the existing $0-LLM eval pattern) |
docs/plan-agentic-extension.md:69:| AC-4 | MCP conformance | Server built on the official TypeScript SDK (version pinned + freshness-dated at A1 entry); tools listed/called via a scripted client; the full client transcript committed byte-frozen as the demo artifact |
docs/plan-agentic-extension.md:70:| AC-5 | Trajectory evals (the anti-theater floor for the "agent" label) | ≥20 offline-replayable trajectory cases total, ≥5 per crew member, incl. ≥2 prompt-injection cases (hostile content inside audited artifacts) and ≥2 guardrail-refusal cases; floors per §6 pre-registered BEFORE any live arming |
docs/plan-agentic-extension.md:72:| AC-7 | Legible traces | Every crew run emits a typed trajectory record (tool calls, args digests, member, timing, verdict refs) + a human-readable rendering; documentation-standard two-register rule applies |
docs/plan-agentic-extension.md:74:| AC-9 | n8n lane veracity | Committed workflow JSON references ONLY sanctioned tool commands (structural test); runbook documents the episodic self-hosted run; no standing trigger nodes (webhook/cron) in the committed workflow |
docs/plan-agentic-extension.md:91:| **A0 — tool registry** | Typed JSON-in/JSON-out registry wrapping `runCheck` / `runConformanceCheck` / `runDemo` / `auditStatement` / `auditWithClassification` / rule lookup over `FEE_RULES`; input/output schemas; loud typed errors; goldens byte-frozen | AC-1, AC-2 (registry≡engine), AC-3 · per-slice verify + red-green + Codex changed-files |
docs/plan-agentic-extension.md:92:| **A1 — MCP server** | stdio server, official TS SDK (pin + freshness check at entry); tools `check_feed`, `audit_statement`, `get_rule` (+ `run_demo` if free); scripted-client transcript committed | AC-2 (MCP≡registry), AC-3, AC-4 · per-slice gate |
docs/plan-agentic-extension.md:95:| **A4 — n8n lane** | Exported workflow JSON (calls the CLI/MCP tools; no standing triggers) + runbook for the episodic self-hosted docker run; n8n sustainable-use license freshness check at entry; docker install = owner call O-A4 | AC-9, AC-12 · per-slice gate |
docs/plan-agentic-extension.md:98:**Live legs (ALL outside the slices above; each needs its own owner word):** L-1 crew live run (Groq $0 first, Gemini ≤ remaining cap; scored vs the §6 pre-registered floors; below floor → label stays "workflow", reported as-is) · L-2 Slack/email transient demo (after A3's safety controls; one-shot) · L-3 n8n live episodic demo. Precedent rules carry: pre-registrations COMMITTED before arming; probe output paths before unrecoverable spend; degraded runs = diagnostic, never enshrined.
docs/plan-agentic-extension.md:102:**A trajectory case is** a committed, replayable tuple: `(input artifact, allowed-tool-call constraints, expected terminal recommendation class, expected gate behavior)` — replayed offline against recorded/mocked LLM turns; deterministic; no network.
docs/plan-agentic-extension.md:106:**Floors (offline replay, exact):** 100% of cases: no out-of-contract tool call, no finding/verdict mutation (AC-6 invariant holds), terminal state ∈ {recommendation, escalate-to-human} — never silent drop; ≥90% of cases: expected recommendation class matched; 100% of refusal/injection cases: the gate fires / the injection does not steer tool choice. **Live floors** (for L-1) are pre-registered at arming time on a held-out case split, committed before the run (house precedent ×3).
docs/plan-agentic-extension.md:114:| MCP = Linux Foundation standard; TS SDK official | 2026-07-06 (digest, official-tier) | A1 entry (pin exact SDK version + license, dated) |
docs/plan-agentic-extension.md:115:| n8n self-hosted free (sustainable-use license) | 2026-07-06 (digest, vendor-tier) | A4 entry (license text + docker image, dated) |
docs/plan-agentic-extension.md:127:- **O-A4:** n8n self-hosted docker install on this machine (new tooling; poppler/cargo precedent).
docs/plan-agentic-extension.md:138:| MCP SDK churn | Exact pin + dated freshness at A1 entry; conformance transcript re-frozen consciously on any upgrade |
docs/plan-agentic-extension.md:141:| n8n lane becomes no-code-only theater | The lane calls the SAME tested tools; its gate asserts tool references structurally (AC-9); it is one surface of four, never the headline |
docs/plan-truth-audit-execution.md:123:**Overall confidence (Codex amendment 10): MEDIUM, conditional on G8** — not medium-high; the residual-seat trajectory (shrinking under every adversarial pass) and the unresolved two-part crux cap it.
docs/research/agentic-extension-research-2026-07.md:3:**Why this exists:** the owner's 2026-07-06 directive (decision-log, verbatim rows) extends the program: the showcase target is the **applied-AI / agentic-systems / AI-automation** proficiency companies currently hire for — agents, multi-agent systems, AI workflows, integrations (Slack, email, MCP, n8n/Zapier-class), built on frontier models — explicitly NOT model development/training, and NOT no-code-only toy use. Target roles named by the owner: AI Engineer, AI Specialist, Applied AI Engineer, AI Automation Specialist. This digest grounds the goal re-fix in live, dated sources per the standing rule (enterprise claims are researched, never memory-based).
docs/research/agentic-extension-research-2026-07.md:13:- **"AI Automation Specialist"** is a real, distinct lane: builds AI-driven workflows integrating enterprise tools/APIs — "workflows too complex for a marketer with Zapier, but too small for a full-time engineering team" (mraiwala.com 2026 role comparison, practitioner tier). This matches the owner's n8n/Zapier/MCP framing exactly.
docs/research/agentic-extension-research-2026-07.md:17:**Verdict:** what the owner described is professionally called **agent engineering / applied AI engineering**, building **agentic AI systems (vertical AI agents) and AI workflow automations**. The named tools (Claude Code/Codex, n8n, MCP, Zapier) are recognized floor-not-ceiling instruments of that lane.
docs/research/agentic-extension-research-2026-07.md:22:- **2026 trend (Anthropic agentic-coding trends report, official):** value shifts to **"digital assembly lines" — human-guided multi-step workflows where multiple agents run end-to-end processes, enabled by MCP.**
docs/research/agentic-extension-research-2026-07.md:27:## 3. MCP — industry infrastructure, not a bet (official/strong)
docs/research/agentic-extension-research-2026-07.md:30:- Adoption metrics (field signals, single-source magnitudes): ~97M monthly SDK downloads by March 2026; "78% of enterprise AI teams have MCP-backed agents in production" (andrew.ooo July-2026 state-of-play; UNVERIFIED magnitude, direction corroborated).
docs/research/agentic-extension-research-2026-07.md:31:- **Exposing your product as an MCP server is a recognized professional pattern** — 10,000+ public MCP servers at donation time (Anthropic figure via Wikipedia).
docs/research/agentic-extension-research-2026-07.md:35:- **n8n:** $180M Series C (Oct 2025), **$2.5B valuation**, >180k GitHub stars; serves as **the orchestration layer for SAP's Autonomous Enterprise platform** (n8n blog + chronexa/hatchworks 2026 guides; vendor+practitioner). Free self-hosted tier fits our cost rules.
docs/research/agentic-extension-research-2026-07.md:36:- **The 2026 consensus pattern matches our thesis verbatim:** "n8n provides the reliable backbone for business processes — deterministic workflows that must execute consistently — while AI agents plug in at specific points where intelligence is needed" (superstackit/entrans 2026, practitioner tier).
docs/research/agentic-extension-research-2026-07.md:41:- Hiring-signal consensus (digitalapplied 2026 hiring guide + braintrust/arthur playbooks, practitioner/vendor): the current skill list = **agent orchestration · MCP integration · eval design · prompt engineering · RAG · cost optimization · guardrails · observability · frontier-model fluency**. Quote: **"Eval literacy is the single biggest signal of 'this person actually built with LLMs.'"**
docs/research/agentic-extension-research-2026-07.md:51:1. **The market name for what we're building:** an **agentic AI system / vertical AI agent** for marketplace truth & fee-compliance auditing, built by **applied-AI engineering** — with an **AI-workflow/automation** surface (n8n lane) covering the automation-specialist story.
docs/research/agentic-extension-research-2026-07.md:52:2. **The architecture the evidence endorses is the one we can honestly build:** deterministic verified core (done) → agent crew orchestrating it as tools (to build) → MCP server exposure (to build) → Slack/email delivery (to build, offline-first per RULES §3) → observability/tracing + eval-in-CI (largely done; needs the agent-trajectory surface) → n8n workflow calling the same tools (optional lane, showcases the automation role).
docs/research/agentic-extension-research-2026-07.md:56:**Freshness:** all sources fetched live 2026-07-06. Figures from vendor/practitioner posts are labeled; role-demand magnitudes are directional field signals; official-tier items: Anthropic agent guidance + trends report, MCP Linux-Foundation governance, OpenAI/Google/Microsoft MCP adoption.
evals/packs/fees-audit-e1.test.ts:51:    const report = auditStatement({ meta: meta("2026-08-15"), lines: [...overCapLines] });
evals/packs/fees-audit-e1.test.ts:57:    const report = auditStatement({ meta: meta("2026-07-10"), lines: [...overCapLines] });
evals/packs/fees-audit-e1.test.ts:63:    const report = auditStatement({
evals/packs/fees-audit-e1.test.ts:82:    const report = auditStatement({
evals/packs/fees-audit-e1.test.ts:99:    const report = auditStatement({
evals/packs/fees-audit-e1.test.ts:112:    const report = auditStatement({
evals/packs/fees-audit-e1.test.ts:125:    const report = auditStatement({
evals/packs/fees-audit-e1.test.ts:144:    const report = auditStatement({
evals/packs/fees-audit-e1.test.ts:157:    const report = auditStatement({
evals/packs/fees-audit-e1.test.ts:170:    const report = auditStatement({
evals/packs/fees-audit-e1.test.ts:185:    const report = auditStatement(buildFaithfulStatement());
lib/packs/listings/cli.ts:37:export function runCheck(
lib/packs/listings/cli.ts:66:export function runConformanceCheck(
lib/packs/listings/cli.ts:91:export function runDemo(opts: { json?: boolean } = {}): DemoCliResult {
evals/packs/fees-classifier.test.ts:153:  it("auditWithClassification's `base` report is EXACTLY auditStatement(statement) — byte-identical", () => {
evals/packs/fees-classifier.test.ts:155:    const direct = auditStatement(statement);
evals/packs/fees-classifier.test.ts:156:    const { base } = auditWithClassification(statement, DeterministicBaselineClassifier);
evals/packs/fees-classifier.test.ts:169:      expect(serializeFeeReport(auditStatement(build())), golden).toBe(goldenText);
evals/packs/fees-classifier.test.ts:175:    const { advisoryFindings } = auditWithClassification(statement, DeterministicBaselineClassifier);
evals/packs/fees-classifier.test.ts:202:    const direct = auditStatement(statement);
evals/packs/fees-classifier.test.ts:203:    const { base } = auditWithClassification(statement, DeterministicBaselineClassifier);
evals/packs/fees-classifier.test.ts:220:    const { advisoryFindings } = auditWithClassification(withDups, flagAll);
evals/packs/fees-classifier.test.ts:245:    const { advisoryFindings } = auditWithClassification(buildDriftedStatement(), mock);
evals/packs/fees-classifier.test.ts:254:    const { advisoryFindings } = auditWithClassification(buildDriftedStatement(), DeterministicBaselineClassifier);
evals/packs/fees-classifier.test.ts:267:    const { advisoryFindings, base } = auditWithClassification(buildDriftedStatement(), mock);
evals/packs/fees-drift-lock.test.ts:6:  FEE_RULES,
evals/packs/fees-drift-lock.test.ts:37:const implementedIds = new Set(FEE_RULES.map((r) => r.id));
evals/packs/fees-drift-lock.test.ts:81:  it.each(FEE_RULES.map((r) => [r.id, r] as const))(
evals/packs/fees-advisory-nits.test.ts:75:    const report = auditStatement(statement([line({ orderId: "OR#D-9", declaredCategory: "promo#extra" })]));
evals/packs/fees-advisory-nits.test.ts:91:    const report = auditWithClassification(statement([line({ declaredCategory: "promo#extra" })]), mock);
evals/packs/fees-freeze.test.ts:17: * auditStatement(builder) — so the corpus cannot be hand-tampered without CI
evals/packs/fees-freeze.test.ts:45:    it(`${golden} is exactly auditStatement(${name})`, () => {
evals/packs/fees-freeze.test.ts:46:      expect(read(golden)).toBe(serializeFeeReport(auditStatement(build())));
evals/packs/fees-freeze.test.ts:52:    expect(serializeFeeReport(auditStatement(s))).toBe(serializeFeeReport(auditStatement(s)));
evals/packs/fees-coverage-c6.test.ts:33:  Object.entries(builders).map(([n, b]) => [n, auditStatement(b())]),
lib/packs/fees/generate.ts:210:    "statement.faithful.json": auditStatement(buildFaithfulStatement()),
lib/packs/fees/generate.ts:211:    "statement.drifted.json": auditStatement(buildDriftedStatement()),
lib/packs/fees/generate.ts:212:    "statement.cured.json": auditStatement(buildCuredStatement()),
lib/packs/fees/generate.ts:213:    "statement.conditional.json": auditStatement(buildConditionalStatement()),
lib/packs/fees/classified-audit.ts:93:  /** Exactly `auditStatement(statement)` — byte-identical to the default path. */
lib/packs/fees/classified-audit.ts:141:export function auditWithClassification(
lib/packs/fees/classified-audit.ts:145:  const base = auditStatement(statement);
lib/packs/fees/index.ts:58:  FEE_RULES,
lib/packs/fees/cli.ts:40:  const report = auditStatement(statement);
lib/packs/fees/rules.ts:78:export const FEE_RULES: readonly FeeRule[] = [
lib/packs/fees/rules.ts:94:  FEE_RULES.map((r) => [r.id, r]),
lib/packs/fees/rules.ts:117:  FEE_RULES.filter((r) => r.base !== undefined).map((r) => r.id),
lib/packs/fees/audit.ts:166:export function auditStatement(statement: MonthlyStatement): FeeAuditReport {

exec
/bin/zsh -lc 'find . -name AGENTS.md -print' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 942ms:
./AGENTS.md

codex
I’m not running the full test suite because the task is read-only review and the sandbox cannot write build/test caches reliably. I am using existing tests and code as evidence for whether the plan’s proposed tests are actually specifiable.
codex
I’m going to use two bounded subagents as sidecar reviewers because your repo instructions explicitly authorize that for adversarial, architecture-sensitive reviews. I’ll keep their scope narrow: one on eval/testability, one on structural enforcement/DAG/theater.
collab: SpawnAgent
2026-07-07T14:13:06.141102Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer realm=\"OAuth\", resource_metadata=\"https://mcp.linear.app/.well-known/oauth-protected-resource/mcp\", error=\"invalid_token\", error_description=\"Missing or invalid access token\"" })
2026-07-07T14:13:06.227742Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer resource_metadata=\"https://mcp.figma.com/.well-known/oauth-protected-resource\",scope=\"mcp:connect\",authorization_uri=\"https://api.figma.com/.well-known/oauth-authorization-server\"" })
collab: SpawnAgent
2026-07-07T14:13:12.670288Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer realm=\"OAuth\", resource_metadata=\"https://mcp.linear.app/.well-known/oauth-protected-resource/mcp\", error=\"invalid_token\", error_description=\"Missing or invalid access token\"" })
2026-07-07T14:13:12.707774Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer resource_metadata=\"https://mcp.figma.com/.well-known/oauth-protected-resource\",scope=\"mcp:connect\",authorization_uri=\"https://api.figma.com/.well-known/oauth-authorization-server\"" })
codex
The likely verdict is amendments rather than a block: I’m finding several P1-level spec defects, but they are plan-text fixes, not evidence that the whole direction violates the constitution. I’m waiting briefly for the sidecars, then I’ll synthesize only findings I can defend against exact lines.
collab: Wait
codex
One sidecar returned and independently hit the mocked-trajectory label risk and A4 dependency issue. I’m waiting once more for the eval/structural reviewer; if it doesn’t return promptly I’ll finalize from the evidence already inspected.
collab: Wait
codex
VERDICT: CONFIRM-WITH-AMENDMENTS

1. **P1 — §6, `docs/plan-agentic-extension.md:102` / `:106`**  
Defect: trajectory floors are not testable as written. “allowed-tool-call constraints,” “expected recommendation class,” and “injection does not steer tool choice” are not concrete enough to write the failing test.  
Amendment: define a committed trajectory-case schema with `allowedTools`, `forbiddenTools`, expected ordered/unordered tool-call pattern, argument digests, expected engine report hash, recommendation-class enum, expected `findingIds`/`verdictRefs`, expected gate state, and fabricated-ref absence.

2. **P1 — §6, `docs/plan-agentic-extension.md:106`**  
Defect: the ≥90% recommendation floor is aggregate. One crew member can fail its own 5-case set and still pass the crew label.  
Amendment: make floors per member: each member must pass 100% safety invariants and its own recommendation-class floor; publish a member × case matrix and downgrade the failing member/crew label explicitly.

3. **P1 — §6, `docs/plan-agentic-extension.md:102`**  
Defect: recorded/mocked LLM turns can earn the “agent” label. That validates replay orchestration, not a working agent, and is hiring-reviewer theater.  
Amendment: offline replay earns only “orchestration harness passed.” Public “agent” label requires owner-gated live/held-out model run clearing pre-registered floors; until then label as “workflow with mocked agent trajectory replay.”

4. **P1 — AC-6 / §3, `docs/plan-agentic-extension.md:60` / `:71`**  
Defect: “no agent-reachable constructor” is not structurally true in this repo. `Finding` is structurally typed, and constructors/builders are exported via `verifier-core` and `packs/fees`.  
Amendment: require a hard package boundary: agents import only registry client types and serialized registry responses; deny imports from `verifier-core/guard`, `verifier-core/verify`, `packs/*/finding`, `packs/*/audit`, `packs/*/run`; add negative compile/import-walk fixtures.

5. **P1 — AC-2, `docs/plan-agentic-extension.md:58` / `:67` / `:92`**  
Defect: raw “byte-equal” is underspecified and will break or become fake across registry, MCP JSON-RPC envelopes, JSON schema serialization, listings `serializeReport`, fees `serializeFeeReport`, and demo text/JSON modes.  
Amendment: compare canonical payload bytes only, not raw MCP envelopes: named serializer per tool plus exit code, with MCP tests parsing the tool result payload before comparing.

6. **P1 — A0, `docs/plan-agentic-extension.md:91`**  
Defect: `auditWithClassification` is listed as a registry-wrapped tool, but the actual function requires an injected `LineItemClassifier`; the plan does not specify which classifier or label state.  
Amendment: either omit it from A0, or define a separate advisory tool using only `DeterministicBaselineClassifier` / explicit mock with `earnsLabel:false`, and snapshot the separate advisory array.

7. **P1 — A0, `docs/plan-agentic-extension.md:91`**  
Defect: `runDemo` is treated like a registry tool beside decision-grade audit tools, but repo code defines it as a scripted walkthrough, always exit 0, not a gate.  
Amendment: remove `runDemo` from load-bearing registry tools, or mark it `demo_only` and forbid agents/MCP/n8n from using it as an audit result.

8. **P1 — §5 DAG / A4, `docs/plan-agentic-extension.md:82` / `:95`**  
Defect: A4 is shown as depending on A1, but a credible n8n automation lane should also consume A3 delivery payload builders; otherwise it is only a wrapper over CLI/MCP.  
Amendment: change dependency to `A0 -> A1`, `A0 -> A3`, then `A1 + A3 -> A4`; A4 must prove fixture input → registry/MCP tool → A3 payload artifact, no live send.

9. **P1 — Owner calls, `docs/plan-agentic-extension.md:125`**  
Defect: “pre-authorize any subset now” for live legs conflicts with RULES §3’s offline-first order: no live Slack/Resend/n8n/Groq/Gemini until offline slice and safety controls exist.  
Amendment: remove pre-authorization. At GO the owner may approve only the build plan; each live leg must be armed later after its offline gate and safety controls pass.

10. **P2 — A1 / AC-4, `docs/plan-agentic-extension.md:69` / `:92`**  
Defect: MCP acceptance can pass as a thin wrapper transcript. It lacks bad-input behavior, typed MCP error snapshots, schema mismatch checks, and proof the server imports registry only.  
Amendment: add MCP anti-theater gates: invalid-input transcript, typed error snapshot, import-walk MCP→registry-only, and differential tests per tool over faithful/drifted/invalid fixtures.

11. **P2 — A4 / AC-9, `docs/plan-agentic-extension.md:74` / `:95`**  
Defect: structural JSON reference checks alone do not prove an n8n lane works; a hiring reviewer can call it a no-code veneer.  
Amendment: require a zero-network dry run if n8n/docker is approved; otherwise label it “workflow spec, not executed n8n lane” and do not count it as a working automation surface.

12. **P2 — Cost/freshness, `docs/plan-agentic-extension.md:22` / `:116`**  
Defect: “Groq free tier $0” is overconfident. Repo history already corrected this framing to free-tier/not-metered rather than universal $0 billing.  
Amendment: rewrite as “Groq free-tier run expected $0 under current account limits; preflight + ledger required; standard metered pricing re-verified at arming.”
tokens used
1,80,252
VERDICT: CONFIRM-WITH-AMENDMENTS

1. **P1 — §6, `docs/plan-agentic-extension.md:102` / `:106`**  
Defect: trajectory floors are not testable as written. “allowed-tool-call constraints,” “expected recommendation class,” and “injection does not steer tool choice” are not concrete enough to write the failing test.  
Amendment: define a committed trajectory-case schema with `allowedTools`, `forbiddenTools`, expected ordered/unordered tool-call pattern, argument digests, expected engine report hash, recommendation-class enum, expected `findingIds`/`verdictRefs`, expected gate state, and fabricated-ref absence.

2. **P1 — §6, `docs/plan-agentic-extension.md:106`**  
Defect: the ≥90% recommendation floor is aggregate. One crew member can fail its own 5-case set and still pass the crew label.  
Amendment: make floors per member: each member must pass 100% safety invariants and its own recommendation-class floor; publish a member × case matrix and downgrade the failing member/crew label explicitly.

3. **P1 — §6, `docs/plan-agentic-extension.md:102`**  
Defect: recorded/mocked LLM turns can earn the “agent” label. That validates replay orchestration, not a working agent, and is hiring-reviewer theater.  
Amendment: offline replay earns only “orchestration harness passed.” Public “agent” label requires owner-gated live/held-out model run clearing pre-registered floors; until then label as “workflow with mocked agent trajectory replay.”

4. **P1 — AC-6 / §3, `docs/plan-agentic-extension.md:60` / `:71`**  
Defect: “no agent-reachable constructor” is not structurally true in this repo. `Finding` is structurally typed, and constructors/builders are exported via `verifier-core` and `packs/fees`.  
Amendment: require a hard package boundary: agents import only registry client types and serialized registry responses; deny imports from `verifier-core/guard`, `verifier-core/verify`, `packs/*/finding`, `packs/*/audit`, `packs/*/run`; add negative compile/import-walk fixtures.

5. **P1 — AC-2, `docs/plan-agentic-extension.md:58` / `:67` / `:92`**  
Defect: raw “byte-equal” is underspecified and will break or become fake across registry, MCP JSON-RPC envelopes, JSON schema serialization, listings `serializeReport`, fees `serializeFeeReport`, and demo text/JSON modes.  
Amendment: compare canonical payload bytes only, not raw MCP envelopes: named serializer per tool plus exit code, with MCP tests parsing the tool result payload before comparing.

6. **P1 — A0, `docs/plan-agentic-extension.md:91`**  
Defect: `auditWithClassification` is listed as a registry-wrapped tool, but the actual function requires an injected `LineItemClassifier`; the plan does not specify which classifier or label state.  
Amendment: either omit it from A0, or define a separate advisory tool using only `DeterministicBaselineClassifier` / explicit mock with `earnsLabel:false`, and snapshot the separate advisory array.

7. **P1 — A0, `docs/plan-agentic-extension.md:91`**  
Defect: `runDemo` is treated like a registry tool beside decision-grade audit tools, but repo code defines it as a scripted walkthrough, always exit 0, not a gate.  
Amendment: remove `runDemo` from load-bearing registry tools, or mark it `demo_only` and forbid agents/MCP/n8n from using it as an audit result.

8. **P1 — §5 DAG / A4, `docs/plan-agentic-extension.md:82` / `:95`**  
Defect: A4 is shown as depending on A1, but a credible n8n automation lane should also consume A3 delivery payload builders; otherwise it is only a wrapper over CLI/MCP.  
Amendment: change dependency to `A0 -> A1`, `A0 -> A3`, then `A1 + A3 -> A4`; A4 must prove fixture input → registry/MCP tool → A3 payload artifact, no live send.

9. **P1 — Owner calls, `docs/plan-agentic-extension.md:125`**  
Defect: “pre-authorize any subset now” for live legs conflicts with RULES §3’s offline-first order: no live Slack/Resend/n8n/Groq/Gemini until offline slice and safety controls exist.  
Amendment: remove pre-authorization. At GO the owner may approve only the build plan; each live leg must be armed later after its offline gate and safety controls pass.

10. **P2 — A1 / AC-4, `docs/plan-agentic-extension.md:69` / `:92`**  
Defect: MCP acceptance can pass as a thin wrapper transcript. It lacks bad-input behavior, typed MCP error snapshots, schema mismatch checks, and proof the server imports registry only.  
Amendment: add MCP anti-theater gates: invalid-input transcript, typed error snapshot, import-walk MCP→registry-only, and differential tests per tool over faithful/drifted/invalid fixtures.

11. **P2 — A4 / AC-9, `docs/plan-agentic-extension.md:74` / `:95`**  
Defect: structural JSON reference checks alone do not prove an n8n lane works; a hiring reviewer can call it a no-code veneer.  
Amendment: require a zero-network dry run if n8n/docker is approved; otherwise label it “workflow spec, not executed n8n lane” and do not count it as a working automation surface.

12. **P2 — Cost/freshness, `docs/plan-agentic-extension.md:22` / `:116`**  
Defect: “Groq free tier $0” is overconfident. Repo history already corrected this framing to free-tier/not-metered rather than universal $0 billing.  
Amendment: rewrite as “Groq free-tier run expected $0 under current account limits; preflight + ledger required; standard metered pricing re-verified at arming.”
```
