"use client"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Users2, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function CompetitorsPage() {
  const { projectId } = useParams<{ projectId: string }>()

  const { data: competitorSet } = useQuery({
    queryKey: ["competitors", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/competitors`)
      const d = await res.json()
      return d.data
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
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Competitor Comparison</h1>
            <Badge variant="brand" className="text-[10px]">Module 5</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Benchmark your SEO and AI search visibility against key competitors</p>
        </div>
      </div>

      <div className="border border-dashed border-border rounded-xl p-8 sm:p-12 text-center">
        <Users2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-semibold text-sm mb-1">No competitors added</p>
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 max-w-sm mx-auto">Add your top competitors to compare SEO scores and AI visibility side-by-side.</p>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add competitor</Button>
      </div>
    </div>
  )
}