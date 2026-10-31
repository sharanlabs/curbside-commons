/**
 * The COST-LEDGER pricing table. Pure + unit-testable. The money side of the "<= $5
 * total Gemini spend" doctrine: a real per-call USD cost from API-reported token counts
 * and a PINNED, VERSIONED price table — never an estimate. Ported from resilix.
 *
 * WHY pinned (not a live price fetch): prices move under the model cutoff, so a run's
 * cost must be reproducible from the record alone. The version string stamped on every
 * priced call records WHICH list produced the number, so a re-price is an explicit
 * migration, never a silent retroactive change.
 *
 * FRESHNESS (RULES §6 + owner doctrine "re-verify the cheapest current Gemini model at
 * use-time, never pin from memory"): the prices below were RE-VERIFIED 2026-10-12 against
 * the official pages cited at PRICING_VERSION. The live path is gated (ENABLE_LIVE_AI) and
 * off by default, so the table bills nothing unless the owner arms a live run; a live
 * ListModels preflight (gemini.ts) is still required at that arming moment — that is the
 * true "use-time".
 */

/**
 * The pinned price-list version. Bump this (and the prices) together on a re-price.
 *
 * RE-PINNED 2026-10-12 (Wave 1 / S1-pins) against the official Gemini pages, read that day:
 *  - https://ai.google.dev/gemini-api/docs/pricing — paid tier, STANDARD, text, per 1M tokens:
 *    gemini-3.5-flash-lite $0.30 in / $2.50 out; gemini-3.8-flash $0.75 in / $3.75 out
 *    "through December 31, 2026", then $1.50 / $7.50 "starting January 1, 2027";
 *    gemini-2.5-flash $0.30 / $2.50; gemini-2.5-flash-lite $0.10 / $0.40;
 *    gemini-2.5-pro $1.25 / $10.00 (prompts <= 200k tokens).
 *  - https://ai.google.dev/gemini-api/docs/models (page "Last updated 2026-10-09 UTC") — names
 *    3.5 Flash-Lite (`gemini-3.5-flash-lite`) and 3.8 Flash (`gemini-3.8-flash`) as the models
 *    for new projects, and limits the 2.5 family to users who have used it before.
 * The previous string was "2026-06-18"; the 2026-07-26 re-read of the 2.5 prices was
 * unchanged and deliberately did not bump it (the string tracks the prices, not the read date).
 *
 * KNOWN STEP-UP — RE-PIN TRIGGER: `gemini-3.8-flash` is pinned at its CURRENT introductory
 * price. The page states it doubles on 2027-01-01 ($1.50 in / $7.50 out). This table is
 * date-free by design (a run's cost must be reproducible from the record), so the row MUST be
 * re-pinned, with a new PRICING_VERSION, before any live run on or after 2027-01-01.
 *
 * BUMPED 2026-10-31 (Wave 2 / S2-ledger): ONLY change is NEW rows — the $0 free-tier ids the
 * crew uses (Groq free tier, local Ollama), each carrying `tier: "free"` and its documented limits
 * as data. No existing price moved. Groq limits are as read from console.groq.com on 2026-10-12
 * (plan § 8): RPM 30 · RPD 1,000 · TPM 8,000 · TPD 200,000 — RE-VERIFY AT USE (RULES §6); the
 * daily-reset boundary is UNVERIFIED and the budget ledger treats the UTC date as the day.
 * A $0 price is a PRICE, not an exemption: the budget ledger still counts every request and token
 * against these limits (the 200K TPD cap binds long before the $5 cap ever could).
 */
export const PRICING_VERSION = "2026-10-31";

/** Documented provider free-tier limits, kept as data next to the $0 row they govern. */
export type FreeTierLimits = {
  readonly rpm: number;
  readonly rpd: number;
  readonly tpm: number;
  readonly tpd: number;
};

type ModelPrice = {
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
  /** Present only on $0 rows. */
  tier?: "free";
  provider?: string;
  /** null = no provider-side quota (local model). */
  limits?: FreeTierLimits | null;
};

