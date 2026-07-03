/**
 * Calibration HARNESS (spec §4, P2). Ties the gold set to the metrics by running, for each gold
 * item, the REAL deterministic gatekeeper (to partition judge-territory per R-CAL-1) and a JudgeFn
 * (returns the predicted draft-level verdict: "is there an unsupported assertion?").
 *
 * Layering: this lives under evals/ and depends DOWNWARD on lib/ (agents + the pure metrics) — lib/
 * never imports evals/. In P2 the JudgeFn is the deterministic mock (a plumbing stub — NOT a
 * calibration result). In P3 the same harness is fed the live cross-family judge (owner-gated key)
 * to produce the real metrics + the frozen calibration report.
 */
import { runGatekeeper } from "@/legacy/activation/lib/agents/gatekeeper";
import { mockJudge } from "@/legacy/activation/lib/agents/semantic-judge";
import {
  headlineReport,
  metricReport,
  type LabeledPrediction,
  type MetricReport,
} from "@/legacy/activation/lib/evals/judge-metrics";
import { GOLD_SET, type GoldItem } from "./semantic-judge-gold";

/** A judge as the harness sees it: given a gold item, predict whether the draft carries a fabrication. */
export type JudgeFn = (item: GoldItem) => boolean;

/** The deterministic mock judge as a JudgeFn — the P2 stub baseline ($0, no network). */
export const mockJudgeFn: JudgeFn = (item) => mockJudge(item.draft, item.merchant).any_unsupported;

/** Run the real gatekeeper + a judge over the gold set, producing draft-level labeled predictions. */
export function predict(judge: JudgeFn, gold: GoldItem[] = GOLD_SET): LabeledPrediction[] {
  return gold.map((item) => ({
    id: item.id,
    predictedFabricated: judge(item),
    actualFabricated: item.draftFabricated,
    gatekeeperApproved: runGatekeeper(item.draft, item.merchant).approvedForHumanReview,
  }));
}

export interface CalibrationRun {
  predictions: LabeledPrediction[];
  /** R-CAL-1 HEADLINE: metrics on the gatekeeper-PASSING subset (the judge's real input). */
  headline: MetricReport;
  /** Reference only: metrics over the full set (vacuum) — never the headline. */
  overall: MetricReport;
}

export function runCalibration(judge: JudgeFn, gold: GoldItem[] = GOLD_SET): CalibrationRun {
  const predictions = predict(judge, gold);
  return {
    predictions,
    headline: headlineReport(predictions),
    overall: metricReport(predictions),
  };
}

/** Split predictions by the gold split (R-CAL-6/7): tune the threshold on "tune", report on "test". */
export function splitPredictions(
  judge: JudgeFn,
  gold: GoldItem[] = GOLD_SET,
): { tune: LabeledPrediction[]; test: LabeledPrediction[] } {
  const tuneIds = new Set(gold.filter((g) => g.split === "tune").map((g) => g.id));
  const all = predict(judge, gold);
  return {
    tune: all.filter((p) => tuneIds.has(p.id)),
    test: all.filter((p) => !tuneIds.has(p.id)),
  };
}
