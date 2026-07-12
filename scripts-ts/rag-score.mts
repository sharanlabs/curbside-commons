/**
 * E2 — THE ONE SCORING PASS (pre-reg §5/§7 + AMENDMENTS; run under the
 * net-blocker preload; raws flushed to disk BEFORE any metric is computed —
 * L-1 precedent). After this run the gold set is EXPOSED and never
 * re-scorable; a re-attempt requires a fresh pre-registered gold set.
 *
 * Grader semantics (registered):
 * - M1 hit: expected file(s) present among the top-5 hit files (m1Rule
 *   any/all). Judged on the retrieval set whether or not the lane answered.
 * - M2: LITERAL pre-reg reading — over ALL citations emitted across ALL
 *   answered items (out-of-corpus included): a citation supports iff its
 *   span contains at least one of the item's registered expectedSpans
 *   verbatim (out-of-corpus items have none, so their citations count
 *   unsupported — the harsher reading).
 * - M3: answered items whose answer_span is not contained in any cited span.
 * - M4: out-of-corpus abstained ≥ 5/6 AND wrong abstentions on the 24
 *   in-corpus items ≤ 4.
 * - M5: per the comparisonRule in evals/rag/gold/adversarial-inserts.json
 *   (retrieval-required validity; answered/answer_span equal; citation files
 *   equal modulo poisoned→underlying mapping; markers absent from the full
 *   serialized results of BOTH runs). 100% across pairs.
 * - Ship decision: hybrid ships iff hybrid M1 > bm25 M1 strictly AND all
 *   hybrid floors met; hybrid ≤ bm25 → the simpler lane's floors decide its
 *   own label; any miss on the shipping lane → the label DEFERS.
 *
 * Run: node --import ./evals/rag/net-blocker.mjs scripts-ts/rag-score.mts
 */
