/**
 * Categories List & Create API Route
 *
 * GET /api/categories — Lists categories, sorted by manual order
 * POST /api/categories — Creates a new category (Zod validated)
 *
 * @route /api/categories
 * @see 06_Implementation_Plan_Build_Order.md Phase 2 — Core CRUD API routes
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { categoryCreateSchema } from "@/lib/validators";
import { requireRole } from "@/lib/auth/rbac";
import { ApiResponse } from "@/types";

/**
 * GET /api/categories
 * Retrieves all categories.
 * By default, returns only published categories for visitors.
 * Admin view (fetching draft categories) can be enabled via query parameter.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get("admin") === "true";

    const filter: Record<string, unknown> = {};
    if (!includeDrafts) {
      filter.isPublished = true;
    }

    const categories = await Category.find(filter).sort({ order: 1 });

    const response: ApiResponse<typeof categories> = {
      success: true,
      data: categories,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Categories GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * Creates a new category.
 * Enforces Zod validation on schema insertion.
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
    const result = categoryCreateSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const { name, slug, description, icon, type, order, isPublished } = result.data;

    // Check slug collision
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Category slug is already taken" },
        { status: 409 }
      );
    }

    const category = await Category.create({
      name,
      slug,
      description,
      icon,
      type,
      order,
      isPublished,
    });

    const response: ApiResponse<typeof category> = {
      success: true,
      data: category,
      message: "Category created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("[Categories POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
