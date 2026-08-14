import type { Metadata } from "next"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Reports | TOPSEOTOOL" }

export default async function GlobalReportsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Reports</h1>
          <p className="text-sm text-muted-foreground">Manage and schedule automated client reports across all projects</p>
        </div>
        <Button size="sm"><Plus className="h-4 w-4" />New report</Button>
      </div>

      <div className="border border-dashed border-border rounded-lg p-16 text-center">
        <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-semibold mb-2">No reports created</h2>
        <p className="text-sm text-muted-foreground mb-4">Select a project and generate white-label PDF reports or set up automated email delivery.</p>
        <Button size="sm"><Plus className="h-4 w-4" />Create report</Button>
      </div>
    </div>
  )
}