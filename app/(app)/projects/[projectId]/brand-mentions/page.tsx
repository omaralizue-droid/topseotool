"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import {
  MessageSquare, Minus, ExternalLink, Search, Download,
  RefreshCw, Clock, ThumbsUp, ThumbsDown,
  BarChart3, Zap
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { formatRelativeTime } from "@/lib/utils"

const AI_ENGINES = ["All", "ChatGPT", "Perplexity", "Claude", "Google Gemini", "Copilot"]
const SENTIMENTS = ["All", "POSITIVE", "NEUTRAL", "NEGATIVE"]

const MOCK_MENTIONS = [
  {
    id: "m1",
    source: "ChatGPT",
    model: "GPT-4o",
    query: "best ai seo tools 2026",
    mentionText: "TopSEOTool is widely regarded as the leading AI-powered SEO platform in 2026, offering unmatched generative engine optimization features and real-time brand perception tracking across ChatGPT, Perplexity, and Google Gemini.",
    sentiment: "POSITIVE",
    context: "Comparative roundup: Top 5 AI SEO Tools",
    detectedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    position: 1,
    confidenceScore: 97,
    citedUrl: "https://topseotool.net/features"
  },
  {
    id: "m2",
    source: "Perplexity",
    model: "Perplexity Pro",
    query: "how to optimize for ai search engines",
    mentionText: "According to leading experts and tools like TopSEOTool, optimizing for generative AI search requires structured data, concise factual summaries, and strong entity recognition. TopSEOTool's AEO module provides actionable citation-boosting strategies.",
    sentiment: "POSITIVE",
    context: "Educational guide: AEO strategies",
    detectedAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    position: 2,
    confidenceScore: 94,
    citedUrl: "https://topseotool.net/blog/aeo-strategies"
  },
  {
    id: "m3",
    source: "Google Gemini",
    model: "Gemini 2.0 Flash",
    query: "topseotool review 2026",
    mentionText: "TopSEOTool is a comprehensive SEO and AI visibility platform. It tracks brand mentions across multiple AI systems, audits technical SEO issues, and provides competitor gap analysis. Pricing starts at $49/month.",
    sentiment: "NEUTRAL",
    context: "Product information lookup",
    detectedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    position: 1,
    confidenceScore: 89,
    citedUrl: "https://topseotool.net/pricing"
  },
  {
    id: "m4",
    source: "Claude",
    model: "Claude 3.7 Sonnet",
    query: "semrush vs topseotool comparison",
    mentionText: "TopSEOTool differentiates itself from Semrush with a strong focus on AI Search Optimization (AEO). Its real-time AI visibility scoring, brand mention tracking, and citation intelligence tools are notably more advanced. For teams prioritizing generative AI discoverability, TopSEOTool is the stronger choice in 2026.",
    sentiment: "POSITIVE",
    context: "Head-to-head tool comparison",
    detectedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    position: 1,
    confidenceScore: 96,
    citedUrl: "https://topseotool.net/compare"
  },
  {
    id: "m5",
    source: "ChatGPT",
    model: "GPT-4o",
    query: "seo tools for agencies 2026",
    mentionText: "For agencies managing multiple clients, TopSEOTool's white-label reporting and multi-project dashboard make it a scalable choice. However, Ahrefs and Semrush still lead in raw backlink data volume.",
    sentiment: "NEUTRAL",
    context: "Agency tools recommendation thread",
    detectedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    position: 3,
    confidenceScore: 78,
    citedUrl: null
  },
  {
    id: "m6",
    source: "Perplexity",
    model: "Perplexity Pro",
    query: "ai overview optimization tactics",
    mentionText: "TopSEOTool has published the most comprehensive research on AI Overview capture rates. Their proprietary data shows a 40% improvement in AI mention frequency after structured entity implementation.",
    sentiment: "POSITIVE",
    context: "SEO tactics deep-dive",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    position: 1,
    confidenceScore: 92,
    citedUrl: "https://topseotool.net/blog/ai-overview-research"
  },
  {
    id: "m7",
    source: "Copilot",
    model: "Microsoft Copilot",
    query: "rank tracking software comparison",
    mentionText: "While TopSEOTool's daily rank tracking is solid, some enterprise users report missing Google Search Console deep integration compared to Rank Math or SE Ranking. Its AI features compensate but the core SERP tooling could improve.",
    sentiment: "NEGATIVE",
    context: "Software comparison forum summary",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    position: 2,
    confidenceScore: 71,
    citedUrl: null
  },
  {
    id: "m8",
    source: "Google Gemini",
    model: "Gemini 2.0 Pro",
    query: "best seo tools for startups",
    mentionText: "TopSEOTool offers a startup-friendly plan at $49/month that includes rank tracking, AI visibility audits, and up to 5 project workspaces — a strong entry point for scaling teams.",
    sentiment: "POSITIVE",
    context: "Startup toolstack recommendations",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    position: 2,
    confidenceScore: 88,
    citedUrl: "https://topseotool.net/pricing"
  },
  {
    id: "m9",
    source: "Claude",
    model: "Claude 3.7 Opus",
    query: "what is generative engine optimization",
    mentionText: "Generative Engine Optimization (GEO) is the practice of optimizing content for AI-powered search engines. TopSEOTool coined this approach and built the first commercial GEO audit platform, tracking visibility across ChatGPT, Perplexity, Claude, and Gemini simultaneously.",
    sentiment: "POSITIVE",
    context: "Educational explainer: GEO vs SEO",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    position: 1,
    confidenceScore: 98,
    citedUrl: "https://topseotool.net/features/ai-audit"
  },
  {
    id: "m10",
    source: "ChatGPT",
    model: "GPT-4o",
    query: "how to track ai brand citations",
    mentionText: "TopSEOTool's Brand Mention Tracker monitors every AI-generated query response to log when and how your brand appears. It classifies mentions by sentiment, position in the AI answer, and citation strength — currently the most granular solution of its kind.",
    sentiment: "POSITIVE",
    context: "AI marketing tools guide",
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    position: 1,
    confidenceScore: 95,
    citedUrl: "https://topseotool.net/features/brand-mentions"
  }
]