/** Groq free tier, console.groq.com read 2026-10-12 (plan § 8). Re-verify at use, RULES §6. */
const GROQ_FREE_LIMITS: FreeTierLimits = { rpm: 30, rpd: 1_000, tpm: 8_000, tpd: 200_000 };

/** Per-model USD price per 1,000,000 tokens, keyed on the BARE Gemini id. */
export const GEMINI_PRICING: Record<string, ModelPrice> = {
  // Current models (docs/models, read 2026-10-12): default and override in gemini.ts.
  "gemini-3.5-flash-lite": { inputPerMillionUsd: 0.3, outputPerMillionUsd: 2.5 },
  "gemini-3.8-flash": { inputPerMillionUsd: 0.75, outputPerMillionUsd: 3.75 },
  // Restricted to prior users: docs/models (read 2026-10-12) says access to the 2.5 models is
  // limited to users who have used them before; they are "not deprecated". Kept so a ledger
  // that already billed on them stays priceable; not a default for any new run.
  "gemini-2.5-flash": { inputPerMillionUsd: 0.3, outputPerMillionUsd: 2.5 },
  "gemini-2.5-flash-lite": { inputPerMillionUsd: 0.1, outputPerMillionUsd: 0.4 },
  "gemini-2.5-pro": { inputPerMillionUsd: 1.25, outputPerMillionUsd: 10 },
  // $0 free-tier rows (2026-10-31). Groq free tier (no card): the crew's hosted open-weight seats.
  "openai/gpt-oss-120b": { inputPerMillionUsd: 0, outputPerMillionUsd: 0, tier: "free", provider: "groq", limits: GROQ_FREE_LIMITS },
  "openai/gpt-oss-20b": { inputPerMillionUsd: 0, outputPerMillionUsd: 0, tier: "free", provider: "groq", limits: GROQ_FREE_LIMITS },
  "qwen/qwen3.8-27b": { inputPerMillionUsd: 0, outputPerMillionUsd: 0, tier: "free", provider: "groq", limits: GROQ_FREE_LIMITS },
  // Local Ollama (tier D): no money and no provider quota; still counted by the ledger.
  "gpt-oss:20b": { inputPerMillionUsd: 0, outputPerMillionUsd: 0, tier: "free", provider: "ollama", limits: null },
  "qwen3:8b": { inputPerMillionUsd: 0, outputPerMillionUsd: 0, tier: "free", provider: "ollama", limits: null },
};

/** The documented free-tier limits for a model id (null for a local or paid model, or an unknown id). */
export function freeTierLimits(model: string): FreeTierLimits | null {
  return GEMINI_PRICING[bareModelId(model)]?.limits ?? null;
}

/** Strip a "models/" prefix so a prefixed id still keys the table. */
function bareModelId(model: string): string {
  return model.replace(/^models\//, "").trim();
}

/**
 * cost = input/1e6 * inPrice + output/1e6 * outPrice. Pure.
 *
 * FAILS LOUD on an unknown model (throws) rather than silently pricing at $0 — a $0
 * cost on a real billed call is the exact blind spot that lets spend escape the cap
 * unseen. The deterministic path stamps costUsd: 0 directly (never calls this with
 * "deterministic-rules"), so only real resolved Gemini ids reach here.
 */
export function costUsd(
  model: string,
  inputTokens: number | undefined,
  outputTokens: number | undefined,
): number {
  const key = bareModelId(model);
  const price = GEMINI_PRICING[key];
  if (!price) {
    throw new Error(
      `costUsd: unknown model "${key}" — not in the pinned pricing table (${PRICING_VERSION}). ` +
        `Known: ${Object.keys(GEMINI_PRICING).join(", ")}. Add it before billing a live call.`,
    );
  }
  const inTok = coerceTokens(inputTokens);
  const outTok = coerceTokens(outputTokens);
  return (inTok / 1_000_000) * price.inputPerMillionUsd + (outTok / 1_000_000) * price.outputPerMillionUsd;
}

/** Coerce an API-reported token count to a non-negative finite number (else 0). */
function coerceTokens(n: number | undefined): number {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : 0;
}
