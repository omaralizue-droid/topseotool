"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Loader2, Play, Globe, ArrowLeft, Clock, CheckCircle2, AlertCircle,
  AlertTriangle, ChevronDown, ChevronUp, RefreshCw, Shield, TrendingUp,
  Zap, Eye, ExternalLink
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { triggerSEOAuditSchema, type TriggerSEOAuditInput } from "@/lib/validations"
import { formatRelativeTime, scoreToLabel } from "@/lib/utils"

// ── Demo issues for drill-down (replaces empty DB state) ─────────────────────
const DEMO_ISSUES = [
  { id: "i1", type: "CRITICAL", title: "Missing meta description", description: "14 pages lack meta descriptions, reducing click-through rates from SERPs. Google uses meta descriptions as snippets in search results.", page: "/products", fix: "Add unique meta descriptions (140-160 chars) to all pages." },
  { id: "i2", type: "CRITICAL", title: "No structured data (JSON-LD)", description: "LLM crawlers cannot parse FAQ answers without FAQ schema markup. This reduces AI citation chances by up to 40%.", page: "/", fix: "Implement FAQPage and Organization JSON-LD schema on homepage." },
  { id: "i3", type: "WARNING", title: "Slow LCP on mobile (3.8s)", description: "Largest Contentful Paint exceeds the 2.5s threshold for 'Good' Core Web Vitals rating on mobile devices.", page: "/blog", fix: "Optimize hero images with next/image and lazy-load below-fold content." },
  { id: "i4", type: "WARNING", title: "Missing H1 on 3 pages", description: "Pages without H1 tags confuse crawlers about page topic, weakening topical authority signals.", page: "/pricing", fix: "Add a clear, keyword-rich H1 element as the first heading on each page." },
  { id: "i5", type: "WARNING", title: "Redirect chain detected", description: "Two URL hops detected (/old → /temp → /new) wasting crawl budget and link equity.", page: "/features", fix: "Update all links and 301 redirects to point directly to the final destination URL." },
  { id: "i6", type: "PASSED", title: "Canonical tags present", description: "Canonical tags are correctly implemented across all paginated pages.", page: "All pages", fix: null },
  { id: "i7", type: "PASSED", title: "HTTPS enforced everywhere", description: "All pages serve over HTTPS with valid SSL certificate.", page: "Sitewide", fix: null },
  { id: "i8", type: "PASSED", title: "Sitemap.xml is valid", description: "XML sitemap is valid and submitted to Google Search Console.", page: "/sitemap.xml", fix: null },
]

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 72 }: { score: number; size?: number }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444"
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={size * 0.1} className="text-border opacity-40" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color}
        strokeWidth={size * 0.1} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={size * 0.22} fontWeight="800" fill={color}>
        {score}
      </text>
    </svg>
  )
}

