"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  Activity, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle,
  RefreshCw, Globe, Gauge, Lock, Smartphone, FileCode,
  Check, ArrowUpRight, Download, BarChart3, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const HEALTH_CATEGORIES = [
  { name: "Crawlability & Indexing", score: 98, issues: 0, warnings: 2, status: "Healthy" },
  { name: "Core Web Vitals & Speed", score: 92, issues: 0, warnings: 3, status: "Fast" },
  { name: "Structured Data & Schema", score: 95, issues: 0, warnings: 1, status: "Valid" },
  { name: "Security & HTTPS Protocol", score: 100, issues: 0, warnings: 0, status: "Optimal" },
  { name: "Mobile Viewport Compliance", score: 96, issues: 0, warnings: 1, status: "Compliant" },
]

export default function ProjectSeoHealthPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"
  const [isCrawling, setIsCrawling] = useState(false)
  const [crawlComplete, setCrawlComplete] = useState(false)

  const handleCrawl = () => {
    setIsCrawling(true)
    setCrawlComplete(false)
    setTimeout(() => {
      setIsCrawling(false)
      setCrawlComplete(true)
      setTimeout(() => setCrawlComplete(false), 3000)
    }, 1200)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 text-brand" /> SEO Health &amp; Technical Score
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Comprehensive</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Holistic website health inspection covering crawl errors, Core Web Vitals, HTTPS, schema, and mobile usability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleCrawl}
            disabled={isCrawling}
            className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCrawling ? "animate-spin" : ""}`} />
            {isCrawling ? "Crawling Site..." : crawlComplete ? "Crawl Complete!" : "Run Health Crawl"}
          </Button>
        </div>
      </div>

      {/* Main Scorecard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/80 p-5 flex flex-col justify-between bg-card shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            SEO Health Score
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-black font-mono-nums text-emerald-500">92</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
            <span className="text-xs font-bold text-emerald-500 ml-auto">+4 pts</span>
          </div>
          <Progress value={92} className="h-2 [&>div]:bg-emerald-500" />
        </Card>

        <Card className="border-border/80 p-5 flex flex-col justify-between bg-card shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Critical Issues
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-black font-mono-nums text-foreground">0</span>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] ml-auto">
              Passed
            </Badge>
          </div>
          <span className="text-[11px] text-muted-foreground">Zero 5xx server errors or index blockers</span>
        </Card>

        <Card className="border-border/80 p-5 flex flex-col justify-between bg-card shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            High / Medium Notices
          </span>
          <div className="flex items-baseline gap-2 my-2">
            <span className="text-4xl font-black font-mono-nums text-amber-500">3</span>
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] ml-auto">
              Actionable
            </Badge>
          </div>
          <span className="text-[11px] text-muted-foreground">Render blocking JS & missing image alt tags</span>
        </Card>

        <Card className="border-border/80 p-5 flex flex-col justify-between bg-card shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Fix → Recheck Engine
          </span>
          <div className="my-2">
            <Button size="sm" asChild className="w-full h-8 text-xs font-semibold bg-brand hover:bg-brand/90 text-brand-foreground shadow-xs gap-1.5">
              <Link href={`/projects/${projectId}/seo-audit`}>
                <Zap className="h-3.5 w-3.5" /> Launch Fix → Recheck
              </Link>
            </Button>
          </div>
          <span className="text-[11px] text-muted-foreground">Live probe validation & automatic score boost</span>
        </Card>
      </div>

      {/* Category Breakdowns Table */}
      <Card className="border-border/80 overflow-hidden shadow-xs">
        <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-sm font-semibold">Technical Category Health Matrix</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Granular evaluation across critical architectural pillars
          </CardDescription>
        </CardHeader>

        <div className="divide-y divide-border/40">
          {HEALTH_CATEGORIES.map((cat) => (
            <div key={cat.name} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/20 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{cat.name}</span>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                    {cat.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span>{cat.issues} critical issues</span>
                  <span>•</span>
                  <span>{cat.warnings} notices</span>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 sm:w-60">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Health</span>
                    <span className="font-bold font-mono text-foreground">{cat.score}%</span>
                  </div>
                  <Progress value={cat.score} className="h-2 [&>div]:bg-emerald-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
