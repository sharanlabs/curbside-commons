/**
 * Draft-text differential — the TS makeDraft must reproduce the Python v1 STUB draft text
 * byte-for-byte. Extends the core differential (which locked the 32 merchant-entity columns) to
 * the draft layer (evals-specialist finding: the draft oracle existed in out/model_runs.csv but
 * was never differentially checked). The oracle JSON was extracted from out/model_runs.csv:
 *   python3 -c "import csv,json; rows={}; [rows.__setitem__(r['merchant_id'], {k:json.loads(r['output_json']).get(k) for k in ['draft_subject','draft_body','risk_explanation','blocker_summary','next_best_action']} | {'guardrail_flags': r['guardrail_flags'].split(';') if r['guardrail_flags'] else []}) for r in csv.DictReader(open('out/model_runs.csv')) if r['generator']=='stub']; json.dump({'rows':rows}, open('eval/draft-oracle.v1.json','w'), indent=2)"
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { REFERENCE_PLATFORM_NAME } from "@/lib/core/constants";
import type { RiskLevel } from "@/lib/core/constants";
import { parseIntField, runCore } from "@/lib/core/pipeline";
import { mockDraft } from "@/lib/agents/draft";
import { runGuardrail } from "@/lib/core/guardrail";
import type { MerchantInput } from "@/lib/core/types";
import oracle from "@/eval/draft-oracle.v1.json";

interface OracleDraft {
  draft_subject: string;
  draft_body: string;
  risk_explanation: string;
  blocker_summary: string;
  next_best_action: string;
  guardrail_flags: string[];
}
const oracleRows = (oracle as { rows: Record<string, OracleDraft> }).rows;

// Reconstruct the golden merchants the same way the core differential does.
const csv = readFileSync(join(process.cwd(), "out", "merchants_v1.csv"), "utf8").trim();
const lines = csv.split(/\r?\n/);
const header = lines[0].split(",");
const inputs: MerchantInput[] = lines.slice(1).map((line) => {
  const cells = line.split(",");
  const r: Record<string, string> = {};
  header.forEach((h, i) => (r[h] = cells[i] ?? ""));
  return {
    merchant_name: r.merchant_name,
    merchant_category: r.merchant_category as MerchantInput["merchant_category"],
    days_since_signup: parseIntField(r.days_since_signup),
    last_login_days_ago: parseIntField(r.last_login_days_ago),
    steps_completed: parseIntField(r.steps_completed),
    source_risk_level: r.risk_level as RiskLevel,
  };
});
const { merchants } = runCore(inputs, {}, REFERENCE_PLATFORM_NAME);

describe("draft-text differential — TS makeDraft vs the Python stub oracle (out/model_runs.csv)", () => {
  it("locks 20 oracle draft rows", () => {
    expect(merchants.length).toBe(20);
    expect(Object.keys(oracleRows).length).toBe(20);
  });

  it("reproduces every stub draft's text byte-for-byte (+ guardrail flags)", () => {
    for (const m of merchants) {
      const o = oracleRows[m.merchant_id];
      expect(o, m.merchant_id).toBeTruthy();
      const d = mockDraft(m, REFERENCE_PLATFORM_NAME);
      expect(d.draft_subject, `${m.merchant_id}.draft_subject`).toBe(o.draft_subject);
      expect(d.draft_body, `${m.merchant_id}.draft_body`).toBe(o.draft_body);
      expect(d.risk_explanation, `${m.merchant_id}.risk_explanation`).toBe(o.risk_explanation);
      expect(d.blocker_summary, `${m.merchant_id}.blocker_summary`).toBe(o.blocker_summary);
      expect(d.next_best_action, `${m.merchant_id}.next_best_action`).toBe(o.next_best_action);
      expect(runGuardrail(d, m, REFERENCE_PLATFORM_NAME).sort(), `${m.merchant_id}.guardrail`).toEqual(
        [...o.guardrail_flags].sort(),
      );
    }
  });
});
