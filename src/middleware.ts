/**
 * Next.js Edge Middleware — NextAuth Guard
 *
 * Intercepts incoming requests to matchers and applies NextAuth's
 * edge-safe callback authorization rules. Automatically redirects
 * unauthenticated users to `/login` and checks roles on administrative routes.
 *
 * @module middleware
 * @see 02_TRD.md §1 — Stack Decision (RBAC middleware)
 * @see 03_App_Flow.md §5 — Admin Content Flow (role check via middleware)
 */

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Export the auth handler directly to run in Next.js Edge runtime
export default NextAuth(authConfig).auth;

export const config = {
  /**
   * Matcher defines which routes trigger this middleware.
   * Restricts triggers to admin dashboard routes to keep public pages fast.
   */
  matcher: ["/admin/:path*"],
};
