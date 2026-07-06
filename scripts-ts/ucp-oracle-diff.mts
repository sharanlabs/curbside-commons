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
 * MEASURED 2026-07-05 (cargo + `ucp-schema` 1.3.0 installed on owner order — the
 * "all four" decision, decision-log): **33/35 agree, 2 documented format-class
 * divergences, 0 disagreements** (see FORMAT_DIVERGENCE_CLASS below for the
 * root-caused fork). The skip branch remains for machines without the toolchain.
 *
 * Run: npm run test:ucp-oracle
 *      UCP_ORACLE_INSTALL=1 npm run test:ucp-oracle   # opt-in `cargo install ucp-schema`
 *
 * Plain: the official (Rust) rulebook-checker now runs here and agrees with our
 * checker on every corpus file except two — and those two are the same known,
 * written-down difference (we also check that URLs look like URLs; the official
 * tool deliberately doesn't). Any OTHER difference would still fail this check.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
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

/**
 * Resolve the ucp-schema binary: PATH first, then cargo's default install dir
 * (~/.cargo/bin — NOT on the default macOS PATH, so a plain `npm run
 * test:ucp-oracle` in a fresh shell used to skip-as-success while the docs said
 * "measured"; Codex F1b-live review P1, 2026-07-05). Returns the invocable
 * path, or null if genuinely absent.
 */
function resolveUcpSchema(): string | null {
  if (onPath("ucp-schema", ["--version"])) return "ucp-schema";
  const cargoBin = join(homedir(), ".cargo", "bin", "ucp-schema");
  if (onPath(cargoBin, ["--version"])) return cargoBin;
  return null;
}

const dir = join("fixtures", "ucp-conformance-ci");
const manifest = JSON.parse(readFileSync(join(dir, "manifest.json"), "utf8")) as {
  entries: { file: string; op: UcpCatalogOp; valid: boolean; violationClass?: string }[];
};

/**
 * DOCUMENTED DIVERGENCE CLASS (root-caused on the FIRST measured run, 2026-07-05 —
 * cargo installed on owner order, `ucp-schema` 1.3.0 = the latest crates.io release):
 * `format`-keyword fixtures. JSON Schema 2020-12 treats `format` as ANNOTATION-ONLY
 * by default; `ucp-schema validate` follows that default (no format-assertion flag
 * exists — `validate --help` checked), while OUR lane consciously ASSERTS formats
 * via ajv-formats (a stricter, labeled bound; it is what lets the corpus's
 * LST-CONF-FORMAT violation class be caught at all). So on an LST-CONF-FORMAT
 * fixture the verdicts fork EXACTLY one way: ours.ok=false, official valid=true.
 * That precise fork is counted as agreement-with-documented-divergence and printed
 * loudly; ANY other mismatch (any class, either direction) remains a hard DISAGREE
 * and fails the oracle. The C5 record (slice record + PROJECT_STATE) carries the
 * measured split, never a bare "green".
 */
const FORMAT_DIVERGENCE_CLASS = "LST-CONF-FORMAT";

const ucpSchemaBin = resolveUcpSchema();
const hasUcpSchema = ucpSchemaBin !== null;
const hasCargo = onPath("cargo", ["--version"]) || onPath(join(homedir(), ".cargo", "bin", "cargo"), ["--version"]);

if (!hasUcpSchema && !hasCargo) {
  process.stdout.write(`${SKIP_MESSAGE}\n`);
  process.exit(0);
}

if (!hasUcpSchema && hasCargo) {
  if (process.env.UCP_ORACLE_INSTALL === "1") {
    process.stdout.write("cargo present; installing ucp-schema (opt-in UCP_ORACLE_INSTALL=1)…\n");
    // Same PATH-or-~/.cargo/bin resolution as the validator binary (confirming-pass P3).
    const cargoBin = onPath("cargo", ["--version"]) ? "cargo" : join(homedir(), ".cargo", "bin", "cargo");
    execFileSync(cargoBin, ["install", "ucp-schema"], { stdio: "inherit" });
  } else {
    process.stdout.write(
      "ucp-schema differential oracle SKIPPED: cargo present but `ucp-schema` not installed — " +
        "run `cargo install ucp-schema` or `UCP_ORACLE_INSTALL=1 npm run test:ucp-oracle`. C5 agreement UNMEASURED.\n",
    );
    process.exit(0);
  }
}

// --- cargo present + ucp-schema available: run the real differential ----------
// Invocation per the ucp-schema README (validate a catalog container response
// against a named $defs shape, machine-readable output). The flags were
// LIVE-VERIFIED 2026-07-05 against the installed binary (1.3.0 — the latest
// crates.io release; the README that documented these flags referenced v1.4.0,
// a repo-side version not published to crates.io — skew noted, flags compatible).
// On any unexpected tool error we report it raw and FAIL (never fake agreement).
const schemaBase = DEFAULT_UCP_SCHEMA_DIR;
const opToSchema: Record<UcpCatalogOp, { schema: string; def: string }> = {
  search: { schema: "shopping/catalog_search.json", def: "search_response" },
  lookup: { schema: "shopping/catalog_lookup.json", def: "lookup_response" },
  get_product: { schema: "shopping/catalog_lookup.json", def: "get_product_response" },
};

let agree = 0;
let formatDivergence = 0;
let disagree = 0;
for (const entry of manifest.entries) {
  const ours = runUcpConformance(JSON.parse(readFileSync(join(dir, entry.file), "utf8")), { op: entry.op });
  const { schema, def } = opToSchema[entry.op];
  let officialValid: boolean;
  try {
    const out = execFileSync(
      ucpSchemaBin as string,
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
  if (officialValid === ours.ok) {
    agree++;
  } else if (entry.violationClass === FORMAT_DIVERGENCE_CLASS && !ours.ok && officialValid) {
    formatDivergence++;
    process.stdout.write(
      `DOCUMENTED DIVERGENCE (${FORMAT_DIVERGENCE_CLASS}) ${entry.file}: ours asserts format (invalid), ` +
        `ucp-schema treats format as annotation-only (valid) — the root-caused 2020-12 fork, expected\n`,
    );
  } else {
    disagree++;
    process.stderr.write(
      `DISAGREE ${entry.file}: ours.ok=${ours.ok} vs ucp-schema.valid=${officialValid}\n`,
    );
  }
}

process.stdout.write(
  `ucp-schema differential oracle: ${agree}/${manifest.entries.length} agree, ` +
    `${formatDivergence} documented format-class divergence(s), ${disagree} disagree\n`,
);
process.exit(disagree === 0 ? 0 : 1);
