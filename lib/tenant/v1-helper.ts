import { NextRequest, NextResponse } from "next/server"
import { verifyEnterpriseApiKey, logApiRequest, ApiScope, ApiKeyVerificationResult } from "@/lib/tenant/api-keys"

export interface AuthenticatedApiContext {
  verification: ApiKeyVerificationResult
  startTime: number
}

export async function authenticateV1Request(
  req: NextRequest,
  requiredScope?: ApiScope
): Promise<{ auth: AuthenticatedApiContext | null; response?: NextResponse }> {
  const startTime = Date.now()
  const authHeader = req.headers.get("authorization") || ""
  const token = authHeader.replace(/^Bearer\s+/i, "").trim()

  if (!token) {
    const errorRes = NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        message: "Missing API Key. Provide key via header: 'Authorization: Bearer topseo_live_...'",
      },
      { status: 401 }
    )
    return { auth: null, response: errorRes }
  }

  const verification = await verifyEnterpriseApiKey(token, requiredScope)

  if (!verification.valid) {
    const isRateLimited = verification.rateLimitRemaining === 0
    const status = isRateLimited ? 429 : verification.error?.startsWith("Forbidden") ? 403 : 401
    const errorRes = NextResponse.json(
      {
        success: false,
        error: isRateLimited ? "Rate Limit Exceeded" : status === 403 ? "Forbidden" : "Unauthorized",
        message: verification.error,
        quota: {
          rateLimitPerMin: verification.rateLimitPerMin,
          rateLimitRemaining: verification.rateLimitRemaining,
        },
      },
      { status }
    )

    if (verification.rateLimitPerMin) {
      errorRes.headers.set("X-RateLimit-Limit", String(verification.rateLimitPerMin))
      errorRes.headers.set("X-RateLimit-Remaining", String(verification.rateLimitRemaining ?? 0))
    }

    logApiRequest({
      organizationId: verification.organizationId || "unknown",
      keyPrefix: token.slice(0, 16),
      method: req.method,
      endpoint: req.nextUrl.pathname,
      status,
      latencyMs: Date.now() - startTime,
      clientIp: req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
    })

    return { auth: null, response: errorRes }
  }

  return {
    auth: { verification, startTime },
  }
}

export function createV1Response(
  req: NextRequest,
  auth: AuthenticatedApiContext,
  data: any,
  status = 200
): NextResponse {
  const latencyMs = Date.now() - auth.startTime
  const verification = auth.verification

  const response = NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        latencyMs,
      },
      quota: {
        rateLimitPerMin: verification.rateLimitPerMin,
        rateLimitRemaining: verification.rateLimitRemaining,
      },
    },
    { status }
  )

  if (verification.rateLimitPerMin) {
    response.headers.set("X-RateLimit-Limit", String(verification.rateLimitPerMin))
    response.headers.set("X-RateLimit-Remaining", String(verification.rateLimitRemaining ?? 100))
  }

  logApiRequest({
    organizationId: verification.organizationId || "demo-org",
    keyPrefix: verification.apiKeyId || "topseo_live_key",
    method: req.method,
    endpoint: req.nextUrl.pathname,
    status,
    latencyMs,
    clientIp: req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
  })

  return response
}
