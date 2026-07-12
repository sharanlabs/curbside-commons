/**
 * E2 — Okapi BM25 baseline, FROZEN per pre-registration AMENDMENT A2:
 * `k1 = 1.2`, `b = 0.75`; tokenization = NFKC → lowercase → split on
 * non-alphanumerics (empties dropped); no stemming, no stopword list;
 * `top-k = 5` for both lanes; deterministic tie-break (score desc, chunk id
 * asc). Committed BEFORE the gold set is ever queried; zero parameter or
 * preprocessing changes after gold-set access.
 *
 * Plain: the deliberately-simple word-matching search the fancier lane must
 * visibly beat — its dials were locked before the exam questions existed, so
 * nobody can quietly retune it afterward.
 */
import type { Chunk, RetrievalHit } from "./types.ts";

export const BM25_K1 = 1.2;
export const BM25_B = 0.75;
export const RAG_TOP_K = 5;

/** A2 tokenization: NFKC → lowercase → split on non-alphanumerics. */
export function tokenize(text: string): string[] {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .split(/[^a-z0-9]+/u)
    .filter((t) => t.length > 0);
}

interface IndexedDoc {
  readonly chunk: Chunk;
  readonly termFreq: ReadonlyMap<string, number>;
  readonly length: number;
}

/** Deterministic in-memory BM25 index over a chunk set. */
export class Bm25Index {
  private readonly docs: IndexedDoc[];
  private readonly docFreq: Map<string, number>;
  private readonly avgLen: number;

  constructor(chunks: readonly Chunk[]) {
    this.docs = chunks.map((chunk) => {
      const tokens = tokenize(chunk.text);
      const termFreq = new Map<string, number>();
      for (const t of tokens) {
        termFreq.set(t, (termFreq.get(t) ?? 0) + 1);
      }
      return { chunk, termFreq, length: tokens.length };
    });
    this.docFreq = new Map();
    for (const d of this.docs) {
      for (const term of d.termFreq.keys()) {
        this.docFreq.set(term, (this.docFreq.get(term) ?? 0) + 1);
      }
    }
    const total = this.docs.reduce((s, d) => s + d.length, 0);
    this.avgLen = this.docs.length > 0 ? total / this.docs.length : 0;
  }

  /** BM25 score of one document for a token list (standard Robertson idf, floored at 0). */
  private score(doc: IndexedDoc, queryTokens: readonly string[]): number {
    const N = this.docs.length;
    let s = 0;
    for (const q of queryTokens) {
      const tf = doc.termFreq.get(q) ?? 0;
      if (tf === 0) continue;
      const df = this.docFreq.get(q) ?? 0;
      const idf = Math.max(0, Math.log((N - df + 0.5) / (df + 0.5) + 1));
      s += (idf * tf * (BM25_K1 + 1)) / (tf + BM25_K1 * (1 - BM25_B + (BM25_B * doc.length) / this.avgLen));
    }
    return s;
  }

  /** Full deterministic ranking (every chunk, score desc then chunk.id asc). */
  rankAll(query: string): RetrievalHit[] {
    const qTokens = tokenize(query);
    return this.docs
      .map((d) => ({ chunk: d.chunk, score: this.score(d, qTokens) }))
      .sort((a, b) => b.score - a.score || (a.chunk.id < b.chunk.id ? -1 : 1))
      .map((h, i) => ({ ...h, rank: i + 1 }));
  }

  /** Top-k hits (k = RAG_TOP_K). */
  search(query: string): RetrievalHit[] {
    return this.rankAll(query).slice(0, RAG_TOP_K);
  }
}
