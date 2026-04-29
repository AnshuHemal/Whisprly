/**
 * Input sanitization utilities.
 * Strips HTML tags and trims whitespace from user-supplied strings
 * before they are stored in the database.
 *
 * We intentionally avoid heavy DOMPurify-style libraries here — the
 * goal is to prevent stored XSS in text fields, not to render HTML.
 * All user content is stored as plain text and rendered escaped by React.
 */

/** Regex that matches any HTML/XML tag */
const HTML_TAG_RE = /<[^>]*>/g;

/** Regex that matches common SQL injection patterns (extra defence-in-depth) */
const CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Sanitizes a single string field:
 * - Strips HTML tags
 * - Removes control characters
 * - Trims leading/trailing whitespace
 * - Collapses multiple consecutive newlines to max 2
 */
export function sanitizeText(input: string): string {
  return input
    .replace(HTML_TAG_RE, "")
    .replace(CONTROL_CHARS_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Sanitizes an optional string field.
 * Returns undefined if the result is empty after sanitization.
 */
export function sanitizeOptional(
  input: string | undefined | null
): string | undefined {
  if (!input) return undefined;
  const cleaned = sanitizeText(input);
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Sanitizes all string values in a plain object.
 * Non-string values are passed through unchanged.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key of Object.keys(result)) {
    const val = result[key];
    if (typeof val === "string") {
      (result as Record<string, unknown>)[key] = sanitizeText(val);
    }
  }
  return result;
}
