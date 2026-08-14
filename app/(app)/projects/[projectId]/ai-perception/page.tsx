import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ArrowLeft, Zap, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MetricCard } from "@/components/dashboard/metric-card"
import { SentimentDistribution } from "@/components/brand-perception/sentiment-distribution"
import { AttributesGrid } from "@/components/brand-perception/attributes-grid"
import { PerceptionSummary } from "@/components/brand-perception/perception-summary"
import { analyzeBrandPerception } from "@/lib/brand-perception/perception-analyzer"

export const metadata: Metadata = { title: "AI Brand Perception | TOPSEOTOOL" }

interface Props { params: Promise<{ projectId: string }> }

export default async function ProjectAIPerceptionPage({ params }: Props) {
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
    include: { websites: true }
  })

  if (!project) notFound()

  const domain = project.websites[0]?.domain ?? "domain.com"
  const analysis = analyzeBrandPerception(project.name, domain)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">AI Brand Perception</h1>
            <Badge variant="brand">Module 6</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Qualitative perception profiling across LLMs for {project.name}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <MetricCard
          title="Brand Perception Score"
          score={analysis.perceptionScore}
          previousScore={82}
          changePercent={6}
          icon={Zap}
          color="text-brand"
        />
        <div className="md:col-span-2">
          <SentimentDistribution
            positive={analysis.sentimentDistribution.positive}
            neutral={analysis.sentimentDistribution.neutral}
            negative={analysis.sentimentDistribution.negative}
          />
        </div>
      </div>

      <AttributesGrid
        positive={analysis.positiveAttributes}
        negative={analysis.negativeAttributes}
        neutral={analysis.neutralAttributes}
      />

      <PerceptionSummary
        brandName={analysis.brandName}
        summaryText={analysis.summaryText}
        missingInfoOpportunities={analysis.missingInfoOpportunities}
      />
    </div>
  )
}