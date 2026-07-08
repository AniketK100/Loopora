/**
 * User Mongoose Model
 *
 * Defines the user schema, indexes, and virtuals.
 * Used for authentication, personalization (bookmarks, practice tracking), and RBAC.
 *
 * @module lib/db/models/User
 * @see 05_Backend_Schema_Data_Auth.md §2.1 — User Schema
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import { UserRole } from "@/types";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash?: string | null;
  authProvider: "credentials" | "google";
  role: UserRole;
  bookmarks: mongoose.Types.ObjectId[];
  practiced: mongoose.Types.ObjectId[];
  isPremium: boolean;
  selectedFolders: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    passwordHash: { type: String, default: null },
    authProvider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },
    role: {
      type: String,
      enum: ["user", "editor", "admin"],
      default: "user",
      index: true,
    },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Question", default: [] }],
    practiced: [{ type: Schema.Types.ObjectId, ref: "Question", default: [] }],
    isPremium: { type: Boolean, default: false },
    selectedFolders: {
      type: [{ type: Schema.Types.ObjectId, ref: "Category" }],
      default: [],
      validate: [
        (val: mongoose.Types.ObjectId[]) => val.length <= 2,
        "selectedFolders array exceeds maximum permitted limit of 2 items",
      ],
    },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Prevent compiling model multiple times during Next.js hot reloads
export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
