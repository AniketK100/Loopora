/**
 * Role-Based Access Control (RBAC) Server Utility
 *
 * Provides a helper to authorize mutating API routes (POST, PATCH, DELETE)
 * on the server side by checking the user's role in the decrypted session.
 *
 * @module lib/auth/rbac
 * @see 02_TRD.md §4 — Security Requirements (RBAC role checks)
 * @see 05_Backend_Schema_Data_Auth.md §3 — Auth Design (RBAC middleware)
 */

import { auth } from "@/auth";
import { UserRole } from "@/types";

export interface RbacResult {
  authorized: boolean;
  status: 200 | 401 | 403;
  error: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isPremium: boolean;
  } | null;
}

/**
 * Validates if the current session belongs to an authenticated user
 * with one of the allowed roles.
 *
 * @param allowedRoles Array of roles permitted to call the endpoint
 * @returns RbacResult containing authorization status and user profile
 *
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const rbac = await requireRole(["admin", "editor"]);
 *   if (!rbac.authorized) {
 *     return Response.json({ success: false, error: rbac.error }, { status: rbac.status });
 *   }
 *
 *   // Proceed with admin action...
 *   console.log("Actor is:", rbac.user.email);
 * }
 * ```
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<RbacResult> {
  const session = await auth();

  // 1. Authenticated session check
  if (!session || !session.user) {
    return {
      authorized: false,
      status: 401,
      error: "Unauthorized: Please log in to perform this action.",
      user: null,
    };
  }

  // 2. Role presence verification
  const role = session.user.role;
  if (!allowedRoles.includes(role)) {
    return {
      authorized: false,
      status: 403,
      error: "Forbidden: You do not have permission to perform this action.",
      user: null,
    };
  }

  return {
    authorized: true,
    status: 200,
    error: null,
    user: session.user as RbacResult["user"],
  };
}
