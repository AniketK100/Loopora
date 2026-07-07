/**
 * Client Circuit Wrapper Component — Client Component
 *
 * Wraps the GSAP Circuit scroll animation section to bypass server-side rendering (SSR),
 * avoiding hydration mismatches and complying with Next.js dynamic import restrictions
 * inside Server Components.
 *
 * @module app/(public)/ClientCircuitWrapper
 */

"use client";

import React from "react";
import dynamic from "next/dynamic";

const CircuitSection = dynamic(() => import("./CircuitSection"), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-[var(--color-bg-alt)] border-y-2 border-[var(--color-border)] py-16 text-center text-sm font-[family-name:var(--font-body)] text-[var(--color-fg-muted)]">
      Loading interactive current flow circuit...
    </div>
  ),
});

export function ClientCircuitWrapper() {
  return <CircuitSection />;
}
