import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { walkJson } from "@/lib/packs/listings/conformance";

/**
 * CONTAINMENT of the UCP schema-dir walk (security review 2026-07-21, sol
 * cross-model lead). `walkJson` recurses a schema directory; the MCP boundary
 * guard (`lib/tools/paths.ts`) realpath-contains only the TOP-LEVEL schemaDir,
 * NOT its descendants. If the walk followed symlinks, a symlink planted at a
 * descendant inside an allowed root (notably the shared OS temp dir) could
 * redirect it OUT of the contained root — reading an arbitrary directory or a
 * `.json` file anywhere the process can reach. The walk therefore must (a) NOT
 * follow symlinks (skip both symlinked dirs and symlinked `.json` files) and
 * (b) cap recursion depth. This test locks both against a stat/lstat regression.
 */
describe("walkJson containment — symlinks skipped, real files walked, depth capped", () => {
  let root: string;
  let outside: string;

  beforeAll(() => {
    // The dir under audit (stands in for an allowed-root schemaDir).
    root = mkdtempSync(join(tmpdir(), "walk-contain-in-"));
    // A separate tree the attacker wants read — OUTSIDE `root`.
    outside = mkdtempSync(join(tmpdir(), "walk-contain-out-"));
    writeFileSync(join(outside, "secret.json"), '{"secret":true}');

    // Legitimate content that MUST be collected.
    writeFileSync(join(root, "real.json"), "{}");
    mkdirSync(join(root, "sub"));
    writeFileSync(join(root, "sub", "nested.json"), "{}");

    // Attacks that MUST be skipped:
    //  - a symlinked DIRECTORY pointing outside (would leak outside/*.json)
    symlinkSync(outside, join(root, "evil-dir"));
    //  - a symlinked FILE named *.json pointing at an outside .json
    symlinkSync(join(outside, "secret.json"), join(root, "evil-link.json"));
  });

  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  });

  it("collects only the real in-root .json files, never anything reached via a symlink", () => {
    const found = walkJson(root);
    // Real files present.
    expect(found).toContain(join(root, "real.json"));
    expect(found).toContain(join(root, "sub", "nested.json"));
    // Nothing from the symlinked dir, and not the symlinked .json file itself.
    expect(found.some((p) => p.includes("secret.json"))).toBe(false);
    expect(found).not.toContain(join(root, "evil-link.json"));
    // Exactly the two legitimate files — the walk did not follow either symlink.
    expect(found).toHaveLength(2);
  });

  it("refuses a directory nested past the recursion cap (DoS guard)", () => {
    const deep = mkdtempSync(join(tmpdir(), "walk-contain-deep-"));
    let cur = deep;
    // 10 levels of real nesting — past MAX_SCHEMA_DIR_DEPTH (8).
    for (let i = 0; i < 10; i++) {
      cur = join(cur, `d${i}`);
      mkdirSync(cur);
    }
    expect(() => walkJson(deep)).toThrow(/nesting exceeds/);
    rmSync(deep, { recursive: true, force: true });
  });
});
