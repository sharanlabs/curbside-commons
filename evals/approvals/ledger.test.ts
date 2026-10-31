/**
 * S2-ledger CP1 — the run ledger (lib/ledger): chain verifies, a one-byte edit
 * names its seq, truncation past a trusted checkpoint fails, diff golden, and
 * the pure core reaches no file / network / model module.
 *
 * MUTATION PROOFS (each applied to lib/ledger/chain.ts, red observed, restored):
 *  M1  appendLine writes prevHash = GENESIS_PREV_HASH always (drop the link)
 *      -> "chain verifies" stays green only if verify ignores links; with the
 *         link check intact verify went RED at seq 1 (test "chain verifies").
 *      The inverse, verify skipping the prevHash comparison, turned
 *      "a removed middle line" GREEN-when-it-should-be-red (red proves the test bites).
 *  M2  verify skips the checkpoint block -> "truncation past the checkpoint" RED.
 *  M3  verify skips the hash recompute -> "one byte changed" RED.
 *  (exact reds are recorded in docs/returns/2026-10-31-s2-ledger.md)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  GENESIS_CHECKPOINT,
  GENESIS_PREV_HASH,
  appendLine,
  checkpoint,
  diff,
  entryHash,
  hashInputs,
  sha256Hex,
  verify,
  type LedgerEntryInput,
} from "@/lib/ledger/index.ts";
import { walkImports } from "../lib/import-walk.ts";

function input(n: number, over: Partial<LedgerEntryInput> = {}): LedgerEntryInput {
  return {
    at: `2026-10-31T00:00:0${n}Z`,
    runId: `run-${n}`,
    scenarioId: `scn-${n}`,
    inputsHash: hashInputs(`inputs-${n}`),
    ruleVersions: { listingsSpec: "L1", feesSpec: "F1", ucpPin: "U1" },
    modelVersions: [{ seat: "intake", model: "replay" }],
    recommendations: [{ kind: "fix", n }],
    route: "owner",
    approval: null,
    ...over,
  };
}

function build(count: number): string {
  let t = "";
  for (let i = 0; i < count; i++) t = appendLine(t, input(i));
  return t;
}

describe("ledger chain", () => {
  it("genesis prevHash is the sha256 of the committed constant", () => {
    expect(GENESIS_PREV_HASH).toBe(sha256Hex(GENESIS_CHECKPOINT));
    const first = JSON.parse(build(1).trim());
    expect(first.prevHash).toBe(GENESIS_PREV_HASH);
    expect(first.seq).toBe(0);
  });

  it("chain verifies (empty, one, many) and every line links to the previous hash", () => {
    expect(verify("")).toEqual({ ok: true });
    const t = build(4);
    expect(verify(t)).toEqual({ ok: true });
    const es = t.trim().split("\n").map((l) => JSON.parse(l));
    for (let i = 1; i < es.length; i++) expect(es[i].prevHash).toBe(es[i - 1].hash);
  });

  it("one byte changed in a middle entry fails, naming that seq", () => {
    const t = build(4);
    const tampered = t.replace("scn-2", "scn-9");
    expect(tampered).not.toBe(t);
    const r = verify(tampered);
    expect(r.ok).toBe(false);
    expect(r.failedAtSeq).toBe(2);
    expect(r.reason).toMatch(/rewritten/);
  });

  it("a removed middle line breaks the chain at the next surviving seq", () => {
    const lines = build(4).split("\n");
    lines.splice(1, 1);
    const r = verify(lines.join("\n"));
    expect(r.ok).toBe(false);
    expect(r.failedAtSeq).toBe(1);
  });

  it("a rewritten entry with a RECOMPUTED hash still breaks the NEXT link", () => {
    const lines = build(3).trim().split("\n");
    const e = JSON.parse(lines[1]);
    e.route = "attacker";
    const { hash: _old, ...rest } = e;
    void _old;
    lines[1] = JSON.stringify({ ...rest, hash: entryHash(rest) }); // self-consistent forgery of seq 1
    const r = verify(lines.join("\n") + "\n");
    expect(r.ok).toBe(false);
    expect(r.failedAtSeq).toBe(2);
    expect(r.reason).toMatch(/broken link/);
  });

  it("a partial last line (no trailing newline) fails", () => {
    const t = build(2).slice(0, -1);
    expect(verify(t).ok).toBe(false);
    expect(() => appendLine(t, input(5))).toThrow(/newline/);
  });

  it("truncation PAST the checkpoint fails; without a checkpoint it is undetectable (stated limit)", () => {
    const t = build(5);
    const cp = checkpoint(t);
    expect(cp.seq).toBe(4);
    expect(verify(t, cp)).toEqual({ ok: true });
    const cut = t.split("\n").slice(0, 3).join("\n") + "\n"; // keeps seq 0..2
    expect(verify(cut)).toEqual({ ok: true }); // the honest limit: chain alone cannot see the cut
    const r = verify(cut, cp);
    expect(r.ok).toBe(false);
    expect(r.failedAtSeq).toBe(4);
    expect(r.reason).toMatch(/truncated/);
  });

  it("truncation exactly AT the checkpoint line (ledger ends one before it) fails; later appends still verify", () => {
    const t = build(4);
    const cp = checkpoint(build(3)); // seq 2
    expect(verify(t, cp)).toEqual({ ok: true }); // longer than the checkpoint: fine
    expect(verify(build(2), cp).ok).toBe(false);
    expect(() => checkpoint("")).toThrow(/empty/);
    expect(verify("", cp).ok).toBe(false);
  });

  it("a wholesale rewrite (fully self-consistent) is caught only by the checkpoint", () => {
    const real = build(3);
    const cp = checkpoint(real);
    let forged = "";
    for (let i = 0; i < 3; i++) forged = appendLine(forged, input(i, { route: "attacker" }));
    expect(verify(forged)).toEqual({ ok: true });
    const r = verify(forged, cp);
    expect(r.ok).toBe(false);
    expect(r.failedAtSeq).toBe(2);
    expect(r.reason).toMatch(/rewritten/);
  });

  it("appendLine validates its input loudly and never reads a clock", () => {
    expect(() => appendLine("", input(1, { at: "" }))).toThrow(/at/);
    expect(() => appendLine("", { ...input(1), modelVersions: [{ seat: "x" } as never] })).toThrow(/seat and model/);
    expect(() => appendLine("", input(1, { approval: { signerId: "s" } as never }))).toThrow(/approval/);
    expect(() => appendLine("garbage\n", input(1))).toThrow(/not valid JSON/);
    const src = readFileSync(join(process.cwd(), "lib/ledger/chain.ts"), "utf8");
    expect(/Date\.now|new Date\(|performance\.now/.test(src)).toBe(false);
  });

  it("approval, DEFER and replay model ids are carried verbatim", () => {
    const t = appendLine("", input(1, {
      modelVersions: [{ seat: "a", model: "DEFER" }, { seat: "b", model: "replay" }],
      approval: { signerId: "owner-1", decision: "approve", requestId: "apr-x" },
    }));
    const e = JSON.parse(t.trim());
    expect(e.approval).toEqual({ signerId: "owner-1", decision: "approve", requestId: "apr-x" });
    expect(e.modelVersions.map((m: { model: string }) => m.model)).toEqual(["DEFER", "replay"]);
  });
});

describe("ledger diff", () => {
  it("golden: added / removed / changed by runId, one plain line each; bookkeeping never counts", () => {
    let a = "";
    a = appendLine(a, input(1));
    a = appendLine(a, input(2));
    a = appendLine(a, input(3));
    let b = "";
    b = appendLine(b, { ...input(1), at: "2030-01-01T00:00:00Z" }); // only `at` differs -> unchanged
    b = appendLine(b, input(2, { route: "reviewer", approval: { signerId: "o", decision: "approve", requestId: "r" } }));
    b = appendLine(b, input(4));
    expect(diff(a, b)).toEqual({
      added: [{ runId: "run-4", line: 'Run run-4 was added (scenario "scn-4", route "owner").' }],
      removed: [{ runId: "run-3", line: "Run run-3 is missing from the newer ledger." }],
      changed: [
        {
          runId: "run-2",
          line: 'Run run-2 changed: route "owner" -> "reviewer"; approval none -> {"decision":"approve","requestId":"r","signerId":"o"}.',
        },
      ],
    });
    expect(diff(a, a)).toEqual({ added: [], removed: [], changed: [] });
  });

  it("compares the LATEST line of a run that has several", () => {
    const a = appendLine(appendLine("", input(1)), input(1, { route: "x" }));
    const b = appendLine("", input(1, { route: "x" }));
    expect(diff(a, b).changed).toEqual([]);
  });
});

describe("ledger egress tooth", () => {
  const root = process.cwd();
  it("the pure core (lib/ledger/index.ts) reaches no network / model / file module", () => {
    const { violations, seen } = walkImports(join(root, "lib/ledger/index.ts"), { root });
    expect(seen.size).toBeGreaterThan(2);
    expect([...seen].some((f) => f.endsWith("lib/ledger/chain.ts"))).toBe(true);
    expect([...seen].some((f) => f.endsWith("lib/ledger/fs.ts"))).toBe(false);
    expect(violations).toEqual([]);
    for (const f of seen) {
      const text = readFileSync(f, "utf8");
      expect(/node:fs|node:https?|undici|@ai-sdk|from\s+["']ai["']/.test(text), `egress/file import in ${f}`).toBe(false);
    }
  });
  it("lib/ledger/fs.ts is the only ledger file that imports node:fs", () => {
    for (const f of ["chain.ts", "diff.ts", "index.ts"]) {
      expect(readFileSync(join(root, "lib/ledger", f), "utf8")).not.toMatch(/node:fs/);
    }
    expect(readFileSync(join(root, "lib/ledger/fs.ts"), "utf8")).toMatch(/node:fs/);
  });
});
