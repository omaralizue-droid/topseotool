"use client"
import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Globe,
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Brain,
  Zap,
  BarChart3,
  LinkIcon,
  TrendingUp,
  Star,
  AlertCircle,
  RefreshCw,
  Eye,
  MessageSquare,
  Shield,
} from "lucide-react"
import Link from "next/link"
import { useScanPolling, PublicScanResult } from "@/hooks/use-scan-polling"

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const ENGINE_META: Record<string, { label: string; icon: string; color: string; bg: string; tagline: string }> = {
  CHATGPT: { label: "ChatGPT", icon: "🤖", color: "#10a37f", bg: "#0d0d0d", tagline: "OpenAI" },
  GEMINI: { label: "Gemini", icon: "✨", color: "#4285f4", bg: "#1a1a2e", tagline: "Google" },
  PERPLEXITY: { label: "Perplexity", icon: "🔍", color: "#a855f7", bg: "#1a0a2e", tagline: "Perplexity AI" },
  CLAUDE: { label: "Claude", icon: "🧠", color: "#d97706", bg: "#1c1200", tagline: "Anthropic" },
  COPILOT: { label: "Copilot", icon: "🛡️", color: "#0078d4", bg: "#001828", tagline: "Microsoft" },
  GROK: { label: "Grok", icon: "⚡", color: "#ef4444", bg: "#1a0000", tagline: "xAI" },
}

const SCAN_STEPS = [
  { engine: "CHATGPT", label: "Querying ChatGPT..." },
  { engine: "GEMINI", label: "Querying Gemini..." },
  { engine: "PERPLEXITY", label: "Querying Perplexity..." },
  { engine: "CLAUDE", label: "Querying Claude..." },
  { engine: "COPILOT", label: "Querying Copilot..." },
  { engine: "GROK", label: "Querying Grok..." },
]

const SCORE_COLOR = (score: number) =>
  score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444"

const SCORE_LABEL = (score: number) =>
  score >= 70 ? "Strong Visibility" : score >= 40 ? "Moderate Visibility" : "Low Visibility"

// ─────────────────────────────────────────────────────────────────────────────
// Score Gauge Component
// ─────────────────────────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const color = SCORE_COLOR(score)
  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <motion.circle
          cx="70"
          cy="70"
          r="54"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      </svg>
      <div className="absolute text-center">
        <motion.div
          className="text-4xl font-black"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}
        </motion.div>
        <div className="text-xs text-white/50 uppercase tracking-widest">/ 100</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Engine Card Component
