import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { BYPASS_AUTH, MOCK_SESSION } from "@/lib/mock-auth"
import { Users2, Plus, ArrowRight, Shield, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ComparisonTable } from "@/components/competitor/comparison-table"
import { VisibilityShareChart } from "@/components/competitor/visibility-share-chart"
import { WinLossCards } from "@/components/competitor/win-loss-cards"
import { generateWinLossAnalysis } from "@/lib/competitor/benchmark-engine"
import { EmptyState } from "@/components/ui/empty-state"

export const metadata: Metadata = { title: "Competitor Intelligence | TOPSEOTOOL" }

export default async function DashboardCompetitorsPage() {
  const session = BYPASS_AUTH ? MOCK_SESSION : await auth()
  if (!session?.user?.id) redirect("/login")

  let projects: any[] = []
  try {
    const membership = await db.organizationMember.findFirst({
      where: { userId: session.user.id },
      select: { organizationId: true },
    })

    if (membership) {
      projects = await db.project.findMany({
        where: { organizationId: membership.organizationId, status: { not: "ARCHIVED" } },
        orderBy: { updatedAt: "desc" },
        include: {
          websites: true,
          competitors: {
            include: { scans: { orderBy: { scannedAt: "desc" }, take: 1 } },
          },
          seoAudits: { orderBy: { createdAt: "desc" }, take: 1 },
          aiVisibilityScans: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      })
    }
  } catch {
    projects = []
  }

  const primaryProject = projects[0] ?? {
    id: "demo-project",
    name: "TOPSEOTOOL Demo",
    color: "#6366f1",
    websites: [{ domain: "topseotool.net" }],
    competitors: [
      { id: "c1", name: "Semrush", domain: "semrush.com", seoScore: 92, aiVisibility: 88, marketShare: 32, scans: [{ id: "s1" }] },
      { id: "c2", name: "Ahrefs", domain: "ahrefs.com", seoScore: 90, aiVisibility: 85, marketShare: 28, scans: [{ id: "s2" }] },
      { id: "c3", name: "Moz Pro", domain: "moz.com", seoScore: 78, aiVisibility: 65, marketShare: 18, scans: [{ id: "s3" }] },
    ],
    seoAudits: [{ score: 88 }],
    aiVisibilityScans: [{ overallScore: 94 }],
  }

  const userBrandName = primaryProject.name
  const userDomain = primaryProject.websites[0]?.domain ?? "topseotool.net"
  const userSeoScore = primaryProject.seoAudits[0]?.score ?? 84
  const userAiScore = primaryProject.aiVisibilityScans[0]?.overallScore ?? 92

  const userRow = {
    id: "user-brand",
    name: userBrandName,
    domain: userDomain,
    seoScore: userSeoScore,
    aiVisibility: userAiScore,
    mentionRate: 85,
    citationRate: 78,
    recommendationRate: 80,
    sentiment: "POSITIVE",
    contentCoverage: 88,
    addedDate: new Date(),
    isUserBrand: true,
  }

  const competitorRows = (primaryProject.competitors ?? []).map((c: any) => ({
    id: c.id,
    name: c.name ?? c.domain,
    domain: c.domain,
    seoScore: c.seoScore ?? 72,
    aiVisibility: c.aiVisibility ?? 45,
    mentionRate: 40,
    citationRate: 35,
    recommendationRate: 30,
    sentiment: "NEUTRAL",
    contentCoverage: 60,
    addedDate: c.createdAt ?? new Date(),
    isUserBrand: false,
  }))

  const allRows = [userRow, ...competitorRows]

  const chartData = allRows.map((r: any) => ({
    name: r.name,
    score: r.aiVisibility,
    isUser: r.isUserBrand,
  }))

  const winLossData = generateWinLossAnalysis(userBrandName, competitorRows)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">Competitor Intelligence Suite</h1>
            <Badge variant="brand">Module 5</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Head-to-head SEO health, AI search visibility, and LLM citation share benchmarking.
          </p>
        </div>
        <Button size="sm" variant="brand" asChild>
          <Link href={`/projects/${primaryProject.id}/competitors`}>
            <Plus className="h-4 w-4 mr-1.5" /> Manage Competitors
          </Link>
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div>
          <VisibilityShareChart data={chartData} />
        </div>
        <div className="lg:col-span-2">
          <ComparisonTable rows={allRows} />
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold mb-4">Competitive Insights & Opportunities</h2>
        <WinLossCards
          competitorWins={winLossData.competitorWins}
          userWins={winLossData.userWins}
          contentOpportunities={winLossData.contentOpportunities}
        />
      </div>
    </div>
  )
}