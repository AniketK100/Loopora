/**
 * Admin Sessions Management Page — Server Component
 *
 * Fetches all parallel active user sessions tracking records from MongoDB,
 * populates the User credentials reference, and loads the Client dashboard console.
 *
 * @route /admin/sessions
 */

import { Metadata } from "next";
import { connectDB } from "@/lib/db/connection";
import { Session } from "@/lib/db/models/Session";
import { SessionsDashboard } from "./SessionsDashboard";

export const metadata: Metadata = {
  title: "Active Sessions & Device Management — Admin",
};

export default async function AdminSessionsPage() {
  await connectDB();

  // Retrieve sessions populated with user names/emails
  const sessionsRaw = await Session.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  // Map to serialized format for Client Component hydration
  const sessions = sessionsRaw.map((s) => {
    const userDoc = s.user as unknown as { name?: string; email?: string } | null;
    return {
      _id: s._id.toString(),
      user: userDoc
        ? {
            name: userDoc.name || "Unknown User",
            email: userDoc.email || "",
          }
        : null,
      ip: s.ip,
      userAgent: s.userAgent,
      device: s.device,
      loginMethod: s.loginMethod,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
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
          📱 Active Sessions & Device Tracking
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Monitor candidate login history, analyze devices used, and revoke session access keys.
        </p>
      </div>

      {/* Sessions Table Dashboard */}
      <SessionsDashboard initialSessions={sessions} />
    </div>
  );
}
