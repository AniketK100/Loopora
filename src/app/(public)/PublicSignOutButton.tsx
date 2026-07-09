/**
 * PublicSignOutButton Client Component — Public Layout
 *
 * Client button handling logout action on the public navigation bar.
 *
 * @module app/(public)/PublicSignOutButton
 */

"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";
import posthog from "posthog-js";

export function PublicSignOutButton() {
  const handleLogout = async () => {
    posthog.capture("user_signed_out");
    posthog.reset();
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="!py-1 !px-2.5 !text-xs font-bold font-[family-name:var(--font-heading)]"
    >
      Sign Out
    </Button>
  );
}
