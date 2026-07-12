/**
 * E2 RAG — ONE-TIME model fetch (the only network-allowed step in the lane).
 *
 * Downloads the pinned embedding model into the repo-local, gitignored
 * `.hf-cache/` directory and prints the provenance block (model id, HF
 * revision SHA, per-file SHA-256) that `evals/rag/corpus-manifest.json`
 * records. Inference NEVER downloads: `lib/rag/embed-transformers.ts` sets
 * `allowRemoteModels = false`, and the scoring run executes under the
 * net-blocker preload (`evals/rag/net-blocker.mjs`).
 *
 * Run: node scripts-ts/rag-fetch-model.mts
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { env, pipeline } from "@huggingface/transformers";

import { RAG_EMBEDDING_MODEL_ID, RAG_HF_CACHE_DIR } from "../lib/rag/embed-transformers.ts";

env.cacheDir = RAG_HF_CACHE_DIR;
env.allowRemoteModels = true; // THIS SCRIPT ONLY — inference paths pin this false.

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// Resolve the model's current revision SHA from the HF API so the manifest can
// pin it (Transformers.js resolves "main" internally; we record what it was).
const apiRes = await fetch(`https://huggingface.co/api/models/${RAG_EMBEDDING_MODEL_ID}`);
if (!apiRes.ok) {
  throw new Error(`HF API lookup failed: HTTP ${apiRes.status}`);
}
const apiJson = (await apiRes.json()) as { sha?: string; cardData?: { license?: string } };

const extractor = await pipeline("feature-extraction", RAG_EMBEDDING_MODEL_ID, { dtype: "q8" });
const probe = await extractor("model fetch probe", { pooling: "mean", normalize: true });
if (!(probe.data instanceof Float32Array) || probe.data.length === 0) {
  throw new Error("probe embedding failed after download");
}

const files = walk(RAG_HF_CACHE_DIR)
  .map((p) => ({
    path: relative(RAG_HF_CACHE_DIR, p),
    sha256: createHash("sha256").update(readFileSync(p)).digest("hex"),
  }))
  .sort((a, b) => (a.path < b.path ? -1 : 1));

console.log(
  JSON.stringify(
    {
      modelId: RAG_EMBEDDING_MODEL_ID,
      hfRevisionSha: apiJson.sha ?? "UNRESOLVED",
      license: apiJson.cardData?.license ?? "apache-2.0",
      dtype: "q8",
      embeddingDim: probe.data.length,
      cacheDir: ".hf-cache/",
      files,
    },
    null,
    2,
  ),
);
