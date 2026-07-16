import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * /legacy/** route-group (plan v3.3 E1a — the skeleton the S5 identity slice
 * moves console/audit/merchant into; owner-ratified /legacy/ split, decision-log
 * 2026-07-10). Every legacy surface renders under the provenance banner below.
 *
 * Deliberately NOT a <footer>: the root layout's footer is the site's ONLY
 * footer element (the S2 semantic disclosure contract binds to it, and the
 * C10 suite asserts exactly one footer block).
 */
export const metadata: Metadata = {
  title: {
    template: "%s · Legacy · Curbside Commons",
    default: "Legacy activation module · Curbside Commons",
  },
  description:
    "The project's first product — a merchant onboarding & activation demonstration — preserved as working lineage under /legacy/. Illustrative data, fictional merchants, preview only.",
};

import Link from "next/link";

/** RV1 (owner review pick 2026-07-11): the split removed the legacy surfaces from
 *  the canonical nav — this strip restores movement WITHIN the module. Static
 *  links (server component); the canonical nav stays truth-engine-only. */
const LEGACY_LINKS = [
  { href: "/legacy/console", label: "Console" },
  { href: "/legacy/eval", label: "Eval / Quality" },
  { href: "/legacy/metrics", label: "Metrics" },
  { href: "/legacy/audit", label: "Audit" },
  { href: "/legacy/cost", label: "Cost" },
] as const;

export default function LegacyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="legacy-scope">
      <div className="ds-wrap">
        <div className="ds-note warn legacy-banner" role="note">
          <b>Legacy activation module</b> — the project&rsquo;s first product (a merchant
          onboarding &amp; activation demonstration), preserved as working lineage. Illustrative
          data, fictional merchants, preview only. The canonical product is the{" "}
          commerce-truth verifier (see the report and demo surfaces).
        </div>
        <nav aria-label="Legacy module" className="legacy-subnav">
          {LEGACY_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="site-navlink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
