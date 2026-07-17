import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FINDINGS_INDEX } from "@/lib/landing/specimen";

/**
 * DRIFT-LOCK (session-22, owner-named unknown ③): the landing's finding-browse
 * renders all 16 golden plain lines as PAGE COPY. Those lines derive at build
 * time from fixtures/synthetic-restaurant/expected-report.acp.json — so a
 * regenerated report golden would silently rewrite landing copy with nothing
 * failing. This lock pins the RENDERED index (index · severity · ruleId ·
 * plain line · bench marker) to a separately COMMITTED landing golden.
 *
 * If the report golden legitimately changes, this test MUST go red; the fix is
 * a human-reviewed re-commit of fixtures/landing/finding-browse.golden.json in
 * the same change — never an automatic regeneration.
 */

type GoldenRow = {
  index: number;
  severity: string;
  ruleId: string;
  plain: string;
  onBench: boolean;
};

const golden = JSON.parse(
  readFileSync(join(process.cwd(), "fixtures", "landing", "finding-browse.golden.json"), "utf8"),
) as GoldenRow[];

describe("landing finding-browse drift-lock (rendered lines == committed landing golden)", () => {
  it("pins the full derived index to the committed golden, byte-for-byte", () => {
    // Deep-equality over the SERIALIZED forms so a type drift (number vs string
    // index, casing) cannot slip through a loose comparison.
    expect(JSON.stringify(FINDINGS_INDEX, null, 2)).toBe(JSON.stringify(golden, null, 2));
  });

  it("keeps the advertised shape: 16 rows, exactly one on the bench (the price specimen)", () => {
    expect(golden).toHaveLength(16);
    const onBench = golden.filter((r) => r.onBench);
    expect(onBench).toHaveLength(1);
    expect(onBench[0]?.ruleId).toBe("LST-PRICE-CENTS-AS-DECIMAL");
  });
});
