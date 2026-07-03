// Generator for the REAL ENTITY layer of the hybrid dataset (run on demand, NOT in
// CI). Zero dependencies: `node scripts-ts/build-hybrid-snapshot.mjs`.
//
// What it does: fetch active SF Food-Services + Retail-Trade businesses from DataSF
// (dataset g8m3-pdis, PDDL 1.0 public-domain), keep ONLY the storefront name +
// crosswalked category (PII fields are never even requested), dedup, take a small
// deterministic balanced sample, and freeze it to lib/data/sf-entities.snapshot.json.
//
// The SYNTHETIC activation overlay is NOT frozen here — it is applied deterministically
// at load by lib/ingest/overlay.ts (the single source of truth), so this file contains
// only real open data and the synthetic state stays transparent, seeded code. The
// drift guard evals/hybrid-snapshot.test.ts proves the frozen names/categories satisfy
// the TS sanitizer + crosswalk, so this generator cannot silently diverge from them.
//
// Honest granularity note: DataSF's naic_code_description is sector-level only, so the
// real layer populates Restaurant + Retail; Grocery/Convenience are not separable from
// this source and are left to the synthetic lane rather than fabricated.

import { writeFileSync } from "node:fs";

const DATASET = "g8m3-pdis";
const ENDPOINT = `https://data.sfgov.org/resource/${DATASET}.json`;
const PER_CATEGORY = 10; // 10 Restaurant + 10 Retail = 20 merchants (cycles steps 0..5)

// Mirror of lib/ingest/sf-adapter.ts (kept trivial + guarded by the drift test).
const CROSSWALK = { "Food Services": "Restaurant", "Retail Trade": "Retail" };

function sanitizeText(value, maxLen = 120) {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    out += code <= 0x1f || (code >= 0x7f && code <= 0x9f) ? " " : ch;
  }
  return out.replace(/\s+/g, " ").trim().slice(0, maxLen);
}
const nameKey = (n) => n.toLowerCase().replace(/\s+/g, " ").trim();

async function main() {
  const params = new URLSearchParams();
  // Request ONLY the four fields the adapter uses — PII columns are never fetched.
  params.set("$select", "dba_name,naic_code_description,city,state");
  params.set(
    "$where",
    "city='San Francisco' AND location_end_date IS NULL AND dba_name IS NOT NULL " +
      "AND (naic_code_description='Food Services' OR naic_code_description='Retail Trade')",
  );
  params.set("$order", "dba_name, ttxid"); // deterministic
  params.set("$limit", "5000"); // the full qualifying set (~3.9k), to sample across A–Z

  const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`DataSF fetch failed: ${res.status} ${res.statusText}`);
  const rows = await res.json();

  // Collect ALL qualifying, deduped names per category, in alphabetical order.
  const seen = new Set();
  const byCategory = { Restaurant: [], Retail: [] };
  for (const row of rows) {
    const category = CROSSWALK[sanitizeText(row.naic_code_description)];
    if (!category) continue;
    const name = sanitizeText(row.dba_name);
    if (name.length < 3) continue; // demo legibility (documented selection rule)
    // Quality filter: a real storefront name starts with a LETTER. Excludes the
    // address-as-name registrations ("1200 4th Street") that read as junk in a demo;
    // a few digit-led real names ("14 Peaks") are an accepted, documented loss.
    if (!/^[A-Za-z]/.test(name)) continue;
    const key = nameKey(name);
    if (seen.has(key)) continue;
    seen.add(key);
    byCategory[category].push({ merchant_name: name, merchant_category: category });
  }

  // Deterministic STRIDE sample so the set spreads across the alphabet (variety),
  // not the first N 'A' names. stride = floor(M / PER_CATEGORY); take every stride-th.
  const sample = (list) => {
    if (list.length <= PER_CATEGORY) return list;
    const stride = Math.floor(list.length / PER_CATEGORY);
    return Array.from({ length: PER_CATEGORY }, (_, k) => list[k * stride]);
  };
  const entities = [...sample(byCategory.Restaurant), ...sample(byCategory.Retail)];
  if (entities.length === 0) throw new Error("no entities selected — check the query");

  const snapshot = {
    _provenance: {
      source: "DataSF — Registered Business Locations (San Francisco)",
      dataset_id: DATASET,
      endpoint: ENDPOINT,
      license: "PDDL 1.0 (Public Domain Dedication and License)",
      // The real fetch date (intentional provenance). For a byte-reproducible regeneration,
      // pin it: FETCHED_AT=2026-06-20 node scripts-ts/build-hybrid-snapshot.mjs
      fetched_at: process.env.FETCHED_AT || new Date().toISOString().slice(0, 10),
      fields_used: ["dba_name", "naic_code_description", "city", "state"],
      pii_excluded: [
        "ownership_name",
        "full_business_address",
        "business_zip",
        "certificate_number",
        "ttxid",
        "location (coordinates)",
      ],
      selection:
        "active SF locations; NAICS in {Food Services->Restaurant, Retail Trade->Retail}; " +
        "sanitized; deduped by name; name length >= 3 and starts with a letter (drops " +
        `address-as-name rows); ${PER_CATEGORY} per category, stride-sampled across the ` +
        "alphabetical set for variety",
      synthetic_note:
        "These are REAL business names + crosswalked categories only. The activation state " +
        "(onboarding progress, blockers, risk inputs) is SYNTHETIC, applied deterministically at " +
        "load by lib/ingest/overlay.ts — no public dataset exists for it.",
    },
    entities,
  };

  const outUrl = new URL("../legacy/activation/lib/data/sf-entities.snapshot.json", import.meta.url);
  writeFileSync(outUrl, JSON.stringify(snapshot, null, 2) + "\n");
  console.log(
    `Wrote ${entities.length} entities ` +
      `(${byCategory.Restaurant.length} Restaurant + ${byCategory.Retail.length} Retail) ` +
      `to ${outUrl.pathname}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
