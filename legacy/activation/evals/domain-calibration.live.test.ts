import { writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { domainJudgeLiveEnabled } from "@/lib/server/env-flags";
import {
  judgeDomain,
  dimensionPassMap,
  resolvedDomainJudgeProvider,
  resolvedDomainJudgeModel,
} from "@/legacy/activation/lib/agents/domain-judge";
import { DOMAIN_DIMENSIONS, type DomainDimension } from "@/legacy/activation/lib/domain/effective-rubric";
import { DOMAIN_GOLD_SET } from "@/legacy/activation/evals/gold/domain-gold";
import { reachesDomainJudge } from "@/legacy/activation/evals/gold/domain-harness";
import {
  headlineReport,
  cohenKappa,
  flipRate,
  type LabeledPrediction,
  type MetricReport,
} from "@/legacy/activation/lib/evals/judge-metrics";

/**
 * LIVE B1d CALIBRATION RUNNER — the cross-family Groq gpt-oss-120b DOMAIN judge over the gold set.
 *
 * Free tier ($0), GATED on domainJudgeLiveEnabled() so a normal `npm test` auto-skips (vitest does NOT load
 * .env, so the committed suite stays offline + spend-free). Run deliberately on a FRESH Groq daily
 * token window (~36 items × K reps; ~100K tokens at reasoningEffort:low — fits the 200K/day budget):
 *   node --env-file=.env node_modules/.bin/vitest run evals/domain-calibration.live.test.ts
 *
 * It records the calibration report (aggregate + PER-DIMENSION metrics, κ, flip-rate, per-item verdicts)
 * to lib/data/domain-calibration.snapshot.json + /tmp. This test asserts only PLUMBING on real output;
 * the QUALITY thresholds are pre-registered in docs/domain-calibration-status.md and eval-locked there
 * against the FROZEN report (R-DHON-1/3/4) — no "calibrated, F1=X" claim ships from a live re-run.
 *
 * The positive class is DOMAIN-DEFECTIVE. The R-DCAL-1 partition = gate-passing AND faithful (territory).
 */
const live = domainJudgeLiveEnabled();
const K = 3; // reps per item for the test-retest flip-rate (temp-0 is not bit-deterministic)
const CALL_PACING_MS = 14_000; // pace under the Groq free-tier per-minute window; no retry (avoids the 429 cascade)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface PerItem {
  id: string;
  split: "tune" | "test";
  failureMode: string;
  dimension: DomainDimension | null; // the gold dimension a positive violates (null = clean negative)
  source: string;
  actualDefective: boolean;
  gatekeeperApproved: boolean;
  faithful: boolean;
  territory: boolean;
  reps: boolean[]; // domain_defective across K reps
  predicted: boolean; // rep-0 verdict (the prediction of record)
  dimFail: Record<DomainDimension, boolean>; // rep-0 per-dimension FAIL flags (for per-dimension metrics)
  mode: string;
  dimensions: { dimension: string; pass: boolean; rationale: string }[]; // rep-0 audit trail
}

