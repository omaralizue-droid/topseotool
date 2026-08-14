import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { cancelStripeSubscription } from "@/lib/billing/stripe"
import { handleApiError } from "@/lib/errors"

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const membership = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true, role: true },
    })

    if (!membership) {
      return NextResponse.json({ ok: false, error: "No organization found" }, { status: 404 })
    }

    // Only OWNER or ADMIN can cancel
    if (!["OWNER", "ADMIN"].includes(membership.role)) {
      return NextResponse.json({ ok: false, error: "Only organization owners can cancel the subscription" }, { status: 403 })
    }

    const result = await cancelStripeSubscription(membership.organizationId)

    return NextResponse.json({
      ok: true,
      data: {
        cancelAtPeriodEnd: result.cancelAtPeriodEnd,
        periodEnd: result.periodEnd,
        message: result.periodEnd
          ? `Your subscription will remain active until ${new Date(result.periodEnd).toLocaleDateString()}.`
          : "Your subscription has been cancelled.",
      },
    })
  } catch (err) {
    return handleApiError(err, "BILLING_CANCEL_POST")
  }
}
