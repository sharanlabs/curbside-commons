# The Plain-English Explainer

**What this document is:** the whole project explained in simple words, for anyone — no technical background needed. It is a living document: every time the project meaningfully changes, this file is updated in the same breath (owner directive, 2026-07-02). If this file and the technical docs ever tell different stories, that mismatch is itself a bug — flag it.

**Where the precise version lives:** this is the *plain register*. The professional register — full technical, business, and operational terminology — lives in the working docs, decoded by [`GLOSSARY.md`](GLOSSARY.md), under the rules of [`documentation-standard.md`](documentation-standard.md). Same truth, two registers.

**Status as of 2026-07-02:** this describes the *planned direction*, accepted for planning by the owner. It becomes the decided plan only after independent review gates pass and the owner gives the final GO. Nothing described below is built yet under the new direction; the verification technology it reuses is already built and tested.

---

## The problem, in plain words

When you order food through an app — or, starting now, when you just tell an AI assistant "order me a pizza" — the menu you see is **not the restaurant's actual menu**. It's a **copy**. The real menu lives in the restaurant's till system (their cash-register software). That copy gets passed along a chain: till → sync software → DoorDash / Uber Eats / Grubhub → and now → AI assistants like ChatGPT, Claude, and Gemini.

Copies go stale:

- The restaurant raised the pizza to $18.99 — the app still says $16.99.
- They ran out of wings an hour ago — the app still shows them as available.
- A fee got renamed on the payout statement — nobody can tell what it actually is anymore.

A **human** shrugs at this. You see something off, you close the app. Minor annoyance.

An **AI assistant doesn't shrug — it just places the order.** Wrong price → the restaurant eats the difference. Sold-out item → cancelled order, refund, an "error charge" the restaurant pays for. And this is not a future problem: since **July 1, 2026** you can order food through ChatGPT and Claude (via Square), and Google's assistant has been placing delivery orders since March 2026.

Here's the trap that keeps this problem alive: **everyone who could fix it has a conflict of interest.**

- The delivery apps won't audit each other.
- The menu-sync companies won't audit their own syncing — that's grading your own homework.
- The AI companies won't audit restaurant data — not their job.

So nobody neutral checks whether what the apps and AI assistants *say* about a restaurant matches what's *actually true* in the restaurant's own system. That empty seat — **the neutral referee** — is the opportunity.

## The use case, in one question

A restaurant owner (or a platform, or a sync vendor) asks:

> **"Is what the apps and AI agents are showing about my restaurant actually true right now?"**

Right prices. Right items. Right availability. And later (module two): **are the fees taken out of my payouts actually what my contract and the law say?** Today nobody can answer either question without checking by hand, line by line. The one time regulators did check fees by hand (New York City, April 2026), they found a delivery app had overcharged 380+ restaurants and made it pay $875,000 back.

## The solution: build the referee

An independent checker that compares the copies against the truth. In plain steps:

1. **Take the truth** — the restaurant's own till/catalog data (with their permission).
2. **Take the copies** — what the delivery apps and AI-assistant feeds are showing.
3. **Compare, line by line.** Price vs price, item vs item, available vs available. Boring, exact, mechanical — like a spellchecker for menus. No AI needed for this part, so it can't hallucinate.
4. **Where it's genuinely fuzzy, AI judges carefully.** Is "Lg Pepp Pizza" the same item as "Large Pepperoni Pizza"? That's the only place AI is used — and we measure how accurate the AI judge is, and publish the measurement.
5. **Report with receipts.** Every mismatch shown with evidence: *here's your system saying $18.99, here's the app saying $16.99, since Tuesday.*
6. **A human approves any fix.** The tool never changes anything on its own. It recommends; a person decides.

**How it ships:** as open tooling anyone in the industry can pick up and run — a checker for the new AI-ordering data formats (the "feeds" that OpenAI and Google/Square just published standards for). Those standards are weeks old and nobody has built the independent checker yet. Whoever builds it first becomes the reference. That's the seat we're taking.

**The demo that makes it click:** we set up a fake restaurant, deliberately break its menu copy (wrong price, sold-out item still showing), and let a real AI agent try to order from it. **Without our checker: the agent happily orders at the wrong price. With it: caught before the order happens.** You don't need to understand any of the technology to understand that demo.

## One-sentence version

> **AI assistants are starting to order food from copies of restaurant menus that are often wrong — we're building the neutral fact-checker that catches the lies before the AI acts on them.**

## What we are NOT claiming (honesty box)

