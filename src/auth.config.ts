/**
 * NextAuth config - Edge-safe configuration.
 *
 * Database-backed credential validation lives in the Node.js auth entrypoint.
 * This file stays safe for middleware and edge routing concerns.
 */

import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { UserRole } from "@/types";

type ImpersonatedUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: UserRole;
  isPremium?: boolean;
};

type AdminSnapshot = ImpersonatedUser;

type AppToken = JWT & {
  id?: string;
  role?: UserRole;
  isPremium?: boolean;
  adminUser?: AdminSnapshot;
  impersonatedUser?: ImpersonatedUser;
};

type SessionUpdate = Partial<Session> & {
  impersonateUser?: ImpersonatedUser;
  stopImpersonation?: boolean;
};

type AppSession = Session & {
  user: Session["user"] & {
    id?: string;
    role?: UserRole;
    isPremium?: boolean;
  };
  adminUser?: AdminSnapshot;
};

export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/signup",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute) {
        if (!isLoggedIn) return false;

        const userRole = auth.user.role;
        return userRole === "admin" || userRole === "editor";
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      const appToken = token as AppToken;

      if (user) {
        appToken.id = user.id;
        appToken.role = user.role;
        appToken.isPremium = user.isPremium;
      }

      if (trigger === "update" && session) {
        const update = session as SessionUpdate;

        if (update.impersonateUser) {
          appToken.adminUser = {
            id: appToken.id,
            role: appToken.role,
            isPremium: appToken.isPremium,
            name: appToken.name,
            email: appToken.email,
          };
          appToken.impersonatedUser = update.impersonateUser;
        } else if (update.stopImpersonation) {
          if (appToken.adminUser) {
            const admin = appToken.adminUser;
            appToken.id = admin.id;
            appToken.role = admin.role;
            appToken.isPremium = admin.isPremium;
            appToken.name = admin.name;
            appToken.email = admin.email;
          }
          delete appToken.impersonatedUser;
          delete appToken.adminUser;
        } else {
          return { ...appToken, ...update };
        }
      }

      return appToken;
    },

    async session({ session, token }) {
      const appToken = token as AppToken;
      const appSession = session as AppSession;

      if (appToken && appSession.user) {
        if (appToken.impersonatedUser) {
          const impersonated = appToken.impersonatedUser;
          appSession.user.id = impersonated.id ?? appToken.id ?? "";
          appSession.user.name = impersonated.name ?? "";
          appSession.user.email = impersonated.email ?? "";
          appSession.user.role = impersonated.role ?? "user";
          appSession.user.isPremium = impersonated.isPremium ?? false;
          appSession.adminUser = appToken.adminUser;
        } else {
          appSession.user.id = appToken.id ?? "";
          appSession.user.role = appToken.role ?? "user";
          appSession.user.isPremium = !!appToken.isPremium;
          delete appSession.adminUser;
        }
      }

      return appSession;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
