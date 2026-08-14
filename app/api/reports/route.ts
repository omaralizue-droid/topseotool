import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { compileProjectReport } from "@/lib/reports/report-generator"
import { handleApiError } from "@/lib/errors"
import { checkAndRecord, METRIC } from "@/lib/billing/entitlements"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const reports = await db.report.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: { createdAt: "desc" },
    include: { project: true }
  })

  return NextResponse.json({ ok: true, data: reports })
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { projectId, title } = body

    const project = await db.project.findFirst({
      where: {
        id: projectId,
        organization: {
          members: { some: { userId: session.user.id } }
        }
      },
      include: {
        organization: true,
        websites: true,
        seoAudits: { orderBy: { createdAt: "desc" }, take: 1 },
        aiVisibilityScans: { orderBy: { createdAt: "desc" }, take: 1 },
      }
    })

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 })

    // ✅ Entitlement check + usage recording for report generation
    await checkAndRecord(
      project.organizationId,
      "GENERATE_REPORT",
      METRIC.REPORT,
      1,
      session.user.id
    )

    const domain = project.websites[0]?.domain ?? "domain.com"
    const seoScore = project.seoAudits[0]?.score ?? 84
    const aiScore = project.aiVisibilityScans[0]?.overallScore ?? 92

    const report = await db.report.create({
      data: {
        projectId,
        userId: session.user.id,
        title: title || `${project.name} Executive Report`,
        type: "EXECUTIVE_SUMMARY",
        format: "PDF",
        status: "READY",
        fileUrl: `/reports/share/preview`,
      }
    })

    const compiledData = compileProjectReport(report.title, project.organization.name, domain, seoScore, aiScore)
    compiledData.id = report.id
    compiledData.shareToken = report.id

    await db.report.update({
      where: { id: report.id },
      data: { fileUrl: `/reports/share/${report.id}` }
    })

    return NextResponse.json({ ok: true, data: { report, compiledData } }, { status: 201 })
  } catch (err) {
    return handleApiError(err, "REPORTS_POST")
  }
}