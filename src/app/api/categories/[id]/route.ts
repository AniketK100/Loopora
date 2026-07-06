/**
 * Category Resource (GET, PATCH, DELETE) API Route
 *
 * GET /api/categories/[id] — Fetch a category by ID or slug
 * PATCH /api/categories/[id] — Update a category by ID (Zod validated)
 * DELETE /api/categories/[id] — Delete a category and associated questions
 *
 * @route /api/categories/[id]
 * @see 06_Implementation_Plan_Build_Order.md Phase 2 — Core CRUD API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { categoryUpdateSchema, objectIdSchema } from "@/lib/validators";
import { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/categories/[id]
 * Fetch a single category by MongoDB ID or slug string.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    // Check if ID is a valid Mongo ObjectId, otherwise search by slug
    const isObjectId = objectIdSchema.safeParse(id).success;
    const category = isObjectId
      ? await Category.findById(id)
      : await Category.findOne({ slug: id.toLowerCase() });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof category> = {
      success: true,
      data: category,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/categories/[id]
 * Updates a category.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    if (!objectIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: "Invalid Category ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = categoryUpdateSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    // Check slug collision if slug is updated
    if (result.data.slug) {
      const existing = await Category.findOne({
        slug: result.data.slug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: "Category slug is already taken" },
          { status: 409 }
        );
      }
    }

    const category = await Category.findByIdAndUpdate(id, result.data, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof category> = {
      success: true,
      data: category,
      message: "Category updated successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/categories/[id]
 * Deletes a category. Also cascadingly deletes all questions under it.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    if (!objectIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: "Invalid Category ID format" },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    // Cascading delete of questions
    const deleteCount = await Question.deleteMany({ category: id });

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: `Category deleted successfully. Cascaded delete of ${deleteCount.deletedCount} questions.`,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
