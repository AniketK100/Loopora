/**
 * Question Mongoose Model (including embedded Video schema)
 *
 * Defines the question schema, sub-schemas, compound indexes, text indexes,
 * and lifecycle hooks for denormalization (updating Category.questionCount).
 *
 * @module lib/db/models/Question
 * @see 05_Backend_Schema_Data_Auth.md §2.3 — Video Schema
 * @see 05_Backend_Schema_Data_Auth.md §2.4 — Question Schema
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import { Difficulty, VideoProvider } from "@/types";

// =============================================================================
// Embedded Video Schema Interface
// =============================================================================

export interface IVideoDocument extends Document {
  label: string;
  provider: VideoProvider;
  url: string;
  embedUrl: string;
  thumbnailUrl?: string;
  order: number;
}

const VideoSchema = new Schema<IVideoDocument>(
  {
    label: { type: String, required: true, trim: true },
    provider: {
      type: String,
      enum: ["youtube", "vimeo", "loom", "drive", "mp4", "instagram"],
      required: true,
    },
    url: { type: String, required: true, trim: true },
    embedUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

// =============================================================================
// Question Schema Interface
// =============================================================================

export interface IQuestionDocument extends Document {
  category: mongoose.Types.ObjectId;
  slug: string;
  question: string;
  answer: {
    short?: string;
    detailed: string;
    example?: string;
  };
  videos: IVideoDocument[];
  resources: { title: string; url: string }[];
  difficulty: Difficulty;
  frequencyRank: number;
  tags: string[];
  isPremium: boolean;
  isPublished: boolean;
  viewCount: number;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestionDocument>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    slug: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true },
    answer: {
      short: { type: String, trim: true },
      detailed: { type: String, required: true }, // sanitized rich-text
      example: { type: String, trim: true }, // optional worked example / STAR breakdown
    },
    videos: { type: [VideoSchema], default: [] },
    resources: [
      {
        title: { type: String, required: true, trim: true },
        url: { type: String, required: true, trim: true },
      },
    ],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      index: true,
    },
    frequencyRank: { type: Number, default: 0, index: true },
    tags: [{ type: String, index: true, trim: true }],
    isPremium: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false, index: true },
    viewCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// --- Indexes -----------------------------------------------------------------
// 1. Slug must be unique within a category
QuestionSchema.index({ category: 1, slug: 1 }, { unique: true });

// 2. Text index for search API
QuestionSchema.index({
  question: "text",
  "answer.detailed": "text",
  tags: "text",
});

// 3. Covering index for the published navigator + personalized queries,
//    sorted by frequencyRank (used by /interview and /api/interview/[folder]/personalized).
QuestionSchema.index({ category: 1, isPublished: 1, frequencyRank: -1 });

// --- Denormalization Hooks ---------------------------------------------------
/**
 * Recalculates and updates the question count on the parent category.
 * Counts only published questions for public consistency.
 */
async function updateCategoryQuestionCount(categoryId: mongoose.Types.ObjectId) {
  try {
    const CategoryModel = mongoose.model("Category");
    const QuestionModel = mongoose.model("Question");

    const count = await QuestionModel.countDocuments({
      category: categoryId,
      isPublished: true,
    });

    await CategoryModel.findByIdAndUpdate(categoryId, { questionCount: count });
  } catch (error) {
    console.error("[DB] Failed to update category question count:", error);
  }
}

// Hook for doc.save() (both create and update)
QuestionSchema.post("save", async function (doc) {
  if (doc.category) {
    await updateCategoryQuestionCount(doc.category as mongoose.Types.ObjectId);
  }
});

// Hook for findByIdAndDelete or findOneAndDelete queries
QuestionSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.category) {
    await updateCategoryQuestionCount(doc.category as mongoose.Types.ObjectId);
  }
});

// Hook for deleteOne (when called on document instance)
QuestionSchema.post("deleteOne", { document: true, query: false }, async function (doc) {
  if (doc.category) {
    await updateCategoryQuestionCount(doc.category as mongoose.Types.ObjectId);
  }
});

// Prevent compiling model multiple times during Next.js hot reloads
export const Question: Model<IQuestionDocument> =
  mongoose.models.Question ||
  mongoose.model<IQuestionDocument>("Question", QuestionSchema);
export const Video: Model<IVideoDocument> =
  mongoose.models.Video || mongoose.model<IVideoDocument>("Video", VideoSchema);
