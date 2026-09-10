import { NextResponse } from "next/server"
import { AdminService } from "@/lib/admin/admin-service"

export async function GET() {
  try {
    const revenue = await AdminService.getRevenueReport()
    return NextResponse.json({ success: true, data: revenue })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
