/**
 * Database barrel export.
 *
 * All database utilities and models are re-exported from here for
 * convenient imports:
 *
 * ```ts
 * import { connectDB, getConnectionStatus } from "@/lib/db";
 * ```
 *
 * Models will be added here as they are implemented in Phase 2.
 *
 * @module lib/db
 */

export { connectDB, getConnectionStatus } from "./connection";

// Models
export { User } from "./models/User";
export type { IUserDocument } from "./models/User";

export { Category } from "./models/Category";
export type { ICategoryDocument } from "./models/Category";

export { Question, Video } from "./models/Question";
export type { IQuestionDocument, IVideoDocument } from "./models/Question";

export { FeatureFlag } from "./models/FeatureFlag";
export type { IFeatureFlagDocument } from "./models/FeatureFlag";

export { AuditLog } from "./models/AuditLog";
export type { IAuditLogDocument } from "./models/AuditLog";

export { Suggestion } from "./models/Suggestion";
export type { ISuggestionDocument } from "./models/Suggestion";

export { RateLimit } from "./models/RateLimit";
export type { IRateLimitDocument } from "./models/RateLimit";
