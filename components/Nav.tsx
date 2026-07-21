"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORM_NAME } from "@/lib/product";

/**
 * Site nav — the v9 takeover header (build piece 1, 2026-07-20; design source
 * `mockups/takeover-v9-home-listings-2026-07-17.html`, ADOPTED; spec §1).
 * Brand lockup (the ONE blue→gold mark, D6 ruling) + four numbered chapters +
 * the case-status readout speaking in the instrument's voice.
 *
 * ONE CONTINUING CASE (owner ruling 2026-07-20): every readout opens CASE 001;
 * chapters are files of that case, never their own case numbers.
 * D6 lamp voice: gold = held status · ember = the FAIL verdict · graphite =
 * neutral chrome. Blue is never a lamp.
 * D3: no parked/sample tooltips — all four chapters are live routes.
 *
 * Readout FIGURES arrive as props from the server layout (derived in
 * lib/landing/specimen.ts from the engine's own report — never hand-typed).
 * The readout words are chrome (the instrument narrating), present tense.
 * Desktop-only bar (owner word 2026-07-15): the four-link chapter row fits the
 * 1280px floor, so the old <900px hamburger is retired with the 8-tab nav.
 */

export type NavReadoutFigures = {
  findingsTotal: number;
  errors: number;
  warns: number;
};

const CHAPTERS = [
  { num: "01", label: "Listings audit", href: "/report" },
  { num: "02", label: "Fee audit", href: "/fees" },
  { num: "03", label: "Try it live", href: "/playground" },
  { num: "04", label: "Proof", href: "/proof" },
] as const;

type Readout = { lamp: "gold" | "ember" | "graphite"; parts: Array<string | { b: string }> };

function readoutFor(pathname: string, f: NavReadoutFigures): Readout {
  if (pathname.startsWith("/report")) {
    return {
      lamp: "ember",
      parts: ["CASE 001 · ", { b: "FILE A" }, ` · FAIL · ${f.errors} ERR · ${f.warns} WARN`],
    };
  }
  if (pathname.startsWith("/fees")) {
    return { lamp: "graphite", parts: ["CASE 001 · ", { b: "FILE B" }, " · FEE AUDIT"] };
  }
  if (pathname.startsWith("/playground")) {
    return { lamp: "graphite", parts: ["CASE 001 · ", { b: "BENCH" }, " · IN YOUR BROWSER"] };
  }
  if (
    pathname.startsWith("/proof") ||
    pathname.startsWith("/eval") ||
    pathname.startsWith("/metrics") ||
    pathname.startsWith("/cost")
  ) {
    return { lamp: "graphite", parts: ["CASE 001 · ", { b: "LOGBOOK" }, " · THE PROOF"] };
  }
  if (pathname.startsWith("/legacy")) {
    return { lamp: "graphite", parts: ["CASE 001 · ", { b: "ARCHIVE" }, " · LEGACY MODULE"] };
  }
  if (pathname.startsWith("/docs")) {
    return { lamp: "graphite", parts: ["CASE 001 · ", { b: "REFERENCE" }, " · THE METHOD"] };
  }
  return {
    lamp: "gold",
    parts: ["CASE 001 · ", { b: "CLAIM HELD" }, ` · ${f.findingsTotal} FINDINGS`],
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

        <nav className="site-nav-links" aria-label="Chapters">
          {CHAPTERS.map((c) => {
            const active = pathname === c.href || pathname.startsWith(`${c.href}/`);
            return (
              <Link
                key={c.href}
                href={c.href}
                aria-current={active ? "page" : undefined}
                className="site-navlink"
              >
                <span className="num">{c.num}</span>
                {c.label}
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
