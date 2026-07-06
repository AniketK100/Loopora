/**
 * AuditLog Mongoose Model
 *
 * Records historical content edits, publishing toggles, and config updates
 * for back-office tracking and easy auditing.
 *
 * @module lib/db/models/AuditLog
 * @see 05_Backend_Schema_Data_Auth.md §2.6 — Audit Log Schema
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import { AuditAction, AuditEntityType } from "@/types";

export interface IAuditLogDocument extends Document {
  actor: mongoose.Types.ObjectId;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: mongoose.Types.ObjectId;
  diff?: Record<string, unknown> | null;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: {
      type: String,
      enum: ["create", "update", "delete", "publish", "unpublish"],
      required: true,
    },
    entityType: {
      type: String,
      enum: ["Category", "Question", "FeatureFlag", "User"],
      required: true,
      index: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    diff: { type: Schema.Types.Mixed, default: null }, // Stores a delta snapshot of updated fields
  },
  {
    // We only need createdAt, updatedAt is unnecessary for append-only logs
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Prevent compiling model multiple times during Next.js hot reloads
export const AuditLog: Model<IAuditLogDocument> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLogDocument>("AuditLog", AuditLogSchema);
