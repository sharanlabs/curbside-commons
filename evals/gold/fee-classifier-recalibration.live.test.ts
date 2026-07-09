import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { groqLiveEnabled } from "@/lib/server/env-flags";
import { classifyLineLive, resolvedFeeClassifierModel } from "@/lib/agents/fee-classifier";
import { FEE_LINES_GOLD_TUNE, type FeeLineGoldItem } from "@/evals/gold/fee-lines-gold";
import { FEE_LINES_GOLD_RETRY } from "@/evals/gold/fee-lines-gold-retry";
import {
  accuracy,
  cohenKappa,
  multiClassFlipRate,
  perClassReport,
  type LabeledClassification,
} from "@/evals/gold/metrics";
import { TRUE_CATEGORY_LABELS, type TrueCategoryLabel } from "@/lib/packs/fees";

/**
 * LIVE F1b RECALIBRATION RUNNER — the owner-armed 2026-07-08 RETRY (decision-log
 * complete-all row, commit `eb34bb0`) on the FRESH held-out split
 * (`fee-lines-gold-retry.ts`; the 2026-07-05 split is exposed and never re-scored).
 *
 * Pre-registration: docs/fee-classifier-recalibration-status.md — floors VERBATIM
 * identical to the 2026-07-05 registration; accuracy floor = the STRICTER of
 * ≥20/21 and strictly beating the retry-split pinned baseline (19/21, measured
 * mechanically + pinned in fee-baseline-retry-measurement.test.ts BEFORE this run).
 * A missed floor → the label DEFERS AGAIN; no re-run; the retry split becomes
 * exposed the moment this runs.
 *
 * Harness semantics, pacing, probe-write-before-spend, and snapshot-before-
 * assertions are the PROVEN 2026-07-05 harness verbatim (incident lessons kept);
 * only the scored split, snapshot path, and baseline pin differ.
 *
 * Run deliberately (ONE paced pass), preflight first:
 *   node --env-file=.env scripts-ts/groq-preflight.mjs
 *   ENABLE_LIVE_AI=true node --env-file=.env node_modules/.bin/vitest run \
 *     evals/gold/fee-classifier-recalibration.live.test.ts
 */
const live = groqLiveEnabled();
const K = 3;
const CALL_PACING_MS = 14_000;
const INTER_PHASE_MS = 65_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The retry baseline pin (fee-baseline-retry-measurement.test.ts, 2026-07-08). */
const RETRY_BASELINE_CORRECT = 19;

interface PerItemRecord {
  id: string;
  stratum: string;
  split: "tune" | "test";
  trueCategory: TrueCategoryLabel;
  reps: TrueCategoryLabel[];
  predicted: TrueCategoryLabel;
  rationaleRep0: string;
  modes: string[];
  errorClasses: (string | undefined)[];
}

async function runItem(item: FeeLineGoldItem, reps: number, records: PerItemRecord[]): Promise<void> {
  const rec: PerItemRecord = {
    id: item.id,
    stratum: item.stratum,
    split: item.split,
    trueCategory: item.trueCategory,
    reps: [],
    predicted: item.trueCategory, // overwritten by rep-0 (placeholder never read before that)
    rationaleRep0: "",
    modes: [],
    errorClasses: [],
  };
  for (let k = 0; k < reps; k++) {
    const result = await classifyLineLive(item.input);
    rec.reps.push(result.prediction.predicted);
    rec.modes.push(result.mode);
    rec.errorClasses.push(result.errorClass);
    if (k === 0) {
      rec.predicted = result.prediction.predicted;
      rec.rationaleRep0 = result.prediction.rationale;
    }
    await sleep(CALL_PACING_MS);
  }
  records.push(rec);
}

