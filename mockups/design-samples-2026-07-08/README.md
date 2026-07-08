# Design samples — 2026-07-08 (seventeenth session)

Five redesign candidates for the `/report` web surface, produced on the owner's word
("give 3 to 5 design samples using all the skills and subagents based the context").
Design-shotgun pattern: five parallel `frontend-specialist` subagents, one direction each,
all rendering the SAME real committed golden fixture
(`fixtures/synthetic-restaurant/expected-report.acp.json` — FAIL · 16 findings · 11 error / 5 warn / 0 info).

**Status: SAMPLES ONLY — no direction picked, no product code changed.** These are
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