// ─────────────────────────────────────────────────────────────────────────────
function EngineCard({
  engine,
  stats,
  results,
  index,
}: {
  engine: string
  stats: { mentionRate: number; mentions: number; total: number; sentiment: string }
  results: PublicScanResult["results"]
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = ENGINE_META[engine] ?? { label: engine, icon: "🤖", color: "#888", bg: "#111", tagline: "" }
  const engineResults = results.filter((r) => r.engine === engine)
  const mentioned = stats.mentions > 0
  const topResult = engineResults.find((r) => r.brandMentioned || r.domainMentioned) ?? engineResults[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: `${meta.color}30`, background: `${meta.bg}cc` }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.icon}</span>
            <div>
              <p className="font-bold text-white">{meta.label}</p>
              <p className="text-xs" style={{ color: meta.color }}>{meta.tagline}</p>
            </div>
          </div>
          <div className="text-right">
            {mentioned ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#22c55e20", color: "#22c55e" }}>
                <CheckCircle2 size={12} /> Mentioned
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#ef444420", color: "#ef4444" }}>
                <XCircle size={12} /> Not Found
              </div>
            )}
          </div>
        </div>

        {/* Mention rate bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/50 mb-1.5">
            <span>Mention Rate</span>
            <span style={{ color: meta.color }} className="font-bold">{stats.mentionRate}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: meta.color }}
              initial={{ width: 0 }}
              animate={{ width: `${stats.mentionRate}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 + index * 0.1 }}
            />
          </div>
        </div>

        {/* Sentiment */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">Sentiment</span>
          <span
            className="font-medium px-2 py-0.5 rounded-full text-xs"
            style={{
              background: stats.sentiment === "POSITIVE" ? "#22c55e20" : stats.sentiment === "NEGATIVE" ? "#ef444420" : "#f59e0b20",
              color: stats.sentiment === "POSITIVE" ? "#22c55e" : stats.sentiment === "NEGATIVE" ? "#ef4444" : "#f59e0b",
            }}
          >
            {stats.sentiment}
          </span>
        </div>
      </div>

      {/* Expandable response */}
      {topResult && (
        <>
          <div className="border-t px-5 py-2" style={{ borderColor: `${meta.color}20` }}>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors w-full"
            >
              <Eye size={11} />
              {expanded ? "Hide" : "View"} AI response
              <ArrowRight size={11} className={`ml-auto transition-transform ${expanded ? "rotate-90" : ""}`} />
            </button>
          </div>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <div className="rounded-xl p-4 text-xs leading-relaxed text-white/60 font-mono bg-white/5 border border-white/10 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {topResult.response}
                  </div>
                  {topResult.citedUrls.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-white/30 mb-2 flex items-center gap-1"><LinkIcon size={10} /> Citations</p>
                      <div className="flex flex-wrap gap-2">
                        {topResult.citedUrls.slice(0, 4).map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors truncate max-w-[200px]"
                          >
                            {url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Results Panel
// ─────────────────────────────────────────────────────────────────────────────
function ResultsPanel({ result, onReset }: { result: PublicScanResult; onReset: () => void }) {
  const { metrics, results } = result
  const score = metrics.overallVisibilityScore

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
          style={{ background: "#22c55e15", color: "#22c55e", border: "1px solid #22c55e30" }}
        >
          <CheckCircle2 size={14} /> Scan Complete for {result.brandName}
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
          AI Visibility Report
        </h2>
        {result.pageContext?.title && (
          <p className="text-white/40 text-sm">{result.pageContext.title}</p>
        )}
      </div>

      {/* Overall Score + Metrics */}
      <div className="grid md:grid-cols-2 gap-6 items-center">
        <div
          className="rounded-2xl p-8 text-center border"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)", borderColor: "rgba(99,102,241,0.2)" }}
        >
          <p className="text-white/50 text-sm uppercase tracking-widest mb-4">Overall AI Visibility Score</p>
          <ScoreGauge score={score} />
          <p className="mt-4 font-bold text-lg" style={{ color: SCORE_COLOR(score) }}>
            {SCORE_LABEL(score)}
          </p>
          <p className="text-white/30 text-xs mt-1">Across 6 AI engines</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Mention Rate", value: `${metrics.mentionRate}%`, icon: <Eye size={16} />, color: "#6366f1" },
            { label: "Top Placement", value: `${metrics.recommendationRate}%`, icon: <Star size={16} />, color: "#f59e0b" },
            { label: "Citation Rate", value: `${metrics.citationRate}%`, icon: <LinkIcon size={16} />, color: "#22c55e" },
            { label: "Sentiment Score", value: `${metrics.sentimentScore}%`, icon: <MessageSquare size={16} />, color: "#a855f7" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="rounded-xl p-4 border"
              style={{ background: `${stat.color}10`, borderColor: `${stat.color}25` }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: stat.color }}>
                {stat.icon}
                <span className="text-xs font-medium text-white/50">{stat.label}</span>
              </div>
              <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Per-Engine Breakdown */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Brain size={18} className="text-violet-400" />
          Engine-by-Engine Breakdown
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.perEngineStats.map((stat, i) => (
            <EngineCard
              key={stat.engine}
              engine={stat.engine}
              stats={stat}
              results={results}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Queries Tested */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Search size={18} className="text-blue-400" />
          Queries Tested ({result.queries.length})
        </h3>
        <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
          {result.queries.map((query, i) => {
            const queryResults = results.filter((r) => r.query === query)
            const mentionedCount = queryResults.filter((r) => r.brandMentioned || r.domainMentioned).length
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-3.5 bg-white/2 hover:bg-white/5 transition-colors"
              >
                <span className="text-white/20 font-mono text-sm w-6 shrink-0">{i + 1}</span>
                <p className="text-sm text-white/70 flex-1 min-w-0">&ldquo;{query}&rdquo;</p>
                <div className="flex items-center gap-1 shrink-0">
                  {queryResults.slice(0, 6).map((r) => {
                    const meta = ENGINE_META[r.engine]
                    const hit = r.brandMentioned || r.domainMentioned
                    return (
                      <span
                        key={r.engine}
                        title={`${meta?.label ?? r.engine}: ${hit ? "Mentioned" : "Not found"}`}
                        className="text-base"
                        style={{ opacity: hit ? 1 : 0.2 }}
                      >
                        {meta?.icon ?? "?"}
                      </span>
                    )
                  })}
                </div>
                <span className="text-xs font-medium shrink-0" style={{ color: mentionedCount > 3 ? "#22c55e" : mentionedCount > 0 ? "#f59e0b" : "#ef4444" }}>
                  {mentionedCount}/{queryResults.length}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-8 text-center"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)", border: "1px solid rgba(99,102,241,0.3)" }}
      >
        <TrendingUp size={32} className="mx-auto mb-4 text-violet-400" />
        <h3 className="text-xl font-bold text-white mb-2">Track Your AI Visibility Over Time</h3>
        <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
          Monitor daily changes, set alerts for competitor mentions, and get AI-powered recommendations to improve your score.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-100"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            Start Free Monitoring →
          </Link>
          <button
            onClick={onReset}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70 transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} /> Scan Another URL
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Scanning Animation
// ─────────────────────────────────────────────────────────────────────────────
function ScanningState({ url, elapsedSeconds }: { url: string; elapsedSeconds: number }) {
  const stepIndex = Math.min(Math.floor(elapsedSeconds / 3), SCAN_STEPS.length - 1)

  return (
    <div className="text-center py-12 space-y-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 0 40px rgba(99,102,241,0.4)" }}
      >
        <Brain size={28} className="text-white" />
      </motion.div>

      <div>
        <h3 className="text-xl font-bold text-white mb-2">Scanning AI Engines</h3>
        <p className="text-white/40 text-sm">Analyzing <span className="text-white/70 font-medium">{url}</span></p>
      </div>

      <div className="max-w-sm mx-auto space-y-3">
        {SCAN_STEPS.map((step, i) => {
          const meta = ENGINE_META[step.engine]
          const isDone = i < stepIndex
          const isActive = i === stepIndex
          return (
            <motion.div
              key={step.engine}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{
                borderColor: isActive ? `${meta.color}50` : isDone ? `${meta.color}25` : "rgba(255,255,255,0.05)",
                background: isActive ? `${meta.color}12` : "rgba(255,255,255,0.02)",
              }}
            >
              <span className="text-lg">{meta.icon}</span>
              <span className="text-sm flex-1 text-left" style={{ color: isActive ? "white" : isDone ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)" }}>
                {isDone ? `${meta.label} — Done` : isActive ? step.label : meta.label}
              </span>
              {isDone ? (
                <CheckCircle2 size={14} style={{ color: meta.color }} />
              ) : isActive ? (
                <Loader2 size={14} className="animate-spin" style={{ color: meta.color }} />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-white/10" />
              )}
            </motion.div>
          )
        })}
      </div>

      <p className="text-white/30 text-xs">{elapsedSeconds}s elapsed · This usually takes 15–30 seconds</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AIVisibilityCheckerPage() {
  const [inputUrl, setInputUrl] = useState("")
  const [submittedUrl, setSubmittedUrl] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { status, result, error, elapsedSeconds, startScan, reset } = useScanPolling()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = inputUrl.trim()
    if (!url) return
    setSubmittedUrl(url)
    await startScan(url)
  }

  const handleReset = () => {
    reset()
    setInputUrl("")
    setSubmittedUrl("")
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, #020205 60%)" }}
    >

      <div className="max-w-4xl mx-auto px-6 py-16">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider"
                style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}
              >
                <Brain size={12} /> Free AI Visibility Scanner
              </motion.div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                  Is Your Brand Visible
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)" }}
                  >
                    Across AI Tools?
                  </span>
                </h1>
                <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
                  Enter your website URL and discover exactly where — and how — your brand appears when users ask ChatGPT, Gemini, Perplexity, Claude, Copilot & Grok.
                </p>
              </div>

              {/* Engine logos */}
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {Object.entries(ENGINE_META).map(([key, meta]) => (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border"
                    style={{ background: `${meta.color}10`, borderColor: `${meta.color}25`, color: `${meta.color}` }}
                  >
                    <span>{meta.icon}</span> {meta.label}
                  </div>
                ))}
              </div>

              {/* URL Input */}
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div
                  className="flex items-center gap-3 p-2 rounded-2xl border"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.1)",
                    boxShadow: "0 0 60px rgba(99,102,241,0.1)",
                  }}
                >
                  <Globe size={18} className="ml-3 text-white/30 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="Enter your website URL (e.g. stripe.com)"
                    className="flex-1 bg-transparent text-white placeholder-white/25 text-sm outline-none py-3"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!inputUrl.trim()}
                    className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:scale-105 active:scale-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 shrink-0"
                    style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                  >
                    <Search size={14} />
                    Scan Now
                  </button>
                </div>
              </form>

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-8 text-xs text-white/25 flex-wrap">
                <span className="flex items-center gap-1.5"><Shield size={11} /> No login required</span>
                <span className="flex items-center gap-1.5"><Zap size={11} /> Results in ~20 seconds</span>
                <span className="flex items-center gap-1.5"><BarChart3 size={11} /> 6 AI engines tested</span>
              </div>

              {/* Example URLs */}
              <div className="text-xs text-white/30 space-y-2">
                <p>Try an example:</p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {["stripe.com", "notion.so", "vercel.com", "shopify.com"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => setInputUrl(ex)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 hover:text-white/50 transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {status === "running" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ScanningState url={submittedUrl} elapsedSeconds={elapsedSeconds} />
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-4"
            >
              <AlertCircle size={48} className="mx-auto text-red-400" />
              <h3 className="text-xl font-bold text-white">Scan Failed</h3>
              <p className="text-white/40 text-sm max-w-sm mx-auto">
                {error ?? "We couldn't complete the scan. The website may be unreachable or you may have hit the rate limit."}
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-3 rounded-xl font-semibold text-sm text-white border border-white/20 hover:border-white/30 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw size={14} /> Try Again
              </button>
            </motion.div>
          )}

          {status === "completed" && result && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ResultsPanel result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
