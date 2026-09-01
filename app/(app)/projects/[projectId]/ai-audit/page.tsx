"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import {
  Loader2, Play, Brain, ArrowLeft, CheckCircle2, XCircle, Search,
  Eye, LinkIcon, TrendingUp, BarChart3, MessageSquare, Zap, ChevronDown,
  RefreshCw, Star, AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { triggerAIAuditSchema, type TriggerAIAuditInput } from "@/lib/validations"
import { formatRelativeTime } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const AI_ENGINES = [
  { id: "GEMINI",     name: "Google Gemini",    icon: "✨", color: "#4285f4" },
  { id: "CHATGPT",    name: "ChatGPT",           icon: "🤖", color: "#10a37f" },
  { id: "PERPLEXITY", name: "Perplexity",        icon: "🔍", color: "#a855f7" },
  { id: "CLAUDE",     name: "Claude",            icon: "🧠", color: "#d97706" },
  { id: "COPILOT",    name: "Copilot",           icon: "🛡️", color: "#0078d4" },
  { id: "GROK",       name: "Grok",              icon: "⚡", color: "#ef4444" },
]

const SENTIMENT_STYLE: Record<string, { bg: string; text: string }> = {
  POSITIVE: { bg: "bg-green-500/10", text: "text-green-400" },
  NEGATIVE: { bg: "bg-red-500/10", text: "text-red-400" },
  NEUTRAL:  { bg: "bg-slate-500/10", text: "text-slate-400" },
  MIXED:    { bg: "bg-yellow-500/10", text: "text-yellow-400" },
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface PromptResult {
  id: string
  engine: string
  rawResponse: string | null
  brandMentioned: boolean
  mentionPosition: number | null
  visibilityScore: number | null
  sentiment: string
  citedUrls: string[]
  createdAt: string
}

interface AIScan {
  id: string
  query: string
  status: string
  overallScore: number | null
  enginesScanned: string[]
  createdAt: string
  completedAt: string | null
  results: PromptResult[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Score ring
// ─────────────────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444"
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={size * 0.1} className="text-border" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color}
        strokeWidth={size * 0.1} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize={size * 0.22} fontWeight="bold" fill={color}>
        {score}
      </text>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Scan result card — collapsible per-engine view
// ─────────────────────────────────────────────────────────────────────────────
function ScanCard({ scan }: { scan: AIScan }) {
  const [expanded, setExpanded] = useState(false)
  const [activeEngine, setActiveEngine] = useState<string | null>(null)

  const engineResults = AI_ENGINES.map((eng) => ({
    ...eng,
    result: scan.results.find((r) => r.engine === eng.id),
  }))

  const mentionedCount = scan.results.filter((r) => r.brandMentioned).length
  const totalResults = scan.results.length

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <div className="p-5 flex items-start gap-4">
        <div className="shrink-0 mt-0.5">
          {scan.overallScore !== null ? (
            <ScoreRing score={scan.overallScore} size={52} />
          ) : (
            <div className="w-13 h-13 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-1 truncate">&ldquo;{scan.query}&rdquo;</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={scan.status === "COMPLETED" ? "success" : scan.status === "FAILED" ? "error" : "outline"} className="text-xs">
              {scan.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {mentionedCount}/{totalResults} engine results mention brand
            </span>
            <span className="text-xs text-muted-foreground">{formatRelativeTime(new Date(scan.createdAt))}</span>
          </div>

          {/* Engine chips */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {engineResults.map(({ id, icon, color, result }) => {
              const mentioned = result?.brandMentioned
              return (
                <button
                  key={id}
                  onClick={() => {
                    setActiveEngine(activeEngine === id ? null : id)
                    setExpanded(true)
                  }}
                  title={AI_ENGINES.find((e) => e.id === id)?.name}
                  className={`text-sm px-2 py-1 rounded-lg border transition-all ${activeEngine === id ? "ring-1 ring-offset-0" : ""}`}
                  style={{
                    borderColor: color + "40",
                    background: mentioned ? color + "15" : "transparent",
                    ringColor: color,
                  }}
                >
                  <span className={`${!mentioned ? "opacity-30" : ""}`}>{icon}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Expandable: per-engine results */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {/* Engine tabs */}
              <div className="flex gap-0 overflow-x-auto border-b border-border">
                {engineResults.map(({ id, name, icon, color, result }) => (
                  <button
                    key={id}
                    onClick={() => setActiveEngine(activeEngine === id ? null : id)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium shrink-0 border-b-2 transition-colors ${
                      activeEngine === id ? "border-b-2" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    style={activeEngine === id ? { borderBottomColor: color, color } : {}}
                  >
                    <span>{icon}</span> {name}
                    {result?.brandMentioned ? (
                      <CheckCircle2 className="h-3 w-3 text-green-400" />
                    ) : result ? (
                      <XCircle className="h-3 w-3 text-red-400/50" />
                    ) : null}
                  </button>
                ))}
              </div>

              {/* Active engine result */}
              {activeEngine && (() => {
                const eng = engineResults.find((e) => e.id === activeEngine)
                const res = eng?.result
                if (!res) return (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No result recorded for {eng?.name}
                  </div>
                )

                return (
                  <div className="p-5 space-y-4">
                    {/* Status row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {res.brandMentioned ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Brand Mentioned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-red-400 bg-red-500/10 px-3 py-1 rounded-full">
                          <XCircle className="h-3 w-3" /> Not Mentioned
                        </span>
                      )}
                      {res.mentionPosition && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          Position: {res.mentionPosition === 1 ? "Early (Top)" : res.mentionPosition === 2 ? "Middle" : "Late"}
                        </span>
                      )}
                      {res.sentiment && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${SENTIMENT_STYLE[res.sentiment]?.bg} ${SENTIMENT_STYLE[res.sentiment]?.text}`}>
                          {res.sentiment}
                        </span>
                      )}
                      {res.visibilityScore !== null && (
                        <span className="text-xs font-bold text-muted-foreground ml-auto">
                          Score: <span className="text-foreground">{res.visibilityScore}%</span>
                        </span>
                      )}
                    </div>

                    {/* AI Response text */}
                    {res.rawResponse && (
                      <div className="rounded-xl bg-muted/40 border border-border p-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Eye className="h-3 w-3" /> {eng?.name} Response
                        </p>
                        <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                          {res.rawResponse}
                        </p>
                      </div>
                    )}

                    {/* Cited URLs */}
                    {res.citedUrls && res.citedUrls.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                          <LinkIcon className="h-3 w-3" /> Cited URLs ({res.citedUrls.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {res.citedUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-3 py-1.5 rounded-lg bg-muted border border-border hover:border-brand/40 text-muted-foreground hover:text-foreground transition-colors truncate max-w-[250px]"
                            >
                              {url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}

              {!activeEngine && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Click an engine above to view its full AI response
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AIAuditPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  const [selectedEngines, setSelectedEngines] = useState<string[]>(["GEMINI", "CHATGPT", "PERPLEXITY", "CLAUDE", "COPILOT", "GROK"])

  const form = useForm<TriggerAIAuditInput>({
    resolver: zodResolver(triggerAIAuditSchema),
    defaultValues: { query: "", engines: ["GEMINI", "CHATGPT", "PERPLEXITY", "CLAUDE", "COPILOT", "GROK"] },
  })

  const { data: aiScans, isLoading, refetch } = useQuery({
    queryKey: ["ai-audits", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/ai-audits`)
      const d = await res.json()
      return d.data as AIScan[]
    },
    refetchInterval: (query) => {
      // Auto-refresh if any scan is still running
      const data = query.state.data
      if (data?.some((s: AIScan) => s.status === "RUNNING" || s.status === "PENDING")) return 3000
      return false
    },
  })

  const triggerScan = useMutation({
    mutationFn: async (values: TriggerAIAuditInput) => {
      const res = await fetch(`/api/projects/${projectId}/ai-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, engines: selectedEngines }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Scan failed")
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success("AI scan started! Results will appear below.")
      queryClient.invalidateQueries({ queryKey: ["ai-audits", projectId] })
      form.reset({ query: "", engines: selectedEngines as any })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const toggleEngine = (id: string) => {
    setSelectedEngines((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id])
  }

  // Aggregate stats from all scans
  const allResults = aiScans?.flatMap((s) => s.results) ?? []
  const totalMentions = allResults.filter((r) => r.brandMentioned).length
  const avgScore = aiScans?.length
    ? Math.round(aiScans.filter((s) => s.overallScore).reduce((a, s) => a + (s.overallScore ?? 0), 0) / aiScans.filter((s) => s.overallScore).length)
    : null
  const citationsCount = allResults.reduce((a, r) => a + (r.citedUrls?.length ?? 0), 0)

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
            <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">AI Search Visibility Audit</h1>
              <Badge variant="brand" className="text-[10px]">6 Engines</Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">Test how your brand appears across ChatGPT, Gemini, Perplexity, Claude, Copilot &amp; Grok</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-fit gap-2 ml-auto sm:ml-0" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats overview */}
      {aiScans && aiScans.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            { label: "Total Scans", value: aiScans.length, icon: <BarChart3 className="h-4 w-4" />, color: "text-blue-400" },
            { label: "Brand Mentions", value: totalMentions, icon: <MessageSquare className="h-4 w-4" />, color: "text-green-400" },
            { label: "Avg Score", value: avgScore !== null ? `${avgScore}%` : "—", icon: <Star className="h-4 w-4" />, color: "text-yellow-400" },
            { label: "Citations Found", value: citationsCount, icon: <LinkIcon className="h-4 w-4" />, color: "text-violet-400" },
          ].map((stat) => (
            <Card key={stat.label} className="p-4">
              <div className={`flex items-center gap-2 mb-2 ${stat.color}`}>
                {stat.icon}
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Trigger card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4 text-brand" />
            Run new AI visibility scan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => triggerScan.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="query" render={({ field }) => (
                <FormItem>
                  <FormLabel>Search Query to Test</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., 'What are the best SEO audit tools for SaaS?'"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div>
                <FormLabel className="mb-2 block">Target AI Engines</FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AI_ENGINES.map((engine) => {
                    const checked = selectedEngines.includes(engine.id)
                    return (
                      <button
                        key={engine.id}
                        type="button"
                        onClick={() => toggleEngine(engine.id)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-sm text-left transition-all ${
                          checked
                            ? "border-brand bg-brand-muted text-brand font-medium"
                            : "border-border bg-background text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-base">{engine.icon}</span>
                        <span className="truncate">{engine.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button type="submit" disabled={triggerScan.isPending || !selectedEngines.length} className="gap-2">
                {triggerScan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Scan {selectedEngines.length} engine{selectedEngines.length !== 1 ? "s" : ""}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          Scan Results
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse border border-border" />
            ))}
          </div>
        ) : !aiScans?.length ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center">
            <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium mb-1">No AI visibility scans yet</p>
            <p className="text-sm text-muted-foreground">Enter a query above to test your brand&apos;s presence in AI search responses.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {aiScans.map((scan) => (
              <ScanCard key={scan.id} scan={scan} />
            ))}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="rounded-xl border border-border bg-muted/20 p-4 flex gap-3">
        <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">How scoring works:</strong> AI Visibility Score = 40% Mention Rate + 30% Top Placement Rate + 20% Citation Rate + 10% Sentiment Score. Results are powered by Gemini AI simulating each engine&apos;s response style. With a real Gemini API key, responses reflect live model outputs.
        </p>
      </div>
    </div>
  )
}