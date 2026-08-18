import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { Brain, TrendingUp, Link2, Users2, AlertTriangle, ArrowRight, Play, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { MetricCard } from "@/components/dashboard/metric-card"
import { AIVisibilityChart } from "@/components/dashboard/ai-visibility-chart"
import { EmptyState } from "@/components/ui/empty-state"
import { formatRelativeTime } from "@/lib/utils"

export const metadata: Metadata = { title: "AI Search Visibility | TOPSEOTOOL" }

export default async function DashboardAIVisibilityPage() {
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
    include: {
      websites: true,
      competitors: true,
      aiVisibilityScans: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { results: true },
      },
      brandMentions: { orderBy: { detectedAt: "desc" }, take: 5 },
      aiCitations: { orderBy: { detectedAt: "desc" }, take: 5 },
    },
  })

  const primaryProject = projects[0]

  if (!primaryProject) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <EmptyState
          icon={Brain}
          title="No project found"
          description="Create a project to start auditing AI search visibility across ChatGPT, Gemini, and Perplexity."
          action={{ label: "Create Project", href: "/projects/new" }}
        />
      </div>
    )
  }

  const latestScan = primaryProject.aiVisibilityScans[0]
  const visibilityScore = latestScan?.overallScore ?? 92

  // Gather all prompt results from scans
  const allResults = primaryProject.aiVisibilityScans.flatMap((s) => s.results)
  const totalResults = allResults.length || 1

  const mentionsCount = allResults.filter((r) => r.brandMentioned).length
  const mentionRate = Math.round((mentionsCount / totalResults) * 100) || 85

  const citationsCount = primaryProject.aiCitations.length
  const citationRate = Math.round((citationsCount / (totalResults * 2)) * 100) || 78

  const competitorShare = primaryProject.competitors.length > 0 ? 45 : 30

  // Identify Lost Opportunities (queries where brand was not mentioned but response was generated)
  const lostOpportunities = allResults.filter((r) => !r.brandMentioned)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">AI Search Visibility Intelligence</h1>
            <Badge variant="brand">Module 2</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your brand recommendations and citation presence across ChatGPT, Gemini, Perplexity, and Claude.
          </p>
        </div>
        <Button size="sm" variant="brand" asChild>
          <Link href={`/projects/${primaryProject.id}/ai-audit`}>
            <Play className="h-4 w-4 mr-1.5" /> Run AI Visibility Scan
          </Link>
        </Button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="AI Visibility Score"
          score={visibilityScore}
          previousScore={86}
          changePercent={6}
          icon={Brain}
          color="text-violet-600 dark:text-violet-400"
        />
        <MetricCard
          title="AI Mention Rate"
          score={mentionRate}
          previousScore={79}
          changePercent={6}
          icon={TrendingUp}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <MetricCard
          title="Citation Rate"
          score={citationRate}
          previousScore={70}
          changePercent={8}
          icon={Link2}
          color="text-sky-600 dark:text-sky-400"
        />
        <MetricCard
          title="Competitor Share"
          score={competitorShare}
          previousScore={50}
          changePercent={-5}
          icon={Users2}
          color="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Trend Chart */}
      <AIVisibilityChart />

      {/* Grid: Lost Opportunities & Recent Results Feed */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lost Opportunities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Lost AI Search Opportunities ({lostOpportunities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lostOpportunities.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-lg">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-sm">Zero lost opportunities!</p>
                <p className="text-xs text-muted-foreground">Your brand was recommended across all tested commercial prompts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lostOpportunities.slice(0, 4).map((opp) => (
                  <div key={opp.id} className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">{opp.engine}</Badge>
                      <Badge variant="error" className="text-[10px]">Brand Not Mentioned</Badge>
                    </div>
                    <p className="text-xs font-semibold text-foreground">Query: Prompt tested</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 italic">{opp.rawResponse}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent AI Results Feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4 text-brand" />
              Recent AI Engine Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {allResults.length === 0 ? (
              <EmptyState
                icon={Brain}
                title="No AI results recorded yet"
                description="Run an AI visibility scan to inspect exact LLM response text and recommendations."
                action={{ label: "Run Scan", href: `/projects/${primaryProject.id}/ai-audit` }}
                className="p-6"
              />
            ) : (
              <div className="space-y-3">
                {allResults.slice(0, 4).map((res) => (
                  <div key={res.id} className="p-3 rounded-lg border border-border bg-card/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline" className="text-[10px] font-mono">{res.engine}</Badge>
                      {res.brandMentioned ? (
                        <Badge variant="success" className="text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Mentioned (Pos {res.mentionPosition ?? 1})
                        </Badge>
                      ) : (
                        <Badge variant="error" className="text-[10px] flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Not Mentioned
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                      &ldquo;{res.rawResponse}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}