/**
 * MobileNav — Client Component
 *
 * Hamburger menu providing access to primary navigation on small screens
 * where the desktop nav is hidden.
 *
 * @module components/MobileNav
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/interview", label: "Library" },
  { href: "/search", label: "Search" },
  { href: "/suggest", label: "Suggest Q&A" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden relative">
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        onClick={() => setOpen((v) => !v)}
        className="p-2 border-2 border-[var(--color-border)] wobbly-sm bg-[var(--color-bg)] text-[var(--color-fg)] min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {open ? "✕" : "☰"}
        </span>
      </button>

      {open && (
        <nav
          id="mobile-nav-menu"
          aria-label="Mobile"
          className="absolute right-0 mt-2 w-52 z-50 border-2 border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-default)] wobbly-sm p-2 space-y-1 font-[family-name:var(--font-heading)] font-bold"
        >
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={[
                  "block px-3 py-2.5 min-h-[44px] flex items-center rounded transition-colors",
                  active
                    ? "bg-[var(--color-fg)] text-[var(--color-bg)]"
                    : "text-[var(--color-fg)] hover:bg-[var(--color-bg-alt)]",
                ].join(" ")}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
