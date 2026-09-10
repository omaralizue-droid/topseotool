import { NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/admin/admin-service"

export async function GET() {
  try {
    const flags = await AdminService.getFeatureFlags()
    return NextResponse.json({ success: true, data: flags })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { flagId, rolloutPercentage, toggle } = body

    if (!flagId) {
      return NextResponse.json({ success: false, error: "flagId is required" }, { status: 400 })
    }

    if (toggle) {
      const updated = await AdminService.toggleFeatureFlag(flagId)
      return NextResponse.json({ success: true, data: updated })
    }

    if (typeof rolloutPercentage === "number") {
      const updated = await AdminService.updateFlagRollout(flagId, rolloutPercentage)
      return NextResponse.json({ success: true, data: updated })
    }

    return NextResponse.json({ success: false, error: "No action specified" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
