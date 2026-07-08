/**
 * Selected Folders Update API Route
 *
 * POST /api/profile/folders — Save up to 2 interview folders selected for resume personalization.
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { AuditLog } from "@/lib/db/models/AuditLog";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const { folderIds } = body;

    if (!Array.isArray(folderIds)) {
      return NextResponse.json({ error: "Invalid folderIds format. Expected array." }, { status: 400 });
    }

    if (folderIds.length > 2) {
      return NextResponse.json(
        { error: "Maximum selected folders limit exceeded. You can select at most 2 folders." },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    for (const id of folderIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: `Invalid folder ID format: ${id}` }, { status: 400 });
      }
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    const previousFolders = user.selectedFolders || [];
    user.selectedFolders = folderIds.map((id) => new mongoose.Types.ObjectId(id));
    await user.save();

    await AuditLog.create({
      actor: user._id,
      action: "update",
      entityType: "User",
      entityId: user._id,
      diff: { previousFolders, newFolders: folderIds },
    });

    return NextResponse.json({ success: true, selectedFolders: user.selectedFolders });
  } catch (error) {
    console.error("[Profile Folders POST API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
