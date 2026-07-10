/**
 * Admin Impersonation API Route
 *
 * POST /api/admin/impersonate — Start or stop impersonation session (Admin only).
 *
 * @route /api/admin/impersonate
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { objectIdSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    interface ImpersonateSession {
      user: { id: string; role: string };
      adminUser?: { id: string; role: string; email: string };
    }
    const sessionTyped = session as unknown as ImpersonateSession | null;

    // 1. Enforce Admin Check (either direct admin user or storing adminUser proxy)
    const isAdmin =
      sessionTyped?.user?.role === "admin" ||
      sessionTyped?.adminUser?.role === "admin";

    if (!session || !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, userId, reason } = body;

    if (!["start", "stop"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'start' or 'stop'." },
        { status: 400 }
      );
    }

    await connectDB();

    // Determine the actual admin ID performing this action
    const adminId = sessionTyped?.adminUser?.id || sessionTyped?.user?.id;

    if (action === "start") {
      if (!userId || !objectIdSchema.safeParse(userId).success) {
        return NextResponse.json(
          { success: false, error: "Invalid or missing target user ID." },
          { status: 400 }
        );
      }

      // Query the target user's metadata to impersonate
      const targetUser = await User.findById(userId);
      if (!targetUser) {
        return NextResponse.json(
          { success: false, error: "Target user not found." },
          { status: 404 }
        );
      }

      // Add audit log entry
      await AuditLog.create({
        actor: adminId,
        action: "impersonate",
        entityType: "User",
        entityId: targetUser._id,
        reason: reason || "Administrative user impersonation session started.",
      });

      return NextResponse.json({
        success: true,
        user: {
          id: targetUser._id.toString(),
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          isPremium: targetUser.isPremium,
        },
      });
    } else {
      // action === "stop"
      if (!userId || !objectIdSchema.safeParse(userId).success) {
        return NextResponse.json(
          { success: false, error: "Invalid or missing target user ID." },
          { status: 400 }
        );
      }

      // Add audit log entry
      await AuditLog.create({
        actor: adminId,
        action: "impersonate_end",
        entityType: "User",
        entityId: userId,
        reason: "Administrative user impersonation session ended.",
      });

      return NextResponse.json({
        success: true,
        message: "Impersonation session ended.",
      });
    }
  } catch (error) {
    console.error("[Admin Impersonate] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
