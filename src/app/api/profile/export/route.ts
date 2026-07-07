/**
 * Export User Personal Data API Route
 *
 * GET /api/profile/export — Downloads a JSON dump of the user's personal details,
 * bookmarks, and practice history (DPDP data portability compliance).
 *
 * @route /api/profile/export
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";

interface PopulatedQuestion {
  question: string;
  slug: string;
  difficulty: string;
  tags: string[];
  category?: {
    name: string;
    slug: string;
  } | null;
}

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select("-passwordHash")
      .populate({
        path: "bookmarks",
        select: "question slug difficulty tags",
        populate: { path: "category", select: "name slug" },
      })
      .populate({
        path: "practiced",
        select: "question slug difficulty tags",
        populate: { path: "category", select: "name slug" },
      });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User profile not found." },
        { status: 404 }
      );
    }

    const favoritesList = user.bookmarks as unknown as PopulatedQuestion[];
    const practicedList = user.practiced as unknown as PopulatedQuestion[];

    // Format output data
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      accountInfo: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        role: user.role,
        isPremium: user.isPremium,
        createdAt: user.createdAt,
      },
      favorites: favoritesList.map((q) => ({
        question: q.question,
        slug: q.slug,
        difficulty: q.difficulty,
        tags: q.tags,
        category: q.category?.name || "Uncategorized",
        link: `/interview/${q.category?.slug}/${q.slug}`,
      })),
      practicedHistory: practicedList.map((q) => ({
        question: q.question,
        slug: q.slug,
        difficulty: q.difficulty,
        tags: q.tags,
        category: q.category?.name || "Uncategorized",
        link: `/interview/${q.category?.slug}/${q.slug}`,
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="loopora-user-data-${user.name.replace(/\s+/g, "_")}.json"`,
      },
    });
  } catch (error) {
    console.error("[Profile Export API] Error exporting user data:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
