import { NextRequest, NextResponse } from "next/server"
import { AdminService } from "@/lib/admin/admin-service"

export async function GET() {
  try {
    const jobs = await AdminService.getFailedJobs()
    return NextResponse.json({ success: true, data: jobs })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { jobId, retryAll } = body

    if (retryAll) {
      const count = await AdminService.retryAllFailedJobs()
      return NextResponse.json({ success: true, retriedCount: count })
    }

    if (jobId) {
      const ok = await AdminService.retryJob(jobId)
      return NextResponse.json({ success: ok })
    }

    return NextResponse.json({ success: false, error: "jobId or retryAll required" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
