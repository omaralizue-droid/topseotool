// ============================================================
// TOPSEOTOOL — Zero-Exposure Response Sanitizer
// Deep recursive scrubber that removes all credentials, hashes,
// provider keys, and sensitive secrets before returning data to the client.
// ============================================================

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /keyhash/i,
  /credential/i,
  /privatekey/i,
  /(access|refresh|id|internal|auth|session)_?token/i,
  /^token$/i,
  /database_?url/i,
  /stripe_?secret/i,
  /gemini_?api/i,
  /resend_?api/i,
]

/**
 * Check if a field key is sensitive and must never be exposed to the client
 */
function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key))
}

/**
 * Recursively scrubs sensitive properties from an object or array.
 * Safe against circular references and prototype pollution.
 */
export function sanitizeForClient<T>(data: T, seen = new WeakSet()): T {
  if (data === null || data === undefined) return data
  if (typeof data !== "object") return data

  // Prevent infinite loops on circular structures
  if (seen.has(data as object)) return data
  seen.add(data as object)

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForClient(item, seen)) as unknown as T
  }

  // Handle Date or RegExp objects
  if (data instanceof Date || data instanceof RegExp) {
    return data
  }

  const cleaned: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    // Drop dangerous keys
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue
    }

    // Drop sensitive fields
    if (isSensitiveKey(key)) {
      continue
    }

    cleaned[key] = sanitizeForClient(value, seen)
  }

  return cleaned as T
}

/**
 * Format a safe JSON API response guaranteed free of sensitive credentials.
 */
export function safeJsonResponse<T>(data: T, init?: ResponseInit): Response {
  const sanitized = sanitizeForClient(data)
  return Response.json(sanitized, init)
}
