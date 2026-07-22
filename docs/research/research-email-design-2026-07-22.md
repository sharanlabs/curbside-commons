# Research digest — transactional/report HTML email design (premium, client-safe)

**Provenance:** quarantined live sweep by the research-specialist agent, 2026-07-22 (session 32), on the owner's words "use all resources design skills and subagents. dont use memory and training knowledge" + "also the content do a research and personalize to our context and project as of today's date." Every load-bearing claim carries a live citation fetched this date. Model memory was not a source. Purpose: ground the redesign of the L-2 audit-report email (`lib/delivery/email-html.ts`).

**Scanned:** caniemail.com (12 feature pages), Litmus, Email on Acid, Parcel.io, Enchant Agency, Postmark (guide updated Feb 2026), Dyspatch (Jan 2026), Cerberus, resend/react-email GitHub source (brand-replica templates), reallygoodemails.com, Stripe docs, GitHub docs, UptimeRobot blog, Campaign Monitor/Mailmodo, practitioner writing (Jan 2026).

## 1. Client support facts (caniemail.com, fetched 2026-07-22)

- **`border-radius` — SAFE with square-corner fallback.** 82.92%. Gmail/Apple Mail/Outlook.com+new: yes; classic Outlook Windows: VML only; Yahoo partial. (caniemail.com/features/css-border-radius/)
- **`box-shadow` — AVOID as load-bearing.** 63.42%; classic Outlook none; Gmail apps only for Google accounts. Hairline borders instead. (css-box-shadow/)
- **`linear-gradient` — PROGRESSIVE only.** 60.46%; Gmail Android buggy inline; Outlook Windows VML only. Never information-bearing. (css-linear-gradient/)
- **`<style>` in head — enhancement channel only; every critical style stays inline.** 78.26%; Gmail strips it inside body, 16KB CSS cap, dropped for non-Google accounts in apps; Yahoo Android removes the FIRST `<head>` (a second empty head before the real one is the known guard). (html-style/)
- **Media queries — PROGRESSIVE.** 80.48% but partial nearly everywhere; layout must work without them. (css-at-media/)
- **`prefers-color-scheme` — treat as NOT honored by Gmail.** caniemail shows green (tests 2020–2022) but Litmus (chart as-of Feb 2025), Email on Acid (Oct 2025) and Enchant (Oct 2025) all state Gmail web/iOS/Android apply their own inversion logic instead. Apple Mail: honored; Outlook.com: honored partially (adds `data-ogsc`/`data-ogsb` attrs); Yahoo: no. (css-at-media-prefers-color-scheme/ + the three 2025 sources)
- **`@font-face` — AVOID as dependency.** 24.39%; Gmail no; classic Outlook can fall back to Times New Roman — full fallback stack mandatory. (css-at-font-face/)
- **`letter-spacing` — SAFE-EVERYWHERE (95.12%); px values, not em.** (css-letter-spacing/)
- **`padding` on `<td>` — THE spacing primitive (~100%).** Classic Outlook honors padding only on table cells and EQUALIZES vertical padding across a row's cells (keep row cells' vertical padding identical). (css-padding/)
- **`role="presentation"` — SAFE (73.17%; Yahoo partial but works on `<table>`, which is where it's needed).** (html-role/)
- **Inline SVG — AVOID (40.48%; Outlook none, Apple Mail buggy).** (html-svg/)
- **CSS `background-image` — AVOID:** Gmail web bug — a `url()` in a style can cause Gmail to strip the entire style attribute/tag. (css-background-image/)

## 2. Dark mode (2025–2026 state)

Three client buckets: no-change (Gmail web light, Yahoo, AOL) · partial inversion — light darkened, dark left alone (Outlook.com, Outlook iOS/Android) · full inversion (Gmail app iOS, Outlook 2021/Win, Windows Mail). Apple Mail honors author dark styles when provided. Defensive consensus (Litmus · EOA Oct 2025 · Enchant Oct 2025 · Parcel):
1. Both metas: `<meta name="color-scheme" content="light dark">` + `<meta name="supported-color-schemes" content="light dark">` (+ `:root{color-scheme:light dark}`).
2. Never pure `#000`/`#fff` — near-black `#111`-range on near-white `#fafafa`-range survives forced inversion gracefully.
3. Transparent-background marks with a stroke so they survive dark grounds (n/a here — no images in our email).
4. A `prefers-color-scheme: dark` override block + `[data-ogsc]` selectors for Outlook.com — enhancement for the clients that honor them; Gmail gets the defensive base colors.
Enchant cites up to 80% of users enabling dark mode when available (Oct 2025).

## 3. Premium exemplars — observed patterns (dev-tool brands; react-email replicas + RGE teardowns, fetched 2026-07-22)

- **Widths are NARROW:** Vercel invite 465px · GitHub notification 480px · Linear login 560px · Apple receipt 660px. Premium transactional runs 465–660, mostly UNDER the classic 600.
- **Type:** system/brand sans; headings 24px normal-to-semibold with negative tracking (Linear −0.5px, `#484848`); body 14–15px; secondary `#666`/`#6a737d`; footers 12px muted.
- **Cards vs dividers, never shadows:** Vercel/GitHub = 1px `#eaeaea`/`#dedede` hairline card ~5px radius; Apple receipt = `#eeeeee` `<hr>` dividers + `#fafafa` panels; Linear = open layout, one divider. Zero box-shadow anywhere.
- **Data rows:** label left, amount right-aligned in a fixed ~100px column; 10px uppercase gray micro-labels (Apple); codes in a mono bold chip on gray `#dfe1e4` rounded bg (Linear).
- **Buttons:** one solid single-color primary (black Vercel, `#5e6ad2` Linear), white semibold 12–15px, ~11×23px padding, small radius.
- **Footers minimal:** 2–3 bullet-separated 12px links, tiny mark, one corporate line. (react.email/templates · github.com/resend/react-email Community templates · RGE Stripe receipt teardown)

## 4. Layout/type norms 2025–2026

- **Width:** 600px canonical baseline; premium transactional trends 465–560 (§3). (Postmark modern-email; practitioner guide Jan 2026)
- **Type scale:** body 16px minimum, LH 1.5–1.6; 45–75 chars/line; headings ~24/32; supporting 14/20. (Dyspatch Jan 2026; practitioner Jan 2026)
- **Spacing:** 4/8-based token scale (8/16/24/32) as `td` padding + spacer rows; 20–30px between blocks; ≥24px around buttons.
- **Mobile without media queries — fluid/hybrid:** `inline-block` + `max-width` + `min-width` + MSO ghost tables; media queries = enhancement. (Cerberus hybrid-responsive)
- **Touch targets:** ≥44×44px. **Accessibility floor:** `role="presentation"` on every layout table; `lang`+`dir` on `<html>`; semantic h1→h2; 4.5:1 contrast; left-aligned text; a well-formed plain-text part; EAA (in force June 2025) makes this compliance-relevant. **Weight:** HTML <100KB (Gmail clips).

## 5. Basic vs premium — the concrete separators

Generous spacing (#1 signal — cramming reads cheap) · one job per email · tight negative tracking on large headings · hairline borders + soft gray panels instead of shadows/gradients · mono/tabular treatment for data values in gray chips · right-aligned amount columns · muted secondary palette (one accent, near-black primary) · token-based spacing + real a11y semantics · footer as trust surface (reason-for-email line, preference link, one corporate line; strip heavy branding from high-frequency notifications — Postmark Feb 2026).

## 6. Content/copy conventions

- **Subject ≤50 chars, information-first** ("simple and direct wins over cute and catchy" — Postmark Feb 2026); design for scanning/filtering. **Preheader 40–100 chars** (mobile shows 40–70), front-load key info, pad tail with hidden whitespace; use it for what didn't fit the subject. (Postmark · Campaign Monitor · Mailmodo)
- **Verdict phrasing in compliance/monitoring products — verdict-first + counts + severity, plain language:** UptimeRobot leads with state ("Monitor is UP: …" + duration); GitHub Dependabot carries machine-filterable severity headers and offers a weekly DIGEST (the notification/report split is a product feature); Stripe receipts: receipt number, charge status, itemized lines, view-in-browser link. Better Stack embeds one "Acknowledge" action. (docs.github.com Dependabot notifications · docs.stripe.com/receipts · UptimeRobot blog)
- **Body volume:** "less is more"; recipient solves the micro-task in seconds; most-important first; LINK OUT to detail rather than embedding. Exemplars: heading + 1–3 short paragraphs + one action + footer. The email = verdict + counts + top findings; the full report lives behind the click/attachment.
- **Tone:** calm, helpful, declarative; short sentences; scannable labels; no promotional add-ons or unnecessary disclaimers.

## Adoptable moves (ranked)

1. Single column, 560–600px, fluid/hybrid, zero-media-query-dependent — SAFE.
2. All spacing as `td` padding on an 8-based scale — SAFE.
3. System stack, 15–16px/24 body, 24px heading at −0.5px tracking, 12px muted footer — SAFE (webfonts only as enhancement).
4. Verdict stamp = text on solid `bgcolor` chip (td + padding + radius + bold uppercase letter-spaced) — never image/SVG — SAFE core.
5. Finding rows as `role="presentation"` tables: label left, right-aligned fixed amount/severity column, 10–11px uppercase micro-labels, `#eeeeee` hairline dividers — SAFE.
6. Card = 1px hairline + small radius + `#fafafa` panel fills; no box-shadow — SAFE.
7. Dark-mode bundle: both metas + `:root{color-scheme}` + near-black-on-near-white + `prefers-color-scheme`/`[data-ogsc]` override block — PROGRESSIVE (base colors SAFE).
8. Bulletproof button: nested-table anchor, solid bg, ≥44px target, one primary action — SAFE.
9. Mono chip for data values (IDs, totals, rule codes) on gray rounded bg — SAFE.
10. `<style>` head-only (dark overrides/media queries), critical styles inline, CSS <16KB, email <100KB — SAFE structural rule.
11. CONTENT: subject ≤50 chars verdict-first with counts; preheader 40–100 front-loaded — per Postmark/CM/Dependabot/UptimeRobot patterns.
12. CONTENT: email = verdict + counts + top rows + one CTA + attachment note; detail behind the click; calm declaratives; footer = reason-for-email + one corporate line.

## Off-radar traps (horizon)

- Gmail `url()` style-stripping bug — avoid CSS background images entirely.
- Yahoo Android removes the FIRST `<head>` — the empty-second-head guard.
- Classic Outlook equalizes vertical `td` padding across a row — keep row cells' vertical padding identical.
- EAA (June 2025) — a compliance-audit product's own email should be demonstrably accessible.

## Gaps / open

Gmail `prefers-color-scheme`: caniemail (green, tests 2020–22) vs three 2025 specialist sources (not honored) — treated as NOT honored. Exact production subject strings of Dependabot/Stripe: UNVERIFIED from docs. react-email templates are replicas (patterns cross-checked against RGE screenshots for Stripe). Raw Reddit/X threads not pulled (read-only seat); practitioner layer rests on 2025–26 practitioner blogs + community corpora (caniemail/Cerberus/react-email).

*(Full source URL list in the session-32 task-log context; primary: caniemail.com feature pages · litmus.com dark-mode guide · emailonacid.com dark-mode (Oct 2025) · enchantagency.com dark-mode-2026 · parcel.io color-scheme guide · postmarkapp.com guides (Feb 2026) · dyspatch.io typography-2026 · cerberusemail.com hybrid-responsive · react.email/templates + github.com/resend/react-email · reallygoodemails.com Stripe teardown · docs.stripe.com/receipts · docs.github.com Dependabot notifications · blog.uptimerobot.com · campaignmonitor.com + mailmodo.com preheader guides.)*
