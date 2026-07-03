import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  CORPUS_AS_OF,
  CORPUS_SEED,
  UCP_PINNED_VERSION,
  generateCatalog,
  runListingsVerification,
  ucpSearchResponseToClaims,
  type UcpSearchResponse,
} from "@/lib/packs/listings";
import { runUcpConformance } from "@/lib/packs/listings/conformance";
import { buildUcpConformanceCorpus } from "@/lib/packs/listings/ucp-corpus";
import { SEVERITY_LEVELS } from "@/lib/verifier-core";

/**
 * W2 — the UCP CONFORMANCE leg (plan §5 W2; criteria C5 conformance-correctness,
 * C10 spec-version pin + simulated labels). Proves: our ajv verdicts over the
 * N≥30 corpus agree with the manifest's ground truth (each invalid caught with
 * the RIGHT violation class; each valid clean); every committed corpus file AND
 * every pinned schema is byte/hash-locked (no silent hand-tampering); every
 * conformance finding is C2-complete and in the DISTINCT `LST-CONF-*` family; and
 * the conformance-vs-truth headline holds — a spec-VALID document is still caught
 * lying by the truth leg.
 */

const corpusDir = join(process.cwd(), "fixtures", "ucp-conformance-ci");
const readFixture = (rel: string): string => readFileSync(join(corpusDir, rel), "utf8");
const asJson = (v: unknown): string => `${JSON.stringify(v, null, 2)}\n`;

const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
const { entries, manifest } = buildUcpConformanceCorpus(sor);
const manifestOnDisk = JSON.parse(readFixture("manifest.json")) as {
  entries: { file: string; op: "search" | "lookup" | "get_product"; valid: boolean; violationClass?: string }[];
  counts: { total: number; valid: number; invalid: number };
  violationClasses: string[];
};

describe("UCP conformance corpus freeze-integrity (P2-1: every file byte-locked)", () => {
  it("every committed corpus fixture is exactly the generator's output", () => {
    for (const e of entries) {
      expect(readFixture(e.file), `${e.file} drifted from the generator`).toBe(asJson(e.doc));
    }
  });

  it("manifest.json is exactly the generator's manifest", () => {
    expect(readFixture("manifest.json")).toBe(asJson(manifest));
  });

  it("corpus has N≥30 fixtures spanning valid AND invalid (C5)", () => {
    expect(manifestOnDisk.counts.total).toBeGreaterThanOrEqual(30);
    expect(manifestOnDisk.counts.valid).toBeGreaterThan(0);
    expect(manifestOnDisk.counts.invalid).toBeGreaterThan(0);
  });
});

describe("pinned UCP schemas freeze-integrity (tamper-evident, no network)", () => {
  const base = join(process.cwd(), "fixtures", "ucp-schemas", UCP_PINNED_VERSION);
  const provenance = JSON.parse(readFileSync(join(base, "PROVENANCE.json"), "utf8")) as {
    license: { spdx: string };
    files: { file: string; sha256: string; $id: string | null }[];
    fileCount: number;
  };

  it("license is Apache-2.0 and 78 schemas are pinned", () => {
    expect(provenance.license.spdx).toBe("Apache-2.0");
    expect(provenance.files.length).toBe(provenance.fileCount);
    expect(provenance.files.length).toBeGreaterThanOrEqual(70);
  });

  it("every pinned schema's sha256 matches PROVENANCE.json (no silent edit)", () => {
    for (const f of provenance.files) {
      const bytes = readFileSync(join(base, f.file));
      const sha = createHash("sha256").update(bytes).digest("hex");
      expect(sha, `${f.file} was edited after pinning`).toBe(f.sha256);
    }
  });
});

describe("C5 conformance correctness — ajv verdicts vs manifest ground truth", () => {
  it("every VALID fixture is conformance-clean (ok:true, zero findings)", () => {
    for (const e of manifestOnDisk.entries.filter((x) => x.valid)) {
      const rep = runUcpConformance(JSON.parse(readFixture(e.file)), { op: e.op });
      expect(rep.ok, `${e.file} unexpectedly flagged: ${rep.findings.map((f) => f.ruleId)}`).toBe(true);
      expect(rep.findings).toHaveLength(0);
    }
  });

  it("every INVALID fixture is caught with its DECLARED violation class (red-green per rule)", () => {
    for (const e of manifestOnDisk.entries.filter((x) => !x.valid)) {
      const rep = runUcpConformance(JSON.parse(readFixture(e.file)), { op: e.op });
      expect(rep.ok, `${e.file} should have failed conformance`).toBe(false);
      const rules = rep.findings.map((f) => f.ruleId);
      expect(rules, `${e.file} missing ${e.violationClass}`).toContain(e.violationClass);
    }
  });

  it("every enumerated violation class is exercised by ≥1 invalid fixture", () => {
    const covered = new Set(
      manifestOnDisk.entries.filter((x) => !x.valid).map((x) => x.violationClass),
    );
    for (const cls of manifestOnDisk.violationClasses) {
      expect(covered.has(cls), `class ${cls} declared but not exercised`).toBe(true);
    }
    expect(manifestOnDisk.violationClasses.length).toBeGreaterThanOrEqual(6);
  });
});

describe("conformance findings are C2-complete and in the DISTINCT LST-CONF-* family", () => {
  it("every conformance finding carries all four receipts + category `conformance`", () => {
    for (const e of manifestOnDisk.entries.filter((x) => !x.valid)) {
      const rep = runUcpConformance(JSON.parse(readFixture(e.file)), { op: e.op });
      for (const f of rep.findings) {
        // C2 four fields.
        expect(f.claim.id.length).toBeGreaterThan(0);
        expect(f.claim.source).toBe("ucp-catalog");
        expect(f.claim.field.length).toBeGreaterThan(0);
        expect(f.referenceRowId.length).toBeGreaterThan(0);
        expect(SEVERITY_LEVELS).toContain(f.severity);
        // Distinct family: never a bare truth rule; always conformance category.
        expect(f.ruleId.startsWith("LST-CONF-")).toBe(true);
        expect(f.category).toBe("conformance");
      }
    }
  });

  it("conformance report pins the UCP spec version in its header (C10)", () => {
    const rep = runUcpConformance(JSON.parse(readFixture("valid/search-full-catalog.json")), { op: "search" });
    expect(rep.specVersion).toContain(UCP_PINNED_VERSION);
    expect(rep.simulated).toBe(true);
  });
});

describe("THE conformance-vs-truth headline (spec-valid data can still lie)", () => {
  const faithfulDoc = JSON.parse(readFixture("valid/search-full-catalog.json")) as UcpSearchResponse;
  const lyingDoc = JSON.parse(readFixture("valid/conformant-but-false.json")) as UcpSearchResponse;

  it("the faithful catalog is BOTH conformant AND truthful (double-clean baseline)", () => {
    expect(runUcpConformance(faithfulDoc, { op: "search" }).ok).toBe(true);
    expect(runListingsVerification(ucpSearchResponseToClaims(faithfulDoc), sor).ok).toBe(true);
  });

  it("the exhibit PASSES ajv conformance yet the truth leg catches it lying", () => {
    // conformance: PASS — the document is spec-shaped.
    const conformance = runUcpConformance(lyingDoc, { op: "search" });
    expect(conformance.ok).toBe(true);
    // truth: FAIL — the same real-UCP document quotes a price the SOR contradicts.
    const truth = runListingsVerification(ucpSearchResponseToClaims(lyingDoc), sor);
    expect(truth.ok).toBe(false);
    expect(truth.findings.some((f) => f.category === "price")).toBe(true);
  });
});
