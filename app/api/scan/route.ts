import { NextRequest, NextResponse } from "next/server"
import { runPublicAIVisibilityScan } from "@/lib/ai-visibility/scan-engine"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { logger } from "@/lib/logger"

// Global singleton store for public scan results — shared across route modules
// in the same Node.js process. Keyed by scanId.
declare global {
  // eslint-disable-next-line no-var
  var __publicScanStore: Map<
    string,
    { status: "running" | "completed" | "failed"; result?: any; error?: string; startedAt: number }
  >
}
if (!global.__publicScanStore) {
  global.__publicScanStore = new Map()
}
const publicScanStore = global.__publicScanStore

// Clean up old scans every hour
setInterval(
  () => {
    const cutoff = Date.now() - 1000 * 60 * 60
    for (const [id, scan] of publicScanStore.entries()) {
      if (scan.startedAt < cutoff) publicScanStore.delete(id)
    }
  },
  1000 * 60 * 60
)

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 3 scans per hour per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown"
    const rl = checkRateLimit(`public-scan:${ip}`, 3, 60 * 60 * 1000)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const body = await req.json()
    const { url, competitorUrl } = body

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate Primary URL format
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Block private/localhost URLs
    const hostname = parsedUrl.hostname
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.endsWith(".local")
    ) {
      return NextResponse.json({ error: "Private URLs are not allowed" }, { status: 400 })
    }

    // Validate Competitor URL if provided
    let parsedCompUrl: URL | undefined
    if (competitorUrl && typeof competitorUrl === "string" && competitorUrl.trim()) {
      try {
        parsedCompUrl = new URL(competitorUrl.startsWith("http") ? competitorUrl : `https://${competitorUrl}`)
        const compHostname = parsedCompUrl.hostname
        if (
          compHostname === "localhost" ||
          compHostname === "127.0.0.1" ||
          compHostname.startsWith("192.168.") ||
          compHostname.startsWith("10.") ||
          compHostname.endsWith(".local")
        ) {
          return NextResponse.json({ error: "Private competitor URLs are not allowed" }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: "Invalid Competitor URL format" }, { status: 400 })
      }
    }

    // Generate a scan ID
    const scanId = `pub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    // Store initial state
    publicScanStore.set(scanId, { status: "running", startedAt: Date.now() })

    // Run scan in background (non-blocking)
    runPublicAIVisibilityScan(parsedUrl.href, parsedCompUrl?.href)
      .then((result) => {
        publicScanStore.set(scanId, { status: "completed", result, startedAt: Date.now() })
        logger.info(`Public scan ${scanId} completed for ${url}`, "PUBLIC_SCAN_API")
      })
      .catch((err) => {
        publicScanStore.set(scanId, { status: "failed", error: err.message, startedAt: Date.now() })
        logger.error(`Public scan ${scanId} failed for ${url}`, "PUBLIC_SCAN_API", err)
      })

    return NextResponse.json({
      ok: true,
      data: { scanId, status: "running", message: "Scan started. Poll /api/scan/:scanId for results." },
    })
  } catch (err: any) {
    logger.error("Public scan POST failed", "PUBLIC_SCAN_API", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Export store for GET route
export { publicScanStore }
