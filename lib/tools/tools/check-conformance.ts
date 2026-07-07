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
import { freezeToolResult, type ToolResult } from "../types.ts";

/** The enum this tool's `op` param is validated against — keys of {@link UCP_CATALOG_OPERATIONS}, kept in sync structurally (not hand-duplicated). */
export const CHECK_CONFORMANCE_OPS: readonly UcpCatalogOp[] = Object.keys(
  UCP_CATALOG_OPERATIONS,
) as UcpCatalogOp[];

/** Params for `check_conformance` (schema: `schemas/check_conformance.input.schema.json`). */
export interface CheckConformanceParams {
  readonly docPath: string;
  readonly op?: UcpCatalogOp;
  readonly schemaDir?: string;
}

/** Run `check_conformance`. `params` must already be ajv-validated by `callTool`. */
export function runCheckConformanceTool(params: unknown): ToolResult {
  const p = params as CheckConformanceParams;
  const result = runConformanceCheck(p.docPath, p.op ?? "search", p.schemaDir);
  return freezeToolResult({
    tool: "check_conformance",
    ok: result.exitCode === 0,
    exitCode: result.exitCode,
    canonical: result.output,
  });
}
