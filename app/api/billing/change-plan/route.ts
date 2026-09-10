import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { changeStripeSubscriptionPlan } from "@/lib/billing/stripe"
import { PLAN_ORDER, type PlanKey } from "@/types"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import type { BillingCadence } from "@/lib/billing/types"

export async function POST(req: NextRequest) {
  try {
    const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { newPlanKey, cadence = "MONTHLY" } = body as {
      newPlanKey: PlanKey
      cadence?: BillingCadence
    }

    if (!newPlanKey || !PLAN_ORDER.includes(newPlanKey)) {
      return NextResponse.json({ ok: false, error: "Invalid plan key" }, { status: 400 })
    }

    let organizationId = "org_default"
    try {
      const membership = await db.organizationMember.findFirst({
        where: { userId: session.user.id },
        select: { organizationId: true },
      })
      if (membership) organizationId = membership.organizationId
    } catch {}

    const result = await changeStripeSubscriptionPlan(organizationId, newPlanKey, cadence)

    return NextResponse.json({
      ok: result.success,
      data: result,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
