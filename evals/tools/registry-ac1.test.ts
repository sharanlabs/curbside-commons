import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertDecisionGrade,
  callTool,
  outputValidatorFor,
  TOOLS,
  ToolInputError,
  ToolNotFoundError,
  RuleNotFoundError,
} from "@/lib/tools/registry.ts";

/**
 * AC-1 — the registry contract (plan §5 row A0, §4 AC-1): every tool has a
 * committed input AND output JSON Schema; invalid input fails LOUD with a
 * typed error carrying the ajv errors; a valid call's envelope validates
 * against the tool's own committed output schema. Plus: an unregistered tool
 * name fails loud with a typed {@link ToolNotFoundError}.
 */

const root = process.cwd();
const fixtures = join(root, "fixtures", "synthetic-restaurant");
const fees = join(fixtures, "fees");
const ucp = join(root, "fixtures", "ucp-conformance-ci");

function expectValidEnvelope(toolName: string, result: unknown): void {
  const validate = outputValidatorFor(toolName);
  expect(validate, `no compiled output validator for "${toolName}"`).toBeDefined();
  const ok = validate!(result);
  expect(ok, `envelope failed its own output schema: ${JSON.stringify(validate!.errors)}`).toBe(
    true,
  );
}

describe("AC-1 registry contract — every tool", () => {
  it("all seven tools are registered under their exact names (six plan §3 engine tools + the E2 §6 lookup_reference)", () => {
    expect([...TOOLS.keys()].sort()).toStrictEqual(
      [
        "audit_statement",
        "check_conformance",
        "check_feed",
        "classify_and_audit",
        "get_rule",
        "lookup_reference",
        "run_demo",
      ].sort(),
    );
  });

  it("the public registry view is metadata-only — no tool exposes a runnable bypass of callTool (Codex A0 finding 1)", () => {
    for (const [name, meta] of TOOLS) {
      expect(
        (meta as unknown as Record<string, unknown>).run,
        `tool "${name}" leaks a run function on the public view`,
      ).toBeUndefined();
      expect(Object.isFrozen(meta), `tool "${name}" metadata is not frozen`).toBe(true);
    }
  });

  it("assertDecisionGrade: rejects demoOnly and advisory envelopes, passes decision-grade ones (Codex A0 finding 4)", () => {
    const demo = callTool("run_demo", {});
    expect(() => assertDecisionGrade(demo)).toThrow(/never an audit result/);
    const advisory = callTool("classify_and_audit", {
      statementPath: join(fees, "statement.faithful.json"),
    });
    expect(() => assertDecisionGrade(advisory)).toThrow(/never a verdict/);
    const decision = callTool("audit_statement", {
      statementPath: join(fees, "statement.faithful.json"),
    });
    expect(assertDecisionGrade(decision)).toBe(decision);
  });

  describe("check_feed", () => {
    const valid = {
      feedPath: join(fixtures, "acp-feed.faithful.json"),
      catalogPath: join(fixtures, "sor.catalog.json"),
      surface: "acp",
    };

    it("happy case: valid input runs + envelope validates", () => {
      const result = callTool("check_feed", valid);
      expect(result.tool).toBe("check_feed");
      expect(result.exitCode).toBe(0);
      expect(result.ok).toBe(true);
      expectValidEnvelope("check_feed", result);
    });

    it("invalid input (bad surface enum) -> typed ToolInputError with ajv errors attached", () => {
      expect(() => callTool("check_feed", { ...valid, surface: "carrier-pigeon" })).toThrow(
        ToolInputError,
      );
      try {
        callTool("check_feed", { ...valid, surface: "carrier-pigeon" });
        expect.unreachable();
      } catch (err) {
        expect(err).toBeInstanceOf(ToolInputError);
        const e = err as ToolInputError;
        expect(e.tool).toBe("check_feed");
        expect(e.ajvErrors.length).toBeGreaterThan(0);
      }
    });

    it("invalid input (missing required field) -> typed ToolInputError", () => {
      const missing = { feedPath: valid.feedPath, surface: valid.surface };
      expect(() => callTool("check_feed", missing)).toThrow(ToolInputError);
    });

    it("invalid input (unknown extra field) -> typed ToolInputError (additionalProperties:false)", () => {
      expect(() => callTool("check_feed", { ...valid, bogus: true })).toThrow(ToolInputError);
    });
  });

  describe("check_conformance", () => {
    const valid = { docPath: join(ucp, "valid", "search-full-catalog.json") };

    it("happy case: valid input runs + envelope validates", () => {
      const result = callTool("check_conformance", valid);
      expect(result.tool).toBe("check_conformance");
      expect(result.exitCode).toBe(0);
      expectValidEnvelope("check_conformance", result);
    });

    it("invalid input (bad op enum) -> typed ToolInputError", () => {
      expect(() => callTool("check_conformance", { ...valid, op: "bogus" })).toThrow(
        ToolInputError,
      );
    });
  });

  describe("audit_statement", () => {
    const valid = { statementPath: join(fees, "statement.faithful.json") };

    it("happy case: valid input runs + envelope validates", () => {
      const result = callTool("audit_statement", valid);
      expect(result.tool).toBe("audit_statement");
      expect(result.exitCode).toBe(0);
      expect(result.ok).toBe(true);
      expectValidEnvelope("audit_statement", result);
    });

    it("invalid input (missing statementPath) -> typed ToolInputError", () => {
      expect(() => callTool("audit_statement", {})).toThrow(ToolInputError);
    });

    it("invalid input (non-string statementPath) -> typed ToolInputError", () => {
      expect(() => callTool("audit_statement", { statementPath: 42 })).toThrow(ToolInputError);
    });
  });

  describe("classify_and_audit", () => {
    const valid = { statementPath: join(fees, "statement.drifted.json") };

    it("happy case: valid input runs + envelope validates (advisory:true, earnsLabel:false surfaced verbatim)", () => {
      const result = callTool("classify_and_audit", valid);
      expect(result.tool).toBe("classify_and_audit");
      expect(result.advisory).toBe(true);
      expect(result.earnsLabel).toBe(false);
      expectValidEnvelope("classify_and_audit", result);
    });

    it("invalid input (missing statementPath) -> typed ToolInputError", () => {
      expect(() => callTool("classify_and_audit", {})).toThrow(ToolInputError);
    });
  });

  describe("get_rule", () => {
    it("happy case (no ruleId -> all rules): runs + envelope validates", () => {
      const result = callTool("get_rule", {});
      expect(result.tool).toBe("get_rule");
      expect(result.exitCode).toBe(0);
      expectValidEnvelope("get_rule", result);
    });

    it("happy case (known ruleId): runs + envelope validates", () => {
      const result = callTool("get_rule", { ruleId: "NYC-563.3-a-1" });
      expectValidEnvelope("get_rule", result);
    });

    it("happy case (non-statement-checkable ruleId): runs + envelope validates", () => {
      const result = callTool("get_rule", { ruleId: "NYC-563.3-a-3" });
      expectValidEnvelope("get_rule", result);
      expect(result.canonical).toContain("nonStatementCheckable");
    });

    it("invalid input (non-string ruleId) -> typed ToolInputError", () => {
      expect(() => callTool("get_rule", { ruleId: 123 })).toThrow(ToolInputError);
    });

    it("unknown ruleId (schema-valid, domain-invalid) -> typed loud RuleNotFoundError, never a silent/fake answer", () => {
      expect(() => callTool("get_rule", { ruleId: "NYC-DOES-NOT-EXIST" })).toThrow(
        RuleNotFoundError,
      );
    });
  });

  describe("run_demo", () => {
    it("happy case (default format=json): runs + envelope validates + demoOnly:true", () => {
      const result = callTool("run_demo", {});
      expect(result.tool).toBe("run_demo");
      expect(result.demoOnly).toBe(true);
      expect(result.exitCode).toBe(0);
      expectValidEnvelope("run_demo", result);
    });

    it("happy case (format=text): runs + envelope validates", () => {
      const result = callTool("run_demo", { format: "text" });
      expectValidEnvelope("run_demo", result);
    });

    it("invalid input (bad format enum) -> typed ToolInputError", () => {
      expect(() => callTool("run_demo", { format: "xml" })).toThrow(ToolInputError);
    });
  });

  describe("unknown tool", () => {
    it("callTool with an unregistered name -> typed loud ToolNotFoundError", () => {
      expect(() => callTool("does_not_exist", {})).toThrow(ToolNotFoundError);
    });
  });
});
