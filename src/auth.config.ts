/**
 * NextAuth.config — Edge-Safe Configuration
 *
 * Configures the NextAuth properties (pages, callbacks) that must run in the
 * Edge runtime. To remain Edge-safe, it must NOT import database models or
 * libraries (like bcryptjs) that rely on Node.js native APIs.
 *
 * Database validation is handled separately in Node.js-based route handlers.
 *
 * @module auth.config
 * @see 02_TRD.md §4 — Security Requirements (Auth configuration)
 * @see 05_Backend_Schema_Data_Auth.md §3 — Auth Design
 */

import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types";

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/signup",
    error: "/login", // Redirect to login on error
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    /**
     * Controls if a user is authorized to access a route.
     * Edge middleware calls this automatically to enforce routing rules.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute) {
        if (!isLoggedIn) return false; // Redirects to login page
        
        // Enforce RBAC (admin & editor access only)
        const userRole = auth.user.role;
        const isAuthorized = userRole === "admin" || userRole === "editor";
        return isAuthorized;
      }

      return true;
    },

    /**
     * Decrypts/customizes the JWT token.
     * We populate user metadata (ID, role, isPremium) from the session login.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isPremium = user.isPremium;
      }

      // Handle session updates (dynamic role updates, booking actions)
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      return token;
    },

    /**
     * Customizes the session object returned to client components.
     * Exposes ID, role, and premium tier status.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.isPremium = !!token.isPremium;
      }
      return session;
    },
  },
  providers: [], // Providers are added in the main auth.ts since they require Node.js libraries (bcrypt)
} satisfies NextAuthConfig;