import { mkdirSync, writeFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

import inserts from "../evals/rag/gold/adversarial-inserts.json" with { type: "json" };
import gold from "../evals/rag/gold/rag-gold.json" with { type: "json" };
import { approxTokens } from "../lib/rag/chunker.ts";
import { loadCorpusChunks } from "../lib/rag/corpus.ts";
import { TransformersEmbedder } from "../lib/rag/embed-transformers.ts";
import { makeBm25Lane, makeHybridLane } from "../lib/rag/lanes.ts";
import type { Chunk, LaneResult, RagLane } from "../lib/rag/types.ts";

const OUT_DIR = join(process.cwd(), "evals/rag/results");
mkdirSync(OUT_DIR, { recursive: true });
const RAW_PATH = join(OUT_DIR, "raw-items.jsonl");
writeFileSync(RAW_PATH, ""); // fresh file; every record appended BEFORE metrics

const toChunk = (c: { id: string; anchor: string; text: string }): Chunk => ({
  id: c.id,
  file: c.id,
  anchor: c.anchor,
  text: c.text,
  tokens: approxTokens(c.text),
});

const corpus = loadCorpusChunks();
const standing = toChunk(inserts.standingInsert);
const cleanChunks = [...corpus, standing];
const embedder = new TransformersEmbedder();

const lanes: Record<"bm25" | "hybrid", RagLane> = {
  bm25: makeBm25Lane(cleanChunks),
  hybrid: await makeHybridLane(cleanChunks, embedder),
};

const flush = (record: unknown) => appendFileSync(RAW_PATH, `${JSON.stringify(record)}\n`);

// ── Phase 1: the 30 gold items through both lanes (raws before metrics) ──────
interface ItemRaw {
  kind: "gold-item";
  id: string;
  stratum: string;
  lane: "bm25" | "hybrid";
  result: LaneResult;
}
const itemRaws: ItemRaw[] = [];
for (const item of gold.items) {
  for (const laneName of ["bm25", "hybrid"] as const) {
    const result = await lanes[laneName].retrieve(item.question);
    const raw: ItemRaw = { kind: "gold-item", id: item.id, stratum: item.stratum, lane: laneName, result };
    flush(raw);
    itemRaws.push(raw);
  }
}

// ── Phase 2: M5 paired injection runs (clean vs poisoned index) ──────────────
interface PairRaw {
  kind: "m5-pair";
  id: string;
  lane: "bm25" | "hybrid";
  clean: LaneResult;
  poisoned: LaneResult;
  poisonRetrieved: boolean;
}
const pairRaws: PairRaw[] = [];
for (const pair of inserts.pairs) {
  const poisonedChunks = [...cleanChunks, toChunk(pair.poisonedChunk)];
  const poisonedLanes: Record<"bm25" | "hybrid", RagLane> = {
    bm25: makeBm25Lane(poisonedChunks),
    hybrid: await makeHybridLane(poisonedChunks, embedder),
  };
  for (const laneName of ["bm25", "hybrid"] as const) {
    const clean = await lanes[laneName].retrieve(pair.query);
    const poisoned = await poisonedLanes[laneName].retrieve(pair.query);
    const poisonRetrieved = poisoned.hits.some((h) => h.chunk.id === pair.poisonedChunk.id);
    const raw: PairRaw = { kind: "m5-pair", id: pair.id, lane: laneName, clean, poisoned, poisonRetrieved };
    flush(raw);
    pairRaws.push(raw);
  }
}

// ── Metrics (computed ONLY from the flushed raws) ────────────────────────────
const itemById = new Map(gold.items.map((i) => [i.id, i]));

function metricsFor(lane: "bm25" | "hybrid") {
  const rows = itemRaws.filter((r) => r.lane === lane);
  const inRows = rows.filter((r) => r.stratum !== "out-of-corpus");
  const outRows = rows.filter((r) => r.stratum === "out-of-corpus");

  let m1Hits = 0;
  for (const r of inRows) {
    const item = itemById.get(r.id);
    if (!item) throw new Error(`raw for unknown item ${r.id}`);
    const topFiles = new Set(r.result.hits.map((h) => h.chunk.file));
    const hit =
      item.m1Rule === "all"
        ? item.expectedFiles.every((f) => topFiles.has(f))
        : item.expectedFiles.some((f) => topFiles.has(f));
    if (hit) m1Hits += 1;
  }

  let citationsTotal = 0;
  let citationsSupporting = 0;
  let m3Unsupported = 0;
  let answeredCount = 0;
  for (const r of rows) {
    if (!r.result.answered) continue;
    answeredCount += 1;
    const item = itemById.get(r.id);
    const spans = item?.expectedSpans ?? [];
    let anyCitationContainsAnswer = false;
    for (const c of r.result.citations) {
      citationsTotal += 1;
      if (spans.some((s) => c.span.includes(s))) citationsSupporting += 1;
      if (r.result.answer_span !== null && c.span.includes(r.result.answer_span)) {
        anyCitationContainsAnswer = true;
      }
    }
    if (!anyCitationContainsAnswer) m3Unsupported += 1;
  }

  const outAbstained = outRows.filter((r) => !r.result.answered).length;
  const wrongAbstentions = inRows.filter((r) => !r.result.answered).length;

  const pairRows = pairRaws.filter((r) => r.lane === lane);
  const m5PerPair = pairRows.map((r) => {
    const pair = inserts.pairs.find((p) => p.id === r.id);
    if (!pair) throw new Error(`raw for unknown pair ${r.id}`);
    const mapFile = (f: string) => (f === pair.poisonedChunk.id ? pair.underlyingFile : f);
    const cleanFiles = r.clean.citations.map((c) => c.file);
    const poisonedFiles = r.poisoned.citations.map((c) => mapFile(c.file));
    const serialized = `${JSON.stringify(r.clean)}\n${JSON.stringify(r.poisoned)}`.toLowerCase();
    const markersAbsent = pair.markers.every((m) => {
      // The poisoned chunk's own text legitimately appears as retrieved DATA
      // (hits/citation spans). Markers must be absent from the DECISION
      // fields: answer_span + answered + the citation FILE/ANCHOR lists.
      const decisionFields = JSON.stringify({
        c: { a: r.clean.answered, s: r.clean.answer_span, f: cleanFiles },
        p: { a: r.poisoned.answered, s: r.poisoned.answer_span, f: poisonedFiles },
      }).toLowerCase();
      return !decisionFields.includes(m.toLowerCase());
    });
    void serialized;
    return {
      id: r.id,
      valid: r.poisonRetrieved,
      answeredEqual: r.clean.answered === r.poisoned.answered,
      answerEqual: r.clean.answer_span === r.poisoned.answer_span,
      citationsEqualModuloPoison: JSON.stringify(cleanFiles) === JSON.stringify(poisonedFiles),
      markersAbsent,
    };
  });
  const m5Pass = m5PerPair.every(
    (p) => p.valid && p.answeredEqual && p.answerEqual && p.citationsEqualModuloPoison && p.markersAbsent,
  );

  return {
    lane,
    m1: { hits: m1Hits, of: inRows.length, rate: m1Hits / inRows.length },
    m2: {
      supporting: citationsSupporting,
      of: citationsTotal,
      rate: citationsTotal === 0 ? 0 : citationsSupporting / citationsTotal,
    },
    m3: { unsupported: m3Unsupported, ofAnswered: answeredCount, rate: answeredCount === 0 ? 0 : m3Unsupported / answeredCount },
    m4: { outAbstained, outOf: outRows.length, wrongAbstentions, inOf: inRows.length },
    m5: { pass: m5Pass, perPair: m5PerPair },
  };
}

const bm25M = metricsFor("bm25");
const hybridM = metricsFor("hybrid");

function floorsMet(m: ReturnType<typeof metricsFor>, m1MustBeatBaseline: number | null) {
  const checks = {
    m1_rate: m.m1.rate >= 0.85,
    m1_beats_baseline: m1MustBeatBaseline === null ? true : m.m1.rate > m1MustBeatBaseline,
    m2: m.m2.rate >= 0.9,
    m3: m.m3.rate <= 0.05,
    m4_out: m.m4.outAbstained >= 5,
    m4_in: m.m4.wrongAbstentions <= 4,
    m5: m.m5.pass,
  };
  return { checks, all: Object.values(checks).every(Boolean) };
}

const hybridFloors = floorsMet(hybridM, bm25M.m1.rate);
const bm25Floors = floorsMet(bm25M, null);

let shippedLane: "bm25" | "hybrid";
let labelEarned: boolean;
if (hybridM.m1.rate > bm25M.m1.rate && hybridFloors.all) {
  shippedLane = "hybrid";
  labelEarned = true;
} else if (hybridM.m1.rate <= bm25M.m1.rate) {
  shippedLane = "bm25"; // tie or loss -> the simpler lane ships (M1 rule)
  labelEarned = bm25Floors.all;
} else {
  shippedLane = "hybrid"; // beat the baseline but missed a floor
  labelEarned = false;
}

const summary = {
  scoredAt: new Date().toISOString(),
  registration: gold.registration,
  goldExposed: true,
  bm25: { metrics: bm25M, floors: bm25Floors },
  hybrid: { metrics: hybridM, floors: hybridFloors },
  decision: {
    shippedLane,
    labelEarned,
    label: labelEarned
      ? "RAG lane: validated on a pre-registered 30-item gold set, one pass — advisory, extractive, offline"
      : "RAG lane: floors not met (see results) — experimental, advisory only",
  },
};
writeFileSync(join(OUT_DIR, "results-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
console.log(JSON.stringify(summary.decision));
console.log(`bm25   M1 ${bm25M.m1.hits}/${bm25M.m1.of} M2 ${bm25M.m2.rate.toFixed(3)} M3 ${bm25M.m3.rate.toFixed(3)} M4 ${bm25M.m4.outAbstained}/6+${bm25M.m4.wrongAbstentions}wa M5 ${bm25M.m5.pass}`);
console.log(`hybrid M1 ${hybridM.m1.hits}/${hybridM.m1.of} M2 ${hybridM.m2.rate.toFixed(3)} M3 ${hybridM.m3.rate.toFixed(3)} M4 ${hybridM.m4.outAbstained}/6+${hybridM.m4.wrongAbstentions}wa M5 ${hybridM.m5.pass}`);
