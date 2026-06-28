/**
 * LIVE R-A3-7 / R-LOOP-10 — the SC-3 self-correction harness for the CROSS-FAMILY loop (A3-3: Gemini
 * Drafter + Groq judge). KEY-GATED and auto-skipping offline (mirrors evals/judge-calibration.live.test.ts).
 *
 * STATUS: this is the A3-7 harness SKELETON. The real live run is OWNER-GATED (R-A3-7: key + the $5
 * cap + a live Gemini model-id/pricing freshness check, RULES §6 + a Codex cross-check). It does NOT
 * run in CI / `npm test` — vitest does NOT load .env, so the gate below is false and the whole suite
 * SKIPS (zero spend). When run DELIBERATELY at A3-7 it needs BOTH keys (the Gemini Drafter AND the Groq
 * judge), paced under the provider windows:
 *   node --env-file=.env node_modules/.bin/vitest run evals/agent-loop.live.test.ts
 *
 * Seeding (R-LOOP-10, do not coerce a live drafter to fabricate on cue): iteration-0 is the PLANTED
 * gold-positive draft fed in as the starting draft; the LIVE Groq judge then verifies (catch), and the
 * LIVE Gemini re-draft fixes it — exercising judge-catch + live-loop-fix cleanly. Self-correction =
 * (verify catches -> reflect -> re-draft -> final all-supported), trajectory recorded.
 *
 * CROSS-FAMILY (R-A3-2 / R-ARCH-3, restored at A3-3): the Drafter is Gemini Flash and the judge is Groq
 * gpt-oss-120b (different families) — model-layer maker!=judge, ENFORCED by the gate below + a per-item
 * assert that the judge provider is "groq". This measures the INTEGRATED loop's convergence + cross-family
 * detection. SKELETON CAVEAT (Codex A3-3 P2): K AND the held-out split below are PLACEHOLDERS reusing the
 * existing P3 split; R-A3-9 requires re-pinning K on a FRESH Gemini-sized held-out split at the A3-7 gate
 * (the stronger drafter changes the error distribution) — that fresh split is a remaining A3-7 task,
 * recorded there, NEVER tuned on the test split.
 */
import { writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { groqLiveEnabled, liveAiEnabled } from "@/lib/server/env-flags";
import { resolvedJudgeModel, resolvedJudgeProvider } from "@/lib/agents/semantic-judge";
import { resolvedDomainJudgeProvider } from "@/lib/agents/domain-judge";
import { resolvedGeminiModel } from "@/lib/agents/gemini";
import { runAgentLoop, type AgentLoopResult } from "@/lib/agents/loop/orchestrator";
import { GOLD_JUDGE_TERRITORY_POSITIVES } from "@/evals/gold/semantic-judge-gold";

// CROSS-FAMILY GATE (R-A3-2; Codex A3-3 P1 + A3-4): a real cross-family run needs the Gemini Drafter key
// (liveAiEnabled), the Groq key (groqLiveEnabled), AND BOTH critics resolving to "groq" — the
// faithfulness judge (resolvedJudgeProvider) AND the Domain Critic (resolvedDomainJudgeProvider, a
// SEPARATE env). Either flipped to gemini would run a same-family critic under a "cross-family" banner;
// gating on both === "groq" skips instead.
const live =
  liveAiEnabled() &&
  groqLiveEnabled() &&
  resolvedJudgeProvider() === "groq" &&
  resolvedDomainJudgeProvider() === "groq";

/**
 * PLACEHOLDER split (Codex A3-3 P2): the EXISTING P3 held-out planted positives (R-CAL-7 test split).
 * R-A3-9 requires K to be re-pinned on a FRESH held-out split sized for the Gemini drafter at A3-7;
 * constructing that fresh split is a remaining A3-7 task — this skeleton reuses the P3 split as a stand-in.
 */
const HELD_OUT = GOLD_JUDGE_TERRITORY_POSITIVES.filter((g) => g.split === "test");

/** Recall-style floor — a PLACEHOLDER over the existing P3 split above; the operating K is set + recorded
 *  at A3-7 on a FRESH Gemini-sized held-out split (R-A3-9), never tuned on the test split. */
const K = 7; // of 9 (placeholder using the existing P3 split)

// Pace sequentially (no concurrency, no retry) against BOTH provider windows — the Groq judge's
// per-minute reservation and the Gemini Drafter's quota — exactly as the calibration runs do.
const CALL_PACING_MS = 14_000;
const MAX_ITERATIONS = 3;

describe.skipIf(!live)("LIVE R-A3-7 — cross-family loop self-corrects the held-out planted positives (Gemini drafter, Groq judge)", () => {
  it(
    "feeds each planted gold draft as iteration-0; the live loop catches + re-drafts; >= K self-correct",
    async () => {
      expect(HELD_OUT.length).toBe(9); // the held-out judge-territory split

      // The Gemini Drafter bills every re-draft; this ledger is the REAL cumulative $5 cap across the
      // whole run (the Groq judge is free). Per-item spend is checked against the cap below (R-A3-7).
      const budget = { spentUsd: 0, estimatedNextUsd: 0, capUsd: 5 };
      const perItem: Array<{
        id: string;
        failureMode: string;
        selfCorrected: boolean;
        seedCatchLive: boolean;
        finalVerifyMode: string | null;
        judgeProvider: string | null;
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
        // CUMULATIVE LEDGER across items (Codex A3-3 P1-2): the orchestrator CLONES the budget per run,
        // so the OUTER ledger must accrue result.costUsd here to (a) carry the running total into the
        // next item's run and (b) make the $5-cap assertion + the reported cost real, not vacuous.
        budget.spentUsd += result.costUsd;
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
        // CROSS-FAMILY (R-A3-2; Codex A3-3 P1): the catcher must be the GROQ judge, not a same-family
        // Gemini judge — a "cross-family self-correction" is only true if the judge family differs.
        const crossFamilyJudge = result.finalVerify.judge?.provider === "groq";
        const selfCorrected =
          liveSeedCatch && allVerifiesLive && liveRedraft && liveFinalVerify && crossFamilyJudge && result.converged;
        perItem.push({
          id: item.id,
          failureMode: item.failureMode,
          selfCorrected,
          seedCatchLive: liveSeedCatch, // auditable: was iteration-0 a genuine live catch (not a fallback)?
          finalVerifyMode: result.finalVerify.judge?.mode ?? null, // auditable: the final verifier's mode
          judgeProvider: result.finalVerify.judge?.provider ?? null, // auditable: the judge family (must be groq)
          iterations: result.iterations,
          stopReason: result.stopReason,
          finalAnyUnsupported: result.finalVerify.judge?.verdict.any_unsupported ?? null,
          outreachStatus: result.outreachStatus,
        });
        // Cross-family critics ENFORCED per item (R-A3-2): BOTH the faithfulness judge AND the advisory
        // Domain Critic are the Groq family, never Gemini (the catcher + the domain critic vs a Gemini drafter).
        expect(result.finalVerify.judge?.provider).toBe("groq");
        expect(result.finalVerify.domain?.provider).toBe("groq");
        // The Gemini Drafter bills; the REAL cumulative ledger (accrued above) must never exceed the $5 cap (R-A3-7).
        expect(budget.spentUsd).toBeLessThanOrEqual(budget.capUsd);
        expect(result.costUsd).toBeGreaterThanOrEqual(0);
      }

      const selfCorrected = perItem.filter((p) => p.selfCorrected).length;
      const report = {
        _provenance: {
          recorded_at_note: "stamp the date at commit time (no wall-clock in tests)",
          drafter_provider: "gemini",
          drafter_model: resolvedGeminiModel(),
          judge_provider: resolvedJudgeProvider(),
          judge_model: resolvedJudgeModel(),
          held_out_n: HELD_OUT.length,
          max_iterations: MAX_ITERATIONS,
          cost_usd: budget.spentUsd,
          note:
            "LIVE A3-7 cross-family loop over the EXISTING P3 held-out planted positives (PLACEHOLDER split; " +
            "a fresh Gemini-sized held-out split is still TODO at A3-7, R-A3-9). Drafter = Gemini Flash, judge = " +
            "Groq gpt-oss-120b (different families, R-A3-2/R-ARCH-3): convergence + cross-family detection. " +
            "K is recorded here, never tuned on test.",
        },
        self_corrected: selfCorrected,
        held_out_n: HELD_OUT.length,
        K_floor: K,
        items: perItem,
      };
      writeFileSync("/tmp/agent-loop-selfcorrect.snapshot.json", JSON.stringify(report, null, 2));
      writeFileSync("lib/data/agent-loop.snapshot.json", JSON.stringify(report, null, 2));

      console.log("LIVE A3-7 CROSS-FAMILY SELF-CORRECTION (Gemini drafter, Groq judge):");
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
