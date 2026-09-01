"use client"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Globe, Brain, TrendingUp, CheckCircle2, AlertTriangle, Printer, Share2, Copy } from "lucide-react"
import { toast } from "sonner"
import { CompiledReportData } from "@/lib/reports/report-generator"

interface ReportViewProps {
  report: CompiledReportData
  isPublic?: boolean
}

export function ReportView({ report, isPublic = false }: ReportViewProps) {
  function handlePrint() {
    window.print()
  }

  function handleCopyShareLink() {
    const url = `${window.location.origin}/reports/share/${report.shareToken}`
    navigator.clipboard.writeText(url)
    toast.success("Public secure report share link copied to clipboard!")
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 md:p-10 bg-background text-foreground border border-border/60 rounded-xl shadow-lg print:border-none print:shadow-none print:p-0">
      {/* Header with Branding */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-extrabold tracking-tight text-xl text-brand font-mono">TOPSEOTOOL</span>
            <Badge variant="outline" className="text-[10px]">EXECUTIVE REPORT</Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{report.title}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Prepared for <strong className="text-foreground">{report.orgName}</strong> ({report.domain}) • Generated {new Date(report.createdAt).toLocaleDateString()}
          </p>
        </div>

        {!isPublic && (
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Button size="sm" variant="outline" className="h-8 text-xs flex-1 sm:flex-none" onClick={handleCopyShareLink}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share Link
            </Button>
            <Button size="sm" variant="brand" className="h-8 text-xs flex-1 sm:flex-none" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Print / PDF
            </Button>
          </div>
        )}
      </div>

      {/* Executive Summary */}
      <Card className="bg-brand-muted/20 border-brand/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-brand">
            <Sparkles className="h-4 w-4" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs sm:text-sm text-foreground leading-relaxed italic">
            &ldquo;{report.executiveSummary}&rdquo;
          </p>
        </CardContent>
      </Card>

      {/* Metric Score Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-lg bg-card border border-border text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase mb-1">SEO Health</p>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono-nums text-emerald-600 dark:text-emerald-400">{report.seoScore}/100</p>
        </div>

        <div className="p-3 sm:p-4 rounded-lg bg-card border border-border text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase mb-1">AI Visibility</p>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono-nums text-brand">{report.aiVisibilityScore}%</p>
        </div>

        <div className="p-3 sm:p-4 rounded-lg bg-card border border-border text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase mb-1">Mention Rate</p>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono-nums text-amber-600 dark:text-amber-400">{report.mentionRate}%</p>
        </div>

        <div className="p-3 sm:p-4 rounded-lg bg-card border border-border text-center">
          <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase mb-1">Citation Share</p>
          <p className="text-2xl sm:text-3xl font-extrabold font-mono-nums text-sky-600 dark:text-sky-400">{report.citationRate}%</p>
        </div>
      </div>

      {/* Technical Issues */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Key Technical Audit Findings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {report.technicalIssues.map((issue) => (
            <div key={issue.title} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between gap-2 text-xs">
              <span className="font-medium truncate">{issue.title}</span>
              <Badge variant={issue.severity === "CRITICAL" ? "error" : "secondary"} className="text-[10px] shrink-0">
                {issue.severity}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Actionable Recommendations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Recommended Action Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {report.recommendations.map((rec) => (
            <div key={rec.title} className="p-3 rounded-lg border border-border bg-card text-xs space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-foreground truncate">{rec.title}</span>
                <Badge variant="brand" className="text-[10px] shrink-0">{rec.priority}</Badge>
              </div>
              <p className="text-muted-foreground">{rec.action}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer Branding */}
      <div className="pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Powered by <strong>TOPSEOTOOL AI Search &amp; SEO Intelligence Platform</strong></span>
        <span>topseotool.net</span>
      </div>
    </div>
  )
}