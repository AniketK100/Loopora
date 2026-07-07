/**
 * SecurityDashboard Client Component — Admin Security Center
 *
 * Implements:
 * 1. Security Overview stats (rate limit blocks count, active session tracks, Sentry state).
 * 2. Diagnostics Impersonation monitor (displays if current admin is simulating a user, allows exit).
 * 3. Chronological security audit logs timeline (sign-ins, updates, role switches, impersonations).
 *
 * @module app/(admin)/admin/security/SecurityDashboard
 */

"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldCheck, ShieldAlert, Flame, Smartphone, EyeOff } from "lucide-react";
import { Card, Button } from "@/components/ui";

interface AuditLogItem {
  id: string;
  actor: { name: string; email: string } | null;
  action: string;
  entityType: string;
  entityId: string;
  reason: string | null;
  createdAt: string;
}

interface SecurityDashboardProps {
  initialLogs: AuditLogItem[];
  rateLimitBlocksCount: number;
  activeSessionsCount: number;
  sentryActive: boolean;
}

interface ImpersonationSession {
  adminUser?: {
    id: string;
    email: string;
    name: string;
    role: string;
    isPremium: boolean;
  };
}

export function SecurityDashboard({
  initialLogs,
  rateLimitBlocksCount,
  activeSessionsCount,
  sentryActive,
}: SecurityDashboardProps) {
  const { data: session, update: updateSession } = useSession();
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [isStopping, setIsStopping] = useState(false);

  // Check if current session is impersonated
  const sessionTyped = session as unknown as ImpersonationSession | null;
  const isImpersonating = !!sessionTyped?.adminUser;
  const adminUser = sessionTyped?.adminUser;
  const currentUser = session?.user;

  const handleStopImpersonate = async () => {
    if (!currentUser) return;
    setIsStopping(true);
    try {
      const res = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stop",
          userId: currentUser.id,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to stop impersonation.");
      } else {
        // Trigger NextAuth dynamic session update to restore admin
        await updateSession({ stopImpersonation: true });
        alert("Impersonation stopped! Restoring administrator account details.");
        window.location.href = "/admin/security";
      }
    } catch {
      alert("A network error occurred stopping impersonation.");
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Impersonation Banner/Card (if active) */}
      {isImpersonating && (
        <Card decoration="tape" className="p-6 bg-amber-50 border-2 border-amber-300 wobbly-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={24} />
              <div>
                <h3 className="font-bold text-amber-900 text-lg">Active Impersonation Diagnostic Session</h3>
                <p className="text-sm text-amber-800 font-[family-name:var(--font-body)] mt-1">
                  You are viewing the site as candidate <strong>{currentUser?.name}</strong> ({currentUser?.email}). 
                  Actions performed are mapped back to administrator <strong>{adminUser?.email}</strong>.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleStopImpersonate}
              disabled={isStopping}
              className="inline-flex items-center gap-1 shrink-0 font-[family-name:var(--font-heading)] font-bold text-sm"
            >
              <EyeOff size={16} /> Stop Impersonation
            </Button>
          </div>
        </Card>
      )}

      {/* 2. Security Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Blocks */}
        <Card footerStripColor={rateLimitBlocksCount > 0 ? "var(--color-danger)" : "var(--color-success)"} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
                Active IP Blocks
              </p>
              <p className="text-3xl font-bold text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>
                {rateLimitBlocksCount}
              </p>
              <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                IPs exceeding request thresholds
              </p>
            </div>
            <Flame size={36} className={rateLimitBlocksCount > 0 ? "text-[var(--color-danger)]" : "text-[var(--color-success)]"} />
          </div>
        </Card>

        {/* Active Sessions */}
        <Card footerStripColor="var(--color-accent)" className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
                Active Sessions Count
              </p>
              <p className="text-3xl font-bold text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>
                {activeSessionsCount}
              </p>
              <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                Device access tracks in registry
              </p>
            </div>
            <Smartphone size={36} className="text-[var(--color-accent)]" />
          </div>
        </Card>

        {/* Sentry active state */}
        <Card footerStripColor={sentryActive ? "var(--color-success)" : "var(--color-warning)"} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
                Exception Monitoring
              </p>
              <p className="text-2xl font-bold text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>
                {sentryActive ? "Sentry Active" : "Mock Monitor"}
              </p>
              <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                Runtime error ingestion hooks
              </p>
            </div>
            <ShieldCheck size={36} className={sentryActive ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"} />
          </div>
        </Card>
      </div>

      {/* 3. Chronological Security Audit Timeline */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          🛡️ Security Logs & Operations Timeline
        </h3>

        <Card decoration="none" className="p-6 bg-[var(--color-bg-alt)] border-2 border-[var(--color-border)] wobbly-sm shadow-[var(--shadow-default)]">
          <div className="relative border-l-2 border-[var(--color-border-light)] pl-6 ml-3 space-y-8 py-2 font-[family-name:var(--font-body)]">
            {logs.length === 0 ? (
              <p className="text-sm text-[var(--color-fg-muted)] italic">
                No recent security audit logs recorded.
              </p>
            ) : (
              logs.map((log) => {
                // Determine icon or bullet style based on action
                const isImpersonate = log.action === "impersonate" || log.action === "impersonate_end";
                const isDelete = log.action === "delete";
                
                return (
                  <div key={log.id} className="relative">
                    {/* Event node dot */}
                    <span className={`absolute -left-[31px] top-1.5 flex items-center justify-center w-4.5 h-4.5 rounded-full border-2 ${
                      isImpersonate 
                        ? "bg-amber-100 border-amber-400" 
                        : isDelete 
                          ? "bg-red-100 border-red-400" 
                          : "bg-green-100 border-green-400"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isImpersonate 
                          ? "bg-amber-500" 
                          : isDelete 
                            ? "bg-red-500" 
                            : "bg-green-500"
                      }`} />
                    </span>

                    {/* Event block */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                        <p className="text-sm font-bold text-[var(--color-fg)]">
                          <span className="font-mono text-[var(--color-accent)] font-bold uppercase mr-1">
                            [{log.action}]
                          </span>
                          Targeted: {log.entityType} ({log.entityId})
                        </p>
                        <span className="text-xs text-[var(--color-fg-muted)] font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-fg-muted)] mt-1">
                        Actor: {log.actor ? `${log.actor.name} (${log.actor.email})` : "System / Anonymized actor"}
                      </p>
                      {log.reason && (
                        <p className="text-xs bg-[var(--color-bg)] border border-[var(--color-border-light)] p-2 rounded mt-2 font-mono text-[var(--color-fg-muted)]">
                          Reason: {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}
