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
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { env, pipeline } from "@huggingface/transformers";

import manifest from "./corpus-manifest.json" with { type: "json" };
import type { Embedder } from "./embed.ts";

export const RAG_EMBEDDING_MODEL_ID = "Xenova/all-MiniLM-L6-v2";
export const RAG_HF_CACHE_DIR = join(process.cwd(), ".hf-cache");

/**
 * BATCH-D P2 #8 — provenance ENFORCED, not merely recorded. Before this, the
 * manifest pinned the model's revision and per-file SHA-256s but nothing
 * checked them: offline inference loaded whatever bytes happened to sit in the
 * cache, so "network-denied" proved only "no fetch", never "the pinned model
 * ran". This verifies every cached file against its manifest hash BEFORE the
 * pipeline is constructed, and throws (BLOCK, per pre-reg §3) on any mismatch
 * or missing file.
 *
 * Plain: we now re-fingerprint the local copy of the model every time before
 * using it — so "it ran offline" also means "it ran the exact model we wrote
 * down", not just "it didn't phone home".
 */
export function assertModelProvenance(cacheDir: string = RAG_HF_CACHE_DIR): void {
  const pinned = manifest.embedding;
  if (pinned === null || pinned === undefined) {
    throw new Error("E2 embedding BLOCK: no embedding provenance pinned in corpus-manifest.json");
  }
  for (const file of pinned.files) {
    let bytes: Buffer;
    try {
      bytes = readFileSync(join(cacheDir, file.path));
    } catch (e) {
      throw new Error(
        `E2 embedding BLOCK: pinned model file missing from the cache: ${file.path} (${String(e)}). ` +
          `Fetch it once with scripts-ts/rag-fetch-model.mts; inference never downloads.`,
      );
    }
    const actual = createHash("sha256").update(bytes).digest("hex");
    if (actual !== file.sha256) {
      throw new Error(
        `E2 embedding BLOCK: model file ${file.path} hashes to ${actual}, but the manifest pins ${file.sha256}. ` +
          `The scoring run must use the provenance-pinned model bytes.`,
      );
    }
  }
}

type FeatureExtractor = (
  texts: string | string[],
  opts: { pooling: "mean"; normalize: boolean },
) => Promise<{ data: Float32Array; dims: number[] }>;

let extractorPromise: Promise<FeatureExtractor> | undefined;

async function getExtractor(): Promise<FeatureExtractor> {
  if (extractorPromise === undefined) {
    assertModelProvenance(); // P2 #8: the pinned bytes, or nothing.
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
