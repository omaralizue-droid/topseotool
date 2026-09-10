import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { FileText, Plus, Sparkles, Share2, ExternalLink, Printer, Building2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"

export const metadata: Metadata = { title: "Executive Client Reports | TOPSEOTOOL" }

export default async function GlobalReportsPage() {
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
      include: { project: true },
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

  const primaryProjectId = projects[0]?.id || "demo"

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Executive Client Reports</h1>
            <Badge variant="brand" className="text-[10px] uppercase font-bold">
              White-Label Agency Suite
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Generate, customize, and distribute high-fidelity white-labeled PDF reports to your stakeholders and clients.
          </p>
        </div>

        <Button size="sm" variant="brand" asChild className="gap-2 shadow-brand">
          <Link href={`/projects/${primaryProjectId}/reports`}>
            <Sparkles className="h-4 w-4" />
            <span>Generate Client Report</span>
          </Link>
        </Button>
      </div>

      {/* Feature Highlights Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs text-foreground">
            <Building2 className="h-4 w-4 text-brand" />
            <span>100% Agency White-Labeling</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Personalize client reports with your agency logo, client name, custom accent colors, and custom executive notes.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs text-foreground">
            <Printer className="h-4 w-4 text-emerald-500" />
            <span>Vector PDF Export &amp; Print</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            High-resolution vector printing with automatic A4 page breaks, score dials, and clean typography.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs text-foreground">
            <Share2 className="h-4 w-4 text-sky-500" />
            <span>Secure Public Share Links</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Deliver interactive live web reports accessible via secret tokens without requiring client accounts or logins.
          </p>
        </div>
      </div>

      {/* Report List or Empty State */}
      {reports.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center bg-card/50 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-muted flex items-center justify-center mx-auto text-brand">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-base">No client reports generated yet</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Configure your first professional executive report covering SEO health scores, technical issues, keyword performance, competitor benchmarks, and backlinks.
            </p>
          </div>
          <Button size="sm" variant="brand" asChild className="gap-2 shadow-brand">
            <Link href={`/projects/${primaryProjectId}/reports`}>
              <Plus className="h-4 w-4" /> Create Your First Report
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-foreground">Generated Reports ({reports.length})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 bg-card border border-border rounded-xl hover:border-brand/40 transition-all flex flex-col justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-foreground truncate">{report.title}</h4>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {report.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Project: <strong className="text-foreground">{report.project?.name || "Client Project"}</strong> • Created {formatRelativeTime(report.createdAt)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <Button variant="ghost" size="sm" className="h-7 text-xs px-2" asChild>
                    <Link href={`/projects/${report.projectId}/reports`}>
                      Open Project Workspace
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" asChild>
                    <Link href={`/reports/share/${report.id}`} target="_blank">
                      <ExternalLink className="h-3 w-3" /> View / Print PDF
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}