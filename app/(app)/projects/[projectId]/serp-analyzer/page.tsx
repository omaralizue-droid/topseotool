"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  Layers, Search, Globe, TrendingUp, ShieldCheck, Sparkles,
  ExternalLink, BarChart3, Filter, Download, ArrowUpRight,
  CheckCircle2, AlertTriangle, Monitor, Smartphone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SerpEntry {
  rank: number
  title: string
  url: string
  domain: string
  dr: number
  backlinks: number
  wordCount: number
  loadSpeedMs: number
  features: string[]
  isMyDomain?: boolean
}

const SAMPLE_SERP: SerpEntry[] = [
  {
    rank: 1,
    title: "TOPSEOTOOL — All-in-One SEO & AEO Intelligence Platform",
    url: "https://topseotool.net",
    domain: "topseotool.net",
    dr: 84,
    backlinks: 1420,
    wordCount: 2840,
    loadSpeedMs: 640,
    features: ["AI Overview", "Featured Snippet"],
    isMyDomain: true
  },
  {
    rank: 2,
    title: "Best SEO Tools for Enterprise Audits & Rank Tracking in 2026",
    url: "https://semrush.com/blog/best-seo-tools",
    domain: "semrush.com",
    dr: 92,
    backlinks: 4120,
    wordCount: 3450,
    loadSpeedMs: 820,
    features: ["People Also Ask", "Sitelinks"]
  },
  {
    rank: 3,
    title: "The Comprehensive Guide to Modern Organic Search Intelligence",
    url: "https://ahrefs.com/blog/organic-search",
    domain: "ahrefs.com",
    dr: 90,
    backlinks: 3200,
    wordCount: 3100,
    loadSpeedMs: 910,
    features: ["People Also Ask"]
  },
  {
    rank: 4,
    title: "How to Measure Generative Search Engine Visibility",
    url: "https://searchengineland.com/generative-search-metrics",
    domain: "searchengineland.com",
    dr: 88,
    backlinks: 890,
    wordCount: 1950,
    loadSpeedMs: 740,
    features: ["News Carousel"]
  },
  {
    rank: 5,
    title: "Top 10 Growth Marketing & Technical SEO Platforms Reviewed",
    url: "https://hubspot.com/marketing/seo-platforms",
    domain: "hubspot.com",
    dr: 93,
    backlinks: 2450,
    wordCount: 4200,
    loadSpeedMs: 1120,
    features: ["Video Snippet"]
  }
]

