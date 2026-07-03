/**
 * Typed accessor for the RECORDED LIVE Gemini run (lib/data/live-samples.snapshot.json).
 * Frozen because a live call isn't recomputable — lets the console showcase REAL model output
 * (and the honest findings) with zero re-spend. Regenerate with:
 *   node --env-file=.env node_modules/.bin/vitest run evals/live-smoke.test.ts  (then refresh the JSON)
 */
import data from "@/legacy/activation/lib/data/live-samples.snapshot.json";

export interface LiveSampleRow {
  merchant: string;
  blocker: string;
  mode: string;
  costUsd: number;
  errorClass: string | null;
  gatekeeper: string;
  gateFailures: string[];
  eval: string;
  subject: string;
  body: string;
}

export interface LiveSamplesProvenance {
  recorded_at: string;
  model: string;
  pricing_version: string;
  note: string;
  total_cost_usd: number;
  modes: Record<string, number>;
  gate: Record<string, number>;
  honest_findings: string[];
}

const raw = data as unknown as { _provenance: LiveSamplesProvenance; rows: LiveSampleRow[] };

export const liveSamples: { provenance: LiveSamplesProvenance; rows: LiveSampleRow[] } = {
  provenance: raw._provenance,
  rows: raw.rows,
};
