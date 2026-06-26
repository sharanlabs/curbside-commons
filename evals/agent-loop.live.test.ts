/**
 * LIVE R-LOOP-10 — the SC-3 self-correction evidence for the A2 single-agent loop. KEY-GATED and
 * auto-skipping offline (mirrors evals/judge-calibration.live.test.ts).
 *
 * DO NOT RUN as part of CI / `npm test` — vitest does NOT load .env, so judgeLiveEnabled() is false
 * and this whole suite SKIPS (zero Groq-window usage). It is run DELIBERATELY, ONCE, at the A2
 * GO/NO-GO, paced under the Groq free-tier day-window, AND ONLY AFTER the P3 judge calibration clears
 * the held-out bar (AM-1 — the catcher is a hard prerequisite for the LIVE milestone):
 *   node --env-file=.env node_modules/.bin/vitest run evals/agent-loop.live.test.ts
 *
 * Seeding (R-LOOP-10, do not coerce a live drafter to fabricate on cue): iteration-0 is the PLANTED
 * gold-positive draft fed in as the starting draft; the LIVE Groq judge then verifies (catch), and the
 * LIVE Groq re-draft fixes it — exercising judge-catch + live-loop-fix cleanly. Self-correction =
 * (verify catches -> reflect -> re-draft -> final all-supported), trajectory recorded.
 *
 * SAME-FAMILY (R-LOOP-5): drafter AND judge are both Groq gpt-oss-120b — this measures the INTEGRATED
 * loop's convergence + same-family detection, explicitly NOT a calibrated cross-family faithfulness
 * metric. K is a recall-style floor on the held-out split; its exact operating value is fixed + RECORDED
 * at the GO/NO-GO on held-out data (never tuned on the test split). The default below (>=7/9) is a
 * defensible majority+margin placeholder.
 */
import { writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { judgeLiveEnabled } from "@/lib/server/env-flags";
import { resolvedJudgeModel, resolvedJudgeProvider } from "@/lib/agents/semantic-judge";
import { resolvedGroqModel } from "@/lib/agents/groq";
import { runAgentLoop, type AgentLoopResult } from "@/lib/agents/loop/orchestrator";
import { GOLD_JUDGE_TERRITORY_POSITIVES } from "@/evals/gold/semantic-judge-gold";

const live = judgeLiveEnabled();

/** The 9 held-out planted positives (R-CAL-7 test split) — the judge's responsibility, never the gate's. */
const HELD_OUT = GOLD_JUDGE_TERRITORY_POSITIVES.filter((g) => g.split === "test");

/** Recall-style floor on the held-out split (placeholder; the operating K is recorded at the GO/NO-GO). */
const K = 7; // of 9

// Groq free tier reserves maxOutputTokens + prompt against the per-minute window at request time;
// pace sequentially (no concurrency, no retry) exactly as the judge calibration does.
const CALL_PACING_MS = 14_000;
const MAX_ITERATIONS = 3;

describe.skipIf(!live)("LIVE R-LOOP-10 — A2 loop self-corrects the held-out planted positives (free Groq, $0)", () => {
  it(
    "feeds each planted gold draft as iteration-0; the live loop catches + re-drafts; >= K self-correct",
    async () => {
      expect(HELD_OUT.length).toBe(9); // the held-out judge-territory split

      const budget = { spentUsd: 0, estimatedNextUsd: 0, capUsd: 5 }; // Groq free -> $0; ledger still threaded
      const perItem: Array<{
        id: string;
        failureMode: string;
        selfCorrected: boolean;
        seedCatchLive: boolean;
        finalVerifyMode: string | null;
        iterations: number;
        stopReason: string;
        finalAnyUnsupported: boolean | null;
        outreachStatus: string;
      }> = [];

      for (const item of HELD_OUT) {
        const result: AgentLoopResult = await runAgentLoop(
          { merchant: item.merchant },
          {
            live: true,
            budget,
            pacingMs: CALL_PACING_MS,
            maxIterations: MAX_ITERATIONS,
            seedDraft: item.draft, // iteration-0 = the planted gold-positive draft fed in
          },
        );
        // Self-correction: the loop CAUGHT the seed (it did not pass on iteration 0) AND converged.
        // Self-correction requires a GENUINE LIVE loop on the RIGHT iterations (Codex A2 P2 + the
        // confirming pass): (1) the seed caught by a REAL LIVE_JUDGE on iteration 0 — a
        // FAILED_TO_FALLBACK "verify=FAIL" is the judge NOT running, not a catch; (2) EVERY verify a
        // genuine LIVE_JUDGE (no fallback verify counted anywhere); (3) a real LIVE_AI redraft authored
        // the fix; (4) a real LIVE_JUDGE final; and converged. No fallback work can count.
        const liveSeedCatch = result.trajectory.some(
          (s) =>
            s.phase === "verify" &&
            s.iteration === 0 &&
            s.modelMode === "LIVE_JUDGE" &&
            s.verdictSummary.includes("verify=FAIL"),
        );
        const allVerifiesLive = result.trajectory
          .filter((s) => s.phase === "verify")
          .every((s) => s.modelMode === "LIVE_JUDGE");
        const liveRedraft = result.trajectory.some((s) => s.phase === "redraft" && s.modelMode === "LIVE_AI");
        const liveFinalVerify = result.finalVerify.judge?.mode === "LIVE_JUDGE";
        const selfCorrected = liveSeedCatch && allVerifiesLive && liveRedraft && liveFinalVerify && result.converged;
        perItem.push({
          id: item.id,
          failureMode: item.failureMode,
          selfCorrected,
          seedCatchLive: liveSeedCatch, // auditable: was iteration-0 a genuine live catch (not a fallback)?
          finalVerifyMode: result.finalVerify.judge?.mode ?? null, // auditable: the final verifier's mode
          iterations: result.iterations,
          stopReason: result.stopReason,
          finalAnyUnsupported: result.finalVerify.judge?.verdict.any_unsupported ?? null,
          outreachStatus: result.outreachStatus,
        });
        expect(result.costUsd).toBe(0); // free tier — the whole run is $0
      }

      const selfCorrected = perItem.filter((p) => p.selfCorrected).length;
      const report = {
        _provenance: {
          recorded_at_note: "stamp the date at commit time (no wall-clock in tests)",
          drafter_provider: "groq",
          drafter_model: resolvedGroqModel(),
          judge_provider: resolvedJudgeProvider(),
          judge_model: resolvedJudgeModel(),
          held_out_n: HELD_OUT.length,
          max_iterations: MAX_ITERATIONS,
          cost_usd: 0,
          note:
            "LIVE A2 single-agent loop over the 9 held-out planted positives. Drafter AND judge are " +
            "BOTH Groq gpt-oss-120b (same-family, R-LOOP-5): convergence + same-family detection, NOT a " +
            "calibrated cross-family faithfulness metric. K is a recall-style floor recorded at the GO/NO-GO.",
        },
        self_corrected: selfCorrected,
        held_out_n: HELD_OUT.length,
        K_floor: K,
        items: perItem,
      };
      writeFileSync("/tmp/agent-loop-selfcorrect.snapshot.json", JSON.stringify(report, null, 2));
      writeFileSync("lib/data/agent-loop.snapshot.json", JSON.stringify(report, null, 2));

      console.log("LIVE A2 SELF-CORRECTION (Groq gpt-oss-120b, same-family):");
      console.log(`  self-corrected ${selfCorrected}/${HELD_OUT.length} (K floor = ${K})`);
      for (const p of perItem) {
        console.log(`  ${p.id} [${p.failureMode}] selfCorrected=${p.selfCorrected} iters=${p.iterations} (${p.stopReason}) -> ${p.outreachStatus}`);
      }

      // SC-3 floor on held-out (the operating K is confirmed/recorded at the GO/NO-GO).
      expect(selfCorrected).toBeGreaterThanOrEqual(K);
    },
    1_500_000,
  );
});
