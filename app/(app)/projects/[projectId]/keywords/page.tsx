"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import {
  Search, Sparkles, TrendingUp, DollarSign, Target, Globe,
  ArrowUpRight, Download, Filter, Layers, HelpCircle,
  Check, Plus, BarChart3, ExternalLink, ShieldAlert,
  ChevronRight, Info, Bookmark, BookmarkCheck, ListPlus,
  Compass, Eye, ArrowUpDown, ChevronDown, CheckCheck,
  Zap, Building2, Monitor, ShoppingCart, BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEntitlements } from "@/hooks/use-entitlements"
import { UpgradePromptModal } from "@/components/billing/upgrade-prompt-modal"
import {
  generateKeywordResearch,
  exportKeywordsToCSV,
  type KeywordItem,
  type KeywordCluster,
  type KeywordIntent,
  type KeywordResearchOutput,
  type SERPFeatureType
} from "@/lib/keywords/keyword-engine"

const COUNTRIES = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
]

const LANGUAGES = [
  "English", "Spanish", "German", "French", "Italian", "Portuguese", "Japanese", "Dutch"
]

const SEARCH_ENGINES = [
  "Google", "Google Mobile", "Bing", "Yahoo", "DuckDuckGo"
]

export default function KeywordExplorerPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  // Inputs
  const [keywordInput, setKeywordInput] = useState("ai seo tools")
  const [selectedCountry, setSelectedCountry] = useState("United States")
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [selectedSearchEngine, setSelectedSearchEngine] = useState("Google")

  // Output Research State
  const [researchData, setResearchData] = useState<KeywordResearchOutput>(() =>
    generateKeywordResearch("ai seo tools", "United States", "English", "Google")
  )

  // Active View Tab
  const [activeTab, setActiveTab] = useState<"related" | "questions" | "longtail" | "clusters">("related")

  // Filters & Sorting
  const [filterIntent, setFilterIntent] = useState<"All" | KeywordIntent>("All")
  const [filterKd, setFilterKd] = useState<"All" | "Easy" | "Medium" | "Hard" | "Very Hard">("All")
  const [filterMinVolume, setFilterMinVolume] = useState<number>(0)
  const [sortBy, setSortBy] = useState<"volume_desc" | "volume_asc" | "kd_asc" | "kd_desc" | "cpc_desc" | "intent">("volume_desc")
  const [filterQuery, setFilterQuery] = useState("")

  // Selected Checkboxes
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<Record<string, boolean>>({})

  // Saved / Tracked in Memory
  const [savedKeywordIds, setSavedKeywordIds] = useState<Record<string, boolean>>({})
  const [rankTrackerKeywordIds, setRankTrackerKeywordIds] = useState<Record<string, boolean>>({})
  const [projectKeywordIds, setProjectKeywordIds] = useState<Record<string, boolean>>({})

  // Quotas & Entitlements
  const { limits, usage } = useEntitlements()
  const maxSearches = limits?.monthly_keyword_limit ?? 500
  const [searchesCount, setSearchesCount] = useState(usage?.metrics?.keywordSearches?.used ?? 42)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // Handle Search Submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!keywordInput.trim()) return

    if (searchesCount >= maxSearches && maxSearches < 999999) {
      toast.error(`Monthly keyword limit reached (${searchesCount}/${maxSearches}). Upgrade your plan to unlock more search volume requests.`)
      setUpgradeModalOpen(true)
      return
    }

    setIsSearching(true)
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keywordInput,
          country: selectedCountry,
          language: selectedLanguage,
          searchEngine: selectedSearchEngine,
          projectId,
        })
      })

      if (res.ok) {
        const json = await res.json()
        if (json.ok && json.data) {
          setResearchData(json.data)
          setSearchesCount(prev => prev + 1)
          toast.success(`Keyword analysis loaded for "${keywordInput}"`)
        }
      } else {
        // Fallback to local engine
        const localData = generateKeywordResearch(keywordInput, selectedCountry, selectedLanguage, selectedSearchEngine)
        setResearchData(localData)
        setSearchesCount(prev => prev + 1)
      }
    } catch {
      const localData = generateKeywordResearch(keywordInput, selectedCountry, selectedLanguage, selectedSearchEngine)
      setResearchData(localData)
      setSearchesCount(prev => prev + 1)
    } finally {
      setIsSearching(false)
      setSelectedKeywordIds({})
    }
  }

  // Quick Seed Click
  const handleQuickSeed = (kw: string) => {
    setKeywordInput(kw)
    const localData = generateKeywordResearch(kw, selectedCountry, selectedLanguage, selectedSearchEngine)
    setResearchData(localData)
    setSelectedKeywordIds({})
  }

  // Intent Badge Renderer
  const getIntentBadge = (intent: KeywordIntent) => {
    switch (intent) {
      case "Informational":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 text-[10px] font-bold">
            <BookOpen className="h-2.5 w-2.5 mr-1" /> Informational
          </Badge>
        )
      case "Commercial":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-bold">
            <Target className="h-2.5 w-2.5 mr-1" /> Commercial
          </Badge>
        )
      case "Transactional":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
            <ShoppingCart className="h-2.5 w-2.5 mr-1" /> Transactional
          </Badge>
        )
      case "Navigational":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-bold">
            <Compass className="h-2.5 w-2.5 mr-1" /> Navigational
          </Badge>
        )
    }
  }

  // KD Badge Renderer
  const getKdBadge = (kd: number, label: string) => {
    const color =
      kd <= 29
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
        : kd <= 49
        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
        : kd <= 69
        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30"
        : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"

    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-mono font-bold ${color}`}>
        <span>{kd}%</span>
        <span className="text-[10px] font-normal opacity-80">({label})</span>
      </span>
    )
  }

  // Active Keyword List based on Tab
  const activeKeywordList = useMemo(() => {
    switch (activeTab) {
      case "related":
        return researchData.relatedKeywords
      case "questions":
        return researchData.questions
      case "longtail":
        return researchData.longTailKeywords
      case "clusters":
        return []
    }
  }, [activeTab, researchData])

  // Filtered & Sorted Keywords
  const processedKeywords = useMemo(() => {
    return activeKeywordList
      .filter((k) => {
        const matchesIntent = filterIntent === "All" || k.intent === filterIntent
        const matchesKd = filterKd === "All" || k.kdLabel === filterKd
        const matchesVol = k.volume >= filterMinVolume
        const matchesQuery = filterQuery === "" || k.keyword.toLowerCase().includes(filterQuery.toLowerCase())
        return matchesIntent && matchesKd && matchesVol && matchesQuery
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "volume_desc":
            return b.volume - a.volume
          case "volume_asc":
            return a.volume - b.volume
          case "kd_asc":
            return a.kd - b.kd
          case "kd_desc":
            return b.kd - a.kd
          case "cpc_desc":
            return b.cpc - a.cpc
          case "intent":
            return a.intent.localeCompare(b.intent)
          default:
            return 0
        }
      })
  }, [activeKeywordList, filterIntent, filterKd, filterMinVolume, filterQuery, sortBy])

  // Multi-select Toggles
  const allSelected = processedKeywords.length > 0 && processedKeywords.every((k) => selectedKeywordIds[k.id])
  const selectedCount = Object.values(selectedKeywordIds).filter(Boolean).length

  const handleToggleAll = () => {
    if (allSelected) {
      setSelectedKeywordIds({})
    } else {
      const next: Record<string, boolean> = {}
      processedKeywords.forEach((k) => (next[k.id] = true))
      setSelectedKeywordIds(next)
    }
  }

  const handleToggleOne = (id: string) => {
    setSelectedKeywordIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Selected Keyword Objects
  const getSelectedItems = () => {
    const list = activeTab === "clusters" ? [researchData.primaryKeyword] : processedKeywords
    const selected = list.filter((k) => selectedKeywordIds[k.id])
    return selected.length > 0 ? selected : [researchData.primaryKeyword]
  }

  // 1. CSV Export
  const handleExportCSV = () => {
    const itemsToExport = getSelectedItems()
    const csvContent = exportKeywordsToCSV(itemsToExport)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `keywords-${researchData.query.replace(/\s+/g, "_")}-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${itemsToExport.length} keywords to CSV!`)
  }

  // 2. Save Keywords
  const handleSaveKeywords = async (items?: KeywordItem[]) => {
    const targetItems = items || getSelectedItems()
    const nextSaved = { ...savedKeywordIds }
    targetItems.forEach((k) => (nextSaved[k.id] = true))
    setSavedKeywordIds(nextSaved)

    await fetch("/api/keywords/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save", keywords: targetItems, projectId }),
    }).catch(() => {})

    toast.success(`Saved ${targetItems.length} keyword${targetItems.length > 1 ? "s" : ""} to workspace list!`)
  }

  // 3. Add to Project
  const handleAddToProject = async (items?: KeywordItem[]) => {
    const targetItems = items || getSelectedItems()
    const nextProj = { ...projectKeywordIds }
    targetItems.forEach((k) => (nextProj[k.id] = true))
    setProjectKeywordIds(nextProj)

    await fetch("/api/keywords/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_to_project", keywords: targetItems, projectId }),
    }).catch(() => {})

    toast.success(`Added ${targetItems.length} keyword${targetItems.length > 1 ? "s" : ""} to project tracking!`)
  }

  // 4. Add to Rank Tracker
  const handleAddToRankTracker = async (items?: KeywordItem[]) => {
    const targetItems = items || getSelectedItems()
    const nextTracker = { ...rankTrackerKeywordIds }
    targetItems.forEach((k) => (nextTracker[k.id] = true))
    setRankTrackerKeywordIds(nextTracker)

    await fetch("/api/keywords/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_to_rank_tracker", keywords: targetItems, projectId }),
    }).catch(() => {})

    toast.success(`Queued ${targetItems.length} keyword${targetItems.length > 1 ? "s" : ""} in Daily Rank Tracker!`)
  }

  const pk = researchData.primaryKeyword

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Search className="h-6 w-6 text-brand" /> Enterprise Keyword Research Module
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Intelligence</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Search volume, keyword difficulty, CPC, competition index, search intent, and semantic clustering across global search engines.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 text-xs font-medium border-border/80 hover:bg-accent gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" /> Export CSV
          </Button>

          <Button
            variant="brand"
            size="sm"
            onClick={() => handleAddToRankTracker()}
            className="h-8 text-xs font-semibold gap-1.5 shadow-xs"
          >
            <TrendingUp className="h-3.5 w-3.5" /> Add to Rank Tracker
          </Button>
        </div>
      </div>

      {/* ── Input Bar: Keyword, Country, Language, Search Engine ── */}
      <Card className="border-border/80 shadow-xs p-4 sm:p-5 bg-card">
        <form onSubmit={handleSearch} className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* 1. Keyword Input */}
            <div className="md:col-span-5 relative">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Target Keyword or Topic
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="e.g. ai seo tools, ecommerce rank tracking..."
                  className="pl-9 h-10 text-xs sm:text-sm font-semibold text-foreground bg-muted/20"
                />
              </div>
            </div>

            {/* 2. Country */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-muted/20 border border-border/70 text-xs font-medium text-foreground focus:outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Language */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-muted/20 border border-border/70 text-xs font-medium text-foreground focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Search Engine */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                Search Engine
              </label>
              <select
                value={selectedSearchEngine}
                onChange={(e) => setSelectedSearchEngine(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-muted/20 border border-border/70 text-xs font-medium text-foreground focus:outline-none"
              >
                {SEARCH_ENGINES.map((se) => (
                  <option key={se} value={se}>
                    {se}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-1 flex items-end">
              <Button
                type="submit"
                disabled={isSearching}
                className="w-full h-10 text-xs font-semibold bg-brand hover:bg-brand/90 text-brand-foreground shadow-xs gap-1"
              >
                <Sparkles className={`h-3.5 w-3.5 ${isSearching ? "animate-spin" : ""}`} />
                {isSearching ? "Analyzing..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Quick Seed Suggestions */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1 flex-wrap">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Trending:</span>
            {["ai seo tools", "best seo platform", "technical seo audit", "backlink checker", "aeo optimization"].map((seed) => (
              <button
                key={seed}
                type="button"
                onClick={() => handleQuickSeed(seed)}
                className={`text-[11px] px-2 py-0.5 rounded-md border transition-all ${
                  researchData.query === seed
                    ? "bg-brand/10 border-brand/40 text-brand font-semibold"
                    : "bg-muted/40 border-border/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {seed}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {/* ── Primary Keyword Output Cockpit (Volume, KD, CPC, Competition, Intent, Trend, SERP Features) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Search Volume & 12-Month Trend */}
        <Card className="border-border/80 p-5 flex flex-col justify-between bg-card shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Search Volume</span>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500 font-bold">
                {pk.trendChangeMoM}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
                {pk.volume.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">/mo ({selectedCountry})</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Global Volume: <strong className="text-foreground font-mono">{pk.globalVolume.toLocaleString()}</strong> searches
            </p>
          </div>

          {/* Mini 12-Month Trend Bars */}
          <div className="pt-3 border-t border-border/50">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1.5">12-Month Trend</span>
            <div className="flex items-end gap-1 h-8">
              {pk.trend.map((val, idx) => (
                <div key={idx} className="flex-1 bg-muted rounded-t-xs overflow-hidden h-full flex items-end">
                  <div
                    className="w-full bg-brand transition-all duration-500 hover:bg-indigo-500"
                    style={{ height: `${val}%` }}
                    title={`Month ${idx + 1}: ${val}%`}
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Card 2: Keyword Difficulty (KD %) */}
        <Card className="border-border/80 p-5 flex flex-col justify-between bg-card shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Keyword Difficulty</span>
              {getKdBadge(pk.kd, pk.kdLabel)}
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
                {pk.kd}%
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {pk.kd <= 29
                ? "Low competitive barrier. High chance to rank in top 10 with on-page optimization."
                : pk.kd <= 49
                ? "Moderate competition. Requires high-quality content and ~5-10 referring domains."
                : "High authority barrier. Requires dedicated link building and high domain authority."}
            </p>
          </div>

          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Estimated Ref Domains: <strong>{Math.round(pk.kd * 0.45)} sites</strong></span>
            <span>Organic CTR: <strong>68%</strong></span>
          </div>
        </Card>

        {/* Card 3: CPC & Advertising Competition */}
        <Card className="border-border/80 p-5 flex flex-col justify-between bg-card shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cost Per Click (CPC)</span>
              <Badge variant="outline" className="text-[10px] font-mono font-bold">
                {pk.competition} Comp
              </Badge>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
                ${pk.cpc.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">USD per click</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Google Ads Competition Score: <strong className="text-foreground font-mono">{pk.competitionScore}</strong> (0.00 - 1.00 scale)
            </p>
          </div>

          <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Bid Range: <strong>${(pk.cpc * 0.7).toFixed(2)} - ${(pk.cpc * 1.5).toFixed(2)}</strong></span>
            <span>Commercial Value: <strong>High</strong></span>
          </div>
        </Card>

        {/* Card 4: Search Intent & SERP Features */}
        <Card className="border-border/80 p-5 flex flex-col justify-between bg-card shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search Intent</span>
              {getIntentBadge(pk.intent)}
            </div>
            <div className="my-2">
              <h3 className="text-base font-bold text-foreground">
                {pk.intent === "Commercial" ? "Commercial Investigation" : pk.intent === "Transactional" ? "High-Intent Purchase" : "Information Seeking"}
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                {pk.intent === "Commercial"
                  ? "Searchers are comparing platforms, reviews, and feature suites before subscribing."
                  : pk.intent === "Transactional"
                  ? "Searchers have high buying intent and are ready to signup or purchase."
                  : "Searchers are researching questions, definitions, and tutorials."}
              </p>
            </div>
          </div>

          {/* SERP Features Badges */}
          <div className="pt-3 border-t border-border/50">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block mb-1.5">Detected SERP Features</span>
            <div className="flex flex-wrap gap-1">
              {pk.serpFeatures.map((feat) => (
                <Badge key={feat} variant="secondary" className="text-[9px] py-0 px-1.5 font-medium">
                  {feat}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Tabs & View Modes: Related, Questions, Long-tail, Clusters ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-2">
          {/* Main 4 Tabs */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("related")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                activeTab === "related"
                  ? "bg-brand text-brand-foreground border-brand shadow-xs"
                  : "bg-card border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Related Keywords</span>
              <Badge variant={activeTab === "related" ? "secondary" : "outline"} className="text-[10px] py-0 px-1 font-mono">
                {researchData.relatedKeywords.length}
              </Badge>
            </button>

            <button
              onClick={() => setActiveTab("questions")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                activeTab === "questions"
                  ? "bg-brand text-brand-foreground border-brand shadow-xs"
                  : "bg-card border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Questions</span>
              <Badge variant={activeTab === "questions" ? "secondary" : "outline"} className="text-[10px] py-0 px-1 font-mono">
                {researchData.questions.length}
              </Badge>
            </button>

            <button
              onClick={() => setActiveTab("longtail")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                activeTab === "longtail"
                  ? "bg-brand text-brand-foreground border-brand shadow-xs"
                  : "bg-card border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Long-Tail Keywords</span>
              <Badge variant={activeTab === "longtail" ? "secondary" : "outline"} className="text-[10px] py-0 px-1 font-mono">
                {researchData.longTailKeywords.length}
              </Badge>
            </button>

            <button
              onClick={() => setActiveTab("clusters")}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                activeTab === "clusters"
                  ? "bg-brand text-brand-foreground border-brand shadow-xs"
                  : "bg-card border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Keyword Clusters</span>
              <Badge variant={activeTab === "clusters" ? "secondary" : "outline"} className="text-[10px] py-0 px-1 font-mono">
                {researchData.clusters.length}
              </Badge>
            </button>
          </div>

          {/* Batch Actions Bar (when items selected) */}
          {selectedCount > 0 && (
            <div className="flex items-center gap-2 p-1 bg-brand/10 border border-brand/30 rounded-xl px-3 text-xs text-brand font-semibold animate-in fade-in-0">
              <span>{selectedCount} selected</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSaveKeywords()}
                className="h-6 text-[11px] text-brand hover:bg-brand/20 px-2"
              >
                <Bookmark className="h-3 w-3 mr-1" /> Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddToProject()}
                className="h-6 text-[11px] text-brand hover:bg-brand/20 px-2"
              >
                <ListPlus className="h-3 w-3 mr-1" /> Add to Project
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddToRankTracker()}
                className="h-6 text-[11px] text-brand hover:bg-brand/20 px-2"
              >
                <TrendingUp className="h-3 w-3 mr-1" /> Add to Tracker
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportCSV}
                className="h-6 text-[11px] text-brand hover:bg-brand/20 px-2"
              >
                <Download className="h-3 w-3 mr-1" /> CSV
              </Button>
            </div>
          )}
        </div>

        {/* ── Table Filter and Sorting Bar (if not in clusters view) ── */}
        {activeTab !== "clusters" && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/70 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Intent Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-semibold">Intent:</span>
                <select
                  value={filterIntent}
                  onChange={(e) => setFilterIntent(e.target.value as any)}
                  className="h-7 px-2 rounded-md bg-muted/30 border border-border/60 text-xs font-medium text-foreground focus:outline-none"
                >
                  <option value="All">All Intents</option>
                  <option value="Informational">Informational</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Transactional">Transactional</option>
                  <option value="Navigational">Navigational</option>
                </select>
              </div>

              {/* KD Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-semibold">Difficulty:</span>
                <select
                  value={filterKd}
                  onChange={(e) => setFilterKd(e.target.value as any)}
                  className="h-7 px-2 rounded-md bg-muted/30 border border-border/60 text-xs font-medium text-foreground focus:outline-none"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy (&le;29%)</option>
                  <option value="Medium">Medium (30-49%)</option>
                  <option value="Hard">Hard (50-69%)</option>
                  <option value="Very Hard">Very Hard (70%+)</option>
                </select>
              </div>

              {/* Min Volume */}
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground font-semibold">Min Vol:</span>
                <select
                  value={filterMinVolume}
                  onChange={(e) => setFilterMinVolume(Number(e.target.value))}
                  className="h-7 px-2 rounded-md bg-muted/30 border border-border/60 text-xs font-medium text-foreground focus:outline-none"
                >
                  <option value={0}>Any Volume</option>
                  <option value={1000}>&ge; 1,000</option>
                  <option value={5000}>&ge; 5,000</option>
                  <option value={10000}>&ge; 10,000</option>
                </select>
              </div>
            </div>

            {/* Sorting & Search */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-7 px-2 rounded-md bg-muted/30 border border-border/60 text-xs font-medium text-foreground focus:outline-none"
                >
                  <option value="volume_desc">Volume: High to Low</option>
                  <option value="volume_asc">Volume: Low to High</option>
                  <option value="kd_asc">Difficulty: Easiest First</option>
                  <option value="kd_desc">Difficulty: Hardest First</option>
                  <option value="cpc_desc">CPC: High to Low</option>
                  <option value="intent">Intent</option>
                </select>
              </div>

              <Input
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter keywords..."
                className="h-7 w-36 text-xs bg-muted/20"
              />
            </div>
          </div>
        )}

        {/* ── TAB 1, 2, 3: Tabular Keyword View (Related, Questions, Long-Tail) ── */}
        {activeTab !== "clusters" && (
          <Card className="border-border/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleToggleAll}
                        className="rounded border-border/80 cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5 font-bold">Keyword</th>
                    <th className="p-3.5 font-bold">Search Volume</th>
                    <th className="p-3.5 font-bold">KD %</th>
                    <th className="p-3.5 font-bold">CPC (USD)</th>
                    <th className="p-3.5 font-bold">Competition</th>
                    <th className="p-3.5 font-bold">Intent</th>
                    <th className="p-3.5 font-bold">SERP Features</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/40">
                  {processedKeywords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-muted-foreground">
                        No keywords match your selected filters. Try lowering minimum volume or resetting difficulty.
                      </td>
                    </tr>
                  ) : (
                    processedKeywords.map((item) => {
                      const isSelected = !!selectedKeywordIds[item.id]
                      const isSaved = !!savedKeywordIds[item.id]
                      const inTracker = !!rankTrackerKeywordIds[item.id]
                      const inProject = !!projectKeywordIds[item.id]

                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-muted/30 transition-colors ${
                            isSelected ? "bg-brand/5" : ""
                          }`}
                        >
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleOne(item.id)}
                              className="rounded border-border/80 cursor-pointer"
                            />
                          </td>

                          {/* Keyword name with quick search */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleQuickSeed(item.keyword)}
                                className="font-bold text-foreground hover:text-brand hover:underline transition-colors text-left"
                              >
                                {item.keyword}
                              </button>
                              <a
                                href={`https://www.google.com/search?q=${encodeURIComponent(item.keyword)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-foreground opacity-0 hover:opacity-100 transition-opacity"
                                title="Open Google SERP"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              Global: {item.globalVolume.toLocaleString()}
                            </span>
                          </td>

                          {/* Search Volume & Trend Mini Sparkline */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-foreground">
                                {item.volume.toLocaleString()}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-500 font-semibold">
                                {item.trendChangeMoM}
                              </span>
                            </div>
                          </td>

                          {/* KD */}
                          <td className="p-3.5">
                            {getKdBadge(item.kd, item.kdLabel)}
                          </td>

                          {/* CPC */}
                          <td className="p-3.5 font-mono font-bold text-foreground">
                            ${item.cpc.toFixed(2)}
                          </td>

                          {/* Competition */}
                          <td className="p-3.5">
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {item.competition} ({item.competitionScore})
                            </Badge>
                          </td>

                          {/* Intent */}
                          <td className="p-3.5">
                            {getIntentBadge(item.intent)}
                          </td>

                          {/* SERP Features */}
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.serpFeatures.slice(0, 3).map((feat) => (
                                <Badge key={feat} variant="secondary" className="text-[9px] py-0 px-1 font-medium">
                                  {feat}
                                </Badge>
                              ))}
                              {item.serpFeatures.length > 3 && (
                                <span className="text-[9px] text-muted-foreground font-mono self-center">
                                  +{item.serpFeatures.length - 3}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Save button */}
                              <button
                                onClick={() => handleSaveKeywords([item])}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  isSaved
                                    ? "bg-brand/10 border-brand text-brand"
                                    : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                                title={isSaved ? "Saved" : "Save keyword"}
                              >
                                {isSaved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                              </button>

                              {/* Add to Project */}
                              <button
                                onClick={() => handleAddToProject([item])}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  inProject
                                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                                    : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                                title={inProject ? "Added to project" : "Add to project"}
                              >
                                <ListPlus className="h-3.5 w-3.5" />
                              </button>

                              {/* Add to Rank Tracker */}
                              <button
                                onClick={() => handleAddToRankTracker([item])}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  inTracker
                                    ? "bg-indigo-500/10 border-indigo-500 text-indigo-500"
                                    : "border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                                title={inTracker ? "Tracking daily" : "Add to Rank Tracker"}
                              >
                                <TrendingUp className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* ── TAB 4: Keyword Clusters View ── */}
        {activeTab === "clusters" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {researchData.clusters.map((cluster) => (
              <Card key={cluster.id} className="border-border/80 p-5 bg-card shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] font-bold border-brand/40 text-brand">
                      {cluster.pillarTopic}
                    </Badge>
                    {getIntentBadge(cluster.primaryIntent)}
                  </div>

                  <h3 className="font-extrabold text-base text-foreground">
                    {cluster.name}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                    <span>Total Volume: <strong className="text-foreground">{cluster.totalVolume.toLocaleString()}</strong></span>
                    <span>•</span>
                    <span>Avg KD: <strong className="text-foreground">{cluster.avgKd}%</strong></span>
                    <span>•</span>
                    <span>{cluster.keywordsCount} Keywords</span>
                  </div>
                </div>

                {/* Sub-Keywords within Cluster */}
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                    Cluster Keyword Members
                  </span>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                    {cluster.keywords.map((kw) => (
                      <div
                        key={kw.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors text-xs"
                      >
                        <button
                          onClick={() => handleQuickSeed(kw.keyword)}
                          className="font-medium text-foreground hover:text-brand transition-colors text-left truncate mr-2"
                        >
                          {kw.keyword}
                        </button>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-muted-foreground font-semibold">
                            {kw.volume.toLocaleString()}
                          </span>
                          {getKdBadge(kw.kd, kw.kdLabel)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cluster Actions */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveKeywords(cluster.keywords)}
                    className="h-7 text-xs font-semibold gap-1"
                  >
                    <Bookmark className="h-3 w-3" /> Save Cluster
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleAddToRankTracker(cluster.keywords)}
                    className="h-7 text-xs font-semibold bg-brand hover:bg-brand/90 text-brand-foreground gap-1 shadow-xs"
                  >
                    <TrendingUp className="h-3 w-3" /> Track Entire Cluster
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade Prompt Modal (if quota reached) */}
      <UpgradePromptModal
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        featureName="Enterprise Keyword Research Engine"
        description="Your workspace has reached the monthly keyword volume quota for your current plan tier."
        metricName="keyword_searches"
        currentUsage={searchesCount}
        limit={maxSearches}
        recommendedTier="PROFESSIONAL"
      />
    </div>
  )
}
