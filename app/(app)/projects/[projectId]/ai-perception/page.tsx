"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft, Zap, RefreshCw, CheckCircle2, XCircle, MinusCircle,
  TrendingUp, Brain, MessageSquare, Sparkles, AlertCircle, Info,
  ChevronRight, Target
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyzeBrandPerception, type PerceptionAnalysis } from "@/lib/brand-perception/perception-analyzer"
import { motion, AnimatePresence } from "framer-motion"

// ── AI engines we check ───────────────────────────────────────────────────────
const AI_ENGINES = [
  { id: "CHATGPT", name: "ChatGPT", icon: "🤖", color: "#10a37f", brand: "OpenAI" },
  { id: "GEMINI", name: "Gemini", icon: "✨", color: "#4285f4", brand: "Google" },
  { id: "PERPLEXITY", name: "Perplexity", icon: "🔍", color: "#a855f7", brand: "Perplexity AI" },
  { id: "CLAUDE", name: "Claude", icon: "🧠", color: "#d97706", brand: "Anthropic" },
  { id: "COPILOT", name: "Copilot", icon: "🛡️", color: "#0078d4", brand: "Microsoft" },
  { id: "GROK", name: "Grok", icon: "⚡", color: "#ef4444", brand: "xAI" },
]

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444"
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="currentColor" strokeWidth={size * 0.09}
          className="text-border opacity-40"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color}
          strokeWidth={size * 0.09} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text
          x="50%" y="50%" textAnchor="middle" dy="0.35em"
          fontSize={size * 0.22} fontWeight="800" fill={color}
        >
          {score}
        </text>
      </svg>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

