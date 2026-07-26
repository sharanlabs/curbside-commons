import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * AC-4 anti-theater gate — the byte-frozen scripted-client transcript (plan
 * §5 row A1). Regenerating the transcript via `evals/mcp/record-transcript.mjs`
 * (a REAL spawned server + REAL client session, never a mock) must reproduce
 * the committed golden EXACTLY. The recorder writes to a scratch directory
 * (`--out`), never back over the tracked golden, so this test can never dirty
 * the working tree on its own.
 */

const root = process.cwd();
const recorder = join(root, "evals", "mcp", "record-transcript.mjs");
const golden = join(root, "evals", "mcp", "gold", "mcp-session.transcript.json");

describe("MCP scripted-client transcript is byte-frozen", () => {
  let scratchDir: string | undefined;

  afterEach(() => {
    if (scratchDir) {
      rmSync(scratchDir, { recursive: true, force: true });
      scratchDir = undefined;
    }
  });

  it(
    "regenerating the transcript (real spawn) reproduces the committed golden BYTE-FOR-BYTE",
    () => {
      scratchDir = mkdtempSync(join(tmpdir(), "mcp-transcript-freeze-"));
      const outPath = join(scratchDir, "mcp-session.transcript.json");
      execFileSync(process.execPath, [recorder, "--out", outPath], { encoding: "utf8" });

      const regenerated = readFileSync(outPath, "utf8");
      const committed = readFileSync(golden, "utf8");
      expect(regenerated).toBe(committed);
    },
    60_000,
  );

  it("the committed transcript contains no absolute filesystem path, no PID-shaped field, no timestamp field", () => {
    const committed = readFileSync(golden, "utf8");
    // No path containing this repo's own absolute root (proves paths are repo-relative).
    expect(committed.includes(root)).toBe(false);
    // No obvious timestamp/PID keys.
    expect(/"pid"\s*:/i.test(committed)).toBe(false);
    expect(/"timestamp"\s*:/i.test(committed)).toBe(false);
    expect(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(committed)).toBe(false);
  });

  // 7 happy calls since 2026-07-12: the E2 lookup_reference tool joined the
  // registry (pre-reg §6) and the scripted session exercises every tool once.
  it("the committed transcript's session shape matches the packet: initialize -> tools/list -> 7 happy calls -> 2 invalid calls", () => {
    const transcript = JSON.parse(readFileSync(golden, "utf8")) as {
      steps: ReadonlyArray<{ step: string }>;
    };
    const stepNames = transcript.steps.map((s) => s.step);
    expect(stepNames[0]).toBe("initialize");
    expect(stepNames[1]).toBe("tools/list");
    expect(stepNames.filter((s) => s === "tools/call")).toHaveLength(7);
    expect(stepNames.filter((s) => s === "tools/call (invalid)")).toHaveLength(2);
  });

  /**
   * PROTOCOL-REVISION DRIFT (added 2026-07-26, agentic currency pass).
   *
   * The transcript recorded `serverInfo`, `capabilities` and `instructions` but
   * NOT the negotiated protocol revision — so the single fact that most defines
   * an MCP server's currency was invisible to a byte-lock built to freeze
   * exactly this session. An SDK bump could change the negotiated revision and
   * every test would stay green.
   *
   * `2025-11-25` is the current MCP revision, verified live against the spec's
   * versioning page and the pinned SDK's `LATEST_PROTOCOL_VERSION` on
   * 2026-07-26. This assertion is deliberately EXACT: when the SDK moves, this
   * test fails, and that failure is the prompt to re-verify the spec and
   * re-record — which is the behaviour we want, not noise.
   */
  it("records the NEGOTIATED protocol revision, and it is the one we verified", () => {
    const transcript = JSON.parse(readFileSync(golden, "utf8")) as {
      steps: ReadonlyArray<{ step: string; protocolVersion?: unknown }>;
    };
    const init = transcript.steps[0];
    expect(init.step).toBe("initialize");
    expect(
      init.protocolVersion,
      "the negotiated MCP revision changed — re-verify the spec, then re-record the transcript",
    ).toBe("2025-11-25");
  });
});
