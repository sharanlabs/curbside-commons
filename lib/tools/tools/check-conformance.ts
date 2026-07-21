/**
 * `check_conformance` — the A0 tool wrapping the UCP conformance leg,
 * `runConformanceCheck` (`lib/packs/listings/cli.ts`), UNCHANGED (plan §3,
 * §5 row A0).
 *
 * Validates a UCP catalog-response document against the pinned published UCP
 * schemas — is it correctly SHAPED, the separate question from `check_feed`'s
 * "is it TRUE". Canonical = `runConformanceCheck(...).output`, the same
 * `serializeReport(report)` the CLI's conformance leg already prints.
 *
 * Plain: point this tool at a UCP-shaped document and it tells you whether
 * that document follows the official rulebook for what such a document must
 * look like — same answer the command-line "--conformance" flag gives.
 */
import { runConformanceCheck } from "../../packs/listings/cli.ts";
import { UCP_CATALOG_OPERATIONS, type UcpCatalogOp } from "../../packs/listings/conformance.ts";
import { resolveInAllowedRoot } from "../paths.ts";
import { freezeToolResult, type ToolResult } from "../types.ts";

/** The enum this tool's `op` param is validated against — keys of {@link UCP_CATALOG_OPERATIONS}, kept in sync structurally (not hand-duplicated). */
export const CHECK_CONFORMANCE_OPS: readonly UcpCatalogOp[] = Object.keys(
  UCP_CATALOG_OPERATIONS,
) as UcpCatalogOp[];

/** Params for `check_conformance` (schema: `schemas/check_conformance.input.schema.json`). */
export interface CheckConformanceParams {
  readonly docPath: string;
  readonly op?: UcpCatalogOp;
}

/** Run `check_conformance`. `params` must already be ajv-validated by `callTool`. */
export function runCheckConformanceTool(params: unknown): ToolResult {
  const p = params as CheckConformanceParams;
  // `docPath` is contained BEFORE the read (security review 2026-07-21). The
  // caller-settable `schemaDir` was REMOVED from this tool's input schema
  // (sol run-1/run-2 recommendation, owner-approved): no MCP caller used it,
  // and a caller-directed schema directory is a directory-walk / enumeration /
  // DoS surface (`walkJson`) — surface elimination beats containment. The
  // pinned in-repo `DEFAULT_UCP_SCHEMA_DIR` is always used now; the CLI
  // (`runConformanceCheck`) keeps its own `schemaDir` arg for trusted local use.
  const result = runConformanceCheck(resolveInAllowedRoot(p.docPath, "docPath"), p.op ?? "search");
  return freezeToolResult({
    tool: "check_conformance",
    ok: result.exitCode === 0,
    exitCode: result.exitCode,
    canonical: result.output,
  });
}
