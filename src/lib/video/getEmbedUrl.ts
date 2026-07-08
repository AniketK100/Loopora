/**
 * Video Embed URL Resolver
 *
 * Parses video URLs (YouTube, Vimeo, Loom, Google Drive, Instagram, direct MP4)
 * and formats them into clean embed URLs compatible with iframe players.
 *
 * @module lib/video/getEmbedUrl
 */

export interface ResolvedEmbed {
  type: "iframe" | "video" | "unsupported";
  src: string;
}

/**
 * Extracts clean iframe or video player source URL from standard shares.
 *
 * @param url Raw video link input from CMS
 */
export function getEmbedUrl(url: string): ResolvedEmbed {
  if (!url) return { type: "unsupported", src: "" };
  const cleanUrl = url.trim();

  // YouTube matches
  const ytMatch = cleanUrl.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|||user\/.+\/)?(?:watch\?v=|&v=)?|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return { type: "iframe", src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // Vimeo matches
  const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: "iframe", src: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  // Loom matches
  const loomMatch = cleanUrl.match(/(?:loom\.com\/share\/|loom\.com\/embed\/)([a-f0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    return { type: "iframe", src: `https://www.loom.com/embed/${loomMatch[1]}` };
  }

  // Google Drive match
  const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return { type: "iframe", src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
  }

  // Instagram match
  const instagramMatch = cleanUrl.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
  if (instagramMatch && instagramMatch[1]) {
    return { type: "iframe", src: `https://www.instagram.com/p/${instagramMatch[1]}/embed` };
  }

  // Direct MP4 / Cloudinary match
  if (
    /\.(mp4|webm|ogg)$/i.test(cleanUrl) ||
    (cleanUrl.includes("res.cloudinary.com") && cleanUrl.includes("/video/upload/"))
  ) {
    return { type: "video", src: cleanUrl };
  }

  return { type: "unsupported", src: cleanUrl };
}
