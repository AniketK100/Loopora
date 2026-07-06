/**
 * HTML Sanitization Utility
 *
 * Sanitizes rich-text detailed answers using `sanitize-html` to prevent
 * stored cross-site scripting (XSS) attacks. Configures a safe allowlist
 * of HTML5 markup tags (paragraphs, headers, lists, tables, code blocks).
 *
 * @module lib/utils/sanitize
 * @see 02_TRD.md §4 — Security Requirements (Input validation/sanitization)
 * @see 05_Backend_Schema_Data_Auth.md §3 — Auth Design (Input validation/sanitization)
 */

import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes user/admin provided rich-text HTML using an allowlist.
 * Removes dangerous tags (<script>, <iframe>, <onerror>, etc.) and attributes.
 *
 * @param html The dirty HTML string
 * @returns Cleaned, safe HTML string
 */
export function sanitizeAnswerHtml(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  return sanitizeHtml(html, {
    // Standard elements needed for rich formatting of questions/answers
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "span",
      "code",
      "pre",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "a",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      span: ["class", "style"],
      code: ["class"],
      pre: ["class"],
      table: ["class", "style"],
      th: ["class", "style", "rowspan", "colspan"],
      td: ["class", "style", "rowspan", "colspan"],
    },
    // Automatically add secure rel attributes to external links
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
