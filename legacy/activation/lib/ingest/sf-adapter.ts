/**
 * SF "Registered Business Locations" (DataSF, dataset g8m3-pdis, PDDL 1.0
 * public-domain) -> the real ENTITY layer of the hybrid dataset.
 *
 * This is the reusable, SOURCE-SWAPPABLE adapter: it maps one source's row shape to
 * the product's neutral RealEntity, applying (1) the trust boundary (sanitize the
 * untrusted business name), (2) the NAICS crosswalk to the product's category vocab,
 * and (3) the PII exclusion (only the storefront `dba_name` + derived category leave
 * this boundary — see lib/data/PROVENANCE.md). A different marketplace swaps THIS file
 * for its own export against the same RealEntity contract; nothing downstream changes.
 *
 * Honest granularity note (measured 2026-06-19 against the live dataset): DataSF's
 * `naic_code_description` is SECTOR-level only ("Food Services", "Retail Trade") — it
 * cannot separate Grocery/Convenience from general Retail. So the real layer credibly
 * populates Restaurant + Retail; the core still supports all four categories, but the
 * two it can't source from this granularity are left to the synthetic lane rather than
 * fabricated. Measured-data judgment, documented — not invented.
 */
import type { MerchantCategory } from "@/legacy/activation/lib/core/constants";
import { sanitizeText, MAX_NAME_LEN } from "@/legacy/activation/lib/ingest/sanitize";

/**
 * The subset of the DataSF row this adapter reads. Every other column — including the
 * PII fields `ownership_name`, `full_business_address`, `business_zip`,
 * certificate/`ttxid` numbers, and `location` coordinates — is deliberately NOT in
 * this type, so PII cannot cross the boundary even by accident (plan Blindspots:
 * "Data license/PII"). All optional: Socrata omits null fields from JSON.
 */
export interface SfBusinessRow {
  dba_name?: string;
  naic_code_description?: string;
  city?: string;
  state?: string;
  /** Present iff the business location has closed; we keep active locations only. */
  location_end_date?: string;
}

/** The neutral, source-agnostic real-entity contract every source adapter targets. */
export interface RealEntity {
  /** Real storefront name (sanitized untrusted text). */
  merchant_name: string;
  /** Crosswalked from the source's category field to the product vocab. */
  merchant_category: MerchantCategory;
}

export type AdaptOutcome =
  | { ok: true; entity: RealEntity }
  | { ok: false; reason: string };

/**
 * NAICS sector description -> product category. Exact-match on the two
 * delivery-relevant sectors the dataset exposes; everything else is intentionally
 * absent (a row in another sector is dropped, not force-fit).
 */
export const NAICS_CATEGORY_CROSSWALK: Readonly<Record<string, MerchantCategory>> = {
  "Food Services": "Restaurant",
  "Retail Trade": "Retail",
};

/** Dedup / identity key for a business name: lowercase, collapse whitespace, trim. */
export function nameKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * Adapt ONE raw DataSF row to a RealEntity, or drop it with a SPECIFIC reason (never
 * a silent drop). Pure + framework-free, so it unit-tests in isolation and the build
 * script is a thin fetch+loop around it.
 */
export function adaptSfRow(row: SfBusinessRow): AdaptOutcome {
  const city = sanitizeText(row.city, MAX_NAME_LEN);
  if (city.toLowerCase() !== "san francisco") {
    return { ok: false, reason: `out-of-SF location (city="${city || "?"}")` };
  }

  // Active locations only: a closed location is not a plausible activation target.
  if (sanitizeText(row.location_end_date, MAX_NAME_LEN) !== "") {
    return { ok: false, reason: "inactive location (has location_end_date)" };
  }

  const naics = sanitizeText(row.naic_code_description, MAX_NAME_LEN);
  const category = NAICS_CATEGORY_CROSSWALK[naics];
  if (!category) {
    return {
      ok: false,
      reason: naics
        ? `category "${naics}" is not a delivery-marketplace category`
        : "no reported NAICS category",
    };
  }

  const merchant_name = sanitizeText(row.dba_name, MAX_NAME_LEN);
  if (merchant_name === "") {
    return { ok: false, reason: "missing/empty business name (dba_name)" };
  }

  return { ok: true, entity: { merchant_name, merchant_category: category } };
}
