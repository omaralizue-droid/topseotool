"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import {
  Link2, ExternalLink, Search, Download, RefreshCw,
  TrendingUp, Star, Shield, Globe, BarChart3, Zap,
  ArrowUpRight, CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const ENGINES = ["All", "ChatGPT", "Perplexity", "Claude", "Google Gemini"]

const MOCK_CITATIONS = [
  {
    id: "c1",
    sourceUrl: "https://topseotool.net/features/ai-audit",
    sourceTitle: "AI Visibility Audit — Scan Your Brand Across All AI Engines",
    citedInEngine: "ChatGPT",
    citedForQuery: "how to check ai brand visibility",
    citationStrength: 98,
    domainAuthority: 84,
    citationType: "Featured",
    detectedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    category: "Product Page"
  },
  {
    id: "c2",
    sourceUrl: "https://topseotool.net/blog/aeo-strategies-2026",
    sourceTitle: "The Complete 2026 Guide to Answer Engine Optimization (AEO)",
    citedInEngine: "Perplexity",
    citedForQuery: "answer engine optimization guide 2026",
    citationStrength: 96,
    domainAuthority: 84,
    citationType: "Editorial",
    detectedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    category: "Blog Post"
  },
  {
    id: "c3",
    sourceUrl: "https://topseotool.net/blog/generative-seo",
    sourceTitle: "Generative SEO: Optimizing for AI-Generated Search Results",
    citedInEngine: "Claude",
    citedForQuery: "what is generative seo and how to implement it",
    citationStrength: 93,
    domainAuthority: 84,
    citationType: "Expert Source",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    category: "Blog Post"
  },
  {
    id: "c4",
    sourceUrl: "https://topseotool.net/pricing",
    sourceTitle: "TopSEOTool Pricing Plans — Starter, Pro, Agency & Enterprise",
    citedInEngine: "Google Gemini",
    citedForQuery: "topseotool pricing and plans comparison",
    citationStrength: 89,
    domainAuthority: 84,
    citationType: "Direct",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    category: "Pricing Page"
  },
  {
    id: "c5",
    sourceUrl: "https://topseotool.net/blog/core-web-vitals-2026",
    sourceTitle: "Core Web Vitals 2026: LCP, INP, CLS Explained & Fixed",
    citedInEngine: "Perplexity",
    citedForQuery: "core web vitals best practices 2026",
    citationStrength: 91,
    domainAuthority: 84,
    citationType: "Technical Reference",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    category: "Blog Post"
  },
  {
    id: "c6",
    sourceUrl: "https://topseotool.net/features/rank-tracker",
    sourceTitle: "Daily SERP Rank Tracker with AI Overview Detection",
    citedInEngine: "ChatGPT",
    citedForQuery: "best daily rank tracking tools with ai overview",
    citationStrength: 87,
    domainAuthority: 84,
    citationType: "Product Mention",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    category: "Product Page"
  },
  {
    id: "c7",
    sourceUrl: "https://topseotool.net/compare/topseotool-vs-semrush",
    sourceTitle: "TopSEOTool vs Semrush: Full Feature Comparison 2026",
    citedInEngine: "Claude",
    citedForQuery: "topseotool semrush comparison which is better",
    citationStrength: 85,
    domainAuthority: 84,
    citationType: "Comparison",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    category: "Comparison Page"
  },
  {
    id: "c8",
    sourceUrl: "https://topseotool.net/blog/schema-markup-ai-visibility",
    sourceTitle: "Schema Markup for AI Visibility: How Structured Data Boosts AEO",
    citedInEngine: "Google Gemini",
    citedForQuery: "how schema markup improves ai search visibility",
    citationStrength: 94,
    domainAuthority: 84,
    citationType: "Expert Source",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    category: "Blog Post"
  },
  {
    id: "c9",
    sourceUrl: "https://topseotool.net/features/competitor-analysis",
    sourceTitle: "Competitor Intelligence & Keyword Gap Analysis Tool",
    citedInEngine: "Perplexity",
    citedForQuery: "ai powered competitor keyword gap analysis tools",
    citationStrength: 82,
    domainAuthority: 84,
    citationType: "Featured",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    category: "Product Page"
  },
  {
    id: "c10",
    sourceUrl: "https://topseotool.net/blog/brand-mentions-ai-tracking",
    sourceTitle: "How to Track Brand Mentions Across AI Search Engines",
    citedInEngine: "ChatGPT",
    citedForQuery: "track brand mentions in ai chatgpt gemini perplexity",
    citationStrength: 90,
    domainAuthority: 84,
    citationType: "Editorial",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    category: "Blog Post"
  }
]

const STRENGTH_COLOR = (s: number) => {
  if (s >= 90) return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
  if (s >= 75) return "text-brand bg-brand/10 border-brand/30"
  return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30"
}

const ENGINE_COLORS: Record<string, string> = {
  "ChatGPT": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  "Perplexity": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  "Claude": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  "Google Gemini": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
}

const TYPE_COLORS: Record<string, string> = {
  "Featured": "bg-brand/10 text-brand border-brand/30",
  "Editorial": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  "Expert Source": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  "Direct": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  "Technical Reference": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  "Product Mention": "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
  "Comparison": "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
}

