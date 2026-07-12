/**
 * E2 — corpus-manifest HARD-BLOCK gate tests (pre-reg AMENDMENT A1).
 *
 * Proves: (1) the gate passes at HEAD (the corpus still hashes to the blob
 * pins frozen at 31bd66d); (2) the gate BITES — a single mutated byte, a
 * missing pinned file, and a silently-added file in the schema tree each
 * throw; (3) the manifest itself carries the frozen A2 parameters and the
 * pre-gold abstention freeze, so scoring can never run against an
 * unregistered configuration.
 *
 * Plain: these tests prove the tripwire around the frozen source documents
 * is armed — touch one byte and everything refuses to run.
 */
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { assertCorpusPins, gitBlobSha1 } from "@/lib/rag/blob-hash.ts";
import { CORPUS_SNAPSHOT_DIR } from "@/lib/rag/corpus.ts";
import manifest from "@/lib/rag/corpus-manifest.json" with { type: "json" };

const REPO = process.cwd();
const SNAPSHOT = join(REPO, CORPUS_SNAPSHOT_DIR);

describe("E2 corpus manifest gate (A1)", () => {
  it("passes at HEAD: all 82 pinned sources hash to their frozen blobs", () => {
    expect(manifest.sources.length).toBe(82);
    const verified = assertCorpusPins(SNAPSHOT, {
      sources: manifest.sources,
      exhaustiveDir: manifest.exhaustiveDir,
    });
    expect(verified.length).toBe(82);
  });

  it("recomputes real git blob hashes (spot-check against the A1 pin)", () => {
    const bytes = readFileSync(join(SNAPSHOT, "lib/packs/fees/rules.ts"));
    expect(gitBlobSha1(bytes)).toBe("bced3341bc554c34164f07b14317808dc0e327ce");
  });

  it("BITES on content drift: one mutated byte -> HARD BLOCK", () => {
    const root = mkdtempSync(join(tmpdir(), "e2-gate-"));
    mkdirSync(join(root, "lib/packs/fees"), { recursive: true });
    const original = readFileSync(join(SNAPSHOT, "lib/packs/fees/rules.ts"), "utf8");
    writeFileSync(join(root, "lib/packs/fees/rules.ts"), `${original} `); // one appended byte
    mkdirSync(join(root, "fixtures/ucp-schemas/2026-04-08/schemas"), { recursive: true });
    expect(() =>
      assertCorpusPins(root, {
        sources: [{ path: "lib/packs/fees/rules.ts", blobSha1: "bced3341bc554c34164f07b14317808dc0e327ce" }],
        exhaustiveDir: "fixtures/ucp-schemas/2026-04-08/schemas",
      }),
    ).toThrow(/HARD BLOCK: content drift/);
  });

  it("BITES on a missing pinned file", () => {
    const root = mkdtempSync(join(tmpdir(), "e2-gate-"));
    mkdirSync(join(root, "fixtures/ucp-schemas/2026-04-08/schemas"), { recursive: true });
    expect(() =>
      assertCorpusPins(root, {
        sources: [{ path: "docs/GLOSSARY.md", blobSha1: "7752b6f68bc9686e3b7a712ba807238eaeb5e6f7" }],
        exhaustiveDir: "fixtures/ucp-schemas/2026-04-08/schemas",
      }),
    ).toThrow(/HARD BLOCK: pinned source unreadable/);
  });

  it("BITES on a silent addition inside the pinned schema tree", () => {
    const root = mkdtempSync(join(tmpdir(), "e2-gate-"));
    const dir = "fixtures/ucp-schemas/2026-04-08/schemas";
    cpSync(join(SNAPSHOT, dir), join(root, dir), { recursive: true });
    writeFileSync(join(root, dir, "smuggled.json"), "{}");
    const schemaPins = manifest.sources.filter((s) => s.path.startsWith(dir));
    // Copy the four non-tree sources too so their pin checks pass first.
    for (const s of manifest.sources) {
      if (!s.path.startsWith(dir)) {
        mkdirSync(join(root, s.path, ".."), { recursive: true });
        cpSync(join(SNAPSHOT, s.path), join(root, s.path));
      }
    }
    expect(() =>
      assertCorpusPins(root, {
        sources: [...manifest.sources.filter((s) => !s.path.startsWith(dir)), ...schemaPins],
        exhaustiveDir: dir,
      }),
    ).toThrow(/HARD BLOCK: unmanifested file/);
  });
});

describe("E2 manifest freeze (A2 + pre-gold abstention)", () => {
  it("BM25 parameters are the A2 literals", () => {
    expect(manifest.bm25).toMatchObject({ variant: "Okapi", k1: 1.2, b: 0.75, topK: 5 });
    expect(manifest.bm25.tokenization).toContain("NFKC");
    expect(manifest.bm25.stemming).toBe("none");
    expect(manifest.bm25.stopwords).toBe("none");
  });

  it("hybrid fusion + embedding provenance are pinned", () => {
    expect(manifest.hybrid).toMatchObject({ fusion: "RRF", rrfK: 60, topK: 5 });
    expect(manifest.embedding).toMatchObject({
      modelId: "Xenova/all-MiniLM-L6-v2",
      license: "apache-2.0",
      dtype: "q8",
      embeddingDim: 384,
    });
    expect(manifest.embedding?.hfRevisionSha).toMatch(/^[0-9a-f]{40}$/);
    expect(manifest.embedding?.files.length).toBeGreaterThanOrEqual(4);
    for (const f of manifest.embedding?.files ?? []) {
      expect(f.sha256).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("abstention thresholds are frozen with their signals named", () => {
    expect(manifest.abstention?.bm25.threshold).toBe(10.4);
    expect(manifest.abstention?.hybrid.threshold).toBe(0.33);
    expect(manifest.abstention?.frozen).toContain("BEFORE the gold set");
  });

  it("scratch set is recorded and within the §4 budget (≤10)", () => {
    expect(manifest.scratchSet?.probes.length).toBeLessThanOrEqual(10);
    expect(manifest.scratchSet?.probes.length).toBeGreaterThan(0);
  });
});
