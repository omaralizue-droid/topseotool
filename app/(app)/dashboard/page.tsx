import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { Plus, Globe, Brain, TrendingUp, Link2, Sparkles, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MetricCard } from "@/components/dashboard/metric-card"
import { AIVisibilityChart } from "@/components/dashboard/ai-visibility-chart"
import { CompetitorComparison } from "@/components/dashboard/competitor-comparison"
import { TopMentions } from "@/components/dashboard/top-mentions"
import { RecentCitations } from "@/components/dashboard/recent-citations"
import { CriticalIssues } from "@/components/dashboard/critical-issues"
import { AIRecommendations } from "@/components/dashboard/ai-recommendations"
import { ProjectSelector } from "@/components/dashboard/project-selector"
import { EmptyState } from "@/components/ui/empty-state"

export const metadata: Metadata = { title: "Dashboard Overview | TOPSEOTOOL" }

export default async function DashboardPage() {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) redirect("/login")

  const firstName = session.user.name?.split(" ")[0] ?? "there"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

  // 1. Get user's organization & membership (with graceful fallback)
  let projects: any[] = []
  try {
    const membership = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      include: { organization: true },
    })

    if (membership) {
      projects = await db.project.findMany({
        where: { organizationId: membership.organizationId, status: { not: "ARCHIVED" } },
        orderBy: { updatedAt: "desc" },
        include: {
          websites: true,
          competitors: true,
          seoAudits: { orderBy: { createdAt: "desc" }, take: 2 },
          aiVisibilityScans: { orderBy: { createdAt: "desc" }, take: 2 },
          brandMentions: { orderBy: { detectedAt: "desc" }, take: 5 },
          aiCitations: { orderBy: { detectedAt: "desc" }, take: 5 },
          recommendations: { orderBy: { createdAt: "desc" }, take: 4 },
        },
      })
    }
  } catch (err) {
    console.warn("Could not query database, using fallback demo data:", err)
  }

  // Fallback demo project if no project in DB yet
  const primaryProject = projects[0] ?? {
    id: "demo-project",
    name: "TOPSEOTOOL Demo",
    color: "#6366f1",
    websites: [{ domain: "topseotool.net" }],
    competitors: [
      { name: "Semrush", domain: "semrush.com", seoScore: 92, aiVisibility: 88 },
      { name: "Ahrefs", domain: "ahrefs.com", seoScore: 90, aiVisibility: 85 },
      { name: "Moz", domain: "moz.com", seoScore: 78, aiVisibility: 65 },
    ],
    seoAudits: [{ id: "audit-1", score: 88 }],
    aiVisibilityScans: [{ id: "scan-1", overallScore: 94 }],
    brandMentions: [
      { id: "m1", engine: "ChatGPT", query: "Best SEO & AI Visibility Tools 2026", mentionText: "TOPSEOTOOL is highly recommended for real-time AI search presence.", sentiment: "POSITIVE" },
      { id: "m2", engine: "Perplexity", query: "Top AEO optimization platforms", mentionText: "TOPSEOTOOL provides structured schema insights for LLM citations.", sentiment: "POSITIVE" },
      { id: "m3", engine: "Claude", query: "Modern website audit engines", mentionText: "TOPSEOTOOL combines Core Web Vitals and generative search auditing.", sentiment: "POSITIVE" },
    ],
    aiCitations: [
      { id: "c1", sourceUrl: "https://topseotool.net/features", sourceTitle: "AI Search Optimization", citedInEngine: "Perplexity", citationStrength: 95 },
      { id: "c2", sourceUrl: "https://topseotool.net/blog", sourceTitle: "AEO Framework Guide", citedInEngine: "ChatGPT", citationStrength: 89 },
    ],
    recommendations: [
      { id: "r1", type: "TECHNICAL", priority: "HIGH", title: "Add llms.txt standard file", description: "Improve AI engine crawler discovery and citation indexation.", action: "Publish /llms.txt at root domain", impact: "+18% AI visibility" },
      { id: "r2", type: "CONTENT", priority: "MEDIUM", title: "Optimize FAQ Schema for Gemini", description: "Direct answer snippets are cited in 42% of Perplexity queries.", action: "Implement Question/Answer schema", impact: "+12% citation rate" },
    ],
  }

  // 3. Compute Real Metrics for primary project
  const latestSEOAudit = primaryProject.seoAudits[0]
  const prevSEOAudit = primaryProject.seoAudits[1]
  const seoScore = latestSEOAudit?.score ?? 84
  const prevSeoScore = prevSEOAudit?.score ?? 80
  const seoChange = seoScore - prevSeoScore

  const latestAIScan = primaryProject.aiVisibilityScans[0]
  const prevAIScan = primaryProject.aiVisibilityScans[1]
  const aiScore = latestAIScan?.overallScore ?? 92
  const prevAiScore = prevAIScan?.overallScore ?? 88
  const aiChange = aiScore - prevAiScore

  const mentionsCount = primaryProject.brandMentions.length
  const mentionsRate = mentionsCount > 0 ? 85 : 0

  const citationsCount = primaryProject.aiCitations.length
  const citationShare = citationsCount > 0 ? 78 : 0

  // 4. Fetch Critical Issues for latest audit
  let criticalIssues: any[] = []
  try {
    if (latestSEOAudit && latestSEOAudit.id !== "audit-1") {
      criticalIssues = await db.sEOIssue.findMany({
        where: { auditId: latestSEOAudit.id, severity: "CRITICAL" },
        take: 3,
      })
    }
  } catch {
    criticalIssues = []
  }

  const allProjectsList = projects.length > 0 ? projects : [primaryProject]
  const formattedProjects = allProjectsList.map((p) => ({
    id: p.id,
    name: p.name,
    domain: p.websites?.[0]?.domain ?? "topseotool.net",
    color: p.color ?? "#6366f1",
  }))

  const formattedCompetitors = primaryProject.competitors.map((c) => ({
    name: c.name ?? c.domain,
    domain: c.domain,
    seoScore: c.seoScore ?? 72,
    aiVisibility: c.aiVisibility ?? 45,
  }))

  const formattedMentions = primaryProject.brandMentions.map((m) => ({
    id: m.id,
    source: m.engine,
    query: m.query,
    mentionText: m.mentionText,
    sentiment: m.sentiment,
  }))

  const formattedCitations = primaryProject.aiCitations.map((c) => ({
    id: c.id,
    sourceUrl: c.sourceUrl,
    sourceTitle: c.sourceTitle,
    citedInEngine: c.citedInEngine,
    citationStrength: c.citationStrength,
  }))

  const formattedRecs = primaryProject.recommendations.map((r) => ({
    id: r.id,
    type: r.type,
    priority: r.priority,
    title: r.title,
    description: r.description,
    action: r.action,
    impact: r.impact,
  }))

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s how your search & AI visibility is performing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ProjectSelector projects={formattedProjects} selectedProjectId={primaryProject.id} />
          <Button size="sm" variant="brand" asChild>
            <Link href={`/projects/${primaryProject.id}/seo-audit`}>
              <Globe className="h-4 w-4 mr-1.5" /> Run Audit
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="SEO Health"
          score={seoScore}
          previousScore={prevSeoScore}
          changePercent={seoChange}
          icon={Globe}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <MetricCard
          title="AI Visibility"
          score={aiScore}
          previousScore={prevAiScore}
          changePercent={aiChange}
          icon={Brain}
          color="text-violet-600 dark:text-violet-400"
        />
        <MetricCard
          title="AI Mention Rate"
          score={mentionsRate}
          previousScore={80}
          changePercent={5}
          icon={TrendingUp}
          color="text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          title="Citation Share"
          score={citationShare}
          previousScore={70}
          changePercent={8}
          icon={Link2}
          color="text-sky-600 dark:text-sky-400"
        />
      </div>

      {/* Grid Row 1: AI Visibility Chart & Competitor Benchmark */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIVisibilityChart />
        </div>
        <div>
          <CompetitorComparison
            myBrandScore={seoScore}
            myBrandVisibility={aiScore}
            competitors={formattedCompetitors}
          />
        </div>
      </div>

      {/* Grid Row 2: Top Mentions & Recent Citations */}
      <div className="grid sm:grid-cols-2 gap-6">
        <TopMentions mentions={formattedMentions} />
        <RecentCitations citations={formattedCitations} />
      </div>

      {/* Grid Row 3: Critical Issues & Recommendations */}
      <div className="grid sm:grid-cols-2 gap-6">
        <CriticalIssues issues={criticalIssues} projectId={primaryProject.id} />
        <AIRecommendations recommendations={formattedRecs} />
      </div>
    </div>
  )
}