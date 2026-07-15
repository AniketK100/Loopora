/**
 * NextAuth initialization — Node.js Runtime
 *
 * Configures providers (Credentials, Google OAuth) and initializes
 * NextAuth. Credentials authentication verifies user passwords using bcryptjs
 * against MongoDB.
 *
 * Google OAuth: On first sign-in, automatically creates a MongoDB User record
 * with role="user" and isPremium=false. On subsequent sign-ins, the existing
 * record is reused. The real MongoDB _id is always propagated into the JWT so
 * that session.user.id is consistent across both auth providers.
 *
 * @module auth
 * @see 05_Backend_Schema_Data_Auth.md §3 — Auth Design
 */

import NextAuth, { CredentialsSignin } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";
import { checkRateLimit } from "@/lib/auth/rateLimit";

import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { Session } from "@/lib/db/models/Session";

// Define TypeScript type expansion for NextAuth Session and User models
declare module "next-auth" {
  interface User {
    role: "user" | "editor" | "admin";
    isPremium: boolean;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "user" | "editor" | "admin";
      isPremium: boolean;
    };
  }
}

// Validation schema for login fields
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Constant dummy bcrypt hash used to equalize response timing when a user does
// not exist. This prevents email enumeration via timing side-channels (OWASP
// A07 / CWE-203): an attacker measuring response time can no longer distinguish
// "email exists, wrong password" from "email does not exist".
// Generated with bcryptjs cost 10 for the literal string "loopora-dummy-hash";
// it is never compared for equality, only fed to bcrypt.compare() for timing.
const DUMMY_HASH =
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZd9qJ8i4S";

/**
 * Parses user agent string to identify OS and browser.
 */
function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown Device";
  let os = "Unknown OS";
  let browser = "Unknown Browser";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";

  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/opera|opr/i.test(ua)) browser = "Opera";

  return `${browser} on ${os}`;
}

const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, request) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      // IP-based login rate limiting (configurable via RATE_LIMIT_AUTH_MAX).
      // Reuses the same DB-backed limiter as the register route. Blocks brute-force
      // / credential-stuffing without affecting already-authenticated users.
      // NOTE: use the request object passed to authorize (headers() from next/headers
      // is unavailable in this callback context).
      try {
        const rateReq = new NextRequest(request.url || "http://localhost", {
          headers: request.headers,
          method: request.method,
        });
        const loginLimit = Number(process.env.RATE_LIMIT_AUTH_MAX ?? 10);
        const rl = await checkRateLimit(rateReq, "auth:login", loginLimit, 60 * 1000);
        if (!rl.allowed) {
          throw new CredentialsSignin("Too many login attempts. Please try again later.");
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("[AUTH] Rate limit ERROR:", msg);
        if (e instanceof CredentialsSignin) throw e;
      }

      const { email, password } = parsed.data;

      // 1. Establish database connection
      await connectDB();

      // 2. Query user by email
      const user = await User.findOne({ email: email.toLowerCase() });

      // 3. Verify password hash using bcrypt.
      // Always run bcrypt.compare — against the real hash when the user exists,
      // otherwise against a constant dummy hash — so response timing is identical
      // for unknown emails vs. wrong passwords (mitigates user enumeration).
      const passwordMatch = await bcrypt.compare(
        password,
        user?.passwordHash || DUMMY_HASH
      );
      if (!user || !user.passwordHash || !passwordMatch || user.isDeleted) {
        return null;
      }

      // 4. Return matching user object to initialize the session
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
      };
    },
  }),
];

