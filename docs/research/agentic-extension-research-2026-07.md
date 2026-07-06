# Agentic Extension — Live Research Digest (as of 2026-07-06)

**Why this exists:** the owner's 2026-07-06 directive (decision-log, verbatim rows) extends the program: the showcase target is the **applied-AI / agentic-systems / AI-automation** proficiency companies currently hire for — agents, multi-agent systems, AI workflows, integrations (Slack, email, MCP, n8n/Zapier-class), built on frontier models — explicitly NOT model development/training, and NOT no-code-only toy use. Target roles named by the owner: AI Engineer, AI Specialist, Applied AI Engineer, AI Automation Specialist. This digest grounds the goal re-fix in live, dated sources per the standing rule (enterprise claims are researched, never memory-based).

**Provenance:** the delegated `research-specialist` subagent died on the seat limit (raw verbatim: "You've hit your session limit · resets 1:30pm (America/New_York)"); the owner's `resume` confirmed continuation and the pass converted INLINE (NO-WAIT precedent) — 6 live WebSearch sweeps, 2026-07-06. One transient harness classifier error on one search (retried clean). Community/vendor blog figures below are FIELD SIGNALS unless marked official; load-bearing claims carry ≥2 independent sources or are labeled.

---

## 1. Terminology + roles — the owner's targeting is validated verbatim

- **"AI Engineer" is the fastest-growing US job title for the second year running** — ~75,000 of LinkedIn's ~639,000 new AI postings; commonly relabeled **"Applied AI," "GenAI," or "LLM Engineer."** (herohunt.ai 2026 rankings, practitioner tier; corroborated by qureos hiring guide, July 2026.)
- **Agentic-AI job postings grew ~280% YoY to ~90,000 US listings in 2026** — these roles "build autonomous systems that plan, call tools, hold state across steps." (herohunt.ai / agentic-jobs trackers, practitioner tier — treat magnitude as directional, trend as solid across sources.)
- **"AI Automation Specialist"** is a real, distinct lane: builds AI-driven workflows integrating enterprise tools/APIs — "workflows too complex for a marketer with Zapier, but too small for a full-time engineering team" (mraiwala.com 2026 role comparison, practitioner tier). This matches the owner's n8n/Zapier/MCP framing exactly.
- **The product category is a "vertical AI agent"** — a domain-specific agentic system (Lindy/8seneca/ACTGSYS category explainers, 2026; vendor/practitioner tier).
- **Applied-vs-research split confirmed:** "Most companies don't actually need custom models; they need to use existing models well — foundation models cover ~80% of use cases" (qureos hiring guide 2026). The owner's "not developing or training LLMs" boundary is exactly where the demand is.

**Verdict:** what the owner described is professionally called **agent engineering / applied AI engineering**, building **agentic AI systems (vertical AI agents) and AI workflow automations**. The named tools (Claude Code/Codex, n8n, MCP, Zapier) are recognized floor-not-ceiling instruments of that lane.

## 2. Architecture patterns companies ship (official guidance, dated)

- **Anthropic, "Building Effective AI Agents" (+ 2026 architecture-patterns PDF, official):** start simple; add agency only when flexibility outweighs latency/cost/error-compounding; **workflows (deterministic orchestration) vs agents (model-directed) is the first design decision**; multi-agent systems cost ~10–15× tokens and "take months to get right" — use them only where justified; modular design so capabilities evolve without redesign.
- **2026 trend (Anthropic agentic-coding trends report, official):** value shifts to **"digital assembly lines" — human-guided multi-step workflows where multiple agents run end-to-end processes, enabled by MCP.**
- The dominant professional pattern: **agents operating VERIFIED TOOLS, with deterministic backbones and human-in-the-loop gates** — not free-roaming autonomy.

**Implication:** our existing deterministic engine + honesty gates is not a detour — it is the *hard part* of the currently-recommended architecture. The missing layer is the orchestration/agents/integrations on top.

## 3. MCP — industry infrastructure, not a bet (official/strong)

