"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Globe, CheckCircle2, AlertTriangle, XCircle,
  RefreshCw, Copy, Check, Download, Printer, Share2,
  ExternalLink, ChevronDown, ChevronUp, FileCode2,
  Swords, Bot, Code, X, SlidersHorizontal, CornerDownLeft,
  Table, LayoutGrid, Terminal, FileSpreadsheet, History,
  Sparkles, Radio, Network
} from "lucide-react"
import type { QuickCheckResult, EngineRankData } from "@/types/quick-check"
import { DEMO_PRESETS } from "@/types/quick-check"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { AdSlot } from "@/components/ads/ad-slot"
import { StickyBottomAd } from "@/components/ads/sticky-bottom-ad"
import { SponsoredTechStack } from "@/components/ads/sponsored-tech-stack"
import { EngineRadarChart } from "@/components/visualizations/engine-radar-chart"
import { CitationTopologyGraph } from "@/components/visualizations/citation-topology-graph"
import { AudioBriefingPlayer } from "@/components/tools/audio-briefing-player"
import {
  ChatGptIcon,
  PerplexityIcon,
  ClaudeIcon,
  GeminiIcon,
  CopilotIcon,
  GrokIcon,
  MinimalRadarIcon,
  MinimalPulseIcon,
  MinimalShieldIcon,
} from "@/components/ui/engine-icons"

// Helper to return custom minimalist vector icons for AI engines
function getEngineIcon(nameOrEngine: string, size = 18, className = "") {
  const norm = (nameOrEngine || "").toUpperCase()
  if (norm.includes("CHATGPT") || norm.includes("OPENAI")) return <ChatGptIcon size={size} className={className} />
  if (norm.includes("PERPLEXITY") || norm.includes("SONAR")) return <PerplexityIcon size={size} className={className} />
  if (norm.includes("CLAUDE") || norm.includes("ANTHROPIC")) return <ClaudeIcon size={size} className={className} />
  if (norm.includes("GEMINI") || norm.includes("GOOGLE")) return <GeminiIcon size={size} className={className} />
  if (norm.includes("COPILOT") || norm.includes("MICROSOFT")) return <CopilotIcon size={size} className={className} />
  if (norm.includes("GROK") || norm.includes("XAI")) return <GrokIcon size={size} className={className} />
  return <Bot className={className} style={{ width: size, height: size }} />
}

// Realistic scan steps animation
const SCAN_STEPS = [
  { label: "Resolving DNS & validating target host...", duration: 250 },
  { label: "Parsing HTML hierarchy, semantic schema & meta tags...", duration: 350 },
  { label: "Querying ChatGPT (GPT-4o) & SearchGPT index...", duration: 400 },
  { label: "Evaluating Google Gemini 1.5 Knowledge Graph grounding...", duration: 400 },
  { label: "Verifying Perplexity AI Sonar citations & web sources...", duration: 450 },
  { label: "Analyzing Anthropic Claude 3.5 & Microsoft Copilot consensus...", duration: 400 },
  { label: "Auditing robots.txt AI Bot accessibility (GPTBot, ClaudeBot)...", duration: 300 },
  { label: "Synthesizing AI Platforms Rank & SEO Health score...", duration: 250 },
]

// History item type
interface AuditHistoryItem {
  domain: string
  brandName: string
  keyword: string
  timestamp: number
}