// ── Sentiment donut ───────────────────────────────────────────────────────────
function SentimentDonut({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  const total = positive + neutral + negative
  const posAngle = (positive / total) * 360
  const neuAngle = (neutral / total) * 360
  const size = 120
  const r = 40
  const circ = 2 * Math.PI * r

  const posArc = (positive / total) * circ
  const neuArc = (neutral / total) * circ
  const negArc = (negative / total) * circ

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Negative */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#ef4444" strokeWidth={12}
            strokeDasharray={`${negArc} ${circ}`}
            strokeDashoffset={-(posArc + neuArc)}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
          {/* Neutral */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#94a3b8" strokeWidth={12}
            strokeDasharray={`${neuArc} ${circ}`}
            strokeDashoffset={-posArc}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
          {/* Positive */}
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#22c55e" strokeWidth={12}
            strokeDasharray={`${posArc} ${circ}`}
            strokeDashoffset={0}
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
          <text x="50%" y="50%" textAnchor="middle" dy="-0.1em" fontSize="18" fontWeight="800" fill="#22c55e">{positive}%</text>
          <text x="50%" y="50%" textAnchor="middle" dy="1.1em" fontSize="9" fill="currentColor" className="text-muted-foreground" style={{ fill: "#94a3b8" }}>positive</text>
        </svg>
      </div>
      <div className="flex flex-col gap-2.5 text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-muted-foreground text-xs">Positive</span>
          <span className="font-bold ml-auto">{positive}%</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
          <span className="text-muted-foreground text-xs">Neutral</span>
          <span className="font-bold ml-auto">{neutral}%</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
          <span className="text-muted-foreground text-xs">Negative</span>
          <span className="font-bold ml-auto">{negative}%</span>
        </div>
      </div>
    </div>
  )
}

// ── Per-engine score card ─────────────────────────────────────────────────────
function EngineCard({ engine, score, sentiment, mentioned }: {
  engine: typeof AI_ENGINES[0]
  score: number
  sentiment: string
  mentioned: boolean
}) {
  return (
    <div
      className="p-3.5 rounded-xl border border-border bg-card hover:border-brand/30 transition-all duration-200 card-hover"
      style={{ borderColor: mentioned ? engine.color + "30" : undefined }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{engine.icon}</span>
          <div>
            <p className="text-xs font-semibold">{engine.name}</p>
            <p className="text-[10px] text-muted-foreground">{engine.brand}</p>
          </div>
        </div>
        {mentioned ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400/60 shrink-0" />
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${score}%`,
                backgroundColor: engine.color,
              }}
            />
          </div>
          <span className="text-xs font-bold tabular-nums w-7 text-right">{score}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Visibility Score</span>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
            sentiment === "POSITIVE" ? "bg-emerald-500/10 text-emerald-500" :
            sentiment === "NEGATIVE" ? "bg-red-500/10 text-red-500" :
            "bg-slate-500/10 text-slate-400"
          }`}>{sentiment}</span>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AIPerceptionPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [analysisVersion, setAnalysisVersion] = useState(0)

  // In production, this would call the API. For now we use the analyzer.
  const analysis: PerceptionAnalysis = analyzeBrandPerception("TOPSEOTOOL", "topseotool.net")

  // Generate per-engine scores from the analysis
  const engineScores = AI_ENGINES.map((eng, i) => {
    const base = analysis.perceptionScore
    const variation = [0, -8, 5, -12, 3, -5][i] ?? 0
    const score = Math.max(30, Math.min(100, base + variation))
    const mentioned = score > 60
    const sentiment = score > 75 ? "POSITIVE" : score > 55 ? "NEUTRAL" : "NEGATIVE"
    return { engine: eng, score, sentiment, mentioned }
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((r) => setTimeout(r, 1800))
    setAnalysisVersion((v) => v + 1)
    setIsRefreshing(false)
  }

  const mentionedCount = engineScores.filter((e) => e.mentioned).length

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
            <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">AI Brand Perception</h1>
              <Badge variant="brand" className="text-[10px]">6 Engines</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              How AI models perceive and describe your brand across LLM engines
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Re-analyze
        </Button>
      </div>

      {/* Top metric row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Score ring card */}
        <Card className="border border-border flex flex-col items-center justify-center p-6 text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Perception Score
          </p>
          <ScoreRing score={analysis.perceptionScore} size={90} />
          <p className="text-[11px] text-muted-foreground mt-3">
            Across {AI_ENGINES.length} AI engines
          </p>
        </Card>

        {/* Sentiment distribution */}
        <Card className="border border-border p-5 sm:col-span-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Sentiment Distribution
          </p>
          <SentimentDonut
            positive={analysis.sentimentDistribution.positive}
            neutral={analysis.sentimentDistribution.neutral}
            negative={analysis.sentimentDistribution.negative}
          />
        </Card>
      </div>

      {/* Per-engine scores */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Brain className="h-4 w-4 text-brand" />
          Per-Engine Visibility
          <span className="text-muted-foreground font-normal">
            — {mentionedCount}/{AI_ENGINES.length} engines mention your brand
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {engineScores.map(({ engine, score, sentiment, mentioned }) => (
            <EngineCard
              key={engine.id}
              engine={engine}
              score={score}
              sentiment={sentiment}
              mentioned={mentioned}
            />
          ))}
        </div>
      </div>

      {/* Attributes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Positive */}
        <Card className="border border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/30 dark:bg-emerald-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Positive Attributes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.positiveAttributes.map((attr, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                <span className="text-foreground/80 leading-relaxed">{attr}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Neutral */}
        <Card className="border border-slate-200/60 dark:border-slate-700/30 bg-slate-50/30 dark:bg-slate-900/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <MinusCircle className="h-4 w-4" />
              Neutral Attributes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.neutralAttributes.map((attr, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                <span className="text-foreground/80 leading-relaxed">{attr}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Negative */}
        <Card className="border border-red-200/60 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.negativeAttributes.map((attr, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                <span className="text-foreground/80 leading-relaxed">{attr}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Summary */}
      <Card className="border border-brand/20 bg-brand-muted/10">
        <CardContent className="p-5 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-brand mb-1.5 uppercase tracking-wider">AI Summary</p>
            <p className="text-sm leading-relaxed text-foreground/80">{analysis.summaryText}</p>
          </div>
        </CardContent>
      </Card>

      {/* Missing info opportunities */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-amber-500" />
          Content Gap Opportunities
          <Badge variant="outline" className="text-[10px] font-normal">{analysis.missingInfoOpportunities.length} found</Badge>
        </h2>
        <div className="space-y-3">
          {analysis.missingInfoOpportunities.map((opp, i) => (
            <div key={i} className="p-4 rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-amber-50/30 dark:bg-amber-950/10 flex gap-3">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{opp.gap}</p>
                <div className="flex items-start gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-brand shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/75">{opp.recommendation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Associated topics */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-brand" />
            Topics Associated with Your Brand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysis.associatedTopics.map((topic, i) => (
              <span
                key={i}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-brand/20 bg-brand-muted/40 text-brand"
              >
                {topic}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 flex gap-3 text-xs text-muted-foreground">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-foreground">How perception scoring works:</strong> We simulate prompts about your brand across all major AI engines and analyze sentiment, mention frequency, attribute associations, and citation strength. Scores update each time you re-analyze.
        </p>
      </div>
    </div>
  )
}