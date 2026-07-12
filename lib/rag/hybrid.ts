/**
 * E2 — hybrid lane: Reciprocal Rank Fusion (RRF, k = 60 — frozen in the
 * manifest) over the BM25 ranking and the cosine-similarity ranking of the
 * SAME chunk set (identical chunking, per AMENDMENT A2). Chunk embeddings are
 * computed once per index build; the query embeds at retrieve time (offline,
 * cached model). Top-k = 5, tie-break (score desc, chunk id asc) — identical
 * discipline to the baseline.
 *
 * Plain: two searchers rank every card — one matching words, one matching
 * meaning — and the fused list rewards cards both searchers rank highly.
 */
import { Bm25Index, RAG_TOP_K } from "./bm25.ts";
import { cosine, type Embedder } from "./embed.ts";
import type { Chunk, RetrievalHit } from "./types.ts";

export const RRF_K = 60;

export class HybridIndex {
  private readonly bm25: Bm25Index;
  private readonly chunks: readonly Chunk[];
  private readonly vectors: readonly Float32Array[];
  private readonly embedder: Embedder;

  private constructor(bm25: Bm25Index, chunks: readonly Chunk[], vectors: readonly Float32Array[], embedder: Embedder) {
    this.bm25 = bm25;
    this.chunks = chunks;
    this.vectors = vectors;
    this.embedder = embedder;
  }

  static async build(chunks: readonly Chunk[], embedder: Embedder): Promise<HybridIndex> {
    const vectors = await embedder.embed(chunks.map((c) => c.text));
    return new HybridIndex(new Bm25Index(chunks), chunks, vectors, embedder);
  }

  /**
   * Top-k RRF hits plus the ABSTENTION SIGNAL: the best raw cosine similarity
   * over all chunks. RRF scores are rank-derived (the top fused hit scores
   * ~1/(k+1) regardless of relevance), so they carry no evidence the corpus
   * actually covers the query — the cosine maximum does (manifest-recorded
   * design, frozen pre-gold).
   */
  async search(query: string): Promise<{ hits: RetrievalHit[]; topCosine: number }> {
    const [qVec] = await this.embedder.embed([query]);
    const cosineRanked = this.chunks
      .map((chunk, i) => ({ chunk, score: cosine(qVec, this.vectors[i]) }))
      .sort((a, b) => b.score - a.score || (a.chunk.id < b.chunk.id ? -1 : 1));
    const bm25Ranked = this.bm25.rankAll(query);

    const rrf = new Map<string, { chunk: Chunk; score: number }>();
    const add = (id: string, chunk: Chunk, rank: number) => {
      const prev = rrf.get(id) ?? { chunk, score: 0 };
      rrf.set(id, { chunk, score: prev.score + 1 / (RRF_K + rank) });
    };
    bm25Ranked.forEach((h) => add(h.chunk.id, h.chunk, h.rank));
    cosineRanked.forEach((h, i) => add(h.chunk.id, h.chunk, i + 1));

    const hits = [...rrf.values()]
      .sort((a, b) => b.score - a.score || (a.chunk.id < b.chunk.id ? -1 : 1))
      .slice(0, RAG_TOP_K)
      .map((h, i) => ({ chunk: h.chunk, score: h.score, rank: i + 1 }));
    return { hits, topCosine: cosineRanked[0]?.score ?? 0 };
  }
}
