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

  // The happy-call count is DERIVED from the transcript (W3-a CP4, 2026-10-31),
  // never hand-typed: each happy call names a tool the same session listed, no
  // tool is called twice, and the listed tools the scripted session does NOT
  // call are pinned by name. That set is exactly the two S2 tools advertised in
  // W3-a CP4: the recorder (evals/mcp/record-transcript.mjs) sat outside that
  // packet, and an explain_drift call would put its required ISO `asOf` into the
  // transcript, which the no-timestamp scan above refuses — both are orchestrator
  // decisions (W3-a return packet, OPEN). Both tools are proven callable over the
  // real server in mcp-conformance.test.ts. When the recorder gains them, this
  // pin goes red and the remainder becomes [].
  // MUTATION PROOF (2026-10-31): the run_demo happy call deleted from the golden
  // → this test red ("run_demo" joins the uncalled remainder) and the byte-freeze
  // red, 2 failed / 2 passed; golden restored → 4/4.
  it("the committed transcript's session shape matches the packet: initialize -> tools/list -> one happy call per listed tool (count derived) -> 2 invalid calls", () => {
    const transcript = JSON.parse(readFileSync(golden, "utf8")) as {
      steps: ReadonlyArray<{ step: string; tools?: ReadonlyArray<{ name: string }>; request?: { name: string } }>;
    };
    const stepNames = transcript.steps.map((s) => s.step);
    expect(stepNames[0]).toBe("initialize");
    expect(stepNames[1]).toBe("tools/list");
    const listed = (transcript.steps[1].tools ?? []).map((t) => t.name);
    const called = transcript.steps.filter((s) => s.step === "tools/call").map((s) => s.request?.name ?? "");
    expect(listed.length).toBeGreaterThan(0);
    expect(new Set(called).size, "a tool is called twice in the scripted session").toBe(called.length);
    for (const name of called) expect(listed, `happy call "${name}" is not on tools/list`).toContain(name);
    expect(listed.filter((name) => !called.includes(name))).toStrictEqual(["explain_drift", "size_impact"]);
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
