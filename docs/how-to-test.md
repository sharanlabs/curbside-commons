# How to test Curbside Commons yourself — with test data provided

**Plain-English:** you don't need to bring any data. This page hands you ready-made
**test statements and feeds**, tells you exactly where to paste them, and tells you
what the tool *should* find — so you (or anyone) can confirm the checker actually
works. Everything is **simulated data checked against real codified NYC law**; the
tool sends nothing anywhere and never claims to touch a real platform.

- **Live site:** https://curbside-commons.pages.dev
- **Local (if you cloned the repo):** `npm run dev` → http://localhost:3000

---

## Test A — the fee audit (paste a statement, get it checked against NYC's caps)

This is the strongest "test it yourself" surface: the **rules are fixed law**, so you
only supply a statement.

**On the live site:**
1. Go to **`/fees`** (https://curbside-commons.pages.dev/fees).
2. Either click **"load the example statement"**, or paste the test statement below into the box.
3. Watch it audit against NYC Administrative Code §20-563.3 — in your browser, no network.

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
1. Go to **`/playground`** (https://curbside-commons.pages.dev/playground).
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
- Everything runs **in your browser or your terminal** — the page makes **no network requests** (you can watch the network tab).
- It's **simulated data audited against real codified NYC law** (§20-563.3 / Local Law 79 of 2025). It is **not** legal advice, computes no penalties, and never claims real platform access.
