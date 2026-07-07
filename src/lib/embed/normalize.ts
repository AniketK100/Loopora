/**
 * Video Embed URL Normalization Utility
 *
 * Implements strict server-side validation and parsing of video URLs.
 * Detects the provider (YouTube, Vimeo, Loom, Google Drive, or Direct MP4)
 * and extracts the unique resource ID to generate a normalized embed URL.
 *
 * Rejecting arbitrary iframe tags or unapproved domains protects the application
 * against XSS and malicious iframe injections.
 *
 * @module lib/embed/normalize
 * @see 02_TRD.md §4 — Security Requirements (Embed URL allowlisting)
 * @see 05_Backend_Schema_Data_Auth.md §3 — Auth Design (Embed URL safety)
 */

import { VideoProvider } from "@/types";

export interface NormalizedVideo {
  provider: VideoProvider;
  url: string;      // The original pasted URL
  embedUrl: string; // The strictly formatted, safe embed URL
}

// --- Regular Expressions for Video ID Extraction ---------------------------

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;

const VIMEO_REGEX =
  /(?:vimeo\.com\/(?:channels\/[^\/]+\/|groups\/[^\/]+\/album\/[^\/]+\/video\/|showcase\/[^\/]+\/video\/|video\/)?|player\.vimeo\.com\/video\/)(\d+)/i;

const LOOM_REGEX =
  /(?:loom\.com\/(?:share|embed)\/)([a-zA-Z0-9]+)/i;

const DRIVE_REGEX =
  /(?:drive\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)(?:\/view|\/preview)?/i;

const INSTAGRAM_REGEX =
  /(?:instagram\.com\/(?:p|reel|tv)\/)([a-zA-Z0-9_-]+)/i;

const DIRECT_MP4_REGEX =
  /^https?:\/\/.+\.(mp4|webm|ogg)$/i;

/**
 * Parses a raw URL, detects the provider, and extracts the unique ID
 * to return a strictly structured, secure embed representation.
 *
 * @param url The raw user-supplied URL
 * @returns NormalizedVideo object containing provider, source URL, and embed URL
 * @throws {Error} If the URL is invalid or does not match any allowed provider
 *
 * @example
 * ```ts
 * try {
 *   const video = normalizeVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
 *   // Returns:
 *   // {
 *   //   provider: "youtube",
 *   //   url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
 *   //   embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
 *   // }
 * } catch (err) {
 *   console.error("Invalid embed URL");
 * }
 * ```
 */
export function normalizeVideoUrl(url: string): NormalizedVideo {
  if (!url || typeof url !== "string") {
    throw new Error("Video URL is required and must be a string");
  }

  const cleanUrl = url.trim();

  // 1. YouTube Check
  const ytMatch = cleanUrl.match(YOUTUBE_REGEX);
  if (ytMatch && ytMatch[1]) {
    return {
      provider: "youtube",
      url: cleanUrl,
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }

  // 2. Vimeo Check
  const vimeoMatch = cleanUrl.match(VIMEO_REGEX);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      provider: "vimeo",
      url: cleanUrl,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    };
  }

  // 3. Loom Check
  const loomMatch = cleanUrl.match(LOOM_REGEX);
  if (loomMatch && loomMatch[1]) {
    return {
      provider: "loom",
      url: cleanUrl,
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
    };
  }

  // 4. Google Drive Check
  const driveMatch = cleanUrl.match(DRIVE_REGEX);
  if (driveMatch && driveMatch[1]) {
    return {
      provider: "drive",
      url: cleanUrl,
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  // 5. Instagram Check
  const instagramMatch = cleanUrl.match(INSTAGRAM_REGEX);
  if (instagramMatch && instagramMatch[1]) {
    return {
      provider: "instagram",
      url: cleanUrl,
      embedUrl: `https://www.instagram.com/p/${instagramMatch[1]}/embed`,
    };
  }

  // 6. Direct MP4 Check
  // Also explicitly allow Cloudinary video URLs (which may not end in .mp4 but contain /video/upload/)
  const isCloudinaryVideo =
    cleanUrl.includes("res.cloudinary.com") && cleanUrl.includes("/video/upload/");
  
  if (DIRECT_MP4_REGEX.test(cleanUrl) || isCloudinaryVideo) {
    return {
      provider: "mp4",
      url: cleanUrl,
      embedUrl: cleanUrl, // For direct mp4s, the source URL is rendered via <video> tag directly
    };
  }

  throw new Error(
    "Invalid or unsupported video source. " +
      "We support YouTube, Vimeo, Loom, Google Drive, Instagram, and direct .mp4/Cloudinary video links."
  );
}
