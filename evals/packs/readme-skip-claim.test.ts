import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * THE README'S SKIP CLAIM — kept true by a test, not by memory (2026-07-26).
 *
 * The honest-status table claims every skipped test is an owner-armed
 * live-network harness, off by default and skipped identically locally and in
 * CI. That claim was previously FALSE-BY-DRIFT: it documented a one-test
 * local/CI difference from a cache-gated embedding check, and the number
 * (1145/1144) was stale by ~360 tests because nothing re-derived it.
 *
 * Counts are deliberately NOT asserted here — a suite-size assertion fails on
 * every honest test addition, which trains people to update it without reading
 * it. What IS asserted is the PROPERTY the claim actually makes: that every
 * skip gate in the repo is a live-lane gate. If someone adds an
 * environment-dependent skip (a cache, a platform, an installed binary), the
 * local/CI counts diverge again and the README sentence silently stops being
 * true — that is what this catches.
 */

const ROOT = process.cwd();

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(test|spec)\.ts$/.test(full)) out.push(full);
  }
  return out;
}

describe("README skip claim — every skip is an owner-armed live lane", () => {
  const testFiles = walk(join(ROOT, "evals"));

  it("finds the test corpus (the scan is not vacuous)", () => {
    expect(testFiles.length).toBeGreaterThan(20);
  });

  it("every skipIf gate is gated on a LIVE flag, never on the environment", () => {
    const offenders: string[] = [];
    for (const file of testFiles) {
      for (const [i, line] of readFileSync(file, "utf8").split("\n").entries()) {
        if (!/\.skipIf\s*\(/.test(line)) continue;
        // The permitted shape: gated on a live-run flag the owner arms.
        if (/skipIf\s*\(\s*!\s*live\b/.test(line)) continue;
        offenders.push(`${file.replace(ROOT, "")}:${i + 1}  ${line.trim()}`);
      }
    }
    expect(
      offenders,
      `a NON-live skip gate would make local and CI counts diverge and falsify the README's ` +
        `skip claim:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });

  it("the retired embedding-hybrid lane is not silently re-gated on a model cache", () => {
    // The specific regression: the repo's only environment-dependent skip.
    const ragUnits = readFileSync(join(ROOT, "evals", "rag", "rag-lane-units.test.ts"), "utf8");
    expect(ragUnits).not.toMatch(/skipIf\s*\(\s*!\s*cachePresent/);
    expect(ragUnits).toContain("RETIRED");
  });

  it("the README states the claim in the property form, not a stale one-test-difference", () => {
    const readme = readFileSync(join(ROOT, "README.md"), "utf8");
    expect(readme).toMatch(/All 8 skips are .*skipIf\(!live\).* owner-armed live-network harnesses/);
    expect(readme, "the retired lane's evidence must still be pointed at").toContain("evals/rag/results/");
  });
});
