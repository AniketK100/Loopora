/**
 * Footer Component — Public Site Footer
 *
 * Compact, responsive, on-brand footer containing primary navigation,
 * legal links, GitHub, the developer credit, version and copyright.
 *
 * @module components/Footer
 */

import React from "react";
import Link from "next/link";
import pkg from "../../package.json";

const GITHUB_URL = "https://github.com/AniketK100/Loopora";
const DEVELOPER_URL = "https://github.com/AniketK100";

export function Footer() {
  const year = new Date().getFullYear();

  const navLinks = [
    { href: "/interview", label: "Library" },
    { href: "/search", label: "Search" },
    { href: "/suggest", label: "Suggest Q&A" },
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/cookies", label: "Cookies" },
  ];

  return (
    <footer className="border-t-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] text-[var(--color-fg-muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
        {/* Top row: brand + nav */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="font-bold font-[family-name:var(--font-heading)] text-lg text-[var(--color-fg)]">
            Loopora
          </p>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-[family-name:var(--font-heading)] font-bold"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
            >
              GitHub
            </a>
          </nav>
        </div>

        {/* Bottom row: copyright + developer + version */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs border-t border-[var(--color-border-light)] pt-4">
          <p>
            &copy; {year} Loopora. Built by{" "}
            <a
              href={DEVELOPER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--color-accent)]"
            >
              Aniket Kakad
            </a>
            .
          </p>
          <p className="font-[family-name:var(--font-body)]">
            v{pkg.version}
          </p>
        </div>
      </div>
    </footer>
  );
}
