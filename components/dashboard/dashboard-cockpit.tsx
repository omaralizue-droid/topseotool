"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  Brain,
  Globe,
  TrendingUp,
  Link2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  ShieldCheck,
  Filter,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { MetricCard } from "@/components/dashboard/metric-card"
import { AIVisibilityChart } from "@/components/dashboard/ai-visibility-chart"
import { CompetitorComparison } from "@/components/dashboard/competitor-comparison"
import { UsageMetricsCard } from "@/components/dashboard/usage-metrics-card"
import { ProjectSelector } from "@/components/dashboard/project-selector"

interface DashboardCockpitProps {
  primaryProject: any
  formattedProjects: any[]
  formattedCompetitors: any[]
  formattedMentions: any[]
  formattedCitations: any[]
  criticalIssues: any[]
  formattedRecs: any[]
  seoScore: number
  prevSeoScore: number
  seoChange: number
  aiScore: number
  prevAiScore: number
  aiChange: number
  mentionsRate: number
  citationShare: number
}

// High-density sample keyword dataset for the SERP tab
const TRACKED_KEYWORDS = [
  { keyword: "ai seo crawler", position: 2, prevPosition: 4, volume: 14800, kd: 48, cpc: "$3.40", url: "/features/crawler" },
  { keyword: "serp rank tracker nextjs", position: 1, prevPosition: 1, volume: 8200, kd: 35, cpc: "$4.10", url: "/features/rank-tracker" },
  { keyword: "enterprise backlink analyzer", position: 4, prevPosition: 7, volume: 12400, kd: 62, cpc: "$6.80", url: "/features/backlinks" },
  { keyword: "llm search engine visibility", position: 3, prevPosition: 9, volume: 9600, kd: 44, cpc: "$5.20", url: "/ai-visibility" },
  { keyword: "automated technical seo audit", position: 5, prevPosition: 5, volume: 22100, kd: 55, cpc: "$8.50", url: "/site-audit" },
  { keyword: "competitor domain overlap tool", position: 7, prevPosition: 12, volume: 6400, kd: 39, cpc: "$2.90", url: "/competitors" },
]

