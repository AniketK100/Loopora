/**
 * Bulk Import (POST) API Route
 *
 * POST /api/bulk-import — Validate and import categories and questions in bulk.
 * Enforces admin-only authorization.
 *
 * @route /api/bulk-import
 * @see 06_Implementation_Plan_Build_Order.md Phase 4 — Admin Dashboard (CMS)
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { categoryCreateSchema, questionCreateSchema } from "@/lib/validators";
import { requireRole } from "@/lib/auth/rbac";
import { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce RBAC — Admin only
    const rbac = await requireRole(["admin"]);
    if (!rbac.authorized) {
      return NextResponse.json(
        { success: false, error: rbac.error },
        { status: rbac.status }
      );
    }

    await connectDB();

    const body = await request.json();
    const { categories = [], questions = [] } = body;

    const results = {
      categoriesCreated: 0,
      categoriesSkipped: 0,
      questionsCreated: 0,
      questionsSkipped: 0,
      errors: [] as string[],
    };

    // --- 1. Import Categories ---
    // Maps slug to MongoDB ObjectId for lookup during question import
    const categorySlugMap: Record<string, string> = {};

    // Load existing categories into map first
    const existingCategories = await Category.find({}, "slug");
    existingCategories.forEach((cat) => {
      categorySlugMap[cat.slug] = cat._id.toString();
    });

    for (let i = 0; i < categories.length; i++) {
      const catData = categories[i];
      
      // Auto-validate via Zod Category Create schema
      const result = categoryCreateSchema.safeParse(catData);
      if (!result.success) {
        results.errors.push(
          `Category #${i + 1} (${catData.name || "Unknown"}): ${result.error.issues
            .map((issue) => issue.message)
            .join(", ")}`
        );
        results.categoriesSkipped++;
        continue;
      }

      const validated = result.data;

      // Check duplicate slug
      if (categorySlugMap[validated.slug]) {
        results.categoriesSkipped++;
        continue; // Already exists
      }

      try {
        const newCat = await Category.create(validated);
        categorySlugMap[newCat.slug] = newCat._id.toString();
        results.categoriesCreated++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Database write failure";
        results.errors.push(`Category "${validated.name}": ${msg}`);
        results.categoriesSkipped++;
      }
    }

    // --- 2. Import Questions ---
    for (let i = 0; i < questions.length; i++) {
      const qData = questions[i];
      const { categorySlug, ...rest } = qData;

      if (!categorySlug) {
        results.errors.push(`Question #${i + 1} ("${qData.question || "Unknown"}"): Missing categorySlug reference.`);
        results.questionsSkipped++;
        continue;
      }

      // Lookup target category ID
      const categoryId = categorySlugMap[categorySlug.toLowerCase().trim()];
      if (!categoryId) {
        results.errors.push(
          `Question #${i + 1} ("${qData.question || "Unknown"}"): Referenced category slug "${categorySlug}" does not exist.`
        );
        results.questionsSkipped++;
        continue;
      }

      // Re-map category Slug to ObjectId to validate via Zod schema
      const fullQPayload = {
        ...rest,
        category: categoryId,
      };

      const result = questionCreateSchema.safeParse(fullQPayload);
      if (!result.success) {
        results.errors.push(
          `Question #${i + 1} ("${qData.question || "Unknown"}"): ${result.error.issues
            .map((issue) => issue.message)
            .join(", ")}`
        );
        results.questionsSkipped++;
        continue;
      }

      const validated = result.data;

      // Check slug collision
      const exists = await Question.findOne({ slug: validated.slug });
      if (exists) {
        results.questionsSkipped++;
        continue; // Already exists
      }

      try {
        await Question.create(validated);
        results.questionsCreated++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Database write failure";
        results.errors.push(`Question "${validated.slug}": ${msg}`);
        results.questionsSkipped++;
      }
    }

    const response: ApiResponse<typeof results> = {
      success: true,
      data: results,
      message:
        `Bulk import complete. ` +
        `Categories: ${results.categoriesCreated} created, ${results.categoriesSkipped} skipped. ` +
        `Questions: ${results.questionsCreated} created, ${results.questionsSkipped} skipped.`,
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
