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

/* ────────────────────────────────────────────────────────────────────────────
 * BUDGET TRUTH (2026-10-31, Wave 2 / S2-ledger) — the cumulative ledger, the
 * post-call overflow stop, and free-tier request/token counters.
 *
 * The header above says the paired post-call overflow stop exists only in the
 * archived legacy orchestrator. `settleCall` below IS that stop, ready to wire;
 * NO active driver calls it yet (lib/agents/crew-live.ts is the S2-crew lane's
 * file; the wiring note is in docs/returns/2026-10-31-s2-ledger.md).
 *
 * Everything here is pure and in-memory: the ledger is a plain JSON-serialisable
 * object, the clock is injected, nothing reads a file or the network. Functions
 * MUTATE the ledger they are handed (a reservation must be visible to the next
 * caller); `JSON.stringify(ledger)` is the whole persisted state.
 *
 * Three truths this adds:
 *  1. Spend is cumulative: reserved + spent + next must stay under the $ cap.
 *  2. A $0 free-tier call is NOT free of accounting: every request and token is
 *     counted against the provider's RPD / TPD caps (the 200K tokens/day Groq
 *     cap binds long before $5 could), and the gate fails CLOSED on either.
 *  3. Unknown usage is never zero: if a provider returns no usage, the call is
 *     charged at its RESERVATION (Codex 2026-10-12 cross-check § 2 E).
 * ──────────────────────────────────────────────────────────────────────────── */

/** Injected time source (epoch ms). The library never reads a clock. */
export interface BudgetClock {
  nowMs(): number;
}

/** Per-provider free-tier counters for the current UTC day, with their caps (null = uncapped, still counted). */
export interface ProviderCounter {
  requestsToday: number;
  tokensToday: number;
  /** UTC date, YYYY-MM-DD, the counters belong to. Counters restart when the date changes. */
  dayKey: string;
  rpdCap: number | null;
  tpdCap: number | null;
}

export interface BudgetLedger {
  capUsd: number;
  spentUsd: number;
  reservedUsd: number;
  calls: number;
  halted: boolean;
  haltReason: string | null;
  providers: Record<string, ProviderCounter>;
}

/** What a caller expects a call to cost: dollars (0 on a free tier) and tokens (input + output cap). */
export interface CallEstimate {
  costUsd: number;
  tokens: number;
}

/** What the provider reported afterwards. Either field may be missing: missing = unknown. */
export interface ActualUsage {
  costUsd?: number;
  tokens?: number;
}

export type CanCallCode = "OK" | "HALTED" | "BAD_INPUT" | "UNKNOWN_PROVIDER" | "USD_CAP" | "RPD" | "TPD";
export interface CanCallResult {
  ok: boolean;
  code: CanCallCode;
  reason: string;
}

/** A reserved call. Holds its ledger so `settleCall(reservation, usage)` needs no second argument. */
export interface Reservation {
  readonly ledger: BudgetLedger;
  readonly provider: string;
  readonly reservedUsd: number;
  readonly reservedTokens: number;
  readonly dayKey: string;
  settled: boolean;
}

/** Thrown by `settleCall` when a call billed MORE than it reserved. The ledger is already marked halted. */
export class BudgetOverflowError extends Error {
  readonly reservedUsd: number;
  readonly actualUsd: number;
  constructor(reservedUsd: number, actualUsd: number) {
    super(
      `Budget overflow: a call billed $${actualUsd.toFixed(6)} against a $${reservedUsd.toFixed(6)} reservation. ` +
        `The run is halted; no further call may start.`,
    );
    this.name = "BudgetOverflowError";
    this.reservedUsd = reservedUsd;
    this.actualUsd = actualUsd;
  }
}

/** Thrown by `reserveCall` when `canCall` refuses for a reason other than the $ cap (halted, RPD, TPD, bad input, unknown provider). */
export class BudgetBlockedError extends Error {
  readonly code: CanCallCode;
  constructor(code: CanCallCode, reason: string) {
    super(`Budget gate closed (${code}): ${reason}`);
    this.name = "BudgetBlockedError";
    this.code = code;
  }
}

