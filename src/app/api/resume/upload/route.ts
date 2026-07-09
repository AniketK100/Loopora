/**
 * Secure Resume Upload API Route
 *
 * Implements a 16-step secure validation, parsing, classification,
 * quality analysis, and caching pipeline.
 *
 * Resume limits: Free=1, Premium=3 (derived from User.isPremium)
 * Classification gate: heuristics must pass AND AI confidence >= 0.75
 *
 * @route POST /api/resume/upload
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import crypto from "crypto";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db/connection";
import { Resume } from "@/lib/db/models/Resume";
import { ResumeAnalysis } from "@/lib/db/models/ResumeAnalysis";
import { AuditLog } from "@/lib/db/models/AuditLog";
import { User } from "@/lib/db/models/User";
import { validateMagicBytes } from "@/lib/validators/fileSniffer";
import { scanContent, scanPdfBuffer } from "@/lib/validators/contentSecurity";
import { extractTextAndPageCount } from "@/lib/utils/resumeParser";
import { classifyByHeuristics } from "@/lib/classification/resumeClassifier";
import { getAIService } from "@/lib/ai/provider";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PAGES = 8;
const CLASSIFICATION_CONFIDENCE_THRESHOLD = 0.75;
const FREE_MAX_RESUMES = 1;
const PREMIUM_MAX_RESUMES = 3;
const AI_MODEL_VERSION = "v1";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function computeSHA256(text: string): string {
  return crypto.createHash("sha256").update(normalizeText(text)).digest("hex");
}

function getMaxResumes(isPremium: boolean): number {
  return isPremium ? PREMIUM_MAX_RESUMES : FREE_MAX_RESUMES;
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authentication
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }
    const userId = session.user.id;

    // Step 2: Content-length header check (5MB max)
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_FILE_SIZE) {
      await connectDB();
      await AuditLog.create({
        actor: new mongoose.Types.ObjectId(userId),
        action: "create",
        entityType: "Resume",
        entityId: new mongoose.Types.ObjectId(userId),
        diff: { error: "Content length exceeds 5MB limit", sizeBytes: contentLength },
      });
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Step 3: Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Missing file in upload payload." }, { status: 400 });
    }

    // Step 4: Size validation
    if (file.size > MAX_FILE_SIZE) {
      await connectDB();
      await AuditLog.create({
        actor: new mongoose.Types.ObjectId(userId),
        action: "create",
        entityType: "Resume",
        entityId: new mongoose.Types.ObjectId(userId),
        diff: { error: "Parsed file size exceeds 5MB limit", sizeBytes: file.size },
      });
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    const filename = file.name || "resume";
    const declaredMime = file.type || "";

    // Read bytes into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 5: Sniffer / Magic byte validation
    const snifferResult = validateMagicBytes(buffer, filename, declaredMime);
    if (!snifferResult.isValid) {
      await connectDB();
      await AuditLog.create({
        actor: new mongoose.Types.ObjectId(userId),
        action: "create",
        entityType: "Resume",
        entityId: new mongoose.Types.ObjectId(userId),
        diff: { error: snifferResult.error || "Magic byte validation failed", filename, declaredMime },
      });
      return NextResponse.json(
        { error: snifferResult.error || "Unsupported or invalid file signature." },
        { status: 400 }
      );
    }

    // Step 6: PDF encryption already checked in validateMagicBytes

    // Step 7: Raw buffer security scan (executable detection)
    const pdfSecurity = scanPdfBuffer(buffer);
    if (!pdfSecurity.isSafe) {
      await connectDB();
      await AuditLog.create({
        actor: new mongoose.Types.ObjectId(userId),
        action: "create",
        entityType: "Resume",
        entityId: new mongoose.Types.ObjectId(userId),
        diff: { error: "PDF security scan failed", filename, errors: pdfSecurity.errors },
      });
      return NextResponse.json(
        { error: pdfSecurity.errors[0] || "PDF security check failed." },
        { status: 400 }
      );
    }

    // Step 8: Extract text and page count
    let extractedText = "";
    let pageCount = 1;
    try {
      const parsed = await extractTextAndPageCount(buffer, snifferResult.sniffedMime);
      extractedText = parsed.text;
      pageCount = parsed.pageCount;
    } catch (err) {
      await connectDB();
      const errMsg = err instanceof Error ? err.message : "Failed to parse PDF file";
      await AuditLog.create({
        actor: new mongoose.Types.ObjectId(userId),
        action: "create",
        entityType: "Resume",
        entityId: new mongoose.Types.ObjectId(userId),
        diff: { error: errMsg, filename },
      });
      return NextResponse.json({ error: errMsg }, { status: 400 });
    }

    // Step 9: Page count validation (<=8)
    if (pageCount > MAX_PAGES) {
      await connectDB();
      await AuditLog.create({
        actor: new mongoose.Types.ObjectId(userId),
        action: "create",
        entityType: "Resume",
        entityId: new mongoose.Types.ObjectId(userId),
        diff: { error: "Exceeded max page count limit", pageCount, filename },
      });
      return NextResponse.json(
        { error: "Resume exceeds the maximum limit of 8 pages." },
        { status: 400 }
      );
    }

    // Step 10: Content security scan (prompt injection, unicode, empty text)
    const contentSecurity = scanContent(extractedText);
    if (!contentSecurity.isSafe) {
      await connectDB();
      await AuditLog.create({
        actor: new mongoose.Types.ObjectId(userId),
        action: "create",
        entityType: "Resume",
        entityId: new mongoose.Types.ObjectId(userId),
        diff: { error: "Content security check failed", filename, errors: contentSecurity.errors },
      });
      return NextResponse.json(
        { error: contentSecurity.errors[0] || "Content security check failed." },
        { status: 400 }
      );
    }

    await connectDB();

    // Step 11: Compute content hash
    const contentHash = computeSHA256(extractedText);

    // Step 12: Cache check — reuse existing resume + analysis if content hash matches
    const existingAnalysis = await ResumeAnalysis.findOne({ contentHash });
    if (existingAnalysis) {
      // Check if this user already has this exact resume
      const existingResume = await Resume.findOne({ user: userId, contentHash });
      if (existingResume) {
        return NextResponse.json({
          success: true,
          resumeId: existingResume._id,
          contentHash,
          summary: existingAnalysis.summary,
          classification: existingAnalysis.classification,
          quality: existingAnalysis.quality,
          cached: true,
        });
      }
    }

    // Step 13: Subscription limit check
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const maxResumes = getMaxResumes(user.isPremium);
    const currentResumeCount = await Resume.countDocuments({ user: userId, status: "clean" });

    if (currentResumeCount >= maxResumes) {
      return NextResponse.json(
        {
          error: "limit_reached",
          maxResumes,
          currentCount: currentResumeCount,
          isPremium: user.isPremium,
          message: user.isPremium
            ? `You have reached the maximum of ${maxResumes} resumes. Please delete one before uploading.`
            : `Free accounts can store up to 1 resume. Upgrade to Premium for up to 3 resumes.`,
        },
        { status: 400 }
      );
    }

    // Step 14: Heuristic classification
    const heuristicResult = classifyByHeuristics(extractedText);

    // Step 15: AI classification (only if heuristics show some signal)
    let aiClassification = { isResume: false, confidence: 0, label: "unknown", reasons: ["Skipped: heuristics did not pass"] };
    const aiService = getAIService();

    if (heuristicResult.isResume) {
      try {
        aiClassification = await aiService.classifyDocument(extractedText);
      } catch (err) {
        console.error("[Resume Upload] AI classification failed:", err);
        // Fail closed: do not store resume or consume quota
        return NextResponse.json(
          {
            error: "ai_unavailable",
            message: "We couldn't verify your resume at the moment. Please try again in a few minutes.",
          },
          { status: 503 }
        );
      }
    }

    // Hybrid validation gate: heuristics must pass AND AI confidence >= threshold
    const finalClassificationScore = Math.max(
      heuristicResult.confidence * 0.4,
      aiClassification.confidence * 0.6
    );
    const isClassifiedAsResume =
      heuristicResult.isResume &&
      aiClassification.isResume &&
      aiClassification.confidence >= CLASSIFICATION_CONFIDENCE_THRESHOLD;

    if (!isClassifiedAsResume) {
      // Do not store rejected resumes — they waste storage and confuse the user
      return NextResponse.json(
        {
          error: "classification_failed",
          message: "The uploaded document does not appear to be a resume. Please upload a valid resume.",
          classificationScore: finalClassificationScore,
          heuristicConfidence: heuristicResult.confidence,
          aiConfidence: aiClassification.confidence,
          reasons: [...heuristicResult.reasons, ...aiClassification.reasons],
        },
        { status: 400 }
      );
    }

    // Step 16: Quality analysis — fail closed if unavailable
    let quality;
    try {
      quality = await aiService.analyzeResumeQuality(extractedText);
    } catch (err) {
      console.error("[Resume Upload] Quality analysis failed:", err);
      return NextResponse.json(
        {
          error: "ai_unavailable",
          message: "We couldn't verify your resume at the moment. Please try again in a few minutes.",
        },
        { status: 503 }
      );
    }

    // Resume analysis — fail closed if unavailable
    let summary;
    try {
      summary = await aiService.analyzeResume(extractedText);
    } catch (err) {
      console.error("[Resume Upload] AI analysis failed:", err);
      return NextResponse.json(
        {
          error: "ai_unavailable",
          message: "We couldn't verify your resume at the moment. Please try again in a few minutes.",
        },
        { status: 503 }
      );
    }

    // All AI calls succeeded — now create the resume record
    const resume = await Resume.create({
      user: new mongoose.Types.ObjectId(userId),
      originalFilename: filename,
      mimeTypeDeclared: declaredMime,
      mimeTypeSniffed: snifferResult.sniffedMime,
      pageCount,
      contentHash,
      extractedText,
      status: "clean",
      displayName: filename.replace(/\.pdf$/i, ""),
      isActive: true,
      classificationScore: finalClassificationScore,
      isClassifiedAsResume: true,
      heuristicSignals: heuristicResult.signals,
      qualityScore: quality.score,
      missingSections: quality.missingSections,
      suggestions: quality.suggestions,
    });

    // Deactivate other resumes for this user (only the latest is active)
    await Resume.updateMany(
      { user: userId, _id: { $ne: resume._id } },
      { $set: { isActive: false } }
    );

    // Create or update analysis
    if (existingAnalysis) {
      existingAnalysis.summary = summary;
      existingAnalysis.classification = {
        isResume: true,
        confidence: finalClassificationScore,
        label: "resume",
        reasons: [...heuristicResult.reasons, ...aiClassification.reasons],
      };
      existingAnalysis.quality = quality;
      existingAnalysis.modelVersion = AI_MODEL_VERSION;
      await existingAnalysis.save();
    } else {
      await ResumeAnalysis.create({
        resume: resume._id,
        contentHash,
        summary,
        classification: {
          isResume: true,
          confidence: finalClassificationScore,
          label: "resume",
          reasons: [...heuristicResult.reasons, ...aiClassification.reasons],
        },
        quality,
        modelVersion: AI_MODEL_VERSION,
      });
    }

    await AuditLog.create({
      actor: new mongoose.Types.ObjectId(userId),
      action: "create",
      entityType: "Resume",
      entityId: resume._id,
      diff: {
        cacheHit: false,
        contentHash,
        filename,
        classified: true,
        classificationScore: finalClassificationScore,
        qualityScore: quality.score,
        isPremium: user.isPremium,
      },
    });

    return NextResponse.json({
      success: true,
      resumeId: resume._id,
      contentHash,
      summary,
      classification: {
        isResume: true,
        confidence: finalClassificationScore,
        label: "resume",
      },
      quality,
      cached: false,
    });
  } catch (error) {
    console.error("[Resume Upload API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
