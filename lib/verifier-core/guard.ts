/**
 * C2 finding guard — the runtime enforcer of "no finding without its receipts".
 *
 * Per C2 every finding must carry FOUR things: the claim, the reference-row id,
 * the rule / spec-clause id, and a severity. The `Finding` TYPE already makes all
 * four required at compile time, but data crossing a runtime boundary (a JSON feed
 * parsed at the CLI, a hand-built fixture, a mutation test) is not compile-checked.
 * `makeFinding` is the single constructor every detector calls; it validates the
 * four fields at runtime and throws on any missing/empty one, so a finding without
 * receipts cannot exist even on a runtime path. The C2 eval drives the throwing
 * edge cases.
 *
 * Plain: the rule "every catch must show its receipts" is checked by a real guard,
 * not just trusted. Try to build a finding without all four receipts and it errors.
 */
import type { Claim } from "./claim.ts";
import type { Finding, Severity } from "./evidence.ts";
import { SEVERITY_LEVELS } from "./evidence.ts";

/** Raw input to {@link makeFinding} — same shape as Finding, validated at runtime. */
export interface FindingInput {
  readonly claim: Claim;
  readonly referenceRowId: string;
  readonly ruleId: string;
  readonly severity: Severity;
  readonly category?: string;
  readonly plainLine?: string;
}

/** Thrown when a finding is constructed without all four required C2 fields. */
export class MissingEvidenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MissingEvidenceError";
  }
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/**
 * Construct a validated, frozen {@link Finding}. Throws {@link MissingEvidenceError}
 * if any of the four C2 fields is missing or empty. This is the ONLY sanctioned way
 * to build a finding in the wedge — detectors never build the object literal directly.
 */
export function makeFinding(input: FindingInput): Finding {
  if (input.claim === undefined || input.claim === null || !isNonEmptyString(input.claim.id)) {
    throw new MissingEvidenceError("C2 violated: finding requires a claim with a non-empty id");
  }
  if (!isNonEmptyString(input.referenceRowId)) {
    throw new MissingEvidenceError("C2 violated: finding requires a non-empty referenceRowId");
  }
  if (!isNonEmptyString(input.ruleId)) {
    throw new MissingEvidenceError("C2 violated: finding requires a non-empty ruleId (rule/spec-clause)");
  }
  if (!SEVERITY_LEVELS.includes(input.severity)) {
    throw new MissingEvidenceError(
      `C2 violated: finding requires a valid severity (one of ${SEVERITY_LEVELS.join(", ")})`,
    );
  }
  return Object.freeze({
    claim: input.claim,
    referenceRowId: input.referenceRowId,
    ruleId: input.ruleId,
    severity: input.severity,
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.plainLine !== undefined ? { plainLine: input.plainLine } : {}),
  });
}

/**
 * Runtime re-assertion that an already-built finding still carries all four fields
 * (used by the report builder / evals as a belt-and-suspenders C2 check on data
 * that did not necessarily pass through {@link makeFinding}).
 */
export function assertHasEvidence(finding: Finding): void {
  makeFinding(finding);
}
