import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CORPUS_AS_OF,
  CORPUS_SEED,
  UCP_PINNED_VERSION,
  buildUcpSearchResponse,
  generateCatalog,
} from "@/lib/packs/listings";
import { runUcpConformance } from "@/lib/packs/listings/conformance";
import { DEMO_CLAIM, DEMO_SIMULATED_BANNER } from "@/lib/packs/listings/demo/copy";

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

const demoScanned = [
  ...demoSources(),
  join(root, "components", "demo", "DemoView.tsx"),
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

// S2 (plan v3.3, F-04): the site SHELL joins the same honesty gates — the landing
// page and the global layout (whose footer carries the semantic disclosure
// contract) are viewer-facing prose surfaces exactly like the report/demo views.
const siteShell = [
  join(root, "app", "page.tsx"),
  join(root, "app", "layout.tsx"),
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
  // must sit inside the same honesty gate as the corpus docs.
  join(root, "components", "report", "ReportView.tsx"),
  join(root, "app", "report", "page.tsx"),
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

describe("C10 platform-claims grep-gate (no real-platform-access claims)", () => {
  it.each(scannedFiles)("%s makes no real-platform-access / no-AI claim", (file) => {
    const text = readFileSync(file, "utf8");
    for (const pattern of BANNED_CLAIMS) {
      const m = text.match(pattern);
      expect(m === null, `banned claim ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
    }
  });

  it("the gate actually bites (a planted overclaim would be caught)", () => {
    const planted = "This prototype uses real DoorDash data and no AI was used.";
    expect(BANNED_CLAIMS.some((p) => p.test(planted))).toBe(true);
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

  it("every demo surface carries the simulated label", () => {
    // engine copy (actor label), the committed transcript, and the web view.
    const copySrc = readFileSync(join(root, "lib", "packs", "listings", "demo", "copy.ts"), "utf8");
    expect(/simulated/i.test(copySrc)).toBe(true);
    const transcript = readFileSync(
      join(root, "fixtures", "synthetic-restaurant", "expected-demo.json"),
      "utf8",
    );
    expect(transcript).toContain('"simulated": true');
    expect(/simulated/i.test(transcript)).toBe(true);
    const view = readFileSync(join(root, "components", "demo", "DemoView.tsx"), "utf8");
    expect(/SIMULATED/.test(view)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// S2 (plan v3.3) — the footer semantic disclosure contract, the banner parity
// lock, and the mockup claim scan. Decision-log 2026-07-10 (freeze-reversal
// row): the layout footer's byte-freeze is replaced by SEMANTIC teeth — the
// wording may change, these five disclosures may not.
// ---------------------------------------------------------------------------

describe("S2 footer semantic disclosure contract (app/layout.tsx)", () => {
  const layoutSrc = readFileSync(join(root, "app", "layout.tsx"), "utf8");
  // JSX splits sentences across lines/spans; judge the contract on a
  // whitespace-normalized, markup-stripped view of the source.
  const normalized = layoutSrc
    .replace(/<[^>]+>/g, " ")
    .replace(/\{["'` ]*\}/g, " ")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/\s+/g, " ");

  const CONTRACT: ReadonlyArray<[name: string, pattern: RegExp]> = [
    ["prototype/simulated status", /Demo \/ portfolio prototype — simulated data throughout/],
    ["replay provenance", /static replay of committed,? labeled fixtures/],
    ["recorded-fixture provenance", /recorded static fixture/],
    ["truthful send posture", /initiates no sends and makes no live calls/],
    ["the one recorded send disclosed", /exactly one recorded, owner-armed send exists/],
    ["non-affiliation sentence (verbatim; e2e asserts it too)", /Not affiliated with, endorsed by, or connected to/],
    ["human-led line", /Human-led, AI-assisted, professionally reviewed/],
  ];

  it.each(CONTRACT)("the footer carries: %s", (_name, pattern) => {
    expect(pattern.test(normalized), `missing footer disclosure: ${pattern}`).toBe(true);
  });

  it("the contract bites: the OLD (pre-reversal) footer text would FAIL the send-posture check", () => {
    const oldFooter =
      "REPLAY over fictional display names + synthetic activation state — not production logs, real sends, real marketplace access, or real-impact data.";
    expect(/initiates no sends and makes no live calls/.test(oldFooter)).toBe(false);
    expect(/exactly one recorded, owner-armed send exists/.test(oldFooter)).toBe(false);
  });
});

describe("S2 banner parity — ReportView's SIMULATED banner ≡ the single-sourced demo banner", () => {
  // The banner itself stays BYTE-FROZEN (decision-log 2026-07-10: the reversal is
  // scoped to the footer). This parity test removes the F-04 risk of the two
  // independently-maintained copies drifting: ReportView's hardcoded JSX text
  // must normalize to exactly DEMO_SIMULATED_BANNER (which DemoView imports).
  it("the report banner text (normalized) equals DEMO_SIMULATED_BANNER (normalized)", () => {
    const src = readFileSync(join(root, "components", "report", "ReportView.tsx"), "utf8");
    const m = src.match(/<span className="rpt-sim-text">([\s\S]*?)<\/span>/);
    expect(m, "ReportView must contain the rpt-sim-text banner span").not.toBeNull();
    const normalize = (s: string) =>
      s.replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    expect(normalize(m![1])).toBe(normalize(DEMO_SIMULATED_BANNER));
  });
});

describe("S2 mockup claim scan (every committed mockup HTML, recursive)", () => {
  // F-04: mockups sat outside every honesty scan. Scan them all for the same
  // affirmative overclaims. The one sanctioned HONEST sentence — the
  // non-affiliation disclaimer — is stripped first (in plain HTML its
  // "…or connected to <brand>" tail would false-positive the connected-to
  // pattern that markup happens to break in JSX/markdown sources).
  const NON_AFFILIATION_SENTENCE =
    /not affiliated\s+with,?\s*endorsed\s+by,?\s*or\s+connected\s+to[^.<]*/gi;

  const mockupFiles = readdirSync(join(root, "mockups"), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(".html"))
    .map((f) => join(root, "mockups", f));

  it("the mockup set is non-empty (the scan actually covers something)", () => {
    expect(mockupFiles.length).toBeGreaterThan(0);
  });

  it.each(mockupFiles)("%s makes no affirmative real-platform/no-AI claim", (file) => {
    const text = readFileSync(file, "utf8").replace(NON_AFFILIATION_SENTENCE, " ");
    for (const pattern of BANNED_CLAIMS) {
      const m = text.match(pattern);
      expect(m === null, `banned claim ${pattern} in ${file}: ${m?.[0]}`).toBe(true);
    }
  });

  it("the mockup scan bites: a planted overclaim survives the non-affiliation strip and is caught", () => {
    const planted =
      "Not affiliated with, endorsed by, or connected to DoorDash. This dashboard shows actual DoorDash data live.";
    const stripped = planted.replace(NON_AFFILIATION_SENTENCE, " ");
    expect(BANNED_CLAIMS.some((p) => p.test(stripped))).toBe(true);
  });
});
