/**
 * Design System Preview Page
 *
 * Internal route that renders every base component in every state.
 * Used for visual QA and to catch drift from the design system doc.
 *
 * This route is NOT included in the sitemap or public navigation.
 * Re-run this page after building any new component (per build order §Working Notes).
 *
 * @route /design-system
 * @see 06_Implementation_Plan_Build_Order.md Phase 1 — Acceptance Criteria
 */

import { Metadata } from "next";
import { DesignSystemShowcase } from "./DesignSystemShowcase";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  return (
    <main className="paper-grain min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            ✏️ InterviewLoop Design System
          </h1>
          <p
            className="text-lg"
            style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-fg-muted)",
            }}
          >
            Internal preview — every component in every state. Not public.
          </p>
        </div>

        <DesignSystemShowcase />
      </div>
    </main>
  );
}
