/**
 * PersonalizedAnswer Mongoose Model
 *
 * Caches individual personalized AI-generated interview answers
 * mapped per user, per question, per resume text hash, and per model version.
 * Cache key: user + question + resumeContentHash + modelVersion
 *
 * @module lib/db/models/PersonalizedAnswer
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPersonalizedAnswerDocument extends Document {
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  resumeContentHash: string;
  modelVersion: string;
  personalizedText: string;
  createdAt: Date;
  updatedAt: Date;
}

const PersonalizedAnswerSchema = new Schema<IPersonalizedAnswerDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    resumeContentHash: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    modelVersion: {
      type: String,
      required: true,
      default: "v1",
      trim: true,
    },
    personalizedText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: uniqueness of cached personalized answers per user + question + resume + model
PersonalizedAnswerSchema.index(
  { user: 1, question: 1, resumeContentHash: 1, modelVersion: 1 },
  { unique: true }
);

// TTL index: auto-expire stale cached answers after 90 days
PersonalizedAnswerSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const PersonalizedAnswer: Model<IPersonalizedAnswerDocument> =
  mongoose.models.PersonalizedAnswer ||
  mongoose.model<IPersonalizedAnswerDocument>("PersonalizedAnswer", PersonalizedAnswerSchema);
