/**
 * PersonalizedAnswer Mongoose Model
 *
 * Caches individual personalized AI-generated interview answers 
 * mapped per user, per question, and per resume text hash.
 *
 * @module lib/db/models/PersonalizedAnswer
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPersonalizedAnswerDocument extends Document {
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  resumeContentHash: string;
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
    personalizedText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to guarantee uniqueness of cached personalized answers
PersonalizedAnswerSchema.index(
  { user: 1, question: 1, resumeContentHash: 1 },
  { unique: true }
);

export const PersonalizedAnswer: Model<IPersonalizedAnswerDocument> =
  mongoose.models.PersonalizedAnswer ||
  mongoose.model<IPersonalizedAnswerDocument>("PersonalizedAnswer", PersonalizedAnswerSchema);
