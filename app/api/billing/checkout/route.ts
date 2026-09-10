import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createStripeCheckoutSession } from "@/lib/billing/stripe"
import { handleApiError } from "@/lib/errors"
import { PLAN_ORDER, type PlanKey } from "@/types"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"

export async function POST(req: NextRequest) {
  try {
    const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
    }

    const rl = checkRateLimit(`checkout:${session.user.id}`, 10, 60_000)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)

    const body = await req.json()
    const {
      planKey,
      cadence = "MONTHLY",
      trialDays,
      couponCode,
    } = body as {
      planKey: string
      cadence?: "MONTHLY" | "ANNUAL"
      trialDays?: number
      couponCode?: string
    }

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

    let organizationId = "org_default"
    let organizationName = "Default Organization"
    let billingEmail = session.user.email ?? "billing@example.com"

    try {
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

      if (membership) {
        organizationId = membership.organizationId
        organizationName = membership.organization.name
        if (membership.organization.billingEmail) {
          billingEmail = membership.organization.billingEmail
        }
      }
    } catch {
      // DB unreachable fallback
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    const returnUrl = `${appUrl}/billing`

    const checkout = await createStripeCheckoutSession({
      planKey: planKey as PlanKey,
      organizationId,
      returnUrl,
      email: billingEmail,
      orgName: organizationName,
      cadence,
      trialDays,
      couponCode,
    })

    return NextResponse.json({
      ok: true,
      data: {
        url: checkout.url,
        sessionId: checkout.sessionId,
        cadence: checkout.cadence,
        hasTrial: checkout.hasTrial,
        discountApplied: checkout.discountApplied,
      },
    })
  } catch (err) {
    return handleApiError(err, "BILLING_CHECKOUT_POST")
  }
}