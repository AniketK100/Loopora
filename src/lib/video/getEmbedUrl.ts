/**
 * Video Embed URL Resolver
 *
 * Thin, backward-compatible wrapper around the declarative video parser
 * (`parseVideoUrl`). Resolves a raw video URL into a minimal `{ type, src,
 * aspectRatio }` descriptor consumed by the public interview player components.
 *
 * When a server-validated `storedEmbedUrl` is supplied (the embed previously
 * persisted on the question document) it is preferred for `src` so the player
 * always renders the exact, sanitized embed that was saved — while still
 * deriving the correct `aspectRatio` from the live parse.
 *
 * @module lib/video/getEmbedUrl
 */

import { parseVideoUrl } from "@/lib/video/parseVideoUrl";

export interface ResolvedEmbed {
  type: "iframe" | "video" | "unsupported";
  src: string;
  /** Suggested CSS `aspect-ratio` for the player container (e.g. "9 / 16"). */
  aspectRatio?: string;
}

/**
 * Extracts a clean iframe or video player source URL from standard shares.
 *
 * @param url Raw video link input from CMS
 * @param storedEmbedUrl Optional, previously persisted embed URL to prefer
 */
export function getEmbedUrl(url: string, storedEmbedUrl?: string | null): ResolvedEmbed {
  const parsed = parseVideoUrl(url);

  if (!parsed.ok || !parsed.embedUrl || !parsed.embedKind) {
    // Fall back to a stored embed if the live parse failed but we have one.
    if (storedEmbedUrl) {
      return { type: "iframe", src: storedEmbedUrl, aspectRatio: parsed.aspectRatio };
    }
    return { type: "unsupported", src: url, aspectRatio: undefined };
  }

  return {
    type: parsed.embedKind,
    src: storedEmbedUrl || parsed.embedUrl,
    aspectRatio: parsed.aspectRatio,
  };
}
