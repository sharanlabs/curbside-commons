"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORM_NAME } from "@/lib/product";
import { ThemeToggle } from "@/components/ThemeToggle";

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

export function Nav() {
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
                {/* The deep end of the mark goes through a token because it is
                    the ONE stop that does not survive a dark ground: #2438d6 on
                    #0e1016 is 2.36:1, so the left half of both arcs and the
                    upper dot would have gone near-invisible on every route. The
                    azure and amber stops (5.82:1 / 10.40:1) read on either
                    ground and stay literal. */}
                <stop stopColor="var(--brand-deep)" />
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
            <circle cx="20.8" cy="7.2" r="1.7" fill="var(--brand-deep)" />
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


        {/* Scheme control (owner word 2026-08-02): the one piece of chrome
            that is about the VIEWER rather than the product, at the far edge.
            The route readout that used to sit here was removed by owner word
            2026-08-02 ("It should be a proper production website") — a
            production site does not caption itself in its own header. */}
        <ThemeToggle />
      </div>
    </header>
  );
}
