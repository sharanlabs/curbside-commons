import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  CORPUS_AS_OF,
  CORPUS_SEED,
  UCP_PINNED_VERSION,
  buildUcpSearchResponse,
  generateCatalog,
} from "@/lib/packs/listings";
import { runUcpConformance } from "@/lib/packs/listings/conformance";
import { DEMO_CLAIM } from "@/lib/packs/listings/demo/copy";

/**
 * C10 honesty surface (plan §4 C10; P3-6 W1 gate advisory) — machine-checked:
 *  (a) NO real-platform-access / "no-AI" claim appears in pack sources, the CLI,
 *      or the fixture READMEs (an affirmative-overclaim grep-gate);
 *  (b) the UCP-touching artifacts carry an explicit simulated/honesty label;
 *  (c) every conformance report pins the spec version and the simulated flag.
 *
 * The banned patterns match ONLY affirmative overclaims — honest negations
 * ("no real platform access", "not recorded from any real marketplace") are not
 * caught, which is why the sources that make those honest disclaimers pass.
 */

const root = process.cwd();

function packSources(): string[] {
  const dir = join(root, "lib", "packs", "listings");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => join(dir, f));
}

// D1: the demo engine sources + the public demo surface (page + view) + the
// committed transcript goldens. Every file a viewer reads or the demo emits sits
// inside the same honesty gate as the corpus docs.
function demoSources(): string[] {
  const dir = join(root, "lib", "packs", "listings", "demo");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => join(dir, f));
}

// de-slop 2026-07-20: DemoView.tsx deleted (route-orphaned since the /demo stub;
// liveness-proven — no route import). The stub page stays in the scan.
const demoScanned = [
  ...demoSources(),
  join(root, "app", "demo", "page.tsx"),
  join(root, "fixtures", "synthetic-restaurant", "expected-demo.txt"),
  join(root, "fixtures", "synthetic-restaurant", "expected-demo.json"),
];

// Pub slice (plan §5 Pub): the root README and the publication writeup are the
// primary PUBLIC prose surfaces — they sit inside the same honesty gates as
// every other viewer-facing artifact (both the platform-claims gate and the
// demo framing gate below).
const publicProse = [
  join(root, "README.md"),
  join(root, "docs", "PUBLICATION.md"),
];

// Redesign C-REDO (2026-07-14): every landing component is a viewer-facing prose
// surface — read the whole dir so a NEW landing component can never slip the gate
// (this closes the F-07 gap where the fixed allowlist excluded them).
function landingSources(): string[] {
  const dir = join(root, "components", "landing");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join(dir, f));
}

// S2 (plan v3.3, F-04): the site SHELL joins the same honesty gates — the landing
// page and the global layout (whose footer carries the semantic disclosure
// contract) are viewer-facing prose surfaces exactly like the report/demo views.
const siteShell = [
  join(root, "app", "page.tsx"),
  join(root, "app", "layout.tsx"),
  // Landing grounding + the landing components (redesign C-REDO).
  join(root, "lib", "landing", "specimen.ts"),
  ...landingSources(),
  // Playground slice (owner commission 2026-07-13): the in-browser verifier's
  // page + client + seam are viewer-facing prose surfaces — same gates.
  join(root, "app", "playground", "page.tsx"),
  join(root, "components", "playground", "PlaygroundClient.tsx"),
  join(root, "components", "playground", "verify-in-browser.ts"),
  join(root, "components", "playground", "TryLiveBench.tsx"),
  // /legacy archive landing (build piece 2, 2026-07-20): the front door to the
  // archived first-generation module — a viewer-facing prose surface.
  join(root, "app", "legacy", "page.tsx"),
  // Fee surface (NYC showcase N1+N2, 2026-07-16): the /fees page + its view,
  // paste client, data module, and browser seam — same gates.
  join(root, "app", "fees", "page.tsx"),
  join(root, "components", "fees", "FeesView.tsx"),
  join(root, "components", "fees", "FeePlaygroundClient.tsx"),
  join(root, "components", "fees", "fee-report-data.ts"),
  join(root, "components", "fees", "audit-in-browser.ts"),
  // Proof + docs surfaces (build pieces 2–3, 2026-07-20): new viewer-facing
  // prose surfaces — grill-me hardening catch (session 30) closed this gap the
  // same night these pages shipped, before it could go stale.
  join(root, "app", "proof", "page.tsx"),
  join(root, "components", "proof", "CalibrationPlate.tsx"),
  join(root, "components", "proof", "CountFig.tsx"),
  join(root, "app", "docs", "page.tsx"),
];

