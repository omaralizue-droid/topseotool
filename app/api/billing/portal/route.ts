import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { createStripeCustomerPortal } from "@/lib/billing/stripe"
import { handleApiError } from "@/lib/errors"

export async function POST(req: NextRequest) {
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

    if (!["OWNER", "ADMIN"].includes(membership.role)) {
      return NextResponse.json(
        { ok: false, error: "Only organization owners can access billing management" },
        { status: 403 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin
    const returnUrl = `${appUrl}/billing`

    const portal = await createStripeCustomerPortal(membership.organizationId, returnUrl)

    return NextResponse.json({ ok: true, data: { url: portal.url } })
  } catch (err) {
    return handleApiError(err, "BILLING_PORTAL_POST")
  }
}