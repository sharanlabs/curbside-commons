# Visuals

Diagrams explain the system; they do not decorate it. Mermaid (`.mmd`) by default.

## Standard (from `RULES.md` §7)

1. Every diagram explains a real workflow, decision, or architecture.
2. A diagram must be understandable in under a minute.
3. If implementation changes a workflow, update the diagram in the same task.
4. Visuals must not imply features that are not built yet.
5. Future-state diagrams must be clearly labeled **roadmap / target**.
6. The public README should eventually carry only product diagrams, not internal process diagrams.
7. Do not let the dual-model diagram overshadow the product.

## Status labels

Diagrams mark **built vs. target** inline — solid = built, dashed = roadmap/target — in the title and a top comment (`RULES.md` §7.4–7.5). As of 2026-06-09, Phases 1–2 (the deterministic core, HITL gate, guardrails, eval harness) are **built**; the agentic/integration layers are **target**. Update a diagram's labels in the same task that changes the workflow.

## Index

| File | Shows | Audience | Status |
| --- | --- | --- | --- |
| `architecture.mmd` | Layered architecture (data · core · agent · control · HITL · eval · obs · integrations) | Public (product) | Built + target |
| `agentic-workflow.mmd` | End-to-end workflow with guardrail + HITL control points | Public (product) | Built + target |
| `autonomy-ladder.mmd` | L0–L4 autonomy, each rung earned by evidence | Public (product) | Built + target |
| `eval-harness.mmd` | Eval + regression + adversarial probes → baseline | Public (product) | Built (T-002) + next |
| `data-lineage.mmd` | Add-alongside v1/v2 data lanes + provenance | Public (product) | Built + target |
| `controls-map.mmd` | Controls × NIST functions × OWASP threats | Public (product) | Built + target |
| `v1-thin-slice-flow.mmd` | The V1 offline slice end-to-end | Public (product) | Built (T-001) |
| `dual-model-workflow.mmd` | Claude + Codex build loop | **Internal only** | Method, not product |

> New diagrams (2026-06-09) accompany `docs/architecture/agentic-architecture-blueprint.md`. They are **drafts pending render-validation** (open in a Mermaid viewer) + Codex review.

`dual-model-workflow.mmd` is an internal process diagram. Keep it out of the public README (`RULES.md` §8).

## Rendering

These are plain Mermaid files. Render with any Mermaid-aware viewer (GitHub, VS Code Mermaid preview, or the Mermaid live editor). Keep them as `.mmd` source so diffs stay reviewable.
