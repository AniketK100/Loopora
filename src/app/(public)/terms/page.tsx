/**
 * Terms of Service Page — Public Route
 *
 * Renders user agreement guidelines inside wobbly cards.
 *
 * @route /terms
 */

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing the use of Loopora.",
};

export default function TermsPage() {
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
            📋 Terms of Service
          </h1>

          <div className="space-y-4 font-[family-name:var(--font-body)] text-base text-[var(--color-fg)] leading-relaxed">
            <p>
              Last Updated: July 2026
            </p>
            <p>
              By accessing and using Loopora (&quot;the site&quot;, &quot;our services&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the website.
            </p>

            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] pt-4 text-[var(--color-fg)]">
              1. Use of the Site
            </h2>
            <p>
              Loopora provides mock interview questions, explanations, and video embedding structures. You agree to use the site only for your personal, non-commercial education. You may not scrape, download in bulk, or re-publish our seeded database solutions or video contents without prior written consent.
            </p>

            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] pt-4 text-[var(--color-fg)]">
              2. User Accounts
            </h2>
            <p>
              When you create an account, you must provide accurate registration details. You are responsible for keeping your password secure and for all actions taken under your account credentials. We reserve the right to terminate accounts that violate system integrity or abuse rate-limiting rules.
            </p>

            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] pt-4 text-[var(--color-fg)]">
              3. Content &amp; Intellectual Property
            </h2>
            <p>
              The hand-drawn design system, notebook styling rules, code logic, and custom-written solutions are the property of Loopora. Video files and embeds are hosted by their respective owners and served under fair-use or integration guidelines.
            </p>

            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] pt-4 text-[var(--color-fg)]">
              4. Disclaimer of Warranties
            </h2>
            <p>
              Our services are provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no representations or warranties of any kind, express or implied, as to the completeness, accuracy, or reliability of the mock interview questions or video guides.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
