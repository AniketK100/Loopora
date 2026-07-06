/**
 * Feature Flags (PATCH) API Route
 *
 * PATCH /api/flags/[id] — Update/Toggle a feature flag's settings (Zod validated)
 *
 * @route /api/flags/[id]
 * @see 05_Backend_Schema_Data_Auth.md §2 — Mongoose Schemas (FeatureFlag)
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { FeatureFlag } from "@/lib/db/models/FeatureFlag";
import { featureFlagUpdateSchema, objectIdSchema } from "@/lib/validators";
import { requireRole } from "@/lib/auth/rbac";
import { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
    const { id } = await params;

    // Validate MongoDB ID format
    if (!objectIdSchema.safeParse(id).success) {
      return NextResponse.json(
        { success: false, error: "Invalid flag ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = featureFlagUpdateSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const updatedFlag = await FeatureFlag.findByIdAndUpdate(
      id,
      { $set: result.data },
      { returnDocument: "after", runValidators: true }
    );

    if (!updatedFlag) {
      return NextResponse.json(
        { success: false, error: "Feature flag not found" },
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof updatedFlag> = {
      success: true,
      data: updatedFlag,
      message: "Feature flag updated successfully.",
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
