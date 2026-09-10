import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { resumeStripeSubscription } from "@/lib/billing/stripe"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"

export async function POST(req: NextRequest) {
  try {
    const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    let organizationId = "org_default"
    try {
      const membership = await db.organizationMember.findFirst({
        where: { userId: session.user.id },
        select: { organizationId: true },
      })
      if (membership) organizationId = membership.organizationId
    } catch {}

    const result = await resumeStripeSubscription(organizationId)
    return NextResponse.json({ ok: result.resumed, data: result })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
