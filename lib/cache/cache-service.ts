// ============================================================
// TOPSEOTOOL — Enterprise Cache Service
// Memory + Redis / Upstash Cache Abstraction
// Reduces redundant crawls, LLM calls, and expensive SERP queries
// ============================================================

import { logger } from "@/lib/logger"

export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

class MemoryCacheAdapter implements CacheAdapter {
  private store = new Map<string, { value: any; expiresAt: number }>()

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key)
    if (!item) return null
    if (Date.now() > item.expiresAt) {
      this.store.delete(key)
      return null
    }
    return item.value as T
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    })
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key)
  }

  async clear(): Promise<void> {
    this.store.clear()
  }
}

class UpstashRedisCacheAdapter implements CacheAdapter {
  private url: string
  private token: string

  constructor(url: string, token: string) {
    this.url = url.replace(/\/$/, "")
    this.token = token
  }

  private async fetchCommand(command: string, ...args: (string | number)[]) {
    const res = await fetch(`${this.url}/${command}/${args.join("/")}`, {
      headers: { Authorization: `Bearer ${this.token}` },
      cache: "no-store",
    })
    if (!res.ok) throw new Error(`Upstash error: ${res.statusText}`)
    return res.json()
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.fetchCommand("get", encodeURIComponent(key))
      if (!data.result) return null
      return JSON.parse(data.result) as T
    } catch {
      return null
    }
  }

  async set<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
    try {
      const serialized = encodeURIComponent(JSON.stringify(value))
      await this.fetchCommand("setex", encodeURIComponent(key), ttlSeconds, serialized)
    } catch (err) {
      logger.warn("Redis set failed, ignoring", "CACHE", { key, err })
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.fetchCommand("del", encodeURIComponent(key))
    } catch (err) {
      logger.warn("Redis del failed", "CACHE", { key, err })
    }
  }

  async clear(): Promise<void> {
    try {
      await this.fetchCommand("flushdb")
    } catch (err) {
      logger.warn("Redis clear failed", "CACHE", { err })
    }
  }
}

function resolveCacheAdapter(): CacheAdapter {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (upstashUrl && upstashToken) {
    return new UpstashRedisCacheAdapter(upstashUrl, upstashToken)
  }

  return new MemoryCacheAdapter()
}

export const cache = resolveCacheAdapter()

/**
 * Remember helper: returns cached value or computes and caches it.
 */
export async function cacheRemember<T>(
  key: string,
  ttlSeconds: number,
  computeFn: () => Promise<T>
): Promise<T> {
  const cached = await cache.get<T>(key)
  if (cached !== null && cached !== undefined) {
    return cached
  }

  const computed = await computeFn()
  await cache.set(key, computed, ttlSeconds)
  return computed
}