// Dynamically append Google OAuth provider if credentials exist in environment
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Map Google profile fields to our user shape.
      // NOTE: role and isPremium here are only used as initial values when the
      // user object is passed to the signIn callback below. The real authoritative
      // values always come from MongoDB (see signIn callback).
      profile(profile) {
        return {
          id: profile.sub,           // temporary — replaced by MongoDB _id in signIn callback
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user" as const,
          isPremium: false,
        };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,

    /**
     * signIn callback — runs before the JWT is minted.
     *
     * For Google logins this is the ONLY place where we can:
     * 1. Find or create the MongoDB User record (upsert — race-condition safe)
     * 2. Overwrite user.id with the real MongoDB _id so the jwt callback stores it
     *
     * Returning false cancels the sign-in. Returning true allows it.
     */
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        // Credentials flow: authorize() already validated the user — nothing to do here.
        return true;
      }

      try {
        await connectDB();

        const email = user.email?.toLowerCase();
        if (!email) {
          console.error("[Auth] Google sign-in rejected: no email in profile");
          return false; // Reject sign-in if Google didn't supply an email
        }

        // Atomic find-or-create using upsert — prevents duplicate users even
        // under concurrent cold-start scenarios on Vercel.
        //
        // new: false → returns the document AS IT WAS before the update.
        //   - Returns null  → document did NOT exist → was just inserted (new user).
        //   - Returns doc   → document existed → existing user signing in.
        //
        // This is the only reliable way to detect "was this an insert or an update?"
        // without a separate findOne call (which would introduce a TOCTOU race).
        const existingDoc = await User.findOneAndUpdate(
          { email },
          {
            $setOnInsert: {
              name: user.name || email.split("@")[0],
              email,
              authProvider: "google",
              role: "user",
              isPremium: false,
              bookmarks: [],
              practiced: [],
              selectedFolders: [],
            },
          },
          {
            upsert: true,
            new: false,             // ← return pre-update doc (null if freshly inserted)
            setDefaultsOnInsert: true,
          }
        );

        // If existingDoc is null the upsert inserted a new document.
        // Re-fetch to get the generated _id and defaults.
        const dbUser = existingDoc ?? await User.findOne({ email }).lean();

        if (!dbUser) {
          // Should be impossible after a successful upsert, but guard anyway
          console.error("[Auth] Google signIn: failed to locate user after upsert", email);
          return false;
        }

        // Check for soft-deleted account — block login
        if (dbUser.isDeleted) {
          console.warn("[Auth] Google sign-in rejected: account is soft-deleted", email);
          return false;
        }

        // If the account existed as credentials-only, we allow them to also use
        // Google (account linking by email). We do NOT change their existing role
        // or isPremium status.

        // Overwrite user.id with the real MongoDB _id.
        // This value is what gets written into the JWT as token.id (see jwt callback
        // in auth.config.ts), making session.user.id a proper MongoDB ObjectId string.
        user.id = dbUser._id.toString();
        user.role = (dbUser as { role: "user" | "editor" | "admin" }).role;
        user.isPremium = (dbUser as { isPremium: boolean }).isPremium;

        // Fire PostHog analytics for new sign-ups only.
        // existingDoc === null → this was a fresh insert → truly new user.
        const isNewUser = existingDoc === null;
        if (isNewUser) {
          try {
            const { getPostHogClient } = await import("@/lib/posthog-server");
            getPostHogClient().capture({
              distinctId: user.id,
              event: "user_signed_up",
              properties: { auth_provider: "google" },
            });
          } catch {
            // PostHog failure must never block authentication
          }
        }

        return true;
      } catch (error) {
        console.error("[Auth] Google signIn callback error:", error);
        // Return false to show the error page rather than a broken session
        return false;
      }
    },
  },
  events: {
    async signIn({ user, account }) {
      // At this point user.id is guaranteed to be the MongoDB _id string for both
      // credentials and Google logins (Google was corrected in the signIn callback above).
      try {
        await connectDB();
        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "Unknown";
        const ip =
          headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
          headersList.get("x-real-ip") ||
          "127.0.0.1";
        const device = parseUserAgent(userAgent);
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const loginMethod = account?.provider === "google" ? "google" : "credentials";

        // Guard: user.id must be a valid 24-char hex ObjectId to prevent storing
        // garbage in the Session collection.
        if (!user.id || !/^[a-f\d]{24}$/i.test(user.id)) {
          console.error("[Auth Event] Skipping session record: invalid user.id", user.id);
          return;
        }

        // Create the session tracking record in local DB
        await Session.create({
          user: user.id,
          ip,
          userAgent,
          device,
          loginMethod,
          expiresAt,
        });

        // Update lastLoginAt on User model
        await User.findByIdAndUpdate(user.id, { lastLoginAt: new Date() });
      } catch (error) {
        console.error("[Auth Event] Error creating user session record:", error);
      }
    },
  },
});
