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

const demoScanned = [
  ...demoSources(),
  join(root, "components", "demo", "DemoView.tsx"),
  join(root, "app", "demo", "page.tsx"),
  join(root, "fixtures", "synthetic-restaurant", "expected-demo.txt"),
  join(root, "fixtures", "synthetic-restaurant", "expected-demo.json"),
];

const scannedFiles = [
  ...packSources(),
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

  it.each(demoScanned)("%s never frames the agent as 'caught' (banned headline)", (file) => {
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
