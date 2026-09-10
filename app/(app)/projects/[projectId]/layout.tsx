import { db } from "@/lib/db"
import { ProjectNavigationHeader } from "@/components/projects/project-navigation-header"

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const resolvedParams = await Promise.resolve(params)
  const projectId = resolvedParams?.projectId || "demo"

  let project: any = null
  try {
    project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        websites: { where: { isPrimary: true } },
        _count: { select: { competitors: true } }
      }
    })
  } catch {
    project = null
  }

  let parsedMeta: any = {}
  try {
    if (project?.description && project.description.startsWith("{")) {
      parsedMeta = JSON.parse(project.description)
    }
  } catch {}

  const primaryWebsite = project?.websites?.[0]
  const domain = primaryWebsite?.domain || (projectId === "demo" ? "topseotool.net" : "example.com")
  const name = project?.name || (projectId === "demo" ? "TOPSEOTOOL" : domain)
  const country = parsedMeta.country || "United States"
  const language = parsedMeta.language || "English"
  const searchEngine = parsedMeta.searchEngine || "Google"
  const device = parsedMeta.device || "Desktop"
  const keywordsCount = parsedMeta.keywordsCount || 5000
  const competitorsCount = parsedMeta.competitorsCount || project?._count?.competitors || 10

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectNavigationHeader
        projectId={projectId}
        domain={domain}
        name={name}
        country={country}
        language={language}
        searchEngine={searchEngine}
        device={device}
        keywordsCount={keywordsCount}
        competitorsCount={competitorsCount}
      />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
