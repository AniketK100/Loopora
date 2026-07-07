/**
 * Privacy Policy Page — Public Route
 *
 * Renders the privacy terms inside on-brand layout cards.
 *
 * @route /privacy
 */

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata = {
  title: "Privacy Policy",
  description: "Learn how Loopora handles and protects your personal data.",
};

export default function PrivacyPage() {
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
            🔒 Privacy Policy
          </h1>

          <div className="space-y-4 font-[family-name:var(--font-body)] text-base text-[var(--color-fg)] leading-relaxed">
            <p>
              Last Updated: July 2026
            </p>
            <p>
              Welcome to Loopora (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
            </p>

            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] pt-4 text-[var(--color-fg)]">
              1. Information We Collect
            </h2>
            <p>
              We collect personal information that you voluntarily provide to us when you register on our website, express an interest in obtaining information about us or our products, or when you contact us. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Credentials:</strong> Display name, email address, password hashes (securely encrypted), and role.</li>
              <li><strong>OAuth Profiles:</strong> Google login identifiers (if authenticated via OAuth).</li>
              <li><strong>Feedback &amp; Suggestions:</strong> Any questions, categories, or notes you submit to us via our feedback forms.</li>
            </ul>

            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] pt-4 text-[var(--color-fg)]">
              2. How We Use Your Information
            </h2>
            <p>
              We use personal information collected via our website for a variety of business purposes, including to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facilitate account creation and logon processes.</li>
              <li>Deliver premium question and video switcher services to authorized accounts.</li>
              <li>Protect our services from spam and unauthorized access using rate limiting and RBAC.</li>
              <li>Improve our application functionality based on search queries and user suggestions.</li>
            </ul>

            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] pt-4 text-[var(--color-fg)]">
              3. Sharing Your Information
            </h2>
            <p>
              We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. Your credentials are never shared or sold to third-party advertisers.
            </p>

            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] pt-4 text-[var(--color-fg)]">
              4. Security of Your Information
            </h2>
            <p>
              We use administrative, technical, and physical security measures (including secure password hashing via bcrypt, Content Security Policy headers, and strict database access limits) to protect your personal information. However, please remember that no transmission over the internet can be guaranteed 100% secure.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
