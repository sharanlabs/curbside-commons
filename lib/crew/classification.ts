/**
 * A2 WORKFLOWS-VS-AGENTS CLASSIFICATION — the committed, per-member honesty
 * table (plan §3; Anthropic "Building Effective AI Agents" workflows-vs-agents
 * guidance as the design rationale, research digest §2, fetched 2026-07-06).
 *
 * LABEL SEMANTICS (plan §6, binding): in this slice every member runs on
 * RECORDED turns — the model-directed classification below describes the
 * DESIGNED role, not an earned capability. Offline replay passing all floors
 * earns "orchestration harness passed" only; the "agent" label per member is
 * earned SOLELY by the owner-gated live run (L-1) clearing the pre-registered
 * floors on a held-out split — until then the honest public label is
 * "workflow with mocked agent-trajectory replay".
 *
 * Plain: two of the four teammates are DESIGNED to think with a model and two
 * are plain checklists — but nobody here gets called an "agent" until the real
 * live exam is passed, with the owner's say-so.
 */
import type { CrewMemberName } from "./types.ts";

export interface MemberClassification {
  readonly member: CrewMemberName;
  /** The honest architectural class per the Anthropic workflows-vs-agents split. */
  readonly designedClass: "model-directed step" | "deterministic workflow";
  readonly rationale: string;
}

export const MEMBER_CLASSIFICATION: readonly MemberClassification[] = Object.freeze([
  Object.freeze({
    member: "intake" as const,
    designedClass: "model-directed step" as const,
    rationale:
      "Routing a messy ask + artifact to the right tool is a classification the rulebook cannot enumerate — model-directed, contained by the orchestrator's allowed/forbidden gate.",
  }),
  Object.freeze({
    member: "audit" as const,
    designedClass: "deterministic workflow" as const,
    rationale:
      "Executing the routed tool through callTool and refusing non-decision-grade results is pure procedure — no model in the loop (agents-over-verified-tools).",
  }),
  Object.freeze({
    member: "evidence" as const,
    designedClass: "deterministic workflow" as const,
    rationale:
      "Assembling recommendations that reference the engine's own finding ids, with the class derived from the report, is deterministic by design — the model never picks the class.",
  }),
  Object.freeze({
    member: "reviewer" as const,
    designedClass: "model-directed step" as const,
    rationale:
      "Judging whether recommendations warrant human attention is model-directed — but it sits UNDER the human gate, and containment overrides any approval when anomalies exist.",
  }),
  // S2-crew (2026-10-31): the two new seats.
  Object.freeze({
    member: "root-cause" as const,
    designedClass: "model-directed step" as const,
    rationale:
      "Explaining WHY a copy drifted is model-directed by design — but in this slice the seat is NEVER called live: the orchestrator runs the deterministic explain_drift baseline and renders the LLM seat DEFER until it passes a pre-registered exam.",
  }),
  Object.freeze({
    member: "impact" as const,
    designedClass: "deterministic workflow" as const,
    rationale:
      "Sizing orders at risk and refund exposure is arithmetic over findings and a synthetic orders file (size_impact) — no model in the loop; every figure is labeled simulated.",
  }),
]);

/** The state the LLM root-cause seat renders in this slice (never called live; no exam on any model). */
export const ROOT_CAUSE_SEAT_STATE = "DEFER";