export default function CitationsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [engineFilter, setEngineFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState<"strength" | "recent">("strength")

  const citations = MOCK_CITATIONS

  const filtered = useMemo(() => {
    let items = citations.filter(c => {
      const matchEngine = engineFilter === "All" || c.citedInEngine === engineFilter
      const matchSearch = !searchQuery ||
        c.sourceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.citedForQuery.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.citedInEngine.toLowerCase().includes(searchQuery.toLowerCase())
      return matchEngine && matchSearch
    })
    if (sortBy === "strength") {
      items = [...items].sort((a, b) => b.citationStrength - a.citationStrength)
    } else {
      items = [...items].sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime())
    }
    return items
  }, [citations, engineFilter, searchQuery, sortBy])

  const avgStrength = Math.round(citations.reduce((acc, c) => acc + c.citationStrength, 0) / citations.length)
  const engineBreakdown = Object.entries(
    citations.reduce((acc: Record<string, number>, c) => {
      acc[c.citedInEngine] = (acc[c.citedInEngine] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  const highStrength = citations.filter(c => c.citationStrength >= 90).length

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Link2 className="h-6 w-6 text-brand" /> AI Citation Sources
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Citation Intelligence</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Pages from your domain that AI engines actively cite as authoritative sources in their answers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1200) }}>
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Scanning..." : "Refresh"}
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border/80 p-4 sm:p-5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Total Citations</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">{citations.length}</span>
            <span className="text-xs font-semibold text-emerald-500">+2 this week</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Unique cited pages</span>
        </Card>

        <Card className="border-border/80 p-4 sm:p-5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Avg Citation Strength</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-brand">{avgStrength}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full">
            <div className="h-full bg-brand rounded-full" style={{ width: `${avgStrength}%` }} />
          </div>
        </Card>

        <Card className="border-border/80 p-4 sm:p-5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">High Strength (90+)</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-500">{highStrength}</span>
            <span className="text-xs text-muted-foreground">of {citations.length}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">{Math.round((highStrength / citations.length) * 100)}% premium citations</span>
        </Card>

        <Card className="border-border/80 p-4 sm:p-5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Top Engine</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">{engineBreakdown[0]?.[0]?.split(" ")[0]}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">{engineBreakdown[0]?.[1]} citations detected</span>
        </Card>
      </div>

      {/* Engine Distribution */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brand" /> Citation Distribution by AI Engine
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {engineBreakdown.map(([engine, count]) => {
            const pct = Math.round((count / citations.length) * 100)
            return (
              <div
                key={engine}
                className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-2 cursor-pointer hover:border-brand/40 transition-all"
                onClick={() => setEngineFilter(engine === engineFilter ? "All" : engine)}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-bold border ${ENGINE_COLORS[engine] || ""}`}>
                    {engine}
                  </Badge>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">{pct}%</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black font-mono text-foreground">{count}</span>
                  <span className="text-[10px] text-muted-foreground">citations</span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full">
                  <div className="h-full bg-brand/70 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Engine:</span>
          {ENGINES.map(eng => (
            <button
              key={eng}
              onClick={() => setEngineFilter(eng)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                engineFilter === eng
                  ? "bg-brand text-brand-foreground border-brand shadow-xs"
                  : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              {eng}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60">
            {(["strength", "recent"] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`text-xs px-2.5 py-0.5 rounded-md transition-all font-medium ${
                  sortBy === s ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "strength" ? "By Strength" : "By Recency"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search citations..."
              className="pl-8 h-8 text-xs w-44 bg-card"
            />
          </div>
        </div>
      </div>

      {/* Citations Table */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/20">
          <h2 className="text-sm font-bold text-foreground">{filtered.length} Cited Sources</h2>
          <span className="text-xs text-muted-foreground">Pages AI engines actively reference</span>
        </div>
        <div className="divide-y divide-border/40">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <Link2 className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="font-semibold text-sm">No citations match your filters</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting the engine filter or search query</p>
            </div>
          ) : (
            filtered.map((c, i) => (
              <div key={c.id} className="p-4 sm:p-5 hover:bg-muted/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/60 border border-border/60 shrink-0 text-xs font-black text-muted-foreground">
                    {i + 1}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="min-w-0">
                        <a
                          href={c.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-sm text-foreground hover:text-brand flex items-center gap-1 group truncate"
                        >
                          <span className="truncate">{c.sourceTitle}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-brand" />
                        </a>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{c.sourceUrl}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`px-2 py-0.5 rounded border text-[11px] font-bold font-mono ${STRENGTH_COLOR(c.citationStrength)}`}>
                          {c.citationStrength}/100
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-bold border ${ENGINE_COLORS[c.citedInEngine] || ""}`}>
                        {c.citedInEngine}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-semibold border ${TYPE_COLORS[c.citationType] || ""}`}>
                        {c.citationType}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
                        {c.category}
                      </Badge>
                    </div>

                    <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                      <Search className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>Cited for: <span className="font-medium text-foreground italic">&ldquo;{c.citedForQuery}&rdquo;</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}