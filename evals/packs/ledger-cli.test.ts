import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";

import { appendLedgerFile } from "../../lib/ledger/fs.ts";
import { hashInputs, type LedgerEntryInput } from "../../lib/ledger/index.ts";

/**
 * cli-experience (Wave 2 lane 7): `check.mjs ledger verify|checkpoint|diff` as a
 * real child process over ledgers built with lib/ledger. Mutation proofs
 * (2026-10-31, each reverted):
 *  - lib/cli/ledger.ts ledgerVerify exit code forced to 0: the tamper test went RED.
 *  - ledgerDiff `changed` section dropped: the diff test went RED.
 *  - ledgerCheckpoint printing `c.hash` only (no seq): the checkpoint test went RED.
 */

const root = process.cwd();
const cli = join(root, "bin", "check.mjs");
const dir = mkdtempSync(join(tmpdir(), "ledger-cli-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

function runCli(args: readonly string[]): { status: number; stdout: string } {
  try {
    return { status: 0, stdout: execFileSync(process.execPath, [cli, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (err) {
    const e = err as { status?: number; stdout?: string };
    return { status: e.status ?? -1, stdout: e.stdout ?? "" };
  }
}

function entry(runId: string, route: string | null, n: number): LedgerEntryInput {
  return {
    at: `2026-10-31T00:00:0${n}Z`,
    runId,
    scenarioId: "agent-86",
    inputsHash: hashInputs(`inputs-${runId}`),
    ruleVersions: { listingsSpec: "l1", feesSpec: "f1", ucpPin: "u1" },
    modelVersions: [{ seat: "intake", model: "replay" }],
    recommendations: [],
    route,
    approval: null,
  };
}

function build(name: string, routes: (string | null)[]): string {
  const p = join(dir, name);
  routes.forEach((r, i) => appendLedgerFile(p, entry(`run-${i + 1}`, r, i)));
  return p;
}

describe("ledger CLI (real process)", () => {
  const a = build("a.jsonl", ["hold", "resync", null]);

  it("verify exits 0 on an intact 3-entry ledger", () => {
    const r = runCli(["ledger", "verify", a]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("ok");
  }, 60000);

  it("checkpoint prints seq:hash, says to record it out of band, and verify accepts it", () => {
    const r = runCli(["ledger", "checkpoint", a]);
    expect(r.status).toBe(0);
    const m = /^(\d+):([0-9a-f]{64})$/m.exec(r.stdout);
    expect(m).not.toBeNull();
    expect(Number((m as RegExpExecArray)[1])).toBe(2); // seq is zero-based: the third line
    expect(r.stdout).toContain("out of band");
    expect(runCli(["ledger", "verify", a, "--checkpoint", `${(m as RegExpExecArray)[1]}:${(m as RegExpExecArray)[2]}`]).status).toBe(0);
    expect(runCli(["ledger", "verify", a, "--checkpoint", `2:${"0".repeat(64)}`]).status).toBe(1);
    expect(runCli(["ledger", "verify", a, "--checkpoint", "garbage"]).status).toBe(2);
  }, 60000);

  it("a one-byte tamper exits 1 and names the seq", () => {
    const p = join(dir, "tampered.jsonl");
    writeFileSync(p, readFileSync(a, "utf8").replace("resync", "resynd"));
    const r = runCli(["ledger", "verify", p]);
    expect(r.status).toBe(1);
    expect(r.stdout).toMatch(/failed at seq 1:/i);
    expect(runCli(["ledger", "checkpoint", p]).status).toBe(1);
  }, 60000);

  it("diff lists the changed runId, plain-language", () => {
    const b = build("b.jsonl", ["hold", "re-sync and hold", null, "new-route"]);
    const r = runCli(["ledger", "diff", a, b]);
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("changed (1)");
    expect(r.stdout).toMatch(/Run run-2 changed: route "resync" -> "re-sync and hold"/);
    expect(r.stdout).toContain("added (1)");
    expect(r.stdout).toContain("Run run-4 was added");
    expect(runCli(["ledger", "diff", a, a]).stdout).toContain("no differences");
  }, 60000);

  it("exit 2 on usage and unreadable input", () => {
    expect(runCli(["ledger"]).status).toBe(2);
    expect(runCli(["ledger", "verify"]).status).toBe(2);
    expect(runCli(["ledger", "diff", a]).status).toBe(2);
    expect(runCli(["ledger", "verify", join(dir, "missing.jsonl")]).status).toBe(2);
    expect(runCli(["ledger", "verify", a, "--bogus"]).status).toBe(2);
  }, 60000);
});
