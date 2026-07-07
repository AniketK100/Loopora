/**
 * RateLimit Mongoose Model
 *
 * Tracks request counts per IP and endpoint for serverless-safe rate limiting.
 * Implements a TTL index on `expiresAt` for automatic cleanup of expired limits by MongoDB.
 *
 * @module lib/db/models/RateLimit
 * @see 02_TRD.md §4 — Security Requirements (Rate Limiting)
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRateLimitDocument extends Document {
  ip: string;
  endpoint: string;
  hits: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RateLimitSchema = new Schema<IRateLimitDocument>(
  {
    ip: { type: String, required: true, index: true },
    endpoint: { type: String, required: true },
    hits: { type: Number, default: 1 },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// 1. Compound index on ip + endpoint for fast lookups
RateLimitSchema.index({ ip: 1, endpoint: 1 }, { unique: true });

// 2. TTL Index: MongoDB will automatically delete documents once current time exceeds expiresAt
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Prevent compiling model multiple times during Next.js hot reloads
export const RateLimit: Model<IRateLimitDocument> =
  mongoose.models.RateLimit ||
  mongoose.model<IRateLimitDocument>("RateLimit", RateLimitSchema);
