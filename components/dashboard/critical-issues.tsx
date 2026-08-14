import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import Link from "next/link"

interface IssueItem {
  id: string
  category: string
  severity: string
  title: string
  description: string
  recommendation?: string | null
}

interface CriticalIssuesProps {
  issues?: IssueItem[]
  projectId?: string
}

export function CriticalIssues({ issues = [], projectId }: CriticalIssuesProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Critical Technical & Content Issues
          </CardTitle>

          {projectId && (
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" asChild>
              <Link href={`/projects/${projectId}/seo-audit`}>
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {issues.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No critical issues found!"
            description="Your website has passed all critical technical and content SEO checks."
            className="p-6"
          />
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <div key={issue.id} className="p-3.5 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant="error" className="text-[10px]">{issue.severity}</Badge>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">{issue.category}</Badge>
                </div>
                <p className="text-xs font-semibold text-foreground">{issue.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{issue.description}</p>
                {issue.recommendation && (
                  <p className="text-[11px] font-medium text-brand bg-brand-muted/50 p-2 rounded mt-1">
                    <span className="font-bold">Fix:</span> {issue.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}