"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  Search, Sparkles, TrendingUp, DollarSign, Target, Globe,
  ArrowUpRight, Download, Filter, Layers, HelpCircle,
  Check, Plus, BarChart3, ExternalLink, ShieldAlert,
  ChevronRight, Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface KeywordData {
  keyword: string
  volume: number
  kd: number
  cpc: number
  intent: "Informational" | "Commercial" | "Transactional" | "Navigational"
  trend: string
  globalVolume: number
}

const SEED_KEYWORDS: Record<string, KeywordData> = {
  "ai seo tools": {
    keyword: "ai seo tools",
    volume: 18100,
    kd: 48,
    cpc: 4.85,
    intent: "Commercial",
    trend: "+34% MoM",
    globalVolume: 49500
  },
  "best seo platform": {
    keyword: "best seo platform",
    volume: 12400,
    kd: 62,
    cpc: 8.20,
    intent: "Commercial",
    trend: "+12% MoM",
    globalVolume: 34000
  },
  "backlink checker": {
    keyword: "backlink checker",
    volume: 74000,
    kd: 89,
    cpc: 6.40,
    intent: "Transactional",
    trend: "+5% MoM",
    globalVolume: 210000
  },
  "aeo optimization": {
    keyword: "aeo optimization",
    volume: 8900,
    kd: 28,
    cpc: 3.15,
    intent: "Informational",
    trend: "+82% MoM",
    globalVolume: 22400
  }
}

