"use client"
import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft, Lightbulb, Filter, CheckCircle2, Clock, EyeOff,
  ArrowRight, TrendingUp, Zap, Globe, Brain, Link2, Target,
  AlertTriangle, Star, Sparkles, BarChart3, ChevronDown, ChevronUp
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { generateSynthesizedRecommendations, type SynthesizedRecommendation } from "@/lib/recommendations/recommendation-engine"

// ── Static demo data (in prod, fetched via API) ───────────────────────────────
const DEMO_RECS = generateSynthesizedRecommendations("topseotool.net", 84, 72, 2, ["semrush.com", "ahrefs.com"])

// ── Category → icon mapping ───────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Technical SEO": Globe,
  "Content": Lightbulb,
  "On-page SEO": Target,
  "Internal linking": Link2,
  "Structured data": BarChart3,
  "AI visibility": Brain,
  "Brand authority": Star,
  "Competitor gap": TrendingUp,
}

// ── Priority colors ───────────────────────────────────────────────────────────
const PRIORITY_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-300 dark:border-red-800" },
  HIGH:     { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-300 dark:border-orange-800" },
  MEDIUM:   { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-300 dark:border-amber-800" },
  LOW:      { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-300 dark:border-emerald-800" },
}

const IMPACT_COLORS: Record<string, string> = {
  HIGH: "text-emerald-600 dark:text-emerald-400",
  MEDIUM: "text-amber-600 dark:text-amber-400",
  LOW: "text-slate-500",
}

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-emerald-600 dark:text-emerald-400",
  MEDIUM: "text-amber-600 dark:text-amber-400",
  HARD: "text-red-500",
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { id: "ALL", label: "All", icon: Sparkles },
  { id: "CRITICAL", label: "Critical", icon: AlertTriangle },
  { id: "AI", label: "AI Visibility", icon: Brain },
  { id: "TECHNICAL", label: "Technical", icon: Globe },
  { id: "CONTENT", label: "Content", icon: Lightbulb },
  { id: "QUICK_WIN", label: "Quick Wins", icon: Zap },
]

// ── Single recommendation card ────────────────────────────────────────────────
function RecCard({
  rec,
  projectId,
}: {
  rec: SynthesizedRecommendation & { _localStatus?: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "IGNORED" }
  projectId: string
}) {
  const [status, setStatus] = useState<"OPEN" | "IN_PROGRESS" | "COMPLETED" | "IGNORED">(rec._localStatus ?? rec.status)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const prStyle = PRIORITY_STYLE[rec.priority] ?? PRIORITY_STYLE.MEDIUM
  const CategoryIcon = CATEGORY_ICONS[rec.category] ?? Lightbulb

  async function updateStatus(newStatus: typeof status) {
    setStatus(newStatus)
    setLoading(true)
    try {
      await fetch(`/api/projects/${projectId}/recommendations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: rec.id, status: newStatus }),
      })
      toast.success(`Marked as ${newStatus.replace("_", " ").toLowerCase()}`)
    } catch {
      toast.error("Failed to update")
    } finally {
      setLoading(false)
    }
  }

  if (status === "IGNORED") {
    return (
      <div className="p-3.5 bg-muted/30 border border-border/50 rounded-xl flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="line-through truncate">{rec.title}</span>
        <Button variant="ghost" size="sm" className="h-6 text-[11px] shrink-0" onClick={() => updateStatus("OPEN")}>
          Restore
        </Button>
      </div>
    )
  }

  return (
    <Card
      className={`transition-all border ${
        status === "COMPLETED"
          ? "opacity-65 bg-muted/20"
          : `${prStyle.border} ${prStyle.bg}`
      } card-hover animate-fade-in-up`}
    >
      <CardContent className="p-0">
        {/* Card header */}
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            {/* Category icon */}
            <div className={`w-9 h-9 rounded-xl ${prStyle.bg} border ${prStyle.border} flex items-center justify-center shrink-0 mt-0.5`}>
              <CategoryIcon className={`h-4 w-4 ${prStyle.text}`} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${prStyle.bg} ${prStyle.text} ${prStyle.border}`}>
                  {rec.priority}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-muted/60 border border-border/60 uppercase tracking-wide">
                  {rec.category}
                </span>
                {status === "COMPLETED" && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Done
                  </span>
                )}
                {status === "IN_PROGRESS" && (
                  <span className="text-[10px] font-semibold text-brand flex items-center gap-1">
                    <Clock className="h-3 w-3" /> In Progress
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className={`font-semibold text-sm leading-snug ${status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
                {rec.title}
              </h3>

              {/* Impact + difficulty mini stats */}
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-muted-foreground">
                  Impact: <strong className={IMPACT_COLORS[rec.expectedImpact]}>{rec.expectedImpact}</strong>
                </span>
                <span className="w-px h-3 bg-border" />
                <span className="text-muted-foreground">
                  Effort: <strong className={DIFFICULTY_COLORS[rec.difficulty]}>{rec.difficulty}</strong>
                </span>
                <span className="w-px h-3 bg-border" />
                <span className="text-muted-foreground text-[11px]">{rec.sourceMetric}</span>
              </div>
            </div>

            {/* Expand toggle */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="shrink-0 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors mt-0.5"
            >
              {expanded
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />
              }
            </button>
          </div>

          {/* Expanded content */}
          {expanded && (
            <div className="mt-4 space-y-3 pl-12 animate-fade-in">
              <div className="text-xs">
                <p className="font-semibold text-foreground mb-1">Problem</p>
                <p className="text-muted-foreground leading-relaxed">{rec.problem}</p>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-foreground mb-1">Why It Matters</p>
                <p className="text-muted-foreground leading-relaxed">{rec.whyItMatters}</p>
              </div>
              <div className="p-3 rounded-lg bg-brand-muted/40 border border-brand/20 text-xs">
                <p className="font-bold text-brand flex items-center gap-1.5 mb-1.5">
                  <ArrowRight className="h-3.5 w-3.5" /> Recommended Action
                </p>
                <p className="text-foreground leading-relaxed">{rec.recommendedAction}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action row */}
        <div className="px-4 sm:px-5 py-3 border-t border-border/40 bg-muted/10 flex items-center justify-end gap-1.5">
          {status === "OPEN" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[11px] gap-1"
              onClick={() => updateStatus("IN_PROGRESS")}
              disabled={loading}
            >
              <Clock className="h-3 w-3 text-brand" /> Start
            </Button>
          )}
          {status !== "COMPLETED" && (
            <Button
              size="sm"
              className="h-7 text-[11px] gap-1 shadow-brand"
              onClick={() => updateStatus("COMPLETED")}
              disabled={loading}
            >
              <CheckCircle2 className="h-3 w-3" /> Done
            </Button>
          )}
          {status === "COMPLETED" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[11px]"
              onClick={() => updateStatus("OPEN")}
              disabled={loading}
            >
              Reopen
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => updateStatus("IGNORED")}
            disabled={loading}
            title="Dismiss"
          >
            <EyeOff className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RecommendationsClientPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [activeFilter, setActiveFilter] = useState("ALL")

  const filtered = useMemo(() => {
    if (activeFilter === "ALL") return DEMO_RECS
    if (activeFilter === "CRITICAL") return DEMO_RECS.filter((r) => r.priority === "CRITICAL")
    if (activeFilter === "AI") return DEMO_RECS.filter((r) => r.category === "AI visibility")
    if (activeFilter === "TECHNICAL") return DEMO_RECS.filter((r) => r.category === "Technical SEO" || r.category === "Structured data")
    if (activeFilter === "CONTENT") return DEMO_RECS.filter((r) => r.category === "Content" || r.category === "On-page SEO")
    if (activeFilter === "QUICK_WIN") return DEMO_RECS.filter((r) => r.difficulty === "EASY")
    return DEMO_RECS
  }, [activeFilter])

  const totalOpen = DEMO_RECS.filter((r) => r.status === "OPEN").length
  const totalCritical = DEMO_RECS.filter((r) => r.priority === "CRITICAL").length

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
            <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">Highest-Impact Opportunities</h1>
              <Badge variant="brand" className="text-[10px]">{DEMO_RECS.length} Actions</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Synthesized action plans combining SEO, AI Visibility, and competitor gap findings
            </p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Open Actions", value: totalOpen, color: "text-brand" },
          { label: "Critical Priority", value: totalCritical, color: "text-red-500" },
          { label: "Quick Wins Available", value: DEMO_RECS.filter(r => r.difficulty === "EASY").length, color: "text-emerald-500" },
        ].map((stat) => (
          <div key={stat.label} className="p-3 sm:p-4 rounded-xl border border-border bg-card text-center">
            <p className={`text-xl sm:text-2xl font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {FILTER_TABS.map((tab) => {
          const Icon = tab.icon
          const count = (() => {
            if (tab.id === "ALL") return DEMO_RECS.length
            if (tab.id === "CRITICAL") return DEMO_RECS.filter((r) => r.priority === "CRITICAL").length
            if (tab.id === "AI") return DEMO_RECS.filter((r) => r.category === "AI visibility").length
            if (tab.id === "TECHNICAL") return DEMO_RECS.filter((r) => r.category === "Technical SEO" || r.category === "Structured data").length
            if (tab.id === "CONTENT") return DEMO_RECS.filter((r) => r.category === "Content" || r.category === "On-page SEO").length
            if (tab.id === "QUICK_WIN") return DEMO_RECS.filter((r) => r.difficulty === "EASY").length
            return 0
          })()

          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                activeFilter === tab.id
                  ? "bg-brand text-white shadow-brand"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className={`text-[10px] font-bold ml-0.5 ${activeFilter === tab.id ? "opacity-80" : "opacity-60"}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Recommendations list */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center">
          <Lightbulb className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-sm mb-1">No recommendations in this category</p>
          <p className="text-xs text-muted-foreground">Try a different filter above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec) => (
            <RecCard key={rec.id} rec={rec} projectId={projectId} />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 flex gap-3 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-brand" />
        <p className="leading-relaxed">
          <strong className="text-foreground">How recommendations are generated:</strong> Our engine analyzes your latest SEO audit score, AI visibility data, competitor gaps, and technical crawl findings to synthesize prioritized action items. Recommendations re-rank dynamically as you run new audits.
        </p>
      </div>
    </div>
  )
}