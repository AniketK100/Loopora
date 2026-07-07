/**
 * Get User Practiced Questions API Route
 *
 * GET /api/profile/practiced?page=1&limit=20 — Retrieve paginated practiced questions for user
 *
 * @route /api/profile/practiced
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { Question } from "@/lib/db/models/Question";
import { PaginatedResponse, QuestionListItem } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    const total = user.practiced.length;
    // Slice practiced array for in-memory pagination
    const paginatedIds = user.practiced.slice(skip, skip + limit);

    // Retrieve full questions and populate their categories
    const questionsRaw = await Question.find({ _id: { $in: paginatedIds } })
      .populate("category", "slug name");

    // Map questions to standard shape
    const mappedQuestions: QuestionListItem[] = questionsRaw.map((qDoc) => {
      const cat = qDoc.category as unknown as { _id?: { toString: () => string }; slug?: string; name?: string } | null;
      return {
        _id: qDoc._id.toString(),
        category: cat?._id?.toString() || qDoc.category.toString(),
        categorySlug: cat?.slug || "",
        categoryName: cat?.name || "",
        slug: qDoc.slug,
        question: qDoc.question,
        answer: { short: qDoc.answer?.short },
        difficulty: qDoc.difficulty,
        frequencyRank: qDoc.frequencyRank,
        tags: qDoc.tags,
        isPremium: qDoc.isPremium,
        isPublished: qDoc.isPublished,
        viewCount: qDoc.viewCount || 0,
        hasVideo: qDoc.videos && qDoc.videos.length > 0,
        videoCount: qDoc.videos ? qDoc.videos.length : 0,
      };
    });

    // Re-sort questions matching practiced array order
    const data = paginatedIds
      .map((id) => mappedQuestions.find((q) => q._id === id.toString()))
      .filter((q): q is QuestionListItem => !!q);

    const response: PaginatedResponse<QuestionListItem> = {
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + data.length < total,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Practiced GET API] Error fetching user practiced questions:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
