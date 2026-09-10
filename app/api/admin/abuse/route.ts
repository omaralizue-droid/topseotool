import { NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/admin/admin-service"

export async function GET() {
  try {
    const alerts = await AdminService.getAbuseAlerts()
    return NextResponse.json({ success: true, data: alerts })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { alertId, action } = body

    if (!alertId || !action) {
      return NextResponse.json({ success: false, error: "alertId and action are required" }, { status: 400 })
    }

    const updated = await AdminService.resolveAbuseAlert(alertId, action)
    return NextResponse.json({ success: true, data: updated })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
