/**
 * ResumeAnalysis Mongoose Model
 *
 * Stores structured data parsed by AI from a specific resume text hash.
 * This separates the file upload metadata from the cacheable AI output.
 * Includes classification and quality sub-objects for production-grade analysis.
 *
 * @module lib/db/models/ResumeAnalysis
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResumeAnalysisDocument extends Document {
  resume: mongoose.Types.ObjectId;
  contentHash: string;
  summary: {
    detectedRole?: string;
    skills: string[];
    yearsExperience?: number;
  };
  classification: {
    isResume: boolean;
    confidence: number;
    label: string;
    reasons: string[];
  };
  quality: {
    score: number;
    missingSections: string[];
    suggestions: string[];
  };
  modelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeAnalysisSchema = new Schema<IResumeAnalysisDocument>(
  {
    resume: {
      type: Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
      index: true,
    },
    contentHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    summary: {
      detectedRole: { type: String, trim: true },
      skills: { type: [String], default: [] },
      yearsExperience: { type: Number },
    },
    classification: {
      isResume: { type: Boolean, default: false },
      confidence: { type: Number, default: 0, min: 0, max: 1 },
      label: { type: String, default: "unknown", trim: true },
      reasons: { type: [String], default: [] },
    },
    quality: {
      score: { type: Number, default: 0, min: 0, max: 100 },
      missingSections: { type: [String], default: [] },
      suggestions: { type: [String], default: [] },
    },
    modelVersion: { type: String, default: "v1", trim: true },
  },
  {
    timestamps: true,
  }
);

export const ResumeAnalysis: Model<IResumeAnalysisDocument> =
  mongoose.models.ResumeAnalysis ||
  mongoose.model<IResumeAnalysisDocument>("ResumeAnalysis", ResumeAnalysisSchema);
