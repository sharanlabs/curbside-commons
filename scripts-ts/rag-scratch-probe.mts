/**
 * E2 — scratch probing (pre-reg §4 tune/test discipline): runs the ≤10
 * manifest-recorded SCRATCH probes (never gold — the gold set is disjoint and
 * is queried only in the one scoring pass) through both lanes and prints the
 * top-score distributions, which is the ONLY evidence used to freeze the
 * per-lane abstention thresholds in the manifest before gold access.
 *
 * Run (network-denied): node --import ./evals/rag/net-blocker.mjs scripts-ts/rag-scratch-probe.mts
 */
import { Bm25Index } from "../lib/rag/bm25.ts";
import { loadCorpusChunks } from "../lib/rag/corpus.ts";
import { TransformersEmbedder } from "../lib/rag/embed-transformers.ts";
import { HybridIndex } from "../lib/rag/hybrid.ts";

const SCRATCH: { q: string; kind: "in" | "out" }[] = [
  { q: "What is the maximum percentage for the fee charged when an order is delivered?", kind: "in" },
  { q: "Can the three percent processing charge be averaged over a month?", kind: "in" },
  { q: "What is the system of record and why does it matter?", kind: "in" },
  { q: "Which fields are required in a checkout object?", kind: "in" },
  { q: "What does drift mean for a published menu?", kind: "in" },
  { q: "What is the weather in New York today?", kind: "out" },
  { q: "How do I file a lawsuit against a delivery platform?", kind: "out" },
  { q: "What is the VAT rate on restaurant meals in France?", kind: "out" },
  { q: "What does the fulfillment part of the shopping spec describe?", kind: "in" },
  { q: "When did the tiered caps replace the old flat scheme?", kind: "in" },
];

const chunks = loadCorpusChunks();
console.log(`chunks: ${chunks.length}`);
const bm25 = new Bm25Index(chunks);
const hybrid = await HybridIndex.build(chunks, new TransformersEmbedder());

for (const { q, kind } of SCRATCH) {
  const b = bm25.search(q);
  const { hits: h, topCosine } = await hybrid.search(q);
  console.log(
    JSON.stringify({
      kind,
      q,
      bm25Top: b.slice(0, 3).map((x) => ({ id: x.chunk.id, s: Number(x.score.toFixed(3)) })),
      topCosine: Number(topCosine.toFixed(4)),
      hybridTop: h.slice(0, 3).map((x) => ({ id: x.chunk.id, s: Number(x.score.toFixed(5)) })),
    }),
  );
}
