/**
 * UsersManager Client Component — Candidate Accounts & Roles Console
 *
 * Implements:
 * 1. Searching/filtering across accounts by name, email, or role.
 * 2. Role modification (user, editor, admin) and premium tiers toggling.
 * 3. Secure diagnostic impersonation. Initiates target user simulation and handles session callbacks.
 *
 * @module app/(admin)/admin/users/UsersManager
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Search, Eye } from "lucide-react";
import { Card, Button, Input, Select, Toggle } from "@/components/ui";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "user" | "editor" | "admin";
  isPremium: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

interface UsersManagerProps {
  initialUsers: UserItem[];
  currentAdminId: string;
}

export function UsersManager({ initialUsers, currentAdminId }: UsersManagerProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Client-side search filtering
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.includes(q)
    );
  });

  const handleRoleChange = async (userId: string, newRole: UserItem["role"]) => {
    setIsUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to update user role.");
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        router.refresh();
      }
    } catch {
      alert("A network error occurred.");
    } finally {
      setIsUpdating(null);
    }
  };

  const handlePremiumToggle = async (userId: string, currentVal: boolean) => {
    setIsUpdating(userId);
    const newVal = !currentVal;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPremium: newVal }),
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to toggle premium tier status.");
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isPremium: newVal } : u))
        );
        router.refresh();
      }
    } catch {
      alert("A network error occurred.");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleImpersonate = async (targetUser: UserItem) => {
    const reason = prompt(
      `Enter diagnostic reason to impersonate "${targetUser.name}" (${targetUser.email}):`,
      "Diagnostic checking / Customer support verification"
    );

    if (reason === null) return; // cancelled
    if (!reason.trim()) {
      alert("A diagnostic reason is required for security auditing.");
      return;
    }

    setIsUpdating(targetUser.id);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          userId: targetUser.id,
          reason: reason.trim(),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to initiate impersonation.");
      } else {
        const json = await res.json();
        // Trigger NextAuth dynamic session JWT reload
        await updateSession({ impersonateUser: json.user });
        alert(`Now impersonating ${targetUser.name}! Redirecting to candidates home view.`);
        window.location.href = "/";
      }
    } catch {
      alert("A network error occurred starting impersonation.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--color-bg)] border-2 border-[var(--color-border)] p-4 rounded-xl wobbly-sm">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-fg-muted)]">
            <Search size={16} />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email..."
            className="pl-9 pr-4 py-2 text-sm w-full"
          />
        </div>
        <p className="text-xs text-[var(--color-fg-muted)] font-bold">
          Showing {filteredUsers.length} of {users.length} registered candidates
        </p>
      </div>

      {/* User Accounts List */}
      <Card decoration="none" className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-[family-name:var(--font-body)]">
            <thead>
              <tr className="border-b-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] text-sm font-bold font-[family-name:var(--font-heading)]">
                <th className="p-4 w-1/4">Candidate Profile</th>
                <th className="p-4 w-28 text-center">Premium Tier</th>
                <th className="p-4 w-36 text-center">Administrative Role</th>
                <th className="p-4">Created Date</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 w-36 text-center">Security Options</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[var(--color-border-light)] text-base">
              {filteredUsers.map((user) => {
                const isSelf = user.id === currentAdminId;
                const isLoader = isUpdating === user.id;

                return (
                  <tr key={user.id} className="hover:bg-[var(--color-bg-alt)]/50 transition-colors">
                    {/* Profile details */}
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-[var(--color-fg)] text-sm truncate max-w-[180px]">
                          {user.name} {isSelf && <span className="text-[var(--color-accent)] font-bold">(You)</span>}
                        </p>
                        <p className="text-xs text-[var(--color-fg-muted)] truncate max-w-[180px]">
                          {user.email}
                        </p>
                      </div>
                    </td>

                    {/* Premium Toggling */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={user.isPremium}
                          onChange={() => handlePremiumToggle(user.id, user.isPremium)}
                          disabled={isLoader}
                        />
                      </div>
                    </td>

                    {/* Role selector dropdown */}
                    <td className="p-4 text-center">
                      <div className="inline-block w-32">
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as UserItem["role"])}
                          disabled={isSelf || isLoader}
                          options={[
                            { value: "user", label: "User" },
                            { value: "editor", label: "Editor" },
                            { value: "admin", label: "Admin" },
                          ]}
                        />
                      </div>
                    </td>

                    {/* Created date */}
                    <td className="p-4 text-xs text-[var(--color-fg-muted)] font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Last login */}
                    <td className="p-4 text-xs text-[var(--color-fg-muted)] font-mono">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never logged in"}
                    </td>

                    {/* Diagnostics options: Impersonate */}
                    <td className="p-4 text-center">
                      {!isSelf ? (
                        <Button
                          variant="outline"
                          onClick={() => handleImpersonate(user)}
                          disabled={isLoader}
                          className="inline-flex items-center gap-1 text-xs font-[family-name:var(--font-heading)] font-bold py-1.5 px-3 hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
                        >
                          <Eye size={12} /> Impersonate
                        </Button>
                      ) : (
                        <span className="text-xs text-[var(--color-fg-muted)] font-bold italic">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
