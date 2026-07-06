import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { groqLiveEnabled } from "@/lib/server/env-flags";
import { classifyLineLive, resolvedFeeClassifierModel } from "@/lib/agents/fee-classifier";
import {
  FEE_LINES_GOLD_TEST,
  FEE_LINES_GOLD_TUNE,
  type FeeLineGoldItem,
} from "@/evals/gold/fee-lines-gold";
import {
  accuracy,
  cohenKappa,
  multiClassFlipRate,
  perClassReport,
  type LabeledClassification,
} from "@/evals/gold/metrics";
import { TRUE_CATEGORY_LABELS, type TrueCategoryLabel } from "@/lib/packs/fees";

/**
 * LIVE F1b CLASSIFIER CALIBRATION RUNNER — the owner-armed run (owner GO 2026-07-05
 * "all four", decision-log) against the PRE-REGISTERED floors of
 * `docs/plan-f1b-classifier.md` §3.1 (as amended pre-run at M2: accuracy ≥20/21
 * strictly beating the pinned 19/21 baseline; tie = DEFER).
 *
 * Groq free tier ($0), GATED on groqLiveEnabled() so a normal `npm test` auto-skips.
 * Run deliberately (ONE paced pass — plan §3.3), with the TPD preflight first:
 *   node --env-file=.env scripts-ts/groq-preflight.mjs
 *   ENABLE_LIVE_AI=true node --env-file=.env node_modules/.bin/vitest run \
 *     evals/gold/fee-classifier-calibration.live.test.ts
 *
 * HARNESS SEMANTICS (pre-registered in docs/fee-classifier-calibration-status.md
 * BEFORE this run; the slice-2 "detection===N hard / floors reported" precedent):
 *  - HARD assertions = RUN INTEGRITY ONLY: every call returns a real LIVE_CLASSIFIER
 *    verdict (any FAILED_TO_FALLBACK fails the run loudly as provider-degraded —
 *    a degraded run is diagnostic, never enshrined), K=3 complete per test item,
 *    per-class held-out denominators ≥3 (non-vacuous K rule).
 *  - The FLOORS are computed + frozen into the snapshot and judged VERBATIM in the
 *    status doc for the LABEL decision (calibrated vs DEFER) — they are NOT vitest
 *    assertions, so an honest below-floor run records itself instead of masking as
 *    a code regression. The bar never moves either way.
 *  - Prediction of record = rep-0 (the legacy judge-calibration precedent);
 *    flip-rate = not-unanimous across K=3 (multiClassFlipRate).
 *  - Phase A (TUNE split, K=1) is prompt-shape sanity ONLY — reported as context,
 *    it moves no floor and decides nothing (plan §3.2 discipline).
 */