describe.skipIf(!live)("LIVE domain judge calibration — Groq gpt-oss-120b cross-family (free, $0)", () => {
  it(
    "calibrates over the gold set: K reps/item, aggregate + per-dimension metrics on held-out, writes the report",
    async () => {
      const budget = { spentUsd: 0, estimatedNextUsd: 0, capUsd: 5 }; // groq free → $0; ledger still threaded
      const perItem: PerItem[] = [];

      for (const item of DOMAIN_GOLD_SET) {
        const reach = reachesDomainJudge(item);
        // R-DARCH-4: the judge runs ONLY on a gatekeeper-approved draft (matches production).
        if (!reach.gateApproved) {
          perItem.push({
            id: item.id, split: item.split, failureMode: item.failureMode, dimension: item.dimension,
            source: item.source, actualDefective: item.draftDefective, gatekeeperApproved: false,
            faithful: reach.faithful, territory: false, reps: [], predicted: false,
            dimFail: emptyDimFail(), mode: "SKIPPED_GATE_BLOCKED", dimensions: [],
          });
          continue;
        }
        // K reps SEQUENTIALLY, paced under the token-per-minute window (no concurrency, no retry).
        const results: Awaited<ReturnType<typeof judgeDomain>>[] = [];
        for (let k = 0; k < K; k++) {
          results.push(await judgeDomain(item.draft, item.merchant, { live: true, budget }));
          await sleep(CALL_PACING_MS);
        }
        const reps = results.map((r) => r.verdict.domain_defective);
        const totalCost = results.reduce((a, r) => a + r.costUsd, 0);
        budget.spentUsd += totalCost; // honest ledger (0 for groq)
        const rep0 = results[0].verdict;
        const passMap = dimensionPassMap(rep0);
        perItem.push({
          id: item.id, split: item.split, failureMode: item.failureMode, dimension: item.dimension,
          source: item.source, actualDefective: item.draftDefective, gatekeeperApproved: true,
          faithful: reach.faithful, territory: reach.territory, reps, predicted: reps[0],
          dimFail: dimFailFromPassMap(passMap), mode: results[0].mode, dimensions: rep0.dimensions,
        });
        expect(totalCost).toBe(0); // Groq free tier — calibration never bills
      }

      // ── Predictions + reports (R-DCAL-1 headline = territory subset; R-DCAL-2 per-dimension) ──
      // A FAILED_TO_FALLBACK item produced a MOCK verdict, not a real judge verdict — exclude it.
      const valid = perItem.filter((p) => p.mode === "LIVE_JUDGE");
      const fallbacks = perItem.filter((p) => p.mode === "FAILED_TO_FALLBACK").length;

      const aggPred = (p: PerItem): LabeledPrediction => ({
        id: p.id, predictedFabricated: p.predicted, actualFabricated: p.actualDefective, gatekeeperApproved: p.territory,
      });
      const dimPred = (p: PerItem, dim: DomainDimension): LabeledPrediction => ({
        id: p.id, predictedFabricated: p.dimFail[dim], actualFabricated: p.dimension === dim, gatekeeperApproved: p.territory,
      });

      const testValid = valid.filter((p) => p.split === "test");
      const tuneValid = valid.filter((p) => p.split === "tune");

      const aggregate = {
        overall_territory: headlineReport(valid.map(aggPred)),
        tune_territory: headlineReport(tuneValid.map(aggPred)),
        held_out_territory: headlineReport(testValid.map(aggPred)), // THE ship number (R-DCAL-7)
        cohen_kappa_judge_vs_gold: cohenKappa(
          valid.filter((p) => p.territory).map((p) => p.predicted),
          valid.filter((p) => p.territory).map((p) => p.actualDefective),
        ),
        test_retest_flip_rate: flipRate(perItem.filter((p) => p.mode === "LIVE_JUDGE").map((p) => p.reps)),
      };

      const perDimension = {} as Record<DomainDimension, { held_out: MetricReport; tune: MetricReport }>;
      for (const dim of DOMAIN_DIMENSIONS) {
        perDimension[dim] = {
          held_out: headlineReport(testValid.map((p) => dimPred(p, dim))),
          tune: headlineReport(tuneValid.map((p) => dimPred(p, dim))),
        };
      }

      const report = {
        _provenance: {
          recorded_at_note: "stamp the date at commit time (no wall-clock in tests)",
          provider: resolvedDomainJudgeProvider(),
          model: resolvedDomainJudgeModel(),
          temperature: 0,
          reps_per_item: K,
          gold_total: DOMAIN_GOLD_SET.length,
          fallbacks_excluded: fallbacks,
          cost_usd: 0,
          note:
            "LIVE cross-family Groq gpt-oss-120b DOMAIN judge over the gold set. Metrics on the territory " +
            "(gate-passing + faithful) subset (R-DCAL-1); per-dimension reported (R-DCAL-2). All gold " +
            "positives are SYNTHETIC/planted (R-DCAL-4). Held-out = the 'test' split (R-DCAL-7). " +
            "Directional until the ~100 floor (R-DHON-1); over-promise (§4.2) marginal-value vs the LIVE " +
            "faithfulness judge is partial — see docs/domain-calibration-status.md.",
        },
        metrics: { aggregate, per_dimension: perDimension },
        items: perItem,
      };

      writeFileSync("/tmp/domain-calibration.snapshot.json", JSON.stringify(report, null, 2));
      writeFileSync("lib/data/domain-calibration.snapshot.json", JSON.stringify(report, null, 2));

      // ── PLUMBING asserts only (quality thresholds pre-registered + eval-locked at B1d on the frozen report) ──
      const territory = perItem.filter((p) => p.territory);
      const liveTerritory = territory.filter((p) => p.mode === "LIVE_JUDGE");
      expect(liveTerritory.length / territory.length).toBeGreaterThanOrEqual(0.85);
      const flagged = liveTerritory.filter((p) => p.predicted);
      expect(flagged.length).toBeGreaterThan(0); // non-vacuous: the judge flagged domain defects
      expect(budget.spentUsd).toBe(0); // free tier — the whole run is $0
      expect(aggregate.held_out_territory.n).toBeGreaterThan(0);

      // Surfaced for the run log (NOT asserted — recorded for the eval-lock decision).
      console.log("LIVE DOMAIN JUDGE CALIBRATION (Groq gpt-oss-120b):");
      console.log(
        "  live judgments:", liveTerritory.length, "| fallbacks excluded:", fallbacks,
        "| flip-rate:", aggregate.test_retest_flip_rate.toFixed(3), "| κ:", aggregate.cohen_kappa_judge_vs_gold.toFixed(3),
      );
      const h = aggregate.held_out_territory;
      console.log(
        "  HELD-OUT (test) — recall:", h.recall.toFixed(3),
        `CI95 [${h.recallCi95[0].toFixed(2)}, ${h.recallCi95[1].toFixed(2)}]`,
        "| precision:", h.precision.toFixed(3), "| F1:", h.f1.toFixed(3), "| n:", h.n,
      );
      for (const dim of DOMAIN_DIMENSIONS) {
        const d = perDimension[dim].held_out;
        console.log(`  DIM ${dim} held-out — recall:`, d.recall.toFixed(3), "| precision:", d.precision.toFixed(3), "| n:", d.n);
      }
    },
    1_800_000,
  );
});

function emptyDimFail(): Record<DomainDimension, boolean> {
  const o = {} as Record<DomainDimension, boolean>;
  for (const d of DOMAIN_DIMENSIONS) o[d] = false;
  return o;
}
function dimFailFromPassMap(passMap: Record<DomainDimension, boolean>): Record<DomainDimension, boolean> {
  const o = {} as Record<DomainDimension, boolean>;
  for (const d of DOMAIN_DIMENSIONS) o[d] = passMap[d] === false;
  return o;
}
