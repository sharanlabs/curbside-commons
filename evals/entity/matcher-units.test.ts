/**
 * E4 — matcher unit tests: the A2 baseline chain EXACT (each stage + the
 * enumerated suffix list), similarity-primitive sanity (hand-checked
 * Jaro-Winkler + Soundex values), matcher invariants (T ordering enforced,
 * advisory flag + scope label always present), and the ADVISORY-NEVER-GATING
 * structural proof: no engine/tool/crew/mcp module imports lib/entity.
 */
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";

import { E4_SCOPE_LABEL, ensembleScore, proposeMatch } from "@/lib/entity/matcher.ts";
import { baselineNormalize, baselineVerdict } from "@/lib/entity/normalize.ts";
import { jaroWinkler, soundex, tokenSetRatio } from "@/lib/entity/similarity.ts";

describe("E4 baseline normalization (A2 chain, frozen)", () => {
  it("applies NFKC → casefold → collapse ws → strip punct → strip suffix tokens, in that order", () => {
    expect(baselineNormalize("  FOG   CITY  TACOS  ")).toBe("fog city tacos");
    expect(baselineNormalize("Maria's Tacos, LLC")).toBe("marias tacos");
    expect(baselineNormalize("Fog City Tacos d.b.a.")).toBe("fog city tacos");
    expect(baselineNormalize("Fresh Market Co")).toBe("fresh market");
    expect(baselineNormalize("Golden Dragon Inc")).toBe("golden dragon");
    expect(baselineNormalize("Pizza Palace Ltd")).toBe("pizza palace");
    expect(baselineNormalize("Urban Grocery Corp")).toBe("urban grocery");
  });

  it("strips stacked trailing suffixes but never strips the whole name", () => {
    expect(baselineNormalize("Quick Mart Co LLC")).toBe("quick mart");
    expect(baselineNormalize("LLC")).toBe("llc"); // single token survives
  });

  it("normalizes NBSP/width variants via NFKC + whitespace collapse", () => {
    expect(baselineNormalize("Fog City Tacos")).toBe("fog city tacos");
    expect(baselineVerdict("FOG CITY TACOS LLC", "Fog City Tacos")).toBe("SAME");
    expect(baselineVerdict("Fog City Tacos", "Fog City Taqueria")).toBe("DIFFERENT");
  });
});

describe("E4 similarity primitives", () => {
  it("Jaro-Winkler: identity = 1, hand-checked MARTHA/MARHTA ≈ 0.9611", () => {
    expect(jaroWinkler("abc", "abc")).toBe(1);
    expect(jaroWinkler("martha", "marhta")).toBeCloseTo(0.9611, 3);
    expect(jaroWinkler("abc", "xyz")).toBe(0);
  });

  it("token-set ratio: shared-word overlap", () => {
    expect(tokenSetRatio("fog city tacos", "fog city taqueria")).toBeCloseTo(2 * 2 / 6, 5);
    expect(tokenSetRatio("a b", "a b")).toBe(1);
  });

  it("Soundex: classic reference codes", () => {
    expect(soundex("Robert")).toBe("R163");
    expect(soundex("Rupert")).toBe("R163");
    expect(soundex("Tymczak")).toBe("T522");
    expect(soundex("Honeyman")).toBe("H555");
  });
});

describe("E4 matcher invariants", () => {
  it("enforces T_match > T_abstain loudly", () => {
    expect(() => proposeMatch("a", "b", 0.5, 0.5)).toThrow(/strictly greater/);
  });

  it("every result is advisory with the registered scope label", () => {
    const r = proposeMatch("Fog City Tacos", "FOG CITY TACOS", 0.999, 0.849);
    expect(r.advisory).toBe(true);
    expect(r.scopeLabel).toBe(E4_SCOPE_LABEL);
    // batch-D P2 #10c: the label must NOT say "validated" (the floors were missed)
    // and must carry the registered floors-not-met wording + the protected default.
    expect(r.scopeLabel).toContain("floors not met");
    expect(r.scopeLabel.toLowerCase()).not.toContain("validated");
    expect(r.scopeLabel).toContain("exact matching remains the system default");
    expect(r.verdict).toBe("SAME"); // normalized-equal scores 1.0
    expect(ensembleScore("Fog City Tacos", "FOG CITY TACOS")).toBeCloseTo(1.0, 6);
  });

  it("the ambiguity band abstains", () => {
    const r = proposeMatch("Bella Italia", "Bella Italia Catering", 0.999, 0.4);
    expect(r.verdict).toBe("ABSTAIN");
  });
});

describe("E4 advisory-never-gating structural proof", () => {
  it("no engine/tool/crew/mcp/app module imports lib/entity (the lane cannot gate anything)", () => {
    const out = execSync(
      `grep -rl "lib/entity\\|entity/matcher\\|entity/normalize" lib/packs lib/verifier-core lib/tools lib/mcp lib/crew lib/delivery app 2>/dev/null || true`,
      { cwd: process.cwd(), encoding: "utf8" },
    ).trim();
    expect(out, `engine-side files importing lib/entity:\n${out}`).toBe("");
  });
});
