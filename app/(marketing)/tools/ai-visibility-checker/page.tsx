"use client"
import { useState, useRef, useEffect } from "react"
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
  Swords,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  Cpu,
  Flame,
  Layers,
  Terminal,
} from "lucide-react"
import Link from "next/link"
import { useScanPolling, PublicScanResult } from "@/hooks/use-scan-polling"

// ─────────────────────────────────────────────────────────────────────────────
// Engine Meta
// ─────────────────────────────────────────────────────────────────────────────
const ENGINE_META: Record<string, { label: string; icon: string; color: string; bg: string; tagline: string }> = {
  CHATGPT: { label: "ChatGPT", icon: "🤖", color: "#10a37f", bg: "#0d0d0d", tagline: "OpenAI GPT-4o" },
  GEMINI: { label: "Gemini", icon: "✨", color: "#4285f4", bg: "#1a1a2e", tagline: "Google 2.5 Flash" },
  PERPLEXITY: { label: "Perplexity", icon: "🔍", color: "#a855f7", bg: "#1a0a2e", tagline: "Perplexity Pro" },
  CLAUDE: { label: "Claude", icon: "🧠", color: "#d97706", bg: "#1c1200", tagline: "Anthropic 3.5 Sonnet" },
  COPILOT: { label: "Copilot", icon: "🛡️", color: "#0078d4", bg: "#001828", tagline: "Microsoft Copilot" },
  GROK: { label: "Grok", icon: "⚡", color: "#ef4444", bg: "#1a0000", tagline: "xAI Grok-2" },
}

const SCORE_COLOR = (score: number) =>
  score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444"

const SCORE_LABEL = (score: number) =>
  score >= 70 ? "Dominant Authority" : score >= 40 ? "Emerging Visibility" : "Low Citation Share"

