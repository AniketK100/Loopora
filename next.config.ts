import type { NextConfig } from "next";

/**
 * Next.js Configuration — InterviewLoop
 *
 * Key decisions documented:
 * - images.remotePatterns: Cloudinary for thumbnails/OG images, YouTube/Vimeo for video thumbs
 * - No experimental features enabled until needed
 * - ISR revalidation is configured per-page in route segments, not globally
 *
 * @see 02_TRD.md §1 — Stack Decision
 */
const nextConfig: NextConfig = {
  /**
   * Remote image patterns for next/image optimization.
   * Only allow known, trusted image sources.
   */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "i.vimeocdn.com",
        pathname: "/**",
      },
    ],
  },

  /**
   * Security headers are applied via middleware (Phase 8).
   * Keeping the config clean here; CSP and HSTS will be set in middleware.
   */

  /**
   * Powered-by header removed for security (minor, but free).
   */
  poweredByHeader: false,
};

export default nextConfig;
