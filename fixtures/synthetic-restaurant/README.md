# synthetic-restaurant corpus — W0 placeholder

**Plain-English:** this folder will hold the fake-but-realistic restaurant used to
demonstrate the verifier. It is the "torture corpus" — a made-up restaurant whose
menu, feeds, and fee statements contain deliberately planted drift so the verifier
has something to catch. Nothing here is real merchant data.

---

## Status

**W0 (restructure):** empty placeholder. The publishable corpus lands in **W1**
(plan `docs/plan-truth-audit-execution.md` §6, C9).

## What W1 will place here

- A synthetic restaurant **system-of-record (SOR)** — internally consistent menu,
  prices, availability, and modifiers (seeded, deterministic generator).
- **Serving copies** derived from the SOR with planted drift: a static ACP feed
  and recorded UCP catalog responses (surface-agnostic, C3).
- **Fee statements** carrying the §7 fee-line classes (UC-1).
- A **taxonomy key** mapping every fixture to its drift/fee class in plan §7, so
  coverage can be measured (C6) — never claimed as "all".

## Constraints (binding on the corpus, per plan §1 / §8 / C9)

- **Licensed** — self-contained and publishable with an explicit license (C9).
- **Taxonomy-keyed** — every fixture cites the §7 class it exercises.
- **Labeled simulated** — zero real merchant data; every artifact is marked
  simulated (honesty surface, C10).
