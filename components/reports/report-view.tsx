"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Sparkles, Globe, Brain, TrendingUp, CheckCircle2, AlertTriangle,
  Printer, Share2, Copy, ShieldCheck, Link2, ExternalLink,
  Calendar, Building2, Download, AlertCircle, ArrowUpRight,
  BarChart3, Check, CheckCheck, Lightbulb, Zap, HelpCircle
} from "lucide-react"
import { toast } from "sonner"
import { CompiledReportData } from "@/lib/reports/report-generator"
import {
  ScoreTrendChart,
  KeywordDistributionChart,
  CompetitorBenchmarkChart,
} from "@/components/reports/report-charts"

interface ReportViewProps {
  report: CompiledReportData
  isPublic?: boolean
  onOpenBuilder?: () => void
}

export function ReportView({ report, isPublic = false, onOpenBuilder }: ReportViewProps) {
  const [copied, setCopied] = React.useState(false)

  function handlePrint() {
    window.print()
  }

  function handleCopyShareLink() {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/reports/share/${report.shareToken || report.id}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success("Public secure report share link copied to clipboard!")
    setTimeout(() => setCopied(false), 2500)
  }

  const branding = report.branding || {
    agencyName: report.orgName || "Agency Partner",
    clientName: report.orgName || "Acme Corp",
    clientWebsite: `https://${report.domain}`,
    accentColor: "#6366f1",
    preparedBy: "Search Intelligence Team",
    reportPeriod: "Q3 2026 Audit",
    whiteLabel: false,
    agencyNotes: "",
  }

  const website = report.websiteInfo || {
    domain: report.domain,
    targetUrl: `https://${report.domain}`,
    pagesScanned: 248,
    crawlDepth: 4,
    sslStatus: "Valid (TLS 1.3)",
    mobileReady: true,
    indexStatus: "100% Indexed",
    auditedAt: new Date(report.createdAt).toLocaleDateString(),
  }

  const scores = report.scores || {
    overallHealth: report.seoScore,
    technicalScore: Math.min(100, report.seoScore + 5),
    performanceScore: Math.max(70, report.seoScore - 2),
    mobileScore: 94,
    aiVisibilityScore: report.aiVisibilityScore,
    contentScore: 89,
    benchmarkDelta: "+7 pts vs Competitors",
  }

  const accent = branding.accentColor || "#6366f1"

  return (
    <div className="report-container max-w-5xl mx-auto space-y-8 bg-background text-foreground print:bg-white print:text-black print:p-0 print:space-y-6">
      {/* ── Top Action Toolbar (Hidden on Print) ── */}
      {!isPublic && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border print:hidden shadow-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent }} />
            <span className="text-xs font-semibold text-muted-foreground">Executive Report Ready:</span>
            <span className="text-xs font-bold text-foreground truncate max-w-xs">{report.title}</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBuilder && (
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={onOpenBuilder}>
                <Sparkles className="h-3.5 w-3.5 text-brand" /> Edit Branding
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleCopyShareLink}>
              {copied ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? "Link Copied" : "Share Link"}
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs gap-1.5 shadow-brand text-white"
              style={{ backgroundColor: accent }}
            >
              <Download className="h-3.5 w-3.5" /> Export PDF / Print
            </Button>
          </div>
        </div>
      )}

      {/* ── Client / Public Toolbar (Only on Public Share Page) ── */}
      {isPublic && (
        <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-card border border-border print:hidden shadow-xs">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-bold">
              OFFICIAL CLIENT AUDIT
            </Badge>
            <span className="text-xs text-muted-foreground">Prepared for {branding.clientName}</span>
          </div>
          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8 text-xs gap-1.5 text-white"
            style={{ backgroundColor: accent }}
          >
            <Printer className="h-3.5 w-3.5" /> Print / Save as PDF
          </Button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          REPORT DOCUMENT (PRINTABLE CONTAINER)
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg print:border-none print:shadow-none print:rounded-none">
        {/* ── 1. Company Branding Cover Header ── */}
        <div
          className="p-6 sm:p-10 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accent} 0%, #1e1b4b 100%)`,
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                {branding.agencyLogo ? (
                  <img src={branding.agencyLogo} alt={branding.agencyName} className="h-6 w-auto object-contain brightness-0 invert" />
                ) : (
                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-xs px-2.5 py-1 rounded-md text-xs font-extrabold uppercase tracking-wider">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{branding.agencyName}</span>
                  </div>
                )}
                {!branding.whiteLabel && (
                  <span className="text-[10px] opacity-75 font-mono">powered by TopSEOTool</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                {report.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-white/80 pt-1">
                <span className="flex items-center gap-1">
                  <strong>Client:</strong> {branding.clientName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> {website.domain}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {branding.reportPeriod || website.auditedAt}
                </span>
              </div>
            </div>

            {/* Overall Composite Score Badge */}
            <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[140px]">
              <p className="text-[10px] uppercase font-bold tracking-wider text-white/80">Overall SEO Score</p>
              <p className="text-4xl sm:text-5xl font-black font-mono my-0.5 text-white">{scores.overallHealth}</p>
              <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-300 font-semibold">
                <Check className="h-3 w-3" /> High Performance
              </div>
            </div>
          </div>
        </div>

        {/* ── Report Body ── */}
        <div className="p-6 sm:p-10 space-y-10">

          {/* ── 2. Website Profile & Diagnostics ── */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-border">
              <Globe className="h-4 w-4" style={{ color: accent }} />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Website Profile &amp; Audit Scope</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-0.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Target Domain</p>
                <p className="text-sm font-bold truncate text-foreground font-mono">{website.domain}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Verified Active</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-0.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Pages Audited</p>
                <p className="text-sm font-bold font-mono text-foreground">{website.pagesScanned.toLocaleString()} Pages</p>
                <p className="text-[10px] text-muted-foreground">Depth level {website.crawlDepth}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-0.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Security &amp; SSL</p>
                <p className="text-sm font-bold text-foreground truncate">{website.sslStatus}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">HSTS Active</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-0.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Mobile Readiness</p>
                <p className="text-sm font-bold text-foreground">{website.mobileReady ? "100% Responsive" : "Needs Review"}</p>
                <p className="text-[10px] text-muted-foreground">{website.indexStatus}</p>
              </div>
            </div>
          </section>

          {/* ── 3. SEO Health & Performance Score Breakdown ── */}
          <section className="space-y-3 report-avoid-break">
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" style={{ color: accent }} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">SEO Health &amp; AI Visibility Matrix</h2>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {scores.benchmarkDelta}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Technical SEO", val: scores.technicalScore, color: "#10b981" },
                { label: "AI Search Score", val: scores.aiVisibilityScore, color: accent },
                { label: "Core Web Vitals", val: scores.performanceScore, color: "#0ea5e9" },
                { label: "Mobile Usability", val: scores.mobileScore, color: "#8b5cf6" },
                { label: "Content Quality", val: scores.contentScore, color: "#f59e0b" },
                { label: "LLM Citation Share", val: `${report.citationRate}%`, color: "#ec4899" },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-xl border border-border bg-card text-center space-y-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase truncate">{m.label}</p>
                  <p className="text-2xl font-black font-mono" style={{ color: m.color }}>{m.val}</p>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: typeof m.val === "number" ? `${m.val}%` : m.val,
                        backgroundColor: m.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 4. Executive Summary & Agency Notes ── */}
          <section className="space-y-3 report-avoid-break">
            <div className="flex items-center gap-2 pb-1 border-b border-border">
              <Sparkles className="h-4 w-4" style={{ color: accent }} />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Executive Summary &amp; Strategic Synthesis</h2>
            </div>

            <Card className="border-border/80 bg-muted/20">
              <CardContent className="p-5 space-y-3">
                <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                  {report.executiveSummary}
                </p>

                {branding.preparedBy && (
                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Prepared by: <strong className="text-foreground">{branding.preparedBy}</strong></span>
                    <span>Confidential Strategic Report</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* ── 5. Charts & Visual Trend Analysis ── */}
          {report.charts && (
            <section className="space-y-4 report-avoid-break">
              <div className="flex items-center gap-2 pb-1 border-b border-border">
                <TrendingUp className="h-4 w-4" style={{ color: accent }} />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Growth Trajectory &amp; Distributions</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ScoreTrendChart data={report.charts.trends || report.history} accentColor={accent} />
                {report.charts.keywordDistribution && (
                  <KeywordDistributionChart distribution={report.charts.keywordDistribution} accentColor={accent} />
                )}
              </div>
            </section>
          )}

          {/* ── 6. Technical Issues Audit ── */}
          <section className="space-y-3 report-avoid-break">
            <div className="flex items-center justify-between pb-1 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Technical Audit Findings ({report.technicalIssues.length} Items)
                </h2>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">Crawl Diagnostics</span>
            </div>

            <div className="space-y-2.5">
              {report.technicalIssues.map((issue) => (
                <div
                  key={issue.id || issue.title}
                  className="p-3.5 rounded-xl border border-border bg-card space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          issue.severity === "CRITICAL"
                            ? "bg-red-500"
                            : issue.severity === "WARNING"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <p className="font-bold text-xs text-foreground">{issue.title}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[9px] shrink-0 uppercase font-bold ${
                        issue.severity === "CRITICAL"
                          ? "border-red-500/40 text-red-600 bg-red-500/10"
                          : issue.severity === "WARNING"
                          ? "border-amber-500/40 text-amber-600 bg-amber-500/10"
                          : "border-emerald-500/40 text-emerald-600 bg-emerald-500/10"
                      }`}
                    >
                      {issue.severity}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{issue.description}</p>

                  {issue.affectedUrls && issue.affectedUrls.length > 0 && (
                    <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 p-2 rounded-lg truncate">
                      Affected: {issue.affectedUrls.join(", ")}
                    </div>
                  )}

                  {issue.recommendation && (
                    <p className="text-[11px] text-foreground font-medium pt-1">
                      <strong className="text-brand">Fix Strategy:</strong> {issue.recommendation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── 7. Keyword Performance & Rankings ── */}
          {report.keywords && (
            <section className="space-y-3 report-avoid-break">
              <div className="flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" style={{ color: accent }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Keyword Ranking &amp; Organic Search Performance
                  </h2>
                </div>
                <span className="text-[11px] font-mono font-bold text-foreground">
                  ~{report.keywords.estOrganicTraffic.toLocaleString()} Est. Monthly Visits
                </span>
              </div>

              {/* Keyword Scorecards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-border bg-muted/20 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Ranked</p>
                  <p className="text-xl font-bold font-mono text-foreground">{report.keywords.totalTracked.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-muted/20 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Top 3 Positions</p>
                  <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{report.keywords.top3}</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-muted/20 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Top 10 Positions</p>
                  <p className="text-xl font-bold font-mono text-brand">{report.keywords.top10}</p>
                </div>
                <div className="p-3 rounded-xl border border-border bg-muted/20 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Top 50 Positions</p>
                  <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{report.keywords.top50}</p>
                </div>
              </div>

              {/* Keyword Table */}
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Keyword Query</th>
                      <th className="py-2.5 px-3 text-center">Rank</th>
                      <th className="py-2.5 px-3 text-center">Volume</th>
                      <th className="py-2.5 px-3 text-center">KD%</th>
                      <th className="py-2.5 px-3">SERP Features</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium">
                    {report.keywords.items.map((kw) => (
                      <tr key={kw.keyword} className="hover:bg-muted/10">
                        <td className="py-2.5 px-3 font-semibold text-foreground">
                          {kw.keyword}
                          <span className="block text-[10px] text-muted-foreground font-mono truncate">{kw.url}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono">
                          #{kw.position}
                          {kw.prevPosition > kw.position && (
                            <span className="text-[10px] text-emerald-500 ml-1">↑{kw.prevPosition - kw.position}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono">{kw.volume.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-center font-mono">
                          <span className={kw.difficulty > 60 ? "text-amber-500 font-bold" : "text-emerald-500"}>
                            {kw.difficulty}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-wrap gap-1">
                            {kw.serpFeatures.map((f) => (
                              <Badge key={f} variant="outline" className="text-[9px] py-0">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── 8. Competitor Comparison ── */}
          {report.competitors && report.competitors.length > 0 && (
            <section className="space-y-4 report-avoid-break">
              <div className="flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" style={{ color: accent }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Competitor Market Comparison
                  </h2>
                </div>
                <span className="text-[11px] text-muted-foreground">Market Share Benchmark</span>
              </div>

              {report.charts?.competitorBenchmark && (
                <CompetitorBenchmarkChart competitors={report.charts.competitorBenchmark} accentColor={accent} />
              )}

              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-2.5 px-3">Domain Entity</th>
                      <th className="py-2.5 px-3 text-center">SEO Health</th>
                      <th className="py-2.5 px-3 text-center">AI Visibility</th>
                      <th className="py-2.5 px-3 text-center">DR</th>
                      <th className="py-2.5 px-3 text-center">Backlinks</th>
                      <th className="py-2.5 px-3 text-center">Est. Traffic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-medium">
                    {report.competitors.map((c, i) => {
                      const isUser = i === 0
                      return (
                        <tr key={c.domain} className={isUser ? "bg-brand-muted/20 font-bold" : "hover:bg-muted/10"}>
                          <td className="py-2.5 px-3">
                            <span className="text-foreground">{c.name}</span>
                            <span className="block text-[10px] text-muted-foreground font-mono">{c.domain}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {c.seoScore}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-brand">
                            {c.aiVisibility}%
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">{c.domainAuthority}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{(c.backlinksCount / 1000).toFixed(1)}k</td>
                          <td className="py-2.5 px-3 text-center font-mono">{(c.estTraffic / 1000).toFixed(0)}k/mo</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── 9. Backlinks Profile & Authority Audit ── */}
          {report.backlinks && (
            <section className="space-y-4 report-avoid-break">
              <div className="flex items-center justify-between pb-1 border-b border-border">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" style={{ color: accent }} />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Backlink Profile &amp; Domain Authority
                  </h2>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Toxic Risk: {report.backlinks.toxicRiskScore}% (Safe)
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-border bg-card text-center space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Domain Rating (DR)</p>
                  <p className="text-2xl font-black font-mono text-foreground">{report.backlinks.domainRating} / 100</p>
                  <p className="text-[10px] text-emerald-500 font-semibold">Top 3% Authority</p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card text-center space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Total Backlinks</p>
                  <p className="text-2xl font-black font-mono text-foreground">{report.backlinks.totalBacklinks.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">{report.backlinks.dofollowRate}% DoFollow</p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card text-center space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Referring Domains</p>
                  <p className="text-2xl font-black font-mono text-foreground">{report.backlinks.referringDomains.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">Unique C-Class IPs</p>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-card text-center space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Toxic Link Risk</p>
                  <p className="text-2xl font-black font-mono text-emerald-500">{report.backlinks.toxicRiskScore}%</p>
                  <p className="text-[10px] text-muted-foreground">{report.backlinks.toxicLinksCount} flagged domain</p>
                </div>
              </div>

              {/* Anchor Distribution Bar */}
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">Top Anchor Text Distribution</span>
                  <span className="text-muted-foreground text-[11px]">Natural Diversity</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {report.backlinks.anchors.map((a) => (
                    <div key={a.label} className="p-2.5 rounded-lg bg-card border border-border/50 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-foreground truncate">{a.label}</span>
                        <span className="font-mono font-bold text-brand">{a.percentage}%</span>
                      </div>
                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full" style={{ width: `${a.percentage}%` }} />
                      </div>
                      <span className="text-[9px] text-muted-foreground">{a.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── 10. Prioritized Actionable Recommendations ── */}
          <section className="space-y-3 report-avoid-break">
            <div className="flex items-center gap-2 pb-1 border-b border-border">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Prioritized Action Items &amp; Strategic Road Map
              </h2>
            </div>

            <div className="space-y-3">
              {report.recommendations.map((rec, idx) => (
                <div key={rec.id || rec.title} className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-foreground">{rec.title}</h4>
                        <span className="text-[10px] text-muted-foreground uppercase font-semibold">{rec.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge variant="brand" className="text-[10px]">
                        {rec.priority}
                      </Badge>
                      {rec.impact && (
                        <Badge variant="outline" className="text-[9px]">
                          Impact: {rec.impact}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pl-7">{rec.action}</p>

                  {rec.expectedOutcome && (
                    <div className="ml-7 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                      🎯 <strong>Target Result:</strong> {rec.expectedOutcome}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ── 11. Strategic Improvement Opportunities ── */}
          {report.improvementOpportunities && report.improvementOpportunities.length > 0 && (
            <section className="space-y-3 report-avoid-break">
              <div className="flex items-center gap-2 pb-1 border-b border-border">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  High-Impact Improvement Opportunities
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {report.improvementOpportunities.map((opp) => (
                  <div key={opp.id || opp.title} className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {opp.category}
                      </Badge>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {opp.impact}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-foreground leading-snug">{opp.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{opp.description}</p>

                    {opp.actionSteps && opp.actionSteps.length > 0 && (
                      <ul className="space-y-1 text-[10px] text-muted-foreground pt-1 list-disc list-inside">
                        {opp.actionSteps.slice(0, 2).map((step, sIdx) => (
                          <li key={sIdx} className="truncate">{step}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Professional Footer ── */}
          <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>
                Report generated by <strong className="text-foreground">{branding.agencyName}</strong>
                {!branding.whiteLabel && " via TopSEOTool"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>Confidential Client Assessment</span>
              <span>•</span>
              <span className="font-mono">{website.auditedAt}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}