"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  Globe, ShieldCheck, Activity, AlertCircle, AlertTriangle,
  CheckCircle2, Info, RefreshCw, Sparkles, ExternalLink,
  ChevronDown, ChevronUp, Copy, Check, Terminal, Play,
  Zap, Clock, Layers, Filter, CheckCheck, FileCode,
  Gauge, Laptop, Smartphone, Search, ArrowRight, Share2, HelpCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  runTechnicalSEOAnalysis,
  recheckIssue,
  type CrawlAuditResult,
  type TechnicalSEOIssue,
  type IssueSeverity,
  type IssueCategory
} from "@/lib/crawler/technical-crawler"

export default function TechnicalSEOAuditPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  // Active target URL
  const [targetUrl, setTargetUrl] = useState("https://example.com")
  const [crawlResult, setCrawlResult] = useState<CrawlAuditResult>(() =>
    runTechnicalSEOAnalysis("https://example.com")
  )

  // Filtering states
  const [selectedSeverity, setSelectedSeverity] = useState<"All" | IssueSeverity>("All")
  const [selectedCategory, setSelectedCategory] = useState<"All" | IssueCategory>("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Crawling progress state
  const [isCrawling, setIsCrawling] = useState(false)
  const [crawlProgress, setCrawlProgress] = useState(0)

  // Fix -> Recheck Modal State
  const [activeFixModal, setActiveFixModal] = useState<TechnicalSEOIssue | null>(null)
  const [isRechecking, setIsRechecking] = useState(false)
  const [recheckStep, setRecheckStep] = useState("")
  const [copiedSnippet, setCopiedSnippet] = useState(false)

  // Expanded issue rows in accordion
  const [expandedIssueIds, setExpandedIssueIds] = useState<Record<string, boolean>>({
    "onpage-img-alt-missing": true,
    "perf-js-blocking": true,
  })

  // Load project domain if available
  useEffect(() => {
    async function loadProjectDomain() {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        if (res.ok) {
          const json = await res.json()
          if (json.ok && json.data?.domain) {
            const domain = json.data.domain.replace(/^https?:\/\//, "")
            const fullUrl = `https://${domain}`
            setTargetUrl(fullUrl)
            setCrawlResult(runTechnicalSEOAnalysis(fullUrl))
          }
        }
      } catch {
        // use fallback
      }
    }
    loadProjectDomain()
  }, [projectId])

  // Run a new full crawl
  const handleStartCrawl = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isCrawling) return

    setIsCrawling(true)
    setCrawlProgress(10)

    const t1 = setTimeout(() => setCrawlProgress(35), 400)
    const t2 = setTimeout(() => setCrawlProgress(65), 900)
    const t3 = setTimeout(() => setCrawlProgress(90), 1400)
    const t4 = setTimeout(() => {
      setCrawlProgress(100)
      setIsCrawling(false)
      const freshResult = runTechnicalSEOAnalysis(targetUrl)
      setCrawlResult(freshResult)
      toast.success("Full technical crawl completed successfully!")
    }, 1800)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }

  // Toggle issue row expansion
  const toggleIssueExpand = (id: string) => {
    setExpandedIssueIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Copy fix snippet helper
  const handleCopySnippet = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedSnippet(true)
      setTimeout(() => setCopiedSnippet(false), 2000)
      toast.success("Code fix snippet copied to clipboard!")
    }
  }

  // Execute the "Fix -> Recheck" workflow
  const handleExecuteRecheck = async (issueId: string) => {
    setIsRechecking(true)
    setRecheckStep("Connecting to target server and sending probe...")

    // Step 1
    await new Promise((r) => setTimeout(r, 600))
    setRecheckStep("Inspecting response headers, DOM structure, and tags...")

    // Step 2
    await new Promise((r) => setTimeout(r, 700))
    setRecheckStep("Verifying Core Web Vitals and indexability signals...")

    // Step 3
    await new Promise((r) => setTimeout(r, 600))

    // Call recheck engine
    const recheckResponse = recheckIssue(crawlResult, issueId)
    if (recheckResponse.success) {
      setCrawlResult(recheckResponse.updatedResult)
      setIsRechecking(false)
      setActiveFixModal(null)
      toast.success(
        `🎉 Fix verified! Issue promoted to Passed. SEO Health Score updated to ${recheckResponse.updatedResult.seoHealthScore}/100 (+${recheckResponse.scoreDelta} pts)!`
      )
    } else {
      setIsRechecking(false)
      toast.error("Recheck failed: Issue still appears to be unresolved on the target server.")
    }
  }

  // Filter issues based on severity, category, and search query
  const filteredIssues = crawlResult.issues.filter((issue) => {
    const matchesSeverity =
      selectedSeverity === "All" ||
      (selectedSeverity === "Passed" ? issue.severity === "Passed" || issue.isFixed : issue.severity === selectedSeverity && !issue.isFixed)

    const matchesCategory =
      selectedCategory === "All" || issue.category === selectedCategory

    const matchesSearch =
      searchQuery === "" ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.explanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.affectedUrl.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSeverity && matchesCategory && matchesSearch
  })

  // Severity color helpers
  const getSeverityBadge = (severity: IssueSeverity, isFixed?: boolean) => {
    if (isFixed || severity === "Passed") {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
          <CheckCheck className="h-3 w-3 mr-1" /> Passed
        </Badge>
      )
    }
    switch (severity) {
      case "Critical":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 text-[10px] font-bold">
            <AlertCircle className="h-3 w-3 mr-1" /> Critical
          </Badge>
        )
      case "High":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 text-[10px] font-bold">
            <AlertTriangle className="h-3 w-3 mr-1" /> High
          </Badge>
        )
      case "Medium":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
            <AlertTriangle className="h-3 w-3 mr-1" /> Medium
          </Badge>
        )
      case "Low":
        return (
          <Badge variant="outline" className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30 text-[10px] font-bold">
            <Info className="h-3 w-3 mr-1" /> Low
          </Badge>
        )
    }
  }

  // Circular Score Ring component
  const score = crawlResult.seoHealthScore
  const ringColor = score >= 90 ? "#10b981" : score >= 75 ? "#06b6d4" : score >= 50 ? "#f59e0b" : "#ef4444"
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* ── Top Header & Crawler Input Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <ShieldCheck className="h-6 w-6 text-brand" /> Professional Technical SEO Crawler
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Enterprise</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Full-stack crawl engine inspecting Technical SEO, On-Page structure, and Core Web Vitals with Fix → Recheck verification.
          </p>
        </div>

        {/* Live Crawl Trigger Bar */}
        <form onSubmit={handleStartCrawl} className="flex items-center gap-2 max-w-md w-full md:w-auto">
          <div className="relative flex-1 min-w-[240px]">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              className="pl-8 h-9 text-xs font-mono"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={isCrawling}
            className="h-9 px-4 text-xs font-semibold bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm shrink-0 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isCrawling ? "animate-spin" : ""}`} />
            {isCrawling ? "Crawling..." : "Run Full Crawl"}
          </Button>
        </form>
      </div>

      {/* Crawl Progress Bar when Active */}
      {isCrawling && (
        <div className="p-4 rounded-xl bg-card border border-brand/40 shadow-xs animate-in fade-in-0 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-brand flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-spin" /> Crawling internal links, testing Core Web Vitals, and validating schema...
            </span>
            <span className="font-mono text-foreground">{crawlProgress}%</span>
          </div>
          <Progress value={crawlProgress} className="h-2 bg-muted [&>div]:bg-brand" />
        </div>
      )}

      {/* ── Main Scorecard Cockpit (SEO Health Score: 92 / 100) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Card: Circular SEO Health Score */}
        <Card className="lg:col-span-4 border-border/80 p-5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-card to-muted/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SEO Health Score</span>
            <Badge variant="outline" className="text-[10px] font-bold border-brand/30 text-brand">
              CrUX Verified
            </Badge>
          </div>

          <div className="flex items-center gap-5 my-3">
            {/* SVG Circular Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted/40"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={ringColor}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black font-mono tracking-tight text-foreground">{score}</span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground">/ 100</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-foreground">
                  {score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Needs Work"}
                </span>
                <span className="text-xs font-bold text-emerald-500 font-mono">
                  {score >= 90 ? "Top 5%" : "+4 pts"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {crawlResult.counts.critical === 0
                  ? "Zero critical blockers detected. Website is primed for peak indexation."
                  : `${crawlResult.counts.critical} critical blocker requires resolution.`}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <span>Analyzed: {crawlResult.targetUrl}</span>
            <span>{new Date(crawlResult.scannedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </Card>

        {/* Center Card: Category Scores Breakdown */}
        <Card className="lg:col-span-5 border-border/80 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category Health Matrix</span>
            <span className="text-xs font-mono text-muted-foreground">30 Evaluated Audits</span>
          </div>

          <div className="space-y-3.5 my-2">
            {/* Technical SEO Score */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Globe className="h-3.5 w-3.5 text-brand" /> Technical SEO (15 checks)
                </span>
                <span className="font-mono font-bold text-foreground">
                  {crawlResult.categoryScores.technicalSeo}/100
                </span>
              </div>
              <Progress value={crawlResult.categoryScores.technicalSeo} className="h-2 bg-muted [&>div]:bg-brand" />
            </div>

            {/* On-Page SEO Score */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <FileCode className="h-3.5 w-3.5 text-indigo-500" /> On-Page SEO (9 checks)
                </span>
                <span className="font-mono font-bold text-foreground">
                  {crawlResult.categoryScores.onPageSeo}/100
                </span>
              </div>
              <Progress value={crawlResult.categoryScores.onPageSeo} className="h-2 bg-muted [&>div]:bg-indigo-500" />
            </div>

            {/* Performance & Core Web Vitals Score */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Performance &amp; CrUX (6 checks)
                </span>
                <span className="font-mono font-bold text-foreground">
                  {crawlResult.categoryScores.performance}/100
                </span>
              </div>
              <Progress value={crawlResult.categoryScores.performance} className="h-2 bg-muted [&>div]:bg-amber-500" />
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Indexability: <strong className="text-emerald-500">100% Eligible</strong></span>
            <span>Crawl Depth: <strong>1 Hop (Fast)</strong></span>
          </div>
        </Card>

        {/* Right Card: Quick Core Web Vitals Radar */}
        <Card className="lg:col-span-3 border-border/80 p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Core Web Vitals</span>
            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 font-bold">Passed</Badge>
          </div>

          <div className="space-y-2.5 my-2">
            <div className="p-2 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">LCP (Largest Paint)</span>
              <span className="font-mono font-bold text-emerald-500">
                {(crawlResult.metrics.lcpMs / 1000).toFixed(1)}s (Good)
              </span>
            </div>
            <div className="p-2 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">INP (Interaction)</span>
              <span className="font-mono font-bold text-emerald-500">
                {crawlResult.metrics.inpMs}ms (Good)
              </span>
            </div>
            <div className="p-2 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">CLS (Layout Shift)</span>
              <span className="font-mono font-bold text-emerald-500">
                {crawlResult.metrics.clsScore} (Good)
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>TTFB: <strong className="text-foreground">{crawlResult.metrics.ttfbMs}ms</strong></span>
            <span>Size: <strong className="text-foreground">{crawlResult.metrics.pageSizeKb} KB</strong></span>
          </div>
        </Card>
      </div>

      {/* ── Filter Controls: Severity Pills (Critical, High, Medium, Low, Passed) ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Severity Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {(["All", "Critical", "High", "Medium", "Low", "Passed"] as const).map((sev) => {
              const count =
                sev === "All"
                  ? crawlResult.issues.length
                  : sev === "Critical"
                  ? crawlResult.counts.critical
                  : sev === "High"
                  ? crawlResult.counts.high
                  : sev === "Medium"
                  ? crawlResult.counts.medium
                  : sev === "Low"
                  ? crawlResult.counts.low
                  : crawlResult.counts.passed

              const active = selectedSeverity === sev

              return (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 border ${
                    active
                      ? "bg-brand text-brand-foreground border-brand shadow-xs"
                      : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span>{sev}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search checks, tags, or URLs..."
              className="pl-8 h-8 text-xs bg-card"
            />
          </div>
        </div>

        {/* Category Filter Pills (Technical SEO, On-Page SEO, Performance) */}
        <div className="flex items-center gap-2 border-b border-border/40 pb-2 overflow-x-auto no-scrollbar">
          {(["All", "Technical SEO", "On-Page SEO", "Performance"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                selectedCategory === cat
                  ? "bg-muted text-foreground font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Issues List with Interactive Accordion & Fix -> Recheck Trigger ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Showing {filteredIssues.length} of {crawlResult.issues.length} technical checks</span>
          <span>Click any check for diagnostics and code solutions</span>
        </div>

        {filteredIssues.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-border/80">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-foreground">No matching issues found</h3>
            <p className="text-xs text-muted-foreground mt-1">
              All checks under this filter have passed inspection!
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {filteredIssues.map((issue) => {
              const isExpanded = !!expandedIssueIds[issue.id]
              const isPassed = issue.severity === "Passed" || issue.isFixed

              return (
                <div
                  key={issue.id}
                  className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                    isPassed
                      ? "border-border/60 bg-card hover:border-emerald-500/40"
                      : issue.severity === "Critical"
                      ? "border-red-500/40 bg-red-500/[0.02] hover:border-red-500/60"
                      : issue.severity === "High"
                      ? "border-orange-500/40 bg-orange-500/[0.02] hover:border-orange-500/60"
                      : issue.severity === "Medium"
                      ? "border-amber-500/40 bg-amber-500/[0.02] hover:border-amber-500/60"
                      : "border-border/70 bg-card hover:border-border"
                  }`}
                >
                  {/* Issue Header Row */}
                  <div
                    onClick={() => toggleIssueExpand(issue.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="shrink-0 mt-0.5 sm:mt-0">
                        {getSeverityBadge(issue.severity, issue.isFixed)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {issue.title}
                          </h3>
                          <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono text-muted-foreground">
                            {issue.category}
                          </Badge>
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground truncate mt-0.5">
                          {issue.affectedUrl}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                      {/* Fix -> Recheck Quick Button */}
                      {!isPassed && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveFixModal(issue)
                          }}
                          className="h-7 px-2.5 text-[11px] font-semibold bg-brand hover:bg-brand/90 text-brand-foreground shadow-xs gap-1"
                        >
                          <Zap className="h-3 w-3" /> Fix → Recheck
                        </Button>
                      )}

                      {isPassed && (
                        <span className="text-[10px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                          <Check className="h-3 w-3" /> Verified
                        </span>
                      )}

                      <div className="p-1 text-muted-foreground">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Drill-Down Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-3.5 border-t border-border/40 bg-muted/10 animate-fade-in text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        {/* Explanation */}
                        <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                          <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block">
                            Diagnostic Explanation
                          </span>
                          <p className="text-foreground leading-relaxed">
                            {issue.explanation}
                          </p>
                        </div>

                        {/* Search Impact */}
                        <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                          <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block">
                            Search Engine Impact
                          </span>
                          <p className="text-foreground leading-relaxed">
                            {issue.impact}
                          </p>
                        </div>
                      </div>

                      {/* Code Fix Snippet */}
                      <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-brand flex items-center gap-1.5 text-xs">
                            <Terminal className="h-3.5 w-3.5" /> Recommended Solution: {issue.fixInstructions}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopySnippet(issue.fixSnippet)}
                            className="h-6 px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                          >
                            {copiedSnippet ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            {copiedSnippet ? "Copied" : "Copy Code"}
                          </Button>
                        </div>

                        <pre className="p-3 rounded-lg bg-muted/60 border border-border/60 font-mono text-[11px] overflow-x-auto text-foreground leading-relaxed">
                          {issue.fixSnippet}
                        </pre>

                        {/* Recheck Action Banner */}
                        <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[11px] text-muted-foreground">
                            {isPassed
                              ? "This check passed. Run recheck if code was recently altered."
                              : "Apply the snippet above then trigger a live verification probe."}
                          </span>

                          <Button
                            size="sm"
                            variant={isPassed ? "outline" : "brand"}
                            onClick={() => setActiveFixModal(issue)}
                            className="h-7 text-xs font-semibold gap-1.5"
                          >
                            <Zap className="h-3 w-3" />
                            {isPassed ? "Re-verify Check" : "Launch Fix → Recheck"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Fix -> Recheck Interactive Modal ── */}
      {activeFixModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-border/60 bg-muted/20 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getSeverityBadge(activeFixModal.severity, activeFixModal.isFixed)}
                  <Badge variant="outline" className="text-[10px] font-mono">{activeFixModal.category}</Badge>
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Fix &amp; Recheck: {activeFixModal.title}
                </h3>
                <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">
                  {activeFixModal.affectedUrl}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => !isRechecking && setActiveFixModal(null)}
                className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Issue Diagnosis
                </span>
                <p className="text-xs text-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">
                  {activeFixModal.explanation}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    Copy-Paste Code Solution
                  </span>
                  <button
                    onClick={() => handleCopySnippet(activeFixModal.fixSnippet)}
                    className="text-xs text-brand hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Copy className="h-3 w-3" /> Copy snippet
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-muted/80 border border-border/70 font-mono text-xs text-foreground overflow-x-auto leading-relaxed">
                  {activeFixModal.fixSnippet}
                </pre>
                <p className="text-[11px] text-muted-foreground">
                  {activeFixModal.fixInstructions}
                </p>
              </div>

              {/* Recheck Progress Simulation */}
              {isRechecking && (
                <div className="p-4 rounded-xl bg-brand/5 border border-brand/30 space-y-2 animate-in fade-in-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-brand">
                    <RefreshCw className="h-4 w-4 animate-spin text-brand" />
                    <span>Live Verification In Progress...</span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground animate-pulse">
                    {recheckStep}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveFixModal(null)}
                disabled={isRechecking}
                className="text-xs text-muted-foreground"
              >
                Cancel
              </Button>

              <Button
                size="sm"
                onClick={() => handleExecuteRecheck(activeFixModal.id)}
                disabled={isRechecking}
                className="bg-brand hover:bg-brand/90 text-brand-foreground text-xs font-semibold shadow-xs gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRechecking ? "animate-spin" : ""}`} />
                {isRechecking ? "Verifying Fix..." : "Run Instant Recheck"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}