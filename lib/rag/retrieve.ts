/**
 * E2 — the extractive answer layer shared by BOTH lanes (pre-reg §1):
 *
 * - Abstention: `answered = top hit score ≥ the lane's frozen threshold`
 *   (manifest-recorded before gold access; tuned on scratch probes only).
 * - Answer: the best 1–3-sentence window of the TOP chunk by query-term
 *   overlap, extracted as a VERBATIM SUBSTRING of the chunk (offset slicing,
 *   never re-joined) — so `answer_span ⊆ citation.span` holds structurally.
 * - Citation: exactly ONE citation — the top chunk (file + anchor + its full
 *   text as the cited span). Citation-REQUIRED: an answered result always
 *   carries it.
 *
 * Plain: the feature answers by pointing at one card and reading a few
 * sentences off it, word for word — every answer arrives stapled to the card
 * it came from, and a weak match means "no good answer here" instead of a
 * guess.
 */
import { tokenize } from "./bm25.ts";
import type { LaneResult, RetrievalHit } from "./types.ts";

/** Sentence-ish segments with offsets: split at ., !, ? followed by space, and at newlines. */
function segments(text: string): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = [];
  let start = 0;
  const boundary = /[.!?](?=\s)|\n/g;
  let m: RegExpExecArray | null;
  while ((m = boundary.exec(text)) !== null) {
    const end = m.index + (m[0] === "\n" ? 0 : 1);
    if (end > start && text.slice(start, end).trim().length > 0) out.push({ start, end });
    start = m.index + m[0].length;
  }
  if (start < text.length && text.slice(start).trim().length > 0) {
    out.push({ start, end: text.length });
  }
  return out;
}

/**
 * Best 1–3-segment window by query-token overlap DENSITY (shared unique
 * tokens ÷ window unique tokens), tie-broken by absolute shared count desc,
 * then earlier, then shorter — all deterministic. Density (not raw overlap)
 * is a general injection defense decided BEFORE the scoring pass: expanding
 * a window into adjacent instruction-bearing text costs density, so planted
 * directives that merely echo query vocabulary cannot buy their way into the
 * answer span.
 */
export function bestWindow(chunkText: string, query: string): string {
  const qTokens = new Set(tokenize(query));
  const segs = segments(chunkText);
  if (segs.length === 0) return chunkText;
  let best = { density: -1, shared: -1, start: 0, end: segs[0].end, size: 4 };
  for (let i = 0; i < segs.length; i += 1) {
    for (let size = 1; size <= 3 && i + size <= segs.length; size += 1) {
      const start = segs[i].start;
      const end = segs[i + size - 1].end;
      const windowTokens = new Set(tokenize(chunkText.slice(start, end)));
      let shared = 0;
      for (const t of windowTokens) if (qTokens.has(t)) shared += 1;
      const density = windowTokens.size === 0 ? 0 : shared / windowTokens.size;
      const better =
        density > best.density ||
        (density === best.density &&
          (shared > best.shared ||
            (shared === best.shared && (start < best.start || (start === best.start && size < best.size)))));
      if (better) best = { density, shared, start, end, size };
    }
  }
  return chunkText.slice(best.start, best.end).trim();
}

/**
 * Assemble the lane result from ranked hits (both lanes call this).
 * `signalScore` is the lane's ABSTENTION SIGNAL — the top BM25 score for the
 * baseline, the top raw cosine for the hybrid (NOT its RRF fusion score,
 * which is rank-derived and carries no coverage evidence) — compared against
 * the manifest-frozen threshold. `LaneResult.score` reports this signal.
 */
export function toLaneResult(
  lane: "bm25" | "hybrid",
  hits: RetrievalHit[],
  query: string,
  signalScore: number,
  abstainThreshold: number,
): LaneResult {
  const top = hits[0];
  const answered = top !== undefined && signalScore >= abstainThreshold;
  if (!answered) {
    return { lane, hits, answered: false, answer_span: null, citations: [], score: signalScore };
  }
  const span = bestWindow(top.chunk.text, query);
  return {
    lane,
    hits,
    answered: true,
    answer_span: span,
    citations: [{ file: top.chunk.file, anchor: top.chunk.anchor, span: top.chunk.text }],
    score: signalScore,
  };
}
