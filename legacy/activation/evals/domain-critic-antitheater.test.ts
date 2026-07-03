/**
 * A3-4 ANTI-THEATER EVAL for the Domain Critic (R-A3-1). Offline, $0.
 *
 * The question R-A3-1 forces: does the LLM Domain Critic add value beyond its DETERMINISTIC COUNTERPART?
 * For this agent the counterpart is NOT the gold labels (B1 measured live-vs-gold = accuracy) and NOT the
 * gatekeeper/faithfulness controls (B2 measured a different axis) — it is `mockDomainJudge`, the real
 * keyword/hint heuristic that sits in the same file (advisor, 2026-06-28). So this eval compares the LIVE
 * calibrated judge (the FROZEN B1d cross-family Groq result) against the MOCK on the SAME held-out split.
 *
 * RESULT (recorded honestly — floor-not-ceiling, exactly like the Strategist's A3-2 eval): on the held-out
 * gold the mock TIES the live judge (both aggregate F1 = 1.00). The gold positives are single-dimension
 * body-swaps that the tuned keyword heuristic catches as well as the live judge reasons — so this eval is a
 * NECESSARY anti-theater FLOOR (it FAILS a Domain Critic that scores WORSE than its deterministic
 * baseline — the inverse-costume failure), NOT a label-earning ceiling. Therefore the `domain_critic`
 * trajectory label DEFERS (the loop's domain step stays "tool"), and the public count stays conservative.
 * Earning the label needs a DISCRIMINATING eval — harder cases keyword-matching fails, or live Gemini prose
 * — which lands at A3-7 / future; we do NOT manufacture a close-reading to rescue the label here.
 *
 * Why wire it at all if the label defers: the Domain Critic still adds the ADVISORY Effective-axis signal
 * into the loop's human gate (defense-in-depth, mirroring B2's REPLAY wiring) — the LABEL is conservative,
 * the SIGNAL is real.
 */
import { describe, it, expect } from "vitest";
import liveSnapshot from "@/legacy/activation/lib/data/domain-calibration.snapshot.json";
import { headlineReport } from "@/legacy/activation/lib/evals/judge-metrics";
import {
  mockDomainVerdictOf,
  runDomainCalibration,
  splitDomainPredictions,
} from "@/legacy/activation/evals/gold/domain-harness";

/** Pre-registered "materially beats" margin (F1 points). live - mock >= this ⇒ the label would EARN. */
const MATERIAL_MARGIN = 0.05;

/** The FROZEN live held-out metrics from the B1d cross-family Groq calibration (eval-locked separately). */
const liveHeldOut = liveSnapshot.metrics.aggregate.held_out_territory;

describe("A3-4 anti-theater — Domain Critic vs its deterministic counterpart (mockDomainJudge)", () => {
  // The mock's held-out aggregate metrics on the SAME split the live judge was scored on (offline, $0).
  const mockRun = runDomainCalibration(mockDomainVerdictOf);
  const mockHeldOut = headlineReport(splitDomainPredictions(mockRun.aggregate.predictions).test);

  it("the mock is a REAL comparator (non-vacuous): it catches the held-out domain defectives", () => {
    // A strawman baseline (recall ~0) would make any LLM trivially "win" — guard against that.
    expect(mockHeldOut.recall).toBeGreaterThan(0.8);
    expect(mockHeldOut.matrix.tp).toBeGreaterThan(0);
    // Same held-out split for both (the comparison is apples-to-apples).
    expect(mockHeldOut.n).toBe(liveHeldOut.n);
  });

  it("FLOOR (R-A3-1): the live Domain Critic is NOT WORSE than its deterministic counterpart", () => {
    // The inverse-costume failure — a calibrated agent scoring BELOW the keyword heuristic — would FAIL here.
    expect(liveHeldOut.f1).toBeGreaterThanOrEqual(mockHeldOut.f1);
    expect(liveHeldOut.recall).toBeGreaterThanOrEqual(mockHeldOut.recall);
  });

  it("CEILING NOT met → label DEFERS: the live judge does NOT materially beat the mock on this gold", () => {
    // This is the honest defer-lock (floor-not-ceiling). If a future DISCRIMINATING eval makes the live
    // judge beat the mock by >= MATERIAL_MARGIN, THIS assertion fails — that is the signal to flip the
    // `domain_critic` label from DEFERRED to EARNED and correct the agent count. Until then it stays "tool".
    expect(liveHeldOut.f1 - mockHeldOut.f1).toBeLessThan(MATERIAL_MARGIN);
  });
});
