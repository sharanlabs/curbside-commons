# Landing build blueprint — sol-designed, Claude-approved (2026-07-14)

**Author:** gpt-5.6-sol (owner put sol in charge of the landing arc + hero, verbatim words in decision-log). **Adjudication:** Claude (Opus) primary-model-final — **APPROVED** (faithful to the proof-theatre-proof-thread-3d-story design, honesty-clean, complete a11y/responsive). This is the build spec for `app/page.tsx`. Honesty rules (design brief) bind: no "synthetic/simulated/test/fixture/golden/committed"; no real-brand names; no false claims; illustrative values only (never labeled real). Values: $2,150.00 vs $21.50 (cents-as-decimal ×100), 16 findings (11 error / 5 warn) FAIL, 78 pinned official schemas, 17 codified NYC fee-cap rules (11 executable + 6 needing external evidence).

## A) Hero background — "Correspondence Field" (replaces the flanking lattice, owner word "subtly reflect this project")

- One full-bleed `aria-hidden` **Canvas2D** BEHIND the centered hero copy (copy stays the focus).
- **7 long paired contours** across the hero (5 tablet, 3 below 640px). Each pair: a **segmented claim hairline** + a **continuous merchant-record hairline** 3px away; two shallow **orthogonal** bends (never waves); sparse square terminals at the outer edges.
- At one peripheral anchor: faint mono fragments `price.amount · 2150` and `record · 21.50`.
- **Alpha aperture protects the copy:** no marks inside the live hero-copy bounds + 64px; feather back over the next 120px. Copy on pure white.
- Base marks **graphite ≤8% opacity** (6% below 640px). NO particles/depth/gradients/fog/blur/glow/pointer-parallax.
- **Motion:** one deterministic **18s loop**; contours breathe ±2px. Each ~6s passage: a short **gold** read-head moves ~96px along one pair → the merchant segment resolves **azure**, the mismatched claim segment becomes **ember** (stays offset 8px) → a two-corner **violet** evidence bracket draws around the unequal pair; holds briefly, recedes. Never suggests the claim was corrected. **>94% graphite**, one correspondence lit at a time.
- **Control:** quiet outlined ≥44px "Pause motion / Play motion" (`aria-pressed`, freezes the exact frame). Reduced-motion → composed still frame + explicit "Play motion" opt-in (WCAG 2.2 SC 2.2.2).
- **Render:** canvas = CSS × devicePixelRatio, 16MP backing-store ceiling (4K-crisp); `ResizeObserver`; stop off-screen/hidden without changing the user's pause choice; matching inline-SVG still frame for no-JS; CSP-safe (bundled).
- **Risk guard:** the paired contours + exact `price.amount` mismatch + gold read-head + violet bracket are MANDATORY — without them it's generic data wallpaper. Never dots/waves/floating-glyphs/network-motion.

## B) Content arc (faithful to the mockup's numbered chapters)

**Narrative:** begin with the standard (check a machine-readable claim against the merchant record) → prove why it matters via one undeniable price mismatch → name the relationship (method) → expand into three counted lanes (coverage) → show where evidence requires the verifier to stop (limits) → close on inspectability.

