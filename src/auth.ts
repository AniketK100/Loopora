/**
 * NextAuth initialization — Node.js Runtime
 *
 * Configures providers (Credentials, Google OAuth) and initializes
 * NextAuth. Credentials authentication verifies user passwords using bcryptjs
 * against MongoDB.
 *
 * @module auth
 * @see 05_Backend_Schema_Data_Auth.md §3 — Auth Design
 */

import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models/User";

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

const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) {
        return null;
      }

      const { email, password } = parsed.data;

      // 1. Establish database connection
      await connectDB();

      // 2. Query user by email
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user || !user.passwordHash) {
        return null;
      }

      // 3. Verify password hash using bcrypt
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
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
      // Map Google profile to default role
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "user", // Google logins default to 'user' role
          isPremium: false,
        };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
});
