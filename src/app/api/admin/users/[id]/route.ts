/**
 * Admin User Management API Route
 *
 * PATCH /api/admin/users/[id] — Update user role or premium status (Admin only).
 *
 * @route /api/admin/users/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { requireRole } from "@/lib/auth/rbac";
import { objectIdSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Enforce RBAC — Admin only
    const rbac = await requireRole(["admin"]);
    if (!rbac.authorized) {
      return NextResponse.json(
        { success: false, error: rbac.error },
        { status: rbac.status }
      );
    }

    const session = await auth();
    const adminId = session?.user?.id;

    await connectDB();
    const { id } = await params;

    // Validate target user ID
    if (!objectIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Prevent self-demotion
    if (id === adminId) {
      return NextResponse.json(
        { success: false, error: "Self-modification is disabled. You cannot change your own role." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { role, isPremium } = body;

    const updateFields: Record<string, unknown> = {};
    if (role !== undefined) {
      if (!["user", "editor", "admin"].includes(role)) {
        return NextResponse.json(
          { success: false, error: "Invalid role value." },
          { status: 400 }
        );
      }
      updateFields.role = role;
    }

    if (isPremium !== undefined) {
      updateFields.isPremium = !!isPremium;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json(
        { success: false, error: "No update fields provided." },
        { status: 400 }
      );
    }

    // Retrieve old user state for audit diffing
    const oldUser = await User.findById(id);
    if (!oldUser) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "Failed to update user profile." },
        { status: 500 }
      );
    }

    // Log the update
    await AuditLog.create({
      actor: adminId,
      action: "update",
      entityType: "User",
      entityId: updatedUser._id,
      diff: {
        role: { old: oldUser.role, new: updatedUser.role },
        isPremium: { old: oldUser.isPremium, new: updatedUser.isPremium },
      },
      reason: "Administrative user profile update.",
    });

    return NextResponse.json({
      success: true,
      message: "User profile updated successfully.",
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isPremium: updatedUser.isPremium,
      },
    });
  } catch (error) {
    console.error("[Admin Users PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const rbac = await requireRole(["admin"]);
    if (!rbac.authorized) {
      return NextResponse.json(
        { success: false, error: rbac.error },
        { status: rbac.status }
      );
    }

    const session = await auth();
    const adminId = session?.user?.id;

    await connectDB();
    const { id } = await params;

    if (!objectIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    if (id === adminId) {
      return NextResponse.json(
        { success: false, error: "Self-deletion is disabled. You cannot delete your own account." },
        { status: 400 }
      );
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "soft";
    const deleteRelated = searchParams.get("deleteRelated") === "true";

    if (mode === "soft") {
      user.isDeleted = true;
      user.deletedAt = new Date();
      await user.save();

      await AuditLog.create({
        actor: adminId,
        action: "delete",
        entityType: "User",
        entityId: user._id,
        diff: { isDeleted: { old: false, new: true } },
        reason: "Administrative soft user deletion.",
      });

      return NextResponse.json({
        success: true,
        message: "User account soft-deleted successfully.",
      });
    }

    if (deleteRelated) {
      const { Resume } = await import("@/lib/db/models/Resume");
      const { ResumeAnalysis } = await import("@/lib/db/models/ResumeAnalysis");
      const { PersonalizedAnswer } = await import("@/lib/db/models/PersonalizedAnswer");
      const { Suggestion } = await import("@/lib/db/models/Suggestion");
      const { Session: SessionModel } = await import("@/lib/db/models/Session");
      const { AuditLog: AuditLogModel } = await import("@/lib/db/models/AuditLog");

      const userResumes = await Resume.find({ user: user._id });
      for (const res of userResumes) {
        await ResumeAnalysis.deleteOne({ contentHash: res.contentHash });
        await PersonalizedAnswer.deleteMany({ resumeContentHash: res.contentHash });
      }
      await Resume.deleteMany({ user: user._id });
      await Suggestion.deleteMany({ user: user._id });
      await SessionModel.deleteMany({ user: user._id });
      await AuditLogModel.deleteMany({ actor: user._id });
    }

    await User.findByIdAndDelete(id);

    await AuditLog.create({
      actor: adminId,
      action: "delete",
      entityType: "User",
      entityId: user._id,
      diff: { hardDelete: true, deleteRelated },
      reason: "Administrative hard user deletion.",
    });

    return NextResponse.json({
      success: true,
      message: "User account hard-deleted successfully.",
    });
  } catch (error) {
    console.error("[Admin Users DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
