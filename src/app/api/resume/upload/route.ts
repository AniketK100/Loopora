/**
 * Secure Resume Upload API Route
 *
 * Implements a 12-step secure validation, parsing, hashing, and caching pipeline.
 * Evaluates Magic Bytes, page counts, and reuses Gemini analyses on content hash matches.
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
import { validateMagicBytes } from "@/lib/validators/fileSniffer";
import { extractTextAndPageCount } from "@/lib/utils/resumeParser";
import { getAIService } from "@/lib/ai/provider";

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function computeSHA256(text: string): string {
  return crypto.createHash("sha256").update(normalizeText(text)).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Initial header content-length validation (5MB max)
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    if (contentLength > 5 * 1024 * 1024) {
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "Missing file in upload payload." }, { status: 400 });
    }

    // 3. Size validation
    if (file.size > 5 * 1024 * 1024) {
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

    // 4. Sniffer / Magic byte validation
    const snifferResult = validateMagicBytes(buffer, filename, declaredMime);
    if (!snifferResult.isValid) {
      await connectDB();
      await AuditLog.create({
        actor: new mongoose.Types.ObjectId(userId),
        action: "create",
        entityType: "Resume",
        entityId: new mongoose.Types.ObjectId(userId),
        diff: {
          error: snifferResult.error || "Magic byte validation failed",
          filename,
          declaredMime,
        },
      });
      return NextResponse.json(
        { error: snifferResult.error || "Unsupported or invalid file signature." },
        { status: 400 }
      );
    }

    const sniffedMime = snifferResult.sniffedMime;
    const isImage = sniffedMime.startsWith("image/");

    let extractedText = "";
    let pageCount = 1;

    // 5. Page count and Text Extraction for documents
    if (!isImage) {
      try {
        const parsed = await extractTextAndPageCount(buffer, sniffedMime);
        extractedText = parsed.text;
        pageCount = parsed.pageCount;
      } catch (err) {
        await connectDB();
        const errMsg = err instanceof Error ? err.message : "Local file parsing error";
        await AuditLog.create({
          actor: new mongoose.Types.ObjectId(userId),
          action: "create",
          entityType: "Resume",
          entityId: new mongoose.Types.ObjectId(userId),
          diff: { error: errMsg, filename },
        });
        return NextResponse.json(
          { error: errMsg },
          { status: 400 }
        );
      }

      // Validate Page count (8 pages max)
      if (pageCount > 8) {
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
    }

    await connectDB();

    // 6. Caching, Duplicate Lookups, and AI analysis
    let contentHash = "";
    let summary: {
      detectedRole?: string;
      skills?: string[];
      yearsExperience?: number;
    } | null = null;

    if (!isImage) {
      contentHash = computeSHA256(extractedText);

      // Check cache first
      const cachedAnalysis = await ResumeAnalysis.findOne({ contentHash });
      if (cachedAnalysis) {
        // Cache hit! Save Resume metadata, but reuse cached analysis summary
        const resume = await Resume.create({
          user: new mongoose.Types.ObjectId(userId),
          originalFilename: filename,
          mimeTypeDeclared: declaredMime,
          mimeTypeSniffed: sniffedMime,
          pageCount,
          contentHash,
          extractedText,
          status: "clean",
        });

        await AuditLog.create({
          actor: new mongoose.Types.ObjectId(userId),
          action: "create",
          entityType: "Resume",
          entityId: resume._id,
          diff: { cacheHit: true, contentHash, filename },
        });

        return NextResponse.json({
          success: true,
          resumeId: resume._id,
          summary: cachedAnalysis.summary,
        });
      }

      // Cache miss: call Gemini for text analysis
      const aiService = getAIService();
      summary = await aiService.analyzeResume(extractedText);

      const resume = await Resume.create({
        user: new mongoose.Types.ObjectId(userId),
        originalFilename: filename,
        mimeTypeDeclared: declaredMime,
        mimeTypeSniffed: sniffedMime,
        pageCount,
        contentHash,
        extractedText,
        status: "clean",
      });

      await ResumeAnalysis.create({
        resume: resume._id,
        contentHash,
        summary,
      });

      await AuditLog.create({
        actor: new mongoose.Types.ObjectId(userId),
        action: "create",
        entityType: "Resume",
        entityId: resume._id,
        diff: { cacheHit: false, contentHash, filename },
      });

      return NextResponse.json({
        success: true,
        resumeId: resume._id,
        summary,
      });
    } else {
      // Multimodal Image analysis: Send to Gemini to extract text and analyze in one go
      const aiService = getAIService();
      const imageResult = await aiService.analyzeResumeImage(buffer, sniffedMime);
      
      extractedText = imageResult.extractedText;
      contentHash = computeSHA256(extractedText);
      summary = imageResult.summary;

      // Check cache hit using parsed contentHash
      const cachedAnalysis = await ResumeAnalysis.findOne({ contentHash });
      if (cachedAnalysis) {
        const resume = await Resume.create({
          user: new mongoose.Types.ObjectId(userId),
          originalFilename: filename,
          mimeTypeDeclared: declaredMime,
          mimeTypeSniffed: sniffedMime,
          pageCount: 1,
          contentHash,
          extractedText,
          status: "clean",
        });

        await AuditLog.create({
          actor: new mongoose.Types.ObjectId(userId),
          action: "create",
          entityType: "Resume",
          entityId: resume._id,
          diff: { cacheHit: true, contentHash, filename, isImage: true },
        });

        return NextResponse.json({
          success: true,
          resumeId: resume._id,
          summary: cachedAnalysis.summary,
        });
      }

      // Save to database
      const resume = await Resume.create({
        user: new mongoose.Types.ObjectId(userId),
        originalFilename: filename,
        mimeTypeDeclared: declaredMime,
        mimeTypeSniffed: sniffedMime,
        pageCount: 1,
        contentHash,
        extractedText,
        status: "clean",
      });

      await ResumeAnalysis.create({
        resume: resume._id,
        contentHash,
        summary,
      });

      await AuditLog.create({
        actor: new mongoose.Types.ObjectId(userId),
        action: "create",
        entityType: "Resume",
        entityId: resume._id,
        diff: { cacheHit: false, contentHash, filename, isImage: true },
      });

      return NextResponse.json({
        success: true,
        resumeId: resume._id,
        summary,
      });
    }
  } catch (error) {
    console.error("[Resume Upload API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
