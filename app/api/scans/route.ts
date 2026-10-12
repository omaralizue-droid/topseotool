import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { listScansByUserId, createScan, findUserById, createReport, updateScan } from "@/lib/db"
import { normalizeUrl, UserInputError } from "@/lib/analyzer/safe-fetch"
import { crawlSite } from "@/lib/analyzer/crawl"
import { buildReadinessChecks, readinessScore, scoreLabel } from "@/lib/analyzer/scoring"
import { executeMultiProviderChecks } from "@/lib/analyzer/providers"

export const dynamic = "force-dynamic"
export const maxDuration = 60

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

  if (!domain || typeof domain !== "string" || !domain.trim()) {
    return NextResponse.json({ ok: false, error: "Domain is required." }, { status: 400 })
  }

  let normalizedUrl: URL
  try {
    normalizedUrl = normalizeUrl(domain)
  } catch (err) {
    if (err instanceof UserInputError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: "Invalid website domain format." }, { status: 400 })
  }

  const cleanDomain = normalizedUrl.hostname.toLowerCase()
  const cleanBrand = brandName && brandName.trim()
    ? brandName.trim()
    : cleanDomain.split(".")[0].replace(/\b\w/g, (c) => c.toUpperCase())

  const startTime = Date.now()

  // 1. Execute live website technical crawl
  let site = null
  try {
    site = await crawlSite(normalizedUrl)
  } catch (err) {
    console.warn(`Technical crawl notice for ${cleanDomain}:`, err)
  }

  // 2. Evaluate technical readiness
  const checks = site ? buildReadinessChecks(site) : []
  const rScore = checks.length ? readinessScore(checks) : 30

  // 3. Query modular AI providers
  const query = `What is ${cleanBrand} (${cleanDomain}), what does it offer, and is it a recommended platform in its category?`
  const providerEvidences = await executeMultiProviderChecks({
    brand: cleanBrand,
    domain: cleanDomain,
    query,
    intent: "branded",
  })

  // 4. Calculate honest visibility metrics from evidence
  const completedChecks = providerEvidences.filter((p) => p.status === "completed")
  const mentionsCount = completedChecks.filter((p) => p.mentioned).length
  const uniqueCitations = Array.from(new Set(providerEvidences.flatMap((p) => p.citationUrls)))
  const citationsCount = uniqueCitations.length

  const vScore = completedChecks.length > 0
    ? Math.round((mentionsCount / completedChecks.length) * 100)
    : null

  const overall = vScore !== null
    ? Math.round(vScore * 0.6 + rScore * 0.4)
    : rScore

  const tier = scoreLabel(overall)

  // Map provider evidence for report payload compatibility
  const formattedProviders = providerEvidences.map((pe) => ({
    provider: pe.providerName,
    id: pe.providerId,
    model: pe.model,
    status: pe.status,
    mentioned: pe.mentioned,
    domainCited: pe.domainCited,
    citationUrl: pe.citationUrls[0] || null,
    citationUrls: pe.citationUrls,
    snippet: pe.snippet || null,
    query: pe.query,
    sentiment: pe.sentiment,
    error: pe.error || null,
    limitationNotice: pe.limitationNotice || null,
    timestamp: pe.timestamp,
  }))

  const completedAt = new Date().toISOString()

  // Create persistent scan record
  const scan = await createScan({
    userId: user.id,
    websiteId,
    domain: cleanDomain,
    brandName: cleanBrand,
    status: "completed",
    overallScore: overall,
    readinessScore: rScore,
    visibilityScore: vScore,
    tierLabel: tier.label,
    checksCount: checks.length,
    mentionsCount,
    startedAt: new Date(startTime).toISOString(),
    completedAt,
  })

  // Create persistent report record with verified payload
  const report = await createReport({
    userId: user.id,
    scanId: scan.id,
    domain: cleanDomain,
    brandName: cleanBrand,
    data: {
      overallScore: overall,
      readinessScore: rScore,
      visibilityScore: vScore,
      mentionRate: vScore ?? 0,
      citationsCount,
      citations: uniqueCitations,
      readiness: {
        statusCode: site?.statusCode ?? 200,
        robotsTxtAllowed: site ? !site.bots.some((b) => b.status === "blocked") : true,
        hasJsonLd: site ? site.schemaTypes.length > 0 : false,
        hasOpenGraph: site?.hasOpenGraph ?? false,
        schemaTypes: site?.schemaTypes ?? [],
      },
      providers: formattedProviders,
      checks: checks.map((c) => ({ id: c.id, label: c.label, status: c.status, detail: c.detail })),
      evidenceTimestamp: completedAt,
      scopeDisclaimer: "Provider results reflect real API query responses at scan timestamp. End-user chat sessions may vary based on user context.",
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
    remainingCredits: updatedUser?.scanCredits ?? 0,
  })
}
