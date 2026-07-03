/**
 * The HYBRID dataset, assembled: frozen REAL entities (DataSF, lib/data/
 * sf-entities.snapshot.json) + the deterministic SYNTHETIC activation overlay
 * (lib/ingest/overlay.ts), producing normalization-ready MerchantInputs.
 *
 * This is the demo + live-LLM-eval data lane. The frozen 20-merchant Python golden
 * (eval/golden_merchants.v1.json, proven byte-identical by the differential test) stays
 * the SEPARATE reference/regression lane — the add-alongside split the plan ratifies.
 *
 * The real layer is loaded once and integrity-checked at module load (fail loud on a
 * corrupted snapshot); the overlay is pure + deterministic, so getHybridMerchants() is
 * reproducible with no wall-clock and no network.
 */
import { CATEGORIES } from "@/legacy/activation/lib/core/constants";
import type { MerchantInput } from "@/legacy/activation/lib/core/types";
import { assembleMerchantInput } from "@/legacy/activation/lib/ingest/overlay";
import type { RealEntity } from "@/legacy/activation/lib/ingest/sf-adapter";
import snapshot from "@/legacy/activation/lib/data/sf-entities.snapshot.json";

export interface HybridProvenance {
  source: string;
  dataset_id: string;
  endpoint: string;
  license: string;
  fetched_at: string;
  fields_used: string[];
  pii_excluded: string[];
  selection: string;
  synthetic_note: string;
}

/** Validate the frozen real layer at load — a corrupted snapshot fails loud, never silently. */
function loadEntities(): RealEntity[] {
  const entities = snapshot.entities as RealEntity[];
  if (!Array.isArray(entities) || entities.length === 0) {
    throw new Error("hybrid snapshot: entities is empty or not an array");
  }
  for (const e of entities) {
    if (typeof e.merchant_name !== "string" || e.merchant_name.trim() === "") {
      throw new Error(`hybrid snapshot: invalid merchant_name ${JSON.stringify(e)}`);
    }
    if (!CATEGORIES.includes(e.merchant_category)) {
      throw new Error(
        `hybrid snapshot: "${e.merchant_name}" has category "${e.merchant_category}" ` +
          `not in the product vocab [${CATEGORIES.join(", ")}]`,
      );
    }
  }
  return entities;
}

const REAL_ENTITIES = loadEntities();

/** The frozen real-entity layer (sanitized name + crosswalked category only). */
export function getRealEntities(): RealEntity[] {
  return REAL_ENTITIES;
}

/** The assembled hybrid merchants (real entities + deterministic synthetic overlay). */
export function getHybridMerchants(): MerchantInput[] {
  return REAL_ENTITIES.map((entity, idx) => assembleMerchantInput(entity, idx));
}

/** Source/license/PII provenance for the real layer (honest-label surfaces read this). */
export const hybridProvenance = snapshot._provenance as HybridProvenance;