- This is a **prototype run on demand for demonstrations** — not a live 24/7 service.
- Demo restaurants and their data are **synthetic (made up) and clearly labeled**; the *rules* we check against (published data-format standards, real fee laws) are real and cited.
- No real DoorDash/Uber Eats/Grubhub merchant accounts, data, or business impact are involved or implied.
- AI is used in **one narrow, measured spot** (fuzzy matching / judging), with humans approving anything that acts. The comparing itself is deterministic — exact, repeatable arithmetic.
- Built human-led, AI-assisted, professionally reviewed.

## Where the project stands (update this section every stage)

| Date | Stage | Plain-English status |
| --- | --- | --- |
| 2026-07-03 (later still) | **Building — the report you can read (and print)** | The checker now has a **result page a person can actually read**, plus a **machine version for automation**. Same result, two forms. (1) **The web report** (`/report`): a clean one-pager that shows every difference the checker caught — each written in **plain words first** ("The served price 12.00 does not match the catalog price 10.00"), then the exact receipts beside it (which claim, which catalog row, which rule, how serious). A big **SIMULATED** label you cannot miss, the exact data-format version it was checked against, and whether the match was exact or fuzzy — all in the header. You can flip between the two menu formats (the OpenAI-style feed and the Google/UCP-style answer), and it **prints to a clean page**. It needs no explanation: you can see what was checked, against what truth, what was caught, and that it's all made-up test data. (2) **The machine version**: the same report as structured data (JSON) a CI robot can read and fail a build on. Both are built from the frozen "answer key" reports, cost **$0**, and make **no AI calls** (a test proves the page can't even reach an AI module). Also today: the whole test corpus was **packaged as one publishable set** with a single front-page guide — how to rebuild it from seed, how to run the checker on it, and an honest note that its **license is still the owner's call** (nothing published yet). |
| 2026-07-03 (later) | **Building — the rulebook check is in** | The checker now answers **two separate questions** about an AI-shopping menu answer: is it **correctly shaped** (does it follow the official published rulebook — the real UCP data-format standard, 78 schema files fetched from the official source, pinned and tamper-locked), and is it **true** (does it match the restaurant's own records)? The headline demonstration landed with it: a menu answer that is **perfectly shaped by the official rulebook yet quotes a wrong price — the shape check passes it, our truth check catches it**, proven by a test, not a story. That single exhibit IS the project's argument: format police aren't fact-checkers, and the fact-checker seat is the one this tool takes. Also today: the promised independent review of yesterday's inline build step ran (verdict: engineering solid; two narrow honesty gaps found and fixed the same morning — the review working exactly as designed), and 35 machine-generated test documents now exercise the shape-checker, all reproducible from a seed. One honest limit, on the record: the *official* reference validator is written in a language (Rust) not installed on this machine, so "our checker agrees with the official one" is **built but not yet measured here** — owner call to install the toolchain or measure elsewhere; no agreement is claimed meanwhile. |
| 2026-07-03 | **Building — the wedge works** | The first working piece of the referee is BUILT and passing every test. There is now: a fake-but-realistic restaurant menu (clearly labeled simulated), truthful and deliberately-lying copies of it in the two formats AI shopping assistants read, and a one-command checker that catches **every planted lie with receipts** — wrong prices, sold-out dishes shown as orderable, ghost items, renamed items, indistinguishable size variants — the same way on both formats, for $0 in AI costs (it's pure logic, no AI calls, and a test proves that structurally). In parallel, the NYC delivery-fee law was codified into a machine-checkable rule table from the law's own enacted text (17 rules, every one traced to its exact legal clause; the "effective May 31 vs June 30" confusion in secondary sources was resolved on the primary record: became law May 31, took effect June 30). Also today: the repo was reorganized — the old merchant-activation build was archived intact and still passes all its tests; the new verifier lives in its own clean structure. One process note, on the record: the middle build step was executed by the lead model directly (the delegated builder seat hit its usage limit for ~4 hours), so an extra independent review of that step is queued as a named obligation. |
| 2026-07-02 (late) | Plan validated | Both independent reviews ran and agreed with conditions: the five-agent council said **"proceed, but reshaped"** (finish the old build's paperwork first; make the fee-audit module the star of the AI story; check one big open question before building the menu-drift part), and the cross-model reviewer (Codex) **confirmed with 12 tightening amendments — all accepted**. The full build plan is written (`docs/plan-truth-audit-execution.md`). **Waiting on: the owner's GO**, plus one urgent owner decision — NYC's regulator takes public comments on delivery-fee recordkeeping until **July 16**; commenting is optional but must be decided this week. |
| 2026-07-02 | Direction | Owner picked the "truth-audit" direction and accepted the open-tooling reframe **for planning**. Independent reviews (council + cross-model check) and the owner's final GO still ahead before any building starts. |
| (earlier) | Foundation | The core verification technology — the deterministic checker, the measured AI judges, the human-approval gates, the audit trail — was already built and heavily tested in this repo's previous phase (merchant-activation domain). The new direction reuses it. |
