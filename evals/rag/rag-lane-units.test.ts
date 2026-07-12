/**
 * E2 — index-layer unit tests: chunker determinism + bounds, BM25 hand-check
 * + frozen tie-break, the extractive answer layer's STRUCTURAL guarantees
 * (answer_span verbatim ⊆ citation.span ⊆ chunk text; abstention below the
 * frozen signal threshold; citation-REQUIRED on every answered result), and
 * hybrid determinism (cache-gated: skipped loudly when the local model cache
 * is absent — e.g. bare CI — because inference NEVER downloads).
 */
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { Bm25Index, BM25_B, BM25_K1, tokenize } from "@/lib/rag/bm25.ts";
import { approxTokens, CHUNK_HARD_CAP, chunkFile } from "@/lib/rag/chunker.ts";
import manifest from "@/lib/rag/corpus-manifest.json" with { type: "json" };
import { loadCorpusChunks } from "@/lib/rag/corpus.ts";
import { RAG_HF_CACHE_DIR, TransformersEmbedder } from "@/lib/rag/embed-transformers.ts";
import { HybridIndex } from "@/lib/rag/hybrid.ts";
import { bestWindow, toLaneResult } from "@/lib/rag/retrieve.ts";
import type { Chunk } from "@/lib/rag/types.ts";

const mkChunk = (id: string, text: string): Chunk => ({
  id,
  file: "test.md",
  anchor: "t",
  text,
  tokens: approxTokens(text),
});

describe("E2 chunker", () => {
  it("is deterministic and matches the manifest chunk count at HEAD", () => {
    const a = loadCorpusChunks();
    const b = loadCorpusChunks();
    expect(a).toEqual(b);
    expect(a.length).toBe(manifest.chunking.chunkCount);
  });

  it("keeps every chunk within the hard cap and verbatim-sourced", () => {
    for (const c of loadCorpusChunks()) {
      expect(c.tokens).toBeLessThanOrEqual(CHUNK_HARD_CAP);
      expect(c.text.trim().length).toBeGreaterThan(0);
    }
  });

  it("gives table rows their own anchors (glossary terms findable)", () => {
    const chunks = chunkFile("docs/GLOSSARY.md", "# G\n\n| Term | Def |\n| --- | --- |\n| **Drift** | divergence |\n");
    expect(chunks.some((c) => c.anchor.includes("Drift") || c.text.includes("Drift"))).toBe(true);
  });
});

describe("E2 BM25 (A2-frozen)", () => {
  it("pins k1=1.2 b=0.75 and the A2 tokenization", () => {
    expect(BM25_K1).toBe(1.2);
    expect(BM25_B).toBe(0.75);
    expect(tokenize("Fee-Cap §20-563.3 (NYC)!")).toEqual(["fee", "cap", "20", "563", "3", "nyc"]);
  });

  it("matches a hand-computed score on a two-doc index", () => {
    // Docs: d1 = "apple banana", d2 = "apple apple cherry". Query "cherry":
    // df(cherry)=1, N=2 -> idf = ln((2-1+0.5)/(1+0.5)+1) = ln(2). tf=1 in d2,
    // |d2|=3, avgLen=2.5 -> denom = 1 + 1.2*(1-0.75+0.75*3/2.5) = 2.38.
    // score = ln(2)*1*2.2/2.38 = 0.640726...
    const idx = new Bm25Index([mkChunk("d1", "apple banana"), mkChunk("d2", "apple apple cherry")]);
    const hits = idx.search("cherry");
    expect(hits[0].chunk.id).toBe("d2");
    expect(hits[0].score).toBeCloseTo((Math.log(2) * 2.2) / 2.38, 5);
  });

  it("breaks exact ties by chunk id ascending (deterministic)", () => {
    const idx = new Bm25Index([mkChunk("b", "same words here"), mkChunk("a", "same words here")]);
    const hits = idx.search("same words");
    expect(hits.map((h) => h.chunk.id)).toEqual(["a", "b"]);
  });
});

describe("E2 extractive answer layer", () => {
  const chunk = mkChunk("c1", "The delivery cap is 15%. It applies per order. Averaging is allowed monthly.");
  const hit = { chunk, score: 12, rank: 1 };

  it("answer_span is a verbatim substring of the citation span, which is the chunk text", () => {
    const r = toLaneResult("bm25", [hit], "what is the delivery cap", 12, 10.4);
    expect(r.answered).toBe(true);
    expect(r.citations.length).toBe(1);
    expect(r.citations[0].span).toBe(chunk.text);
    expect(r.answer_span).not.toBeNull();
    expect(r.citations[0].span.includes(r.answer_span ?? "")).toBe(true);
  });

  it("abstains below the frozen signal threshold, with no citations and a null span", () => {
    const r = toLaneResult("bm25", [hit], "unrelated question", 9.9, 10.4);
    expect(r.answered).toBe(false);
    expect(r.answer_span).toBeNull();
    expect(r.citations).toEqual([]);
  });

  it("bestWindow picks the overlap-maximal sentence window, verbatim", () => {
    const w = bestWindow(chunk.text, "is averaging allowed monthly");
    expect(w).toBe("Averaging is allowed monthly.");
    expect(chunk.text.includes(w)).toBe(true);
  });
});

const cachePresent = existsSync(RAG_HF_CACHE_DIR);
describe.skipIf(!cachePresent)("E2 hybrid lane (local model cache required — never downloads)", () => {
  it("produces deterministic RRF hits + a cosine abstention signal", { timeout: 120_000 }, async () => {
    const chunks = loadCorpusChunks();
    const idx = await HybridIndex.build(chunks, new TransformersEmbedder());
    const q = "What does drift mean for a published menu?";
    const a = await idx.search(q);
    const b = await idx.search(q);
    expect(a.hits.map((h) => h.chunk.id)).toEqual(b.hits.map((h) => h.chunk.id));
    expect(a.topCosine).toBe(b.topCosine);
    expect(a.hits.length).toBe(5);
    expect(a.topCosine).toBeGreaterThan(0);
    expect(a.topCosine).toBeLessThanOrEqual(1.0001);
  });
});
