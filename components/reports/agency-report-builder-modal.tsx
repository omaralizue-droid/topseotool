"use client"

import React, { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Building2, Globe, Sparkles, Palette, FileText, Check,
  Download, Printer, Share2, Loader2, ShieldCheck, CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import { CompiledReportData, compileProjectReport } from "@/lib/reports/report-generator"

export interface AgencyReportConfig {
  agencyName: string
  agencyLogo: string
  clientName: string
  clientWebsite: string
  accentColor: string
  preparedBy: string
  reportPeriod: string
  whiteLabel: boolean
  agencyNotes: string
  sections: {
    seoScores: boolean
    technicalIssues: boolean
    keywords: boolean
    competitors: boolean
    backlinks: boolean
    recommendations: boolean
    charts: boolean
    opportunities: boolean
  }
}

const ACCENT_COLORS = [
  { label: "Indigo Royal", value: "#6366f1" },
  { label: "Emerald Growth", value: "#10b981" },
  { label: "Ocean Blue", value: "#0ea5e9" },
  { label: "Electric Violet", value: "#8b5cf6" },
  { label: "Crimson Red", value: "#f43f5e" },
  { label: "Amber Gold", value: "#f59e0b" },
]

interface AgencyReportBuilderModalProps {
  projectId?: string
  defaultDomain?: string
  defaultClientName?: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialBranding?: Partial<AgencyReportConfig>
  onReportGenerated?: (report: CompiledReportData) => void
}

export function AgencyReportBuilderModal({
  projectId = "demo",
  defaultDomain = "topseotool.net",
  defaultClientName = "Acme Corp",
  trigger,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  initialBranding,
  onReportGenerated,
}: AgencyReportBuilderModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen : internalOpen
  const setOpen = (val: boolean) => {
    if (externalOnOpenChange) externalOnOpenChange(val)
    setInternalOpen(val)
  }
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [config, setConfig] = useState<AgencyReportConfig>({
    agencyName: initialBranding?.agencyName || "Apex Growth Marketing",
    agencyLogo: initialBranding?.agencyLogo || "",
    clientName: initialBranding?.clientName || defaultClientName,
    clientWebsite: initialBranding?.clientWebsite || (defaultDomain.startsWith("http") ? defaultDomain : `https://${defaultDomain}`),
    accentColor: initialBranding?.accentColor || "#6366f1",
    preparedBy: initialBranding?.preparedBy || "Search Intelligence & Strategy Team",
    reportPeriod: initialBranding?.reportPeriod || "Q3 2026 Executive SEO & AI Search Review",
    whiteLabel: initialBranding?.whiteLabel ?? true,
    agencyNotes: initialBranding?.agencyNotes || "This strategic audit outlines your domain's technical health, keyword growth trajectory, competitive moat, and actionable recommendations to accelerate organic search capture and generative AI citations.",
    sections: initialBranding?.sections || {
      seoScores: true,
      technicalIssues: true,
      keywords: true,
      competitors: true,
      backlinks: true,
      recommendations: true,
      charts: true,
      opportunities: true,
    },
  })

  const handleGenerate = async () => {
    setIsSubmitting(true)
    try {
      const targetDomain = config.clientWebsite.replace(/^https?:\/\//, "").replace(/\/.*$/, "") || defaultDomain

      // Compile locally with full branding
      const compiled = compileProjectReport(
        `${config.clientName} — SEO & AI Search Executive Audit`,
        config.agencyName,
        targetDomain,
        86,
        92,
        {
          branding: {
            agencyName: config.agencyName,
            agencyLogo: config.agencyLogo,
            clientName: config.clientName,
            clientWebsite: config.clientWebsite,
            accentColor: config.accentColor,
            preparedBy: config.preparedBy,
            reportPeriod: config.reportPeriod,
            whiteLabel: config.whiteLabel,
            agencyNotes: config.agencyNotes,
          },
          period: config.reportPeriod,
        }
      )

      // Post to API if in authenticated environment
      try {
        const res = await fetch("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            title: `${config.clientName} Executive SEO Report`,
            config,
          }),
        })

        if (res.ok) {
          const json = await res.json()
          if (json?.data?.report?.id) {
            compiled.id = json.data.report.id
            compiled.shareToken = json.data.report.id
          }
        }
      } catch {
        // Continue with local compiled data
      }

      if (onReportGenerated) {
        onReportGenerated(compiled)
      }

      toast.success("Professional client report generated successfully!")
      setOpen(false)
    } catch {
      toast.error("Failed to generate report")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="brand" className="gap-2 shadow-brand">
            <Sparkles className="h-4 w-4" />
            Generate Client Report
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="brand" className="text-[10px] uppercase font-bold tracking-wider">
              Agency Suite
            </Badge>
            <span className="text-xs text-muted-foreground">White-Label PDF Engine</span>
          </div>
          <DialogTitle className="text-xl">Generate Professional Client Report</DialogTitle>
          <DialogDescription className="text-xs">
            Create a custom white-labeled executive PDF report for clients with your company branding, custom accents, and tailored strategic notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2 text-xs">
          {/* Agency & Client Branding Block */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="font-bold flex items-center gap-2 text-foreground text-sm">
                <Building2 className="h-4 w-4 text-brand" /> Agency &amp; Client Branding
              </span>
              <div className="flex items-center gap-2">
                <Label htmlFor="wl-toggle" className="text-xs cursor-pointer font-medium">
                  100% White-Label
                </Label>
                <Switch
                  id="wl-toggle"
                  checked={config.whiteLabel}
                  onCheckedChange={(val) => setConfig({ ...config, whiteLabel: val })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">Your Agency Name</Label>
                <Input
                  value={config.agencyName}
                  onChange={(e) => setConfig({ ...config, agencyName: e.target.value })}
                  placeholder="e.g. Apex Marketing Group"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">Prepared By / Author</Label>
                <Input
                  value={config.preparedBy}
                  onChange={(e) => setConfig({ ...config, preparedBy: e.target.value })}
                  placeholder="e.g. Lead SEO Strategist"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">Client Company Name</Label>
                <Input
                  value={config.clientName}
                  onChange={(e) => setConfig({ ...config, clientName: e.target.value })}
                  placeholder="e.g. Acme Corporation"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">Client Website / URL</Label>
                <Input
                  value={config.clientWebsite}
                  onChange={(e) => setConfig({ ...config, clientWebsite: e.target.value })}
                  placeholder="https://example.com"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Accent Color Picker */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" /> Report Brand Accent Color
              </Label>
              <div className="flex items-center gap-2 flex-wrap">
                {ACCENT_COLORS.map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setConfig({ ...config, accentColor: col.value })}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                      config.accentColor === col.value
                        ? "border-foreground shadow-xs bg-background"
                        : "border-border/60 hover:bg-background/50"
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: col.value }} />
                    <span>{col.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Period & Custom Guidance */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
            <span className="font-bold flex items-center gap-2 text-foreground text-sm pb-1 border-b border-border/60">
              <FileText className="h-4 w-4 text-brand" /> Report Period &amp; Executive Letter
            </span>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">Report Period Title</Label>
              <Input
                value={config.reportPeriod}
                onChange={(e) => setConfig({ ...config, reportPeriod: e.target.value })}
                placeholder="e.g. Q3 2026 Audit & Growth Strategy"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground">
                Agency Executive Note / Strategic Commentary
              </Label>
              <textarea
                value={config.agencyNotes}
                onChange={(e) => setConfig({ ...config, agencyNotes: e.target.value })}
                rows={3}
                placeholder="Custom introductory note addressed to your client..."
                className="w-full text-xs p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Section Inclusions */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
            <span className="font-bold text-foreground text-sm">Included Report Sections</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: "seoScores", label: "SEO Health Scores" },
                { key: "technicalIssues", label: "Technical Issues" },
                { key: "keywords", label: "Keyword Rankings" },
                { key: "competitors", label: "Competitor Benchmarks" },
                { key: "backlinks", label: "Backlinks & Authority" },
                { key: "recommendations", label: "Action Items" },
                { key: "charts", label: "Visual Trend Charts" },
                { key: "opportunities", label: "Growth Opportunities" },
              ].map((s) => (
                <label
                  key={s.key}
                  className="flex items-center gap-2 p-2 rounded-lg bg-background border border-border/60 cursor-pointer hover:border-brand/40 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={config.sections[s.key as keyof typeof config.sections]}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sections: { ...config.sections, [s.key]: e.target.checked },
                      })
                    }
                    className="rounded text-brand focus:ring-brand h-3.5 w-3.5"
                  />
                  <span className="text-[11px] font-medium truncate">{s.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>PDF Vector Quality • 100% Client Ready</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={handleGenerate}
              disabled={isSubmitting}
              className="gap-2 shadow-brand"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate Client Report
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
