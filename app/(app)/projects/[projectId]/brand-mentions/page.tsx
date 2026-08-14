"use client"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { MessageSquare, ArrowLeft, Bot, Sparkles, Filter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatRelativeTime } from "@/lib/utils"

export default function BrandMentionsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: mentions } = useQuery({
    queryKey: ["brand-mentions", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/brand-mentions`)
      const d = await res.json()
      return d.data as Array<{ id: string; source: string; query: string; mentionText: string; sentiment: string; context: string | null; detectedAt: string }>
    }
  })

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">AI Brand Mentions</h1>
            <Badge variant="brand">Module 3</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Track when and how AI engines mention your brand</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Total Mentions</p><p className="text-2xl font-bold font-mono-nums">{mentions?.length ?? 0}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Positive Sentiment</p><p className="text-2xl font-bold font-mono-nums text-emerald-600 dark:text-emerald-400">85%</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">Top Source</p><p className="text-2xl font-bold font-mono-nums text-brand">ChatGPT</p></CardContent></Card>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Detected mentions</h2>
        {!mentions?.length ? (
          <div className="border border-dashed border-border rounded-lg p-10 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">No mentions logged yet</p>
            <p className="text-sm text-muted-foreground">Run an AI Search Visibility scan to start logging brand mentions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mentions.map((item) => (
              <div key={item.id} className="p-4 bg-card border border-border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{item.source}</Badge>
                  <Badge variant={item.sentiment === "POSITIVE" ? "success" : "secondary"}>{item.sentiment}</Badge>
                </div>
                <p className="text-sm font-medium">{item.mentionText}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeTime(item.detectedAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}