/**
 * Sanitizes a string to prevent XSS by escaping HTML special characters.
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Recursively sanitizes an object's string values.
 */
export function sanitizeInput<T>(input: T): T {
  if (typeof input === "string") {
    return sanitizeHtml(input) as T
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput) as T
  }
  if (input && typeof input === "object") {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value)
    }
    return sanitized as T
  }
  return input
}

/**
 * Strips script tags and on* event handlers from a string.
 */
export function stripScripts(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
}

/**
 * Sanitizes HTML allowing only a safe allowlist of inline tags (<b>, <i>, <em>, <strong>, <br>).
 * All other tags and attributes are stripped. Use this for rendering user-facing chat messages
 * or any content that legitimately contains simple formatting.
 */
export function sanitizeAllowInline(input: string): string {
  // 1. Escape ampersands first
  let safe = input.replace(/&(?!amp;|lt;|gt;|quot;|#x27;|#x2F;)/g, "&amp;")

  // 2. Strip all tags except the allowlist — replace with empty string
  safe = safe.replace(/<(?!\/?(?:b|i|em|strong|br)\s*\/?>)[^>]+>/gi, "")

  // 3. Strip any remaining on* attributes inside allowed tags (belt & suspenders)
  safe = safe.replace(/\s+on\w+="[^"]*"/gi, "")
  safe = safe.replace(/\s+on\w+='[^']*'/gi, "")

  // 4. Strip javascript: in any remaining href/src (shouldn't exist after step 2, but defensive)
  safe = safe.replace(/javascript:/gi, "")

  return safe
}
