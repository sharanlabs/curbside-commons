import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { callTool } from "@/lib/tools/registry.ts";

/**
 * Envelope goldens — one representative committed `ToolResult` per tool,
 * byte-frozen (plan §5 row A0: "goldens byte-frozen"). Regenerate ONLY via a
 * deliberate, reviewed regen (never hand-edited) — a freeze break here means
 * either a real intended change (regen + review) or a real regression.
 */

const root = process.cwd();
const goldDir = join(root, "evals", "tools", "gold");
const fixtures = join(root, "fixtures", "synthetic-restaurant");
const fees = join(fixtures, "fees");
const ucp = join(root, "fixtures", "ucp-conformance-ci");

function readGolden(name: string): string {
  return readFileSync(join(goldDir, `${name}.golden.json`), "utf8");
}

describe("envelope goldens — byte-frozen, one representative call per tool", () => {
  it("check_feed golden is byte-identical", () => {
    const result = callTool("check_feed", {
      feedPath: join(fixtures, "acp-feed.drifted.json"),
      catalogPath: join(fixtures, "sor.catalog.json"),
      surface: "acp",
    });
    expect(`${JSON.stringify(result, null, 2)}\n`).toBe(readGolden("check_feed"));
  });

  it("check_conformance golden is byte-identical", () => {
    const result = callTool("check_conformance", {
      docPath: join(ucp, "valid", "search-full-catalog.json"),
      op: "search",
    });
    expect(`${JSON.stringify(result, null, 2)}\n`).toBe(readGolden("check_conformance"));
  });

  it("audit_statement golden is byte-identical", () => {
    const result = callTool("audit_statement", {
      statementPath: join(fees, "statement.drifted.json"),
    });
    expect(`${JSON.stringify(result, null, 2)}\n`).toBe(readGolden("audit_statement"));
  });

  it("classify_and_audit golden is byte-identical", () => {
    const result = callTool("classify_and_audit", {
      statementPath: join(fees, "statement.drifted.json"),
    });
    expect(`${JSON.stringify(result, null, 2)}\n`).toBe(readGolden("classify_and_audit"));
  });

  it("get_rule golden is byte-identical", () => {
    const result = callTool("get_rule", { ruleId: "NYC-563.3-a-1" });
    expect(`${JSON.stringify(result, null, 2)}\n`).toBe(readGolden("get_rule"));
  });

  it("run_demo golden is byte-identical", () => {
    const result = callTool("run_demo", { format: "json" });
    expect(`${JSON.stringify(result, null, 2)}\n`).toBe(readGolden("run_demo"));
  });
});
