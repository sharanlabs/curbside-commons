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
 * use-time, never pin from memory"): these prices are CARRIED from resilix's live
 * verification (2026-06-18, GA on that project's key). In THIS slice the live path is
 * off (mock-only), so the table is dormant and bills nothing. It MUST be re-verified
 * against current official Gemini pricing + a live ListModels at the Phase-B live-smoke
 * gate before any real call — that is the true "use-time".
 */

/** The pinned price-list version. Bump this (and the prices) together on a re-price. */
export const PRICING_VERSION = "2026-06-18";

type ModelPrice = { inputPerMillionUsd: number; outputPerMillionUsd: number };

/** Per-model USD price per 1,000,000 tokens, keyed on the BARE Gemini id. */
export const GEMINI_PRICING: Record<string, ModelPrice> = {
  "gemini-2.5-flash": { inputPerMillionUsd: 0.3, outputPerMillionUsd: 2.5 },
  "gemini-2.5-flash-lite": { inputPerMillionUsd: 0.1, outputPerMillionUsd: 0.4 },
  "gemini-2.5-pro": { inputPerMillionUsd: 1.25, outputPerMillionUsd: 10 },
};

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
