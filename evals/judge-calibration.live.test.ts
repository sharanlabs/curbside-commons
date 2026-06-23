import { writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { judgeLiveEnabled } from "@/lib/server/env-flags";
import { runGatekeeper } from "@/lib/agents/gatekeeper";
import { judgeDraft, resolvedJudgeProvider, resolvedJudgeModel } from "@/lib/agents/semantic-judge";
import { GOLD_SET } from "@/evals/gold/semantic-judge-gold";
import {
  headlineReport,
  cohenKappa,
  flipRate,
  gatekeeperPassingSubset,
  type LabeledPrediction,
  type MetricReport,
} from "@/lib/evals/judge-metrics";

/**
 * LIVE P3 CALIBRATION RUNNER — the cross-family Groq gpt-oss-120b judge over the gold set.
 *
 * Free tier ($0), but GATED on judgeLiveEnabled() so a normal `npm test` auto-skips (vitest does NOT
 * load .env, so the committed suite stays offline + spend-free). Run deliberately, paced under the
 * Groq free-tier RPM:
 *   node --env-file=.env node_modules/.bin/vitest run evals/judge-calibration.live.test.ts
 *
 * It records the calibration report (per-split metrics + κ + flip-rate + per-item verdicts) to
 * lib/data/judge-calibration.snapshot.json and /tmp. This test asserts only PLUMBING on real output
 * (judge-territory items get a real LIVE_JUDGE verdict at $0); the QUALITY thresholds are eval-locked
 * at P4 against the FROZEN report (R-HON-2/3) — no "calibrated, F1=X" claim ships from a live re-run.
 */
const live = judgeLiveEnabled();
const K = 3; // reps per item for the test-retest flip-rate (temp-0 is not bit-deterministic)
// Groq free tier is ~8,000 TOKENS-PER-MINUTE and RESERVES maxOutputTokens (now 1024) + prompt
// (~550) ≈ 1,574 per call against that window at request time. Sequential + one call / ~14s ⇒
// ~4.3 calls/min × 1,574 ≈ 6,770 reserved/min, a safe margin under 8,000. No retry (it doubles the
// reservation and snowballs into the 429 cascade we saw at concurrency).
const CALL_PACING_MS = 14_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface PerItem {
  id: string;
  split: "tune" | "test";
  failureMode: string;
  source: string;
  actualFabricated: boolean;
  gatekeeperApproved: boolean;
  reps: boolean[]; // any_unsupported across K reps
  predicted: boolean; // rep-0 verdict (the prediction of record)
  mode: string;
  claims: { text: string; supported: boolean; evidence_field: string | null }[];
}

describe.skipIf(!live)("LIVE judge calibration — Groq gpt-oss-120b cross-family (free, $0)", () => {
  it(
    "calibrates over the gold set: K reps/item, metrics on the held-out split, writes the report",
    async () => {
      const budget = { spentUsd: 0, estimatedNextUsd: 0, capUsd: 5 }; // groq free → $0; ledger still threaded
      const perItem: PerItem[] = [];

      for (const item of GOLD_SET) {
        const gatekeeperApproved = runGatekeeper(item.draft, item.merchant).approvedForHumanReview;
        // R-ARCH-4: the judge runs ONLY on a gatekeeper-approved draft (matches production). A
        // gate-caught draft never reaches the judge — record it SKIPPED, predicted=false.
        if (!gatekeeperApproved) {
          perItem.push({
            id: item.id,
            split: item.split,
            failureMode: item.failureMode,
            source: item.source,
            actualFabricated: item.draftFabricated,
            gatekeeperApproved,
            reps: [],
            predicted: false,
            mode: "SKIPPED_GATE_BLOCKED",
            claims: [],
          });
          continue;
        }
        // K reps SEQUENTIALLY, paced under the token-per-minute window (no concurrency, no retry).
        const results: Awaited<ReturnType<typeof judgeDraft>>[] = [];
        for (let k = 0; k < K; k++) {
          results.push(await judgeDraft(item.draft, item.merchant, { live: true, budget }));
          await sleep(CALL_PACING_MS);
        }
        const reps = results.map((r) => r.verdict.any_unsupported);
        const totalCost = results.reduce((a, r) => a + r.costUsd, 0);
        budget.spentUsd += totalCost; // honest ledger (0 for groq)
        perItem.push({
          id: item.id,
          split: item.split,
          failureMode: item.failureMode,
          source: item.source,
          actualFabricated: item.draftFabricated,
          gatekeeperApproved,
          reps,
          predicted: reps[0],
          mode: results[0].mode,
          claims: results[0].verdict.claims,
        });
        expect(totalCost).toBe(0); // Groq free tier — calibration never bills
      }

      // ── Build predictions + per-split reports (R-CAL-1 headline = gatekeeper-passing subset) ──
      const toPred = (p: PerItem): LabeledPrediction => ({
        id: p.id,
        predictedFabricated: p.predicted,
        actualFabricated: p.actualFabricated,
        gatekeeperApproved: p.gatekeeperApproved,
      });
      // A FAILED_TO_FALLBACK item produced a MOCK verdict, not a real judge verdict — exclude it
      // from the metrics (it would pollute precision/recall). Gate-blocked items are kept (they are
      // excluded from the passing subset by definition). Report how many were dropped.
      const valid = perItem.filter((p) => p.mode !== "FAILED_TO_FALLBACK");
      const fallbacks = perItem.length - valid.length;
      const preds = valid.map(toPred);
      const tunePreds = valid.filter((p) => p.split === "tune").map(toPred);
      const testPreds = valid.filter((p) => p.split === "test").map(toPred);

      const overall: MetricReport = headlineReport(preds); // passing-subset, all
      const tune: MetricReport = headlineReport(tunePreds);
      const heldOut: MetricReport = headlineReport(testPreds); // THE ship number (R-CAL-7)

      // Cohen's κ (judge rep-0 vs gold label) over the judge-territory (gatekeeper-passing) subset.
      const passing = gatekeeperPassingSubset(preds);
      const passIds = new Set(passing.map((p) => p.id));
      const passItems = valid.filter((p) => passIds.has(p.id));
      const kappa = cohenKappa(
        passItems.map((p) => p.predicted),
        passItems.map((p) => p.actualFabricated),
      );

      // Flip-rate over the LIVE items only (stability of the temp-0 verdict across K reps).
      const flip = flipRate(perItem.filter((p) => p.mode === "LIVE_JUDGE").map((p) => p.reps));

      const liveCount = perItem.filter((p) => p.mode === "LIVE_JUDGE").length;
      const report = {
        _provenance: {
          recorded_at_note: "stamp the date at commit time (no wall-clock in tests)",
          provider: resolvedJudgeProvider(),
          model: resolvedJudgeModel(),
          temperature: 0,
          reps_per_item: K,
          gold_total: GOLD_SET.length,
          fallbacks_excluded: fallbacks,
          cost_usd: 0,
          note:
            "LIVE cross-family Groq gpt-oss-120b judge over the gold set. Metrics on the gatekeeper-" +
            "PASSING subset (R-CAL-1). All gold positives are SYNTHETIC/planted (R-CAL-4). Held-out = the " +
            "'test' split (R-CAL-7). Directional until the ~100+ floor (R-HON-1).",
        },
        metrics: {
          overall_passing_subset: overall,
          tune_passing_subset: tune,
          held_out_passing_subset: heldOut, // the ship number
          cohen_kappa_judge_vs_gold: kappa,
          test_retest_flip_rate: flip,
        },
        items: perItem,
      };

      writeFileSync("/tmp/judge-calibration.snapshot.json", JSON.stringify(report, null, 2));
      writeFileSync("lib/data/judge-calibration.snapshot.json", JSON.stringify(report, null, 2));

      // ── PLUMBING asserts only (quality thresholds are eval-locked at P4 on the frozen report) ──
      // Tolerate a few transient free-tier fallbacks (reported + excluded from metrics); most
      // judge-territory items must have produced a real LIVE_JUDGE verdict with claims.
      const territory = perItem.filter((p) => p.gatekeeperApproved);
      const liveTerritory = territory.filter((p) => p.mode === "LIVE_JUDGE");
      expect(liveTerritory.length / territory.length).toBeGreaterThanOrEqual(0.85);
      for (const p of liveTerritory) expect(p.claims.length).toBeGreaterThan(0);
      expect(budget.spentUsd).toBe(0); // free tier — the whole run is $0
      expect(heldOut.n).toBeGreaterThan(0); // the held-out passing subset is non-empty

      // Surfaced for the run log (NOT asserted — recorded for the P4 eval-lock decision).
      console.log("LIVE JUDGE CALIBRATION (Groq gpt-oss-120b):");
      console.log(
        "  live judgments:",
        liveCount,
        "| fallbacks excluded:",
        fallbacks,
        "| flip-rate:",
        flip.toFixed(3),
        "| κ:",
        kappa.toFixed(3),
      );
      console.log(
        "  HELD-OUT (test) passing-subset — recall:",
        heldOut.recall.toFixed(3),
        `CI95 [${heldOut.recallCi95[0].toFixed(2)}, ${heldOut.recallCi95[1].toFixed(2)}]`,
        "| precision:",
        heldOut.precision.toFixed(3),
        "| F1:",
        heldOut.f1.toFixed(3),
        "| n:",
        heldOut.n,
        "| matrix:",
        JSON.stringify(heldOut.matrix),
      );
      console.log(
        "  TUNE passing-subset — recall:",
        tune.recall.toFixed(3),
        "| precision:",
        tune.precision.toFixed(3),
        "| n:",
        tune.n,
      );
    },
    1_500_000,
  );
});
