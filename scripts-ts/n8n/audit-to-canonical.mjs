#!/usr/bin/env node
/**
 * A4 n8n stage 1 — run ONE registry tool and write its canonical payload to a
 * file (plan §5 row A4: fixture → REGISTRY TOOL → A3 payload; this script is
 * the "registry tool" stage the committed n8n workflow's Execute Command node
 * invokes). Zero LLM / zero network — it imports the same A0 registry every
 * other surface uses; callTool validates params before anything runs.
 *
 * Usage (from the repo root — the runbook pins the cwd):
 *   node scripts-ts/n8n/audit-to-canonical.mjs --tool audit_statement \
 *     --params '{"statementPath":"fixtures/synthetic-restaurant/fees/statement.drifted.json"}' \
 *     --out .n8n-artifacts/canonical.json
 *
 * Plain: button one of the automation pipeline — run the audit, save the
 * machine report to a file for the next step. Nothing else.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1 || i === process.argv.length - 1) {
    console.error(`missing --${name}`);
    process.exit(2);
  }
  return process.argv[i + 1];
}

const tool = arg("tool");
const params = JSON.parse(arg("params"));
const out = arg("out");

const { callTool, assertDecisionGrade } = await import("../../lib/tools/registry.ts");
const result = callTool(tool, params);
assertDecisionGrade(result); // demo-only/advisory output can never enter the delivery pipeline
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, result.canonical);
console.log(`wrote canonical (${result.tool}, exit ${result.exitCode}, ok=${result.ok}) -> ${out}`);
process.exit(0); // the audit's own verdict travels IN the payload; the pipeline stage succeeded
