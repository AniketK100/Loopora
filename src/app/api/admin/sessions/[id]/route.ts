/**
 * Admin Session Revocation API Route
 *
 * DELETE /api/admin/sessions/[id] — Revoke/Delete an active session tracking record (Admin only).
 *
 * @route /api/admin/sessions/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Session } from "@/lib/db/models/Session";
import { requireRole } from "@/lib/auth/rbac";
import { objectIdSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Enforce Role-Based Access Control
    const rbac = await requireRole(["admin"]);
    if (!rbac.authorized) {
      return NextResponse.json(
        { success: false, error: rbac.error },
        { status: rbac.status }
      );
    }

    await connectDB();
    const { id } = await params;

    // Validate ID format
    if (!objectIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: "Invalid session ID format" },
        { status: 400 }
      );
    }

    const deletedSession = await Session.findByIdAndDelete(id);

    if (!deletedSession) {
      return NextResponse.json(
        { success: false, error: "Session record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Session revoked successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin Sessions DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
