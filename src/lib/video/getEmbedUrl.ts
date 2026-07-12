/**
 * Video Embed URL Resolver
 *
 * Thin, backward-compatible wrapper around the declarative video parser
 * (`parseVideoUrl`). Resolves a raw video URL into a minimal `{ type, src }`
 * descriptor consumed by the public interview player components.
 *
 * @module lib/video/getEmbedUrl
 */

import { parseVideoUrl } from "@/lib/video/parseVideoUrl";

export interface ResolvedEmbed {
  type: "iframe" | "video" | "unsupported";
  src: string;
}

/**
 * Extracts a clean iframe or video player source URL from standard shares.
 *
 * @param url Raw video link input from CMS
 */
export function getEmbedUrl(url: string): ResolvedEmbed {
  const parsed = parseVideoUrl(url);

  if (!parsed.ok || !parsed.embedUrl || !parsed.embedKind) {
    return { type: "unsupported", src: url };
  }

  return { type: parsed.embedKind, src: parsed.embedUrl };
}
