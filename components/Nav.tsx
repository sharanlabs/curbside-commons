"use client";

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
  return (
    <nav aria-label="Primary" className="site-nav">
      <div className="site-nav-in">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className="site-brand"
        >
          {/* B-2 self-drawing monoline mark: verifier shield + check over a
              meridian baseline. Fully drawn by default (reduced-motion / no-JS);
              self-draws once on load under allowed motion (pure CSS, gated). */}
          <svg
            className="site-brand-mark"
            viewBox="0 0 32 32"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path
              className="lm-base"
              d="M2 26 C 8 22.5, 14 27.5, 20 24.5 S 28 21, 30 22.5"
              pathLength="1"
            />
            <path
              className="lm-draw"
              d="M16 4 L25 7.2 V15 C25 20.6 21 24.2 16 26 C11 24.2 7 20.6 7 15 V7.2 Z"
              pathLength="1"
            />
            <path className="lm-draw lm-d2" d="M12 15.5 L15 18.5 L21 11.5" pathLength="1" />
          </svg>
          <span className="site-brand-word">
            {PLATFORM_NAME}
            <span className="site-brand-dot" aria-hidden="true">
              .
            </span>
          </span>
        </Link>
        {LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className="site-navlink"
            >
              {l.label}
            </Link>
          );
        })}
        <Link
          href={LEGACY_LINK.href}
          aria-current={pathname.startsWith("/legacy") ? "page" : undefined}
          className="site-navlink site-navlink-legacy"
        >
          {LEGACY_LINK.label}
        </Link>
        <span className="site-status">
          <span className="site-status-pip" aria-hidden="true" />
          Prototype · REPLAY · $0.00
        </span>
      </div>
    </nav>
  );
}
