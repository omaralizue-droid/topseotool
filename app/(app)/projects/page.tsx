import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { Plus, ArrowRight, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"

export const metadata: Metadata = { title: "Projects | TOPSEOTOOL" }

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await db.organizationMember.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true }
  })

  const projects = membership
    ? await db.project.findMany({
        where: { organizationId: membership.organizationId },
        orderBy: { updatedAt: "desc" },
        include: {
          websites: true,
          _count: { select: { seoAudits: true, aiVisibilityScans: true, brandMentions: true, aiCitations: true } }
        }
      })
    : []

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Projects</h1>
          <p className="text-sm text-muted-foreground">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/projects/new"><Plus className="h-4 w-4" />New project</Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-16 text-center">
          <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h2 className="font-semibold mb-2">No projects yet</h2>
          <p className="text-sm text-muted-foreground mb-6">Add your first website to start tracking its SEO and AI visibility.</p>
          <Button asChild><Link href="/projects/new"><Plus className="h-4 w-4" />Create project</Link></Button>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((project) => {
            const domain = project.websites[0]?.domain ?? "domain.com"
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-brand/40 hover:shadow-sm transition-all duration-150"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-sm"
                  style={{ background: project.color ?? "#6366f1" }}
                >
                  {domain[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{project.name}</span>
                    <Badge variant="outline" className="text-xs py-0">{project.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{domain}</p>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground">
                  <span>{project._count.seoAudits} SEO audits</span>
                  <span>{project._count.aiVisibilityScans} AI scans</span>
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