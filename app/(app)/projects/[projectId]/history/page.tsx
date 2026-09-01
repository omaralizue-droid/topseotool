"use client"
import { useParams } from "next/navigation"
import { History, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function HistoryPage() {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-6 animate-fade-in">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8 shrink-0">
          <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Historical Visibility Tracking</h1>
            <Badge variant="brand" className="text-[10px]">Module 8</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Track SEO score and AI search visibility trends over time</p>
        </div>
      </div>

      <div className="border border-dashed border-border rounded-xl p-8 sm:p-12 text-center">
        <History className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-semibold text-sm mb-1">Historical data accumulation in progress</p>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">Snapshots are automatically captured as audits and scans are completed.</p>
      </div>
    </div>
  )
}