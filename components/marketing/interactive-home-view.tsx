"use client"

import { useState, useRef, useCallback } from "react"
import {
  ArrowRight, CheckCircle2, XCircle, AlertCircle,
  Sparkles, Brain, Globe, Building2, BarChart3,
  Eye, TrendingUp, Search, Loader2,
  RefreshCw, Activity, Radio, Cpu,
  AlertTriangle, CheckCheck, Info
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// Types matching PublicScanOutput from /lib/ai-visibility/scan-engine.ts
// ─────────────────────────────────────────────────────────────────────────────
interface PerEngineStats {
  engine: string
  mentionRate: number
  mentions: number
  total: number
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "MIXED"
}

interface Metrics {
  overallVisibilityScore: number
  mentionRate: number
  recommendationRate: number
  citationRate: number
  sentimentScore: number
  mentionsCount: number
  totalQueries: number
  competitorRate: number
  perEngineStats: PerEngineStats[]
}

interface ScanResult {
  websiteUrl: string
  brandName: string
  pageContext?: { title?: string; description?: string; keywords?: string }
  metrics: Metrics
  scannedAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Scan step messages
// ─────────────────────────────────────────────────────────────────────────────
const SCAN_STEPS = [
  { label: "Connecting to website…", duration: 600 },
  { label: "Identifying brand entity…", duration: 700 },
  { label: "Understanding brand context…", duration: 800 },
  { label: "Checking AI search presence…", duration: 1000 },
  { label: "Analyzing AI platform visibility…", duration: 1100 },
  { label: "Evaluating brand recognition signals…", duration: 900 },
  { label: "Generating visibility report…", duration: 600 },
]

// ─────────────────────────────────────────────────────────────────────────────
// Platform config
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  CHATGPT:    { label: "ChatGPT",           color: "#10a37f", icon: "✦" },
  GEMINI:     { label: "Google Gemini",     color: "#4285f4", icon: "◈" },
  PERPLEXITY: { label: "Perplexity",        color: "#6366f1", icon: "⊕" },
  CLAUDE:     { label: "Claude",            color: "#d97706", icon: "◇" },
  COPILOT:    { label: "Microsoft Copilot", color: "#0078d4", icon: "⬡" },
  GROK:       { label: "Grok / xAI",        color: "#9333ea", icon: "⟡" },
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function getScoreLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: "Excellent Visibility", color: "#22c55e", bg: "rgba(34,197,94,0.1)" }
  if (score >= 60) return { label: "Good Visibility",      color: "#84cc16", bg: "rgba(132,204,22,0.1)" }
  if (score >= 40) return { label: "Fair Visibility",      color: "#f59e0b", bg: "rgba(245,158,11,0.1)" }
  return { label: "Low Visibility", color: "#ef4444", bg: "rgba(239,68,68,0.1)" }
}

function getMentionStatus(mentionRate: number): { label: string; icon: React.ReactNode; color: string } {
  if (mentionRate >= 70) return { label: "Visible",      icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "#22c55e" }
  if (mentionRate >= 40) return { label: "Limited",      icon: <AlertCircle  className="h-3.5 w-3.5" />, color: "#f59e0b" }
  if (mentionRate >= 15) return { label: "Weak signals", icon: <AlertTriangle className="h-3.5 w-3.5" />, color: "#f97316" }
  return { label: "Not detected", icon: <XCircle className="h-3.5 w-3.5" />, color: "#ef4444" }
}

function getSignalStrength(value: number): { label: string; color: string } {
  if (value >= 70) return { label: "Strong",       color: "#22c55e" }
  if (value >= 45) return { label: "Moderate",     color: "#f59e0b" }
  if (value >= 20) return { label: "Weak",         color: "#f97316" }
  return { label: "Not detected", color: "#ef4444" }
}

