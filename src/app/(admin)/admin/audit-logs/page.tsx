/**
 * Admin Audit Logs Page — Server Component
 *
 * Renders a read-only list of administrative system audit events.
 * Displays actor (user), action performed, target resource details, and timestamp.
 *
 * @route /admin/audit-logs
 * @see 05_Backend_Schema_Data_Auth.md §2 — Mongoose Schemas (AuditLog)
 */

import { Metadata } from "next";
import { connectDB } from "@/lib/db/connection";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { Card, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Administrative Audit Logs — Admin",
};

interface ActorPopulated {
  name: string;
  email: string;
}

export default async function AdminAuditLogsPage() {
  await connectDB();

  // Fetch the latest 50 audit logs populated with actor info
  const logs = await AuditLog.find()
    .populate("actor", "name email")
    .sort({ createdAt: -1 })
    .limit(50);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          🛡️ Administrative Audit Logs
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Read-only history of the latest 50 administrative actions performed on categories, questions, and configs.
        </p>
      </div>

      {/* Audit Logs Table */}
      <Card decoration="none">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-[family-name:var(--font-body)]">
            <thead>
              <tr className="border-b-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] text-sm font-bold font-[family-name:var(--font-heading)]">
                <th className="p-4 w-48">Timestamp</th>
                <th className="p-4 w-52">Actor (Admin Email)</th>
                <th className="p-4 w-32">Action</th>
                <th className="p-4 w-36">Collection</th>
                <th className="p-4">Target / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[var(--color-border-light)] text-base">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                    No audit logs recorded yet. Administrative events appear here as actions occur.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const actor = log.actor as unknown as ActorPopulated;
                  return (
                    <tr key={log._id.toString()} className="hover:bg-[var(--color-bg-alt)]/50 transition-colors">
                      <td className="p-4 text-xs font-mono text-[var(--color-fg-muted)]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-sm text-[var(--color-fg)] truncate max-w-[200px]">
                        {actor?.email || "System/Unknown"}
                      </td>
                      <td className="p-4">
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono text-xs text-[var(--color-fg-muted)]">
                        {log.entityType}
                      </td>
                      <td className="p-4 text-sm text-[var(--color-fg-muted)]">
                        <div className="max-w-md truncate">
                          <span className="font-bold text-[var(--color-fg)] block text-xs font-mono truncate">
                            ID: {log.entityId ? log.entityId.toString() : "N/A"}
                          </span>
                          {log.diff ? (
                            <span className="text-xs text-[var(--color-fg-muted)] mt-1 block truncate">
                              {JSON.stringify(log.diff)}
                            </span>
                          ) : (
                            <span className="text-xs italic text-gray-400">No changes payload</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/**
 * Maps audit actions to Badge variants
 */
function getActionBadgeVariant(action: string) {
  switch (action?.toLowerCase()) {
    case "create":
      return "success";
    case "update":
    case "patch":
    case "publish":
      return "warning";
    case "delete":
    case "unpublish":
      return "difficulty-hard" as "difficulty-easy" | "difficulty-medium" | "difficulty-hard";
    default:
      return "default";
  }
}
