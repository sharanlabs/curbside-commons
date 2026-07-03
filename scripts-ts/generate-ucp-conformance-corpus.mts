/**
 * UCP conformance CI-corpus generator — W2 (plan §5 W2, C5 conformance correctness).
 *
 * Writes the seeded, deterministic corpus of real-UCP catalog-response documents
 * (VALID + INVALID, one violation class per invalid) + the conformance-vs-truth
 * headline exhibit + the ground-truth manifest. The RECIPE is the pure builder
 * `buildUcpConformanceCorpus` (lib/packs/listings/ucp-corpus.ts); the freeze-
 * integrity eval byte-locks every committed file to that same recipe, so the
 * corpus cannot be hand-tampered silently (P2-1 lesson).
 *
 * Run: node scripts-ts/generate-ucp-conformance-corpus.mts        (Node ≥ 24)
 *
 * Plain: rebuilds every corpus file from its recipe; CI freezes the result.
 */
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CORPUS_AS_OF, CORPUS_SEED, generateCatalog } from "../lib/packs/listings/index.ts";
import { buildUcpConformanceCorpus } from "../lib/packs/listings/ucp-corpus.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "fixtures", "ucp-conformance-ci");

const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
const { entries, manifest } = buildUcpConformanceCorpus(sor);

rmSync(join(dir, "valid"), { recursive: true, force: true });
rmSync(join(dir, "invalid"), { recursive: true, force: true });
mkdirSync(join(dir, "valid"), { recursive: true });
mkdirSync(join(dir, "invalid"), { recursive: true });

const writeJson = (p: string, v: unknown): void => writeFileSync(p, `${JSON.stringify(v, null, 2)}\n`);
for (const e of entries) writeJson(join(dir, e.file), e.doc);
writeJson(join(dir, "manifest.json"), manifest);

const counts = manifest.counts as { total: number; valid: number; invalid: number };
const classes = manifest.violationClasses as string[];
process.stdout.write(
  `done: ${counts.total} fixtures (${counts.valid} valid + ${counts.invalid} invalid); ` +
    `${classes.length} violation classes: ${classes.join(", ")}\n`,
);
