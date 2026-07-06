/**
 * FeatureFlag Mongoose Model
 *
 * Defines the schema for runtime toggles (e.g., maintenance mode, feature releases, dynamic publishes).
 * Checked at request time with edge-friendly short-TTL cache to avoid database load.
 *
 * @module lib/db/models/FeatureFlag
 * @see 05_Backend_Schema_Data_Auth.md §2.5 — Feature Flag Schema
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import { FlagScope } from "@/types";

export interface IFeatureFlagDocument extends Document {
  key: string;
  enabled: boolean;
  scope: FlagScope;
  targetId?: mongoose.Types.ObjectId | null;
  note?: string;
  updatedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureFlagSchema = new Schema<IFeatureFlagDocument>(
  {
    key: { type: String, required: true, unique: true, trim: true, index: true },
    enabled: { type: Boolean, default: false },
    scope: {
      type: String,
      enum: ["global", "category", "question", "page"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, default: null }, // References either Category or Question depending on scope
    note: { type: String, trim: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model multiple times during Next.js hot reloads
export const FeatureFlag: Model<IFeatureFlagDocument> =
  mongoose.models.FeatureFlag ||
  mongoose.model<IFeatureFlagDocument>("FeatureFlag", FeatureFlagSchema);
