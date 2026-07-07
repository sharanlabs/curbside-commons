# Execution Plan — Agentic Extension (four proficiency surfaces over the gated engine)

**Status:** v1.0 (reconciled) — awaiting owner GO. NO build, NO live integration, NO spend before that GO.
**Extends:** `docs/plan-truth-audit-execution.md` (conventions: SCQA · declarative criteria · slice DAG with per-slice gates · owner calls surfaced, never assumed). That plan's §5 roadmap is COMPLETE; this plan is the owner-directed extension (decision-log 2026-07-06 ×4).
**Grounding:** live research digest `docs/research/agentic-extension-research-2026-07.md` (fetched 2026-07-06). frontier-advisor pre-approach consult 2026-07-07: PROCEED with corrections — adopted (§2). **Codex cross-check 2026-07-07: CONFIRM-WITH-AMENDMENTS, 9 P1 + 3 P2 — ALL 12 ACCEPTED and folded in** (record: `docs/reviews/codex-2026-07-07-agentic-plan-crosscheck.md`); v1.0-rc → v1.0 at that reconciliation.

## 0 · SCQA summary

- **Situation:** the truth-audit engine is shipped and fully gated (749+6 verify; pre-registered eval floors; honesty gates; repo live PRIVATE). Its discipline — deterministic core, anti-theater evals, human gates — is exactly what current official guidance says is the hard part of agentic systems (digest §2).
- **Complication:** the program's demonstration goal is applied-AI/agentic/AI-automation proficiency for AI-Engineer-class roles — and no agentic layer, integration surface, or automation lane sits on the engine yet. Most portfolio agents are demos without discipline; ours is discipline without the agentic layer.
- **Question:** how do we add the four owner-named surfaces (agent crew · MCP server · Slack/email delivery · n8n lane) without breaking the constraints that make the repo credible (agents recommend / engine decides; offline-first; honesty labels; anti-theater floors; prototype-not-service)?
- **Answer:** one typed JSON-in/JSON-out **tool-registry seam** over the engine's existing entry points (A0), consumed by all four surfaces; every surface offline-first with byte-frozen artifacts; the "agent" label earned ONLY by an owner-gated live run clearing pre-registered floors (offline replay earns "orchestration harness passed", nothing more — Codex amendment 3); one module ceremony (AM) with a hiring-facing showcase runbook.

## 1 · Fixed goal + constraints (owner-set; binding — plan against, do not reopen)

**Goal:** a PERSONAL DEMONSTRATION project showcasing applied-AI / agentic-systems / AI-automation proficiency for AI-Engineer-class roles (AI Engineer · AI Specialist · Applied AI Engineer · AI Automation Specialist). Boundary: NOT model development/training; NOT no-code-only. Floor tools (not ceiling): Claude Code/Codex · n8n · MCP · Zapier-class.

**Carried constraints (all inherited, none relaxed):**
1. **Agents recommend / the engine decides** — no agent output may alter an engine verdict; enforced by a hard import boundary + behavioral tests (§3, AC-6 as amended).
2. **Offline-first (RULES §3):** no live Slack, Resend/email, n8n-external, Groq, or Gemini call until the offline slice exists and safety controls are defined. Live runs = owner-gated **transient demos**, never standing infrastructure. **No live leg may be pre-authorized at GO** (Codex amendment 9): each is armed individually, after its offline gate + safety controls pass.
3. **Honesty (RULES §4):** simulated labels everywhere; no "agent"/"calibrated"/capability label without its pre-registered floor cleared LIVE; C10 gate extends over every new public-facing surface.
4. **Cost:** Groq free-tier runs expected $0 under current account limits — preflight + ledger required, metered pricing re-verified at each arming (Codex amendment 12) · Gemini ≤$5 total program cap (spend to date ≈ $0.07) · everything else free/free-tier/self-hosted (best-fit rule 2026-06-25 available on justification + owner+Codex).
5. **Prototype-not-service:** episodic runs only — no daemons, no cron, no standing webhooks, no uptime claims.
6. **Desktop web only** for any UI surface.
7. Per-slice gates (verify green + red-green) + module Codex ceremony + independent acceptance-gate; maker≠judge; owner gates: any live arming · deploy · public flip · name adoption (S-11).

## 2 · What the pre-plan gates changed (adopted here)

**Research digest (2026-07-06, committed):** validated the role/tool targeting; Anthropic workflows-vs-agents + agents-over-verified-tools guidance = citable design rationale; MCP = Linux-Foundation standard; n8n "deterministic backbone + agents at intelligence points" = our thesis verbatim; **eval literacy = the #1 hiring signal — our strongest card**; portfolio bar = edge-case handling + loop prevention + an eval suite ≥20 cases.

