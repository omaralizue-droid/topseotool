// ============================================================
// TOPSEOTOOL — Enterprise Multi-Tier Sliding Window Rate Limiter
// RFC 6585 & IETF draft standard rate limiting headers
// ============================================================

import { NextResponse } from "next/server"

export interface RateLimitPolicy {
  maxRequests: number
  windowMs: number
}

export const RATE_LIMIT_TIERS = {
  // Authentication endpoints (login, register, forgot-password): 5 attempts / min
  AUTH: { maxRequests: 5, windowMs: 60_000 },
  // Password reset confirmation: 3 attempts / 15 min
  PASSWORD_RESET: { maxRequests: 3, windowMs: 900_000 },
  // SEO Audits & heavy web crawler runs: 10 per min per organization
  AUDIT_TRIGGER: { maxRequests: 10, windowMs: 60_000 },
  // AI Visibility scans: 15 per min per user
  AI_SCAN: { maxRequests: 15, windowMs: 60_000 },
  // Public keyword discovery queries: 20 per min per IP
  PUBLIC_EXPLORER: { maxRequests: 20, windowMs: 60_000 },
  // Standard internal dashboard endpoints: 120 per min
  DASHBOARD: { maxRequests: 120, windowMs: 60_000 },
  // Developer REST API v1: 120 requests / min default (plan-controlled)
  DEVELOPER_API: { maxRequests: 120, windowMs: 60_000 },
} as const

interface RateLimitEntry {
  timestamps: number[]
}

const memoryStore = new Map<string, RateLimitEntry>()

// Automatically prune entries older than 10 minutes every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of memoryStore.entries()) {
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < 600_000)
    if (entry.timestamps.length === 0) {
      memoryStore.delete(key)
    }
  }
}, 300_000)

export interface RateLimitStatus {
  allowed: boolean
  limit: number
  remaining: number
  resetSeconds: number
  resetTimestamp: number
}

/**
 * Evaluates rate limit for a client identifier and policy
 */
export function evaluateRateLimit(
  identifier: string,
  policy: RateLimitPolicy = RATE_LIMIT_TIERS.DASHBOARD
): RateLimitStatus {
  const now = Date.now()
  const windowStart = now - policy.windowMs

  let entry = memoryStore.get(identifier)
  if (!entry) {
    entry = { timestamps: [] }
    memoryStore.set(identifier, entry)
  }

  // Filter timestamps within current window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart)

  const oldest = entry.timestamps[0] ?? now
  const resetMs = Math.max(0, oldest + policy.windowMs - now)
  const resetSeconds = Math.ceil(resetMs / 1000)
  const resetTimestamp = Math.ceil((now + resetMs) / 1000)

  if (entry.timestamps.length >= policy.maxRequests) {
    return {
      allowed: false,
      limit: policy.maxRequests,
      remaining: 0,
      resetSeconds,
      resetTimestamp,
    }
  }

  entry.timestamps.push(now)
  const remaining = Math.max(0, policy.maxRequests - entry.timestamps.length)

  return {
    allowed: true,
    limit: policy.maxRequests,
    remaining,
    resetSeconds,
    resetTimestamp,
  }
}

/**
 * Returns standard RFC rate limit headers for HTTP responses
 */
export function getRateLimitHeaders(status: RateLimitStatus): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": status.limit.toString(),
    "X-RateLimit-Remaining": status.remaining.toString(),
    "X-RateLimit-Reset": status.resetTimestamp.toString(),
  }

  if (!status.allowed) {
    headers["Retry-After"] = status.resetSeconds.toString()
  }

  return headers
}

/**
 * Generates an RFC-compliant 429 Too Many Requests response
 */
export function createRateLimitExceededResponse(status: RateLimitStatus, message?: string): NextResponse {
  const msg = message || `Rate limit exceeded. Please retry after ${status.resetSeconds} seconds.`
  return NextResponse.json(
    {
      ok: false,
      error: msg,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfterSeconds: status.resetSeconds,
    },
    {
      status: 429,
      headers: getRateLimitHeaders(status),
    }
  )
}
