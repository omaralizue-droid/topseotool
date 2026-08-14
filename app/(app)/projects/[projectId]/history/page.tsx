"use client"
import { useParams } from "next/navigation"
import { History, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function HistoryPage() {
  const { projectId } = useParams<{ projectId: string }>()

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
          <Link href={`/projects/${projectId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Historical Visibility Tracking</h1>
            <Badge variant="brand">Module 8</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Track SEO score and AI search visibility trends over time</p>
        </div>
      </div>

      <div className="border border-dashed border-border rounded-lg p-10 text-center">
        <History className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="font-medium mb-1">Historical data accumulation in progress</p>
        <p className="text-sm text-muted-foreground">Snapshots are automatically captured as audits and scans are completed.</p>
      </div>
    </div>
  )
}