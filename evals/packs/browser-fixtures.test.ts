/**
 * Browser-fixtures de-jargon guard (reconcile 2026-07-14, folded acceptance-gate
 * finding). The /playground page imports these projections into a CLIENT module,
 * so any lab-label in them ships in the JS chunks. This test proves the generated
 * browser projections (scripts-ts/generate-browser-fixtures.mts) carry no dev-jargon
 * — with ONE documented exception: the ghost item's title is a claim value the
 * frozen golden quotes verbatim, so it stays and is reworded at the display layer.
 *
 * Byte-equality of the report the browser computes is proven separately by
 * evals/packs/playground-golden.test.ts (the projections copy every engine-read
 * field verbatim, so the golden holds).
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(__dirname, "..", "..");
const browserDir = join(root, "fixtures", "synthetic-restaurant", "browser");
const catalogWeb = readFileSync(join(browserDir, "sor.catalog.web.json"), "utf8");
const feedWeb = readFileSync(join(browserDir, "acp-feed.web.json"), "utf8");

describe("browser fixtures are jargon-stripped (client-bundle de-jargon)", () => {
  // Lab-labels that must never ship in the client bundle via these projections.
  const JARGON: readonly RegExp[] = [
    /synthetic/i,
    /\bcorpus\b/i,
    /Test Kitchen/i,
    /"generator"/i,
    /DataSF/i,
  ];

  it("the browser catalog carries no dev-jargon at all", () => {
    for (const re of JARGON) {
      expect(re.test(catalogWeb), `browser catalog should not contain ${re}`).toBe(false);
    }
    expect(/simulated/i.test(catalogWeb), "browser catalog must carry no 'simulated'").toBe(false);
  });

  it("the browser feed carries no dev-jargon at all", () => {
    // freeze-reversal 2026-07-20: the ghost item's title was renamed from
    // "Phantom Platter (simulated ghost item)" to the clean "Phantom Platter", so the old
    // one-'simulated'-exception is obsolete — the feed now carries NO dev-jargon at all.
    // Strengthened: no /simulated|synthetic/i anywhere in the projection.
    for (const re of JARGON) {
      expect(re.test(feedWeb), `browser feed should not contain ${re}`).toBe(false);
    }
    expect(/simulated/i.test(feedWeb), "browser feed must carry no 'simulated'").toBe(false);
    expect(/synthetic/i.test(feedWeb), "browser feed must carry no 'synthetic'").toBe(false);
    // the clean ghost title survives as the claim value the frozen golden quotes.
    expect(feedWeb).toContain('"title": "Phantom Platter"');
  });
});