export default function SerpAnalyzerPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  const [query, setQuery] = useState("ai seo tools")
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
  const [location, setLocation] = useState("United States")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [entries, setEntries] = useState<SerpEntry[]>(SAMPLE_SERP)

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
    }, 600)
  }

  const avgWords = Math.round(entries.reduce((acc, e) => acc + e.wordCount, 0) / entries.length)
  const avgDr = Math.round(entries.reduce((acc, e) => acc + e.dr, 0) / entries.length)
  const avgBacklinks = Math.round(entries.reduce((acc, e) => acc + e.backlinks, 0) / entries.length)

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="h-6 w-6 text-brand" /> SERP Analyzer &amp; Layout Inspector
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Live SERP</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-time top 100 organic search analysis, SERP feature detection, and content correlation factors
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              const csv = "Rank,Title,Domain,DR,Backlinks,WordCount\n" + entries.map(e => `${e.rank},"${e.title}","${e.domain}",${e.dr},${e.backlinks},${e.wordCount}`).join("\n")
              const blob = new Blob([csv], { type: "text/csv" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `serp_${query}.csv`
              a.click()
            }}
          >
            <Download className="h-3.5 w-3.5" /> Export SERP Data
          </Button>
        </div>
      </div>

      {/* Query Search Bar */}
      <Card className="p-4 border-border/80 shadow-xs bg-card">
        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search query (e.g. ai seo tools)..."
              className="pl-9 h-10 text-xs sm:text-sm bg-muted/30 border-border/60 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              aria-label="Target search location"
              className="h-10 px-3 rounded-md bg-muted/40 border border-border/60 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="United States">🇺🇸 United States (Google.com)</option>
              <option value="United Kingdom">🇬🇧 United Kingdom (Google.co.uk)</option>
              <option value="Canada">🇨🇦 Canada (Google.ca)</option>
              <option value="Australia">🇦🇺 Australia (Google.com.au)</option>
              <option value="Germany">🇩🇪 Germany (Google.de)</option>
            </select>

            <div className="flex rounded-md border border-border/60 p-1 bg-muted/30">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                aria-label="Desktop SERP view"
                className={`p-1.5 rounded ${device === "desktop" ? "bg-card shadow-xs text-brand" : "text-muted-foreground"}`}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                aria-label="Mobile SERP view"
                className={`p-1.5 rounded ${device === "mobile" ? "bg-card shadow-xs text-brand" : "text-muted-foreground"}`}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            <Button
              type="submit"
              disabled={isAnalyzing}
              className="h-10 px-4 text-xs font-semibold bg-brand hover:bg-brand/90 text-brand-foreground"
            >
              <Sparkles className={`h-3.5 w-3.5 mr-1.5 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Analyzing SERP..." : "Analyze SERP"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/80 p-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Average Page Length
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono-nums text-foreground">
              {avgWords.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">words in Top 5</span>
          </div>
        </Card>

        <Card className="border-border/80 p-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Average Domain Rating (DR)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono-nums text-foreground">
              {avgDr} / 100
            </span>
            <span className="text-xs text-emerald-500 font-semibold">High Authority SERP</span>
          </div>
        </Card>

        <Card className="border-border/80 p-4">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Average Referring Links
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono-nums text-foreground">
              {avgBacklinks.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">backlinks</span>
          </div>
        </Card>
      </div>

      {/* SERP Breakdown Table */}
      <Card className="border-border/80 overflow-hidden shadow-xs">
        <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-brand" /> SERP Results for "{query}"
          </CardTitle>
          <span className="text-xs text-muted-foreground font-mono">100% Crawl Confidence</span>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Title &amp; URL</th>
                <th className="py-3 px-3">DR</th>
                <th className="py-3 px-3">Backlinks</th>
                <th className="py-3 px-3">Words</th>
                <th className="py-3 px-3">Speed</th>
                <th className="py-3 px-4">Detected Features</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {entries.map((entry) => (
                <tr
                  key={entry.rank}
                  className={`hover:bg-muted/40 transition-colors ${
                    entry.isMyDomain ? "bg-brand/5 border-l-4 border-l-brand" : ""
                  }`}
                >
                  <td className="py-3 px-4 text-center font-bold font-mono text-sm">
                    {entry.rank}
                  </td>

                  <td className="py-3 px-4 max-w-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-foreground text-xs hover:text-brand transition-colors cursor-pointer">
                        {entry.title}
                      </span>
                      {entry.isMyDomain && (
                        <Badge variant="brand" className="text-[9px] px-1.5 py-0 font-bold">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono truncate mt-0.5">
                      <span>{entry.url}</span>
                      <ArrowUpRight className="h-3 w-3 shrink-0 opacity-60" />
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono font-semibold text-foreground">
                    {entry.dr}
                  </td>

                  <td className="py-3 px-3 font-mono text-muted-foreground">
                    {entry.backlinks.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 font-mono text-muted-foreground">
                    {entry.wordCount.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 font-mono text-emerald-500">
                    {entry.loadSpeedMs}ms
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {entry.features.map((feat) => (
                        <Badge
                          key={feat}
                          variant="outline"
                          className="text-[10px] border-brand/30 text-brand bg-brand/5"
                        >
                          {feat}
                        </Badge>
                      ))}
                    </div>
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
