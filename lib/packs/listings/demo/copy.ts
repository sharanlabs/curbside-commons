/**
 * Demo copy — the SINGLE SOURCE of the D1 demo's honesty-critical strings
 * (plan §5 D1; criteria C7 demo-needs-no-explanation, C10 honesty surface).
 *
 * Every headline, label, and banner the demo shows in EITHER renderer (CLI +
 * web) is exported from here and imported by both — never re-typed. This is the
 * hard constraint that lets one grep-gate (evals/packs/honesty-c10.test.ts)
 * prove the verbatim C7 claim is present and the banned framing is absent across
 * the whole demo surface. Change the demo's wording here, in one place.
 *
 * Plain: the exact words the demo is allowed to say live in this one file, so
 * the honesty check only has to guard one place — and the two screens (command
 * line + web) can never drift apart in what they claim.
 */

/**
 * The C7 verbatim demo claim (Codex amendment 6) — the ONLY sanctioned headline
 * for the whole demo. It describes the MECHANISM (the verifier catching a
 * surface/SOR mismatch), never the agent as the party at fault. Framing that puts
 * the agent in the caught position is banned across every demo file; the honesty
 * eval enforces both halves.
 */
export const DEMO_CLAIM =
  "a spec-faithful simulated agent follows a spec-valid but false surface; the verifier catches the surface/SOR mismatch";

/**
 * The scripted actor's mandatory honesty label (plan §5 D1, condition 5). The
 * actor is a deterministic script, not a live model — this label is stamped on
 * every surface that shows the actor.
 */
export const DEMO_ACTOR_LABEL = "spec-faithful demonstration actor — simulated";

/**
 * The item the scripted actor is intent on ordering. Fixed in code (deterministic,
 * seeded) — a price-value drift target that is in-stock on BOTH the faithful and
 * the drifted feed, so the actor's SELECTION is stable while only the verifier's
 * verdict changes between them (the beats-compute red-green).
 */
export const DEMO_INTENT_TITLE = "Smoked Brisket Plate";

/**
 * The conformance-foil beat's line (plan §5 D1): the same document passes the
 * official schema check yet still lies about the merchant's records.
 */
export const DEMO_FOIL_LINE = "passes the official schema check; still lies";

// The former DEMO_SIMULATED_BANNER const was removed with the disclaimer-free
// shell (decision-log 2026-07-14 freeze-reversal; dead-const cleanup 2026-07-15):
// no surface consumed it after the banner removal, and the honest framing lives
// in the repo docs rather than rendered copy.

/** Per-beat plain-words leads (C4: the plain line leads every beat). */
export const DEMO_BEAT = {
  actorRead: {
    title: "The agent reads the published feed",
    plain:
      "A shopping agent reads the published menu feed — the same data any AI assistant would consume — and never sees the restaurant's own records.",
  },
  actorSelect: {
    title: "The agent selects an item, trusting the surface",
    plain:
      "Trusting the feed at face value, the agent picks its target item and is ready to order it at the price the surface shows.",
  },
  verifierFind: {
    title: "The verifier checks that same copy against the records",
    plain:
      "The verifier checks the exact same feed against the restaurant's system-of-record and flags what the agent had no way to see.",
  },
  conformanceFoil: {
    title: "Conformance-foil: spec-valid is not the same as true",
    plain:
      "The same document passes the official schema check — it is correctly shaped — and still misstates the price versus the records.",
  },
} as const;

/** A one-line, honesty-safe summary of the whole demo (mechanism, not a person). */
export const DEMO_SUBHEAD =
  "The comparison is exact, deterministic logic — no language model runs in this demo, and no live platform is touched.";
