"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Loader2, Play, Globe, ArrowLeft, Clock
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { triggerSEOAuditSchema, type TriggerSEOAuditInput } from "@/lib/validations"
import { formatRelativeTime, scoreToLabel } from "@/lib/utils"

export default function SEOAuditPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL")
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
      toast.success("SEO Audit launched! Crawling site and evaluating signals...")
      setActiveAuditId(data.data?.id)
      queryClient.invalidateQueries({ queryKey: ["seo-audits", projectId] })
      form.reset({ url: "https://" })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const { label: scoreLabel, color: scoreColor } = activeAudit?.score !== null && activeAudit?.score !== undefined
    ? scoreToLabel(activeAudit.score)
    : { label: "Pending", color: "text-muted-foreground" }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">SEO Website Audit Engine</h1>
              <Badge variant="brand">Technical & On-Page</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Comprehensive technical crawl, meta tags, and structured data analysis</p>
          </div>
        </div>
      </div>

      {/* Crawl form */}
      <Card>
        <CardContent className="p-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => triggerAudit.mutate(v))} className="flex gap-3">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="https://example.com" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={triggerAudit.isPending}>
                {triggerAudit.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                Run Full Audit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Audit Overview Header */}
      {activeAudit && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Main Score Card */}
          <Card className="md:col-span-1 flex flex-col justify-center items-center p-6 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Overall SEO Score</span>
            <div className="relative flex items-center justify-center my-2">
              <span className={`text-5xl font-extrabold font-mono-nums ${scoreColor}`}>
                {activeAudit.score ?? "—"}
              </span>
            </div>
            <Badge variant="outline" className="mt-1 text-xs">{scoreLabel}</Badge>
            <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Crawled {formatRelativeTime(activeAudit.createdAt)}
            </p>
          </Card>

          {/* Checks Summary Card */}
          <Card className="md:col-span-2 p-6 flex flex-col justify-between">
            <h3 className="font-semibold text-sm mb-4">Signal Checks Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center mb-4">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                <p className="text-2xl font-bold font-mono-nums text-red-600 dark:text-red-400">{activeAudit.issuesCount}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Critical</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
                <p className="text-2xl font-bold font-mono-nums text-amber-600 dark:text-amber-400">{activeAudit.warningsCount}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Warnings</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30">
                <p className="text-2xl font-bold font-mono-nums text-emerald-600 dark:text-emerald-400">{activeAudit.passedCount}</p>
                <p className="text-xs text-muted-foreground font-medium mt-0.5">Passed</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <span>Target: <strong className="text-foreground font-mono">{activeAudit.targetUrl}</strong></span>
              <Badge variant="outline">{activeAudit.status}</Badge>
            </div>
          </Card>
        </div>
      )}

      {/* Audit History List */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Audit History</h2>
        {auditsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : !audits?.length ? (
          <Card className="p-8 text-center border-dashed">
            <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-sm mb-1">No audits recorded yet</p>
            <p className="text-xs text-muted-foreground">Enter a website URL above to initiate your first automated crawl.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {audits.map((audit) => (
              <div
                key={audit.id}
                onClick={() => setActiveAuditId(audit.id)}
                className={`flex items-center justify-between p-4 bg-card border rounded-lg transition-all cursor-pointer ${
                  activeAuditId === audit.id ? "border-brand shadow-sm" : "border-border hover:border-brand/30"
                }`}
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="text-sm font-medium truncate">{audit.targetUrl}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" /> {formatRelativeTime(audit.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono-nums">
                  <span className="text-red-500 font-bold">{audit.issuesCount} critical</span>
                  <span className="text-amber-500 font-bold">{audit.warningsCount} warnings</span>
                  <span className="text-emerald-500 font-bold">{audit.passedCount} passed</span>
                  <span className="text-xl font-bold font-mono text-brand ml-2">{audit.score ?? "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}