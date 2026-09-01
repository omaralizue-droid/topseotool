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
          _count: { select: { seoAudits: true, aiVisibilityScans: true, brandMentions: true, aiCitations: true } }
        }
      })
    }
  } catch {
    projects = []
  }

  if (projects.length === 0) {
    projects = [
      {
        id: "demo-project",
        name: "TOPSEOTOOL Demo",
        color: "#6366f1",
        updatedAt: new Date(),
        websites: [{ domain: "topseotool.net" }],
        _count: { seoAudits: 12, aiVisibilityScans: 8, brandMentions: 24, aiCitations: 18 }
      }
    ]
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">Projects</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/projects/new"><Plus className="h-4 w-4 mr-1" />New project</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-8 sm:p-16 text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-semibold mb-2">No projects yet</h2>
          <p className="text-sm text-muted-foreground mb-6">Add your first website to start tracking its SEO and AI visibility.</p>
          <Button asChild><Link href="/projects/new"><Plus className="h-4 w-4 mr-1" />Create project</Link></Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {projects.map((project) => {
            const domain = project.websites[0]?.domain ?? "domain.com"
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 bg-card border border-border rounded-xl hover:border-brand/40 hover:shadow-sm transition-all duration-150"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm"
                  style={{ background: project.color ?? "#6366f1" }}
                >
                  {domain[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm truncate">{project.name}</span>
                    {project.status && <Badge variant="outline" className="text-[10px] py-0">{project.status}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{domain}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{project._count?.seoAudits ?? 0} SEO audits</span>
                  <span>{project._count?.aiVisibilityScans ?? 0} AI scans</span>
                  <span>{formatRelativeTime(project.updatedAt)}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}