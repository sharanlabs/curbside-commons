import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * C10 honesty surface EXTENDED to the F1a fees files + goldens (plan item 10):
 *  (a) no real-platform-access / "no-AI" overclaim in the fees pack, the CLI, the
 *      fixtures, or the fees README (the same affirmative-overclaim grep-gate);
 *  (b) every fees pack source carries an explicit simulated label;
 *  (c) every committed fee statement/report is labeled simulated;
 *  (d) the audit's scope is stated honestly — SIMULATED statements against REAL
 *      codified law, with the LLM classifier DEFERRED (never overclaimed).
 */

const root = process.cwd();
const packDir = join(root, "lib", "packs", "fees");
const feesFixtures = join(root, "fixtures", "synthetic-restaurant", "fees");

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
  ...packSources(),
  join(packDir, "cli.ts"),
  join(root, "scripts-ts", "generate-fee-fixtures.mts"),
  ...feesFixtureFiles(),
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
  it.each(["statement.ts", "generate.ts", "audit.ts"])("lib/packs/fees/%s carries a simulated label", (f) => {
    expect(/simulat(ed|ion)/i.test(readFileSync(join(packDir, f), "utf8"))).toBe(true);
  });

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
