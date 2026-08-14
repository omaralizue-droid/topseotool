import type { Metadata } from "next"
import Link from "next/link"
import { Globe, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"

export const metadata: Metadata = { title: "SEO Audit | TOPSEOTOOL" }

export default function DashboardAuditPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight">SEO Website Audit</h1>
            <Badge variant="brand">Module 1</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Technical crawls, meta checks, content quality, and Core Web Vitals</p>
        </div>
        <Button size="sm" asChild>
          <Link href="/projects"><Globe className="h-4 w-4" />Select Project</Link>
        </Button>
      </div>

      <EmptyState
        icon={Globe}
        title="Select a project to run an SEO audit"
        description="SEO Website Audits are associated with projects. Choose a project to run or view technical audit results."
        action={{ label: "View projects", href: "/dashboard/projects" }}
      />
    </div>
  )
}