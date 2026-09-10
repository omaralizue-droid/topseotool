import { NextRequest, NextResponse } from "next/server"
import { authenticateV1Request, createV1Response } from "@/lib/tenant/v1-helper"
import { analyzeCompetitorDomain } from "@/lib/competitor/competitor-engine"

export async function GET(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "competitors:read")
  if (!auth) return response!

  const yourDomain = req.nextUrl.searchParams.get("domain") || "topseotool.net"
  const competitor = req.nextUrl.searchParams.get("competitor") || "semrush.com"

  const intel = analyzeCompetitorDomain(competitor, yourDomain)

  return createV1Response(req, auth, {
    yourDomain,
    targetCompetitor: competitor,
    domainRating: intel.domainRating,
    organicKeywords: intel.organicKeywordsCount,
    estimatedMonthlyTraffic: intel.estimatedMonthlyTraffic,
    trafficValueUsd: intel.monthlyTrafficValueUsd,
    backlinks: intel.backlinksCount,
    referringDomains: intel.referringDomainsCount,
    topPages: intel.topPages.slice(0, 5),
    rankingKeywords: intel.rankingKeywords.slice(0, 10),
    contentGaps: intel.contentGaps.slice(0, 5),
    trafficTrend: intel.trafficTrend,
  })
}

export async function POST(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "competitors:read")
  if (!auth) return response!

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { yourDomain = "topseotool.net", competitors = ["semrush.com", "ahrefs.com"] } = body

  const comparisons = (competitors as string[]).map((comp: string) => {
    const intel = analyzeCompetitorDomain(comp, yourDomain)
    return {
      competitorDomain: comp,
      domainRating: intel.domainRating,
      organicKeywords: intel.organicKeywordsCount,
      estimatedMonthlyTraffic: intel.estimatedMonthlyTraffic,
      trafficValueUsd: intel.monthlyTrafficValueUsd,
      backlinks: intel.backlinksCount,
      referringDomains: intel.referringDomainsCount,
      topKeywordsCount: intel.rankingKeywords.length,
    }
  })

  return createV1Response(req, auth, {
    yourDomain,
    competitorsTracked: comparisons.length,
    benchmarks: comparisons,
    analyzedAt: new Date().toISOString(),
  })
}
