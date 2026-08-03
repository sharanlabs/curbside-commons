# How to test Curbside Commons yourself — with test data provided

**Plain-English:** you don't need to bring any data. This page hands you ready-made
**test statements and feeds**, tells you exactly where to paste them, and tells you
what the tool *should* find — so you (or anyone) can confirm the checker actually
works. Everything is **simulated data checked against real codified NYC law**; the
tool sends nothing anywhere and never claims to touch a real platform.

- **Live site:** https://curbside-commons.vercel.app
- **Local (if you cloned the repo):** `npm run dev` → http://localhost:3000

---

## The 60-second version — one command, every surface

If you want the whole thing demonstrated end to end rather than testing surfaces
one at a time:

```bash
npm run walkthrough
```

It carries **one audit** from raw feed all the way to the messages a human would
receive, printing what each surface actually produces: the two inputs → the
deterministic engine and its receipts → conformance-vs-truth → the NYC fee audit
→ **the Slack message** → **the email** → where else the same engine runs.

**It sends nothing.** The Slack and email steps call the *same builders* the
owner-armed one-shots call, then print the payload instead of transmitting it —
so you can see exactly what *would* be delivered while nothing is. That is not a
promise in a comment: `evals/packs/walkthrough-zero-egress.test.ts` walks the
script's entire import graph (56 modules) against an **allowlist** and fails if
any network capability appears. Proven both directions — adding a single `fetch`
turns it red.

A real send is a separate, deliberate act under eight written controls
(`docs/plan-a3-delivery-safety.md`) and has only ever gone to the owner's own
channel and inbox.

---

## Test 0 — the landing page, drop to delivery (the whole product in one scroll)

Since 2026-08-02 the landing page IS the walkthrough: six stations — INPUTS · RUN ·
VERDICT · FEES · DELIVERY · PROOF — that carry one audit from your two files to the
messages a human would receive. Click by click:

