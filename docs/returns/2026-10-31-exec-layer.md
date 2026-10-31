# Return packet — Wave 2 lane `exec-layer` (2026-10-31)

**Plain English:** this lane fixed the wording the Wave 1 acceptance review flagged in the pilot kit and governance documents, built the executive page `/pilot` (every number on it is computed by code and checked by tests), and wrote the two short executive documents. Nothing was pushed, deployed or sent.

## SLICE

Wave 2, lane 5 (`exec-layer`), branch `wave2/exec-layer`, worktree `.worktrees/exec-layer`, started from `61a6127` (WIP `4a66958` on `cd0d347`). Packet: CP1 docs corrections · CP2 `lib/landing/pilot-figures.ts` · CP3 `/pilot` · CP4 README routes + kit README · CP5 gates + this packet. Plus the coordinator's mid-run amendment (security review F14 and F3a; Impact and ledger merged on `main` tonight).

Started 01:21 EDT; CP1 green 01:37; CP2 01:45; CP3 01:47; CP4 01:51; full gates 01:52.

## GIT

`git status --short` at packet time: `?? node_modules` only (the lane symlink; untracked — see DEVIATIONS 12).

`git log --oneline` (newest first, before this packet's own commit):

```
af6a1dc wip(exec-layer): plan §§ 7/17 — 'enforced by sampling' marked UNVERIFIED; § 17 injection threshold per the 2026-10-31 re-read
4ae0c6d wip(exec-layer): pilot-proposal Size row reflects lib/impact merged 2026-10-31
957e4db wip(exec-layer): CP4 — README routes sentence names /pilot (five supporting routes); kit README rule for /pilot's derived figures; readme-route-claims green
0c70341 wip(exec-layer): evals/e2e/pilot.spec.ts authored (both schemes paint, nav unchanged, axe 0 per scheme, rendered arithmetic closes) — not run in-lane, CI adjudicates
553da77 wip(exec-layer): mutation records in both new suites
81b7b6b wip(exec-layer): CP3 green — /pilot page + built-page suite (18) + C10 enrolment
335b7b5 wip(exec-layer): CP2 green — lib/landing/pilot-figures.ts + 25 tests; budget-guard statements updated
72762ac fix(exec-layer): untrack the node_modules symlink that 'git add -A' swept into the CP1 commit
4a8c763 wip(exec-layer): CP1 docs corrections green … vitest 1823+8
```

`git merge-tree --write-tree --name-only main HEAD` at `af6a1dc` → a tree id and **no conflicts** (main at `7e4f699`, which carries the freshness, S2-impact, S2-ledger and security-review merges).

## CHANGED

| File | What |
| --- | --- |
| `docs/pilot-kit/pilot-proposal.md` | Items 1–3, 8–10, 25: proposal/hypothesis wording with BUILT/ARRIVES/MERGED states; "first to notice" → sourced + UNVERIFIED; "confirms or holds" → PROPOSED, not built; "sampling" → UNVERIFIED with the 99.9 % baseline re-read 2026-10-31; free-tier date + "re-verified at use"; § 2 freshness corrections (Menu Maker direction, learning-center citation, 03-03 date UNVERIFIED, grocery app); § 4 scenario table refreshed; ILLUSTRATIVE label + drift-lock pointer beside $108,000 |
| `docs/governance-model.md` | Items 4–7: C10 described exactly (explicit list + eight patterns + rendered visible text; no metadata/a11y attributes; endorsement/approval/money-recovered probes ARRIVE S1.5); "signs a proposal; nothing acts"; explain-drift "designed to show … once it lands"; vendor guidance cited with read date; MERGED 2026-10-31 legend row; Impact/ledger merged; budget-guard box updated to `settleCall` merged, unwired; `fac8204` → `cd0d347` |
| `docs/model-risk-register.md` | Must-fix :38 (Audit/Evidence BUILT; Impact + ledger MERGED 2026-10-31; Route/Explain-drift ARRIVE S2); Reviewer F3a line (coordinator); Groq row read 2026-10-12 + 2026-10-31 label UNVERIFIED; Google row read 2026-10-09; § 5 budget row → `settleCall` merged, unwired |
| `docs/pilot-kit/demo-script-10min.md` | Items 10, 12–14 + stale labels: "No model can flip a verdict; the AI seats recommend only"; ticker line points at `canonical.spec.ts`; "bundled statement"; roadmap refreshed; provenance-label item removed; `/pilot` line; Q&A exports line fixed for synthetic-throughout |
| `docs/pilot-kit/success-metrics.md` | Item 18 (five built scenarios held by `scenarios.test.ts`; 2/6 S1.5; 8 S3); A2 ledger state |
| `docs/pilot-kit/data-request-spec.md` | Item 19 tense; :29 modifier checks BUILT; provenance label no longer "ARRIVES S3" (dropped 2026-10-14); ledger state |
| `docs/pilot-kit/security-one-pager.md` | F14 (CSV BUILT; JSON ARRIVES with S1.5); ledger row; budget-guard bullet |
| `docs/pilot-kit/README.md` | Status rows refreshed; executive brief, five-minute walk and `/pilot` added to both tables; rule for `/pilot`'s derived figures |
| `docs/pilot-kit/executive-brief.md` | WIP draft rewritten: "not claiming" box; capability table with states; freshness facts; no typed cost figures (points at `/pilot`) |
| `docs/pilot-kit/five-minute-walk.md` | WIP draft rewritten: "not claiming" box; `/pilot` beat; scenario ids with real states (no lane jargon) |
| `docs/plan-menu-integrity-crew-2026-10-09.md` | §§ 7/17 only: "enforced by sampling" UNVERIFIED; § 17 threshold per re-read (WIP `4a66958` rewrote the § 7/§ 17 claims earlier) |
| `lib/landing/pilot-figures.ts` (new) | The one module `/pilot` reads: cost model (declared integer constants, exact arithmetic, throws on a fraction), bundled pair from `GUIDE`, scenario library read from `fixtures/scenarios/*/manifest.json` (refuses non-simulated), tiers/controls/before-after as text, M1, a `STATE` block of in-flight labels |
| `app/pilot/page.tsx` (new) | Static route outside the nav, on the `/docs` layer (`docs-main pilot-main`); sections: what this is/is not · delivery point · before/after · cost model · M1 · governance · scenario library · data and security · "What is real" link; every figure a `data-pilot` field |
| `app/globals.css` | `.pilot-*` block only (tokens only, no literal colours, no new token or font; the technical line in the sans, mono kept for figures, states and inline code), inserted before the fees print block |
| `evals/packs/pilot-figures.test.ts` (new) | 25 tests (ARITHMETIC · FORMATTERS · SOURCES · LABELS · BUNDLED · LIBRARY · GOVERNANCE · EGRESS) |
| `evals/packs/pilot-page.test.ts` (new) | 18 tests on the built `out/pilot.html` (FIGURES · NO TYPED DIGIT · REGISTER · §4 · NAV) |
| `evals/e2e/pilot.spec.ts` (new, not run) | 5 Playwright tests: paints light/dark + nav unchanged (×2), axe 0 (×2), rendered arithmetic closes |
| `evals/packs/honesty-c10.test.ts` | `siteShell` list block only: `app/pilot/page.tsx`, `lib/landing/pilot-figures.ts` |
| `README.md` | Routes sentence: "Five supporting routes …" and `/pilot` with its clause |

## TESTS

Full suite **1823 + 8 → 1870 + 8** (files 135 → 137). Baseline 1823 = `cd0d347`'s 1821 + the two WIP pilotDocs rows, measured at CP1 (after `build-offline`). **+47, fully accounted:** `pilot-figures.test.ts` +25 · `pilot-page.test.ts` +18 · `honesty-c10.test.ts` +4 (two new files × the platform-claims gate and the D1 framing gate, because `siteShell` feeds both; 170 → 174). No `.only`/`.skip`/`.todo`. No golden changed. `pilot.spec.ts` (5) is Playwright, outside vitest.

Mutations (each applied by hand, run, restored with `git checkout`, re-run green; recorded in the test headers):

| id | mutation | result |
| --- | --- | --- |
| M-a | refund exposure `+ 100` | 3 red (ARITHMETIC exposure; SOURCES plan § 7; SOURCES pilot-proposal table) |
| M-b | orders per store per day `30 → 31` | 2 red (both SOURCES locks; ARITHMETIC green by design) |
| M-c | `simulated !== true` refusal disabled | 1 red (LIBRARY refusal) |
| M-d | formatBp trailing-zero strip removed | 1 red (FORMATTERS, "1.50%") |
| P-a | "about 900,000 orders" typed in the cost prose (rebuilt) | 1 red (NO TYPED DIGIT) |
| P-b | derived cells rendered `value + 1` (rebuilt) | 2 red (FIGURES equality; exposure cell) |
| P-c | "Nothing acts." removed from the note (rebuilt) | 1 red (§4 carrier) |

## COMMANDS

| Command | Exit |
| --- | --- |
| `node scripts/build-offline.mjs` (CP1, CP3 ×2, each page mutation, final) | 0 each; `/pilot` listed `○ (Static)`; output `out/pilot.html` |
| `npx vitest run` (CP1 baseline) | 0 — 1823 passed · 8 skipped |
| `npx vitest run evals/packs/pilot-figures.test.ts` | 0 — 25 |
| `npx vitest run evals/packs/pilot-page.test.ts` | 0 — 18 |
| `npx vitest run evals/packs/honesty-c10.test.ts` | 0 — 174 (rendered scan includes `out/pilot.html`) |
| `npx vitest run evals/packs/readme-route-claims.test.ts evals/packs/readme-skip-claim.test.ts evals/packs/test-guide.test.ts` | 0 — 22 |
| `npx tsc --noEmit` (final) | 0 |
| `npx eslint . --max-warnings=0` (final) | 0 |
| `node scripts/build-offline.mjs` then `npx vitest run` (final) | 0 / 0 — **1870 passed · 8 skipped** |
| `npx vitest run evals/packs/honesty-c10.test.ts evals/packs/readme-route-claims.test.ts evals/packs/pilot-page.test.ts evals/packs/pilot-figures.test.ts` (final) | 0 — 221 |
| `git merge-tree --write-tree --name-only main HEAD` | 0 — no conflicts |
| Playwright render of `out/pilot.html` (scratchpad script, cached Chromium) | **failed — sandbox:** `bootstrap_check_in … MachPortRendezvousServer: Permission denied (1100)`; not retried with the sandbox off (owner rule) |

No environmental red in the vitest runs (build-offline ran before each full run).

**Gates re-run at `b861e8e`** (after the plan §§ 7/17 edit, the staleness guard and the sans change), 01:58 EDT: `build-offline` 0 · `tsc` 0 · `eslint . --max-warnings=0` 0 · `vitest run` 0 — **1870 passed · 8 skipped** (137 files; unchanged, the guard is a new assertion inside an existing test) · the four named suites 0 — 221. The guard was seen red first on the stale `out/` ("out/pilot.html is older than app/pilot/page.tsx — rebuild with scripts/build-offline.mjs"), then green after the rebuild.

## DEVIATIONS

1. **Freshness facts from `main` applied** (`fe30fb8`, `docs/research/freshness-2026-10-31.md`): the 2026-10-09 record had Uber's Menu Maker direction reversed, the 20–50 % figure on the wrong domain, the 03-03 date unreproduced, the 99 % floor as 99.9 % baseline. Fixed in `pilot-proposal.md` § 2 and § 3, `executive-brief.md`, the Groq row of the register. The cited freshness doc exists on `main`, not on this branch; the reference resolves at merge.
2. **Coordinator amendment** applied as worded (F14 one-pager row; F3a Reviewer line; Impact and ledger "MERGED 2026-10-31").
3. **Budget-guard honest-limit boxes updated, not removed** (governance § 4, register § 5, one-pager): main's `7e4f699` merged `settleCall` (the post-call overflow stop) as an unwired library function; the boxes now say so.
4. A **MERGED 2026-10-31** row added to the governance status legend, so "merged as a library, not wired into a run" has a name.
5. **Input-provenance label** removed as an "ARRIVES S3" item in three kit docs (the flag was dropped from S3 on 2026-10-14).
6. `demo-script` Q&A "Your side is a few exports" → reviewer time only in this pilot (D-7(a′)).
7. `fac8204` anchors re-pointed to `cd0d347` where statuses were re-checked (governance legend, demo-script, register sources).
8. The WIP executive brief and walk were **rewritten**, not patched: both stated capabilities as present and named absent scenario folders.
9. `pilot-proposal.md` § 4 scenario table refreshed (not on the review's list; it understated five built folders).
10. **C10 enrolment adds the module as well as the page**, in `siteShell`, so +4 tests rather than +1.
11. **No section numerals on `/pilot`** (DESIGN.md anti-pattern) despite the packet's (1)–(9); eyebrows instead, order kept.
12. **Register collision resolved:** the page may say "real" only inside the name "What is real, and what is invented"; the test strips that phrase and then forbids `\breal\b`.
13. **`/pilot` names the kit documents by repository path, not as links.** The site carries no source-repository links (owner word 2026-08-02, footer chrome); a GitHub link from a page would be a new pattern.
14. Review item 11 said "read 2026-10-12" for both vendor rows; the Google row's evidence is plan § 8 (2026-10-09), so it says that.
15. Small same-class tense fixes beyond the list: governance :45 ("once the route table lands"), plan §§ 7/17 "sampling" UNVERIFIED, demo-script "Wave 2" → "Wave 3" for the redesign (decision-log 2026-10-31).
16. **Accidental commit of the `node_modules` symlink** by `git add -A` in `4a8c763` (this branch predates main's `6fb6590` .gitignore fix); untracked in the next commit `72762ac`. Net tree is clean; history carries the add and the remove. All later commits staged explicit paths.

## OPEN

1. **Labels that flip at merge.** In code: the `STATE` block in `lib/landing/pilot-figures.ts` (`explainAndRoute`, `ledger`, `impactArithmetic`, `rootCauseSeat`, `jsonIngestDrop`, `partnerTicket`, `picker`). In docs, every "(in progress)" and "MERGED 2026-10-31": governance-model (roster rows, legend, Tier 1, Audit-trail and Model-risk rows, GOVERN C10 probes), model-risk-register :38 and § 5, kit README status table, demo-script roadmap, pilot-proposal §§ 3–4, success-metrics A2 and § 6, data-request-spec § 4, security-one-pager rows, executive-brief table, five-minute-walk.
2. **Scenarios 2 and 6** flip to BUILT on `/pilot` automatically once their folders exist and `build-offline` runs; the markdown tables above need a hand flip.
3. `/pilot` is not in `evals/e2e/a11y.spec.ts` `SURFACES` or `layout-sanity.spec.ts` `ROUTES` (outside this lane's files); `pilot.spec.ts` carries axe for both schemes meanwhile. Adding `/pilot` to those lists is a one-line orchestrator edit each.
4. `/docs`'s "What is real" section still has no `id` (a 2026-10-12 port condition); `/pilot` links to `/docs`.
5. Whether `/pilot` should hyperlink the repository documents (DEVIATION 13) is an owner call.
6. The digit allow-list accepts any `§ N` reference; a figure typed after "§" would pass. Accepted as a known edge.
7. Codex changed-files review of this lane is owed (deferred by owner word 2026-10-31).
8. **`readManifest` throws on a manifest without `figures.verdict` / `figures.findings`**, which fails the whole site build, not one row. `injected-artifact` (S3) is a crew-eval scenario and may not carry an engine verdict; the S3 packet should carry the manifest-shape contract, or the orchestrator softens that branch to render "—".
9. **Root-cause wording vs the 2026-10-14 decision** (the live root-cause exam is cut from this pilot): the proposal's "Why" row, governance roster row and register row say "renders DEFER until it passes an exam" / "exam is S5". Not false, but "no exam inside this pilot; it shows DEFER" is the sharper line.
10. `pilot-page.test.ts` now refuses an `out/pilot.html` older than its inputs (page, module, test-guide, globals.css, every scenario manifest). Every full run therefore needs `build-offline` first — already the standing rule.

## NOT DONE

- **`evals/e2e/pilot.spec.ts` was not run.** CI adjudicates.
- **No rendered visual review of `/pilot`** in either scheme or at 768 px: Chromium cannot launch in this sandbox (COMMANDS, last row). The pixel-quality bar (decision-log 2026-10-12 12:03) is unverified for this page; the CSS uses only existing tokens inside `.docs-main`, whose dark branch is pinned by `dark-scheme.test.ts`, which bounds but does not replace a look.
- README test-count line not touched (orchestrator re-measures at wave close, per packet).
- No edits to state docs, task-log, decision-log, `DESIGN.md`, nav, layout, `components/**`, fixtures.

## MODEL

Opus 5.5 (`claude-opus-5-5`), in a fresh-context builder subagent.
Same-seat build, so the comparison is to the packet rather than to another model: edge cases checked beyond it were the reversed Menu Maker fact already corrected on `main`, the static export's `out/pilot.html` (not `pilot/index.html`), React's entity encoding and tag-split punctuation in the built-HTML reader, and a fraction-refusing integer cost path so the recomputation test cannot agree with itself. Stops honoured: no sandbox bypass for the render, no edit to the a11y/layout route lists, no GitHub links on the page, no section numerals.
