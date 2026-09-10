import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"
import { analyzeCompetitorDomain } from "@/lib/competitor/competitor-engine"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { domain, yourDomain = "example.com" } = body

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Competitor domain is required" }, { status: 400 })
    }

    const data = analyzeCompetitorDomain(domain, yourDomain)

    return NextResponse.json({
      ok: true,
      data,
    })
  } catch (err) {
    return handleApiError(err, "COMPETITOR_ANALYZE_POST")
  }
}
