import { describe, expect, it } from "vitest";
import {
  CORPUS_AS_OF,
  CORPUS_SEED,
  applyCorpusDrift,
  buildFaithfulFeed,
  buildUcpResponse,
  generateCatalog,
  acpFeedToClaims,
  ucpResponseToClaims,
  runListingsVerification,
} from "@/lib/packs/listings";

/**
 * C3 surface-agnosticism — ONE comparator, TWO adapters: every drift injected on
 * BOTH surfaces is detected from the static ACP feed AND from the constructed
 * UCP catalog response, with the same taxonomy class against the same truth row.
 * Surface-limited classes are asserted per the manifest's surfaces label (the
 * honest reading: a surface without the field cannot drift on it), and every
 * report carries the C3 matching-mode label.
 */

const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
const faithful = buildFaithfulFeed(sor);
const { feed: drifted, manifest } = applyCorpusDrift(faithful, sor);
const acpReport = runListingsVerification(acpFeedToClaims(drifted), sor);
const ucpReport = runListingsVerification(
  ucpResponseToClaims(
    buildUcpResponse(drifted, {
      supportedVersions: ["2026-03-01-draft"],
      sessionId: "sess-sim-drifted-001",
    }),
  ),
  sor,
);

/** A finding "covers" a manifest entry when it carries the entry's class and
 * anchors to the entry's row (as claim row id or resolved reference row). */
function covers(report: typeof acpReport, entry: (typeof manifest)[number]): boolean {
  return report.findings.some(
    (f) =>
      f.category === entry.class &&
      (f.claim.id.startsWith(`${entry.targetFeedItemId}#`) ||
        f.referenceRowId === entry.targetFeedItemId ||
        // the ID-mismatch entry records the ORIGINAL id; the finding anchors the
        // resolved truth row to it while the claim carries the re-keyed id
        (entry.field === "item_id" && f.referenceRowId === entry.targetFeedItemId)),
  );
}

describe("C3: one comparator, two adapters", () => {
  const both = manifest.filter((e) => e.surfaces === "both");
  const acpOnly = manifest.filter((e) => e.surfaces === "acp-only");

  it("has a non-trivial shared drift set (differential is meaningful)", () => {
    expect(both.length).toBeGreaterThanOrEqual(8);
  });

  it.each(both.map((e) => [e.id, e] as const))(
    "%s is detected on BOTH surfaces with the same class",
    (_id, entry) => {
      expect(covers(acpReport, entry), `ACP misses ${entry.id} (${entry.class})`).toBe(true);
      expect(covers(ucpReport, entry), `UCP misses ${entry.id} (${entry.class})`).toBe(true);
    },
  );

  it.each(acpOnly.map((e) => [e.id, e] as const))(
    "%s (acp-only field) is detected on the ACP surface",
    (_id, entry) => {
      expect(covers(acpReport, entry)).toBe(true);
    },
  );

  it("ucp-only spec-version skew is detected on the UCP surface", () => {
    expect(ucpReport.findings.some((f) => f.category === "spec-version-skew")).toBe(true);
    expect(acpReport.findings.some((f) => f.category === "spec-version-skew")).toBe(false);
  });

  it("every report labels its matching mode (C3, Codex amendment 5)", () => {
    expect(acpReport.matchingMode).toBe("synthetic-controlled");
    expect(ucpReport.matchingMode).toBe("synthetic-controlled");
  });
});
