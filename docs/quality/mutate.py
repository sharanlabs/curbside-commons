#!/usr/bin/env python3
"""
Finding 4 — the mutation pass.

QUESTION: of the guards that are green today, how many would still be green
with the behaviour they protect deliberately broken?

METHOD, and why it is shaped this way:

1. The mutant set is DECLARED here, up front, before a single run. The
   denominator comes from this specification and never from the observations.
   That rule was learned in session 35, when a scorer certified a 19-case run
   as COMPLETE because it took its denominator from the ids it happened to see.

2. Each mutant is a single, semantically meaningful edit to SHIPPING code --
   an inverted comparison, a dropped guard, a relaxed threshold. Not syntax
   noise. A mutant that only breaks a type or crashes on import proves nothing
   about the tests; it proves the compiler works.

3. A mutant is KILLED if the suite goes red, SURVIVED if it stays green.
   Survivors are the finding. Each one names a real behaviour that no test
   observes.

4. Every mutation is applied to a working copy of the file and reverted from a
   byte-exact backup, verified by sha256. The repo must be identical before and
   after -- a mutation harness that corrupts the thing it measures is worse
   than no harness.

Scope: the shipping audit engine (listings detectors, fee rules, verifier
core) plus the browser seam. Not the whole tree -- a survey of the code whose
wrongness would produce a FALSE VERDICT, which is what this product exists to
prevent.
"""
import hashlib
import os
import re
import subprocess
import sys

REPO = "/Users/sharan_98/Desktop/curbside-commons"

# Each mutant: (id, file, description, old, new)
# `old` must appear EXACTLY ONCE in the file -- asserted before applying, so a
# mutant can never silently edit the wrong site.
MUTANTS = [
    # ---- listings detectors: price, the product's headline defect ----
    # The whole product exists because a feed said $2,150 for a $21.50 pizza.
    ("M01", "lib/packs/listings/acp-feed.ts",
     "cents->decimal: drop the /100 (every price off by 100x — the headline bug)",
     "return (cents / 100).toFixed(2);", "return cents.toFixed(2);"),

    ("M02", "lib/packs/listings/detectors.ts",
     "hidden item: stop reporting an item sold while hidden in the record",
     'if (match.value.variation.stock !== "hidden") return [];',
     'if (match.value.variation.stock !== "__never__") return [];'),

    ("M03", "lib/packs/listings/detectors.ts",
     "availability: map soldout to in_stock (sold-out items read as available)",
     'const expected = stock === "soldout_86" ? "out_of_stock" : "in_stock";',
     'const expected = "in_stock";'),

    # ---- fee rules: the NYC cap arithmetic, checked against real law ----
    ("M04", "lib/packs/fees/rules.ts",
     "per-order cap: flip > to >= (a fee exactly AT the cap reads as a violation)",
     "return amountCents * 100 > capPct * purchasePriceCents;",
     "return amountCents * 100 >= capPct * purchasePriceCents;"),

    ("M05", "lib/packs/fees/rules.ts",
     "monthly average cap: never exceeded (over-cap months report compliant)",
     "return sumFeesCents * 100 > capPct * sumPurchasePriceCents;",
     "return false;"),

    # ---- browser seam: the parsers the upload surface depends on ----
    ("M06", "components/playground/verify-in-browser.ts",
     "catalog: accept a non-UTC asOf (staleness verdicts silently reverse)",
     r"!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(doc.asOf)",
     "false"),

    ("M07", "components/playground/verify-in-browser.ts",
     "catalog: accept a non-USD catalog (manufactures false mismatches)",
     'doc.currency !== undefined && doc.currency !== "USD"', "false"),

    ("M08", "components/playground/verify-in-browser.ts",
     "catalog: accept an empty items array (every feed row becomes a ghost)",
     "doc.items.length === 0", "false"),

    ("M09", "components/playground/verify-in-browser.ts",
     "size cap: drop the feed-side bound (re-open F-1 on the feed path)",
     "if (text.length > MAX_INPUT_CHARS) {\n    return { ok: false, error: tooLargeError(\"feed\", text.length) };\n  }\n",
     ""),

    ("M10", "components/playground/verify-in-browser.ts",
     "size cap: drop the catalog-side bound (re-open F-1 on the catalog path)",
     "if (text.length > MAX_INPUT_CHARS) {\n    return { ok: false, error: tooLargeError(\"catalog\", text.length) };\n  }\n",
     ""),
]


def sha(path):
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def run_suite():
    """Green -> True. Excludes the build-dependent C10 gate: it shells out to
    `npm run build`, which needs fonts.googleapis.com (outside the sandbox), so
    it fails for an environmental reason unrelated to any mutant. Excluding it
    is disclosed rather than quietly folded in."""
    r = subprocess.run(
        ["npx", "vitest", "run", "--reporter=dot",
         "--exclude", "**/honesty-c10.test.ts"],
        cwd=REPO, capture_output=True, text=True,
    )
    return r.returncode == 0, r.stdout + r.stderr


def main():
    only = sys.argv[1:] if len(sys.argv) > 1 else None
    results = []

    for mid, rel, desc, old, new in MUTANTS:
        if only and mid not in only:
            continue
        path = os.path.join(REPO, rel)
        original = open(path, encoding="utf-8").read()
        before = sha(path)

        count = original.count(old)
        if count != 1:
            results.append((mid, rel, desc, "UNAPPLIED", f"pattern appears {count}x, need exactly 1"))
            print(f"{mid}  UNAPPLIED  ({count}x) {desc}", flush=True)
            continue

        open(path, "w", encoding="utf-8").write(original.replace(old, new, 1))
        try:
            green, out = run_suite()
        finally:
            open(path, "w", encoding="utf-8").write(original)
            assert sha(path) == before, f"RESTORE FAILED for {rel}"

        if green:
            verdict, note = "SURVIVED", "suite stayed GREEN with the behaviour broken"
        else:
            m = re.search(r"Tests\s+(\d+) failed", out)
            verdict, note = "killed", f"{m.group(1)} test(s) caught it" if m else "suite went red"

        results.append((mid, rel, desc, verdict, note))
        print(f"{mid}  {verdict:<9} {desc}  -- {note}", flush=True)

    print("\n" + "=" * 78)
    killed = sum(1 for r in results if r[3] == "killed")
    survived = [r for r in results if r[3] == "SURVIVED"]
    unapplied = [r for r in results if r[3] == "UNAPPLIED"]
    applied = killed + len(survived)
    print(f"declared {len(MUTANTS)} | applied {applied} | killed {killed} | "
          f"SURVIVED {len(survived)} | unapplied {len(unapplied)}")
    if applied:
        print(f"mutation score: {killed}/{applied} = {killed / applied * 100:.0f}%")
    for mid, rel, desc, _, note in survived:
        print(f"  SURVIVOR {mid}  {rel}\n    {desc}")
    for mid, rel, desc, _, note in unapplied:
        print(f"  UNAPPLIED {mid}  {rel}: {note}")


if __name__ == "__main__":
    main()
