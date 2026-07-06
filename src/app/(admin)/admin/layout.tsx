/**
 * Admin Layout Component — Server Component
 *
 * Provides the main dashboard shell including the sidebar navigation panel,
 * brand header, user profile panel, and a logout button.
 *
 * Matched under /admin/* routes, guarded by NextAuth middleware.
 *
 * @module app/(admin)/admin/layout
 * @see 03_App_Flow.md §5 — Admin Content Flow
 */

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignOutButton } from "./SignOutButton";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await auth();

  // Guard routing fallback (middleware intercepts, this is secondary safety)
  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="paper-grain min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b-2 md:border-b-0 md:border-r-2 border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col z-10">
        {/* Brand Header */}
        <div className="p-6 border-b-2 border-dashed border-[var(--color-border-light)] flex items-center justify-between">
          <Link href="/">
            <h1
              className="text-2xl font-bold hover:rotate-1 transition-transform"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-fg)" }}
            >
              ✏️ Loopora Admin
            </h1>
          </Link>
          <span className="md:hidden">
            {/* Optional mobile toggle placeholder */}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 font-[family-name:var(--font-heading)] font-bold text-lg">
          <NavLink href="/admin">📊 Dashboard</NavLink>
          <NavLink href="/admin/categories">📁 Categories</NavLink>
          <NavLink href="/admin/questions">📝 Questions</NavLink>
          <NavLink href="/admin/flags">🚩 Feature Flags</NavLink>
          <NavLink href="/admin/suggestions">💡 Suggestions</NavLink>
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t-2 border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-alt)]">
          <div className="flex flex-col gap-2 font-[family-name:var(--font-body)] text-base">
            <div>
              <p className="font-bold text-[var(--color-fg)] truncate">{user.name}</p>
              <p className="text-xs text-[var(--color-fg-muted)] truncate">{user.email}</p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wide bg-[var(--color-accent)] text-[var(--color-bg)] wobbly-sm border border-[var(--color-border)]">
                {user.role}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * Sidebar Navigation Link Component
 */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={[
        "block px-4 py-2.5 wobbly-sm border-2 border-transparent",
        "hover:bg-[var(--color-bg-alt)] hover:border-[var(--color-border-light)]",
        "transition-all duration-[var(--transition-fast)]",
        "text-[var(--color-fg)] hover:translate-x-[2px]",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
