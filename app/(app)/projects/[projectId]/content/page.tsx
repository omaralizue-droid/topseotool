"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  FileEdit, Sparkles, BookOpen, TrendingUp, AlertTriangle,
  ArrowUpRight, CheckCircle2, Clock, Layers, Plus, Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const CONTENT_ASSETS = [
  {
    path: "/blog/enterprise-seo-2026",
    title: "The 2026 Enterprise SEO & Generative Search Playbook",
    words: 3420,
    score: 94,
    traffic: "19.8K visits",
    decayStatus: "Fresh",
    targetKw: "enterprise seo guide",
    status: "Optimized"
  },
  {
    path: "/features/ai-search-optimization",
    title: "AI Search Engine Optimization & Citation Auditing",
    words: 2150,
    score: 91,
    traffic: "14.2K visits",
    decayStatus: "Fresh",
    targetKw: "ai search optimization",
    status: "Optimized"
  },
  {
    path: "/blog/core-web-vitals-guide",
    title: "Mastering Core Web Vitals (LCP, INP, CLS) in 2026",
    words: 1850,
    score: 72,
    traffic: "8.4K visits",
    decayStatus: "Needs Update",
    targetKw: "core web vitals guide",
    status: "Needs Polish"
  },
  {
    path: "/compare/topseotool-vs-semrush",
    title: "TopSEOTool vs Semrush: 2026 Enterprise Feature Breakdown",
    words: 2840,
    score: 88,
    traffic: "11.2K visits",
    decayStatus: "Fresh",
    targetKw: "topseotool vs semrush",
    status: "Optimized"
  }
]

export default function ProjectContentPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileEdit className="h-6 w-6 text-brand" /> Content Intelligence &amp; Performance
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">NLP Audited</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Content scoring, decay detection, keyword cannibalization warnings, and editorial optimization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" asChild className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm">
            <Link href={`/projects/${projectId}/content-optimizer`}>
              <Sparkles className="h-3.5 w-3.5" /> Launch Content Optimizer
            </Link>
          </Button>
        </div>
      </div>

      {/* Content KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Average Content Score
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-foreground">86/100</span>
            <span className="text-xs font-bold text-emerald-500">+4 pts</span>
          </div>
          <span className="text-[11px] text-muted-foreground">High semantic depth across pages</span>
        </Card>

        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Indexed Words
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-brand">342.5K</span>
            <span className="text-xs text-muted-foreground">across 124 articles</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Average 2,760 words/page</span>
        </Card>

        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Decaying Articles
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-amber-500">1</span>
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">Action Needed</Badge>
          </div>
          <span className="text-[11px] text-muted-foreground">1 post lost &gt; 15% traffic this quarter</span>
        </Card>

        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cannibalization Issues
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-emerald-500">0</span>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">Zero Conflicts</Badge>
          </div>
          <span className="text-[11px] text-muted-foreground">Clean 1-to-1 keyword targeting</span>
        </Card>
      </div>

      {/* Content Asset Inventory Table */}
      <Card className="border-border/80 overflow-hidden shadow-xs">
        <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-sm font-semibold">Indexed Content Performance Inventory</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Rankings and NLP optimization status across key revenue articles
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Article Title &amp; URL</th>
                <th className="py-3 px-3">Word Count</th>
                <th className="py-3 px-3">NLP Score</th>
                <th className="py-3 px-3">Organic Traffic</th>
                <th className="py-3 px-3">Target Keyword</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {CONTENT_ASSETS.map((asset) => (
                <tr key={asset.path} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-foreground">{asset.title}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">{asset.path}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">
                    {asset.words.toLocaleString()} words
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        asset.score >= 80
                          ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/10"
                          : "border-amber-500/40 text-amber-500 bg-amber-500/10"
                      }`}
                    >
                      {asset.score}/100
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-foreground">
                    {asset.traffic}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className="text-[10px] border-brand/30 text-brand">
                      {asset.targetKw}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                      <Link href={`/projects/${projectId}/content-optimizer`}>
                        Optimize <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
