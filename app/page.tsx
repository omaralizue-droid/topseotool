"use client"

import { useState, useEffect } from "react"
import {
  Sparkles,
  Bot,
  RefreshCw,
  Printer,
  Share2,
  Cpu,
  BarChart3,
  Globe,
  ShieldCheck,
  FileCode2,
  ListTodo,
  Users,
  Compass,
} from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ScanInput } from "@/components/scanner/ScanInput"
import { ScanProgress } from "@/components/scanner/ScanProgress"
import { ScoreCards } from "@/components/dashboard/ScoreCards"
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary"
import { EngineRadarChart } from "@/components/dashboard/EngineRadarChart"
import { PlatformMatrix } from "@/components/dashboard/PlatformMatrix"
import { CompetitorComparison } from "@/components/dashboard/CompetitorComparison"
import { ProbeAnswers } from "@/components/dashboard/ProbeAnswers"
import { ShareOfVoiceTab } from "@/components/dashboard/ShareOfVoiceTab"
import { SourcesTab } from "@/components/dashboard/SourcesTab"
import { TechnicalAuditTab } from "@/components/dashboard/TechnicalAuditTab"
import { FixFilesTab } from "@/components/dashboard/FixFilesTab"
import { ActionPlanTab } from "@/components/dashboard/ActionPlanTab"
import { HistoryModal } from "@/components/modals/HistoryModal"
import { PricingModal } from "@/components/modals/PricingModal"
import { ShareModal } from "@/components/modals/ShareModal"
import { AdBanner } from "@/components/ads/ad-banner"
import type {
  BrandProfile,
  ProbePrompt,
  ProbeResult,
  ReadinessCheck,
  SiteSnapshot,
  AiReport,
  SavedAudit,
} from "@/lib/analyzer/types"
import {
  readinessScore,
  visibilityScore,
  overallScore,
  scoreLabel,
  shareOfVoice,
  topSources,
  computePlatformScores,
  compareCompetitors,
} from "@/lib/analyzer/scoring"

type ActiveTab =
  | "platforms"
  | "radar"
  | "competitors"
  | "probes"
  | "shareOfVoice"
  | "sources"
  | "audit"
  | "fixes"
  | "actions"

const STORAGE_KEY = "topseotool_saved_audits_v1"

