/**
 * `check_feed` — the A0 tool wrapping the listings truth leg, `runCheck`
 * (`lib/packs/listings/cli.ts`), UNCHANGED (plan §3, §5 row A0).
 *
 * Reads a serving-copy feed (ACP or UCP) and compares it against the SOR
 * catalog, exactly as the CLI does. Canonical = `runCheck(...).output`, which
 * IS `serializeReport(report)` — the same named serializer the CLI's
 * machine-JSON leg already uses (W3), so the differential test compares this
 * tool's canonical against a direct `runCheck` call byte-for-byte (AC-2).
 * `exitCode` passes through 0/1 verbatim; runtime failures (unreadable JSON,
 * a catalog file that isn't a catalog SOR) are the engine's own plain
 * `Error` — this file does not catch or reshape them (never swallowed).
 *
 * Plain: point this tool at a menu-feed file and the restaurant's real
 * catalog file, say which format the feed is in, and it hands back the exact
 * same truth-check report the command-line tool would print.
 */
import { runCheck, type CliSurface } from "../../packs/listings/cli.ts";
import { freezeToolResult, type ToolResult } from "../types.ts";

/** Params for `check_feed` (schema: `schemas/check_feed.input.schema.json`). */
export interface CheckFeedParams {
  readonly feedPath: string;
  readonly catalogPath: string;
  readonly surface: CliSurface;
}

/** Run `check_feed`. `params` must already be ajv-validated by `callTool`. */
export function runCheckFeedTool(params: unknown): ToolResult {
  const p = params as CheckFeedParams;
  const result = runCheck(p.feedPath, p.catalogPath, p.surface);
  return freezeToolResult({
    tool: "check_feed",
    ok: result.exitCode === 0,
    exitCode: result.exitCode,
    canonical: result.output,
  });
}
