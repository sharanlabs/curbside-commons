/**
 * S2-crew amendment — the crew → run-ledger hand-off is a pure function whose
 * output IS a lib/ledger `LedgerEntryInput` (type-checked here, where the
 * crew's import boundary does not apply) and is accepted by the ledger's own
 * pure `appendLine` + `verify`, in memory. Nothing is written to any file.
 *
 * MUTATION PROOF (recorded 2026-10-31): the root-cause DEFER entry dropped
 * from `modelVersions` → the S2 case goes RED; restored → green.
 *
 * Plain: the crew's logbook entry is checked against the notebook's own
 * rules — the shape must match and the notebook must accept and verify it.
 */
import { describe, expect, it } from "vitest";
import { appendLine, hashInputs, verify, type LedgerEntryInput } from "../../lib/ledger/index.ts";
import { toLedgerEntryInput } from "../../lib/crew/ledger-handoff.ts";
import { replayAll } from "./harness.ts";
import { replayS2 } from "./harness-s2.ts";

const RULES = { listingsSpec: "taxonomy-v1+acp-extract-2026-07-02+ucp-pin-2026-04-08", feesSpec: "uc1-rule-table-draft/2026-07-03", ucpPin: "2026-04-08" };
const META = { at: "2026-10-31T06:00:00Z", runId: "run-test-1", scenarioId: "agent-86", inputsHash: hashInputs("feed+record bytes"), ruleVersions: RULES };

describe("crew → ledger hand-off (pure)", () => {
  it("an S2 run becomes a LedgerEntryInput with the route, the replay seats and the DEFER root-cause seat", () => {
    const record = replayS2().records.get("s2-rc-agent-86")!;
    const entry: LedgerEntryInput = toLedgerEntryInput(record, META);
    expect(entry.route).toBe("merchant-ops");
    expect(entry.modelVersions).toStrictEqual([
      { seat: "intake", model: "replay" },
      { seat: "reviewer", model: "replay" },
      { seat: "root-cause", model: "DEFER" },
    ]);
    expect(entry.recommendations).toStrictEqual([
      { findingIds: [...record.recommendations[0].findingIds], recommendationClass: "flag-violations", rationale: record.recommendations[0].rationale },
    ]);
    expect(entry.approval).toBeNull();
  });

  it("a legacy run has route null and no root-cause seat; an intake-only run lists only intake", () => {
    const { records } = replayAll();
    const legacy = toLedgerEntryInput(records.get("rev-approve-violations")!, { ...META, modelId: "openai/gpt-oss-120b" });
    expect(legacy.route).toBeNull();
    expect(legacy.modelVersions).toStrictEqual([
      { seat: "intake", model: "openai/gpt-oss-120b" },
      { seat: "reviewer", model: "openai/gpt-oss-120b" },
    ]);
    const rejected = toLedgerEntryInput(records.get("int-reject-malformed")!, META);
    expect(rejected.modelVersions).toStrictEqual([{ seat: "intake", model: "replay" }]);
    expect(rejected.recommendations).toStrictEqual([]);
  });

  it("the ledger's own pure appendLine accepts two hand-offs and verify passes (in memory; no file is written)", () => {
    const s2 = replayS2().records;
    let text = appendLine("", toLedgerEntryInput(s2.get("s2-rc-agent-86")!, META));
    text = appendLine(text, toLedgerEntryInput(s2.get("s2-im-sync-outage-unowned")!, { ...META, runId: "run-test-2", scenarioId: "sync-outage" }));
    expect(text.split("\n").filter(Boolean).length).toBe(2);
    expect(verify(text).ok).toBe(true);
  });

  it("refuses an empty required string (never a silent placeholder)", () => {
    const record = replayAll().records.get("rev-approve-violations")!;
    expect(() => toLedgerEntryInput(record, { ...META, runId: "" })).toThrow(/runId/);
  });

  it("is pure: the same trajectory and meta give the same entry; the trajectory is not mutated", () => {
    const record = replayS2().records.get("s2-im-agent-86-orders")!;
    const before = JSON.stringify(record);
    expect(JSON.stringify(toLedgerEntryInput(record, META))).toBe(JSON.stringify(toLedgerEntryInput(record, META)));
    expect(JSON.stringify(record)).toBe(before);
  });
});
