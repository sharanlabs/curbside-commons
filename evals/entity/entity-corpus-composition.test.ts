/**
 * E4 — corpus COMPOSITION + DISJOINTNESS tests (pre-reg §3 + AMENDMENT A1),
 * green BEFORE the one scoring pass. Machine-checks the A1 denominator
 * minimums (≥30 SAME · ≥30 general DIFFERENT · ≥8 trap · ≥8 AMBIGUOUS in the
 * TEST split), the ≥6-per-variant-class rule, EXACTLY-ONE-label exclusivity,
 * tune/test base-merchant disjointness, and reports the label × class count
 * table (A1: "reported in the composition test's output"). Also proves the
 * corpus is generator-frozen: re-running the committed seeded generator
 * reproduces the committed bytes exactly (freeze-integrity precedent).
 *
 * Plain: before the matcher is graded, these tests prove the exam has enough
 * questions of every required kind, no question has two answer keys, the
 * practice pile and the exam pile share no businesses, and the exam file is
 * byte-identical to what the committed recipe produces.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { mkdtempSync, cpSync } from "node:fs";
import { describe, expect, it } from "vitest";

import corpusJson from "./gold/entity-pairs.json" with { type: "json" };

interface Pair {
  id: string;
  a: string;
  b: string;
  label: string;
  variantClass: string;
  trap: boolean;
  baseA: string;
  baseB: string;
}
const corpus = corpusJson as unknown as {
  tuneBases: string[];
  testBases: string[];
  tune: Pair[];
  test: Pair[];
};

const VARIANT_CLASSES = ["case-punct-ws", "legal-suffix", "typo", "unicode", "word-order-abbrev"] as const;

describe("E4 corpus composition (A1 minimums, checked BEFORE scoring)", () => {
  const test = corpus.test;
  const same = test.filter((p) => p.label === "SAME");
  const generalDiff = test.filter((p) => p.label === "DIFFERENT" && !p.trap);
  const traps = test.filter((p) => p.trap);
  const ambig = test.filter((p) => p.label === "AMBIGUOUS");

  it("A1 denominator minimums: ≥30 SAME · ≥30 general DIFFERENT · ≥8 trap · ≥8 AMBIGUOUS", () => {
    expect(same.length).toBeGreaterThanOrEqual(30);
    expect(generalDiff.length).toBeGreaterThanOrEqual(30);
    expect(traps.length).toBeGreaterThanOrEqual(8);
    expect(ambig.length).toBeGreaterThanOrEqual(8);
  });

  it("every trap is labeled DIFFERENT (a trap is a DISTINCT entity by construction)", () => {
    for (const t of traps) expect(t.label).toBe("DIFFERENT");
  });

  it("≥6 pairs per registered variant class in the test split", () => {
    for (const cls of VARIANT_CLASSES) {
      const n = test.filter((p) => p.variantClass === cls).length;
      expect(n, `class ${cls}: ${n} < 6`).toBeGreaterThanOrEqual(6);
    }
  });

  it("label exclusivity: every pair carries EXACTLY ONE valid label; ids unique; no a===b pair", () => {
    const ids = new Set<string>();
    for (const p of test.concat(corpus.tune)) {
      expect(["SAME", "DIFFERENT", "AMBIGUOUS"]).toContain(p.label);
      expect(ids.has(p.id), `duplicate id ${p.id}`).toBe(false);
      ids.add(p.id);
      expect(p.a, `${p.id}: identical strings labeled ${p.label}`).not.toBe(p.b);
    }
  });

  it("tune/test base-merchant sets are DISJOINT (no base appears in both splits)", () => {
    const tuneBases = new Set<string>(corpus.tuneBases);
    for (const b of corpus.testBases) expect(tuneBases.has(b), `base "${b}" in both splits`).toBe(false);
    for (const p of corpus.test) {
      expect(tuneBases.has(p.baseA), `test pair ${p.id} uses tune base ${p.baseA}`).toBe(false);
    }
    const testBases = new Set<string>(corpus.testBases);
    for (const p of corpus.tune) {
      expect(testBases.has(p.baseA), `tune pair ${p.id} uses test base ${p.baseA}`).toBe(false);
    }
  });

  it("reports the label × variant-class count table (A1 reporting requirement)", () => {
    const table = new Map<string, number>();
    for (const p of test) {
      const k = `${p.label}${p.trap ? "(trap)" : ""} × ${p.variantClass}`;
      table.set(k, (table.get(k) ?? 0) + 1);
    }
    console.log("E4 test-split label×class table:", Object.fromEntries([...table.entries()].sort()));
    expect(table.size).toBeGreaterThan(0);
  });

  it("all names are fictional project names (registered bases only)", () => {
    const known = new Set([...corpus.tuneBases, ...corpus.testBases]);
    for (const p of test.concat(corpus.tune)) {
      expect(known.has(p.baseA), `${p.id}: unknown base ${p.baseA}`).toBe(true);
    }
  });
});

describe("E4 corpus freeze-integrity (generator-frozen)", () => {
  it("re-running the committed seeded generator reproduces the committed bytes exactly", () => {
    const root = process.cwd();
    const work = mkdtempSync(join(tmpdir(), "e4-freeze-"));
    cpSync(join(root, "scripts-ts/generate-entity-corpus.mts"), join(work, "generate-entity-corpus.mts"));
    // The generator writes relative to cwd; run it from the temp root.
    execFileSync(process.execPath, [join(work, "generate-entity-corpus.mts")], { cwd: work, stdio: "pipe" });
    const regenerated = readFileSync(join(work, "evals/entity/gold/entity-pairs.json"), "utf8");
    const committed = readFileSync(join(root, "evals/entity/gold/entity-pairs.json"), "utf8");
    expect(regenerated).toBe(committed);
  }, 30_000);
});