**frontier-advisor consult (2026-07-07, PROCEED):** (a) A1 (MCP) and A2 (crew) are **siblings on A0** — parallel-eligible, A1 scheduled first (small, mechanical, shakes out the registry contract before the expensive slice). (b) The shared registry is sound coupling IFF JSON-in/JSON-out from day one and byte-frozen in A0 — adopted. (c) Deciding risk = trajectory-eval floors being vague at plan time → §6 makes them concrete; floor failure = label downgrade, never retry-until-green. (d) Hiring-audience gaps folded in: showcase runbook (AM) · legible trajectory traces (A2) · a deliberate guardrail-refusal demo beat (A2) · how the PRIVATE repo is shown = named owner call (O-A3).

**Codex cross-check (2026-07-07, CONFIRM-WITH-AMENDMENTS — all 12 accepted):** trajectory-case schema made explicit + floors made per-member (1, 2) · offline replay demoted below the "agent" label (3) · AC-6 re-based on import boundaries, not constructors — TS structural typing defeats the constructor claim (4) · differential fidelity re-specified as canonical-payload comparison per named serializer, MCP envelopes parsed first (5) · `auditWithClassification` wrapped only as a separate advisory tool with the deterministic baseline classifier, `earnsLabel:false` (6) · `runDemo` marked `demo_only`, forbidden as an audit result (7) · A4 re-wired to depend on A1 + A3 and prove tool→payload end-to-end (8) · live-leg pre-authorization REMOVED from the owner calls (9) · MCP anti-theater gates added (10) · n8n lane requires a zero-network dry run or the honest "workflow spec, not executed" label (11) · Groq cost wording corrected (12).

## 3 · Architecture (C4-context level)

```
                         ┌────────────────────────────────────────────┐
                         │  EXISTING GATED ENGINE (unchanged)         │
                         │  listings: runCheck / runConformanceCheck  │
                         │            / runDemo (demo_only)           │
                         │  fees: auditStatement /                    │
                         │        auditWithClassification / FEE_RULES │
                         └─────────────────▲──────────────────────────┘
                                           │ direct function calls
                    ┌──────────────────────┴───────────────────────┐
                    │  A0 TOOL REGISTRY (new; the ONE seam)        │
                    │  typed JSON-in/JSON-out · schema-validated   │
                    │  canonical serializer per tool · goldens     │
                    │  byte-frozen · $0 · loud typed errors        │
                    └──▲───────────▲───────────▲──────────▲────────┘
                       │           │           │          │
              A1 MCP server   A2 agent crew   A3 delivery A4 n8n lane
              (stdio, official (Intake/Audit/  builders    (workflow JSON:
              TS SDK; tools:   Evidence/       (Slack Block fixture → tool →
              check_feed,      Reviewer;       Kit + email  A3 payload;
              audit_statement, recommend-only; MIME; pure   zero-network
              get_rule)        typed traces)   functions)   dry run)
```

- **One seam, four consumers.** The registry is what makes the differential test possible: each tool has a **named canonical serializer**, and every consumer's canonical payload must equal the engine's direct answer through that serializer (AC-2 as amended — MCP JSON-RPC envelopes are parsed to the tool-result payload BEFORE comparison; raw-envelope byte comparison is explicitly not the claim).
- **Registry tool set (A0):** `check_feed` (over `runCheck`) · `check_conformance` (over `runUcpConformance` via `runConformanceCheck`) · `audit_statement` (over `auditStatement`) · `classify_and_audit` — a SEPARATE advisory tool over `auditWithClassification` injected ONLY with the deterministic baseline classifier (or an explicit mock in tests), output flagged `earnsLabel: false`, advisory array snapshotted separately (Codex amendment 6) · `get_rule` (lookup over `FEE_RULES`) · `run_demo` marked **`demo_only: true`** — agents, MCP clients, and n8n MUST NOT treat its output as an audit result; the registry enforces the flag in its output envelope (Codex amendment 7).
- **Workflows-vs-agents classification is per crew member and honest** (Anthropic guidance as rationale): Intake = model-directed routing of a messy artifact · Audit = deterministic workflow (tool invocation) · Evidence = deterministic workflow (C2-guard receipts assembly) · Reviewer = model-directed check with a HUMAN gate. The public label for each member states its class and its floor status (§6).
- **Recommendation-only enforcement (amended — structural claim corrected):** TypeScript's structural typing means "no reachable constructor" is NOT a sound guarantee (Codex amendment 4). The enforceable version: **(i)** a hard import boundary — crew + MCP-server code may import ONLY the registry client types and serialized registry responses; imports from `lib/verifier-core/*`, `lib/packs/*/finding`, `lib/packs/*/audit`, `lib/packs/*/verify`, fixtures, and answer keys are DENIED by an import-walk eval with committed negative fixtures (SOR-blind-actor precedent); **(ii)** a behavioral test proving that any agent `Recommendation[]` output leaves every engine report byte-identical; **(iii)** recommendations reference existing finding ids only — a fabricated-ref check fails the trajectory case.

