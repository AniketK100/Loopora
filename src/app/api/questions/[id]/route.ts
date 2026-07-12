/**
 * Question Resource (GET, PATCH, DELETE) API Route
 *
 * GET /api/questions/[id] — Fetch detailed question by ID or slug combination
 * PATCH /api/questions/[id] — Update question details (Zod validated, normalized, sanitized)
 * DELETE /api/questions/[id] — Delete a question
 *
 * @route /api/questions/[id]
 * @see 06_Implementation_Plan_Build_Order.md Phase 2 — Core CRUD API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { questionUpdateSchema, objectIdSchema } from "@/lib/validators";
import { normalizeVideoUrl } from "@/lib/embed/normalize";
import { sanitizeAnswerHtml } from "@/lib/utils/sanitize";
import { requireRole } from "@/lib/auth/rbac";
import { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/questions/[id]
 * Retrieves the full detail of a question.
 *
 * Supports lookup by:
 * 1. MongoDB ObjectId (e.g. /api/questions/60d5ec4b1234567890abcdef)
 * 2. Compound category-slug:question-slug (e.g. /api/questions/hr:tell-me-about-yourself)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    let question = null;

    if (objectIdSchema.safeParse(id).success) {
      question = await Question.findById(id).populate("category", "name slug type");
    } else if (id.includes(":")) {
      const [categorySlug, questionSlug] = id.split(":");
      const category = await Category.findOne({ slug: categorySlug.toLowerCase() });
      
      if (category) {
        question = await Question.findOne({
          category: category._id,
          slug: questionSlug.toLowerCase(),
        }).populate("category", "name slug type");
      }
    }

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    // Increment view counter asynchronously
    Question.findByIdAndUpdate(question._id, { $inc: { viewCount: 1 } }).catch(
      (err) => console.error("[DB] Failed to increment viewCount:", err)
    );

    // Premium content gate — free users get a preview only
    if (question.isPremium) {
      const session = await auth();
      const isPremiumUser = !!(session?.user && (session.user as { isPremium?: boolean }).isPremium);

      if (!isPremiumUser) {
        const questionObj = question.toObject();
        return NextResponse.json({
          success: true,
          data: {
            _id: questionObj._id,
            category: questionObj.category,
            slug: questionObj.slug,
            question: questionObj.question,
            difficulty: questionObj.difficulty,
            tags: questionObj.tags,
            isPremium: true,
            viewCount: questionObj.viewCount,
            answer: {
              short: questionObj.answer?.short || null,
            },
          },
        }, { status: 200 });
      }
    }

    const response: ApiResponse<typeof question> = {
      success: true,
      data: question,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Questions GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/questions/[id]
 * Updates a question by ID.
 * Validates, normalizes, and sanitizes input.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const { id } = await params;

    if (!objectIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: "Invalid Question ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = questionUpdateSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const updates = { ...result.data };

    // 1. Check compound unique index if category or slug is changing
    if (updates.category || updates.slug) {
      const current = await Question.findById(id);
      if (!current) {
        return NextResponse.json(
          { success: false, error: "Question not found" },
          { status: 404 }
        );
      }

      const checkCategory = updates.category || current.category;
      const checkSlug = updates.slug || current.slug;

      const existing = await Question.findOne({
        category: checkCategory,
        slug: checkSlug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: "A question with this slug already exists under this category",
          },
          { status: 409 }
        );
      }
    }

    // 2. Sanitize detailed answer if updated
    if (updates.answer?.detailed) {
      updates.answer.detailed = sanitizeAnswerHtml(updates.answer.detailed);
    }

    // 3. Normalize video URLs if updated
    if (updates.videos) {
      updates.videos = (updates.videos as { label: string; url: string; order: number }[]).map((video) => {
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
    }

    const question = await Question.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    // Keep ISR-cached public pages fresh so an edited video appears
    // immediately (no 1-hour stale window).
    const patchedCat = await Category.findById(question.category);
    if (patchedCat) {
      revalidatePath(`/interview/${patchedCat.slug}`);
      revalidatePath(`/interview/${patchedCat.slug}/${question.slug}`);
    }

    const response: ApiResponse<typeof question> = {
      success: true,
      data: question,
      message: "Question updated successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Questions PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/questions/[id]
 * Deletes a question by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Enforce RBAC — admin-only for destructive operations
    const rbac = await requireRole(["admin"]);
    if (!rbac.authorized) {
      return NextResponse.json(
        { success: false, error: rbac.error },
        { status: rbac.status }
      );
    }

    await connectDB();
    const { id } = await params;

    if (!objectIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: "Invalid Question ID format" },
        { status: 400 }
      );
    }

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: "Question deleted successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Questions DELETE] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
