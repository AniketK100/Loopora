/**
 * Admin Security Center Page — Server Component
 *
 * Pulls security counters (IP blocks, active sessions) and aggregates recent
 * security audit timelines (impersonations, deletions, updates) populated with actor details.
 *
 * @route /admin/security
 */

import { Metadata } from "next";
import { connectDB } from "@/lib/db/connection";
import { RateLimit } from "@/lib/db/models/RateLimit";
import { Session } from "@/lib/db/models/Session";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { SecurityDashboard } from "./SecurityDashboard";

export const metadata: Metadata = {
  title: "Security Center Console — Admin",
};

export default async function AdminSecurityPage() {
  await connectDB();

  // 1. Fetch count of active rate limit blocks (where hits are high, e.g. >= 45)
  const rateLimitBlocksCount = await RateLimit.countDocuments({ hits: { $gte: 45 } });

  // 2. Fetch count of active session tracks in database
  const activeSessionsCount = await Session.countDocuments();

  // 3. Check Sentry status
  const sentryActive = !!process.env.SENTRY_DSN;

  // 4. Fetch recent security logs (impersonations, profile changes, content deletion)
  const logsRaw = await AuditLog.find({
    $or: [
      { action: { $in: ["delete", "impersonate", "impersonate_end"] } },
      { entityType: { $in: ["User", "Session"] } },
    ],
  })
    .populate("actor", "name email")
    .sort({ createdAt: -1 })
    .limit(30);

  // Serialize logs for the client
  const logs = logsRaw.map((log) => {
    const actorDoc = log.actor as unknown as { name?: string; email?: string } | null;
    return {
      id: log._id.toString(),
      actor: actorDoc
        ? {
            name: actorDoc.name || "Unknown Admin",
            email: actorDoc.email || "",
          }
        : null,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId.toString(),
      reason: log.reason || null,
      createdAt: log.createdAt.toISOString(),
    };
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          🛡️ Security Center & Diagnostics
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Review active IP rate limit blocks, trace diagnostic session hijacking, and inspect system audit timelines.
        </p>
      </div>

      <SecurityDashboard
        initialLogs={logs}
        rateLimitBlocksCount={rateLimitBlocksCount}
        activeSessionsCount={activeSessionsCount}
        sentryActive={sentryActive}
      />
    </div>
  );
}
