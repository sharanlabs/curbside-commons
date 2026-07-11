"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PLATFORM_NAME } from "@/lib/product";

// S5 canonical nav (owner-ratified /legacy/ split): truth-engine surfaces only,
// plus ONE secondary link into the preserved legacy activation module.
const LINKS = [
  { href: "/report", label: "Report" },
  { href: "/demo", label: "Demo" },
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
          <svg
            className="site-brand-mark"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 2.2l6.4 2.4v4.2c0 4.2-2.7 6.7-6.4 8.4-3.7-1.7-6.4-4.2-6.4-8.4V4.6z" />
            <path d="M6.8 10.2l2.2 2.2 4.4-4.6" />
          </svg>
          {PLATFORM_NAME}
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
