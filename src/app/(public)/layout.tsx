/**
 * Public Layout Component — Server Component
 *
 * Outlines the shared header (brand navigation, dynamic login profiles)
 * and footer for all candidate-facing public routes.
 *
 * @module app/(public)/layout
 * @see 03_App_Flow.md §1 — Site Map (public flow)
 */

import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { PublicSignOutButton } from "./PublicSignOutButton";
import { CookieConsent } from "@/components/ui";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      {/* Public Nav Header */}
      <header className="border-b-2 border-[var(--color-border)] bg-[var(--color-bg)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-2xl font-bold hover:rotate-2 transition-transform cursor-pointer"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-fg)" }}
            >
              ✏️ Loopora
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 font-[family-name:var(--font-heading)] font-bold text-lg">
            <Link href="/interview" className="text-[var(--color-fg)] hover:text-[var(--color-accent)] transition-colors">
              📖 Library
            </Link>
            <Link href="/search" className="text-[var(--color-fg)] hover:text-[var(--color-accent)] transition-colors">
              🔍 Search
            </Link>
            <Link href="/suggest" className="text-[var(--color-fg)] hover:text-[var(--color-accent)] transition-colors">
              💡 Suggest Q&A
            </Link>
          </nav>

          {/* Profile Area */}
          <div className="flex items-center gap-4 font-[family-name:var(--font-heading)] font-bold">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="text-sm text-[var(--color-fg-muted)] hover:text-[var(--color-accent)] transition-colors font-[family-name:var(--font-body)] hidden sm:inline"
                >
                  Hi, {user.name}
                </Link>
                
                {/* Admin/Editor redirect link */}
                {(user.role === "admin" || user.role === "editor") && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 text-sm bg-[var(--color-accent)] text-[var(--color-bg)] wobbly-sm border-2 border-[var(--color-border)] hover:translate-y-[-1px] transition-transform"
                  >
                    🛠️ Admin
                  </Link>
                )}

                <PublicSignOutButton />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-sm border-2 border-[var(--color-border)] wobbly-sm hover:bg-[var(--color-bg-alt)] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 text-sm bg-[var(--color-secondary)] text-[var(--color-bg)] wobbly-sm border-2 border-[var(--color-border)] hover:translate-y-[-1px] transition-transform"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Pages Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Shared Footer */}
      <footer className="border-t-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] py-8 mt-12 text-center text-sm font-[family-name:var(--font-body)] text-[var(--color-fg-muted)]">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <p className="font-bold font-[family-name:var(--font-heading)] text-lg text-[var(--color-fg)]">
            ✏️ Loopora — The Hand-Drawn Notebook for Interview Success.
          </p>
          <div className="flex justify-center gap-6 text-xs">
            <Link href="/interview" className="hover:underline">Interview Library</Link>
            <Link href="/suggest" className="hover:underline">Submit Feedback</Link>
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/cookies" className="hover:underline">Cookie Policy</Link>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()} Loopora. Made with love for devs.</p>
        </div>
      </footer>
      <CookieConsent />
    </div>
  );
}
