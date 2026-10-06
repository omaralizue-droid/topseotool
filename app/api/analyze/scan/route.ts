import { NextRequest, NextResponse } from "next/server"
import { normalizeUrl, UserInputError } from "@/lib/analyzer/safe-fetch"
import { crawlSite } from "@/lib/analyzer/crawl"
import { buildReadinessChecks } from "@/lib/analyzer/scoring"
import { aiEnabled } from "@/lib/analyzer/gemini"
import { buildProfile, heuristicProfile } from "@/lib/analyzer/intelligence"
import type { ScanResponse } from "@/lib/analyzer/types"

export const dynamic = "force-dynamic"
export const maxDuration = 30

function inferBrandName(rawBrand: unknown, domain: string, title: string | null): string {
  if (typeof rawBrand === "string" && rawBrand.trim().length > 0) {
    return rawBrand.trim().slice(0, 80)
  }
  // Try clean segment from title
  if (title) {
    const parts = title.split(/[|\-–—:]/)
    if (parts.length > 1) {
      const candidate = parts[0].trim()
      if (candidate.length >= 2 && candidate.length <= 30) return candidate
    }
  }
  // Fall back to capitalized domain base
  const root = domain.split(".")[0].replace(/-/g, " ")
  return root.replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON request payload." }, { status: 400 })
    }

    const { url, brandName } = body as { url?: string; brandName?: string }
    if (!url || typeof url !== "string") {
      return NextResponse.json({ ok: false, error: "Please provide a valid website URL or domain." }, { status: 400 })
    }

    const normalizedUrl = normalizeUrl(url)
    const site = await crawlSite(normalizedUrl)
    const checks = buildReadinessChecks(site)
    const brand = inferBrandName(brandName, site.domain, site.title)

    let profile
    if (aiEnabled()) {
      try {
        profile = await buildProfile(brand, site)
      } catch (err) {
        console.warn("AI profiling failed, using heuristic profile:", err)
        profile = heuristicProfile(brand, site)
      }
    } else {
      profile = heuristicProfile(brand, site)
    }

    const responseData: ScanResponse = {
      ok: true,
      aiEnabled: aiEnabled(),
      site,
      checks,
      profile,
    }

    return NextResponse.json(responseData)
  } catch (err: unknown) {
    if (err instanceof UserInputError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 })
    }
    const message = err instanceof Error ? err.message : "Failed to analyze website."
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
