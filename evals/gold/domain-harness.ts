/**
 * Calibration HARNESS for the domain-quality judge (Track B1, B1c). Mirrors `evals/gold/harness.ts`
 * for the Effective axis, and adds the R-DCAL-1 LIVE marginal-value enforcement (advisor #2): every
 * gold item is run through the REAL `runGatekeeper` AND the faithfulness `mockJudge` so a domain-defect
 * counts ONLY when it passes the deterministic gate AND is faithful — proving the catch is a pure
 * domain residual, not a re-catch of an upstream control.
 *
 * Layering: lives under evals/ and depends DOWNWARD on lib/ (agents + the pure metrics); lib/ never
 * imports evals/. In B1c the verdict source is the deterministic mock (a stub baseline, NOT a
 * calibration result). In B1d the SAME helpers are fed the live cross-family judge's verdicts (collected
 * async, owner-gated key) to produce the real metrics + the frozen calibration report.
 *
 * The positive class is DOMAIN-DEFECTIVE. We reuse `lib/evals/judge-metrics.ts` unchanged — its math is
 * axis-agnostic, so `LabeledPrediction.predictedFabricated`/`actualFabricated` read here as the positive
 * (defective) class, and `gatekeeperApproved` is repurposed as "reaches the domain judge" = gate-passing
 * AND faithful (the R-DCAL-1 partition for this judge).
 */
import { runGatekeeper } from "@/lib/agents/gatekeeper";
import { mockJudge } from "@/lib/agents/semantic-judge";
import { mockDomainJudge, dimensionPassMap, type DomainVerdict } from "@/lib/agents/domain-judge";
import { DOMAIN_DIMENSIONS, type DomainDimension } from "@/lib/domain/effective-rubric";
import {
  headlineReport,
  metricReport,
  type LabeledPrediction,
  type MetricReport,
} from "@/lib/evals/judge-metrics";
import { DOMAIN_GOLD_SET, type DomainGoldItem } from "./domain-gold";

/** A verdict source: given a gold item, return the domain verdict. Sync, so the LIVE test pre-collects
 *  its async verdicts into a map and passes a map-lookup (the judge is called ONCE per item, not 4×). */
export type DomainVerdictOf = (item: DomainGoldItem) => DomainVerdict;

/** The deterministic mock judge as a verdict source — the B1c STUB BASELINE ($0, no network). */
export const mockDomainVerdictOf: DomainVerdictOf = (item) => mockDomainJudge(item.draft, item.merchant);

/** R-DCAL-1: does this item reach the domain judge? = the REAL gatekeeper approves AND it is FAITHFUL
 *  (the faithfulness mock finds no unsupported claim). Both are $0 deterministic checks. */
export function reachesDomainJudge(item: DomainGoldItem): {
  gateApproved: boolean;
  faithful: boolean;
  territory: boolean;
} {
  const gateApproved = runGatekeeper(item.draft, item.merchant).approvedForHumanReview;
  const faithful = !mockJudge(item.draft, item.merchant).any_unsupported;
  return { gateApproved, faithful, territory: gateApproved && faithful };
}

/**
 * R-DCAL-1 ENFORCEMENT (the teeth — like P2's live R-CAL-1, which caught a defective planted positive):
 * return every gold item whose ACTUAL gatekeeper/faithful status disagrees with its declared label. The
 * offline test asserts this is empty, so a mis-constructed gold item (e.g. one that trips the guardrail
 * or carries an accidental fabrication) fails the build instead of silently corrupting the metrics.
 */
export function domainTerritoryViolations(gold: DomainGoldItem[] = DOMAIN_GOLD_SET): {
  id: string;
  reason: string;
}[] {
  const out: { id: string; reason: string }[] = [];
  for (const item of gold) {
    const { gateApproved, faithful } = reachesDomainJudge(item);
    if (gateApproved !== item.expectGatekeeperApproves) {
      out.push({ id: item.id, reason: `gatekeeper approved=${gateApproved}, expected ${item.expectGatekeeperApproves}` });
    }
    if (faithful !== item.expectFaithful) {
      out.push({ id: item.id, reason: `faithful=${faithful}, expected ${item.expectFaithful}` });
    }
  }
  return out;
}

