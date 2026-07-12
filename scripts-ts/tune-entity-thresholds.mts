/**
 * E4 — threshold tuning on the TUNE SPLIT ONLY (pre-reg §3/§4): grid-search
 * T_match/T_abstain against the tune pairs, optimizing recall SUBJECT TO the
 * precision-shaped constraints (M1-analogue ≥0.98 · trap resistance 100% ·
 * ambiguous→abstain ≥0.75 · abstain volume ≤0.30 — same shapes as the
 * registered floors, applied to tune data). The picked values are FROZEN in
 * `evals/entity/gold/thresholds.json` BEFORE the test split is ever queried.
 * This script never reads `corpus.test`.
 *
 * Run: node scripts-ts/tune-entity-thresholds.mts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { ensembleScore } from "../lib/entity/matcher.ts";

interface Pair { id: string; a: string; b: string; label: string; trap: boolean; }

/**
 * PHYSICAL test-split isolation (batch-D P2): the corpus file holds BOTH
 * splits, so this loader parses it, lifts ONLY `.tune`, and lets the rest go
 * out of scope immediately — no `.test` value is ever bound to a name in this
 * program. (The honest limitation, stated: the bytes of both splits do pass
 * through the JSON parser; what is enforced here is that no test-derived value
 * can reach any computation below.)
 */
function loadTuneSplitOnly(): Pair[] {
  const parsed = JSON.parse(readFileSync(join(process.cwd(), "evals/entity/gold/entity-pairs.json"), "utf8")) as {
    tune: Pair[];
  };
  return parsed.tune;
}
const tune = loadTuneSplitOnly(); // the ONLY split this script touches

const scored = tune.map((p) => ({ ...p, score: ensembleScore(p.a, p.b) }));

interface Candidate { tMatch: number; tAbstain: number; precision: number; recall: number; trapOk: boolean; ambigAbstain: number; abstainVol: number; }
const candidates: Candidate[] = [];
for (let tm = 0.999; tm >= 0.7; tm -= 0.005) {
  for (let ta = tm - 0.02; ta >= 0.4; ta -= 0.01) {
    let proposedSame = 0;
    let trueSameProposed = 0;
    let sameTotal = 0;
    let sameCaught = 0;
    let trapFalseMerge = 0;
    let ambigTotal = 0;
    let ambigAbstained = 0;
    let abstains = 0;
    for (const p of scored) {
      const v = p.score >= tm ? "SAME" : p.score <= ta ? "DIFFERENT" : "ABSTAIN";
      if (v === "ABSTAIN") abstains += 1;
      if (p.label === "SAME") {
        sameTotal += 1;
        if (v === "SAME") sameCaught += 1;
      }
      if (v === "SAME") {
        proposedSame += 1;
        if (p.label === "SAME") trueSameProposed += 1;
        if (p.trap) trapFalseMerge += 1;
      }
      if (p.label === "AMBIGUOUS") {
        ambigTotal += 1;
        if (v === "ABSTAIN") ambigAbstained += 1;
      }
    }
    const precision = proposedSame === 0 ? 0 : trueSameProposed / proposedSame;
    const recall = sameTotal === 0 ? 0 : sameCaught / sameTotal;
    candidates.push({
      tMatch: Number(tm.toFixed(3)),
      tAbstain: Number(ta.toFixed(3)),
      precision,
      recall,
      trapOk: trapFalseMerge === 0,
      ambigAbstain: ambigTotal === 0 ? 0 : ambigAbstained / ambigTotal,
      abstainVol: abstains / scored.length,
    });
  }
}

const feasible = candidates.filter(
  (c) => c.precision >= 0.98 && c.trapOk && c.ambigAbstain >= 0.75 && c.abstainVol <= 0.3,
);
feasible.sort(
  (x, y) => y.recall - x.recall || y.precision - x.precision || x.abstainVol - y.abstainVol || y.tMatch - x.tMatch,
);
const pick = feasible[0];
if (!pick) {
  // Honest fallback: report the best-recall candidate meeting precision+trap
  // only, so the freeze records WHY the constraint set was infeasible on tune.
  const relaxed = candidates.filter((c) => c.precision >= 0.98 && c.trapOk);
  relaxed.sort((x, y) => y.recall - x.recall);
  console.log("NO fully-feasible candidate on tune; best precision+trap-only:", JSON.stringify(relaxed[0]));
  process.exit(2);
}

const frozen = {
  _doc: "E4 thresholds — tuned on the TUNE split ONLY (scripts-ts/tune-entity-thresholds.mts; corpus.test never read), FROZEN before scoring per docs/e4-entity-resolution-preregistration.md §4. No post-hoc changes.",
  tMatch: pick.tMatch,
  tAbstain: pick.tAbstain,
  tuneMetricsAtPick: pick,
  ensembleWeights: { jaroWinkler: 0.5, tokenSet: 0.35, phonetic: 0.15 },
  frozenAt: "2026-07-12 (pre-scoring)",
};
writeFileSync(join(process.cwd(), "evals/entity/gold/thresholds.json"), `${JSON.stringify(frozen, null, 2)}\n`);
console.log(JSON.stringify(frozen.tuneMetricsAtPick));
