import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ArrowLeft, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReportView } from "@/components/reports/report-view"
import { compileProjectReport } from "@/lib/reports/report-generator"

export const metadata: Metadata = { title: "Executive Report Preview | TOPSEOTOOL" }

interface Props { params: Promise<{ projectId: string }> }

export default async function ProjectReportsPage({ params }: Props) {
  const { projectId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const project = await db.project.findFirst({
    where: {
      id: projectId,
      organization: {
        members: { some: { userId: session.user.id } }
      }
    },
    include: {
      websites: true,
      organization: true,
      seoAudits: { orderBy: { createdAt: "desc" }, take: 1 },
      aiVisibilityScans: { orderBy: { createdAt: "desc" }, take: 1 },
    }
  })

  if (!project) notFound()

  const domain = project.websites[0]?.domain ?? "domain.com"
  const seoScore = project.seoAudits[0]?.score ?? 84
  const aiScore = project.aiVisibilityScans[0]?.overallScore ?? 92

  const compiledData = compileProjectReport(`${project.name} Executive Report`, project.organization.name, domain, seoScore, aiScore)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 print:hidden">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Automated Executive Report</h1>
            <Badge variant="brand">Module 10</Badge>
          </div>
          <p className="text-sm text-muted-foreground">White-labeled executive PDF report for {project.name}</p>
        </div>
      </div>

      <ReportView report={compiledData} />
    </div>
  )
}