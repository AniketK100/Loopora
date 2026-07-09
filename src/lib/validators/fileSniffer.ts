/**
 * Security-First File Type Sniffer
 *
 * Validates extension, declared MIME, and binary magic-bytes signature
 * to prevent spoofed/malicious uploads. Rejects encrypted/password-protected PDFs.
 * Detects executables renamed to PDF.
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
 * Also detects encrypted/password-protected PDFs and rejects them.
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

  // Only PDF files are accepted
  if (ext !== "pdf") {
    return { isValid: false, sniffedMime: "", error: `Unsupported extension: .${ext}. Only PDF files are accepted.` };
  }

  if (buffer.length < 12) {
    return { isValid: false, sniffedMime: "", error: "File too small to check signature." };
  }

  const hex = buffer.toString("hex", 0, 12).toUpperCase();

  // PDF magic bytes: %PDF- (25 50 44 46)
  if (hex.startsWith("25504446")) {
    if (declaredMime !== "application/pdf") {
      return {
        isValid: false,
        sniffedMime: "application/pdf",
        error: "MIME type mismatch. Expected application/pdf.",
      };
    }

    // Check for encrypted/password-protected PDF
    const contentStr = buffer.toString("latin1");
    const hasEncryptDict = /\/Encrypt\s/i.test(contentStr);
    const hasStandardHandler = /\/Standard\s/i.test(contentStr);
    const hasUR3 = /\/UR\s*3\s/i.test(contentStr);

    if (hasEncryptDict || hasStandardHandler || hasUR3) {
      return {
        isValid: false,
        sniffedMime: "application/pdf",
        error: "Encrypted or password-protected PDF detected. Please upload an unprotected PDF file.",
      };
    }

    return { isValid: true, sniffedMime: "application/pdf" };
  }

  return { isValid: false, sniffedMime: "", error: "Invalid file signature. Only PDF files are accepted." };
}
