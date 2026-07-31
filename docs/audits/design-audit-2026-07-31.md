# End-to-end design audit — 2026-07-31

**Trigger:** owner, with three screenshots — *"check the images layout and numbers already feeded and why hero is second. reassess it completely from end to end"* + *"font make it sophisticated, premium look"* + *"check the whole the design, navigation, user experience"* + *"check the whole website"*.
**Mode:** audit only. **Nothing changed.** The owner chose "audit first, then I fix."
**Seat:** Opus 5, high effort. Every claim below is measured from source, not inferred from the images.

---

## First: two things the screenshots suggested that are NOT defects

Stating these up front, because acting on them would have made the site worse.

### The nav is not missing from the landing page

Image 1 shows the H1 with no nav above it, while images 2–3 show the full bar. It reads as a missing nav. It is not:

- `app/layout.tsx:105` renders `<Nav>` **outside** `{children}`, so it is on **every** route
- `components/Nav.tsx:36` maps **"Audit" → `/`**, so the landing page has its own nav entry
- there is no `pathname === "/"` early-return anywhere in the component

**The screenshot was taken scrolled past the nav.** The real observation underneath it is the next item.

### The numbers are correct and engine-derived

Image 3 shows `215,000¢ ≠ 2,150¢`, "FINDING 11 OF 16", "11 ERR · 5 WARN", "Sixteen findings". Verified by executing the module rather than reading it:

```
errors=11  warns=5  sum=16  findingTotal=16  served=2150
```

`11 + 5 = 16` — internally consistent. And `lib/landing/specimen.ts:33` **throws** if the finding it reads is absent, so these cannot silently drift from the engine's real output. The arithmetic (`2150.00 × 100 = 215,000¢`) is computed from the finding's own value, not typed.

**No defect. Do not "fix" these numbers.**

---

## The real findings

### D-1 (HIGH) — the top of the page reads as empty, and it is a spacing decision that overshot

`.home-lead` is `padding: clamp(20px, 3vh, 38px) 0 0` and `.cs-copy` is centred with `padding-bottom: 0`. The H1 is `clamp(33px, 3.3vw, 46px)`, the lede caps at `62ch`, and both are centre-aligned in a `1180px`+ container.

At 1420px wide (the screenshot's width) that leaves **large empty margins either side of a narrow centred column**, directly under a nav that is also sparse. The page's first impression is white space, not the tool.

The cause is a correct fix applied one step too far: session 37 removed `.cs-hero`'s `min-height: 100vh` so the workbench could reach the first screen — right call, structural burial fixed. But the lead was then left centre-aligned with the old hero's compositional logic, which needs the vertical drama of a full-viewport band to work. **Centred display type earns its space when it owns the screen; at 38px of top padding it just floats.**

Not the same as "the hero is second" — the hero is first in DOM order and correctly so.

### D-2 (HIGH) — the two-column workbench is the widest thing on the page and it fights the centred hero

Image 1: the hero column is ~62ch centred; immediately below, `AuditWorkbench` spans the full `.ds-wrap` (1180–1720px) as two large cards. The eye goes from a narrow centred column to an edge-to-edge two-up with no transition. `Audit a feed.` and its 78ch paragraph are **left-aligned** while the hero above them is **centred**.

**Three different alignment systems in the first screen.** That is what reads as unpolished, more than any single element.

### D-3 (MEDIUM) — the scene band has dead vertical space and a clipped label

Image 2: the diagram sits in a very tall band with large gaps above and below the artwork. `THE AGENT PLACES THE ORDER` is **clipped at the left viewport edge** — it starts at x≈27px and its leading bullet is cut.

`.sect-scene { padding-bottom: 0 }` and `.scene-h2` were tuned when this band was the hero. As an explanatory figure it is now carrying hero-scale vertical rhythm it no longer needs.

### D-4 (MEDIUM) — "Run the audit" is disabled with its explanation to the right, not below

Image 1 bottom: the button is greyed with *"Add a feed to run the audit — the record side is optional"* set beside it. The button is the primary action of the page and its disabled state is the first thing a reader meets. The note reads as a caption rather than an instruction, and the pairing puts the most important control in the visually weakest position on the screen.

### D-5 (LOW) — the H1's second line uses a three-colour gradient

`What the agent read needs proof.` renders blue → lighter blue → brown across the words. At display size the colour shift mid-phrase draws attention to itself rather than the sentence. It is also the only gradient text on the site.

### D-6 (LOW) — `.tool-foot` at 78ch is a wall

The workbench explanation is a single 78-character-measure paragraph carrying five separate ideas (what to drop, how, that it is line-by-line, that nothing leaves, and the sample fallback). Above a tool, this is the text a reader skips.

---

## Typography — the owner's ask

**Current:** Nunito (variable 200–1000) for everything + JetBrains Mono for ledger numerals. Owner-picked in session 37 from six candidates rendered in the site's own copy.

**Why "premium" is a real gap and not just taste:** Nunito has rounded terminals and generous, open bowls — a *friendly* voice. This product's subject is **audit, arithmetic, and legal fee caps**. The type says "approachable app"; the content says "evidence you can take to a merchant." That mismatch is the sophistication gap.

**Owner's choice: render candidates first** — the same method that picked Nunito, and the only one that does not guess.

Proposed slate (each to be rendered in the site's own H1, lede, and a ledger row, at real sizes, then owner picks):

| candidate | why it fits an audit product |
|---|---|
| editorial serif display + neutral sans body | print/legal authority; strongest shift from today |
| a precise geometric sans, single family | keeps one-family simplicity; loses the rounded friendliness |
| a transitional serif throughout | closest to a document/record register |
| high-contrast display + grotesque body | the "expensive" look, highest risk of overdesign |

**Constraints that bind any pick** (from the repo's own record): self-hosted via `next/font/google`, weights verified against the installed manifest (session 37 caught weights outside a family's real axis), zero external requests at runtime, and the mono kept for tabular numerals — the ledger's alignment depends on it.

---

## What I did NOT audit, so coverage is not read as wider than it is

- **Rendered measurement.** These findings are from source + the owner's three screenshots. I could not run `npm run build` (its `next/font` step fetches `fonts.googleapis.com`, outside the sandbox) so I have **no `getComputedStyle` numbers** — and session 37's lesson is that two real defects were findable *only* by computing styles. This audit would be stronger with a build.
- **`/report`, `/fees`, `/proof`, `/docs`, `/legacy` interiors.** Image 3 covers part of `/report`. The other surfaces were not reviewed.
- **Mobile.** Owner ruled desktop-only (session 16); nothing here considers narrow viewports.
- **Accessibility.** No axe run this session. The a11y suite exists and passes, but that is not the same as auditing these findings for contrast/focus consequences.

---

## Recommended order, if approved

1. **D-1 + D-2 together.** They are one problem — the first screen has no single alignment spine. Fixing either alone leaves the other visible.
2. **Typography.** Render the slate, owner picks, then apply. Do this *after* the layout so candidates are judged in the corrected composition.
3. **D-3, D-4.** Independent and small.
4. **D-5, D-6.** Copy/colour polish, lowest risk.

Everything here is reversible and none of it touches the engine, the honesty gates, or the numbers.
