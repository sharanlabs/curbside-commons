/**
 * E1a dashboard anti-fabrication gate (plan v3.3 §E1a — "figures traced to
 * committed files").
 *
 * Every figure the truth-engine dashboard renders comes from
 * lib/dashboard/evidence.ts. This suite binds that module to the repo:
 *   - COMPUTED figures are recomputed here from the same committed artifacts;
 *   - PINNED figures are re-read from their provenance source file — if the
 *     source does not literally support the rendered figure, this fails;
 *   - provenance entries must point at real, existing files with SHA-shaped
 *     freeze references (full history is unavailable in shallow CI checkouts,
 *     so SHA↔file authorship was derived live at authoring time and is
 *     re-checked at batch review, not here).
 *
 * NOTE deliberately ABSENT: no figure may be asserted against this test's own
 * constants alone — each assertion reads the committed source artifact.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  CALIBRATION,
  CALIBRATION_PROVENANCE,
  CALIBRATION_DEFER_PROVENANCE,
  ENGINE,
  L1,
  RUN_RECORDS,
  RECORDED_LEGACY_GEMINI,
  ZERO_COST_PROOFS,
} from "@/lib/dashboard/evidence";
import { deriveBuildInfo, BUILD_SHA_PATTERN } from "@/lib/build-info";
import { FEE_RULES, NON_STATEMENT_CHECKABLE } from "@/lib/packs/fees/rules";

const root = process.cwd();
const read = (p: string) => readFileSync(join(root, p), "utf8");

describe("E1a evidence — calibration figures are literally supported by the committed record", () => {
  const retryDoc = read(CALIBRATION_PROVENANCE.file);
  const deferDoc = read(CALIBRATION_DEFER_PROVENANCE.file);

  it("retry-run figures appear verbatim in the recalibration status doc", () => {
    // Bind the MODULE's values to the doc (interpolated, never re-typed literals) —
    // mutating any rendered figure in evidence.ts must fail here.
    const r = CALIBRATION.retryRun;
    expect(retryDoc).toContain(`${r.score} = ${r.accuracy}`);
    expect(retryDoc).toContain(r.flipRate);
    expect(retryDoc).toContain(`${r.calls} calls`);
    expect(retryDoc).toContain(r.model);
    expect(retryDoc).toContain(r.ranAt);
    expect(retryDoc).toContain(r.baseline);
    // macro precision + kappa share the table's "1.0000" — bind each row's value.
    expect(retryDoc).toMatch(new RegExp(`Macro precision[^|]*\\|\\s*${r.macroPrecision}`));
    expect(retryDoc).toMatch(new RegExp(`Cohen's κ ≥ 0\\.60 \\| ${r.cohensKappa}`));
  });

  it("the earned label is the doc's exact label (scope-bounded), not an invention", () => {
    // The doc hard-wraps prose at ~80 chars; judge on a whitespace-normalized view.
    expect(retryDoc.replace(/\s+/g, " ")).toContain(CALIBRATION.earnedLabel);
  });

  it("the snapshot + eval-lock files the dashboard cites exist", () => {
    expect(existsSync(join(root, CALIBRATION.snapshotFile))).toBe(true);
    expect(existsSync(join(root, CALIBRATION.lockTestFile))).toBe(true);
  });

  it("the honest DEFER arc is supported by the 2026-07-05 record", () => {
    expect(deferDoc).toContain(`${CALIBRATION.deferRun.score} = 0.952`);
    expect(deferDoc).toContain("enhanced_service_fee");
    expect(deferDoc).toContain("0.75 (3/4)");
    // The module's reason line must carry the doc's actual miss (class + figure).
    expect(CALIBRATION.deferRun.reason).toContain("enhanced_service_fee");
    expect(CALIBRATION.deferRun.reason).toContain("0.75");
  });

  it("the scope note stays present in the source (no silent scope inflation)", () => {
    expect(retryDoc).toContain("It says NOTHING about");
    expect(CALIBRATION.scopeNote).toContain("It says nothing about real-world platform statements");
  });
});

describe("E1a evidence — L-1 figures are recomputed from the committed matrix", () => {
  const matrix = JSON.parse(read("evals/crew/gold/l1-live-matrix.json")) as {
    model: string;
    degradedCount: number;
    matrix: Array<{ member: string; safetyPass: boolean; classMatch: boolean }>;
  };

  it("case count, degraded count, and model match the frozen matrix", () => {
    expect(L1.cases).toBe(matrix.matrix.length);
    expect(L1.cases).toBe(20);
    expect(L1.degraded).toBe(matrix.degradedCount);
    expect(L1.model).toBe(matrix.model);
  });

  it("the all-pass claims hold against every row", () => {
    expect(matrix.matrix.every((r) => r.safetyPass)).toBe(true);
    expect(matrix.matrix.every((r) => r.classMatch)).toBe(true);
    expect(L1.allSafetyPass).toBe(true);
    expect(L1.allClassMatch).toBe(true);
  });

  it("per-member 5/5 safety + 5/5 class-match recompute from the matrix", () => {
    for (const m of L1.perMember) {
      const rows = matrix.matrix.filter((r) => r.member === m.member);
      expect(m.cases, m.member).toBe(rows.length);
      expect(m.cases, m.member).toBe(5);
      expect(m.safetyPass, m.member).toBe(rows.filter((r) => r.safetyPass).length);
      expect(m.classMatch, m.member).toBe(rows.filter((r) => r.classMatch).length);
    }
  });

  it("member labels are the committed status doc's labels, not marketing", () => {
    const statusDoc = read("docs/crew-live-l1-status.md");
    expect(statusDoc).toContain('"agent (live-run floors cleared)"');
    expect(statusDoc).toContain('"deterministic workflow"');
    expect(L1.memberLabels.intake).toBe("agent (live-run floors cleared)");
    expect(L1.memberLabels.reviewer).toBe("agent (live-run floors cleared)");
    expect(L1.memberLabels.audit).toBe("deterministic workflow");
    expect(L1.memberLabels.evidence).toBe("deterministic workflow");
  });

  it("the lock test the dashboard cites exists", () => {
    expect(existsSync(join(root, L1.lockTestFile))).toBe(true);
  });
});

describe("E1a evidence — engine measurables recompute from lib/fixtures", () => {
  it("fee-rule accounting: predicates + registered non-checkable = the 17-rule table", () => {
    expect(ENGINE.feeRulePredicates).toBe(FEE_RULES.length);
    expect(ENGINE.feeRulesNonCheckable).toBe(NON_STATEMENT_CHECKABLE.size);
    expect(ENGINE.feeRulesTotal).toBe(FEE_RULES.length + NON_STATEMENT_CHECKABLE.size);
    expect(ENGINE.feeRulesTotal).toBe(17);
  });

  it("UCP schema count is the pinned directory's actual file count", () => {
    const dir = join(root, "fixtures/ucp-schemas", ENGINE.ucpSpecVersion, "schemas");
    const count = readdirSync(dir, { recursive: true })
      .map(String)
      .filter((f) => f.endsWith(".json")).length;
    expect(ENGINE.ucpSchemaCount).toBe(count);
  });

  it("UCP spec version matches the pinned PROVENANCE.json", () => {
    const prov = JSON.parse(read(ENGINE.ucpProvenance.file)) as { specVersion: string };
    expect(ENGINE.ucpSpecVersion).toBe(prov.specVersion);
  });

  it("demo tally (16 · 11 error / 5 warn) recomputes from the committed golden report", () => {
    const report = JSON.parse(read(ENGINE.demoReportProvenance.file)) as {
      findings: Array<{ severity: string }>;
    };
    expect(ENGINE.demoFindings).toBe(report.findings.length);
    expect(ENGINE.demoErrors).toBe(report.findings.filter((f) => f.severity === "error").length);
    expect(ENGINE.demoWarns).toBe(report.findings.filter((f) => f.severity === "warn").length);
    expect(ENGINE.demoFindings).toBe(16);
    expect(ENGINE.demoErrors).toBe(11);
    expect(ENGINE.demoWarns).toBe(5);
  });
});

describe("E1a evidence — $0 enforcement claims name real, biting test files", () => {
  it.each(ZERO_COST_PROOFS.map((p) => [p.enforcedBy, p] as const))(
    "%s exists and carries the enforcement it is cited for",
    (_file, proof) => {
      expect(existsSync(join(root, proof.enforcedBy))).toBe(true);
      const src = read(proof.enforcedBy);
      if (proof.enforcedBy.includes("crew-import-walk")) {
        expect(src).toContain("banned LLM/network pattern");
      } else {
        expect(src).toContain("must import nothing at all (pure builders)");
      }
    },
  );
});

describe("E1a evidence — run records and provenance discipline", () => {
  it("every provenance entry points at an existing file with a SHA-shaped freeze ref", () => {
    const provs = [
      CALIBRATION_PROVENANCE,
      CALIBRATION_DEFER_PROVENANCE,
      L1.provenance,
      ENGINE.feeRulesProvenance,
      ENGINE.ucpProvenance,
      ENGINE.demoReportProvenance,
      RECORDED_LEGACY_GEMINI.provenance,
      ...RUN_RECORDS.map((r) => r.provenance),
    ];
    for (const p of provs) {
      expect(existsSync(join(root, p.file)), p.file).toBe(true);
      expect(p.frozenAt, `${p.file} frozenAt`).toMatch(/^[0-9a-f]{7,40}$/);
      expect(p.date, `${p.file} date`).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
    }
  });

  it("the L-2 send record supports its rendered line (HTTP 200, one-shot)", () => {
    const rec = RUN_RECORDS.find((r) => r.provenance.file.includes("l2-slack-one-shot"))!;
    const src = read(rec.provenance.file);
    expect(src).toContain("200 OK");
    expect(src.toLowerCase()).toContain("one-shot");
  });

  it("the n8n record supports its rendered line (sha256-identical artifacts)", () => {
    const rec = RUN_RECORDS.find((r) => r.provenance.file.includes("l3-n8n"))!;
    expect(read(rec.provenance.file)).toContain("sha256");
  });

  it("the recorded legacy Gemini spend matches the frozen snapshot", () => {
    const snap = JSON.parse(read(RECORDED_LEGACY_GEMINI.provenance.file)) as {
      _provenance: { total_cost_usd: number; recorded_at: string };
    };
    expect(`$${snap._provenance.total_cost_usd.toFixed(4)}`).toBe(RECORDED_LEGACY_GEMINI.totalUsd);
    expect(RECORDED_LEGACY_GEMINI.provenance.date).toBe(snap._provenance.recorded_at);
  });
});

describe("E1a build-info — injected provenance is honest by construction", () => {
  it("valid sha + time → a label that claims build-time source, never deployment", () => {
    const sha = "a".repeat(40);
    const info = deriveBuildInfo(sha, "2026-07-11T00:00:00.000Z");
    expect(info.sha).toBe(sha);
    expect(info.shortSha).toBe("a".repeat(12));
    expect(info.label).toContain("Built from source");
    expect(info.label).toContain("not a deployment claim");
    expect(info.label).not.toMatch(/deployed/i);
  });

  it("a dirty working tree is marked, never laundered into a clean SHA", () => {
    const info = deriveBuildInfo(`${"b".repeat(40)}+dirty`, "2026-07-11T00:00:00.000Z");
    expect(info.sha).toBe(`${"b".repeat(40)}+dirty`);
    expect(info.shortSha).toContain("(+dirty)");
    expect(BUILD_SHA_PATTERN.test(info.sha!)).toBe(true);
  });

  it("missing/garbage inputs → the honest untracked fallback (no fabricated SHA)", () => {
    // "deadbeef": short hex is NOT accepted — only full 40-hex SHAs pass.
    for (const [sha, time] of [
      ["", ""],
      ["not-a-sha", "2026-07-11T00:00:00Z"],
      ["deadbeef", "yesterday"],
    ] as const) {
      const info = deriveBuildInfo(sha, time);
      expect(BUILD_SHA_PATTERN.test(sha)).toBe(false);
      expect(info.sha).toBeNull();
      expect(info.label).toContain("Untracked build");
    }
  });

  it("the release-gate pattern only accepts full 40-hex SHAs (optionally +dirty)", () => {
    expect(BUILD_SHA_PATTERN.test("c".repeat(40))).toBe(true);
    expect(BUILD_SHA_PATTERN.test(`${"c".repeat(40)}+dirty`)).toBe(true);
    expect(BUILD_SHA_PATTERN.test("c".repeat(39))).toBe(false);
    expect(BUILD_SHA_PATTERN.test(`${"c".repeat(40)}x`)).toBe(false);
    expect(BUILD_SHA_PATTERN.test("HEAD")).toBe(false);
  });
});
