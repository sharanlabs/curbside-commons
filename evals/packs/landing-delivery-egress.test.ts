import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { walkImports } from "../lib/import-walk.ts";
import { SIMULATED_BANNER } from "@/lib/delivery/slack.ts";
import { buildDeliveryArtifacts } from "@/lib/landing/delivery-artifacts.ts";
import { DELIVERY_IDLE } from "@/lib/landing/specimen.ts";
import expectedAcpReport from "@/fixtures/synthetic-restaurant/expected-report.acp.json";

const REPO_ROOT = process.cwd();

/**
 * THE DELIVERY STATION SENDS NOTHING — proven structurally, not promised.
 *
 * The landing page now RENDERS the Slack payload and the email message a human
 * would receive. That is the riskiest thing on the site: the only difference
 * between showing a payload and delivering one is which modules the rendering
 * component can reach. A comment claiming "no transport here" is worth nothing —
 * this repo has recorded three separate cases of a comment asserting a guarantee
 * the code did not implement.
 *
 * So the claim is enforced by the same fail-closed import walk that guards the
 * CLI, the MCP surface, and the end-to-end walkthrough: an ALLOWLIST, which
 * means a module nobody wrote a rule for still fails. If someone later adds
 * `fetch`, a webhook read, or any egress-capable import anywhere in this
 * component's closure, this test goes red before the page can send anything.
 */
describe("the landing delivery station is zero-egress by construction", () => {
  const entry = join(REPO_ROOT, "components", "landing", "DeliverySection.tsx");

  /**
   * The UI packages this closure legitimately reaches. Each is named
   * deliberately rather than waved through, because the allowlist is the whole
   * mechanism — a blanket "allow anything from node_modules" would restore
   * exactly the denylist weakness the shared walker was rewritten to remove.
   *
   * `react` is the rendering runtime; it performs no I/O of its own. `next/link`
   * is a client-side router anchor — it changes the URL, it does not fetch on
   * behalf of this component, and no report data is ever put into a href.
   * Neither can carry a payload off this page, which is the property under test.
   */
  const allowPackages = ["react", "react-dom", "next/link", "next/navigation"];

  it("walks the real import graph and finds no network capability at all", () => {
    const { violations, seen } = walkImports(entry, { root: REPO_ROOT, allowPackages });

    // THE WALK MUST ACTUALLY REACH THE BUILDERS, or a clean result proves
    // nothing — the vacuous-pass shape the import-walk guard's own tests exist
    // to prevent, and the reason the walkthrough suite asserts the same thing.
    expect(
      [...seen].some((f) => f.endsWith("DeliverySection.tsx")),
      "the walk never visited its own entry point",
    ).toBe(true);
    expect(
      [...seen].some((f) => f.endsWith(`delivery${"/"}slack.ts`) || f.endsWith("slack.ts")),
      "the walk never reached the Slack builder — the riskiest leg went unchecked",
    ).toBe(true);
    expect(
      [...seen].some((f) => f.endsWith("email-message.ts")),
      "the walk never reached the email composition",
    ).toBe(true);
    // Measured 22 at the time of writing: the component, the run bus, the
    // browser verifier seam, the whole verifier-core + listings closure behind
    // it, and both delivery builders. A floor well above a trivial walk, so a
    // resolution bug that silently stopped traversing shows up here.
    expect(
      seen.size,
      "the walk did not traverse the station's real closure",
    ).toBeGreaterThan(15);

    expect(
      violations,
      `the delivery station gained network capability: ${JSON.stringify(violations)}`,
    ).toEqual([]);
  });

  it("no transport module is reachable by name from the station", () => {
    const { seen } = walkImports(entry, { root: REPO_ROOT, allowPackages });
    // The one-shot send scripts and any future transport must stay OUTSIDE this
    // closure. Named explicitly so that wiring one in is a visible, failing act
    // rather than a quiet import.
    for (const forbidden of ["l2-resend-one-shot", "l2-slack-one-shot", "resend", "webhook"]) {
      expect(
        [...seen].some((f) => f.toLowerCase().includes(forbidden)),
        `the delivery station can reach "${forbidden}" — this page must have no send path`,
      ).toBe(false);
    }
  });
});

/**
 * THE BANNER IS THE BUILDER'S, NOT THE PAGE'S.
 *
 * `lib/delivery/slack.ts` guarantees every payload leads with the SIMULATED
 * banner — it throws if one somehow does not. The station's job is to render
 * that guarantee rather than re-state it: a banner retyped into JSX can drift
 * out of agreement with what a recipient would actually receive, and the page
 * would then be making an honesty claim the builder no longer backs.
 *
 * The vitest environment here is `node` (vitest.config.ts) — there is no DOM
 * renderer available, so this asserts on the two things that are observable
 * without one: the artifact data the component consumes, and the component's
 * source, which must READ the banner rather than contain a copy of it.
 */
