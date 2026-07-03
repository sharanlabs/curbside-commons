/**
 * Evidence types — W0 STUB (plan C2).
 *
 * Per C2, every finding must carry FOUR things: the claim, the reference-row id,
 * the rule / spec-clause id, and a severity. A W1 eval asserts no finding is ever
 * emitted without all four. W0 only declares the shape — the four C2 fields are
 * REQUIRED by the type, so a finding cannot be constructed without them. No
 * drift-detection logic exists yet.
 *
 * Plain: a "finding" is a caught drift WITH its receipts — what was claimed, which
 * truth row it was checked against, which rule it broke, and how bad it is.
 */
import type { Claim } from "./claim";

/** Severity ladder for a finding (W1 may refine thresholds). */
export type Severity = "info" | "warn" | "error";

/** Ordered severities — runtime export so packs and evals can enumerate them. */
export const SEVERITY_LEVELS: readonly Severity[] = ["info", "warn", "error"];

/**
 * One evidence-cited finding. All four C2 fields are required by construction.
 */
export interface Finding {
  /** The claim under audit (C2). */
  readonly claim: Claim;
  /** Id of the reference row the claim was checked against (C2). */
  readonly referenceRowId: string;
  /** The rule or spec-clause id that was violated (C2). */
  readonly ruleId: string;
  /** How severe the drift is (C2). */
  readonly severity: Severity;
  /** Plain-words line for the one-page report (C4); optional until W3. */
  readonly plainLine?: string;
}
