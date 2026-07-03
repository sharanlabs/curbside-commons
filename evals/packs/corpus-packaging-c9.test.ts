import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * C9 — corpus publishable/packaged (plan §4 C9, §5 W3).
 *
 * Asserts the top-level corpus index is self-contained and taxonomy-keyed across
 * BOTH fixture sets, that the `ucp-catalog-response.*` shape-honesty caveat
 * survives verbatim (un-softened), that licensing is left as an explicit owner
 * call (no LICENSE file added, "pending owner decision" stated), and that
 * packaging added documentation only — it did not add a license file to the
 * synthetic corpus dirs.
 */

const root = process.cwd();
const fixtures = join(root, "fixtures");

function norm(s: string): string {
  return s.replace(/[*>`]/g, "").replace(/\s+/g, " ").trim();
}

const indexPath = join(fixtures, "README.md");
const indexText = existsSync(indexPath) ? readFileSync(indexPath, "utf8") : "";
const indexNorm = norm(indexText);

describe("C9 corpus index — self-contained, covers both sets", () => {
  it("a top-level fixtures/README.md exists", () => {
    expect(existsSync(indexPath)).toBe(true);
  });

  it("covers BOTH fixture sets by directory", () => {
    expect(indexText).toContain("synthetic-restaurant/");
    expect(indexText).toContain("ucp-conformance-ci/");
  });

  it("documents how to regenerate from the seeded generators", () => {
    expect(indexText).toContain("npm run fixtures:wedge");
    expect(indexText).toContain("npm run fixtures:ucp");
  });

  it("documents how to run the verifier on the corpus", () => {
    expect(indexText).toContain("bin/check.mjs");
    expect(indexText).toContain("--conformance");
  });
});

describe("C9 taxonomy keying — machine-readable ground-truth keys exist for both sets", () => {
  it("synthetic-restaurant is keyed via drift-manifest.json (plan §7 classes)", () => {
    expect(existsSync(join(fixtures, "synthetic-restaurant", "drift-manifest.json"))).toBe(true);
  });
  it("ucp-conformance-ci is keyed via manifest.json (LST-CONF-* classes)", () => {
    const m = JSON.parse(
      readFileSync(join(fixtures, "ucp-conformance-ci", "manifest.json"), "utf8"),
    ) as { violationClasses: string[] };
    expect(m.violationClasses.every((c) => c.startsWith("LST-CONF-"))).toBe(true);
  });
});

describe("C9 shape-honesty caveat survives verbatim (not softened)", () => {
  const sourceNorm = norm(
    readFileSync(join(fixtures, "synthetic-restaurant", "README.md"), "utf8"),
  );
  // Distinctive contiguous phrases of the caveat — must appear, unchanged, in BOTH.
  const phrases = [
    "they are not UCP wire-shape documents and (by design, nothing planted) do not pass the W2 conformance leg against the pinned real schemas",
    "the conformance leg runs there",
  ];
  it.each(phrases)("the source README still carries: %s", (phrase) => {
    expect(sourceNorm).toContain(phrase);
  });
  it.each(phrases)("the top-level index carries it verbatim: %s", (phrase) => {
    expect(indexNorm).toContain(phrase);
  });
});

describe("C9 licensing is an explicit owner call — packaged, not published/licensed", () => {
  it("the index states the license is pending an owner decision", () => {
    expect(/license:\s*pending owner decision/i.test(indexText)).toBe(true);
  });
  it("no LICENSE file was added to the synthetic corpus dirs (owner call)", () => {
    for (const dir of ["synthetic-restaurant", "ucp-conformance-ci"]) {
      for (const name of ["LICENSE", "LICENSE.md", "LICENSE.txt"]) {
        expect(
          existsSync(join(fixtures, dir, name)),
          `unexpected ${name} in fixtures/${dir} — license is an owner call`,
        ).toBe(false);
      }
    }
  });
  it("the pinned upstream UCP schemas keep their own Apache-2.0 LICENSE (untouched)", () => {
    expect(existsSync(join(fixtures, "ucp-schemas", "2026-04-08", "LICENSE"))).toBe(true);
  });
});
