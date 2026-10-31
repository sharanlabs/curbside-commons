/**
 * S2-ledger CP4 — ledger -> eval-candidate stubs.
 * MUTATION PROOF (2026-10-31): `candidatesFromLedger` skipping its `verify` gate
 * -> RED on "refuses a tampered ledger"; restored -> GREEN.
 */
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { appendLine, candidatesFromLedger, hashInputs, type LedgerEntryInput } from "@/lib/ledger/index.ts";
import { emitCandidates } from "../../scripts-ts/ledger-to-eval-candidates.mts";

const base = (n: number, decision: string | null): LedgerEntryInput => ({
  at: `2026-10-31T00:00:0${n}Z`,
  runId: `run-${n}`,
  scenarioId: `scn-${n}`,
  inputsHash: hashInputs(`i${n}`),
  ruleVersions: { listingsSpec: "L", feesSpec: "F", ucpPin: "U" },
  modelVersions: [{ seat: "s", model: "replay" }],
  recommendations: [{ n }],
  route: "owner",
  approval: decision === null ? null : { signerId: "o", decision, requestId: `apr-${n}` },
});

function ledger(): string {
  let t = "";
  [null, "approve", "reject", "withdrawn", "expired", "weird"].forEach((d, i) => (t = appendLine(t, base(i, d))));
  return t;
}

describe("ledger -> eval candidates", () => {
  it("emits one stub per signed / withdrawn / expired line into a NEW folder, and refuses an existing one", () => {
    const dir = mkdtempSync(join(tmpdir(), "ledger-cand-"));
    const lp = join(dir, "ledger.jsonl");
    writeFileSync(lp, ledger());
    const out = join(dir, "split-new");
    const files = emitCandidates(lp, out);
    expect(files.length).toBe(4);
    expect(readdirSync(out).sort()).toEqual([
      "run-1-seq1.candidate.json", "run-2-seq2.candidate.json", "run-3-seq3.candidate.json", "run-4-seq4.candidate.json",
    ]);
    const stubs = files.map((f) => JSON.parse(readFileSync(f, "utf8")));
    expect(stubs.map((s) => s.disposition)).toEqual(["signed", "signed", "withdrawn", "expired"]);
    expect(stubs[0]).toMatchObject({ candidate: true, source: { runId: "run-1", seq: 1, inputsHash: hashInputs("i1") } });
    expect(stubs[0].status).toMatch(/STUB/);
    expect(existsSync(out)).toBe(true);
    expect(() => emitCandidates(lp, out)).toThrow(/existing folder/);
  });

  it("refuses a tampered ledger", () => {
    const bad = ledger().replace("scn-2", "scn-X");
    expect(() => candidatesFromLedger(bad)).toThrow(/does not verify/);
  });
});
