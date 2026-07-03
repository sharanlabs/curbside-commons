/**
 * Demo-transcript generator — D1 (plan §5 D1).
 *
 * Regenerates the two committed demo goldens from the shipped corpus:
 *   - fixtures/synthetic-restaurant/expected-demo.json  (the machine transcript)
 *   - fixtures/synthetic-restaurant/expected-demo.txt   (the CLI plain text)
 * It builds them the EXACT way `node bin/check.mjs demo` does (via runDemo, same
 * fixture reads), so the golden-lock eval can byte-compare the live CLI output to
 * these files. The web renderer imports expected-demo.json statically — it never
 * runs the fs-touching engine.
 *
 * Run from the repo root: node scripts-ts/generate-demo-transcript.mts   (Node ≥ 24)
 *
 * Plain: the one script that rebuilds the demo's frozen script from its recipe.
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runDemo } from "../lib/packs/listings/cli.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "fixtures", "synthetic-restaurant");

const json = runDemo({ json: true }).output;
const text = runDemo({ json: false }).output;

writeFileSync(join(dir, "expected-demo.json"), json);
process.stdout.write("wrote expected-demo.json\n");
writeFileSync(join(dir, "expected-demo.txt"), text);
process.stdout.write("wrote expected-demo.txt\n");
