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
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Competitor Comparison</h1>
            <Badge variant="brand">Module 5</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Benchmark your SEO and AI search visibility against key competitors</p>
        </div>
      </div>

      <div className="border border-dashed border-border rounded-lg p-10 text-center">
        <Users2 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium mb-1">No competitors added</p>
        <p className="text-sm text-muted-foreground mb-4">Add your top competitors to compare SEO scores and AI visibility side-by-side.</p>
        <Button size="sm"><Plus className="h-4 w-4" />Add competitor</Button>
      </div>
    </div>
  )
}