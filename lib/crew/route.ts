/**
 * ROUTE TABLE — deterministic workflow (S2-crew CP2; gap sheet 2026-10-12
 * page 1 as amended by the Codex cross-check § 3 page 1, adopted in the
 * 2026-10-14 decision-log row).
 *
 * Routing is NOT a model decision. The Reviewer seat keeps the vocabulary its
 * L-1 label was examined on — approve | escalate — and only sees the route this
 * table computes. The table is pure: no clock, no model, no file, no network.
 *
 * OWNERSHIP IS AN INPUT. The caller supplies it from scenario evidence; this
 * table never infers responsibility from the shape of a finding (Codex: "a
 * mapping reference appears" is not evidence that a partner caused anything).
 *
 * Rows, in the order they are tried (first match wins; row 0 dominates all):
 *   0. reviewerDecision "escalate" OR anomalies > 0 → human-escalation {}
 *   1. pack "fees"                                        → compliance {email, ledger}
 *   2. ownership "unknown"                                → human-escalation {}   (Codex 2026-10-14, adopted: unresolved responsibility goes to a person — before any team row, so an onboarding whose owner is not established is not presumed to be the partner's fault)
 *   3. triggerKind "partner-onboarding" OR ownership "integrator" → partner {partner-ticket, slack}
 *   4. otherwise                                          → merchant-ops {slack, email}
 *
 * Plain: a fixed, printed table decides which team a finding goes to and
 * which messages get drafted for it. Anything suspicious, or anything nobody
 * clearly owns, goes to a person instead. The AI reviewer can only say "yes,
 * send it there" or "a person should look".
 */

export type RoutePack = "listings" | "fees" | "conformance";
export type TriggerKind = "sweep" | "order-errors" | "complaint" | "partner-onboarding" | "agent-preflight";
export type Ownership = "merchant" | "integrator" | "platform" | "unknown";
export type RouteName = "merchant-ops" | "partner" | "compliance" | "human-escalation";
export type RouteArtifact = "slack" | "email" | "partner-ticket" | "ledger";

/** The label this table carries on every surface. */
export const ROUTE_TABLE_LABEL = "deterministic workflow";

export interface RouteInput {
  readonly pack: RoutePack;
  readonly triggerKind: TriggerKind;
  readonly findingCategories: readonly string[];
  readonly maxSeverity: "error" | "warn" | "none";
  readonly reviewerDecision: "approve" | "escalate";
  readonly anomalies: number;
  readonly ownership: Ownership;
}

export interface RouteResult {
  readonly route: RouteName;
  readonly artifacts: readonly RouteArtifact[];
  /** One sentence naming the rule row that decided. */
  readonly reason: string;
}

function result(route: RouteName, artifacts: readonly RouteArtifact[], reason: string): RouteResult {
  return Object.freeze({ route, artifacts: Object.freeze([...artifacts]), reason });
}

/** Apply the table. Pure and total: every input lands on exactly one row. */
export function route(input: RouteInput): RouteResult {
  if (!Number.isInteger(input.anomalies) || input.anomalies < 0) {
    throw new Error(`route: anomalies must be a non-negative integer, got ${String(input.anomalies)}`);
  }
  if (input.reviewerDecision === "escalate" || input.anomalies > 0) {
    const why =
      input.reviewerDecision === "escalate" && input.anomalies > 0
        ? `the reviewer escalated and ${input.anomalies} anomaly(ies) are on record`
        : input.reviewerDecision === "escalate"
          ? "the reviewer escalated"
          : `${input.anomalies} anomaly(ies) are on record`;
    return result("human-escalation", [], `Row 0 (dominates every row): ${why}, so a person decides.`);
  }
  if (input.pack === "fees") {
    return result("compliance", ["email", "ledger"], "Row 1: fee-pack findings go to compliance with an email and a ledger record.");
  }
  if (input.ownership === "unknown") {
    return result("human-escalation", [], "Row 2: no owner is established by the evidence, so a person decides who owns it (unresolved responsibility is never presumed to be a partner's).");
  }
  if (input.triggerKind === "partner-onboarding" || input.ownership === "integrator") {
    const why = input.triggerKind === "partner-onboarding" ? "the trigger is a partner onboarding" : "the evidence names the integrator as owner";
    return result("partner", ["partner-ticket", "slack"], `Row 3: ${why}, so it goes to the partner team with a partner ticket and a Slack digest.`);
  }
  return result("merchant-ops", ["slack", "email"], "Row 4: everything else goes to merchant operations with a Slack digest and a merchant email.");
}
