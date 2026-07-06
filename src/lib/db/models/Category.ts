/**
 * Category Mongoose Model
 *
 * Defines the category schema and indexes.
 * Categories partition the interview questions (e.g. HR, Technical, Situational).
 * Includes denormalized questionCount updated via Mongoose hooks on the Question model.
 *
 * @module lib/db/models/Category
 * @see 05_Backend_Schema_Data_Auth.md §2.2 — Category Schema
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import { CategoryType } from "@/types";

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  type: CategoryType;
  order: number;
  isPublished: boolean;
  questionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, trim: true },
    icon: { type: String, trim: true }, // lucide-react icon key (e.g., "User", "Code")
    type: {
      type: String,
      enum: [
        "hr",
        "technical",
        "non-technical",
        "situational",
        "managerial",
        "company",
        "aptitude",
        "case-study",
      ],
      required: true,
    },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false, index: true },
    questionCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model multiple times during Next.js hot reloads
export const Category: Model<ICategoryDocument> =
  mongoose.models.Category ||
  mongoose.model<ICategoryDocument>("Category", CategorySchema);
