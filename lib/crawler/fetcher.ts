import { validateAndSanitizeUrl } from "./ssrf-guard"
import { ValidationError } from "@/lib/errors"

export interface FetchResult {
  url: string
  finalUrl: string
  statusCode: number
  headers: Record<string, string>
  html: string
  responseTimeMs: number
  contentLengthBytes: number
  isHttps: boolean
  redirectCount: number
}

const DEFAULT_TIMEOUT_MS = 8000
const MAX_RESPONSE_SIZE_BYTES = 2 * 1024 * 1024 // 2MB cap
const MAX_REDIRECTS = 5
const USER_AGENT = "TOPSEOTOOL-SEO-Bot/1.0 (+https://topseotool.net)"

export async function safeFetchWebsite(targetUrl: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<FetchResult> {
  let currentUrl = await validateAndSanitizeUrl(targetUrl)
  const initialUrlHref = currentUrl.href

  let redirectCount = 0
  const startTime = Date.now()

  while (redirectCount <= MAX_REDIRECTS) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(currentUrl.href, {
        method: "GET",
        headers: {
          "User-Agent": USER_AGENT,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Cache-Control": "no-cache",
        },
        signal: controller.signal,
        redirect: "manual", // Manual redirect handling to enforce SSRF validation on every redirect
      })

      // Check for redirect HTTP status codes (301, 302, 303, 307, 308)
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        redirectCount++
        if (redirectCount > MAX_REDIRECTS) {
          throw new ValidationError(`Crawl failed: Maximum redirect limit (${MAX_REDIRECTS}) exceeded.`)
        }

        const location = response.headers.get("location")
        if (!location) {
          throw new ValidationError(`Redirect response (${response.status}) missing 'Location' header.`)
        }

        // Resolve relative redirects against current URL base
        const nextUrlRaw = new URL(location, currentUrl.href).href

        // Re-run SSRF validation on the redirect target URL!
        currentUrl = await validateAndSanitizeUrl(nextUrlRaw)
        continue
      }

      const responseTimeMs = Date.now() - startTime

      // Ensure content type is HTML or XML
      const contentType = response.headers.get("content-type") ?? ""
      const isHtmlOrXml = contentType.includes("text/html") || contentType.includes("xml") || contentType.includes("text/plain")

      // Read response body up to max 2MB
      const buffer = await response.arrayBuffer()
      if (buffer.byteLength > MAX_RESPONSE_SIZE_BYTES) {
        throw new Error(`Response size (${Math.round(buffer.byteLength / 1024)}KB) exceeds 2MB limit.`)
      }

      const decoder = new TextDecoder("utf-8")
      const html = decoder.decode(buffer)

      const headersObj: Record<string, string> = {}
      response.headers.forEach((val, key) => {
        headersObj[key.toLowerCase()] = val
      })

      return {
        url: initialUrlHref,
        finalUrl: currentUrl.href,
        statusCode: response.status,
        headers: headersObj,
        html,
        responseTimeMs,
        contentLengthBytes: buffer.byteLength,
        isHttps: currentUrl.href.startsWith("https://"),
        redirectCount,
      }
    } catch (err: unknown) {
      const isAbort = (err as { name?: string })?.name === "AbortError"
      if (isAbort) {
        throw new Error(`Request to '${currentUrl.hostname}' timed out after ${timeoutMs / 1000} seconds.`)
      }
      throw err
    } finally {
      clearTimeout(timeoutId)
    }
  }

  throw new ValidationError("Maximum redirect limit exceeded.")
}