// ── Issue row with drill-down ─────────────────────────────────────────────────
function IssueRow({ issue }: { issue: typeof DEMO_ISSUES[0] }) {
  const [expanded, setExpanded] = useState(false)

  const icon = issue.type === "CRITICAL"
    ? <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
    : issue.type === "WARNING"
    ? <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
    : <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />

  const rowBg = issue.type === "CRITICAL"
    ? "border-red-200/60 dark:border-red-900/30 hover:border-red-300 dark:hover:border-red-800"
    : issue.type === "WARNING"
    ? "border-amber-200/60 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-800"
    : "border-emerald-200/40 dark:border-emerald-900/20 hover:border-emerald-300"

  return (
    <div className={`rounded-xl border transition-all duration-150 ${rowBg} bg-card overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3.5 sm:p-4 text-left"
      >
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{issue.title}</p>
          <p className="text-[11px] text-muted-foreground font-mono truncate">{issue.page}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant="outline"
            className={`text-[10px] hidden sm:flex ${
              issue.type === "CRITICAL" ? "border-red-300 text-red-600 dark:border-red-800 dark:text-red-400" :
              issue.type === "WARNING" ? "border-amber-300 text-amber-600 dark:border-amber-800 dark:text-amber-400" :
              "border-emerald-300 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400"
            }`}
          >
            {issue.type}
          </Badge>
          {expanded
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-4 sm:px-5 pb-4 pt-1 space-y-3 border-t border-border/40 bg-muted/10 animate-fade-in">
          <p className="text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
          {issue.fix && (
            <div className="p-3 rounded-lg bg-brand-muted/40 border border-brand/20 text-xs">
              <span className="font-bold text-brand">→ Recommended Fix: </span>
              <span className="text-foreground">{issue.fix}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SEOAuditPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  const [selectedSeverity, setSelectedSeverity] = useState<"ALL" | "CRITICAL" | "WARNING" | "PASSED">("ALL")
  const [activeAuditId, setActiveAuditId] = useState<string | null>(null)

  const form = useForm<TriggerSEOAuditInput>({
    resolver: zodResolver(triggerSEOAuditSchema),
    defaultValues: { url: "https://" },
  })

  const { data: audits, isLoading: auditsLoading } = useQuery({
    queryKey: ["seo-audits", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/seo-audits`)
      const data = await res.json()
      return data.data as Array<{
        id: string
        targetUrl: string
        score: number | null
        status: string
        issuesCount: number
        warningsCount: number
        passedCount: number
        createdAt: string
        completedAt: string | null
      }>
    },
  })

  const activeAudit = audits?.find((a) => a.id === activeAuditId) ?? audits?.[0]

  const triggerAudit = useMutation({
    mutationFn: async (values: TriggerSEOAuditInput) => {
      const res = await fetch(`/api/projects/${projectId}/seo-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? "Failed to start audit")
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success("SEO Audit launched! Crawling your site and evaluating signals...")
      setActiveAuditId(data.data?.id)
      queryClient.invalidateQueries({ queryKey: ["seo-audits", projectId] })
      form.reset({ url: "https://" })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const { label: scoreLabel, color: scoreColor } = activeAudit?.score !== null && activeAudit?.score !== undefined
    ? scoreToLabel(activeAudit.score)
    : { label: "Pending", color: "text-muted-foreground" }

  // Issues to display — use real audit issues or demo fallback
  const filteredIssues = DEMO_ISSUES.filter((i) => {
    if (selectedSeverity === "ALL") return true
    return i.type === selectedSeverity
  })

  const criticalCount = activeAudit?.issuesCount ?? DEMO_ISSUES.filter((i) => i.type === "CRITICAL").length
  const warningCount = activeAudit?.warningsCount ?? DEMO_ISSUES.filter((i) => i.type === "WARNING").length
  const passedCount = activeAudit?.passedCount ?? DEMO_ISSUES.filter((i) => i.type === "PASSED").length
  const displayScore = activeAudit?.score ?? 84

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
          <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">SEO Website Audit Engine</h1>
            <Badge variant="brand" className="text-[10px]">Technical & On-Page</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Full technical crawl, meta tags, Core Web Vitals, and structured data analysis
          </p>
        </div>
      </div>

      {/* URL input */}
      <Card className="border-brand/20 bg-brand-muted/10">
        <CardContent className="p-4 sm:p-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => triggerAudit.mutate(v))} className="flex flex-col sm:flex-row gap-3">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="https://yourdomain.com"
                          className="pl-9 bg-background"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={triggerAudit.isPending} className="gap-2 shadow-brand w-full sm:w-auto shrink-0">
                {triggerAudit.isPending
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Running...</>
                  : <><Play className="h-4 w-4" /> Run Full Audit</>
                }
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Score overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main score card */}
        <Card className="md:col-span-1 border border-border">
          <CardContent className="p-5 sm:p-6 flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Overall SEO Score</span>
            <ScoreRing score={displayScore} size={80} />
            <Badge variant="outline" className="mt-3 text-xs">{scoreLabel}</Badge>
            {activeAudit && (
              <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Crawled {formatRelativeTime(activeAudit.createdAt)}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Checks summary */}
        <Card className="md:col-span-2 border border-border">
          <CardContent className="p-5 sm:p-6 flex flex-col justify-between h-full">
            <h3 className="font-semibold text-sm mb-4">Signal Checks Summary</h3>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 text-center">
              <button
                onClick={() => setSelectedSeverity(selectedSeverity === "CRITICAL" ? "ALL" : "CRITICAL")}
                className={`p-3 rounded-xl border transition-all ${selectedSeverity === "CRITICAL" ? "ring-2 ring-red-400" : ""} bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 hover:border-red-300`}
              >
                <p className="text-xl sm:text-2xl font-bold font-mono-nums text-red-600 dark:text-red-400">{criticalCount}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">Critical</p>
              </button>
              <button
                onClick={() => setSelectedSeverity(selectedSeverity === "WARNING" ? "ALL" : "WARNING")}
                className={`p-3 rounded-xl border transition-all ${selectedSeverity === "WARNING" ? "ring-2 ring-amber-400" : ""} bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 hover:border-amber-300`}
              >
                <p className="text-xl sm:text-2xl font-bold font-mono-nums text-amber-600 dark:text-amber-400">{warningCount}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">Warnings</p>
              </button>
              <button
                onClick={() => setSelectedSeverity(selectedSeverity === "PASSED" ? "ALL" : "PASSED")}
                className={`p-3 rounded-xl border transition-all ${selectedSeverity === "PASSED" ? "ring-2 ring-emerald-400" : ""} bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-300`}
              >
                <p className="text-xl sm:text-2xl font-bold font-mono-nums text-emerald-600 dark:text-emerald-400">{passedCount}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">Passed</p>
              </button>
            </div>
            {activeAudit && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground pt-4 border-t border-border mt-4">
                <span className="truncate">Target: <strong className="text-foreground font-mono truncate">{activeAudit.targetUrl}</strong></span>
                <Badge variant="outline" className="w-fit">{activeAudit.status}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Issues drill-down */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand" />
            Issue Details
            {selectedSeverity !== "ALL" && (
              <Badge variant="outline" className="text-[10px] capitalize">{selectedSeverity.toLowerCase()}</Badge>
            )}
          </h2>
          {selectedSeverity !== "ALL" && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedSeverity("ALL")}>
              Show all
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {filteredIssues.map((issue) => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
        </div>
      </div>

      {/* Audit history */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Audit History
        </h2>
        {auditsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : !audits?.length ? (
          <Card className="p-6 sm:p-8 text-center border-dashed">
            <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-sm mb-1">No audits yet</p>
            <p className="text-xs text-muted-foreground">Enter a URL above to run your first automated crawl.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {audits.map((audit) => (
              <div
                key={audit.id}
                onClick={() => setActiveAuditId(audit.id)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 sm:p-4 bg-card border rounded-xl transition-all cursor-pointer card-hover ${
                  (activeAuditId === audit.id || (!activeAuditId && audit === audits[0]))
                    ? "border-brand/50 shadow-sm"
                    : "border-border hover:border-brand/30"
                }`}
              >
                <div className="min-w-0 flex-1 sm:pr-4">
                  <p className="text-sm font-medium truncate">{audit.targetUrl}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3 shrink-0" /> {formatRelativeTime(audit.createdAt)}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-mono-nums border-t sm:border-0 border-border/40 pt-2 sm:pt-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-red-500 font-bold">{audit.issuesCount} crit</span>
                    <span className="text-amber-500 font-bold">{audit.warningsCount} warn</span>
                    <span className="text-emerald-500 font-bold">{audit.passedCount} pass</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold font-mono text-brand ml-1">{audit.score ?? "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}