/**
 * Claim schema — W0 STUB (verifier-core skeleton, plan §6).
 *
 * A "claim" is any assertion made by a serving copy (an ACP feed row, a UCP
 * catalog response, or a fee-statement line) that the verifier will later check
 * against the merchant's system-of-record. W1 fills the concrete per-field rules;
 * this file only fixes the shape so the reference, evidence, and report types can
 * compile. No drift logic here.
 *
 * Plain: a claim is one thing a menu or bill SAYS. The verifier checks each claim
 * against the truth.
 */

/** Where a claim came from — the serving surface (plan §3, C3 surface-agnostic). */
export type ClaimSource = "acp-feed" | "ucp-catalog" | "fee-statement";

/** A single assertion under audit. The field set is intentionally minimal in W0. */
export interface Claim {
  /** Stable id of the claim within its source document (row / line id). */
  readonly id: string;
  /** The serving surface this claim was read from. */
  readonly source: ClaimSource;
  /** Dotted path to the asserted field, e.g. "price.amount" (W1 formalizes). */
  readonly field: string;
  /** The asserted value; untyped until W1's per-field schema lands. */
  readonly value: unknown;
}
