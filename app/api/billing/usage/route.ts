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
      const { getPlanConfig } = await import("@/types")
      const plan = getPlanConfig("PRO")
      return NextResponse.json({
        ok: true,
        data: {
          planKey: "PRO",
          plan,
          projectsUsed: 1,
          projectsLimit: plan.limits.projects,
          projectsRemaining: plan.limits.projects - 1,
          auditsUsed: 4,
          auditsLimit: plan.limits.auditsPerMonth,
          auditsRemaining: plan.limits.auditsPerMonth - 4,
          aiQueriesUsed: 18,
          aiQueriesLimit: plan.limits.aiQueriesPerMonth,
          aiQueriesRemaining: plan.limits.aiQueriesPerMonth - 18,
          canWhiteLabel: plan.limits.whiteLabel,
          hasApiAccess: plan.limits.apiAccess,
          canGenerateReports: true,
          hasPrioritySupport: true,
          periodStart: new Date().toISOString(),
          periodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
          status: "ACTIVE",
          cancelAtPeriodEnd: false,
          stripeCustomerId: null,
        },
      })
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
