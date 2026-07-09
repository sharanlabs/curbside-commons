/**
 * A1 tools-differential — the Phase A1 acceptance test (spec §5.3).
 *
 * Proves the A1 typed tool wrappers change NOTHING vs the deterministic core, two ways:
 *
 *   Class A (oracle-differential, R-TOOL-5a) — re-express runCore's full deterministic chain with
 *   the A1 tool wrappers swapped in (triage_merchant + simulate_send), with core makeDraft /
 *   runGuardrail / validateDraft used as connective tissue in the TEST (the same functions runCore
 *   calls — this does NOT promote the Drafter to an A1 tool). Assert the result equals the Python
 *   oracle legacy/activation/oracle/merchants_v1.csv BYTE-FOR-BYTE across every MERCHANT_COLUMNS column (same fmt() as
 *   evals/core-differential.test.ts) + the 20 / 8 high / 12 sent / 8 drafted / 0 rejected aggregates.
 *
 *   Class B (wrapper-identity, R-TOOL-6) — for diagnose_blocker / check_faithfulness_forward /
 *   check_faithfulness_reverse (mock) / score_quality, assert tool.run(input) deepEquals the direct
 *   call of the wrapped function on the same input, over the hybrid set.
 *
 * NON-VACUOUS BY CONSTRUCTION: Class A calls triageMerchant.run(...) + simulateSend.run(...) (not
 * inline normalizeRow / send logic); Class B passes the PARSED tool input to the wrapped fn. A bug
 * in any wrapper (wrong fn, dropped column, added logic) fails the byte-for-byte / deepEqual assert.
 *
 * OFFLINE: every A1 tool wraps a deterministic/offline function (the reverse-faithfulness tool wraps
 * the MOCK judge, not the live Groq judge), so this test makes ZERO live calls — run it WITHOUT
 * --env-file; it never touches the shared Groq window.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AS_OF_DATE, MERCHANT_COLUMNS, REFERENCE_PLATFORM_NAME, RUN_TIMESTAMP } from "@/legacy/activation/lib/core/constants";
import type { RiskLevel } from "@/legacy/activation/lib/core/constants";
import { makeDraft, parseIntField, runCore, validateDraft } from "@/legacy/activation/lib/core/pipeline";
import { runGuardrail } from "@/legacy/activation/lib/core/guardrail";
import type { MerchantInput, Merchant } from "@/legacy/activation/lib/core/types";
import { mockDraft } from "@/legacy/activation/lib/agents/draft";
import { diagnose } from "@/legacy/activation/lib/domain/diagnosis";
import { runGatekeeper } from "@/legacy/activation/lib/agents/gatekeeper";
import { mockJudgeResult } from "@/legacy/activation/lib/agents/semantic-judge";
import { scoreDraft } from "@/legacy/activation/lib/evals/draft-quality";
import { getHybridMerchants } from "@/legacy/activation/lib/ingest/hybrid";
import type { AuditEntry } from "@/legacy/activation/lib/replay/run";
import {
  appendAudit,
  checkFaithfulnessForward,
  checkFaithfulnessReverse,
  diagnoseBlocker,
  scoreQuality,
  simulateSend,
  TOOL_NAMES,
  triageMerchant,
} from "@/legacy/activation/lib/agents/tools/registry";

/** Format a typed value the way the Python pipeline writes it to CSV (identical to core-differential). */
function fmt(v: unknown): string {
  if (typeof v === "boolean") return v ? "true" : "false";
  if (Array.isArray(v)) return v.join(";");
  return String(v);
}

// ----------------------------- oracle parsing (identical to core-differential.test.ts) -----------------------------

const csv = readFileSync(join(process.cwd(), "legacy", "activation", "oracle", "merchants_v1.csv"), "utf8").trim();
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

/**
 * Re-express runCore's deterministic chain through the A1 tool wrappers (Class A).
 * Pass 1: triage_merchant (tool) -> core draft/guardrail step (connective tissue). Pass 2:
 * simulate_send (tool). Mirrors runCore's two loops (pipeline.ts:236-268) verbatim.
 */
