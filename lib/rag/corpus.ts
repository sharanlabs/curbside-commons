/**
 * E2 — corpus loader: verifies the A1 pins (HARD BLOCK on any drift), then
 * chunks the five pinned sources with the manifest-frozen parameters. The
 * ONLY way lane code obtains chunks — there is no unpinned load path.
 *
 * SNAPSHOT DECOUPLING (2026-07-12, E1b): the corpus identity is "the five
 * sources AS FROZEN AT 31bd66d". Those bytes now live as a committed
 * snapshot under `evals/rag/corpus-snapshot/<original path>` so the LIVING
 * originals (e.g. docs/GLOSSARY.md, which keeps growing per its own
 * standard) can evolve without tripping the corpus gate. The gate verifies
 * the SNAPSHOT bytes against the same A1 blob pins — tampering with the
 * snapshot still hard-blocks, and changing the corpus itself still requires
 * a NEW pre-registration. Chunk/citation paths keep the ORIGINAL logical
 * paths (gold expectedFiles and the committed raws bind to those).
 *
 * Plain: the searchable cards are cut from a sealed photocopy of the exact
 * documents the pre-registration fingerprinted; the originals may keep
 * living their lives, and nobody can quietly swap the photocopy either.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import manifest from "./corpus-manifest.json" with { type: "json" };
import { assertCorpusPins } from "./blob-hash.ts";
import { chunkFile } from "./chunker.ts";
import type { Chunk } from "./types.ts";

export { manifest as RAG_MANIFEST };

/** Where the frozen corpus bytes live (repo-relative). */
export const CORPUS_SNAPSHOT_DIR = "evals/rag/corpus-snapshot";

/** Verify pins against the snapshot, load, chunk. Throws (HARD BLOCK) on any drift. */
export function loadCorpusChunks(repoRoot: string = process.cwd()): Chunk[] {
  const snapshotRoot = join(repoRoot, CORPUS_SNAPSHOT_DIR);
  const pins = assertCorpusPins(snapshotRoot, {
    sources: manifest.sources,
    exhaustiveDir: manifest.exhaustiveDir,
  });
  const chunks: Chunk[] = [];
  for (const src of pins) {
    const text = readFileSync(join(snapshotRoot, src.path), "utf8");
    chunks.push(...chunkFile(src.path, text)); // logical path preserved
  }
  return chunks;
}