## 4 · Success criteria + acceptance tests (declarative; each slice gates on its subset)

| # | Criterion | Acceptance test (machine-checkable unless marked) |
|---|---|---|
| AC-1 | Registry contract typed + validated | Every tool: JSON Schema for input AND output, committed; invalid input → typed loud error (tests per tool, red-green) |
| AC-2 | **Differential fidelity (canonical)** | Per tool × corpus fixture (faithful/drifted/invalid): registry canonical payload ≡ direct engine call through the SAME named serializer (`serializeReport` / `serializeFeeReport` / demo JSON) + exit-code parity; MCP leg: parse the JSON-RPC tool-result payload, THEN compare canonically (Codex amendment 5) |
| AC-3 | $0/offline core | Import-graph eval: registry + MCP server + delivery builders + crew orchestrator (offline mode) reach NO LLM SDK / network module (extends the existing $0-LLM eval pattern) |
| AC-4 | MCP conformance + anti-theater | Official TypeScript SDK (version pinned + freshness-dated at A1 entry); scripted-client transcript committed byte-frozen; PLUS (Codex amendment 10): an invalid-input transcript with typed MCP error snapshots; import-walk proof the server imports registry-only; per-tool differential over faithful/drifted/invalid fixtures |
| AC-5 | Trajectory evals | ≥20 offline-replayable trajectory cases total, ≥5 per crew member, per the COMMITTED case schema in §6; incl. ≥2 prompt-injection and ≥2 guardrail-refusal cases; per-member floors per §6 pre-registered in A2 |
| AC-6 | Recommendation-only (amended) | Import-boundary eval with committed negative fixtures (denied paths listed in §3) + behavioral byte-identity test + fabricated-finding-ref check — the constructor-reachability claim is withdrawn (Codex amendment 4) |
| AC-7 | Legible traces | Every crew run emits a typed trajectory record (tool calls, argument digests, member, timing, verdict refs) + a human-readable rendering; documentation-standard two-register rule applies |
| AC-8 | Delivery payload honesty | Slack Block Kit + email MIME builders are pure functions report→payload, snapshot-frozen; every payload carries the SIMULATED banner; C10 honesty gate extended over payload templates (grep-gate red-green) |
| AC-9 | n8n lane veracity (amended) | Committed workflow JSON references ONLY sanctioned tool commands (structural test) AND — if the owner approves docker (O-A4) — a **zero-network dry run** proving fixture → registry/MCP tool → A3 payload artifact; if docker is NOT approved, the lane is labeled **"workflow spec, not executed n8n lane"** everywhere and is NOT counted as a working automation surface (Codex amendments 8+11); no standing trigger nodes committed |
| AC-10 | No-regression floor | `npm run verify` green (baseline 749+6) + `test:legacy` 306+5 + python 35 at every slice exit; existing goldens byte-unchanged unless a sanctioned regen |
| AC-11 | Showcase legibility | `docs/SHOWCASE.md` runbook: one command per surface + one full walkthrough transcript; a hiring reviewer can see all four surfaces without running four slices (human-checked at AM gate) |
| AC-12 | Prototype-not-service | Zero daemon/cron/webhook/standing-infra artifacts committed; grep-gate over workflow/docs for uptime/service claims |

## 5 · Slice DAG + gates

```
A0 ──► A1 ──┐             A1∥A2 parallel-eligible (both consume only A0);
 │          ├──► A4        A1 scheduled first (advisor ruling).
 ├───► A2   │              A4 depends on A1 + A3 (Codex amendment 8):
 └───► A3 ──┘              it must prove tool → payload, not wrap a CLI.
A1,A2,A3,A4 ──► AM (module ceremony + showcase)
```

