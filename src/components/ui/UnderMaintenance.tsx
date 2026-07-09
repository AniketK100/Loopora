/**
 * Under Maintenance Component — Client Component
 *
 * Premium, hand-drawn themed notice displayed when global maintenance mode is active.
 * Combines wobbly borders, tape decors, and clear administrative directions.
 * Distinguishes between anonymous visitors and logged-in users without admin access.
 *
 * @module components/ui/UnderMaintenance
 */

"use client";

import React from "react";
import Link from "next/link";
import { Hammer, ArrowRight } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";

interface UnderMaintenanceProps {
  /** Whether the current viewer is logged in (but not admin/editor) */
  isLoggedIn?: boolean;
}

export default function UnderMaintenance({ isLoggedIn = false }: UnderMaintenanceProps) {
  return (
    <div className="paper-grain min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[var(--color-bg)]">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Animated Icon Header */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-xl wobbly-sm shadow-[var(--shadow-default)] mx-auto animate-pulse">
          <Hammer size={36} className="text-[var(--color-accent)] animate-bounce" />
        </div>

        {/* Badge status */}
        <div>
          <Badge variant="warning" className="text-sm tracking-wider uppercase font-bold px-3 py-1">
            ⚠️ Maintenance Mode
          </Badge>
        </div>

        {/* Informative text block */}
        <Card decoration="tape" className="p-8 text-center bg-[var(--color-bg-alt)] border-2 border-[var(--color-border)] wobbly-sm shadow-[var(--shadow-default)]">
          <h1
            className="text-3xl font-bold text-[var(--color-fg)] mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {isLoggedIn ? "Access Restricted" : "Notebook Refresh in Progress"}
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed font-[family-name:var(--font-body)]">
            {isLoggedIn ? (
              <>
                Your account does not have administrator or editor privileges required to access the site during maintenance.
                Only Loopora administrators and editors can view content while maintenance is active.
              </>
            ) : (
              <>
                Loopora is currently undergoing scheduled system updates to clean the folders and cache.
                We expect to be back online in a few minutes.
              </>
            )}
          </p>
        </Card>

        {/* Administrative Bypass Prompt */}
        <div className="pt-4 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-fg-muted)] mb-3">
            {isLoggedIn
              ? "Need access? Contact an administrator for elevated privileges."
              : "Are you a Loopora Administrator or Editor?"}
          </p>
          <Link href="/login">
            <Button
              variant="outline"
              className="inline-flex items-center justify-center gap-2 text-xs font-[family-name:var(--font-heading)] font-bold px-4 py-2 hover:bg-[var(--color-bg-alt)]"
            >
              {isLoggedIn ? "Sign In with Admin Account" : "Sign In to Admin Dashboard"} <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
