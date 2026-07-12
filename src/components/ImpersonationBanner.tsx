/**
 * ImpersonationBanner Client Component — Global Security Notice
 *
 * Sticky top banner rendered across public and admin interfaces when
 * an administrator is actively impersonating a candidate profile.
 * Provides a single-click exit trigger to restore admin credentials.
 *
 * @module components/ImpersonationBanner
 */

"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { ShieldAlert, LogOut } from "lucide-react";

interface ImpersonationSession {
  adminUser?: {
    email: string;
  };
}

export function ImpersonationBanner() {
  const { data: session, update: updateSession } = useSession();
  const [isStopping, setIsStopping] = useState(false);

  const sessionTyped = session as unknown as ImpersonationSession | null;
  const isImpersonating = !!sessionTyped?.adminUser;
  const adminUser = sessionTyped?.adminUser;
  const currentUser = session?.user;

  if (!isImpersonating || !currentUser) {
    return null;
  }

  const handleStopImpersonate = async () => {
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
        alert(json.error || "Failed to exit impersonation.");
      } else {
        // Dynamic session callback to restore admin token
        await updateSession({ stopImpersonation: true });
        alert("Impersonation ended! Restored administrator credentials.");
        window.location.href = "/admin/security";
      }
    } catch {
      alert("A network error occurred stopping impersonation.");
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <div
      className="w-full bg-amber-500 border-b border-amber-600 text-black py-2.5 px-4 shadow-md font-[family-name:var(--font-heading)] font-bold text-xs sm:text-sm"
      style={{ letterSpacing: "0.025em" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <ShieldAlert size={16} className="text-black shrink-0 animate-pulse" />
          <span>
            🕵️ ACTIVE IMPERSONATION: You are acting as <strong>{currentUser.name}</strong> ({currentUser.email}).
            Audits mapped to admin <strong>{adminUser?.email}</strong>.
          </span>
        </div>
        <button
          onClick={handleStopImpersonate}
          disabled={isStopping}
          className="inline-flex items-center gap-1 bg-black text-white hover:bg-black/80 transition-colors px-3 py-1 rounded wobbly-xs border border-black text-xs font-bold font-[family-name:var(--font-heading)] disabled:opacity-50"
        >
          <LogOut size={12} /> {isStopping ? "Exiting..." : "Exit"}
        </button>
      </div>
    </div>
  );
}
