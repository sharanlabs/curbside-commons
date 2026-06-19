# Prompt Intake Protocol — Intent Capture & Prompt Synthesis Layer

> Standing protocol, constitution-level via `RULES.md` §16. Applies to **every session, account, and IDE** that works this repo — it lives in the repo precisely so it travels (the repo is the cross-account source of truth; every session reads it on startup). If it ever conflicts with `RULES.md`, `RULES.md` wins.

## Why this exists

The owner's input may be rough, broken, mistyped, or ungrammatical. That must **never** degrade output. Before acting on owner input, the agent reconstructs the **true intent** and synthesizes an **effective, current-best-practice prompt** — without diluting, summarizing, or dropping anything. This is a **layer** the rest of the system sits behind.

## Durable principles (these don't age — techniques do)

1. **Raw input is authoritative.** Preserve the owner's exact words; never discard or summarize them away. The raw text is the source of truth; the synthesized prompt *serves* it.
2. **Fidelity over formatting.** Capture full intent + nuance. Structure clarifies; it must never reduce meaning. If the two ever trade off, keep fidelity.
3. **Surface every assumption.** When synthesis *adds* anything the owner did not say (an inferred constraint, a scoping call, a default), state it as an **explicit assumption** — do not bury it inside a polished prompt. Fidelity beats fluency.
4. **Disambiguate before expensive work.** If intent is genuinely ambiguous *and* the work is consequential or irreversible, confirm first. For trivial/clear requests, proceed.

## The layer (applied to every owner input)

1. **Preserve** the raw input verbatim (in the working record / task).
2. **Reconstruct intent** — correct only *interpretation* (typos / grammar / ambiguity); extract goal, core, constraints, success criteria, scope, risks; flag real ambiguities.
3. **Synthesize** an effective prompt aligned to the **current** model + playbook (role · context · task · constraints · output spec · success criteria · guardrails).
4. **Proportionality (anti-bloat — this project's documented #1 failure mode):** **default lightweight** — do the intent-capture *silently* and proceed. **Surface** the structured interpretation (or a confirm question) only when the request is **ambiguous or consequential** (scope · architecture · tools · data · AI behavior · public claims · security · cost · anything irreversible). Do **not** echo a formatted prompt block on a trivial request ("fix the typo") — that is friction-theater the owner will come to hate.
5. **Execute** against the synthesized prompt; keep **both** raw + structured on record.

## Self-updating (not static)

Keep **techniques out of this doc.** Specific prompting tactics live in (a) the current model's official docs and (b) updatable prompt-engineering skills — consulted **at synthesis time** and re-verified for freshness (`RULES.md` §6). The **principles** above are stable; the **techniques** they invoke evolve with the models. That separation is what makes this self-updating **with no maintenance** — tomorrow's model/guideline change is picked up automatically because nothing here hardcodes today's tricks.

## Skill-independence (portability)

The protocol's **core must work with zero skills installed** — it travels via the repo to any account/IDE, where machine-local skills may not exist. Prompt-engineering skills (`enhance-prompt`, `prompt-master`, `senior-prompt-engineer`, `prompt-engineering-patterns`, `prompt-governance`, `prompt-engineer-toolkit`) are **optional accelerators** used *if present* — never dependencies.

## Misinterpretation hazard (the failure mode to guard)

The danger of an intent-reconstruction layer is **confident rewriting that smuggles in assumptions the owner never made.** Guards: raw stays authoritative (principle 1); material additions are surfaced as explicit assumptions (principle 3); ambiguity on consequential work triggers a confirm (principle 4). **When unsure, ask — do not invent.**

## Verification (Codex / any reviewer)

A reviewer checks: was the raw input preserved? was intent captured faithfully (no dilution/summary)? were added assumptions surfaced (not buried)? was proportionality right (no friction on trivial; no silent guessing on consequential)? Skipping it on meaningful owner-driven work is a process finding.
