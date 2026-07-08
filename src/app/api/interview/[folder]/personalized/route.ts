/**
 * Personalized Interview Questions API Route
 *
 * GET /api/interview/[folder]/personalized?resumeId=...
 *
 * Personalizes interview answers for a specific resume in the chosen folder.
 * Enforces a hard cap of 2 folders per resume, and limits normal users to the
 * top 10 questions sorted by frequencyRank.
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

    // 1. Fetch user to verify subscription status and selected folders limit
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

    // 4. Enforce 2-folder cap server-side
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
      // Add folder to user's selected list
      user.selectedFolders.push(category._id as mongoose.Types.ObjectId);
      await user.save();
    }

    // 5. Fetch questions in this category
    // Free users: top 10 questions sorted by frequencyRank DESC
    // Premium users: all published questions in the category
    let questionsQuery = Question.find({ category: category._id, isPublished: true });
    
    if (user.isPremium) {
      questionsQuery = questionsQuery.sort({ frequencyRank: -1 });
    } else {
      questionsQuery = questionsQuery.sort({ frequencyRank: -1 }).limit(10);
    }

    const questions = await questionsQuery;

    // 6. Resolve cached or new personalized answers for each question
    const aiService = getAIService();
    const result = [];

    for (const q of questions) {
      // Look up cached personalization
      let cached = await PersonalizedAnswer.findOne({
        user: userId,
        question: q._id,
        resumeContentHash: resume.contentHash,
      });

      let personalizedText = "";

      if (cached) {
        personalizedText = cached.personalizedText;
      } else {
        // Cache miss: generate and persist personalization
        try {
          personalizedText = await aiService.generatePersonalizedAnswer(
            q.question,
            q.answer.detailed,
            resume.extractedText
          );

          cached = await PersonalizedAnswer.create({
            user: userId,
            question: q._id,
            resumeContentHash: resume.contentHash,
            personalizedText,
          });

          await AuditLog.create({
            actor: new mongoose.Types.ObjectId(userId),
            action: "create",
            entityType: "ResumeAnalysis", // Tracks personalization AI spend
            entityId: cached._id,
            diff: { questionId: q._id, resumeId: resume._id, categoryId: category._id },
          });
        } catch (err) {
          console.error(`[Personalization API] AI generation failed for question ${q._id}:`, err);
          // Fallback to sample answer if AI fails so the page loads successfully
          personalizedText = q.answer.detailed;
        }
      }

      result.push({
        questionId: q._id,
        slug: q.slug,
        question: q.question,
        sampleAnswer: q.answer.detailed,
        personalizedAnswer: personalizedText,
      });
    }

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
