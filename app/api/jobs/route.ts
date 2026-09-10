import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { jobQueue, JobStatus, JobType } from "@/lib/jobs/queue-core"
import "@/lib/jobs/handlers" // ensure handlers registered
import { handleApiError } from "@/lib/errors"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { sanitizeForClient } from "@/lib/security/response-sanitizer"

export async function GET(req: NextRequest) {
  try {
    const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") as JobStatus | null
    const type = searchParams.get("type") as JobType | null
    const organizationId = searchParams.get("organizationId") || undefined

    const jobs = jobQueue.getJobs({
      status: status || undefined,
      type: type || undefined,
      organizationId,
    })

    return NextResponse.json({
      ok: true,
      data: sanitizeForClient(jobs),
      total: jobs.length,
      counts: {
        queued: jobs.filter((j) => j.status === "QUEUED").length,
        processing: jobs.filter((j) => j.status === "PROCESSING").length,
        completed: jobs.filter((j) => j.status === "COMPLETED").length,
        failed: jobs.filter((j) => j.status === "FAILED").length,
      },
    })
  } catch (err) {
    return handleApiError(err, "JOBS_GET")
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
    const body = await req.json()
    const { type, payload, organizationId } = body

    if (!type || !payload) {
      return NextResponse.json({ ok: false, error: "type and payload are required" }, { status: 400 })
    }

    const job = await jobQueue.enqueue(type as JobType, payload, {
      organizationId,
      userId: session?.user?.id,
    })

    return NextResponse.json(
      {
        ok: true,
        message: `Job ${job.id} queued for asynchronous processing`,
        job: sanitizeForClient(job),
      },
      { status: 202 }
    )
  } catch (err) {
    return handleApiError(err, "JOBS_POST")
  }
}