/** UTC date key for an epoch-ms instant. (The day boundary a provider resets on is UNVERIFIED; UTC is the stated convention.) */
export function dayKeyOf(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function createBudgetLedger(opts: {
  capUsd?: number;
  /** provider name -> its daily caps (null = counted but uncapped). */
  providers?: Record<string, { rpdCap: number | null; tpdCap: number | null }>;
}): BudgetLedger {
  const capUsd = opts.capUsd ?? DEFAULT_BUDGET_CAP_USD;
  if (!Number.isFinite(capUsd) || capUsd <= 0) throw new Error(`createBudgetLedger: capUsd must be a positive finite number, got ${capUsd}`);
  const providers: Record<string, ProviderCounter> = {};
  for (const [name, caps] of Object.entries(opts.providers ?? {})) {
    providers[name] = { requestsToday: 0, tokensToday: 0, dayKey: "", rpdCap: caps.rpdCap, tpdCap: caps.tpdCap };
  }
  return { capUsd, spentUsd: 0, reservedUsd: 0, calls: 0, halted: false, haltReason: null, providers };
}

function sane(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

/** Today's counts for a provider (a stale dayKey reads as zero without mutating). */
function countsToday(c: ProviderCounter, today: string): { requests: number; tokens: number } {
  return c.dayKey === today ? { requests: c.requestsToday, tokens: c.tokensToday } : { requests: 0, tokens: 0 };
}

/**
 * The fail-CLOSED gate. Refuses (ok: false) when the ledger is halted, an input
 * is non-finite or negative, the provider is unregistered, the next call would
 * push spent + reserved + estimate past the $ cap, or would exceed the
 * provider's requests-per-day or tokens-per-day cap. Does not mutate.
 */
export function canCall(ledger: BudgetLedger, provider: string, estimate: CallEstimate, clock: BudgetClock): CanCallResult {
  const no = (code: CanCallCode, reason: string): CanCallResult => ({ ok: false, code, reason });
  if (ledger.halted) return no("HALTED", ledger.haltReason ?? "ledger is halted");
  if (!sane(estimate.costUsd) || !sane(estimate.tokens) || !sane(ledger.spentUsd) || !sane(ledger.reservedUsd)) {
    return no("BAD_INPUT", "non-finite or negative spend / estimate (failing closed)");
  }
  const counter = ledger.providers[provider];
  if (counter === undefined) return no("UNKNOWN_PROVIDER", `provider "${provider}" is not registered in this ledger`);
  const used = ledger.spentUsd + ledger.reservedUsd;
  if (used + estimate.costUsd > ledger.capUsd) {
    return no("USD_CAP", `spent+reserved $${used.toFixed(4)} + next $${estimate.costUsd.toFixed(4)} would exceed the $${ledger.capUsd.toFixed(2)} cap`);
  }
  const today = countsToday(counter, dayKeyOf(clock.nowMs()));
  if (counter.rpdCap !== null && today.requests + 1 > counter.rpdCap) {
    return no("RPD", `${provider}: ${today.requests} requests today, cap ${counter.rpdCap}`);
  }
  if (counter.tpdCap !== null && today.tokens + estimate.tokens > counter.tpdCap) {
    return no("TPD", `${provider}: ${today.tokens} + ${estimate.tokens} tokens today would exceed the ${counter.tpdCap} cap`);
  }
  return { ok: true, code: "OK", reason: "within budget and free-tier caps" };
}

/**
 * Reserve a call: runs `canCall`, then books the estimate (reservedUsd, one
 * request, the estimated tokens). Throws BudgetExceededError on the $ cap and
 * BudgetBlockedError on every other refusal, so the call never starts.
 */
export function reserveCall(ledger: BudgetLedger, provider: string, estimate: CallEstimate, clock: BudgetClock): Reservation {
  const verdict = canCall(ledger, provider, estimate, clock);
  if (!verdict.ok) {
    if (verdict.code === "USD_CAP") throw new BudgetExceededError(ledger.spentUsd + ledger.reservedUsd, estimate.costUsd, ledger.capUsd);
    throw new BudgetBlockedError(verdict.code, verdict.reason);
  }
  const dayKey = dayKeyOf(clock.nowMs());
  const counter = ledger.providers[provider];
  if (counter.dayKey !== dayKey) {
    counter.dayKey = dayKey;
    counter.requestsToday = 0;
    counter.tokensToday = 0;
  }
  counter.requestsToday += 1;
  counter.tokensToday += estimate.tokens;
  ledger.reservedUsd += estimate.costUsd;
  ledger.calls += 1;
  return { ledger, provider, reservedUsd: estimate.costUsd, reservedTokens: estimate.tokens, dayKey, settled: false };
}

/**
 * The POST-call overflow stop. Releases the reservation and books the truth:
 *  - usage unknown (no `costUsd`, or non-finite / negative): charged at the
 *    RESERVATION, never zero;
 *  - otherwise the actual cost is booked, and tokens are trued up to the actual
 *    count (unknown tokens stay at the reservation).
 * If the actual cost EXCEEDS the reservation, the ledger is marked halted and
 * BudgetOverflowError is thrown — the overshoot is bounded to this one call.
 * A reservation settles once; a second settle throws.
 */
export function settleCall(reservation: Reservation, actual: ActualUsage | undefined): void {
  if (reservation.settled) throw new Error("settleCall: this reservation was already settled");
  reservation.settled = true;
  const ledger = reservation.ledger;
  ledger.reservedUsd = Math.max(0, ledger.reservedUsd - reservation.reservedUsd);

  const costKnown = actual !== undefined && sane(actual.costUsd);
  const booked = costKnown ? (actual as ActualUsage).costUsd as number : reservation.reservedUsd;
  ledger.spentUsd += booked;

  const counter = ledger.providers[reservation.provider];
  if (counter !== undefined && counter.dayKey === reservation.dayKey && actual !== undefined && sane(actual.tokens)) {
    counter.tokensToday = Math.max(0, counter.tokensToday - reservation.reservedTokens + actual.tokens);
  }

  // Strictly greater than the reservation (a 1e-12 float epsilon is not an overflow).
  if (costKnown && booked > reservation.reservedUsd + 1e-12) {
    ledger.halted = true;
    ledger.haltReason = `call billed $${booked.toFixed(6)} over its $${reservation.reservedUsd.toFixed(6)} reservation`;
    throw new BudgetOverflowError(reservation.reservedUsd, booked);
  }
  if (ledger.spentUsd > ledger.capUsd) {
    ledger.halted = true;
    ledger.haltReason = `cumulative spend $${ledger.spentUsd.toFixed(6)} passed the $${ledger.capUsd.toFixed(2)} cap`;
  }
}
