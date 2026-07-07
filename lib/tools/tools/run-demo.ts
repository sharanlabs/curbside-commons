/**
 * `run_demo` — the A0 tool wrapping the scripted demo leg, `runDemo`
 * (`lib/packs/listings/cli.ts`), UNCHANGED (plan §3, §5 row A0, Codex
 * amendment 7).
 *
 * The envelope carries `demoOnly: true` ALWAYS — agents, MCP clients, and the
 * n8n lane must never treat this output as an audit result; the registry
 * enforces the flag structurally rather than trusting a caller to remember
 * it. `exitCode` is always `0` (the demo is a walkthrough, never a pass/fail
 * gate — same as the CLI leg it wraps). Canonical = `runDemo(...).output`
 * (the plain-text render or the machine transcript JSON, per `format`).
 *
 * Default `format` is `"json"` for this tool (the registry's machine-JSON-first
 * convention) — a DELIBERATE divergence from the CLI's own text-first default,
 * since a tool-registry caller is a program, not a terminal (escalation
 * recorded in the slice record).
 *
 * Plain: runs the scripted "here's how the checker catches a lie" walkthrough
 * and hands back its narration — loudly labeled as a demo, never mistakable
 * for a real audit result.
 */
import { runDemo } from "../../packs/listings/cli.ts";
import { freezeToolResult, type ToolResult } from "../types.ts";

/** Params for `run_demo` (schema: `schemas/run_demo.input.schema.json`). */
export interface RunDemoParams {
  readonly format?: "text" | "json";
}

/** Run `run_demo`. `params` must already be ajv-validated by `callTool`. */
export function runRunDemoTool(params: unknown): ToolResult {
  const p = params as RunDemoParams;
  const format = p.format ?? "json";
  const result = runDemo({ json: format === "json" });
  return freezeToolResult({
    tool: "run_demo",
    ok: true,
    exitCode: result.exitCode,
    demoOnly: true,
    canonical: result.output,
  });
}
