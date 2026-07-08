# Design samples — 2026-07-08 (seventeenth session)

Five redesign candidates for the `/report` web surface, produced on the owner's word
("give 3 to 5 design samples using all the skills and subagents based the context").
Design-shotgun pattern: five parallel `frontend-specialist` subagents, one direction each,
all rendering the SAME real committed golden fixture
(`fixtures/synthetic-restaurant/expected-report.acp.json` — FAIL · 16 findings · 11 error / 5 warn / 0 info).

**Status: PICKED — the owner chose #1 Ledger with a gallery-white ground (2026-07-08, eighteenth session; decision-log row).** The implementation slice restyled the real `/report` + `/demo` surfaces to sample 1's token plan with `--paper` moved `#F9F9F6 → #FFFFFF` (single-token swap, advisor-ruled; every other token verbatim). These files stay as
internal mockups (like the sibling files in `mockups/`), not shipped surfaces. Each file
is a self-contained HTML fragment (inline CSS, zero external requests) written for the
claude.ai artifact wrapper; open locally by adding a doctype/body wrapper or view the
published artifacts (session links in HANDOFF).

| # | File | Direction | One line |
|---|------|-----------|----------|
| 1 | `sample-1-ledger.html` | **Ledger** | Swiss/international-typographic audit certificate — paper white, ink, ONE ultramarine accent (`#1B3EB8`), grid-strict, no radius/shadow. |
| 2 | `sample-2-console.html` | **Console** | Calm forensic terminal — deep cool blue-grey ground (`#151B24`); mono = machine register, sans = human register. |
| 3 | `sample-3-broadsheet.html` | **Broadsheet** | Serif editorial investigation — cold paper (not cream), oxblood accent (`#6E1423`), headline-as-thesis, findings as exhibits. |
| 4 | `sample-4-controlroom.html` | **Control Room** | Enterprise audit-dashboard UI — left summary rail (verdict/severity bar/category counts) + severity-striped finding cards, slate-teal (`#2F6D7A`). |
| 5 | `sample-5-dossier.html` | **Dossier** | Evidence case-file — manila desk ground, typewriter-stamped fields, SIMULATED as a literal stamp (`#9C3222`); the deliberate risk take. |
| 6 | `sample-6-instrument.html` | **Instrument** | *(added 2026-07-08, eighteenth session — a DIFFERENT genre from 1–5)* World-displayable STORY surface: light-ground evidence instrument (premium page-white `#FBFBFD` ground + `#F5F5F7` Apple-neutral panels **per two owner words 2026-07-08 — "no dark background", then "gallery white or apple 2026 premium white background"; the dark first cut revised in place twice, content byte-unchanged both times**; deep green-tinted ink `#17221E`, near-invisible 24px blueprint grid, ONE deep-viridian accent `#0A6349`, all text ≥5.2:1), full narrative arc (problem → instrument → real evidence → eval discipline → honest close) with 7 real findings + receipts. Copy = `sample-6-copy-deck.md` (domain-expert writing agent, every claim repo-grounded, anti-slop audited; orchestrator filled the live test count 947+6). Does NOT reopen the Ledger pick — `/report`+`/demo` are implemented Ledger; #6 is a candidate for the world-facing landing/story page. |

## Verification (Fable-equivalence review, run inline 2026-07-08)

All five builder subagents died at their FINAL step on the shared seat limit
(raw: "You've hit your session limit · resets 9:10am (America/New_York)") AFTER writing
their files; the safety classifier was also down for their review. The review therefore
ran inline on the main seat. Machine-checked, all five PASS:

- verbatim SIMULATED banner sentence + footer honesty paragraph (from `components/report/ReportView.tsx`);
- all 16 findings, plain-line-first + four receipts (claim source·field=value / reference row / rule / class) + severity;
- verdict tally correct (16 · 11/5/0, recomputed from the fixture);
- zero banned framing ("agent gets caught" class), zero external URLs (CSP-clean), fragment format, `<title>` present.

## Recommendation on record (not a decision)

**#1 Ledger** primary (both-audience legibility, printable, ages best);
**#4 Control Room** if the surface should read as a product rather than a document;
**#2 Console** as the personality pick for the AI-engineer showcase audience.

The pick is an OWNER call. On the word (e.g. "go with Ledger", hybrids allowed), the
implementation slice rewrites `app/globals.css` + `components/report/ReportView.tsx` /
`components/demo/DemoView.tsx` styling to the chosen direction under the full per-slice
gate (verify green floor 944+6 · test:legacy 306+5 · red-green · Codex changed-files
review) — which then unblocks the standing design→deploy owner item (deploy stays
owner-gated, design-first per the 2026-07-03 ruling).
