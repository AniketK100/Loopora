/**
 * Toggle Question Bookmark (Favorite) API Route
 *
 * POST /api/questions/[id]/favorite — Toggle bookmark status for authenticated user
 *
 * @route /api/questions/[id]/favorite
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { Question } from "@/lib/db/models/Question";
import { objectIdSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please log in to favorite questions." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!objectIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: "Invalid question ID format." },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify question exists first
    const question = await Question.findById(id);
    if (!question || !question.isPublished) {
      return NextResponse.json(
        { success: false, error: "Question not found or unpublished." },
        { status: 404 }
      );
    }

    // Retrieve user profile
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    // Toggle bookmark item
    const targetId = id.toLowerCase();
    const index = user.bookmarks.findIndex((bId) => bId.toString().toLowerCase() === targetId);
    let isFavorited = false;

    if (index > -1) {
      user.bookmarks.splice(index, 1);
    } else {
      user.bookmarks.push(new mongoose.Types.ObjectId(id));
      isFavorited = true;
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        data: { isFavorited },
        message: isFavorited
          ? "Question pinned to your favorites."
          : "Question removed from your favorites.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Favorite API] Error toggling favorite status:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