// ─────────────────────────────────────────────────────────────────────────────
// Circular Score Gauge
// ─────────────────────────────────────────────────────────────────────────────
function ScoreGauge({ score, size = 140, label = "AI Visibility" }: { score: number; size?: number; label?: string }) {
  const color = SCORE_COLOR(score)
  const r = (size - 24) / 2
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference - (score / 100) * circumference

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.div
          className="font-black tracking-tight"
          style={{ color, fontSize: size * 0.26 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {score}
        </motion.div>
        <div className="text-[10px] text-white/40 uppercase font-mono tracking-widest">{label}</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Spider/Radar Chart for Engine Dominance
// ─────────────────────────────────────────────────────────────────────────────
function EngineRadarChart({
  primaryStats,
  competitorStats,
  primaryName,
  competitorName,
}: {
  primaryStats: Array<{ engine: string; mentionRate: number }>
  competitorStats?: Array<{ engine: string; mentionRate: number }>
  primaryName: string
  competitorName?: string
}) {
  const engines = ["CHATGPT", "GEMINI", "PERPLEXITY", "CLAUDE", "COPILOT", "GROK"]
  const size = 260
  const center = size / 2
  const radius = 90

  const getCoordinates = (index: number, total: number, valuePercent: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2
    const r = (valuePercent / 100) * radius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  const primaryPoints = engines
    .map((eng, i) => {
      const val = primaryStats.find((s) => s.engine === eng)?.mentionRate ?? 20
      const { x, y } = getCoordinates(i, engines.length, Math.max(val, 15))
      return `${x},${y}`
    })
    .join(" ")

  const compPoints = competitorStats
    ? engines
        .map((eng, i) => {
          const val = competitorStats.find((s) => s.engine === eng)?.mentionRate ?? 20
          const { x, y } = getCoordinates(i, engines.length, Math.max(val, 15))
          return `${x},${y}`
        })
        .join(" ")
    : null

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Radar concentric rings */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <polygon
            key={i}
            points={engines
              .map((_, idx) => {
                const { x, y } = getCoordinates(idx, engines.length, scale * 100)
                return `${x},${y}`
              })
              .join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        {engines.map((_, i) => {
          const { x, y } = getCoordinates(i, engines.length, 100)
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        })}

        {/* Competitor Shape */}
        {compPoints && (
          <motion.polygon
            points={compPoints}
            fill="rgba(239, 68, 68, 0.2)"
            stroke="#ef4444"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
        )}

        {/* Primary Shape */}
        <motion.polygon
          points={primaryPoints}
          fill="rgba(99, 102, 241, 0.35)"
          stroke="#6366f1"
          strokeWidth="2.5"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Engine Labels */}
        {engines.map((eng, i) => {
          const { x, y } = getCoordinates(i, engines.length, 122)
          const meta = ENGINE_META[eng]
          return (
            <text
              key={eng}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-mono fill-white/60 font-semibold"
            >
              {meta.icon} {meta.label}
            </text>
          )
        })}
      </svg>

      <div className="flex items-center gap-4 mt-2 text-xs font-mono">
        <span className="flex items-center gap-1.5 text-indigo-400">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> {primaryName}
        </span>
        {competitorName && (
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> {competitorName}
          </span>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Engine Card
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl border overflow-hidden backdrop-blur-md transition-all hover:border-white/20"
      style={{ borderColor: `${meta.color}35`, background: `linear-gradient(180deg, ${meta.bg}cc 0%, #080810 100%)` }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border border-white/10" style={{ background: `${meta.color}15` }}>
              {meta.icon}
            </div>
            <div>
              <p className="font-bold text-white tracking-tight">{meta.label}</p>
              <p className="text-[11px] font-mono" style={{ color: meta.color }}>{meta.tagline}</p>
            </div>
          </div>
          <div className="text-right">
            {mentioned ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#22c55e20", color: "#22c55e", border: "1px solid #22c55e40" }}>
                <CheckCircle2 size={12} /> Mentioned
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444430" }}>
                <XCircle size={12} /> Not Cited
              </span>
            )}
          </div>
        </div>

        {/* Mention Rate Progress */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-white/40">AI Mention Frequency</span>
            <span style={{ color: meta.color }} className="font-bold">{stats.mentionRate}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: meta.color }}
              initial={{ width: 0 }}
              animate={{ width: `${stats.mentionRate}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 + index * 0.08 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
          <span className="text-white/40">Perceived Sentiment</span>
          <span
            className="font-medium px-2 py-0.5 rounded-full text-xs font-mono"
            style={{
              background: stats.sentiment === "POSITIVE" ? "#22c55e15" : stats.sentiment === "NEGATIVE" ? "#ef444415" : "#f59e0b15",
              color: stats.sentiment === "POSITIVE" ? "#22c55e" : stats.sentiment === "NEGATIVE" ? "#ef4444" : "#f59e0b",
            }}
          >
            {stats.sentiment}
          </span>
        </div>
      </div>

      {topResult && (
        <div className="border-t border-white/5 bg-white/[0.02]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full px-5 py-2.5 text-xs text-white/50 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-1.5 font-mono"><Eye size={12} /> {expanded ? "Hide LLM Context" : "Inspect Raw LLM Response"}</span>
            <ArrowRight size={12} className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5 overflow-hidden"
              >
                <div className="rounded-xl p-4 text-xs font-mono leading-relaxed text-white/70 bg-black/60 border border-white/10 max-h-52 overflow-y-auto whitespace-pre-wrap selection:bg-indigo-500">
                  {topResult.response}
                </div>
                {topResult.citedUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-mono text-white/40 mb-1.5 flex items-center gap-1"><LinkIcon size={10} /> Extracted Citations</p>
                    <div className="flex flex-wrap gap-1.5">
                      {topResult.citedUrls.slice(0, 3).map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/50 hover:text-indigo-300 hover:border-indigo-400/40 transition-colors truncate max-w-[200px]"
                        >
                          {url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Results Panel
// ─────────────────────────────────────────────────────────────────────────────
function ResultsPanel({ result, onReset }: { result: PublicScanResult; onReset: () => void }) {
  const [activeTab, setActiveTab] = useState<"breakdown" | "arena" | "playbook" | "llmstxt">("breakdown")
  const [copiedTxt, setCopiedTxt] = useState(false)
  const [copiedSchema, setCopiedSchema] = useState(false)
  const [copiedShare, setCopiedShare] = useState(false)

  const { metrics, competitorMetrics, battleSummary, aeoPlaybook, results } = result
  const isBattle = Boolean(result.competitorBrand && competitorMetrics)

  const handleCopyTxt = () => {
    navigator.clipboard.writeText(aeoPlaybook.llmsTxtContent)
    setCopiedTxt(true)
    setTimeout(() => setCopiedTxt(false), 2000)
  }

  const handleDownloadTxt = () => {
    const blob = new Blob([aeoPlaybook.llmsTxtContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "llms.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopySchema = () => {
    navigator.clipboard.writeText(aeoPlaybook.schemaMarkupSnippet)
    setCopiedSchema(true)
    setTimeout(() => setCopiedSchema(false), 2000)
  }

  const shareText = `Our brand ${result.brandName} scored ${metrics.overallVisibilityScore}/100 in AI Search Visibility across ChatGPT, Gemini & Perplexity! 🚀 Audit your brand with TOPSEOTOOL:`
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent("https://topseotool.net/tools/ai-visibility-checker")}`

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Top Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-semibold" style={{ background: "#22c55e15", color: "#22c55e", border: "1px solid #22c55e40" }}>
          <Sparkles size={12} /> AI Search Intelligence Verified · {new Date(result.scannedAt).toLocaleDateString()}
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          {isBattle ? `${result.brandName} vs ${result.competitorBrand}` : result.brandName}
        </h2>
        <p className="text-sm text-white/50 font-mono">
          {result.pageContext?.title ?? result.websiteUrl}
        </p>
      </div>

      {/* Battle Showdown Hero (If Battle Mode) */}
      {isBattle && battleSummary && competitorMetrics && (
        <div
          className="rounded-3xl p-6 md:p-8 border relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(239,68,68,0.12) 100%)", borderColor: "rgba(255,255,255,0.15)" }}
        >
          <div className="absolute top-0 right-0 p-4">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-bold bg-white/10 text-white/80 border border-white/10">
              ⚔️ AI Arena Battle
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Primary Brand */}
            <div className="text-center md:text-left space-y-2">
              <span className="text-xs font-mono text-indigo-400 uppercase font-bold tracking-widest">Primary Brand</span>
              <h3 className="text-2xl font-black text-white">{result.brandName}</h3>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <ScoreGauge score={metrics.overallVisibilityScore} size={90} label="Score" />
                <div className="text-left font-mono text-xs text-white/60 space-y-1">
                  <div>Mentions: <span className="text-white font-bold">{metrics.mentionRate}%</span></div>
                  <div>Citations: <span className="text-white font-bold">{metrics.citationRate}%</span></div>
                  <div>Sentiment: <span className="text-emerald-400 font-bold">{metrics.sentimentScore}%</span></div>
                </div>
              </div>
            </div>

            {/* Battle Verdict in Center */}
            <div className="text-center py-4 border-y md:border-y-0 md:border-x border-white/10 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-white/5 border border-white/10">
                <Swords size={22} className="text-amber-400" />
              </div>
              <div className="font-mono text-sm font-bold text-white">
                {battleSummary.winner === "PRIMARY" ? (
                  <span className="text-emerald-400">🏆 {result.brandName} Wins</span>
                ) : battleSummary.winner === "COMPETITOR" ? (
                  <span className="text-red-400">🏆 {result.competitorBrand} Leads</span>
                ) : (
                  <span className="text-amber-400">⚖️ Evenly Matched</span>
                )}
              </div>
              <p className="text-xs text-white/60 leading-relaxed font-mono">
                {battleSummary.verdict}
              </p>
              <div className="inline-block px-3 py-1 rounded-full bg-white/5 text-[11px] font-mono text-white/50 border border-white/5">
                Share of Voice: <strong className="text-white">{battleSummary.shareOfVoice}%</strong> vs {100 - battleSummary.shareOfVoice}%
              </div>
            </div>

            {/* Competitor Brand */}
            <div className="text-center md:text-right space-y-2">
              <span className="text-xs font-mono text-red-400 uppercase font-bold tracking-widest">Competitor</span>
              <h3 className="text-2xl font-black text-white">{result.competitorBrand}</h3>
              <div className="flex items-center gap-3 justify-center md:justify-end">
                <div className="text-right font-mono text-xs text-white/60 space-y-1">
                  <div>Mentions: <span className="text-white font-bold">{competitorMetrics.mentionRate}%</span></div>
                  <div>Citations: <span className="text-white font-bold">{competitorMetrics.citationRate}%</span></div>
                  <div>Sentiment: <span className="text-emerald-400 font-bold">{competitorMetrics.sentimentScore}%</span></div>
                </div>
                <ScoreGauge score={competitorMetrics.overallVisibilityScore} size={90} label="Score" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Single Score + Radar Overview (If Single Mode) */}
      {!isBattle && (
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* Main Score Gauge */}
          <div
            className="rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center border relative"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.08) 100%)", borderColor: "rgba(99,102,241,0.25)" }}
          >
            <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-300 mb-3">Overall AI Visibility Index</span>
            <ScoreGauge score={metrics.overallVisibilityScore} size={150} />
            <p className="mt-4 font-black text-xl text-white">
              {SCORE_LABEL(metrics.overallVisibilityScore)}
            </p>
            <p className="text-xs text-white/40 font-mono mt-1">Measured across 6 Generative AI Models</p>
          </div>

          {/* Radar Dominance Chart */}
          <div
            className="rounded-3xl p-6 flex flex-col items-center justify-center border"
            style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p className="text-[11px] font-mono uppercase tracking-widest text-white/40 mb-2">Engine Affinity Radar</p>
            <EngineRadarChart
              primaryStats={metrics.perEngineStats}
              primaryName={result.brandName}
            />
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Mention Frequency", value: `${metrics.mentionRate}%`, icon: <Eye size={16} />, color: "#6366f1", sub: "Prompt presence" },
              { label: "Top Recommendation", value: `${metrics.recommendationRate}%`, icon: <Star size={16} />, color: "#f59e0b", sub: "Rank #1 pick" },
              { label: "Citation Index", value: `${metrics.citationRate}%`, icon: <LinkIcon size={16} />, color: "#22c55e", sub: "URL backlink" },
              { label: "AI Sentiment", value: `${metrics.sentimentScore}%`, icon: <MessageSquare size={16} />, color: "#a855f7", sub: "Positive bias" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 border flex flex-col justify-between"
                style={{ background: `${stat.color}0c`, borderColor: `${stat.color}25` }}
              >
                <div className="flex items-center gap-1.5" style={{ color: stat.color }}>
                  {stat.icon}
                  <span className="text-[11px] font-mono uppercase text-white/50">{stat.label}</span>
                </div>
                <div className="my-1">
                  <p className="text-2xl font-black font-mono" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] text-white/30 font-mono">{stat.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
          {[
            { key: "breakdown", label: "Engine Breakdown (6 Models)", icon: <Brain size={14} /> },
            ...(isBattle ? [{ key: "arena", label: "⚔️ Head-to-Head Arena", icon: <Swords size={14} /> }] : []),
            { key: "playbook", label: "⚡ AEO Action Plan", icon: <Zap size={14} /> },
            { key: "llmstxt", label: "📄 llms.txt Generator", icon: <Terminal size={14} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Engine Breakdown */}
        {activeTab === "breakdown" && (
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
        )}

        {/* Tab 2: Arena Mode */}
        {activeTab === "arena" && isBattle && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white font-mono flex items-center gap-2">
              <Swords size={18} className="text-amber-400" />
              Head-to-Head Prompt Evaluation
            </h3>
            <div className="rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
              {result.queries.map((q, i) => {
                const pResults = results.filter((r) => r.query === q)
                const pMentions = pResults.filter((r) => r.brandMentioned || r.domainMentioned).length

                return (
                  <div key={i} className="p-4 bg-white/[0.02] space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-white/90 font-mono flex items-center gap-2">
                        <span className="text-indigo-400">Q{i + 1}:</span> &ldquo;{q}&rdquo;
                      </p>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {pMentions}/6 Engines Cited {result.brandName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {pResults.map((r) => {
                        const meta = ENGINE_META[r.engine]
                        const hit = r.brandMentioned || r.domainMentioned
                        return (
                          <div
                            key={r.engine}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono border"
                            style={{
                              borderColor: hit ? `${meta?.color}40` : "rgba(255,255,255,0.05)",
                              background: hit ? `${meta?.color}15` : "transparent",
                              color: hit ? "white" : "rgba(255,255,255,0.3)",
                            }}
                          >
                            <span>{meta?.icon}</span>
                            <span>{meta?.label}: {hit ? "Recommended ✓" : "Omitted ✗"}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 3: AEO Playbook */}
        {activeTab === "playbook" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                Prescribed Fixes to 10x AI Citations
              </h3>
              <p className="text-xs text-white/40 font-mono mt-1">
                Generated based on semantic gaps detected during the scan
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {aeoPlaybook.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5 border flex flex-col justify-between space-y-4"
                  style={{
                    background: rec.priority === "CRITICAL" ? "rgba(239,68,68,0.06)" : "rgba(99,102,241,0.06)",
                    borderColor: rec.priority === "CRITICAL" ? "rgba(239,68,68,0.25)" : "rgba(99,102,241,0.25)",
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: rec.priority === "CRITICAL" ? "#ef444420" : "#6366f120",
                          color: rec.priority === "CRITICAL" ? "#ef4444" : "#6366f1",
                        }}
                      >
                        {rec.priority}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{rec.impact}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{rec.title}</h4>
                    <p className="text-xs text-white/60 leading-relaxed">{rec.action}</p>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-white/30">
                    Target: {rec.engineTarget}
                  </div>
                </div>
              ))}
            </div>

            {/* JSON-LD Schema Box */}
            <div className="rounded-2xl border border-white/10 p-5 bg-black/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-indigo-300 font-bold flex items-center gap-1.5">
                  <Cpu size={14} /> Ready-to-Paste JSON-LD Entity Schema
                </span>
                <button
                  onClick={handleCopySchema}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
                >
                  {copiedSchema ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copiedSchema ? "Copied!" : "Copy Schema"}
                </button>
              </div>
              <pre className="text-xs font-mono text-white/60 bg-black/60 p-4 rounded-xl overflow-x-auto border border-white/5">
                {aeoPlaybook.schemaMarkupSnippet}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 4: llms.txt Generator */}
        {activeTab === "llmstxt" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal size={18} className="text-indigo-400" />
                  Your Custom llms.txt File
                </h3>
                <p className="text-xs text-white/40 font-mono mt-1">
                  Place this file at <code className="text-indigo-300 font-bold">/llms.txt</code> to guide Anthropic, OpenAI & Perplexity crawlers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyTxt}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors"
                >
                  {copiedTxt ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedTxt ? "Copied" : "Copy llms.txt"}
                </button>
                <button
                  onClick={handleDownloadTxt}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  <Download size={14} /> Download File
                </button>
              </div>
            </div>

            <pre className="rounded-2xl border border-white/10 p-5 bg-black/70 text-xs font-mono text-emerald-300/90 leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {aeoPlaybook.llmsTxtContent}
            </pre>
          </div>
        )}
      </div>

      {/* Share / Social Proof Card */}
      <div
        className="rounded-3xl p-6 md:p-8 border flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.1) 100%)", borderColor: "rgba(99,102,241,0.3)" }}
      >
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-300 uppercase tracking-widest">
            <Flame size={14} className="text-amber-400" /> Certified AI Visibility Scorecard
          </div>
          <h3 className="text-xl font-bold text-white">Share Your AI Ranking on Social Media</h3>
          <p className="text-xs text-white/50 font-mono">
            Showcase your {metrics.overallVisibilityScore}/100 score to investors, clients, and partners.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white bg-black/60 border border-white/20 hover:border-white/40 transition-colors"
          >
            <Share2 size={14} /> Share on X / Twitter
          </a>
          <Link
            href="/register"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
          >
            Set Up Live Alerts →
          </Link>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="text-center pt-4">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-mono text-white/40 hover:text-white border border-white/5 hover:border-white/20 transition-colors"
        >
          <RefreshCw size={12} /> Scan Another Website or Competitor
        </button>
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Scanning Animation (Neural Matrix)
// ─────────────────────────────────────────────────────────────────────────────
function ScanningState({
  url,
  competitorUrl,
  elapsedSeconds,
}: {
  url: string
  competitorUrl?: string
  elapsedSeconds: number
}) {
  const [tokensCount, setTokensCount] = useState(1280)
  const steps = [
    { label: "Dispatching web crawler & extracting schema graph...", pct: 15 },
    { label: "Prompting OpenAI ChatGPT (GPT-4o) commercial persona...", pct: 35 },
    { label: "Analyzing Google Gemini 2.5 Flash entity relevance...", pct: 55 },
    { label: "Evaluating Perplexity Pro real-time search citations...", pct: 75 },
    { label: "Querying Anthropic Claude & Microsoft Copilot index...", pct: 90 },
    { label: "Calculating AEO share of voice & synthesizing scorecard...", pct: 98 },
  ]

  useEffect(() => {
    const int = setInterval(() => {
      setTokensCount((c) => c + Math.floor(Math.random() * 240) + 120)
    }, 400)
    return () => clearInterval(int)
  }, [])

  const currentStepIdx = Math.min(Math.floor(elapsedSeconds / 3.5), steps.length - 1)
  const currentStep = steps[currentStepIdx]

  return (
    <div className="max-w-2xl mx-auto text-center py-10 space-y-8">
      {/* Cybernetic Pulse Node */}
      <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center border border-indigo-500/40 bg-black/80 shadow-[0_0_50px_rgba(99,102,241,0.4)]"
        >
          <Cpu size={32} className="text-indigo-400" />
        </motion.div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
          <Sparkles size={18} className="text-indigo-400 animate-spin" />
          Analyzing AI Search Surface
        </h3>
        <p className="text-xs font-mono text-white/50">
          Target: <span className="text-indigo-300 font-bold">{url}</span>
          {competitorUrl && <span> vs <span className="text-red-400 font-bold">{competitorUrl}</span></span>}
        </p>
      </div>

      {/* Cyberpunk Telemetry Feed */}
      <div className="rounded-2xl border border-white/10 bg-black/80 p-5 font-mono text-xs text-left space-y-3 shadow-2xl">
        <div className="flex items-center justify-between text-[11px] text-white/40 pb-2 border-b border-white/10">
          <span className="flex items-center gap-1.5"><Terminal size={12} className="text-emerald-400" /> NEURAL_AGENT_STATUS: ACTIVE</span>
          <span className="text-indigo-400">TOKENS ANALYZED: {tokensCount.toLocaleString()}</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-white/70">
            <span>{currentStep.label}</span>
            <span className="text-indigo-400 font-bold">{currentStep.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              animate={{ width: `${currentStep.pct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-[10px] text-white/30">
          <span>LATENCY: 114ms</span>
          <span>ENGINES: 6/6 PARALLEL</span>
          <span>ELAPSED: {elapsedSeconds}s</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AIVisibilityCheckerPage() {
  const [mode, setMode] = useState<"single" | "battle">("single")
  const [inputUrl, setInputUrl] = useState("")
  const [competitorUrl, setCompetitorUrl] = useState("")
  const [submittedUrl, setSubmittedUrl] = useState("")
  const [submittedCompUrl, setSubmittedCompUrl] = useState("")

  const { status, result, error, elapsedSeconds, startScan, reset } = useScanPolling()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const url = inputUrl.trim()
    if (!url) return
    const comp = mode === "battle" ? competitorUrl.trim() : undefined
    setSubmittedUrl(url)
    setSubmittedCompUrl(comp ?? "")
    await startScan(url, comp)
  }

  const handleReset = () => {
    reset()
    setInputUrl("")
    setCompetitorUrl("")
    setSubmittedUrl("")
    setSubmittedCompUrl("")
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.18) 0%, rgba(15,15,25,0.98) 65%, #030307 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 py-16">
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
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-indigo-300"
                style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
              >
                <Sparkles size={12} className="text-indigo-400" />
                Next-Gen Answer Engine Optimization (AEO) Scanner
              </motion.div>

              {/* Main Headline */}
              <div className="space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.1]">
                  Where Does AI Search
                  <br />
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: "linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)" }}
                  >
                    Rank Your Brand?
                  </span>
                </h1>
                <p className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
                  Real-time visibility intelligence across <strong>ChatGPT, Gemini, Perplexity, Claude, Copilot & Grok</strong>. Uncover AI market share, track citations, and benchmark vs competitors.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="inline-flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
                <button
                  type="button"
                  onClick={() => setMode("single")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    mode === "single"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Globe size={14} /> Single Domain Scan
                </button>
                <button
                  type="button"
                  onClick={() => setMode("battle")}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    mode === "battle"
                      ? "bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-lg shadow-red-600/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Swords size={14} /> ⚔️ AI Battle Mode (Vs Competitor)
                </button>
              </div>

              {/* Interactive Input Form */}
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3">
                <div
                  className="rounded-2xl border p-2 flex flex-col sm:flex-row items-center gap-2 transition-all focus-within:border-indigo-500/60 shadow-[0_0_60px_rgba(99,102,241,0.12)]"
                  style={{ background: "rgba(10,10,18,0.75)", borderColor: "rgba(255,255,255,0.12)" }}
                >
                  <div className="flex items-center gap-2 w-full px-3 py-2">
                    <Globe size={18} className="text-indigo-400 shrink-0" />
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="Your website URL (e.g. stripe.com)"
                      className="w-full bg-transparent text-white placeholder-white/30 text-sm outline-none font-mono"
                      autoFocus
                    />
                  </div>

                  {mode === "battle" && (
                    <div className="flex items-center gap-2 w-full px-3 py-2 border-t sm:border-t-0 sm:border-l border-white/10">
                      <Swords size={18} className="text-red-400 shrink-0" />
                      <input
                        type="text"
                        value={competitorUrl}
                        onChange={(e) => setCompetitorUrl(e.target.value)}
                        placeholder="Competitor URL (e.g. adyen.com)"
                        className="w-full bg-transparent text-white placeholder-white/30 text-sm outline-none font-mono"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!inputUrl.trim() || (mode === "battle" && !competitorUrl.trim())}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold text-white transition-all hover:scale-105 active:scale-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0"
                    style={{
                      background: mode === "battle" ? "linear-gradient(135deg, #ef4444, #f59e0b)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    }}
                  >
                    {mode === "battle" ? "Launch Battle" : "Scan AI Visibility"}
                  </button>
                </div>
              </form>

              {/* Supported Engines */}
              <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                {Object.entries(ENGINE_META).map(([k, meta]) => (
                  <div
                    key={k}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border backdrop-blur-sm"
                    style={{ background: `${meta.color}0a`, borderColor: `${meta.color}25`, color: meta.color }}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </div>
                ))}
              </div>

              {/* Example Clicks */}
              <div className="text-xs font-mono text-white/30 space-y-2">
                <span>Try instant comparison:</span>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  {[
                    { label: "Slack vs Discord", p: "slack.com", c: "discord.com" },
                    { label: "Notion vs Coda", p: "notion.so", c: "coda.io" },
                    { label: "Linear vs Jira", p: "linear.app", c: "atlassian.com" },
                  ].map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      onClick={() => {
                        setMode("battle")
                        setInputUrl(ex.p)
                        setCompetitorUrl(ex.c)
                      }}
                      className="px-3 py-1 rounded-lg border border-white/10 hover:border-indigo-400/40 hover:text-white transition-colors"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {status === "running" && (
            <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScanningState url={submittedUrl} competitorUrl={submittedCompUrl} elapsedSeconds={elapsedSeconds} />
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-4">
              <AlertCircle size={48} className="mx-auto text-red-400" />
              <h3 className="text-2xl font-black text-white">Scan Unsuccessful</h3>
              <p className="text-sm font-mono text-white/50 max-w-sm mx-auto">{error ?? "Website could not be reached."}</p>
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-2.5 rounded-xl font-mono text-xs font-bold text-white border border-white/20 hover:border-white/40 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {status === "completed" && result && (
            <motion.div key="completed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ResultsPanel result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