interface JudgedRow {
  item: DomainGoldItem;
  verdict: DomainVerdict;
  territory: boolean;
}

/** Call the verdict source ONCE per item (critical: the LIVE judge is metered) + attach R-DCAL-1 reach. */
function judgeRows(verdictOf: DomainVerdictOf, gold: DomainGoldItem[]): JudgedRow[] {
  return gold.map((item) => ({
    item,
    verdict: verdictOf(item),
    territory: reachesDomainJudge(item).territory,
  }));
}

/** Aggregate (draft-level) predictions: did the judge flag the draft as domain-defective? */
function aggregatePredictions(rows: JudgedRow[]): LabeledPrediction[] {
  return rows.map((r) => ({
    id: r.item.id,
    predictedFabricated: r.verdict.domain_defective,
    actualFabricated: r.item.draftDefective,
    gatekeeperApproved: r.territory,
  }));
}

/** Per-dimension predictions: did the judge mark THIS dimension as failing, and is the item defective
 *  ON this dimension? (Each positive fails exactly one dimension by construction, so a dim-D matrix has
 *  dim-D positives vs everything else.) This is the per-dimension recall the advisor asked for (#3). */
function dimensionPredictions(rows: JudgedRow[], dim: DomainDimension): LabeledPrediction[] {
  return rows.map((r) => ({
    id: r.item.id,
    predictedFabricated: dimensionPassMap(r.verdict)[dim] === false,
    actualFabricated: r.item.dimension === dim,
    gatekeeperApproved: r.territory,
  }));
}

export interface DomainCalibrationRun {
  /** The raw judged rows (item + verdict + R-DCAL-1 reach) for inspection / fixture freezing. */
  rows: { id: string; defectivePredicted: boolean; defectiveActual: boolean; dimension: DomainDimension | null; territory: boolean }[];
  aggregate: {
    predictions: LabeledPrediction[];
    /** R-DCAL-1 HEADLINE: aggregate recall on the judge-territory (gate-passing + faithful) subset. */
    headline: MetricReport;
    /** Reference only: metrics over the full set (vacuum). */
    overall: MetricReport;
  };
  /** Per-dimension reports (R-DCAL-2) on the judge-territory subset. */
  perDimension: Record<DomainDimension, MetricReport>;
}

export function runDomainCalibration(
  verdictOf: DomainVerdictOf = mockDomainVerdictOf,
  gold: DomainGoldItem[] = DOMAIN_GOLD_SET,
): DomainCalibrationRun {
  const rows = judgeRows(verdictOf, gold);
  const aggPreds = aggregatePredictions(rows);
  const perDimension = {} as Record<DomainDimension, MetricReport>;
  for (const dim of DOMAIN_DIMENSIONS) {
    perDimension[dim] = headlineReport(dimensionPredictions(rows, dim));
  }
  return {
    rows: rows.map((r) => ({
      id: r.item.id,
      defectivePredicted: r.verdict.domain_defective,
      defectiveActual: r.item.draftDefective,
      dimension: r.item.dimension,
      territory: r.territory,
    })),
    aggregate: {
      predictions: aggPreds,
      headline: headlineReport(aggPreds),
      overall: metricReport(aggPreds),
    },
    perDimension,
  };
}

/** Split predictions by the gold split (R-DCAL-5/7): tune the threshold on "tune", report on "test". */
export function splitDomainPredictions(
  predictions: LabeledPrediction[],
  gold: DomainGoldItem[] = DOMAIN_GOLD_SET,
): { tune: LabeledPrediction[]; test: LabeledPrediction[] } {
  const tuneIds = new Set(gold.filter((g) => g.split === "tune").map((g) => g.id));
  return {
    tune: predictions.filter((p) => tuneIds.has(p.id)),
    test: predictions.filter((p) => !tuneIds.has(p.id)),
  };
}
