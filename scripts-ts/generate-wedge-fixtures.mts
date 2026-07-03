/**
 * Wedge-fixture generator — W1 (plan §8: seeded/deterministic corpus).
 *
 * Regenerates fixtures/synthetic-restaurant/ from the pinned seed: the SOR, the
 * faithful + drifted ACP-shaped feeds, the constructed UCP catalog-response
 * fixtures, the ground-truth drift manifest, and the two golden expected
 * reports. Freeze-integrity evals assert the committed fixtures byte-match this
 * generator's output, so the corpus cannot be hand-tampered silently.
 *
 * Run: node scripts-ts/generate-wedge-fixtures.mts        (Node ≥ 24)
 *
 * Plain: the one script that rebuilds the whole demo corpus from its recipe.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CORPUS_AS_OF,
  CORPUS_SEED,
  applyCorpusDrift,
  buildFaithfulFeed,
  buildUcpResponse,
  generateCatalog,
  acpFeedToClaims,
  ucpResponseToClaims,
  runListingsVerification,
  UCP_PINNED_VERSION,
} from "../lib/packs/listings/index.ts";
import { serializeReport } from "../lib/verifier-core/verify.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "fixtures", "synthetic-restaurant");
mkdirSync(dir, { recursive: true });

const writeJson = (name: string, value: unknown): void => {
  writeFileSync(join(dir, name), `${JSON.stringify(value, null, 2)}\n`);
  process.stdout.write(`wrote ${name}\n`);
};

const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
const faithful = buildFaithfulFeed(sor);
const { feed: drifted, manifest } = applyCorpusDrift(faithful, sor);

// Faithful UCP response speaks the pinned version; the drifted one skews it
// (§7 spec-version-skew, ucp-only — recorded here as manifest-adjacent truth).
const ucpFaithful = buildUcpResponse(faithful, {
  supportedVersions: [UCP_PINNED_VERSION],
  sessionId: "sess-sim-faithful-001",
});
const ucpDrifted = buildUcpResponse(drifted, {
  supportedVersions: ["2026-03-01-draft"],
  sessionId: "sess-sim-drifted-001",
});

writeJson("sor.catalog.json", sor);
writeJson("acp-feed.faithful.json", faithful);
writeJson("acp-feed.drifted.json", drifted);
writeJson("ucp-catalog-response.faithful.json", ucpFaithful);
writeJson("ucp-catalog-response.drifted.json", ucpDrifted);
writeJson("drift-manifest.json", {
  simulated: true,
  seed: CORPUS_SEED,
  asOf: CORPUS_AS_OF,
  ucpVersionSkew: {
    class: "spec-version-skew",
    surfaces: "ucp-only",
    pinned: UCP_PINNED_VERSION,
    served: ["2026-03-01-draft"],
  },
  entries: manifest,
});

// Golden expected reports — byte-compared by the determinism/golden evals.
const acpReport = runListingsVerification(acpFeedToClaims(drifted), sor);
const ucpReport = runListingsVerification(ucpResponseToClaims(ucpDrifted), sor);
writeFileSync(join(dir, "expected-report.acp.json"), serializeReport(acpReport));
process.stdout.write("wrote expected-report.acp.json\n");
writeFileSync(join(dir, "expected-report.ucp.json"), serializeReport(ucpReport));
process.stdout.write("wrote expected-report.ucp.json\n");

process.stdout.write(
  `done: ${manifest.length} injected drifts; acp findings=${acpReport.findings.length}, ucp findings=${ucpReport.findings.length}\n`,
);