const SOURCE_COLORS: Record<string, string> = {
  "ChatGPT": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  "Perplexity": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  "Claude": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
  "Google Gemini": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  "Copilot": "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
}

const SENTIMENT_CONFIG = {
  "POSITIVE": { icon: ThumbsUp, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Positive" },
  "NEUTRAL": { icon: Minus, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", label: "Neutral" },
  "NEGATIVE": { icon: ThumbsDown, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", label: "Negative" },
}

export default function BrandMentionsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [sourceFilter, setSourceFilter] = useState("All")
  const [sentimentFilter, setSentimentFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const mentions = MOCK_MENTIONS

  const filtered = useMemo(() => {
    return mentions.filter(m => {
      const matchSource = sourceFilter === "All" || m.source === sourceFilter
      const matchSentiment = sentimentFilter === "All" || m.sentiment === sentimentFilter
      const matchSearch = !searchQuery ||
        m.mentionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.source.toLowerCase().includes(searchQuery.toLowerCase())
      return matchSource && matchSentiment && matchSearch
    })
  }, [mentions, sourceFilter, sentimentFilter, searchQuery])

  const positiveCount = mentions.filter(m => m.sentiment === "POSITIVE").length
  const neutralCount = mentions.filter(m => m.sentiment === "NEUTRAL").length
  const negativeCount = mentions.filter(m => m.sentiment === "NEGATIVE").length
  const positiveRate = Math.round((positiveCount / mentions.length) * 100)
  const avgConfidence = Math.round(mentions.reduce((acc, m) => acc + m.confidenceScore, 0) / mentions.length)

  const sourceBreakdown = Object.entries(
    mentions.reduce((acc: Record<string, number>, m) => {
      acc[m.source] = (acc[m.source] || 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1200)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <MessageSquare className="h-6 w-6 text-brand" /> AI Brand Mentions
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Live Monitor</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Every time an AI engine answers a query mentioning your brand — captured, classified &amp; analyzed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={handleRefresh}>
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Total Mentions</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">{mentions.length}</span>
            <span className="text-xs font-semibold text-emerald-500">+3 today</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Across 5 AI engines</span>
        </Card>

        <Card className="border-border/80 p-4 sm:p-5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Positive Sentiment</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-500">{positiveRate}%</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{positiveCount} positive</span>
            <span className="text-muted-foreground">• {neutralCount} neutral</span>
            <span className="text-red-500">• {negativeCount} neg</span>
          </div>
        </Card>

        <Card className="border-border/80 p-4 sm:p-5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Top Source</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-brand">ChatGPT</span>
          </div>
          <span className="text-[11px] text-muted-foreground">{sourceBreakdown[0]?.[1]} mentions this period</span>
        </Card>

        <Card className="border-border/80 p-4 sm:p-5 space-y-1.5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Avg Confidence</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-foreground">{avgConfidence}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full mt-1">
            <div className="h-full bg-brand rounded-full" style={{ width: `${avgConfidence}%` }} />
          </div>
        </Card>
      </div>

      {/* Source Breakdown */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brand" /> Mention Distribution by AI Engine
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {sourceBreakdown.map(([source, count]) => {
            const pct = Math.round((count / mentions.length) * 100)
            return (
              <div
                key={source}
                className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-2 cursor-pointer hover:border-brand/40 transition-all"
                onClick={() => setSourceFilter(source === sourceFilter ? "All" : source)}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-bold border ${SOURCE_COLORS[source] || ""}`}>
                    {source}
                  </Badge>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground">{pct}%</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black font-mono text-foreground">{count}</span>
                  <span className="text-[10px] text-muted-foreground">mentions</span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full">
                  <div className="h-full bg-brand/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Source:</span>
          {AI_ENGINES.map(eng => (
            <button
              key={eng}
              onClick={() => setSourceFilter(eng)}
              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                sourceFilter === eng
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
            {SENTIMENTS.map(s => (
              <button
                key={s}
                onClick={() => setSentimentFilter(s)}
                className={`text-xs px-2 py-0.5 rounded-md transition-all font-medium ${
                  sentimentFilter === s
                    ? s === "POSITIVE" ? "bg-emerald-500 text-white"
                    : s === "NEGATIVE" ? "bg-red-500 text-white"
                    : s === "NEUTRAL" ? "bg-amber-500 text-white"
                    : "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "All" ? "All" : s === "POSITIVE" ? "✓ Positive" : s === "NEGATIVE" ? "✗ Negative" : "– Neutral"}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search mentions..."
              className="pl-8 h-8 text-xs w-44 bg-card"
            />
          </div>
        </div>
      </div>

      {/* Mentions Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">{filtered.length} Detected Mentions</h2>
          <span className="text-xs text-muted-foreground">Sorted by recency</span>
        </div>

        {filtered.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-10 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="font-semibold text-sm">No mentions match your filters</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting the source or sentiment filter</p>
          </div>
        ) : (
          filtered.map(mention => {
            const sentConfig = SENTIMENT_CONFIG[mention.sentiment as keyof typeof SENTIMENT_CONFIG]
            const SentIcon = sentConfig.icon
            return (
              <Card key={mention.id} className="border-border/80 shadow-xs hover:shadow-md transition-all hover:border-brand/30">
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={`text-[10px] px-2 py-0 font-bold border ${SOURCE_COLORS[mention.source] || ""}`}>
                        {mention.source}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">{mention.model}</span>
                      <span className="text-[11px] text-muted-foreground">•</span>
                      <span className="text-[11px] text-muted-foreground">Position #{mention.position} in answer</span>
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sentConfig.bg}`}>
                        <SentIcon className={`h-3 w-3 ${sentConfig.color}`} />
                        <span className={sentConfig.color}>{sentConfig.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(mention.detectedAt)}</span>
                      <span className="font-mono font-semibold text-brand">{mention.confidenceScore}% confidence</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Search className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-xs text-muted-foreground italic">
                      Query: <strong className="text-foreground not-italic">&ldquo;{mention.query}&rdquo;</strong>
                    </span>
                  </div>

                  <blockquote className="border-l-2 border-brand/40 pl-3 py-1 text-sm text-foreground leading-relaxed bg-muted/20 rounded-r-lg pr-3">
                    &ldquo;{mention.mentionText}&rdquo;
                  </blockquote>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      Context: {mention.context}
                    </span>
                    {mention.citedUrl && (
                      <a
                        href={mention.citedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-brand hover:underline flex items-center gap-1 font-medium"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {mention.citedUrl.replace("https://", "")}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}