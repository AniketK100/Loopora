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
