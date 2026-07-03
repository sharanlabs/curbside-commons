/**
 * Swappable reference interface — W0 STUB (plan §3 "swappable reference interface").
 *
 * A reference is the source-of-truth a claim is checked against: a JSON schema, a
 * POS catalog, or a fee-rule table. "One engine, many references" is the design
 * bet the packs prove or break. W1 implements concrete resolvers; W0 only fixes
 * the contract — no resolution logic here.
 *
 * Plain: the "truth" side of the check. Menus check against the merchant's
 * catalog; fees check against the codified rule table. Same socket, different plug.
 */
import type { Claim } from "./claim";

/** Kinds of reference a pack can plug in (plan §3). */
export type ReferenceKind = "json-schema" | "pos-catalog" | "fee-rule-table";

/** How claim↔reference matching was performed — labeled in every report (C3). */
export type MatchingMode = "synthetic-controlled" | "real-world";

/** The truth-side row a claim matched, plus how the match was made (C3). */
export interface ReferenceMatch {
  /** Id of the matched reference row / rule — cited in every finding (C2). */
  readonly referenceRowId: string;
  /** Whether matching used shared synthetic IDs or real-world resolution (C3). */
  readonly matching: MatchingMode;
  /** The truth-side value; untyped until W1. */
  readonly value: unknown;
}

/**
 * A reference resolves the truth-side row / rule a given claim should be judged
 * against. Returns the match (carrying the reference-row id used for evidence
 * citation, C2) or null when the claim cannot be matched. STUB: no logic yet.
 */
export interface Reference {
  readonly kind: ReferenceKind;
  resolve(claim: Claim): ReferenceMatch | null;
}