### Hero — INTERACTIVE (motion control only)
- eyebrow `PROOF BEFORE TRUST` · headline **"Check every claim against the record."**
- body: *"Curbside Commons deterministically checks machine-readable menu and catalog claims against a merchant's own system of record, then validates schema and protocol conformance and audits NYC delivery fee-cap statements. No AI runs inside the verifier. Every finding carries evidence; cost per verification is $0."*
- actions: **Inspect one claim** (→ #proof) · **See the method** (→ #method)

### 01 / Evidence Bench — INTERACTIVE (the sol "Evidence Bench")
- eyebrow `01 / EVIDENCE BENCH` · headline **"See the mismatch before reading the receipt."**
- body: *"The machine-readable claim displays $2,150.00. The merchant record states $21.50. The catalog entry passes its structure check, yet the price is still wrong. Analyze the claim to see the value, rule, arithmetic, and record resolve into one supported finding."*
- **Interaction (finite ~2.8s, user-triggered, ends in stillness):** initial = a hairline-ruled work surface (header `EVIDENCE BENCH / ILLUSTRATIVE RUN`, tally `16 findings · 11 error · 5 warn`, Claim specimen `CLAIM SURFACE / offers.price / $2,150.00 / 2150.00 USD`, Record specimen `MERCHANT RECORD / price_cents / 2150 / $21.50`, button **Analyze claim**, empty receipt `EVIDENCE ATTACHED`). On activate: ember rule marks `$2,150.00` → correspondence line to `price_cents: 2150` → gold rule rail `CENTS-AS-DECIMAL ×100 / decimal dollars × 100 = integer cents` → arithmetic locks `2150.00 × 100 = 215000¢` vs `merchant record = 2150¢` → line breaks `215000¢ ≠ 2150¢ (×100)` → receipt unfolds row-by-row (`ERROR · PRICE_MISMATCH` / `Claim is 100× the merchant record.` / claim,record,rule,comparison rows / `finding 01 of 16`) → stillness, button → **Run again**. Settled label `EVIDENCE LOCKED`. Desktop = two aligned columns + central rule axis + receipt beneath; phone = vertical Claim→Rule→Record→Verdict→Receipt. Tabular numerals, selectable text, semantic `<button>` (Enter/Space, ≥44px, focus ring), one `aria-live="polite"` verdict announcement, reduced-motion/no-JS = completed state shown immediately.

### 02 / Method — INTERACTIVE (relationship)
- eyebrow `02 / METHOD` · headline **"A verdict is a relationship, not a label."**
- body: *"A claim meets a record through a rule. The verdict keeps all three attached, so the conclusion can be checked instead of trusted."*
- Four native word-buttons in the sentence — **claim / record / rule / verdict** — swap one detail panel (`aria-pressed`, polite announce, Tab/Enter): CLAIM `item-001-v1#price.amount · 2150` · RECORD `item-001-v1 · price.amount · 21.50` · RULE `cents-as-decimal · ×100` · VERDICT `error · price · 100×`.

### 03 / Coverage — INTERACTIVE (tabs, roving focus, arrow/Home/End, aria-selected)
- eyebrow `03 / MEASURED COVERAGE` · headline **"Coverage is measured, not implied."** · body: *"Coverage is reported as findings, schemas, and rules — not as a broad success score."*
- **LISTINGS TRUTH:** *"Compares item existence, availability, price, and encoding with the merchant record. The supplied catalog closes at FAIL with 16 findings: 11 error and 5 warn. This count does not imply broader platform coverage."*
- **SCHEMA + PROTOCOL:** *"Validates machine-readable data against 78 pinned official schemas. A conforming structure does not prove that its claims agree with the merchant record."*
- **NYC FEE-CAP AUDIT:** *"Evaluates delivery fee statements against 17 codified rules from NYC §20-563.3: 11 executable checks and 6 that require external evidence."*

### 04 / Limits — STATIC (sticky serif thesis + 4 numbered margin notes)
- eyebrow `04 / HONEST LIMITS` · headline **"Honesty belongs in the interface."** · body: *"A useful verifier knows when to stop."*
- L-01 External evidence: *"Six fee-cap rules depend on evidence beyond the supplied statement. Those cases remain unresolved rather than being forced into pass or fail."* · L-02 Fee basis: *"A fee conclusion that depends on purchase price remains provisional until that value is supported by inspectable evidence."* · L-03 Structural boundary: *"Schema and protocol conformance establish valid structure. They do not establish merchant truth."* · L-04 Input boundary: *"The verifier evaluates only the inputs it receives. It does not infer missing facts, completeness, or freshness."*

### Close — STATIC
- eyebrow `THE STANDARD` · headline **"Make the conclusion as inspectable as the claim."** · body: *"A trustworthy finding should show its work. Read the claim, governing reference, rule, and evidence, then reach the same conclusion yourself."* · actions: **Review the proof** (→#proof) · **Open the verifier report** (→/report)

## C) Cohesion
One evidence language: white gallery ground, serif theses, rounded-sans explanation, mono evidence, hairline construction. The hero background quietly previews the same sequence the Evidence Bench makes explicit (ember claim · gold rule · azure record · violet bracket). Proof owns the richest motion; method + coverage use 240–600ms state changes; limits go still. Chapter accent hues: **proof ember · method violet · coverage azure · limits gold** — the page reads as one authored system, not assembled effects.
