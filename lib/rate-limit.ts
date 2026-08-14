// ============================================================
// TOPSEOTOOL — In-Memory Sliding Window Rate Limiter
// Prevents API abuse and rate-limits expensive endpoints.
// ============================================================
import { NextResponse } from "next/server"

interface RateLimitStore {
  timestamps: number[]
}

const rateLimitMap = new Map<string, RateLimitStore>()

// Periodically clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, store] of rateLimitMap.entries()) {
    store.timestamps = store.timestamps.filter((ts) => now - ts < 300_000)
    if (store.timestamps.length === 0) {
      rateLimitMap.delete(key)
    }
  }
}, 300_000)

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetMs: number
}

/**
 * Enforce rate limiting on a specific key (IP address, User ID, or Org ID).
 * @param key Unique key to track (e.g. "audit:user_123" or "auth:ip_1.2.3.4")
 * @param maxRequests Maximum requests allowed within window
 * @param windowMs Time window in milliseconds (e.g. 60,000ms = 1 min)
 */
export function checkRateLimit(
  key: string,
  maxRequests = 10,
  windowMs = 60_000
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - windowMs

  let store = rateLimitMap.get(key)
  if (!store) {
    store = { timestamps: [] }
    rateLimitMap.set(key, store)
  }

  // Filter timestamps within current window
  store.timestamps = store.timestamps.filter((ts) => ts > windowStart)

  if (store.timestamps.length >= maxRequests) {
    const oldestTimestamp = store.timestamps[0]
    const resetMs = Math.max(0, oldestTimestamp + windowMs - now)
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    }
  }

  // Record current request
  store.timestamps.push(now)
  const remaining = Math.max(0, maxRequests - store.timestamps.length)

  return {
    allowed: true,
    remaining,
    resetMs: windowMs,
  }
}

/**
 * Return a 429 Too Many Requests response if rate limit exceeded.
 */
export function rateLimitResponse(resetMs: number) {
  const retryAfterSec = Math.ceil(resetMs / 1000)
  return NextResponse.json(
    {
      ok: false,
      error: `Too many requests. Please try again in ${retryAfterSec} seconds.`,
    },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfterSec.toString(),
      },
    }
  )
}
