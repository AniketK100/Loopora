/**
 * Admin Feature Flags Page — Server Component
 *
 * Renders the toggle dashboard for runtime environment settings.
 * Automatically seeds default flags if none exist in the database.
 *
 * @route /admin/flags
 * @see 05_Backend_Schema_Data_Auth.md §2 — Mongoose Schemas (FeatureFlag)
 */

import { Metadata } from "next";
import { connectDB } from "@/lib/db/connection";
import { FeatureFlag } from "@/lib/db/models/FeatureFlag";
import { Card } from "@/components/ui";
import { FlagToggle } from "./FlagToggle";

export const metadata: Metadata = {
  title: "Feature Flags Configuration — Admin",
};

export default async function AdminFeatureFlagsPage() {
  await connectDB();

  // Fetch flags sorted by key
  let flags = await FeatureFlag.find().sort({ key: 1 });

  // Auto-seed default flags if empty to ensure initial developer configuration is smooth
  if (flags.length === 0) {
    const defaultFlags = [
      {
        key: "maintenance-mode",
        enabled: false,
        scope: "global" as const,
        note: "System-wide maintenance mode: restricts general access and displays maintenance banner.",
      },
      {
        key: "beta-star-worked-examples",
        enabled: true,
        scope: "global" as const,
        note: "Beta release of STAR format worked examples on question detailed views.",
      },
      {
        key: "google-oauth-login",
        enabled: false,
        scope: "global" as const,
        note: "Enables Google OAuth fallback authentication option on sign in/up forms.",
      },
    ];

    await FeatureFlag.create(defaultFlags);
    // Refetch
    flags = await FeatureFlag.find().sort({ key: 1 });
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          🚩 Feature Flags & Runtime Configuration
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Toggle system behaviors and launch beta features dynamically without code redeployments.
        </p>
      </div>

      {/* Flags Dashboard List */}
      <Card decoration="none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-[family-name:var(--font-body)]">
            <thead>
              <tr className="border-b-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] text-sm font-bold font-[family-name:var(--font-heading)]">
                <th className="p-4 w-1/3">Config Key</th>
                <th className="p-4 w-28 text-center">Scope</th>
                <th className="p-4">Notes / Purpose</th>
                <th className="p-4 w-28 text-center">Active Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[var(--color-border-light)] text-base">
              {flags.map((flag) => (
                <tr key={flag._id.toString()} className="hover:bg-[var(--color-bg-alt)]/50 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-[var(--color-fg)] font-mono text-sm">
                      {flag.key}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-[var(--color-bg-alt)] text-[var(--color-fg-muted)] wobbly-sm border border-[var(--color-border-light)]">
                      {flag.scope}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                    {flag.note || "No description provided."}
                  </td>
                  <td className="p-4 text-center flex justify-center items-center">
                    <FlagToggle id={flag._id.toString()} initialEnabled={flag.enabled} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
