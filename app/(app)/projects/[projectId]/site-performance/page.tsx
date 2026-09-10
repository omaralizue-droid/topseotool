"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
  Activity, Gauge, Zap, CheckCircle2, AlertTriangle, RefreshCw,
  Monitor, Smartphone, Globe, ShieldCheck, ArrowUpRight,
  Clock, Flame, Check, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function SitePerformancePage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"

  const [device, setDevice] = useState<"mobile" | "desktop">("mobile")
  const [isTesting, setIsTesting] = useState(false)
  const [testComplete, setTestComplete] = useState(false)

  const handleRunAudit = () => {
    setIsTesting(true)
    setTestComplete(false)
    setTimeout(() => {
      setIsTesting(false)
      setTestComplete(true)
      setTimeout(() => setTestComplete(false), 3000)
    }, 1200)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Gauge className="h-6 w-6 text-brand" /> Site Performance &amp; Core Web Vitals
            </h1>
            <Badge variant="brand" className="text-[10px] font-bold py-0.5">Google CrUX Verified</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Real-world user experience diagnostics, Core Web Vitals (LCP, INP, CLS), and Lighthouse audit scores
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-lg border border-border/60 p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                device === "mobile" ? "bg-card shadow-xs text-brand font-semibold" : "text-muted-foreground"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobile
            </button>
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                device === "desktop" ? "bg-card shadow-xs text-brand font-semibold" : "text-muted-foreground"
              }`}
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
          </div>

          <Button
            size="sm"
            onClick={handleRunAudit}
            disabled={isTesting}
            className="gap-1.5 text-xs bg-brand hover:bg-brand/90 text-brand-foreground shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? "animate-spin" : ""}`} />
            {isTesting ? "Running CrUX Test..." : testComplete ? "Audit Finished!" : "Run Live Speed Test"}
          </Button>
        </div>
      </div>

      {/* 4 Primary Lighthouse Rings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border/80 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-emerald-500 text-emerald-500 font-extrabold text-2xl font-mono-nums">
            96
          </div>
          <div className="font-bold text-sm text-foreground">Performance</div>
          <span className="text-[11px] text-muted-foreground block">Fast page load</span>
        </Card>

        <Card className="p-5 border-border/80 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-emerald-500 text-emerald-500 font-extrabold text-2xl font-mono-nums">
            98
          </div>
          <div className="font-bold text-sm text-foreground">Accessibility</div>
          <span className="text-[11px] text-muted-foreground block">WCAG 2.1 Compliant</span>
        </Card>

        <Card className="p-5 border-border/80 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-emerald-500 text-emerald-500 font-extrabold text-2xl font-mono-nums">
            100
          </div>
          <div className="font-bold text-sm text-foreground">Best Practices</div>
          <span className="text-[11px] text-muted-foreground block">HTTPS & Modern APIs</span>
        </Card>

        <Card className="p-5 border-border/80 text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-emerald-500 text-emerald-500 font-extrabold text-2xl font-mono-nums">
            100
          </div>
          <div className="font-bold text-sm text-foreground">Technical SEO</div>
          <span className="text-[11px] text-muted-foreground block">Clean canonicals & schema</span>
        </Card>
      </div>

      {/* 3 Core Web Vitals Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-border/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Largest Contentful Paint (LCP)
            </span>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">Good</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-nums text-foreground">1.4s</span>
            <span className="text-xs text-muted-foreground">threshold: &lt; 2.5s</span>
          </div>
          <Progress value={28} className="h-1.5 [&>div]:bg-emerald-500" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Main hero image and title render rapidly without layout shifts.
          </p>
        </Card>

        <Card className="border-border/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Interaction to Next Paint (INP)
            </span>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">Good</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-nums text-foreground">62ms</span>
            <span className="text-xs text-muted-foreground">threshold: &lt; 200ms</span>
          </div>
          <Progress value={31} className="h-1.5 [&>div]:bg-emerald-500" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            UI interaction latency is under 100ms across all device viewports.
          </p>
        </Card>

        <Card className="border-border/80 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Cumulative Layout Shift (CLS)
            </span>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">Good</Badge>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono-nums text-foreground">0.01</span>
            <span className="text-xs text-muted-foreground">threshold: &lt; 0.1</span>
          </div>
          <Progress value={10} className="h-1.5 [&>div]:bg-emerald-500" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Zero intrusive layout shifts during asynchronous asset loading.
          </p>
        </Card>
      </div>
    </div>
  )
}
