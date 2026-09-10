// ============================================================
// TOPSEOTOOL — Enterprise CSRF Protection & Origin Validation
// Protects state-changing browser mutations against Cross-Site Request Forgery
// ============================================================

// Note: No Node.js crypto import — uses Web-compatible APIs only (Edge Runtime safe)

/**
 * Validates the Origin and Referer headers of an incoming mutation request (POST, PUT, PATCH, DELETE).
 * Returns true if request originates from an authorized source or is an authenticated API client.
 */
export function validateCsrfOrigin(request: Request): { valid: boolean; reason?: string } {
  const method = request.method.toUpperCase()

  // Safe HTTP methods do not require CSRF validation
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return { valid: true }
  }

  // Requests authenticated via API Key / Authorization Bearer header are immune to browser CSRF
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return { valid: true }
  }

  // Webhooks from Stripe with Stripe-Signature are verified separately by HMAC
  if (request.headers.get("stripe-signature")) {
    return { valid: true }
  }

  const origin = request.headers.get("origin")
  const referer = request.headers.get("referer")
  const host = request.headers.get("host")

  // If both origin and referer are absent on a browser mutation request
  if (!origin && !referer) {
    // Allow non-browser programmatic clients if no session cookies are present
    const cookieHeader = request.headers.get("cookie")
    if (!cookieHeader || !cookieHeader.includes("authjs.session-token")) {
      return { valid: true }
    }
    return { valid: false, reason: "Missing Origin and Referer headers on session-authenticated mutation." }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `http://${host}` : "")
  let allowedHost = ""
  try {
    if (appUrl) {
      allowedHost = new URL(appUrl).host
    }
  } catch {
    allowedHost = host || ""
  }

  if (origin) {
    try {
      const originHost = new URL(origin).host
      if (originHost === host || originHost === allowedHost || originHost.endsWith(".topseotool.net") || originHost.startsWith("localhost")) {
        return { valid: true }
      }
      return { valid: false, reason: `Origin "${originHost}" does not match allowed host "${allowedHost}".` }
    } catch {
      return { valid: false, reason: "Malformed Origin header." }
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host
      if (refererHost === host || refererHost === allowedHost || refererHost.endsWith(".topseotool.net") || refererHost.startsWith("localhost")) {
        return { valid: true }
      }
      return { valid: false, reason: `Referer "${refererHost}" does not match allowed host "${allowedHost}".` }
    } catch {
      return { valid: false, reason: "Malformed Referer header." }
    }
  }

  return { valid: true }
}

/**
 * Constant-time token verification to eliminate timing attacks.
 * Uses TextEncoder for Edge Runtime compatibility (no Node.js crypto dependency).
 */
export function verifyCsrfToken(providedToken: string, expectedToken: string): boolean {
  if (!providedToken || !expectedToken) return false
  if (providedToken.length !== expectedToken.length) return false

  const enc = new TextEncoder()
  const a = enc.encode(providedToken)
  const b = enc.encode(expectedToken)

  if (a.length !== b.length) return false

  // XOR-based constant-time comparison
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i]
  }
  return diff === 0
}
