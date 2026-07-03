/**
 * Forbidden-claims + state-consistency guardrail for outreach drafts.
 * Faithful port of scripts/guardrail.py (patterns mirror data-dictionary §9).
 *
 * Numeric/percentage patterns are bound to revenue/performance context so
 * onboarding-progress text ("60% complete") does NOT flag. The platform token in
 * the impact-claim patterns is parameterized (default "DoorDash") so the same
 * logic serves the differential oracle AND the de-branded product (only the token
 * differs). All patterns are case-insensitive; reused statelessly (no /g flag).
 */
import { REFERENCE_PLATFORM_NAME } from "./constants";
import type { Draft, Merchant } from "./types";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const STATIC_PATTERNS: Record<string, RegExp[]> = {
  forbidden_revenue_claim: [
    /\bguarantee(d|s)?\b/i,
    /\byou(?:'ll| will)?\s+earn\b/i,
    /\bearn\s+\$?\d+/i,
    /\$\s?\d+/i,
    /\b(increase|boost|double|triple|grow)\b.{0,20}\b(sales|revenue|orders|income|profit|earnings)\b/i,
    /\b\d+\s?%\s*(more|increase)\b.{0,20}\b(sales|revenue|orders|income|customers)\b/i,
  ],
  unsupported_metric: [
    // No \b after %, since % is non-word and the next char is a space ("30% more").
    /\b\d+\s?%.{0,15}\b(more|increase|boost|growth)\b/i,
    /\b\d+\s?x\b.{0,15}\b(more|sales|revenue|orders|income|customers)\b/i,
  ],
  pii_or_secret: [
    /[A-Za-z0-9._%+-]+@(?!example\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}/i,
    /\b(sk|pk|api[_-]?key|token|secret|bearer)[-_]?[A-Za-z0-9]{8,}\b/i,
    /\bapi[_-]?key\s*=\s*sk[_-]?live[-_]?[A-Za-z0-9]{8,}\b/i,
  ],
  aggressive_urgency: [
    /\bact now\b/i,
    /\blast chance\b/i,
    /\b(or )?(you(?:'ll| will)? )?lose (your )?(account|listing|spot|ranking)\b/i,
    /\bfinal (notice|warning)\b/i,
    /\b(respond|act|sign up)\s+(immediately|right now)\b/i,
  ],
};

/** Impact-claim patterns, parameterized by the platform name (de-brand-ready). */
function falseImpactPatterns(platformName: string): RegExp[] {
  const p = escapeRegex(platformName);
  return [
    new RegExp(`\\bofficial(ly)?\\b.{0,15}\\b${p}\\b`, "i"),
    new RegExp(`\\b${p}\\b.{0,15}\\b(guarantee[sd]?|endorse[sd]?|recommend[sd]?|partner of the year)\\b`, "i"),
    /\b(proven|guaranteed)\b.{0,15}\b(results|growth|sales)\b/i,
  ];
}

/**
 * Completion claims for state_mismatch: [pattern, min steps_completed for the
 * claim to be TRUE]. Past-tense / completed phrasing only, so imperative TODO
 * phrasing ("upload your menu") is NOT caught. "set" is gated behind a completion
 * auxiliary ("we've/have/already set ... hours") since imperative == past for it.
 */
const COMPLETION_CLAIMS: Array<[RegExp, number]> = [
  [/\bbusiness\b.{0,25}\bverif(ied|ication)\b/i, 1],
  [/\bmenu\b.{0,15}\b(uploaded|live|complete|added)\b/i, 2],
  [/\bphotos?\b.{0,15}\b(added|uploaded|live|complete|done)\b/i, 3],
  [/\bhours\b.{0,15}\b(set|configured|complete|done)\b/i, 4],
  [/\bbank\b.{0,25}\bverif(ied|ication)\b/i, 5],
  [/\b(fully verified|onboarding (is )?complete|you(?:'re| are) (now )?live)\b/i, 5],
  [/\bverified\b.{0,15}\bbusiness\b/i, 1],
  [/\b(uploaded|added)\b.{0,15}\bmenu\b/i, 2],
  [/\b(added|uploaded)\b.{0,15}\bphotos?\b/i, 3],
  [/\b(we'?ve|we have|have|already)\b.{0,20}\bset\b.{0,15}\bhours\b/i, 4],
  [/\bverified\b.{0,15}\bbank\b/i, 5],
];

/** Return sorted regex-based flags present in text (empty = clean). */
export function scanText(text: string, platformName = REFERENCE_PLATFORM_NAME): string[] {
  const patternsByCat: Record<string, RegExp[]> = {
    ...STATIC_PATTERNS,
    false_impact_claim: falseImpactPatterns(platformName),
  };
  const flags: string[] = [];
  for (const [cat, patterns] of Object.entries(patternsByCat)) {
    if (patterns.some((p) => p.test(text))) flags.push(cat);
  }
  return flags.sort();
}

/** Return guardrail flags for a draft against its merchant. Empty = clean. */
export function runGuardrail(
  draft: Draft,
  merchant: Pick<Merchant, "next_best_action" | "steps_completed">,
  platformName = REFERENCE_PLATFORM_NAME,
): string[] {
  const text = [draft.draft_subject, draft.draft_body, draft.risk_explanation, draft.blocker_summary]
    .map((s) => String(s ?? ""))
    .join(" ");
  const flags = new Set<string>(scanText(text, platformName));

  // state_mismatch (structural): the draft's action must equal the computed one.
  if (draft.next_best_action !== merchant.next_best_action) {
    flags.add("state_mismatch");
  }

  // state_mismatch (prose): the text must not claim a step is done that the
  // merchant has not yet reached. Scan subject + body only.
  const prose = [draft.draft_subject, draft.draft_body].map((s) => String(s ?? "")).join(" ");
  const stepsCompleted = Number(merchant.steps_completed ?? 0);
  for (const [pattern, requiredSteps] of COMPLETION_CLAIMS) {
    if (requiredSteps > stepsCompleted && pattern.test(prose)) {
      flags.add("state_mismatch");
      break;
    }
  }

  return [...flags].sort();
}
