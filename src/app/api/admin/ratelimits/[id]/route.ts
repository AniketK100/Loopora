/**
 * Admin Rate Limit Clearance API Route
 *
 * DELETE /api/admin/ratelimits/[id] — Delete a rate limit record/unblock an IP (Admin only).
 *
 * @route /api/admin/ratelimits/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { RateLimit } from "@/lib/db/models/RateLimit";
import { requireRole } from "@/lib/auth/rbac";
import { objectIdSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Enforce RBAC
    const rbac = await requireRole(["admin"]);
    if (!rbac.authorized) {
      return NextResponse.json(
        { success: false, error: rbac.error },
        { status: rbac.status }
      );
    }

    await connectDB();
    const { id } = await params;

    // Validate ID
    if (!objectIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: "Invalid rate limit ID format" },
        { status: 400 }
      );
    }

    const deletedLimit = await RateLimit.findByIdAndDelete(id);

    if (!deletedLimit) {
      return NextResponse.json(
        { success: false, error: "Rate limit record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Rate limit tracker cleared successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Admin RateLimits DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
