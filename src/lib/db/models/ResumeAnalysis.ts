/**
 * ResumeAnalysis Mongoose Model
 *
 * Stores structured data parsed by AI from a specific resume text hash.
 * This separates the file upload metadata from the cacheable AI output.
 *
 * @module lib/db/models/ResumeAnalysis
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResumeAnalysisDocument extends Document {
  resume: mongoose.Types.ObjectId;
  contentHash: string; // duplicate key for direct lookup cache hits
  summary: {
    detectedRole?: string;
    skills: string[];
    yearsExperience?: number;
  };
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
      unique: true, // global unique content cache mapping
      index: true,
      trim: true,
    },
    summary: {
      detectedRole: { type: String, trim: true },
      skills: { type: [String], default: [] },
      yearsExperience: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

export const ResumeAnalysis: Model<IResumeAnalysisDocument> =
  mongoose.models.ResumeAnalysis ||
  mongoose.model<IResumeAnalysisDocument>("ResumeAnalysis", ResumeAnalysisSchema);
