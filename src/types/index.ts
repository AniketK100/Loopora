/**
 * Core TypeScript Type Definitions — InterviewLoop
 *
 * These types mirror the Mongoose schemas defined in doc 05 but are
 * decoupled from Mongoose — they represent the data shape used in
 * the application layer (API responses, React props, etc.).
 *
 * Mongoose model types are defined alongside each model in Phase 2.
 * These types are the "public contract" consumed by the frontend.
 *
 * @module types/index
 * @see 05_Backend_Schema_Data_Auth.md — Schema definitions
 */

// =============================================================================
// User
// =============================================================================

export type UserRole = "user" | "editor" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  authProvider: "credentials" | "google";
  role: UserRole;
  bookmarks: string[]; // Question IDs
  practiced: string[]; // Question IDs
  isPremium: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// =============================================================================
// Category
// =============================================================================

export type CategoryType =
  | "hr"
  | "technical"
  | "non-technical"
  | "situational"
  | "managerial"
  | "company"
  | "aptitude"
  | "case-study";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string; // lucide-react icon key
  type: CategoryType;
  order: number;
  isPublished: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Video (embedded sub-document)
// =============================================================================

export type VideoProvider = "youtube" | "vimeo" | "loom" | "drive" | "mp4" | "instagram";

export interface Video {
  _id: string;
  label: string;
  provider: VideoProvider;
  url: string;       // Original URL, admin-pasted
  embedUrl: string;  // Normalized, server-generated from allowlist template
  thumbnailUrl?: string;
  order: number;
}

// =============================================================================
// Question
// =============================================================================

export type Difficulty = "easy" | "medium" | "hard";

export interface QuestionAnswer {
  short?: string;     // 1-2 line summary
  detailed: string;   // Sanitized rich-text HTML/markdown
  example?: string;   // Optional worked example / STAR breakdown
}

export interface Question {
  _id: string;
  category: string; // Category ID (or populated Category object)
  slug: string;
  question: string;
  answer: QuestionAnswer;
  videos: Video[];
  difficulty: Difficulty;
  frequencyRank: number;
  tags: string[];
  isPremium: boolean;
  isPublished: boolean;
  viewCount: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

/** Lightweight question shape for list views (omits full answer + videos) */
export interface QuestionListItem {
  _id: string;
  category: string;
  slug: string;
  question: string;
  answer: { short?: string };
  difficulty: Difficulty;
  frequencyRank: number;
  tags: string[];
  isPremium: boolean;
  isPublished: boolean;
  viewCount: number;
  hasVideo: boolean;
  videoCount: number;
}

// =============================================================================
// Feature Flag
// =============================================================================

export type FlagScope = "global" | "category" | "question" | "page";

export interface FeatureFlag {
  _id: string;
  key: string;
  enabled: boolean;
  scope: FlagScope;
  targetId?: string;
  note?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// Audit Log
// =============================================================================

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish";

export type AuditEntityType =
  | "Category"
  | "Question"
  | "FeatureFlag"
  | "User";

export interface AuditLog {
  _id: string;
  actor: string; // User ID
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  diff?: Record<string, unknown>; // Before/after snapshot
  createdAt: string;
}

// =============================================================================
// Suggestion (public feedback)
// =============================================================================

export type SuggestionStatus = "new" | "reviewed" | "added" | "rejected";

export interface Suggestion {
  _id: string;
  submittedBy?: string; // User ID, null if anonymous
  categorySuggestion?: string;
  questionText: string;
  notes?: string;
  status: SuggestionStatus;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// API Response Types
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
