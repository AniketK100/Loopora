/**
 * Resume Mongoose Model
 *
 * Defines the schema for resumes, including size/type sniffing metadata,
 * page counts, content hashes for deduplication, extracted text content,
 * classification results, quality scores, and multi-resume management.
 *
 * Resume limits are derived from User.isPremium:
 *   Free: 1 resume, Premium: 3 resumes
 *
 * @module lib/db/models/Resume
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResumeDocument extends Document {
  user: mongoose.Types.ObjectId;
  originalFilename: string;
  mimeTypeDeclared: string;
  mimeTypeSniffed: string;
  pageCount: number;
  contentHash: string;
  extractedText: string;
  status: "pending" | "clean" | "rejected";
  rejectionReason?: string;
  displayName?: string;
  isActive: boolean;
  classificationScore: number;
  isClassifiedAsResume: boolean;
  heuristicSignals: {
    hasEmail: boolean;
    hasPhone: boolean;
    hasEducation: boolean;
    hasWorkHistory: boolean;
    hasSkills: boolean;
    hasProjects: boolean;
    hasContactInfo: boolean;
    textLength: number;
    sectionCount: number;
    keywordHits: number;
  };
  qualityScore: number;
  missingSections: string[];
  suggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResumeDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalFilename: { type: String, required: true, trim: true },
    mimeTypeDeclared: { type: String, required: true, trim: true },
    mimeTypeSniffed: { type: String, required: true, trim: true },
    pageCount: { type: Number, required: true },
    contentHash: { type: String, required: true, trim: true },
    extractedText: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "clean", "rejected"],
      default: "clean",
      required: true,
    },
    rejectionReason: { type: String, trim: true },
    displayName: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    classificationScore: { type: Number, default: 0, min: 0, max: 1 },
    isClassifiedAsResume: { type: Boolean, default: false },
    heuristicSignals: {
      hasEmail: { type: Boolean, default: false },
      hasPhone: { type: Boolean, default: false },
      hasEducation: { type: Boolean, default: false },
      hasWorkHistory: { type: Boolean, default: false },
      hasSkills: { type: Boolean, default: false },
      hasProjects: { type: Boolean, default: false },
      hasContactInfo: { type: Boolean, default: false },
      textLength: { type: Number, default: 0 },
      sectionCount: { type: Number, default: 0 },
      keywordHits: { type: Number, default: 0 },
    },
    qualityScore: { type: Number, default: 0, min: 0, max: 100 },
    missingSections: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness of text content per user
ResumeSchema.index({ user: 1, contentHash: 1 }, { unique: true });

// Compound index for active resume lookups
ResumeSchema.index({ user: 1, isActive: 1 });

export const Resume: Model<IResumeDocument> =
  mongoose.models.Resume || mongoose.model<IResumeDocument>("Resume", ResumeSchema);
