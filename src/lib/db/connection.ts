/**
 * MongoDB Connection Utility
 *
 * Implements the singleton pattern for MongoDB connections in a serverless
 * environment (Next.js on Vercel). Caches the connection across hot reloads
 * in development and across invocations in production to avoid exhausting
 * the connection pool.
 *
 * @module lib/db/connection
 * @see https://mongoosejs.com/docs/nextjs.html
 */

import mongoose from "mongoose";

/**
 * Global type augmentation to cache the mongoose connection promise
 * across hot reloads in development.
 */
declare global {
  var mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not defined. Please add it to your .env.local file.\n" +
      "See .env.example for the expected format."
  );
}

/**
 * Cached connection object. In development, this is stored on `globalThis`
 * to survive hot module replacement. In production, module-level caching
 * is sufficient since the module is only loaded once per cold start.
 */
const cached = globalThis.mongooseConnection ?? { conn: null, promise: null };

if (process.env.NODE_ENV === "development") {
  globalThis.mongooseConnection = cached;
}

/**
 * Connects to MongoDB Atlas and returns the mongoose instance.
 * Uses a cached connection when available.
 *
 * @returns The mongoose connection instance.
 * @throws {Error} If MONGODB_URI is not configured.
 *
 * @example
 * ```ts
 * import { connectDB } from "@/lib/db/connection";
 *
 * export async function GET() {
 *   await connectDB();
 *   const categories = await Category.find({ isPublished: true });
 *   return Response.json(categories);
 * }
 * ```
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      // Connection pool size — 5 is reasonable for serverless.
      // Each Vercel function instance gets its own pool.
      maxPoolSize: 5,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((m) => {
      console.log("[DB] Connected to MongoDB Atlas");
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Returns the current connection state as a human-readable string.
 * Useful for health-check endpoints.
 *
 * @returns "connected" | "disconnected" | "connecting" | "disconnecting"
 */
export function getConnectionStatus(): string {
  const states: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[mongoose.connection.readyState] ?? "unknown";
}
