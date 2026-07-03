/**
 * UCP differential oracle — OPTIONAL CI lane (plan §3 "ucp-schema … in CI as a
 * differential oracle — never a runtime dependency"; C5 agreement).
 *
 * The official `ucp-schema` validator is a cargo-only Rust tool. This script,
 * WHEN cargo (+ the `ucp-schema` binary) is present, runs `ucp-schema validate`
 * over every fixture in the N≥30 conformance corpus and asserts its verdicts
 * AGREE with our ajv verdicts (conformance.ts) — this is the independent check on
 * our own implementation. When cargo is absent it SKIPS LOUDLY and exits 0:
 * agreement is simply UNMEASURED on this machine, and that status is recorded
 * honestly (never faked). This is NEVER a runtime dependency of the validator —
 * it lives only behind `npm run test:ucp-oracle`, outside `npm run verify`.
 *
 * cargo/rustc are NOT installed on the build machine (verified 2026-07-03), so
 * the skip branch is what runs here; the C5 agreement number is UNMEASURED
 * locally and the escalation is handled upstream (slice record).
 *
 * Run: npm run test:ucp-oracle
 *      UCP_ORACLE_INSTALL=1 npm run test:ucp-oracle   # opt-in `cargo install ucp-schema`
 *
 * Plain: the official (Rust) rulebook-checker exists but isn't installed here. If
 * it were, this would double-check our checker against it on every corpus file.
 * Since it isn't, we say so loudly and honestly instead of pretending we checked.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runUcpConformance, DEFAULT_UCP_SCHEMA_DIR, type UcpCatalogOp } from "../lib/packs/listings/conformance.ts";

const SKIP_MESSAGE =
  "ucp-schema differential oracle SKIPPED: cargo not installed — C5 agreement UNMEASURED on this machine";

function onPath(bin: string, args: readonly string[]): boolean {
  try {
    execFileSync(bin, args, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const dir = join("fixtures", "ucp-conformance-ci");
const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")) as {
  entries: { file: string; op: UcpCatalogOp; valid: boolean }[];
};

const hasUcpSchema = onPath("ucp-schema", ["--version"]);
const hasCargo = onPath("cargo", ["--version"]);

if (!hasUcpSchema && !hasCargo) {
  process.stdout.write(`${SKIP_MESSAGE}\n`);
  process.exit(0);
}

if (!hasUcpSchema && hasCargo) {
  if (process.env.UCP_ORACLE_INSTALL === "1") {
    process.stdout.write("cargo present; installing ucp-schema (opt-in UCP_ORACLE_INSTALL=1)…\n");
    execFileSync("cargo", ["install", "ucp-schema"], { stdio: "inherit" });
  } else {
    process.stdout.write(
      "ucp-schema differential oracle SKIPPED: cargo present but `ucp-schema` not installed — " +
        "run `cargo install ucp-schema` or `UCP_ORACLE_INSTALL=1 npm run test:ucp-oracle`. C5 agreement UNMEASURED.\n",
    );
    process.exit(0);
  }
}

// --- cargo present + ucp-schema available: run the real differential ----------
// Invocation per the ucp-schema v1.4.0 README (validate a catalog container
// response against a named $defs shape, machine-readable output). NOTE: this
// branch has NOT executed on the build machine (no cargo); the exact flags are
// transcribed from the pinned tool's documented CLI and MUST be re-verified the
// first time cargo is available — on any unexpected tool error we report it raw
// and FAIL (never fake agreement).
const schemaBase = DEFAULT_UCP_SCHEMA_DIR;
const opToSchema: Record<UcpCatalogOp, { schema: string; def: string }> = {
  search: { schema: "shopping/catalog_search.json", def: "search_response" },
  lookup: { schema: "shopping/catalog_lookup.json", def: "lookup_response" },
  get_product: { schema: "shopping/catalog_lookup.json", def: "get_product_response" },
};

let agree = 0;
let disagree = 0;
for (const entry of manifest.entries) {
  const ours = runUcpConformance(JSON.parse(readFileSync(join(dir, entry.file), "utf8")), { op: entry.op });
  const { schema, def } = opToSchema[entry.op];
  let officialValid: boolean;
  try {
    const out = execFileSync(
      "ucp-schema",
      [
        "validate",
        join(dir, entry.file),
        "--schema",
        join(schemaBase, schema),
        "--response",
        "--op",
        entry.op,
        "--def",
        def,
        "--schema-local-base",
        schemaBase,
        "--json",
      ],
      { encoding: "utf8" },
    );
    officialValid = (JSON.parse(out) as { valid: boolean }).valid;
  } catch (err) {
    // ucp-schema exits 1 when validation fails — that is a valid "invalid" verdict,
    // and its JSON still lands on stdout. Distinguish it from a real tool error.
    const e = err as { status?: number; stdout?: string; message?: string };
    if (e.status === 1 && e.stdout) {
      officialValid = (JSON.parse(e.stdout) as { valid: boolean }).valid;
    } else {
      process.stderr.write(`ucp-oracle: tool error on ${entry.file} (raw): ${e.message ?? String(err)}\n`);
      process.exit(2);
    }
  }
  if (officialValid === ours.ok) agree++;
  else {
    disagree++;
    process.stderr.write(
      `DISAGREE ${entry.file}: ours.ok=${ours.ok} vs ucp-schema.valid=${officialValid}\n`,
    );
  }
}

process.stdout.write(
  `ucp-schema differential oracle: ${agree}/${manifest.entries.length} agree, ${disagree} disagree\n`,
);
process.exit(disagree === 0 ? 0 : 1);
