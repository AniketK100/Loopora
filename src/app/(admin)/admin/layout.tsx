/**
 * Admin Layout Component — Server Component
 *
 * Provides the main dashboard shell including a sticky full-height sidebar
 * navigation panel, brand header, user profile footer and a logout button.
 *
 * The sidebar stays pinned on desktop while the content area scrolls
 * independently. On mobile the sidebar collapses into a stacked / horizontally
 * scrollable top navigation while the page scrolls naturally.
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
import { SidebarNavLink } from "./SidebarNavLink";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

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
    <div className="w-full min-h-screen md:h-screen flex flex-col md:overflow-hidden">
      <ImpersonationBanner />
      <div className="paper-grain flex flex-1 min-h-0 flex-col md:flex-row md:overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="flex flex-col bg-[var(--color-bg)] border-b-2 md:border-b-0 md:border-r-2 border-[var(--color-border)] md:w-64 h-auto md:h-full z-10 shrink-0">
          {/* Brand Header */}
          <div className="p-6 border-b-2 border-dashed border-[var(--color-border-light)] flex items-center justify-between shrink-0">
            <Link href="/" aria-label="Loopora home">
              <h1
                className="text-2xl font-bold hover:rotate-1 transition-transform"
                style={{ fontFamily: "var(--font-heading)", color: "var(--color-fg)" }}
              >
                ✏️ Loopora Admin
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav
            aria-label="Admin navigation"
            className="flex-1 p-4 space-y-2 font-[family-name:var(--font-heading)] font-bold text-sm overflow-y-auto md:overflow-x-hidden overflow-x-auto flex md:flex-col gap-2 md:gap-2"
          >
            <SidebarNavLink href="/admin">📊 Dashboard</SidebarNavLink>
            <SidebarNavLink href="/admin/categories">📁 Categories</SidebarNavLink>
            <SidebarNavLink href="/admin/questions">📝 Questions</SidebarNavLink>
            <SidebarNavLink href="/admin/flags">🚩 Feature Flags</SidebarNavLink>
            <SidebarNavLink href="/admin/suggestions">💡 Suggestions</SidebarNavLink>
            <SidebarNavLink href="/admin/users">👥 User Accounts</SidebarNavLink>
            <SidebarNavLink href="/admin/sessions">📱 Active Sessions</SidebarNavLink>
            <SidebarNavLink href="/admin/security">🔒 Security Center</SidebarNavLink>
            <SidebarNavLink href="/admin/system">⚙️ System Health</SidebarNavLink>
            <SidebarNavLink href="/admin/audit-logs">📜 Audit Logs</SidebarNavLink>
            <SidebarNavLink href="/admin/content-export">📥 Content Backup</SidebarNavLink>
            <SidebarNavLink href="/admin/bulk-import">📥 Bulk Import</SidebarNavLink>
          </nav>

          {/* User profile footer (pinned) */}
          <div className="p-4 border-t-2 border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-alt)] shrink-0">
            <div className="flex flex-col gap-2 font-[family-name:var(--font-body)] text-base">
              <div className="min-w-0">
                <p className="font-bold text-[var(--color-fg)] truncate">{user.name}</p>
                <p className="text-xs text-[var(--color-fg-muted)] truncate">{user.email}</p>
              </div>
              <div className="flex items-center justify-between mt-1 gap-2">
                <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wide bg-[var(--color-accent)] text-[var(--color-bg)] wobbly-sm border border-[var(--color-border)] truncate">
                  {user.role}
                </span>
                <SignOutButton />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:h-full md:overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