function runChainViaTools(rows: MerchantInput[]): Merchant[] {
  // Pass 1 — triage (TOOL) + the drafted/rejected middle step (core fns as connective tissue).
  const merchants = rows.map((row, i) => {
    const m = triageMerchant.run({ index: i + 1, row }); // <-- A1 tool wrapper (not inline normalizeRow)
    const draft = makeDraft(m, REFERENCE_PLATFORM_NAME);
    const flags = runGuardrail(draft, m, REFERENCE_PLATFORM_NAME); // core runGuardrail (NOT runGatekeeper)
    draft.guardrail_flags = flags;
    const schemaErrors = validateDraft(draft);
    const passed = flags.length === 0 && schemaErrors.length === 0;
    if (passed) {
      m.outreach_status = "drafted";
      m.last_outreach_at = AS_OF_DATE;
    } else {
      m.outreach_status = "draft_rejected";
    }
    return m;
  });

  // Pass 2 — idempotent simulated send (TOOL), applied back to the record exactly as runCore mutates it.
  for (const m of merchants) {
    const send = simulateSend.run(m); // <-- A1 tool wrapper (not inline send logic)
    if (send.outreach_status === "simulated_sent") {
      m.idempotency_key = send.idempotency_key;
      m.outreach_status = "simulated_sent";
      m.last_outreach_at = AS_OF_DATE;
    }
  }
  return merchants;
}

const toolMerchants = runChainViaTools(inputs);

// ----------------------------- Class A — oracle-differential (R-TOOL-5a) -----------------------------

describe("A1 Class A — tool-composed chain ≡ the Python oracle (legacy/activation/oracle/merchants_v1.csv), byte-for-byte", () => {
  it("parses 20 oracle rows with the expected header (sanity, mirrors core-differential)", () => {
    expect(header).toEqual([...MERCHANT_COLUMNS]);
    expect(oracleRows.length).toBe(20);
    expect(toolMerchants.length).toBe(20);
  });

  it("reproduces every oracle row byte-for-byte across every column — via triage_merchant + simulate_send", () => {
    expect(toolMerchants.length).toBe(oracleRows.length);
    toolMerchants.forEach((m, i) => {
      const oracle = oracleRows[i];
      const rec = m as unknown as Record<string, unknown>;
      for (const col of MERCHANT_COLUMNS) {
        expect(fmt(rec[col]), `${oracle.merchant_id}.${col}`).toBe(oracle[col]);
      }
    });
  });

  it("matches the golden aggregate expectations (20 / 8 high / 12 sent / 8 drafted / 0 rejected)", () => {
    expect(toolMerchants.length).toBe(20);
    expect(toolMerchants.filter((m) => m.risk_level === "High").length).toBe(8);
    expect(toolMerchants.filter((m) => m.outreach_status === "simulated_sent").length).toBe(12);
    expect(toolMerchants.filter((m) => m.outreach_status === "drafted").length).toBe(8);
    expect(toolMerchants.filter((m) => m.outreach_status === "draft_rejected").length).toBe(0);
  });

  it("sent rows carry an idempotency key; held rows do not (the send transition is the tool's, not inline)", () => {
    const sent = toolMerchants.filter((m) => m.outreach_status === "simulated_sent");
    const held = toolMerchants.filter((m) => m.outreach_status === "drafted");
    expect(sent.every((m) => m.idempotency_key.length > 0)).toBe(true);
    expect(held.every((m) => m.idempotency_key === "")).toBe(true);
  });
});

// --------------------- simulate_send idempotency on re-call (Codex A1 P2) ---------------------

describe("A1 simulate_send — idempotency key preserved on an already-sent merchant (Codex A1 P2)", () => {
  const eligible = triageMerchant.run({
    index: 1,
    row: {
      merchant_name: "Idempo Diner",
      merchant_category: "Restaurant",
      days_since_signup: 20,
      last_login_days_ago: 10,
      steps_completed: 2,
      source_risk_level: "Medium",
    },
  });

  it("first send mints a key; a SECOND call on the already-sent record preserves it (no dedup-guard wipe)", () => {
    expect(eligible.send_eligible).toBe(true); // precondition: Medium + eligible contact
    const drafted: Merchant = { ...eligible, outreach_status: "drafted", last_outreach_at: AS_OF_DATE };
    const first = simulateSend.run(drafted);
    expect(first.outreach_status).toBe("simulated_sent");
    expect(first.idempotency_key.length).toBeGreaterThan(0);
    // Re-call on the already-sent record — the key must NOT be cleared to "" (the dedup guard holds).
    const sent: Merchant = { ...drafted, outreach_status: "simulated_sent", idempotency_key: first.idempotency_key };
    const second = simulateSend.run(sent);
    expect(second.outreach_status).toBe("simulated_sent");
    expect(second.idempotency_key).toBe(first.idempotency_key);
  });
});