- Introduced by Anthropic (Nov 2024); **adopted by OpenAI (March 2025), Google DeepMind, Microsoft, Salesforce**; **donated to the Agentic AI Foundation under the Linux Foundation (Dec 2025, co-founded Anthropic + Block + OpenAI)** (Wikipedia + WorkOS 2026 guide, official/strong secondary).
- Adoption metrics (field signals, single-source magnitudes): ~97M monthly SDK downloads by March 2026; "78% of enterprise AI teams have MCP-backed agents in production" (andrew.ooo July-2026 state-of-play; UNVERIFIED magnitude, direction corroborated).
- **Exposing your product as an MCP server is a recognized professional pattern** — 10,000+ public MCP servers at donation time (Anthropic figure via Wikipedia).

## 4. Workflow-automation platforms (the AI-automation lane)

- **n8n:** $180M Series C (Oct 2025), **$2.5B valuation**, >180k GitHub stars; serves as **the orchestration layer for SAP's Autonomous Enterprise platform** (n8n blog + chronexa/hatchworks 2026 guides; vendor+practitioner). Free self-hosted tier fits our cost rules.
- **The 2026 consensus pattern matches our thesis verbatim:** "n8n provides the reliable backbone for business processes — deterministic workflows that must execute consistently — while AI agents plug in at specific points where intelligence is needed" (superstackit/entrans 2026, practitioner tier).

## 5. Evals / observability — table stakes, and our strongest card

- LangChain **State of Agent Engineering** (vendor survey, 2026): **~89% of agent teams have observability; 94% among in-production teams (71.5% full tracing); evals adoption ~52–71.5%.**
- Hiring-signal consensus (digitalapplied 2026 hiring guide + braintrust/arthur playbooks, practitioner/vendor): the current skill list = **agent orchestration · MCP integration · eval design · prompt engineering · RAG · cost optimization · guardrails · observability · frontier-model fluency**. Quote: **"Eval literacy is the single biggest signal of 'this person actually built with LLMs.'"**
- Portfolio-specific (agenticcareers 2026, practitioner): tool use itself is table stakes — **what impresses is edge-case handling, loop prevention, and an eval suite (≥20 test cases)**. Our repo has 749 tests, pre-registered eval floors, and anti-theater baselines — far past that bar; the gap is purely that no agentic layer sits on top yet.

## 6. Vertical-agent positioning references

- **Sierra** (customer-service agents; Bret Taylor): $950M raise May 2026, **$15.8B valuation**, $100M ARR in ~7 quarters. **Harvey** (legal agents): **$300M ARR, $11B valuation** Q2 2026 (saasmag/8seneca/foundevo 2026 roundups; magnitudes single-sourced per name, directionally consistent across all).
- Their public architecture story: **domain-deep agents + integrations into the tools customers already use (Slack, Salesforce, Drive, M365) + outcome framing.** Slack-first delivery is the norm for internal-facing agents.

## 7. Implications for this project (synthesis)

1. **The market name for what we're building:** an **agentic AI system / vertical AI agent** for marketplace truth & fee-compliance auditing, built by **applied-AI engineering** — with an **AI-workflow/automation** surface (n8n lane) covering the automation-specialist story.
2. **The architecture the evidence endorses is the one we can honestly build:** deterministic verified core (done) → agent crew orchestrating it as tools (to build) → MCP server exposure (to build) → Slack/email delivery (to build, offline-first per RULES §3) → observability/tracing + eval-in-CI (largely done; needs the agent-trajectory surface) → n8n workflow calling the same tools (optional lane, showcases the automation role).
3. **Differentiator:** most portfolio agents are demos without discipline; ours inverts that — the discipline exists and is gated; the agentic layer lands on top of it. Anthropic's own guidance (workflows-vs-agents, agents-over-tools, cost-aware multi-agent) is directly citable as the design rationale.
4. **Honesty constraints carry over unchanged:** agents recommend, the engine decides; simulated labels; no live integration until the offline slice + safety controls exist (RULES §3); live runs owner-gated; prototype-not-service.

**Freshness:** all sources fetched live 2026-07-06. Figures from vendor/practitioner posts are labeled; role-demand magnitudes are directional field signals; official-tier items: Anthropic agent guidance + trends report, MCP Linux-Foundation governance, OpenAI/Google/Microsoft MCP adoption.
