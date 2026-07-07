/**
 * Admin Audit Logs Page — Server Component
 *
 * Pulls administrative log documents from MongoDB populated with actor names/emails,
 * serializes timestamps, and renders the AuditLogsManager timeline console.
 *
 * @route /admin/audit-logs
 */

import { Metadata } from "next";
import { connectDB } from "@/lib/db/connection";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { AuditLogsManager } from "./AuditLogsManager";

export const metadata: Metadata = {
  title: "System Audit Logs & Timelines — Admin",
};

export default async function AdminAuditLogsPage() {
  await connectDB();

  // Fetch the latest 100 audit logs populated with actor details
  const logsRaw = await AuditLog.find()
    .populate("actor", "name email")
    .sort({ createdAt: -1 })
    .limit(100);

  // Map to plain objects for hydration
  const logs = logsRaw.map((log) => {
    const actorDoc = log.actor as unknown as { name?: string; email?: string } | null;
    return {
      _id: log._id.toString(),
      actor: actorDoc
        ? {
            name: actorDoc.name || "System",
            email: actorDoc.email || "",
          }
        : null,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId ? log.entityId.toString() : "N/A",
      diff: log.diff || null,
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
          📜 Administrative Audit Logs
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Track historical modifications, config changes, and impersonation triggers chronologically.
        </p>
      </div>

      {/* Timeline with Interactive filters */}
      <AuditLogsManager initialLogs={logs} />
    </div>
  );
}
