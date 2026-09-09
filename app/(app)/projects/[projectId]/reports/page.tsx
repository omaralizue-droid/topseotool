"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeft, Download, Share2, Copy, Check, Printer,
  Globe, Brain, TrendingUp, Link2, AlertCircle,
  Calendar, Building2, Shield,
  ArrowUpRight, Sparkles
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

// Browser-safe report data type and generator (avoids Node.js crypto module)
interface CompiledReportData {
  id: string
  shareToken: string
  title: string
  orgName: string
  domain: string
  createdAt: Date
  seoScore: number
  aiVisibilityScore: number
  mentionRate: number
  citationRate: number
  executiveSummary: string
  technicalIssues: Array<{ title: string; severity: string; category: string }>
  competitors: Array<{ name: string; domain: string; seoScore: number; aiVisibility: number }>
  recommendations: Array<{ title: string; priority: string; action: string }>
  history: Array<{ date: string; seoScore: number; aiVisibility: number }>
}

function buildReport(domain: string, seoScore: number, aiVisibilityScore: number): CompiledReportData {
  return {
    id: `rep-${Date.now()}`,
    shareToken: Math.random().toString(36).substring(2, 18),
    title: `${domain} Executive Report`,
    orgName: "My Organization",
    domain,
    createdAt: new Date(),
    seoScore,
    aiVisibilityScore,
    mentionRate: 85,
    citationRate: 78,
    executiveSummary: `During this audit period, ${domain} maintained a strong overall digital presence with a ${seoScore}/100 Technical SEO Health score and a ${aiVisibilityScore}/100 AI Search Visibility score. Brand mentions were detected across 85% of sampled commercial queries in ChatGPT, Gemini, and Perplexity.`,
    technicalIssues: [
      { title: "Missing structured JSON-LD FAQ Schema", severity: "CRITICAL", category: "STRUCTURED_DATA" },
      { title: "Unoptimized landing page image sizes", severity: "WARNING", category: "PERFORMANCE" },
    ],
    competitors: [
      { name: "Legacy Competitor", domain: "competitor-example.com", seoScore: 72, aiVisibility: 45 },
    ],
    recommendations: [
      { title: "Implement FAQ & Organization JSON-LD Schema", priority: "CRITICAL", action: "Add JSON-LD script to homepage to boost LLM citations." },
      { title: "Publish Comparison Guide vs Key Rivals", priority: "HIGH", action: "Publish brand comparison page to capture competitor search share." },
    ],
    history: [
      { date: "Week 1", seoScore: 78, aiVisibility: 84 },
      { date: "Week 2", seoScore: 82, aiVisibility: 88 },
      { date: "Week 3", seoScore: seoScore, aiVisibility: aiVisibilityScore },
    ],
  }
}


// ── Score ring (inline for print friendliness) ────────────────────────────────
function MiniScoreRing({ score, color }: { score: number; color: string }) {
  const r = 24
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width={60} height={60} viewBox="0 0 60 60">
      <circle cx={30} cy={30} r={r} fill="none" stroke="#e5e7eb" strokeWidth={5} />
      <circle
        cx={30} cy={30} r={r}
        fill="none" stroke={color}
        strokeWidth={5} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="13" fontWeight="800" fill={color}>{score}</text>
    </svg>
  )
}

// ── Score card ────────────────────────────────────────────────────────────────
function MetricCell({ label, value, icon: Icon, color, suffix = "" }: {
  label: string
  value: number
  icon: React.ElementType
  color: string
  suffix?: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 sm:p-5 rounded-xl border border-border bg-card text-center">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center`} style={{ backgroundColor: color + "18" }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-extrabold tabular-nums" style={{ color }}>{value}{suffix}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ── Trend chart (lightweight sparkline using SVG) ─────────────────────────────
function TrendSparkline({ data, color }: { data: { date: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.value))
  const min = Math.min(...data.map((d) => d.value))
  const range = max - min || 10
  const W = 200
  const H = 48
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((d.value - min) / range) * (H - 8) - 4
    return `${x},${y}`
  }).join(" ")

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const x = (i / (data.length - 1)) * W
        const y = H - ((d.value - min) / range) * (H - 8) - 4
        return <circle key={i} cx={x} cy={y} r={3.5} fill={color} />
      })}
    </svg>
  )
}