// ----------------------------- Class B — wrapper-identity (R-TOOL-6) -----------------------------

const hybridMerchants = runCore(getHybridMerchants(), {}, REFERENCE_PLATFORM_NAME).merchants;

describe("A1 Class B — wrapper tool.run ≡ the direct wrapped fn, over the hybrid set", () => {
  it("has a non-empty hybrid corpus (an empty corpus would make these vacuous)", () => {
    expect(hybridMerchants.length).toBeGreaterThan(0);
  });

  it("diagnose_blocker ≡ diagnose for every hybrid merchant", () => {
    for (const m of hybridMerchants) {
      expect(diagnoseBlocker.run(m)).toEqual(diagnose(m));
    }
  });

  it("check_faithfulness_forward ≡ runGatekeeper for every hybrid (merchant, mockDraft) pair", () => {
    for (const m of hybridMerchants) {
      const draft = mockDraft(m, REFERENCE_PLATFORM_NAME);
      expect(
        checkFaithfulnessForward.run({ draft, merchant: m, platformName: REFERENCE_PLATFORM_NAME }),
      ).toEqual(runGatekeeper(draft, m, REFERENCE_PLATFORM_NAME));
    }
  });

  it("check_faithfulness_reverse (mock) ≡ mockJudgeResult for every hybrid (merchant, mockDraft) pair", () => {
    for (const m of hybridMerchants) {
      const draft = mockDraft(m, REFERENCE_PLATFORM_NAME);
      expect(checkFaithfulnessReverse.run({ draft, merchant: m })).toEqual(mockJudgeResult(draft, m));
    }
  });

  it("score_quality ≡ scoreDraft for every hybrid (merchant, mockDraft) pair", () => {
    for (const m of hybridMerchants) {
      const draft = mockDraft(m, REFERENCE_PLATFORM_NAME);
      expect(
        scoreQuality.run({ draft, merchant: m, platformName: REFERENCE_PLATFORM_NAME }),
      ).toEqual(scoreDraft(draft, m, REFERENCE_PLATFORM_NAME));
    }
  });
});

// ----------------------------- append_audit — structural, order-preserving (R-TOOL-4) -----------------------------

describe("A1 append_audit — structural append (order-preserving), NOT a differential", () => {
  const e1: AuditEntry = { at: RUN_TIMESTAMP, actor: "system", action: "TRIAGE", detail: "risk triage" };
  const e2: AuditEntry = { at: RUN_TIMESTAMP, actor: "gatekeeper", action: "PASS", detail: "0 failures" };
  const e3: AuditEntry = { at: RUN_TIMESTAMP, actor: "judge", action: "DETERMINISTIC_JUDGE", detail: "all supported" };

  it("appends a single entry to an empty log", () => {
    expect(appendAudit.run({ log: [], entry: e1 })).toEqual([e1]);
  });

  it("preserves insertion order across successive appends", () => {
    const log1 = appendAudit.run({ log: [], entry: e1 });
    const log2 = appendAudit.run({ log: log1, entry: e2 });
    const log3 = appendAudit.run({ log: log2, entry: e3 });
    expect(log3).toEqual([e1, e2, e3]);
    expect(log3[0]).toEqual(e1); // first stays first
    expect(log3[log3.length - 1]).toEqual(e3); // newest is last
  });

  it("does not mutate the input log (returns a new array)", () => {
    const log0: AuditEntry[] = [];
    appendAudit.run({ log: log0, entry: e1 });
    expect(log0).toEqual([]); // unchanged
  });

  it("rejects a structurally-invalid audit entry (schema-valid only)", () => {
    const bad = { at: "now", actor: "intruder", action: "a", detail: "d" } as unknown as AuditEntry;
    expect(() => appendAudit.run({ log: [], entry: bad })).toThrow();
  });
});

// ----------------------------- registry sanity -----------------------------

describe("A1 tool registry", () => {
  it("exposes exactly the 7 A1 tools by name", () => {
    expect([...TOOL_NAMES]).toEqual([
      "triage_merchant",
      "diagnose_blocker",
      "check_faithfulness_forward",
      "check_faithfulness_reverse",
      "score_quality",
      "simulate_send",
      "append_audit",
    ]);
  });
});