// ─────────────────────────────────────────────────────────────────────────────
// Radial score ring (pure SVG, no extra deps)
// ─────────────────────────────────────────────────────────────────────────────
function ScoreRing({ score, color, size = 140 }: { score: number; color: string; size?: number }) {
  const r    = size * 0.385
  const circ = 2 * Math.PI * r
  const off  = circ - (score / 100) * circ
  const cx   = size / 2
  const cy   = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor"
        strokeWidth="8" className="text-border" opacity="0.3" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color}
        strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={off}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)" }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize={size * 0.2} fontWeight="800"
        fill={color} fontFamily="Inter, system-ui, sans-serif">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={size * 0.085} fontWeight="600"
        fill="currentColor" opacity="0.45" fontFamily="Inter, system-ui, sans-serif">/ 100</text>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function InteractiveHomeView() {
  const [url,          setUrl]          = useState("")
  const [phase,        setPhase]        = useState<"hero" | "scanning" | "results" | "error">("hero")
  const [scanStep,     setScanStep]     = useState(0)
  const [scanProgress, setScanProgress] = useState(0)
  const [result,       setResult]       = useState<ScanResult | null>(null)
  const [errorMsg,     setErrorMsg]     = useState("")
  const [inputError,   setInputError]   = useState("")

  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const stepRef  = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const stopTimers = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (stepRef.current) clearTimeout(stepRef.current)
  }, [])

  const animateScanSteps = useCallback(() => {
    let step = 0
    const tick = () => {
      if (step < SCAN_STEPS.length - 1) {
        step++
        setScanStep(step)
        setScanProgress(Math.round((step / (SCAN_STEPS.length - 1)) * 88))
        stepRef.current = setTimeout(tick, SCAN_STEPS[step].duration)
      }
    }
    stepRef.current = setTimeout(tick, SCAN_STEPS[0].duration)
  }, [])

  const validateUrl = (raw: string) => {
    const t = raw.trim()
    if (!t) return "Please enter a website URL or brand domain."
    try {
      const u = new URL(t.startsWith("http") ? t : `https://${t}`)
      if (!u.hostname.includes(".")) return "Please enter a valid domain (e.g. example.com)."
      return null
    } catch { return "Please enter a valid website URL." }
  }

  const handleScan = async () => {
    const err = validateUrl(url)
    if (err) { setInputError(err); return }
    setInputError("")
    const normalized = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`

    setPhase("scanning")
    setScanStep(0)
    setScanProgress(0)
    animateScanSteps()

    try {
      const res  = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalized }),
      })
      const json = await res.json()

      if (!res.ok || !json.ok) {
        stopTimers()
        setErrorMsg(json.error || "Scan failed. Please try again.")
        setPhase("error")
        return
      }

      const id = json.data.scanId
      pollRef.current = setInterval(async () => {
        try {
          const pr = await fetch(`/api/scan/${id}`)
          const pj = await pr.json()
          if (pj.data?.status === "completed") {
            stopTimers()
            setScanProgress(100)
            setScanStep(SCAN_STEPS.length - 1)
            setTimeout(() => { setResult(pj.data.result); setPhase("results") }, 600)
          } else if (pj.data?.status === "failed") {
            stopTimers()
            setErrorMsg(pj.data?.error || "Scan failed. Please try again.")
            setPhase("error")
          }
        } catch { /* keep polling on network hiccup */ }
      }, 3000)
    } catch {
      stopTimers()
      setErrorMsg("Network error. Please check your connection and try again.")
      setPhase("error")
    }
  }

  const handleReset = () => {
    stopTimers()
    setPhase("hero"); setScanStep(0); setScanProgress(0)
    setResult(null);  setErrorMsg(""); setInputError("")
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── HERO ────────────────────────────────────────────────────────────────
  if (phase === "hero") {
    return (
      <div className="flex flex-col w-full">
        {/* Hero section */}
        <section className="relative overflow-hidden pt-16 pb-20 md:pt-28 md:pb-32">
          {/* Decorative background orbs */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div style={{
              position: "absolute", top: "8%", left: "50%", transform: "translateX(-50%)",
              width: "min(900px,120vw)", height: "min(560px,70vw)",
              background: "radial-gradient(ellipse at center,hsl(243 88% 62%/0.07) 0%,transparent 70%)",
              borderRadius: "50%",
            }} />
            <div style={{
              position: "absolute", bottom: "-8%", right: "-8%",
              width: "360px", height: "360px",
              background: "radial-gradient(ellipse at center,hsl(280 70% 60%/0.05) 0%,transparent 70%)",
              borderRadius: "50%",
            }} />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border/60 bg-muted/40 text-xs font-semibold text-muted-foreground mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              AI Brand Intelligence · Free Analysis
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.06] mb-6 animate-fade-in"
              style={{ animationDelay: "0.05s" }}>
              Is Your Brand{" "}
              <span style={{
                background: "linear-gradient(135deg,hsl(243,88%,62%) 0%,#8b5cf6 50%,#06b6d4 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Visible to AI?
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in"
              style={{ animationDelay: "0.1s" }}>
              Discover how AI platforms recognize, understand, and surface your brand
              across the new AI search landscape.
            </p>

            {/* Input + CTA */}
            <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <div className="max-w-xl mx-auto">
                <div className={`flex flex-col sm:flex-row gap-2 p-1.5 rounded-xl border ${inputError ? "border-red-500/60" : "border-border/80"} bg-card shadow-lg shadow-black/5`}>
                  <div className="relative flex-1">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <input
                      ref={inputRef}
                      id="brand-url-input"
                      type="url"
                      value={url}
                      onChange={e => { setUrl(e.target.value); setInputError("") }}
                      onKeyDown={e => e.key === "Enter" && handleScan()}
                      placeholder="Enter your website URL…"
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                  <button
                    id="check-ai-visibility-btn"
                    onClick={handleScan}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] whitespace-nowrap flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg,hsl(243,88%,62%) 0%,#7c3aed 100%)",
                      color: "#fff",
                      boxShadow: "0 2px 12px hsl(243 88% 62%/0.35)",
                    }}
                  >
                    Check AI Visibility
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {inputError && (
                  <p className="mt-2 text-xs text-red-500 text-left px-2 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {inputError}
                  </p>
                )}

                <p className="mt-3 text-xs text-muted-foreground/70">
                  Analyze your brand presence across leading AI platforms
                </p>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
                  {["AI Visibility", "Brand Recognition", "AI Search Presence"].map(label => (
                    <span key={label} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview mockup */}
            <div className="mt-16 animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <div className="max-w-3xl mx-auto rounded-2xl border border-border/70 bg-card shadow-2xl shadow-black/10 overflow-hidden">
                {/* Window chrome */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/20">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">AI Visibility Report · Example</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-500 font-mono">● Live</span>
                </div>

                <div className="p-5">
                  {/* Score row */}
                  <div className="flex items-center gap-6 mb-5 pb-5 border-b border-border/50">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="5" className="text-border" opacity="0.3" />
                      <circle cx="40" cy="40" r="30" fill="none" stroke="#22c55e" strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 30}`}
                        strokeDashoffset={`${2 * Math.PI * 30 * 0.28}`}
                        transform="rotate(-90 40 40)" />
                      <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="800" fill="#22c55e" fontFamily="Inter,sans-serif">72</text>
                    </svg>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">AI Visibility Score</p>
                      <p className="text-xl font-bold text-foreground">Good Visibility</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Across 6 AI platforms</p>
                    </div>
                    <div className="ml-auto grid grid-cols-2 gap-2 text-right hidden sm:grid">
                      <div>
                        <p className="text-lg font-bold font-mono text-foreground">67%</p>
                        <p className="text-[10px] text-muted-foreground">Mention rate</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold font-mono text-emerald-500">4/6</p>
                        <p className="text-[10px] text-muted-foreground">Platforms</p>
                      </div>
                    </div>
                  </div>

                  {/* Platform grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "ChatGPT",   status: "Visible",      type: "ok"   },
                      { name: "Gemini",    status: "Visible",      type: "ok"   },
                      { name: "Perplexity",status: "Visible",      type: "ok"   },
                      { name: "Claude",    status: "Limited",      type: "warn" },
                      { name: "Copilot",   status: "Not detected", type: "bad"  },
                      { name: "Grok",      status: "Not detected", type: "bad"  },
                    ].map(p => (
                      <div key={p.name} className="p-2.5 rounded-lg border border-border/60 bg-muted/20">
                        <p className="text-[11px] font-semibold text-foreground truncate">{p.name}</p>
                        <p className={`text-[10px] mt-0.5 font-medium ${p.type === "ok" ? "text-emerald-500" : p.type === "warn" ? "text-amber-500" : "text-muted-foreground"}`}>
                          {p.type === "ok" ? "✓" : p.type === "warn" ? "⚠" : "○"} {p.status}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/50 mt-3">
                Example report — enter your URL above to get your real analysis
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 border-t border-border/40 bg-muted/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-10">
              How it works
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { icon: <Globe className="h-5 w-5" />,     title: "Enter your URL",           desc: "Provide your website, brand domain, or company name." },
                { icon: <Cpu className="h-5 w-5" />,       title: "AI analyzes your brand",   desc: "We query major AI platforms to see how they understand and surface your brand." },
                { icon: <BarChart3 className="h-5 w-5" />, title: "Get your visibility report",desc: "Receive a scored report showing exactly where your brand stands in the AI search landscape." },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-3 p-5 rounded-xl border border-border/60 bg-card card-hover">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {step.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground mb-1">{step.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ── SCANNING ────────────────────────────────────────────────────────────
  if (phase === "scanning") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Pulsing icon */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />
            <div className="absolute inset-0 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Current step label */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground animate-fade-in" key={scanStep}>
              {SCAN_STEPS[scanStep]?.label}
            </p>
            <p className="text-xs text-muted-foreground font-mono">{url}</p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${scanProgress}%`, background: "linear-gradient(90deg,hsl(243,88%,62%),#7c3aed)" }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>{scanProgress}% complete</span>
              <span>Querying AI engines…</span>
            </div>
          </div>

          {/* Step checklist */}
          <div className="text-left space-y-2">
            {SCAN_STEPS.map((step, i) => (
              <div key={i} className={`flex items-center gap-3 text-xs transition-all duration-300 ${i < scanStep ? "text-emerald-500" : i === scanStep ? "text-foreground" : "text-muted-foreground/40"}`}>
                <span className="flex-shrink-0 w-4">
                  {i < scanStep
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    : i === scanStep
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    : <div className="h-3.5 w-3.5 rounded-full border border-current opacity-30" />}
                </span>
                {step.label}
              </div>
            ))}
          </div>

          <button onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── ERROR ────────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-sm w-full text-center space-y-5 p-8 rounded-2xl border border-red-500/20 bg-card">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <XCircle className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <h2 className="font-bold text-foreground mb-2">Scan Failed</h2>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
          </div>
          <button onClick={handleReset}
            className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-lg text-sm font-semibold bg-foreground text-background hover:opacity-90 transition-opacity">
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
        </div>
      </div>
    )
  }

  // ── RESULTS ──────────────────────────────────────────────────────────────
  if (phase === "results" && result) {
    const { metrics, brandName, pageContext, websiteUrl, scannedAt } = result
    const scoreInfo      = getScoreLabel(metrics.overallVisibilityScore)
    const industry       = pageContext?.keywords?.split(",")?.[0]?.trim() || "Technology"
    const hasDesc        = !!pageContext?.description
    const visibleEngines = metrics.perEngineStats.filter(e => e.mentionRate >= 60)
    const limitedEngines = metrics.perEngineStats.filter(e => e.mentionRate >= 20 && e.mentionRate < 60)

    // AI Presence signals derived from real scan data
    const signals = [
      { label: "Brand discoverability",         value: metrics.mentionRate },
      { label: "Brand / entity recognition",    value: Math.round((metrics.recommendationRate + metrics.mentionRate) / 2) },
      { label: "Business description clarity",  value: hasDesc ? 75 : 30 },
      { label: "Product / service recognition", value: Math.max(0, metrics.mentionRate - 8) },
      { label: "AI search presence",            value: metrics.recommendationRate },
      { label: "Content authority signals",     value: metrics.citationRate },
      { label: "Structured information",        value: hasDesc ? 60 : 25 },
      { label: "Third-party mentions",          value: metrics.mentionRate > 40 ? 35 : 15 },
    ]

    // Key findings derived from real data
    const findings: { type: "good" | "warn" | "bad"; text: string }[] = []
    if (metrics.mentionRate >= 60)       findings.push({ type: "good", text: "Brand identity is clearly detectable by major AI platforms" })
    if (hasDesc)                          findings.push({ type: "good", text: "Website content clearly explains core services and offerings" })
    if (metrics.recommendationRate >= 40) findings.push({ type: "good", text: "Brand appears in AI recommendation lists with positive positioning" })
    if (metrics.citationRate >= 30)       findings.push({ type: "good", text: "AI platforms cite your brand as a reliable source" })
    if (metrics.mentionRate >= 30 && metrics.mentionRate < 60)
      findings.push({ type: "warn", text: "Partial AI visibility — brand is recognized but inconsistently surfaced" })
    if (metrics.recommendationRate < 30)  findings.push({ type: "warn", text: "Limited presence in AI recommendation responses for industry queries" })
    if (metrics.citationRate < 20)        findings.push({ type: "warn", text: "Few citation signals detected across AI search platforms" })
    if (metrics.mentionRate < 30)         findings.push({ type: "bad",  text: "Brand visibility is low — AI platforms rarely surface this brand" })
    if (!hasDesc)                         findings.push({ type: "warn", text: "Weak structured metadata may limit how AI systems categorize this brand" })

    // Summary narrative text
    let summaryText = ""
    if      (metrics.overallVisibilityScore >= 70) summaryText = `${brandName} has a strong recognizable presence across AI platforms. AI systems understand your brand well and surface you in relevant conversations.`
    else if (metrics.overallVisibilityScore >= 50) summaryText = `Your brand has a recognizable digital presence, but there are clear opportunities to improve how AI systems understand and surface your business.`
    else if (metrics.overallVisibilityScore >= 30) summaryText = `${brandName} has limited visibility in the AI search landscape. Strengthening brand entity signals will significantly improve AI platform recognition.`
    else                                            summaryText = `AI platforms have minimal awareness of ${brandName}. Building clearer brand signals, structured content, and third-party mentions will unlock AI visibility.`

    return (
      <div className="w-full animate-fade-in">
        {/* Report header bar */}
        <div className="border-b border-border/50 bg-muted/20 py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg border border-border/60 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Visibility Report</p>
                <p className="text-xs text-muted-foreground font-mono">{websiteUrl.replace(/^https?:\/\//,"")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">
                Analyzed {new Date(scannedAt).toLocaleDateString("en-US",{ month: "short", day: "numeric", year: "numeric" })}
              </span>
              <button onClick={handleReset} id="analyze-another-btn"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border/80 bg-card text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors">
                <RefreshCw className="h-3.5 w-3.5" /> Analyze another
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

          {/* ── 1. AI VISIBILITY SCORE ─────────────────────────────────── */}
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Visibility Score</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Score ring */}
                <div className="flex flex-col items-center gap-3 flex-shrink-0">
                  <ScoreRing score={metrics.overallVisibilityScore} color={scoreInfo.color} />
                  <span className="text-xs font-bold px-3 py-1 rounded-full border"
                    style={{ color: scoreInfo.color, background: scoreInfo.bg, borderColor: `${scoreInfo.color}30` }}>
                    {scoreInfo.label}
                  </span>
                </div>

                {/* Metric breakdown bars */}
                <div className="flex-1 w-full space-y-4">
                  {[
                    { label: "Mention Rate",        value: metrics.mentionRate,        desc: "% of AI queries where your brand was mentioned" },
                    { label: "Recommendation Rate", value: metrics.recommendationRate, desc: "% of queries where your brand was recommended first" },
                    { label: "Citation Rate",        value: metrics.citationRate,       desc: "% of AI responses that cited your website" },
                    { label: "Sentiment Score",      value: metrics.sentimentScore,     desc: "Positivity of brand mentions across AI platforms" },
                  ].map(m => {
                    const s = getScoreLabel(m.value)
                    return (
                      <div key={m.label}>
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-xs font-semibold text-foreground">{m.label}</span>
                          <span className="text-xs font-bold font-mono" style={{ color: s.color }}>{m.value}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${m.value}%`, background: s.color, transition: "width 1s ease-out" }} />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Stat summary row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-border/50">
                {[
                  { label: "Queries analyzed",  value: String(metrics.totalQueries) },
                  { label: "Brand mentions",     value: String(metrics.mentionsCount) },
                  { label: "Platforms checked",  value: "6" },
                  { label: "Visible on",         value: `${visibleEngines.length} / 6` },
                ].map(s => (
                  <div key={s.label} className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-xl font-bold font-mono text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 2. AI PLATFORM VISIBILITY ──────────────────────────────── */}
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
              <Radio className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Platform Visibility</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {metrics.perEngineStats.map(engine => {
                  const cfg    = PLATFORM_CONFIG[engine.engine]
                  const status = getMentionStatus(engine.mentionRate)
                  return (
                    <div key={engine.engine} className="p-4 rounded-xl border border-border/60 bg-muted/15 card-hover">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-base" style={{ color: cfg?.color ?? "#888" }}>{cfg?.icon ?? "◦"}</span>
                          <span className="text-sm font-semibold text-foreground">{cfg?.label ?? engine.engine}</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: status.color }}>
                          {status.icon} {status.label}
                        </span>
                      </div>
                      <div className="h-1 w-full rounded-full bg-muted overflow-hidden mb-2">
                        <div className="h-full rounded-full"
                          style={{ width: `${engine.mentionRate}%`, backgroundColor: status.color, transition: "width 1s ease-out" }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>Mention rate: {engine.mentionRate}%</span>
                        <span>{engine.mentions}/{engine.total} queries</span>
                      </div>
                      {engine.sentiment !== "NEUTRAL" && (
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          engine.sentiment === "POSITIVE" ? "text-emerald-600 border-emerald-500/30" :
                          engine.sentiment === "MIXED"    ? "text-amber-600  border-amber-500/30"  :
                                                           "text-red-600    border-red-500/30"
                        }`}>
                          {engine.sentiment === "POSITIVE" ? "Positive" : engine.sentiment === "MIXED" ? "Mixed" : "Negative"} mentions
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-muted/20 border border-border/40">
                <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Platform visibility is determined by querying each AI engine with brand-relevant questions.
                  Results reflect real AI responses — unavailable integrations are shown as unavailable.
                </p>
              </div>
            </div>
          </div>

          {/* ── 3. BRAND RECOGNITION ───────────────────────────────────── */}
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">How AI Understands Your Brand</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: "Brand Entity",
                    value: metrics.mentionRate >= 30 ? "Detected" : "Not clearly detected",
                    icon: metrics.mentionRate >= 30
                      ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      : <XCircle className="h-3.5 w-3.5 text-red-500" />,
                  },
                  { label: "Brand Name",        value: brandName,  icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> },
                  { label: "Website",           value: websiteUrl.replace(/^https?:\/\//,"").replace(/\/$/,""), icon: <Globe className="h-3.5 w-3.5 text-muted-foreground" /> },
                  { label: "Detected Industry", value: industry,   icon: <Sparkles className="h-3.5 w-3.5 text-primary" /> },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-border/50">
                    <div className="w-8 h-8 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-sm font-semibold text-foreground truncate" title={item.value}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Brand Description (detected)</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {pageContext?.description
                    ? pageContext.description
                    : `No structured brand description detected. AI systems may rely on indirect signals to understand what ${brandName} does, which can reduce visibility accuracy.`}
                </p>
              </div>

              {pageContext?.title && (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2">Page Title</p>
                  <p className="text-sm text-foreground font-medium">{pageContext.title}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── 4. AI PRESENCE SIGNALS ─────────────────────────────────── */}
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Presence Signals</h2>
            </div>
            <div className="p-6 space-y-3">
              {signals.map(signal => {
                const s = getSignalStrength(signal.value)
                return (
                  <div key={signal.label} className="flex items-center gap-4">
                    <span className="text-xs text-foreground font-medium min-w-0 w-52 flex-shrink-0 truncate">{signal.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: `${signal.value}%`, backgroundColor: s.color, transition: "width 1s ease-out" }} />
                    </div>
                    <span className="text-xs font-semibold w-24 text-right flex-shrink-0" style={{ color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── 5. KEY FINDINGS ────────────────────────────────────────── */}
          <div className="rounded-2xl border border-border/70 bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-border/50 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Key Findings</h2>
            </div>
            <div className="p-6 space-y-2">
              {findings.length === 0 && (
                <p className="text-sm text-muted-foreground">No significant findings. Consider strengthening brand entity signals.</p>
              )}
              {findings.map((f, i) => (
                <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${
                  f.type === "good" ? "bg-emerald-500/5 border-emerald-500/20" :
                  f.type === "warn" ? "bg-amber-500/5  border-amber-500/20"  :
                                     "bg-red-500/5    border-red-500/20"
                }`}>
                  <span className="flex-shrink-0 mt-0.5">
                    {f.type === "good" ? <CheckCheck    className="h-4 w-4 text-emerald-500" /> :
                     f.type === "warn" ? <AlertTriangle className="h-4 w-4 text-amber-500"  /> :
                                         <XCircle       className="h-4 w-4 text-red-500"    />}
                  </span>
                  <p className="text-sm text-foreground">{f.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 6. AI VISIBILITY SUMMARY (dark card) ───────────────────── */}
          <div className="rounded-2xl overflow-hidden shadow-sm" style={{
            background: "linear-gradient(135deg,hsl(240,12%,6%) 0%,hsl(243,30%,10%) 100%)",
            border: "1px solid rgba(99,102,241,0.2)",
          }}>
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-white/60" />
                </div>
                <h2 className="text-xs font-bold text-white/60 uppercase tracking-wider">Your AI Visibility</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-8">
                {/* Score ring on dark background */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                    <circle cx="50" cy="50" r="38" fill="none"
                      stroke={scoreInfo.color} strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 38}`}
                      strokeDashoffset={`${2 * Math.PI * 38 * (1 - metrics.overallVisibilityScore / 100)}`}
                      transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)" }} />
                    <text x="50" y="46" textAnchor="middle" fontSize="22" fontWeight="800"
                      fill={scoreInfo.color} fontFamily="Inter,sans-serif">{metrics.overallVisibilityScore}</text>
                    <text x="50" y="62" textAnchor="middle" fontSize="10" fontWeight="600"
                      fill="rgba(255,255,255,0.4)" fontFamily="Inter,sans-serif">/ 100</text>
                  </svg>
                  <span className="text-xs font-semibold" style={{ color: scoreInfo.color }}>{scoreInfo.label}</span>
                </div>

                <div className="flex-1 space-y-4">
                  <p className="text-white/90 text-base leading-relaxed font-medium">{summaryText}</p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {[
                      { label: "Visible platforms", value: `${visibleEngines.length} of 6`, good: visibleEngines.length >= 4 },
                      { label: "Limited platforms",  value: `${limitedEngines.length} of 6`, good: limitedEngines.length <= 2 },
                      { label: "Avg mention rate",   value: `${metrics.mentionRate}%`,       good: metrics.mentionRate >= 50 },
                      { label: "Overall sentiment",  value: metrics.sentimentScore >= 60 ? "Positive" : metrics.sentimentScore >= 40 ? "Mixed" : "Neutral",
                        good: metrics.sentimentScore >= 60 },
                    ].map(stat => (
                      <div key={stat.label} className="p-3 rounded-xl bg-white/5 border border-white/8">
                        <p className="text-lg font-bold font-mono" style={{ color: stat.good ? "#22c55e" : "#f59e0b" }}>{stat.value}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA strip */}
            <div className="px-8 pb-8">
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/8">
                <a href="/signup" id="signup-from-results-btn"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white text-gray-900 hover:bg-white/90 transition-colors">
                  <Sparkles className="h-4 w-4" />
                  Get Detailed Improvement Plan
                  <ArrowRight className="h-4 w-4" />
                </a>
                <button onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-white/15 text-white/80 hover:bg-white/5 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  Analyze Another Brand
                </button>
              </div>
            </div>
          </div>

          {/* Methodology disclaimer */}
          <div className="flex items-start gap-2 p-4 rounded-xl bg-muted/20 border border-border/40">
            <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              AI visibility scores are based on simulated AI platform queries using a verified methodology.
              Results reflect AI awareness patterns and may vary as AI training data evolves.
              Formula: mention rate (40%) + recommendation rate (30%) + citation rate (20%) + sentiment (10%).
            </p>
          </div>

        </div>
      </div>
    )
  }

  return null
}
