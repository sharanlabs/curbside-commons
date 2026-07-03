/**
 * The SYNTHETIC activation overlay of the hybrid dataset.
 *
 * No public dataset exists for onboarding progress / blockers / risk inputs, so this
 * layer is synthetic — and honestly labeled as such everywhere it surfaces. It is
 * DETERMINISTIC (seeded by the real business name + row index, no wall-clock) so the
 * frozen snapshot is byte-reproducible and the real fetch date never leaks into the
 * activation state (plan Blindspots: "no wall-clock in the synthetic overlay").
 *
 * It is also designed for COVERAGE: steps_completed cycles 0..5 so every blocker in
 * the taxonomy is exercised, and the day fields produce a spread of risk scores so the
 * Low/Medium/High levels — and thus the held-for-review vs simulated-sent paths — all
 * fire across the set.
 */
import { classifyRiskLevel, TOTAL_STEPS } from "@/legacy/activation/lib/core/constants";
import type { RiskLevel } from "@/legacy/activation/lib/core/constants";
import { computeRiskScore } from "@/legacy/activation/lib/core/pipeline";
import type { MerchantInput } from "@/legacy/activation/lib/core/types";
import type { RealEntity } from "@/legacy/activation/lib/ingest/sf-adapter";

/** The fields the overlay synthesizes (the rest of a MerchantInput is the real layer). */
export type ActivationOverlay = Pick<
  MerchantInput,
  "days_since_signup" | "last_login_days_ago" | "steps_completed" | "source_risk_level"
>;

/** FNV-1a 32-bit hash — a small, stable, dependency-free deterministic seed. */
function hash32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Deterministically synthesize the activation state for one merchant.
 *
 * - steps_completed = idx % (TOTAL_STEPS + 1) -> guarantees the full 0..5 blocker
 *   range appears across any set of >= 6 merchants.
 * - days_since_signup in [3, 45]; last_login_days_ago in [0, min(days, 30)] (a last
 *   login can never predate signup) — both derived from disjoint bytes of the seed.
 * - source_risk_level = thresholds.v1 classification of the computed risk_score. For
 *   synthetic data there is no external source to carry, so the documented thresholds
 *   are the most defensible, internally-consistent choice (no fabricated label).
 */
export function synthesizeActivation(name: string, idx: number): ActivationOverlay {
  const seed = hash32(`${idx}:${name}`);
  const steps_completed = idx % (TOTAL_STEPS + 1);
  const days_since_signup = 3 + (seed % 43); // 3..45
  const maxLogin = Math.min(days_since_signup, 30);
  const last_login_days_ago = (seed >>> 8) % (maxLogin + 1); // 0..maxLogin
  const risk_score = computeRiskScore(days_since_signup, last_login_days_ago, steps_completed);
  const source_risk_level: RiskLevel = classifyRiskLevel(risk_score);
  return { days_since_signup, last_login_days_ago, steps_completed, source_risk_level };
}

/** Combine a real entity with its synthetic overlay into a normalization-ready input. */
export function assembleMerchantInput(entity: RealEntity, idx: number): MerchantInput {
  return {
    merchant_name: entity.merchant_name,
    merchant_category: entity.merchant_category,
    ...synthesizeActivation(entity.merchant_name, idx),
  };
}

export { TOTAL_STEPS };