const live = groqLiveEnabled();
const K = 3;
// Groq free tier ≈ 8,000 tokens/min; each call reserves maxOutputTokens (1,024) + prompt
// (~700) ≈ 1,750 at request time. 14s pacing ⇒ ~4.3 calls/min × 1,750 ≈ 7,500/min, under
// the window (the proven judge-calibration pacing). No retry, no concurrency.
const CALL_PACING_MS = 14_000;
// Between phases: one full TPM window of cool-down so Phase B starts on a fresh minute.
const INTER_PHASE_MS = 65_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface PerItemRecord {
  id: string;
  stratum: string;
  split: "tune" | "test";
  trueCategory: TrueCategoryLabel;
  /** All rep predictions in order; reps[0] is the prediction of record. */
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
    predicted: item.trueCategory, // overwritten below by rep-0 (placeholder is never read before that)
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

describe.skipIf(!live)("LIVE F1b fee-classifier calibration — Groq gpt-oss-120b ($0, owner-armed)", () => {
  it(
    "one paced pass: tune sanity (K=1) then the scored held-out run (K=3); writes the frozen snapshot",
    async () => {
      // INCIDENT LESSON (2026-07-05, run #1): the first armed pass completed all 84
      // live calls, PASSED every integrity assertion, then lost the results — the
      // snapshot path's directory did not exist in the restructured tree (lib/data/
      // moved to legacy/ at W0) and writeFileSync ENOENT'd after the spend, before
      // any metric printed (outcome-blind loss; status doc incident entry). So:
      // (1) the output path is CREATED AND PROBED FIRST, before any call is spent;
      // (2) the snapshot is WRITTEN BEFORE the integrity assertions, so even a
      //     degraded run freezes its diagnostic record instead of evaporating.
      const SNAPSHOT_PATH = join("lib", "data", "fee-classifier-calibration.snapshot.json");
      mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
      writeFileSync(SNAPSHOT_PATH, '{"_status":"RUN IN PROGRESS — probe write"}\n');

      const model = resolvedFeeClassifierModel();
      const tuneRecords: PerItemRecord[] = [];
      const testRecords: PerItemRecord[] = [];

      // ── Phase A: TUNE split, K=1 — prompt-shape sanity ONLY (moves nothing) ────
      for (const item of FEE_LINES_GOLD_TUNE) await runItem(item, 1, tuneRecords);

      // Plumbing hard-gate on the sanity pass: all live, no fallback.
      expect(
        tuneRecords.every((r) => r.modes.every((m) => m === "LIVE_CLASSIFIER")),
        `tune-phase fallback(s): ${JSON.stringify(tuneRecords.filter((r) => r.modes.some((m) => m !== "LIVE_CLASSIFIER")).map((r) => ({ id: r.id, errors: r.errorClasses })))}`,
      ).toBe(true);

      await sleep(INTER_PHASE_MS);

      // ── Phase B: the ONE scored pass — HELD-OUT test split, K=3 ────────────────
      for (const item of FEE_LINES_GOLD_TEST) await runItem(item, K, testRecords);

      // (Integrity is ASSERTED after the snapshot is frozen — see below — so a
      // degraded run still leaves its diagnostic record on disk.)
      const scoredFallbacks = testRecords
        .filter((r) => r.modes.some((m) => m !== "LIVE_CLASSIFIER"))
        .map((r) => ({ id: r.id, errors: r.errorClasses }));

      // ── Metrics (rep-0 = prediction of record; ported math only) ───────────────
      const toLabeled = (records: PerItemRecord[]): LabeledClassification<TrueCategoryLabel>[] =>
        records.map((r) => ({ id: r.id, predicted: r.predicted, actual: r.trueCategory }));
      const testLabeled = toLabeled(testRecords);
      const tuneLabeled = toLabeled(tuneRecords);

      const perClass = Object.fromEntries(
        TRUE_CATEGORY_LABELS.map((label) => {
          const report = perClassReport(testLabeled, label);
          return [label, report];
        }),
      );
      // Convention (pre-registered): a never-predicted class scores precision 0 via the
      // ported ratio(0,0)=0 — macro precision degrades toward FAILURE, never toward a pass.
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

      // ── The PRE-REGISTERED floors (plan §3.1, M2-amended) — REPORTED, not asserted ──
      const recallOf = (label: TrueCategoryLabel): number => perClass[label].recall;
      const floors = {
        accuracy: {
          floor: "≥ 20/21 (strictly beats the pinned 19/21 baseline; tie = DEFER)",
          value: `${correctCount}/21 = ${testAccuracy.toFixed(4)}`,
          pass: correctCount >= 20,
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
          "SIMULATED gold set (n=21 held-out, synthetic) — supports the pre-registered floor decision " +
          "(docs/plan-f1b-classifier.md §3.1, M2-amended) and NOTHING about real-world platform statements " +
          "(plan §4). Prediction of record = rep-0; floors judged verbatim in " +
          "docs/fee-classifier-calibration-status.md; a below-floor run means the label DEFERS (no re-run, " +
          "no floor change). Frozen after the run — regression tests read THIS file, never a live re-run.",
        runAt: new Date().toISOString(),
        model,
        provider: "groq (free tier, $0)",
        K,
        callPacingMs: CALL_PACING_MS,
        harness: "evals/gold/fee-classifier-calibration.live.test.ts",
        baseline: { pinned: "19/21 held-out (evals/gold/fee-baseline-measurement.test.ts)" },
        tunePhase: {
          note: "K=1 prompt-shape sanity ONLY (plan §3.2) — context, never a claim; moves no floor.",
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

      // Loud, greppable one-line verdict for the run log (the label decision happens in the
      // status doc against the frozen snapshot — this is telemetry, not the claim).
      console.log(
        `F1B-CALIBRATION-RESULT accuracy=${correctCount}/21 macroP=${macroPrecision.toFixed(3)} ` +
          `kappa=${macroKappa.toFixed(3)} flip=${flip.toFixed(3)} floorsCleared=${floorsCleared} ` +
          `degraded=${scoredFallbacks.length > 0}`,
      );

      // HARD: run integrity — AFTER the freeze, so a degraded run records itself
      // (diagnostic, never enshrined — the snapshot carries its own degraded flag).
      expect(
        scoredFallbacks.length === 0,
        `scored-phase fallback(s): ${JSON.stringify(scoredFallbacks)}`,
      ).toBe(true);
      expect(testRecords.length).toBe(21);
      expect(testRecords.every((r) => r.reps.length === K)).toBe(true);
      // Non-vacuous per-class denominators on the held-out split (≥3 each).
      for (const label of TRUE_CATEGORY_LABELS) {
        const denom = testRecords.filter((r) => r.trueCategory === label).length;
        expect(denom, `held-out denominator for ${label}`).toBeGreaterThanOrEqual(3);
      }
    },
    // (21 + 63) calls × 14s + 65s inter-phase + overhead — generous ceiling.
    2_400_000,
  );
});
