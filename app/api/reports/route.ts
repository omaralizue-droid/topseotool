import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { listReportsByUserId, createReport, createScan } from "@/lib/db"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const reports = await listReportsByUserId(user.id)
  return NextResponse.json({ ok: true, reports })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 })
  }

  const { domain, brandName, data, overallScore, readinessScore, visibilityScore } = body as {
    domain?: string
    brandName?: string
    data?: any
    overallScore?: number
    readinessScore?: number
    visibilityScore?: number | null
  }

  if (!domain || !data) {
    return NextResponse.json({ ok: false, error: "Missing required report data." }, { status: 400 })
  }

  const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "")
  const cleanBrand = brandName || cleanDomain

  // Create scan record
  const scan = await createScan({
    userId: user.id,
    domain: cleanDomain,
    brandName: cleanBrand,
    status: "completed",
    overallScore: overallScore || 0,
    readinessScore: readinessScore || 0,
    visibilityScore: visibilityScore ?? null,
    tierLabel: (overallScore || 0) >= 80 ? "Excellent" : (overallScore || 0) >= 60 ? "Good" : "Needs work",
    checksCount: data.checks?.length || 0,
    mentionsCount: data.probes?.filter((p: any) => p.mentioned)?.length || 0,
    startedAt: new Date(Date.now() - 30000).toISOString(),
    completedAt: new Date().toISOString(),
  })

  // Create report record
  const report = await createReport({
    userId: user.id,
    scanId: scan.id,
    domain: cleanDomain,
    brandName: cleanBrand,
    data,
    isPublic: true,
  })

  return NextResponse.json({ ok: true, report, scan })
}
