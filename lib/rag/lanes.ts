/**
 * E2 — lane assembly: binds each index to its manifest-frozen abstention
 * threshold and the shared extractive answer layer, yielding the two
 * `RagLane`s the scoring harness (and, post-floors, the advisory tool)
 * consume.
 *
 * Plain: this is where the two finished searchers get their "when to say
 * 'no good answer'" dial installed — a dial that was locked before the exam.
 */
import { Bm25Index } from "./bm25.ts";
import manifest from "./corpus-manifest.json" with { type: "json" };
import type { Embedder } from "./embed.ts";
import { HybridIndex } from "./hybrid.ts";
import { toLaneResult } from "./retrieve.ts";
import type { Chunk, RagLane } from "./types.ts";

interface AbstentionConfig {
  readonly bm25: { readonly signal: string; readonly threshold: number };
  readonly hybrid: { readonly signal: string; readonly threshold: number };
}

function abstention(): AbstentionConfig {
  const a = (manifest as { abstention: AbstentionConfig | null }).abstention;
  if (a === null || typeof a !== "object") {
    throw new Error("E2: abstention thresholds missing from corpus-manifest.json (must be frozen pre-gold)");
  }
  return a;
}

export function makeBm25Lane(chunks: readonly Chunk[]): RagLane {
  const index = new Bm25Index(chunks);
  const threshold = abstention().bm25.threshold;
  return {
    name: "bm25",
    async retrieve(query: string) {
      const hits = index.search(query);
      return toLaneResult("bm25", hits, query, hits[0]?.score ?? 0, threshold);
    },
  };
}

export async function makeHybridLane(chunks: readonly Chunk[], embedder: Embedder): Promise<RagLane> {
  const index = await HybridIndex.build(chunks, embedder);
  const threshold = abstention().hybrid.threshold;
  return {
    name: "hybrid",
    async retrieve(query: string) {
      const { hits, topCosine } = await index.search(query);
      return toLaneResult("hybrid", hits, query, topCosine, threshold);
    },
  };
}
