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

import { STEP_MAP } from "@/lib/core/constants";

/**
 * [pattern, minimum steps_completed for the claim to be TRUE]. A completion claim asserts a step
 * is DONE. The completion word must follow the step noun (optionally via a done-auxiliary like
 * "is / was / has been / already / now") OR be a past-tense "verified/uploaded/added/set" — so
 * IMPERATIVE phrasing ("complete business verification", "upload your menu", "set your hours",
 * "to verify ...") never matches (the completion word never directly follows the noun there).
 */
const COMPLETED_CLAIMS: Array<[RegExp, number]> = [
  // business/identity verification DONE — incl. "verification is/was/has been complete[d]/approved/passed"
  [/\bbusiness\b.{0,25}\bverification\b\s+(?:is\s+|was\s+|has\s+been\s+|have\s+been\s+|already\s+|now\s+)?(?:complete|completed|done|approved|passed|finished)\b/i, 1],
  // verb-BEFORE-noun completion ("we've completed your business verification") — PAST-TENSE only,
  // so imperative "complete business verification" (present tense) still does NOT match.
  [/\b(?:completed|finished|approved|passed)\b.{0,20}\bbusiness\b.{0,12}\bverification\b/i, 1],
  [/\bbusiness\b.{0,20}\bverified\b/i, 1],
  [/\bverified\b.{0,15}\bbusiness\b/i, 1],
  // menu DONE — the done-word must DIRECTLY follow "menu" (via an optional done-auxiliary), so
  // imperative/infinitive phrasing ("upload your menu", "menu to be uploaded") does NOT match.
  [/\bmenu\b\s+(?:is\s+|was\s+|has\s+been\s+|have\s+been\s+|already\s+|now\s+)?(?:uploaded|live|complete|completed|added)\b/i, 2],
  [/\b(?:uploaded|added)\b.{0,15}\bmenu\b/i, 2],
  // photos DONE — same shape ("add photos", "photos to complete onboarding" do NOT match)
  [/\bphotos?\b\s+(?:are\s+|were\s+|have\s+been\s+|is\s+|already\s+|now\s+)?(?:uploaded|added|live|complete|completed|done)\b/i, 3],
  [/\b(?:added|uploaded)\b.{0,15}\bphotos?\b/i, 3],
  // hours DONE — "hours (are/were/has been) set/configured/complete". "set your hours" and "hours
  // to complete setup" do NOT match. ("we've set ... hours" reverse form kept.)
  [/\bhours\b\s+(?:are\s+|were\s+|have\s+been\s+|is\s+|already\s+|now\s+)?(?:set|configured|complete|completed|done)\b/i, 4],
  [/\b(we'?ve|we have|have|already)\b.{0,20}\bset\b.{0,15}\bhours\b/i, 4],
  // bank verification DONE (same shape as business verification)
  [/\bbank\b.{0,25}\bverification\b\s+(?:is\s+|was\s+|has\s+been\s+|have\s+been\s+|already\s+|now\s+)?(?:complete|completed|done|approved|passed|finished)\b/i, 5],
  [/\b(?:completed|finished|approved|passed)\b.{0,20}\bbank\b.{0,12}\bverification\b/i, 5],
  [/\bbank\b.{0,20}\bverified\b/i, 5],
  [/\bverified\b.{0,15}\bbank\b/i, 5],
  // global "you're live / onboarding complete" (straight + curly apostrophe)
  [/\b(?:fully verified|onboarding\s+(?:is\s+|has\s+been\s+)?complete(?:d)?|you(?:['’]re| are)\s+(?:now\s+)?live)\b/i, 5],
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

/**
 * Internal identifiers that must NEVER appear in merchant-facing prose (subject + body): the
 * snake_case blocker codes + the next-best-action enum + the internal field names. Matched as a
 * PRECISE denylist (not a generic snake_case catch-all) so a legitimate name like "Tacos_To_Go" is
 * never false-flagged, while snake_case / camelCase / UPPER_CASE forms of a KNOWN token are caught.
 * (The internal risk_explanation/blocker_summary legitimately carry these and are never sent.)
 */
const INTERNAL_IDENTIFIERS: string[] = [
  ...Object.values(STEP_MAP).flatMap((v) => [v.blocker, v.action]),
  "current_blocker_code", "next_best_action", "risk_level", "risk_score", "source_risk_level",
  "steps_completed", "total_steps", "merchant_category", "merchant_id",
  "days_since_signup", "last_login_days_ago",
];
const normalizeIdentifier = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const INTERNAL_BY_NORM = new Map<string, string>(
  INTERNAL_IDENTIFIERS.map((t) => [normalizeIdentifier(t), t]),
);

/**
 * Register / no-leakage check over MERCHANT-FACING prose (subject + body). Flags two things the
 * recipient must never see: (a) a leaked internal identifier — any KNOWN internal token in
 * identifier form (snake_case / camelCase / UPPER), detected by normalizing identifier-shaped
 * word-tokens so a natural phrase ("your bank verification") is NOT flagged, only the joined token
 * ("bank_verification_needed"); and (b) an internal risk level/score disclosure. Pure-string so the
 * same teeth run over the frozen recorded live drafts. SHARED by the eval grader AND the runtime
 * gatekeeper — one rule, one source of truth.
 */
export function registerLeakFailures(prose: string): string[] {
  const failures: string[] = [];
  // Identifier-shaped tokens (snake_case / kebab-case / camelCase) — hyphens are included so a
  // kebab form of a known token ("bank-verification-needed") is matched; the precise denylist
  // means a benign hyphenated/underscored word ("sign-up", "Tacos_To_Go") is never flagged.
  const tokens = prose.match(/[A-Za-z][A-Za-z0-9_-]*/g) ?? [];
  const leaked = [
    ...new Set(
      tokens
        .filter((t) => t.includes("_") || t.includes("-") || /[a-z][A-Z]/.test(t))
        .map((t) => INTERNAL_BY_NORM.get(normalizeIdentifier(t)))
        .filter((t): t is string => Boolean(t)),
    ),
  ];
  if (leaked.length > 0) {
    failures.push(`leaked internal identifier(s): ${leaked.join(", ")}`);
  }
  // Risk-level / score disclosure in any direct form: "High Risk", "high-risk", "risk: High",
  // "risk is high", "risk=high", "risk level/score", "flagged as ... risk".
  if (
    /\b(?:high|medium|low)[\s-]?risk\b|\brisk\b[\s:=_-]*(?:is\s+|was\s+)?(?:high|medium|low|level|score|rating|tier)\b|\bflagged\b[^.]{0,24}\brisk\b/i.test(
      prose,
    )
  ) {
    failures.push("disclosed an internal risk level/score in merchant-facing prose");
  }
  return failures;
}
