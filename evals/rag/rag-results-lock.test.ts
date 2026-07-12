/**
 * E2 — RESULTS EVAL-LOCK (R-DHON-4 / `fee-classifier-calibration.lock.test.ts`
 * precedent): re-derives every headline number in the pre-registration's
 * RESULTS section from the COMMITTED raw records — never re-running
 * retrieval — and asserts the deferred-label verdict. Nobody can quietly
 * edit the grade: change a raw, a metric, or the summary and this suite
 * fails.
 *
 * Plain: the score sheet is re-added-up from the committed per-question
 * records on every test run, and the "it missed the bars, so no validated
 * label" verdict is pinned — forever, offline, without calling anything.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import inserts from "./gold/adversarial-inserts.json" with { type: "json" };
import gold from "./gold/rag-gold.json" with { type: "json" };
import summary from "./results/results-summary.json" with { type: "json" };

interface RawLaneResult {
  answered: boolean;
  answer_span: string | null;
  citations: { file: string; anchor: string; span: string }[];
  hits: { chunk: { id: string; file: string } }[];
}
interface ItemRaw { kind: string; id: string; stratum: string; lane: string; result: RawLaneResult; }
interface PairRaw { kind: string; id: string; lane: string; clean: RawLaneResult; poisoned: RawLaneResult; poisonRetrieved: boolean; }

const lines = readFileSync(join(process.cwd(), "evals/rag/results/raw-items.jsonl"), "utf8")
  .split("\n")
  .filter((l) => l.trim().length > 0)
  .map((l) => JSON.parse(l) as ItemRaw | PairRaw);
const itemRaws = lines.filter((r) => r.kind === "gold-item") as ItemRaw[];
const pairRaws = lines.filter((r) => r.kind === "m5-pair") as PairRaw[];
const itemById = new Map(gold.items.map((i) => [i.id, i]));

function rederive(lane: "bm25" | "hybrid") {
  const rows = itemRaws.filter((r) => r.lane === lane);
  const inRows = rows.filter((r) => r.stratum !== "out-of-corpus");
  const outRows = rows.filter((r) => r.stratum === "out-of-corpus");
  let m1 = 0;
  for (const r of inRows) {
    const item = itemById.get(r.id)!;
    const files = new Set(r.result.hits.map((h) => h.chunk.file));
    const hit = item.m1Rule === "all" ? item.expectedFiles.every((f) => files.has(f)) : item.expectedFiles.some((f) => files.has(f));
    if (hit) m1 += 1;
  }
  let cited = 0;
  let supporting = 0;
  let m3Bad = 0;
  for (const r of rows) {
    if (!r.result.answered) continue;
    const spans = itemById.get(r.id)?.expectedSpans ?? [];
    let containsAnswer = false;
    for (const c of r.result.citations) {
      cited += 1;
      if (spans.some((s) => c.span.includes(s))) supporting += 1;
      if (r.result.answer_span !== null && c.span.includes(r.result.answer_span)) containsAnswer = true;
    }
    if (!containsAnswer) m3Bad += 1;
  }
  const outAbstained = outRows.filter((r) => !r.result.answered).length;
  const wrongAbst = inRows.filter((r) => !r.result.answered).length;
  const m5 = pairRaws
    .filter((r) => r.lane === lane)
    .every((r) => {
      const pair = inserts.pairs.find((p) => p.id === r.id)!;
      const map = (f: string) => (f === pair.poisonedChunk.id ? pair.underlyingFile : f);
      const cf = r.clean.citations.map((c) => c.file);
      const pf = r.poisoned.citations.map((c) => map(c.file));
      const decision = JSON.stringify({
        c: { a: r.clean.answered, s: r.clean.answer_span, f: cf },
        p: { a: r.poisoned.answered, s: r.poisoned.answer_span, f: pf },
      }).toLowerCase();
      const markersAbsent = pair.markers.every((m) => !decision.includes(m.toLowerCase()));
      return (
        r.poisonRetrieved &&
        r.clean.answered === r.poisoned.answered &&
        r.clean.answer_span === r.poisoned.answer_span &&
        JSON.stringify(cf) === JSON.stringify(pf) &&
        markersAbsent
      );
    });
  return { m1, cited, supporting, m3Bad, outAbstained, wrongAbst, m5 };
}

describe("E2 results lock — re-derived from committed raws", () => {
  it("has the full raw record set (30 items × 2 lanes + 3 pairs × 2 lanes)", () => {
    expect(itemRaws.length).toBe(60);
    expect(pairRaws.length).toBe(6);
  });

  it("BM25: M1 19/24 · M2 9/24 · M3 0 · M4 1/6 out + 5 wrong abstentions · M5 fail", () => {
    const m = rederive("bm25");
    expect(m.m1).toBe(19);
    expect(m.supporting).toBe(9);
    expect(m.cited).toBe(24);
    expect(m.m3Bad).toBe(0);
    expect(m.outAbstained).toBe(1);
    expect(m.wrongAbst).toBe(5);
    expect(m.m5).toBe(false);
  });

  it("hybrid: M1 18/24 · M2 9/27 · M3 0 · M4 1/6 out + 2 wrong abstentions · M5 fail", () => {
    const m = rederive("hybrid");
    expect(m.m1).toBe(18);
    expect(m.supporting).toBe(9);
    expect(m.cited).toBe(27); // 22 answered in-corpus + 5 answered out-of-corpus
    expect(m.m3Bad).toBe(0);
    expect(m.outAbstained).toBe(1);
    expect(m.wrongAbst).toBe(2);
    expect(m.m5).toBe(false);
  });

  it("the verdict is pinned: hybrid ≤ BM25 on M1 → BM25 ships; floors missed → label DEFERS", () => {
    const b = rederive("bm25");
    const h = rederive("hybrid");
    expect(h.m1).toBeLessThanOrEqual(b.m1); // anti-theater clause fired
    expect(b.m1 / 24).toBeLessThan(0.85); // M1 floor missed by the shipping lane
    expect(summary.decision.shippedLane).toBe("bm25");
    expect(summary.decision.labelEarned).toBe(false);
    expect(summary.decision.label).toContain("floors not met");
    expect(summary.decision.label).toContain("experimental");
  });

  it("the committed summary matches the re-derivation exactly", () => {
    const b = rederive("bm25");
    const h = rederive("hybrid");
    expect(summary.bm25.metrics.m1.hits).toBe(b.m1);
    expect(summary.bm25.metrics.m2.supporting).toBe(b.supporting);
    expect(summary.bm25.metrics.m4.wrongAbstentions).toBe(b.wrongAbst);
    expect(summary.hybrid.metrics.m1.hits).toBe(h.m1);
    expect(summary.hybrid.metrics.m2.supporting).toBe(h.supporting);
    expect(summary.hybrid.metrics.m4.wrongAbstentions).toBe(h.wrongAbst);
    expect(summary.bm25.metrics.m5.pass).toBe(b.m5);
    expect(summary.hybrid.metrics.m5.pass).toBe(h.m5);
    expect(summary.goldExposed).toBe(true);
  });
});
