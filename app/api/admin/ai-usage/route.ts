import { NextResponse } from "next/server"
import { AdminService } from "@/lib/admin/admin-service"

export async function GET() {
  try {
    const aiUsage = await AdminService.getAIUsageReport()
    return NextResponse.json({ success: true, data: aiUsage })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
