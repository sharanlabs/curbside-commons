import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  auditStatement,
  buildConditionalStatement,
  buildCuredStatement,
  buildDriftedStatement,
  buildFaithfulStatement,
  buildFeeAnswerKey,
  serializeFeeReport,
} from "@/lib/packs/fees";

/**
 * Freeze-integrity (wedge pattern, plan §8): the committed fee corpus IS the
 * generator's output at the pinned seed, and every golden report is exactly
 * auditStatement(builder) — so the corpus cannot be hand-tampered without CI
 * failing, and the audit is deterministic (byte-identical across runs).
 */

const dir = join(process.cwd(), "fixtures", "synthetic-restaurant", "fees");
const read = (name: string): string => readFileSync(join(dir, name), "utf8");
const asJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const builders = {
  "statement.faithful.json": buildFaithfulStatement,
  "statement.drifted.json": buildDriftedStatement,
  "statement.cured.json": buildCuredStatement,
  "statement.conditional.json": buildConditionalStatement,
} as const;

describe("fee corpus freeze-integrity (seeded/deterministic builder)", () => {
  for (const [name, build] of Object.entries(builders)) {
    it(`${name} is exactly the pinned builder output`, () => {
      expect(read(name)).toBe(asJson(build()));
    });
  }

  it("fee-answer-key.json is exactly buildFeeAnswerKey()", () => {
    expect(read("fee-answer-key.json")).toBe(asJson(buildFeeAnswerKey()));
  });

  for (const [name, build] of Object.entries(builders)) {
    const golden = name.replace(/^statement\./, "expected-report.");
    it(`${golden} is exactly auditStatement(${name})`, () => {
      expect(read(golden)).toBe(serializeFeeReport(auditStatement(build())));
    });
  }

  it("the audit is deterministic: two runs serialize byte-identically (no clock, no randomness)", () => {
    const s = buildDriftedStatement();
    expect(serializeFeeReport(auditStatement(s))).toBe(serializeFeeReport(auditStatement(s)));
  });
});
