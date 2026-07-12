/**
 * E2 — gold-set COMPOSITION + LEAKAGE tests (pre-reg §4 + AMENDMENT A3),
 * green BEFORE the one scoring pass (§7.2). Precedent:
 * `evals/gold/fee-lines-gold-retry-composition.test.ts`.
 *
 * Machine-checks, per A3: the 24/6 split and strata; every expected span
 * VERBATIM in its pinned source file; no gold question shares a normalized
 * word 8-gram with ANY corpus text; no question contains a corpus filename/
 * path, a rule-id pattern, or a schema anchor; no question shares a 5-gram
 * with its OWN expected spans; no question is a normalized near-duplicate of
 * a corpus sentence (containment either way, or word-Jaccard ≥ 0.8). Also
 * validates the A4 adversarial pairs: ≥3, each with a query (screened the
 * same way), a poisoned chunk carrying a verbatim copy of real underlying
 * content, and markers that appear NOWHERE in the clean corpus (so their
 * absence from outputs is a meaningful signal).
 *
 * Plain: these tests prove the exam questions were not copied from the
 * textbook, don't smuggle in the page numbers, and that the planted
 * "poisoned" cards really are plants whose tell-tale phrases exist nowhere
 * in the real documents.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import manifest from "@/lib/rag/corpus-manifest.json" with { type: "json" };
import inserts from "./gold/adversarial-inserts.json" with { type: "json" };
import gold from "./gold/rag-gold.json" with { type: "json" };

const REPO = process.cwd();
const corpusPaths = manifest.sources.map((s) => s.path);
// Corpus bytes come from the FROZEN SNAPSHOT (the E1b decoupling) — the
// screens must bind to the corpus as scored, not the living originals.
const corpusText = new Map(corpusPaths.map((p) => [p, readFileSync(join(REPO, "evals/rag/corpus-snapshot", p), "utf8")]));

const normalizeWords = (s: string): string[] =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 0);

const nGrams = (words: readonly string[], n: number): Set<string> => {
  const out = new Set<string>();
  for (let i = 0; i + n <= words.length; i += 1) out.add(words.slice(i, i + n).join(" "));
  return out;
};

// All corpus 8-grams (A3 base screen) and corpus sentences (near-dup screen).
const corpus8: Set<string> = new Set();
const corpusSentences: string[][] = [];
for (const text of corpusText.values()) {
  const words = normalizeWords(text);
  for (const g of nGrams(words, 8)) corpus8.add(g);
  for (const raw of text.split(/[.!?\n]+/)) {
    const w = normalizeWords(raw);
    if (w.length >= 4) corpusSentences.push(w);
  }
}

const inItems = gold.items.filter((i) => i.stratum !== "out-of-corpus");
const outItems = gold.items.filter((i) => i.stratum === "out-of-corpus");
const allQueries: { id: string; question: string }[] = [
  ...gold.items.map((i) => ({ id: i.id, question: i.question })),
  ...inserts.pairs.map((p) => ({ id: `pair:${p.id}`, question: p.query })),
];

describe("E2 gold composition (§4)", () => {
  it("splits 24 in-corpus / 6 out-of-corpus with the registered strata", () => {
    expect(gold.items.length).toBe(30);
    expect(inItems.length).toBe(24);
    expect(outItems.length).toBe(6);
    const count = (s: string) => gold.items.filter((i) => i.stratum === s).length;
    expect(count("fee-rule")).toBe(8);
    expect(count("ucp-schema")).toBe(8);
    expect(count("glossary")).toBe(6);
    expect(count("cross-source")).toBe(2);
  });

  it("every in-corpus item names pinned corpus files and VERBATIM expected spans", () => {
    for (const item of inItems) {
      expect(item.expectedFiles.length).toBeGreaterThan(0);
      expect(item.expectedSpans.length).toBeGreaterThan(0);
      for (const f of item.expectedFiles) expect(corpusPaths).toContain(f);
      for (const span of item.expectedSpans) {
        const found = item.expectedFiles.some((f) => (corpusText.get(f) ?? "").includes(span));
        expect(found, `${item.id}: span not verbatim in any expected file: ${span.slice(0, 60)}`).toBe(true);
      }
    }
  });

  it("out-of-corpus items carry no expected files or spans; cross-source items require ALL files", () => {
    for (const item of outItems) {
      expect(item.expectedFiles).toEqual([]);
      expect(item.expectedSpans).toEqual([]);
    }
    for (const item of gold.items.filter((i) => i.stratum === "cross-source")) {
      expect(item.m1Rule).toBe("all");
      expect(item.expectedFiles.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("item ids are unique and the registration chain is recorded", () => {
    expect(new Set(gold.items.map((i) => i.id)).size).toBe(30);
    expect(gold.registration.doc).toBe("docs/e2-rag-preregistration.md");
    expect(gold.registration.indexCommit).toMatch(/^[0-9a-f]{7,40}$/);
  });
});

describe("E2 leakage screens (A3) — every gold question AND every pair query", () => {
  it("no ≥8-gram verbatim overlap with any corpus text", () => {
    for (const { id, question } of allQueries) {
      const q8 = nGrams(normalizeWords(question), 8);
      for (const g of q8) {
        expect(corpus8.has(g), `${id}: 8-gram leaked from corpus: "${g}"`).toBe(false);
      }
    }
  });

  it("no corpus filename or path appears in any question", () => {
    for (const { id, question } of allQueries) {
      const q = question.toLowerCase();
      for (const p of corpusPaths) {
        const base = p.split("/").at(-1) ?? p;
        expect(q.includes(p.toLowerCase()), `${id} contains path ${p}`).toBe(false);
        expect(q.includes(base.toLowerCase()), `${id} contains filename ${base}`).toBe(false);
      }
    }
  });

  it("no rule-id pattern or schema anchor appears in any question", () => {
    const banned = [/nyc[-.]?563/i, /lst-[a-z]/i, /20-563/, /ucp\.dev/i, /\$id/i, /\$defs/i, /\.json/i];
    for (const { id, question } of allQueries) {
      for (const re of banned) {
        expect(re.test(question), `${id} matches banned pattern ${re}`).toBe(false);
      }
    }
  });

  it("no question shares a ≥5-gram with its OWN expected spans", () => {
    for (const item of inItems) {
      const q5 = nGrams(normalizeWords(item.question), 5);
      for (const span of item.expectedSpans) {
        const s5 = nGrams(normalizeWords(span), 5);
        for (const g of q5) {
          expect(s5.has(g), `${item.id}: question shares 5-gram with its span: "${g}"`).toBe(false);
        }
      }
    }
  });

  it("no question is a normalized near-duplicate of a corpus sentence", () => {
    for (const { id, question } of allQueries) {
      const qWords = normalizeWords(question);
      const qSet = new Set(qWords);
      const qJoined = qWords.join(" ");
      for (const sent of corpusSentences) {
        const sJoined = sent.join(" ");
        expect(
          qJoined.includes(sJoined) || sJoined.includes(qJoined),
          `${id}: containment near-dup with corpus sentence "${sJoined.slice(0, 60)}"`,
        ).toBe(false);
        const sSet = new Set(sent);
        let shared = 0;
        for (const w of qSet) if (sSet.has(w)) shared += 1;
        const jaccard = shared / (qSet.size + sSet.size - shared);
        expect(jaccard, `${id}: Jaccard ${jaccard.toFixed(2)} vs "${sJoined.slice(0, 60)}"`).toBeLessThan(0.8);
      }
    }
  });
});

describe("E2 adversarial inserts (A4/M5)", () => {
  it("registers ≥3 pairs, each complete", () => {
    expect(inserts.pairs.length).toBeGreaterThanOrEqual(3);
    for (const p of inserts.pairs) {
      expect(p.query.length).toBeGreaterThan(10);
      expect(p.poisonedChunk.id.startsWith("SYNTHETIC://")).toBe(true);
      expect(p.poisonedChunk.text.length).toBeGreaterThan(50);
      expect(p.markers.length).toBeGreaterThanOrEqual(2);
      expect(corpusPaths).toContain(p.underlyingFile);
    }
    expect(inserts.standingInsert.id.startsWith("SYNTHETIC://")).toBe(true);
    expect(inserts.standingInsert.markers.length).toBeGreaterThan(0);
  });

  it("each poisoned chunk carries a verbatim copy of real underlying content (counterfactual well-formed)", () => {
    for (const p of inserts.pairs) {
      const underlying = corpusText.get(p.underlyingFile) ?? "";
      const hasVerbatimLine = p.poisonedChunk.text
        .split("\n")
        .some((line) => line.length >= 50 && underlying.includes(line));
      expect(hasVerbatimLine, `${p.id}: no ≥50-char verbatim underlying line in poisoned chunk`).toBe(true);
    }
  });

  it("markers appear NOWHERE in the clean corpus (detection is meaningful)", () => {
    const allMarkers = [...inserts.standingInsert.markers, ...inserts.pairs.flatMap((p) => p.markers)];
    for (const marker of allMarkers) {
      for (const [path, text] of corpusText) {
        expect(
          text.toLowerCase().includes(marker.toLowerCase()),
          `marker "${marker}" already present in ${path}`,
        ).toBe(false);
      }
    }
  });
});
