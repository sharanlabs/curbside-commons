/**
 * The BUDGET HARD-STOP. Fail-CLOSED enforcement of the "<= $5 total Gemini spend"
 * doctrine — in code, not in a hope. Ported from resilix (domain-agnostic).
 *
 * Before EVERY live call, the caller asserts that spent-so-far plus the next call's
 * estimated cost stays under the cap. A breach THROWS, so the would-be billing call
 * never fires. Pure + DI-friendly (spent/next/cap are params, no global, no network),
 * so the block and allow paths are unit-provable with no spend.
 *
 * SCOPE: this is a PER-CALL guard. The "<= $5 TOTAL" guarantee holds only when the caller
 * threads CUMULATIVE spent-so-far across calls (the Phase-B live batch driver's job; the
 * live path in lib/agents/draft.ts requires an explicit budget ledger and never defaults
 * spentUsd to 0). In this slice the live path is OFF (ENABLE_LIVE_AI=false, no key), so this
 * never fires here — it is the rail that makes the Phase-B live smoke safe.
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
