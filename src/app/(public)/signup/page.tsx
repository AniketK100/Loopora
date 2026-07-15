/**
 * Signup Page — Server Component
 *
 * Renders the registration form. Redirects authenticated users
 * immediately to the home page to prevent redundant signup attempts.
 *
 * @route /signup
 * @see 03_App_Flow.md §1 — Site Map (public)
 */

import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create an account on Loopora to track your interview prep progress.",
};

export default async function SignupPage() {
  // If the user already has a session, redirect to prevent signup form presentation
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

      {/* Signup Card */}
      <SignupForm />
    </main>
  );
}
