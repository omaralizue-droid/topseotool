"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  History, TrendingUp, TrendingDown, Brain, Globe,
  BarChart3, Activity, Zap, Calendar, Download,
  ArrowUpRight, ArrowDownRight, Minus, Shield,
  Link2, Target, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const MONTHS_12 = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"]

const HISTORICAL_DATA = {
  aiVisibility: [64, 67, 70, 71, 74, 76, 79, 83, 86, 89, 91, 92],
  seoHealth: [72, 74, 76, 77, 79, 81, 83, 85, 88, 90, 92, 94],
  organicTraffic: [41200, 43800, 46100, 48200, 51400, 54200, 58100, 63400, 72100, 82300, 91400, 103200],
  backlinks: [8200, 8650, 9100, 9480, 9820, 10200, 10850, 11400, 12100, 12900, 13700, 14200],
  keywordsTop10: [182, 194, 208, 221, 236, 249, 263, 278, 294, 312, 331, 347],
  brandMentions: [12, 18, 22, 28, 34, 41, 52, 63, 71, 84, 91, 102],
}

const ALGORITHM_EVENTS = [
  { month: "Nov", event: "Google Core Update (Nov 2025)", impact: "positive", desc: "+8% organic visibility gains" },
  { month: "Feb", event: "Schema.org Entity Update", impact: "positive", desc: "AI entity recognition improved +15%" },
  { month: "Apr", event: "Competitor Domain Penalty", impact: "positive", desc: "Semrush.com lost 12% traffic share" },
  { month: "Jun", event: "Google Helpful Content 3.0", impact: "neutral", desc: "Minimal impact — content depth sufficient" },
  { month: "Aug", event: "AI Overview Expansion", impact: "positive", desc: "+34% AI citation volume increase" },
]

type MetricKey = keyof typeof HISTORICAL_DATA

