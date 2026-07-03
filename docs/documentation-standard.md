# Documentation Standard

**Status:** standing owner directive (2026-07-02). These are **floor requirements, not a ceiling** — every document meets them; documents may exceed them. `RULES.md` remains the constitution; this standard elaborates §7 (visuals) and the Legibility principle.

## The two-register principle

Professional and plain registers coexist; neither dilutes the other.

- **Professional register leads** in all working documents: use the correct technical, business, and operational terminology (system-of-record, reconciliation, conformance, drift, precision/recall, calibration, HITL, take-rate, …). Never paraphrase a term of art into vagueness.
- **Every term is decoded**: a one-line plain explanation at first use in a document, and a durable entry in [`GLOSSARY.md`](GLOSSARY.md) (the shared decoder ring, linked from every major doc).
- **`PLAIN-ENGLISH.md` stays the pure lay entry-point** — the whole project in one cold read.
- **Divergence between registers is a defect.** If the plain story and the technical docs disagree, flag and fix in the same task.

## Frameworks adopted (the floor)

| Framework | What it governs here | Rule |
| --- | --- | --- |
| **Diátaxis** | Documentation architecture | Every doc knows its type — tutorial, how-to, reference, or explanation — and doesn't mix them accidentally. (PLAIN-ENGLISH = explanation; validator README = tutorial/how-to; rule tables & specs = reference.) |
| **Pyramid Principle (Minto) / SCQA** | Summaries + narrative | Answer first, support after. Narrative sections follow Situation → Complication → Question → Answer. This — story structure — is where emotional resonance comes from; never adjectives or hype. |
| **C4 model** | Architecture visuals | Level 1 (context) is the lay view; container/component levels serve engineers. "Simple outside, rigorous inside," drawn. |
| **ADRs** | Decisions | Already in use (`docs/decisions/`). Unchanged. |
| **Docs-as-code** | Maintenance | Docs live in the repo, are reviewed like code, and update **in the same commit** as the behavior they describe. |
| **RULES §7** | All diagrams | Mermaid default; every diagram explains a real workflow/decision; understandable in under a minute; updated in the task that changes the workflow; no implied unbuilt features. |

## Visual + text standard

- Visuals and text carry the **same message** — a reader of either alone should not be misled.
- One **canonical truth-flow diagram** (merchant system-of-record → copies across surfaces → AI agent → the verifier) is the reused anchor visual across docs.
- The demo has a **storyboard** (drawn before built).
- Charts/dashboards follow the project's data-viz discipline; no decorative visuals (RULES §7).

## Writing craft (floor)

1. **Flow:** each paragraph earns the next; no orphaned bullets where prose should connect ideas.
2. **Tone:** confident, precise, warm. Nuance stated, not hedged away.
3. **Resonance by narrative, not hype:** the story spine ("the agent gets lied to; the referee catches it before it acts") carries the emotional weight. Adjective inflation is a defect.
4. **Anti-slop pass** on anything public-facing (de-AI-tell, voice check) before it ships.
5. **Honesty boxes** mandatory in public-facing docs (what we are NOT claiming — RULES §4/§6).
6. **Layperson-checkable:** a nontechnical reader can follow the argument of any doc via the first-use decodes + glossary, without the doc being written *for* them.

## Per-document floor checklist

Before a meaningful doc lands: correct terminology used (not paraphrased) · first-use decodes present · glossary updated with any new terms · diagram present where a flow/decision exists · pyramid-style summary at top · honesty box if public-facing · anti-slop pass if public-facing · PLAIN-ENGLISH.md updated if the change is meaningful.

## Maintenance rule (same-breath)

Every meaningful project change updates, **in the same commit**: the technical doc(s) + `PLAIN-ENGLISH.md` + new `GLOSSARY.md` terms + the affected diagram(s). Documentation debt is tracked like code debt.
