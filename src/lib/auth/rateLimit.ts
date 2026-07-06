/**
 * DB-Backed Rate Limiter Utility — Serverless-Safe
 *
 * Implements a sliding-window rate limiter utilizing a MongoDB collection with TTL
 * indexes. Safe for serverless environments (Vercel) where standard memory-backed
 * rate limiters fail due to instance isolation.
 *
 * @module lib/auth/rateLimit
 * @see 02_TRD.md §4 — Security Requirements (Rate Limiting)
 */

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { RateLimit } from "@/lib/db/models/RateLimit";

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Extracts the client's IP address from request headers.
 */
export function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // x-forwarded-for can be a list of IPs, the first one is the client
    const clientIp = xForwardedFor.split(",")[0].trim();
    if (clientIp) return clientIp;
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) return xRealIp;

  // Next.js request IP fallback if running locally or matching edge IP
  return (request as { ip?: string }).ip || "127.0.0.1";
}

/**
 * Enforces rate limiting on a specific endpoint for the request IP.
 *
 * @param request The NextRequest object
 * @param endpoint Identifier for the endpoint being guarded (e.g. 'auth:login')
 * @param limit Max hits permitted within the window
 * @param windowMs Time window in milliseconds (e.g., 60 * 1000 = 1 minute)
 */
export async function checkRateLimit(
  request: NextRequest,
  endpoint: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): Promise<RateLimitResult> {
  await connectDB();

  const ip = getClientIp(request);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);

  try {
    // Attempt to upsert the rate limit document
    // If it doesn't exist, create it. If it exists, increment hits.
    const record = await RateLimit.findOneAndUpdate(
      { ip, endpoint },
      {
        $inc: { hits: 1 },
        $setOnInsert: { expiresAt },
      },
      {
        returnDocument: "after",
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const hits = record.hits;
    const remaining = Math.max(0, limit - hits);
    const allowed = hits <= limit;

    return {
      allowed,
      limit,
      remaining,
      reset: record.expiresAt,
    };
  } catch (error) {
    // If a concurrency error occurs due to unique compound index, query again to update
    const record = await RateLimit.findOne({ ip, endpoint });
    if (record) {
      const hits = record.hits + 1;
      await RateLimit.updateOne({ ip, endpoint }, { $inc: { hits: 1 } });
      
      return {
        allowed: hits <= limit,
        limit,
        remaining: Math.max(0, limit - hits),
        reset: record.expiresAt,
      };
    }

    // Default fallback to allow if database error
    console.error("[RateLimit] Database error:", error);
    return {
      allowed: true,
      limit,
      remaining: 1,
      reset: expiresAt,
    };
  }
}
