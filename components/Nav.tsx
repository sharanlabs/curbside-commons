"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORM_NAME } from "@/lib/product";

/**
 * Site nav — brand lockup (the ONE blue→gold mark, D6 ruling) + named
 * destinations + a readout that describes the page you are on.
 *
 * DE-NUMBERED 2026-07-28 (owner: *"the website looks like a display piece with
 * numbers"*). The chapter numerals `01`–`04` and the standing `CASE 001`
 * readout were the loudest carriers of that read: numbered chapters tell a
 * visitor this is a document to be read in order, and a case number that never
 * changes is somebody else's case, pinned to the wall. Destinations are now
 * named for what they are, and the readout states something TRUE OF THE ROUTE
 * — on the tool, the promise that matters (it runs locally and uploads
 * nothing); elsewhere, what that page holds.
 *
 * D6 lamp voice survives: gold = held status · ember = the FAIL verdict ·
 * graphite = neutral chrome. Blue is never a lamp.
 *
 * Readout FIGURES arrive as props from the server layout (derived in
 * lib/landing/specimen.ts from the engine's own report — never hand-typed).
 * Desktop-only bar (owner word 2026-07-15).
 */

export type NavReadoutFigures = {
  findingsTotal: number;
  errors: number;
  warns: number;
};

/**
 * `match` exists because a destination's ROUTE and its LINK TARGET came apart
 * (owner, 2026-07-31): "Audit" navigates to `/#audit` — the instrument itself —
 * while the route it represents is still `/`. Everything that asks "are we
 * there?" (aria-current, the emphasized-action styling) must key off `match`,
 * never off `href`; `usePathname()` never returns a hash, so keying off `href`
 * would silently switch aria-current off forever.
 */
const DESTINATIONS: ReadonlyArray<{ label: string; href: string; match?: string }> = [
  { label: "Audit", href: "/#audit", match: "/" },
  { label: "Report", href: "/report" },
  { label: "Fee rules", href: "/fees" },
  { label: "How it works", href: "/playground" },
  { label: "Proof", href: "/proof" },
];

type Readout = { lamp: "gold" | "ember" | "graphite"; parts: Array<string | { b: string }> };

function readoutFor(pathname: string, f: NavReadoutFigures): Readout {
  if (pathname.startsWith("/report")) {
    return {
      lamp: "ember",
      parts: [{ b: "AUDIT REPORT" }, ` · FAIL · ${f.errors} ERR · ${f.warns} WARN`],
    };
  }
  if (pathname.startsWith("/fees")) {
    return { lamp: "graphite", parts: [{ b: "FEE RULES" }, " · NEW YORK CITY"] };
  }
  if (pathname.startsWith("/playground")) {
    return { lamp: "graphite", parts: [{ b: "HOW IT WORKS" }, " · RUNS IN YOUR BROWSER"] };
  }
  if (
    pathname.startsWith("/proof") ||
    pathname.startsWith("/eval") ||
    pathname.startsWith("/metrics") ||
    pathname.startsWith("/cost")
  ) {
    return { lamp: "graphite", parts: [{ b: "PROOF" }, " · EVERY SCORE, MISSES KEPT IN"] };
  }
  if (pathname.startsWith("/legacy")) {
    return { lamp: "graphite", parts: [{ b: "ARCHIVE" }, " · LEGACY MODULE"] };
  }
  if (pathname.startsWith("/docs")) {
    return { lamp: "graphite", parts: [{ b: "REFERENCE" }, " · WHAT IS REAL, WHAT IS INVENTED"] };
  }
  // The tool. The readout states the promise a visitor most needs to believe
  // before dropping a file in — and it is the one the import-graph guard and a
  // live zero-off-origin-request check both back.
  return {
    lamp: "gold",
    parts: [{ b: "RUNS IN YOUR BROWSER" }, " · NOTHING IS UPLOADED"],
  };
}

export function Nav({ figures }: { figures: NavReadoutFigures }) {
  const pathname = usePathname();

  // White at the top, glass once scrolled (v8→v9 continuity; the no-JS/SSR
  // default is the solid-white state — progressive enhancement only).
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setScrolled(window.scrollY > 18);
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  const readout = readoutFor(pathname, figures);

  return (
    <header className={`site-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="site-nav-in">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className="site-brand"
        >
          {/* v8/v9 brand mark (unchanged geometry): two open C-arcs on the
              ultramarine→azure→amber gradient with terminal registration dots.
              Static (no self-draw) — reduced-motion / no-JS render identically. */}
          <svg
            className="site-brand-mark"
            viewBox="0 0 38 32"
            fill="none"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="cc-brand-grad"
                x1="4"
                y1="4"
                x2="36"
                y2="28"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2438d6" />
                <stop offset="0.55" stopColor="#1f8fff" />
                <stop offset="1" stopColor="#ffb020" />
              </linearGradient>
            </defs>
            <path
              d="M20.8 7.2 A10.4 10.4 0 1 0 20.8 24.8"
              stroke="url(#cc-brand-grad)"
              strokeWidth="2.6"
            />
            <path
              d="M32.6 10.4 A8 8 0 1 0 32.6 21.6"
              stroke="url(#cc-brand-grad)"
              strokeWidth="2.6"
              opacity="0.75"
            />
            <circle cx="20.8" cy="7.2" r="1.7" fill="#2438d6" />
            <circle cx="32.6" cy="21.6" r="1.7" fill="#ffb020" />
          </svg>
          <span className="site-brand-word">{PLATFORM_NAME}</span>
        </Link>

        <nav className="site-nav-links" aria-label="Sections">
          {DESTINATIONS.map((d) => {
            // Route match, NOT link target — see the DESTINATIONS note.
            // "/" would prefix-match every route, so home is exact-only.
            const route = d.match ?? d.href;
            const active =
              route === "/"
                ? pathname === "/"
                : pathname === route || pathname.startsWith(`${route}/`);
            // N-1 (design direction S4, 2026-07-31): the bar carries ONE
            // emphasized action — the product's own verb, "Audit". The other
            // four destinations stay quiet links; the 2026 nav-as-funnel
            // pattern and the devtool-landing research both put a single
            // unmistakable action in the bar.
            //
            // RETARGETED 2026-07-31 (owner word, session 42): it used to point
            // at "/", so on the landing page the site's most dominant control
            // navigated nowhere. It now points at `/#audit` — the instrument —
            // which is a real action from every route including this one. The
            // brand lockup above still carries plain "home". This DOES move the
            // destination and it DOES change an e2e-pinned selector
            // (`canonical.spec.ts` aria-current contract); both moved with it.
            const action = route === "/";
            return (
              <Link
                key={d.href}
                href={d.href}
                aria-current={active ? "page" : undefined}
                className={`site-navlink${action ? " nav-action" : ""}`}
              >
                {d.label}
              </Link>
            );
          })}
        </nav>

        <p className="nav-case" aria-label="Case status">
          <span
            className={`lamp${readout.lamp === "gold" ? "" : ` ${readout.lamp}`}`}
            aria-hidden="true"
          />
          {/* Keyed by pathname so the readout re-enters on route change
              (CSS animation, motion-safe only). */}
          <span key={pathname} className="nav-case-text">
            {readout.parts.map((p, i) => (typeof p === "string" ? p : <b key={i}>{p.b}</b>))}
          </span>
        </p>
      </div>
    </header>
  );
}
