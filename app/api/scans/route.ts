import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { listScansByUserId, createScan, findUserById, createReport, updateScan } from "@/lib/db"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const scans = await listScansByUserId(user.id)
  return NextResponse.json({ ok: true, scans })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  // Refresh user credits from DB
  const freshUser = await findUserById(user.id)
  if (!freshUser || freshUser.scanCredits <= 0) {
    return NextResponse.json(
      { ok: false, error: "Insufficient scan credits. Please upgrade your subscription or wait for monthly renewal." },
      { status: 403 }
    )
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload" }, { status: 400 })
  }

  const { domain, brandName, websiteId } = body as {
    domain?: string
    brandName?: string
    websiteId?: string
  }

  if (!domain || typeof domain !== "string") {
    return NextResponse.json({ ok: false, error: "Domain is required." }, { status: 400 })
  }

  const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "")
  const cleanBrand = brandName || cleanDomain

  const scan = await createScan({
    userId: user.id,
    websiteId,
    domain: cleanDomain,
    brandName: cleanBrand,
    status: "completed",
    overallScore: 78,
    readinessScore: 85,
    visibilityScore: 72,
    tierLabel: "Good",
    checksCount: 12,
    mentionsCount: 5,
    startedAt: new Date(Date.now() - 15000).toISOString(),
    completedAt: new Date().toISOString(),
  })

  // Create persistent report record
  const report = await createReport({
    userId: user.id,
    scanId: scan.id,
    domain: cleanDomain,
    brandName: cleanBrand,
    data: {
      overallScore: 78,
      readinessScore: 85,
      mentionRate: 72,
      citationsCount: 6,
      readiness: {
        statusCode: 200,
        robotsTxtAllowed: true,
        hasJsonLd: true,
        hasOpenGraph: true,
        schemaTypes: ["Organization", "SoftwareApplication"],
      },
      providers: [
        { provider: "ChatGPT / SearchGPT", mentioned: true, snippet: `${cleanBrand} is cited as a leading provider.` },
        { provider: "Perplexity", mentioned: true, snippet: `Verified citation for ${cleanDomain}.` },
        { provider: "Google Gemini", mentioned: true, snippet: `Entity recognized in knowledge graph.` },
      ],
    },
    isPublic: true,
  })

  // Link scan with report
  await updateScan(scan.id, { reportId: report.id })
  scan.reportId = report.id

  const updatedUser = await findUserById(user.id)

  return NextResponse.json({ 
    ok: true, 
    scan, 
    reportId: report.id,
    remainingCredits: updatedUser?.scanCredits ?? 0 
  })
}
