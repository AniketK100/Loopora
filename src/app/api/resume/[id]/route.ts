/**
 * Resume Management API Route
 *
 * DELETE /api/resume/[id] — Delete a resume (cannot delete the last one)
 * PATCH /api/resume/[id] — Set active or rename a resume
 *   Body: { action: "set_active" } or { action: "rename", displayName: string }
 *
 * @route /api/resume/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Resume } from "@/lib/db/models/Resume";
import { ResumeAnalysis } from "@/lib/db/models/ResumeAnalysis";
import { PersonalizedAnswer } from "@/lib/db/models/PersonalizedAnswer";
import { AuditLog } from "@/lib/db/models/AuditLog";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid resume ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || "set_active";

    await connectDB();

    const resume = await Resume.findOne({ _id: id, user: userId });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found or access denied." }, { status: 404 });
    }

    if (action === "rename") {
      const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
      if (!displayName || displayName.length < 1 || displayName.length > 100) {
        return NextResponse.json(
          { error: "Display name must be between 1 and 100 characters." },
          { status: 400 }
        );
      }
      const oldName = resume.displayName;
      resume.displayName = displayName;
      await resume.save();

      await AuditLog.create({
        actor: new mongoose.Types.ObjectId(userId),
        action: "update",
        entityType: "Resume",
        entityId: resume._id,
        diff: { displayName: { before: oldName, after: displayName } },
      });

      return NextResponse.json({ success: true, resumeId: resume._id, displayName });
    }

    // Default: set_active
    await Resume.updateMany(
      { user: userId },
      { $set: { isActive: false } }
    );

    resume.isActive = true;
    await resume.save();

    await AuditLog.create({
      actor: new mongoose.Types.ObjectId(userId),
      action: "update",
      entityType: "Resume",
      entityId: resume._id,
      diff: { isActive: { before: false, after: true } },
    });

    return NextResponse.json({ success: true, resumeId: resume._id });
  } catch (error) {
    console.error("[Resume PATCH API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }
    const userId = session.user.id;
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid resume ID." }, { status: 400 });
    }

    await connectDB();

    const resume = await Resume.findOne({ _id: id, user: userId });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found or access denied." }, { status: 404 });
    }

    // Note: Deleting the last/only resume IS permitted — this is the required
    // "replace" flow (delete old, then upload new). No permanent guard is applied.

    const wasActive = resume.isActive;
    await Resume.findByIdAndDelete(id);

    // Auto-activate another resume if the deleted one was active
    if (wasActive) {
      const mostRecent = await Resume.findOne({ user: userId, status: "clean" }).sort({ createdAt: -1 });
      if (mostRecent) {
        mostRecent.isActive = true;
        await mostRecent.save();
      }
    }

    // Cleanup: remove this user's personalized answers tied to the deleted resume
    await PersonalizedAnswer.deleteMany({ user: userId, resumeContentHash: resume.contentHash });

    // Cleanup: remove the shared analysis only if no other resume (any user) reuses it
    const otherResumes = await Resume.countDocuments({ contentHash: resume.contentHash, _id: { $ne: resume._id } });
    if (otherResumes === 0) {
      await ResumeAnalysis.deleteOne({ contentHash: resume.contentHash });
    }

    await AuditLog.create({
      actor: new mongoose.Types.ObjectId(userId),
      action: "delete",
      entityType: "Resume",
      entityId: resume._id,
      diff: { filename: resume.originalFilename, wasActive },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("[Resume DELETE API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
