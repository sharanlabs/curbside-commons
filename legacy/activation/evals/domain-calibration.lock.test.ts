import { describe, it, expect } from "vitest";
import rawSnapshot from "@/legacy/activation/lib/data/domain-calibration.snapshot.json";
import type { MetricReport } from "@/legacy/activation/lib/evals/judge-metrics";
import { DOMAIN_DIMENSIONS, type DomainDimension } from "@/legacy/activation/lib/domain/effective-rubric";

/**
 * EVAL-LOCK (R-DHON-4) for the B1d domain-judge calibration — the FROZEN-FIXTURE regression test.
 * Mirrors evals/live-samples.test.ts: it reads the COMMITTED calibration snapshot and asserts the
 * recorded result CLEARED the pre-registered bar (docs/domain-calibration-status.md) AND is a real run.
 * It makes NO live call — the live runner is evals/domain-calibration.live.test.ts (owner-gated). This
 * is the guard that stops the domain judge's quality from silently drifting below the shipped bar.
 *
 * FROZEN CALIBRATION RESULT — cleared the pre-registered bar; Codex cross-model gate RAN + reconciled
 * (2 P2 code findings fixed; docs/reviews/codex-2026-06-26-b1-domain-judge.md) → label is now
 * "calibrated — directional, pending the ~100 validation floor" (methodology calibrated; metric directional)
 * (2026-06-26 · Groq gpt-oss-120b · K=3 · temp 0 · $0 · 36/36 LIVE_JUDGE · 0 fallbacks):
 *   held-out (test, n=18: 12 pos / 6 neg): recall 1.00 · precision 1.00 · F1 1.00 · CI95 [0.76, 1.00]
 *   per-dim held-out recall: matched 1.00 · engagement 1.00 · over_promise 1.00 ; κ 1.00 ; flip 0.00
 *   draft-level confusion: TP 24 / FP 0 / TN 12 / FN 0
 * We lock the pre-registered FLOORS + non-vacuity + real-run provenance — NOT the exact perfect numbers:
 * a future fresh-window re-run is non-deterministic, so a result that still clears the bar must not
 * red-alarm (the live-samples lock makes the same invariants-over-outcomes choice). DIRECTIONAL until the
 * ~100 validation floor (R-DHON-1); all gold positives are SYNTHETIC/planted (R-DCAL-4).
 *
 * KNOWN B2-TRACKED NUANCE (documented, NOT a bar item): engagement_appropriate per-dim PRECISION = 0.5 —
 * the judge also flags the generic matched_to_blocker (D1) drafts as engagement-inappropriate (a reasoned
 * cross-dimension stance, NOT answer-leakage — R-DARCH-2 verified; it does not dent aggregate precision,
 * which is 1.0). Carried to the B2 §4.2 / dimension-redundancy decision. The bar is per-dim RECALL.
 */

interface DimReports {
  held_out: MetricReport;
  tune: MetricReport;
}
interface Snapshot {
  _provenance: {
    recorded_at_note: string;
    provider: string;
    model: string;
    temperature: number;
    reps_per_item: number;
    cost_usd: number;
    fallbacks_excluded: number;
  };
  metrics: {
    aggregate: {
      overall_territory: MetricReport;
      tune_territory: MetricReport;
      held_out_territory: MetricReport;
      cohen_kappa_judge_vs_gold: number;
      test_retest_flip_rate: number;
    };
    per_dimension: Record<DomainDimension, DimReports>;
  };
  items: { mode: string }[];
}

const snapshot = rawSnapshot as unknown as Snapshot;

/** The pre-registered bar (docs/domain-calibration-status.md), pinned BEFORE the run (R-DCAL-7). */
const BAR = {
  heldOutRecall: 0.8,
  heldOutPrecision: 0.7,
  perDimRecall: {
    matched_to_blocker: 0.75,
    engagement_appropriate: 0.75,
    no_over_promise: 0.5,
  } as Record<DomainDimension, number>,
  kappaMin: 0.6,
  flipMax: 0.15,
};

describe("B1d domain calibration — eval-lock (frozen fixture, R-DHON-4; no live call)", () => {
  const agg = snapshot.metrics.aggregate;
  const dims = snapshot.metrics.per_dimension;

  it("is a REAL cross-family live run (groq gpt-oss-120b · temp 0 · K=3 · $0 · 0 fallbacks · 36/36 LIVE_JUDGE)", () => {
    const p = snapshot._provenance;
    expect(p.provider).toBe("groq");
    expect(p.model).toBe("openai/gpt-oss-120b");
    expect(p.temperature).toBe(0);
    expect(p.reps_per_item).toBe(3);
    expect(p.cost_usd).toBe(0);
    expect(p.fallbacks_excluded).toBe(0);
    expect(snapshot.items.length).toBe(36);
    expect(snapshot.items.every((i) => i.mode === "LIVE_JUDGE")).toBe(true);
  });

  it("the date was stamped at commit time (no placeholder shipped)", () => {
    expect(snapshot._provenance.recorded_at_note).toMatch(/^2026-/);
  });

  it("held-out (test split) CLEARS the pre-registered recall + precision bar (R-DCAL-7)", () => {
    expect(agg.held_out_territory.n).toBeGreaterThan(0);
    expect(agg.held_out_territory.recall).toBeGreaterThanOrEqual(BAR.heldOutRecall);
    expect(agg.held_out_territory.precision).toBeGreaterThanOrEqual(BAR.heldOutPrecision);
  });

  it("per-dimension held-out recall clears each pre-registered floor (R-DCAL-2)", () => {
    for (const dim of DOMAIN_DIMENSIONS) {
      expect(dims[dim].held_out.recall, `${dim} recall`).toBeGreaterThanOrEqual(BAR.perDimRecall[dim]);
    }
  });

  it("κ and test-retest flip-rate clear the pre-registered bar", () => {
    expect(agg.cohen_kappa_judge_vs_gold).toBeGreaterThanOrEqual(BAR.kappaMin);
    expect(agg.test_retest_flip_rate).toBeLessThanOrEqual(BAR.flipMax);
  });

  it("the recording is non-vacuous: the judge flagged defects AND passed clean drafts (not always-flag)", () => {
    const m = agg.overall_territory.matrix;
    expect(m.tp).toBeGreaterThan(0);
    expect(m.tn).toBeGreaterThan(0);
  });

  it("documents the known engagement per-dim precision nuance for B2 (visible in the lock, not hidden)", () => {
    // Asserted as RECORDED + < 1 so the cross-dim bleed stays visible; it is NOT a pass/fail bar item.
    expect(dims.engagement_appropriate.held_out.precision).toBeLessThan(1);
  });
});
