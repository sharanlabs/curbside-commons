import { describe, expect, it } from "vitest";
import { getReplaySnapshot } from "@/legacy/activation/lib/replay/run";
import { dejargon } from "@/lib/legacy/display";

/**
 * Phase-F batch findings #1/#2 (2026-07-15): the preserved legacy module's diagnosis
 * prose reaches the web pages only through the display-layer de-jargon. The e2e leg
 * checks one rendered merchant; this pack walks EVERY replay merchant's rendered
 * diagnosis fields (exactly the fields the merchant page passes through dejargon,
 * plus the console's blocker code) and asserts no vendor/agency name or internal
 * run-mode token survives the mapping. The engine's own records keep their exact
 * internal vocabulary — only the display layer is under test.
 */

const BANNED_ON_PAGE = [/\bstripe\b/i, /\bIRS\b/, /\bDataSF\b/i, /\bGemini\b/i, /\bGroq\b/i];

describe("legacy display de-jargon covers every rendered diagnosis field", () => {
  const snap = getReplaySnapshot();

  it("has merchants to check", () => {
    expect(snap.merchants.length).toBeGreaterThan(0);
  });

  for (const rm of getReplaySnapshot().merchants) {
    it(`merchant ${rm.merchant.merchant_id}: diagnosis prose + blocker code are clean`, () => {
      const rendered = [
        dejargon(rm.diagnosis.root_cause_hypothesis),
        dejargon(rm.diagnosis.play.action),
        dejargon(rm.diagnosis.play.rationale),
        dejargon(rm.diagnosis.caveat),
        dejargon(rm.merchant.current_blocker_code.replace(/_/g, " ")),
      ];
      for (const text of rendered) {
        for (const banned of BANNED_ON_PAGE) {
          expect(text, `"${text}" should not match ${banned}`).not.toMatch(banned);
        }
      }
    });
  }
});
