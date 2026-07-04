/**
 * Fee-fixture generator — F1a (plan §8: seeded/deterministic corpus).
 *
 * Regenerates fixtures/synthetic-restaurant/fees/ from the pinned seed: the
 * faithful + drifted + cured + conditional monthly statements, the machine
 * answer key, and the four golden fee-audit reports. A freeze-integrity eval
 * byte-locks the committed fixtures to this generator, so the corpus cannot be
 * hand-tampered without CI failing.
 *
 * Run: node scripts-ts/generate-fee-fixtures.mts        (Node ≥ 24)
 *
 * Plain: the one script that rebuilds the whole fee corpus from its recipe.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildFaithfulStatement,
  buildDriftedStatement,
  buildCuredStatement,
  buildConditionalStatement,
  buildFeeAnswerKey,
  buildCorpusReports,
  serializeFeeReport,
} from "../lib/packs/fees/index.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "fixtures", "synthetic-restaurant", "fees");
mkdirSync(dir, { recursive: true });

const writeJson = (name: string, value: unknown): void => {
  writeFileSync(join(dir, name), `${JSON.stringify(value, null, 2)}\n`);
  process.stdout.write(`wrote ${name}\n`);
};

writeJson("statement.faithful.json", buildFaithfulStatement());
writeJson("statement.drifted.json", buildDriftedStatement());
writeJson("statement.cured.json", buildCuredStatement());
writeJson("statement.conditional.json", buildConditionalStatement());
writeJson("fee-answer-key.json", buildFeeAnswerKey());

const reports = buildCorpusReports();
for (const [statementName, report] of Object.entries(reports)) {
  const goldenName = statementName.replace(/^statement\./, "expected-report.");
  writeFileSync(join(dir, goldenName), serializeFeeReport(report));
  process.stdout.write(`wrote ${goldenName}\n`);
}

const drifted = reports["statement.drifted.json"];
process.stdout.write(
  `done: drifted findings=${drifted.findings.length} (violation ${drifted.verdictTally.violation}, ` +
    `conditional ${drifted.verdictTally["conditional-pending-refund-window"]}, cured ${drifted.verdictTally["cured-by-refund"]})\n`,
);
