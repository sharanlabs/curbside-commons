/**
 * E2 — the network-denied clean-run proof (pre-reg §3/§7.5): under the
 * net-blocker preload (every network API throws), verify the corpus pins,
 * build both lanes from the local model cache, and run one probe through
 * each. Exit 0 = the whole lane runs with zero network access. Command +
 * exit code are recorded in evals/rag/OFFLINE-PROOF.txt and the results doc.
 *
 * Run: node --import ./evals/rag/net-blocker.mjs scripts-ts/rag-offline-proof.mts
 */
import { loadCorpusChunks } from "../lib/rag/corpus.ts";
import { TransformersEmbedder } from "../lib/rag/embed-transformers.ts";
import { makeBm25Lane, makeHybridLane } from "../lib/rag/lanes.ts";

const chunks = loadCorpusChunks();
const bm25 = makeBm25Lane(chunks);
const hybrid = await makeHybridLane(chunks, new TransformersEmbedder());

const probe = "What does drift mean for a published menu?";
const b = await bm25.retrieve(probe);
const h = await hybrid.retrieve(probe);
if (b.hits.length !== 5 || h.hits.length !== 5) {
  throw new Error(`offline proof: expected 5 hits per lane, got bm25=${b.hits.length} hybrid=${h.hits.length}`);
}
console.log(
  JSON.stringify({
    ok: true,
    chunks: chunks.length,
    bm25: { answered: b.answered, signal: b.score, top: b.hits[0].chunk.id },
    hybrid: { answered: h.answered, signal: h.score, top: h.hits[0].chunk.id },
  }),
);
