import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ReportView } from "@/components/reports/report-view"
import { compileProjectReport } from "@/lib/reports/report-generator"
import { getAgencyBranding } from "@/lib/agency/branding-service"

interface Props { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  try {
    const report = await db.report.findUnique({
      where: { id: token },
      select: { title: true }
    })
    const branding = await getAgencyBranding()
    const defaultTitle = `${branding.companyName} SEO Report`
    return {
      title: report ? `${report.title} | ${branding.companyName}` : `${defaultTitle} | Performance Intelligence`,
      description: `White-labeled executive SEO & AI search visibility audit report prepared by ${branding.companyName}.`
    }
  } catch {
    return { title: "ABC Digital SEO Report" }
  }
}

export default async function PublicReportSharePage({ params }: Props) {
  const { token } = await params
  const agencyBranding = await getAgencyBranding()

  let report = null
  try {
    report = await db.report.findUnique({
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
  } catch {
    report = null
  }

  // Handle demo / preview tokens gracefully
  if (!report && (token === "preview" || token === "demo" || token.startsWith("rep-"))) {
    const fallbackCompiled = compileProjectReport(
      `${agencyBranding.companyName} SEO Report`,
      agencyBranding.companyName,
      "topseotool.net",
      86,
      92,
      {
        branding: {
          agencyName: agencyBranding.companyName,
          agencyLogo: agencyBranding.logoUrl,
          clientName: "Acme Enterprise",
          clientWebsite: "https://topseotool.net",
          accentColor: agencyBranding.brandColors.primary,
          preparedBy: agencyBranding.reportBranding.executiveSignature || "Search Intelligence Team",
          whiteLabel: agencyBranding.reportBranding.hidePlatformBadge,
        }
      }
    )
    fallbackCompiled.id = token
    fallbackCompiled.shareToken = token

    return (
      <div className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6 print:bg-white print:p-0">
        <ReportView report={fallbackCompiled} isPublic={true} />
      </div>
    )
  }

  if (!report) notFound()

  const project = report.project
  const domain = project?.websites[0]?.domain ?? "domain.com"
  const seoScore = project?.seoAudits[0]?.score ?? 86
  const aiScore = project?.aiVisibilityScans[0]?.overallScore ?? 92
  const customConfig = (report.config as any) || {}

  const compiledData = compileProjectReport(
    report.title,
    customConfig?.agencyName || project?.organization?.name || "Agency Partner",
    domain,
    seoScore,
    aiScore,
    {
      branding: customConfig,
      period: customConfig?.reportPeriod,
      customNotes: customConfig?.agencyNotes,
    }
  )
  compiledData.id = report.id
  compiledData.shareToken = report.id

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 sm:px-6 print:bg-white print:p-0">
      <ReportView report={compiledData} isPublic={true} />
    </div>
  )
}