import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { FileText, Plus, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"
import { EmptyState } from "@/components/ui/empty-state"

export const metadata: Metadata = { title: "Automated Reports | TOPSEOTOOL" }

export default async function DashboardReportsPage() {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) redirect("/login")

  let reports: any[] = []
  let projects: any[] = []
  try {
    const membership = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    })

    reports = (await db.report.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { project: true }
    })) ?? []

    if (membership) {
      projects = (await db.project.findMany({
        where: { organizationId: membership.organizationId, status: { not: "ARCHIVED" } },
        select: { id: true, name: true }
      })) ?? []
    }
  } catch {
    reports = []
    projects = []
  }

  const primaryProject = projects[0] ?? { id: "demo-project", name: "TOPSEOTOOL Demo" }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Automated Client Reports</h1>
            <Badge variant="brand">Module 10</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate and share white-labeled PDF executive reports with clients and stakeholders.
          </p>
        </div>
        {primaryProject && (
          <Button size="sm" variant="brand" asChild>
            <Link href={`/projects/${primaryProject.id}/reports`}>
              <Plus className="h-4 w-4 mr-1.5" /> Generate Report
            </Link>
          </Button>
        )}
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports generated yet"
          description="Create your first automated client report to summarize SEO health, AI search visibility, and recommendations."
          action={primaryProject ? { label: "Generate Report", href: `/projects/${primaryProject.id}/reports` } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="p-4 bg-card border border-border rounded-lg flex items-center justify-between transition-all hover:border-brand/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{report.title}</span>
                  <Badge variant="outline" className="text-[10px]">{report.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Project: {report.project.name} • Created {formatRelativeTime(report.createdAt)}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
                  <Link href={`/reports/share/${report.id}`} target="_blank">
                    <ExternalLink className="h-3.5 w-3.5 mr-1" /> Public Share Link
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}