// ── Client wrapper (needed for interactivity) ─────────────────────────────────
export default function ReportsClientPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const [copied, setCopied] = useState(false)

  // Compile report data (in prod would be fetched via API)
  const report: CompiledReportData = buildReport("topseotool.net", 84, 92)

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/reports/${report.shareToken}`

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success("Share link copied!")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  function handlePrint() {
    window.print()
  }

  const seoHistory = report.history.map((h) => ({ date: h.date, value: h.seoScore }))
  const aiHistory = report.history.map((h) => ({ date: h.date, value: h.aiVisibility }))

  const formattedDate = new Date(report.createdAt).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header — hidden on print */}
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
            <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">Executive Report</h1>
              <Badge variant="brand" className="text-[10px]">Auto-Generated</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              White-labeled PDF-ready executive report for {report.domain}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={copyShareLink}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied!" : "Share"}</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Print / PDF</span>
          </Button>
          <Button size="sm" className="gap-1.5 shadow-brand" onClick={handlePrint}>
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </Button>
        </div>
      </div>

      {/* ── Report document ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden print:border-0 print:rounded-none print:shadow-none">

        {/* Report cover header */}
        <div className="bg-brand-gradient p-6 sm:p-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 opacity-80" />
                <span className="text-sm font-semibold opacity-80 tracking-wide uppercase">TOPSEOTOOL</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1">{report.title}</h2>
              <div className="flex items-center gap-3 text-sm opacity-80 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {report.orgName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  {report.domain}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </span>
              </div>
            </div>
            <div className="shrink-0 hidden sm:flex flex-col items-center gap-1 bg-white/10 rounded-xl p-3 text-center">
              <span className="text-3xl font-extrabold">{Math.round((report.seoScore + report.aiVisibilityScore) / 2)}</span>
              <span className="text-[10px] opacity-70 font-medium uppercase tracking-wide">Overall</span>
            </div>
          </div>
        </div>

        {/* Report body */}
        <div className="p-5 sm:p-8 space-y-8">

          {/* Executive summary */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 rounded-full bg-brand" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Executive Summary</h3>
            </div>
            <div className="p-4 rounded-xl border border-brand/20 bg-brand-muted/20">
              <p className="text-sm leading-relaxed text-foreground">{report.executiveSummary}</p>
            </div>
          </section>

          {/* Key metrics */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-brand" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Key Performance Metrics</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCell label="SEO Health" value={report.seoScore} icon={Globe} color="#22c55e" />
              <MetricCell label="AI Visibility" value={report.aiVisibilityScore} icon={Brain} color="#8b5cf6" />
              <MetricCell label="Mention Rate" value={report.mentionRate} icon={TrendingUp} color="#f59e0b" suffix="%" />
              <MetricCell label="Citation Rate" value={report.citationRate} icon={Link2} color="#3b82f6" suffix="%" />
            </div>
          </section>

          {/* Trend charts */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-brand" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Score Trends</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SEO trend */}
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">SEO Score Trend</p>
                    <p className="text-xl font-extrabold text-emerald-600">{report.seoScore}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </div>
                <TrendSparkline data={seoHistory} color="#22c55e" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                  {seoHistory.map((h) => <span key={h.date}>{h.date}</span>)}
                </div>
              </div>
              {/* AI trend */}
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">AI Visibility Trend</p>
                    <p className="text-xl font-extrabold text-violet-600">{report.aiVisibilityScore}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-violet-500" />
                </div>
                <TrendSparkline data={aiHistory} color="#8b5cf6" />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                  {aiHistory.map((h) => <span key={h.date}>{h.date}</span>)}
                </div>
              </div>
            </div>
          </section>

          {/* Technical issues */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-red-500" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Critical Technical Issues ({report.technicalIssues.length})
              </h3>
            </div>
            <div className="space-y-2">
              {report.technicalIssues.map((issue, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card text-sm">
                  <AlertCircle className={`h-4 w-4 shrink-0 ${issue.severity === "CRITICAL" ? "text-red-500" : "text-amber-500"}`} />
                  <span className="flex-1">{issue.title}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${issue.severity === "CRITICAL" ? "border-red-300 text-red-600 dark:border-red-800 dark:text-red-400" : "border-amber-300 text-amber-600 dark:border-amber-800 dark:text-amber-400"}`}
                  >
                    {issue.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </section>

          {/* Top recommendations */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-amber-500" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Top Recommendations
              </h3>
            </div>
            <div className="space-y-2">
              {report.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3.5 rounded-lg border border-border bg-card text-sm">
                  <div className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-[10px] font-bold ${rec.priority === "CRITICAL" ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-0.5">{rec.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rec.action}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{rec.priority}</Badge>
                </div>
              ))}
            </div>
          </section>

          {/* Competitor benchmark */}
          {report.competitors.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-4 rounded-full bg-violet-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Competitor Snapshot</h3>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Competitor</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground">SEO</th>
                      <th className="text-center px-4 py-2.5 text-xs font-semibold text-muted-foreground">AI Visibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/40 bg-brand-muted/10">
                      <td className="px-4 py-2.5 font-semibold text-brand text-xs">Your Site ({report.domain})</td>
                      <td className="px-4 py-2.5 text-center font-bold text-brand">{report.seoScore}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-brand">{report.aiVisibilityScore}</td>
                    </tr>
                    {report.competitors.map((c, i) => (
                      <tr key={i} className="border-b border-border/30 hover:bg-muted/20">
                        <td className="px-4 py-2.5">
                          <p className="font-medium text-xs">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.domain}</p>
                        </td>
                        <td className="px-4 py-2.5 text-center font-bold text-xs">{c.seoScore}</td>
                        <td className="px-4 py-2.5 text-center font-bold text-xs">{c.aiVisibility}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Report footer */}
          <div className="pt-6 border-t border-border/60 flex items-center justify-between flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              <span>Generated by <strong className="text-foreground">TOPSEOTOOL</strong> — Confidential</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share link card */}
      <Card className="border border-border print:hidden">
        <CardContent className="p-4 flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <Share2 className="h-4 w-4 text-brand shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">Shareable Link</p>
            <p className="text-[11px] text-muted-foreground truncate font-mono">{shareUrl}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={copyShareLink}>
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}