/**
 * Git blob-hash utility + the E2 corpus-manifest HARD-BLOCK gate
 * (pre-registration AMENDMENT A1).
 *
 * The corpus is pinned to exact git blob hashes at `31bd66d`. This gate
 * recomputes each file's blob sha1 IN PURE TS from bytes — `sha1("blob " +
 * byteLength + "\0" + bytes)` (git's object encoding) — so the check needs no
 * git subprocess and runs identically in CI. Any mismatch, missing file, or
 * unmanifested file inside the schema tree is a HARD BLOCK: the thrown error
 * stops both the vitest gate and the scoring harness (which calls this before
 * touching the index).
 *
 * Plain: before the lookup feature is allowed to run, it re-fingerprints every
 * source document and compares against the fingerprints frozen in the
 * pre-registration — if even one byte moved, everything stops loudly.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** git blob sha1 of a byte buffer (git object encoding). */
export function gitBlobSha1(bytes: Buffer): string {
  const header = Buffer.from(`blob ${bytes.byteLength}\0`, "utf8");
  return createHash("sha1").update(Buffer.concat([header, bytes])).digest("hex");
}

export interface CorpusSourcePin {
  /** Repo-relative path. */
  readonly path: string;
  /** Full git blob sha1 the file must hash to. */
  readonly blobSha1: string;
}

export interface CorpusManifestPins {
  /** Every pinned corpus file (schema tree expanded per-file). */
  readonly sources: readonly CorpusSourcePin[];
  /** Directory whose ENTIRE recursive file set must equal its manifest subset. */
  readonly exhaustiveDir: string;
}

/** Recursively list files under a directory (repo-relative paths). */
function walkFiles(root: string, dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((name) => {
    const rel = `${dir}/${name}`;
    return statSync(join(root, rel)).isDirectory() ? walkFiles(root, rel) : [rel];
  });
}

/**
 * The A1 gate. Throws (HARD BLOCK) on: a pinned file whose recomputed blob
 * sha1 differs, a pinned file that cannot be read, or a file present under
 * `exhaustiveDir` that is not in the manifest (silent additions count as
 * drift too). Returns the verified pin list on success.
 */
export function assertCorpusPins(repoRoot: string, pins: CorpusManifestPins): readonly CorpusSourcePin[] {
  for (const src of pins.sources) {
    let bytes: Buffer;
    try {
      bytes = readFileSync(join(repoRoot, src.path));
    } catch (e) {
      throw new Error(`E2 corpus HARD BLOCK: pinned source unreadable: ${src.path} (${String(e)})`);
    }
    const actual = gitBlobSha1(bytes);
    if (actual !== src.blobSha1) {
      throw new Error(
        `E2 corpus HARD BLOCK: content drift in ${src.path} — manifest pins ${src.blobSha1}, bytes hash to ${actual}. ` +
          `Changing the corpus requires a NEW pre-registration (docs/e2-rag-preregistration.md A1).`,
      );
    }
  }
  const manifested = new Set(pins.sources.map((s) => s.path));
  for (const found of walkFiles(repoRoot, pins.exhaustiveDir)) {
    if (!manifested.has(found)) {
      throw new Error(
        `E2 corpus HARD BLOCK: unmanifested file in the pinned schema tree: ${found} — additions are drift (A1).`,
      );
    }
  }
  return pins.sources;
}
