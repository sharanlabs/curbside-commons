/**
 * LIVE A3-2b — the Strategist CONFIRMATORY floor check on a Groq free-tier gpt-oss-120b key. KEY-GATED +
 * auto-skipping offline (mirrors evals/agent-loop.live.test.ts). NOT part of `npm test` — vitest does
 * not load .env, so groqLiveEnabled() is false and this whole suite SKIPS (zero Groq-window usage). Run
 * it DELIBERATELY:
 *   node --env-file=.env node_modules/.bin/vitest run evals/strategist.live.test.ts
 *
 * CONFIRMATORY, NOT LABEL-EARNING (floor-not-ceiling — advisor + Codex): `caution` is a finite enum a
 * deterministic baseline (strongRecommend) matches, and the prompt even STATES the caution rule, so a
 * live pass confirms the model (1) runs end-to-end at $0 and (2) CLEARS the anti-theater FLOOR (it is
 * not a risk-blind costume) — NOT that it adds judgment value. The `strategist` label DEFERS to the
 * A3-3 cross-family judge. Pre-registered bar: docs/strategist-confirmatory-status.md. The open-ended
 * strategy/tone prose is CAPTURED here as samples for that future judge.
 */
import { writeFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { normalizeRow } from "@/legacy/activation/lib/core/pipeline";
import type { Merchant, MerchantInput } from "@/legacy/activation/lib/core/types";
import { diagnose } from "@/legacy/activation/lib/domain/diagnosis";
import { groqLiveEnabled } from "@/lib/server/env-flags";
import { resolvedGroqModel } from "@/lib/agents/groq";
import { strategistRecommend, strongRecommend, type StrategistRecommendation } from "@/legacy/activation/lib/agents/strategist";

const live = groqLiveEnabled();

const CALL_PACING_MS = 12_000; // pace against the Groq free-tier window (no concurrency, no retry)
const REPS = 2; // F-3 test-retest consistency (temperature is 0)
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

/** Same-play.touch / different-risk pairs across 4 engagement states (Low vs High source_risk_level). */
function pairSpecs(): Array<{ engagement: string; days: number; last: number; steps: number }> {
  return [
    { engagement: "actively_stuck", days: 30, last: 2, steps: 3 },
    { engagement: "dormant", days: 30, last: 10, steps: 3 },
    { engagement: "ghosted", days: 30, last: 10, steps: 1 },
    { engagement: "progressing", days: 20, last: 1, steps: 5 },
  ];
}

function input(name: string, risk: "Low" | "High", s: { days: number; last: number; steps: number }): MerchantInput {
  return {
    merchant_name: name,
    merchant_category: "Restaurant",
    days_since_signup: s.days,
    last_login_days_ago: s.last,
    steps_completed: s.steps,
    source_risk_level: risk,
  };
}

interface Row {
  engagement: string;
  risk: "Low" | "High";
  mode: string | undefined;
  caution: string;
  strongCaution: string;
  route: string;
  strategy: string;
  tone: string;
  cautionByRep: string[];
}

describe.skipIf(!live)("LIVE A3-2b — the Strategist clears the anti-theater floor on free Groq ($0)", () => {
  it(
    "on every same-play.touch/different-risk pair the LIVE Strategist raises caution for High (matches strongRecommend)",
    async () => {
      const budget = { spentUsd: 0, estimatedNextUsd: 0, capUsd: 5 };
      const rows: Row[] = [];

      async function evalMerchant(m: Merchant, risk: "Low" | "High", engagement: string): Promise<void> {
        const d = diagnose(m);
        const cautionByRep: string[] = [];
        let lastRec: StrategistRecommendation = strongRecommend(m, d); // placeholder, overwritten each rep
        for (let r = 0; r < REPS; r++) {
          const rec = await strategistRecommend(m, d, { live: true, budget });
          expect(rec.mode).toBe("LIVE_AI"); // F-1: it actually ran live (no silent fallback)
          cautionByRep.push(rec.caution);
          lastRec = rec;
          await sleep(CALL_PACING_MS);
        }
        rows.push({
          engagement,
          risk,
          mode: lastRec.mode,
          caution: lastRec.caution,
          strongCaution: strongRecommend(m, d).caution,
          route: lastRec.route,
          strategy: lastRec.strategy,
          tone: lastRec.tone,
          cautionByRep,
        });
      }

      for (const s of pairSpecs()) {
        await evalMerchant(normalizeRow(input(`${s.engagement} Low`, "Low", s), 1), "Low", s.engagement);
        await evalMerchant(normalizeRow(input(`${s.engagement} High`, "High", s), 2), "High", s.engagement);
      }

      // F-1: our budget ledger is never charged (the free-tier Groq path prices a call at 0 and
      // discards reported usage). NOTE (Codex A3-2b P1): this is NOT an independent provider-billing
      // measurement — "$0" rests on the key being a Groq FREE-tier key (rate-limited, not billed);
      // gpt-oss-120b's STANDARD price is $0.15/M in + $0.60/M out (groq.com/pricing, 2026-06-28). See
      // the cost-honesty note in docs/strategist-confirmatory-status.md.
      expect(budget.spentUsd).toBe(0);
      // F-3 (consistency): per-merchant caution stable across reps (temperature 0).
      for (const row of rows) expect(new Set(row.cautionByRep).size).toBe(1);

      const lowRows = rows.filter((r) => r.risk === "Low");
      const highRows = rows.filter((r) => r.risk === "High");
      const lowCorrect = lowRows.filter((r) => r.caution === "standard").length;
      const highCorrect = highRows.filter((r) => r.caution === "elevated").length;

      const report = {
        _provenance: {
          recorded_at_note: "stamp the date at commit time (no wall-clock in tests)",
          provider: "groq",
          model: resolvedGroqModel(),
          reps: REPS,
          n_pairs: pairSpecs().length,
          cost_basis:
            "Groq FREE-tier key (rate-limited, not billed) => $0; our budget ledger was not charged. NOT " +
            "an independent provider-billing measurement. Standard gpt-oss-120b: $0.15/M in + $0.60/M out " +
            "(groq.com/pricing, 2026-06-28). [Codex A3-2b P1]",
          note:
            "A3-2b CONFIRMATORY floor check (NOT label-earning). caution is a finite enum a deterministic " +
            "baseline matches; the `strategist` label DEFERS to the A3-3 cross-family judge. Strategy/tone " +
            "prose captured below as samples for that future judge.",
        },
        floor: {
          low_standard: `${lowCorrect}/${lowRows.length}`,
          high_elevated: `${highCorrect}/${highRows.length}`,
        },
        rows,
      };
      writeFileSync("/tmp/strategist-confirmatory.snapshot.json", JSON.stringify(report, null, 2));
      writeFileSync("lib/data/strategist-confirmatory.snapshot.json", JSON.stringify(report, null, 2));

      console.log("LIVE A3-2b STRATEGIST FLOOR (Groq gpt-oss-120b, $0):");
      console.log(`  Low->standard ${lowCorrect}/${lowRows.length}; High->elevated ${highCorrect}/${highRows.length}`);
      for (const r of rows) {
        console.log(`  [${r.engagement}/${r.risk}] caution=${r.caution} (strong=${r.strongCaution}) route=${r.route} :: ${r.strategy}`);
      }

      // THE FLOOR (F-2): every pair directionally correct — matches strongRecommend, not risk-blind.
      expect(lowCorrect).toBe(lowRows.length);
      expect(highCorrect).toBe(highRows.length);
    },
    600_000,
  );
});
