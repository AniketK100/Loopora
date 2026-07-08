/**
 * Security-First File Type Sniffer
 *
 * Validates extension, declared MIME, and binary magic-bytes signature 
 * to prevent spoofed/malicious uploads.
 *
 * @module lib/validators/fileSniffer
 */

export interface SnifferResult {
  isValid: boolean;
  sniffedMime: string;
  error?: string;
}

/**
 * Validates file signature, extension, and MIME type 100% locally.
 *
 * @param buffer Raw binary file contents
 * @param originalFilename Uploaded file name
 * @param declaredMime Client-reported MIME type
 */
export function validateMagicBytes(
  buffer: Buffer,
  originalFilename: string,
  declaredMime: string
): SnifferResult {
  const ext = originalFilename.split(".").pop()?.toLowerCase();
  if (!ext) {
    return { isValid: false, sniffedMime: "", error: "Missing file extension." };
  }

  const allowedExtensions = ["pdf", "docx", "png", "jpg", "jpeg", "webp"];
  if (!allowedExtensions.includes(ext)) {
    return { isValid: false, sniffedMime: "", error: `Unsupported extension: .${ext}` };
  }

  if (buffer.length < 12) {
    return { isValid: false, sniffedMime: "", error: "File too small to check signature." };
  }

  const hex = buffer.toString("hex", 0, 12).toUpperCase();

  // 1. PDF magic bytes: %PDF- (25 50 44 46)
  if (hex.startsWith("25504446")) {
    if (ext !== "pdf" || declaredMime !== "application/pdf") {
      return {
        isValid: false,
        sniffedMime: "application/pdf",
        error: "MIME/extension mismatch for PDF file signature.",
      };
    }
    return { isValid: true, sniffedMime: "application/pdf" };
  }

  // 2. PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (hex.startsWith("89504E470D0A1A0A")) {
    if (ext !== "png" || declaredMime !== "image/png") {
      return {
        isValid: false,
        sniffedMime: "image/png",
        error: "MIME/extension mismatch for PNG image signature.",
      };
    }
    return { isValid: true, sniffedMime: "image/png" };
  }

  // 3. JPEG magic bytes: FF D8 FF
  if (hex.startsWith("FFD8FF")) {
    if (!["jpg", "jpeg"].includes(ext) || declaredMime !== "image/jpeg") {
      return {
        isValid: false,
        sniffedMime: "image/jpeg",
        error: "MIME/extension mismatch for JPEG image signature.",
      };
    }
    return { isValid: true, sniffedMime: "image/jpeg" };
  }

  // 4. WEBP magic bytes: RIFF (52 49 46 46) ... WEBP (57 45 42 50 at offset 8)
  if (hex.startsWith("52494646") && hex.substring(16, 24) === "57454250") {
    if (ext !== "webp" || declaredMime !== "image/webp") {
      return {
        isValid: false,
        sniffedMime: "image/webp",
        error: "MIME/extension mismatch for WEBP image signature.",
      };
    }
    return { isValid: true, sniffedMime: "image/webp" };
  }

  // 5. DOCX magic bytes: ZIP container signature PK\x03\x04 (50 4B 03 04)
  if (hex.startsWith("504B0304")) {
    const docxMime =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (ext !== "docx" || declaredMime !== docxMime) {
      return {
        isValid: false,
        sniffedMime: docxMime,
        error: "MIME/extension mismatch for DOCX archive signature.",
      };
    }
    return { isValid: true, sniffedMime: docxMime };
  }

  return { isValid: false, sniffedMime: "", error: "File signature signature mismatch." };
}
