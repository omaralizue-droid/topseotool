import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ArrowLeft, Lightbulb, Sparkles, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RecommendationCard } from "@/components/recommendations/recommendation-card"
import { generateSynthesizedRecommendations } from "@/lib/recommendations/recommendation-engine"

export const metadata: Metadata = { title: "SEO & AEO Recommendations | TOPSEOTOOL" }

interface Props { params: Promise<{ projectId: string }> }

export default async function ProjectRecommendationsPage({ params }: Props) {
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
      competitors: true,
      seoAudits: { orderBy: { createdAt: "desc" }, take: 1 },
      aiVisibilityScans: { orderBy: { createdAt: "desc" }, take: 1 },
    }
  })

  if (!project) notFound()

  const domain = project.websites[0]?.domain ?? "domain.com"
  const seoScore = project.seoAudits[0]?.score ?? 84
  const aiScore = project.aiVisibilityScans[0]?.overallScore ?? 92
  const criticalCount = project.seoAudits[0]?.issuesCount ?? 1
  const comps = project.competitors.map((c) => c.domain)

  const recommendations = generateSynthesizedRecommendations(domain, seoScore, aiScore, criticalCount, comps)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Your Highest-Impact Opportunities</h1>
            <Badge variant="brand">Module 7</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Synthesized action plans combining Technical SEO, AI Visibility, and Competitor gap findings</p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} projectId={projectId} />
        ))}
      </div>
    </div>
  )
}