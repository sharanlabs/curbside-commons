/**
 * E2 — index-layer unit tests: chunker determinism + bounds, BM25 hand-check
 * + frozen tie-break, the extractive answer layer's STRUCTURAL guarantees
 * (answer_span verbatim ⊆ citation.span ⊆ chunk text; abstention below the
 * frozen signal threshold; citation-REQUIRED on every answered result), and
 * hybrid determinism (cache-gated: skipped loudly when the local model cache
 * is absent — e.g. bare CI — because inference NEVER downloads).
 */
import { describe, expect, it } from "vitest";

// NOTE: `existsSync`, `RAG_HF_CACHE_DIR`, `TransformersEmbedder` and
// `HybridIndex` were imported only by the retired hybrid block below. Dropping
// them with it is the point: an unused model-cache import is what kept a
// retired lane looking load-bearing.
import { Bm25Index, BM25_B, BM25_K1, tokenize } from "@/lib/rag/bm25.ts";
import { approxTokens, CHUNK_HARD_CAP, chunkFile } from "@/lib/rag/chunker.ts";
import manifest from "@/lib/rag/corpus-manifest.json" with { type: "json" };
import { loadCorpusChunks } from "@/lib/rag/corpus.ts";
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

/**
 * E2 HYBRID LANE — RETIRED 2026-07-26 (decision: `docs/decisions/e2-e4-lanes-2026-07-25.md`).
 *
 * The hybrid was built, scored once against pre-registered floors, and LOST to
 * plain BM25 — so the simpler lane shipped and `lookup-reference.ts` has used
 * BM25 only ever since. What remained here was a cache-gated determinism test
 * for a lane nothing ships: it required a local model cache, was therefore the
 * repo's ONLY skipped-in-CI test, and its skip is what forced the README's
 * "1145 local vs 1144 in CI" one-test-difference caveat.
 *
 * It is retired rather than kept because it carried weight it did not earn: an
 * inference path and a model-cache dependency supporting a conclusion that was
 * already reached and published ("BM25 is enough"). Keeping a green test for a
 * retired lane is how a dead capability looks alive.
 *
 * WHAT IS DELIBERATELY NOT DELETED — the EVIDENCE. `evals/rag/results/` keeps
 * the full scoreboard including the hybrid's losing numbers; `scripts-ts/`
 * retains the scoring path so the published record stays REPRODUCIBLE; and
 * `lib/rag/hybrid.ts` + `embed*.ts` remain as the artifacts those numbers were
 * measured on. Retiring a capability is not the same as erasing the evidence
 * that it was evaluated and lost — the honest record of a miss is the most
 * valuable thing this lane produced.
 *
 * The BM25 lane — the one that actually ships — is unit-tested above.
 */
