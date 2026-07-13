/**
 * UsersManager Client Component — Candidate Accounts & Roles Console
 *
 * Implements:
 * 1. Searching/filtering across accounts by name, email, or role.
 * 2. Role modification (user, editor, admin) and premium tiers toggling.
 * 3. Secure diagnostic impersonation. Initiates target user simulation and handles session callbacks.
 * 4. Enterprise deletion workflow (soft/hard deletion with cascading data option).
 * 5. Live relative active status formats.
 *
 * @module app/(admin)/admin/users/UsersManager
 */

"use client";

import React, { useState, useEffect } from "react";
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

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "Never logged in";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just active";
  if (diffMin < 60) return `Last active ${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHour < 24) return `Last active ${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  return `Last active ${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}

function formatAbsoluteTime(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const m = months[date.getMonth()];
  const d = date.getDate();
  const y = date.getFullYear();
  
  let hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  return `${m} ${d} ${y} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

export function UsersManager({ initialUsers, currentAdminId }: UsersManagerProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Timer state for automatic time calculation refresh every minute
  const [tick, setTick] = useState(0);

  // Deletion Modal states
  const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [deleteMode, setDeleteMode] = useState<"soft" | "hard">("soft");
  const [deleteRelated, setDeleteRelated] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

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

    if (reason === null) return;
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

  const executeDeletion = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      const queryParams = new URLSearchParams({
        mode: deleteMode,
        deleteRelated: deleteMode === "hard" && deleteRelated ? "true" : "false",
      });
      const res = await fetch(`/api/admin/users/${deleteUser.id}?${queryParams.toString()}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to delete user account.");
      } else {
        alert("Candidate profile successfully deleted.");
        setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
        setDeleteUser(null);
        setConfirmText("");
        router.refresh();
      }
    } catch {
      alert("A network error occurred during deletion.");
    } finally {
      setIsDeleting(false);
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
                <th className="p-4 w-48 text-center">Security Options</th>
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

                    {/* Last login with live relative calculations */}
                    <td className="p-4 text-xs text-[var(--color-fg-muted)] font-mono">
                      {user.lastLoginAt ? (
                        <div className="flex flex-col text-left gap-0.5" key={tick}>
                          <span className="font-bold text-[var(--color-fg)]">
                            {formatRelativeTime(user.lastLoginAt)}
                          </span>
                          <span className="text-[10px] text-[var(--color-fg-muted)]">
                            {formatAbsoluteTime(user.lastLoginAt)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Never logged in</span>
                      )}
                    </td>

                    {/* Diagnostics options: Impersonate & Delete */}
                    <td className="p-4 text-center">
                      {!isSelf ? (
                        <div className="flex gap-2 justify-center items-center">
                          <Button
                            variant="outline"
                            onClick={() => handleImpersonate(user)}
                            disabled={isLoader}
                            className="inline-flex items-center gap-1 text-xs font-[family-name:var(--font-heading)] font-bold py-1.5 px-3 hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
                          >
                            <Eye size={12} /> Impersonate
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setDeleteUser(user)}
                            disabled={isLoader}
                            className="inline-flex items-center gap-1 text-xs font-[family-name:var(--font-heading)] font-bold py-1.5 px-3 border-red-200 text-red-600 hover:bg-red-600 hover:text-white"
                          >
                            🗑️ Delete
                          </Button>
                        </div>
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

      {/* Enterprise Delete Confirmation Modal */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card decoration="tape" className="max-w-md w-full p-6 space-y-4 border-2 border-[var(--color-border)] shadow-xl relative bg-[var(--color-bg)]">
            <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-accent)]">
              ⚠️ Warning: Enterprise Delete Flow
            </h3>
            
            <p className="text-sm text-[var(--color-fg)] font-[family-name:var(--font-body)]">
              You are about to delete candidate account: <span className="font-bold">{deleteUser.name}</span> ({deleteUser.email}).
            </p>

            <div className="bg-red-50 border border-red-200 p-3 text-xs text-red-700 space-y-1 font-[family-name:var(--font-body)]">
              <p className="font-bold">This action has major consequences on:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>📌 Bookmarked Solutions & pinboard logs</li>
                <li>✅ Practiced Question History & progress logs</li>
                <li>📄 Resumes and parsed AI profiles</li>
                <li>🤖 Personalized AI answer caches</li>
                <li>💡 Candidate suggestions & alternative solutions</li>
                <li>🔒 Active session keys</li>
              </ul>
            </div>

            {/* Selection choice */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--color-fg)]">
                Deletion Strategy
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteMode("soft")}
                  className={`flex-1 py-2 text-xs font-bold wobbly-sm border-2 transition-all ${
                    deleteMode === "soft"
                      ? "bg-[var(--color-accent)] text-[var(--color-bg)] border-[var(--color-accent)]"
                      : "bg-[var(--color-bg)] text-[var(--color-fg)] border-[var(--color-border)]"
                  }`}
                >
                  Soft Delete
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteMode("hard")}
                  className={`flex-1 py-2 text-xs font-bold wobbly-sm border-2 transition-all ${
                    deleteMode === "hard"
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-[var(--color-bg)] text-[var(--color-fg)] border-[var(--color-border)]"
                  }`}
                >
                  Hard Delete
                </button>
              </div>
            </div>

            {deleteMode === "hard" && (
              <label className="flex items-center gap-2 text-xs font-[family-name:var(--font-body)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={deleteRelated}
                  onChange={(e) => setDeleteRelated(e.target.checked)}
                  className="accent-[var(--color-accent)] cursor-pointer"
                />
                <span>Delete all associated data (cascading cleanup)</span>
              </label>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--color-fg-muted)]">
                Type <span className="font-mono text-red-600 font-bold">DELETE</span> to confirm:
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full text-center"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteUser(null);
                  setConfirmText("");
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={executeDeletion}
                disabled={confirmText !== "DELETE" || isDeleting}
                className="bg-red-600 border-red-600 text-white hover:bg-red-700 font-bold"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
