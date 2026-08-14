import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getOrganizationUsage } from "@/lib/billing/entitlements"
import { handleApiError } from "@/lib/errors"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const membership = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    })

    if (!membership) {
      return NextResponse.json({ ok: false, error: "No organization found" }, { status: 404 })
    }

    const usage = await getOrganizationUsage(membership.organizationId)

    // Serialize dates for JSON
    return NextResponse.json({
      ok: true,
      data: {
        ...usage,
        periodStart: usage.periodStart.toISOString(),
        periodEnd: usage.periodEnd?.toISOString() ?? null,
        plan: {
          key: usage.plan.key,
          name: usage.plan.name,
          price: usage.plan.price,
          yearlyPrice: usage.plan.yearlyPrice,
          description: usage.plan.description,
          features: usage.plan.features,
          limits: usage.plan.limits,
        },
      },
    })
  } catch (err) {
    return handleApiError(err, "BILLING_USAGE_GET")
  }
}
