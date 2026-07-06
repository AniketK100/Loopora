/**
 * Questions List & Create API Route
 *
 * GET /api/questions — Retrieve list of questions (filtered, paginated, searchable, light fields)
 * POST /api/questions — Create a new question (validates, sanitizes, normalizes embeds)
 *
 * @route /api/questions
 * @see 06_Implementation_Plan_Build_Order.md Phase 2 — Core CRUD API routes
 * @see 05_Backend_Schema_Data_Auth.md §4 — Denormalization & Performance
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { questionCreateSchema } from "@/lib/validators";
import { normalizeVideoUrl } from "@/lib/embed/normalize";
import { sanitizeAnswerHtml } from "@/lib/utils/sanitize";
import { requireRole } from "@/lib/auth/rbac";
import { ApiResponse } from "@/types";

/**
 * GET /api/questions
 * Retrieves a list of questions with filtering, search, and pagination.
 * Excludes heavy fields ('answer.detailed' and 'videos') by default to optimize LCP.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const categoryQuery = searchParams.get("category"); // Can be Category ID or Category slug
    const difficulty = searchParams.get("difficulty");
    const hasVideo = searchParams.get("hasVideo");
    const searchQ = searchParams.get("q");
    const includeDrafts = searchParams.get("admin") === "true";
    
    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20")));

    const query: Record<string, unknown> = {};

    // 1. Gating draft questions for public visitors
    if (!includeDrafts) {
      query.isPublished = true;
    }

    // 2. Filter by Category (resolve slug to ID if needed)
    if (categoryQuery) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryQuery);
      if (isObjectId) {
        query.category = categoryQuery;
      } else {
        const cat = await Category.findOne({ slug: categoryQuery.toLowerCase() });
        if (cat) {
          query.category = cat._id;
        } else {
          // Category slug not found, return empty array immediately
          return NextResponse.json(
            {
              success: true,
              data: [],
              pagination: { total: 0, page, limit, totalPages: 0, hasMore: false },
            },
            { status: 200 }
          );
        }
      }
    }

    // 3. Filter by Difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // 4. Filter by Video Presence
    if (hasVideo === "true") {
      query.videos = { $exists: true, $not: { $size: 0 } };
    } else if (hasVideo === "false") {
      query.$or = [{ videos: { $exists: false } }, { videos: { $size: 0 } }];
    }

    // 5. Full-Text Search
    if (searchQ) {
      query.$text = { $search: searchQ };
    }

    // 6. DB Query Optimization: only fetch light fields needed for lists
    const selectFields = "category slug question answer.short difficulty frequencyRank tags isPremium isPublished viewCount videos";
    
    let dbQuery = Question.find(query)
      .select(selectFields)
      .populate("category", "name slug type");

    // Apply sorting
    if (searchQ) {
      // Sort by text search relevance score if searching
      dbQuery = dbQuery.sort({ score: { $meta: "textScore" } });
    } else {
      // Sort by frequencyRank (lower rank = more frequently asked) then newest
      dbQuery = dbQuery.sort({ frequencyRank: 1, createdAt: -1 });
    }

    // Run query with pagination
    const total = await Question.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    
    const rawQuestions = await dbQuery.skip(skip).limit(limit).lean();

    // Map to include lightweight custom boolean checks like hasVideo/videoCount
    const questions = rawQuestions.map((q) => {
      const videoCount = q.videos?.length || 0;
      return {
        ...q,
        hasVideo: videoCount > 0,
        videoCount,
        // Remove videos array from the public list response to optimize payload
        videos: undefined,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: questions,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/questions
 * Creates a new question.
 * Normalizes pasted video URLs and sanitizes the rich-text detailed answer.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Enforce RBAC
    const rbac = await requireRole(["admin", "editor"]);
    if (!rbac.authorized) {
      return NextResponse.json(
        { success: false, error: rbac.error },
        { status: rbac.status }
      );
    }

    await connectDB();

    const body = await request.json();
    const result = questionCreateSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const {
      category,
      slug,
      question,
      answer,
      videos,
      difficulty,
      frequencyRank,
      tags,
      isPremium,
      isPublished,
    } = result.data;

    // Check compound unique index { category, slug }
    const existing = await Question.findOne({ category, slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A question with this slug already exists under this category" },
        { status: 409 }
      );
    }

    // Sanitize detailed answer HTML
    const sanitizedDetailed = sanitizeAnswerHtml(answer.detailed);

    // Normalize and allowlist validate every pasted video URL
    const normalizedVideos = (videos || []).map((video) => {
      try {
        const normalized = normalizeVideoUrl(video.url);
        return {
          label: video.label,
          provider: normalized.provider,
          url: normalized.url,
          embedUrl: normalized.embedUrl,
          order: video.order,
        };
      } catch (err) {
        throw new Error(`Video URL '${video.url}' is invalid: ${(err as Error).message}`);
      }
    });

    const newQuestion = await Question.create({
      category,
      slug,
      question,
      answer: {
        short: answer.short,
        detailed: sanitizedDetailed,
        example: answer.example,
      },
      videos: normalizedVideos,
      difficulty,
      frequencyRank,
      tags,
      isPremium,
      isPublished,
    });

    const response: ApiResponse<typeof newQuestion> = {
      success: true,
      data: newQuestion,
      message: "Question created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
