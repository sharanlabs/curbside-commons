/**
 * The claims-gatekeeper — the deterministic firewall between a generated draft and a
 * human reviewer. Ported from resilix's gatekeeper pattern (every claim traces to known
 * data), specialized to merchant outreach.
 *
 * It BLOCKS a draft unless ALL hold:
 *   1. Every DECLARED claim names a verifiable merchant field AND its value matches the
 *      merchant data (a declared claim that exceeds the data fails). BOUNDARY: this is
 *      forward (claim->data) verification; an undeclared fabricated fact stated in prose is
 *      caught only if it trips a guardrail pattern. Full prose->claim coverage (the reverse
 *      direction + semantic unsupported-claim detection) is a Phase-B hardening (bidirectional
 *      check + LLM-judge), needed once the LIVE model authors free prose.
 *   2. The draft is schema-valid (core validateDraft: required fields, action in vocab,
 *      non-empty prose).
 *   3. The guardrail is clean (no forbidden revenue/impact/urgency claim, no PII, no
 *      state_mismatch) — the ported lib/core/guardrail rules.
 * A held-for-review merchant (High risk / ineligible contact) is a WARNING, not a block:
 * the draft is clean but a human must still approve the send.
 *
 * approvedForHumanReview = (no failures): only a clean draft reaches the hold/reject/send
 * gate; a BLOCKED draft is auto-rejected. checkedAt uses the deterministic RUN_TIMESTAMP
 * (no wall-clock) so the REPLAY snapshot stays reproducible.
 */
import { REFERENCE_PLATFORM_NAME, RUN_TIMESTAMP } from "@/lib/core/constants";
import { scanText } from "@/lib/core/guardrail";
import { validateDraft } from "@/lib/core/pipeline";
import type { Merchant } from "@/lib/core/types";
import type { OutreachDraft } from "@/lib/agents/draft";
import { proseClaimsUnreachedStep, registerLeakFailures } from "@/lib/agents/state-consistency";

/** Merchant fields a claim is allowed to cite (a claim outside this set is unverifiable). */
const CLAIMABLE_FIELDS = new Set<string>([
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

export interface GatekeeperReport {
  status: "PASS" | "WARN" | "BLOCKED";
  failures: string[];
  warnings: string[];
  /** The raw guardrail flags (surfaced for the UI); empty = clean. */
  guardrailFlags: string[];
  /** True iff there are no failures — only then may the draft enter the human gate. */
  approvedForHumanReview: boolean;
  checkedAt: string;
}

export function runGatekeeper(
  draft: OutreachDraft,
  merchant: Merchant,
  platformName = REFERENCE_PLATFORM_NAME,
): GatekeeperReport {
  const failures: string[] = [];
  const warnings: string[] = [];

  // 1. Every claim must trace to the merchant's structured data.
  for (const claim of draft.claims) {
    if (!CLAIMABLE_FIELDS.has(claim.field)) {
      failures.push(`claim cites unverifiable field "${claim.field}"`);
      continue;
    }
    const actual = (merchant as unknown as Record<string, unknown>)[claim.field];
    if (String(actual) !== String(claim.value)) {
      failures.push(
        `claim "${claim.field}"=${JSON.stringify(claim.value)} does not match merchant data ` +
          `(actual ${JSON.stringify(actual)})`,
      );
    }
  }

  // 2. Schema validity (core contract).
  for (const err of validateDraft(draft)) failures.push(`schema:${err}`);

  // 3. Guardrail (product tier): the pinned-core forbidden-claim scan (scanText) + a structural
  //    action check + a TENSE-AWARE prose state-consistency check (lib/agents/state-consistency).
  //    The precise prose check replaces the core's bundled state_mismatch so a truthful imperative
  //    ("complete business verification") no longer false-blocks — without touching the pinned core
  //    (which stays a faithful Python port for the differential). Forbidden-claim detection is the
  //    core's, unchanged.
  const fullText = [draft.draft_subject, draft.draft_body, draft.risk_explanation, draft.blocker_summary]
    .map((s) => String(s ?? ""))
    .join(" ");
  const flagSet = new Set<string>(scanText(fullText, platformName));
  const prose = `${draft.draft_subject} ${draft.draft_body}`;
  if (
    draft.next_best_action !== merchant.next_best_action ||
    proseClaimsUnreachedStep(prose, Number(merchant.steps_completed ?? 0))
  ) {
    flagSet.add("state_mismatch");
  }
  const guardrailFlags = [...flagSet].sort();
  for (const flag of guardrailFlags) failures.push(`guardrail:${flag}`);

  // 3b. Register / no-leakage: the customer-facing prose (subject + body) must not leak an internal
  //     identifier or disclose an internal risk level/score (shared rule with the eval's no-leakage
  //     grader — one source of truth). A leak is a hard failure -> BLOCKED, so a leaky draft never
  //     reaches the human gate (closes the eval-scored-but-not-enforced gap, Codex 2026-06-22).
  for (const f of registerLeakFailures(prose)) failures.push(`register-leak:${f}`);

  // 4. Held for human review (not a block — a clean draft still needs approval).
  if (merchant.review_required) {
    warnings.push(`held for human review (${merchant.review_reason || "review_required"})`);
  }

  const status = failures.length > 0 ? "BLOCKED" : warnings.length > 0 ? "WARN" : "PASS";
  return {
    status,
    failures,
    warnings,
    guardrailFlags,
    approvedForHumanReview: failures.length === 0,
    checkedAt: RUN_TIMESTAMP,
  };
}
