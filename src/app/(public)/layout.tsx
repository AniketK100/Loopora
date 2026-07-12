/**
 * Public Layout Component - Server Component
 *
 * Outlines the shared header, route-aware maintenance handling, and shared
 * public footer for non-home public routes.
 *
 * @module app/(public)/layout
 */

import React from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { PublicSignOutButton } from "./PublicSignOutButton";
import { headers } from "next/headers";
import { CookieConsent, UnderMaintenance } from "@/components/ui";
import { isMaintenanceModeActive } from "@/lib/flags";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { PersonalizedAnswersProvider } from "@/contexts/PersonalizedAnswersContext";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const session = await auth();
  let user = session?.user;

  // Re-fetch role from database to ensure latest role is used (JWT may be stale)
  if (user?.id) {
    try {
      await connectDB();
      const dbUser = await User.findById(user.id).select("role isPremium");
      if (dbUser) {
        user = { ...user, role: dbUser.role, isPremium: dbUser.isPremium };
      }
    } catch (error) {
      console.error("[PublicLayout] Failed to refresh user role:", error);
    }
  }

  const isMaint = await isMaintenanceModeActive();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isHomeRoute = pathname === "/" || pathname === "";
  const isAdmin = user?.role === "admin" || user?.role === "editor";

  if (isMaint && !isHomeRoute && !isAuthRoute && !isAdmin) {
    return <UnderMaintenance isLoggedIn={!!user} />;
  }

  return (
    <>
      <ImpersonationBanner />
      <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
        <header className="border-b-2 sticky top-0 z-50 transition-colors duration-300 border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span
                className="text-2xl font-bold hover:rotate-2 transition-transform cursor-pointer"
                style={{ 
                  fontFamily: "var(--font-heading)", 
                  color: "var(--color-fg)" 
                }}
              >
                Loopora
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 font-[family-name:var(--font-heading)] font-bold text-lg">
              <Link 
                href="/interview" 
                className="transition-colors text-[var(--color-fg)] hover:text-[var(--color-accent)]"
              >
                Library
              </Link>
              <Link 
                href="/search" 
                className="transition-colors text-[var(--color-fg)] hover:text-[var(--color-accent)]"
              >
                Search
              </Link>
              <Link 
                href="/suggest" 
                className="transition-colors text-[var(--color-fg)] hover:text-[var(--color-accent)]"
              >
                Suggest Q&A
              </Link>
            </nav>

            <MobileNav />

            <div className="flex items-center gap-4 font-[family-name:var(--font-heading)] font-bold">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="text-sm transition-colors font-[family-name:var(--font-body)] hidden sm:inline text-[var(--color-fg-muted)] hover:text-[var(--color-accent)]"
                  >
                    Hi, {user.name}
                  </Link>

                  {(user.role === "admin" || user.role === "editor") && (
                    <Link
                      href="/admin"
                      className="px-3 py-1.5 text-sm wobbly-sm border-2 hover:translate-y-[-1px] transition-transform bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-border)]"
                    >
                      Admin
                    </Link>
                  )}

                  <PublicSignOutButton />
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-sm border-2 wobbly-sm transition-colors border-[var(--color-border)] hover:bg-[var(--color-bg-alt)]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-1.5 text-sm wobbly-sm border-2 hover:translate-y-[-1px] transition-transform bg-[var(--color-secondary)] text-[var(--color-bg)] border-[var(--color-border)]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1">
          <PersonalizedAnswersProvider>
            {children}
          </PersonalizedAnswersProvider>
        </main>

        <Footer />
        <CookieConsent />
      </div>
    </>
  );
}
