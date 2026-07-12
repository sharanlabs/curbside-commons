/**
 * E2 RAG lane — shared types (pre-registration `docs/e2-rag-preregistration.md`).
 *
 * The lane is EXTRACTIVE and ADVISORY: it retrieves committed reference text
 * and cites it; it never generates prose and never feeds the engine's verdict
 * path. Answers are verbatim spans from retrieved chunks (M3's structural
 * guarantee), citations resolve to file + anchor (citation-REQUIRED), and a
 * below-threshold top score abstains (a CORRECT outcome on out-of-corpus
 * questions, scored by M4).
 *
 * Plain: the "look it up" feature can only quote the rulebook back, with the
 * page number attached — it can't make text up, and when the rulebook doesn't
 * cover the question it says so instead of guessing.
 */

/** One indexed piece of a corpus source file. */
export interface Chunk {
  /** Stable deterministic id: `<file>#<ordinal>`. */
  readonly id: string;
  /** Repo-relative source path (one of the five pinned corpus sources). */
  readonly file: string;
  /** Human anchor: markdown heading / rule id / schema filename + pointer. */
  readonly anchor: string;
  /** The chunk's verbatim text (a contiguous substring of the source file). */
  readonly text: string;
  /** Approx-token count (whitespace words × 1.3, manifest-recorded formula). */
  readonly tokens: number;
}

/** One ranked retrieval hit. */
export interface RetrievalHit {
  readonly chunk: Chunk;
  readonly score: number;
  /** 1-based rank within the lane's top-k. */
  readonly rank: number;
}

/** A citation: file + anchor + the verbatim span the answer rests on. */
export interface Citation {
  readonly file: string;
  readonly anchor: string;
  readonly span: string;
}

/** The result envelope BOTH lanes return (grader compiles against this). */
export interface LaneResult {
  readonly lane: "bm25" | "hybrid";
  /** Top-k hits (k=5 per the frozen manifest), rank ascending. */
  readonly hits: RetrievalHit[];
  /** false = abstained ("no sufficiently supported answer"). */
  readonly answered: boolean;
  /** Verbatim span from the top cited chunk; null iff abstained. */
  readonly answer_span: string | null;
  readonly citations: Citation[];
  /** The top hit's lane score (0 when there are no hits). */
  readonly score: number;
}

/** A retrieval lane (BM25 baseline or hybrid). */
export interface RagLane {
  readonly name: "bm25" | "hybrid";
  retrieve(query: string): Promise<LaneResult>;
}
