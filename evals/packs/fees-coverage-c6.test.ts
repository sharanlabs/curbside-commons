import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  auditStatement,
  buildConditionalStatement,
  buildCuredStatement,
  buildDriftedStatement,
  buildFaithfulStatement,
  buildFeeAnswerKey,
  FEE_LINE_CLASSES,
} from "@/lib/packs/fees";

/**
 * C6 — fee-line-class coverage is MEASURED, never asserted rhetorically. For each
 * of the six plan §7 fee-line classes the answer key records whether the planted
 * violation is caught DETERMINISTICALLY or DEFERRED-TO-CLASSIFIER (F1b); the eval
 * reports the split honestly and enforces the M1 answer-key-completeness
 * invariant BOTH directions:
 *   - every finding the engine emits is explained by a labeled manifest entry;
 *   - every entry marked deterministic is caught (right rule id + verdict).
 * The overclaim scan (listings-coverage pattern) bans "all edge cases" claims.
 */

const answerKey = buildFeeAnswerKey();
const builders: Readonly<Record<string, () => ReturnType<typeof buildDriftedStatement>>> = {
  "statement.faithful.json": buildFaithfulStatement,
  "statement.drifted.json": buildDriftedStatement,
  "statement.cured.json": buildCuredStatement,
  "statement.conditional.json": buildConditionalStatement,
};
const reports = Object.fromEntries(
  Object.entries(builders).map(([n, b]) => [n, auditStatement(b())]),
);

describe("C6 answer-key completeness (both directions, all statements)", () => {
  for (const [name, section] of Object.entries(answerKey.statements)) {
    const report = reports[name];
    const det = section.entries.filter((e) => e.detection === "deterministic");

    it(`${name}: every emitted finding is explained by a deterministic answer-key entry`, () => {
      for (const f of report.findings) {
        const e = det.find((e) => e.expectedClaimId === f.claim.id && e.expectedRuleId === f.ruleId);
        expect(e, `${name}: unexplained finding ${f.claim.id} / ${f.ruleId}`).toBeDefined();
        expect(f.verdict).toBe(e!.expectedVerdict);
      }
    });

    it(`${name}: every deterministic answer-key entry is caught (rule id + verdict)`, () => {
      for (const e of det) {
        const f = report.findings.find(
          (f) => f.claim.id === e.expectedClaimId && f.ruleId === e.expectedRuleId,
        );
        expect(f, `${name}: expected ${e.id} (${e.expectedRuleId}) not emitted`).toBeDefined();
        expect(f!.verdict).toBe(e.expectedVerdict);
      }
    });
  }
});

describe("C6 measured per-class coverage (drifted corpus)", () => {
  const drift = answerKey.statements["statement.drifted.json"].entries;
  const injected = new Set(drift.map((e) => e.feeClass));
  const deterministic = new Set(
    drift.filter((e) => e.detection === "deterministic").map((e) => e.feeClass),
  );
  const total = FEE_LINE_CLASSES.length;

  it(`fixture coverage: ${injected.size}/${total} §7 fee-line classes have ≥1 planted fixture`, () => {
    for (const c of FEE_LINE_CLASSES) {
      expect(injected.has(c), `class "${c}" has no planted fixture`).toBe(true);
    }
    expect(injected.size).toBe(total);
  });

  it(`detection split: ${deterministic.size}/${total} classes caught DETERMINISTICALLY, remainder DEFERRED-TO-CLASSIFIER (F1b)`, () => {
    // Honest measured split — NOT an "all classes caught" claim. Relabeling (pure
    // cross-month) needs multi-month + fee-change-notice data (g-1-iv is
    // non-statement-checkable), so it is deferred, not faked as deterministic.
    expect(deterministic.size).toBe(5);
    expect(deterministic.has("relabeling")).toBe(false);
    const deferredClasses = [...injected].filter((c) => !deterministic.has(c));
    expect(deferredClasses).toEqual(["relabeling"]);
  });

  it("every DEFERRED entry genuinely emits NO finding (not silently miscounted)", () => {
    const report = reports["statement.drifted.json"];
    const emittedClaimIds = new Set(report.findings.map((f) => f.claim.id));
    for (const e of drift.filter((e) => e.detection === "deferred-to-classifier")) {
      expect(e.expectedClaimId).toBeNull();
      // no finding claims the deferred target order as its anchor beyond what the
      // deterministic entries already explain
      expect([...emittedClaimIds].some((id) => id.startsWith(`${e.targetOrderId}#`))).toBe(false);
    }
  });
});

describe("C6/C10 overclaim guardrail (fees sources + corpus README)", () => {
  const banned = /\ball (edge cases|drift|possible)/i;
  it("no fees pack source or fees README claims 'all edge cases'", () => {
    const files: string[] = [];
    const packDir = join(process.cwd(), "lib", "packs", "fees");
    for (const f of readdirSync(packDir)) if (f.endsWith(".ts")) files.push(join(packDir, f));
    files.push(join(process.cwd(), "fixtures", "synthetic-restaurant", "fees", "README.md"));
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(banned.test(text), `overclaim in ${file}`).toBe(false);
    }
  });
});
