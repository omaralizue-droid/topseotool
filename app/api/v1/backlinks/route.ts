import { NextRequest, NextResponse } from "next/server"
import { authenticateV1Request, createV1Response } from "@/lib/tenant/v1-helper"

export async function GET(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "backlinks:read")
  if (!auth) return response!

  const domain = req.nextUrl.searchParams.get("domain") || "topseotool.net"

  const data = {
    domain,
    domainRating: 84,
    totalBacklinks: 84200,
    referringDomains: 1420,
    dofollowRate: 82,
    nofollowRate: 18,
    toxicRiskScore: 2.1,
    toxicLinksCount: 1,
    anchors: [
      { label: "Branded ('topseotool')", percentage: 48, count: "40.4K links" },
      { label: "Target Keyword ('ai seo tool')", percentage: 24, count: "20.2K links" },
      { label: "Naked URL ('topseotool.net')", percentage: 18, count: "15.1K links" },
      { label: "Generic ('website', 'learn more')", percentage: 10, count: "8.4K links" },
    ],
    sampleTopLinks: [
      { sourceUrl: "https://searchengineland.com/enterprise-seo-guide-2026", sourceDr: 89, type: "DoFollow", toxicScore: 4 },
      { sourceUrl: "https://hubspot.com/blog/agency-growth-tools", sourceDr: 93, type: "DoFollow", toxicScore: 2 },
      { sourceUrl: "https://techcrunch.com/2026/02/generative-search-tools", sourceDr: 92, type: "DoFollow", toxicScore: 1 },
      { sourceUrl: "https://g2.com/products/topseotool/reviews", sourceDr: 91, type: "NoFollow", toxicScore: 3 },
    ],
    auditedAt: new Date().toISOString(),
  }

  return createV1Response(req, auth, data)
}

export async function POST(req: NextRequest) {
  const { auth, response } = await authenticateV1Request(req, "backlinks:read")
  if (!auth) return response!

  let body: any = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { targetDomain = "topseotool.net", minDr = 0 } = body

  return createV1Response(req, auth, {
    targetDomain,
    filtersApplied: { minDr },
    authorityScore: 84,
    liveBacklinksScanned: 84200,
    newBacklinksLast30Days: 142,
    lostBacklinksLast30Days: 18,
    disavowCandidateCount: 1,
  })
}
