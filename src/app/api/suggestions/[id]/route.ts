/**
 * Suggestions (PATCH) API Route
 *
 * PATCH /api/suggestions/[id] — Mark user question suggestions as reviewed/new.
 *
 * @route /api/suggestions/[id]
 * @see 05_Backend_Schema_Data_Auth.md §2 — Mongoose Schemas (Suggestion)
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Suggestion } from "@/lib/db/models/Suggestion";
import { requireRole } from "@/lib/auth/rbac";
import { objectIdSchema } from "@/lib/validators";
import { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Enforce RBAC — Admin or Editor can manage user suggestions
    const rbac = await requireRole(["admin", "editor"]);
    if (!rbac.authorized) {
      return NextResponse.json(
        { success: false, error: rbac.error },
        { status: rbac.status }
      );
    }

    await connectDB();
    const { id } = await params;

    // Validate ID format
    if (!objectIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: "Invalid suggestion ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["new", "reviewed"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value. Must be 'new' or 'reviewed'." },
        { status: 400 }
      );
    }

    const updatedSuggestion = await Suggestion.findByIdAndUpdate(
      id,
      { $set: { status } },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedSuggestion) {
      return NextResponse.json(
        { success: false, error: "Suggestion not found" },
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof updatedSuggestion> = {
      success: true,
      data: updatedSuggestion,
      message: "Suggestion updated successfully.",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("[Suggestions PATCH] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
