/**
 * Search Questions API Route
 *
 * GET /api/search?q=<query>&page=1&limit=20 — Search across published questions
 *
 * Uses MongoDB text search index for relevance sorting.
 *
 * @route /api/search
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Question } from "@/lib/db/models/Question";
import { PaginatedResponse, QuestionListItem } from "@/types";
import { checkRateLimit } from "@/lib/auth/rateLimit";

export async function GET(request: NextRequest) {
  try {
    const rateLimit = await checkRateLimit(request, "search", 30, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many search requests. Please wait a moment." },
        { status: 429 }
      );
    }

    await connectDB();

    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    if (!q) {
      const paginatedEmpty: PaginatedResponse<QuestionListItem> = {
        success: true,
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasMore: false,
        },
      };
      return NextResponse.json(paginatedEmpty, { status: 200 });
    }

    // Search query object using MongoDB $text operator
    const queryObj = {
      isPublished: true,
      $text: { $search: q },
    };

    // Count total matches
    const total = await Question.countDocuments(queryObj);

    // Retrieve relevance-sorted questions (lightweight projection for list views)
    const questionsRaw = await Question.find(
      queryObj,
      {
        score: { $meta: "textScore" },
        question: 1,
        slug: 1,
        category: 1,
        difficulty: 1,
        frequencyRank: 1,
        tags: 1,
        isPremium: 1,
        isPublished: 1,
        viewCount: 1,
        videos: 1,
        "answer.short": 1,
      }
    )
      .sort({ score: { $meta: "textScore" } })
      .populate("category", "slug name")
      .skip(skip)
      .limit(limit);

    // Map to QuestionListItem format
    const data: QuestionListItem[] = questionsRaw.map((qDoc) => {
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
    console.error("[Search API] Error searching questions:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