describe.skipIf(!live)("LIVE F1b fee-classifier RECALIBRATION — retry split, Groq gpt-oss-120b ($0, owner-armed 2026-07-08)", () => {
  it(
    "one paced pass: tune sanity (K=1) then the scored RETRY held-out run (K=3); writes the frozen snapshot",
    async () => {
      // Incident lessons (2026-07-05 run #1) kept verbatim: probe the output path
      // BEFORE any spend; freeze the snapshot BEFORE the integrity assertions.
      const SNAPSHOT_PATH = join("lib", "data", "fee-classifier-recalibration.snapshot.json");
      mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
      writeFileSync(SNAPSHOT_PATH, '{"_status":"RUN IN PROGRESS — probe write"}\n');

      const model = resolvedFeeClassifierModel();
      const tuneRecords: PerItemRecord[] = [];
      const testRecords: PerItemRecord[] = [];

      // ── Phase A: TUNE split (original — tune use is licensed), K=1 sanity ONLY ──
      for (const item of FEE_LINES_GOLD_TUNE) await runItem(item, 1, tuneRecords);

      expect(
        tuneRecords.every((r) => r.modes.every((m) => m === "LIVE_CLASSIFIER")),
        `tune-phase fallback(s): ${JSON.stringify(tuneRecords.filter((r) => r.modes.some((m) => m !== "LIVE_CLASSIFIER")).map((r) => ({ id: r.id, errors: r.errorClasses })))}`,
      ).toBe(true);

      await sleep(INTER_PHASE_MS);

      // ── Phase B: the ONE scored pass — the FRESH RETRY held-out split, K=3 ──────
      for (const item of FEE_LINES_GOLD_RETRY) await runItem(item, K, testRecords);

      const scoredFallbacks = testRecords
        .filter((r) => r.modes.some((m) => m !== "LIVE_CLASSIFIER"))
        .map((r) => ({ id: r.id, errors: r.errorClasses }));

      const toLabeled = (records: PerItemRecord[]): LabeledClassification<TrueCategoryLabel>[] =>
        records.map((r) => ({ id: r.id, predicted: r.predicted, actual: r.trueCategory }));
      const testLabeled = toLabeled(testRecords);
      const tuneLabeled = toLabeled(tuneRecords);

      const perClass = Object.fromEntries(
        TRUE_CATEGORY_LABELS.map((label) => [label, perClassReport(testLabeled, label)]),
      );
      // Pre-registered convention: never-predicted class → precision 0 (degrades to FAILURE).
      const macroPrecision =
        TRUE_CATEGORY_LABELS.reduce((sum, label) => sum + perClass[label].precision, 0) / TRUE_CATEGORY_LABELS.length;
      const macroKappa =
        TRUE_CATEGORY_LABELS.reduce(
          (sum, label) =>
            sum +
            cohenKappa(
              testLabeled.map((it) => it.predicted === label),
              testLabeled.map((it) => it.actual === label),
            ),
          0,
        ) / TRUE_CATEGORY_LABELS.length;
      const testAccuracy = accuracy(testLabeled);
      const correctCount = testLabeled.filter((it) => it.predicted === it.actual).length;
      const flip = multiClassFlipRate(testRecords.map((r) => r.reps));

      const recallOf = (label: TrueCategoryLabel): number => perClass[label].recall;
      const floors = {
        accuracy: {
          floor: `≥ 20/21 AND strictly beats the retry-split pinned baseline ${RETRY_BASELINE_CORRECT}/21 (tie = DEFER)`,
          value: `${correctCount}/21 = ${testAccuracy.toFixed(4)}`,
          pass: correctCount >= 20 && correctCount > RETRY_BASELINE_CORRECT,
        },
        macroPrecision: { floor: "≥ 0.85", value: macroPrecision.toFixed(4), pass: macroPrecision >= 0.85 },
        perClassRecallAll: {
          floor: "≥ 0.70 every label",
          value: Object.fromEntries(TRUE_CATEGORY_LABELS.map((l) => [l, recallOf(l).toFixed(4)])),
          pass: TRUE_CATEGORY_LABELS.every((l) => recallOf(l) >= 0.7),
        },
        perClassRecallBaselineMissed: {
          floor: "≥ 0.80 on enhanced_service_fee + not-a-permitted-fee",
          value: {
            enhanced_service_fee: recallOf("enhanced_service_fee").toFixed(4),
            "not-a-permitted-fee": recallOf("not-a-permitted-fee").toFixed(4),
          },
          pass: recallOf("enhanced_service_fee") >= 0.8 && recallOf("not-a-permitted-fee") >= 0.8,
        },
        flipRate: { floor: "≤ 0.15 (K=3, temp 0)", value: flip.toFixed(4), pass: flip <= 0.15 },
        macroKappa: { floor: "≥ 0.60", value: macroKappa.toFixed(4), pass: macroKappa >= 0.6 },
      };
      const floorsCleared = Object.values(floors).every((f) => f.pass);

      const snapshot = {
        _honesty:
          "SIMULATED gold set (n=21 fresh held-out RETRY split, synthetic) — supports the pre-registered " +
          "floor decision (docs/fee-classifier-recalibration-status.md, floors verbatim from the 2026-07-05 " +
          "registration) and NOTHING about real-world platform statements. Prediction of record = rep-0; " +
          "floors judged verbatim in the status doc; a below-floor run means the label DEFERS AGAIN (no " +
          "re-run, no floor change). Frozen after the run — regression tests read THIS file, never a live re-run.",
        runAt: new Date().toISOString(),
        model,
        provider: "groq (free tier, $0)",
        K,
        callPacingMs: CALL_PACING_MS,
        harness: "evals/gold/fee-classifier-recalibration.live.test.ts",
        baseline: {
          pinned: `${RETRY_BASELINE_CORRECT}/21 retry held-out (evals/gold/fee-baseline-retry-measurement.test.ts — identical to the original split's pin; mirror-construction demonstrated)`,
        },
        priorRun: {
          note: "2026-07-05 run on the ORIGINAL (now exposed) split: 20/21 but enhanced_service_fee recall 0.75 < 0.80 → label DEFERRED (lib/data/fee-classifier-calibration.snapshot.json — untouched by this retry).",
        },
        tunePhase: {
          note: "K=1 prompt-shape sanity ONLY — context, never a claim; moves no floor.",
          n: tuneRecords.length,
          accuracy: accuracy(tuneLabeled).toFixed(4),
          correct: tuneLabeled.filter((it) => it.predicted === it.actual).length,
          items: tuneRecords,
        },
        heldOut: {
          n: testRecords.length,
          accuracy: testAccuracy.toFixed(4),
          correct: correctCount,
          perClass,
          macroPrecision,
          macroKappa,
          flipRate: flip,
          items: testRecords,
        },
        floors,
        floorsCleared,
        runIntegrity: {
          degraded: scoredFallbacks.length > 0,
          scoredFallbacks,
          note: "degraded=true would mean ≥1 scored call fell back — diagnostic only, never label-bearing (bail rule)",
        },
        misses: testLabeled
          .filter((it) => it.predicted !== it.actual)
          .map((it) => ({ id: it.id, predicted: it.predicted, actual: it.actual })),
      };

      writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);

      console.log(
        `F1B-RECALIBRATION-RESULT accuracy=${correctCount}/21 macroP=${macroPrecision.toFixed(3)} ` +
          `kappa=${macroKappa.toFixed(3)} flip=${flip.toFixed(3)} floorsCleared=${floorsCleared} ` +
          `degraded=${scoredFallbacks.length > 0}`,
      );

      // HARD: run integrity — AFTER the freeze, so a degraded run records itself.
      expect(
        scoredFallbacks.length === 0,
        `scored-phase fallback(s): ${JSON.stringify(scoredFallbacks)}`,
      ).toBe(true);
      expect(testRecords.length).toBe(21);
      expect(testRecords.every((r) => r.reps.length === K)).toBe(true);
      for (const label of TRUE_CATEGORY_LABELS) {
        const denom = testRecords.filter((r) => r.trueCategory === label).length;
        expect(denom, `held-out denominator for ${label}`).toBeGreaterThanOrEqual(3);
      }
    },
    // (21 + 63) calls × 14s + 65s inter-phase + overhead — generous ceiling.
    2_400_000,
  );
});
