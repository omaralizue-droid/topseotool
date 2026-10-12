import { NextResponse, type NextRequest } from "next/server"

// Scanner & exploit probe paths to block immediately
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
]

// In-memory sliding window rate limiter
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string, limit = 60, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = ipRequestCounts.get(ip)

  if (!entry || now > entry.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }

  entry.count++
  if (entry.count > limit) {
    return true
  }

  // Periodic cleanup to avoid memory leak
  if (ipRequestCounts.size > 2000) {
    for (const [k, v] of ipRequestCounts.entries()) {
      if (now > v.resetAt) ipRequestCounts.delete(k)
    }
  }

  return false
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous"

  // 1. Block malicious scanner probes
  for (const pattern of PROBE_PATHS) {
    if (pattern.test(pathname)) {
      return new NextResponse("Not Found", { status: 404 })
    }
  }

  // 2. Rate limit API routes (30 requests / minute)
  if (pathname.startsWith("/api/analyze/")) {
    if (isRateLimited(ip, 30, 60_000)) {
      return NextResponse.json(
        { ok: false, error: "Rate limit exceeded. Please wait a minute before making more scan requests." },
        { status: 429, headers: { "Retry-After": "60" } }
      )
    }
  }

  // 3. Proceed with request
  const response = NextResponse.next()

  // 4. Apply standard security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
