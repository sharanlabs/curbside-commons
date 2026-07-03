import { readFileSync } from "node:fs";
import { join } from "node:path";
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
  UCP_PINNED_VERSION,
} from "@/lib/packs/listings";
import { serializeReport } from "@/lib/verifier-core";

/**
 * Wedge integration — freeze-integrity (the committed corpus IS the generator's
 * output at the pinned seed), the faithful-copy zero-findings baseline, and the
 * golden drifted reports (byte-compared; stable ordering makes this exact).
 */

const dir = join(process.cwd(), "fixtures", "synthetic-restaurant");
const readFixture = (name: string): string => readFileSync(join(dir, name), "utf8");
const asJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
const faithful = buildFaithfulFeed(sor);
const bundle = applyCorpusDrift(faithful, sor);

describe("corpus freeze-integrity (seeded generator, plan §8)", () => {
  it("sor.catalog.json is exactly generateCatalog(pinned seed)", () => {
    expect(readFixture("sor.catalog.json")).toBe(asJson(sor));
  });

  it("acp-feed.faithful.json is exactly buildFaithfulFeed(sor)", () => {
    expect(readFixture("acp-feed.faithful.json")).toBe(asJson(faithful));
  });

  it("acp-feed.drifted.json + manifest are exactly applyCorpusDrift(...)", () => {
    expect(readFixture("acp-feed.drifted.json")).toBe(asJson(bundle.feed));
    const manifest = JSON.parse(readFixture("drift-manifest.json")) as {
      entries: unknown;
      seed: number;
    };
    expect(manifest.seed).toBe(CORPUS_SEED);
    expect(asJson(manifest.entries)).toBe(asJson(bundle.manifest));
  });

  it("generator is deterministic: same seed twice → identical catalogs", () => {
    expect(asJson(generateCatalog(CORPUS_SEED, CORPUS_AS_OF))).toBe(asJson(sor));
  });

  // Gate route-back P2-1 (gate-2026-07-03-w1-wedge): the UCP fixtures and the
  // manifest's ucpVersionSkew block are byte-locked too — the corpus README's
  // "no hand-tampering without CI catching it" claim must hold for EVERY
  // committed fixture file, not just the ACP set.
  it("ucp-catalog-response.{faithful,drifted}.json are exactly buildUcpResponse(...) at the pinned params", () => {
    const ucpFaithful = buildUcpResponse(faithful, {
      supportedVersions: [UCP_PINNED_VERSION],
      sessionId: "sess-sim-faithful-001",
    });
    const ucpDrifted = buildUcpResponse(bundle.feed, {
      supportedVersions: ["2026-03-01-draft"],
      sessionId: "sess-sim-drifted-001",
    });
    expect(readFixture("ucp-catalog-response.faithful.json")).toBe(asJson(ucpFaithful));
    expect(readFixture("ucp-catalog-response.drifted.json")).toBe(asJson(ucpDrifted));
  });

  it("drift-manifest.json ucpVersionSkew block matches the pinned skew exactly", () => {
    const manifest = JSON.parse(readFixture("drift-manifest.json")) as {
      simulated: boolean;
      asOf: string;
      ucpVersionSkew: unknown;
    };
    expect(manifest.simulated).toBe(true);
    expect(manifest.asOf).toBe(CORPUS_AS_OF);
    expect(manifest.ucpVersionSkew).toEqual({
      class: "spec-version-skew",
      surfaces: "ucp-only",
      pinned: UCP_PINNED_VERSION,
      served: ["2026-03-01-draft"],
    });
  });
});

describe("faithful copies produce ZERO findings (both surfaces)", () => {
  it("acp: faithful feed is clean", () => {
    const report = runListingsVerification(acpFeedToClaims(faithful), sor);
    expect(report.findings).toHaveLength(0);
    expect(report.ok).toBe(true);
  });

  it("ucp: faithful response (pinned version) is clean", () => {
    const resp = buildUcpResponse(faithful, {
      supportedVersions: [UCP_PINNED_VERSION],
      sessionId: "sess-sim-faithful-001",
    });
    const report = runListingsVerification(ucpResponseToClaims(resp), sor);
    expect(report.findings).toHaveLength(0);
  });
});

describe("golden drifted reports (byte-exact, determinism)", () => {
  it("acp drifted report matches the frozen golden byte-for-byte", () => {
    const report = runListingsVerification(acpFeedToClaims(bundle.feed), sor);
    expect(serializeReport(report)).toBe(readFixture("expected-report.acp.json"));
  });

  it("ucp drifted report matches the frozen golden byte-for-byte", () => {
    const resp = buildUcpResponse(bundle.feed, {
      supportedVersions: ["2026-03-01-draft"],
      sessionId: "sess-sim-drifted-001",
    });
    const report = runListingsVerification(ucpResponseToClaims(resp), sor);
    expect(serializeReport(report)).toBe(readFixture("expected-report.ucp.json"));
  });

  it("two identical runs serialize byte-identically (no clock, no randomness)", () => {
    const r1 = runListingsVerification(acpFeedToClaims(bundle.feed), sor);
    const r2 = runListingsVerification(acpFeedToClaims(bundle.feed), sor);
    expect(serializeReport(r1)).toBe(serializeReport(r2));
  });

  it("every finding carries a plain-words line (C4 report readiness)", () => {
    const report = runListingsVerification(acpFeedToClaims(bundle.feed), sor);
    for (const f of report.findings) {
      expect(f.plainLine, `${f.ruleId} lacks plainLine`).toBeTruthy();
    }
  });
});

describe("required drift classes are present in the corpus (C3/Codex amendment 5)", () => {
  it("manifest injects ≥1 ID-mismatch and ≥1 modifier/variant-ambiguity case", () => {
    const identity = bundle.manifest.filter((e) => e.class === "identity");
    expect(identity.some((e) => e.field === "item_id")).toBe(true);
    expect(identity.some((e) => e.field === "variant_dict")).toBe(true);
  });

  it("both identity cases are actually CAUGHT on both surfaces", () => {
    const acp = runListingsVerification(acpFeedToClaims(bundle.feed), sor);
    const resp = buildUcpResponse(bundle.feed, {
      supportedVersions: ["2026-03-01-draft"],
      sessionId: "sess-sim-drifted-001",
    });
    const ucp = runListingsVerification(ucpResponseToClaims(resp), sor);
    for (const report of [acp, ucp]) {
      const rules = report.findings.map((f) => f.ruleId);
      expect(rules).toContain("LST-IDENT-ID-MISMATCH");
      expect(rules).toContain("LST-IDENT-MODIFIER-AMBIG");
    }
  });
});

describe("injector invariant: no two injections share a live target row (P3-2)", () => {
  // Direct test of the drift injector's touched-set invariant (the W1 gate
  // advisory): each injection lands on a distinct row, so every taxonomy class is
  // independently detectable (no stacking that could mask a rule).
  it("every manifest entry targets a distinct row", () => {
    const targets = bundle.manifest.map((e) => e.targetFeedItemId);
    expect(new Set(targets).size, `duplicate target rows: ${targets.join(", ")}`).toBe(targets.length);
  });

  it("no injection targets a row a prior injection re-keyed (the live legacy id)", () => {
    // drift-010 re-keys a row to `legacy-pos-4471`; the touched-set must prevent
    // any later injection from selecting that live id.
    expect(bundle.manifest.some((e) => e.targetFeedItemId === "legacy-pos-4471")).toBe(false);
  });
});
