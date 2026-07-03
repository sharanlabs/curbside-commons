#!/usr/bin/env node
/**
 * Verifier CLI — W1 (plan §5 W1, C1: one-command validator).
 *
 * `check <feed.json> --against <catalog.json> [--surface acp|ucp]`
 * Runs the deterministic drift verification and prints the machine-readable
 * report (JSON). Exit codes: 0 = clean · 1 = findings (any drift) · 2 = usage /
 * input error. This path performs ZERO LLM or network calls (C1: $0-LLM) — the
 * comparator is loaded from the TypeScript source via Node's native
 * type-stripping (Node ≥ 24) so there is exactly ONE implementation.
 *
 * Plain: point it at the copy and the truth; it prints every catch with
 * receipts and fails loudly if the copy lies. Free to run, no AI calls.
 */

const USAGE = `verifier — deterministic serving-copy checker (simulated corpus)

Usage:
  check <feed.json> --against <catalog.json> [--surface acp|ucp]
      TRUTH leg: verify a serving copy against the SOR catalog (does it LIE?).
      Exit 0 = clean, 1 = drift found.
  check <doc.json> --conformance [--op search|lookup|get_product]
      CONFORMANCE leg: validate a UCP catalog-response document against the pinned
      published UCP schemas (is it correctly SHAPED?). No --against needed — the
      reference is the schema. Exit 0 = conformant, 1 = schema violation(s).
  help
      Show this message.

Notes:
  - No LLM / network calls on either path (C1: $0-LLM; conformance reads pinned
    schemas from disk via ajv).
  - conformance vs truth: a spec-VALID document can still be FALSE. The two legs
    answer different questions and use distinct rule families (LST-* vs LST-CONF-*).
  - --surface defaults to acp; --op defaults to search.
  - Zero-config demos: npm run check:fixtures  |  npm run check:conformance
`;

/** @param {string[]} argv */
async function main(argv) {
  const args = argv.slice(2);
  const cmd = args[0];

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    process.stdout.write(USAGE);
    return 0;
  }

  if (cmd !== "check") {
    process.stderr.write(`Unknown command: ${cmd}\n\n${USAGE}`);
    return 2;
  }

  const feedPath = args[1];

  // CONFORMANCE leg (W2): validate a UCP doc against the pinned schemas.
  if (args.includes("--conformance")) {
    const opIdx = args.indexOf("--op");
    const op = opIdx >= 0 ? args[opIdx + 1] : "search";
    if (!feedPath || feedPath.startsWith("--")) {
      process.stderr.write(`check: --conformance needs <doc.json>\n\n${USAGE}`);
      return 2;
    }
    if (op !== "search" && op !== "lookup" && op !== "get_product") {
      process.stderr.write(`check: --op must be "search", "lookup" or "get_product" (got "${op}")\n\n${USAGE}`);
      return 2;
    }
    try {
      const { runConformanceCheck } = await import("../lib/packs/listings/cli.ts");
      const result = runConformanceCheck(feedPath, op);
      process.stdout.write(result.output);
      return result.exitCode;
    } catch (err) {
      process.stderr.write(`check: ${err instanceof Error ? err.message : String(err)}\n`);
      return 2;
    }
  }

  // TRUTH leg (W1): verify a serving copy against the SOR catalog.
  const againstIdx = args.indexOf("--against");
  const catalogPath = againstIdx >= 0 ? args[againstIdx + 1] : undefined;
  const surfaceIdx = args.indexOf("--surface");
  const surface = surfaceIdx >= 0 ? args[surfaceIdx + 1] : "acp";

  if (!feedPath || feedPath.startsWith("--") || !catalogPath) {
    process.stderr.write(`check: need <feed.json> and --against <catalog.json>\n\n${USAGE}`);
    return 2;
  }
  if (surface !== "acp" && surface !== "ucp") {
    process.stderr.write(`check: --surface must be "acp" or "ucp" (got "${surface}")\n\n${USAGE}`);
    return 2;
  }

  try {
    const { runCheck } = await import("../lib/packs/listings/cli.ts");
    const result = runCheck(feedPath, catalogPath, surface);
    process.stdout.write(result.output);
    return result.exitCode;
  } catch (err) {
    process.stderr.write(`check: ${err instanceof Error ? err.message : String(err)}\n`);
    return 2;
  }
}

process.exit(await main(process.argv));
