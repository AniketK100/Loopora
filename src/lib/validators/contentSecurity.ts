/**
 * Content Security Utilities
 *
 * Scans extracted text for prompt injection, unicode abuse,
 * excessive length, and empty/image-only content.
 *
 * @module lib/validators/contentSecurity
 */

const MAX_TEXT_LENGTH = 100_000;
const MIN_TEXT_LENGTH = 50;

// Prompt injection patterns commonly used to hijack AI
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,
  /you\s+are\s+now\s+(a|an)\s+(different|new|evil|jailbroken)/i,
  /system\s*:\s*/i,
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<\|system\|>/i,
  /<\|user\|>/i,
  /<\|assistant\|>/i,
  /assistant\s*:\s*/i,
  /human\s*:\s*/i,
  /do\s+not\s+(follow|obey|listen\s+to)\s+(the\s+)?(system|previous)/i,
  /override\s+(safety|content|security)\s+(filter|policy|restriction)/i,
  /bypass\s+(content|safety)\s+(filter|moderation)/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /pretend\s+(you\s+are|to\s+be)\s+(an?\s+)?(unrestricted|uncensored|evil)/i,
  /act\s+as\s+if\s+(you\s+)?(have\s+no|don.t\s+have|lack)\s+(rules?|restrictions?|limits?)/i,
];

// Unicode abuse patterns (homoglyph attacks, RTL override, etc.)
const UNICODE_PATTERNS = [
  /[\u200B\u200C\u200D\uFEFF]/, // Zero-width characters
  /[\u202A-\u202E]/, // Directional overrides
  /[\u2066-\u2069]/, // Directional isolates
  /[\u0340\u0341\u0342\u0343\u0344]/, // Combining characters that can obscure text
  /[\u00AD\u0600-\u0605\u061C\u06DD\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]/, // Format characters
];

// Suspicious patterns for executable-in-PDF detection
const EXECUTABLE_SIGNATURES = [
  /%PDF[\s\S]*%%EOF[\s\S]*[\x00-\x08\x0e-\x1f]{4,}/, // PDF with embedded binary
  /JavaScript\s*:/i,
  /OpenAction/i,
  /AA\s*<<.*\/Launch/i,
  /\/EmbeddedFile/i,
  /\/Names\s*<<.*\/JavaScript/i,
];

export interface ContentSecurityResult {
  isSafe: boolean;
  errors: string[];
}

/**
 * Scans extracted text for security threats and quality issues.
 */
export function scanContent(text: string): ContentSecurityResult {
  const errors: string[] = [];

  // Empty or too short text (image-only PDFs)
  if (text.length < MIN_TEXT_LENGTH) {
    errors.push("PDF contains insufficient extractable text. It may be image-only or corrupted.");
  }

  // Excessive text (zip bomb or corrupted binary)
  if (text.length > MAX_TEXT_LENGTH) {
    errors.push("Extracted text exceeds maximum allowed length. File may be corrupted.");
  }

  // Prompt injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      errors.push("Resume text contains suspicious prompt injection patterns.");
      break;
    }
  }

  // Unicode abuse
  for (const pattern of UNICODE_PATTERNS) {
    if (pattern.test(text)) {
      errors.push("Resume text contains suspicious unicode characters.");
      break;
    }
  }

  return {
    isSafe: errors.length === 0,
    errors,
  };
}

/**
 * Scans raw PDF buffer for executable signatures and embedded threats.
 */
export function scanPdfBuffer(buffer: Buffer): ContentSecurityResult {
  const errors: string[] = [];
  const content = buffer.toString("latin1");

  for (const pattern of EXECUTABLE_SIGNATURES) {
    if (pattern.test(content)) {
      errors.push("PDF contains executable code or embedded files.");
      break;
    }
  }

  return {
    isSafe: errors.length === 0,
    errors,
  };
}
