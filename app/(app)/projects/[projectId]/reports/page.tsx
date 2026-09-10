"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Download, Share2, Copy, Check, Printer,
  Globe, Brain, TrendingUp, Link2, AlertCircle,
  Calendar, Building2, Shield, Sparkles, Plus,
  Layers, FileText, History, CheckCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { CompiledReportData, compileProjectReport } from "@/lib/reports/report-generator"
import { ReportView } from "@/components/reports/report-view"
import { AgencyReportBuilderModal } from "@/components/reports/agency-report-builder-modal"

export default function ProjectReportsPage() {
  const params = useParams()
  const projectId = (params?.projectId as string) || "demo"
  const [builderOpen, setBuilderOpen] = useState(false)
  const [projectData, setProjectData] = useState<any>(null)

  // Default initial compiled report
  const [currentReport, setCurrentReport] = useState<CompiledReportData>(() =>
    compileProjectReport(
      "Executive SEO & AI Search Audit",
      "Apex Growth Marketing",
      "topseotool.net",
      86,
      92,
      {
        branding: {
          agencyName: "Apex Growth Marketing",
          clientName: "Acme Corporation",
          clientWebsite: "https://topseotool.net",
          accentColor: "#6366f1",
          preparedBy: "Search Intelligence Team",
          reportPeriod: "Q3 2026 Audit & Growth Strategy",
          whiteLabel: true,
          agencyNotes: "This quarterly review highlights your technical health gains (+7 pts vs industry), strong ChatGPT & Perplexity visibility (92%), and outlines the strategic action items for capturing competitor backlink share.",
        },
      }
    )
  )

  const [savedReports, setSavedReports] = useState<any[]>([])

  // Load project information and saved reports
  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, reportsRes] = await Promise.all([
          fetch(`/api/projects/${projectId}`),
          fetch("/api/reports"),
        ])

        if (projRes.ok) {
          const json = await projRes.json()
          if (json.ok && json.data) {
            setProjectData(json.data)
            const domain = json.data.domain || (json.data.websites && json.data.websites[0]?.domain) || "topseotool.net"
            setCurrentReport((prev) =>
              compileProjectReport(
                `${json.data.name || "Client"} Executive SEO Report`,
                prev.branding.agencyName,
                domain,
                86,
                92,
                {
                  branding: {
                    ...prev.branding,
                    clientName: json.data.name || prev.branding.clientName,
                    clientWebsite: `https://${domain}`,
                  },
                }
              )
            )
          }
        }

        if (reportsRes.ok) {
          const reportsJson = await reportsRes.json()
          if (reportsJson.ok && reportsJson.data) {
            setSavedReports(reportsJson.data)
          }
        }
      } catch {
        // Fallback to local default state
      }
    }
    loadData()
  }, [projectId])

  const handleReportGenerated = (newReport: CompiledReportData) => {
    setCurrentReport(newReport)
    setSavedReports((prev) => [
      {
        id: newReport.id,
        title: newReport.title,
        createdAt: newReport.createdAt,
        type: "EXECUTIVE_SUMMARY",
        config: newReport.branding,
      },
      ...prev,
    ])
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* ── Page Header (Hidden when printing) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
            <Link href={`/projects/${projectId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Executive Client Reports</h1>
              <Badge variant="brand" className="text-[10px] uppercase font-bold">
                Agency Suite
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Generate white-labeled PDF reports with custom branding, executive summaries, and multi-channel audit data.
            </p>
          </div>
        </div>

        {/* Action Button: Open Agency Report Builder Modal */}
        <div className="flex items-center gap-2">
          <AgencyReportBuilderModal
            projectId={projectId}
            defaultDomain={currentReport.domain}
            defaultClientName={currentReport.branding.clientName}
            open={builderOpen}
            onOpenChange={setBuilderOpen}
            initialBranding={currentReport.branding}
            onReportGenerated={handleReportGenerated}
            trigger={
              <Button variant="brand" size="sm" className="gap-2 shadow-brand">
                <Sparkles className="h-4 w-4" />
                <span>Create Client Report</span>
              </Button>
            }
          />
        </div>
      </div>

      {/* ── Tabs: Live Report Document vs Saved Reports History ── */}
      <Tabs defaultValue="current" className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <TabsList className="bg-muted/60 p-1">
            <TabsTrigger value="current" className="text-xs gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Live Report Document
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs gap-1.5">
              <History className="h-3.5 w-3.5" /> Report Archive ({savedReports.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Live Interactive & Printable Report */}
        <TabsContent value="current" className="space-y-6 focus-visible:outline-none">
          <ReportView
            report={currentReport}
            isPublic={false}
            onOpenBuilder={() => setBuilderOpen(true)}
          />
        </TabsContent>

        {/* Tab 2: Saved Reports History */}
        <TabsContent value="history" className="space-y-4 focus-visible:outline-none print:hidden">
          {savedReports.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <h3 className="font-semibold text-sm">No archived reports yet</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Use the &quot;Create Client Report&quot; button above to configure and save white-labeled reports for this project.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedReports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl border border-border bg-card hover:border-brand/40 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground truncate">{r.title}</h4>
                      <Badge variant="outline" className="text-[10px]">
                        {r.type || "EXECUTIVE"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => {
                        const targetDomain = currentReport.domain
                        const loaded = compileProjectReport(
                          r.title,
                          r.config?.agencyName || "Agency Partner",
                          targetDomain,
                          86,
                          92,
                          { branding: r.config }
                        )
                        loaded.id = r.id
                        loaded.shareToken = r.id
                        setCurrentReport(loaded)
                        toast.success("Loaded report into preview!")
                      }}
                    >
                      Preview
                    </Button>

                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
                      <Link href={`/reports/share/${r.id}`} target="_blank">
                        <Share2 className="h-3 w-3" /> Share Link
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}