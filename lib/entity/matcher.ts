/**
 * E4 — the ADVISORY entity-resolution ensemble (pre-reg §1/§4).
 *
 * ARCHITECTURE, restated where the code lives: this matcher is ADVISORY and
 * can NEVER gate — it proposes candidate matches with scores; nothing in the
 * verification engine imports this module (a structural eval proves that),
 * EXACT matching remains the protected default everywhere the engine
 * consumes identity, and every score inside the registered ambiguity band
 * routes to a human (ABSTAIN). Its worst failure — a FALSE MERGE — attaches
 * one business's findings to another business; that named cost is why the
 * floors are precision-weighted and below-threshold NEVER auto-merges.
 *
 * Ensemble (weights registered here, frozen with the thresholds BEFORE
 * scoring): 0.5 · Jaro-Winkler(normalized) + 0.35 · token-set ratio +
 * 0.15 · phonetic (Soundex token-set). Inputs are baseline-normalized first
 * (the SAME A2 chain the baseline uses — the ensemble's edge must come from
 * fuzzy similarity, not from a private normalizer the baseline is denied).
 *
 * Plain: three rulers vote on how alike two names are; a high blend proposes
 * "probably the same business," a low blend "different," and the middle says
 * "ask a human." It only ever SUGGESTS — the checker itself still requires
 * exact identity.
 */
import { baselineNormalize } from "./normalize.ts";
import { jaroWinkler, phoneticSimilarity, tokenSetRatio } from "./similarity.ts";

export const ENSEMBLE_WEIGHTS = Object.freeze({ jaroWinkler: 0.5, tokenSet: 0.35, phonetic: 0.15 });

export type MatchVerdict = "SAME" | "DIFFERENT" | "ABSTAIN";

export interface MatchResult {
  readonly a: string;
  readonly b: string;
  readonly normalizedA: string;
  readonly normalizedB: string;
  readonly score: number;
  readonly verdict: MatchVerdict;
  /** Always true — this lane cannot gate anything (pre-reg §1). */
  readonly advisory: true;
  /** The registered scope label, rendered wherever E4 surfaces. */
  readonly scopeLabel: string;
}

export const E4_SCOPE_LABEL =
  "entity resolution validated on a SYNTHETIC adversarial name corpus — advisory only; exact matching remains the system default";

/** The blended similarity score in [0, 1]. */
export function ensembleScore(a: string, b: string): number {
  const na = baselineNormalize(a);
  const nb = baselineNormalize(b);
  return (
    ENSEMBLE_WEIGHTS.jaroWinkler * jaroWinkler(na, nb) +
    ENSEMBLE_WEIGHTS.tokenSet * tokenSetRatio(na, nb) +
    ENSEMBLE_WEIGHTS.phonetic * phoneticSimilarity(na, nb)
  );
}

/**
 * Propose a match under the two frozen thresholds (T_match > T_abstain,
 * tuned on the tune split ONLY, committed before scoring): score ≥ T_match →
 * SAME; score ≤ T_abstain → DIFFERENT; between → ABSTAIN to the human.
 */
export function proposeMatch(a: string, b: string, tMatch: number, tAbstain: number): MatchResult {
  if (!(tMatch > tAbstain)) {
    throw new Error(`E4: T_match (${tMatch}) must be strictly greater than T_abstain (${tAbstain})`);
  }
  const score = ensembleScore(a, b);
  const verdict: MatchVerdict = score >= tMatch ? "SAME" : score <= tAbstain ? "DIFFERENT" : "ABSTAIN";
  return {
    a,
    b,
    normalizedA: baselineNormalize(a),
    normalizedB: baselineNormalize(b),
    score,
    verdict,
    advisory: true,
    scopeLabel: E4_SCOPE_LABEL,
  };
}