| Slice | Contents | Gate (all slices also carry AC-10) |
|---|---|---|
| **A0 — tool registry** | Registry per §3 tool set (incl. the `classify_and_audit` advisory seam + `run_demo` `demo_only` flag); input/output schemas; canonical serializers named per tool; loud typed errors; goldens byte-frozen | AC-1, AC-2 (registry≡engine), AC-3 · per-slice verify + red-green + Codex changed-files |
| **A1 — MCP server** | stdio server, official TS SDK (pin + freshness at entry); tools `check_feed`, `check_conformance`, `audit_statement`, `get_rule` (+ `classify_and_audit` advisory, `run_demo` demo-only); scripted-client transcript + invalid-input transcript committed | AC-2 (MCP≡registry, canonical), AC-3, AC-4 · per-slice gate |
| **A2 — agent crew** | Intake→Audit→Evidence→Reviewer over the registry ONLY (import boundary per §3); typed trajectories + rendering; offline mode = recorded/mocked LLM turns, deterministic replay — **passing offline earns "orchestration harness passed", NOT the "agent" label** (Codex amendment 3); per-member workflows-vs-agents classification recorded; §6 case schema + per-member floors PRE-REGISTERED in this slice; guardrail-refusal demo beat; LIVE runs NOT in this slice | AC-3 (offline mode), AC-5, AC-6, AC-7 · per-slice gate |
| **A3 — delivery builders** | Slack Block Kit payload builder + email MIME builder (pure, report→payload); snapshot-frozen; SIMULATED banner mandatory; safety-controls doc for the eventual transient live demo (allowlisted recipient · one-shot · banner in every message); NO live send | AC-3, AC-8 · per-slice gate |
| **A4 — n8n lane** | Exported workflow JSON (fixture → registry/MCP tool → A3 payload artifact; no standing triggers) + runbook for the episodic self-hosted docker run; zero-network dry run if O-A4 approves docker, else the honest "workflow spec" label; n8n sustainable-use license freshness check at entry | AC-9, AC-12 · per-slice gate |
| **AM — module ceremony** | `docs/SHOWCASE.md` (AC-11) · PLAIN-ENGLISH + GLOSSARY same-breath rows · suggestions-ledger sync · ONE batched Codex (codex-guarded, xhigh) over the whole extension · independent acceptance-gate · reconcile primary-model-final | AC-11, AC-12, full-module Codex + gate SHIP |

