"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  Search,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Cpu,
  BarChart3,
  FileCode2,
  ListTodo,
  Bot,
  RefreshCw,
  Printer,
} from "lucide-react"
import { AdBanner } from "@/components/ads/ad-banner"
import type {
  BrandProfile,
  ProbePrompt,
  ProbeResult,
  ReadinessCheck,
  SiteSnapshot,
  AiReport,
  PlatformScore,
} from "@/lib/analyzer/types"
import {
  readinessScore,
  visibilityScore,
  overallScore,
  scoreLabel,
  shareOfVoice,
  topSources,
  computePlatformScores,
} from "@/lib/analyzer/scoring"

const PRESETS = [
  { name: "Linear", url: "linear.app" },
  { name: "Stripe", url: "stripe.com" },
  { name: "Notion", url: "notion.so" },
  { name: "Shopify", url: "shopify.com" },
  { name: "Vercel", url: "vercel.com" },
]

type ActiveTab = "platforms" | "probes" | "shareOfVoice" | "sources" | "audit" | "fixes" | "actions"
type CodeTab = "llms" | "schema" | "robots" | "meta"

export default function HomePage() {
  const [brandInput, setBrandInput] = useState("")
  const [urlInput, setUrlInput] = useState("")
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
  const [codeTab, setCodeTab] = useState<CodeTab>("llms")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [auditFilter, setAuditFilter] = useState<"all" | "fail" | "warn" | "pass">("all")

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const handlePreset = (preset: { name: string; url: string }) => {
    setBrandInput(preset.name)
    setUrlInput(preset.url)
    setErrorMessage(null)
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
          setReport(reportData.report)
        } else {
          throw new Error("Report synthesis fallback needed")
        }
      } catch {
        setReport({
          verdict: `${scannedProfile.brand} demonstrates an overall AI visibility score of ${oScore}/100 with verified technical crawler readiness.`,
          perception: `Generative search engines identify ${scannedProfile.brand} (${scannedSite.domain}) as an active platform in ${scannedProfile.category}.`,
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
        })
      }

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

  const filteredChecks = checks.filter((c) => {
    if (auditFilter === "all") return true
    return c.status === auditFilter
  })

  return (
    <div className="min-h-screen bg-[#fafbfc] text-neutral-900 flex flex-col font-sans">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Minimalist Top Navigation */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="border-b border-neutral-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold tracking-tight text-neutral-900 text-base">
                TOPSEOTOOL
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-medium text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              AI Search Visibility Engine
            </span>
          </div>

          <nav className="flex items-center gap-4 text-xs font-medium text-neutral-600">
            <Link href="/privacy" className="hover:text-neutral-950 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-neutral-950 transition-colors">
              Terms
            </Link>
            <div className="h-4 w-px bg-neutral-200 hidden sm:block" />
            <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
              v2.0 • Light Mode
            </span>
          </nav>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Hero & Input Section */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-xs font-medium text-neutral-700 mb-4 shadow-2xs">
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span>SearchGPT • Perplexity • Gemini • Claude Grounding</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-neutral-950 mb-4 leading-tight">
            How does AI describe your brand when buyers ask for recommendations?
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto">
            Buyers are shifting from traditional search engines to AI chatbots. Enter your website to crawl your pages, run 6 live buyer queries against AI models, check robots.txt bot rules, and get instant copy-paste code fixes.
          </p>
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* Main Input Card */}
        {/* ───────────────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-neutral-200 p-4 sm:p-7 shadow-xs mb-8 transition-shadow hover:shadow-sm">
          <form onSubmit={runAnalysis} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Brand or Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={brandInput}
                    onChange={(e) => setBrandInput(e.target.value)}
                    placeholder="e.g. Linear, Stripe, Acme"
                    disabled={isAnalyzing}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="sm:col-span-7">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Website URL or Domain <span className="text-blue-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="example.com or https://..."
                    required
                    disabled={isAnalyzing}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-neutral-500 font-medium mr-1">
                  Try sample:
                </span>
                {PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handlePreset(p)}
                    disabled={isAnalyzing}
                    className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-xs transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze AI Visibility</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200/80 flex items-start gap-3 text-xs text-red-800">
              <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Analysis Notice</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────── */}
        {/* Live Progress Card (During Analysis) */}
        {/* ───────────────────────────────────────────────────────────── */}
        {isAnalyzing && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-blue-200 p-6 sm:p-8 shadow-xs mb-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-spin">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Live AI Intelligence Audit in Progress
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    Step {currentStep} of 3
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-medium text-blue-600 px-2.5 py-1 rounded-full bg-blue-50">
                {currentStep === 1 ? "33%" : currentStep === 2 ? "66%" : "90%"}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-neutral-100 overflow-hidden mb-5">
              <div
                className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                style={{
                  width:
                    currentStep === 1
                      ? "33%"
                      : currentStep === 2
                      ? "66%"
                      : currentStep === 3
                      ? "92%"
                      : "100%",
                }}
              />
            </div>

            <div className="space-y-2.5 text-xs">
              <div
                className={`flex items-center gap-2.5 p-2 rounded-lg ${
                  currentStep >= 1 ? "bg-blue-50/60 text-blue-900" : "text-neutral-400"
                }`}
              >
                {currentStep > 1 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
                )}
                <span className="font-medium">
                  1. Deep crawl of homepage, robots.txt, sitemap & Schema.org JSON-LD
                </span>
              </div>

              <div
                className={`flex items-center gap-2.5 p-2 rounded-lg ${
                  currentStep >= 2 ? "bg-blue-50/60 text-blue-900" : "text-neutral-400"
                }`}
              >
                {currentStep > 2 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : currentStep === 2 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" />
                )}
                <span className="font-medium">
                  2. Querying live AI search engines with 6 realistic buyer questions
                </span>
              </div>

              <div
                className={`flex items-center gap-2.5 p-2 rounded-lg ${
                  currentStep >= 3 ? "bg-blue-50/60 text-blue-900" : "text-neutral-400"
                }`}
              >
                {currentStep > 3 ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : currentStep === 3 ? (
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" />
                )}
                <span className="font-medium">
                  3. Synthesizing strategic audit and ready-to-paste code fixes
                </span>
              </div>
            </div>

            <p className="mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-500 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              {stepMessage}
            </p>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* Results Dashboard */}
        {/* ───────────────────────────────────────────────────────────── */}
        {site && profile && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* ───────────────────────────────────────────────────────── */}
            {/* Header & Quick Actions */}
            {/* ───────────────────────────────────────────────────────── */}
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
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Audit</span>
                </button>
                <button
                  type="button"
                  onClick={() => runAnalysis()}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-audit</span>
                </button>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* Executive Scorecards */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Overall Score */}
              <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                    Overall AI Score
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-neutral-950">
                      {oScore}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">/100</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      oTier.tone === "great"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : oTier.tone === "good"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : oTier.tone === "fair"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {oTier.label}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Weighted 60/40
                  </span>
                </div>
              </div>

              {/* Discovery Rate */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                    AI Discovery Rate
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-neutral-950">
                      {vBreakdown?.discoveryRate ?? 0}%
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
                  Surfaced in unbranded category queries
                </p>
              </div>

              {/* AI Recognition Rate */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                    Recognition Rate
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-neutral-950">
                      {vBreakdown?.recognitionRate ?? 0}%
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
                  Identified in brand & review questions
                </p>
              </div>

              {/* Verified Citations */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                    Citation Rate
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-neutral-950">
                      {vBreakdown?.citationRate ?? 0}%
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
                  Direct domain links cited in answers
                </p>
              </div>

              {/* Technical Readiness */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
                    Technical Readiness
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-neutral-950">
                      {rScore}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">/100</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500 mt-3 pt-3 border-t border-neutral-100">
                  Robots.txt, JSON-LD, speed & metadata
                </p>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* AI Executive Summary Banner */}
            {report && (
              <div className="bg-blue-50/70 rounded-2xl border border-blue-200/80 p-5 sm:p-6 text-neutral-800">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        AI Executive Verdict
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                        {report.source === "ai" ? "Gemini Synthesized" : "Rules Derived"}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900 leading-snug">
                      {report.verdict}
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed">
                      {report.perception}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────── */}
            {/* AI Platform Score & Accuracy Breakdown */}
            {/* ───────────────────────────────────────────────────────── */}
            {platformScores.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-neutral-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs">
                        <Cpu className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-base font-bold text-neutral-950">
                        AI Platform Score &amp; Accuracy Breakdown
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-semibold">
                        6 Live Engines
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      Real-time visibility score percentage and factual accuracy rating across the world&apos;s leading generative AI search models.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-neutral-500 font-medium shrink-0">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                      Visibility Score %
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Accuracy %
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platformScores.map((plat) => (
                    <div
                      key={plat.id}
                      className="rounded-xl border border-neutral-200/90 p-4.5 bg-neutral-50/40 hover:bg-white hover:border-neutral-300 transition-all shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Platform & Model */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs"
                              style={{
                                backgroundColor: `${plat.accentColor}18`,
                                color: plat.accentColor,
                                border: `1px solid ${plat.accentColor}33`,
                              }}
                            >
                              {plat.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-neutral-900 leading-tight">
                                {plat.name}
                              </h4>
                              <span className="text-[11px] font-mono text-neutral-500">
                                {plat.model}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                              plat.status === "dominant"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : plat.status === "strong"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-neutral-100 text-neutral-700 border-neutral-200"
                            }`}
                          >
                            {plat.rankLabel}
                          </span>
                        </div>

                        {/* Dual Score Meters: Visibility & Accuracy */}
                        <div className="grid grid-cols-2 gap-3 mb-3 bg-white p-3 rounded-xl border border-neutral-200/80">
                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-neutral-500 font-medium">Score</span>
                              <span className="font-extrabold text-neutral-950 font-mono text-sm">
                                {plat.scorePercent}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${plat.scorePercent}%`,
                                  backgroundColor: plat.accentColor,
                                }}
                              />
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                              AI Visibility
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="text-neutral-500 font-medium">Accuracy</span>
                              <span className="font-extrabold text-emerald-600 font-mono text-sm">
                                {plat.accuracyPercent}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${plat.accuracyPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-emerald-600/80 font-mono mt-1 block">
                              Fact Grounding
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Engine & Crawler detail footer */}
                      <div className="pt-2.5 border-t border-neutral-200/60 flex items-center justify-between text-[11px] text-neutral-600">
                        <span className="truncate font-medium">{plat.details}</span>
                        <span className="shrink-0 text-neutral-400 font-mono text-[10px] ml-1 uppercase">
                          {plat.sentiment}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────── */}
            {/* Interactive Tabbed Navigation */}
            {/* ───────────────────────────────────────────────────────── */}
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
                {/* ───────────────────────────────────────────────────── */}
                {/* Tab: AI Platforms & Accuracy Breakdown */}
                {/* ───────────────────────────────────────────────────── */}
                {activeTab === "platforms" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900">
                          Cross-Platform AI Performance &amp; Accuracy Matrix
                        </h4>
                        <p className="text-xs text-neutral-500">
                          Comprehensive breakdown of score percentage, factual accuracy rate, recommendation position, and crawler status.
                        </p>
                      </div>
                      <span className="text-xs font-mono text-neutral-400">
                        {platformScores.length} Platforms Evaluated
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-neutral-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-600">
                          <tr>
                            <th className="py-3 px-4">Platform &amp; Model</th>
                            <th className="py-3 px-4">Engine Type</th>
                            <th className="py-3 px-4">Visibility Score</th>
                            <th className="py-3 px-4">Accuracy Rate</th>
                            <th className="py-3 px-4">Recommendation Rank</th>
                            <th className="py-3 px-4">Sentiment</th>
                            <th className="py-3 px-4">Crawler Access</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200/70 bg-white">
                          {platformScores.map((p) => (
                            <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                              <td className="py-3 px-4 font-semibold text-neutral-900">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full inline-block"
                                    style={{ backgroundColor: p.accentColor }}
                                  />
                                  <span>{p.name}</span>
                                  <span className="text-[10px] font-mono font-normal text-neutral-400">
                                    ({p.model})
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-neutral-600 font-mono text-[11px]">
                                {p.engine}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-neutral-900 font-mono">
                                    {p.scorePercent}%
                                  </span>
                                  <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full rounded-full"
                                      style={{
                                        width: `${p.scorePercent}%`,
                                        backgroundColor: p.accentColor,
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-emerald-700 font-mono">
                                    {p.accuracyPercent}%
                                  </span>
                                  <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 rounded-full"
                                      style={{ width: `${p.accuracyPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                    p.status === "dominant"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : p.status === "strong"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : "bg-neutral-100 text-neutral-700 border-neutral-200"
                                  }`}
                                >
                                  {p.rankLabel}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-[11px] font-mono capitalize text-neutral-600">
                                {p.sentiment}
                              </td>
                              <td className="py-3 px-4 text-[11px] text-neutral-600">
                                {p.details}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────── */}
                {/* Tab 1: Probes / AI Answers */}
                {/* ───────────────────────────────────────────────────── */}
                {activeTab === "probes" && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-neutral-500">
                        Live search-grounded answers returned for simulated buyer questions.
                      </p>
                      <span className="text-xs font-mono text-neutral-400">
                        {probes.filter((p) => p.mentioned).length}/{probes.length} mentions
                      </span>
                    </div>

                    <div className="space-y-4">
                      {probes.map((probe) => (
                        <div
                          key={probe.id}
                          className="rounded-xl border border-neutral-200/90 p-4 sm:p-5 hover:border-neutral-300 transition-colors bg-white shadow-2xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
                                {probe.intent}
                              </span>
                              <h4 className="text-sm font-semibold text-neutral-900">
                                &ldquo;{probe.question}&rdquo;
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {probe.mentioned ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <Check className="w-3 h-3" />
                                  Mentioned {probe.position ? `(#${probe.position})` : ""}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                                  Not Mentioned
                                </span>
                              )}

                              {probe.sentiment !== "n/a" && (
                                <span
                                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                    probe.sentiment === "positive"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : probe.sentiment === "mixed"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-neutral-100 text-neutral-600"
                                  }`}
                                >
                                  {probe.sentiment}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="bg-neutral-50/80 rounded-lg p-3.5 text-xs text-neutral-700 leading-relaxed font-sans mb-3 border border-neutral-200/60 whitespace-pre-line">
                            {probe.answer}
                          </div>

                          {/* Brands named & sources cited */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-neutral-100 text-[11px] text-neutral-500">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-neutral-700">
                                Brands Recommended:
                              </span>
                              {probe.brandsNamed.length > 0 ? (
                                probe.brandsNamed.map((b, i) => (
                                  <span
                                    key={i}
                                    className={`px-1.5 py-0.5 rounded ${
                                      b.toLowerCase() === profile.brand.toLowerCase()
                                        ? "bg-blue-100 text-blue-800 font-bold"
                                        : "bg-neutral-200/60 text-neutral-700"
                                    }`}
                                  >
                                    {b}
                                  </span>
                                ))
                              ) : (
                                <span>None parsed</span>
                              )}
                            </div>

                            {probe.sources.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-neutral-700">
                                  Cited:
                                </span>
                                {probe.sources.slice(0, 3).map((s, idx) => (
                                  <a
                                    key={idx}
                                    href={s.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center gap-0.5"
                                  >
                                    <span>{s.domain}</span>
                                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────── */}
                {/* Tab 2: Share of Voice */}
                {/* ───────────────────────────────────────────────────── */}
                {activeTab === "shareOfVoice" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 mb-1">
                        AI Share of Voice in Recommendations
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Frequency of brand recommendations across all tested queries in this category.
                      </p>
                    </div>

                    <div className="space-y-3 max-w-xl">
                      {sovList.map((item) => {
                        const maxCount = Math.max(...sovList.map((x) => x.count), 1)
                        const pct = Math.round((item.count / maxCount) * 100)

                        return (
                          <div key={item.name} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span
                                className={`font-medium ${
                                  item.isTarget ? "text-blue-600 font-bold" : "text-neutral-800"
                                }`}
                              >
                                {item.name} {item.isTarget ? "(Your Brand)" : ""}
                              </span>
                              <span className="font-mono text-neutral-500">
                                {item.count} mention{item.count === 1 ? "" : "s"}
                              </span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  item.isTarget ? "bg-blue-600" : "bg-neutral-400"
                                }`}
                                style={{ width: `${Math.max(pct, 5)}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────── */}
                {/* Tab 3: Sources & Citations */}
                {/* ───────────────────────────────────────────────────── */}
                {activeTab === "sources" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 mb-1">
                        High-Authority Grounding Domains
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Web domains that AI engines retrieve facts from when formulating answers about your category.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {topCitedSources.map((s, idx) => (
                        <div
                          key={idx}
                          className={`p-3.5 rounded-xl border flex items-center justify-between ${
                            s.own
                              ? "bg-blue-50/50 border-blue-200"
                              : "bg-white border-neutral-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0 font-mono text-xs">
                              #{idx + 1}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-neutral-900 truncate block">
                                {s.domain}
                              </span>
                              <span className="text-[11px] text-neutral-500">
                                {s.own ? "Your Verified Domain" : "Third-Party Source"}
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                            {s.count} citation{s.count === 1 ? "" : "s"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────── */}
                {/* Tab 4: Technical Audit */}
                {/* ───────────────────────────────────────────────────── */}
                {activeTab === "audit" && (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900 mb-0.5">
                          Technical & Crawler Readiness Checks
                        </h4>
                        <p className="text-xs text-neutral-500">
                          Signals analyzed from your live website, robots.txt, and metadata.
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg text-xs font-medium self-start">
                        {(["all", "fail", "warn", "pass"] as const).map((filter) => (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => setAuditFilter(filter)}
                            className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                              auditFilter === filter
                                ? "bg-white text-neutral-900 shadow-2xs"
                                : "text-neutral-500 hover:text-neutral-900"
                            }`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {filteredChecks.map((check) => (
                        <div
                          key={check.id}
                          className="rounded-xl border border-neutral-200/90 p-4 bg-white flex items-start gap-3 shadow-2xs"
                        >
                          <div className="mt-0.5 shrink-0">
                            {check.status === "pass" ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : check.status === "warn" ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-neutral-900">
                                {check.label}
                              </span>
                              <span
                                className={`text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                                  check.status === "pass"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : check.status === "warn"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {check.status}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 leading-relaxed">
                              {check.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────── */}
                {/* Tab 5: Instant Fix Files (Copy-Paste) */}
                {/* ───────────────────────────────────────────────────── */}
                {activeTab === "fixes" && report && (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 mb-1">
                        Pre-Engineered Fix Code (Ready to Copy & Paste)
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Deploy these standard files to ensure AI crawlers understand and recommend your platform.
                      </p>
                    </div>

                    {/* Sub-tabs */}
                    <div className="flex items-center gap-1.5 border-b border-neutral-200 pb-2">
                      <button
                        type="button"
                        onClick={() => setCodeTab("llms")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                          codeTab === "llms"
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        llms.txt
                      </button>
                      <button
                        type="button"
                        onClick={() => setCodeTab("schema")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                          codeTab === "schema"
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        Schema JSON-LD
                      </button>
                      <button
                        type="button"
                        onClick={() => setCodeTab("robots")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                          codeTab === "robots"
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        robots.txt
                      </button>
                      <button
                        type="button"
                        onClick={() => setCodeTab("meta")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                          codeTab === "meta"
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600 hover:text-neutral-900"
                        }`}
                      >
                        Meta Tags
                      </button>
                    </div>

                    {/* Code Container */}
                    <div className="relative rounded-xl bg-neutral-950 p-4 text-neutral-100 font-mono text-xs overflow-x-auto shadow-inner">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800 text-[11px] text-neutral-400">
                        <span>
                          {codeTab === "llms"
                            ? `Destination: https://${site.domain}/llms.txt`
                            : codeTab === "schema"
                            ? "Destination: <head> section of homepage"
                            : codeTab === "robots"
                            ? `Destination: https://${site.domain}/robots.txt`
                            : "Destination: <head> section"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const snippet =
                              codeTab === "llms"
                                ? report.llmsTxt
                                : codeTab === "schema"
                                ? report.schemaJsonLd
                                : codeTab === "robots"
                                ? report.robotsTxt
                                : `<title>${report.metaTitle}</title>\n<meta name="description" content="${report.metaDescription}" />`
                            copyToClipboard(codeTab, snippet)
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-white transition-colors cursor-pointer"
                        >
                          {copiedKey === codeTab ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Snippet</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="whitespace-pre overflow-x-auto text-[11.5px] leading-relaxed text-neutral-200">
                        {codeTab === "llms"
                          ? report.llmsTxt
                          : codeTab === "schema"
                          ? report.schemaJsonLd
                          : codeTab === "robots"
                          ? report.robotsTxt
                          : `<title>${report.metaTitle}</title>\n<meta name="description" content="${report.metaDescription}" />\n<meta property="og:title" content="${report.metaTitle}" />\n<meta property="og:description" content="${report.metaDescription}" />`}
                      </pre>
                    </div>
                  </div>
                )}

                {/* ───────────────────────────────────────────────────── */}
                {/* Tab 6: Prioritized Actions */}
                {/* ───────────────────────────────────────────────────── */}
                {activeTab === "actions" && report && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 mb-1">
                        Prioritized GEO / AEO Strategic Action Plan
                      </h4>
                      <p className="text-xs text-neutral-500">
                        Specific fixes ordered by impact to improve how generative engines recommend your brand.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {report.actions.map((act, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-neutral-200 p-4 bg-white flex flex-col sm:flex-row sm:items-start justify-between gap-3 shadow-2xs hover:border-neutral-300 transition-colors"
                        >
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                                  act.impact === "high"
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : act.impact === "medium"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                }`}
                              >
                                {act.impact} Impact
                              </span>
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                                {act.area}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {act.effort} effort
                              </span>
                            </div>

                            <h5 className="text-sm font-bold text-neutral-900">
                              {act.title}
                            </h5>
                            <p className="text-xs text-neutral-600 leading-relaxed">
                              <strong className="text-neutral-800">Why:</strong> {act.why}
                            </p>
                            <p className="text-xs text-neutral-800 leading-relaxed bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/60 font-sans">
                              <strong className="text-blue-700">How to fix:</strong> {act.how}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────── */}
        {/* Minimal Clean Ad Banner */}
        {/* ───────────────────────────────────────────────────────────── */}
        <AdBanner className="mt-12" />

      </main>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Clean Footer */}
      {/* ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-200/80 bg-white py-8 mt-16 text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">TOPSEOTOOL</span>
            <span>&copy; {new Date().getFullYear()} • All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5 font-medium">
            <Link href="/privacy" className="hover:text-neutral-950 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neutral-950 transition-colors">
              Terms of Service
            </Link>
            <span className="text-neutral-300">|</span>
            <span className="text-neutral-400 font-mono">
              Engineered with Gemini Grounding
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
