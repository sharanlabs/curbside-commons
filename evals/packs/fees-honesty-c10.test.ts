import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * C10 honesty surface EXTENDED to the F1a fees files + goldens (plan item 10),
 * and EXTENDED AGAIN for F1b (deliverable 8) to the classifier seam + its design
 * doc:
 *  (a) no real-platform-access / "no-AI" overclaim in the fees pack, the CLI, the
 *      fixtures, or the fees README (the same affirmative-overclaim grep-gate) —
 *      `packSources()` re-reads the directory each run, so classifier.ts and
 *      classified-audit.ts are picked up automatically, no hardcoded list to miss;
 *  (b) every fees pack source carries an explicit simulated label;
 *  (c) every committed fee statement/report is labeled simulated;
 *  (d) the audit's scope is stated honestly — SIMULATED statements against REAL
 *      codified law, with the LLM classifier DEFERRED (never overclaimed);
 *  (e) F1b: the classifier seam never claims a live/earned/calibrated result, and
 *      the design doc never asserts "calibrated" below its own pre-registered floor.
 */

const root = process.cwd();
const packDir = join(root, "lib", "packs", "fees");
const feesFixtures = join(root, "fixtures", "synthetic-restaurant", "fees");
const designDoc = join(root, "docs", "plan-f1b-classifier.md");

function packSources(): string[] {
  return readdirSync(packDir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => join(packDir, f));
}
function feesFixtureFiles(): string[] {
  return readdirSync(feesFixtures)
    .filter((f) => f.endsWith(".json") || f.endsWith(".md"))
    .map((f) => join(feesFixtures, f));
}

const BANNED_CLAIMS: readonly RegExp[] = [
  /\bno AI was used\b/i,
  /\bAI built this\b/i,
  /\bbuilt (?:entirely )?by AI\b/i,
  /\breal[- ](?:time )?(?:DoorDash|Square|Uber\s?Eats|Grubhub)\s+(?:data|access|feed|account|integration|API)/i,
  /\b(?:connected|integrated) to (?:DoorDash|Square|Uber|Grubhub|the (?:live )?marketplace)\b/i,
  /\bactual (?:DoorDash|Square|marketplace|merchant) (?:data|account|orders?)\b/i,
  /\bproduction (?:merchant|platform|marketplace) data\b/i,
  /\bwe have (?:real |live )?(?:platform |marketplace )?access\b/i,
];

const scanned = [
  ...packSources(), // includes classifier.ts + classified-audit.ts (F1b) — directory scan, not a hardcoded list
  join(packDir, "cli.ts"),
  join(root, "scripts-ts", "generate-fee-fixtures.mts"),
  ...feesFixtureFiles(),
  designDoc,
];

describe("C10 fees platform-claims grep-gate", () => {
  it.each(scanned)("%s makes no real-platform-access / no-AI claim", (file) => {
    const text = readFileSync(file, "utf8");
    for (const pattern of BANNED_CLAIMS) {
      const m = text.match(pattern);
      expect(m === null, `banned claim ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
    }
  });

  it("the gate actually bites (a planted overclaim would be caught)", () => {
    const planted = "This audits real DoorDash data and no AI was used.";
    expect(BANNED_CLAIMS.some((p) => p.test(planted))).toBe(true);
  });
});

describe("C10 fees simulated labels", () => {
  it.each(["statement.ts", "generate.ts", "audit.ts", "classifier.ts", "classified-audit.ts"])(
    "lib/packs/fees/%s carries a simulated label",
    (f) => {
      expect(/simulat(ed|ion)/i.test(readFileSync(join(packDir, f), "utf8"))).toBe(true);
    },
  );

  it("every committed fee statement fixture is labeled simulated:true", () => {
    for (const name of ["statement.faithful.json", "statement.drifted.json", "statement.cured.json", "statement.conditional.json"]) {
      const s = JSON.parse(readFileSync(join(feesFixtures, name), "utf8")) as { meta: { simulated: boolean } };
      expect(s.meta.simulated, name).toBe(true);
    }
  });

  it("every golden fee report is labeled simulated:true and states the honest scope", () => {
    for (const name of ["expected-report.faithful.json", "expected-report.drifted.json"]) {
      const r = JSON.parse(readFileSync(join(feesFixtures, name), "utf8")) as {
        simulated: boolean;
        classification: string;
      };
      expect(r.simulated).toBe(true);
      expect(r.classification).toContain("DEFERRED (F1b)");
    }
  });

  it("the fees README says SIMULATED statements against REAL codified law", () => {
    const text = readFileSync(join(feesFixtures, "README.md"), "utf8");
    expect(/simulated/i.test(text)).toBe(true);
    expect(/§\s?20-563\.3|codified/i.test(text)).toBe(true);
  });
});

describe("F1b classifier-seam honesty (AM-7 / C8) — deliverable 8", () => {
  it("classifier.ts never AFFIRMATIVELY claims the baseline/mock is calibrated/earned (may explain the rule, never assert it's met)", () => {
    const text = readFileSync(join(packDir, "classifier.ts"), "utf8");
    expect(/\bis (now )?calibrated\b/i.test(text)).toBe(false);
    expect(/\bhas earned\b/i.test(text)).toBe(false);
    // The honesty rule itself IS explained (the word "calibrated" legitimately
    // appears describing what would be required) and every classifier's
    // `earnsLabel` is machine-set to false.
    expect(/\bearnsLabel:\s*false\b/.test(text)).toBe(true);
  });

  it("the design doc states the owner gate and never claims 'calibrated' below its own pre-registered floor", () => {
    const text = readFileSync(designDoc, "utf8");
    expect(/owner[- ]gate/i.test(text)).toBe(true);
    expect(/pre-registered/i.test(text)).toBe(true);
    // The doc may explain WHAT "calibrated" would require, but must not assert the
    // classifier IS calibrated anywhere (no live run has happened).
    expect(/\bis calibrated\b/i.test(text)).toBe(false);
    expect(/\bnow calibrated\b/i.test(text)).toBe(false);
  });

  it("the design doc carries the two-register (plain-English) standard", () => {
    const text = readFileSync(designDoc, "utf8");
    expect(/▸/.test(text) || /plain[- ]english/i.test(text)).toBe(true);
  });
});
