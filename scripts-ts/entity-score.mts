/**
 * E4 — THE ONE SCORING PASS (pre-reg §5/§6 + A1/A2). The test split is
 * queried here for the first and only time; it is EXPOSED afterward and
 * never re-scorable. Raws are flushed to disk BEFORE any metric is computed
 * (L-1 precedent). M5 (determinism) = the matcher runs over the split TWICE
 * inside this single scoring event; outputs must be byte-identical.
 *
 * Floors (conjunctive, mechanical): M1 merge precision ≥0.98 · M2 recall
 * ≥0.80 (abstain counts against M2) · M3 trap resistance 100% · M4
 * ambiguous→abstain ≥0.75 AND overall abstain ≤0.30 · M5 100%. Baseline
 * (A2 normalized-exact) scored on the same split; the ensemble must
 * STRICTLY beat it on M2 while holding M1/M3, else the protected default
 * ships and the writeup says so.
 *
 * Run: node scripts-ts/entity-score.mts
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { proposeMatch } from "../lib/entity/matcher.ts";
import { baselineVerdict } from "../lib/entity/normalize.ts";

const root = process.cwd();
const corpus = JSON.parse(readFileSync(join(root, "evals/entity/gold/entity-pairs.json"), "utf8")) as {
  test: { id: string; a: string; b: string; label: "SAME" | "DIFFERENT" | "AMBIGUOUS"; trap: boolean }[];
};
const thresholds = JSON.parse(readFileSync(join(root, "evals/entity/gold/thresholds.json"), "utf8")) as {
  tMatch: number;
  tAbstain: number;
};

const OUT = join(root, "evals/entity/results");
mkdirSync(OUT, { recursive: true });

// ── run 1 + run 2 (M5 determinism), raws flushed before metrics ─────────────
function runOnce() {
  return corpus.test.map((p) => {
    const m = proposeMatch(p.a, p.b, thresholds.tMatch, thresholds.tAbstain);
    return {
      id: p.id,
      label: p.label,
      trap: p.trap,
      score: m.score,
      verdict: m.verdict,
      baseline: baselineVerdict(p.a, p.b),
    };
  });
}
const run1 = runOnce();
const run2 = runOnce();
writeFileSync(join(OUT, "raw-pairs.json"), `${JSON.stringify({ run1, run2 }, null, 2)}\n`);

const m5Identical = JSON.stringify(run1) === JSON.stringify(run2);

// ── metrics from the flushed raws ───────────────────────────────────────────
function metrics(rows: typeof run1, verdictOf: (r: (typeof run1)[number]) => string) {
  let proposedSame = 0;
  let truly = 0;
  let sameTotal = 0;
  let sameCaught = 0;
  let trapMerges = 0;
  let trapTotal = 0;
  let ambigTotal = 0;
  let ambigAbstained = 0;
  let abstains = 0;
  for (const r of rows) {
    const v = verdictOf(r);
    if (v === "ABSTAIN") abstains += 1;
    if (r.label === "SAME") {
      sameTotal += 1;
      if (v === "SAME") sameCaught += 1;
    }
    if (r.trap) {
      trapTotal += 1;
      if (v === "SAME") trapMerges += 1;
    }
    if (v === "SAME") {
      proposedSame += 1;
      if (r.label === "SAME") truly += 1;
    }
    if (r.label === "AMBIGUOUS") {
      ambigTotal += 1;
      if (v === "ABSTAIN") ambigAbstained += 1;
    }
  }
  // A1: any floor metric with a zero denominator = floors UNMET (hard fail).
  const zeroDenominator = proposedSame === 0 || sameTotal === 0 || trapTotal === 0 || ambigTotal === 0;
  return {
    m1: { truly, proposedSame, precision: proposedSame === 0 ? 0 : truly / proposedSame },
    m2: { sameCaught, sameTotal, recall: sameTotal === 0 ? 0 : sameCaught / sameTotal },
    m3: { trapMerges, trapTotal },
    m4: {
      ambigAbstained,
      ambigTotal,
      rate: ambigTotal === 0 ? 0 : ambigAbstained / ambigTotal,
      abstainVolume: abstains / rows.length,
    },
    zeroDenominator,
  };
}

const ensemble = metrics(run1, (r) => r.verdict);
const baseline = metrics(run1, (r) => r.baseline); // baseline never abstains

const floors = {
  m1: ensemble.m1.precision >= 0.98,
  m2: ensemble.m2.recall >= 0.8,
  m3: ensemble.m3.trapMerges === 0,
  m4: ensemble.m4.rate >= 0.75 && ensemble.m4.abstainVolume <= 0.3,
  m5: m5Identical,
  denominators: !ensemble.zeroDenominator,
};
const allFloors = Object.values(floors).every(Boolean);
const beatsBaseline =
  ensemble.m2.recall > baseline.m2.recall &&
  ensemble.m1.precision >= baseline.m1.precision &&
  ensemble.m3.trapMerges <= baseline.m3.trapMerges;

const summary = {
  scoredAt: "2026-07-12",
  registration: { doc: "docs/e4-entity-resolution-preregistration.md", commit: "31bd66d" },
  thresholds,
  testExposed: true,
  ensemble,
  baseline,
  floors,
  allFloors,
  beatsBaseline,
  decision: {
    shippedDefault: beatsBaseline && allFloors ? "ensemble (advisory)" : "normalized-exact (the protected default)",
    labelEarned: allFloors && beatsBaseline,
    label:
      allFloors && beatsBaseline
        ? "entity resolution: validated on a pre-registered synthetic adversarial split, one pass — advisory only"
        : "entity resolution: floors not met (see results) — experimental, advisory only",
  },
};
writeFileSync(join(OUT, "results-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify({ floors, allFloors, beatsBaseline, decision: summary.decision }));
console.log(
  `ensemble M1 ${ensemble.m1.truly}/${ensemble.m1.proposedSame} M2 ${ensemble.m2.sameCaught}/${ensemble.m2.sameTotal} M3 ${ensemble.m3.trapMerges}/${ensemble.m3.trapTotal} M4 ${ensemble.m4.ambigAbstained}/${ensemble.m4.ambigTotal}+vol${ensemble.m4.abstainVolume.toFixed(3)} M5 ${m5Identical}`,
);
console.log(
  `baseline M1 ${baseline.m1.truly}/${baseline.m1.proposedSame} M2 ${baseline.m2.sameCaught}/${baseline.m2.sameTotal} M3 ${baseline.m3.trapMerges}/${baseline.m3.trapTotal}`,
);
