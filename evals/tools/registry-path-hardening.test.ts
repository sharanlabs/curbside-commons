/**
 * Security review 2026-10-31 (docs/reviews/security-privacy-legal-2026-10-31.md)
 * F2 · F5 · F8 — the registry's path guard and the MCP error surface:
 *  - F2: a tool can read only under fixtures/, evals/ or the OS temp dir —
 *    never `.env.example`, `.git/HEAD`, or any hidden (dot) segment — and the
 *    refusal text never echoes the caller's path or an absolute path; the MCP
 *    server returns FIXED text for every engine error (no file bytes, no home
 *    path, no existence oracle);
 *  - F5: one shared 5 MB cap, checked before any read;
 *  - F8: the crew reads a case artifact through the same guard.
 *
 * MUTATION PROOF (recorded 2026-10-31):
 *  - M1: ALLOWED_ROOTS widened back to the repo root AND the dot-segment rule
 *    disabled (the pre-fix guard) → 7 RED (every refusal row, the crew F8 row,
 *    the MCP refusal row); restored → 11/11 green.
 *  - M2: the MCP server's fixed-text mapping reverted to `err.message` → 1 RED
 *    (the engine-error row: the parser's message comes back); restored → green.
 *
 * Plain: the tools can only open files in the two input folders (or a scratch
 * folder), never the secrets file or git's own files, and when something goes
 * wrong the outside world is told which tool failed and why in general — not
 * what the file said or where it lives on this machine.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { CrewModel } from "@/lib/crew/model.ts";
import { runCase } from "@/lib/crew/orchestrator.ts";
import type { CrewCase } from "@/lib/crew/types.ts";
import { callTool, MAX_TOOL_FILE_BYTES, ToolPathError } from "@/lib/tools/registry.ts";
import { connectMcpClient, MCP_TEST_TIMEOUT_MS } from "../mcp/harness.ts";

const root = process.cwd();

function refusal(fn: () => unknown): ToolPathError {
  try {
    fn();
  } catch (err) {
    expect(err).toBeInstanceOf(ToolPathError);
    return err as ToolPathError;
  }
  throw new Error("expected a ToolPathError, got a successful read");
}

describe("F2 — the path guard admits fixtures/, evals/ and temp only; no dot segment; no echo", () => {
  const secrets: ReadonlyArray<readonly [string, string]> = [
    [".env.example", "the repo-root env template"],
    [".git/HEAD", "git's own files (a file or a dir in a worktree)"],
    ["fixtures/.hidden-notes.json", "a hidden segment inside an allowed root (even when the file does not exist)"],
    ["evals/crew/../../.env.example", "a ..-climb out of evals/"],
    ["lib/tools/paths.ts", "source code outside the input folders"],
  ];
  for (const [path, why] of secrets) {
    it(`refused: ${path} (${why}) — fixed text, no echo of the path or an absolute path`, () => {
      const err = refusal(() => callTool("audit_statement", { statementPath: path }));
      expect(err.message).toContain("escapes the allowed root");
      expect(err.message).toContain("statementPath");
      expect(err.message).not.toContain(path);
      expect(err.message).not.toContain(root);
    });
  }

  it("a fixtures path still works (and an evals fixture path)", () => {
    expect(callTool("audit_statement", { statementPath: "fixtures/synthetic-restaurant/fees/statement.faithful.json" }).exitCode).toBe(0);
    expect(() => callTool("audit_statement", { statementPath: "evals/crew/fixtures/statement.injection.json" })).not.toThrow(ToolPathError);
  });
});

describe("F5 — one shared size cap before any read", () => {
  let dir: string;
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), "path-cap-"));
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it(`a file over ${MAX_TOOL_FILE_BYTES} bytes is refused before it is read; one at the cap is admitted to the tool`, () => {
    const big = join(dir, "big.json");
    writeFileSync(big, " ".repeat(MAX_TOOL_FILE_BYTES + 1));
    const err = refusal(() => callTool("audit_statement", { statementPath: big }));
    expect(err.message).toMatch(/larger than the 5242880-byte cap/);
    const atCap = join(dir, "at-cap.json");
    writeFileSync(atCap, " ".repeat(MAX_TOOL_FILE_BYTES));
    // admitted by the guard; the statement parser then fails on its own terms
    expect(() => callTool("audit_statement", { statementPath: atCap })).not.toThrow(ToolPathError);
  });
});

describe("F8 — the crew reads a case artifact through the same guard", () => {
  it("a case pointing at .env.example is refused before any model turn", () => {
    let turns = 0;
    const model: CrewModel = {
      intakeTurn: () => {
        turns += 1;
        return { kind: "reject", reason: "unused" };
      },
      reviewerTurn: () => {
        turns += 1;
        return { kind: "approve" };
      },
    };
    const c: CrewCase = {
      caseId: "f8-env-probe",
      member: "intake",
      inputArtifact: { path: ".env.example" },
      ask: "Check this.",
      allowedTools: ["audit_statement"],
      forbiddenTools: [],
      expectedToolCalls: [],
      expectedEngineReportHash: null,
      expectedRecommendationClass: "none-escalated",
      expectedFindingRefs: [],
      expectedGateState: "escalate-to-human",
    };
    expect(() => runCase(c, model)).toThrow(ToolPathError);
    expect(turns).toBe(0);
  });
});

describe("F2 — the MCP surface returns fixed text for refusals and engine errors (real spawned server)", () => {
  let client: Client;
  let close: () => Promise<void>;
  beforeAll(async () => {
    const conn = await connectMcpClient();
    client = conn.client;
    close = conn.close;
  }, MCP_TEST_TIMEOUT_MS);
  afterAll(async () => {
    await close();
  }, MCP_TEST_TIMEOUT_MS);

  const textOf = (r: unknown): string => ((r as { content: Array<{ text?: string }> }).content[0]?.text ?? "");

  it(
    "a refused .env.example read says which parameter, never the path",
    async () => {
      const r = await client.callTool({ name: "audit_statement", arguments: { statementPath: ".env.example" } });
      expect(r.isError).toBe(true);
      expect(textOf(r)).toBe('tool "audit_statement": path "statementPath" escapes the allowed root — refused (the path is not echoed)');
    },
    MCP_TEST_TIMEOUT_MS,
  );

  it(
    "engine error text is fixed: a non-JSON in-root file yields the error class only — no file bytes, no absolute path",
    async () => {
      const r = await client.callTool({ name: "audit_statement", arguments: { statementPath: "evals/crew/fixtures/garbage.txt" } });
      expect(r.isError).toBe(true);
      const text = textOf(r);
      expect(text).toMatch(/^tool "audit_statement": the tool could not run \([A-Za-z]+\); details are withheld on this surface$/);
      expect(text).not.toContain(root);
      expect(text).not.toContain("garbage");
    },
    MCP_TEST_TIMEOUT_MS,
  );

  it(
    "a registered-but-unadvertised tool (explain_drift) is refused over MCP like an unregistered one",
    async () => {
      const r = await client.callTool({ name: "explain_drift", arguments: { findings: [], events: [], asOf: "2026-07-03T00:00:00Z" } });
      expect(r.isError).toBe(true);
      expect(textOf(r)).toContain('unknown tool "explain_drift"');
    },
    MCP_TEST_TIMEOUT_MS,
  );
});
