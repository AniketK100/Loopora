/**
 * Health Check API Route
 *
 * Returns the application status and database connection state.
 * Used to verify that:
 * 1. The Next.js server is running
 * 2. The MongoDB Atlas connection is alive
 *
 * @route GET /api/health
 * @returns {{ status: "ok" | "error", db: string, timestamp: string }}
 *
 * @example Response (healthy):
 * ```json
 * {
 *   "status": "ok",
 *   "db": "connected",
 *   "timestamp": "2026-07-06T18:00:00.000Z",
 *   "version": "0.1.0"
 * }
 * ```
 */

import { NextResponse } from "next/server";
import { connectDB, getConnectionStatus } from "@/lib/db";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json(
      {
        status: "ok",
        db: getConnectionStatus(),
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? "0.1.0",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Health API] Error:", error);
    return NextResponse.json(
      {
        status: "error",
        db: getConnectionStatus(),
        error: "Internal Server Error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
