/**
 * Resume Mongoose Model
 *
 * Defines the schema for resumes, including size/type sniffing metadata, 
 * page counts, content hashes for deduplication, and extracted text content.
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
  contentHash: string; // SHA-256 hash of normalized extracted text
  extractedText: string;
  status: "pending" | "clean" | "rejected";
  rejectionReason?: string;
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
      default: "clean", // ClamAV can update this later
      required: true,
    },
    rejectionReason: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness of text content per user
ResumeSchema.index({ user: 1, contentHash: 1 }, { unique: true });

export const Resume: Model<IResumeDocument> =
  mongoose.models.Resume || mongoose.model<IResumeDocument>("Resume", ResumeSchema);
