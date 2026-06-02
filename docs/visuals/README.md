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

Because nothing is built yet, every diagram here is currently **TARGET / not yet built** and says so in its title and a top comment. When a slice ships, update the diagram and change its status label to reflect what actually exists.

## Index

| File | Shows | Audience | Status |
| --- | --- | --- | --- |
| `architecture.mmd` | Product target architecture (runtime stack) | Public (product) | TARGET / roadmap |
| `v1-thin-slice-flow.mmd` | The V1 offline slice end-to-end | Public (product) | TARGET (T-001…T-004) |
| `dual-model-workflow.mmd` | Claude + Codex build loop | **Internal only** | Method, not product |

`dual-model-workflow.mmd` is an internal process diagram. Keep it out of the public README (`RULES.md` §8).

## Rendering

These are plain Mermaid files. Render with any Mermaid-aware viewer (GitHub, VS Code Mermaid preview, or the Mermaid live editor). Keep them as `.mmd` source so diffs stay reviewable.
