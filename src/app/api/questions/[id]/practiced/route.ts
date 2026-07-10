/**
 * Toggle Question Practiced State API Route
 *
 * POST /api/questions/[id]/practiced — Toggle practiced status for authenticated user
 *
 * @route /api/questions/[id]/practiced
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
        { success: false, error: "Unauthorized: Please log in to track practiced questions." },
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

    // Toggle practiced item
    const targetId = id.toLowerCase();
    const index = user.practiced.findIndex((pId) => pId.toString().toLowerCase() === targetId);
    let isPracticed = false;

    if (index > -1) {
      user.practiced.splice(index, 1);
    } else {
      user.practiced.push(new mongoose.Types.ObjectId(id));
      isPracticed = true;
    }

    await user.save();

    return NextResponse.json(
      {
        success: true,
        data: { isPracticed },
        message: isPracticed
          ? "Question marked as practiced."
          : "Question unmarked from practiced.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Practiced API] Error toggling practiced status:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
