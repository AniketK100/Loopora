/**
 * Suggestion Mongoose Model
 *
 * Stores public feedback and suggested interview questions from users,
 * feeding directly into the admin review queue.
 *
 * @module lib/db/models/Suggestion
 * @see 05_Backend_Schema_Data_Auth.md §2.7 — Suggestion Schema
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import { SuggestionStatus } from "@/types";

export interface ISuggestionDocument extends Document {
  submittedBy?: mongoose.Types.ObjectId | null;
  categorySuggestion?: string;
  questionText: string;
  notes?: string;
  status: SuggestionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const SuggestionSchema = new Schema<ISuggestionDocument>(
  {
    submittedBy: { type: Schema.Types.ObjectId, ref: "User", default: null }, // Null for anonymous submissions
    categorySuggestion: { type: String, trim: true },
    questionText: { type: String, required: true, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["new", "reviewed", "added", "rejected"],
      default: "new",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model multiple times during Next.js hot reloads
export const Suggestion: Model<ISuggestionDocument> =
  mongoose.models.Suggestion ||
  mongoose.model<ISuggestionDocument>("Suggestion", SuggestionSchema);
