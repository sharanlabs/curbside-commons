import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Onest, JetBrains_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { BUILD_INFO } from "@/lib/build-info";
import { PLATFORM_NAME } from "@/lib/product";
import { COVERAGE } from "@/lib/landing/specimen";
import "./globals.css";

// Self-hosted via next/font/google. IMPORTANT — what "self-hosted" means here:
// the font files are fetched at BUILD time and served from our own origin, so
// the RUNTIME promise (no off-origin requests, nothing leaves the page) holds
// exactly as before. The build machine needs to reach Google Fonts; the reader's
// browser never does.
//
// Two-voice system: Onest — one variable sans (100..900, wght axis) carrying
// BOTH display and body voices — plus JetBrains Mono for tabular ledger numerals
// / field keys / verdict labels / uppercase eyebrows.
//
// ONEST RESTORED 2026-07-31 by owner word ("USE this font throughout", pointing
// at the v8 hero mockup whose embedded @font-face is Onest; confirmed via
// structured ask: "Onest throughout"). This REVERSES the 2026-07-28 Nunito pick
// — see docs/decision-log.md 2026-07-31 for the reversal record. Availability
// and the variable wght axis (100..900, normal style only) were verified against
// the INSTALLED font manifest
// (node_modules/next/dist/compiled/@next/font/dist/google/font-data.json), not
// recalled — the repo declares no weight below 400 and none above 900, inside
// Onest's axis, so nothing falls back to a synthesised weight. Weight/tracking
// calibration was moved back to Onest-era values in the same change (the Nunito
// values were deliberately bumped because Nunito reads optically lighter).
// Exposed as CSS variables consumed in globals.css as --font-sans / --font-mono;
// the --serif/--display token NAMES survive in globals.css but resolve to this.
const onest = Onest({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// The page declares its own ground colour to the browser CHROME, not just to
// itself. Without this, a browser running a dark system theme tints the strip
// above the page — tab bar, or the safe-area fill on iOS — with its own dark
// default, and the site appears to open on a navy band it does not paint. The
// owner saw exactly that on /report and reasonably read it as a design defect.
//
// `colorScheme: "light"` is the matching half: globals.css already declares
// `color-scheme: light` (~line 36), but the CSS declaration only reaches form
// controls and scrollbars once the stylesheet parses. The meta tag reaches the
// browser first, so the two together close the gap before first paint rather
// than after it.
export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export const metadata: Metadata = {
  // metadataBase = the LIVE deploy target.
  //
  // HISTORY, because this line has now been wrong in both directions and the
  // reason matters more than the value: it named the Vercel host while the site
  // was served from Cloudflare Pages (so every derived absolute URL — OG image,
  // canonical — addressed a host that did not serve the site). That was
  // corrected to `pages.dev` on 2026-07-25, and then the OWNER MOVED THE DEPLOY
  // TARGET TO VERCEL the same day, which made `pages.dev` wrong in turn.
  //
  // The invariant, not the value: **a metadataBase is only correct relative to
  // where the thing actually lives.** It is not a preference or a brand name —
  // it is a factual claim about hosting, so it changes whenever hosting does.
  // `evals/presentation-posture.test.ts` asserts this against the BUILT export,
  // which is the only place the claim can be checked rather than assumed.
  metadataBase: new URL("https://curbside-commons.vercel.app"),
  title: {
    default: "Curbside Commons — deterministic commerce-truth verifier",
    template: "%s · Curbside Commons",
  },
  description:
    "The proof layer for agentic commerce — a deterministic verifier that checks a published feed against the merchant's own records, validates data-format conformance, and audits NYC delivery fee statements, with evidence attached to every finding. A working prototype on simulated data.",
  openGraph: {
    siteName: "Curbside Commons",
    title: "Curbside Commons — the proof layer for agentic commerce",
    // HONESTY (RULES §4) — a social card is the one surface that travels
    // WITHOUT its page, so it has to carry its own scope. Every other surface
    // is labelled in its chrome; a screenshotted card is not. The prototype +
    // simulated-data qualifier is therefore part of the card copy itself, not
    // something a reader has to click through to discover.
    description:
      "Menu and catalog claims checked against the merchant's own record; NYC delivery fee statements audited against the codified caps — evidence attached to every finding. A working prototype run on simulated data; not affiliated with any delivery platform.",
    type: "website",
    locale: "en_US",
    // Static SVG (the site is a static export — no runtime image route). It
    // carries "SIMULATED DATA · PROTOTYPE" on its face, because a card is the
    // one surface that travels without its page.
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Curbside Commons — deterministic verifier for agentic commerce. Simulated data, prototype." }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.svg"],
    title: "Curbside Commons — the proof layer for agentic commerce",
    description:
      "A deterministic verifier for agentic commerce: feed-vs-record truth, schema conformance, NYC fee-cap audits. Working prototype, simulated data.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${onest.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <a href="#main-content" className="ds-skip">
          Skip to main content
        </a>
        {/* Readout figures derive from the engine's own report via the landing
            specimen module (server) — the nav chrome never hand-types a count. */}
        <Nav
          figures={{
            findingsTotal: COVERAGE.findingsTotal,
            errors: COVERAGE.errors,
            warns: COVERAGE.warns,
          }}
        />
        <div id="main-content" tabIndex={-1}>
          {children}
        </div>
        {/* v9 takeover footer (spec §1, build piece 1 2026-07-20): Documentation ·
            Legacy activation · GitHub. Real-product voice (owner directive
            2026-07-20): the quiet prototype line is retired from the chrome — the
            honesty statement lives on /docs ("What is real, and what is
            invented"), linked here; the bright line (no false realness claims,
            C10) is unchanged. Exactly ONE <footer> (legacy.spec asserts it); the
            build-provenance + credit lines are kept (honest + professional). */}
        <footer className="site-footer">
          <div className="site-footer-in">
            <div className="site-footer-lead">
              <Link href="/" className="site-footer-word">
                {PLATFORM_NAME}
              </Link>
              <p className="site-footer-tagline">
                Independent verification for marketplace feeds.
              </p>
            </div>
            <nav className="site-footer-nav" aria-label="Footer">
              <Link href="/docs">Documentation</Link>
              <Link href="/legacy/console">Legacy activation</Link>
              <a href="https://github.com/sharanlabs/curbside-commons" rel="noopener">
                GitHub
              </a>
            </nav>
            <div className="site-footer-meta">
              <span className="site-footer-credit">
                Built and directed by{" "}
                <a href="https://github.com/sharanlabs" rel="author">
                  Sharan Kumar
                </a>
                .
              </span>
              {/* E1a honest build-provenance line (injected by next.config.ts). */}
              <span className="site-footer-build">{BUILD_INFO.label}.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