const scannedFiles = [
  ...packSources(),
  ...publicProse,
  ...siteShell,
  join(root, "bin", "check.mjs"),
  join(root, "fixtures", "README.md"),
  join(root, "fixtures", "synthetic-restaurant", "README.md"),
  join(root, "fixtures", "ucp-schemas", UCP_PINNED_VERSION, "README.md"),
  join(root, "fixtures", "ucp-schemas", UCP_PINNED_VERSION, "PROVENANCE.json"),
  // W3 public report surface (M1 Codex P3): the page a viewer actually reads
  // must sit inside the same honesty gate as the corpus docs. (ReportView was
  // superseded by the v9 takeover's Jewel + Ledger, build piece 1 2026-07-20.)
  join(root, "components", "report", "Jewel.tsx"),
  join(root, "components", "report", "Ledger.tsx"),
  join(root, "app", "report", "page.tsx"),
  // Outbound delivery builders (the L-2 one-shots' payload sources): the strings
  // a RECIPIENT reads must sit inside the same honesty gate as the corpus docs
  // (session-32 email-HTML slice; the s30 grill lesson — new surfaces join the scan).
  join(root, "lib", "delivery", "slack.ts"),
  join(root, "lib", "delivery", "email.ts"),
  join(root, "lib", "delivery", "email-html.ts"),
  ...demoScanned,
];

const BANNED_CLAIMS: readonly RegExp[] = [
  /\bno AI was used\b/i,
  /\bAI built this\b/i,
  /\bbuilt (?:entirely )?by AI\b/i,
  /\breal[- ](?:time )?(?:DoorDash|Square|Uber\s?Eats|Grubhub)\s+(?:data|access|feed|account|integration|API)/i,
  /\b(?:connected|integrated) to (?:DoorDash|Square|Uber|Grubhub|the (?:live )?marketplace)\b/i,
  /\bactual (?:DoorDash|Square|marketplace|merchant) (?:data|account|orders?)\b/i,
  /\bproduction (?:merchant|platform|marketplace) data\b/i,
  /\bwe have (?:real |live )?(?:platform |marketplace )?access\b/i,
];

// F-08: one ISOLATED planted claim per banned pattern (never combined under a
// single `some()`), so a pattern that silently stopped matching is caught on its
// own — a combined probe would stay green as long as ANY one pattern still bit.
const BANNED_PROBES: ReadonlyArray<readonly [RegExp, string]> = [
  [BANNED_CLAIMS[0], "no AI was used to build this"],
  [BANNED_CLAIMS[1], "AI built this dashboard"],
  [BANNED_CLAIMS[2], "this was built entirely by AI"],
  [BANNED_CLAIMS[3], "the page shows real-time DoorDash data"],
  [BANNED_CLAIMS[4], "the app is connected to DoorDash"],
  [BANNED_CLAIMS[5], "displays actual DoorDash orders"],
  [BANNED_CLAIMS[6], "renders production platform data"],
  [BANNED_CLAIMS[7], "we have live platform access"],
];

