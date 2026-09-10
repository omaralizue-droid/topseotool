import { NextResponse } from "next/server"
import { AdminService } from "@/lib/admin/admin-service"

export async function GET() {
  try {
    const metrics = await AdminService.getDashboardMetrics()
    return NextResponse.json({ success: true, data: metrics })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
