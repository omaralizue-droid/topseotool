import { NextResponse } from "next/server"
import { AdminService } from "@/lib/admin/admin-service"

export async function GET() {
  try {
    const health = await AdminService.getSystemHealth()
    return NextResponse.json({ success: true, data: health })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
