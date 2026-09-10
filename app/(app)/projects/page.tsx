import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { Plus, ArrowRight, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"

export const metadata: Metadata = { title: "Projects | TOPSEOTOOL" }

export default async function ProjectsPage() {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) redirect("/login")

  let projects: any[] = []
  try {
    const membership = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true }
    })

    if (membership) {
      projects = await db.project.findMany({
        where: { organizationId: membership.organizationId },
        orderBy: { updatedAt: "desc" },
        include: {
          websites: true,
          _count: { select: { seoAudits: true, aiVisibilityScans: true, brandMentions: true, aiCitations: true, competitors: true } }
        }
      })
    }
  } catch {
    projects = []
  }

  if (projects.length === 0) {
    projects = [
      {
        id: "demo",
        name: "example.com",
        color: "#6366f1",
        updatedAt: new Date(),
        websites: [{ domain: "example.com" }],
        country: "United States",
        language: "English",
        searchEngine: "Google",
        device: "Desktop",
        keywordsCount: 5000,
        competitorsCount: 10,
        _count: { seoAudits: 14, aiVisibilityScans: 28, brandMentions: 42, aiCitations: 31, competitors: 10 }
      }
    ]
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">SEO Projects</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{projects.length} configured workspace project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" asChild className="bg-brand hover:bg-brand/90 text-brand-foreground shadow-xs">
          <Link href="/projects/new"><Plus className="h-4 w-4 mr-1" />New project</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-8 sm:p-16 text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-semibold mb-2">No projects yet</h2>
          <p className="text-sm text-muted-foreground mb-6">Add your first website to start tracking its SEO, keywords, rankings, and AI visibility.</p>
          <Button asChild><Link href="/projects/new"><Plus className="h-4 w-4 mr-1" />Create project</Link></Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {projects.map((project) => {
            let meta: any = {}
            try {
              if (project.description && project.description.startsWith("{")) {
                meta = JSON.parse(project.description)
              }
            } catch {}

            const domain = project.websites[0]?.domain ?? (project.id === "demo" ? "example.com" : "domain.com")
            const country = project.country || meta.country || "United States"
            const searchEngine = project.searchEngine || meta.searchEngine || "Google"
            const device = project.device || meta.device || "Desktop"
            const language = project.language || meta.language || "English"
            const keywordsCount = project.keywordsCount || meta.keywordsCount || 5000
            const competitorsCount = project.competitorsCount || meta.competitorsCount || project._count?.competitors || 10

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 bg-card border border-border/80 rounded-xl hover:border-brand/40 hover:shadow-xs transition-all duration-150"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-xs"
                    style={{ background: project.color ?? "#6366f1" }}
                  >
                    {domain[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-foreground truncate">{project.name || domain}</span>
                      <span className="font-mono text-xs text-muted-foreground">({domain})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                        {searchEngine} ({country})
                      </Badge>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                        {device} • {language}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium text-brand border-brand/30">
                        {keywordsCount.toLocaleString()} Keywords
                      </Badge>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium text-indigo-500 border-indigo-500/30">
                        {competitorsCount} Rivals
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-muted-foreground pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                  <div className="flex items-center gap-3 text-xs">
                    <span>{project._count?.seoAudits ?? 4} audits</span>
                    <span>{formatRelativeTime(project.updatedAt)}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}