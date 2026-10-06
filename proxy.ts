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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Block malicious scanner probes
  for (const pattern of PROBE_PATHS) {
    if (pattern.test(pathname)) {
      return new NextResponse("Not Found", { status: 404 })
    }
  }

  // 2. Proceed with request
  const response = NextResponse.next()

  // 3. Apply standard security headers
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
