/**
 * CLI entry logic for the listings wedge — W1 (C1: one-command validator).
 *
 * Loaded by bin/check.mjs via Node's native TypeScript type-stripping (Node ≥ 24;
 * this repo runs v24). Reads the serving copy + the SOR catalog from disk, picks
 * the surface adapter, runs the deterministic verification, and returns the
 * report plus the exit code (non-zero iff findings exist — CI-usable). This path
 * makes ZERO LLM/network calls; the $0 property is enforced by an import-graph
 * eval, not just promised.
 *
 * Plain: the brain behind the `check` command — read the two files, compare,
 * print the receipts, and fail the build if the copy lies.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { VerifierReport } from "../../verifier-core/index.ts";
import { serializeReport } from "../../verifier-core/verify.ts";
import type { AcpFeed } from "./acp-feed.ts";
import { acpFeedToClaims, ucpResponseToClaims } from "./adapters.ts";
import { runUcpConformance, type UcpCatalogOp } from "./conformance.ts";
import { runListingsVerification } from "./run.ts";
import type { SyntheticCatalog } from "./types.ts";
import type { UcpCatalogResponseFixture } from "./ucp.ts";
import type { UcpSearchResponse } from "./ucp-wire.ts";
import { buildDemoTranscript, renderDemoText } from "./demo/index.ts";

export type CliSurface = "acp" | "ucp";

export interface CliResult {
  readonly report: VerifierReport;
  readonly output: string;
  /** 0 = clean, 1 = findings present (C1: non-zero on any drift). */
  readonly exitCode: 0 | 1;
}

/** Run one check. Throws on unreadable/invalid input (bin maps that to exit 2). */
export function runCheck(
  feedPath: string,
  catalogPath: string,
  surface: CliSurface,
): CliResult {
  const sor = JSON.parse(readFileSync(catalogPath, "utf8")) as SyntheticCatalog;
  if (!Array.isArray(sor.items)) {
    throw new Error(`--against file does not look like a catalog SOR: ${catalogPath}`);
  }
  const raw = JSON.parse(readFileSync(feedPath, "utf8")) as unknown;
  const claims =
    surface === "acp"
      ? acpFeedToClaims(raw as AcpFeed)
      : ucpResponseToClaims(raw as UcpCatalogResponseFixture);
  const report = runListingsVerification(claims, sor);
  return {
    report,
    output: serializeReport(report),
    exitCode: report.ok ? 0 : 1,
  };
}

/**
 * Run the UCP CONFORMANCE leg (W2): validate a UCP catalog-response document
 * against the pinned published UCP schemas (conformance.ts). This is the
 * SEPARATE second question — is the document spec-SHAPED — and it needs no SOR
 * (`--against`): the reference is the schema, not the merchant catalog. Findings
 * are the `LST-CONF-*` family. Zero LLM / network; reads pinned schemas from disk.
 */
export function runConformanceCheck(
  docPath: string,
  op: UcpCatalogOp = "search",
  schemaDir?: string,
): CliResult {
  const doc = JSON.parse(readFileSync(docPath, "utf8")) as unknown;
  const report = runUcpConformance(doc, { op, schemaDir });
  return { report, output: serializeReport(report), exitCode: report.ok ? 0 : 1 };
}

/** Result of the demo leg — a scripted narration, not a gate (always exit 0). */
export interface DemoCliResult {
  readonly output: string;
  /** Demo is always exit 0: it is a walkthrough, not a pass/fail check. */
  readonly exitCode: 0;
}

/**
 * Run the DEMO leg (D1): read the shipped drifted feed, the SOR, and the
 * conformant-but-false UCP document from the corpus (zero-config), build the
 * deterministic transcript, and render it as plain text (default) or the machine
 * transcript JSON (`--json`). Zero LLM / network; reads fixtures + pinned schemas
 * from disk. Exit 0 always — the demo is a walkthrough of the mechanism, not a
 * pass/fail gate. Throws on unreadable input (bin maps that to exit 2).
 */
export function runDemo(opts: { json?: boolean } = {}): DemoCliResult {
  const restaurant = join("fixtures", "synthetic-restaurant");
  const sor = JSON.parse(
    readFileSync(join(restaurant, "sor.catalog.json"), "utf8"),
  ) as SyntheticCatalog;
  const feed = JSON.parse(
    readFileSync(join(restaurant, "acp-feed.drifted.json"), "utf8"),
  ) as AcpFeed;
  const conformanceDoc = JSON.parse(
    readFileSync(join("fixtures", "ucp-conformance-ci", "valid", "conformant-but-false.json"), "utf8"),
  ) as UcpSearchResponse;

  const transcript = buildDemoTranscript({ feed, sor, conformanceDoc });
  const output = opts.json
    ? `${JSON.stringify(transcript, null, 2)}\n`
    : renderDemoText(transcript);
  return { output, exitCode: 0 };
}
