/**
 * Admin System Health & Rate Limit Dashboard — Server Component
 *
 * Integrates database health, environment check, Sentry configuration flags,
 * and lists active rate limit records dynamically.
 *
 * @route /admin/system
 */

import { Metadata } from "next";
import { connectDB, getConnectionStatus } from "@/lib/db";
import { RateLimit } from "@/lib/db/models/RateLimit";
import { SystemDashboard } from "./SystemDashboard";

export const metadata: Metadata = {
  title: "System Health & Rate Limits — Admin",
};

export default async function AdminSystemPage() {
  await connectDB();

  // 1. Core Health status
  const dbStatus = getConnectionStatus();
  const status = dbStatus === "connected" ? "ok" : "error";

  // Check env configurations
  const envInfo = {
    sentryConfigured: !!process.env.SENTRY_DSN,
    mongoConnected: dbStatus === "connected",
    nextAuthUrl: process.env.NEXTAUTH_URL || "",
  };

  const healthData = {
    status,
    db: dbStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.1.0",
    env: envInfo,
  };

  // 2. Fetch active rate limit traces sorted by activity
  const rateLimitsRaw = await RateLimit.find().sort({ expiresAt: 1 }).limit(100);

  const rateLimits = rateLimitsRaw.map((limit) => ({
    _id: limit._id.toString(),
    ip: limit.ip,
    endpoint: limit.endpoint,
    hits: limit.hits,
    expiresAt: limit.expiresAt.toISOString(),
    updatedAt: limit.updatedAt ? limit.updatedAt.toISOString() : new Date().toISOString(),
  }));

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ⚙️ System Health & Monitor
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Observe database pings, inspect rate limit registries, and review Sentry runtime exception reports.
        </p>
      </div>

      <SystemDashboard healthData={healthData} initialRateLimits={rateLimits} />
    </div>
  );
}
