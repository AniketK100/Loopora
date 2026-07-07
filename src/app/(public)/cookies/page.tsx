/**
 * Cookie Policy Page — Public Route
 *
 * Explains cookie utilization for session and preferences.
 *
 * @route /cookies
 */

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata = {
  title: "Cookie Policy",
  description: "Learn how and why Loopora uses cookies.",
};

export default function CookiesPage() {
  return (
    <div className="paper-grain min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="text-sm font-[family-name:var(--font-heading)] font-bold text-[var(--color-fg-muted)]">
          <Link href="/" className="hover:underline">
            &larr; Home
          </Link>
        </div>

        {/* Binder Page Content */}
        <Card decoration="tape" className="p-8 space-y-6">
          <h1
            className="text-4xl font-bold text-[var(--color-fg)] border-b border-[var(--color-border-light)] pb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            🍪 Cookie Policy
          </h1>

          <div className="space-y-4 font-[family-name:var(--font-body)] text-base text-[var(--color-fg)] leading-relaxed">
            <p>
              Last Updated: July 2026
            </p>
            <p>
              Loopora uses cookies to ensure our site works reliably and securely. By using our website, you agree that we can place these types of cookies on your device.
            </p>

            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] pt-4 text-[var(--color-fg)]">
              1. What are Cookies?
            </h2>
            <p>
              Cookies are small text files placed on your device to store data that can be recalled by a web server in the domain that placed the cookie. We use cookies to remember your preferences and settings, assist with signing in, and analyze site operations.
            </p>

            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] pt-4 text-[var(--color-fg)]">
              2. How We Use Cookies
            </h2>
            <p>
              We use cookies for several purposes, depending on the context:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Session Authentication (Strictly Necessary):</strong> NextAuth uses encrypted JWT cookies to keep you logged in securely while you browse folders and detailed question pages.</li>
              <li><strong>Security (Strictly Necessary):</strong> CSRF tokens and rate-limiting flags use cookies to prevent malicious bots and spam requests.</li>
              <li><strong>User Preferences:</strong> Storing consent choices (like hiding the cookie banner once accepted).</li>
            </ul>

            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] pt-4 text-[var(--color-fg)]">
              3. Managing Cookies
            </h2>
            <p>
              Most web browsers automatically accept cookies but provide controls that allow you to block or delete them. If you choose to block cookies, please note that you will be unable to log in, register, or access any premium subscription features.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
