import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "ActivationOps AI",
  description:
    "Merchant activation for a local-commerce delivery marketplace — deterministic triage, eval-gated bounded AI outreach, human approval, audit. Simulated data; company-agnostic prototype.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
