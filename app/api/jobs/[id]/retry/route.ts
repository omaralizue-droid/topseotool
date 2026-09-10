import { NextRequest, NextResponse } from "next/server"
import { jobQueue } from "@/lib/jobs/queue-core"
import { sanitizeForClient } from "@/lib/security/response-sanitizer"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const job = await jobQueue.retryJob(id)

  if (!job) {
    return NextResponse.json({ ok: false, error: "Job not found or cannot be retried" }, { status: 404 })
  }

  return NextResponse.json({
    ok: true,
    message: `Job ${id} re-queued for processing`,
    data: sanitizeForClient(job),
  })
}
