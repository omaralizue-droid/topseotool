import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { Zap, Play, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MetricCard } from "@/components/dashboard/metric-card"
import { SentimentDistribution } from "@/components/brand-perception/sentiment-distribution"
import { AttributesGrid } from "@/components/brand-perception/attributes-grid"
import { PerceptionSummary } from "@/components/brand-perception/perception-summary"
import { analyzeBrandPerception } from "@/lib/brand-perception/perception-analyzer"
import { EmptyState } from "@/components/ui/empty-state"

export const metadata: Metadata = { title: "AI Brand Perception | TOPSEOTOOL" }

export default async function DashboardBrandPage() {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) redirect("/login")

  const membership = await db.organizationMember.findFirst({
    where: { userId: session.user.id },
    select: { organizationId: true },
  })

  if (!membership) redirect("/onboarding")

  const projects = await db.project.findMany({
    where: { organizationId: membership.organizationId, status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    include: { websites: true },
  })

  const primaryProject = projects[0]

  if (!primaryProject) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <EmptyState
          icon={Zap}
          title="No project found"
          description="Create a project to audit AI brand perception and reputation."
          action={{ label: "Create Project", href: "/projects/new" }}
        />
      </div>
    )
  }

  const domain = primaryProject.websites[0]?.domain ?? "domain.com"
  const analysis = analyzeBrandPerception(primaryProject.name, domain)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">AI Brand Perception Suite</h1>
            <Badge variant="brand">Module 6</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Understand how LLM models perceive and describe your brand identity.
          </p>
        </div>
        <Button size="sm" variant="brand" asChild>
          <Link href={`/projects/${primaryProject.id}/ai-perception`}>
            <Play className="h-4 w-4 mr-1.5" /> Run Brand Perception Scan
          </Link>
        </Button>
      </div>

      {/* Disclaimers & Scores */}
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

      {/* Attributes Grid */}
      <div>
        <h2 className="text-base font-semibold mb-4">Perception Attribute Classification</h2>
        <AttributesGrid
          positive={analysis.positiveAttributes}
          negative={analysis.negativeAttributes}
          neutral={analysis.neutralAttributes}
        />
      </div>

      {/* Perception Summary & Missing Info */}
      <PerceptionSummary
        brandName={analysis.brandName}
        summaryText={analysis.summaryText}
        missingInfoOpportunities={analysis.missingInfoOpportunities}
      />
    </div>
  )
}