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
  E2,
  E3,
  E4,
  ENGINE,
  L1,
  RUN_RECORDS,
  RECORDED_LEGACY_GEMINI,
  ZERO_COST_PROOFS,
} from "@/lib/dashboard/evidence";
import { deriveBuildInfo, BUILD_SHA_PATTERN } from "@/lib/build-info";
import { E4_SCOPE_LABEL } from "@/lib/entity/matcher.ts";
import {
  LOOKUP_REFERENCE_LABEL,
  LOOKUP_REFERENCE_REGISTERED_LABEL,
} from "@/lib/tools/tools/lookup-reference.ts";
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

describe("batch-C reconciliation — every RUN_RECORDS rendered value is source-bound (mutation-bitten)", () => {
  // The /cost page renders r.value/r.label directly; a value string nothing
  // re-derives is a fabrication channel (batch-C P1). Each row below binds its
  // rendered tokens to the committed artifact its own provenance names.

  it("the L-1 row's value is DERIVED from the committed matrix (scored count + degraded count)", () => {
    const rec = RUN_RECORDS.find((r) => r.provenance.file.includes("l1-live-matrix"))!;
    const matrix = JSON.parse(read(rec.provenance.file)) as {
      matrix: unknown[];
      degradedCount: number;
    };
    const scored = matrix.matrix.length;
    expect(rec.value).toBe(`${scored}/${scored} scored · ${matrix.degradedCount} degraded · $0 (Groq)`);
  });

  it("the calibration-retry row interpolates the bound retry score and cost", () => {
    const rec = RUN_RECORDS.find((r) => r.provenance.file.includes("recalibration-status"))!;
    expect(rec.value).toBe(`${CALIBRATION.retryRun.score} · all six floors · ${CALIBRATION.retryRun.cost} (Groq)`);
  });

  it("the DEFER row derives from deferRun and its source doc actually records the DEFER", () => {
    const rec = RUN_RECORDS.find((r) => r.provenance === CALIBRATION_DEFER_PROVENANCE)!;
    expect(rec.value).toBe(
      `${CALIBRATION.deferRun.score} · one floor missed · ${CALIBRATION.deferRun.outcome}`,
    );
    const src = read(rec.provenance.file);
    expect(src).toContain(CALIBRATION.deferRun.score);
    expect(src.toUpperCase()).toContain("DEFER");
  });

  it("the L-2 row's 'eight safety controls' is supported verbatim by the send record", () => {
    const rec = RUN_RECORDS.find((r) => r.provenance.file.includes("l2-slack-one-shot"))!;
    expect(rec.value).toContain("eight safety controls");
    expect(read(rec.provenance.file)).toMatch(/all eight held/);
  });

  it("the n8n row's 'episodic' + 'sha256-identical' wording is supported by its record", () => {
    const rec = RUN_RECORDS.find((r) => r.provenance.file.includes("l3-n8n"))!;
    expect(rec.value).toContain("episodic");
    expect(rec.value).toContain("sha256-identical");
    const src = read(rec.provenance.file).toLowerCase();
    expect(src).toContain("episodic");
    expect(src).toContain("byte-identical");
  });

  it("each ZERO_COST_PROOFS row's NOTE tokens exist in its enforcing test (not just the file)", () => {
    for (const proof of ZERO_COST_PROOFS) {
      const src = read(proof.enforcedBy);
      if (proof.note.includes("lib/tools")) {
        expect(src, proof.claim).toContain("lib/tools");
      }
      if (proof.note.includes("import-graph walk")) {
        expect(src, proof.claim).toContain("banned LLM/network pattern");
      }
      if (proof.note.includes("cannot send")) {
        expect(src, proof.claim).toContain("must import nothing at all (pure builders)");
      }
    }
  });
});