1. Open the site (live: https://curbside-commons.vercel.app — or locally `npm run dev`
   → http://localhost:3000). You land on two labeled slots: **"A published menu feed"**
   (what an agent reads) and **"The system of record"** (the merchant's truth).
2. **Fastest path: click "Run the bundled pair"** — it loads the built-in test pair and
   runs immediately. The run button is never disabled; empty slots just mean it runs
   the bundled data.
3. **Or bring the test files yourself:** open a slot's paste area and click
   **"Download it to test uploading"** — it saves the bundled file
   (`bundled-feed.json` / `bundled-catalog.json`) from the same bytes the inline
   loader uses. Drag the files back into the slots or use the file picker. Same
   engine, now exercising the real upload path. (The save happens in your tab via a
   blob URL — nothing is fetched from, or sent to, anywhere.)
4. Watch the **RUN** station: the ticker streams only checks that actually happened —
   a row shows **HELD** when a real finding exists and **OK** only when that row had
   zero findings. Nothing in the stream is theater.
5. The **VERDICT** slab states the outcome with the honesty sentence inside it; the
   **FEES** station reads the statement against NYC's codified caps (details in Test A).
6. The **DELIVERY** station is the part to look at twice: the real **Slack Block Kit
   payload** and the real **RFC 5322 email**, built by the same `lib/delivery/*`
   builders the CLI calls — stamped **BUILT, NOT SENT**. The SIMULATED banner you see
   comes from the builder's own output, not from page copy. Nothing is transmitted;
   the site has no send transport wired into it.
7. Try the **theme toggle** (right end of the nav): both light and dark are supported,
   and the whole flow above reads the same in either scheme.

To reset, run the bundled pair again or reload — the page holds no state you can't
walk back.

---

## Test A — the fee audit (paste a statement, get it checked against NYC's caps)

This is the strongest "test it yourself" surface: the **rules are fixed law**, so you
only supply a statement.

**On the live site:**
1. Go to **`/fees`** (https://curbside-commons.vercel.app/fees).
2. Either click **"load the example statement"**, or paste the test statement below into the box.
3. Watch it audit against NYC Administrative Code §20-563.3 — in your browser; the statement you paste is never sent anywhere.

**Test data — a RIGGED statement (should FAIL with violations).** Copy this whole block:

```json
{
  "meta": {
    "simulated": true,
    "generator": { "name": "how-to-test-guide", "seed": 20260722, "version": "1.0.0" },
    "merchant": "Curbside Commons Test Kitchen (simulated)",
    "month": "2026-06",
    "currency": "USD",
    "asOf": "2026-08-15",
    "purchasePriceBaseConvention": "order item subtotal before discounts, excluding tax and tip"
  },
  "lines": [
    { "orderId": "ORD-1", "month": "2026-06", "declaredCategory": "delivery_fee", "label": "Delivery fee", "amountCents": 360, "orderPurchasePriceCents": 2000, "isRefund": false, "passthroughDocumented": false },
    { "orderId": "ORD-1", "month": "2026-06", "declaredCategory": "transaction_fee", "label": "Card processing", "amountCents": 160, "orderPurchasePriceCents": 2000, "isRefund": false, "passthroughDocumented": false },
    { "orderId": "ORD-2", "month": "2026-06", "declaredCategory": "delivery_fee", "label": "Delivery fee", "amountCents": 400, "orderPurchasePriceCents": 2000, "isRefund": false, "passthroughDocumented": false },
    { "orderId": "ORD-2", "month": "2026-06", "declaredCategory": "service_and_delivery", "label": "Combined service + delivery bundle", "amountCents": 150, "orderPurchasePriceCents": 2000, "isRefund": false, "passthroughDocumented": false },
    { "orderId": "ORD-3", "month": "2026-06", "declaredCategory": "promotion_deduction", "label": "Promo recovery charge", "amountCents": 120, "orderPurchasePriceCents": 1000, "isRefund": false, "passthroughDocumented": false },
    { "orderId": "ORD-3", "month": "2026-06", "declaredCategory": "enhanced_service_fee", "label": "Marketing (formerly delivery)", "amountCents": 150, "orderPurchasePriceCents": 1000, "isRefund": false, "passthroughDocumented": false }
  ]
}
```

**What the tool SHOULD catch here — 5 violations** (verified by running this exact block through the engine):
- **Delivery fees over the cap on the monthly average** — $7.60 of delivery fees on $50 of orders = 15.2%, over NYC's 15% delivery cap. Note the sophistication: a *single* over-cap order is **not** automatically a violation — §20-563.3(a)'s averaging clause lets the monthly average save it, and an over-cap month still gets a 30-day refund window to cure. This statement is rigged so even the average fails, and at the statement's `asOf` date the window has closed with no refund → violation.
- **Over-3% transaction fee** — $1.60 on a $20 order is 8%, over the hard 3% processing cap (no averaging, no refund safe-harbor — an immediate violation).
- **A non-permitted "bundle" category** (`service_and_delivery`) — NYC permits only four specific fee categories.
- **A "promotion_deduction" charge** — not a permitted fee category either.
- **An "enhanced_service_fee" without a basic-service fee** — the law gates the enhanced tier on a basic tier existing (a misclassification signature).

**Test data — a CLEAN statement (should PASS, zero findings).** To confirm the tool
doesn't cry wolf, use the faithful fixture: on the live site load the example and lower
the fees under cap, or locally run the clean file (below). Every fee within cap → **PASS**.

---

## Test B — the price / "×100" check (edit any number, watch it re-check live)

**On the live site:**
1. Go to **`/playground`** (https://curbside-commons.vercel.app/playground).
2. Pick **"Edit one served price yourself"** and type any price into the box.
3. It re-runs the real check as you type. Try these:
   - Type **`2150`** → the tool reads it as $2,150 but the merchant's true price is $21.50 → **HELD ×100** (the classic cents-as-decimal error: 215,000¢ ≠ 2,150¢).
   - Type **`21.50`** → matches the record → that line goes **clean** and the tally drops by one.
   - Type **`24.00`** → a plain mismatch → flagged.
   - Type letters or nonsense → **"NOT A PRICE"** (it refuses rather than guessing).
4. Also try the **Ghost row** (serve an item the catalog never had) and **Drop a row** presets — each runs the real engine and shows the new finding.

---

## Test C — run it locally on the command line (if you cloned the repo)

No browser needed — the same engine, zero network, $0:

```bash
# Fee audit — a rigged statement prints every catch with receipts, exits 1:
node bin/check.mjs fees fixtures/synthetic-restaurant/fees/statement.drifted.json

# A clean statement — audits to zero findings, exits 0:
node bin/check.mjs fees fixtures/synthetic-restaurant/fees/statement.faithful.json

# Listings truth check — does a published feed match the merchant's records?
node bin/check.mjs check fixtures/synthetic-restaurant/acp-feed.drifted.json --against fixtures/synthetic-restaurant/sor.catalog.json

# The scripted walkthrough (an agent reads a false feed; the checker catches it):
npm run demo
```

npm shortcuts: `npm run check:fees` · `npm run check:fees:clean` · `npm run demo`.

---

## More test data you can use (all in `fixtures/synthetic-restaurant/`)

| File | What it tests |
| --- | --- |
| `fees/statement.drifted.json` | A rigged bill with 5–6 planted violations (Test A above). |
| `fees/statement.faithful.json` | A fully compliant bill — should audit clean (PASS). |
| `fees/statement.cured.json` | An over-cap fee **refunded in time** → "cured", not a violation. |
| `fees/statement.conditional.json` | An over-cap fee with the refund window **still open** → "pending", not yet a violation. |
| `fees/fee-answer-key.json` | The ground-truth answer key — exactly what's planted and what should be caught. |
| `acp-feed.drifted.json` | A published feed with planted listing errors (wrong prices, ghost/missing items). |
| `acp-feed.faithful.json` | A clean feed — should match the records with no findings. |
| `sor.catalog.json` | The merchant's "source of record" the feed is checked against. |

---

## What to expect (so you can tell it's working, not faked)

- The **rigged** inputs produce **findings with receipts** (the claim, the record, the rule, the arithmetic). The **clean** inputs produce a **PASS with zero findings**. Same input → same result, every time (it's deterministic).
- Everything runs **in your browser or your terminal** — **nothing you upload or type leaves your browser** (you can watch the network tab: the audit itself makes no requests at all, and the only traffic you will see is the site fetching its own pages).
- It's **simulated data audited against real codified NYC law** (§20-563.3 / Local Law 79 of 2025). It is **not** legal advice, computes no penalties, and never claims real platform access.
