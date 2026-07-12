/**
 * E2 — the @huggingface/transformers embedder (pre-reg §3). Local, $0,
 * offline-at-inference: `allowRemoteModels` is pinned FALSE here, the cache
 * dir is the repo-local gitignored `.hf-cache/`, and the scoring run executes
 * under the net-blocker preload — if the model is not already cached this
 * module throws rather than fetching (pre-reg: "E2 BLOCKS rather than
 * fetching at runtime"). Provenance (model id, HF revision, per-file SHA-256,
 * license, dtype) is recorded in `lib/rag/corpus-manifest.json`.
 *
 * Plain: the meaning-matcher runs from a sealed local copy of the model — if
 * the copy isn't there it refuses to run; it never phones home.
 */
import { join } from "node:path";

import { env, pipeline } from "@huggingface/transformers";

import type { Embedder } from "./embed.ts";

export const RAG_EMBEDDING_MODEL_ID = "Xenova/all-MiniLM-L6-v2";
export const RAG_HF_CACHE_DIR = join(process.cwd(), ".hf-cache");

type FeatureExtractor = (
  texts: string | string[],
  opts: { pooling: "mean"; normalize: boolean },
) => Promise<{ data: Float32Array; dims: number[] }>;

let extractorPromise: Promise<FeatureExtractor> | undefined;

async function getExtractor(): Promise<FeatureExtractor> {
  if (extractorPromise === undefined) {
    env.cacheDir = RAG_HF_CACHE_DIR;
    env.allowRemoteModels = false; // NEVER download at inference time.
    extractorPromise = pipeline("feature-extraction", RAG_EMBEDDING_MODEL_ID, {
      dtype: "q8",
    }) as unknown as Promise<FeatureExtractor>;
  }
  return extractorPromise;
}

/** The transformers-backed embedder (mean pooling + L2 normalize). */
export class TransformersEmbedder implements Embedder {
  async embed(texts: readonly string[]): Promise<Float32Array[]> {
    const extractor = await getExtractor();
    const out: Float32Array[] = [];
    for (const text of texts) {
      const res = await extractor(text, { pooling: "mean", normalize: true });
      out.push(new Float32Array(res.data));
    }
    return out;
  }
}
