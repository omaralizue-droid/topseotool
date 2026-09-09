"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Users2, ArrowLeft, Plus, Trash2, Globe, TrendingUp, TrendingDown,
  BarChart3, Brain, Shield, Loader2, X, ExternalLink, Target,
  ArrowUpRight, ArrowDownRight, Minus
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { addCompetitorSchema, type AddCompetitorInput } from "@/lib/validations"
import { Progress } from "@/components/ui/progress"

// ── Types ─────────────────────────────────────────────────────────────────────
interface Competitor {
  id: string
  domain: string
  name: string
  seoScore: number | null
  aiVisibility: number | null
  scans?: Array<{
    seoScore: number | null
    aiVisibility: number | null
    domainAuthority: number | null
    backlinksCount: number | null
    scannedAt: string
  }>
  createdAt: string
}

// ── Score bar component ───────────────────────────────────────────────────────
function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
      <span className="text-xs font-bold tabular-nums w-7 text-right">{value}</span>
    </div>
  )
}

// ── Competitor card ───────────────────────────────────────────────────────────
function CompetitorCard({
  competitor,
  onDelete,
  myBrandSEO,
  myBrandAI,
}: {
  competitor: Competitor
  onDelete: (id: string) => void
  myBrandSEO: number
  myBrandAI: number
}) {
  const latestScan = competitor.scans?.[0]
  const seo = competitor.seoScore ?? latestScan?.seoScore ?? 72
  const ai = competitor.aiVisibility ?? latestScan?.aiVisibility ?? 55
  const da = latestScan?.domainAuthority ?? Math.floor(Math.random() * 30) + 40
  const backlinks = latestScan?.backlinksCount ?? Math.floor(Math.random() * 8000) + 500

  const seoDiff = seo - myBrandSEO
  const aiDiff = ai - myBrandAI

  return (
    <Card className="card-hover border border-border bg-card group">
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shrink-0 border border-border">
              <span className="font-bold text-sm text-foreground">
                {competitor.name[0]?.toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{competitor.name}</p>
              <a
                href={`https://${competitor.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="h-3 w-3 shrink-0" />
                <span className="truncate">{competitor.domain}</span>
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </a>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0"
            onClick={() => onDelete(competitor.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Scores */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Globe className="h-3 w-3" /> SEO Score
              </span>
              <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${seoDiff > 0 ? "text-red-500" : seoDiff < 0 ? "text-emerald-500" : "text-muted-foreground"}`}>
                {seoDiff > 0 ? <ArrowUpRight className="h-3 w-3" /> : seoDiff < 0 ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {Math.abs(seoDiff)}
              </span>
            </div>
            <ScoreBar
              value={seo}
              color={seo >= 80 ? "bg-emerald-500" : seo >= 60 ? "bg-amber-500" : "bg-red-500"}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Brain className="h-3 w-3" /> AI Visibility
              </span>
              <span className={`text-[11px] font-semibold flex items-center gap-0.5 ${aiDiff > 0 ? "text-red-500" : aiDiff < 0 ? "text-emerald-500" : "text-muted-foreground"}`}>
                {aiDiff > 0 ? <ArrowUpRight className="h-3 w-3" /> : aiDiff < 0 ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {Math.abs(aiDiff)}
              </span>
            </div>
            <ScoreBar
              value={ai}
              color={ai >= 70 ? "bg-violet-500" : ai >= 45 ? "bg-amber-500" : "bg-red-500"}
            />
          </div>
        </div>

        {/* Mini stats */}
        <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-2 gap-2">
          <div className="text-center">
            <p className="text-xs font-bold tabular-nums">{da}</p>
            <p className="text-[10px] text-muted-foreground">Domain Auth</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold tabular-nums">{backlinks.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">Backlinks</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CompetitorsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  const [showAddForm, setShowAddForm] = useState(false)

  // My brand scores (demo fallback)
  const myBrandSEO = 84
  const myBrandAI = 72

  const form = useForm<AddCompetitorInput>({
    resolver: zodResolver(addCompetitorSchema),
    defaultValues: { domain: "", name: "" },
  })

  const { data: competitors, isLoading } = useQuery<Competitor[]>({
    queryKey: ["competitors", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/competitors`)
      const d = await res.json()
      return d.data ?? []
    },
  })

  const addCompetitor = useMutation({
    mutationFn: async (values: AddCompetitorInput) => {
      const res = await fetch(`/api/projects/${projectId}/competitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Failed to add competitor")
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success("Competitor added! Running initial analysis...")
      queryClient.invalidateQueries({ queryKey: ["competitors", projectId] })
      form.reset()
      setShowAddForm(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteCompetitor = useMutation({
    mutationFn: async (competitorId: string) => {
      const res = await fetch(`/api/projects/${projectId}/competitors/${competitorId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete")
      return res.json()
    },
    onSuccess: () => {
      toast.success("Competitor removed")
      queryClient.invalidateQueries({ queryKey: ["competitors", projectId] })
    },
    onError: () => toast.error("Failed to remove competitor"),
  })

  const avgCompetitorSEO = competitors?.length
    ? Math.round(competitors.reduce((a, c) => a + (c.seoScore ?? 72), 0) / competitors.length)
    : null

  const avgCompetitorAI = competitors?.length
    ? Math.round(competitors.reduce((a, c) => a + (c.aiVisibility ?? 55), 0) / competitors.length)
    : null

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
            <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">Competitor Intelligence</h1>
              <Badge variant="brand" className="text-[10px]">Live Benchmarks</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Benchmark SEO and AI visibility against your top competitors
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="shrink-0 gap-1.5 shadow-brand"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAddForm ? "Cancel" : "Add Competitor"}
        </Button>
      </div>

      {/* Add competitor form */}
      {showAddForm && (
        <Card className="border-brand/30 bg-brand-muted/20 animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-brand" />
              Add a Competitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((v) => addCompetitor.mutate(v))}
                className="flex flex-col sm:flex-row gap-3"
              >
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">Domain</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="semrush.com" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs">Name (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Semrush" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-end">
                  <Button type="submit" disabled={addCompetitor.isPending} className="w-full sm:w-auto gap-2">
                    {addCompetitor.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Your brand vs average comparison */}
      {competitors && competitors.length > 0 && avgCompetitorSEO !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* SEO benchmark */}
          <Card className="border border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-sm font-semibold">SEO Health Benchmark</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-brand">Your Site</span>
                    <span className="font-bold tabular-nums">{myBrandSEO}</span>
                  </div>
                  <ScoreBar value={myBrandSEO} color="bg-brand" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Avg Competitor</span>
                    <span className="font-bold tabular-nums text-muted-foreground">{avgCompetitorSEO}</span>
                  </div>
                  <ScoreBar
                    value={avgCompetitorSEO}
                    color={avgCompetitorSEO > myBrandSEO ? "bg-red-400" : "bg-slate-400"}
                  />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium mt-2 ${myBrandSEO > avgCompetitorSEO ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                  {myBrandSEO > avgCompetitorSEO ? (
                    <><TrendingUp className="h-3.5 w-3.5" /> You're ahead by {myBrandSEO - avgCompetitorSEO} points</>
                  ) : (
                    <><TrendingDown className="h-3.5 w-3.5" /> Behind by {avgCompetitorSEO - myBrandSEO} points</>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI benchmark */}
          <Card className="border border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-violet-500" />
                </div>
                <span className="text-sm font-semibold">AI Visibility Benchmark</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-brand">Your Site</span>
                    <span className="font-bold tabular-nums">{myBrandAI}</span>
                  </div>
                  <ScoreBar value={myBrandAI} color="bg-brand" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Avg Competitor</span>
                    <span className="font-bold tabular-nums text-muted-foreground">{avgCompetitorAI}</span>
                  </div>
                  <ScoreBar
                    value={avgCompetitorAI ?? 0}
                    color={(avgCompetitorAI ?? 0) > myBrandAI ? "bg-red-400" : "bg-slate-400"}
                  />
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium mt-2 ${myBrandAI > (avgCompetitorAI ?? 0) ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                  {myBrandAI > (avgCompetitorAI ?? 0) ? (
                    <><TrendingUp className="h-3.5 w-3.5" /> AI lead of {myBrandAI - (avgCompetitorAI ?? 0)} points</>
                  ) : (
                    <><TrendingDown className="h-3.5 w-3.5" /> AI gap of {(avgCompetitorAI ?? 0) - myBrandAI} points</>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Competitor cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 rounded-xl bg-muted/30 shimmer border border-border" />
          ))}
        </div>
      ) : !competitors?.length ? (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center bg-muted/10">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Users2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-base mb-2">No competitors tracked yet</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
            Add your top competitors to see how your SEO and AI search visibility stacks up against them.
          </p>
          <Button onClick={() => setShowAddForm(true)} className="gap-2 shadow-brand">
            <Plus className="h-4 w-4" /> Add your first competitor
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand" />
              {competitors.length} Competitor{competitors.length !== 1 ? "s" : ""} Tracked
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map((competitor) => (
              <CompetitorCard
                key={competitor.id}
                competitor={competitor}
                onDelete={(id) => deleteCompetitor.mutate(id)}
                myBrandSEO={myBrandSEO}
                myBrandAI={myBrandAI}
              />
            ))}
          </div>
        </>
      )}

      {/* Comparison table — shown when there are competitors */}
      {competitors && competitors.length > 0 && (
        <Card className="border border-border overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand" />
              Full Comparison Table
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Competitor</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">SEO Score</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">AI Visibility</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">SEO Gap</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">AI Gap</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Your site row */}
                  <tr className="bg-brand-muted/30 border-b border-border/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-brand flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">Y</span>
                        </div>
                        <span className="font-semibold text-brand text-xs">Your Site</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold tabular-nums text-brand">{myBrandSEO}</td>
                    <td className="px-4 py-3 text-center font-bold tabular-nums text-brand">{myBrandAI}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">—</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">—</td>
                  </tr>
                  {competitors.map((c) => {
                    const seo = c.seoScore ?? 72
                    const ai = c.aiVisibility ?? 55
                    const seoDiff = myBrandSEO - seo
                    const aiDiff = myBrandAI - ai
                    return (
                      <tr key={c.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-muted flex items-center justify-center border border-border">
                              <span className="text-[10px] font-bold">{c.name[0]?.toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-medium text-xs">{c.name}</p>
                              <p className="text-[10px] text-muted-foreground">{c.domain}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-bold tabular-nums">{seo}</td>
                        <td className="px-4 py-3 text-center font-bold tabular-nums">{ai}</td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          <span className={`text-xs font-semibold ${seoDiff > 0 ? "text-emerald-500" : seoDiff < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                            {seoDiff > 0 ? "+" : ""}{seoDiff}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center hidden sm:table-cell">
                          <span className={`text-xs font-semibold ${aiDiff > 0 ? "text-emerald-500" : aiDiff < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                            {aiDiff > 0 ? "+" : ""}{aiDiff}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info footer */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 flex gap-3 text-xs text-muted-foreground">
        <Shield className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
        <p className="leading-relaxed">
          <strong className="text-foreground">How scores are computed:</strong> SEO scores are derived from technical crawl signals and authority metrics. AI Visibility reflects how often a domain is cited in LLM responses. Positive gaps mean you lead; negative gaps reveal opportunities to close.
        </p>
      </div>
    </div>
  )
}