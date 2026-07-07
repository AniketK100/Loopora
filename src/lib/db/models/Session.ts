/**
 * Session Mongoose Model
 *
 * Tracks server-side session/login records for admin visibility and device tracking.
 * NextAuth continues to use stateless JWTs for actual auth state —
 * this collection is a parallel audit/management record.
 *
 * @module lib/db/models/Session
 * @see 05_Backend_Schema_Data_Auth.md §3 — Session Model
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISessionDocument extends Document {
  user: mongoose.Types.ObjectId;
  ip: string;
  userAgent: string;
  device: string;              // parsed, e.g. "Chrome on Windows"
  loginMethod: "credentials" | "google";
  createdAt: Date;
  lastActiveAt: Date;
  revokedAt?: Date | null;     // set when user or admin revokes session
  expiresAt: Date;             // mirrors NextAuth session expiration
}

const SessionSchema = new Schema<ISessionDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    device: { type: String, required: true },
    loginMethod: { type: String, enum: ["credentials", "google"], required: true },
    lastActiveAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index for user session sorting/history queries
SessionSchema.index({ user: 1, createdAt: -1 });

// TTL index for automatic session expiration cleanup (DPDP compliant)
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session: Model<ISessionDocument> =
  mongoose.models.Session || mongoose.model<ISessionDocument>("Session", SessionSchema);
