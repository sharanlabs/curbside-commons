/**
 * Live-batch driver — runs bounded Gemini drafting over many merchants while threading a
 * CUMULATIVE budget ledger, so the "<= $5 total" cap holds across the whole run (not just
 * per-call). This is the proper fix for the per-call-only budget gap (Codex P1): each call
 * sees spent-so-far, and the batch stops BEFORE a call that would breach the cap.
 *
 * Only used when live AI is explicitly enabled (the owner's key + ENABLE_LIVE_AI). The
 * deterministic REPLAY/demo path never calls this. Injected `generate` keeps it unit-testable
 * with no network and no spend.
 */
import type { Merchant } from "@/lib/core/types";
import { DEFAULT_BUDGET_CAP_USD } from "@/lib/agents/budget";
import { draftOutreach, type DraftResult } from "@/lib/agents/draft";
import { estimateLiveCallCostUsd, resolvedGeminiModel, type AgentRunUsage } from "@/lib/agents/gemini";

export interface LiveBatchRow {
  merchant: Merchant;
  result: DraftResult;
}

export interface LiveBatchResult {
  rows: LiveBatchRow[];
  totalCostUsd: number;
  capUsd: number;
  /** True if the batch stopped before processing every merchant because the next call would breach the cap. */
  stoppedEarly: boolean;
  processed: number;
  requested: number;
}

export async function draftBatchLive(
  merchants: Merchant[],
  opts: {
    platformName?: string;
    capUsd?: number;
    generate?: (a: {
      model: string;
      schema: unknown;
      prompt: string;
    }) => Promise<{ object: unknown; usage?: AgentRunUsage }>;
  } = {},
): Promise<LiveBatchResult> {
  const capUsd = opts.capUsd ?? DEFAULT_BUDGET_CAP_USD;
  const rows: LiveBatchRow[] = [];
  let spentUsd = 0;
  let stoppedEarly = false;

  for (const merchant of merchants) {
    const estimatedNextUsd = estimateLiveCallCostUsd(resolvedGeminiModel());
    // Stop the batch BEFORE a call that would breach the cumulative cap — fail-closed.
    if (spentUsd + estimatedNextUsd > capUsd) {
      stoppedEarly = true;
      break;
    }
    const result = await draftOutreach(merchant, {
      platformName: opts.platformName,
      live: true,
      budget: { spentUsd, estimatedNextUsd, capUsd },
      generate: opts.generate as never,
    });
    spentUsd += result.costUsd; // accumulate ACTUAL billed cost (incl. billed-but-fallback)
    rows.push({ merchant, result });
  }

  return {
    rows,
    totalCostUsd: spentUsd,
    capUsd,
    stoppedEarly,
    processed: rows.length,
    requested: merchants.length,
  };
}
