"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  TrendingUp, Users, ArrowUpRight, ArrowDownRight, Globe,
  Clock, Activity, Sparkles, Filter, Download, Calendar,
  BarChart3, Compass, Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const TRAFFIC_PAGES = [
  { path: "/", title: "TopSEOTool — All-in-One SEO Intelligence", visits: 48200, share: "34.2%", change: "+14.8%", primaryKeyword: "ai seo platform" },
  { path: "/features", title: "Enterprise AEO & Generative Search", visits: 24500, share: "17.4%", change: "+22.1%", primaryKeyword: "generative engine optimization" },
  { path: "/blog/enterprise-seo-2026", title: "The 2026 Enterprise SEO Playbook", visits: 19800, share: "14.0%", change: "+8.4%", primaryKeyword: "enterprise seo guide" },
  { path: "/ai-perception", title: "AI Brand Perception Simulator", visits: 16200, share: "11.5%", change: "+38.6%", primaryKeyword: "chatgpt brand visibility" },
  { path: "/pricing", title: "Plans & Pricing for Freelancers and Teams", visits: 12400, share: "8.8%", change: "+5.2%", primaryKeyword: "seo software pricing" }
]

const SOURCES = [
  { name: "Organic Search (Google)", share: 58, count: "81,800 visits", color: "bg-emerald-500" },
  { name: "Generative AI Engines (ChatGPT, Perplexity)", share: 22, count: "31,000 visits", color: "bg-brand" },
  { name: "Direct & Bookmarks", share: 14, count: "19,700 visits", color: "bg-sky-500" },
  { name: "Referral & Citations", share: 6, count: "8,500 visits", color: "bg-amber-500" }
]

export default function TrafficInsightsPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("30d")

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-brand" /> Traffic Insights &amp; Search Share
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Real-Time Estimations</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Organic search volume, AI answer engine visitor referrals, and top landing page performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border/60 p-0.5 bg-muted/30">
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  period === p ? "bg-card shadow-xs text-brand font-semibold" : "text-muted-foreground"
                }`}
              >
                {p === "7d" ? "Last 7 Days" : p === "30d" ? "Last 30 Days" : "Last Quarter"}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              const csv = "Path,Title,Visits,Share,Change\n" + TRAFFIC_PAGES.map(p => `"${p.path}","${p.title}",${p.visits},"${p.share}","${p.change}"`).join("\n")
              const blob = new Blob([csv], { type: "text/csv" })
              const a = document.createElement("a")
              a.href = URL.createObjectURL(blob)
              a.download = `traffic_report_${projectId}.csv`
              a.click()
            }}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Primary Traffic Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Monthly Organic Visits
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-foreground">141.0K</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> +16.2%
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground block">Estimated search sessions</span>
        </Card>

        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            AI Referral Share
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-brand">22.0%</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> +42.0%
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground block">31,000 visitors from LLMs</span>
        </Card>

        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Average Session Time
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-foreground">3m 42s</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> +18s
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground block">High engagement index</span>
        </Card>

        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Search Bounce Rate
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-foreground">38.4%</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <ArrowDownRight className="h-3.5 w-3.5" /> -4.1%
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground block">Top quartile across SaaS</span>
        </Card>
      </div>

      {/* Middle Grid: Traffic Sources Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-border/80 p-5 space-y-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Compass className="h-4 w-4 text-brand" /> Traffic Channel Share
          </CardTitle>

          <div className="space-y-3 pt-2">
            {SOURCES.map((source) => (
              <div key={source.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">{source.name}</span>
                  <span className="font-mono text-muted-foreground">{source.share}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${source.color} rounded-full`} style={{ width: `${source.share}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">{source.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Landing Pages Table */}
        <Card className="lg:col-span-2 border-border/80 overflow-hidden shadow-xs">
          <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4 text-brand" /> Top Organic Landing Pages
            </CardTitle>
            <span className="text-xs text-muted-foreground">Highest Converting URLs</span>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Page Path &amp; Title</th>
                  <th className="py-3 px-3">Est. Visits</th>
                  <th className="py-3 px-3">Share</th>
                  <th className="py-3 px-3">Growth</th>
                  <th className="py-3 px-4">Primary Keyword</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {TRAFFIC_PAGES.map((page) => (
                  <tr key={page.path} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{page.title}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{page.path}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-foreground">
                      {page.visits.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono text-muted-foreground">
                      {page.share}
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-emerald-500">
                      {page.change}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] border-brand/30 text-brand">
                        {page.primaryKeyword}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