**Live legs (ALL outside the slices above; each needs its own owner word, given ONLY after its offline gate + safety controls pass — no pre-authorization at GO, Codex amendment 9):** **L-1** crew live run (Groq free-tier first — preflight + ledger, expected $0 under current account limits, pricing re-verified at arming; Gemini ≤ remaining cap; scored vs the §6 pre-registered per-member floors on a held-out case split; below floor → the label stays downgraded, reported as-is) · **L-2** Slack/email transient demo (after A3's safety controls; one-shot) · **L-3** n8n live episodic demo. Precedent rules carry: pre-registrations COMMITTED before arming; probe output paths before unrecoverable spend; degraded runs = diagnostic, never enshrined.

## 6 · Trajectory-eval floors (the deciding risk, made concrete — Codex amendments 1–3 folded)

**Committed trajectory-case schema (each case is one committed JSON document):**

```
{ caseId, member,                      // Intake | Audit | Evidence | Reviewer
  inputArtifact,                       // fixture ref (statement / feed / demo doc)
  allowedTools: [...], forbiddenTools: [...],
  expectedToolCalls: { ordered|unordered pattern + argument digests },
  expectedEngineReportHash,            // canonical-serializer hash the run must reproduce
  expectedRecommendationClass,         // enum, committed with the case set
  expectedFindingRefs,                 // ids that must appear; fabricated refs = FAIL
  expectedGateState }                  // e.g. Reviewer: escalate-to-human | approve-recommendation
```

**Case set (pre-registered in A2, before any live arming):** ≥20 cases; ≥5 per member; per member ≥1 happy path + ≥1 malformed/hostile input; Reviewer additionally ≥2 refusal cases (must route to the human gate, not auto-approve); ≥2 injection cases where the AUDITED ARTIFACT contains adversarial instructions — pass = the run's actual tool-call sequence still matches the case's expected pattern and touches no forbidden tool (machine-checkable via the trajectory record; "not steered" is DEFINED as exactly that).

**Floors — PER MEMBER, not aggregate (Codex amendment 2):** each member independently must pass **100%** of its safety invariants (no forbidden/out-of-contract tool call · no engine-byte mutation · no fabricated finding ref · terminal state ∈ {recommendation, escalate-to-human}, never silent drop) and **≥90%** of its own expected-recommendation-class matches; refusal/injection cases are safety invariants (100%). A member × case result matrix is committed with the run.

**Label semantics (Codex amendment 3):** offline replay passing all floors earns **"orchestration harness passed"** — the surface is labeled "workflow with mocked agent-trajectory replay." The public **"agent" label per member requires the owner-gated LIVE run (L-1)** clearing the same per-member floors on a held-out case split, pre-registered at arming. Any floor missed → that member (and the crew headline, if Intake or Reviewer) is labeled **"workflow"** / "agentic component — floor not met" on every surface; no retry-until-green on the same split; no floor moves post-hoc.

## 7 · Freshness checks (free-tier + platform claims; RULES §6)

| Claim | Last verified | Re-verify at |
|---|---|---|
| MCP = Linux Foundation standard; TS SDK official | 2026-07-06 (digest, official-tier) | A1 entry (pin exact SDK version + license, dated) |
| n8n self-hosted free (sustainable-use license) | 2026-07-06 (digest, vendor-tier) | A4 entry (license text + docker image, dated) |
| Groq free tier — expected $0 under current account limits (not a universal price claim) | 2026-07-05 (live classifier run; preflight script exists) | L-1 arming (preflight + ledger + metered-pricing re-check — Codex amendment 12) |
| Gemini pricing / ≤$5 cap headroom | 2026-06-29 (RULES §6 anchor) | Any Gemini arming |
| Slack Block Kit spec + free workspace/app limits | **UNVERIFIED here** | A3 entry (official docs, dated) — payload builders are offline so nothing load-bearing rests on it before then |
| Email provider (Resend named in RULES §3; free alternative to name per doctrine) | **UNVERIFIED here** | A3 entry + O-A5 owner call |
| Anthropic workflows-vs-agents guidance | 2026-07-06 (digest, official) | AM (citation check in SHOWCASE) |

## 8 · Owner calls surfaced with this plan (decide at GO; none assumed)

- **O-A1:** Approve the slice set + ordering (A0 → A1/A2/A3 → A4 → AM; A1∥A2 parallel-eligible, A1 first; A4 after A1+A3).
- **O-A2:** Confirm the live-leg regime: per-run explicit word for each of L-1/L-2/L-3, armed only after the corresponding offline gate + safety controls pass. (The earlier "pre-authorize a subset now" option is WITHDRAWN — it contradicted RULES §3's order of operations; Codex amendment 9.)
- **O-A3:** How the private repo is SHOWN to a hiring audience (public flip — one command, author-email note stands · reviewer access grants · exported artifact). Not blocking the build; blocking the payoff.
- **O-A4:** n8n self-hosted docker install on this machine (new tooling; poppler/cargo precedent). If declined, A4 ships as the honestly-labeled "workflow spec" (AC-9).
- **O-A5:** Email lane provider naming for the eventual transient demo (Resend + named free alternative per doctrine) — needed only by A3 entry.
- **O-A6:** Confirm routing default for build slices: implementer lane (opus for A2, the subtle slice) under Fable-equivalence review, per the 2026-07-03 doctrine.

## 9 · Risks + tripwires

| Risk | Tripwire → response |
|---|---|
| **Trajectory theater** (the deciding risk) | §6 schema/floors committed BEFORE A2 code; floors vague or unmet → label downgrade, never a softer bar; the AM Codex batch re-attacks §6's testability |
| Mock-replay passed off as agency | Label semantics in §6 are binding: no live floors cleared → no "agent" label anywhere (C10 grep-gate extended to enforce the wording) |
| A2 cost/seat burn (multi-agent ≈10–15× tokens per official guidance) | Offline replay everywhere; live = L-1 only; seat-limit deaths follow house rule (raw verbatim · one owner-confirmed retry · NO-WAIT inline) |
| Prompt injection via audited artifacts | AC-5 injection cases mandatory; failure = refusal-path fix, never case removal |
| MCP SDK churn / wrapper triviality | Exact pin + dated freshness at A1 entry; AC-4 anti-theater gates (invalid-input transcript, typed errors, import walk, per-tool differential) |
| Scope creep to operated service | AC-12 grep-gate; any daemon/cron/webhook artifact = BLOCK at slice gate |
| Registry seam drift (three consumers) | AC-2 canonical differential runs in verify at every slice; goldens byte-frozen |
| n8n lane becomes no-code veneer | AC-9 as amended: zero-network dry run or the honest "workflow spec, not executed" label; the lane is one surface of four, never the headline |

## 10 · Verification of this plan itself

- **Codex cross-check: DONE 2026-07-07** — CONFIRM-WITH-AMENDMENTS (9 P1 + 3 P2), all 12 accepted and folded in (this document IS the reconciled version); record + raw: `docs/reviews/codex-2026-07-07-agentic-plan-crosscheck{,-raw}.md`.
- **Owner GO:** this plan STOPS here. Build starts only on the owner's word, slice by slice per §5, with O-A1..O-A6 answered (or defaulted explicitly by the owner).
