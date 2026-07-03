/**
 * The SHARED ground-truth schema for claim verification — one source of truth for BOTH
 * the deterministic claims-gatekeeper (lib/agents/gatekeeper.ts, forward claim→data check)
 * AND the semantic faithfulness judge (lib/agents/semantic-judge.ts, reverse prose→data
 * entailment). Extracted here (was private to the gatekeeper) so the two controls can never
 * drift on WHICH merchant fields a claim may legitimately cite — the same one-source-of-truth
 * discipline lib/agents/state-consistency.ts already gives the gate + the eval (spec R-ARCH-2).
 *
 * A factual assertion that traces to one of these fields is verifiable; anything else is
 * either unverifiable (a field not in this set) or — for the semantic judge — an UNSUPPORTED
 * claim (a fabrication the forward-checker can't see because the model never declared it).
 */
import type { Merchant } from "@/legacy/activation/lib/core/types";

/** Merchant fields a claim is allowed to cite (a claim outside this set is unverifiable). */
export const CLAIMABLE_FIELDS = new Set<string>([
  "merchant_name",
  "merchant_category",
  "steps_completed",
  "total_steps",
  "current_blocker_code",
  "next_best_action",
  "risk_level",
  "risk_score",
  "days_since_signup",
  "last_login_days_ago",
]);

/**
 * The claimable subset of a merchant as a plain facts object — the SOURCE OF TRUTH the
 * semantic judge grounds entailment on (and exactly the fields the gatekeeper trusts). String
 * or number values only; anything else is omitted. This is the "structured data row, not
 * retrieved RAG context" the whole verification-rigor positioning rests on.
 */
export function merchantFacts(merchant: Merchant): Record<string, string | number> {
  const rec = merchant as unknown as Record<string, unknown>;
  const facts: Record<string, string | number> = {};
  for (const field of CLAIMABLE_FIELDS) {
    const v = rec[field];
    if (typeof v === "string" || typeof v === "number") facts[field] = v;
  }
  return facts;
}
