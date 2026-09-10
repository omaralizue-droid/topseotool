"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  Brain, Sparkles, TrendingUp, Users2, ArrowUpRight,
  ShieldCheck, RefreshCw, MessageSquare, ExternalLink,
  Target, BarChart3, Globe, Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const AI_ENGINES_VISIBILITY = [
  { engine: "ChatGPT (GPT-4o)", share: 94, sentiment: "96% Positive", citations: 48, status: "Dominant" },
  { engine: "Perplexity AI", share: 92, sentiment: "94% Positive", citations: 52, status: "Dominant" },
  { engine: "Claude 3.5 Sonnet", share: 88, sentiment: "91% Positive", citations: 38, status: "Strong" },
  { engine: "Google Gemini", share: 86, sentiment: "89% Positive", citations: 34, status: "Strong" },
  { engine: "Microsoft Copilot", share: 82, sentiment: "86% Positive", citations: 29, status: "Moderate" },
]

const PROMPT_RANKINGS = [
  { prompt: "Best all-in-one SEO intelligence tools 2026", rank: "#1 Cited", frequency: "Daily", strength: "98/100" },
  { prompt: "Top enterprise rank tracking and AEO software", rank: "#1 Cited", frequency: "Daily", strength: "95/100" },
  { prompt: "How to automate technical website audits and Core Web Vitals", rank: "#2 Cited", frequency: "Weekly", strength: "89/100" },
  { prompt: "Leading tools for detecting AI search brand visibility", rank: "#1 Cited", frequency: "Daily", strength: "96/100" },
]

export default function ProjectVisibilityPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = () => {
    setIsScanning(true)
    setTimeout(() => setIsScanning(false), 1200)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Brain className="h-6 w-6 text-brand" /> Generative AI &amp; Search Visibility
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">AEO Radar</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track brand presence, citation frequency, and sentiment across ChatGPT, Claude, Perplexity, and Google Gemini
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleScan}
            disabled={isScanning}
            className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning LLMs..." : "Run AI Visibility Scan"}
          </Button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Overall AI Visibility Score
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-brand">92%</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> +6.4%
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">Ranked in top 5% across LLMs</span>
        </Card>

        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active Verified Citations
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-foreground">201</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> +28 this mo
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">Across 42 tracked high-intent queries</span>
        </Card>

        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Positive Sentiment Index
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-emerald-500">94.8%</span>
            <span className="text-xs font-semibold text-muted-foreground">High trust</span>
          </div>
          <span className="text-[11px] text-muted-foreground">Zero negative hallucination flags</span>
        </Card>

        <Card className="border-border/80 p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Competitive Win-Rate
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-black font-mono-nums text-foreground">78.5%</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> +12.0%
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">Out-cited 3 tracked rivals</span>
        </Card>
      </div>

      {/* Engine Share & Prompt Ranking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engine Breakdown Card */}
        <Card className="border-border/80 overflow-hidden shadow-xs">
          <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-sm font-semibold">Generative Engine Share Breakdown</CardTitle>
          </CardHeader>
          <div className="p-5 space-y-4">
            {AI_ENGINES_VISIBILITY.map((eng) => (
              <div key={eng.engine} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{eng.engine}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{eng.sentiment}</span>
                    <span className="font-bold font-mono text-brand">{eng.share}%</span>
                  </div>
                </div>
                <Progress value={eng.share} className="h-2 [&>div]:bg-brand" />
              </div>
            ))}
          </div>
        </Card>

        {/* High-Intent Prompt Dominance */}
        <Card className="border-border/80 overflow-hidden shadow-xs">
          <CardHeader className="py-3 px-5 border-b border-border/60 bg-muted/20">
            <CardTitle className="text-sm font-semibold">Prompt Dominance &amp; Primary Citations</CardTitle>
          </CardHeader>
          <div className="divide-y divide-border/40">
            {PROMPT_RANKINGS.map((p, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5 max-w-sm">
                  <span className="font-medium text-foreground block">{p.prompt}</span>
                  <span className="text-[11px] text-muted-foreground">Tested {p.frequency} • Strength: {p.strength}</span>
                </div>
                <Badge className="bg-brand/10 text-brand border-brand/30 text-xs font-bold shrink-0">
                  {p.rank}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
