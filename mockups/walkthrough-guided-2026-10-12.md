# Walkthrough, guided — design notes (2026-10-12)

This mockup (`walkthrough-guided-2026-10-12.html`) is a proposal. Nothing in the product changed.

## Approach

**`minimalist-ui`**, meaning premium minimal with editorial restraint. I took its structure: hairlines instead of boxes, disclosures with no container, generous space, color only where it means something. I rejected its palette, serif and square buttons, because DESIGN.md's owner-fixed tokens outrank a skill default. Where the instrument lives (picker, receipts, arithmetic, ledger), I used product-app density.

## Path

**One run** goes through eight steps, tracked by a left progress rail with words and no numerals: The problem · Inputs · Verdict · Why · Impact · Governance · Artifacts · Proof. After the run, each rail entry also shows its step's state ("FAIL", "awaiting signature", "built, not sent"). Every object carries the same thread line (scenario · run id). Run lights the crew in order, ending at *a person signs*, then moves the page to the verdict. Before a run, each step says only what will fill it. Depth is one `<details>` below each step. At 768 the rail becomes the 34px strip under the bar.

## Fold

The first render at 1280×900 was measured: zones bottom 653, **run bottom 918 (fail)**. I then cut the H1 to two lines, scenario names to one line, and the zone hint to one line. A second render was not allowed under this brief, so these are **estimates** from the measured line heights:

- 1280×900: zones ≈ 584, run ≈ 758
- 1920: zones ≈ 589, run ≈ 763; the 1180px column holds and the rail widens to 196px
- 768: zones ≈ 585, run ≈ 876 (fine at 1024 tall, marginal at 900)

A port must re-measure through `canonical.spec.ts`.

## Kept

- Workbench on screen one; the run control is never disabled.
- Two drop zones and the template link.
- Verdict slab: lamp, mono FAIL, tally, receipt arithmetic.
- Artifacts BUILT, NOT SENT. The SIMULATED banner is the builder's verbatim first block, emoji included, labeled as builder-written.
- Ledger proof; footer "What is real".
- All tokens, both schemes, radii, easings, weights.

## Changed

- Six stations became **eight steps**. FEES becomes the `fee-precheck` scenario.
- The ticker became the crew chain inside the instrument.
- New steps:
  - **Why:** deterministic `explain_drift`; the root-cause seat shows DEFER.
  - **Impact:** visible formulas, a SIMULATED chip, one declared assumption.
  - **Governance:** tiers 0–3 and a sign stub that records and calls nothing.
- A partner ticket joins Slack and email in tabs.
- The bar keeps brand · What is real · scheme toggle · `#audit` pill. Destination links are gone.
- On desktop, a left rail replaces the strip, which saves 34px of fold.
- The H1 phrase is solid ultramarine, with no gradient.
- Every derived figure is a dashed `{{placeholder}}` slot.

## Settled decisions touched

- **"Six stations"** is replaced. The owner's word must be recorded in DESIGN.md before a port.
- **Nav link set** (pinned in `canonical.spec.ts`) is reduced. The pill-to-`#audit` decision is kept.
- Nothing else is touched.

## For the owner

1. Do you adopt eight steps, with FEES folded into a scenario?
2. Do you accept a left rail and a bar with no destination links, so other routes are reached only from steps and the footer?
3. Which scenarios are built today? Unbuilt ones should render as "arrives with the next build". Which scenario is the default? (Here: `modifier-drift`.)

## Gaps

- `/docs` "What is real" has no anchor id.
- Fonts here resolve only if installed locally.
