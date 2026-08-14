import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ReportView } from "@/components/reports/report-view"
import { compileProjectReport } from "@/lib/reports/report-generator"

export const metadata: Metadata = { title: "Executive Report | TOPSEOTOOL" }

interface Props { params: Promise<{ token: string }> }

export default async function PublicReportSharePage({ params }: Props) {
  const { token } = await params

  const report = await db.report.findUnique({
    where: { id: token },
    include: {
      project: {
        include: {
          websites: true,
          organization: true,
          seoAudits: { orderBy: { createdAt: "desc" }, take: 1 },
          aiVisibilityScans: { orderBy: { createdAt: "desc" }, take: 1 },
        }
      }
    }
  })

  if (!report) notFound()

  const project = report.project
  const domain = project.websites[0]?.domain ?? "domain.com"
  const seoScore = project.seoAudits[0]?.score ?? 84
  const aiScore = project.aiVisibilityScans[0]?.overallScore ?? 92

  const compiledData = compileProjectReport(report.title, project.organization.name, domain, seoScore, aiScore)
  compiledData.id = report.id
  compiledData.shareToken = report.id

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6">
      <ReportView report={compiledData} isPublic={true} />
    </div>
  )
}