# Hybrid dataset — provenance & honesty label

The demo/eval data lane is **hybrid**: a **source-swappable entity layer** + a **synthetic** activation overlay. The public demo **DISPLAYS fictional names** (so synthetic "high-risk / stalled" states are never attached to real businesses or people — the pre-deploy grill's #1 finding); the **real-data capability** lives in the adapter. Honestly labeled at every surface.

## Displayed layer — `sf-entities.snapshot.json` (FICTIONAL)

- **What it contains:** 20 **invented** business names (10 Restaurant + 10 Retail) — NOT real businesses. ONLY `merchant_name` + `merchant_category` per record (no other fields).
- **Why fictional:** attaching the synthetic activation state to real public-record names — some of which are sole-proprietor *personal-name* DBAs — would be a privacy/optics harm on a public page. Fictional display removes that without weakening the real-data capability claim.

## Real-data capability — `lib/ingest/sf-adapter.ts` (the swap target)

- **Source:** DataSF — *Registered Business Locations (San Francisco)*, dataset `g8m3-pdis`. **License:** **PDDL 1.0** (public domain).
- **What the adapter takes:** ONLY the public storefront name (`dba_name`, sanitized as untrusted text) + a category crosswalked from `naic_code_description`. **PII excluded (never fetched/stored):** `ownership_name`, `full_business_address`, `business_zip`, `certificate_number`, `ttxid`, `location` coordinates.
- **Category crosswalk (measured 2026-06-19):** NAICS is **sector-level only** → `Food Services → Restaurant`, `Retail Trade → Retail`. Grocery/Convenience aren't separable from this source, so they're left to the synthetic lane, not fabricated. The core still supports all four.
- **Adopt with real data:** point the adapter at a real DataSF export (or any source) via its documented contract — `evals/hybrid-dataset.test.ts` proves the adapter ingests/sanitizes/PII-scrubs real rows. The build script `scripts-ts/build-hybrid-snapshot.mjs` does the live fetch; the committed snapshot is the reproducible (fictional) demo input (no network at build/test time).

## Synthetic layer — `lib/ingest/overlay.ts`

No public dataset exists for onboarding progress / blockers / risk inputs, so the activation state (`days_since_signup`, `last_login_days_ago`, `steps_completed`, `source_risk_level`) is **synthetic**. It is **deterministic** (seeded by the real name + index, no wall-clock) and applied **at load** — so the frozen file holds only real data, and the synthetic state is transparent, tested code rather than baked numbers. Designed for coverage (every blocker + a Low/Medium/High spread).

**Honest label (use verbatim on surfaces — see `HONEST_DATA_LABEL` in `lib/product.ts`):** *"The merchant names shown are FICTIONAL (no real businesses). The product's adapter ingests real DataSF public-record names (PDDL 1.0, public domain — name + category only, PII-scrubbed). Activation state is synthetic and illustrative. No real merchant relationship or account."*
