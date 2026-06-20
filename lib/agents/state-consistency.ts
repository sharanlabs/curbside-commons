/**
 * Tense-aware prose state-consistency check — the PRODUCT-tier refinement of the pinned
 * core guardrail's completion-claim detection.
 *
 * WHY (surfaced by the live run, 2026-06-20): the core guardrail (a faithful Python port,
 * frozen by the differential test) flags the bare noun "business verification" regardless of
 * tense, so a TRUTHFUL imperative draft ("please complete business verification") false-trips
 * state_mismatch. We must not change the pinned core (it would diverge from the Python oracle),
 * so the product gate + eval use THIS more-precise check instead: a completion claim must be a
 * COMPLETED assertion (past-tense / explicit "done" state). Imperative/future phrasing
 * ("complete X", "verify your X", "your next step is to X") does NOT trip it.
 *
 * Only the verification patterns are tightened vs the core (they required just the noun); the
 * menu/photos/hours patterns already required past-tense done-words and are carried as-is.
 */

/** [pattern, minimum steps_completed for the claim to be TRUE]. Past-tense / "done" only. */
const COMPLETED_CLAIMS: Array<[RegExp, number]> = [
  // business/identity verification DONE (tightened: requires "verified" or "verification ... complete/done")
  [/\bbusiness\b.{0,25}\bverification\s+(?:is\s+|was\s+|already\s+)?(?:complete|done|approved|passed|finished)\b/i, 1],
  [/\bbusiness\b.{0,20}\bverified\b/i, 1],
  [/\bverified\b.{0,15}\bbusiness\b/i, 1],
  // menu DONE (past-tense done-words only — imperative "upload your menu" does not match)
  [/\bmenu\b.{0,15}\b(uploaded|live|complete|added)\b/i, 2],
  [/\b(uploaded|added)\b.{0,15}\bmenu\b/i, 2],
  // photos DONE
  [/\bphotos?\b.{0,15}\b(added|uploaded|live|complete|done)\b/i, 3],
  [/\b(added|uploaded)\b.{0,15}\bphotos?\b/i, 3],
  // hours DONE (gated behind a completion auxiliary, since imperative "set" == past "set")
  [/\bhours\b.{0,15}\b(configured|complete|done)\b/i, 4],
  [/\b(we'?ve|we have|have|already)\b.{0,20}\bset\b.{0,15}\bhours\b/i, 4],
  // bank verification DONE (tightened like business verification)
  [/\bbank\b.{0,25}\bverification\s+(?:is\s+|was\s+|already\s+)?(?:complete|done|approved|passed|finished)\b/i, 5],
  [/\bbank\b.{0,20}\bverified\b/i, 5],
  [/\bverified\b.{0,15}\bbank\b/i, 5],
  // global "you're live / onboarding complete" claims
  [/\b(fully verified|onboarding (?:is )?complete|you(?:'re| are) (?:now )?live)\b/i, 5],
];

/**
 * True iff the prose asserts a step COMPLETED that the merchant has not yet reached. Scan the
 * subject + body (the customer-facing greeting), as the core does.
 */
export function proseClaimsUnreachedStep(prose: string, stepsCompleted: number): boolean {
  for (const [pattern, requiredSteps] of COMPLETED_CLAIMS) {
    if (requiredSteps > stepsCompleted && pattern.test(prose)) return true;
  }
  return false;
}
