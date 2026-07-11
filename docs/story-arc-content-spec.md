# Story Arc + Content Spec [SUPERSEDED] — the ActivationOps verification story

**Status: SUPERSEDED (marked 2026-07-10, batch-B reconciliation).** This spec was the locked direction of 2026‑06‑23 and drove the site of that era. The current landing/site is governed by the 2026-07-08 Oxblood whole-site specs (`mockups/ultra-modern-2026-07-08/whole-site-copy-deck.md` + `whole-site-story-arc.md`, implemented as the four-slice redesign) — nothing current consumes this document. It is kept verbatim as a dated historical record; the incumbent research it cites lived in its authoring session and was not committed as a repo digest, so its brand-register comparisons are preserved here as historical prose, not as a currently-governing register. *(Original status line: "locked direction, 2026‑06‑23. Drives the storytelling site + the product surfaces. Grounded, not from memory.")*

**Basis (every line traces to one of these — no training memory):**
- **Repo truth** — the site may claim only what the system genuinely does: the deterministic claims‑gatekeeper (`lib/agents/gatekeeper.ts`), the cross‑family semantic judge (`lib/agents/semantic-judge.ts`), calibration against a labeled gold set, the data model, the recorded live run. Bounded by `RULES.md` (label "simulated", mark **UNVERIFIED**, no affiliation).
- **Incumbent deep‑source research** — DoorDash/Uber Eats merchant pages + eng sources, cited 2026‑06‑23 (the research-specialist digest in this session).
- **Dual‑audience craft research** — cited 2026‑06‑22 (insight‑led arc; progressive disclosure; show‑don't‑tell; narrative transportation).

---

## Governing principle: adopt the enterprise FORMAT/LOGIC, translate the SUBSTANCE

We take *how* big enterprises sequence a merchant story; we do **not** copy *what* they literally put there, because ours is a **capability demonstration that is company‑agnostic and honest/simulated**, not an acquisition page.

| Enterprise MOVE (sourced) | Their LITERAL device — we do NOT copy | OUR translation (our context + honesty) |
|---|---|---|
| Lead the hero with the gain | "Unlock Sales" / "what Uber Eats can do for your business" | The gain = **AI merchant outreach you can trust — nothing false ever ships** (trust + speed), not revenue claims |
| Anchor credibility early | "550,000+ businesses", named‑CEO testimonial | **Honest demonstrable rigor + radical transparency** (deterministic checks → independent reviewer → human sign‑off; "we measure agreement with humans"). No fake logos/testimonials — RULES forbids it |
| Plain, jargon‑free merchant surface; technical on a separate surface | their eng vocabulary lives only in the engineering blog | **Main screen end‑user‑clean + jargon‑free; technical one opt‑in layer down** |
| Objection‑handling beat before the CTA | FAQ / pricing | **"How do we know the AI reviewer is right? → we check it against people"** (calibration against human judgment) |
| Final CTA | "Start Free Trial" | **"See it run"** — explore the demo, not sign up |
| Restraint + single confident accent + minimalism | DoorDash White + Scarlet + Cod Gray, no gradients/shadows | Same playbook, within our palette (white + one red‑family accent) |

---

## Audience, section & register (locked)

- **Released to:** an enterprise customer's **Merchant Operations / Activation** section (accountable to **Trust & Safety / Compliance**) — a real, governed, auditable tool dropped into one function's workflow, not a public acquisition landing.
- **Register:** **clean and professional (enterprise‑grade) AND legible to a layman** — *simple in language, not in substance.* Professional ≠ jargon‑walled. The main surface reads confident and plain‑enough‑for‑anyone, in the function's professional‑operational words.
- **AI vocabulary (refined):** **professional, commonly‑understood AI terms ARE allowed on Layer 1 where they fit** — "AI," "AI‑generated outreach," "AI reviewer," "AI safety filter / guardrail," "hallucination," "fabrication." The front does NOT dance around the fact that it's AI. **Only research‑grade ML jargon is barred to Layer 2:** entailment, cross‑family judge, eval‑locked, κ, RAG, precision/recall/F1, held‑out, flip‑rate, maker≠judge.

## The two‑layer rule (hard)

- **Layer 1 = the main screen.** Clean, professional, **and understandable by a layman** — outcome/story‑driven, in the Merchant‑Ops professional‑operational vocabulary (activation, review queue, approval, going‑live, audit, compliance). The ONLY thing barred from Layer 1 is the **deep AI/ML jargon** (entailment, cross‑family judge, eval‑locked, κ) — never the function's own professional terms. A layman follows the whole walkthrough without hitting a wall.
- **Layer 2 = opt‑in depth = the expert / the procurement‑diligence reviewer.** The full AI/ML technical substance (kept, not diluted) lives one deliberate reveal away — "How it works →" / "For technical reviewers →" or a secondary surface. Sought, never imposed.

---

## The locked beat sheet

Each beat: **job · main‑screen content (Layer 1, plain) · opt‑in depth (Layer 2) · basis.**

**1 — Hero · Outcome promise** *(fix: outcome‑first)*
- L1: the gain, plainly — *AI writes your merchant outreach, and nothing false reaches a merchant, because every claim is checked against that merchant's own data before it sends.* Trust + speed. One line + one sub. No chips, no jargon.
- L2: a quiet "How the checking works →".
- Basis: incumbent gain‑first hero (translated) + repo truth.

**2 — Trust anchor · honest credibility, early** *(fix: credibility early)*
- L1: a short, credible line right after the hero — **not** a logo wall. The honest proof = *deterministic checks first, then an independent AI reviewer, then a person signs off — and we measure how often the reviewer agrees with human judgment.* The "simulated / honest" stance is itself a credibility signal (we're upfront).
- L2: what "deterministic" and "independent reviewer" mean technically.
- Basis: incumbent early‑proof move (translated to honest rigor, no fabricated scale) + repo (calibration) + RULES.

**3 — The gap · the insight (reframe)**
- L1: *AI sounds confident even when it's wrong. Most AI safety checks read the tone — they don't check whether what it said is actually true for this merchant.* Plain.
- L2: the structural reason (faithfulness = a relation between the text and the record; safety filters read the text in isolation).
- Basis: repo (the documented Phase‑B boundary) + incumbent "grounding" concept (kept in L2).

**4 — Catch it · shown proof (the differentiator)**
- L1: the animated catch — a real draft checked line‑by‑line against the merchant's data row; the one made‑up claim caught and **held for a person**. Plain verdicts (matches the data ✓ / not in the data ✗ → held). No jargon labels on L1.
- L2: per‑claim entailment, the cross‑family judge, evidence‑field mechanics.
- Basis: repo truth (the actual gatekeeper+judge output) + show‑don't‑tell.

**5 — How it works · plain on top, technical opt‑in**
- L1: the five stages in plain words — *your data → AI drafts from it → an exact automatic check → an independent second AI reviewer → a person approves.* Benefit‑framed.
- L2 ("For technical reviewers →"): deterministic forward gate, cross‑family entailment judge, the injection cut, eval‑lock — the real pipeline.
- Basis: repo + progressive disclosure + incumbent (technical on a separate surface).

**6 — Differentiation · plain**
- L1: *A safety filter checks the message. We check the facts.*
- L2: claim‑vs‑structured‑source‑of‑truth vs claim‑vs‑retrieved‑context — the rigor step beyond what incumbents publish.
- Basis: positioning bound (rigor, not novelty) + incumbent guardrail lexicon (kept in L2).

**7 — Objection · "is the reviewer right?"** *(fix: add objection beat)*
- L1: *How do we know the AI reviewer is right? We check it against people — we measured how often it agrees with human reviewers, and tuned it to catch more rather than miss.* Plain.
- L2: precision/recall/F1, Cohen's κ, flip‑rate, held‑out, recall‑favoring — the calibration report.
- **Honesty gate:** the *method* is real now; the *numbers* appear only once the calibration run completes (P3) and clear the bar (R‑HON‑3). Until then this beat states the method, not figures.
- Basis: fix #4 + DoorDash's own "calibrated against human judgment" (translated) + repo.

**8 — Close · "See it run"**
- L1: *See the pipeline run on a real example* → the demo. Honest CTA, not acquisition.
- Basis: our goal (demonstration, not sales).

**9 — Honesty footer** — simulated · fictional names · not affiliated with any marketplace · recorded/REPLAY. (`RULES.md`.)

---

## What changed vs the current mockups
1. Hero flips from problem/mechanism → **outcome/gain**.
2. New **early trust anchor** (honest rigor, not fake scale).
3. **All technical jargon comes off every main screen** → Layer 2 only (the always‑on mono "expert strips" are removed from L1).
4. New **objection beat** ("is the reviewer right?" → calibration), method now / numbers when P3 completes.
5. CTA → **"See it run"** (not sign‑up). Aesthetic direction (white + single red accent + minimalist restraint) already matches DoorDash's actual playbook — unchanged.
