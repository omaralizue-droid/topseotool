import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { triggerAIAuditSchema } from "@/lib/validations"
import { runAIVisibilityScanEngine } from "@/lib/ai-visibility/scan-engine"
import { checkAndRecord, METRIC } from "@/lib/billing/entitlements"
import { handleApiError } from "@/lib/errors"
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Rate limit check: max 5 AI scans per 60 seconds per user
    const rl = checkRateLimit(`ai-audit:${session.user.id}`, 5, 60_000)
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

    const body = await req.json()
    const parsed = triggerAIAuditSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Invalid query or parameters" }, { status: 400 })

    const { query, engines } = parsed.data
    const engineCount = engines?.length ?? 1

    // ✅ Entitlement check + usage recording (count = number of engines scanned)
    await checkAndRecord(
      project.organizationId,
      "RUN_AI_SCAN",
      METRIC.AI_SCAN,
      engineCount,
      session.user.id
    )

    // Create scan record in PENDING state
    const scan = await db.aIVisibilityScan.create({
      data: {
        projectId,
        query,
        status: "PENDING",
        enginesScanned: engines ?? [],
      }
    })

    // Execute non-blocking background scan
    void runAIVisibilityScanEngine(scan.id, projectId)

    return NextResponse.json({ ok: true, data: { id: scan.id, status: "RUNNING" } }, { status: 202 })
  } catch (err) {
    return handleApiError(err, "AI_AUDIT_POST")
  }
}