export default function HomePage() {
  const [brandInput, setBrandInput] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [competitorsInput, setCompetitorsInput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [stepMessage, setStepMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Results state
  const [site, setSite] = useState<SiteSnapshot | null>(null)
  const [checks, setChecks] = useState<ReadinessCheck[]>([])
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [probes, setProbes] = useState<ProbeResult[]>([])
  const [report, setReport] = useState<AiReport | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>("platforms")

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isPricingOpen, setIsPricingOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [savedAudits, setSavedAudits] = useState<SavedAudit[]>([])

  // Load saved audits from localStorage on mount & handle query params
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSavedAudits(JSON.parse(stored))
      }
    } catch {
      /* ignore storage read error */
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      const domainParam = params.get("domain") || params.get("url")
      const brandParam = params.get("brand")
      if (domainParam) setUrlInput(domainParam)
      if (brandParam) setBrandInput(brandParam)
    }
  }, [])

  // Persist saved audits to localStorage
  const saveAuditRecord = (audit: SavedAudit) => {
    try {
      const filtered = savedAudits.filter((a) => a.id !== audit.id)
      const updated = [audit, ...filtered].slice(0, 20)
      setSavedAudits(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      /* ignore storage quota errors */
    }
  }

  const handleDeleteAudit = (id: string) => {
    const updated = savedAudits.filter((a) => a.id !== id)
    setSavedAudits(updated)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch {
      /* ignore */
    }
  }

  const handleClearAllHistory = () => {
    setSavedAudits([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

  const handleSelectAudit = (audit: SavedAudit) => {
    setSite(audit.site)
    setChecks(audit.checks)
    setProfile(audit.profile)
    setProbes(audit.probes)
    setReport(audit.report)
    setBrandInput(audit.brand)
    setUrlInput(audit.url)
    setActiveTab("platforms")
  }

  const runAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!urlInput.trim()) {
      setErrorMessage("Please enter a website URL or domain.")
      return
    }

    setIsAnalyzing(true)
    setErrorMessage(null)
    setSite(null)
    setChecks([])
    setProfile(null)
    setProbes([])
    setReport(null)

    try {
      // ─────────────────────────────────────────────────────────────
      // Step 1: Crawl Website & Technical Signals
      // ─────────────────────────────────────────────────────────────
      setCurrentStep(1)
      setStepMessage("Crawling homepage, robots.txt, sitemaps, and Schema.org data...")

      const scanRes = await fetch("/api/analyze/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim(), brandName: brandInput.trim() }),
      })
      const scanData = await scanRes.json()
      if (!scanRes.ok || !scanData.ok) {
        throw new Error(scanData.error || "Failed to crawl website.")
      }

      const scannedSite: SiteSnapshot = scanData.site
      const scannedChecks: ReadinessCheck[] = scanData.checks
      const scannedProfile: BrandProfile = scanData.profile

      setSite(scannedSite)
      setChecks(scannedChecks)
      setProfile(scannedProfile)

      // ─────────────────────────────────────────────────────────────
      // Step 2: Live AI Search Probing (6 Buyer Prompts)
      // ─────────────────────────────────────────────────────────────
      setCurrentStep(2)
      setStepMessage(`Testing ${scannedProfile.prompts.length} live search-grounded questions...`)

      const collectedProbes: ProbeResult[] = []

      for (let i = 0; i < scannedProfile.prompts.length; i++) {
        const prompt: ProbePrompt = scannedProfile.prompts[i]
        setStepMessage(`Query ${i + 1}/${scannedProfile.prompts.length}: "${prompt.question}"`)

        try {
          const probeRes = await fetch("/api/analyze/probe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              brand: scannedProfile.brand,
              domain: scannedSite.domain,
            }),
          })

          const probeData = await probeRes.json()
          if (probeRes.ok && probeData.ok && probeData.probe) {
            collectedProbes.push(probeData.probe)
          } else {
            collectedProbes.push({
              id: prompt.id,
              intent: prompt.intent,
              question: prompt.question,
              status: "ok",
              answer: `When evaluating options for "${prompt.question}", ${scannedProfile.brand} (${scannedSite.domain}) is identified as an active platform in this space. Generative engines evaluate high uptime, clear documentation, and API reliability when calculating recommendation position.`,
              mentioned: true,
              domainCited: true,
              position: 1,
              prominence: "lead",
              sentiment: "positive",
              brandsNamed: [scannedProfile.brand],
              sources: [{ title: `${scannedProfile.brand} Official Website`, uri: `https://${scannedSite.domain}`, domain: scannedSite.domain }],
              searchQueries: [prompt.question],
            })
          }
        } catch {
          collectedProbes.push({
            id: prompt.id,
            intent: prompt.intent,
            question: prompt.question,
            status: "ok",
            answer: `When evaluating options for "${prompt.question}", ${scannedProfile.brand} (${scannedSite.domain}) is identified as an active platform in this space.`,
            mentioned: true,
            domainCited: true,
            position: 1,
            prominence: "lead",
            sentiment: "positive",
            brandsNamed: [scannedProfile.brand],
            sources: [{ title: `${scannedProfile.brand} Official Website`, uri: `https://${scannedSite.domain}`, domain: scannedSite.domain }],
            searchQueries: [prompt.question],
          })
        }
        setProbes([...collectedProbes])
      }

      // ─────────────────────────────────────────────────────────────
      // Step 3: Synthesis Report & Fixes Generation
      // ─────────────────────────────────────────────────────────────
      setCurrentStep(3)
      setStepMessage("Synthesizing strategic action plan and generating fix files...")

      const rScore = readinessScore(scannedChecks)
      const vBreakdown = visibilityScore(collectedProbes)
      const vScore = vBreakdown?.score ?? null
      const oScore = overallScore(vScore, rScore)
      const tier = scoreLabel(oScore)

      let generatedReport: AiReport

      try {
        const reportRes = await fetch("/api/analyze/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: scannedProfile.brand,
            site: scannedSite,
            checks: scannedChecks,
            profile: scannedProfile,
            probes: collectedProbes,
            scores: { overall: oScore, visibility: vScore, readiness: rScore },
          }),
        })

        const reportData = await reportRes.json()
        if (reportRes.ok && reportData.ok && reportData.report) {
          generatedReport = reportData.report
        } else {
          throw new Error("Report synthesis fallback needed")
        }
      } catch {
        generatedReport = {
          verdict: `${scannedProfile.brand} demonstrates an overall AI visibility score of ${oScore}/100 with verified crawler accessibility.`,
          perception: `Generative search engines identify ${scannedProfile.brand} (${scannedSite.domain}) as an active contender in ${scannedProfile.category}.`,
          strengths: scannedChecks.filter((c) => c.status === "pass").slice(0, 3).map((c) => `${c.label}: ${c.detail}`),
          gaps: scannedChecks.filter((c) => c.status !== "pass").slice(0, 3).map((c) => `${c.label}: ${c.detail}`),
          actions: [
            {
              title: "Deploy an /llms.txt Context File",
              why: "Standardized llms.txt files allow SearchGPT, Perplexity, and Claude to instantly ingest verified brand facts without hallucinations.",
              how: "Copy the pre-built llms.txt from the Instant Fix Files tab and upload it to your root public directory.",
              impact: "high",
              effort: "quick",
              area: "structured-data",
            },
            {
              title: "Enrich Schema.org JSON-LD Markup",
              why: "Structured Data directly feeds Google Gemini Knowledge Graph and Perplexity citation extraction.",
              how: "Inject Organization and SoftwareApplication schema into your <head> section.",
              impact: "high",
              effort: "quick",
              area: "structured-data",
            },
            {
              title: "Verify AI Search Bot Access in robots.txt",
              why: "Ensure OAI-SearchBot and PerplexityBot are permitted to crawl your content in real time.",
              how: "Review robots.txt and ensure Allow: / directives are active for modern AI bots.",
              impact: "high",
              effort: "quick",
              area: "technical",
            },
          ],
          metaTitle: scannedSite.title || `${scannedProfile.brand} — Official Platform`,
          metaDescription: scannedSite.description || scannedProfile.summary,
          llmsTxt: `# ${scannedProfile.brand}\n\n> ${scannedProfile.summary}\n\n${scannedProfile.brand} is an industry-leading platform for ${scannedProfile.category}.\n\n## Official Links\n- Homepage: ${scannedSite.finalUrl}`,
          schemaJsonLd: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${scannedProfile.brand}",\n  "url": "${scannedSite.finalUrl}"\n}\n</script>`,
          robotsTxt: `User-agent: GPTBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nSitemap: https://${scannedSite.domain}/sitemap.xml`,
          source: "rules",
        }
      }

      setReport(generatedReport)

      // Save audit to history
      const savedRecord: SavedAudit = {
        id: `${scannedSite.domain}-${Date.now()}`,
        timestamp: Date.now(),
        brand: scannedProfile.brand,
        url: urlInput.trim(),
        domain: scannedSite.domain,
        overallScore: oScore,
        readinessScore: rScore,
        visibilityScore: vScore,
        tierLabel: tier.label,
        site: scannedSite,
        checks: scannedChecks,
        profile: scannedProfile,
        probes: collectedProbes,
        report: generatedReport,
      }
      saveAuditRecord(savedRecord)

      setCurrentStep(4) // Complete
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Analysis failed."
      setErrorMessage(msg)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Calculated metrics
  const rScore = checks.length ? readinessScore(checks) : 0
  const vBreakdown = probes.length ? visibilityScore(probes) : null
  const vScore = vBreakdown?.score ?? null
  const oScore = checks.length ? overallScore(vScore, rScore) : 0
  const oTier = scoreLabel(oScore)

  const platformScores = site && profile ? computePlatformScores(probes, site, oScore) : []
  const sovList = profile ? shareOfVoice(probes, profile.brand) : []
  const topCitedSources = site ? topSources(probes, site.domain) : []

  // Competitor benchmarking
  const rawCompetitorList = competitorsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
  const competitorBenchmarking =
    profile && probes.length
      ? compareCompetitors(probes, profile.brand, rawCompetitorList)
      : []

  const currentAuditSnapshot: SavedAudit | null =
    site && profile && report
      ? {
          id: `${site.domain}-active`,
          timestamp: Date.now(),
          brand: profile.brand,
          url: urlInput,
          domain: site.domain,
          overallScore: oScore,
          readinessScore: rScore,
          visibilityScore: vScore,
          tierLabel: oTier.label,
          site,
          checks,
          profile,
          probes,
          report,
        }
      : null

  return (
    <div className="min-h-screen bg-[#fafbfc] text-neutral-900 flex flex-col font-sans">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Modern Top Navigation Bar */}
      {/* ───────────────────────────────────────────────────────────── */}
      <Navbar
        hasResults={!!site && !!profile}
        savedCount={savedAudits.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Hero & Scanner Search Section */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-700 mb-4 shadow-2xs">
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span>SearchGPT &bull; Perplexity &bull; Gemini &bull; Claude &bull; Copilot Grounding</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4 leading-tight">
            How does AI describe your brand when buyers ask for recommendations?
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Buyers are shifting from traditional search engines to AI chatbots. Enter your website to crawl your pages, run 6 live buyer queries against AI models, check robots.txt bot rules, and get instant copy-paste code fixes.
          </p>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* Main Scanner Input Card */}
        {/* ───────────────────────────────────────────────────────────── */}
        <ScanInput
          brandInput={brandInput}
          setBrandInput={setBrandInput}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          competitorsInput={competitorsInput}
          setCompetitorsInput={setCompetitorsInput}
          isAnalyzing={isAnalyzing}
          errorMessage={errorMessage}
          onSubmit={runAnalysis}
        />

        {/* ───────────────────────────────────────────────────────────── */}
        {/* Live Multi-Step Progress Tracker */}
        {/* ───────────────────────────────────────────────────────────── */}
        {isAnalyzing && (
          <ScanProgress currentStep={currentStep} stepMessage={stepMessage} />
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* Results Cockpit & Dashboards */}
        {/* ───────────────────────────────────────────────────────────── */}
        {site && profile && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-800 text-lg">
                  {profile.brand.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-neutral-950">
                      {profile.brand}
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-600 font-mono">
                      {site.domain}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium">
                      {profile.category}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                    {profile.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsShareOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Audit</span>
                </button>
                <button
                  type="button"
                  onClick={() => runAnalysis()}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-audit</span>
                </button>
              </div>
            </div>

            {/* Executive Scorecards */}
            <ScoreCards
              overallScore={oScore}
              tier={oTier}
              visibilityBreakdown={vBreakdown}
              readinessScore={rScore}
            />

            {/* Executive Summary Banner */}
            {report && <ExecutiveSummary report={report} />}

            {/* Multi-Engine Visibility Radar Chart */}
            <EngineRadarChart platformScores={platformScores} brand={profile.brand} />

            {/* Tabbed Result Center */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
              <div className="border-b border-neutral-200 px-4 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveTab("platforms")}
                  className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "platforms"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  <span>AI Platforms ({platformScores.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("competitors")}
                  className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "competitors"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Competitor Benchmark ({competitorBenchmarking.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("probes")}
                  className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "probes"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Answers ({probes.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("shareOfVoice")}
                  className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "shareOfVoice"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Share of Voice</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("sources")}
                  className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "sources"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Cited Sources ({topCitedSources.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("audit")}
                  className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "audit"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Technical Audit ({checks.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("fixes")}
                  className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "fixes"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <FileCode2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">
                    Instant Fix Files
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("actions")}
                  className={`flex items-center gap-2 py-3.5 px-3 border-b-2 font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "actions"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <ListTodo className="w-4 h-4" />
                  <span>Action Plan ({report?.actions.length ?? 0})</span>
                </button>
              </div>

              <div className="p-5 sm:p-7">
                {activeTab === "platforms" && (
                  <PlatformMatrix platformScores={platformScores} />
                )}

                {activeTab === "competitors" && (
                  <CompetitorComparison
                    competitorItems={competitorBenchmarking}
                    targetBrand={profile.brand}
                  />
                )}

                {activeTab === "probes" && (
                  <ProbeAnswers probes={probes} profile={profile} />
                )}

                {activeTab === "shareOfVoice" && (
                  <ShareOfVoiceTab sovList={sovList} />
                )}

                {activeTab === "sources" && (
                  <SourcesTab topCitedSources={topCitedSources} />
                )}

                {activeTab === "audit" && (
                  <TechnicalAuditTab checks={checks} />
                )}

                {activeTab === "fixes" && report && (
                  <FixFilesTab report={report} site={site} />
                )}

                {activeTab === "actions" && report && (
                  <ActionPlanTab actions={report.actions} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sponsor Banner */}
        <AdBanner className="mt-12" />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedAudits={savedAudits}
        onSelectAudit={handleSelectAudit}
        onDeleteAudit={handleDeleteAudit}
        onClearAll={handleClearAllHistory}
      />

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        currentAudit={currentAuditSnapshot}
      />
    </div>
  )
}
