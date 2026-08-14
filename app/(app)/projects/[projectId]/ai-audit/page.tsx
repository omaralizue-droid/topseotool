"use client"
import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2, Play, Brain, ArrowLeft, CheckCircle2, XCircle, Search } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { triggerAIAuditSchema, type TriggerAIAuditInput } from "@/lib/validations"
import { formatRelativeTime } from "@/lib/utils"

const AI_ENGINES = [
  { id: "GEMINI", name: "Google Gemini", icon: "✨" },
  { id: "CHATGPT", name: "ChatGPT (OpenAI)", icon: "🤖" },
  { id: "PERPLEXITY", name: "Perplexity AI", icon: "🔍" },
  { id: "CLAUDE", name: "Claude (Anthropic)", icon: "🧠" },
  { id: "COPILOT", name: "Microsoft Copilot", icon: "🛡️" },
  { id: "GROK", name: "xAI Grok", icon: "⚡" },
]

export default function AIAuditPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  const [selectedEngines, setSelectedEngines] = useState<string[]>(["GEMINI", "CHATGPT", "PERPLEXITY"])

  const form = useForm<TriggerAIAuditInput>({
    resolver: zodResolver(triggerAIAuditSchema),
    defaultValues: { query: "", engines: ["GEMINI", "CHATGPT", "PERPLEXITY"] },
  })

  const { data: aiAudits, isLoading } = useQuery({
    queryKey: ["ai-audits", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/ai-audits`)
      const d = await res.json()
      return d.data as Array<{ id: string; query: string; engine: string; visibilityScore: number | null; mentioned: boolean | null; mentionContext: string | null; createdAt: string }>
    }
  })

  const triggerScan = useMutation({
    mutationFn: async (values: TriggerAIAuditInput) => {
      const res = await fetch(`/api/projects/${projectId}/ai-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, engines: selectedEngines }),
      })
      if (!res.ok) throw new Error("Scan failed")
      return res.json()
    },
    onSuccess: () => {
      toast.success("AI Search Visibility scan started!")
      queryClient.invalidateQueries({ queryKey: ["ai-audits", projectId] })
      form.reset({ query: "", engines: selectedEngines as ("CHATGPT" | "GEMINI" | "PERPLEXITY" | "CLAUDE" | "COPILOT" | "GROK")[] })
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const toggleEngine = (id: string) => {
    setSelectedEngines((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">AI Search Visibility Audit</h1>
            <Badge variant="brand">Module 2</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Test how your brand appears in AI assistant responses</p>
        </div>
      </div>

      {/* Trigger card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Run AI search query scan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => triggerScan.mutate(v))} className="space-y-4">
              <FormField control={form.control} name="query" render={({ field }) => (
                <FormItem>
                  <FormLabel>Search Query / Prompt to test</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="e.g., 'What are the best SEO audit tools for SaaS?'" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div>
                <FormLabel className="mb-2 block">Target AI engines</FormLabel>
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

              <Button type="submit" disabled={triggerScan.isPending || !selectedEngines.length}>
                {triggerScan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Scan selected engines
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results history */}
      <div>
        <h2 className="text-sm font-semibold mb-3">AI visibility scan history</h2>
        {!aiAudits?.length ? (
          <div className="border border-dashed border-border rounded-lg p-10 text-center">
            <Brain className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">No AI visibility scans yet</p>
            <p className="text-sm text-muted-foreground">Test a query above to analyze AI response positioning.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {aiAudits.map((item) => (
              <div key={item.id} className="p-4 bg-card border border-border rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{item.engine}</span>
                    <p className="text-sm font-medium mt-0.5">&ldquo;{item.query}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.mentioned ? (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Mentioned
                      </Badge>
                    ) : (
                      <Badge variant="error" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Not mentioned
                      </Badge>
                    )}
                    {item.visibilityScore !== null && (
                      <span className="text-lg font-bold font-mono-nums">{item.visibilityScore}%</span>
                    )}
                  </div>
                </div>
                {item.mentionContext && (
                  <p className="text-xs text-muted-foreground bg-muted p-2.5 rounded border border-border italic leading-relaxed">
                    &ldquo;{item.mentionContext}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}