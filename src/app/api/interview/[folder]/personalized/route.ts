/**
 * Personalized Interview Questions API Route
 *
 * GET /api/interview/[folder]/personalized?resumeId=...
 *
 * Personalizes interview answers for a specific resume in the chosen folder.
 * Enforces a hard cap of 2 folders per resume, and limits normal users to the
 * top 10 questions sorted by frequencyRank.
 *
 * Cache key: user + question + resumeContentHash + modelVersion
 * Classification gate: resume must be classified as resume with confidence >= 0.75
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Category } from "@/lib/db/models/Category";
import { Question } from "@/lib/db/models/Question";
import { User } from "@/lib/db/models/User";
import { Resume } from "@/lib/db/models/Resume";
import { PersonalizedAnswer } from "@/lib/db/models/PersonalizedAnswer";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { getAIService } from "@/lib/ai/provider";

const AI_MODEL_VERSION = "v1";

interface RouteParams {
  params: Promise<{ folder: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }
    const userId = session.user.id;

    const { folder } = await params;
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get("resumeId");

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resumeId parameter." }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return NextResponse.json({ error: "Invalid resumeId format." }, { status: 400 });
    }

    await connectDB();

    // 1. Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // 2. Fetch Category/Folder by slug or ID
    const isObjectId = mongoose.Types.ObjectId.isValid(folder);
    const category = isObjectId
      ? await Category.findById(folder)
      : await Category.findOne({ slug: folder.toLowerCase() });

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    // 3. Fetch user's Resume and verify ownership
    const resume = await Resume.findOne({ _id: resumeId, user: userId });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found or access denied." }, { status: 404 });
    }

    // 4. Classification gate — resume must be classified
    if (!resume.isClassifiedAsResume) {
      return NextResponse.json(
        {
          error: "classification_failed",
          message: "This resume has not been validated. Please re-upload a valid resume.",
        },
        { status: 400 }
      );
    }

    // 5. Enforce 2-folder cap server-side
    const isFolderSelected = user.selectedFolders.some(
      (id) => id.toString() === category._id.toString()
    );

    if (!isFolderSelected) {
      if (user.selectedFolders.length >= 2) {
        return NextResponse.json(
          {
            error:
              "Folder personalization limit reached. You can personalize up to 2 interview folders.",
          },
          { status: 400 }
        );
      }
      user.selectedFolders.push(category._id as mongoose.Types.ObjectId);
      await user.save();
    }

    // 6. Fetch questions in this category
    let questionsQuery = Question.find({ category: category._id, isPublished: true });

    if (user.isPremium) {
      questionsQuery = questionsQuery.sort({ frequencyRank: -1 });
    } else {
      questionsQuery = questionsQuery.sort({ frequencyRank: -1 }).limit(10);
    }

    const questions = await questionsQuery;

    // 7. Resolve cached or new personalized answers with controlled concurrency
    const aiService = getAIService();
    const CONCURRENCY_LIMIT = 4;

    // Phase 1: Check cache for all questions upfront (parallel DB queries)
    const cacheChecks = await Promise.all(
      questions.map(async (q) => {
        const cached = await PersonalizedAnswer.findOne({
          user: userId,
          question: q._id,
          resumeContentHash: resume.contentHash,
          modelVersion: AI_MODEL_VERSION,
        });
        return { question: q, cached };
      })
    );

    // Phase 2: Generate only uncached answers with concurrency control
    const uncached = cacheChecks.filter((c) => !c.cached);
    const generationResults = new Map<string, string>();

    // Process uncached questions in batches of CONCURRENCY_LIMIT
    for (let i = 0; i < uncached.length; i += CONCURRENCY_LIMIT) {
      const batch = uncached.slice(i, i + CONCURRENCY_LIMIT);
      const batchResults = await Promise.allSettled(
        batch.map(async ({ question: q }) => {
          const personalizedText = await aiService.generatePersonalizedAnswer(
            q.question,
            q.answer.detailed,
            resume.extractedText
          );

          const created = await PersonalizedAnswer.create({
            user: userId,
            question: q._id,
            resumeContentHash: resume.contentHash,
            modelVersion: AI_MODEL_VERSION,
            personalizedText,
          });

          await AuditLog.create({
            actor: new mongoose.Types.ObjectId(userId),
            action: "create",
            entityType: "ResumeAnalysis",
            entityId: created._id,
            diff: { questionId: q._id, resumeId: resume._id, categoryId: category._id },
          });

          return { questionId: q._id.toString(), personalizedText };
        })
      );

      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          generationResults.set(result.value.questionId, result.value.personalizedText);
        }
      }
    }

    // Phase 3: Assemble final result
    const result = cacheChecks.map(({ question: q, cached }) => ({
      questionId: q._id,
      slug: q.slug,
      question: q.question,
      sampleAnswer: q.answer.detailed,
      personalizedAnswer:
        cached?.personalizedText ||
        generationResults.get(q._id.toString()) ||
        q.answer.detailed, // fallback to sample if generation failed
    }));

    return NextResponse.json({
      success: true,
      category: category.name,
      isPremium: user.isPremium,
      questions: result,
    });
  } catch (error) {
    console.error("[Personalized Answers GET API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