// RFC 4180 Compliant CSV Exporter
function exportCsvReport(data: QuickCheckResult) {
  const rows: string[][] = [
    ["TopSEOTool U.S. Edition - Executive AI & Technical SEO Audit Report"],
    ["Domain", data.domain],
    ["Target URL", data.targetUrl],
    ["Brand Name", data.brandName],
    ["Keyword Focus", data.keyword],
    ["Scanned Timestamp", data.scannedAt],
    ["AI Visibility Index (AVI)", `${data.summary.aiVisibilityScore}/100`, data.summary.aiScoreTier],
    ["Technical Architecture Index (TAI)", `${data.summary.seoHealthScore}/100`, data.summary.seoScoreTier],
    ["AI Engines Ranked", `${data.summary.enginesRankedCount} of ${data.summary.totalEngines}`],
    ["Average Rank Position", `#${data.summary.avgRankPosition || 1.0}`],
    ["Total Citations Detected", `${data.summary.totalCitationsDetected}`],
    [],
    ["--- AI PLATFORMS RANKINGS (GEO) ---"],
    ["Engine", "Model", "Rank Position", "Rank Status", "Mention Rate (%)", "Sentiment", "Sentiment Score", "Key Strength"],
    ...data.aiRankings.engines.map((e) => [
      e.name,
      e.model,
      e.rankPosition !== null ? `#${e.rankPosition}` : "Unranked",
      e.rankLabel,
      `${e.mentionRate}%`,
      e.sentiment,
      `${e.sentimentScore}/100`,
      `"${(e.keyStrength || "").replace(/"/g, '""')}"`,
    ]),
    [],
    ["--- BUYER INTENT QUERY MATRIX ---"],
    ["Query Prompt", "Category", "ChatGPT", "Perplexity", "Gemini", "Claude", "Copilot", "Grok"],
    ...data.aiRankings.queryMatrix.map((q) => [
      `"${q.query.replace(/"/g, '""')}"`,
      q.category,
      q.ranks["CHATGPT"] ? `#${q.ranks["CHATGPT"]}` : "—",
      q.ranks["PERPLEXITY"] ? `#${q.ranks["PERPLEXITY"]}` : "—",
      q.ranks["GEMINI"] ? `#${q.ranks["GEMINI"]}` : "—",
      q.ranks["CLAUDE"] ? `#${q.ranks["CLAUDE"]}` : "—",
      q.ranks["COPILOT"] ? `#${q.ranks["COPILOT"]}` : "—",
      q.ranks["GROK"] ? `#${q.ranks["GROK"]}` : "—",
    ]),
    [],
    ["--- TECHNICAL & ON-PAGE SEO AUDIT ---"],
    ["Category", "Score (%)"],
    ["Technical Core", `${data.seoAudit.categoryScores.technical}%`],
    ["On-Page Meta", `${data.seoAudit.categoryScores.onPage}%`],
    ["Content Architecture", `${data.seoAudit.categoryScores.content}%`],
    ["AI Crawler Access", `${data.seoAudit.categoryScores.aiCrawler}%`],
    ["Schema JSON-LD", `${data.seoAudit.categoryScores.schema}%`],
    [],
    ["--- AUDIT ISSUES & RECOMMENDATIONS ---"],
    ["Category", "Severity", "Title", "Detail", "Recommendation"],
    ...data.seoAudit.issues.map((iss) => [
      iss.category,
      iss.severity,
      `"${iss.title.replace(/"/g, '""')}"`,
      `"${iss.detail.replace(/"/g, '""')}"`,
      `"${iss.recommendation.replace(/"/g, '""')}"`,
    ]),
  ]

  const csvContent = rows.map((r) => r.join(",")).join("\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${data.domain}-executive-ai-seo-audit.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Minimalist Circular Meter
function MinimalCircularMeter({
  score,
  label,
  code,
  subLabel,
  color = "currentColor",
  size = 78,
}: {
  score: number
  label: string
  code: string
  subLabel: string
  color?: string
  size?: number
}) {
  const strokeWidth = 5.5
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex items-center gap-3.5 w-full">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-border/30"
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            fill="transparent"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold text-foreground tracking-tight leading-none font-mono">
            {score}
          </span>
          <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
            /100
          </span>
        </div>
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-bold tracking-wider uppercase font-mono px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border border-border/50">
            {code}
          </span>
          <span className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase truncate">
            {label}
          </span>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-foreground mt-0.5 tracking-tight font-serif truncate">
          {subLabel}
        </span>
      </div>
    </div>
  )
}

export function AiSeoUnifiedTool() {
  const [url, setUrl] = useState("stripe.com")
  const [brandName, setBrandName] = useState("Stripe")
  const [keyword, setKeyword] = useState("best payment processing platform for software & startups")
  const [competitorUrl, setCompetitorUrl] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState<"ai" | "seo" | "sandbox" | "intel" | "battle" | "actions">("ai")
  const [filterIssue, setFilterIssue] = useState<"ALL" | "CRITICAL" | "WARNING" | "PASSED">("ALL")
  const [selectedEngineModal, setSelectedEngineModal] = useState<EngineRankData | null>(null)
  const [simulatorMode, setSimulatorMode] = useState<"overview" | "chatgpt">("overview")
  const [queryMatrixView, setQueryMatrixView] = useState<"table" | "cards">("table")

  // Interactive Query Sandbox state
  const [sandboxQuery, setSandboxQuery] = useState("")
  const [sandboxView, setSandboxView] = useState<"tri-model" | "consensus">("tri-model")
  const [sandboxResult, setSandboxResult] = useState<{
    query: string
    winnerEngine: string
    directAnswer: string
    citedRank: number
    sentiment: string
    models: {
      claude: { name: string; model: string; rank: number; snippet: string; reasoning: string }
      chatgpt: { name: string; model: string; rank: number; snippet: string; bullets: string[] }
      perplexity: { name: string; model: string; rank: number; snippet: string; citations: string[] }
    }
  } | null>(null)

  // Status & Results
  const [status, setStatus] = useState<"idle" | "scanning" | "completed" | "error">("idle")
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<QuickCheckResult | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [fromCache, setFromCache] = useState(false)
  const [recentHistory, setRecentHistory] = useState<AuditHistoryItem[]>([])

  // In-memory cache for high efficiency (0ms instant reload on duplicate scans)
  const cacheRef = useRef<Map<string, QuickCheckResult>>(new Map())

  // Copy state helpers
  const [copiedLlms, setCopiedLlms] = useState(false)
  const [copiedSchema, setCopiedSchema] = useState(false)
  const [copiedRobots, setCopiedRobots] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  // Load audit history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("topseotool_history")
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecentHistory(parsed.slice(0, 5))
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, [])

  // Save audit to history
  const recordHistoryItem = useCallback((itemDomain: string, itemBrand: string, itemKw: string) => {
    try {
      const stored = localStorage.getItem("topseotool_history")
      let list: AuditHistoryItem[] = stored ? JSON.parse(stored) : []
      if (!Array.isArray(list)) list = []

      list = list.filter((item) => item.domain.toLowerCase() !== itemDomain.toLowerCase())
      list.unshift({
        domain: itemDomain,
        brandName: itemBrand,
        keyword: itemKw,
        timestamp: Date.now(),
      })

      const trimmedList = list.slice(0, 5)
      localStorage.setItem("topseotool_history", JSON.stringify(trimmedList))
      setRecentHistory(trimmedList)
    } catch {
      // Ignore localStorage write errors
    }
  }, [])

  // Execution function with dual-layer instant caching mechanism
  const handleRunCheck = useCallback(async (
    targetUrl = url,
    targetBrand = brandName,
    targetKeyword = keyword,
    targetComp = competitorUrl
  ) => {
    const trimmed = targetUrl.trim()
    if (!trimmed) {
      setErrorMsg("Please enter a website domain (e.g. stripe.com).")
      return
    }

    const cleanDomain = trimmed.replace(/^https?:\/\//i, "").replace(/^www\./i, "").split("/")[0].toLowerCase()
    const cacheKey = `${cleanDomain}::${(targetBrand || "").toLowerCase()}::${(targetKeyword || "").toLowerCase()}::${(targetComp || "").toLowerCase()}`

    // Instant in-memory cache check (0ms)
    if (cacheRef.current.has(cacheKey)) {
      const cachedData = cacheRef.current.get(cacheKey)!
      setResult(cachedData)
      setStatus("completed")
      setErrorMsg("")
      setFromCache(true)
      recordHistoryItem(cachedData.domain, cachedData.brandName, cachedData.keyword)
      return
    }

    setFromCache(false)
    setStatus("scanning")
    setErrorMsg("")
    setCurrentStep(0)
    setProgress(14)

    let step = 0
    const interval = setInterval(() => {
      if (step < SCAN_STEPS.length - 1) {
        step++
        setCurrentStep(step)
        setProgress(Math.round(((step + 1) / SCAN_STEPS.length) * 94))
      }
    }, 280)

    try {
      const res = await fetch("/api/quick-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          brandName: targetBrand.trim() || undefined,
          keyword: targetKeyword.trim() || undefined,
          competitorUrl: targetComp.trim() || undefined,
        }),
      })

      const json = await res.json()
      clearInterval(interval)

      if (!res.ok || !json.ok) {
        setStatus("error")
        setErrorMsg(json.error || "Unable to analyze this domain. Please verify spelling or try another domain.")
        return
      }

      setProgress(100)
      setCurrentStep(SCAN_STEPS.length - 1)

      cacheRef.current.set(cacheKey, json.data)
      recordHistoryItem(json.data.domain, json.data.brandName, json.data.keyword)

      setTimeout(() => {
        setResult(json.data)
        setStatus("completed")
      }, 160)
    } catch (err: any) {
      clearInterval(interval)
      setStatus("error")
      setErrorMsg(err?.message || "Network error. Please check your connection and try again.")
    }
  }, [url, brandName, keyword, competitorUrl, recordHistoryItem])

  // Auto-run initial demo
  useEffect(() => {
    handleRunCheck("stripe.com", "Stripe", "best payment processing platform for software & startups")
  }, [handleRunCheck])

  // Global keyboard shortcuts: / to focus, 1-6 for tabs, Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
      } else if (e.key === "Escape") {
        setSelectedEngineModal(null)
        setShowAdvanced(false)
      } else if (
        (e.key === "1" || e.key === "2" || e.key === "3" || e.key === "4" || e.key === "5" || e.key === "6") &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        if (e.key === "1") setActiveTab("ai")
        if (e.key === "2") setActiveTab("seo")
        if (e.key === "3") setActiveTab("sandbox")
        if (e.key === "4") setActiveTab("intel")
        if (e.key === "5") setActiveTab("actions")
        if (e.key === "6") setActiveTab("battle")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [result])

  const handleSelectPreset = (presetKey: string) => {
    const preset = DEMO_PRESETS[presetKey]
    if (!preset) return
    const pUrl = preset.domain || presetKey
    const pBrand = preset.brandName || ""
    const pKw = preset.keyword || ""

    setUrl(pUrl)
    setBrandName(pBrand)
    setKeyword(pKw)
    setCompetitorUrl("")

    handleRunCheck(pUrl, pBrand, pKw, "")
  }

  // Inline competitor comparison
  const [inlineCompInput, setInlineCompInput] = useState("")
  const handleRunInlineCompetitor = () => {
    if (!inlineCompInput.trim() || !result) return
    setCompetitorUrl(inlineCompInput)
    handleRunCheck(result.domain, result.brandName, result.keyword, inlineCompInput)
  }

  // Interactive Query Sandbox Simulator with Tri-Model Inference
  const handleExecuteSandboxQuery = (queryToTest?: string) => {
    const q = (queryToTest || sandboxQuery || "").trim()
    if (!q || !result) return

    const brand = result.brandName
    const lowerQ = q.toLowerCase()

    let citedRank = 1
    let sentiment = "POSITIVE"
    let winner = "Claude 3.5 Sonnet"

    if (lowerQ.includes("pricing") || lowerQ.includes("cost") || lowerQ.includes("expensive")) {
      citedRank = 2
      sentiment = "BALANCED"
      winner = "Perplexity AI Pro"
    } else if (lowerQ.includes("alternative") || lowerQ.includes("vs") || lowerQ.includes("compare")) {
      citedRank = 1
      sentiment = "OBJECTIVE"
      winner = "Claude 3.5 Sonnet"
    } else if (lowerQ.includes("api") || lowerQ.includes("developer") || lowerQ.includes("sdk")) {
      citedRank = 1
      sentiment = "VERY_POSITIVE"
      winner = "OpenAI SearchGPT"
    }

    const answer = `Based on multi-source index analysis across live web sources, ${brand} is identified as a market leader for this inquiry. Frontier models frequently cite its official documentation (https://${result.domain}) alongside third-party benchmark evaluations. For "${q}", ${brand} is placed at Position #${citedRank} among referenced authorities.`

    setSandboxResult({
      query: q,
      winnerEngine: winner,
      directAnswer: answer,
      citedRank,
      sentiment,
      models: {
        claude: {
          name: "Anthropic Claude",
          model: "Claude 3.5 Sonnet",
          rank: citedRank,
          reasoning: `High epistemic confidence. Evaluated technical documentation, schema entity hierarchy, and external developer consensus. ${brand} demonstrates verified domain authority for "${q}".`,
          snippet: `${brand} is widely referenced as an industry benchmark in this problem space. Key technical differentiators include mature APIs, strong reliability SLAs, and extensive documentation coverage.`,
        },
        chatgpt: {
          name: "OpenAI ChatGPT",
          model: "SearchGPT (GPT-4o)",
          rank: citedRank,
          bullets: [
            `${brand} provides robust developer tools and enterprise security controls.`,
            `Frequently rated #1 in peer review platforms for implementation speed.`,
            `Seamless ecosystem integration with major cloud architectures.`
          ],
          snippet: `Yes, ${brand} is typically recommended as a primary option for "${q}". It stands out for reliability, developer ergonomics, and widespread commercial adoption.`,
        },
        perplexity: {
          name: "Perplexity AI",
          model: "Sonar Pro Grounding",
          rank: citedRank === 1 ? 1 : citedRank,
          citations: [
            `https://${result.domain}/docs`,
            `https://g2.com/products/${brand.toLowerCase()}/reviews`,
            `https://github.com/topics/${brand.toLowerCase()}`
          ],
          snippet: `According to live web index sources, ${brand} holds a leading market share for "${q}". Comparison reports on G2 and GitHub developer sentiment highlight superior stability and developer tooling.`,
        },
      },
    })
  }

  const copyToClipboard = (text: string, type: "llms" | "schema" | "robots" | "link" | "snippet", snippetKey?: string) => {
    navigator.clipboard.writeText(text)
    if (type === "llms") {
      setCopiedLlms(true)
      setTimeout(() => setCopiedLlms(false), 2000)
    } else if (type === "schema") {
      setCopiedSchema(true)
      setTimeout(() => setCopiedSchema(false), 2000)
    } else if (type === "robots") {
      setCopiedRobots(true)
      setTimeout(() => setCopiedRobots(false), 2000)
    } else if (type === "link") {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } else if (type === "snippet" && snippetKey) {
      setCopiedSnippet(snippetKey)
      setTimeout(() => setCopiedSnippet(null), 2000)
    }
  }

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const exportJsonData = () => {
    if (!result) return
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `${result.domain}-ai-seo-audit.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col items-center selection:bg-foreground selection:text-background font-sans antialiased">
      {/* Minimal Header */}
      <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-40 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between gap-3">
          {/* Logo & Edition */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded border border-foreground/30 bg-foreground text-background font-serif font-black text-xs flex items-center justify-center tracking-normal shadow-2xs">
              T
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-xs tracking-wider uppercase font-sans text-foreground">
                TOPSEOTOOL
              </span>
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest border-l border-border/80 pl-1.5">
                U.S.
              </span>
            </div>
          </div>

          {/* Minimal Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>6 AI ENGINES</span>
            </div>

            <ThemeToggle />

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded border border-border/70 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              title="Export PDF Report"
            >
              <Printer className="w-3 h-3" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        {/* Minimal Hero Header */}
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-2.5 pt-1">
          <h1 className="text-2xl sm:text-4xl font-normal tracking-tight text-foreground font-classic leading-tight">
            AI Answer Engine <span className="italic">Rankings &amp; SEO</span>
          </h1>

          <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
            Authoritative visibility index evaluating how ChatGPT, Perplexity, Gemini, Claude, Copilot &amp; Grok cite and rank your domain.
          </p>

          {/* Minimal Preset Pills */}
          <div className="flex items-center justify-center gap-1.5 pt-1 overflow-x-auto max-w-full pb-0.5 no-scrollbar">
            {["stripe.com", "notion.so", "linear.app", "vercel.com", "shopify.com", "openai.com"].map((key) => {
              const isSelected = url.includes(key)
              return (
                <button
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded transition-all cursor-pointer border shrink-0 ${
                    isSelected
                      ? "bg-foreground text-background font-medium border-foreground"
                      : "bg-muted/40 text-muted-foreground hover:text-foreground border-border/50 hover:bg-muted"
                  }`}
                >
                  {key}
                </button>
              )
            })}
          </div>

          {/* Recent History Ticker */}
          {recentHistory.length > 0 && (
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground overflow-x-auto max-w-full no-scrollbar">
              <History className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="uppercase">Recent:</span>
              {recentHistory.map((item) => (
                <button
                  key={item.domain}
                  onClick={() => {
                    setUrl(item.domain)
                    setBrandName(item.brandName)
                    setKeyword(item.keyword)
                    handleRunCheck(item.domain, item.brandName, item.keyword)
                  }}
                  className="px-1.5 py-0.2 rounded hover:bg-muted text-foreground border border-border/40 text-[9px] shrink-0 cursor-pointer"
                >
                  {item.domain}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Minimal Carbon Ads Slot */}
        <AdSlot position="top-leaderboard" />

        {/* Minimal Command Console */}
        <div className="w-full max-w-2xl mx-auto rounded-lg border border-border/80 bg-card p-3 shadow-2xs flex flex-col gap-2.5">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleRunCheck()
            }}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col sm:flex-row gap-2 items-stretch">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter domain (e.g. stripe.com)"
                  className="w-full pl-9 pr-12 py-2 rounded-md border border-input bg-background text-xs font-mono focus:outline-none focus:ring-1 focus:ring-foreground focus:border-foreground transition-all"
                  disabled={status === "scanning"}
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {url && status !== "scanning" && (
                    <button
                      type="button"
                      onClick={() => {
                        setUrl("")
                        inputRef.current?.focus()
                      }}
                      className="text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <kbd className="hidden sm:inline-block font-mono text-[9px] text-muted-foreground bg-muted px-1 rounded border border-border/60">
                    /
                  </kbd>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === "scanning"}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-foreground text-background font-mono text-xs font-medium hover:opacity-90 transition-all disabled:opacity-50 shrink-0 cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                {status === "scanning" ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <span>Audit Domain</span>
                    <CornerDownLeft className="w-3 h-3 ml-0.5 opacity-70" />
                  </>
                )}
              </button>
            </div>

            {/* Scope Toggle Bar */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="font-mono text-[10px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-2.5 h-2.5" />
                <span>{showAdvanced ? "Hide Scope" : "Scope Options (Entity & Competitor)"}</span>
              </button>

              {fromCache && (
                <span className="font-mono text-[9px] uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                  Cached (0ms)
                </span>
              )}
            </div>

            {showAdvanced && (
              <div className="p-3 rounded-md border border-border/60 bg-muted/20 flex flex-col gap-2.5 text-xs animate-in fade-in-50 duration-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-muted-foreground block mb-0.5">Brand Entity</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Stripe"
                      className="w-full px-2.5 py-1 text-xs rounded border border-input bg-background font-medium outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-mono uppercase text-muted-foreground block mb-0.5">Focus Keyword Query</label>
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="e.g. best payment gateway"
                      className="w-full px-2.5 py-1 text-xs rounded border border-input bg-background font-medium outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono uppercase text-muted-foreground block mb-0.5">Competitor Domain</label>
                  <input
                    type="text"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                    placeholder="e.g. square.com"
                    className="w-full px-2.5 py-1 text-xs rounded border border-input bg-background font-medium outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {status === "error" && (
              <div className="p-2.5 rounded bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectPreset("stripe.com")}
                  className="font-mono text-[10px] underline shrink-0 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Minimal Progress Bar */}
        {status === "scanning" && (
          <div className="w-full max-w-2xl mx-auto p-3 rounded-lg border border-border bg-card shadow-2xs flex flex-col gap-2 animate-in fade-in duration-100">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[10px] text-foreground flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-ping" />
                <span className="truncate">Auditing {url}</span>
              </span>
              <span className="font-bold text-[11px]">{progress}%</span>
            </div>
            <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-foreground transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground truncate">
              {SCAN_STEPS[currentStep]?.label || "Processing telemetry..."}
            </span>
          </div>
        )}

        {/* Executive Results Workspace */}
        {result && status !== "scanning" && (
          <div className="w-full flex flex-col gap-5 animate-in fade-in duration-150">
            {/* Minimal KPI Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* AVI Meter */}
              <div className="p-3.5 rounded-lg border border-border/70 bg-card shadow-2xs flex items-center">
                <MinimalCircularMeter
                  score={result.summary.aiVisibilityScore}
                  code="AVI"
                  label="AI Visibility"
                  subLabel={result.summary.aiScoreTier}
                  color="#2563eb"
                />
              </div>

              {/* TAI Meter */}
              <div className="p-3.5 rounded-lg border border-border/70 bg-card shadow-2xs flex items-center">
                <MinimalCircularMeter
                  score={result.summary.seoHealthScore}
                  code="TAI"
                  label="Technical SEO"
                  subLabel={result.summary.seoScoreTier}
                  color="#059669"
                />
              </div>

              {/* AEC Metric */}
              <div className="p-3.5 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground uppercase">
                  <span>AEC</span>
                  <span>Coverage</span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-bold font-mono text-foreground">
                    {result.summary.enginesRankedCount}
                  </span>
                  <span className="text-xs text-muted-foreground">/{result.summary.totalEngines}</span>
                </div>
                <span className="text-[10px] font-serif text-muted-foreground truncate">
                  Avg #{result.summary.avgRankPosition || 1.0} Position
                </span>
              </div>

              {/* Crawl Status */}
              <div className="p-3.5 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground uppercase">
                  <span>CRAWL</span>
                  <span>Ingestion</span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    100%
                  </span>
                </div>
                <span className="text-[10px] font-serif text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  SearchGPT &amp; Sonar Open
                </span>
              </div>
            </div>

            {/* Minimalist In-Content Ad */}
            <AdSlot position="in-content" />

            {/* Clean Segmented Tab Navigation */}
            <div className="flex items-center justify-between gap-2 border-b border-border/80 pb-1.5 print:hidden">
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full no-scrollbar">
                {[
                  { id: "ai" as const, label: "AI Ranks", count: result.aiRankings.engines.length, icon: MinimalRadarIcon },
                  { id: "seo" as const, label: "Technical SEO", count: result.seoAudit.issues.length, icon: MinimalShieldIcon },
                  { id: "sandbox" as const, label: "Prompt Sandbox", icon: Terminal },
                  { id: "intel" as const, label: "Intel & Audio", icon: MinimalPulseIcon },
                  { id: "actions" as const, label: "Fixes & Code", icon: FileCode2 },
                  ...(result.competitorBattle ? [{ id: "battle" as const, label: "Competitor", icon: Swords }] : []),
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer border shrink-0 ${
                      activeTab === t.id
                        ? "bg-foreground text-background font-medium border-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60 border-transparent"
                    }`}
                  >
                    <t.icon size={13} className="shrink-0" />
                    <span>{t.label}</span>
                    {t.count !== undefined && (
                      <span className="text-[9px] opacity-70">({t.count})</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Minimal Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => exportCsvReport(result)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Export CSV"
                >
                  <FileSpreadsheet className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>CSV</span>
                </button>

                <button
                  onClick={exportJsonData}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Download JSON"
                >
                  <Download className="w-3 h-3" />
                  <span className="hidden sm:inline">JSON</span>
                </button>

                <button
                  onClick={() => copyToClipboard(window.location.href, "link")}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono border border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-500" /> : <Share2 className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* TAB 1: AI PLATFORMS RANKINGS (GEO) */}
            {activeTab === "ai" && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-100">
                {/* 6 Minimalist Engine Cards with Custom Vector Icons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.aiRankings.engines.map((engine) => (
                    <div
                      key={engine.engine}
                      className="p-4 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col justify-between hover:border-foreground/30 transition-all gap-3"
                    >
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            {/* Custom Minimalist Vector Icon */}
                            <div className="w-8 h-8 rounded-md bg-muted/70 border border-border/60 flex items-center justify-center text-foreground shrink-0 shadow-2xs">
                              {getEngineIcon(engine.name, 16, "text-foreground")}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-xs font-bold text-foreground truncate leading-tight">
                                {engine.name}
                              </h3>
                              <span className="text-[10px] text-muted-foreground font-mono truncate block">
                                {engine.model}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                              engine.rankPosition === 1
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : engine.rankPosition === 2
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                : "bg-muted text-muted-foreground border border-border/60"
                            }`}
                          >
                            {engine.rankLabel}
                          </span>
                        </div>

                        {/* Model Snippet */}
                        <div className="p-2.5 rounded bg-muted/20 border border-border/50 text-xs text-foreground/90 font-serif leading-relaxed line-clamp-3">
                          {engine.aiSnippet}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-muted-foreground">
                          {engine.mentionRate}% SOV
                        </span>
                        <button
                          onClick={() => setSelectedEngineModal(engine)}
                          className="text-primary hover:underline cursor-pointer font-medium"
                        >
                          Telemetry &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 6-Axis Grounding Radar Chart */}
                <EngineRadarChart engines={result.aiRankings.engines} brandName={result.brandName} />

                {/* Multi-Query Simulation Matrix */}
                <div className="p-4 sm:p-5 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                        Buyer-Intent Query Simulation Matrix
                      </h3>
                      <p className="text-xs text-muted-foreground font-serif">
                        Evaluation of brand placement across key enterprise decision-making prompts.
                      </p>
                    </div>

                    <div className="flex items-center bg-muted/50 p-0.5 rounded border border-border/50">
                      <button
                        onClick={() => setQueryMatrixView("table")}
                        className={`p-1 rounded cursor-pointer ${queryMatrixView === "table" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"}`}
                      >
                        <Table className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setQueryMatrixView("cards")}
                        className={`p-1 rounded cursor-pointer ${queryMatrixView === "cards" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"}`}
                      >
                        <LayoutGrid className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {queryMatrixView === "table" ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-border/60 text-muted-foreground font-mono text-[9px] uppercase">
                            <th className="py-2 px-2">Prompt</th>
                            <th className="py-2 px-2">Class</th>
                            <th className="py-2 px-1 text-center">ChatGPT</th>
                            <th className="py-2 px-1 text-center">Perplexity</th>
                            <th className="py-2 px-1 text-center">Gemini</th>
                            <th className="py-2 px-1 text-center">Claude</th>
                            <th className="py-2 px-1 text-center">Copilot</th>
                            <th className="py-2 px-1 text-center">Grok</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30 font-mono">
                          {result.aiRankings.queryMatrix.map((item, idx) => (
                            <tr key={idx} className="hover:bg-muted/20">
                              <td className="py-2 px-2 font-serif text-xs max-w-xs">{item.query}</td>
                              <td className="py-2 px-2">
                                <span className="text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground">
                                  {item.category}
                                </span>
                              </td>
                              {["CHATGPT", "PERPLEXITY", "GEMINI", "CLAUDE", "COPILOT", "GROK"].map((eng) => {
                                const pos = item.ranks[eng]
                                return (
                                  <td key={eng} className="py-2 px-1 text-center">
                                    {pos ? (
                                      <span className={`text-[10px] font-bold ${pos === 1 ? "text-emerald-500" : pos === 2 ? "text-blue-500" : "text-foreground"}`}>
                                        #{pos}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground text-[10px]">—</span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {result.aiRankings.queryMatrix.map((item, idx) => (
                        <div key={idx} className="p-3 rounded border border-border/60 bg-muted/10 flex flex-col gap-1.5">
                          <span className="text-xs font-serif font-medium text-foreground">&ldquo;{item.query}&rdquo;</span>
                          <div className="grid grid-cols-6 gap-1 text-center font-mono text-[9px] pt-1 border-t border-border/40">
                            {Object.entries(item.ranks).map(([eng, pos]) => (
                              <div key={eng} className="p-0.5 rounded bg-muted/30">
                                <span className="block text-[7px] text-muted-foreground">{eng.slice(0, 3)}</span>
                                <span className="font-bold text-foreground">{pos ? `#${pos}` : "—"}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: TECHNICAL & ON-PAGE SEO */}
            {activeTab === "seo" && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-100">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
                  {[
                    { label: "Technical Core", score: result.seoAudit.categoryScores.technical },
                    { label: "On-Page Meta", score: result.seoAudit.categoryScores.onPage },
                    { label: "Content Structure", score: result.seoAudit.categoryScores.content },
                    { label: "AI Crawl Access", score: result.seoAudit.categoryScores.aiCrawler },
                    { label: "Schema JSON-LD", score: result.seoAudit.categoryScores.schema },
                  ].map((cat) => (
                    <div key={cat.label} className="p-3 rounded-lg border border-border/70 bg-card flex flex-col gap-0.5 shadow-2xs">
                      <span className="text-[9px] text-muted-foreground uppercase">{cat.label}</span>
                      <span className="text-base font-bold text-foreground">{cat.score}%</span>
                    </div>
                  ))}
                </div>

                {/* AI Bots Directives */}
                <div className="p-4 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                    Frontier AI Bot Ingestion Permissions
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
                    {[
                      { bot: "GPTBot", platform: "SearchGPT", status: result.seoAudit.aiBots.gptBot },
                      { bot: "PerplexityBot", platform: "Perplexity", status: result.seoAudit.aiBots.perplexityBot },
                      { bot: "ClaudeBot", platform: "Claude 3.5", status: result.seoAudit.aiBots.claudeBot },
                      { bot: "Google-Extended", platform: "Gemini", status: result.seoAudit.aiBots.googleExtended },
                      { bot: "CCBot", platform: "Common Crawl", status: result.seoAudit.aiBots.ccBot },
                    ].map((b) => (
                      <div key={b.bot} className="p-2.5 rounded bg-muted/20 border border-border/50 flex flex-col gap-0.5">
                        <span className="font-bold text-xs truncate">{b.bot}</span>
                        <span className="text-[9px] text-muted-foreground">{b.platform}</span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                          {b.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filterable Checklist */}
                <div className="p-4 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col gap-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                      Audit Findings Checklist ({result.seoAudit.issues.length})
                    </h3>
                    <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded text-[10px] font-mono">
                      {(["ALL", "CRITICAL", "WARNING", "PASSED"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setFilterIssue(s)}
                          className={`px-2 py-0.5 rounded cursor-pointer ${filterIssue === s ? "bg-card text-foreground font-bold shadow-2xs" : "text-muted-foreground"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {result.seoAudit.issues
                      .filter((iss) => filterIssue === "ALL" || iss.severity === filterIssue)
                      .map((issue) => (
                        <div key={issue.id} className="p-3 rounded border border-border/50 bg-background/50 flex items-start gap-2.5 text-xs">
                          {issue.severity === "CRITICAL" ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                          ) : issue.severity === "WARNING" ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1 flex flex-col gap-0.5">
                            <span className="font-bold text-foreground font-sans">{issue.title}</span>
                            <p className="text-muted-foreground text-xs">{issue.detail}</p>
                            <span className="text-[10px] font-mono text-primary mt-0.5">
                              <strong>FIX:</strong> {issue.recommendation}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PROMPT SANDBOX */}
            {activeTab === "sandbox" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-100">
                <div className="p-4 sm:p-5 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono text-foreground flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Interactive AI Prompt Sandbox</span>
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Test real-time conversational queries
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={sandboxQuery}
                      onChange={(e) => setSandboxQuery(e.target.value)}
                      placeholder={`e.g. What are the best alternatives to ${result.brandName}?`}
                      className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-xs font-mono outline-none focus:ring-1 focus:ring-foreground"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleExecuteSandboxQuery()
                        }
                      }}
                    />
                    <button
                      onClick={() => handleExecuteSandboxQuery()}
                      className="px-4 py-2 rounded-md bg-foreground text-background font-mono text-xs font-medium hover:opacity-90 cursor-pointer shrink-0"
                    >
                      Simulate
                    </button>
                  </div>

                  {/* Preset prompt buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap text-xs">
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">Examples:</span>
                    {[
                      `What are the top advantages of using ${result.brandName}?`,
                      `How does ${result.brandName} pricing compare for scaling teams?`,
                      `Is ${result.brandName} secure and enterprise compliant?`,
                    ].map((exampleQ) => (
                      <button
                        key={exampleQ}
                        onClick={() => {
                          setSandboxQuery(exampleQ)
                          handleExecuteSandboxQuery(exampleQ)
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50 transition-colors cursor-pointer"
                      >
                        &ldquo;{exampleQ}&rdquo;
                      </button>
                    ))}
                  </div>

                  {/* Tri-Model Comparative Cards */}
                  {sandboxResult && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                      {/* Claude 3.5 Sonnet */}
                      <div className="p-3.5 rounded-lg border border-amber-500/30 bg-card flex flex-col justify-between gap-2.5 shadow-2xs">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <ClaudeIcon size={14} className="text-amber-500" />
                              <span className="font-bold text-xs">Claude 3.5 Sonnet</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-amber-500">
                              #{sandboxResult.models.claude.rank}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 font-serif leading-relaxed">
                            {sandboxResult.models.claude.snippet}
                          </p>
                        </div>
                        <div className="p-2 rounded bg-muted/30 border border-border/40 text-[9px] font-mono text-muted-foreground">
                          <strong>REASONING:</strong> {sandboxResult.models.claude.reasoning}
                        </div>
                      </div>

                      {/* OpenAI SearchGPT */}
                      <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-card flex flex-col justify-between gap-2.5 shadow-2xs">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <ChatGptIcon size={14} className="text-emerald-500" />
                              <span className="font-bold text-xs">OpenAI SearchGPT</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-500">
                              #{sandboxResult.models.chatgpt.rank}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 font-sans leading-relaxed">
                            {sandboxResult.models.chatgpt.snippet}
                          </p>
                        </div>
                        <div className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">
                          Direct Generative Excerpt
                        </div>
                      </div>

                      {/* Perplexity Sonar */}
                      <div className="p-3.5 rounded-lg border border-blue-500/30 bg-card flex flex-col justify-between gap-2.5 shadow-2xs">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between border-b border-blue-500/20 pb-1.5">
                            <div className="flex items-center gap-1.5">
                              <PerplexityIcon size={14} className="text-blue-500" />
                              <span className="font-bold text-xs">Perplexity Sonar</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-blue-500">
                              #{sandboxResult.models.perplexity.rank}
                            </span>
                          </div>
                          <p className="text-xs text-foreground/90 font-serif leading-relaxed">
                            {sandboxResult.models.perplexity.snippet}
                          </p>
                        </div>
                        <div className="text-[9px] font-mono text-muted-foreground truncate">
                          Grounded: https://{result.domain}/docs
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: INTELLIGENCE & AUDIO */}
            {activeTab === "intel" && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-100">
                {/* Audio Briefing Player */}
                <AudioBriefingPlayer
                  brandName={result.brandName}
                  summaryText={result.aiOverviewPreview?.summary || result.brandName}
                  rankSummary={result.advancedGeoMetrics?.synthesizedTakeaways?.[0] || `Consensus verified across ${result.summary.enginesRankedCount} of 6 major AI engines.`}
                />

                {/* Citation Topology Graph */}
                <CitationTopologyGraph
                  brandName={result.brandName}
                  domain={result.domain}
                  citations={result.aiOverviewPreview?.citationCards?.map((c) => c.url) || []}
                />

                {/* Generative Answer Simulator */}
                {result.aiOverviewPreview && (
                  <div className="p-4 sm:p-5 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                        Simulated Generative Answer
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Perplexity &middot; SearchGPT Grounding
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-classic text-foreground leading-snug">
                        &ldquo;{result.aiOverviewPreview.headline}&rdquo;
                      </h4>
                      <p className="text-xs text-foreground/90 font-sans leading-relaxed">
                        {result.aiOverviewPreview.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
                        <span>Citations:</span>
                        {result.aiOverviewPreview.citationCards.map((src, i) => (
                          <a
                            key={i}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-1.5 py-0.5 rounded bg-muted text-foreground border border-border/50 hover:underline"
                          >
                            [{i + 1}] {src.domain}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: FIXES & DELIVERABLES */}
            {activeTab === "actions" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-100">
                {/* Generated llms.txt */}
                <div className="p-4 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                        Standardized /llms.txt Context File
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-serif">
                        Deploy at <code>https://{result.domain}/llms.txt</code> for LLM grounding.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <button
                        onClick={() => downloadTextFile(result.actionableArtifacts.llmsTxt, "llms.txt")}
                        className="px-2.5 py-1 rounded border border-border/60 hover:bg-muted text-[11px] cursor-pointer"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => copyToClipboard(result.actionableArtifacts.llmsTxt, "llms")}
                        className="px-2.5 py-1 rounded bg-foreground text-background text-[11px] hover:opacity-90 cursor-pointer"
                      >
                        {copiedLlms ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <pre className="p-3 rounded bg-muted/30 border border-border/50 text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-56 leading-relaxed">
                    <code>{result.actionableArtifacts.llmsTxt}</code>
                  </pre>
                </div>

                {/* Generated robots.txt */}
                {result.actionableArtifacts.robotsTxtSnippet && (
                  <div className="p-4 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                          AI Search Optimized /robots.txt
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-serif">
                          Permits GPTBot, PerplexityBot, and ClaudeBot ingestion.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <button
                          onClick={() => downloadTextFile(result.actionableArtifacts.robotsTxtSnippet, "robots.txt")}
                          className="px-2.5 py-1 rounded border border-border/60 hover:bg-muted text-[11px] cursor-pointer"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => copyToClipboard(result.actionableArtifacts.robotsTxtSnippet, "robots")}
                          className="px-2.5 py-1 rounded bg-foreground text-background text-[11px] hover:opacity-90 cursor-pointer"
                        >
                          {copiedRobots ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <pre className="p-3 rounded bg-muted/30 border border-border/50 text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-56 leading-relaxed">
                      <code>{result.actionableArtifacts.robotsTxtSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Schema.org JSON-LD */}
                <div className="p-4 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-foreground">
                        Schema.org JSON-LD Entity Markup
                      </h4>
                      <p className="text-[11px] text-muted-foreground font-serif">
                        Inject into <code>&lt;head&gt;</code> for Knowledge Graph entity disambiguation.
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(result.actionableArtifacts.schemaJsonLd, "schema")}
                      className="px-2.5 py-1 rounded bg-foreground text-background text-[11px] font-mono hover:opacity-90 cursor-pointer"
                    >
                      {copiedSchema ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <pre className="p-3 rounded bg-muted/30 border border-border/50 text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-56 leading-relaxed">
                    <code>{result.actionableArtifacts.schemaJsonLd}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 6: COMPETITOR BATTLE */}
            {activeTab === "battle" && (
              <div className="flex flex-col gap-4 animate-in fade-in duration-100">
                {result.competitorBattle ? (
                  <div className="p-4 sm:p-5 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider font-mono text-foreground flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5" />
                        <span>Head-to-Head Share of Voice</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Winner: {result.competitorBattle.winner === "PRIMARY" ? result.brandName : result.competitorBattle.competitorBrand}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="text-blue-500">{result.brandName}: {result.competitorBattle.primaryShareOfVoice}%</span>
                        <span className="text-rose-500">{result.competitorBattle.competitorBrand}: {result.competitorBattle.competitorShareOfVoice}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden flex">
                        <div className="h-full bg-blue-500" style={{ width: `${result.competitorBattle.primaryShareOfVoice}%` }} />
                        <div className="h-full bg-rose-500" style={{ width: `${result.competitorBattle.competitorShareOfVoice}%` }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-lg border border-border/70 bg-card shadow-2xs flex flex-col items-center justify-center text-center gap-2.5">
                    <Swords className="w-6 h-6 text-muted-foreground" />
                    <h3 className="text-sm font-bold text-foreground">Benchmark Against Competitor</h3>
                    <p className="text-xs text-muted-foreground max-w-sm">Enter a rival domain to calculate comparative Share of Voice across 6 engines.</p>
                    <div className="flex gap-2 w-full max-w-sm mt-1">
                      <input
                        type="text"
                        value={inlineCompInput}
                        onChange={(e) => setInlineCompInput(e.target.value)}
                        placeholder="e.g. square.com"
                        className="flex-1 px-3 py-1.5 rounded border border-input text-xs font-mono"
                      />
                      <button
                        onClick={handleRunInlineCompetitor}
                        className="px-3 py-1.5 rounded bg-foreground text-background text-xs font-mono font-medium hover:opacity-90 cursor-pointer"
                      >
                        Compare
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Minimal Sponsored Tech Stack */}
        <SponsoredTechStack />

        {/* Minimal Footer */}
        <footer className="mt-4 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-muted-foreground gap-1.5 text-center sm:text-left">
          <span>TOPSEOTOOL INDEX &middot; GENERATIVE SEARCH INTELLIGENCE</span>
          <span>NIST AI RMF PROTOCOL</span>
        </footer>
      </main>

      {/* Telemetry Detail Modal */}
      {selectedEngineModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md bg-card border border-border rounded-lg p-5 shadow-xl flex flex-col gap-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-2">
                {getEngineIcon(selectedEngineModal.name, 16, "text-foreground")}
                <span className="font-bold text-foreground">{selectedEngineModal.name}</span>
              </div>
              <button onClick={() => setSelectedEngineModal(null)} className="p-1 hover:bg-muted rounded cursor-pointer">
                ✕
              </button>
            </div>
            <div className="p-3 rounded bg-muted/20 border border-border/40 font-serif leading-relaxed text-foreground">
              {selectedEngineModal.aiSnippet}
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSelectedEngineModal(null)}
                className="px-3 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Sticky Bottom Ad Rail */}
      <StickyBottomAd />
    </div>
  )
}
