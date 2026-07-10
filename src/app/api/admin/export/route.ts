/**
 * Admin Content Export API Route (Database Backup)
 *
 * GET /api/admin/export — Downloads a complete structured JSON dump of
 * categories, questions, and suggestion models (Admin only).
 *
 * @route /api/admin/export
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { Suggestion } from "@/lib/db/models/Suggestion";
import { requireRole } from "@/lib/auth/rbac";

export async function GET() {
  try {
    // 1. Enforce admin role
    const rbac = await requireRole(["admin"]);
    if (!rbac.authorized) {
      return NextResponse.json(
        { success: false, error: rbac.error },
        { status: rbac.status }
      );
    }

    await connectDB();

    // 2. Query collections in parallel
    const [categories, questions, suggestions] = await Promise.all([
      Category.find().sort({ name: 1 }),
      Question.find().sort({ question: 1 }),
      Suggestion.find().sort({ createdAt: -1 }),
    ]);

    const backupPayload = {
      backupTimestamp: new Date().toISOString(),
      metadata: {
        totalCategories: categories.length,
        totalQuestions: questions.length,
        totalSuggestions: suggestions.length,
      },
      categories,
      questions,
      suggestions,
    };

    return new NextResponse(JSON.stringify(backupPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=loopora_system_backup.json",
      },
    });
  } catch (error) {
    console.error("[Admin Export] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
