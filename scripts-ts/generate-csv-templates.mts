/**
 * Spreadsheet-template generator — the two files a tester downloads, edits, and
 * drops back (S1 of docs/plan-testable-instrument-2026-09-01.md).
 *
 * Both templates are DERIVED from the canonical fixtures by the same writers
 * the UI will call at runtime (lib/playground/csv-adapters.ts), and are
 * freeze-locked by evals/packs/csv-adapters.test.ts: regenerate ⇒ bytes must
 * match. The canonical JSON fixtures are never edited here.
 *
 *   menu-as-published.csv   ← acp-feed.drifted.json  (the bundled feed the site runs;
 *                             pre-filled so a tester edits rather than authors, and
 *                             sees the same findings the landing page shows)
 *   menu-record.csv         ← sor.catalog.json       (the merchant's record)
 *   menu-record.spreadsheet-resave.csv
 *                           ← the record as a spreadsheet app is documented to
 *                             re-save it (lib/playground/csv-fixtures.ts — constructed,
 *                             UNVERIFIED against a real export).
 *
 * Run from the repo root: node scripts-ts/generate-csv-templates.mts   (Node ≥ 24)
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AcpFeed } from "../lib/packs/listings/acp-feed.ts";
import type { SyntheticCatalog } from "../lib/packs/listings/types.ts";
import {
  FEED_TEMPLATE_FILENAME,
  RECORD_TEMPLATE_FILENAME,
  catalogToCsv,
  feedToCsv,
} from "../lib/playground/csv-adapters.ts";
import { RESAVE_FIXTURE_FILENAME, spreadsheetResave } from "../lib/playground/csv-fixtures.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "fixtures", "synthetic-restaurant");
const outDir = join(srcDir, "csv");

const feed = JSON.parse(readFileSync(join(srcDir, "acp-feed.drifted.json"), "utf8")) as AcpFeed;
const catalog = JSON.parse(readFileSync(join(srcDir, "sor.catalog.json"), "utf8")) as SyntheticCatalog;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, FEED_TEMPLATE_FILENAME), feedToCsv(feed));
process.stdout.write(`wrote csv/${FEED_TEMPLATE_FILENAME}\n`);
writeFileSync(join(outDir, RECORD_TEMPLATE_FILENAME), catalogToCsv(catalog));
process.stdout.write(`wrote csv/${RECORD_TEMPLATE_FILENAME}\n`);
writeFileSync(join(outDir, RESAVE_FIXTURE_FILENAME), spreadsheetResave(catalog));
process.stdout.write(`wrote csv/${RESAVE_FIXTURE_FILENAME}\n`);
