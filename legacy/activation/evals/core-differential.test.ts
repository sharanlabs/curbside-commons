/**
 * Differential test: the TypeScript deterministic core must reproduce the Python
 * prototype's output byte-for-byte. The oracle is out/merchants_v1.csv (the
 * committed canonical run of scripts/pipeline.py). This is the Phase A gate and
 * the slice's deterministic-layer proof.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MERCHANT_COLUMNS, REFERENCE_PLATFORM_NAME } from "@/legacy/activation/lib/core/constants";
import type { RiskLevel } from "@/legacy/activation/lib/core/constants";
import { parseIntField, runCore } from "@/legacy/activation/lib/core/pipeline";
import type { MerchantInput } from "@/legacy/activation/lib/core/types";

/** Format a typed value the way the Python pipeline writes it to CSV. */
function fmt(v: unknown): string {
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) return v.join(";");
  return String(v);
}

const csv = readFileSync(join(process.cwd(), "out", "merchants_v1.csv"), "utf8").trim();
// Python's csv module writes \r\n line terminators; split on either so the last
// field/header doesn't keep a trailing \r.
const lines = csv.split(/\r?\n/);
const header = lines[0].split(",");
const oracleRows = lines.slice(1).map((line) => {
  const cells = line.split(",");
  const row: Record<string, string> = {};
  header.forEach((h, i) => (row[h] = cells[i] ?? ""));
  return row;
});

const inputs: MerchantInput[] = oracleRows.map((r) => ({
  merchant_name: r.merchant_name,
  merchant_category: r.merchant_category as MerchantInput["merchant_category"],
  days_since_signup: parseIntField(r.days_since_signup),
  last_login_days_ago: parseIntField(r.last_login_days_ago),
  steps_completed: parseIntField(r.steps_completed),
  source_risk_level: r.risk_level as RiskLevel,
}));

// approvals={} and the reference platform name reproduce the canonical Python run.
const { merchants } = runCore(inputs, {}, REFERENCE_PLATFORM_NAME);

describe("deterministic core — differential vs the Python oracle (out/merchants_v1.csv)", () => {
  it("parses 20 oracle rows with the expected header", () => {
    expect(header).toEqual([...MERCHANT_COLUMNS]);
    expect(oracleRows.length).toBe(20);
    for (const r of oracleRows) expect(Object.keys(r).length).toBe(MERCHANT_COLUMNS.length);
  });

  it("reproduces every oracle row byte-for-byte across every column", () => {
    expect(merchants.length).toBe(oracleRows.length);
    merchants.forEach((m, i) => {
      const oracle = oracleRows[i];
      const rec = m as unknown as Record<string, unknown>;
      for (const col of MERCHANT_COLUMNS) {
        expect(fmt(rec[col]), `${oracle.merchant_id}.${col}`).toBe(oracle[col]);
      }
    });
  });

  it("matches the golden aggregate expectations (20 / 8 high / 12 sent / 8 held / 0 rejected)", () => {
    expect(merchants.length).toBe(20);
    expect(merchants.filter((m) => m.risk_level === "High").length).toBe(8);
    expect(merchants.filter((m) => m.outreach_status === "simulated_sent").length).toBe(12);
    expect(merchants.filter((m) => m.outreach_status === "drafted").length).toBe(8);
    expect(merchants.filter((m) => m.outreach_status === "draft_rejected").length).toBe(0);
  });
});