const METRIC_CONFIG: Record<MetricKey, { label: string; icon: any; color: string; unit: string; format: (v: number) => string }> = {
  aiVisibility: {
    label: "AI Visibility Score",
    icon: Brain,
    color: "brand",
    unit: "%",
    format: (v) => `${v}%`
  },
  seoHealth: {
    label: "SEO Health Score",
    icon: Shield,
    color: "emerald",
    unit: "/100",
    format: (v) => `${v}/100`
  },
  organicTraffic: {
    label: "Monthly Organic Traffic",
    icon: TrendingUp,
    color: "indigo",
    unit: "visits",
    format: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`
  },
  backlinks: {
    label: "Total Backlinks",
    icon: Link2,
    color: "purple",
    unit: "links",
    format: (v) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : `${v}`
  },
  keywordsTop10: {
    label: "Keywords in Top 10",
    icon: Target,
    color: "amber",
    unit: "keywords",
    format: (v) => `${v}`
  },
  brandMentions: {
    label: "AI Brand Mentions",
    icon: Sparkles,
    color: "pink",
    unit: "mentions",
    format: (v) => `${v}`
  }
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-0.5 h-20">
      {data.map((v, i) => {
        const heightPct = ((v - min) / range) * 85 + 15
        const isLast = i === data.length - 1
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div
              className={`w-full rounded-t-sm transition-all ${
                isLast
                  ? `bg-${color}-500`
                  : `bg-${color}-500/40 hover:bg-${color}-500/70`
              }`}
              style={{ height: `${heightPct}%` }}
            />
          </div>
        )
      })}
    </div>
  )
}

function DeltaBadge({ first, last }: { first: number; last: number }) {
  const delta = last - first
  const pct = ((delta / first) * 100).toFixed(1)
  const positive = delta >= 0
  return (
    <span className={`text-xs font-bold flex items-center gap-0.5 ${positive ? "text-emerald-500" : "text-red-500"}`}>
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {positive ? "+" : ""}{pct}%
    </span>
  )
}

export default function HistoryPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [activeMetric, setActiveMetric] = useState<MetricKey>("aiVisibility")
  const [timeframe, setTimeframe] = useState<"6m" | "12m">("12m")

  const activeData = HISTORICAL_DATA[activeMetric]
  const displayData = timeframe === "6m" ? activeData.slice(6) : activeData
  const displayMonths = timeframe === "6m" ? MONTHS_12.slice(6) : MONTHS_12
  const config = METRIC_CONFIG[activeMetric]
  const maxVal = Math.max(...displayData)
  const minVal = Math.min(...displayData)
  const firstVal = displayData[0]
  const lastVal = displayData[displayData.length - 1]

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <History className="h-6 w-6 text-brand" /> Historical Visibility Tracking
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">12-Month Timeline</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Longitudinal SEO and AI visibility trends, algorithm impact events, and growth trajectory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/60 text-xs font-medium">
            {(["6m", "12m"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-md transition-all ${
                  timeframe === t ? "bg-background text-foreground shadow-xs font-semibold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "6m" ? "6 Months" : "12 Months"}
              </button>
            ))}
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Metric Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {(Object.entries(METRIC_CONFIG) as [MetricKey, typeof METRIC_CONFIG[MetricKey]][]).map(([key, cfg]) => {
          const data = HISTORICAL_DATA[key]
          const first = data[0]
          const last = data[data.length - 1]
          const MetricIcon = cfg.icon
          const isActive = activeMetric === key
          return (
            <button
              key={key}
              onClick={() => setActiveMetric(key)}
              className={`p-3 rounded-xl border text-left transition-all space-y-2 ${
                isActive
                  ? "bg-brand/5 border-brand/40 shadow-xs"
                  : "bg-card border-border/80 hover:border-brand/30 hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isActive ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}>
                  <MetricIcon className="h-3.5 w-3.5" />
                </div>
                <DeltaBadge first={first} last={last} />
              </div>
              <div>
                <div className="text-base font-black font-mono text-foreground">{cfg.format(last)}</div>
                <div className="text-[10px] text-muted-foreground font-medium leading-tight mt-0.5">{cfg.label}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main Chart Panel */}
      <Card className="border-border/80 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <config.icon className="h-4 w-4 text-brand" />
              {config.label} — {timeframe === "6m" ? "6-Month" : "12-Month"} Trend
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              From <strong>{config.format(firstVal)}</strong> → <strong>{config.format(lastVal)}</strong> &nbsp;
              <DeltaBadge first={firstVal} last={lastVal} />
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="text-center">
              <div className="font-black font-mono text-foreground text-lg">{config.format(maxVal)}</div>
              <div className="text-muted-foreground">Peak</div>
            </div>
            <div className="text-center">
              <div className="font-black font-mono text-foreground text-lg">{config.format(minVal)}</div>
              <div className="text-muted-foreground">Low</div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="flex items-end gap-1.5 sm:gap-2 h-40 pt-4">
          {displayData.map((val, i) => {
            const range = maxVal - minVal || 1
            const heightPct = Math.round(((val - minVal) / range) * 85) + 15
            const isLast = i === displayData.length - 1
            const isHigh = val === maxVal

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="w-full bg-muted rounded-t-sm overflow-hidden flex items-end h-full relative">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      isLast
                        ? "bg-brand"
                        : isHigh
                        ? "bg-emerald-500/70 hover:bg-emerald-500"
                        : "bg-brand/40 hover:bg-brand/70"
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${displayMonths[i]}: ${config.format(val)}`}
                  />
                </div>
                <div className="text-center">
                  <div className="text-[10px] font-mono text-muted-foreground">{displayMonths[i]}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Value labels row */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {displayData.map((val, i) => (
            <div key={i} className="flex-1 text-center">
              <span className={`text-[9px] font-mono font-bold ${i === displayData.length - 1 ? "text-brand" : "text-muted-foreground"}`}>
                {config.format(val)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* All Metrics Overview Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-brand" /> All Metrics — {timeframe === "6m" ? "6-Month" : "12-Month"} Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.entries(METRIC_CONFIG) as [MetricKey, typeof METRIC_CONFIG[MetricKey]][]).map(([key, cfg]) => {
            const data = timeframe === "6m" ? HISTORICAL_DATA[key].slice(6) : HISTORICAL_DATA[key]
            const months = timeframe === "6m" ? MONTHS_12.slice(6) : MONTHS_12
            const first = data[0]
            const last = data[data.length - 1]
            const maxD = Math.max(...data)
            const MetricIcon = cfg.icon

            return (
              <Card
                key={key}
                className={`border-border/80 p-4 space-y-3 shadow-xs cursor-pointer transition-all hover:shadow-md ${
                  activeMetric === key ? "border-brand/40 bg-brand/5" : "hover:border-brand/30"
                }`}
                onClick={() => setActiveMetric(key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeMetric === key ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"}`}>
                      <MetricIcon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">{cfg.label}</span>
                  </div>
                  <DeltaBadge first={first} last={last} />
                </div>

                {/* Mini bar chart */}
                <div className="flex items-end gap-0.5 h-14">
                  {data.map((v, i) => {
                    const hPct = Math.round(((v - Math.min(...data)) / (maxD - Math.min(...data) || 1)) * 85) + 15
                    return (
                      <div key={i} className="flex-1 h-full flex items-end">
                        <div
                          className={`w-full rounded-t-sm ${i === data.length - 1 ? "bg-brand" : "bg-brand/30"}`}
                          style={{ height: `${hPct}%` }}
                        />
                      </div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-mono">{months[0]}: {cfg.format(first)}</span>
                  <span className="font-bold font-mono text-foreground">{months[months.length - 1]}: {cfg.format(last)}</span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Algorithm Events Timeline */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        <CardHeader className="py-3.5 px-5 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" /> Algorithm Events &amp; Impact Timeline
          </CardTitle>
        </CardHeader>
        <div className="divide-y divide-border/40">
          {ALGORITHM_EVENTS.map((event, i) => (
            <div key={i} className="p-4 flex items-start gap-4 hover:bg-muted/20 transition-colors">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-muted-foreground">{event.month}</span>
                </div>
                {i < ALGORITHM_EVENTS.length - 1 && (
                  <div className="w-px h-6 bg-border/60" />
                )}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground">{event.event}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      event.impact === "positive"
                        ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                        : event.impact === "negative"
                        ? "text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10"
                        : "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10"
                    }`}
                  >
                    {event.impact === "positive" ? "↑ Positive" : event.impact === "negative" ? "↓ Negative" : "→ Neutral"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}