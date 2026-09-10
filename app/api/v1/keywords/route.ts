import { NextRequest, NextResponse } from "next/server"
import { authenticateV1Request, createV1Response } from "@/lib/tenant/v1-helper"
import { generateKeywordResearch } from "@/lib/keywords/keyword-engine"

export async function GET(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "keywords:read")
  if (!auth) return response!

  const q = req.nextUrl.searchParams.get("q") || req.nextUrl.searchParams.get("keyword") || "ai seo tools"
  const country = req.nextUrl.searchParams.get("country") || "us"

  const research = generateKeywordResearch(q, country)

  return createV1Response(req, auth, {
    query: q,
    country,
    overview: research.overview,
    relatedKeywords: research.relatedKeywords.slice(0, 10),
    intentBreakdown: research.intentBreakdown,
  })
}

export async function POST(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "keywords:read")
  if (!auth) return response!

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const keywords: string[] = Array.isArray(body.keywords) ? body.keywords : [body.keyword || "ai seo tools"]
  const country = body.country || "us"

  const results = keywords.map((kw) => {
    const res = generateKeywordResearch(kw, country)
    return {
      keyword: kw,
      volume: res.overview.searchVolume,
      difficulty: res.overview.keywordDifficulty,
      cpc: res.overview.cpc,
      intent: res.overview.intent,
      serpFeatures: ["AI Overview", "Featured Snippet"],
    }
  })

  return createV1Response(req, auth, {
    totalKeywords: results.length,
    country,
    results,
  })
}
