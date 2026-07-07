/**
 * Admin User Management Page — Server Component
 *
 * Fetches all registered users, manages role promotions and premium flags,
 * and enables secure diagnostic user impersonation.
 *
 * @route /admin/users
 */

import { Metadata } from "next";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { UsersManager } from "./UsersManager";

export const metadata: Metadata = {
  title: "Candidate Accounts & Roles Management — Admin",
};

export default async function AdminUsersPage() {
  const session = await auth();
  const currentAdminId = session?.user?.id || "";

  await connectDB();

  // Fetch all users
  const usersRaw = await User.find().sort({ createdAt: -1 });

  // Map to serialized format for Client Component
  const users = usersRaw.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    isPremium: u.isPremium,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2
          className="text-3xl font-bold text-[var(--color-fg)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          👥 Candidate Accounts & Roles
        </h2>
        <p
          className="text-base text-[var(--color-fg-muted)] mt-1"
          style={{ fontFamily: "var(--font-body)" }}
        >
          Manage user permissions, promote accounts to editors or administrators, and perform diagnostic support impersonation.
        </p>
      </div>

      <UsersManager initialUsers={users} currentAdminId={currentAdminId} />
    </div>
  );
}
