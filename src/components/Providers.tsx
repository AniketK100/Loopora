/**
 * Providers Wrapper — Client Components Contexts
 *
 * Exposes next-auth SessionProvider at the root of the layout tree,
 * allowing useSession hooks to function in both admin and candidate flows.
 *
 * @module components/Providers
 */

"use client";

import React, { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import posthog from "posthog-js";

function PostHogIdentify() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useEffect(() => {
    if (userId) {
      posthog.identify(userId, {
        email: session?.user?.email,
        name: session?.user?.name,
      });
    }
  }, [userId, session?.user?.email, session?.user?.name]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PostHogIdentify />
      {children}
    </SessionProvider>
  );
}
