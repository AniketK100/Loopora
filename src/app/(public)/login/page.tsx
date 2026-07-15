/**
 * Login Page — Server Component
 *
 * Renders the credentials login portal. Redirects authenticated users
 * immediately to the home page to prevent redundant login attempts.
 *
 * @route /login
 * @see 03_App_Flow.md §1 — Site Map (public)
 */

import { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Loopora to access high-quality Q&As and track your interview practice.",
};

export default async function LoginPage() {
  // If the user already has a session, redirect to prevent login form presentation
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="paper-grain min-h-screen flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block">
          <h1
            className="text-4xl font-bold hover:rotate-1 transition-transform cursor-pointer"
            style={{ fontFamily: "var(--font-heading)", color: "var(--color-fg)" }}
          >
            ✏️ Loopora
          </h1>
        </Link>
      </div>

      {/* Login Card with query search fallback */}
      <Suspense
        fallback={
          <div className="wobbly-md border-2 bg-[var(--color-bg)] p-8 max-w-md w-full text-center">
            <span className="font-[family-name:var(--font-heading)] font-bold text-lg">
              Opening notebook...
            </span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
