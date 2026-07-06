Reading additional input from stdin...
OpenAI Codex v0.136.0
--------
workdir: /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
model: gpt-5.5
provider: openai
approval: never
sandbox: read-only
reasoning effort: medium
reasoning summaries: none
session id: 019f3806-f094-7381-a85d-ce822067de41
--------
user
Changed-files review (read-only) of the UNCOMMITTED working diff in this repo (git diff + the new untracked file evals/packs/fees-advisory-nits.test.ts). Context: this slice closes the three NON-BLOCKING advisory nits recorded at the M2 acceptance gate (docs/reviews/gate-2026-07-04-m2-f1-module.md, gate 4): (1) stale field comment on FeeFinding.verdict; (2) object-identity lineIndex maps rendering silent "Lundedfined" tags; (3) '#' in arbitrary orderId/declaredCategory making claim ids unparseable. Evidence log: docs/reviews/advisory-nits-verify-evidence.log (red-green executed; npm run verify exit 0 = 749 passed + 6 skipped; goldens byte-frozen).

CHALLENGE SPECIFICALLY:
a) BYTE-FREEZE SAFETY: claimIdPart ('%'->'%25' then '#'->'%23') must be identity on every committed corpus value — verify no fixture/golden/answer-key value contains '#' or '%' (fixtures/, lib/packs/fees/generate.ts seeds, evals/gold/). If any does, this silently changed golden bytes.
b) ESCAPE CORRECTNESS: is the escape order sound and reversible (no double-encoding ambiguity)? The test's unescapePart reverses '%23' before '%25' — is that inverse correct?
c) COVERAGE: are there OTHER claim-id constructions in the fees pack (or consumers that split fee ids on '#') the fix missed? month/enum components were deliberately left unescaped — is that sound (schema-validated month "YYYY-MM", enum LEGAL_FEE_CATEGORIES)?
d) makeLineTagger: any behavior change reachable via the parser path? The throw must be dead code for parser-produced statements. Also: classified-audit now shares the tagger — confirm its advisory findings' L-tags are unchanged for member lines.
e) The comment fix on FeeFinding.verdict — accurate vs the actual FeeVerdict union?
Report findings with P0/P1/P2/P3 severity, file:line, and whether each is refutable. If clean, say CLEAN.
2026-07-06T15:23:27.509922Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer realm=\"OAuth\", resource_metadata=\"https://mcp.linear.app/.well-known/oauth-protected-resource/mcp\", error=\"invalid_token\", error_description=\"Missing or invalid access token\"" })
2026-07-06T15:23:27.563166Z ERROR rmcp::transport::worker: worker quit with fatal: Transport channel closed, when AuthRequired(AuthRequiredError { www_authenticate_header: "Bearer resource_metadata=\"https://mcp.figma.com/.well-known/oauth-protected-resource\",scope=\"mcp:connect\",authorization_uri=\"https://api.figma.com/.well-known/oauth-authorization-server\"" })
codex
I’ll treat this as a read-only changed-files review and use the repo’s review workflow plus the relevant code-review skill. I’m going to verify the active project instructions first, then inspect the diff, the untracked test, and the specific corpus/golden paths you called out.
exec
/bin/zsh -lc "sed -n '1,240p' RULES.md" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
# RULES.md — ActivationOps AI Operating Rules

These are the non-negotiable rules for everyone working on this project: Claude Code (account 1), Claude Code (account 2), Claude Code CLI, Codex, and the human owner.

They live in the repo on purpose (Rule 1). **If anything else — a chat prompt, a skill, a model's memory, a habit — conflicts with this file, this file wins.**

Last reviewed: 2026-06-01.

## 1. Source of truth and continuity

1. The repo is the source of truth — not chat history, not model memory, not a previous session's recollection.
2. Every agent (Claude account 1, Claude account 2, Claude CLI, Codex) continues from repo files, never from memory. On start: read `RULES.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md`, `HANDOFF.md`, `docs/task-log.md`, then run `git status`, then summarize and wait for human approval.

## 2. Roles

3. Claude Code is the main planner and builder.
4. Codex is the adversarial reviewer, changed-files reviewer, rescue debugger, and pre-ship auditor.
5. The human owner makes the final call on product, scope, architecture, and publishing. Agents propose; the human disposes.

## 3. How we build

6. Build in flow state, but never allow silent architecture drift. Any change that alters scope or architecture stops for a `docs/decision-log.md` entry and human sign-off.
7. Start simple. Add complexity only when a concrete, named need justifies it.
8. No live Supabase, Slack, n8n, Resend, or Gemini integration until the offline thin slice is complete and reviewed.

Order of operations — each precedes the next:

9. Deterministic logic before AI calls.
10. Structured outputs before prose.
11. Decision before action.
12. Human approval before risky automation.
13. Evaluation before claims.
14. Logs before confidence.
15. Cost control before scale.

## 4. AI honesty and product integrity

16. Do not publish or commit AI-churned work. Generated text or code is a draft until a human reads and accepts it.
17. No AI-generated output is final until reviewed and accepted.
18. Never claim "no AI was used."
19. Never claim "AI built this."
20. Use the framing: **human-led, AI-assisted, professionally reviewed.**

Project integrity: this is a simulation on dummy data. Never claim real DoorDash access, real merchant data, or real business impact. Label all metrics "simulated."

## 5. Claude skills rule

Claude Code must use relevant skills from the configured skills folder when they apply. Before starting a task, identify:

- the task type;
- the relevant skill(s);
- why the skill applies;
- whether any skill conflicts with these rules.

If a skill conflicts with project rules, RULES.md wins. Do not use skills blindly — use only the smallest relevant set. Record skill usage in `docs/task-log.md`.

## 6. Source verification rule

Any claim about tool capabilities, plugin behavior, Gemini model status, API limits, pricing or free tiers, Slack, n8n, Resend, Supabase, Google Sheets, Claude Code, or Codex must be verified against current official documentation (or the installed tool itself) — or clearly marked **UNVERIFIED**.

- Do not rely on memory for platform behavior.
- Do not document a platform claim without a source basis.
- Cite the source (URL or local path) next to the claim where practical.

## 7. Visual documentation standard

Use visuals to explain the system, not to decorate it. Mermaid (`.mmd`) by default.

1. Every diagram explains a real workflow, decision, or architecture.
2. A diagram must be understandable in under a minute.
3. If implementation changes a workflow, update the diagram in the same task.
4. Visuals must not imply features that are not built yet.
5. Future-state diagrams must be clearly labeled roadmap / target.
6. The public README should eventually carry only product diagrams, not internal process diagrams.
7. Do not let the dual-model diagram overshadow the product.

See `docs/visuals/README.md`.

## 8. Public vs internal documentation

Dual-model engineering is an internal build method, not the product. Do not let the build process overshadow the product.

- **Public docs** focus on the product: the onboarding problem, the AI workflow, data model, risk scoring, blocker diagnosis, guardrails, human review, automation flow, outcome tracking, limitations, roadmap.
- **Internal docs** may cover the Claude + Codex workflow, Codex commands, review gates, rescue, handoff, skills usage, cross-account continuity.
- In public docs, Claude Code and Codex appear only under a short "Development Workflow" note — never as the product runtime stack.

| Layer | Components |
| --- | --- |
| Product runtime stack | CSV / Google Sheets, Python or Apps Script, Gemini, Supabase, n8n, Slack, Resend, dashboard / docs |
| Development workflow (internal) | Claude Code (planning + build), Codex (adversarial review, changed-file review, rescue, pre-ship), Git, Mermaid |

## 9. Definition of done

A task is done only when:

- code or documentation changed as expected;
- checks or tests were run where applicable;
- `docs/task-log.md` updated;
- `docs/implementation-journal.md` updated if the work was meaningful;
- `docs/decision-log.md` updated if scope or architecture changed;
- `HANDOFF.md` updated;
- Codex review completed, or intentionally deferred with a written reason;
- the human owner can understand the next step.

## 10. Where things get recorded

- Small edits → `docs/task-log.md`.
- Meaningful work, failures, tradeoffs, corrections → `docs/implementation-journal.md`.
- Scope / architecture decisions → `docs/decision-log.md` (plus an ADR in `docs/decisions/` if major).
- Active task → `CURRENT_TASK.md`. Session hand-off → `HANDOFF.md`. Overall state → `PROJECT_STATE.md`.
- Before closing any task, run `docs/checklists/prevent-repeat-checklist.md`.

## 11. Secrets

No secrets anywhere in the repo or its outputs: no API keys, tokens, credentials, connection strings, personal data, or other secrets in code, CSVs, logs, screenshots, commit history, docs, or prompts.

- Use environment variables or a secret manager for any future credential — never a committed file.
- Keep contact data in the simulation fake (e.g., `@example.com`).
- If a secret is ever committed by accident, treat it as compromised: rotate it and scrub it — do not just delete the line.

## 12. Commit hygiene

- Check `git status` before starting and after finishing work.
- Commit after each clean slice — one whose checks/tests pass and whose state is coherent.
- Do not commit broken, half-finished, or unclear work.
- Commit messages explain the task outcome (what changed and why), not "wip".
- The human owner approves commits and pushes; do not commit or push unless asked.

## 13. Lightweight vs full workflow

Match the process weight to the risk.

- **Lightweight loop** — for deterministic, offline slices (data normalization, scoring, local logic): build, run checks, one Codex changed-files review, update `docs/task-log.md` and `HANDOFF.md`. Journal and decision-log only if something meaningful or architectural happened.
- **Full loop** — for integrations, live sends, auth/security, data writes, and publishing: plan adversarial review, build, changed-files review, rescue if needed, journal + decision-log, prevent-repeat checklist, and (for high-risk sessions only) the Codex review gate.

When unsure which applies, use the full loop. See `docs/dual-model-workflow.md`.

## 14. Enterprise Delivery Playbook (pointer)

`docs/enterprise-delivery-playbook.md` is the living "how" for professional execution. `RULES.md` stays the constitution; the playbook elaborates it. Key rules it carries:

- **Core traceability:** every meaningful task runs idea → use-case classification → source scan → framework/tool selection → alternatives → assumptions → approach → validation evidence → failure handling → reuse → expansion → handoff → human approval — *proportional to risk*.
- **Lightweight vs full** (per §13) governs how much of that chain applies.
- **Source-backed standard:** important claims use source tiers (Tier 1 official first) with a stated sufficiency/stop point; no memory for platform behavior (extends §6).
- **Source/pattern/reference intake:** evaluate before adopting *anything* external (source, repo, template, workflow, tool, code/prompt/UI/design pattern, architecture, framework, methodology) — no default adoption, no cargo-culting; classify borrow/reject/adapt/defer; approval gate when it affects scope, architecture, tools, data model, AI behavior, integrations, public claims, or publishing. Proportional to risk.
- **Open-source discovery:** named sources/frameworks/repos/communities/examples (in the repo or a task prompt) are **candidates/seed lists, not boundaries**. Search **broadly and task-specifically** — official + vendor + standards docs, mature OSS, GitHub issues/PRs, eng blogs, and community field-signals (Reddit/forums/YouTube/Stack Overflow) — then pick by quality/relevance/freshness/maturity/risk. Tiers judge *quality*, not *discovery*. Maximum-useful-research ≠ endless: stop when more research won't change the decision; document uncertainty. Community content is a field signal, not proof, unless corroborated.
- **Model/API/tool freshness:** model/API/platform choices that affect implementation, cost, security, public claims, or compatibility carry a dated freshness check.
- **Artifact policy:** every generated artifact is classified (commit / regenerate / ignore / examples / internal).
- **Stage closure criteria:** a stage closes only on the playbook's checklist + human approval.
- **No new standing logs unless justified:** prefer updating existing docs.
- **Living standard:** change the playbook only on real evidence, and record what/why/trigger/universal-or-project-specific/burden.
- **Roles:** Claude applies the playbook · Codex verifies it was applied · ChatGPT web gives stage-level review · the human owner approves. No assistant turns a suggestion into a decision.
- **Git state is always re-derived** from `git status` + `git log --oneline -8`, never assumed.

## 15. Mandatory Startup Contract

Every Claude Code session must begin by:

1. Reading `RULES.md`.
2. Reading `CLAUDE.md`.
3. Reading `PROJECT_STATE.md`.
4. Reading `CURRENT_TASK.md`.
5. Reading `HANDOFF.md`.
6. Reading `docs/enterprise-delivery-playbook.md`.
7. Running `git status`.
8. Running `git log --oneline -8`.
9. Showing a short **Professional Process Applied** block before meaningful work.
10. Waiting for human approval if the task changes scope, tools, architecture, public claims, integrations, or AI behavior.

The **Professional Process Applied** block must include: task type · stage · risk level · lightweight or full mode · framework/principle/tool basis · source requirement · validation method · artifact policy (if relevant) · documentation required · Codex review needed or not · human approval needed or not.

**Stop condition:** if Claude cannot identify the task type, risk level, validation method, or whether lightweight/full mode applies, **stop and ask the human owner before acting.**

**Proportionality (anti-bloat):** keep this light for trivial edits. For small, low-risk changes the Professional Process Applied block can be a single line. Do not run full ceremony on a one-line doc fix.

**Codex enforcement:** every Codex review verifies whether this contract and the playbook were followed (`CODEX.md`). If Claude skipped the playbook/contract for a *meaningful* task, Codex flags it as a process finding.

## 16. Prompt Intake (Intent Capture & Prompt Synthesis) — non-negotiable

Owner input may be rough, broken, or ungrammatical; that must **never** degrade output. Before acting on owner input, every agent (any account, any IDE) applies the **Prompt Intake Protocol** (`docs/prompt-intake-protocol.md`): **preserve the raw input verbatim**, reconstruct the true intent, and synthesize an effective prompt aligned to the current model + playbook — **without diluting, summarizing, or dropping** anything.

- **Principle-based, self-updating:** durable principles live in the protocol; specific prompting *techniques* are delegated to current model docs + updatable prompt skills (re-verified per §6). Do not hardcode tricks.
- **Proportional (anti-bloat):** default to silent intent-capture; surface a structured interpretation or a confirm only when the request is ambiguous or consequential. No friction on trivial edits.
- **Fidelity over fluency:** raw input is authoritative; any added assumption is surfaced explicitly, never buried. When intent is unclear on consequential work, ask.
- **Portable:** the protocol's core works with zero skills installed; skills are optional accelerators.

exec
/bin/zsh -lc "sed -n '1,220p' CURRENT_TASK.md" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "sed -n '1,180p' docs/task-log.md" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
# CURRENT_TASK.md

The single active task. Update this whenever the active task changes or pauses.

- **Task ID:** PIVOT-RESEARCH (2026-07-01/02; owner-directed — supersedes the MULTI-AGENT-PIVOT roadmap as the ACTIVE task; the multi-agent build + slice-2 close-out are SUSPENDED, not cancelled — slice-2's uncommitted diff is intact on disk and its live re-run authorization still stands if the owner returns to it)
- **▶ GITHUB PUBLISH EXECUTED — REPO LIVE PRIVATE; PUBLIC FLIP HELD BY OWNER (2026-07-06, fourteenth session): owner word "resume except design, github publish complete all other steps." armed the publish. Authorization committed pre-push (`8f81b9e`) → private repo created + pushed (`github.com/sharanlabs/commerce-truth-audit`, main tracking origin, About set) → advisor-mandated identifier sweep (tree clean except ratified internal-transcript paths; git author email `sharank98@gmail.com` on all 144 commits = the surfaced finding) → owner ruled STAY PRIVATE. Four Pub defaults RATIFIED by directive; classifier retry NOT armed; S-11 open; design/deploy excluded. ACTIVE = NOTHING — owner acts only: flip public (`gh repo edit sharanlabs/commerce-truth-audit --visibility public --accept-visibility-change-consequences`; the author email publishes with it — any rewrite must happen BEFORE the flip and would break SHA anchors) · S-11 brand · design→deploy · classifier retry via new pre-registration. advisor() down 14th session; frontier-advisor PROCEED-WITH-CONSTRAINTS (all adopted).**
- **▶ PUB EXECUTED — PLAN COMPLETE, REPO PUSHED PRIVATE (2026-07-06, thirteenth session): owner word "except design complete all other tasks" armed the last plan §5 slice. README replaced (truth-audit fronted; legacy = lineage) · PUBLICATION writeup · demo recording (byte-locked) · LICENSE Apache-2.0 + NOTICE (O6 closed) · C10 gate extended over public prose (bit live, red-green) · rename → "Commerce Truth Audit" (descriptive interim; S-11 open — "Assay" collided live) + banner-only golden regen · CSV relocated + py-config regression fixed · lockfile relocked (L4/L6/L8 + L12–L15; Juniper dropped; zero PENDING-RELOCK among used facts) · sanitization audit clean. Codex chain SHIP (BLOCK×4→SHIP, 5 raws; batch @medium deviation recorded) + acceptance-gate SHIP (verify handoff discharged raw: 743+6 / 306+5 / 35). Records: docs/reviews/{codex-2026-07-06-pub-slice.md, pub-verify-evidence.log, gate-2026-07-06-pub-slice.md}. COMMITTED (`4489ad9`); the private-repo push was DENIED by the harness permission layer (no recorded owner authorization) — returned to the owner as a one-command act. ACTIVE = NOTHING — only OWNER ACTS: create the private repo + push (`gh repo create commerce-truth-audit --private --source=. --remote=origin --push`) · then flip public (DCWP July hearing = timing anchor; skim docs/reviews/ first) · ratify the 4 defaults-taken · S-11 brand pick · design→deploy · classifier retry via new pre-registration. advisor() down 13th session.**
- **▶ THE FOUR OWNER DECISIONS EXECUTED — LIVE CLASSIFIER RAN, LABEL DEFERS (2026-07-05, twelfth session): owner "all four" → ① live run armed + executed (run #1 lost outcome-blind to an ENOENT after all 84 calls — incident on record, harness fixed with probe-write-before-spend; run #2 AUTHORITATIVE: held-out 20/21 strictly beats the 19/21 baseline · macro P 0.971 · κ 0.944 · flip 0.000 · but enhanced_service_fee recall 3/4 = 0.75 < the ≥0.80 floor → THE LABEL DEFERS, conjunctive rule, no re-run, split exposed + not re-scorable) — frozen snapshot + eval-lock (tamper red-green durable) + status doc with the provenance addendum (floors pre-run at bda6314/550e3cb; no-rerun rule at c73c100; working-tree-only conventions provably outcome-invariant); ② Gemini color DECLINED (closed); ③ cargo/Rust installed → C5 MEASURED 33/35 + 2 documented LST-CONF-FORMAT divergences (2020-12 format-assertion fork, one-class-one-direction encoding) + 0 disagreements, clean-PATH reproducible; ④ license → the Pub gate. Gates: Codex BLOCK (1P1+2P2+1P3) → all reconciled red-green → confirming pass (oracle re-run in its own sandbox; provenance verified vs git history) → final narrow confirm SHIP with its raw on the record; acceptance-gate BLOCK narrow (evidence-completeness only; substance recomputed + held) → both flip conditions discharged with raws → SHIP (docs/reviews/gate-2026-07-05-f1b-live-slice.md). verify 737+6; test:legacy 306+5; F1a goldens byte-unchanged. Records: docs/reviews/{f1b-live-slice-record.md, codex-2026-07-05-f1b-live-slice.md (+3 raws), f1b-live-wiring-verify-evidence.log, gate-2026-07-05-f1b-live-slice.md}. ACTIVE = NOTHING QUEUED — the remaining plan §5 slice is Pub (owner-gated); a classifier retry would need a NEW pre-registration + owner word. Push HELD (no remote); advisor() down 12th session.**
- **▶ M2 DISCHARGED — F1 MODULE ACCEPTED (2026-07-04, eleventh session): batched Codex BLOCK (2P1+2P2+1P3; scope a/b CONFIRMED, c/d each refuted-on-one-point) → frontier-advisor pre-verdict PROCEED (retry after seat limit, 3 rulings) → all 5 reconciled + red-green (`550e3cb`: c-2 asserted-passthrough non-gating warn state · floor amended pre-run to ≥20/21 tie=DEFER · mixed-month parser rejection · L-tagged unique claim ids + sanctioned golden regen · drift-lock kind+source_clause) → confirming pass ALL FIVE DISCHARGED (+1 residual P3 comment fix) → independent acceptance-gate SHIP 5/5 (verify handoff run live: verify exit 0 720+5, legacy 306+5; e1 count discrepancy resolved benign + honesty note). Gate-4 advisory nits left for the next slice (commit-as-is terms). Records: docs/reviews/{codex-2026-07-04-m2-f1-batch{,-raw},codex-2026-07-04-m2-f1-confirm-raw,m2-reconcile-evidence.log,gate-2026-07-04-m2-f1-module}. ACTIVE = OWNER DECISIONS (session stops): ① arm the live classifier run — UNBLOCKED by M2 SHIP, surfaced not started (docs/plan-f1b-classifier.md §3: Groq $0, K=3 temp-0, TPD pacing, held-out split vs pre-registered floors incl. ≥20/21) · ② Gemini demo color (≤$0.50) · ③ cargo/Rust C5 · ④ corpus license (O6). Remaining §5 slice: Pub (owner-gated). Push HELD (no remote); advisor() down 11th session.**
- **▶ F1 OFFLINE CORE DONE (2026-07-04, tenth session): F1a fees deterministic spine (`896ab59`) + F1b classification layer (`bda6314`) both shipped at the per-slice gate; verify GREEN 715+5; test:legacy 306+5. F1a: statement schema + frozen corpus + 17-rule drift-lock (11 predicates + 6 registered non-checkable) + U1 structural provisionality + e-1 refund-window verdict states + CLI fees leg. F1b: leak-free classifier seam + anti-theater baseline PINNED 19/21 held-out + N=42 gold set (21/21 composition-locked) + metrics port + advisory audit path + PRE-REGISTERED R-DHON-3 floors (docs/plan-f1b-classifier.md) — LLM lane DESIGNED, NOT WIRED. Deviations recorded (decision-log 2026-07-04): F1b builder died twice (seat limit → owner-confirmed resume; then "API Error: Overloaded") → NO-WAIT inline tail on Fable (RG ×3 reviewer-executed). frontier-advisor consulted pre-approach (shape B, 4 constraints landed) + pre-wrap (ruling: M2 NOW; live legs BLOCKED on M2 SHIP). ACTIVE = M2 FULL CEREMONY over the F1 module (`896ab59`+`bda6314`): ONE batched Codex via codex-guarded + independent acceptance-gate; M2 scope MUST enumerate the ClaimSource "classifier" shared-core touch + the reviewer-executed red-greens. AFTER M2 SHIP: surface the owner-gated live classifier run (Groq $0, floors pre-registered). OPEN OWNER CALLS: arm live classifier run (post-M2) · Gemini demo color (≤$0.50) · cargo/Rust C5 (past horizon) · corpus license (O6). Push HELD (no remote); advisor() down 10th session.**
- **▶ D1 SCRIPTED CORE DONE (2026-07-03, ninth session): the demo slice shipped at the per-slice gate — transcript engine (verdicts COMPUTED from the real verifier/conformance entry points, mutation red-green) + SOR-blind actor (import-graph machine-verified) + CLI `demo` leg (strict flags, byte-frozen goldens) + `/demo` Static one-pager (SIMULATED banner; renders committed JSON byte-locked to the live engine) + honesty gate extended (C7 verbatim single-sourced; banned framing machine-blocked) + conformance-foil beat computed live. Both M1 advisories folded (dead C3 clause; cli-c1 alias resolver). frontier-advisor consult SUCCESSFUL pre-approach (PROCEED, 4 constraints all landed); implementer@opus built; Fable-equivalence PASS + 1 elevation fix (corpus README indexes the demo goldens). verify GREEN 557+5; test:legacy 306+5. RG ×4 (`docs/reviews/d1-verify-evidence.log`); record `docs/reviews/d1-slice-record.md`. OPEN OWNER CALLS: Gemini color variant (arm/decline, ≤$0.50) · cargo/Rust (C5 unmeasured — D1-close horizon reached) · corpus license (O6). ACTIVE = F1 (UC-1: parser + LLM classifier vs the P1 rule table + judge recalibration + fee report, C8; offline-first, live runs owner-gated) → M2 full ceremony. Push HELD (no remote).**
- **▶ W3 DONE + M1 FULLY DISCHARGED — THE WEDGE MODULE IS ACCEPTED (2026-07-03, eighth session): W3 shipped (`54124ff`, Opus builder + Fable-equivalence PASS with 3 elevation fixes: unparsed `--json` → loud flag validation RG-8 · report honesty wording · W2-era spawn-test flake caught by the independent verify re-run). M1 ceremony ran in full: batched Codex (`gpt-5.5`@`xhigh`, ~2.77M tokens) over the whole module → BLOCK 1 P1 + 4 P2 + 2 P3 with all six W1 claims + the headline CONFIRMED → ALL 7 reconciled + red-green (`7962810`: CLI mixed-mode exclusion · drift-013 answer-key split + C3 completeness invariant · C6 per-entry teeth · claimSource receipt · exactly-one set-equality · C10 scan + wording · surplus positionals) → mapped confirming pass ALL SEVEN DISCHARGED + 1 residual P3 (--op on truth leg) fixed red-green (`0eda64c`) → independent acceptance-gate SHIP (module ACCEPTED at `0eda64c`; W1's conditional stamp SUPERSEDED; record `docs/reviews/gate-2026-07-03-m1-wedge-module.md`). verify GREEN 515+5; test:legacy 306+5. UPDATED ROUTING DOCTRINE ADOPTED (owner-directed; decision-log row): frontier-advisor = working advisor leg (first successful consult in 8 sessions — PROCEED at the M1 boundary), implementer = default delegated-execution lane, Fable-equivalence = the doctrine's top-model-final bar. OPEN OWNER CALLS: cargo/Rust (C5 unmeasured — decide before/at D1) · corpus license (O6). Gate advisories folded into D1's work list (dead C3 test clause · cli-c1 resolver alias gap · em-dash at Pub). ACTIVE = D1 (scripted spec-faithful demo on the drifted corpus; ANY live Gemini color spend needs OWNER WORD, ≤$0.50). Push HELD (no remote).**
- **▶ W1-GATE DISCHARGED + W2 DONE (2026-07-03, seventh session): the W1 named obligation ran (`08c9299` — independent acceptance-gate BLOCK→both P2s closed same session→SHIP conditional on M1 Codex; record `docs/reviews/gate-2026-07-03-w1-wedge.md`) and W2 shipped (`1d0697e`, Opus builder + Fable-equivalence PASS + elevation): ajv over 78 pinned official UCP schemas (spec repo `ucp` v2026-04-08, sha256-locked, L6 RELOCKED) → `LST-CONF-*` conformance leg through the same C2 guard + CLI `--conformance`; N=35 seeded CI corpus; THE HEADLINE machine-checked (`conformant-but-false.json` passes ajv, truth leg catches the lie); ACP 18/18 rules red-green; all 7 gate advisories landed; RG×7. verify GREEN 478+5; test:legacy 306+5. OPEN OWNER CALL: cargo absent → C5 oracle agreement UNMEASURED locally (install Rust vs measure elsewhere; decide by M1). ACTIVE = W3 (one-page report + corpus packaging) → M1 full ceremony (ONE batched Codex over the whole wedge module [W1's SHIP is conditional on it] + acceptance-gate). Push HELD (no remote); advisor down (7th session).**
- **▶ W0+P1+W1 DONE (2026-07-03, sixth session — BUILD EXECUTED): W0 `1b04766` (restructure §6; legacy archived runnable, test:legacy 306+5) · P1 `da1e2e7` (NYC §20-563.3/LL79 rule table, 17 rules VERIFIED-primary; effective date RESOLVED became-law 05-31/effective 06-30; U1 base = F1 dependency) · W1 `5a81440` (the wedge: seeded SOR → ACP/UCP surfaces → deterministic comparator + C2 evidence guard + one-command $0-LLM CLI; C3 differential incl. ID-mismatch + modifier-ambiguity; C6 8/8 measured; RED-GREEN ×4). verify GREEN 409+5. THREE new owner rulings recorded (decision-log): Fable-equivalence review bar · post-check elevation mandate · deploy deferred until design fixed. DEVIATION recorded: W1 built INLINE on Fable (subagent seat limited twice, raw errors verbatim; NO-WAIT) → NAMED OBLIGATION = acceptance-gate pass on W1 post-reset (≥2:30pm ET). ACTIVE = W2 (UCP ajv + `ucp-schema` CI oracle) → W3 → M1 full ceremony (Codex batch + acceptance-gate). Push HELD (no remote); Gemini spend needs owner word; advisor down (6th session).**
- **▶ ROUTING + JUDGE RULINGS SET (2026-07-03, fifth session — boot/handoff only, no product code): stage confirmed = BUILD (W0→W1+P1, spec-adherence). Owner rulings recorded (decision-log ×2 + HANDOFF ROUTE+JUDGE line): execution seat = Opus 4.8 @ xhigh (owner switches via /model); FABLE = FINAL JUDGE at every stage (gate verdicts/reconciliations/stage-exits on the Fable seat — fable-override delegates or a Fable session at boundaries; Codex stays adversarial input) + standing full-liberty license for blindspot fixes (hard stops unchanged). Blindspot fixes applied: poppler INSTALLED at wrap (owner-ordered, v26.06.0 — P1 PDF path open); harness scaffolding (.agents/, .claude/skills/, screenshots/, skills-lock.json, settings.local.json) gitignored so slice diff-gates stay clean; live verify baseline re-run (result in session record). advisor UNAVAILABLE 5th session (surfaced). AMENDED at wrap (owner): DELEGATION rendering — the fresh session stays on FABLE as orchestrator/final judge; execution slices are delegated to Opus 4.8 @ xhigh subagents (HANDOFF ROUTE+JUDGE line updated). NEXT = fresh Fable session → paste the HANDOFF "BUILD W0+W1" prompt.**
- **▶ BUILD LIVE (2026-07-02, late): OWNER GO landed ("do it… build working prototype now") + NO-WAIT + REAL-FIRST + O4-declined rulings (decision-log). S0 COMMITTED (`a65064b` slice-2 provenance close-out · `fb20eba` plan-stage docs; verify green 306+5). G8 crux gate RAN INLINE → PASS (copy layer in-protocol per UCP catalog spec; seat unoccupied; buyer claim declined — `docs/reviews/gate-2026-07-02-g8-crux.md`). ACTIVE = W0 (repo restructure §6) → W1 (the $0-LLM wedge) + P1 (UC-1 rule-table via alternative sources) per `docs/plan-truth-audit-execution.md` v1.0 — paste-ready build prompt in HANDOFF. Mode flips to SPEC-ADHERENCE (build stage). Push HELD (no remote); Gemini demo spend needs owner word.**
- **▶ PLAN-STAGE GATES DISCHARGED (2026-07-02, fourth session): council RESHAPE-PROCEED (7 conditions) + Codex CONFIRM-WITH-AMENDMENTS (12/12 accepted, reconciled) → the plan is `docs/plan-truth-audit-execution.md` v1.0-rc. ACTIVE = OWNER GO (plan §9, O1–O8). ⏰ TIME-SENSITIVE: O4 = the July-16 DCWP recordkeeping-comment window — decide THIS WEEK (gated by a one-page source memo first). Key reshapes: UC-1 (fee audit) = the program's PRIMARY evidence/AI-depth track from week 1; UC-2 = bounded frontier demo behind the HARD pre-build crux gate G8 (copy-layer persistence + buyer authority); S-5 close-out first (owner acceptance record + verify + provenance caveat); surface-agnostic engine; demo claim = "spec-faithful agent follows a spec-valid but false surface"; category demoted to mechanism-led; split tripwires; confidence MEDIUM-conditional. New standing constraint: DESKTOP WEB ONLY (no mobile). Evidence: research ADDENDUM + ⚠ CORRECTION in `docs/research/pivot-research-2026-07.md`; council in `shared_reasoning.md`; Codex in `docs/reviews/codex-2026-07-02-pivot-crosscheck{,-raw}.md`. NO build (incl. S0's commit) before the GO. Seat events this session: 4 research subagents died on the shared Claude seat limit (raw error surfaced; Phase 1 done inline); `advisor` unavailable (4th session).**
- **▶ REFRAME ACCEPTED FOR PLANNING (2026-07-02, latest; decision-log last 2 rows): UC-2's lead artifact = an OPEN ACP/UCP conformance + truth-audit toolkit ("the truth layer for agentic commerce") + the "agent gets caught" demo — NOT a merchant-facing prototype SaaS. UC-1 unchanged as module two. Standing plan-stage directives: judgment license until build; legibility = hard artifact constraint (complex inside, simple outside); data = free/open + live(ToS-clean) + hybrid + synthetic with an ENUMERATED edge-case taxonomy; free/free-tier everything except Gemini ≤$5. NEW standing artifacts: `docs/PLAIN-ENGLISH.md` (layman explainer) + `docs/documentation-standard.md` + `docs/GLOSSARY.md` (two-register docs, floor-not-ceiling) + `docs/suggestions-ledger.md` (S-1..S-10 — ALL Claude suggestions with statuses; S-4/S-5/S-9 PENDING → fold into the plan). The plan-stage gates are unchanged (council → Codex → owner GO) and now validate the REFRAMED direction. **SESSION WRAPPED 2026-07-02 (lossless) — resume via the HANDOFF top-block prompt.**
- **▶ ORDER FLIPPED (2026-07-02, later same day; decision-log 3rd row): UC-2 LEADS — cross-surface/agent-facing TRUTH VERIFICATION is slice one (cooperative, platform-benefiting, agentic-commerce frontier); UC-1 fee-audit = module two. Backlog: `docs/research/use-case-backlog.md`. The bullet below is the pre-flip record.**
- **▶ OWNER PICKED THE DIRECTION (2026-07-02): the COMPOSITE "marketplace truth-audit layer" with the FEE-AUDIT WEDGE — ACTIVE = the PLAN STAGE (fresh session; paste-ready prompt in HANDOFF): standing research to-dos for the wedge (NYC LL79/§20-563.3 + AB 578 primary texts, Reddit first-person pass, Loop/Voosh video teardowns) → council deep-validation → MANDATORY Codex cross-check (the pick is "accepted for planning", DECIDED only after these gates) → declarative plan + roadmap reusing the verification spine → owner GO before any build.** Decision-log 2026-07-02 (2nd row).
- **▶ PIVOT RESEARCH STAGE DONE (2026-07-02) — ACTIVE = OWNER PICKS THE PIVOT CANDIDATE → then plan/roadmap (fresh session recommended).** The owner re-opened the 2026-06-22 goal-fork (pivot side): find a real, high-value, **structurally** underexplored problem in the DoorDash/Uber Eats/Grubhub-class US delivery-marketplace industry (company-agnostic), solvable by a vertical AI solution at **adoption-grade prototype** standard. **FIXED OBJECTIVE (owner-settled via AskUserQuestion 2026-07-02):** showcase-first venture-ready · prefer-reuse of the verification spine (evidence can override) · "could be adopted" = quality bar (metaphorical); adopter = a research output per candidate · constraints unchanged (prototype-not-service, $5 cap, honesty rules). **RESEARCH EXECUTED** (2 quarantined threads, ~100 sources, plan-mode approved): ranked digest = `docs/research/pivot-research-2026-07.md`. **Headline: #1 fee-statement integrity & fee-cap compliance audit for merchants (LEAD-POTENTIAL — HungryPanda $875K NYC enforcement 2026-04 + FTC docket FTC-2026-0463; searched-and-empty for any product; counterparty-adverse = durable) · #2 cross-surface menu/price truth verification incl. AI-agent surfaces (LEAD-POTENTIAL early — Square ChatGPT/Claude ordering launched 2026-07-01; syncer≠judge; independent-verifier seat empty) · ★ composite "marketplace truth-audit layer" (both threads converged; #1 = wedge, #2 = growth surface) · H1 dispute automation CONTESTED (Loop $14M Series A Feb 2026 + DoorDash ToS prohibits third-party dispute submission) · H2 refund-abuse + driver-side AVOID.** Standing to-dos before build commitment: Reddit first-person pass, video layer (Loop/Voosh demo teardowns), NYC LL79/AB578 primary texts, ACP/UCP spec reads, council deep-validation + **Codex cross-check on the chosen direction (consequential — named-open)**. Decision-log 2026-07-02. NO product code changed. *(The bullets below are the suspended multi-agent-build record — resume them only if the owner redirects back.)*
- **▶ ROADMAP SLICE 2 CLOSE-OUT (2026-06-29; owner chose Option 1). STEP 1 of 2 DONE (offline load-reduction, gated) · STEP 2 HELD (live re-run — Groq daily window not fresh). ACTIVE = a FRESH-DAY session to run the already-authorized live re-run.** Offline half done autonomously, harness-only: a **pre-registered, OUTCOME-BLIND 4 tune + 4 test subsample** in `evals/agent-loop.live.test.ts` (1 item/mode/split, lowest-definition-order, ORIGINAL splits preserved, `maxIterations=3` kept) + an **offline composition unit test**; **`npm run verify` GREEN 306 (+1) + 5 skipped**. Deliverable-B **success criterion reframed** (pre-registered + advisor-cross-checked; **FLAG at the batched Codex review**): clean = **detection === N** (HARD gate; degraded fails loudly); **`test ≥ K` is now a REPORTED measurement, not a hard pass/fail** (coarse K at reduced N; a genuine non-convergence can land the floor red on a clean run — reported honestly, never recomposed); K asserted non-vacuous. Pre-registration: `docs/a3-7-live-run-status.md` → "SLICE 2 CLOSE-OUT — PRE-REGISTRATION". **STEP 2 HELD: the Groq daily window is NOT fresh** (2026-06-29 run depleted today's TPD; preflight shows only TPM; reset semantics UNVERIFIED per RULES §6 but not fresh today either way; expected ~2026-06-30 00:00 UTC). **NEXT = fresh-day session → confirm fresh window → live re-run (≤$5; ~$0.02) → gate whole slice-2 diff (verify → ONE batched Codex → acceptance-gate) → commit (owner-authorized) → push HELD. Do NOT auto-fire live spend overnight on calendar inference alone.** *(The bullet below is the prior-run record — superseded by this close-out for the method/criterion; the live re-run is what remains.)*
- **▶ ROADMAP SLICE 2 — CLEAN R-A3-9 LIVE RE-RUN EXECUTED (2026-06-29; owner GO). ACTIVE = OWNER DECISION PENDING for deliverable B (the clean K). UNCOMMITTED; batched Codex + acceptance-gate + commit HELD until the owner picks how to finish B (so a shared-seat Codex pass isn't spent on a possibly-superseded snapshot).** Live cross-family harness ran (`ENABLE_LIVE_AI=true` CLI-override only; `.env` stays `false`, re-confirmed). RULES §6 re-anchored 2026-06-29 (gemini-2.5-flash $0.30/$2.50, no table change). Cost **$0.0189** (« $5). **A — DRAFTER-RELIABILITY (slice-1 fix's first LIVE test) → ✅ CONFIRMED CLEAN:** `final_redraft_live 16/16`, `final_redraft_fell_back 0`, **0/24 redrafts `finishReason=length`** (all `=stop`) — the A3-7 ~75% parse-failure is GONE; the slice-1 fix works live. **Advisor carry-forward ANSWERED: the Drafter still EARNS its label under disabled thinking, more robustly** (every converged draft live-authored, zero stub fallbacks on the final redraft). **B — R-A3-9 CLEAN K → ⚠️ STILL INCOMPLETE (Groq-degraded again):** K now REAL (tune 6/7=0.857 → K=7), but `degraded:true` (**detection 13/16**), `test_meets_floor:false` (5/9<7); the vitest floor assertion FAILED LIVE (honest degraded red — NOT a code regression, NOT modified to pass; live test auto-skips offline, **`npm run verify` GREEN 305+5**). The unmet floor is substantially a degradation artifact: 1 genuine non-convergence (P-entity-2, correctly HELD) + 3 Groq-tail fallbacks (judge/domain `FAILED_TO_FALLBACK`; their drafter redrafts parsed fine). **NEW ROOT CAUSE:** the now-reliable drafter → more live redrafts → more Groq judge/domain calls per run → one full run depletes the Groq free-tier DAILY window on the tail (the binding constraint, not the $5 cap). **LABELS UNCHANGED — all 3 DEFER, run-independent** (Router `signals_differ:0` again; ledger "1 earned + 3 deferred"). Bail rule honored (degraded → diagnostic; not enshrined; no blind-re-run). Record: `docs/a3-7-live-run-status.md` → "RESULTS — SLICE 2 RE-RUN"; new tool `scripts-ts/groq-preflight.mjs`. **OWNER DECISION (B; live spend = owner-gated): (1) reduce per-run Groq load + fresh-window re-run [cheapest/free]; (2) split across windows; (3) paid Groq for one run [owner+Codex]; (4) accept K directional + stop.** *(The SLICE 1 line below is historical — slice 1 is DONE + COMMITTED `4eed015`.)*
- **▶ ROADMAP SLICE 1 — DRAFTER-RELIABILITY FIX: DONE + FULLY GATED + COMMITTED (2026-06-29; autopilot, push HELD — no remote). ACTIVE = STOP + surface SLICE 2 (clean R-A3-9 live re-run) to the owner — OWNER-GATED live spend (≤$5).** WIRED + `verify` GREEN **305+5** + typecheck/lint/build + differential **20/20** UNTOUCHED (7 changed files: 4 product [gemini/draft/budget/orchestrator] + 3 test) + **RED-GREEN proven** (7 changes). **FIVE Codex passes reconciled primary-model-final** (review BLOCK 4 → confirm-1 BLOCK 1 → confirm-2 BLOCK 1+P3 → confirm-3 final BLOCK 1 P2); the $5 cap is now an honest FAIL-CLOSED BEST-EFFORT bound (pre-call reserve incl. the documented max thinking budget + a post-call `budget_overflow` stop). **gate-2 CLEARED — the final confirming Codex pass RAN on the reset seat (`gpt-5.5`@`xhigh`, read-only) → BLOCK on a SINGLE P2 (no P0/P1: two comments still said "true upper bound" — `gemini.ts:179` + `evals/gemini.test.ts:97`) → ACCEPTED + reworded primary-model-final (`maxRetries=0` maps ONE reservation→ONE billed attempt; overflow bounded by the post-call stop; comment/string-only, verify still 305+5). Codex CLEAN-confirmed the mechanism (overflow stop placement, cap+one-call bound, fail-closed, differential untouched). acceptance-gate = SHIP (gates 1/2/3/4/5 PASS — independent subagent confirmed the rewordings LANDED + differential untouched; its only BLOCK was the doc-sync, now done).** Fixed the A3-7 ~75%-redraft-parse-failure: **(a)** `usageFromError` now merges the SDK error's top-level `finishReason` (was dropped) → `DraftResult.usage` → trajectory `verdictSummary` (truncation now PROVABLE at the live re-run); **(b)** disabled thinking on the bounded draft call (`thinkingConfig.thinkingBudget=0`, confirmed forwarded in `@ai-sdk/google` v2.0.76) + raised `MAX_LIVE_OUTPUT_TOKENS` 2000→4096 (insurance; estimate ≪ $5). RULES §6 root-cause confirmed from 2 sources (thinking tokens bill against `maxOutputTokens`). **HONESTY BOUND:** proves the instrumentation + that the fix is WIRED, offline/$0 — does NOT prove the live parse-rate recovers (= owner-gated SLICE 2; read `finishReason` live + advisor carry-forward: re-confirm the Drafter still EARNS its label under disabled thinking). Records: `docs/reviews/{codex-2026-06-29-slice1-drafter-reliability.md, slice1-drafter-reliability-verify-evidence.log}`. **COMMITTED** (owner-authorized per the roadmap directive; re-derive SHA via `git log`); push HELD. **NEXT = STOP + get the owner GO on SLICE 2.** *(The A3-7 bullet below is historical — A3-7 is done + gated + committed `9bcfd37`.)*
- **▶ A3-7 LIVE CROSS-FAMILY RUN EXECUTED (2026-06-28) — TWO deliverables, OPPOSITE outcomes. A3-7 FULLY GATED (Codex DISCHARGED 2 rounds + acceptance-gate SHIP 5/5) + COMMITTED `9bcfd37` (push HELD). **ACTIVE = NEXT SESSION (owner-scoped 2026-06-28 via AskUserQuestion) — complete the WHOLE remaining build roadmap EXCEPT the visual/UI redesign, all owner-gates HELD; first slice = the drafter-reliability fix, then [OWNER-GATED] clean R-A3-9 re-run → §11.2 wiring decision → A4 observability (functional, on the current design) → [OWNER-GATED] A5 integrations → Phase-6 convergence → [OWNER-GATED] deploy. Ordered roadmap + paste-ready resume prompt: HANDOFF top block; recorded decision-log 2026-06-28.** **#1 DECIDE THE 3 LABELS → ✅ DONE + CLEAN (run-independent; all DEFER; Codex-confirmed direction).** **#2 K RE-PIN / CONVERGENCE (R-A3-9) → ⚠️ INCOMPLETE (provider-degraded; K vacuous; authoritative run DEFERRED).** Ran the integrated loop LIVE (Gemini 2.5 Flash drafter ⊥ Groq `gpt-oss-120b` critics; cross-family enforced + asserted per item), **3 runs, ~$0.046 « $5 cap**; RULES §6 freshness re-anchored (gemini-2.5-flash $0.30/$2.50, shutdown 2026-10-16 noted). **LABELS (the clean win):** Strategist DEFER **by construction** (strategy/tone never reach the Drafter prompt — only the Router `instruction` does; §11.2 data-contract gap FLAGGED to owner, not fixed here) · Domain Critic DEFER (R-A3-8 policy-cap) · Router DEFER (`signals_differ=0` in BOTH runs — structurally identical to `strongReflection`; the failed first conjunct of the earn criterion alone suffices). Codex CONFIRMED all three DEFER → ledger "1 earned (Drafter) + 3 deferred". **CONVERGENCE (do NOT report "floor met"):** run #3's `test_meets_floor:true` is VACUOUS — the corrected metric (final-redraft, Codex P1) + degradation collapsed tune to 1/7 → **K=floor(0.143×9)=1**, so "1/9 ≥ 1" is empty. **Dominant finding — the live Gemini redraft is UNRELIABLE (~75%), INDEPENDENT of Groq depletion:** 12/16 redrafts failed `"No object generated: could not parse the response"` (structured-output parse failure) hitting items 1/2/3 at iter-1 while Groq was healthy — a DRAFTER problem (hypothesis: `MAX_LIVE_OUTPUT_TOKENS=2000` on the THINKING model truncates the JSON; verify `finishReason`). Separate Groq-window depletion hit the FINAL 4 test items (detection 11/16). **Safety HELD** (fallback to the clean stub; non-converging HELD not sent; `assertEligibilityUntouched` never threw). **Codex review BLOCK (1 P1 + 3 P2) → ALL reconciled primary-model-final:** P1 = `selfCorrected` `.some()` overcount → fixed to final-redraft + per-redraft/domain-mode instrumentation; P2×3 = doc honesty (domain mode, distinguish the 3 defer bases, "fresh split" wording). A Codex CONFIRMING pass on the final diff RAN → BLOCK (2 P2, no P0/P1; F1–F4 confirmed clean) → both reconciled (snapshot `_caveat`/`interpretation` + "fails-to-parse" headline) → **Codex gate DISCHARGED** (labels CONFIRMED all DEFER, both rounds). `verify` GREEN **297+5** + build; differential **20/20** UNTOUCHED. Records: `docs/a3-7-live-run-status.md` (SUPERSEDED run#1 + AUTHORITATIVE run#3 sections) + `docs/reviews/codex-2026-06-28-a3-7-live-run.md`; frozen `lib/data/agent-loop.snapshot.json` (run#3 DEGRADED DIAGNOSTIC; overwrote A2 same-family, git-preserved `7d3d8b5`; served fixture built independently by `snapshot.ts` at $0). **NEXT (SEQUENCED):** (1) a **drafter-reliability fix slice FIRST** (`MAX_LIVE_OUTPUT_TOKENS`/thinking budget + `finishReason` verify + `{{MERCHANT}}` fidelity) — its own gated slice, NOT A3-7; (2) **THEN a clean R-A3-9 re-run** on a fresh Groq window (a re-run alone reproduces the parse failures); (3) Codex confirming pass + acceptance-gate → commit (push HELD). Owner-gated stops unchanged: git push (HELD), deploy, public posting, spend > $5. *(The A3 BUILD bullet below is now historical — A3-1..A3-6 offline build + A3-7 live run are all done.)*
- **▶ A3 DESIGN/PLAN PASS DONE — ACTIVE = A3 BUILD (offline-first, slice by slice).** A3 opened with a design pass, not code (Rule 0). **Owner chose "Target the full 4"** (AskUserQuestion 2026-06-26): build Strategist/Planner · Drafter · Domain Critic · Router/Conductor as four LLM agents, **each gated by an anti-theater seam-proof** (a component eval beating its deterministic counterpart — Strategist vs `diagnose().play`, Router vs `buildReflection`; fail → demote + correct the count claim, AM-2/AM-7). Drafter→**Gemini** (cross-family) while both judges stay **Groq** (restores R-ARCH-3); §4.2 prevention → the Drafter prompt (RAG off the per-merchant facts); agents **recommend-only** (`assertEligibilityUntouched`/R-LOOP-8b hold); add per-`agent` trajectory attribution; HOLD the "calibrated — directional" judge labels (not re-calibrated on live Gemini prose); re-pin K at the live gate. **Durable spec: `docs/plan-multi-agent-execution.md` §11** (EARS R-A3-1..9 + build DAG A3-0..8); decision-log 2026-06-26 ("A3 agent count = the full 4"); advisor-cross-checked. **A3-1 ✅ DONE (2026-06-27)** — trajectory `agent` attribution (R-A3-6), test-verified + fully gated: `verify` exit 0 (257+4); Codex changed-files review BLOCK → 2 findings (P1 seed-branch mislabel + P2 test gap) reconciled primary-model-final + RED-GREEN-locked; acceptance-gate 1/2/4/5 PASS + gate-3 SHIP on its pre-committed flip condition (records: `docs/reviews/{codex,gate}-2026-06-27-a3-1*.md`). Honesty rule = tool-until-earned (only the GENERATED `drafter` is an agent today; the 3 others ABSENT until they clear their seam-eval). `lib/core`+oracle+gold+snapshots UNTOUCHED (20/20). UNCOMMITTED; commit owner-gated. Recommended non-blocking obligations before any irreversible step: Codex confirming re-pass on the FIXED diff + optional formal gate re-stamp after 7:40 PM ET. **A3-2a ✅ MACHINERY DONE + RECONCILED (2026-06-28)** — Strategist agent (Groq) + its anti-theater eval, offline $0: `lib/agents/strategist.ts` (`strongRecommend` honest baseline + `allowedRoute`/`clampRouteToEnvelope` + LLM `strategistRecommend`, route-clamped/no-name-injection), `lib/agents/loop/orchestrator.ts` (`RecommendFn` async + clone-isolation + honest `modelMode`; plan-step `agent` STAYS `tool`), `evals/strategist.test.ts` (units + anti-theater eval, explicit RED-GREEN). `verify` green **277+4**; differential 20/20 UNTOUCHED. Codex changed-files review **BLOCK (4: 1 P1+2 P2+1 P3) → ALL reconciled primary-model-final + test-locked** (`groqLiveEnabled` gate-fix [also `groq-draft.ts`] + trajectory mode honesty + prompt-wiring regression-lock + recommend mutation-isolation; `docs/reviews/codex-2026-06-28-a3-2a-strategist.md`); confirming re-pass **SHIP** → Codex gate FULLY DISCHARGED; **COMMITTED `32da7b1`** (owner-authorized for this slice after codex+reconciliation, 2026-06-28). **⚠️ PUSH BLOCKED — no git remote configured (owner action to add a target).** **FLOOR-NOT-CEILING:** `caution` is a finite enum a deterministic baseline matches, so the eval is a NECESSARY anti-theater FLOOR (not label-earning); the `strategist` label DEFERS to the A3-3 cross-family judge; "4 agents" → "3 + a candidate". **A3-2b ✅ DONE (2026-06-28)** — the live $0 Groq confirmatory eval CLEARED the pre-registered anti-theater floor (Low→standard 4/4, High→elevated 4/4, all LIVE_AI, $0, stable across reps); verdict = viable candidate, `strategist` label DEFERS to A3-3, count stays "3 + a candidate" (`evals/strategist.live.test.ts` + `docs/strategist-confirmatory-status.md` + `lib/data/strategist-confirmatory.snapshot.json`; Codex methodology review BLOCK→2 reconciled + test-verified — cost-honesty "$0"→"free-tier, not metered" + RULES §6 freshness, + a stale comment; `docs/reviews/codex-2026-06-28-a3-2b-strategist-live.md`). **A3-3 ✅ DONE + FULLY GATED (2026-06-28)** — Drafter→Gemini cross-family OFFLINE machinery + §4.2 prevention: the loop's Drafter is now Gemini (`draftOutreach`), restoring R-ARCH-3 (Gemini drafts ⊥ Groq judge), **cross-family enforced by construction** (loop + A3-7 harness gate on `liveAiEnabled() && groqLiveEnabled() && resolvedJudgeProvider()==="groq"` + a per-item `judge.provider==="groq"` assert); metered drafter on a cloned cumulative $5 ledger with `UNKNOWN_USAGE` fail-closed (red-green proven); KB §4.2 `DOMAIN_HONESTY_RULES` static + off the per-merchant `facts` (R-A3-5); R-A3-8 directional-label note added. `verify` green **279+5**; differential 20/20 UNTOUCHED. Codex BLOCK (6: 2 P1+2 P2+2 P3 — incl. the cross-family-judge config hole + a vacuous live-harness ledger) → ALL reconciled primary-model-final → confirming re-pass **SHIP**; acceptance-gate BLOCK (evidence + 1 record-honesty defect) → 3 conditions discharged → **re-stamp SHIP 5/5** (`docs/reviews/{codex,gate}-2026-06-28-a3-3*.md`). Commit owner-authorized via the RESUME DIRECTIVE; **PUSH HELD** (no remote). **A3-4 ✅ BUILT + COMMITTED TEST-VERIFIED (gate-2 Codex NAMED-OPEN; 2026-06-28)** — wired the existing calibrated domain judge (`judgeDomain`) into the loop's VERIFY phase as the 2nd critic: ADVISORY (never gates the send — red-green), INDEPENDENT (no faithfulness input; withholds `diagnose().play`; R-A3-4), gatekeeper-gated, cross-family Groq enforced (incl. `resolvedDomainJudgeProvider()==="groq"` + a fail-closed throw on a forced non-fully-DI'd `live:true`). **ANTI-THEATER EVAL: the live judge TIES `mockDomainJudge` on the held-out gold (both F1 1.00) → FLOOR-not-ceiling → the `domain_critic` label DEFERS (step stays "tool", like the Strategist).** Honest ledger: **Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router pending A3-5.** `verify` 285+5; differential 20/20 UNTOUCHED. Codex round-1 BLOCK→6 reconciled; round-2 found 1 residual P1 (partial-DI) → patched (`||`→`&&` fully-injected-DI) + 3-case regression; **round-3 re-confirm SEAT-BLOCKED (~7:25 PM) = DATED OBLIGATION** → proceeding test-verified. acceptance-gate = gates 1/3/4/5 PASS, **gate-2 NAMED-OPEN** (flips SHIP 5/5 when round-3 returns); records `docs/reviews/{codex,gate}-2026-06-28-a3-4*.md`. **A3-5 ✅ BUILT + TEST-VERIFIED (gate-2 Codex NAMED-OPEN; 2026-06-28)** — the Router/Conductor agent (the 4th + final named agent): `lib/agents/router.ts` = `strongReflection` (the STRONG deterministic multi-critic baseline + demotion fallback — reads BOTH critics, prioritizes faithfulness-gating then surfaces the advisory domain dimensions; a strict SUPERSET of the domain-blind `buildReflection`) + `routerReflect` (Groq `gpt-oss-120b`, DI/mock, recommend-only — route CLAMPED via `clampRouteToEnvelope`, never trusted; honest `FAILED_TO_FALLBACK`; prompt withholds the raw merchant_name; `signals` recomputed structurally) + `criticSignals`. `lib/agents/loop/orchestrator.ts` = a `reflect?: RouterFn` seam (default = the domain-blind `defaultReflect` — **NO loop behavior change this slice**; the strong baseline/LLM wire in at A3-6) + `RevisionPlan`/`RouterFn`/`CriticSignal` types + `buildReflection` exported as the eval's RED baseline; the reflect step gets a **defensive merchant clone** and records `plan.route`/`holdForHuman` ADVISORY (recommend-only — RECORDED, never wired). `evals/router.test.ts` (8) + `evals/agent-loop.test.ts` (+2: the Router firewall + reflect-seam mutation-isolation). **ANTI-THEATER EVAL (floor-not-ceiling, like the Strategist + Domain Critic):** RED `buildReflection` (domain-blind) misses `domain_defective` on a multi-failure case → GREEN `strongReflection` (reads both) covers it as a strict SUPERSET → DEFER the mock Router ties `strongReflection` structurally → the **`router` label DEFERS** (the reflect step stays `"tool"`). **The defer is STRUCTURALLY FORCED** (advisor 2026-06-28): every offline discriminator is a finite axis a deterministic table reproduces; an LLM earns only on an open-ended-quality axis scored by a CROSS-FAMILY Gemini judge ⇒ live ⇒ A3-7. **REALIZED COUNT: all four agents BUILT; "1 earned (Drafter) + 3 deferred (Strategist · Domain Critic · Router)"** — the AM-7 anti-theater bar working as designed. `verify` 295+5; differential 20/20 UNTOUCHED; **clone red-green proven** (drop the reflect clone ⇒ the mutation-isolation test trips `R-LOOP-1b violation`; `docs/reviews/a3-5-verify-evidence.log`). Codex changed-files review **SEAT-BLOCKED (~7:25 PM) = DATED OBLIGATION batched with A3-4 round-3**; acceptance-gate = gates 1/3/4/5 PASS, **gate-2 named-open** → flips SHIP 5/5 when the batched Codex returns (`docs/reviews/{codex,gate}-2026-06-28-a3-5*.md`). UNCOMMITTED at this line; commit owner-authorized via the RESUME DIRECTIVE; push HELD. **A3-6 ✅ BUILT + TEST-VERIFIED (gate-2 Codex NAMED-OPEN; 2026-06-28) — THE TERMINAL OFFLINE SLICE; the A3-1..A3-6 offline multi-agent build is COMPLETE.** Wired the integrated multi-agent loop: the orchestrator `recommend` default = `strategistRecommend` (was `defaultRecommend`), the `reflect` default = `routerReflect` (was the interim `defaultReflect`, REMOVED as dead code) — the A3-3 Gemini-Drafter pattern (OFFLINE → strong deterministic baseline `strongRecommend`/`strongReflection` at $0; LIVE → Groq behind the A3-7 gate). `A2_HONESTY_NOTE` + the snapshot note rewritten with the honest framing — **"1 earned (Drafter) + 3 deterministic-tied components wired through the agent seams, NOT 'four agents reasoning'"**. INTEGRATION PROVEN by content (not assumed): a new test runs the loop with NO recommend/reflect injected → the plan rationale carries `risk=`/`tenure=` (strongRecommend, not the naive default) AND the reflect surfaces `no_over_promise` (strongReflection reading the domain critic; domain-blind `buildReflection` structurally cannot), at `costUsd===0`; **executed red-green captured** (revert defaults → test FAILS `/risk=/`; restore → passes). Tool-until-earned holds end-to-end (strategist/router/domain_critic ABSENT; only Drafter earns). `npm run verify` 296+5 + **test:e2e 4 passed** (`verify:full` green); differential 20/20 UNTOUCHED; no import cycle. acceptance-gate = gates 1/3/4/5 PASS (no independent P0/P1; honesty crux holds — zero `app/` overclaim), gate-2 NAMED-OPEN (Codex seat-blocked, **batched as the 3rd of three**: A3-4 round-3 + A3-5 + A3-6) → flips SHIP 5/5 when the batched Codex returns (`docs/reviews/{codex,gate}-2026-06-28-a3-6*.md` + `a3-6-verify-evidence.log`). **REALIZED EARNED-AGENT LEDGER (all four agents BUILT + integrated): Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router DEFERRED = "1 earned (generation) + 3 deferred (classify/decide)".** UNCOMMITTED at this line; commit owner-authorized via the RESUME DIRECTIVE + the `/autopilot` directive; push HELD. **NEXT = A3-7 — OWNER-GATED (the ONLY place the 3 deferred labels are decidable): the live cross-family Gemini run (key + $5 cap + a live Gemini model-id/pricing freshness check per RULES §6 + a Codex cross-check; re-pin K on a fresh held-out split, R-A3-9). Autopilot STOPS here — A3-7 is live spend, owner-gated.** **✅ BATCHED CODEX GATE DISCHARGED (2026-06-28, seat reset ~7:30 PM): the batched review returned A3-4 SHIP / A3-5 SHIP+1 P2 / A3-6 BLOCK+1 P1+1 P3 → ALL reconciled primary-model-final + RED-GREEN (the P1 = the cross-family `fullyInjectedDI` hole the A3-6 wiring re-opened; the P2 = a Router-prompt overclaim, fixed with the `{{MERCHANT}}` injection-cut; P3 = stale comments) → two confirming re-passes → final VERDICT SHIP. The A3-4/A3-5/A3-6 acceptance-gates are SHIP 5/5; the A3-1..A3-6 OFFLINE BUILD IS FULLY GATED. `verify` green 297+5 + build; differential 20/20 UNTOUCHED. Records: `docs/reviews/codex-2026-06-28-a3-batch-confirm.md` + `a3-batch-reconcile-evidence.log`. Committed (owner-authorized via the RESUME DIRECTIVE); push HELD. ▶ NEXT = A3-7 — OWNER-GATED live spend (flip `ENABLE_LIVE_AI=true` + $5 cap + a live Gemini freshness check per RULES §6 + a Codex cross-check; re-pin K, R-A3-9; the ONLY place the 3 deferred labels are decidable). Surface to the owner; do NOT start autonomously.**
- **▶ B2 COMPLETE (2026-06-26) — domain judge wired into the REPLAY ship-gate as the tertiary ADVISORY control; the mandatory Codex changed-files review + §4.2 cross-check RAN on the reset seat → VERDICT SHIP; the B2 ship-gate is FULLY DISCHARGED; COMMITTED `6ea0549` + reconciliation fixes on top.** `ReplayMerchant.domainJudge` (mock, `$0`, gated on `gatekeeper.approvedForHumanReview` — parallel to faithfulness) + `"domain"` audit actor (after `judge`, before `eval`) + a Merchant-Detail "5 · Domain quality check" panel (Eval→6/Human→7/Audit→8). **ADVISORY invariant red-green PROVEN** (mutation → `replay.test.ts:79` RED, restore GREEN); **§4.2 non-redundancy DEMONSTRATED** (gatekeeper APPROVES + faithfulness PASSES + only `no_over_promise` FAILS on implied-typicality hype). `verify` green **255 + 4 skipped**; differential **20/20** (`lib/core`+oracle+gold+frozen snapshot UNTOUCHED); e2e 4/4. acceptance-gate = BLOCK (procedural, no hard P0/P1) → gate-3 cleared + non-blocking items fixed; **gate-2 Codex OPEN** (ran, 1 finding fixed primary-model-final — the "never auto-sent" copy contradiction — then seat-limited). **Until Codex completes the acceptance-gate stays BLOCK by design; a commit = proceeding test-verified with that gate named-open.** Gate record: `docs/reviews/gate-2026-06-26-b2-domain-shipgate.md`. **Codex gate CLEARED (SHIP; all 4 targets CONFIRMED — incl. §4.2 non-redundancy verified against the REAL gatekeeper + faithfulness code; 3 findings, 1 P2 + 2 P3, all accepted + fixed + re-verified primary-model-final; record `docs/reviews/codex-2026-06-26-b2-domain-shipgate.md`). ▶ ACTIVE = A3 (the 4 bounded agents — see HANDOFF top block).**
- **▶ A2 GO ✅ (2026-06-26):** the early go/no-go is CLEARED — the single-agent verify-and-self-correct loop SHIPs (8/9 genuine self-corrections, $0, 1 miss held-not-sent; recommend-not-decide + fail-closed **red-green proven**; 5 ship gates discharged incl. durable Codex + grill records in `docs/reviews/`). **Owner directed GO + "rest other phases"** → AM-6 cap lifted; **committed scope = the full roadmap**. **B0 ✅ (`2cc4a2d`) · B1 OFFLINE MACHINERY ✅ + green + acceptance-gate SHIP (`db72461`→`e201eee`; Codex review folded into the now-DONE B1 Codex gate; `docs/reviews/gate-2026-06-26-b1-offline.md`). B1d LIVE calibration ✅ CLEARED all seven pre-registered thresholds (held-out recall/precision/F1 1.00 · κ 1.00 · flip 0.00; leak-verified R-DARCH-2; eval-locked `1fcb492`; `docs/domain-calibration-status.md`). **Codex cross-model gate ✅ DONE** (gpt-5.5 @ xhigh, full B1 diff `07e9a55..HEAD` → 2 P2 *code* findings — partial-verdict acceptance + wrong env namespace — both fixed + reconciled primary-model-final + test-locked; 0 P0/P1; calibration result provably unchanged; `docs/reviews/codex-2026-06-26-b1-domain-judge.md`); `verify` green **250 + 4**. **NEXT: B2** (wire the domain judge into the ship gate as the tertiary control; **§4.2 DECIDED 2026-06-26 — keep `no_over_promise` gating + feed KB §4.2 into the A3 Drafter = defense in depth**) → **A3** (4 agents + Gemini Flash ≤$5 + cross-family judge) → **A4** (observability/trajectory view).** Now **"calibrated — directional, pending the ~100 floor"** (methodology calibrated via the cleared bar + eval-lock + acceptance-gate + leak-check + the Codex gate, R-DHON-3; metric stays directional until the ~100 floor, R-DHON-1). Committed 2026-06-26 (owner GO via "continue"); push remains owner-gated. A5 (live integrations) + Phase 6 (deploy) + public posting + spend-over-$5 stay **owner-gated**. Build continuation is manual (owner resumes each session; the auto-resume launcher was removed at owner request 2026-06-26 — it was never installed). Full detail: HANDOFF (top block).
- **▶ EXECUTION STATUS (2026-06-25, autopilot):** Phase 0 cleared + committed; the A2-scoped `/goal` is driving — **P3 ✅ (`dafb653`) · A1 ✅ (`f521b5c`) · A2 offline machinery ✅ (`5a1f86a`)**, all `npm run verify`-green (215+3 skipped) + self-reviewed; `lib/core`+oracle+gold UNTOUCHED. **Codex seat usage-limited (~7:49 PM reset)** → A1/A2 proceed **test-verified**; the A1 + A2 Codex reviews + the framework cross-check are **DATED OBLIGATIONS** before the A2 GO/NO-GO (decision-log 2026-06-25). Stack rule relaxed to **best-fit, cost-aware** (`e260c15`). **REMAINING = the A2 GO/NO-GO batch** (live R-LOOP-10 $0/P3-unblocked + set K · `verify:full` e2e · the seat-blocked Codex batch · `acceptance-gate` · then the **owner A2 GO/NO-GO**) — see **HANDOFF → NEXT**. Then STOP (A3/A4/A5/deploy stay owner-gated).
- **Phase 0 status (Decide & gate — pivot-checkpoint):** owner-approved pivot to a **bounded, HITL, eval-gated MULTI-AGENT verify-and-self-correct system**. The **mandatory cross-model gate RAN → BLOCK (9 findings) → ALL reconciled** primary-model-final (`docs/reviews/codex-2026-06-25-multiagent-pivot.md`); **ADR-002** (`docs/decisions/ADR-002-multi-agent-architecture.md`) + **3 decision-log reversals** + **binding spec amendments** (`docs/plan-multi-agent-execution.md` §0 AM-1..AM-8 + R-LOOP-1b/8b) authored; **confirming Codex pass CONFIRMED — Phase 0 gate CLEARED** (2 rounds). **Binding build preconditions:** P3 judge calibration must clear the held-out bar **before** A2's live milestone (Codex #1); the agent **recommends only** — eligibility/send stay deterministic + test-locked (Codex #6). **Committed near-term scope = P3-calibration + A1 + A2**; A3/A4/A5/Track B = roadmap, re-decided at the A2 go/no-go. **NEXT (owner actions only): commit the Phase-0 docs (explicit paths) + toggle `/autopilot` with an A2-scoped `/goal` → A1.** Canonical: brief `~/.claude/plans/read-last-handoff-and-snappy-ripple.md` + spec `docs/plan-multi-agent-execution.md`. **The REBUILD detail below is now the TOOL layer the agents call** (deterministic core · gatekeeper · semantic judge · eval harness · hybrid data · REPLAY — all promoted, intact).
- **Task name (REBUILD — now the agents' tool layer):** Rebuild ActivationOps AI into a real, industry-adoptable, **deployed desktop AI product** for stalled/long-tail **merchant activation** on a local-commerce delivery marketplace — single-stack **Next.js + TypeScript + Tailwind + React on Vercel (free tier)**, **porting** the proven deterministic core, integrating **real bounded Gemini** (eval-gated · claims-gatekeeper · <$5), on **hybrid data** (real open-source entities + synthetic activation overlay). **Canonical goal · DoD · phases · blindspots: `~/.claude/plans/gentle-forging-starlight.md`** (+ decision-log 2026-06-19 row).
- **JUDGE BUILD PROGRESS (2026-06-22):** **P0 DONE** (spec `docs/spec-semantic-judge.md`; commit `b01a5a6`) → **P1 DONE + GREEN** (offline judge: `lib/agents/{claimable-fields,semantic-judge}.ts` + mock + DI-live + the Merchant-Detail "Faithfulness check" panel, SECONDARY control after the gatekeeper) → **P2 DONE + GREEN** (calibration core, offline/$0): `lib/evals/judge-metrics.ts` (pure precision/recall/F1 + Wilson recall CI + Cohen's κ + test-retest flip-rate; headline = recall on the gatekeeper-PASSING subset, R-CAL-1), `evals/gold/semantic-judge-gold.ts` (stratified gold set as typed TS literals — **30 items**: 16 planted judge-territory positives across 4 failure modes (≥3 each, 9 held-out) that survive the guardrail + 2 gate-caught positives + 12 clean negatives incl. 2 real-supply; objective field-entailment labels + critiques incl. supported few-shot exemplars; tune/test split), `evals/gold/harness.ts` (reusable gold→gatekeeper→JudgeFn wiring, reused by P3's live judge), `evals/judge-calibration.test.ts` (16 tests; metric math vs hand-computed matrices; **R-CAL-1 enforced LIVE** against the real `runGatekeeper`; mock = labeled STUB BASELINE, not gated). **192 tests + 1 skipped green; typecheck/lint/build green; `lib/core` + differential UNTOUCHED.** All gold positives SYNTHETIC + labeled (R-CAL-4: the 6 recorded live drafts are well-grounded). **Judge model (owner): CROSS-FAMILY Groq `openai/gpt-oss-120b` (strict JSON, free), provider-agnostic boundary** — freshness-verified current 2026-06-22. **P3 INFRASTRUCTURE DONE + LIVE JUDGE WIRED + PROVEN** (owner provided `GROQ_API_KEY`): installed `@ai-sdk/groq@2.0.42`, wired the live Groq `openai/gpt-oss-120b` judge (strict `structuredOutputs` + `reasoningEffort:"low"`) in `lib/agents/semantic-judge.ts`; built the key-gated calibration runner `evals/judge-calibration.live.test.ts`. A live run PROVED the capability (strong recall; precision dragged by the judge flagging the platform's own name → root-caused + prompt-fixed via `platformName` grounding; reasoning-low validated to still discriminate). **REAL LIMIT (read verbatim from the 429, not inferred): Groq free tier = 200K tokens/DAY, exhausted today by 5 debugging runs** — with `reasoningEffort:"low"` a full run needs ~30K, feasible on a fresh window. **REMAINING P3 = one clean calibration run on a fresh Groq daily window** → held-out metrics → **P4** (eval-lock + the 3 demo surfaces + Codex gate + flip docs ONLY if metrics clear the bar, R-HON-3). No "calibrated, metrics=X" claim until then; pre-fix numbers NOT enshrined. Full status: `docs/judge-calibration-status.md`. Then the QUEUED UI redesign + owner-gated T13 deploy. (Offline suite green: 192 + 2 skipped; both live tests auto-skip.) Full plan: `docs/plan-semantic-judge-and-deepening.md`; spec: `docs/spec-semantic-judge.md`.
- **Current stage:** **🔒 GOAL LOCKED (2026-06-22, owner): portfolio/capability SHOWCASE — but "portfolio" ≠ shallow; build a REAL capability, kept COMPANY-AGNOSTIC. Differentiation = VERIFICATION RIGOR (deterministic-first per-claim faithfulness vs the structured source-of-truth, the seam incumbents leave open). Honesty reframe binding ("verify claims vs source of truth", not "no one automates this"). Grounding: `docs/research/market-validation-2026-06-22.md` + decision-log 2026-06-22.** **NEXT BUILD = the calibrated semantic LLM-judge** (owner 2026-06-22: "deepen the AI now + roadmap production", build in a fresh session) — canonical spec: **`docs/plan-semantic-judge-and-deepening.md`** (research-grounded + committed; reference-grounded per-claim entailment judge on `gemini-2.5-flash-lite`, SECONDARY control after the deterministic gatekeeper, calibrated on a labeled gold set, eval-locked; live calibration is owner-gated on the key + <$5; Codex gate before ship). The **UI REDESIGN** + the **owner-gated T13 deploy** are QUEUED after. (Prior UI-redesign context retained below.) **UI REDESIGN — paused for a fresh session.** The product is DONE / green / deploy-ready (live Gemini run + a 3-audit sweep [Codex · security · evals] + a pre-deploy grill + a 2026-06-22 doctrine alignment-audit [project-advisor · guidelines-monitor · acceptance-gate] with all gate-blocking + important findings fixed across 6 committed slices (incl. a fresh Codex BLOCK reconciled — the gatekeeper now enforces no-leakage) — all reconciled; public demo FICTIONALIZED; 161 tests + 3 e2e green). **ACTIVE TASK:** the owner finds the console "dull/generic" and wants a modern, professional, ELEGANT, white-bg product site with a STORYTELLING walkthrough arc + motion + custom SVGs (anti-slop). **5 design-direction SAMPLES are built (`mockups/{editorial,saas,swiss,technical,premium}.html`; shots in `mockups/shots/`; served at :8080), AWAITING the owner's PICK → then FINALIZE the chosen design language into the Next.js app (every surface + a storytelling landing) → owner-gated T13 deploy.** Full detail + paste-ready resume prompt: **HANDOFF** + **PROJECT_STATE**. (Details + the live-run checklist + resume prompt: HANDOFF. Earlier-this-session slice/gate history retained below.) Built since the slice: Phase B domain depth (`lib/domain/diagnosis.ts`), Phase C console (Eval/Quality · Metrics · Audit · Cost + nav), live-path hardening (injection cut + cumulative budget ledger), Phase D docs (`docs/WHY.md` why-chain + today-vs-target README). `typecheck/lint/test/build` GREEN (50 tests; all routes prerender). Remaining: **T12 live run (owner key + <$5) · T13 deploy + platform-name (owner) · T10 full Playwright (deferred — build render-smokes pages) · T11 doc polish (optional)**. Original slice-stage line:** Build session 2 (2026-06-19) delivered the full walking skeleton (one merchant → end-to-end), all add-alongside (`lib/core/*` + golden differential lane untouched): hybrid dataset (real DataSF SF entities + deterministic synthetic overlay; adapter/sanitizer/guards in `lib/ingest/`; frozen `lib/data/sf-entities.snapshot.json`, PII-scrubbed; NAICS sector-level → Restaurant/Retail crosswalk) → bounded Gemini draft (mock/live/FAILED_TO_FALLBACK + $5 fail-closed budget + pinned pricing + env-flags; `lib/agents/`) → claims-gatekeeper → draft-quality eval (corrupted-record teeth; `lib/evals/`) → REPLAY orchestrator (`lib/replay/`, $0 ledger) → Overview + Merchant Detail surfaces (`app/`, de-branded "Curbside Commons"). **`npm run typecheck/lint/test/build` all GREEN — 43 tests (differential byte-identical), 23 pages prerendered (20 SSG merchant pages).** **Codex review DONE (BLOCK → reconciled; all fixable findings fixed, 43 green; deferred = Phase-B injection + owner personal-name deploy-gate).** Slice **uncommitted** (intent-to-added for the Codex diff). **Next (owner-gated):** owner GO on commit(s) → owner decision on personal-name-DBA handling (gates public deploy) → owner GO on Vercel deploy. See HANDOFF for the paste-ready resume prompt + the Phase-B binding items.
- **Mode / risk / effort:** **FULL** · high risk (scope · architecture · public claims · data sourcing) · **Effort: MAX, auto-routed** (ship-gating/architecture).
- **Build order (each slice shippable + gated):** **thin vertical slice FIRST** (one merchant end-to-end → deployed REPLAY) → **A** faithful TS port (differential test: TS deterministic == Python golden) → **B** eval-gated real Gemini + domain depth + hybrid data + adapter → **C** desktop console (Overview · Activation Queue · Merchant Detail · Drafted Outreach+Approval · Eval/Quality · Metrics/Impact · Audit Trail · Cost ledger; *evaluate `DesignSync`/`claude-design` as a UI accelerator*) → **D** deploy + adoption path + why-chain docs.
- **Gates (per slice):** typecheck/lint/test (Vitest) + differential test + eval + (Phase C+) Playwright/a11y (WCAG AA, settled DOM); **every Blindspots-section mitigation in the plan is binding**; Codex changed-files review via `~/claude-os/bin/codex-guarded` (namespaced output).
- **Owner-gated stops (do NOT bypass):** commits/pushes (RULES §12) · dataset-source check-in (if a richer real/live free source is viable) · platform-name confirm ("Curbside Commons", 2-min trademark/web check) · public posting · anything irreversible/external.
- **First build steps:** (1) **dataset Source-Intake** (license/PII/quality/freshness; safe default = synthetic-primary with real open-source entities layered in so nothing blocks); (2) scaffold Next.js/TS; (3) the thin vertical slice.
- **Out of scope (post-DoD optional):** live-public LLM, agentic orchestration, live Slack/Resend sends, persistence/observability, multi-tenancy, mobile/responsive.
- **Commit status:** build session 1 (scaffold + core port + state-sync) is **committed** (`4de4503`/`3182bfa`/`f004d19`). Build session 2 (the thin vertical slice: `lib/ingest/`, `lib/agents/`, `lib/evals/draft-quality.ts`, `lib/replay/`, `lib/server/env-flags.ts`, `lib/product.ts`, `lib/data/{sf-entities.snapshot.json,PROVENANCE.md}`, `app/page.tsx`, `app/merchant/[id]/page.tsx`, `evals/*.test.ts`, `scripts-ts/build-hybrid-snapshot.mjs`) is **uncommitted**, intent-to-added (`git add -N`) for the Codex diff. Commits + Vercel deploy await owner approval (RULES §12) — surfaced in HANDOFF.

## Carried forward (unchanged by the pivot)
Merchant-activation use case · deterministic-first → bounded-LLM · eval-first · free-first (Gemini sole paid, <$5) · prototype-not-service (deploy = transient demonstration) · honesty (simulated labels, no real merchant data/access). The Python prototype is kept (tag `v1-python-prototype`, move to `reference/`) as lineage + the **differential-test oracle**; 35/35 tests + eval 20/20|45/45 remain the v1 proof.

## Reference
Approved plan (canonical): `~/.claude/plans/gentle-forging-starlight.md`. Superseded as the active plan: `docs/phase3-prep-slice-plan.md`, `PLAN.md` (their S1/S2/S3/S5 specs fold into Phases A–B). Patterns: resilix `/Users/sharan_98/Desktop/supply-chain-ai-resilix/` (design tokens · gatekeeper · Gemini wiring + cost ledger · hybrid data · `enterprise_readiness`); procureguard-ai = deploy/demo shape.

### Prior task — T-003 (superseded by the rebuild)
T-003 plan was Codex-approved (Act 2, 2026-06-12) but is **superseded** as the active plan by the 2026-06-19 rebuild; its hardening specs (de-brand, draft contract, hybrid lane, hooks) fold into Phases A–B. T-002 remained merged (`a95c0f1`); the Python core + tests are kept as the reference oracle.

exec
/bin/zsh -lc "sed -n '1,220p' HANDOFF.md" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
# Task Log

## 2026-07-03 — W3 (one-page report: web + machine JSON + corpus packaging) [delegated build, Opus @ xhigh; Fable orchestrates/judges]

- **Process:** per-slice gate · SPEC-ADHERENCE (delegated builder) · risk med (public-facing surface + honesty labels) · Effort auto-routed high. Advisor UNAVAILABLE (surfaced verbatim — 8th consecutive); maker=judge mitigated by RED-GREEN ×7 + this record + the pending M1 Codex batch. **NOT committed** (awaits Fable equivalence review → M1).
- **Part A — machine-JSON leg (C1):** the CLI already emits canonical `serializeReport` JSON; W3 makes it the explicit CI contract — documented `--json` trailing alias (both legs; default byte-identical so frozen goldens stay locked; exit 0/1/2 frozen) + a dedicated C10-header-surface eval (specVersion pin · matchingMode · simulated on both legs). Reading recorded E-1.
- **Part A — web view leg (C4):** `/report` page — `app/report/page.tsx` (server, metadata) → `components/report/ReportView.tsx` (client, surface toggle ACP/UCP) → renders the COMMITTED golden fixture reports (`expected-report.{acp,ucp}.json`, statically imported, bundled). Plain-words line LEADS each finding; the four C2 receipts (claim · reference-row · rule · severity) always visible; header pins specVersion + matchingMode (plain-decoded) + an unmissable SIMULATED banner (C10). Matches the Ledger-Enterprise idiom (rpt-* over the existing `.ds-*` tokens); print stylesheet → clean one-page print, `break-inside: avoid` per finding, honesty labels forced to print. Route prerenders `○ Static`; $0, zero LLM, zero network. Pure transform in `lib/packs/listings/report-view.ts`.
- **Part B — corpus packaging (C9):** top-level `fixtures/README.md` index covering BOTH sets (synthetic-restaurant truth corpus + ucp-conformance-ci) — regen (`fixtures:wedge`/`fixtures:ucp`), how-to-run, taxonomy keying (two axes kept separate, honestly), the `ucp-catalog-response.*` shape-honesty caveat VERBATIM, and **License: pending owner decision** (no LICENSE file added; upstream `ucp-schemas/` Apache-2.0 untouched). No frozen fixture bytes mutated — additive docs only.
- **$0-LLM proof extended:** new `evals/packs/report-view-c1.test.ts` walks the report import-graph (banned LLM/provider/network modules unreachable). Found + fixed a real gap: the walk regex (shared with `cli-c1`) missed bare side-effect `import "x"` — **hardened both walks** to catch it (strictly stronger proof; RG-2 proves it bites on the sneakiest form). New `evals/packs/corpus-packaging-c9.test.ts` (C9). Extended honesty-C10 + C6-overclaim scans to cover `fixtures/README.md`.
- **Gate:** `npm run verify` **exit 0 — 505 passed | 5 skipped** (was 478; +27). `npm run test:legacy` **exit 0 — 306 passed | 5 skipped** (hard constraint held). RED-GREEN ×7 executed (`docs/reviews/w3-verify-evidence.log`); slice record `docs/reviews/w3-slice-record.md`. NO new npm deps. Prerender spot-checked: 16 finding cards, both surface tabs, all C2 receipts, spec pin + SIMULATED + FAIL verdict present in static HTML.
- **Skills/tools:** Node-24 type-stripping (no deps) · static JSON import (bundled golden reports) · Next.js server+client split · seeded/frozen-fixture packaging. **Next:** M1 Codex batch + acceptance-gate (incl. W1 named obligation + W2 + W3 diffs) → D1.

## 2026-06-28 (A3-4 — Domain Critic wired into the loop VERIFY as the 2nd critic; advisory + independent; anti-theater eval → label DEFERS; COMMITTED TEST-VERIFIED, gate-2 Codex named-open)

**Process:** per-slice A3 gate · FULL · high-risk (AI behavior · cross-family architecture) · Effort auto-routed to MAX. Advisor consulted BEFORE writing (it set the decisive discipline: the Domain Critic needs its OWN anti-theater eval vs `mockDomainJudge` — B1/B2 don't discharge it — and the eval DECIDES the label; flagged the cross-family P1 would recur on the new judge's separate env). Owner said "keep going here" → continued autonomously per the RESUME DIRECTIVE.

**Did:** Wired the existing `judgeDomain` (B1/B2, unchanged) into the loop's VERIFY phase as the 2nd critic — ADVISORY (never gates `verifyPassed`/eligibility/send), INDEPENDENT (no faithfulness input; withholds `diagnose().play`), gatekeeper-gated, with `finalVerify.domain` + a `"domain"` audit actor + a 2nd verify-phase trajectory step. Extended the `live` gate to `crossFamilyReady` (+`resolvedDomainJudgeProvider()==="groq"`) + a fail-closed throw on a forced non-fully-DI'd `live:true`. Built the R-A3-1 anti-theater eval (`evals/domain-critic-antitheater.test.ts`).

**The material finding (anti-theater):** the live Groq domain judge (B1-frozen held-out) **TIES** its deterministic counterpart `mockDomainJudge` on the held-out gold (both aggregate F1 = 1.00) → the eval is a FLOOR-not-ceiling → the **`domain_critic` label DEFERS** (step stays "tool", like the Strategist). Honest earned-agent ledger after A3-4: **Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router pending A3-5.** Took the eval at face value (advisor: "if it ties, defer — don't rescue the label").

**Gate:** `npm run verify` **exit 0 — 285 passed + 5 skipped**; differential 20/20 UNTOUCHED. Two red-greens (advisory: domain gating the send → RED; cross-family: `||`→partial-DI attempts a real Gemini call, `&&`→throws). **Codex round-1 BLOCK (6: 1 P1 forced-live cross-family bypass + 2 P2 [stale `lastDomain` · plan claimed DONE] + 3 P3) → ALL reconciled primary-model-final; round-2 confirming → 1 RESIDUAL P1 (the `||` partial-DI hole) → patched to `&&` fully-injected-DI + a 3-case regression; round-3 re-confirm SEAT-BLOCKED (Codex usage limit ~7:25 PM, raw error surfaced, NO retry) = DATED OBLIGATION** → proceeding test-verified. **acceptance-gate = BLOCK (gates 1/3/4/5 PASS; gate-2 NAMED-OPEN — the load-bearing partial-DI fix is unreviewed by Codex + round-1 missed the P1 round-2 caught; flips SHIP 5/5 when round-3 returns).** Records: `docs/reviews/{codex,gate}-2026-06-28-a3-4*.md`.

**Skills used:** advisor (pre-build design + 2 reconciles), acceptance-gate (5-gate ship judge), codex-guarded (cross-model review, 3 rounds — round 3 seat-blocked). Committed test-verified via the RESUME DIRECTIVE; **push HELD** (no remote). NEXT = A3-5, after the A3-4 Codex round-3 re-confirm.

## 2026-06-28 (A3-3 — Drafter→Gemini cross-family OFFLINE machinery + §4.2 prevention; FULLY GATED, commit owner-authorized via the RESUME DIRECTIVE, push HELD)

**Process:** per-slice A3 gate · FULL · high-risk (AI behavior · cross-family architecture · cost/budget) · Effort auto-routed to MAX (ship-gating). Advisor consulted BEFORE writing (settled: hardcode Gemini not a `draftFn` seam — a seam would be a hole in R-A3-2; don't make `usage:{0,0}` universal — add a real cost-integrity test; honest live-gate). Owner said "resume" → continued autonomously per the RESUME DIRECTIVE.

**Did:** Swapped the loop's Drafter `draftOutreachGroq`→`draftOutreach` (Gemini, cross-family R-A3-2/R-ARCH-3); moved shared `withRevision` into `draft.ts` + added `instruction` to `draftOutreach`; wired KB §4.2 `DOMAIN_HONESTY_RULES` (static, merchant-independent, off the per-merchant `facts`) into the shared `buildPrompt` (R-A3-5); threaded a cloned cumulative $5 ledger (accrues drafter + judge spend; `UNKNOWN_USAGE` fail-closed); honest live-gate default; reframed the honesty notes cross-family; offline DI fixtures → usage `{0,0}` ($0 known); added 2 cost-integrity tests; repurposed the A2 live Groq test into the A3-7 cross-family harness skeleton; R-A3-8 note in `docs/{judge,domain}-calibration-status.md`. 9 files (`git diff --stat` 284+/111-).

**Gate:** `npm run verify` **exit 0 — 279 passed + 5 skipped**, typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+snapshots UNTOUCHED). **Codex changed-files review → BLOCK (6: 2 P1+2 P2+2 P3) → ALL reconciled primary-model-final + re-verified → confirming re-pass SHIP** — F1 cross-family gate not Groq-specific (`resolvedJudgeProvider()==="groq"` fix) + F2 vacuous live-harness ledger (the budget clone) were integrity bugs a green CI can't catch. **acceptance-gate → BLOCK (substance SOUND; caught a record-honesty defect I'd introduced — an overclaimed unreceived "SHIP" header) → 3 conditions discharged (raw verify + red-green + git-diff; confirming Codex SHIP + header fix; grill-basis) → re-stamp SHIP 5/5**. **Red-green:** disabling the loop's estimate-reservation turns the UNKNOWN_USAGE test RED (`expected +0 to be close to 0.0056` — the $0 spend-escape); restore → GREEN. Records: `docs/reviews/{codex,gate}-2026-06-28-a3-3*.md`.

**Skills used:** advisor (pre-build design + reconcile), acceptance-gate (5-gate ship judge), codex-guarded (cross-model review). Commit owner-authorized via the RESUME DIRECTIVE; **push HELD** (no remote). NEXT = A3-4.

## 2026-06-28 (A3-2b — Strategist live $0 Groq confirmatory eval; CLEARED the pre-registered anti-theater floor; label defers to A3-3)

**Process:** per-slice A3 gate · low-risk (evidence/eval only — no product/core/behavior change; $0 free Groq; internal artifact) · Effort auto-routed. Pre-registered the floor bar BEFORE the run (R-DCAL-7 honesty discipline). Owner said "resume" → continued autonomously per the RESUME DIRECTIVE.

**Did:** Built `evals/strategist.live.test.ts` (key-gated, auto-skips offline) — runs the LIVE Strategist on free Groq gpt-oss-120b over 4 same-play.touch/different-risk pairs × K=2 reps; asserts LIVE_AI ($0), per-merchant caution stable across reps, Low→standard / High→elevated on ALL pairs. Pinned the bar in `docs/strategist-confirmatory-status.md` BEFORE reading numbers. Ran live → **CLEARED**: Low→standard 4/4, High→elevated 4/4, 16/16 LIVE_AI, $0; snapshot `lib/data/strategist-confirmatory.snapshot.json` (captures the strategy/tone prose as samples for the A3-3 judge).

**Verdict (per the pinned bar):** viable candidate; the `strategist` label **DEFERS to the A3-3 cross-family judge** (floor-not-ceiling — the structural caution axis is deterministically matchable AND the prompt states the rule, so the live pass confirms instruction-following, not certified judgment). Plan-step `agent` stays "tool"; public count stays "3 agents + a candidate".

**Gate:** `npm run verify` green **277 + 5 skipped** (the live test skips in CI); differential lane UNTOUCHED. **Codex methodology review = BLOCK→2 reconciled primary-model-final + test-verified** — P1 (cost-honesty): the bare "$0/free" claim was overclaimed (the eval asserts the ledger, never meters billing); reframed to "Groq free-tier key, not metered" + a RULES §6 freshness check (groq.com/pricing 2026-06-28: gpt-oss-120b = $0.15/M in + $0.60/M out; ≈$0.003 if standard-billed; $0 on the free tier); P3: a stale "must beat strongRecommend" comment → floor-not-ceiling. Record: `docs/reviews/codex-2026-06-28-a3-2b-strategist-live.md`. The live floor result is unchanged (the findings were honesty-framing, not result-validity).

**Next:** A3-3 (Drafter→Gemini OFFLINE machinery + §4.2 prevention wiring + the cross-family judge). Skills/tools: codex-guarded (A3-2b methodology review). Commit owner-authorized; push HELD (no remote).

## 2026-06-28 (A3-2a — Strategist agent + anti-theater eval; Codex BLOCK→4 reconciled + test-locked; owner-authorized commit+push after the gate)

**Process:** FULL (per-slice A3 gate) · risk: AI-behavior/architecture but offline/$0/reversible · Effort: MAX (owner-set this session; ship-gating architecture + AI behavior). Advisor called BEFORE writing (sharpened: floor-not-ceiling, red-green teeth, push-needs-genuine-Codex). Owner: "all approval given comit and push after codex and reconcillation done."

**Did:** Built the Strategist seam offline-first — `strongRecommend` (the honest anti-theater BASELINE reading risk/tenure/engagement, which `diagnose().play` ignores) + envelope helpers + the LLM `strategistRecommend` (Groq `gpt-oss-120b`, DI `generate`, route-clamped, prompt withholds the raw merchant_name) in `lib/agents/strategist.ts`; `RecommendFn` sync-or-async + clone-isolation + honest plan-step `modelMode` in `lib/agents/loop/orchestrator.ts` (plan-step `agent` STAYS `tool` — tool-until-earned); `evals/strategist.test.ts` units + the anti-theater eval with explicit RED-GREEN. **Mid-build correction:** the orchestrator route-clamp (advisor-suggested) broke the R-LOOP-8b firewall *demonstration* (it muzzled the seeded "send anyway" recommendation) → reverted; clamping lives INSIDE `strategistRecommend`, the orchestrator stays the recommend-agnostic deterministic firewall.

**Gate:** `npm run verify` green **277 + 4 skipped** (was 270; +7 regression tests); differential **20/20** UNTOUCHED. **Codex changed-files review (`codex-guarded exec -s read-only`) RAN → BLOCK (4: 1 P1 + 2 P2 + 1 P3) → ALL reconciled primary-model-final + fixed + test-locked**: F1 (P1) Strategist live-gate misrouted via `JUDGE_PROVIDER` → new `groqLiveEnabled()` (`ENABLE_LIVE_AI && GROQ_API_KEY`), used in `strategist.ts` + the identical latent `groq-draft.ts` (surfaced); F2 (P2) trajectory mode honesty (`Recommendation.mode`); F3 (P2) prompt-wiring regression-lock (export `buildStrategistPrompt` + fact/no-name asserts); F4 (P3) recommend mutation-isolation (defensive clone + async-mutator regression). Record: `docs/reviews/codex-2026-06-28-a3-2a-strategist.md`. **Confirming re-pass = SHIP** (all 4 findings confirmed resolved) → **A3-2a Codex gate FULLY DISCHARGED**.

**Honest conclusion (floor-not-ceiling — advisor + Codex):** the structural discriminator (`caution`) is a finite enum a deterministic baseline computes perfectly → the eval is a NECESSARY anti-theater FLOOR (it FAILS a worse-than-baseline Strategist), NOT a label-earning ceiling → the `strategist` label DEFERS to the A3-3 cross-family judge; the "4 agents" claim = "3 + a candidate".

**Next:** COMMITTED `32da7b1` (explicit paths). **PUSH (owner-authorized) BLOCKED — no git remote configured; surfaced to owner for a target.** Then A3-2b live $0 confirmatory eval. Skills/tools: advisor (×1), codex-guarded (review + confirming re-pass = SHIP).

## 2026-06-27 (A3-1 — trajectory `agent` attribution (R-A3-6); test-verified + fully gated; Codex BLOCK→reconciled; UNCOMMITTED)

**Process:** FULL (per-slice A3 gate) · low-risk (offline, $0, additive metadata field — no behavior/eligibility/send change) · Effort auto-routed (code: moderate; the Codex ship-gating review: xhigh). Advisor called BEFORE writing on the one judgment call (the agent-attribution mapping). Owner: "resume" / "complete it is past 7:40pm".

**Did:** Added the first A3 slice — a `TrajectoryAgent` type + a **required** `agent` field on `TrajectoryStep` (`lib/agents/loop/trajectory.ts`), attributed every `record()` site in `lib/agents/loop/orchestrator.ts`, and added 2 R-A3-6 tests + a served-snapshot agent-lock (`evals/agent-loop.test.ts`). **Advisor cross-check changed the design:** my first instinct (label deterministic plan/reflect/route steps with agent roles now) was rejected for **tool-until-earned** (AM-2 "no agent costumes" + R-A3-1) — a step earns a role label only in the slice that wires its LLM AND clears its anti-theater seam-eval; until then `tool`. So only the genuinely-GENERATED `drafter` is an agent today; `strategist`→A3-2, `domain_critic`→A3-4, `router`→A3-5.

**Gate (verify → Codex → acceptance-gate):** `npm run verify` **exit 0 — 257 passed + 4 skipped**, typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+frozen snapshots UNTOUCHED — `git diff` is only the 3 code files + state docs). **Codex changed-files review (`codex-guarded exec -s read-only`) RAN → BLOCK, 2 findings (1 P1 + 1 P2), 0 P0** → BOTH reconciled primary-model-final + fixed + **RED-GREEN-locked**: (P1) the `seedDraft` branch was mislabeled `drafter` — a fed-in fixture (`modelMode "REPLAY"`) is not Drafter-produced → now `tool`; (P2) the test only exercised the generated path → added a seeded test that FAILS at `agent-loop.test.ts:365` (`expected 'drafter' to be 'tool'`) if the fix is reverted. Record: `docs/reviews/codex-2026-06-27-a3-1-trajectory-agent.md`. **acceptance-gate:** gates 1/2/4/5 PASS; gate-3 SHIP on its own pre-committed flip condition (raw exit-0 verify + the 2 red-green demos — produced; the gate's formal re-stamp was first session-limited, re-run after 7:40 PM ET). Record: `docs/reviews/gate-2026-06-27-a3-1.md`.

**Gotcha logged:** `codex exec` with a prompt arg ALSO reads stdin — without `< /dev/null` it blocks (caused a 7-min false timeout). Fixed.

**Next:** A3-2 (Strategist agent on Groq via DI/mock offline + anti-theater seam-eval vs `diagnose().play`, R-A3-1). Skills/tools: advisor (×1), codex-guarded (review + confirming re-pass), acceptance-gate (×1). **Recommended non-blocking before any irreversible step:** the Codex confirming re-pass (run post-7:40 PM) + a formal gate re-stamp. UNCOMMITTED; commit owner-gated. git: HEAD `50bbfc8`.

## 2026-06-26 (A3 — design/plan pass: 4-agent architecture settled + advisor-cross-checked + owner-gated; buildable spec written; NO code)

**Process:** FULL · high-risk (architecture + AI behavior + public claim) · Effort MAX (auto-routed; Rule 0 — architecture is top-tier judgment work) · planning/design only, no product code. A3 opened with a design pass per the handoff ("Plan it, gate the plan, THEN build"). Owner: "resume."

**Did:** Oriented on the A3 spec + the A2 single-agent loop it splits (`lib/agents/loop/orchestrator.ts`, `tools/registry.ts`, `loop/trajectory.ts`). Called the **advisor** (stronger-model cross-check) BEFORE committing to the architecture → it validated the boundary/contract/§4.2-wiring and sharpened: apply AM-2 to the Strategist too (must beat `diagnose().play`); the Router is the anti-theater crux (must beat `buildReflection`); don't manufacture a 4th agent to hit "4"; both judges stay Groq (Drafter→Gemini restores cross-family R-ARCH-3); add per-`agent` trajectory attribution now; HOLD the "directional" label (judges calibrated on the gold set, not yet on live Gemini prose); gate each agent separately, offline-first; re-set K. Surfaced the agent-count as an **owner decision** (AskUserQuestion) → owner chose **"Target the full 4"** (build all four, each gated by a seam-proof).

**Wrote (durable):** `docs/plan-multi-agent-execution.md` **§11** (detailed A3: the 4 agents' seams + I/O, the Drafter↔Domain-Critic contract, §4.2 wiring, EARS **R-A3-1..9**, the build DAG **A3-0..8**, gates, cost shape, honesty notes); `docs/decision-log.md` row "A3 agent count = the full 4"; synced **PROJECT_STATE / CURRENT_TASK / HANDOFF** top blocks + a paste-ready A3-BUILD resume prompt. **No `lib/`/`app/`/test file touched** (design pass).

**Gates / next:** the consequential decision (4-agent architecture) is **owner-gated** (AskUserQuestion). NEXT = **A3-1** (trajectory `agent` attribution, offline $0), then A3-2..A3-6 (mock/DI, $0), each gated `verify` → Codex changed-files review (`codex-guarded`) → `acceptance-gate`. A3-7 live Gemini run stays owner-gated. Skills/tools: advisor (×1), AskUserQuestion (×1). git: HEAD `50bbfc8`, tree clean but for untracked tooling; push owner-gated.

## 2026-06-26 (Track B2 — Codex cross-model gate COMPLETED on the reset seat → SHIP; 3 findings fixed; B2 ship-gate FULLY DISCHARGED)

**Process:** FULL · high-risk (ship-gating cross-model review on a public-surface AI-behavior slice; the §4.2 consequential-recommendation cross-check) · Effort xhigh (auto-routed; Codex gpt-5.5 @ xhigh). Advisor before spending the seat (pre-registered per-finding accept/refute discriminators + the "don't break AM-4" trap). Owner: "complete the OPEN Codex gate … reconcile primary-model-final … commit the reconciliation."

**Ran:** the COMPLETE read-only Codex changed-files review — `~/claude-os/bin/codex-guarded exec -s read-only` over commit `6ea0549` (the 6 code/test files), `gpt-5.5` @ `xhigh`, CLI 0.136.0, session `019f069f`, full run ~212.5k tokens (seat reset — NOT limited this time). Smoke-tested the seat ALIVE (`SEAT_OK`) first; gave the 4 concrete gate-record targets + rejected the "mirrors faithfulness" discharge up front.

**Verdict → reconciliation (primary-model-final):** VERDICT **SHIP**; all 4 targets CONFIRMED (advisory invariant = leaf field that protects the future live judge too · 75% mock-flag surface honest · audit honest · **§4.2 non-redundancy confirmed against the REAL gatekeeper + faithfulness code**). 3 findings, 0 P0/P1, ALL accept→fix: (F1, P2 `page.tsx`) Human-gate "Eligible and clean" → "Eligible by the deterministic core" + an advisory note when `domain_defective`; (F2, P3 `replay.test.ts`) the audit-wording test now bans `reject|block|gate|hold|prevent` on flagged entries; (F3, P3 `replay.test.ts`) the §4.2 demo test exercises the wired `mockDomainJudgeResult().verdict`. Codex independently confirmed `AuditEntrySchema` is enforced (not cosmetic) + the 5→8 renumber is correct, and did NOT push the trap (gate-the-send would break AM-4). Record: `docs/reviews/codex-2026-06-26-b2-domain-shipgate.md`; gate record flipped to gate-2 CLEARED.

**Verified:** `npm run verify` green = **255 + 4 skipped**, exit 0 (count unchanged — assertions hardened + one call swapped, no tests added/removed); `npm run test:e2e` 4/4 (one first-navigation Playwright flake on the first run, clean on re-run — reported, not a regression); differential 20/20 (`lib/core`+oracle+gold+frozen snapshot UNTOUCHED). **B2 ship-gate FULLY DISCHARGED.** Reconciliation committed on top of `6ea0549`; push owner-gated. **NEXT = A3.**

## 2026-06-26 (Track B2 — domain judge WIRED into the REPLAY ship-gate as the tertiary ADVISORY control; test-verified + acceptance-gate-reconciled; Codex review OPEN)

**Process:** FULL · high-risk (ship-gate wiring + AI behavior on a public surface) · Effort HIGH (auto-routed; mirrors a proven pattern, not novel architecture). Advisor before writing (advisory-invariant + non-vacuous test shape) and at the completion checkpoint (caught the §4.2 0/20-inert gap + the open-gate framing). Owner: "resume b2".

**Built (6 files, uncommitted):** `lib/replay/run.ts` — `ReplayMerchant.domainJudge: DomainJudgeResult | null` (mock, `$0`, gated on `gatekeeper.approvedForHumanReview`, parallel to faithfulness) + `"domain"` `AuditEntry` actor (after `judge`, before `eval`) + widened the actor union; `lib/agents/tools/schemas.ts` — mirror-fix (`"domain"` into `AuditEntrySchema`, restoring lockstep with the canonical type — the A1 `append_audit` tool derives from it, so the widening broke typecheck until fixed); `lib/agents/domain-judge.ts` — comment-only "secondary"→"tertiary" reconcile; `app/merchant/[id]/page.tsx` — "5 · Domain quality check" panel (Eval→6/Human→7/Audit→8); `evals/replay.test.ts` — 5 new tests; `evals/e2e/console.spec.ts` — section assertion.

**Verified:** `npm run verify` green = **255 + 4 skipped** (was 250), exit 0; differential **20/20** (`lib/core`+oracle+gold+frozen snapshot UNTOUCHED, confirmed via `git diff --name-only`); e2e 4/4. **Red-green** for the ADVISORY invariant (mutation → `replay.test.ts:79` RED; restore → GREEN). **§4.2 non-redundancy demonstrated** (gatekeeper APPROVES + faithfulness PASSES + only `no_over_promise` FAILS on implied-typicality hype).

**Gates:** `acceptance-gate` = BLOCK (procedural — no hard P0/P1; all 5 invariants honored on its read + advisor agreed) → gate-3 (verify) CLEARED with raw + red-green; 3 non-blocking items addressed. **Codex changed-files review OPEN** — seat ALIVE, review ran + surfaced 1 real finding (false "never auto-sent" copy → fixed primary-model-final) then hit the usage limit mid-review (raw surfaced; no retry). Complete review + §4.2 cross-check = DATED OBLIGATION (seat ~8:31 PM). Record: `docs/reviews/gate-2026-06-26-b2-domain-shipgate.md`. Commit + the Codex re-run are owner-gated.

## 2026-06-26 (Track B1 — Codex cross-model gate RAN + reconciled → domain judge "calibrated — directional"; 2 P2 fixes)

**Process:** FULL · high-risk (ship-gating cross-model gate on a calibration-honesty claim; AI behavior) · Effort xhigh (auto-routed; Codex gpt-5.5 @ xhigh). Advisor before the gate (approach + the flip-label nuance) and before the flip (tie-break + record-softening + coherence). Owner: "run the Codex cross-model review … reconcile primary-model-final … then flip."

**Ran:** the mandatory Codex cross-model gate — `~/claude-os/bin/codex-guarded review --base 07e9a55` (gpt-5.5 @ xhigh, CLI 0.136.0, session `019f0571`) over the full B1 diff `07e9a55..HEAD` (18 files, +3686/−1; `07e9a55` verified = parent of the first B1 commit `db72461`, so one base covers B1a→B1d + discharges the B1-offline obligation). Independently re-confirmed the pre-gate tree green (243+4) first.

**Verdict → reconciliation (primary-model-final):** 2 P2 *code* findings, 0 P0/P1, no honesty/overclaim finding (a code-scoped review). Both ACCEPT→FIX + test-locked: (B1-1) live partial-verdict acceptance — a schema-valid verdict with <3 dimensions computed `domain_defective` from the subset, so an omitted failed dimension read as passing → now requires all 3, else fails closed to the mock (`INCOMPLETE_VERDICT`); (B1-2) liveness read the faithfulness `JUDGE_PROVIDER` not `DOMAIN_JUDGE_PROVIDER` → new `domainJudgeLiveEnabled()` in the env single-source-of-truth. Calibration result provably unchanged (ran via explicit `live:true` / default-groq). Record: `docs/reviews/codex-2026-06-26-b1-domain-judge.md`.

**Flip (R-DHON-3 + R-DHON-1):** docs flipped coherently in ONE pass — "directional / pending Codex" → **"calibrated — directional, pending the ~100 floor"** across `docs/domain-calibration-status.md` (line-3 logic rewritten, not find/replaced), `evals/domain-calibration.lock.test.ts` (header), PROJECT_STATE / CURRENT_TASK / HANDOFF, + forward-pointers on the two prior gate records. The "calibrated" word is carried by the cleared bar + eval-lock + acceptance-gate + the R-DARCH-2 leak-check, NOT by Codex's silence (it audits code, not prose).

**Validation:** `npm run verify` green = **250 + 4 skipped** (+7 lock tests: 3 partial-verdict, 4 env-routing). `lib/core` + the differential oracle + the gold labels + the frozen calibration snapshot UNTOUCHED.

**Honesty / owner gate:** committed 2026-06-26 (owner GO via "continue"); introducing "calibrated" into the honesty-sensitive docs is a public-claim change — owner-approved. **Push remains owner-gated** (RULES §12); not pushed. Skills/tools: advisor (×3 this session), codex-guarded (the gate), acceptance-gate (prior, referenced). NEXT = B2 + A3.

## 2026-06-26 (Track B1d — LIVE domain-judge calibration: RAN + CLEARED the pre-registered bar; eval-locked; acceptance-gate engineering-SHIP)

**Process:** FULL · high-risk (AI behavior, ship-gating calibration honesty) · Effort MAX (auto-routed). Advisor before the run (budget protection + decision-rule reading) and after (the κ=1.0 leak scrutiny). Owner: "Run B1d now."

**Ran:** the live cross-family Groq `openai/gpt-oss-120b` domain judge over the 36-item synthetic gold set (K=3, temp 0, **$0**, 36/36 LIVE_JUDGE, 0 fallbacks; ~27 min). A **1-call smoke FIRST** (advisor) ruled out the strict-output→fallback-while-billing failure before the ~100K-token run — the one-shot/day budget was protected. **Held-out (test) recall/precision/F1 1.00 (CI95 [0.76,1.00], n=18), per-dim recall 1.00 each, κ 1.00, flip 0.00 → CLEARS all seven pre-registered thresholds** (`docs/domain-calibration-status.md`). No-leakage VERIFIED (R-DARCH-2) by reading the situation extractor + the recorded rationales (they isolate the right dimension; the engagement cross-dim precision 0.5 is a real-reasoning fingerprint, carried to B2).

**Eval-lock (`1fcb492`):** `evals/domain-calibration.lock.test.ts` (R-DHON-4 frozen-fixture — asserts the committed snapshot clears the bar + real-run provenance; makes NO live call) + date-stamped `lib/data/domain-calibration.snapshot.json`.

**Validation:** `npm run verify` green = **243 + 4 skipped** (the 4 live tests auto-skip offline → $0); `lib/core` + the differential oracle + the faithfulness gold UNTOUCHED.

**Gates:** `acceptance-gate` = engineering **SHIP** (leak / non-vacuity / eval-lock / metric-math all independently cleared) with a doc-coherence **BLOCK** (the result was committed before the claiming docs were flipped → transient repo contradiction) → **RECONCILED** this commit (status + state docs flipped to one story; lesson: flip the claiming docs in the SAME commit as the result). Codex cross-model gate = **SEAT-BLOCKED** (usage limit, raw-surfaced, ~3:27 PM reset) → **dated obligation** (`--base 07e9a55` covers the full B1 diff, also discharging the B1-offline obligation). Record: `docs/reviews/gate-2026-06-26-b1d-live.md`.

**Honesty held (R-DHON-1/3):** "RAN + CLEARED (DIRECTIONAL)", NOT "calibrated" — the calibrated label waits for the Codex gate + the ~100 floor; all gold positives SYNTHETIC (R-DCAL-4). Skills/tools: advisor (×3), acceptance-gate, codex-guarded (attempted). Commit per green slice (owner mode). No push (owner-gated).

## 2026-06-26 (Track B1 — domain-quality "Effective"-axis judge: OFFLINE MACHINERY; acceptance-gate SHIP)

**Process:** FULL · high-risk (AI behavior, calibration) · Effort MAX (auto-routed). Advisor-shaped before authoring (5 constraints folded into the spec). Owner: "continue building as per our plan."

**Built (5 committed slices, each `verify`-green):** `db72461` B1a (spec `docs/spec-domain-judge.md` + rubric `lib/domain/effective-rubric.ts`) · `4096ebe` B1b (`lib/agents/domain-judge.ts` + 11 tests) · `f71c5c9` B1c (gold `evals/gold/domain-gold.ts` + harness `evals/gold/domain-harness.ts` + offline cal `evals/domain-calibration.test.ts`, 8 tests) · `2fc1f08` B1d (live runner `evals/domain-calibration.live.test.ts` + status `docs/domain-calibration-status.md` with the pre-registered bar) · `e201eee` honesty refinements (advisor). The Effective analogue of the P3 faithfulness judge: KB-cited rubric (matched/engagement/over-promise from `knowledge/domain/merchant-activation-kb.md`), **situation-in not answer-in** judge (R-DARCH-2 — withholds `diagnose().play`), gold positives gate-passing + faithful by construction, **R-DCAL-1 enforced LIVE** in the harness (caught + fixed one mis-constructed gold item), per-dimension metrics, the bar pinned before any number.

**Validation:** `npm run verify` green = 236 + 4 skipped (the live cal test auto-skips offline); `lib/core` + the differential oracle + the faithfulness gold UNTOUCHED.

**Gates:** `acceptance-gate` = **SHIP** (offline machinery, framed as method-not-calibrated-judge). Codex changed-files review = **SEAT-BLOCKED** (usage limit, raw-surfaced, ~3:27 PM reset) → dated obligation folded into the B1d Codex gate. Durable record: `docs/reviews/gate-2026-06-26-b1-offline.md`.

**Honesty held:** NO "calibrated" claim anywhere; the live Groq calibration run + eval-lock + Codex gate are owner-gated (B1d, R-DHON-3). State docs synced to "B1 offline machinery done", never "B1 done". Skills used: advisor (review), acceptance-gate. Commit per green slice (owner mode). No push (owner-gated).

## 2026-06-26 (Remove the auto-resume launcher — owner request; docs-only)

**Process:** lightweight · low-risk · docs-only. Owner asked to "remove auto resume launcher."

**Finding (surfaced, do-no-harm inspection before removal):** the "owner-installable launchd auto-resume" described in the state docs (`~/claude-os/bin/activationops-autoresume.sh` + a launchd job + `.claude/AUTORESUME_PAUSE`) **was never actually installed.** Verified: `launchctl list` has no matching job; no plist in `~/Library/LaunchAgents` (or `/Library/Launch*`); no `activationops-autoresume*` script anywhere under `~`; no `AUTORESUME_PAUSE` file; claude-os records no such install. It existed only as "owner-installable" text in 3 docs.

**Action:** scrubbed the auto-resume references from `HANDOFF.md`, `PROJECT_STATE.md`, `CURRENT_TASK.md` (replaced with "build continuation is manual / owner-driven" + a removal note). No code, no launchd/system change (nothing was installed to unload). No decision-log entry (the mechanism was never load-bearing — never installed). Commit owner-gated (RULES §12).

## 2026-06-25 (MULTI-AGENT PIVOT — Phase 0: Codex gate → BLOCK → reconciled; ADR-002 + reversals + spec amendments)

### Professional Process Applied
Task type: governance — pivot-checkpoint + mandatory cross-model gate (no product code) · Stage: Phase 0 (Decide & gate) · Risk: HIGH (scope · architecture · AI behavior · public claims; reverses 3 logged decisions) · Mode: FULL · Effort: MAX, auto-routed (ship-gating governance on a major architectural pivot) · Basis: owner-approved brief `~/.claude/plans/read-last-handoff-and-snappy-ripple.md` + execution spec `docs/plan-multi-agent-execution.md` §4 (EARS R-P0-1..5); RULES §3/§6/§12/§14; playbook Decision-Reversal Rule + ADR format · Validation: Codex adversarial cross-check (primary-model-final) + a confirming pass + the §4.2 acceptance checklist · Codex: this step IS the gate (BLOCK→reconciled; confirming pass running) · Human approval: owner `/autopilot`+`/goal` toggle + commit (pending).

### What was done
- **Smoke-tested the Codex seat** (`codex-guarded`, owner doctrine — surface raw, no retry/downgrade/switch) → alive; ran the **adversarial cross-check** on the pivot → **BLOCK (9 findings)**, captured + reconciled all 9 under primary-model-final in `docs/reviews/codex-2026-06-25-multiagent-pivot.md` (none refuted — all honesty/scope/deterministic-first conditions; #6 + #7 caught real gaps the primary had under-specified).
- **Authored ADR-002** (`docs/decisions/ADR-002-multi-agent-architecture.md`): the agent/tool line, named agents+tools, two-axis ship bar, Groq-loop/Gemini-final split, REPLAY-only posture, A1→A2→A3 with A2 as the early go/no-go; **Validation Needed makes P3 calibration a hard A2 prerequisite + the recommend-not-decide test-lock**.
- **Recorded 4 decision-log rows** (2026-06-25): the pivot + the 3 reversals (drop-agentic→agentic deliverable · implicit single-agent→bounded multi-agent · integrations-deferred→transient demo — the last framed as a *satisfied* RULES §3 precondition, not a rule reversal, per Codex #8).
- **Amended the execution spec** (`docs/plan-multi-agent-execution.md` §0): binding **AM-1..AM-8** + new **R-LOOP-1b** (recommend-not-decide invariant) + **R-LOOP-8b** (test-lock) + the inline R-LOOP-1 fix; the §0 block supersedes conflicting requirement text below it.
- **Synced state docs:** PROJECT_STATE · CURRENT_TASK · HANDOFF (resume) · roadmap · this log · journal. Prior active task (UI Stage 2 + judge P3 calibration) re-labeled **subsumed** (calibration still completes — it IS the Faithfulness-reverse tool).
- **Launched a confirming Codex pass** on the reconciled artifacts (running).
- **No product code touched** (Phase 0 = governance only); `lib/core` + the differential oracle UNTOUCHED.

### Skills / tools used
- **Codex** via `~/claude-os/bin/codex-guarded` (shared-seat wrapper) — the mandatory cross-model gate (BLOCK → reconcile → confirm loop).
- **advisor** (pre-substantive-work) — armed the Codex framing with current state + decision-log rows, flagged the unproven-catcher dependency, the reversal-(c) mis-framing, and commit hygiene.

### Next
Reconcile the confirming pass → owner commit (explicit paths) → owner toggles `/autopilot`+`/goal "<ship condition>"` → A1 (tool-ify the deterministic core).

## 2026-06-22 (semantic judge — P3 infrastructure + live judge wired + calibration run; owner provided GROQ_API_KEY)

### Professional Process Applied
Task type: live-AI integration + calibration (P3) · Stage: execution, P3 of P0–P4 · Risk: medium (live model calls, but FREE tier $0; key owner-provided; no `lib/core` touch) · Mode: FULL · Effort: high, auto-routed (AI behavior + live integration) · Basis: spec `docs/spec-semantic-judge.md` R-ARCH-3/R-CAL/R-HON + 2 advisor reviews · Validation: offline suite green (192 + 2 skipped, both live tests auto-skip); key + strict-mode + reasoning-effort verified by live probes (raw errors read, not inferred) · Codex: P4 ship gate · Human approval: key was the owner-gated stop (provided); deploy + public posting still gated.

### What was done
- **Verified the owner's `GROQ_API_KEY`** without printing it: present/well-formed (gsk_, 56 chars), `.env` gitignored + untracked, HTTP 200, `openai/gpt-oss-120b` available + non-deprecated (RULES §6).
- **Installed `@ai-sdk/groq@2.0.42`** (AI SDK v5 compatible — the approved P0 Source-Intake decision) and **wired the live Groq judge** in `lib/agents/semantic-judge.ts` `defaultJudgeGenerate` (strict `structuredOutputs: true` + `reasoningEffort: "low"`). Build-time strict-mode smoke: schema-valid JSON + correctly flagged a planted fabrication.
- **Calibration runner** `evals/judge-calibration.live.test.ts` (key-gated, auto-skips offline): live judge over the 30-item gold set, K=3 reps, R-CAL-1 partition, writes the report; quality thresholds eval-locked at P4 (not here).
- **Calibrated the judge prompt** (`buildJudgePrompt`, threaded `platformName`): a live run showed strong recall but precision dragged by the judge flagging the platform's own name + greeting framing as "unsupported" — root-caused + fixed (the email is sent BY the platform; skip its name + greetings). Raw probe confirmed the fix discriminates at low reasoning effort.
- **Lowered `MAX_JUDGE_OUTPUT_TOKENS` 2000→1024** (Groq reserves max_tokens against the rate window).

 succeeded in 0ms:
# HANDOFF.md

Point-in-time handoff for the next session. Overwrite the top block each time a session ends or pauses; keep the standing procedures at the bottom.

## Latest handoff

> **▶▶ GITHUB PUBLISH EXECUTED — THE REPO IS LIVE PRIVATE AT `github.com/sharanlabs/commerce-truth-audit`; THE PUBLIC FLIP IS HELD BY OWNER RULING (2026-07-06, fourteenth session — READ THIS BLOCK FIRST; SUPERSEDES everything below).** Owner word (verbatim): "resume except design, github publish complete all other steps." Executed: authorization + intent capture committed PRE-push (`8f81b9e`, per the advisor constraint — last session's push was denied for lack of recorded authorization) → `gh repo create commerce-truth-audit --private --source=. --remote=origin --push` succeeded (main tracking origin; About description set) → the advisor-mandated **identifier-exposure sweep** ran before any flip (the prior sanitization audit scoped secrets, NOT privacy identifiers): tracked tree clean except `/Users/sharan_98` paths inside internal review transcripts (covered by the ratified internal-docs-as-is default); no handles/emails/secrets/workflows tracked; `.env` never tracked; **the git author email `sharank98@gmail.com` is on all 144 commits** → surfaced to the owner at the flip decision → **owner ruled "Stay private for now."** The four Pub defaults (interim name "Commerce Truth Audit" · Apache-2.0 · private-then-flip · internal-docs-as-is) are RATIFIED by the directive; the classifier retry is NOT armed by it; S-11 stays open; design/deploy stay excluded. No product code changed; verify baseline unchanged (**743+6** at `4489ad9`); frontier-advisor consult PROCEED-WITH-CONSTRAINTS (all adopted); advisor() down 14th consecutive session.
>
> **▶▶ RESUME DIRECTIVE (2026-07-06, fourteenth session):** on a bare `resume`, run the Mandatory Startup Contract, report that **the plan is COMPLETE and the repo is LIVE PRIVATE — nothing is queued**, list the owner acts below, and STOP. **OWNER ACTS (each needs your word):** ① **flip PUBLIC** — one command from anywhere: `gh repo edit sharanlabs/commerce-truth-audit --visibility public --accept-visibility-change-consequences` (timing anchor: NYC DCWP fee-cap recordkeeping hearing, July 16, 2026; ⚠ the flip permanently publishes the git author email `sharank98@gmail.com` on all commits — if you want it scrubbed, the history rewrite must happen BEFORE the flip and will change every commit SHA, so the gate/review records need a SHA-mapping note; a GitHub noreply email can be configured for FUTURE commits regardless: `git config user.email "<id>+sharanlabs@users.noreply.github.com"`); ② **S-11 brand pick** ("Assay" collided on the 2026-07-06 live screen; repo rename later = `gh repo rename`); ③ **design fix → deploy** (excluded by your word, sequenced design-first per the 2026-07-03 ruling); ④ **classifier retry** only via a NEW committed pre-registration + explicit arming word. Hard stops unchanged: public flip · deploy · name adoption · new live arming. Pushes to the PRIVATE origin are now routine for authorized commits (remote exists; publish authorized 2026-07-06).
>
> *(The block below is the prior session's handoff — superseded by the block above.)*
>
> **▶▶ PUB EXECUTED — THE PLAN IS COMPLETE; THE REPO IS PUBLICATION-READY AND PUSHED PRIVATE; ONLY OWNER ACTS REMAIN (2026-07-06, thirteenth session — SUPERSEDED by the fourteenth-session block above).** The owner armed the slice ("except design complete all other tasks. resume") — design + deploy EXCLUDED by that word; the classifier retry EXCLUDED (not a task; needs a NEW pre-registration + explicit word). **Executed:** README fully REPLACED to front the truth-audit program (advisor-ruled full replace; legacy = one lineage section, archived runnable) · `docs/PUBLICATION.md` postable writeup · `docs/demo-recording.md` (byte-identical live-run transcript) · **LICENSE Apache-2.0 + NOTICE** (O6 CLOSED; C9 test consciously updated red-green) · C10 honesty gate EXTENDED over the new public prose (it BIT ITS AUTHOR live on a quoted banned literal — gate kept, prose reworded) · product surface renamed "ActivationOps AI"→**"Commerce Truth Audit"** (descriptive interim — NOT a brand adoption; S-11 stays open; live screen: "Assay" COLLIDED with assay.tools + squatted npm) with a sanctioned banner-only golden regen (byte-verified) · legacy CSV relocated (+ the python `scripts/config.py` regression it exposed, fixed, 35 py-tests green) · **source-lockfile relocked for Pub** (L4/L6/L8 + new L12–L15 LOCKED live 2026-07-06; the Juniper claim DROPPED rather than published on secondary sourcing; used-facts audit = zero PENDING-RELOCK among used facts) · **publication-sanitization audit CLEAN** (141 commits; .env never committed; zero secret patterns in any historical blob; UCP Apache-2.0 + provenance; DataSF PDDL-1.0/fictional). **Gates: Codex chain SHIP** (batch BLOCK 2P1+2P2+1P3 @medium [effort deviation recorded] → confirming xhigh BLOCK 2P1+1P3 → narrow BLOCK → micro BLOCK → closing **SHIP**; 5 raws + summary `docs/reviews/codex-2026-07-06-pub-slice{,-*raw}.md`; deepest catch = the repo's own source-lock rule; P2-2's fix reviewer-corrected to RFC-2606 `.example`) · **acceptance-gate SHIP** (route-back NONE; condition = live verify handoff, DISCHARGED with raw tails: verify exit 0 **743+6** · legacy **306+5** · python **35**; record `docs/reviews/gate-2026-07-06-pub-slice.md`; advisory 1 folded same-session). Evidence: `docs/reviews/pub-verify-evidence.log` (RG ×3 + 3 addenda). Research subagents died TWICE on seat limits (raws recorded) → NO-WAIT inline conversion (deviation on decision-log). **Committed (`4489ad9`). The private-repo push was DENIED by the harness permission layer (no recorded owner authorization — the bundled ask had timed out); honestly returned to the owner as a one-command act from the repo root: `gh repo create commerce-truth-audit --private --source=. --remote=origin --push`.**
>
> **▶▶ RESUME DIRECTIVE (2026-07-06):** on a bare `resume`, run the Mandatory Startup Contract, report that **the plan §5 roadmap is COMPLETE — every slice shipped and gated; NOTHING is queued**, list the open OWNER ACTS below, and STOP. **OWNER ACTS (each needs your word):** ① **flip the private repo PUBLIC** (one click — the timing anchor is the NYC DCWP fee-cap recordkeeping hearing, July 2026; skim `docs/reviews/` first — gate advisory 2); ② **ratify (or override) the four defaults-taken** (decision-log 2026-07-06: interim name "Commerce Truth Audit" · Apache-2.0 · private-then-flip · internal-docs-as-is); ③ brand-name pick (S-11 open; "Assay" collided); ④ design fix → deploy (excluded from this slice by your word); ⑤ any classifier retry = NEW pre-registration + explicit arming. Hard stops unchanged: public flip · deploy · name adoption · new live arming.
>
> *(The block below is the prior session's handoff — superseded by the block above.)*
>
> **▶▶ THE FOUR OWNER DECISIONS EXECUTED — THE LIVE CLASSIFIER RAN AND ITS LABEL DEFERS; NEXT = Pub (OWNER-GATED) OR NOTHING (2026-07-05, twelfth session — SUPERSEDED by the thirteenth-session block above).** The owner answered the four surfaced decisions with "all four" (decision-log 2026-07-05): **① the live classifier calibration run was armed and EXECUTED.** The lane was wired first (`lib/agents/fee-classifier.ts`: leak-free ClassifierInput-only prompt + static §20-563.3(d) rubric · schema-checked 5-label output · FAILED_TO_FALLBACK · env-gated · Groq-only $0, no paid branch; `wired→true`; the fees pack's zero-network proofs intact), then the pre-registered run ran. **Run #1 (incident, honest record): all 84 calls completed, then every result was LOST to a `writeFileSync` ENOENT (`lib/data/` moved at W0) before any metric printed — outcome-blind, so the recovery re-run was legitimate; the harness now probe-writes its output path BEFORE spending and freezes BEFORE asserting. Run #2 (AUTHORITATIVE, degraded=false, zero fallbacks): held-out 20/21 = 0.952 — strictly beating the pinned 19/21 baseline — macro precision 0.971, macro κ 0.944, flip-rate 0.000, but `enhanced_service_fee` recall 3/4 = 0.75 missed its pre-registered ≥0.80 floor → per the conjunctive rule THE LABEL DEFERS.** No re-run, no floor change; the held-out split is exposed and may not be re-scored; any future attempt = a NEW owner-gated arming with its own (COMMITTED-first — lesson routed) pre-registration. The one miss is on record verbatim (relabel-test-2, unanimous ×3). Frozen: `lib/data/fee-classifier-calibration.snapshot.json` + the eval-lock test (verdict-tamper red-green durable); narrative: `docs/fee-classifier-calibration-status.md` (pre-registration + incident + results + provenance addendum — floors committed pre-run at `bda6314`/`550e3cb`, the no-rerun rule at `c73c100`, the working-tree-only conventions provably outcome-invariant). **② Gemini demo color: DECLINED, call closed. ③ cargo/Rust: INSTALLED → C5 MEASURED = 33/35 agree + 2 documented LST-CONF-FORMAT divergences (the JSON Schema 2020-12 format-assertion fork; one-class-one-direction encoding, anything else fails) + 0 disagreements, exit 0, clean-PATH reproducible. ④ corpus license: DEFERRED to the Pub gate.** Gates: **Codex cross-model DISCHARGED (SHIP)** — batch BLOCK 1P1+2P2+1P3 → all reconciled red-green (the P1 was real: `~/.cargo/bin` off the default PATH made the oracle skip-as-success in fresh shells — proven red-green in Codex's own sandbox) → confirming pass → final narrow confirm SHIP **with its raw on the record** (the acceptance-gate refused the first, unrecorded narrow confirm — correctly); **independent acceptance-gate: BLOCK narrow (evidence-completeness only; it recomputed the metrics itself — κ to 12 decimals — and called the substance sound + the DEFER honest on every surface) → both pre-committed flip conditions discharged with raws → SHIP** (`docs/reviews/gate-2026-07-05-f1b-live-slice.md`; W1 flip precedent; its 4 advisories folded same-session). **verify exit 0 = 737 passed + 6 skipped; test:legacy 306+5; F1a goldens byte-unchanged; deslop 1/100.** Records: `docs/reviews/{f1b-live-slice-record.md, codex-2026-07-05-f1b-live-slice.md (+3 raws), f1b-live-wiring-verify-evidence.log, gate-2026-07-05-f1b-live-slice.md}`. Seat events raw: 2 Codex background launches externally stopped (root cause: the CLI blocked on a never-closing background stdin — fixed `< /dev/null`); the first gate launch died mid-run on the subagent seat limit ("You've hit your session limit · resets 8:30pm (America/New_York)") — the owner-confirmed retry completed; advisor() down 12th consecutive session.
>
> **▶▶ RESUME DIRECTIVE (owner, 2026-07-05 — read FIRST):** on a bare **`resume`** (or `continue` / `go`) in a NEW session, run the Mandatory Startup Contract, then **report: NOTHING IS QUEUED — the only remaining plan §5 slice is Pub, which is OWNER-GATED — and STOP.** Do NOT re-run the classifier calibration (the split is exposed; a retry needs a NEW pre-registration AND the owner's explicit word). Owner-gated hard stops still bind: Pub/public posting · deploy (deferred until design fixed) · push (no remote) · name adoption (S-11) · any new live arming. If the owner explicitly asks for Pub, treat it as a fresh owner-gated slice: plan §5 Pub scope + the license decision (O6, deferred to that gate) + the em-dash style note (M1 advisory) + the full ceremony (per-slice gate → Codex batch → acceptance-gate).
>
> *(The block below is the prior session's handoff — superseded by the block above.)*
>
> **▶▶ M2 DISCHARGED — THE F1 FEE-AUDIT MODULE IS ACCEPTED; NEXT = OWNER DECISIONS (2026-07-04, eleventh session — SUPERSEDED by the twelfth-session block above).** The M2 full ceremony ran and closed: batched Codex over the whole F1 module (`c864618..bda6314`, read-only `gpt-5.5`@`xhigh`, seat `SEAT_OK`) → **BLOCK 2P1+2P2+1P3** (scope items: ClaimSource `"classifier"` additive-only CONFIRMED · the reviewer-executed F1b red-greens CONFIRMED "real teeth" · c-2 pass-through REFUTED as a silent boolean escape hatch vs the rule table · the ≥0.90 floor REFUTED as admitting a baseline tie vs AM-7) → frontier-advisor pre-verdict consult (PROCEED, 3 rulings, no overturns; first launch died on the seat limit — raw: "You've hit your session limit · resets 11:30pm (America/New_York)"; owner-confirmed retry succeeded) → **all 5 reconciled primary-model-final + red-green, committed `550e3cb`** (new non-gating `asserted-passthrough-unverified` FeeVerdict state · classifier accuracy floor amended PRE-RUN to **≥20/21, tie = DEFER** · mixed-month parser rejection · statement-position `L<i>` claim-id tags with a sanctioned golden regeneration whose byte-deltas were verified claim-id/tally-only · drift-lock extended to `kind`+`source_clause`) → mapped confirming pass **ALL FIVE DISCHARGED** (+1 residual P3 stale-E-1-comment fix) → **independent acceptance-gate SHIP, all five gates PASS** (its no-Bash verify leg ran as a live handoff, returned raw: verify exit 0 **720+5** · test:legacy exit 0 **306+5** · statement fixtures byte-unchanged · listings/legacy/gold untouched · deslop 0/100; its tripwired e1 test-count discrepancy resolved BENIGN — two pre-commit-transient F1a builder-tree tests, never committed, honesty note in the batch record; lesson routed to `~/claude-os/tasks/lessons.md`). Gate-4 advisory nits (stale `finding.ts:63` field comment · object-identity lineIndex · `#`-in-category id parseability) deliberately LEFT for the next slice per the gate's commit-as-is terms. Records: `docs/reviews/{codex-2026-07-04-m2-f1-batch{,-raw},codex-2026-07-04-m2-f1-confirm-raw,m2-reconcile-evidence.log,gate-2026-07-04-m2-f1-module}`. advisor() down 11th consecutive session.
>
> **▶▶ OWNER DECISIONS NOW OPEN (the build stops here — nothing fires without your word):**
> 1. **ARM the live classifier run** (UNBLOCKED by M2 SHIP; surfaced, NOT started): `docs/plan-f1b-classifier.md` §3 — Groq free tier (**$0**, not metered), K=3 at temp 0, TPD preflight + pacing (the A3-7 depletion lesson carried), scored ONLY on the held-out 21-item test split against the PRE-REGISTERED floors (accuracy **≥20/21 — strictly beating the pinned 19/21 baseline; tie = DEFER** [amended pre-run at M2] · macro precision ≥0.85 · per-class recall ≥0.70 all labels, ≥0.80 on the two baseline-missed classes · flip-rate ≤0.15 · κ ≥0.60). Below any floor → the label honestly DEFERS; reported as-is; the bar never moves.
> 2. **Gemini demo color variant** — arm or decline (≤$0.50 of the ≤$5 cap; non-load-bearing).
> 3. **cargo/Rust toolchain** for the C5 oracle-agreement measurement (still UNMEASURED locally; past the decide-by-D1 horizon).
> 4. **Corpus license** (O6 — packaged, not published).
>
> **▶▶ RESUME DIRECTIVE (owner, 2026-07-04 — read FIRST):** on a bare **`resume`** (or `continue` / `go`) in a NEW session, run the Mandatory Startup Contract, then **re-surface the four owner decisions above and STOP** — no further autonomous build work is queued (the remaining plan §5 slice, Pub, is owner-gated). ONLY if the owner's message explicitly ARMS the live classifier run, execute the prompt below. Owner-gated hard stops still bind (live LLM runs/spend arming · deploy [deferred until design fixed] · public posting · push · name adoption).
>
> ### ▶ Paste-ready prompt — LIVE CLASSIFIER RUN (fires ONLY on the owner's explicit arming word)
>
> ```
> Resume ActivationOps AI — OWNER-ARMED live classifier run (docs/plan-f1b-classifier.md §3; M2 SHIP per docs/reviews/gate-2026-07-04-m2-f1-module.md; F1 module accepted at 550e3cb; verify green 720+5, test:legacy 306+5). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
>
> ROUTE + JUDGE (doctrine 2026-07-03): FABLE seat = orchestrator/FINAL JUDGE; frontier-advisor at commitment boundaries (try harness advisor() first — down 11 straight sessions, surface if still down); Codex = adversarial input, reconciled primary-model-final. Seat-limit deaths: raw error verbatim; one owner-confirmed retry; then NO-WAIT per precedent.
>
> THE RUN (spec-adherence to plan §3 — the floors are PRE-REGISTERED and IMMOVABLE): Groq free tier via GROQ_API_KEY (gitignored .env — never read/print the real file; ENABLE_LIVE_AI as CLI override only, .env stays false); TPD preflight (scripts-ts/groq-preflight.mjs) BEFORE any call; wire the designed LIVE_CLASSIFIER_DESIGN lane exactly as specced (leak-free ClassifierInput ONLY — no answer key, no trueCategory, no §7 class reaches the model); K=3 at temp 0 per item; the TUNE split may be used for prompt-shape sanity ONLY (no floor/threshold moved on it); then ONE scored pass on the HELD-OUT 21-item test split; compute the ported metrics (accuracy, per-class P/R/F1 + Wilson, macro κ, flip-rate) and judge vs the §3.1 floors VERBATIM (accuracy ≥20/21 STRICTLY beats the 19/21 baseline; tie = DEFER). Outcomes: floors cleared → claim per R-DHON-3 wording only; any floor missed → the label DEFERS, report honestly, NEVER re-run to green on the same split, NEVER amend a floor post-hoc; provider-degraded → diagnostic, not enshrined (bail rule). Freeze the run record (snapshot + status doc per the A3-7/domain-judge pattern), then: verify green + ONE Codex changed-files review via codex-guarded + acceptance-gate if the diff is ship-gating + state-doc sync + commit (authorized) with push HELD.
> HELD: everything else — Gemini color (separate owner call) · deploy · public posting · push (no remote) · name adoption (S-11). Legacy suite stays green (306+5); differential-oracle semantics untouched. At wrap: surface newly-discovered owner-unknowns (standing practice).
> ```
>
> *(The block below is the prior session's handoff — superseded by the block above.)*
>
> **▶▶ F1 OFFLINE CORE DONE — NEXT = M2 CEREMONY (2026-07-04, tenth session — SUPERSEDED by the eleventh-session block above).** F1a (`896ab59`, the fees deterministic spine: statement schema · frozen corpus · 17-rule drift-lock [11 predicates + 6 registered non-checkable] · U1 structural provisionality · e-1 refund-window verdict states · CLI `fees` leg · C6 measured 5/6-deterministic-of-6-injected) and F1b (`bda6314`, the classification layer: leak-free classifier seam · AM-7 anti-theater baseline PINNED 19/21 held-out · N=42 stratified gold set 21/21 composition-locked · metrics port · advisory audit path via claim.source `"classifier"` · PRE-REGISTERED R-DHON-3 floors in `docs/plan-f1b-classifier.md` — LLM lane DESIGNED, NOT WIRED) both shipped at the per-slice gate. **verify GREEN 715+5; test:legacy 306+5.** frontier-advisor consulted pre-approach AND pre-wrap; pre-wrap RULING: **M2 runs NOW over the offline module; the owner-gated live classifier run is BLOCKED on M2 SHIP** (deciding risk: the F1b inline documentation tail weakened maker≠judge inside the Claude lane — the cross-model gate restores it). Deviations on decision-log 2026-07-04 (builder died twice: seat limit → owner-confirmed resume; then "API Error: Overloaded" → NO-WAIT inline tail, W1 precedent). Records: `docs/reviews/{f1a,f1b}-slice-record.md` + evidence logs. **OPEN OWNER CALLS: arm the live classifier run (post-M2; $0 Groq; floors pre-registered) · Gemini demo color (≤$0.50) · cargo/Rust for C5 (PAST the decide-by-D1 horizon — decide at M2) · corpus license (O6).**
>
> **▶▶ RESUME DIRECTIVE (owner, 2026-07-04 — read FIRST):** when the owner types a bare **`resume`** (or `continue` / `go`) in a NEW session, EXECUTE THE PROMPT BELOW VERBATIM — do NOT wait for a paste, do NOT re-ask, do NOT re-plan the fixed roadmap. Run the Mandatory Startup Contract, then proceed straight into the M2 ceremony under the ROUTE + JUDGE rules. Owner-gated hard stops still bind (live LLM runs/spend arming · deploy [deferred until design fixed] · public posting · push · name adoption); surface a genuine blocker or an owner gate, otherwise keep going.
>
> ### ▶ Paste-ready resume prompt — M2 CEREMONY (fresh session; auto-fires on a bare `resume`)
>
> ```
> Resume ActivationOps AI — M2 FULL CEREMONY over the F1 fee-audit module (docs/plan-truth-audit-execution.md v1.0 §5; F1a 896ab59 + F1b bda6314 DONE at the per-slice gate; verify green 715+5, test:legacy 306+5; records docs/reviews/{f1a,f1b}-slice-record.md + evidence logs). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
>
> ROUTE + JUDGE (owner rulings 2026-07-03/04, decision-log; routing doctrine 2026-07-03 ADOPTED): session seat = FABLE 5 as orchestrator/FINAL JUDGE; consult frontier-advisor at commitment boundaries (try harness advisor() first — down 10 straight sessions, surface if still down). Codex = adversarial input, reconciled primary-model-final, never blind-obeyed. Seat-limit deaths: raw error verbatim; one owner-confirmed retry; then NO-WAIT converts per precedent.
>
> M2 = ONE batched Codex changed-files review via ~/claude-os/bin/codex-guarded over the WHOLE F1 module (the 896ab59 + bda6314 diffs; smoke-test the seat first; surface raw errors verbatim; never silently retry/downgrade/switch accounts). THE SCOPE MUST EXPLICITLY ENUMERATE (advisor-ruled, decision-log 2026-07-04): (a) the verifier-core ClaimSource union gained "classifier" (the one shared-core touch — verify additive-only, no listings surface affected); (b) the F1b red-green cycles were REVIEWER-executed after the builder died (docs/reviews/f1b-verify-evidence.log — independently re-verify the teeth); (c) the statutory logic (monthly-average∨per-order, e-1 windows, c-exclusion, U1 markers) vs docs/research/uc1-rule-table.md; (d) the leak-free ClassifierInput contract + pre-registered floors (no ground-truth leakage, no moveable bar). Reconcile ALL findings primary-model-final + red-green; THEN the independent acceptance-gate subagent over the module; record both in docs/reviews/.
>
> AFTER M2 SHIP: surface the OWNER-GATED live classifier run plan (docs/plan-f1b-classifier.md §3: Groq $0, K=3 temp-0, pre-registered floors, TPD pacing) and STOP for the owner's word — the live run is BLOCKED on M2 SHIP and on that word. Also surface at session start (open owner calls): arm live classifier run · Gemini demo color (≤$0.50) · cargo/Rust for C5 (past horizon — decide at M2) · corpus license (O6).
> Gate: verify green stays the floor; every accepted finding fixed red-green. At wrap: surface newly-discovered owner-unknowns (standing practice).
> HELD: live LLM spend arming (Groq included — owner word first) · deploy (DEFERRED until design fixed) · public posting · push (no remote) · name adoption (S-11). Legacy suite stays green (306+5); differential-oracle semantics untouched.
> ```
>
> *(The block below is the prior session's handoff — superseded by the block above.)*
>
> **▶▶ D1 SCRIPTED CORE DONE — NEXT = F1 (2026-07-03, ninth session — SUPERSEDED by the tenth-session block above).** The demo slice shipped and passed the per-slice gate (plan §5 D1): a deterministic transcript engine (`lib/packs/listings/demo/`) whose every verdict is COMPUTED from the real verifier + conformance entry points (mutation red-green executed), a machine-verified SOR-BLIND scripted actor, a strict-flag CLI `demo` leg with byte-frozen goldens, a `/demo` Static one-pager (SIMULATED banner; renders the committed transcript JSON that a test byte-asserts against the live engine output — the web provably cannot drift from the real verifier), the honesty gate extended (C7 claim verbatim single-sourced; "agent gets caught" framing machine-banned with a bites-check), and the conformance-foil beat computed live ("passes the official schema check; still lies"). Both M1 gate advisories folded in. Route ran per doctrine: frontier-advisor PROCEED pre-approach (shape C + 4 constraints, all landed) → implementer@opus build → Fable-equivalence PASS (independent verify re-run; RG ×4 authenticated) → elevation (corpus README now indexes the demo goldens). Records: `docs/reviews/{d1-slice-record.md,d1-verify-evidence.log}`. **verify GREEN 557 passed + 5 skipped; test:legacy 306+5.** **OPEN OWNER CALLS: (1) demo Gemini color variant — arm or decline (≤$0.50; non-load-bearing; annotation slot ready); (2) cargo/Rust toolchain (C5 oracle agreement UNMEASURED — the decide-by-D1 horizon is here); (3) corpus license (O6).**
>
> **▶▶ RESUME DIRECTIVE (owner, 2026-07-03 — read FIRST):** when the owner types a bare **`resume`** (or `continue` / `go`) in a NEW session, EXECUTE THE PROMPT BELOW VERBATIM — do NOT wait for a paste, do NOT re-ask, do NOT re-plan the fixed roadmap. Run the Mandatory Startup Contract, then proceed straight into F1 under the ROUTE + JUDGE rules. Owner-gated hard stops still bind (live LLM runs/Gemini spend arming · deploy [deferred until design fixed] · public posting · push · name adoption); surface a genuine blocker or an owner gate, otherwise keep going.
>
> ### ▶ Paste-ready resume prompt — BUILD F1 (fresh session; auto-fires on a bare `resume`)
>
> ```
> Resume ActivationOps AI — BUILD MODE, F1 slice (docs/plan-truth-audit-execution.md v1.0 §5; wedge module ACCEPTED at 0eda64c; D1 scripted core DONE — verify green 557+5, test:legacy 306+5; records docs/reviews/d1-slice-record.md). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
>
> ROUTE + JUDGE (owner rulings 2026-07-03, decision-log; routing doctrine dated 2026-07-03 ADOPTED): session seat = FABLE 5 as orchestrator/planner/FINAL JUDGE. Execution DELEGATED via the implementer lane (model="opus" for subtle slices); consult frontier-advisor at every commitment boundary (pre-approach, pre-verdict, pre-wrap; try the harness advisor() tool first — it has been down 9 straight sessions, surface if still down). EVERY delegated slice gets the FABLE-EQUIVALENCE review on return (line-level diff · live npm run verify re-run · red-green demanded) THEN the ELEVATION pass (reversible fixes applied directly; same-breath PLAIN-ENGLISH/GLOSSARY check). Seat-limit deaths: raw error verbatim; one owner-confirmed retry; then NO-WAIT converts per precedent (W1).
>
> F1 per plan §5 + C8 (spec-adherence; escalate ambiguity): UC-1 build on the P1 rule table (docs/research/uc1-rule-table.md, 17 rules VERIFIED-primary; U1 purchase-price base = the named open dependency — base-derived verdicts stay provisional per the GLOSSARY note): statement schema + seeded synthetic fee-statement generator (taxonomy §7 fee-line classes, simulated-labeled) + deterministic parser + LLM line-item classifier design + stratified gold set (tune/test split, evals/gold/ patterns) + judge-recalibration plan (R-DHON-3 bar; no "calibrated" claim below the pre-registered floor). BUILD OFFLINE-FIRST ($0): all machinery, mocks, gold sets, metrics math, red-green. ANY live LLM run (Groq classifier/judge or Gemini) = OWNER-GATED — surface the run plan + cost estimate and STOP for the owner's word. The fee report follows the C2 guard (claim · reference-row · rule-id · severity).
>
> SURFACE AT SESSION START (open owner calls): demo Gemini color variant (arm/decline, ≤$0.50) · cargo/Rust for C5 (horizon reached) · corpus license (O6).
> Gate: per-slice = verify green + red-green (S-4). After F1: M2 full ceremony (ONE batched Codex via codex-guarded + independent acceptance-gate over the F1 module). At wrap: surface newly-discovered owner-unknowns (standing practice).
> HELD: live LLM spend arming (Groq runs included — owner word first) · deploy (DEFERRED until design fixed) · public posting · push (no remote) · name adoption (S-11). Legacy suite stays green (306+5); differential-oracle semantics untouched.
> ```
>
> *(The block below is the prior session's handoff — superseded by the block above.)*
>
> **▶▶ M1 DISCHARGED — THE WEDGE MODULE IS ACCEPTED; NEXT = D1 (2026-07-03, eighth session — SUPERSEDED by the ninth-session block above).** W3 shipped (`54124ff`: `/report` one-page two-register web view + machine-JSON CLI contract + corpus packaged license-pending; Fable-equivalence PASS + 3 elevation fixes incl. the documented-but-unparsed `--json` and a W2-era spawn-test flake caught by the independent verify re-run). The **M1 full ceremony ran and closed**: batched Codex over the whole wedge module (`gpt-5.5`@`xhigh`, ~2.77M tokens → BLOCK 1 P1 + 4 P2 + 2 P3; all six W1 claims + the conformant-but-false headline CONFIRMED) → all 7 reconciled + red-green (`7962810`: CLI mixed-mode exclusion · C3 answer-key made exactly truthful via the drift-013 split + a NEW completeness invariant · C6 per-entry teeth · claimSource receipt · exactly-one set-equality · C10 scan+wording · surplus positionals) → mapped confirming pass **ALL SEVEN DISCHARGED** + 1 residual P3 (`--op` on the truth leg) fixed red-green (`0eda64c`) → **independent acceptance-gate SHIP — the listings-truth wedge module is ACCEPTED at `0eda64c`; W1's conditional stamp SUPERSEDED** (`docs/reviews/gate-2026-07-03-m1-wedge-module.md`; its 2 engineering advisories fold into D1). **verify GREEN 515+5; test:legacy 306+5.** **ROUTING DOCTRINE (dated 2026-07-03) ADOPTED on owner direction** (decision-log row): `frontier-advisor` = the working advisor leg (**first successful consult in 8 sessions**, at the M1 boundary), `implementer` = the delegated-execution lane, Fable-equivalence = the doctrine's top-model-final bar. **OPEN OWNER CALLS: cargo/Rust (C5 oracle agreement UNMEASURED locally — decide before/at D1) · corpus license (O6).** Standing wrap practice (owner, 2026-07-03): surface newly-discovered owner-unknowns at each wrap.
>
> **▶▶ RESUME DIRECTIVE (owner, 2026-07-03 — read FIRST):** when the owner types a bare **`resume`** (or `continue` / `go`) in a NEW session, EXECUTE THE PROMPT BELOW VERBATIM — do NOT wait for a paste, do NOT re-ask, do NOT re-plan the fixed roadmap. Run the Mandatory Startup Contract, then proceed straight into D1 under the ROUTE + JUDGE rules. Owner-gated hard stops still bind (Gemini spend arming · deploy [deferred until design fixed] · public posting · push · name adoption); surface a genuine blocker or an owner gate, otherwise keep going.
>
> ### ▶ Paste-ready resume prompt — BUILD D1 (fresh session; auto-fires on a bare `resume`)
>
> ```
> Resume ActivationOps AI — BUILD MODE, D1 slice (docs/plan-truth-audit-execution.md v1.0 §5; W0/P1/W1/W2/W3/M1 ALL DONE — the wedge module is ACCEPTED at 0eda64c, gate record docs/reviews/gate-2026-07-03-m1-wedge-module.md; verify green 515+5, test:legacy 306+5). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
>
> ROUTE + JUDGE (owner rulings 2026-07-03, decision-log — the UPDATED routing doctrine ~/claude-os/docs/MODEL-ROUTING.md dated 2026-07-03 is ADOPTED): session seat = FABLE 5 as orchestrator/planner/FINAL JUDGE. Execution DELEGATED via the implementer lane (model="opus" escalation for the D1 build — subtle, demo-bearing slice); consult frontier-advisor at every commitment boundary (pre-approach, pre-verdict, pre-wrap). EVERY delegated slice gets the FABLE-EQUIVALENCE review on return (line-level diff · live npm run verify re-run — it caught a real flake last session · red-green demanded) THEN the ELEVATION pass (reversible fixes applied directly; same-breath PLAIN-ENGLISH/GLOSSARY check). Seat-limit deaths: raw error verbatim; one owner-confirmed retry; then NO-WAIT converts per precedent (W1).
>
> D1 per plan §5 + C7 (spec-adherence; escalate ambiguity): scripted SPEC-FAITHFUL simulated agent on the drifted corpus — demo claim VERBATIM (Codex amendment 6): "a spec-faithful simulated agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch" (never "the agent gets caught" as headline); demo ends at agent-selects-the-drifted-item (slice-C cut, no fake checkout); labeled "spec-faithful demonstration actor — simulated"; scripted replay $0 deterministic; + the conformance-foil beat ("passes the official schema check; still lies" — the conformant-but-false.json exhibit). GEMINI COLOR VARIANT = OWNER-GATED: get the owner's word BEFORE arming ENABLE_LIVE_AI (≤$0.50 of the ≤$5 cap; non-load-bearing; may fail visibly). FOLD IN the 3 M1-gate advisories: dead third clause in listings-differential-c3.test.ts covers(); adopt report-view-c1's resolver in cli-c1's import walk (@/ alias hole); em-dash density = Pub-slice owner note (no action now).
>
> SURFACE AT SESSION START (open owner calls): cargo/Rust toolchain for C5 oracle measurement (decide before/at D1 close) · corpus license (O6). Gate: per-slice = verify green + red-green (S-4). After D1: F1 (UC-1 build) → M2 full ceremony.
> HELD: Gemini spend arming · deploy (DEFERRED until design fixed) · public posting · push (no remote) · name adoption (S-11). Legacy suite stays green (306+5); differential-oracle semantics untouched. At wrap: surface newly-discovered owner-unknowns (standing practice, owner 2026-07-03).
> ```
>
> *(The block below is the prior session's handoff — superseded by the block above.)*
>
> **▶▶ W1-GATE + W2 DONE — NEXT = W3 → M1 (2026-07-03, seventh session — SUPERSEDED by the eighth-session block above).** The seventh session executed both queued items. **(1) W1 named obligation DISCHARGED** (`08c9299`): independent acceptance-gate on the W1 diff (first launch died on the seat limit — raw: "You've hit your session limit · resets 3:10pm (America/New_York)"; owner confirmed reset; relaunch completed) → verdict **BLOCK, narrow** (engineering core confirmed "at the fable-equivalence bar"; all six W1 claims verified file:line; the RG log authenticated by independent failure-count recount) → both flip conditions closed same session (P2-1 UCP-fixture freeze-lock extended + red-green; P2-2 raw verify evidence executed live) → **SHIP conditional on the M1 Codex batch**. Record: `docs/reviews/gate-2026-07-03-w1-wedge.md`. **(2) W2 DONE** (`1d0697e`; Opus builder per ROUTE+JUDGE; Fable-equivalence review PASS + elevation applied): ajv 8.20.0 (intake-noted) over the **78 pinned official UCP schemas** (spec repo `ucp` tag `v2026-04-08` — divergence from the `ucp-schema` repo recorded; per-file sha256 + provenance + Apache-2.0 LICENSE; **source-lockfile L6 RELOCKED**); `LST-CONF-*` conformance family through the same C2 guard; CLI `--conformance` leg (exit 0/1/2 unchanged; C1 holds; $0-LLM import-graph eval still green); **N=35 seeded CI corpus** (14 valid + 21 invalid, 8 violation classes, byte-frozen); **THE HEADLINE machine-checked** — `fixtures/ucp-conformance-ci/valid/conformant-but-false.json` PASSES ajv conformance yet the truth leg catches its price lie (new third adapter `ucpSearchResponseToClaims`, strengthens C3); ACP 18/18 field rules isolated red-green; all 7 W1-gate P3 advisories landed; RG ×7 in `docs/reviews/w2-verify-evidence.log`; slice record `docs/reviews/w2-slice-record.md` (builder escalations E-1..E-6 ALL ACCEPTED on Fable review; elevation added the fixture shape-honesty note + the PLAIN-ENGLISH row the builder missed). **verify GREEN exit 0 = 478 passed + 5 skipped; test:legacy 306+5 unchanged.** **OPEN OWNER CALL: cargo/rustc NOT installed → C5 official-oracle agreement UNMEASURED locally** (`npm run test:ucp-oracle` skips loud, exit 0) — install the Rust toolchain (poppler precedent) or accept measurement elsewhere; decide by M1. advisor unavailable (7th consecutive session).
>
> **▶▶ RESUME DIRECTIVE (owner, 2026-07-03 — read FIRST):** when the owner types a bare **`resume`** (or `continue` / `go`) in a NEW session, EXECUTE THE PROMPT BELOW VERBATIM — do NOT wait for a paste, do NOT re-ask, do NOT re-plan the fixed roadmap. Run the Mandatory Startup Contract, then proceed straight into W3 and the M1 ceremony under the ROUTE + JUDGE rules. Owner-gated hard stops still bind (Gemini spend arming · deploy [deferred until design fixed] · public posting · push · name adoption); surface a genuine blocker or an owner gate, otherwise keep going.
>
> ### ▶ Paste-ready resume prompt — BUILD W3 + M1 CEREMONY (fresh session; auto-fires on a bare `resume`)
>
> ```
> Resume ActivationOps AI — BUILD MODE, W3 slice + M1 ceremony (docs/plan-truth-audit-execution.md v1.0 §5; W0/P1/W1/W1-gate/W2 DONE + committed 1b04766/da1e2e7/5a81440/08c9299/1d0697e; verify green 478+5, test:legacy 306+5). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
>
> ROUTE + JUDGE (owner rulings 2026-07-03, decision-log): session seat = FABLE 5 as orchestrator/planner/FINAL JUDGE; execution DELEGATED to Opus 4.8 @ xhigh builder subagents (one coherent builder per slice). EVERY delegated slice gets the FABLE-EQUIVALENCE review on return (line-level diff review · live npm run verify re-run · red-green demanded · PASS/route-back/fix as final call) THEN the post-check ELEVATION pass (reversible fixes applied directly — include the same-breath PLAIN-ENGLISH/GLOSSARY check; the W2 builder missed it). If a builder dies on the seat limit: raw error verbatim; one owner-confirmed retry; if still blocked, NO-WAIT converts to inline Fable execution WITH the deviation recorded + an acceptance-gate obligation named (precedent: W1).
>
> W3 per plan §5 (spec-adherence; escalate ambiguity): ONE-PAGE REPORT (web view in the Next.js console, desktop-only per the 2026-07-02 constraint, + machine JSON — same data, two registers; findings already carry plainLine) + CORPUS PACKAGING per C4/C9 (fixtures/synthetic-restaurant/ + fixtures/ucp-conformance-ci/ as the publishable corpus; license stays OWNER CALL — package for publication, do NOT publish; Pub is owner-gated). Legibility = HARD constraint (S-9: the drift report itself meets the documentation standard; the report needs no explanation).
>
> THEN M1 FULL CEREMONY (wedge module done): ONE batched Codex changed-files review via ~/claude-os/bin/codex-guarded over the whole wedge module (W1 5a81440 [its gate record demands the cross-model leg — SHIP is conditional on it] + 08c9299 + 1d0697e + the W3 diff) — smoke-test the seat first, surface raw errors verbatim, never silently retry/downgrade/switch accounts; reconcile primary-model-final; THEN the independent acceptance-gate subagent over the whole module; record both in docs/reviews/. Surface at M1 if still undecided: the cargo/Rust owner call (C5 oracle agreement UNMEASURED locally).
>
> Gate: per-slice = verify green + red-green (S-4). After M1: D1 (demo — scripted spec-faithful agent on the drifted corpus; ANY live Gemini spend needs OWNER WORD first, ≤$0.50 of the ≤$5 cap).
> HELD: Gemini spend arming · deploy (DEFERRED until design fixed — owner 2026-07-03) · public posting · push (no remote) · name adoption (S-11 checks first). Legacy suite stays green (test:legacy 306+5); differential-oracle semantics untouched.
> ```
>
> *(The block below is the prior session's handoff — superseded by the block above.)*
>
> **▶▶ W0+P1+W1 DONE — NEXT = W2 (2026-07-03, sixth session — SUPERSEDED by the seventh-session block above).** The build session executed all three queued slices, each Fable-judged at the equivalence bar + elevated, each committed (push HELD, no remote): **W0** `1b04766` (§6 restructure — verifier skeleton in; activation archived runnable at `legacy/activation/`, `npm run test:legacy` 306+5; ledger `docs/restructure-w0-ledger.md`) · **P1** `da1e2e7` (NYC §20-563.3/LL79 codified on PRIMARY text — 17 rules, effective date RESOLVED became-law 2025-05-31/effective 2025-06-30; `docs/research/{ll79-source-memo,uc1-rule-table}.md` + `.draft.json` + `source-lockfile.md` seeded; U1 "purchase price" base = the F1 dependency) · **W1** `5a81440` (the wedge — seeded synthetic SOR, faithful+drifted ACP feeds, constructed UCP response fixtures, deterministic comparator, C2-guarded evidence model, one-command $0-LLM CLI `bin/check.mjs`; C3 one-comparator-two-adapters incl. ID-mismatch + modifier-ambiguity; C6 measured 8/8; RED-GREEN ×4 in `docs/reviews/w1-verify-evidence.log`). **verify GREEN exit 0 = 409 passed + 5 skipped.** THREE owner rulings recorded 2026-07-03 (decision-log): Fable-equivalence review on every delegated slice · post-check ELEVATION mandate · **deploy deferred until design is fixed**. **DEVIATION on record:** W1 was executed INLINE on the Fable seat (the Opus subagent seat hit its limit twice — raw: "You've hit your session limit · resets 7:40am / 2:30pm (America/New_York)"; NO-WAIT applied) → **NAMED OBLIGATION: an independent `acceptance-gate` pass on the W1 diff once the subagent seat resets (≥2:30pm ET 2026-07-03), before or at M1.** advisor unavailable (6th session).
>
> **▶▶ RESUME DIRECTIVE (owner, 2026-07-03 — read FIRST):** when the owner types a bare **`resume`** (or `continue` / `go`) in a NEW session, EXECUTE THE PROMPT BELOW VERBATIM — do NOT wait for a paste, do NOT re-ask "should I continue?", do NOT re-plan the fixed roadmap. Run the Mandatory Startup Contract, then proceed straight into the W1 acceptance-gate obligation and the W2 slice under the ROUTE + JUDGE rules below. Owner-gated hard stops still bind (Gemini spend arming · deploy [deferred until design fixed] · public posting · push · name adoption); surface a genuine blocker or an owner gate, otherwise keep going.
>
> ### ▶ Paste-ready resume prompt — BUILD W2 (fresh session; auto-fires on a bare `resume`)
>
> ```
> Resume ActivationOps AI — BUILD MODE, W2 slice (docs/plan-truth-audit-execution.md v1.0 §5; W0/P1/W1 DONE + committed 1b04766/da1e2e7/5a81440, verify green 409+5). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
>
> ROUTE + JUDGE (owner rulings 2026-07-03, decision-log): session seat = FABLE 5 as orchestrator/planner/FINAL JUDGE; execution DELEGATED to Opus 4.8 @ xhigh builder subagents (one coherent builder per slice). EVERY delegated slice gets the FABLE-EQUIVALENCE review on return (line-level diff review · live npm run verify re-run · red-green demanded · PASS/route-back/fix as final call) THEN the post-check ELEVATION pass (capability-utilization audit + blindspot fixes, reversible changes applied directly). If a builder dies on the seat limit, surface the raw error verbatim; one owner-confirmed retry; if still blocked, NO-WAIT converts to inline Fable execution WITH the deviation recorded + an acceptance-gate obligation named (precedent: W1, decision-log 2026-07-03).
>
> FIRST (named obligation, if not yet discharged): run the independent acceptance-gate subagent on the W1 diff (commit 5a81440) — maker=judge mitigation for the inline build. Record SHIP/BLOCK in docs/reviews/.
>
> THEN W2 per plan §5 (spec-adherence; escalate ambiguity): own ajv validation over the published UCP schemas + recorded live-catalog response fixtures (C3 leg) + official `ucp-schema` composed IN CI as a differential oracle (never a runtime dependency — C1 one-command constraint holds; cargo-only Rust tool — if the toolchain is absent, gate it behind an optional CI lane and ESCALATE the reading, don't improvise). C5: agreement with `ucp-schema validate` on N≥30 CI fixtures; ACP checks red-green per extracted field rule. NOTE: ajv is NOT yet an npm dependency — a new dep needs the source-intake note in the slice record (mature OSS, MIT, named in plan §3) — record the intake, don't skip it.
> Gate: per-slice = verify green + red-green (S-4). Then W3 (one-page report + corpus packaging) → M1 full ceremony (ONE batched Codex changed-files review via ~/claude-os/bin/codex-guarded + acceptance-gate over the whole wedge module, incl. the W1 obligation if still open).
>
> HELD: Gemini spend arming · deploy (DEFERRED until design fixed — owner 2026-07-03) · public posting · push (no remote) · name adoption (S-11 checks first). Legacy suite stays green (test:legacy 306+5); differential-oracle semantics untouched.
> ```
>
> *(The block below is the prior session's handoff — superseded by the block above.)*
>
> **▶▶ BUILD IS LIVE (2026-07-02, fourth session, late — SUPERSEDED by the 2026-07-03 block above).** The owner gave GO ("do it… build working prototype now") + three rulings recorded in the decision-log: **NO-WAIT doctrine** (wait-states → inline checks or alternative sources), **REAL-FIRST data doctrine** (real specs/laws/latest-past public data where ToS-clean; synthetic labeled fills the rest), **O4 DCWP comment = consciously declined**. Executed same session: **S0 committed** (`a65064b` S-5 close-out with provenance caveat · `fb20eba` pivot plan-stage docs; verify green 306+5 at commit) and **G8 crux gate RAN INLINE → PASS** (`docs/reviews/gate-2026-07-02-g8-crux.md`: the UCP catalog spec puts the copy layer IN-PROTOCOL — no SOR requirement, no accuracy SLA; the independent seat is unoccupied; the buyer claim consciously declined). **THE PROGRAM = `docs/plan-truth-audit-execution.md` v1.0 GO.** Remaining S0 tail: the §6 repo restructure (execute as W0, first step of the build session). Standing constraints: desktop web only · free-tier + Gemini ≤$5 · honesty rules · push HELD (no remote) · name adoption gated on S-11 live checks.
>
> ### ▶ Paste-ready resume prompt — BUILD W0+W1 (fresh session)
>
> ```
> Resume ActivationOps AI — BUILD MODE, the verifier program is GO (docs/plan-truth-audit-execution.md v1.0; G8 PASSED; S0 committed a65064b/fb20eba). Run the Mandatory Startup Contract (RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; Professional Process Applied block with Effort). Re-derive git state live.
>
> ROUTE + JUDGE (owner rulings, 2026-07-03; decision-log rows same date; AMENDED at session wrap — owner picked the DELEGATION rendering): session seat = FABLE 5, as ORCHESTRATOR · PLANNER · FINAL JUDGE (all gate verdicts, reconciliations, and stage-exit calls are made on the Fable seat and are the FINAL CALL — primary-model-final binds to Fable specifically). EXECUTION IS DELEGATED, never done on the Fable seat: W0/W1/P1 build slices → Opus 4.8 @ xhigh subagents (one coherent builder per slice, conservative-for-write); Sonnet/Haiku only for equivalence-qualified mechanical/read fan-outs per the MODEL-ROUTING down-tier floor. Judgment delegates (acceptance-gate, council, security, evals) explicit fable override — never inherited. Codex stays adversarial INPUT (cross-model gate unchanged, never skipped). Fable holds a standing full-liberty license for blindspot fixes/refinements toward a standout project — owner-gated hard stops (spend/deploy/push/public/name) still bind. Blindspot answers carried forward: poppler INSTALLED (owner-ordered 2026-07-03, v26.06.0 — PDF extraction open for P1); harness scaffolding gitignored; verify re-grounded EXIT 0 on 2026-07-03.
>
> DONE — do NOT redo: research (ADDENDUM+CORRECTION) · council (RESHAPE-PROCEED) · Codex direction gate (12/12 reconciled) · owner GO + NO-WAIT + REAL-FIRST + desktop-only rulings (decision-log 2026-07-02) · S0 commits · G8 PASS.
>
> EXECUTE IN ORDER (spec-adherence mode — the plan is fixed; escalate ambiguity, don't improvise):
> W0 = the §6 restructure: lib/verifier-core/ + lib/packs/{listings,fees}/ + legacy/activation/ (archive-don't-delete, tests runnable via separate script) + fixtures/synthetic-restaurant/ + bin/ CLI entry; keep npm run verify green throughout (the 306 tests keep passing from legacy/ or are consciously migrated — record which).
> W1 = the wedge per plan §4/§5: synthetic restaurant SOR (Square Catalog API shape) + ACP feed generator + drift injector keyed to the §7 taxonomy + deterministic comparator + evidence model (C2: claim·reference-row·rule-id·severity, no finding without all four) + one-command CLI (C1, $0-LLM asserted) + C3 surface-agnostic (static ACP feed AND recorded live UCP catalog-response fixtures; ≥1 ID-mismatch + ≥1 modifier-ambiguity class; matching-mode label in every report).
> P1 (parallel, same session where it fits) = UC-1 rule-table codification: §20-563.3 full text via ALTERNATIVE sources (NYC.gov PDFs / intro.nyc LL79 PDF [poppler INSTALLED 2026-07-03 (owner-ordered, v26.06.0; `pdftotext` verified) — PDF extraction path OPEN] / vlex / NY senate — amlegal 403s WebFetch), resolve the 2025-05-31 vs 06-30 effective-date conflict on primary text, emit the codified rule table + the LL79 source memo.
> Gates: per-slice = verify green + red-green (S-4); full Codex batch + acceptance-gate at M1 (wedge module done). 14-day build-slip + 30-day external-signal tripwires live.
>
> HELD: Gemini spend (demo only, ≤$0.50 of the ≤$5 cap — get owner word before arming ENABLE_LIVE_AI) · deploy · public posting · push (no remote) · product-name adoption (S-11 checks first).
> ```
>
> *(The blocks below are prior-session lineage — superseded by the block above.)*
>
> **▶▶ SESSION WRAP (2026-07-02, third session — READ THIS BLOCK + ITS PROMPT FIRST; it SUPERSEDES every resume prompt below).** The reframe is ACCEPTED FOR PLANNING, all standing directives + the documentation system are durable (decision-log 2026-07-02 ×3 latest rows; `docs/suggestions-ledger.md` S-1..S-10; `docs/{PLAIN-ENGLISH,documentation-standard,GLOSSARY}.md`), state docs are synced, and the session is CUT losslessly at the owner's direction. **A bare `resume` in a NEW session = execute the PIVOT PLAN STAGE prompt below** (goal mode, owner-gates held; do NOT wait for a paste, do NOT re-ask). It validates the REFRAMED direction — not the old prototype-SaaS framing, and NOT the suspended slice-2 live re-run.
>
> ### ▶ Paste-ready resume prompt — PIVOT PLAN STAGE, REFRAMED (fresh session; supersedes all prompts below)
>
> ```
> Resume ActivationOps AI — PIVOT PLAN STAGE (REFRAMED direction), goal mode, owner-gates HELD. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item).
>
> DONE — do NOT redo: pivot research (docs/research/pivot-research-2026-07.md + use-case-backlog.md); owner picked the composite with UC-2 LEADING; then (2026-07-02, decision-log latest rows) the owner ACCEPTED-FOR-PLANNING the REFRAME — UC-2's lead artifact = an OPEN ACP/UCP conformance + truth-audit toolkit ("the truth layer for agentic commerce") + a self-referential demo (a real AI agent caught ordering from a deliberately-drifted synthetic menu); UC-1 fee-cap audit = module two on the same verifier. Read docs/suggestions-ledger.md (S-1..S-10) — S-4 (module-boundary Codex ceremony), S-5 (slice-2 close-out as capability lineage), S-9 (drift report itself meets the documentation standard) are PENDING and must be folded into the plan surfaced for owner GO.
>
> STANDING DIRECTIVES (owner — binding on this stage): independent-judgment license through planning (add suggestions to the ledger in the same breath); legibility = HARD artifact constraint (one-command validator, one-page report, demo needs no explanation); data = free/open + live (ToS-clean ONLY: public specs, own sandboxes, merchant-permissioned) + hybrid + synthetic, edge cases as an ENUMERATED taxonomy with measured eval coverage (never claim "all"); everything free/free-tier except Gemini ≤$5; demo agent = scripted or Gemini-driven, never Claude/Codex as runtime; two-register documentation per docs/documentation-standard.md (update PLAIN-ENGLISH.md + GLOSSARY.md same-breath); intent frame = benefit the industry, company-agnostic, platforms as indirect beneficiaries.
>
> TASK = take the REFRAMED direction to a buildable, owner-approvable plan: (1) UC-2 primary reads — ACP spec text (developers.openai.com/commerce: feed format, refresh cadence, MUST/SHOULD conformance surface) + UCP publication status (Google+Square, announced 2026-07-01; AAIF/W3C watch) + surface-access legality map (green/yellow/red: public specs / own sandbox / merchant-permissioned vs ToS-walled) + operator-voice pass (last30days: r/restaurantowners etc. — menu drift, sync failures, wrong-price orders); NYC LL79/§20-563.3 + AB 578 primary texts = module-two prep, lighter. (2) Council deep-validation ("agents gather to evaluate") on the REFRAMED direction (sequential, shared_reasoning.md). (3) MANDATORY Codex cross-check via ~/claude-os/bin/codex-guarded on the reframed pivot (consequential — the direction is DECIDED only after this). (4) THEN the declarative plan + roadmap: success criteria + acceptance tests, slices, module-boundary gates (per S-4 if owner accepts), verification-spine reuse map, the repo-restructure proposal, edge-case taxonomy v1, demo storyboard, and the S-5/S-9 owner calls. Surface the whole plan for owner GO before ANY build.
>
> Owner-gated stops HELD: live spend (≤$5), deploy, public posting, git push (no remote), platform-name, the restructure execution, the final pivot ratification.
> ```
>
> *(The blocks below are same-day lineage — superseded by the block above.)*
>
> **▶▶ SESSION UPDATE (2026-07-02, LATER — REFRAME ACCEPTED FOR PLANNING + STANDING PLAN-STAGE DIRECTIVES; the plan stage now validates the REFRAMED direction).** On the owner's explicit "independent judgment, full liberty" ask, Claude proposed and the owner ACCEPTED (for planning — gates unchanged): **UC-2's lead artifact = an OPEN ACP/UCP conformance + truth-audit toolkit ("the truth layer for agentic commerce") + a self-referential demo (a real AI agent caught ordering from a deliberately-drifted synthetic menu)** — instead of a merchant-facing prototype SaaS; UC-1 stays module two unchanged. **Standing directives (owner, decision-log 2026-07-02 ×2, last rows):** (a) independent-judgment license through research/planning until build, then spec-adherence; (b) **legibility = hard design constraint on the artifact** (one-command validator, one-page report, demo needs no explanation — complex inside, simple outside); (c) data spans free/open + live (ToS-clean only) + hybrid + synthetic; edge cases = enumerated taxonomy + measured eval coverage (never "all"); (d) all free/free-tier except Gemini ≤$5; demo agent = scripted or Gemini-driven, never Claude/Codex as runtime. **NEW durable artifacts + standing rules: `docs/PLAIN-ENGLISH.md`** (layman explainer, updated in the same breath as every meaningful change) **+ `docs/documentation-standard.md` + `docs/GLOSSARY.md`** (owner directive, decision-log 2026-07-02 last row: two-register documentation — professional terminology leads, decoded via first-use explanations + the glossary, never diluted; Diátaxis/Minto-SCQA/C4/ADR/docs-as-code as the floor-not-ceiling; visuals+text paired; resonance by narrative never hype; same-breath maintenance). `advisor` tool unavailable again this session (surfaced). **The plan-stage resume prompt below still applies WITH these amendments: council + Codex validate the REFRAMED direction; the UC-2 primary reads (ACP/UCP specs + surface-access legality + operator-voice pass) are unchanged and now even more central; two Claude secondary suggestions to fold into the plan surfaced for GO: module-boundary Codex ceremony (vs per-slice) + closing out the suspended slice-2 diff as committed capability lineage.**
>
> **▶▶ SESSION UPDATE (2026-07-02 — PIVOT RESEARCH STAGE DONE; ACTIVE = OWNER PICKS THE CANDIDATE → then plan/roadmap in a FRESH session). THIS BLOCK SUPERSEDES the 2026-06-29 RESUME DIRECTIVE below — a bare `resume` must NOT fire the slice-2 live re-run while the pivot is active.** The owner re-opened the pivot (2026-07-01, `/claude-os` → `/enhance`): find a real, high-value, **structurally** underexplored problem in the DoorDash/Uber Eats/Grubhub-class US delivery-marketplace industry (company-agnostic), solved by a vertical AI solution at **adoption-grade prototype** standard. **FIXED OBJECTIVE (owner-settled 2026-07-02):** showcase-first venture-ready · prefer-reuse of the verification spine (evidence can override) · "adoption" = the quality bar (metaphorical), adopter = a research output · constraints unchanged (prototype-not-service, $5 cap, honesty rules). Research ran plan-mode-approved (2 quarantined threads, ~100 sources; first launch died on the seat session-limit — raw error surfaced, no silent retry, relaunched post-reset; `advisor` tool unavailable this session, surfaced). **THE RANKED DIGEST = `docs/research/pivot-research-2026-07.md`** — #1 fee-statement/fee-cap compliance audit (LEAD-POTENTIAL: HungryPanda $875K NYC enforcement 2026-04 + FTC docket FTC-2026-0463; searched-and-empty for any product; counterparty-adverse = durable) · #2 cross-surface menu/price truth verification incl. AI-agent surfaces (LEAD-POTENTIAL early: Square ChatGPT/Claude ordering 2026-07-01; syncer≠judge; independent-verifier seat empty) · ★ composite "marketplace truth-audit layer" (both threads converged; #1 wedge, #2 growth) · H1 dispute automation CONTESTED (Loop $14M Series A + DoorDash ToS prohibits third-party dispute submission) · H2 refund-abuse + driver-side AVOID. Decision-log row 2026-07-02; task-log updated; NO product code changed. **SLICE-2 close-out is SUSPENDED by this redirect** (uncommitted slice-2 diff intact on disk; its live-re-run authorization stands only if the owner explicitly redirects back). **NEXT GATE (owner): pick #1 / #2 / composite / reject all → THEN the plan stage.** **→ RESOLVED same session: the owner PICKED the COMPOSITE with the FEE-AUDIT WEDGE (decision-log 2026-07-02, 2nd row). ACTIVE = the PLAN stage per the resume prompt below (fresh session recommended — this one ran long).**
>
> ### ▶ Paste-ready resume prompt — PIVOT PLAN STAGE (after the owner picks a candidate; fresh session)
>
> ```
> Resume ActivationOps AI — PIVOT PLAN STAGE. Run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; git status + git log --oneline -8; show the Professional Process Applied block with an Effort item).
>
> DONE — do NOT redo: the pivot research stage (2026-07-02). The fixed objective + ranked candidates live in docs/research/pivot-research-2026-07.md (+ decision-log 2026-07-02 ×2). THE OWNER PICKED (2026-07-02, via AskUserQuestion; order FLIPPED later same day — decision-log 3rd row): the COMPOSITE "marketplace truth-audit layer" with **UC-2 LEADING** — slice one = cross-surface/agent-facing menu-price-availability TRUTH VERIFICATION (each listed/agent-visible datum = a claim → deterministic verify vs POS/catalog system-of-record → calibrated-judge-verified → evidence-cited drift report → human-gated corrections; ACP/UCP-standards-aligned); slice two = UC-1 fee-statement/fee-cap audit (same engine, money-lines domain). The pick is "accepted for planning" — treat as DECIDED only after this plan stage's council + Codex gates. Adjust the plan-stage to-dos accordingly: for UC-2 the primary reads are the ACP/UCP spec texts + surface-access legality; the NYC LL79/AB578 bill texts move to module-two prep.
>
> INTENT FRAME (owner, 2026-07-02 — steer the plan with it): demonstrate deep AI proficiency to the industry by BENEFITING it (platforms = indirect beneficiaries; positioning = "marketplace integrity infrastructure"); company-agnostic; lean/optimized/structured builds (existing-system redesign in scope); the local repo MAY be restructured per the fixed goal (propose the restructure in the plan; execute only after owner GO). The full use-case backlog (UC-1..UC-9, independently workable later) = docs/research/use-case-backlog.md.
>
> TASK = take the picked candidate to a buildable, owner-approvable plan: (1) run the digest's standing to-dos for that candidate (primary bill/spec texts — NYC LL79/§20-563.3, AB 578, ACP/UCP specs; Reddit first-person pass via last30days; video teardowns where flagged); (2) council deep-validation ("agents gather to evaluate") on the picked direction; (3) Codex cross-check via ~/claude-os/bin/codex-guarded on the pivot recommendation (consequential — REQUIRED before the pivot is treated as decided); (4) THEN a declarative plan + roadmap (success criteria + acceptance tests, slices, gates), reusing the verification spine (claim extraction → deterministic check vs structured records → human gate → audit → calibrated judges → cost ledger) unless evidence overrode. Surface the plan for owner GO before any build. NOTE: slice-2 of the old roadmap stays SUSPENDED (uncommitted diff intact) — ask the owner whether to fold, commit, or drop it during planning.
>
> Owner-gated stops HELD: live spend (≤$5), deploy, public posting, git push (no remote), platform-name, the pivot decision itself.
> ```
>
> *(The blocks below are the SUSPENDED multi-agent-build handoff — slice-2 close-out held mid-flight by the pivot redirect. Retained as lineage; do not execute from them unless the owner redirects back.)*
>
> **▶▶ SESSION UPDATE (2026-06-29, slice-2 close-out — STEP 1 of 2 DONE; STEP 2 HELD on a fresh window).** The OFFLINE half of the owner's Option 1 is **done + gated**: the load reduction landed harness-only in `evals/agent-loop.live.test.ts` — a **pre-registered, OUTCOME-BLIND 4 tune + 4 test subsample** (one item per failure mode per split, lowest-definition-order, **original splits preserved**, `maxIterations=3` kept) + an **offline composition unit test** that machine-checks the rule. **`npm run verify` GREEN — 306 passed (+1) + 5 skipped** (the live test still auto-skips offline). The deliverable-B **success criterion was reframed** (pre-registered + advisor-cross-checked; **FLAG at the batched Codex review**): a clean run = **detection === N** (the HARD gate; degraded fails loudly), and **`test ≥ K` is now a REPORTED measurement, not a hard pass/fail** (at reduced N, K is coarse and one genuine non-convergence can land the floor red on an otherwise-clean run — that is a complete authoritative result, never recomposed to go green). K asserted only non-vacuous. Pre-registration: `docs/a3-7-live-run-status.md` → "SLICE 2 CLOSE-OUT — PRE-REGISTRATION". **STEP 2 (the live re-run) is HELD: the Groq daily window is NOT fresh** — the 2026-06-29 run depleted today's daily window; preflight 2026-06-29 15:26 UTC showed TPM 99.1% but that does NOT reflect the daily (TPD) budget; Groq's exact reset semantics are **UNVERIFIED-from-memory (RULES §6)** but the window is not fresh today either way (depletion was hours ago, same UTC day; expected reset ~2026-06-30 00:00 UTC). **NEXT = a FRESH-DAY session: confirm the window is genuinely fresh, then run the already-authorized live re-run (≤$5; will be ~$0.02) → gate the whole slice-2 diff (verify green → ONE batched Codex review → acceptance-gate) → commit (owner-authorized) → push HELD.** Do NOT auto-fire the live spend overnight on calendar inference alone. The uncommitted slice-2 diff now also includes the harness load-reduction + the status-doc pre-registration (re-derive via `git status`). The resume prompt below still applies; the only change is STEP 1 is already done.
>
> **▶▶ RESUME DIRECTIVE (read FIRST) — when the owner types `resume` (or `continue` / `go`) in a NEW session:** run the Mandatory Startup Contract (read RULES.md, CLAUDE.md, PROJECT_STATE.md, CURRENT_TASK.md, HANDOFF.md, docs/enterprise-delivery-playbook.md; `git status` + `git log --oneline -8`), re-derive git state live, show the Professional Process Applied block (with an Effort item), then **EXECUTE THE SLICE 2 CLOSE-OUT autonomously** (goal mode) per the "SLICE 2 close-out" resume prompt below. The OWNER ALREADY CHOSE OPTION 1 (2026-06-29): **reduce per-run Groq load (harness-only subsample, balanced across the 4 failure modes, keep `maxIterations=3`) → confirm a FRESH Groq daily window → re-run live for a clean detection-full-N K → gate (verify → batched Codex → acceptance-gate) → commit (owner-authorized) → push HELD.** Do NOT wait for a paste and do NOT re-ask "should I continue?". **The live re-run is the ALREADY-AUTHORIZED slice-2 live spend (≤$5 cap)** — but HONOR the hard precondition: do the offline load-reduction + gate it first, CONFIRM the Groq window is genuinely fresh (a new day, zero prior usage — groq-preflight shows only TPM, not the daily counter), and STOP + surface if the window can't be confirmed fresh, if a run still degrades (detection < full-N), or if spend approaches $5. Other owner-gated hard stops still bind: deploy, public posting, `git push` (no remote), platform-name. Surface a genuine blocker or an owner-gate; otherwise keep going.
>
> **▶▶ ROADMAP SLICE 2 — CLEAN R-A3-9 LIVE RE-RUN EXECUTED (2026-06-29, owner GO). TWO deliverables, OPPOSITE outcomes. UNCOMMITTED; the batched Codex + acceptance-gate + commit are HELD pending the SLICE 2 CLOSE-OUT (owner chose option 1 — reduce load + fresh-window re-run). ▶ NEXT = the SLICE 2 close-out (resume prompt below): clean K → gate (verify GREEN 305+5 → batched Codex → acceptance-gate) → commit (owner-authorized) → push HELD. Deliverable A (drafter-reliability) is LIVE-CONFIRMED CLEAN and ships in that same commit.**
>
> **A — DRAFTER-RELIABILITY (the slice-1 fix's first LIVE test) → ✅ CONFIRMED, CLEAN.** The PRIMARY purpose of slice 2 is done: `final_redraft_live 16/16`, `final_redraft_fell_back 0`, **0/24 redrafts `finishReason=length`** (all `finishReason=stop`). The A3-7 ~75% structured-output parse-failure is **GONE** — the slice-1 fix (thinking `thinkingBudget=0` + `MAX_LIVE_OUTPUT_TOKENS` 2000→4096) works in production. **Advisor carry-forward ANSWERED:** the Drafter still EARNS its label under disabled thinking, MORE robustly (every converged draft live-authored; zero stub fallbacks on the final redraft). This sub-result is clean and committable regardless of B. RULES §6 re-anchored 2026-06-29 (gemini-2.5-flash $0.30/$2.50, matches the pinned table; newer 3.x Flash exists = a separate owner+Codex pick, not assumed). Cost **$0.0189** (« $5). `.env` never armed (`ENABLE_LIVE_AI=false`, CLI-override only, re-confirmed).
>
> **B — R-A3-9 AUTHORITATIVE CLEAN K → ⚠️ STILL INCOMPLETE (Groq-degraded again).** K is now REAL (tune 6/7=0.857 → **K=7**, not run #3's vacuous 1), but `degraded:true` (**detection 13/16**) and `test_meets_floor:false` (test 5/9 < 7) → NOT authoritative. The vitest floor assertion FAILED LIVE (5<7) — an HONEST degraded-run red, **NOT a code regression and NOT modified to pass** (the live test auto-skips offline; **`npm run verify` GREEN 305+5**, typecheck/build clean). The unmet floor is **substantially a degradation artifact**: of 4 test misses, **1 is a genuine non-convergence** (P-entity-2 — clean live redrafts, judge kept flagging → correctly HELD, not sent) and **3 are the Groq-depleted tail** (P-entity-3/P-capability-4/P-specific-4 — judge+domain `FAILED_TO_FALLBACK`; their *drafter* redrafts parsed fine). **NEW STRUCTURAL ROOT CAUSE:** the now-reliable drafter runs MORE live redrafts → MORE Groq judge/domain calls per run → one full 16-item×3-iter run depletes the Groq free-tier DAILY window on the tail (the binding constraint the advisor flagged — Groq window, not the $5 cap). "Fresh calendar day" was necessary but NOT sufficient. **Per the pre-committed bail rule: degraded → diagnostic — NOT enshrined as a pass, NOT blind-re-run on the now-depleted window.**
>
> **LABELS — UNCHANGED, all 3 DEFER (run-independent, re-confirmed).** Router ablation `signals_differ:0` again (23 live calls, structurally identical to `strongReflection`); Strategist DEFER by construction, Domain Critic DEFER by R-A3-8 cap, Router DEFER by the structural tie. Ledger "1 earned (Drafter) + 3 deferred". Do NOT re-litigate.
>

exec
/bin/zsh -lc "sed -n '1,220p' /Users/sharan_98/.codex/skills/gsd-code-review/SKILL.md" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
---
name: "gsd-code-review"
description: "Review source files changed during a phase for bugs, security issues, and code quality problems"
metadata:
  short-description: "Review source files changed during a phase for bugs, security issues, and code quality problems"
---

<codex_skill_adapter>
## A. Skill Invocation
- This skill is invoked by mentioning `$gsd-code-review`.
- Treat all user text after `$gsd-code-review` as `{{GSD_ARGS}}`.
- If no arguments are present, treat `{{GSD_ARGS}}` as empty.

## B. AskUserQuestion → request_user_input Mapping
GSD workflows use `AskUserQuestion` (Claude Code syntax). Translate to Codex `request_user_input`:

Parameter mapping:
- `header` → `header`
- `question` → `question`
- Options formatted as `"Label" — description` → `{label: "Label", description: "description"}`
- Generate `id` from header: lowercase, replace spaces with underscores

Batched calls:
- `AskUserQuestion([q1, q2])` → single `request_user_input` with multiple entries in `questions[]`

Multi-select workaround:
- Codex has no `multiSelect`. Use sequential single-selects, or present a numbered freeform list asking the user to enter comma-separated numbers.

Execute mode fallback:
- When `request_user_input` is rejected or unavailable, activate TEXT_MODE: append `--text` to `{{GSD_ARGS}}` so the workflow's built-in text-mode branching takes over. Present every `AskUserQuestion` call as a plain-text numbered list, then stop and wait for the user's reply. Do NOT pick a default and continue (#3018 / #3808).
- You may only proceed without a user answer when one of these is true:
  (a) the invocation included an explicit non-interactive flag (`--auto` or `--all`),
  (b) the user has explicitly approved a specific default for this question, or
  (c) the workflow's documented contract says defaults are safe (e.g. autonomous lifecycle paths).
- Do NOT write workflow artifacts (CONTEXT.md, DISCUSSION-LOG.md, PLAN.md, checkpoint files) until the user has answered the plain-text questions or one of (a)-(c) above applies. Surfacing the questions and waiting is the correct response — silently defaulting and writing artifacts is the #3018 failure mode.

## C. Task() → spawn_agent Mapping
GSD workflows use `Task(...)` (Claude Code syntax). Translate to Codex collaboration tools:

Direct mapping:
- `Task(subagent_type="X", prompt="Y")` → `spawn_agent(agent_type="X", message="Y")`
- `Agent(subagent_type="X", prompt="Y")` → `spawn_agent(agent_type="X", message="Y")`
- `Task(model="...")` → omit. `spawn_agent` has no inline `model` parameter;
  GSD embeds the resolved per-agent model directly into each agent's `.toml`
  at install time so `model_overrides` from `.planning/config.json` and
  `~/.gsd/defaults.json` are honored automatically by Codex's agent router.
- Resolved `reasoning_effort="low|medium|high|xhigh"` (`xhigh` is a GSD/Codex tier, not a generic runtime enum) → pass `reasoning_effort`
  to `spawn_agent` when the runtime/tool supports it. Omit missing, empty,
  inherited, or unsupported values; do not invent one-off effort literals in
  workflow prose.
- `fork_context: false` by default — GSD agents load their own context via `<files_to_read>` blocks
- `Task(isolation="worktree")` / `Agent(isolation="worktree")` → no direct Codex mapping.
  Codex `spawn_agent` does not create or bind a git worktree automatically.
  Workflows that require this isolation must fail closed or use an explicit
  manual worktree protocol before spawning (#3360).

Spawn restriction:
- Codex restricts `spawn_agent` to cases where the user has explicitly
  requested sub-agents. When automatic spawning is not permitted, do the
  work inline in the current agent rather than attempting to force a spawn.
- In some Codex sessions, multi-agent tooling can be deferred. If `spawn_agent`
  is not currently visible, discover tools first via `tool_search` before
  defaulting to inline execution.

Parallel fan-out:
- Spawn multiple agents → collect agent IDs → `wait(ids)` for all to complete

Result parsing:
- Look for structured markers in agent output: `CHECKPOINT`, `PLAN COMPLETE`, `SUMMARY`, etc.
- `close_agent(id)` after collecting results from each agent
</codex_skill_adapter>

<objective>
Review source files changed during a phase for bugs, security vulnerabilities, and code quality problems.

Spawns the gsd-code-reviewer agent to analyze code at the specified depth level. Produces REVIEW.md artifact in the phase directory with severity-classified findings.

Arguments:
- Phase number (required) — which phase's changes to review (e.g., "2" or "02")
- `--depth=quick|standard|deep` (optional) — review depth level, overrides workflow.code_review_depth config
  - quick: Pattern-matching only (~2 min)
  - standard: Per-file analysis with language-specific checks (~5-15 min, default)
  - deep: Cross-file analysis including import graphs and call chains (~15-30 min)
- `--files file1,file2,...` (optional) — explicit comma-separated file list, skips SUMMARY/git scoping (highest precedence for scoping)
- `--fix` (optional) — after review completes (or if REVIEW.md already exists), auto-apply fixes found. Spawns gsd-code-fixer agent. Accepts sub-flags:
  - `--all` — include Info findings in fix scope (default: Critical + Warning only)
  - `--auto` — enable fix + re-review iteration loop, capped at 3 iterations

Output: {padded_phase}-REVIEW.md in phase directory + inline summary of findings
</objective>

<execution_context>
@$HOME/.codex/gsd-core/workflows/code-review.md
</execution_context>

<context>
Phase: {{GSD_ARGS}} (first positional argument is phase number)

Optional flags parsed from {{GSD_ARGS}}:
- `--depth=VALUE` — Depth override (quick|standard|deep). If provided, overrides workflow.code_review_depth config.
- `--files=file1,file2,...` — Explicit file list override. Has highest precedence for file scoping per D-08. When provided, workflow skips SUMMARY.md extraction and git diff fallback entirely.

Context files (AGENTS.md, SUMMARY.md, phase state) are resolved inside the workflow via `gsd-tools query init.phase-op` and delegated to agent via `<files_to_read>` blocks.
</context>

<process>
This command is a thin dispatch layer. It parses arguments and delegates to the workflow.

Execute end-to-end.

The workflow (not this command) enforces these gates:
- Phase validation (before config gate)
- Config gate check (workflow.code_review)
- File scoping (--files override > SUMMARY.md > git diff fallback)
- Empty scope check (skip if no files)
- Agent spawning (gsd-code-reviewer)
- Result presentation (inline summary + next steps)
</process>

exec
/bin/zsh -lc "sed -n '1,220p' PROJECT_STATE.md" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
# Project State

Build update: 2026-07-06, fourteenth session (**GITHUB PUBLISH EXECUTED — the repo is LIVE PRIVATE at `github.com/sharanlabs/commerce-truth-audit` (main = `8f81b9e`, tracking origin; About description set); the PUBLIC FLIP is HELD by owner ruling.** Owner word (verbatim): "resume except design, github publish complete all other steps." — intent captured + committed pre-push (`8f81b9e` authorization row); design/deploy stay excluded; classifier retry stays unarmed (needs new pre-registration + explicit word); the four Pub defaults (interim name · Apache-2.0 · private-then-flip · internal-docs-as-is) are **RATIFIED by the directive**. Ceremony: advisor() down (14th consecutive session) → frontier-advisor consult **PROCEED-WITH-CONSTRAINTS** (parse confirmed; constraint = an identifier-exposure sweep before any public flip, since the 141-commit sanitization audit scoped SECRETS not privacy identifiers) → sweep run: tree carries only `/Users/sharan_98` paths inside internal transcripts (covered by the ratified as-is default); no handles/emails/secrets/workflows tracked; **git author email `sharank98@gmail.com` on all 144 commits = the surfaced finding** → put to the owner at the flip decision → **owner chose "Stay private for now"** (decision-log 2026-07-06 ×2). No product code changed; verify baseline unchanged (743+6 at `4489ad9`). **OPEN OWNER ACTS: ① flip PUBLIC when ready — one command: `gh repo edit sharanlabs/commerce-truth-audit --visibility public --accept-visibility-change-consequences` (timing anchor: NYC DCWP hearing July 16, 2026; NOTE: flipping publishes the author email permanently — an email rewrite must happen BEFORE the flip if wanted, and would invalidate every SHA-anchored gate record, needing a mapping note) · ② S-11 brand pick (repo rename is one `gh repo rename` later) · ③ design fix → deploy · ④ classifier retry only via new pre-registration + explicit word. NOTHING ELSE QUEUED.**)

Build update: 2026-07-06, thirteenth session (**PUB EXECUTED — THE PLAN §5 ROADMAP IS COMPLETE (every slice shipped and gated); the repo is publication-ready and COMMITTED (`4489ad9`); the private-repo push was DENIED by the harness permission layer (no recorded owner authorization — the bundled ask timed out) and is honestly returned to the owner as a one-command act (`gh repo create commerce-truth-audit --private --source=. --remote=origin --push`); the PUBLIC flip after that remains the owner's one-click act.** Owner word: "except design complete all other tasks. resume" — design/deploy excluded; classifier retry excluded (needs a new pre-registration + explicit word). Shipped: README fully replaced (truth-audit program fronted; legacy = lineage section, archived runnable) · `docs/PUBLICATION.md` writeup · `docs/demo-recording.md` (byte-identical live transcript) · LICENSE Apache-2.0 + NOTICE (O6 closed; C9 test updated red-green) · C10 honesty gate extended over the public prose (bit its author live; gate kept, prose reworded) · surface rename → "Commerce Truth Audit" (descriptive interim, NOT a brand adoption — S-11 open; "Assay" collided with assay.tools + squatted npm on the 2026-07-06 live screen) with a banner-only sanctioned golden regen · legacy CSV relocated + the python config regression it exposed fixed (35 py-tests green) · source-lockfile relocked (L4/L6/L8 + L12–L15 LOCKED live; Juniper DROPPED rather than published on secondary sourcing; used-facts audit = zero PENDING-RELOCK among used facts) · sanitization audit CLEAN (141 commits, .env never committed, zero secret patterns in history, licenses papered). Gates: **Codex chain SHIP** (BLOCK×4 → SHIP across 5 passes; effort deviation [batch @medium] recorded, later passes forced xhigh; deepest catch = the repo's own source-lock rule) + **acceptance-gate SHIP** (route-back none; verify-handoff condition discharged with raw tails; `docs/reviews/gate-2026-07-06-pub-slice.md`). Final: verify exit 0 = **743 passed + 6 skipped** · test:legacy **306+5** · python **35 passed**. Records: `docs/reviews/{codex-2026-07-06-pub-slice.md (+5 raws), pub-verify-evidence.log, gate-2026-07-06-pub-slice.md}`. Deviations on record: research subagents seat-limited twice (raws verbatim) → NO-WAIT inline conversion; harness advisor() down 13th consecutive session (frontier-advisor consult SUCCEEDED pre-approach: PROCEED-WITH-CONSTRAINTS, all rulings adopted). **OPEN OWNER ACTS: ① flip the repo public (timing anchor: NYC DCWP recordkeeping hearing, July 2026; skim docs/reviews/ first) · ② ratify the four defaults-taken (decision-log 2026-07-06) · ③ S-11 brand pick · ④ design fix → deploy · ⑤ classifier retry only via new pre-registration. NOTHING ELSE QUEUED.**)

Build update: 2026-07-05, twelfth session (**THE FOUR OWNER DECISIONS EXECUTED ("all four", decision-log 2026-07-05): ① the OWNER-ARMED LIVE CLASSIFIER RUN RAN — VERDICT: THE LABEL DEFERS.** The live Groq lane was wired (`lib/agents/fee-classifier.ts` — leak-free ClassifierInput-only prompt + static §20-563.3(d) rubric, schema-checked 5-label output, FAILED_TO_FALLBACK to the deterministic baseline, env-gated `groqLiveEnabled`, $0 by construction with NO paid branch; `LIVE_CLASSIFIER_DESIGN.wired→true` dated; the fees pack's zero-network proofs intact — the pack never imports the lane) and the pre-registered run executed. **Run #1 incident (honest record): all 84 calls completed then the results were LOST to a `writeFileSync` ENOENT (`lib/data/` moved at W0) BEFORE any metric printed — outcome-blind; harness fixed (probe-write BEFORE spend · freeze BEFORE assertions) → run #2 AUTHORITATIVE (degraded=false, zero fallbacks): held-out 20/21 = 0.952 (STRICTLY beats the pinned 19/21 baseline) · macro precision 0.971 · macro κ 0.944 · flip-rate 0.000 — but `enhanced_service_fee` recall 3/4 = 0.75 < the pre-registered ≥0.80 floor → per the conjunctive rule THE LABEL DEFERS** (no re-run, no floor change; the held-out split is EXPOSED + not re-scorable; any retry = a NEW owner-gated arming with fresh pre-registration). The one miss verbatim on record (relabel-test-2, unanimous ×3, coherent bundle-reading rationale). Frozen `lib/data/fee-classifier-calibration.snapshot.json` + eval-lock `evals/gold/fee-classifier-calibration.lock.test.ts` (verdict-tamper red-green executed DURABLY); status doc `docs/fee-classifier-calibration-status.md` (pre-registration pinned pre-run + incident + results + provenance addendum: floors committed pre-run `bda6314`/`550e3cb`, no-rerun rule `c73c100`, the two working-tree-only conventions provably outcome-invariant — 63/63 unanimous reps; no empty predicted class). **② Gemini demo color DECLINED (call closed, revivable only by owner word). ③ cargo/Rust INSTALLED (owner order, poppler precedent) → C5 MEASURED: `ucp-schema` 1.3.0 (latest crates.io) differential = 33/35 agree + 2 documented LST-CONF-FORMAT divergences (the JSON Schema 2020-12 format-assertion fork — we assert via ajv-formats, the official tool is annotation-only; encoded ONE class ONE direction, anything else fails) + 0 disagreements, exit 0, clean-PATH reproducible. ④ corpus license DEFERRED to the Pub gate (binds only at publication).** Gates: **Codex cross-model DISCHARGED (SHIP)** — batch BLOCK 1P1+2P2+1P3 (P1 = the ~/.cargo/bin PATH reproducibility hole, red-green proven in Codex's OWN sandbox; P2 = pre-registration provenance; P2 = plan contradictions; P3 = stale comments) → ALL reconciled primary-model-final → confirming pass (independently re-ran the oracle, verified provenance vs git history, recomputed unanimity; 3/4 + 1 residual + 1 new P3) → both fixed → final narrow confirm **SHIP re-run WITH its raw on the record** after the acceptance-gate refused the unrecorded first pass; **independent acceptance-gate: BLOCK narrow (evidence-completeness ONLY — "the substance is sound"; it recomputed the metrics itself, κ to 12 decimals, both invariance claims, the mechanical DEFER, and found the DEFER honest on every surface) → BOTH pre-committed flip conditions discharged with raws (the re-run narrow confirm + the raw suite tails/RG-4-durable/deslop appendix) → SHIP** (W1 flip precedent; `docs/reviews/gate-2026-07-05-f1b-live-slice.md`; its 4 advisories folded same-session). verify exit 0 = **737 passed + 6 skipped** (720→737: +12 offline, +1 skipped live harness, +5 lock); test:legacy 306+5; F1a goldens byte-unchanged; deslop 1/100 (one low nit recorded). Records: `docs/reviews/{f1b-live-slice-record.md, codex-2026-07-05-f1b-live-slice.md (+3 raws), f1b-live-wiring-verify-evidence.log, gate-2026-07-05-f1b-live-slice.md}`. Seat events raw on record: 2 Codex background launches externally stopped with 0 bytes / "Reading additional input from stdin..." (root cause: the CLI blocked on a never-closing background stdin → fixed `< /dev/null`) · the first acceptance-gate launch died mid-run on the subagent seat limit ("You've hit your session limit · resets 8:30pm (America/New_York)") → owner-confirmed retry completed · 1 transient harness classifier-unavailable error on a gate launch, retried clean · advisor() down 12th consecutive session (frontier-advisor consulted pre-approach: PROCEED-WITH-CONSTRAINTS, all 5 adopted). 2 lessons routed to `~/claude-os/tasks/lessons.md` (probe output paths before unrecoverable spend; COMMIT pre-registrations before arming). **NEXT = Pub (owner-gated, the last plan §5 slice) — nothing else queued; the session stops at the wrap. HELD: deploy (design-fix first) · public posting · push (no remote) · name adoption (S-11) · any new live arming (a classifier retry needs a NEW pre-registration + the owner's word).**)

Build update: 2026-07-04, eleventh session (**M2 DISCHARGED — THE F1 FEE-AUDIT MODULE IS ACCEPTED (acceptance-gate SHIP, all five gates PASS; reconciliation committed `550e3cb`). verify GREEN exit 0 = 720 passed + 5 skipped (715→720, +5 tests); test:legacy 306+5 unchanged; statement fixtures byte-unchanged; listings/legacy/gold untouched.** Ceremony per the resume directive: seat `SEAT_OK` → ONE batched Codex (`codex-guarded` read-only, `gpt-5.5`@`xhigh`) over `c864618..bda6314` with the four advisor-ruled scope items → **BLOCK 2P1+2P2+1P3** — scope (a) ClaimSource `"classifier"` additive-only **CONFIRMED**, (b) reviewer-executed F1b red-greens **CONFIRMED** ("real teeth by code structure"), (c) statutory logic REFUTED on ONE point (c-2 pass-through = a silent boolean escape hatch vs the rule table's equal-actual-charge+proof requirement), (d) floors REFUTED on ONE point (the ≥0.90 accuracy floor admitted a baseline TIE, contradicting AM-7). **frontier-advisor pre-verdict consult** (first launch seat-limited — raw: "You've hit your session limit · resets 11:30pm (America/New_York)"; owner-confirmed retry succeeded): PROCEED, 3 rulings, no overturns (advisory-warn over a fake-verifiability schema field · amend the floor upward pre-run · full lineId + conscious golden regen with a diff-scope check). **ALL 5 RECONCILED primary-model-final + red-green** (`docs/reviews/m2-reconcile-evidence.log`, RG-1..RG-4): (1) new `FeeVerdict` state **`asserted-passthrough-unverified`** — an over-3% transaction fee on the platform-ASSERTED c-2 flag surfaces as a non-gating warn (never silently cleared, never a violation; `ok` = false-iff-violation holds; tsc exhaustiveness caught the CLI record); (2) classifier accuracy floor AMENDED PRE-RUN to **≥ 20/21, tie = DEFER** (dated in the plan row; strengthening-only); (3) parser rejects mixed-month statements loudly; (4) per-line claim ids gained statement-position `L<i>` tags (audit + classifier advisory), answer-key `expectedClaimId`s matched, goldens CONSCIOUSLY regenerated via the seeded generator — byte-deltas verified claim-id/tally-key-only, freeze teeth demonstrated firing pre-regen; (5) drift-lock extended to `kind`+`source_clause`. **Mapped confirming pass: ALL FIVE DISCHARGED** + 1 residual P3 (the E-1 three-member comment made false by fix #1) fixed. **Independent acceptance-gate: SHIP 5/5** — it re-derived the monthly-average⟺both-bases proof itself, authenticated the whole Codex chain line-by-line, its no-Bash gate-3 ran as a verify HANDOFF executed live + returned raw (verify exit 0 720+5 · legacy exit 0 306+5 · diff-scope proofs empty where demanded · deslop advisory 0/100), and its tripwired e1 test-count discrepancy resolved BENIGN (the F1a log's "10" = two pre-commit-transient builder-tree tests, never committed; nothing deleted from any commit — honesty note added to the batch record; lesson routed to `~/claude-os/tasks/lessons.md`: re-run evidence-log counts at commit time). Gate-4 advisory nits (stale `finding.ts:63` field comment · object-identity lineIndex · `#`-in-category id parseability) deliberately LEFT for the next slice per the gate's commit-as-is terms. Records: `docs/reviews/{codex-2026-07-04-m2-f1-batch{,-raw},codex-2026-07-04-m2-f1-confirm-raw,m2-reconcile-evidence.log,gate-2026-07-04-m2-f1-module}`. advisor() down 11th consecutive session (the gate thread's advisor also down). **NEXT = OWNER DECISIONS — the session STOPS here: ① ARM the live classifier run, now UNBLOCKED by M2 SHIP (plan `docs/plan-f1b-classifier.md` §3: Groq free-tier $0 · K=3 at temp 0 · TPD preflight/pacing · scored ONLY on the held-out test split vs the pre-registered floors incl. the amended ≥20/21 · tie/loss = the label honestly DEFERS) — surfaced, NOT started; ② Gemini demo color variant (≤$0.50); ③ cargo/Rust toolchain for C5 (past horizon); ④ corpus license (O6). Remaining plan §5 slice after F1: Pub (owner-gated). HELD: live LLM spend arming · deploy (deferred until design fixed) · public posting · push (no remote) · name adoption (S-11).**)

Build update: 2026-07-04, tenth session (**F1 OFFLINE CORE SHIPPED — F1a (`896ab59`) + F1b (`bda6314`) both done at the per-slice gate (plan §5 F1, C8); verify GREEN exit 0 = 715 passed + 5 skipped (557→668→715); test:legacy 306+5 both slices.** Routing per doctrine: harness advisor() DOWN (10th consecutive session); `frontier-advisor` consulted at BOTH boundaries — pre-approach (PROCEED on shape B: two sequential dispatches, deterministic spine then classification layer, + 4 hardening constraints ALL landed: deterministic-only CLI leg honestly labeled · typed predicates drift-locked 1:1 vs the JSON twin · U1 provisionality STRUCTURAL · e-1 refund window as verdict state) and pre-wrap (ruling: **M2 runs NOW over the offline module; the owner-gated live legs are BLOCKED on M2 SHIP**). `implementer`@opus built both dispatches; Fable-equivalence PASS ×2 with live verify re-runs + reviewer-executed red-green. **F1a — the fees deterministic spine:** typed monthly-statement schema (integer cents, simulated-marked, declared-vs-true seam) · seeded byte-frozen corpus (faithful/drifted/cured/conditional + answer key with detection modes) · loud parser · the 17-rule NYC §20-563.3 table as typed predicates DRIFT-LOCKED to the JSON twin (11 implemented + 6 NON_STATEMENT_CHECKABLE with written reasons; set-equality both directions) · U1 purchase-price provisionality enforced by constructor (base-derived findings REQUIRE the marker; set derived from the twin) · §(e) refund-safe-harbor as encoded verdict states (violation/conditional-pending/cured; c excluded) · monthly-average∨per-order logic (reviewer PROVED monthly-fail ⟺ both statutory bases fail) · CLI `fees` leg (strict flags; honest "LLM classifier DEFERRED" label; $0-LLM import-graph proof) · C6 coverage MEASURED: 6/6 classes injected, 5/6 deterministic, relabeling honestly deferred-to-classifier. Elevation fix: the monthly-average DENOMINATOR undercount limitation documented (statement-invisible zero-fee orders bias the average toward flagging). **F1b — the classification layer:** leak-free `ClassifierInput` contract (no trueCategory/answer key reachable) · 5-label true-category vocabulary + documented §7 mapping · deterministic keyword baseline = the AM-7 anti-theater FLOOR, PINNED at **19/21 held-out** (its two misses are exactly the non-keyword-resolvable relabeling+bundling gold cases — the honest gap a live LLM must close) · **N=42 stratified gold set** (6 classes + clean × 3 tune + 3 test; disjoint; pinned IDs; composition-locked) · metrics port from legacy (conscious migration, provenance header; κ/flip-rate left behind until a consumer exists) · advisory `auditWithClassification` (candidates via the core C2 guard, claim.source `"classifier"` [the slice's ONE shared-core touch — additive union member, flagged for M2], separate never-gating array; F1a goldens byte-unchanged asserted twice over) · `docs/plan-f1b-classifier.md` with **PRE-REGISTERED R-DHON-3 floors** (beat baseline held-out accuracy; per-class recall ≥0.70 all labels, ≥0.80 on the two baseline-missed classes; K=3 temp-0; Groq $0; TPD pacing lesson carried) — **the LLM lane is DESIGNED, NOT WIRED; no live run without the owner's word; no "calibrated" claim below the floors.** Builder escalation E-1 ACCEPTED (advisory findings bypass FeeVerdict to keep F1a goldens byte-frozen — freeze-safety over literal wording). **DEVIATION RECORDED (decision-log 2026-07-04):** the F1b builder died TWICE (subagent seat limit, raw: "You've hit your session limit · resets 6pm (America/New_York)" → owner-confirmed resume completed the build; then "API Error: Overloaded" before the documentation tail) → NO-WAIT inline tail on the Fable seat (RG ×3 reviewer-executed — incl. one first mutation honestly recorded too-weak and strengthened — + evidence log + slice record + GLOSSARY +3 + PLAIN-ENGLISH row); mitigation = the M2 cross-model ceremony, whose scope MUST enumerate the ClaimSource touch + the reviewer-executed red-greens. Records: `docs/reviews/{f1a,f1b}-slice-record.md` + `{f1a,f1b}-verify-evidence.log`. **NEXT = M2 FULL CEREMONY (fresh session): ONE batched Codex via codex-guarded over the F1 module (`896ab59`+`bda6314`) + independent acceptance-gate → reconcile primary-model-final → THEN surface the owner-gated live classifier run (blocked on M2 SHIP).** OPEN OWNER CALLS: arm the live classifier run (post-M2; $0 Groq; floors pre-registered) · Gemini demo color variant (≤$0.50) · cargo/Rust for C5 (past the decide-by-D1 horizon) · corpus license (O6). HELD: live LLM spend arming · deploy (deferred until design fixed) · public posting · push (no remote) · name adoption (S-11).**)

Build update: 2026-07-03, ninth session (**D1 SCRIPTED CORE SHIPPED — the demo slice is DONE at the per-slice gate (plan §5 D1; verify GREEN exit 0 = 557 passed + 5 skipped, +42; test:legacy 306+5 untouched).** Routing ran per the adopted 2026-07-03 doctrine: Fable orchestrated/judged; the harness `advisor()` tool was UNAVAILABLE again (9th session — surfaced) but the doctrine's working leg `frontier-advisor` consulted SUCCESSFULLY at the pre-approach boundary (verdict: PROCEED on shape C — one deterministic transcript engine + two thin renderers — with 4 hardening constraints, ALL landed); the build was delegated to the `implementer` lane @ opus per the resume directive. **What shipped:** `lib/packs/listings/demo/` transcript engine (typed beats; every verdict COMPUTED from the real verifier/conformance entry points, never narrated — faithful-feed mutation flips the verdicts, executed red-green) · SOR-BLIND scripted actor (machine-verified: transitive import walk forbids `reference.ts` + all fixtures + the LLM ban set) · CLI `demo` leg on `bin/check.mjs` (strict flags, `--json` parsed for real, mixed/surplus exit 2; output byte-frozen to `expected-demo.{txt,json}` goldens) · `/demo` web one-pager (Static prerender, SIMULATED banner, two registers, renders the committed JSON that a test byte-asserts against the LIVE engine output — the web provably cannot drift from the real verifier) · honesty gate extended (C7 claim VERBATIM single-sourced in `copy.ts`; "agent gets caught" framing machine-banned across every demo file with a bites-check; C10 scan covers all demo surfaces incl. goldens) · conformance-foil beat computed live ("passes the official schema check; still lies" — conformance PASS + truth FAIL on the same document). Both M1 gate advisories folded: dead C3 `covers()` clause removed; `cli-c1` adopted the alias-capable resolver (blindness eval shares it). Builder escalations E-1..E-4 ALL ACCEPTED on Fable review (E-3 = a genuine honesty catch: the old PLAIN-ENGLISH demo paragraph used the banned framing + a "real AI agent" claim — corrected). ELEVATION: 1 fix applied directly (corpus README now indexes the demo goldens + demo-leg run instructions; c9+c10 re-run 65/65 green). RG ×4 executed (`docs/reviews/d1-verify-evidence.log`); slice record + Fable-equivalence PASS verdict in `docs/reviews/d1-slice-record.md`. **OPEN OWNER CALLS: (1) Gemini color variant of the demo — arm or decline (≤$0.50 of the ≤$5 cap; non-load-bearing; the transcript type already carries the annotation slot for it); (2) cargo/Rust toolchain (C5 oracle agreement STILL UNMEASURED locally — the "decide before/at D1" horizon is here); (3) corpus license (O6).** NEXT = **F1** (UC-1 build: statement parser + LLM line-item classifier vs the P1 rule table + judge recalibration + evidence-cited fee report, C8; offline machinery first — any live classifier/judge run stays owner-gated) → **M2 full ceremony**. HELD: Gemini spend arming · deploy (deferred until design fixed) · public posting · push (no remote) · name adoption (S-11).**)

Build update: 2026-07-03, eighth session (**W3 SHIPPED + M1 FULLY DISCHARGED — THE LISTINGS-TRUTH WEDGE MODULE IS ACCEPTED (acceptance-gate verdict SHIP at `0eda64c`). verify GREEN exit 0 = 515 passed + 5 skipped; test:legacy 306+5 unchanged.** (1) **W3** (`54124ff`, Opus builder per ROUTE+JUDGE, Fable-equivalence PASS + 3 elevation fixes applied directly): `/report` one-page web view (two registers, plain line leads every finding, four C2 receipts + claim source visible, C10 SIMULATED banner print-forced, prerenders Static) + machine-JSON CLI contract (`--json` parsed for real; unknown flags / surplus positionals / mixed modes all exit 2 loudly) + `fixtures/README.md` corpus index (both fixture sets, two labeled taxonomy axes, shape-honesty caveat verbatim, **License: pending owner decision** — O6, packaged NOT published). Elevation catches on record: documented-but-unparsed `--json` (RG-8) · report honesty wording (UCP tab = constructed simulation) · a W2-era spawn-test 20s-timeout flake the builder's own verify missed, caught by the independent Fable re-run. (2) **M1 ceremony COMPLETE — both legs**: batched Codex (`gpt-5.5`@`xhigh`, codex-guarded, ~2.77M tokens) over the whole module → **BLOCK 1 P1 + 4 P2 + 2 P3, with all six W1 claims + the conformant-but-false headline explicitly CONFIRMED** → ALL 7 reconciled + red-green (`7962810`): P1 = CLI mixed-mode exclusion (`--conformance` silently won over `--against` — asking both questions answered one); deepest = the C3 answer key made exactly truthful (drift-013 split into its two real effects with `sameMutationAs`; ONLY manifest bytes changed; NEW completeness invariant — every finding on each surface must be explained by a surface-labeled manifest entry; executed RED caught the exact reported defect on BOTH surfaces) + C6 per-entry teeth + claimSource rendered/locked + exactly-one set-equality + C10 scan/wording + surplus positionals → **mapped confirming pass: ALL SEVEN DISCHARGED** + 1 new residual P3 (`--op` accepted on the truth leg) fixed red-green (`0eda64c`) → **independent acceptance-gate: SHIP, all five gates PASS** (test-count chain 411→478→506→514→515 reconciled no-gaps; **W1's conditional stamp SUPERSEDED — the module is ACCEPTED at `0eda64c`**; 2 non-blocking advisories folded into D1: dead C3 test clause + cli-c1 resolver alias gap; em-dash style noted for Pub). Records: `docs/reviews/{codex-2026-07-03-m1-wedge-batch{,-raw}.md, m1-reconcile-evidence.log, gate-2026-07-03-m1-wedge-module.md}`. (3) **UPDATED ROUTING DOCTRINE (dated 2026-07-03) ADOPTED on owner direction** (decision-log row): `frontier-advisor` = the working advisor leg — **first successful advisor consult in 8 sessions** (PROCEED at the M1 reconciliation boundary; both directives honored: mapped confirming pass + sameMutationAs guard-limit recorded); `implementer` = default delegated-execution lane (opus escalation for subtle slices); the Fable-equivalence review = the doctrine's top-model-final acceptance bar. **Standing wrap practice (owner, 2026-07-03): surface newly-discovered owner-unknowns at every wrap** (memory saved). Seat events raw on record: the first acceptance-gate launch died on the subagent seat limit ("You've hit your session limit · resets 8:10pm (America/New_York)"); the owner-confirmed retry completed SHIP. **OPEN OWNER CALLS: cargo/Rust toolchain (C5 oracle agreement UNMEASURED locally — decide before/at D1) · corpus license (O6).** NEXT = **D1** (scripted spec-faithful demo agent on the drifted corpus + the conformance-foil beat "passes `ucp-schema validate`; still lies"; Gemini color OWNER-GATED ≤$0.50 of the ≤$5 cap; fold in the 3 gate advisories). HELD: Gemini spend arming · deploy (deferred until design fixed) · public posting · push (no remote) · name adoption (S-11).**)

Build update: 2026-07-03, seventh session (**W1 NAMED OBLIGATION DISCHARGED + W2 DONE, both committed (push HELD, no remote). verify GREEN exit 0 = 478 passed + 5 skipped; test:legacy 306+5 unchanged.** (1) The independent acceptance-gate ran on the W1 diff (`08c9299`) — first launch died on the subagent seat limit (raw verbatim: "You've hit your session limit · resets 3:10pm (America/New_York)"), owner confirmed the reset, relaunch completed. Verdict **BLOCK, narrow**: all six W1 engineering claims CONFIRMED at file:line ("at the fable-equivalence bar"), the RG log authenticated by independent failure-count recount; two flip conditions — P2-1 the corpus README's tamper-proof claim outran the freeze-locks (the two UCP fixtures + the manifest's ucpVersionSkew block unlocked; one exercised by zero tests) → FIXED by extending the freeze test (red-green executed), P2-2 "verify green" existed only as maker prose → raw evidence run live (verify exit 0; drifted exit 1; faithful exit 0; zero legacy/ paths in the W1 diff; Node v24.15.0) → record FLIPPED to **SHIP conditional on the M1 Codex batch** (`docs/reviews/gate-2026-07-03-w1-wedge.md`); its 7 P3 advisories folded into W2. (2) **W2** (`1d0697e`) built by the delegated Opus builder per ROUTE+JUDGE, **Fable-equivalence review PASS**: 78 official UCP JSON Schemas pinned from the authoritative spec repo (`ucp` tag `v2026-04-08`; the task expected them in `ucp-schema` — that is the Rust validator TOOL; divergence recorded in PROVENANCE + lockfile; per-file sha256, Apache-2.0, **source-lockfile L6 RELOCKED**); ajv 8.20.0 + ajv-formats 3.0.1 (exact-pinned, MIT, intake-noted) compile them `strict:false` = STRUCTURAL conformance (labeled bound; the UCP resolve step = the cargo oracle's job); `LST-CONF-*` findings flow through the SAME C2 guard (P3-3 tightened it: claim.source/field now required); the CLI gains a `--conformance` leg (exit 0/1/2 unchanged; C1 one-command holds; $0-LLM import-graph eval green + P3-5 fetch-scan added); **N=35 seeded byte-frozen CI corpus** (14 valid + 21 invalid across 8 violation classes); **THE PROGRAM HEADLINE IS NOW MACHINE-CHECKED** — `fixtures/ucp-conformance-ci/valid/conformant-but-false.json` PASSES ajv conformance yet the truth leg catches its price lie via the new third adapter `ucpSearchResponseToClaims` (E-4 scope-add, accepted — strengthens C3); ACP 18/18 field rules isolated red-green (`acp-field-rules.test.ts`); C10 platform-claims grep-gate implemented (`honesty-c10.test.ts`, P3-6); RG ×7 executed (`docs/reviews/w2-verify-evidence.log`); slice record with all six builder escalations E-1..E-6 ACCEPTED on Fable review (`docs/reviews/w2-slice-record.md`); elevation pass added the fixture shape-honesty note (W1's `ucp-catalog-response.*` = normalized truth-leg shape, NOT wire shape — fails conformance by design, recorded verbatim, nothing planted) + the same-breath PLAIN-ENGLISH row the builder missed. **OPEN OWNER CALL (decide by M1): cargo/rustc NOT installed → C5 official-oracle agreement UNMEASURED locally** (`npm run test:ucp-oracle` skips loud, exit 0; no agreement claimed) — install the Rust toolchain (poppler precedent) or accept measurement elsewhere. advisor UNAVAILABLE (7th consecutive session, surfaced). NEXT = **W3** (one-page report web+JSON + corpus packaging, C4/C9) → **M1 full ceremony** (ONE batched Codex via codex-guarded over the whole wedge module — W1's gate-SHIP is CONDITIONAL on it — + independent acceptance-gate). HELD: Gemini spend arming · deploy (deferred until design fixed) · public posting · push (no remote) · name adoption (S-11).**)

Build update: 2026-07-03, sixth session (**BUILD EXECUTED — W0 + P1 + W1 ALL DONE, GATED, COMMITTED (push HELD, no remote). verify GREEN exit 0 = 409 passed + 5 skipped; legacy suite independently green (`npm run test:legacy` 306+5).** Routing ran as ruled: Fable orchestrated/judged (THREE new owner rulings recorded in decision-log 2026-07-03: Fable-equivalence review bar on every delegated slice · post-check ELEVATION mandate (check→judge→elevate) · deploy DEFERRED until design is fixed), Opus builders executed W0 (`1b04766` — §6 restructure: verifier skeleton + `legacy/activation/` archive runnable, ledger `docs/restructure-w0-ledger.md`, elevation = C3 MatchingMode required on the report type) and P1 (`da1e2e7` — NYC §20-563.3/LL79 codified on primary text: 17 rules VERIFIED-primary; effective-date conflict RESOLVED = became-law 2025-05-31 / effective 2025-06-30 per LL79 §4; U1 "purchase price" base = the named F1 dependency; elevation = `docs/research/source-lockfile.md` seeded [Codex amendment 12] + GLOSSARY dedup/repair; Fable re-verified 6 load-bearing clauses against the raw extraction). **W1 (`5a81440`) EXECUTED INLINE on the Fable seat** — the delegated subagent seat hit its limit twice (raw verbatim: "You've hit your session limit · resets 7:40am / 2:30pm (America/New_York)"); owner confirmed the first reset (W0/P1 relaunch succeeded), the second (~4h) converted to inline build under NO-WAIT + full-liberty: seeded synthetic SOR (Square-shape subset, simulated) → faithful/drifted ACP feeds + constructed UCP catalog-response fixtures → deterministic comparator + C2-guarded evidence model (`makeFinding` — no finding without claim·referenceRow·rule·severity) → one-command CLI (`bin/check.mjs`, Node-24 native TS, exit 0 clean/1 drift/2 usage, $0-LLM proven STRUCTURALLY by an import-graph eval). C3 differential = ONE comparator, TWO adapters, shared drift set caught on both surfaces incl. the REQUIRED ID-mismatch + modifier-ambiguity classes; C6 coverage MEASURED 8/8 classes injected + 8/8 caught (overclaim scan live — it caught its own disclaimer, reworded); C9 corpus README (license = OWNER CALL at Pub; no LICENSE file exists); RED-GREEN ×4 executed (`docs/reviews/w1-verify-evidence.log`); freeze-integrity evals lock fixtures to the seeded generator. Injector defect caught+fixed mid-build (touched-set — drift stacking on the re-keyed row silently un-covered staleness). **DEVIATION RECORDED (decision-log 2026-07-03): maker=judge on W1 → NAMED OBLIGATION = independent acceptance-gate pass on W1 once the subagent seat resets (≥2:30pm ET); the M1 Codex batch additionally covers the whole wedge module (never skipped).** advisor UNAVAILABLE (6th consecutive session). NEXT = W2 (UCP ajv over published schemas + live-catalog response fixtures + `ucp-schema` CI differential oracle, plan §5) → W3 (one-page report + corpus packaging) → **M1 full ceremony (ONE batched Codex + acceptance-gate incl. the W1 obligation)**. HELD: Gemini spend arming · deploy (explicitly deferred until design is fixed, owner 2026-07-03) · public posting · push (no remote) · name adoption (S-11).**)

Build update: 2026-07-03, fifth session (**BOOT/HANDOFF ONLY — no product code. Stage confirmed = BUILD (W0→W1+P1, spec-adherence; plan v1.0 GO unchanged). TWO OWNER RULINGS RECORDED (decision-log 2026-07-03 ×2 + HANDOFF ROUTE+JUDGE line): (1) build-stage routing — execution seat = Opus 4.8 @ xhigh, judgment delegates always fable-override, owner tweaks the routing chart manually; (2) FABLE = FINAL JUDGE at every stage (all gate verdicts/reconciliations/stage-exits on the Fable seat; Codex stays adversarial input, never skipped) + standing full-liberty blindspot-fix license (hard stops unchanged: spend/deploy/push/public/name). Blindspot fixes applied: poppler INSTALLED at wrap (owner-ordered, v26.06.0, `pdftotext` verified — P1's PDF extraction path OPEN); harness scaffolding gitignored (.agents/, .claude/skills/, screenshots/, skills-lock.json, settings.local.json) so slice diff-gates stay clean; live `npm run verify` re-run EXIT 0 (baseline green re-grounded 2026-07-03). advisor UNAVAILABLE (5th consecutive session, surfaced verbatim). AMENDED at wrap (owner): DELEGATION rendering — the fresh session stays on FABLE as orchestrator/final judge; execution slices delegated to Opus 4.8 @ xhigh subagents (regime-2 auto-routing; HANDOFF ROUTE+JUDGE line updated). NEXT = fresh FABLE session → paste the HANDOFF "BUILD W0+W1" prompt.**)

Build update: 2026-07-02, fourth session FINAL (**OWNER GO → BUILD LIVE. S0 COMMITTED (`a65064b` slice-2 provenance close-out + `fb20eba` plan-stage docs + `c10766d` GO/G8 sync; verify green 306+5). G8 crux gate RAN INLINE → PASS** — UCP catalog spec: copy layer in-protocol (no SOR requirement, no accuracy SLA) ⇒ drift persists behind live reads; independent seat unoccupied (Feedonomics = syncer-not-judge); buyer claim consciously declined (`docs/reviews/gate-2026-07-02-g8-crux.md`). Owner rulings recorded: NO-WAIT · REAL-FIRST data · O4 DCWP declined · commits authorized (push HELD, no remote). **ACTIVE = W0 (restructure §6) → W1 (the $0-LLM wedge) + P1 (UC-1 rule-table via alternative sources) — paste-ready build prompt in HANDOFF; build stage = spec-adherence mode.** The fourth-session block below (ends "NEXT = OWNER GO") is superseded by this line.**)

Build update: 2026-07-02, fourth session (**PLAN-STAGE GATES RUN — council RESHAPE-PROCEED + Codex CONFIRM-WITH-AMENDMENTS (12/12 accepted); plan v1.0-rc awaiting OWNER GO. Docs only; no product code; slice-2 diff untouched.**) — Resumed per the HANDOFF top block (plan-mode plan approved). **Phase 1 (UC-2 primary reads):** all 4 research subagents died on the shared Claude seat limit (raw: "You've hit your session limit · resets 9pm (America/New_York)"; surfaced, not retried) → executed INLINE: ACP primary read (Apache-2.0, OpenAI+Stripe, beta, latest stable 2026-04-17; full feed conformance surface extracted; retail-shaped, no menu model; "15-min refresh" DOWNGRADED to UNVERIFIED) · UCP corrected (unveiled 2026-01-11 NRF, spec 2026-04-08, Apache-2.0, RFC-2119, JSON Schemas; Food vertical = DD/Square/Toast/UE, schemas pending; catalog = LIVE-QUERY interface) · legality clean-core confirmed (Square ITEMS_READ) · §20-563.3 confirmed + LL79 effective-date conflict flagged (2025-05-31 vs 06-30) · AB 578 resolved (consumer customer-service law) · operator voice STILL blocked (3rd attempt). ADDENDUM + same-day ⚠ CORRECTION appended (council falsified "seat empty": official `ucp-schema` v1.4.0 exists; still-empty = feed-vs-SOR truth · evidence-grade reporting · UCP food schemas · UC-1 money lines). **Phase 2 (council, sequential ×5 + synthesis):** RESHAPE-PROCEED, 7 conditions; falsified along the way: "no urgency on module 2" (DCWP recordkeeping rule, comment deadline + hearing **JULY 16, 2026** — primary) and the UC-2-leads ordering (4-of-4 load-bearing dimensions sit in UC-1). **Phase 3 (Codex, codex-guarded, read-only xhigh):** CONFIRM-WITH-AMENDMENTS, **12 findings ALL ACCEPTED** — hard pre-build crux gate G8 (two-part crux: copy-layer persistence + buyer/enforcement authority) blocks UC-2 implementation; S-5 close-out safety wording; UC-1 = primary track; demo claim rewritten; docs-coherence fixes applied (suggestions-ledger + UC-7 backlog annotated); confidence MEDIUM-conditional; primary-source lockfile required pre-publication. **Phase 4:** `docs/plan-truth-audit-execution.md` **v1.0-rc** (SCQA · C1–C10 acceptance criteria · S0/G8/W1-3/P1/D1/F1/Pub slices · S-4 module-boundary gates · restructure proposal · taxonomy v1 · O1–O8 owner calls · split tripwires). Owner directives this session: **DESKTOP WEB ONLY (no mobile)** (decision-log row); "don't wrap — keep momentum"; full-judgment license. Same-breath: PLAIN-ENGLISH + GLOSSARY (+4 terms, UCP corrected) updated; decisions_log.md line; decision-log + task-log rows. `advisor` unavailable again (4th session). **NEXT = OWNER GO on plan §9 (O1–O8; O4 = July-16 DCWP call, THIS WEEK). No build — including S0's commit — before it.** Owner-gated stops HELD: live spend (≤$5), deploy, public posting, git push (no remote), name adoption, restructure execution, ratification. Everything below is historical.

Build update: 2026-07-02, third session (**REFRAME ACCEPTED FOR PLANNING + STANDING DIRECTIVES + DOCUMENTATION SYSTEM — docs only; NEXT = the PLAN stage in a FRESH session (paste-ready prompt in HANDOFF top block).**) — On the owner's explicit "independent judgment, full liberty" ask, Claude proposed and the owner ACCEPTED (for planning; ratification unchanged at council → Codex → owner GO): **UC-2's lead artifact = an OPEN ACP/UCP conformance + truth-audit toolkit ("the truth layer for agentic commerce") + a self-referential demo (a real AI agent caught ordering from a deliberately-drifted synthetic menu)** — replacing the merchant-facing prototype-SaaS framing; UC-7 promoted from horizon into the lead artifact; UC-1 (fee-cap audit) unchanged as module two on the same verifier. **Standing plan-stage directives (owner):** (a) Claude's independent-judgment license runs through research/planning until build (then spec-adherence); (b) legibility = a HARD design constraint on the artifact (one-command validator · one-page report · demo needs no explanation — complex inside, simple outside); (c) data spans free/open + live (ToS-clean only) + hybrid + synthetic, edge cases = an ENUMERATED taxonomy + measured eval coverage (never "all"); (d) everything free/free-tier except Gemini ≤$5; the demo agent is scripted or Gemini-driven, never Claude/Codex as runtime. **NEW durable artifacts + standing rules:** `docs/PLAIN-ENGLISH.md` (living layman explainer, same-breath updates) · `docs/documentation-standard.md` + `docs/GLOSSARY.md` (two-register documentation — professional terminology decoded, never diluted; Diátaxis/Minto-SCQA/C4 as floor-not-ceiling) · `docs/suggestions-ledger.md` (S-1..S-10 — ALL of Claude's session suggestions with statuses; **S-4 module-boundary Codex ceremony, S-5 slice-2 close-out, S-9 report-as-document are PENDING and fold into the plan for owner GO**). 3 decision-log rows + task-log synced; `advisor` unavailable again (surfaced); NO product code changed; the suspended slice-2 uncommitted diff untouched. Also saved: memory `lossless-multi-session-continuity` (owner: multiple sessions/accounts point at this repo; state docs sync at every step boundary). Owner-gated stops HELD: live spend (≤$5), deploy, public posting, git push (no remote), platform-name. Everything below is historical.

Build update: 2026-07-02 (**PIVOT RE-OPENED (owner-directed) — RESEARCH STAGE DONE; ACTIVE = OWNER PICKS THE PIVOT CANDIDATE → then plan/roadmap. NO product code changed; the multi-agent roadmap + slice-2 close-out are SUSPENDED (uncommitted slice-2 diff intact; its live-run authorization stands only on an explicit owner redirect back).**) — The owner re-opened the 2026-06-22 goal-fork on its pivot side. **Fixed objective (owner-settled via AskUserQuestion):** find a real, high-value, **structurally** underexplored problem in the DoorDash/Uber Eats/Grubhub-class US delivery-marketplace industry (company-agnostic), solved by a vertical AI solution at **adoption-grade prototype** standard — showcase-first venture-ready; prefer-reuse of the verification spine (evidence can override); "adoption" = the quality bar (metaphorical); constraints unchanged. **Research executed** (plan-mode approved; 2 quarantined read-only threads, ~100 sources checked, dated citations; first launch died on the seat session-limit — surfaced verbatim, relaunched post-reset; advisor unavailable — surfaced). **Ranked digest: `docs/research/pivot-research-2026-07.md`** — **#1 fee-statement integrity & fee-cap compliance audit (LEAD-POTENTIAL)**: NYC's first restaurant-side fee-cap enforcement (HungryPanda $875K, 2026-04-08; bundling/relabeling tactics documented) + NYC tiered caps (LL79/2025, eff. 2025-05-31) + live FTC fee rulemaking (docket FTC-2026-0463) — and **no product exists** (searched-and-empty; violations historically caught by hand); counterparty-adverse + cross-platform = durable; direct spine reuse. **#2 cross-surface menu/price/availability truth verification incl. AI-agent surfaces (LEAD-POTENTIAL, early)**: Square shipped ChatGPT/Claude ordering 2026-07-01; DD/UE/GH agentic ordering in Gemini since 2026-03; sync vendors are maker-not-judge; the independent-verifier seat is structurally empty; spec-churn + surface-access are the named risks. **★ Composite "marketplace truth-audit layer"** (both threads independently converged): one deterministic verifier of what platforms say vs the merchant's system-of-record — #1 as the wedge, #2 as the growth surface. **H1 dispute automation CONTESTED** (Loop $14M Series A 2026-02 + PAR/Olo entries + DoorDash ToS prohibits third-party dispute submission — funded, revocable category); **H2 refund-abuse AVOID** (platform incentives aligned — structural test fails); driver-deactivation AVOID-for-us. Explicit UNVERIFIED labels + standing to-dos (Reddit first-person pass, video teardowns, primary bill/spec texts) recorded in the digest. Decision-log row 2026-07-02; task-log updated; CURRENT_TASK + HANDOFF top blocks flipped (HANDOFF's old auto-resume directive SUPERSEDED so a bare `resume` cannot fire the suspended live spend). **→ RESOLVED same session: the owner PICKED the COMPOSITE "marketplace truth-audit layer", and (later same day) FLIPPED the order — UC-2 LEADS (cross-surface/agent-facing menu-price-availability TRUTH VERIFICATION, the cooperative platform-benefiting agentic-commerce showcase); UC-1 fee-cap audit = module two on the same engine (decision-log 2026-07-02 ×4 — "accepted for planning"; DECIDED only after the plan-stage council + Codex gates). INTENT FRAME recorded: demonstrate deep AI proficiency by BENEFITING the industry (platforms = indirect beneficiaries; positioning = "marketplace integrity infrastructure"); lean/optimized/structured; existing-system redesign in scope; the repo MAY be restructured per the goal (propose in plan, execute after owner GO). All use cases saved independently: `docs/research/use-case-backlog.md` (UC-1..UC-9 + re-check triggers). NEXT = the PLAN stage in a fresh session (paste-ready prompt in HANDOFF, updated UC-2-first): ACP/UCP spec primary reads + surface-access legality (UC-2) → council deep-validation → MANDATORY Codex cross-check → declarative plan/roadmap reusing the verification spine + the proposed repo restructure → owner GO before any build.** Owner-gated stops HELD: live spend (≤$5), deploy, public posting, git push (no remote), platform-name, the pivot decision. Everything below is historical.

Build update: 2026-06-29 (**ROADMAP SLICE 2 CLOSE-OUT — STEP 1 of 2 DONE (offline load-reduction, gated) + STEP 2 HELD (live re-run, Groq window not fresh). Owner chose Option 1 (reduce per-run Groq load → fresh-window re-run). The OFFLINE half is done autonomously; the live spend is held on a hard precondition, surfaced.**) — Implemented the owner's Option 1 offline half, harness-only (no product code; the orchestrator has no domain-judge DI seam). `evals/agent-loop.live.test.ts`: a **pre-registered, OUTCOME-BLIND 4 tune + 4 test subsample** (one item per failure mode per split, **lowest-definition-order**, ORIGINAL splits preserved, `maxIterations=3` kept — only the item count trimmed so each item's convergence dynamics survive). 8 items ≈ 50% of the prior 16 → a safe margin below the ~item-13 point where the prior run depleted the daily window. **Success criterion for deliverable B was REFRAMED (pre-registered + advisor-cross-checked; FLAG at the batched Codex review):** a clean run = **detection === N** (the HARD live assertion — a degraded run fails loudly so it is never enshrined, matching the directive's "confirm detection=full-N before reading K"); **`test ≥ K` is now a REPORTED measurement** (`k_repin.test_meets_floor`/`interpretation`), **NOT a hard pass/fail** — at the reduced N, K=floor(rate×4) is coarse/near-binary and one GENUINE structural non-convergence (e.g. P-entity-2) can land the floor red on an otherwise-clean, authoritative run; reported honestly, never recomposed to go green; K asserted only non-vacuous (>1). Added an **OFFLINE composition unit test** (counts 4+4, all 4 modes both splits, disjoint, original splits preserved, exact pinned IDs) so the offline gate validates the rule, not just "nothing broke." **GATE: `npm run verify` GREEN — 306 passed (+1 composition test) + 5 skipped** (typecheck/lint/build clean; the live test still auto-skips offline). Pre-registration: `docs/a3-7-live-run-status.md` → "SLICE 2 CLOSE-OUT — PRE-REGISTRATION". **STEP 2 HELD — the Groq daily window is NOT fresh:** the 2026-06-29 live run depleted today's daily window; `groq-preflight` 2026-06-29 15:26 UTC showed TPM 99.1% but that does NOT reflect the daily (TPD) budget (Groq exposes no TPD header). Groq's exact reset semantics are **UNVERIFIED-from-memory (RULES §6)**; either way the window is not fresh today (depletion hours ago, same UTC day; expected reset ~2026-06-30 00:00 UTC). **NEXT = a FRESH-DAY session: confirm the window is genuinely fresh → run the already-authorized live re-run (≤$5; ~$0.02) → gate the whole slice-2 diff (verify → ONE batched Codex review → acceptance-gate) → commit (owner-authorized) → push HELD. Do NOT auto-fire the live spend overnight on calendar inference alone.** Changed this session (uncommitted, part of the slice-2 diff): `evals/agent-loop.live.test.ts` + `docs/a3-7-live-run-status.md` + state docs. Owner-gated stops HELD: live spend (slices 2+5, ≤$5), deploy, public posting, git push (no remote), platform-name. Everything below is historical.

Build update: 2026-06-29 (**ROADMAP SLICE 2 — CLEAN R-A3-9 LIVE RE-RUN EXECUTED (owner GO 2026-06-29). TWO deliverables, OPPOSITE outcomes — an OWNER DECISION is now PENDING for the second. UNCOMMITTED at this line; the batched Codex + acceptance-gate + commit are HELD pending the owner's call (so a shared-seat Codex pass isn't spent on a possibly-superseded snapshot). NEXT = owner picks how to finish deliverable B.**) — Ran the live cross-family harness (`ENABLE_LIVE_AI=true` CLI-override only; `.env` stays `false`, re-confirmed). RULES §6 re-anchored 2026-06-29 (gemini-2.5-flash $0.30/$2.50, matches the pinned table). Cost **$0.0189** (« $5). **DELIVERABLE A — DRAFTER-RELIABILITY (slice-1 fix's first LIVE test) → ✅ CONFIRMED, CLEAN:** `final_redraft_live 16/16`, `final_redraft_fell_back 0`, **0/24 redrafts `finishReason=length`** (all `finishReason=stop`). The A3-7 ~75% structured-output parse-failure is **GONE** — the slice-1 fix (thinking `thinkingBudget=0` + `MAX_LIVE_OUTPUT_TOKENS` 2000→4096) works live. **Advisor carry-forward ANSWERED: the Drafter still EARNS its label under disabled thinking, more robustly than before** (every converged draft live-authored, zero stub fallbacks on the final redraft). **DELIVERABLE B — R-A3-9 AUTHORITATIVE CLEAN K → ⚠️ STILL INCOMPLETE (Groq-degraded again):** K is now REAL (tune 6/7=0.857 → **K=7**, not run #3's vacuous 1), but `degraded:true` (**detection 13/16**) and `test_meets_floor:false` (test 5/9 < 7) → NOT authoritative; the vitest floor assertion FAILED LIVE (5<7), an honest degraded-run red, NOT a code regression and NOT modified to pass (the live test auto-skips offline; **`npm run verify` GREEN 305+5**, typecheck/build clean). The unmet floor is **substantially a degradation artifact**: of 4 test misses, **1 is a genuine non-convergence** (P-entity-2, clean live redrafts but judge kept flagging → correctly HELD, not sent) and **3 are the Groq-depleted tail** (P-entity-3/P-capability-4/P-specific-4 — judge+domain `FAILED_TO_FALLBACK`; their *drafter* redrafts parsed fine). **NEW STRUCTURAL ROOT CAUSE:** the now-reliable drafter runs MORE live redrafts → MORE Groq judge/domain calls per run → one full 16-item×3-iter run depletes the Groq free-tier DAILY window on the tail (the binding constraint the advisor flagged — Groq window, not the $5 cap). "Fresh calendar day" was necessary but NOT sufficient (preflight showed TPM 7927/8000 at start; the run itself depleted it). **LABELS UNCHANGED — all 3 DEFER, run-independent** (Router ablation `signals_differ:0` again; ledger "1 earned (Drafter) + 3 deferred"). **Per the pre-committed bail rule (advisor): degraded → diagnostic — NOT enshrined as a pass, NOT blind-re-run on the now-depleted window.** Honest record: `docs/a3-7-live-run-status.md` → "RESULTS — SLICE 2 RE-RUN" (full per-item evidence + the 4 owner options for B). New tool: `scripts-ts/groq-preflight.mjs` (window-freshness check). Changed (uncommitted): `lib/data/agent-loop.snapshot.json` (degraded-but-drafter-fixed; self-labeled `degraded`/`_caveat`) + the status doc + this + state docs + the new tool. **OWNER DECISION PENDING (deliverable B; live spend = owner-gated): how to get the clean K — (1) reduce per-run Groq load [smaller set / fewer iters] then fresh-window re-run [cheapest, free]; (2) split across windows; (3) paid Groq tier for one run [consequential → owner+Codex]; (4) accept K as directional + stop.** Owner-gated stops HELD: live spend (slices 2+5, ≤$5), deploy, public posting, git push (no remote), platform-name. Everything below is historical.

Build update: 2026-06-29 (**ROADMAP SLICE 1 — DRAFTER-RELIABILITY FIX: DONE + FULLY GATED + COMMITTED (push HELD, no remote). gate-2 CLEARED + acceptance-gate SHIP.**) — The final confirming Codex pass RAN on the reset seat (smoke-test `SEAT_OK`; `gpt-5.5`@`xhigh`, read-only, ~223.5k tokens) → **BLOCK on a SINGLE P2, no P0/P1** (honesty-wording: two comments still called the one-call reserve a "true upper bound" — `gemini.ts:179` + `evals/gemini.test.ts:97`) → **ACCEPTED + reworded primary-model-final** (both now say `maxRetries=0` maps ONE reservation to ONE billed SDK attempt; soft-budget/input overflow is bounded by the post-call `budget_overflow` stop — comment/string-only, no behavior change). **Codex CLEAN-confirmed the budget MECHANISM** (verbatim): the overflow stop is correctly placed after spend accrual & before verify/send; worst-case spend is bounded to cap + one-call overflow (no unbounded path); `budget_overflow` fails closed (no verify pass, no `simulate_send`, `assertEligibilityUntouched` protects eligibility); differential lane untouched. **Every Codex finding across all 5 passes (review BLOCK 4 → confirm-1 BLOCK 1 → confirm-2 BLOCK 1+P3 → confirm-3 P2) is reconciled + (load-bearing) red-green-locked.** **GATE:** `npm run verify` exit 0 — **305 passed + 5 skipped**, typecheck/lint/build green; differential **20/20** UNTOUCHED (`git diff --name-only -- lib/core evals/gold lib/data/*.snapshot.json` EMPTY; **7 changed files: 4 product [gemini/draft/budget/orchestrator] + 3 test** + 3 state docs + 2 review docs); RED-GREEN proven for all 7 load-bearing changes. **acceptance-gate = SHIP** (independent subagent: gates 1/2/3/4/5 PASS; it independently confirmed the gate-2 rewordings LANDED — "true upper bound" appears in ZERO lib/evals .ts files — and that the differential lane is untouched; its only BLOCK was this very doc-sync, now done). **HONESTY BOUND (carry to slice 2):** this slice proves the instrumentation + that the fix is WIRED, OFFLINE/$0 — it does NOT prove the live parse-rate recovers; that is the **owner-gated SLICE 2 (R-A3-9) live re-run** (read `finishReason` live — should no longer be "length" — + advisor carry-forward: re-confirm the Drafter still EARNS its label under disabled thinking). **COMMITTED** (owner-authorized per the roadmap directive; re-derive SHA via `git log`); **push HELD (no remote).** Full Codex arc: `docs/reviews/codex-2026-06-29-slice1-drafter-reliability.md`; RED-GREEN: `slice1-drafter-reliability-verify-evidence.log`. **NEXT = STOP + surface SLICE 2 (clean R-A3-9 live re-run) for the owner GO — OWNER-GATED live spend (≤$5 cap).** Owner-gated stops HELD: live spend (slices 2+5), deploy, public posting, git push, platform-name. Everything below is historical.

Build update: 2026-06-29 (**ROADMAP SLICE 1 — DRAFTER-RELIABILITY FIX WIRED + VERIFY-GREEN (305+5) + RED-GREEN-PROVEN — OFFLINE; the live parse-rate recovery is PENDING the owner-gated slice-2 run, NOT proven here. THREE Codex passes (review BLOCK 4 → confirm-1 BLOCK 1 → confirm-2 BLOCK 1+1P3), each found a DISTINCT real budget-integrity issue, ALL reconciled primary-model-final + red-green-locked; the $5 cap is now an honest FAIL-CLOSED BEST-EFFORT bound (conservative pre-call reserve incl. the documented max thinking budget + a post-call overflow stop), no hard-guarantee overclaim. acceptance-gate BLOCKED only on gate-2 (needs a CLEAN cross-model verdict; same-family judge can't self-clear). A 4th (final) confirming pass was SEAT USAGE-LIMITED (reset 06:03) but, before the limit, flagged 3 residual "true upper bound/guarantee" comments I'd missed → FIXED (grep-clean; verify still 305+5). **gate-2 NAMED-OPEN (dated obligation, seat reset 06:03); slice HELD uncommitted per the acceptance-gate ruling (no "expected SHIP" substitute). NEXT (fresh session ≥06:03; paste-ready resume prompt in HANDOFF) = run ONE final confirming Codex pass → on SHIP, acceptance-gate re-stamp → COMMIT (push HELD) → surface SLICE 2 (R-A3-9, OWNER-GATED live spend). Owner cost-note: 4 Codex passes (~1M seat tokens) on budget-rigor that's largely a slice-2 concern; option to batch the final pass with slice 2.**) — First slice of the owner-scoped remaining-roadmap run (autopilot, owner-gates held). **The A3-7 finding fixed:** the live Gemini 2.5 Flash redraft failed to parse ~75% (`NoObjectGeneratedError` "could not parse the response"). **RULES §6 freshness (2026-06-28/29) confirmed the root cause from 2 independent sources** (ha-llmvision#609, vercel/ai#14377): gemini-2.5-flash THINKS by default and thinking tokens bill against `maxOutputTokens` → a 2000 ceiling truncated the JSON → parse failure (finishReason "length" = MAX_TOKENS). **(a) INSTRUMENT (provable at the live re-run):** the SDK error carries `finishReason` TOP-LEVEL (verified vs installed `ai` typings + constructed live), but `usageFromError` read only `err.usage` → finishReason was SILENTLY DROPPED on exactly the failure path. Fixed `usageFromError` to merge it; threaded onto `DraftResult.usage` → the draft/redraft trajectory `verdictSummary` (`; finishReason=length`). **(b) FIX:** disabled thinking for the bounded structured draft (`thinkingConfig.thinkingBudget=0`, `includeThoughts=false` via a pure `liveGenerationOptions()` builder — confirmed forwarded in `@ai-sdk/google` v2.0.76 dist:1042) + raised `MAX_LIVE_OUTPUT_TOKENS` 2000→4096 as insurance for the reported "ignores thinkingBudget=0" case (cost negligible — the cap only sizes the pre-call ESTIMATE upper bound; a full R-A3-9 run stays ≪ $5). **{{MERCHANT}} fidelity NOT implicated** by the truncation root cause (the injection-cut already guards it) — no change, anti-bloat. **GATE:** `npm run verify` **exit 0 — 303 passed + 5 skipped** (+6: 2 thinking-disable wiring + 1 finishReason capture + 1 trajectory threading + maxRetries=0 + reasoning-pricing), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+snapshots UNTOUCHED — `git diff --name-only` clean; 6 files: 3 product + 3 test). **RED-GREEN proven for all 5 load-bearing changes** (`docs/reviews/slice1-drafter-reliability-verify-evidence.log`). **HONESTY BOUND: this slice proves the instrumentation + that the fix is WIRED, OFFLINE/$0 — it does NOT prove the live parse-rate recovers; that is the owner-gated slice-2 re-run** (advisor carry-forward: re-confirm the Drafter still EARNS its label under disabled thinking). **Codex changed-files review RAN → BLOCK (2 P1 budget-integrity [SDK retries broke the pre-call $5 bound → `maxRetries:0`; reasoning/thinking tokens unpriced → price `output+reasoning`] + 1 P2 honesty-wording + 1 P3 test-lock) → ALL reconciled primary-model-final, the two P1s red-green-locked** (`docs/reviews/codex-2026-06-29-slice1-drafter-reliability.md`); the two P1s were real budget bugs a green CI can't catch — the gate earning its keep. Owner-gated stops unchanged: live spend (slices 2+5, ≤$5), deploy, public posting, git push (no remote). Everything below is historical.

Build update: 2026-06-28 (**A3-7 LIVE CROSS-FAMILY RUN EXECUTED — TWO deliverables, OPPOSITE outcomes. #1 DECIDE THE 3 LABELS → ✅ DONE + CLEAN (all DEFER, run-independent; Codex-confirmed direction). #2 K RE-PIN / CONVERGENCE PROOF (R-A3-9) → ⚠️ INCOMPLETE (provider-degraded; K vacuous; authoritative run deferred). The owner-authorized live run is DONE (3 runs total, ~$0.046 Gemini spend, « the $5 cap). `verify` GREEN 297+5 + build; differential 20/20 UNTOUCHED. Codex changed-files review BLOCK (1 P1 + 3 P2) → reconciled → CONFIRMING pass on the FINAL diff BLOCK (2 P2, no P0/P1; F1–F4 confirmed clean) → both reconciled (snapshot `_caveat`/`interpretation` + the "fails-to-parse" headline fix) → **Codex gate DISCHARGED** (labels CONFIRMED all DEFER, both rounds). acceptance-gate **SHIP 5/5** (independent subagent; BLOCK on 2 process gates [Codex-currency + verify-evidence] → RE-JUDGED with the evidence → SHIP; it file-verified the snapshot `_caveat`, the headline fix, the Codex round-2 record). COMMITTED (owner-authorized via the RESUME DIRECTIVE; re-derive SHA via `git log`); PUSH HELD (no remote).**) — Ran the integrated loop LIVE: **Gemini 2.5 Flash drafter ⊥ Groq `openai/gpt-oss-120b` critics** (faithfulness + domain), cross-family ENFORCED + asserted per item. **RULES §6 freshness re-anchored 2026-06-28**: `gemini-2.5-flash` available, $0.30/$2.50 per M confirmed (matches the pinned table; shutdown 2026-10-16 = upgrade trigger). **DELIVERABLE #1 — LABELS (the clean win, run-independent):** (1) **Strategist DEFER by construction** — its `strategy`/`tone`/`rationale` are recorded but NEVER reach the Drafter prompt (`orchestrator.ts` passes only the Router `instruction`; `draft.ts buildPrompt` never sees them) ⇒ cannot affect a draft ⇒ cannot earn (§11.2 "Strategist→Drafter strategy/tone" data-contract is a spec-vs-impl GAP — FLAGGED to owner, NOT fixed in A3-7). (2) **Domain Critic DEFER** — policy-capped by R-A3-8 (loop-run evidence cannot upgrade the "directional" label). (3) **Router DEFER** — the ablation's **`signals_differ=0` held in BOTH runs** (run#1 23/23, run#3 21/21 live comparisons — all structurally identical to `strongReflection`) + the finite-axis argument (the failed first conjunct of the pre-registered earn criterion alone suffices to defer). **Realized ledger: "1 earned (Drafter) + 3 deferred"** — Codex independently CONFIRMED all three DEFER; offline labeling needs no change. **DELIVERABLE #2 — K/CONVERGENCE (INCOMPLETE; do NOT report as "floor met"):** run #3's `test_meets_floor:true` (exit-0/green) is **VACUOUS** — the corrected metric (final-redraft, Codex P1) + the degradation collapsed tune to 1/7 → **K = floor(0.143×9) = 1**, so "1/9 ≥ 1" is an EMPTY floor. **Dominant finding — the live Gemini redraft is UNRELIABLE (~75%), INDEPENDENT of any Groq depletion:** **12/16 redrafts failed** with `"No object generated: could not parse the response"` (structured-output parse failure), hitting items 1/2/3 at iter-1 WHILE Groq was healthy (`domainMode:LIVE_JUDGE`) — a **drafter** problem, not the Groq tail. Only 3/16 had a live FINAL redraft; genuine live self-correction ~2/16 = "the loop under a drafter that fails to parse ~75% of redrafts," NOT the loop's ceiling. **Hypothesis (TO VERIFY):** `MAX_LIVE_OUTPUT_TOKENS=2000` (`gemini.ts:108`) on the THINKING model `gemini-2.5-flash` → reasoning exhausts the cap before the JSON → truncation (verify `finishReason==="length"`; not snapshot-captured this run). **Separate effect:** Groq-window depletion on the FINAL 4 test items (judge+domain both fell back → detection 11/16; 1 other miss = a genuine judge miss). **Safety HELD:** parse-failed redrafts fell back to the clean deterministic stub; non-converging items HELD (`drafted`, never improperly sent); `assertEligibilityUntouched` never threw. **3 runs:** #1 clean-Groq but pre-fix `.some()` metric (overcounted 9/16); #2 failed on an over-strict per-item assert (gate-blocked final → `domain===null`; fixed); #3 corrected metric + instrumentation but provider-degraded (the committed frozen evidence, labeled a DEGRADED DIAGNOSTIC). **Records:** `docs/a3-7-live-run-status.md` (freshness + PRE-REGISTRATION + SUPERSEDED run#1 + AUTHORITATIVE run#3 sections) + `docs/reviews/codex-2026-06-28-a3-7-live-run.md`; frozen `lib/data/agent-loop.snapshot.json` (run #3; overwrote the A2 same-family snapshot, preserved in git `7d3d8b5`; the served public fixture is built INDEPENDENTLY by `snapshot.ts` at $0 — public surface untouched). **NEXT (SEQUENCED): (1) FIRST a drafter-reliability fix slice** (raise `MAX_LIVE_OUTPUT_TOKENS` / configure the thinking budget for structured output + verify `finishReason`; harden `{{MERCHANT}}` fidelity) — its own gated slice, NOT A3-7; **(2) THEN a clean R-A3-9 re-run on a fresh Groq window** (a re-run alone reproduces the parse failures); **(3) Codex confirming pass on the final A3-7 diff + acceptance-gate → commit (push HELD).** Owner-gated stops unchanged: `git push` (HELD), deploy, public posting, spend > $5. Everything below is historical.

Build update: 2026-06-28 (**A3-4/A3-5/A3-6 CODEX GATE FULLY DISCHARGED — the three batched dated obligations ran on the reset seat → SHIP; the A3-1..A3-6 OFFLINE MULTI-AGENT BUILD IS NOW FULLY GATED. `verify` green 297+5 + build; differential 20/20 UNTOUCHED. Committed (owner-authorized via the RESUME DIRECTIVE; re-derive SHA via `git log`); push HELD. NEXT = A3-7 (OWNER-GATED live run).**) — The Codex seat reset (smoke-test `SEAT_OK` 19:32 ET). The batched read-only review (`gpt-5.5` @ `xhigh`) over `d60f66e`/`46f9a2b`/`b2852d9` returned **A3-4 SHIP** (round-3 clean), **A3-5 SHIP + 1 P2**, **A3-6 BLOCK + 1 P1 + 1 P3**; differential lane confirmed untouched. **Reconciled primary-model-final — ALL THREE ACCEPTED + FIXED:** **(P1/A3-6)** the cross-family `fullyInjectedDI` exemption omitted the A3-6 live-capable Strategist (`recommend`) + Router (`reflect`) seams, so a forced `live:true` non-cross-family run with the 3 old DI hooks could make a REAL Groq Strategist/Router call — the IDENTICAL bug class A3-4 round-2 closed, re-opened by the A3-6 wiring (the gate earning its keep); **fixed** to require ALL FIVE live-capable seams injected, **RED-GREEN proven** (revert→the regression case attempts the real call to `FAILED_TO_FALLBACK` + FAILS; restore→green). **(P2/A3-5)** the Router prompt "no injection surface" overclaim — the unsupported-claim texts could echo the raw merchant_name; **fixed** with the `{{MERCHANT}}` injection-cut (`redactMerchantName`, the same cut the Drafter uses) + an adversarial-name regression. **(P3/A3-6)** stale `defaultReflect`/A2-default comments (incl. the `AgentLoopOptions` field docs the confirming pass caught) → updated to the A3-6 defaults (`strategistRecommend`/`routerReflect`, offline `strongRecommend`/`strongReflection`; `buildReflection` only the eval RED baseline). **Two confirming Codex re-passes: P1+P2 confirmed resolved → 1 residual P3 caught → fixed → final VERDICT SHIP.** **The A3-4 + A3-5 + A3-6 acceptance-gates flip to SHIP 5/5 (gate-2 cleared); the offline build is FULLY GATED.** `npm run verify` exit 0 — **297 passed + 5 skipped** (+1 = the P2 test) + build green; differential lane CLEAN (only `orchestrator.ts`/`router.ts` + the 2 test files changed; `lib/core`+oracle+gold+snapshots UNTOUCHED). Records: `docs/reviews/codex-2026-06-28-a3-batch-confirm.md` + `a3-batch-reconcile-evidence.log`; the 3 gate docs flipped SHIP 5/5; the 3 review docs stamped DISCHARGED. **NEXT = A3-7 — OWNER-GATED (the ONLY remaining A3 work + the only place the 3 deferred labels [Strategist · Domain Critic · Router] are decidable): the live cross-family Gemini run (flip `ENABLE_LIVE_AI=true` + $5 cap + a live Gemini model-id/pricing freshness check per RULES §6 + a Codex cross-check; re-pin K on a fresh held-out split, R-A3-9). Autopilot STOPS here — live spend.** Owner-gated stops unchanged: `git push` (HELD — no remote), deploy, public posting, spend > $5. Everything below is historical.

Build update: 2026-06-28 (**A3-6 BUILT + TEST-VERIFIED (gate-2 Codex NAMED-OPEN) — THE TERMINAL OFFLINE SLICE; the integrated multi-agent orchestrator is wired and the A3-1..A3-6 offline build is COMPLETE. `verify:full` green (296+5 + 4 e2e); acceptance-gate gates 1/3/4/5 PASS (no independent P0/P1), gate-2 named-open → flips SHIP 5/5 when the batched Codex returns (seat-blocked ~7:25 PM = DATED OBLIGATION, now BATCHED AS THE 3RD OF THREE: A3-4 round-3 + A3-5 + A3-6). UNCOMMITTED at this line; commit owner-authorized via the RESUME DIRECTIVE + the `/autopilot` directive; PUSH HELD. NEXT = A3-7 (OWNER-GATED live run) — autopilot STOPS here.**) — Wired the integrated multi-agent loop as the orchestrator DEFAULT (A3-6 is WIRING, not new modules — the four agents were built in A3-2/A3-4/A3-5; the Drafter became Gemini at A3-3). `lib/agents/loop/orchestrator.ts`: the `recommend` default is now **`strategistRecommend`** (was `defaultRecommend`) and the `reflect` default is now **`routerReflect`** (was the A3-5 interim `defaultReflect`, **removed as dead code**) — same pattern as the A3-3 Gemini Drafter default: OFFLINE (live off, no DI) each branches to its STRONG DETERMINISTIC baseline (`strongRecommend`/`strongReflection`, $0 — a genuine upgrade over the naive A2 stand-ins); LIVE each hits Groq behind the A3-7 cross-family gate. `defaultRecommend` + `buildReflection` stay exported (still load-bearing as the Strategist/Router evals' RED baselines). `lib/agents/loop/trajectory.ts`: `A2_HONESTY_NOTE` rewritten for the integrated system with the **honest label framing — "1 earned (Drafter) + 3 deterministic-tied components wired through the agent seams, NOT 'four agents reasoning'"** (the deferred agents decidable only at the owner-gated A3-7 live run). `lib/agents/loop/snapshot.ts`: the $0 SCRIPTED fixture note reframed (the Strategist plan / Router reflect / Domain critic shown are their deterministic baselines; the LLM agents + the live cross-family trajectory frozen at A3-7). **INTEGRATION PROVEN BY CONTENT, not assumed** (`evals/agent-loop.test.ts` +1): with NO recommend/reflect injected (the integrated defaults run), the plan rationale carries `risk=`/`tenure=` (strongRecommend — the naive `defaultRecommend` emits only the root-cause string) AND the reflect instruction surfaces `no_over_promise` (strongReflection reading the domain critic — domain-blind `buildReflection` structurally CANNOT), at `costUsd===0`; **executed red-green captured** (revert the defaults to the naive A2 stand-ins → the test FAILS `expected 'Made progress then went inactive…' to match /risk=/`; restore → 3 passed; raw in `docs/reviews/a3-6-verify-evidence.log`). **TOOL-UNTIL-EARNED holds end-to-end** (wiring the agents as defaults flipped NO trajectory label — strategist/router/domain_critic stay ABSENT; only the Drafter earns). **REALIZED EARNED-AGENT LEDGER (all four agents BUILT + integrated): Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router DEFERRED = "1 earned (generation, not a finite axis) + 3 deferred (classify/decide, each tying its strong deterministic counterpart on the finite structural axis)".** **GATE:** `npm run verify` **exit 0 — 296 passed + 5 skipped** (+1 over A3-5: the integration proof) + **`test:e2e` 4 passed** (`verify:full` green), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+snapshots UNTOUCHED — `git diff --name-only` confirms; 4 modified files + 2 review docs + 1 evidence log); no runtime import cycle (orchestrator imports strategist/router VALUES while they import orchestrator TYPES only — erased at runtime). **Codex changed-files review SEAT-BLOCKED** (usage limit, raw error ~7:25 PM, NO retry per doctrine) → **proceeding TEST-VERIFIED** (per the autopilot doctrine: Codex-down ≠ gate-waived — reversible internal work proceeds, irreversible held) with the **Codex review as a DATED OBLIGATION batched as the 3rd of three** (A3-4 round-3 + A3-5 + A3-6) before any irreversible step (`docs/reviews/codex-2026-06-28-a3-6-integrated-loop.md`). **acceptance-gate = BLOCK (independent subagent, fresh context but SAME model family — so gate-2 cross-model independence is precisely what's missing; gates 1/3/4/5 PASS — grill, verify [with executed red-green], enterprise+taste full, anti-slop; NO independent P0/P1; the "integrated system vs relabeled pipeline?" honesty crux resolves CLEANLY — offline it is a deterministic pipeline with multi-agent SEAMS + one generative slot [Drafter], the labels say exactly that, and ZERO `app/` surface overclaims [grep clean; fixture not rendered; A3-6 touched no app/ files]; flips SHIP 5/5 when the batched Codex returns)** (`docs/reviews/gate-2026-06-28-a3-6.md`). **NEXT = A3-7 — OWNER-GATED (the ONLY place the 3 deferred labels are decidable): the live cross-family Gemini run (key + $5 cap + live Gemini model-id/pricing freshness per RULES §6 + Codex; re-pin K on a fresh held-out split, R-A3-9). AUTOPILOT STOPS HERE — A3-7 is live spend.** Owner-gated stops unchanged: `git push` (HELD — no remote), deploy, public posting, spend > $5. Everything below is historical.

Build update: 2026-06-28 (**A3-5 BUILT + TEST-VERIFIED (gate-2 Codex NAMED-OPEN) — the Router/Conductor agent, the 4th + final named agent; `verify` green 295+5; acceptance-gate gates 1/3/4/5 PASS, gate-2 named-open → flips SHIP 5/5 when the Codex re-confirm returns (SEAT-BLOCKED ~7:25 PM = DATED OBLIGATION batched with A3-4 round-3). UNCOMMITTED at this line; commit owner-authorized via the RESUME DIRECTIVE; PUSH HELD. NEXT = A3-6.**) — Built the Router/Conductor as the multi-critic revision-synthesis seam. `lib/agents/router.ts` = **`strongReflection`** (the STRONG deterministic multi-critic baseline + demotion fallback — reads BOTH critics, prioritizes the faithfulness failure [GATING] then surfaces the advisory domain dimensions in the same revision; a strict SUPERSET of the domain-blind `buildReflection`) + **`routerReflect`** (the LLM Router on Groq `gpt-oss-120b`, DI/mock, $0 default, **recommend-only** — `route` CLAMPED via `clampRouteToEnvelope` and never trusted; honest `FAILED_TO_FALLBACK`; the prompt withholds the raw merchant_name = no injection surface; `signals` recomputed STRUCTURALLY from inputs, never the model's word) + `criticSignals` (the structural coverage discriminator). `lib/agents/loop/orchestrator.ts` = a **`reflect?: RouterFn` seam** (default = the domain-blind `defaultReflect` — **NO loop behavior change this slice**; the strong baseline / LLM wire in as the default at A3-6) + `RevisionPlan`/`RouterFn`/`CriticSignal` types + `buildReflection` exported as the eval's RED baseline; the reflect step gets a **defensive merchant clone** (isolation, mirroring the recommend clone) and RECORDS `plan.route`/`holdForHuman` ADVISORY (recommend-only — RECORDED in the trajectory, NEVER wired to the send). **RECOMMEND-ONLY enforced two independent ways** (acceptance-gate traced both against source): the route clamp (can only ADD caution) + the post-loop isolation (the send flows ONLY through `simulate_send`; `assertEligibilityUntouched` hard-throws on any eligibility move) — **clone red-green PROVEN** (drop the reflect `{ ...merchant }` clone ⇒ the mutation-isolation test trips `R-LOOP-1b violation: … mutated … "review_required"`; restore ⇒ GREEN; raw in `docs/reviews/a3-5-verify-evidence.log`). **ANTI-THEATER EVAL (`evals/router.test.ts`, R-A3-1 — floor-not-ceiling, exactly like the Strategist A3-2 + Domain Critic A3-4):** RED `buildReflection` (domain-blind — its signature has no domain parameter) misses `domain_defective` on a multi-failure case → GREEN `strongReflection` (reads both critics) covers it as a **strict SUPERSET** (non-vacuous: the faithfulness text is byte-identical, the domain addendum is appended) → DEFER the mock Router TIES `strongReflection` on the structural axis → the **`router` label DEFERS** (the reflect step stays `"tool"`; `router` ABSENT from the trajectory, tests assert it). **THE DEFER IS STRUCTURALLY FORCED** (advisor 2026-06-28; stated verbatim in the code + eval + gate record to pre-empt the Codex "why didn't the crux agent earn?" probe): every discriminator available OFFLINE — domain coverage / which-fix-first / route — is a finite/structural axis a deterministic table reproduces BY CONSTRUCTION, so the LLM can only TIE; an LLM earns ONLY on an open-ended-quality axis scored by an INDEPENDENT CROSS-FAMILY judge — for a Groq Router that judge is Gemini ⇒ LIVE ⇒ owner-gated A3-7. So offline the Router CANNOT earn no matter how good — the anti-theater bar working as DESIGNED (AM-7), not under-delivery. **REALIZED EARNED-AGENT LEDGER (all four agents now BUILT): Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router DEFERRED = "1 earned (generation, not a finite axis) + 3 deferred (classify/decide, each tying its strong deterministic counterpart)".** **GATE:** `npm run verify` **exit 0 — 295 passed + 5 skipped** (+10 over A3-4: 8 router anti-theater + 2 agent-loop firewall/isolation), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+snapshots UNTOUCHED — `git diff --name-only` confirms; 2 modified + 2 new + 2 review docs + 1 evidence log). **Codex changed-files review SEAT-BLOCKED** (usage limit, raw error surfaced ~7:25 PM, NO retry per doctrine) → **proceeding TEST-VERIFIED** (the clone red-green + the anti-theater RED-GREEN encode the load-bearing logic) with the **Codex review as a DATED OBLIGATION batched with the A3-4 round-3 re-confirm before any irreversible step** (`docs/reviews/codex-2026-06-28-a3-5-router.md`). **acceptance-gate = BLOCK (independent subagent, fresh context; gates 1/4/5 PASS — grill self-satisfied, enterprise+taste full PASS, anti-slop PASS; gate-3 PASS on the raw evidence now captured in `a3-5-verify-evidence.log`; gate-2 NAMED-OPEN — the mandatory cross-model review is seat-blocked, not waivable; NO substantive P0/P1; flips SHIP 5/5 when the batched Codex returns clean)** (`docs/reviews/gate-2026-06-28-a3-5.md`). **NEXT = A3-6** (the full multi-agent orchestrator wired — Strategist + Gemini Drafter + Domain Critic + Router all as the loop defaults — + a $0 agent-attributed trajectory fixture + `verify:full`) **after the batched Codex re-confirm**. Owner-gated stops unchanged: `git push` (HELD — no remote), deploy, public posting, spend > $5; A3-7 live Gemini run owner-gated. Everything below is historical.

Build update: 2026-06-28 (**A3-4 BUILT + COMMITTED TEST-VERIFIED (gate-2 Codex NAMED-OPEN) — Domain Critic wired into the loop's VERIFY phase as the 2nd critic; `verify` green 285+5; Codex round-1 BLOCK→6 reconciled, round-2 found 1 residual P1 (partial-DI) → patched + regression, round-3 re-confirm SEAT-BLOCKED (usage limit ~7:25 PM) = DATED OBLIGATION; acceptance-gate gates 1/3/4/5 PASS, gate-2 named-open → flips SHIP 5/5 when round-3 returns. PUSH HELD (no remote). NEXT = A3-5 (after the Codex round-3 re-confirm).**) — Wired the EXISTING calibrated domain-quality judge (`lib/agents/domain-judge.ts judgeDomain`, unchanged from B1/B2) into the agent loop's VERIFY phase as the 2nd critic: **ADVISORY** (never gates `verifyPassed`/eligibility/the send — red-green proven: making the send depend on `domain_defective` turns the advisory test RED, restore GREEN), **INDEPENDENT** (formed without the faithfulness verdict; `judgeDomain` has no faithfulness input + `domainSituation` withholds `diagnose().play`, R-A3-4), gatekeeper-gated (runs only on a gate-approved draft, R-DARCH-4), recorded as a 2nd verify-phase trajectory step + a `"domain"` audit actor + `finalVerify.domain`. **CROSS-FAMILY enforced by construction** (the recurring A3-3 P1 on a NEW judge): the loop `live` gate + the A3-7 harness require `resolvedDomainJudgeProvider()==="groq"` (a SEPARATE env from the faithfulness judge), the harness asserts `domain.provider==="groq"` per item, and a forced `live:true` that isn't FULLY-DI'd-or-cross-family-ready **THROWS** (so `DOMAIN_JUDGE_PROVIDER=gemini` can't run a same-family domain critic under a cross-family banner — red-green proven: `||`→partial-DI attempts a real Gemini call; `&&`→throws). **ANTI-THEATER EVAL (`evals/domain-critic-antitheater.test.ts`, the R-A3-1 gate):** the LIVE Groq domain judge (B1-frozen held-out metrics) is compared to its deterministic counterpart `mockDomainJudge` on the same held-out split → they **TIE** (both aggregate F1 = 1.00) → the eval is a NECESSARY FLOOR (it fails a critic WORSE than the baseline), **NOT a label-earning ceiling** → the **`domain_critic` label DEFERS** (the loop's domain step stays `"tool"`, exactly like the Strategist's A3-2 defer). **Honest earned-agent ledger after A3-4: Drafter EARNED · Strategist DEFERRED · Domain Critic DEFERRED · Router pending A3-5** — the anti-theater discipline refusing to dress deterministic tools as agents (the discriminating evidence likely needs live Gemini prose at A3-7 or harder cases). **GATE:** `npm run verify` **exit 0 — 285 passed + 5 skipped** (+6 over A3-3: 3 anti-theater + 1 advisory/independence + 2 regressions), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+snapshots UNTOUCHED; 5 files + 2 new docs/eval). **Codex changed-files review → round-1 BLOCK (6: 1 P1 cross-family-bypass-on-forced-live + 2 P2 [stale `lastDomain` · plan claimed DONE] + 3 P3) → ALL reconciled primary-model-final; round-2 confirming → 1 RESIDUAL P1 (the `||` partial-DI exemption hole) → patched to `&&` fully-injected-DI + a 3-case regression encoding Codex's exact case; round-3 re-confirm SEAT-BLOCKED** (Codex usage limit, raw error surfaced ~7:25 PM, NO retry per doctrine) → **proceeding TEST-VERIFIED** (the regression encodes Codex's exact finding) with the **round-3 Codex re-confirm as a DATED OBLIGATION before any irreversible step** (`docs/reviews/codex-2026-06-28-a3-4-domain-critic.md`). **acceptance-gate = BLOCK (gates 1/3/4/5 PASS; gate-2 NAMED-OPEN — the load-bearing partial-DI fix is unreviewed by Codex, and round-1 Codex MISSED the P1 round-2 caught, so the cross-model judge must see the round-2 fix before stamping; flips SHIP 5/5 when round-3 returns SHIP)** (`docs/reviews/gate-2026-06-28-a3-4.md`); the gate explicitly stated this does NOT undo the RESUME-DIRECTIVE-authorized commit. **NEXT = A3-5** (Router/Conductor agent — LLM reflection/route synthesis + anti-theater eval vs `buildReflection`; R-A3-1) **after the Codex round-3 re-confirm**. Owner-gated stops unchanged: `git push` (HELD — no remote), deploy, public posting, spend > $5; A3-7 live Gemini run owner-gated. Everything below is historical.

Build update: 2026-06-28 (**A3-3 DONE + FULLY GATED — Drafter→Gemini cross-family OFFLINE machinery + §4.2 prevention; `verify` green 279+5; Codex BLOCK→6 reconciled primary-model-final→confirming SHIP (gate FULLY DISCHARGED); acceptance-gate 5/5 SHIP. Commit owner-authorized via the RESUME DIRECTIVE; PUSH HELD (no remote). NEXT = A3-4.**) — Swapped the single-agent loop's Drafter from same-family Groq (`draftOutreachGroq`) to **cross-family Gemini** (`lib/agents/draft.ts draftOutreach`), restoring model-layer maker≠judge (R-A3-2/R-ARCH-3: Gemini drafts ⊥ the Groq reverse-faithfulness judge). The cross-family invariant is **enforced by construction, not just commented** — the loop's `live` gate + the A3-7 live harness require `liveAiEnabled() && groqLiveEnabled() && resolvedJudgeProvider()==="groq"`, and the harness asserts `judge.provider==="groq"` per item (so a `JUDGE_PROVIDER=gemini` config can't run Gemini-drafts-Gemini-judges under a cross-family banner — it opts out). The now-**metered** Gemini drafter is cost-honest: a **cloned cumulative $5 ledger** that accrues drafter + judge spend across re-drafts; `UNKNOWN_USAGE` fails closed to the conservative estimate (never $0) — **red-green proven** (disable the loop's estimate-reservation ⇒ the UNKNOWN_USAGE test goes RED `expected +0 to be close to 0.0056`; restore ⇒ GREEN). **KB §4.2 over-promise-prevention** is wired into the shared Drafter prompt as a static, merchant-independent `DOMAIN_HONESTY_RULES` block that **never enters the per-merchant `facts`** (RAG off the factual path — R-A3-5); shared `withRevision` moved into `draft.ts` (R-LOOP-7). Honest live-gate default (no half-live state); offline DI fixtures inject usage `{0,0}` (genuine no-call $0); the A2 live Groq test was repurposed into the **A3-7 cross-family harness skeleton** (auto-skips offline; PLACEHOLDER P3 split, fresh Gemini-sized split + K re-pin deferred to A3-7, R-A3-9). R-A3-8 note added to `docs/{judge,domain}-calibration-status.md` (the judges' directional label is NOT upgraded by running inside the loop). **GATE:** `npm run verify` **exit 0 — 279 passed + 5 skipped** (+2 cost-integrity), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+frozen snapshots UNTOUCHED; `git diff --stat` 9 files / 284+ 111-). **Codex changed-files review → BLOCK (6: 2 P1 + 2 P2 + 2 P3) → ALL reconciled primary-model-final + re-verified → confirming re-pass SHIP** (`docs/reviews/codex-2026-06-28-a3-3-drafter-gemini.md`); the 2 P1s (cross-family-judge config hole + a vacuous live-harness ledger from the budget clone) were exactly the integrity bugs a green CI can't catch — the gate earned its keep. **acceptance-gate = BLOCK (substance SOUND; missing evidence + 1 record-honesty defect — an overclaimed unreceived "SHIP" in the review header, fixed) → all 3 flip conditions discharged → re-stamp SHIP, 5/5 gates** (`docs/reviews/gate-2026-06-28-a3-3.md`). **NEXT = A3-4** (Domain Critic as the 2nd VERIFY-phase critic — Groq, advisory, independent, withholds `diagnose().play`; R-A3-4). Owner-gated stops unchanged: `git push` (HELD — no remote), deploy, public posting, spend > $5; A3-7 live Gemini run owner-gated. Everything below is historical.

Build update: 2026-06-28 (**A3-2a DONE + FULLY GATED + COMMITTED `32da7b1` — Strategist agent (Groq) + its anti-theater eval; `verify` green 277+4; Codex BLOCK→4 reconciled primary-model-final + test-locked → confirming re-pass SHIP (gate FULLY DISCHARGED). ⚠️ PUSH HELD (no git remote; owner action). A3-2b ✅ — the live $0 Groq confirmatory eval CLEARED the pre-registered anti-theater floor (Low→standard 4/4, High→elevated 4/4, all LIVE_AI, $0); verdict = viable candidate, `strategist` label DEFERS to A3-3, count stays "3 + a candidate" (`docs/strategist-confirmatory-status.md` + `lib/data/strategist-confirmatory.snapshot.json`); Codex methodology review BLOCK→2 reconciled primary-model-final + test-verified (P1 cost-honesty "$0"→"free-tier, not metered" + RULES §6 freshness; P3 comment; `docs/reviews/codex-2026-06-28-a3-2b-strategist-live.md`). NEXT = A3-3.**) — Built the Strategist seam offline-first: `lib/agents/strategist.ts` = `strongRecommend` (the HONEST anti-theater BASELINE — reads risk_level/tenure/engagement, the factors `diagnose().play` provably ignores) + envelope helpers `allowedRoute`/`clampRouteToEnvelope` + the LLM `strategistRecommend` (Groq `gpt-oss-120b`, DI `generate`, `StrategistOutputSchema`, default-stub=`strongRecommend` $0, honest `FAILED_TO_FALLBACK`, **LLM route clamped — never trusted**, prompt withholds the raw merchant_name = no injection surface). `lib/agents/loop/orchestrator.ts` = `RecommendFn` sync-or-async + `await recommend({ ...merchant }, …)` (defensive clone = recommend-only by ISOLATION) + honest plan-step `modelMode`; **plan-step `agent` STAYS `tool`** (tool-until-earned). `evals/strategist.test.ts` = units + the anti-theater eval with **explicit RED-GREEN** (naive baselines + risk-blind mock FAIL; strong + risk-aware mock PASS). **FLOOR-NOT-CEILING (advisor + Codex):** `caution` is a finite enum a deterministic baseline computes perfectly, so the Strategist can only TIE `strongRecommend` structurally → the A3-2 eval is a NECESSARY anti-theater FLOOR (it FAILS a worse-than-baseline Strategist), NOT a label-earning ceiling → the `strategist` label **DEFERS to the A3-3 cross-family judge**; the "4 agents" claim = "3 + a candidate" pending A3-3. A3-2b is CONFIRMATORY only (does the live LLM match the floor?). **GATE:** `npm run verify` green **277 + 4 skipped** (was 270; +7 regression tests); typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+frozen snapshots UNTOUCHED). **Codex changed-files review RAN → BLOCK (4: 1 P1 `groqLiveEnabled` gate-misroute + 2 P2 [trajectory mode honesty · prompt-wiring regression-lock] + 1 P3 recommend mutation-isolation) → ALL reconciled primary-model-final + fixed + test-locked** (`docs/reviews/codex-2026-06-28-a3-2a-strategist.md`); the F1 fix also corrected the identical latent gate in `lib/agents/groq-draft.ts` (surfaced). **Confirming re-pass on the FIXED diff = SHIP** (all 4 findings confirmed resolved, prior probes hold, differential lane untouched, tool-until-earned intact) → **A3-2a Codex gate FULLY DISCHARGED**. **COMMITTED `32da7b1`** (12 files, explicit paths; tooling excluded). **PUSH BLOCKED — no git remote configured (`git remote -v` empty); owner action to add a target.** Owner-gated stops otherwise unchanged: deploy · public posting · spend > $5. Everything below is historical.

Build update: 2026-06-27 (**A3-1 DONE — trajectory `agent` attribution (R-A3-6); test-verified + fully gated; COMMITTED `ce21cf8` (push owner-gated). NEXT = A3-2 (Strategist agent + anti-theater seam-eval vs `diagnose().play`; advisor-sharpened design in the HANDOFF top block).**) — First A3 slice: added a new `TrajectoryAgent` type + a **required** `agent` field on `TrajectoryStep` (`lib/agents/loop/trajectory.ts`), attributed every `record()` site (`lib/agents/loop/orchestrator.ts`), and added 2 R-A3-6 tests + a served-snapshot agent-lock (`evals/agent-loop.test.ts`). **Honesty rule = tool-until-earned (AM-2/R-A3-1, advisor-cross-checked): only the genuinely-GENERATED `drafter` is an agent today; plan/verify/reflect/route + the fed-in `seedDraft` fixture = `tool`; `strategist`→A3-2, `domain_critic`→A3-4, `router`→A3-5, each IFF it clears its anti-theater seam-eval. Tests assert those three ABSENT.** **GATE:** `npm run verify` **exit 0 — 257 passed + 4 skipped** (was 255 at B2; +2 R-A3-6 tests), typecheck/lint/build green; differential **20/20** (`lib/core`+oracle+gold+frozen snapshots UNTOUCHED — `git diff` is only the 3 code files + state docs). **Codex changed-files review RAN → BLOCK (2 findings, 1 P1 + 1 P2) → BOTH reconciled primary-model-final + fixed + RED-GREEN-locked** (P1: seed branch mislabeled `drafter`→`tool`; P2: added a seeded test that FAILS at `agent-loop.test.ts:365` if the fix is reverted; `docs/reviews/codex-2026-06-27-a3-1-trajectory-agent.md`). **acceptance-gate: gates 1/2/4/5 PASS; gate-3 = SHIP on its own pre-committed flip condition** (raw exit-0 verify + the 2 red-green demos — produced + durable); the gate's formal re-stamp was prevented by the subagent hitting its session limit (reset 7:40 PM ET); SHIP recorded primary-model-final (`docs/reviews/gate-2026-06-27-a3-1.md`). **Recommended (non-blocking) dated obligations before any irreversible step (push / A3-7 live): (a) Codex confirming re-pass on the FIXED diff; (b) optional formal gate re-stamp after 7:40 PM ET.** git: HEAD `50bbfc8`; the 3 code files + state docs UNCOMMITTED; push owner-gated. Everything below is historical.

Build update: 2026-06-26 (**A3 DESIGN/PLAN PASS DONE — architecture settled + advisor-cross-checked + OWNER-GATED; buildable spec written (`docs/plan-multi-agent-execution.md` §11). NEXT = BUILD A3 offline-first, slice by slice. NO code/product file changed this pass.**) — A3 opened with a design pass, not code (Rule 0). **Owner chose "Target the full 4"** (AskUserQuestion 2026-06-26, decision-log row): Strategist/Planner · Drafter · Domain Critic · Router/Conductor as four LLM agents, **each gated by an anti-theater seam-proof** (a component eval beating its deterministic counterpart — Strategist vs `diagnose().play`, Router vs `buildReflection`; a failing candidate is demoted to a tool/conductor + the "4 agents" claim corrected, AM-2/AM-7). The advisor (stronger-model cross-check) validated the design and sharpened it: the inverse failure — a deterministic conductor in an agent costume — is the credibility risk, so each seam is proof-gated; **both judges stay Groq while the Drafter→Gemini swap restores cross-family R-ARCH-3**; the Domain Critic stays advisory + independent + withholds `diagnose().play` (R-DARCH-2); §4.2 prevention wires into the Drafter prompt (RAG stays off the per-merchant facts); add per-`agent` trajectory attribution now; **HOLD the "calibrated — directional" judge labels** (the judges were calibrated on the synthetic gold set, not yet on live Gemini prose); re-pin K on a fresh held-out split at the live gate. Spec §11 = EARS **R-A3-1..9** + the build DAG **A3-0..8**; A3-0 (design/plan + owner GO) ✅. **NEXT = A3-1** (trajectory `agent` attribution, offline $0) → A3-2 Strategist → A3-3 Drafter→Gemini machinery + §4.2 → A3-4 Domain Critic → A3-5 Router agent → A3-6 orchestrator + $0 trajectory fixture; **A3-1..A3-6 are mock/DI, $0; only A3-7 spends (OWNER-GATED: key + $5 + Gemini freshness + Codex).** Gate each slice: `npm run verify` → Codex changed-files review (`codex-guarded`, reconcile primary-model-final) → `acceptance-gate` SHIP; record in `docs/reviews/`. `lib/core` + oracle + gold + frozen snapshots stay UNTOUCHED (differential 20/20). git: HEAD `50bbfc8`, tree clean but for untracked tooling; push owner-gated. Everything below is historical.

Build update: 2026-06-26 (**B2 COMPLETE — the mandatory Codex changed-files review + §4.2 cross-check RAN on the reset seat → VERDICT SHIP; the B2 ship-gate is FULLY DISCHARGED. NEXT = A3.**) — The OPEN dated obligation from the entry below is discharged. The COMPLETE read-only Codex review (`gpt-5.5` @ `xhigh`, full run ~212.5k tokens, NOT seat-limited) returned **SHIP** with all **4 targets CONFIRMED** (advisory invariant = `domainJudge` is a structurally-inert leaf, `outreachStatus = m.outreach_status` — confirmed to protect the FUTURE LIVE judge too, not just the mock · the ~75% mock-flag surface reads honestly · audit wording honest · **§4.2 non-redundancy confirmed against the REAL gatekeeper + faithfulness code** — the "mirrors faithfulness" discharge rejected, the seam is real) and **3 findings (1 P2 + 2 P3), ALL accepted + fixed + re-verified primary-model-final**: (F1, P2) the Human-gate copy "Eligible and clean" → "Eligible by the deterministic core" + an advisory note when `domain_defective` (honest + reinforces AM-4 on the public surface); (F2, P3) the audit-wording test now bans all send-gating verbs (`reject|block|gate|hold|prevent`) on flagged entries; (F3, P3) the §4.2 demo test now exercises the wired `mockDomainJudgeResult().verdict`. Codex independently confirmed `AuditEntrySchema` is ENFORCED (not cosmetic, `appendAudit` parses through it) + the section renumber (5→8) is correct, and did NOT push to break the advisory invariant. **`npm run verify` green = 255 + 4 skipped; e2e 4/4** (one first-navigation Playwright flake, clean on re-run — reported honestly). `lib/core` + oracle + gold + frozen calibration snapshot UNTOUCHED (differential 20/20). Records: `docs/reviews/codex-2026-06-26-b2-domain-shipgate.md` (verdict verbatim + reconciliation table) + `docs/reviews/gate-2026-06-26-b2-domain-shipgate.md` flipped to gate-2 CLEARED. Reconciliation fixes committed on top of `6ea0549`; **push owner-gated.** **NEXT = A3** (4 bounded agents — Strategist/Planner · Drafter · Domain Critic · Router; Gemini Flash drafter within the code-enforced $5 cap + cross-family Groq judge; feed KB §4.2 into the Drafter per the §4.2 decision). Owner-gated stops unchanged (deploy · public posting · spend > $5 · git push). Everything below is historical.

Build update: 2026-06-26 (**B2 — domain judge WIRED into the REPLAY ship-gate as the tertiary ADVISORY control; test-verified + acceptance-gate-reconciled; the mandatory Codex changed-files review + §4.2 cross-check are OPEN (a DATED OBLIGATION, seat usage-limited ~8:31 PM). COMMITTED `6ea0549` (owner GO 2026-06-26); push owner-gated.**) — Wired the calibrated domain judge in as the **tertiary** control (R-DARCH-4: gatekeeper → faithfulness → domain), `$0` deterministic mock in REPLAY, surfaced + audited like the faithfulness `judge` field: `ReplayMerchant.domainJudge: DomainJudgeResult | null` (run via `mockDomainJudgeResult` ONLY when `gatekeeper.approvedForHumanReview`, parallel-gated to faithfulness), a new `"domain"` `AuditEntry` actor (ordered after `judge`, before `eval`), and a Merchant-Detail "5 · Domain quality check" panel (renumbered Eval→6 / Human→7 / Audit→8). **The judge is ADVISORY — it NEVER changes `outreachStatus`/eligibility/the send (those stay the deterministic core's); red-green PROVEN** (a mutation making `outreachStatus` depend on `domain_defective` turns the "is ADVISORY" test RED at `replay.test.ts:79`, restore → GREEN). **§4.2 (owner: keep `no_over_promise` gating) NON-REDUNDANCY DEMONSTRATED** (advisor caught it fired 0/20 → added a test: a grounded draft + implied-typicality hype where the gatekeeper APPROVES + faithfulness PASSES + ONLY `no_over_promise` FAILS — the seam §4.2 closes). 6 files modified (incl. a `lib/agents/tools/schemas.ts` mirror-fix adding `"domain"` to `AuditEntrySchema`, + a `domain-judge.ts` "secondary"→"tertiary" comment reconcile). **`npm run verify` green = 255 + 4 skipped** (was 250); differential **20/20** (`lib/core`+oracle+gold+frozen snapshot UNTOUCHED, confirmed by `git diff --name-only`); e2e 4/4. **`acceptance-gate` = BLOCK (procedural — no hard P0/P1; all 5 invariants honored on its read + advisor agreed) → reconciled:** gate-3 (verify) CLEARED with raw + red-green evidence; its 3 non-blocking items addressed (75%-stub-flag credibility framing · audit wording · secondary→tertiary). **Gate-2 (Codex) OPEN:** the seat smoke-tested ALIVE, the review ran + surfaced **1 real finding** — a false "never auto-sent" panel claim contradicting the advisory design — **fixed + reconciled primary-model-final** — then hit the usage limit mid-review (raw error surfaced; no retry per doctrine). **Until Codex completes, the acceptance-gate verdict remains BLOCK by its own design; a commit = the owner choosing to proceed test-verified with that gate named-open, NOT "gates passed."** Forward decision recorded: the detect-then-send-anyway pattern (15/20 flagged, 3 flagged-yet-sent) is consistent with the advisory design (gatekeeper = firewall; LLM judges advisory-into-the-human-gate), open question tied to the §4.2 forward-decision — *should a calibrated `domain_defective` eventually inform the hold, past the ~100 floor?* Gate record: `docs/reviews/gate-2026-06-26-b2-domain-shipgate.md`. **NEXT = run the COMPLETE Codex changed-files review + §4.2 cross-check on a fresh seat (4 concrete targets in the gate record), reconcile primary-model-final → then A3.** Owner-gated stops unchanged (deploy · public posting · spend > $5 · git push). Everything below is historical.

Build update: 2026-06-26 (**B1 DONE — LIVE CALIBRATION CLEARED all seven pre-registered thresholds AND the mandatory Codex cross-model gate RAN (gpt-5.5 @ xhigh, full B1 diff → 2 P2 code findings fixed + reconciled + test-locked); label = "calibrated — directional, pending the ~100 floor" (R-DHON-1/3)**) — The live cross-family Groq `openai/gpt-oss-120b` domain judge ran over the 36-item *synthetic* gold set (K=3, temp 0, **$0**, 36/36 LIVE_JUDGE, 0 fallbacks): **held-out recall/precision/F1 1.00** (CI95 [0.76,1.00], n=18: 12 pos / 6 neg), per-dim recall 1.00 each, **κ 1.00, flip 0.00** — CLEARS the pre-registered bar (`docs/domain-calibration-status.md`). **No-answer-leakage VERIFIED** (R-DARCH-2: `domainSituation` withholds `diagnose().play`; rationales reason situation→draft cold + isolate the right dimension; the engagement per-dim precision 0.5 cross-dim bleed is the fingerprint of real reasoning, NOT a wrapper — carried to B2). **Eval-locked** (`evals/domain-calibration.lock.test.ts` vs the frozen snapshot, R-DHON-4; commit `1fcb492`); `verify` green **250 + 4 skipped** (after the Codex-fix lock tests; was 243); `acceptance-gate` engineering = **SHIP**. **Codex gate DONE** (full B1 diff `07e9a55..HEAD`; 2 P2 *code* findings — partial-verdict acceptance + wrong env namespace — both fixed + reconciled primary-model-final + test-locked; 0 P0/P1; `docs/reviews/codex-2026-06-26-b1-domain-judge.md`); the calibration result is provably unchanged (ran via explicit `live:true`/default-groq). **Docs flipped** "directional"→**"calibrated — directional, pending the ~100 floor"** (methodology calibrated; metric directional). **NEXT = B2 + A3.** All gold positives SYNTHETIC (R-DCAL-4); the metric stays directional until the ~100 floor (R-DHON-1). Committed 2026-06-26 (owner GO via "continue"); **push remains owner-gated**. `lib/core`+oracle+gold+frozen-snapshot UNTOUCHED. Everything below is historical.

Build update: 2026-06-26 (**Track B1 — domain-quality "Effective"-axis judge: OFFLINE MACHINERY DONE + green + acceptance-gate SHIP; live calibration owner-gated (B1d). [SUPERSEDED by the TOP entry — the live run + the Codex gate have since cleared this → "calibrated — directional, pending the ~100 floor"; the following is true only AS OF THIS dated entry:] NOT "B1 done", NOT "calibrated."**) — Built the Effective-axis analogue of the P3 faithfulness judge across 5 committed slices (`db72461` spec+rubric · `4096ebe` judge · `f71c5c9` gold+harness+offline-cal · `2fc1f08` live-runner+pre-registered-bar · `e201eee` honesty-refinements): a **KB-cited rubric** (matched-to-blocker · engagement-appropriate · no-over-promise, from `knowledge/domain/merchant-activation-kb.md` §2.1/§3/§4.2), a **situation-in (not answer-in) judge** (mock + cross-family Groq `gpt-oss-120b` live via DI; the prompt withholds `diagnose().play` — the tautology guard, R-DARCH-2), a 24-positive/12-negative stratified gold set (each positive gate-passing + faithful **by construction** so the catch is a pure domain residual), and a harness that **enforces R-DCAL-1 LIVE per item** (real gatekeeper + faithfulness mock — already caught + fixed one mis-constructed gold item where "once you're live" tripped state_mismatch). `verify` green (236 + 4 skipped); per-dimension metrics; the **pre-registered bar is pinned in `docs/domain-calibration-status.md` BEFORE any number** (R-DCAL-7). **acceptance-gate = SHIP** (offline machinery, framed correctly); **Codex changed-files review SEAT-BLOCKED** (usage limit, raw-surfaced, reset ~3:27 PM) → **dated obligation that converges with the B1d Codex gate** (`docs/reviews/gate-2026-06-26-b1-offline.md`). The live Groq calibration run (fresh window, $0) + eval-lock + the Codex gate are **owner-gated (B1d)**; no "built + calibrated, metrics=X" claim ships before the bar clears (R-DHON-3). `lib/core`+oracle+gold UNTOUCHED. Everything below is the A2 GO + prior product.

Build update: 2026-06-26 (**A2 GO ✅ — the early go/no-go is CLEARED; committed scope expanded to the full roadmap; Track B in flight**) — The single-agent verify-and-self-correct loop SHIPs: recommend-not-decide + fail-closed **red-green proven** (the lock test FAILS without the fix); **8/9 genuine self-corrections** (auditable — `seedCatchLive` + `LIVE_JUDGE` final; $0; 1 miss HELD, never sent); the **5 ship gates discharged** — grill + Codex now **durably recorded in `docs/reviews/`** (the `/tmp`-only recurrence fixed), verify green + red-green, acceptance-gate enterprise+anti-slop PASS. Cross-model gate found + I fixed a real **P1 fail-open safety bug** (a fallback judge could have let an unsupported draft send) — the gate earning its keep. **Owner directed GO + "rest other phases"** → the AM-6 cap is lifted (decision-log 2026-06-26); committed scope = full roadmap. **NEXT: Track B0 (cited domain KB, in flight) → B1 → A3 (Gemini Flash within the $5 cap + cross-family judge) → A4; A5 + Phase 6 stay owner-gated.** Build continuation is manual (owner resumes each session; the auto-resume launcher was removed at owner request 2026-06-26 — it was never installed). Commits `dafb653`/`f521b5c`/`5a1f86a`/`37116f5`/`a97baed`/`7d3d8b5`; verify green (217+3); `lib/core`+oracle+gold UNTOUCHED. Everything below is the A2-scoped execution + Phase 0 + prior product.

Build update: 2026-06-25 (**AUTOPILOT — A2-SCOPED EXECUTION: P3 + A1 + A2 offline machinery DONE + committed; at the A2 GO/NO-GO batch**) — Owner toggled `/autopilot` + the A2-scoped `/goal` + "full permission … everything." Drove, with full rigor + autonomous per-slice commits: **P3 judge calibration** (`dafb653` — held-out cleared the pre-registered bar [recall 1.0/precision 1.0/κ 0.784/flip 0.071], DIRECTIONAL; an over-strict runner assertion fixed, not the judge; AM-1 satisfied), **A1 tool-ify the core** (`f521b5c` — 7 delegating tool wrappers + a non-vacuous byte-for-byte differential), **A2 single-agent verify-and-self-correct loop — OFFLINE MACHINERY** (`5a1f86a` — recommend-not-decide STRUCTURALLY enforced + R-LOOP-8b test-locked; non-vacuous R-LOOP-8 [injected verdicts]; dedicated trajectory + `$0` freeze; `ai` SDK, no LangGraph; R-LOOP-5 same-family caveat stamped). Stack doctrine relaxed to **best-fit, cost-aware** (`e260c15`). **Codex seat hit its usage limit on the A1 review (~7:49 PM reset)** → A1/A2 proceed **TEST-VERIFIED**; the **A1 + A2 Codex reviews + the framework cross-check are DATED OBLIGATIONS before the A2 GO/NO-GO** (decision-log 2026-06-25). **REMAINING = the A2 GO/NO-GO batch** (see HANDOFF NEXT): the live R-LOOP-10 run ($0, P3-unblocked, set K) · `verify:full` e2e · the seat-blocked Codex batch · `acceptance-gate` · then the **owner A2 GO/NO-GO**. `npm run verify` green throughout (215 + 3 skipped); `lib/core`+oracle+gold UNTOUCHED. Everything below is Phase 0 + the prior product.

Build update: 2026-06-25 (**MULTI-AGENT PIVOT — PHASE 0 executing; owner-approved via `/claude-os`; goal mode**) — **Owner-triggered pivot: elevate the near-ship workflow into a bounded, HITL, eval-gated MULTI-AGENT verify-and-self-correct system.** Plan APPROVED + durable (strategic brief `~/.claude/plans/read-last-handoff-and-snappy-ripple.md`; execution spec `docs/plan-multi-agent-execution.md`). **PHASE 0 (Decide & gate) is nearly cleared:** the **mandatory cross-model gate RAN** (Codex `gpt-5.5`@`xhigh`, read-only, via `codex-guarded`) → **BLOCK (9 findings) → ALL 9 reconciled primary-model-final** (verdict + reconciliation table: `docs/reviews/codex-2026-06-25-multiagent-pivot.md`; the BLOCK challenged **no** part of the pivot's direction — every finding was a condition on honesty/scope/deterministic-first/paperwork, converging with the primary model's own pre-review APPROVE-WITH-CONDITIONS + the advisor). Authored: **ADR-002** (`docs/decisions/ADR-002-multi-agent-architecture.md`), the **3 decision-log reversals** (drop-agentic→agentic deliverable · single-agent→bounded multi-agent · integrations-deferred→transient demo, the last framed as a *satisfied* RULES §3 precondition not a rule reversal), and **binding spec amendments** (`docs/plan-multi-agent-execution.md` §0: AM-1..AM-8 + new R-LOOP-1b/8b). **The confirming Codex pass CONFIRMED — the Phase 0 gate is CLEARED (BLOCK → reconciled → RESIDUAL → patched → CONFIRMED, 2 rounds).** **Binding build preconditions** (Codex #1 + #6): the paused **P3 judge calibration MUST clear the held-out bar BEFORE A2's live self-correction milestone**; the agent **recommends only** — `send_eligible`/approval/the send transition stay deterministic + **test-locked the agent cannot override**. **Committed near-term scope = P3-calibration + A1 + A2; A3/A4/A5/Track B = roadmap, re-decided at the A2 owner go/no-go.** The built product (judge · gatekeeper · eval harness · hybrid data · REPLAY; 192 tests green) is **PROMOTED to the agents' tools, not rewritten.** **NO product code changed in Phase 0 (governance only).** Reverses 3 logged decisions (recorded). The prior active task (UI redesign Stage 2 + semantic-judge P3 calibration) is **SUBSUMED** — the judge calibration still completes (it IS the Faithfulness-reverse tool the loop depends on); the UI continues but must surface the agent trajectory at A4. **REMAINING Phase 0 = TWO OWNER ACTIONS: commit the Phase-0 docs (explicit paths) + toggle `/autopilot` with an A2-scoped `/goal` (stop at the A2 go/no-go, do NOT chain to A5) → A1.** Everything below is the prior (complete, deploy-ready) product + the semantic-judge build, now the **tool layer** the agents call.

Build update: 2026-06-22 (SEMANTIC JUDGE — P3 INFRASTRUCTURE DONE + LIVE JUDGE WIRED + PROVEN; owner provided GROQ_API_KEY; goal mode) — **The live cross-family Groq `openai/gpt-oss-120b` judge is wired + working; one clean calibration run remains, gated on a fresh Groq daily token window.** Verified the owner's key without printing it (gsk_/56-char, `.env` gitignored+untracked, HTTP 200, model available + non-deprecated per RULES §6). Installed `@ai-sdk/groq@2.0.42` (approved P0 decision) and wired the live judge in `lib/agents/semantic-judge.ts` (`defaultJudgeGenerate`: strict `structuredOutputs:true` + `reasoningEffort:"low"`); build-time strict-mode smoke returned schema-valid JSON + flagged a planted fabrication. Built the key-gated calibration runner `evals/judge-calibration.live.test.ts` (live judge over the 30-item gold set, K=3 reps, R-CAL-1 partition; auto-skips offline). **A live run PROVED the capability** — strong recall (caught the planted fabrications), but precision was dragged by a GROUNDING gap: the judge flagged the **platform's own name** ("...onboarding step with DoorDash") + greeting framing as "unsupported." **Root-caused + FIXED** in the prompt (`buildJudgePrompt` now tells the model the email is sent BY the platform; threaded `platformName`); a raw probe confirmed the fix discriminates at `reasoningEffort:"low"`. **THE REAL CONSTRAINT (read verbatim from the Groq 429 body, after an advisor caught me inferring it from headers twice): tokens-per-DAY = 200,000, used 199,981 — 5 debugging/calibration runs spent today's budget.** NOT a code bug, NOT "free tier can't do it": `reasoningEffort:"low"` cuts a call to ~374 tokens, so a full 78-call run needs ~30K of 200K → feasible on a fresh window. **REMAINING P3 = one clean run on a fresh daily window** → read held-out recall/precision/F1 + κ + flip-rate → **P4** (eval-lock + 3 demo surfaces + Codex gate + flip docs ONLY if metrics clear the bar, R-HON-3). Pre-fix numbers deliberately NOT enshrined (snapshot had TN inflation + is superseded; deleted). Offline suite green: **192 passed + 2 skipped** (both live tests auto-skip); typecheck/lint/build green; `lib/core` + differential UNTOUCHED. Full honest status: `docs/judge-calibration-status.md`. Everything below is the prior P2 + product close-out.

Build update: 2026-06-22 (SEMANTIC JUDGE — P2 DONE + GREEN; offline/$0; goal mode) — **Built the judge's CALIBRATION CORE: a pure metrics module + a stratified gold set + a reusable harness + a 16-test calibration suite. 192 tests + 1 skipped green; typecheck/lint/build green; `lib/core` + the differential oracle UNTOUCHED.** Files: `lib/evals/judge-metrics.ts` (confusion matrix · precision/recall/F1 · TPR/TNR · Wilson recall CI · Cohen's κ · test-retest flip-rate; `headlineReport` = **recall on the gatekeeper-PASSING subset**, R-CAL-1, not vacuum recall), `evals/gold/semantic-judge-gold.ts` (gold set as typed TS LITERALS — **30 items**: 16 planted judge-territory positives across 4 failure modes [timeline/entity/capability/specific, ≥3 each, 9 in the held-out test split] that survive the deterministic guardrail, 2 gate-caught positives [revenue%, state-mismatch] to exercise R-CAL-1 exclusion, 10 mock-clean + 2 real-supply clean negatives; objective field-entailment labels + few-shot critiques incl. supported exemplars R-CAL-5; tune/test split R-CAL-6/7 — grown from 21 to the R-CAL-2 ~30 floor after an advisor flagged the held-out positive count), `evals/gold/harness.ts` (reusable gold→real-gatekeeper→JudgeFn wiring; `mockJudgeFn` is the P2 stub; the SAME harness feeds P3's live judge), `evals/judge-calibration.test.ts` (16 tests). **Advisor-shaped (call before writing): metric MATH tested vs hand-computed confusion matrices [independent of any judge]; the mock judge run ONLY as a labeled "stub baseline (NOT calibration)," never gated on a threshold; R-CAL-1 ENFORCED LIVE — every gold item run through the real `runGatekeeper`, its approval must equal the declared expectation.** That live enforcement caught a defective planted positive (`G-state-1` didn't trip the tense-aware state check) → reworded → gate blocks it (proof the enforcement has teeth). **Honesty (R-CAL-4 / R-HON-1): all gold positives are SYNTHETIC + labeled `source:"planted"` (the 6 recorded live drafts are well-grounded, organic fabrications ≈ 0); no "built + calibrated, F1=X" claim ships until P3/P4 metrics clear the bar on held-out data.** Judge model = CROSS-FAMILY Groq `openai/gpt-oss-120b` (free, strict JSON), freshness-verified current 2026-06-22. **NEXT = P3 (OWNER-GATED: a free `GROQ_API_KEY`)** → run the live cross-family judge through the harness → real metrics + frozen calibration fixture → P4 (eval-lock + 3 demo surfaces + Codex gate + honest docs). Then the QUEUED UI redesign + owner-gated T13 deploy. Everything below is the prior alignment-audit + product close-out (unchanged).

Build update: 2026-06-22 (DOCTRINE ALIGNMENT-AUDIT — reconciled; owner "do all the fixes and commit") — **Ran a read-only 3-agent alignment pass (project-advisor · guidelines-monitor · acceptance-gate) against the upgraded claude-os doctrine, then FIXED every gate-blocking + important finding across 7 committed slices (two Codex BLOCK→reconcile rounds converged). 161 tests + 1 skipped green at each slice; typecheck/lint/build green.** Verdicts: project-advisor = HYBRID-CORRECT (deterministic core right; the LLM earns a *demonstration* seat) / SOUND-WITH-GAPS; guidelines-monitor = 12 followed / 2 partial / 0 violated; acceptance-gate = BLOCK (now reconciled). **CANONICAL FACTS (supersede any earlier line, incl. the stale "4 LIVE_AI / 2 FAILED_TO_FALLBACK / $0.0036 / 153|145 tests"): the locked fixture `lib/data/live-samples.snapshot.json` = 5 LIVE_AI / 1 FAILED_TO_FALLBACK / $0.004203; test count = 161 (+1 skipped live-smoke).** Fixes: (1) honesty/accuracy — false "Real San Francisco businesses" / "real business names" copy (`app/page.tsx`, `app/metrics`) → fictional-display wording; stale run-stats synced to the fixture across README/app-eval/ENTERPRISE-READINESS; "authentic caught-failure" overclaim softened (commit `8b8a896`). (2) NEW `no-leakage` eval grader (4th dim) catching the recorded raw-enum + risk-level leak the other graders missed — planted + real-output teeth; live prompt tightened; snapshot re-scored 3/4 leaky / 4/4 clean (commit `c100f41`). (3) a11y — dim 11px text contrast → WCAG-AA + skip-link (commit `93848de`). (4) recovered the rebuild-era Codex verdicts from `/tmp` into `docs/reviews/` + backfilled `docs/implementation-journal.md` (gap was: gate evidence lived only in `/tmp`; journal newest entry was 2026-06-02) (commit `e675df0`). **The acceptance-gate's HIGHEST-ranked "secret in `.env`" was VERIFIED a false alarm — `.env` is gitignored, untracked, never committed, deploy-excluded; not a RULES §11 breach.** A fresh pre-deploy **Codex pass (gpt-5.5 @ xhigh) RAN** on the fix slices → **BLOCK (11 findings), ALL reconciled in slice 6** (`docs/reviews/codex-2026-06-22-alignfix.md`): the runtime **gatekeeper now ENFORCES no-leakage** (a shared precise-denylist detector in `lib/agents/state-consistency.ts` — eliminates the false-positive + closes the eval-scored-but-not-gated gap), the footer + the now-stale "caught nothing" overclaim were corrected, the detector hardened, and the 3-grader surfaces synced. The **confirming pass then found 4 second-order items** (hyphenated-identifier + `risk is/=high` detector gaps · "3 of 6"→"3 of 5 parsed live" count precision · committed allow/deny regression tests) → **reconciled in slice 7** (`docs/reviews/codex-2026-06-22-confirm.md`). The final re-confirm hit a **transient Codex "at capacity" error** (surfaced raw; NOT retried per owner doctrine) after reading the slice-7 tests — so slice 7 is **test-verified** (a committed allow/deny regression suite encodes the reviewer's exact cases — `bank-verification-needed` denied, `Tacos_To_Go`/`sign-up` allowed, `risk is/=high` denied; 161 green), and a Codex re-confirm on `af3680e..HEAD` is a **recommended dated obligation, not a blocker** (per the 2026-06-20 test-verified-reconciliation precedent). Remaining = owner-gated **deploy (T13)** only. The UI-redesign exploration below is unchanged (separate, in-flight). Everything below earlier.

Build update: 2026-06-20 (UI REDESIGN — exploration; **paused for a fresh session**) — **The product is DONE / green / deploy-ready (everything below). Now in a UI REDESIGN: the owner finds the current console "dull / generic" and wants a modern, professional, ELEGANT, white-background product site with a STORYTELLING walkthrough arc + motion/transitions + custom icons/SVGs — anti-slop, senior-designer craft.** Built **5 distinct design-direction SAMPLES** (standalone HTML, real ActivationOps content, fictional names, white-bg, full storytelling arc, scroll-reveal + animated pipeline, custom inline SVGs) via **5 parallel frontend-specialist agents**: `mockups/editorial.html` (Fraunces serif + oxblood magazine long-read) · `mockups/saas.html` (Linear/Vercel emerald, console-preview hero) · `mockups/swiss.html` (monochrome + red, strict Swiss grid) · `mockups/technical.html` (blueprint dot-grid, monospace, animated flow-diagram) · `mockups/premium.html` (Stripe/Mercury indigo, layered depth). Screenshots: `mockups/shots/*.png`. Served for viewing at **http://localhost:8080/mockups/<name>.html** (static server running; old app dev server on :3000). **AWAITING the owner's PICK** (a single winner, or a blend). **NEXT (after the pick): FINALIZE the chosen design language into the real Next.js app** — apply it as the design system across EVERY surface (Overview · Merchant Detail · Eval · Metrics · Audit · Cost) + add the storytelling landing as the new front door; keep all logic/data/evals intact; then re-verify (typecheck/lint/test/build/e2e — **the e2e selectors/headings will need updating for the new UI**). THEN the owner-gated T13 deploy. The mockups are committed; the chosen-not, discard the rest after finalize. Everything below is the (complete, deploy-ready, grill-reconciled) product.

Build update: 2026-06-20 (goal mode — PRE-DEPLOY GRILL **fully reconciled**, owner "fix all") — **All 14 grill findings RESOLVED: honesty hardened across every surface + the public demo FICTIONALIZED + the guardrail-precision fix COMPLETED. 155 tests + 3 e2e green; 27 commits.** #1 (the top risk — real personal-name DBAs as fabricated "high-risk"): **FIXED** — the public demo now shows 20 **fictional** names; the real-data CAPABILITY stays in the adapter (`lib/ingest/sf-adapter.ts`) + its tests, and every doc/label reframed "real capability / fictional display" (`HONEST_DATA_LABEL`, README, WHY, ENTERPRISE, PROVENANCE). The live re-run over the fictional merchants then surfaced that the precision fix was **incomplete** — the menu/photos/hours patterns over-caught passive phrasing ("menu to be uploaded", "photos to complete") → **completed the tense-aware tightening** + locked it; post-fix live re-run: **0 false blocks, 5 LIVE_AI + 1 honest fallback, all 3/3, $0.0042.** Loosened `live-samples.test` to stable invariants (the live split/verdicts are non-deterministic). #2 name resolved (no collision; demo-OK; commercial clearance is owner's). #3 `out/README.md` labels the Python-v1 oracle ("DoorDash" = the differential reference-name, synthetic, not affiliation). **DEPLOY-READINESS: the grill's blockers are cleared — deploy is a clean owner GO** (run Vercel · confirm `.env`/`ENABLE_LIVE_AI` absent in the Vercel env · keep the repo private OR treat `out/` as the labeled bundle · a final pre-deploy Codex pass is available if wanted). Everything below earlier.

Build update: 2026-06-20 (goal mode — PRE-DEPLOY GRILL, owner-requested) — **Ran a pre-deploy devil's-advocate grill (Codex cross-model + advisor): DEPLOY-READINESS was NOT-YET → honesty copy/disclaimers HARDENED across EVERY public surface (25 commits; 153 tests + 3 e2e green).** Done (copy/disclaimer only, no build reopen): a shared honesty + **non-affiliation footer on every surface** (synthetic state · not affiliated with DoorDash/Uber Eats/Grubhub/DataSF/any business · recorded-fixture note); Metrics de-"Impact"-ified ("Workflow metrics (simulated)", "not real outcomes"); README/ENTERPRISE softened ("review/adapt/revalidate as a reference prototype", stale counts fixed 94/50→153); **"proven end-to-end" → "exercised plumbing/fallback/cost — not broad model quality"**; the live fixture labeled a **static recording** + a local-verify command (no public live endpoint — REPLAY-only kept); the Gate scoped to declared claims; product PII label tightened; stale "Phase-B" copy fixed; Cost "never" → "budget-guarded". **3 OWNER-DECISIONS gate the public deploy:** (1) **[#1 risk]** real **personal-name DBAs** rendered as fabricated "high-risk/bank-blocked" under DoorDash framing — recommend swapping the **public demo to fictional names** (keep the DataSF real-name provenance in docs); (2) **"Curbside Commons"** name clearance; (3) exclude **`out/`** (legacy "DoorDash" strings) from any public **GitHub** push (`.vercelignore` already covers Vercel). Everything below earlier.

Build update: 2026-06-20 (goal mode — comprehensive 3-audit sweep + full reconciliation) — **Codex (comprehensive) + security-specialist + evals-specialist all run on the REAL artifact; EVERY finding reconciled (incl. a FINAL Codex confirming pass: BLOCK→fixed — corpus now runs all 45 cases, live-snapshot lock tightened, "declared claim" wording, stale copy); 153 tests + 3 e2e green, coverage ≥88/79/90/91 (ratchet 80/70/80/80).** Codex (8 findings) + security (no P0/P1; defenses confirmed sound) + evals (4 P1 rigor gaps) all closed. Fixes: guardrail-precision coverage (the precision fix had opened a false-NEGATIVE — verb-before-noun completion claims; both the false-positive AND false-negative now closed, broad table test); partial-usage→UNKNOWN_USAGE (cost integrity); `live:true` can't bypass ENABLE_LIVE_AI (LIVE_AI_DISABLED provider boundary); budget rejects negatives/bad-cap; Gemini key via `x-goog-api-key` header; honesty copy ("claims-checked" not "truthful"; "demo makes no live calls" vs "a recorded run exists"). **NEW eval rigor (evals-specialist root-causes closed):** 45-case guardrail regression corpus ported to TS (locks the core guardrail vs the Python oracle); draft-text differential (`makeDraft` vs `out/model_runs.csv`, byte-for-byte); live-samples snapshot regression-locked; `.vercelignore` (keeps `.env`/DoorDash-string artifacts out of any upload). **Canonical live-run facts (post guardrail-fix; fixture `lib/data/live-samples.snapshot.json`): 4 LIVE_AI / 2 FAILED_TO_FALLBACK, 3 PASS / 3 WARN, 0 BLOCKED, $0.0036; all LIVE_AI drafts 3/3** (the "1 BLOCKED / 5 LIVE_AI" in the line below was the PRE-fix FIRST run — the finding that drove the precision fix; now superseded). Remaining: **owner-gated deploy only** (platform-name · Vercel · the personal-name / `.env`-hygiene / `out/`-de-brand pre-deploy checks the security audit flagged). Everything below is earlier.

Build update: 2026-06-20 (goal mode) — **LIVE GEMINI RUN DONE (owner key) — the headline DoD milestone is MET; total real spend $0.0037 (cap $5).** Ran one merchant per blocker (6) through real `gemini-2.5-flash` (preflight + pricing re-verified live, RULES §6 — pinned table unchanged): **5 LIVE_AI + 1 FAILED_TO_FALLBACK; gate 3 PASS / 2 WARN(held) / 1 BLOCKED; eval scored every real draft (5×3/3, 1×2/3).** Validated on REAL output: claims-gatekeeper passed all declared claims; injection cut held (placeholder→real name); cumulative ledger held ($0.0037, no breach); **a real billed-but-unparseable call (bank_verification) → FAILED_TO_FALLBACK with its cost recorded ($0.000255, not $0)** — the P0 fix proven live. **Authentic caught issue:** the business_verification draft was BLOCKED on `state_mismatch` — a **fail-safe over-match** (the pinned core guardrail flags the phrase "business verification" regardless of tense; the draft was truthful) — held for human; NOT a model lie. Recorded the live run as a frozen fixture (`lib/data/live-samples.snapshot.json`) + a gated live test (`evals/live-smoke.test.ts`, auto-skips without the key — `npm test` = 56 pass + 1 skipped, no billing) + `scripts-ts/gemini-preflight.mjs`. **Next (owner-gated):** T13 deploy + platform-name; the Codex confirming pass (dated ~Jun 24, still required pre-deploy); + a documented tuning opportunity — refine the guardrail's "business verification" precision for live phrasing IN THE AGENT TIER (never the pinned core/differential). Everything below is earlier.

Build update: 2026-06-20 (goal mode) — **CROSS-MODEL GATE on the new (post-slice) batch: RAN (BLOCK) + FULLY RECONCILED (commit `c385936`; 56 Vitest + 3 Playwright e2e green); the CONFIRMING re-pass is BLOCKED on the Codex seat.** Codex batch-2 review found 1 P0 + 4 P1/P2 (billed-fail-$0 cap escape · ungated live-batch rows · incomplete placeholder/injection validation · blocker_source overclaim · dormant-state gap · "every claim" wording) — **all fixed + test-covered**. The confirming re-review hit the Codex usage limit — raw error surfaced verbatim: *"You've hit your usage limit … try again at Jun 24th, 2026 5:53 PM."* Per doctrine (surface raw · no retry/downgrade/switch — the seat is an OWNER action · **Codex-down ≠ gate-waived**): the confirming cross-model pass is a **dated obligation (≈Jun 24)**; the **live run (first billed Gemini call) + Vercel deploy HOLD** for it, UNLESS the owner accepts the test-verified reconciliation (56+3 green) as sufficient. **Everything buildable is DONE + green + committed (14 commits this session).** Remaining = owner-gated: **the key (T12 live run) · deploy (T13) · + this dated Codex confirming pass.** Resume prompt in HANDOFF. Everything below is earlier this session.

Build update: 2026-06-19 (build session 2, continued — goal mode) — **PHASES B + C + D-docs DONE, committed, GREEN; live path HARDENED + READY for the owner's Gemini key.** On top of the committed slice: (1) **Phase B domain depth** — `lib/domain/diagnosis.ts` (engagement state from last_login×steps×tenure + a reactivation play that *varies by engagement*, not just step + blocker_source merchant-vs-platform), cited from a `research-specialist` digest (`docs/research/merchant-activation-domain-2026-06-19.md`); add-alongside, **`lib/core`/differential untouched**; commit `3c1540b`. (2) **Phase C console** — shared nav + Eval/Quality · Metrics/Impact · Audit · Cost surfaces (a11y-minded); commit `3ca6986`. (3) **Live-path hardening (pre-Gemini, Codex P1):** prompt-**injection cut** (untrusted name never reaches the model — `{{MERCHANT}}` placeholder, substituted after gatekeeping) + **cumulative budget ledger** (`lib/agents/live-batch.ts`, fail-closed across a run); commit `b0acef4`. (4) **Phase D docs** — `docs/WHY.md` (the full why-chain, each why naming the rejected alternative + cost + a cross-industry "generalizes" note) + honest **today-vs-target README** rewrite; commit `89c7a00`. **Verification: `typecheck/lint/test/build` GREEN — 50 tests (differential byte-identical), `next build` prerenders all routes (this is also the console render-smoke).** **Then (goal-mode "keep building polish") DONE too: T10 Playwright e2e** (commit `bbb2c08`; 3 e2e green — queue+both HITL outcomes · full why-chain Merchant Detail incl. the diagnosis payoff · nav reaches every surface with `aria-current` · cost $0.00 · reduced-motion emulated; `test:e2e`/`verify:full` scripts added) **and the enterprise-readiness / adoption doc** (`docs/ENTERPRISE-READINESS.md`, commit `c59cf76` — controls · boundaries · gaps · the adapter-based adoption contract + expansion path). **THE AUTONOMOUS FRONTIER IS NOW FULLY REACHED — nothing buildable remains without the owner.** Test totals: **50 Vitest + 3 Playwright e2e**, typecheck/lint/build green. **Only remaining work is OWNER-GATED: T12 live Gemini run = `GEMINI_API_KEY` + <$5 (the headline; live path built + hardened + ready) · T13 Vercel deploy + platform-name confirm.** Owner offered the key; safe-`.env` instructions given (never in chat). Resume prompt in HANDOFF. Everything below this line is earlier this session + the pivot record.

Build update: 2026-06-19 (build session 2) — **THIN VERTICAL SLICE COMPLETE + GREEN; at the Codex gate, then owner commit+deploy gates.** Git-drift CORRECTED: build session 1's scaffold + core port + state-sync are **committed** (`HEAD = 4de4503`, with `f004d19` + `3182bfa`) — the owner committed them after the session-1 handoff was written, so the "surface the commit gate first" step is already resolved. Built this session (one merchant → end-to-end, all add-alongside; **`lib/core/*` and the golden differential lane untouched**): (1) **hybrid dataset** — real SF entities (DataSF `g8m3-pdis`, PDDL 1.0; **NAICS is sector-level so the honest crosswalk is Food Services→Restaurant, Retail Trade→Retail**; 20 real businesses frozen in `lib/data/sf-entities.snapshot.json`, PII-scrubbed to name+category) + a deterministic synthetic activation overlay (no wall-clock), with a source-swappable adapter + sanitizer + integrity/PII/drift guards (`lib/ingest/*`); (2) **bounded Gemini draft** — cost trio (budget hard-stop $5 fail-closed · pinned pricing · env-flags), Gemini wiring + preflight, `draftOutreach` mock/live/FAILED_TO_FALLBACK with a claims[] array (`lib/agents/{budget,pricing,gemini,draft}.ts`); **live AI OFF by default, mock path only, $0 spend**; (3) **claims-gatekeeper** — every claim traces to merchant data + guardrail + schema (`lib/agents/gatekeeper.ts`); (4) **draft-quality eval** — deterministic graders (structure/state-consistency/policy) with corrupted-record teeth (`lib/evals/draft-quality.ts`); (5) **REPLAY orchestrator** — deterministic end-to-end snapshot, $0 ledger (`lib/replay/run.ts`); (6) **two desktop surfaces** — Overview + Activation Queue and a full why-chain Merchant Detail (`app/page.tsx`, `app/merchant/[id]/page.tsx`), de-branded working name "Curbside Commons". **Verification: `npm run typecheck/lint/test/build` all GREEN — 43 Vitest tests (differential stays byte-identical), `next build` prerenders 23 pages (Overview + 20 SSG merchant pages).** Slice is **uncommitted** (intent-to-added via `git add -N` so the Codex diff sees it); **commit + Vercel deploy are owner-gated.** **Codex review DONE (verdict BLOCK — correct for a public deploy — reconciled): all fixable findings fixed → 43 green** (budget now fail-closed/ledger-required · billed-fail cost recorded · gatekeeper/UI overclaim softened · empty-corpus non-vacuous · `FETCHED_AT` override · honesty label tightened). **Deferred (binding):** live-prompt injection on `merchant_name` → Phase-B security pass (live OFF, no exploit ships); personal-name DBAs → owner deploy-gate decision. Codex confirmed non-findings (key not client-exposed · no dangerouslySetInnerHTML · snapshot name+category only · `lib/core/*` untouched). **Phase-B binding items recorded (do not lose):** live-path prompt-injection surface (merchant_name is untrusted prose into the live prompt — sanitizer strips control chars only; pair with the security-specialist pass) · re-verify Gemini pricing/model at the live-smoke gate · when live Gemini lands, the REPLAY accessor MUST switch from compute-at-load to a recorded frozen fixture (a live call isn't recomputable). Next: owner GO on the commit(s) + the deploy. Everything below is build session 1 + the pivot record.

Build update: 2026-06-19 (build session 1, after the pivot) — **REBUILD execution STARTED via `/autopilot`; first milestone GREEN.** (1) **Next.js/TS scaffold in + green** — Next.js 16 · React 19 · TS · Tailwind v4 · Vitest (mirrors resilix house style, minus DB/n8n); `npm run typecheck/lint/test/build` all pass. (2) **Deterministic core ported to TS** (`lib/core/{constants,types,guardrail,pipeline}.ts`) with a **differential test that reproduces the Python oracle `out/merchants_v1.csv` byte-for-byte across all 32 columns × 20 merchants + golden aggregates** (`evals/core-differential.test.ts`) — the Phase A faithful-port gate, met early. Platform name parameterized (default "DoorDash" for the oracle; product passes the de-branded name). (3) **Dataset Source-Intake decided** (owner, decision-log 2026-06-19): **SF "Registered Business Locations" / DataSF, PDDL 1.0** public-domain; Kaggle considered + rejected as a class. All new TS work is **uncommitted** (commit owner-gated, RULES §12) — a clean commit point is ready. Next: SF ingestion adapter (NAICS crosswalk) + the slice's Gemini-draft (mocked)/gatekeeper/eval/desktop-surface/REPLAY. Resume prompt in `HANDOFF.md`. Everything below this line is the pivot-recording + historical record.

Last updated: 2026-06-19 (**MAJOR PIVOT — goal rebuilt to a real, industry-ADOPTABLE, deployed Next.js/TS AI product; owner full-liberty GO; plan APPROVED.** The canonical goal/DoD/phases/blindspots now live in `~/.claude/plans/gentle-forging-starlight.md` (+ the decision-log 2026-06-19 row). Same use case (stalled/long-tail **merchant activation** on a local-commerce delivery marketplace), new delivery shape: single-stack **Next.js+TS+Tailwind+React on Vercel (free)** that **ports** the deterministic core (Python kept tagged `v1-python-prototype` + as a differential oracle), integrates **real bounded Gemini** (eval-gated · claims-gatekeeper · <$5), on **hybrid data** (real open-source entities + synthetic overlay), **equal-weight** Strategy/Ops/BA + deep applied-AI, full **why-chain**, **universally legible**, **desktop-only**, **adoption-grade**, job search in background. Carried forward unchanged: deterministic-first→bounded-LLM, eval-first, free-first, prototype-not-service, honesty. Execution engaged via **`/autopilot`** (owner-gated stops: commits · dataset check-in · platform-name · public posting · irreversible). **The pivot is recorded in the repo this session (decision-log + this header + CURRENT_TASK + HANDOFF + tooling ledger + roadmap DoD note); the actual build runs in a FRESH session — see the HANDOFF resume prompt.** Everything below this line is **historical** (the T-003 track the pivot supersedes). 35/35 tests + eval 20/20|45/45 remain the v1 proof + the differential-test oracle.)

Prior update: 2026-06-12, second session (**T-003 grill (Act 1) COMPLETE — 4 owner decisions locked: OQ-1 = rename the v1 CSV to a company-agnostic filename (git mv + the single `scripts/config.py:10` re-pin; content byte-identical; residuals frozen + provenance-labeled; Phase-7 publish-vs-exclude open) · OQ-2 = `out/` policy COMMIT-FRESH · PLATFORM_NAME = "Curbside Commons" (S1 collision check) · target market = US. Artifacts: `PLAN.md` + `PLAN-REVIEW-LOG.md` (grill-me-codex flow); plan = draft 3; 4 decision-log rows; open-questions intake Q3 resolved. **Codex Act 2 CONVERGED — VERDICT: APPROVED** (2026-06-12, 4 rounds, single read-only thread `019ebedb-…`; 15 findings → all accepted → draft 4 → 2 consistency rounds → clean APPROVED; full log in `PLAN-REVIEW-LOG.md`). The T-003 plan (draft 4) is grilled + survived 4 rounds of cross-model adversarial review. **Next = owner GO/NO-GO on building T-003** (no code written during the gate). Same session: effort doctrine corrected to AUTO-ADJUST-by-task (supersedes blanket MAX) + context doctrine (minimal · durable · fresh) encoded — CLAUDE.md/decision-log/claude-os/memory; the grill-me-codex skill + Act-2 harness were hardened (namespaced tmp paths, no `head`-pipe SIGPIPE) after an early cross-project verdict-contamination near-miss. 35/35 + eval 20/20|45/45 PASS reconfirmed live post-convergence; `out/` untouched (gate was docs/planning only). 35/35 tests + eval 20/20|45/45 PASS reconfirmed live at session start; no product code/tests/CSV/`out`/`eval` touched; all work uncommitted, pending owner.**)

Previous update: 2026-06-12 (**T-003 plan REVISED (draft 2); Codex gate not yet run (owner order: use the Codex account as it is — no cap-tracking/date-waiting/credit advisories; attempt, surface raw errors verbatim, stop); build awaits gate + owner GO.** This session: blueprint-review contradiction reconciled (job `bm0i9bxpy` did complete 2026-06-09; header + decision-log synced — re-scope + HYBRID rows now Accepted-via-DoD); [docs/phase3-prep-slice-plan.md](docs/phase3-prep-slice-plan.md) rewritten to add-alongside v1/v2 + ratified HYBRID + build-order slices S1–S5, with the live-code finding that `false_impact_claim` is regex-anchored on `doordash` (`scripts/guardrail.py:29-31` — S1 must parameterize it, proven by v1 staying 45/45 unmodified); the 2026-06-12 Codex review attempt orphaned (usage-limit errors on smoke tests) → deferred with written reason (RULES §9), re-attempt when the seat answers; README staleness fixed; 2026-06-09 task-log entry backfilled; CASE-STUDY overclaim corrected; **owner standing PROJECT-CONSTRAINTS adopted** (decision-log 2026-06-12: tooling ladder, Gemini routing inside the ~$5 cap, data-source biases not reopening the no-live-API decision, date-anchored vetting, Phase-7 specific expansion/adoption deliverable, product target-market = intake question, proposed default US); owner session rule encoded (proactively prompt fresh sessions at stage boundaries). 35/35 tests + eval 20/20|45/45 PASS reconfirmed live 2026-06-12. All work docs/governance — uncommitted, pending owner. Prior state below remains the historical record.)

Previous update: 2026-06-11 (**Goal RATIFIED — Portfolio Definition of Done (owner GO).** Owner-triggered `/claude-os` reassessment (Codex gpt-5.5/xhigh cross-check: AGREE ×4) found the use case sound but the objective drifted (project DoD open since 2026-06-01 while the completion bar stretched to L4). **Ratified DoD:** company-agnostic public repo + **on-demand prototype** (no 24/7 ops) for **local-commerce marketplace merchant activation** — deterministic triage · bounded Gemini drafting (best current model, **<$5 total**) vs the v2 baseline · human approval gate · idempotent simulated sends · hold/reject/send walkthrough · honest built-vs-designed docs. **Done = T-003 → Phase 3 → Phase 7 (pulled forward); Phases 4–6 optional (post-Phase-3 owner decision); L4 = designed ceiling, never the completion bar.** New owner doctrine encoded in `CLAUDE.md`: free-first runtime stack (sole paid exception Gemini, $5 hard total) · prototype-not-service identity · **Effort = MAX every stage, declared per stage (owner-global)** · project isolation. De-brand flipped **Proposed → Accepted** (company-agnostic but use-case-specific). Roadmap + open-questions synced; decision-log +3 rows +2 status updates. Prior state still valid: 2026-06-09 blueprint package drafted (its review-status contradiction is next-session step 1); T-001 23/23 + T-002 merged at `a95c0f1`; **35/35 tests + eval 20/20 | 45/45 PASS reconfirmed live 2026-06-11** (outputs to temp dirs; `out/` untouched); source CSV + `out/` untouched. All 2026-06-09 + 2026-06-11 work is docs/governance — uncommitted, pending owner.)

> Date note: the folder's earlier docs are dated 2026-06-02 while the current date is 2026-06-01; Git is now initialized (commit `b57cf2c`) so chronology is tracked going forward. Step order: (1) Codex initial review, (2) Codex open-source validation, (3) Claude governance review, (4) Claude plan reconciliation, (5) operating-system setup, (6) operating-system cleanup, (7) T-001 planning.

## Current Phase

**Stage 1 (T-001) is implemented, Codex-reviewed (twice), and green.** The offline pipeline (`scripts/`), tests (`tests/`, **23/23 pass** = T1–T18 + P2-1..P2-5), and generated artifacts (`out/`) exist. Canonical run: 20 merchants → 8 review queue (High, held), 12 simulated_sent, 0 rejected; source CSV byte-identical; send gate verified (T17); app re-run dedups (P2-1). Two Codex review rounds returned 4 + 2 × P2, **all fixed** (no P0/P1). Stdlib only — no network, no AI call, no integrations.

**Git state (re-derived 2026-06-09 — always re-derive from live `git status` + `git log -1`; do not trust this line):** branch `main`; `HEAD = 9958ec0` ("Audit build process compliance") — the 2026-06-04 audit/decision/state-doc batch **is committed there** (it was *not* uncommitted, as the prior line wrongly said). T-002 committed at `a95c0f1`, merged into `main`; `feature/t002-eval-harness` still at `a95c0f1` (behind `main`, not deleted). **Currently uncommitted (2026-06-09 Phase-3-prep planning batch, pending owner review + commit):** `docs/phase3-prep-slice-plan.md` (new), `.gitignore` (ignore `RULES_CONFIG_DUMP.txt`), and these state-doc syncs. Source CSV, `out/`, `scripts/`, `tests/`, `eval/` untouched. *(Git-line drift recurred a **4th** time: every state doc read `HEAD = dc7d131` while actual `HEAD = 9958ec0` — the audit commit that "fixed" the drift advanced HEAD and re-staled the docs it had just corrected. Durable fix proposed in [docs/phase3-prep-slice-plan.md](docs/phase3-prep-slice-plan.md) T-003c: make git-state re-derivation a **blocking close-out check**, not a written rule.)*

**T-001.5 (2026-06-02):** the **Enterprise Delivery Playbook** (`docs/enterprise-delivery-playbook.md`) codifies the professional delivery standard (traceability spine, lightweight-vs-full, source tiers, freshness, artifact policy, stage closure, failure taxonomy, public-claim control, handoff-proof, living-standard) with a Universal vs ActivationOps-specific split. **Mandatory Startup Contract** now enforces it at session start (`RULES.md` §15; `CLAUDE.md`; `CODEX.md` process-finding rule; task/review templates; checklist), with an anti-bloat one-line allowance for trivial edits.

## Decision Status (historical — 2026-06-01)

The governance review found the dominant risk was process, not data: ~12 review/audit docs, zero runnable code, no planning exit. `docs/plan-reconciliation.md` resolved that — it accepted Codex's safety controls, rejected the documentation gate and the 14-table V1 schema, fixed the V1 scope, set a one-line planning exit condition, and named the first implementation task. **This GO/NO-GO is now historical: the owner gave GO, and T-001 (the offline thin slice) was built, tested (23/23), and audited — closed with minor follow-ups. See Current Readiness / Current Next Step below.**

## Operating System (2026-06-01)

The project operating system is now in place so any tool/account can continue from the repo, not from memory: `RULES.md` (constitution; it wins on any conflict), `CLAUDE.md` / `CODEX.md` (roles), `CURRENT_TASK.md` + `HANDOFF.md` (continuity), `docs/dual-model-workflow.md` (verified Codex commands), `docs/project-narrative.md` (public methodology), `docs/implementation-journal.md`, `docs/decision-log.md`, `docs/checklists/prevent-repeat-checklist.md`, `docs/prompts/*`, and `docs/visuals/*`. This is operating infrastructure, not product — no product code, schema, or integration was created.

## Current Evidence

- Project folder originally contained one merchant CSV file before documentation scaffolding was added.
- CSV file found: `DoorDash Merchant Nudge Engine - Merchant Directory.csv`
- Parsed merchant records: 20
- CSV header issue: first two columns are both named `Merchant Name`; second column values indicate merchant category/type.
- Risk score is synthetic and matches the inferred formula across all rows.
- Git repository: **initialized** (initial commit `b57cf2c "Initial reviewed planning state"`). The operating system, Enterprise Delivery Playbook, Mandatory Startup Contract, source-intake standards, the Source Openness / state-sync batch, and the roadmap applicability review + Codex revision (incl. the eval-first ratification) are **committed** (OS setup at `49408d3`). **The current HEAD and working-tree state are tracked only in the canonical "Git state" line under Current Phase above — not restated here, to avoid git-line drift.**
- Files named "required"/"mandatory" by past prompts but never defined in the repo: `ALWAYS_READ.md`, `docs/audits/codex-compliance-audit.md`, `docs/audits/session-compliance-template.md`. Recorded as evidence of the rules-live-in-prompts problem (see Current Blockers), not as standing build blockers.

## What The Prior Validation Session Did (open-source validation, Session 2)

- Read the current validation work order.
- Read mandatory project files in order where present.
- Recorded missing mandatory files.
- Re-validated the CSV facts.
- Checked current official/open sources for AI workflow design, structured outputs, n8n, Slack, Resend, Supabase, Google Sheets, and agentic security.
- Audited the prior Codex initial review.
- Created an open-source validation review.
- Created this session's compliance audit.
- Updated task log and open questions.

## Sources Checked

- Anthropic agent/workflow guidance.
- OpenAI agent, guardrail, tracing, and eval guidance.
- Gemini structured output documentation.
- n8n error handling, webhook, and human-in-the-loop docs.
- Slack request verification, interactivity, and message docs.
- Resend send email, webhook, and event docs.
- Supabase security and Row Level Security docs.
- Google Sheets API usage limits.
- OWASP LLM and MCP security guidance.
- Recent public research on agentic workflow injection and AI coding-tool engineering pitfalls.

## Current Readiness Score

The single blended "readiness" number is retired (earlier it rose as more review docs were written — rewarding documenting over shipping). Current state, two tracks:

- Shippable/build readiness: **T-001 (offline thin slice) is implemented, tested, and audited.** A reviewer can run `python3 scripts/run.py` and `python3 -m unittest tests.test_t001 -v` → **23/23 pass.** T-001 is **closed with minor follow-ups**.
- Standards/governance completeness: high and now **anchored in the repo** — `RULES.md`, the Enterprise Delivery Playbook, the Mandatory Startup Contract, and the Source Intake + Open Source Discovery rules were applied to T-001 without retroactively breaking it.

The discipline now is to build the next capability *under* these standards, not to add more of them.

## Current Blockers

**No build blockers.** T-001 is shipped and green; the prior pre-build blockers were all resolved *before* T-001 was built (historical record in `docs/plan-reconciliation.md` and `docs/task-log.md`):

- Planning had no exit → resolved (the owner gave GO and the slice was built).
- Rules lived in prompts → resolved (`RULES.md` is the canonical in-repo source).
- Prompt-invented "mandatory files" → de-scoped.
- V1 data shape ambiguous → resolved to one entity file + append-only event logs, not 14 tables.
- "Agentic" naming → dropped for V1.

The only open items are hygiene/decision follow-ups (see Current Next Step); none block work.

## Current Next Step

1. ~~Implement T-001 → Codex review rounds → fix P2 → commit → ground-rules audit → T-001.7 post-playbook alignment audit~~ — **done**; 23/23 pass; T-001 **closed with minor follow-ups** (`docs/audits/post-playbook-alignment-audit.md`).
2. ~~Roadmap batch commit~~ — **done** at `df2b986` (`docs/roadmap.md` on `main`).
3. ~~Owner: review + commit the uncommitted work — `docs/t002-slice-plan.md` + four state-doc syncs~~ — **done**; committed at `a95c0f1` and merged to `main` (`dc7d131`). *(This item was left stale post-merge — the recurring git-line-drift failure — and is corrected by [docs/audits/build-process-compliance-audit.md](docs/audits/build-process-compliance-audit.md).)*
4. **Hygiene / decision follow-ups (non-blocking):**
   1. restore or decide the `out/` generated-log tracking policy (`git checkout -- out/audit_log.csv out/model_runs.csv`, or gitignore the two volatile logs);
   2. decide whether **enforcement hooks** for CSV-immutability / secrets-blocking should become a future approved task.
5. **T-002 — merged to `main`** (`a95c0f1`; cleanup `dc7d131`): golden + regression JSON, `scripts/eval.py`, `tests/test_t002.py` (E1–E10 + E1b/E2b), baseline `eval/eval_baseline.v1.json`. **35/35** tests (T-001 23 + T-002 12); `python3 scripts/eval.py` PASS. **8 Codex review rounds completed before commit (all findings resolved).** **Next:** clear the pre-Phase-3 gate ([docs/audits/build-process-compliance-audit.md](docs/audits/build-process-compliance-audit.md)). Phase 3 (Gemini) still after baseline acceptance.
6. **Goal ratified (2026-06-11, owner GO)** — Portfolio DoD (see `docs/decision-log.md`). ~~Reconcile the blueprint-review status~~ + ~~revise the T-003 plan to add-alongside/HYBRID~~ — **both done 2026-06-12** (plan = draft 2). **Next concrete step (Effort: MAX — auto-routed; ship-gating/high-risk per the 2026-06-12 auto-adjust doctrine):** smoke-test the Codex seat → when alive, run **Act 2** (grill-me-codex read-only adversarial loop, MAX_ROUNDS=5) against `PLAN.md` → apply findings → owner GO → build T-003 (S1 de-brand → S2 draft contract → S3 v2 hybrid lane → S4 adversarial corpus → S5 hooks). Owner inputs: **all 4 grill questions answered 2026-06-12** (OQ-1 rename · OQ-2 commit-fresh · Curbside Commons · US); remaining owner calls = GO after Act 2, commits, Phase-7 publish-vs-exclude.

Off the table until far later: live Supabase, n8n, Slack, Resend, or real Gemini calls; real credentials; any real merchant data; live outbound email.

## Files Created Or Updated This Session

T-002 implementation (2026-06-04, **merged to `main` at `a95c0f1`**, cleanup `dc7d131`): `eval/golden_merchants.v1.json`, `eval/guardrail_regression.v1.json` (45 cases), `scripts/eval.py`, `tests/test_t002.py`, `eval/eval_baseline.v1.json`, plus a +1-line `scripts/guardrail.py` `pii_or_secret` hardening and the matching `docs/v1-data-dictionary.md` §9 sync; **35/35** tests (T-001 23 + T-002 12); eval CLI PASS. Source CSV and `out/` untouched. **8 Codex review rounds completed before commit** (all findings resolved).

T-002 slice plan (2026-06-04, docs): created `docs/t002-slice-plan.md`; now marked implemented.

Roadmap Codex-review correction (2026-06-02, lightweight): applied the two Codex findings to `docs/roadmap.md` — recast **Project Operating Model and Governance** from a numbered build phase to a completed **Foundation** (renumbered the product phases to 1–7; updated all in-doc phase cross-references), and cleared the stale eval-first-T-002 ratification follow-ups in `CURRENT_TASK.md` + `PROJECT_STATE.md` (Open Questions). Kept genuinely-open items (`out/` log policy; enforcement-hooks). **No new roadmap scope; no `decision-log` change; no product code/tests/CSV/`out`/integration change; no commit (owner decides). T-002 not started.**

Roadmap creation (2026-06-02, lightweight): created `docs/roadmap.md` — a short, product-first roadmap (Current Status; Product Lifecycle loop; a governance Foundation + 7 product-first Build Phases with per-phase goal / build / validation / out-of-scope / trigger; a plain "Why T-002 Comes Before Gemini"; a tiny Terminology note with **no** framework-mapping section; a "What Not To Do Yet" list). Uses the ratified **T-002 = Offline Evaluation and Regression Harness**. Synced `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. **No `decision-log` change (no new decision); no product code/tests/CSV/`out`/integration change; nothing installed/adopted; no commit (owner decides). T-002 not started.**

Codex-review revision pass (2026-06-02, lightweight): applied the four Codex adversarial-review findings to `docs/review-packets/roadmap-lifecycle-applicability-review.md` (eval-first ratified + named **Offline Evaluation and Regression Harness**; no framework-mapping section in the roadmap by default; EDD downgraded to preprint/practice reference; product-first roadmap guidance) and added a top revision note; recorded the **eval-first T-002 ratification** in `docs/decision-log.md`; corrected the stale `PROJECT_STATE.md` git/current-state lines; synced `CURRENT_TASK.md` / `HANDOFF.md` / `docs/task-log.md`. **No `docs/roadmap.md`; no new files; no product code/tests/CSV/`out`/integration change; nothing installed/adopted; no commit (owner decides).**

Roadmap / Lifecycle / Build-Phase Applicability Review (2026-06-02, review/planning only): created `docs/review-packets/roadmap-lifecycle-applicability-review.md` (broad source discovery across NIST AI RMF + GenAI Profile + SSDF, DORA, Google SRE, MLOps/LLMOps, LLM eval / golden-dataset / regression / evaluation-driven development, HITL gates, walking-skeleton/tracer-bullet/vertical-slice, provenance/lineage, portfolio red-flags; each term classified use-now/later/reference/reject). Verdict: industry terms as honest mapping not phase names; product-named phases; RULES §3 = lifecycle spine; **T-002 = Offline Evaluation Harness** (evaluation-first), eval-before-Gemini justified but a §6 reorder needing owner ratification; recommend Codex review before any roadmap. Updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. **No roadmap written; no `decision-log` entry; no code/tests/CSV/`out`/integration change; nothing installed/adopted.**

Source Openness Clarification Pass (2026-06-02, lightweight, wording-only): added an **Open Source Discovery** rule (named sources/frameworks/repos/vendors/communities/examples = candidates and seeds, not boundaries; search broadly incl. Reddit/forums/YouTube/SO as field-signals; **tiers judge quality, not restrict discovery**; *maximum useful research ≠ endless*; community = signal not proof unless corroborated). Edited `docs/enterprise-delivery-playbook.md` (new subsection in the Source-Backed Research Standard), `RULES.md` §14, `CLAUDE.md`, `CODEX.md` (8 flag conditions), `docs/prompts/claude-task-template.md`, `docs/prompts/codex-plan-review-template.md`, `docs/prompts/codex-changed-files-review-template.md`, `docs/checklists/prevent-repeat-checklist.md`; updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. No restrictive wording existed to remove (grep = false positives only); no new standing files; no decision-log entry (no decision made); no product code/tests/CSV/`out`/integration/scope change.

T-001.7 post-playbook alignment audit (2026-06-02): created `docs/audits/post-playbook-alignment-audit.md`; fixed the known-stale `docs/v1-slice-plan.md` (test list → T1–T18 + P2-1..P2-5 = 23; `--fresh` note; status → implemented); corrected state-doc git-state. Vault read-only-inspected (exemplary boundary). Verdict: T-001 closed with minor follow-ups; next stage = offline eval harness (not Gemini). No product code/tests/CSV changes.

T-001.6 source-intake CORRECTION (2026-06-02): rewrote `docs/research/source-intake-review.md` from direct sources — read 3 PDFs directly, web-inspected all 5 GitHub repos, re-checked live official Claude Code docs (best-practices/features-overview/hooks/sub-agents); added explicit source-status separation + honest gaps (55 MB architect guide not loaded; model docs/changelog not fetched; GPT-5.5 UNVERIFIED). Updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. Nothing adopted; no governance edit. No product code/tests/CSV/`out`/integration changes.

T-001.6 source-intake review (2026-06-02): created `docs/research/source-intake-review.md` (summary-only basis; superseded by the correction above).

Source/Pattern/Reference Intake rule (2026-06-02): `docs/enterprise-delivery-playbook.md` (new section), `RULES.md` (§14 bullet), `CLAUDE.md`, `CODEX.md`, `docs/checklists/prevent-repeat-checklist.md`, `docs/decision-log.md` (row); updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. Integrated into the playbook, no new files. No product code/tests/CSV/`out`/integration changes.

Mandatory Startup Contract enforcement (2026-06-02): `RULES.md` (§15), `CLAUDE.md` (startup section), `CODEX.md` (process-finding rule), `docs/prompts/claude-task-template.md` (Professional Process Applied block), `docs/prompts/codex-changed-files-review-template.md` + `docs/prompts/codex-plan-review-template.md` (process checks), `docs/checklists/prevent-repeat-checklist.md`; updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. No product code/tests/CSV/`out`/integration changes.

T-001.5 Enterprise Delivery Playbook (2026-06-02): created `docs/enterprise-delivery-playbook.md`; pointer/obligation edits to `RULES.md` (§14), `CLAUDE.md`, `CODEX.md`, `docs/checklists/prevent-repeat-checklist.md`; updated `CURRENT_TASK.md` / `HANDOFF.md` / `PROJECT_STATE.md` / `docs/task-log.md`. Reduced single-doc form (no separate matrix/log files). No product code/tests/CSV/`out`/integration changes.

T-001.5 blindspot review (2026-06-02): created `docs/review-packets/T-001.5-standards-blindspot-review.md`.

T-001 ground-rules audit (2026-06-02): created `docs/audits/T-001-ground-rules-audit.md`; corrected git-state wording in `PROJECT_STATE.md` / `CURRENT_TASK.md` / `HANDOFF.md`; updated `docs/task-log.md` + `docs/implementation-journal.md`. No product code/tests/CSV/integration changes.

codex
Startup evidence confirms this is a Codex adversarial changed-files review under the repo’s lightweight offline slice rules. I’m continuing without edits and will not run any destructive commands; next I’m deriving the exact diff and locating all fee claim-id/tagger paths.
exec
/bin/zsh -lc "sed -n '1,220p' CLAUDE.md" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "sed -n '1,220p' CODEX.md" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
# CODEX.md — Codex Role

Codex is the **adversarial reviewer, changed-files reviewer, rescue debugger, and pre-ship auditor** for ActivationOps AI.

`RULES.md` is the source of truth. Codex continues from repo files, not memory. Codex does not set product scope — it pressure-tests the work and reports.

## When Codex is used

Full workflow and exact commands: `docs/dual-model-workflow.md`. In short:

- **Plan review** — `/codex:adversarial-review` — challenge the approach, assumptions, tradeoffs, and failure modes. Review-only; never edits.
- **Changed-files review** — `/codex:review` (usually `--background`) — correctness, edge cases, tests, security/privacy, duplicate-send risk, docs. Review-only; never edits.
- **Rescue / debug** — `/codex:rescue` — investigate or fix when tests fail or debugging stalls. **Can edit files.** For diagnosis-only, say so explicitly in the request.
- **Pre-ship audit** — a `/codex:review` or adversarial-review pass before any milestone or publish.

## What Codex looks for

- Correctness and edge cases.
- Missing tests.
- Security and privacy risks (secrets, webhook verification, least privilege, log redaction).
- Duplicate-send / idempotency gaps.
- Scope or architecture drift vs. `docs/decision-log.md` and `docs/plan-reconciliation.md`.
- Unsupported claims, including AI-honesty (`RULES.md` §4) and no-fake-impact rules.
- A clear **ship / no-ship** recommendation with reasons.

## Playbook verification (required)

Per `docs/enterprise-delivery-playbook.md`, Codex also verifies whether Claude *applied* the standard — not just whether the code is correct:

- task classification present and appropriate;
- framework / tool / source rationale given where required;
- alternatives and assumptions stated;
- validation evidence real (tests/output), not asserted;
- scope control (no silent scope/tool/architecture drift);
- source sufficiency (important claims sourced or marked UNVERIFIED);
- model/API/tool freshness where the choice matters;
- artifact policy applied where relevant;
- new-information discoveries classified;
- handoff accuracy (incl. git state re-derived, not assumed);
- public-claim control (nothing unsupported; "simulated" labels; dev tools not presented as runtime);
- whether the process weight (lightweight vs full) fits the risk.

Every Codex review (plan or changed-files) verifies the **Mandatory Startup Contract** (`RULES.md` §15) for meaningful tasks:

- whether Claude followed the Enterprise Delivery Playbook;
- whether the task classification is correct;
- whether the chosen process is lightweight or full **for the right reason**;
- whether sources / framework / tool rationale are sufficient;
- whether **source/pattern/reference intake** was applied before adopting anything external (no default adoption; borrow/reject/adapt/defer classified; approval gate for high-impact);
- whether **source discovery was open enough** for the risk (named lists treated as seeds, not boundaries). Flag a process finding if Claude: treats an example/source list as exhaustive; forces a named framework without checking applicability; ignores stronger/current sources; ignores mature OSS or field-signal sources when the task needs them; uses stale sources for current claims; relies on Reddit/forums/YouTube/community content as authoritative without verification; fails to search beyond user-provided examples when the risk requires it; **or** over-researches low-risk work after source sufficiency was reached;
- whether assumptions, risks, validation, and artifacts are handled correctly;
- whether there is **silent scope expansion**;
- whether handoff and **git state** are accurate (re-derived, not assumed);
- whether the **Prompt Intake Protocol** (`RULES.md` §16) was applied for owner-driven work — raw input preserved, intent captured without dilution, added assumptions surfaced (not buried), proportionality right (no friction on trivial, no silent guessing on consequential).

**If Claude skipped the playbook/startup contract for a meaningful task, flag it as a process finding** (not just a code finding). Do not flag trivial low-risk edits where a one-line Professional Process Applied block is sufficient.

## Standard

Find root causes and operational failure modes, not just surface issues. Tie every finding to evidence: a file, a diff, a row, or a cited source. Mark platform claims UNVERIFIED unless backed by current docs or the installed tool (`RULES.md` §6).

## Do not (yet)

No production schemas, n8n workflows, Slack/Resend integration code, Apps Script refactor, secrets, or live credentials until the offline thin slice is complete and the human approves the next stage.

 succeeded in 0ms:
# CLAUDE.md — Claude Code Role

Claude Code is the **main planner and builder** for ActivationOps AI.

`RULES.md` is the source of truth. If this file and `RULES.md` ever disagree, `RULES.md` wins.

## Mandatory Startup Contract (every session, every account, including CLI)

Begin every session by:

1. Reading `RULES.md`.
2. Reading `CLAUDE.md`.
3. Reading `PROJECT_STATE.md`.
4. Reading `CURRENT_TASK.md`.
5. Reading `HANDOFF.md`.
6. Reading `docs/enterprise-delivery-playbook.md`.
7. Running `git status`.
8. Running `git log --oneline -8`.
9. Showing a short **Professional Process Applied** block before meaningful work.
10. Waiting for human approval if the task changes scope, tools, architecture, public claims, integrations, or AI behavior.

Then summarize current phase, active task, changed files, unfinished work, risks, and the next safest step. You are continuing one shared project from the repo, not starting your own from memory.

**Professional Process Applied** (show before acting) — include: task type · stage · risk level · lightweight or full mode · framework/principle/tool basis · source requirement · validation method · artifact policy (if relevant) · documentation required · Codex review needed or not · human approval needed or not. Keep it clear enough for a nontechnical reviewer. **For a small, low-risk edit this can be one line** — do not over-ceremony trivial work.

**Stop condition:** if you cannot identify the task type, risk level, validation method, or whether lightweight/full mode applies, **stop and ask the human owner before acting** (`RULES.md` §15).

## Skills (required)

Claude Code must use relevant skills from the configured skills folder when they apply. Before a task, identify:

- task type;
- relevant skill(s);
- why the skill applies;
- whether any skill conflicts with `RULES.md`.

If a skill conflicts with project rules, `RULES.md` wins. Use the smallest relevant set, not every skill. Record skill usage in `docs/task-log.md`.

## Enterprise Delivery Playbook (required)

Follow `docs/enterprise-delivery-playbook.md`. On every meaningful task, Claude Code must:

- **Apply the playbook** and **classify the task** (type, stage, risk, public/internal, lightweight or full).
- Open with a short **Professional Process Applied** block before substantive work (task type · stage · risk · mode · framework/tool/source basis · validation · docs required · artifact policy if relevant · Codex review needed? · human approval needed?) — clear enough for a nontechnical reviewer.
- **Distinguish universal rules from ActivationOps-specific rules** when reasoning or changing the playbook.
- **No silent scope, tool, or architecture changes** — surface them and route to the human (and `docs/decision-log.md` if material).
- **Apply the Source, Pattern, and Reference Intake rule** (playbook) before using any external source/pattern/tool/template/methodology — evaluate first, no default adoption, classify borrow/reject/adapt/defer, and get approval for high-impact adoptions.
- **Search broadly (Open Source Discovery, playbook):** treat sources/frameworks/repos/communities named in the repo or a prompt as **candidates/seed lists, not boundaries**. For meaningful tasks, look beyond them — official/vendor/standards docs, mature OSS, GitHub issues, eng blogs, and community field-signals (Reddit/forums/YouTube/SO) — proportional to risk; use tiers to weigh quality, not to limit discovery; community = field signal, not proof; stop when more research won't change the decision.
- **Record new useful discoveries** (classify: immediate fix / next-stage / reusable / roadmap / rejected / needs research).
- Keep explanations **clear for laypeople without reducing depth**.
- Document **tool/model/API freshness** where the choice affects implementation, cost, security, public claims, or compatibility.
- **Classify generated artifacts** (commit / regenerate / ignore / examples / internal) where relevant.
- Translate the owner's rough request into a professional workstream before acting; **input can be messy, execution must be professional.**

## What Claude does

- Plans focused, small slices (use `docs/prompts/claude-task-template.md`).
- Builds one slice at a time and runs checks.
- Requests Codex review of the plan (`/codex:adversarial-review`) and of changed files (`/codex:review`). See `docs/dual-model-workflow.md`.
- Fixes accepted issues, updates docs and handoff, and commits only when the human approves committing.
- Keeps deterministic logic, structured outputs, decisions, and logs ahead of AI calls and automation (`RULES.md` §3).

## Constraints (carried from the review phase)

- Do not implement against the current CSV as an enterprise source of truth.
- Do not wire live Slack, Resend, Supabase, Gemini, or n8n until the offline thin slice exists and safety controls are defined.
- Start with deterministic data modeling, validation, and idempotency before LLM generation or outbound delivery.
- Keep changes staged and reviewable. No silent architecture drift.

## Honesty

Human-led, AI-assisted, professionally reviewed. Never claim "no AI was used" or "AI built this." Never claim real DoorDash access, data, or business impact. Verify platform claims or mark them UNVERIFIED (`RULES.md` §6).

## Operating Doctrine (owner-set, 2026-06-09)

Standing operating policy set by the owner. It **refines** `RULES.md`; if it ever conflicts with `RULES.md`, `RULES.md` wins. Recorded in `docs/decision-log.md`.

**Models & cost**

- **Codex** is **reserved for review, rescue, and adversarial review** — never primary authoring (Claude builds; Codex challenges). **Model/effort policy (owner-updated 2026-06-11/12, claude-os flags):** the **latest available model + effort auto-routed by task — ship-gating reviews → `xhigh`** (supersedes the fixed gpt-5.5/quota-throttled scheme; `~/.codex/config.toml` default remains `gpt-5.5` @ `xhigh`, which the `/codex:*` commands and `codex exec` inherit — no pins to swap). **No cap-tracking (owner order):** never gate work on a remembered quota date — smoke-test the seat, run when it works, and **surface any raw error verbatim**; never silently retry, downgrade, or switch accounts (seat/credits management is an **owner action**). If the model id ever errors, treat it as a **freshness signal** and re-verify against current Codex docs (`RULES.md` §6).
- **Gemini** (Phase 3, still gated): use the **current latest production model**, **freshness-checked at the time of use** (official docs/changelog, dated — `RULES.md` §6), and keep spend **under $5**. This is a **policy**, not a pinned version — never assert a specific Gemini version from memory.
- **Tech-stack selection = best-fit, cost-aware (owner-updated 2026-06-25; refines the 2026-06-11 free-first rule + the 2026-06-12 tooling-ladder from a *hard gate* into a *default bias*):** choose the tool that best serves the **project goal** — a credible, modern, bounded multi-agent AI capability (portfolio-grade but real, company-agnostic). **Free / free-tier / self-hostable OSS stays the default bias** (cost-aware; widely-used / enterprise-grade-or-common preferred), but it is **no longer a hard gate**: a clearly-better **paid or enterprise-grade** tool is allowed **where it materially serves the goal**, with (i) a named justification, (ii) a live date-anchored freshness/price check (`RULES.md` §6), and (iii) for any consequential pick (architecture · cost · AI behavior) **owner sign-off + a Codex cross-check** before it's treated as decided. **Still binding:** the **Gemini API** stays the cost-tracked LLM path with a **$5 hard total budget**; honesty/simulated-labels (`RULES.md` §4) and the **prototype-not-service** identity hold; dev tooling (Claude/Codex) is unaffected, on existing plans. *(Supersedes the prior "free-only runtime, Gemini the sole paid exception, no other paid/metered tool" reading and relaxes the ladder's "only-paid-exists → build a free equivalent or defer" hard step — both kept as the cost-discipline default this rule relaxes only on justified, goal-serving grounds. decision-log 2026-06-25.)*
- **Standing PROJECT-CONSTRAINTS adopted (owner-set 2026-06-12; source: `~/claude-os/docs/PROJECT-CONSTRAINTS.md`; decision-log row 2026-06-12):** the cross-project tooling ladder applies (native/free/open first → self-hosted-over-cloud default → free tiers with recorded ceilings + fallbacks → trials = evaluation only, never load-bearing → only-paid-exists = build a free equivalent or defer); **Gemini routing is designed inside the ~$5 cap** (free tier for dev/test → Flash-class for volume → Pro-class only where genuinely needed — latest generation, tier by need; refines the bullet above); data-source biases (latest/fresh · open · live · hybrid) are judgment-weighted preferences that do **not** reopen this project's Codex-no-shipped live-runtime-API decision; every stack/tool/dataset choice is vetted against **live, date-anchored sources** (extends RULES §6); a **specific expansion & adoption path** is part of project completion (see roadmap Phase 7); owner-side anchors US — the **product's target market is an explicit intake question, never assumed**.
- **Project identity — prototype, not an operated service (owner-set, 2026-06-11):** ActivationOps AI is a **prototype solving a use case, run on demand** (demo / eval / walkthrough runs) — **not a 24/7 operated service**. No always-on hosting, uptime, deployment, or ops requirements may be introduced as if they were goals; free tiers are sized for episodic runs (which is why they suffice); production-scale operation stays a **documented** Enterprise Expansion Path, never a build target unless the owner re-decides. Any future integration phase, if approved, is a **transient demonstration** of a flow, not standing infrastructure.

**Effort & project isolation**

- **Effort level (owner-updated 2026-06-12 — supersedes the 2026-06-11 blanket "MAX every stage"): AUTO-ADJUST by task, one rule for both Claude and Codex — common across all the owner's projects.** Model + effort are routed by the task's demands: maximum depth where the task warrants it (ship-gating reviews, architecture, AI behavior, security, public claims, data-model changes → max / Codex `xhigh`), proportionally lighter on trivial or low-risk work. **Still declare the routed effort level explicitly in every Professional Process Applied block** (an "Effort:" item — state the level *and* why the task routes there). The anti-bloat ceremony allowance (`RULES.md` §15) is unchanged. Dev models align: Codex = latest model + auto-routed effort (ship-gating → `xhigh`; config default `gpt-5.5` @ `xhigh`); Gemini = best current model (<$5).
- **Context doctrine (owner-set, 2026-06-12): minimal · durable · fresh — context auto-adjusts by task, like effort.** (1) **Load what the task needs and no more** — progressive disclosure: the startup-contract docs are the fixed base; everything else is read when the task calls for it, never front-loaded "just in case" (dilutes attention, wastes tokens). (2) **Anything durable lives in the repo, not the conversation** (RULES §1) — decisions → decision-log, state → state docs, the chat is disposable. (3) **Arrange stable-before-volatile** — deterministic rehydration (same docs, same order) keeps prompt caching effective. (4) **A fresh session with a good handoff beats a long session with a degraded context** — cut at stage boundaries with the paste-ready resume prompt (the existing 2026-06-12 session rule is the reset policy of this doctrine). Source basis: Anthropic context-management guidance (progressive disclosure / context-editing / compaction / file-based memory; via the claude-api reference, cached 2026-05-26) — this project implements the equivalents repo-natively (state docs = memory; HANDOFF resume prompt = compaction; stage cuts = reset).
- **Project isolation (owner-set, 2026-06-11):** the owner runs **multiple concurrent projects**. Never mix them — this repo's doctrine, decisions, and context apply **here only**; never import another project's rules, state, or artifacts into this one (or vice versa). When in doubt which project a directive belongs to, ask.

**Public-doc honesty + free alternatives**

- Public docs stay honest (`RULES.md` §4, §6, §8): no unsupported claims, "simulated" labels kept, dev tools (Claude/Codex) never shown as the product runtime.
- For **every paid tool named in a public doc, name a credible free / open-source alternative** next to it (e.g., in the runtime-stack table) so the work reads as cost-aware and not locked to paid vendors.

**Handoff**

- **Always end a handoff with a paste-ready resume prompt** — a copy-paste block the next session (or the owner) can run verbatim to resume with full context. This is in addition to the playbook's Handoff-Proof Standard.
- **Proactively prompt a new session when the conversation runs long (owner-set 2026-06-12):** don't grind on in a degraded long context — when the session is long, tell the owner it's time to cut to a fresh session, at a natural stage/step boundary where possible (plan→build, slice→slice, review-applied→awaiting-GO). Timing is Claude's call; the obligation is to *prompt*, always with the paste-ready resume prompt above. Finish or safely checkpoint the in-flight step first (state docs synced) so nothing is lost at the cut.

**Recommendation validation**

- **Validate every recommendation for correctness and bias** before giving it: source it where claims matter, state remaining uncertainty, and check for one-sided framing. When a recommendation is **consequential** (scope, architecture, tools, data model, AI behavior, integrations, public claims, cost, or security), **get a Codex cross-check** before it is treated as decided.

## Prompt Intake (always)

Before acting on owner input, apply the **Prompt Intake Protocol** (`docs/prompt-intake-protocol.md`; `RULES.md` §16): preserve the owner's raw words verbatim, reconstruct the true intent, and synthesize an effective prompt aligned to the current model + playbook — **without diluting or summarizing**. Default to **silent** intent-capture; surface a structured interpretation or a confirm only when the request is **ambiguous or consequential**. Raw input is authoritative; surface added assumptions explicitly; when unsure, ask.

## Reference reading (when relevant to the task)

`docs/project-narrative.md`, `docs/plan-reconciliation.md`, `docs/dual-model-workflow.md`, `docs/product-brief.md`, `docs/data-audit.md`, `docs/decision-log.md`, `docs/decisions/ADR-001-initial-architecture.md`.

exec
/bin/zsh -lc "sed -n '1,220p' docs/enterprise-delivery-playbook.md" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
# Enterprise Delivery Playbook

Status: living standard (T-001.5). `RULES.md` is still the constitution; this playbook is the *how*. If they ever conflict, `RULES.md` wins.

How to read this: most of the document is the **Universal Professional Delivery Standard** (reusable on any project). Lines marked **→ ActivationOps AI:** are this project's specific interpretation. The product is **ActivationOps AI**; Claude Code and Codex are *development workflow tools*, never the runtime stack.

## Purpose

Turn rough, casual, exploratory, or incomplete requests into **professional, traceable execution**. The owner is allowed to be messy; the work is not. Output should feel **human-led, AI-assisted, professionally reviewed** — clear, practical, modern, and understandable to a layperson, deep enough for a technical reviewer, and never AI-churned.

**Input can be messy. Execution must be professional.**
- Claude Code translates the rough request into a professional workstream before acting.
- Codex verifies whether that workstream was actually followed.
- ChatGPT web may give stage-level executive review, scope calls, and tie-breaks.
- The human owner makes final product, architecture, tool, publishing, and scope decisions.
No assistant silently turns a suggestion into a decision.

## Universal Professional Delivery Standard

Every meaningful task must be traceable from rough idea to professional execution:

**use-case classification → source scan → framework/tool selection → alternatives → assumptions → implementation approach → validation evidence → failure handling → reuse potential → enterprise expansion path → handoff → human approval.**

Apply it *proportional to risk* (see Lightweight vs Full). The chain is the spine; the sections below are how each link is satisfied without bloat.

## ActivationOps AI Application

ActivationOps AI is currently an **offline, AI-assisted operational workflow-automation thin slice** for a DoorDash-style merchant-onboarding simulation on **dummy data**. T-001 normalizes 20 dummy merchants, scores risk deterministically, diagnoses blockers, queues high-risk merchants for human review, generates one stubbed guardrailed outreach draft, gates simulated sends behind approval, and writes audit logs — with tests T1–T18 + P2 coverage.

It **may** later become a human-in-the-loop *agentic* workflow automation system, but **V1 must not overclaim agentic behavior** — V1 is deterministic logic + a bounded, stubbed AI draft step. "Agentic" is a roadmap label only.

This playbook applies to this project as written, with the project-specific callouts below.

## Task Classification

Before acting on a meaningful task, state:
- **task type**, **stage**, **risk level**, **public-facing or internal**, **lightweight or full workflow**, **source requirement**, **validation requirement**, **documentation requirement**, **Codex review requirement**, **human approval requirement**.

Task types: use-case discovery · research · planning · architecture · data modeling · implementation · testing · debugging · AI workflow design · guardrails · security/privacy · reliability/idempotency · integrations · documentation · visual/demo · publishing · post-stage review.

## Lightweight versus Full Workflow

**Lightweight** (low-risk, deterministic, offline, docs): classify task → define the acceptance check → run relevant checks/tests → update task log → update handoff. That's it.

**Full** (high-risk): source-backed basis → alternatives considered → assumptions → risks/blind spots → validation evidence → Codex review → human approval → lessons documented.

**High-risk includes:** AI behavior · guardrails · security/privacy · integrations · live sends · data writes · architecture changes · tool selection · reliability guarantees · public-facing claims · publishing · pricing/free-tier/API-behavior claims.

When unsure which mode, use Full. Do not run Full on a 30-line deterministic change — that is the bloat this project already warned about.

**→ ActivationOps AI:** T-001 sub-tasks were lightweight; guardrails, the send-gate, and any future integration are full.

## Source-Backed Research Standard

Do not rely on memory for important claims. Use broad, diverse sources when the task needs it. Source quality tiers:
- **Tier 1** — official docs, standards bodies, framework/vendor owners.
- **Tier 2** — reputable engineering blogs from known companies.
- **Tier 3** — open-source repos with real usage, docs, issues, examples, adoption.
- **Tier 4** — practitioner writeups, forums, Reddit, YouTube, newsletters.
- **Tier 5** — generic blogs / SEO content.

Use Tier 1 first for correctness; use lower tiers for practical examples, edge cases, and field signals. Every source-backed task states: sources **checked**, **used**, **rejected**; why the used sources were credible; why coverage is **sufficient**; remaining uncertainty.

**→ ActivationOps AI:** the Codex command surface was verified against the installed plugin (Tier 1, local), and vendor behaviors (Slack/Resend/Supabase/n8n/Gemini/Sheets) were cited to official docs in the initial review — generalize that, lightly.

### Open Source Discovery (named sources are candidates, not constraints)

Sources, frameworks, repos, tools, examples, communities, and patterns named anywhere in this repo (or in a task prompt) are **starting points / prior references — not boundaries.** For any meaningful task, do **not** limit research to previously named sources, uploaded documents, familiar repos, known frameworks, official docs alone, or prior examples. **Search broadly and task-specifically**, then choose what fits ActivationOps AI by source **quality, relevance, freshness, maturity, validation value, and risk**.

Search breadth (as the task warrants): official docs · standards bodies · vendor docs · mature open-source repos · GitHub issues / discussions / PRs / examples / changelogs · reputable company engineering blogs · product / UX / UI / design / portfolio references · LLMOps / MLOps / agent / eval / guardrail references · security / privacy / compliance references · automation/workflow examples (incl. n8n / Zapier / Pipedream / Slack / Resend / Supabase / Postgres / Gemini *when relevant*) · practitioner blogs & newsletters · Reddit & relevant subreddits · forums · YouTube videos/transcripts · Discord/community where accessible & appropriate · Stack Overflow / Q&A · recent changelogs / release notes / migration guides / issue threads.

**Use the source tiers (above) to judge quality, not to restrict discovery.** If a source list appears in a task prompt, treat it as a **seed list, not a complete list**, unless the owner explicitly says it is complete.

**"Maximum useful research" ≠ endless.** It means: search broadly enough to avoid blind spots; include current official sources where claims matter; include mature OSS / real-world examples where useful; check Reddit/forums/YouTube/community for **field signals** (pain points, failure modes, user language, adoption gotchas); compare against similar or better alternatives; verify community claims against stronger sources; then **stop when more research is unlikely to change the decision, and document remaining uncertainty.** Proportional to risk — a one-line scan for trivial edits; broad discovery for high-risk / AI / integration / security / public-facing / tool-selection work.

**Source-use distinction (how much weight each carries):**
- Official / current docs = **source of truth** for factual platform / API / model / tool / security / pricing / deprecation / legal / privacy / compatibility claims.
- Mature open-source repos = implementation & architecture evidence.
- Company engineering blogs = professional-practice evidence.
- GitHub issues / discussions = real-world failure / adoption signals.
- Reddit / forums / YouTube / community posts = **field signals, not proof by themselves** — not authoritative unless backed by official docs, source code, maintainers, or multiple independent credible signals.
- Generic / SEO blogs = low-confidence background only.

When sources disagree, **state the disagreement, weigh by credibility and recency, and do not overstate the conclusion.**

### Source & Validation Depth (how many is enough)

Grounded in professional norms — journalism's **two-source rule** (≥2 independent sources with direct knowledge), research **triangulation** (≥3 converging sources/methods), and the **IFCN fact-checking code** (use the best-available **primary** source; check each key claim against **more than one** named source; cite so the check is replicable). **Independence + primary-source quality matter more than raw count.**

| Bar | Depth | When |
| --- | --- | --- |
| **Minimum** | **≥2 independent**, **≥1 primary/Tier-1** | any load-bearing claim |
| **Good** (default) | **3 independent (triangulated)**, ≥1 Tier-1, cross-checked + cited | normal professional work |
| **Strong** | **5+ across tiers** (official + mature OSS + field-signal), disagreements surfaced | architecture · security · public claims · AI behavior · tool selection |

Single-source only when it is the sole authority on the topic — and label it. Prefer primary/official over secondary. Cite so another person can replicate the check.

### Expert & Industry-Practice Validation

For meaningful work, validate the approach against **how leading practitioners and enterprises actually do it** — not merely whether it is internally consistent. Mechanisms: the Open Source Discovery sweep (above) · a **Codex adversarial review** · and, on demand, the **`guidelines-monitor`** agent (independent best-practice authority across domains). Verify for accuracy; surface where our approach diverges from best practice and why.

## Source Sufficiency Rule

Research must be enough, not endless. Before acting, state: what was checked, used, rejected; why it is enough now; what uncertainty remains; whether that uncertainty blocks action.
- If uncertainty does **not** block a low-risk task → document it and proceed.
- If uncertainty touches **security, architecture, public claims, integrations, AI behavior, or tool choice** → stop and ask the human owner.

## Source, Pattern, and Reference Intake

Applies to **every task**, not just research tasks. **Do not adopt anything by default** — no source, repo, template, workflow, tool, code/prompt/UI/design pattern, doc style, automation example, architecture, framework, or methodology — until it passes intake. Covers planning · code · data modeling · testing · AI prompts/agent patterns · guardrails · evals · security/privacy · n8n/Zapier/Pipedream · Slack/Resend/Supabase · Gemini/other models · Claude skills · Codex workflows · MCP · knowledge-management (e.g., Obsidian) · dashboards · UI/UX · visual design · README · portfolio case study · demo · docs · publishing.

Before adopting, evaluate (**proportional to risk** — one line for low-risk; full for high-risk):
1. problem it solves · 2. relevance to the task · 3. currency · 4. official / reputable / mature / experimental · 5. stronger or official confirming sources · 6. similar alternatives · 7. what to borrow · 8. what to reject · 9. what to adapt · 10. what to defer · 11. universal/reusable vs · 12. ActivationOps-specific · 13. risk / scope creep / bloat it could add · 14. validation that proves the adapted version works.

Classify each useful discovery: immediate fix · playbook improvement · future-stage input · reusable standard · roadmap reference · project-specific note · rejected/no action · needs more research. (Reuse the **source tiers** above and the **Reuse Classification** section — do not duplicate them.)

Preference order: official/current → mature open-source examples → reputable company engineering references → practitioner examples (field signals) → generic content (low-confidence background only).

**Approval gate:** do not install / clone / copy / adopt / build from any source until the intake decision is clear, **and** get human approval when the adoption affects scope, architecture, tools, data model, AI behavior, integrations, public claims, or publishing.

Claude applies this before using any external reference or pattern. Codex verifies it and flags **skipped intake on a meaningful task** as a process finding. Keep it short for trivial edits; use full intake for high-risk, AI, integration, architecture, security, public-facing, or tool-selection work.

## Framework, Principle, and Approach Selection Rationale

Don't just name a method. For each meaningful framework/principle/approach, record (proportional to risk): the problem it solves · the source/evidence for it · why it fits this task · alternatives considered · why alternatives were rejected/deferred · who/what kinds of teams use it (where evidence exists) · what is adopted as-is · what is adapted · what is intentionally not used · remaining assumptions · how success is validated · what is reusable. Applies to planning, architecture, data, code, AI workflow, security, reliability, design, docs, demo, publishing.

## Tool and Tech Stack Selection Rationale

Every major tool/technology gets a rationale: tool · purpose · why chosen · official docs checked · alternatives · why not the alternatives · cost/free-tier · security/privacy · integration risk · local/offline version · enterprise-scale version · validation method · replacement/upgrade trigger.

Applies to: Python · CSV/Google Sheets · Gemini · Supabase · n8n · Pipedream/Zapier (if considered) · Slack · Resend · Mermaid · dashboard/UI tools · testing tools · any future framework/library.

**No silent tool changes.** Any add/remove/replace/upgrade/downgrade must document: what changed · why · trigger · alternatives · migration impact · risks created · validation required · human approval.

## Model, API, and Tool Freshness Rule

Any model/API/platform/integration choice that affects implementation, cost, security, public claims, or future compatibility must include a freshness check: current supported version · official docs/changelog checked · deprecation/retirement risk · upgrade trigger · fallback · **date checked** · whether the uncertainty blocks action. Applies to Gemini, Supabase, n8n, Slack, Resend, Pipedream, Zapier, Claude Code, the Codex plugin, SDKs, APIs, and any future model/tool.

## Planning Discipline

Every meaningful planning task explains: the problem · work type · stage · sources/references/examples checked · framework/method/principle and why · alternatives · assumptions · risks/blind spots · implementation sequence · out-of-scope · validation before implementation · what Codex should challenge · what human approval is needed. Planning must not be vague — but must not become a broad open-ended loop (this project's documented anti-pattern).

## Implementation Discipline

Every meaningful implementation task explains: what was implemented · why this way · step sequence · method/principle used · source/official docs if applicable · edge cases · what failed/changed · why · how diagnosed · how fixed · how verified · tests/checks proving it · what to reuse · what not to repeat · what is deferred. No silent improvisation; fix logic, not tests.

## Reproducibility Standard

Every runnable stage documents: required runtime · commands to run · expected outputs · test command · known generated files · reset/reproduce instructions · what to commit · what to ignore · how a new reviewer verifies the result. Do not call a stage reproducible unless another person can run the documented commands and understand the expected output.

**→ ActivationOps AI:** runtime = Python 3 stdlib only; `python3 scripts/run.py [--fresh]`; tests `python3 -m unittest tests.test_t001 -v` (23/23); generated files in `out/`; source CSV is read-only and hash-checked.

## Artifact Policy

Classify every generated artifact: source artifact · generated demo artifact · temporary build artifact · public portfolio artifact · internal-only artifact · ignored artifact. For each, state whether to commit · regenerate · ignore · move to examples · keep internal. Applies to `out/`, screenshots, exported dashboards, generated logs, demo files, diagrams, future public artifacts.

**→ ActivationOps AI:** `out/merchants_v1.csv` and `out/review_queue.csv` are **deterministic snapshots** (commit-stable demo artifacts). `out/audit_log.csv` and `out/model_runs.csv` are **append-only logs that change on every run** — open policy decision: either commit only a single `--fresh` run and treat re-runs as throwaway, or gitignore the two logs while keeping the snapshots. `__pycache__`/`*.pyc` are ignored.

## Data and Privacy Classification

Classify every dataset: real · synthetic · dummy · anonymized · generated fixture · public sample · internal-only. Never include real merchant data, personal data, credentials, tokens, or private company data.

**→ ActivationOps AI:** all merchant data is **dummy/synthetic** and does not represent any DoorDash internal system. Contact emails are synthetic `@example.com`.

## Validation and Acceptance Evidence

Every stage ends with evidence: tests passed · command output · source hash unchanged · generated output inspected · Codex review result · human approval · files changed · risks closed · open issues · next stage. Work is not "done" because an assistant says so — it is done when the evidence shows it.

## Stage Closure Criteria

A stage closes only when: scope complete or intentionally deferred · tests/checks pass · docs match implementation · artifact policy is clear · handoff is accurate · open issues are classified · next stage is named but not started · human owner approves closure. If not all true, classify the stage as **open**, **ready with minor follow-ups**, **blocked**, or **closed**.

## Failure Taxonomy and Rectification

Classify each failure: data defect · logic bug · test gap · documentation drift · scope drift · tool limitation · source uncertainty · security/privacy risk · model-output risk · integration risk · human-process failure · handoff failure · public-claim risk.

For each meaningful failure document: what failed · type · why · how diagnosed · options considered · fix chosen · why this fix · source/principle/prior-decision supporting it · validation evidence · prevention added · whether the lesson is reusable. **Do not hide failed attempts. Do not rewrite history to look smoother.**

## Decision Reversal Rule

When reversing a prior decision, document: original decision · why it changed · new evidence · impact on existing work · migration/cleanup required · validation after reversal · human approval. Applies to tool/model choices, architecture, data model, workflow logic, public claims, and stage direction.

## New Information and Blindspot Capture

When research/coding/testing/debugging/review surfaces something new, don't ignore it. Classify it: immediate fix · next-stage improvement · reusable standard · roadmap idea · rejected/no action · needs more research. For each useful discovery record: what was found · source · why it matters · whether it improves this project · whether it is reusable elsewhere · whether it exposes a blind spot · action taken/deferred · validation needed. If it changes scope, architecture, tool choice, data model, security, public claims, or AI behavior → record in `docs/decision-log.md` and ask for human approval.

## Reuse Classification

Classify useful things created/discovered: reusable prompt · reusable checklist · reusable regex/guardrail · reusable architecture pattern · reusable test pattern · reusable documentation pattern · reusable workflow template · project-specific only · rejected/no reuse. Reference genuinely reusable items in this playbook or the task log — **do not turn every small lesson into a new permanent file.**

## Enterprise Expansion Path

Every V1 decision says how it could evolve: current V1 choice · why enough now · what breaks at enterprise scale · future enterprise version · upgrade trigger · risks before upgrade · validation needed before upgrade. Do not build enterprise complexity before the simpler layer proves value.

**→ ActivationOps AI:** CSV logs now → Supabase/Postgres later · stubbed AI now → Gemini structured output later · simulated send now → Resend later · no approval UI now → Slack approval later · local tests now → CI/evaluation harness later.

## Public Claim Control

For README, portfolio, LinkedIn, demos, screenshots, public artifacts — no claim is allowed unless it is **proven by tests, shown in demo output, documented as simulated, supported by a source, or clearly labeled roadmap.** Public docs focus on ActivationOps AI, not the build tools; Claude Code/Codex appear only as a short "Development Workflow" note, never as runtime stack. Never claim "no AI was used" or "AI built this." Framing: **human-led, AI-assisted, professionally reviewed.**

## Public Demo Walkthrough Standard

Every public demo explains: the problem the viewer sees · the input used · what the system does · where AI helps · where deterministic logic controls risk · where human review is required · what output proves the workflow · what is simulated · what is roadmap. Guide a layperson without reducing technical depth.

## Professional Experience Quality

Applies to docs, visuals, UI, README, dashboards, demos, walkthroughs, code comments, public presentation. The work should feel clear, modern, minimal, elegant, intuitive, professional, human-reviewed — easy for a layperson, deep enough for a technical reviewer. Modern patterns (cards, glassmorphism, gradients, micro-interactions, animation, diagrams, polished layouts) are **allowed when they improve clarity, navigation, storytelling, or understanding**. Avoid generic AI wording, fake polish, random decoration, confusing navigation, unsupported claims, overdesigned visuals, unreviewed AI output. **Make complex work understandable without making it shallow.**

## Accessibility and Usability Baseline

Public docs, demos, dashboards, diagrams, and UI are reviewed for: clear hierarchy · readable language · clear labels · contrast · navigation clarity · layperson understanding · mobile/responsive awareness where relevant · visual restraint · no decorative complexity that hides meaning.

## Handoff-Proof Standard

A handoff is valid only if another Claude account, Codex session, ChatGPT review, or human can answer: what stage are we in? · what was last completed? · what is committed? · what is uncommitted? · what files changed? · what tests prove the current state? · what risks remain? · what is out of scope? · what is the next safe step? · what should not be repeated? Do not rely on chat memory — the repo must be enough.

**Every handoff/state update must re-derive git state from `git status` and `git log --oneline -8`. Never infer git state from memory.** (This rule exists because the handoff git-line went stale three times in T-001.)

## Stage-Gate Checklist


exec
/bin/zsh -lc 'git log --oneline -8' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-HhaSljpZ' (errno=Operation not permitted)
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-QFJCxegz' (errno=Operation not permitted)
627d282 WRAP: fourteenth session — GitHub publish executed (repo live PRIVATE at sharanlabs/commerce-truth-audit, main tracking origin, About set); public flip HELD by owner ruling at the surfaced author-email exposure (advisor-mandated identifier sweep); four Pub defaults ratified by directive; state docs synced
8f81b9e AUTHORIZATION: owner arms the GitHub publish (fourteenth session) — directive verbatim + intent capture + four defaults ratified + advisor sweep findings recorded pre-push
312b0fe WRAP: thirteenth session — state docs corrected to the true push status (repo-create+push DENIED by the harness permission layer; publish act returned to the owner as a one-command act); Pub slice itself committed at 4489ad9 with both gates SHIP
4489ad9 PUB SLICE: publication-ready — README replaced (truth-audit program fronted, legacy = lineage), PUBLICATION writeup + byte-locked demo recording, LICENSE Apache-2.0 + NOTICE (O6 closed, C9 red-green), C10 honesty gate extended over public prose (live bite red-green), surface rename → Commerce Truth Audit (descriptive interim, S-11 open; banner-only sanctioned golden regen), legacy CSV relocated + py-config regression fixed, source-lockfile relocked for Pub (L4/L6/L8 + L12-L15; Juniper dropped; zero PENDING-RELOCK among used facts), sanitization audit clean (141 commits, no secrets ever) — Codex chain SHIP (BLOCK×4 reconciled → closing SHIP, 5 raws; batch@medium deviation recorded) + acceptance-gate SHIP (verify handoff discharged raw: verify 743+6, legacy 306+5, python 35) (plan §5 Pub, C4/C7/C9/C10)
4275aff F1B LIVE SLICE: owner-armed classifier calibration RAN — label DEFERS (run #2 authoritative: held-out 20/21 strictly beats 19/21 baseline; enhanced recall 3/4 misses the ≥0.80 floor; conjunctive rule; snapshot frozen + eval-locked; run #1 ENOENT incident on record, harness probe-write fix) + live Groq lane wired (leak-free, FAILED_TO_FALLBACK, $0, env-gated; wired→true) + C5 MEASURED via installed ucp-schema 1.3.0 (33/35 + 2 documented format-class divergences, clean-PATH reproducible) + Gemini color declined + license deferred to Pub — Codex gate SHIP (1P1+2P2+1P3 reconciled red-green + confirming + narrow-confirm raw) + acceptance-gate flip-discharged SHIP (plan §5 F1 live leg, C5/C8)
c73c100 WRAP: eleventh session — M2 ceremony discharged (Codex batch reconciled + confirming pass + acceptance-gate SHIP; F1 module ACCEPTED at 550e3cb); state docs synced; owner decisions surfaced (live classifier run unblocked, arming prompt set)
550e3cb M2 CEREMONY: F1 module ACCEPTED — batched Codex BLOCK (2P1+2P2+1P3) all reconciled red-green (c-2 asserted-passthrough warn state; classifier floor amended pre-run to >=20/21 strictly-beats-baseline; mixed-month parser rejection; L-tagged unique claim ids + sanctioned golden regen; drift-lock kind+source_clause) + confirming pass ALL DISCHARGED + acceptance-gate SHIP 5/5 (plan §5 M2, S-4)
265efcf WRAP: tenth session — F1 offline core shipped (F1a 896ab59 + F1b bda6314); advisor-ruled M2-before-live-legs ordering; inline-tail deviation recorded; state docs synced; M2 resume prompt set

exec
/bin/zsh -lc 'git status --short && git status --branch --short' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-yC0QEXHp' (errno=Operation not permitted)
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-A6gL0zEI' (errno=Operation not permitted)
 M docs/suggestions-ledger.md
 M lib/packs/fees/audit.ts
 M lib/packs/fees/classified-audit.ts
 M lib/packs/fees/finding.ts
 M lib/packs/fees/index.ts
?? docs/reviews/advisory-nits-verify-evidence.log
?? docs/reviews/codex-2026-07-06-advisory-nits-raw.md
?? evals/packs/fees-advisory-nits.test.ts
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-jTMyniPr' (errno=Operation not permitted)
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-kvws3jWu' (errno=Operation not permitted)
## main...origin/main
 M docs/suggestions-ledger.md
 M lib/packs/fees/audit.ts
 M lib/packs/fees/classified-audit.ts
 M lib/packs/fees/finding.ts
 M lib/packs/fees/index.ts
?? docs/reviews/advisory-nits-verify-evidence.log
?? docs/reviews/codex-2026-07-06-advisory-nits-raw.md
?? evals/packs/fees-advisory-nits.test.ts

exec
/bin/zsh -lc 'git diff --stat && git diff --name-status' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-rK7umwUA' (errno=Operation not permitted)
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-PHIIDeZZ' (errno=Operation not permitted)
 docs/suggestions-ledger.md         | 10 +++++-----
 lib/packs/fees/audit.ts            | 38 +++++++++++++++++++++++++++++++-------
 lib/packs/fees/classified-audit.ts |  8 ++++----
 lib/packs/fees/finding.ts          |  2 +-
 lib/packs/fees/index.ts            |  2 ++
 5 files changed, 43 insertions(+), 17 deletions(-)
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-M5SZnx0L' (errno=Operation not permitted)
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-UVr8FDyG' (errno=Operation not permitted)
M	docs/suggestions-ledger.md
M	lib/packs/fees/audit.ts
M	lib/packs/fees/classified-audit.ts
M	lib/packs/fees/finding.ts
M	lib/packs/fees/index.ts

codex
Professional Process Applied: task type changed-files review; stage advisory-nits closure; risk low/medium because it touches deterministic fee IDs and golden stability; mode lightweight with deep targeted review; basis repo diff plus fee pack corpus/goldens/tests; validation by static diff inspection, corpus searches, and targeted test/evidence log reads; no edits, commits, or live integrations.
exec
/bin/zsh -lc "sed -n '1,260p' docs/reviews/gate-2026-07-04-m2-f1-module.md" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "sed -n '1,260p' docs/reviews/advisory-nits-verify-evidence.log" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "sed -n '1,260p' evals/packs/fees-advisory-nits.test.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
# Acceptance-gate record — M2 module boundary, F1 fee-audit module

**Date:** 2026-07-04 (eleventh session). **Judge:** independent `acceptance-gate` subagent (read-only on the artifact; no Bash in its thread — gate 3 ran as an explicit verify-handoff, returned raw and judged). **Maker≠judge:** the makers were the delegated F1a/F1b builders + the Fable-seat M2 reconciliation; the gate produced none of the artifact. **Scope:** F1a `896ab59` + F1b `bda6314` + the working-tree M2 reconciliation diff (18 modified files + 4 new `docs/reviews/` records; committed immediately after this verdict — see git log).

## Verdict: **SHIP — all five ordered gates PASS.** The F1 fee-audit module is **ACCEPTED at the M2 boundary**.

| Gate | Result | Substance |
| --- | --- | --- |
| 1 · grill | PASS | The gate independently re-derived the "monthly-fail ⟺ both statutory bases fail" equivalence (exact); U1 provisionality confirmed constructor-ENFORCED, not narrated; the denominator-undercount limitation documented in code + corpus README; relabeling honestly deferred (null answer-key ids). "No hand-waving found." |
| 2 · codex cross-model | PASS (authenticated, not re-run) | The M2 batch (BLOCK 2P1+2P2+1P3) → reconciliation (ALL 5 accepted + red-green) → mapped confirming pass (ALL FIVE DISCHARGED + 1 residual P3 comment fix) chain authenticated against the raw records and the code — every fix physically present at the claimed lines. |
| 3 · verify | PASS (via handoff) | Its thread had no Bash → 4-item handoff executed by the main session and returned raw: `npm run verify` EXIT=0 **720 passed + 5 skipped** (54+4 files); `npm run test:legacy` EXIT=0 **306+5**; statement fixtures byte-unchanged (empty numstat); `lib/packs/listings` / `legacy` / `evals/gold` untouched (empty diff); the e1 test-count discrepancy it tripwired (F1a log "10" vs committed 8) resolved with git evidence — two pre-commit-transient builder-tree tests, never committed, nothing deleted from any commit; honesty note added to the M2 record. The gate confirmed the decomposition "reconciles all three number chains simultaneously — the strongest available signal the return is genuine." |
| 4 · enterprise+taste | PASS (full) | Integer-cent money, pure clockless engine, loud zero-coercion parser, single sanctioned constructor enforcing C2+U1 at runtime, canonical serialization + deterministic ordering, both-direction drift-lock. Three NON-BLOCKING advisory nits recorded for a future slice: stale field-level comment `finding.ts:63`; object-identity `lineIndex` in `audit.ts` (unreachable via the parser); `#` inside arbitrary `declaredCategory` makes claim ids unparseable though still unique. |
| 5 · anti-slop | PASS | No debug residue/TODO/dead code/AI tells across the module + records; em-dash density = the repo's owner-ratified house style, checked-and-accepted; advisory `deslop_code.py --base main` = **0/100 clean, 0 findings**. |

## Consequences (the gate's own terms)

1. The module is ACCEPTED **as it stands on disk**; the reconciliation diff is committed as-is; any edit beyond it re-opens the gate. The three gate-4 advisory nits are deliberately LEFT UNTOUCHED for the next slice for exactly this reason.
2. **The owner-gated live classifier run may now be SURFACED — surfaced, not started.** It remains an explicit OWNER decision bound to the pre-registered floors of `docs/plan-f1b-classifier.md` §3.1 (accuracy ≥ 20/21 STRICTLY beating the 19/21 baseline, tie = DEFER; per-class recall floors; K=3 at temp 0; one paced Groq pass with preflight; scored on the held-out test split only).
3. Process lesson (routed to `~/claude-os/tasks/lessons.md`): re-run or annotate an evidence log's red-green counts AT COMMIT TIME, not only mid-build — the F1a log faithfully recorded a pre-commit state that two never-committed tests made unrepresentative of the shipped artifact.

**Advisor note:** the gate's thread found the harness advisor tool unavailable (12th consecutive observation across threads). Main-session `advisor()` also down (11th session); `frontier-advisor` consults succeeded at both M2 judgment boundaries (pre-approach ruling carried from the tenth session; pre-verdict consult this session after one owner-confirmed seat-limit retry).

 succeeded in 0ms:
# M2 GATE-4 ADVISORY NITS — RED-GREEN EVIDENCE (2026-07-06, fourteenth session)

Scope: the three NON-BLOCKING advisory nits recorded at the M2 acceptance gate
(docs/reviews/gate-2026-07-04-m2-f1-module.md, gate 4) and deliberately left
"for a future slice" per the gate's commit-as-is terms. This is that slice.
Owner arming word (verbatim): "so complete all other steps now except github,
design everyother aspect." (2026-07-06)

## Nit 3 — '#' in arbitrary declaredCategory/orderId made claim ids unparseable

RED (executed 2026-07-06, pre-fix):
  - evals/packs/fees-advisory-nits.test.ts: 6/6 FAILED (claimIdPart/makeLineTagger not exported)
  - behavioral probe (node --experimental-strip-types, direct-constructed statement,
    orderId "OR#D-9", declaredCategory "promo#extra"):
      PRE-FIX d-1 claim id: OR#D-9#promo#extra#L0 | split('#') segments: 5   <-- ambiguous
GREEN (executed 2026-07-06, post-fix):
  - same probe: OR%23D-9#promo%23extra#L0 | split('#') segments: 3          <-- unambiguous, reversible
  - fix: claimIdPart escape ('%'->'%25', '#'->'%23') on the ARBITRARY id components
    (orderId, declaredCategory) in lib/packs/fees/audit.ts (d-1, c-1, c-2 warn ids)
    + lib/packs/fees/classified-audit.ts (advisory id). Enum categories + schema
    month untouched. BYTE-IDENTITY on every committed corpus value (no fixture
    contains '#' or '%'): all fees freeze/golden tests pass unchanged.

## Nit 2 — object-identity lineIndex rendered a silent "Lundefined"

RED: no loud path existed; lineTag(l) returned "Lundefined" for a non-member line
  (unreachable via the parser; reachable by direct construction/refactor).
GREEN: shared makeLineTagger(statement) in audit.ts (also adopted by
  classified-audit.ts, replacing its duplicate map) THROWS
  "not a member of statement.lines" on an object-identity miss;
  test "throws LOUDLY on a line object that is not a member" passes (value-equal
  clone of a member line -> throw).

## Nit 1 — stale field-level comment (finding.ts:63)

The FeeFinding.verdict comment claimed the field is "the §20-563.3(e) verdict
state" — stale since M2 added the non-(e) c-2 state `asserted-passthrough-unverified`.
Reworded to name both families. Comment-only.

## Suite

  npx vitest run evals/packs/fees-advisory-nits.test.ts  -> 6 passed (RED: 6 failed pre-fix)
  npm run verify                                          -> EXIT 0, 749 passed + 6 skipped
                                                             (743+6 -> 749+6; +6 = this test file)
  Golden freeze tests (fees + listings + demo): PASS — corpus byte-unchanged.
  Diff scope: lib/packs/fees/{audit,classified-audit,finding,index}.ts
              + evals/packs/fees-advisory-nits.test.ts (new). Nothing else touched.

 succeeded in 0ms:
import { describe, expect, it } from "vitest";
import {
  auditStatement,
  auditWithClassification,
  claimIdPart,
  makeLineTagger,
  type LineItemClassifier,
  type MonthlyStatement,
  type StatementLine,
} from "@/lib/packs/fees";

/**
 * M2 GATE-4 ADVISORY NITS, closed (gate record docs/reviews/gate-2026-07-04-m2-f1-module.md,
 * gate 4: "recorded for a future slice" — this is that slice, 2026-07-06):
 *
 *  1. `#` inside an arbitrary `declaredCategory` (or `orderId`) made claim ids
 *     unparseable (still unique). Now: the arbitrary components are escaped via
 *     `claimIdPart` ('%'→'%25', '#'→'%23') — identity on every committed corpus
 *     value (no fixture contains '#' or '%'; goldens stay byte-frozen), reversible
 *     via decodeURIComponent-style unescaping, so `id.split("#")` is unambiguous.
 *
 *  2. Object-identity `lineIndex` maps rendered a silent "Lundefined" tag for a
 *     line object that is not a member of `statement.lines`. Now: the shared
 *     `makeLineTagger` throws loudly instead (unreachable via the parser — this is
 *     a defensive contract for direct constructors/refactors, not a behavior change).
 *
 * RED-GREEN: pre-fix, the d-1 claim id for declaredCategory "promo#extra" was
 * "ORD-9#promo#extra#L0" — split("#").length === 4, ambiguous (executed RED,
 * 2026-07-06, docs/reviews/advisory-nits-verify-evidence.log); post-fix it is
 * "ORD-9#promo%23extra#L0" — exactly 3 unambiguous segments.
 */

const unescapePart = (s: string): string => s.replace(/%23/g, "#").replace(/%25/g, "%");

const line = (over: Partial<StatementLine>): StatementLine => ({
  orderId: "ORD-1",
  month: "2026-06",
  declaredCategory: "delivery_fee",
  label: "Delivery fee",
  amountCents: 100,
  orderPurchasePriceCents: 2000,
  isRefund: false,
  passthroughDocumented: false,
  ...over,
});

const statement = (lines: readonly StatementLine[]): MonthlyStatement => ({
  meta: {
    simulated: true,
    generator: { name: "test", seed: 1, version: "1.0.0" },
    merchant: "Test (simulated)",
    month: "2026-06",
    currency: "USD",
    asOf: "2026-08-15",
    purchasePriceBaseConvention: "assumed base",
  },
  lines: [...lines],
});

describe("claimIdPart (nit 3: '#' in arbitrary id components)", () => {
  it("is byte-identity on every committed corpus value shape (no '#'/'%')", () => {
    for (const s of ["ORD-1", "delivery_fee", "promo_fee", "service_and_delivery", "2026-06"]) {
      expect(claimIdPart(s)).toBe(s);
    }
  });

  it("escapes '#' and '%' reversibly (round-trip)", () => {
    for (const s of ["promo#extra", "50%#off", "a%23b", "%", "#"]) {
      expect(unescapePart(claimIdPart(s))).toBe(s);
      expect(claimIdPart(s)).not.toContain("#");
    }
  });

  it("d-1 claim id with '#'-bearing orderId + declaredCategory splits into exactly 3 unambiguous segments", () => {
    const report = auditStatement(statement([line({ orderId: "OR#D-9", declaredCategory: "promo#extra" })]));
    const d1 = report.findings.find((f) => f.ruleId === "NYC-563.3-d-1");
    expect(d1).toBeDefined();
    const segments = d1!.claim.id.split("#");
    expect(segments).toHaveLength(3);
    expect(unescapePart(segments[0])).toBe("OR#D-9");
    expect(unescapePart(segments[1])).toBe("promo#extra");
    expect(segments[2]).toBe("L0");
  });

  it("advisory (classifier) claim id is escaped the same way", () => {
    const mock: LineItemClassifier = {
      name: "test-mock",
      earnsLabel: false,
      classify: () => ({ predicted: "not-a-permitted-fee", rationale: "test" }),
    };
    const report = auditWithClassification(statement([line({ declaredCategory: "promo#extra" })]), mock);
    expect(report.advisoryFindings).toHaveLength(1);
    const segments = report.advisoryFindings[0].claim.id.split("#");
    expect(segments).toHaveLength(4); // orderId # category # L<i> # classifier
    expect(unescapePart(segments[1])).toBe("promo#extra");
    expect(segments[3]).toBe("classifier");
  });
});

describe("makeLineTagger (nit 2: object-identity lineIndex)", () => {
  it("tags member lines by statement position", () => {
    const s = statement([line({ orderId: "ORD-1" }), line({ orderId: "ORD-2" })]);
    const tag = makeLineTagger(s);
    expect(tag(s.lines[0])).toBe("L0");
    expect(tag(s.lines[1])).toBe("L1");
  });

  it("throws LOUDLY on a line object that is not a member of statement.lines (was a silent 'Lundefined')", () => {
    const s = statement([line({})]);
    const tag = makeLineTagger(s);
    const clone = { ...s.lines[0] }; // equal by value, different object identity
    expect(() => tag(clone)).toThrowError(/not a member of statement\.lines/);
  });
});

exec
/bin/zsh -lc 'git diff -- lib/packs/fees/audit.ts lib/packs/fees/classified-audit.ts lib/packs/fees/finding.ts lib/packs/fees/index.ts docs/suggestions-ledger.md' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "rg -n \"claimId|claim id|claim-id|expectedClaimId|split\\(|#|lineIndex|makeLineTagger|Lundefined|Lundedfined|claim\\.id|finding\\.id|FeeFinding|FeeVerdict|verdict\" lib/packs/fees evals fixtures docs/reviews/gate-2026-07-04-m2-f1-module.md" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 122ms:
docs/reviews/gate-2026-07-04-m2-f1-module.md:1:# Acceptance-gate record — M2 module boundary, F1 fee-audit module
docs/reviews/gate-2026-07-04-m2-f1-module.md:3:**Date:** 2026-07-04 (eleventh session). **Judge:** independent `acceptance-gate` subagent (read-only on the artifact; no Bash in its thread — gate 3 ran as an explicit verify-handoff, returned raw and judged). **Maker≠judge:** the makers were the delegated F1a/F1b builders + the Fable-seat M2 reconciliation; the gate produced none of the artifact. **Scope:** F1a `896ab59` + F1b `bda6314` + the working-tree M2 reconciliation diff (18 modified files + 4 new `docs/reviews/` records; committed immediately after this verdict — see git log).
docs/reviews/gate-2026-07-04-m2-f1-module.md:5:## Verdict: **SHIP — all five ordered gates PASS.** The F1 fee-audit module is **ACCEPTED at the M2 boundary**.
docs/reviews/gate-2026-07-04-m2-f1-module.md:12:| 4 · enterprise+taste | PASS (full) | Integer-cent money, pure clockless engine, loud zero-coercion parser, single sanctioned constructor enforcing C2+U1 at runtime, canonical serialization + deterministic ordering, both-direction drift-lock. Three NON-BLOCKING advisory nits recorded for a future slice: stale field-level comment `finding.ts:63`; object-identity `lineIndex` in `audit.ts` (unreachable via the parser); `#` inside arbitrary `declaredCategory` makes claim ids unparseable though still unique. |
docs/reviews/gate-2026-07-04-m2-f1-module.md:15:## Consequences (the gate's own terms)
docs/reviews/gate-2026-07-04-m2-f1-module.md:21:**Advisor note:** the gate's thread found the harness advisor tool unavailable (12th consecutive observation across threads). Main-session `advisor()` also down (11th session); `frontier-advisor` consults succeeded at both M2 judgment boundaries (pre-approach ruling carried from the tenth session; pre-verdict consult this session after one owner-confirmed seat-limit retry).
lib/packs/fees/finding.ts:4: * A {@link FeeFinding} is a verifier-core {@link Finding} (all four C2 receipts,
lib/packs/fees/finding.ts:7: *  - a {@link FeeVerdict} (the fee-domain verdict state — the §20-563.3(e)
lib/packs/fees/finding.ts:11: *  - a PROVISIONAL marker array — {@link makeFeeFinding} REQUIRES the U1 marker on
lib/packs/fees/finding.ts:30: * The fee-domain verdict state of a finding, ENCODED (never prose):
lib/packs/fees/finding.ts:35: *    window is still open (not yet a violation — the statute defers the verdict);
lib/packs/fees/finding.ts:42: *    nor calls it a violation — it surfaces the reliance (M2 Codex finding #1,
lib/packs/fees/finding.ts:47:export type FeeVerdict =
lib/packs/fees/finding.ts:53:export const FEE_VERDICTS: readonly FeeVerdict[] = [
lib/packs/fees/finding.ts:61:export interface FeeFinding extends Finding {
lib/packs/fees/finding.ts:62:  /** The fee verdict state (a state, not prose): the §20-563.3(e) refund states plus the c-2 `asserted-passthrough-unverified` warn (M2, 2026-07-04). */
lib/packs/fees/finding.ts:63:  readonly verdict: FeeVerdict;
lib/packs/fees/finding.ts:74:/** Raw input to {@link makeFeeFinding} — validated + frozen on the way out. */
lib/packs/fees/finding.ts:75:export interface FeeFindingInput {
lib/packs/fees/finding.ts:80:  readonly verdict: FeeVerdict;
lib/packs/fees/finding.ts:102:export function makeFeeFinding(input: FeeFindingInput): FeeFinding {
lib/packs/fees/finding.ts:125:    verdict: input.verdict,
lib/packs/fees/finding.ts:144:  /** The assumed purchase-price base every base-derived verdict is provisional against (U1). */
lib/packs/fees/finding.ts:147:  readonly findings: readonly FeeFinding[];
lib/packs/fees/finding.ts:148:  /** Verdict tally — counts by {@link FeeVerdict}. */
lib/packs/fees/finding.ts:149:  readonly verdictTally: Readonly<Record<FeeVerdict, number>>;
lib/packs/fees/finding.ts:150:  /** Overall pass/fail: false iff any finding has verdict `violation` (drives exit 1). */
lib/packs/fees/finding.ts:155: * Deterministic finding order: feeClass, then ruleId, then claim id. Stable
lib/packs/fees/finding.ts:158:export function sortFeeFindings(findings: readonly FeeFinding[]): readonly FeeFinding[] {
lib/packs/fees/finding.ts:163:      a.claim.id.localeCompare(b.claim.id),
lib/packs/fees/finding.ts:169:  findings: readonly FeeFinding[],
lib/packs/fees/finding.ts:172:  const sorted = sortFeeFindings(findings);
lib/packs/fees/finding.ts:173:  const verdictTally: Record<FeeVerdict, number> = {
lib/packs/fees/finding.ts:179:  for (const f of sorted) verdictTally[f.verdict] += 1;
lib/packs/fees/finding.ts:186:    verdictTally: Object.freeze(verdictTally),
lib/packs/fees/finding.ts:187:    ok: verdictTally.violation === 0,
evals/e2e/console.spec.ts:13:  // the shown catch / verification is visible and settled (verdict + the held banner)
lib/packs/fees/classified-audit.ts:11: * verdict — and are reported in a completely separate array from the base report's
lib/packs/fees/classified-audit.ts:15: * this wiring as flowing "through makeFeeFinding" with a distinct `claim.source`.
lib/packs/fees/classified-audit.ts:16: * `makeFeeFinding` (lib/packs/fees/finding.ts) requires a {@link FeeVerdict} —
lib/packs/fees/classified-audit.ts:21: * lane would have byte-broken the frozen F1a goldens via `verdictTally`.
lib/packs/fees/classified-audit.ts:28: * verifier-core/guard.ts — the function `makeFeeFinding` itself wraps), and
lib/packs/fees/classified-audit.ts:30: * alongside it, entirely outside `FeeVerdict` / `buildFeeReport`. F1a goldens
lib/packs/fees/classified-audit.ts:58:import { auditStatement, claimIdPart, makeLineTagger } from "./audit.ts";
lib/packs/fees/classified-audit.ts:69: * One advisory, classifier-derived candidate — NOT a {@link FeeFinding}, has no
lib/packs/fees/classified-audit.ts:70: * {@link FeeVerdict}, and never gates `report.ok`. Built through the SAME core C2
lib/packs/fees/classified-audit.ts:75:  /** Always true — the marker that this is a lead, never a settled verdict. */
lib/packs/fees/classified-audit.ts:111:      // same-category lines (C2 traceability; M2 Codex finding #4).
lib/packs/fees/classified-audit.ts:112:      id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag}#classifier`,
lib/packs/fees/classified-audit.ts:148:  const lineTag = makeLineTagger(statement);
evals/gold/metrics.ts:152: * bit-deterministic at temp 0), the fraction of items whose verdict is not unanimous across the K
evals/gold/metrics.ts:154: * its own right. `verdictsPerItem[i]` = the K boolean verdicts for item i.
evals/gold/metrics.ts:156:export function flipRate(verdictsPerItem: boolean[][]): number {
evals/gold/metrics.ts:157:  if (verdictsPerItem.length === 0) return 0;
evals/gold/metrics.ts:159:  for (const runs of verdictsPerItem) {
evals/gold/metrics.ts:164:  return flipped / verdictsPerItem.length;
lib/packs/fees/classifier.ts:230: * @param answers map from a line key (`orderId#declaredCategory`) to its true label.
fixtures/README.md:1:# The verifier corpus — index (W3 packaging, plan §5 W3 / C9)
fixtures/README.md:17:> at the Pub gate, 2026-07-06). See [Licensing](#licensing) below.
fixtures/README.md:21:## The two sets
fixtures/README.md:33:## Taxonomy keying (measured, never "all")
fixtures/README.md:56:## Regenerate (seeded, deterministic)
fixtures/README.md:62:npm run fixtures:wedge   # regenerates synthetic-restaurant/   (seed 20260703, as-of 2026-07-03)
fixtures/README.md:63:npm run fixtures:ucp     # regenerates ucp-conformance-ci/      (seed 20260703, as-of 2026-07-03)
fixtures/README.md:64:npm run fixtures:fees    # regenerates synthetic-restaurant/fees/ (seed 20260703; UC-1 fee statements + answer key + goldens)
fixtures/README.md:65:npm run fixtures:demo    # regenerates synthetic-restaurant/expected-demo.{json,txt} (the D1 demo transcript goldens)
fixtures/README.md:76:## Run the verifier on the corpus (zero-config, C1)
fixtures/README.md:79:# TRUTH leg — a drifted copy exits 1 and prints every catch with receipts (JSON)
fixtures/README.md:83:# CONFORMANCE leg — a valid UCP catalog-response exits 0
fixtures/README.md:94:# DEMO leg (D1) — the scripted walkthrough on this corpus (always exits 0)
fixtures/README.md:95:node bin/check.mjs demo          # plain text
fixtures/README.md:96:node bin/check.mjs demo --json   # the machine transcript
fixtures/README.md:103:## Shape-honesty note (carried verbatim from `synthetic-restaurant/`)
fixtures/README.md:113:## Licensing
fixtures/README.md:125:## Honesty box
lib/packs/fees/statement.ts:108:   * always yield byte-identical verdicts.
lib/packs/fees/statement.ts:129: * UNVERIFIED (source-memo U1). Every base-derived verdict is provisional until
lib/packs/fees/statement.ts:136: * unresolved. Rendered into every base-derived verdict so a reader always sees
evals/gold/fee-classifier-calibration.lock.test.ts:7: * EVAL-LOCK for the F1b live-classifier calibration run #2 (2026-07-05) — the
evals/gold/fee-classifier-calibration.lock.test.ts:11: * records through the same ported math) and (b) the run's HONEST verdict state:
evals/gold/fee-classifier-calibration.lock.test.ts:50:describe("F1b calibration eval-lock — the frozen run #2 record (R-DHON-4)", () => {
fixtures/ucp-schemas/2026-04-08/README.md:1:# Pinned UCP JSON Schemas — `2026-04-08`
fixtures/ucp-schemas/2026-04-08/README.md:5:## What this is
fixtures/ucp-schemas/2026-04-08/README.md:17:## Provenance (verify before any public claim)
fixtures/ucp-schemas/2026-04-08/README.md:35:## Repo-structure note (divergence recorded)
fixtures/ucp-schemas/2026-04-08/README.md:44:## How composition works (followed, not invented)
fixtures/ucp-schemas/2026-04-08/README.md:54:  `catalog_search.json#/$defs/search_response` (required: `ucp`, `products`);
fixtures/ucp-schemas/2026-04-08/README.md:55:  a *lookup* response against `catalog_lookup.json#/$defs/lookup_response`.
lib/packs/fees/audit.ts:8: * reports. Every finding is built through {@link makeFeeFinding} (C2 receipts +
lib/packs/fees/audit.ts:23: *    (verdict is always `violation`). A line above 3% carrying the c-2 pass-through
lib/packs/fees/audit.ts:27: *    (M2 Codex finding #1, 2026-07-04).
lib/packs/fees/audit.ts:39:  makeFeeFinding,
lib/packs/fees/audit.ts:42:  type FeeFinding,
lib/packs/fees/audit.ts:43:  type FeeVerdict,
lib/packs/fees/audit.ts:91:  const [y, m] = month.split("-").map(Number);
lib/packs/fees/audit.ts:105: * U1-provisional and never an unqualified verdict. §20-563.3(h) makes the gap
lib/packs/fees/audit.ts:122:function verdictPhrase(verdict: FeeVerdict, windowClose: string): string {
lib/packs/fees/audit.ts:123:  switch (verdict) {
lib/packs/fees/audit.ts:140: * Escape the claim-id separator in ARBITRARY statement strings (`orderId`,
lib/packs/fees/audit.ts:141: * `declaredCategory`): '%' → '%25', '#' → '%23'. Keeps `id.split("#")`
lib/packs/fees/audit.ts:143: * (no fixture contains '#' or '%' — goldens unchanged). Reversible.
lib/packs/fees/audit.ts:146:export const claimIdPart = (s: string): string => s.replace(/%/g, "%25").replace(/#/g, "%23");
lib/packs/fees/audit.ts:149: * Statement-position tagger — makes per-line claim ids unique when the same order
lib/packs/fees/audit.ts:150: * carries repeated lines of one category (C2 traceability; M2 Codex finding #4).
lib/packs/fees/audit.ts:152: * throws loudly instead of rendering a silent "Lundefined" (M2 gate-4 advisory;
lib/packs/fees/audit.ts:155:export function makeLineTagger(statement: MonthlyStatement): (l: StatementLine) => string {
lib/packs/fees/audit.ts:167:  const findings: FeeFinding[] = [];
lib/packs/fees/audit.ts:172:  const lineTag = makeLineTagger(statement);
lib/packs/fees/audit.ts:180:      makeFeeFinding({
lib/packs/fees/audit.ts:181:        claim: { id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag(line)}`, source: "fee-statement", field: "declaredCategory", value: line.declaredCategory },
lib/packs/fees/audit.ts:185:        verdict: "violation",
lib/packs/fees/audit.ts:197:      makeFeeFinding({
lib/packs/fees/audit.ts:198:        claim: { id: `${month}#enhanced-without-basic`, source: "fee-statement", field: "declaredCategory", value: "enhanced_service_fee" },
lib/packs/fees/audit.ts:202:        verdict: "violation",
lib/packs/fees/audit.ts:227:          // non-gating warn (M2 Codex finding #1). `ok` is unaffected (not a violation).
lib/packs/fees/audit.ts:229:            makeFeeFinding({
lib/packs/fees/audit.ts:230:              claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "passthroughDocumented", value: true },
lib/packs/fees/audit.ts:234:              verdict: "asserted-passthrough-unverified",
lib/packs/fees/audit.ts:244:          makeFeeFinding({
lib/packs/fees/audit.ts:245:            claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "amountCents", value: line.amountCents },
lib/packs/fees/audit.ts:249:            verdict: "violation", // c has NO refund safe harbor (subd. e excludes it)
lib/packs/fees/audit.ts:265:    const verdict = e1Verdict(category, cfg.capPct, sumFees, sumPurchaseAll, month, asOf, windowClose, statement.lines);
lib/packs/fees/audit.ts:267:      makeFeeFinding({
lib/packs/fees/audit.ts:268:        claim: { id: `${month}#${category}`, source: "fee-statement", field: "monthlyAverage", value: { sumFeesCents: sumFees, sumPurchasePriceCents: sumPurchaseAll, capPct: cfg.capPct } },
lib/packs/fees/audit.ts:272:        verdict,
lib/packs/fees/audit.ts:275:        professionalLine: `${labelFor(category)} total ${dollars(sumFees)} on ${dollars(sumPurchaseAll)} of monthly purchases = ${pctOf(sumFees, sumPurchaseAll)} vs the ${cfg.capPct}% cap (${monthly.id}); ${provisionalQualifier()}; ${verdictPhrase(verdict, windowClose)}.`,
lib/packs/fees/audit.ts:276:        plainLine: `Across the month, ${labelFor(category).toLowerCase()} came to ${pctOf(sumFees, sumPurchaseAll)} of order value — over the ${cfg.capPct}% limit even on the monthly average. ${plainVerdict(verdict, windowClose)} (Depends on the still-open definition of "purchase price", U1.)`,
lib/packs/fees/audit.ts:287:/** e-1 verdict for an over-cap a/b/d category. Refunds must be dated within the window. */
lib/packs/fees/audit.ts:297:): FeeVerdict {
lib/packs/fees/audit.ts:331:function plainVerdict(verdict: FeeVerdict, windowClose: string): string {
lib/packs/fees/audit.ts:332:  switch (verdict) {
lib/packs/fees/index.ts:6: * twin), a deterministic audit engine with the §20-563.3(e) refund-window verdict
lib/packs/fees/index.ts:69:export type { FeeFinding, FeeFindingInput, FeeVerdict, FeeAuditReport } from "./finding.ts";
lib/packs/fees/index.ts:73:  makeFeeFinding,
lib/packs/fees/index.ts:75:  sortFeeFindings,
lib/packs/fees/index.ts:83:  claimIdPart,
lib/packs/fees/index.ts:84:  makeLineTagger,
lib/packs/fees/rules.ts:114: * MUST carry the U1 provisional marker ({@link makeFeeFinding} enforces it).
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:19:          "$ref": "#/$defs/version",
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:23:          "$ref": "#/$defs/version",
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:36:          "$ref": "#/$defs/version_constraint",
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:43:          "additionalProperties": { "$ref": "#/$defs/version_constraint" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:55:          "$ref": "#/$defs/version",
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:85:        "version": { "$ref": "#/$defs/version" },
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:98:            "items": { "$ref": "service.json#/$defs/base" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:107:            "items": { "$ref": "capability.json#/$defs/base" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:116:            "items": { "$ref": "payment_handler.json#/$defs/base" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:125:        { "$ref": "#/$defs/base" },
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:136:        { "$ref": "#/$defs/base" },
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:148:        { "$ref": "#/$defs/base" },
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:154:                "items": { "$ref": "service.json#/$defs/platform_schema" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:159:                "items": { "$ref": "capability.json#/$defs/platform_schema" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:165:                  "$ref": "payment_handler.json#/$defs/platform_schema"
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:178:        { "$ref": "#/$defs/base" },
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:185:              "propertyNames": { "$ref": "#/$defs/version" },
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:193:                "items": { "$ref": "service.json#/$defs/business_schema" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:198:                "items": { "$ref": "capability.json#/$defs/business_schema" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:204:                  "$ref": "payment_handler.json#/$defs/business_schema"
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:217:        { "$ref": "#/$defs/base" },
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:223:                "items": { "$ref": "service.json#/$defs/response_schema" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:228:                "items": { "$ref": "capability.json#/$defs/response_schema" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:234:                  "$ref": "payment_handler.json#/$defs/response_schema"
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:247:        { "$ref": "#/$defs/base" },
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:252:                "items": { "$ref": "capability.json#/$defs/response_schema" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:264:        { "$ref": "#/$defs/base" },
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:269:                "items": { "$ref": "capability.json#/$defs/response_schema" }
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:281:        { "$ref": "#/$defs/base" },
fixtures/ucp-schemas/2026-04-08/schemas/ucp.json:286:                "items": { "$ref": "capability.json#/$defs/response_schema" }
evals/gold/fee-classifier-calibration.live.test.ts:35: *    verdict (any FAILED_TO_FALLBACK fails the run loudly as provider-degraded —
evals/gold/fee-classifier-calibration.live.test.ts:100:      // INCIDENT LESSON (2026-07-05, run #1): the first armed pass completed all 84
evals/gold/fee-classifier-calibration.live.test.ts:238:      // Loud, greppable one-line verdict for the run log (the label decision happens in the
lib/packs/fees/generate.ts:7: * expected verdict, and detection mode (deterministic vs deferred-to-classifier).
lib/packs/fees/generate.ts:27:import type { FeeAuditReport, FeeVerdict } from "./finding.ts";
lib/packs/fees/generate.ts:51:  /** The exact claim.id the engine emits for this catch (null iff deferred). */
lib/packs/fees/generate.ts:52:  readonly expectedClaimId: string | null;
lib/packs/fees/generate.ts:55:  /** The verdict state the engine assigns (null iff deferred). */
lib/packs/fees/generate.ts:56:  readonly expectedVerdict: FeeVerdict | null;
lib/packs/fees/generate.ts:184:          { id: "fee-drift-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "violation", targetOrderId: "ORD-1..ORD-4", note: "delivery fees average 16% of monthly purchases — over the 15% cap even on the monthly-average alternative; window closed, no refund" },
lib/packs/fees/generate.ts:185:          { id: "fee-drift-002", feeClass: "processing-fee-base-inflation", detection: "deterministic", expectedClaimId: "ORD-1#transaction_fee#L1", expectedRuleId: "NYC-563.3-c-1", expectedVerdict: "violation", targetOrderId: "ORD-1", note: "transaction fee 8% > hard 3% cap, not documented as a pass-through (c-2); no safe harbor for c" },
lib/packs/fees/generate.ts:186:          { id: "fee-drift-003", feeClass: "bundling", detection: "deterministic", expectedClaimId: "ORD-3#service_and_delivery#L5", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-3", note: "a lumped line under a non-permitted category label — caught by the d-1 category lock" },
lib/packs/fees/generate.ts:187:          { id: "fee-drift-004", feeClass: "promotion-deduction-mischaracterization", detection: "deterministic", expectedClaimId: "ORD-4#promotion_deduction#L7", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-4", note: "a charge dressed as a 'promotion deduction' is not a permitted fee category — d-1" },
lib/packs/fees/generate.ts:188:          { id: "fee-drift-005", feeClass: "misclassification", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#enhanced-without-basic`, expectedRuleId: "NYC-563.3-d-4", expectedVerdict: "violation", targetOrderId: "ORD-2", note: "enhanced service fee charged with no basic service fee in the statement — d-4 gating clause" },
lib/packs/fees/generate.ts:189:          { id: "fee-drift-006", feeClass: "bundling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "a within-cap line under a LEGAL category that actually bundles service + processing — unbundling needs the F1b line-item classifier; the deterministic spine sees only a compliant transaction fee" },
lib/packs/fees/generate.ts:190:          { id: "fee-drift-007", feeClass: "relabeling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "an enhanced fee relabeled from delivery across periods; pure cross-month relabeling needs multi-month data + fee-change-notice records (g-1-iv is non-statement-checkable) — deferred" },
lib/packs/fees/generate.ts:195:          { id: "fee-cure-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "cured-by-refund", targetOrderId: "ORD-C1,ORD-C2", note: "delivery over-cap fully refunded within the §20-563.3(e) 30-day window — not a violation" },
lib/packs/fees/generate.ts:200:          { id: "fee-cond-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "conditional-pending-refund-window", targetOrderId: "ORD-K1,ORD-K2", note: "delivery over-cap evaluated while the 30-day window is still open — not yet a violation" },
lib/packs/fees/parser.ts:157:  // averages and e-1 cure logic (M2 Codex finding #3). Reject loudly, never coerce.
fixtures/ucp-schemas/2026-04-08/schemas/payment_handler.json:10:        { "$ref": "ucp.json#/$defs/entity" },
fixtures/ucp-schemas/2026-04-08/schemas/payment_handler.json:32:      "allOf": [{ "$ref": "#/$defs/base" }, { "required": ["spec", "schema"] }]
fixtures/ucp-schemas/2026-04-08/schemas/payment_handler.json:38:      "allOf": [{ "$ref": "#/$defs/base" }]
fixtures/ucp-schemas/2026-04-08/schemas/payment_handler.json:44:      "allOf": [{ "$ref": "#/$defs/base" }]
evals/packs/fees-audit-e1.test.ts:11: * over-cap on a/b/d is a state, not a fixed verdict — cured-by-refund /
evals/packs/fees-audit-e1.test.ts:46:  return report.findings.find((f) => f.ruleId === "NYC-563.3-a-2")?.verdict;
evals/packs/fees-audit-e1.test.ts:49:describe("e-1 verdict states (a/b/d over-cap)", () => {
evals/packs/fees-audit-e1.test.ts:120:    expect(c?.verdict).toBe("violation");
evals/packs/fees-audit-e1.test.ts:124:  it("an asserted pass-through (c-2) above 3% is SURFACED as a non-gating warn — never silently cleared, never a violation (M2 finding #1)", () => {
evals/packs/fees-audit-e1.test.ts:136:    expect(c2?.verdict).toBe("asserted-passthrough-unverified");
evals/packs/fees-audit-e1.test.ts:140:    expect(report.verdictTally["asserted-passthrough-unverified"]).toBe(1);
evals/packs/fees-audit-e1.test.ts:155:describe("claim-id uniqueness (C2 traceability; M2 finding #4)", () => {
evals/packs/fees-audit-e1.test.ts:156:  it("two same-order, same-category over-cap transaction lines yield DISTINCT claim ids", () => {
evals/packs/fees-audit-e1.test.ts:164:    const ids = report.findings.filter((f) => f.ruleId === "NYC-563.3-c-1").map((f) => f.claim.id);
evals/packs/fees-audit-e1.test.ts:169:  it("two same-order, same-unlawful-category lines (d-1) yield DISTINCT claim ids", () => {
evals/packs/fees-audit-e1.test.ts:177:    const ids = report.findings.filter((f) => f.ruleId === "NYC-563.3-d-1").map((f) => f.claim.id);
fixtures/ucp-schemas/2026-04-08/schemas/common/identity_linking.json:34:          { "$ref": "../capability.json#/$defs/platform_schema" }
fixtures/ucp-schemas/2026-04-08/schemas/common/identity_linking.json:41:          { "$ref": "../capability.json#/$defs/business_schema" },
fixtures/ucp-schemas/2026-04-08/schemas/common/identity_linking.json:54:                    "propertyNames": { "$ref": "#/$defs/scope_token" },
fixtures/ucp-schemas/2026-04-08/schemas/common/identity_linking.json:55:                    "additionalProperties": { "$ref": "#/$defs/scope_policy" }
lib/packs/fees/cli.ts:8: * verdict). ZERO LLM / network — enforced by the import-graph eval, not promised.
lib/packs/fees/cli.ts:11: * professional line paired with its plain line, verdict states, U1-provisional
lib/packs/fees/cli.ts:22:import type { FeeAuditReport, FeeFinding } from "./finding.ts";
lib/packs/fees/cli.ts:29:  /** 0 = clean, 1 = at least one `violation` verdict. */
lib/packs/fees/cli.ts:45:const VERDICT_TAG: Readonly<Record<FeeFinding["verdict"], string>> = {
lib/packs/fees/cli.ts:59:  lines.push(`verdict: ${report.ok ? "PASS (no violations)" : "FAIL (violations present)"}`);
lib/packs/fees/cli.ts:61:    `findings: ${report.findings.length} — violation ${report.verdictTally.violation}, conditional ${report.verdictTally["conditional-pending-refund-window"]}, cured ${report.verdictTally["cured-by-refund"]}, asserted-passthrough ${report.verdictTally["asserted-passthrough-unverified"]}`,
lib/packs/fees/cli.ts:69:    lines.push(`• [${VERDICT_TAG[f.verdict]}] ${f.ruleId} (${f.referenceRowId}) — ${f.feeClass}${marks}`);
fixtures/ucp-schemas/2026-04-08/schemas/shopping/catalog_lookup.json:60:          "$ref": "../ucp.json#/$defs/response_catalog_schema"
fixtures/ucp-schemas/2026-04-08/schemas/shopping/catalog_lookup.json:70:                    "items": { "$ref": "#/$defs/lookup_variant" }
fixtures/ucp-schemas/2026-04-08/schemas/shopping/catalog_lookup.json:161:          "$ref": "../ucp.json#/$defs/response_catalog_schema"
fixtures/ucp-schemas/2026-04-08/schemas/shopping/catalog_lookup.json:164:          "$ref": "#/$defs/detail_product",
fixtures/ucp-schemas/2026-04-08/schemas/capability.json:10:        { "$ref": "ucp.json#/$defs/entity" },
fixtures/ucp-schemas/2026-04-08/schemas/capability.json:39:      "allOf": [{ "$ref": "#/$defs/base" }, { "required": ["spec", "schema"] }]
fixtures/ucp-schemas/2026-04-08/schemas/capability.json:45:      "allOf": [{ "$ref": "#/$defs/base" }]
fixtures/ucp-schemas/2026-04-08/schemas/capability.json:51:      "allOf": [{ "$ref": "#/$defs/base" }]
evals/core/verifier-engine.test.ts:18:const claim: Claim = { id: "row-1#price.amount", source: "acp-feed", field: "price.amount", value: "18.99" };
evals/core/verifier-engine.test.ts:68:  it("orders findings deterministically (category, ruleId, claim id)", () => {
fixtures/ucp-schemas/2026-04-08/schemas/service.json:10:        { "$ref": "ucp.json#/$defs/entity" },
fixtures/ucp-schemas/2026-04-08/schemas/service.json:34:        { "$ref": "#/$defs/base" },
fixtures/ucp-schemas/2026-04-08/schemas/service.json:62:        { "$ref": "#/$defs/base" },
fixtures/ucp-schemas/2026-04-08/schemas/service.json:92:        { "$ref": "#/$defs/base" },
fixtures/ucp-schemas/2026-04-08/schemas/shopping/order.json:37:      "$ref": "../ucp.json#/$defs/response_order_schema"
evals/packs/listings-differential-c3.test.ts:48:      (f.claim.id.startsWith(`${entry.targetFeedItemId}#`) ||
evals/packs/listings-differential-c3.test.ts:88:        (f.claim.id.startsWith(`${e.targetFeedItemId}#`) ||
fixtures/ucp-schemas/2026-04-08/schemas/shopping/buyer_consent.json:41:              "$ref": "#/$defs/consent",
fixtures/ucp-schemas/2026-04-08/schemas/shopping/buyer_consent.json:59:              "$ref": "#/$defs/buyer",
evals/packs/fees-finding-u1.test.ts:9:  makeFeeFinding,
evals/packs/fees-finding-u1.test.ts:10:  type FeeFindingInput,
evals/packs/fees-finding-u1.test.ts:15: * U1 PROVISIONALITY, structural (plan F1a item 5), RED-GREEN: makeFeeFinding
evals/packs/fees-finding-u1.test.ts:21:const baseInput = (over: Partial<FeeFindingInput>): FeeFindingInput => ({
evals/packs/fees-finding-u1.test.ts:22:  claim: { id: "2026-06#delivery_fee", source: "fee-statement", field: "monthlyAverage", value: 1 },
evals/packs/fees-finding-u1.test.ts:26:  verdict: "violation",
evals/packs/fees-finding-u1.test.ts:35:    expect(() => makeFeeFinding(baseInput({}))).toThrow(MissingProvisionalMarkerError);
evals/packs/fees-finding-u1.test.ts:36:    expect(() => makeFeeFinding(baseInput({ provisional: ["something-else"] }))).toThrow(
evals/packs/fees-finding-u1.test.ts:42:    const f = makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1] }));
evals/packs/fees-finding-u1.test.ts:44:    expect(f.verdict).toBe("violation");
evals/packs/fees-finding-u1.test.ts:48:    const f = makeFeeFinding(
evals/packs/fees-finding-u1.test.ts:64:describe("U1: makeFeeFinding still enforces the core C2 receipts + two registers", () => {
evals/packs/fees-finding-u1.test.ts:67:      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], referenceRowId: "" })),
evals/packs/fees-finding-u1.test.ts:73:      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], professionalLine: "  " })),
evals/packs/fees-finding-u1.test.ts:76:      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], plainLine: "" })),
evals/packs/listings-property.test.ts:58:      (f) => f.category === "price" && f.claim.id.startsWith(`${target.item_id}#`),
evals/packs/listings-property.test.ts:96:      (f) => f.category === "availability" && f.claim.id.startsWith(`${target.item_id}#`),
evals/packs/fees-advisory-nits.test.ts:5:  claimIdPart,
evals/packs/fees-advisory-nits.test.ts:6:  makeLineTagger,
evals/packs/fees-advisory-nits.test.ts:16: *  1. `#` inside an arbitrary `declaredCategory` (or `orderId`) made claim ids
evals/packs/fees-advisory-nits.test.ts:18: *     `claimIdPart` ('%'→'%25', '#'→'%23') — identity on every committed corpus
evals/packs/fees-advisory-nits.test.ts:19: *     value (no fixture contains '#' or '%'; goldens stay byte-frozen), reversible
evals/packs/fees-advisory-nits.test.ts:20: *     via decodeURIComponent-style unescaping, so `id.split("#")` is unambiguous.
evals/packs/fees-advisory-nits.test.ts:22: *  2. Object-identity `lineIndex` maps rendered a silent "Lundefined" tag for a
evals/packs/fees-advisory-nits.test.ts:24: *     `makeLineTagger` throws loudly instead (unreachable via the parser — this is
evals/packs/fees-advisory-nits.test.ts:27: * RED-GREEN: pre-fix, the d-1 claim id for declaredCategory "promo#extra" was
evals/packs/fees-advisory-nits.test.ts:28: * "ORD-9#promo#extra#L0" — split("#").length === 4, ambiguous (executed RED,
evals/packs/fees-advisory-nits.test.ts:30: * "ORD-9#promo%23extra#L0" — exactly 3 unambiguous segments.
evals/packs/fees-advisory-nits.test.ts:33:const unescapePart = (s: string): string => s.replace(/%23/g, "#").replace(/%25/g, "%");
evals/packs/fees-advisory-nits.test.ts:60:describe("claimIdPart (nit 3: '#' in arbitrary id components)", () => {
evals/packs/fees-advisory-nits.test.ts:61:  it("is byte-identity on every committed corpus value shape (no '#'/'%')", () => {
evals/packs/fees-advisory-nits.test.ts:63:      expect(claimIdPart(s)).toBe(s);
evals/packs/fees-advisory-nits.test.ts:67:  it("escapes '#' and '%' reversibly (round-trip)", () => {
evals/packs/fees-advisory-nits.test.ts:68:    for (const s of ["promo#extra", "50%#off", "a%23b", "%", "#"]) {
evals/packs/fees-advisory-nits.test.ts:69:      expect(unescapePart(claimIdPart(s))).toBe(s);
evals/packs/fees-advisory-nits.test.ts:70:      expect(claimIdPart(s)).not.toContain("#");
evals/packs/fees-advisory-nits.test.ts:74:  it("d-1 claim id with '#'-bearing orderId + declaredCategory splits into exactly 3 unambiguous segments", () => {
evals/packs/fees-advisory-nits.test.ts:75:    const report = auditStatement(statement([line({ orderId: "OR#D-9", declaredCategory: "promo#extra" })]));
evals/packs/fees-advisory-nits.test.ts:78:    const segments = d1!.claim.id.split("#");
evals/packs/fees-advisory-nits.test.ts:80:    expect(unescapePart(segments[0])).toBe("OR#D-9");
evals/packs/fees-advisory-nits.test.ts:81:    expect(unescapePart(segments[1])).toBe("promo#extra");
evals/packs/fees-advisory-nits.test.ts:85:  it("advisory (classifier) claim id is escaped the same way", () => {
evals/packs/fees-advisory-nits.test.ts:91:    const report = auditWithClassification(statement([line({ declaredCategory: "promo#extra" })]), mock);
evals/packs/fees-advisory-nits.test.ts:93:    const segments = report.advisoryFindings[0].claim.id.split("#");
evals/packs/fees-advisory-nits.test.ts:94:    expect(segments).toHaveLength(4); // orderId # category # L<i> # classifier
evals/packs/fees-advisory-nits.test.ts:95:    expect(unescapePart(segments[1])).toBe("promo#extra");
evals/packs/fees-advisory-nits.test.ts:100:describe("makeLineTagger (nit 2: object-identity lineIndex)", () => {
evals/packs/fees-advisory-nits.test.ts:103:    const tag = makeLineTagger(s);
evals/packs/fees-advisory-nits.test.ts:108:  it("throws LOUDLY on a line object that is not a member of statement.lines (was a silent 'Lundefined')", () => {
evals/packs/fees-advisory-nits.test.ts:110:    const tag = makeLineTagger(s);
fixtures/ucp-schemas/2026-04-08/schemas/shopping/payment.json:11:        "$ref": "types/payment_instrument.json#/$defs/selected_payment_instrument"
evals/packs/report-view-c1.test.ts:119:      expect(row.claimId).toBe(f.claim.id);
evals/packs/report-view-c1.test.ts:129:      expect(row.claimId).not.toBe("");
fixtures/ucp-schemas/2026-04-08/schemas/shopping/ap2_mandate.json:25:          "$ref": "#/$defs/merchant_authorization",
fixtures/ucp-schemas/2026-04-08/schemas/shopping/ap2_mandate.json:36:          "$ref": "#/$defs/checkout_mandate",
fixtures/ucp-schemas/2026-04-08/schemas/shopping/ap2_mandate.json:59:                  "$ref": "#/$defs/ap2_with_merchant_authorization"
fixtures/ucp-schemas/2026-04-08/schemas/shopping/ap2_mandate.json:62:                  "$ref": "#/$defs/ap2_with_checkout_mandate"
evals/packs/fees-classifier.test.ts:180:      expect(f.claim.id.length).toBeGreaterThan(0);
evals/packs/fees-classifier.test.ts:200:  it("advisory findings NEVER change base.ok / base.findings / base.verdictTally", () => {
evals/packs/fees-classifier.test.ts:206:    expect(base.verdictTally).toEqual(direct.verdictTally);
evals/packs/fees-classifier.test.ts:209:  it("two same-order, same-category candidate lines yield DISTINCT advisory claim ids (C2 traceability; M2 finding #4)", () => {
evals/packs/fees-classifier.test.ts:222:    const ids = advisoryFindings.map((f) => f.claim.id);
evals/packs/fees-classifier.test.ts:231:    ["ORD-5#transaction_fee", NOT_A_PERMITTED_FEE], // fee-drift-006: bundles service+processing
evals/packs/fees-classifier.test.ts:232:    ["ORD-5#enhanced_service_fee", "delivery_fee"], // fee-drift-007: relabeled from delivery
evals/packs/fees-classifier.test.ts:235:    // Reconstructed from the orderId carried in the advisory finding's claim id
evals/packs/fees-classifier.test.ts:238:    if (input.label.includes("service + processing bundle")) return "ORD-5#transaction_fee";
evals/packs/fees-classifier.test.ts:239:    if (input.label.includes("formerly delivery")) return "ORD-5#enhanced_service_fee";
evals/packs/fees-classifier.test.ts:274:    expect(base.findings.every((finding) => !finding.claim.id.includes("ORD-5"))).toBe(true);
fixtures/ucp-schemas/2026-04-08/schemas/shopping/checkout.json:20:      "$ref": "../ucp.json#/$defs/response_checkout_schema",
evals/packs/listings-coverage-c6.test.ts:93:            (f.claim.id.startsWith(`${e.targetFeedItemId}#`) ||
evals/packs/fees-parser.test.ts:64:    // M2 Codex finding #3: a monthly statement must not mix months — a stray-month
evals/packs/fees-coverage-c6.test.ts:21: *   - every entry marked deterministic is caught (right rule id + verdict).
evals/packs/fees-coverage-c6.test.ts:43:        const e = det.find((e) => e.expectedClaimId === f.claim.id && e.expectedRuleId === f.ruleId);
evals/packs/fees-coverage-c6.test.ts:44:        expect(e, `${name}: unexplained finding ${f.claim.id} / ${f.ruleId}`).toBeDefined();
evals/packs/fees-coverage-c6.test.ts:45:        expect(f.verdict).toBe(e!.expectedVerdict);
evals/packs/fees-coverage-c6.test.ts:49:    it(`${name}: every deterministic answer-key entry is caught (rule id + verdict)`, () => {
evals/packs/fees-coverage-c6.test.ts:52:          (f) => f.claim.id === e.expectedClaimId && f.ruleId === e.expectedRuleId,
evals/packs/fees-coverage-c6.test.ts:55:        expect(f!.verdict).toBe(e.expectedVerdict);
evals/packs/fees-coverage-c6.test.ts:88:    const emittedClaimIds = new Set(report.findings.map((f) => f.claim.id));
evals/packs/fees-coverage-c6.test.ts:90:      expect(e.expectedClaimId).toBeNull();
evals/packs/fees-coverage-c6.test.ts:93:      expect([...emittedClaimIds].some((id) => id.startsWith(`${e.targetOrderId}#`))).toBe(false);
evals/packs/ucp-conformance.test.ts:20: * C10 spec-version pin + simulated labels). Proves: our ajv verdicts over the
evals/packs/ucp-conformance.test.ts:82:describe("C5 conformance correctness — ajv verdicts vs manifest ground truth", () => {
evals/packs/ucp-conformance.test.ts:123:        expect(f.claim.id.length).toBeGreaterThan(0);
evals/packs/demo-transcript.test.ts:21: * verdict in the transcript is derived from a real verifier/conformance result:
evals/packs/demo-transcript.test.ts:22: * mutate the input and the verdicts CHANGE accordingly. This is the natural
evals/packs/demo-transcript.test.ts:23: * red-green — a hardcoded verdict string would survive the mutation and fail here.
evals/packs/demo-transcript.test.ts:47:describe("D1 beats compute: the drifted surface yields drift verdicts", () => {
evals/packs/demo-transcript.test.ts:53:    expect(b.verdicts?.[0].ok).toBe(false);
evals/packs/demo-transcript.test.ts:65:    expect(b.verdicts?.[0].ok).toBe(true); // conformant (spec-valid)
evals/packs/demo-transcript.test.ts:66:    expect(b.verdicts?.[1].ok).toBe(false); // false vs SOR
evals/packs/demo-transcript.test.ts:71:describe("D1 beats compute: mutate the input → the verdicts change", () => {
evals/packs/demo-transcript.test.ts:72:  it("the FAITHFUL feed makes the same selected item show NO drift (verdict flips)", () => {
evals/packs/demo-transcript.test.ts:75:    // verifier's verdict flips — a hardcoded 'DRIFT' verdict would not flip here.
evals/packs/demo-transcript.test.ts:82:    expect(beat(drifted.beats, "verifier-finds").verdicts?.[0].ok).toBe(false);
evals/packs/demo-transcript.test.ts:83:    expect(beat(faithful.beats, "verifier-finds").verdicts?.[0].ok).toBe(true);
evals/packs/demo-transcript.test.ts:87:  it("a FAITHFUL conformance doc makes the foil's truth verdict flip to TRUE vs SOR", () => {
evals/packs/demo-transcript.test.ts:92:    expect(beat(lying.beats, "conformance-foil").verdicts?.[0].ok).toBe(true);
evals/packs/demo-transcript.test.ts:93:    expect(beat(honest.beats, "conformance-foil").verdicts?.[0].ok).toBe(true);
evals/packs/demo-transcript.test.ts:94:    expect(beat(lying.beats, "conformance-foil").verdicts?.[1].ok).toBe(false);
evals/packs/demo-transcript.test.ts:95:    expect(beat(honest.beats, "conformance-foil").verdicts?.[1].ok).toBe(true);
evals/packs/fees-drift-lock.test.ts:85:      // ALL mirrored metadata is locked (M2 Codex finding #5): a twin edit to the
fixtures/ucp-schemas/2026-04-08/schemas/shopping/catalog_search.json:29:          "$ref": "types/pagination.json#/$defs/request"
fixtures/ucp-schemas/2026-04-08/schemas/shopping/catalog_search.json:41:          "$ref": "../ucp.json#/$defs/response_catalog_schema"
fixtures/ucp-schemas/2026-04-08/schemas/shopping/catalog_search.json:51:          "$ref": "types/pagination.json#/$defs/response"
fixtures/ucp-schemas/2026-04-08/schemas/shopping/discount.json:76:            "$ref": "#/$defs/allocation"
fixtures/ucp-schemas/2026-04-08/schemas/shopping/discount.json:96:            "$ref": "#/$defs/applied_discount"
fixtures/ucp-schemas/2026-04-08/schemas/shopping/discount.json:114:              "$ref": "#/$defs/discounts_object",
fixtures/ucp-schemas/2026-04-08/schemas/shopping/discount.json:135:              "$ref": "#/$defs/discounts_object",
fixtures/ucp-schemas/2026-04-08/schemas/shopping/fulfillment.json:34:              "$ref": "#/$defs/fulfillment",
fixtures/ucp-schemas/2026-04-08/schemas/shopping/fulfillment.json:52:            "$ref": "../capability.json#/$defs/platform_schema"
fixtures/ucp-schemas/2026-04-08/schemas/shopping/fulfillment.json:69:            "$ref": "../capability.json#/$defs/business_schema"
fixtures/ucp-schemas/2026-04-08/schemas/shopping/fulfillment.json:126:                  "ucp": { "$ref": "../ucp.json#/$defs/success" },
fixtures/ucp-schemas/2026-04-08/schemas/shopping/cart.json:42:      "$ref": "../ucp.json#/$defs/response_cart_schema",
fixtures/synthetic-restaurant/README.md:1:# synthetic-restaurant corpus — W1 (the wedge torture corpus)
fixtures/synthetic-restaurant/README.md:11:## Contents
fixtures/synthetic-restaurant/README.md:30:## Reproducibility (seeded, plan §8)
fixtures/synthetic-restaurant/README.md:40:## Run the verifier on this corpus (zero-config, C1)
fixtures/synthetic-restaurant/README.md:43:# the drifted copy — exits 1 and prints every catch with receipts
fixtures/synthetic-restaurant/README.md:47:# the faithful copy — exits 0, zero findings
fixtures/synthetic-restaurant/README.md:51:# the constructed UCP response surface
fixtures/synthetic-restaurant/README.md:61:## Taxonomy keying (C6 — measured, never overclaimed)
fixtures/synthetic-restaurant/README.md:71:## License
fixtures/synthetic-restaurant/README.md:78:## Honesty box
fixtures/synthetic-restaurant/fees/fee-answer-key.json:19:          "expectedClaimId": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:29:          "expectedClaimId": "ORD-1#transaction_fee#L1",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:39:          "expectedClaimId": "ORD-3#service_and_delivery#L5",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:49:          "expectedClaimId": "ORD-4#promotion_deduction#L7",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:59:          "expectedClaimId": "2026-06#enhanced-without-basic",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:69:          "expectedClaimId": null,
fixtures/synthetic-restaurant/fees/fee-answer-key.json:79:          "expectedClaimId": null,
fixtures/synthetic-restaurant/fees/fee-answer-key.json:93:          "expectedClaimId": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:107:          "expectedClaimId": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/expected-demo.txt:27:  verdict: [OK] SELECTED (from the surface)
fixtures/synthetic-restaurant/expected-demo.txt:36:  verdict: [FLAG] DRIFT ON THE SELECTED ITEM — the agent could not have seen it
fixtures/synthetic-restaurant/expected-demo.txt:40:        claim:      item-006-v1#price.amount  (acp-feed · price.amount = 12.00)
fixtures/synthetic-restaurant/expected-demo.txt:52:  verdict: [OK] CONFORMANT (spec-valid)
fixtures/synthetic-restaurant/expected-demo.txt:53:  verdict: [FLAG] FALSE vs SOR (still lies)
fixtures/synthetic-restaurant/expected-demo.txt:57:        claim:      item-001-v1#price.amount  (ucp-catalog · price.amount = 23.50)
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:9:        "id": "ORD-3#service_and_delivery#L5",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:19:      "verdict": "violation",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:26:        "id": "2026-06#enhanced-without-basic",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:36:      "verdict": "violation",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:43:        "id": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:57:      "verdict": "violation",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:66:        "id": "ORD-1#transaction_fee#L1",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:76:      "verdict": "violation",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:85:        "id": "ORD-4#promotion_deduction#L7",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:95:      "verdict": "violation",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:101:  "verdictTally": {
fixtures/synthetic-restaurant/fees/expected-report.cured.json:9:        "id": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/expected-report.cured.json:23:      "verdict": "cured-by-refund",
fixtures/synthetic-restaurant/fees/expected-report.cured.json:31:  "verdictTally": {
fixtures/synthetic-restaurant/fees/expected-report.conditional.json:9:        "id": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/expected-report.conditional.json:23:      "verdict": "conditional-pending-refund-window",
fixtures/synthetic-restaurant/fees/expected-report.conditional.json:31:  "verdictTally": {
fixtures/synthetic-restaurant/fees/expected-report.faithful.json:7:  "verdictTally": {
fixtures/synthetic-restaurant/expected-report.ucp.json:8:        "id": "item-002-v2#existence",
fixtures/synthetic-restaurant/expected-report.ucp.json:21:        "id": "item-004-v1#availability",
fixtures/synthetic-restaurant/expected-report.ucp.json:34:        "id": "item-008-v1#availability",
fixtures/synthetic-restaurant/expected-report.ucp.json:47:        "id": "item-005-v2#title",
fixtures/synthetic-restaurant/expected-report.ucp.json:60:        "id": "item-004-v3#title",
fixtures/synthetic-restaurant/expected-report.ucp.json:73:        "id": "ghost-001#existence",
fixtures/synthetic-restaurant/expected-report.ucp.json:86:        "id": "item-003-v1#existence",
fixtures/synthetic-restaurant/expected-report.ucp.json:99:        "id": "legacy-pos-4471#existence",
fixtures/synthetic-restaurant/expected-report.ucp.json:112:        "id": "item-004-v2#variant_dict",
fixtures/synthetic-restaurant/expected-report.ucp.json:130:        "id": "item-001-v1#price.amount",
fixtures/synthetic-restaurant/expected-report.ucp.json:143:        "id": "item-001-v2#price.currency",
fixtures/synthetic-restaurant/expected-report.ucp.json:156:        "id": "item-006-v1#price.amount",
fixtures/synthetic-restaurant/expected-report.ucp.json:169:        "id": "catalog#spec.supported_versions",
fixtures/synthetic-restaurant/expected-demo.json:35:      "verdicts": [
fixtures/synthetic-restaurant/expected-demo.json:52:          "claimId": "item-006-v1#price.amount",
fixtures/synthetic-restaurant/expected-demo.json:62:      "verdicts": [
fixtures/synthetic-restaurant/expected-demo.json:79:          "claimId": "item-001-v1#price.amount",
fixtures/synthetic-restaurant/expected-demo.json:89:      "verdicts": [
fixtures/synthetic-restaurant/fees/README.md:1:# The fee-audit corpus (UC-1, F1a deterministic spine)
fixtures/synthetic-restaurant/fees/README.md:24:## Contents
fixtures/synthetic-restaurant/fees/README.md:32:| `fee-answer-key.json` | Ground truth: every planted violation labeled with its §7 class, expected rule id, expected verdict, and **detection mode** (`deterministic` vs `deferred-to-classifier`). |
fixtures/synthetic-restaurant/fees/README.md:35:## The six fee-line classes (measured, never "all")
fixtures/synthetic-restaurant/fees/README.md:42:| over-cap | a-1/a-2 (delivery), c-1 (transaction), etc. + e-1 verdict | **deterministic** |
fixtures/synthetic-restaurant/fees/README.md:54:## The U1 asterisk (purchase-price base, unresolved)
fixtures/synthetic-restaurant/fees/README.md:60:key), and every base-derived verdict is rendered **provisional (`U1-base`)** —
fixtures/synthetic-restaurant/fees/README.md:63:## The §20-563.3(e) refund window as a verdict STATE
fixtures/synthetic-restaurant/fees/README.md:71:## Regenerate (seeded, deterministic)
fixtures/synthetic-restaurant/fees/README.md:74:npm run fixtures:fees   # rebuilds this folder from the pinned seed (20260703)
fixtures/synthetic-restaurant/fees/README.md:77:## Run the audit (zero-config, C1)
fixtures/synthetic-restaurant/fees/README.md:80:# a rigged statement exits 1 and prints every catch with receipts (two registers)
fixtures/synthetic-restaurant/fees/README.md:83:# the machine report (CI-usable JSON)
fixtures/synthetic-restaurant/fees/README.md:90:## Honesty box
fixtures/synthetic-restaurant/fees/README.md:96:  base-derived verdict is labeled provisional.
fixtures/synthetic-restaurant/fees/README.md:102:  average toward flagging — one reason monthly-average verdicts stay provisional.
fixtures/synthetic-restaurant/expected-report.acp.json:8:        "id": "item-002-v2#existence",
fixtures/synthetic-restaurant/expected-report.acp.json:21:        "id": "item-004-v1#availability",
fixtures/synthetic-restaurant/expected-report.acp.json:34:        "id": "item-008-v1#availability",
fixtures/synthetic-restaurant/expected-report.acp.json:47:        "id": "item-002-v1#invariants",
fixtures/synthetic-restaurant/expected-report.acp.json:64:        "id": "item-005-v2#title",
fixtures/synthetic-restaurant/expected-report.acp.json:77:        "id": "item-004-v3#title",
fixtures/synthetic-restaurant/expected-report.acp.json:90:        "id": "ghost-001#existence",
fixtures/synthetic-restaurant/expected-report.acp.json:103:        "id": "item-003-v1#existence",
fixtures/synthetic-restaurant/expected-report.acp.json:116:        "id": "legacy-pos-4471#existence",
fixtures/synthetic-restaurant/expected-report.acp.json:129:        "id": "item-004-v2#variant_dict",
fixtures/synthetic-restaurant/expected-report.acp.json:147:        "id": "item-001-v1#price.amount",
fixtures/synthetic-restaurant/expected-report.acp.json:160:        "id": "item-001-v2#price.currency",
fixtures/synthetic-restaurant/expected-report.acp.json:173:        "id": "item-001-v3#invariants",
fixtures/synthetic-restaurant/expected-report.acp.json:191:        "id": "item-006-v1#price.amount",
fixtures/synthetic-restaurant/expected-report.acp.json:204:        "id": "item-004-v1#availability_date",
fixtures/synthetic-restaurant/expected-report.acp.json:217:        "id": "item-003-v3#expiration_date",
fixtures/ucp-schemas/2026-04-08/schemas/shopping/types/error_response.json:11:      "$ref": "../../ucp.json#/$defs/error",
fixtures/ucp-schemas/2026-04-08/schemas/shopping/types/payment_instrument.json:43:        { "$ref": "#" },

 succeeded in 165ms:
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-QSGlFhRb' (errno=Operation not permitted)
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-TQl78G4K' (errno=Operation not permitted)
diff --git a/docs/suggestions-ledger.md b/docs/suggestions-ledger.md
index ae13eba..07bc8f2 100644
--- a/docs/suggestions-ledger.md
+++ b/docs/suggestions-ledger.md
@@ -7,17 +7,17 @@
 | ID | Date | Suggestion | Why (one line) | Status |
 | --- | --- | --- | --- | --- |
 | S-1 | 2026-07-02 | **Reframe UC-2's lead artifact: an OPEN ACP/UCP conformance + truth-audit toolkit** ("the truth layer for agentic commerce") instead of a merchant-facing prototype SaaS; UC-7 (feed-conformance tooling) promoted from horizon into the lead artifact. | Makes "adoption-grade" literally achievable (the ecosystem can run it), deletes the surface-access/ToS killer, rides the open ACP/UCP timing window (specs weeks old, conformance seat empty), flips spec churn from risk to moat. | ACCEPTED-FOR-PLANNING (decision-log 2026-07-02) |
-| S-2 | 2026-07-02 | **The self-referential demo:** a synthetic restaurant with a real ACP-format feed + deliberately injected drift; a real AI agent attempts the order — transacts wrong *without* the verifier, gets caught *with* it. | The story lands with zero explanation ("watch the agent get lied to; watch the truth layer catch it"); all synthetic, honest, nearly free; doubles as the storytelling arc the owner wanted. | ACCEPTED-FOR-PLANNING (part of S-1) |
+| S-2 | 2026-07-02 | **The self-referential demo:** a synthetic restaurant with a real ACP-format feed + deliberately injected drift; a real AI agent attempts the order — transacts wrong *without* the verifier, gets caught *with* it. | The story lands with zero explanation ("watch the agent get lied to; watch the truth layer catch it"); all synthetic, honest, nearly free; doubles as the storytelling arc the owner wanted. | ACCEPTED + SHIPPED AS RESHAPED (D1 2026-07-03: a SCRIPTED spec-faithful demonstration actor, not a live AI agent — the "agent gets caught" framing was banned by plan amendment 6 + machine-checked at C10; the live-agent leg was the Gemini variant the owner DECLINED 2026-07-05; status synced 2026-07-06) |
 | S-3 | 2026-07-02 | **Positioning frame:** "the truth layer for agentic commerce" — UC-2 = the listings domain, UC-1 = the money domain, one verifier underneath; venture story = the OSS-wedge-to-commercial-audit-layer pattern (SSL Labs → Qualys; npm-audit → Snyk). | One sentence carries both modules; answers "is a validator too small?" — the validator is the wedge, the evidence-grade audit layer is the product on top. | ACCEPTED-FOR-PLANNING (with S-1; use in plan positioning) |
-| S-4 | 2026-07-02 | **Process: cut review ceremony to module boundaries.** Per-slice gate = `npm run verify` green + red-green tests; the full Codex + acceptance-gate ceremony only at module boundaries and before anything irreversible. | Slice 1 spent ~1.2M shared-seat tokens across 5 Codex passes largely on wording; the owner already moved this way ("batch the Codex review") — make it standing policy for the new build. | PENDING (fold into the plan for owner GO) |
-| S-5 | 2026-07-02 | **Close out the suspended slice-2 diff:** commit it as-is with its honest degraded-run labels; declare the multi-agent-activation lineage CLOSED as "the spine's provenance" (capability proof); drop the clean-K live re-run — the pivot doesn't need it. | Converts a dangling obligation into the credibility exhibit the new build stands on; frees the repo for the restructure. | PENDING (fold into the plan for owner GO) |
+| S-4 | 2026-07-02 | **Process: cut review ceremony to module boundaries.** Per-slice gate = `npm run verify` green + red-green tests; the full Codex + acceptance-gate ceremony only at module boundaries and before anything irreversible. | Slice 1 spent ~1.2M shared-seat tokens across 5 Codex passes largely on wording; the owner already moved this way ("batch the Codex review") — make it standing policy for the new build. | ACCEPTED + PRACTICED (folded into plan v1.0 §5 as the S-4 module-boundary gates, owner GO 2026-07-02; run at M1/M2/Pub; status synced 2026-07-06) |
+| S-5 | 2026-07-02 | **Close out the suspended slice-2 diff:** commit it as-is with its honest degraded-run labels; declare the multi-agent-activation lineage CLOSED as "the spine's provenance" (capability proof); drop the clean-K live re-run — the pivot doesn't need it. | Converts a dangling obligation into the credibility exhibit the new build stands on; frees the repo for the restructure. | ACCEPTED + DONE (executed as S0 at the owner GO — slice-2 provenance close-out committed `a65064b`, 2026-07-02; status synced 2026-07-06) |
 | S-6 | 2026-07-02 | **Edge-case coverage = an enumerated taxonomy with measured eval coverage** (drift types × fee tactics × encoding × availability races × spec-version skew), never an "all edge cases" claim. | "All" is an overclaim our honesty rules forbid; enumerated + measured is stronger — it's provable. | ACCEPTED (standing directive c, decision-log 2026-07-02) |
 | S-7 | 2026-07-02 | **Demo-agent honesty guardrail:** the agent that "gets caught" is a demonstration actor — scripted/simulated (labeled) or Gemini-driven within the $5 cap — never Claude/Codex as product runtime. | Preserves the RULES §8 dev-tools-are-not-the-product line before the demo design starts, not after. | ACCEPTED (standing directive d, decision-log 2026-07-02) |
 | S-8 | 2026-07-02 | **Documentation frameworks as the floor:** Diátaxis (doc architecture) · Minto Pyramid/SCQA (summaries + narrative; resonance from story structure, never hype) · C4 model (architecture visuals; context level = the lay view) · two-register principle + glossary. | Grounds the owner's "document like a professional" directive in named, verifiable methodologies instead of taste. | ACCEPTED (`docs/documentation-standard.md`, decision-log 2026-07-02) |
-| S-9 | 2026-07-02 | **The product's own output IS a document:** the drift/audit report a merchant or platform engineer receives must itself meet the documentation standard — professional terminology, evidence attached, one readable page, a visual, a plain-words summary line per finding. | The documentation discipline and product quality converge in the report; designing it in from the start beats retrofitting. | PROPOSED (design into the plan) |
+| S-9 | 2026-07-02 | **The product's own output IS a document:** the drift/audit report a merchant or platform engineer receives must itself meet the documentation standard — professional terminology, evidence attached, one readable page, a visual, a plain-words summary line per finding. | The documentation discipline and product quality converge in the report; designing it in from the start beats retrofitting. | ACCEPTED + IMPLEMENTED (W3 one-page `/report` + machine JSON, per-finding `plainLine`, legibility as hard constraint; M1 SHIP 2026-07-03; status synced 2026-07-06) |
 | S-10 | 2026-07-02 | **Legibility as concrete artifact constraints:** one-command validator · one-page drift report · a demo that needs no explanation — "complexity spent inside, simplicity delivered outside." | Turns the owner's "not complex outwards" intent into testable design requirements. | ACCEPTED (standing directive b, decision-log 2026-07-02) |
 
-| S-11 | 2026-07-02 | **Product name recommendation: "Assay"** (the independent test of what's claimed — gold assaying; maker≠judge in one word; CLI-native: `assay check feed.json`; tagline "Assay — the truth layer for agentic commerce"). Alternates in order: Parallax · Tare · Trig · Plumbline · Kilter. Naming principles applied: 1–2 syllables, concrete truth-semantics, CLI-usable, domain-neutral across both modules, no category clichés (no Veri-/Truth-/-ify/AI suffixes). Killed-for-collision but conceptually noted: Tally (split tally-stick; tally.so), Expo (kitchen expeditor; expo.dev), Galley (galley proof; Galley food-data co), Hawk-Eye (keep as pitch analogy only). **All collision notes are UNVERIFIED-from-memory — a live trademark/domain/npm/GitHub check is REQUIRED before adoption (RULES §6); name confirm = owner-gated stop.** LIVE SCREEN RAN at the Pub gate (2026-07-06): **"Assay" COLLIDED** — assay.tools is a live 2026 AI-agent devtools product (same broad space) and bare npm `assay` is squatted (abandoned 2013); alternates not fully screened (seat limits; labeled UNVERIFIED). Interim: the repo publishes under the DESCRIPTIVE name "Commerce Truth Audit" (not a brand adoption — this gate stays open). | PENDING (owner brand pick; descriptive interim adopted 2026-07-06) |
+| S-11 | 2026-07-02 | **Product name recommendation: "Assay"** (the independent test of what's claimed — gold assaying; maker≠judge in one word; CLI-native: `assay check feed.json`; tagline "Assay — the truth layer for agentic commerce"). Alternates in order: Parallax · Tare · Trig · Plumbline · Kilter. Naming principles applied: 1–2 syllables, concrete truth-semantics, CLI-usable, domain-neutral across both modules, no category clichés (no Veri-/Truth-/-ify/AI suffixes). Killed-for-collision but conceptually noted: Tally (split tally-stick; tally.so), Expo (kitchen expeditor; expo.dev), Galley (galley proof; Galley food-data co), Hawk-Eye (keep as pitch analogy only). **All collision notes are UNVERIFIED-from-memory — a live trademark/domain/npm/GitHub check is REQUIRED before adoption (RULES §6); name confirm = owner-gated stop.** LIVE SCREEN RAN at the Pub gate (2026-07-06): **"Assay" COLLIDED** — assay.tools is a live 2026 AI-agent devtools product (same broad space) and bare npm `assay` is squatted (abandoned 2013); alternates not fully screened (seat limits; labeled UNVERIFIED). Interim: the repo publishes under the DESCRIPTIVE name "Commerce Truth Audit" (not a brand adoption — this gate stays open). **FULL ALTERNATES SCREEN RAN LIVE (2026-07-06, fourteenth session — npm registry + GitHub handles + product web search; domains + trademark NOT checked, still required pre-adoption): Parallax = KILLED** (GradientHQ/parallax, live distributed-AI-inference devtool, #1 Product Hunt Oct 2025 + Parallax Worlds, funded AI-robotics startup + parall.ax AI consultancy — same/adjacent space) · **Trig = KILLED** (trig.ai, live London AI-agent platform, $10.3M raised — same space) · **Tare = RISKY** (Tare, live NY AI email-marketing startup for Shopify merchants, funded 2023, LinkedIn `tare-ai` — commerce-AI adjacent) · **Kilter = DILUTED but no same-space product** (Blackbaud-acquired wellness app 2022 + Kilter Systems agtech robots + Kilterly CS SaaS; bare npm/GitHub taken-stale) · **Plumbline = CLEANEST** (no live software product of that exact name found in AI/devtools/commerce; bare npm = stale 2022 Angular test util; github.com/plumbline taken; scoped `@plumbline/…` npm available as with all candidates). Ranked for the pick: **Plumbline > Kilter**; Tare risky; Parallax/Trig/Assay dead. | PENDING (owner brand pick — screen complete 2026-07-06; trademark/domain checks remain before adoption) |
 
 **Maintenance:** every new independent suggestion gets a row here in the same breath it's made; status updated when the owner reacts or a gate rules. Statuses here never substitute for the decision-log — consequential acceptances always get their decision-log row.
 
diff --git a/lib/packs/fees/audit.ts b/lib/packs/fees/audit.ts
index 88090d4..58cad65 100644
--- a/lib/packs/fees/audit.ts
+++ b/lib/packs/fees/audit.ts
@@ -136,16 +136,40 @@ function verdictPhrase(verdict: FeeVerdict, windowClose: string): string {
  * Audit one parsed monthly statement. Pure in (statement); no clock, no network,
  * no LLM. Returns the machine-readable, evidence-cited fee report.
  */
+/**
+ * Escape the claim-id separator in ARBITRARY statement strings (`orderId`,
+ * `declaredCategory`): '%' → '%25', '#' → '%23'. Keeps `id.split("#")`
+ * unambiguous while staying byte-identity on every committed corpus value
+ * (no fixture contains '#' or '%' — goldens unchanged). Reversible.
+ * Closes the M2 gate-4 advisory nit (2026-07-04 gate record, gate 4).
+ */
+export const claimIdPart = (s: string): string => s.replace(/%/g, "%25").replace(/#/g, "%23");
+
+/**
+ * Statement-position tagger — makes per-line claim ids unique when the same order
+ * carries repeated lines of one category (C2 traceability; M2 Codex finding #4).
+ * The map is OBJECT-IDENTITY keyed, so a line not a member of `statement.lines`
+ * throws loudly instead of rendering a silent "Lundefined" (M2 gate-4 advisory;
+ * unreachable via the parser — a defensive contract for direct constructors).
+ */
+export function makeLineTagger(statement: MonthlyStatement): (l: StatementLine) => string {
+  const index = new Map<StatementLine, number>(statement.lines.map((l, i) => [l, i]));
+  return (l) => {
+    const i = index.get(l);
+    if (i === undefined) {
+      throw new Error(`fees audit: line "${l.label}" (order ${l.orderId}) is not a member of statement.lines — the statement-position tag is object-identity based`);
+    }
+    return `L${i}`;
+  };
+}
+
 export function auditStatement(statement: MonthlyStatement): FeeAuditReport {
   const findings: FeeFinding[] = [];
   const month = statement.meta.month;
   const asOf = statement.meta.asOf;
   const windowClose = refundWindowClose(month);
   const nonRefund = statement.lines.filter((l) => !l.isRefund);
-  // Statement-position tag — makes per-line claim ids unique when the same order
-  // carries repeated lines of one category (C2 traceability; M2 Codex finding #4).
-  const lineIndex = new Map<StatementLine, number>(statement.lines.map((l, i) => [l, i]));
-  const lineTag = (l: StatementLine) => `L${lineIndex.get(l)}`;
+  const lineTag = makeLineTagger(statement);
 
   // ── d-1 category lock: unlawful DECLARED categories (per-line) ──────────────
   const d1 = FEE_RULE_BY_ID.get("NYC-563.3-d-1")!;
@@ -154,7 +178,7 @@ export function auditStatement(statement: MonthlyStatement): FeeAuditReport {
     const feeClass: FeeLineClass = classifyUnlawful(line.declaredCategory);
     findings.push(
       makeFeeFinding({
-        claim: { id: `${line.orderId}#${line.declaredCategory}#${lineTag(line)}`, source: "fee-statement", field: "declaredCategory", value: line.declaredCategory },
+        claim: { id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag(line)}`, source: "fee-statement", field: "declaredCategory", value: line.declaredCategory },
         referenceRowId: d1.sourceClause,
         ruleId: d1.id,
         severity: "error",
@@ -203,7 +227,7 @@ export function auditStatement(statement: MonthlyStatement): FeeAuditReport {
           // non-gating warn (M2 Codex finding #1). `ok` is unaffected (not a violation).
           findings.push(
             makeFeeFinding({
-              claim: { id: `${line.orderId}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "passthroughDocumented", value: true },
+              claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "passthroughDocumented", value: true },
               referenceRowId: c2.sourceClause,
               ruleId: c2.id,
               severity: "warn",
@@ -218,7 +242,7 @@ export function auditStatement(statement: MonthlyStatement): FeeAuditReport {
         }
         findings.push(
           makeFeeFinding({
-            claim: { id: `${line.orderId}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "amountCents", value: line.amountCents },
+            claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "amountCents", value: line.amountCents },
             referenceRowId: c1.sourceClause,
             ruleId: c1.id,
             severity: "error",
diff --git a/lib/packs/fees/classified-audit.ts b/lib/packs/fees/classified-audit.ts
index c6f937f..cccd846 100644
--- a/lib/packs/fees/classified-audit.ts
+++ b/lib/packs/fees/classified-audit.ts
@@ -55,7 +55,7 @@
  */
 import { makeFinding } from "../../verifier-core/guard.ts";
 import type { Finding } from "../../verifier-core/index.ts";
-import { auditStatement } from "./audit.ts";
+import { auditStatement, claimIdPart, makeLineTagger } from "./audit.ts";
 import {
   toClassifierInput,
   type ClassifierPrediction,
@@ -109,7 +109,7 @@ function buildAdvisoryFinding(
     claim: {
       // Statement-position tag keeps ids unique across repeated same-order,
       // same-category lines (C2 traceability; M2 Codex finding #4).
-      id: `${line.orderId}#${line.declaredCategory}#${lineTag}#classifier`,
+      id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag}#classifier`,
       source: "classifier",
       field: "predictedTrueCategory",
       value: prediction.predicted,
@@ -145,14 +145,14 @@ export function auditWithClassification(
   const base = auditStatement(statement);
   const nonRefund = statement.lines.filter((l) => !l.isRefund);
   const siblingDeclaredCategories = [...new Set(nonRefund.map((l) => l.declaredCategory))];
-  const lineIndex = new Map<StatementLine, number>(statement.lines.map((l, i) => [l, i]));
+  const lineTag = makeLineTagger(statement);
 
   const advisoryFindings: ClassifierAdvisoryFinding[] = [];
   for (const line of nonRefund) {
     const input = toClassifierInput(line, siblingDeclaredCategories);
     const prediction = classifier.classify(input);
     if (prediction.predicted === line.declaredCategory) continue; // no candidate — classifier agrees with the declared label
-    advisoryFindings.push(buildAdvisoryFinding(line, `L${lineIndex.get(line)}`, prediction, classifier));
+    advisoryFindings.push(buildAdvisoryFinding(line, lineTag(line), prediction, classifier));
   }
 
   return Object.freeze({ base, advisoryFindings: Object.freeze(advisoryFindings) });
diff --git a/lib/packs/fees/finding.ts b/lib/packs/fees/finding.ts
index fda773f..35b04fc 100644
--- a/lib/packs/fees/finding.ts
+++ b/lib/packs/fees/finding.ts
@@ -59,7 +59,7 @@ export const FEE_VERDICTS: readonly FeeVerdict[] = [
 
 /** A fee finding: a C2-valid core Finding + fee-domain state (both registers). */
 export interface FeeFinding extends Finding {
-  /** The §20-563.3(e) verdict state (a state, not prose). */
+  /** The fee verdict state (a state, not prose): the §20-563.3(e) refund states plus the c-2 `asserted-passthrough-unverified` warn (M2, 2026-07-04). */
   readonly verdict: FeeVerdict;
   /** Plan §7 fee-line class this finding belongs to. */
   readonly feeClass: FeeLineClass;
diff --git a/lib/packs/fees/index.ts b/lib/packs/fees/index.ts
index 79a11c9..a0504ff 100644
--- a/lib/packs/fees/index.ts
+++ b/lib/packs/fees/index.ts
@@ -80,6 +80,8 @@ export {
   FEES_SPEC_VERSION,
   FEES_CLASSIFICATION_LABEL,
   auditStatement,
+  claimIdPart,
+  makeLineTagger,
 } from "./audit.ts";
 export type { FeeAnswerKey, FeeAnswerKeyEntry, FeeDetectionMode } from "./generate.ts";
 export {

codex
The diff is narrowly scoped to the fee pack plus suggestion-ledger status text, with the new test untracked as requested. I’m now checking the byte-freeze premise against actual fixture/golden/generated values rather than accepting the evidence-log claim.
exec
/bin/zsh -lc "sed -n '1,380p' lib/packs/fees/audit.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
/**
 * Fee-audit engine — F1a (plan §5 F1 item 4 + items 5/6/7).
 *
 * Runs the codified §20-563.3 predicates (rules.ts) over a parsed
 * {@link MonthlyStatement} and assembles an evidence-cited {@link FeeAuditReport}.
 * Deterministic, $0, zero network / LLM / clock reads — the evaluation date
 * arrives as data (`meta.asOf`) so identical statements give byte-identical
 * reports. Every finding is built through {@link makeFeeFinding} (C2 receipts +
 * the U1 provisional marker on base-derived rules).
 *
 * Statutory logic encoded here:
 *  - CATEGORY LOCK (d-1): a non-refund line whose DECLARED category is not one of
 *    the four legal ones is per se unlawful (catches bundling / promotion-deduction
 *    / relabel-to-nonlegal). An unlawful line has no legal cap to test further.
 *  - PER-ORDER ∨ MONTHLY-AVERAGE (a/b/d): the cap is met if EITHER every order is
 *    within the per-order cap OR the calendar-month average is within cap. Only
 *    when the monthly average ALSO fails is the category over cap — so a per-order
 *    overage the averaging alternative rescues is NOT reported (no overclaim).
 *  - e-1 REFUND SAFE HARBOR (a/b/d only): an over-cap category is a `violation`
 *    only once the 30-day window closes with no covering refund; still-open →
 *    `conditional-pending-refund-window`; refunded-in-window → `cured-by-refund`.
 *  - TRANSACTION FEE (c): a hard 3% per-order cap, NO averaging and NO safe harbor
 *    (verdict is always `violation`). A line above 3% carrying the c-2 pass-through
 *    flag is NOT cleared silently: the flag is asserted by the platform and the
 *    statement cannot verify the fee equals the actual processor charge, so the
 *    reliance is surfaced as a non-gating `asserted-passthrough-unverified` warn
 *    (M2 Codex finding #1, 2026-07-04).
 *  - d-4: an enhanced fee with no basic fee in the statement is disallowed.
 *
 * Plain: read the bill line by line against the legal caps, and say for each catch
 * whether it's a settled violation or still inside the legal refund-grace window —
 * always with the "we assumed this definition of purchase price" asterisk when the
 * call depends on it.
 *
 * HONESTY (C10): the input statements are SIMULATED; only the codified law is real.
 */
import {
  buildFeeReport,
  makeFeeFinding,
  PROVISIONAL_U1,
  type FeeAuditReport,
  type FeeFinding,
  type FeeVerdict,
} from "./finding.ts";
import {
  categoryUnlawful,
  enhancedWithoutBasic,
  FEE_RULE_BY_ID,
  monthlyAverageExceeded,
  perOrderCapExceeded,
  transactionPassthroughAllowed,
} from "./rules.ts";
import {
  ASSUMED_PURCHASE_PRICE_BASE,
  LEGAL_FEE_CATEGORIES,
  type LegalFeeCategory,
  type MonthlyStatement,
  type StatementLine,
} from "./statement.ts";
import type { FeeLineClass } from "./index.ts";

/** Rule-table version pinned into every fee report header (C10). */
export const FEES_SPEC_VERSION =
  "uc1-rule-table-draft/2026-07-03+NYC§20-563.3+LL79-2025+base-U1-unresolved";

/** Honest scope label — the deterministic spine audits categories AS DECLARED. */
export const FEES_CLASSIFICATION_LABEL =
  "as-declared by the platform; deterministic audit; LLM line-item classifier DEFERRED (F1b)";

/** Per-category cap configuration (drives the a/b/d/c logic; ids drift-locked to the twin). */
interface CapConfig {
  readonly perOrderRuleId: string;
  readonly monthlyRuleId?: string; // absent for transaction (c) — no averaging
  readonly capPct: number;
  readonly hasSafeHarbor: boolean;
}

const CAP_CONFIG: Readonly<Record<LegalFeeCategory, CapConfig>> = {
  delivery_fee: { perOrderRuleId: "NYC-563.3-a-1", monthlyRuleId: "NYC-563.3-a-2", capPct: 15, hasSafeHarbor: true },
  basic_service_fee: { perOrderRuleId: "NYC-563.3-b-1", monthlyRuleId: "NYC-563.3-b-2", capPct: 5, hasSafeHarbor: true },
  transaction_fee: { perOrderRuleId: "NYC-563.3-c-1", capPct: 3, hasSafeHarbor: false },
  enhanced_service_fee: { perOrderRuleId: "NYC-563.3-d-2", monthlyRuleId: "NYC-563.3-d-3", capPct: 20, hasSafeHarbor: true },
};

const dollars = (cents: number): string => `$${(cents / 100).toFixed(2)}`;
const pctOf = (feeCents: number, baseCents: number): string =>
  `${((feeCents / baseCents) * 100).toFixed(1)}%`;

/** The §20-563.3(e) window close: 30 days after the month's final day (pure date math, no clock). */
function refundWindowClose(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0));
  return new Date(last.getTime() + 30 * 86_400_000).toISOString().slice(0, 10);
}

/**
 * Distinct-order purchase sum for the month (dedupe by orderId — no double count).
 *
 * DOCUMENTED LIMITATION (elevation, 2026-07-04): the statutory monthly-average
 * base is the purchase price of ALL online orders in the calendar month, but a
 * statement only shows orders that carry at least one fee line — an order with
 * zero fees is invisible here, so this denominator can UNDERCOUNT the statutory
 * base and bias the average HIGH (toward flagging). Unlike U1 this bias runs
 * against the platform, which is why every monthly-average finding is already
 * U1-provisional and never an unqualified verdict. §20-563.3(h) makes the gap
 * narrow in practice (every transaction must be itemized), and the seeded corpus
 * gives every order a fee line, so goldens are unaffected.
 */
function sumDistinctOrderPurchase(lines: readonly StatementLine[]): number {
  const byOrder = new Map<string, number>();
  for (const l of lines) if (!byOrder.has(l.orderId)) byOrder.set(l.orderId, l.orderPurchasePriceCents);
  let sum = 0;
  for (const v of byOrder.values()) sum += v;
  return sum;
}

/** The provisional over-cap qualifier phrase (item 5(iii)) — never an unqualified violation. */
function provisionalQualifier(): string {
  return `over-cap under the ASSUMED base "${ASSUMED_PURCHASE_PRICE_BASE}" — PROVISIONAL (U1)`;
}

function verdictPhrase(verdict: FeeVerdict, windowClose: string): string {
  switch (verdict) {
    case "violation":
      return "violation (the 30-day refund window has closed with no covering refund)";
    case "conditional-pending-refund-window":
      return `conditional — pending the 30-day refund window (closes ${windowClose})`;
    case "cured-by-refund":
      return "cured by a refund within the 30-day window (not a violation)";
    case "asserted-passthrough-unverified":
      return "not verifiable from the statement — the pass-through exception is asserted, not proven";
  }
}

/**
 * Audit one parsed monthly statement. Pure in (statement); no clock, no network,
 * no LLM. Returns the machine-readable, evidence-cited fee report.
 */
/**
 * Escape the claim-id separator in ARBITRARY statement strings (`orderId`,
 * `declaredCategory`): '%' → '%25', '#' → '%23'. Keeps `id.split("#")`
 * unambiguous while staying byte-identity on every committed corpus value
 * (no fixture contains '#' or '%' — goldens unchanged). Reversible.
 * Closes the M2 gate-4 advisory nit (2026-07-04 gate record, gate 4).
 */
export const claimIdPart = (s: string): string => s.replace(/%/g, "%25").replace(/#/g, "%23");

/**
 * Statement-position tagger — makes per-line claim ids unique when the same order
 * carries repeated lines of one category (C2 traceability; M2 Codex finding #4).
 * The map is OBJECT-IDENTITY keyed, so a line not a member of `statement.lines`
 * throws loudly instead of rendering a silent "Lundefined" (M2 gate-4 advisory;
 * unreachable via the parser — a defensive contract for direct constructors).
 */
export function makeLineTagger(statement: MonthlyStatement): (l: StatementLine) => string {
  const index = new Map<StatementLine, number>(statement.lines.map((l, i) => [l, i]));
  return (l) => {
    const i = index.get(l);
    if (i === undefined) {
      throw new Error(`fees audit: line "${l.label}" (order ${l.orderId}) is not a member of statement.lines — the statement-position tag is object-identity based`);
    }
    return `L${i}`;
  };
}

export function auditStatement(statement: MonthlyStatement): FeeAuditReport {
  const findings: FeeFinding[] = [];
  const month = statement.meta.month;
  const asOf = statement.meta.asOf;
  const windowClose = refundWindowClose(month);
  const nonRefund = statement.lines.filter((l) => !l.isRefund);
  const lineTag = makeLineTagger(statement);

  // ── d-1 category lock: unlawful DECLARED categories (per-line) ──────────────
  const d1 = FEE_RULE_BY_ID.get("NYC-563.3-d-1")!;
  for (const line of nonRefund) {
    if (!categoryUnlawful(line.declaredCategory)) continue;
    const feeClass: FeeLineClass = classifyUnlawful(line.declaredCategory);
    findings.push(
      makeFeeFinding({
        claim: { id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag(line)}`, source: "fee-statement", field: "declaredCategory", value: line.declaredCategory },
        referenceRowId: d1.sourceClause,
        ruleId: d1.id,
        severity: "error",
        verdict: "violation",
        feeClass,
        professionalLine: `Line "${line.label}" is charged under the non-permitted category "${line.declaredCategory}" (${dollars(line.amountCents)} on order ${line.orderId}) — §20-563.3(d) permits only the four categories; any other fee is unlawful.`,
        plainLine: `The bill charges ${dollars(line.amountCents)} as "${line.declaredCategory}" — that isn't one of the four fee types the law allows, so it's not permitted no matter what it's called.`,
      }),
    );
  }

  // ── d-4 enhanced-without-basic (statement-level) ────────────────────────────
  if (enhancedWithoutBasic(statement)) {
    const d4 = FEE_RULE_BY_ID.get("NYC-563.3-d-4")!;
    findings.push(
      makeFeeFinding({
        claim: { id: `${month}#enhanced-without-basic`, source: "fee-statement", field: "declaredCategory", value: "enhanced_service_fee" },
        referenceRowId: d4.sourceClause,
        ruleId: d4.id,
        severity: "error",
        verdict: "violation",
        feeClass: "misclassification",
        professionalLine: "An enhanced service fee is charged but the statement carries no basic service fee — §20-563.3(d) permits the enhanced tier only for a platform that also offers (and charges a basic service fee for) the basic service.",
        plainLine: "They billed an 'extras' fee without ever offering the plain basic plan — the law only allows the extras fee if the basic plan exists too.",
      }),
    );
  }

  // ── per-category cap checks (a/b/d monthly-average ∨ per-order; c per-order) ──
  const sumPurchaseAll = sumDistinctOrderPurchase(nonRefund);
  for (const category of LEGAL_FEE_CATEGORIES) {
    const cfg = CAP_CONFIG[category];
    const catLines = nonRefund.filter((l) => l.declaredCategory === category);
    if (catLines.length === 0) continue;

    if (category === "transaction_fee") {
      // c-1: hard 3% per order, NO averaging, NO safe harbor; c-2 exception.
      const c1 = FEE_RULE_BY_ID.get("NYC-563.3-c-1")!;
      const c2 = FEE_RULE_BY_ID.get("NYC-563.3-c-2")!;
      for (const line of catLines) {
        if (!perOrderCapExceeded(line.amountCents, line.orderPurchasePriceCents, cfg.capPct)) continue;
        if (transactionPassthroughAllowed(line)) {
          // c-2 exception — but the flag is ASSERTED by the platform; the statement
          // cannot verify the fee equals the actual processor charge (§20-563.3(c)(i)–(ii)
          // requires exactly that). Never clear silently: surface the reliance as a
          // non-gating warn (M2 Codex finding #1). `ok` is unaffected (not a violation).
          findings.push(
            makeFeeFinding({
              claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "passthroughDocumented", value: true },
              referenceRowId: c2.sourceClause,
              ruleId: c2.id,
              severity: "warn",
              verdict: "asserted-passthrough-unverified",
              feeClass: "processing-fee-base-inflation",
              provisional: [PROVISIONAL_U1],
              professionalLine: `Transaction fee ${dollars(line.amountCents)} on order ${line.orderId} is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} of the purchase price — above the 3% cap, relying on the §20-563.3(c)(i)–(ii) pass-through exception AS ASSERTED by the platform's passthroughDocumented flag. The statement cannot verify the fee equals the actual processor charge; ${provisionalQualifier()}. Not counted as a violation; flagged for evidence-backed verification outside the statement.`,
              plainLine: `The card-processing fee here is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} — over the 3% limit, but the platform says it's just passing through the real card cost. This bill alone can't prove that, so we flag it instead of clearing it or calling it a violation. (Also depends on the open "purchase price" question, U1.)`,
            }),
          );
          continue;
        }
        findings.push(
          makeFeeFinding({
            claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "amountCents", value: line.amountCents },
            referenceRowId: c1.sourceClause,
            ruleId: c1.id,
            severity: "error",
            verdict: "violation", // c has NO refund safe harbor (subd. e excludes it)
            feeClass: "processing-fee-base-inflation",
            provisional: [PROVISIONAL_U1],
            professionalLine: `Transaction fee ${dollars(line.amountCents)} on order ${line.orderId} is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} of the purchase price — over the hard 3% cap, not documented as a pass-through (§20-563.3(c)); ${provisionalQualifier()}. No refund safe harbor applies to the transaction fee.`,
            plainLine: `The card-processing fee here is ${pctOf(line.amountCents, line.orderPurchasePriceCents)} — over the flat 3% limit, with no proof it's just passing through the real card cost. (This depends on what "purchase price" includes — still an open question, U1.)`,
          }),
        );
      }
      continue;
    }

    // a/b/d: category is over cap only if the monthly average ALSO fails.
    const sumFees = catLines.reduce((s, l) => s + l.amountCents, 0);
    if (!monthlyAverageExceeded(sumFees, sumPurchaseAll, cfg.capPct)) continue; // averaging alternative met

    const monthly = FEE_RULE_BY_ID.get(cfg.monthlyRuleId!)!;
    const verdict = e1Verdict(category, cfg.capPct, sumFees, sumPurchaseAll, month, asOf, windowClose, statement.lines);
    findings.push(
      makeFeeFinding({
        claim: { id: `${month}#${category}`, source: "fee-statement", field: "monthlyAverage", value: { sumFeesCents: sumFees, sumPurchasePriceCents: sumPurchaseAll, capPct: cfg.capPct } },
        referenceRowId: monthly.sourceClause,
        ruleId: monthly.id,
        severity: "error",
        verdict,
        feeClass: "over-cap",
        provisional: [PROVISIONAL_U1],
        professionalLine: `${labelFor(category)} total ${dollars(sumFees)} on ${dollars(sumPurchaseAll)} of monthly purchases = ${pctOf(sumFees, sumPurchaseAll)} vs the ${cfg.capPct}% cap (${monthly.id}); ${provisionalQualifier()}; ${verdictPhrase(verdict, windowClose)}.`,
        plainLine: `Across the month, ${labelFor(category).toLowerCase()} came to ${pctOf(sumFees, sumPurchaseAll)} of order value — over the ${cfg.capPct}% limit even on the monthly average. ${plainVerdict(verdict, windowClose)} (Depends on the still-open definition of "purchase price", U1.)`,
      }),
    );
  }

  return buildFeeReport(findings, {
    specVersion: FEES_SPEC_VERSION,
    classification: FEES_CLASSIFICATION_LABEL,
  });
}

/** e-1 verdict for an over-cap a/b/d category. Refunds must be dated within the window. */
function e1Verdict(
  category: LegalFeeCategory,
  capPct: number,
  sumFeesCents: number,
  sumPurchaseAllCents: number,
  month: string,
  asOf: string,
  windowClose: string,
  allLines: readonly StatementLine[],
): FeeVerdict {
  const excessScaled = sumFeesCents * 100 - capPct * sumPurchaseAllCents; // > 0 (caller checked)
  const refundedInWindow = allLines
    .filter(
      (l) =>
        l.isRefund &&
        l.declaredCategory === category &&
        l.month === month &&
        l.refundedAtDate !== undefined &&
        l.refundedAtDate <= windowClose,
    )
    .reduce((s, l) => s + l.amountCents, 0);
  if (refundedInWindow * 100 >= excessScaled) return "cured-by-refund";
  if (asOf <= windowClose) return "conditional-pending-refund-window";
  return "violation";
}

/** Report-grouping class for a d-1 (unlawful category) finding — a display hint. */
function classifyUnlawful(declared: string): FeeLineClass {
  const d = declared.toLowerCase();
  if (d.includes("promo")) return "promotion-deduction-mischaracterization";
  if (d.includes("bundle") || (d.includes("service") && d.includes("delivery"))) return "bundling";
  return "misclassification";
}

function labelFor(category: LegalFeeCategory): string {
  switch (category) {
    case "delivery_fee": return "Delivery fees";
    case "basic_service_fee": return "Basic service fees";
    case "transaction_fee": return "Transaction fees";
    case "enhanced_service_fee": return "Enhanced service fees";
  }
}

function plainVerdict(verdict: FeeVerdict, windowClose: string): string {
  switch (verdict) {
    case "violation": return "The 30-day window to refund the overcharge has closed with no refund, so this is a violation.";
    case "conditional-pending-refund-window": return `It's not a violation yet — the platform still has until ${windowClose} to refund the excess.`;
    case "cured-by-refund": return "The excess was refunded in time, so this is not a violation.";
    case "asserted-passthrough-unverified": return "The platform says this is a straight pass-through of the card processor's charge — this bill alone can't prove or disprove that.";
  }
}

exec
/bin/zsh -lc "sed -n '1,260p' lib/packs/fees/statement.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
/**
 * Fee-statement schema — F1a (UC-1 deterministic spine, plan §5 F1 / §7).
 *
 * The typed model of a THIRD-PARTY DELIVERY PLATFORM's monthly itemized fee
 * statement, as the codified rule table's statement-input contract requires
 * (docs/research/uc1-rule-table.md § "JSON schema"; NYC §20-563.3(h) guarantees
 * such a per-transaction itemized list exists). Every money value is INTEGER
 * CENTS — no float money, ever. The statement is SIMULATED: a mandatory
 * `simulated: true` marker rides on the wrapper (C10), and no field claims real
 * platform data.
 *
 * TWO SEAMS modeled now (F1b fills the classifier between them):
 *  - `declaredCategory` is what the PLATFORM CLAIMS a line is — it may be one of
 *    the four legal categories OR an arbitrary/other label the platform invented.
 *  - the TRUE category (what the charge actually is) is the F1b line-item
 *    classifier's job; it lives ONLY in the generator's answer key, NEVER in the
 *    statement. The deterministic spine audits the statement AS DECLARED.
 *
 * Plain: a fake-but-realistic monthly delivery bill, in the shape the law says
 * the platform owes the restaurant — every fee line, in whole cents, labeled
 * simulated. What each fee is CALLED is on the bill; what it REALLY is is the
 * classifier's job (a later slice), kept out of the bill on purpose.
 */

/** The four fee categories NYC §20-563.3(d) permits — the category-lock whitelist. */
export type LegalFeeCategory =
  | "delivery_fee"
  | "basic_service_fee"
  | "transaction_fee"
  | "enhanced_service_fee";

/** Ordered legal categories — runtime export so rules/evals can enumerate them. */
export const LEGAL_FEE_CATEGORIES: readonly LegalFeeCategory[] = [
  "delivery_fee",
  "basic_service_fee",
  "transaction_fee",
  "enhanced_service_fee",
] as const;

/** True iff `v` is one of the four legally permitted fee categories. */
export function isLegalFeeCategory(v: string): v is LegalFeeCategory {
  return (LEGAL_FEE_CATEGORIES as readonly string[]).includes(v);
}

/**
 * The platform's DECLARED category for a line. A legal category is a
 * {@link LegalFeeCategory}; anything else is an arbitrary/other label the
 * platform used (e.g. "promotion_deduction", "service_and_delivery") — the
 * distinction between declared and TRUE category is F1b's job. Kept as a bare
 * `string` so an arbitrary label is representable without loss.
 */
export type DeclaredCategory = string;

/** One fee line of the monthly itemized statement (per §20-563.3(h)). */
export interface StatementLine {
  /** The online order this fee was charged against. */
  readonly orderId: string;
  /** Calendar month of the charge, "YYYY-MM" (drives the monthly-average + e-1 window). */
  readonly month: string;
  /** What the PLATFORM claims this line is — legal category OR arbitrary label. */
  readonly declaredCategory: DeclaredCategory;
  /** The platform's free-text line label as printed on the statement. */
  readonly label: string;
  /** The charged amount, INTEGER cents (never a float; >= 0). */
  readonly amountCents: number;
  /**
   * The order's purchase price, INTEGER cents (> 0) — the cap base. Its exact
   * inclusions/exclusions are UNRESOLVED (U1); see PURCHASE_PRICE_BASE_STATUS.
   */
  readonly orderPurchasePriceCents: number;
  /** True iff this line is a refund/credit (relevant to the §20-563.3(e) safe harbor). */
  readonly isRefund: boolean;
  /**
   * True iff the platform documents this charge as an exact processor pass-through
   * (the §20-563.3(c)(i)–(ii) exception to the 3% transaction-fee cap). An
   * asserted flag — the audit cannot verify the underlying processor charge.
   */
  readonly passthroughDocumented: boolean;
  /**
   * ISO date "YYYY-MM-DD" the refund was issued — present iff {@link isRefund}.
   * Used to test the §20-563.3(e) 30-day window; a refund with no date cannot
   * satisfy the safe harbor.
   */
  readonly refundedAtDate?: string;
}

/** Generator provenance — the statement corpus is seeded/deterministic (plan §8). */
export interface StatementGenerator {
  readonly name: string;
  readonly seed: number;
  readonly version: string;
}

/** Statement-level metadata + the MANDATORY simulated marker (C10). */
export interface StatementMeta {
  /** Honesty label — always true for this corpus (C10). */
  readonly simulated: true;
  readonly generator: StatementGenerator;
  /** The restaurant the statement is addressed to (simulated). */
  readonly merchant: string;
  /** The statement's calendar month, "YYYY-MM". */
  readonly month: string;
  /** ISO-4217 currency for every amount. */
  readonly currency: "USD";
  /**
   * The evaluation date, "YYYY-MM-DD" — DATA, never a clock read (determinism).
   * The §20-563.3(e) refund window is resolved against this, so identical inputs
   * always yield byte-identical verdicts.
   */
  readonly asOf: string;
  /**
   * The ASSUMED purchase-price base convention this statement's amounts follow
   * (U1 is unresolved — see PURCHASE_PRICE_BASE_STATUS). Declared explicitly so
   * the answer-key gold labels are internally consistent with a stated base.
   */
  readonly purchasePriceBaseConvention: string;
}

/** A merchant's monthly itemized fee statement — the audit's minimum input. */
export interface MonthlyStatement {
  readonly meta: StatementMeta;
  readonly lines: readonly StatementLine[];
}

/**
 * U1 PROVISIONALITY, in ONE place (plan F1a item 5). The statutory cap base
 * ("purchase price of each online order") is quoted verbatim but its
 * inclusions/exclusions (tax / tip / pre- vs post-discount subtotal) are
 * UNVERIFIED (source-memo U1). Every base-derived verdict is provisional until
 * this flips; resolving U1 later is a one-constant edit.
 */
export const PURCHASE_PRICE_BASE_STATUS = "unresolved-U1" as const;

/**
 * The ASSUMED base convention the F1a corpus + audit operate under while U1 is
 * unresolved. Rendered into every base-derived verdict so a reader always sees
 * the assumption behind an over-cap call (plan F1a item 5(iii)).
 */
export const ASSUMED_PURCHASE_PRICE_BASE =
  "order item subtotal before discounts, excluding tax and tip (ASSUMED — U1 unresolved)";

exec
/bin/zsh -lc "sed -n '1,280p' lib/packs/fees/generate.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
/**
 * Seeded fee-statement generator — F1a (plan §5 F1 item 2; §8 seeded/deterministic).
 *
 * Produces the frozen fee corpus: a FAITHFUL statement (all compliant) and three
 * DRIFTED statements that plant the plan §7 fee-line classes, plus a machine
 * ANSWER KEY that labels every planted violation with its class, expected rule id,
 * expected verdict, and detection mode (deterministic vs deferred-to-classifier).
 *
 * DETERMINISM: the builder is a pure function of the pinned seed; the seed pins
 * provenance/reproducibility, while the fee AMOUNTS are fixed by design — each
 * plants an EXACT, answer-keyed violation at a known cap boundary (random amounts
 * would make boundary-exact planting fragile). A freeze-integrity eval byte-locks
 * the committed fixtures to this builder.
 *
 * IMPORTANT (U1, structural): the ASSUMED purchase-price base convention is a
 * NAMED parameter, recorded in the answer-key meta AND every statement's meta, so
 * the gold labels are internally consistent with one stated base.
 *
 * Everything is SIMULATED and labeled so (C10): no real platform, merchant, or
 * fee data — synthetic statements audited against REAL codified law (NYC §20-563.3).
 *
 * Plain: the recipe that builds the fake delivery bills — one honest bill and
 * three rigged ones — plus the answer key saying exactly which cheats are planted
 * and which our deterministic checker can (and can't yet) catch.
 */
import { auditStatement, FEES_SPEC_VERSION } from "./audit.ts";
import type { FeeAuditReport, FeeVerdict } from "./finding.ts";
import type { FeeLineClass } from "./index.ts";
import {
  ASSUMED_PURCHASE_PRICE_BASE,
  type MonthlyStatement,
  type StatementLine,
} from "./statement.ts";

export const FEES_CORPUS_SEED = 20260703;
const CORPUS_MONTH = "2026-06";
const AS_OF_CLOSED = "2026-08-15"; // after the §20-563.3(e) window (closes 2026-07-30)
const AS_OF_OPEN = "2026-07-10"; // inside the window
const MERCHANT = "Curbside Commons Test Kitchen (simulated)";

const GENERATOR = { name: "synthetic-fee-statements", seed: FEES_CORPUS_SEED, version: "1.0.0" } as const;

/** Detection mode recorded per planted violation (measured honestly by C6). */
export type FeeDetectionMode = "deterministic" | "deferred-to-classifier";

/** One answer-key entry — ground truth for a planted line/aggregate. */
export interface FeeAnswerKeyEntry {
  readonly id: string;
  readonly feeClass: FeeLineClass;
  readonly detection: FeeDetectionMode;
  /** The exact claim.id the engine emits for this catch (null iff deferred). */
  readonly expectedClaimId: string | null;
  /** The rule id the engine cites (null iff deferred). */
  readonly expectedRuleId: string | null;
  /** The verdict state the engine assigns (null iff deferred). */
  readonly expectedVerdict: FeeVerdict | null;
  /** The order(s) the planted line rides on — for readability. */
  readonly targetOrderId: string;
  readonly note: string;
}

/** The full answer key for the fee corpus (per statement file). */
export interface FeeAnswerKey {
  readonly simulated: true;
  readonly seed: number;
  readonly asOf: { readonly closed: string; readonly open: string };
  /** The single ASSUMED base convention every gold label is consistent with (U1). */
  readonly purchasePriceBaseConvention: string;
  readonly statements: Readonly<Record<string, { readonly entries: readonly FeeAnswerKeyEntry[] }>>;
}

// ── builders ──────────────────────────────────────────────────────────────────

function meta(month: string, asOf: string): MonthlyStatement["meta"] {
  return {
    simulated: true,
    generator: GENERATOR,
    merchant: MERCHANT,
    month,
    currency: "USD",
    asOf,
    purchasePriceBaseConvention: ASSUMED_PURCHASE_PRICE_BASE,
  };
}

function line(
  orderId: string,
  declaredCategory: string,
  label: string,
  amountCents: number,
  orderPurchasePriceCents: number,
  extra: Partial<StatementLine> = {},
): StatementLine {
  return {
    orderId,
    month: CORPUS_MONTH,
    declaredCategory,
    label,
    amountCents,
    orderPurchasePriceCents,
    isRefund: false,
    passthroughDocumented: false,
    ...extra,
  };
}

/** FAITHFUL: every line within cap, monthly averages within, basic present (no d-4). */
export function buildFaithfulStatement(): MonthlyStatement {
  return {
    meta: meta(CORPUS_MONTH, AS_OF_CLOSED),
    lines: [
      line("ORD-1", "delivery_fee", "Delivery fee", 300, 2000), // 15% exactly
      line("ORD-1", "basic_service_fee", "Basic service fee", 100, 2000), // 5%
      line("ORD-1", "transaction_fee", "Card processing", 60, 2000), // 3%
      line("ORD-1", "enhanced_service_fee", "Premium placement", 400, 2000), // 20%
      line("ORD-2", "delivery_fee", "Delivery fee", 300, 3000), // 10%
      line("ORD-2", "basic_service_fee", "Basic service fee", 90, 3000), // 3%
    ],
  };
}

/**
 * DRIFTED: plants the six §7 classes. Delivery is systematically over 15% so the
 * MONTHLY AVERAGE fails (not just per-order); a transaction fee is over the hard
 * 3%; two lines use non-permitted categories (bundling + promotion-deduction);
 * an enhanced fee rides with no basic (d-4). Two ORD-5 lines are within-cap under
 * legal categories — bundling/relabeling only a classifier can unmask (deferred).
 */
export function buildDriftedStatement(): MonthlyStatement {
  return {
    meta: meta(CORPUS_MONTH, AS_OF_CLOSED),
    lines: [
      line("ORD-1", "delivery_fee", "Delivery fee", 360, 2000), // 18% (over 15%)
      line("ORD-1", "transaction_fee", "Card processing", 160, 2000), // 8% (over 3%)
      line("ORD-2", "delivery_fee", "Delivery fee", 360, 2000), // 18%
      line("ORD-2", "enhanced_service_fee", "Premium placement", 200, 2000), // 10% (within, but no basic → d-4)
      line("ORD-3", "delivery_fee", "Delivery fee", 360, 2000), // 18%
      line("ORD-3", "service_and_delivery", "Combined service + delivery bundle", 150, 2000), // d-1 bundling
      line("ORD-4", "delivery_fee", "Delivery fee", 360, 2000), // 18%
      line("ORD-4", "promotion_deduction", "Promo recovery charge", 120, 2000), // d-1 promotion-deduction
      line("ORD-5", "transaction_fee", "Fees (service + processing bundle)", 20, 1000), // 2% (within) — deferred bundling
      line("ORD-5", "enhanced_service_fee", "Marketing (formerly delivery)", 150, 1000), // 15% (within) — deferred relabeling
    ],
  };
}

/** CURED: a delivery over-cap fully refunded within the §20-563.3(e) window. */
export function buildCuredStatement(): MonthlyStatement {
  return {
    meta: meta(CORPUS_MONTH, AS_OF_CLOSED),
    lines: [
      line("ORD-C1", "delivery_fee", "Delivery fee", 360, 2000), // 18%
      line("ORD-C2", "delivery_fee", "Delivery fee", 360, 2000), // 18% → monthly over by $1.20
      line("ORD-C1", "delivery_fee", "Refund: delivery over-cap correction", 120, 2000, {
        isRefund: true,
        refundedAtDate: "2026-07-15", // within the window (closes 2026-07-30)
      }),
    ],
  };
}

/** CONDITIONAL: the same delivery over-cap, evaluated while the window is still open. */
export function buildConditionalStatement(): MonthlyStatement {
  return {
    meta: meta(CORPUS_MONTH, AS_OF_OPEN),
    lines: [
      line("ORD-K1", "delivery_fee", "Delivery fee", 360, 2000), // 18%
      line("ORD-K2", "delivery_fee", "Delivery fee", 360, 2000), // 18% → monthly over
    ],
  };
}

/** The machine answer key — ground truth for the whole corpus. */
export function buildFeeAnswerKey(): FeeAnswerKey {
  return {
    simulated: true,
    seed: FEES_CORPUS_SEED,
    asOf: { closed: AS_OF_CLOSED, open: AS_OF_OPEN },
    purchasePriceBaseConvention: ASSUMED_PURCHASE_PRICE_BASE,
    statements: {
      "statement.faithful.json": { entries: [] },
      "statement.drifted.json": {
        entries: [
          { id: "fee-drift-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "violation", targetOrderId: "ORD-1..ORD-4", note: "delivery fees average 16% of monthly purchases — over the 15% cap even on the monthly-average alternative; window closed, no refund" },
          { id: "fee-drift-002", feeClass: "processing-fee-base-inflation", detection: "deterministic", expectedClaimId: "ORD-1#transaction_fee#L1", expectedRuleId: "NYC-563.3-c-1", expectedVerdict: "violation", targetOrderId: "ORD-1", note: "transaction fee 8% > hard 3% cap, not documented as a pass-through (c-2); no safe harbor for c" },
          { id: "fee-drift-003", feeClass: "bundling", detection: "deterministic", expectedClaimId: "ORD-3#service_and_delivery#L5", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-3", note: "a lumped line under a non-permitted category label — caught by the d-1 category lock" },
          { id: "fee-drift-004", feeClass: "promotion-deduction-mischaracterization", detection: "deterministic", expectedClaimId: "ORD-4#promotion_deduction#L7", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-4", note: "a charge dressed as a 'promotion deduction' is not a permitted fee category — d-1" },
          { id: "fee-drift-005", feeClass: "misclassification", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#enhanced-without-basic`, expectedRuleId: "NYC-563.3-d-4", expectedVerdict: "violation", targetOrderId: "ORD-2", note: "enhanced service fee charged with no basic service fee in the statement — d-4 gating clause" },
          { id: "fee-drift-006", feeClass: "bundling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "a within-cap line under a LEGAL category that actually bundles service + processing — unbundling needs the F1b line-item classifier; the deterministic spine sees only a compliant transaction fee" },
          { id: "fee-drift-007", feeClass: "relabeling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "an enhanced fee relabeled from delivery across periods; pure cross-month relabeling needs multi-month data + fee-change-notice records (g-1-iv is non-statement-checkable) — deferred" },
        ],
      },
      "statement.cured.json": {
        entries: [
          { id: "fee-cure-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "cured-by-refund", targetOrderId: "ORD-C1,ORD-C2", note: "delivery over-cap fully refunded within the §20-563.3(e) 30-day window — not a violation" },
        ],
      },
      "statement.conditional.json": {
        entries: [
          { id: "fee-cond-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "conditional-pending-refund-window", targetOrderId: "ORD-K1,ORD-K2", note: "delivery over-cap evaluated while the 30-day window is still open — not yet a violation" },
        ],
      },
    },
  };
}

/** Golden reports for the corpus (byte-frozen by the freeze-integrity eval). */
export function buildCorpusReports(): Readonly<Record<string, FeeAuditReport>> {
  return {
    "statement.faithful.json": auditStatement(buildFaithfulStatement()),
    "statement.drifted.json": auditStatement(buildDriftedStatement()),
    "statement.cured.json": auditStatement(buildCuredStatement()),
    "statement.conditional.json": auditStatement(buildConditionalStatement()),
  };
}

/** Re-exported for the fixture generator's report headers. */
export { FEES_SPEC_VERSION };

exec
/bin/zsh -lc "sed -n '1,320p' lib/packs/fees/classifier.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
/**
 * Fee line-item CLASSIFIER seam — F1b (plan §5 F1, C8; §7 fee-line classes).
 *
 * The declared-vs-TRUE seam documented in `statement.ts` gets its classifier here:
 * given a statement line's FACE (free-text label + declared category + amounts +
 * statement context), predict the line's TRUE category. The deterministic F1a spine
 * audits categories AS-DECLARED; this seam is what would let it reason about what a
 * line ACTUALLY is when the platform mislabels it.
 *
 * ── HONESTY / ANTI-THEATER (AM-7 precedent, C8) ───────────────────────────────
 * An LLM classifier EARNS its "calibrated" label ONLY by beating the deterministic
 * baseline ({@link DeterministicBaselineClassifier}) on HELD-OUT gold, on the
 * owner-gated live run. Until then the LLM label DEFERS:
 *   - the offline {@link MockOracleClassifier} CANNOT earn it — it reads the answer
 *     and is a WIRING STUB only (it proves the seam surfaces a relabeling, never
 *     that any model can);
 *   - the live lane ({@link LIVE_CLASSIFIER_DESIGN}) is WIRED as of the owner GO
 *     (2026-07-05, decision-log) — but it lives in `lib/agents/fee-classifier.ts`,
 *     env-gated, and is NEVER imported by this pack: THIS module and everything the
 *     deterministic audit reaches stay zero-network (a test proves it). Wired ≠
 *     calibrated — the label is decided only by the pre-registered held-out run
 *     (`docs/fee-classifier-calibration-status.md`).
 * No file in THIS pack calls a model or the network. The gold set is SIMULATED.
 *
 * Plain: the piece that reads what a fee REALLY is when the bill mislabels it.
 * The measured floor (dumb keyword rules) lives here; the real AI version is now
 * plugged in — in a separate, owner-gated module that this rulebook never touches —
 * and it isn't allowed to claim it's good until it out-scores the floor on held-out
 * examples in the owner-approved live run.
 */
import type { FeeLineClass } from "./index.ts";
import {
  isLegalFeeCategory,
  type DeclaredCategory,
  type LegalFeeCategory,
  type StatementLine,
} from "./statement.ts";

/**
 * The classifier's TRUE-category label vocabulary. Either one of the four legally
 * permitted categories (§20-563.3(d)) or the catch-all `not-a-permitted-fee` — a
 * line whose true nature is no permitted category at all (a bundled lump, a
 * promotion deduction, an invented charge).
 */
export type TrueCategoryLabel = LegalFeeCategory | "not-a-permitted-fee";

/** The catch-all label — a line that is truly no permitted fee category. */
export const NOT_A_PERMITTED_FEE = "not-a-permitted-fee" as const;

/** Ordered label vocabulary — runtime export so evals/metrics can enumerate per-category. */
export const TRUE_CATEGORY_LABELS: readonly TrueCategoryLabel[] = [
  "delivery_fee",
  "basic_service_fee",
  "transaction_fee",
  "enhanced_service_fee",
  NOT_A_PERMITTED_FEE,
] as const;

export function isTrueCategoryLabel(v: string): v is TrueCategoryLabel {
  return (TRUE_CATEGORY_LABELS as readonly string[]).includes(v);
}

/**
 * How each of the six plan §7 fee-line drift classes MAPS onto the true-category
 * vocabulary (documented so the gold-set labels are internally consistent). This is
 * the drift class the item EXERCISES vs. the true category it should be RELABELED to:
 *
 *  - `over-cap`                → true == the DECLARED legal category (the drift is the
 *                                AMOUNT, not the category — the classifier confirms it).
 *  - `misclassification`      → true is a DIFFERENT legal category than declared, or
 *                                `not-a-permitted-fee` (e.g. a marketing charge booked
 *                                as delivery).
 *  - `relabeling`             → true is a different legal category than the declared
 *                                legal category (an enhanced fee dressed as delivery).
 *  - `bundling`               → `not-a-permitted-fee` (a single line lumping >1 charge
 *                                is not any one permitted fee).
 *  - `promotion-deduction-mischaracterization` → `not-a-permitted-fee` (a promo
 *                                deduction is not a permitted fee category).
 *  - `processing-fee-base-inflation` → `transaction_fee` (it IS a processing fee;
 *                                the drift is the inflated base, not the category).
 *
 * NOTE: this is a documentation map for the gold set's rationale, NOT a shortcut the
 * classifier is allowed to use — the classifier never sees the §7 class or the
 * answer key (see {@link ClassifierInput}).
 */
export const SEVEN_CLASS_TRUE_CATEGORY_NOTE: Readonly<Record<FeeLineClass, string>> = {
  "over-cap": "true == declared legal category (amount drift, not category)",
  misclassification: "true is a different legal category, or not-a-permitted-fee",
  relabeling: "true is a different legal category than the declared legal category",
  bundling: "not-a-permitted-fee (a lumped line is no single permitted fee)",
  "promotion-deduction-mischaracterization": "not-a-permitted-fee",
  "processing-fee-base-inflation": "transaction_fee (a processing fee, base inflated)",
};

/**
 * The TYPED PROMPT-INPUT CONTRACT — everything a classifier (deterministic, mock, or
 * the designed live one) MAY see about a line. It is deliberately a SUBSET of the
 * statement line: the FACE of the charge plus benign statement context.
 *
 * NO GROUND-TRUTH LEAKAGE (C8): this shape carries NO `trueCategory`, NO answer-key
 * reference, and nothing derived from them. A live classifier prompt is built ONLY
 * from these fields; the answer key never enters the classifier's context.
 */
export interface ClassifierInput {
  /** The platform's free-text line label as printed on the statement. */
  readonly label: string;
  /** What the platform CLAIMS the line is (legal category OR arbitrary label). */
  readonly declaredCategory: DeclaredCategory;
  /** The charged amount, integer cents. */
  readonly amountCents: number;
  /** The order's purchase price, integer cents (the cap base). */
  readonly orderPurchasePriceCents: number;
  /** True iff this line is a refund/credit. */
  readonly isRefund: boolean;
  /** True iff the platform documents this line as an exact processor pass-through. */
  readonly passthroughDocumented: boolean;
  /** Benign statement context: the set of DECLARED categories present on the same statement. */
  readonly siblingDeclaredCategories: readonly DeclaredCategory[];
}

/** Build the leak-free {@link ClassifierInput} for one line within its statement context. */
export function toClassifierInput(
  line: StatementLine,
  siblingDeclaredCategories: readonly DeclaredCategory[],
): ClassifierInput {
  return {
    label: line.label,
    declaredCategory: line.declaredCategory,
    amountCents: line.amountCents,
    orderPurchasePriceCents: line.orderPurchasePriceCents,
    isRefund: line.isRefund,
    passthroughDocumented: line.passthroughDocumented,
    siblingDeclaredCategories,
  };
}

/** A classifier's prediction for one line. */
export interface ClassifierPrediction {
  /** The predicted TRUE category. */
  readonly predicted: TrueCategoryLabel;
  /** A short, human-readable reason (for the advisory finding's evidence + audit trail). */
  readonly rationale: string;
}

/**
 * The line-item classifier SEAM (DI, like the legacy semantic/domain judges). Every
 * implementation is a pure function object — the deterministic baseline and the mock
 * wiring stub satisfy this one interface, so `auditWithClassification` is agnostic
 * to which is injected. (The wired live lane, `lib/agents/fee-classifier.ts`, is
 * async/env-gated and is scored directly on gold in its calibration harness — it is
 * not one of this sync seam's implementations.)
 */
export interface LineItemClassifier {
  /** A stable name for provenance / reporting (e.g. "deterministic-baseline"). */
  readonly name: string;
  /**
   * Whether this classifier's label is EARNED. `false` for the baseline (it IS the
   * floor, not a beat-the-floor result) and for the mock (it cheats). Only an
   * owner-gated live run that beats the baseline on held-out gold could flip this —
   * and the 2026-07-05 armed run DEFERRED (missed one pre-registered floor; see
   * docs/fee-classifier-calibration-status.md), so it stays `false` everywhere.
   */
  readonly earnsLabel: false;
  classify(input: ClassifierInput): ClassifierPrediction;
}

// ── DETERMINISTIC BASELINE — the anti-theater floor (AM-7) ─────────────────────

/**
 * One keyword rule: if the lowercased label matches, predict `to`. Rules are tried
 * in array order (first match wins), so more specific patterns precede general ones.
 */
interface KeywordRule {
  readonly test: RegExp;
  readonly to: TrueCategoryLabel;
  readonly why: string;
}

/**
 * The baseline's label-text rules. Deliberately SIMPLE and imperfect — this is the
 * FLOOR the LLM classifier must beat on held-out gold to earn its label, not a
 * best-effort classifier. Order matters (first match wins).
 */
const BASELINE_RULES: readonly KeywordRule[] = [
  { test: /\b(promo|promotion|adjustment|discount recoup|misc|other|bundle|bundled|combined|&)\b/i, to: NOT_A_PERMITTED_FEE, why: "label reads as a promo/adjustment/bundled/misc line — no single permitted fee" },
  { test: /\b(transaction|processing|card|payment|swipe|interchange)\b/i, to: "transaction_fee", why: "label names card/payment processing" },
  { test: /\b(enhanced|premium|marketing|boost|sponsor|featured|promoted listing|advertis)\b/i, to: "enhanced_service_fee", why: "label reads as an optional/marketing extra (enhanced tier)" },
  { test: /\b(basic service|basic|listing|search|discoverab)\b/i, to: "basic_service_fee", why: "label reads as a basic listing/search service fee" },
  { test: /\b(delivery|courier|dispatch|last[- ]mile|drop[- ]?off)\b/i, to: "delivery_fee", why: "label names delivery/courier" },
];

/**
 * The deterministic keyword/heuristic baseline classifier. Label-text rules first;
 * if none match, fall back to the DECLARED category when it is itself a legal
 * category, else `not-a-permitted-fee`. Pure, $0, no network — this is the measured
 * floor F1b's baseline eval scores.
 */
export const DeterministicBaselineClassifier: LineItemClassifier = {
  name: "deterministic-baseline",
  earnsLabel: false,
  classify(input: ClassifierInput): ClassifierPrediction {
    const label = input.label.toLowerCase();
    for (const rule of BASELINE_RULES) {
      if (rule.test.test(label)) {
        return { predicted: rule.to, rationale: `baseline: ${rule.why}` };
      }
    }
    if (isLegalFeeCategory(input.declaredCategory)) {
      return {
        predicted: input.declaredCategory,
        rationale: "baseline: no label keyword matched; fell back to the (legal) declared category",
      };
    }
    return {
      predicted: NOT_A_PERMITTED_FEE,
      rationale: "baseline: no label keyword matched and the declared category is not a permitted one",
    };
  },
};

// ── MOCK ORACLE — a WIRING STUB only (does NOT earn the label) ──────────────────

/**
 * A mock classifier backed by an ANSWER MAP. It reads the intended true category and
 * returns it — so it is an ORACLE, not a model: it exists ONLY to prove the audit
 * seam CAN surface a relabeling (deliverable 7's wiring proof). It CANNOT earn the
 * LLM label (AM-7): reading the answer is not beating the baseline. Tests use it to
 * exercise the plumbing; the coverage eval still reports the deferred class deferred.
 *
 * @param answers map from a line key (`orderId#declaredCategory`) to its true label.
 */
export function makeMockOracleClassifier(
  answers: ReadonlyMap<string, TrueCategoryLabel>,
  keyOf: (input: ClassifierInput) => string,
): LineItemClassifier {
  return {
    name: "mock-oracle-wiring-stub",
    earnsLabel: false,
    classify(input: ClassifierInput): ClassifierPrediction {
      const answer = answers.get(keyOf(input));
      if (answer !== undefined) {
        return { predicted: answer, rationale: "mock-oracle: read the answer key (WIRING STUB — not an earned prediction)" };
      }
      // Unknown line → defer to the declared category (never invent a relabeling).
      const fallback: TrueCategoryLabel = isLegalFeeCategory(input.declaredCategory)
        ? input.declaredCategory
        : NOT_A_PERMITTED_FEE;
      return { predicted: fallback, rationale: "mock-oracle: no answer entry; echoed the declared category" };
    },
  };
}

// ── LIVE LANE — the design contract (wired 2026-07-05 in lib/agents/, not here) ─

/**
 * The DESIGN of the live LLM classifier (deliverable 6a) — the machine-readable
 * spine of `docs/plan-f1b-classifier.md`. This const itself stays data-only (NO
 * provider call, NO network import in this module); the wiring that implements it
 * is `lib/agents/fee-classifier.ts` (owner GO 2026-07-05, decision-log), which
 * imports this contract — never the reverse.
 */
export const LIVE_CLASSIFIER_DESIGN = {
  /** Model lane: Groq free tier first (plan §5; gpt-oss-120b precedent), cross-family judge. */
  modelLane: "groq-free-tier (gpt-oss-120b class); Gemini stays ≤$5-capped + demo-scoped",
  /** The classifier sees ONLY {@link ClassifierInput} — never the answer key or trueCategory. */
  promptInputContract: "ClassifierInput (label · declaredCategory · amounts · isRefund · passthroughDocumented · siblingDeclaredCategories) — NO ground-truth",
  /** Structured output the provider must return (parsed + validated before use). */
  outputShape: "{ predicted: TrueCategoryLabel, rationale: string }",
  /** Failure/fallback semantics — the FAILED_TO_FALLBACK precedent. */
  fallback: "on parse/schema/timeout failure → FAILED_TO_FALLBACK: defer to the deterministic baseline; NEVER silently invent a label",
  /** The honesty gate. */
  ownerGate: "no live run without the owner's word; no 'calibrated' claim below the pre-registered floor (docs/plan-f1b-classifier.md)",
  /** WIRED 2026-07-05 (owner GO "all four", decision-log): `lib/agents/fee-classifier.ts`
   *  implements this contract, env-gated (groqLiveEnabled). Wired ≠ calibrated. */
  wired: true,
} as const;

exec
/bin/zsh -lc "sed -n '1,340p' evals/packs/fees-classifier.test.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  auditStatement,
  auditWithClassification,
  buildConditionalStatement,
  buildCuredStatement,
  buildDriftedStatement,
  buildFaithfulStatement,
  DeterministicBaselineClassifier,
  LIVE_CLASSIFIER_DESIGN,
  makeMockOracleClassifier,
  NOT_A_PERMITTED_FEE,
  serializeFeeReport,
  toClassifierInput,
  type ClassifierInput,
  type TrueCategoryLabel,
} from "@/lib/packs/fees";
import { MissingEvidenceError } from "@/lib/verifier-core";
import { makeFinding } from "@/lib/verifier-core/guard";

/**
 * F1b classifier seam + advisory-wiring evals (plan §5 F1b, C8; deliverables
 * 2/3/7). Covers:
 *  - the DI seam (baseline / mock-oracle both satisfy LineItemClassifier);
 *  - the deterministic-baseline honesty markers (never earns the label);
 *  - the $0-LLM / zero-network structural proof, EXTENDED to classifier.ts +
 *    classified-audit.ts (the fees-cli import-graph pattern, self-contained here
 *    so the frozen fees-cli.test.ts stays untouched);
 *  - the advisory audit path: the DEFAULT auditStatement path stays BYTE-IDENTICAL
 *    to the frozen F1a goldens; advisory findings carry claim.source "classifier"
 *    + the C2 receipts + the `advisory: true` marker and never affect `base.ok`;
 *  - the WIRING PROOF: the mock oracle surfaces the deferred ORD-5 relabeling +
 *    bundling candidates (deliverable 7) while the deterministic baseline — the
 *    honest floor — does NOT (it cannot resolve them from label text alone).
 */

const root = process.cwd();
const feesDir = join(root, "fixtures", "synthetic-restaurant", "fees");

describe("F1b classifier seam — DI + honesty markers", () => {
  it("the deterministic baseline never claims an earned/calibrated label", () => {
    expect(DeterministicBaselineClassifier.earnsLabel).toBe(false);
    expect(DeterministicBaselineClassifier.name).toBe("deterministic-baseline");
  });

  it("the mock oracle is a WIRING STUB — also never earns the label", () => {
    const mock = makeMockOracleClassifier(new Map(), () => "");
    expect(mock.earnsLabel).toBe(false);
    expect(mock.name).toBe("mock-oracle-wiring-stub");
  });

  it("the live lane is WIRED (owner GO 2026-07-05) — outside this pack, env-gated", () => {
    // Flipped consciously with the wiring slice (was false through F1a/F1b/M2).
    // Wired ≠ calibrated: the label is decided only by the pre-registered held-out
    // run (docs/fee-classifier-calibration-status.md). The import-graph proof below
    // still holds — the pack itself reaches no network module.
    expect(LIVE_CLASSIFIER_DESIGN.wired).toBe(true);
  });

  it("both classifiers satisfy the same LineItemClassifier shape (interchangeable via DI)", () => {
    const input: ClassifierInput = {
      label: "Delivery fee",
      declaredCategory: "delivery_fee",
      amountCents: 300,
      orderPurchasePriceCents: 2000,
      isRefund: false,
      passthroughDocumented: false,
      siblingDeclaredCategories: ["delivery_fee"],
    };
    const mock = makeMockOracleClassifier(new Map<string, TrueCategoryLabel>([["k", "delivery_fee"]]), () => "k");
    for (const clf of [DeterministicBaselineClassifier, mock]) {
      const p = clf.classify(input);
      expect(typeof p.predicted).toBe("string");
      expect(typeof p.rationale).toBe("string");
    }
  });

  it("toClassifierInput carries NO ground-truth field (leak-free contract)", () => {
    const line = {
      orderId: "ORD-X",
      month: "2026-06",
      declaredCategory: "delivery_fee",
      label: "Delivery fee",
      amountCents: 300,
      orderPurchasePriceCents: 2000,
      isRefund: false,
      passthroughDocumented: false,
    };
    const input = toClassifierInput(line, ["delivery_fee"]);
    expect(Object.keys(input).sort()).toEqual(
      [
        "amountCents",
        "declaredCategory",
        "isRefund",
        "label",
        "orderPurchasePriceCents",
        "passthroughDocumented",
        "siblingDeclaredCategories",
      ].sort(),
    );
    // No key here can possibly carry an answer-key/trueCategory value.
    expect("trueCategory" in input).toBe(false);
  });
});

describe("F1b $0-LLM / zero-network structural proof — classifier.ts + classified-audit.ts", () => {
  const banned = [/lib\/agents\//, /@ai-sdk/, /^ai$|\/ai\//, /node:https?/, /undici/, /groq|gemini/i];

  function importsOf(file: string): string[] {
    const text = readFileSync(file, "utf8");
    const specs: string[] = [];
    const re = /(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g;
    for (let m = re.exec(text); m; m = re.exec(text)) specs.push(m[1]);
    return specs;
  }
  function resolve(fromFile: string, spec: string): string | null {
    let base: string | null = null;
    if (spec.startsWith("@/")) base = join(root, spec.slice(2));
    else if (spec.startsWith(".")) base = join(fromFile, "..", spec);
    if (base === null) return null;
    const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.mjs`, `${base}.json`, join(base, "index.ts")];
    return candidates.find((c) => existsSync(c) && /\.(ts|tsx|mjs|json)$/.test(c)) ?? null;
  }

  it("no module reachable from classifier.ts / classified-audit.ts matches a banned pattern (and no bare fetch)", () => {
    const queue = [
      join(root, "lib", "packs", "fees", "classifier.ts"),
      join(root, "lib", "packs", "fees", "classified-audit.ts"),
    ];
    const seen = new Set<string>();
    while (queue.length > 0) {
      const file = queue.pop() as string;
      if (seen.has(file)) continue;
      seen.add(file);
      if (file.endsWith(".json")) continue;
      const text = readFileSync(file, "utf8");
      expect(/(^|[^.\w])fetch\s*\(/.test(text), `bare fetch( reachable in ${file}`).toBe(false);
      for (const spec of importsOf(file)) {
        for (const pattern of banned) {
          expect(pattern.test(spec), `banned import "${spec}" in ${file}`).toBe(false);
        }
        const resolved = resolve(file, spec);
        if (resolved !== null) queue.push(resolved);
      }
    }
    expect(seen.size).toBeGreaterThan(3);
  });
});

describe("F1b advisory audit path — default path stays byte-identical; advisory is a separate, non-gating array", () => {
  it("auditWithClassification's `base` report is EXACTLY auditStatement(statement) — byte-identical", () => {
    const statement = buildDriftedStatement();
    const direct = auditStatement(statement);
    const { base } = auditWithClassification(statement, DeterministicBaselineClassifier);
    expect(serializeFeeReport(base)).toBe(serializeFeeReport(direct));
  });

  it("the F1a frozen golden reports are UNCHANGED by this slice (re-assertion, deliverable 7)", () => {
    const cases: readonly [string, () => ReturnType<typeof buildFaithfulStatement>][] = [
      ["expected-report.faithful.json", buildFaithfulStatement],
      ["expected-report.drifted.json", buildDriftedStatement],
      ["expected-report.cured.json", buildCuredStatement],
      ["expected-report.conditional.json", buildConditionalStatement],
    ];
    for (const [golden, build] of cases) {
      const goldenText = readFileSync(join(feesDir, golden), "utf8");
      expect(serializeFeeReport(auditStatement(build())), golden).toBe(goldenText);
    }
  });

  it("an advisory finding carries claim.source 'classifier' + all four C2 receipts + the advisory marker", () => {
    const statement = buildDriftedStatement();
    const { advisoryFindings } = auditWithClassification(statement, DeterministicBaselineClassifier);
    expect(advisoryFindings.length).toBeGreaterThan(0);
    for (const f of advisoryFindings) {
      expect(f.claim.source).toBe("classifier");
      expect(f.advisory).toBe(true);
      expect(f.claim.id.length).toBeGreaterThan(0);
      expect(f.referenceRowId.length).toBeGreaterThan(0);
      expect(f.ruleId.length).toBeGreaterThan(0);
      expect(f.severity).toBe("info");
      expect(f.professionalLine.length).toBeGreaterThan(0);
      expect(f.plainLine.length).toBeGreaterThan(0);
    }
  });

  it("a claim missing a C2 receipt still throws the core guard (the advisory path reuses the SAME guard, not a bypass)", () => {
    expect(() =>
      makeFinding({
        claim: { id: "x", source: "classifier", field: "", value: "y" },
        referenceRowId: "classifier:test",
        ruleId: "F1B-CLASSIFIER-ADVISORY(test)",
        severity: "info",
      }),
    ).toThrow(MissingEvidenceError);
  });

  it("advisory findings NEVER change base.ok / base.findings / base.verdictTally", () => {
    const statement = buildDriftedStatement();
    const direct = auditStatement(statement);
    const { base } = auditWithClassification(statement, DeterministicBaselineClassifier);
    expect(base.ok).toBe(direct.ok);
    expect(base.findings.length).toBe(direct.findings.length);
    expect(base.verdictTally).toEqual(direct.verdictTally);
  });

  it("two same-order, same-category candidate lines yield DISTINCT advisory claim ids (C2 traceability; M2 finding #4)", () => {
    const statement = buildDriftedStatement();
    const dupLine = { ...statement.lines[0], label: "Marketing push A", declaredCategory: "marketing_fee" };
    const dupLine2 = { ...dupLine, label: "Marketing push B" };
    const withDups = { meta: statement.meta, lines: [dupLine, dupLine2] };
    // A test-local classifier that flags every line — both duplicates become candidates.
    const flagAll = {
      name: "test-flag-all",
      earnsLabel: false as const,
      classify: () => ({ predicted: NOT_A_PERMITTED_FEE, rationale: "test: always a candidate" }),
    };
    const { advisoryFindings } = auditWithClassification(withDups, flagAll);
    expect(advisoryFindings).toHaveLength(2);
    const ids = advisoryFindings.map((f) => f.claim.id);
    expect(new Set(ids).size).toBe(2); // RED without the statement-position tag
  });
});

describe("F1b wiring proof (deliverable 7) — the mock oracle surfaces the deferred ORD-5 candidates; the honest baseline does not", () => {
  // ORD-5 carries the two DEFERRED-TO-CLASSIFIER answer-key entries (fee-drift-006
  // bundling, fee-drift-007 relabeling) — see fee-answer-key.json / generate.ts.
  const ord5Answers = new Map<string, TrueCategoryLabel>([
    ["ORD-5#transaction_fee", NOT_A_PERMITTED_FEE], // fee-drift-006: bundles service+processing
    ["ORD-5#enhanced_service_fee", "delivery_fee"], // fee-drift-007: relabeled from delivery
  ]);
  const keyOf = (input: ClassifierInput): string => {
    // Reconstructed from the orderId carried in the advisory finding's claim id
    // shape; here we key directly off the label+declaredCategory pair for the two
    // known ORD-5 lines (a test-local oracle key, not a production convention).
    if (input.label.includes("service + processing bundle")) return "ORD-5#transaction_fee";
    if (input.label.includes("formerly delivery")) return "ORD-5#enhanced_service_fee";
    return "no-match";
  };

  it("the MOCK ORACLE surfaces BOTH deferred ORD-5 candidates (proves the seam CAN carry a relabeling)", () => {
    const mock = makeMockOracleClassifier(ord5Answers, keyOf);
    const { advisoryFindings } = auditWithClassification(buildDriftedStatement(), mock);
    const ord5 = advisoryFindings.filter((f) => f.orderId === "ORD-5");
    expect(ord5.length).toBe(2);
    const byDeclared = new Map(ord5.map((f) => [f.declaredCategory, f.predictedTrueCategory]));
    expect(byDeclared.get("transaction_fee")).toBe(NOT_A_PERMITTED_FEE);
    expect(byDeclared.get("enhanced_service_fee")).toBe("delivery_fee");
  });

  it("the DETERMINISTIC BASELINE does NOT resolve the ORD-5 relabeling (honest floor — no overclaim)", () => {
    const { advisoryFindings } = auditWithClassification(buildDriftedStatement(), DeterministicBaselineClassifier);
    const ord5Enhanced = advisoryFindings.find(
      (f) => f.orderId === "ORD-5" && f.declaredCategory === "enhanced_service_fee",
    );
    // "Marketing (formerly delivery)" reads as enhanced/marketing to the keyword
    // rules — the baseline agrees with the (wrong) declared category, so it emits
    // NO advisory candidate here. This is the measured gap the LLM classifier must
    // beat, not a floor assumed to already catch it.
    expect(ord5Enhanced).toBeUndefined();
  });

  it("neither classifier's ORD-5 output is presented as a caught violation (advisory only, severity info)", () => {
    const mock = makeMockOracleClassifier(ord5Answers, keyOf);
    const { advisoryFindings, base } = auditWithClassification(buildDriftedStatement(), mock);
    const ord5 = advisoryFindings.filter((f) => f.orderId === "ORD-5");
    for (const f of ord5) {
      expect(f.severity).toBe("info");
      expect(f.advisory).toBe(true);
    }
    // The base (deterministic) report's ok/findings are unaffected by the mock's candidates.
    expect(base.findings.every((finding) => !finding.claim.id.includes("ORD-5"))).toBe(true);
  });
});

exec
/bin/zsh -lc "rg -n \"claim:\\s*\\{\\s*id|id:\\s*"'`'"\\"'$'"\\{|expectedClaimId|split\\(\\s*[\\\"']#[\\\"']\\s*\\)|\\.split\\(\\s*[\\\"']#[\\\"']\\s*\\)|lineIndex|get\\(line\\)|makeLineTagger|claimIdPart\" lib/packs/fees evals/packs evals/gold fixtures/synthetic-restaurant/fees bin scripts-ts components app lib | head -n 300" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 exited 1 in 0ms:
zsh:1: unmatched "

exec
/bin/zsh -lc 'find fixtures/synthetic-restaurant/fees evals/gold -type f -maxdepth 3 | sort' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
evals/gold/fee-baseline-measurement.test.ts
evals/gold/fee-classifier-calibration.live.test.ts
evals/gold/fee-classifier-calibration.lock.test.ts
evals/gold/fee-lines-gold-composition.test.ts
evals/gold/fee-lines-gold.ts
evals/gold/metrics.test.ts
evals/gold/metrics.ts
fixtures/synthetic-restaurant/fees/README.md
fixtures/synthetic-restaurant/fees/expected-report.conditional.json
fixtures/synthetic-restaurant/fees/expected-report.cured.json
fixtures/synthetic-restaurant/fees/expected-report.drifted.json
fixtures/synthetic-restaurant/fees/expected-report.faithful.json
fixtures/synthetic-restaurant/fees/fee-answer-key.json
fixtures/synthetic-restaurant/fees/statement.conditional.json
fixtures/synthetic-restaurant/fees/statement.cured.json
fixtures/synthetic-restaurant/fees/statement.drifted.json
fixtures/synthetic-restaurant/fees/statement.faithful.json

exec
/bin/zsh -lc 'rg -n "#[''^'"\\n]*%|%["'^'"\\n]*#|%25|%23|orderId|declaredCategory|expectedClaimId|claimId|\\\"id\\\"\" fixtures/synthetic-restaurant/fees evals/gold lib/packs/fees/generate.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
lib/packs/fees/generate.ts:52:  readonly expectedClaimId: string | null;
lib/packs/fees/generate.ts:87:  orderId: string,
lib/packs/fees/generate.ts:88:  declaredCategory: string,
lib/packs/fees/generate.ts:95:    orderId,
lib/packs/fees/generate.ts:97:    declaredCategory,
lib/packs/fees/generate.ts:184:          { id: "fee-drift-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "violation", targetOrderId: "ORD-1..ORD-4", note: "delivery fees average 16% of monthly purchases — over the 15% cap even on the monthly-average alternative; window closed, no refund" },
lib/packs/fees/generate.ts:185:          { id: "fee-drift-002", feeClass: "processing-fee-base-inflation", detection: "deterministic", expectedClaimId: "ORD-1#transaction_fee#L1", expectedRuleId: "NYC-563.3-c-1", expectedVerdict: "violation", targetOrderId: "ORD-1", note: "transaction fee 8% > hard 3% cap, not documented as a pass-through (c-2); no safe harbor for c" },
lib/packs/fees/generate.ts:186:          { id: "fee-drift-003", feeClass: "bundling", detection: "deterministic", expectedClaimId: "ORD-3#service_and_delivery#L5", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-3", note: "a lumped line under a non-permitted category label — caught by the d-1 category lock" },
lib/packs/fees/generate.ts:187:          { id: "fee-drift-004", feeClass: "promotion-deduction-mischaracterization", detection: "deterministic", expectedClaimId: "ORD-4#promotion_deduction#L7", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-4", note: "a charge dressed as a 'promotion deduction' is not a permitted fee category — d-1" },
lib/packs/fees/generate.ts:188:          { id: "fee-drift-005", feeClass: "misclassification", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#enhanced-without-basic`, expectedRuleId: "NYC-563.3-d-4", expectedVerdict: "violation", targetOrderId: "ORD-2", note: "enhanced service fee charged with no basic service fee in the statement — d-4 gating clause" },
lib/packs/fees/generate.ts:189:          { id: "fee-drift-006", feeClass: "bundling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "a within-cap line under a LEGAL category that actually bundles service + processing — unbundling needs the F1b line-item classifier; the deterministic spine sees only a compliant transaction fee" },
lib/packs/fees/generate.ts:190:          { id: "fee-drift-007", feeClass: "relabeling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "an enhanced fee relabeled from delivery across periods; pure cross-month relabeling needs multi-month data + fee-change-notice records (g-1-iv is non-statement-checkable) — deferred" },
lib/packs/fees/generate.ts:195:          { id: "fee-cure-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "cured-by-refund", targetOrderId: "ORD-C1,ORD-C2", note: "delivery over-cap fully refunded within the §20-563.3(e) 30-day window — not a violation" },
lib/packs/fees/generate.ts:200:          { id: "fee-cond-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "conditional-pending-refund-window", targetOrderId: "ORD-K1,ORD-K2", note: "delivery over-cap evaluated while the 30-day window is still open — not yet a violation" },
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:9:        "id": "ORD-3#service_and_delivery#L5",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:11:        "field": "declaredCategory",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:26:        "id": "2026-06#enhanced-without-basic",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:28:        "field": "declaredCategory",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:43:        "id": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:66:        "id": "ORD-1#transaction_fee#L1",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:85:        "id": "ORD-4#promotion_deduction#L7",
fixtures/synthetic-restaurant/fees/expected-report.drifted.json:87:        "field": "declaredCategory",
fixtures/synthetic-restaurant/fees/statement.faithful.json:17:      "orderId": "ORD-1",
fixtures/synthetic-restaurant/fees/statement.faithful.json:19:      "declaredCategory": "delivery_fee",
fixtures/synthetic-restaurant/fees/statement.faithful.json:27:      "orderId": "ORD-1",
fixtures/synthetic-restaurant/fees/statement.faithful.json:29:      "declaredCategory": "basic_service_fee",
fixtures/synthetic-restaurant/fees/statement.faithful.json:37:      "orderId": "ORD-1",
fixtures/synthetic-restaurant/fees/statement.faithful.json:39:      "declaredCategory": "transaction_fee",
fixtures/synthetic-restaurant/fees/statement.faithful.json:47:      "orderId": "ORD-1",
fixtures/synthetic-restaurant/fees/statement.faithful.json:49:      "declaredCategory": "enhanced_service_fee",
fixtures/synthetic-restaurant/fees/statement.faithful.json:57:      "orderId": "ORD-2",
fixtures/synthetic-restaurant/fees/statement.faithful.json:59:      "declaredCategory": "delivery_fee",
fixtures/synthetic-restaurant/fees/statement.faithful.json:67:      "orderId": "ORD-2",
fixtures/synthetic-restaurant/fees/statement.faithful.json:69:      "declaredCategory": "basic_service_fee",
evals/gold/fee-lines-gold.ts:60:    declaredCategory: DeclaredCategory;
evals/gold/fee-lines-gold.ts:74:      declaredCategory: opts.declaredCategory,
evals/gold/fee-lines-gold.ts:91:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:98:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:105:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:112:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:119:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:126:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:136:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:143:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:150:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:157:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:164:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:171:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:184:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:191:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:198:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:205:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:212:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:219:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:229:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:236:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:243:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:250:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:257:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:264:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:274:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:281:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:288:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:295:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:302:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:309:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:319:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:326:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:333:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:340:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:347:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:354:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:364:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:371:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:378:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:385:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:392:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:399:    declaredCategory: "delivery_fee",
fixtures/synthetic-restaurant/fees/statement.conditional.json:17:      "orderId": "ORD-K1",
fixtures/synthetic-restaurant/fees/statement.conditional.json:19:      "declaredCategory": "delivery_fee",
fixtures/synthetic-restaurant/fees/statement.conditional.json:27:      "orderId": "ORD-K2",
fixtures/synthetic-restaurant/fees/statement.conditional.json:29:      "declaredCategory": "delivery_fee",
fixtures/synthetic-restaurant/fees/expected-report.cured.json:9:        "id": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/expected-report.conditional.json:9:        "id": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/statement.drifted.json:17:      "orderId": "ORD-1",
fixtures/synthetic-restaurant/fees/statement.drifted.json:19:      "declaredCategory": "delivery_fee",
fixtures/synthetic-restaurant/fees/statement.drifted.json:27:      "orderId": "ORD-1",
fixtures/synthetic-restaurant/fees/statement.drifted.json:29:      "declaredCategory": "transaction_fee",
fixtures/synthetic-restaurant/fees/statement.drifted.json:37:      "orderId": "ORD-2",
fixtures/synthetic-restaurant/fees/statement.drifted.json:39:      "declaredCategory": "delivery_fee",
fixtures/synthetic-restaurant/fees/statement.drifted.json:47:      "orderId": "ORD-2",
fixtures/synthetic-restaurant/fees/statement.drifted.json:49:      "declaredCategory": "enhanced_service_fee",
fixtures/synthetic-restaurant/fees/statement.drifted.json:57:      "orderId": "ORD-3",
fixtures/synthetic-restaurant/fees/statement.drifted.json:59:      "declaredCategory": "delivery_fee",
fixtures/synthetic-restaurant/fees/statement.drifted.json:67:      "orderId": "ORD-3",
fixtures/synthetic-restaurant/fees/statement.drifted.json:69:      "declaredCategory": "service_and_delivery",
fixtures/synthetic-restaurant/fees/statement.drifted.json:77:      "orderId": "ORD-4",
fixtures/synthetic-restaurant/fees/statement.drifted.json:79:      "declaredCategory": "delivery_fee",
fixtures/synthetic-restaurant/fees/statement.drifted.json:87:      "orderId": "ORD-4",
fixtures/synthetic-restaurant/fees/statement.drifted.json:89:      "declaredCategory": "promotion_deduction",
fixtures/synthetic-restaurant/fees/statement.drifted.json:97:      "orderId": "ORD-5",
fixtures/synthetic-restaurant/fees/statement.drifted.json:99:      "declaredCategory": "transaction_fee",
fixtures/synthetic-restaurant/fees/statement.drifted.json:107:      "orderId": "ORD-5",
fixtures/synthetic-restaurant/fees/statement.drifted.json:109:      "declaredCategory": "enhanced_service_fee",
evals/gold/fee-lines-gold-composition.test.ts:79:  it("every item's declaredCategory + label + amounts are non-empty and every rationale is non-empty", () => {
evals/gold/fee-lines-gold-composition.test.ts:83:      expect(nonEmpty(g.input.declaredCategory), `${g.id}: empty declaredCategory`).toBe(true);
fixtures/synthetic-restaurant/fees/fee-answer-key.json:16:          "id": "fee-drift-001",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:19:          "expectedClaimId": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:26:          "id": "fee-drift-002",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:29:          "expectedClaimId": "ORD-1#transaction_fee#L1",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:36:          "id": "fee-drift-003",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:39:          "expectedClaimId": "ORD-3#service_and_delivery#L5",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:46:          "id": "fee-drift-004",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:49:          "expectedClaimId": "ORD-4#promotion_deduction#L7",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:56:          "id": "fee-drift-005",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:59:          "expectedClaimId": "2026-06#enhanced-without-basic",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:66:          "id": "fee-drift-006",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:69:          "expectedClaimId": null,
fixtures/synthetic-restaurant/fees/fee-answer-key.json:76:          "id": "fee-drift-007",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:79:          "expectedClaimId": null,
fixtures/synthetic-restaurant/fees/fee-answer-key.json:90:          "id": "fee-cure-001",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:93:          "expectedClaimId": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:104:          "id": "fee-cond-001",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:107:          "expectedClaimId": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/statement.cured.json:17:      "orderId": "ORD-C1",
fixtures/synthetic-restaurant/fees/statement.cured.json:19:      "declaredCategory": "delivery_fee",
fixtures/synthetic-restaurant/fees/statement.cured.json:27:      "orderId": "ORD-C2",
fixtures/synthetic-restaurant/fees/statement.cured.json:29:      "declaredCategory": "delivery_fee",
fixtures/synthetic-restaurant/fees/statement.cured.json:37:      "orderId": "ORD-C1",
fixtures/synthetic-restaurant/fees/statement.cured.json:39:      "declaredCategory": "delivery_fee",

exec
/bin/zsh -lc "rg -n \"parse.*Statement|MonthlyStatement|statement\\.lines|safeParse|zod|schema|YYYY-MM|month\" lib/packs/fees bin scripts-ts evals/packs/fees-parser.test.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
lib/packs/fees/classifier.ts:270:  fallback: "on parse/schema/timeout failure → FAILED_TO_FALLBACK: defer to the deterministic baseline; NEVER silently invent a label",
lib/packs/fees/audit.ts:5: * {@link MonthlyStatement} and assembles an evidence-cited {@link FeeAuditReport}.
lib/packs/fees/audit.ts:16: *    within the per-order cap OR the calendar-month average is within cap. Only
lib/packs/fees/audit.ts:17: *    when the monthly average ALSO fails is the category over cap — so a per-order
lib/packs/fees/audit.ts:49:  monthlyAverageExceeded,
lib/packs/fees/audit.ts:57:  type MonthlyStatement,
lib/packs/fees/audit.ts:73:  readonly monthlyRuleId?: string; // absent for transaction (c) — no averaging
lib/packs/fees/audit.ts:79:  delivery_fee: { perOrderRuleId: "NYC-563.3-a-1", monthlyRuleId: "NYC-563.3-a-2", capPct: 15, hasSafeHarbor: true },
lib/packs/fees/audit.ts:80:  basic_service_fee: { perOrderRuleId: "NYC-563.3-b-1", monthlyRuleId: "NYC-563.3-b-2", capPct: 5, hasSafeHarbor: true },
lib/packs/fees/audit.ts:82:  enhanced_service_fee: { perOrderRuleId: "NYC-563.3-d-2", monthlyRuleId: "NYC-563.3-d-3", capPct: 20, hasSafeHarbor: true },
lib/packs/fees/audit.ts:89:/** The §20-563.3(e) window close: 30 days after the month's final day (pure date math, no clock). */
lib/packs/fees/audit.ts:90:function refundWindowClose(month: string): string {
lib/packs/fees/audit.ts:91:  const [y, m] = month.split("-").map(Number);
lib/packs/fees/audit.ts:97: * Distinct-order purchase sum for the month (dedupe by orderId — no double count).
lib/packs/fees/audit.ts:99: * DOCUMENTED LIMITATION (elevation, 2026-07-04): the statutory monthly-average
lib/packs/fees/audit.ts:100: * base is the purchase price of ALL online orders in the calendar month, but a
lib/packs/fees/audit.ts:104: * against the platform, which is why every monthly-average finding is already
lib/packs/fees/audit.ts:136: * Audit one parsed monthly statement. Pure in (statement); no clock, no network,
lib/packs/fees/audit.ts:151: * The map is OBJECT-IDENTITY keyed, so a line not a member of `statement.lines`
lib/packs/fees/audit.ts:155:export function makeLineTagger(statement: MonthlyStatement): (l: StatementLine) => string {
lib/packs/fees/audit.ts:156:  const index = new Map<StatementLine, number>(statement.lines.map((l, i) => [l, i]));
lib/packs/fees/audit.ts:160:      throw new Error(`fees audit: line "${l.label}" (order ${l.orderId}) is not a member of statement.lines — the statement-position tag is object-identity based`);
lib/packs/fees/audit.ts:166:export function auditStatement(statement: MonthlyStatement): FeeAuditReport {
lib/packs/fees/audit.ts:168:  const month = statement.meta.month;
lib/packs/fees/audit.ts:170:  const windowClose = refundWindowClose(month);
lib/packs/fees/audit.ts:171:  const nonRefund = statement.lines.filter((l) => !l.isRefund);
lib/packs/fees/audit.ts:198:        claim: { id: `${month}#enhanced-without-basic`, source: "fee-statement", field: "declaredCategory", value: "enhanced_service_fee" },
lib/packs/fees/audit.ts:210:  // ── per-category cap checks (a/b/d monthly-average ∨ per-order; c per-order) ──
lib/packs/fees/audit.ts:260:    // a/b/d: category is over cap only if the monthly average ALSO fails.
lib/packs/fees/audit.ts:262:    if (!monthlyAverageExceeded(sumFees, sumPurchaseAll, cfg.capPct)) continue; // averaging alternative met
lib/packs/fees/audit.ts:264:    const monthly = FEE_RULE_BY_ID.get(cfg.monthlyRuleId!)!;
lib/packs/fees/audit.ts:265:    const verdict = e1Verdict(category, cfg.capPct, sumFees, sumPurchaseAll, month, asOf, windowClose, statement.lines);
lib/packs/fees/audit.ts:268:        claim: { id: `${month}#${category}`, source: "fee-statement", field: "monthlyAverage", value: { sumFeesCents: sumFees, sumPurchasePriceCents: sumPurchaseAll, capPct: cfg.capPct } },
lib/packs/fees/audit.ts:269:        referenceRowId: monthly.sourceClause,
lib/packs/fees/audit.ts:270:        ruleId: monthly.id,
lib/packs/fees/audit.ts:275:        professionalLine: `${labelFor(category)} total ${dollars(sumFees)} on ${dollars(sumPurchaseAll)} of monthly purchases = ${pctOf(sumFees, sumPurchaseAll)} vs the ${cfg.capPct}% cap (${monthly.id}); ${provisionalQualifier()}; ${verdictPhrase(verdict, windowClose)}.`,
lib/packs/fees/audit.ts:276:        plainLine: `Across the month, ${labelFor(category).toLowerCase()} came to ${pctOf(sumFees, sumPurchaseAll)} of order value — over the ${cfg.capPct}% limit even on the monthly average. ${plainVerdict(verdict, windowClose)} (Depends on the still-open definition of "purchase price", U1.)`,
lib/packs/fees/audit.ts:293:  month: string,
lib/packs/fees/audit.ts:304:        l.month === month &&
lib/packs/fees/generate.ts:31:  type MonthlyStatement,
lib/packs/fees/generate.ts:74:function meta(month: string, asOf: string): MonthlyStatement["meta"] {
lib/packs/fees/generate.ts:79:    month,
lib/packs/fees/generate.ts:96:    month: CORPUS_MONTH,
lib/packs/fees/generate.ts:107:/** FAITHFUL: every line within cap, monthly averages within, basic present (no d-4). */
lib/packs/fees/generate.ts:108:export function buildFaithfulStatement(): MonthlyStatement {
lib/packs/fees/generate.ts:129:export function buildDriftedStatement(): MonthlyStatement {
lib/packs/fees/generate.ts:148:export function buildCuredStatement(): MonthlyStatement {
lib/packs/fees/generate.ts:153:      line("ORD-C2", "delivery_fee", "Delivery fee", 360, 2000), // 18% → monthly over by $1.20
lib/packs/fees/generate.ts:163:export function buildConditionalStatement(): MonthlyStatement {
lib/packs/fees/generate.ts:168:      line("ORD-K2", "delivery_fee", "Delivery fee", 360, 2000), // 18% → monthly over
lib/packs/fees/generate.ts:184:          { id: "fee-drift-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "violation", targetOrderId: "ORD-1..ORD-4", note: "delivery fees average 16% of monthly purchases — over the 15% cap even on the monthly-average alternative; window closed, no refund" },
lib/packs/fees/generate.ts:190:          { id: "fee-drift-007", feeClass: "relabeling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "an enhanced fee relabeled from delivery across periods; pure cross-month relabeling needs multi-month data + fee-change-notice records (g-1-iv is non-statement-checkable) — deferred" },
bin/check.mjs:32:      published UCP schemas (is it correctly SHAPED?). No --against needed — the
bin/check.mjs:33:      reference is the schema. Exit 0 = conformant, 1 = schema violation(s).
bin/check.mjs:35:      FEE-AUDIT leg (F1a, UC-1): audit a monthly delivery fee statement against
bin/check.mjs:50:    schemas from disk via ajv).
bin/check.mjs:101:  // FEES leg (F1a, UC-1): audit one monthly fee statement. Strict-flag discipline
bin/check.mjs:194:  // CONFORMANCE leg (W2): validate a UCP doc against the pinned schemas.
evals/packs/fees-parser.test.ts:2:import { StatementParseError, parseStatement } from "@/lib/packs/fees";
evals/packs/fees-parser.test.ts:13:  month: "2026-06",
evals/packs/fees-parser.test.ts:27:    month: "2026-06",
evals/packs/fees-parser.test.ts:37:    const fromObj = parseStatement(validStatement);
evals/packs/fees-parser.test.ts:38:    const fromStr = parseStatement(JSON.stringify(validStatement));
evals/packs/fees-parser.test.ts:45:describe("parser RED: each malformed input throws StatementParseError", () => {
evals/packs/fees-parser.test.ts:53:    ["bad meta.month (2026-6)", { ...validStatement, meta: { ...validStatement.meta, month: "2026-6" } }],
evals/packs/fees-parser.test.ts:59:    ["bad line.month", { ...validStatement, lines: [{ ...validLine, month: "June" }] }],
evals/packs/fees-parser.test.ts:64:    // M2 Codex finding #3: a monthly statement must not mix months — a stray-month
evals/packs/fees-parser.test.ts:65:    // line would silently corrupt monthly averages and the e-1 refund window.
evals/packs/fees-parser.test.ts:66:    ["line.month differs from meta.month", { ...validStatement, lines: [validLine, { ...validLine, orderId: "ORD-2", month: "2026-07" }] }],
evals/packs/fees-parser.test.ts:70:    expect(() => parseStatement(input)).toThrow(StatementParseError);
evals/packs/fees-parser.test.ts:74:    const ok = parseStatement({
evals/packs/fees-parser.test.ts:83:    expect(() => parseStatement("{ not json ")).toThrow(StatementParseError);
lib/packs/fees/classified-audit.ts:66:import type { DeclaredCategory, MonthlyStatement, StatementLine } from "./statement.ts";
lib/packs/fees/classified-audit.ts:142:  statement: MonthlyStatement,
lib/packs/fees/classified-audit.ts:146:  const nonRefund = statement.lines.filter((l) => !l.isRefund);
lib/packs/fees/cli.ts:5: * Reads a monthly fee statement from disk, parses it LOUDLY (typed errors →
lib/packs/fees/cli.ts:24:import { parseStatement } from "./parser.ts";
lib/packs/fees/cli.ts:34: * Run one fee audit. Throws {@link import("./parser.ts").StatementParseError} on
lib/packs/fees/cli.ts:39:  const statement = parseStatement(raw);
lib/packs/fees/statement.ts:2: * Fee-statement schema — F1a (UC-1 deterministic spine, plan §5 F1 / §7).
lib/packs/fees/statement.ts:4: * The typed model of a THIRD-PARTY DELIVERY PLATFORM's monthly itemized fee
lib/packs/fees/statement.ts:6: * (docs/research/uc1-rule-table.md § "JSON schema"; NYC §20-563.3(h) guarantees
lib/packs/fees/statement.ts:19: * Plain: a fake-but-realistic monthly delivery bill, in the shape the law says
lib/packs/fees/statement.ts:54:/** One fee line of the monthly itemized statement (per §20-563.3(h)). */
lib/packs/fees/statement.ts:58:  /** Calendar month of the charge, "YYYY-MM" (drives the monthly-average + e-1 window). */
lib/packs/fees/statement.ts:59:  readonly month: string;
lib/packs/fees/statement.ts:80:   * ISO date "YYYY-MM-DD" the refund was issued — present iff {@link isRefund}.
lib/packs/fees/statement.ts:101:  /** The statement's calendar month, "YYYY-MM". */
lib/packs/fees/statement.ts:102:  readonly month: string;
lib/packs/fees/statement.ts:106:   * The evaluation date, "YYYY-MM-DD" — DATA, never a clock read (determinism).
lib/packs/fees/statement.ts:119:/** A merchant's monthly itemized fee statement — the audit's minimum input. */
lib/packs/fees/statement.ts:120:export interface MonthlyStatement {
lib/packs/fees/parser.ts:4: * Raw JSON → typed {@link MonthlyStatement}. Every malformed input fails LOUD
lib/packs/fees/parser.ts:6: * negative money, a bad "YYYY-MM" month, a non-boolean flag, a refund without a
lib/packs/fees/parser.ts:15:  MonthlyStatement,
lib/packs/fees/parser.ts:62:    throw new StatementParseError(`${path} must be a "YYYY-MM" month (got "${s}")`);
lib/packs/fees/parser.ts:70:    throw new StatementParseError(`${path} must be a "YYYY-MM-DD" date (got "${s}")`);
lib/packs/fees/parser.ts:75:function parseMeta(raw: unknown): StatementMeta {
lib/packs/fees/parser.ts:98:    month: requireMonth(raw.month, "meta.month"),
lib/packs/fees/parser.ts:108:function parseLine(raw: unknown, i: number): StatementLine {
lib/packs/fees/parser.ts:126:    month: requireMonth(raw.month, `${at}.month`),
lib/packs/fees/parser.ts:142: * Parse raw JSON text or a parsed value into a typed {@link MonthlyStatement}.
lib/packs/fees/parser.ts:145:export function parseStatement(input: unknown): MonthlyStatement {
lib/packs/fees/parser.ts:151:    throw new StatementParseError("statement.lines must be an array");
lib/packs/fees/parser.ts:155:  // A statement is MONTHLY: the audit sums every line against meta.month's caps
lib/packs/fees/parser.ts:156:  // and refund window, so a line from another month would corrupt the monthly
lib/packs/fees/parser.ts:159:    if (line.month !== meta.month) {
lib/packs/fees/parser.ts:161:        `lines[${i}].month "${line.month}" does not match meta.month "${meta.month}" — a monthly statement must not mix months`,
lib/packs/fees/index.ts:4: * The fee-statement audit pack: a typed statement schema, a loud parser, the 17
lib/packs/fees/index.ts:47:  MonthlyStatement,
lib/packs/fees/index.ts:55:export { StatementParseError, parseStatement } from "./parser.ts";
lib/packs/fees/index.ts:64:  monthlyAverageExceeded,
lib/packs/fees/rules.ts:6: * a parsed {@link MonthlyStatement} — NOT a runtime interpreter of the JSON twin.
lib/packs/fees/rules.ts:18:import { isLegalFeeCategory, type MonthlyStatement, type StatementLine } from "./statement.ts";
lib/packs/fees/rules.ts:23:  | "monthly_average_cap"
lib/packs/fees/rules.ts:80:  { id: "NYC-563.3-a-2", sourceClause: "§ 20-563.3(a) (averaging clause)", kind: "monthly_average_cap", capPct: 15, base: "sum_purchase_price_all_orders_in_calendar_month", driftClasses: ["over-cap", "relabeling"] },
lib/packs/fees/rules.ts:82:  { id: "NYC-563.3-b-2", sourceClause: "§ 20-563.3(b) (averaging clause)", kind: "monthly_average_cap", capPct: 5, base: "sum_purchase_price_all_orders_in_calendar_month", driftClasses: ["over-cap", "relabeling"] },
lib/packs/fees/rules.ts:87:  { id: "NYC-563.3-d-3", sourceClause: "§ 20-563.3(d) (averaging clause)", kind: "monthly_average_cap", capPct: 20, base: "sum_purchase_price_all_orders_in_calendar_month", driftClasses: ["over-cap", "relabeling"] },
lib/packs/fees/rules.ts:98: * Rule ids the JSON twin defines but the statement schema CANNOT check — each
lib/packs/fees/rules.ts:108:  ["NYC-563.3-h-1", "Itemization duty. Defines the audit's INPUT contract itself (a monthly per-transaction itemized statement); the audit presupposes a parsed itemized statement, and a bundled/non-itemized charge surfaces via d-1's category lock."],
lib/packs/fees/rules.ts:136: * Monthly-average cap predicate (a-2 / b-2 / d-3): the month's summed fees for a
lib/packs/fees/rules.ts:137: * category exceed capPct% of the month's summed purchase price across ALL orders
lib/packs/fees/rules.ts:138: * (the twin's `sum_purchase_price_all_orders_in_calendar_month` base).
lib/packs/fees/rules.ts:140:export function monthlyAverageExceeded(
lib/packs/fees/rules.ts:158:export function enhancedWithoutBasic(statement: MonthlyStatement): boolean {
lib/packs/fees/rules.ts:159:  const lines = statement.lines.filter((l) => !l.isRefund);
scripts-ts/generate-fee-fixtures.mts:5: * faithful + drifted + cured + conditional monthly statements, the machine
scripts-ts/ucp-oracle-diff.mts:2: * UCP differential oracle — OPTIONAL CI lane (plan §3 "ucp-schema … in CI as a
scripts-ts/ucp-oracle-diff.mts:5: * The official `ucp-schema` validator is a cargo-only Rust tool. This script,
scripts-ts/ucp-oracle-diff.mts:6: * WHEN cargo (+ the `ucp-schema` binary) is present, runs `ucp-schema validate`
scripts-ts/ucp-oracle-diff.mts:14: * MEASURED 2026-07-05 (cargo + `ucp-schema` 1.3.0 installed on owner order — the
scripts-ts/ucp-oracle-diff.mts:20: *      UCP_ORACLE_INSTALL=1 npm run test:ucp-oracle   # opt-in `cargo install ucp-schema`
scripts-ts/ucp-oracle-diff.mts:34:  "ucp-schema differential oracle SKIPPED: cargo not installed — C5 agreement UNMEASURED on this machine";
scripts-ts/ucp-oracle-diff.mts:46: * Resolve the ucp-schema binary: PATH first, then cargo's default install dir
scripts-ts/ucp-oracle-diff.mts:53:  if (onPath("ucp-schema", ["--version"])) return "ucp-schema";
scripts-ts/ucp-oracle-diff.mts:54:  const cargoBin = join(homedir(), ".cargo", "bin", "ucp-schema");
scripts-ts/ucp-oracle-diff.mts:66: * cargo installed on owner order, `ucp-schema` 1.3.0 = the latest crates.io release):
scripts-ts/ucp-oracle-diff.mts:68: * by default; `ucp-schema validate` follows that default (no format-assertion flag
scripts-ts/ucp-oracle-diff.mts:91:    process.stdout.write("cargo present; installing ucp-schema (opt-in UCP_ORACLE_INSTALL=1)…\n");
scripts-ts/ucp-oracle-diff.mts:94:    execFileSync(cargoBin, ["install", "ucp-schema"], { stdio: "inherit" });
scripts-ts/ucp-oracle-diff.mts:97:      "ucp-schema differential oracle SKIPPED: cargo present but `ucp-schema` not installed — " +
scripts-ts/ucp-oracle-diff.mts:98:        "run `cargo install ucp-schema` or `UCP_ORACLE_INSTALL=1 npm run test:ucp-oracle`. C5 agreement UNMEASURED.\n",
scripts-ts/ucp-oracle-diff.mts:104:// --- cargo present + ucp-schema available: run the real differential ----------
scripts-ts/ucp-oracle-diff.mts:105:// Invocation per the ucp-schema README (validate a catalog container response
scripts-ts/ucp-oracle-diff.mts:111:const schemaBase = DEFAULT_UCP_SCHEMA_DIR;
scripts-ts/ucp-oracle-diff.mts:112:const opToSchema: Record<UcpCatalogOp, { schema: string; def: string }> = {
scripts-ts/ucp-oracle-diff.mts:113:  search: { schema: "shopping/catalog_search.json", def: "search_response" },
scripts-ts/ucp-oracle-diff.mts:114:  lookup: { schema: "shopping/catalog_lookup.json", def: "lookup_response" },
scripts-ts/ucp-oracle-diff.mts:115:  get_product: { schema: "shopping/catalog_lookup.json", def: "get_product_response" },
scripts-ts/ucp-oracle-diff.mts:123:  const { schema, def } = opToSchema[entry.op];
scripts-ts/ucp-oracle-diff.mts:131:        "--schema",
scripts-ts/ucp-oracle-diff.mts:132:        join(schemaBase, schema),
scripts-ts/ucp-oracle-diff.mts:138:        "--schema-local-base",
scripts-ts/ucp-oracle-diff.mts:139:        schemaBase,
scripts-ts/ucp-oracle-diff.mts:146:    // ucp-schema exits 1 when validation fails — that is a valid "invalid" verdict,
scripts-ts/ucp-oracle-diff.mts:162:        `ucp-schema treats format as annotation-only (valid) — the root-caused 2020-12 fork, expected\n`,
scripts-ts/ucp-oracle-diff.mts:167:      `DISAGREE ${entry.file}: ours.ok=${ours.ok} vs ucp-schema.valid=${officialValid}\n`,
scripts-ts/ucp-oracle-diff.mts:173:  `ucp-schema differential oracle: ${agree}/${manifest.entries.length} agree, ` +

codex
One shell search had a quoting error; I’m correcting that with narrower commands. So far, the only fee-pack claim-id constructors I see are the modified per-line constructors plus unchanged statement/month aggregate constructors.
exec
/bin/zsh -lc "sed -n '1,130p' lib/packs/fees/finding.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "sed -n '1,130p' evals/packs/fees-parser.test.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "sed -n '1,230p' lib/packs/fees/parser.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "sed -n '1,260p' lib/packs/fees/serialize.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 exited 1 in 0ms:
sed: lib/packs/fees/serialize.ts: No such file or directory

 succeeded in 0ms:
import { describe, expect, it } from "vitest";
import { StatementParseError, parseStatement } from "@/lib/packs/fees";

/**
 * Parser rejection paths (plan F1a item 3), RED-GREEN: every malformed input
 * throws a typed StatementParseError; the corrected input parses. Nothing is
 * silently defaulted — a statement that does not parse cleanly is never audited
 * on guessed values.
 */

const validLine = {
  orderId: "ORD-1",
  month: "2026-06",
  declaredCategory: "delivery_fee",
  label: "Delivery fee",
  amountCents: 300,
  orderPurchasePriceCents: 2000,
  isRefund: false,
  passthroughDocumented: false,
};

const validStatement = {
  meta: {
    simulated: true,
    generator: { name: "test", seed: 1, version: "1.0.0" },
    merchant: "Test (simulated)",
    month: "2026-06",
    currency: "USD",
    asOf: "2026-08-15",
    purchasePriceBaseConvention: "assumed base",
  },
  lines: [validLine],
};

describe("parser GREEN: a well-formed statement parses", () => {
  it("parses an object and a JSON string identically", () => {
    const fromObj = parseStatement(validStatement);
    const fromStr = parseStatement(JSON.stringify(validStatement));
    expect(fromObj.lines).toHaveLength(1);
    expect(fromStr.lines[0].amountCents).toBe(300);
    expect(fromObj.meta.simulated).toBe(true);
  });
});

describe("parser RED: each malformed input throws StatementParseError", () => {
  const bad: readonly [string, unknown][] = [
    ["non-object top level", 42],
    ["missing lines array", { meta: validStatement.meta }],
    ["lines not an array", { meta: validStatement.meta, lines: {} }],
    ["missing meta", { lines: [validLine] }],
    ["meta.simulated not literal true", { ...validStatement, meta: { ...validStatement.meta, simulated: false } }],
    ["meta.currency not USD", { ...validStatement, meta: { ...validStatement.meta, currency: "EUR" } }],
    ["bad meta.month (2026-6)", { ...validStatement, meta: { ...validStatement.meta, month: "2026-6" } }],
    ["bad meta.asOf (not a date)", { ...validStatement, meta: { ...validStatement.meta, asOf: "2026-08" } }],
    ["float amountCents", { ...validStatement, lines: [{ ...validLine, amountCents: 3.5 }] }],
    ["negative amountCents", { ...validStatement, lines: [{ ...validLine, amountCents: -1 }] }],
    ["zero orderPurchasePriceCents", { ...validStatement, lines: [{ ...validLine, orderPurchasePriceCents: 0 }] }],
    ["non-integer purchase", { ...validStatement, lines: [{ ...validLine, orderPurchasePriceCents: 20.01 }] }],
    ["bad line.month", { ...validStatement, lines: [{ ...validLine, month: "June" }] }],
    ["empty declaredCategory", { ...validStatement, lines: [{ ...validLine, declaredCategory: "" }] }],
    ["non-boolean isRefund", { ...validStatement, lines: [{ ...validLine, isRefund: "yes" }] }],
    ["refund without a date", { ...validStatement, lines: [{ ...validLine, isRefund: true }] }],
    ["refundedAtDate on a non-refund line", { ...validStatement, lines: [{ ...validLine, refundedAtDate: "2026-07-15" }] }],
    // M2 Codex finding #3: a monthly statement must not mix months — a stray-month
    // line would silently corrupt monthly averages and the e-1 refund window.
    ["line.month differs from meta.month", { ...validStatement, lines: [validLine, { ...validLine, orderId: "ORD-2", month: "2026-07" }] }],
  ];

  it.each(bad)("rejects: %s", (_name, input) => {
    expect(() => parseStatement(input)).toThrow(StatementParseError);
  });

  it("a refund WITH a valid date parses (green counterpart)", () => {
    const ok = parseStatement({
      ...validStatement,
      lines: [{ ...validLine, isRefund: true, refundedAtDate: "2026-07-15" }],
    });
    expect(ok.lines[0].isRefund).toBe(true);
    expect(ok.lines[0].refundedAtDate).toBe("2026-07-15");
  });

  it("invalid JSON text throws StatementParseError (not a raw SyntaxError)", () => {
    expect(() => parseStatement("{ not json ")).toThrow(StatementParseError);
  });
});

 succeeded in 0ms:
/**
 * Fee-statement parser — F1a (plan §5 F1 item 3).
 *
 * Raw JSON → typed {@link MonthlyStatement}. Every malformed input fails LOUD
 * with a typed {@link StatementParseError}: missing/empty fields, non-integer or
 * negative money, a bad "YYYY-MM" month, a non-boolean flag, a refund without a
 * date, an unknown top-level shape. NOTHING is silently defaulted — a statement
 * that does not parse cleanly is never audited on guessed values (that would let
 * a real over-charge slip through on a coercion).
 *
 * Plain: the bill-reader. It only accepts a bill whose every line is well-formed;
 * anything missing or malformed is rejected out loud, never quietly patched.
 */
import type {
  MonthlyStatement,
  StatementLine,
  StatementMeta,
} from "./statement.ts";

/** Thrown on any malformed statement input — carries a precise, typed reason. */
export class StatementParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StatementParseError";
  }
}

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function requireString(v: unknown, path: string): string {
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new StatementParseError(`${path} must be a non-empty string`);
  }
  return v;
}

function requireIntCents(v: unknown, path: string, opts: { min: number }): number {
  if (typeof v !== "number" || !Number.isInteger(v)) {
    throw new StatementParseError(`${path} must be an integer number of cents (no floats)`);
  }
  if (v < opts.min) {
    throw new StatementParseError(`${path} must be >= ${opts.min} (got ${v})`);
  }
  return v;
}

function requireBoolean(v: unknown, path: string): boolean {
  if (typeof v !== "boolean") {
    throw new StatementParseError(`${path} must be a boolean`);
  }
  return v;
}

function requireMonth(v: unknown, path: string): string {
  const s = requireString(v, path);
  if (!MONTH_RE.test(s)) {
    throw new StatementParseError(`${path} must be a "YYYY-MM" month (got "${s}")`);
  }
  return s;
}

function requireDate(v: unknown, path: string): string {
  const s = requireString(v, path);
  if (!DATE_RE.test(s)) {
    throw new StatementParseError(`${path} must be a "YYYY-MM-DD" date (got "${s}")`);
  }
  return s;
}

function parseMeta(raw: unknown): StatementMeta {
  if (!isObject(raw)) throw new StatementParseError("meta must be an object");
  if (raw.simulated !== true) {
    throw new StatementParseError('meta.simulated must be the literal true (honesty marker, C10)');
  }
  if (!isObject(raw.generator)) {
    throw new StatementParseError("meta.generator must be an object");
  }
  const g = raw.generator;
  if (typeof g.seed !== "number" || !Number.isInteger(g.seed)) {
    throw new StatementParseError("meta.generator.seed must be an integer");
  }
  if (raw.currency !== "USD") {
    throw new StatementParseError(`meta.currency must be "USD" (got ${JSON.stringify(raw.currency)})`);
  }
  return {
    simulated: true,
    generator: {
      name: requireString(g.name, "meta.generator.name"),
      seed: g.seed,
      version: requireString(g.version, "meta.generator.version"),
    },
    merchant: requireString(raw.merchant, "meta.merchant"),
    month: requireMonth(raw.month, "meta.month"),
    currency: "USD",
    asOf: requireDate(raw.asOf, "meta.asOf"),
    purchasePriceBaseConvention: requireString(
      raw.purchasePriceBaseConvention,
      "meta.purchasePriceBaseConvention",
    ),
  };
}

function parseLine(raw: unknown, i: number): StatementLine {
  const at = `lines[${i}]`;
  if (!isObject(raw)) throw new StatementParseError(`${at} must be an object`);
  const isRefund = requireBoolean(raw.isRefund, `${at}.isRefund`);
  const refundedAtDate =
    raw.refundedAtDate === undefined
      ? undefined
      : requireDate(raw.refundedAtDate, `${at}.refundedAtDate`);
  if (isRefund && refundedAtDate === undefined) {
    throw new StatementParseError(
      `${at}.refundedAtDate is required when isRefund is true (a dateless refund cannot satisfy the §20-563.3(e) window)`,
    );
  }
  if (!isRefund && refundedAtDate !== undefined) {
    throw new StatementParseError(`${at}.refundedAtDate is only valid on a refund line (isRefund=true)`);
  }
  return {
    orderId: requireString(raw.orderId, `${at}.orderId`),
    month: requireMonth(raw.month, `${at}.month`),
    declaredCategory: requireString(raw.declaredCategory, `${at}.declaredCategory`),
    label: requireString(raw.label, `${at}.label`),
    amountCents: requireIntCents(raw.amountCents, `${at}.amountCents`, { min: 0 }),
    orderPurchasePriceCents: requireIntCents(
      raw.orderPurchasePriceCents,
      `${at}.orderPurchasePriceCents`,
      { min: 1 },
    ),
    isRefund,
    passthroughDocumented: requireBoolean(raw.passthroughDocumented, `${at}.passthroughDocumented`),
    ...(refundedAtDate !== undefined ? { refundedAtDate } : {}),
  };
}

/**
 * Parse raw JSON text or a parsed value into a typed {@link MonthlyStatement}.
 * Throws {@link StatementParseError} on any malformed input — never coerces.
 */
export function parseStatement(input: unknown): MonthlyStatement {
  const raw = typeof input === "string" ? parseJsonText(input) : input;
  if (!isObject(raw)) {
    throw new StatementParseError("statement must be a JSON object with { meta, lines }");
  }
  if (!Array.isArray(raw.lines)) {
    throw new StatementParseError("statement.lines must be an array");
  }
  const meta = parseMeta(raw.meta);
  const lines = raw.lines.map((l, i) => parseLine(l, i));
  // A statement is MONTHLY: the audit sums every line against meta.month's caps
  // and refund window, so a line from another month would corrupt the monthly
  // averages and e-1 cure logic (M2 Codex finding #3). Reject loudly, never coerce.
  for (const [i, line] of lines.entries()) {
    if (line.month !== meta.month) {
      throw new StatementParseError(
        `lines[${i}].month "${line.month}" does not match meta.month "${meta.month}" — a monthly statement must not mix months`,
      );
    }
  }
  return { meta, lines };
}

function parseJsonText(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new StatementParseError(
      `statement is not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

 succeeded in 0ms:
/**
 * Fee-pack finding + report model — F1a (plan §5 F1 items 5–7).
 *
 * A {@link FeeFinding} is a verifier-core {@link Finding} (all four C2 receipts,
 * built through the ONLY sanctioned constructor `makeFinding`) EXTENDED with the
 * fee-domain state the report needs:
 *  - a {@link FeeVerdict} (the fee-domain verdict state — the §20-563.3(e)
 *    refund-window states plus the c-2 asserted-pass-through state; a state,
 *    not prose);
 *  - the plan §7 fee-line class it belongs to;
 *  - a PROVISIONAL marker array — {@link makeFeeFinding} REQUIRES the U1 marker on
 *    any finding from a base-derived rule, so a base-derived over-cap can never be
 *    rendered as an unqualified violation;
 *  - both registers (professional + plain), per the two-register doc standard.
 *
 * Plain: a caught fee problem with its receipts, PLUS whether it's a settled
 * violation or still inside the legal refund-grace window, PLUS an honest asterisk
 * whenever the call depends on the still-unresolved definition of "purchase price".
 */
import type { Finding, Severity } from "../../verifier-core/index.ts";
import { makeFinding } from "../../verifier-core/guard.ts";
import type { FeeLineClass } from "./index.ts";
import { BASE_DERIVED_RULE_IDS } from "./rules.ts";
import { ASSUMED_PURCHASE_PRICE_BASE } from "./statement.ts";

/** The U1 provisional marker — one string, so resolving U1 later is a one-place flip. */
export const PROVISIONAL_U1 = "U1-base" as const;

/**
 * The fee-domain verdict state of a finding, ENCODED (never prose):
 *  - `violation` — settled: over cap and (for a/b/d) the §20-563.3(e) 30-day
 *    refund window closed with no covering refund, or (for c) no safe harbor
 *    exists at all;
 *  - `conditional-pending-refund-window` — over cap on a/b/d but the 30-day
 *    window is still open (not yet a violation — the statute defers the verdict);
 *  - `cured-by-refund` — over cap on a/b/d, fully refunded within the window (not
 *    a violation);
 *  - `asserted-passthrough-unverified` — a transaction fee above the 3% cap whose
 *    §20-563.3(c)(i)–(ii) pass-through exception rests SOLELY on the platform's
 *    asserted `passthroughDocumented` flag. The statement cannot verify the
 *    underlying processor charge, so the audit neither clears the line silently
 *    nor calls it a violation — it surfaces the reliance (M2 Codex finding #1,
 *    2026-07-04). Never counts toward `ok:false`.
 * Non-over-cap findings (category lock, enhanced-without-basic) are always
 * `violation`.
 */
export type FeeVerdict =
  | "violation"
  | "conditional-pending-refund-window"
  | "cured-by-refund"
  | "asserted-passthrough-unverified";

export const FEE_VERDICTS: readonly FeeVerdict[] = [
  "violation",
  "conditional-pending-refund-window",
  "cured-by-refund",
  "asserted-passthrough-unverified",
] as const;

/** A fee finding: a C2-valid core Finding + fee-domain state (both registers). */
export interface FeeFinding extends Finding {
  /** The fee verdict state (a state, not prose): the §20-563.3(e) refund states plus the c-2 `asserted-passthrough-unverified` warn (M2, 2026-07-04). */
  readonly verdict: FeeVerdict;
  /** Plan §7 fee-line class this finding belongs to. */
  readonly feeClass: FeeLineClass;
  /** Provisional markers (e.g. {@link PROVISIONAL_U1}); required on base-derived rules. */
  readonly provisional: readonly string[];
  /** Professional-register line (leads; two-register doc standard). */
  readonly professionalLine: string;
  /** Plain-register line (paired, same breath). Always present on a fee finding. */
  readonly plainLine: string;
}

/** Raw input to {@link makeFeeFinding} — validated + frozen on the way out. */
export interface FeeFindingInput {
  readonly claim: Finding["claim"];
  readonly referenceRowId: string;
  readonly ruleId: string;
  readonly severity: Severity;
  readonly verdict: FeeVerdict;
  readonly feeClass: FeeLineClass;
  readonly provisional?: readonly string[];
  readonly professionalLine: string;
  readonly plainLine: string;
}

/** Thrown when a base-derived finding omits the mandatory U1 provisional marker. */
export class MissingProvisionalMarkerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingProvisionalMarkerError";
  }
}

/**
 * The ONLY sanctioned fee-finding constructor. Wraps verifier-core `makeFinding`
 * (so the four C2 receipts are validated exactly as every other pack's findings
 * are), then enforces the U1 rule: any finding from a base-derived rule MUST
 * carry {@link PROVISIONAL_U1}, or this throws — a base-derived over-cap cannot
 * exist as an unqualified violation.
 */
export function makeFeeFinding(input: FeeFindingInput): FeeFinding {
  // C2 first — reuse the single core guard (throws on any missing receipt).
  const core = makeFinding({
    claim: input.claim,
    referenceRowId: input.referenceRowId,
    ruleId: input.ruleId,
    severity: input.severity,
    category: input.feeClass,
    plainLine: input.plainLine,
  });
  const provisional = input.provisional ?? [];
  if (BASE_DERIVED_RULE_IDS.has(input.ruleId) && !provisional.includes(PROVISIONAL_U1)) {
    throw new MissingProvisionalMarkerError(
      `U1 violated: base-derived rule ${input.ruleId} requires the "${PROVISIONAL_U1}" provisional marker (over-cap depends on the unresolved purchase-price base)`,
    );
  }
  if (!input.professionalLine.trim() || !input.plainLine.trim()) {
    throw new MissingProvisionalMarkerError(
      `fee finding for ${input.ruleId} requires both a professional and a plain line (two-register standard)`,
    );
  }
  return Object.freeze({
    ...core,
    verdict: input.verdict,
    feeClass: input.feeClass,
    provisional: Object.freeze([...provisional]),
    professionalLine: input.professionalLine,
    plainLine: input.plainLine,
  });

exec
/bin/zsh -lc "rg -n 'claim: \\{ id|expectedClaimId|\\.split\\(\"#\"\\)|\\.split\\('\\''#'\\''\\)|lineIndex|get\\(line\\)|makeLineTagger|claimIdPart' lib/packs/fees evals/packs evals/gold fixtures/synthetic-restaurant/fees bin scripts-ts components app lib | head -n 300" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
lib/packs/fees/classified-audit.ts:58:import { auditStatement, claimIdPart, makeLineTagger } from "./audit.ts";
lib/packs/fees/classified-audit.ts:112:      id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag}#classifier`,
lib/packs/fees/classified-audit.ts:148:  const lineTag = makeLineTagger(statement);
fixtures/synthetic-restaurant/fees/fee-answer-key.json:19:          "expectedClaimId": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:29:          "expectedClaimId": "ORD-1#transaction_fee#L1",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:39:          "expectedClaimId": "ORD-3#service_and_delivery#L5",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:49:          "expectedClaimId": "ORD-4#promotion_deduction#L7",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:59:          "expectedClaimId": "2026-06#enhanced-without-basic",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:69:          "expectedClaimId": null,
fixtures/synthetic-restaurant/fees/fee-answer-key.json:79:          "expectedClaimId": null,
fixtures/synthetic-restaurant/fees/fee-answer-key.json:93:          "expectedClaimId": "2026-06#delivery_fee",
fixtures/synthetic-restaurant/fees/fee-answer-key.json:107:          "expectedClaimId": "2026-06#delivery_fee",
lib/packs/fees/audit.ts:141: * `declaredCategory`): '%' → '%25', '#' → '%23'. Keeps `id.split("#")`
lib/packs/fees/audit.ts:146:export const claimIdPart = (s: string): string => s.replace(/%/g, "%25").replace(/#/g, "%23");
lib/packs/fees/audit.ts:155:export function makeLineTagger(statement: MonthlyStatement): (l: StatementLine) => string {
lib/packs/fees/audit.ts:172:  const lineTag = makeLineTagger(statement);
lib/packs/fees/audit.ts:181:        claim: { id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag(line)}`, source: "fee-statement", field: "declaredCategory", value: line.declaredCategory },
lib/packs/fees/audit.ts:198:        claim: { id: `${month}#enhanced-without-basic`, source: "fee-statement", field: "declaredCategory", value: "enhanced_service_fee" },
lib/packs/fees/audit.ts:230:              claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "passthroughDocumented", value: true },
lib/packs/fees/audit.ts:245:            claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "amountCents", value: line.amountCents },
lib/packs/fees/audit.ts:268:        claim: { id: `${month}#${category}`, source: "fee-statement", field: "monthlyAverage", value: { sumFeesCents: sumFees, sumPurchasePriceCents: sumPurchaseAll, capPct: cfg.capPct } },
lib/packs/fees/index.ts:83:  claimIdPart,
lib/packs/fees/index.ts:84:  makeLineTagger,
lib/packs/fees/generate.ts:52:  readonly expectedClaimId: string | null;
lib/packs/fees/generate.ts:184:          { id: "fee-drift-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "violation", targetOrderId: "ORD-1..ORD-4", note: "delivery fees average 16% of monthly purchases — over the 15% cap even on the monthly-average alternative; window closed, no refund" },
lib/packs/fees/generate.ts:185:          { id: "fee-drift-002", feeClass: "processing-fee-base-inflation", detection: "deterministic", expectedClaimId: "ORD-1#transaction_fee#L1", expectedRuleId: "NYC-563.3-c-1", expectedVerdict: "violation", targetOrderId: "ORD-1", note: "transaction fee 8% > hard 3% cap, not documented as a pass-through (c-2); no safe harbor for c" },
lib/packs/fees/generate.ts:186:          { id: "fee-drift-003", feeClass: "bundling", detection: "deterministic", expectedClaimId: "ORD-3#service_and_delivery#L5", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-3", note: "a lumped line under a non-permitted category label — caught by the d-1 category lock" },
lib/packs/fees/generate.ts:187:          { id: "fee-drift-004", feeClass: "promotion-deduction-mischaracterization", detection: "deterministic", expectedClaimId: "ORD-4#promotion_deduction#L7", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-4", note: "a charge dressed as a 'promotion deduction' is not a permitted fee category — d-1" },
lib/packs/fees/generate.ts:188:          { id: "fee-drift-005", feeClass: "misclassification", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#enhanced-without-basic`, expectedRuleId: "NYC-563.3-d-4", expectedVerdict: "violation", targetOrderId: "ORD-2", note: "enhanced service fee charged with no basic service fee in the statement — d-4 gating clause" },
lib/packs/fees/generate.ts:189:          { id: "fee-drift-006", feeClass: "bundling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "a within-cap line under a LEGAL category that actually bundles service + processing — unbundling needs the F1b line-item classifier; the deterministic spine sees only a compliant transaction fee" },
lib/packs/fees/generate.ts:190:          { id: "fee-drift-007", feeClass: "relabeling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "an enhanced fee relabeled from delivery across periods; pure cross-month relabeling needs multi-month data + fee-change-notice records (g-1-iv is non-statement-checkable) — deferred" },
lib/packs/fees/generate.ts:195:          { id: "fee-cure-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "cured-by-refund", targetOrderId: "ORD-C1,ORD-C2", note: "delivery over-cap fully refunded within the §20-563.3(e) 30-day window — not a violation" },
lib/packs/fees/generate.ts:200:          { id: "fee-cond-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "conditional-pending-refund-window", targetOrderId: "ORD-K1,ORD-K2", note: "delivery over-cap evaluated while the 30-day window is still open — not yet a violation" },
evals/packs/fees-classifier.test.ts:192:        claim: { id: "x", source: "classifier", field: "", value: "y" },
evals/packs/fees-advisory-nits.test.ts:5:  claimIdPart,
evals/packs/fees-advisory-nits.test.ts:6:  makeLineTagger,
evals/packs/fees-advisory-nits.test.ts:18: *     `claimIdPart` ('%'→'%25', '#'→'%23') — identity on every committed corpus
evals/packs/fees-advisory-nits.test.ts:20: *     via decodeURIComponent-style unescaping, so `id.split("#")` is unambiguous.
evals/packs/fees-advisory-nits.test.ts:22: *  2. Object-identity `lineIndex` maps rendered a silent "Lundefined" tag for a
evals/packs/fees-advisory-nits.test.ts:24: *     `makeLineTagger` throws loudly instead (unreachable via the parser — this is
evals/packs/fees-advisory-nits.test.ts:60:describe("claimIdPart (nit 3: '#' in arbitrary id components)", () => {
evals/packs/fees-advisory-nits.test.ts:63:      expect(claimIdPart(s)).toBe(s);
evals/packs/fees-advisory-nits.test.ts:69:      expect(unescapePart(claimIdPart(s))).toBe(s);
evals/packs/fees-advisory-nits.test.ts:70:      expect(claimIdPart(s)).not.toContain("#");
evals/packs/fees-advisory-nits.test.ts:78:    const segments = d1!.claim.id.split("#");
evals/packs/fees-advisory-nits.test.ts:93:    const segments = report.advisoryFindings[0].claim.id.split("#");
evals/packs/fees-advisory-nits.test.ts:100:describe("makeLineTagger (nit 2: object-identity lineIndex)", () => {
evals/packs/fees-advisory-nits.test.ts:103:    const tag = makeLineTagger(s);
evals/packs/fees-advisory-nits.test.ts:110:    const tag = makeLineTagger(s);
evals/packs/fees-finding-u1.test.ts:22:  claim: { id: "2026-06#delivery_fee", source: "fee-statement", field: "monthlyAverage", value: 1 },
evals/packs/fees-coverage-c6.test.ts:43:        const e = det.find((e) => e.expectedClaimId === f.claim.id && e.expectedRuleId === f.ruleId);
evals/packs/fees-coverage-c6.test.ts:52:          (f) => f.claim.id === e.expectedClaimId && f.ruleId === e.expectedRuleId,
evals/packs/fees-coverage-c6.test.ts:90:      expect(e.expectedClaimId).toBeNull();
lib/packs/listings/run.ts:36:    const rowId = c.id.split("#")[0];
lib/packs/fees/classified-audit.ts:58:import { auditStatement, claimIdPart, makeLineTagger } from "./audit.ts";
lib/packs/fees/classified-audit.ts:112:      id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag}#classifier`,
lib/packs/fees/classified-audit.ts:148:  const lineTag = makeLineTagger(statement);
lib/packs/fees/audit.ts:141: * `declaredCategory`): '%' → '%25', '#' → '%23'. Keeps `id.split("#")`
lib/packs/fees/audit.ts:146:export const claimIdPart = (s: string): string => s.replace(/%/g, "%25").replace(/#/g, "%23");
lib/packs/fees/audit.ts:155:export function makeLineTagger(statement: MonthlyStatement): (l: StatementLine) => string {
lib/packs/fees/audit.ts:172:  const lineTag = makeLineTagger(statement);
lib/packs/fees/audit.ts:181:        claim: { id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag(line)}`, source: "fee-statement", field: "declaredCategory", value: line.declaredCategory },
lib/packs/fees/audit.ts:198:        claim: { id: `${month}#enhanced-without-basic`, source: "fee-statement", field: "declaredCategory", value: "enhanced_service_fee" },
lib/packs/fees/audit.ts:230:              claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "passthroughDocumented", value: true },
lib/packs/fees/audit.ts:245:            claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "amountCents", value: line.amountCents },
lib/packs/fees/audit.ts:268:        claim: { id: `${month}#${category}`, source: "fee-statement", field: "monthlyAverage", value: { sumFeesCents: sumFees, sumPurchasePriceCents: sumPurchaseAll, capPct: cfg.capPct } },
lib/packs/fees/index.ts:83:  claimIdPart,
lib/packs/fees/index.ts:84:  makeLineTagger,
lib/packs/fees/generate.ts:52:  readonly expectedClaimId: string | null;
lib/packs/fees/generate.ts:184:          { id: "fee-drift-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "violation", targetOrderId: "ORD-1..ORD-4", note: "delivery fees average 16% of monthly purchases — over the 15% cap even on the monthly-average alternative; window closed, no refund" },
lib/packs/fees/generate.ts:185:          { id: "fee-drift-002", feeClass: "processing-fee-base-inflation", detection: "deterministic", expectedClaimId: "ORD-1#transaction_fee#L1", expectedRuleId: "NYC-563.3-c-1", expectedVerdict: "violation", targetOrderId: "ORD-1", note: "transaction fee 8% > hard 3% cap, not documented as a pass-through (c-2); no safe harbor for c" },
lib/packs/fees/generate.ts:186:          { id: "fee-drift-003", feeClass: "bundling", detection: "deterministic", expectedClaimId: "ORD-3#service_and_delivery#L5", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-3", note: "a lumped line under a non-permitted category label — caught by the d-1 category lock" },
lib/packs/fees/generate.ts:187:          { id: "fee-drift-004", feeClass: "promotion-deduction-mischaracterization", detection: "deterministic", expectedClaimId: "ORD-4#promotion_deduction#L7", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-4", note: "a charge dressed as a 'promotion deduction' is not a permitted fee category — d-1" },
lib/packs/fees/generate.ts:188:          { id: "fee-drift-005", feeClass: "misclassification", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#enhanced-without-basic`, expectedRuleId: "NYC-563.3-d-4", expectedVerdict: "violation", targetOrderId: "ORD-2", note: "enhanced service fee charged with no basic service fee in the statement — d-4 gating clause" },
lib/packs/fees/generate.ts:189:          { id: "fee-drift-006", feeClass: "bundling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "a within-cap line under a LEGAL category that actually bundles service + processing — unbundling needs the F1b line-item classifier; the deterministic spine sees only a compliant transaction fee" },
lib/packs/fees/generate.ts:190:          { id: "fee-drift-007", feeClass: "relabeling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "an enhanced fee relabeled from delivery across periods; pure cross-month relabeling needs multi-month data + fee-change-notice records (g-1-iv is non-statement-checkable) — deferred" },
lib/packs/fees/generate.ts:195:          { id: "fee-cure-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "cured-by-refund", targetOrderId: "ORD-C1,ORD-C2", note: "delivery over-cap fully refunded within the §20-563.3(e) 30-day window — not a violation" },
lib/packs/fees/generate.ts:200:          { id: "fee-cond-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "conditional-pending-refund-window", targetOrderId: "ORD-K1,ORD-K2", note: "delivery over-cap evaluated while the 30-day window is still open — not yet a violation" },
lib/packs/listings/reference.ts:59:      const rowId = claim.id.split("#")[0];
lib/packs/listings/demo/transcript.ts:63:      (f: Finding) => f.claim.id.split("#")[0] === itemId || f.referenceRowId === itemId,

exec
/bin/zsh -lc "sed -n '130,230p' lib/packs/fees/finding.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "sed -n '1,220p' lib/packs/fees/cli.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
/**
 * Fees CLI entry logic — F1a (plan §5 F1 item 8; C1 one-command validator).
 *
 * Loaded by bin/check.mjs via Node's native TypeScript type-stripping (Node ≥ 24).
 * Reads a monthly fee statement from disk, parses it LOUDLY (typed errors →
 * exit 2 at the bin), audits it deterministically against the codified NYC
 * §20-563.3 rule table, and returns the report + exit code (1 iff any `violation`
 * verdict). ZERO LLM / network — enforced by the import-graph eval, not promised.
 *
 * Two registers (item 7): default output is a human-readable TEXT report (the
 * professional line paired with its plain line, verdict states, U1-provisional
 * markers spelled out); `--json` emits the canonical machine report. Both carry
 * the honest scope label — classification is AS-DECLARED; the LLM line-item
 * classifier is DEFERRED to F1b.
 *
 * Plain: point it at a delivery bill; it prints every over-cap or illegal fee with
 * receipts and says whether each is a settled violation or still inside the legal
 * refund window — free to run, no AI.
 */
import { readFileSync } from "node:fs";
import { auditStatement } from "./audit.ts";
import type { FeeAuditReport, FeeFinding } from "./finding.ts";
import { serializeFeeReport } from "./finding.ts";
import { parseStatement } from "./parser.ts";

export interface FeeCliResult {
  readonly report: FeeAuditReport;
  readonly output: string;
  /** 0 = clean, 1 = at least one `violation` verdict. */
  readonly exitCode: 0 | 1;
}

/**
 * Run one fee audit. Throws {@link import("./parser.ts").StatementParseError} on
 * unreadable/malformed input — bin/check.mjs maps that to exit 2.
 */
export function runFeeCheck(statementPath: string, opts: { json?: boolean } = {}): FeeCliResult {
  const raw = readFileSync(statementPath, "utf8");
  const statement = parseStatement(raw);
  const report = auditStatement(statement);
  const output = opts.json ? serializeFeeReport(report) : renderFeeReportText(report);
  return { report, output, exitCode: report.ok ? 0 : 1 };
}

const VERDICT_TAG: Readonly<Record<FeeFinding["verdict"], string>> = {
  violation: "VIOLATION",
  "conditional-pending-refund-window": "CONDITIONAL (refund window open)",
  "cured-by-refund": "CURED BY REFUND (not a violation)",
  "asserted-passthrough-unverified": "ASSERTED PASS-THROUGH (unverified — not a violation)",
};

/** Human-readable two-register text render (the default CLI output). */
export function renderFeeReportText(report: FeeAuditReport): string {
  const lines: string[] = [];
  lines.push("UC-1 FEE AUDIT — deterministic spine (SIMULATED statement vs REAL codified NYC §20-563.3)");
  lines.push(`spec: ${report.specVersion}`);
  lines.push(`classification: ${report.classification}`);
  lines.push(`assumed purchase-price base (U1 unresolved): ${report.assumedPurchasePriceBase}`);
  lines.push(`verdict: ${report.ok ? "PASS (no violations)" : "FAIL (violations present)"}`);
  lines.push(
    `findings: ${report.findings.length} — violation ${report.verdictTally.violation}, conditional ${report.verdictTally["conditional-pending-refund-window"]}, cured ${report.verdictTally["cured-by-refund"]}, asserted-passthrough ${report.verdictTally["asserted-passthrough-unverified"]}`,
  );
  lines.push("");
  if (report.findings.length === 0) {
    lines.push("No findings — every fee line is within cap as declared.");
  }
  for (const f of report.findings) {
    const marks = f.provisional.length > 0 ? ` [provisional: ${f.provisional.join(", ")}]` : "";
    lines.push(`• [${VERDICT_TAG[f.verdict]}] ${f.ruleId} (${f.referenceRowId}) — ${f.feeClass}${marks}`);
    lines.push(`    ${f.professionalLine}`);
    lines.push(`    ▸ ${f.plainLine}`);
  }
  lines.push("");
  lines.push("Note: SIMULATED statements audited against REAL codified law. No real-platform access or data.");
  return `${lines.join("\n")}\n`;
}

 succeeded in 0ms:
  });
}

/** Machine-readable fee-audit report (CI-usable) — verifier-core report pattern. */
export interface FeeAuditReport {
  /** Rule-table version pinned in the header of every report (C10). */
  readonly specVersion: string;
  /** True — this corpus is always simulated (C10 honesty surface). */
  readonly simulated: true;
  /**
   * Honest scope label: the deterministic spine audits categories AS DECLARED by
   * the platform; the LLM line-item classifier is DEFERRED to F1b.
   */
  readonly classification: string;
  /** The assumed purchase-price base every base-derived verdict is provisional against (U1). */
  readonly assumedPurchasePriceBase: string;
  /** All evidence-cited fee findings, deterministically ordered. */
  readonly findings: readonly FeeFinding[];
  /** Verdict tally — counts by {@link FeeVerdict}. */
  readonly verdictTally: Readonly<Record<FeeVerdict, number>>;
  /** Overall pass/fail: false iff any finding has verdict `violation` (drives exit 1). */
  readonly ok: boolean;
}

/**
 * Deterministic finding order: feeClass, then ruleId, then claim id. Stable
 * ordering is what makes the frozen golden report byte-comparable.
 */
export function sortFeeFindings(findings: readonly FeeFinding[]): readonly FeeFinding[] {
  return [...findings].sort(
    (a, b) =>
      a.feeClass.localeCompare(b.feeClass) ||
      a.ruleId.localeCompare(b.ruleId) ||
      a.claim.id.localeCompare(b.claim.id),
  );
}

/** Assemble the machine-readable fee-audit report. `ok` is false iff any `violation`. */
export function buildFeeReport(
  findings: readonly FeeFinding[],
  opts: { readonly specVersion: string; readonly classification: string },
): FeeAuditReport {
  const sorted = sortFeeFindings(findings);
  const verdictTally: Record<FeeVerdict, number> = {
    violation: 0,
    "conditional-pending-refund-window": 0,
    "cured-by-refund": 0,
    "asserted-passthrough-unverified": 0,
  };
  for (const f of sorted) verdictTally[f.verdict] += 1;
  return Object.freeze({
    specVersion: opts.specVersion,
    simulated: true,
    classification: opts.classification,
    assumedPurchasePriceBase: ASSUMED_PURCHASE_PRICE_BASE,
    findings: sorted,
    verdictTally: Object.freeze(verdictTally),
    ok: verdictTally.violation === 0,
  });
}

/** Canonical serialization — the single stringifier (byte-identity is meaningful). */
export function serializeFeeReport(report: FeeAuditReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

exec
/bin/zsh -lc "rg -n \"function serializeFeeReport|serializeFeeReport|claimId|claim\\.id|split\\(.*#\" lib/packs/fees lib/verifier-core components app evals/packs fixtures/synthetic-restaurant/fees" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
evals/packs/fees-audit-e1.test.ts:164:    const ids = report.findings.filter((f) => f.ruleId === "NYC-563.3-c-1").map((f) => f.claim.id);
evals/packs/fees-audit-e1.test.ts:177:    const ids = report.findings.filter((f) => f.ruleId === "NYC-563.3-d-1").map((f) => f.claim.id);
components/report/ReportView.tsx:58:            <span className="rpt-mono">{row.claimId}</span>
components/report/ReportView.tsx:179:          <FindingCard key={`${row.claimId}:${row.ruleId}`} row={row} index={i} />
lib/packs/fees/finding.ts:163:      a.claim.id.localeCompare(b.claim.id),
lib/packs/fees/finding.ts:192:export function serializeFeeReport(report: FeeAuditReport): string {
lib/verifier-core/guard.ts:48:  if (input.claim === undefined || input.claim === null || !isNonEmptyString(input.claim.id)) {
evals/packs/listings-differential-c3.test.ts:48:      (f.claim.id.startsWith(`${entry.targetFeedItemId}#`) ||
evals/packs/listings-differential-c3.test.ts:88:        (f.claim.id.startsWith(`${e.targetFeedItemId}#`) ||
lib/packs/fees/classified-audit.ts:58:import { auditStatement, claimIdPart, makeLineTagger } from "./audit.ts";
lib/packs/fees/classified-audit.ts:112:      id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag}#classifier`,
evals/packs/listings-property.test.ts:58:      (f) => f.category === "price" && f.claim.id.startsWith(`${target.item_id}#`),
evals/packs/listings-property.test.ts:96:      (f) => f.category === "availability" && f.claim.id.startsWith(`${target.item_id}#`),
lib/verifier-core/verify.ts:48:      a.claim.id.localeCompare(b.claim.id),
evals/packs/fees-classifier.test.ts:15:  serializeFeeReport,
evals/packs/fees-classifier.test.ts:157:    expect(serializeFeeReport(base)).toBe(serializeFeeReport(direct));
evals/packs/fees-classifier.test.ts:169:      expect(serializeFeeReport(auditStatement(build())), golden).toBe(goldenText);
evals/packs/fees-classifier.test.ts:180:      expect(f.claim.id.length).toBeGreaterThan(0);
evals/packs/fees-classifier.test.ts:222:    const ids = advisoryFindings.map((f) => f.claim.id);
evals/packs/fees-classifier.test.ts:274:    expect(base.findings.every((finding) => !finding.claim.id.includes("ORD-5"))).toBe(true);
components/demo/DemoView.tsx:40:            <span className="rpt-mono">{finding.claimId}</span>
components/demo/DemoView.tsx:89:            <Receipts key={`${f.claimId}:${f.ruleId}`} finding={f} index={i} />
evals/packs/fees-advisory-nits.test.ts:5:  claimIdPart,
evals/packs/fees-advisory-nits.test.ts:18: *     `claimIdPart` ('%'→'%25', '#'→'%23') — identity on every committed corpus
evals/packs/fees-advisory-nits.test.ts:20: *     via decodeURIComponent-style unescaping, so `id.split("#")` is unambiguous.
evals/packs/fees-advisory-nits.test.ts:28: * "ORD-9#promo#extra#L0" — split("#").length === 4, ambiguous (executed RED,
evals/packs/fees-advisory-nits.test.ts:60:describe("claimIdPart (nit 3: '#' in arbitrary id components)", () => {
evals/packs/fees-advisory-nits.test.ts:63:      expect(claimIdPart(s)).toBe(s);
evals/packs/fees-advisory-nits.test.ts:69:      expect(unescapePart(claimIdPart(s))).toBe(s);
evals/packs/fees-advisory-nits.test.ts:70:      expect(claimIdPart(s)).not.toContain("#");
evals/packs/fees-advisory-nits.test.ts:78:    const segments = d1!.claim.id.split("#");
evals/packs/fees-advisory-nits.test.ts:93:    const segments = report.advisoryFindings[0].claim.id.split("#");
lib/packs/fees/cli.ts:23:import { serializeFeeReport } from "./finding.ts";
lib/packs/fees/cli.ts:41:  const output = opts.json ? serializeFeeReport(report) : renderFeeReportText(report);
evals/packs/fees-coverage-c6.test.ts:43:        const e = det.find((e) => e.expectedClaimId === f.claim.id && e.expectedRuleId === f.ruleId);
evals/packs/fees-coverage-c6.test.ts:44:        expect(e, `${name}: unexplained finding ${f.claim.id} / ${f.ruleId}`).toBeDefined();
evals/packs/fees-coverage-c6.test.ts:52:          (f) => f.claim.id === e.expectedClaimId && f.ruleId === e.expectedRuleId,
evals/packs/fees-coverage-c6.test.ts:88:    const emittedClaimIds = new Set(report.findings.map((f) => f.claim.id));
lib/packs/fees/audit.ts:141: * `declaredCategory`): '%' → '%25', '#' → '%23'. Keeps `id.split("#")`
lib/packs/fees/audit.ts:146:export const claimIdPart = (s: string): string => s.replace(/%/g, "%25").replace(/#/g, "%23");
lib/packs/fees/audit.ts:181:        claim: { id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag(line)}`, source: "fee-statement", field: "declaredCategory", value: line.declaredCategory },
lib/packs/fees/audit.ts:230:              claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "passthroughDocumented", value: true },
lib/packs/fees/audit.ts:245:            claim: { id: `${claimIdPart(line.orderId)}#transaction_fee#${lineTag(line)}`, source: "fee-statement", field: "amountCents", value: line.amountCents },
evals/packs/report-view-c1.test.ts:119:      expect(row.claimId).toBe(f.claim.id);
evals/packs/report-view-c1.test.ts:129:      expect(row.claimId).not.toBe("");
evals/packs/ucp-conformance.test.ts:123:        expect(f.claim.id.length).toBeGreaterThan(0);
lib/packs/fees/generate.ts:51:  /** The exact claim.id the engine emits for this catch (null iff deferred). */
evals/packs/fees-freeze.test.ts:11:  serializeFeeReport,
evals/packs/fees-freeze.test.ts:46:      expect(read(golden)).toBe(serializeFeeReport(auditStatement(build())));
evals/packs/fees-freeze.test.ts:52:    expect(serializeFeeReport(auditStatement(s))).toBe(serializeFeeReport(auditStatement(s)));
lib/packs/fees/index.ts:77:  serializeFeeReport,
lib/packs/fees/index.ts:83:  claimIdPart,
evals/packs/listings-coverage-c6.test.ts:93:            (f.claim.id.startsWith(`${e.targetFeedItemId}#`) ||

exec
/bin/zsh -lc "sed -n '1,160p' scripts-ts/generate-fee-fixtures.mts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
/**
 * Fee-fixture generator — F1a (plan §8: seeded/deterministic corpus).
 *
 * Regenerates fixtures/synthetic-restaurant/fees/ from the pinned seed: the
 * faithful + drifted + cured + conditional monthly statements, the machine
 * answer key, and the four golden fee-audit reports. A freeze-integrity eval
 * byte-locks the committed fixtures to this generator, so the corpus cannot be
 * hand-tampered without CI failing.
 *
 * Run: node scripts-ts/generate-fee-fixtures.mts        (Node ≥ 24)
 *
 * Plain: the one script that rebuilds the whole fee corpus from its recipe.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildFaithfulStatement,
  buildDriftedStatement,
  buildCuredStatement,
  buildConditionalStatement,
  buildFeeAnswerKey,
  buildCorpusReports,
  serializeFeeReport,
} from "../lib/packs/fees/index.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "fixtures", "synthetic-restaurant", "fees");
mkdirSync(dir, { recursive: true });

const writeJson = (name: string, value: unknown): void => {
  writeFileSync(join(dir, name), `${JSON.stringify(value, null, 2)}\n`);
  process.stdout.write(`wrote ${name}\n`);
};

writeJson("statement.faithful.json", buildFaithfulStatement());
writeJson("statement.drifted.json", buildDriftedStatement());
writeJson("statement.cured.json", buildCuredStatement());
writeJson("statement.conditional.json", buildConditionalStatement());
writeJson("fee-answer-key.json", buildFeeAnswerKey());

const reports = buildCorpusReports();
for (const [statementName, report] of Object.entries(reports)) {
  const goldenName = statementName.replace(/^statement\./, "expected-report.");
  writeFileSync(join(dir, goldenName), serializeFeeReport(report));
  process.stdout.write(`wrote ${goldenName}\n`);
}

const drifted = reports["statement.drifted.json"];
process.stdout.write(
  `done: drifted findings=${drifted.findings.length} (violation ${drifted.verdictTally.violation}, ` +
    `conditional ${drifted.verdictTally["conditional-pending-refund-window"]}, cured ${drifted.verdictTally["cured-by-refund"]})\n`,
);

codex
Parser evidence supports the “throw is dead through parser-produced statements” premise: `parseStatement` builds the exact `lines` array that `auditStatement` iterates, and it rejects mixed months. I’m separately checking direct constructors and classifier advisory paths because those bypass parser guarantees.
exec
/bin/zsh -lc "rg -n 'line\\(|orderId|declaredCategory|expectedClaimId|[%#]' lib/packs/fees/generate.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
52:  readonly expectedClaimId: string | null;
86:function line(
87:  orderId: string,
88:  declaredCategory: string,
95:    orderId,
97:    declaredCategory,
112:      line("ORD-1", "delivery_fee", "Delivery fee", 300, 2000), // 15% exactly
113:      line("ORD-1", "basic_service_fee", "Basic service fee", 100, 2000), // 5%
114:      line("ORD-1", "transaction_fee", "Card processing", 60, 2000), // 3%
115:      line("ORD-1", "enhanced_service_fee", "Premium placement", 400, 2000), // 20%
116:      line("ORD-2", "delivery_fee", "Delivery fee", 300, 3000), // 10%
117:      line("ORD-2", "basic_service_fee", "Basic service fee", 90, 3000), // 3%
123: * DRIFTED: plants the six §7 classes. Delivery is systematically over 15% so the
125: * 3%; two lines use non-permitted categories (bundling + promotion-deduction);
133:      line("ORD-1", "delivery_fee", "Delivery fee", 360, 2000), // 18% (over 15%)
134:      line("ORD-1", "transaction_fee", "Card processing", 160, 2000), // 8% (over 3%)
135:      line("ORD-2", "delivery_fee", "Delivery fee", 360, 2000), // 18%
136:      line("ORD-2", "enhanced_service_fee", "Premium placement", 200, 2000), // 10% (within, but no basic → d-4)
137:      line("ORD-3", "delivery_fee", "Delivery fee", 360, 2000), // 18%
138:      line("ORD-3", "service_and_delivery", "Combined service + delivery bundle", 150, 2000), // d-1 bundling
139:      line("ORD-4", "delivery_fee", "Delivery fee", 360, 2000), // 18%
140:      line("ORD-4", "promotion_deduction", "Promo recovery charge", 120, 2000), // d-1 promotion-deduction
141:      line("ORD-5", "transaction_fee", "Fees (service + processing bundle)", 20, 1000), // 2% (within) — deferred bundling
142:      line("ORD-5", "enhanced_service_fee", "Marketing (formerly delivery)", 150, 1000), // 15% (within) — deferred relabeling
152:      line("ORD-C1", "delivery_fee", "Delivery fee", 360, 2000), // 18%
153:      line("ORD-C2", "delivery_fee", "Delivery fee", 360, 2000), // 18% → monthly over by $1.20
154:      line("ORD-C1", "delivery_fee", "Refund: delivery over-cap correction", 120, 2000, {
167:      line("ORD-K1", "delivery_fee", "Delivery fee", 360, 2000), // 18%
168:      line("ORD-K2", "delivery_fee", "Delivery fee", 360, 2000), // 18% → monthly over
184:          { id: "fee-drift-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "violation", targetOrderId: "ORD-1..ORD-4", note: "delivery fees average 16% of monthly purchases — over the 15% cap even on the monthly-average alternative; window closed, no refund" },
185:          { id: "fee-drift-002", feeClass: "processing-fee-base-inflation", detection: "deterministic", expectedClaimId: "ORD-1#transaction_fee#L1", expectedRuleId: "NYC-563.3-c-1", expectedVerdict: "violation", targetOrderId: "ORD-1", note: "transaction fee 8% > hard 3% cap, not documented as a pass-through (c-2); no safe harbor for c" },
186:          { id: "fee-drift-003", feeClass: "bundling", detection: "deterministic", expectedClaimId: "ORD-3#service_and_delivery#L5", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-3", note: "a lumped line under a non-permitted category label — caught by the d-1 category lock" },
187:          { id: "fee-drift-004", feeClass: "promotion-deduction-mischaracterization", detection: "deterministic", expectedClaimId: "ORD-4#promotion_deduction#L7", expectedRuleId: "NYC-563.3-d-1", expectedVerdict: "violation", targetOrderId: "ORD-4", note: "a charge dressed as a 'promotion deduction' is not a permitted fee category — d-1" },
188:          { id: "fee-drift-005", feeClass: "misclassification", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#enhanced-without-basic`, expectedRuleId: "NYC-563.3-d-4", expectedVerdict: "violation", targetOrderId: "ORD-2", note: "enhanced service fee charged with no basic service fee in the statement — d-4 gating clause" },
189:          { id: "fee-drift-006", feeClass: "bundling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "a within-cap line under a LEGAL category that actually bundles service + processing — unbundling needs the F1b line-item classifier; the deterministic spine sees only a compliant transaction fee" },
190:          { id: "fee-drift-007", feeClass: "relabeling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "an enhanced fee relabeled from delivery across periods; pure cross-month relabeling needs multi-month data + fee-change-notice records (g-1-iv is non-statement-checkable) — deferred" },
195:          { id: "fee-cure-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "cured-by-refund", targetOrderId: "ORD-C1,ORD-C2", note: "delivery over-cap fully refunded within the §20-563.3(e) 30-day window — not a violation" },
200:          { id: "fee-cond-001", feeClass: "over-cap", detection: "deterministic", expectedClaimId: `${CORPUS_MONTH}#delivery_fee`, expectedRuleId: "NYC-563.3-a-2", expectedVerdict: "conditional-pending-refund-window", targetOrderId: "ORD-K1,ORD-K2", note: "delivery over-cap evaluated while the 30-day window is still open — not yet a violation" },

exec
/bin/zsh -lc "rg -n 'orderId:|declaredCategory:|id:|expectedClaimId:|claimId|%|#' evals/gold/fee-lines-gold.ts evals/gold/fee-classifier-calibration.lock.test.ts evals/gold/fee-classifier-calibration.live.test.ts evals/gold/fee-baseline-measurement.test.ts | head -n 240" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
evals/gold/fee-baseline-measurement.test.ts:9: * set and computes per-category precision/recall/F1 + Wilson 95% CIs via the ported
evals/gold/fee-baseline-measurement.test.ts:30:    id: g.id,
evals/gold/fee-lines-gold.ts:35:  readonly id: string;
evals/gold/fee-lines-gold.ts:55:  id: string,
evals/gold/fee-lines-gold.ts:60:    declaredCategory: DeclaredCategory;
evals/gold/fee-lines-gold.ts:74:      declaredCategory: opts.declaredCategory,
evals/gold/fee-lines-gold.ts:91:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:92:    amountCents: 500, // 25% of 2000 — over the 15% cap
evals/gold/fee-lines-gold.ts:98:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:99:    amountCents: 200, // 10% of 2000 — over the 5% cap
evals/gold/fee-lines-gold.ts:105:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:106:    amountCents: 600, // 30% of 2000 — over the 20% cap
evals/gold/fee-lines-gold.ts:112:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:119:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:126:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:136:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:143:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:150:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:157:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:164:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:171:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:184:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:191:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:198:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:205:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:212:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:219:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:229:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:236:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:243:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:250:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:257:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:264:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:274:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:281:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:288:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:295:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:302:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:309:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:319:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:320:    amountCents: 300, // 15% of 2000 — over the hard 3% cap
evals/gold/fee-lines-gold.ts:326:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:333:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:340:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:347:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:354:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:364:    declaredCategory: "delivery_fee",
evals/gold/fee-lines-gold.ts:365:    amountCents: 250, // 12.5% — within the 15% cap
evals/gold/fee-lines-gold.ts:371:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:372:    amountCents: 80, // 4% — within the 5% cap
evals/gold/fee-lines-gold.ts:378:    declaredCategory: "transaction_fee",
evals/gold/fee-lines-gold.ts:379:    amountCents: 50, // 2.5% — within the 3% cap
evals/gold/fee-lines-gold.ts:385:    declaredCategory: "enhanced_service_fee",
evals/gold/fee-lines-gold.ts:386:    amountCents: 300, // 15% — within the 20% cap
evals/gold/fee-lines-gold.ts:392:    declaredCategory: "basic_service_fee",
evals/gold/fee-lines-gold.ts:399:    declaredCategory: "delivery_fee",
evals/gold/fee-classifier-calibration.live.test.ts:58:  id: string;
evals/gold/fee-classifier-calibration.live.test.ts:72:    id: item.id,
evals/gold/fee-classifier-calibration.live.test.ts:100:      // INCIDENT LESSON (2026-07-05, run #1): the first armed pass completed all 84
evals/gold/fee-classifier-calibration.live.test.ts:122:        `tune-phase fallback(s): ${JSON.stringify(tuneRecords.filter((r) => r.modes.some((m) => m !== "LIVE_CLASSIFIER")).map((r) => ({ id: r.id, errors: r.errorClasses })))}`,
evals/gold/fee-classifier-calibration.live.test.ts:134:        .map((r) => ({ id: r.id, errors: r.errorClasses }));
evals/gold/fee-classifier-calibration.live.test.ts:138:        records.map((r) => ({ id: r.id, predicted: r.predicted, actual: r.trueCategory }));
evals/gold/fee-classifier-calibration.live.test.ts:233:          .map((it) => ({ id: it.id, predicted: it.predicted, actual: it.actual })),
evals/gold/fee-classifier-calibration.lock.test.ts:7: * EVAL-LOCK for the F1b live-classifier calibration run #2 (2026-07-05) — the
evals/gold/fee-classifier-calibration.lock.test.ts:22:  id: string;
evals/gold/fee-classifier-calibration.lock.test.ts:43:  misses: { id: string; predicted: string; actual: string }[];
evals/gold/fee-classifier-calibration.lock.test.ts:50:describe("F1b calibration eval-lock — the frozen run #2 record (R-DHON-4)", () => {
evals/gold/fee-classifier-calibration.lock.test.ts:52:    id: r.id,
evals/gold/fee-classifier-calibration.lock.test.ts:104:      { id: "relabel-test-2", predicted: "not-a-permitted-fee", actual: "enhanced_service_fee" },

codex
The sandbox is read-only enough that shell here-docs fail because zsh tries to create temp files. I’m switching to `node -e` one-liners so the verification stays read-only and reproducible.
exec
/bin/zsh -lc "rg -n 'orderId:\\s*\"["'^"]*[#%]|declaredCategory:'"\\s*\"["'^"]*[#%]|id:'"\\s*\"["'^"]*[#%]|expectedClaimId:'"\\s*\"["'^"]*%|claimId:'"\\s*\"["'^"]*%'"' evals/gold lib/packs/fees/generate.ts fixtures/synthetic-restaurant/fees" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 exited 1 in 0ms:
exec
/bin/zsh -lc "rg -n 'orderId:\\s*\"|declaredCategory:\\s*\"|month:\\s*\"|id:\\s*\"|expectedClaimId:\\s*\"' evals/gold/fee-lines-gold.ts | sed -n '1,220p'" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
91:    declaredCategory: "delivery_fee",
98:    declaredCategory: "basic_service_fee",
105:    declaredCategory: "enhanced_service_fee",
112:    declaredCategory: "delivery_fee",
119:    declaredCategory: "basic_service_fee",
126:    declaredCategory: "enhanced_service_fee",
136:    declaredCategory: "delivery_fee",
143:    declaredCategory: "basic_service_fee",
150:    declaredCategory: "transaction_fee",
157:    declaredCategory: "delivery_fee",
164:    declaredCategory: "enhanced_service_fee",
171:    declaredCategory: "basic_service_fee",
184:    declaredCategory: "delivery_fee",
191:    declaredCategory: "enhanced_service_fee",
198:    declaredCategory: "basic_service_fee",
205:    declaredCategory: "transaction_fee",
212:    declaredCategory: "delivery_fee",
219:    declaredCategory: "enhanced_service_fee",
229:    declaredCategory: "basic_service_fee",
236:    declaredCategory: "delivery_fee",
243:    declaredCategory: "enhanced_service_fee",
250:    declaredCategory: "transaction_fee",
257:    declaredCategory: "basic_service_fee",
264:    declaredCategory: "delivery_fee",
274:    declaredCategory: "delivery_fee",
281:    declaredCategory: "basic_service_fee",
288:    declaredCategory: "enhanced_service_fee",
295:    declaredCategory: "transaction_fee",
302:    declaredCategory: "delivery_fee",
309:    declaredCategory: "basic_service_fee",
319:    declaredCategory: "transaction_fee",
326:    declaredCategory: "transaction_fee",
333:    declaredCategory: "transaction_fee",
340:    declaredCategory: "transaction_fee",
347:    declaredCategory: "transaction_fee",
354:    declaredCategory: "transaction_fee",
364:    declaredCategory: "delivery_fee",
371:    declaredCategory: "basic_service_fee",
378:    declaredCategory: "transaction_fee",
385:    declaredCategory: "enhanced_service_fee",
392:    declaredCategory: "basic_service_fee",
399:    declaredCategory: "delivery_fee",

exec
/bin/zsh -lc "node -e 'const fs=require(\"fs\"),path=require(\"path\"); const dir=\"fixtures/synthetic-restaurant/fees\"; const hits=[]; function walk(v,p){ if(typeof v===\"string\"&&/[#%]/.test(v)) hits.push("'`${p}: ${v}`); else if(Array.isArray(v)) v.forEach((x,i)=>walk(x,`${p}[${i}]`)); else if(v&&typeof v==="object") for(const [k,x] of Object.entries(v)) walk(x,p?`${p}.${k}`:k); } for(const name of fs.readdirSync(dir)){ if(!name.endsWith(".json")) continue; walk(JSON.parse(fs.readFileSync(path.join(dir,name),"utf8")),name); } console.log(hits.join("'"\\n\"));'" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "node -e 'const fs=require(\"fs\"),path=require(\"path\"); const dir=\"fixtures/synthetic-restaurant/fees\"; const bad=[]; for (const name of fs.readdirSync(dir)) { if("'!name.endsWith(".json")||!name.startsWith("statement.")) continue; const d=JSON.parse(fs.readFileSync(path.join(dir,name),"utf8")); const ck=(field,value,where)=>{ if(typeof value==="string"&&/[#%]/.test(value)) bad.push({where,field,value}); }; ck("meta.month",d.meta&&d.meta.month,`${name}:meta`); (d.lines||[]).forEach((l,i)=>{ ck("orderId",l.orderId,`${name}:lines[${i}]`); ck("declaredCategory",l.declaredCategory,`${name}:lines[${i}]`); ck("month",l.month,`${name}:lines[${i}]`); }); } console.log(JSON.stringify({badComponents:bad},null,2));'"'" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 156ms:
{
  "badComponents": []
}

 succeeded in 156ms:
expected-report.conditional.json.findings[0].claim.id: 2026-06#delivery_fee
expected-report.conditional.json.findings[0].plainLine: Across the month, delivery fees came to 18.0% of order value — over the 15% limit even on the monthly average. It's not a violation yet — the platform still has until 2026-07-30 to refund the excess. (Depends on the still-open definition of "purchase price", U1.)
expected-report.conditional.json.findings[0].professionalLine: Delivery fees total $7.20 on $40.00 of monthly purchases = 18.0% vs the 15% cap (NYC-563.3-a-2); over-cap under the ASSUMED base "order item subtotal before discounts, excluding tax and tip (ASSUMED — U1 unresolved)" — PROVISIONAL (U1); conditional — pending the 30-day refund window (closes 2026-07-30).
expected-report.cured.json.findings[0].claim.id: 2026-06#delivery_fee
expected-report.cured.json.findings[0].plainLine: Across the month, delivery fees came to 18.0% of order value — over the 15% limit even on the monthly average. The excess was refunded in time, so this is not a violation. (Depends on the still-open definition of "purchase price", U1.)
expected-report.cured.json.findings[0].professionalLine: Delivery fees total $7.20 on $40.00 of monthly purchases = 18.0% vs the 15% cap (NYC-563.3-a-2); over-cap under the ASSUMED base "order item subtotal before discounts, excluding tax and tip (ASSUMED — U1 unresolved)" — PROVISIONAL (U1); cured by a refund within the 30-day window (not a violation).
expected-report.drifted.json.findings[0].claim.id: ORD-3#service_and_delivery#L5
expected-report.drifted.json.findings[1].claim.id: 2026-06#enhanced-without-basic
expected-report.drifted.json.findings[2].claim.id: 2026-06#delivery_fee
expected-report.drifted.json.findings[2].plainLine: Across the month, delivery fees came to 16.0% of order value — over the 15% limit even on the monthly average. The 30-day window to refund the overcharge has closed with no refund, so this is a violation. (Depends on the still-open definition of "purchase price", U1.)
expected-report.drifted.json.findings[2].professionalLine: Delivery fees total $14.40 on $90.00 of monthly purchases = 16.0% vs the 15% cap (NYC-563.3-a-2); over-cap under the ASSUMED base "order item subtotal before discounts, excluding tax and tip (ASSUMED — U1 unresolved)" — PROVISIONAL (U1); violation (the 30-day refund window has closed with no covering refund).
expected-report.drifted.json.findings[3].claim.id: ORD-1#transaction_fee#L1
expected-report.drifted.json.findings[3].plainLine: The card-processing fee here is 8.0% — over the flat 3% limit, with no proof it's just passing through the real card cost. (This depends on what "purchase price" includes — still an open question, U1.)
expected-report.drifted.json.findings[3].professionalLine: Transaction fee $1.60 on order ORD-1 is 8.0% of the purchase price — over the hard 3% cap, not documented as a pass-through (§20-563.3(c)); over-cap under the ASSUMED base "order item subtotal before discounts, excluding tax and tip (ASSUMED — U1 unresolved)" — PROVISIONAL (U1). No refund safe harbor applies to the transaction fee.
expected-report.drifted.json.findings[4].claim.id: ORD-4#promotion_deduction#L7
fee-answer-key.json.statements.statement.drifted.json.entries[0].expectedClaimId: 2026-06#delivery_fee
fee-answer-key.json.statements.statement.drifted.json.entries[0].note: delivery fees average 16% of monthly purchases — over the 15% cap even on the monthly-average alternative; window closed, no refund
fee-answer-key.json.statements.statement.drifted.json.entries[1].expectedClaimId: ORD-1#transaction_fee#L1
fee-answer-key.json.statements.statement.drifted.json.entries[1].note: transaction fee 8% > hard 3% cap, not documented as a pass-through (c-2); no safe harbor for c
fee-answer-key.json.statements.statement.drifted.json.entries[2].expectedClaimId: ORD-3#service_and_delivery#L5
fee-answer-key.json.statements.statement.drifted.json.entries[3].expectedClaimId: ORD-4#promotion_deduction#L7
fee-answer-key.json.statements.statement.drifted.json.entries[4].expectedClaimId: 2026-06#enhanced-without-basic
fee-answer-key.json.statements.statement.cured.json.entries[0].expectedClaimId: 2026-06#delivery_fee
fee-answer-key.json.statements.statement.conditional.json.entries[0].expectedClaimId: 2026-06#delivery_fee

exec
/bin/zsh -lc "sed -n '1,240p' evals/packs/fees-audit-e1.test.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "sed -n '1,130p' evals/packs/fees-finding-u1.test.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "sed -n '1,130p' evals/gold/fee-lines-gold.ts && sed -n '130,430p' evals/gold/fee-lines-gold.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BASE_DERIVED_RULE_IDS,
  MissingProvisionalMarkerError,
  PROVISIONAL_U1,
  PURCHASE_PRICE_BASE_STATUS,
  makeFeeFinding,
  type FeeFindingInput,
} from "@/lib/packs/fees";
import { MissingEvidenceError } from "@/lib/verifier-core";

/**
 * U1 PROVISIONALITY, structural (plan F1a item 5), RED-GREEN: makeFeeFinding
 * wraps the core C2 guard (makeFinding) AND requires the U1 provisional marker on
 * any finding from a base-derived rule — a base-derived over-cap cannot exist as
 * an unqualified violation.
 */

const baseInput = (over: Partial<FeeFindingInput>): FeeFindingInput => ({
  claim: { id: "2026-06#delivery_fee", source: "fee-statement", field: "monthlyAverage", value: 1 },
  referenceRowId: "§ 20-563.3(a) (averaging clause)",
  ruleId: "NYC-563.3-a-2", // base-derived
  severity: "error",
  verdict: "violation",
  feeClass: "over-cap",
  professionalLine: "professional",
  plainLine: "plain",
  ...over,
});

describe("U1: base-derived findings REQUIRE the provisional marker", () => {
  it("RED: a base-derived rule without the U1 marker throws", () => {
    expect(() => makeFeeFinding(baseInput({}))).toThrow(MissingProvisionalMarkerError);
    expect(() => makeFeeFinding(baseInput({ provisional: ["something-else"] }))).toThrow(
      MissingProvisionalMarkerError,
    );
  });

  it("GREEN: the same finding WITH the U1 marker constructs", () => {
    const f = makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1] }));
    expect(f.provisional).toContain(PROVISIONAL_U1);
    expect(f.verdict).toBe("violation");
  });

  it("a NON-base-derived rule (d-1) does not require the marker", () => {
    const f = makeFeeFinding(
      baseInput({
        ruleId: "NYC-563.3-d-1",
        referenceRowId: "§ 20-563.3(d) (category lock)",
        feeClass: "bundling",
      }),
    );
    expect(f.provisional).toEqual([]);
  });

  it("the U1 marker is ONE constant, and the status flag is unresolved-U1", () => {
    expect(PROVISIONAL_U1).toBe("U1-base");
    expect(PURCHASE_PRICE_BASE_STATUS).toBe("unresolved-U1");
  });
});

describe("U1: makeFeeFinding still enforces the core C2 receipts + two registers", () => {
  it("a missing C2 receipt throws the core MissingEvidenceError", () => {
    expect(() =>
      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], referenceRowId: "" })),
    ).toThrow(MissingEvidenceError);
  });

  it("a missing professional or plain line throws (two-register standard)", () => {
    expect(() =>
      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], professionalLine: "  " })),
    ).toThrow(MissingProvisionalMarkerError);
    expect(() =>
      makeFeeFinding(baseInput({ provisional: [PROVISIONAL_U1], plainLine: "" })),
    ).toThrow(MissingProvisionalMarkerError);
  });
});

describe("U1: every base-derived finding in the frozen goldens carries the marker", () => {
  const dir = join(process.cwd(), "fixtures", "synthetic-restaurant", "fees");
  it("no golden report has a base-derived finding without U1-base", () => {
    for (const name of ["drifted", "cured", "conditional", "faithful"]) {
      const report = JSON.parse(readFileSync(join(dir, `expected-report.${name}.json`), "utf8")) as {
        findings: { ruleId: string; provisional: string[] }[];
      };
      for (const f of report.findings) {
        if (BASE_DERIVED_RULE_IDS.has(f.ruleId)) {
          expect(f.provisional, `${name}: ${f.ruleId} missing U1-base`).toContain(PROVISIONAL_U1);
        }
      }
    }
  });
});

 succeeded in 0ms:
import { describe, expect, it } from "vitest";
import {
  auditStatement,
  buildFaithfulStatement,
  type MonthlyStatement,
  type StatementLine,
} from "@/lib/packs/fees";

/**
 * e-1 REFUND-WINDOW AS VERDICT STATE (plan F1a item 6), RED-GREEN: a monthly
 * over-cap on a/b/d is a state, not a fixed verdict — cured-by-refund /
 * conditional-pending-refund-window / violation. The transaction fee (c) gets NO
 * safe harbor (asserted). The faithful statement produces zero findings.
 */

const line = (over: Partial<StatementLine>): StatementLine => ({
  orderId: "ORD-1",
  month: "2026-06",
  declaredCategory: "delivery_fee",
  label: "Delivery fee",
  amountCents: 360,
  orderPurchasePriceCents: 2000,
  isRefund: false,
  passthroughDocumented: false,
  ...over,
});

const meta = (asOf: string): MonthlyStatement["meta"] => ({
  simulated: true,
  generator: { name: "test", seed: 1, version: "1.0.0" },
  merchant: "Test (simulated)",
  month: "2026-06",
  currency: "USD",
  asOf,
  purchasePriceBaseConvention: "assumed base",
});

// Two orders, delivery 18% each → monthly average 18% > 15% → over cap.
const overCapLines: readonly StatementLine[] = [
  line({ orderId: "ORD-1", amountCents: 360, orderPurchasePriceCents: 2000 }),
  line({ orderId: "ORD-2", amountCents: 360, orderPurchasePriceCents: 2000 }),
];
// Excess: 720*100 - 15*4000 = 72000 - 60000 = 12000 → $1.20 excess.

function deliveryVerdict(report: ReturnType<typeof auditStatement>): string | undefined {
  return report.findings.find((f) => f.ruleId === "NYC-563.3-a-2")?.verdict;
}

describe("e-1 verdict states (a/b/d over-cap)", () => {
  it("VIOLATION: window closed (asOf after +30d), no refund", () => {
    const report = auditStatement({ meta: meta("2026-08-15"), lines: [...overCapLines] });
    expect(deliveryVerdict(report)).toBe("violation");
    expect(report.ok).toBe(false);
  });

  it("CONDITIONAL: window still open (asOf inside +30d), no refund → NOT a violation", () => {
    const report = auditStatement({ meta: meta("2026-07-10"), lines: [...overCapLines] });
    expect(deliveryVerdict(report)).toBe("conditional-pending-refund-window");
    expect(report.ok).toBe(true); // conditional is not yet a violation
  });

  it("CURED: excess refunded within the window, evaluated after close → NOT a violation", () => {
    const report = auditStatement({
      meta: meta("2026-08-15"),
      lines: [
        ...overCapLines,
        line({
          orderId: "ORD-1",
          declaredCategory: "delivery_fee",
          label: "Refund",
          amountCents: 120, // covers the $1.20 excess
          isRefund: true,
          refundedAtDate: "2026-07-15", // within window (closes 2026-07-30)
        }),
      ],
    });
    expect(deliveryVerdict(report)).toBe("cured-by-refund");
    expect(report.ok).toBe(true);
  });

  it("a refund DATED AFTER the window does NOT cure (still a violation)", () => {
    const report = auditStatement({
      meta: meta("2026-08-15"),
      lines: [
        ...overCapLines,
        line({
          orderId: "ORD-1",
          label: "Late refund",
          amountCents: 120,
          isRefund: true,
          refundedAtDate: "2026-08-01", // after 2026-07-30
        }),
      ],
    });
    expect(deliveryVerdict(report)).toBe("violation");
  });

  it("a PARTIAL refund (below the excess) does not cure", () => {
    const report = auditStatement({
      meta: meta("2026-08-15"),
      lines: [
        ...overCapLines,
        line({ orderId: "ORD-1", label: "Partial refund", amountCents: 50, isRefund: true, refundedAtDate: "2026-07-15" }),
      ],
    });
    expect(deliveryVerdict(report)).toBe("violation");
  });
});

describe("e-1: transaction fee (c) gets NO safe harbor", () => {
  it("a c over-cap is a VIOLATION even with a refund inside the window", () => {
    const report = auditStatement({
      meta: meta("2026-07-10"), // window open — would be conditional for a/b/d
      lines: [
        line({ orderId: "ORD-1", declaredCategory: "transaction_fee", label: "Card processing", amountCents: 160, orderPurchasePriceCents: 2000 }), // 8% > 3%
        line({ orderId: "ORD-1", declaredCategory: "transaction_fee", label: "Refund", amountCents: 200, isRefund: true, refundedAtDate: "2026-07-15" }),
      ],
    });
    const c = report.findings.find((f) => f.ruleId === "NYC-563.3-c-1");
    expect(c?.verdict).toBe("violation");
    expect(report.ok).toBe(false);
  });

  it("an asserted pass-through (c-2) above 3% is SURFACED as a non-gating warn — never silently cleared, never a violation (M2 finding #1)", () => {
    const report = auditStatement({
      meta: meta("2026-08-15"),
      lines: [
        line({ orderId: "ORD-1", declaredCategory: "transaction_fee", label: "Card processing (pass-through)", amountCents: 160, orderPurchasePriceCents: 2000, passthroughDocumented: true }),
      ],
    });
    // Not a c-1 violation…
    expect(report.findings.some((f) => f.ruleId === "NYC-563.3-c-1")).toBe(false);
    // …but the reliance on the ASSERTED flag is visible, warn-severity, non-gating.
    const c2 = report.findings.find((f) => f.ruleId === "NYC-563.3-c-2");
    expect(c2?.severity).toBe("warn");
    expect(c2?.verdict).toBe("asserted-passthrough-unverified");
    expect(c2?.claim.field).toBe("passthroughDocumented");
    expect(c2?.professionalLine).toMatch(/asserted/i);
    expect(report.ok).toBe(true); // a warn is not a violation — ok is unaffected
    expect(report.verdictTally["asserted-passthrough-unverified"]).toBe(1);
  });

  it("a pass-through-asserted fee AT/UNDER 3% produces NO finding at all (the warn fires only over the cap)", () => {
    const report = auditStatement({
      meta: meta("2026-08-15"),
      lines: [
        line({ orderId: "ORD-1", declaredCategory: "transaction_fee", label: "Card processing (pass-through)", amountCents: 60, orderPurchasePriceCents: 2000, passthroughDocumented: true }),
      ],
    });
    expect(report.findings).toHaveLength(0);
    expect(report.ok).toBe(true);
  });
});

describe("claim-id uniqueness (C2 traceability; M2 finding #4)", () => {
  it("two same-order, same-category over-cap transaction lines yield DISTINCT claim ids", () => {
    const report = auditStatement({
      meta: meta("2026-08-15"),
      lines: [
        line({ orderId: "ORD-1", declaredCategory: "transaction_fee", label: "Card processing A", amountCents: 160, orderPurchasePriceCents: 2000 }),
        line({ orderId: "ORD-1", declaredCategory: "transaction_fee", label: "Card processing B", amountCents: 170, orderPurchasePriceCents: 2000 }),
      ],
    });
    const ids = report.findings.filter((f) => f.ruleId === "NYC-563.3-c-1").map((f) => f.claim.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2); // RED without the statement-position tag
  });

  it("two same-order, same-unlawful-category lines (d-1) yield DISTINCT claim ids", () => {
    const report = auditStatement({
      meta: meta("2026-08-15"),
      lines: [
        line({ orderId: "ORD-1", declaredCategory: "marketing_fee", label: "Marketing A", amountCents: 100 }),
        line({ orderId: "ORD-1", declaredCategory: "marketing_fee", label: "Marketing B", amountCents: 120 }),
      ],
    });
    const ids = report.findings.filter((f) => f.ruleId === "NYC-563.3-d-1").map((f) => f.claim.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});

describe("e-1: the faithful statement is clean", () => {
  it("buildFaithfulStatement() audits to zero findings, ok true", () => {
    const report = auditStatement(buildFaithfulStatement());
    expect(report.findings).toHaveLength(0);
    expect(report.ok).toBe(true);
  });
});

 succeeded in 0ms:
/**
 * GOLD SET for the F1b fee line-item classifier (plan §5 F1, C8; §7 fee-line
 * classes). Typed TS LITERALS (legacy `semantic-judge-gold.ts` pattern), stratified
 * across all SIX §7 fee-line drift classes plus a clean-negative stratum, each
 * item carrying the {@link ClassifierInput}-shape line fields, its DECLARED
 * category, its TRUE category label, the §7 class it exercises, and a rationale.
 *
 * HONESTY (AM-7 / C8): every label text is SYNTHETIC/simulated (realistic platform
 * wording, no real merchant or platform data). This gold set is SMALL and
 * SYNTHETIC — it bounds what can be claimed: it supports an offline deterministic-
 * baseline measurement (this slice) and gives an owner-gated LIVE run something
 * pre-registered to beat; it is NOT a statistically sufficient sample of real
 * platform fee-line text, and no claim here says otherwise.
 *
 * TUNE/TEST SPLIT: disjoint by construction (every item has exactly one `split`),
 * stratified — every one of the six §7 classes plus the clean stratum appears in
 * BOTH splits with the same per-class count (3 tune + 3 test per §7 class; 3 tune +
 * 3 test clean negatives — 42 items total). Composition is enforced by
 * `fee-lines-gold-composition.test.ts` (per-class-per-split counts, disjointness,
 * pinned-ID equality) — the slice-2 close-out pattern.
 */
import {
  FEE_LINE_CLASSES,
  NOT_A_PERMITTED_FEE,
  type ClassifierInput,
  type DeclaredCategory,
  type FeeLineClass,
  type TrueCategoryLabel,
} from "@/lib/packs/fees";

/** The stratum a gold item exercises: one of the six §7 drift classes, or "clean" (no drift). */
export type GoldStratum = FeeLineClass | "clean";

export interface FeeLineGoldItem {
  readonly id: string;
  readonly stratum: GoldStratum;
  readonly split: "tune" | "test";
  /** The line's face — exactly the {@link ClassifierInput} shape (leak-free). */
  readonly input: ClassifierInput;
  /** The TRUE category label a correct classifier must predict. */
  readonly trueCategory: TrueCategoryLabel;
  /** Why this true label is correct — the audit-trail rationale (few-shot material for the live design). */
  readonly rationale: string;
}

/** Benign default sibling context: a normal 4-category monthly statement. */
const DEFAULT_SIBLINGS: readonly DeclaredCategory[] = [
  "delivery_fee",
  "basic_service_fee",
  "transaction_fee",
  "enhanced_service_fee",
];

function item(
  id: string,
  stratum: GoldStratum,
  split: "tune" | "test",
  opts: {
    label: string;
    declaredCategory: DeclaredCategory;
    amountCents: number;
    orderPurchasePriceCents?: number;
    trueCategory: TrueCategoryLabel;
    rationale: string;
    siblingDeclaredCategories?: readonly DeclaredCategory[];
  },
): FeeLineGoldItem {
  return {
    id,
    stratum,
    split,
    input: {
      label: opts.label,
      declaredCategory: opts.declaredCategory,
      amountCents: opts.amountCents,
      orderPurchasePriceCents: opts.orderPurchasePriceCents ?? 2000,
      isRefund: false,
      passthroughDocumented: false,
      siblingDeclaredCategories: opts.siblingDeclaredCategories ?? DEFAULT_SIBLINGS,
    },
    trueCategory: opts.trueCategory,
    rationale: opts.rationale,
  };
}

export const FEE_LINES_GOLD: readonly FeeLineGoldItem[] = [
  // ── over-cap: true == the DECLARED legal category (the drift is the AMOUNT, not
  // the category — a correct classifier CONFIRMS the declared category). ────────
  item("overcap-tune-1", "over-cap", "tune", {
    label: "Delivery fee",
    declaredCategory: "delivery_fee",
    amountCents: 500, // 25% of 2000 — over the 15% cap
    trueCategory: "delivery_fee",
    rationale: "Plainly-labeled delivery fee; over cap by amount only — category is correctly delivery_fee.",
  }),
  item("overcap-tune-2", "over-cap", "tune", {
    label: "Basic service fee",
    declaredCategory: "basic_service_fee",
    amountCents: 200, // 10% of 2000 — over the 5% cap
    trueCategory: "basic_service_fee",
    rationale: "Plainly-labeled basic service fee; over cap by amount only.",
  }),
  item("overcap-tune-3", "over-cap", "tune", {
    label: "Enhanced service fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 600, // 30% of 2000 — over the 20% cap
    trueCategory: "enhanced_service_fee",
    rationale: "Plainly-labeled enhanced service fee; over cap by amount only.",
  }),
  item("overcap-test-1", "over-cap", "test", {
    label: "Courier delivery charge",
    declaredCategory: "delivery_fee",
    amountCents: 480,
    trueCategory: "delivery_fee",
    rationale: "Courier wording still names delivery; over cap by amount only.",
  }),
  item("overcap-test-2", "over-cap", "test", {
    label: "Listing & search fee",
    declaredCategory: "basic_service_fee",
    amountCents: 180,
    trueCategory: "basic_service_fee",
    rationale: "Listing/search wording names the basic-service tier; over cap by amount only.",
  }),
  item("overcap-test-3", "over-cap", "test", {
    label: "Enhanced marketing service fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 620,
    trueCategory: "enhanced_service_fee",
    rationale: "'Enhanced' wording names the enhanced tier; over cap by amount only.",
  }),
  }),

  // ── misclassification: true is a DIFFERENT legal category than declared, or
  // not-a-permitted-fee (the charge's true nature was never what was declared). ──
  item("misclass-tune-1", "misclassification", "tune", {
    label: "Marketing boost",
    declaredCategory: "delivery_fee",
    amountCents: 150,
    trueCategory: "enhanced_service_fee",
    rationale: "A marketing/boost charge booked under delivery_fee; it is truly an optional enhanced-tier extra.",
  }),
  item("misclass-tune-2", "misclassification", "tune", {
    label: "Card processing surcharge",
    declaredCategory: "basic_service_fee",
    amountCents: 60,
    trueCategory: "transaction_fee",
    rationale: "A card-processing surcharge booked under basic_service_fee; it is truly a transaction fee.",
  }),
  item("misclass-tune-3", "misclassification", "tune", {
    label: "Photography upgrade fee",
    declaredCategory: "transaction_fee",
    amountCents: 90,
    trueCategory: "enhanced_service_fee",
    rationale: "A photo-upgrade extra booked under transaction_fee; it is truly an enhanced-tier extra.",
  }),
  item("misclass-test-1", "misclassification", "test", {
    label: "Premium placement fee",
    declaredCategory: "delivery_fee",
    amountCents: 140,
    trueCategory: "enhanced_service_fee",
    rationale: "'Premium placement' is a marketing/visibility extra booked under delivery_fee.",
  }),
  item("misclass-test-2", "misclassification", "test", {
    label: "Payment gateway fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 55,
    trueCategory: "transaction_fee",
    rationale: "A payment-gateway charge booked under enhanced_service_fee; it is truly a transaction fee.",
  }),
  item("misclass-test-3", "misclassification", "test", {
    label: "Same-day courier fee",
    declaredCategory: "basic_service_fee",
    amountCents: 260,
    trueCategory: "delivery_fee",
    rationale: "A courier/delivery charge booked under basic_service_fee; it is truly a delivery fee.",
  }),

  // ── relabeling: true is a different legal category than the DECLARED legal
  // category — the cross-period-relabel flavor (a charge renamed/re-declared under
  // a different legal label from one period to the next; here exercised as a
  // single mislabeled instance since a single statement cannot show the "across
  // months" element — see plan-f1b-classifier.md's scope note). ──────────────────
  item("relabel-tune-1", "relabeling", "tune", {
    label: "Delivery & fulfillment fee",
    declaredCategory: "delivery_fee",
    amountCents: 130,
    trueCategory: "enhanced_service_fee",
    rationale: "'Fulfillment' wording covers a re-declared enhanced-tier charge kept under the delivery_fee label across periods.",
  }),
  item("relabel-tune-2", "relabeling", "tune", {
    label: "Delivery service fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 250,
    trueCategory: "delivery_fee",
    rationale: "The label swapped the other way: a genuine delivery charge re-declared as enhanced_service_fee.",
  }),
  item("relabel-tune-3", "relabeling", "tune", {
    label: "Enhanced visibility fee",
    declaredCategory: "basic_service_fee",
    amountCents: 70,
    trueCategory: "enhanced_service_fee",
    rationale: "'Enhanced visibility' names the enhanced tier, re-declared under basic_service_fee.",
  }),
  item("relabel-test-1", "relabeling", "test", {
    label: "Basic service charge",
    declaredCategory: "transaction_fee",
    amountCents: 65,
    trueCategory: "basic_service_fee",
    rationale: "A basic-listing charge re-declared under transaction_fee.",
  }),
  item("relabel-test-2", "relabeling", "test", {
    label: "Service & delivery relabel fee",
    declaredCategory: "delivery_fee",
    amountCents: 145,
    trueCategory: "enhanced_service_fee",
    rationale: "Relabeled service charge kept under the delivery_fee category across periods.",
  }),
  item("relabel-test-3", "relabeling", "test", {
    label: "Standard delivery fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 240,
    trueCategory: "delivery_fee",
    rationale: "'Standard delivery' is a genuine delivery charge re-declared as enhanced_service_fee.",
  }),

  // ── bundling: true = not-a-permitted-fee (a single lumped line is no ONE
  // permitted category). ───────────────────────────────────────────────────────
  item("bundle-tune-1", "bundling", "tune", {
    label: "Service & delivery bundle",
    declaredCategory: "basic_service_fee",
    amountCents: 300,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Lumps a service charge and a delivery charge into one line — no single permitted category applies.",
  }),
  item("bundle-tune-2", "bundling", "tune", {
    label: "Combined delivery + processing fee",
    declaredCategory: "delivery_fee",
    amountCents: 280,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Lumps delivery and processing into one line — no single permitted category applies.",
  }),
  item("bundle-tune-3", "bundling", "tune", {
    label: "All-in-one platform fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 400,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "An undifferentiated all-in-one charge — no single permitted category applies.",
  }),
  item("bundle-test-1", "bundling", "test", {
    label: "Bundled service charge",
    declaredCategory: "transaction_fee",
    amountCents: 90,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Generic 'bundled' wording signals a lumped, non-single-category charge.",
  }),
  item("bundle-test-2", "bundling", "test", {
    label: "Delivery & marketing combo fee",
    declaredCategory: "basic_service_fee",
    amountCents: 320,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Lumps delivery and marketing into one line — no single permitted category applies.",
  }),
  item("bundle-test-3", "bundling", "test", {
    label: "Full-service bundled fee",
    declaredCategory: "delivery_fee",
    amountCents: 350,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "'Full-service bundled' signals multiple charges lumped into one line.",
  }),

  // ── promotion-deduction-mischaracterization: true = not-a-permitted-fee (a promo
  // deduction dressed as a fee is not a permitted fee category at all). ─────────
  item("promo-tune-1", "promotion-deduction-mischaracterization", "tune", {
    label: "Promo adjustment",
    declaredCategory: "delivery_fee",
    amountCents: 120,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "A promotion-deduction dressed as a delivery fee — not a permitted fee category.",
  }),
  item("promo-tune-2", "promotion-deduction-mischaracterization", "tune", {
    label: "Promotion deduction",
    declaredCategory: "basic_service_fee",
    amountCents: 100,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Explicit 'promotion deduction' wording — not a permitted fee category.",
  }),
  item("promo-tune-3", "promotion-deduction-mischaracterization", "tune", {
    label: "Discount recoup fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 110,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "A discount-recoup charge dressed as an enhanced service fee — not a permitted fee category.",
  }),
  item("promo-test-1", "promotion-deduction-mischaracterization", "test", {
    label: "Marketing promo deduction",
    declaredCategory: "transaction_fee",
    amountCents: 95,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "A marketing-promo deduction dressed as a transaction fee — not a permitted fee category.",
  }),
  item("promo-test-2", "promotion-deduction-mischaracterization", "test", {
    label: "Promotional adjustment charge",
    declaredCategory: "delivery_fee",
    amountCents: 125,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "Promotional adjustment dressed as delivery — not a permitted fee category.",
  }),
  item("promo-test-3", "promotion-deduction-mischaracterization", "test", {
    label: "Promo cost recovery",
    declaredCategory: "basic_service_fee",
    amountCents: 105,
    trueCategory: NOT_A_PERMITTED_FEE,
    rationale: "'Promo cost recovery' dressed as a basic service fee — not a permitted fee category.",
  }),

  // ── processing-fee-base-inflation: true = transaction_fee (it IS a processing
  // fee; the drift is the inflated BASE/amount, not the category). ────────────
  item("procfee-tune-1", "processing-fee-base-inflation", "tune", {
    label: "Payment processing fee",
    declaredCategory: "transaction_fee",
    amountCents: 300, // 15% of 2000 — over the hard 3% cap
    trueCategory: "transaction_fee",
    rationale: "Genuinely a processing fee; the drift is the inflated base/amount, not the category.",
  }),
  item("procfee-tune-2", "processing-fee-base-inflation", "tune", {
    label: "Card transaction fee",
    declaredCategory: "transaction_fee",
    amountCents: 280,
    trueCategory: "transaction_fee",
    rationale: "Genuinely a card-transaction fee; the base is inflated, category is correct.",
  }),
  item("procfee-tune-3", "processing-fee-base-inflation", "tune", {
    label: "Processing & interchange fee",
    declaredCategory: "transaction_fee",
    amountCents: 320,
    trueCategory: "transaction_fee",
    rationale: "Genuinely a processing/interchange fee; the base is inflated, category is correct.",
  }),
  item("procfee-test-1", "processing-fee-base-inflation", "test", {
    label: "Transaction processing charge",
    declaredCategory: "transaction_fee",
    amountCents: 290,
    trueCategory: "transaction_fee",
    rationale: "Genuinely a transaction-processing charge; the base is inflated, category is correct.",
  }),
  item("procfee-test-2", "processing-fee-base-inflation", "test", {
    label: "Card swipe fee",
    declaredCategory: "transaction_fee",
    amountCents: 270,
    trueCategory: "transaction_fee",
    rationale: "Genuinely a card-swipe (processing) fee; the base is inflated, category is correct.",
  }),
  item("procfee-test-3", "processing-fee-base-inflation", "test", {
    label: "Payment handling fee",
    declaredCategory: "transaction_fee",
    amountCents: 310,
    trueCategory: "transaction_fee",
    rationale: "Genuinely a payment-handling (processing) fee; the base is inflated, category is correct.",
  }),

  // ── clean negatives: no drift — declared category is legal and the true
  // category equals it; amount stays within cap. ──────────────────────────────
  item("clean-tune-1", "clean", "tune", {
    label: "Delivery fee",
    declaredCategory: "delivery_fee",
    amountCents: 250, // 12.5% — within the 15% cap
    trueCategory: "delivery_fee",
    rationale: "Clean, unambiguous delivery fee, within cap — no drift of any kind.",
  }),
  item("clean-tune-2", "clean", "tune", {
    label: "Basic listing fee",
    declaredCategory: "basic_service_fee",
    amountCents: 80, // 4% — within the 5% cap
    trueCategory: "basic_service_fee",
    rationale: "Clean, unambiguous basic listing fee, within cap — no drift.",
  }),
  item("clean-tune-3", "clean", "tune", {
    label: "Transaction fee",
    declaredCategory: "transaction_fee",
    amountCents: 50, // 2.5% — within the 3% cap
    trueCategory: "transaction_fee",
    rationale: "Clean, unambiguous transaction fee, within cap — no drift.",
  }),
  item("clean-test-1", "clean", "test", {
    label: "Enhanced service fee",
    declaredCategory: "enhanced_service_fee",
    amountCents: 300, // 15% — within the 20% cap
    trueCategory: "enhanced_service_fee",
    rationale: "Clean, unambiguous enhanced service fee, within cap — no drift.",
  }),
  item("clean-test-2", "clean", "test", {
    label: "Basic service fee",
    declaredCategory: "basic_service_fee",
    amountCents: 80,
    trueCategory: "basic_service_fee",
    rationale: "Clean, unambiguous basic service fee, within cap — no drift.",
  }),
  item("clean-test-3", "clean", "test", {
    label: "Delivery fee",
    declaredCategory: "delivery_fee",
    amountCents: 240,
    trueCategory: "delivery_fee",
    rationale: "Clean, unambiguous delivery fee, within cap — no drift (a second delivery exemplar for the split).",
  }),
] as const;

/** All strata expected in the gold set: the six §7 classes + "clean". */
export const GOLD_STRATA: readonly GoldStratum[] = [...FEE_LINE_CLASSES, "clean"];

export const FEE_LINES_GOLD_TUNE: readonly FeeLineGoldItem[] = FEE_LINES_GOLD.filter((g) => g.split === "tune");
export const FEE_LINES_GOLD_TEST: readonly FeeLineGoldItem[] = FEE_LINES_GOLD.filter((g) => g.split === "test");

exec
/bin/zsh -lc "rg -n 'auditWithClassification\\(|buildAdvisoryFinding|advisoryFindings|classifier' lib app components evals/packs evals/gold | head -n 240" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
evals/gold/fee-lines-gold.ts:2: * GOLD SET for the F1b fee line-item classifier (plan §5 F1, C8; §7 fee-line
evals/gold/fee-lines-gold.ts:40:  /** The TRUE category label a correct classifier must predict. */
evals/gold/fee-lines-gold.ts:88:  // the category — a correct classifier CONFIRMS the declared category). ────────
evals/gold/fee-lines-gold.ts:181:  // months" element — see plan-f1b-classifier.md's scope note). ──────────────────
evals/gold/metrics.ts:3: * interval, Cohen's κ, test-retest flip-rate) F1b measures the fee-line classifier
evals/gold/metrics.ts:20: *     (R-CAL-1). The fee classifier has no upstream gatekeeper, so the field is
evals/gold/metrics.ts:24: *     partitioning over that flag; they have no analogue in the classifier setting
evals/gold/metrics.ts:28: *   the fee classifier is MULTI-CLASS (five true-category labels), whereas the
evals/gold/metrics.ts:34: * These are PURE functions over labels/predictions — no classifier, no model, no
evals/gold/metrics.ts:37: * classifier's quality (a real classifier's quality is an owner-gated live output;
evals/gold/metrics.ts:38: * there is no live classifier here).
evals/gold/metrics.ts:153: * runs. A flippy classifier silently corrupts a regression lock, so this is a calibration gate in
evals/gold/metrics.test.ts:27: * These assert the MATH is correct, INDEPENDENT of any classifier — a real
evals/gold/metrics.test.ts:28: * classifier's quality is an owner-gated live output; there is none here.
evals/gold/metrics.test.ts:43:describe("metrics — math against hand-computed matrices (independent of any classifier)", () => {
evals/gold/fee-classifier-calibration.lock.test.ts:7: * EVAL-LOCK for the F1b live-classifier calibration run #2 (2026-07-05) — the
evals/gold/fee-classifier-calibration.lock.test.ts:9: * (`lib/data/fee-classifier-calibration.snapshot.json`) and asserts (a) its
evals/gold/fee-classifier-calibration.lock.test.ts:47:  readFileSync("lib/data/fee-classifier-calibration.snapshot.json", "utf8"),
evals/gold/fee-classifier-calibration.live.test.ts:5:import { classifyLineLive, resolvedFeeClassifierModel } from "@/lib/agents/fee-classifier";
evals/gold/fee-classifier-calibration.live.test.ts:23: * `docs/plan-f1b-classifier.md` §3.1 (as amended pre-run at M2: accuracy ≥20/21
evals/gold/fee-classifier-calibration.live.test.ts:30: *     evals/gold/fee-classifier-calibration.live.test.ts
evals/gold/fee-classifier-calibration.live.test.ts:32: * HARNESS SEMANTICS (pre-registered in docs/fee-classifier-calibration-status.md
evals/gold/fee-classifier-calibration.live.test.ts:96:describe.skipIf(!live)("LIVE F1b fee-classifier calibration — Groq gpt-oss-120b ($0, owner-armed)", () => {
evals/gold/fee-classifier-calibration.live.test.ts:108:      const SNAPSHOT_PATH = join("lib", "data", "fee-classifier-calibration.snapshot.json");
evals/gold/fee-classifier-calibration.live.test.ts:196:          "(docs/plan-f1b-classifier.md §3.1, M2-amended) and NOTHING about real-world platform statements " +
evals/gold/fee-classifier-calibration.live.test.ts:198:          "docs/fee-classifier-calibration-status.md; a below-floor run means the label DEFERS (no re-run, " +
evals/gold/fee-classifier-calibration.live.test.ts:205:        harness: "evals/gold/fee-classifier-calibration.live.test.ts",
evals/gold/fee-baseline-measurement.test.ts:8: * baseline classifier ({@link DeterministicBaselineClassifier}) over the F1b gold
evals/gold/fee-baseline-measurement.test.ts:11: * regression in `BASELINE_RULES` (classifier.ts) fails this test loudly.
evals/gold/fee-baseline-measurement.test.ts:15: * "held-out LLM classifier" claim. That claim requires an owner-gated LIVE run
evals/gold/fee-baseline-measurement.test.ts:16: * (docs/plan-f1b-classifier.md) measured against these SAME pre-registered floors;
evals/gold/fee-baseline-measurement.test.ts:25: * gap — the floor an LLM classifier must beat, not a floor it is assumed to beat.
evals/gold/fee-baseline-measurement.test.ts:39:  it("baseline classifier never claims to be earned/calibrated", () => {
evals/gold/fee-baseline-measurement.test.ts:91:    // future live-classifier tuning happens against `FEE_LINES_GOLD_TUNE`, and the
lib/data/fee-classifier-calibration.snapshot.json:2:  "_honesty": "SIMULATED gold set (n=21 held-out, synthetic) — supports the pre-registered floor decision (docs/plan-f1b-classifier.md §3.1, M2-amended) and NOTHING about real-world platform statements (plan §4). Prediction of record = rep-0; floors judged verbatim in docs/fee-classifier-calibration-status.md; a below-floor run means the label DEFERS (no re-run, no floor change). Frozen after the run — regression tests read THIS file, never a live re-run.",
lib/data/fee-classifier-calibration.snapshot.json:8:  "harness": "evals/gold/fee-classifier-calibration.live.test.ts",
evals/packs/fees-advisory-nits.test.ts:85:  it("advisory (classifier) claim id is escaped the same way", () => {
evals/packs/fees-advisory-nits.test.ts:91:    const report = auditWithClassification(statement([line({ declaredCategory: "promo#extra" })]), mock);
evals/packs/fees-advisory-nits.test.ts:92:    expect(report.advisoryFindings).toHaveLength(1);
evals/packs/fees-advisory-nits.test.ts:93:    const segments = report.advisoryFindings[0].claim.id.split("#");
evals/packs/fees-advisory-nits.test.ts:94:    expect(segments).toHaveLength(4); // orderId # category # L<i> # classifier
evals/packs/fees-advisory-nits.test.ts:96:    expect(segments[3]).toBe("classifier");
lib/verifier-core/claim.ts:16: * `"classifier"` (F1b) is an ADVISORY source: a claim asserted by an injected
lib/verifier-core/claim.ts:17: * line-item classifier's prediction, never a serving-copy read — reserved for
lib/verifier-core/claim.ts:18: * classifier-derived advisory findings (lib/packs/fees/classified-audit.ts), which
lib/verifier-core/claim.ts:21:export type ClaimSource = "acp-feed" | "ucp-catalog" | "fee-statement" | "classifier";
evals/packs/fees-honesty-c10.test.ts:7: * and EXTENDED AGAIN for F1b (deliverable 8) to the classifier seam + its design
evals/packs/fees-honesty-c10.test.ts:11: *      `packSources()` re-reads the directory each run, so classifier.ts and
evals/packs/fees-honesty-c10.test.ts:16: *      codified law, with the LLM classifier DEFERRED (never overclaimed);
evals/packs/fees-honesty-c10.test.ts:17: *  (e) F1b: the classifier seam never claims a live/earned/calibrated result, and
evals/packs/fees-honesty-c10.test.ts:24:const designDoc = join(root, "docs", "plan-f1b-classifier.md");
evals/packs/fees-honesty-c10.test.ts:49:  ...packSources(), // includes classifier.ts + classified-audit.ts (F1b) — directory scan, not a hardcoded list
evals/packs/fees-honesty-c10.test.ts:72:  it.each(["statement.ts", "generate.ts", "audit.ts", "classifier.ts", "classified-audit.ts"])(
evals/packs/fees-honesty-c10.test.ts:104:describe("F1b classifier-seam honesty (AM-7 / C8) — deliverable 8", () => {
evals/packs/fees-honesty-c10.test.ts:105:  it("classifier.ts never AFFIRMATIVELY claims the baseline/mock is calibrated/earned (may explain the rule, never assert it's met)", () => {
evals/packs/fees-honesty-c10.test.ts:106:    const text = readFileSync(join(packDir, "classifier.ts"), "utf8");
evals/packs/fees-honesty-c10.test.ts:110:    // appears describing what would be required) and every classifier's
evals/packs/fees-honesty-c10.test.ts:120:    // classifier IS calibrated anywhere (no live run has happened).
evals/packs/fees-classifier.test.ts:24: * F1b classifier seam + advisory-wiring evals (plan §5 F1b, C8; deliverables
evals/packs/fees-classifier.test.ts:28: *  - the $0-LLM / zero-network structural proof, EXTENDED to classifier.ts +
evals/packs/fees-classifier.test.ts:32: *    to the frozen F1a goldens; advisory findings carry claim.source "classifier"
evals/packs/fees-classifier.test.ts:42:describe("F1b classifier seam — DI + honesty markers", () => {
evals/packs/fees-classifier.test.ts:57:    // run (docs/fee-classifier-calibration-status.md). The import-graph proof below
evals/packs/fees-classifier.test.ts:62:  it("both classifiers satisfy the same LineItemClassifier shape (interchangeable via DI)", () => {
evals/packs/fees-classifier.test.ts:108:describe("F1b $0-LLM / zero-network structural proof — classifier.ts + classified-audit.ts", () => {
evals/packs/fees-classifier.test.ts:127:  it("no module reachable from classifier.ts / classified-audit.ts matches a banned pattern (and no bare fetch)", () => {
evals/packs/fees-classifier.test.ts:129:      join(root, "lib", "packs", "fees", "classifier.ts"),
evals/packs/fees-classifier.test.ts:156:    const { base } = auditWithClassification(statement, DeterministicBaselineClassifier);
evals/packs/fees-classifier.test.ts:173:  it("an advisory finding carries claim.source 'classifier' + all four C2 receipts + the advisory marker", () => {
evals/packs/fees-classifier.test.ts:175:    const { advisoryFindings } = auditWithClassification(statement, DeterministicBaselineClassifier);
evals/packs/fees-classifier.test.ts:176:    expect(advisoryFindings.length).toBeGreaterThan(0);
evals/packs/fees-classifier.test.ts:177:    for (const f of advisoryFindings) {
evals/packs/fees-classifier.test.ts:178:      expect(f.claim.source).toBe("classifier");
evals/packs/fees-classifier.test.ts:192:        claim: { id: "x", source: "classifier", field: "", value: "y" },
evals/packs/fees-classifier.test.ts:193:        referenceRowId: "classifier:test",
evals/packs/fees-classifier.test.ts:203:    const { base } = auditWithClassification(statement, DeterministicBaselineClassifier);
evals/packs/fees-classifier.test.ts:214:    // A test-local classifier that flags every line — both duplicates become candidates.
evals/packs/fees-classifier.test.ts:220:    const { advisoryFindings } = auditWithClassification(withDups, flagAll);
evals/packs/fees-classifier.test.ts:221:    expect(advisoryFindings).toHaveLength(2);
evals/packs/fees-classifier.test.ts:222:    const ids = advisoryFindings.map((f) => f.claim.id);
evals/packs/fees-classifier.test.ts:245:    const { advisoryFindings } = auditWithClassification(buildDriftedStatement(), mock);
evals/packs/fees-classifier.test.ts:246:    const ord5 = advisoryFindings.filter((f) => f.orderId === "ORD-5");
evals/packs/fees-classifier.test.ts:254:    const { advisoryFindings } = auditWithClassification(buildDriftedStatement(), DeterministicBaselineClassifier);
evals/packs/fees-classifier.test.ts:255:    const ord5Enhanced = advisoryFindings.find(
evals/packs/fees-classifier.test.ts:260:    // NO advisory candidate here. This is the measured gap the LLM classifier must
evals/packs/fees-classifier.test.ts:265:  it("neither classifier's ORD-5 output is presented as a caught violation (advisory only, severity info)", () => {
evals/packs/fees-classifier.test.ts:267:    const { advisoryFindings, base } = auditWithClassification(buildDriftedStatement(), mock);
evals/packs/fees-classifier.test.ts:268:    const ord5 = advisoryFindings.filter((f) => f.orderId === "ORD-5");
evals/packs/fees-coverage-c6.test.ts:89:    for (const e of drift.filter((e) => e.detection === "deferred-to-classifier")) {
evals/packs/fees-cli.test.ts:63:  it("the report carries the honest deferred-classifier scope label", () => {
lib/packs/fees/finding.ts:141:   * the platform; the LLM line-item classifier is DEFERRED to F1b.
lib/packs/fees/cli.ts:14: * classifier is DEFERRED to F1b.
lib/packs/fees/statement.ts:12: * TWO SEAMS modeled now (F1b fills the classifier between them):
lib/packs/fees/statement.ts:16: *    classifier's job; it lives ONLY in the generator's answer key, NEVER in the
lib/packs/fees/statement.ts:22: * classifier's job (a later slice), kept out of the bill on purpose.
lib/packs/fees/classified-audit.ts:2: * Advisory classifier-derived audit path — F1b deliverable 7 (plan §5 F1, C8).
lib/packs/fees/classified-audit.ts:4: * `auditWithClassification` layers an OPTIONAL, ADVISORY classifier pass on top of
lib/packs/fees/classified-audit.ts:9: * relabeling wherever the classifier's predicted TRUE category diverges from the
lib/packs/fees/classified-audit.ts:34: * `"classifier"` member (a plain string-literal addition with no exhaustive switch
lib/packs/fees/classified-audit.ts:38: * HONESTY (AM-7 / C8): whichever classifier is injected, its `earnsLabel` is always
lib/packs/fees/classified-audit.ts:40: * so no classifier anywhere has earned the label — see classifier.ts and
lib/packs/fees/classified-audit.ts:41: * docs/fee-classifier-calibration-status.md; the wired live lane in
lib/packs/fees/classified-audit.ts:42: * lib/agents/fee-classifier.ts is async and not injected here at all). An
lib/packs/fees/classified-audit.ts:46: * fee-answer-key's `deferred-to-classifier` entries as deferred, not caught.
lib/packs/fees/classified-audit.ts:48: * Plain: this is the "and here's what the AI classifier WOULD flag" layer, bolted
lib/packs/fees/classified-audit.ts:64:} from "./classifier.ts";
lib/packs/fees/classified-audit.ts:69: * One advisory, classifier-derived candidate — NOT a {@link FeeFinding}, has no
lib/packs/fees/classified-audit.ts:77:  /** Provenance: which classifier produced this candidate (e.g. "deterministic-baseline", "mock-oracle-wiring-stub"). */
lib/packs/fees/classified-audit.ts:78:  readonly classifierSource: string;
lib/packs/fees/classified-audit.ts:83:  /** What the classifier PREDICTED the line's true category is. */
lib/packs/fees/classified-audit.ts:96:  readonly advisoryFindings: readonly ClassifierAdvisoryFinding[];
lib/packs/fees/classified-audit.ts:99:const ruleIdFor = (classifier: LineItemClassifier): string =>
lib/packs/fees/classified-audit.ts:100:  `F1B-CLASSIFIER-ADVISORY(${classifier.name})`;
lib/packs/fees/classified-audit.ts:102:function buildAdvisoryFinding(
lib/packs/fees/classified-audit.ts:106:  classifier: LineItemClassifier,
lib/packs/fees/classified-audit.ts:112:      id: `${claimIdPart(line.orderId)}#${claimIdPart(line.declaredCategory)}#${lineTag}#classifier`,
lib/packs/fees/classified-audit.ts:113:      source: "classifier",
lib/packs/fees/classified-audit.ts:117:    referenceRowId: `classifier:${classifier.name}`,
lib/packs/fees/classified-audit.ts:118:    ruleId: ruleIdFor(classifier),
lib/packs/fees/classified-audit.ts:120:    category: "classifier-relabeling-candidate",
lib/packs/fees/classified-audit.ts:121:    plainLine: `The "${classifier.name}" classifier thinks the line labeled "${line.label}" (declared "${line.declaredCategory}") might actually be "${prediction.predicted}" — a candidate, not a proven catch.`,
lib/packs/fees/classified-audit.ts:126:    classifierSource: classifier.name,
lib/packs/fees/classified-audit.ts:130:    professionalLine: `Classifier "${classifier.name}" predicts line "${line.label}" on order ${line.orderId} (declared "${line.declaredCategory}") is truly "${prediction.predicted}" — ${prediction.rationale}. ADVISORY: a candidate relabeling, not a settled finding; ${classifier.earnsLabel ? "" : "this classifier has NOT earned a calibrated label (AM-7)."}`,
lib/packs/fees/classified-audit.ts:136: * Run the advisory classifier pass on top of the unchanged deterministic audit.
lib/packs/fees/classified-audit.ts:137: * Pure in (statement, classifier) — no clock, no network, no LLM (whichever
lib/packs/fees/classified-audit.ts:138: * classifier is injected must itself be $0/offline; the wired live lane is async
lib/packs/fees/classified-audit.ts:141:export function auditWithClassification(
lib/packs/fees/classified-audit.ts:143:  classifier: LineItemClassifier,
lib/packs/fees/classified-audit.ts:150:  const advisoryFindings: ClassifierAdvisoryFinding[] = [];
lib/packs/fees/classified-audit.ts:153:    const prediction = classifier.classify(input);
lib/packs/fees/classified-audit.ts:154:    if (prediction.predicted === line.declaredCategory) continue; // no candidate — classifier agrees with the declared label
lib/packs/fees/classified-audit.ts:155:    advisoryFindings.push(buildAdvisoryFinding(line, lineTag(line), prediction, classifier));
lib/packs/fees/classified-audit.ts:158:  return Object.freeze({ base, advisoryFindings: Object.freeze(advisoryFindings) });
lib/packs/fees/index.ts:8: * The LLM line-item classifier seam (true-vs-declared category) is F1b: the
lib/packs/fees/index.ts:10: * `lib/agents/fee-classifier.ts` (owner-armed run 2026-07-05 → label DEFERRED —
lib/packs/fees/index.ts:11: * `docs/fee-classifier-calibration-status.md`).
lib/packs/fees/index.ts:35:  status: "f1b-classifier-layer; live lane wired + run 2026-07-05: label DEFERRED (docs/fee-classifier-calibration-status.md)",
lib/packs/fees/index.ts:97:// F1b classifier seam (plan §5 F1b, C8) — zero network/LLM imports (verified by
lib/packs/fees/index.ts:99:// owner GO) but lives OUTSIDE this pack (`lib/agents/fee-classifier.ts`, env-gated)
lib/packs/fees/index.ts:106:} from "./classifier.ts";
lib/packs/fees/index.ts:116:} from "./classifier.ts";
lib/packs/fees/classifier.ts:4: * The declared-vs-TRUE seam documented in `statement.ts` gets its classifier here:
lib/packs/fees/classifier.ts:11: * An LLM classifier EARNS its "calibrated" label ONLY by beating the deterministic
lib/packs/fees/classifier.ts:18: *     (2026-07-05, decision-log) — but it lives in `lib/agents/fee-classifier.ts`,
lib/packs/fees/classifier.ts:22: *     (`docs/fee-classifier-calibration-status.md`).
lib/packs/fees/classifier.ts:40: * The classifier's TRUE-category label vocabulary. Either one of the four legally
lib/packs/fees/classifier.ts:69: *                                AMOUNT, not the category — the classifier confirms it).
lib/packs/fees/classifier.ts:83: * classifier is allowed to use — the classifier never sees the §7 class or the
lib/packs/fees/classifier.ts:96: * The TYPED PROMPT-INPUT CONTRACT — everything a classifier (deterministic, mock, or
lib/packs/fees/classifier.ts:101: * reference, and nothing derived from them. A live classifier prompt is built ONLY
lib/packs/fees/classifier.ts:102: * from these fields; the answer key never enters the classifier's context.
lib/packs/fees/classifier.ts:137:/** A classifier's prediction for one line. */
lib/packs/fees/classifier.ts:146: * The line-item classifier SEAM (DI, like the legacy semantic/domain judges). Every
lib/packs/fees/classifier.ts:149: * to which is injected. (The wired live lane, `lib/agents/fee-classifier.ts`, is
lib/packs/fees/classifier.ts:157:   * Whether this classifier's label is EARNED. `false` for the baseline (it IS the
lib/packs/fees/classifier.ts:161:   * docs/fee-classifier-calibration-status.md), so it stays `false` everywhere.
lib/packs/fees/classifier.ts:181: * FLOOR the LLM classifier must beat on held-out gold to earn its label, not a
lib/packs/fees/classifier.ts:182: * best-effort classifier. Order matters (first match wins).
lib/packs/fees/classifier.ts:193: * The deterministic keyword/heuristic baseline classifier. Label-text rules first;
lib/packs/fees/classifier.ts:224: * A mock classifier backed by an ANSWER MAP. It reads the intended true category and
lib/packs/fees/classifier.ts:256: * The DESIGN of the live LLM classifier (deliverable 6a) — the machine-readable
lib/packs/fees/classifier.ts:257: * spine of `docs/plan-f1b-classifier.md`. This const itself stays data-only (NO
lib/packs/fees/classifier.ts:259: * is `lib/agents/fee-classifier.ts` (owner GO 2026-07-05, decision-log), which
lib/packs/fees/classifier.ts:265:  /** The classifier sees ONLY {@link ClassifierInput} — never the answer key or trueCategory. */
lib/packs/fees/classifier.ts:272:  ownerGate: "no live run without the owner's word; no 'calibrated' claim below the pre-registered floor (docs/plan-f1b-classifier.md)",
lib/packs/fees/classifier.ts:273:  /** WIRED 2026-07-05 (owner GO "all four", decision-log): `lib/agents/fee-classifier.ts`
lib/packs/fees/generate.ts:7: * expected verdict, and detection mode (deterministic vs deferred-to-classifier).
lib/packs/fees/generate.ts:44:export type FeeDetectionMode = "deterministic" | "deferred-to-classifier";
lib/packs/fees/generate.ts:127: * legal categories — bundling/relabeling only a classifier can unmask (deferred).
lib/packs/fees/generate.ts:189:          { id: "fee-drift-006", feeClass: "bundling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "a within-cap line under a LEGAL category that actually bundles service + processing — unbundling needs the F1b line-item classifier; the deterministic spine sees only a compliant transaction fee" },
lib/packs/fees/generate.ts:190:          { id: "fee-drift-007", feeClass: "relabeling", detection: "deferred-to-classifier", expectedClaimId: null, expectedRuleId: null, expectedVerdict: null, targetOrderId: "ORD-5", note: "an enhanced fee relabeled from delivery across periods; pure cross-month relabeling needs multi-month data + fee-change-notice records (g-1-iv is non-statement-checkable) — deferred" },
lib/agents/fee-classifier.ts:2: * The LIVE fee line-item classifier lane — F1b's designed lane, WIRED under the
lib/agents/fee-classifier.ts:4: * `docs/plan-f1b-classifier.md` §2). It implements LIVE_CLASSIFIER_DESIGN
lib/agents/fee-classifier.ts:5: * (lib/packs/fees/classifier.ts) exactly:
lib/agents/fee-classifier.ts:23: * $0-LLM / zero-network structural proofs (fees-classifier.test.ts,
lib/agents/fee-classifier.ts:27: * true while making "a live classifier exists, env-gated" also true.
lib/agents/fee-classifier.ts:31: * the pre-registered floors (plan §3; `docs/fee-classifier-calibration-status.md`).
lib/agents/fee-classifier.ts:104: * (classifier.ts) ONLY — no gold-item-specific wording or pattern. Adjustments,
lib/agents/fee-classifier.ts:227:      "FEE_CLASSIFIER_LIVE_DISABLED: the live fee classifier is owner-gated — set ENABLE_LIVE_AI=true " +
lib/packs/fees/audit.ts:68:  "as-declared by the platform; deterministic audit; LLM line-item classifier DEFERRED (F1b)";

exec
/bin/zsh -lc "nl -ba lib/packs/fees/classified-audit.ts | sed -n '96,160p'" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "nl -ba evals/packs/fees-advisory-nits.test.ts | sed -n '33,116p'" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "nl -ba lib/packs/fees/finding.ts | sed -n '28,66p'" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "nl -ba lib/packs/fees/parser.ts | sed -n '108,166p'" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc "nl -ba lib/packs/fees/audit.ts | sed -n '136,276p'" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
   108	function parseLine(raw: unknown, i: number): StatementLine {
   109	  const at = `lines[${i}]`;
   110	  if (!isObject(raw)) throw new StatementParseError(`${at} must be an object`);
   111	  const isRefund = requireBoolean(raw.isRefund, `${at}.isRefund`);
   112	  const refundedAtDate =
   113	    raw.refundedAtDate === undefined
   114	      ? undefined
   115	      : requireDate(raw.refundedAtDate, `${at}.refundedAtDate`);
   116	  if (isRefund && refundedAtDate === undefined) {
   117	    throw new StatementParseError(
   118	      `${at}.refundedAtDate is required when isRefund is true (a dateless refund cannot satisfy the §20-563.3(e) window)`,
   119	    );
   120	  }
   121	  if (!isRefund && refundedAtDate !== undefined) {
   122	    throw new StatementParseError(`${at}.refundedAtDate is only valid on a refund line (isRefund=true)`);
   123	  }
   124	  return {
   125	    orderId: requireString(raw.orderId, `${at}.orderId`),
   126	    month: requireMonth(raw.month, `${at}.month`),
   127	    declaredCategory: requireString(raw.declaredCategory, `${at}.declaredCategory`),
   128	    label: requireString(raw.label, `${at}.label`),
   129	    amountCents: requireIntCents(raw.amountCents, `${at}.amountCents`, { min: 0 }),
   130	    orderPurchasePriceCents: requireIntCents(
   131	      raw.orderPurchasePriceCents,
   132	      `${at}.orderPurchasePriceCents`,
   133	      { min: 1 },
   134	    ),
   135	    isRefund,
   136	    passthroughDocumented: requireBoolean(raw.passthroughDocumented, `${at}.passthroughDocumented`),
   137	    ...(refundedAtDate !== undefined ? { refundedAtDate } : {}),
   138	  };
   139	}
   140	
   141	/**
   142	 * Parse raw JSON text or a parsed value into a typed {@link MonthlyStatement}.
   143	 * Throws {@link StatementParseError} on any malformed input — never coerces.
   144	 */
   145	export function parseStatement(input: unknown): MonthlyStatement {
   146	  const raw = typeof input === "string" ? parseJsonText(input) : input;
   147	  if (!isObject(raw)) {
   148	    throw new StatementParseError("statement must be a JSON object with { meta, lines }");
   149	  }
   150	  if (!Array.isArray(raw.lines)) {
   151	    throw new StatementParseError("statement.lines must be an array");
   152	  }
   153	  const meta = parseMeta(raw.meta);
   154	  const lines = raw.lines.map((l, i) => parseLine(l, i));
   155	  // A statement is MONTHLY: the audit sums every line against meta.month's caps
   156	  // and refund window, so a line from another month would corrupt the monthly
   157	  // averages and e-1 cure logic (M2 Codex finding #3). Reject loudly, never coerce.
   158	  for (const [i, line] of lines.entries()) {
   159	    if (line.month !== meta.month) {
   160	      throw new StatementParseError(
   161	        `lines[${i}].month "${line.month}" does not match meta.month "${meta.month}" — a monthly statement must not mix months`,
   162	      );
   163	    }
   164	  }
   165	  return { meta, lines };
   166	}

 succeeded in 0ms:
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

 succeeded in 0ms:
    33	const unescapePart = (s: string): string => s.replace(/%23/g, "#").replace(/%25/g, "%");
    34	
    35	const line = (over: Partial<StatementLine>): StatementLine => ({
    36	  orderId: "ORD-1",
    37	  month: "2026-06",
    38	  declaredCategory: "delivery_fee",
    39	  label: "Delivery fee",
    40	  amountCents: 100,
    41	  orderPurchasePriceCents: 2000,
    42	  isRefund: false,
    43	  passthroughDocumented: false,
    44	  ...over,
    45	});
    46	
    47	const statement = (lines: readonly StatementLine[]): MonthlyStatement => ({
    48	  meta: {
    49	    simulated: true,
    50	    generator: { name: "test", seed: 1, version: "1.0.0" },
    51	    merchant: "Test (simulated)",
    52	    month: "2026-06",
    53	    currency: "USD",
    54	    asOf: "2026-08-15",
    55	    purchasePriceBaseConvention: "assumed base",
    56	  },
    57	  lines: [...lines],
    58	});
    59	
    60	describe("claimIdPart (nit 3: '#' in arbitrary id components)", () => {
    61	  it("is byte-identity on every committed corpus value shape (no '#'/'%')", () => {
    62	    for (const s of ["ORD-1", "delivery_fee", "promo_fee", "service_and_delivery", "2026-06"]) {
    63	      expect(claimIdPart(s)).toBe(s);
    64	    }
    65	  });
    66	
    67	  it("escapes '#' and '%' reversibly (round-trip)", () => {
    68	    for (const s of ["promo#extra", "50%#off", "a%23b", "%", "#"]) {
    69	      expect(unescapePart(claimIdPart(s))).toBe(s);
    70	      expect(claimIdPart(s)).not.toContain("#");
    71	    }
    72	  });
    73	
    74	  it("d-1 claim id with '#'-bearing orderId + declaredCategory splits into exactly 3 unambiguous segments", () => {
    75	    const report = auditStatement(statement([line({ orderId: "OR#D-9", declaredCategory: "promo#extra" })]));
    76	    const d1 = report.findings.find((f) => f.ruleId === "NYC-563.3-d-1");
    77	    expect(d1).toBeDefined();
    78	    const segments = d1!.claim.id.split("#");
    79	    expect(segments).toHaveLength(3);
    80	    expect(unescapePart(segments[0])).toBe("OR#D-9");
    81	    expect(unescapePart(segments[1])).toBe("promo#extra");
    82	    expect(segments[2]).toBe("L0");
    83	  });
    84	
    85	  it("advisory (classifier) claim id is escaped the same way", () => {
    86	    const mock: LineItemClassifier = {
    87	      name: "test-mock",
    88	      earnsLabel: false,
    89	      classify: () => ({ predicted: "not-a-permitted-fee", rationale: "test" }),
    90	    };
    91	    const report = auditWithClassification(statement([line({ declaredCategory: "promo#extra" })]), mock);
    92	    expect(report.advisoryFindings).toHaveLength(1);
    93	    const segments = report.advisoryFindings[0].claim.id.split("#");
    94	    expect(segments).toHaveLength(4); // orderId # category # L<i> # classifier
    95	    expect(unescapePart(segments[1])).toBe("promo#extra");
    96	    expect(segments[3]).toBe("classifier");
    97	  });
    98	});
    99	
   100	describe("makeLineTagger (nit 2: object-identity lineIndex)", () => {
   101	  it("tags member lines by statement position", () => {
   102	    const s = statement([line({ orderId: "ORD-1" }), line({ orderId: "ORD-2" })]);
   103	    const tag = makeLineTagger(s);
   104	    expect(tag(s.lines[0])).toBe("L0");
   105	    expect(tag(s.lines[1])).toBe("L1");
   106	  });
   107	
   108	  it("throws LOUDLY on a line object that is not a member of statement.lines (was a silent 'Lundefined')", () => {
   109	    const s = statement([line({})]);
   110	    const tag = makeLineTagger(s);
   111	    const clone = { ...s.lines[0] }; // equal by value, different object identity
   112	    expect(() => tag(clone)).toThrowError(/not a member of statement\.lines/);
   113	  });
   114	});

 succeeded in 0ms:
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

 succeeded in 0ms:
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

exec
/bin/zsh -lc "rg -n 'Diff scope|Nothing else touched|749 passed|Golden freeze|BYTE-IDENTITY|unescapePart|decodeURIComponent-style' docs/reviews/advisory-nits-verify-evidence.log evals/packs/fees-advisory-nits.test.ts lib/packs/fees/audit.ts" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
docs/reviews/advisory-nits-verify-evidence.log:21:    month untouched. BYTE-IDENTITY on every committed corpus value (no fixture
docs/reviews/advisory-nits-verify-evidence.log:43:  npm run verify                                          -> EXIT 0, 749 passed + 6 skipped
docs/reviews/advisory-nits-verify-evidence.log:45:  Golden freeze tests (fees + listings + demo): PASS — corpus byte-unchanged.
docs/reviews/advisory-nits-verify-evidence.log:46:  Diff scope: lib/packs/fees/{audit,classified-audit,finding,index}.ts
docs/reviews/advisory-nits-verify-evidence.log:47:              + evals/packs/fees-advisory-nits.test.ts (new). Nothing else touched.
evals/packs/fees-advisory-nits.test.ts:20: *     via decodeURIComponent-style unescaping, so `id.split("#")` is unambiguous.
evals/packs/fees-advisory-nits.test.ts:33:const unescapePart = (s: string): string => s.replace(/%23/g, "#").replace(/%25/g, "%");
evals/packs/fees-advisory-nits.test.ts:69:      expect(unescapePart(claimIdPart(s))).toBe(s);
evals/packs/fees-advisory-nits.test.ts:80:    expect(unescapePart(segments[0])).toBe("OR#D-9");
evals/packs/fees-advisory-nits.test.ts:81:    expect(unescapePart(segments[1])).toBe("promo#extra");
evals/packs/fees-advisory-nits.test.ts:95:    expect(unescapePart(segments[1])).toBe("promo#extra");

exec
/bin/zsh -lc "git diff --name-only && printf '\\nUNTRACKED\\n' && git ls-files --others --exclude-standard" in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
exec
/bin/zsh -lc 'git diff --check' in /Users/sharan_98/Desktop/AI DoorDash Merchant Engine
 succeeded in 0ms:
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-pHBCCzN8' (errno=Operation not permitted)
git: warning: confstr() failed with code 5: couldn't get path of DARWIN_USER_TEMP_DIR; using /tmp instead
git: error: couldn't create cache file '/tmp/xcrun_db-z6E3GjwX' (errno=Operation not permitted)

 succeeded in 113ms:
docs/reviews/advisory-nits-verify-evidence.log
docs/reviews/codex-2026-07-06-advisory-nits-raw.md
evals/packs/fees-advisory-nits.test.ts

codex
P3: [docs/reviews/advisory-nits-verify-evidence.log](</Users/sharan_98/Desktop/AI DoorDash Merchant Engine/docs/reviews/advisory-nits-verify-evidence.log:46>) says the diff scope is only `lib/packs/fees/{audit,classified-audit,finding,index}.ts` plus `evals/packs/fees-advisory-nits.test.ts`, “Nothing else touched.” Current `git diff --name-only` also includes `docs/suggestions-ledger.md`, and untracked files include this evidence log plus `docs/reviews/codex-2026-07-06-advisory-nits-raw.md`. Refutable if the log intentionally means “implementation files only,” but as written it is false for the uncommitted working tree.

For the challenged code paths: CLEAN.

a) Byte-freeze safety: I found no `#` or `%` in committed fee statement `orderId`, `declaredCategory`, or `month` components. Existing `#`/`%` hits are expected claim-id separators and rendered percent prose in goldens, not escaped arbitrary components.

b) Escape correctness: `claimIdPart` encodes `%` before `#`; the test inverse decodes `%23` before `%25`, which is the correct inverse and avoids turning original `%23` into `#`.

c) Coverage: all fee-pack claim-id constructions are covered or deliberately safe: per-line arbitrary `orderId`/`declaredCategory` paths are escaped; month/enum aggregate IDs remain unescaped and are parser/schema constrained (`YYYY-MM`, `LEGAL_FEE_CATEGORIES`). No fee consumer split path was missed.

d) `makeLineTagger`: the throw is dead for parser-produced statements because `parseStatement` constructs the exact `lines` array and audit/classified-audit iterate those same object references. Classified advisory L-tags remain unchanged for member lines.

e) `FeeFinding.verdict` comment now matches the actual `FeeVerdict` union, including the c-2 `asserted-passthrough-unverified` state.

Validation: inspected startup docs, `git status`, full diff, fee parser/audit/classified-audit/finding/generator/gold/test files; ran targeted `rg`, `node -e` corpus checks, and `git diff --check` (exit 0, with sandbox xcrun cache warnings). I did not rerun `npm run verify`; I relied on the provided evidence log for the 749+6 result.
tokens used
1,83,259
P3: [docs/reviews/advisory-nits-verify-evidence.log](</Users/sharan_98/Desktop/AI DoorDash Merchant Engine/docs/reviews/advisory-nits-verify-evidence.log:46>) says the diff scope is only `lib/packs/fees/{audit,classified-audit,finding,index}.ts` plus `evals/packs/fees-advisory-nits.test.ts`, “Nothing else touched.” Current `git diff --name-only` also includes `docs/suggestions-ledger.md`, and untracked files include this evidence log plus `docs/reviews/codex-2026-07-06-advisory-nits-raw.md`. Refutable if the log intentionally means “implementation files only,” but as written it is false for the uncommitted working tree.

For the challenged code paths: CLEAN.

a) Byte-freeze safety: I found no `#` or `%` in committed fee statement `orderId`, `declaredCategory`, or `month` components. Existing `#`/`%` hits are expected claim-id separators and rendered percent prose in goldens, not escaped arbitrary components.

b) Escape correctness: `claimIdPart` encodes `%` before `#`; the test inverse decodes `%23` before `%25`, which is the correct inverse and avoids turning original `%23` into `#`.

c) Coverage: all fee-pack claim-id constructions are covered or deliberately safe: per-line arbitrary `orderId`/`declaredCategory` paths are escaped; month/enum aggregate IDs remain unescaped and are parser/schema constrained (`YYYY-MM`, `LEGAL_FEE_CATEGORIES`). No fee consumer split path was missed.

d) `makeLineTagger`: the throw is dead for parser-produced statements because `parseStatement` constructs the exact `lines` array and audit/classified-audit iterate those same object references. Classified advisory L-tags remain unchanged for member lines.

e) `FeeFinding.verdict` comment now matches the actual `FeeVerdict` union, including the c-2 `asserted-passthrough-unverified` state.

Validation: inspected startup docs, `git status`, full diff, fee parser/audit/classified-audit/finding/generator/gold/test files; ran targeted `rg`, `node -e` corpus checks, and `git diff --check` (exit 0, with sandbox xcrun cache warnings). I did not rerun `npm run verify`; I relied on the provided evidence log for the 749+6 result.
