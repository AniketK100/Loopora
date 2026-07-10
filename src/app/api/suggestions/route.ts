/**
 * Public Suggestions (POST) API Route
 *
 * POST /api/suggestions — Submit an interview question suggestion or feedback.
 * Guarded by database-backed IP rate limiter (5 submissions/min/IP) to prevent spam.
 *
 * @route /api/suggestions
 * @see 05_Backend_Schema_Data_Auth.md §2.7 — Suggestion Schema
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Suggestion } from "@/lib/db/models/Suggestion";
import { suggestionCreateSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/auth/rateLimit";
import { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // 1. Apply rate limiting (5 hits / minute / IP)
    const ipLimit = await checkRateLimit(request, "public-suggestions", 5, 60000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many feedback submissions. Please wait a minute before trying again." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": ipLimit.reset.toISOString(),
          },
        }
      );
    }

    await connectDB();

    const body = await request.json();
    const result = suggestionCreateSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const validated = result.data;

    // Create suggestion document in DB
    const newSuggestion = await Suggestion.create({
      questionText: validated.questionText,
      categorySuggestion: validated.categorySuggestion || "",
      notes: validated.notes || "",
      status: "new",
    });

    const response: ApiResponse<typeof newSuggestion> = {
      success: true,
      data: newSuggestion,
      message: "Thank you! Your suggestion has been recorded and queued for administrative review.",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("[Suggestions POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
