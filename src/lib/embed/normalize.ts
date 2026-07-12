/**
 * Video Embed URL Normalization Utility
 *
 * Strict server-side validation and parsing of video URLs. Detects the
 * provider (YouTube, YouTube Shorts, Vimeo, Loom, Google Drive, Instagram
 * posts/reels/tv or direct video files) and extracts the unique resource ID
 * to generate a normalized, safe embed URL.
 *
 * This is now a thin server-side wrapper around the declarative parser
 * (`parseVideoUrl`). Centralizing detection in one place guarantees the
 * stored `embedUrl` always matches what the client preview / public players
 * resolve, and keeps every supported platform variation (e.g. Instagram
 * `/reels/` plural, `m.instagram.com`, `www.instagram.com`) in sync.
 *
 * Rejecting arbitrary iframe tags or unapproved domains protects the
 * application against XSS and malicious iframe injections.
 *
 * @module lib/embed/normalize
 * @see 02_TRD.md §4 — Security Requirements (Embed URL allowlisting)
 * @see 05_Backend_Schema_Data_Auth.md §3 — Auth Design (Embed URL safety)
 */

import { VideoProvider } from "@/types";
import { parseVideoUrl } from "@/lib/video/parseVideoUrl";

export interface NormalizedVideo {
  provider: VideoProvider;
  url: string; // The original pasted URL (cleaned / fully-qualified)
  embedUrl: string; // The strictly formatted, safe embed URL
}

/**
 * Maps the declarative parser's platform id to the stored `VideoProvider`
 * enum value used by the Mongoose schema.
 */
const PLATFORM_TO_PROVIDER: Record<string, VideoProvider> = {
  youtube: "youtube",
  "youtube-shorts": "youtube",
  vimeo: "vimeo",
  loom: "loom",
  "google-drive": "drive",
  "instagram-post": "instagram",
  "instagram-reel": "instagram",
  "instagram-reels": "instagram",
  "instagram-tv": "instagram",
  direct: "mp4",
};

const UNSUPPORTED_MESSAGE =
  "Invalid or unsupported video source. " +
  "We support YouTube, YouTube Shorts, Vimeo, Loom, Google Drive, Instagram (posts/reels/tv), and direct .mp4/Cloudinary video links.";

/**
 * Parses a raw URL, detects the provider, and extracts the unique ID
 * to return a strictly structured, secure embed representation.
 *
 * @param url The raw user-supplied URL
 * @returns NormalizedVideo object containing provider, source URL, and embed URL
 * @throws {Error} If the URL is invalid or does not match any allowed provider
 */
export function normalizeVideoUrl(url: string): NormalizedVideo {
  if (!url || typeof url !== "string") {
    throw new Error("Video URL is required and must be a string");
  }

  const parsed = parseVideoUrl(url);

  if (!parsed.ok || !parsed.embedUrl || !parsed.platform) {
    throw new Error(UNSUPPORTED_MESSAGE);
  }

  const provider = PLATFORM_TO_PROVIDER[parsed.platform];
  if (!provider) {
    throw new Error(UNSUPPORTED_MESSAGE);
  }

  return {
    provider,
    url: parsed.normalizedUrl ?? url.trim(),
    embedUrl: parsed.embedUrl,
  };
}
