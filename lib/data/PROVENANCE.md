# Hybrid dataset — provenance & honesty label

The demo/eval data lane is **hybrid**: a **real** open-data entity layer + a **synthetic** activation overlay. Honestly labeled at every surface that shows it.

## Real layer — `sf-entities.snapshot.json`

- **Source:** DataSF — *Registered Business Locations (San Francisco)*, dataset `g8m3-pdis`.
- **License:** **PDDL 1.0** (Public Domain Dedication and License) — permits redistribution of the frozen snapshot with attribution.
- **What it contains:** ONLY the public storefront name (`dba_name`, sanitized as untrusted text) and a category crosswalked from the dataset's `naic_code_description`.
- **PII excluded (never fetched, never stored):** `ownership_name`, `full_business_address`, `business_zip`, `certificate_number`, `ttxid`, and `location` coordinates.
- **Category crosswalk (measured 2026-06-19):** the dataset's NAICS is **sector-level only**, so the honest mapping is `Food Services → Restaurant` and `Retail Trade → Retail`. Grocery/Convenience are **not separable** from this source's granularity, so they are left to the synthetic lane rather than fabricated. The core still supports all four categories.
- **Selection:** active SF locations; sanitized; deduped by name; name length ≥ 3 and starts with a letter (drops address-as-name registrations); 10 per category, stride-sampled across the alphabetical set for variety. Deterministic.
- **Regenerate:** `node scripts-ts/build-hybrid-snapshot.mjs` (live fetch → re-freeze). Not part of CI; the committed snapshot is the reproducible input (no network at build/test time).

> Note: a few entries are sole-proprietor DBAs registered under a personal name — these are **public registered trade names**, not private PII. Flagged for the owner's public-posting review.

## Synthetic layer — `lib/ingest/overlay.ts`

No public dataset exists for onboarding progress / blockers / risk inputs, so the activation state (`days_since_signup`, `last_login_days_ago`, `steps_completed`, `source_risk_level`) is **synthetic**. It is **deterministic** (seeded by the real name + index, no wall-clock) and applied **at load** — so the frozen file holds only real data, and the synthetic state is transparent, tested code rather than baked numbers. Designed for coverage (every blocker + a Low/Medium/High spread).

**Honest label (use verbatim on surfaces):** *"Real open business data (DataSF, public domain); activation state is synthetic and illustrative. No real merchant relationship, account, or PII."*
