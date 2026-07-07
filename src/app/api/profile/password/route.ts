/**
 * User Password Change API Route
 *
 * POST /api/profile/password — Update account password for credentials-based users
 *
 * @route /api/profile/password
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { AuditLog } from "@/lib/db/models/AuditLog";

const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = passwordUpdateSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    // Verify user is credentials-based
    if (user.authProvider !== "credentials" || !user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error: "OAuth-based accounts cannot change passwords directly. Please use your OAuth provider (Google).",
        },
        { status: 400 }
      );
    }

    // Verify current password match
    const passwordMatch = await bcrypt.compare(result.data.currentPassword, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Incorrect current password." },
        { status: 400 }
      );
    }

    // Hash new password and save
    const saltRounds = 10;
    user.passwordHash = await bcrypt.hash(result.data.newPassword, saltRounds);
    await user.save();

    // Write to audit log
    await AuditLog.create({
      actor: user._id,
      action: "update",
      entityType: "User",
      entityId: user._id,
      diff: {
        passwordChanged: true,
      },
    });

    return NextResponse.json(
      { success: true, message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Password Change API] Error updating password:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
