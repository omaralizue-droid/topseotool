import { NextResponse } from "next/server"
import { AdminService } from "@/lib/admin/admin-service"

export async function GET() {
  try {
    const logs = await AdminService.getAuditLogs()
    return NextResponse.json({ success: true, data: logs })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
