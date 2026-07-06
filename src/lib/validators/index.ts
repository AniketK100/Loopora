/**
 * Zod Schema Validators — InterviewLoop
 *
 * Defines runtime type checking and parsing schemas for API requests
 * (creation, updates, deletes) to enforce data integrity before database insertion.
 *
 * @module lib/validators
 * @see 02_TRD.md §4 — Security Requirements (Input validation/sanitization)
 * @see 05_Backend_Schema_Data_Auth.md §2 — Mongoose Schemas
 */

import { z } from "zod";

// Helper regex for Mongo ObjectId validation
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const objectIdSchema = z
  .string()
  .regex(OBJECT_ID_REGEX, { message: "Invalid ID format" });

// =============================================================================
// Category Validators
// =============================================================================

export const categoryCreateSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" })
    .trim(),
  slug: z
    .string()
    .min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    })
    .trim(),
  description: z.string().max(500).optional().or(z.literal("")),
  icon: z.string().max(50).optional().or(z.literal("")),
  type: z.enum([
    "hr",
    "technical",
    "non-technical",
    "situational",
    "managerial",
    "company",
    "aptitude",
    "case-study",
  ]),
  order: z.number().int().nonnegative().default(0),
  isPublished: z.boolean().default(false),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

// =============================================================================
// Video Validators
// =============================================================================

export const videoInputSchema = z.object({
  label: z.string().min(1, { message: "Video label is required" }).trim(),
  url: z.string().url({ message: "Invalid video URL" }).trim(),
  order: z.number().int().nonnegative().default(0),
});

// =============================================================================
// Question Validators
// =============================================================================

export const questionCreateSchema = z.object({
  category: objectIdSchema,
  slug: z
    .string()
    .min(1, { message: "Slug is required" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    })
    .trim(),
  question: z.string().min(1, { message: "Question text is required" }).trim(),
  answer: z.object({
    short: z.string().max(250).optional().or(z.literal("")),
    detailed: z.string().min(1, { message: "Detailed answer is required" }),
    example: z.string().optional().or(z.literal("")),
  }),
  videos: z.array(videoInputSchema).default([]),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  frequencyRank: z.number().int().nonnegative().default(0),
  tags: z.array(z.string().trim()).default([]),
  isPremium: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

export const questionUpdateSchema = questionCreateSchema.partial();

// =============================================================================
// Feature Flag Validators
// =============================================================================

export const featureFlagCreateSchema = z.object({
  key: z
    .string()
    .min(1, { message: "Flag key is required" })
    .regex(/^[a-z0-9_:-]+$/, {
      message: "Key can only contain lowercase letters, numbers, underscores, colons, and hyphens",
    })
    .trim(),
  enabled: z.boolean().default(false),
  scope: z.enum(["global", "category", "question", "page"]),
  targetId: objectIdSchema.optional().nullable(),
  note: z.string().max(250).optional().or(z.literal("")),
});

export const featureFlagUpdateSchema = featureFlagCreateSchema.partial();

// =============================================================================
// Suggestion Validators
// =============================================================================

export const suggestionCreateSchema = z.object({
  categorySuggestion: z.string().max(100).optional().or(z.literal("")),
  questionText: z.string().min(5, { message: "Question must be at least 5 characters long" }).trim(),
  notes: z.string().max(500).optional().or(z.literal("")),
});

// =============================================================================
// Auth Validators
// =============================================================================

export const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }).trim(),
  email: z.string().email({ message: "Invalid email address" }).trim().toLowerCase(),
  password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
});

