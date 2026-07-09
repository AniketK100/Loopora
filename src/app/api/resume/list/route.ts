/**
 * Resume List API Route
 *
 * GET /api/resume/list — Fetch all resumes for the authenticated user
 * Returns resume metadata, classification scores, and quality scores.
 *
 * @route GET /api/resume/list
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Resume } from "@/lib/db/models/Resume";
import { ResumeAnalysis } from "@/lib/db/models/ResumeAnalysis";
import { User } from "@/lib/db/models/User";

const FREE_MAX_RESUMES = 1;
const PREMIUM_MAX_RESUMES = 3;

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }
    const userId = session.user.id;

    await connectDB();

    const resumes = await Resume.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("-extractedText");

    const user = await User.findById(userId).select("isPremium");
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const maxResumes = user.isPremium ? PREMIUM_MAX_RESUMES : FREE_MAX_RESUMES;

    // Attach quality data from ResumeAnalysis
    const enrichedResumes = await Promise.all(
      resumes.map(async (resume) => {
        const analysis = await ResumeAnalysis.findOne({ contentHash: resume.contentHash })
          .select("classification quality");
        return {
          _id: resume._id,
          displayName: resume.displayName || resume.originalFilename,
          originalFilename: resume.originalFilename,
          pageCount: resume.pageCount,
          status: resume.status,
          isActive: resume.isActive,
          classificationScore: resume.classificationScore,
          isClassifiedAsResume: resume.isClassifiedAsResume,
          qualityScore: resume.qualityScore,
          missingSections: resume.missingSections,
          suggestions: resume.suggestions,
          createdAt: resume.createdAt,
          classification: analysis?.classification || null,
          quality: analysis?.quality || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      resumes: enrichedResumes,
      maxResumes,
      currentCount: resumes.length,
      isPremium: user.isPremium,
    });
  } catch (error) {
    console.error("[Resume List API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
