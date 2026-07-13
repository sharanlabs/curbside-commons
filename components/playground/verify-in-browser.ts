/**
 * Playground seam — the REAL verifier, browser-side (owner commission 2026-07-13).
 *
 * This module is the entire bridge between the /playground page and the shipped
 * engine: it composes exactly the two calls the CLI's TRUTH leg composes
 * (`acpFeedToClaims` → `runListingsVerification`, see lib/packs/listings/cli.ts
 * runCheck) against the committed synthetic SOR catalog. Nothing is re-implemented
 * and nothing is mocked: the golden-equality test in
 * evals/packs/playground-golden.test.ts proves this seam, fed the committed
 * drifted sample feed, reproduces fixtures/synthetic-restaurant/expected-report.acp.json
 * byte-for-byte — the same equality the page claims on its face.
 *
 * Browser safety: every transitive import in this closure is pure TypeScript —
 * no node:fs, no network. The same test walks the import graph and asserts it.
 *
 * Honesty by construction: the reference is the SYNTHETIC catalog, so every
 * report this seam produces carries `simulated: true` and
 * `matchingMode: "synthetic-controlled"` — a pasted feed is genuinely verified,
 * live, but always against the committed simulated merchant records.
 */
import type { AcpFeed } from "@/lib/packs/listings/acp-feed";
import { acpFeedToClaims } from "@/lib/packs/listings/adapters";
import { runListingsVerification } from "@/lib/packs/listings/run";
import type { SyntheticCatalog } from "@/lib/packs/listings/types";
import type { VerifierReport } from "@/lib/verifier-core/report";
import sorCatalogJson from "@/fixtures/synthetic-restaurant/sor.catalog.json";
import sampleFeedJson from "@/fixtures/synthetic-restaurant/acp-feed.drifted.json";

/** The committed synthetic merchant records every playground run is checked against. */
export const SOR_CATALOG = sorCatalogJson as unknown as SyntheticCatalog;

/** The committed drifted sample feed (the demo's feed) — the "load sample" source. */
export const SAMPLE_FEED = sampleFeedJson as unknown as AcpFeed;

/** Pretty-printed sample feed text for the paste box. */
export function sampleFeedText(): string {
  return JSON.stringify(SAMPLE_FEED, null, 2);
}

export type ParseResult =
  | { readonly ok: true; readonly feed: AcpFeed }
  | { readonly ok: false; readonly error: string };

/**
 * Parse pasted text as an ACP feed — honest, specific failures; never a fake
 * verdict. Mirrors the CLI's shape check (cli.ts checks `Array.isArray(items)`
 * on the SOR; the feed-side equivalent here).
 */
export function parseAcpFeedText(text: string): ParseResult {
  if (!text.trim()) {
    return { ok: false, error: "The paste box is empty — paste an ACP feed JSON document first." };
  }
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    return {
      ok: false,
      error: `Not valid JSON: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return { ok: false, error: "Expected a JSON object with an `items` array — got a non-object." };
  }
  const items = (raw as { items?: unknown }).items;
  if (!Array.isArray(items)) {
    return {
      ok: false,
      error:
        "This does not look like an ACP feed: the top-level `items` array is missing. See the sample feed for the expected shape.",
    };
  }
  return { ok: true, feed: raw as AcpFeed };
}

/**
 * Run the real verification — the exact CLI composition, in the browser.
 * Deterministic: same feed in, same report out.
 */
export function verifyAcpFeed(feed: AcpFeed): VerifierReport {
  return runListingsVerification(acpFeedToClaims(feed), SOR_CATALOG);
}