describe("the delivery station's first Slack text is the builder's own banner", () => {
  it("the idle artifact's first row carries the builder's exported banner", () => {
    const first = DELIVERY_IDLE.slack[0];
    expect(first.kind).toBe("banner");
    // Sourced from the builder's EXPORT, never from a literal in this test.
    expect(first.kind === "banner" && first.text).toContain(SIMULATED_BANNER);
  });

  it("a rebuilt (live-run) artifact leads with the same banner", () => {
    const rebuilt = buildDeliveryArtifacts(JSON.stringify(expectedAcpReport), {
      tool: "check_feed",
      subject: "a reader's run",
      date: "Sat, 01 Aug 2026 12:00:00 +0000",
    });
    const first = rebuilt.slack[0];
    expect(first.kind).toBe("banner");
    expect(first.kind === "banner" && first.text).toContain(SIMULATED_BANNER);
    // And the email half leads with its own banner text, from the builder.
    expect(rebuilt.email.body.startsWith("SIMULATED DATA")).toBe(true);
    expect(rebuilt.email.subject).toContain("[SIMULATED]");
  });

  it("the banner is READ from the payload, never retyped into the component", () => {
    const src = readSource("components/landing/DeliverySection.tsx");
    // The component renders whatever row the builder produced...
    expect(src).toMatch(/case "banner"/);
    // ...and holds no copy of the banner text of its own.
    expect(
      src.includes(SIMULATED_BANNER),
      "DeliverySection contains a hand-typed copy of the SIMULATED banner — it must render the builder's",
    ).toBe(false);
    expect(
      /SIMULATED DATA/.test(src),
      "DeliverySection hand-types banner copy instead of rendering the builder's output",
    ).toBe(false);
  });

  it("the classifier gets the banner from block ZERO, which the builder guarantees", () => {
    const src = readSource("lib/landing/delivery-artifacts.ts");
    expect(src).toMatch(/i === 0/);
    // The builder's own guarantee, still in force — the tooth this leans on.
    const slackSrc = readSource("lib/delivery/slack.ts");
    expect(slackSrc).toMatch(/payload must lead with the SIMULATED banner/);
  });
});

/**
 * THE SERVER/CLIENT BOUNDARY — the one the bundle depends on.
 *
 * `lib/landing/specimen.ts` declares itself a SERVER module in its own header,
 * and that is load-bearing rather than decorative: it imports the drifted feed,
 * the SOR catalog, the committed golden report, and the engine measurables. A
 * single `"use client"` component importing it would drag all of that into the
 * browser bundle — silently, with no test failing and no visible defect until
 * someone measures the payload.
 *
 * The stations therefore receive their idle figures and artifacts as plain
 * serializable PROPS from `app/page.tsx`, which is a Server Component. This
 * checks that the rule actually holds, because a `next build` cannot be run in
 * every environment and "we were careful" is not a mechanism.
 */
describe("the landing's server-only grounding never enters a client component", () => {
  const clientFiles = [
    "components/landing/DeliverySection.tsx",
    "components/landing/VerdictSlab.tsx",
    "components/landing/RunTicker.tsx",
    "components/landing/ProcessStrip.tsx",
    "components/landing/run-bus.ts",
    "components/playground/AuditWorkbench.tsx",
    "components/playground/FileDrop.tsx",
  ];

  it("every station listed here really is a client component (or the check is vacuous)", () => {
    for (const f of clientFiles.filter((f) => f.endsWith(".tsx") || f.includes("run-bus"))) {
      expect(readSource(f).startsWith('"use client"'), `${f} is not a client module`).toBe(true);
    }
  });

  it("no client module imports the server-only landing specimen", () => {
    for (const f of clientFiles) {
      const src = readSource(f);
      expect(
        /from\s+["']@\/lib\/landing\/specimen/.test(src),
        `${f} imports lib/landing/specimen — that module carries the fixtures and the engine ` +
          "measurables, and a client import would bundle all of it into the browser. Pass the " +
          "figures down as props from app/page.tsx instead.",
      ).toBe(false);
      // The fixtures themselves must not arrive by a side door either.
      expect(
        /fixtures\//.test(src),
        `${f} reaches a fixture directly — the same bundling problem, one layer down`,
      ).toBe(false);
    }
  });

  it("the page that DOES ground them is a server component", () => {
    const page = readSource("app/page.tsx");
    expect(page.startsWith('"use client"')).toBe(false);
    expect(page).toMatch(/from "@\/lib\/landing\/specimen"/);
    // And it hands the grounded values down rather than letting a station fetch them.
    expect(page).toMatch(/idle=\{VERDICT_IDLE\}/);
    expect(page).toMatch(/idle=\{DELIVERY_IDLE\}/);
  });
});

function readSource(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), "utf8");
}
