# synthetic-restaurant-large — a menu-scale synthetic restaurant with a daily drift series

**Plain-English:** a made-up restaurant with 300 menu items, a record of what it sells, and 7 daily copies of its menu that slowly drift away from that record. It exists to measure one thing: how many findings the checker raises on a full-size menu, and how many of them are only warnings. Every file is **synthetic and simulated** — an invented restaurant, with invented items and prices.

**Professional register:** a seeded, deterministic fixture. The record is generated from a seed; each daily feed is the previous day's feed plus drift applied at **declared assumption rates**; the existing listings engine is run on every day at generation, and every figure below is read from that run. A freeze test regenerates the folder in memory and compares it byte for byte.

## Contents

| File | What it is |
| --- | --- |
| `record.json` | The system of record, in the same simulated catalog shape as `../synthetic-restaurant/sor.catalog.json`: 10 categories, 300 items, 478 variations (463 served on the feed; the rest are hidden), 139 modifier groups carrying 458 options, and hours windows per category. |
| `feeds/day-01.json` … `feeds/day-07.json` | The marketplace copy on each day, in the ACP feed shape with the menu extension (modifier options on every row; hours once per item, on its first row). One row per line. Day one is the faithful copy plus one day of drift. |
| `manifest.json` | Machine-readable: the seed, the counts, the declared assumptions, and per day the drift applied and the engine's findings. |

## What the checker found

| Day | Findings | Errors | Warnings | Per hundred items | Warn share | New that day | New per hundred items | Rules that fired |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `day-01` | 21 | 19 | 2 | 7.00 | 9.5% | 21 | 7.00 | LST-AVAIL-STATE ×4, LST-ENC-TRUNC ×1, LST-HOURS-WINDOW ×1, LST-IDENT-NAME ×1, LST-MOD-MISSING ×5, LST-MOD-PRICE-VALUE ×7, LST-PRICE-VALUE ×2 |
| `day-02` | 48 | 45 | 3 | 16.00 | 6.3% | 27 | 9.00 | LST-AVAIL-STATE ×13, LST-ENC-TRUNC ×2, LST-HOURS-WINDOW ×1, LST-IDENT-NAME ×2, LST-MOD-MISSING ×11, LST-MOD-PRICE-VALUE ×15, LST-PRICE-VALUE ×4 |
| `day-03` | 61 | 53 | 8 | 20.33 | 13.1% | 13 | 4.33 | LST-AVAIL-STATE ×16, LST-ENC-TRUNC ×4, LST-HOURS-WINDOW ×4, LST-IDENT-NAME ×2, LST-MOD-MISSING ×12, LST-MOD-PRICE-VALUE ×18, LST-PRICE-VALUE ×5 |
| `day-04` | 85 | 72 | 13 | 28.33 | 15.3% | 24 | 8.00 | LST-AVAIL-STATE ×18, LST-ENC-TRUNC ×7, LST-HOURS-WINDOW ×6, LST-IDENT-NAME ×3, LST-MOD-MISSING ×16, LST-MOD-PRICE-VALUE ×24, LST-PRICE-VALUE ×11 |
| `day-05` | 93 | 79 | 14 | 31.00 | 15.0% | 9 | 3.00 | LST-AVAIL-STATE ×20, LST-ENC-TRUNC ×8, LST-HOURS-WINDOW ×6, LST-IDENT-NAME ×3, LST-MOD-MISSING ×19, LST-MOD-PRICE-VALUE ×25, LST-PRICE-VALUE ×12 |
| `day-06` | 113 | 95 | 18 | 37.67 | 15.9% | 21 | 7.00 | LST-AVAIL-STATE ×23, LST-ENC-TRUNC ×9, LST-HOURS-WINDOW ×9, LST-IDENT-NAME ×5, LST-MOD-MISSING ×26, LST-MOD-PRICE-VALUE ×27, LST-PRICE-VALUE ×14 |
| `day-07` | 127 | 105 | 22 | 42.33 | 17.3% | 14 | 4.67 | LST-AVAIL-STATE ×26, LST-ENC-TRUNC ×9, LST-HOURS-WINDOW ×13, LST-IDENT-NAME ×5, LST-MOD-MISSING ×28, LST-MOD-PRICE-VALUE ×30, LST-PRICE-VALUE ×16 |

"Per hundred items" is the day's findings divided by the 300 catalog items, times one hundred. "Warn share" is the day's warnings divided by its findings. By the last day the series stands at 42.33 findings per hundred items, 17.3% of them warnings.

Two readings sit side by side. The cumulative columns count every finding standing on that day; because nothing is repaired between days, they only grow. "New that day" counts the findings that were not reported the day before, which is the number a person working through daily alerts would see arrive; its per-hundred figure uses the same denominator. No repair model is included: nothing is corrected. A finding leaves the list only when a later drift on the same option replaces it with a different finding; 2 did so across all days.

## Declared assumptions

The drift rates are **assumptions we set for this measurement**. They are not measurements of any market, platform or merchant, and nothing here states how often any menu drifts.

Each day, every unit that is still in sync with the record has this chance of drifting:

| What drifts | Unit | Chance per day |
| --- | --- | --- |
| served price | a served row | 0.6% |
| in-stock / sold-out state | a served row | 0.8% |
| name (garbled, cut off or renamed) | a served row | 0.4% |
| modifier option price | one option on one served row | 0.6% |
| modifier option left off the copy | one option on one served row | 0.4% |
| opening time of one hours window | an item's first served row | 1.0% |

Drift accumulates: nothing is corrected between days, so a later day carries every earlier day's findings. The figures are the instrument's output at these rates and say nothing about other rates. The hours check allows 15 minutes of sync lag before it warns.

## Regenerate

```
node scripts-ts/generate-large-fixture.mts
```

Seed 20261101, record as-of 2026-11-01T00:00:00Z. The generator uses its own random streams and reads nothing from the other fixtures. `evals/packs/large-fixture.test.ts` regenerates in memory and compares every file byte for byte, re-runs the engine on each day independently of the manifest, and checks every figure in this file against it.

## Honesty box

- All data is synthetic and simulated; the restaurant, items, prices and drift are invented.
- The drift rates are declared assumptions, not findings about any market.
- No platform is named, called or implied; no platform data or access is claimed.
- Human-led, AI-assisted, professionally reviewed.
