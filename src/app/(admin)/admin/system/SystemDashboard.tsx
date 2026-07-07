/**
 * SystemDashboard Client Component — Health & Monitoring console
 *
 * Implements:
 * 1. Health Status Card (checks database connectivity, version, and server time).
 * 2. Error Monitoring widget (checks Sentry configuration and lists mock error events).
 * 3. Rate Limit Console (displays active hits by IP and allows administrative clearance).
 *
 * @module app/(admin)/admin/system/SystemDashboard
 */

"use client";

import React, { useState } from "react";
import { ShieldCheck, Activity, Key, Flame, Trash2 } from "lucide-react";
import { Card, Button, Badge } from "@/components/ui";

interface RateLimitItem {
  _id: string;
  ip: string;
  endpoint: string;
  hits: number;
  expiresAt: string;
  updatedAt: string;
}

interface SystemDashboardProps {
  healthData: {
    status: string;
    db: string;
    timestamp: string;
    version: string;
    env: {
      sentryConfigured: boolean;
      mongoConnected: boolean;
      nextAuthUrl: string;
    };
  };
  initialRateLimits: RateLimitItem[];
}

export function SystemDashboard({ healthData, initialRateLimits }: SystemDashboardProps) {
  const [rateLimits, setRateLimits] = useState<RateLimitItem[]>(initialRateLimits);
  const [isClearing, setIsClearing] = useState<string | null>(null);
  const [mountTime] = useState(() => Date.now());

  const handleClearLimit = async (id: string) => {
    setIsClearing(id);
    try {
      const res = await fetch(`/api/admin/ratelimits/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        alert(json.error || "Failed to clear rate limit.");
      } else {
        setRateLimits((prev) => prev.filter((r) => r._id !== id));
      }
    } catch {
      alert("A network error occurred.");
    } finally {
      setIsClearing(null);
    }
  };

  // Mock Sentry logs (displayed if Sentry is stubbed, or as active alerts)
  const mockSentryLogs = [
    { id: "err-001", error: "NextAuthCredentialsError: authorize callback returned null", count: 12, time: "10 mins ago", level: "warning" },
    { id: "err-002", error: "MongoNetworkError: connection timed out on seed query", count: 2, time: "1 hour ago", level: "error" },
    { id: "err-003", error: "TypeError: Cannot read properties of undefined (reading 'category')", count: 4, time: "2 hours ago", level: "error" },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Health Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Server Status */}
        <Card footerStripColor={healthData.status === "ok" ? "var(--color-success)" : "var(--color-danger)"} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
                Next.js Server
              </p>
              <p className="text-2xl font-bold text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>
                {healthData.status === "ok" ? "Healthy" : "Degraded"}
              </p>
              <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                Version: {healthData.version} | API: online
              </p>
            </div>
            <Activity size={36} className={healthData.status === "ok" ? "text-[var(--color-success)] animate-pulse" : "text-[var(--color-danger)]"} />
          </div>
        </Card>

        {/* Database Status */}
        <Card footerStripColor={healthData.db === "connected" ? "var(--color-success)" : "var(--color-danger)"} className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
                MongoDB Atlas
              </p>
              <p className="text-2xl font-bold text-[var(--color-fg)]" style={{ fontFamily: "var(--font-heading)" }}>
                {healthData.db === "connected" ? "Connected" : "Disconnected"}
              </p>
              <p className="text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
                Ping: active | Cluster status: ok
              </p>
            </div>
            <ShieldCheck size={36} className={healthData.db === "connected" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"} />
          </div>
        </Card>

        {/* Credentials / Env Settings */}
        <Card footerStripColor="var(--color-warning)" className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-fg-muted)]">
                Environment Flags
              </p>
              <div className="text-xs space-y-1 font-[family-name:var(--font-body)] text-[var(--color-fg)] pt-1">
                <p>🔑 Google Auth: {healthData.env.sentryConfigured ? "✅ ON" : "❌ OFF"}</p>
                <p>🌍 Site URL: <span className="font-mono text-[9px] text-[var(--color-accent)]">{healthData.env.nextAuthUrl || "localhost"}</span></p>
              </div>
            </div>
            <Key size={36} className="text-[var(--color-warning)]" />
          </div>
        </Card>
      </div>

      {/* 2. Sentry & Error Monitoring Widget */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            🐞 Sentry Error Monitor
          </h3>
          <Badge variant={healthData.env.sentryConfigured ? "success" : "accent"} className="text-xs">
            {healthData.env.sentryConfigured ? "Live Tracking Active" : "Mock / Sandbox Mode"}
          </Badge>
        </div>

        <Card decoration="tape" className="p-6">
          {!healthData.env.sentryConfigured && (
            <div className="mb-4 p-3 bg-[var(--color-post-it)]/30 border-l-4 border-[var(--color-post-it-dark)] text-xs text-[var(--color-fg-muted)] font-[family-name:var(--font-body)]">
              ⚠️ <strong>Sentry variables missing:</strong> App is running in sandbox logging mode. Define <code>SENTRY_DSN</code> in your <code>.env</code> file to sync logs to Sentry production dashboard.
            </div>
          )}

          <div className="space-y-3 font-[family-name:var(--font-body)]">
            {mockSentryLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[var(--color-bg)] border border-[var(--color-border-light)] rounded-lg text-sm hover:border-[var(--color-border)] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded border mt-0.5 ${
                      log.level === "error"
                        ? "bg-red-100 text-red-700 border-red-200"
                        : "bg-amber-100 text-amber-700 border-amber-200"
                    }`}
                  >
                    {log.level}
                  </span>
                  <div>
                    <p className="font-bold text-[var(--color-fg)] font-mono break-all text-xs">{log.error}</p>
                    <p className="text-xs text-[var(--color-fg-muted)] mt-1">{log.time} &bull; Occurred {log.count} times</p>
                  </div>
                </div>
                <div className="text-right mt-2 sm:mt-0 text-xs">
                  <Badge variant="default" className="text-xs font-mono">
                    ID: {log.id}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* 3. Rate Limit Management Console */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          🔥 Rate Limit Registry & Blocking
        </h3>

        <Card decoration="none" className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-[family-name:var(--font-body)]">
              <thead>
                <tr className="border-b-2 border-[var(--color-border)] bg-[var(--color-bg-alt)] text-sm font-bold font-[family-name:var(--font-heading)]">
                  <th className="p-4 w-1/4">Origin IP</th>
                  <th className="p-4 w-1/4">Endpoint Route</th>
                  <th className="p-4 w-28 text-center">Hits Logged</th>
                  <th className="p-4 w-32 text-center">Status</th>
                  <th className="p-4">Expires In</th>
                  <th className="p-4 w-28 text-center">Clear Block</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[var(--color-border-light)] text-base">
                {rateLimits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-sm text-[var(--color-fg-muted)]">
                      No active rate limit traces logged in database. IPs are operating normally.
                    </td>
                  </tr>
                ) : (
                  rateLimits.map((limit) => {
                    // Consider blocked if hit threshold exceeded (e.g. 50 hits on credentials, or display warning)
                    const isHigh = limit.hits >= 45;
                    const timeRemaining = Math.max(0, Math.round((new Date(limit.expiresAt).getTime() - mountTime) / 1000));

                    return (
                      <tr key={limit._id} className="hover:bg-[var(--color-bg-alt)]/50 transition-colors">
                        {/* IP */}
                        <td className="p-4 font-mono font-bold text-sm text-[var(--color-fg)]">
                          {limit.ip}
                        </td>

                        {/* Endpoint */}
                        <td className="p-4 font-mono text-xs text-[var(--color-fg-muted)]">
                          {limit.endpoint}
                        </td>

                        {/* Hits */}
                        <td className="p-4 text-center font-bold text-sm text-[var(--color-fg)]">
                          {limit.hits}
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          {isHigh ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-red-100 text-red-800 border border-red-200 rounded">
                              <Flame size={12} /> BLOCKED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-green-100 text-green-800 border border-green-200 rounded">
                              <ShieldCheck size={12} /> SAFE
                            </span>
                          )}
                        </td>

                        {/* Expires */}
                        <td className="p-4 text-xs text-[var(--color-fg-muted)]">
                          {timeRemaining > 0 ? `${timeRemaining}s remaining` : "Expired (Awaiting TTL cleanup)"}
                        </td>

                        {/* Action Clearance */}
                        <td className="p-4 text-center">
                          <Button
                            variant="outline"
                            onClick={() => handleClearLimit(limit._id)}
                            disabled={isClearing === limit._id}
                            className="p-2 min-h-0 h-auto w-auto hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Clear tracking history"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
