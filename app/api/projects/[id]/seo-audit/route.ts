import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { triggerSEOAuditSchema } from "@/lib/validations"
import { runSEOAuditEngine } from "@/lib/crawler/audit-engine"
import { checkAndRecord, METRIC } from "@/lib/billing/entitlements"
import { handleApiError } from "@/lib/errors"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { jobQueue } from "@/lib/jobs/queue-core"
import "@/lib/jobs/handlers"

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Rate limit check: max 5 audit triggers per 60 seconds per user
    const rl = checkRateLimit(`seo-audit:${session.user.id}`, 5, 60_000)
    if (!rl.allowed) return rateLimitResponse(rl.resetMs)
    const { id: projectId } = await params

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: { some: { userId: session.user.id } }
        }
      },
      select: { id: true, organizationId: true }
    })
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    // ✅ Entitlement check + usage recording
    await checkAndRecord(
      project.organizationId,
      "RUN_SEO_AUDIT",
      METRIC.SEO_AUDIT,
      1,
      session.user.id
    )

    const body = await req.json()
    const parsed = triggerSEOAuditSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid URL provided", details: parsed.error.issues }, { status: 400 })

    const { url } = parsed.data

    // Create audit record in PENDING state
    const audit = await db.sEOAudit.create({
      data: { projectId, targetUrl: url, status: "PENDING" }
    })

    // Enqueue non-blocking asynchronous website crawl job
    const job = await jobQueue.enqueue(
      "WEBSITE_CRAWL",
      { auditId: audit.id, targetUrl: url },
      { organizationId: project.organizationId, userId: session.user.id }
    )

    return NextResponse.json(
      {
        ok: true,
        message: "SEO audit and website crawl enqueued in background",
        data: { id: audit.id, jobId: job.id, status: "QUEUED" }
      },
      { status: 202 }
    )
  } catch (err) {
    return handleApiError(err, "SEO_AUDIT_POST")
  }
}