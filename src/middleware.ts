/**
 * Next.js Edge Middleware — NextAuth Guard & Security Headers
 *
 * Intercepts incoming requests to matchers and applies NextAuth's
 * edge-safe callback authorization rules. Automatically redirects
 * unauthenticated users to `/login` and checks roles on administrative routes.
 * Additionally, injects HTTP security headers (CSP, HSTS, X-Frame-Options, etc.).
 *
 * @module middleware
 * @see 02_TRD.md §1 — Stack Decision (RBAC middleware)
 * @see 06_Implementation_Plan_Build_Order.md Phase 8 — Security Hardening Pass
 */

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Content Security Policy (CSP) allowlist for embed providers.
  // Development keeps Next.js's full dev CSP (unsafe-inline + unsafe-eval for Fast Refresh).
  // Production removes unsafe-eval (not required by optimized production builds) but retains
  // unsafe-inline because Next.js App Router injects inline RSC/bootstrap scripts that cannot be
  // nonce-allowlisted without framework changes — removing it would break GSAP/Lenis/React hydration.
  const isProd = process.env.NODE_ENV === "production";
  const scriptSrc = isProd
    ? "script-src 'self' 'unsafe-inline';"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval';";
  const cspHeader = `
    default-src 'self';
    ${scriptSrc}
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: res.cloudinary.com img.youtube.com i.vimeocdn.com lh3.googleusercontent.com;
    font-src 'self' data:;
    frame-src 'self' https://www.youtube.com/ https://www.youtube-nocookie.com/ https://player.vimeo.com/ https://www.loom.com/ https://drive.google.com/ https://www.instagram.com/ https://accounts.google.com/;
    connect-src 'self' ws: wss: https://accounts.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self' https://accounts.google.com;
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, " ").trim();

  // Set HTTP security headers
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  return response;
});

export const config = {
  /**
   * Apply security headers across all routes, except for static assets,
   * next-internal files, and auth callbacks.
   */
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|og-image.png).*)",
  ],
};