export default function KeywordExplorerPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  const [searchQuery, setSearchQuery] = useState("ai seo tools")
  const [activeKeyword, setActiveKeyword] = useState<KeywordData>(SEED_KEYWORDS["ai seo tools"])
  const [selectedCountry, setSelectedCountry] = useState<"US" | "UK" | "CA" | "AU" | "WW">("US")
  const [activeTab, setActiveTab] = useState<"variations" | "questions" | "serp">("variations")
  const [isSearching, setIsSearching] = useState(false)
  const [copiedNotification, setCopiedNotification] = useState(false)

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setTimeout(() => {
      const q = searchQuery.toLowerCase().trim()
      const found = SEED_KEYWORDS[q] || {
        keyword: searchQuery,
        volume: Math.floor(Math.random() * 25000) + 1200,
        kd: Math.floor(Math.random() * 70) + 15,
        cpc: parseFloat((Math.random() * 7 + 1.2).toFixed(2)),
        intent: "Commercial",
        trend: "+18% MoM",
        globalVolume: Math.floor(Math.random() * 60000) + 4000
      }
      setActiveKeyword(found)
      setIsSearching(false)
    }, 450)
  }

  const getKDColor = (kd: number) => {
    if (kd <= 29) return { label: "Easy", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" }
    if (kd <= 49) return { label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" }
    if (kd <= 69) return { label: "Hard", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" }
    return { label: "Super Hard", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" }
  }

  const kdInfo = getKDColor(activeKeyword.kd)

  const VARIATIONS = [
    { term: `${activeKeyword.keyword} free`, volume: Math.round(activeKeyword.volume * 0.42), kd: Math.max(12, activeKeyword.kd - 15), cpc: 2.10, intent: "Informational" },
    { term: `best ${activeKeyword.keyword} 2026`, volume: Math.round(activeKeyword.volume * 0.35), kd: activeKeyword.kd, cpc: activeKeyword.cpc, intent: "Commercial" },
    { term: `${activeKeyword.keyword} enterprise`, volume: Math.round(activeKeyword.volume * 0.22), kd: Math.min(85, activeKeyword.kd + 8), cpc: (activeKeyword.cpc * 1.8).toFixed(2), intent: "Transactional" },
    { term: `${activeKeyword.keyword} vs competitors`, volume: Math.round(activeKeyword.volume * 0.18), kd: Math.max(20, activeKeyword.kd - 8), cpc: 3.40, intent: "Commercial" },
    { term: `open source ${activeKeyword.keyword}`, volume: Math.round(activeKeyword.volume * 0.14), kd: 22, cpc: 1.15, intent: "Informational" },
  ]

  const QUESTIONS = [
    { question: `What are the best ${activeKeyword.keyword}?`, volume: 2400, kd: 26, intent: "Informational" },
    { question: `How do ${activeKeyword.keyword} work with AI search engines?`, volume: 1800, kd: 19, intent: "Informational" },
    { question: `Are ${activeKeyword.keyword} worth the subscription cost?`, volume: 1200, kd: 31, intent: "Commercial" },
    { question: `How to choose an enterprise ${activeKeyword.keyword}?`, volume: 950, kd: 34, intent: "Commercial" },
  ]

  const SERP_RESULTS = [
    { pos: 1, title: "TOPSEOTOOL — All-in-One SEO & AEO Intelligence Platform", domain: "topseotool.net", url: "https://topseotool.net", dr: 84, backlinks: 1420, visits: "14.2K", feature: "AI Overview Cited" },
    { pos: 2, title: "10 Best AI SEO Tools in 2026 (Tested & Reviewed)", domain: "semrush.com", url: "https://semrush.com/blog/ai-seo-tools", dr: 92, backlinks: 4120, visits: "11.8K", feature: "Featured Snippet" },
    { pos: 3, title: "The Ultimate Guide to Modern AI SEO Software", domain: "ahrefs.com", url: "https://ahrefs.com/blog/ai-seo", dr: 90, backlinks: 3200, visits: "9.4K", feature: "People Also Ask" },
    { pos: 4, title: "AI Search Engine Optimization Platform Comparison", domain: "searchengineland.com", url: "https://searchengineland.com/ai-search-tools", dr: 88, backlinks: 890, visits: "6.1K", feature: null },
    { pos: 5, title: "Top 7 Generative Search Optimization Suites", domain: "hubspot.com", url: "https://hubspot.com/marketing/ai-seo", dr: 93, backlinks: 2450, visits: "5.3K", feature: null }
  ]

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Keyword,Volume,KD%,CPC,Intent", ...VARIATIONS.map(v => `"${v.term}",${v.volume},${v.kd},${v.cpc},"${v.intent}"`)].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `keywords_${activeKeyword.keyword.replace(/\s+/g, "_")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Search className="h-6 w-6 text-brand" /> Keyword Intelligence & Explorer
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Enterprise</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Global search volumes, Keyword Difficulty (KD%), search intent classification, and SERP competitive analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Search Bar & Country Selector */}
      <Card className="p-2 border-border/80 shadow-xs bg-card">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter target keyword, product, or phrase (e.g., ai seo tools)..."
              className="pl-9 h-11 text-sm bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-brand"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Country Selector */}
            <div className="flex items-center bg-muted/60 p-1 rounded-xl text-xs font-semibold">
              {(["US", "UK", "CA", "AU", "WW"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCountry(c)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all ${
                    selectedCountry === c
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {c === "WW" ? "Global" : c}
                </button>
              ))}
            </div>

            <Button
              type="submit"
              disabled={isSearching}
              className="h-11 px-5 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold text-xs shadow-md rounded-xl"
            >
              {isSearching ? <Sparkles className="h-4 w-4 animate-spin" /> : "Analyze Keyword"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Metrics Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Volume */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search Volume</span>
              <Globe className="h-4 w-4 text-brand" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono-nums text-foreground">
              {activeKeyword.volume.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-emerald-500 font-semibold">{activeKeyword.trend}</span>
              <span>Global: {activeKeyword.globalVolume.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Keyword Difficulty */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Keyword Difficulty</span>
              <Badge variant="outline" className={`text-[10px] font-bold ${kdInfo.color} ${kdInfo.bg} ${kdInfo.border}`}>
                {kdInfo.label}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono-nums text-foreground">{activeKeyword.kd}%</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${activeKeyword.kd <= 40 ? "bg-emerald-500" : activeKeyword.kd <= 65 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${activeKeyword.kd}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              {activeKeyword.kd <= 35 ? "Easy to rank with strong content" : "Requires ~12-25 authoritative backlinks"}
            </p>
          </CardContent>
        </Card>

        {/* Cost Per Click */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg. CPC & Value</span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono-nums text-foreground">
              ${activeKeyword.cpc.toFixed(2)}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Paid Density: 0.68</span>
              <span className="text-emerald-500 font-semibold">High Commercial Value</span>
            </div>
          </CardContent>
        </Card>

        {/* Search Intent */}
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Search Intent</span>
              <Target className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {activeKeyword.intent}
            </div>
            <p className="text-xs text-muted-foreground">
              Users are researching and comparing products or services before purchasing.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Variations, Questions, SERP Analysis */}
      <Card className="border-border/80 shadow-xs">
        <Tabs defaultValue="variations" className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
            <TabsList className="grid grid-cols-3 w-full sm:w-[420px]">
              <TabsTrigger value="variations" className="text-xs">Keyword Variations</TabsTrigger>
              <TabsTrigger value="questions" className="text-xs">Search Questions</TabsTrigger>
              <TabsTrigger value="serp" className="text-xs">Top 10 SERP</TabsTrigger>
            </TabsList>
            <div className="text-xs text-muted-foreground">
              Analyzed for target query: <span className="font-semibold text-foreground">"{activeKeyword.keyword}"</span>
            </div>
          </div>

          {/* Keyword Variations Tab */}
          <TabsContent value="variations" className="space-y-4 pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-y border-border/40">
                  <tr>
                    <th className="py-2.5 px-3">Keyword Phrase</th>
                    <th className="py-2.5 px-3">Search Volume</th>
                    <th className="py-2.5 px-3">KD%</th>
                    <th className="py-2.5 px-3">CPC (USD)</th>
                    <th className="py-2.5 px-3">Intent</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-medium">
                  {VARIATIONS.map((v) => (
                    <tr key={v.term} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2">
                        <span>{v.term}</span>
                        <button
                          onClick={() => { setSearchQuery(v.term); handleSearch(); }}
                          className="text-muted-foreground hover:text-brand"
                          title="Explore keyword"
                        >
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>
                      <td className="py-3 px-3 font-mono">{v.volume.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${v.kd <= 30 ? "bg-emerald-500/10 text-emerald-500" : v.kd <= 55 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"}`}>
                          {v.kd}%
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">${v.cpc}</td>
                      <td className="py-3 px-3">
                        <Badge variant="secondary" className="text-[10px] font-normal">{v.intent}</Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] text-brand hover:bg-brand/10">
                          <Plus className="h-3 w-3 mr-1" /> Add to Tracker
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Questions People Ask Tab */}
          <TabsContent value="questions" className="space-y-4 pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-y border-border/40">
                  <tr>
                    <th className="py-2.5 px-3">Question Query</th>
                    <th className="py-2.5 px-3">Monthly Volume</th>
                    <th className="py-2.5 px-3">KD%</th>
                    <th className="py-2.5 px-3">Intent</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-medium">
                  {QUESTIONS.map((q) => (
                    <tr key={q.question} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2">
                        <HelpCircle className="h-3.5 w-3.5 text-brand shrink-0" />
                        <span>{q.question}</span>
                      </td>
                      <td className="py-3 px-3 font-mono">{q.volume.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-500">
                          {q.kd}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="secondary" className="text-[10px] font-normal">{q.intent}</Badge>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button size="sm" variant="ghost" className="h-7 text-[11px] text-brand hover:bg-brand/10">
                          Create Content Brief
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Top 10 SERP Breakdown Tab */}
          <TabsContent value="serp" className="space-y-4 pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/30 border-y border-border/40">
                  <tr>
                    <th className="py-2.5 px-3 w-12">#</th>
                    <th className="py-2.5 px-3">Ranking Page & Domain</th>
                    <th className="py-2.5 px-3">Domain Rating</th>
                    <th className="py-2.5 px-3">Backlinks</th>
                    <th className="py-2.5 px-3">Est. Visits</th>
                    <th className="py-2.5 px-3">SERP Feature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-medium">
                  {SERP_RESULTS.map((r) => (
                    <tr key={r.pos} className={`hover:bg-muted/20 transition-colors ${r.domain === "topseotool.net" ? "bg-brand/5 font-bold" : ""}`}>
                      <td className="py-3 px-3 font-mono font-bold text-foreground">{r.pos}</td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <span>{r.title}</span>
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-mono">{r.domain}</span>
                      </td>
                      <td className="py-3 px-3 font-mono">{r.dr}</td>
                      <td className="py-3 px-3 font-mono">{r.backlinks.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono text-emerald-500">{r.visits}</td>
                      <td className="py-3 px-3">
                        {r.feature ? (
                          <Badge variant="outline" className="text-[10px] font-semibold border-brand/40 text-brand">
                            {r.feature}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Organic</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
