// ============================================================
// TOPSEOTOOL — Enterprise Edge Security & Telemetry Middleware
// Defends against bot probes, enforces CSRF, rate limits auth routes,
// and applies HTTP security headers.
// ============================================================

import { NextResponse, type NextRequest } from "next/server"
import { validateCsrfOrigin } from "@/lib/security/csrf"
import { evaluateRateLimit, createRateLimitExceededResponse, RATE_LIMIT_TIERS } from "@/lib/security/rate-limiter"
import { applySecurityHeaders } from "@/lib/security/headers"
import { logSecurityAudit } from "@/lib/security/audit-logger"

// Scanner & Exploit probe paths to block immediately
const PROBE_PATHS = [
  /^\/\.env/i,
  /^\/\.git/i,
  /^\/\.aws/i,
  /^\/wp-(admin|login|content|includes)/i,
  /^\/xmlrpc\.php/i,
  /^\/phpmyadmin/i,
  /^\/adminer/i,
  /^\/actuator/i,
  /^\/cgi-bin/i,
  /^\/solr/i,
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method.toUpperCase()

  // 1. 🛡️ Block malicious scanner / bot probe paths
  for (const probePattern of PROBE_PATHS) {
    if (probePattern.test(pathname)) {
      void logSecurityAudit({
        eventType: "security.unauthorized_access",
        clientIp: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent"),
        status: "DENIED",
        metadata: { path: pathname, reason: "scanner_probe_blocked" },
      })
      return new NextResponse("Not Found", { status: 404 })
    }
  }

  // 2. 🛡️ CSRF Origin Protection on Mutation API Requests
  if (pathname.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrfResult = validateCsrfOrigin(request)
    if (!csrfResult.valid) {
      void logSecurityAudit({
        eventType: "security.csrf_blocked",
        clientIp: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent"),
        status: "DENIED",
        metadata: { path: pathname, reason: csrfResult.reason },
      })
      return NextResponse.json(
        {
          ok: false,
          error: "Cross-Site Request Forgery (CSRF) validation failed. Unauthorized origin.",
          code: "CSRF_DETECTED",
        },
        { status: 403 }
      )
    }
  }

  // 3. 🛡️ Edge Rate Limiting for Authentication Routes
  if (pathname.startsWith("/api/auth/callback/credentials") || pathname === "/api/auth/signin") {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1"
    const rateStatus = evaluateRateLimit(`auth:${clientIp}`, RATE_LIMIT_TIERS.AUTH)

    if (!rateStatus.allowed) {
      void logSecurityAudit({
        eventType: "security.rate_limit_exceeded",
        clientIp,
        userAgent: request.headers.get("user-agent"),
        status: "DENIED",
        metadata: { path: pathname, tier: "AUTH" },
      })
      return createRateLimitExceededResponse(rateStatus, "Too many login attempts. Please wait 1 minute before retrying.")
    }
  }

  // 4. 🚀 Proceed with Request
  const response = NextResponse.next()

  // 5. 🛡️ Inject Security Headers
  applySecurityHeaders(response.headers)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (svg, png, jpg, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
