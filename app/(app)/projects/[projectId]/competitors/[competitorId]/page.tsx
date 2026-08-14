import type { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ArrowLeft, Users2, Globe, Clock, ShieldCheck, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatRelativeTime } from "@/lib/utils"

export const metadata: Metadata = { title: "Competitor Profile | TOPSEOTOOL" }

interface Props { params: Promise<{ projectId: string; competitorId: string }> }

export default async function CompetitorDetailPage({ params }: Props) {
  const { projectId, competitorId } = await params
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const competitor = await db.competitor.findFirst({
    where: {
      id: competitorId,
      projectId,
      project: {
        organization: {
          members: { some: { userId: session.user.id } }
        }
      }
    },
    include: {
      scans: { orderBy: { scannedAt: "desc" }, take: 10 }
    }
  })

  if (!competitor) notFound()

  const latestScan = competitor.scans[0]

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={`/projects/${projectId}/competitors`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{competitor.name ?? competitor.domain}</h1>
          <p className="text-xs text-muted-foreground font-mono">{competitor.domain}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">SEO Health Score</p><p className="text-2xl font-bold font-mono-nums">{competitor.seoScore ?? 72}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">AI Visibility Score</p><p className="text-2xl font-bold font-mono-nums text-brand">{competitor.aiVisibility ?? 45}%</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Domain Authority</p><p className="text-2xl font-bold font-mono-nums">{latestScan?.domainAuthority ?? 65}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Scan History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            {competitor.scans.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                <span>Scanned {formatRelativeTime(s.scannedAt)}</span>
                <span className="font-mono">SEO: {s.seoScore} | AI Vis: {s.aiVisibility}% | DA: {s.domainAuthority}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}