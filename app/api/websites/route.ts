import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth/session"
import { listWebsitesByUserId, createWebsite, PLAN_DEFINITIONS } from "@/lib/db"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const websites = await listWebsitesByUserId(user.id)
  return NextResponse.json({ ok: true, websites })
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

  const { domain, brandName } = body as { domain?: string; brandName?: string }
  if (!domain || typeof domain !== "string" || !domain.trim()) {
    return NextResponse.json({ ok: false, error: "Please enter a domain name." }, { status: 400 })
  }

  // Check plan limits
  const existingWebsites = await listWebsitesByUserId(user.id)
  const planInfo = PLAN_DEFINITIONS[user.plan] || PLAN_DEFINITIONS.free
  if (existingWebsites.length >= planInfo.maxWebsites) {
    return NextResponse.json(
      {
        ok: false,
        error: `Plan limit reached: The ${planInfo.name} tier allows up to ${planInfo.maxWebsites} tracked domain${planInfo.maxWebsites === 1 ? "" : "s"}. Upgrade to Pro for more.`,
      },
      { status: 403 }
    )
  }

  const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").trim()
  const cleanBrand = brandName && brandName.trim() ? brandName.trim() : cleanDomain.split(".")[0].replace(/\b\w/g, (c) => c.toUpperCase())

  // Check if domain already added
  if (existingWebsites.some((w) => w.domain === cleanDomain)) {
    return NextResponse.json({ ok: false, error: "This domain is already added to your account." }, { status: 409 })
  }

  const newWebsite = await createWebsite({
    userId: user.id,
    domain: cleanDomain,
    brandName: cleanBrand,
  })

  return NextResponse.json({ ok: true, website: newWebsite })
}
