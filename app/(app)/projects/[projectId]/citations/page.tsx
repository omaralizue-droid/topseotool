"use client"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Link2, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function CitationsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: citations } = useQuery({
    queryKey: ["citations", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/citations`)
      const d = await res.json()
      return d.data as Array<{ id: string; sourceUrl: string; sourceTitle: string; citedInEngine: string; citedForQuery: string; citationStrength: number | null; detectedAt: string }>
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
            <h1 className="text-xl font-bold tracking-tight">AI Citation Tracking</h1>
            <Badge variant="brand">Module 4</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Discover which of your pages AI search engines cite as sources</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Cited sources</h2>
        {!citations?.length ? (
          <div className="border border-dashed border-border rounded-lg p-10 text-center">
            <Link2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium mb-1">No AI citations recorded yet</p>
            <p className="text-sm text-muted-foreground">Citations will automatically accumulate as you run AI Visibility scans.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {citations.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{c.sourceTitle}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.sourceUrl}</p>
                </div>
                <Badge variant="outline">{c.citedInEngine}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}