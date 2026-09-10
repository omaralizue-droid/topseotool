import { NextRequest, NextResponse } from "next/server"
import { validateCoupon } from "@/lib/billing/stripe"
import type { BillingCadence } from "@/lib/billing/types"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") || ""
  const cadence = (req.nextUrl.searchParams.get("cadence") as BillingCadence) || "MONTHLY"

  if (!code.trim()) {
    return NextResponse.json({ ok: false, error: "Code parameter is required" }, { status: 400 })
  }

  const result = validateCoupon(code, cadence)
  return NextResponse.json({ ok: result.valid, data: result })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { code, cadence = "MONTHLY" } = body

    if (!code) {
      return NextResponse.json({ ok: false, error: "Code is required" }, { status: 400 })
    }

    const result = validateCoupon(code, cadence)
    return NextResponse.json({ ok: result.valid, data: result })
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 })
  }
}
