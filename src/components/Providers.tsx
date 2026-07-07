/**
 * Providers Wrapper — Client Components Contexts
 *
 * Exposes next-auth SessionProvider at the root of the layout tree,
 * allowing useSession hooks to function in both admin and candidate flows.
 *
 * @module components/Providers
 */

"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
