"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  Users2, Globe, Search, ArrowUpRight, ArrowDownRight, Minus, ArrowRight,
  TrendingUp, TrendingDown, Download, Filter, Sparkles, ExternalLink,
  Target, Layers, ShieldCheck, Link2, FileText, Check, Plus,
  AlertTriangle, CheckCircle2, Bookmark, BookmarkCheck, ArrowUpDown,
  BarChart3, RefreshCw, HelpCircle, Eye, EyeOff
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  analyzeCompetitorDomain,
  generateKeywordGapAnalysis,
  exportKeywordGapToCSV,
  type CompetitorIntelligenceResult,
  type KeywordGapAnalysisResult,
  type GapType,
  type KeywordGapItem
} from "@/lib/competitor/competitor-engine"

export default function CompetitorsIntelligencePage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  // Active View Mode: Single Competitor Deep-Dive OR Keyword Gap Tool
  const [activeView, setActiveView] = useState<"single_competitor" | "keyword_gap">("keyword_gap")

  // Single Competitor Input & State
  const [competitorDomainInput, setCompetitorDomainInput] = useState("semrush.com")
  const [analyzedCompetitor, setAnalyzedCompetitor] = useState<CompetitorIntelligenceResult>(() =>
    analyzeCompetitorDomain("semrush.com", "example.com")
  )
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Keyword Gap Inputs & State
  const [yourDomain, setYourDomain] = useState("example.com")
  const [compA, setCompA] = useState("semrush.com")
  const [compB, setCompB] = useState("ahrefs.com")
  const [compC, setCompC] = useState("seranking.com")

  const [gapAnalysis, setGapAnalysis] = useState<KeywordGapAnalysisResult>(() =>
    generateKeywordGapAnalysis("example.com", "semrush.com", "ahrefs.com", "seranking.com")
  )
  const [isComparingGaps, setIsComparingGaps] = useState(false)

  // Keyword Gap Filtering State
  const [selectedGapFilter, setSelectedGapFilter] = useState<"All" | GapType | "Highlighted">("Highlighted")
  const [gapSearchQuery, setGapSearchQuery] = useState("")

  // Saved / Tracked Keywords State
  const [trackedKeywords, setTrackedKeywords] = useState<Record<string, boolean>>({})

  // Load project domain on mount
  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        if (res.ok) {
          const json = await res.json()
          if (json.ok && json.data?.domain) {
            const domain = json.data.domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
            setYourDomain(domain)
            setGapAnalysis(generateKeywordGapAnalysis(domain, compA, compB, compC))
          }
        }
      } catch {}
    }
    loadProject()
  }, [projectId])

  // 1. Analyze Single Competitor Form Handler
  const handleAnalyzeCompetitor = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!competitorDomainInput.trim()) return

    setIsAnalyzing(true)
    setTimeout(() => {
      const data = analyzeCompetitorDomain(competitorDomainInput, yourDomain)
      setAnalyzedCompetitor(data)
      setIsAnalyzing(false)
      toast.success(`Loaded competitor intelligence for ${data.domain}`)
    }, 450)
  }

  // 2. Generate Keyword Gap Matrix Handler
  const handleRunKeywordGap = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsComparingGaps(true)
    setTimeout(() => {
      const data = generateKeywordGapAnalysis(yourDomain, compA, compB, compC)
      setGapAnalysis(data)
      setIsComparingGaps(false)
      toast.success("Keyword Gap matrix computed across all 4 domains!")
    }, 450)
  }

  // 3. Export Keyword Gap CSV
  const handleExportGapCSV = () => {
    const csvContent = exportKeywordGapToCSV(gapAnalysis)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `keyword-gap-${gapAnalysis.yourDomain}-vs-competitors.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Keyword Gap matrix exported to CSV!")
  }

  // 4. Quick Add to Rank Tracker
  const handleTrackKeyword = async (keyword: string, id: string) => {
    setTrackedKeywords((prev) => ({ ...prev, [id]: true }))
    await fetch("/api/keywords/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_to_rank_tracker",
        keywords: [{ keyword, volume: 18100 }],
        projectId,
      }),
    }).catch(() => {})
    toast.success(`"${keyword}" queued for daily SERP rank tracking!`)
  }

  // Filtered Keyword Gap items
  const filteredGapKeywords = useMemo(() => {
    return gapAnalysis.gapKeywords.filter((item) => {
      const matchesFilter =
        selectedGapFilter === "All"
          ? true
          : selectedGapFilter === "Highlighted"
          ? item.isHighlighted
          : item.gapType === selectedGapFilter

      const matchesSearch =
        gapSearchQuery === "" ||
        item.keyword.toLowerCase().includes(gapSearchQuery.toLowerCase())

      return matchesFilter && matchesSearch
    })
  }, [gapAnalysis, selectedGapFilter, gapSearchQuery])

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Users2 className="h-6 w-6 text-brand" /> Competitor Intelligence &amp; Keyword Gap
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Competitive Radar</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Deep domain benchmarking, traffic estimates, content gap discovery, and multi-domain keyword overlap comparison.
          </p>
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveView("keyword_gap")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === "keyword_gap"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Target className="h-3.5 w-3.5 text-brand" /> Keyword Gap Matrix
          </button>
          <button
            onClick={() => setActiveView("single_competitor")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeView === "single_competitor"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-indigo-500" /> Domain Deep-Dive
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODE 1: KEYWORD GAP MATRIX (YOUR WEBSITE VS A, B, C)
         ───────────────────────────────────────────────────────────── */}
      {activeView === "keyword_gap" && (
        <div className="space-y-6">
          {/* Multi-Domain Input Panel */}
          <Card className="border-border/80 shadow-xs p-5 bg-card">
            <form onSubmit={handleRunKeywordGap} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-brand" /> Multi-Domain Keyword Gap Comparison
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Compare your domain against up to 3 competitors to highlight keywords they rank for but you don&apos;t.
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  4 Domains
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Your Website */}
                <div className="p-3 rounded-xl bg-brand/5 border border-brand/30 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-brand block">
                    Your Website
                  </label>
                  <Input
                    value={yourDomain}
                    onChange={(e) => setYourDomain(e.target.value)}
                    placeholder="example.com"
                    className="h-8 text-xs font-mono font-bold bg-background text-foreground"
                  />
                </div>

                {/* Competitor A */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Competitor A
                  </label>
                  <Input
                    value={compA}
                    onChange={(e) => setCompA(e.target.value)}
                    placeholder="semrush.com"
                    className="h-8 text-xs font-mono bg-background text-foreground"
                  />
                </div>

                {/* Competitor B */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Competitor B
                  </label>
                  <Input
                    value={compB}
                    onChange={(e) => setCompB(e.target.value)}
                    placeholder="ahrefs.com"
                    className="h-8 text-xs font-mono bg-background text-foreground"
                  />
                </div>

                {/* Competitor C */}
                <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Competitor C
                  </label>
                  <Input
                    value={compC}
                    onChange={(e) => setCompC(e.target.value)}
                    placeholder="seranking.com"
                    className="h-8 text-xs font-mono bg-background text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">
                  Benchmark targets: <strong>Google US • Desktop</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleExportGapCSV}
                    className="h-8 text-xs font-medium gap-1.5"
                  >
                    <Download className="h-3 w-3" /> Export Gap CSV
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isComparingGaps}
                    className="h-8 text-xs font-semibold bg-brand hover:bg-brand/90 text-brand-foreground shadow-xs gap-1.5"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isComparingGaps ? "animate-spin" : ""}`} />
                    {isComparingGaps ? "Comparing..." : "Compare Keyword Gaps"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Highlight Indicator Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-foreground">
                  Missing Keyword Gap Opportunities Highlighted
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Showing high-intent search terms where <strong>Competitors A, B, or C rank in the Top 10</strong>, but <strong>{yourDomain} has zero search rankings</strong>.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setSelectedGapFilter("Highlighted")}
              className={`h-7 text-xs font-bold shrink-0 ${
                selectedGapFilter === "Highlighted"
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Show Highlighted Gaps Only ({gapAnalysis.counts.missing + gapAnalysis.counts.untapped})
            </Button>
          </div>

          {/* Gap Type Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                { id: "Highlighted", label: "Missing & Untapped (Highlighted)", count: gapAnalysis.counts.missing + gapAnalysis.counts.untapped, highlight: true },
                { id: "All", label: "All Keywords", count: gapAnalysis.totalKeywordsEvaluated },
                { id: "Missing", label: "Missing (All Rivals Rank)", count: gapAnalysis.counts.missing },
                { id: "Untapped", label: "Untapped", count: gapAnalysis.counts.untapped },
                { id: "Weak", label: "Weak (You Outranked)", count: gapAnalysis.counts.weak },
                { id: "Strong", label: "Strong (You Win)", count: gapAnalysis.counts.strong },
                { id: "Shared", label: "Shared (All Rank)", count: gapAnalysis.counts.shared },
              ].map((f) => {
                const active = selectedGapFilter === f.id
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedGapFilter(f.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                      active
                        ? f.highlight
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                          : "bg-brand text-brand-foreground border-brand shadow-xs"
                        : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                    }`}>
                      {f.count}
                    </span>
                  </button>
                )
              })}
            </div>

            <Input
              value={gapSearchQuery}
              onChange={(e) => setGapSearchQuery(e.target.value)}
              placeholder="Search gap keywords..."
              className="h-8 text-xs w-full sm:w-56 bg-card"
            />
          </div>

          {/* ── Multi-Domain Keyword Gap Table ── */}
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 font-bold">Keyword</th>
                    <th className="p-3.5 font-bold">Volume</th>
                    <th className="p-3.5 font-bold">KD %</th>
                    <th className="p-3.5 font-bold">CPC</th>
                    <th className="p-3.5 font-bold">Intent</th>
                    <th className="p-3.5 font-bold bg-brand/5 text-brand">
                      {yourDomain} (You)
                    </th>
                    <th className="p-3.5 font-bold">
                      {compA}
                    </th>
                    <th className="p-3.5 font-bold">
                      {compB}
                    </th>
                    <th className="p-3.5 font-bold">
                      {compC}
                    </th>
                    <th className="p-3.5 font-bold text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/40">
                  {filteredGapKeywords.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-muted-foreground">
                        No keywords found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredGapKeywords.map((item) => {
                      const isHighlightedGap = item.isHighlighted
                      const isTracked = !!trackedKeywords[item.id]

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            isHighlightedGap
                              ? "bg-amber-500/[0.04] hover:bg-amber-500/[0.08]"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          {/* Keyword Name */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              {isHighlightedGap && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Competitors rank, you don't" />
                              )}
                              <span className="font-bold text-foreground">
                                {item.keyword}
                              </span>
                            </div>
                            {isHighlightedGap && (
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                                ★ High-Value Missing Keyword
                              </span>
                            )}
                          </td>

                          {/* Volume */}
                          <td className="p-3.5 font-mono font-bold text-foreground">
                            {item.volume.toLocaleString()}
                          </td>

                          {/* KD */}
                          <td className="p-3.5 font-mono">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              item.kd <= 30 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                              item.kd <= 50 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                              "bg-red-500/10 text-red-600 dark:text-red-400"
                            }`}>
                              {item.kd}%
                            </span>
                          </td>

                          {/* CPC */}
                          <td className="p-3.5 font-mono text-muted-foreground">
                            ${item.cpc.toFixed(2)}
                          </td>

                          {/* Intent */}
                          <td className="p-3.5">
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">
                              {item.intent}
                            </Badge>
                          </td>

                          {/* Your Website Rank (Highlighted if missing!) */}
                          <td className="p-3.5 bg-brand/5">
                            {item.userRank !== null ? (
                              <span className="font-mono font-extrabold text-brand">
                                #{item.userRank}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 text-[10px] font-bold font-mono">
                                <Minus className="h-3 w-3" /> Not Ranking
                              </span>
                            )}
                          </td>

                          {/* Competitor A Rank */}
                          <td className="p-3.5 font-mono">
                            {item.compARank !== null ? (
                              <span className="font-bold text-foreground">
                                #{item.compARank}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>

                          {/* Competitor B Rank */}
                          <td className="p-3.5 font-mono">
                            {item.compBRank !== null ? (
                              <span className="font-bold text-foreground">
                                #{item.compBRank}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>

                          {/* Competitor C Rank */}
                          <td className="p-3.5 font-mono">
                            {item.compCRank !== null ? (
                              <span className="font-bold text-foreground">
                                #{item.compCRank}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="p-3.5 text-right">
                            <Button
                              size="sm"
                              variant={isTracked ? "outline" : "brand"}
                              onClick={() => handleTrackKeyword(item.keyword, item.id)}
                              className="h-7 text-[11px] font-semibold gap-1"
                            >
                              {isTracked ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-500" /> Tracking
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3" /> Track Keyword
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE 2: SINGLE COMPETITOR DOMAIN DEEP-DIVE (ALL 11 OUTPUTS)
         ───────────────────────────────────────────────────────────── */}
      {activeView === "single_competitor" && (
        <div className="space-y-6">
          {/* Domain Search Input Bar */}
          <Card className="border-border/80 shadow-xs p-5 bg-card">
            <form onSubmit={handleAnalyzeCompetitor} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={competitorDomainInput}
                  onChange={(e) => setCompetitorDomainInput(e.target.value)}
                  placeholder="Enter competitor domain (e.g. semrush.com, ahrefs.com, seranking.com)..."
                  className="pl-9 h-10 text-xs sm:text-sm font-mono font-semibold"
                />
              </div>

              <Button
                type="submit"
                disabled={isAnalyzing}
                className="h-10 px-5 text-xs font-semibold bg-brand hover:bg-brand/90 text-brand-foreground shadow-xs gap-1.5 shrink-0"
              >
                <Search className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`} />
                {isAnalyzing ? "Analyzing..." : "Analyze Domain"}
              </Button>
            </form>

            {/* Quick Rivals Switcher */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-3 flex-wrap">
              <span className="font-semibold text-[11px] uppercase tracking-wider">Common Rivals:</span>
              {["semrush.com", "ahrefs.com", "seranking.com", "moz.com", "ubersuggest.com"].map((dom) => (
                <button
                  key={dom}
                  type="button"
                  onClick={() => {
                    setCompetitorDomainInput(dom)
                    setAnalyzedCompetitor(analyzeCompetitorDomain(dom, yourDomain))
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                    analyzedCompetitor.domain === dom
                      ? "bg-brand/10 border-brand/40 text-brand font-semibold"
                      : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {dom}
                </button>
              ))}
            </div>
          </Card>

          {/* ── 11 Output Intelligence Cockpit ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Organic Keywords */}
            <Card className="border-border/80 p-5 bg-card shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Organic Keywords</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30 font-bold">
                    {analyzedCompetitor.keywordsMoMGrowth}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
                    {analyzedCompetitor.organicKeywordsCount.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Top 3: <strong className="text-foreground">{analyzedCompetitor.keywordsTop3.toLocaleString()}</strong> • Top 10: <strong className="text-foreground">{analyzedCompetitor.keywordsTop10.toLocaleString()}</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                <span>Total SERP footprints in database</span>
              </div>
            </Card>

            {/* 2. Estimated Traffic */}
            <Card className="border-border/80 p-5 bg-card shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Estimated Monthly Traffic</span>
                  <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30 font-bold">
                    {analyzedCompetitor.trafficMoMGrowth}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
                    {(analyzedCompetitor.estimatedMonthlyTraffic / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-xs text-muted-foreground">visits / mo</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Est. Traffic Value: <strong className="text-foreground">${(analyzedCompetitor.monthlyTrafficValueUsd / 1000000).toFixed(2)}M / mo</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                <span>Calculated via CTR curve by position</span>
              </div>
            </Card>

            {/* 7 & 8. Backlinks & Referring Domains */}
            <Card className="border-border/80 p-5 bg-card shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Backlinks &amp; Authority</span>
                  <Badge variant="outline" className="text-[10px] font-mono font-bold text-brand border-brand/30">
                    DR {analyzedCompetitor.domainRating}
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
                    {(analyzedCompetitor.backlinksCount / 1000000).toFixed(1)}M
                  </span>
                  <span className="text-xs text-muted-foreground">backlinks</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Referring Domains: <strong className="text-foreground">{analyzedCompetitor.referringDomainsCount.toLocaleString()}</strong> unique domains
                </p>
              </div>

              <div className="pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                <span>94% DoFollow equity ratio</span>
              </div>
            </Card>

            {/* 5. Keyword Gaps Overview */}
            <Card className="border-border/80 p-5 bg-card shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Keyword Gaps vs You</span>
                  <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30 font-bold">
                    {analyzedCompetitor.highValueGapsCount} Quick Wins
                  </Badge>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
                    {analyzedCompetitor.totalKeywordGapsCount.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">gap queries</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Keywords {analyzedCompetitor.domain} ranks for that {yourDomain} is missing
                </p>
              </div>

              <div className="pt-3 border-t border-border/50">
                <button
                  onClick={() => setActiveView("keyword_gap")}
                  className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                >
                  Launch Keyword Gap Matrix <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </Card>
          </div>

          {/* 10. Traffic Trend Chart (12 Months) */}
          <Card className="border-border/80 p-5 bg-card shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-brand" /> 12-Month Organic Traffic Trend
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Monthly organic search visit history for {analyzedCompetitor.domain}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-500">
                +11.8% Net Annual Growth
              </span>
            </div>

            <div className="flex items-end gap-2 h-28 pt-4">
              {analyzedCompetitor.trafficTrend.map((item) => {
                const max = Math.max(...analyzedCompetitor.trafficTrend.map((t) => t.traffic))
                const heightPct = Math.round((item.traffic / max) * 100)

                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full bg-muted rounded-t-sm overflow-hidden flex items-end h-full">
                      <div
                        className="w-full bg-brand/80 hover:bg-brand transition-all rounded-t-sm"
                        style={{ height: `${heightPct}%` }}
                        title={`${item.month}: ${(item.traffic / 1000).toLocaleString()}K visits`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{item.month}</span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* 3 & 4. Top Pages & Ranking Keywords Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card className="border-border/80 shadow-xs overflow-hidden">
              <CardHeader className="py-3.5 px-5 border-b border-border/60 bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Top Pages (Organic Traffic Share)</span>
                  <span className="text-xs font-mono text-muted-foreground font-normal">By Traffic</span>
                </CardTitle>
              </CardHeader>

              <div className="divide-y divide-border/40">
                {analyzedCompetitor.topPages.map((page) => (
                  <div key={page.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors text-xs">
                    <div className="min-w-0">
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-foreground hover:text-brand truncate block"
                      >
                        {page.path}
                      </a>
                      <span className="text-[11px] text-muted-foreground mt-0.5 block">
                        Top KW: &ldquo;{page.topKeyword}&rdquo; (Pos #{page.topKeywordPos})
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-foreground block">
                        {page.monthlyVisits.toLocaleString()} visits
                      </span>
                      <span className="text-[10px] text-emerald-500 font-semibold block">
                        {page.trafficSharePct}% share
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 11. Winning Keywords */}
            <Card className="border-border/80 shadow-xs overflow-hidden">
              <CardHeader className="py-3.5 px-5 border-b border-border/60 bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Winning Keywords (Top Rank Gainers &amp; #1s)</span>
                  <span className="text-xs font-mono text-emerald-500 font-semibold">+34 Positions</span>
                </CardTitle>
              </CardHeader>

              <div className="divide-y divide-border/40">
                {analyzedCompetitor.winningKeywords.map((kw) => (
                  <div key={kw.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors text-xs">
                    <div className="min-w-0">
                      <span className="font-bold text-foreground truncate block">
                        {kw.keyword}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono block">
                        Vol: {kw.volume.toLocaleString()} • KD: {kw.kd}% • CPC: ${kw.cpc.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-black font-mono text-emerald-500 block">
                          #{kw.position}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-500 font-semibold block">
                          {kw.positionChange === 999 ? "★ NEW #1" : `+${kw.positionChange} spots`}
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTrackKeyword(kw.keyword, kw.id)}
                        className="h-7 text-[10px] px-2 font-semibold"
                      >
                        Track
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* 6 & 9. Content Gaps & Top Rival Competitors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 6. Content Gaps */}
            <Card className="border-border/80 shadow-xs overflow-hidden">
              <CardHeader className="py-3.5 px-5 border-b border-border/60 bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Content Gaps (Missing Topic Clusters)</span>
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-500 font-bold">
                    High Opportunity
                  </Badge>
                </CardTitle>
              </CardHeader>

              <div className="divide-y divide-border/40">
                {analyzedCompetitor.contentGaps.map((cg) => (
                  <div key={cg.id} className="p-4 space-y-1.5 text-xs hover:bg-muted/20 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-foreground text-sm">{cg.topic}</h4>
                      <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-500 font-bold">
                        {cg.priority}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                      <span>Rival has: <strong className="text-foreground">{cg.competitorArticleCount} articles</strong></span>
                      <span>•</span>
                      <span>You have: <strong className="text-red-500">{cg.userArticleCount}</strong></span>
                      <span>•</span>
                      <span>Search Vol: {cg.totalSearchVolume.toLocaleString()}</span>
                    </div>

                    <p className="text-[11px] text-muted-foreground pt-1">
                      &rarr; {cg.recommendedAction}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 9. Top Competitors in SERPs */}
            <Card className="border-border/80 shadow-xs overflow-hidden">
              <CardHeader className="py-3.5 px-5 border-b border-border/60 bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Top Competing Domains in Search</span>
                  <span className="text-xs font-mono text-muted-foreground font-normal">SERP Overlap</span>
                </CardTitle>
              </CardHeader>

              <div className="divide-y divide-border/40">
                {analyzedCompetitor.topCompetitors.map((comp) => (
                  <div key={comp.domain} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-muted/20 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{comp.domain}</span>
                        <Badge variant="outline" className="text-[9px] font-mono">DR {comp.domainRating}</Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-0.5 block">
                        {comp.overlapKeywordsCount.toLocaleString()} shared keywords ({comp.commonKeywordsPct}% overlap)
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCompetitorDomainInput(comp.domain)
                        setAnalyzedCompetitor(analyzeCompetitorDomain(comp.domain, yourDomain))
                      }}
                      className="h-7 text-xs font-semibold text-brand hover:underline"
                    >
                      Inspect &rarr;
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}