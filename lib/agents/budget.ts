/**
 * The BUDGET HARD-STOP. Fail-CLOSED enforcement of the "<= $5 total Gemini spend"
 * doctrine — in code, not in a hope. Ported from resilix (domain-agnostic).
 *
 * Before EVERY live call, the caller asserts that spent-so-far plus the next call's
 * estimated cost stays under the cap. A breach THROWS, so the would-be billing call
 * never fires. Pure + DI-friendly (spent/next/cap are params, no global, no network),
 * so the block and allow paths are unit-provable with no spend.
 *
 * SCOPE: this is a PER-CALL guard. The "<= $5 TOTAL" bound holds only when the caller
 * threads CUMULATIVE spent-so-far across calls (the Phase-B live batch driver's job; the
 * live path in lib/agents/draft.ts requires an explicit budget ledger and never defaults
 * spentUsd to 0). In this slice the live path is OFF (ENABLE_LIVE_AI=false, no key), so this
 * never fires here — it is the rail that makes the Phase-B live smoke safe.
 *
 * HONEST LIMIT (Codex slice-1 confirming P1): this pre-call guard reserves a CONSERVATIVE estimate
 * (estimateLiveCallCostUsd: input + completion cap + the documented max thinking budget). Because
 * Gemini's thinking budget is a SOFT limit and the prompt size is not length-proven, a single call's
 * actual cost CAN exceed its reservation — so the $5 cap is a FAIL-CLOSED BEST-EFFORT bound, not a
 * provider-enforced hard quota. The paired POST-call overflow stop that bounds any overshoot to a
 * single call (halt the run if a call billed above its reservation) exists ONLY in the archived legacy
 * activation orchestrator (legacy/activation/lib/agents/loop/orchestrator.ts); NO active non-legacy
 * driver is wired to this guard today. ARMING REQUIREMENT: any future non-legacy live driver MUST
 * re-implement that post-call overflow stop before arming — this pre-call guard alone does not bound a
 * single call's overshoot. With thinkingBudget=0 the expected reasoning is 0, so in practice spend stays far under the cap.
 */

/** The default spend cap in USD. The doctrine number, named once. */
export const DEFAULT_BUDGET_CAP_USD = 5;

/** Thrown when a live call would push cumulative spend past the cap. Distinct type so a
 * caller can catch THIS without swallowing unrelated throws, and the audit can name it. */
export class BudgetExceededError extends Error {
  readonly spentUsd: number;
  readonly nextEstimatedUsd: number;
  readonly capUsd: number;

  constructor(spentUsd: number, nextEstimatedUsd: number, capUsd: number) {
    super(
      `Budget hard-stop: spent $${spentUsd.toFixed(4)} + next $${nextEstimatedUsd.toFixed(4)} = ` +
        `$${(spentUsd + nextEstimatedUsd).toFixed(4)} would exceed the $${capUsd.toFixed(2)} cap. ` +
        `Live call blocked before it could bill.`,
    );
    this.name = "BudgetExceededError";
    this.spentUsd = spentUsd;
    this.nextEstimatedUsd = nextEstimatedUsd;
    this.capUsd = capUsd;
  }
}

/**
 * The fail-closed gate. Call IMMEDIATELY BEFORE a live call: if spent + next > cap it
 * THROWS, so the call is never made and cannot bill. A non-finite input is treated as a
 * breach (fail closed) — a guard that silently passes on bad input is not a guard.
 */
export function assertWithinBudget(
  spentUsd: number,
  nextEstimatedUsd: number,
  capUsd: number = DEFAULT_BUDGET_CAP_USD,
): void {
  const spent = Number(spentUsd);
  const next = Number(nextEstimatedUsd);
  const cap = Number(capUsd);
  // Fail CLOSED on any non-sensible input: a non-finite/negative spend or estimate, or a
  // non-finite/non-positive cap. A guard that accepts garbage (negative spend, cap <= 0) is not a guard.
  if (!Number.isFinite(spent) || !Number.isFinite(next) || spent < 0 || next < 0) {
    throw new BudgetExceededError(spentUsd, nextEstimatedUsd, capUsd);
  }
  if (!Number.isFinite(cap) || cap <= 0) {
    throw new BudgetExceededError(spent, next, capUsd);
  }
  if (spent + next > cap) {
    throw new BudgetExceededError(spent, next, cap);
  }
}
