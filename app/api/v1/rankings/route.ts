import { NextRequest, NextResponse } from "next/server"
import { authenticateV1Request, createV1Response } from "@/lib/tenant/v1-helper"

const SAMPLE_RANKINGS = [
  { keyword: "ai seo platform", position: 1, prevPosition: 3, volume: 18400, url: "https://topseotool.net/ai-search", difficulty: 64, serpFeatures: ["AI Overview", "Snippet"] },
  { keyword: "chatgpt visibility checker", position: 2, prevPosition: 5, volume: 14200, url: "https://topseotool.net/ai-visibility", difficulty: 52, serpFeatures: ["AI Citation"] },
  { keyword: "enterprise rank tracker", position: 4, prevPosition: 4, volume: 22100, url: "https://topseotool.net/rank-tracker", difficulty: 78, serpFeatures: ["Site Links"] },
  { keyword: "backlink profile audit tool", position: 6, prevPosition: 9, volume: 9800, url: "https://topseotool.net/backlinks", difficulty: 46, serpFeatures: ["Knowledge Panel"] },
  { keyword: "technical seo crawler", position: 7, prevPosition: 12, volume: 12500, url: "https://topseotool.net/crawler", difficulty: 58, serpFeatures: ["Site Links"] },
]

export async function GET(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "rankings:read")
  if (!auth) return response!

  const domain = req.nextUrl.searchParams.get("domain") || "topseotool.net"
  const limit = Math.min(50, parseInt(req.nextUrl.searchParams.get("limit") || "10", 10))

  return createV1Response(req, auth, {
    domain,
    totalTracked: 1420,
    top3Count: 54,
    top10Count: 218,
    top50Count: 742,
    rankings: SAMPLE_RANKINGS.slice(0, limit),
  })
}

export async function POST(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "rankings:read")
  if (!auth) return response!

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { domain = "topseotool.net", keywords = [] } = body

  if (!Array.isArray(keywords) || keywords.length === 0) {
    return NextResponse.json({ error: "Parameter 'keywords' array required" }, { status: 400 })
  }

  return createV1Response(req, auth, {
    message: `Successfully registered ${keywords.length} keywords to daily rank surveillance for ${domain}`,
    domain,
    trackedKeywordsAdded: keywords,
    syncScheduledAt: new Date(Date.now() + 1000 * 60 * 5).toISOString(),
  }, 201)
}
