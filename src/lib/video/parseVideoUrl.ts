/**
 * Video URL Parser
 *
 * Detects, normalizes, validates and resolves video URLs from a wide range of
 * platforms (YouTube, YouTube Shorts, Vimeo, Loom, Google Drive, Instagram
 * posts/reels/tv and direct video files) into clean iframe / video embeds.
 *
 * The parser is built on a declarative platform registry so that new providers
 * can be added in a single place without touching the core logic (future-proof
 * architecture).
 *
 * @module lib/video/parseVideoUrl
 */

export type VideoPlatformId =
  | "youtube"
  | "youtube-shorts"
  | "vimeo"
  | "loom"
  | "google-drive"
  | "instagram-post"
  | "instagram-reel"
  | "instagram-tv"
  | "direct";

export type VideoEmbedKind = "iframe" | "video";

export interface VideoPlatform {
  id: VideoPlatformId;
  name: string;
  /** Matched against the URL to decide whether this platform handles it. */
  patterns: RegExp[];
  /**
   * Builds an embed descriptor from a successful pattern match.
   * Returns `null` when the platform cannot be embedded in a player.
   */
  buildEmbed: (match: RegExpMatchArray, normalized: string) => {
    kind: VideoEmbedKind;
    embedUrl: string;
  } | null;
}

export interface ParsedVideo {
  /** Whether a supported platform was detected and a usable embed exists. */
  ok: boolean;
  platform: VideoPlatformId | null;
  platformName: string;
  /** The cleaned, fully-qualified URL (or null when input is invalid). */
  normalizedUrl: string | null;
  /** Embed source for an iframe / <video> element, or null when unsupported. */
  embedUrl: string | null;
  embedKind: VideoEmbedKind | null;
  /** Human readable status used by the admin UI ("Detected: …"). */
  status: string;
  /** Error message when the URL could not be parsed. */
  error: string | null;
}

/** Ensure the URL has a protocol and parses as a valid absolute URL. */
function normalize(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

const PLATFORMS: VideoPlatform[] = [
  {
    id: "youtube",
    name: "YouTube",
    patterns: [
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
      /youtube\.com\/watch\?.*\bv=([a-zA-Z0-9_-]{11})/i,
    ],
    buildEmbed: (match) => ({
      kind: "iframe",
      embedUrl: `https://www.youtube.com/embed/${match[1]}?rel=0`,
    }),
  },
  {
    id: "youtube-shorts",
    name: "YouTube Shorts",
    patterns: [/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i],
    buildEmbed: (match) => ({
      kind: "iframe",
      embedUrl: `https://www.youtube.com/embed/${match[1]}?rel=0`,
    }),
  },
  {
    id: "vimeo",
    name: "Vimeo",
    patterns: [
      /vimeo\.com\/(\d+)/i,
      /player\.vimeo\.com\/video\/(\d+)/i,
    ],
    buildEmbed: (match) => ({
      kind: "iframe",
      embedUrl: `https://player.vimeo.com/video/${match[1]}`,
    }),
  },
  {
    id: "loom",
    name: "Loom",
    patterns: [
      /loom\.com\/share\/([a-zA-Z0-9]+)/i,
      /loom\.com\/embed\/([a-zA-Z0-9]+)/i,
    ],
    buildEmbed: (match) => ({
      kind: "iframe",
      embedUrl: `https://www.loom.com/embed/${match[1]}`,
    }),
  },
  {
    id: "google-drive",
    name: "Google Drive",
    patterns: [
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i,
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i,
    ],
    buildEmbed: (match) => ({
      kind: "iframe",
      embedUrl: `https://drive.google.com/file/d/${match[1]}/preview`,
    }),
  },
  {
    id: "instagram-post",
    name: "Instagram Post",
    patterns: [/instagram\.com\/p\/([a-zA-Z0-9_-]+)/i],
    buildEmbed: (match) => ({
      kind: "iframe",
      embedUrl: `https://www.instagram.com/p/${match[1]}/embed`,
    }),
  },
  {
    id: "instagram-reel",
    name: "Instagram Reel",
    patterns: [/instagram\.com\/reel\/([a-zA-Z0-9_-]+)/i],
    buildEmbed: (match) => ({
      kind: "iframe",
      embedUrl: `https://www.instagram.com/reel/${match[1]}/embed`,
    }),
  },
  {
    id: "instagram-tv",
    name: "Instagram TV",
    patterns: [/instagram\.com\/tv\/([a-zA-Z0-9_-]+)/i],
    buildEmbed: (match) => ({
      kind: "iframe",
      embedUrl: `https://www.instagram.com/tv/${match[1]}/embed`,
    }),
  },
  {
    id: "direct",
    name: "Direct Video",
    patterns: [/\.(mp4|webm|ogg)(?:\?.*)?$/i],
    buildEmbed: (_match, normalized) => ({
      kind: "video",
      embedUrl: normalized,
    }),
  },
];

/**
 * Parse a raw video URL into a structured, validated result.
 *
 * @param raw Raw video link input from the CMS or an external share.
 */
export function parseVideoUrl(raw: string): ParsedVideo {
  const normalized = normalize(raw);

  if (!normalized) {
    return {
      ok: false,
      platform: null,
      platformName: "",
      normalizedUrl: null,
      embedUrl: null,
      embedKind: null,
      status: "Unsupported URL format ❌",
      error: "Enter a valid, fully-qualified video URL.",
    };
  }

  const cloudinaryVideo =
    normalized.includes("res.cloudinary.com") &&
    normalized.includes("/video/upload/");

  if (cloudinaryVideo) {
    return {
      ok: true,
      platform: "direct",
      platformName: "Direct Video",
      normalizedUrl: normalized,
      embedUrl: normalized,
      embedKind: "video",
      status: "Direct Video (Cloudinary) ✅",
      error: null,
    };
  }

  for (const platform of PLATFORMS) {
    for (const pattern of platform.patterns) {
      const match = normalized.match(pattern);
      if (match) {
        const embed = platform.buildEmbed(match, normalized);
        if (embed) {
          return {
            ok: true,
            platform: platform.id,
            platformName: platform.name,
            normalizedUrl: normalized,
            embedUrl: embed.embedUrl,
            embedKind: embed.kind,
            status: `${platform.name} ✅`,
            error: null,
          };
        }
      }
    }
  }

  return {
    ok: false,
    platform: null,
    platformName: "",
    normalizedUrl: normalized,
    embedUrl: null,
    embedKind: null,
    status: "Unsupported URL format ❌",
    error:
      "This URL is not from a supported platform (YouTube, Vimeo, Loom, Google Drive, Instagram or a direct video file).",
  };
}
