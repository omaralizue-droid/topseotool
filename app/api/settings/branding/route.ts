import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import {
  getAgencyBranding,
  saveAgencyBranding,
  isEligibleForWhiteLabel,
  DEFAULT_AGENCY_BRANDING,
} from "@/lib/agency/branding-service"

export async function GET(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let orgId = "default_org"
  try {
    const member = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    })
    if (member) orgId = member.organizationId
  } catch {
    // Fallback to default
  }

  const [branding, eligibility] = await Promise.all([
    getAgencyBranding(orgId),
    isEligibleForWhiteLabel(orgId),
  ])

  return NextResponse.json({
    ok: true,
    data: {
      branding,
      eligibility,
    },
  })
}

export async function POST(req: NextRequest) {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let orgId = "default_org"
  try {
    const member = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    })
    if (member) orgId = member.organizationId
  } catch {
    // Fallback to default
  }

  const body = await req.json()
  const updated = await saveAgencyBranding(orgId, body)

  return NextResponse.json({
    ok: true,
    data: updated,
    message: "Agency white-label settings saved successfully!",
  })
}
