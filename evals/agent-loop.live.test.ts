/**
 * LIVE R-A3-7 / R-LOOP-10 — the SC-3 self-correction harness for the CROSS-FAMILY loop (A3-3..A3-6:
 * Gemini Drafter ⊥ Groq critics). KEY-GATED and auto-skipping offline (mirrors evals/judge-calibration.live.test.ts).
 *
 * STATUS: this is the A3-7 LIVE run (OWNER-AUTHORIZED, GO 2026-06-28). It does NOT run in CI / `npm test`
 * — vitest does NOT load .env, so the cross-family gate below is false and the whole suite SKIPS (zero
 * spend). Run DELIBERATELY at the A3-7 gate, needing BOTH keys (the Gemini Drafter AND the Groq critics),
 * paced under the provider windows, with live AI armed for the run only (never persisted to .env):
 *   ENABLE_LIVE_AI=true node --env-file=.env node_modules/.bin/vitest run evals/agent-loop.live.test.ts
 *
 * Seeding (R-LOOP-10, do not coerce a live drafter to fabricate on cue): iteration-0 is the PLANTED
 * gold-positive draft fed in as the starting draft; the LIVE Groq judge then verifies (catch), and the
 * LIVE Gemini re-draft fixes it — exercising judge-catch + live-loop-fix cleanly. Self-correction =
 * (verify catches -> reflect -> re-draft -> final all-supported), trajectory recorded.
 *
 * CROSS-FAMILY (R-A3-2 / R-ARCH-3, restored at A3-3): the Drafter is Gemini Flash and BOTH critics are Groq
 * gpt-oss-120b (different families) — model-layer maker!=judge, ENFORCED by the gate below + per-item
 * asserts that BOTH critic providers are "groq". This measures the INTEGRATED loop's convergence +
 * cross-family detection on real Gemini prose.
 *
 * R-A3-9 K RE-PIN (the A3-7 deliverable): the floor K is re-pinned on a FRESH held-out split under the
 * stronger live Gemini drafter (a new error distribution). The fresh split = the disjoint TUNE split (7
 * planted positives, all 4 failure modes); K = floor(tune self-correction rate × 9); the 9-item TEST split
 * must then self-correct >= K. K is derived ONLY from the disjoint tune split — NEVER tuned on test.
 *
 * ROUTER ABLATION (A3-7 label decision, FREE — zero extra Groq calls): the reflect seam is wrapped so each
 * reflect step records BOTH the live `routerReflect` instruction AND the deterministic `strongReflection`
 * instruction on the SAME (gate, judge, domain, merchant) context (strongReflection is $0). This is the
 * live evidence for the Router label decision (it earns ONLY if its live revision is materially more
 * targeted than the strong baseline AND converges where the baseline would not — see docs/a3-7-live-run-status.md).
 */
import { writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { REFERENCE_PLATFORM_NAME } from "@/lib/core/constants";
import { groqLiveEnabled, liveAiEnabled } from "@/lib/server/env-flags";
import { resolvedJudgeModel, resolvedJudgeProvider } from "@/lib/agents/semantic-judge";
import { resolvedDomainJudgeProvider } from "@/lib/agents/domain-judge";
import { resolvedGeminiModel } from "@/lib/agents/gemini";
import {
  runAgentLoop,
  type AgentLoopResult,
  type RevisionPlan,
  type RouterFn,
} from "@/lib/agents/loop/orchestrator";
import { routerReflect, strongReflection } from "@/lib/agents/router";
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

// R-A3-9 FRESH SPLITS: the disjoint tune (set K) + test (confirm) partitions of the held-out judge-territory
// positives. Both are "fresh" under the live Gemini drafter (a new error distribution); disjointness gives
// "never tuned on the test split" for free.
const TUNE = GOLD_JUDGE_TERRITORY_POSITIVES.filter((g) => g.split === "tune"); // 7
const TEST = GOLD_JUDGE_TERRITORY_POSITIVES.filter((g) => g.split === "test"); // 9

// Pace sequentially (no concurrency, no retry) against BOTH provider windows — the Groq critics'
// per-minute reservation and the Gemini Drafter's quota — exactly as the calibration runs do.
const CALL_PACING_MS = 12_000;
const MAX_ITERATIONS = 3;

interface PerItem {
  id: string;
  split: "tune" | "test";
  failureMode: string;
  selfCorrected: boolean;
  seedCatchLive: boolean;
  finalVerifyMode: string | null;
  /** The FINAL accepted redraft's mode (Codex A3-7 P1) — LIVE_AI ⇒ the live Gemini authored the converged
   *  draft; FAILED_TO_FALLBACK ⇒ the deterministic stub did (NOT a live self-correction). */
  finalRedraftMode: string | null;
  /** Every redraft step's (iteration, mode, summary) — closes the instrumentation gap (Codex A3-7 P1/P2):
   *  the summary carries the fallback errorClass when present, so the 6-fallback claim is now snapshot-proven. */
  redrafts: Array<{ iteration: number; mode: string; summary: string }>;
  judgeProvider: string | null;
  domainProvider: string | null;
  /** The Domain Critic's mode (Codex A3-7 P2) — LIVE_JUDGE ⇒ it genuinely ran live; a FAILED_TO_FALLBACK
   *  with provider groq would otherwise read as "ran live". `null` when the gatekeeper blocked the final draft. */
  domainMode: string | null;
  iterations: number;
  stopReason: string;
  finalAnyUnsupported: boolean | null;
  outreachStatus: string;
}

// ROUTER ABLATION accumulator — populated by the comparisonReflect wrapper below. Each entry is one reflect
// step: the live Router's instruction vs the deterministic strongReflection's, on the SAME context.
interface ReflectComparison {
  itemId: string;
  liveMode: string | undefined;
  liveSignals: string[];
  baselineSignals: string[];
  signalsEqual: boolean;
  instructionsEqual: boolean;
  liveInstruction: string;
  baselineInstruction: string;
}

describe.skipIf(!live)(
  "LIVE R-A3-7 — cross-family loop self-corrects (Gemini drafter, Groq critics); K re-pinned on the fresh tune split",
  () => {
    it(
      "tune split sets K = floor(rate × 9); the test split self-corrects >= K; Router ablation recorded",
      async () => {
        expect(TUNE.length).toBe(7);
        expect(TEST.length).toBe(9);

        // The Gemini Drafter bills every re-draft; this ledger is the REAL cumulative $5 cap across the
        // WHOLE run (the Groq critics are free). Per-item spend is checked against the cap below (R-A3-7).
        const budget = { spentUsd: 0, estimatedNextUsd: 0, capUsd: 5 };
        const reflectComparisons: ReflectComparison[] = [];
        let currentItemId = "";

        // ROUTER ABLATION (FREE): run the live Router (preserving loop behavior — it is the A3-6 default)
        // AND compute the deterministic strongReflection on the SAME context; record both, return the live
        // plan. strongReflection is $0 / zero Groq tokens, so the baseline arm adds NO spend. The loop still
        // re-drafts off the LIVE Router's instruction (no behavior change).
        const comparisonReflect: RouterFn = async (ctx) => {
          const livePlan: RevisionPlan = await routerReflect(ctx, {
            live: true,
            budget,
            platformName: REFERENCE_PLATFORM_NAME,
          });
          const baseline = strongReflection(ctx);
          reflectComparisons.push({
            itemId: currentItemId,
            liveMode: livePlan.mode,
            liveSignals: livePlan.signals,
            baselineSignals: baseline.signals,
            signalsEqual: JSON.stringify(livePlan.signals) === JSON.stringify(baseline.signals),
            instructionsEqual: livePlan.instruction.trim() === baseline.instruction.trim(),
            liveInstruction: livePlan.instruction,
            baselineInstruction: baseline.instruction,
          });
          return livePlan;
        };

        async function runSplit(items: typeof TUNE, split: "tune" | "test"): Promise<PerItem[]> {
          const out: PerItem[] = [];
          for (const item of items) {
            currentItemId = item.id;
            const result: AgentLoopResult = await runAgentLoop(
              { merchant: item.merchant },
              {
                live: true,
                budget,
                pacingMs: CALL_PACING_MS,
                maxIterations: MAX_ITERATIONS,
                seedDraft: item.draft, // iteration-0 = the planted gold-positive draft fed in
                reflect: comparisonReflect, // the FREE Router ablation wrapper (still runs the live Router)
              },
            );
            // CUMULATIVE LEDGER across items (Codex A3-3 P1-2): the orchestrator CLONES the budget per run,
            // so the OUTER ledger must accrue result.costUsd here to (a) carry the running total into the
            // next item's run and (b) make the $5-cap assertion + the reported cost real, not vacuous.
            budget.spentUsd += result.costUsd;
            // Self-correction (UNCHANGED strict definition): the loop CAUGHT the seed on iteration 0 via a
            // GENUINE LIVE_JUDGE (a FAILED_TO_FALLBACK "verify=FAIL" is the judge NOT running, not a catch),
            // EVERY verify a genuine LIVE_JUDGE, a real LIVE_AI redraft authored the fix, a real LIVE_JUDGE
            // final, the judge family is groq (cross-family), and converged. No fallback work can count.
            const liveSeedCatch = result.trajectory.some(
              (s) =>
                s.phase === "verify" &&
                s.iteration === 0 &&
                s.modelMode === "LIVE_JUDGE" &&
                s.verdictSummary.includes("verify=FAIL"),
            );
            const allVerifiesLive = result.trajectory
              .filter((s) => s.phase === "verify" && s.toolCalls.some((t) => t.tool === "check_faithfulness_reverse"))
              .every((s) => s.modelMode === "LIVE_JUDGE");
            // FINAL redraft must be LIVE_AI (Codex A3-7 P1): the redraft that produced the CONVERGED draft is
            // the LAST recorded redraft step (highest iteration). `.some(LIVE_AI)` overcounts — an early live
            // redraft + a later deterministic-fallback final redraft is NOT a genuine live self-correction.
            const redrafts = result.trajectory
              .filter((s) => s.phase === "redraft")
              .map((s) => ({ iteration: s.iteration, mode: s.modelMode, summary: s.verdictSummary }));
            const finalRedraft = redrafts.length ? redrafts[redrafts.length - 1] : null;
            const liveFinalRedraft = finalRedraft?.mode === "LIVE_AI";
            const liveFinalVerify = result.finalVerify.judge?.mode === "LIVE_JUDGE";
            const crossFamilyJudge = result.finalVerify.judge?.provider === "groq";
            const selfCorrected =
              liveSeedCatch && allVerifiesLive && liveFinalRedraft && liveFinalVerify && crossFamilyJudge && result.converged;
            out.push({
              id: item.id,
              split,
              failureMode: item.failureMode,
              selfCorrected,
              seedCatchLive: liveSeedCatch,
              finalVerifyMode: result.finalVerify.judge?.mode ?? null,
              finalRedraftMode: finalRedraft?.mode ?? null,
              redrafts,
              judgeProvider: result.finalVerify.judge?.provider ?? null,
              domainProvider: result.finalVerify.domain?.provider ?? null,
              domainMode: result.finalVerify.domain?.mode ?? null,
              iterations: result.iterations,
              stopReason: result.stopReason,
              finalAnyUnsupported: result.finalVerify.judge?.verdict.any_unsupported ?? null,
              outreachStatus: result.outreachStatus,
            });
            // Cross-family critics ENFORCED per item (R-A3-2): BOTH the faithfulness judge AND the advisory
            // Domain Critic are the Groq family, never Gemini (vs the Gemini drafter). The faithfulness judge
            // ALWAYS runs in VERIFY; the Domain Critic runs ONLY on a gatekeeper-APPROVED final draft
            // (R-DARCH-4) — a gate-BLOCKED final draft legitimately has finalVerify.domain===null, so its
            // provider is asserted ONLY when the Domain Critic actually ran.
            expect(result.finalVerify.judge?.provider).toBe("groq");
            if (result.finalVerify.domain) expect(result.finalVerify.domain.provider).toBe("groq");
            // The REAL cumulative ledger (accrued above) must never exceed the $5 cap (R-A3-7).
            expect(budget.spentUsd).toBeLessThanOrEqual(budget.capUsd);
            expect(result.costUsd).toBeGreaterThanOrEqual(0);
          }
          return out;
        }

        // ── R-A3-9: set K on the FRESH tune split, confirm on the disjoint test split ──
        const tuneItems = await runSplit(TUNE, "tune");
        const tuneSelfCorrected = tuneItems.filter((p) => p.selfCorrected).length;
        const rTune = tuneSelfCorrected / TUNE.length;
        const K = Math.floor(rTune * TEST.length); // pinned rule (docs/a3-7-live-run-status.md §3) — set on tune ONLY

        const testItems = await runSplit(TEST, "test");
        const testSelfCorrected = testItems.filter((p) => p.selfCorrected).length;

        // ── Router ablation summary (the live label evidence) ──
        const routerLiveCalls = reflectComparisons.filter((c) => c.liveMode === "LIVE_AI").length;
        const routerInstructionsDiffer = reflectComparisons.filter((c) => !c.instructionsEqual).length;
        const routerSignalsDiffer = reflectComparisons.filter((c) => !c.signalsEqual).length;

        // ── Live-redraft + domain-critic audits (Codex A3-7 P1/P2: prove, don't assert) ──
        const allItems = [...tuneItems, ...testItems];
        const finalRedraftLive = allItems.filter((p) => p.finalRedraftMode === "LIVE_AI").map((p) => p.id);
        const finalRedraftFellBack = allItems
          .filter((p) => p.finalRedraftMode !== null && p.finalRedraftMode !== "LIVE_AI")
          .map((p) => ({ id: p.id, finalRedraftMode: p.finalRedraftMode }));
        const domainLive = allItems.filter((p) => p.domainMode === "LIVE_JUDGE").map((p) => p.id);
        const domainNonLive = allItems
          .filter((p) => p.domainMode !== null && p.domainMode !== "LIVE_JUDGE")
          .map((p) => ({ id: p.id, domainMode: p.domainMode }));

        // HONESTY GUARD (Codex A3-7 confirming P2-1): the K-floor check is NOT a convergence pass when the
        // run is PROVIDER-DEGRADED (detection < 16/16 ⇒ some Groq judge calls fell back) or K is low/vacuous.
        // Computed here so the FROZEN snapshot says so standalone, not only in the status doc.
        const detectionN = allItems.filter((p) => p.seedCatchLive).length;
        const degraded = detectionN < allItems.length;

        const report = {
          _provenance: {
            recorded_at_note: "A3-7 LIVE cross-family run (stamp the date at commit time; no wall-clock in tests)",
            drafter_provider: "gemini",
            drafter_model: resolvedGeminiModel(),
            judge_provider: resolvedJudgeProvider(),
            judge_model: resolvedJudgeModel(),
            domain_provider: resolvedDomainJudgeProvider(),
            max_iterations: MAX_ITERATIONS,
            cost_usd: budget.spentUsd,
            detection: `${detectionN}/${allItems.length} seeds caught live`,
            degraded,
            note:
              "LIVE A3-7 cross-family integrated loop. Drafter = Gemini Flash, BOTH critics = Groq gpt-oss-120b " +
              "(different families, R-A3-2/R-ARCH-3). R-A3-9: K set on the disjoint TUNE split (K = floor(tune-rate × 9)), " +
              "COMPARED on TEST (never tuned on test). NOTE: the integrated DECIDE-the-labels result is run-independent " +
              "(all 3 labels DEFER). The K/convergence number is a SEPARATE deliverable.",
          },
          _caveat:
            (degraded
              ? "PROVIDER-DEGRADED DIAGNOSTIC: detection < 16/16 means some Groq judge calls fell back — this run is NOT a clean measurement. "
              : "") +
            (K <= 1
              ? "K is VACUOUS (<=1): test_meets_floor is then an EMPTY floor and is NOT a convergence pass. "
              : "") +
            "The K/convergence deliverable (R-A3-9) is INCOMPLETE; an authoritative run is deferred (drafter-reliability fix first, then a fresh-window re-run). " +
            "The label decisions are run-independent. See docs/a3-7-live-run-status.md.",
          k_repin: {
            rule: "K = floor(tune_self_correction_rate × 9); set on the disjoint tune split, COMPARED on test (R-A3-9)",
            tune_n: TUNE.length,
            tune_self_corrected: tuneSelfCorrected,
            tune_rate: Number(rTune.toFixed(4)),
            K,
            test_n: TEST.length,
            test_self_corrected: testSelfCorrected,
            test_meets_floor: testSelfCorrected >= K,
            interpretation:
              degraded || K <= 1
                ? "NOT A CONVERGENCE PASS — provider-degraded and/or K vacuous; INCOMPLETE (deliverable #2). Do not read test_meets_floor as authoritative."
                : "K-floor met on the disjoint test split (clean run).",
          },
          live_redraft_audit: {
            note:
              "selfCorrected requires the FINAL redraft (the one that produced the converged draft) to be " +
              "LIVE_AI (Codex A3-7 P1) — not merely SOME live redraft. finalRedraftFellBack = converged via the " +
              "deterministic stub on the final redraft (NOT a live self-correction; sent draft is clean + grounded).",
            final_redraft_live: finalRedraftLive.length,
            final_redraft_fell_back: finalRedraftFellBack.length,
            fell_back_items: finalRedraftFellBack,
          },
          domain_critic_audit: {
            note:
              "Domain Critic mode per item (Codex A3-7 P2) — provider=groq alone does NOT prove it ran live; " +
              "LIVE_JUDGE does. domainNonLive = a gatekeeper-approved draft whose domain check fell back.",
            domain_live: domainLive.length,
            domain_non_live: domainNonLive.length,
            non_live_items: domainNonLive,
          },
          router_ablation: {
            note:
              "FREE ablation: live routerReflect vs deterministic strongReflection on the SAME reflect contexts. " +
              "The Router EARNS only if its live revision is materially more targeted AND converges where the " +
              "baseline would not. Equal instructions / signals => TIE => label DEFERS (AM-7).",
            reflect_steps: reflectComparisons.length,
            router_live_calls: routerLiveCalls,
            instructions_differ: routerInstructionsDiffer,
            signals_differ: routerSignalsDiffer,
            comparisons: reflectComparisons,
          },
          tune_items: tuneItems,
          test_items: testItems,
        };
        writeFileSync("/tmp/agent-loop-selfcorrect.snapshot.json", JSON.stringify(report, null, 2));
        writeFileSync("lib/data/agent-loop.snapshot.json", JSON.stringify(report, null, 2));

        console.log("LIVE A3-7 CROSS-FAMILY SELF-CORRECTION (Gemini drafter, Groq critics):");
        console.log(`  TUNE: ${tuneSelfCorrected}/${TUNE.length} self-corrected (rate ${rTune.toFixed(3)}) -> K = ${K}`);
        console.log(`  TEST: ${testSelfCorrected}/${TEST.length} self-corrected (floor K = ${K}; meets=${testSelfCorrected >= K})`);
        console.log(
          `  ROUTER ABLATION: ${reflectComparisons.length} reflect steps; live LLM ran ${routerLiveCalls}; ` +
            `instructions differ from strongReflection in ${routerInstructionsDiffer}; signals differ in ${routerSignalsDiffer}`,
        );
        for (const p of [...tuneItems, ...testItems]) {
          console.log(`  [${p.split}] ${p.id} [${p.failureMode}] selfCorrected=${p.selfCorrected} iters=${p.iterations} (${p.stopReason}) -> ${p.outreachStatus}`);
        }

        // SC-3 floor on the TEST split, K set on the disjoint TUNE split (R-A3-9).
        expect(testSelfCorrected).toBeGreaterThanOrEqual(K);
      },
      2_700_000,
    );
  },
);