export function DashboardCockpit({
  primaryProject,
  formattedProjects,
  formattedCompetitors,
  formattedMentions,
  formattedCitations,
  criticalIssues,
  formattedRecs,
  seoScore,
  prevSeoScore,
  seoChange,
  aiScore,
  prevAiScore,
  aiChange,
  mentionsRate,
  citationShare,
}: DashboardCockpitProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "health" | "ai" | "usage">("overview")
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("30D")
  const [searchQuery, setSearchQuery] = useState("")

  const domain = primaryProject?.websites?.[0]?.domain ?? "topseotool.net"

  // Filtered keywords
  const filteredKeywords = TRACKED_KEYWORDS.filter((k) =>
    k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Top Executive Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest font-semibold">
              Workspace Overview
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs text-muted-foreground">
              Last crawl: 14m ago
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
            Search &amp; AI Visibility Cockpit
          </h1>
        </div>

        {/* Action Controls & Project Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <ProjectSelector projects={formattedProjects} selectedProjectId={primaryProject.id} />

          {/* Time range selector */}
          <div className="flex items-center p-0.5 rounded-lg border border-border/80 bg-muted/30 text-xs font-medium">
            {(["7D", "30D", "90D"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-md transition-all duration-100 ${
                  timeRange === range
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 gap-1.5 border-border/80 font-medium"
            asChild
          >
            <Link href={`/projects/${primaryProject.id}/reports`}>
              <FileDown className="h-3.5 w-3.5" /> Export
            </Link>
          </Button>

          <Button
            size="sm"
            variant="default"
            className="text-xs h-8 gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            asChild
          >
            <Link href={`/projects/${primaryProject.id}/seo-audit`}>
              <RefreshCw className="h-3.5 w-3.5" /> Run Audit
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Primary 4 KPIs (High Information Density) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <MetricCard
          title="Technical SEO Health"
          score={seoScore}
          previousScore={prevSeoScore}
          changePercent={seoChange}
          icon={Globe}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <MetricCard
          title="AI Search Visibility"
          score={aiScore}
          previousScore={prevAiScore}
          changePercent={aiChange}
          icon={Brain}
          color="text-indigo-600 dark:text-indigo-400"
        />
        <MetricCard
          title="LLM Mention Rate"
          score={mentionsRate}
          previousScore={80}
          changePercent={5}
          icon={TrendingUp}
          color="text-amber-600 dark:text-amber-400"
        />
        <MetricCard
          title="AEO Citation Share"
          score={citationShare}
          previousScore={70}
          changePercent={8}
          icon={Link2}
          color="text-sky-600 dark:text-sky-400"
        />
      </div>

      {/* 3. Secondary Quick Summary Strip (B2B SaaS Metrics Bar) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg border border-border/60 bg-muted/20 text-xs font-mono-nums">
        <div className="flex items-center justify-between px-2">
          <span className="text-muted-foreground text-[11px]">Pages Audited:</span>
          <span className="font-semibold text-foreground">240 / 500</span>
        </div>
        <div className="flex items-center justify-between px-2 border-l border-border/40">
          <span className="text-muted-foreground text-[11px]">Tracked Terms:</span>
          <span className="font-semibold text-foreground">142 keywords</span>
        </div>
        <div className="flex items-center justify-between px-2 border-l border-border/40">
          <span className="text-muted-foreground text-[11px]">Top 3 SERP:</span>
          <span className="font-semibold text-emerald-500">24 terms (17%)</span>
        </div>
        <div className="flex items-center justify-between px-2 border-l border-border/40">
          <span className="text-muted-foreground text-[11px]">Referring Domains:</span>
          <span className="font-semibold text-foreground">1,420 (DA 68)</span>
        </div>
      </div>

      {/* 4. Intelligent Tab Switcher */}
      <div className="flex items-center gap-1.5 border-b border-border/60 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Overview & Trends", icon: BarChart3 },
          { id: "keywords", label: "Tracked Keywords (SERP)", icon: Search },
          { id: "health", label: "Health & Critical Issues", icon: ShieldCheck },
          { id: "ai", label: "AI Citations & Engines", icon: Brain },
          { id: "usage", label: "Resource Quotas", icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 5. TAB CONTENT */}

      {/* TAB: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
        </div>
      )}

      {/* TAB: KEYWORDS & SERP */}
      {activeTab === "keywords" && (
        <Card className="border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-semibold">Active Keyword Position Radar</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Daily SERP positions across Google &amp; Bing with position deltas and search volume.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Filter tracked terms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-7 pl-8 text-xs w-48 bg-background border-border/80"
                  />
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-border/80" asChild>
                  <Link href={`/projects/${primaryProject.id}/keywords`}>
                    View All →
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Compact Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30 border-b border-border/40 text-muted-foreground font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Keyword Term</th>
                  <th className="py-2.5 px-3">Position</th>
                  <th className="py-2.5 px-3">Movement</th>
                  <th className="py-2.5 px-3">Search Volume</th>
                  <th className="py-2.5 px-3">KD %</th>
                  <th className="py-2.5 px-3">Est. CPC</th>
                  <th className="py-2.5 px-4">Landing URL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredKeywords.map((row) => {
                  const delta = row.prevPosition - row.position
                  const isUp = delta > 0
                  const isDown = delta < 0
                  return (
                    <tr key={row.keyword} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-foreground">
                        {row.keyword}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md ${
                          row.position <= 3
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : row.position <= 10
                            ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          #{row.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {isUp && (
                          <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold gap-0.5">
                            <ArrowUpRight className="h-3 w-3" /> +{delta}
                          </span>
                        )}
                        {isDown && (
                          <span className="inline-flex items-center text-red-600 dark:text-red-400 font-semibold gap-0.5">
                            <ArrowDownRight className="h-3 w-3" /> {delta}
                          </span>
                        )}
                        {delta === 0 && <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">
                        {row.volume.toLocaleString()} /mo
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className={`text-[10px] font-mono ${
                          row.kd > 60 ? "border-amber-500/30 text-amber-500" : "border-emerald-500/30 text-emerald-500"
                        }`}>
                          {row.kd}%
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-muted-foreground">
                        {row.cpc}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-muted-foreground truncate max-w-[140px]">
                        {row.url}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB: HEALTH & CRAWL */}
      {activeTab === "health" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/10">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" /> Critical Technical Issues ({criticalIssues.length || 2})
              </CardTitle>
            </CardHeader>
            <div className="p-4 divide-y divide-border/30 space-y-3">
              <div className="pt-2 first:pt-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground">Missing H1 Structure on Core Landing Pages</span>
                  <Badge variant="error" className="text-[10px]">CRITICAL</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  3 marketing pages lack a primary H1 heading element, reducing crawler semantic hierarchy.
                </p>
                <div className="text-[10px] font-mono text-muted-foreground bg-muted/30 p-1.5 rounded">
                  Affected: /pricing, /features/ai-visibility
                </div>
              </div>

              <div className="pt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground">Uncompressed Asset LCP Degradation</span>
                  <Badge variant="error" className="text-[10px]">CRITICAL</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Hero WebP image exceeded 450kb causing Largest Contentful Paint to register 2.8s.
                </p>
                <div className="text-[10px] font-mono text-muted-foreground bg-muted/30 p-1.5 rounded">
                  Affected: / (homepage banner)
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-border/60 shadow-xs">
            <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/10">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Automated Recommendations
              </CardTitle>
            </CardHeader>
            <div className="p-4 space-y-3">
              {(formattedRecs.length > 0 ? formattedRecs : [
                { id: "1", title: "Deploy llms.txt standard file", impact: "+18% AI Citation Discovery", priority: "HIGH" },
                { id: "2", title: "Implement Question/Answer FAQ Schema", impact: "+12% Snippet Inclusion", priority: "MEDIUM" },
              ]).map((rec) => (
                <div key={rec.id} className="p-3 rounded-lg border border-border/60 bg-muted/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground">{rec.title}</span>
                    <Badge variant="brand" className="text-[10px]">{rec.priority}</Badge>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Estimated Impact: {rec.impact}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB: AI ENGINES & CITATIONS */}
      {activeTab === "ai" && (
        <Card className="border-border/60 shadow-xs overflow-hidden">
          <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/10">
            <CardTitle className="text-sm font-semibold">Live Brand Citations Across Generative Engines</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Direct citations detected in ChatGPT, Claude, Gemini, and Perplexity response completions.
            </CardDescription>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/30 border-b border-border/40 text-muted-foreground font-semibold text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Engine</th>
                  <th className="py-2.5 px-3">Target Query</th>
                  <th className="py-2.5 px-4">Cited Passage</th>
                  <th className="py-2.5 px-3">Sentiment</th>
                  <th className="py-2.5 px-3">Citation Strength</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {(formattedMentions.length > 0 ? formattedMentions : [
                  { id: "1", source: "Perplexity", query: "Best SEO & AI Visibility Platform 2026", mentionText: "TOPSEOTOOL is cited as a leading provider for automated SERP monitoring.", sentiment: "POSITIVE" },
                  { id: "2", source: "ChatGPT", query: "Top AEO optimization frameworks", mentionText: "TOPSEOTOOL provides structured schema insights for LLM citations.", sentiment: "POSITIVE" },
                  { id: "3", source: "Claude", query: "Technical website audit solutions", mentionText: "TOPSEOTOOL delivers automated crawl diagnostics and Core Web Vitals checks.", sentiment: "POSITIVE" },
                ]).map((mention) => (
                  <tr key={mention.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-foreground">
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        {mention.source}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-foreground max-w-[200px] truncate">
                      {mention.query}
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground text-[11px] max-w-[320px] truncate">
                      "{mention.mentionText}"
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-500 bg-emerald-500/10">
                        {mention.sentiment}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-500">
                      94%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB: USAGE & QUOTAS */}
      {activeTab === "usage" && (
        <UsageMetricsCard />
      )}
    </div>
  )
}
