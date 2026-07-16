"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORM_NAME } from "@/lib/product";

// S5 canonical nav (owner-ratified /legacy/ split): truth-engine surfaces only,
// plus ONE secondary link into the preserved legacy activation module.
const LINKS = [
  { href: "/report", label: "Report" },
  { href: "/demo", label: "Demo" },
  { href: "/playground", label: "Playground" },
  { href: "/eval", label: "Eval evidence" },
  { href: "/metrics", label: "Measurables" },
  { href: "/cost", label: "Cost" },
];

const LEGACY_LINK = { href: "/legacy/console", label: "Legacy activation" };

export function Nav() {
  const pathname = usePathname();
  // Mobile menu (<900px): a hamburger toggles the link cluster so the nav never
  // wraps to multiple rows on phones. On desktop the menu is always shown inline
  // (CSS), so this state only governs the collapsed mobile panel.
  const [open, setOpen] = useState(false);

  // Collapse the mobile menu whenever the route changes (covers browser back/
  // forward too). React's "reset state during render on prop change" pattern —
  // synchronous, no effect, no intermediate paint.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // Storyboard header (adoption 2026-07-15): pure white at the top of the page,
  // glass once scrolled. rAF-throttled passive listener toggles one class; the
  // no-JS/SSR default is the solid-white state (progressive enhancement only).
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
    <nav aria-label="Primary" className={`site-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="site-nav-in">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className="site-brand"
        >
          {/* Storyboard brand mark (adoption 2026-07-15): the open C-mark on the
              ink→cyan→iris gradient — the same family the hero title phrase
              clips — with an iris registration bar closing the counter. Static
              (no self-draw), so reduced-motion / no-JS render identically. */}
          <svg
            className="site-brand-mark"
            viewBox="0 0 32 32"
            fill="none"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="cc-brand-grad"
                x1="4"
                y1="28"
                x2="28"
                y2="4"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#17151b" />
                <stop offset="0.5" stopColor="#43a7ce" />
                <stop offset="1" stopColor="#705de7" />
              </linearGradient>
            </defs>
            <path
              d="M23.5 9.5A9.6 9.6 0 1 0 23.5 22.5"
              stroke="url(#cc-brand-grad)"
              strokeWidth="2.6"
            />
            <path d="M20 16h7" stroke="#5746c5" strokeWidth="2.2" />
          </svg>
          <span className="site-brand-word">{PLATFORM_NAME}</span>
        </Link>

        {/* Mobile menu toggle — hidden on desktop (the menu is inline), shown
            <900px so the links collapse into a dropdown instead of wrapping. */}
        <button
          type="button"
          className="site-nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>

        <div id="site-nav-menu" className={`site-nav-menu${open ? " open" : ""}`}>
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className="site-navlink"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
          <Link
            href={LEGACY_LINK.href}
            aria-current={pathname.startsWith("/legacy") ? "page" : undefined}
            className="site-navlink site-navlink-legacy"
            onClick={() => setOpen(false)}
          >
            {LEGACY_LINK.label}
          </Link>
        </div>
      </div>
    </nav>
  );
}
