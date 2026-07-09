/**
 * SignOutButton Client Component — Admin Dashboard
 *
 * Client button handling logout action via NextAuth client-side helper.
 *
 * @module app/(admin)/admin/SignOutButton
 */

"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui";
import posthog from "posthog-js";

export function SignOutButton() {
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
