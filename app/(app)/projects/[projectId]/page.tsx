"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  Globe, Brain, MessageSquare, Link2, Users2, Zap,
  Lightbulb, History, FileText, ArrowRight, Clock, Layers,
  TrendingUp, ShieldCheck, Sparkles, CheckCircle2,
  RefreshCw, Download, Share2, Play, ChevronRight,
  BarChart3, Activity, Target, ArrowUpRight, Award,
  SlidersHorizontal, Check
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ProjectOverviewPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"
  const primaryDomain = "topseotool.net"

  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d">("30d")
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanComplete, setScanComplete] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  const triggerLiveScan = () => {
    if (isScanning) return
    setIsScanning(true)
    setScanProgress(15)
    setScanComplete(false)

    const t1 = setTimeout(() => setScanProgress(45), 600)
    const t2 = setTimeout(() => setScanProgress(80), 1200)
    const t3 = setTimeout(() => {
      setScanProgress(100)
      setIsScanning(false)
      setScanComplete(true)
      setTimeout(() => setScanComplete(false), 4000)
    }, 1800)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const KPIS = [
    {
      title: "Overall AI Visibility",
      value: "92%",
      delta: "+6.4%",
      subtext: "vs previous 30 days",
      positive: true,
      icon: Brain,
      color: "from-indigo-500/20 to-purple-500/10",
      accent: "text-indigo-600 dark:text-indigo-400"
    },
    {
      title: "Technical SEO Health",
      value: "94/100",
      delta: "+3 pts",
      subtext: "0 critical crawl blockers",
      positive: true,
      icon: ShieldCheck,
      color: "from-emerald-500/20 to-teal-500/10",
      accent: "text-emerald-600 dark:text-emerald-400"
    },
    {
      title: "Generative Engine Share",
      value: "88.5%",
      delta: "+9.1%",
      subtext: "Top 5% across AI models",
      positive: true,
      icon: Sparkles,
      color: "from-blue-500/20 to-cyan-500/10",
      accent: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Competitive Win Rate",
      value: "76.4%",
      delta: "+12.0%",
      subtext: "Outranking 3 tracked rivals",
      positive: true,
      icon: Target,
      color: "from-amber-500/20 to-orange-500/10",
      accent: "text-amber-600 dark:text-amber-400"
    }
  ]

  const AI_ENGINES = [
    { name: "ChatGPT (GPT-4o)", score: 94, trend: "+4%", status: "Leader", citations: "142 citations/mo" },
    { name: "Perplexity Pro", score: 96, trend: "+8%", status: "Top Cited", citations: "310 citations/mo" },
    { name: "Anthropic Claude 3.7", score: 86, trend: "+11%", status: "Strong", citations: "98 citations/mo" },
    { name: "Google Gemini 2.0", score: 89, trend: "+5%", status: "Authoritative", citations: "215 citations/mo" },
  ]

  const SUITES = [
    {
      category: "AEO & Generative Engine Optimization",
      badge: "AI Powered",
      description: "Manage visibility across ChatGPT, Claude, Perplexity & Google Gemini",
      tools: [
        {
          key: "ai-perception",
          label: "AI Brand Perception",
          icon: Zap,
          desc: "Real-time sentiment, positioning & simulation across LLM engines",
          badge: "Live Simulator",
          stats: "89% Positive"
        },
        {
          key: "ai-audit",
          label: "AI Visibility Scan",
          icon: Brain,
          desc: "Scan prompt rankings, citation strength & LLM answer dominance",
          badge: "AEO Core",
          stats: "92% Score"
        },
        {
          key: "brand-mentions",
          label: "Brand Mentions",
          icon: MessageSquare,
          desc: "Track every brand & product reference generated in AI queries",
          badge: null,
          stats: "24 New"
        },
        {
          key: "citations",
          label: "AI Citation Sources",
          icon: Link2,
          desc: "Discover high-authority domains feeding AI answers & knowledge graphs",
          badge: null,
          stats: "84 Sources"
        }
      ]
    },
    {
      category: "Technical SEO & Market Dominance",
      badge: "Organic Growth",
      description: "High-precision site audit, Core Web Vitals and competitive intelligence",
      tools: [
        {
          key: "seo-audit",
          label: "Technical SEO Audit",
          icon: Globe,
          desc: "Crawl diagnostics, Core Web Vitals, schema markup & server status",
          badge: "Health 94",
          stats: "0 Critical"
        },
        {
          key: "competitors",
          label: "Competitor Intelligence",
          icon: Users2,
          desc: "Organic keyword overlap, content delta and domain authority comparison",
          badge: "3 Rivals",
          stats: "+14% Gap"
        },
        {
          key: "content-opportunities",
          label: "Content Opportunities",
          icon: Layers,
          desc: "High-intent keyword gaps and AI-generated content clusters",
          badge: "12 Ideas",
          stats: "18.4K Vol"
        },
        {
          key: "recommendations",
          label: "Prioritized Action Plan",
          icon: Lightbulb,
          desc: "Impact vs effort matrix with automated step-by-step code fixes",
          badge: "High ROI",
          stats: "6 Ready"
        }
      ]
    },
    {
      category: "Executive Delivery & Reporting",
      badge: "Enterprise",
      description: "White-label client presentation, automated PDF exports and history tracking",
      tools: [
        {
          key: "reports",
          label: "Client Executive Reports",
          icon: FileText,
          desc: "Interactive white-label summaries, PDF export & scheduled delivery",
          badge: "White-Label",
          stats: "Ready"
        },
        {
          key: "history",
          label: "Historical Trajectory",
          icon: History,
          desc: "Longitudinal visibility trends, algorithmic updates and ranking logs",
          badge: null,
          stats: "12 Months"
        }
      ]
    }
  ]

  const CRITICAL_ACTIONS = [
    {
      id: 1,
      title: "Implement Schema.org SoftwareApplication markup",
      impact: "High Impact",
      tag: "AEO Optimization",
      route: `/projects/${projectId}/recommendations`,
      desc: "Boosts structured entity recognition in Claude & Google Gemini answers by 40%."
    },
    {
      id: 2,
      title: "Address Mobile Cumulative Layout Shift (CLS) on pricing page",
      impact: "Medium Impact",
      tag: "Core Web Vitals",
      route: `/projects/${projectId}/seo-audit`,
      desc: "CLS currently at 0.14. Loading font-display: swap will bring it to green (0.04)."
    },
    {
      id: 3,
      title: "Target competitor backlink gap on G2 & Capterra roundups",
      impact: "High Impact",
      tag: "Competitive Edge",
      route: `/projects/${projectId}/competitors`,
      desc: "Ahrefs has 24 high-authority directory citations absent from your domain profile."
    }
  ]

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Banner & Cockpit Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="flex items-start sm:items-center gap-4 min-w-0 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand to-indigo-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-md ring-4 ring-brand/10">
            {primaryDomain[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {primaryDomain}
              </h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs font-semibold py-0.5">
                ● Live Monitoring
              </Badge>
              <Badge variant="secondary" className="text-xs font-medium">
                US-East (Global)
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5 flex-wrap">
              <span className="flex items-center gap-1.5 font-mono">
                <Globe className="h-3.5 w-3.5 text-brand" /> https://{primaryDomain}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Next automated crawl in 4h
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          {/* Timeframe selector */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/60 text-xs font-medium">
            {(["7d", "30d", "90d"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeframe === t
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "7d" ? "7 Days" : t === "30d" ? "30 Days" : "Quarter"}
              </button>
            ))}
          </div>

          {/* Share Cockpit */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-9 gap-1.5 text-xs font-medium border-border/80 hover:bg-accent rounded-xl"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
            {copiedLink ? "Copied" : "Share"}
          </Button>

          {/* Run Full Scan Button */}
          <Button
            size="sm"
            onClick={triggerLiveScan}
            disabled={isScanning}
            className="h-9 gap-2 text-xs font-semibold bg-brand hover:bg-brand/90 text-brand-foreground shadow-md rounded-xl transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Auditing..." : scanComplete ? "Audit Complete!" : "Run Full Scan"}
          </Button>
        </div>
      </div>

      {/* Real-time scan progress bar if active */}
      {isScanning && (
        <div className="p-4 rounded-xl bg-card border border-brand/30 shadow-xs animate-in fade-in-0">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-brand flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-spin" /> Crawling URLs & Querying AI Engine APIs...
            </span>
            <span className="font-mono font-bold text-foreground">{scanProgress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand to-indigo-500 transition-all duration-500"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* KPI Cards Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden border-border/80 shadow-xs hover:shadow-md transition-all">
            <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${kpi.color} rounded-full blur-2xl pointer-events-none`} />
            <CardContent className="p-5 relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{kpi.title}</span>
                <div className={`p-2 rounded-xl bg-muted/60 ${kpi.accent}`}>
                  <kpi.icon className="h-4 w-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-mono-nums">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-0.5 inline" /> {kpi.delta}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{kpi.subtext}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generative AI Model Status Bar */}
      <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-brand" /> Generative AI Answer Visibility Matrix
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live probability of your brand being recommended in conversational answers
            </p>
          </div>
          <Link
            href={`/projects/${projectId}/ai-perception`}
            className="text-xs font-medium text-brand hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Launch Perception Simulator <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AI_ENGINES.map((engine) => (
            <div key={engine.name} className="p-3.5 rounded-xl bg-muted/30 border border-border/60 hover:bg-muted/50 transition-colors space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground truncate">{engine.name}</span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-bold border-brand/40 text-brand">
                  {engine.status}
                </Badge>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-foreground">{engine.score}%</span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{engine.trend}</span>
              </div>

              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full"
                  style={{ width: `${engine.score}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{engine.citations}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Recommended Fixes / Quick Wins */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-card to-muted/20 border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" /> Immediate High-Impact Action Items
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Algorithmic recommendations to maximize visibility this sprint
            </p>
          </div>
          <Link
            href={`/projects/${projectId}/recommendations`}
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
          >
            View All 6 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {CRITICAL_ACTIONS.map((action) => (
            <Link
              key={action.id}
              href={action.route}
              className="group p-4 rounded-xl bg-card border border-border/70 hover:border-brand/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary" className="text-[10px] font-semibold">
                    {action.tag}
                  </Badge>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {action.impact}
                  </span>
                </div>
                <h3 className="font-semibold text-xs text-foreground group-hover:text-brand transition-colors line-clamp-2">
                  {action.title}
                </h3>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {action.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40 text-xs font-medium text-brand">
                <span>Resolve issue</span>
                <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Comprehensive Categorized Tool Suites */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            SEO & AEO Intelligence Platform Suites
          </h2>
          <span className="text-xs text-muted-foreground">10 Fully Functional Modules</span>
        </div>

        {SUITES.map((suite) => (
          <div key={suite.category} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{suite.category}</h3>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-medium">{suite.badge}</Badge>
              </div>
              <span className="text-[11px] text-muted-foreground hidden sm:inline">{suite.description}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {suite.tools.map((tool) => (
                <Link
                  key={tool.key}
                  href={`/projects/${projectId}/${tool.key}`}
                  className="group relative flex flex-col justify-between p-4 bg-card border border-border/80 rounded-xl hover:border-brand/60 hover:shadow-md transition-all duration-150"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-brand-muted flex items-center justify-center text-brand group-hover:scale-105 transition-transform shadow-2xs">
                        <tool.icon className="h-4.5 w-4.5" />
                      </div>
                      {tool.badge && (
                        <Badge variant="brand" className="text-[9px] py-0.5 px-1.5 font-bold">
                          {tool.badge}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-brand transition-colors flex items-center justify-between">
                        <span>{tool.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-brand" />
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40 text-[11px]">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-semibold text-foreground font-mono">{tool.stats}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}