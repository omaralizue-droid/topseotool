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
      // No org yet — return FREE defaults
      return NextResponse.json({
        ok: true,
        data: {
          planKey: "FREE",
          status: "ACTIVE",
          cancelAtPeriodEnd: false,
        },
      })
    }

    const usage = await getOrganizationUsage(membership.organizationId)

    return NextResponse.json({
      ok: true,
      data: {
        planKey: usage.planKey,
        planName: usage.plan.name,
        status: usage.status,
        cancelAtPeriodEnd: usage.cancelAtPeriodEnd,
        periodEnd: usage.periodEnd?.toISOString() ?? null,
      },
    })
  } catch (err) {
    return handleApiError(err, "BILLING_STATUS_GET")
  }
}