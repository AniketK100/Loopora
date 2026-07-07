/**
 * User Profile API Route (GET, PATCH, DELETE)
 *
 * GET /api/profile â€” Fetch current user's profile metadata
 * PATCH /api/profile â€” Update current user's editable details (name only, validated)
 * DELETE /api/profile â€” Cascading delete of user profile and data (DPDP compliance)
 *
 * @route /api/profile
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { Session } from "@/lib/db/models/Session";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { ApiResponse } from "@/types";

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name cannot exceed 50 characters").trim(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please log in." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("-passwordHash");
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Profile GET API] Error fetching profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = profileUpdateSchema.safeParse(body);

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

    const oldName = user.name;
    const newName = result.data.name;

    if (oldName !== newName) {
      user.name = newName;
      await user.save();

      // Write to Audit Log
      await AuditLog.create({
        actor: user._id,
        action: "update",
        entityType: "User",
        entityId: user._id,
        diff: {
          name: { before: oldName, after: newName },
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
        data: { name: user.name, email: user.email },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Profile PATCH API] Error updating profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    // DPDP-compliant cascading erasure:
    // 1. Anonymize user reference on append-only content audit logs
    const anonymousActorId = new mongoose.Types.ObjectId("000000000000000000000000");
    await AuditLog.updateMany({ actor: userId }, { $set: { actor: anonymousActorId } });

    // 2. Clear all active sessions associated with this user
    await Session.deleteMany({ user: userId });

    // 3. Remove the User document completely
    await User.findByIdAndDelete(userId);

    return NextResponse.json(
      {
        success: true,
        message: "Account and associated personal records successfully deleted.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Profile DELETE API] Error deleting profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
