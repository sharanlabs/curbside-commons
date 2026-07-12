/**
 * E2 — embedder seam. The interface keeps the transformers-backed
 * implementation OUT of every deterministic import graph: only the scoring
 * harness and the hybrid lane construction inject a real `Embedder`; nothing
 * under `lib/tools/**` imports one (registry import-graph proof unchanged).
 *
 * Plain: the "meaning-similarity" engine plugs in from the outside, so the
 * checker's own wiring never depends on it.
 */

export interface Embedder {
  /** Embed texts to L2-normalized vectors (deterministic for fixed model+input). */
  embed(texts: readonly string[]): Promise<Float32Array[]>;
}

/** Cosine similarity (inputs are L2-normalized, so this is the dot product). */
export function cosine(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error(`cosine: dimension mismatch ${a.length} vs ${b.length}`);
  }
  let s = 0;
  for (let i = 0; i < a.length; i += 1) s += a[i] * b[i];
  return s;
}
