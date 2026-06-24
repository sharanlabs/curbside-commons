"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/console", label: "Console" },
  { href: "/eval", label: "Eval / Quality" },
  { href: "/metrics", label: "Metrics" },
  { href: "/audit", label: "Audit" },
  { href: "/cost", label: "Cost" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Primary" className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-6 py-2.5 text-sm">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className="mr-3 font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          ActivationOps AI
        </Link>
        {LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`rounded-md px-2.5 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                active ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
        <span className="ml-auto rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
          Prototype · REPLAY · $0.00
        </span>
      </div>
    </nav>
  );
}
