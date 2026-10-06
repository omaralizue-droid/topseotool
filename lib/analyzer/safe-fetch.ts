import net from "node:net"
import dns from "node:dns/promises"

// ─────────────────────────────────────────────────────────────────────────────
// SSRF-safe HTTP fetcher. Every hop (including redirects) is validated so users
// cannot make the server request internal or cloud-metadata addresses.
// ─────────────────────────────────────────────────────────────────────────────

export class UserInputError extends Error {}

const PRIVATE_V4 = [
  /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^169\.254\./, /^0\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^192\.0\.0\./, /^192\.0\.2\./, /^198\.1[89]\./,
  /^198\.51\.100\./, /^203\.0\.113\./, /^2(2[4-9]|3\d)\./, /^2(4\d|5[0-5])\./,
]
const PRIVATE_V6 = ["::1", "fe80:", "fc", "fd", "ff", "::ffff:"]
const BLOCKED_HOSTS = new Set(["localhost", "metadata", "metadata.google.internal", "instance-data"])

function isPrivateIp(ip: string): boolean {
  const v = ip.toLowerCase()
  if (net.isIPv4(v)) return PRIVATE_V4.some((r) => r.test(v))
  if (net.isIPv6(v)) {
    if (v === "::") return true
    if (v.startsWith("::ffff:")) return isPrivateIp(v.slice(7))
    return PRIVATE_V6.some((p) => v.startsWith(p))
  }
  return false
}

/** Normalizes user input ("stripe.com", "https://www.stripe.com/x") into a validated public URL. */
export function normalizeUrl(raw: string): URL {
  const trimmed = raw.trim()
  if (!trimmed) throw new UserInputError("Please enter your website URL.")
  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
  } catch {
    throw new UserInputError("That doesn't look like a valid URL. Try something like example.com")
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new UserInputError("Only http and https websites can be analyzed.")
  }
  const host = url.hostname.toLowerCase()
  if (
    BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal") ||
    host.endsWith(".localhost") || net.isIP(host.replace(/^\[|\]$/g, "")) !== 0
  ) {
    throw new UserInputError("Please enter a public website domain (IP addresses and local hosts aren't supported).")
  }
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i.test(host)) {
    throw new UserInputError("Please enter a valid domain name, e.g. example.com")
  }
  url.hash = ""
  return url
}

async function assertPublicHost(hostname: string): Promise<void> {
  try {
    const results = await dns.lookup(hostname, { all: true })
    if (!results || results.length === 0) {
      throw new UserInputError(`We couldn't find the domain "${hostname}". Check the spelling.`)
    }
    for (const r of results) {
      if (isPrivateIp(r.address)) {
        throw new UserInputError("That domain points to a private network and can't be analyzed.")
      }
    }
  } catch (err) {
    if (err instanceof UserInputError) throw err
    throw new UserInputError(`We couldn't find the domain "${hostname}". Check the spelling.`)
  }
}

export interface FetchedPage {
  finalUrl: string
  status: number
  body: string
  contentType: string
  responseTimeMs: number
}

const UA = "Mozilla/5.0 (compatible; TopSEOToolBot/2.0; +https://topseotool.net)"
const MAX_BYTES = 1_500_000

export async function safeFetch(
  target: URL,
  { timeoutMs = 8000, maxRedirects = 5 }: { timeoutMs?: number; maxRedirects?: number } = {}
): Promise<FetchedPage> {
  let current = target
  const started = Date.now()

  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertPublicHost(current.hostname)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(current.href, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
          "Accept-Language": "en-US,en;q=0.8",
        },
      })

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location")
        if (!location) throw new Error(`Redirect (${res.status}) without a Location header`)
        current = normalizeUrl(new URL(location, current).href)
        continue
      }

      const body = await readCapped(res)
      return {
        finalUrl: current.href,
        status: res.status,
        body,
        contentType: res.headers.get("content-type") ?? "",
        responseTimeMs: Date.now() - started,
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") throw new Error(`Timed out after ${timeoutMs / 1000}s`)
      throw err
    } finally {
      clearTimeout(timer)
    }
  }
  throw new Error("Too many redirects")
}

async function readCapped(res: Response): Promise<string> {
  if (!res.body) return ""
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    chunks.push(value)
    if (size >= MAX_BYTES) {
      await reader.cancel()
      break
    }
  }
  return new TextDecoder("utf-8").decode(Buffer.concat(chunks))
}