describe("C10 platform-claims grep-gate (no real-platform-access claims)", () => {
  it.each(scannedFiles)("%s makes no real-platform-access / no-AI claim", (file) => {
    const text = readFileSync(file, "utf8");
    for (const pattern of BANNED_CLAIMS) {
      const m = text.match(pattern);
      expect(m === null, `banned claim ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
    }
  });

  it("every banned pattern has exactly one dedicated probe (kept in lockstep)", () => {
    expect(BANNED_PROBES.length).toBe(BANNED_CLAIMS.length);
    BANNED_PROBES.forEach(([p], i) => expect(p).toBe(BANNED_CLAIMS[i]));
  });

  it.each(BANNED_PROBES)(
    "the gate bites in isolation: %s matches its own planted claim",
    (pattern, planted) => {
      expect(pattern.test(planted), `pattern ${pattern} failed to catch "${planted}"`).toBe(true);
    },
  );
});

// ---------------------------------------------------------------------------
// SITE-WIDE (F-07): the fixed source allowlist above cannot cover every rendered
// surface (the new landing components, /cost, /eval, /metrics, /legacy/**, the
// redirect stubs, 404 …). The AUTHORITATIVE site-wide gate scans the NORMALIZED
// VISIBLE TEXT of every built out/**/*.html — a false claim on ANY route is
// caught, and a claim split across JSX elements/lines (which a raw-source regex
// misses, F-08) is rejoined by tag-stripping before the scan. Rendered HTML has
// no code comments, so this is comprehensive without benign false positives.
//
// Freshness: this runs against a built out/ and REFUSES a stale one (phase-F
// batch finding #9 — accepting any existing out/ made the site-wide gate
// fail-open: edited source scanned yesterday's HTML). If out/ is absent OR older
// than the newest page source under app/, components/, or lib/, it rebuilds ONCE
// (self-sufficient — never a silently-skipped honesty gate). `npm run verify`
// builds BEFORE the test run for the same reason, so there this is instant.
// ---------------------------------------------------------------------------

const outDir = join(root, "out");

function newestMtimeMs(dir: string): number {
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) newest = Math.max(newest, newestMtimeMs(full));
    else newest = Math.max(newest, statSync(full).mtimeMs);
  }
  return newest;
}

function ensureBuilt(): void {
  if (existsSync(outDir)) {
    const built = statSync(join(outDir, "index.html")).mtimeMs;
    const newestSource = Math.max(
      newestMtimeMs(join(root, "app")),
      newestMtimeMs(join(root, "components")),
      newestMtimeMs(join(root, "lib")),
    );
    if (built >= newestSource) return;
  }
  execSync("npm run build", { cwd: root, stdio: "inherit" });
}

function htmlFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...htmlFiles(full));
    else if (entry.name.endsWith(".html")) files.push(full);
  }
  return files;
}

/**
 * Reduce a built HTML page to its normalized VISIBLE text: drop <script>/<style>
 * blocks (embedded data, not visible copy), strip every tag (rejoining a claim
 * split across elements/lines), decode a few entities, and collapse whitespace.
 */
export function visibleText(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "—")
    .replace(/&rsquo;|&#39;|&apos;/g, "'")
    .replace(/&ldquo;|&rdquo;|&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&sect;/g, "§")
    .replace(/\s+/g, " ")
    .trim();
}

describe("C10 SITE-WIDE banned-claim scan (normalized visible text of every built out/**/*.html)", () => {
  it(
    "no rendered page carries a banned real-platform / no-AI claim",
    { timeout: 600_000 },
    () => {
      ensureBuilt();
      const pages = htmlFiles(outDir);
      expect(pages.length, "out/ has no HTML pages — did the build run?").toBeGreaterThan(0);

      const violations: string[] = [];
      for (const file of pages) {
        const text = visibleText(readFileSync(file, "utf8"));
        for (const pattern of BANNED_CLAIMS) {
          const m = text.match(pattern);
          if (m) violations.push(`${pattern} in ${relative(root, file)}: "${m[0]}"`);
        }
      }
      expect(violations, `banned claims rendered on the built site:\n${violations.join("\n")}`).toEqual(
        [],
      );
    },
  );

  it("the visible-text normalizer rejoins a claim split across JSX / lines (F-08)", () => {
    // A claim broken across elements + newlines in source becomes contiguous in
    // rendered HTML; tag-stripping + whitespace collapse must rejoin it so the
    // pattern still matches (a raw per-line source scan would have missed it).
    const split = '<p>the app is\n  connected\n  to <span class="brand">DoorDash</span>.</p>';
    const text = visibleText(split);
    expect(text).toContain("connected to DoorDash");
    expect(BANNED_CLAIMS.some((p) => p.test(text))).toBe(true);
  });
});

describe("C10 simulated labels on the UCP-touching artifacts", () => {
  it.each([
    "ucp.ts",
    "ucp-wire.ts",
    "ucp-corpus.ts",
    "conformance.ts",
  ])("lib/packs/listings/%s carries an explicit simulated/simulation label", (f) => {
    const text = readFileSync(join(root, "lib", "packs", "listings", f), "utf8");
    expect(/simulat(ed|ion)/i.test(text)).toBe(true);
  });

  it("the pinned-schema README labels the schemas as an untrusted pinned fetch", () => {
    const text = readFileSync(join(root, "fixtures", "ucp-schemas", UCP_PINNED_VERSION, "README.md"), "utf8");
    expect(/pinned/i.test(text)).toBe(true);
    expect(text).toContain("Apache-2.0");
  });
});

describe("C10 spec-version pin + simulated flag in every conformance report", () => {
  it("a conformance report header pins the UCP spec version and simulated:true", () => {
    const sor = generateCatalog(CORPUS_SEED, CORPUS_AS_OF);
    const report = runUcpConformance(buildUcpSearchResponse(sor), { op: "search" });
    expect(report.specVersion).toContain(UCP_PINNED_VERSION);
    expect(report.simulated).toBe(true);
  });
});

describe("D1 demo honesty surface (plan §5 D1, C7/C10)", () => {
  // The C7 headline is the ONLY sanctioned framing; framing the AGENT as the
  // thing caught is banned everywhere in the demo (Codex amendment 6).
  const BANNED_FRAMING: readonly RegExp[] = [
    /\bcaught the agent\b/i,
    /\bagent (?:gets|is|was|got) caught\b/i,
    /\bthe agent gets caught\b/i,
  ];

  it("the C7 verbatim claim is single-sourced in the demo copy module (engine)", () => {
    const copySrc = readFileSync(join(root, "lib", "packs", "listings", "demo", "copy.ts"), "utf8");
    expect(copySrc).toContain(DEMO_CLAIM);
    // The verbatim claim must never contain the banned headline.
    expect(/\bthe agent gets caught\b/i.test(DEMO_CLAIM)).toBe(false);
  });

  it("the root README quotes the C7 claim VERBATIM (drift-locked to copy.ts)", () => {
    const readme = readFileSync(join(root, "README.md"), "utf8");
    expect(readme).toContain(DEMO_CLAIM);
  });

  it.each([...demoScanned, ...publicProse, ...siteShell])("%s never frames the agent as 'caught' (banned headline)", (file) => {
    const text = readFileSync(file, "utf8");
    for (const pattern of BANNED_FRAMING) {
      const m = text.match(pattern);
      expect(m === null, `banned framing ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
    }
  });

  it("the framing gate actually bites (a planted 'agent gets caught' would be caught)", () => {
    const planted = "Watch as the agent gets caught red-handed.";
    expect(BANNED_FRAMING.some((p) => p.test(planted))).toBe(true);
  });

  it("the CLI demo surfaces keep their honest simulated labels (engine copy + committed transcript)", () => {
    // Freeze-reversal (decision-log 2026-07-14): the WEB SIMULATED banner was
    // removed from DemoView, but the CLI/repo stays honest — the engine copy and
    // the committed transcript golden keep their labels. (The removed DemoView.tsx
    // assertion is covered by the report/demo view edits + the mockup scan below.)
    const copySrc = readFileSync(join(root, "lib", "packs", "listings", "demo", "copy.ts"), "utf8");
    expect(/simulated/i.test(copySrc)).toBe(true);
    const transcript = readFileSync(
      join(root, "fixtures", "synthetic-restaurant", "expected-demo.json"),
      "utf8",
    );
    expect(transcript).toContain('"simulated": true');
    expect(/simulated/i.test(transcript)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FOOTER (freeze-reversal, decision-log 2026-07-14, line ~175) — SUPERSEDES the
// 2026-07-10 S2 semantic-disclosure contract + the SIMULATED banner-parity lock.
// The public site is DISCLAIMER-FREE: the removed footer/banner contracts are
// replaced by an HONEST-CONTENT + NO-FALSE-CLAIM contract. The honest technical
// framing now lives in the repo README, not the site. The C10 BANNED_CLAIMS
// grep-gate above stays green and keeps its teeth (unchanged).
// ---------------------------------------------------------------------------

describe("footer is disclaimer-free + honest (app/layout.tsx, freeze-reversal 2026-07-14)", () => {
  const layoutSrc = readFileSync(join(root, "app", "layout.tsx"), "utf8");

  // Bind to the FOOTER BLOCK specifically (not the whole file), with JSX comments
  // stripped, so nothing outside the rendered footer satisfies or defeats the gate.
  const footerMatch = layoutSrc.match(/<footer[\s\S]*?<\/footer>/);
  const footerRaw = footerMatch?.[0] ?? "";

  const normalizeJsx = (s: string) =>
    s
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\{["'` ]*\}/g, " ")
      .replace(/&ldquo;|&rdquo;/g, '"')
      .replace(/&rsquo;/g, "'")
      .replace(/\s+/g, " ");

  const normalized = footerMatch ? normalizeJsx(footerRaw) : "";

  it("the layout renders exactly one footer block", () => {
    expect(footerMatch, "app/layout.tsx must contain a <footer> block").not.toBeNull();
  });

  // HONEST CONTENT that MUST be present.
  it("the footer carries the author/credit line to the maintainer's profile", () => {
    expect(/Built and directed by\s+Sharan Kumar/.test(normalized), "author credit missing").toBe(
      true,
    );
    expect(/github\.com\/sharanlabs/.test(footerRaw), "author profile link missing").toBe(true);
  });

  it("the footer carries the honest build-provenance line", () => {
    // BUILD_INFO.label is injected by next.config.ts and rendered in the footer.
    expect(/BUILD_INFO\.label/.test(footerRaw), "build-provenance line missing from footer").toBe(
      true,
    );
  });

  // DISCLAIMER-FREE — the reversed disclosures/brands are GONE from the footer.
  // This is the red half: it FAILS against the pre-reversal footer.
  const REMOVED: ReadonlyArray<[name: string, pattern: RegExp]> = [
    ["prototype/simulated-data disclaimer", /simulated data throughout/i],
    ["replay-of-committed-fixtures disclaimer", /static replay of committed/i],
    ["no-sends posture disclaimer", /initiates no sends/i],
    ["owner-armed-send disclaimer", /owner-armed send/i],
    ["non-affiliation disclaimer", /Not affiliated with, endorsed by, or connected to/i],
    ["real-brand names", /DoorDash|Uber\s?Eats|Grubhub|DataSF/i],
  ];
  it.each(REMOVED)("the footer no longer carries: %s", (_name, pattern) => {
    expect(pattern.test(normalized), `disclaimer/brand should be removed: ${pattern}`).toBe(false);
  });

  // TEETH — the disclaimer-free footer contains NONE of the C10 banned claims.
  it("the footer contains none of the BANNED_CLAIMS", () => {
    for (const pattern of BANNED_CLAIMS) {
      const m = normalized.match(pattern);
      expect(m === null, `banned claim ${pattern} in footer: ${m?.[0]}`).toBe(true);
    }
  });

  it("the footer BANNED_CLAIMS check bites (a planted false claim in a footer would be caught)", () => {
    const plantedFooter =
      "Curbside Commons is connected to DoorDash and shows production platform data; no AI was used.";
    expect(BANNED_CLAIMS.some((p) => p.test(plantedFooter))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// RULES.md §4(b) — the permanent "what is real" carrier (amended 2026-07-20,
// decision-log row; owner structured-ask, resolving the acceptance-gate BLOCK
// on this session's build). The rule now requires TWO enforced things instead
// of a literal "simulated" label everywhere: (a) BANNED_CLAIMS stays green
// (checked above, site-wide) and (b) one findable, accurate "what is real"
// page stays footer-linked from every page, never deleted. This is the
// red-green tooth for (b) — it must fail if either half goes missing.
// ---------------------------------------------------------------------------

describe("RULES.md §4(b) — the /docs 'what is real' page stays footer-linked (never deleted)", () => {
  it("the footer links to /docs on every page (app/layout.tsx, shared chrome)", () => {
    const layoutSrc = readFileSync(join(root, "app", "layout.tsx"), "utf8");
    const footer = layoutSrc.match(/<footer[\s\S]*?<\/footer>/)?.[0] ?? "";
    expect(footer).toMatch(/href="\/docs"/);
  });

  it("/docs states plainly what is real and what is invented", () => {
    const docsSrc = readFileSync(join(root, "app", "docs", "page.tsx"), "utf8");
    expect(docsSrc).toMatch(/What is real, and what is invented\./);
    expect(docsSrc).toMatch(/invented/i);
    expect(docsSrc).toMatch(/No real platform feed\s+or statement was audited\./i);
  });
});

describe("mockup claim scan (every committed mockup HTML, recursive)", () => {
  // F-04: mockups sat outside every honesty scan. Scan them all for the same
  // affirmative overclaims. Only the sanctioned honest PREDICATE — "not
  // affiliated with, endorsed by, or connected to" — is removed before the
  // scan (in plain HTML its "connected to <brand>" tail would false-positive
  // the connected-to pattern that markup happens to break in JSX/markdown).
  // Batch-A Codex P2 (accepted-fixed): strip ONLY the predicate words, never
  // the rest of the sentence, so an overclaim sharing the sentence still gets
  // scanned — the brand list that follows the predicate matches no banned
  // pattern on its own.
  const NON_AFFILIATION_PREDICATE =
    /not affiliated\s+with,?\s*endorsed\s+by,?\s*or\s+connected\s+to\b/gi;

  const mockupFiles = readdirSync(join(root, "mockups"), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(".html"))
    .map((f) => join(root, "mockups", f));

  it("the mockup set is non-empty (the scan actually covers something)", () => {
    expect(mockupFiles.length).toBeGreaterThan(0);
  });

  it.each(mockupFiles)("%s makes no affirmative real-platform/no-AI claim", (file) => {
    const text = readFileSync(file, "utf8").replace(NON_AFFILIATION_PREDICATE, " ");
    for (const pattern of BANNED_CLAIMS) {
      const m = text.match(pattern);
      expect(m === null, `banned claim ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
    }
  });

  it("the mockup scan bites: a planted overclaim in its OWN sentence is caught", () => {
    const planted =
      "Not affiliated with, endorsed by, or connected to DoorDash. This dashboard shows actual DoorDash data live.";
    const stripped = planted.replace(NON_AFFILIATION_PREDICATE, " ");
    expect(BANNED_CLAIMS.some((p) => p.test(stripped))).toBe(true);
  });

  it("the mockup scan bites: an overclaim sharing the DISCLAIMER'S OWN sentence is caught (predicate-only strip)", () => {
    // Batch-A Codex P2 adversarial case: the old sentence-wide strip would have
    // erased this whole line; the predicate-only strip must leave the overclaim.
    const planted =
      "Not affiliated with, endorsed by, or connected to DoorDash — this dashboard shows actual DoorDash data live.";
    const stripped = planted.replace(NON_AFFILIATION_PREDICATE, " ");
    expect(BANNED_CLAIMS.some((p) => p.test(stripped))).toBe(true);
  });

  it("the strip removes only the predicate: the honest disclaimer still passes clean", () => {
    const honest =
      "Not affiliated with, endorsed by, or connected to DoorDash, Uber Eats, Grubhub, DataSF, or any business.";
    const stripped = honest.replace(NON_AFFILIATION_PREDICATE, " ");
    expect(BANNED_CLAIMS.some((p) => p.test(stripped))).toBe(false);
  });
});
