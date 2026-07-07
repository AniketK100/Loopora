/**
 * SessionsDashboard Client Component — Active Sessions Console
 *
 * Implements:
 * 1. Summary analytics cards (Active counts, Browser distribution, OAuth vs Credentials).
 * 2. Interactive search filters (by user name, email, IP, or device).
 * 3. Asynchronous session revocation with immediate UI updates.
 *
 * @module app/(admin)/admin/sessions/SessionsDashboard
 */

"use client";

import React, { useState } from "react";
import { Trash2, Search, Smartphone, Globe, ShieldCheck } from "lucide-react";
import { Card, Button, Input } from "@/components/ui";

interface SessionUser {
  name: string;
  email: string;
}

interface SessionItem {
  _id: string;
  user: SessionUser | null;
  ip: string;
  userAgent: string;
  device: string;
  loginMethod: "credentials" | "google";
  createdAt: string;
  expiresAt: string;
}

interface SessionsDashboardProps {
  initialSessions: SessionItem[];
}

export function SessionsDashboard({ initialSessions }: SessionsDashboardProps) {
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
  const [search, setSearch] = useState("");
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke and delete this active session tracking record?")) {
      return;
    }

    setIsRevoking(id);
    try {
      const res = await fetch(`/api/admin/sessions/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to revoke session.");
      } else {
        setSessions((prev) => prev.filter((s) => s._id !== id));
      }
    } catch {
      alert("A network error occurred.");
    } finally {
      setIsRevoking(null);
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    const q = search.toLowerCase();
    const userName = s.user?.name?.toLowerCase() || "";
    const userEmail = s.user?.email?.toLowerCase() || "";
    const device = s.device?.toLowerCase() || "";
    const ip = s.ip || "";
    return (
      userName.includes(q) ||
      userEmail.includes(q) ||
      device.includes(q) ||
      ip.includes(q)
    );
  });

  // Calculate stats
  const totalActive = sessions.length;
  const googleCount = sessions.filter((s) => s.loginMethod === "google").length;
  const credentialsCount = totalActive - googleCount;

  // Browser distribution parser
  const getDeviceStats = () => {
    const stats: Record<string, number> = {};
    sessions.forEach((s) => {
      const parts = s.device.split(" on ");
      const browser = parts[0] || "Unknown Browser";
      stats[browser] = (stats[browser] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  };

  const deviceStats = getDeviceStats();

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Active Card */}
        <Card footerStripColor="var(--color-accent)" className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
              Active Sessions
            </p>
            <p className="text-3xl font-bold text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>
              {totalActive}
            </p>
            <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              Logged in devices currently in database
            </p>
          </div>
          <Smartphone size={40} className="text-[var(--color-accent)] opacity-80" />
        </Card>

        {/* Authentication Mix */}
        <Card footerStripColor="var(--color-secondary)" className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
              Auth Provider Mix
            </p>
            <p className="text-2xl font-bold text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>
              🔑 {credentialsCount} / 🌐 {googleCount}
            </p>
            <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              Credentials logins vs Google OAuth
            </p>
          </div>
          <ShieldCheck size={40} className="text-[var(--color-secondary)] opacity-80" />
        </Card>

        {/* Device Platforms */}
        <Card footerStripColor="var(--color-success)" className="p-6 flex items-center justify-between">
          <div className="space-y-1 w-full">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
              Platform Distribution
            </p>
            <div className="space-y-1 max-h-[60px] overflow-y-auto mt-2">
              {deviceStats.length === 0 ? (
                <p className="text-xs text-[var(--color-fg-muted)]">No active devices</p>
              ) : (
                deviceStats.slice(0, 3).map(([browser, count]) => (
                  <div key={browser} className="flex justify-between text-xs font-[family-name:var(--font-body)] pr-2">
                    <span className="text-[var(--color-fg)] truncate max-w-[120px]">{browser}</span>
                    <span className="font-bold text-[var(--color-success)]">{count} ({Math.round((count/totalActive)*100)}%)</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <Globe size={40} className="text-[var(--color-success)] opacity-80 ml-2" />
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[var(--color-bg)] border-2 border-[var(--color-border)] p-4 rounded-xl wobbly-sm">
        <div className="relative w-full sm:max-w-xs">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-fg-muted)]">
            <Search size={16} />
          </span>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, email, IP, browser..."
            className="pl-9 pr-4 py-2 text-sm w-full"
          />
        </div>
        <p className="text-xs text-[var(--color-fg-muted)] font-bold">
          Showing {filteredSessions.length} of {totalActive} total login tracks
        </p>
      </div>

      {/* Active Sessions Grid */}
      <Card decoration="none" className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-[family-name:var(--font-body)]">
            <thead>
              <tr className="border-b-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] text-sm font-bold font-[family-name:var(--font-heading)]">
                <th className="p-4 w-1/4">User Profile</th>
                <th className="p-4 w-1/4">Device / OS</th>
                <th className="p-4 w-32">IP Address</th>
                <th className="p-4 w-36">Login Method</th>
                <th className="p-4">Logged In</th>
                <th className="p-4 w-28 text-center">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[var(--color-border-light)] text-base">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-[var(--color-fg-muted)]">
                    No active sessions found matching the search.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session._id} className="hover:bg-[var(--color-bg-alt)]/50 transition-colors">
                    {/* User Profile */}
                    <td className="p-4">
                      {session.user ? (
                        <div>
                          <p className="font-bold text-[var(--color-fg)] text-sm truncate max-w-[180px]">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-[var(--color-fg-muted)] truncate max-w-[180px]">
                            {session.user.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--color-fg-muted)] font-bold italic">
                          Deleted User
                        </span>
                      )}
                    </td>

                    {/* Device OS */}
                    <td className="p-4">
                      <p className="text-sm font-bold text-[var(--color-fg)] truncate max-w-[200px]">
                        {session.device}
                      </p>
                      <p className="text-xs text-[var(--color-fg-muted)] truncate max-w-[200px] font-mono">
                        {session.userAgent}
                      </p>
                    </td>

                    {/* IP */}
                    <td className="p-4 font-mono text-sm text-[var(--color-fg)]">
                      {session.ip}
                    </td>

                    {/* Login Method */}
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wider wobbly-sm border ${
                          session.loginMethod === "google"
                            ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-[var(--color-secondary)]/20"
                            : "bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20"
                        }`}
                      >
                        {session.loginMethod}
                      </span>
                    </td>

                    {/* CreatedAt */}
                    <td className="p-4 text-xs text-[var(--color-fg-muted)]">
                      <p>IN: {new Date(session.createdAt).toLocaleString()}</p>
                      <p className="mt-1">EXP: {new Date(session.expiresAt).toLocaleDateString()}</p>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <Button
                        variant="primary"
                        onClick={() => handleRevoke(session._id)}
                        disabled={isRevoking === session._id}
                        className="p-2 min-h-0 h-auto w-auto"
                        title="Revoke / Delete Session"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
