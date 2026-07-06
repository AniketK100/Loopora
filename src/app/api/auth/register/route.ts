/**
 * User Registration API Endpoint
 *
 * POST /api/auth/register — Signs up a new user, hashes password, and creates account
 *
 * @route /api/auth/register
 * @see 02_TRD.md §4 — Security Requirements (Auth & Hashed passwords)
 * @see 03_App_Flow.md §4 — Auth Flow
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { signupSchema } from "@/lib/validators";
import { checkRateLimit } from "@/lib/auth/rateLimit";
import { ApiResponse } from "@/types";

/**
 * POST /api/auth/register
 * Handles user sign-up, password hashing, and DB record insertion.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Apply rate limiting (10 signup requests per minute per IP)
    const rateLimit = await checkRateLimit(request, "auth:register", 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many sign up attempts. Please try again in a minute.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": rateLimit.reset.toISOString(),
          },
        }
      );
    }

    await connectDB();

    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((issue) => issue.message).join(", ");
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // 1. Verify if user email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    // 2. Hash password with bcryptjs (cost factor 10-12 per TRD/Auth Design)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Create the new user with default 'user' role
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      authProvider: "credentials",
      role: "user", // Enforced server-side, no self-service admin signup
      isPremium: false, // Default is free tier
    });

    const response: ApiResponse<{ id: string; name: string; email: string }> = {
      success: true,
      data: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
      },
      message: "Account registered successfully. You can now log in.",
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
