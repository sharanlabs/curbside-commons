/**
 * Browser-fixtures generator — de-jargon the CLIENT-bundled catalog + sample feed
 * (redesign reconcile 2026-07-14, folded acceptance-gate finding).
 *
 * The /playground page runs the real verifier in the browser against a reference
 * catalog + a sample feed. Those two artifacts are imported into a CLIENT module
 * (components/playground/verify-in-browser.ts), so importing the CANONICAL
 * fixtures directly would inline their lab-labels ("synthetic", "corpus", "Test
 * Kitchen (simulated)", the generator name) into the shipped JS chunks — invisible
 * to users but present in the bundle.
 *
 * This script writes JARGON-STRIPPED PROJECTIONS the browser imports instead. It
 * touches ONLY non-claim, non-engine-read fields (top-level metadata + brand /
 * seller / description / url labels); every field the verification engine reads —
 * item_id, title, price, currency, availability, group_id, variant_dict,
 * eligibility, expiration/availability dates, and the SOR item names + variations
 * + currency + asOf — is copied VERBATIM, so the report the browser computes is
 * byte-identical to fixtures/synthetic-restaurant/expected-report.acp.json (proven
 * by evals/packs/playground-golden.test.ts).
 *
 * The canonical fixtures (sor.catalog.json / acp-feed.drifted.json) are the source
 * of truth and are NEVER edited — tests, goldens, and the CLI bind them.
 *
 * ONE jargon residual is intentionally preserved: the ghost item's title,
 * "Phantom Platter (simulated ghost item)", is a CLAIM value that the frozen golden
 * report quotes verbatim — it is genuine verification data (a ghost the checker
 * catches), not a dev-label, and rendered surfaces reword it at the display layer.
 *
 * Run from the repo root: node scripts-ts/generate-browser-fixtures.mts   (Node ≥ 24)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "fixtures", "synthetic-restaurant");
const outDir = join(srcDir, "browser");

/** A clean, jargon-free placeholder for label fields the engine never reads. */
const CLEAN_MERCHANT = "Illustrative merchant";
const CLEAN_DESCRIPTION = "Illustrative catalog item.";
/** Neutralize any lab-labeled URL host segment without touching the path shape. */
const cleanUrl = (u: unknown): unknown =>
  typeof u === "string" ? u.replace(/curbside-commons-simulated/gi, "example") : u;

type Json = Record<string, unknown>;

// ---- catalog projection ---------------------------------------------------
const catalog = JSON.parse(readFileSync(join(srcDir, "sor.catalog.json"), "utf8")) as Json;
const catalogItems = (catalog.items as Json[]).map((it) => ({
  ...it,
  // description is not read by verification — blank the lab-label, keep the field.
  description: CLEAN_DESCRIPTION,
}));
const catalogWeb: Json = {
  // top-level metadata (simulated / generator / merchantName) is not read by
  // verification — drop the lab-labels, keep currency + asOf (asOf IS read).
  currency: catalog.currency,
  asOf: catalog.asOf,
  items: catalogItems,
};

// ---- sample feed projection ----------------------------------------------
const feed = JSON.parse(readFileSync(join(srcDir, "acp-feed.drifted.json"), "utf8")) as Json;
const feedItems = (feed.items as Json[]).map((row) => ({
  ...row,
  // Claim / engine fields (item_id, title, price, currency, availability,
  // group_id, variant_dict, eligibility, dates …) are copied verbatim above.
  // Only the label fields below are neutralized — title is NEVER touched (the
  // ghost title is a golden-bound claim value).
  description: CLEAN_DESCRIPTION,
  brand: CLEAN_MERCHANT,
  seller_name: CLEAN_MERCHANT,
  url: cleanUrl(row.url),
  image_url: cleanUrl(row.image_url),
  seller_url: cleanUrl(row.seller_url),
  seller_privacy_policy: cleanUrl(row.seller_privacy_policy),
  seller_tos: cleanUrl(row.seller_tos),
}));
const feedWeb: Json = {
  // drop the top-level `simulated` metadata flag (not read by the engine).
  spec: feed.spec,
  items: feedItems,
};

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "sor.catalog.web.json"), JSON.stringify(catalogWeb, null, 2) + "\n");
process.stdout.write("wrote browser/sor.catalog.web.json\n");
writeFileSync(join(outDir, "acp-feed.web.json"), JSON.stringify(feedWeb, null, 2) + "\n");
process.stdout.write("wrote browser/acp-feed.web.json\n");
