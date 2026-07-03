import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CORPUS_AS_OF,
  CORPUS_SEED,
  LISTINGS_DRIFT_CLASSES,
  applyCorpusDrift,
  buildFaithfulFeed,
  buildUcpResponse,
  generateCatalog,
  acpFeedToClaims,
  ucpResponseToClaims,
  runListingsVerification,
} from "@/lib/packs/listings";

/**
 * C6 — taxonomy coverage is MEASURED, never asserted rhetorically: the eval
 * computes (a) % of enumerated §7 classes with ≥1 corpus fixture injection and
 * (b) % actually caught by the comparator, asserts the achieved floor, and
 * prints the numbers into the test names. A guardrail scan bans "all edge
 * cases"-style overclaims from the corpus and pack sources (C6/C10).
 */

const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
const faithful = buildFaithfulFeed(sor);
const { feed: drifted, manifest } = applyCorpusDrift(faithful, sor);

// P3-1 (W1 gate advisory): the spec-version-skew class is injected at UCP fixture
// build (not by applyCorpusDrift), so DERIVE it from the committed manifest's
// ucpVersionSkew block rather than hand-adding the literal — the corpus stays the
// single source of truth for what was injected.
const driftManifestFile = JSON.parse(
  readFileSync(join(process.cwd(), "fixtures", "synthetic-restaurant", "drift-manifest.json"), "utf8"),
) as { ucpVersionSkew: { class: string } };
const injectedClasses = new Set<string>(manifest.map((e) => e.class));
injectedClasses.add(driftManifestFile.ucpVersionSkew.class);

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
const caughtClasses = new Set<string>(
  [...acpReport.findings, ...ucpReport.findings].map((f) => f.category ?? ""),
);

describe("C6 measured taxonomy coverage", () => {
  const total = LISTINGS_DRIFT_CLASSES.length;
  const injected = LISTINGS_DRIFT_CLASSES.filter((c) => injectedClasses.has(c)).length;
  const caught = LISTINGS_DRIFT_CLASSES.filter((c) => caughtClasses.has(c)).length;

  it(`fixture coverage: ${injected}/${total} enumerated classes have ≥1 injection`, () => {
    // The measured floor of THIS corpus (v1): every enumerated class is injected.
    // This is a statement about the 8 enumerated classes, not about "all edge cases".
    expect(injected).toBe(total);
  });

  it(`detection coverage: ${caught}/${total} injected classes are caught`, () => {
    expect(caught).toBe(total);
  });

  it("per-class: every enumerated class with a fixture is caught somewhere", () => {
    for (const c of LISTINGS_DRIFT_CLASSES) {
      if (!injectedClasses.has(c)) continue;
      expect(caughtClasses.has(c), `class "${c}" injected but never caught`).toBe(true);
    }
  });

  // PER-ENTRY teeth under the class summary (M1 Codex P2 reconciliation,
  // 2026-07-03): "8/8 classes caught" could in principle be satisfied by a
  // false positive in the same class while a planted row goes missed. So the
  // measured claim is grounded entry-by-entry: EVERY manifest entry must be
  // caught as (its class, anchored to ITS row) on at least one of its labeled
  // surfaces — the class tally above is the compressed summary of this.
  it("per-ENTRY: every planted manifest entry is caught by class AND row on a labeled surface", () => {
    for (const e of manifest) {
      const reports =
        e.surfaces === "both"
          ? [acpReport, ucpReport]
          : e.surfaces === "acp-only"
            ? [acpReport]
            : [ucpReport];
      const caught = reports.some((rep) =>
        rep.findings.some(
          (f) =>
            f.category === e.class &&
            (f.claim.id.startsWith(`${e.targetFeedItemId}#`) ||
              f.referenceRowId === e.targetFeedItemId),
        ),
      );
      expect(caught, `${e.id} (${e.class} @ ${e.targetFeedItemId}) not caught on its surface(s)`).toBe(true);
    }
  });
});

describe("C6/C10 overclaim guardrail", () => {
  const banned = /\ball (edge cases|drift|possible)/i;

  it("corpus README and pack sources never claim 'all edge cases'", () => {
    const files: string[] = [];
    files.push(join(process.cwd(), "fixtures", "README.md"));
    const fixturesDir = join(process.cwd(), "fixtures", "synthetic-restaurant");
    files.push(join(fixturesDir, "README.md"));
    const packDir = join(process.cwd(), "lib", "packs", "listings");
    for (const f of readdirSync(packDir)) {
      if (f.endsWith(".ts")) files.push(join(packDir, f));
    }
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(banned.test(text), `overclaim in ${file}`).toBe(false);
    }
  });
});