describe("E1b evidence — E2/E3/E4 figures are bound to their committed results artifacts", () => {
  const ragSummary = JSON.parse(read("evals/rag/results/results-summary.json")) as {
    decision: { shippedLane: string; labelEarned: boolean; label: string };
    bm25: { metrics: { m1: { hits: number; of: number }; m4: { outAbstained: number; outOf: number } } };
    hybrid: { metrics: { m1: { hits: number; of: number } } };
    goldExposed: boolean;
  };
  const entitySummary = JSON.parse(read("evals/entity/results/results-summary.json")) as {
    decision: { shippedDefault: string; labelEarned: boolean; label: string };
    ensemble: {
      m1: { truly: number; proposedSame: number };
      m2: { sameCaught: number; sameTotal: number };
      m3: { trapMerges: number; trapTotal: number };
      m4: { ambigAbstained: number; ambigTotal: number };
    };
  };

  it("E2: every rendered figure is DERIVED from the committed one-pass summary", () => {
    expect(E2.shippedLane).toBe(ragSummary.decision.shippedLane);
    expect(E2.labelEarned).toBe(ragSummary.decision.labelEarned);
    expect(E2.label).toBe(ragSummary.decision.label);
    expect(E2.bm25M1).toBe(`${ragSummary.bm25.metrics.m1.hits}/${ragSummary.bm25.metrics.m1.of}`);
    expect(E2.hybridM1).toBe(`${ragSummary.hybrid.metrics.m1.hits}/${ragSummary.hybrid.metrics.m1.of}`);
    expect(E2.bm25M4Out).toBe(
      `${ragSummary.bm25.metrics.m4.outAbstained}/${ragSummary.bm25.metrics.m4.outOf}`,
    );
    expect(E2.goldExposed).toBe(ragSummary.goldExposed);
  });

  it("E2/E4/E3 provenance carries a real SHA-shaped freeze ref pointing at a real file (batch-D P2 #10d)", () => {
    for (const prov of [E2.provenance, E4.provenance, E3.provenance]) {
      expect(prov.frozenAt, `${prov.file}: frozenAt must be a SHA, not prose`).toMatch(/^[0-9a-f]{7,40}$/);
      expect(existsSync(join(root, prov.file)), `${prov.file} does not exist`).toBe(true);
      expect(prov.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("the rendered labels are the PRE-REGISTERED ones, verbatim (batch-D P2 #10a/#10c)", () => {
    // The tool payload's label must contain the registration's own wording, and
    // the E4 scope label rendered on every result must NOT claim "validated".
    expect(LOOKUP_REFERENCE_LABEL).toContain(LOOKUP_REFERENCE_REGISTERED_LABEL);
    // The registration hard-wraps prose at ~80 chars; judge on a normalized view
    // (same convention as the calibration-label binding above).
    expect(read(E2.registrationDoc).replace(/\s+/g, " ")).toContain(LOOKUP_REFERENCE_REGISTERED_LABEL);
    expect(E4_SCOPE_LABEL).toContain("floors not met");
    expect(E4_SCOPE_LABEL.toLowerCase()).not.toContain("validated");
    expect(E4_SCOPE_LABEL).toContain("exact matching remains the system default");
  });

  it("E4: the VOIDED first run is disclosed on the surface, not buried (batch-D P1 #1)", () => {
    expect(E4.voidedFirstRunNote).toContain("VOIDED");
    expect(E4.voidedFirstRunNote).toContain("10 near-miss traps");
    expect(read(E4.registrationDoc)).toContain("VOIDED FIRST ATTEMPT");
  });

  it("E2: the deferred label is the honest one and its lock/registration files exist", () => {
    expect(ragSummary.decision.labelEarned).toBe(false);
    expect(E2.label).toContain("floors not met");
    expect(existsSync(join(root, E2.lockTestFile))).toBe(true);
    expect(existsSync(join(root, E2.registrationDoc))).toBe(true);
    expect(existsSync(join(root, E2.provenance.file))).toBe(true);
    // The registration's RESULTS section carries the same verdict.
    expect(read(E2.registrationDoc)).toContain("floors not met");
  });

  it("E4: every rendered figure is DERIVED from the committed one-pass summary", () => {
    expect(E4.labelEarned).toBe(entitySummary.decision.labelEarned);
    expect(E4.label).toBe(entitySummary.decision.label);
    expect(E4.shippedDefault).toBe(entitySummary.decision.shippedDefault);
    expect(E4.m1).toBe(`${entitySummary.ensemble.m1.truly}/${entitySummary.ensemble.m1.proposedSame}`);
    expect(E4.m2).toBe(`${entitySummary.ensemble.m2.sameCaught}/${entitySummary.ensemble.m2.sameTotal}`);
    expect(E4.m3).toBe(
      `${entitySummary.ensemble.m3.trapMerges}/${entitySummary.ensemble.m3.trapTotal} false merges`,
    );
    expect(E4.m4).toBe(
      `${entitySummary.ensemble.m4.ambigAbstained}/${entitySummary.ensemble.m4.ambigTotal} ambiguous routed to human`,
    );
    expect(existsSync(join(root, E4.lockTestFile))).toBe(true);
    expect(existsSync(join(root, E4.registrationDoc))).toBe(true);
    expect(read(E4.registrationDoc)).toContain("floors not met");
  });

  it("E3: the named threat suite + no-send proof exist and cover the frozen check order", () => {
    expect(existsSync(join(root, E3.threatSuiteFile))).toBe(true);
    expect(existsSync(join(root, E3.noSendProofFile))).toBe(true);
    const sim = read("lib/approvals/simulator.ts");
    // Bind the rendered check-order phrasing to the simulator's own frozen list.
    for (const step of ["id match", "expiry", "nonce replay", "signer known", "role", "canonical", "digest"]) {
      expect(E3.checkOrder.toLowerCase()).toContain(step.split(" ")[0]);
      void step;
    }
    expect(sim).toContain("request/decision id match");
    expect(sim).toContain("expired AT expiresAtMs");
    expect(sim).toContain("nonce replay");
    const threatSuite = read(E3.threatSuiteFile);
    for (const threat of ["REPLAY", "EXPIRY", "FORGERY", "TAMPER", "SubjectMismatchError"]) {
      expect(threatSuite).toContain(threat);
    }
    const noSend = read(E3.noSendProofFile);
    expect(noSend).toContain("lib/delivery");
    expect(noSend).toContain("lib/mcp");
  });
});
