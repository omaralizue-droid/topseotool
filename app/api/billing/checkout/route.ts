import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createStripeCheckoutSession } from "@/lib/billing/stripe"
import { handleApiError } from "@/lib/errors"
import { PLAN_ORDER, type PlanKey } from "@/types"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const rl = checkRateLimit(`checkout:${session.user.id}`, 5, 60_000)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const body = await req.json()
    const { planKey } = body as { planKey: string }

    // Validate plan key
    if (!planKey || !PLAN_ORDER.includes(planKey as PlanKey)) {
      return NextResponse.json({ ok: false, error: "Invalid plan key" }, { status: 400 })
    }

    if (planKey === "FREE") {
      return NextResponse.json(
        { ok: false, error: "Cannot checkout to the Free plan. Use the cancel endpoint to downgrade." },
        { status: 400 }
      )
    }

    const membership = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            billingEmail: true,
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ ok: false, error: "No organization found" }, { status: 404 })
    }

    // Only OWNER or ADMIN can initiate billing changes
    if (!["OWNER", "ADMIN"].includes(membership.role)) {
      return NextResponse.json(
        { ok: false, error: "Only organization owners can manage billing" },
        { status: 403 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    const returnUrl = `${appUrl}/billing`

    const checkout = await createStripeCheckoutSession(
      planKey as PlanKey,
      membership.organizationId,
      returnUrl,
      session.user.email ?? membership.organization.billingEmail,
      membership.organization.name
    )

    return NextResponse.json({ ok: true, data: { url: checkout.url } })
  } catch (err) {
    return handleApiError(err, "BILLING_CHECKOUT_POST")
  }
}