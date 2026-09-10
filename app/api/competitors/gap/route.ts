import { NextRequest, NextResponse } from "next/server"
import { handleApiError } from "@/lib/errors"
import { generateKeywordGapAnalysis } from "@/lib/competitor/competitor-engine"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      yourDomain = "example.com",
      competitorA = "semrush.com",
      competitorB = "ahrefs.com",
      competitorC = "seranking.com",
    } = body

    const data = generateKeywordGapAnalysis(yourDomain, competitorA, competitorB, competitorC)

    return NextResponse.json({
      ok: true,
      data,
    })
  } catch (err) {
    return handleApiError(err, "KEYWORD_GAP_POST")
  }
}
