/**
 * E2 — corpus loader: verifies the A1 pins (HARD BLOCK on any drift), then
 * chunks the five pinned sources with the manifest-frozen parameters. The
 * ONLY way lane code obtains chunks — there is no unpinned load path.
 *
 * Plain: the searchable cards can only ever be cut from the exact frozen
 * documents the pre-registration fingerprinted — any other input path simply
 * doesn't exist.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import manifest from "./corpus-manifest.json" with { type: "json" };
import { assertCorpusPins } from "./blob-hash.ts";
import { chunkFile } from "./chunker.ts";
import type { Chunk } from "./types.ts";

export { manifest as RAG_MANIFEST };

/** Verify pins, load, chunk. Throws (HARD BLOCK) on any corpus drift. */
export function loadCorpusChunks(repoRoot: string = process.cwd()): Chunk[] {
  const pins = assertCorpusPins(repoRoot, {
    sources: manifest.sources,
    exhaustiveDir: manifest.exhaustiveDir,
  });
  const chunks: Chunk[] = [];
  for (const src of pins) {
    const text = readFileSync(join(repoRoot, src.path), "utf8");
    chunks.push(...chunkFile(src.path, text));
  }
  return chunks;
}
