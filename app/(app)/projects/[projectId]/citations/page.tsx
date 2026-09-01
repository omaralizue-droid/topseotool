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
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
          <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">AI Citation Tracking</h1>
            <Badge variant="brand" className="text-[10px]">Module 4</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Discover which of your pages AI search engines cite as sources</p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-3">Cited sources</h2>
        {!citations?.length ? (
          <div className="border border-dashed border-border rounded-xl p-8 sm:p-10 text-center">
            <Link2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-sm mb-1">No AI citations recorded yet</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Citations will automatically accumulate as you run AI Visibility scans.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {citations.map((c) => (
              <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 sm:p-4 bg-card border border-border rounded-xl">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{c.sourceTitle}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.sourceUrl}</p>
                </div>
                <Badge variant="outline" className="w-fit">{c.citedInEngine}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}