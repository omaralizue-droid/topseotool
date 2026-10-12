import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { listCompetitorsByUserId, createCompetitor, deleteCompetitor, PLAN_DEFINITIONS } from "@/lib/db"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const competitors = await listCompetitorsByUserId(user.id)
  return NextResponse.json({ ok: true, competitors })
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

  const { websiteId, domain, brandName } = body as {
    websiteId?: string
    domain?: string
    brandName?: string
  }

  if (!domain || typeof domain !== "string" || !domain.trim()) {
    return NextResponse.json({ ok: false, error: "Please enter a competitor domain." }, { status: 400 })
  }

  const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").trim()
  const cleanBrand = brandName && brandName.trim() ? brandName.trim() : cleanDomain.split(".")[0].replace(/\b\w/g, (c) => c.toUpperCase())

  // Check plan limits
  const existing = await listCompetitorsByUserId(user.id)
  const planInfo = PLAN_DEFINITIONS[user.plan] || PLAN_DEFINITIONS.free
  if (existing.length >= planInfo.maxCompetitorsPerSite * planInfo.maxWebsites) {
    return NextResponse.json(
      {
        ok: false,
        error: `Competitor limit reached for ${planInfo.name} tier. Upgrade to Pro or Agency for more tracking slots.`,
      },
      { status: 403 }
    )
  }

  const comp = await createCompetitor({
    userId: user.id,
    websiteId: websiteId || "global",
    domain: cleanDomain,
    brandName: cleanBrand,
  })

  return NextResponse.json({ ok: true, competitor: comp })
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing competitor ID" }, { status: 400 })
  }

  await deleteCompetitor(id, user.id)
  return NextResponse.json({ ok: true, message: "Competitor removed" })
}
