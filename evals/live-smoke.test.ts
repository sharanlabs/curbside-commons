import { writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { liveAiEnabled } from "@/lib/server/env-flags";
import { runCore } from "@/lib/core/pipeline";
import { getHybridMerchants } from "@/lib/ingest/hybrid";
import { draftBatchLive } from "@/lib/agents/live-batch";
import { PLATFORM_NAME } from "@/lib/product";

/**
 * LIVE Gemini batch smoke — bills a few cents on real calls. GATED on liveAiEnabled() so it
 * auto-skips unless ENABLE_LIVE_AI=true + GEMINI_API_KEY are present (vitest does NOT auto-load
 * .env, so a normal `npm test` never bills). Run deliberately:
 *   node --env-file=.env node_modules/.bin/vitest run evals/live-smoke.test.ts
 * Writes the recorded results to /tmp/live-batch-result.json for inspection + fixture capture.
 */
const live = liveAiEnabled();

describe.skipIf(!live)("LIVE Gemini batch (key-gated; bills a few cents)", () => {
  it("drafts one merchant per blocker via real Gemini, gated + scored, cumulative under $5", async () => {
    const merchants = runCore(getHybridMerchants(), {}, PLATFORM_NAME).merchants.slice(0, 6); // steps 0..5
    const batch = await draftBatchLive(merchants, { platformName: PLATFORM_NAME, capUsd: 5 });

    const rows = batch.rows.map((r) => ({
      merchant: r.merchant.merchant_name,
      blocker: r.merchant.current_blocker_code,
      mode: r.result.mode,
      costUsd: Number(r.result.costUsd.toFixed(6)),
      errorClass: r.result.errorClass ?? null,
      gatekeeper: r.gatekeeper.status,
      gateFailures: r.gatekeeper.failures,
      eval: `${r.evalScore.passed}/${r.evalScore.total}`,
      subject: r.result.draft.draft_subject,
      body: r.result.draft.draft_body,
    }));
    const summary = {
      processed: batch.processed,
      totalCostUsd: Number(batch.totalCostUsd.toFixed(6)),
      stoppedEarly: batch.stoppedEarly,
      modes: rows.reduce<Record<string, number>>((a, r) => ((a[r.mode] = (a[r.mode] ?? 0) + 1), a), {}),
      gate: rows.reduce<Record<string, number>>((a, r) => ((a[r.gatekeeper] = (a[r.gatekeeper] ?? 0) + 1), a), {}),
    };
    writeFileSync("/tmp/live-batch-result.json", JSON.stringify({ summary, rows }, null, 2) + "\n");

    expect(batch.totalCostUsd).toBeLessThanOrEqual(5);
    expect(batch.processed).toBeGreaterThan(0);
  }, 180_000); // 6 sequential live calls (~7-10s each) — well over the default 20s
});
