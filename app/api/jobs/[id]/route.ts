import { NextRequest, NextResponse } from "next/server"
import { jobQueue } from "@/lib/jobs/queue-core"
import { sanitizeForClient } from "@/lib/security/response-sanitizer"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const job = jobQueue.getJob(id)

  if (!job) {
    return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    data: sanitizeForClient(job),
  })
}
